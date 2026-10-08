<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
| Allow requests from localhost / dev tunnels / vite dev server.
|--------------------------------------------------------------------------
*/

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$isAllowedOrigin =
    $origin !== '' &&
    (
        preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin) === 1 ||
        str_contains($origin, 'devtunnels.ms')
    );

if ($isAllowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');
}

/*
|--------------------------------------------------------------------------
| Handle CORS Preflight
|--------------------------------------------------------------------------
*/

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

/*
|--------------------------------------------------------------------------
| JSON Response Helper
|--------------------------------------------------------------------------
*/

function jsonResponse(
    bool $success,
    string $message = '',
    mixed $data = null,
    int $status = 200,
): never {
    http_response_code($status);

    $response = [
        'success' => $success,
    ];

    if ($message !== '') {
        $response['message'] = $message;
    }

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
    );

    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(false, 'Method not allowed.', null, 405);
}

/*
|--------------------------------------------------------------------------
| Load Simple .env
|--------------------------------------------------------------------------
*/

function loadSimpleEnv(string $file): void
{
    if (!is_file($file) || !is_readable($file)) {
        return;
    }

    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if ($name === '') {
            continue;
        }

        if (
            strlen($value) >= 2 &&
            (
                ($value[0] === '"' && $value[strlen($value) - 1] === '"') ||
                ($value[0] === "'" && $value[strlen($value) - 1] === "'")
            )
        ) {
            $value = substr($value, 1, -1);
        }

        if (getenv($name) === false) {
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
        }
    }
}

loadSimpleEnv(dirname(__DIR__) . '/.env');

/*
|--------------------------------------------------------------------------
| Read Request Body
|--------------------------------------------------------------------------
*/

$rawBody = file_get_contents('php://input');

if ($rawBody === false || trim($rawBody) === '') {
    jsonResponse(false, 'Request body is empty.', null, 400);
}

$payload = json_decode($rawBody, true);

if (!is_array($payload)) {
    jsonResponse(false, 'Invalid JSON request.', null, 400);
}

$rawInput = isset($payload['url']) && is_string($payload['url'])
    ? trim($payload['url'])
    : '';

if ($rawInput === '') {
    jsonResponse(false, 'Masukkan link atau URL yang ingin diperiksa.', null, 422);
}

if (strlen($rawInput) > 4096) {
    jsonResponse(false, 'URL terlalu panjang.', null, 422);
}

/*
|--------------------------------------------------------------------------
| Robust Input Normalization & Parsing
|--------------------------------------------------------------------------
*/

$cleanedInput = preg_replace('/^[\s\'"\(<]+|[\s\'"\)>]+$/', '', $rawInput) ?? $rawInput;

$hasExplicitScheme = (bool) preg_match('/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//', $cleanedInput);

if (!$hasExplicitScheme) {
    $normalizedUrl = 'https://' . $cleanedInput;
} else {
    $normalizedUrl = $cleanedInput;
}

// Extract Scheme
$scheme = 'https';
if (preg_match('/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//', $normalizedUrl, $schemeMatch)) {
    $scheme = strtolower($schemeMatch[1]);
}

$urlWithoutScheme = preg_replace('/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//', '', $normalizedUrl) ?? $normalizedUrl;

// Extract UserInfo (e.g. user:pass@host)
$hasUserInfo = false;
$userInfo = '';
if (str_contains($urlWithoutScheme, '@')) {
    $hasUserInfo = true;
    $atPos = strpos($urlWithoutScheme, '@');
    $slashPos = strpos($urlWithoutScheme, '/');
    if ($slashPos === false || $atPos < $slashPos) {
        $userInfo = substr($urlWithoutScheme, 0, $atPos);
        $urlWithoutScheme = substr($urlWithoutScheme, $atPos + 1);
    }
}

// Extract Host vs Path/Query
$firstSlash = strpos($urlWithoutScheme, '/');
$firstQuestion = strpos($urlWithoutScheme, '?');
$firstHash = strpos($urlWithoutScheme, '#');

$cutPoints = array_filter([$firstSlash, $firstQuestion, $firstHash], fn($pos) => $pos !== false);
$cutPos = !empty($cutPoints) ? min($cutPoints) : false;

if ($cutPos !== false) {
    $rawHost = substr($urlWithoutScheme, 0, $cutPos);
    $pathAndQuery = substr($urlWithoutScheme, $cutPos);
} else {
    $rawHost = $urlWithoutScheme;
    $pathAndQuery = '';
}

// Extract port if present
$port = null;
if (preg_match('/:(\d+)$/', $rawHost, $portMatch)) {
    $port = (int) $portMatch[1];
    $rawHost = substr($rawHost, 0, -strlen($portMatch[0]));
}

$host = strtolower(rtrim($rawHost, '.'));

if ($host === '') {
    jsonResponse(false, 'URL tidak memiliki hostname atau domain yang valid.', null, 422);
}

/*
|--------------------------------------------------------------------------
| Decode Leetspeak & Obfuscation
|--------------------------------------------------------------------------
*/

function decodeLeetspeak(string $text): string
{
    $text = strtolower($text);
    $replacements = [
        '4' => 'a',
        '@' => 'a',
        '0' => 'o',
        '3' => 'e',
        '1' => 'i',
        '!' => 'i',
        '5' => 's',
        '$' => 's',
        '8' => 'b',
        '7' => 't',
        '&' => 'and',
        '_' => '',
    ];
    return strtr($text, $replacements);
}

$decodedHost = decodeLeetspeak($host);
$decodedPathQuery = decodeLeetspeak(urldecode($pathAndQuery));
$fullDecodedTarget = $decodedHost . $decodedPathQuery;

/*
|--------------------------------------------------------------------------
| Verified Official Whitelist
|--------------------------------------------------------------------------
*/

$officialDomains = [
    // Banks Indonesia
    'bca.co.id', 'klikbca.com', 'bri.co.id', 'ib.bri.co.id', 'bni.co.id',
    'bankmandiri.co.id', 'mandirikartukredit.com', 'livin.bankmandiri.co.id',
    'banksinarmas.com', 'sinarmas.co.id', 'cimbniaga.co.id', 'octoclicks.co.id',
    'permatabank.com', 'bankbsi.co.id', 'jago.com', 'jenius.com', 'seabank.co.id',
    'blubybcadigital.id', 'bankmega.com', 'btn.co.id', 'danamon.co.id', 'panin.co.id',
    'ocbcnisp.com', 'maybank.co.id',
    // E-Wallets & Fintech
    'dana.id', 'ovo.id', 'gopay.co.id', 'shopee.co.id', 'shopeepay.co.id',
    'tokopedia.com', 'bukalapak.com', 'blibli.com', 'lazada.co.id',
    'linkaja.id', 'flip.id', 'paypal.com',
    // Logistics & Couriers
    'jet.co.id', 'jne.co.id', 'sicepat.com', 'posindonesia.co.id', 'anteraja.id',
    'ninjaexpress.id', 'spx.co.id', 'lionparcel.com', 'wahana.com', 'tiki.id',
    // Job Portals
    'jobstreet.co.id', 'jobstreet.com', 'glints.com', 'kalibrr.com', 'linkedin.com',
    'karir.com', 'techinasia.com', 'kitalulus.com',
    // Government (.go.id is generally checked by suffix)
    'kemensos.go.id', 'bpjs-kesehatan.go.id', 'bpjsketenagakerjaan.go.id',
    'prakerja.go.id', 'kominfo.go.id', 'pajak.go.id', 'kemenkes.go.id',
    'kemnaker.go.id', 'polri.go.id', 'kemendagri.go.id', 'kemenkeu.go.id',
    // Big Tech & Social Media
    'instagram.com', 'facebook.com', 'meta.com', 'whatsapp.com', 'telegram.org',
    'tiktok.com', 'twitter.com', 'x.com', 'google.com', 'google.co.id',
    'youtube.com', 'apple.com', 'microsoft.com', 'discord.com', 'spotify.com',
    'netflix.com', 'github.com', 'steamcommunity.com', 'steampowered.com'
];

function isOfficialDomain(string $host, array $officialList): bool
{
    // Match exact or standard subdomains (e.g. www.bca.co.id, klikbca.com, login.gov.id)
    if (str_ends_with($host, '.go.id')) {
        return true;
    }

    foreach ($officialList as $official) {
        if ($host === $official || str_ends_with($host, '.' . $official)) {
            return true;
        }
    }

    return false;
}

$isOfficial = isOfficialDomain($host, $officialDomains);

/*
|--------------------------------------------------------------------------
| Shortlink / URL Redirection Detection
|--------------------------------------------------------------------------
*/

$shortlinkDomains = [
    'bit.ly', 's.id', 'tinyurl.com', 'is.gd', 'cutt.ly', 'rb.gy', 't.ly',
    'v.gd', 'shorturl.at', 'linktr.ee', 'heylink.me', 'bio.link', 'taplink.cc',
    'wa.me', 't.me', 'page.link', 'app.link', 'ow.ly', 'buff.ly', 'gg.gg'
];

$isShortlink = false;
foreach ($shortlinkDomains as $shortDomain) {
    if ($host === $shortDomain || str_ends_with($host, '.' . $shortDomain)) {
        $isShortlink = true;
        break;
    }
}

/*
|--------------------------------------------------------------------------
| Suspicious TLD Detection
|--------------------------------------------------------------------------
*/

$suspiciousTlds = [
    'cc', 'top', 'xyz', 'tk', 'ml', 'ga', 'cf', 'gq', 'buzz', 'vip', 'work',
    'icu', 'monster', 'club', 'space', 'live', 'info', 'cyou', 'rest', 'fit',
    'surf', 'click', 'link', 'shop', 'online', 'site', 'website', 'cfd', 'sbs',
    'pw', 'cn', 'ru', 'su', 'biz', 'asia', 'fun', 'host', 'store', 'uno'
];

$hasSuspiciousTld = false;
$parts = explode('.', $host);
$tld = end($parts);
if (in_array($tld, $suspiciousTlds, true)) {
    $hasSuspiciousTld = true;
}

/*
|--------------------------------------------------------------------------
| URL Anomalies & Technical Signals
|--------------------------------------------------------------------------
*/

$isHttps = ($scheme === 'https');
$isIpHost = (filter_var($host, FILTER_VALIDATE_IP) !== false);
$hasPunycode = (stripos($host, 'xn--') !== false);
$hasUnicodeHost = (preg_match('/[^\x00-\x7F]/', $host) === 1);
$hasSpecialCharsInHost = (preg_match('/[&$_+=!]/', $rawHost) === 1);
$hasMultipleHyphens = (substr_count($host, '-') >= 2);

$decodedUrl = urldecode($normalizedUrl);
$hasEncodedCharacters = ($decodedUrl !== $normalizedUrl);
$hasMultipleEncodedSequences = (preg_match('/(?:%[0-9a-f]{2}){2,}/i', $normalizedUrl) === 1);

$hostLabels = array_values(array_filter(explode('.', $host), fn($l) => $l !== ''));
$excessiveSubdomains = (count($hostLabels) >= 4);
$isLongHostname = (strlen($host) > 60);
$hasSuspiciousPort = ($port !== null && !in_array($port, [80, 443], true));
$hasDoubleSlashPath = str_contains($pathAndQuery, '//');

/*
|--------------------------------------------------------------------------
| Target Brand Identification & Impersonation Engine
|--------------------------------------------------------------------------
*/

$brandTargets = [
    'Bank Sinarmas' => ['sinarmas', 'sinarm4s', 'banksinarmas', 'bank_sinarmas'],
    'Bank Central Asia (BCA)' => ['bca', 'klikbca', 'mybca', 'blubybcadigital', 'halo-bca'],
    'Bank Rakyat Indonesia (BRI)' => ['bri', 'brimo', 'ib.bri', 'bankbri', 'kur-bri'],
    'Bank Negara Indonesia (BNI)' => ['bni', 'bniexperience', 'bankbni'],
    'Bank Mandiri' => ['mandiri', 'livin', 'bankmandiri', 'mandirikartukredit'],
    'CIMB Niaga' => ['cimb', 'cimbniaga', 'octoclicks', 'octomobile'],
    'Bank Permata' => ['permata', 'permatabank', 'permatanet'],
    'Bank Syariah Indonesia (BSI)' => ['bsi', 'bankbsi', 'bsimobile'],
    'Bank Danamon' => ['danamon', 'danamononline'],
    'Bank Jago' => ['bankjago', 'jago'],
    'Jenius BTPN' => ['jenius', 'btpn'],
    'SeaBank' => ['seabank', 'seamoney'],
    'DANA Indonesia' => ['dana', 'danakaget', 'dana-kaget', 'dompet-dana', 'klaim-dana'],
    'OVO' => ['ovo', 'ovopoints', 'saldo-ovo'],
    'GoPay / Gojek' => ['gopay', 'gojek', 'saldo-gopay'],
    'Shopee / ShopeePay' => ['shopee', 'shopeepay', 'spaylater', 'shopeefood'],
    'J&T Express' => ['j&t', 'jnt', 'jtexpress', 'expre$s', 'jnt-express', 'jt_express', 'j&t_express'],
    'JNE Express' => ['jne', 'jne-express', 'jnetracking', 'agen-jne'],
    'SiCepat Ekspres' => ['sicepat', 'sicepat-ekspres', 'sicepat-resi'],
    'Pos Indonesia' => ['posindonesia', 'kantorpos', 'pos-pay'],
    'Shopee Xpress (SPX)' => ['spx', 'shopee-xpress', 'spx-express'],
    'JobStreet' => ['jobstreet', 'job-street', 'job_street', 'jobstret'],
    'Glints' => ['glints', 'glints-karir', 'glints-indonesia'],
    'Kalibrr' => ['kalibrr', 'kalibr-recruitment'],
    'LinkedIn' => ['linkedin', 'linkdin'],
    'Kemensos / Bansos Pemerintah' => ['kemensos', 'bansos', 'bpum', 'prakerja', 'blt', 'bantuan-sosial', 'bantuan-ppkm', 'bantuan-pemerintah', 'subsidi'],
    'BPJS Kesehatan / Ketenagakerjaan' => ['bpjs', 'bpjs-kesehatan', 'bpjsketenagakerjaan', 'jht'],
    'Instagram' => ['instagram', 'ig-', 'fotopicture', 'f0topicture', 'ig_photo', 'meta-copyright'],
    'Facebook / Meta' => ['facebook', 'fb-', 'meta-appeal', 'meta-support', 'meta-security'],
    'WhatsApp' => ['whatsapp', 'wa.me', 'wa-support', 'verifikasi-wa'],
    'Telegram' => ['telegram', 't.me', 'telegram-airdrop', 'tele-bot'],
    'TikTok' => ['tiktok', 'tiktok-shop', 'tiktok-reward'],
    'Google / Gmail' => ['google', 'gmail', 'google-security', 'google-verify'],
    'PayPal' => ['paypal', 'pay-pal', 'paypal-security']
];

$impersonatedBrand = null;
$brandMatchFound = false;

if (!$isOfficial) {
    foreach ($brandTargets as $brandName => $aliases) {
        foreach ($aliases as $alias) {
            $aliasPattern = '/' . preg_quote($alias, '/') . '/i';
            if (
                preg_match($aliasPattern, $host) ||
                preg_match($aliasPattern, $decodedHost) ||
                ($isShortlink && (preg_match($aliasPattern, $pathAndQuery) || preg_match($aliasPattern, $decodedPathQuery)))
            ) {
                $impersonatedBrand = $brandName;
                $brandMatchFound = true;
                break 2;
            }
        }
    }
}

/*
|--------------------------------------------------------------------------
| Modus Operandi Pattern Matching
|--------------------------------------------------------------------------
*/

$detectedModus = [];
$credentialTheftDetected = false;
$advanceFeeScamDetected = false;

// 1. Modus Hadiah / Bantuan Pemerintah / Bansos
$hadiahPattern = '/(hadiah|giveaway|undian|spin|winner|gebyar|pesta-hadiah|dana-kaget|danakaget|klaim|claim|bonus|saldo-gratis|bantuan|bansos|blt|bpum|prakerja|subsidi|kompensasi|pencairan|angpau|amplop)/i';
if (preg_match($hadiahPattern, $fullDecodedTarget)) {
    $detectedModus[] = 'Modus Hadiah, Undian & Bantuan Sosial Palsu';
}

// 2. Modus Cek Resi / Ekspedisi Paket Palsu
$resiPattern = '/(cekresi|cek-resi|lacak-resi|resi|tracking|paket|kurir|paket-tertahan|gagal-kirim|konfirmasi-alamat|ongkir|update-alamat|kiriman-paket)/i';
if (preg_match($resiPattern, $fullDecodedTarget)) {
    $detectedModus[] = 'Modus Cek Resi Ekspedisi & Tracking Paket Palsu';
}

// 3. Modus Lowongan Kerja Palsu / Part-Time Scam
$lokerPattern = '/(lowongan|low0ng4n|loker|karir|recruitment|interview|kerja-part-time|gaji-harian|komisi-harian|kerja-online|recruitment-vip|freelance-tugas|tugas-like)/i';
if (preg_match($lokerPattern, $fullDecodedTarget)) {
    $detectedModus[] = 'Modus Lowongan Pekerjaan / Rekrutmen Palsu';
}

// 4. Modus Sanggahan / Pengaduan Akun / Phishing Media Sosial & Botnet
$sanggahanPattern = '/(sanggahan|pengaduan|copyright|infringement|appeal|banned|disable-account|unblock|fotopicture|f0topicture|b0tnet|botnet|leak|foto-video|pulihkan|aktivasi-akun|security-alert)/i';
if (preg_match($sanggahanPattern, $fullDecodedTarget)) {
    $detectedModus[] = 'Modus Sanggahan Akun, Copyright Infringement & Phishing Sosmed / Botnet';
}

// 5. Credential & Sensitive Inputs Detection
$credentialPattern = '/(login|signin|sign-in|verify|verifikasi|confirm|password|passwd|pin|otp|2fa|cvv|kartu-kredit|m-banking|token|rekening|kredensial)/i';
if (preg_match($credentialPattern, $fullDecodedTarget)) {
    $credentialTheftDetected = true;
}

// 6. Advance Fee Scam Signals
$feePattern = '/(biaya-admin|biaya-pencairan|fee|transfer-admin|deposit|admin-fee|biaya-ongkir)/i';
if (preg_match($feePattern, $fullDecodedTarget)) {
    $advanceFeeScamDetected = true;
}

/*
|--------------------------------------------------------------------------
| Calculate Risk Score & Security Checks
|--------------------------------------------------------------------------
*/

$score = 0;
$checks = [];
$recommendations = [];

if ($isOfficial) {
    $score = 0;
    $checks[] = [
        'key' => 'officialDomain',
        'label' => 'Domain Resmi Terverifikasi',
        'status' => 'pass',
        'detail' => 'Domain ini terdaftar sebagai domain resmi terverifikasi.',
    ];
    $checks[] = [
        'key' => 'https',
        'label' => 'Protokol HTTPS',
        'status' => $isHttps ? 'pass' : 'warning',
        'detail' => $isHttps ? 'URL menggunakan koneksi aman HTTPS.' : 'Website resmi belum menggunakan HTTPS.',
    ];
    $recommendations[] = 'Domain ini adalah website resmi terpercaya. Tetap pastikan alamat pada bilah browser Anda tidak berubah.';
} else {
    // 1. Brand Impersonation Check
    if ($brandMatchFound) {
        $score += 55;
        $checks[] = [
            'key' => 'brandImpersonation',
            'label' => 'Tiruan / Pencatutan Brand Resmi',
            'status' => 'danger',
            'detail' => "URL ini meniru atau mencatut nama '{$impersonatedBrand}' pada domain yang BUKAN domain resminya.",
        ];
        $recommendations[] = "Waspada! Website ini BUKAN situs resmi {$impersonatedBrand}. JANGAN masukkan username, password, nomor kartu, PIN, atau kode OTP Anda.";
    } else {
        $checks[] = [
            'key' => 'brandImpersonation',
            'label' => 'Identifikasi Brand',
            'status' => 'pass',
            'detail' => 'Tidak ditemukan indikasi pencatutan nama brand ternama pada domain ini.',
        ];
    }

    // 2. Modus Operandi Check
    if (!empty($detectedModus)) {
        $score += 25;
        $checks[] = [
            'key' => 'modusOperandi',
            'label' => 'Pola Modus Penipuan',
            'status' => 'danger',
            'detail' => 'Terdeteksi indikasi modus: ' . implode(', ', $detectedModus),
        ];

        if (in_array('Modus Hadiah, Undian & Bantuan Sosial Palsu', $detectedModus, true)) {
            $recommendations[] = 'Jangan percaya klaim hadiah/bantuan sosial yang meminta Anda mengisi formulir data pribadi atau membayar sejumlah biaya administrasi.';
        }
        if (in_array('Modus Cek Resi Ekspedisi & Tracking Paket Palsu', $detectedModus, true)) {
            $recommendations[] = 'Jangan mengunduh file (.apk / file berbahaya) dari link resi tidak resmi. Lacak resi hanya melalui aplikasi resmi ekspedisi terkait.';
        }
        if (in_array('Modus Lowongan Pekerjaan / Rekrutmen Palsu', $detectedModus, true)) {
            $recommendations[] = 'Lowongan kerja resmi tidak memungut biaya, meminta deposit, atau menjanjikan komisi instan untuk like/follow medsos.';
        }
        if (in_array('Modus Sanggahan Akun, Copyright Infringement & Phishing Sosmed / Botnet', $detectedModus, true)) {
            $recommendations[] = 'Pemberitahuan penutupan akun atau pelanggaran hak cipta palsu sering digunakan untuk mencuri akun media sosial Anda.';
        }
    } else {
        $checks[] = [
            'key' => 'modusOperandi',
            'label' => 'Pola Modus Penipuan',
            'status' => 'pass',
            'detail' => 'Tidak ditemukan kata kunci modus penipuan umum pada URL ini.',
        ];
    }

    // 3. Credential Harvesting Check
    if ($credentialTheftDetected) {
        $score += 20;
        $checks[] = [
            'key' => 'credentialTheft',
            'label' => 'Deteksi Formulir Kredensial',
            'status' => 'warning',
            'detail' => 'URL mengarah pada jalur login, verifikasi, OTP, atau pemulihan akun yang berisiko jika bukan di situs resmi.',
        ];
        $recommendations[] = 'JANGAN PERNAH membagikan kode OTP atau PIN m-banking/e-wallet kepada siapapun.';
    }

    // 4. Advance Fee Warning
    if ($advanceFeeScamDetected) {
        $score += 20;
        $checks[] = [
            'key' => 'advanceFee',
            'label' => 'Permintaan Biaya / Fee Terdeteksi',
            'status' => 'warning',
            'detail' => 'URL mengandung istilah permintaan biaya admin, ongkir tertahan, atau deposit pencairan.',
        ];
        $recommendations[] = 'Jangan lakukan transfer dana untuk menebus hadiah, bantuan pemerintah, atau paket tertahan.';
    }

    // 5. Shortlink Check
    if ($isShortlink) {
        $score += 15;
        $checks[] = [
            'key' => 'shortlink',
            'label' => 'Pemendek URL (Shortlink)',
            'status' => 'warning',
            'detail' => 'URL menggunakan pemendek link yang menyamarkan tujuan asli website. Sangat sering digunakan pada pesan scam SMS/WhatsApp.',
        ];
    } else {
        $checks[] = [
            'key' => 'shortlink',
            'label' => 'Pemendek URL (Shortlink)',
            'status' => 'pass',
            'detail' => 'URL tidak menggunakan layanan pemendek link.',
        ];
    }

    // 6. Suspicious TLD Check
    if ($hasSuspiciousTld) {
        $score += 15;
        $checks[] = [
            'key' => 'suspiciousTld',
            'label' => 'Ekstensi Domain (TLD)',
            'status' => 'warning',
            'detail' => "Menggunakan ekstensi '.{$tld}' yang sering diasosiasikan dengan domain murah untuk kampanye phishing massal.",
        ];
    } else {
        $checks[] = [
            'key' => 'suspiciousTld',
            'label' => 'Ekstensi Domain (TLD)',
            'status' => 'pass',
            'detail' => "Menggunakan ekstensi domain standar (.{$tld}).",
        ];
    }

    // 7. Special Characters & Leetspeak Typosquatting Check
    if ($hasSpecialCharsInHost || $decodedHost !== $host) {
        $score += 20;
        $checks[] = [
            'key' => 'leetspeakObfuscation',
            'label' => 'Karakter Aneh & Modifikasi Huruf (Leetspeak)',
            'status' => 'danger',
            'detail' => 'Hostname mengandung karakter modifikasi (seperti angka pengganti huruf, simbol $, &, atau underscore) untuk mengelabui korban.',
        ];
    }

    // 8. UserInfo / Credential in URL
    if ($hasUserInfo) {
        $score += 25;
        $checks[] = [
            'key' => 'userInfo',
            'label' => 'Sintaks User-Info (@)',
            'status' => 'danger',
            'detail' => 'URL menggunakan karakter @ sebelum domain untuk menyamarkan alamat website yang sebenarnya.',
        ];
    }

    // 9. IP Host Check
    if ($isIpHost) {
        $score += 20;
        $checks[] = [
            'key' => 'ipHost',
            'label' => 'Alamat IP Langsung',
            'status' => 'warning',
            'detail' => 'URL menggunakan alamat IP numerik alih-alih domain resmi.',
        ];
    }

    // 10. Punycode Check
    if ($hasPunycode || $hasUnicodeHost) {
        $score += 20;
        $checks[] = [
            'key' => 'punycode',
            'label' => 'IDN / Punycode Homograph',
            'status' => 'warning',
            'detail' => 'Domain menggunakan karakter non-standar/punycode yang berpotensi menjadi tiruan homograf visual.',
        ];
    }

    // 11. Excessive Subdomains Check
    if ($excessiveSubdomains) {
        $score += 10;
        $checks[] = [
            'key' => 'subdomains',
            'label' => 'Struktur Subdomain',
            'status' => 'warning',
            'detail' => 'Hostname memiliki struktur subdomain yang terlalu bertingkat/dalam.',
        ];
    }

    // 12. HTTPS Check
    if ($isHttps) {
        $checks[] = [
            'key' => 'https',
            'label' => 'Protokol HTTPS',
            'status' => 'pass',
            'detail' => 'URL menggunakan enkripsi HTTPS (catatan: situs penipuan modern juga bisa memiliki sertifikat SSL gratis).',
        ];
    } else {
        $score += 10;
        $checks[] = [
            'key' => 'https',
            'label' => 'Protokol HTTPS',
            'status' => 'warning',
            'detail' => 'URL tidak menggunakan HTTPS (data tidak terenkripsi).',
        ];
    }
}

/*
|--------------------------------------------------------------------------
| Google Web Risk API Check
|--------------------------------------------------------------------------
*/

function getWebRiskApiKey(): string
{
    $value = getenv('GOOGLE_WEB_RISK_API_KEY');
    if ($value !== false && trim($value) !== '') {
        return trim($value);
    }
    if (isset($_ENV['GOOGLE_WEB_RISK_API_KEY']) && trim((string) $_ENV['GOOGLE_WEB_RISK_API_KEY']) !== '') {
        return trim((string) $_ENV['GOOGLE_WEB_RISK_API_KEY']);
    }
    return '';
}

function checkWebRisk(string $url, string $apiKey): array
{
    if ($apiKey === '') {
        return [
            'service' => 'unavailable',
            'detected' => false,
        ];
    }

    $baseUrl = 'https://webrisk.googleapis.com/v1/uris:search';
    $queryParts = [
        'threatTypes=' . rawurlencode('SOCIAL_ENGINEERING'),
        'threatTypes=' . rawurlencode('MALWARE'),
        'threatTypes=' . rawurlencode('UNWANTED_SOFTWARE'),
        'uri=' . rawurlencode($url),
        'key=' . rawurlencode($apiKey),
    ];

    $requestUrl = $baseUrl . '?' . implode('&', $queryParts);

    $ch = curl_init($requestUrl);
    if ($ch === false) {
        return ['service' => 'error', 'detected' => false];
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPGET => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
    ]);

    $responseBody = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($responseBody === false || $curlError !== '' || $httpCode < 200 || $httpCode >= 300) {
        return ['service' => 'error', 'detected' => false];
    }

    $res = json_decode($responseBody, true);
    if (!is_array($res)) {
        return ['service' => 'error', 'detected' => false];
    }

    $threatTypes = $res['threat']['threatTypes'] ?? [];
    $detected = is_array($threatTypes) && count($threatTypes) > 0;

    return [
        'service' => 'available',
        'detected' => $detected,
    ];
}

$webRisk = checkWebRisk($normalizedUrl, getWebRiskApiKey());

if ($webRisk['detected'] === true) {
    $score += 80;
    $checks[] = [
        'key' => 'threatIntelligence',
        'label' => 'Google Web Risk Threat Intelligence',
        'status' => 'danger',
        'detail' => 'Database Google Web Risk mengonfirmasi link ini sebagai ancaman berbahaya (Social Engineering / Malware).',
    ];
}

/*
|--------------------------------------------------------------------------
| Finalize Score & Risk Level
|--------------------------------------------------------------------------
*/

$score = max(0, min(100, $score));

if ($score >= 70) {
    $riskLevel = 'dangerous';
    $riskLabel = 'Sangat Berbahaya (Scam / Phishing)';
    $riskSummary = 'Link ini memiliki indikasi kuat sebagai website penipuan atau pencurian data penting. JANGAN BUKA link ini dan JANGAN masukkan informasi pribadi apapun.';
} elseif ($score >= 40) {
    $riskLevel = 'high';
    $riskLabel = 'Berisiko Tinggi (High Risk)';
    $riskSummary = 'Beberapa sinyal bahaya terdeteksi pada struktur link ini. Berhati-hatilah dan jangan pernah melakukan transaksi atau memasukkan data rahasia.';
} elseif ($score >= 20) {
    $riskLevel = 'suspicious';
    $riskLabel = 'Mencurigakan (Suspicious)';
    $riskSummary = 'Ditemukan beberapa kejanggalan pada alamat website ini. Pastikan Anda memverifikasi keaslian pengirim sebelum melanjutkan.';
} else {
    $riskLevel = 'low';
    $riskLabel = 'Risiko Rendah / Aman (Safe)';
    $riskSummary = 'Tidak ditemukan indikasi bahaya atau pola penipuan yang mencurigakan pada alamat website ini.';
}

if (empty($recommendations)) {
    $recommendations[] = 'Tetap waspada dan selalu periksa URL di browser sebelum login atau melakukan pembayaran.';
}

/*
|--------------------------------------------------------------------------
| Return Comprehensive Response
|--------------------------------------------------------------------------
*/

$data = [
    'url' => $normalizedUrl,
    'hostname' => $host,
    'risk' => [
        'score' => $score,
        'level' => $riskLevel,
        'label' => $riskLabel,
        'summary' => $riskSummary,
    ],
    'threat' => [
        'detected' => $webRisk['detected'],
        'service' => $webRisk['service'],
    ],
    'brandImpersonated' => $impersonatedBrand,
    'detectedModus' => $detectedModus,
    'recommendations' => array_values(array_unique($recommendations)),
    'urlAnalysis' => [
        'https' => $isHttps,
        'ipHost' => $isIpHost,
        'punycode' => $hasPunycode,
        'userInfo' => $hasUserInfo,
        'suspiciousPath' => !empty($detectedModus) || $credentialTheftDetected,
        'excessiveSubdomains' => $excessiveSubdomains,
        'encodedCharacters' => $hasEncodedCharacters || $hasMultipleEncodedSequences,
        'unicodeHost' => $hasUnicodeHost,
        'shortlink' => $isShortlink,
        'suspiciousTld' => $hasSuspiciousTld,
        'specialCharsInHost' => $hasSpecialCharsInHost,
    ],
    'checks' => $checks,
];

jsonResponse(true, 'Pemeriksaan link penipuan selesai.', $data);
