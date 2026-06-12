<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

define('MAX_FILE_SIZE', 5 * 1024 * 1024);
define('ALLOWED_MIMES', ['image/jpeg', 'image/png', 'image/webp']);
define('TARGET_DIR', __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR);
define('MAX_WIDTH', 1200);
define('WEBP_QUALITY', 85);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['image'];

if ($file['size'] > MAX_FILE_SIZE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File exceeds 5 MB limit']);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$realMime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($realMime, ALLOWED_MIMES, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Allowed: JPG, PNG, WebP']);
    exit;
}

$imageInfo = @getimagesize($file['tmp_name']);
if (!$imageInfo) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File is not a valid image']);
    exit;
}

$timestamp = time();
$random = bin2hex(random_bytes(8));
$filename = $timestamp . '_' . $random . '.webp';
$filepath = TARGET_DIR . $filename;

if (!is_dir(TARGET_DIR)) {
    if (!mkdir(TARGET_DIR, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
        exit;
    }
}

$srcImage = null;
switch ($realMime) {
    case 'image/jpeg': $srcImage = @imagecreatefromjpeg($file['tmp_name']); break;
    case 'image/png':  $srcImage = @imagecreatefrompng($file['tmp_name']); break;
    case 'image/webp': $srcImage = @imagecreatefromwebp($file['tmp_name']); break;
}

if ($srcImage) {
    $origW = imagesx($srcImage);
    $origH = imagesy($srcImage);

    if ($origW > MAX_WIDTH) {
        $ratio = MAX_WIDTH / $origW;
        $newW = MAX_WIDTH;
        $newH = (int)round($origH * $ratio);
        $dstImage = imagecreatetruecolor($newW, $newH);
        imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        imagedestroy($srcImage);
        $srcImage = $dstImage;
    }

    $saved = imagewebp($srcImage, $filepath, WEBP_QUALITY);
    imagedestroy($srcImage);

    if (!$saved) {
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save file']);
            exit;
        }
    }
} else {
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save file']);
        exit;
    }
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$domain = $protocol . '://' . $_SERVER['HTTP_HOST'];
$url = $domain . '/uploads/products/' . rawurlencode($filename);

echo json_encode([
    'success' => true,
    'filename' => $filename,
    'url' => $url
]);
