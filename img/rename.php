<?php
error_reporting(0);
ini_set('display_errors', 0);

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

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = $_POST;

$filename = isset($input['filename']) ? basename($input['filename']) : '';
$newname  = isset($input['newname']) ? trim($input['newname']) : '';

if (empty($filename) || empty($newname)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'filename and newname required']);
    exit;
}

$newname = preg_replace('/[^a-zA-Z0-9_-]/', '', $newname);
if (empty($newname)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid name. Use letters, numbers, hyphens, underscores.']);
    exit;
}
$newname = substr($newname, 0, 48) . '.webp';

$uploadDir = __DIR__ . '/uploads/';
$oldPath = $uploadDir . $filename;
$newPath = $uploadDir . $newname;

$realBase = realpath($uploadDir);
$realOld = realpath($oldPath);
if ($realOld === false || strpos($realOld, $realBase) !== 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied']);
    exit;
}

if (!file_exists($oldPath)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'File not found']);
    exit;
}

if (file_exists($newPath)) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'A file with that name already exists']);
    exit;
}

if (rename($oldPath, $newPath)) {
    echo json_encode([
        'success'  => true,
        'filename' => $newname,
        'url'      => 'https://img.darkgrey-fish-357096.hostingersite.com/uploads/' . rawurlencode($newname)
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to rename file']);
}
