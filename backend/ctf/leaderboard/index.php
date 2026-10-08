<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}
if (!isCtfSettingEnabled('leaderboard_enabled', true)) {
    jsonError("The public leaderboard is temporarily disabled by administration.", 403, 'LEADERBOARD_DISABLED');
}

// Dynamically compute total published challenges (Section 23: NEVER hardcode total)
$totalChallenges = (int)$pdo->query("SELECT COUNT(*) FROM ctf_challenges WHERE status = 'published'")->fetchColumn();

// Query leaderboard with deterministic ranking
$query = "
    SELECT 
        u.id AS user_id,
        u.username,
        u.country_code,
        COUNT(DISTINCT s.challenge_id) AS solved_count,
        MAX(s.solved_at) AS last_solve_time,
        (
            COALESCE(SUM(s.points_awarded), 0) +
            COALESCE((SELECT SUM(amount) FROM ctf_score_adjustments WHERE user_id = u.id), 0) -
            COALESCE((SELECT SUM(h.cost) FROM ctf_unlocked_hints uh INNER JOIN ctf_hints h ON uh.hint_id = h.id WHERE uh.user_id = u.id), 0)
        ) AS final_score
    FROM ctf_users u
    LEFT JOIN ctf_submissions s ON u.id = s.user_id
    WHERE u.is_banned = 0
    GROUP BY u.id, u.username, u.country_code
    HAVING final_score > 0 OR solved_count > 0
    ORDER BY final_score DESC, solved_count DESC, last_solve_time ASC, u.id ASC
";

$stmt = $pdo->query($query);
$allRankings = [];
$rank = 1;

while ($row = $stmt->fetch()) {
    $score = max(0, (int)$row['final_score']);
    $solved = (int)$row['solved_count'];

    $allRankings[] = [
        'rank' => $rank++,
        'user_id' => (int)$row['user_id'],
        'username' => $row['username'],
        'country_code' => $row['country_code'] ?: 'ID',
        'solved' => $solved,
        'total_challenges' => $totalChallenges,
        'score' => $score,
        'last_solve_time' => $row['last_solve_time'],
    ];
}

$top3 = array_slice($allRankings, 0, 3);
$top10 = array_slice($allRankings, 0, 10);

jsonResponse(true, [
    'total_challenges' => $totalChallenges,
    'total_participants' => count($allRankings),
    'top3' => $top3,
    'top10' => $top10,
    'rankings' => $allRankings,
]);

