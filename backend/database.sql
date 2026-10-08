CREATE DATABASE IF NOT EXISTS xeoo_tools_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE xeoo_tools_db;


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('admin') NOT NULL DEFAULT 'admin',

    status ENUM('active', 'disabled')
        NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- CATEGORIES
-- =========================================================

CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL DEFAULT '',
    icon VARCHAR(50) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================================
-- TOOLS
-- =========================================================

CREATE TABLE IF NOT EXISTS tools (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    category_id INT UNSIGNED NOT NULL,

    name VARCHAR(150) NOT NULL,

    slug VARCHAR(150) NOT NULL,

    description VARCHAR(255) NOT NULL DEFAULT '',

    icon VARCHAR(50) NOT NULL DEFAULT '',

    status ENUM('ready', 'maintenance')
        NOT NULL DEFAULT 'ready',

    sort_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_tool_slug (slug),

    INDEX idx_tools_category (category_id),

    INDEX idx_tools_status (status),

    CONSTRAINT fk_tools_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================================
-- CATEGORIES
-- =========================================================

INSERT INTO categories
    (name, slug, description, icon, sort_order)
VALUES

(
    'Math Tools',
    'math',
    'Calculator and mathematical utilities.',
    'calculator',
    1
),

(
    'Psikologi Tools',
    'psychology',
    'Simple psychology and self-assessment tools.',
    'brain',
    2
),

(
    'Law Tools',
    'law',
    'Useful tools related to law and legal calculations.',
    'scale',
    3
),

(
    'Health Tools',
    'health',
    'Simple tools for everyday health calculations.',
    'heart-pulse',
    4
),

(
    'Network Tools',
    'network',
    'Network and internet diagnostic utilities.',
    'network',
    5
),

(
    'Security Tools',
    'security',
    'Security utilities and generators.',
    'shield-check',
    6
),

(
    'Image Tools',
    'image',
    'Resize, compress and convert images.',
    'image',
    7
),

(
    'File Tools',
    'file',
    'Utilities for managing and compressing files.',
    'file-archive',
    8
),

(
    'Encoding / Decoding',
    'encoding',
    'Encode and decode common data formats.',
    'binary',
    9
),

(
    'SEO Tools',
    'seo',
    'Simple tools for website SEO optimization.',
    'search',
    10
),

(
    'Defacement Tools',
    'defacement',
    'Fun hacking and defacement simulations.',
    'skull',
    11
),

(
    'Code Tools',
    'code',
    'Developer utilities for everyday coding tasks.',
    'code',
    12
);


-- =========================================================
-- INITIAL TOOLS
-- =========================================================

INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Calculator',
    'calculator',
    'Simple and fast calculator for everyday calculations.',
    'calculator',
    'ready',
    1
FROM categories
WHERE slug = 'math';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Percentage Calculator',
    'percentage-calculator',
    'Calculate percentages quickly and easily.',
    'percent',
    'ready',
    2
FROM categories
WHERE slug = 'math';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Image Compressor',
    'image-compressor',
    'Reduce image file size while keeping good quality.',
    'image-down',
    'ready',
    1
FROM categories
WHERE slug = 'image';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Image Resizer',
    'image-resizer',
    'Resize images to the dimensions you need.',
    'scan',
    'ready',
    2
FROM categories
WHERE slug = 'image';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'IP Lookup',
    'ip-lookup',
    'Check public IP information and network details.',
    'network',
    'ready',
    1
FROM categories
WHERE slug = 'network';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'DNS Lookup',
    'dns-lookup',
    'Lookup DNS records for a domain.',
    'globe',
    'maintenance',
    2
FROM categories
WHERE slug = 'network';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Password Generator',
    'password-generator',
    'Generate secure random passwords quickly.',
    'key-round',
    'ready',
    1
FROM categories
WHERE slug = 'security';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Hash Generator',
    'hash-generator',
    'Generate hashes from text input.',
    'hash',
    'maintenance',
    2
FROM categories
WHERE slug = 'security';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Base64 Encoder',
    'base64',
    'Encode and decode Base64 text easily.',
    'binary',
    'ready',
    1
FROM categories
WHERE slug = 'encoding';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'JSON Formatter',
    'json-formatter',
    'Format and organize JSON data instantly.',
    'braces',
    'ready',
    1
FROM categories
WHERE slug = 'code';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'BMI Calculator',
    'bmi-calculator',
    'Calculate your body mass index.',
    'heart-pulse',
    'maintenance',
    1
FROM categories
WHERE slug = 'health';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Meta Tag Analyzer',
    'meta-tag-analyzer',
    'Analyze HTML meta tags, headings, Open Graph, and page SEO health.',
    'search',
    'ready',
    2
FROM categories
WHERE slug = 'seo';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'SERP Snippet Preview',
    'serp-snippet-preview',
    'Live desktop and mobile search engine result snippet preview simulation.',
    'search',
    'ready',
    3
FROM categories
WHERE slug = 'seo';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Robots.txt Generator',
    'robots-txt-generator',
    'Build and validate robots.txt crawler directives with presets.',
    'file',
    'ready',
    4
FROM categories
WHERE slug = 'seo';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Sitemap Generator',
    'sitemap-generator',
    'Generate standard XML sitemaps with frequency and priority tags.',
    'file',
    'ready',
    5
FROM categories
WHERE slug = 'seo';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Open Graph Checker',
    'open-graph-checker',
    'Validate Open Graph and Twitter Card tags with social share preview.',
    'globe',
    'ready',
    6
FROM categories
WHERE slug = 'seo';


INSERT INTO tools
    (category_id, name, slug, description, icon, status, sort_order)

SELECT
    id,
    'Schema Markup Generator',
    'schema-markup-generator',
    'Create JSON-LD structured data for Articles, FAQs, Local Business, and more.',
    'code',
    'ready',
    7
FROM categories
WHERE slug = 'seo';