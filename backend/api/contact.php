<?php

declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://5nc6c83n-5173.asse.devtunnels.ms',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

function jsonResponse(
    bool $success,
    string $message = '',
    mixed $data = null,
    int $statusCode = 200,
): never {
    http_response_code($statusCode);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
    );

    exit;
}

function requireAdmin(): void
{
    if (
        ($_SESSION['admin_logged_in'] ?? false) !== true ||
        ($_SESSION['admin_role'] ?? '') !== 'admin'
    ) {
        jsonResponse(false, 'Unauthorized.', null, 401);
    }
}

function validateContactType(string $type): string
{
    $allowed = [
        'tool_suggestion',
        'partnership',
        'faq',
        'feedback',
        'criticism_suggestion',
    ];

    if (!in_array($type, $allowed, true)) {
        jsonResponse(
            false,
            'Jenis pesan tidak valid.',
            null,
            422,
        );
    }

    return $type;
}

function validateContactStatus(string $status): string
{
    $allowed = [
        'unread',
        'read',
        'replied',
    ];

    if (!in_array($status, $allowed, true)) {
        jsonResponse(
            false,
            'Status pesan tidak valid.',
            null,
            422,
        );
    }

    return $status;
}

function normalizeContactRow(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'type' => (string) $row['type'],
        'name' => $row['name'] !== null
            ? (string) $row['name']
            : null,
        'email' => $row['email'] !== null
            ? (string) $row['email']
            : null,
        'message' => (string) $row['message'],
        'status' => (string) $row['status'],
        'created_at' => (string) $row['created_at'],
        'updated_at' => $row['updated_at'] !== null
            ? (string) $row['updated_at']
            : null,
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $action = trim(
        (string) ($_POST['action'] ?? ''),
    );

    if ($action === 'create') {
        $type = trim(
            (string) ($_POST['type'] ?? ''),
        );

        $name = trim(
            (string) ($_POST['name'] ?? ''),
        );

        $email = trim(
            (string) ($_POST['email'] ?? ''),
        );

        $message = trim(
            (string) ($_POST['message'] ?? ''),
        );

        if ($type === '') {
            jsonResponse(
                false,
                'Jenis pesan wajib dipilih.',
                null,
                422,
            );
        }

        $type = validateContactType($type);

        if ($name === '') {
            jsonResponse(
                false,
                'Nama wajib diisi.',
                null,
                422,
            );
        }

        if (mb_strlen($name) > 100) {
            jsonResponse(
                false,
                'Nama terlalu panjang.',
                null,
                422,
            );
        }

        if ($email === '') {
            jsonResponse(
                false,
                'Email wajib diisi.',
                null,
                422,
            );
        }

        if (
            !filter_var(
                $email,
                FILTER_VALIDATE_EMAIL,
            )
        ) {
            jsonResponse(
                false,
                'Format email tidak valid.',
                null,
                422,
            );
        }

        if (mb_strlen($email) > 190) {
            jsonResponse(
                false,
                'Email terlalu panjang.',
                null,
                422,
            );
        }

        if ($message === '') {
            jsonResponse(
                false,
                'Pesan wajib diisi.',
                null,
                422,
            );
        }

        if (mb_strlen($message) < 5) {
            jsonResponse(
                false,
                'Pesan terlalu singkat.',
                null,
                422,
            );
        }

        if (mb_strlen($message) > 5000) {
            jsonResponse(
                false,
                'Pesan terlalu panjang.',
                null,
                422,
            );
        }

        try {
            $stmt = $pdo->prepare(
                'INSERT INTO contact_messages (
                    type,
                    name,
                    email,
                    message,
                    status
                )
                VALUES (
                    :type,
                    :name,
                    :email,
                    :message,
                    :status
                )',
            );

            $stmt->execute([
                'type' => $type,
                'name' => $name,
                'email' => $email,
                'message' => $message,
                'status' => 'unread',
            ]);

            $id = (int) $pdo->lastInsertId();

            $stmt = $pdo->prepare(
                'SELECT
                    id,
                    type,
                    name,
                    email,
                    message,
                    status,
                    created_at,
                    updated_at
                 FROM contact_messages
                 WHERE id = :id
                 LIMIT 1',
            );

            $stmt->execute([
                'id' => $id,
            ]);

            $row = $stmt->fetch(
                PDO::FETCH_ASSOC,
            );

            if (!$row) {
                jsonResponse(
                    true,
                    'Pesan berhasil dikirim.',
                    null,
                    201,
                );
            }

            jsonResponse(
                true,
                'Pesan berhasil dikirim.',
                normalizeContactRow($row),
                201,
            );
        } catch (Throwable $e) {
            error_log(
                'contact.php create error: ' .
                $e->getMessage(),
            );

            jsonResponse(
                false,
                'Pesan tidak dapat disimpan.',
                null,
                500,
            );
        }
    }

    if ($action === 'update_status') {
        requireAdmin();

        $id = (int) (
            $_POST['id'] ?? 0
        );

        $status = trim(
            (string) (
                $_POST['status'] ?? ''
            ),
        );

        if ($id <= 0) {
            jsonResponse(
                false,
                'ID pesan tidak valid.',
                null,
                422,
            );
        }

        $status = validateContactStatus(
            $status,
        );

        try {
            $check = $pdo->prepare(
                'SELECT id
                 FROM contact_messages
                 WHERE id = :id
                 LIMIT 1',
            );

            $check->execute([
                'id' => $id,
            ]);

            if (!$check->fetchColumn()) {
                jsonResponse(
                    false,
                    'Pesan tidak ditemukan.',
                    null,
                    404,
                );
            }

            $stmt = $pdo->prepare(
                'UPDATE contact_messages
                 SET status = :status
                 WHERE id = :id
                 LIMIT 1',
            );

            $stmt->execute([
                'status' => $status,
                'id' => $id,
            ]);

            $stmt = $pdo->prepare(
                'SELECT
                    id,
                    type,
                    name,
                    email,
                    message,
                    status,
                    created_at,
                    updated_at
                 FROM contact_messages
                 WHERE id = :id
                 LIMIT 1',
            );

            $stmt->execute([
                'id' => $id,
            ]);

            $row = $stmt->fetch(
                PDO::FETCH_ASSOC,
            );

            jsonResponse(
                true,
                'Status pesan berhasil diperbarui.',
                $row
                    ? normalizeContactRow($row)
                    : null,
            );
        } catch (Throwable $e) {
            error_log(
                'contact.php update_status error: ' .
                $e->getMessage(),
            );

            jsonResponse(
                false,
                'Status pesan tidak dapat diperbarui.',
                null,
                500,
            );
        }
    }

    if ($action === 'delete') {
        requireAdmin();

        $id = (int) (
            $_POST['id'] ?? 0
        );

        if ($id <= 0) {
            jsonResponse(
                false,
                'ID pesan tidak valid.',
                null,
                422,
            );
        }

        try {
            $stmt = $pdo->prepare(
                'DELETE FROM contact_messages
                 WHERE id = :id
                 LIMIT 1',
            );

            $stmt->execute([
                'id' => $id,
            ]);

            if (
                $stmt->rowCount() === 0
            ) {
                jsonResponse(
                    false,
                    'Pesan tidak ditemukan.',
                    null,
                    404,
                );
            }

            jsonResponse(
                true,
                'Pesan berhasil dihapus.',
                null,
            );
        } catch (Throwable $e) {
            error_log(
                'contact.php delete error: ' .
                $e->getMessage(),
            );

            jsonResponse(
                false,
                'Pesan tidak dapat dihapus.',
                null,
                500,
            );
        }
    }

    jsonResponse(
        false,
        'Action tidak valid.',
        null,
        400,
    );
}

if ($method === 'GET') {
    requireAdmin();

    $page = max(
        1,
        (int) (
            $_GET['page'] ?? 1
        ),
    );

    $perPage = (int) (
        $_GET['per_page'] ?? 8
    );

    if ($perPage < 1) {
        $perPage = 8;
    }

    if ($perPage > 50) {
        $perPage = 50;
    }

    $search = trim(
        (string) (
            $_GET['search'] ?? ''
        ),
    );

    $type = trim(
        (string) (
            $_GET['type'] ?? ''
        ),
    );

    $status = trim(
        (string) (
            $_GET['status'] ?? ''
        ),
    );

    $where = [];
    $params = [];

    if ($search !== '') {
        $where[] = '
            (
                cm.name LIKE :search_name
                OR cm.email LIKE :search_email
                OR cm.message LIKE :search_message
            )
        ';

        $searchValue =
            '%' . $search . '%';

        $params[
            ':search_name'
        ] = $searchValue;

        $params[
            ':search_email'
        ] = $searchValue;

        $params[
            ':search_message'
        ] = $searchValue;
    }

    if ($type !== '') {
        $type = validateContactType(
            $type,
        );

        $where[] =
            'cm.type = :filter_type';

        $params[
            ':filter_type'
        ] = $type;
    }

    if ($status !== '') {
        $status = validateContactStatus(
            $status,
        );

        $where[] =
            'cm.status = :filter_status';

        $params[
            ':filter_status'
        ] = $status;
    }

    $whereSql = '';

    if ($where) {
        $whereSql =
            'WHERE ' .
            implode(
                ' AND ',
                $where,
            );
    }

    $offset =
        ($page - 1) *
        $perPage;

    try {
        $countSql = "
            SELECT COUNT(*)
            FROM contact_messages cm
            {$whereSql}
        ";

        $countStmt =
            $pdo->prepare(
                $countSql,
            );

        foreach (
            $params as $key => $value
        ) {
            $countStmt->bindValue(
                $key,
                $value,
                PDO::PARAM_STR,
            );
        }

        $countStmt->execute();

        $total =
            (int) $countStmt->fetchColumn();

        $totalPages =
            max(
                1,
                (int) ceil(
                    $total /
                    $perPage,
                ),
            );

        if ($page > $totalPages) {
            $page = $totalPages;

            $offset =
                ($page - 1) *
                $perPage;
        }

        $dataSql = "
            SELECT
                cm.id,
                cm.type,
                cm.name,
                cm.email,
                cm.message,
                cm.status,
                cm.created_at,
                cm.updated_at
            FROM contact_messages cm
            {$whereSql}
            ORDER BY cm.created_at DESC, cm.id DESC
            LIMIT :limit
            OFFSET :offset
        ";

        $stmt =
            $pdo->prepare(
                $dataSql,
            );

        foreach (
            $params as $key => $value
        ) {
            $stmt->bindValue(
                $key,
                $value,
                PDO::PARAM_STR,
            );
        }

        $stmt->bindValue(
            ':limit',
            $perPage,
            PDO::PARAM_INT,
        );

        $stmt->bindValue(
            ':offset',
            $offset,
            PDO::PARAM_INT,
        );

        $stmt->execute();

        $rows =
            $stmt->fetchAll(
                PDO::FETCH_ASSOC,
            );

        $messages =
            array_map(
                'normalizeContactRow',
                $rows,
            );

        $summaryStmt =
            $pdo->query(
                'SELECT
                    COUNT(*) AS total,
                    SUM(
                        CASE
                            WHEN status = "unread"
                            THEN 1
                            ELSE 0
                        END
                    ) AS unread,
                    SUM(
                        CASE
                            WHEN status = "read"
                            THEN 1
                            ELSE 0
                        END
                    ) AS `read`,
                    SUM(
                        CASE
                            WHEN status = "replied"
                            THEN 1
                            ELSE 0
                        END
                    ) AS replied
                 FROM contact_messages',
            );

        $summaryRow =
            $summaryStmt->fetch(
                PDO::FETCH_ASSOC,
            ) ?: [];

        jsonResponse(
            true,
            'Pesan contact berhasil diambil.',
            [
                'messages' =>
                    $messages,

                'pagination' => [
                    'page' => $page,
                    'per_page' =>
                        $perPage,
                    'total' =>
                        $total,
                    'total_pages' =>
                        $totalPages,
                ],

                'summary' => [
                    'total' =>
                        (int) (
                            $summaryRow[
                                'total'
                            ] ?? 0
                        ),
                    'unread' =>
                        (int) (
                            $summaryRow[
                                'unread'
                            ] ?? 0
                        ),
                    'read' =>
                        (int) (
                            $summaryRow[
                                'read'
                            ] ?? 0
                        ),
                    'replied' =>
                        (int) (
                            $summaryRow[
                                'replied'
                            ] ?? 0
                        ),
                ],
            ],
        );
    } catch (Throwable $e) {
        error_log(
            'contact.php GET error: ' .
            $e->getMessage(),
        );

        jsonResponse(
            false,
            'Gagal mengambil pesan contact.',
            null,
            500,
        );
    }
}

jsonResponse(
    false,
    'Method not allowed.',
    null,
    405,
);