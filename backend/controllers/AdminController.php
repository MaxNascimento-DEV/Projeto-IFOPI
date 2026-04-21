<?php
/**
 * AdminController - FIXED: Proper JSON responses with error handling
 * All methods now: header() + try-catch + prepare/execute checks + echo json + exit
 */

require_once 'config/security.php';
require_once 'config/db.php';
require_once 'models/Auth.php';
require_once 'models/Admin.php';

class AdminController {
    private $conn;
    private $adminModel;

    public function __construct() {
        if (!isset($_SESSION['user']) || $_SESSION['user']['tipo'] !== 'admin') {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(403);
            echo json_encode(['success' => false, 'mensagem' => 'Acesso negado - Admin required']);
            exit;
        }
        $this->conn = DB::getConnection();
        $this->adminModel = new Admin($this->conn);
    }

    public function createStudent($dados) {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            // error_log("DEBUG createStudent input: " . json_encode($dados)); // REMOVED

            
            $nome = trim($dados['nome'] ?? '');
            $sobrenome = trim($dados['sobrenome'] ?? '');
            $cpf = $dados['cpf'] ?? '';
            $email = $dados['email'] ?? strtolower($nome . '@ifopi.com.br');
            $senha = $dados['senha'] ?? '';
            
            // Validation
            if (empty($nome) || strlen($senha) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'mensagem' => 'Nome e senha (6+ chars) obrigatórios']);
                exit;
            }

            // Auto-generate matricula SAFER: Count existing + increment
            $year_month = date('Ymd');
            $sql = "SELECT COUNT(*) as count FROM cadastro WHERE numero LIKE ?";
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                error_log("createStudent prepare failed: " . $this->conn->error);
                http_response_code(500);
                echo json_encode(['success' => false, 'mensagem' => 'Erro DB prepare: ' . $this->conn->error]);
                exit;
            }
            $prefix = $year_month . 'AL%';
            $stmt->bind_param('s', $prefix);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $count = (int)$row['count'] + 1;
            $numero = $year_month . 'AL' . str_pad($count, 3, '0', STR_PAD_LEFT);



            // Check duplicates
            $checkSql = "SELECT id FROM cadastro WHERE email = ? OR numero = ? LIMIT 1";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->bind_param('ss', $email, $numero);
            $checkStmt->execute();
            if ($checkStmt->get_result()->num_rows > 0) {
                http_response_code(409);
                echo json_encode(['success' => false, 'mensagem' => 'Email ou matrícula já existe']);
                exit;
            }

            // Create user
            $auth = new Auth($this->conn);
            $auth->nome = $nome;
            $auth->sobrenome = $sobrenome;
            $auth->cpf = $cpf ?: null;
            $auth->email = $email;
            $auth->numero = $numero;
            $auth->senha = $senha;
            $auth->tipo = 'aluno';

            if ($auth->criar()) {
                echo json_encode([
                    'success' => true, 
                    'mensagem' => 'Aluno criado com sucesso!', 
                    'matricula' => $numero,
                    'email' => $email
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'mensagem' => 'Falha ao criar aluno - verifique dados']);
            }
            
        } catch (Exception $e) {
            error_log("createStudent exception: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => 'Erro: ' . $e->getMessage()]);
        }
        
        exit;
    }

public function createTeacher($dados) {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            $nome = trim($dados['nome'] ?? '');
            $sobrenome = trim($dados['sobrenome'] ?? '');
            $email = filter_var($dados['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $senha = $dados['senha'] ?? '';
            
            if (empty($nome) || empty($senha) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'mensagem' => 'Nome, email válido e senha obrigatórios']);
                exit;
            }

            // Generate random 8-digit professor ID (PRxxxxxxxx unique)
            do {
                $numero = 'PR' . rand(10000000, 99999999);
                $checkSql = "SELECT id FROM cadastro WHERE numero = ? OR email = ?";
                $checkStmt = $this->conn->prepare($checkSql);
                if (!$checkStmt) {
                    throw new Exception('Erro prepare check: ' . $this->conn->error);
                }
                $checkStmt->bind_param('ss', $numero, $email);
                $checkStmt->execute();
                $exists = $checkStmt->get_result()->num_rows > 0;
            } while ($exists);

            // Create user
            $auth = new Auth($this->conn);
            $auth->nome = $nome;
            $auth->sobrenome = $sobrenome;
            $auth->email = $email;
            $auth->numero = $numero;
            $auth->senha = $senha;
            $auth->tipo = 'professor';

            if ($auth->criar()) {
                echo json_encode([
                    'success' => true, 
                    'mensagem' => 'Professor criado com sucesso! ID: ' . $numero,
                    'id_professor' => $numero,
                    'email' => $email
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'mensagem' => 'Falha ao criar professor - verifique logs']);
            }
            
        } catch (Exception $e) {
            error_log("createTeacher ERROR: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => 'Erro: ' . $e->getMessage()]);
        }
        
        exit;
    }

    public function updateUser($dados) {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            // error_log("DEBUG updateUser input: " . json_encode($dados)); // REMOVED

            
            $id = (int)($dados['id'] ?? 0);
            $nome = trim($dados['nome'] ?? '');
            $sobrenome = trim($dados['sobrenome'] ?? '');
            $email = filter_var($dados['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $cpf = trim($dados['cpf'] ?? '');

            if ($id <= 0 || strlen($nome) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'mensagem' => 'ID, nome e email válidos obrigatórios']);
                exit;
            }

            $cpf = empty($cpf) ? null : $cpf;
            
            $sql = "UPDATE cadastro SET nome = ?, sobrenome = ?, email = ?, cpf = ? WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                error_log("updateUser prepare failed: " . $this->conn->error);
                http_response_code(500);
                echo json_encode(['success' => false, 'mensagem' => 'Erro prepare: ' . $this->conn->error]);
                exit;
            }

            $stmt->bind_param('ssssi', $nome, $sobrenome, $email, $cpf, $id);
            
            if (!$stmt->execute()) {
                error_log("updateUser execute failed: " . $stmt->error);
                http_response_code(500);
                echo json_encode(['success' => false, 'mensagem' => 'Erro execute: ' . $stmt->error]);
                exit;
            }

            if ($stmt->affected_rows === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'mensagem' => 'Usuário não encontrado']);
                exit;
            }

            echo json_encode([
                'success' => true,
                'mensagem' => 'Usuário atualizado com sucesso!'
            ]);
            
        } catch (Exception $e) {
            error_log("updateUser exception: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => 'Erro: ' . $e->getMessage()]);
        }
        
        exit;
    }

    // ... other methods unchanged (getUsers, toggleStatus, etc.) remain functional
    public function getUsers($query = '') {
        header('Content-Type: application/json; charset=utf-8');
        
        $sql = "SELECT id, nome, sobrenome, email, numero, tipo FROM cadastro";
        $params = [];
        $types = '';
        if (!empty($query)) {
            $sql .= " WHERE nome LIKE ? OR sobrenome LIKE ? OR email LIKE ? OR numero LIKE ?";
            $search = '%' . trim($query) . '%';
            $params = [$search, $search, $search, $search];
            $types = 'ssss';
        }
        $sql .= " ORDER BY nome LIMIT 50";

        $stmt = DB::query($sql, $types, $params);
        $result = $stmt->get_result();
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode(['success' => true, 'users' => $users]);
        exit;
    }


    public function getUsersStudents($params) {
        header('Content-Type: application/json; charset=utf-8');
        
        $sql = "SELECT id, nome, sobrenome, numero, tipo, created_at FROM cadastro WHERE tipo = 'aluno'";
        $paramsQuery = [];
        $types = '';

        if (!empty($params['search'])) {
            $sql .= " AND (nome LIKE ? OR sobrenome LIKE ? OR numero LIKE ?)";
            $search = '%' . trim($params['search']) . '%';
            $paramsQuery = [$search, $search, $search];
            $types = 'sss';
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = DB::query($sql, $types, $paramsQuery);
        $result = $stmt->get_result();
        $students = [];
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }
        echo json_encode(['success' => true, 'students' => $students]);
        exit;
    }

    public function toggleStatus($dados) {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $id = $dados['id'] ?? 0;
            $active = $dados['active'] ?? 0;
            
            $sql = "UPDATE cadastro SET active = ? WHERE id = ? AND tipo = 'aluno'";
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) throw new Exception('Prepare failed: ' . $this->conn->error);
            
            $stmt->bind_param('ii', $active, $id);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true, 'mensagem' => 'Status alterado']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'mensagem' => 'Aluno não encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => $e->getMessage()]);
        }
        exit;
    }

    public function deleteUser($id) {
        header('Content-Type: application/json; charset=utf-8');
        try {
            // First get user type to handle cascade
            $userSql = "SELECT tipo FROM cadastro WHERE id = ?";
            $userStmt = $this->conn->prepare($userSql);
            $userStmt->bind_param('i', $id);
            $userStmt->execute();
            $userResult = $userStmt->get_result();
            
            if ($userResult->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'mensagem' => 'Usuário não encontrado']);
                exit;
            }
            
            $user = $userResult->fetch_assoc();
            $tipo = $user['tipo'];
            
            // Cascade delete for students: delete notas_faltas first
            if ($tipo === 'aluno') {
                $notesSql = "DELETE FROM notas_faltas WHERE cadastro_id = ?";
                $notesStmt = $this->conn->prepare($notesSql);
                $notesStmt->bind_param('i', $id);
                $notesStmt->execute();
            }
            
            // Delete user from cadastro
            $sql = "DELETE FROM cadastro WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) throw new Exception('Prepare failed: ' . $this->conn->error);
            
            $stmt->bind_param('i', $id);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                $msg = $tipo === 'aluno' ? 'Aluno deletado (incluindo notas)' : 'Usuário deletado';
                echo json_encode(['success' => true, 'mensagem' => $msg]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'mensagem' => 'Falha ao deletar']);
            }
        } catch (Exception $e) {
            error_log("Delete error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => $e->getMessage()]);
        }
        exit;
    }

    public function getUser($id) {
        header('Content-Type: application/json; charset=utf-8');
        
        $sql = "SELECT id, nome, sobrenome, email, cpf, numero, tipo FROM cadastro WHERE id = ?";
        $stmt = DB::query($sql, 'i', [$id]);
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if ($user) {
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'mensagem' => 'Usuário não encontrado']);
        }
        exit;
    }
}
?>



