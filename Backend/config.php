<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'Ghar sewa');

function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
    }

    return $conn;
}

// Enable CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function loadDotEnv($filePath) {
    if (!is_readable($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || $trimmed[0] === '#') {
            continue;
        }

        if (strpos($trimmed, '=') === false) {
            continue;
        }

        [$key, $value] = array_map('trim', explode('=', $trimmed, 2));
        if ($key === '') {
            continue;
        }

        $value = trim($value, "\"'");
        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

loadDotEnv(__DIR__ . '/.env');

function env_value($key, $default = '') {
    $value = getenv($key);
    return $value === false || $value === '' ? $default : $value;
}

define('SMTP_HOST', env_value('GHARSEWA_SMTP_HOST', 'smtp.gmail.com'));
define('SMTP_PORT', (int) env_value('GHARSEWA_SMTP_PORT', '587'));
define('SMTP_USER', env_value('GHARSEWA_SMTP_USER', ''));
define('SMTP_PASS', env_value('GHARSEWA_SMTP_PASS', ''));
define('MAIL_FROM_EMAIL', env_value('GHARSEWA_MAIL_FROM', SMTP_USER));
define('MAIL_FROM_NAME', env_value('GHARSEWA_MAIL_FROM_NAME', 'Ghar Sewa'));
define('BREVO_API_KEY', env_value('GHARSEWA_BREVO_API_KEY', ''));

$hasPlaceholderSMTP = empty(SMTP_USER) || empty(SMTP_PASS) ||
    stripos(SMTP_USER, 'your-email') !== false ||
    stripos(SMTP_PASS, 'your-gmail-app-password') !== false ||
    stripos(SMTP_USER, 'YOUR_EMAIL') !== false ||
    stripos(SMTP_PASS, 'YOUR_16_DIGIT_APP_PASSWORD') !== false;
define('DEV_MODE', $hasPlaceholderSMTP);

$GLOBALS['LAST_EMAIL_DELIVERY_ERROR'] = '';

function setEmailDeliveryError($message) {
    $GLOBALS['LAST_EMAIL_DELIVERY_ERROR'] = $message;
}

function getEmailDeliveryError() {
    return $GLOBALS['LAST_EMAIL_DELIVERY_ERROR'] ?? '';
}

function sendEmailWithBrevo($to, $toName, $subject, $htmlBody) {
    if (empty(BREVO_API_KEY) || !function_exists('curl_init')) {
        return false;
    }

    $payload = json_encode([
        'sender' => [
            'name' => MAIL_FROM_NAME,
            'email' => MAIL_FROM_EMAIL ?: SMTP_USER
        ],
        'to' => [[
            'email' => $to,
            'name' => $toName
        ]],
        'subject' => $subject,
        'htmlContent' => $htmlBody,
        'textContent' => strip_tags($htmlBody)
    ]);

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'accept: application/json',
            'api-key: ' . BREVO_API_KEY,
            'content-type: application/json'
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 20
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status >= 200 && $status < 300) {
        file_put_contents(__DIR__ . '/email_log.txt', date('Y-m-d H:i:s') . " | Brevo | SUCCESS | To: $to | Subject: $subject\n", FILE_APPEND);
        return true;
    }

    setEmailDeliveryError("Brevo failed with HTTP $status" . ($error ? ": $error" : '') . ($response ? " | $response" : ''));
    file_put_contents(__DIR__ . '/email_log.txt', date('Y-m-d H:i:s') . " | Brevo | FAILED | To: $to | Error: " . getEmailDeliveryError() . "\n", FILE_APPEND);
    return false;
}

function smtpRead($socket) {
    $response = '';
    while (!feof($socket)) {
        $line = fgets($socket, 515);
        if ($line === false) {
            break;
        }
        $response .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    return $response;
}

function smtpCommand($socket, $command, $expectedCodes) {
    fwrite($socket, $command . "\r\n");
    $response = smtpRead($socket);
    $code = (int) substr($response, 0, 3);
    if (!in_array($code, $expectedCodes, true)) {
        throw new Exception(trim($response) ?: "SMTP command failed: $command");
    }
    return $response;
}

function smtpEncodeAddress($email, $name = '') {
    $cleanEmail = str_replace(["\r", "\n"], '', $email);
    $cleanName = trim(str_replace(["\r", "\n", '"'], '', $name));
    return $cleanName === '' ? $cleanEmail : '"' . $cleanName . '" <' . $cleanEmail . '>';
}

function smtpBuildMessage($to, $toName, $subject, $htmlBody) {
    $boundary = 'gharsewa_' . bin2hex(random_bytes(12));
    $from = smtpEncodeAddress(MAIL_FROM_EMAIL ?: SMTP_USER, MAIL_FROM_NAME);
    $toHeader = smtpEncodeAddress($to, $toName);
    $plainBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $htmlBody));

    $encodedSubject = function_exists('mb_encode_mimeheader')
        ? mb_encode_mimeheader($subject, 'UTF-8')
        : '=?UTF-8?B?' . base64_encode($subject) . '?=';

    $headers = [
        'From: ' . $from,
        'To: ' . $toHeader,
        'Subject: ' . $encodedSubject,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"'
    ];

    $body = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $plainBody . "\r\n\r\n";
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $htmlBody . "\r\n\r\n";
    $body .= "--$boundary--\r\n";

    return implode("\r\n", $headers) . "\r\n\r\n" . $body;
}

function sendEmailWithCoreSmtp($to, $toName, $subject, $htmlBody) {
    if (DEV_MODE) {
        return false;
    }

    $remote = (SMTP_PORT === 465 ? 'ssl://' : 'tcp://') . SMTP_HOST . ':' . SMTP_PORT;
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        setEmailDeliveryError("SMTP connection failed: $errstr ($errno)");
        return false;
    }

    stream_set_timeout($socket, 20);

    try {
        $greeting = smtpRead($socket);
        if ((int) substr($greeting, 0, 3) !== 220) {
            throw new Exception(trim($greeting) ?: 'SMTP greeting failed');
        }

        smtpCommand($socket, 'EHLO localhost', [250]);

        if (SMTP_PORT !== 465) {
            smtpCommand($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception('SMTP STARTTLS failed');
            }
            smtpCommand($socket, 'EHLO localhost', [250]);
        }

        smtpCommand($socket, 'AUTH LOGIN', [334]);
        smtpCommand($socket, base64_encode(SMTP_USER), [334]);
        smtpCommand($socket, base64_encode(SMTP_PASS), [235]);
        smtpCommand($socket, 'MAIL FROM:<' . (MAIL_FROM_EMAIL ?: SMTP_USER) . '>', [250]);
        smtpCommand($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtpCommand($socket, 'DATA', [354]);

        $message = preg_replace('/^\./m', '..', smtpBuildMessage($to, $toName, $subject, $htmlBody));
        fwrite($socket, $message . "\r\n.\r\n");
        $dataResponse = smtpRead($socket);
        if ((int) substr($dataResponse, 0, 3) !== 250) {
            throw new Exception(trim($dataResponse) ?: 'SMTP DATA failed');
        }

        smtpCommand($socket, 'QUIT', [221, 250]);
        fclose($socket);
        file_put_contents(__DIR__ . '/email_log.txt', date('Y-m-d H:i:s') . " | Core SMTP | SUCCESS | To: $to | Subject: $subject\n", FILE_APPEND);
        return true;
    } catch (Exception $e) {
        @fwrite($socket, "QUIT\r\n");
        fclose($socket);
        setEmailDeliveryError($e->getMessage());
        file_put_contents(__DIR__ . '/email_log.txt', date('Y-m-d H:i:s') . " | Core SMTP | FAILED | To: $to | Error: " . getEmailDeliveryError() . "\n", FILE_APPEND);
        return false;
    }
}

function sendEmail($to, $toName, $subject, $htmlBody) {
    setEmailDeliveryError('');

    if (sendEmailWithBrevo($to, $toName, $subject, $htmlBody)) {
        return true;
    }

    if (DEV_MODE) {
        $logEntry = date('Y-m-d H:i:s') . " | DEV MODE | To: $to ($toName) | Subject: $subject\n";
        $logEntry .= "Body: " . strip_tags($htmlBody) . "\n";
        $logEntry .= str_repeat('-', 60) . "\n";
        file_put_contents(__DIR__ . '/otp_log.txt', $logEntry, FILE_APPEND);
        setEmailDeliveryError('SMTP credentials are not configured.');
        return false;
    }

    if (sendEmailWithCoreSmtp($to, $toName, $subject, $htmlBody)) {
        return true;
    }

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . MAIL_FROM_NAME . ' <' . (MAIL_FROM_EMAIL ?: SMTP_USER) . '>'
    ];

    if (@mail($to, $subject, $htmlBody, implode("\r\n", $headers))) {
        file_put_contents(__DIR__ . '/email_log.txt', date('Y-m-d H:i:s') . " | PHP mail | SUCCESS | To: $to | Subject: $subject\n", FILE_APPEND);
        return true;
    }

    setEmailDeliveryError(getEmailDeliveryError() ?: 'PHP mail fallback failed.');
    file_put_contents(__DIR__ . '/email_log.txt', date('Y-m-d H:i:s') . " | PHP mail | FAILED | To: $to | Error: " . getEmailDeliveryError() . "\n", FILE_APPEND);
    return false;
}
?>
