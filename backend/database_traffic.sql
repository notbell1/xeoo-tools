-- =========================================================
-- XEOOTOOLS - TRAFFIC ANALYTICS DATABASE SCHEMA
-- =========================================================

USE xeoo_tools_db;

-- 1. Raw Page Views (3-Month Retention)
CREATE TABLE IF NOT EXISTS traffic_pageviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    visitor_id VARCHAR(64) NOT NULL,
    path VARCHAR(255) NOT NULL,
    page_title VARCHAR(150) NULL,
    page_type ENUM('tool', 'category', 'home', 'directory', 'other') NOT NULL DEFAULT 'other',
    tool_id INT UNSIGNED NULL,
    category_id INT UNSIGNED NULL,
    device_type ENUM('desktop', 'tablet', 'mobile', 'unknown') NOT NULL DEFAULT 'unknown',
    browser VARCHAR(50) NOT NULL DEFAULT 'Unknown',
    os VARCHAR(50) NOT NULL DEFAULT 'Unknown',
    referrer_type ENUM('direct', 'search', 'referral', 'campaign', 'unknown') NOT NULL DEFAULT 'unknown',
    referrer_host VARCHAR(150) NULL,
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_traffic_created_at (created_at),
    INDEX idx_traffic_visitor_date (visitor_id, created_at),
    INDEX idx_traffic_tool_id (tool_id, created_at),
    INDEX idx_traffic_page_type (page_type, created_at),
    INDEX idx_traffic_path (path(191), created_at),
    CONSTRAINT fk_traffic_tool FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_traffic_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Daily Summary Statistics (Permanent Historical Retention)
CREATE TABLE IF NOT EXISTS traffic_daily_stats (
    date DATE PRIMARY KEY,
    total_pageviews INT UNSIGNED NOT NULL DEFAULT 0,
    unique_visitors INT UNSIGNED NOT NULL DEFAULT 0,
    tool_pageviews INT UNSIGNED NOT NULL DEFAULT 0,
    desktop_views INT UNSIGNED NOT NULL DEFAULT 0,
    mobile_views INT UNSIGNED NOT NULL DEFAULT 0,
    tablet_views INT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Daily Tool Popularity (Permanent Historical Retention)
CREATE TABLE IF NOT EXISTS traffic_daily_tool_stats (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    tool_id INT UNSIGNED NOT NULL,
    pageviews INT UNSIGNED NOT NULL DEFAULT 0,
    unique_visitors INT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_date_tool (date, tool_id),
    INDEX idx_tool_date (tool_id, date),
    INDEX idx_date (date),
    CONSTRAINT fk_daily_tool FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

