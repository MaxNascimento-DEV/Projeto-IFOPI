<?php
require_once 'Auth.php';

class Admin {
    private $conn;
    private $auth;

    public function __construct($db = null) {
        $this->conn = $db ?: DB::getConnection();
        $this->auth = new Auth($this->conn);
    }

    public function createProfessorWithDisciplinas($dados) {
        // Validation
        $nome = trim(htmlspecialchars($dados['nome'] ?? ''));
        $sobrenome = trim(htmlspecialchars($dados['sobrenome'] ?? ''));
        $email = filter_var($dados['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $numero = preg_replace('/[^0-9a-zA-Z]/', '', $dados['numero'] ?? '');
        $senha = $dados['senha'] ?? '';
        $disciplinas = $dados['disciplinas'] ?? [];
        
        if (strlen($nome) < 2 || strlen($senha) < 6 || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($disciplinas)) {
            return false;
        }
        
        if ($this->auth->usernameExists($email) || $this->auth->usernameExists($numero)) {
            return false;
        }

        // Manual transaction
        $this->conn->autocommit(false);
        
        try {
            // Create professor
            $this->auth->nome = $nome;
            $this->auth->sobrenome = $sobrenome;
            $this->auth->email = $email;
            $this->auth->numero = $numero;
            $this->auth->senha = $senha;
            $this->auth->tipo = 'professor';
            
            if (!$this->auth->criar()) {
                throw new Exception('Erro criar professor');
            }

            // Get LAST_INSERT_ID
            $sql = "SELECT LAST_INSERT_ID() as id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $result = $stmt->get_result();
            $profId = $result->fetch_assoc()['id'];

            // Add disciplinas
            foreach ($disciplinas as $disc) {
                $sql = "INSERT INTO professor_disciplinas (cadastro_id, disciplina) VALUES (?, ?)";
                $stmt = DB::query($sql, 'is', [$profId, trim($disc)]);
                if (!$stmt || $stmt->affected_rows == 0) {
                    throw new Exception('Erro adicionar disciplina: ' . $disc);
                }
            }

            $this->conn->commit();
            $this->conn->autocommit(true);
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->conn->autocommit(true);
            error_log($e->getMessage());
            return false;
        }
    }
}
?>

