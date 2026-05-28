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

// ─── CREATE REVIEW ──────────────────────────────────────────────────────────
if ($action === 'create') {
    $reviewerId = isset($input['reviewerId']) ? (int)$input['reviewerId'] : 0;
    $providerId = isset($input['providerId']) ? (int)$input['providerId'] : 0;
    $rating     = isset($input['rating'])     ? (int)$input['rating']     : 0;
    $comment    = isset($input['comment'])    ? trim($input['comment'])   : '';

    if ($reviewerId <= 0 || $providerId <= 0) {
        respond(['success' => false, 'message' => 'Valid reviewerId and providerId are required'], 400);
    }
    if ($rating < 1 || $rating > 5) {
        respond(['success' => false, 'message' => 'Rating must be between 1 and 5'], 400);
    }
    if ($reviewerId === $providerId) {
        respond(['success' => false, 'message' => 'You cannot review yourself'], 400);
    }

    // Check that the provider is actually a provider
    $checkStmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $checkStmt->bind_param("i", $providerId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        respond(['success' => false, 'message' => 'Provider not found'], 404);
    }

    $providerRole = $checkResult->fetch_assoc()['role'];
    $checkStmt->close();

    if ($providerRole !== 'provider') {
        respond(['success' => false, 'message' => 'You can only review service providers'], 400);
    }

    // Insert or update review (one review per customer per provider)
    $stmt = $conn->prepare(
        "INSERT INTO reviews (reviewer_id, provider_id, rating, comment)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            rating = VALUES(rating),
            comment = VALUES(comment),
            created_at = CURRENT_TIMESTAMP"
    );
    $stmt->bind_param("iiis", $reviewerId, $providerId, $rating, $comment);

    if (!$stmt->execute()) {
        respond(['success' => false, 'message' => 'Failed to submit review'], 500);
    }

    // Update provider's average rating
    $avgStmt = $conn->prepare(
        "UPDATE service_providers
         SET rating = (SELECT AVG(rating) FROM reviews WHERE provider_id = ?),
             total_reviews = (SELECT COUNT(*) FROM reviews WHERE provider_id = ?)
         WHERE user_id = ?"
    );
    $avgStmt->bind_param("iii", $providerId, $providerId, $providerId);
    $avgStmt->execute();
    $avgStmt->close();

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'message' => 'Review submitted successfully']);
}

// ─── LIST REVIEWS FOR A PROVIDER ────────────────────────────────────────────
if ($action === 'list') {
    $providerId = isset($_GET['providerId']) ? (int)$_GET['providerId'] : 0;

    if ($providerId <= 0) {
        respond(['success' => false, 'message' => 'Valid providerId is required'], 400);
    }

    $stmt = $conn->prepare(
        "SELECT r.*, u.full_name AS reviewer_name
         FROM reviews r
         JOIN users u ON u.id = r.reviewer_id
         WHERE r.provider_id = ?
         ORDER BY r.created_at DESC"
    );
    $stmt->bind_param("i", $providerId);
    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }

    // Get average rating
    $avgStmt = $conn->prepare("SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE provider_id = ?");
    $avgStmt->bind_param("i", $providerId);
    $avgStmt->execute();
    $avgResult = $avgStmt->get_result()->fetch_assoc();

    $stmt->close();
    $avgStmt->close();
    $conn->close();
    respond([
        'success' => true,
        'reviews' => $reviews,
        'avgRating' => round((float)$avgResult['avg_rating'], 1),
        'totalReviews' => (int)$avgResult['total']
    ]);
}

// ─── GET ALL REVIEWS (my reviews or all) ────────────────────────────────────
if ($action === 'my-reviews') {
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;

    if ($userId <= 0) {
        respond(['success' => false, 'message' => 'Valid userId is required'], 400);
    }

    // Check user role
    $roleStmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $roleStmt->bind_param("i", $userId);
    $roleStmt->execute();
    $roleResult = $roleStmt->get_result();

    if ($roleResult->num_rows === 0) {
        respond(['success' => false, 'message' => 'User not found'], 404);
    }

    $role = $roleResult->fetch_assoc()['role'];
    $roleStmt->close();

    if ($role === 'provider') {
        // Provider sees reviews about them
        $stmt = $conn->prepare(
            "SELECT r.*, u.full_name AS reviewer_name
             FROM reviews r
             JOIN users u ON u.id = r.reviewer_id
             WHERE r.provider_id = ?
             ORDER BY r.created_at DESC"
        );
        $stmt->bind_param("i", $userId);
    } else {
        // Customer sees reviews they've written
        $stmt = $conn->prepare(
            "SELECT r.*, u.full_name AS provider_name
             FROM reviews r
             JOIN users u ON u.id = r.provider_id
             WHERE r.reviewer_id = ?
             ORDER BY r.created_at DESC"
        );
        $stmt->bind_param("i", $userId);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'reviews' => $reviews, 'role' => $role]);
}

// ─── GET ALL PROVIDERS (for review dropdown) ────────────────────────────────
if ($action === 'providers') {
    $stmt = $conn->prepare(
        "SELECT u.id, u.full_name, sp.category
         FROM users u
         LEFT JOIN service_providers sp ON sp.user_id = u.id
         WHERE u.role = 'provider'
         ORDER BY u.full_name ASC"
    );
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

if ($action === 'admin-all') {
    $adminId = isset($_GET['adminId']) ? (int)$_GET['adminId'] : 0;
    $roleStmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $roleStmt->bind_param("i", $adminId);
    $roleStmt->execute();
    $roleResult = $roleStmt->get_result();

    if ($roleResult->num_rows === 0 || $roleResult->fetch_assoc()['role'] !== 'admin') {
        respond(['success' => false, 'message' => 'Only admins can view all reviews'], 403);
    }
    $roleStmt->close();

    $result = $conn->query(
        "SELECT r.id, r.rating, r.comment, r.created_at,
                reviewer.full_name AS reviewer_name,
                provider.full_name AS provider_name,
                provider.id AS provider_id,
                COALESCE(sp.rating, 0) AS provider_avg_rating,
                COALESCE(sp.total_reviews, 0) AS provider_total_reviews
         FROM reviews r
         JOIN users reviewer ON reviewer.id = r.reviewer_id
         JOIN users provider ON provider.id = r.provider_id
         LEFT JOIN service_providers sp ON sp.user_id = provider.id
         ORDER BY sp.rating DESC, r.created_at DESC"
    );

    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }

    $conn->close();
    respond(['success' => true, 'reviews' => $reviews]);
}

$conn->close();
respond(['success' => false, 'message' => 'Unsupported action'], 400);
?>
