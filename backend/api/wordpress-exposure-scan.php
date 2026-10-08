<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools — WordPress Exposure Scanner API
|--------------------------------------------------------------------------
| Safe, non-destructive, GET-only exposure scanner for WordPress endpoints.
| Authoritative security gate with SSRF protection, strict timeouts,
| body size limits, rate limiting, and concurrency control.
|--------------------------------------------------------------------------
*/

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
    jsonResponse(false, 'Method not allowed.', null, 405);
}

/*
|--------------------------------------------------------------------------
| Rate Limiting & Concurrency Guard
|--------------------------------------------------------------------------
*/
$rawClientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$clientHash = hash('sha256', $rawClientIp);

$lockDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'xeoo_wp_scanner';
if (!is_dir($lockDir)) {
    @mkdir($lockDir, 0755, true);
}

// 1. Concurrency Check (Max 1 active scan per client IP)
$clientLockPath = $lockDir . DIRECTORY_SEPARATOR . 'active_' . $clientHash . '.lock';
$clientLockFp = @fopen($clientLockPath, 'c+');

if (!$clientLockFp || !@flock($clientLockFp, LOCK_EX | LOCK_NB)) {
    if ($clientLockFp) {
        fclose($clientLockFp);
    }
    jsonResponse(false, 'A scan is already in progress. Please wait for it to complete.', null, 429, [
        'Retry-After' => '10',
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

// 2. Rate Limit (Max 5 completed scans per 10 minutes per IP)
$rateLimitFile = $lockDir . DIRECTORY_SEPARATOR . 'rate_' . $clientHash . '.json';
$currentTime = time();
$windowSeconds = 600; // 10 minutes
$maxScansPerWindow = 5;
$cooldownSeconds = 5;

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
    $lastScanTime = max($recentTimestamps);
    if (($currentTime - $lastScanTime) < $cooldownSeconds) {
        jsonResponse(false, 'Please wait a few seconds before starting another scan.', null, 429, [
            'Retry-After' => (string) ($cooldownSeconds - ($currentTime - $lastScanTime)),
        ]);
    }
}

if (count($recentTimestamps) >= $maxScansPerWindow) {
    $oldest = min($recentTimestamps);
    $retryAfter = max(10, $windowSeconds - ($currentTime - $oldest));
    jsonResponse(false, 'Scan rate limit reached. Please wait a few minutes before scanning again.', null, 429, [
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

$rawInput = isset($payload['url']) && is_string($payload['url'])
    ? trim($payload['url'])
    : '';

if ($rawInput === '') {
    jsonResponse(false, 'Target URL is required.', null, 422);
}

if (strlen($rawInput) > 2048) {
    jsonResponse(false, 'Target URL exceeds maximum length.', null, 422);
}

// Clean surrounding quotes, whitespace, and brackets
$cleanTarget = preg_replace('/^[\s\'"\(<]+|[\s\'"\)>]+$/', '', $rawInput) ?? $rawInput;

// Reject dangerous schemes
if (preg_match('/^(file|ftp|gopher|data|javascript|php|ssh|telnet|dict|ldap|mailto):/i', $cleanTarget)) {
    jsonResponse(false, 'Invalid scheme. Only HTTP and HTTPS are permitted.', null, 422);
}

// Reject embedded credentials (user:pass@host)
if (preg_match('#^[a-zA-Z][a-zA-Z0-9+.-]*://[^/]*@#', $cleanTarget) || str_contains(explode('/', $cleanTarget)[0], '@')) {
    jsonResponse(false, 'Embedded credentials in URLs are not allowed.', null, 422);
}

// Determine scheme and base domain
$hasScheme = (bool) preg_match('/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//', $cleanTarget);
$workingUrl = $hasScheme ? $cleanTarget : 'https://' . $cleanTarget;

$parsed = parse_url($workingUrl);
if ($parsed === false || empty($parsed['host'])) {
    jsonResponse(false, 'Malformed or unparseable target URL.', null, 422);
}

$scheme = strtolower($parsed['scheme'] ?? 'https');
if ($scheme !== 'http' && $scheme !== 'https') {
    jsonResponse(false, 'Only HTTP and HTTPS protocols are allowed.', null, 422);
}

$rawHost = strtolower(rtrim($parsed['host'], '.'));
$port = isset($parsed['port']) ? (int) $parsed['port'] : ($scheme === 'https' ? 443 : 80);

// Reject control characters or path separators in host
if ($rawHost === '' || preg_match('/[\s\/\\\\\?\#\@\:\%\<\>\*]/', $rawHost)) {
    jsonResponse(false, 'Invalid hostname format.', null, 422);
}

/*
|--------------------------------------------------------------------------
| SSRF Validation: Private & Reserved IP Guard
|--------------------------------------------------------------------------
*/
function isPrivateOrReservedIp(string $ip): bool
{
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        return true;
    }

    // Standard private & reserved checks
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return true;
    }

    // Explicit cloud metadata and loopback guards
    if ($ip === '169.254.169.254' || str_starts_with($ip, '169.254.')) {
        return true;
    }

    if ($ip === '0.0.0.0' || str_starts_with($ip, '127.')) {
        return true;
    }

    if ($ip === '::1' || $ip === '::') {
        return true;
    }

    // IPv6 link-local & unique local
    $lower = strtolower($ip);
    if (
        str_starts_with($lower, 'fe8') ||
        str_starts_with($lower, 'fe9') ||
        str_starts_with($lower, 'fea') ||
        str_starts_with($lower, 'feb') ||
        str_starts_with($lower, 'fc') ||
        str_starts_with($lower, 'fd')
    ) {
        return true;
    }

    return false;
}

function resolveAndValidateDestination(string $host): array
{
    // If raw IP address was provided
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        if (isPrivateOrReservedIp($host)) {
            return [];
        }
        return [$host];
    }

    // Reject localhost aliases
    if (in_array($host, ['localhost', 'localhost.localdomain', 'ip6-localhost', 'ip6-loopback'], true)) {
        return [];
    }

    $ips = [];

    // DNS A records
    $recordsA = @dns_get_record($host, DNS_A);
    if (is_array($recordsA)) {
        foreach ($recordsA as $rec) {
            if (!empty($rec['ip'])) {
                $ips[] = $rec['ip'];
            }
        }
    }

    // Fallback gethostbynamel
    if (empty($ips)) {
        $fallback = @gethostbynamel($host);
        if (is_array($fallback)) {
            $ips = array_merge($ips, $fallback);
        }
    }

    // DNS AAAA records
    $recordsAAAA = @dns_get_record($host, DNS_AAAA);
    if (is_array($recordsAAAA)) {
        foreach ($recordsAAAA as $rec) {
            if (!empty($rec['ipv6'])) {
                $ips[] = $rec['ipv6'];
            }
        }
    }

    $ips = array_values(array_unique($ips));

    if (empty($ips)) {
        return [];
    }

    // If ANY resolved IP is in private/reserved space, fail closed
    foreach ($ips as $resolvedIp) {
        if (isPrivateOrReservedIp($resolvedIp)) {
            return [];
        }
    }

    return $ips;
}

$validatedIps = resolveAndValidateDestination($rawHost);

if (empty($validatedIps)) {
    jsonResponse(false, 'Request rejected.', null, 422);
}

// Record scan attempt in rate limit history
$recentTimestamps[] = $currentTime;
@file_put_contents($rateLimitFile, json_encode(array_values($recentTimestamps)), LOCK_EX);

// Select primary pinned IP (prefer IPv4 for stability)
$pinnedIp = $validatedIps[0];
foreach ($validatedIps as $ipCandidate) {
    if (filter_var($ipCandidate, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $pinnedIp = $ipCandidate;
        break;
    }
}

/*
|--------------------------------------------------------------------------
| Safe Outbound HTTP GET Client
|--------------------------------------------------------------------------
| - Pinned IP using CURLOPT_RESOLVE (DNS Rebinding protection)
| - Stream-capped body (Max 512 KB)
| - Strict connection & request timeouts
| - TLS certificate validation
| - Follow redirects = false
|--------------------------------------------------------------------------
*/
const MAX_BODY_BYTES = 524288; // 512 KB
const CONNECT_TIMEOUT = 5;
const REQUEST_TIMEOUT = 10;
const SCAN_BUDGET_SECONDS = 30;

$scanStartTime = microtime(true);

function safeHttpGet(
    string $url,
    string $host,
    int $port,
    string $pinnedIp,
    int $timeout = REQUEST_TIMEOUT
): array {
    $ch = curl_init();

    $body = '';
    $headers = [];

    // CURLOPT_RESOLVE format: "hostname:port:ip"
    $resolveEntry = "{$host}:{$port}:{$pinnedIp}";

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => false,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_CONNECTTIMEOUT => CONNECT_TIMEOUT,
        CURLOPT_TIMEOUT => $timeout,
        CURLOPT_USERAGENT => 'XEOO-WordPress-Scanner/4.2 (Defensive Exposure Audit)',
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.5',
            'Connection: close',
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_RESOLVE => [$resolveEntry],
        CURLOPT_HEADERFUNCTION => function ($ch, $headerLine) use (&$headers) {
            $len = strlen($headerLine);
            $trimmed = trim($headerLine);
            if ($trimmed !== '') {
                $headers[] = $trimmed;
            }
            return $len;
        },
        CURLOPT_WRITEFUNCTION => function ($ch, $chunk) use (&$body) {
            $chunkLen = strlen($chunk);
            $curLen = strlen($body);
            if ($curLen + $chunkLen > MAX_BODY_BYTES) {
                $allowed = max(0, MAX_BODY_BYTES - $curLen);
                if ($allowed > 0) {
                    $body .= substr($chunk, 0, $allowed);
                }
                return 0; // Gracefully stop reading further bytes
            }
            $body .= $chunk;
            return $chunkLen;
        },
    ]);

    $startTime = microtime(true);
    $success = curl_exec($ch);
    $elapsedMs = (int) round((microtime(true) - $startTime) * 1000);

    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErrno = curl_errno($ch);
    $curlError = curl_error($ch);
    $redirectUrl = (string) (curl_getinfo($ch, CURLINFO_REDIRECT_URL) ?: '');

    curl_close($ch);

    $errorCategory = 'OK';
    if ($curlErrno !== CURLE_OK) {
        if ($curlErrno === CURLE_OPERATION_TIMEDOUT) {
            $errorCategory = 'TIMEOUT';
        } elseif (
            $curlErrno === CURLE_SSL_CONNECT_ERROR ||
            $curlErrno === CURLE_PEER_FAILED_VERIFICATION ||
            $curlErrno === CURLE_SSL_CERTPROBLEM ||
            $curlErrno === CURLE_SSL_CIPHER ||
            $curlErrno === CURLE_SSL_CACERT
        ) {
            $errorCategory = 'SSL_ERROR';
        } elseif ($curlErrno === CURLE_COULDNT_CONNECT || $curlErrno === CURLE_COULDNT_RESOLVE_HOST) {
            $errorCategory = 'CONNECTION_ERROR';
        } else {
            $errorCategory = 'ERROR';
        }
    }

    return [
        'http_code' => $httpCode,
        'body' => $body,
        'headers' => $headers,
        'redirect_url' => $redirectUrl,
        'elapsed_ms' => $elapsedMs,
        'curl_errno' => $curlErrno,
        'curl_error' => $curlError,
        'error_category' => $errorCategory,
    ];
}

/*
|--------------------------------------------------------------------------
| Step 1: Protocol Discovery (HTTP vs HTTPS)
|--------------------------------------------------------------------------
*/
$httpsUrl = "https://{$rawHost}";
$httpUrl = "http://{$rawHost}";

$httpsResponse = safeHttpGet($httpsUrl, $rawHost, 443, $pinnedIp, 8);
$httpResponse = null;

$activeUrl = '';
$baseResponse = null;

if ($httpsResponse['error_category'] === 'OK' && $httpsResponse['http_code'] > 0) {
    $activeUrl = $httpsUrl;
    $baseResponse = $httpsResponse;
} else {
    // If HTTPS failed due to SSL or timeout, attempt plain HTTP
    $httpResponse = safeHttpGet($httpUrl, $rawHost, 80, $pinnedIp, 8);
    if ($httpResponse['error_category'] === 'OK' && $httpResponse['http_code'] > 0) {
        $activeUrl = $httpUrl;
        $baseResponse = $httpResponse;
    } else {
        // If both failed, report error
        $reason = $httpsResponse['error_category'] !== 'OK'
            ? $httpsResponse['error_category']
            : ($httpResponse['error_category'] ?? 'CONNECTION_ERROR');

        jsonResponse(true, 'Target unreachable.', [
            'target' => $rawHost,
            'input' => $rawInput,
            'active_url' => $httpsUrl,
            'final_url' => $httpsUrl,
            'http_status' => $httpResponse['http_code'] ?? null,
            'https_status' => $httpsResponse['http_code'] ?? null,
            'response_time' => $httpsResponse['elapsed_ms'],
            'wordpress' => [
                'detected' => false,
                'signals' => [],
            ],
            'wp_rest' => [
                'status' => 'ERROR',
                'http_status' => null,
                'url' => "{$httpsUrl}/wp-json/",
                'detail' => "Target connection failed: {$reason}.",
            ],
            'exposure_summary' => [
                'detected' => 0,
                'blocked' => 0,
                'not_found' => 0,
                'inconclusive' => 0,
                'total_checked' => 0,
            ],
            'assessment' => 'ERROR',
            'assessment_label' => 'Scan Error',
            'assessment_description' => "Unable to establish connection to {$rawHost} ({$reason}).",
            'upload_endpoints' => [],
        ]);
    }
}

$activeParsed = parse_url($activeUrl);
$activePort = ($activeParsed['scheme'] ?? 'https') === 'https' ? 443 : 80;

/*
|--------------------------------------------------------------------------
| Step 2: WordPress Detection
|--------------------------------------------------------------------------
*/
$wpSignals = [];
$baseBody = $baseResponse['body'] ?? '';
$baseHeadersStr = implode("\n", $baseResponse['headers'] ?? []);

// Inspect body signatures
if (str_contains($baseBody, 'wp-content')) {
    $wpSignals[] = 'wp-content';
}
if (str_contains($baseBody, 'wp-includes')) {
    $wpSignals[] = 'wp-includes';
}
if (str_contains($baseBody, '/wp-json/')) {
    $wpSignals[] = '/wp-json/';
}
if (preg_match('/<meta[^>]+name=[\'"]generator[\'"][^>]+content=[\'"]WordPress/i', $baseBody)) {
    $wpSignals[] = 'meta generator (WordPress)';
}
if (str_contains($baseBody, 'wp-login.php')) {
    $wpSignals[] = 'wp-login.php';
}
if (str_contains($baseBody, 'wp-admin')) {
    $wpSignals[] = 'wp-admin';
}

// Inspect header signatures
if (preg_match('/x-powered-by:.*(wp|wordpress)/i', $baseHeadersStr)) {
    $wpSignals[] = 'X-Powered-By Header';
}
if (preg_match('/link:.*<[^>]*\/wp-json\/[^>]*>;\s*rel=[\'"]https:\/\/api\.w\.org\/[\'"]/i', $baseHeadersStr)) {
    $wpSignals[] = 'Link API Header';
}

$wpDetected = count($wpSignals) > 0;

/*
|--------------------------------------------------------------------------
| Step 3: Check WordPress REST API (/wp-json/)
|--------------------------------------------------------------------------
*/
$restUrl = rtrim($activeUrl, '/') . '/wp-json/';
$restResponse = safeHttpGet($restUrl, $rawHost, $activePort, $pinnedIp, 6);

$restStatus = 'NOT DETECTED';
$restDetail = 'REST API endpoint did not respond with valid WordPress API schema.';
$restHttpCode = $restResponse['http_code'];

if ($restResponse['error_category'] === 'SSL_ERROR') {
    $restStatus = 'SSL ERROR';
    $restDetail = 'SSL/TLS handshake failed during REST API request.';
} elseif ($restResponse['error_category'] === 'TIMEOUT') {
    $restStatus = 'TIMEOUT';
    $restDetail = 'REST API request timed out.';
} elseif ($restHttpCode === 401 || $restHttpCode === 403) {
    $restStatus = 'BLOCKED';
    $restDetail = "Access restricted (HTTP {$restHttpCode}).";
} elseif ($restHttpCode === 404) {
    $restStatus = 'NOT FOUND';
    $restDetail = 'Endpoint /wp-json/ returned 404 Not Found.';
} elseif ($restHttpCode === 200) {
    $restJson = @json_decode($restResponse['body'], true);
    if (is_array($restJson) && (isset($restJson['namespaces']) || isset($restJson['routes']) || isset($restJson['name']))) {
        $restStatus = 'DETECTED';
        $siteName = !empty($restJson['name']) ? " (\"{$restJson['name']}\")" : '';
        $restDetail = "WordPress REST API is accessible{$siteName}.";
        if (!$wpDetected) {
            $wpDetected = true;
            $wpSignals[] = 'REST API (/wp-json/)';
        }
    } else {
        $restStatus = 'NOT DETECTED';
        $restDetail = 'HTTP 200 returned but body does not match WordPress REST API schema.';
    }
} elseif ($restHttpCode >= 500) {
    $restStatus = 'ERROR';
    $restDetail = "Target returned server error (HTTP {$restHttpCode}).";
}

/*
|--------------------------------------------------------------------------
| Step 4: Endpoint Signature Definitions (From Source Scanner V4.2)
|--------------------------------------------------------------------------
*/
$endpointDefinitions = [
    // WordPress Core
    [
        'category' => 'WordPress Core',
        'name' => 'WordPress Async Upload',
        'path' => '/wp-admin/async-upload.php',
        'signatures' => ['async-upload.php', 'media-upload', 'error-upload', '{"success":false,"data":'],
    ],
    [
        'category' => 'WordPress Core',
        'name' => 'WordPress Media Upload',
        'path' => '/wp-admin/media-new.php',
        'signatures' => ['media-new.php', 'upload-php', 'media-upload', 'plupload'],
    ],
    [
        'category' => 'WordPress Core',
        'name' => 'WordPress Media Library',
        'path' => '/wp-admin/upload.php',
        'signatures' => ['upload.php', 'Media Library', 'media-frame'],
    ],
    [
        'category' => 'WordPress Core',
        'name' => 'WordPress Admin AJAX',
        'path' => '/wp-admin/admin-ajax.php',
        'signatures' => ['admin-ajax.php', '0', '{"success":', '-1'],
        'exact_body' => ['0', '-1'],
    ],

    // WP File Manager
    [
        'category' => 'WP File Manager',
        'name' => 'WP File Manager Directory',
        'path' => '/wp-content/plugins/wp-file-manager/',
        'signatures' => ['wp-file-manager', 'Index of', 'file-manager'],
    ],
    [
        'category' => 'WP File Manager',
        'name' => 'WP File Manager Connector Minimal',
        'path' => '/wp-content/plugins/wp-file-manager/lib/php/connector.minimal.php',
        'signatures' => ['{"error":', 'errUnknownCmd', 'connector.minimal.php', 'elFinder', 'netDrivers'],
    ],
    [
        'category' => 'WP File Manager',
        'name' => 'WP File Manager Connector',
        'path' => '/wp-content/plugins/wp-file-manager/lib/php/connector.php',
        'signatures' => ['{"error":', 'errUnknownCmd', 'connector.php', 'elFinder', 'netDrivers'],
    ],

    // Generic File Manager
    [
        'category' => 'Generic File Manager',
        'name' => 'File Manager Directory',
        'path' => '/wp-content/plugins/file-manager/',
        'signatures' => ['file-manager', 'Index of', 'readme.txt'],
    ],
    [
        'category' => 'Generic File Manager',
        'name' => 'File Manager Connector',
        'path' => '/wp-content/plugins/file-manager/lib/php/connector.php',
        'signatures' => ['{"error":', 'errUnknownCmd', 'elFinder', 'connector.php'],
    ],

    // KCFinder
    [
        'category' => 'KCFinder',
        'name' => 'KCFinder Directory',
        'path' => '/kcfinder/',
        'signatures' => ['kcfinder', 'browse.php', 'KCFinder'],
    ],
    [
        'category' => 'KCFinder',
        'name' => 'KCFinder Browser',
        'path' => '/kcfinder/browse.php',
        'signatures' => ['kcfinder', 'browse.php', 'KCFinder', 'files.php'],
    ],
    [
        'category' => 'KCFinder',
        'name' => 'KCFinder Dialog',
        'path' => '/kcfinder/assets/filemanager/dialog.php',
        'signatures' => ['kcfinder', 'dialog.php', 'KCFinder'],
    ],

    // CKEditor / CKFinder / FCKeditor
    [
        'category' => 'CKEditor / CKFinder',
        'name' => 'CKEditor Path',
        'path' => '/ckeditor/',
        'signatures' => ['ckeditor.js', 'CKEDITOR', 'ckeditor'],
    ],
    [
        'category' => 'CKEditor / CKFinder',
        'name' => 'CKFinder Path',
        'path' => '/ckfinder/',
        'signatures' => ['ckfinder.js', 'CKFinder', 'ckfinder.html'],
    ],
    [
        'category' => 'CKEditor / CKFinder',
        'name' => 'FCKeditor Path',
        'path' => '/fckeditor/',
        'signatures' => ['fckeditor.js', 'FCKeditor', 'fckeditor.html'],
    ],

    // SEOTheme Signature
    [
        'category' => 'SEOTheme',
        'name' => 'SEOTheme Endpoint',
        'path' => '/wp-content/themes/seotheme/db.php?u',
        'signatures' => ['Files Man', 'Upload', 'seotheme', 'db.php'],
    ],
];

/*
|--------------------------------------------------------------------------
| Step 5: Execute Endpoint Checks
|--------------------------------------------------------------------------
*/
$endpointResults = [];
$counts = [
    'detected' => 0,
    'blocked' => 0,
    'not_found' => 0,
    'inconclusive' => 0,
    'total_checked' => 0,
];

foreach ($endpointDefinitions as $ep) {
    // Check scan budget
    if ((microtime(true) - $scanStartTime) >= SCAN_BUDGET_SECONDS) {
        $endpointResults[] = [
            'category' => $ep['category'],
            'name' => $ep['name'],
            'path' => $ep['path'],
            'url' => rtrim($activeUrl, '/') . $ep['path'],
            'status' => 'TIMEOUT',
            'http_status' => null,
            'matched' => [],
            'elapsed_ms' => 0,
        ];
        $counts['inconclusive']++;
        $counts['total_checked']++;
        continue;
    }

    $targetUrl = rtrim($activeUrl, '/') . $ep['path'];
    $resp = safeHttpGet($targetUrl, $rawHost, $activePort, $pinnedIp, 5);

    $httpCode = $resp['http_code'];
    $status = 'NOT DETECTED';
    $matchedSignatures = [];

    if ($resp['error_category'] === 'SSL_ERROR') {
        $status = 'SSL ERROR';
        $counts['inconclusive']++;
    } elseif ($resp['error_category'] === 'TIMEOUT') {
        $status = 'TIMEOUT';
        $counts['inconclusive']++;
    } elseif ($resp['error_category'] === 'CONNECTION_ERROR') {
        $status = 'CONNECTION ERROR';
        $counts['inconclusive']++;
    } elseif ($httpCode === 401 || $httpCode === 403) {
        $status = 'BLOCKED';
        $counts['blocked']++;
    } elseif ($httpCode === 404) {
        $status = 'NOT FOUND';
        $counts['not_found']++;
    } elseif ($httpCode >= 500) {
        $status = 'SERVER ERROR';
        $counts['inconclusive']++;
    } elseif ($httpCode >= 200 && $httpCode < 300) {
        // Inspect body for recognized signatures
        $body = $resp['body'];

        // Exact body matches (e.g. admin-ajax returning literal '0')
        if (!empty($ep['exact_body'])) {
            $trimmedBody = trim($body);
            foreach ($ep['exact_body'] as $exact) {
                if ($trimmedBody === $exact) {
                    $matchedSignatures[] = "Response: {$exact}";
                }
            }
        }

        // Substring signature matches
        foreach ($ep['signatures'] as $sig) {
            if (stripos($body, $sig) !== false) {
                $matchedSignatures[] = $sig;
            }
        }

        // Deduplicate matched signatures
        $matchedSignatures = array_values(array_unique($matchedSignatures));

        if (!empty($matchedSignatures)) {
            $status = 'DETECTED';
            $counts['detected']++;
        } else {
            // HTTP 200 without recognized signature is NOT detected
            $status = 'NOT DETECTED';
        }
    } elseif ($httpCode >= 300 && $httpCode < 400) {
        // Redirect: check if redirected to login page (normal protected behavior)
        $redir = $resp['redirect_url'];
        if (str_contains($redir, 'wp-login.php')) {
            $status = 'NOT DETECTED';
        } else {
            $status = 'NOT DETECTED';
        }
    } else {
        $status = 'ERROR';
        $counts['inconclusive']++;
    }

    $counts['total_checked']++;

    $endpointResults[] = [
        'category' => $ep['category'],
        'name' => $ep['name'],
        'path' => $ep['path'],
        'url' => $targetUrl,
        'status' => $status,
        'http_status' => $httpCode > 0 ? $httpCode : null,
        'matched' => $matchedSignatures,
        'elapsed_ms' => $resp['elapsed_ms'],
    ];
}

/*
|--------------------------------------------------------------------------
| Step 6: Produce Overall Assessment
|--------------------------------------------------------------------------
*/
$totalScanTimeMs = (int) round((microtime(true) - $scanStartTime) * 1000);

if ($counts['detected'] > 0) {
    $assessment = 'POTENTIALLY VULNERABLE';
    $assessmentLabel = 'Potential Exposure Detected';
    $assessmentDesc = "Detected {$counts['detected']} exposed endpoint signature(s). File upload or manager components may be accessible without proper authentication.";
} elseif ($counts['blocked'] > 0 || $counts['inconclusive'] > 0) {
    $assessment = 'INCONCLUSIVE';
    $assessmentLabel = 'Inconclusive';
    $assessmentDesc = 'Some checks could not be completed because the target blocked, restricted, or interrupted requests.';
} else {
    $assessment = 'NOT DETECTED';
    $assessmentLabel = 'No Exposure Detected';
    $assessmentDesc = 'No configured exposure signatures detected. All tested endpoints are either not present, blocked, or protected.';
}

jsonResponse(true, 'Scan completed.', [
    'target' => $rawHost,
    'input' => $rawInput,
    'active_url' => $activeUrl,
    'final_url' => rtrim($activeUrl, '/') . '/',
    'http_status' => $httpResponse['http_code'] ?? null,
    'https_status' => $httpsResponse['http_code'] ?? null,
    'response_time' => $totalScanTimeMs,
    'wordpress' => [
        'detected' => $wpDetected,
        'signals' => array_values(array_unique($wpSignals)),
    ],
    'wp_rest' => [
        'status' => $restStatus,
        'http_status' => $restHttpCode > 0 ? $restHttpCode : null,
        'url' => $restUrl,
        'detail' => $restDetail,
    ],
    'exposure_summary' => $counts,
    'assessment' => $assessment,
    'assessment_label' => $assessmentLabel,
    'assessment_description' => $assessmentDesc,
    'upload_endpoints' => $endpointResults,
]);
