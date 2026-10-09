<?php

declare(strict_types=1);

require_once __DIR__ . '/config/database.php';

echo "============================================\n";
echo "   XEOOTOOLS DATABASE & ADMIN SYNC SCRIPT   \n";
echo "============================================\n\n";

try {
    $pdo->beginTransaction();

    // 1. Sync Categories
    $categoriesDefs = [
        [
            'name' => 'Math Tools',
            'slug' => 'math',
            'description' => 'Calculator and mathematical utilities.',
            'icon' => 'calculator',
            'color' => 'violet',
            'sort_order' => 1,
        ],
        [
            'name' => 'Psychology Tools',
            'slug' => 'psychology-tools',
            'description' => 'Psychological self-assessments, relational patterns, and mindset tools.',
            'icon' => 'brain',
            'color' => 'purple',
            'sort_order' => 2,
        ],
        [
            'name' => 'Health Tools',
            'slug' => 'health',
            'description' => 'Simple tools for everyday health calculations.',
            'icon' => 'heart-pulse',
            'color' => 'rose',
            'sort_order' => 4,
        ],
        [
            'name' => 'Network Tools',
            'slug' => 'network',
            'description' => 'Network and internet diagnostic utilities.',
            'icon' => 'network',
            'color' => 'cyan',
            'sort_order' => 5,
        ],
        [
            'name' => 'Security Tools',
            'slug' => 'security',
            'description' => 'Security utilities and generators.',
            'icon' => 'shield-check',
            'color' => 'emerald',
            'sort_order' => 6,
        ],
        [
            'name' => 'Image Tools',
            'slug' => 'image',
            'description' => 'Resize, compress and convert images.',
            'icon' => 'image',
            'color' => 'pink',
            'sort_order' => 7,
        ],
        [
            'name' => 'File Tools',
            'slug' => 'file',
            'description' => 'Utilities for managing and compressing files.',
            'icon' => 'file-archive',
            'color' => 'blue',
            'sort_order' => 8,
        ],
        [
            'name' => 'SEO Tools',
            'slug' => 'seo',
            'description' => 'Simple tools for website SEO optimization.',
            'icon' => 'seo',
            'color' => 'amber',
            'sort_order' => 10,
        ],
        [
            'name' => 'Defacement Tools',
            'slug' => 'defacement',
            'description' => 'Fun hacking and defacement simulations.',
            'icon' => 'defacement',
            'color' => 'red',
            'sort_order' => 11,
        ],
        [
            'name' => 'Productive Tools',
            'slug' => 'productive-tools',
            'description' => 'Tools to boost everyday productivity and speed.',
            'icon' => 'users',
            'color' => 'slate',
            'sort_order' => 15,
        ],
        [
            'name' => 'AI Tools',
            'slug' => 'ai',
            'description' => 'AI utilities for prompts, token usage, model configuration, structured outputs, and AI workflow planning.',
            'icon' => 'sparkles',
            'color' => 'sky',
            'sort_order' => 16,
        ],
        [
            'name' => 'Design Tools',
            'slug' => 'design',
            'description' => 'Color palettes, CSS generators, contrast analysis, and design system utilities.',
            'icon' => 'palette',
            'color' => 'fuchsia',
            'sort_order' => 17,
        ],
        [
            'name' => 'Law Tools',
            'slug' => 'law',
            'description' => 'Useful tools related to law and legal calculations.',
            'icon' => 'law',
            'color' => 'slate',
            'sort_order' => 3,
        ],
        [
            'name' => 'Encoding / Decoding',
            'slug' => 'encoding',
            'description' => 'Encode and decode common data formats.',
            'icon' => 'encoding',
            'color' => 'orange',
            'sort_order' => 9,
        ],
        [
            'name' => 'Code Tools',
            'slug' => 'code',
            'description' => 'Developer utilities for everyday coding tasks.',
            'icon' => 'code',
            'color' => 'indigo',
            'sort_order' => 12,
        ],
    ];

    $catStmt = $pdo->prepare(
        'INSERT INTO categories (name, slug, description, icon, color, sort_order)
         VALUES (:name, :slug, :description, :icon, :color, :sort_order)
         ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            icon = VALUES(icon),
            color = VALUES(color),
            sort_order = VALUES(sort_order)'
    );

    foreach ($categoriesDefs as $cat) {
        $catStmt->execute($cat);
    }
    echo "[✓] Categories synchronized successfully.\n";

    // Build category slug -> ID map
    $catMap = [];
    $rows = $pdo->query('SELECT id, slug FROM categories')->fetchAll();
    foreach ($rows as $r) {
        $catMap[$r['slug']] = (int) $r['id'];
    }
    // Aliases
    $catMap['productive'] = $catMap['productive-tools'] ?? 0;
    $catMap['psychology'] = $catMap['psychology-tools'] ?? 0;
    $catMap['ai-tools'] = $catMap['ai'] ?? 0;
    $catMap['design-tools'] = $catMap['design'] ?? 0;

    // 2. Parse defaultTools.ts
    $content = file_get_contents(dirname(__DIR__) . '/frontend/src/data/defaultTools.ts');
    preg_match_all(
        '/\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*icon:\s*"([^"]+)",\s*status:\s*"([^"]+)",\s*category_id:\s*(\d+),\s*category_name:\s*"([^"]+)",\s*category_slug:\s*"([^"]+)",?\s*\}/s',
        $content,
        $matches,
        PREG_SET_ORDER
    );

    $toolInsertStmt = $pdo->prepare(
        'INSERT INTO tools (category_id, name, slug, description, icon, status, sort_order)
         VALUES (:category_id, :name, :slug, :description, :icon, :status, :sort_order)
         ON DUPLICATE KEY UPDATE
            category_id = VALUES(category_id),
            name = VALUES(name),
            description = VALUES(description),
            icon = VALUES(icon)'
    );

    $insertedCount = 0;
    $updatedCount = 0;
    $sortOrder = 1;

    foreach ($matches as $m) {
        $name = $m[2];
        $slug = $m[3];
        $description = $m[4];
        $icon = $m[5];
        $status = in_array($m[6], ['ready', 'maintenance', 'upcoming'], true) ? $m[6] : 'ready';
        $catSlug = $m[9];

        $categoryId = $catMap[$catSlug] ?? 0;
        if ($categoryId <= 0) {
            echo "[-] Warning: Unknown category '{$catSlug}' for tool '{$slug}'\n";
            continue;
        }

        // Check if exists
        $check = $pdo->prepare('SELECT id FROM tools WHERE slug = :slug');
        $check->execute(['slug' => $slug]);
        $exists = $check->fetchColumn();

        $toolInsertStmt->execute([
            'category_id' => $categoryId,
            'name' => $name,
            'slug' => $slug,
            'description' => $description,
            'icon' => $icon,
            'status' => $status,
            'sort_order' => $sortOrder++,
        ]);

        if ($exists) {
            $updatedCount++;
        } else {
            $insertedCount++;
        }
    }

    $pdo->commit();

    echo "[✓] Tools synchronized: {$insertedCount} inserted, {$updatedCount} verified/updated.\n";

    // 3. Print Summary Stats
    $totalCategories = (int) $pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn();
    $totalTools = (int) $pdo->query('SELECT COUNT(*) FROM tools')->fetchColumn();
    $readyTools = (int) $pdo->query("SELECT COUNT(*) FROM tools WHERE status = 'ready'")->fetchColumn();
    $maintTools = (int) $pdo->query("SELECT COUNT(*) FROM tools WHERE status = 'maintenance'")->fetchColumn();
    $upcTools = (int) $pdo->query("SELECT COUNT(*) FROM tools WHERE status = 'upcoming'")->fetchColumn();

    echo "\n=== DATABASE SUMMARY ===\n";
    echo "Total Categories: {$totalCategories}\n";
    echo "Total Tools     : {$totalTools}\n";
    echo "  - Ready       : {$readyTools}\n";
    echo "  - Maintenance : {$maintTools}\n";
    echo "  - Upcoming    : {$upcTools}\n";
    echo "============================================\n";

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "[!] ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

