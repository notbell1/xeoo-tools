<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools Admin Authentication API
|--------------------------------------------------------------------------
|
| Actions:
| - login
| - me
| - logout
|
| Semua response menggunakan JSON.
| Tidak ada redirect ke halaman PHP.
|
*/

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| CORS / API Headers
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
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Helper: JSON Response
|--------------------------------------------------------------------------
*/

function jsonResponse(
    bool $success,
    string $message,
    int $statusCode = 200,
    ?array $data = null
): never {
    http_response_code($statusCode);

    $response = [
        'success' => $success,
        'message' => $message,
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );

    exit;
}

/*
|--------------------------------------------------------------------------
| Helper: Current Admin Session
|--------------------------------------------------------------------------
*/

function isAdminLoggedIn(): bool
{
    return (
        isset($_SESSION['admin_logged_in']) &&
        $_SESSION['admin_logged_in'] === true &&
        isset($_SESSION['admin_user_id']) &&
        isset($_SESSION['admin_username']) &&
        isset($_SESSION['admin_role']) &&
        $_SESSION['admin_role'] === 'admin'
    );
}

/*
|--------------------------------------------------------------------------
| Helper: Get Current Admin
|--------------------------------------------------------------------------
*/

function getCurrentAdmin(PDO $pdo): ?array
{
    if (!isAdminLoggedIn()) {
        return null;
    }

    $userId = (int) $_SESSION['admin_user_id'];

    if ($userId <= 0) {
        return null;
    }

    $stmt = $pdo->prepare(
        "
        SELECT
            id,
            username,
            display_name,
            avatar,
            role,
            status,
            last_login_at,
            last_login_ip
        FROM users
        WHERE id = :id
        LIMIT 1
        "
    );

    $stmt->execute([
        ':id' => $userId,
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        return null;
    }

    if (($user['status'] ?? '') !== 'active') {
        return null;
    }

    if (($user['role'] ?? '') !== 'admin') {
        return null;
    }

    return [
        'id' => (int) $user['id'],
        'username' => (string) $user['username'],
        'display_name' => $user['display_name'] !== null
            ? (string) $user['display_name']
            : null,
        'avatar' => $user['avatar'] !== null
            ? (string) $user['avatar']
            : null,
        'role' => (string) $user['role'],
        'status' => (string) $user['status'],
        'last_login_at' => $user['last_login_at'] !== null
            ? (string) $user['last_login_at']
            : null,
        'last_login_ip' => $user['last_login_ip'] !== null
            ? (string) $user['last_login_ip']
            : null,
    ];
}

/*
|--------------------------------------------------------------------------
| Only POST
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(
        false,
        'Method tidak diizinkan.',
        405
    );
}

/*
|--------------------------------------------------------------------------
| Action
|--------------------------------------------------------------------------
*/

$action = trim((string) ($_POST['action'] ?? ''));

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

if ($action === 'login') {
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        jsonResponse(
            false,
            'Username dan password wajib diisi.',
            422
        );
    }

    try {
        $stmt = $pdo->prepare(
            "
            SELECT
                id,
                username,
                password_hash,
                display_name,
                avatar,
                role,
                status,
                last_login_at,
                last_login_ip
            FROM users
            WHERE username = :username
            LIMIT 1
            "
        );

        $stmt->execute([
            ':username' => $username,
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            jsonResponse(
                false,
                'Username atau password salah.',
                401
            );
        }

        if (($user['status'] ?? '') !== 'active') {
            jsonResponse(
                false,
                'Akun sedang dinonaktifkan.',
                403
            );
        }

        if (($user['role'] ?? '') !== 'admin') {
            jsonResponse(
                false,
                'Akun tidak memiliki akses admin.',
                403
            );
        }

        if (
            !password_verify(
                $password,
                (string) $user['password_hash']
            )
        ) {
            jsonResponse(
                false,
                'Username atau password salah.',
                401
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Regenerate Session
        |--------------------------------------------------------------------------
        */

        session_regenerate_id(true);

        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_user_id'] = (int) $user['id'];
        $_SESSION['admin_username'] = (string) $user['username'];
        $_SESSION['admin_role'] = (string) $user['role'];

        /*
        |--------------------------------------------------------------------------
        | Login Metadata
        |--------------------------------------------------------------------------
        */

        $loginIp = $_SERVER['REMOTE_ADDR'] ?? null;

        try {
            $updateStmt = $pdo->prepare(
                "
                UPDATE users
                SET
                    last_login_at = NOW(),
                    last_login_ip = :last_login_ip
                WHERE id = :id
                LIMIT 1
                "
            );

            $updateStmt->execute([
                ':last_login_ip' => $loginIp,
                ':id' => (int) $user['id'],
            ]);
        } catch (Throwable $updateError) {
            /*
            |--------------------------------------------------------------------------
            | Jangan gagalkan login hanya karena metadata login gagal.
            |--------------------------------------------------------------------------
            */

            error_log(
                'XeooTools auth login metadata error: ' .
                    $updateError->getMessage()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Login Success Response
        |--------------------------------------------------------------------------
        */

        jsonResponse(
            true,
            'Login berhasil.',
            200,
            [
                'user' => [
                    'id' => (int) $user['id'],
                    'username' => (string) $user['username'],
                    'display_name' => $user['display_name'] !== null
                        ? (string) $user['display_name']
                        : null,
                    'avatar' => $user['avatar'] !== null
                        ? (string) $user['avatar']
                        : null,
                    'role' => (string) $user['role'],
                    'status' => (string) $user['status'],
                    'last_login_at' => date('Y-m-d H:i:s'),
                    'last_login_ip' => $loginIp,
                ],
            ]
        );
    } catch (Throwable $error) {
        error_log(
            'XeooTools auth login error: ' .
                $error->getMessage()
        );

        jsonResponse(
            false,
            'Terjadi kesalahan pada server saat login.',
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| ME
|--------------------------------------------------------------------------
*/

if ($action === 'me') {
    try {
        $user = getCurrentAdmin($pdo);

        if (!$user) {
            /*
            |--------------------------------------------------------------------------
            | Session invalid / expired
            |--------------------------------------------------------------------------
            */

            $_SESSION = [];

            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();

                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $params['path'],
                    $params['domain'],
                    $params['secure'],
                    $params['httponly']
                );
            }

            session_destroy();

            jsonResponse(
                false,
                'Sesi admin tidak valid atau telah berakhir.',
                401
            );
        }

        jsonResponse(
            true,
            'Session admin valid.',
            200,
            [
                'user' => $user,
            ]
        );
    } catch (Throwable $error) {
        error_log(
            'XeooTools auth me error: ' .
                $error->getMessage()
        );

        jsonResponse(
            false,
            'Tidak dapat memeriksa session admin.',
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

if ($action === 'logout') {
    try {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();

        jsonResponse(
            true,
            'Logout berhasil.'
        );
    } catch (Throwable $error) {
        error_log(
            'XeooTools auth logout error: ' .
                $error->getMessage()
        );

        jsonResponse(
            false,
            'Logout gagal.',
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| Unknown Action
|--------------------------------------------------------------------------
*/

jsonResponse(
    false,
    'Action authentication tidak dikenal.',
    400
);
