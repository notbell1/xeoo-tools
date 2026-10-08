<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

try {
    // 1. ctf_users
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_users (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(191) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            country_code VARCHAR(10) NOT NULL DEFAULT 'ID',
            is_banned TINYINT(1) NOT NULL DEFAULT 0,
            ban_reason VARCHAR(255) NULL,
            banned_at DATETIME NULL,
            banned_by INT UNSIGNED NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_ctf_users_username (username),
            INDEX idx_ctf_users_email (email),
            INDEX idx_ctf_users_banned (is_banned)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 2. ctf_sessions
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_sessions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            session_token VARCHAR(128) NOT NULL UNIQUE,
            ip_address VARCHAR(45) NULL,
            user_agent VARCHAR(255) NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_ctf_sessions_token (session_token),
            INDEX idx_ctf_sessions_user (user_id),
            INDEX idx_ctf_sessions_expires (expires_at),
            CONSTRAINT fk_ctf_sessions_user FOREIGN KEY (user_id) REFERENCES ctf_users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 3. password_reset_tokens
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            token_hash VARCHAR(128) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_pwd_reset_token (token_hash),
            INDEX idx_pwd_reset_user (user_id),
            CONSTRAINT fk_pwd_reset_user FOREIGN KEY (user_id) REFERENCES ctf_users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 4. ctfs
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctfs (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT NULL,
            status ENUM('active', 'upcoming', 'archived') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 5. ctf_challenges
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_challenges (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            ctf_id INT UNSIGNED NULL,
            slug VARCHAR(100) NOT NULL UNIQUE,
            title VARCHAR(150) NOT NULL,
            category VARCHAR(100) NOT NULL DEFAULT 'Web Forensics',
            difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy',
            points INT UNSIGNED NOT NULL DEFAULT 100,
            estimated_minutes INT UNSIGNED NOT NULL DEFAULT 10,
            case_reference VARCHAR(50) NOT NULL,
            scenario TEXT NOT NULL,
            objective TEXT NOT NULL,
            flag_hash VARCHAR(255) NOT NULL,
            flag_format VARCHAR(50) NOT NULL DEFAULT 'XEOO{...}',
            status ENUM('draft', 'published', 'disabled') NOT NULL DEFAULT 'published',
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_challenges_status (status),
            INDEX idx_challenges_difficulty (difficulty),
            INDEX idx_challenges_slug (slug),
            CONSTRAINT fk_challenges_ctf FOREIGN KEY (ctf_id) REFERENCES ctfs(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 6. ctf_artifacts
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_artifacts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            challenge_id INT UNSIGNED NOT NULL,
            artifact_uid VARCHAR(100) NOT NULL,
            name VARCHAR(150) NOT NULL,
            type ENUM('html', 'css', 'javascript', 'image', 'json', 'text', 'metadata') NOT NULL,
            role ENUM('primary', 'supporting', 'confirmation', 'decoy') NOT NULL DEFAULT 'primary',
            content MEDIUMTEXT NOT NULL,
            metadata_json JSON NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_artifacts_challenge (challenge_id),
            CONSTRAINT fk_artifacts_challenge FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 7. ctf_stages
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_stages (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            challenge_id INT UNSIGNED NOT NULL,
            stage_uid VARCHAR(100) NOT NULL,
            title VARCHAR(150) NOT NULL,
            objective TEXT NOT NULL,
            clue TEXT NULL,
            observation TEXT NULL,
            extraction_method TEXT NULL,
            interpretation TEXT NULL,
            next_action TEXT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_stages_challenge (challenge_id),
            CONSTRAINT fk_stages_challenge FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 8. ctf_evidence_relations
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_evidence_relations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            challenge_id INT UNSIGNED NOT NULL,
            from_node VARCHAR(100) NOT NULL,
            to_node VARCHAR(100) NOT NULL,
            relationship ENUM('references', 'confirms', 'indexes', 'explains', 'correlates', 'transforms') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_relations_challenge (challenge_id),
            CONSTRAINT fk_relations_challenge FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 9. ctf_hints
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_hints (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            challenge_id INT UNSIGNED NOT NULL,
            title VARCHAR(150) NOT NULL,
            hint_text TEXT NOT NULL,
            cost INT UNSIGNED NOT NULL DEFAULT 0,
            sort_order INT NOT NULL DEFAULT 0,
            INDEX idx_hints_challenge (challenge_id),
            CONSTRAINT fk_hints_challenge FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 10. ctf_unlocked_hints
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_unlocked_hints (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            hint_id INT UNSIGNED NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_hint (user_id, hint_id),
            CONSTRAINT fk_unlocked_user FOREIGN KEY (user_id) REFERENCES ctf_users(id) ON DELETE CASCADE,
            CONSTRAINT fk_unlocked_hint FOREIGN KEY (hint_id) REFERENCES ctf_hints(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 11. ctf_attempts
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_attempts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            challenge_id INT UNSIGNED NOT NULL,
            submitted_flag_preview VARCHAR(128) NOT NULL,
            is_correct TINYINT(1) NOT NULL DEFAULT 0,
            ip_address VARCHAR(45) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_attempts_user_challenge (user_id, challenge_id),
            CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES ctf_users(id) ON DELETE CASCADE,
            CONSTRAINT fk_attempts_challenge FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 12. ctf_submissions (Official solve records)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_submissions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            challenge_id INT UNSIGNED NOT NULL,
            points_awarded INT UNSIGNED NOT NULL,
            solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_solved_challenge (user_id, challenge_id),
            INDEX idx_submissions_user (user_id),
            INDEX idx_submissions_challenge (challenge_id),
            INDEX idx_submissions_solved_at (solved_at),
            CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES ctf_users(id) ON DELETE CASCADE,
            CONSTRAINT fk_submissions_challenge FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 13. ctf_score_adjustments
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_score_adjustments (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            amount INT NOT NULL,
            reason VARCHAR(255) NOT NULL,
            created_by VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_adjustments_user (user_id),
            CONSTRAINT fk_adjustments_user FOREIGN KEY (user_id) REFERENCES ctf_users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 14. ctf_security_events
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_security_events (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NULL,
            event_type VARCHAR(64) NOT NULL,
            ip_address VARCHAR(45) NULL,
            endpoint VARCHAR(255) NOT NULL,
            details JSON NULL,
            sarcastic_note VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sec_events_type (event_type),
            INDEX idx_sec_events_ip (ip_address),
            INDEX idx_sec_events_created (created_at),
            CONSTRAINT fk_sec_events_user FOREIGN KEY (user_id) REFERENCES ctf_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 15. ctf_audit_logs
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_audit_logs (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            actor_username VARCHAR(100) NOT NULL,
            action VARCHAR(64) NOT NULL,
            target_type VARCHAR(64) NOT NULL,
            target_id VARCHAR(64) NULL,
            old_value JSON NULL,
            new_value JSON NULL,
            reason VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_audit_action (action),
            INDEX idx_audit_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 16. ctf_settings
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ctf_settings (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(64) NOT NULL UNIQUE,
            setting_value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed default settings
    $defaultSettings = [
        'ctf_enabled' => '1',
        'registration_enabled' => '1',
        'login_enabled' => '1',
        'password_reset_enabled' => '1',
        'submissions_enabled' => '1',
        'leaderboard_enabled' => '1',
        'maintenance_mode' => '0',
        'maintenance_message' => 'XeooTools Defacement CTF is temporarily offline for scheduled system updates.',
        'soon_message' => 'New Defacement CTF seasons and investigation cases are in preparation.',
    ];

    $stmtSetting = $pdo->prepare("
        INSERT INTO ctf_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");

    foreach ($defaultSettings as $key => $val) {
        $stmtSetting->execute([$key, $val]);
    }

    // Seed primary CTF event
    $pdo->exec("
        INSERT INTO ctfs (title, slug, description, status)
        VALUES ('Defacement Forensics — Season 1', 'defacement-season-1', 'Cybersecurity incident investigation and forensic challenge arena.', 'active')
        ON DUPLICATE KEY UPDATE title = VALUES(title);
    ");

    echo "SUCCESS: CTF database tables initialized successfully.\n";
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
