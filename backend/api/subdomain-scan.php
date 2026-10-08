<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools — Subdomain Scanner API
|--------------------------------------------------------------------------
| Passive public subdomain discovery via Certificate Transparency (crt.sh)
| with server-side DNS record validation (A, AAAA, CNAME).
| Hardened against SSRF, request explosion, unbounded memory, and abuse.
|--------------------------------------------------------------------------
*/

// Server-side resource limit constants
const MAX_INPUT_LENGTH = 253;
const MAX_DISCOVERED_CANDIDATES = 300;
const MAX_DNS_VALIDATIONS = 300;
const MAX_DNS_EXECUTION_SECONDS = 25;

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

$lockDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'xeoo_subdomain_scanner';
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
} elseif (isset($payload['domain']) && is_string($payload['domain'])) {
    $rawInput = trim($payload['domain']);
}

if ($rawInput === '') {
    jsonResponse(false, 'Target domain is required.', null, 422);
}

if (strlen($rawInput) > MAX_INPUT_LENGTH) {
    jsonResponse(false, 'Target exceeds maximum allowed length (253 characters).', null, 422);
}

// Clean surrounding quotes, whitespace, and brackets
$cleanTarget = preg_replace('/^[\s\'"\(<\[]+|[\s\'"\)>\]]+$/', '', $rawInput) ?? $rawInput;

// Reject dangerous schemes
if (preg_match('/^(file|ftp|gopher|data|javascript|php|ssh|telnet|dict|ldap|mailto):/i', $cleanTarget)) {
    jsonResponse(false, 'Invalid scheme. Only domain names or standard HTTP/HTTPS targets are permitted.', null, 422);
}

// Reject embedded credentials (user:pass@host)
if (str_contains($cleanTarget, '@')) {
    jsonResponse(false, 'Embedded credentials in targets are not permitted.', null, 422);
}

// Strip leading http:// or https:// if provided
$cleanTarget = preg_replace('#^https?://#i', '', $cleanTarget) ?? $cleanTarget;

// Strip path, query string, or fragment if user entered a full URL
$cleanTarget = preg_split('~[/?#]~', $cleanTarget)[0] ?? $cleanTarget;

// Strip port if present
$cleanTarget = preg_split('~:~', $cleanTarget)[0] ?? $cleanTarget;

// Normalize to lowercase and remove trailing dot
$targetDomain = strtolower(rtrim(trim($cleanTarget), '.'));

if ($targetDomain === '') {
    jsonResponse(false, 'Invalid or empty target domain.', null, 422);
}

// SSRF / Target Validation
// 1. IP addresses cannot have subdomains
if (filter_var($targetDomain, FILTER_VALIDATE_IP)) {
    jsonResponse(false, 'IP addresses cannot be scanned for subdomains. Please provide a domain name (e.g., example.com).', null, 422);
}

// 2. Reject localhost or single-label hostnames without dot
if (!str_contains($targetDomain, '.')) {
    jsonResponse(false, 'Target must be a fully qualified domain name containing at least one dot (e.g., example.com).', null, 422);
}

// 3. Reject reserved and internal TLDs
$reservedSuffixes = [
    '.local',
    '.localhost',
    '.internal',
    '.lan',
    '.home',
    '.test',
    '.example',
    '.invalid',
    '.corp',
];

foreach ($reservedSuffixes as $suffix) {
    if (str_ends_with($targetDomain, $suffix) || $targetDomain === ltrim($suffix, '.')) {
        jsonResponse(false, 'Scanning internal or reserved domain names is not permitted.', null, 422);
    }
}

// 4. Validate domain structure RFC 1035 / RFC 1123
if (!preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i', $targetDomain)) {
    jsonResponse(false, 'Invalid domain name format. Only letters, numbers, hyphens, and dots are allowed.', null, 422);
}

// Record scan timestamp for rate limiting
$recentTimestamps[] = $currentTime;
@file_put_contents($rateLimitFile, json_encode(array_values($recentTimestamps)), LOCK_EX);

/*
|--------------------------------------------------------------------------
| Passive Discovery via Certificate Transparency (crt.sh)
|--------------------------------------------------------------------------
*/
$discoverySource = 'Certificate Transparency';
$uniqueCandidates = [];

// Always include the apex target domain itself
$uniqueCandidates[$targetDomain] = true;

$ctQuery = '%.' . $targetDomain;
$ctUrl = 'https://crt.sh/?q=' . urlencode($ctQuery) . '&output=json';

$ch = curl_init($ctUrl);
if ($ch !== false) {
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 2,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
        ],
    ]);

    $rawCtResponse = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($rawCtResponse !== false && $httpCode === 200) {
        $ctRecords = json_decode((string) $rawCtResponse, true);
        unset($rawCtResponse); // Immediately free memory

        if (is_array($ctRecords)) {
            foreach ($ctRecords as $record) {
                if (!is_array($record)) {
                    continue;
                }

                $rawNames = [];
                if (!empty($record['name_value']) && is_string($record['name_value'])) {
                    $rawNames = array_merge($rawNames, preg_split('/[\r\n]+/', $record['name_value']) ?: []);
                }
                if (!empty($record['common_name']) && is_string($record['common_name'])) {
                    $rawNames[] = $record['common_name'];
                }

                foreach ($rawNames as $name) {
                    $name = strtolower(trim((string) $name));
                    if ($name === '') {
                        continue;
                    }

                    // Strip leading wildcard *. if present
                    $name = preg_replace('/^\*\./', '', $name) ?? $name;
                    // Strip trailing dot if present
                    $name = rtrim($name, '.');

                    // Boundary check: candidate must be exactly $targetDomain OR end with .{$targetDomain}
                    $isBoundaryValid = ($name === $targetDomain) || str_ends_with($name, '.' . $targetDomain);
                    if (!$isBoundaryValid) {
                        continue;
                    }

                    // Validate hostname character structure
                    if (!preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i', $name)) {
                        continue;
                    }

                    $uniqueCandidates[$name] = true;

                    if (count($uniqueCandidates) >= MAX_DISCOVERED_CANDIDATES) {
                        break 2;
                    }
                }
            }
            unset($ctRecords);
        }
    }
}

// Fallback passive discovery if crt.sh is rate-limiting, 502, or returned no subdomains
if (count($uniqueCandidates) <= 1) {
    $fallbackUrl = 'https://api.hackertarget.com/hostsearch/?q=' . urlencode($targetDomain);
    $chFb = curl_init($fallbackUrl);
    if ($chFb !== false) {
        curl_setopt_array($chFb, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $rawFb = curl_exec($chFb);
        $fbCode = (int) curl_getinfo($chFb, CURLINFO_HTTP_CODE);
        curl_close($chFb);

        if ($rawFb !== false && $fbCode === 200 && !str_starts_with(trim((string) $rawFb), 'error')) {
            $lines = preg_split('/[\r\n]+/', (string) $rawFb) ?: [];
            foreach ($lines as $line) {
                $parts = explode(',', trim($line));
                $name = strtolower(trim($parts[0] ?? ''));
                if ($name === '') {
                    continue;
                }

                $name = preg_replace('/^\*\./', '', $name) ?? $name;
                $name = rtrim($name, '.');

                $isBoundaryValid = ($name === $targetDomain) || str_ends_with($name, '.' . $targetDomain);
                if (!$isBoundaryValid) {
                    continue;
                }

                if (!preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i', $name)) {
                    continue;
                }

                $uniqueCandidates[$name] = true;

                if (count($uniqueCandidates) >= MAX_DISCOVERED_CANDIDATES) {
                    break;
                }
            }
        }
    }
}

$candidateList = array_keys($uniqueCandidates);
unset($uniqueCandidates);

// Sort candidates: target domain first, then subdomains alphabetically
usort($candidateList, function (string $a, string $b) use ($targetDomain): int {
    if ($a === $targetDomain) {
        return -1;
    }
    if ($b === $targetDomain) {
        return 1;
    }
    return strcmp($a, $b);
});

// Enforce DNS validation limit
if (count($candidateList) > MAX_DNS_VALIDATIONS) {
    $candidateList = array_slice($candidateList, 0, MAX_DNS_VALIDATIONS);
}

/*
|--------------------------------------------------------------------------
| DNS Record Validation (A, AAAA, CNAME)
|--------------------------------------------------------------------------
*/
$dnsStartTime = microtime(true);
$results = [];

foreach ($candidateList as $hostname) {
    // Execution time safety guard: prevent worker timeouts
    if ((microtime(true) - $dnsStartTime) > MAX_DNS_EXECUTION_SECONDS) {
        // For any remaining candidate past the safety timeout, mark UNRESOLVED
        $results[] = [
            'hostname' => $hostname,
            'status' => 'UNRESOLVED',
            'a' => [],
            'aaaa' => [],
            'cname' => [],
        ];
        continue;
    }

    $aRecords = [];
    $aaaaRecords = [];
    $cnameRecords = [];
    $hasLookupError = false;

    $dnsRecords = @dns_get_record($hostname, DNS_A | DNS_AAAA | DNS_CNAME);

    if ($dnsRecords === false) {
        // Fallback test with OS resolver for IPv4
        $fallbackIp = @gethostbyname($hostname);
        if ($fallbackIp && $fallbackIp !== $hostname && filter_var($fallbackIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $aRecords[] = $fallbackIp;
        }
    } elseif (is_array($dnsRecords)) {
        foreach ($dnsRecords as $rec) {
            $type = strtoupper((string) ($rec['type'] ?? ''));

            if ($type === 'A' && !empty($rec['ip']) && is_string($rec['ip'])) {
                if (filter_var($rec['ip'], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                    $aRecords[] = $rec['ip'];
                }
            } elseif ($type === 'AAAA' && !empty($rec['ipv6']) && is_string($rec['ipv6'])) {
                if (filter_var($rec['ipv6'], FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
                    $aaaaRecords[] = $rec['ipv6'];
                }
            } elseif ($type === 'CNAME' && !empty($rec['target']) && is_string($rec['target'])) {
                $cnameRecords[] = strtolower(rtrim($rec['target'], '.'));
            }
        }

        // Additional OS resolver fallback if no A record was extracted
        if (empty($aRecords) && empty($aaaaRecords) && empty($cnameRecords)) {
            $fallbackIp = @gethostbyname($hostname);
            if ($fallbackIp && $fallbackIp !== $hostname && filter_var($fallbackIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                $aRecords[] = $fallbackIp;
            }
        }
    }

    // Deduplicate and limit to at most 5 values per record type
    $aRecords = array_values(array_unique($aRecords));
    if (count($aRecords) > 5) {
        $aRecords = array_slice($aRecords, 0, 5);
    }

    $aaaaRecords = array_values(array_unique($aaaaRecords));
    if (count($aaaaRecords) > 5) {
        $aaaaRecords = array_slice($aaaaRecords, 0, 5);
    }

    $cnameRecords = array_values(array_unique($cnameRecords));
    if (count($cnameRecords) > 5) {
        $cnameRecords = array_slice($cnameRecords, 0, 5);
    }

    // Classify status
    if (!empty($aRecords) || !empty($aaaaRecords) || !empty($cnameRecords)) {
        $status = 'RESOLVED';
    } elseif ($hasLookupError) {
        $status = 'ERROR';
    } else {
        $status = 'UNRESOLVED';
    }

    $results[] = [
        'hostname' => $hostname,
        'status' => $status,
        'a' => $aRecords,
        'aaaa' => $aaaaRecords,
        'cname' => $cnameRecords,
    ];
}

unset($candidateList); // Free memory

/*
|--------------------------------------------------------------------------
| Aggregate Summary & Final Response
|--------------------------------------------------------------------------
*/
$discoveredCount = count($results);
$resolvedCount = 0;
$unresolvedCount = 0;
$errorCount = 0;

foreach ($results as $item) {
    if ($item['status'] === 'RESOLVED') {
        $resolvedCount++;
    } elseif ($item['status'] === 'UNRESOLVED') {
        $unresolvedCount++;
    } else {
        $errorCount++;
    }
}

jsonResponse(true, 'Subdomain scan completed.', [
    'target' => $targetDomain,
    'source' => 'Certificate Transparency',
    'discovered' => $discoveredCount,
    'resolved' => $resolvedCount,
    'unresolved' => $unresolvedCount,
    'errors' => $errorCount,
    'results' => $results,
]);
