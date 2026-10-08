<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/rateLimit.php';
require_once __DIR__ . '/../middleware/security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError("Method not allowed", 405);
}

// Rate limiting: 5 requests per 15 minutes per IP
enforceRateLimit('forgot_password', 5, 900);

$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}
if (!isCtfSettingEnabled('password_reset_enabled', true)) {
    jsonError("Password resets are temporarily disabled by administration.", 403, 'PASSWORD_RESET_DISABLED');
}

$body = getJsonBody();
checkForbiddenParameters($body);

$email = trim((string)($body['email'] ?? ''));
inspectInputSecurity($email, 'email');

// Always return generic success response to prevent email enumeration
$genericResponse = "If an account exists with this email address, password reset instructions have been generated.";

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(true, null, $genericResponse);
}

$stmt = $pdo->prepare("SELECT id, username FROM ctf_users WHERE email = ? AND is_banned = 0 LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    // Generate secure 32-byte (64 hex) random token
    $rawToken = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $rawToken);
    $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour

    // Invalidate existing unused tokens for this user
    $pdo->prepare("DELETE FROM password_reset_tokens WHERE user_id = ?")->execute([(int)$user['id']]);

    // Insert new hashed token
    $insertStmt = $pdo->prepare("
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
    ");
    $insertStmt->execute([(int)$user['id'], $tokenHash, $expiresAt]);

    // Note: In local/demo environment without SMTP configured, we return reset_token_preview in development for seamless testing
    $isDev = in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1', 'xeootools.test'], true);
    $devData = $isDev ? ['debug_reset_token' => $rawToken] : null;

    jsonResponse(true, $devData, $genericResponse);
}

jsonResponse(true, null, $genericResponse);

