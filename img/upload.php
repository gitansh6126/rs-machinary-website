<?php
error_reporting(0);
ini_set('display_errors', 0);

@ob_end_clean();

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

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExts = ['png', 'jpeg', 'jpg', 'webp', 'gif'];

if (!in_array($ext, $allowedExts)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file extension. Allowed: png, jpeg, jpg, webp, gif']);
    exit;
}

$info = @getimagesize($file['tmp_name']);
if (!$info) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File is not a valid image']);
    exit;
}

if (!extension_loaded('gd')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server does not have GD library installed. WebP conversion requires GD.']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (function_exists('random_bytes')) {
    $filename = bin2hex(random_bytes(12)) . '.webp';
} else {
    $filename = bin2hex(openssl_random_pseudo_bytes(12)) . '.webp';
}
$destPath = $uploadDir . $filename;

$src = null;
switch ($ext) {
    case 'png':
        if (function_exists('imagecreatefrompng')) {
            $src = @imagecreatefrompng($file['tmp_name']);
            if ($src) {
                imagepalettetotruecolor($src);
                imagealphablending($src, true);
                imagesavealpha($src, true);
            }
        }
        break;
    case 'jpeg':
    case 'jpg':
        if (function_exists('imagecreatefromjpeg')) {
            $src = @imagecreatefromjpeg($file['tmp_name']);
        }
        break;
    case 'webp':
        if (function_exists('imagecreatefromwebp')) {
            $src = @imagecreatefromwebp($file['tmp_name']);
        }
        break;
    case 'gif':
        if (function_exists('imagecreatefromgif')) {
            $src = @imagecreatefromgif($file['tmp_name']);
            if ($src) {
                imagepalettetotruecolor($src);
                imagealphablending($src, true);
                imagesavealpha($src, true);
            }
        }
        break;
}

if (!$src) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to read image']);
    exit;
}

$converted = @imagewebp($src, $destPath, 80);
imagedestroy($src);

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
