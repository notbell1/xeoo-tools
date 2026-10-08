<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools — Admin Finder API
|--------------------------------------------------------------------------
| Safe, non-destructive, GET-only discovery scanner for publicly reachable
| login and administration surfaces across a target website and subdomains.
| Authoritative security gate with SSRF protection, DNS validation, IP pinning,
| rate limiting, request budgeting, response size limits, and concurrency control.
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

$lockDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'xeoo_admin_finder';
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

// 2. Rate Limit (Max 5 scans per 10 minutes per IP)
$rateLimitFile = $lockDir . DIRECTORY_SEPARATOR . 'rate_' . $clientHash . '.json';
$currentTime = time();
$windowSeconds = 600; // 10 minutes
$maxScansPerWindow = 5;
$cooldownSeconds = 4;

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

$rawInput = '';
if (isset($payload['target']) && is_string($payload['target'])) {
    $rawInput = trim($payload['target']);
} elseif (isset($payload['url']) && is_string($payload['url'])) {
    $rawInput = trim($payload['url']);
}

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
    $recordsAaaa = @dns_get_record($host, DNS_AAAA);
    if (is_array($recordsAaaa)) {
        foreach ($recordsAaaa as $rec) {
            if (!empty($rec['ipv6'])) {
                $ips[] = $rec['ipv6'];
            }
        }
    }

    $ips = array_values(array_unique($ips));

    if (empty($ips)) {
        return [];
    }

    // Any private IP invalidates the host
    foreach ($ips as $ip) {
        if (isPrivateOrReservedIp($ip)) {
            return [];
        }
    }

    return $ips;
}

$validatedIps = resolveAndValidateDestination($rawHost);
if (empty($validatedIps)) {
    jsonResponse(false, 'Target destination cannot be reached or resolved to a disallowed address.', null, 422);
}

$pinnedIp = $validatedIps[0];

/*
|--------------------------------------------------------------------------
| Configuration Datasets Loader
|--------------------------------------------------------------------------
*/
$configDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'admin-finder';

function loadJsonDataset(string $filePath, string $key): array
{
    if (!file_exists($filePath)) {
        return [];
    }

    $content = @file_get_contents($filePath);
    if ($content === false) {
        return [];
    }

    $decoded = json_decode($content, true);
    if (!is_array($decoded) || !isset($decoded[$key]) || !is_array($decoded[$key])) {
        return [];
    }

    return $decoded[$key];
}

$pathsConfig = loadJsonDataset($configDir . DIRECTORY_SEPARATOR . 'paths.json', 'paths');
$subdomainsConfig = loadJsonDataset($configDir . DIRECTORY_SEPARATOR . 'subdomains.json', 'subdomains');
$aliasesConfig = loadJsonDataset($configDir . DIRECTORY_SEPARATOR . 'aliases.json', 'aliases');
$patternsConfig = loadJsonDataset($configDir . DIRECTORY_SEPARATOR . 'patterns.json', 'patterns');

/*
|--------------------------------------------------------------------------
| Safe Outbound Request Helper
|--------------------------------------------------------------------------
*/
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 XeooTools/1.0';
const MAX_BODY_BYTES = 524288; // 512 KB

function executeSafeRequest(string $url, string $host, int $port, string $pinnedIp, int $timeoutSeconds = 7): array
{
    $ch = curl_init();

    // Pin DNS resolution to prevent DNS rebinding
    $resolveEntry = "{$host}:{$port}:{$pinnedIp}";

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RESOLVE => [$resolveEntry],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_USERAGENT => USER_AGENT,
        CURLOPT_HTTPGET => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => $timeoutSeconds,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9',
            'Connection: close',
        ],
    ]);

    $startTime = microtime(true);
    $response = curl_exec($ch);
    $elapsedMs = (int) round((microtime(true) - $startTime) * 1000);

    if ($response === false) {
        $curlErrno = curl_errno($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        return [
            'success' => false,
            'http_status' => null,
            'elapsed_ms' => $elapsedMs,
            'header' => '',
            'body' => '',
            'location' => null,
            'error' => $curlError,
            'errno' => $curlErrno,
        ];
    }

    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $headerText = substr($response, 0, $headerSize);
    $bodyText = substr($response, $headerSize);

    // Limit body size
    if (strlen($bodyText) > MAX_BODY_BYTES) {
        $bodyText = substr($bodyText, 0, MAX_BODY_BYTES);
    }

    // Extract Location header if redirect
    $location = null;
    if (preg_match('/^Location:\s*(.+)$/im', $headerText, $locMatches)) {
        $location = trim($locMatches[1]);
    }

    return [
        'success' => true,
        'http_status' => $httpStatus,
        'elapsed_ms' => $elapsedMs,
        'header' => $headerText,
        'body' => $bodyText,
        'location' => $location,
        'error' => null,
        'errno' => 0,
    ];
}

/*
|--------------------------------------------------------------------------
| Signal Extraction & Page Verification Helper
|--------------------------------------------------------------------------
*/
function analyzeAuthenticationSignals(string $body, string $path, int $status, ?string $location): array
{
    $signals = [];
    $score = 0;
    $lowerBody = strtolower($body);
    $lowerPath = strtolower($path);

    // 1. Password input detection (strongest signal)
    if (preg_match('/<input[^>]+type=[\'"]password[\'"]/i', $body)) {
        $signals[] = 'Password input detected';
        $score += 45;
    }

    // 2. Username / Email input detection
    if (
        preg_match('/<input[^>]+(name|id)=[\'"][^\'"]*(user|username|email|account|identifier|login|auth)[^\'"]*[\'"]/i', $body) ||
        preg_match('/<input[^>]+type=[\'"]email[\'"]/i', $body)
    ) {
        $signals[] = 'Username or email input field detected';
        $score += 20;
    }

    // 3. Form presence
    if (str_contains($lowerBody, '<form')) {
        $signals[] = 'Authentication form container detected';
        $score += 15;
    }

    // 4. Submit / Action text indicators
    if (
        preg_match('/(type=[\'"]submit[\'"][^>]*value=[\'"][^\'"]*(sign\s*in|log\s*in|login|masuk|authenticate)[^\'"]*[\'"])/i', $body) ||
        preg_match('/<button[^>]*>[^<]*(sign\s*in|log\s*in|login|masuk|authenticate|continue)[^<]*<\/button>/i', $body)
    ) {
        $signals[] = 'Sign-in action button detected';
        $score += 15;
    }

    // 5. Title indicators
    if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $body, $titleMatches)) {
        $title = trim(strip_tags($titleMatches[1]));
        if (preg_match('/\b(log\s*in|login|sign\s*in|signin|authentication|admin|dashboard|portal|console)\b/i', $title)) {
            $signals[] = "Authentication keywords in title: \"{$title}\"";
            $score += 15;
        }
    }

    // 6. Common auth terminology in body
    $authTerms = ['forgot password', 'remember me', 'two-factor', '2fa', 'reset password', 'sso login', 'single sign-on'];
    $matchedTerms = [];
    foreach ($authTerms as $term) {
        if (str_contains($lowerBody, $term)) {
            $matchedTerms[] = $term;
        }
    }
    if (!empty($matchedTerms)) {
        $signals[] = 'Supporting auth terminology: ' . implode(', ', array_slice($matchedTerms, 0, 3));
        $score += 10;
    }

    // 7. URL path indicators
    if (preg_match('/\b(login|signin|admin|auth|portal|dashboard)\b/i', $lowerPath)) {
        $signals[] = 'Authentication route terminology in URL path';
        $score += 10;
    }

    // 8. Redirect to login surface
    if ($location !== null && in_array($status, [301, 302, 303, 307, 308], true)) {
        if (preg_match('/(login|signin|sign-in|auth)/i', $location)) {
            $signals[] = "Redirects to authentication endpoint: {$location}";
            $score += 35;
        }
    }

    // 9. HTTP 401 / 403 Authentication Required
    if ($status === 401) {
        $signals[] = 'HTTP 401 Unauthorized / Authentication Challenge';
        $score += 40;
    } elseif ($status === 403 && preg_match('/\b(admin|panel|manage|dashboard)\b/i', $lowerPath)) {
        $signals[] = 'HTTP 403 Forbidden on administration route';
        $score += 30;
    }

    // HTTP 404 or server error responses are non-existent endpoints, not authentication surfaces
    if ($status >= 400 && $status !== 401 && $status !== 403) {
        return [
            'score' => 0,
            'type' => 'NOT DETECTED',
            'confidence' => 'Low',
            'signals' => [],
        ];
    }

    // Determine Classification & Confidence
    $type = 'NOT DETECTED';
    $confidence = 'Low';

    $hasPasswordInput = in_array('Password input detected', $signals, true);
    $hasForm = in_array('Authentication form container detected', $signals, true);

    if ($score >= 65 && $hasPasswordInput) {
        $type = 'LOGIN PAGE';
        $confidence = 'High';
    } elseif ($score >= 75) {
        $type = 'LOGIN PAGE';
        $confidence = 'High';
    } elseif ($status === 401) {
        $type = 'ADMIN PAGE';
        $confidence = 'High';
    } elseif (preg_match('/\b(admin|administrator|controlpanel|cpanel)\b/i', $lowerPath) && ($score >= 40 || in_array($status, [200, 401, 403], true))) {
        $type = 'ADMIN PAGE';
        $confidence = $score >= 60 ? 'High' : ($score >= 40 ? 'Medium' : 'Low');
    } elseif ($score >= 45 || ($location !== null && preg_match('/(login|signin)/i', $location))) {
        $type = 'POSSIBLE AUTH SURFACE';
        $confidence = 'Medium';
    } elseif ($score >= 25) {
        $type = 'POSSIBLE AUTH SURFACE';
        $confidence = 'Low';
    }

    return [
        'score' => $score,
        'type' => $type,
        'confidence' => $confidence,
        'signals' => $signals,
    ];
}

/*
|--------------------------------------------------------------------------
| Scanner Execution Engine
|--------------------------------------------------------------------------
*/
$scanStartMicro = microtime(true);
$overallTimeoutSeconds = 28; // Strict overall budget

$discoveredHosts = [];
$discoveredHosts[$rawHost] = [
    'host' => $rawHost,
    'status' => 'Active',
    'ip' => $pinnedIp,
];

$authSurfaces = [];
$testedPaths = [];
$requestBudget = 36;
$requestsUsed = 0;

$formatCleanUrl = function(string $proto, string $host, int $p, string $path = '/'): string {
    $portSuffix = ($proto === 'https' && $p === 443) || ($proto === 'http' && $p === 80) ? '' : ":{$p}";
    return "{$proto}://{$host}{$portSuffix}{$path}";
};

// Layer 1: Homepage Probe & Link Extraction
$baseProtocol = 'https';
$initialBaseUrl = $formatCleanUrl('https', $rawHost, $port, '/');
$homeRes = executeSafeRequest($initialBaseUrl, $rawHost, $port, $pinnedIp, 6);
$requestsUsed++;

if (!$homeRes['success'] || $homeRes['http_status'] === null) {
    // Try fallback to HTTP if target was entered without scheme and HTTPS failed
    if (!$hasScheme || $scheme === 'http') {
        $fallbackPort = 80;
        $fallbackUrl = $formatCleanUrl('http', $rawHost, $fallbackPort, '/');
        $fallbackRes = executeSafeRequest($fallbackUrl, $rawHost, $fallbackPort, $pinnedIp, 6);
        $requestsUsed++;
        if ($fallbackRes['success'] && $fallbackRes['http_status'] !== null) {
            $baseProtocol = 'http';
            $port = $fallbackPort;
            $homeRes = $fallbackRes;
            $initialBaseUrl = $fallbackUrl;
        }
    }
}

if (!$homeRes['success'] || $homeRes['http_status'] === null) {
    jsonResponse(false, 'Target website could not be contacted or connection timed out.', null, 504);
}

// Check homepage itself for login forms
$homeAnalysis = analyzeAuthenticationSignals($homeRes['body'], '/', $homeRes['http_status'], $homeRes['location']);
if ($homeAnalysis['type'] !== 'NOT DETECTED') {
    $authSurfaces[] = [
        'url' => $initialBaseUrl,
        'path' => '/',
        'host' => $rawHost,
        'category' => 'authentication',
        'type' => $homeAnalysis['type'],
        'confidence' => $homeAnalysis['confidence'],
        'http_status' => $homeRes['http_status'],
        'elapsed_ms' => $homeRes['elapsed_ms'],
        'signals' => $homeAnalysis['signals'],
    ];
    $testedPaths['/'] = true;
}

// Extract public links & subdomains from homepage HTML
$homepageExtractedPaths = [];
$homepageExtractedSubdomains = [];

if (preg_match_all('/<a[^>]+href=[\'"]([^\'"]+)[\'"]/i', $homeRes['body'], $linkMatches)) {
    foreach ($linkMatches[1] as $href) {
        $trimmedHref = trim($href);
        if ($trimmedHref === '' || str_starts_with($trimmedHref, '#') || str_starts_with($trimmedHref, 'javascript:') || str_starts_with($trimmedHref, 'mailto:')) {
            continue;
        }

        // Check for subdomains
        if (preg_match('#^https?://([a-zA-Z0-9.-]+\.' . preg_quote($rawHost, '#') . ')(/.*)?$#i', $trimmedHref, $subMatches)) {
            $subHost = strtolower($subMatches[1]);
            if ($subHost !== $rawHost && !isset($discoveredHosts[$subHost])) {
                $homepageExtractedSubdomains[$subHost] = true;
            }
        }

        // Check for authentication-relevant relative or absolute paths
        $parsedHref = parse_url($trimmedHref);
        $hrefPath = $parsedHref['path'] ?? '';
        if ($hrefPath !== '' && str_starts_with($hrefPath, '/')) {
            if (preg_match('/\b(login|signin|sign-in|admin|auth|portal|dashboard|account|member|manage|staff)\b/i', $hrefPath)) {
                $homepageExtractedPaths[$hrefPath] = true;
            }
        }
    }
}

// Check form actions on homepage
if (preg_match_all('/<form[^>]+action=[\'"]([^\'"]+)[\'"]/i', $homeRes['body'], $formMatches)) {
    foreach ($formMatches[1] as $action) {
        $action = trim($action);
        if (str_starts_with($action, '/')) {
            $homepageExtractedPaths[$action] = true;
        }
    }
}

// Layer 2: Bounded Subdomain Probing
$subdomainBudget = 10;
$candidateSubdomains = array_keys($homepageExtractedSubdomains);

// Supplement with top priority prefixes from subdomains.json
usort($subdomainsConfig, fn($a, $b) => ($b['priority'] ?? 0) <=> ($a['priority'] ?? 0));
foreach ($subdomainsConfig as $subEntry) {
    if (!($subEntry['enabled'] ?? true)) {
        continue;
    }
    $prefix = strtolower(trim($subEntry['prefix'] ?? ''));
    if ($prefix === '') {
        continue;
    }
    $candidateHost = "{$prefix}.{$rawHost}";
    if (!in_array($candidateHost, $candidateSubdomains, true)) {
        $candidateSubdomains[] = $candidateHost;
    }
    if (count($candidateSubdomains) >= $subdomainBudget) {
        break;
    }
}

$candidateSubdomains = array_slice($candidateSubdomains, 0, $subdomainBudget);

foreach ($candidateSubdomains as $subHost) {
    if ((microtime(true) - $scanStartMicro) >= $overallTimeoutSeconds || $requestsUsed >= $requestBudget) {
        break;
    }

    $subIps = resolveAndValidateDestination($subHost);
    if (empty($subIps)) {
        $discoveredHosts[$subHost] = [
            'host' => $subHost,
            'status' => 'Timeout',
            'ip' => null,
        ];
        continue;
    }

    $subPinnedIp = $subIps[0];
    $discoveredHosts[$subHost] = [
        'host' => $subHost,
        'status' => 'Active',
        'ip' => $subPinnedIp,
    ];

    // Probe subdomain root
    $subUrl = $formatCleanUrl('https', $subHost, 443, '/');
    $subRes = executeSafeRequest($subUrl, $subHost, 443, $subPinnedIp, 5);
    $requestsUsed++;

    if ($subRes['success'] && $subRes['http_status'] !== null) {
        $subAnalysis = analyzeAuthenticationSignals($subRes['body'], '/', $subRes['http_status'], $subRes['location']);
        if ($subAnalysis['type'] !== 'NOT DETECTED') {
            $authSurfaces[] = [
                'url' => $subUrl,
                'path' => '/',
                'host' => $subHost,
                'category' => 'portal',
                'type' => $subAnalysis['type'],
                'confidence' => $subAnalysis['confidence'],
                'http_status' => $subRes['http_status'],
                'elapsed_ms' => $subRes['elapsed_ms'],
                'signals' => $subAnalysis['signals'],
            ];
        }
    }
}

// Layer 3: Curated Candidate Paths Probing (Priority Selection)
$candidatePaths = [];

// 1. First: Discovered links from homepage (highest confidence)
foreach (array_keys($homepageExtractedPaths) as $path) {
    $candidatePaths[] = [
        'path' => $path,
        'category' => 'authentication',
        'priority' => 110,
    ];
}

// 2. Second: Paths from paths.json sorted by priority
usort($pathsConfig, fn($a, $b) => ($b['priority'] ?? 0) <=> ($a['priority'] ?? 0));
foreach ($pathsConfig as $pathItem) {
    if (!($pathItem['enabled'] ?? true)) {
        continue;
    }
    $p = trim($pathItem['path'] ?? '');
    if ($p === '' || !str_starts_with($p, '/')) {
        continue;
    }
    $candidatePaths[] = [
        'path' => $p,
        'category' => $pathItem['category'] ?? 'admin',
        'priority' => (int) ($pathItem['priority'] ?? 50),
    ];
}

// 3. Third: Pattern expansion (bounded)
if (count($candidatePaths) < $requestBudget) {
    foreach ($patternsConfig as $pat) {
        if (!($pat['enabled'] ?? true)) {
            continue;
        }
        $tpl = $pat['template'] ?? '';
        foreach (array_slice($aliasesConfig, 0, 4) as $ali) {
            $val = $ali['value'] ?? '';
            if ($val !== '' && str_contains($tpl, '{alias}')) {
                $expanded = str_replace('{alias}', $val, $tpl);
                $candidatePaths[] = [
                    'path' => $expanded,
                    'category' => $pat['category'] ?? 'generic',
                    'priority' => (int) (($pat['priority'] ?? 40) + ($ali['priority'] ?? 20) / 2),
                ];
            }
        }
    }
}

// Deduplicate candidate paths
$uniquePaths = [];
foreach ($candidatePaths as $item) {
    $cleanPath = $item['path'];
    if (!isset($uniquePaths[$cleanPath]) && !isset($testedPaths[$cleanPath])) {
        $uniquePaths[$cleanPath] = $item;
    }
}

// Sort by priority descending
uasort($uniquePaths, fn($a, $b) => $b['priority'] <=> $a['priority']);

// Probe within request budget and time budget
foreach ($uniquePaths as $pathItem) {
    if ((microtime(true) - $scanStartMicro) >= $overallTimeoutSeconds || $requestsUsed >= $requestBudget) {
        break;
    }

    $path = $pathItem['path'];
    $testedPaths[$path] = true;

    $targetUrl = $formatCleanUrl($baseProtocol, $rawHost, $port, $path);
    $res = executeSafeRequest($targetUrl, $rawHost, $port, $pinnedIp, 5);
    $requestsUsed++;

    if (!$res['success'] || $res['http_status'] === null) {
        continue;
    }

    $analysis = analyzeAuthenticationSignals($res['body'], $path, $res['http_status'], $res['location']);

    if ($analysis['type'] !== 'NOT DETECTED') {
        $authSurfaces[] = [
            'url' => $targetUrl,
            'path' => $path,
            'host' => $rawHost,
            'category' => $pathItem['category'],
            'type' => $analysis['type'],
            'confidence' => $analysis['confidence'],
            'http_status' => $res['http_status'],
            'elapsed_ms' => $res['elapsed_ms'],
            'signals' => $analysis['signals'],
        ];

        // Early stopping optimization: if we have 5 high-confidence login pages, stop probing lower-priority paths
        $highCount = count(array_filter($authSurfaces, fn($s) => $s['confidence'] === 'High'));
        if ($highCount >= 6) {
            break;
        }
    }
}

// Record scan completion timestamp for rate limit tracking
$recentTimestamps[] = time();
@file_put_contents($rateLimitFile, json_encode(array_values($recentTimestamps)));

// Sort surfaces: High confidence -> Medium -> Low
$confidenceRank = ['High' => 3, 'Medium' => 2, 'Low' => 1];
usort($authSurfaces, fn($a, $b) => ($confidenceRank[$b['confidence']] ?? 0) <=> ($confidenceRank[$a['confidence']] ?? 0));

$totalScanMs = (int) round((microtime(true) - $scanStartMicro) * 1000);
$liveHostsCount = count(array_filter($discoveredHosts, fn($h) => $h['status'] === 'Active'));

jsonResponse(true, 'Admin & authentication scan completed successfully.', [
    'target' => $rawHost,
    'active_url' => "{$baseProtocol}://{$rawHost}" . ($port !== 80 && $port !== 443 ? ":{$port}" : ''),
    'final_url' => $initialBaseUrl,
    'scan_time_ms' => $totalScanMs,
    'discovered_hosts_count' => count($discoveredHosts),
    'live_hosts_count' => $liveHostsCount,
    'auth_surfaces_count' => count($authSurfaces),
    'hosts' => array_values($discoveredHosts),
    'surfaces' => $authSurfaces,
]);

