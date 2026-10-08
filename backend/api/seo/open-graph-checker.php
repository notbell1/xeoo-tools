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
$convertedHtml = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
@$dom->loadHTML($convertedHtml);
libxml_clear_errors();

$xpath = new DOMXPath($dom);

$getMetaProp = function (string $property) use ($xpath): string {
    $node = $xpath->query('//meta[translate(@property, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="' . strtolower($property) . '"]/@content');
    return $node && $node->length > 0 ? trim($node->item(0)->nodeValue ?? '') : '';
};

$getMetaName = function (string $name) use ($xpath): string {
    $node = $xpath->query('//meta[translate(@name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="' . strtolower($name) . '"]/@content');
    return $node && $node->length > 0 ? trim($node->item(0)->nodeValue ?? '') : '';
};

// Fallback to title and meta description if OG tags are missing
$titleNode = $xpath->query('//title');
$fallbackTitle = $titleNode && $titleNode->length > 0 ? trim($titleNode->item(0)->textContent ?? '') : '';

$descNode = $xpath->query('//meta[translate(@name, "DESCRIPTION", "description")="description"]/@content');
$fallbackDesc = $descNode && $descNode->length > 0 ? trim($descNode->item(0)->nodeValue ?? '') : '';

// 1. Open Graph Tags
$ogTitle = $getMetaProp('og:title');
$ogDescription = $getMetaProp('og:description');
$ogImage = $getMetaProp('og:image');
$ogUrl = $getMetaProp('og:url');
$ogType = $getMetaProp('og:type');
$ogSiteName = $getMetaProp('og:site_name');
$ogLocale = $getMetaProp('og:locale');
$ogImageWidth = $getMetaProp('og:image:width');
$ogImageHeight = $getMetaProp('og:image:height');
$ogImageAlt = $getMetaProp('og:image:alt');

// 2. Twitter Cards Tags
$twitterCard = $getMetaName('twitter:card');
$twitterTitle = $getMetaName('twitter:title');
$twitterDescription = $getMetaName('twitter:description');
$twitterImage = $getMetaName('twitter:image');
$twitterSite = $getMetaName('twitter:site');

// Resolve relative image URLs against finalUrl
$resolveUrl = function (string $url, string $baseUrl): string {
    if ($url === '' || preg_match('#^https?://#i', $url)) {
        return $url;
    }
    if (str_starts_with($url, '//')) {
        $scheme = parse_url($baseUrl, PHP_URL_SCHEME) ?: 'https';
        return $scheme . ':' . $url;
    }
    $baseParsed = parse_url($baseUrl);
    $scheme = $baseParsed['scheme'] ?? 'https';
    $host = $baseParsed['host'] ?? '';
    if (str_starts_with($url, '/')) {
        return $scheme . '://' . $host . $url;
    }
    $path = $baseParsed['path'] ?? '/';
    $dir = rtrim(dirname($path), '/\\');
    return $scheme . '://' . $host . ($dir !== '' ? $dir : '') . '/' . $url;
};

$resolvedOgImage = $resolveUrl($ogImage, $finalUrl);
$resolvedTwitterImage = $resolveUrl($twitterImage, $finalUrl);

// Build structured response
$tags = [
    [
        'property' => 'og:title',
        'value' => $ogTitle,
        'status' => $ogTitle !== '' ? 'Present' : 'Missing',
        'required' => true,
    ],
    [
        'property' => 'og:description',
        'value' => $ogDescription,
        'status' => $ogDescription !== '' ? 'Present' : 'Missing',
        'required' => true,
    ],
    [
        'property' => 'og:image',
        'value' => $resolvedOgImage,
        'status' => $resolvedOgImage !== '' ? 'Present' : 'Missing',
        'required' => true,
    ],
    [
        'property' => 'og:url',
        'value' => $ogUrl,
        'status' => $ogUrl !== '' ? 'Present' : 'Missing',
        'required' => true,
    ],
    [
        'property' => 'og:type',
        'value' => $ogType,
        'status' => $ogType !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'og:site_name',
        'value' => $ogSiteName,
        'status' => $ogSiteName !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'og:locale',
        'value' => $ogLocale,
        'status' => $ogLocale !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'og:image:width',
        'value' => $ogImageWidth,
        'status' => $ogImageWidth !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'og:image:height',
        'value' => $ogImageHeight,
        'status' => $ogImageHeight !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'og:image:alt',
        'value' => $ogImageAlt,
        'status' => $ogImageAlt !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'twitter:card',
        'value' => $twitterCard,
        'status' => $twitterCard !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'twitter:title',
        'value' => $twitterTitle,
        'status' => $twitterTitle !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'twitter:description',
        'value' => $twitterDescription,
        'status' => $twitterDescription !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'twitter:image',
        'value' => $resolvedTwitterImage,
        'status' => $resolvedTwitterImage !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
    [
        'property' => 'twitter:site',
        'value' => $twitterSite,
        'status' => $twitterSite !== '' ? 'Present' : 'Missing',
        'required' => false,
    ],
];

// Preview card data
$preview = [
    'title' => $ogTitle !== '' ? $ogTitle : ($twitterTitle !== '' ? $twitterTitle : $fallbackTitle),
    'description' => $ogDescription !== '' ? $ogDescription : ($twitterDescription !== '' ? $twitterDescription : $fallbackDesc),
    'image' => $resolvedOgImage !== '' ? $resolvedOgImage : $resolvedTwitterImage,
    'url' => $ogUrl !== '' ? $ogUrl : $finalUrl,
    'site_name' => $ogSiteName !== '' ? $ogSiteName : parse_url($finalUrl, PHP_URL_HOST),
    'twitter_card' => $twitterCard !== '' ? $twitterCard : 'summary_large_image',
];

$response = [
    'url' => $finalUrl,
    'http_code' => $httpCode,
    'preview' => $preview,
    'tags' => $tags,
    'has_og' => $ogTitle !== '' || $ogImage !== '',
    'has_twitter' => $twitterCard !== '' || $twitterTitle !== '',
];

jsonResponse(true, 'Open Graph analysis completed.', $response);

