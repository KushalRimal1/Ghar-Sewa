<?php
require_once 'config.php';

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : '';

$conn = getDBConnection();

function getUserRole($conn, $userId) {
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $role = $result->num_rows ? $result->fetch_assoc()['role'] : '';
    $stmt->close();
    return $role;
}

function requireAdmin($conn, $userId) {
    if (getUserRole($conn, $userId) !== 'admin') {
        respond(['success' => false, 'message' => 'Only admin can view all conversations'], 403);
    }
}

// ─── SEND MESSAGE ───────────────────────────────────────────────────────────
if ($action === 'send') {
    $senderId   = isset($input['senderId'])   ? (int)$input['senderId']   : 0;
    $receiverId = isset($input['receiverId']) ? (int)$input['receiverId'] : 0;
    $message    = isset($input['message'])    ? trim($input['message'])   : '';

    if ($senderId <= 0 || $receiverId <= 0) {
        respond(['success' => false, 'message' => 'Valid senderId and receiverId are required'], 400);
    }
    if ($message === '') {
        respond(['success' => false, 'message' => 'Message cannot be empty'], 400);
    }
    if ($senderId === $receiverId) {
        respond(['success' => false, 'message' => 'Cannot send message to yourself'], 400);
    }

    $senderRole = getUserRole($conn, $senderId);
    $receiverRole = getUserRole($conn, $receiverId);
    $allowedPair = ($senderRole === 'customer' && $receiverRole === 'provider') ||
                   ($senderRole === 'provider' && $receiverRole === 'customer');
    if (!$allowedPair) {
        respond(['success' => false, 'message' => 'Chat is only allowed between customers and service providers'], 403);
    }

    $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $senderId, $receiverId, $message);

    if (!$stmt->execute()) {
        respond(['success' => false, 'message' => 'Failed to send message'], 500);
    }

    $msgId = $conn->insert_id;
    $stmt->close();
    $conn->close();
    respond(['success' => true, 'message' => 'Message sent', 'messageId' => $msgId]);
}

// ─── GET CONVERSATIONS LIST ─────────────────────────────────────────────────
if ($action === 'conversations') {
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
    if ($userId <= 0) {
        respond(['success' => false, 'message' => 'Valid userId is required'], 400);
    }

    // Get all unique conversation partners with latest message
    $sql = "
        SELECT
            u.id AS partner_id,
            u.full_name AS partner_name,
            u.role AS partner_role,
            m.message AS last_message,
            m.created_at AS last_time,
            (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = FALSE) AS unread_count
        FROM users u
        INNER JOIN (
            SELECT
                CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS partner_id,
                MAX(id) AS max_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY partner_id
        ) latest ON u.id = latest.partner_id
        INNER JOIN messages m ON m.id = latest.max_id
        ORDER BY m.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiii", $userId, $userId, $userId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $conversations = [];
    while ($row = $result->fetch_assoc()) {
        $conversations[] = $row;
    }

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'conversations' => $conversations]);
}

if ($action === 'all-conversations') {
    $adminId = isset($_GET['adminId']) ? (int)$_GET['adminId'] : 0;
    requireAdmin($conn, $adminId);

    $result = $conn->query(
        "SELECT
            LEAST(m.sender_id, m.receiver_id) AS user_a,
            GREATEST(m.sender_id, m.receiver_id) AS user_b,
            sender.full_name AS sender_name,
            sender.role AS sender_role,
            receiver.full_name AS receiver_name,
            receiver.role AS receiver_role,
            m.message AS last_message,
            m.created_at AS last_time
         FROM messages m
         JOIN users sender ON sender.id = m.sender_id
         JOIN users receiver ON receiver.id = m.receiver_id
         JOIN (
            SELECT LEAST(sender_id, receiver_id) AS user_a,
                   GREATEST(sender_id, receiver_id) AS user_b,
                   MAX(id) AS max_id
            FROM messages
            GROUP BY user_a, user_b
         ) latest ON latest.max_id = m.id
         WHERE (sender.role = 'customer' AND receiver.role = 'provider')
            OR (sender.role = 'provider' AND receiver.role = 'customer')
         ORDER BY m.created_at DESC"
    );

    $conversations = [];
    while ($row = $result->fetch_assoc()) {
        $conversations[] = $row;
    }

    $conn->close();
    respond(['success' => true, 'conversations' => $conversations]);
}

// ─── GET MESSAGE THREAD ─────────────────────────────────────────────────────
if ($action === 'thread') {
    $userId   = isset($_GET['userId'])   ? (int)$_GET['userId']   : 0;
    $partnerId = isset($_GET['partnerId']) ? (int)$_GET['partnerId'] : 0;

    if ($userId <= 0 || $partnerId <= 0) {
        respond(['success' => false, 'message' => 'Valid userId and partnerId are required'], 400);
    }

    // Mark messages as read
    $markStmt = $conn->prepare("UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE");
    $markStmt->bind_param("ii", $partnerId, $userId);
    $markStmt->execute();
    $markStmt->close();

    // Get messages
    $stmt = $conn->prepare(
        "SELECT m.*, u.full_name AS sender_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at ASC
         LIMIT 100"
    );
    $stmt->bind_param("iiii", $userId, $partnerId, $partnerId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'messages' => $messages]);
}

if ($action === 'admin-thread') {
    $adminId = isset($_GET['adminId']) ? (int)$_GET['adminId'] : 0;
    $userA = isset($_GET['userA']) ? (int)$_GET['userA'] : 0;
    $userB = isset($_GET['userB']) ? (int)$_GET['userB'] : 0;

    requireAdmin($conn, $adminId);
    if ($userA <= 0 || $userB <= 0) {
        respond(['success' => false, 'message' => 'Valid conversation users are required'], 400);
    }

    $stmt = $conn->prepare(
        "SELECT m.*, u.full_name AS sender_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at ASC
         LIMIT 150"
    );
    $stmt->bind_param("iiii", $userA, $userB, $userB, $userA);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'messages' => $messages]);
}

// ─── GET ALL PROVIDERS (for starting new conversations) ─────────────────────
if ($action === 'providers' || $action === 'contacts') {
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
    $role = getUserRole($conn, $userId);
    $targetRole = $role === 'provider' ? 'customer' : 'provider';

    if ($role === 'admin' || $role === '') {
        $conn->close();
        respond(['success' => true, 'providers' => []]);
    }

    $stmt = $conn->prepare(
        "SELECT u.id, u.full_name, u.role, sp.category
         FROM users u
         LEFT JOIN service_providers sp ON sp.user_id = u.id
         WHERE u.id != ? AND u.role = ?
         ORDER BY u.full_name ASC"
    );
    $stmt->bind_param("is", $userId, $targetRole);
    $stmt->execute();
    $result = $stmt->get_result();

    $providers = [];
    while ($row = $result->fetch_assoc()) {
        $providers[] = $row;
    }

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'providers' => $providers]);
}

$conn->close();
respond(['success' => false, 'message' => 'Unsupported action'], 400);
?>
