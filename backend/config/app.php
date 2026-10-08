<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools - Centralized Application Configuration & URL Resolution
|--------------------------------------------------------------------------
|
| Provides automatic, environment-aware detection of the application base URL
| (scheme, host, port, and subdirectory path) across local development
| (Laragon), shared hosting, VPS, and production domains.
|
*/

require_once __DIR__ . '/env.php';

// Ensure .env is loaded if not already loaded
$envFile = dirname(__DIR__, 2) . '/.env';
if (!file_exists($envFile)) {
    $envFile = dirname(__DIR__) . '/.env';
}
if (file_exists($envFile) && !getenv('APP_ENV')) {
    loadEnv($envFile);
}

/**
 * Detect whether current request or server context is HTTPS.
 * Supports native HTTPS, standard reverse proxies, and Cloudflare.
 */
function detectScheme(array $server = []): string
{
    $server = !empty($server) ? $server : $_SERVER;

    // Standard HTTPS flags
    if (!empty($server['HTTPS']) && strtolower((string)$server['HTTPS']) !== 'off') {
        return 'https';
    }

    if (isset($server['SERVER_PORT']) && (int)$server['SERVER_PORT'] === 443) {
        return 'https';
    }

    // Standard Reverse Proxy headers
    if (!empty($server['HTTP_X_FORWARDED_PROTO'])) {
        $proto = strtolower(trim(explode(',', (string)$server['HTTP_X_FORWARDED_PROTO'])[0]));
        if ($proto === 'https' || $proto === 'http') {
            return $proto;
        }
    }

    if (!empty($server['HTTP_X_FORWARDED_SSL']) && strtolower((string)$server['HTTP_X_FORWARDED_SSL']) === 'on') {
        return 'https';
    }

    // Cloudflare flexible/full SSL
    if (!empty($server['HTTP_CF_VISITOR'])) {
        $visitor = json_decode((string)$server['HTTP_CF_VISITOR'], true);
        if (is_array($visitor) && isset($visitor['scheme']) && strtolower((string)$visitor['scheme']) === 'https') {
            return 'https';
        }
    }

    return 'http';
}

/**
 * Safely resolve and sanitize host and port.
 * Protects against Host Header Injection by validating hostname format.
 */
function detectHostAndPort(string $scheme, array $server = []): string
{
    $server = !empty($server) ? $server : $_SERVER;

    $rawHost = $server['HTTP_HOST'] ?? $server['SERVER_NAME'] ?? 'localhost';
    $rawHost = trim((string)$rawHost);

    // Host header validation (letters, numbers, hyphens, dots, colon for port)
    if (!preg_match('/^[a-zA-Z0-9.\-_]+(?::\d+)?$/', $rawHost)) {
        $rawHost = 'localhost';
    }

    // If HTTP_HOST already contains port, verify port consistency
    if (str_contains($rawHost, ':')) {
        [$hostOnly, $port] = explode(':', $rawHost, 2);
        $portNum = (int)$port;
        // Strip default ports (80 for http, 443 for https)
        if (($scheme === 'http' && $portNum === 80) || ($scheme === 'https' && $portNum === 443) || $portNum <= 0) {
            return $hostOnly;
        }
        return "{$hostOnly}:{$portNum}";
    }

    // Otherwise check SERVER_PORT if not default
    if (isset($server['SERVER_PORT'])) {
        $portNum = (int)$server['SERVER_PORT'];
        if ($portNum > 0 && !(($scheme === 'http' && $portNum === 80) || ($scheme === 'https' && $portNum === 443))) {
            return "{$rawHost}:{$portNum}";
        }
    }

    return $rawHost;
}

/**
 * Detect the application base path (subdirectory) relative to web server document root.
 *
 * Example:
 * - Laragon: /PROJECT GIT/xeoo_tools/backend/api/tools.php -> /PROJECT GIT/xeoo_tools
 * - Production: /backend/api/tools.php -> ''
 */
function detectBasePath(array $server = []): string
{
    $server = !empty($server) ? $server : $_SERVER;

    $scriptName = $server['SCRIPT_NAME'] ?? '';
    if (!is_string($scriptName) || $scriptName === '') {
        return '';
    }

    // In XeooTools structure, all backend files live under /backend/
    // The segment before '/backend/' represents the project subdirectory path.
    if (preg_match('#^(.*?)/backend(?:/|$)#i', $scriptName, $matches)) {
        $base = trim($matches[1]);
        return rtrim($base, '/');
    }

    return '';
}

/**
 * Get the canonical, centralized application base URL.
 * Environment-aware, automatic, and safe.
 *
 * @param string $path Optional relative path to append (e.g. '/backend/uploads/avatars/abc.png')
 * @return string Full URL without trailing slash (unless root or path explicitly has one)
 */
function getAppUrl(string $path = '', array $server = []): string
{
    $server = !empty($server) ? $server : $_SERVER;

    // 1. Explicit configuration override via .env
    $configured = env('APP_URL');
    if ($configured !== null && trim($configured) !== '') {
        $baseUrl = rtrim(trim($configured), '/');
    } else {
        // 2. Dynamic, environment-aware automatic detection
        $scheme = detectScheme($server);
        $hostAndPort = detectHostAndPort($scheme, $server);
        $basePath = detectBasePath($server);

        $baseUrl = "{$scheme}://{$hostAndPort}" . ($basePath !== '' ? '/' . ltrim($basePath, '/') : '');
        $baseUrl = rtrim($baseUrl, '/');
    }

    if ($path === '') {
        return $baseUrl;
    }

    return $baseUrl . '/' . ltrim($path, '/');
}

/**
 * Get the backend URL (convenience helper).
 *
 * @param string $path Optional path relative to /backend
 */
function getBackendUrl(string $path = '', array $server = []): string
{
    $backendBase = getAppUrl('/backend', $server);
    if ($path === '') {
        return $backendBase;
    }
    return $backendBase . '/' . ltrim($path, '/');
}

/**
 * Check if the application is running in local/development environment.
 */
function isDevEnvironment(array $server = []): bool
{
    $server = !empty($server) ? $server : $_SERVER;

    $env = strtolower(trim((string)env('APP_ENV', '')));
    if ($env === 'local' || $env === 'development' || $env === 'dev') {
        return true;
    }

    $host = strtolower(trim(explode(':', (string)($server['HTTP_HOST'] ?? $server['SERVER_NAME'] ?? ''))[0]));
    return in_array($host, ['localhost', '127.0.0.1', '::1', 'xeootools.test'], true) || str_ends_with($host, '.test') || str_ends_with($host, '.local');
}
