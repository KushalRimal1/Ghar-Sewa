<?php
require_once 'config.php';

function respondRequest($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit();
}

function ensureServiceRequestsTable($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS service_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        service_label VARCHAR(150),
        customer_phone VARCHAR(30),
        customer_location TEXT,
        message TEXT,
        status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
        work_status ENUM('requested', 'completed') NOT NULL DEFAULT 'requested',
        service_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        billing_note VARCHAR(255),
        payment_status ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
        payment_note VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_customer (customer_id),
        INDEX idx_provider (provider_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    if (!$conn->query($sql)) {
        respondRequest(['success' => false, 'message' => 'Could not prepare service request storage'], 500);
    }

    ensureServiceRequestColumn($conn, 'work_status', "ALTER TABLE service_requests ADD COLUMN work_status ENUM('requested', 'completed') NOT NULL DEFAULT 'requested' AFTER status");
    ensureServiceRequestColumn($conn, 'service_price', "ALTER TABLE service_requests ADD COLUMN service_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER work_status");
    ensureServiceRequestColumn($conn, 'billing_note', "ALTER TABLE service_requests ADD COLUMN billing_note VARCHAR(255) AFTER service_price");
}

function ensureServiceRequestColumn($conn, $column, $alterSql) {
    $stmt = $conn->prepare(
        "SELECT COUNT(*) AS column_count
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'service_requests'
           AND COLUMN_NAME = ?"
    );
    if (!$stmt) {
        respondRequest(['success' => false, 'message' => 'Could not inspect service request storage'], 500);
    }
    $stmt->bind_param("s", $column);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $exists = $row && (int)$row['column_count'] > 0;
    $stmt->close();

    if (!$exists && !$conn->query($alterSql)) {
        respondRequest(['success' => false, 'message' => 'Could not update service request billing storage'], 500);
    }
}

function getUserRoleForRequest($conn, $userId) {
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $role = $result->num_rows ? $result->fetch_assoc()['role'] : '';
    $stmt->close();
    return $role;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : '';
$conn = getDBConnection();
ensureServiceRequestsTable($conn);

if ($action === 'create') {
    $customerId = isset($input['customerId']) ? (int)$input['customerId'] : 0;
    $providerId = isset($input['providerId']) ? (int)$input['providerId'] : 0;
    $serviceLabel = isset($input['serviceLabel']) ? trim($input['serviceLabel']) : '';
    $customerPhone = isset($input['customerPhone']) ? trim($input['customerPhone']) : '';
    $customerLocation = isset($input['customerLocation']) ? trim($input['customerLocation']) : '';
    $message = isset($input['message']) ? trim($input['message']) : '';
    $servicePrice = isset($input['servicePrice']) ? max(0, (float)$input['servicePrice']) : 0;

    if ($customerId <= 0 || $providerId <= 0 || $message === '') {
        respondRequest(['success' => false, 'message' => 'Customer, provider, and request message are required'], 400);
    }

    $phonePattern = '/^(?:\+977[-\s]?)?9\d{9}$/';
    if (empty($customerPhone)) {
        respondRequest(['success' => false, 'message' => 'Customer phone is required for service requests'], 400);
    }
    if (!preg_match($phonePattern, $customerPhone)) {
        respondRequest(['success' => false, 'message' => 'Customer phone must be a valid Nepal number'], 400);
    }

    if (getUserRoleForRequest($conn, $customerId) !== 'customer' || getUserRoleForRequest($conn, $providerId) !== 'provider') {
        respondRequest(['success' => false, 'message' => 'Service requests must be from a customer to a provider'], 403);
    }

    $stmt = $conn->prepare(
        "INSERT INTO service_requests (customer_id, provider_id, service_label, customer_phone, customer_location, message, service_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("iissssd", $customerId, $providerId, $serviceLabel, $customerPhone, $customerLocation, $message, $servicePrice);

    if (!$stmt->execute()) {
        respondRequest(['success' => false, 'message' => 'Could not create service request'], 500);
    }

    $requestId = $conn->insert_id;
    $stmt->close();
    $conn->close();
    respondRequest(['success' => true, 'message' => 'Service request created', 'requestId' => $requestId]);
}

if ($action === 'list') {
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
    if ($userId <= 0) {
        respondRequest(['success' => false, 'message' => 'Valid user id is required'], 400);
    }

    $role = getUserRoleForRequest($conn, $userId);
    if ($role === 'admin') {
        $stmt = $conn->prepare(
            "SELECT sr.*, customer.full_name AS customer_name, provider.full_name AS provider_name
             FROM service_requests sr
             JOIN users customer ON customer.id = sr.customer_id
             JOIN users provider ON provider.id = sr.provider_id
             ORDER BY sr.created_at DESC"
        );
    } elseif ($role === 'provider') {
        $stmt = $conn->prepare(
            "SELECT sr.*, customer.full_name AS customer_name, provider.full_name AS provider_name
             FROM service_requests sr
             JOIN users customer ON customer.id = sr.customer_id
             JOIN users provider ON provider.id = sr.provider_id
             WHERE sr.provider_id = ?
             ORDER BY sr.created_at DESC"
        );
        $stmt->bind_param("i", $userId);
    } else {
        $stmt = $conn->prepare(
            "SELECT sr.*, customer.full_name AS customer_name, provider.full_name AS provider_name
             FROM service_requests sr
             JOIN users customer ON customer.id = sr.customer_id
             JOIN users provider ON provider.id = sr.provider_id
             WHERE sr.customer_id = ?
             ORDER BY sr.created_at DESC"
        );
        $stmt->bind_param("i", $userId);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = $row;
    }

    $stmt->close();
    $conn->close();
    respondRequest(['success' => true, 'role' => $role, 'requests' => $requests]);
}

if ($action === 'update-status') {
    $requestId = isset($input['requestId']) ? (int)$input['requestId'] : 0;
    $providerId = isset($input['providerId']) ? (int)$input['providerId'] : 0;
    $status = isset($input['status']) ? trim($input['status']) : '';

    if ($requestId <= 0 || $providerId <= 0 || !in_array($status, ['accepted', 'rejected'], true)) {
        respondRequest(['success' => false, 'message' => 'Valid request, provider, and status are required'], 400);
    }

    if (getUserRoleForRequest($conn, $providerId) !== 'provider') {
        respondRequest(['success' => false, 'message' => 'Only service providers can confirm or reject requests'], 403);
    }

    $stmt = $conn->prepare("UPDATE service_requests SET status = ? WHERE id = ? AND provider_id = ?");
    $stmt->bind_param("sii", $status, $requestId, $providerId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $conn->close();
    respondRequest(['success' => $affected > 0, 'message' => $affected > 0 ? "Request $status" : 'Request not found']);
}

if ($action === 'complete-work') {
    $requestId = isset($input['requestId']) ? (int)$input['requestId'] : 0;
    $providerId = isset($input['providerId']) ? (int)$input['providerId'] : 0;
    $servicePrice = isset($input['servicePrice']) ? (float)$input['servicePrice'] : 0;
    $billingNote = isset($input['billingNote']) ? trim($input['billingNote']) : '';

    if ($requestId <= 0 || $providerId <= 0 || $servicePrice <= 0) {
        respondRequest(['success' => false, 'message' => 'Valid request, provider, and service price are required'], 400);
    }

    if (getUserRoleForRequest($conn, $providerId) !== 'provider') {
        respondRequest(['success' => false, 'message' => 'Only service providers can complete work and create bills'], 403);
    }

    $stmt = $conn->prepare(
        "UPDATE service_requests
         SET work_status = 'completed', service_price = ?, billing_note = ?, payment_status = 'unpaid'
         WHERE id = ? AND provider_id = ? AND status = 'accepted'"
    );
    $stmt->bind_param("dsii", $servicePrice, $billingNote, $requestId, $providerId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $conn->close();
    respondRequest(['success' => $affected > 0, 'message' => $affected > 0 ? 'Work completed and bill created' : 'Accepted request not found']);
}

if ($action === 'update-payment') {
    $adminId = isset($input['adminId']) ? (int)$input['adminId'] : 0;
    $requestId = isset($input['requestId']) ? (int)$input['requestId'] : 0;
    $paymentStatus = isset($input['paymentStatus']) ? trim($input['paymentStatus']) : '';
    $paymentNote = isset($input['paymentNote']) ? trim($input['paymentNote']) : '';

    if (getUserRoleForRequest($conn, $adminId) !== 'admin') {
        respondRequest(['success' => false, 'message' => 'Only admins can update payment status'], 403);
    }

    if ($requestId <= 0 || !in_array($paymentStatus, ['unpaid', 'paid'], true)) {
        respondRequest(['success' => false, 'message' => 'Valid request and payment status are required'], 400);
    }

    $stmt = $conn->prepare("UPDATE service_requests SET payment_status = ?, payment_note = ? WHERE id = ?");
    $stmt->bind_param("ssi", $paymentStatus, $paymentNote, $requestId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $conn->close();
    respondRequest(['success' => true, 'message' => $affected > 0 ? 'Payment status updated' : 'No payment status changed']);
}

$conn->close();
respondRequest(['success' => false, 'message' => 'Unsupported action'], 400);
?>
