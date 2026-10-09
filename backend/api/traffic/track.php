<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools - Traffic Tracking Endpoint
|--------------------------------------------------------------------------
| Records anonymous page views for tools and public pages.
| Excludes authenticated admin sessions, filters bots, normalizes routes,
| and applies rate limiting.
*/

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// 1. CORS & Response Headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// 2. Admin Exclusion (Server-side Session Check)
// If admin is logged in, DO NOT track.
if (!empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    echo json_encode(['success' => true, 'skipped' => 'admin_session']);
    exit;
}

// 3. Bot & Crawler Detection
$userAgent = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
if (empty($userAgent)) {
    echo json_encode(['success' => true, 'skipped' => 'empty_user_agent']);
    exit;
}

$botPatterns = [
    'bot', 'spider', 'crawler', 'crawl', 'slurp', 'mediapartners', 'lighthouse',
    'headless', 'phantomjs', 'selenium', 'puppeteer', 'postman', 'curl', 'wget',
    'python', 'httpclient', 'facebookexternalhit', 'twitterbot', 'rogerbot',
    'linkedinbot', 'embedly', 'quora link preview', 'showyoubot', 'outbrain',
    'pinterest', 'slackbot', 'vkShare', 'W3C_Validator', 'bingbot', 'googlebot'
];

$uaLower = strtolower($userAgent);
foreach ($botPatterns as $bot) {
    if (str_contains($uaLower, strtolower($bot))) {
        echo json_encode(['success' => true, 'skipped' => 'bot_detected']);
        exit;
    }
}

// 4. Rate Limiting via IP hash (Max 60 requests/minute per client)
$clientIp = (string)($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
$rateKey = 'traffic_rate_' . md5($clientIp);
$currentTime = time();

if (!isset($_SESSION[$rateKey])) {
    $_SESSION[$rateKey] = ['count' => 1, 'start_time' => $currentTime];
} else {
    $window = $_SESSION[$rateKey];
    if ($currentTime - $window['start_time'] < 60) {
        if ($window['count'] >= 60) {
            http_response_code(429);
            echo json_encode(['success' => false, 'message' => 'Rate limit exceeded']);
            exit;
        }
        $_SESSION[$rateKey]['count']++;
    } else {
        $_SESSION[$rateKey] = ['count' => 1, 'start_time' => $currentTime];
    }
}

// 5. Parse Payload
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
    exit;
}

// 6. Validate and Normalize Path
$rawPath = trim((string)($data['path'] ?? ''));
if (empty($rawPath) || !str_starts_with($rawPath, '/')) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid route path']);
    exit;
}

// Strip query strings or fragments from path
$parsedUrlPath = parse_url($rawPath, PHP_URL_PATH);
$path = is_string($parsedUrlPath) ? $parsedUrlPath : $rawPath;
$path = '/' . trim($path, '/');
if ($path === '//') {
    $path = '/';
}

// Exclude Admin or API routes from tracking
if (
    str_starts_with($path, '/mimin') ||
    str_starts_with($path, '/login/mimin') ||
    str_starts_with($path, '/api')
) {
    echo json_encode(['success' => true, 'skipped' => 'internal_route']);
    exit;
}

// 7. Validate Visitor ID (32-64 chars hexadecimal or UUID format)
$visitorId = trim((string)($data['visitor_id'] ?? ''));
if (!preg_match('/^[a-fA-F0-9\-]{16,64}$/', $visitorId)) {
    $visitorId = bin2hex(random_bytes(16));
}

// 8. Device, OS, Browser Detection
function detectDeviceAndClient(string $ua, ?int $screenWidth = null): array
{
    $uaLower = strtolower($ua);

    // Device
    $deviceType = 'desktop';
    if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $ua)) {
        $deviceType = 'tablet';
    } elseif (preg_match('/(mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop)/i', $ua)) {
        $deviceType = 'mobile';
    } elseif ($screenWidth !== null && $screenWidth > 0) {
        if ($screenWidth < 768) {
            $deviceType = 'mobile';
        } elseif ($screenWidth < 1024) {
            $deviceType = 'tablet';
        }
    }

    // OS
    $os = 'Unknown';
    if (str_contains($ua, 'Windows NT 10.0')) $os = 'Windows 10/11';
    elseif (str_contains($ua, 'Windows NT 6.3')) $os = 'Windows 8.1';
    elseif (str_contains($ua, 'Windows NT 6.1')) $os = 'Windows 7';
    elseif (str_contains($ua, 'Windows')) $os = 'Windows';
    elseif (str_contains($ua, 'Android')) $os = 'Android';
    elseif (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) $os = 'iOS';
    elseif (str_contains($ua, 'Mac OS X')) $os = 'macOS';
    elseif (str_contains($ua, 'Linux')) $os = 'Linux';
    elseif (str_contains($ua, 'CrOS')) $os = 'Chrome OS';

    // Browser
    $browser = 'Unknown';
    if (str_contains($ua, 'Edg/')) $browser = 'Edge';
    elseif (str_contains($ua, 'OPR/') || str_contains($ua, 'Opera')) $browser = 'Opera';
    elseif (str_contains($ua, 'Chrome/') && !str_contains($ua, 'Edg/')) $browser = 'Chrome';
    elseif (str_contains($ua, 'Safari/') && !str_contains($ua, 'Chrome/')) $browser = 'Safari';
    elseif (str_contains($ua, 'Firefox/')) $browser = 'Firefox';
    elseif (str_contains($ua, 'MSIE') || str_contains($ua, 'Trident/')) $browser = 'Internet Explorer';

    return [$deviceType, $browser, $os];
}

$screenWidth = isset($data['screen_width']) && is_numeric($data['screen_width']) ? (int)$data['screen_width'] : null;
[$deviceType, $browser, $os] = detectDeviceAndClient($userAgent, $screenWidth);

// 9. Referrer & Campaign Parameters
$rawReferrer = trim((string)($data['referrer'] ?? ''));
$utmSource = !empty($data['utm_source']) ? substr(trim((string)$data['utm_source']), 0, 100) : null;
$utmMedium = !empty($data['utm_medium']) ? substr(trim((string)$data['utm_medium']), 0, 100) : null;
$utmCampaign = !empty($data['utm_campaign']) ? substr(trim((string)$data['utm_campaign']), 0, 100) : null;

$referrerType = 'unknown';
$referrerHost = null;

if (!empty($rawReferrer)) {
    $refHost = parse_url($rawReferrer, PHP_URL_HOST);
    if (is_string($refHost) && !empty($refHost)) {
        $referrerHost = substr(strtolower($refHost), 0, 150);
        $currentHost = $_SERVER['HTTP_HOST'] ?? '';
        if ($referrerHost === strtolower($currentHost) || str_ends_with($referrerHost, 'localhost')) {
            $referrerType = 'direct';
        } elseif (preg_match('/(google|bing|yahoo|duckduckgo|baidu|yandex|ecosia|ask)\./i', $referrerHost)) {
            $referrerType = 'search';
        } else {
            $referrerType = 'referral';
        }
    }
} else {
    $referrerType = 'direct';
}

if (!empty($utmSource)) {
    $referrerType = 'campaign';
}

// 10. Database Connection & Route Mapping
require_once dirname(__DIR__, 2) . '/config/database.php';

$pageTitle = trim((string)($data['page_title'] ?? ''));
$pageType = 'other';
$toolId = null;
$categoryId = null;

try {
    // Map Tool Route: /tools/{slug}
    if (str_starts_with($path, '/tools/')) {
        $slug = substr($path, strlen('/tools/'));
        // Clean status modifiers if any like =maintenance
        $slug = explode('=', $slug)[0];
        $slug = trim($slug, '/');

        if (!empty($slug)) {
            $toolStmt = $pdo->prepare(
                'SELECT t.id, t.name, t.category_id, c.name AS category_name
                 FROM tools t
                 JOIN categories c ON t.category_id = c.id
                 WHERE t.slug = :slug LIMIT 1'
            );
            $toolStmt->execute(['slug' => $slug]);
            $foundTool = $toolStmt->fetch();

            if ($foundTool) {
                $pageType = 'tool';
                $toolId = (int)$foundTool['id'];
                $categoryId = (int)$foundTool['category_id'];
                $pageTitle = (string)$foundTool['name'];
            }
        }
    }
    // Map Category Route: /category/{slug}
    elseif (str_starts_with($path, '/category/')) {
        $catSlug = substr($path, strlen('/category/'));
        $catSlug = trim($catSlug, '/');

        // Handle category aliases if necessary
        if ($catSlug === 'design-tools') $catSlug = 'design';
        if ($catSlug === 'ai-tools') $catSlug = 'ai';

        $catStmt = $pdo->prepare('SELECT id, name FROM categories WHERE slug = :slug LIMIT 1');
        $catStmt->execute(['slug' => $catSlug]);
        $foundCat = $catStmt->fetch();

        if ($foundCat) {
            $pageType = 'category';
            $categoryId = (int)$foundCat['id'];
            $pageTitle = 'Category: ' . $foundCat['name'];
        }
    }
    // Standard Pages
    elseif ($path === '/') {
        $pageType = 'home';
        $pageTitle = 'Home';
    } elseif ($path === '/tools') {
        $pageType = 'directory';
        $pageTitle = 'Tools Directory';
    } elseif ($path === '/categories') {
        $pageType = 'directory';
        $pageTitle = 'Categories Directory';
    } elseif ($path === '/report') {
        $pageType = 'other';
        $pageTitle = 'Report Problem';
    } elseif ($path === '/contact') {
        $pageType = 'other';
        $pageTitle = 'Contact Us';
    } elseif ($path === '/ctf') {
        $pageType = 'other';
        $pageTitle = 'Defacement CTF';
    }

    if (empty($pageTitle)) {
        $pageTitle = substr($path, 0, 150);
    } else {
        $pageTitle = substr($pageTitle, 0, 150);
    }

    // Deduplication check: do not record identical visitor on exact same path within 2 seconds
    $dedupStmt = $pdo->prepare(
        'SELECT id FROM traffic_pageviews
         WHERE visitor_id = :visitor_id AND path = :path
           AND created_at >= (NOW() - INTERVAL 2 SECOND)
         LIMIT 1'
    );
    $dedupStmt->execute(['visitor_id' => $visitorId, 'path' => $path]);
    if ($dedupStmt->fetch()) {
        echo json_encode(['success' => true, 'skipped' => 'deduplication']);
        exit;
    }

    // Insert into traffic_pageviews
    $insertStmt = $pdo->prepare(
        'INSERT INTO traffic_pageviews (
            visitor_id, path, page_title, page_type, tool_id, category_id,
            device_type, browser, os, referrer_type, referrer_host,
            utm_source, utm_medium, utm_campaign
        ) VALUES (
            :visitor_id, :path, :page_title, :page_type, :tool_id, :category_id,
            :device_type, :browser, :os, :referrer_type, :referrer_host,
            :utm_source, :utm_medium, :utm_campaign
        )'
    );

    $insertStmt->execute([
        'visitor_id'    => $visitorId,
        'path'          => $path,
        'page_title'    => $pageTitle,
        'page_type'     => $pageType,
        'tool_id'       => $toolId,
        'category_id'   => $categoryId,
        'device_type'   => $deviceType,
        'browser'       => $browser,
        'os'            => $os,
        'referrer_type' => $referrerType,
        'referrer_host' => $referrerHost,
        'utm_source'    => $utmSource,
        'utm_medium'    => $utmMedium,
        'utm_campaign'  => $utmCampaign,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Pageview tracked successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Tracking failure']);
}

