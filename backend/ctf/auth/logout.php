<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/auth.php';

$sessionToken = $_COOKIE[CTF_COOKIE_NAME] ?? null;

if (!$sessionToken) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $sessionToken = $matches[1];
    }
}

if ($sessionToken) {
    $stmt = $pdo->prepare("DELETE FROM ctf_sessions WHERE session_token = ?");
    $stmt->execute([$sessionToken]);
}

// Expire cookie
setcookie(CTF_COOKIE_NAME, '', [
    'expires' => time() - 3600,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
]);

jsonResponse(true, null, "You have been logged out successfully.");

