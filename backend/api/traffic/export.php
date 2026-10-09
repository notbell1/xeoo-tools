<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools - Admin Traffic CSV Export Endpoint
|--------------------------------------------------------------------------
| Protected endpoint for Mimin Admin to download filtered analytics reports.
| Enforces formula-injection mitigation and UTF-8 spreadsheet compatibility.
*/

// 1. CORS Headers (Must precede any guard check for preflight/credential requests)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

if (!empty($origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once dirname(__DIR__) . '/admin-guard.php';
require_once dirname(__DIR__, 2) . '/config/database.php';

// 2. Determine Date Range
$period = trim((string)($_GET['period'] ?? '7d'));
$todayDate = (new DateTimeImmutable('now', new DateTimeZone('Asia/Jakarta')))->format('Y-m-d');

$startDate = '';
$endDate = $todayDate;

switch ($period) {
    case 'today':
        $startDate = $todayDate;
        break;

    case '30d':
        $startDate = (new DateTimeImmutable($todayDate))->modify('-29 days')->format('Y-m-d');
        break;

    case 'all':
        $earliestStmt = $pdo->query('SELECT MIN(DATE(created_at)) AS earliest FROM traffic_pageviews');
        $earliestRow = $earliestStmt->fetch();
        $startDate = $earliestRow && !empty($earliestRow['earliest']) ? $earliestRow['earliest'] : $todayDate;
        break;

    case 'custom':
        $reqStart = trim((string)($_GET['start_date'] ?? ''));
        $reqEnd = trim((string)($_GET['end_date'] ?? ''));
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $reqStart) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $reqEnd)) {
            $startDate = (new DateTimeImmutable($todayDate))->modify('-6 days')->format('Y-m-d');
            $endDate = $todayDate;
        } else {
            $startDate = min($reqStart, $reqEnd);
            $endDate = max($reqStart, $reqEnd);
        }
        break;

    case '7d':
    default:
        $period = '7d';
        $startDate = (new DateTimeImmutable($todayDate))->modify('-6 days')->format('Y-m-d');
        break;
}

$startSql = $startDate . ' 00:00:00';
$endSql = $endDate . ' 23:59:59';

// 3. Query Data
$summaryStmt = $pdo->prepare(
    'SELECT 
        COUNT(id) AS total_pageviews,
        COUNT(DISTINCT visitor_id) AS unique_visitors
     FROM traffic_pageviews
     WHERE created_at BETWEEN :start_sql AND :end_sql'
);
$summaryStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
$summary = $summaryStmt->fetch();
$totalPageviews = (int)($summary['total_pageviews'] ?? 0);
$uniqueVisitors = (int)($summary['unique_visitors'] ?? 0);

// Daily Time Series
$dailyStmt = $pdo->prepare(
    'SELECT 
        DATE(created_at) AS date_str,
        COUNT(id) AS pageviews,
        COUNT(DISTINCT visitor_id) AS visitors
     FROM traffic_pageviews
     WHERE created_at BETWEEN :start_sql AND :end_sql
     GROUP BY DATE(created_at)
     ORDER BY date_str ASC'
);
$dailyStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
$dailyRows = $dailyStmt->fetchAll();

// Top Tools
$toolsStmt = $pdo->prepare(
    'SELECT 
        t.name AS tool_name,
        t.slug AS tool_slug,
        c.name AS category_name,
        COUNT(tp.id) AS pageviews,
        COUNT(DISTINCT tp.visitor_id) AS unique_visitors
     FROM traffic_pageviews tp
     JOIN tools t ON tp.tool_id = t.id
     JOIN categories c ON t.category_id = c.id
     WHERE tp.created_at BETWEEN :start_sql AND :end_sql
     GROUP BY t.id, t.name, t.slug, c.name
     ORDER BY pageviews DESC
     LIMIT 50'
);
$toolsStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
$toolRows = $toolsStmt->fetchAll();

// Popular Pages
$pagesStmt = $pdo->prepare(
    'SELECT 
        path,
        page_title,
        page_type,
        COUNT(id) AS pageviews
     FROM traffic_pageviews
     WHERE created_at BETWEEN :start_sql AND :end_sql
     GROUP BY path, page_title, page_type
     ORDER BY pageviews DESC
     LIMIT 50'
);
$pagesStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
$pageRows = $pagesStmt->fetchAll();

// 4. Formula Injection Sanitizer
function sanitizeCsvField(mixed $value): string
{
    $str = (string)$value;
    if (preg_match('/^[=\+\-@\t\r]/', $str)) {
        $str = "'" . $str;
    }
    return $str;
}

// 5. Send CSV Headers
$filename = sprintf('xeootools-traffic-%s-%s.csv', $period, date('Ymd_His'));
header('Content-Type: text/csv; charset=UTF-8');
header("Content-Disposition: attachment; filename=\"{$filename}\"");
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$out = fopen('php://output', 'w');

// UTF-8 BOM for spreadsheet software compatibility
fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

// Report Header in English
fputcsv($out, ['XEOOTOOLS - TRAFFIC ANALYTICS REPORT']);
fputcsv($out, ['Period', $period, 'Date Range', "{$startDate} to {$endDate}"]);
fputcsv($out, ['Generated At', date('Y-m-d H:i:s T')]);
fputcsv($out, ['Total Pageviews', $totalPageviews, 'Unique Visitors', $uniqueVisitors]);
fputcsv($out, []);

// SECTION 1: Daily Trend
fputcsv($out, ['--- DAILY VISITS TREND ---']);
fputcsv($out, ['Date', 'Pageviews', 'Unique Visitors']);
foreach ($dailyRows as $row) {
    fputcsv($out, [
        sanitizeCsvField($row['date_str']),
        (int)$row['pageviews'],
        (int)$row['visitors'],
    ]);
}
fputcsv($out, []);

// SECTION 2: Popular Tools
fputcsv($out, ['--- POPULAR TOOLS ---']);
fputcsv($out, ['Rank', 'Tool Name', 'Category', 'Route Slug', 'Pageviews', 'Unique Visitors']);
$rank = 1;
foreach ($toolRows as $row) {
    fputcsv($out, [
        $rank++,
        sanitizeCsvField($row['tool_name']),
        sanitizeCsvField($row['category_name']),
        sanitizeCsvField('/tools/' . $row['tool_slug']),
        (int)$row['pageviews'],
        (int)($row['unique_visitors'] ?? 0),
    ]);
}
fputcsv($out, []);

// SECTION 3: Popular Pages
fputcsv($out, ['--- POPULAR PAGES ---']);
fputcsv($out, ['Path', 'Page Title', 'Page Type', 'Pageviews']);
foreach ($pageRows as $row) {
    fputcsv($out, [
        sanitizeCsvField($row['path']),
        sanitizeCsvField($row['page_title']),
        sanitizeCsvField($row['page_type']),
        (int)$row['pageviews'],
    ]);
}

fclose($out);
exit;
