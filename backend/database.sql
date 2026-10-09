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
    status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    color VARCHAR(30) NOT NULL DEFAULT 'blue',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    status ENUM('ready', 'maintenance', 'upcoming') NOT NULL DEFAULT 'ready',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tool_slug (slug),
    INDEX idx_tools_category (category_id),
    INDEX idx_tools_status (status),
    CONSTRAINT fk_tools_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================================
-- CATEGORIES DATA
-- =========================================================

INSERT INTO categories (id, name, slug, description, icon, color, sort_order) VALUES
(1, 'Math Tools', 'math', 'Calculator and mathematical utilities.', 'calculator', 'violet', 1),
(2, 'Psychology Tools', 'psychology-tools', 'Psychological self-assessments, relational patterns, and mindset tools.', 'brain', 'purple', 2),
(4, 'Health Tools', 'health', 'Simple tools for everyday health calculations.', 'heart-pulse', 'rose', 4),
(5, 'Network Tools', 'network', 'Network and internet diagnostic utilities.', 'network', 'cyan', 5),
(6, 'Security Tools', 'security', 'Security utilities and generators.', 'shield-check', 'emerald', 6),
(7, 'Image Tools', 'image', 'Resize, compress and convert images.', 'image', 'pink', 7),
(8, 'File Tools', 'file', 'Utilities for managing and compressing files.', 'file-archive', 'blue', 8),
(10, 'SEO Tools', 'seo', 'Simple tools for website SEO optimization.', 'seo', 'amber', 10),
(11, 'Defacement Tools', 'defacement', 'Fun hacking and defacement simulations.', 'defacement', 'red', 11),
(15, 'Productive Tools', 'productive-tools', 'Tools to boost everyday productivity and speed.', 'users', 'slate', 15),
(26, 'AI Tools', 'ai', 'AI utilities for prompts, token usage, model configuration, structured outputs, and AI workflow planning.', 'sparkles', 'sky', 16),
(27, 'Law Tools', 'law', 'Useful tools related to law and legal calculations.', 'law', 'slate', 3),
(28, 'Encoding / Decoding', 'encoding', 'Encode and decode common data formats.', 'encoding', 'orange', 9),
(29, 'Code Tools', 'code', 'Developer utilities for everyday coding tasks.', 'code', 'indigo', 12),
(55, 'Design Tools', 'design', 'Color palettes, CSS generators, contrast analysis, and design system utilities.', 'palette', 'fuchsia', 17)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), icon=VALUES(icon), color=VALUES(color), sort_order=VALUES(sort_order);

-- =========================================================
-- TOOLS DATA
-- =========================================================

INSERT INTO tools (id, category_id, name, slug, description, icon, status, sort_order) VALUES
(1, 1, 'Calculator', 'calculator', 'Practical and scientific calculator', 'calculator', 'ready', 1),
(2, 1, 'Percentage Calculator', 'percentage-calculator', 'Calculate percentages and discounts', 'percent', 'ready', 2),
(3, 7, 'Image Compressor', 'image-compressor', 'Compress photo and image file sizes', 'image', 'ready', 1),
(4, 7, 'Image Resizer', 'image-resizer', 'Change image resolution and dimensions', 'scan-line', 'ready', 2),
(5, 5, 'IP Lookup', 'ip-lookup', 'Check IP address details and location', 'network', 'ready', 1),
(6, 5, 'DNS Lookup', 'dns-lookup', 'Check domain DNS records', 'globe', 'ready', 2),
(7, 6, 'Password Generator', 'password-generator', 'Generate strong random passwords', 'key-round', 'ready', 1),
(13, 15, 'Typing Test', 'typing-test', 'Test your typing speed in WPM', 'brain', 'ready', 0),
(14, 15, 'QR & Barcode Generator', 'qr-barcode-generator', 'Create custom QR codes and standard barcodes', 'qr-code', 'ready', 0),
(15, 6, 'Scam Link Checker', 'scam-link-checker', 'Check suspicious links, phishing, and scam URLs', 'shield-alert', 'upcoming', 0),
(18, 2, 'Big Five Personality Test', 'big-five-personality-test', 'Assess five major personality traits', 'brain', 'ready', 0),
(19, 2, 'Stress Level Test', 'stress-level-test', 'Evaluate your current stress score', 'heart-pulse', 'ready', 0),
(20, 2, 'Procrastination Test', 'procrastination-test', 'Measure chronic procrastination habits', 'clock', 'ready', 0),
(21, 2, 'Cognitive Distortion Checker', 'cognitive-distortion-checker', 'Identify negative thought patterns', 'sparkles', 'ready', 0),
(22, 2, 'Attachment Style Test', 'attachment-style-test', 'Discover your relationship attachment style', 'users', 'ready', 0),
(23, 11, 'Deface Page Generator', 'deface-page-generator', 'Generate creative deface page simulations', 'skull', 'ready', 0),
(24, 11, 'Defacement Template Builder', 'defacement-template-builder', 'Interactive builder for custom deface templates', 'code-2', 'ready', 0),
(25, 4, 'BMI Calculator', 'bmi-calculator', 'Calculate body mass index and category', 'scale', 'ready', 0),
(26, 4, 'Calorie & Macro Calculator', 'calorie-macro-calculator', 'Calculate daily calorie and macronutrient targets', 'utensils', 'ready', 0),
(27, 4, 'Heart Rate Zone Calculator', 'heart-rate-zone-calculator', 'Calculate training heart rate training zones', 'heart', 'ready', 0),
(28, 4, 'Sleep Calculator', 'sleep-calculator', 'Calculate optimal sleep and wake up times', 'moon', 'ready', 0),
(29, 4, 'Daily Health Metrics Tracker', 'daily-health-metrics-tracker', 'Log and monitor daily health habits', 'activity', 'ready', 0),
(30, 8, 'File Encryptor', 'file-encryptor', 'Secure client-side AES-256-GCM file encryption', 'lock-keyhole', 'ready', 2),
(31, 7, 'Image Converter', 'image-converter', 'Convert images between formats locally', 'refresh-cw', 'ready', 0),
(32, 7, 'Image Metadata Viewer', 'image-metadata-viewer', 'Inspect EXIF and metadata information', 'file-search', 'ready', 0),
(33, 6, 'WordPress Exposure Scanner', 'wordpress-exposure-scanner', 'Detect exposed WordPress upload and file-manager endpoints', 'security', 'ready', 0),
(34, 6, 'Admin Finder', 'admin-finder', 'Discover publicly reachable administration and authentication surfaces', 'search', 'ready', 0),
(36, 5, 'Reverse IP Lookup', 'reverse-ip-lookup', 'Find domains and hostnames associated with an IP address', 'network', 'ready', 0),
(38, 8, 'ZIP Inspector', 'zip-inspector', 'Inspect ZIP archive structure, files, and security metadata', 'file-archive', 'ready', 1),
(40, 10, 'DA / PA Checker', 'da-pa-checker', 'Check Domain Authority and Page Authority metrics', 'search', 'upcoming', 0),
(41, 10, 'Backlink Checker', 'backlink-checker', 'Backlink Checker', 'globe', 'upcoming', 0),
(42, 10, 'SERP Checker', 'serp-checker', 'SERP Checker', 'globe', 'upcoming', 0),
(43, 10, 'Broken Link Checker', 'broken-link-checker', 'Broken Link Checker', 'globe', 'upcoming', 0),
(44, 6, 'Subdomain Scanner', 'subdomain-scanner', 'Discover public subdomains and validate their DNS records', 'network', 'ready', 0),
(45, 6, 'Password Strength Checker', 'password-strength-checker', 'Analyze password complexity, entropy, and crack time', 'security', 'ready', 2),
(46, 6, 'Hash Generator', 'hash-generator', 'Generate cryptographic hashes like SHA-256, SHA-512, MD5', 'hash', 'ready', 3),
(47, 6, 'Hash Identifier', 'hash-identifier', 'Identify cryptographic hash algorithm by length and format', 'search', 'ready', 4),
(48, 6, 'JWT Decoder', 'jwt-decoder', 'Decode and inspect JSON Web Tokens safely in browser', 'key-round', 'ready', 5),
(49, 6, 'Random Token Generator', 'random-token-generator', 'Generate cryptographically secure tokens and secret keys', 'binary', 'ready', 6),
(50, 6, 'UUID Generator', 'uuid-generator', 'Generate RFC 4122 compliant version 4 UUIDs', 'hash', 'ready', 7),
(51, 8, 'File Hash Checker', 'file-hash-checker', 'Calculate SHA-256, SHA-512, MD5 checksums locally', 'hash', 'ready', 7),
(54, 8, 'File Compressor', 'file-compressor', 'Compress and bundle files into a ZIP archive locally', 'file-archive', 'ready', 3),
(55, 8, 'File Extractor', 'file-extractor', 'Extract and download files from ZIP archives client-side', 'file-archive', 'ready', 4),
(56, 8, 'File Splitter', 'file-splitter', 'Split large files into smaller parts client-side', 'file', 'ready', 5),
(57, 8, 'File Merger', 'file-merger', 'Combine split chunks back into original file', 'file', 'ready', 6),
(59, 8, 'File Integrity Checker', 'file-integrity-checker', 'Verify file authenticity and check for corruption or tampering', 'file', 'ready', 8),
(60, 8, 'File Type Identifier', 'file-type-identifier', 'Detect authentic file formats using magic bytes', 'search', 'ready', 9),
(61, 8, 'File Signature Analyzer', 'file-signature-analyzer', 'Inspect hexadecimal and ASCII header bytes', 'code', 'ready', 10),
(62, 8, 'File Metadata Viewer', 'file-metadata-viewer', 'Inspect standard and extended file properties client-side', 'file', 'ready', 11),
(63, 8, 'Metadata Remover', 'metadata-remover', 'Strip EXIF, location tags, and metadata client-side', 'file', 'ready', 12),
(64, 11, 'Defacement CTF', 'defacement-ctf', 'Create and investigate browser-first web defacement CTF forensic challenges', 'shield-alert', 'ready', 3),
(65, 10, 'Meta Tag Analyzer', 'meta-tag-analyzer', 'Inspect on-page HTML metadata, title tags, descriptions, Open Graph, and social previews', 'search', 'ready', 2),
(66, 10, 'SERP Snippet Preview', 'serp-snippet-preview', 'Simulate and optimize desktop and mobile Google Search results snippets in real time', 'search', 'ready', 3),
(67, 10, 'Robots.txt Generator', 'robots-txt-generator', 'Generate compliant robots.txt directives for search crawlers and AI bots with instant syntax preview', 'file-text', 'ready', 4),
(68, 10, 'Sitemap Generator', 'sitemap-generator', 'Build XML sitemaps for search engine indexing with automated crawler and frequency controls', 'file-text', 'ready', 5),
(69, 10, 'Open Graph Checker', 'open-graph-checker', 'Validate Open Graph and Twitter Card tags to ensure attractive social media previews', 'globe-2', 'ready', 6),
(70, 10, 'Schema Markup Generator', 'schema-markup-generator', 'Generate JSON-LD structured data for Articles, FAQs, Local Businesses, Products, and Organizations', 'code-2', 'ready', 7),
(73, 1, 'Fraction Calculator', 'fraction-calculator', 'Add, subtract, multiply, and divide fractions', 'divide', 'ready', 3),
(74, 1, 'Ratio Calculator', 'ratio-calculator', 'Simplify and solve proportional ratios', 'scale', 'ready', 4),
(75, 1, 'Average Calculator', 'average-calculator', 'Compute mean, median, mode, and range', 'trending-up', 'ready', 5),
(76, 1, 'GCD & LCM Calculator', 'gcd-lcm-calculator', 'Find greatest common divisor and least common multiple', 'hash', 'ready', 6),
(77, 1, 'Prime Number Checker', 'prime-number-checker', 'Test primality and find divisor properties', 'shield-check', 'ready', 7),
(78, 1, 'Prime Factorization', 'prime-factorization', 'Decompose integers into prime factor powers', 'sparkles', 'ready', 8),
(79, 1, 'Factorial Calculator', 'factorial-calculator', 'Calculate factorials (n!) with high precision', 'sparkles', 'ready', 9),
(80, 1, 'Exponent Calculator', 'exponent-calculator', 'Compute power and exponential expressions', 'calculator', 'ready', 10),
(81, 1, 'Square Root Calculator', 'square-root-calculator', 'Find square roots and simplified radicals', 'calculator', 'ready', 11),
(82, 1, 'Linear Equation Solver', 'linear-equation-solver', 'Solve linear equations of the form Ax + B = C', 'calculator', 'ready', 12),
(83, 1, 'Quadratic Equation Solver', 'quadratic-equation-solver', 'Find real and complex quadratic roots (ax² + bx + c = 0)', 'calculator', 'ready', 13),
(84, 1, 'Pythagorean Calculator', 'pythagorean-calculator', 'Calculate hypotenuse and legs of right triangles', 'triangle', 'ready', 14),
(85, 1, 'Area Calculator', 'area-calculator', 'Calculate surface area of 2D geometric shapes', 'square', 'ready', 15),
(86, 1, 'Perimeter Calculator', 'perimeter-calculator', 'Calculate perimeter and circumference of 2D shapes', 'ruler', 'ready', 16),
(87, 1, 'Volume Calculator', 'volume-calculator', 'Compute 3D volume and surface area of solids', 'box', 'ready', 17),
(119, 2, 'Relationship Pattern Analyzer', 'relationship-pattern-analyzer', 'Analyze your communication and relationship dynamics', 'heart-handshake', 'ready', 49),
(120, 2, 'Emotional Regulation Analyzer', 'emotional-regulation-analyzer', 'Evaluate strategies for processing and regulating emotions', 'brain-circuit', 'ready', 50),
(121, 2, 'Conflict Style Analyzer', 'conflict-style-analyzer', 'Discover your approach to interpersonal disagreements', 'scale', 'ready', 51),
(122, 2, 'Decision-Making Style Test', 'decision-making-style-test', 'Assess rational, intuitive, and collaborative decision styles', 'compass', 'ready', 52),
(123, 2, 'Boundary Awareness Test', 'boundary-awareness-test', 'Evaluate personal limits, energy protection, and assertiveness', 'shield-check', 'ready', 53),
(124, 2, 'Self-Talk Analyzer', 'self-talk-analyzer', 'Analyze inner dialogue patterns and self-compassion', 'message-square-quote', 'ready', 54),
(125, 2, 'Coping Style Analyzer', 'coping-style-analyzer', 'Explore resilience and adaptive mechanisms in crisis', 'life-buoy', 'ready', 55),
(126, 2, 'Emotional Awareness Test', 'emotional-awareness-test', 'Measure emotional granularity and bodily attunement', 'eye', 'ready', 56),
(127, 2, 'Interpersonal Communication Analyzer', 'interpersonal-communication-analyzer', 'Assess listening, clarity, and conversational patterns', 'messages-square', 'ready', 57),
(128, 2, 'Personal Values Explorer', 'personal-values-explorer', 'Identify core guiding life values and alignment', 'gem', 'ready', 58),
(131, 11, 'Defacement Challenge Generator', 'defacement-challenge-generator', 'Create and investigate browser-first web defacement CTF forensic challenges', 'shield-alert', 'ready', 61),
(151, 26, 'Prompt Optimizer', 'prompt-optimizer', 'Improve prompt structure, clarity, constraints, and output instructions', 'wand-2', 'ready', 81),
(152, 26, 'Prompt Template Builder', 'prompt-template-builder', 'Create reusable AI prompt templates with customizable variables', 'file-code', 'ready', 82),
(153, 26, 'Prompt Formatter', 'prompt-formatter', 'Clean and structure messy prompts without changing their meaning', 'align-left', 'ready', 83),
(154, 26, 'AI Token Counter', 'ai-token-counter', 'Estimate token usage and analyze AI text statistics', 'binary', 'ready', 84),
(155, 26, 'AI Cost Calculator', 'ai-cost-calculator', 'Estimate AI API costs from token usage and model pricing', 'dollar-sign', 'ready', 85),
(156, 26, 'System Prompt Builder', 'system-prompt-builder', 'Build structured system instructions for AI behavior and responses', 'shield', 'ready', 86),
(157, 26, 'AI Model Parameter Explorer', 'ai-model-parameter-explorer', 'Explore common AI generation parameters and their practical effects', 'sliders', 'ready', 87),
(158, 26, 'AI Output Evaluator', 'ai-output-evaluator', 'Evaluate AI responses against custom rules and quality criteria', 'list-check', 'ready', 88),
(159, 26, 'AI Context Window Calculator', 'ai-context-window-calculator', 'Calculate context usage, reserved output, and remaining capacity', 'gauge', 'ready', 89),
(160, 26, 'AI JSON Schema Prompt Builder', 'ai-json-schema-prompt-builder', 'Build structured JSON-output prompts and JSON schemas for AI workflows', 'braces', 'ready', 90),
(341, 55, 'Palette Inspect', 'palette-inspect', 'Extract color palettes, CSS variables, and styling tokens from any public website URL', 'palette', 'ready', 91),
(342, 55, 'Color Converter', 'color-converter', 'Convert color codes seamlessly across HEX, RGB, HSL, HSV, and CMYK formats', 'palette', 'ready', 92),
(343, 55, 'Color Harmony Generator', 'color-harmony-generator', 'Generate complementary, analogous, triadic, split-complementary, and tetradic color harmonies', 'sparkles', 'ready', 93),
(344, 55, 'Gradient Generator', 'gradient-generator', 'Create custom CSS linear and radial gradients with color stops and angle controls', 'paintbrush', 'ready', 94),
(345, 55, 'Contrast Checker', 'contrast-checker', 'Test color contrast against WCAG 2.1 AA and AAA accessibility standards', 'contrast', 'ready', 95),
(346, 55, 'CSS Shadow Generator', 'css-shadow-generator', 'Configure custom multi-layer box shadows with live interactive preview and CSS output', 'box', 'ready', 96),
(347, 55, 'CSS Border Radius Generator', 'css-border-radius-generator', 'Design custom 8-point and 4-corner CSS border radius shapes visually', 'square', 'ready', 97),
(348, 55, 'Glassmorphism Generator', 'glassmorphism-generator', 'Generate modern frosted-glass CSS effects using backdrop-filter blur and transparency', 'layers', 'ready', 98),
(349, 55, 'CSS Filter Generator', 'css-filter-generator', 'Adjust and preview CSS image filters including blur, brightness, contrast, and saturation', 'sliders', 'ready', 99),
(350, 55, 'Typography Scale Generator', 'typography-scale-generator', 'Calculate modular typography scales with PX, REM, and CSS variables for design systems', 'type', 'ready', 100)
ON DUPLICATE KEY UPDATE name=VALUES(name), category_id=VALUES(category_id), description=VALUES(description), icon=VALUES(icon), status=VALUES(status), sort_order=VALUES(sort_order);

-- =========================================================
-- TRAFFIC ANALYTICS TABLES
-- =========================================================

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

