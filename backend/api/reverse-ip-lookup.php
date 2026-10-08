<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools — Reverse IP Lookup API
|--------------------------------------------------------------------------
| Discovers public domains and hostnames associated with an IP address
| via authoritative PTR resolution and public Reverse IP intelligence.
| Hardened against SSRF, request explosion, XSS payloads, and resource exhaustion.
|--------------------------------------------------------------------------
*/

const MAX_IP_LENGTH = 45;
const MAX_DOMAINS_RETURNED = 300;

// Load .env if present
$envPath = dirname(__DIR__, 2) . '/.env';
if (file_exists($envPath)) {
    require_once __DIR__ . '/../config/env.php';
    try {
        loadEnv($envPath);
    } catch (Throwable) {
        // Silently continue if .env load fails
    }
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$isAllowedOrigin =
    $origin !== '' &&
    (
        preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin) === 1 ||
        str_contains($origin, 'devtunnels.ms')
    );

if ($isAllowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

/*
|--------------------------------------------------------------------------
| JSON Response Helper
|--------------------------------------------------------------------------
*/
function jsonResponse(
    bool $success,
    string $message = '',
    mixed $data = null,
    int $status = 200,
    array $extraHeaders = []
): never {
    http_response_code($status);
    foreach ($extraHeaders as $headerName => $headerValue) {
        header("{$headerName}: {$headerValue}");
    }

    $response = [
        'success' => $success,
        'message' => $message,
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
    );

    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(false, 'Method not allowed. Use POST.', null, 405);
}

/*
|--------------------------------------------------------------------------
| Rate Limiting & Concurrency Guard
|--------------------------------------------------------------------------
*/
$rawClientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$clientHash = hash('sha256', $rawClientIp);

$lockDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'xeoo_reverse_ip_lookup';
if (!is_dir($lockDir)) {
    @mkdir($lockDir, 0755, true);
}

// 1. Concurrency Check (Max 1 active lookup per client IP)
$clientLockPath = $lockDir . DIRECTORY_SEPARATOR . 'active_' . $clientHash . '.lock';
$clientLockFp = @fopen($clientLockPath, 'c+');

if (!$clientLockFp || !@flock($clientLockFp, LOCK_EX | LOCK_NB)) {
    if ($clientLockFp) {
        fclose($clientLockFp);
    }
    jsonResponse(false, 'A lookup is already in progress. Please wait for it to complete.', null, 429, [
        'Retry-After' => '5',
    ]);
}

// Register shutdown function to release lock cleanly
register_shutdown_function(function () use ($clientLockFp, $clientLockPath) {
    if ($clientLockFp) {
        @flock($clientLockFp, LOCK_UN);
        @fclose($clientLockFp);
        @unlink($clientLockPath);
    }
});

// 2. Rate Limit (Max 10 lookups per 10 minutes per IP)
$rateLimitFile = $lockDir . DIRECTORY_SEPARATOR . 'rate_' . $clientHash . '.json';
$currentTime = time();
$windowSeconds = 600; // 10 minutes
$maxLookupsPerWindow = 10;
$cooldownSeconds = 2;

$rateData = [];
if (file_exists($rateLimitFile)) {
    $rawRate = @file_get_contents($rateLimitFile);
    if ($rawRate !== false) {
        $decodedRate = json_decode($rawRate, true);
        if (is_array($decodedRate)) {
            $rateData = $decodedRate;
        }
    }
}

// Filter timestamps within current window
$recentTimestamps = array_filter(
    $rateData,
    fn(int $timestamp) => ($currentTime - $timestamp) < $windowSeconds
);

// Short cooldown check
if (!empty($recentTimestamps)) {
    $lastLookupTime = max($recentTimestamps);
    if (($currentTime - $lastLookupTime) < $cooldownSeconds) {
        jsonResponse(false, 'Please wait a moment before starting another lookup.', null, 429, [
            'Retry-After' => (string) ($cooldownSeconds - ($currentTime - $lastLookupTime)),
        ]);
    }
}

if (count($recentTimestamps) >= $maxLookupsPerWindow) {
    $oldest = min($recentTimestamps);
    $retryAfter = max(10, $windowSeconds - ($currentTime - $oldest));
    jsonResponse(false, 'Lookup rate limit reached. Please wait a few minutes before trying again.', null, 429, [
        'Retry-After' => (string) $retryAfter,
    ]);
}

/*
|--------------------------------------------------------------------------
| Read & Validate Request Body
|--------------------------------------------------------------------------
*/
$rawBody = file_get_contents('php://input');
if ($rawBody === false || trim($rawBody) === '') {
    jsonResponse(false, 'Request body is empty.', null, 400);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    jsonResponse(false, 'Invalid JSON request.', null, 400);
}

$rawInput = '';
if (isset($payload['ip']) && is_string($payload['ip'])) {
    $rawInput = trim($payload['ip']);
} elseif (isset($payload['target']) && is_string($payload['target'])) {
    $rawInput = trim($payload['target']);
}

if ($rawInput === '') {
    jsonResponse(false, 'IP address is required.', null, 422);
}

if (strlen($rawInput) > MAX_IP_LENGTH) {
    jsonResponse(false, 'IP address exceeds maximum allowed length.', null, 422);
}

// Strip surrounding quotes, brackets, and whitespace
$cleanIp = trim($rawInput, " \t\n\r\0\x0B[]'\"()<>{}`");

// Reject dangerous schemes or URLs
if (preg_match('/^(https?|file|ftp|gopher|php|data|javascript):/i', $cleanIp) || str_contains($cleanIp, '/')) {
    jsonResponse(false, 'Invalid input. Please provide a plain IP address, not a URL or path.', null, 422);
}

// Reject credentials
if (str_contains($cleanIp, '@')) {
    jsonResponse(false, 'Embedded credentials are not permitted.', null, 422);
}

// Strict IP validation (IPv4 or IPv6)
if (!filter_var($cleanIp, FILTER_VALIDATE_IP)) {
    jsonResponse(false, 'Invalid IP address format. Please enter a valid IPv4 or IPv6 address.', null, 422);
}

// Record lookup timestamp
$recentTimestamps[] = $currentTime;
@file_put_contents($rateLimitFile, json_encode(array_values($recentTimestamps)), LOCK_EX);

/*
|--------------------------------------------------------------------------
| PTR Record Resolution (Native DNS)
|--------------------------------------------------------------------------
*/
$ptr = @gethostbyaddr($cleanIp);
if ($ptr === false || $ptr === $cleanIp || !str_contains($ptr, '.')) {
    $ptr = null;
} else {
    $ptr = strtolower(rtrim($ptr, '.'));
}

/*
|--------------------------------------------------------------------------
| Private & Reserved IP Handling
|--------------------------------------------------------------------------
*/
$isPublicIp = (bool) filter_var(
    $cleanIp,
    FILTER_VALIDATE_IP,
    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
);

if (!$isPublicIp) {
    jsonResponse(true, 'No domains found for this IP.', [
        'ip' => $cleanIp,
        'ptr' => $ptr,
        'domains_found' => 0,
        'domains' => [],
        'source' => 'Reverse IP Database',
    ]);
}

/*
|--------------------------------------------------------------------------
| Query Reverse IP Provider
|--------------------------------------------------------------------------
*/
$apiKey = function_exists('env') ? env('REVERSE_IP_API_KEY') : (getenv('REVERSE_IP_API_KEY') ?: null);

$providerUrl = 'https://api.hackertarget.com/reverseiplookup/?q=' . urlencode($cleanIp);
if ($apiKey) {
    $providerUrl .= '&apikey=' . urlencode($apiKey);
}

$ch = curl_init($providerUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 2,
]);

$rawResponse = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

$uniqueDomains = [];

if ($rawResponse !== false && $httpCode === 200) {
    $trimmed = trim((string) $rawResponse);
    $lower = strtolower($trimmed);

    // Filter known error responses from provider
    $isError =
        str_starts_with($lower, 'error') ||
        str_starts_with($lower, 'api count exceeded') ||
        str_starts_with($lower, 'no records') ||
        str_starts_with($lower, 'no dns');

    if (!$isError && $trimmed !== '') {
        $lines = preg_split('/[\r\n]+/', $trimmed) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            // If line contains comma (e.g. domain,ip), split and take domain
            $domainCandidate = explode(',', $line)[0] ?? $line;
            $domainCandidate = strtolower(rtrim(trim($domainCandidate), '.'));

            // Remove wildcards
            $domainCandidate = preg_replace('/^\*\./', '', $domainCandidate) ?? $domainCandidate;

            // Validate domain character structure
            if (
                str_contains($domainCandidate, '.') &&
                preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i', $domainCandidate)
            ) {
                $uniqueDomains[$domainCandidate] = true;

                if (count($uniqueDomains) >= MAX_DOMAINS_RETURNED) {
                    break;
                }
            }
        }
    }
}

// If provider returned no domains but PTR resolved to a valid domain name, include PTR
if (empty($uniqueDomains) && $ptr !== null) {
    if (preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i', $ptr)) {
        $uniqueDomains[$ptr] = true;
    }
}

$domainList = array_keys($uniqueDomains);
sort($domainList, SORT_NATURAL | SORT_FLAG_CASE);

if (count($domainList) > MAX_DOMAINS_RETURNED) {
    $domainList = array_slice($domainList, 0, MAX_DOMAINS_RETURNED);
}

$domainsFound = count($domainList);

jsonResponse(true, $domainsFound > 0 ? 'Reverse IP lookup completed.' : 'No domains found for this IP.', [
    'ip' => $cleanIp,
    'ptr' => $ptr,
    'domains_found' => $domainsFound,
    'domains' => $domainList,
    'source' => 'Reverse IP Database',
]);

