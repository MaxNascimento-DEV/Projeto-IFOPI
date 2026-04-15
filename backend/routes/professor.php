<?php
header("Content-Type: application/json; charset=utf-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/security.php';
require_once '../config/db.php';
require_once '../controllers/ProfessorController.php';

$controller = new ProfessorController();

$method = $_SERVER['REQUEST_METHOD'];
$dados = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $prof_id = $_SESSION['user']['id'] ?? 0;
    $action = $_GET['action'] ?? '';
    if ($action === 'disciplinas') {
        $disciplinas = $controller->getDisciplinas($prof_id);
        echo json_encode(['success' => true, 'disciplinas' => $disciplinas]);
    } else {
        $disciplina = $_GET['disciplina'] ?? '';
        $controller->getStudents($prof_id, $disciplina);
    }
} elseif ($method === 'POST') {
    $aluno_id = $dados['aluno_id'] ?? 0;
    $disciplina = $dados['disciplina'] ?? '';
    $nota = $dados['nota'] ?? 0;
    $faltas = $dados['faltas'] ?? 0;
    $controller->updateGrade($aluno_id, $disciplina, $nota, $faltas);
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "mensagem" => "GET/POST only"]);
}
?>

