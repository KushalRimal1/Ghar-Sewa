<?php
require_once 'config.php';

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit();
}

function isStrongResetPassword($password) {
    return is_string($password)
        && preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/', $password);
}

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? trim($input['action']) : (isset($_REQUEST['action']) ? trim($_REQUEST['action']) : '');

$conn = getDBConnection();

// ─── SEND OTP ───────────────────────────────────────────────────────────────
if ($action === 'send-otp') {
    $email = isset($input['email']) ? trim(strtolower($input['email'])) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['success' => false, 'message' => 'Please enter a valid email address'], 400);
    }

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, full_name FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        respond(['success' => false, 'message' => 'No account found with this email address']);
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Generate 6-digit OTP
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    // Invalidate old OTPs for this email
    $delStmt = $conn->prepare("UPDATE password_resets SET used = TRUE WHERE email = ? AND used = FALSE");
    $delStmt->bind_param("s", $email);
    $delStmt->execute();
    $delStmt->close();

    // Store new OTP using database time to prevent timezone mismatches
    $insertStmt = $conn->prepare("INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))");
    $insertStmt->bind_param("ss", $email, $otp);
    $insertStmt->execute();
    $insertStmt->close();

    // Log OTP only for server-side debugging. It is never returned to the browser.
    if (DEV_MODE) {
        $expiresAtLog = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        $devLog = date('Y-m-d H:i:s') . " | OTP for $email: $otp (expires: $expiresAtLog)\n";
        file_put_contents(__DIR__ . '/otp_log.txt', $devLog, FILE_APPEND);
    }

    // Send email using the core PHP mail helpers in config.php.
    $subject = 'Ghar Sewa - Password Reset OTP';
    $htmlBody = "
    <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;'>
        <h2 style='color: #2ECC71; margin-bottom: 16px;'>🏠 Ghar Sewa</h2>
        <p>Hello <strong>{$user['full_name']}</strong>,</p>
        <p>You requested a password reset. Use this OTP to reset your password:</p>
        <div style='background: #f0f7ff; border: 2px solid #2ECC71; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;'>
            <span style='font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1A202C;'>$otp</span>
        </div>
        <p style='color: #666; font-size: 14px;'>This OTP expires in <strong>15 minutes</strong>.</p>
        <p style='color: #999; font-size: 12px;'>If you did not request this, please ignore this email.</p>
    </div>";

    $emailSent = sendEmail($email, $user['full_name'], $subject, $htmlBody);

    $conn->close();

    if (!$emailSent && DEV_MODE) {
        respond([
            'success' => false,
            'devMode' => true,
            'message' => 'Gmail OTP email is not configured yet. Open Backend/.env and replace your-email@gmail.com and your-gmail-app-password with your real Gmail address and a Gmail App Password. No download is needed.'
        ]);
    }

    if (!$emailSent) {
        respond([
            'success' => false,
            'message' => 'OTP was created, but email delivery failed: ' . (getEmailDeliveryError() ?: 'Check Backend/email_log.txt or Gmail app password settings.')
        ]);
    }

    respond(['success' => true, 'message' => 'OTP sent to your Gmail. Check inbox and spam folder.']);
}

// ─── VERIFY OTP & RESET PASSWORD ────────────────────────────────────────────
if ($action === 'verify-otp') {
    $email = isset($input['email']) ? trim(strtolower($input['email'])) : '';
    $otp = isset($input['otp']) ? trim($input['otp']) : '';
    $newPassword = isset($input['password']) ? $input['password'] : '';

    if (empty($email) || empty($otp) || empty($newPassword)) {
        respond(['success' => false, 'message' => 'Email, OTP, and new password are required'], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['success' => false, 'message' => 'Please enter a valid email address'], 400);
    }

    if (strlen($otp) !== 6) {
        respond(['success' => false, 'message' => 'OTP must be 6 digits'], 400);
    }

    if (!isStrongResetPassword($newPassword)) {
        respond(['success' => false, 'message' => 'Password must be 8+ characters with uppercase, lowercase, and number'], 400);
    }

    // Verify OTP
    $stmt = $conn->prepare(
        "SELECT id FROM password_resets WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1"
    );
    $stmt->bind_param("ss", $email, $otp);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        respond(['success' => false, 'message' => 'Invalid or expired OTP. Please request a new one.']);
    }

    $resetId = $result->fetch_assoc()['id'];
    $stmt->close();

    // Mark OTP as used
    $markStmt = $conn->prepare("UPDATE password_resets SET used = TRUE WHERE id = ?");
    $markStmt->bind_param("i", $resetId);
    $markStmt->execute();
    $markStmt->close();

    // Update password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $updateStmt->bind_param("ss", $hashedPassword, $email);
    $updateStmt->execute();
    $updateStmt->close();

    $conn->close();
    respond(['success' => true, 'message' => 'Password reset successfully! You can now login with your new password.']);
}

$conn->close();
respond(['success' => false, 'message' => 'Invalid action. Use send-otp or verify-otp.'], 400);
?>
