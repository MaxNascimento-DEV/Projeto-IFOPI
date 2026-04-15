<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'ong_ifopi';
    private $username = 'root';
    private $password = 'unibrainter4';
    public $conn;

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username, $this->password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            return $this->conn;
        } catch(PDOException $e) {
            error_log("DB Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["error" => "Erro interno do servidor"]);
            exit;
        }
    }
}
?>

