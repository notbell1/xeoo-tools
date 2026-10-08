<?php

declare(strict_types=1);

require_once __DIR__ . '/config/security.php';
require_once __DIR__ . '/../config/database.php';

// Safe error handling: Do not leak stack traces in production
ini_set('display_errors', '0');
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e) {
    error_log("[CTF_EXCEPTION] " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected server error occurred while processing the request.',
    ]);
    exit();
});

// Configure CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://xeootools.test',
    'https://xeootools.test',
];

if (in_array($origin, $allowedOrigins, true) || preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-CTF-CSRF-Token, x-csrf-token, x-ctf-csrf-token, X-Requested-With, Accept, Origin');
header('Access-Control-Max-Age: 86400');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

/**
 * Send uniform JSON response
 */
function jsonResponse(bool $success, mixed $data = null, ?string $message = null, int $statusCode = 200): void {
    http_response_code($statusCode);
    $payload = ['success' => $success];
    if ($message !== null) {
        $payload['message'] = $message;
    }
    if ($data !== null) {
        $payload['data'] = $data;
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Send error JSON response
 */
function jsonError(string $message, int $statusCode = 400, ?string $code = null, ?string $sarcasticNote = null): void {
    http_response_code($statusCode);
    $payload = [
        'success' => false,
        'message' => $message,
    ];
    if ($code !== null) {
        $payload['error_code'] = $code;
    }
    if ($sarcasticNote !== null) {
        $payload['security_notice'] = $sarcasticNote;
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Parse JSON body safely
 */
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }
    return $decoded;
}

/**
 * Log CTF security events
 */
function logSecurityEvent(?int $userId, string $eventType, string $endpoint, ?array $details = null, ?string $sarcasticNote = null): void {
    global $pdo;
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $detailsJson = $details ? json_encode($details) : null;
        $stmt = $pdo->prepare("
            INSERT INTO ctf_security_events (user_id, event_type, ip_address, endpoint, details, sarcastic_note)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $eventType, $ip, $endpoint, $detailsJson, $sarcasticNote]);
    } catch (Throwable $e) {
        error_log("[CTF_SECURITY_LOG_ERROR] " . $e->getMessage());
    }
}

/**
 * Log CTF audit records
 */
function logAuditRecord(string $actorUsername, string $action, string $targetType, ?string $targetId = null, ?array $oldValue = null, ?array $newValue = null, ?string $reason = null): void {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            INSERT INTO ctf_audit_logs (actor_username, action, target_type, target_id, old_value, new_value, reason)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $actorUsername,
            $action,
            $targetType,
            $targetId,
            $oldValue ? json_encode($oldValue) : null,
            $newValue ? json_encode($newValue) : null,
            $reason,
        ]);
    } catch (Throwable $e) {
        error_log("[CTF_AUDIT_LOG_ERROR] " . $e->getMessage());
    }
}

/**
 * Get CTF settings array
 */
function getCtfSettings(bool $forceRefresh = false): array {
    global $pdo;
    static $settingsCache = null;
    if ($settingsCache !== null && !$forceRefresh) {
        return $settingsCache;
    }
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM ctf_settings");
        $settingsCache = [];
        while ($row = $stmt->fetch()) {
            $settingsCache[$row['setting_key']] = $row['setting_value'];
        }
        return $settingsCache;
    } catch (Throwable) {
        return [];
    }
}

/**
 * Check if a boolean CTF setting is enabled
 */
function isCtfSettingEnabled(string $key, bool $default = true): bool {
    $settings = getCtfSettings();
    if (!array_key_exists($key, $settings)) {
        return $default;
    }
    $val = $settings[$key];
    if (is_bool($val)) {
        return $val;
    }
    if (is_numeric($val)) {
        return (int)$val === 1;
    }
    if (is_string($val)) {
        $val = strtolower(trim($val));
        return $val === '1' || $val === 'true' || $val === 'yes' || $val === 'on';
    }
    return false;
}

