<?php
// require_once 'config/security.php'; // not needed for login
require_once 'config/db.php';
require_once 'models/Auth.php';

class AuthController {
    private $conn;

    public function __construct() {
        $this->conn = DB::getConnection();
    }

    public function register($dados) {
        $auth = new Auth($this->conn);
        $auth->nome = $dados['nome'] ?? '';
        $auth->sobrenome = $dados['sobrenome'] ?? '';
        $auth->email = $dados['email'] ?? '';
        $auth->numero = $dados['numero'] ?? '';
        $auth->senha = $dados['senha'] ?? '';
        $auth->tipo = $dados['tipo'] ?? '';

        if (empty($auth->tipo) || !in_array($auth->tipo, ['aluno', 'professor'])) {
            http_response_code(400);
            echo json_encode(["mensagem" => "Tipo (aluno/professor) obrigatório."]);
            return;
        }

        if ($auth->usernameExists($auth->email) || $auth->usernameExists($auth->numero)) {
            http_response_code(400);
            echo json_encode(["mensagem" => "Email ou matrícula já cadastrado."]);
            return;
        }

        if ($auth->criar()) {
            echo json_encode(["success" => true, "mensagem" => "Registro criado!"]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "mensagem" => "Erro ao criar."]);
        }
    }

    public function login($dados) {
        $identifier = trim($dados['identifier'] ?? $dados['numero'] ?? $dados['email'] ?? '');
        $senha = $dados['senha'] ?? '';

        if (empty($identifier) || empty($senha)) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensagem" => "Identifier e senha obrigatórios"]);
            return;
        }

        $auth = new Auth($this->conn);
        $user = $auth->login($identifier, $senha);

        if ($user) {
            $_SESSION['user'] = $user; // Set session
            echo json_encode([
                "success" => true,
                "id" => $user['id'],
                "numero" => $user['numero'],
                "tipo" => $user['tipo'],
                "nome" => trim($user['nome'] . ' ' . $user['sobrenome'])
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "mensagem" => "Credenciais inválidas"]);
        }
    }
}
?>

