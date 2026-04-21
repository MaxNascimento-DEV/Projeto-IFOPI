<?php
header("Content-Type: application/json; charset=utf-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/security.php';
require_once 'config/db.php';
require_once 'controllers/ProfessorController.php';

$controller = new ProfessorController();

$method = $_SERVER['REQUEST_METHOD'];
$dados = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $controller->getStudents($_GET); // Direct all students, optional search
} elseif ($method === 'POST') {
    $aluno_id = $dados['aluno_id'] ?? 0;
    $nota = $dados['nota'] ?? 0;
    $faltas = $dados['faltas'] ?? 0;
    $controller->updateGrade($aluno_id, $nota, $faltas); // No disciplina
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "mensagem" => "GET/POST only"]);
}

?>

