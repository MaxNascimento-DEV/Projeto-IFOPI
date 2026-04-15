<?php
require_once 'db.php';

$conn = DB::getConnection();

$users = [
    [
        'nome' => 'Admin',
        'sobrenome' => 'ONG',
        'email' => 'admin@ong.com',
        'numero' => '',
        'senha' => 'admin123',
        'tipo' => 'admin'
    ],
    [
        'nome' => 'Professor',
        'sobrenome' => 'Teste',
        'email' => 'prof@ong.com',
        'numero' => '',
        'senha' => 'prof123',
        'tipo' => 'professor'
    ],
    [
        'nome' => 'Aluno',
        'sobrenome' => 'Teste',
        'email' => 'aluno@ong.com',
        'numero' => 'ALUNO123',
        'senha' => 'aluno123',
        'tipo' => 'aluno'
    ]
];

foreach ($users as $u) {
    $hash = password_hash($u['senha'], PASSWORD_DEFAULT);
    $sql = "INSERT IGNORE INTO cadastro (nome, sobrenome, email, numero, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssss', $u['nome'], $u['sobrenome'], $u['email'], $u['numero'], $hash, $u['tipo']);
    $stmt->execute();
    echo "Criado/Atualizado: " . $u['nome'] . " (" . $u['email'] . " or " . $u['numero'] . ")\n";
}

// Add disciplina for prof
$sql = "INSERT IGNORE INTO professor_disciplinas (cadastro_id, disciplina) VALUES ((SELECT id FROM cadastro WHERE email = 'prof@ong.com'), 'Matemática'), ((SELECT id FROM cadastro WHERE email = 'prof@ong.com'), 'Português')";
$conn->query($sql);

echo "\n✅ Usuários de teste criados! Logins:\n";
echo "- Admin: admin@ong.com / admin123\n";
echo "- Professor: prof@ong.com / prof123\n";
echo "- Aluno: ALUNO123 / aluno123\n";
?>

