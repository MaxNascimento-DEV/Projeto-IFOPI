<?php
header("Content-Type: application/json; charset=utf-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/security.php';
require_once 'config/db.php';
require_once 'controllers/AdminController.php';

$controller = new AdminController();

$method = $_SERVER['REQUEST_METHOD'];
$dados = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'users') {
            $query = $_GET['q'] ?? '';
            $controller->getUsers($query);
        } elseif ($action === 'user') {
            $id = $_GET['id'] ?? 0;
            $controller->getUser($id);
        } elseif ($action === 'students') {
            $controller->getStudents($_GET);
        }
        break;
    case 'POST':
        if ($action === 'create-student') {
            $controller->createStudent($dados);
        } elseif ($action === 'create-teacher') {
            $controller->createTeacher($dados);
        } elseif ($action === 'update-user') {
            $controller->updateUser($dados);
        } elseif ($action === 'toggle-status') {
            $controller->toggleStatus($dados);
        }
        break;
    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $controller->deleteUser($id);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'mensagem' => 'Method not allowed']);
}
?>

