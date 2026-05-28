<?php
require_once 'config.php';

$conn = getDBConnection();

// Get all users
$result = $conn->query("SELECT id, email, full_name, role FROM users LIMIT 10");

echo "<h2>Test Forgot Password</h2>";
echo "<h3>Existing Users (for testing):</h3>";
echo "<ul>";
while ($row = $result->fetch_assoc()) {
    echo "<li>{$row['email']} ({$row['full_name']}) - {$row['role']}</li>";
}
echo "</ul>";

// Test sending OTP
if ($_POST && isset($_POST['test_email'])) {
    $email = trim(strtolower($_POST['test_email']));

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "<h3 style='color:red;'>Please enter a valid email address.</h3>";
    } else {
    echo "<h3>Testing OTP for: $email</h3>";
        $payload = json_encode(['email' => $email, 'action' => 'send-otp']);
        $options = array(
            'http' => array(
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => $payload
            )
        );
        $context  = stream_context_create($options);
        $response = file_get_contents('http://localhost:8000/Backend/forgot-password.php', false, $context);
        $result = json_decode($response, true);

        echo "<pre>";
        print_r($result);
        echo "</pre>";

        // Check OTP log
        if (file_exists('otp_log.txt')) {
            echo "<h3>OTP Log (last 5 entries):</h3>";
            $lines = file('otp_log.txt');
            $recent = array_slice($lines, -5);
            echo "<pre>" . implode('', $recent) . "</pre>";
        }
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Test Forgot Password</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        form { background: #f0f0f0; padding: 10px; margin: 10px 0; }
        input { padding: 5px; margin: 5px; }
        button { padding: 8px 15px; background: #2ECC71; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>

<form method="POST">
    <h3>Send OTP to Test Email:</h3>
    <input type="email" name="test_email" placeholder="test@example.com" required />
    <button type="submit">Send OTP</button>
</form>

</body>
</html>
