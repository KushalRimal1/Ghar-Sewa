<?php
require_once 'config.php';

header('Content-Type: application/json');

$to = isset($_GET['to']) ? trim($_GET['to']) : '';
if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide a valid email with ?to=you@example.com']);
    exit();
}

$name = isset($_GET['name']) ? trim($_GET['name']) : $to;
$subject = 'Ghar Sewa - Test Email';
$html = "<p>This is a test email sent from the Ghar Sewa project on your local machine.</p>\n<p>If you received this, email configuration is working.</p>";

$ok = sendEmail($to, $name, $subject, $html);

if ($ok) {
    echo json_encode(['success' => true, 'message' => 'Email sent (or queued). Check inbox/spam.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Email failed to send', 'error' => getEmailDeliveryError()]);
}

?>
