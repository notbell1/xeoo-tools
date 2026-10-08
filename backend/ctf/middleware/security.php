<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

/**
 * Reject parameter tampering attempts on sensitive properties
 */
function checkForbiddenParameters(array $payload, array $forbiddenKeys = ['score', 'points', 'is_banned', 'user_id', 'role', 'is_admin', 'solved', 'rank', 'status'], ?int $userId = null): void {
    foreach ($forbiddenKeys as $key) {
        if (array_key_exists($key, $payload)) {
            $msg = getSarcasticSecurityMessage('PARAMETER_TAMPERING');
            logSecurityEvent($userId, 'PARAMETER_TAMPERING', $_SERVER['REQUEST_URI'] ?? '', [
                'tampered_key' => $key,
            ], $msg);

            jsonError(
                "Invalid request parameter: {$key}",
                400,
                'PARAMETER_TAMPERING',
                $msg
            );
        }
    }
}

/**
 * Inspect raw string inputs for malicious payload patterns
 */
function inspectInputSecurity(string $input, string $field = 'input', ?int $userId = null): void {
    // Basic heuristic detection for obvious injection attempts
    $sqliPatterns = [
        '/\b(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from)\b/i',
        '/\b(sleep\(\s*\d+\s*\)|benchmark\(\s*\d+\s*,|load_file\()/i',
        '/(\'|")\s*(or|and)\s*(\'|")?\d+(\'|")?\s*=\s*(\'|")?\d+/i',
    ];

    foreach ($sqliPatterns as $pat) {
        if (preg_match($pat, $input)) {
            $msg = getSarcasticSecurityMessage('SQLI_SUSPECTED');
            logSecurityEvent($userId, 'SQLI_SUSPECTED', $_SERVER['REQUEST_URI'] ?? '', [
                'field' => $field,
            ], $msg);

            jsonError("Security check rejected this input.", 400, 'SECURITY_INTERCEPT', $msg);
        }
    }
}

