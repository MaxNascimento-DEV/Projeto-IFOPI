<?php
header("Content-Type: application/json; charset=utf-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// require_once 'config/security.php'; // Disabled for public latest nota
require_once 'config/database.php';
require_once 'controllers/AlunoController.php';

$controller = new AlunoController();

$method = $_SERVER['REQUEST_METHOD'];
$numero = $_SESSION['user']['numero'] ?? $_GET['numero'] ?? '';

if ($method === 'GET') {
    $controller->getGrades($numero);
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "mensagem" => "GET only"]);
}
?>

