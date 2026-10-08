<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

/**
 * Enforce sliding rate limit per IP or user
 */
function enforceRateLimit(string $action, int $maxRequests, int $windowSeconds, ?int $userId = null): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $identifier = $userId ? "usr_{$userId}_{$action}" : "ip_{$ip}_{$action}";
    $keyHash = hash('sha256', $identifier);
    $cacheDir = sys_get_temp_dir() . '/xeoo_ctf_rl';

    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }

    $filePath = "{$cacheDir}/{$keyHash}.json";
    $now = time();
    $timestamps = [];

    if (file_exists($filePath)) {
        $data = @json_decode(file_get_contents($filePath), true);
        if (is_array($data)) {
            // Keep timestamps within window
            $timestamps = array_filter($data, fn($t) => ($now - $t) < $windowSeconds);
        }
    }

    if (count($timestamps) >= $maxRequests) {
        logSecurityEvent($userId, 'RATE_LIMIT', $_SERVER['REQUEST_URI'] ?? '', [
            'action' => $action,
            'count' => count($timestamps),
            'max' => $maxRequests,
        ], getSarcasticSecurityMessage('RATE_LIMIT'));

        jsonError(
            "Rate limit exceeded. Please wait a moment before trying again.",
            429,
            'RATE_LIMIT_EXCEEDED',
            getSarcasticSecurityMessage('RATE_LIMIT')
        );
    }

    $timestamps[] = $now;
    @file_put_contents($filePath, json_encode(array_values($timestamps)));
}

