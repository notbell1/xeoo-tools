<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| SESSION
|--------------------------------------------------------------------------
*/
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

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
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

/*
|--------------------------------------------------------------------------
| PREFLIGHT
|--------------------------------------------------------------------------
*/
if (
    ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS'
) {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/
header(
    'Content-Type: application/json; charset=utf-8',
);

header(
    'Cache-Control: no-store, no-cache, must-revalidate, max-age=0',
);

header('Pragma: no-cache');

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/
require_once __DIR__ . '/../config/database.php';

date_default_timezone_set('Asia/Jakarta');

/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/
function response(
    bool $success,
    string $message = '',
    array $data = [],
    int $statusCode = 200,
): never {
    http_response_code($statusCode);

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

/*
|--------------------------------------------------------------------------
| CLIENT IP
|--------------------------------------------------------------------------
|
| Untuk local development dan server biasa, REMOTE_ADDR adalah sumber
| yang kita gunakan. Jangan mempercayai X-Forwarded-For sebelum proxy
| resmi dikonfigurasi.
|--------------------------------------------------------------------------
*/
function getClientIp(): string
{
    $ip = trim(
        (string) (
            $_SERVER['REMOTE_ADDR'] ?? ''
        ),
    );

    if ($ip === '') {
        return 'UNKNOWN';
    }

    return substr($ip, 0, 45);
}

/*
|--------------------------------------------------------------------------
| USER AGENT
|--------------------------------------------------------------------------
*/
function getUserAgent(): ?string
{
    $userAgent = trim(
        (string) (
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ),
    );

    if ($userAgent === '') {
        return null;
    }

    return substr($userAgent, 0, 1000);
}

/*
|--------------------------------------------------------------------------
| SESSION USER ID
|--------------------------------------------------------------------------
*/
function getSessionUserId(): ?int
{
    $userId = $_SESSION['admin_user_id'] ?? null;

    if (
        is_numeric($userId) &&
        (int) $userId > 0
    ) {
        return (int) $userId;
    }

    return null;
}

/*
|--------------------------------------------------------------------------
| CURRENT ADMIN
|--------------------------------------------------------------------------
*/
function findAdminById(
    PDO $pdo,
    int $userId,
): ?array {
    $stmt = $pdo->prepare(
        '
        SELECT
            id,
            username,
            display_name,
            avatar,
            password_hash,
            password_changed_at,
            last_login_at,
            last_login_ip,
            role,
            status,
            created_at,
            updated_at
        FROM users
        WHERE id = :id
        LIMIT 1
        ',
    );

    $stmt->execute([
        'id' => $userId,
    ]);

    $user = $stmt->fetch(
        PDO::FETCH_ASSOC,
    );

    return $user ?: null;
}

/*
|--------------------------------------------------------------------------
| SAFE USER RESPONSE
|--------------------------------------------------------------------------
*/
function serializeUser(
    array $user,
): array {
    return [
        'id' => (int) $user['id'],

        'username' => (string) (
            $user['username'] ?? ''
        ),

        'display_name' => (
            $user['display_name'] !== null
            ? (string) $user['display_name']
            : null
        ),

        'avatar' => (
            $user['avatar'] !== null
            ? (string) $user['avatar']
            : null
        ),

        'role' => (string) (
            $user['role'] ?? ''
        ),

        'status' => (string) (
            $user['status'] ?? ''
        ),

        'password_changed_at' => (
            $user['password_changed_at'] !== null
            ? (string) $user['password_changed_at']
            : null
        ),

        'last_login_at' => (
            $user['last_login_at'] !== null
            ? (string) $user['last_login_at']
            : null
        ),

        'last_login_ip' => (
            $user['last_login_ip'] !== null
            ? (string) $user['last_login_ip']
            : null
        ),
    ];
}

/*
|--------------------------------------------------------------------------
| DESTROY SESSION
|--------------------------------------------------------------------------
*/
function destroyAdminSession(): void
{
    $_SESSION = [];

    if (
        ini_get('session.use_cookies')
    ) {
        $params =
            session_get_cookie_params();

        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly'],
        );
    }

    session_destroy();
}

/*
|--------------------------------------------------------------------------
| LOG ADMIN AUTH ACTIVITY
|--------------------------------------------------------------------------
*/
function writeAuthLog(
    PDO $pdo,
    int $userId,
    string $action,
    bool $success,
    string $ipAddress,
    ?string $userAgent,
    ?string $sessionId,
): void {
    $stmt = $pdo->prepare(
        '
        INSERT INTO admin_auth_logs (
            user_id,
            action,
            success,
            ip_address,
            user_agent,
            session_id,
            created_at
        )
        VALUES (
            :user_id,
            :action,
            :success,
            :ip_address,
            :user_agent,
            :session_id,
            :created_at
        )
        ',
    );

    $stmt->execute([
        'user_id' => $userId,
        'action' => $action,
        'success' => $success ? 1 : 0,
        'ip_address' => $ipAddress,
        'user_agent' => $userAgent,
        'session_id' => $sessionId,
        'created_at' => date(
            'Y-m-d H:i:s',
        ),
    ]);
}

/*
|--------------------------------------------------------------------------
| REQUEST METHOD
|--------------------------------------------------------------------------
*/
if (
    ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST'
) {
    response(
        false,
        'Method not allowed.',
        [],
        405,
    );
}

/*
|--------------------------------------------------------------------------
| ACTION
|--------------------------------------------------------------------------
*/
$action = trim(
    (string) (
        $_POST['action'] ?? ''
    ),
);

$clientIp = getClientIp();
$userAgent = getUserAgent();

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
if ($action === 'login') {
    $username = trim(
        (string) (
            $_POST['username'] ?? ''
        ),
    );

    $password = (string) (
        $_POST['password'] ?? ''
    );

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */
    if ($username === '') {
        response(
            false,
            'Username wajib diisi.',
            [],
            422,
        );
    }

    if ($password === '') {
        response(
            false,
            'Password wajib diisi.',
            [],
            422,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND USER
    |--------------------------------------------------------------------------
    */
    try {
        $stmt = $pdo->prepare(
            '
            SELECT
                id,
                username,
                display_name,
                avatar,
                password_hash,
                password_changed_at,
                last_login_at,
                last_login_ip,
                role,
                status
            FROM users
            WHERE username = :username
            LIMIT 1
            ',
        );

        $stmt->execute([
            'username' => $username,
        ]);

        $user = $stmt->fetch(
            PDO::FETCH_ASSOC,
        );
    } catch (Throwable $e) {
        error_log(
            'XeooTools auth database error: ' .
                $e->getMessage(),
        );

        response(
            false,
            'Terjadi kesalahan pada server.',
            [],
            500,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | USER NOT FOUND
    |--------------------------------------------------------------------------
    |
    | Tidak ada user_id sehingga tidak bisa menulis admin_auth_logs
    | karena user_id memiliki foreign key ke users.id.
    |--------------------------------------------------------------------------
    */
    if (!$user) {
        response(
            false,
            'Username atau password salah.',
            [],
            401,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY ADMIN IS AUDITED HERE
    |--------------------------------------------------------------------------
    */
    $isAdmin =
        ($user['role'] ?? '') === 'admin';

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */
    if (
        ($user['status'] ?? '') !==
        'active'
    ) {
        if ($isAdmin) {
            try {
                writeAuthLog(
                    $pdo,
                    (int) $user['id'],
                    'login',
                    false,
                    $clientIp,
                    $userAgent,
                    session_id(),
                );
            } catch (Throwable $e) {
                error_log(
                    'XeooTools failed-login log error: ' .
                        $e->getMessage(),
                );
            }
        }

        response(
            false,
            'Akun sedang dinonaktifkan.',
            [],
            403,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */
    if (
        ($user['role'] ?? '') !==
        'admin'
    ) {
        response(
            false,
            'Akun tidak memiliki akses admin.',
            [],
            403,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY PASSWORD
    |--------------------------------------------------------------------------
    */
    $passwordValid =
        password_verify(
            $password,
            (string) $user['password_hash'],
        );

    if (!$passwordValid) {
        /*
         * Password salah tetap dicatat
         * karena user admin ditemukan.
         */
        try {
            writeAuthLog(
                $pdo,
                (int) $user['id'],
                'login',
                false,
                $clientIp,
                $userAgent,
                session_id(),
            );
        } catch (Throwable $e) {
            error_log(
                'XeooTools failed-login log error: ' .
                    $e->getMessage(),
            );
        }

        response(
            false,
            'Username atau password salah.',
            [],
            401,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REGENERATE SESSION ID
    |--------------------------------------------------------------------------
    */
    session_regenerate_id(true);

    $currentSessionId =
        session_id();

    $loginAt =
        date('Y-m-d H:i:s');

    /*
    |--------------------------------------------------------------------------
    | BEGIN LOGIN TRANSACTION
    |--------------------------------------------------------------------------
    */
    try {
        $pdo->beginTransaction();

        /*
        |--------------------------------------------------------------------------
        | REHASH IF NEEDED
        |--------------------------------------------------------------------------
        */
        if (
            password_needs_rehash(
                (string) $user['password_hash'],
                PASSWORD_BCRYPT,
            )
        ) {
            $newHash =
                password_hash(
                    $password,
                    PASSWORD_BCRYPT,
                );

            if ($newHash === false) {
                throw new RuntimeException(
                    'Password rehash gagal.',
                );
            }

            $updateHash =
                $pdo->prepare(
                    '
                    UPDATE users
                    SET password_hash = :password_hash
                    WHERE id = :id
                    LIMIT 1
                    ',
                );

            $updateHash->execute([
                'password_hash' =>
                $newHash,

                'id' =>
                (int) $user['id'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE LAST LOGIN
        |--------------------------------------------------------------------------
        */
        $updateLogin =
            $pdo->prepare(
                '
                UPDATE users
                SET
                    last_login_at = :last_login_at,
                    last_login_ip = :last_login_ip
                WHERE id = :id
                LIMIT 1
                ',
            );

        $updateLogin->execute([
            'last_login_at' =>
            $loginAt,

            'last_login_ip' =>
            $clientIp,

            'id' =>
            (int) $user['id'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | WRITE LOGIN LOG
        |--------------------------------------------------------------------------
        */
        writeAuthLog(
            $pdo,
            (int) $user['id'],
            'login',
            true,
            $clientIp,
            $userAgent,
            $currentSessionId,
        );

        $pdo->commit();
    } catch (Throwable $e) {
        if (
            $pdo->inTransaction()
        ) {
            $pdo->rollBack();
        }

        /*
         * Jangan tinggalkan session admin aktif
         * jika proses login database gagal.
         */
        destroyAdminSession();

        error_log(
            'XeooTools login transaction error: ' .
                $e->getMessage(),
        );

        response(
            false,
            'Login tidak dapat diselesaikan. Silakan coba lagi.',
            [],
            500,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SET ADMIN SESSION
    |--------------------------------------------------------------------------
    */
    $_SESSION['admin_logged_in'] =
        true;

    $_SESSION['admin_user_id'] =
        (int) $user['id'];

    $_SESSION['admin_username'] =
        (string) $user['username'];

    $_SESSION['admin_role'] =
        (string) $user['role'];

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */
    response(
        true,
        'Login berhasil.',
        [
            'user' => [
                'id' =>
                (int) $user['id'],

                'username' =>
                (string) $user['username'],

                'display_name' =>
                $user['display_name'] !== null
                    ? (string) $user['display_name']
                    : null,

                'avatar' =>
                $user['avatar'] !== null
                    ? (string) $user['avatar']
                    : null,

                'role' =>
                (string) $user['role'],

                'status' =>
                (string) $user['status'],

                'last_login_at' =>
                $loginAt,

                'last_login_ip' =>
                $clientIp,
            ],
        ],
    );
}

/*
|--------------------------------------------------------------------------
| CHECK SESSION
|--------------------------------------------------------------------------
*/
if ($action === 'me') {
    if (
        empty($_SESSION['admin_logged_in']) ||
        $_SESSION['admin_logged_in'] !== true
    ) {
        response(
            false,
            'Not authenticated.',
            [],
            401,
        );
    }

    $sessionUserId =
        getSessionUserId();

    if ($sessionUserId === null) {
        destroyAdminSession();

        response(
            false,
            'Session admin tidak valid.',
            [],
            401,
        );
    }

    try {
        $user =
            findAdminById(
                $pdo,
                $sessionUserId,
            );
    } catch (Throwable $e) {
        error_log(
            'XeooTools auth session database error: ' .
                $e->getMessage(),
        );

        response(
            false,
            'Terjadi kesalahan pada server.',
            [],
            500,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | USER NO LONGER EXISTS
    |--------------------------------------------------------------------------
    */
    if (!$user) {
        destroyAdminSession();

        response(
            false,
            'Akun administrator tidak ditemukan.',
            [],
            401,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT DISABLED / ROLE CHANGED
    |--------------------------------------------------------------------------
    */
    if (
        ($user['role'] ?? '') !== 'admin' ||
        ($user['status'] ?? '') !== 'active'
    ) {
        destroyAdminSession();

        response(
            false,
            'Akses administrator sudah tidak aktif.',
            [],
            403,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | KEEP SESSION DATA CONSISTENT
    |--------------------------------------------------------------------------
    */
    $_SESSION['admin_logged_in'] =
        true;

    $_SESSION['admin_user_id'] =
        (int) $user['id'];

    $_SESSION['admin_username'] =
        (string) $user['username'];

    $_SESSION['admin_role'] =
        (string) $user['role'];

    response(
        true,
        'Authenticated.',
        [
            'user' =>
            serializeUser(
                $user,
            ),
        ],
    );
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/
if ($action === 'logout') {
    /*
    |--------------------------------------------------------------------------
    | CAPTURE SESSION DATA BEFORE DESTROY
    |--------------------------------------------------------------------------
    */
    $userId =
        getSessionUserId();

    $currentSessionId =
        session_id();

    /*
    |--------------------------------------------------------------------------
    | WRITE LOG FIRST
    |--------------------------------------------------------------------------
    |
    | Jika logging gagal, session tetap akan dihancurkan di bawah.
    | Logout tidak boleh tertahan hanya karena audit log gagal.
    |--------------------------------------------------------------------------
    */
    if ($userId !== null) {
        try {
            writeAuthLog(
                $pdo,
                $userId,
                'logout',
                true,
                $clientIp,
                $userAgent,
                $currentSessionId !== ''
                    ? $currentSessionId
                    : null,
            );
        } catch (Throwable $e) {
            error_log(
                'XeooTools logout log error: ' .
                    $e->getMessage(),
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | DESTROY SESSION
    |--------------------------------------------------------------------------
    */
    destroyAdminSession();

    response(
        true,
        'Logout berhasil.',
        [],
        200,
    );
}

/*
|--------------------------------------------------------------------------
| INVALID ACTION
|--------------------------------------------------------------------------
*/
response(
    false,
    'Invalid action.',
    [],
    422,
);
