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

function ensureUserProfilesTable($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        skills TEXT,
        qualifications TEXT,
        job_preferences TEXT,
        hiring_requirements TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    if (!$conn->query($sql)) {
        respond(['success' => false, 'message' => 'Could not prepare profile storage'], 500);
    }
}

ensureUserProfilesTable($conn);

function inferServiceCategory($skills) {
    $value = strtolower($skills ?? '');
    $knownCategories = [
        'plumber' => ['plumber', 'plumbing', 'pipe', 'tap'],
        'electrician' => ['electrician', 'electrical', 'wiring', 'wire'],
        'cleaner' => ['cleaner', 'cleaning', 'maid', 'housekeeping'],
        'technician' => ['technician', 'repair', 'appliance', 'ac', 'fridge'],
        'health' => ['health', 'nurse', 'medical', 'check up', 'checkup'],
        'painter' => ['painter', 'painting', 'paint'],
        'cook' => ['cook', 'chef', 'cooking', 'catering']
    ];

    foreach ($knownCategories as $category => $keywords) {
        foreach ($keywords as $keyword) {
            if (strpos($value, $keyword) !== false) {
                return $category;
            }
        }
    }

    return '';
}

function formatServiceLabel($skills, $fallbackCategory) {
    $skills = trim($skills ?? '');
    if ($skills !== '') {
        return substr($skills, 0, 80);
    }

    $fallbackCategory = trim($fallbackCategory ?? '');
    return $fallbackCategory !== '' ? ucwords(str_replace('-', ' ', $fallbackCategory)) : 'Service Provider';
}

if ($action === 'save') {
    if (!isset($input['userId'])) {
        respond(['success' => false, 'message' => 'userId is required'], 400);
    }

    $userId = (int)$input['userId'];
    $skills = isset($input['skills']) ? trim($input['skills']) : null;
    $qualifications = isset($input['qualifications']) ? trim($input['qualifications']) : null;
    $jobPreferences = isset($input['jobPreferences']) ? trim($input['jobPreferences']) : null;
    $hiringRequirements = isset($input['hiringRequirements']) ? trim($input['hiringRequirements']) : null;

    $stmt = $conn->prepare(
        "INSERT INTO user_profiles (user_id, skills, qualifications, job_preferences, hiring_requirements)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            skills = VALUES(skills),
            qualifications = VALUES(qualifications),
            job_preferences = VALUES(job_preferences),
            hiring_requirements = VALUES(hiring_requirements)"
    );
    $stmt->bind_param("issss", $userId, $skills, $qualifications, $jobPreferences, $hiringRequirements);

    if (!$stmt->execute()) {
        respond(['success' => false, 'message' => 'Could not save profile'], 500);
    }

    $stmt->close();

    $category = inferServiceCategory($skills);
    if ($category !== '') {
        $providerStmt = $conn->prepare(
            "UPDATE service_providers sp
             JOIN users u ON u.id = sp.user_id
             SET sp.category = ?
             WHERE sp.user_id = ? AND u.role = 'provider'"
        );
        $providerStmt->bind_param("si", $category, $userId);
        $providerStmt->execute();
        $updatedRows = $providerStmt->affected_rows;
        $providerStmt->close();

        if ($updatedRows === 0) {
            $providerStmt = $conn->prepare(
                "INSERT INTO service_providers (user_id, category)
                 SELECT id, ? FROM users
                 WHERE id = ? AND role = 'provider'
                   AND NOT EXISTS (SELECT 1 FROM service_providers WHERE user_id = ?)"
            );
            $providerStmt->bind_param("sii", $category, $userId, $userId);
            $providerStmt->execute();
            $providerStmt->close();
        }
    }

    $conn->close();
    respond(['success' => true, 'message' => 'Profile saved successfully']);
}

if ($action === 'providers') {
    $stmt = $conn->prepare(
        "SELECT
            u.id,
            u.full_name,
            u.phone,
            u.role,
            COALESCE(sp.category, '') AS category,
            COALESCE(sp.rating, 0) AS rating,
            COALESCE(sp.total_reviews, 0) AS total_reviews,
            COALESCE(sp.location, '') AS location,
            p.skills,
            p.qualifications,
            p.job_preferences,
            p.hiring_requirements
         FROM users u
         LEFT JOIN service_providers sp ON sp.user_id = u.id
         LEFT JOIN user_profiles p ON p.user_id = u.id
         WHERE u.role = 'provider'
         ORDER BY u.full_name ASC"
    );
    $stmt->execute();
    $result = $stmt->get_result();

    $providers = [];
    while ($row = $result->fetch_assoc()) {
        $category = strtolower($row['category'] ?: inferServiceCategory($row['skills']));
        $providers[] = [
            'id' => (int)$row['id'],
            'name' => $row['full_name'],
            'phone' => $row['phone'] ?? '',
            'category' => $category ?: 'provider',
            'label' => formatServiceLabel($row['skills'], $category),
            'rating' => (float)$row['rating'],
            'reviews' => (int)$row['total_reviews'],
            'location' => $row['location'] ?? '',
            'skills' => $row['skills'] ?? '',
            'qualifications' => $row['qualifications'] ?? '',
            'jobPreferences' => $row['job_preferences'] ?? '',
            'hiringRequirements' => $row['hiring_requirements'] ?? ''
        ];
    }

    $stmt->close();
    $conn->close();
    respond(['success' => true, 'providers' => $providers]);
}

if ($action === 'get') {
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
    if ($userId <= 0) {
        respond(['success' => false, 'message' => 'Valid userId is required'], 400);
    }

    $stmt = $conn->prepare(
        "SELECT u.id, u.full_name, u.email, u.role, p.skills, p.qualifications, p.job_preferences, p.hiring_requirements
         FROM users u
         LEFT JOIN user_profiles p ON p.user_id = u.id
         WHERE u.id = ?"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        respond(['success' => false, 'message' => 'User not found'], 404);
    }

    $profile = $result->fetch_assoc();
    $stmt->close();
    $conn->close();
    respond(['success' => true, 'profile' => $profile]);
}

$conn->close();
respond(['success' => false, 'message' => 'Unsupported action'], 400);
?>
