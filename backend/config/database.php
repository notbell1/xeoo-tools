<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

$envPath = dirname(__DIR__, 2) . '/.env';

loadEnv($envPath);

$dbHost = env('DB_HOST', '127.0.0.1');
$dbPort = env('DB_PORT', '3306');
$dbName = env('DB_NAME', 'xeoo_tools_db');
$dbUser = env('DB_USER', 'root');
$dbPassword = env('DB_PASSWORD', '');

$dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";

try {
    $pdo = new PDO(
        $dsn,
        $dbUser,
        $dbPassword,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);

    exit('Database connection failed.');
}