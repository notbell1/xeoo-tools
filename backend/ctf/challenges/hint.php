<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError("Method not allowed", 405);
}

$user = requireCtfAuth();
$userId = (int)$user['user_id'];

// Check settings
$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}
if (!isCtfSettingEnabled('submissions_enabled', true)) {
    jsonError("Hint unlock is temporarily disabled while submissions are paused.", 403, 'SUBMISSIONS_DISABLED');
}

$body = getJsonBody();
$hintId = (int)($body['hint_id'] ?? 0);

if ($hintId <= 0) {
    jsonError("Invalid hint ID.", 400);
}

// Find hint
$stmt = $pdo->prepare("SELECT id, challenge_id, title, hint_text, cost FROM ctf_hints WHERE id = ? LIMIT 1");
$stmt->execute([$hintId]);
$hint = $stmt->fetch();

if (!$hint) {
    jsonError("Hint not found.", 404);
}

try {
    $stmtUnlock = $pdo->prepare("
        INSERT INTO ctf_unlocked_hints (user_id, hint_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE unlocked_at = unlocked_at
    ");
    $stmtUnlock->execute([$userId, $hintId]);

    jsonResponse(true, [
        'hint_id' => $hintId,
        'hint_text' => $hint['hint_text'],
        'cost' => (int)$hint['cost'],
    ], "Hint unlocked successfully.");
} catch (Throwable $e) {
    error_log("[CTF_HINT_UNLOCK_ERROR] " . $e->getMessage());
    jsonError("Failed to unlock hint.", 500);
}

