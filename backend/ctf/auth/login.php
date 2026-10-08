<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/rateLimit.php';
require_once __DIR__ . '/../middleware/security.php';
require_once __DIR__ . '/../middleware/csrf.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError("Method not allowed", 405);
}

// Rate limit: 10 attempts per 5 minutes
enforceRateLimit('login', 10, 300);

// Setting check
$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}
if (!isCtfSettingEnabled('login_enabled', true)) {
    jsonError("Player authentication is temporarily disabled by administration.", 403, 'LOGIN_DISABLED');
}

$body = getJsonBody();
checkForbiddenParameters($body);

$identity = trim((string)($body['identity'] ?? $body['username'] ?? $body['login'] ?? ''));
$password = (string)($body['password'] ?? '');

inspectInputSecurity($identity, 'identity');

if (empty($identity) || empty($password)) {
    jsonError("Please enter your username/email and password.");
}

// Find user
$stmt = $pdo->prepare("
    SELECT id, username, email, password_hash, country_code, is_banned, ban_reason
    FROM ctf_users
    WHERE username = ? OR email = ?
    LIMIT 1
");
$stmt->execute([$identity, $identity]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    logSecurityEvent(null, 'AUTH_FAILURE', '/ctf/auth/login', [
        'identity' => substr($identity, 0, 32),
    ]);
    jsonError("Invalid credentials. Please verify your login details.", 401);
}

if ((int)$user['is_banned'] === 1) {
    logSecurityEvent((int)$user['id'], 'BANNED_USER_LOGIN_ATTEMPT', '/ctf/auth/login', [
        'reason' => $user['ban_reason'],
    ]);
    jsonError(
        "Account suspended: " . ($user['ban_reason'] ?: "Violation of CTF rules."),
        403,
        'ACCOUNT_BANNED',
        "Access has been suspended by administration."
    );
}

// Create new session token
$sessionToken = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', time() + CTF_SESSION_LIFETIME);
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

$stmtSession = $pdo->prepare("
    INSERT INTO ctf_sessions (user_id, session_token, ip_address, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?)
");
$stmtSession->execute([(int)$user['id'], $sessionToken, $ip, $ua, $expiresAt]);

// Set secure cookie
setcookie(CTF_COOKIE_NAME, $sessionToken, [
    'expires' => time() + CTF_SESSION_LIFETIME,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
]);

$csrfToken = generateCtfCsrfToken($sessionToken);

jsonResponse(true, [
    'user' => [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'country_code' => $user['country_code'],
    ],
    'csrf_token' => $csrfToken,
    'session_token' => $sessionToken,
], "Login successful. Welcome back!");

