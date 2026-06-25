<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$allowedDirs = ['products', 'variations', 'categories', 'brands', 'temp'];
$subdir = isset($_GET['subdir']) && in_array($_GET['subdir'], $allowedDirs) ? $_GET['subdir'] : 'products';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$page = max(1, isset($_GET['page']) ? (int)$_GET['page'] : 1);
$limit = max(1, min(100, isset($_GET['limit']) ? (int)$_GET['limit'] : 48));

$scanDir = __DIR__ . '/' . $subdir . '/';
$baseUrl = 'https://img.rsmachinary.in/' . $subdir . '/';

$images = [];

if (is_dir($scanDir)) {
    $iterator = new FilesystemIterator($scanDir, FilesystemIterator::SKIP_DOTS);
    foreach ($iterator as $file) {
        if (!$file->isFile()) continue;
        $ext = strtolower($file->getExtension());
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'])) continue;

        $filename = $file->getFilename();
        if ($search && stripos($filename, $search) === false) continue;

        $images[] = [
            'filename'   => $filename,
            'url'        => $baseUrl . rawurlencode($filename),
            'size'       => $file->getSize(),
            'size_formatted' => formatBytes($file->getSize()),
            'modified'   => $file->getMTime(),
            'modified_formatted' => date('Y-m-d H:i:s', $file->getMTime()),
            'ext'        => $ext
        ];
    }
}

usort($images, function ($a, $b) {
    return $b['modified'] - $a['modified'];
});

$total = count($images);
$totalPages = max(1, ceil($total / $limit));
$offset = ($page - 1) * $limit;
$paged = array_slice($images, $offset, $limit);

echo json_encode([
    'success'    => true,
    'data'       => $paged,
    'total'      => $total,
    'page'       => $page,
    'limit'      => $limit,
    'totalPages' => $totalPages,
    'subdir'     => $subdir
]);

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    return round($bytes / pow(1024, $pow), $precision) . ' ' . $units[$pow];
}
