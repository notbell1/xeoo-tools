<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

$envFile = dirname(__DIR__, 2) . '/.env';
if (!file_exists($envFile)) {
    $envFile = dirname(__DIR__) . '/.env';
}
if (file_exists($envFile) && !getenv('IPINFO_TOKEN')) {
    loadEnv($envFile);
}

return [
    'token' => env('IPINFO_TOKEN', '84dd23e19579fd'),
];
