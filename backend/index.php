<?php
require_once 'config/security.php';

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Static files from public/
if (preg_match('/\.(html|css|js|png|jpg|ico)$/', $path)) {
    $file = '../public' . $path; // Serve from parent public/
    $file = str_replace('//', '/', $file);
    if (file_exists($file)) {
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        if ($ext === 'html') {
            header('Content-Type: text/html; charset=utf-8');
        } elseif ($ext === 'css') {
            header('Content-Type: text/css; charset=utf-8');
        } elseif ($ext === 'js') {
            header('Content-Type: application/javascript; charset=utf-8');
        }
        readfile($file);
        exit;
    }
}

// Root → frontend
if ($path === '/' || $path === '') {
    header('Content-Type: text/html; charset=utf-8');
readfile('index.html');
    exit;
}

// API routes - FIXED ROUTING for /backend/routes/xxx.php
header('Content-Type: application/json; charset=utf-8');

$apiPath = str_replace('/backend/routes/', '', $path);
$routeFile = null;

if (strpos($apiPath, 'auth.php') !== false) {
    $routeFile = 'routes/auth.php';
} elseif (strpos($apiPath, 'admin.php') !== false) {
    $routeFile = 'routes/admin.php';
} elseif (strpos($apiPath, 'professor.php') !== false) {
    $routeFile = 'routes/professor.php';
} elseif (strpos($apiPath, 'aluno.php') !== false) {
    $routeFile = 'routes/aluno.php';
}


if ($routeFile && file_exists($routeFile)) {
    require_once $routeFile;
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found: ' . $path]);
}
?>

