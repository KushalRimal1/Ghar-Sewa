<?php
require_once 'config.php';

function respond($p, $s=200) { http_response_code($s); header('Content-Type: application/json; charset=utf-8'); echo json_encode($p); exit(); }

function ensurePaymentsTable($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        notes VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->query($sql);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = isset($input['action']) ? $input['action'] : (isset($_REQUEST['action']) ? $_REQUEST['action'] : '');

$conn = getDBConnection();
ensurePaymentsTable($conn);
$updatedCount = 0;

if ($action === 'list') {
    $stmt = $conn->prepare("SELECT p.*, c.email as customer_email, pr.full_name as provider_name 
                            FROM payments p 
                            JOIN users c ON p.customer_id = c.id 
                            JOIN users pr ON p.provider_id = pr.id 
                            ORDER BY p.created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = [
            'time' => $row['created_at'],
            'provider' => $row['provider_name'],
            'customer' => $row['customer_email'],
            'amount' => (float)$row['amount'],
            'notes' => $row['notes']
        ];
    }
    $stmt->close();
    $conn->close();
    respond(['success'=>true, 'payments'=>$payments]);
}

if ($action !== 'pay') {
    respond(['success'=>false,'message'=>'Invalid action. Use action=pay or action=list'],400);
}

$provider = trim($input['provider'] ?? ($input['providerName'] ?? ''));
$customerEmail = strtolower(trim($input['customerEmail'] ?? ''));
$amount = isset($input['amount']) ? floatval($input['amount']) : 0;
$notes = trim($input['notes'] ?? '');
$requestId = isset($input['requestId']) ? (int)$input['requestId'] : 0;

if ($requestId <= 0) {
    if ($customerEmail === '' || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        respond(['success'=>false,'message'=>'Provide a valid customer email'],400);
    }
}
if ($amount <= 0) {
    respond(['success'=>false,'message'=>'Provide an amount greater than 0'],400);
}

$providerId = 0;
$customerId = 0;

if ($requestId > 0) {
    $stmtR = $conn->prepare("SELECT customer_id, provider_id FROM service_requests WHERE id = ?");
    if ($stmtR) {
        $stmtR->bind_param("i", $requestId);
        $stmtR->execute();
        $resR = $stmtR->get_result();
        if ($resR && $rowR = $resR->fetch_assoc()) {
            $customerId = (int)$rowR['customer_id'];
            $providerId = (int)$rowR['provider_id'];
        }
        $stmtR->close();
    }
}

if ($customerId <= 0) {
    $stmtC = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    if ($stmtC) {
        $stmtC->bind_param("s", $customerEmail);
        $stmtC->execute();
        $resC = $stmtC->get_result();
        if ($resC && $rowC = $resC->fetch_assoc()) {
            $customerId = (int)$rowC['id'];
        }
        $stmtC->close();
    }
}

if ($customerId <= 0) {
    respond(['success'=>false,'message'=>"Customer with email $customerEmail not found in database."],404);
}

if ($providerId <= 0 && $provider !== '') {
    $stmtP = $conn->prepare("SELECT id FROM users WHERE full_name LIKE ? AND role = 'provider' LIMIT 1");
    if ($stmtP) {
        $likeName = "%$provider%";
        $stmtP->bind_param("s", $likeName);
        $stmtP->execute();
        $resP = $stmtP->get_result();
        if ($resP && $rowP = $resP->fetch_assoc()) {
            $providerId = (int)$rowP['id'];
        }
        $stmtP->close();
    }
}

if ($providerId <= 0) {
    respond(['success'=>false,'message'=>"Provider '$provider' not found in database."],404);
}

// Insert into payments table
$stmtI = $conn->prepare("INSERT INTO payments (customer_id, provider_id, amount, notes) VALUES (?, ?, ?, ?)");
if ($stmtI) {
    $stmtI->bind_param("iids", $customerId, $providerId, $amount, $notes);
    $stmtI->execute();
    $stmtI->close();
}

// Update service requests
if ($requestId > 0) {
    $stmtU = $conn->prepare("UPDATE service_requests SET payment_status = 'paid', payment_note = ? WHERE id = ? AND payment_status = 'unpaid'");
    if ($stmtU) {
        $payNote = "Paid Rs. " . $amount . ($notes ? " ($notes)" : "");
        $stmtU->bind_param("si", $payNote, $requestId);
        $stmtU->execute();
        $updatedCount = $stmtU->affected_rows;
        $stmtU->close();
    }
} else {
    $stmtU = $conn->prepare("UPDATE service_requests SET payment_status = 'paid', payment_note = ? WHERE customer_id = ? AND provider_id = ? AND payment_status = 'unpaid'");
    if ($stmtU) {
        $payNote = "Paid Rs. " . $amount . ($notes ? " ($notes)" : "");
        $stmtU->bind_param("sii", $payNote, $customerId, $providerId);
        $stmtU->execute();
        $updatedCount = $stmtU->affected_rows;
        $stmtU->close();
    }
}

$conn->close();

respond(['success'=>true,'message'=>"Payment recorded successfully. Updated $updatedCount service request(s) to paid."]);
?>
