<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://5nc6c83n-5173.asse.devtunnels.ms',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);

    exit;
}

function respond(
    bool $success,
    string $message,
    ?array $data = null,
    int $statusCode = 200,
): never {
    http_response_code($statusCode);

    $response = [
        'success' => $success,
        'message' => $message,
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/**
 * Load IPinfo configuration.
 */
$configFile = __DIR__ . '/../config/ipinfo.php';

if (!is_file($configFile)) {
    respond(
        false,
        'IPinfo configuration file was not found.',
        null,
        500
    );
}

$config = require $configFile;

if (!is_array($config)) {
    respond(
        false,
        'Invalid IPinfo configuration.',
        null,
        500
    );
}

$ipinfoToken = trim(
    (string)($config['token'] ?? '')
);

if ($ipinfoToken === '') {
    respond(
        false,
        'IPinfo API token is not configured.',
        null,
        500
    );
}

/**
 * Validate IPv4 / IPv6.
 */
function isValidIp(string $ip): bool
{
    return filter_var(
        $ip,
        FILTER_VALIDATE_IP
    ) !== false;
}

/**
 * Detect IP type.
 */
function getIpType(string $ip): string
{
    if (
        filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_IPV4
        ) !== false
    ) {
        return 'IPv4';
    }

    if (
        filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_IPV6
        ) !== false
    ) {
        return 'IPv6';
    }

    return 'Unknown';
}

/**
 * Detect localhost / private IP.
 */
function isLocalhostIp(string $ip): bool
{
    return $ip === '127.0.0.1'
        || $ip === '::1'
        || $ip === 'localhost';
}

/**
 * HTTP GET JSON using cURL.
 */
function httpGetJson(
    string $url,
    int $timeout = 15,
): array {
    $ch = curl_init($url);

    if ($ch === false) {
        throw new RuntimeException(
            'Unable to initialize cURL.'
        );
    }

    curl_setopt_array(
        $ch,
        [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => $timeout,

            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,

            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'User-Agent: XeooTools-IP-Lookup/1.0',
            ],
        ]
    );

    $body = curl_exec($ch);

    if ($body === false) {
        $error = curl_error($ch);

        curl_close($ch);

        throw new RuntimeException(
            'Network request failed: ' . $error
        );
    }

    $status = (int)curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);

    $decoded = json_decode(
        $body,
        true
    );

    if (!is_array($decoded)) {
        throw new RuntimeException(
            'The remote API returned invalid JSON.'
        );
    }

    return [
        'status' => $status,
        'body' => $decoded,
    ];
}

/**
 * Get current public IP from IPinfo.
 */
function getPublicIp(
    string $token,
): string {
    $url =
        'https://ipinfo.io/json?token=' .
        rawurlencode($token);

    $result = httpGetJson($url);

    if (
        $result['status'] < 200 ||
        $result['status'] >= 300
    ) {
        throw new RuntimeException(
            'Unable to detect public IP from IPinfo.'
        );
    }

    $ip = trim(
        (string)($result['body']['ip'] ?? '')
    );

    if (
        $ip === '' ||
        !isValidIp($ip)
    ) {
        throw new RuntimeException(
            'IPinfo returned an invalid public IP.'
        );
    }

    return $ip;
}

/**
 * Extract ASN and organization.
 *
 * Legacy IPinfo returns:
 * "org": "AS9341 PT INDONESIA COMNETS PLUS"
 */
function parseOrganization(
    ?string $org,
): array {
    if ($org === null || trim($org) === '') {
        return [
            'asn' => null,
            'organization' => null,
        ];
    }

    $org = trim($org);

    if (
        preg_match(
            '/^(AS\d+)\s+(.+)$/i',
            $org,
            $matches
        )
    ) {
        return [
            'asn' => strtoupper($matches[1]),
            'organization' => trim($matches[2]),
        ];
    }

    return [
        'asn' => null,
        'organization' => $org,
    ];
}

/**
 * Parse coordinates.
 */
function parseCoordinates(
    mixed $loc,
): array {
    if (
        !is_string($loc) ||
        trim($loc) === ''
    ) {
        return [
            'latitude' => null,
            'longitude' => null,
        ];
    }

    $parts = explode(',', $loc);

    if (count($parts) !== 2) {
        return [
            'latitude' => null,
            'longitude' => null,
        ];
    }

    $latitude = filter_var(
        trim($parts[0]),
        FILTER_VALIDATE_FLOAT
    );

    $longitude = filter_var(
        trim($parts[1]),
        FILTER_VALIDATE_FLOAT
    );

    if (
        $latitude === false ||
        $longitude === false
    ) {
        return [
            'latitude' => null,
            'longitude' => null,
        ];
    }

    $latitude = (float)$latitude;
    $longitude = (float)$longitude;

    if (
        $latitude < -90 ||
        $latitude > 90 ||
        $longitude < -180 ||
        $longitude > 180
    ) {
        return [
            'latitude' => null,
            'longitude' => null,
        ];
    }

    return [
        'latitude' => $latitude,
        'longitude' => $longitude,
    ];
}

/**
 * Get UTC offset from timezone.
 */
function getUtcOffset(
    ?string $timezone,
): ?string {
    if (
        $timezone === null ||
        trim($timezone) === ''
    ) {
        return null;
    }

    try {
        $date = new DateTime(
            'now',
            new DateTimeZone($timezone)
        );

        $offsetSeconds =
            $date->getOffset();

        $sign =
            $offsetSeconds >= 0
                ? '+'
                : '-';

        $absolute =
            abs($offsetSeconds);

        $hours =
            intdiv($absolute, 3600);

        $minutes =
            intdiv($absolute % 3600, 60);

        return sprintf(
            'UTC%s%02d:%02d',
            $sign,
            $hours,
            $minutes
        );
    } catch (Throwable) {
        return null;
    }
}

/**
 * Country metadata.
 *
 * This supplements IPinfo's Legacy API response with:
 * - ISO3
 * - continent
 * - currency
 * - calling code
 * - languages
 *
 * The IP itself is still resolved by IPinfo.
 */
function getCountryMetadata(
    ?string $countryCode,
): array {
    $empty = [
        'iso3' => null,
        'continent' => null,
        'calling_code' => null,
        'currency' => null,
        'currency_name' => null,
        'languages' => null,
    ];

    if (
        $countryCode === null ||
        trim($countryCode) === ''
    ) {
        return $empty;
    }

    $countryCode =
        strtoupper(trim($countryCode));

    if (
        !preg_match(
            '/^[A-Z]{2}$/',
            $countryCode
        )
    ) {
        return $empty;
    }

    $url =
        'https://restcountries.com/v3.1/alpha/' .
        rawurlencode($countryCode) .
        '?fields=cca3,continents,idd,currencies,languages';

    try {
        $result = httpGetJson(
            $url,
            10
        );
    } catch (Throwable) {
        return $empty;
    }

    if (
        $result['status'] < 200 ||
        $result['status'] >= 300
    ) {
        return $empty;
    }

    $body = $result['body'];

    /*
     * REST Countries /alpha/{code} normally returns
     * an object, but some responses may be wrapped.
     */
    if (
        isset($body[0]) &&
        is_array($body[0])
    ) {
        $body = $body[0];
    }

    if (!is_array($body)) {
        return $empty;
    }

    $iso3 =
        isset($body['cca3'])
            ? strtoupper(
                trim((string)$body['cca3'])
            )
            : null;

    $continent = null;

    if (
        isset($body['continents']) &&
        is_array($body['continents']) &&
        isset($body['continents'][0])
    ) {
        $continent =
            trim(
                (string)$body['continents'][0]
            );
    }

    $callingCode = null;

    if (
        isset($body['idd']) &&
        is_array($body['idd'])
    ) {
        $root =
            isset($body['idd']['root'])
                ? trim(
                    (string)$body['idd']['root']
                )
                : '';

        $suffixes =
            isset($body['idd']['suffixes']) &&
            is_array($body['idd']['suffixes'])
                ? $body['idd']['suffixes']
                : [];

        if (
            $root !== '' &&
            !empty($suffixes)
        ) {
            $suffix =
                trim(
                    (string)$suffixes[0]
                );

            $callingCode =
                $root . $suffix;
        } elseif ($root !== '') {
            $callingCode = $root;
        }
    }

    $currency = null;
    $currencyName = null;

    if (
        isset($body['currencies']) &&
        is_array($body['currencies'])
    ) {
        foreach (
            $body['currencies'] as $code => $currencyData
        ) {
            $currency =
                strtoupper(
                    trim((string)$code)
                );

            if (
                is_array($currencyData) &&
                isset($currencyData['name'])
            ) {
                $currencyName =
                    trim(
                        (string)$currencyData['name']
                    );
            }

            break;
        }
    }

    $languages = null;

    if (
        isset($body['languages']) &&
        is_array($body['languages'])
    ) {
        $languageValues = [];

        foreach (
            $body['languages'] as $language
        ) {
            $language = trim(
                (string)$language
            );

            if ($language !== '') {
                $languageValues[] = $language;
            }
        }

        if (!empty($languageValues)) {
            $languages =
                implode(
                    ', ',
                    $languageValues
                );
        }
    }

    return [
        'iso3' => $iso3,
        'continent' => $continent,
        'calling_code' => $callingCode,
        'currency' => $currency,
        'currency_name' => $currencyName,
        'languages' => $languages,
    ];
}

/**
 * Resolve requested IP.
 */
$requestedIp = trim(
    (string)($_GET['ip'] ?? '')
);

try {
    if ($requestedIp === '') {
        $ip = getPublicIp($ipinfoToken);
    } else {
        if (!isValidIp($requestedIp)) {
            respond(
                false,
                'Invalid IP address.',
                null,
                422
            );
        }

        $ip = $requestedIp;
    }

    /*
     * IPinfo Legacy API.
     */
    $lookupUrl =
        'https://ipinfo.io/' .
        rawurlencode($ip) .
        '/json?token=' .
        rawurlencode($ipinfoToken);

    $lookupResult =
        httpGetJson($lookupUrl);

    $status =
        (int)$lookupResult['status'];

    if ($status === 401) {
        respond(
            false,
            'IPinfo authentication failed. Check your API token.',
            null,
            502
        );
    }

    if ($status === 403) {
        respond(
            false,
            'IPinfo denied the request. Check your token permissions.',
            null,
            502
        );
    }

    if ($status === 429) {
        respond(
            false,
            'IPinfo API rate limit has been reached. Please try again later.',
            null,
            429
        );
    }

    if (
        $status < 200 ||
        $status >= 300
    ) {
        respond(
            false,
            'IPinfo returned HTTP ' . $status . '.',
            null,
            502
        );
    }

    $ipinfo =
        $lookupResult['body'];

    if (
        !isset($ipinfo['ip']) ||
        !is_string($ipinfo['ip']) ||
        !isValidIp($ipinfo['ip'])
    ) {
        respond(
            false,
            'IPinfo returned an invalid IP response.',
            null,
            502
        );
    }

    $resolvedIp =
        trim((string)$ipinfo['ip']);

    $type =
        getIpType($resolvedIp);

    $hostname =
        isset($ipinfo['hostname']) &&
        trim((string)$ipinfo['hostname']) !== ''
            ? trim((string)$ipinfo['hostname'])
            : null;

    $countryCode =
        isset($ipinfo['country']) &&
        trim((string)$ipinfo['country']) !== ''
            ? strtoupper(
                trim((string)$ipinfo['country'])
            )
            : null;

    $countryName = null;

    if (
        isset($ipinfo['country_name']) &&
        trim((string)$ipinfo['country_name']) !== ''
    ) {
        $countryName =
            trim((string)$ipinfo['country_name']);
    }

    $region =
        isset($ipinfo['region']) &&
        trim((string)$ipinfo['region']) !== ''
            ? trim((string)$ipinfo['region'])
            : null;

    $city =
        isset($ipinfo['city']) &&
        trim((string)$ipinfo['city']) !== ''
            ? trim((string)$ipinfo['city'])
            : null;

    $postalCode =
        isset($ipinfo['postal']) &&
        trim((string)$ipinfo['postal']) !== ''
            ? trim((string)$ipinfo['postal'])
            : null;

    $timezone =
        isset($ipinfo['timezone']) &&
        trim((string)$ipinfo['timezone']) !== ''
            ? trim((string)$ipinfo['timezone'])
            : null;

    $coordinates =
        parseCoordinates(
            $ipinfo['loc'] ?? null
        );

    $network =
        parseOrganization(
            isset($ipinfo['org'])
                ? (string)$ipinfo['org']
                : null
        );

    $countryMeta =
        getCountryMetadata(
            $countryCode
        );

    /*
     * Prefer metadata country name when available.
     */
    if (
        $countryName === null &&
        $countryCode !== null
    ) {
        try {
            $countryLookupUrl =
                'https://restcountries.com/v3.1/alpha/' .
                rawurlencode($countryCode) .
                '?fields=name';

            $countryLookup =
                httpGetJson(
                    $countryLookupUrl,
                    10
                );

            if (
                $countryLookup['status'] >= 200 &&
                $countryLookup['status'] < 300
            ) {
                $countryBody =
                    $countryLookup['body'];

                if (
                    isset($countryBody[0]) &&
                    is_array($countryBody[0])
                ) {
                    $countryBody =
                        $countryBody[0];
                }

                if (
                    isset($countryBody['name']['common'])
                ) {
                    $countryName =
                        trim(
                            (string)$countryBody['name']['common']
                        );
                }
            }
        } catch (Throwable) {
            // Keep IPinfo country code fallback.
        }
    }

    /*
     * IPinfo Legacy does not expose region_code.
     *
     * Do not invent a region code.
     */
    $regionCode = null;

    $utcOffset =
        getUtcOffset($timezone);

    respond(
        true,
        'IP lookup berhasil.',
        [
            'ip' => $resolvedIp,

            'type' => $type,

            'hostname' => $hostname,

            'location' => [
                'country_code' => $countryCode,
                'country' => $countryName,

                'region' => $region,
                'region_code' => $regionCode,

                'city' => $city,

                'postal_code' => $postalCode,

                'continent' =>
                    $countryMeta['continent'],

                'continent_code' => null,

                'latitude' =>
                    $coordinates['latitude'],

                'longitude' =>
                    $coordinates['longitude'],
            ],

            'network' => [
                'asn' =>
                    $network['asn'],

                'organization' =>
                    $network['organization'],

                'domain' => null,

                'type' => null,
            ],

            'timezone' => [
                'id' => $timezone,

                'utc_offset' =>
                    $utcOffset,
            ],

            'country_meta' => [
                'iso3' =>
                    $countryMeta['iso3'],

                'continent' =>
                    $countryMeta['continent'],

                'calling_code' =>
                    $countryMeta['calling_code'],

                'currency' =>
                    $countryMeta['currency'],

                'currency_name' =>
                    $countryMeta['currency_name'],

                'languages' =>
                    $countryMeta['languages'],
            ],

            'source' =>
                'IPinfo',
        ]
    );
} catch (Throwable $e) {
    error_log(
        'XeooTools IP Lookup Error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Unable to complete IP lookup: ' .
        $e->getMessage(),
        null,
        502
    );
}