<?php
require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['fullName']) || !isset($input['email']) || !isset($input['password']) ||
    trim($input['fullName']) === '' || trim($input['email']) === '' || $input['password'] === '') {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

$fullName = trim($input['fullName']);
$email = trim($input['email']);
$phone = isset($input['phone']) ? trim($input['phone']) : null;
$password = $input['password'];
$rawRole = isset($input['role']) ? trim($input['role']) : '';
$category = isset($input['category']) ? trim($input['category']) : null;
$rolePattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/';
$adminPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,64}$/';
$phonePattern = '/^(?:\+977[-\s]?)?9\d{9}$/';

function normalizeRoleValue($roleValue) {
    $roleValue = strtolower(trim($roleValue));

    if ($roleValue === 'service provider' || $roleValue === 'service-provider' || $roleValue === 'provider') {
        return 'provider';
    }

    if ($roleValue === 'customer') {
        return 'customer';
    }

    if ($roleValue === 'admin') {
        return 'admin';
    }

    return '';
}

function inferRoleFromPayload($email, $category) {
    if (preg_match('/@gharsewa\.com$/i', $email)) {
        return 'admin';
    }

    if (!empty($category)) {
        return 'provider';
    }

    return 'customer';
}

$role = normalizeRoleValue($rawRole);
if ($role === '') {
    $role = inferRoleFromPayload($email, $category);
}

if (!in_array($role, ['customer', 'provider', 'admin'])) {
    $role = 'customer';
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

if ($role !== 'admin' && preg_match('/@gharsewa\.com$/i', $email)) {
    echo json_encode(['success' => false, 'message' => 'Official @gharsewa.com emails are reserved for Admin accounts only']);
    exit();
}

// Validate phone format globally if provided
if (!empty($phone) && !preg_match($phonePattern, $phone)) {
    echo json_encode(['success' => false, 'message' => 'Phone must be a valid Nepal number (e.g. +977 98XXXXXXXX)']);
    exit();
}

if ($role === 'customer') {
    if (empty($phone)) {
        echo json_encode(['success' => false, 'message' => 'Customer phone is required']);
        exit();
    }
    if (!preg_match($rolePattern, $password)) {
        echo json_encode(['success' => false, 'message' => 'Customer password must be 8+ characters with uppercase, lowercase, and number']);
        exit();
    }
} elseif ($role === 'provider') {
    if (empty($phone)) {
        echo json_encode(['success' => false, 'message' => 'Provider phone is required']);
        exit();
    }
    if (!preg_match($rolePattern, $password)) {
        echo json_encode(['success' => false, 'message' => 'Provider password must be 8+ characters with uppercase, lowercase, and number']);
        exit();
    }
    if (empty($category)) {
        echo json_encode(['success' => false, 'message' => 'Provider category is required']);
        exit();
    }
} elseif ($role === 'admin') {
    if (!preg_match('/@gharsewa\.com$/i', $email)) {
        echo json_encode(['success' => false, 'message' => 'Admin signup requires a @gharsewa.com email']);
        exit();
    }
    if (!preg_match($adminPattern, $password)) {
        echo json_encode(['success' => false, 'message' => 'Admin password must be 10+ characters with uppercase, lowercase, number, and symbol']);
        exit();
    }
}

if ($role === 'provider' && empty($category)) {
    echo json_encode(['success' => false, 'message' => 'Provider category is required']);
    exit();
}

// Get database connection
$conn = getDBConnection();

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $fullName, $email, $phone, $hashedPassword, $role);

if ($stmt->execute()) {
    $userId = $conn->insert_id;
    
    // If provider, create service provider entry
    if ($role === 'provider') {
        $providerStmt = $conn->prepare("INSERT INTO service_providers (user_id, category) VALUES (?, ?)");
        $providerStmt->bind_param("is", $userId, $category);
        $providerStmt->execute();
        $providerStmt->close();
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'user' => [
            'id' => $userId,
            'fullName' => $fullName,
            'email' => $email,
            'role' => $role
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
