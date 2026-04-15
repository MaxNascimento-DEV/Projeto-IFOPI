<?php
require_once 'config/db.php';
$conn = DB::getConnection();

if ($conn) {
    echo "✅ Conexão OK!\n";
    $stmt = $conn->query("SHOW TABLES");
$tables = [];
while ($row = $stmt->fetch_array()) {
  $tables[] = $row[0];
}
    echo "Tabelas: " . implode(', ', $tables) . "\n";
    
    // Test admin
    $stmt = $conn->query("SELECT COUNT(*) FROM cadastro");
$adminCount = $stmt->fetch_array(MYSQLI_NUM)[0];
    echo "Admins: $adminCount\n";
    
} else {
    echo "❌ Erro conexão BD\n";
}
?>
