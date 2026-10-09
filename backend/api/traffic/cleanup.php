<?php
/**
 * XeooTools - Traffic Aggregation and Retention Cleanup
 * 
 * Aggregates daily stats for completed days into traffic_daily_stats
 * and traffic_daily_tool_stats, then cleans up raw pageviews older than 90 days.
 * 
 * Can be run via cron job or invoked manually by authenticated admin.
 */

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';

// Allow CLI execution or authenticated admin request
if (php_sapi_name() !== 'cli') {
    require_once __DIR__ . '/../admin-guard.php';
}

header('Content-Type: application/json; charset=utf-8');

try {
    $today = date('Y-m-d');

    // 1. Find dates in traffic_pageviews strictly before today that haven't been aggregated or need update
    $stmtDates = $pdo->prepare("
        SELECT DISTINCT DATE(created_at) AS visit_date
        FROM traffic_pageviews
        WHERE created_at < CURDATE()
        ORDER BY visit_date ASC
    ");
    $stmtDates->execute();
    $datesToProcess = $stmtDates->fetchAll(PDO::FETCH_COLUMN);

    $aggregatedCount = 0;

    foreach ($datesToProcess as $date) {
        // Aggregate daily general stats
        $stmtAgg = $pdo->prepare("
            INSERT INTO traffic_daily_stats (
                `date`, total_pageviews, unique_visitors, tool_pageviews,
                desktop_views, mobile_views, tablet_views, updated_at
            )
            SELECT 
                :stat_date AS `date`,
                COUNT(*) AS total_pageviews,
                COUNT(DISTINCT visitor_id) AS unique_visitors,
                COUNT(CASE WHEN page_type = 'tool' THEN 1 END) AS tool_pageviews,
                COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) AS desktop_views,
                COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) AS mobile_views,
                COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) AS tablet_views,
                NOW()
            FROM traffic_pageviews
            WHERE DATE(created_at) = :stat_date2
            ON DUPLICATE KEY UPDATE
                total_pageviews = VALUES(total_pageviews),
                unique_visitors = VALUES(unique_visitors),
                tool_pageviews = VALUES(tool_pageviews),
                desktop_views = VALUES(desktop_views),
                mobile_views = VALUES(mobile_views),
                tablet_views = VALUES(tablet_views),
                updated_at = NOW()
        ");
        $stmtAgg->execute([':stat_date' => $date, ':stat_date2' => $date]);

        // Aggregate daily tool stats
        $stmtToolAgg = $pdo->prepare("
            INSERT INTO traffic_daily_tool_stats (
                `date`, tool_id, pageviews, unique_visitors, updated_at
            )
            SELECT 
                :stat_date AS `date`,
                tool_id,
                COUNT(*) AS pageviews,
                COUNT(DISTINCT visitor_id) AS unique_visitors,
                NOW()
            FROM traffic_pageviews
            WHERE DATE(created_at) = :stat_date2 AND tool_id IS NOT NULL
            GROUP BY tool_id
            ON DUPLICATE KEY UPDATE
                pageviews = VALUES(pageviews),
                unique_visitors = VALUES(unique_visitors),
                updated_at = NOW()
        ");
        $stmtToolAgg->execute([':stat_date' => $date, ':stat_date2' => $date]);

        $aggregatedCount++;
    }

    // 2. Retention Cleanup: Delete raw pageviews older than 90 days (3 months)
    $stmtClean = $pdo->prepare("
        DELETE FROM traffic_pageviews
        WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    ");
    $stmtClean->execute();
    $deletedRows = $stmtClean->rowCount();

    echo json_encode([
        'success' => true,
        'message' => 'Traffic maintenance and aggregation completed successfully.',
        'dates_aggregated' => $aggregatedCount,
        'cleaned_records_older_than_90_days' => $deletedRows,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Maintenance failed: ' . $e->getMessage()
    ]);
}

