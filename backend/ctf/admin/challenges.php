<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/admin.php';

$admin = requireCtfAdmin();
$actor = $admin['username'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT 
            c.id, c.slug, c.title, c.category, c.difficulty, c.points,
            c.case_reference, c.status, c.sort_order, c.created_at,
            (SELECT COUNT(*) FROM ctf_submissions WHERE challenge_id = c.id) AS solves_count,
            (SELECT COUNT(*) FROM ctf_artifacts WHERE challenge_id = c.id) AS artifacts_count,
            (SELECT COUNT(*) FROM ctf_stages WHERE challenge_id = c.id) AS stages_count,
            (SELECT COUNT(*) FROM ctf_hints WHERE challenge_id = c.id) AS hints_count
        FROM ctf_challenges c
        ORDER BY c.sort_order ASC, c.id ASC
    ");
    $challenges = $stmt->fetchAll();

    jsonResponse(true, [
        'challenges' => $challenges,
        'total' => count($challenges),
    ]);
}

if ($method === 'POST') {
    $body = getJsonBody();
    $action = trim((string)($body['action'] ?? ''));
    $challengeId = (int)($body['challenge_id'] ?? 0);

    if ($challengeId <= 0) {
        jsonError("Challenge ID is required.", 400);
    }

    $stmtCh = $pdo->prepare("SELECT id, title, status, points FROM ctf_challenges WHERE id = ? LIMIT 1");
    $stmtCh->execute([$challengeId]);
    $challenge = $stmtCh->fetch();

    if (!$challenge) {
        jsonError("Challenge not found.", 404);
    }

    if ($action === 'set_status') {
        $newStatus = trim((string)($body['status'] ?? 'published'));
        if (!in_array($newStatus, ['published', 'draft', 'disabled'], true)) {
            jsonError("Invalid status value.", 400);
        }

        $stmt = $pdo->prepare("UPDATE ctf_challenges SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $challengeId]);

        logAuditRecord($actor, 'UPDATE_CHALLENGE_STATUS', 'ctf_challenges', (string)$challengeId, [
            'status' => $challenge['status'],
        ], [
            'status' => $newStatus,
        ], "Challenge status changed to {$newStatus}");

        jsonResponse(true, null, "Challenge '{$challenge['title']}' status updated to {$newStatus}.");
    }

    if ($action === 'set_points') {
        $newPoints = max(10, (int)($body['points'] ?? 100));
        $stmt = $pdo->prepare("UPDATE ctf_challenges SET points = ? WHERE id = ?");
        $stmt->execute([$newPoints, $challengeId]);

        logAuditRecord($actor, 'UPDATE_CHALLENGE_POINTS', 'ctf_challenges', (string)$challengeId, [
            'points' => (int)$challenge['points'],
        ], [
            'points' => $newPoints,
        ], "Points changed to {$newPoints}");

        jsonResponse(true, null, "Points updated to {$newPoints} PTS for '{$challenge['title']}'.");
    }

    jsonError("Invalid action specified.", 400);
}

jsonError("Method not allowed", 405);

