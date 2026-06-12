<?php
/**
 * RS Machinery - Basic JSON-file-based API
 *
 * Replaces Google Apps Script backend.
 * Reads/writes JSON files in data/ directory.
 *
 * Routes (via ?route= param):
 *   getProducts    GET  - list products (public: active only, respects pause)
 *   getProduct     GET  - single product by id or slug
 *   addProduct     POST - create product
 *   updateProduct  POST - update product
 *   deleteProduct  POST - soft-delete (set active=FALSE)
 *   getCategories  GET  - list categories
 *   addCategory    POST - create category
 *   updateCategory POST - update category
 *   deleteCategory POST - soft-delete category
 *   getDashboard   POST - dashboard stats
 *   getInquiries   GET  - list inquiries
 *   updateInquiry  POST - update inquiry status
 *   getSetting     GET  - get a setting by key
 *   updateSetting  POST - update a setting
 *   login          POST - login
 *   changePassword POST - change password
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

define('DATA_DIR', __DIR__ . '/../data');
define('ADMIN_HASH', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');

require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$route  = $_REQUEST['route'] ?? '';

try {
    switch ($route) {
        case 'getProducts':
            if ($method === 'GET') {
                exit_json(handleGetProducts());
            }
            break;

        case 'addInquiry':
            if ($method === 'POST') {
                exit_json(handleAddInquiry());
            }
            break;

        case 'getProduct':
            if ($method === 'GET') {
                exit_json(handleGetProduct());
            }
            break;

        case 'addProduct':
            if ($method === 'POST') {
                exit_json(handleAddProduct());
            }
            break;

        case 'updateProduct':
            if ($method === 'POST') {
                exit_json(handleUpdateProduct());
            }
            break;

        case 'deleteProduct':
            if ($method === 'POST') {
                exit_json(handleDeleteProduct());
            }
            break;

        case 'getCategories':
            if ($method === 'GET') {
                exit_json(handleGetCategories());
            }
            break;

        case 'addCategory':
            if ($method === 'POST') {
                exit_json(handleAddCategory());
            }
            break;

        case 'updateCategory':
            if ($method === 'POST') {
                exit_json(handleUpdateCategory());
            }
            break;

        case 'deleteCategory':
            if ($method === 'POST') {
                exit_json(handleDeleteCategory());
            }
            break;

        case 'getDashboard':
            if ($method === 'POST') {
                exit_json(handleGetDashboard());
            }
            break;

        case 'getInquiries':
            if ($method === 'GET' || $method === 'POST') {
                exit_json(handleGetInquiries());
            }
            break;

        case 'updateInquiry':
            if ($method === 'POST') {
                exit_json(handleUpdateInquiry());
            }
            break;

        case 'getSetting':
            if ($method === 'GET') {
                exit_json(handleGetSetting());
            }
            break;

        case 'updateSetting':
            if ($method === 'POST') {
                exit_json(handleUpdateSetting());
            }
            break;

        case 'login':
            if ($method === 'POST') {
                exit_json(handleLogin());
            }
            break;

        case 'changePassword':
            if ($method === 'POST') {
                exit_json(handleChangePassword());
            }
            break;

        default:
            json_error('Unknown route: ' . $route);
    }
    json_error('Method not allowed for route: ' . $route);

} catch (Exception $e) {
    json_error($e->getMessage());
}


// ─── HANDLERS ─────────────────────────────────────────────────────────────────

function handleGetProducts() {
    $paused = getSetting('products_paused');
    if ($paused === 'TRUE') {
        return success(['products' => [], 'total' => 0, 'page' => 1, 'limit' => 20, 'hasMore' => false]);
    }

    $all = read_json('products');
    $categoryId = $_GET['category_id'] ?? '';
    $search     = $_GET['search'] ?? '';
    $featured   = $_GET['featured'] ?? '';
    $page       = max(1, (int)($_GET['page'] ?? 1));
    $limit      = max(1, (int)($_GET['limit'] ?? 20));

    $filtered = array_filter($all, function ($p) {
        return ($p['active'] === true || $p['active'] === 'TRUE');
    });

    if ($featured === 'true' || $featured === 'TRUE') {
        $filtered = array_filter($filtered, function ($p) {
            return ($p['featured'] === true || $p['featured'] === 'TRUE');
        });
    }

    if ($categoryId) {
        $filtered = array_filter($filtered, function ($p) use ($categoryId) {
            return (string)$p['category_id'] === (string)$categoryId;
        });
    }

    if ($search) {
        $q = mb_strtolower($search);
        $filtered = array_filter($filtered, function ($p) use ($q) {
            $name = mb_strtolower($p['name'] ?? '');
            $desc = mb_strtolower($p['short_description'] ?? '');
            return strpos($name, $q) !== false || strpos($desc, $q) !== false;
        });
    }

    usort($filtered, function ($a, $b) {
        $ao = (int)($a['sort_order'] ?? 0);
        $bo = (int)($b['sort_order'] ?? 0);
        if ($ao !== $bo) return $ao - $bo;
        return strcmp($a['name'] ?? '', $b['name'] ?? '');
    });

    $filtered = array_values($filtered);
    $total = count($filtered);
    $start = ($page - 1) * $limit;
    $paged = array_slice($filtered, $start, $limit);
    $hasMore = ($start + $limit) < $total;

    return success(['products' => $paged, 'total' => $total, 'page' => $page, 'limit' => $limit, 'hasMore' => $hasMore]);
}

function handleGetProduct() {
    $id   = $_GET['id'] ?? '';
    $slug = $_GET['slug'] ?? '';
    $all  = read_json('products');

    $product = null;
    if ($id) {
        foreach ($all as $p) {
            if ((string)$p['id'] === (string)$id) { $product = $p; break; }
        }
    } elseif ($slug) {
        foreach ($all as $p) {
            if ($p['slug'] === $slug) { $product = $p; break; }
        }
    }

    if (!$product) {
        return error('Product not found', 404);
    }

    // Parse JSON string fields
    foreach (['specifications', 'variations', 'gallery_images'] as $field) {
        if (isset($product[$field]) && is_string($product[$field])) {
            $parsed = json_decode($product[$field], true);
            $product[$field] = $parsed !== null ? $parsed : [];
        }
    }

    return success(['product' => $product]);
}

function handleAddProduct() {
    $products = read_json('products');
    $now = date('c');
    $id = 1;
    if (count($products) > 0) {
        $ids = array_map(function ($p) { return (int)$p['id']; }, $products);
        $id = max($ids) + 1;
    }

    $name = $_POST['name'] ?? '';

    $product = [
        'id'                => $id,
        'name'              => $name,
        'slug'              => $_POST['slug'] ?? generateSlug($name),
        'category_id'       => $_POST['category_id'] ?? '',
        'seo_title'         => $_POST['seo_title'] ?? '',
        'seo_description'   => $_POST['seo_description'] ?? '',
        'short_description' => $_POST['short_description'] ?? '',
        'description'       => $_POST['description'] ?? '',
        'image'             => $_POST['image'] ?? '',
        'gallery_images'    => $_POST['gallery_images'] ?? '[]',
        'specifications'    => $_POST['specifications'] ?? '[]',
        'variations'        => $_POST['variations'] ?? '[]',
        'featured'          => $_POST['featured'] ?? 'FALSE',
        'active'            => $_POST['active'] ?? 'TRUE',
        'sort_order'        => $_POST['sort_order'] ?? '0',
        'created_at'        => $now,
        'updated_at'        => $now,
    ];

    $products[] = $product;
    write_json('products', $products);
    return success(['product' => $product]);
}

function handleUpdateProduct() {
    $id       = $_POST['id'] ?? '';
    $products = read_json('products');
    $found    = false;
    $now      = date('c');

    foreach ($products as &$p) {
        if ((string)$p['id'] === (string)$id) {
            foreach (['name','slug','category_id','seo_title','seo_description','short_description','description','image','gallery_images','specifications','variations','sort_order'] as $field) {
                if (isset($_POST[$field])) {
                    $p[$field] = $_POST[$field];
                }
            }
            if (isset($_POST['featured'])) {
                $p['featured'] = $_POST['featured'];
            }
            if (isset($_POST['active'])) {
                $p['active'] = $_POST['active'];
            }
            $p['updated_at'] = $now;
            $found = true;
            break;
        }
    }

    if (!$found) {
        return error('Product not found', 404);
    }

    write_json('products', $products);
    return success(['product' => $p]);
}

function handleDeleteProduct() {
    $id       = $_POST['id'] ?? '';
    $products = read_json('products');
    $found    = false;

    foreach ($products as &$p) {
        if ((string)$p['id'] === (string)$id) {
            $p['active'] = 'FALSE';
            $p['updated_at'] = date('c');
            $found = true;
            break;
        }
    }

    if (!$found) {
        return error('Product not found', 404);
    }

    write_json('products', $products);
    return success(['message' => 'Product deactivated']);
}

function handleGetCategories() {
    $all = read_json('categories');
    $active = array_values(array_filter($all, function ($c) {
        return ($c['active'] !== 'FALSE' && $c['active'] !== false);
    }));
    return success(['categories' => $active]);
}

function handleAddCategory() {
    $categories = read_json('categories');
    $id = 1;
    if (count($categories) > 0) {
        $ids = array_map(function ($c) { return (int)$c['id']; }, $categories);
        $id = max($ids) + 1;
    }

    $cat = [
        'id'          => $id,
        'name'        => $_POST['name'] ?? '',
        'slug'        => $_POST['slug'] ?? '',
        'description' => $_POST['description'] ?? '',
        'sort_order'  => $_POST['sort_order'] ?? '0',
        'active'      => 'TRUE',
        'created_at'  => date('c'),
        'updated_at'  => date('c'),
    ];

    $categories[] = $cat;
    write_json('categories', $categories);
    return success(['category' => $cat]);
}

function handleUpdateCategory() {
    $id         = $_POST['id'] ?? '';
    $categories = read_json('categories');
    $found      = false;

    foreach ($categories as &$c) {
        if ((string)$c['id'] === (string)$id) {
            foreach (['name','slug','description','sort_order'] as $field) {
                if (isset($_POST[$field])) {
                    $c[$field] = $_POST[$field];
                }
            }
            $c['updated_at'] = date('c');
            $found = true;
            break;
        }
    }

    if (!$found) return error('Category not found', 404);
    write_json('categories', $categories);
    return success(['category' => $c]);
}

function handleDeleteCategory() {
    $id         = $_POST['id'] ?? '';
    $categories = read_json('categories');
    $found      = false;

    foreach ($categories as &$c) {
        if ((string)$c['id'] === (string)$id) {
            $c['active'] = 'FALSE';
            $c['updated_at'] = date('c');
            $found = true;
            break;
        }
    }

    if (!$found) return error('Category not found', 404);
    write_json('categories', $categories);
    return success(['message' => 'Category deactivated']);
}

function handleGetDashboard() {
    $products   = read_json('products');
    $categories = read_json('categories');
    $inquiries  = read_json('inquiries');

    $activeProducts  = 0;
    $featuredProducts = 0;
    foreach ($products as $p) {
        $isActive = ($p['active'] === true || $p['active'] === 'TRUE');
        if ($isActive) $activeProducts++;
        if ($isActive && ($p['featured'] === true || $p['featured'] === 'TRUE')) $featuredProducts++;
    }

    $activeCats = 0;
    foreach ($categories as $c) {
        if ($c['active'] !== 'FALSE' && $c['active'] !== false) $activeCats++;
    }

    $newInquiries = 0;
    foreach ($inquiries as $inq) {
        if (($inq['status'] ?? 'new') === 'new') $newInquiries++;
    }

    $recent = array_slice(array_reverse($inquiries), 0, 5);

    return success([
        'activeProducts'   => $activeProducts,
        'featuredProducts' => $featuredProducts,
        'totalProducts'    => count($products),
        'activeCategories' => $activeCats,
        'newInquiries'     => $newInquiries,
        'totalInquiries'   => count($inquiries),
        'recentInquiries'  => $recent,
    ]);
}

function handleAddInquiry() {
    $name    = $_POST['name'] ?? '';
    $phone   = $_POST['phone'] ?? '';
    $product = $_POST['product'] ?? '';

    if (!$name || !$phone) {
        return error('Name and phone are required');
    }

    $inquiries = read_json('inquiries');
    $id = 1;
    if (count($inquiries) > 0) {
        $ids = array_map(function ($inq) { return (int)$inq['id']; }, $inquiries);
        $id = max($ids) + 1;
    }

    $inquiry = [
        'id'         => $id,
        'name'       => $name,
        'phone'      => $phone,
        'product'    => $product,
        'status'     => 'new',
        'created_at' => date('c'),
        'updated_at' => date('c'),
    ];

    $inquiries[] = $inquiry;
    write_json('inquiries', $inquiries);
    return success(['message' => 'Inquiry submitted']);
}

function handleGetInquiries() {
    $inquiries = read_json('inquiries');
    return success(['inquiries' => $inquiries]);
}

function handleUpdateInquiry() {
    $id        = $_POST['id'] ?? '';
    $status    = $_POST['status'] ?? '';
    $inquiries = read_json('inquiries');
    $found     = false;

    foreach ($inquiries as &$inq) {
        if ((string)$inq['id'] === (string)$id) {
            $inq['status'] = $status;
            $inq['updated_at'] = date('c');
            $found = true;
            break;
        }
    }

    if (!$found) return error('Inquiry not found', 404);
    write_json('inquiries', $inquiries);
    return success(['message' => 'Status updated']);
}

function handleGetSetting() {
    $key = $_GET['key'] ?? '';
    if (!$key) return error('Key required');

    $publicKeys = ['site_name','phone','whatsapp','email','address','upload_key','products_paused'];
    if (!in_array($key, $publicKeys)) {
        return error('Access denied');
    }

    $settings = read_json('settings');
    $val = $settings[$key] ?? null;
    return success(['key' => $key, 'value' => $val]);
}

function handleUpdateSetting() {
    $key   = $_POST['key'] ?? '';
    $value = $_POST['value'] ?? '';

    if (!$key) return error('Key required');

    $allowedKeys = ['site_name','phone','whatsapp','email','address','upload_key','products_paused'];
    if (!in_array($key, $allowedKeys)) {
        return error('Cannot update this setting via API');
    }

    $settings = read_json('settings');
    $settings[$key] = $value;
    write_json('settings', $settings);
    return success(['key' => $key, 'value' => $value]);
}

function handleLogin() {
    $password = $_POST['password'] ?? '';
    if (!$password) return error('Password required');

    $settings = read_json('settings');
    $storedHash = $settings['admin_password_hash'] ?? null;

    if (!$storedHash) {
        $hash = hash('sha256', $password);
        $settings['admin_password_hash'] = $hash;
        $key = bin2hex(random_bytes(16));
        $settings['admin_key'] = $key;
        write_json('settings', $settings);
        return success(['admin_key' => $key, 'first_time' => true, 'message' => 'Password set successfully']);
    }

    if (hash('sha256', $password) !== $storedHash) {
        return error('Invalid password');
    }

    $key = $settings['admin_key'] ?? bin2hex(random_bytes(16));
    $settings['admin_key'] = $key;
    write_json('settings', $settings);
    return success(['admin_key' => $key]);
}

function handleChangePassword() {
    $current = $_POST['current_password'] ?? '';
    $newPass = $_POST['new_password'] ?? '';

    $settings = read_json('settings');
    $storedHash = $settings['admin_password_hash'] ?? '';

    if (hash('sha256', $current) !== $storedHash) {
        return error('Current password is incorrect');
    }

    $newHash = hash('sha256', $newPass);
    $newKey = bin2hex(random_bytes(16));
    $settings['admin_password_hash'] = $newHash;
    $settings['admin_key'] = $newKey;
    write_json('settings', $settings);

    return success(['admin_key' => $newKey, 'message' => 'Password changed successfully']);
}
