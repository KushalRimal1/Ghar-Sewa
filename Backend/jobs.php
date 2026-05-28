<?php
require_once 'config.php';

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

$conn = getDBConnection();

if ($action === 'create') {
    $providerId = isset($input['providerId']) ? (int)$input['providerId'] : 0;
    $title = isset($input['title']) ? trim($input['title']) : '';
    $description = isset($input['description']) ? trim($input['description']) : '';
    $requirements = isset($input['requirements']) ? trim($input['requirements']) : null;
    $applicationInstructions = isset($input['applicationInstructions']) ? trim($input['applicationInstructions']) : null;
    $location = isset($input['location']) ? trim($input['location']) : null;
    $industry = isset($input['industry']) ? trim($input['industry']) : null;
    $experienceLevel = isset($input['experienceLevel']) ? trim($input['experienceLevel']) : 'entry';

    if ($providerId <= 0 || $title === '' || $description === '') {
        respond(['success' => false, 'message' => 'providerId, title and description are required'], 400);
    }

    if (!in_array($experienceLevel, ['entry', 'mid', 'senior'], true)) {
        respond(['success' => false, 'message' => 'Invalid experience level'], 400);
    }

    $roleStmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $roleStmt->bind_param("i", $providerId);
    $roleStmt->execute();
    $roleResult = $roleStmt->get_result();
    if ($roleResult->num_rows === 0) {
        respond(['success' => false, 'message' => 'Provider user not found'], 404);
    }
    $role = $roleResult->fetch_assoc()['role'];
    $roleStmt->close();

    if (!in_array($role, ['provider', 'admin'], true)) {
        respond(['success' => false, 'message' => 'Only provider/admin can post jobs'], 403);
    }

    $stmt = $conn->prepare(
        "INSERT INTO job_listings (provider_id, title, description, requirements, application_instructions, location, industry, experience_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("isssssss", $providerId, $title, $description, $requirements, $applicationInstructions, $location, $industry, $experienceLevel);

    if (!$stmt->execute()) {
        respond(['success' => false, 'message' => 'Could not create job'], 500);
    }

    $jobId = $conn->insert_id;
    $stmt->close();
    $conn->close();
    respond(['success' => true, 'message' => 'Job listing created', 'jobId' => $jobId]);
}

if ($action === 'list') {
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';
    $location = isset($_GET['location']) ? trim($_GET['location']) : '';
    $industry = isset($_GET['industry']) ? trim($_GET['industry']) : '';
    $experienceLevel = isset($_GET['experienceLevel']) ? trim($_GET['experienceLevel']) : '';

    $sql = "SELECT j.*, u.full_name AS provider_name
            FROM job_listings j
            JOIN users u ON u.id = j.provider_id
            WHERE j.status = 'open'";

    $types = '';
    $params = [];

    if ($search !== '') {
        $sql .= " AND (j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)";
        $like = '%' . $search . '%';
        $types .= 'sss';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }

    if ($location !== '') {
        $sql .= " AND j.location = ?";
        $types .= 's';
        $params[] = $location;
    }

    if ($industry !== '') {
        $sql .= " AND j.industry = ?";
        $types .= 's';
        $params[] = $industry;
    }

    if ($experienceLevel !== '') {
        $sql .= " AND j.experience_level = ?";
        $types .= 's';
        $params[] = $experienceLevel;
    }

    $sql .= " ORDER BY j.created_at DESC";

    $stmt = $conn->prepare($sql);
    if ($types !== '') {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $jobs = [];
    while ($row = $result->fetch_assoc()) {
        $jobs[] = $row;
    }

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'jobs' => $jobs]);
}

$conn->close();
respond(['success' => false, 'message' => 'Unsupported action'], 400);
?>