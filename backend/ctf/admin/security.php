<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/admin.php';

$admin = requireCtfAdmin();

$type = trim((string)($_GET['type'] ?? 'events'));
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(50, max(10, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

if ($type === 'audit') {
    $total = (int)$pdo->query("SELECT COUNT(*) FROM ctf_audit_logs")->fetchColumn();
    $stmt = $pdo->prepare("
        SELECT id, actor_username, action, target_type, target_id, old_value, new_value, reason, created_at
        FROM ctf_audit_logs
        ORDER BY created_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ");
    $stmt->execute();
    $logs = $stmt->fetchAll();

    jsonResponse(true, [
        'audit_logs' => $logs,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
    ]);
}

// Default: security events
$total = (int)$pdo->query("SELECT COUNT(*) FROM ctf_security_events")->fetchColumn();
$stmt = $pdo->prepare("
    SELECT id, user_id, event_type, ip_address, endpoint, details, sarcastic_note, created_at
    FROM ctf_security_events
    ORDER BY created_at DESC
    LIMIT {$limit} OFFSET {$offset}
");
$stmt->execute();
$events = $stmt->fetchAll();

jsonResponse(true, [
    'security_events' => $events,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
]);

