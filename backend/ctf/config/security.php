<?php

declare(strict_types=1);

// CTF Security Configuration
const CTF_COOKIE_NAME = 'XEOO_CTF_SESSION';
const CTF_SESSION_LIFETIME = 604800; // 7 days in seconds
const CTF_CSRF_HEADER = 'HTTP_X_CTF_CSRF_TOKEN';

// Sarcastic security responses for malicious / tampering actions
function getSarcasticSecurityMessage(string $type): string {
    $messages = [
        'SQLI_SUSPECTED' => [
            "Nice try. The database does not accept creative writing.",
            "Burp detected. Unfortunately, authorization still happens server-side.",
            "SQL injection? In prepared statements? Better luck in 2005.",
        ],
        'PARAMETER_TAMPERING' => [
            "That parameter was never yours to modify.",
            "Changing the score in your browser does not change the server-side score.",
            "Tampering detected. Your browser is not the source of truth.",
        ],
        'RATE_LIMIT' => [
            "Congratulations. You discovered the rate limiter.",
            "Too fast! Even automated security scanners take a coffee break.",
            "Request rate exceeded. Please slow down and analyze calmly.",
        ],
        'AUTH_BYPASS' => [
            "Trying to bypass authentication? The backend has seen this trick before.",
            "Unauthorized. Even your exploit could not find a backdoor here.",
        ],
        'IDOR_DENIED' => [
            "Access denied. That resource belongs to another investigator.",
            "Nice attempt at IDOR traversal, but data ownership is strictly validated.",
        ],
    ];

    $list = $messages[$type] ?? ["Security anomaly detected. Request has been safely handled."];
    return $list[array_rand($list)];
}

