<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/auth.php';

$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}

$currentUser = getAuthenticatedCtfUser();
$userId = $currentUser ? (int)$currentUser['user_id'] : null;

// Query published challenges
$query = "
    SELECT 
        c.id, c.slug, c.title, c.category, c.difficulty, c.points,
        c.estimated_minutes, c.case_reference, c.sort_order,
        (SELECT COUNT(*) FROM ctf_submissions WHERE challenge_id = c.id) AS solves_count
        " . ($userId ? ", (SELECT COUNT(*) FROM ctf_submissions WHERE challenge_id = c.id AND user_id = {$userId}) AS is_solved" : ", 0 AS is_solved") . "
    FROM ctf_challenges c
    WHERE c.status = 'published'
    ORDER BY c.sort_order ASC, c.id ASC
";

$stmt = $pdo->query($query);
$challenges = [];
$totalPoints = 0;
$userSolvedCount = 0;

while ($row = $stmt->fetch()) {
    $isSolved = (int)($row['is_solved'] ?? 0) > 0;
    if ($isSolved) {
        $userSolvedCount++;
    }
    $points = (int)$row['points'];
    $totalPoints += $points;

    $challenges[] = [
        'id' => (int)$row['id'],
        'slug' => $row['slug'],
        'title' => $row['title'],
        'category' => $row['category'],
        'difficulty' => $row['difficulty'],
        'points' => $points,
        'estimated_minutes' => (int)$row['estimated_minutes'],
        'case_reference' => $row['case_reference'],
        'solves_count' => (int)$row['solves_count'],
        'solved' => $isSolved,
    ];
}

jsonResponse(true, [
    'challenges' => $challenges,
    'total_challenges' => count($challenges),
    'total_points' => $totalPoints,
    'user_solved_count' => $userSolvedCount,
]);

