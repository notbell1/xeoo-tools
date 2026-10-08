<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/admin.php';

$admin = requireCtfAdmin();

// Total players
$totalPlayers = (int)$pdo->query("SELECT COUNT(*) FROM ctf_users")->fetchColumn();
$bannedPlayers = (int)$pdo->query("SELECT COUNT(*) FROM ctf_users WHERE is_banned = 1")->fetchColumn();
$activePlayers = $totalPlayers - $bannedPlayers;

// Total challenges
$totalChallenges = (int)$pdo->query("SELECT COUNT(*) FROM ctf_challenges")->fetchColumn();
$publishedChallenges = (int)$pdo->query("SELECT COUNT(*) FROM ctf_challenges WHERE status = 'published'")->fetchColumn();

// Total solves & points
$totalSolves = (int)$pdo->query("SELECT COUNT(*) FROM ctf_submissions")->fetchColumn();
$totalPointsAwarded = (int)$pdo->query("SELECT COALESCE(SUM(points_awarded), 0) FROM ctf_submissions")->fetchColumn();

// Total security events in last 24h
$recentSecurityEvents = (int)$pdo->query("SELECT COUNT(*) FROM ctf_security_events WHERE created_at >= NOW() - INTERVAL 1 DAY")->fetchColumn();

// Recent events sample
$stmtEvents = $pdo->query("
    SELECT id, user_id, event_type, ip_address, endpoint, sarcastic_note, created_at
    FROM ctf_security_events
    ORDER BY created_at DESC
    LIMIT 10
");
$recentEvents = $stmtEvents->fetchAll();

// System settings status
$settings = getCtfSettings();

jsonResponse(true, [
    'metrics' => [
        'total_players' => $totalPlayers,
        'active_players' => $activePlayers,
        'banned_players' => $bannedPlayers,
        'total_challenges' => $totalChallenges,
        'published_challenges' => $publishedChallenges,
        'total_solves' => $totalSolves,
        'total_points_awarded' => $totalPointsAwarded,
        'recent_security_events' => $recentSecurityEvents,
    ],
    'settings' => $settings,
    'recent_events' => $recentEvents,
]);

