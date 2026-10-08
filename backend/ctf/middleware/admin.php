<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

/**
 * Middleware: Strictly require XeooTools Mimin/Admin session
 */
function requireCtfAdmin(): array {
    $isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

    if (!$isAdmin) {
        logSecurityEvent(
            null,
            'ADMIN_BYPASS_ATTEMPT',
            $_SERVER['REQUEST_URI'] ?? '/ctf/admin',
            ['ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'],
            getSarcasticSecurityMessage('AUTH_BYPASS')
        );

        jsonError(
            "Access denied. Administrative credentials required.",
            403,
            'FORBIDDEN',
            getSarcasticSecurityMessage('AUTH_BYPASS')
        );
    }

    return [
        'admin_id' => $_SESSION['admin_id'] ?? 1,
        'username' => $_SESSION['admin_username'] ?? 'admin',
    ];
}

