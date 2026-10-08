<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

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

if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

header(
    'Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With'
);

header('Access-Control-Allow-Methods: POST, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'POST') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Security Headers
|--------------------------------------------------------------------------
*/

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

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
        JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
    );

    exit;
}

/*
|--------------------------------------------------------------------------
| Request Method
|--------------------------------------------------------------------------
*/

function requirePost(): void
{
    if (
        strtoupper(
            $_SERVER['REQUEST_METHOD'] ?? ''
        ) !== 'POST'
    ) {
        jsonResponse(
            false,
            'Method not allowed.',
            null,
            405
        );
    }
}

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/

function requireAdmin(PDO $pdo): int
{
    $loggedIn =
        isset($_SESSION['admin_logged_in']) &&
        $_SESSION['admin_logged_in'] === true;

    $userId =
        isset($_SESSION['admin_user_id'])
        ? (int) $_SESSION['admin_user_id']
        : 0;

    if (!$loggedIn || $userId <= 0) {
        jsonResponse(
            false,
            'Sesi administrator tidak valid.',
            null,
            401
        );
    }

    $stmt = $pdo->prepare(
        'SELECT
            id,
            username,
            role,
            status
         FROM users
         WHERE id = :id
         LIMIT 1'
    );

    $stmt->execute([
        'id' => $userId,
    ]);

    $user = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$user) {
        $_SESSION = [];

        jsonResponse(
            false,
            'Akun administrator tidak ditemukan.',
            null,
            401
        );
    }

    if (
        (string) ($user['role'] ?? '') !== 'admin' ||
        (string) ($user['status'] ?? '') !== 'active'
    ) {
        $_SESSION = [];

        jsonResponse(
            false,
            'Akun administrator tidak aktif.',
            null,
            403
        );
    }

    return $userId;
}

/*
|--------------------------------------------------------------------------
| CSRF
|--------------------------------------------------------------------------
*/

function getCsrfToken(): string
{
    $token =
        isset($_SESSION['admin_csrf_token'])
        ? (string) $_SESSION['admin_csrf_token']
        : '';

    if ($token === '') {
        $token = bin2hex(
            random_bytes(32)
        );

        $_SESSION['admin_csrf_token'] =
            $token;
    }

    return $token;
}

function requireCsrfToken(): void
{
    $sessionToken =
        isset($_SESSION['admin_csrf_token'])
        ? (string) $_SESSION['admin_csrf_token']
        : '';

    $requestToken =
        isset($_POST['csrf_token'])
        ? trim(
            (string) $_POST['csrf_token']
        )
        : '';

    if (
        $sessionToken === '' ||
        $requestToken === '' ||
        !hash_equals(
            $sessionToken,
            $requestToken
        )
    ) {
        jsonResponse(
            false,
            'Token keamanan tidak valid. Muat ulang halaman lalu coba lagi.',
            null,
            419
        );
    }
}

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

function fetchProfile(
    PDO $pdo,
    int $userId
): ?array {
    $stmt = $pdo->prepare(
        'SELECT
            id,
            username,
            display_name,
            avatar,
            role,
            status,
            password_changed_at,
            last_login_at,
            last_login_ip,
            created_at,
            updated_at
         FROM users
         WHERE id = :id
         LIMIT 1'
    );

    $stmt->execute([
        'id' => $userId,
    ]);

    $profile = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$profile) {
        return null;
    }

    return [
        'id' =>
        (int) $profile['id'],

        'username' =>
        (string) $profile['username'],

        'display_name' =>
        $profile['display_name'] !== null
            ? (string) $profile['display_name']
            : null,

        'avatar' =>
        $profile['avatar'] !== null
            ? (string) $profile['avatar']
            : null,

        'role' =>
        (string) $profile['role'],

        'status' =>
        (string) $profile['status'],

        'password_changed_at' =>
        $profile['password_changed_at'] !== null
            ? (string) $profile['password_changed_at']
            : null,

        'last_login_at' =>
        $profile['last_login_at'] !== null
            ? (string) $profile['last_login_at']
            : null,

        'last_login_ip' =>
        $profile['last_login_ip'] !== null
            ? (string) $profile['last_login_ip']
            : null,

        'created_at' =>
        $profile['created_at'] !== null
            ? (string) $profile['created_at']
            : null,

        'updated_at' =>
        $profile['updated_at'] !== null
            ? (string) $profile['updated_at']
            : null,
    ];
}

/*
|--------------------------------------------------------------------------
| Authentication History
|--------------------------------------------------------------------------
*/

function fetchLogs(
    PDO $pdo,
    int $userId
): array {
    $stmt = $pdo->prepare(
        'SELECT
            id,
            action,
            success,
            ip_address,
            user_agent,
            session_id,
            created_at
         FROM admin_auth_logs
         WHERE user_id = :user_id
         ORDER BY id DESC
         LIMIT 100'
    );

    $stmt->execute([
        'user_id' => $userId,
    ]);

    $rows = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    $logs = [];

    foreach ($rows as $row) {
        $logs[] = [
            'id' =>
            (int) $row['id'],

            'action' =>
            (string) $row['action'],

            'success' =>
            (int) $row['success'] === 1,

            'ip_address' =>
            $row['ip_address'] !== null
                ? (string) $row['ip_address']
                : null,

            'user_agent' =>
            $row['user_agent'] !== null
                ? (string) $row['user_agent']
                : null,

            'session_id' =>
            $row['session_id'] !== null
                ? (string) $row['session_id']
                : null,

            'created_at' =>
            (string) $row['created_at'],
        ];
    }

    return $logs;
}

/*
|--------------------------------------------------------------------------
| Request Information
|--------------------------------------------------------------------------
*/

function getClientIp(): string
{
    $ip =
        $_SERVER['REMOTE_ADDR'] ?? '';

    if (!is_string($ip)) {
        return '';
    }

    if (
        filter_var(
            $ip,
            FILTER_VALIDATE_IP
        ) === false
    ) {
        return '';
    }

    return substr(
        $ip,
        0,
        45
    );
}

function getUserAgent(): string
{
    $userAgent =
        $_SERVER['HTTP_USER_AGENT'] ?? '';

    if (!is_string($userAgent)) {
        return '';
    }

    return substr(
        $userAgent,
        0,
        1000
    );
}

/*
|--------------------------------------------------------------------------
| Authentication Audit Log
|--------------------------------------------------------------------------
*/

function writeAuthLog(
    PDO $pdo,
    int $userId,
    string $action,
    bool $success = true
): void {
    $allowedActions = [
        'login',
        'logout',
        'password_changed',
    ];

    if (
        !in_array(
            $action,
            $allowedActions,
            true
        )
    ) {
        return;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO admin_auth_logs
        (
            user_id,
            action,
            success,
            ip_address,
            user_agent,
            session_id
        )
        VALUES
        (
            :user_id,
            :action,
            :success,
            :ip_address,
            :user_agent,
            :session_id
        )'
    );

    $stmt->execute([
        'user_id' =>
        $userId,

        'action' =>
        $action,

        'success' =>
        $success ? 1 : 0,

        'ip_address' =>
        getClientIp(),

        'user_agent' =>
        getUserAgent(),

        'session_id' =>
        session_id() !== ''
            ? session_id()
            : null,
    ]);
}

/*
|--------------------------------------------------------------------------
| Username Validation
|--------------------------------------------------------------------------
*/

function validateUsername(
    string $username
): string {
    if ($username === '') {
        return '';
    }

    if (
        strlen($username) < 3 ||
        strlen($username) > 100
    ) {
        jsonResponse(
            false,
            'Username harus 3 sampai 100 karakter.',
            null,
            422
        );
    }

    if (
        !preg_match(
            '/^[A-Za-z0-9._-]+$/',
            $username
        )
    ) {
        jsonResponse(
            false,
            'Username hanya boleh berisi huruf, angka, titik, underscore, dan tanda minus.',
            null,
            422
        );
    }

    return $username;
}

/*
|--------------------------------------------------------------------------
| Avatar Validation
|--------------------------------------------------------------------------
|
| Allowed:
| - JPG
| - JPEG
| - PNG
|
| Checks:
| - upload error
| - size <= 2 MB
| - extension
| - is_uploaded_file
| - MIME via finfo
| - image structure via getimagesize
|--------------------------------------------------------------------------
*/

function validateAvatarUpload(
    array $file
): array {
    if (
        !isset($file['error']) ||
        !isset($file['tmp_name']) ||
        !isset($file['size']) ||
        !isset($file['name'])
    ) {
        jsonResponse(
            false,
            'Data avatar tidak lengkap.',
            null,
            422
        );
    }

    $errorCode =
        (int) $file['error'];

    if (
        $errorCode !==
        UPLOAD_ERR_OK
    ) {
        jsonResponse(
            false,
            'Upload avatar gagal.',
            null,
            422
        );
    }

    $size =
        (int) $file['size'];

    if ($size <= 0) {
        jsonResponse(
            false,
            'File avatar kosong.',
            null,
            422
        );
    }

    if (
        $size >
        2 * 1024 * 1024
    ) {
        jsonResponse(
            false,
            'Ukuran avatar maksimal 2 MB.',
            null,
            422
        );
    }

    $originalName =
        basename(
            (string) $file['name']
        );

    $extension =
        strtolower(
            pathinfo(
                $originalName,
                PATHINFO_EXTENSION
            )
        );

    $allowedExtensions = [
        'jpg',
        'jpeg',
        'png',
    ];

    if (
        !in_array(
            $extension,
            $allowedExtensions,
            true
        )
    ) {
        jsonResponse(
            false,
            'Avatar hanya boleh JPG, JPEG, atau PNG.',
            null,
            422
        );
    }

    $tmpName =
        (string) $file['tmp_name'];

    if (
        !is_uploaded_file(
            $tmpName
        )
    ) {
        jsonResponse(
            false,
            'Sumber file upload tidak valid.',
            null,
            422
        );
    }

    $finfo =
        finfo_open(
            FILEINFO_MIME_TYPE
        );

    if ($finfo === false) {
        jsonResponse(
            false,
            'Server tidak dapat memeriksa tipe file.',
            null,
            500
        );
    }

    $mime =
        finfo_file(
            $finfo,
            $tmpName
        );

    finfo_close(
        $finfo
    );

    $allowedMimeMap = [
        'image/jpeg' =>
        'jpg',

        'image/png' =>
        'png',
    ];

    if (
        !is_string($mime) ||
        !isset(
            $allowedMimeMap[$mime]
        )
    ) {
        jsonResponse(
            false,
            'Isi file avatar tidak sesuai. Hanya JPG, JPEG, atau PNG yang diizinkan.',
            null,
            422
        );
    }

    $imageInfo =
        @getimagesize(
            $tmpName
        );

    if (
        $imageInfo === false ||
        !isset(
            $imageInfo['mime']
        )
    ) {
        jsonResponse(
            false,
            'File avatar bukan gambar yang valid.',
            null,
            422
        );
    }

    if (
        (string) $imageInfo['mime'] !==
        $mime
    ) {
        jsonResponse(
            false,
            'Validasi isi avatar gagal.',
            null,
            422
        );
    }

    return [
        'mime' =>
        $mime,

        'extension' =>
        $allowedMimeMap[$mime],

        'tmp_name' =>
        $tmpName,
    ];
}

/*
|--------------------------------------------------------------------------
| Save Avatar
|--------------------------------------------------------------------------
*/

function storeAvatar(
    array $validatedAvatar
): string {
    $uploadDirectory =
        dirname(__DIR__) .
        DIRECTORY_SEPARATOR .
        'uploads' .
        DIRECTORY_SEPARATOR .
        'avatars';

    if (
        !is_dir(
            $uploadDirectory
        )
    ) {
        if (
            !mkdir(
                $uploadDirectory,
                0755,
                true
            ) &&
            !is_dir(
                $uploadDirectory
            )
        ) {
            jsonResponse(
                false,
                'Folder penyimpanan avatar tidak dapat dibuat.',
                null,
                500
            );
        }
    }

    $randomName =
        bin2hex(
            random_bytes(32)
        ) .
        '.' .
        $validatedAvatar['extension'];

    $targetPath =
        $uploadDirectory .
        DIRECTORY_SEPARATOR .
        $randomName;

    if (
        !move_uploaded_file(
            $validatedAvatar['tmp_name'],
            $targetPath
        )
    ) {
        jsonResponse(
            false,
            'Avatar gagal disimpan ke server.',
            null,
            500
        );
    }

    return
        'uploads/avatars/' .
        $randomName;
}

/*
|--------------------------------------------------------------------------
| Delete Old Avatar
|--------------------------------------------------------------------------
|
| Only delete filenames generated by this API.
|--------------------------------------------------------------------------
*/

function deleteOldAvatar(
    ?string $avatarPath
): void {
    if (
        !is_string($avatarPath) ||
        $avatarPath === ''
    ) {
        return;
    }

    if (
        !preg_match(
            '#^uploads/avatars/[a-f0-9]{64}\.(jpg|jpeg|png)$#i',
            $avatarPath
        )
    ) {
        return;
    }

    $absolutePath =
        dirname(__DIR__) .
        DIRECTORY_SEPARATOR .
        str_replace(
            '/',
            DIRECTORY_SEPARATOR,
            $avatarPath
        );

    if (
        is_file($absolutePath)
    ) {
        @unlink(
            $absolutePath
        );
    }
}

/*
|--------------------------------------------------------------------------
| Main Request
|--------------------------------------------------------------------------
*/

requirePost();

try {
    if (
        !isset($pdo) ||
        !($pdo instanceof PDO)
    ) {
        jsonResponse(
            false,
            'Database connection tidak tersedia.',
            null,
            500
        );
    }

    $adminUserId =
        requireAdmin($pdo);

    $action =
        trim(
            (string) (
                $_POST['action'] ?? ''
            )
        );

    /*
    |--------------------------------------------------------------------------
    | ME
    |--------------------------------------------------------------------------
    */

    if (
        $action === 'me'
    ) {
        $profile =
            fetchProfile(
                $pdo,
                $adminUserId
            );

        if (!$profile) {
            jsonResponse(
                false,
                'Profil administrator tidak ditemukan.',
                null,
                404
            );
        }

        jsonResponse(
            true,
            'Informasi akun berhasil diambil.',
            [
                'profile' =>
                $profile,

                'csrf_token' =>
                getCsrfToken(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LOGS
    |--------------------------------------------------------------------------
    */

    if (
        $action === 'logs'
    ) {
        jsonResponse(
            true,
            'Riwayat autentikasi berhasil diambil.',
            [
                'logs' =>
                fetchLogs(
                    $pdo,
                    $adminUserId
                ),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE ACCOUNT
    |--------------------------------------------------------------------------
    |
    | Supported:
    | - username
    | - password
    | - avatar
    |
    | display_name is intentionally NOT accepted.
    |--------------------------------------------------------------------------
    */

    if (
        $action ===
        'update_account'
    ) {
        requireCsrfToken();

        $requestedUsername =
            trim(
                (string) (
                    $_POST['username'] ?? ''
                )
            );

        $currentPassword =
            (string) (
                $_POST['current_password'] ??
                ''
            );

        $newPassword =
            (string) (
                $_POST['new_password'] ??
                ''
            );

        $hasUsernameChange =
            $requestedUsername !== '';

        $hasPasswordChange =
            $newPassword !== '';

        $hasAvatarChange =
            isset(
                $_FILES['avatar']
            ) &&
            is_array(
                $_FILES['avatar']
            );

        if (
            !$hasUsernameChange &&
            !$hasPasswordChange &&
            !$hasAvatarChange
        ) {
            jsonResponse(
                false,
                'Tidak ada perubahan yang dikirim.',
                null,
                422
            );
        }

        $validatedUsername =
            validateUsername(
                $requestedUsername
            );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | Always initialize this before the nested try/catch.
        |--------------------------------------------------------------------------
        */

        $newAvatarPath = null;

        /*
        |--------------------------------------------------------------------------
        | Transaction
        |--------------------------------------------------------------------------
        */

        $pdo->beginTransaction();

        try {
            /*
            |--------------------------------------------------------------------------
            | Lock Current User
            |--------------------------------------------------------------------------
            */

            $stmt =
                $pdo->prepare(
                    'SELECT
                        id,
                        username,
                        display_name,
                        avatar,
                        password_hash,
                        role,
                        status
                     FROM users
                     WHERE id = :id
                     LIMIT 1
                     FOR UPDATE'
                );

            $stmt->execute([
                'id' =>
                $adminUserId,
            ]);

            $currentUser =
                $stmt->fetch(
                    PDO::FETCH_ASSOC
                );

            if (!$currentUser) {
                throw new RuntimeException(
                    'Akun administrator tidak ditemukan.'
                );
            }

            if (
                (string) $currentUser['role'] !==
                'admin'
            ) {
                throw new RuntimeException(
                    'Akun tidak memiliki hak administrator.'
                );
            }

            if (
                (string) $currentUser['status'] !==
                'active'
            ) {
                throw new RuntimeException(
                    'Akun administrator tidak aktif.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Verify Current Password
            |--------------------------------------------------------------------------
            |
            | Avatar-only changes do not require password.
            |--------------------------------------------------------------------------
            */

            if (
                $hasUsernameChange ||
                $hasPasswordChange
            ) {
                if (
                    $currentPassword === ''
                ) {
                    throw new InvalidArgumentException(
                        'Password saat ini wajib diisi untuk mengubah username atau password.'
                    );
                }

                $passwordValid =
                    password_verify(
                        $currentPassword,
                        (string) $currentUser['password_hash']
                    );

                if (!$passwordValid) {
                    throw new InvalidArgumentException(
                        'Password saat ini salah.'
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Username
            |--------------------------------------------------------------------------
            */

            if (
                $hasUsernameChange
            ) {
                if (
                    $validatedUsername ===
                    (string) $currentUser['username']
                ) {
                    throw new InvalidArgumentException(
                        'Username baru sama dengan username saat ini.'
                    );
                }

                $stmt =
                    $pdo->prepare(
                        'SELECT id
                         FROM users
                         WHERE username = :username
                           AND id <> :id
                         LIMIT 1'
                    );

                $stmt->execute([
                    'username' =>
                    $validatedUsername,

                    'id' =>
                    $adminUserId,
                ]);

                if (
                    $stmt->fetchColumn()
                ) {
                    throw new InvalidArgumentException(
                        'Username sudah digunakan.'
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Password
            |--------------------------------------------------------------------------
            */

            if (
                $hasPasswordChange
            ) {
                if (
                    strlen(
                        $newPassword
                    ) < 8
                ) {
                    throw new InvalidArgumentException(
                        'Password baru minimal 8 karakter.'
                    );
                }

                if (
                    strlen(
                        $newPassword
                    ) > 255
                ) {
                    throw new InvalidArgumentException(
                        'Password baru terlalu panjang.'
                    );
                }

                if (
                    password_verify(
                        $newPassword,
                        (string) $currentUser['password_hash']
                    )
                ) {
                    throw new InvalidArgumentException(
                        'Password baru harus berbeda dari password saat ini.'
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Avatar
            |--------------------------------------------------------------------------
            */

            if (
                $hasAvatarChange
            ) {
                $validatedAvatar =
                    validateAvatarUpload(
                        $_FILES['avatar']
                    );

                $newAvatarPath =
                    storeAvatar(
                        $validatedAvatar
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Build UPDATE
            |--------------------------------------------------------------------------
            |
            | Only whitelisted fields are accepted.
            |
            | display_name,
            | role,
            | status,
            | password_hash,
            | etc.
            | cannot be injected from the request.
            |--------------------------------------------------------------------------
            */

            $updates = [];

            $params = [
                'id' =>
                $adminUserId,
            ];

            if (
                $hasUsernameChange
            ) {
                $updates[] =
                    'username = :username';

                $params['username'] =
                    $validatedUsername;
            }

            if (
                $hasPasswordChange
            ) {
                $updates[] =
                    'password_hash = :password_hash';

                $updates[] =
                    'password_changed_at = NOW()';

                $params['password_hash'] =
                    password_hash(
                        $newPassword,
                        PASSWORD_DEFAULT
                    );
            }

            if (
                $newAvatarPath !== null
            ) {
                $updates[] =
                    'avatar = :avatar';

                $params['avatar'] =
                    $newAvatarPath;
            }

            $updates[] =
                'updated_at = NOW()';

            $sql =
                'UPDATE users
                 SET ' .
                implode(
                    ', ',
                    $updates
                ) .
                '
                 WHERE id = :id';

            $stmt =
                $pdo->prepare(
                    $sql
                );

            $stmt->execute(
                $params
            );

            /*
            |--------------------------------------------------------------------------
            | Audit Password Change
            |--------------------------------------------------------------------------
            */

            if (
                $hasPasswordChange
            ) {
                writeAuthLog(
                    $pdo,
                    $adminUserId,
                    'password_changed',
                    true
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Regenerate Session
            |--------------------------------------------------------------------------
            */

            if (
                $hasUsernameChange ||
                $hasPasswordChange
            ) {
                session_regenerate_id(
                    true
                );

                $_SESSION['admin_logged_in'] = true;

                $_SESSION['admin_user_id'] =
                    $adminUserId;

                $_SESSION['admin_username'] =
                    $hasUsernameChange
                    ? $validatedUsername
                    : (string) $currentUser['username'];

                $_SESSION['admin_role'] =
                    'admin';
            }

            /*
            |--------------------------------------------------------------------------
            | Rotate CSRF
            |--------------------------------------------------------------------------
            */

            $newCsrfToken =
                bin2hex(
                    random_bytes(32)
                );

            $_SESSION['admin_csrf_token'] =
                $newCsrfToken;

            /*
            |--------------------------------------------------------------------------
            | Commit
            |--------------------------------------------------------------------------
            */

            $pdo->commit();

            /*
            |--------------------------------------------------------------------------
            | Delete Old Avatar
            |--------------------------------------------------------------------------
            |
            | Only after DB commit.
            |--------------------------------------------------------------------------
            */

            if (
                $newAvatarPath !== null &&
                !empty($currentUser['avatar'])
            ) {
                deleteOldAvatar(
                    (string) $currentUser['avatar']
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Fetch Updated Profile
            |--------------------------------------------------------------------------
            */

            $updatedProfile =
                fetchProfile(
                    $pdo,
                    $adminUserId
                );

            if (
                !$updatedProfile
            ) {
                jsonResponse(
                    false,
                    'Profil berhasil diubah tetapi tidak dapat dibaca kembali.',
                    null,
                    500
                );
            }

            jsonResponse(
                true,
                'Perubahan akun berhasil disimpan.',
                [
                    'profile' =>
                    $updatedProfile,

                    'csrf_token' =>
                    $newCsrfToken,
                ]
            );
        } catch (
            InvalidArgumentException $e
        ) {
            /*
            |--------------------------------------------------------------------------
            | Delete newly uploaded avatar if DB update failed.
            |--------------------------------------------------------------------------
            */

            if (
                $newAvatarPath !== null
            ) {
                deleteOldAvatar(
                    $newAvatarPath
                );
            }

            if (
                $pdo->inTransaction()
            ) {
                $pdo->rollBack();
            }

            jsonResponse(
                false,
                $e->getMessage(),
                null,
                422
            );
        } catch (
            Throwable $e
        ) {
            /*
            |--------------------------------------------------------------------------
            | Delete newly uploaded avatar if something unexpected failed.
            |--------------------------------------------------------------------------
            */

            if (
                $newAvatarPath !== null
            ) {
                deleteOldAvatar(
                    $newAvatarPath
                );
            }

            if (
                $pdo->inTransaction()
            ) {
                $pdo->rollBack();
            }

            error_log(
                'admin_account update_account error: ' .
                    $e->getMessage()
            );

            jsonResponse(
                false,
                'Perubahan akun gagal disimpan.',
                null,
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
        'Action tidak dikenal.',
        null,
        400
    );
} catch (
    Throwable $e
) {
    error_log(
        'admin_account.php error: ' .
            $e->getMessage()
    );

    jsonResponse(
        false,
        'Terjadi kesalahan pada server.',
        null,
        500
    );
}
