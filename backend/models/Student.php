<?php
class Student {
    private $conn;
    private $cadastroTable = "cadastro";
    private $notasTable = "notas_faltas";

    public $id, $nome, $numero, $tipo;
    public function __construct($db) {
        $this->conn = $db;
    }

    // Get student by numero (matricula or CPF)
    public function getByNumero($numero) {
        $query = "SELECT id, nome, sobrenome, numero, tipo FROM {$this->cadastroTable} WHERE numero = :numero AND tipo = 'aluno' LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':numero', $numero);
        $stmt->execute();
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($student) {
            // Fetch notas/faltas
            $notasQuery = "SELECT * FROM {$this->notasTable} WHERE cadastro_id = :id ORDER BY data DESC";
            $notasStmt = $this->conn->prepare($notasQuery);
            $notasStmt->bindParam(':id', $student['id']);
            $notasStmt->execute();
            $student['notas_faltas'] = $notasStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $student ?: false;
    }

    // Add new nota/falta
    public function addNotasFaltas($cadastro_id, $disciplina, $nota, $faltas, $data) {
        // Validation
        $disciplina = trim(filter_var($disciplina, FILTER_SANITIZE_SPECIAL_CHARS));
        $nota = is_numeric($nota) ? (float)$nota : null;
        $faltas = max(0, (int)$faltas);
        $data = date('Y-m-d', strtotime($data));
        
        if (strlen($disciplina) < 2 || $faltas < 0) {
            return false;
        }
        
        $query = "INSERT INTO {$this->notasTable} (cadastro_id, disciplina, nota, faltas, data) VALUES (:cid, :disc, :nota, :faltas, :data)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':cid', $cadastro_id, PDO::PARAM_INT);
        $stmt->bindParam(':disc', $disciplina);
        $stmt->bindParam(':nota', $nota);
        $stmt->bindParam(':faltas', $faltas, PDO::PARAM_INT);
        $stmt->bindParam(':data', $data);
        return $stmt->execute();
    }

    // Update existing nota/falta
    public function updateNotasFaltas($id, $nota, $faltas) {
        $query = "UPDATE {$this->notasTable} SET nota = :nota, faltas = :faltas WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nota', $nota);
        $stmt->bindParam(':faltas', $faltas);
        return $stmt->execute();
    }
}
?>

