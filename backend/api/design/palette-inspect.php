<?php

declare(strict_types=1);

session_start();

/*
|--------------------------------------------------------------------------
| CORS & Headers
|--------------------------------------------------------------------------
*/
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://5nc6c83n-5173.asse.devtunnels.ms',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../seo/ssrf-helper.php';

function jsonResp(bool $success, string $message, mixed $data = null, int $code = 200): never
{
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// 1. Parse Input URL
$input = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawBody = file_get_contents('php://input');
    if ($rawBody) {
        $json = json_decode($rawBody, true);
        if (is_array($json) && !empty($json['url'])) {
            $input = (string) $json['url'];
        } elseif (is_array($json) && !empty($json['targetUrl'])) {
            $input = (string) $json['targetUrl'];
        }
    }
    if ($input === '' && !empty($_POST['url'])) {
        $input = (string) $_POST['url'];
    } elseif ($input === '' && !empty($_POST['targetUrl'])) {
        $input = (string) $_POST['targetUrl'];
    }
} else {
    $input = (string) ($_GET['url'] ?? $_GET['targetUrl'] ?? '');
}

$normalizedUrl = normalizeTargetUrl($input);
if (!$normalizedUrl) {
    jsonResp(false, 'Please provide a valid website URL (HTTP/HTTPS only).', null, 422);
}

// 2. Fetch HTML safely via SSRF-safe fetcher
$fetchResult = fetchPublicHtml($normalizedUrl);
if (!$fetchResult['success']) {
    jsonResp(false, $fetchResult['error'] ?: 'Could not access the target URL.', null, 400);
}

$html = $fetchResult['html'];
$finalUrl = $fetchResult['final_url'];
$parsedBase = parse_url($finalUrl);
$baseOrigin = ($parsedBase['scheme'] ?? 'https') . '://' . ($parsedBase['host'] ?? '');

// 3. Extract Stylesheets & Inline CSS
$combinedCss = '';

// Extract all <style> tags
if (preg_match_all('/<style\b[^>]*>(.*?)<\/style>/is', $html, $styleMatches)) {
    foreach ($styleMatches[1] as $inlineStyle) {
        $combinedCss .= "\n" . $inlineStyle;
    }
}

// Extract inline style="..." attributes from HTML tags
if (preg_match_all('/\bstyle=(["\'])(.*?)\1/is', $html, $attrMatches)) {
    foreach ($attrMatches[2] as $attrStyle) {
        $combinedCss .= "\n* { " . $attrStyle . " }";
    }
}

// Extract linked stylesheets (up to 4 stylesheets to avoid excessive network calls)
if (preg_match_all('/<link\b[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']/is', $html, $linkMatches) ||
    preg_match_all('/<link\b[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']stylesheet["\']/is', $html, $linkMatches)) {
    $linkedHrefs = array_unique($linkMatches[1]);
    $cssFetchCount = 0;

    foreach ($linkedHrefs as $href) {
        if ($cssFetchCount >= 4) {
            break;
        }

        // Resolve absolute URL
        $cssUrl = '';
        if (str_starts_with($href, '//')) {
            $cssUrl = ($parsedBase['scheme'] ?? 'https') . ':' . $href;
        } elseif (str_starts_with($href, 'http://') || str_starts_with($href, 'https://')) {
            $cssUrl = $href;
        } elseif (str_starts_with($href, '/')) {
            $cssUrl = $baseOrigin . $href;
        } else {
            $pathDir = dirname($parsedBase['path'] ?? '/');
            if ($pathDir === '\\' || $pathDir === '.') {
                $pathDir = '/';
            }
            $cssUrl = $baseOrigin . rtrim($pathDir, '/') . '/' . $href;
        }

        $cssValidation = validatePublicUrl($cssUrl);
        if ($cssValidation['valid']) {
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $cssUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 2,
                CURLOPT_TIMEOUT => 4,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) XeooTools-Design-Inspector/1.0',
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ]);
            $cssContent = curl_exec($ch);
            $cssHttp = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($cssHttp === 200 && is_string($cssContent) && strlen($cssContent) < 500000) {
                $combinedCss .= "\n" . $cssContent;
                $cssFetchCount++;
            }
        }
    }
}

// 4. Color Normalization Helper Functions
function rgbToHex(int $r, int $g, int $b): string
{
    return sprintf('#%02x%02x%02x', max(0, min(255, $r)), max(0, min(255, $g)), max(0, min(255, $b)));
}

function hexToRgb(string $hex): array
{
    $hex = ltrim($hex, '#');
    if (strlen($hex) === 3) {
        $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));
    return ['r' => (int) $r, 'g' => (int) $g, 'b' => (int) $b];
}

function rgbToHsl(int $r, int $g, int $b): array
{
    $r /= 255;
    $g /= 255;
    $b /= 255;

    $max = max($r, $g, $b);
    $min = min($r, $g, $b);
    $l = ($max + $min) / 2;

    if ($max === $min) {
        $h = 0;
        $s = 0;
    } else {
        $d = $max - $min;
        $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
        switch ($max) {
            case $r:
                $h = ($g - $b) / $d + ($g < $b ? 6 : 0);
                break;
            case $g:
                $h = ($b - $r) / $d + 2;
                break;
            default:
                $h = ($r - $g) / $d + 4;
                break;
        }
        $h /= 6;
    }

    return [
        'h' => (int) round($h * 360),
        's' => (int) round($s * 100),
        'l' => (int) round($l * 100),
    ];
}

$namedColors = [
    'black' => '#000000', 'white' => '#ffffff', 'red' => '#ff0000', 'blue' => '#0000ff',
    'green' => '#008000', 'yellow' => '#ffff00', 'purple' => '#800080', 'gray' => '#808080',
    'grey' => '#808080', 'silver' => '#c0c0c0', 'navy' => '#000080', 'teal' => '#008080',
    'orange' => '#ffa500', 'maroon' => '#800000', 'olive' => '#808000', 'aqua' => '#00ffff',
    'cyan' => '#00ffff', 'fuchsia' => '#ff00ff', 'magenta' => '#ff00ff', 'lime' => '#00ff00',
    'indigo' => '#4b0082', 'coral' => '#ff7f50', 'gold' => '#ffd700', 'crimson' => '#dc143c',
];

// 5. Extract Colors & Track Context
$colorCounts = [];
$roleHints = [
    'background' => [],
    'surface' => [],
    'text' => [],
    'primary' => [],
    'border' => [],
    'accent' => [],
];

// Match CSS properties and values: property: value
if (preg_match_all('/([a-z0-9_-]+)\s*:\s*([^;}{]+)/i', $combinedCss, $ruleMatches, PREG_SET_ORDER)) {
    foreach ($ruleMatches as $rule) {
        $prop = strtolower(trim($rule[1]));
        $val = trim($rule[2]);

        // Find HEX colors (#fff, #ffffff, #ffffff80)
        if (preg_match_all('/#([a-f0-9]{3,8})\b/i', $val, $hexMatches)) {
            foreach ($hexMatches[0] as $rawHex) {
                $rawHex = strtolower($rawHex);
                // standard 6-char hex
                if (strlen($rawHex) === 4) {
                    $stdHex = '#' . $rawHex[1] . $rawHex[1] . $rawHex[2] . $rawHex[2] . $rawHex[3] . $rawHex[3];
                } elseif (strlen($rawHex) === 7) {
                    $stdHex = $rawHex;
                } elseif (strlen($rawHex) === 9) {
                    $stdHex = substr($rawHex, 0, 7);
                } else {
                    continue;
                }

                $colorCounts[$stdHex] = ($colorCounts[$stdHex] ?? 0) + 1;
                recordRoleHint($prop, $stdHex, $roleHints);
            }
        }

        // Find rgb/rgba colors
        if (preg_match_all('/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i', $val, $rgbMatches, PREG_SET_ORDER)) {
            foreach ($rgbMatches as $m) {
                $stdHex = rgbToHex((int) $m[1], (int) $m[2], (int) $m[3]);
                $colorCounts[$stdHex] = ($colorCounts[$stdHex] ?? 0) + 1;
                recordRoleHint($prop, $stdHex, $roleHints);
            }
        }

        // Find hsl/hsla colors
        if (preg_match_all('/hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%/i', $val, $hslMatches, PREG_SET_ORDER)) {
            foreach ($hslMatches as $m) {
                $h = (int) $m[1] / 360;
                $s = (int) $m[2] / 100;
                $l = (int) $m[3] / 100;
                $rgb = hslToRgb($h, $s, $l);
                $stdHex = rgbToHex($rgb['r'], $rgb['g'], $rgb['b']);
                $colorCounts[$stdHex] = ($colorCounts[$stdHex] ?? 0) + 1;
                recordRoleHint($prop, $stdHex, $roleHints);
            }
        }
    }
}

function hslToRgb(float $h, float $s, float $l): array
{
    if ($s == 0) {
        $val = (int) round($l * 255);
        return ['r' => $val, 'g' => $val, 'b' => $val];
    }
    $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
    $p = 2 * $l - $q;
    $r = (int) round(hueToRgb($p, $q, $h + 1 / 3) * 255);
    $g = (int) round(hueToRgb($p, $q, $h) * 255);
    $b = (int) round(hueToRgb($p, $q, $h - 1 / 3) * 255);
    return ['r' => $r, 'g' => $g, 'b' => $b];
}

function hueToRgb(float $p, float $q, float $t): float
{
    if ($t < 0) $t += 1;
    if ($t > 1) $t -= 1;
    if ($t < 1 / 6) return $p + ($q - $p) * 6 * $t;
    if ($t < 1 / 2) return $q;
    if ($t < 2 / 3) return $p + ($q - $p) * (2 / 3 - $t) * 6;
    return $p;
}

function recordRoleHint(string $prop, string $hex, array &$roleHints): void
{
    if (str_contains($prop, 'background') || str_contains($prop, 'bg')) {
        $roleHints['background'][$hex] = ($roleHints['background'][$hex] ?? 0) + 1;
    } elseif ($prop === 'color' || str_contains($prop, 'text')) {
        $roleHints['text'][$hex] = ($roleHints['text'][$hex] ?? 0) + 1;
    } elseif (str_contains($prop, 'border') || str_contains($prop, 'outline')) {
        $roleHints['border'][$hex] = ($roleHints['border'][$hex] ?? 0) + 1;
    } elseif (str_contains($prop, 'primary') || str_contains($prop, 'accent') || str_contains($prop, 'btn')) {
        $roleHints['primary'][$hex] = ($roleHints['primary'][$hex] ?? 0) + 1;
    }
}

// 6. Extract CSS Variables (--primary, --background, etc.)
$cssVariables = [];
if (preg_match_all('/(--[a-zA-Z0-9_-]+)\s*:\s*([^;}{]+);/i', $combinedCss, $varMatches, PREG_SET_ORDER)) {
    foreach ($varMatches as $vm) {
        $varName = trim($vm[1]);
        $varVal = trim($vm[2]);
        if (strlen($varVal) < 60 && !isset($cssVariables[$varName])) {
            $cssVariables[$varName] = $varVal;
            // If it's a color variable, hint primary/accent
            if (preg_match('/#([a-f0-9]{3,6})/i', $varVal, $mHex)) {
                $hexVal = strtolower($mHex[0]);
                if (str_contains($varName, 'primary')) {
                    $roleHints['primary'][$hexVal] = ($roleHints['primary'][$hexVal] ?? 0) + 5;
                }
            }
        }
    }
}

// 7. Extract Typography & Common Styling Tokens
$fontFamilies = [];
if (preg_match_all('/font-family\s*:\s*([^;}{]+);/i', $combinedCss, $fontMatches)) {
    foreach ($fontMatches[1] as $ff) {
        $clean = trim($ff, "'\" ");
        if (strlen($clean) < 80 && !in_array($clean, $fontFamilies, true)) {
            $fontFamilies[] = $clean;
        }
    }
}

$borderRadii = [];
if (preg_match_all('/border-radius\s*:\s*([^;}{]+);/i', $combinedCss, $radiusMatches)) {
    foreach ($radiusMatches[1] as $br) {
        $clean = trim($br);
        if (strlen($clean) < 40 && !in_array($clean, $borderRadii, true)) {
            $borderRadii[] = $clean;
        }
    }
}

$boxShadows = [];
if (preg_match_all('/box-shadow\s*:\s*([^;}{]+);/i', $combinedCss, $shadowMatches)) {
    foreach ($shadowMatches[1] as $bs) {
        $clean = trim($bs);
        if ($clean !== 'none' && strlen($clean) < 120 && !in_array($clean, $boxShadows, true)) {
            $boxShadows[] = $clean;
        }
    }
}

// 8. Calculate Color Weights & Ranks
arsort($colorCounts);
$totalOccurrences = array_sum($colorCounts);

$mainPalette = [];
$rank = 1;
foreach ($colorCounts as $hex => $count) {
    if ($rank > 32) {
        break; // Keep top 32 colors
    }
    $rgb = hexToRgb($hex);
    $hsl = rgbToHsl($rgb['r'], $rgb['g'], $rgb['b']);
    $weight = $totalOccurrences > 0 ? round(($count / $totalOccurrences) * 100, 1) : 0;

    $mainPalette[] = [
        'rank' => $rank++,
        'hex' => strtoupper($hex),
        'rgb' => "rgb({$rgb['r']}, {$rgb['g']}, {$rgb['b']})",
        'hsl' => "hsl({$hsl['h']}, {$hsl['s']}%, {$hsl['l']}%)",
        'rgb_values' => $rgb,
        'hsl_values' => $hsl,
        'usage_count' => $count,
        'weight_percent' => $weight,
    ];
}

// 9. Infer UI Colors / Semantic Roles
function pickTopRoleColor(array $hints): ?string
{
    if (empty($hints)) {
        return null;
    }
    arsort($hints);
    return strtoupper((string) array_key_first($hints));
}

$uiRoles = [
    'likely_background' => pickTopRoleColor($roleHints['background']),
    'likely_text' => pickTopRoleColor($roleHints['text']),
    'likely_border' => pickTopRoleColor($roleHints['border']),
    'likely_primary' => pickTopRoleColor($roleHints['primary']),
];

// Fallback inference if empty
if (!$uiRoles['likely_background'] && !empty($mainPalette)) {
    // Pick highest lightness or most frequent white/light
    foreach ($mainPalette as $p) {
        if ($p['hsl_values']['l'] >= 85) {
            $uiRoles['likely_background'] = $p['hex'];
            break;
        }
    }
    if (!$uiRoles['likely_background']) {
        $uiRoles['likely_background'] = $mainPalette[0]['hex'] ?? '#FFFFFF';
    }
}

if (!$uiRoles['likely_text'] && !empty($mainPalette)) {
    // Pick dark color
    foreach ($mainPalette as $p) {
        if ($p['hsl_values']['l'] <= 25) {
            $uiRoles['likely_text'] = $p['hex'];
            break;
        }
    }
    if (!$uiRoles['likely_text']) {
        $uiRoles['likely_text'] = '#111827';
    }
}

if (!$uiRoles['likely_primary'] && !empty($mainPalette)) {
    // Pick highest saturation color with medium lightness
    $bestScore = -1;
    $bestHex = null;
    foreach ($mainPalette as $p) {
        $s = $p['hsl_values']['s'];
        $l = $p['hsl_values']['l'];
        if ($s > 25 && $l >= 20 && $l <= 80) {
            if ($s > $bestScore) {
                $bestScore = $s;
                $bestHex = $p['hex'];
            }
        }
    }
    $uiRoles['likely_primary'] = $bestHex ?? ($mainPalette[1]['hex'] ?? '#3B82F6');
}

// Response
jsonResp(true, 'Website styling and color palette analyzed successfully.', [
    'url' => $input,
    'final_url' => $finalUrl,
    'total_colors_detected' => count($colorCounts),
    'main_palette' => $mainPalette,
    'ui_roles' => $uiRoles,
    'css_variables' => array_slice($cssVariables, 0, 30),
    'typography_styles' => [
        'font_families' => array_slice($fontFamilies, 0, 6),
        'border_radii' => array_slice($borderRadii, 0, 8),
        'box_shadows' => array_slice($boxShadows, 0, 6),
    ],
    'note' => 'Color Weight is calculated based on detected color declarations and style occurrences in accessible HTML/CSS, not rendered screen pixels.',
]);

