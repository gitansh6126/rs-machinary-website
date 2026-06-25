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
if (!$input) {
    $input = $_POST;
}

$filename = isset($input['filename']) ? basename($input['filename']) : '';

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Filename required']);
    exit;
}

$filePath = __DIR__ . '/uploads/' . $filename;

if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'File not found']);
    exit;
}

$realBase = realpath(__DIR__ . '/uploads');
$realFile = realpath($filePath);
if ($realFile === false || strpos($realFile, $realBase) !== 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied']);
    exit;
}

if (unlink($filePath)) {
    echo json_encode(['success' => true, 'message' => 'File deleted', 'filename' => $filename]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to delete file']);
}
