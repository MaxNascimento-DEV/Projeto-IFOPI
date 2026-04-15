<?php
/**
 * Session Security Manager
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    
    // Regen ID every 5min
    if (!isset($_SESSION['last_regen'])) {
        $_SESSION['last_regen'] = time();
    } elseif (time() - $_SESSION['last_regen'] > 300) {
        session_regenerate_id(true);
        $_SESSION['last_regen'] = time();
    }
    
    // Timeout 30min inactivity
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
        session_destroy();
        http_response_code(401);
        echo json_encode(['success' => false, 'mensagem' => 'Sessão expirada']);
        exit;
    }
    $_SESSION['last_activity'] = time();
}

// CSRF
function generateCSRF() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRF($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
?>

