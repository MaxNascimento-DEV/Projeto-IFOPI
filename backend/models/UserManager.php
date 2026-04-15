<?php
class UserManager {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getUserDisciplinas($id) {
        $sql = "SELECT disciplina FROM professor_disciplinas WHERE cadastro_id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function updateUserDisciplinas($id, $disciplinas) {
        // Delete old
        $sql = "DELETE FROM professor_disciplinas WHERE cadastro_id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        // Add new
        foreach ($disciplinas as $disc) {
            $sql = "INSERT INTO professor_disciplinas (cadastro_id, disciplina) VALUES (:id, :disc)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':disc', $disc);
            $stmt->execute();
        }
        return true;
    }
}
?>

