<?php

declare(strict_types=1);

header('X-Xeoo-Reports: active');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (
    $origin === 'http://localhost:5173' ||
    $origin === 'http://127.0.0.1:5173'
) {
    header(
        'Access-Control-Allow-Origin: ' . $origin
    );

    header(
        'Access-Control-Allow-Credentials: true'
    );
}

header(
    'Access-Control-Allow-Methods: GET, POST, OPTIONS'
);

header(
    'Access-Control-Allow-Headers: Content-Type, Accept'
);

header('Vary: Origin');

if (
    ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS'
) {
    http_response_code(204);
    exit;
}

header(
    'Content-Type: application/json; charset=UTF-8'
);

require_once __DIR__ . '/../config/database.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_SECONDS = 30;
const DEFAULT_PER_PAGE = 5;
const MAX_PER_PAGE = 50;

function jsonResponse(
    bool $success,
    string $message,
    int $status = 200,
    array $data = [],
): never {
    http_response_code($status);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ],
        JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES,
    );

    exit;
}

function requireMethod(
    string $method,
): void {
    if (
        strtoupper(
            $_SERVER['REQUEST_METHOD'] ?? ''
        ) !== strtoupper($method)
    ) {
        jsonResponse(
            false,
            'Method tidak diizinkan.',
            405,
        );
    }
}

function requireAdmin(): void
{
    $loggedIn =
        isset($_SESSION['admin_logged_in']) &&
        $_SESSION['admin_logged_in'] === true;

    $role = (string) (
        $_SESSION['admin_role'] ?? ''
    );

    if (
        !$loggedIn ||
        $role !== 'admin'
    ) {
        jsonResponse(
            false,
            'Unauthorized.',
            401,
        );
    }
}

function readJsonBody(): array
{
    $contentLength = (int) (
        $_SERVER['CONTENT_LENGTH'] ?? 0
    );

    if ($contentLength > 15000) {
        jsonResponse(
            false,
            'Payload terlalu besar.',
            413,
        );
    }

    $raw = file_get_contents(
        'php://input',
    );

    if (
        $raw === false ||
        trim($raw) === ''
    ) {
        jsonResponse(
            false,
            'Request body kosong.',
            400,
        );
    }

    $data = json_decode(
        $raw,
        true,
    );

    if (!is_array($data)) {
        jsonResponse(
            false,
            'Format request tidak valid.',
            400,
        );
    }

    return $data;
}

function normalizeInput(
    string $value,
    int $maxLength,
): string {
    $value = preg_replace(
        '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u',
        '',
        $value,
    ) ?? '';

    $value = preg_replace(
        '/[\x{200B}-\x{200D}\x{FEFF}]/u',
        '',
        $value,
    ) ?? '';

    if (
        function_exists('normalizer_normalize')
    ) {
        $normalized = normalizer_normalize(
            $value,
            Normalizer::FORM_KC,
        );

        if ($normalized !== false) {
            $value = $normalized;
        }
    }

    return mb_substr(
        trim($value),
        0,
        $maxLength,
    );
}

function decodeForInspection(
    string $value,
): string {
    return html_entity_decode(
        $value,
        ENT_QUOTES | ENT_HTML5,
        'UTF-8',
    );
}

function containsSuspiciousInput(
    string $value,
): bool {
    $normalized = normalizeInput(
        $value,
        MAX_MESSAGE_LENGTH,
    );

    $decoded = decodeForInspection(
        $normalized,
    );

    $patterns = [
        '/<\s*script\b/i',
        '/<\s*\/\s*script\s*>/i',
        '/<\s*(iframe|object|embed|svg|img|style|link|meta|form|input)\b/i',
        '/\bon[a-z]+\s*=/i',
        '/\bjavascript\s*:/i',
        '/\bvbscript\s*:/i',
        '/\bdata\s*:\s*text\/html/i',
        '/\bdata\s*:\s*text\/javascript/i',
        '/document\.(cookie|location|write)/i',
        '/window\.(location|open)/i',
        '/<\s*\/?\s*[a-z][^>]*>/i',
    ];

    foreach ($patterns as $pattern) {
        if (
            preg_match(
                $pattern,
                $normalized,
            ) ||
            preg_match(
                $pattern,
                $decoded,
            )
        ) {
            return true;
        }
    }

    return false;
}

function getClientIp(): string
{
    $ip =
        $_SERVER['REMOTE_ADDR'] ??
        'unknown';

    if (
        filter_var(
            $ip,
            FILTER_VALIDATE_IP,
        ) === false
    ) {
        return 'unknown';
    }

    return $ip;
}

function rateLimitExceeded(
    string $ip,
): bool {
    $safeIp = hash(
        'sha256',
        $ip,
    );

    $file =
        sys_get_temp_dir() .
        DIRECTORY_SEPARATOR .
        'xeootools_report_' .
        $safeIp;

    $now = time();

    if (is_file($file)) {
        $last = (int) @file_get_contents(
            $file,
        );

        if (
            $last > 0 &&
            ($now - $last) <
            RATE_LIMIT_SECONDS
        ) {
            return true;
        }
    }

    @file_put_contents(
        $file,
        (string) $now,
        LOCK_EX,
    );

    return false;
}

function logSuspiciousReport(
    string $ip,
    string $type,
    ?int $toolId,
    string $message,
): void {
    error_log(
        sprintf(
            '[XeooTools REPORT SECURITY] ip=%s type=%s tool_id=%s message_sha256=%s',
            $ip,
            $type,
            $toolId !== null
                ? (string) $toolId
                : 'null',
            hash('sha256', $message),
        ),
    );
}

function validateReportType(
    string $type,
): bool {
    return in_array(
        $type,
        [
            'bug',
            'tool',
            'ui',
            'other',
        ],
        true,
    );
}

function fetchToolForReport(
    PDO $pdo,
    int $toolId,
): array {
    $statement = $pdo->prepare(
        '
        SELECT
            id,
            name,
            slug,
            status
        FROM tools
        WHERE id = :id
        LIMIT 1
        ',
    );

    $statement->execute([
        ':id' => $toolId,
    ]);

    $tool = $statement->fetch(
        PDO::FETCH_ASSOC,
    );

    if (!$tool) {
        jsonResponse(
            false,
            'Tool yang dipilih tidak ditemukan.',
            422,
        );
    }

    return $tool;
}

function createReport(
    PDO $pdo,
    array $data,
): never {
    $ip = getClientIp();

    if (rateLimitExceeded($ip)) {
        jsonResponse(
            false,
            'Terlalu banyak report dalam waktu singkat. Coba lagi sebentar.',
            429,
        );
    }

    $type = normalizeInput(
        (string) (
            $data['type'] ?? ''
        ),
        20,
    );

    $toolIdRaw =
        $data['tool_id'] ?? null;

    $message = normalizeInput(
        (string) (
            $data['message'] ?? ''
        ),
        MAX_MESSAGE_LENGTH,
    );

    if (!validateReportType($type)) {
        jsonResponse(
            false,
            'Tipe report tidak valid.',
            422,
        );
    }

    if (!is_numeric($toolIdRaw)) {
        jsonResponse(
            false,
            'Tool wajib dipilih.',
            422,
        );
    }

    $toolId = (int) $toolIdRaw;

    if ($toolId <= 0) {
        jsonResponse(
            false,
            'Tool wajib dipilih.',
            422,
        );
    }

    if (mb_strlen($message) < 10) {
        jsonResponse(
            false,
            'Deskripsi report minimal 10 karakter.',
            422,
        );
    }

    if (containsSuspiciousInput($message)) {
        logSuspiciousReport(
            $ip,
            $type,
            $toolId,
            $message,
        );

        jsonResponse(
            false,
            'Nice try 😌. Kotak report ini bukan terminal JavaScript. Payload mencurigakan ditolak.',
            400,
            [
                'suspicious' => true,
            ],
        );
    }

    $tool = fetchToolForReport(
        $pdo,
        $toolId,
    );

    $insert = $pdo->prepare(
        '
        INSERT INTO reports (
            type,
            tool_id,
            tool_name,
            message,
            status
        ) VALUES (
            :type,
            :tool_id,
            :tool_name,
            :message,
            "waiting"
        )
        ',
    );

    $insert->execute([
        ':type' => $type,
        ':tool_id' => $toolId,
        ':tool_name' =>
        (string) $tool['name'],
        ':message' => $message,
    ]);

    $reportId =
        (int) $pdo->lastInsertId();

    $select = $pdo->prepare(
        '
        SELECT
            r.id,
            r.type,
            r.tool_id,
            r.tool_name,
            c.name AS category_name,
            c.slug AS category_slug,
            r.message,
            r.status,
            r.created_at,
            r.updated_at
        FROM reports r
        LEFT JOIN tools t
            ON t.id = r.tool_id
        LEFT JOIN categories c
            ON c.id = t.category_id
        WHERE r.id = :id
        LIMIT 1
        ',
    );

    $select->execute([
        ':id' => $reportId,
    ]);

    $report = $select->fetch(
        PDO::FETCH_ASSOC,
    );

    jsonResponse(
        true,
        'Laporan berhasil dikirim.',
        201,
        [
            'report' => $report,
        ],
    );
}

function listReports(PDO $pdo): never
{
    requireAdmin();

    $page = max(
        1,
        (int) (
            $_GET['page'] ?? 1
        ),
    );

    $perPage = (int) (
        $_GET['per_page'] ??
        DEFAULT_PER_PAGE
    );

    $perPage = max(
        1,
        min(
            MAX_PER_PAGE,
            $perPage,
        ),
    );

    $search = normalizeInput(
        (string) (
            $_GET['search'] ?? ''
        ),
        100,
    );

    $type = normalizeInput(
        (string) (
            $_GET['type'] ?? ''
        ),
        20,
    );

    $status = normalizeInput(
        (string) (
            $_GET['status'] ?? ''
        ),
        20,
    );

    if (
        $type !== '' &&
        !validateReportType($type)
    ) {
        jsonResponse(
            false,
            'Filter tipe report tidak valid.',
            422,
        );
    }

    if (
        $status !== '' &&
        !in_array(
            $status,
            [
                'waiting',
                'fix',
            ],
            true,
        )
    ) {
        jsonResponse(
            false,
            'Filter status report tidak valid.',
            422,
        );
    }

    $where = [];
    $params = [];

    if ($search !== '') {
        $where[] = '
            (
                r.tool_name LIKE :search_tool_name
                OR r.message LIKE :search_message
            )
        ';

        $searchValue =
            '%' .
            $search .
            '%';

        $params[':search_tool_name'] =
            $searchValue;

        $params[':search_message'] =
            $searchValue;
    }

    if ($type !== '') {
        $where[] =
            'r.type = :filter_type';

        $params[':filter_type'] =
            $type;
    }

    if ($status !== '') {
        $where[] =
            'r.status = :filter_status';

        $params[':filter_status'] =
            $status;
    }

    $whereSql = '';

    if ($where) {
        $whereSql =
            ' WHERE ' .
            implode(
                ' AND ',
                $where,
            );
    }

    $countStatement = $pdo->prepare(
        "
        SELECT COUNT(*)
        FROM reports r
        {$whereSql}
        ",
    );

    foreach (
        $params as $key => $value
    ) {
        $countStatement->bindValue(
            $key,
            $value,
            PDO::PARAM_STR,
        );
    }

    $countStatement->execute();

    $total = (int) (
        $countStatement->fetchColumn()
    );

    $totalPages = max(
        1,
        (int) ceil(
            $total / $perPage,
        ),
    );

    if ($page > $totalPages) {
        $page = $totalPages;
    }

    $offset =
        ($page - 1) *
        $perPage;

    $dataStatement = $pdo->prepare(
        "
        SELECT
            r.id,
            r.type,
            r.tool_id,
            r.tool_name,
            c.name AS category_name,
            c.slug AS category_slug,
            r.message,
            r.status,
            r.created_at,
            r.updated_at
        FROM reports r
        LEFT JOIN tools t
            ON t.id = r.tool_id
        LEFT JOIN categories c
            ON c.id = t.category_id
        {$whereSql}
        ORDER BY
            r.created_at DESC,
            r.id DESC
        LIMIT :limit
        OFFSET :offset
        ",
    );

    foreach (
        $params as $key => $value
    ) {
        $dataStatement->bindValue(
            $key,
            $value,
            PDO::PARAM_STR,
        );
    }

    $dataStatement->bindValue(
        ':limit',
        $perPage,
        PDO::PARAM_INT,
    );

    $dataStatement->bindValue(
        ':offset',
        $offset,
        PDO::PARAM_INT,
    );

    $dataStatement->execute();

    $reports =
        $dataStatement->fetchAll(
            PDO::FETCH_ASSOC,
        );

    foreach (
        $reports as &$report
    ) {
        $report['id'] =
            (int) $report['id'];

        $report['tool_id'] =
            $report['tool_id'] !== null
            ? (int) $report['tool_id']
            : null;

        $report['tool_name'] =
            (string) $report['tool_name'];

        $report['category_name'] =
            $report['category_name'] !== null
            ? (string) $report['category_name']
            : null;

        $report['category_slug'] =
            $report['category_slug'] !== null
            ? (string) $report['category_slug']
            : null;

        $report['message'] =
            (string) $report['message'];

        $report['type'] =
            (string) $report['type'];

        $report['status'] =
            (string) $report['status'];

        $report['created_at'] =
            (string) $report['created_at'];

        $report['updated_at'] =
            $report['updated_at'] !== null
            ? (string) $report['updated_at']
            : null;
    }

    unset($report);

    $summaryStatement =
        $pdo->query(
            '
            SELECT
                COUNT(*) AS total,
                COALESCE(
                    SUM(
                        status = "waiting"
                    ),
                    0
                ) AS waiting,
                COALESCE(
                    SUM(
                        status = "fix"
                    ),
                    0
                ) AS fix
            FROM reports
            ',
        );

    $summary =
        $summaryStatement->fetch(
            PDO::FETCH_ASSOC,
        ) ?: [
            'total' => 0,
            'waiting' => 0,
            'fix' => 0,
        ];

    jsonResponse(
        true,
        'Data report berhasil diambil.',
        200,
        [
            'reports' => $reports,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' =>
                $totalPages,
            ],
            'summary' => [
                'total' =>
                (int) (
                    $summary['total'] ?? 0
                ),
                'waiting' =>
                (int) (
                    $summary['waiting'] ?? 0
                ),
                'fix' =>
                (int) (
                    $summary['fix'] ?? 0
                ),
            ],
        ],
    );
}

function updateReportStatus(
    PDO $pdo,
    array $data,
): never {
    requireAdmin();

    $id = (int) (
        $data['id'] ?? 0
    );

    $status = normalizeInput(
        (string) (
            $data['status'] ?? ''
        ),
        20,
    );

    if ($id <= 0) {
        jsonResponse(
            false,
            'ID report tidak valid.',
            422,
        );
    }

    if (
        !in_array(
            $status,
            [
                'waiting',
                'fix',
            ],
            true,
        )
    ) {
        jsonResponse(
            false,
            'Status report tidak valid.',
            422,
        );
    }

    $check = $pdo->prepare(
        '
        SELECT id
        FROM reports
        WHERE id = :id
        LIMIT 1
        ',
    );

    $check->execute([
        ':id' => $id,
    ]);

    if (!$check->fetchColumn()) {
        jsonResponse(
            false,
            'Report tidak ditemukan.',
            404,
        );
    }

    $update = $pdo->prepare(
        '
        UPDATE reports
        SET
            status = :status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
        ',
    );

    $update->execute([
        ':status' => $status,
        ':id' => $id,
    ]);

    $select = $pdo->prepare(
        '
        SELECT
            r.id,
            r.type,
            r.tool_id,
            r.tool_name,
            c.name AS category_name,
            c.slug AS category_slug,
            r.message,
            r.status,
            r.created_at,
            r.updated_at
        FROM reports r
        LEFT JOIN tools t
            ON t.id = r.tool_id
        LEFT JOIN categories c
            ON c.id = t.category_id
        WHERE r.id = :id
        LIMIT 1
        ',
    );

    $select->execute([
        ':id' => $id,
    ]);

    $report = $select->fetch(
        PDO::FETCH_ASSOC,
    );

    jsonResponse(
        true,
        'Status report berhasil diperbarui.',
        200,
        [
            'report' => $report,
        ],
    );
}

try {
    $method =
        strtoupper(
            $_SERVER['REQUEST_METHOD'] ?? ''
        );

    if ($method === 'GET') {
        $action =
            (string) (
                $_GET['action'] ?? 'list'
            );

        if ($action === 'list') {
            listReports($pdo);
        }

        jsonResponse(
            false,
            'Action tidak ditemukan.',
            404,
        );
    }

    requireMethod('POST');

    $data = readJsonBody();

    $action =
        isset($data['action'])
        ? (string) $data['action']
        : 'create';

    if ($action === 'create') {
        createReport(
            $pdo,
            $data,
        );
    }

    if ($action === 'update_status') {
        updateReportStatus(
            $pdo,
            $data,
        );
    }

    jsonResponse(
        false,
        'Action tidak ditemukan.',
        404,
    );
} catch (PDOException $error) {
    error_log(
        '[XeooTools REPORT DB ERROR] ' .
            $error->getMessage(),
    );

    jsonResponse(
        false,
        'Terjadi kesalahan database.',
        500,
    );
} catch (Throwable $error) {
    error_log(
        '[XeooTools REPORT ERROR] ' .
            $error->getMessage(),
    );

    jsonResponse(
        false,
        'Terjadi kesalahan pada server.',
        500,
    );
}
