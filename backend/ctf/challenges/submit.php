<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';
require_once __DIR__ . '/../middleware/rateLimit.php';
require_once __DIR__ . '/../middleware/security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError("Method not allowed", 405);
}

$user = requireCtfAuth();
$userId = (int)$user['user_id'];

// Check submissions setting
$settings = getCtfSettings(true);
if (isCtfSettingEnabled('maintenance_mode', false)) {
    jsonError($settings['maintenance_message'] ?? "CTF arena is under maintenance.", 503, 'MAINTENANCE');
}
if (!isCtfSettingEnabled('ctf_enabled', true)) {
    jsonError($settings['soon_message'] ?? "CTF arena is currently disabled.", 503, 'DISABLED');
}
if (!isCtfSettingEnabled('submissions_enabled', true)) {
    jsonError("Challenge flag submissions are temporarily disabled.", 403, 'SUBMISSIONS_DISABLED');
}

// Rate limiting: 15 submissions per minute per user
enforceRateLimit('flag_submit', 15, 60, $userId);

$body = getJsonBody();
checkForbiddenParameters($body);

$challengeId = (int)($body['challenge_id'] ?? 0);
$answer = trim((string)($body['answer'] ?? $body['flag'] ?? ''));

inspectInputSecurity($answer, 'answer', $userId);

if ($challengeId <= 0 || empty($answer)) {
    jsonError("Please provide both challenge_id and your answer flag.");
}

// Look up challenge
$stmt = $pdo->prepare("
    SELECT id, title, points, flag_hash, status
    FROM ctf_challenges
    WHERE id = ? AND status = 'published'
    LIMIT 1
");
$stmt->execute([$challengeId]);
$challenge = $stmt->fetch();

if (!$challenge) {
    jsonError("Challenge not found or not active.", 404);
}

// Sanitize preview of submitted flag for attempt log (max 64 chars, obfuscated preview)
$flagPreview = strlen($answer) > 64 ? substr($answer, 0, 60) . '...' : $answer;
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// Server-side verification using password_verify() against flag_hash
$isCorrect = password_verify($answer, $challenge['flag_hash']);

// Record attempt
try {
    $stmtAttempt = $pdo->prepare("
        INSERT INTO ctf_attempts (user_id, challenge_id, submitted_flag_preview, is_correct, ip_address)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmtAttempt->execute([$userId, $challengeId, $flagPreview, $isCorrect ? 1 : 0, $ip]);
} catch (Throwable $e) {
    error_log("[CTF_ATTEMPT_LOG_ERROR] " . $e->getMessage());
}

if (!$isCorrect) {
    jsonError("The submitted flag is incorrect. Keep investigating the forensic clues.", 400, 'INCORRECT_FLAG');
}

// Atomic solve insertion with Transaction to prevent race conditions
try {
    $pdo->beginTransaction();

    // Check if already solved
    $stmtCheck = $pdo->prepare("SELECT id, points_awarded FROM ctf_submissions WHERE user_id = ? AND challenge_id = ? FOR UPDATE");
    $stmtCheck->execute([$userId, $challengeId]);
    $alreadySolved = $stmtCheck->fetch();

    if ($alreadySolved) {
        $pdo->rollBack();
        jsonResponse(true, [
            'already_solved' => true,
            'points_awarded' => 0,
        ], "You have already solved this challenge!");
    }

    $pointsToAward = (int)$challenge['points'];

    $stmtInsert = $pdo->prepare("
        INSERT INTO ctf_submissions (user_id, challenge_id, points_awarded, solved_at)
        VALUES (?, ?, ?, NOW())
    ");
    $stmtInsert->execute([$userId, $challengeId, $pointsToAward]);

    $pdo->commit();

    jsonResponse(true, [
        'solved' => true,
        'points_awarded' => $pointsToAward,
        'challenge_id' => $challengeId,
        'title' => $challenge['title'],
    ], "Congratulations! Forensic flag verified and challenge successfully solved! +{$pointsToAward} PTS", 200);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // Duplicate entry catch (if race condition hit unique key)
    if (str_contains($e->getMessage(), 'Duplicate entry')) {
        jsonResponse(true, [
            'already_solved' => true,
            'points_awarded' => 0,
        ], "Challenge was already solved in a concurrent request.");
    }

    error_log("[CTF_SOLVE_ERROR] " . $e->getMessage());
    jsonError("Failed to record solve. Please try again.", 500);
}

