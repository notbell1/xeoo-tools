<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Simple .env loader
|--------------------------------------------------------------------------
| XeooTools dibuat tanpa dependency tambahan agar mudah di-host
| pada shared hosting.
|--------------------------------------------------------------------------
*/

function loadEnv(string $path): void
{
    if (!file_exists($path)) {
        throw new RuntimeException(
            'File .env tidak ditemukan: ' . $path
        );
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if ($lines === false) {
        throw new RuntimeException('Gagal membaca file .env');
    }

    foreach ($lines as $line) {
        $line = trim($line);

        // Skip komentar
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        $parts = explode('=', $line, 2);

        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);

        // Hapus quote jika ada
        if (
            strlen($value) >= 2 &&
            (
                ($value[0] === '"' && $value[strlen($value) - 1] === '"') ||
                ($value[0] === "'" && $value[strlen($value) - 1] === "'")
            )
        ) {
            $value = substr($value, 1, -1);
        }

        $_ENV[$key] = $value;
        putenv($key . '=' . $value);
    }
}


function env(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? getenv($key);

    if ($value === false || $value === null) {
        return $default;
    }

    return (string) $value;
}