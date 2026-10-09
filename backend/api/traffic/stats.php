<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools - Admin Traffic Analytics Statistics API
|--------------------------------------------------------------------------
| Protected endpoint for Mimin Admin to query aggregated metrics,
| time-series chart points, top tools, popular pages, devices, sources,
| and recent activity log.
*/

require_once dirname(__DIR__) . '/admin-guard.php';
require_once dirname(__DIR__, 2) . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    // 1. Determine Date Range
    $period = trim((string)($_GET['period'] ?? '7d'));
    $todayDate = (new DateTimeImmutable('now', new DateTimeZone('Asia/Jakarta')))->format('Y-m-d');

    $startDate = '';
    $endDate = $todayDate;
    $prevStartDate = null;
    $prevEndDate = null;
    $numDays = 7;

    switch ($period) {
        case 'today':
            $startDate = $todayDate;
            $numDays = 1;
            $prevStartDate = (new DateTimeImmutable($startDate))->modify('-1 day')->format('Y-m-d');
            $prevEndDate = $prevStartDate;
            break;

        case '30d':
            $numDays = 30;
            $startDate = (new DateTimeImmutable($todayDate))->modify('-29 days')->format('Y-m-d');
            $prevEndDate = (new DateTimeImmutable($startDate))->modify('-1 day')->format('Y-m-d');
            $prevStartDate = (new DateTimeImmutable($prevEndDate))->modify('-29 days')->format('Y-m-d');
            break;

        case 'all':
            // Check earliest record
            $earliestStmt = $pdo->query('SELECT MIN(DATE(created_at)) AS earliest FROM traffic_pageviews');
            $earliestRow = $earliestStmt->fetch();
            $startDate = $earliestRow && !empty($earliestRow['earliest']) ? $earliestRow['earliest'] : $todayDate;
            $startDt = new DateTimeImmutable($startDate);
            $endDt = new DateTimeImmutable($endDate);
            $numDays = max(1, (int)$startDt->diff($endDt)->days + 1);
            break;

        case 'custom':
            $reqStart = trim((string)($_GET['start_date'] ?? ''));
            $reqEnd = trim((string)($_GET['end_date'] ?? ''));
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $reqStart) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $reqEnd)) {
                $startDate = (new DateTimeImmutable($todayDate))->modify('-6 days')->format('Y-m-d');
                $endDate = $todayDate;
                $numDays = 7;
            } else {
                $startDate = min($reqStart, $reqEnd);
                $endDate = max($reqStart, $reqEnd);
                $startDt = new DateTimeImmutable($startDate);
                $endDt = new DateTimeImmutable($endDate);
                $numDays = max(1, (int)$startDt->diff($endDt)->days + 1);
                $prevEndDate = (new DateTimeImmutable($startDate))->modify('-1 day')->format('Y-m-d');
                $prevStartDate = (new DateTimeImmutable($prevEndDate))->modify('-' . ($numDays - 1) . ' days')->format('Y-m-d');
            }
            break;

        case '7d':
        default:
            $period = '7d';
            $numDays = 7;
            $startDate = (new DateTimeImmutable($todayDate))->modify('-6 days')->format('Y-m-d');
            $prevEndDate = (new DateTimeImmutable($startDate))->modify('-1 day')->format('Y-m-d');
            $prevStartDate = (new DateTimeImmutable($prevEndDate))->modify('-6 days')->format('Y-m-d');
            break;
    }

    $startSql = $startDate . ' 00:00:00';
    $endSql = $endDate . ' 23:59:59';

    // 2. Summary Metric Cards
    // Current period
    $summaryStmt = $pdo->prepare(
        'SELECT 
            COUNT(id) AS total_pageviews,
            COUNT(DISTINCT visitor_id) AS unique_visitors
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql'
    );
    $summaryStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $currSummary = $summaryStmt->fetch();

    $totalPageviews = (int)($currSummary['total_pageviews'] ?? 0);
    $uniqueVisitors = (int)($currSummary['unique_visitors'] ?? 0);

    // Today page views
    $todayStmt = $pdo->prepare(
        'SELECT COUNT(id) AS today_pageviews 
         FROM traffic_pageviews 
         WHERE created_at >= :today_start'
    );
    $todayStmt->execute(['today_start' => $todayDate . ' 00:00:00']);
    $todayPageviews = (int)($todayStmt->fetch()['today_pageviews'] ?? 0);

    // Previous period comparison
    $prevPageviews = 0;
    $prevVisitors = 0;
    $pageviewsChange = null;
    $visitorsChange = null;

    if ($prevStartDate !== null && $prevEndDate !== null) {
        $prevStmt = $pdo->prepare(
            'SELECT 
                COUNT(id) AS total_pageviews,
                COUNT(DISTINCT visitor_id) AS unique_visitors
             FROM traffic_pageviews
             WHERE created_at BETWEEN :p_start AND :p_end'
        );
        $prevStmt->execute([
            'p_start' => $prevStartDate . ' 00:00:00',
            'p_end' => $prevEndDate . ' 23:59:59',
        ]);
        $prevData = $prevStmt->fetch();
        $prevPageviews = (int)($prevData['total_pageviews'] ?? 0);
        $prevVisitors = (int)($prevData['unique_visitors'] ?? 0);

        if ($prevPageviews > 0) {
            $pageviewsChange = round((($totalPageviews - $prevPageviews) / $prevPageviews) * 100, 1);
        }
        if ($prevVisitors > 0) {
            $visitorsChange = round((($uniqueVisitors - $prevVisitors) / $prevVisitors) * 100, 1);
        }
    }

    $dailyAverage = $numDays > 0 ? round($totalPageviews / $numDays, 1) : 0.0;

    // 3. Time Series Chart Data (Continuously filled days)
    $tsStmt = $pdo->prepare(
        'SELECT 
            DATE(created_at) AS date_str,
            COUNT(id) AS pageviews,
            COUNT(DISTINCT visitor_id) AS visitors
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql
         GROUP BY DATE(created_at)
         ORDER BY date_str ASC'
    );
    $tsStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $dbPoints = $tsStmt->fetchAll();

    $pointsByDate = [];
    foreach ($dbPoints as $p) {
        $pointsByDate[$p['date_str']] = [
            'pageviews' => (int)$p['pageviews'],
            'unique_visitors' => (int)$p['visitors'],
        ];
    }

    $timeSeries = [];
    $iterDate = new DateTimeImmutable($startDate);
    $finalDate = new DateTimeImmutable($endDate);

    $monthNames = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
    ];

    while ($iterDate <= $finalDate) {
        $dStr = $iterDate->format('Y-m-d');
        $mNum = (int)$iterDate->format('n');
        $dayNum = $iterDate->format('j');
        $label = $dayNum . ' ' . ($monthNames[$mNum] ?? '');

        $timeSeries[] = [
            'date'            => $dStr,
            'formatted_date'  => $label,
            'label'           => $label,
            'pageviews'       => $pointsByDate[$dStr]['pageviews'] ?? 0,
            'unique_visitors' => $pointsByDate[$dStr]['unique_visitors'] ?? 0,
        ];
        $iterDate = $iterDate->modify('+1 day');
    }

    // 4. Top 5 Popular Tools
    // Total tool visits in this period
    $totalToolsStmt = $pdo->prepare(
        'SELECT COUNT(id) AS total_tool_views 
         FROM traffic_pageviews 
         WHERE tool_id IS NOT NULL 
           AND created_at BETWEEN :start_sql AND :end_sql'
    );
    $totalToolsStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $totalToolViews = (int)($totalToolsStmt->fetch()['total_tool_views'] ?? 0);

    $topToolsStmt = $pdo->prepare(
        'SELECT 
            t.id AS tool_id,
            t.name AS tool_name,
            t.slug AS tool_slug,
            t.icon,
            c.name AS category_name,
            COUNT(tp.id) AS pageviews,
            COUNT(DISTINCT tp.visitor_id) AS unique_visitors
         FROM traffic_pageviews tp
         JOIN tools t ON tp.tool_id = t.id
         JOIN categories c ON t.category_id = c.id
         WHERE tp.created_at BETWEEN :start_sql AND :end_sql
         GROUP BY t.id, t.name, t.slug, t.icon, c.name
         ORDER BY pageviews DESC
         LIMIT 50'
    );
    $topToolsStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $topToolsRows = $topToolsStmt->fetchAll();

    $topTools = [];
    $rank = 1;
    foreach ($topToolsRows as $row) {
        $views = (int)$row['pageviews'];
        $uVisitors = (int)($row['unique_visitors'] ?? 0);
        $pct = $totalToolViews > 0 ? round(($views / $totalToolViews) * 100, 1) : 0.0;
        $topTools[] = [
            'rank'            => $rank++,
            'tool_id'         => (int)$row['tool_id'],
            'tool_name'       => (string)$row['tool_name'],
            'name'            => (string)$row['tool_name'],
            'tool_slug'       => (string)$row['tool_slug'],
            'slug'            => (string)$row['tool_slug'],
            'icon'            => (string)($row['icon'] ?? ''),
            'category_name'   => (string)$row['category_name'],
            'route'           => '/tools/' . $row['tool_slug'],
            'pageviews'       => $views,
            'unique_visitors' => $uVisitors,
            'percentage'      => $pct,
        ];
    }

    // 5. Popular Pages Table
    $categoryFilter = trim((string)($_GET['category_filter'] ?? 'all'));
    $pageTypeWhere = '';
    $pageTypeParams = ['start_sql' => $startSql, 'end_sql' => $endSql];

    if ($categoryFilter === 'tools') {
        $pageTypeWhere = " AND page_type = 'tool'";
    } elseif ($categoryFilter === 'categories') {
        $pageTypeWhere = " AND page_type = 'category'";
    } elseif ($categoryFilter === 'general') {
        $pageTypeWhere = " AND page_type IN ('home', 'directory', 'other')";
    }

    $pagesStmt = $pdo->prepare(
        "SELECT 
            path,
            page_title,
            page_type,
            COUNT(id) AS pageviews
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql {$pageTypeWhere}
         GROUP BY path, page_title, page_type
         ORDER BY pageviews DESC
         LIMIT 100"
    );
    $pagesStmt->execute($pageTypeParams);
    $pagesRows = $pagesStmt->fetchAll();

    $popularPages = [];
    foreach ($pagesRows as $row) {
        $pv = (int)$row['pageviews'];
        $pct = $totalPageviews > 0 ? round(($pv / $totalPageviews) * 100, 1) : 0.0;
        $popularPages[] = [
            'path'       => (string)$row['path'],
            'page_title' => (string)$row['page_title'],
            'page_type'  => (string)$row['page_type'],
            'pageviews'  => $pv,
            'percentage' => $pct,
        ];
    }

    // 6. Visitor Demographics (Devices, Browsers, OS)
    // Devices
    $deviceStmt = $pdo->prepare(
        'SELECT device_type, COUNT(id) AS count
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql
         GROUP BY device_type
         ORDER BY count DESC'
    );
    $deviceStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $deviceRows = $deviceStmt->fetchAll();

    $devices = [];
    foreach ($deviceRows as $d) {
        $cnt = (int)$d['count'];
        $devices[] = [
            'name'       => ucfirst((string)$d['device_type']),
            'count'      => $cnt,
            'percentage' => $totalPageviews > 0 ? round(($cnt / $totalPageviews) * 100, 1) : 0.0,
        ];
    }

    // Browsers
    $browserStmt = $pdo->prepare(
        'SELECT browser, COUNT(id) AS count
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql
         GROUP BY browser
         ORDER BY count DESC
         LIMIT 6'
    );
    $browserStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $browserRows = $browserStmt->fetchAll();

    $browsers = [];
    foreach ($browserRows as $b) {
        $cnt = (int)$b['count'];
        $browsers[] = [
            'name'       => (string)$b['browser'],
            'count'      => $cnt,
            'percentage' => $totalPageviews > 0 ? round(($cnt / $totalPageviews) * 100, 1) : 0.0,
        ];
    }

    // Operating Systems
    $osStmt = $pdo->prepare(
        'SELECT os, COUNT(id) AS count
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql
         GROUP BY os
         ORDER BY count DESC
         LIMIT 6'
    );
    $osStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $osRows = $osStmt->fetchAll();

    $operatingSystems = [];
    foreach ($osRows as $o) {
        $cnt = (int)$o['count'];
        $operatingSystems[] = [
            'name'       => (string)$o['os'],
            'count'      => $cnt,
            'percentage' => $totalPageviews > 0 ? round(($cnt / $totalPageviews) * 100, 1) : 0.0,
        ];
    }

    // 7. Traffic Sources
    $sourceStmt = $pdo->prepare(
        'SELECT referrer_type, COUNT(id) AS count
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql
         GROUP BY referrer_type
         ORDER BY count DESC'
    );
    $sourceStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $sourceRows = $sourceStmt->fetchAll();

    $sourceLabels = [
        'direct'   => 'Direct Traffic',
        'search'   => 'Search Engines',
        'referral' => 'Referral Sites',
        'campaign' => 'Campaigns (UTM)',
        'unknown'  => 'Unknown / Unattributed',
    ];

    $trafficSources = [];
    foreach ($sourceRows as $s) {
        $raw = (string)$s['referrer_type'];
        $cnt = (int)$s['count'];
        $trafficSources[] = [
            'key'        => $raw,
            'label'      => $sourceLabels[$raw] ?? ucfirst($raw),
            'count'      => $cnt,
            'percentage' => $totalPageviews > 0 ? round(($cnt / $totalPageviews) * 100, 1) : 0.0,
        ];
    }

    // Top Referrers
    $refHostStmt = $pdo->prepare(
        'SELECT referrer_host, COUNT(id) AS count
         FROM traffic_pageviews
         WHERE referrer_host IS NOT NULL
           AND created_at BETWEEN :start_sql AND :end_sql
         GROUP BY referrer_host
         ORDER BY count DESC
         LIMIT 5'
    );
    $refHostStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $topReferrers = $refHostStmt->fetchAll();

    // 8. Recent Activity Log with Pagination
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = min(50, max(10, (int)($_GET['per_page'] ?? 15)));
    $offset = ($page - 1) * $perPage;

    $countRecentStmt = $pdo->prepare(
        'SELECT COUNT(id) AS total_recent 
         FROM traffic_pageviews 
         WHERE created_at BETWEEN :start_sql AND :end_sql'
    );
    $countRecentStmt->execute(['start_sql' => $startSql, 'end_sql' => $endSql]);
    $totalRecent = (int)($countRecentStmt->fetch()['total_recent'] ?? 0);
    $totalPages = max(1, (int)ceil($totalRecent / $perPage));

    $recentStmt = $pdo->prepare(
        'SELECT 
            id,
            path,
            page_title,
            page_type,
            device_type,
            browser,
            os,
            referrer_type,
            referrer_host,
            created_at
         FROM traffic_pageviews
         WHERE created_at BETWEEN :start_sql AND :end_sql
         ORDER BY created_at DESC
         LIMIT :limit OFFSET :offset'
    );
    $recentStmt->bindValue(':start_sql', $startSql, PDO::PARAM_STR);
    $recentStmt->bindValue(':end_sql', $endSql, PDO::PARAM_STR);
    $recentStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $recentStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $recentStmt->execute();
    $recentActivity = $recentStmt->fetchAll();

    // 9. Send JSON Response
    echo json_encode([
        'success' => true,
        'data' => [
            'period' => [
                'type'       => $period,
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'num_days'   => $numDays,
            ],
            'summary' => [
                'total_pageviews'    => $totalPageviews,
                'pageviews_change'   => $pageviewsChange,
                'unique_visitors'    => $uniqueVisitors,
                'visitors_change'    => $visitorsChange,
                'today_pageviews'    => $todayPageviews,
                'daily_avg_pageviews'=> $dailyAverage,
            ],
            'time_series'     => $timeSeries,
            'top_tools'       => $topTools,
            'total_tool_views'=> $totalToolViews,
            'popular_pages'   => $popularPages,
            'demographics'    => [
                'devices'           => $devices,
                'browsers'          => $browsers,
                'operating_systems' => $operatingSystems,
            ],
            'sources' => [
                'breakdown'     => $trafficSources,
                'top_referrers' => $topReferrers,
            ],
            'recent_activity' => [
                'items'       => $recentActivity,
                'pagination'  => [
                    'page'        => $page,
                    'per_page'    => $perPage,
                    'total'       => $totalRecent,
                    'total_pages' => $totalPages,
                ],
            ],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error while fetching traffic analytics.'
    ]);
}

