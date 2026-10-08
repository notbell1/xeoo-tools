<?php

declare(strict_types=1);

session_start();

/*
|--------------------------------------------------------------------------
| JSON / Cache Headers
|--------------------------------------------------------------------------
*/

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

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
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/*
|--------------------------------------------------------------------------
| CORS Preflight
|--------------------------------------------------------------------------
*/

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| JSON Response
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Normalize Slug
|--------------------------------------------------------------------------
*/

function normalizeSlug(string $value): string
{
    $value = strtolower(trim($value));

    $value = preg_replace(
        '/[^a-z0-9\s-]/',
        '',
        $value,
    ) ?? '';

    $value = preg_replace(
        '/\s+/',
        '-',
        $value,
    ) ?? '';

    $value = preg_replace(
        '/-+/',
        '-',
        $value,
    ) ?? '';

    return trim($value, '-');
}

/*
|--------------------------------------------------------------------------
| Validate Status
|--------------------------------------------------------------------------
*/

function validateStatus(string $status): string
{
    $allowed = [
        'ready',
        'maintenance',
        'upcoming',
    ];

    if (!in_array($status, $allowed, true)) {
        jsonResponse(
            false,
            'Status tidak valid.',
            null,
            422,
        );
    }

    return $status;
}

/*
|--------------------------------------------------------------------------
| Validate Category
|--------------------------------------------------------------------------
*/

function validateCategory(
    PDO $pdo,
    int $categoryId,
): void {
    if ($categoryId <= 0) {
        jsonResponse(
            false,
            'Kategori wajib dipilih.',
            null,
            422,
        );
    }

    $stmt = $pdo->prepare(
        'SELECT id
         FROM categories
         WHERE id = :id
         LIMIT 1'
    );

    $stmt->execute([
        'id' => $categoryId,
    ]);

    if (!$stmt->fetchColumn()) {
        jsonResponse(
            false,
            'Kategori tidak ditemukan.',
            null,
            422,
        );
    }
}

/*
|--------------------------------------------------------------------------
| Fetch Single Tool
|--------------------------------------------------------------------------
*/

function fetchTool(
    PDO $pdo,
    int $toolId,
): ?array {
    $stmt = $pdo->prepare(
        'SELECT
            t.id,
            t.name,
            t.slug,
            t.description,
            t.icon,
            t.status,
            t.category_id,
            c.name AS category_name,
            c.slug AS category_slug
         FROM tools t
         INNER JOIN categories c
            ON c.id = t.category_id
         WHERE t.id = :id
         LIMIT 1'
    );

    $stmt->execute([
        'id' => $toolId,
    ]);

    $tool = $stmt->fetch(
        PDO::FETCH_ASSOC,
    );

    return $tool ?: null;
}

/*
|--------------------------------------------------------------------------
| Fetch All Tools
|--------------------------------------------------------------------------
|
| GET bersifat PUBLIC karena dipakai oleh:
| - /tools
| - /category/:slug
| - halaman frontend lain yang membutuhkan daftar tools
|
|--------------------------------------------------------------------------
*/

function fetchAllTools(
    PDO $pdo,
): array {
    $stmt = $pdo->query(
        'SELECT
            t.id,
            t.name,
            t.slug,
            t.description,
            t.icon,
            t.status,
            t.category_id,
            c.name AS category_name,
            c.slug AS category_slug
         FROM tools t
         INNER JOIN categories c
            ON c.id = t.category_id
         ORDER BY t.id ASC'
    );

    $tools = $stmt->fetchAll(
        PDO::FETCH_ASSOC,
    );

    foreach ($tools as &$tool) {
        $tool['id'] = (int) $tool['id'];

        $tool['category_id'] =
            (int) $tool['category_id'];

        $tool['name'] =
            (string) $tool['name'];

        $tool['slug'] =
            (string) $tool['slug'];

        $tool['description'] =
            (string) (
                $tool['description'] ?? ''
            );

        $tool['icon'] =
            (string) (
                $tool['icon'] ?? 'wrench'
            );

        $tool['status'] =
            (string) $tool['status'];

        $tool['category_name'] =
            (string) $tool['category_name'];

        $tool['category_slug'] =
            (string) $tool['category_slug'];
    }

    unset($tool);

    return $tools;
}

/*
|--------------------------------------------------------------------------
| Request Method
|--------------------------------------------------------------------------
*/

$method =
    $_SERVER['REQUEST_METHOD'] ?? 'GET';

/*
|--------------------------------------------------------------------------
| GET — PUBLIC
|--------------------------------------------------------------------------
|
| User biasa harus bisa mengambil daftar tools.
|
|--------------------------------------------------------------------------
*/

if ($method === 'GET') {
    try {
        $tools = fetchAllTools($pdo);

        jsonResponse(
            true,
            'Tools berhasil diambil.',
            $tools,
        );
    } catch (Throwable $e) {
        error_log(
            'tools.php GET error: ' .
                $e->getMessage(),
        );

        jsonResponse(
            false,
            'Gagal mengambil data tools.',
            null,
            500,
        );
    }
}

/*
|--------------------------------------------------------------------------
| Only POST Is Allowed Beyond GET
|--------------------------------------------------------------------------
*/

if ($method !== 'POST') {
    jsonResponse(
        false,
        'Method not allowed.',
        null,
        405,
    );
}

/*
|--------------------------------------------------------------------------
| POST — ADMIN ONLY
|--------------------------------------------------------------------------
|
| Semua operasi perubahan data tools wajib melalui
| session admin yang valid.
|
| Actions:
| - create
| - update
| - update_status
| - delete
|
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/admin-guard.php';

/*
|--------------------------------------------------------------------------
| POST Action
|--------------------------------------------------------------------------
*/

$action =
    trim(
        (string) (
            $_POST['action'] ?? ''
        )
    );

try {
    switch ($action) {

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        case 'create': {
                $name =
                    trim(
                        (string) (
                            $_POST['name'] ?? ''
                        )
                    );

                $slug =
                    normalizeSlug(
                        (string) (
                            $_POST['slug'] ?? ''
                        )
                    );

                $description =
                    trim(
                        (string) (
                            $_POST['description'] ?? ''
                        )
                    );

                $icon =
                    trim(
                        (string) (
                            $_POST['icon'] ?? 'wrench'
                        )
                    );

                $status =
                    validateStatus(
                        trim(
                            (string) (
                                $_POST['status'] ?? 'ready'
                            )
                        )
                    );

                $categoryId =
                    (int) (
                        $_POST['category_id'] ?? 0
                    );

                if ($name === '') {
                    jsonResponse(
                        false,
                        'Nama tool wajib diisi.',
                        null,
                        422,
                    );
                }

                if ($slug === '') {
                    jsonResponse(
                        false,
                        'Slug tool wajib diisi.',
                        null,
                        422,
                    );
                }

                if ($description === '') {
                    jsonResponse(
                        false,
                        'Description tool wajib diisi.',
                        null,
                        422,
                    );
                }

                if ($icon === '') {
                    jsonResponse(
                        false,
                        'Icon tool wajib diisi.',
                        null,
                        422,
                    );
                }

                validateCategory(
                    $pdo,
                    $categoryId,
                );

                $stmt = $pdo->prepare(
                    'INSERT INTO tools (
                    name,
                    slug,
                    description,
                    icon,
                    status,
                    category_id
                )
                VALUES (
                    :name,
                    :slug,
                    :description,
                    :icon,
                    :status,
                    :category_id
                )'
                );

                $stmt->execute([
                    'name' =>
                    $name,

                    'slug' =>
                    $slug,

                    'description' =>
                    $description,

                    'icon' =>
                    $icon,

                    'status' =>
                    $status,

                    'category_id' =>
                    $categoryId,
                ]);

                $toolId =
                    (int) $pdo->lastInsertId();

                $tool =
                    fetchTool(
                        $pdo,
                        $toolId,
                    );

                jsonResponse(
                    true,
                    'Tool berhasil ditambahkan.',
                    $tool,
                    201,
                );
            }

            /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        case 'update': {
                $toolId =
                    (int) (
                        $_POST['tool_id'] ?? 0
                    );

                $name =
                    trim(
                        (string) (
                            $_POST['name'] ?? ''
                        )
                    );

                $slug =
                    normalizeSlug(
                        (string) (
                            $_POST['slug'] ?? ''
                        )
                    );

                $description =
                    trim(
                        (string) (
                            $_POST['description'] ?? ''
                        )
                    );

                $icon =
                    trim(
                        (string) (
                            $_POST['icon'] ?? 'wrench'
                        )
                    );

                $status =
                    validateStatus(
                        trim(
                            (string) (
                                $_POST['status'] ?? 'ready'
                            )
                        )
                    );

                $categoryId =
                    (int) (
                        $_POST['category_id'] ?? 0
                    );

                if ($toolId <= 0) {
                    jsonResponse(
                        false,
                        'Tool ID tidak valid.',
                        null,
                        422,
                    );
                }

                if (
                    !fetchTool(
                        $pdo,
                        $toolId,
                    )
                ) {
                    jsonResponse(
                        false,
                        'Tool tidak ditemukan.',
                        null,
                        404,
                    );
                }

                if ($name === '') {
                    jsonResponse(
                        false,
                        'Nama tool wajib diisi.',
                        null,
                        422,
                    );
                }

                if ($slug === '') {
                    jsonResponse(
                        false,
                        'Slug tool wajib diisi.',
                        null,
                        422,
                    );
                }

                if ($description === '') {
                    jsonResponse(
                        false,
                        'Description tool wajib diisi.',
                        null,
                        422,
                    );
                }

                if ($icon === '') {
                    jsonResponse(
                        false,
                        'Icon tool wajib diisi.',
                        null,
                        422,
                    );
                }

                validateCategory(
                    $pdo,
                    $categoryId,
                );

                $stmt = $pdo->prepare(
                    'UPDATE tools
                 SET
                    name = :name,
                    slug = :slug,
                    description = :description,
                    icon = :icon,
                    status = :status,
                    category_id = :category_id
                 WHERE id = :id'
                );

                $stmt->execute([
                    'name' =>
                    $name,

                    'slug' =>
                    $slug,

                    'description' =>
                    $description,

                    'icon' =>
                    $icon,

                    'status' =>
                    $status,

                    'category_id' =>
                    $categoryId,

                    'id' =>
                    $toolId,
                ]);

                $tool =
                    fetchTool(
                        $pdo,
                        $toolId,
                    );

                jsonResponse(
                    true,
                    'Tool berhasil diperbarui.',
                    $tool,
                );
            }

            /*
        |--------------------------------------------------------------------------
        | UPDATE STATUS
        |--------------------------------------------------------------------------
        */

        case 'update_status': {
                $toolId =
                    (int) (
                        $_POST['tool_id'] ?? 0
                    );

                $status =
                    validateStatus(
                        trim(
                            (string) (
                                $_POST['status'] ?? ''
                            )
                        )
                    );

                if ($toolId <= 0) {
                    jsonResponse(
                        false,
                        'Tool ID tidak valid.',
                        null,
                        422,
                    );
                }

                $tool =
                    fetchTool(
                        $pdo,
                        $toolId,
                    );

                if (!$tool) {
                    jsonResponse(
                        false,
                        'Tool tidak ditemukan.',
                        null,
                        404,
                    );
                }

                $stmt = $pdo->prepare(
                    'UPDATE tools
                 SET status = :status
                 WHERE id = :id'
                );

                $stmt->execute([
                    'status' =>
                    $status,

                    'id' =>
                    $toolId,
                ]);

                jsonResponse(
                    true,
                    'Status tool berhasil diperbarui.',
                    fetchTool(
                        $pdo,
                        $toolId,
                    ),
                );
            }

            /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */

        case 'delete': {
                $toolId =
                    (int) (
                        $_POST['tool_id'] ?? 0
                    );

                if ($toolId <= 0) {
                    jsonResponse(
                        false,
                        'Tool ID tidak valid.',
                        null,
                        422,
                    );
                }

                $tool =
                    fetchTool(
                        $pdo,
                        $toolId,
                    );

                if (!$tool) {
                    jsonResponse(
                        false,
                        'Tool tidak ditemukan.',
                        null,
                        404,
                    );
                }

                $stmt = $pdo->prepare(
                    'DELETE FROM tools
                 WHERE id = :id'
                );

                $stmt->execute([
                    'id' =>
                    $toolId,
                ]);

                jsonResponse(
                    true,
                    'Tool berhasil dihapus.',
                    [
                        'id' =>
                        $toolId,

                        'name' =>
                        $tool['name'],
                    ],
                );
            }

            /*
        |--------------------------------------------------------------------------
        | UNKNOWN ACTION
        |--------------------------------------------------------------------------
        */

        default:
            jsonResponse(
                false,
                'Action tidak valid.',
                null,
                422,
            );
    }
} catch (PDOException $e) {
    error_log(
        'tools.php PDO error: ' .
            $e->getMessage(),
    );

    $errorInfo =
        $e->errorInfo;

    $driverCode =
        is_array($errorInfo)
        ? ($errorInfo[1] ?? null)
        : null;

    if (
        (int) $driverCode === 1062
    ) {
        jsonResponse(
            false,
            'Slug tool sudah digunakan. Gunakan slug yang berbeda.',
            null,
            409,
        );
    }

    jsonResponse(
        false,
        'Terjadi kesalahan database.',
        null,
        500,
    );
} catch (Throwable $e) {
    error_log(
        'tools.php error: ' .
            $e->getMessage(),
    );

    jsonResponse(
        false,
        'Terjadi kesalahan server.',
        null,
        500,
    );
}