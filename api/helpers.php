<?php
/**
 * RS Machinery API - Helper functions
 */

function read_json($name) {
    $path = DATA_DIR . '/' . $name . '.json';
    if (!file_exists($path)) return [];
    $data = file_get_contents($path);
    $decoded = json_decode($data, true);
    return is_array($decoded) ? $decoded : [];
}

function write_json($name, $data) {
    $path = DATA_DIR . '/' . $name . '.json';
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function getSetting($key) {
    $settings = read_json('settings');
    return $settings[$key] ?? null;
}

function generateSlug($str) {
    $slug = mb_strtolower(trim($str), 'UTF-8');
    $slug = preg_replace('/[^\w\s-]/u', '', $slug);
    $slug = preg_replace('/[\s_]+/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    return substr($slug, 0, 100);
}

function success($data) {
    return ['success' => true, 'data' => $data];
}

function error($msg, $code = 400) {
    http_response_code($code);
    return ['success' => false, 'error' => $msg];
}

function exit_json($result) {
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error($msg, $code = 400) {
    http_response_code($code);
    exit_json(['success' => false, 'error' => $msg]);
}
