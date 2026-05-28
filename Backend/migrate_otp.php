<?php
// Migration script to add OTP columns to users table
require_once 'config.php';

$conn = getDBConnection();

if (!$conn) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// Check if columns already exist
$result = $conn->query("SHOW COLUMNS FROM users LIKE 'otp'");
if ($result && $result->num_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'OTP columns already exist']);
    exit();
}

// Add OTP columns
$sqls = [
    "ALTER TABLE users ADD COLUMN otp VARCHAR(6) NULL DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL DEFAULT NULL"
];

$allSuccess = true;
foreach ($sqls as $sql) {
    if (!$conn->query($sql)) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $conn->error]);
        $allSuccess = false;
        break;
    }
}

if ($allSuccess) {
    echo json_encode(['success' => true, 'message' => 'Migration completed successfully']);
}

$conn->close();
?>
