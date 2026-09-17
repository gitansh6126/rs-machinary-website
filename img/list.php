<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$scanDir = __DIR__ . '/uploads/';
$images = [];

if (is_dir($scanDir)) {
    $iterator = new FilesystemIterator($scanDir, FilesystemIterator::SKIP_DOTS);
    foreach ($iterator as $file) {
        if (!$file->isFile()) continue;
        if (strtolower($file->getExtension()) !== 'webp') continue;
        $filename = $file->getFilename();
        $images[] = [
            'filename'  => $filename,
            'url'       => 'https://img.darkgrey-fish-357096.hostingersite.com/uploads/' . rawurlencode($filename),
            'size'      => $file->getSize(),
            'size_formatted' => formatBytes($file->getSize()),
            'modified'  => $file->getMTime(),
        ];
    }
}

usort($images, function ($a, $b) {
    return $b['modified'] - $a['modified'];
});

echo json_encode([
    'success' => true,
    'data'    => $images,
    'total'   => count($images)
]);

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    return round($bytes / pow(1024, $pow), $precision) . ' ' . $units[$pow];
}
