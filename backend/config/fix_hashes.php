<?php
require_once 'db.php';
$db = new Database();
$conn = $db->connect();

if (!$conn) {
    echo "Erro conexão DB";
    exit;
}

// Fix test users hashes - senha: 'aluno123', 'prof123', 'admin123'
$users = [
    ['numero' => 'ALUNO123', 'senha' => 'aluno123'],
    ['email' => 'prof@ong.com', 'senha' => 'prof123'],
    ['email' => 'admin@ong.com', 'senha' => 'admin123']
];

foreach ($users as $user) {
    $hash = password_hash($user['senha'], PASSWORD_DEFAULT);
    $where = $user['numero'] ? "numero = '" . $user['numero'] . "'" : "email = '" . $user['email'] . "'";
    $sql = "UPDATE cadastro SET senha = '" . $hash . "' WHERE " . $where;
    $stmt = $conn->exec($sql);
    echo "UPDATE " . $where . " → " . $hash . " OK\n";
}

echo "Hashes corrigidos! Teste login agora.";
?>

