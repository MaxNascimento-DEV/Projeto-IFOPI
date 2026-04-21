<?php
// FIXED: Proper action parsing + controller method handling
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config/security.php';
require_once 'config/db.php';
require_once 'controllers/AdminController.php';

try {
    $controller = new AdminController();
} catch (Exception $e) {
    http_response_code(403);
    echo json_encode(['success' => false, 'mensagem' => 'Auth failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');
$dados = json_decode($input, true) ?: [];
$action = $dados['action'] ?? $_GET['action'] ?? '';

error_log("DEBUG ROUTE: method=$method, action='$action'");

$handled = false;

switch ($method) {
    case 'GET':
        if ($action === 'users') {
            $query = $_GET['q'] ?? '';
            $controller->getUsers($query);
            $handled = true;
        } elseif ($action === 'user') {
            $id = (int)($_GET['id'] ?? 0);
            $controller->getUser($id);
            $handled = true;
        } elseif ($action === 'students') {
            $controller->getUsersStudents($_GET);
            $handled = true;
        }
        break;
        
    case 'POST':
        if ($action === 'create-student') {
            $controller->createStudent($dados);
            $handled = true;
        } elseif ($action === 'create-teacher') {
            $controller->createTeacher($dados);
            $handled = true;
        } elseif ($action === 'update-user') {
            $controller->updateUser($dados);
            $handled = true;
        } elseif ($action === 'toggle-status') {
            $controller->toggleStatus($dados);
            $handled = true;
        }
        break;
        
    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        $controller->deleteUser($id);
        $handled = true;
        break;
}

if (!$handled) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'mensagem' => "Action '$action' inválida para method $method",
        'debug' => ['input' => $input, 'dados' => $dados]
    ]);
}
?>


