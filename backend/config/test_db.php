<?php
require_once 'database.php';

$db = new Database();
$conn = $db->connect();

if ($conn) {
    echo "✅ Conexão OK!\n";
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tabelas: " . implode(', ', $tables) . "\n";
    
    // Test admin
    $stmt = $conn->query("SELECT COUNT(*) FROM cadastro");
    $adminCount = $stmt->fetchColumn();
    echo "Admins: $adminCount\n";
    
} else {
    echo "❌ Erro conexão BD\n";
}
?>
