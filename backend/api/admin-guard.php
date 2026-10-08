<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| XeooTools Admin API Guard
|--------------------------------------------------------------------------
*/

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

/*
|--------------------------------------------------------------------------
| JSON Response Helper
|--------------------------------------------------------------------------
*/

function adminGuardResponse(
    bool $success,
    string $message,
    int $statusCode
): never {
    http_response_code($statusCode);

    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
        ],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );

    exit;
}

/*
|--------------------------------------------------------------------------
| Check Admin Session
|--------------------------------------------------------------------------
*/

function requireAdminApi(): void
{
    $loggedIn =
        isset($_SESSION['admin_logged_in']) &&
        $_SESSION['admin_logged_in'] === true;

    if (!$loggedIn) {
        adminGuardResponse(
            false,
            'Unauthorized. Admin login required.',
            401
        );
    }

    $role = (string) ($_SESSION['admin_role'] ?? '');

    if ($role !== 'admin') {
        adminGuardResponse(
            false,
            'Forbidden. Admin access required.',
            403
        );
    }

    $userId = (int) ($_SESSION['admin_user_id'] ?? 0);

    if ($userId <= 0) {
        adminGuardResponse(
            false,
            'Unauthorized. Invalid admin session.',
            401
        );
    }
}

/*
|--------------------------------------------------------------------------
| Automatically enforce admin access
|--------------------------------------------------------------------------
*/

requireAdminApi();