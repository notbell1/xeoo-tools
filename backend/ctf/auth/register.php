<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/rateLimit.php';
require_once __DIR__ . '/../middleware/security.php';
require_once __DIR__ . '/../middleware/csrf.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError("Method not allowed", 405);
}

// 1. Rate limiting
enforceRateLimit('register', 6, 600);

// 2. Setting check
$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}
if (!isCtfSettingEnabled('registration_enabled', true)) {
    jsonError("Registration is temporarily disabled by administration.", 403, 'REGISTRATION_DISABLED');
}

$body = getJsonBody();
checkForbiddenParameters($body);

$username = trim((string)($body['username'] ?? ''));
$email = trim((string)($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');
$passwordConfirm = (string)($body['password_confirmation'] ?? $body['confirm_password'] ?? '');
$countryCode = strtoupper(trim((string)($body['country_code'] ?? 'GLOBAL')));

inspectInputSecurity($username, 'username');
inspectInputSecurity($email, 'email');

// Validations
if (empty($username) || strlen($username) < 3 || strlen($username) > 30) {
    jsonError("Username must be between 3 and 30 characters.");
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    jsonError("Username may only contain letters, numbers, and underscores.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
    jsonError("Please provide a valid email address.");
}

if (strlen($password) < 8) {
    jsonError("Password must be at least 8 characters long.");
}

if ($password !== $passwordConfirm) {
    jsonError("Passwords do not match.");
}

if (!preg_match('/^[A-Z0-9_]{2,10}$/', $countryCode)) {
    $countryCode = 'GLOBAL';
}

// Check uniqueness
$stmtCheck = $pdo->prepare("SELECT id, username, email FROM ctf_users WHERE username = ? OR email = ? LIMIT 1");
$stmtCheck->execute([$username, $email]);
$existing = $stmtCheck->fetch();

if ($existing) {
    if (strcasecmp($existing['username'], $username) === 0) {
        jsonError("Username is already taken. Please choose another.");
    }
    jsonError("An account with this email address already exists.");
}

// Hash password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
    $pdo->beginTransaction();

    $stmtInsert = $pdo->prepare("
        INSERT INTO ctf_users (username, email, password_hash, country_code)
        VALUES (?, ?, ?, ?)
    ");
    $stmtInsert->execute([$username, $email, $passwordHash, $countryCode]);
    $userId = (int)$pdo->lastInsertId();

    $pdo->commit();

    jsonResponse(true, [
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'country_code' => $countryCode,
        ],
    ], "Pendaftaran akun berhasil! Silakan login untuk memulai investigasi.", 201);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("[CTF_REGISTER_ERROR] " . $e->getMessage());
    jsonError("An error occurred during registration. Please try again later.", 500);
}

