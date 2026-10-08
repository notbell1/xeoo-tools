<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = requireCtfAuth();
$userId = (int)$user['user_id'];

$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}

// Get solve timeline
$stmtSolves = $pdo->prepare("
    SELECT s.challenge_id, s.points_awarded, s.solved_at,
           c.title, c.difficulty, c.category, c.case_reference
    FROM ctf_submissions s
    INNER JOIN ctf_challenges c ON s.challenge_id = c.id
    WHERE s.user_id = ?
    ORDER BY s.solved_at DESC
");
$stmtSolves->execute([$userId]);
$solves = $stmtSolves->fetchAll();

// Get attempt counts
$stmtAttempts = $pdo->prepare("
    SELECT COUNT(*) as total_attempts,
           SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as successful_attempts
    FROM ctf_attempts
    WHERE user_id = ?
");
$stmtAttempts->execute([$userId]);
$attemptStats = $stmtAttempts->fetch();

// Calculate total score
$stmtScore = $pdo->prepare("
    SELECT 
        COALESCE(SUM(s.points_awarded), 0) AS solve_points,
        (SELECT COALESCE(SUM(amount), 0) FROM ctf_score_adjustments WHERE user_id = ?) AS adjustment_points,
        (SELECT COALESCE(SUM(h.cost), 0) 
         FROM ctf_unlocked_hints uh 
         INNER JOIN ctf_hints h ON uh.hint_id = h.id 
         WHERE uh.user_id = ?) AS hint_deductions
    FROM ctf_submissions s
    WHERE s.user_id = ?
");
$stmtScore->execute([$userId, $userId, $userId]);
$scoreRow = $stmtScore->fetch();
$totalScore = max(0, (int)$scoreRow['solve_points'] + (int)$scoreRow['adjustment_points'] - (int)$scoreRow['hint_deductions']);

// Get dynamic rank
$stmtRank = $pdo->prepare("
    SELECT rank_pos FROM (
        SELECT u.id, 
               RANK() OVER (ORDER BY (
                   COALESCE((SELECT SUM(points_awarded) FROM ctf_submissions WHERE user_id = u.id), 0) +
                   COALESCE((SELECT SUM(amount) FROM ctf_score_adjustments WHERE user_id = u.id), 0) -
                   COALESCE((SELECT SUM(h.cost) FROM ctf_unlocked_hints uh INNER JOIN ctf_hints h ON uh.hint_id = h.id WHERE uh.user_id = u.id), 0)
               ) DESC, u.id ASC) AS rank_pos
        FROM ctf_users u
        WHERE u.is_banned = 0
    ) ranked
    WHERE id = ?
");
$stmtRank->execute([$userId]);
$rank = (int)($stmtRank->fetchColumn() ?: 1);

jsonResponse(true, [
    'user' => [
        'id' => $userId,
        'username' => $user['username'],
        'email' => $user['email'],
        'country_code' => $user['country_code'],
        'created_at' => $user['user_created_at'],
    ],
    'stats' => [
        'rank' => $rank,
        'score' => $totalScore,
        'solved_count' => count($solves),
        'total_attempts' => (int)($attemptStats['total_attempts'] ?? 0),
        'successful_attempts' => (int)($attemptStats['successful_attempts'] ?? 0),
    ],
    'solves' => $solves,
]);

