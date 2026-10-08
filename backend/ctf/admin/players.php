<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/admin.php';

$admin = requireCtfAdmin();
$actor = $admin['username'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = trim((string)($_GET['search'] ?? ''));
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(10, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];

    if (!empty($search)) {
        $where[] = "(u.username LIKE ? OR u.email LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM ctf_users u {$whereSql}");
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetchColumn();

    $sql = "
        SELECT 
            u.id, u.username, u.email, u.country_code, u.is_banned, u.ban_reason, u.banned_at, u.created_at,
            (SELECT COUNT(*) FROM ctf_sessions WHERE user_id = u.id) AS active_sessions_count,
            (SELECT COUNT(*) FROM ctf_submissions WHERE user_id = u.id) AS solved_count,
            (SELECT COUNT(*) FROM ctf_attempts WHERE user_id = u.id) AS total_attempts_count,
            (
                COALESCE((SELECT SUM(points_awarded) FROM ctf_submissions WHERE user_id = u.id), 0) +
                COALESCE((SELECT SUM(amount) FROM ctf_score_adjustments WHERE user_id = u.id), 0) -
                COALESCE((SELECT SUM(h.cost) FROM ctf_unlocked_hints uh INNER JOIN ctf_hints h ON uh.hint_id = h.id WHERE uh.user_id = u.id), 0)
            ) AS calculated_score
        FROM ctf_users u
        {$whereSql}
        ORDER BY u.id DESC
        LIMIT {$limit} OFFSET {$offset}
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $players = [];

    while ($r = $stmt->fetch()) {
        $players[] = [
            'id' => (int)$r['id'],
            'username' => $r['username'],
            'email' => $r['email'],
            'country_code' => $r['country_code'],
            'is_banned' => (int)$r['is_banned'] === 1,
            'ban_reason' => $r['ban_reason'],
            'banned_at' => $r['banned_at'],
            'created_at' => $r['created_at'],
            'active_sessions_count' => (int)$r['active_sessions_count'],
            'solved_count' => (int)$r['solved_count'],
            'total_attempts_count' => (int)$r['total_attempts_count'],
            'score' => max(0, (int)$r['calculated_score']),
        ];
    }

    jsonResponse(true, [
        'players' => $players,
        'total' => $totalCount,
        'page' => $page,
        'limit' => $limit,
    ]);
}

if ($method === 'POST') {
    $body = getJsonBody();
    $action = trim((string)($body['action'] ?? ''));
    $userId = (int)($body['user_id'] ?? $body['player_id'] ?? 0);

    if ($userId <= 0) {
        jsonError("User ID is required.", 400);
    }

    // Verify user exists
    $stmtUser = $pdo->prepare("SELECT id, username, email, is_banned FROM ctf_users WHERE id = ? LIMIT 1");
    $stmtUser->execute([$userId]);
    $targetUser = $stmtUser->fetch();

    if (!$targetUser) {
        jsonError("Target player not found.", 404);
    }

    // 1. BAN
    if ($action === 'ban') {
        $reason = trim((string)($body['reason'] ?? 'Violation of CTF rules.'));
        $pdo->beginTransaction();
        try {
            // Set banned
            $stmt = $pdo->prepare("UPDATE ctf_users SET is_banned = 1, ban_reason = ?, banned_at = NOW(), banned_by = ? WHERE id = ?");
            $stmt->execute([$reason, $admin['admin_id'], $userId]);

            // Invalidate all active sessions immediately
            $pdo->prepare("DELETE FROM ctf_sessions WHERE user_id = ?")->execute([$userId]);

            logAuditRecord($actor, 'BAN_PLAYER', 'ctf_users', (string)$userId, null, ['reason' => $reason], "Banned by administrator {$actor}");

            $pdo->commit();
            jsonResponse(true, null, "Player {$targetUser['username']} has been banned and their sessions terminated.");
        } catch (Throwable $e) {
            $pdo->rollBack();
            jsonError("Failed to ban player: " . $e->getMessage(), 500);
        }
    }

    // 2. UNBAN
    if ($action === 'unban') {
        $stmt = $pdo->prepare("UPDATE ctf_users SET is_banned = 0, ban_reason = NULL, banned_at = NULL, banned_by = NULL WHERE id = ?");
        $stmt->execute([$userId]);

        logAuditRecord($actor, 'UNBAN_PLAYER', 'ctf_users', (string)$userId, null, null, "Unbanned by administrator {$actor}");
        jsonResponse(true, null, "Player {$targetUser['username']} has been unbanned.");
    }

    // 3. RESET SESSIONS
    if ($action === 'reset_sessions') {
        $stmt = $pdo->prepare("DELETE FROM ctf_sessions WHERE user_id = ?");
        $stmt->execute([$userId]);

        logAuditRecord($actor, 'RESET_SESSIONS', 'ctf_users', (string)$userId, null, null, "Sessions revoked by administrator {$actor}");
        jsonResponse(true, null, "All active sessions for player {$targetUser['username']} have been terminated.");
    }

    // 4. ADJUST SCORE
    if ($action === 'adjust_score') {
        $amount = (int)($body['amount'] ?? $body['points'] ?? 0);
        $reason = trim((string)($body['reason'] ?? 'Administrative correction'));

        if ($amount === 0) {
            jsonError("Adjustment amount must not be zero.", 400);
        }
        if (empty($reason)) {
            jsonError("Adjustment reason is required.", 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO ctf_score_adjustments (user_id, amount, reason, created_by)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $amount, $reason, $actor]);

        logAuditRecord($actor, 'ADJUST_SCORE', 'ctf_users', (string)$userId, null, ['amount' => $amount, 'reason' => $reason], $reason);
        jsonResponse(true, null, "Score adjustment of {$amount} PTS applied for player {$targetUser['username']}.");
    }

    // 5. RESET PROGRESS
    if ($action === 'reset_progress') {
        $pdo->beginTransaction();
        try {
            $pdo->prepare("DELETE FROM ctf_submissions WHERE user_id = ?")->execute([$userId]);
            $pdo->prepare("DELETE FROM ctf_attempts WHERE user_id = ?")->execute([$userId]);
            $pdo->prepare("DELETE FROM ctf_unlocked_hints WHERE user_id = ?")->execute([$userId]);
            $pdo->prepare("DELETE FROM ctf_score_adjustments WHERE user_id = ?")->execute([$userId]);

            logAuditRecord($actor, 'RESET_PROGRESS', 'ctf_users', (string)$userId, null, null, "Challenge completions cleared by administrator {$actor}");

            $pdo->commit();
            jsonResponse(true, null, "Progress and solves reset for player {$targetUser['username']}.");
        } catch (Throwable $e) {
            $pdo->rollBack();
            jsonError("Failed to reset progress: " . $e->getMessage(), 500);
        }
    }

    // 6. PLAYER DETAILS (Submissions, attempts, events)
    if ($action === 'player_details') {
        // Solves
        $stmtSolves = $pdo->prepare("
            SELECT s.challenge_id, s.points_awarded, s.solved_at, c.title, c.difficulty
            FROM ctf_submissions s
            INNER JOIN ctf_challenges c ON s.challenge_id = c.id
            WHERE s.user_id = ?
            ORDER BY s.solved_at DESC
        ");
        $stmtSolves->execute([$userId]);
        $solves = $stmtSolves->fetchAll();

        // Recent attempts
        $stmtAttempts = $pdo->prepare("
            SELECT a.challenge_id, a.submitted_flag_preview, a.is_correct, a.created_at, c.title
            FROM ctf_attempts a
            INNER JOIN ctf_challenges c ON a.challenge_id = c.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT 20
        ");
        $stmtAttempts->execute([$userId]);
        $attempts = $stmtAttempts->fetchAll();

        // Adjustments
        $stmtAdj = $pdo->prepare("
            SELECT id, amount, reason, created_by, created_at
            FROM ctf_score_adjustments
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmtAdj->execute([$userId]);
        $adjustments = $stmtAdj->fetchAll();

        jsonResponse(true, [
            'player' => $targetUser,
            'solves' => $solves,
            'attempts' => $attempts,
            'adjustments' => $adjustments,
        ]);
    }

    jsonError("Invalid action specified.", 400);
}

jsonError("Method not allowed", 405);

