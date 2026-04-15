<?php
require_once 'config/security.php';
require_once 'config/db.php';

class ProfessorController {
    private $conn;

    public function __construct() {
        if (!isset($_SESSION['user']) || $_SESSION['user']['tipo'] !== 'professor') {
            http_response_code(403);
            echo json_encode(['success' => false, 'mensagem' => 'Acesso negado a professor']);
            exit;
        }
        $this->conn = DB::getConnection();
    }

    public function getDisciplinas($prof_id) {
        $sql = "SELECT disciplina FROM professor_disciplinas WHERE cadastro_id = ?";
        $stmt = DB::query($sql, 'i', [$prof_id]);
        $result = $stmt->get_result();
        $disciplinas = [];
        while ($row = $result->fetch_assoc()) {
            $disciplinas[] = $row['disciplina'];
        }
        return $disciplinas;
    }

    public function getStudents($prof_id, $disciplina) {
        // Filter alunos by prof disciplina (vinculados via notas or turma)
        // Enhanced: JOIN matriculas/turmas for turma alunos, but simple: all alunos with notas in this disciplina
        $sql = "SELECT c.id, c.nome, c.sobrenome, c.numero, nf.nota, nf.faltas 
                FROM cadastro c 
                LEFT JOIN notas_faltas nf ON c.id = nf.cadastro_id AND nf.disciplina = ?
                WHERE c.tipo = 'aluno'";
        $stmt = DB::query($sql, 's', [$disciplina]);
        $result = $stmt->get_result();
        $alunos = [];
        while ($row = $result->fetch_assoc()) {
            $row['nome_completo'] = trim($row['nome'] . ' ' . $row['sobrenome']);
            $alunos[] = $row;
        }

        // Turma media, alunos risco
        $mediaTurma = array_reduce($alunos, function($sum, $a) { return $sum + ($a['nota'] ?? 0); }, 0) / max(1, count($alunos));
        $risco = array_filter($alunos, fn($a) => ($a['nota'] ?? 0) < 5);

        echo json_encode([
            'success' => true, 
            'alunos' => $alunos, 
            'media_turma' => round($mediaTurma, 1),
            'alunos_risco' => count($risco),
            'disciplina' => $disciplina
        ]);
    }

    public function updateGrade($aluno_id, $disciplina, $nota, $faltas) {
        $sql = "INSERT INTO notas_faltas (cadastro_id, disciplina, nota, faltas, data) 
                VALUES (?, ?, ?, ?, CURDATE()) 
                ON DUPLICATE KEY UPDATE nota = VALUES(nota), faltas = VALUES(faltas)";
        $stmt = DB::query($sql, 'sidi', [$aluno_id, $disciplina, $nota, $faltas]);
        if ($stmt && $stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'mensagem' => 'Nota/falta atualizada']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => 'Erro ao atualizar']);
        }
    }
}
?>

