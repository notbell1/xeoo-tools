<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';

header('Location: ' . getAppUrl('/not-found'), true, 302);
exit;
