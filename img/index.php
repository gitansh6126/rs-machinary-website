<?php
$file = __DIR__ . '/index.html';
if (file_exists($file)) {
    readfile($file);
    exit;
}
http_response_code(500);
echo 'Error: index.html not found';
