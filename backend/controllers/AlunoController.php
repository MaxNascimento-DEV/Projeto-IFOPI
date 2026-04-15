<?php
require_once 'config/security.php';
require_once 'config/db.php';

class AlunoController {
    private $conn;

    public function __construct() {
        if (!isset($_SESSION['user']) || $_SESSION['user']['tipo'] !== 'aluno') {
            http_response_code(403);
            echo json_encode(['success' => false, 'mensagem' => 'Acesso negado a aluno']);
            exit;
        }
        $this->conn = DB::getConnection();
    }

    public function getGrades($numero) {
        $sql = "SELECT disciplina, AVG(nota) as media, SUM(faltas) as total_faltas, COUNT(*) as registros 
                FROM notas_faltas nf 
                WHERE cadastro_id = (SELECT id FROM cadastro WHERE numero = ?)
                GROUP BY disciplina";
        $stmt = DB::query($sql, 's', [$numero]);
        $result = $stmt->get_result();
        $dados = [];
        while ($row = $result->fetch_assoc()) {
            $row['status'] = $row['media'] >= 7 ? 'aprovado' : ($row['media'] >= 5 ? 'recuperação' : 'reprovado');
            $dados[] = $row;
        }
        echo json_encode(['success' => true, 'notas' => $dados]);
    }
}
?>

