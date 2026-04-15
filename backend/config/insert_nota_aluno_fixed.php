<?php
require_once 'db.php';

$conn = DB::getConnection();

// Find aluno ID
$aluno_query = "SELECT id, numero, email FROM cadastro WHERE numero='ALUNO123' OR email='aluno@ong.com' LIMIT 1";
$result = $conn->query($aluno_query);
$aluno = $result->fetch_assoc();

if (!$aluno) {
    die("❌ Aluno não encontrado\n");
}

$cadastro_id = $aluno['id'];
echo "✅ Aluno ID: $cadastro_id ({$aluno['numero'] ?: $aluno['email']})\n";

// Clear existing for clean test
$conn->query("DELETE FROM notas_faltas WHERE cadastro_id = $cadastro_id");

// Sample notes
$notas = [
    ['Matemática', 8.5, 2, '2024-10-01'],
    ['Português', 7.2, 1, '2024-10-01'],
    ['História', 6.8, 4, '2024-10-05']
];

$sql = "INSERT INTO notas_faltas (cadastro_id, disciplina, nota, faltas, data) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('isds', $cadastro_id, $disciplina, $nota, $faltas, $data);

foreach ($notas as $n) {
    $disciplina = $n[0];
    $nota = $n[1];
    $faltas = $n[2];
    $data = $n[3];
    
    if ($stmt->execute()) {
        echo "✅ {$disciplina}: $nota (faltas: $faltas)\n";
    } else {
        echo "❌ Erro {$disciplina}: " . $conn->error . "\n";
    }
}

echo "\n✅ Notas inseridas! Login: ALUNO123 / aluno123\n";
?>

