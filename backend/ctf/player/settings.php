<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';
require_once __DIR__ . '/../middleware/rateLimit.php';
require_once __DIR__ . '/../middleware/security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError("Method not allowed", 405);
}

$user = requireCtfAuth();
$userId = (int)$user['user_id'];

$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}

enforceRateLimit('player_settings', 15, 300, $userId);

$body = getJsonBody();
checkForbiddenParameters($body);

$action = trim((string)($body['action'] ?? 'update_profile'));

if ($action === 'update_profile') {
    $username = trim((string)($body['username'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));
    $countryCode = strtoupper(trim((string)($body['country_code'] ?? 'GLOBAL')));

    inspectInputSecurity($username, 'username', $userId);
    inspectInputSecurity($email, 'email', $userId);

    if (empty($username) || strlen($username) < 3 || strlen($username) > 30) {
        jsonError("Username must be between 3 and 30 characters.");
    }
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        jsonError("Username may only contain letters, numbers, and underscores.");
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        jsonError("Please enter a valid email address.");
    }
    if (!preg_match('/^[A-Z0-9_]{2,10}$/', $countryCode)) {
        $countryCode = 'GLOBAL';
    }

    // Check duplicate
    $stmtCheck = $pdo->prepare("SELECT id, username, email FROM ctf_users WHERE (username = ? OR email = ?) AND id != ? LIMIT 1");
    $stmtCheck->execute([$username, $email, $userId]);
    $existing = $stmtCheck->fetch();

    if ($existing) {
        if (strcasecmp($existing['username'], $username) === 0) {
            jsonError("Username is already taken by another operator.");
        }
        jsonError("Email is already registered by another operator.");
    }

    $stmtUp = $pdo->prepare("UPDATE ctf_users SET username = ?, email = ?, country_code = ? WHERE id = ?");
    $stmtUp->execute([$username, $email, $countryCode, $userId]);

    jsonResponse(true, [
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'country_code' => $countryCode,
        ]
    ], "Profile updated successfully.");
}

if ($action === 'change_password') {
    $currentPassword = (string)($body['current_password'] ?? '');
    $newPassword = (string)($body['new_password'] ?? '');
    $newPasswordConfirm = (string)($body['new_password_confirmation'] ?? $body['confirm_password'] ?? '');

    if (empty($currentPassword)) {
        jsonError("Current password is required.");
    }
    if (strlen($newPassword) < 8) {
        jsonError("New password must be at least 8 characters.");
    }
    if ($newPassword !== $newPasswordConfirm) {
        jsonError("New passwords do not match.");
    }

    // Check current password
    $stmtPass = $pdo->prepare("SELECT password_hash FROM ctf_users WHERE id = ? LIMIT 1");
    $stmtPass->execute([$userId]);
    $currentHash = (string)$stmtPass->fetchColumn();

    if (!password_verify($currentPassword, $currentHash)) {
        jsonError("Current password is incorrect.", 400);
    }

    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmtUp = $pdo->prepare("UPDATE ctf_users SET password_hash = ? WHERE id = ?");
    $stmtUp->execute([$newHash, $userId]);

    jsonResponse(true, [
        'password_changed' => true
    ], "Password successfully changed.");
}

jsonError("Invalid action requested.");

