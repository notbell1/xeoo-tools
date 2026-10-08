<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/rateLimit.php';
require_once __DIR__ . '/../middleware/security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError("Method not allowed", 405);
}

enforceRateLimit('reset_password', 5, 300);

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

$token = trim((string)($body['token'] ?? ''));
$newPassword = (string)($body['password'] ?? '');
$passwordConfirm = (string)($body['password_confirmation'] ?? '');

if (empty($token) || strlen($token) !== 64) {
    jsonError("Invalid or expired password reset link.", 400, 'INVALID_TOKEN');
}

if (strlen($newPassword) < 8) {
    jsonError("New password must be at least 8 characters long.");
}

if ($newPassword !== $passwordConfirm) {
    jsonError("Passwords do not match.");
}

$tokenHash = hash('sha256', $token);

$stmt = $pdo->prepare("
    SELECT id, user_id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token_hash = ?
    LIMIT 1
");
$stmt->execute([$tokenHash]);
$resetRecord = $stmt->fetch();

if (!$resetRecord || $resetRecord['used_at'] !== null || strtotime($resetRecord['expires_at']) <= time()) {
    jsonError("The password reset link is invalid, expired, or has already been used.", 400, 'EXPIRED_TOKEN');
}

$userId = (int)$resetRecord['user_id'];
$newHash = password_hash($newPassword, PASSWORD_DEFAULT);

try {
    $pdo->beginTransaction();

    // 1. Update password
    $pdo->prepare("UPDATE ctf_users SET password_hash = ? WHERE id = ?")->execute([$newHash, $userId]);

    // 2. Mark token as used
    $pdo->prepare("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?")->execute([(int)$resetRecord['id']]);

    // 3. Section 48: Invalidate ALL old sessions
    $pdo->prepare("DELETE FROM ctf_sessions WHERE user_id = ?")->execute([$userId]);

    $pdo->commit();

    jsonResponse(true, null, "Password has been updated successfully. Please log in with your new credentials.");
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("[CTF_RESET_PWD_ERROR] " . $e->getMessage());
    jsonError("Failed to update password. Please try again.", 500);
}

