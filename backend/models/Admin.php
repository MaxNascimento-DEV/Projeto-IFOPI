<?php
require_once 'Auth.php';

class Admin {
    private $conn;
    private $auth;

    public function __construct($db = null) {
        $this->conn = $db ?: DB::getConnection();
        $this->auth = new Auth($this->conn);
    }

    public function createProfessor($dados) {
        // Simple professor without disciplinas
        $nome = trim(htmlspecialchars($dados['nome'] ?? ''));
        $sobrenome = trim(htmlspecialchars($dados['sobrenome'] ?? ''));
        $email = filter_var($dados['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $senha = $dados['senha'] ?? '';
        
        if (strlen($nome) < 2 || strlen($senha) < 6 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        $this->auth->nome = $nome;
        $this->auth->sobrenome = $sobrenome;
        $this->auth->email = $email;
        $this->auth->senha = $senha;
        $this->auth->tipo = 'professor';
        
        return $this->auth->criar();
    }
}
?>


