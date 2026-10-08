<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/admin.php';

$admin = requireCtfAdmin();
$actor = $admin['username'];

$method = $_SERVER['REQUEST_METHOD'];

function formatCtfSettingsResponse(array $raw): array {
    return [
        'ctf_enabled' => ($raw['ctf_enabled'] ?? '1') === '1',
        'registration_enabled' => ($raw['registration_enabled'] ?? '1') === '1',
        'login_enabled' => ($raw['login_enabled'] ?? '1') === '1',
        'password_reset_enabled' => ($raw['password_reset_enabled'] ?? '1') === '1',
        'submissions_enabled' => ($raw['submissions_enabled'] ?? '1') === '1',
        'leaderboard_enabled' => ($raw['leaderboard_enabled'] ?? '1') === '1',
        'maintenance_mode' => ($raw['maintenance_mode'] ?? '0') === '1',
        'maintenance_message' => (string)($raw['maintenance_message'] ?? 'XeooTools Defacement CTF is temporarily offline for scheduled system updates.'),
        'soon_message' => (string)($raw['soon_message'] ?? 'XeooTools Defacement CTF investigation cases are launching soon.'),
    ];
}

if ($method === 'GET') {
    $raw = getCtfSettings(true);
    jsonResponse(true, [
        'settings' => formatCtfSettingsResponse($raw),
    ]);
}

if ($method === 'POST') {
    $body = getJsonBody();
    $data = isset($body['settings']) && is_array($body['settings']) ? $body['settings'] : $body;

    $allowedKeys = [
        'ctf_enabled',
        'registration_enabled',
        'login_enabled',
        'password_reset_enabled',
        'submissions_enabled',
        'leaderboard_enabled',
        'maintenance_mode',
        'maintenance_message',
        'soon_message',
    ];

    $oldSettings = getCtfSettings(true);
    $updated = [];

    $stmt = $pdo->prepare("
        INSERT INTO ctf_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");

    $booleanKeys = [
        'ctf_enabled',
        'registration_enabled',
        'login_enabled',
        'password_reset_enabled',
        'submissions_enabled',
        'leaderboard_enabled',
        'maintenance_mode',
    ];

    foreach ($allowedKeys as $k) {
        if (array_key_exists($k, $data)) {
            if (in_array($k, $booleanKeys, true)) {
                $boolVal = filter_var($data[$k], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($boolVal === null) {
                    $boolVal = !empty($data[$k]) && $data[$k] !== '0' && $data[$k] !== 0;
                }
                $val = $boolVal ? '1' : '0';
            } else {
                $val = trim((string)$data[$k]);
            }
            $stmt->execute([$k, $val]);
            $updated[$k] = $val;
        }
    }

    logAuditRecord($actor, 'UPDATE_CTF_SETTINGS', 'ctf_settings', null, $oldSettings, $updated, "Updated by {$actor}");

    $refreshed = getCtfSettings(true);

    jsonResponse(true, [
        'settings' => formatCtfSettingsResponse($refreshed),
        'updated' => true,
    ], "CTF platform configuration updated successfully.");
}

jsonError("Method not allowed", 405);
