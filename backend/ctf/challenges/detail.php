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

$idOrSlug = trim((string)($_GET['id'] ?? $_GET['slug'] ?? ''));

if (empty($idOrSlug)) {
    jsonError("Challenge identifier is required.", 400);
}

// Check by ID or slug
$stmt = $pdo->prepare("
    SELECT id, ctf_id, slug, title, category, difficulty, points, estimated_minutes,
           case_reference, scenario, objective, flag_format, status
    FROM ctf_challenges
    WHERE (id = ? OR slug = ?) AND status = 'published'
    LIMIT 1
");
$stmt->execute([is_numeric($idOrSlug) ? (int)$idOrSlug : 0, $idOrSlug]);
$challenge = $stmt->fetch();

if (!$challenge) {
    jsonError("The requested forensic challenge does not exist or is currently unavailable.", 404, 'NOT_FOUND');
}

$chId = (int)$challenge['id'];

// Check if solved
$isSolved = false;
if ($userId) {
    $stmtSolved = $pdo->prepare("SELECT COUNT(*) FROM ctf_submissions WHERE challenge_id = ? AND user_id = ?");
    $stmtSolved->execute([$chId, $userId]);
    $isSolved = (int)$stmtSolved->fetchColumn() > 0;
}

// Artifacts
$stmtArt = $pdo->prepare("
    SELECT id, artifact_uid, name, type, role, content, metadata_json
    FROM ctf_artifacts
    WHERE challenge_id = ?
    ORDER BY sort_order ASC, id ASC
");
$stmtArt->execute([$chId]);
$artifacts = [];
while ($art = $stmtArt->fetch()) {
    $artifacts[] = [
        'id' => $art['artifact_uid'],
        'name' => $art['name'],
        'type' => $art['type'],
        'role' => $art['role'],
        'content' => $art['content'],
        'metadata' => $art['metadata_json'] ? json_decode($art['metadata_json'], true) : null,
    ];
}

// Stages
$stmtStages = $pdo->prepare("
    SELECT id, stage_uid, title, objective, clue, observation, extraction_method, interpretation, next_action
    FROM ctf_stages
    WHERE challenge_id = ?
    ORDER BY sort_order ASC, id ASC
");
$stmtStages->execute([$chId]);
$stages = [];
while ($stg = $stmtStages->fetch()) {
    $stages[] = [
        'id' => $stg['stage_uid'],
        'title' => $stg['title'],
        'objective' => $stg['objective'],
        'clue' => $stg['clue'],
        'observation' => $stg['observation'],
        'extraction_method' => $stg['extraction_method'],
        'interpretation' => $stg['interpretation'],
        'next_action' => $stg['next_action'],
    ];
}

// Hints & Unlocked Hints
$stmtHints = $pdo->prepare("
    SELECT id, title, hint_text, cost
    FROM ctf_hints
    WHERE challenge_id = ?
    ORDER BY sort_order ASC, id ASC
");
$stmtHints->execute([$chId]);
$allHints = $stmtHints->fetchAll();

$unlockedHintIds = [];
if ($userId) {
    $stmtUnlocked = $pdo->prepare("
        SELECT hint_id FROM ctf_unlocked_hints WHERE user_id = ?
    ");
    $stmtUnlocked->execute([$userId]);
    $unlockedHintIds = array_map('intval', $stmtUnlocked->fetchAll(PDO::FETCH_COLUMN));
}

$hintsPayload = [];
foreach ($allHints as $h) {
    $hId = (int)$h['id'];
    $isUnlocked = in_array($hId, $unlockedHintIds, true) || (int)$h['cost'] === 0;

    $hintsPayload[] = [
        'id' => $hId,
        'title' => $h['title'],
        'cost' => (int)$h['cost'],
        'unlocked' => $isUnlocked,
        'hint_text' => $isUnlocked ? $h['hint_text'] : null,
    ];
}

jsonResponse(true, [
    'challenge' => [
        'id' => $chId,
        'slug' => $challenge['slug'],
        'title' => $challenge['title'],
        'category' => $challenge['category'],
        'difficulty' => $challenge['difficulty'],
        'points' => (int)$challenge['points'],
        'estimated_minutes' => (int)$challenge['estimated_minutes'],
        'case_reference' => $challenge['case_reference'],
        'scenario' => $challenge['scenario'],
        'objective' => $challenge['objective'],
        'flag_format' => $challenge['flag_format'],
        'solved' => $isSolved,
        'artifacts' => $artifacts,
        'stages' => $stages,
        'hints' => $hintsPayload,
    ]
]);

