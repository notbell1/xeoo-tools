<?php

declare(strict_types=1);

session_start();

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://5nc6c83n-5173.asse.devtunnels.ms',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cache-Control, Accept');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

function jsonResponse(
    bool $success,
    string $message = '',
    mixed $data = null,
    int $statusCode = 200
): never {
    http_response_code($statusCode);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function requireAdmin(): void
{
    if (
        empty($_SESSION['admin_logged_in']) ||
        $_SESSION['admin_logged_in'] !== true ||
        empty($_SESSION['admin_role']) ||
        $_SESSION['admin_role'] !== 'admin'
    ) {
        jsonResponse(
            false,
            'Unauthorized.',
            null,
            401
        );
    }
}

function normalizeSlug(string $value): string
{
    $value = strtolower(trim($value));

    $value = preg_replace(
        '/[^a-z0-9\s-]/',
        '',
        $value
    );

    $value = preg_replace(
        '/\s+/',
        '-',
        (string) $value
    );

    $value = preg_replace(
        '/-+/',
        '-',
        (string) $value
    );

    return trim(
        (string) $value,
        '-'
    );
}

/*
|--------------------------------------------------------------------------
| Ambil kolom tabel categories
|--------------------------------------------------------------------------
*/

function getCategoryColumns(): array
{
    global $pdo;

    $stmt = $pdo->query(
        'SHOW COLUMNS FROM categories'
    );

    $rows = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    $columns = [];

    foreach ($rows as $row) {
        if (!empty($row['Field'])) {
            $columns[] = (string) $row['Field'];
        }
    }

    return $columns;
}

try {
    $categoryColumns = getCategoryColumns();
} catch (Throwable $exception) {
    error_log(
        'Categories schema error: ' .
            $exception->getMessage()
    );

    jsonResponse(
        false,
        'Tabel categories tidak dapat dibaca: ' .
            $exception->getMessage(),
        null,
        500
    );
}

if (
    !in_array('id', $categoryColumns, true) ||
    !in_array('name', $categoryColumns, true) ||
    !in_array('slug', $categoryColumns, true)
) {
    jsonResponse(
        false,
        'Tabel categories harus memiliki kolom id, name, dan slug.',
        null,
        500
    );
}

$hasDescription = in_array(
    'description',
    $categoryColumns,
    true
);

$hasIcon = in_array(
    'icon',
    $categoryColumns,
    true
);

$hasColor = in_array(
    'color',
    $categoryColumns,
    true
);

$method = $_SERVER['REQUEST_METHOD'];

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

if ($method === 'GET') {
    try {
        $selectFields = [
            'c.id',
            'c.name',
            'c.slug',
        ];

        if ($hasDescription) {
            $selectFields[] = 'c.description';
        }

        if ($hasIcon) {
            $selectFields[] = 'c.icon';
        }

        if ($hasColor) {
            $selectFields[] = 'c.color';
        }

        $selectFields[] = '
            (
                SELECT COUNT(*)
                FROM tools t
                WHERE t.category_id = c.id
            ) AS tool_count
        ';

        $sql = '
            SELECT
                ' . implode(",\n                ", $selectFields) . '
            FROM categories c
            ORDER BY c.id ASC
        ';

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        $rows = $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );

        $categories = array_map(
            static function (array $row) use (
                $hasDescription,
                $hasIcon,
                $hasColor
            ): array {
                return [
                    'id' => (int) $row['id'],
                    'name' => (string) $row['name'],
                    'slug' => (string) $row['slug'],
                    'description' =>
                    $hasDescription
                        ? (string) (
                            $row['description'] ?? ''
                        )
                        : '',
                    'icon' =>
                    $hasIcon
                        ? (string) (
                            $row['icon'] ?? 'wrench'
                        )
                        : 'wrench',
                    'color' =>
                    $hasColor
                        ? (string) (
                            $row['color'] ?? 'blue'
                        )
                        : 'blue',
                    'tool_count' =>
                    (int) (
                        $row['tool_count'] ?? 0
                    ),
                ];
            },
            $rows
        );

        jsonResponse(
            true,
            'Kategori berhasil dimuat.',
            $categories
        );
    } catch (Throwable $exception) {
        error_log(
            'Categories GET error: ' .
                $exception->getMessage()
        );

        jsonResponse(
            false,
            'Gagal mengambil data kategori: ' .
                $exception->getMessage(),
            null,
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

if ($method === 'POST') {
    requireAdmin();

    $action = trim(
        (string) ($_POST['action'] ?? '')
    );

    if (
        !in_array(
            $action,
            ['create', 'update', 'delete'],
            true
        )
    ) {
        jsonResponse(
            false,
            'Action tidak valid.',
            null,
            400
        );
    }

    try {
        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        if ($action === 'create') {
            $name = trim(
                (string) (
                    $_POST['name'] ?? ''
                )
            );

            $slugInput = trim(
                (string) (
                    $_POST['slug'] ?? ''
                )
            );

            $slug = normalizeSlug(
                $slugInput !== ''
                    ? $slugInput
                    : $name
            );

            $description = trim(
                (string) (
                    $_POST['description'] ?? ''
                )
            );

            $icon = trim(
                (string) (
                    $_POST['icon'] ?? 'wrench'
                )
            );

            $color = trim(
                (string) (
                    $_POST['color'] ?? 'blue'
                )
            );

            if ($name === '') {
                jsonResponse(
                    false,
                    'Nama kategori wajib diisi.',
                    null,
                    422
                );
            }

            if ($slug === '') {
                jsonResponse(
                    false,
                    'Slug kategori tidak valid.',
                    null,
                    422
                );
            }

            $checkStmt = $pdo->prepare(
                '
                SELECT id
                FROM categories
                WHERE slug = :slug
                LIMIT 1
                '
            );

            $checkStmt->execute([
                ':slug' => $slug,
            ]);

            $existing = $checkStmt->fetch(
                PDO::FETCH_ASSOC
            );

            if ($existing) {
                jsonResponse(
                    false,
                    'Slug kategori sudah digunakan.',
                    null,
                    409
                );
            }

            /*
             * Bangun INSERT hanya berdasarkan kolom
             * yang memang tersedia di tabel.
             */

            $fields = [
                'name',
                'slug',
            ];

            $values = [
                ':name',
                ':slug',
            ];

            $params = [
                ':name' => $name,
                ':slug' => $slug,
            ];

            if ($hasDescription) {
                $fields[] = 'description';
                $values[] = ':description';
                $params[':description'] = $description;
            }

            if ($hasIcon) {
                $fields[] = 'icon';
                $values[] = ':icon';
                $params[':icon'] = $icon;
            }

            if ($hasColor) {
                $fields[] = 'color';
                $values[] = ':color';
                $params[':color'] = $color;
            }

            $insertStmt = $pdo->prepare(
                '
                INSERT INTO categories
                    (' . implode(', ', $fields) . ')
                VALUES
                    (' . implode(', ', $values) . ')
                '
            );

            $insertStmt->execute($params);

            $categoryId = (int) $pdo->lastInsertId();

            jsonResponse(
                true,
                'Kategori berhasil ditambahkan.',
                [
                    'id' => $categoryId,
                    'name' => $name,
                    'slug' => $slug,
                    'description' =>
                    $hasDescription
                        ? $description
                        : '',
                    'icon' =>
                    $hasIcon
                        ? $icon
                        : 'wrench',
                    'color' =>
                    $hasColor
                        ? $color
                        : 'blue',
                    'tool_count' => 0,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        if ($action === 'update') {
            $categoryId = filter_input(
                INPUT_POST,
                'category_id',
                FILTER_VALIDATE_INT
            );

            if (!$categoryId) {
                jsonResponse(
                    false,
                    'Category ID tidak valid.',
                    null,
                    422
                );
            }

            $name = trim(
                (string) (
                    $_POST['name'] ?? ''
                )
            );

            $slugInput = trim(
                (string) (
                    $_POST['slug'] ?? ''
                )
            );

            $slug = normalizeSlug(
                $slugInput !== ''
                    ? $slugInput
                    : $name
            );

            $description = trim(
                (string) (
                    $_POST['description'] ?? ''
                )
            );

            $icon = trim(
                (string) (
                    $_POST['icon'] ?? 'wrench'
                )
            );

            $color = trim(
                (string) (
                    $_POST['color'] ?? 'blue'
                )
            );

            if ($name === '') {
                jsonResponse(
                    false,
                    'Nama kategori wajib diisi.',
                    null,
                    422
                );
            }

            if ($slug === '') {
                jsonResponse(
                    false,
                    'Slug kategori tidak valid.',
                    null,
                    422
                );
            }

            $findStmt = $pdo->prepare(
                '
                SELECT
                    id,
                    name,
                    slug
                FROM categories
                WHERE id = :id
                LIMIT 1
                '
            );

            $findStmt->execute([
                ':id' => $categoryId,
            ]);

            $category = $findStmt->fetch(
                PDO::FETCH_ASSOC
            );

            if (!$category) {
                jsonResponse(
                    false,
                    'Kategori tidak ditemukan.',
                    null,
                    404
                );
            }

            $duplicateStmt = $pdo->prepare(
                '
                SELECT id
                FROM categories
                WHERE slug = :slug
                AND id != :id
                LIMIT 1
                '
            );

            $duplicateStmt->execute([
                ':slug' => $slug,
                ':id' => $categoryId,
            ]);

            $duplicate = $duplicateStmt->fetch(
                PDO::FETCH_ASSOC
            );

            if ($duplicate) {
                jsonResponse(
                    false,
                    'Slug kategori sudah digunakan.',
                    null,
                    409
                );
            }

            $setParts = [
                'name = :name',
                'slug = :slug',
            ];

            $params = [
                ':name' => $name,
                ':slug' => $slug,
                ':id' => $categoryId,
            ];

            if ($hasDescription) {
                $setParts[] =
                    'description = :description';

                $params[':description'] =
                    $description;
            }

            if ($hasIcon) {
                $setParts[] = 'icon = :icon';
                $params[':icon'] = $icon;
            }

            if ($hasColor) {
                $setParts[] = 'color = :color';
                $params[':color'] = $color;
            }

            $updateStmt = $pdo->prepare(
                '
                UPDATE categories
                SET
                    ' . implode(",\n                    ", $setParts) . '
                WHERE id = :id
                '
            );

            $updateStmt->execute($params);

            $countStmt = $pdo->prepare(
                '
                SELECT COUNT(*) AS tool_count
                FROM tools
                WHERE category_id = :category_id
                '
            );

            $countStmt->execute([
                ':category_id' => $categoryId,
            ]);

            $countRow = $countStmt->fetch(
                PDO::FETCH_ASSOC
            );

            jsonResponse(
                true,
                'Kategori berhasil diperbarui.',
                [
                    'id' => (int) $categoryId,
                    'name' => $name,
                    'slug' => $slug,
                    'description' =>
                    $hasDescription
                        ? $description
                        : '',
                    'icon' =>
                    $hasIcon
                        ? $icon
                        : 'wrench',
                    'color' =>
                    $hasColor
                        ? $color
                        : 'blue',
                    'tool_count' =>
                    (int) (
                        $countRow['tool_count'] ?? 0
                    ),
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */

        if ($action === 'delete') {
            $categoryId = filter_input(
                INPUT_POST,
                'category_id',
                FILTER_VALIDATE_INT
            );

            if (!$categoryId) {
                jsonResponse(
                    false,
                    'Category ID tidak valid.',
                    null,
                    422
                );
            }

            $findStmt = $pdo->prepare(
                '
                SELECT
                    id,
                    name
                FROM categories
                WHERE id = :id
                LIMIT 1
                '
            );

            $findStmt->execute([
                ':id' => $categoryId,
            ]);

            $category = $findStmt->fetch(
                PDO::FETCH_ASSOC
            );

            if (!$category) {
                jsonResponse(
                    false,
                    'Kategori tidak ditemukan.',
                    null,
                    404
                );
            }

            $countStmt = $pdo->prepare(
                '
                SELECT COUNT(*) AS total
                FROM tools
                WHERE category_id = :category_id
                '
            );

            $countStmt->execute([
                ':category_id' => $categoryId,
            ]);

            $countRow = $countStmt->fetch(
                PDO::FETCH_ASSOC
            );

            $toolCount = (int) (
                $countRow['total'] ?? 0
            );

            if ($toolCount > 0) {
                jsonResponse(
                    false,
                    'Kategori tidak bisa dihapus karena masih digunakan oleh ' .
                        $toolCount .
                        ' tool.',
                    [
                        'tool_count' => $toolCount,
                    ],
                    409
                );
            }

            $deleteStmt = $pdo->prepare(
                '
                DELETE FROM categories
                WHERE id = :id
                '
            );

            $deleteStmt->execute([
                ':id' => $categoryId,
            ]);

            if ($deleteStmt->rowCount() < 1) {
                jsonResponse(
                    false,
                    'Kategori gagal dihapus.',
                    null,
                    500
                );
            }

            jsonResponse(
                true,
                'Kategori berhasil dihapus.',
                [
                    'id' => (int) $category['id'],
                    'name' =>
                    (string) $category['name'],
                ]
            );
        }
    } catch (Throwable $exception) {
        error_log(
            'Categories POST error: ' .
                $exception->getMessage()
        );

        jsonResponse(
            false,
            'Gagal memproses kategori: ' .
                $exception->getMessage(),
            null,
            500
        );
    }
}

jsonResponse(
    false,
    'Method tidak diizinkan.',
    null,
    405
);
