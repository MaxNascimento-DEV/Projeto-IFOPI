<?php
require_once 'config/db.php';

class Auth {
    private $conn;
    private $table = "cadastro";

    public $id, $nome, $sobrenome, $email, $numero, $senha, $tipo;

    public function __construct($db = null) {
        $this->conn = $db ?: DB::getConnection();
    }

    public function validarDados() {
        $this->nome = trim(htmlspecialchars($this->nome));
        $this->sobrenome = trim(htmlspecialchars($this->sobrenome ?? ''));
        $this->email = filter_var($this->email, FILTER_SANITIZE_EMAIL);
        $this->numero = preg_replace('/[^0-9a-zA-Z]/', '', $this->numero);
        
        if (strlen($this->nome) < 2) return false;
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) return false;
        if (strlen($this->senha) < 6) return false;
        if (!in_array($this->tipo, ['aluno', 'professor', 'admin'])) return false;
        return true;
    }

    
    public function criar() {
        if (!$this->validarDados()) return false;
        
        $senhaHash = password_hash($this->senha, PASSWORD_DEFAULT);
        $sql = "INSERT INTO {$this->table} (nome, sobrenome, cpf, email, numero, senha, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = DB::query($sql, 'sssssss', [$this->nome, $this->sobrenome, $this->cpf ?? '', $this->email, $this->numero, $senhaHash, $this->tipo]);
        
        return $stmt && $stmt->affected_rows > 0;
    }

    public function login($username, $senha_plain) {
        $sql = "SELECT id, nome, sobrenome, email, numero, senha, tipo FROM {$this->table} WHERE email = ? OR numero = ? LIMIT 1";
        $stmt = DB::query($sql, 'ss', [$username, $username]);
        
        if (!$stmt) return false;
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row && password_verify($senha_plain, $row['senha'])) {
            unset($row['senha']);
            return $row;
        }
        return false;
    }

    public function usernameExists($username) {
        $sql = "SELECT id FROM {$this->table} WHERE email = ? OR numero = ? LIMIT 1";
        $stmt = DB::query($sql, 'ss', [$username, $username]);
        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }
}
?>


