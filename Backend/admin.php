<?php
require_once 'config.php';

function respondAdmin($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit();
}

function requireAdminUser($conn, $adminId) {
    if ($adminId <= 0) {
        respondAdmin(['success' => false, 'message' => 'Admin user id is required'], 400);
    }

    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $adminId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        respondAdmin(['success' => false, 'message' => 'Admin user not found'], 404);
    }

    $role = $result->fetch_assoc()['role'];
    $stmt->close();

    if ($role !== 'admin') {
        respondAdmin(['success' => false, 'message' => 'Only admins can use this action'], 403);
    }
}

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
$adminId = isset($_GET['adminId']) ? (int)$_GET['adminId'] : (int)($input['adminId'] ?? 0);
$conn = getDBConnection();

requireAdminUser($conn, $adminId);

if ($action === 'dashboard') {
    $users = [];
    $userResult = $conn->query(
        "SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at,
                sp.category, COALESCE(sp.is_verified, 0) AS is_verified,
                p.skills, p.qualifications, p.job_preferences, p.hiring_requirements
         FROM users u
         LEFT JOIN service_providers sp ON sp.user_id = u.id
         LEFT JOIN user_profiles p ON p.user_id = u.id
         ORDER BY u.created_at DESC"
    );

    while ($row = $userResult->fetch_assoc()) {
        $users[] = $row;
    }

    $jobs = [];
    $jobResult = $conn->query(
        "SELECT j.id, j.title, j.location, j.industry, j.experience_level, j.status, j.created_at,
                u.full_name AS provider_name
         FROM job_listings j
         JOIN users u ON u.id = j.provider_id
         ORDER BY j.created_at DESC"
    );

    while ($row = $jobResult->fetch_assoc()) {
        $jobs[] = $row;
    }

    $conn->close();
    respondAdmin(['success' => true, 'users' => $users, 'jobs' => $jobs]);
}

if ($action === 'approveProvider') {
    $providerUserId = isset($input['providerUserId']) ? (int)$input['providerUserId'] : 0;

    if ($providerUserId <= 0) {
        respondAdmin(['success' => false, 'message' => 'Provider user id is required'], 400);
    }

    $stmt = $conn->prepare(
        "UPDATE service_providers sp
         JOIN users u ON u.id = sp.user_id
         SET sp.is_verified = TRUE
         WHERE sp.user_id = ? AND u.role = 'provider'"
    );
    $stmt->bind_param("i", $providerUserId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $conn->close();

    respondAdmin(['success' => $affected > 0, 'message' => $affected > 0 ? 'Provider approved' : 'Provider not found or already approved']);
}

if ($action === 'setJobStatus') {
    $jobId = isset($input['jobId']) ? (int)$input['jobId'] : 0;
    $status = isset($input['status']) ? trim($input['status']) : '';

    if ($jobId <= 0 || !in_array($status, ['open', 'closed'], true)) {
        respondAdmin(['success' => false, 'message' => 'Valid job id and status are required'], 400);
    }

    $stmt = $conn->prepare("UPDATE job_listings SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $jobId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $conn->close();

    respondAdmin(['success' => true, 'message' => $affected > 0 ? 'Job status updated' : 'No job status changed']);
}

$conn->close();
respondAdmin(['success' => false, 'message' => 'Unsupported action'], 400);
?>
