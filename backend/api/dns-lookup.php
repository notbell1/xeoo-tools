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
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');



if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}



if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(
        false,
        'Method tidak diizinkan. Gunakan GET.',
        null,
        405
    );
}



const REQUEST_TIMEOUT = 8;
const CONNECT_TIMEOUT = 4;


const RECORD_TYPES = [
    'A',
    'AAAA',
    'CNAME',
    'MX',
    'NS',
    'TXT',
    'SOA',
    'CAA',
    'SRV',
];



const DNS_STATUS = [
    0  => 'NOERROR',
    1  => 'FORMERR',
    2  => 'SERVFAIL',
    3  => 'NXDOMAIN',
    4  => 'NOTIMP',
    5  => 'REFUSED',
    6  => 'YXDOMAIN',
    7  => 'YXRRSET',
    8  => 'NXRRSET',
    9  => 'NOTAUTH',
    10 => 'NOTZONE',
];


$Resolvers = [
    'cloudflare' => [
        'name' => 'Cloudflare',
        'server' => '1.1.1.1',
        'url' => 'https://cloudflare-dns.com/dns-query',
        'format' => 'json',
    ],

    'google' => [
        'name' => 'Google Public DNS',
        'server' => '8.8.8.8',
        'url' => 'https://dns.google/resolve',
        'format' => 'json',
    ],

    'quad9' => [
        'name' => 'Quad9',
        'server' => '9.9.9.9',
        'url' => 'https://dns.quad9.net/dns-query',
        'format' => 'doh',
    ],
];



$domain = isset($_GET['domain'])
    ? trim((string) $_GET['domain'])
    : '';

$type = isset($_GET['type'])
    ? strtoupper(trim((string) $_GET['type']))
    : 'A';

$resolverKey = isset($_GET['resolver'])
    ? strtolower(trim((string) $_GET['resolver']))
    : 'cloudflare';


$domainResult = validateHostname($domain);

if (!$domainResult['valid']) {
    respond(
        false,
        $domainResult['message'],
        null,
        400
    );
}

$domain = $domainResult['hostname'];


if ($type !== 'ALL' && !in_array($type, RECORD_TYPES, true)) {
    respond(
        false,
        'Tipe DNS tidak didukung.',
        [
            'supported_types' => array_merge(
                ['ALL'],
                RECORD_TYPES
            ),
        ],
        400
    );
}



if (!isset($Resolvers[$resolverKey])) {
    respond(
        false,
        'Resolver DNS tidak didukung.',
        [
            'supported_resolvers' => array_keys($Resolvers),
        ],
        400
    );
}

$resolver = $Resolvers[$resolverKey];

/**
 * --------------------------------------------------------------------------
 * Lookup
 * --------------------------------------------------------------------------
 */

$startedAt = microtime(true);

if ($type === 'ALL') {
    $result = lookupAllRecords(
        $domain,
        $resolver
    );
} else {
    $result = lookupDnsRecord(
        $domain,
        $type,
        $resolver
    );
}

$totalTimeMs = round(
    (microtime(true) - $startedAt) * 1000,
    2
);

/**
 * --------------------------------------------------------------------------
 * Error
 * --------------------------------------------------------------------------
 */

if (!$result['success']) {
    respond(
        false,
        $result['message'],
        [
            'domain' => $domain,
            'type' => $type,
            'resolver' => [
                'name' => $resolver['name'],
                'server' => $resolver['server'],
            ],
            'response_time_ms' => $totalTimeMs,
        ],
        $result['http_code'] ?? 502
    );
}

/**
 * --------------------------------------------------------------------------
 * Response
 * --------------------------------------------------------------------------
 */

$data = $result['data'];

$data['domain'] = $domain;

$data['requested_type'] = $type;

$data['resolver'] = [
    'name' => $resolver['name'],
    'server' => $resolver['server'],
];

$data['response_time_ms'] = $totalTimeMs;

respond(
    true,
    'DNS lookup berhasil.',
    $data,
    200
);

/**
 * ==========================================================================
 * FUNCTIONS
 * ==========================================================================
 */

/**
 * --------------------------------------------------------------------------
 * Send JSON response
 * --------------------------------------------------------------------------
 */

function respond(
    bool $success,
    string $message,
    mixed $data = null,
    int $statusCode = 200
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
        JSON_UNESCAPED_UNICODE |
        JSON_INVALID_UTF8_SUBSTITUTE
    );

    exit;
}

/**
 * --------------------------------------------------------------------------
 * Validate and normalize hostname
 * --------------------------------------------------------------------------
 */

function validateHostname(string $hostname): array
{
    $hostname = trim($hostname);

    if ($hostname === '') {
        return [
            'valid' => false,
            'message' => 'Domain atau hostname wajib diisi.',
        ];
    }

    /**
     * Remove accidental trailing dot.
     *
     * example.com.
     *
     * is a valid DNS FQDN.
     */

    $hostname = rtrim($hostname, '.');

    if ($hostname === '') {
        return [
            'valid' => false,
            'message' => 'Domain atau hostname tidak valid.',
        ];
    }

    /**
     * Reject URL-like input.
     */

    if (
        str_contains($hostname, '://') ||
        str_contains($hostname, '/') ||
        str_contains($hostname, '\\') ||
        str_contains($hostname, '?') ||
        str_contains($hostname, '#')
    ) {
        return [
            'valid' => false,
            'message' =>
                'Masukkan domain atau hostname saja, tanpa http://, https://, path, atau query.',
        ];
    }

    /**
     * Reject whitespace.
     */

    if (preg_match('/\s/u', $hostname)) {
        return [
            'valid' => false,
            'message' =>
                'Domain atau hostname tidak boleh mengandung spasi.',
        ];
    }

    /**
     * Reject IP addresses for normal DNS lookup.
     */

    if (filter_var($hostname, FILTER_VALIDATE_IP) !== false) {
        return [
            'valid' => false,
            'message' =>
                'Masukkan domain atau hostname, bukan alamat IP.',
        ];
    }

    /**
     * DNS names are limited to 253 characters.
     */

    if (strlen($hostname) > 253) {
        return [
            'valid' => false,
            'message' =>
                'Domain atau hostname terlalu panjang.',
        ];
    }

    $hostname = strtolower($hostname);

    $labels = explode('.', $hostname);

    foreach ($labels as $label) {
        if ($label === '') {
            return [
                'valid' => false,
                'message' =>
                    'Format domain atau hostname tidak valid.',
            ];
        }

        if (strlen($label) > 63) {
            return [
                'valid' => false,
                'message' =>
                    'Salah satu bagian hostname melebihi 63 karakter.',
            ];
        }

        /**
         * Underscore is intentionally allowed.
         *
         * Examples:
         * _dmarc.example.com
         * _domainkey.example.com
         * _sip._tcp.example.com
         */

        if (!preg_match('/^[a-z0-9_-]+$/i', $label)) {
            return [
                'valid' => false,
                'message' =>
                    'Domain atau hostname mengandung karakter yang tidak valid.',
            ];
        }

        /**
         * Prevent labels beginning or ending with hyphen.
         */

        if (
            str_starts_with($label, '-') ||
            str_ends_with($label, '-')
        ) {
            return [
                'valid' => false,
                'message' =>
                    'Bagian hostname tidak boleh diawali atau diakhiri tanda minus.',
            ];
        }
    }

    return [
        'valid' => true,
        'hostname' => $hostname,
    ];
}

/**
 * --------------------------------------------------------------------------
 * Perform DNS lookup for one record type
 * --------------------------------------------------------------------------
 */

function lookupDnsRecord(
    string $domain,
    string $type,
    array $resolver
): array {
    /**
     * Quad9 uses standard DNS-over-HTTPS wire format.
     */

    if (($resolver['format'] ?? '') === 'doh') {
        return lookupDnsRecordDoh(
            $domain,
            $type,
            $resolver
        );
    }

    /**
     * Cloudflare / Google JSON APIs.
     */

    $queryUrl = $resolver['url']
        . '?name=' . rawurlencode($domain)
        . '&type=' . rawurlencode($type);

    $requestStartedAt = microtime(true);

    $httpResult = httpGetJson($queryUrl);

    $requestTimeMs = round(
        (microtime(true) - $requestStartedAt) * 1000,
        2
    );

    if (!$httpResult['success']) {
        return [
            'success' => false,
            'message' => $httpResult['message'],
            'http_code' => 502,
        ];
    }

    $json = $httpResult['data'];

    if (!is_array($json)) {
        return [
            'success' => false,
            'message' =>
                'Resolver DNS mengembalikan response yang tidak valid.',
            'http_code' => 502,
        ];
    }

    return normalizeJsonDnsResponse(
        $json,
        $requestTimeMs
    );
}

/**
 * --------------------------------------------------------------------------
 * Parse JSON DNS response
 * --------------------------------------------------------------------------
 */

function normalizeJsonDnsResponse(
    array $json,
    float $requestTimeMs
): array {
    $statusCode = isset($json['Status'])
        ? (int) $json['Status']
        : null;

    $statusName = getDnsStatusName($statusCode);

    /**
     * Answers
     */

    $answers = [];

    if (
        isset($json['Answer']) &&
        is_array($json['Answer'])
    ) {
        foreach ($json['Answer'] as $answer) {
            if (!is_array($answer)) {
                continue;
            }

            $answers[] = normalizeAnswer($answer);
        }
    }

    /**
     * Authority
     */

    $authorities = [];

    if (
        isset($json['Authority']) &&
        is_array($json['Authority'])
    ) {
        foreach ($json['Authority'] as $authority) {
            if (!is_array($authority)) {
                continue;
            }

            $authorities[] = normalizeAnswer($authority);
        }
    }

    return [
        'success' => true,
        'data' => [
            'status' => [
                'code' => $statusCode,
                'name' => $statusName,
            ],

            'answer_count' => count($answers),

            'answers' => $answers,

            'authority_count' => count($authorities),

            'authority' => $authorities,

            'flags' => [
                'truncated' => !empty($json['TC']),
                'recursion_desired' => !empty($json['RD']),
                'recursion_available' => !empty($json['RA']),
                'authenticated_data' => !empty($json['AD']),
                'checking_disabled' => !empty($json['CD']),
            ],

            'resolver_response_time_ms' => $requestTimeMs,
        ],
    ];
}

/**
 * --------------------------------------------------------------------------
 * Quad9 standard DNS-over-HTTPS lookup
 * --------------------------------------------------------------------------
 *
 * Quad9's current endpoint uses RFC 8484-style DNS wire messages.
 *
 * We create a DNS query packet and send it through DoH.
 *
 * --------------------------------------------------------------------------
 */

function lookupDnsRecordDoh(
    string $domain,
    string $type,
    array $resolver
): array {
    $requestStartedAt = microtime(true);

    $query = buildDnsQuery(
        $domain,
        $type
    );

    if (!$query['success']) {
        return [
            'success' => false,
            'message' => $query['message'],
            'http_code' => 502,
        ];
    }

    $httpResult = httpGetDnsMessage(
        $resolver['url'],
        $query['packet']
    );

    $requestTimeMs = round(
        (microtime(true) - $requestStartedAt) * 1000,
        2
    );

    if (!$httpResult['success']) {
        return [
            'success' => false,
            'message' => $httpResult['message'],
            'http_code' => 502,
        ];
    }

    $parsed = parseDnsMessage(
        $httpResult['body']
    );

    if (!$parsed['success']) {
        return [
            'success' => false,
            'message' => $parsed['message'],
            'http_code' => 502,
        ];
    }

    $data = $parsed['data'];

    $data['resolver_response_time_ms'] = $requestTimeMs;

    return [
        'success' => true,
        'data' => $data,
    ];
}

/**
 * --------------------------------------------------------------------------
 * Build DNS wire-format query
 * --------------------------------------------------------------------------
 */

function buildDnsQuery(
    string $domain,
    string $type
): array {
    $typeCodes = [
        'A' => 1,
        'NS' => 2,
        'CNAME' => 5,
        'SOA' => 6,
        'MX' => 15,
        'TXT' => 16,
        'AAAA' => 28,
        'SRV' => 33,
        'CAA' => 257,
    ];

    if (!isset($typeCodes[$type])) {
        return [
            'success' => false,
            'message' =>
                "DNS record type {$type} tidak didukung oleh DoH query builder.",
        ];
    }

    $encodedName = encodeDnsName($domain);

    if ($encodedName === null) {
        return [
            'success' => false,
            'message' =>
                'Gagal membuat DNS query untuk hostname tersebut.',
        ];
    }

    /**
     * Random transaction ID.
     */

    try {
        $id = random_int(0, 65535);
    } catch (Throwable) {
        $id = mt_rand(0, 65535);
    }

    /**
     * Flags:
     *
     * QR = 0
     * Opcode = 0
     * AA = 0
     * TC = 0
     * RD = 1
     * RA = 0
     * Z = 0
     * RCODE = 0
     */

    $flags = 0x0100;

    /**
     * Header:
     *
     * ID
     * Flags
     * QDCOUNT = 1
     * ANCOUNT = 0
     * NSCOUNT = 0
     * ARCOUNT = 0
     */

    $header = pack(
        'nnnnnn',
        $id,
        $flags,
        1,
        0,
        0,
        0
    );

    /**
     * Question:
     *
     * QNAME
     * QTYPE
     * QCLASS = IN (1)
     */

    $question = $encodedName
        . pack(
            'nn',
            $typeCodes[$type],
            1
        );

    return [
        'success' => true,
        'packet' => $header . $question,
        'id' => $id,
    ];
}

/**
 * --------------------------------------------------------------------------
 * Encode DNS hostname
 * --------------------------------------------------------------------------
 */

function encodeDnsName(string $domain): ?string
{
    $domain = rtrim($domain, '.');

    if ($domain === '') {
        return null;
    }

    $labels = explode('.', $domain);

    $result = '';

    foreach ($labels as $label) {
        $length = strlen($label);

        if ($length < 1 || $length > 63) {
            return null;
        }

        $result .= chr($length);
        $result .= $label;
    }

    $result .= "\0";

    return $result;
}

/**
 * --------------------------------------------------------------------------
 * Base64 URL-safe encoding
 * --------------------------------------------------------------------------
 */

function base64UrlEncode(string $value): string
{
    return rtrim(
        strtr(
            base64_encode($value),
            '+/',
            '-_'
        ),
        '='
    );
}

/**
 * --------------------------------------------------------------------------
 * HTTP GET DNS wire-format message
 * --------------------------------------------------------------------------
 */

function httpGetDnsMessage(
    string $url,
    string $packet
): array {
    if (!function_exists('curl_init')) {
        return [
            'success' => false,
            'message' =>
                'PHP cURL extension tidak tersedia.',
        ];
    }

    $encodedDns = base64UrlEncode($packet);

    $queryUrl = $url
        . '?dns='
        . rawurlencode($encodedDns);

    $ch = curl_init();

    if ($ch === false) {
        return [
            'success' => false,
            'message' =>
                'Gagal membuat koneksi cURL.',
        ];
    }

    /**
     * Standard DoH.
     *
     * Quad9 currently requires HTTP/2 for DoH.
     */

    curl_setopt_array(
        $ch,
        [
            CURLOPT_URL => $queryUrl,

            CURLOPT_RETURNTRANSFER => true,

            CURLOPT_FOLLOWLOCATION => false,

            CURLOPT_CONNECTTIMEOUT => CONNECT_TIMEOUT,

            CURLOPT_TIMEOUT => REQUEST_TIMEOUT,

            CURLOPT_HTTPHEADER => [
                'Accept: application/dns-message',
                'User-Agent: XeooTools-DNS-Lookup/1.0',
            ],

            CURLOPT_SSL_VERIFYPEER => true,

            CURLOPT_SSL_VERIFYHOST => 2,

            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2TLS,
        ]
    );

    $body = curl_exec($ch);

    $curlError = curl_error($ch);

    $curlErrno = curl_errno($ch);

    $httpCode = (int) curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);

    if ($body === false) {
        if ($curlError !== '') {
            return [
                'success' => false,
                'message' =>
                    "Quad9 tidak dapat dihubungi: {$curlError}",
            ];
        }

        return [
            'success' => false,
            'message' =>
                "Request Quad9 gagal (cURL {$curlErrno}).",
        ];
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        return [
            'success' => false,
            'message' =>
                "Quad9 mengembalikan HTTP {$httpCode}.",
        ];
    }

    if ($body === '') {
        return [
            'success' => false,
            'message' =>
                'Quad9 mengembalikan response DNS kosong.',
        ];
    }

    return [
        'success' => true,
        'body' => $body,
    ];
}

/**
 * --------------------------------------------------------------------------
 * Parse DNS wire-format response
 * --------------------------------------------------------------------------
 */

function parseDnsMessage(string $packet): array
{
    $length = strlen($packet);

    if ($length < 12) {
        return [
            'success' => false,
            'message' =>
                'Response DNS Quad9 terlalu pendek atau tidak valid.',
        ];
    }

    /**
     * Header:
     *
     * ID
     * FLAGS
     * QDCOUNT
     * ANCOUNT
     * NSCOUNT
     * ARCOUNT
     */

    $header = unpack(
        'nid/nflags/nqdcount/nancount/nnscount/narcount',
        substr($packet, 0, 12)
    );

    if (!is_array($header)) {
        return [
            'success' => false,
            'message' =>
                'Header response DNS Quad9 tidak valid.',
        ];
    }

    $flags = (int) $header['flags'];

    $rcode = $flags & 0x000F;

    $truncated = (($flags & 0x0200) !== 0);

    $recursionDesired = (($flags & 0x0100) !== 0);

    $recursionAvailable = (($flags & 0x0080) !== 0);

    $authenticatedData = (($flags & 0x0020) !== 0);

    $checkingDisabled = (($flags & 0x0010) !== 0);

    $offset = 12;

    /**
     * Skip questions.
     */

    for (
        $i = 0;
        $i < (int) $header['qdcount'];
        $i++
    ) {
        $nameResult = readDnsName(
            $packet,
            $offset
        );

        if (!$nameResult['success']) {
            return [
                'success' => false,
                'message' =>
                    $nameResult['message'],
            ];
        }

        $offset = $nameResult['offset'];

        if ($offset + 4 > $length) {
            return [
                'success' => false,
                'message' =>
                    'Bagian question DNS Quad9 tidak lengkap.',
            ];
        }

        $offset += 4;
    }

    /**
     * Answers.
     */

    $answersResult = parseDnsRecords(
        $packet,
        $offset,
        (int) $header['ancount']
    );

    if (!$answersResult['success']) {
        return [
            'success' => false,
            'message' =>
                $answersResult['message'],
        ];
    }

    $offset = $answersResult['offset'];

    /**
     * Authority.
     */

    $authorityResult = parseDnsRecords(
        $packet,
        $offset,
        (int) $header['nscount']
    );

    if (!$authorityResult['success']) {
        return [
            'success' => false,
            'message' =>
                $authorityResult['message'],
        ];
    }

    return [
        'success' => true,
        'data' => [
            'status' => [
                'code' => $rcode,
                'name' => getDnsStatusName($rcode),
            ],

            'answer_count' =>
                count($answersResult['records']),

            'answers' =>
                $answersResult['records'],

            'authority_count' =>
                count($authorityResult['records']),

            'authority' =>
                $authorityResult['records'],

            'flags' => [
                'truncated' => $truncated,
                'recursion_desired' => $recursionDesired,
                'recursion_available' => $recursionAvailable,
                'authenticated_data' => $authenticatedData,
                'checking_disabled' => $checkingDisabled,
            ],
        ],
    ];
}

/**
 * --------------------------------------------------------------------------
 * Parse multiple DNS records
 * --------------------------------------------------------------------------
 */

function parseDnsRecords(
    string $packet,
    int $offset,
    int $count
): array {
    $records = [];

    $packetLength = strlen($packet);

    for ($i = 0; $i < $count; $i++) {
        $nameResult = readDnsName(
            $packet,
            $offset
        );

        if (!$nameResult['success']) {
            return [
                'success' => false,
                'message' =>
                    $nameResult['message'],
            ];
        }

        $name = $nameResult['name'];

        $offset = $nameResult['offset'];

        if ($offset + 10 > $packetLength) {
            return [
                'success' => false,
                'message' =>
                    'DNS record header tidak lengkap.',
            ];
        }

        $recordHeader = unpack(
            'ntype/nclass/Nttl/nrdlength',
            substr(
                $packet,
                $offset,
                10
            )
        );

        if (!is_array($recordHeader)) {
            return [
                'success' => false,
                'message' =>
                    'DNS record header tidak valid.',
            ];
        }

        $typeCode = (int) $recordHeader['type'];

        $ttl = (int) $recordHeader['ttl'];

        $rdLength = (int) $recordHeader['rdlength'];

        $offset += 10;

        if (
            $rdLength < 0 ||
            $offset + $rdLength > $packetLength
        ) {
            return [
                'success' => false,
                'message' =>
                    'DNS record data tidak lengkap.',
            ];
        }

        $rdataOffset = $offset;

        $rdata = substr(
            $packet,
            $offset,
            $rdLength
        );

        $record = parseDnsRdata(
            $packet,
            $rdata,
            $rdataOffset,
            $typeCode,
            $rdLength
        );

        $record['name'] = rtrim($name, '.');

        $record['type'] =
            dnsTypeName($typeCode);

        $record['type_code'] =
            $typeCode;

        $record['ttl'] = $ttl;

        /**
         * Put fields in the same order expected
         * by the frontend.
         */

        $record = normalizeParsedRecord(
            $record,
            $typeCode
        );

        $records[] = $record;

        $offset += $rdLength;
    }

    return [
        'success' => true,
        'records' => $records,
        'offset' => $offset,
    ];
}

/**
 * --------------------------------------------------------------------------
 * Read DNS compressed name
 * --------------------------------------------------------------------------
 */

function readDnsName(
    string $packet,
    int $offset
): array {
    $packetLength = strlen($packet);

    if ($offset < 0 || $offset >= $packetLength) {
        return [
            'success' => false,
            'message' =>
                'Offset DNS name berada di luar packet.',
        ];
    }

    $labels = [];

    $position = $offset;

    $nextOffset = null;

    $jumped = false;

    $jumpCount = 0;

    while (true) {
        if ($position >= $packetLength) {
            return [
                'success' => false,
                'message' =>
                    'DNS name melebihi ukuran packet.',
            ];
        }

        $length = ord(
            $packet[$position]
        );

        /**
         * Compression pointer.
         */

        if (($length & 0xC0) === 0xC0) {
            if ($position + 1 >= $packetLength) {
                return [
                    'success' => false,
                    'message' =>
                        'DNS compression pointer tidak lengkap.',
                ];
            }

            $second = ord(
                $packet[$position + 1]
            );

            $pointer =
                (($length & 0x3F) << 8) |
                $second;

            if ($pointer >= $packetLength) {
                return [
                    'success' => false,
                    'message' =>
                        'DNS compression pointer tidak valid.',
                ];
            }

            if (!$jumped) {
                $nextOffset = $position + 2;
            }

            $position = $pointer;

            $jumped = true;

            $jumpCount++;

            if ($jumpCount > 50) {
                return [
                    'success' => false,
                    'message' =>
                        'DNS name compression terlalu dalam.',
                ];
            }

            continue;
        }

        /**
         * Reserved label format.
         */

        if (($length & 0xC0) !== 0) {
            return [
                'success' => false,
                'message' =>
                    'Format DNS label tidak valid.',
            ];
        }

        /**
         * Root label.
         */

        if ($length === 0) {
            if (!$jumped) {
                $nextOffset = $position + 1;
            }

            break;
        }

        $position++;

        if (
            $position + $length >
            $packetLength
        ) {
            return [
                'success' => false,
                'message' =>
                    'DNS label melebihi ukuran packet.',
            ];
        }

        $labels[] = substr(
            $packet,
            $position,
            $length
        );

        $position += $length;

        if (!$jumped) {
            $nextOffset = $position;
        }
    }

    return [
        'success' => true,
        'name' => implode('.', $labels),
        'offset' => $nextOffset,
    ];
}

/**
 * --------------------------------------------------------------------------
 * Parse DNS RDATA
 * --------------------------------------------------------------------------
 */

function parseDnsRdata(
    string $packet,
    string $rdata,
    int $rdataOffset,
    int $typeCode,
    int $rdLength
): array {
    switch ($typeCode) {
        /**
         * A
         */

        case 1:
            if ($rdLength === 4) {
                $ip = inet_ntop($rdata);

                return [
                    'data' =>
                        $ip !== false
                            ? $ip
                            : '',
                ];
            }

            return [
                'data' => '',
            ];

        /**
         * NS
         * CNAME
         */

        case 2:
        case 5:
            $result = readDnsName(
                $packet,
                $rdataOffset
            );

            return [
                'data' =>
                    $result['success']
                        ? rtrim($result['name'], '.')
                        : '',
            ];

        /**
         * SOA
         */

        case 6:
            return parseSoaRdata(
                $packet,
                $rdataOffset,
                $rdLength
            );

        /**
         * MX
         */

        case 15:
            if ($rdLength < 3) {
                return [
                    'data' => '',
                ];
            }

            $priority = unpack(
                'npriority',
                substr($rdata, 0, 2)
            );

            if (!is_array($priority)) {
                return [
                    'data' => '',
                ];
            }

            $targetResult = readDnsName(
                $packet,
                $rdataOffset + 2
            );

            $target =
                $targetResult['success']
                    ? rtrim($targetResult['name'], '.')
                    : '';

            return [
                'data' =>
                    (int) $priority['priority']
                    . ' '
                    . $target,

                'priority' =>
                    (int) $priority['priority'],

                'target' => $target,
            ];

        /**
         * TXT
         */

        case 16:
            return [
                'data' =>
                    parseTxtRdata($rdata),
            ];

        /**
         * AAAA
         */

        case 28:
            if ($rdLength === 16) {
                $ip = inet_ntop($rdata);

                return [
                    'data' =>
                        $ip !== false
                            ? $ip
                            : '',
                ];
            }

            return [
                'data' => '',
            ];

        /**
         * SRV
         */

        case 33:
            if ($rdLength < 7) {
                return [
                    'data' => '',
                ];
            }

            $srv = unpack(
                'npriority/nweight/nport',
                substr($rdata, 0, 6)
            );

            if (!is_array($srv)) {
                return [
                    'data' => '',
                ];
            }

            $targetResult = readDnsName(
                $packet,
                $rdataOffset + 6
            );

            $target =
                $targetResult['success']
                    ? rtrim($targetResult['name'], '.')
                    : '';

            return [
                'data' =>
                    (int) $srv['priority']
                    . ' '
                    . (int) $srv['weight']
                    . ' '
                    . (int) $srv['port']
                    . ' '
                    . $target,

                'priority' =>
                    (int) $srv['priority'],

                'weight' =>
                    (int) $srv['weight'],

                'port' =>
                    (int) $srv['port'],

                'target' => $target,
            ];

        /**
         * CAA
         */

        case 257:
            return parseCaaRdata($rdata);

        /**
         * Unknown type.
         */

        default:
            return [
                'data' =>
                    bin2hex($rdata),
            ];
    }
}

/**
 * --------------------------------------------------------------------------
 * Parse SOA RDATA
 * --------------------------------------------------------------------------
 */

function parseSoaRdata(
    string $packet,
    int $offset,
    int $length
): array {
    $start = $offset;

    $primaryResult = readDnsName(
        $packet,
        $offset
    );

    if (!$primaryResult['success']) {
        return [
            'data' => '',
        ];
    }

    $offset = $primaryResult['offset'];

    $mailboxResult = readDnsName(
        $packet,
        $offset
    );

    if (!$mailboxResult['success']) {
        return [
            'data' => '',
        ];
    }

    $offset = $mailboxResult['offset'];

    if (
        $offset + 20 >
        $start + $length
    ) {
        return [
            'data' => '',
        ];
    }

    $values = unpack(
        'Nserial/Nrefresh/Nretry/Nexpire/Nminimum_ttl',
        substr(
            $packet,
            $offset,
            20
        )
    );

    if (!is_array($values)) {
        return [
            'data' => '',
        ];
    }

    $primary =
        rtrim(
            $primaryResult['name'],
            '.'
        );

    $mailbox =
        rtrim(
            $mailboxResult['name'],
            '.'
        );

    return [
        'data' =>
            $primary
            . ' '
            . $mailbox
            . ' '
            . (int) $values['serial']
            . ' '
            . (int) $values['refresh']
            . ' '
            . (int) $values['retry']
            . ' '
            . (int) $values['expire']
            . ' '
            . (int) $values['minimum_ttl'],

        'primary_name_server' =>
            $primary,

        'responsible_mailbox' =>
            $mailbox,

        'serial' =>
            (int) $values['serial'],

        'refresh' =>
            (int) $values['refresh'],

        'retry' =>
            (int) $values['retry'],

        'expire' =>
            (int) $values['expire'],

        'minimum_ttl' =>
            (int) $values['minimum_ttl'],
    ];
}

/**
 * --------------------------------------------------------------------------
 * Parse TXT RDATA
 * --------------------------------------------------------------------------
 */

function parseTxtRdata(string $rdata): string
{
    $offset = 0;

    $length = strlen($rdata);

    $parts = [];

    while ($offset < $length) {
        $segmentLength =
            ord($rdata[$offset]);

        $offset++;

        if (
            $offset + $segmentLength >
            $length
        ) {
            break;
        }

        $parts[] = substr(
            $rdata,
            $offset,
            $segmentLength
        );

        $offset += $segmentLength;
    }

    $quoted = [];

    foreach ($parts as $part) {
        $escaped = addcslashes(
            $part,
            "\\\""
        );

        $quoted[] = '"' . $escaped . '"';
    }

    return implode(
        ' ',
        $quoted
    );
}

/**
 * --------------------------------------------------------------------------
 * Parse CAA RDATA
 * --------------------------------------------------------------------------
 */

function parseCaaRdata(string $rdata): array
{
    $length = strlen($rdata);

    if ($length < 2) {
        return [
            'data' => '',
            'flags' => null,
            'tag' => null,
            'value' => null,
        ];
    }

    $flags = ord($rdata[0]);

    $tagLength = ord($rdata[1]);

    if (
        2 + $tagLength >
        $length
    ) {
        return [
            'data' => '',
            'flags' => $flags,
            'tag' => null,
            'value' => null,
        ];
    }

    $tag = substr(
        $rdata,
        2,
        $tagLength
    );

    $value = substr(
        $rdata,
        2 + $tagLength
    );

    $escapedValue = addcslashes(
        $value,
        "\\\""
    );

    return [
        'data' =>
            $flags
            . ' '
            . $tag
            . ' "'
            . $escapedValue
            . '"',

        'flags' => $flags,

        'tag' => $tag,

        'value' => $value,
    ];
}

/**
 * --------------------------------------------------------------------------
 * Normalize parsed binary DNS record
 * --------------------------------------------------------------------------
 */

function normalizeParsedRecord(
    array $record,
    int $typeCode
): array {
    $typeName = dnsTypeName($typeCode);

    $normalized = [
        'name' =>
            isset($record['name'])
                ? rtrim(
                    (string) $record['name'],
                    '.'
                )
                : '',

        'type' => $typeName,

        'type_code' => $typeCode,

        'ttl' =>
            isset($record['ttl'])
                ? (int) $record['ttl']
                : null,

        'data' =>
            isset($record['data'])
                ? (string) $record['data']
                : '',
    ];

    switch ($typeName) {
        case 'MX':
            $normalized['priority'] =
                $record['priority'] ?? null;

            $normalized['target'] =
                $record['target'] ?? null;

            break;

        case 'SRV':
            $normalized['priority'] =
                $record['priority'] ?? null;

            $normalized['weight'] =
                $record['weight'] ?? null;

            $normalized['port'] =
                $record['port'] ?? null;

            $normalized['target'] =
                $record['target'] ?? null;

            break;

        case 'SOA':
            $normalized['primary_name_server'] =
                $record['primary_name_server']
                ?? null;

            $normalized['responsible_mailbox'] =
                $record['responsible_mailbox']
                ?? null;

            $normalized['serial'] =
                $record['serial']
                ?? null;

            $normalized['refresh'] =
                $record['refresh']
                ?? null;

            $normalized['retry'] =
                $record['retry']
                ?? null;

            $normalized['expire'] =
                $record['expire']
                ?? null;

            $normalized['minimum_ttl'] =
                $record['minimum_ttl']
                ?? null;

            break;

        case 'CAA':
            $normalized['flags'] =
                $record['flags']
                ?? null;

            $normalized['tag'] =
                $record['tag']
                ?? null;

            $normalized['value'] =
                $record['value']
                ?? null;

            break;
    }

    return $normalized;
}

/**
 * --------------------------------------------------------------------------
 * Perform all supported DNS record types
 * --------------------------------------------------------------------------
 */

function lookupAllRecords(
    string $domain,
    array $resolver
): array {
    $records = [];

    $allAnswers = [];

    $allAuthorities = [];

    $status = null;

    $flags = [
        'truncated' => false,
        'recursion_desired' => false,
        'recursion_available' => false,
        'authenticated_data' => false,
        'checking_disabled' => false,
    ];

    $resolverTime = 0.0;

    $successfulQueries = 0;

    foreach (RECORD_TYPES as $recordType) {
        $result = lookupDnsRecord(
            $domain,
            $recordType,
            $resolver
        );

        /**
         * A failed individual record lookup should not
         * invalidate the entire ALL lookup.
         */

        if (!$result['success']) {
            $records[$recordType] = [
                'status' => null,
                'answer_count' => 0,
                'answers' => [],
                'authority_count' => 0,
                'authority' => [],
                'flags' => $flags,
                'resolver_response_time_ms' => 0.0,
                'error' => $result['message'],
            ];

            continue;
        }

        $recordData = $result['data'];

        $records[$recordType] = [
            'status' =>
                $recordData['status'],

            'answer_count' =>
                $recordData['answer_count'],

            'answers' =>
                $recordData['answers'],

            'authority_count' =>
                $recordData['authority_count'],

            'authority' =>
                $recordData['authority'],

            'flags' =>
                $recordData['flags'],

            'resolver_response_time_ms' =>
                $recordData['resolver_response_time_ms'],
        ];

        /**
         * Preserve first valid DNS status.
         */

        if ($status === null) {
            $status =
                $recordData['status'];
        }

        /**
         * Use flags from first successful response.
         */

        $recordFlags =
            $recordData['flags'] ?? [];

        if ($successfulQueries === 0) {
            $flags = [
                'truncated' =>
                    !empty(
                        $recordFlags['truncated']
                    ),

                'recursion_desired' =>
                    !empty(
                        $recordFlags['recursion_desired']
                    ),

                'recursion_available' =>
                    !empty(
                        $recordFlags['recursion_available']
                    ),

                'authenticated_data' =>
                    !empty(
                        $recordFlags['authenticated_data']
                    ),

                'checking_disabled' =>
                    !empty(
                        $recordFlags['checking_disabled']
                    ),
            ];
        }

        /**
         * Flatten answers.
         */

        if (
            isset($recordData['answers']) &&
            is_array($recordData['answers'])
        ) {
            foreach (
                $recordData['answers']
                as $answer
            ) {
                if (!is_array($answer)) {
                    continue;
                }

                $allAnswers[] = $answer;
            }
        }

        /**
         * Flatten authority records.
         *
         * Avoid duplicate authority records.
         */

        if (
            isset($recordData['authority']) &&
            is_array($recordData['authority'])
        ) {
            foreach (
                $recordData['authority']
                as $authority
            ) {
                if (!is_array($authority)) {
                    continue;
                }

                $authorityKey = json_encode(
                    $authority,
                    JSON_UNESCAPED_SLASHES |
                    JSON_UNESCAPED_UNICODE
                );

                $exists = false;

                foreach (
                    $allAuthorities
                    as $existingAuthority
                ) {
                    $existingKey = json_encode(
                        $existingAuthority,
                        JSON_UNESCAPED_SLASHES |
                        JSON_UNESCAPED_UNICODE
                    );

                    if ($existingKey === $authorityKey) {
                        $exists = true;
                        break;
                    }
                }

                if (!$exists) {
                    $allAuthorities[] =
                        $authority;
                }
            }
        }

        $resolverTime +=
            (float)
            $recordData[
                'resolver_response_time_ms'
            ];

        $successfulQueries++;
    }

    /**
     * If all queries somehow failed.
     */

    if ($status === null) {
        $status = [
            'code' => null,
            'name' => 'UNKNOWN',
        ];
    }

    return [
        'success' => true,

        'data' => [
            'status' => $status,

            'answer_count' =>
                count($allAnswers),

            'answers' =>
                $allAnswers,

            'authority_count' =>
                count($allAuthorities),

            'authority' =>
                $allAuthorities,

            'flags' =>
                $flags,

            'resolver_response_time_ms' =>
                round(
                    $resolverTime,
                    2
                ),

            'records' =>
                $records,

            'resolver_total_time_ms' =>
                round(
                    $resolverTime,
                    2
                ),
        ],
    ];
}

/**
 * --------------------------------------------------------------------------
 * Normalize JSON DNS answer
 * --------------------------------------------------------------------------
 */

function normalizeAnswer(array $answer): array
{
    $typeCode = isset($answer['type'])
        ? (int) $answer['type']
        : null;

    $typeName =
        dnsTypeName($typeCode);

    $name = isset($answer['name'])
        ? (string) $answer['name']
        : '';

    $ttl = isset($answer['TTL'])
        ? (int) $answer['TTL']
        : null;

    $data = isset($answer['data'])
        ? (string) $answer['data']
        : '';

    /**
     * Some JSON DNS providers can escape
     * certain characters.
     */

    $data = cleanDnsText($data);

    $normalized = [
        'name' =>
            rtrim($name, '.'),

        'type' =>
            $typeName,

        'type_code' =>
            $typeCode,

        'ttl' =>
            $ttl,

        'data' =>
            $data,
    ];

    /**
     * Parse structured fields.
     */

    switch ($typeName) {
        case 'MX':
            $normalized['priority'] = null;

            $normalized['target'] = null;

            if (
                preg_match(
                    '/^(\d+)\s+(.+)$/',
                    $data,
                    $matches
                )
            ) {
                $normalized['priority'] =
                    (int) $matches[1];

                $normalized['target'] =
                    rtrim(
                        $matches[2],
                        '.'
                    );
            }

            break;

        case 'SRV':
            $normalized['priority'] = null;

            $normalized['weight'] = null;

            $normalized['port'] = null;

            $normalized['target'] = null;

            if (
                preg_match(
                    '/^(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/',
                    $data,
                    $matches
                )
            ) {
                $normalized['priority'] =
                    (int) $matches[1];

                $normalized['weight'] =
                    (int) $matches[2];

                $normalized['port'] =
                    (int) $matches[3];

                $normalized['target'] =
                    rtrim(
                        $matches[4],
                        '.'
                    );
            }

            break;

        case 'SOA':
            $normalized[
                'primary_name_server'
            ] = null;

            $normalized[
                'responsible_mailbox'
            ] = null;

            $normalized['serial'] = null;

            $normalized['refresh'] = null;

            $normalized['retry'] = null;

            $normalized['expire'] = null;

            $normalized['minimum_ttl'] = null;

            if (
                preg_match(
                    '/^(\S+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/',
                    $data,
                    $matches
                )
            ) {
                $normalized[
                    'primary_name_server'
                ] =
                    rtrim(
                        $matches[1],
                        '.'
                    );

                $normalized[
                    'responsible_mailbox'
                ] =
                    rtrim(
                        $matches[2],
                        '.'
                    );

                $normalized['serial'] =
                    (int) $matches[3];

                $normalized['refresh'] =
                    (int) $matches[4];

                $normalized['retry'] =
                    (int) $matches[5];

                $normalized['expire'] =
                    (int) $matches[6];

                $normalized['minimum_ttl'] =
                    (int) $matches[7];
            }

            break;

        case 'CAA':
            $normalized['flags'] = null;

            $normalized['tag'] = null;

            $normalized['value'] = null;

            if (
                preg_match(
                    '/^(\d+)\s+(\S+)\s+"?(.*?)"?$/',
                    $data,
                    $matches
                )
            ) {
                $normalized['flags'] =
                    (int) $matches[1];

                $normalized['tag'] =
                    $matches[2];

                $normalized['value'] =
                    trim(
                        $matches[3],
                        '"'
                    );
            }

            break;
    }

    return $normalized;
}

/**
 * --------------------------------------------------------------------------
 * Clean DNS text
 * --------------------------------------------------------------------------
 */

function cleanDnsText(string $value): string
{
    /**
     * Some upstream JSON responses may contain
     * escaped colon sequences.
     */

    $value = str_replace(
        ['\\:', '\\/'],
        [':', '/'],
        $value
    );

    return $value;
}

/**
 * --------------------------------------------------------------------------
 * DNS type code -> DNS type name
 * --------------------------------------------------------------------------
 */

function dnsTypeName(?int $typeCode): ?string
{
    $types = [
        1   => 'A',
        2   => 'NS',
        5   => 'CNAME',
        6   => 'SOA',
        12  => 'PTR',
        15  => 'MX',
        16  => 'TXT',
        28  => 'AAAA',
        33  => 'SRV',
        39  => 'DNAME',
        41  => 'OPT',
        43  => 'DS',
        46  => 'RRSIG',
        47  => 'NSEC',
        48  => 'DNSKEY',
        52  => 'TLSA',
        53  => 'SMIMEA',
        64  => 'SVCB',
        65  => 'HTTPS',
        99  => 'SPF',
        257 => 'CAA',
    ];

    return $types[$typeCode] ?? null;
}

/**
 * --------------------------------------------------------------------------
 * DNS status code -> human-readable name
 * --------------------------------------------------------------------------
 */

function getDnsStatusName(
    ?int $statusCode
): string {
    if ($statusCode === null) {
        return 'UNKNOWN';
    }

    return DNS_STATUS[$statusCode]
        ?? 'UNKNOWN';
}

/**
 * --------------------------------------------------------------------------
 * HTTP GET JSON helper
 * --------------------------------------------------------------------------
 */

function httpGetJson(string $url): array
{
    if (!function_exists('curl_init')) {
        return [
            'success' => false,
            'message' =>
                'PHP cURL extension tidak tersedia.',
        ];
    }

    $ch = curl_init();

    if ($ch === false) {
        return [
            'success' => false,
            'message' =>
                'Gagal membuat koneksi cURL.',
        ];
    }

    curl_setopt_array(
        $ch,
        [
            CURLOPT_URL => $url,

            CURLOPT_RETURNTRANSFER => true,

            CURLOPT_FOLLOWLOCATION => false,

            CURLOPT_CONNECTTIMEOUT =>
                CONNECT_TIMEOUT,

            CURLOPT_TIMEOUT =>
                REQUEST_TIMEOUT,

            CURLOPT_HTTPHEADER => [
                'Accept: application/dns-json',
                'User-Agent: XeooTools-DNS-Lookup/1.0',
            ],

            CURLOPT_SSL_VERIFYPEER => true,

            CURLOPT_SSL_VERIFYHOST => 2,
        ]
    );

    $body = curl_exec($ch);

    $curlError = curl_error($ch);

    $curlErrno = curl_errno($ch);

    $httpCode = (int) curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);

    if ($body === false) {
        return [
            'success' => false,
            'message' =>
                $curlError !== ''
                    ? $curlError
                    : "Request DNS gagal (cURL {$curlErrno}).",
        ];
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        return [
            'success' => false,
            'message' =>
                "Resolver DNS mengembalikan HTTP {$httpCode}.",
        ];
    }

    try {
        $json = json_decode(
            $body,
            true,
            512,
            JSON_THROW_ON_ERROR
        );
    } catch (Throwable) {
        return [
            'success' => false,
            'message' =>
                'Response resolver DNS bukan JSON yang valid.',
        ];
    }

    return [
        'success' => true,
        'data' => $json,
    ];
}