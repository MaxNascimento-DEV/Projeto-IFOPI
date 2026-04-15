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
$aluno_info = $aluno['numero'] ?: $aluno['email'];
echo "✅ Aluno ID: $cadastro_id ($aluno_info)\n";

// Clear existing
$conn->query("DELETE FROM notas_faltas WHERE cadastro_id = $cadastro_id");

// Sample data
$notas_data = [
    ['Matemática', 8.5, 2, '2024-10-01'],
    ['Português', 7.2, 1, '2024-10-01'],
    ['História', 6.8, 4, '2024-10-05']
];

$sql = "INSERT INTO notas_faltas (cadastro_id, disciplina, nota, faltas, data) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

foreach ($notas_data as $nota_info) {
    $disciplina = $nota_info[0];
    $nota_val = $nota_info[1];
    $faltas_val = $nota_info[2];
    $data_val = $nota_info[3];
    
    $stmt->bind_param('isds', $cadastro_id, $disciplina, $nota_val, $faltas_val, $data_val);
    
    if ($stmt->execute()) {
        echo "✅ $disciplina: $nota_val (faltas: $faltas_val)\n";
    } else {
        echo "❌ Erro $disciplina: " . $stmt->error . "\n";
    }
}

echo "\n✅ Notas inseridas para aluno $aluno_info!\n";
echo "Login aluno: ALUNO123 / aluno123\n";
?>

