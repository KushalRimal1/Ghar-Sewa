<?php
require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['email']) || !isset($input['password']) || trim($input['email']) === '' || $input['password'] === '') {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

$email = trim($input['email']);
$password = $input['password'];
$requestedRole = isset($input['role']) ? trim($input['role']) : null;

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

if ($requestedRole !== null && !in_array($requestedRole, ['customer', 'provider', 'admin'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid role selection']);
    exit();
}

// Get database connection
$conn = getDBConnection();

// Get user by email
$stmt = $conn->prepare("SELECT id, full_name, email, phone, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    $stmt->close();
    $conn->close();
    exit();
}

$user = $result->fetch_assoc();
$stmt->close();

// Verify password
if (!password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    $conn->close();
    exit();
}

if ($requestedRole !== null && $requestedRole !== $user['role']) {
    echo json_encode(['success' => false, 'message' => 'Please sign in using the selected role']);
    $conn->close();
    exit();
}

// If provider, get additional info
$providerInfo = null;
if ($user['role'] === 'provider') {
    $providerStmt = $conn->prepare("SELECT category, experience_years, hourly_rate, rating, total_reviews FROM service_providers WHERE user_id = ?");
    $providerStmt->bind_param("i", $user['id']);
    $providerStmt->execute();
    $providerResult = $providerStmt->get_result();
    if ($providerResult->num_rows > 0) {
        $providerInfo = $providerResult->fetch_assoc();
    }
    $providerStmt->close();
}

// Return success with user data (excluding password)
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user['id'],
        'fullName' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role' => $user['role'],
        'providerInfo' => $providerInfo
    ]
]);

$conn->close();
?>
