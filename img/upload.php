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
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No image uploaded']);
    exit;
}

$file = $_FILES['image'];

$maxSize = 10 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large. Max 10MB.']);
    exit;
}

$allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Allowed: PNG, JPEG, WebP, GIF']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = bin2hex(random_bytes(12)) . '.webp';
$destPath = $uploadDir . $filename;

$converted = false;
switch ($mimeType) {
    case 'image/png':
        $src = @imagecreatefrompng($file['tmp_name']);
        if ($src) {
            imagepalettetotruecolor($src);
            imagealphablending($src, true);
            imagesavealpha($src, true);
            $converted = @imagewebp($src, $destPath, 80);
            imagedestroy($src);
        }
        break;
    case 'image/jpeg':
    case 'image/jpg':
        $src = @imagecreatefromjpeg($file['tmp_name']);
        if ($src) {
            $converted = @imagewebp($src, $destPath, 80);
            imagedestroy($src);
        }
        break;
    case 'image/webp':
        $src = @imagecreatefromwebp($file['tmp_name']);
        if ($src) {
            $converted = @imagewebp($src, $destPath, 80);
            imagedestroy($src);
        }
        break;
    case 'image/gif':
        $src = @imagecreatefromgif($file['tmp_name']);
        if ($src) {
            imagepalettetotruecolor($src);
            imagealphablending($src, true);
            imagesavealpha($src, true);
            $converted = @imagewebp($src, $destPath, 80);
            imagedestroy($src);
        }
        break;
}

if (!$converted) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to convert image to WebP']);
    exit;
}

$imageUrl = 'https://img.rsmachinary.in/uploads/' . $filename;

echo json_encode([
    'success' => true,
    'url' => $imageUrl,
    'filename' => $filename,
    'size' => filesize($destPath)
]);
