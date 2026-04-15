<?php
require_once 'config/security.php';
require_once 'config/db.php';
require_once 'models/Auth.php';
require_once 'models/Admin.php';

class AdminController {
    private $conn;
    private $adminModel;

    public function __construct() {
        if (!isset($_SESSION['user']) || $_SESSION['user']['tipo'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'mensagem' => 'Acesso negado']);
            exit;
        }
        $this->conn = DB::getConnection();
        $this->adminModel = new Admin($this->conn);
    }

    public function createStudent($dados) {
        $nome = $dados['nome'] ?? '';
        $sobrenome = $dados['sobrenome'] ?? '';
        $cpf = $dados['cpf'] ?? '';
        $senha = $dados['senha'] ?? '';
        
        if (empty($nome) || empty($senha)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'mensagem' => 'Nome e senha obrigatórios']);
            return;
        }

        // Auto matricula
        $year_month = date('Ymd');
        $sql = "SELECT LPAD(COALESCE(MAX(CAST(SUBSTRING(numero, 9) AS UNSIGNED)) + 1, 3, '0') as next_id 
                FROM cadastro WHERE numero REGEXP ?";
        $stmt = DB::query($sql, 's', [$year_month . 'AL[0-9]{3}']);
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $numero = $year_month . 'AL' . $row['next_id'];

        $auth = new Auth($this->conn);
        $auth->nome = $nome;
        $auth->sobrenome = $sobrenome;
        $auth->cpf = $cpf ?? '';
        $auth->email = $dados['email'] ?? '';
        $auth->numero = $numero;
        $auth->senha = $senha;
        $auth->tipo = 'aluno';

        if ($auth->usernameExists($auth->email) || $auth->usernameExists($numero)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'mensagem' => 'Email ou matrícula já existe']);
            return;
        }

        if ($auth->criar()) {
            echo json_encode(['success' => true, 'mensagem' => 'Aluno criado! Matrícula: ' . $numero]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'mensagem' => 'Erro ao criar aluno']);
        }
    }

    public function createTeacher($dados) {
        $dados['disciplinas'] = $dados['disciplinas'] ?? [];
        if ($this->adminModel->createProfessorWithDisciplinas($dados)) {
            echo json_encode(['success' => true, 'mensagem' => 'Professor criado com disciplinas']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'mensagem' => 'Erro ao criar professor']);
        }
    }

    public function getUsers($query = '') {
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
            if ($row['tipo'] === 'professor') {
                $discSql = "SELECT disciplina FROM professor_disciplinas WHERE cadastro_id = ?";
                $discStmt = DB::query($discSql, 'i', [$row['id']]);
                $discResult = $discStmt->get_result();
                $row['disciplinas'] = [];
                while ($d = $discResult->fetch_assoc()) {
                    $row['disciplinas'][] = $d['disciplina'];
                }
            }
            $users[] = $row;
        }
        echo json_encode(['success' => true, 'users' => $users]);
    }

    public function getStudents($params) {
        $sql = "SELECT id, nome, sobrenome, numero, COALESCE(active,1) as active, COALESCE(enrolled,1) as enrolled, COALESCE(unit,'Unidade 1') as unit, COALESCE(modality,'Presencial') as modality, created_at FROM cadastro WHERE tipo = 'aluno'";
        $paramsQuery = [];
        $types = '';

        // Search
        if (!empty($params['search'])) {
            $sql .= " AND (nome LIKE ? OR sobrenome LIKE ? OR numero LIKE ?)";
            $search = '%' . trim($params['search']) . '%';
            $paramsQuery = array_merge($paramsQuery, [$search, $search, $search]);
            $types .= 'sss';
        }

        // Filters
        if (!empty($params['unidade'])) {
            $sql .= " AND unit = ?";
            $paramsQuery[] = $params['unidade'];
            $types .= 's';
        }
        if (!empty($params['modalidade'])) {
            $sql .= " AND modality = ?";
            $paramsQuery[] = $params['modalidade'];
            $types .= 's';
        }
        if ($params['enrolled'] === '1') {
            $sql .= " AND enrolled = 1";
        }
        if ($params['students'] === 'ATIVOS') {
            $sql .= " AND active = 1";
        } elseif ($params['students'] === 'INATIVOS') {
            $sql .= " AND active = 0";
        } elseif ($params['students'] === 'MATRICULADOS') {
            $sql .= " AND enrolled = 1";
        } elseif ($params['students'] === 'NÃO MATRICULADOS') {
            $sql .= " AND enrolled = 0";
        }

        // Date filter
        $today = date('Y-m-d');
        switch ($params['date']) {
            case 'HOJE':
                $sql .= " AND DATE(created_at) = ?";
                $paramsQuery[] = $today;
                $types .= 's';
                break;
            case 'ONTEM':
                $sql .= " AND DATE(created_at) = DATE_SUB(?, INTERVAL 1 DAY)";
                $paramsQuery[] = $today;
                $types .= 's';
                break;
            case 'ÚLTIMOS 7 DIAS':
                $sql .= " AND created_at >= DATE_SUB(?, INTERVAL 7 DAY)";
                $paramsQuery[] = $today;
                $types .= 's';
                break;
            case 'ÚLTIMOS 30 DIAS':
                $sql .= " AND created_at >= DATE_SUB(?, INTERVAL 30 DAY)";
                $paramsQuery[] = $today;
                $types .= 's';
                break;
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = DB::query($sql, $types, $paramsQuery);
        $result = $stmt->get_result();
        $students = [];
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }
        echo json_encode(['success' => true, 'students' => $students]);
    }

    public function toggleStatus($dados) {
        $id = $dados['id'] ?? 0;
        $active = $dados['active'] ?? 0;
        
        $sql = "UPDATE cadastro SET active = ? WHERE id = ? AND tipo = 'aluno'";
        $stmt = DB::query($sql, 'ii', [$active, $id]);
        
        if ($stmt && $stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'mensagem' => 'Status alterado']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'mensagem' => 'Erro ao alterar status']);
        }
    }

    public function deleteUser($id) {
        $sql = "DELETE FROM cadastro WHERE id = ?";
        $stmt = DB::query($sql, 'i', [$id]);
        if ($stmt && $stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'mensagem' => 'Usuário deletado']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'mensagem' => 'Usuário não encontrado']);
        }
    }

    public function getUser($id) {
        $sql = "SELECT id, nome, sobrenome, email, cpf, numero, tipo FROM cadastro WHERE id = ?";
        $stmt = DB::query($sql, 'i', [$id]);
        $user = $stmt->get_result()->fetch_assoc();
        if ($user && $user['tipo'] === 'professor') {
            $discSql = "SELECT disciplina FROM professor_disciplinas WHERE cadastro_id = ?";
            $discStmt = DB::query($discSql, 'i', [$id]);
            $discResult = $discStmt->get_result();
            $user['disciplinas'] = [];
            while ($d = $discResult->fetch_assoc()) {
                $user['disciplinas'][] = $d['disciplina'];
            }
        }
        if ($user) {
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'mensagem' => 'Usuário não encontrado']);
        }
    }

    public function updateUser($dados) {
        $id = $dados['id'] ?? 0;
        $nome = $dados['nome'] ?? '';
        $sobrenome = $dados['sobrenome'] ?? '';
        $email = $dados['email'] ?? '';
        $cpf = $dados['cpf'] ?? '';
        
        if (empty($id) || empty($nome)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'mensagem' => 'ID e nome obrigatórios']);
            return;
        }

        $sql = "UPDATE cadastro SET nome = ?, sobrenome = ?, email = ?, cpf = ? WHERE id = ?";
        $stmt = DB::query($sql, 'sssii', [$nome, $sobrenome, $email, $cpf, $id]);
        if ($stmt && $stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'mensagem' => 'Usuário atualizado']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'mensagem' => 'Erro ao atualizar usuário']);
        }
    }
}

?>

