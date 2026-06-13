<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $code = isset($_FILES['image']) ? $_FILES['image']['error'] : 'missing';
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Image upload failed', 'code' => $code]);
    exit;
}

$file = $_FILES['image'];

if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File exceeds 10MB limit']);
    exit;
}

$allowed = ['image/png', 'image/jpeg', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only PNG, JPEG, and WebP are allowed.']);
    exit;
}

$extMap = [
    'image/png' => 'png',
    'image/jpeg' => 'jpg',
    'image/webp' => 'webp',
];
$ext = $extMap[$mime];

$uploadDir = __DIR__ . '/../uploads/categories/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create upload directory']);
        exit;
    }
}

$timestamp = time();
$random = bin2hex(random_bytes(4));
$filename = $timestamp . '_' . $random . '.' . $ext;
$destPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
    exit;
}

$imageUrl = 'https://rsmachinery.in/uploads/categories/' . $filename;

echo json_encode([
    'success' => true,
    'image_url' => $imageUrl,
]);
