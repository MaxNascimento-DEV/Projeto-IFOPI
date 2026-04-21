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

    // REMOVED: getDisciplinas() - no more discipline concept


    public function getStudents($params = []) {
        $sql = "SELECT 
            c.id, c.nome, c.sobrenome, c.numero, c.tipo, c.created_at,
            nf.nota, nf.faltas
            FROM cadastro c 
            LEFT JOIN (
                SELECT cadastro_id, nota, faltas 
                FROM notas_faltas 
                WHERE id = (
                    SELECT MAX(id) FROM notas_faltas nf2 
                    WHERE nf2.cadastro_id = notas_faltas.cadastro_id
                )
            ) nf ON c.id = nf.cadastro_id
            WHERE c.tipo = 'aluno'";
        
        $paramsQuery = [];
        $types = '';

        if (!empty($params['search'])) {
            $sql .= " AND (c.nome LIKE ? OR c.sobrenome LIKE ? OR c.numero LIKE ?)";
            $search = '%' . trim($params['search']) . '%';
            $paramsQuery = [$search, $search, $search];
            $types = 'sss';
        }

        $sql .= " ORDER BY c.nome ASC";

        $stmt = DB::query($sql, $types, $paramsQuery);
        $result = $stmt->get_result();
        $alunos = [];
        while ($row = $result->fetch_assoc()) {
            $row['nome_completo'] = trim($row['nome'] . ' ' . $row['sobrenome']);
            $alunos[] = $row;
        }
        echo json_encode([
            'success' => true, 
            'alunos' => $alunos
        ]);
    }

    public function updateGrade($aluno_id, $nota, $faltas) {
        $sql = "INSERT INTO notas_faltas (cadastro_id, nota, faltas, data) 
                VALUES (?, ?, ?, CURDATE()) 
                ON DUPLICATE KEY UPDATE nota = VALUES(nota), faltas = VALUES(faltas), data = VALUES(data)";
        $stmt = DB::query($sql, 'idi', [$aluno_id, $nota, $faltas]);
        if ($stmt && $stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'mensagem' => 'Nota/falta atualizada']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => 'Erro ao atualizar']);
        }
    }

}
?>

