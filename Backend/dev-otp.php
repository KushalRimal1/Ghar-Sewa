<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!defined('DEV_MODE') || !DEV_MODE) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Not allowed']);
    exit();
}

$path = __DIR__ . '/otp_log.txt';
if (!is_readable($path)) {
    echo json_encode(['success' => false, 'message' => 'OTP log not found']);
    exit();
}

$lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$last = $lines ? array_pop($lines) : '';
$otp = null;
if ($last) {
    if (preg_match('/(\d{6})/', $last, $m)) {
        $otp = $m[1];
    }
}

echo json_encode(['success' => true, 'lastLine' => $last, 'otp' => $otp]);

?>
