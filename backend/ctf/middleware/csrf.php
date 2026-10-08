<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

/**
 * Generate a cryptographically secure CSRF token derived from session token
 */
function generateCtfCsrfToken(string $sessionToken): string {
    return hash_hmac('sha256', $sessionToken, 'XEOO_CTF_CSRF_SECRET_KEY_v1');
}

/**
 * Verify CSRF token for state-changing requests
 */
function verifyCtfCsrf(string $sessionToken, ?string $providedToken = null): bool {
    if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return true;
    }

    if ($providedToken === null) {
        $providedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] 
            ?? $_SERVER['HTTP_X_CTF_CSRF_TOKEN'] 
            ?? ($_SERVER[CTF_CSRF_HEADER] ?? null);
    }

    if (!$providedToken) {
        $body = getJsonBody();
        $providedToken = $body['_csrf'] ?? null;
    }

    if (!$providedToken || !is_string($providedToken)) {
        return false;
    }

    $expected = generateCtfCsrfToken($sessionToken);
    return hash_equals($expected, $providedToken);
}

/**
 * Enforce CSRF verification middleware
 */
function requireCtfCsrf(array $authenticatedUser): void {
    $sessionToken = $authenticatedUser['session_token'] ?? '';
    if (!verifyCtfCsrf($sessionToken)) {
        logSecurityEvent(
            (int)($authenticatedUser['user_id'] ?? 0),
            'CSRF_FAILURE',
            $_SERVER['REQUEST_URI'] ?? '',
            ['method' => $_SERVER['REQUEST_METHOD'] ?? '']
        );
        jsonError("Invalid or missing security validation token.", 403, 'CSRF_INVALID');
    }
}