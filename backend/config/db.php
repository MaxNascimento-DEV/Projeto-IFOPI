<?php
/**
 * MySQLi Database Connection - ONG IFOPI
 * Charset: utf8mb4, Prepared statements ready
 */

class DB {
    private static $instance = null;
    private $conn;
    private $host = 'localhost';
    private $port = 3306;
    private $db_name = 'ong_ifopi';
    private $username = 'root';
    private $password = 'unibrainter4';

    private function __construct() {
        $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name, $this->port);
        if ($this->conn->connect_error) {
            error_log("DB Connection failed: " . $this->conn->connect_error);
            http_response_code(500);
            echo json_encode(["error" => "Erro de conexão com banco"]);
            exit;
        }
        $this->conn->set_charset('utf8mb4');
    }

    public static function getConnection() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance->conn;
    }

    // Helper for prepared statements
    public static function query($sql, $types = '', $params = []) {
        $conn = self::getConnection();
        $stmt = $conn->prepare($sql);
        if (!$stmt) return false;

        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        return $stmt;
    }
}
?>
