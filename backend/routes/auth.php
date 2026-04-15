<?php
header("Content-Type: application/json; charset=utf-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


require_once 'config/security.php';


require_once 'controllers/AuthController.php';

$controller = new AuthController();

$method = $_SERVER['REQUEST_METHOD'];
$dados = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    if ($action === 'login') {
        $controller->login($dados);
    }
    // register removed admin only
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "mensagem" => "POST only for /auth/login"]);
}
?>

