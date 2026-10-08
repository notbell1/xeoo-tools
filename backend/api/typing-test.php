<?php

declare(strict_types=1);

session_start();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://5nc6c83n-5173.asse.devtunnels.ms',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header(
    'Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'
);
header('Access-Control-Max-Age: 86400');

/*
|--------------------------------------------------------------------------
| Preflight
|--------------------------------------------------------------------------
*/

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Response headers
|--------------------------------------------------------------------------
*/

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function respond(
    bool $success,
    string $message = '',
    array $data = [],
    int $status = 200
): never {
    http_response_code($status);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

/**
 * Read JSON request body.
 */
function requestData(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);

    if (!is_array($data)) {
        respond(
            false,
            'Invalid JSON request.',
            [],
            400
        );
    }

    return $data;
}

/**
 * Merge GET query parameters with JSON body.
 *
 * JSON body takes precedence over GET parameters.
 */
function getRequestData(): array
{
    $queryData = $_GET;
    $bodyData = requestData();

    return array_merge($queryData, $bodyData);
}

function requireString(
    array $data,
    string $key,
    int $minLength = 1,
    int $maxLength = 255
): string {
    $value = $data[$key] ?? null;

    if (!is_string($value)) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    $value = trim($value);
    $length = mb_strlen($value);

    if ($length < $minLength || $length > $maxLength) {
        respond(
            false,
            "Invalid {$key} length.",
            [],
            422
        );
    }

    return $value;
}

function optionalString(
    array $data,
    string $key,
    int $maxLength = 255
): ?string {
    if (
        !array_key_exists($key, $data)
        || $data[$key] === null
    ) {
        return null;
    }

    if (!is_string($data[$key])) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    $value = trim($data[$key]);

    if (mb_strlen($value) > $maxLength) {
        respond(
            false,
            "Invalid {$key} length.",
            [],
            422
        );
    }

    return $value === '' ? null : $value;
}

function requireInt(
    array $data,
    string $key,
    int $min,
    int $max
): int {
    $value = $data[$key] ?? null;

    if (
        filter_var($value, FILTER_VALIDATE_INT) === false
        && !is_int($value)
    ) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    $value = (int) $value;

    if ($value < $min || $value > $max) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    return $value;
}

function optionalInt(
    array $data,
    string $key,
    int $default,
    int $min,
    int $max
): int {
    if (
        !array_key_exists($key, $data)
        || $data[$key] === null
        || $data[$key] === ''
    ) {
        return $default;
    }

    if (
        filter_var($data[$key], FILTER_VALIDATE_INT) === false
        && !is_int($data[$key])
    ) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    $value = (int) $data[$key];

    if ($value < $min || $value > $max) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    return $value;
}

function optionalFloat(
    array $data,
    string $key,
    float $default,
    float $min,
    float $max
): float {
    if (
        !array_key_exists($key, $data)
        || $data[$key] === null
        || $data[$key] === ''
    ) {
        return $default;
    }

    if (!is_numeric($data[$key])) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    $value = (float) $data[$key];

    if ($value < $min || $value > $max) {
        respond(
            false,
            "Invalid {$key}.",
            [],
            422
        );
    }

    return $value;
}

function validateLanguage(string $language): string
{
    if (
        !in_array(
            $language,
            ['english', 'indonesian'],
            true
        )
    ) {
        respond(
            false,
            'Invalid language.',
            [],
            422
        );
    }

    return $language;
}

function validateMode(string $mode): string
{
    if (
        !in_array(
            $mode,
            ['time', 'words', 'custom'],
            true
        )
    ) {
        respond(
            false,
            'Invalid test mode.',
            [],
            422
        );
    }

    return $mode;
}

function validateDifficulty(string $difficulty): string
{
    if (
        !in_array(
            $difficulty,
            [
                'common',
                'advanced',
                'technical',
                'punctuation',
            ],
            true
        )
    ) {
        respond(
            false,
            'Invalid difficulty.',
            [],
            422
        );
    }

    return $difficulty;
}

function validateDuration(int $duration): int
{
    if (
        !in_array(
            $duration,
            [15, 30, 60, 120],
            true
        )
    ) {
        respond(
            false,
            'Invalid duration.',
            [],
            422
        );
    }

    return $duration;
}

function validateTargetWords(int $targetWords): int
{
    if (
        !in_array(
            $targetWords,
            [10, 25, 50, 100, 200],
            true
        )
    ) {
        respond(
            false,
            'Invalid word count.',
            [],
            422
        );
    }

    return $targetWords;
}

function timeTargetWords(int $duration): int
{
    return match ($duration) {
        15 => 60,
        30 => 120,
        60 => 240,
        120 => 480,
        default => 0,
    };
}

function generateUuidV4(): string
{
    $data = random_bytes(16);

    $data[6] = chr(
        (ord($data[6]) & 0x0f) | 0x40
    );

    $data[8] = chr(
        (ord($data[8]) & 0x3f) | 0x80
    );

    return vsprintf(
        '%s%s-%s-%s-%s-%s%s%s',
        str_split(
            bin2hex($data),
            4
        )
    );
}

function calculateWpm(
    int $correctCharacters,
    float $elapsedSeconds
): float {
    if (
        $elapsedSeconds <= 0
        || $correctCharacters <= 0
    ) {
        return 0.0;
    }

    return round(
        ($correctCharacters / 5)
            / ($elapsedSeconds / 60),
        2
    );
}

function calculateRawWpm(
    int $typedCharacters,
    float $elapsedSeconds
): float {
    if (
        $elapsedSeconds <= 0
        || $typedCharacters <= 0
    ) {
        return 0.0;
    }

    return round(
        ($typedCharacters / 5)
            / ($elapsedSeconds / 60),
        2
    );
}

function calculateAccuracy(
    int $typedCharacters,
    int $correctCharacters
): float {
    if ($typedCharacters <= 0) {
        return 0.0;
    }

    return round(
        max(
            0.0,
            min(
                100.0,
                ($correctCharacters / $typedCharacters) * 100
            )
        ),
        2
    );
}

function calculateCompletion(
    string $mode,
    int $typedCharacters,
    int $targetCharacters
): float {
    if ($mode === 'time') {
        return 100.0;
    }

    if ($targetCharacters <= 0) {
        return 0.0;
    }

    return round(
        max(
            0.0,
            min(
                100.0,
                ($typedCharacters / $targetCharacters) * 100
            )
        ),
        2
    );
}

function calculateScore(
    float $correctWpm,
    float $accuracy,
    float $consistency
): float {
    $accuracyFactor = max(
        0.0,
        min(
            1.0,
            $accuracy / 100
        )
    );

    $consistencyFactor = max(
        0.0,
        min(
            1.0,
            $consistency / 100
        )
    );

    $score =
        $correctWpm
        * pow($accuracyFactor, 1.5)
        * pow($consistencyFactor, 0.5)
        * 10;

    return round(
        max(0.0, $score),
        2
    );
}

/*
|--------------------------------------------------------------------------
| Database helpers
|--------------------------------------------------------------------------
*/

function getSession(
    PDO $pdo,
    string $sessionId
): ?array {
    $stmt = $pdo->prepare(
        'SELECT
            id,
            player_id,
            language,
            mode,
            target_words,
            difficulty,
            duration_seconds,
            target_characters,
            started_at,
            finished_at,
            status,
            created_at
         FROM typing_test_sessions
         WHERE id = :id
         LIMIT 1'
    );

    $stmt->execute([
        ':id' => $sessionId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function getResult(
    PDO $pdo,
    string $sessionId
): ?array {
    $stmt = $pdo->prepare(
        'SELECT
            id,
            session_id,
            player_id,
            language,
            mode,
            target_words,
            duration_seconds,
            typed_characters,
            correct_characters,
            incorrect_characters,
            raw_wpm,
            correct_wpm,
            accuracy,
            consistency,
            completion,
            score,
            saved_at,
            save_name,
            save_region,
            created_at
         FROM typing_test_results
         WHERE session_id = :session_id
         LIMIT 1'
    );

    $stmt->execute([
        ':session_id' => $sessionId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function normalizeResult(array $result): array
{
    return [
        'id' => (int) $result['id'],

        'session_id' => $result['session_id'],

        'player_id' => $result['player_id'] !== null
            ? (int) $result['player_id']
            : null,

        'language' => $result['language'],
        'mode' => $result['mode'],

        'target_words' => (int) $result['target_words'],

        'duration_seconds' => (int) $result['duration_seconds'],

        'typed_characters' => (int) $result['typed_characters'],

        'correct_characters' => (int) $result['correct_characters'],

        'incorrect_characters' => (int) $result['incorrect_characters'],

        'raw_wpm' => (float) $result['raw_wpm'],

        'correct_wpm' => (float) $result['correct_wpm'],

        'accuracy' => (float) $result['accuracy'],

        'consistency' => (float) $result['consistency'],

        'completion' => (float) $result['completion'],

        'score' => (float) $result['score'],

        'saved_at' => $result['saved_at'],

        'save_name' => $result['save_name'],

        'save_region' => $result['save_region'],

        'created_at' => $result['created_at'],
    ];
}

/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

function actionStart(
    PDO $pdo,
    array $data
): void {
    $language = validateLanguage(
        requireString(
            $data,
            'language',
            1,
            20
        )
    );

    $mode = validateMode(
        requireString(
            $data,
            'mode',
            1,
            20
        )
    );

    $difficulty = validateDifficulty(
        requireString(
            $data,
            'difficulty',
            1,
            20
        )
    );

    $durationSeconds = optionalInt(
        $data,
        'duration_seconds',
        0,
        0,
        120
    );

    $targetWords = optionalInt(
        $data,
        'target_words',
        0,
        0,
        200
    );

    $targetCharacters = optionalInt(
        $data,
        'target_characters',
        0,
        0,
        200000
    );

    if ($mode === 'time') {
        $durationSeconds = validateDuration(
            $durationSeconds
        );

        $targetWords = timeTargetWords(
            $durationSeconds
        );

        if ($targetWords <= 0) {
            respond(
                false,
                'Invalid time configuration.',
                [],
                422
            );
        }
    }

    if ($mode === 'words') {
        $targetWords = validateTargetWords(
            $targetWords
        );

        $durationSeconds = 0;

        if ($targetCharacters <= 0) {
            respond(
                false,
                'Target characters are required for Words mode.',
                [],
                422
            );
        }
    }

    if ($mode === 'custom') {
        $durationSeconds = 0;
        $targetWords = 0;

        if ($targetCharacters <= 0) {
            respond(
                false,
                'Target characters are required for Custom mode.',
                [],
                422
            );
        }
    }

    $sessionId = generateUuidV4();

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO typing_test_sessions (
                id,
                player_id,
                language,
                mode,
                target_words,
                difficulty,
                duration_seconds,
                target_characters,
                started_at,
                status
            ) VALUES (
                :id,
                NULL,
                :language,
                :mode,
                :target_words,
                :difficulty,
                :duration_seconds,
                :target_characters,
                UTC_TIMESTAMP(6),
                :status
            )'
        );

        $stmt->execute([
            ':id' => $sessionId,
            ':language' => $language,
            ':mode' => $mode,
            ':target_words' => $targetWords,
            ':difficulty' => $difficulty,
            ':duration_seconds' => $durationSeconds,
            ':target_characters' => $targetCharacters,
            ':status' => 'started',
        ]);

        respond(
            true,
            'Typing test started.',
            [
                'session_id' => $sessionId,
                'language' => $language,
                'mode' => $mode,
                'difficulty' => $difficulty,
                'duration_seconds' => $durationSeconds,
                'target_words' => $targetWords,
                'target_characters' => $targetCharacters,
            ]
        );
    } catch (Throwable $e) {
        respond(
            false,
            'Unable to start typing test.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| FINISH
|--------------------------------------------------------------------------
*/

function actionFinish(
    PDO $pdo,
    array $data
): void {
    $sessionId = requireString(
        $data,
        'session_id',
        36,
        36
    );

    $typedCharacters = requireInt(
        $data,
        'typed_characters',
        0,
        1000000
    );

    $correctCharacters = requireInt(
        $data,
        'correct_characters',
        0,
        1000000
    );

    $incorrectCharacters = requireInt(
        $data,
        'incorrect_characters',
        0,
        1000000
    );

    $consistency = optionalFloat(
        $data,
        'consistency',
        0.0,
        0.0,
        100.0
    );

    if (
        $correctCharacters + $incorrectCharacters
        !== $typedCharacters
    ) {
        respond(
            false,
            'Character counts do not match.',
            [],
            422
        );
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'SELECT
                id,
                player_id,
                language,
                mode,
                target_words,
                difficulty,
                duration_seconds,
                target_characters,
                started_at,
                finished_at,
                status
             FROM typing_test_sessions
             WHERE id = :id
             LIMIT 1
             FOR UPDATE'
        );

        $stmt->execute([
            ':id' => $sessionId,
        ]);

        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            $pdo->rollBack();

            respond(
                false,
                'Typing session not found.',
                [],
                404
            );
        }

        if ($session['status'] !== 'started') {
            $pdo->rollBack();

            respond(
                false,
                'Typing session has already been finished.',
                [],
                409
            );
        }

        $elapsedStmt = $pdo->prepare(
            'SELECT
                TIMESTAMPDIFF(
                    MICROSECOND,
                    started_at,
                    UTC_TIMESTAMP(6)
                ) / 1000000 AS elapsed_seconds
             FROM typing_test_sessions
             WHERE id = :id
             LIMIT 1'
        );

        $elapsedStmt->execute([
            ':id' => $sessionId,
        ]);

        $elapsedSeconds = (float) $elapsedStmt->fetchColumn();

        if ($elapsedSeconds <= 0) {
            $elapsedSeconds = 0.01;
        }

        $mode = $session['mode'];

        $durationSeconds = (int) $session['duration_seconds'];

        $targetCharacters = (int) $session['target_characters'];

        /*
         * Time mode is limited to its configured duration.
         */
        if (
            $mode === 'time'
            && $durationSeconds > 0
            && $elapsedSeconds > $durationSeconds
        ) {
            $elapsedSeconds = (float) $durationSeconds;
        }

        /*
         * Prevent submitted character count from exceeding
         * the configured target for finite tests.
         */
        if (
            in_array(
                $mode,
                ['words', 'custom'],
                true
            )
            && $targetCharacters > 0
            && $typedCharacters > $targetCharacters
        ) {
            $typedCharacters = $targetCharacters;

            if ($correctCharacters > $typedCharacters) {
                $correctCharacters = $typedCharacters;
            }

            $incorrectCharacters =
                $typedCharacters - $correctCharacters;
        }

        $rawWpm = calculateRawWpm(
            $typedCharacters,
            $elapsedSeconds
        );

        $correctWpm = calculateWpm(
            $correctCharacters,
            $elapsedSeconds
        );

        $accuracy = calculateAccuracy(
            $typedCharacters,
            $correctCharacters
        );

        $completion = calculateCompletion(
            $mode,
            $typedCharacters,
            $targetCharacters
        );

        $score = calculateScore(
            $correctWpm,
            $accuracy,
            $consistency
        );

        $existingResultStmt = $pdo->prepare(
            'SELECT id
             FROM typing_test_results
             WHERE session_id = :session_id
             LIMIT 1
             FOR UPDATE'
        );

        $existingResultStmt->execute([
            ':session_id' => $sessionId,
        ]);

        $existingResultId =
            $existingResultStmt->fetchColumn();

        if ($existingResultId) {
            $pdo->rollBack();

            respond(
                false,
                'A result already exists for this session.',
                [],
                409
            );
        }

        // Insert as NULL for save_name, save_region, saved_at until the user saves it
        $insertResult = $pdo->prepare(
            'INSERT INTO typing_test_results (
                session_id,
                player_id,
                language,
                mode,
                target_words,
                duration_seconds,
                typed_characters,
                correct_characters,
                incorrect_characters,
                raw_wpm,
                correct_wpm,
                accuracy,
                consistency,
                completion,
                score,
                saved_at,
                save_name,
                save_region
            ) VALUES (
                :session_id,
                NULL,
                :language,
                :mode,
                :target_words,
                :duration_seconds,
                :typed_characters,
                :correct_characters,
                :incorrect_characters,
                :raw_wpm,
                :correct_wpm,
                :accuracy,
                :consistency,
                :completion,
                :score,
                NULL,
                NULL,
                NULL
            )'
        );

        $insertResult->execute([
            ':session_id' => $sessionId,
            ':language' => $session['language'],
            ':mode' => $mode,
            ':target_words' => (int) $session['target_words'],
            ':duration_seconds' => $durationSeconds,
            ':typed_characters' => $typedCharacters,
            ':correct_characters' => $correctCharacters,
            ':incorrect_characters' => $incorrectCharacters,
            ':raw_wpm' => $rawWpm,
            ':correct_wpm' => $correctWpm,
            ':accuracy' => $accuracy,
            ':consistency' => $consistency,
            ':completion' => $completion,
            ':score' => $score,
        ]);

        $updateSession = $pdo->prepare(
            'UPDATE typing_test_sessions
             SET
                finished_at = UTC_TIMESTAMP(6),
                status = :status
             WHERE id = :id'
        );

        $updateSession->execute([
            ':status' => 'completed',
            ':id' => $sessionId,
        ]);

        $pdo->commit();

        $result = getResult(
            $pdo,
            $sessionId
        );

        if (!$result) {
            respond(
                false,
                'Result could not be loaded.',
                [],
                500
            );
        }

        respond(
            true,
            'Typing test completed.',
            [
                'result' => normalizeResult($result),
                'can_save' => true,
                'leaderboard_eligible' =>
                $mode !== 'custom',
            ]
        );
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        respond(
            false,
            'Unable to finish typing test.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| SAVE PROGRESS
|--------------------------------------------------------------------------
*/

function actionSaveProgress(
    PDO $pdo,
    array $data
): void {
    $sessionId = requireString(
        $data,
        'session_id',
        36,
        36
    );

    $displayName = requireString(
        $data,
        'username',
        2,
        32
    );

    $region = requireString(
        $data,
        'region',
        2,
        64
    );

    // Get country_code from frontend safely
    $countryCode = optionalString(
        $data,
        'country_code',
        10
    );

    $result = getResult(
        $pdo,
        $sessionId
    );

    if (!$result) {
        respond(
            false,
            'Typing result not found.',
            [],
            404
        );
    }

    if ($result['player_id'] !== null) {
        respond(
            true,
            'Typing progress is already saved.',
            [
                'player_id' =>
                (int) $result['player_id'],

                'result' =>
                normalizeResult($result),

                'leaderboard_eligible' =>
                $result['mode'] !== 'custom',
            ]
        );
    }

    $playerKey = mb_strtolower(
        $displayName . '|' . $region,
        'UTF-8'
    );

    $playerKeyHash = hash(
        'sha256',
        $playerKey
    );

    try {
        $pdo->beginTransaction();

        $playerStmt = $pdo->prepare(
            'SELECT
                id,
                display_name,
                region,
                player_key_hash
             FROM typing_players
             WHERE player_key_hash = :player_key_hash
             LIMIT 1
             FOR UPDATE'
        );

        $playerStmt->execute([
            ':player_key_hash' => $playerKeyHash,
        ]);

        $player = $playerStmt->fetch(
            PDO::FETCH_ASSOC
        );

        if (!$player) {
            // Insert data pemain baru beserta country_code
            $insertPlayer = $pdo->prepare(
                'INSERT INTO typing_players (
                    display_name,
                    region,
                    country_code,
                    player_key_hash,
                    last_seen_at
                ) VALUES (
                    :display_name,
                    :region,
                    :country_code,
                    :player_key_hash,
                    UTC_TIMESTAMP()
                )'
            );

            $insertPlayer->execute([
                ':display_name' => $displayName,
                ':region' => $region,
                ':country_code' => $countryCode,
                ':player_key_hash' => $playerKeyHash,
            ]);

            $playerId =
                (int) $pdo->lastInsertId();

            $player = [
                'id' => $playerId,
                'display_name' => $displayName,
                'region' => $region,
                'country_code' => $countryCode,
                'player_key_hash' => $playerKeyHash,
            ];
        } else {
            $playerId = (int) $player['id'];

            // Update nama, region, dan pastikan country_code ter-update
            $updatePlayer = $pdo->prepare(
                'UPDATE typing_players
                 SET
                    display_name = :display_name,
                    region = :region,
                    country_code = :country_code,
                    last_seen_at = UTC_TIMESTAMP()
                 WHERE id = :id'
            );

            $updatePlayer->execute([
                ':display_name' => $displayName,
                ':region' => $region,
                ':country_code' => $countryCode,
                ':id' => $playerId,
            ]);
        }

        // Update riwayat skor agar save_name, save_region, saved_at terisi penuh
        $saveResult = $pdo->prepare(
            'UPDATE typing_test_results
             SET
                player_id = :player_id,
                saved_at = UTC_TIMESTAMP(),
                save_name = :save_name,
                save_region = :save_region
             WHERE session_id = :session_id
               AND player_id IS NULL'
        );

        $saveResult->execute([
            ':player_id' => $playerId,
            ':save_name' => $displayName,
            ':save_region' => $region,
            ':session_id' => $sessionId,
        ]);

        if ($saveResult->rowCount() === 0) {
            $pdo->rollBack();

            respond(
                false,
                'Result has already been saved or could not be updated.',
                [],
                409
            );
        }

        $updateSession = $pdo->prepare(
            'UPDATE typing_test_sessions
             SET player_id = :player_id
             WHERE id = :id'
        );

        $updateSession->execute([
            ':player_id' => $playerId,
            ':id' => $sessionId,
        ]);

        $pdo->commit();

        $savedResult = getResult(
            $pdo,
            $sessionId
        );

        if (!$savedResult) {
            respond(
                false,
                'Saved result could not be loaded.',
                [],
                500
            );
        }

        respond(
            true,
            'Typing progress saved.',
            [
                'player' => [
                    'id' => $playerId,
                    'display_name' => $displayName,
                    'region' => $region,
                    'country_code' => $countryCode,
                ],

                'result' =>
                normalizeResult($savedResult),

                'leaderboard_eligible' =>
                $savedResult['mode'] !== 'custom',
            ]
        );
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        respond(
            false,
            'Unable to save typing progress.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| DISCARD RESULT
|--------------------------------------------------------------------------
*/

function actionDiscardResult(
    PDO $pdo,
    array $data
): void {
    $sessionId = requireString(
        $data,
        'session_id',
        36,
        36
    );

    try {
        $pdo->beginTransaction();

        $resultStmt = $pdo->prepare(
            'SELECT
                id,
                player_id
             FROM typing_test_results
             WHERE session_id = :session_id
             LIMIT 1
             FOR UPDATE'
        );

        $resultStmt->execute([
            ':session_id' => $sessionId,
        ]);

        $result = $resultStmt->fetch(
            PDO::FETCH_ASSOC
        );

        if (!$result) {
            $pdo->rollBack();

            respond(
                true,
                'Result already discarded.',
                []
            );
        }

        if ($result['player_id'] !== null) {
            $pdo->rollBack();

            respond(
                false,
                'Saved results cannot be discarded.',
                [],
                409
            );
        }

        $deleteResult = $pdo->prepare(
            'DELETE FROM typing_test_results
             WHERE session_id = :session_id
               AND player_id IS NULL'
        );

        $deleteResult->execute([
            ':session_id' => $sessionId,
        ]);

        $deleteSession = $pdo->prepare(
            'DELETE FROM typing_test_sessions
             WHERE id = :id
               AND player_id IS NULL'
        );

        $deleteSession->execute([
            ':id' => $sessionId,
        ]);

        $pdo->commit();

        respond(
            true,
            'Typing result discarded.',
            []
        );
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        respond(
            false,
            'Unable to discard result.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| ABANDON
|--------------------------------------------------------------------------
*/

function actionAbandon(
    PDO $pdo,
    array $data
): void {
    $sessionId = requireString(
        $data,
        'session_id',
        36,
        36
    );

    try {
        $stmt = $pdo->prepare(
            'UPDATE typing_test_sessions
             SET
                status = :status,
                finished_at = UTC_TIMESTAMP(6)
             WHERE id = :id
               AND status = :current_status'
        );

        $stmt->execute([
            ':status' => 'abandoned',
            ':current_status' => 'started',
            ':id' => $sessionId,
        ]);

        respond(
            true,
            'Typing test abandoned.',
            [
                'session_id' => $sessionId,
                'updated' => $stmt->rowCount() > 0,
            ]
        );
    } catch (Throwable $e) {
        respond(
            false,
            'Unable to abandon typing test.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| LEADERBOARD
|--------------------------------------------------------------------------
*/

function actionLeaderboard(
    PDO $pdo,
    array $data
): void {
    $language = validateLanguage(
        requireString(
            $data,
            'language',
            1,
            20
        )
    );

    $mode = validateMode(
        requireString(
            $data,
            'mode',
            1,
            20
        )
    );

    $difficulty = validateDifficulty(
        requireString(
            $data,
            'difficulty',
            1,
            20
        )
    );

    $limit = optionalInt(
        $data,
        'limit',
        50,
        1,
        100
    );

    /*
     * Custom tests are intentionally excluded
     * from the global leaderboard.
     */
    if ($mode === 'custom') {
        respond(
            true,
            'Custom tests are not included in the global leaderboard.',
            [
                'items' => [],
                'total' => 0,
                'eligible' => false,
            ]
        );
    }

    $where = [
        'r.player_id IS NOT NULL',
        'r.language = :language',
        'r.mode = :mode',
        's.difficulty = :difficulty',
        's.status = :status',
        'r.saved_at IS NOT NULL',
    ];

    $params = [
        ':language' => $language,
        ':mode' => $mode,
        ':difficulty' => $difficulty,
        ':status' => 'completed',
    ];

    if ($mode === 'time') {
        $durationSeconds = requireInt(
            $data,
            'duration_seconds',
            15,
            120
        );

        validateDuration(
            $durationSeconds
        );

        $where[] =
            'r.duration_seconds = :duration_seconds';

        $params[':duration_seconds'] =
            $durationSeconds;
    }

    if ($mode === 'words') {
        $targetWords = requireInt(
            $data,
            'target_words',
            10,
            200
        );

        validateTargetWords(
            $targetWords
        );

        $where[] =
            'r.target_words = :target_words';

        $params[':target_words'] =
            $targetWords;
    }

    $whereSql = implode(
        "\n            AND ",
        $where
    );

    $sql = "
        SELECT
            r.id,
            r.session_id,
            r.language,
            r.mode,
            r.target_words,
            r.duration_seconds,
            r.raw_wpm,
            r.correct_wpm,
            r.accuracy,
            r.consistency,
            r.completion,
            r.score,
            r.save_name,
            r.save_region,
            r.saved_at,

            p.id AS player_id,
            p.display_name,
            p.region,
            p.country_code,

            s.difficulty

        FROM typing_test_results r

        INNER JOIN typing_test_sessions s
            ON s.id = r.session_id

        INNER JOIN typing_players p
            ON p.id = r.player_id

        WHERE {$whereSql}

        ORDER BY
            r.score DESC,
            r.accuracy DESC,
            r.correct_wpm DESC,
            r.created_at ASC

        LIMIT {$limit}
    ";

    try {
        $stmt = $pdo->prepare($sql);

        $stmt->execute($params);

        $items = [];

        $rank = 1;

        while (
            $row = $stmt->fetch(
                PDO::FETCH_ASSOC
            )
        ) {
            $items[] = [
                'rank' => $rank++,

                'result_id' =>
                (int) $row['id'],

                'session_id' =>
                $row['session_id'],

                /*
    |--------------------------------------------------------------------------
    | Flat fields for frontend leaderboard
    |--------------------------------------------------------------------------
    */

                'display_name' =>
                $row['display_name'] !== null
                    ? trim((string) $row['display_name'])
                    : null,

                'name' =>
                $row['display_name'] !== null
                    ? trim((string) $row['display_name'])
                    : null,

                'region' =>
                $row['region'] !== null
                    ? trim((string) $row['region'])
                    : null,

                'country_code' =>
                $row['country_code'] !== null
                    ? trim((string) $row['country_code'])
                    : null,

                /*
    |--------------------------------------------------------------------------
    | Keep structured player object too
    |--------------------------------------------------------------------------
    */

                'player' => [
                    'id' =>
                    (int) $row['player_id'],

                    'display_name' =>
                    $row['display_name'] !== null
                        ? trim((string) $row['display_name'])
                        : null,

                    'region' =>
                    $row['region'] !== null
                        ? trim((string) $row['region'])
                        : null,

                    'country_code' =>
                    $row['country_code'] !== null
                        ? trim((string) $row['country_code'])
                        : null,
                ],

                'language' =>
                $row['language'],

                'mode' =>
                $row['mode'],

                'difficulty' =>
                $row['difficulty'],

                'target_words' =>
                (int) $row['target_words'],

                'duration_seconds' =>
                (int) $row['duration_seconds'],

                'raw_wpm' =>
                (float) $row['raw_wpm'],

                'correct_wpm' =>
                (float) $row['correct_wpm'],

                'accuracy' =>
                (float) $row['accuracy'],

                'consistency' =>
                (float) $row['consistency'],

                'completion' =>
                (float) $row['completion'],

                'score' =>
                (float) $row['score'],

                'saved_at' =>
                $row['saved_at'],
            ];
        }

        respond(
            true,
            'Leaderboard loaded.',
            [
                'items' => $items,
                'total' => count($items),
                'eligible' => true,
            ]
        );
    } catch (Throwable $e) {
        respond(
            false,
            'Unable to load leaderboard.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| PLAYER RESULTS
|--------------------------------------------------------------------------
*/

function actionPlayerResults(
    PDO $pdo,
    array $data
): void {
    $playerId = requireInt(
        $data,
        'player_id',
        1,
        PHP_INT_MAX
    );

    $limit = optionalInt(
        $data,
        'limit',
        50,
        1,
        100
    );

    $playerStmt = $pdo->prepare(
        'SELECT
            id,
            display_name,
            region,
            country_code,
            created_at,
            last_seen_at
         FROM typing_players
         WHERE id = :id
         LIMIT 1'
    );

    $playerStmt->execute([
        ':id' => $playerId,
    ]);

    $player = $playerStmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$player) {
        respond(
            false,
            'Player not found.',
            [],
            404
        );
    }

    try {
        $stmt = $pdo->prepare(
            'SELECT
                id,
                session_id,
                player_id,
                language,
                mode,
                target_words,
                duration_seconds,
                typed_characters,
                correct_characters,
                incorrect_characters,
                raw_wpm,
                correct_wpm,
                accuracy,
                consistency,
                completion,
                score,
                saved_at,
                save_name,
                save_region,
                created_at
             FROM typing_test_results
             WHERE player_id = :player_id
             ORDER BY created_at DESC
             LIMIT ' . $limit
        );

        $stmt->execute([
            ':player_id' => $playerId,
        ]);

        $results = [];

        while (
            $row = $stmt->fetch(
                PDO::FETCH_ASSOC
            )
        ) {
            $results[] =
                normalizeResult($row);
        }

        respond(
            true,
            'Player results loaded.',
            [
                'player' => [
                    'id' =>
                    (int) $player['id'],

                    'display_name' =>
                    $player['display_name'],

                    'region' =>
                    $player['region'],

                    'country_code' =>
                    $player['country_code'],

                    'created_at' =>
                    $player['created_at'],

                    'last_seen_at' =>
                    $player['last_seen_at'],
                ],

                'results' => $results,

                'total' =>
                count($results),
            ]
        );
    } catch (Throwable $e) {
        respond(
            false,
            'Unable to load player results.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| GET RESULT
|--------------------------------------------------------------------------
*/

function actionGetResult(
    PDO $pdo,
    array $data
): void {
    $sessionId = requireString(
        $data,
        'session_id',
        36,
        36
    );

    $result = getResult(
        $pdo,
        $sessionId
    );

    if (!$result) {
        respond(
            false,
            'Typing result not found.',
            [],
            404
        );
    }

    respond(
        true,
        'Typing result loaded.',
        [
            'result' =>
            normalizeResult($result),

            'leaderboard_eligible' =>
            $result['mode'] !== 'custom',
        ]
    );
}

/*
|--------------------------------------------------------------------------
| TEST CONNECTION
|--------------------------------------------------------------------------
*/

function actionTest(
    PDO $pdo
): void {
    try {
        $stmt = $pdo->query(
            'SELECT 1 AS ok'
        );

        $result = $stmt->fetch(
            PDO::FETCH_ASSOC
        );

        respond(
            true,
            'Typing API database connection is working.',
            [
                'database' => true,
                'result' => $result,
            ]
        );
    } catch (Throwable $e) {
        respond(
            false,
            'Database query failed.',
            [
                'error' => $e->getMessage(),
            ],
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| Dispatcher
|--------------------------------------------------------------------------
*/

try {
    if (
        !isset($pdo)
        || !$pdo instanceof PDO
    ) {
        respond(
            false,
            'Database connection is not available.',
            [],
            500
        );
    }

    /*
     * GET parameters + JSON body.
     */
    $data = getRequestData();

    $action = '';

    if (
        isset($_GET['action'])
        && is_string($_GET['action'])
    ) {
        $action = trim(
            $_GET['action']
        );
    }

    if (
        $action === ''
        && isset($data['action'])
        && is_string($data['action'])
    ) {
        $action = trim(
            $data['action']
        );
    }

    switch ($action) {
        case 'test':
            actionTest($pdo);
            break;

        case 'start':
            actionStart(
                $pdo,
                $data
            );
            break;

        case 'finish':
            actionFinish(
                $pdo,
                $data
            );
            break;

        case 'save_progress':
            actionSaveProgress(
                $pdo,
                $data
            );
            break;

        case 'discard_result':
            actionDiscardResult(
                $pdo,
                $data
            );
            break;

        case 'abandon':
            actionAbandon(
                $pdo,
                $data
            );
            break;

        case 'leaderboard':
            actionLeaderboard(
                $pdo,
                $data
            );
            break;

        case 'player_results':
            actionPlayerResults(
                $pdo,
                $data
            );
            break;

        case 'get_result':
            actionGetResult(
                $pdo,
                $data
            );
            break;

        default:
            respond(
                false,
                'Unknown action.',
                [
                    'available_actions' => [
                        'test',
                        'start',
                        'finish',
                        'save_progress',
                        'discard_result',
                        'abandon',
                        'leaderboard',
                        'player_results',
                        'get_result',
                    ],
                ],
                400
            );
    }
} catch (Throwable $e) {
    respond(
        false,
        'Server error.',
        [
            'error' => $e->getMessage(),
        ],
        500
    );
}
