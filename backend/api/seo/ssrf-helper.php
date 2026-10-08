<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools - SSRF Protection & Safe Public URL Fetcher
|--------------------------------------------------------------------------
*/

function isPrivateOrReservedIp(string $ip): bool
{
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        return true;
    }

    // Filter standard private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) and reserved ranges
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

    // IPv6 unique local & link-local
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

function normalizeTargetUrl(string $rawInput): ?string
{
    $trimmed = trim($rawInput);
    if ($trimmed === '' || strlen($trimmed) > 2048) {
        return null;
    }

    // Strip wrapping quotes/brackets
    $cleaned = preg_replace('/^[\s\'"\(<]+|[\s\'"\)>]+$/', '', $trimmed) ?? $trimmed;

    // Check scheme
    if (!preg_match('/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//', $cleaned)) {
        $cleaned = 'https://' . $cleaned;
    }

    $parsed = parse_url($cleaned);
    if (!$parsed || empty($parsed['host'])) {
        return null;
    }

    $scheme = strtolower($parsed['scheme'] ?? '');
    if ($scheme !== 'http' && $scheme !== 'https') {
        return null;
    }

    $host = strtolower(rtrim($parsed['host'], '.'));
    if ($host === '' || preg_match('/[\s\/\\\\\?\#\@\:\%\<\>\*]/', $host)) {
        return null;
    }

    $path = $parsed['path'] ?? '/';
    if ($path === '') {
        $path = '/';
    }

    $query = isset($parsed['query']) ? '?' . $parsed['query'] : '';
    $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';

    return $scheme . '://' . $host . $port . $path . $query;
}

function validatePublicUrl(string $url): array
{
    $parsed = parse_url($url);
    if (!$parsed || empty($parsed['host'])) {
        return [
            'valid' => false,
            'error' => 'Invalid URL structure.',
            'host' => '',
            'ip' => '',
        ];
    }

    $host = strtolower(rtrim($parsed['host'], '.'));

    // Reject localhost / internal names
    if ($host === 'localhost' || str_ends_with($host, '.localhost') || str_ends_with($host, '.local') || str_ends_with($host, '.internal') || str_ends_with($host, '.test')) {
        return [
            'valid' => false,
            'error' => 'Localhost and internal domains cannot be scanned.',
            'host' => $host,
            'ip' => '',
        ];
    }

    // If host is direct IP
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        if (isPrivateOrReservedIp($host)) {
            return [
                'valid' => false,
                'error' => 'Private or reserved IP addresses cannot be accessed.',
                'host' => $host,
                'ip' => $host,
            ];
        }
        $ip = $host;
    } else {
        // Resolve DNS
        $records = @dns_get_record($host, DNS_A | DNS_AAAA);
        $resolvedIps = [];

        if (is_array($records)) {
            foreach ($records as $r) {
                if (isset($r['ip'])) {
                    $resolvedIps[] = $r['ip'];
                } elseif (isset($r['ipv6'])) {
                    $resolvedIps[] = $r['ipv6'];
                }
            }
        }

        if (empty($resolvedIps)) {
            $fallbackIp = @gethostbyname($host);
            if ($fallbackIp && $fallbackIp !== $host) {
                $resolvedIps[] = $fallbackIp;
            }
        }

        if (empty($resolvedIps)) {
            return [
                'valid' => false,
                'error' => 'Could not resolve domain name. Please check if the domain exists.',
                'host' => $host,
                'ip' => '',
            ];
        }

        // Validate each resolved IP
        foreach ($resolvedIps as $checkedIp) {
            if (isPrivateOrReservedIp($checkedIp)) {
                return [
                    'valid' => false,
                    'error' => 'Domain resolves to a private or restricted network address.',
                    'host' => $host,
                    'ip' => $checkedIp,
                ];
            }
        }

        $ip = $resolvedIps[0];
    }

    return [
        'valid' => true,
        'error' => '',
        'host' => $host,
        'ip' => $ip,
    ];
}

function fetchPublicHtml(string $url): array
{
    $parsedHost = strtolower((string) parse_url($url, PHP_URL_HOST));

    // Self-inspection optimization: bypass external bot firewall for our own domain
    if (in_array($parsedHost, ['xeootools.site.je', 'www.xeootools.site.je'], true)) {
        $possibleIndexFiles = [
            dirname(__DIR__, 2) . '/index.html',
            dirname(__DIR__, 3) . '/frontend/dist/index.html',
            dirname(__DIR__, 3) . '/frontend/index.html',
        ];
        foreach ($possibleIndexFiles as $indexPath) {
            if (file_exists($indexPath) && is_readable($indexPath)) {
                $localHtml = file_get_contents($indexPath);
                if ($localHtml !== false && strlen($localHtml) > 50) {
                    return [
                        'success' => true,
                        'error' => '',
                        'html' => $localHtml,
                        'http_code' => 200,
                        'final_url' => 'https://xeootools.site.je/',
                    ];
                }
            }
        }
    }

    $validation = validatePublicUrl($url);
    if (!$validation['valid']) {
        return [
            'success' => false,
            'error' => $validation['error'],
            'html' => '',
            'http_code' => 0,
            'final_url' => $url,
        ];
    }

    $ch = curl_init();
    $maxBytes = 2 * 1024 * 1024; // 2MB limit
    $receivedBytes = 0;
    $htmlBuffer = '';

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => false,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (XeooTools-SEO-Analyzer/1.0)',
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9,id;q=0.8',
        ],
        CURLOPT_WRITEFUNCTION => function ($chInstance, $data) use (&$htmlBuffer, &$receivedBytes, $maxBytes) {
            $len = strlen($data);
            $receivedBytes += $len;
            if ($receivedBytes > $maxBytes) {
                // Abort when response size exceeds max
                return 0;
            }
            $htmlBuffer .= $data;
            return $len;
        },
    ]);

    $exec = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $finalUrl = (string) curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    $curlError = curl_error($ch);
    $curlErrno = curl_errno($ch);
    curl_close($ch);

    // If aborted due to size limit
    if ($curlErrno === CURLE_WRITE_ERROR && $receivedBytes > $maxBytes) {
        return [
            'success' => true,
            'error' => '',
            'html' => $htmlBuffer,
            'http_code' => $httpCode,
            'final_url' => $finalUrl,
        ];
    }

    if ($curlErrno !== 0 && empty($htmlBuffer)) {
        return [
            'success' => false,
            'error' => 'Connection failed: ' . ($curlError !== '' ? $curlError : 'Timeout or unreachable server.'),
            'html' => '',
            'http_code' => $httpCode,
            'final_url' => $finalUrl,
        ];
    }

    if (empty($htmlBuffer)) {
        return [
            'success' => false,
            'error' => 'The target server returned an empty response.',
            'html' => '',
            'http_code' => $httpCode,
            'final_url' => $finalUrl,
        ];
    }

    return [
        'success' => true,
        'error' => '',
        'html' => $htmlBuffer,
        'http_code' => $httpCode,
        'final_url' => $finalUrl,
    ];
}

