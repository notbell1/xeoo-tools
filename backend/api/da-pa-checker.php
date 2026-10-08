<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools — Domain Authority & Page Authority (DA/PA) Checker API
|--------------------------------------------------------------------------
| Retrieves verified Domain Authority (DA) and Page Authority (PA) metrics
| from authorized third-party SEO intelligence providers (e.g. Mozscape / Moz Links API).
|
| Strict Security & Integrity Standards:
| - NEVER fabricates, simulates, guesses, or mocks scores.
| - Backend credentials only — no secrets exposed to client.
| - Single target check only. No bulk scraping or SSRF proxying.
| - Bounded timeouts, concurrency control, and rate limiting.
|--------------------------------------------------------------------------
*/

const MAX_TARGET_LENGTH = 2048;
const MAX_HOST_LENGTH = 253;
const PROVIDER_TIMEOUT_SECONDS = 10;
const PROVIDER_CONNECT_TIMEOUT_SECONDS = 5;

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

$lockDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'xeoo_da_pa_checker';
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
    jsonResponse(false, 'A DA/PA check is already in progress. Please wait for it to complete.', null, 429, [
        'Retry-After' => '5',
    ]);
}

register_shutdown_function(function () use ($clientLockFp, $clientLockPath) {
    if ($clientLockFp) {
        @flock($clientLockFp, LOCK_UN);
        @fclose($clientLockFp);
        @unlink($clientLockPath);
    }
});

// 2. Rate Limit (Max 20 lookups per 10 minutes per IP, min 2s cooldown)
$rateLimitFile = $lockDir . DIRECTORY_SEPARATOR . 'rate_' . $clientHash . '.json';
$currentTime = time();
$windowSeconds = 600; // 10 minutes
$maxLookupsPerWindow = 20;
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

$recentTimestamps = array_filter(
    $rateData,
    fn(int $timestamp) => ($currentTime - $timestamp) < $windowSeconds
);

if (!empty($recentTimestamps)) {
    $lastLookupTime = max($recentTimestamps);
    if (($currentTime - $lastLookupTime) < $cooldownSeconds) {
        jsonResponse(false, 'Please wait a moment before starting another DA/PA check.', null, 429, [
            'Retry-After' => (string) ($cooldownSeconds - ($currentTime - $lastLookupTime)),
        ]);
    }
}

if (count($recentTimestamps) >= $maxLookupsPerWindow) {
    $oldest = min($recentTimestamps);
    $retryAfter = max(10, $windowSeconds - ($currentTime - $oldest));
    jsonResponse(false, 'DA/PA check rate limit reached. Please wait a few minutes before trying again.', null, 429, [
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
if (isset($payload['target']) && is_string($payload['target'])) {
    $rawInput = trim($payload['target']);
} elseif (isset($payload['url']) && is_string($payload['url'])) {
    $rawInput = trim($payload['url']);
}

if ($rawInput === '') {
    jsonResponse(false, 'Target website or URL is required.', null, 422);
}

if (strlen($rawInput) > MAX_TARGET_LENGTH) {
    jsonResponse(false, 'Input exceeds maximum allowed length of ' . MAX_TARGET_LENGTH . ' characters.', null, 422);
}

// Check for XSS / script injection payloads
if (preg_match('/<script|<\/script|javascript:|onerror\s*=|onload\s*=|onclick\s*|<iframe|<img|<svg|alert\s*\(|prompt\s*\(|confirm\s*\(/i', $rawInput)) {
    jsonResponse(false, 'Warning: SEO metrics dulu. Drama XSS belakangan. 😏', null, 422);
}

// Disallow dangerous schemes
if (preg_match('/^(ftp|file|gopher|ssh|data|blob|php):/i', $rawInput)) {
    jsonResponse(false, 'Unsupported protocol scheme. Only HTTP and HTTPS URLs are accepted.', null, 422);
}

// Disallow embedded credentials
if (str_contains($rawInput, '@')) {
    jsonResponse(false, 'URLs containing user credentials are not allowed.', null, 422);
}

// Normalize protocol: prepend https:// if missing
$hasScheme = (bool) preg_match('#^https?://#i', $rawInput);
$candidateUrl = $hasScheme ? $rawInput : 'https://' . $rawInput;

$parsed = parse_url($candidateUrl);
if ($parsed === false || empty($parsed['host'])) {
    jsonResponse(false, 'Please enter a valid website domain or URL.', null, 422);
}

$scheme = strtolower($parsed['scheme'] ?? 'https');
if ($scheme !== 'http' && $scheme !== 'https') {
    jsonResponse(false, 'Only HTTP and HTTPS URLs are supported.', null, 422);
}

$host = strtolower($parsed['host']);
if (strlen($host) > MAX_HOST_LENGTH) {
    jsonResponse(false, 'Hostname exceeds maximum allowed length of ' . MAX_HOST_LENGTH . ' characters.', null, 422);
}

// Validate hostname syntax
if (!preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i', $host)) {
    // If not a standard hostname, check if it's an IP
    if (!filter_var($host, FILTER_VALIDATE_IP)) {
        jsonResponse(false, 'Invalid domain or hostname format.', null, 422);
    }
}

// SSRF prevention: Reject loopback, localhost, and private/reserved ranges
if ($host === 'localhost' || str_ends_with($host, '.localhost') || str_ends_with($host, '.local') || str_ends_with($host, '.internal') || str_ends_with($host, '.test')) {
    jsonResponse(false, 'Local or internal hostnames cannot be checked.', null, 422);
}

if (filter_var($host, FILTER_VALIDATE_IP)) {
    $isPublicIp = (bool) filter_var(
        $host,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );
    if (!$isPublicIp) {
        jsonResponse(false, 'Private or reserved IP addresses cannot be checked.', null, 422);
    }
}

// Clean path, query, and drop fragment (#...)
$path = $parsed['path'] ?? '/';
if ($path === '') {
    $path = '/';
}
$query = isset($parsed['query']) ? '?' . $parsed['query'] : '';
$port = isset($parsed['port']) ? ':' . $parsed['port'] : '';

// Normalized target URL (preserves page path for PA accuracy)
$normalizedTarget = "{$scheme}://{$host}{$port}{$path}{$query}";

// Record lookup timestamp for rate limiting
$recentTimestamps[] = $currentTime;
@file_put_contents($rateLimitFile, json_encode(array_values($recentTimestamps)), LOCK_EX);

/*
|--------------------------------------------------------------------------
| SEO Metrics Provider Resolution
|--------------------------------------------------------------------------
| Supports official Mozscape / Moz Links API v2, or generic/RapidAPI SEO endpoint.
| If credentials are not configured, returns clear, honest 503 response.
|--------------------------------------------------------------------------
*/
$mozAccessId = env('MOZ_ACCESS_ID', '');
$mozSecretKey = env('MOZ_SECRET_KEY', '');
$customApiKey = env('DA_PA_API_KEY', '');
$customApiUrl = env('DA_PA_API_URL', '');

$hasMozCredentials = $mozAccessId !== '' && $mozSecretKey !== '';
$hasCustomCredentials = $customApiKey !== '';

if (!$hasMozCredentials && !$hasCustomCredentials) {
    jsonResponse(
        false,
        'Server not respond.',
        null,
        503
    );
}

$ch = curl_init();
$headers = [
    'Accept: application/json',
    'User-Agent: XeooTools-DAPAMetrics/1.0',
];

$providerName = 'SEO Metrics Provider';
$normalizedDa = null;
$normalizedPa = null;
$spamScore = null;
$rootDomains = null;
$backlinks = null;

if ($hasMozCredentials) {
    $providerName = 'Moz Links API';
    $mozApiEndpoint = 'https://lsapi.seomoz.com/v2/url_metrics';

    $requestPayload = json_encode([
        'targets' => [$normalizedTarget],
    ]);

    $authString = base64_encode("{$mozAccessId}:{$mozSecretKey}");
    $headers[] = 'Content-Type: application/json';
    $headers[] = "Authorization: Basic {$authString}";

    curl_setopt_array($ch, [
        CURLOPT_URL => $mozApiEndpoint,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $requestPayload,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => PROVIDER_TIMEOUT_SECONDS,
        CURLOPT_CONNECTTIMEOUT => PROVIDER_CONNECT_TIMEOUT_SECONDS,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
} else {
    // Custom / RapidAPI Provider
    $providerName = env('DA_PA_PROVIDER_NAME', 'Authorized SEO Provider');
    $endpoint = $customApiUrl !== '' ? $customApiUrl : 'https://lsapi.seomoz.com/v2/url_metrics';

    $headers[] = 'Content-Type: application/json';
    if (str_contains($endpoint, 'rapidapi.com')) {
        $headers[] = "x-rapidapi-key: {$customApiKey}";
        $rapidHost = env('DA_PA_API_HOST', parse_url($endpoint, PHP_URL_HOST) ?? '');
        if ($rapidHost !== '') {
            $headers[] = "x-rapidapi-host: {$rapidHost}";
        }
    } else {
        $headers[] = "Authorization: Bearer {$customApiKey}";
    }

    $requestPayload = json_encode([
        'targets' => [$normalizedTarget],
        'target' => $normalizedTarget,
    ]);

    curl_setopt_array($ch, [
        CURLOPT_URL => $endpoint,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $requestPayload,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => PROVIDER_TIMEOUT_SECONDS,
        CURLOPT_CONNECTTIMEOUT => PROVIDER_CONNECT_TIMEOUT_SECONDS,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
}

$rawResponse = curl_exec($ch);
$curlErrno = curl_errno($ch);
$httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlErrno === CURLE_OPERATION_TIMEDOUT) {
    jsonResponse(false, 'The metrics provider timed out. Please try again later.', null, 504);
}

if ($curlErrno !== 0 || $rawResponse === false) {
    jsonResponse(false, 'The metrics provider is currently unavailable.', null, 502);
}

if ($httpStatus === 401 || $httpStatus === 403) {
    jsonResponse(false, 'Metrics provider authentication failed or invalid credentials.', null, 502);
}

if ($httpStatus === 429) {
    jsonResponse(false, 'The metrics provider rate limit or quota has been reached.', null, 429);
}

if ($httpStatus >= 500) {
    jsonResponse(false, 'The metrics provider is currently unavailable.', null, 502);
}

$decoded = json_decode((string) $rawResponse, true);
if (!is_array($decoded)) {
    jsonResponse(false, 'The metrics provider returned an invalid response format.', null, 502);
}

/*
|--------------------------------------------------------------------------
| Normalize Provider Response
|--------------------------------------------------------------------------
*/
// Check standard Moz v2 response: results_by_target array
if (isset($decoded['results_by_target']) && is_array($decoded['results_by_target']) && !empty($decoded['results_by_target'][0])) {
    $item = $decoded['results_by_target'][0];

    if (isset($item['domain_authority']) && is_numeric($item['domain_authority'])) {
        $normalizedDa = (int) round((float) $item['domain_authority']);
    }

    if (isset($item['page_authority']) && is_numeric($item['page_authority'])) {
        $normalizedPa = (int) round((float) $item['page_authority']);
    }

    if (isset($item['spam_score']) && is_numeric($item['spam_score']) && (float) $item['spam_score'] >= 0) {
        $spamScore = (int) round((float) $item['spam_score']);
    }

    if (isset($item['root_domains_to_root_domain']) && is_numeric($item['root_domains_to_root_domain'])) {
        $rootDomains = (int) $item['root_domains_to_root_domain'];
    }

    if (isset($item['external_pages_to_root_domain']) && is_numeric($item['external_pages_to_root_domain'])) {
        $backlinks = (int) $item['external_pages_to_root_domain'];
    }
} elseif (isset($decoded['data']) && is_array($decoded['data'])) {
    $item = $decoded['data'];

    if (isset($item['da']) && is_numeric($item['da'])) {
        $normalizedDa = (int) round((float) $item['da']);
    } elseif (isset($item['domain_authority']) && is_numeric($item['domain_authority'])) {
        $normalizedDa = (int) round((float) $item['domain_authority']);
    }

    if (isset($item['pa']) && is_numeric($item['pa'])) {
        $normalizedPa = (int) round((float) $item['pa']);
    } elseif (isset($item['page_authority']) && is_numeric($item['page_authority'])) {
        $normalizedPa = (int) round((float) $item['page_authority']);
    }

    if (isset($item['spam_score']) && is_numeric($item['spam_score'])) {
        $spamScore = (int) round((float) $item['spam_score']);
    }

    if (isset($item['linking_root_domains']) && is_numeric($item['linking_root_domains'])) {
        $rootDomains = (int) $item['linking_root_domains'];
    }

    if (isset($item['backlinks']) && is_numeric($item['backlinks'])) {
        $backlinks = (int) $item['backlinks'];
    }
} else {
    // Top-level direct keys check
    if (isset($decoded['domain_authority']) && is_numeric($decoded['domain_authority'])) {
        $normalizedDa = (int) round((float) $decoded['domain_authority']);
    } elseif (isset($decoded['da']) && is_numeric($decoded['da'])) {
        $normalizedDa = (int) round((float) $decoded['da']);
    }

    if (isset($decoded['page_authority']) && is_numeric($decoded['page_authority'])) {
        $normalizedPa = (int) round((float) $decoded['page_authority']);
    } elseif (isset($decoded['pa']) && is_numeric($decoded['pa'])) {
        $normalizedPa = (int) round((float) $decoded['pa']);
    }

    if (isset($decoded['spam_score']) && is_numeric($decoded['spam_score'])) {
        $spamScore = (int) round((float) $decoded['spam_score']);
    }

    if (isset($decoded['root_domains_to_root_domain']) && is_numeric($decoded['root_domains_to_root_domain'])) {
        $rootDomains = (int) $decoded['root_domains_to_root_domain'];
    } elseif (isset($decoded['linking_root_domains']) && is_numeric($decoded['linking_root_domains'])) {
        $rootDomains = (int) $decoded['linking_root_domains'];
    }

    if (isset($decoded['external_pages_to_root_domain']) && is_numeric($decoded['external_pages_to_root_domain'])) {
        $backlinks = (int) $decoded['external_pages_to_root_domain'];
    } elseif (isset($decoded['backlinks']) && is_numeric($decoded['backlinks'])) {
        $backlinks = (int) $decoded['backlinks'];
    }
}

// Metric Integrity: if both DA and PA are null/absent, target has no data recorded in provider
if ($normalizedDa === null && $normalizedPa === null) {
    jsonResponse(
        true,
        'No DA/PA metrics are currently available for this target.',
        [
            'target' => $normalizedTarget,
            'domain' => $host,
            'da' => null,
            'pa' => null,
            'spam_score' => null,
            'linking_root_domains' => null,
            'backlinks' => null,
            'source' => $providerName,
            'checked_at' => date('c'),
        ]
    );
}

jsonResponse(
    true,
    'DA/PA check completed.',
    [
        'target' => $normalizedTarget,
        'domain' => $host,
        'da' => $normalizedDa,
        'pa' => $normalizedPa,
        'spam_score' => $spamScore,
        'linking_root_domains' => $rootDomains,
        'backlinks' => $backlinks,
        'source' => $providerName,
        'checked_at' => date('c'),
    ]
);
