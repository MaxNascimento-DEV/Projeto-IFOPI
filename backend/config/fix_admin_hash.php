<?php
require_once 'db.php';

$conn = DB::getConnection();
$email = 'admin@ong.com';
$senha_plain = 'admin@123';
$senha_hash = password_hash($senha_plain, PASSWORD_DEFAULT);

$sql = "UPDATE cadastro SET senha = ? WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ss', $senha_hash, $email);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo "✅ Senha do admin ($email) atualizada para '$senha_plain'\n";
    } else {
        echo "❌ Admin não encontrado\n";
    }
} else {
    echo "❌ Erro ao atualizar: " . $conn->error . "\n";
}

// Verify
$result = $conn->query("SELECT tipo FROM cadastro WHERE email = '$email'");
$row = $result->fetch_assoc();
echo "Verificação: " . ($row ? $row['tipo'] : 'N/A') . "\n";

echo "\nLogin: $email / $senha_plain\n";
?>

