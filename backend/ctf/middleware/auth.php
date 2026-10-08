<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

/**
 * Resolve authenticated CTF player from session cookie or header
 */
function getAuthenticatedCtfUser(): ?array {
    global $pdo;

    $sessionToken = $_COOKIE[CTF_COOKIE_NAME] ?? null;

    if (!$sessionToken) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            $sessionToken = $matches[1];
        }
    }

    if (!$sessionToken || strlen($sessionToken) < 32) {
        return null;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT s.id AS session_id, s.session_token, s.expires_at,
                   u.id AS user_id, u.username, u.email, u.country_code,
                   u.is_banned, u.ban_reason, u.created_at AS user_created_at
            FROM ctf_sessions s
            INNER JOIN ctf_users u ON s.user_id = u.id
            WHERE s.session_token = ?
            LIMIT 1
        ");
        $stmt->execute([$sessionToken]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        // Check session expiration
        if (strtotime($row['expires_at']) <= time()) {
            $delStmt = $pdo->prepare("DELETE FROM ctf_sessions WHERE id = ?");
            $delStmt->execute([$row['session_id']]);
            return null;
        }

        // Check ban status
        if ((int)$row['is_banned'] === 1) {
            // Invalidate all active sessions for this banned user
            $delStmt = $pdo->prepare("DELETE FROM ctf_sessions WHERE user_id = ?");
            $delStmt->execute([$row['user_id']]);

            logSecurityEvent((int)$row['user_id'], 'BANNED_USER_BLOCKED', $_SERVER['REQUEST_URI'] ?? '', [
                'reason' => $row['ban_reason'],
            ]);

            jsonError(
                "Your account has been suspended: " . ($row['ban_reason'] ?: "Violation of CTF rules."),
                403,
                'ACCOUNT_BANNED',
                "Access to the CTF arena has been revoked by administration."
            );
        }

        // Update session last active time periodically (throttled)
        $pdo->prepare("UPDATE ctf_sessions SET last_active_at = NOW() WHERE id = ?")->execute([$row['session_id']]);

        return $row;
    } catch (Throwable $e) {
        error_log("[CTF_AUTH_ERROR] " . $e->getMessage());
        return null;
    }
}

/**
 * Middleware: Strictly require authenticated CTF player
 */
function requireCtfAuth(): array {
    $user = getAuthenticatedCtfUser();
    if (!$user) {
        jsonError("Authentication required to access this resource.", 401, 'UNAUTHENTICATED');
    }
    return $user;
}

