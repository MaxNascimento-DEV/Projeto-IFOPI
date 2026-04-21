<?php
require_once 'config/security.php';
require_once 'config/db.php';

class AlunoController {
    private $conn;

    public function __construct() {
        $this->conn = DB::getConnection();
    }

    public function getGrades($numero) {
        // Get cadastro_id
        $idSql = "SELECT id FROM cadastro WHERE numero = ?";
        $idStmt = DB::query($idSql, 's', [$numero]);
        $idResult = $idStmt->get_result();
        if ($idResult->num_rows === 0) {
            echo json_encode([
                'success' => true, 
                'ultima_nota' => 0,
                'ultimas_faltas' => 0
            ]);
            return;
        }
        $cadastro_id = $idResult->fetch_assoc()['id'];

        // Get LAST RECORD ONLY - exactly latest professor update (id=9)
        $latestSql = "SELECT nota as ultima_nota, faltas as ultimas_faltas 
                      FROM notas_faltas 
                      WHERE cadastro_id = ? 
                      ORDER BY id DESC 
                      LIMIT 1";
        $latestStmt = DB::query($latestSql, 'i', [$cadastro_id]);
        $latestResult = $latestStmt->get_result();
        $latest = $latestResult->fetch_assoc() ?: ['ultima_nota' => 0, 'ultimas_faltas' => 0];

        echo json_encode([
            'success' => true, 
            'ultima_nota' => round((float)$latest['ultima_nota'], 1),
            'ultimas_faltas' => (int)$latest['ultimas_faltas']
        ]);
    }
}
?>

