<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$isAllowedOrigin =
    $origin !== '' &&
    (
        preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin) === 1 ||
        str_contains($origin, 'devtunnels.ms') ||
        str_contains($origin, 'site.je')
    );

if ($isAllowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once __DIR__ . '/ssrf-helper.php';

function jsonResponse(bool $success, string $message = '', mixed $data = null, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(false, 'Method not allowed. Use POST.', null, 405);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || trim($rawBody) === '') {
    jsonResponse(false, 'Request body is empty.', null, 400);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    jsonResponse(false, 'Invalid JSON body.', null, 400);
}

$rawUrl = isset($payload['url']) && is_string($payload['url']) ? trim($payload['url']) : '';
if ($rawUrl === '') {
    jsonResponse(false, 'Please provide a valid website URL or domain.', null, 422);
}

$normalizedUrl = normalizeTargetUrl($rawUrl);
if ($normalizedUrl === null) {
    jsonResponse(false, 'Invalid URL format. Please enter a valid website address.', null, 422);
}

// Fetch HTML securely
$fetchResult = fetchPublicHtml($normalizedUrl);
if (!$fetchResult['success']) {
    jsonResponse(false, $fetchResult['error'], null, 422);
}

$html = $fetchResult['html'];
$httpCode = $fetchResult['http_code'];
$finalUrl = $fetchResult['final_url'];

// Parse HTML using DOMDocument
$dom = new DOMDocument();
libxml_use_internal_errors(true);
// Use mb_convert_encoding to prevent charset issues
$convertedHtml = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
@$dom->loadHTML($convertedHtml);
libxml_clear_errors();

$xpath = new DOMXPath($dom);

// 1. Basic SEO Tags
$titleNode = $xpath->query('//title');
$title = $titleNode && $titleNode->length > 0 ? trim($titleNode->item(0)->textContent ?? '') : '';
$titleLen = mb_strlen($title);

$metaDescNode = $xpath->query('//meta[translate(@name, "DESCRIPTION", "description")="description"]/@content');
$metaDescription = $metaDescNode && $metaDescNode->length > 0 ? trim($metaDescNode->item(0)->nodeValue ?? '') : '';
$descLen = mb_strlen($metaDescription);

$robotsNode = $xpath->query('//meta[translate(@name, "ROBOTS", "robots")="robots"]/@content');
$metaRobots = $robotsNode && $robotsNode->length > 0 ? trim($robotsNode->item(0)->nodeValue ?? '') : '';

$canonicalNode = $xpath->query('//link[translate(@rel, "CANONICAL", "canonical")="canonical"]/@href');
$canonical = $canonicalNode && $canonicalNode->length > 0 ? trim($canonicalNode->item(0)->nodeValue ?? '') : '';

$htmlLangNode = $xpath->query('//html/@lang');
$htmlLang = $htmlLangNode && $htmlLangNode->length > 0 ? trim($htmlLangNode->item(0)->nodeValue ?? '') : '';

$charsetNode = $xpath->query('//meta[@charset]/@charset');
$charset = $charsetNode && $charsetNode->length > 0 ? trim($charsetNode->item(0)->nodeValue ?? '') : '';
if ($charset === '') {
    $httpEquivNode = $xpath->query('//meta[translate(@http-equiv, "CONTENT-TYPE", "content-type")="content-type"]/@content');
    if ($httpEquivNode && $httpEquivNode->length > 0) {
        $contentVal = $httpEquivNode->item(0)->nodeValue ?? '';
        if (preg_match('/charset=([a-zA-Z0-9_-]+)/i', $contentVal, $m)) {
            $charset = $m[1];
        }
    }
}

// 2. Headings
$h1Nodes = $xpath->query('//h1');
$h1Count = $h1Nodes ? $h1Nodes->length : 0;
$h1List = [];
if ($h1Nodes) {
    foreach ($h1Nodes as $h1) {
        $text = trim($h1->textContent ?? '');
        if ($text !== '') {
            $h1List[] = mb_substr($text, 0, 150);
        }
    }
}

$h2Nodes = $xpath->query('//h2');
$h2Count = $h2Nodes ? $h2Nodes->length : 0;

$h3Nodes = $xpath->query('//h3');
$h3Count = $h3Nodes ? $h3Nodes->length : 0;

// 3. Links
$linkNodes = $xpath->query('//a/@href');
$internalLinksCount = 0;
$externalLinksCount = 0;

$parsedHost = parse_url($finalUrl, PHP_URL_HOST);

if ($linkNodes) {
    foreach ($linkNodes as $lnk) {
        $href = trim($lnk->nodeValue ?? '');
        if ($href === '' || str_starts_with($href, '#') || str_starts_with($href, 'javascript:') || str_starts_with($href, 'mailto:') || str_starts_with($href, 'tel:')) {
            continue;
        }

        if (str_starts_with($href, '/') || !preg_match('#^https?://#i', $href)) {
            $internalLinksCount++;
        } else {
            $linkHost = parse_url($href, PHP_URL_HOST);
            if ($linkHost === $parsedHost || ($linkHost && str_ends_with($linkHost, '.' . $parsedHost))) {
                $internalLinksCount++;
            } else {
                $externalLinksCount++;
            }
        }
    }
}

// 4. Images
$imgNodes = $xpath->query('//img');
$totalImages = $imgNodes ? $imgNodes->length : 0;
$imagesWithAlt = 0;
$imagesWithoutAlt = 0;

if ($imgNodes) {
    foreach ($imgNodes as $img) {
        $alt = $img->getAttribute('alt');
        if (trim($alt) !== '') {
            $imagesWithAlt++;
        } else {
            $imagesWithoutAlt++;
        }
    }
}

// 5. Open Graph
$getMetaProp = function (string $property) use ($xpath): string {
    $node = $xpath->query('//meta[translate(@property, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="' . strtolower($property) . '"]/@content');
    return $node && $node->length > 0 ? trim($node->item(0)->nodeValue ?? '') : '';
};

$ogTitle = $getMetaProp('og:title');
$ogDescription = $getMetaProp('og:description');
$ogImage = $getMetaProp('og:image');
$ogUrl = $getMetaProp('og:url');
$ogType = $getMetaProp('og:type');

// 6. Twitter
$getMetaName = function (string $name) use ($xpath): string {
    $node = $xpath->query('//meta[translate(@name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="' . strtolower($name) . '"]/@content');
    return $node && $node->length > 0 ? trim($node->item(0)->nodeValue ?? '') : '';
};

$twitterCard = $getMetaName('twitter:card');
$twitterTitle = $getMetaName('twitter:title');
$twitterDesc = $getMetaName('twitter:description');
$twitterImage = $getMetaName('twitter:image');

// Calculate XeooTools SEO Check Score (Internal Benchmark, 0-100)
$score = 0;
$maxScore = 100;

// Title (max 20)
if ($titleLen >= 30 && $titleLen <= 65) {
    $score += 20;
} elseif ($titleLen > 0) {
    $score += 10;
}

// Description (max 20)
if ($descLen >= 70 && $descLen <= 165) {
    $score += 20;
} elseif ($descLen > 0) {
    $score += 10;
}

// Canonical (max 15)
if ($canonical !== '') {
    $score += 15;
}

// Headings / H1 (max 15)
if ($h1Count === 1) {
    $score += 15;
} elseif ($h1Count > 1) {
    $score += 8;
}

// Open Graph (max 15)
if ($ogTitle !== '' && $ogImage !== '') {
    $score += 15;
} elseif ($ogTitle !== '' || $ogImage !== '') {
    $score += 8;
}

// Image Alt (max 15)
if ($totalImages > 0) {
    $altRatio = $imagesWithAlt / $totalImages;
    $score += (int) round($altRatio * 15);
} else {
    // No images, grant baseline
    $score += 15;
}

$score = min(100, max(0, $score));

// Determine item statuses: Good | Warning | Missing
$titleStatus = 'Missing';
if ($titleLen > 0) {
    $titleStatus = ($titleLen >= 30 && $titleLen <= 65) ? 'Good' : 'Warning';
}

$descStatus = 'Missing';
if ($descLen > 0) {
    $descStatus = ($descLen >= 70 && $descLen <= 165) ? 'Good' : 'Warning';
}

$canonicalStatus = $canonical !== '' ? 'Good' : 'Warning';
$robotsStatus = $metaRobots !== '' ? 'Good' : 'Good'; // Default robots is index,follow
$langStatus = $htmlLang !== '' ? 'Good' : 'Warning';
$charsetStatus = $charset !== '' ? 'Good' : 'Warning';

$h1Status = 'Missing';
if ($h1Count === 1) {
    $h1Status = 'Good';
} elseif ($h1Count > 1) {
    $h1Status = 'Warning';
}

$imageStatus = 'Good';
if ($imagesWithoutAlt > 0) {
    $imageStatus = $imagesWithAlt === 0 ? 'Missing' : 'Warning';
}

$ogStatus = 'Missing';
if ($ogTitle !== '' && $ogImage !== '') {
    $ogStatus = 'Good';
} elseif ($ogTitle !== '' || $ogImage !== '') {
    $ogStatus = 'Warning';
}

$twitterStatus = 'Missing';
if ($twitterCard !== '' && ($twitterTitle !== '' || $twitterImage !== '')) {
    $twitterStatus = 'Good';
} elseif ($twitterCard !== '') {
    $twitterStatus = 'Warning';
}

$response = [
    'url' => $finalUrl,
    'http_code' => $httpCode,
    'seo_score' => $score,
    'score_label' => 'XeooTools SEO Check Score',
    'basic_seo' => [
        'title' => [
            'value' => $title,
            'length' => $titleLen,
            'status' => $titleStatus,
            'recommendation' => 'Recommended length: 30 - 65 characters.',
        ],
        'description' => [
            'value' => $metaDescription,
            'length' => $descLen,
            'status' => $descStatus,
            'recommendation' => 'Recommended length: 70 - 165 characters.',
        ],
        'robots' => [
            'value' => $metaRobots !== '' ? $metaRobots : 'Not specified (Defaults to index, follow)',
            'status' => $robotsStatus,
        ],
        'canonical' => [
            'value' => $canonical,
            'status' => $canonicalStatus,
        ],
        'language' => [
            'value' => $htmlLang,
            'status' => $langStatus,
        ],
        'charset' => [
            'value' => $charset,
            'status' => $charsetStatus,
        ],
    ],
    'headings' => [
        'h1_count' => $h1Count,
        'h1_items' => $h1List,
        'h1_status' => $h1Status,
        'h2_count' => $h2Count,
        'h3_count' => $h3Count,
    ],
    'links' => [
        'internal_count' => $internalLinksCount,
        'external_count' => $externalLinksCount,
        'total_count' => $internalLinksCount + $externalLinksCount,
    ],
    'images' => [
        'total' => $totalImages,
        'with_alt' => $imagesWithAlt,
        'without_alt' => $imagesWithoutAlt,
        'status' => $imageStatus,
    ],
    'open_graph' => [
        'status' => $ogStatus,
        'tags' => [
            'og:title' => $ogTitle,
            'og:description' => $ogDescription,
            'og:image' => $ogImage,
            'og:url' => $ogUrl,
            'og:type' => $ogType,
        ],
    ],
    'twitter' => [
        'status' => $twitterStatus,
        'tags' => [
            'twitter:card' => $twitterCard,
            'twitter:title' => $twitterTitle,
            'twitter:description' => $twitterDesc,
            'twitter:image' => $twitterImage,
        ],
    ],
];

jsonResponse(true, 'Meta tag analysis completed successfully.', $response);

