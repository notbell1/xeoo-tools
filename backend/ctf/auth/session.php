<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

$user = getAuthenticatedCtfUser();
$settings = getCtfSettings(true);

// Dynamic count of published challenges
$totalChallenges = (int)$pdo->query("SELECT COUNT(*) FROM ctf_challenges WHERE status = 'published'")->fetchColumn();

$formattedSettings = [
    'ctf_enabled' => isCtfSettingEnabled('ctf_enabled', true),
    'registration_enabled' => isCtfSettingEnabled('registration_enabled', true),
    'login_enabled' => isCtfSettingEnabled('login_enabled', true),
    'submissions_enabled' => isCtfSettingEnabled('submissions_enabled', true),
    'leaderboard_enabled' => isCtfSettingEnabled('leaderboard_enabled', true),
    'maintenance_mode' => isCtfSettingEnabled('maintenance_mode', false),
    'maintenance_message' => (string)($settings['maintenance_message'] ?? 'XeooTools Defacement CTF is temporarily offline for scheduled system updates.'),
    'soon_message' => (string)($settings['soon_message'] ?? 'XeooTools Defacement CTF investigation cases are launching soon.'),
];

if (!$user) {
    jsonResponse(true, [
        'authenticated' => false,
        'user' => null,
        'total_challenges' => $totalChallenges,
        'settings' => $formattedSettings,
    ]);
}

$userId = (int)$user['user_id'];

// Calculate score: Submissions + Adjustments - Hint Costs
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

// Solved challenges count
$stmtSolved = $pdo->prepare("SELECT COUNT(*) FROM ctf_submissions WHERE user_id = ?");
$stmtSolved->execute([$userId]);
$solvedCount = (int)$stmtSolved->fetchColumn();

// Solved challenge IDs
$stmtSolvedIds = $pdo->prepare("SELECT challenge_id FROM ctf_submissions WHERE user_id = ?");
$stmtSolvedIds->execute([$userId]);
$solvedChallengeIds = array_map('intval', $stmtSolvedIds->fetchAll(PDO::FETCH_COLUMN));

$csrfToken = generateCtfCsrfToken($user['session_token']);

jsonResponse(true, [
    'authenticated' => true,
    'user' => [
        'id' => $userId,
        'username' => $user['username'],
        'email' => $user['email'],
        'country_code' => $user['country_code'],
        'created_at' => $user['user_created_at'],
    ],
    'solved_count' => $solvedCount,
    'solved_challenge_ids' => $solvedChallengeIds,
    'total_score' => $totalScore,
    'total_challenges' => $totalChallenges,
    'csrf_token' => $csrfToken,
    'settings' => $formattedSettings,
]);

