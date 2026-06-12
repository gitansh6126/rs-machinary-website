<?php
/**
 * RS Machinery - Local Image Upload Handler
 *
 * Accepts authenticated image uploads from admin panel.
 * Validates, optimizes, generates thumbnails, saves to assets/product-images/.
 *
 * POST params:
 *   image       - file upload (multipart/form-data)
 *   product_name - product name for slug generation
 *   variant     - MAIN, GAL01, GAL02, etc.
 *
 * Headers:
 *   X-Upload-Key: secret key for authentication
 *
 * Response: JSON { success: true/false, data: { ... }, code: "...", error: "..." }
 */

// ─── CONFIG ───────────────────────────────────────────────────────────────────

define('UPLOAD_KEY', 'rsm-upload-key-change-me');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB
define('ALLOWED_MIMES', ['image/jpeg', 'image/png', 'image/webp']);
define('MAX_WIDTH', 1600);
define('JPEG_QUALITY', 80);
define('WEBP_QUALITY', 80);
define('THUMB_MAX_WIDTH', 400);

// Target directory (relative to this script's location)
define('TARGET_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'product-images' . DIRECTORY_SEPARATOR);

// ─── CORS ─────────────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Upload-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

$uploadKey = $_SERVER['HTTP_X_UPLOAD_KEY'] ?? '';
if ($uploadKey !== UPLOAD_KEY) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'code' => 'UNAUTHORIZED',
        'error' => 'Invalid upload key'
    ]);
    exit;
}

// ─── VALIDATE REQUEST ─────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'code' => 'METHOD_NOT_ALLOWED', 'error' => 'POST required']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = $_FILES['image']['error'] ?? -1;
    $messages = [
        UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit',
        UPLOAD_ERR_FORM_SIZE  => 'File exceeds form size limit',
        UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Server temp directory missing',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
    ];
    $msg = $messages[$errorCode] ?? 'Upload failed with code ' . $errorCode;
    echo json_encode(['success' => false, 'code' => 'UPLOAD_ERROR', 'error' => $msg]);
    exit;
}

$file = $_FILES['image'];
$productName = trim($_POST['product_name'] ?? '');
$variant = trim($_POST['variant'] ?? 'MAIN');

if (!$productName) {
    echo json_encode(['success' => false, 'code' => 'MISSING_NAME', 'error' => 'Product name is required']);
    exit;
}

if (!preg_match('/^(MAIN|GAL\d{2}|SPEC\d{2}|THUMB|BANNER)$/', $variant)) {
    $variant = 'MAIN';
}

// ─── FILE VALIDATION ──────────────────────────────────────────────────────────

// Size check
if ($file['size'] > MAX_FILE_SIZE) {
    echo json_encode([
        'success' => false,
        'code' => 'FILE_TOO_LARGE',
        'error' => 'File exceeds ' . (MAX_FILE_SIZE / 1024 / 1024) . ' MB limit'
    ]);
    exit;
}

// Real MIME check using finfo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$realMime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($realMime, ALLOWED_MIMES, true)) {
    echo json_encode([
        'success' => false,
        'code' => 'INVALID_IMAGE',
        'error' => 'Unsupported image format. Allowed: JPG, PNG, WebP'
    ]);
    exit;
}

// Image dimension check using getimagesize
$imageInfo = @getimagesize($file['tmp_name']);
if (!$imageInfo) {
    echo json_encode([
        'success' => false,
        'code' => 'INVALID_IMAGE',
        'error' => 'File is not a valid image'
    ]);
    exit;
}

// ─── GENERATE FILENAME ────────────────────────────────────────────────────────

function generateSlug($str) {
    $slug = mb_strtolower(trim($str), 'UTF-8');
    $slug = preg_replace('/[^\w\s-]/u', '', $slug);
    $slug = preg_replace('/[\s_]+/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    return substr($slug, 0, 100);
}

$slug = generateSlug($productName);

// Determine extension from real MIME
$extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$ext = $extMap[$realMime] ?? 'jpg';

$baseName = $slug . '_' . $variant;
$fileName = $baseName . '.' . $ext;
$filePath = TARGET_DIR . $fileName;

// If file exists, append timestamp to avoid overwrite
if (file_exists($filePath)) {
    $baseName = $slug . '_' . $variant . '_' . time();
    $fileName = $baseName . '.' . $ext;
    $filePath = TARGET_DIR . $fileName;
}

// ─── ENSURE TARGET DIRECTORY ──────────────────────────────────────────────────

if (!is_dir(TARGET_DIR)) {
    if (!mkdir(TARGET_DIR, 0755, true)) {
        echo json_encode(['success' => false, 'code' => 'DIR_FAIL', 'error' => 'Failed to create upload directory']);
        exit;
    }
}

// ─── IMAGE OPTIMIZATION ───────────────────────────────────────────────────────

function loadImage($path, $mime) {
    switch ($mime) {
        case 'image/jpeg': return @imagecreatefromjpeg($path);
        case 'image/png':  return @imagecreatefrompng($path);
        case 'image/webp': return @imagecreatefromwebp($path);
        default: return false;
    }
}

function saveOptimizedImage($srcPath, $destPath, $mime, $maxWidth, $quality) {
    $srcImage = loadImage($srcPath, $mime);
    if (!$srcImage) return false;

    $origW = imagesx($srcImage);
    $origH = imagesy($srcImage);

    // Resize if wider than max
    if ($origW > $maxWidth) {
        $ratio = $maxWidth / $origW;
        $newW = $maxWidth;
        $newH = (int)round($origH * $ratio);

        $dstImage = imagecreatetruecolor($newW, $newH);

        // Preserve transparency for PNG
        if ($mime === 'image/png') {
            imagealphablending($dstImage, false);
            imagesavealpha($dstImage, true);
        }

        imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        imagedestroy($srcImage);
        $srcImage = $dstImage;
    }

    // Determine output format and quality
    $outMime = $mime;
    $outQuality = $quality;

    // Save WEBP as WEBP, convert PNG/JPEG to WEBP for thumbnails
    $ext = strtolower(pathinfo($destPath, PATHINFO_EXTENSION));

    $result = false;
    if ($ext === 'webp' || $outMime === 'image/webp') {
        $result = imagewebp($srcImage, $destPath, $outQuality);
    } elseif ($ext === 'jpg' || $ext === 'jpeg') {
        $result = imagejpeg($srcImage, $destPath, $outQuality);
    } elseif ($ext === 'png') {
        $result = imagepng($srcImage, $destPath, (int)round(9 - ($outQuality / 11)));
    }

    imagedestroy($srcImage);
    return $result;
}

// Upload original (optimized)
$optimized = saveOptimizedImage($file['tmp_name'], $filePath, $realMime, MAX_WIDTH, ($ext === 'webp' ? WEBP_QUALITY : JPEG_QUALITY));
if (!$optimized) {
    // Fallback: move uploaded file directly
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        echo json_encode(['success' => false, 'code' => 'SAVE_FAIL', 'error' => 'Failed to save uploaded file']);
        exit;
    }
}

// ─── THUMBNAIL GENERATION ────────────────────────────────────────────────────

$thumbFileName = $baseName . '_thumb.webp';
$thumbFilePath = TARGET_DIR . $thumbFileName;

$thumbCreated = saveOptimizedImage($file['tmp_name'], $thumbFilePath, $realMime, THUMB_MAX_WIDTH, WEBP_QUALITY);

// ─── RELATIVE URLS ───────────────────────────────────────────────────────────

$relativeUrl = 'assets/product-images/' . $fileName;
$thumbUrl = $thumbCreated ? 'assets/product-images/' . $thumbFileName : $relativeUrl;

// ─── SUCCESS RESPONSE ─────────────────────────────────────────────────────────

echo json_encode([
    'success' => true,
    'data' => [
        'url' => $relativeUrl,
        'thumbnail' => $thumbUrl,
        'filename' => $fileName,
        'size' => filesize($filePath)
    ]
]);
