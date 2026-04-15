<?php
require_once 'db.php';

$conn = DB::getConnection();

// Find aluno ID (ALUNO123 or first aluno)
$aluno_query = "SELECT id FROM cadastro WHERE numero='ALUNO123' OR email='aluno@ong.com' LIMIT 1";
$result = $conn->query($aluno_query);
$aluno = $result->fetch_assoc();

if (!$aluno) {
    die("❌ Aluno não encontrado. Logins disponíveis: admin@ong.com, prof@ong.com, ALUNO123\n");
}

$cadastro_id = $aluno['id'];
echo "✅ Aluno ID: $cadastro_id (" . $aluno['numero'] ?? $aluno['email'] . ")\n";

// Insert sample notes
$notas = [
    ['disciplina' => 'Matemática', 'nota' => 8.5, 'faltas' => 2, 'data' => '2024-10-01'],
    ['disciplina' => 'Português', 'nota' => 7.2, 'faltas' => 1, 'data' => '2024-10-01'],
    ['disciplina' => 'História', 'nota' => 6.8, 'faltas' => 4, 'data' => '2024-10-05']
];

$sql = "INSERT INTO notas_faltas (cadastro_id, disciplina, nota, faltas, data) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

foreach ($notas as $n) {
$stmt->bind_param('isds', $cadastro_id, $n['disciplina'], $n['nota'], $n['faltas'], $n['data'] );
    if ($stmt->execute()) {
        echo "✅ Nota lançada: {$n['disciplina']} - {$n['nota']} (faltas: {$n['faltas']})\n";
    }
}

echo "\n📊 Agora faça login como aluno (ALUNO123/aluno123) para ver as notas!\n";
?>

