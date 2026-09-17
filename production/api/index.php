<?php
declare(strict_types=1);

/*
 * AutoKlinika production API — PHP + private JSON storage.
 * Public location:  public_html/api/index.php
 * Private storage:  ../private/ (sibling of public_html)
 * No SQL database and no external PHP packages are required.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_name('ak_admin_session');
session_set_cookie_params([
    'lifetime' => 8 * 60 * 60,
    'path' => '/',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Strict',
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

const MAX_JSON_BYTES = 8 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const LEAD_WINDOW_SECONDS = 10 * 60;
const LEAD_MAX_SUBMISSIONS = 5;
const LOGIN_WINDOW_SECONDS = 5 * 60;
const LOGIN_MAX_FAILURES = 6;

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function cut_text(mixed $value, int $max): string {
    $text = trim((string)($value ?? ''));
    if (function_exists('mb_substr')) return mb_substr($text, 0, $max, 'UTF-8');
    return substr($text, 0, $max);
}

function utc_now(): string {
    return gmdate('Y-m-d\TH:i:s\Z');
}

function private_root(): string {
    // index.php lives in public_html/api/, therefore two levels up is the directory
    // containing public_html. The private directory is its sibling.
    $root = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'private';
    if (!is_dir($root)) {
        respond(500, [
            'ok' => false,
            'error' => 'Brak katalogu private obok public_html. Wgraj oba katalogi z dist/.',
        ]);
    }
    return $root;
}

function runtime_root(): string {
    $dir = private_root() . DIRECTORY_SEPARATOR . 'runtime';
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        respond(500, ['ok' => false, 'error' => 'Nie można utworzyć katalogu private/runtime. Sprawdź uprawnienia zapisu.']);
    }
    return $dir;
}

function config(): array {
    static $cfg = null;
    if (is_array($cfg)) return $cfg;
    $path = private_root() . DIRECTORY_SEPARATOR . 'config.php';
    if (!is_file($path)) respond(500, ['ok' => false, 'error' => 'Brak private/config.php. Uruchom npm run build i wgraj oba katalogi.']);
    $loaded = require $path;
    if (!is_array($loaded)) respond(500, ['ok' => false, 'error' => 'Nieprawidłowa konfiguracja private/config.php.']);
    $cfg = $loaded;
    date_default_timezone_set((string)($cfg['timezone'] ?? 'Europe/Warsaw'));
    return $cfg;
}

function defaults_state(): array {
    static $state = null;
    if (is_array($state)) return $state;
    $path = private_root() . DIRECTORY_SEPARATOR . 'default_content.json';
    $raw = @file_get_contents($path);
    $decoded = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($decoded)) respond(500, ['ok' => false, 'error' => 'Brak lub błąd private/default_content.json.']);
    $state = $decoded;
    return $state;
}

function data_path(string $name): string {
    return runtime_root() . DIRECTORY_SEPARATOR . $name . '.json';
}

function read_json_file(string $name, mixed $default): mixed {
    $path = data_path($name);
    if (!is_file($path)) return $default;
    $raw = @file_get_contents($path);
    if (!is_string($raw) || $raw === '') return $default;
    $data = json_decode($raw, true);
    return json_last_error() === JSON_ERROR_NONE ? $data : $default;
}

function atomic_write_path(string $path, mixed $data): void {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($json)) throw new RuntimeException('Nie można zakodować danych JSON.');
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $json . "\n", LOCK_EX) === false) {
        @unlink($tmp);
        throw new RuntimeException('Nie można zapisać danych w katalogu private/runtime.');
    }
    @chmod($tmp, 0640);
    if (!@rename($tmp, $path)) {
        @unlink($path);
        if (!@rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException('Nie można podmienić pliku danych.');
        }
    }
}

function write_json_file(string $name, mixed $data): void {
    atomic_write_path(data_path($name), $data);
}

function mutate_json_file(string $name, mixed $default, callable $fn): mixed {
    $path = data_path($name);
    $lockPath = $path . '.lock';
    $fh = @fopen($lockPath, 'c+');
    if (!$fh) throw new RuntimeException('Nie można otworzyć blokady pliku danych.');
    try {
        if (!flock($fh, LOCK_EX)) throw new RuntimeException('Nie można zablokować pliku danych.');
        $current = $default;
        if (is_file($path)) {
            $raw = @file_get_contents($path);
            $decoded = is_string($raw) ? json_decode($raw, true) : null;
            if (json_last_error() === JSON_ERROR_NONE) $current = $decoded;
        }
        $result = $fn($current);
        $newData = $result;
        $returnValue = $result;
        if (is_array($result) && array_key_exists('__data', $result)) {
            $newData = $result['__data'];
            $returnValue = $result['__return'] ?? $newData;
        }
        atomic_write_path($path, $newData);
        flock($fh, LOCK_UN);
        return $returnValue;
    } finally {
        @fclose($fh);
    }
}

function cms_state(): array {
    $initial = [
        'live' => defaults_state(),
        'draft' => defaults_state(),
        'liveUpdatedAt' => utc_now(),
        'draftUpdatedAt' => utc_now(),
    ];
    $data = read_json_file('cms', null);
    if (!is_array($data) || !isset($data['live'], $data['draft'])) {
        write_json_file('cms', $initial);
        return $initial;
    }
    return $data;
}

function state_counts(array $state): array {
    $services = isset($state['services']) && is_array($state['services']) ? count($state['services']) : 0;
    $faqs = isset($state['faqs']) && is_array($state['faqs']) ? count($state['faqs']) : 0;
    $prices = 0;
    foreach (($state['pricing']['categories'] ?? []) as $category) {
        foreach (($category['groups'] ?? []) as $group) $prices += count($group['rows'] ?? []);
    }
    return ['services' => $services, 'faqs' => $faqs, 'prices' => $prices];
}

function valid_state(mixed $state): bool {
    return is_array($state)
        && isset($state['business']) && is_array($state['business'])
        && isset($state['pricing']) && is_array($state['pricing'])
        && isset($state['home']) && is_array($state['home'])
        && isset($state['faqs']) && is_array($state['faqs']);
}

function request_json(): array {
    $len = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($len > MAX_JSON_BYTES) respond(413, ['ok' => false, 'error' => 'Żądanie jest zbyt duże.']);
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || $raw === '') return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) respond(400, ['ok' => false, 'error' => 'Nieprawidłowy JSON.']);
    return $data;
}

function path_after_api(): string {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/api', PHP_URL_PATH) ?: '/api';
    $pos = strpos($path, '/api');
    if ($pos !== false) $path = substr($path, $pos + 4);
    $path = '/' . ltrim($path, '/');
    return $path === '/' ? '/' : rtrim($path, '/');
}

function client_ip_hash(): string {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $secret = (string)(config()['captcha_secret'] ?? 'autoklinika');
    return hash_hmac('sha256', $ip, $secret);
}

function require_admin(): void {
    if (empty($_SESSION['ak_admin'])) respond(401, ['ok' => false, 'error' => 'Wymagane logowanie.']);
}

function next_id(array $items): int {
    $max = 0;
    foreach ($items as $item) $max = max($max, (int)($item['id'] ?? 0));
    return $max + 1;
}

function retention_days(string $kind): int {
    $live = cms_state()['live'];
    $key = $kind === 'analytics' ? 'analyticsRetentionDays' : 'leadRetentionDays';
    $fallback = $kind === 'analytics' ? 180 : 365;
    $n = (int)($live['settings'][$key] ?? $fallback);
    return max(7, min(3650, $n));
}


function booking_service_key(string $topic): string {
    $v = function_exists('mb_strtolower') ? mb_strtolower($topic, 'UTF-8') : strtolower($topic);
    $map = [
        'diagnost' => 'diagnostics',
        'geometr' => 'geometry',
        'klimatyz' => 'climate',
        'mechan' => 'mechanic',
        'wulkan' => 'tires',
        'opon' => 'tires',
        'olej' => 'oil',
        'okresow' => 'oil',
        'przegl' => 'oil',
    ];
    foreach ($map as $needle => $key) if (str_contains($v, $needle)) return $key;
    return '';
}

function booking_availability_config(): array {
    $live = cms_state()['live'] ?? [];
    $raw = $live['settings']['bookingAvailability'] ?? [];
    $defaults = [
        'enabled' => true,
        'horizonDays' => 75,
        'limitedWindowDays' => 2,
        'weekendsClosed' => true,
        'services' => [
            'diagnostics' => ['leadDays'=>2], 'geometry' => ['leadDays'=>3],
            'climate' => ['leadDays'=>0], 'mechanic' => ['leadDays'=>7],
            'tires' => ['leadDays'=>2], 'oil' => ['leadDays'=>3],
        ],
    ];
    $cfg = array_replace($defaults, is_array($raw) ? $raw : []);
    $cfg['services'] = array_replace_recursive($defaults['services'], is_array($raw['services'] ?? null) ? $raw['services'] : []);
    return $cfg;
}

function validate_preferred_date(array $payload): ?string {
    $date = trim((string)($payload['date'] ?? ''));
    if ($date === '') return null;
    $topic = trim((string)($payload['topic'] ?? ($payload['subject'] ?? '')));
    $key = booking_service_key($topic);
    if ($key === '') return 'Wybierz temat usługi przed wskazaniem dnia.';
    $cfg = booking_availability_config();
    if (($cfg['enabled'] ?? true) === false) return null;
    $tz = new DateTimeZone((string)(config()['timezone'] ?? 'Europe/Warsaw'));
    $selected = DateTimeImmutable::createFromFormat('!Y-m-d', $date, $tz);
    if (!$selected || $selected->format('Y-m-d') !== $date) return 'Nieprawidłowa data preferowanego terminu.';
    $today = new DateTimeImmutable('today', $tz);
    $lead = max(0, min(60, (int)($cfg['services'][$key]['leadDays'] ?? 0)));
    $earliest = $today->modify('+' . $lead . ' days');
    if (($cfg['weekendsClosed'] ?? true) !== false) {
        while ((int)$earliest->format('N') >= 6) $earliest = $earliest->modify('+1 day');
        if ((int)$selected->format('N') >= 6) return 'Wybierz dzień od poniedziałku do piątku.';
    }
    if ($selected < $earliest) return 'Dla wybranego tematu najwcześniejszy preferowany dzień to ' . $earliest->format('d.m.Y') . '.';
    $horizon = max(14, min(365, (int)($cfg['horizonDays'] ?? 75)));
    if ($selected > $today->modify('+' . $horizon . ' days')) return 'Wybierz termin z dostępnego zakresu kalendarza.';
    return null;
}

function cutoff_iso(int $days): string {
    return gmdate('Y-m-d\TH:i:s\Z', time() - $days * 86400);
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string|false {
    $padding = strlen($data) % 4;
    if ($padding) $data .= str_repeat('=', 4 - $padding);
    return base64_decode(strtr($data, '-_', '+/'), true);
}

function captcha_create(): array {
    $a = random_int(2, 9);
    $b = random_int(1, 9);
    $payload = ['a' => $a, 'b' => $b, 'ts' => time(), 'nonce' => bin2hex(random_bytes(6))];
    $body = base64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE));
    $sig = hash_hmac('sha256', $body, (string)config()['captcha_secret']);
    return ['question' => "$a + $b = ?", 'token' => $body . '.' . $sig];
}

function captcha_verify(string $token, string $answer): bool {
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2) return false;
    [$body, $sig] = $parts;
    $expected = hash_hmac('sha256', $body, (string)config()['captcha_secret']);
    if (!hash_equals($expected, $sig)) return false;
    $raw = base64url_decode($body);
    $data = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($data)) return false;
    $age = time() - (int)($data['ts'] ?? 0);
    if ($age < 2 || $age > 3600) return false;
    $sum = (int)($data['a'] ?? -100) + (int)($data['b'] ?? -100);
    return hash_equals((string)$sum, trim($answer));
}

function rate_limit(string $bucket, int $window, int $max): array {
    $key = client_ip_hash();
    $now = time();
    $result = mutate_json_file('rate_limits', [], function ($all) use ($bucket, $window, $max, $key, $now) {
        if (!is_array($all)) $all = [];
        $entries = $all[$bucket][$key] ?? [];
        if (!is_array($entries)) $entries = [];
        $entries = array_values(array_filter($entries, fn($ts) => (int)$ts > $now - $window));
        $allowed = count($entries) < $max;
        $retry = 0;
        if (!$allowed && $entries) $retry = max(1, $window - ($now - (int)min($entries)));
        if ($allowed) $entries[] = $now;
        $all[$bucket][$key] = $entries;
        // Opportunistic cleanup: drop empty/old IP buckets.
        foreach (($all[$bucket] ?? []) as $k => $times) {
            $fresh = array_values(array_filter((array)$times, fn($ts) => (int)$ts > $now - $window));
            if ($fresh) $all[$bucket][$k] = $fresh; else unset($all[$bucket][$k]);
        }
        return ['__data' => $all, '__return' => ['allowed' => $allowed, 'retry' => $retry]];
    });
    return is_array($result) ? $result : ['allowed' => true, 'retry' => 0];
}

function log_line(string $filename, string $line): void {
    $path = runtime_root() . DIRECTORY_SEPARATOR . $filename;
    @file_put_contents($path, '[' . date('Y-m-d H:i:s') . '] ' . $line . "\n", FILE_APPEND | LOCK_EX);
}

function format_lead_mail(int $id, string $source, array $payload): string {
    $sourceLabel = match ($source) {
        'homepage' => 'Strona główna',
        'cennik' => 'Cennik',
        default => $source,
    };
    $date = cut_text($payload['date'] ?? '', 40) ?: '—';
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $dt = DateTime::createFromFormat('Y-m-d', $date);
        if ($dt) $date = $dt->format('d.m.Y');
    }
    $topic = cut_text($payload['topic'] ?? ($payload['subject'] ?? ''), 160) ?: '—';
    $lines = [
        "AUTOKLINIKA — NOWE ZGŁOSZENIE #$id",
        '',
        'Klient: ' . (cut_text($payload['name'] ?? '', 120) ?: '—'),
        'Tel: ' . (cut_text($payload['phone'] ?? '', 50) ?: '—'),
        'Auto: ' . (cut_text($payload['car'] ?? '', 120) ?: '—'),
        'Temat: ' . $topic,
        'Preferowany termin: ' . $date,
        'Źródło: ' . $sourceLabel,
        'Otrzymano: ' . date('d.m.Y H:i'),
    ];
    $message = cut_text($payload['message'] ?? '', 3000);
    if ($message !== '') {
        $lines[] = '';
        $lines[] = 'Opis:';
        $lines[] = $message;
    }
    $lines[] = '';
    $lines[] = 'Zgłoszenie jest zapisane również w panelu administratora AutoKliniki.';
    return implode("\n", $lines);
}

function send_lead_mail(int $id, string $source, array $payload): bool {
    $cfg = config();
    $to = (string)($cfg['mail_to'] ?? 'autoklinikagorzyn@gmail.com');
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
    $topic = cut_text($payload['topic'] ?? ($payload['subject'] ?? ($payload['car'] ?? 'formularz')), 70) ?: 'formularz';
    $subjectRaw = "[AutoKlinika] Nowe zgłoszenie #$id — $topic";
    $subject = '=?UTF-8?B?' . base64_encode($subjectRaw) . '?=';
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? 'autoklinika.org'));
    $host = preg_replace('/:\d+$/', '', $host) ?: 'autoklinika.org';
    $host = preg_replace('/^www\./', '', $host) ?: 'autoklinika.org';
    if (!preg_match('/^[a-z0-9.-]+$/', $host) || !str_contains($host, '.')) $host = 'autoklinika.org';
    $from = 'no-reply@' . $host;
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: AutoKlinika WWW <' . $from . '>',
        'Reply-To: ' . $from,
        'X-Mailer: AutoKlinika-WWW/13',
    ];
    $body = format_lead_mail($id, $source, $payload);
    $ok = @mail($to, $subject, $body, implode("\r\n", $headers));
    log_line('mail.log', 'lead #' . $id . ' -> ' . $to . ' : ' . ($ok ? 'OK' : 'FAILED'));
    return $ok;
}

function recursive_has_value(mixed $value, string $needle): bool {
    if (is_string($value)) return $value === $needle;
    if (is_array($value)) foreach ($value as $v) if (recursive_has_value($v, $needle)) return true;
    return false;
}

function public_upload_dir(): string {
    $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Nie można utworzyć public/uploads.');
    }
    return $dir;
}

function analytics_payload(int $days): array {
    $events = read_json_file('events', []);
    $leads = read_json_file('leads', []);
    if (!is_array($events)) $events = [];
    if (!is_array($leads)) $leads = [];
    $sinceTs = strtotime(gmdate('Y-m-d', time() - ($days - 1) * 86400) . ' 00:00:00 UTC');
    $totals = []; $dailyMap = []; $pages = []; $sources = []; $devices = []; $campaigns = [];
    foreach ($events as $e) {
        $ts = strtotime((string)($e['created_at'] ?? '')) ?: 0;
        if ($ts < $sinceTs) continue;
        $type = (string)($e['event_type'] ?? '');
        if ($type === '') continue;
        $totals[$type] = ($totals[$type] ?? 0) + 1;
        $day = substr((string)($e['created_at'] ?? ''), 0, 10);
        $key = $day . '|' . $type;
        $dailyMap[$key] = ($dailyMap[$key] ?? 0) + 1;
        if ($type === 'page_view') {
            $page = (string)($e['page'] ?? '/');
            $pages[$page] = ($pages[$page] ?? 0) + 1;
            $meta = is_array($e['payload'] ?? null) ? $e['payload'] : [];
            $src = cut_text($meta['trafficSource'] ?? 'direct', 100) ?: 'direct';
            $dev = cut_text($meta['device'] ?? 'unknown', 40) ?: 'unknown';
            $campaign = cut_text($meta['utmCampaign'] ?? '', 100);
            $sources[$src] = ($sources[$src] ?? 0) + 1;
            $devices[$dev] = ($devices[$dev] ?? 0) + 1;
            if ($campaign !== '') $campaigns[$campaign] = ($campaigns[$campaign] ?? 0) + 1;
        }
    }
    $daily = [];
    foreach ($dailyMap as $key => $count) {
        [$day, $type] = explode('|', $key, 2);
        $daily[] = ['day' => $day, 'event_type' => $type, 'c' => $count];
    }
    usort($daily, fn($a, $b) => strcmp($a['day'], $b['day']));
    arsort($pages); arsort($sources); arsort($devices); arsort($campaigns);
    $leadCount = 0;
    foreach ($leads as $lead) if ((strtotime((string)($lead['created_at'] ?? '')) ?: 0) >= $sinceTs) $leadCount++;
    return [
        'ok' => true, 'days' => $days, 'totals' => $totals, 'daily' => $daily,
        'pages' => array_map(fn($k, $v) => ['page' => $k, 'c' => $v], array_keys(array_slice($pages, 0, 10, true)), array_values(array_slice($pages, 0, 10, true))),
        'sources' => array_map(fn($k, $v) => ['source' => $k, 'c' => $v], array_keys($sources), array_values($sources)),
        'devices' => array_map(fn($k, $v) => ['device' => $k, 'c' => $v], array_keys($devices), array_values($devices)),
        'campaigns' => array_map(fn($k, $v) => ['campaign' => $k, 'c' => $v], array_keys($campaigns), array_values($campaigns)),
        'leadCount' => $leadCount,
    ];
}

// Ensure configuration is readable now, so deployment errors fail early and clearly.
config();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$route = path_after_api();

try {
    if ($method === 'GET' && $route === '/build-info') {
        respond(200, ['ok' => true, 'build' => (string)(config()['build'] ?? 'v13')]);
    }

    if ($method === 'GET' && $route === '/captcha') {
        respond(200, ['ok' => true] + captcha_create());
    }

    if ($method === 'GET' && $route === '/public-state') {
        $cms = cms_state();
        respond(200, ['ok' => true, 'state' => $cms['live'], 'updatedAt' => $cms['liveUpdatedAt'] ?? null, 'counts' => state_counts($cms['live'])]);
    }

    if ($method === 'GET' && $route === '/google-reviews') {
        respond(200, ['ok' => true, 'configured' => false, 'available' => false, 'reviews' => [], 'mode' => 'static']);
    }

    if ($method === 'GET' && $route === '/admin/session') {
        $auth = !empty($_SESSION['ak_admin']);
        respond(200, ['ok' => true, 'authenticated' => $auth, 'user' => $auth ? 'admin' : null, 'demo' => false]);
    }

    if ($method === 'POST' && $route === '/login') {
        $rate = rate_limit('login', LOGIN_WINDOW_SECONDS, LOGIN_MAX_FAILURES);
        if (!$rate['allowed']) {
            header('Retry-After: ' . (int)$rate['retry']);
            respond(429, ['ok' => false, 'error' => 'Zbyt wiele prób logowania. Spróbuj ponownie później.']);
        }
        $data = request_json();
        $cfg = config();
        $loginOk = hash_equals((string)($cfg['admin_login'] ?? 'admin'), (string)($data['login'] ?? ''));
        $passHash = hash('sha256', (string)($data['password'] ?? ''));
        $passwordOk = hash_equals((string)($cfg['admin_password_sha256'] ?? ''), $passHash);
        if (!$loginOk || !$passwordOk) respond(401, ['ok' => false, 'error' => 'Nieprawidłowy login lub hasło.']);
        session_regenerate_id(true);
        $_SESSION['ak_admin'] = true;
        $_SESSION['ak_admin_since'] = time();
        respond(200, ['ok' => true, 'user' => 'admin', 'demo' => false]);
    }

    if ($method === 'POST' && $route === '/logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool)$params['secure'], (bool)$params['httponly']);
        }
        session_destroy();
        respond(200, ['ok' => true]);
    }

    if ($method === 'POST' && $route === '/lead') {
        $data = request_json();
        $raw = isset($data['payload']) && is_array($data['payload']) ? $data['payload'] : $data;
        // Honeypot: pretend success for simple bots, without storing or mailing anything.
        if (trim((string)($raw['website'] ?? '')) !== '') respond(201, ['ok' => true, 'id' => null]);
        $rate = rate_limit('lead', LEAD_WINDOW_SECONDS, LEAD_MAX_SUBMISSIONS);
        if (!$rate['allowed']) {
            header('Retry-After: ' . (int)$rate['retry']);
            respond(429, ['ok' => false, 'error' => 'Zbyt wiele zgłoszeń w krótkim czasie. Spróbuj ponownie za kilka minut.', 'refreshCaptcha' => true]);
        }
        if (!captcha_verify((string)($raw['captchaToken'] ?? ''), (string)($raw['captchaAnswer'] ?? ''))) {
            respond(400, ['ok' => false, 'error' => 'Nieprawidłowy wynik działania. Wpisz poprawną odpowiedź.', 'refreshCaptcha' => true]);
        }
        $limits = ['name'=>120,'phone'=>50,'car'=>120,'topic'=>160,'subject'=>160,'message'=>3000,'date'=>40];
        $payload = [];
        foreach ($limits as $key => $limit) if (array_key_exists($key, $raw)) $payload[$key] = cut_text($raw[$key], $limit);
        if (($payload['phone'] ?? '') === '') respond(400, ['ok' => false, 'error' => 'Telefon jest wymagany.', 'refreshCaptcha' => false]);
        if (!preg_match('/^[0-9+() .-]{5,50}$/', $payload['phone'])) respond(400, ['ok' => false, 'error' => 'Sprawdź format numeru telefonu.', 'refreshCaptcha' => false]);
        if (trim((string)($payload['topic'] ?? ($payload['subject'] ?? ''))) === '') respond(400, ['ok' => false, 'error' => 'Wybierz temat usługi.', 'refreshCaptcha' => false]);
        $dateError = validate_preferred_date($payload);
        if ($dateError !== null) respond(400, ['ok' => false, 'error' => $dateError, 'refreshCaptcha' => false]);
        $source = cut_text($data['source'] ?? 'homepage', 50) ?: 'homepage';
        $record = mutate_json_file('leads', [], function ($items) use ($payload, $source) {
            if (!is_array($items)) $items = [];
            $cutoff = cutoff_iso(retention_days('lead'));
            $items = array_values(array_filter($items, fn($x) => (string)($x['created_at'] ?? '') >= $cutoff));
            $id = next_id($items);
            $lead = ['id'=>$id,'created_at'=>utc_now(),'status'=>'new','source'=>$source,'note'=>'','payload'=>$payload,'email_status'=>'pending'];
            array_unshift($items, $lead);
            return ['__data' => array_slice($items, 0, 2000), '__return' => $lead];
        });
        $mailOk = send_lead_mail((int)$record['id'], $source, $payload);
        mutate_json_file('leads', [], function ($items) use ($record, $mailOk) {
            foreach ($items as &$item) if ((int)($item['id'] ?? 0) === (int)$record['id']) { $item['email_status'] = $mailOk ? 'sent' : 'failed'; break; }
            unset($item);
            return $items;
        });
        respond(201, ['ok' => true, 'id' => (int)$record['id'], 'emailNotificationSent' => $mailOk]);
    }

    if ($method === 'POST' && $route === '/event') {
        $data = request_json();
        $type = cut_text($data['type'] ?? '', 64);
        if ($type === '') respond(400, ['ok' => false, 'error' => 'Brak typu eventu.']);
        $page = cut_text($data['page'] ?? '', 200);
        $metaRaw = isset($data['meta']) && is_array($data['meta']) ? $data['meta'] : [];
        $allowed = ['trafficSource'=>100,'utmSource'=>100,'utmCampaign'=>120,'utmMedium'=>100,'utmContent'=>120,'device'=>40,'cmsSource'=>40,'page'=>160,'target'=>160];
        $meta = [];
        foreach ($allowed as $key=>$max) if (array_key_exists($key, $metaRaw)) { $v = cut_text($metaRaw[$key], $max); if ($v !== '') $meta[$key] = $v; }
        mutate_json_file('events', [], function ($items) use ($type, $page, $meta) {
            if (!is_array($items)) $items = [];
            $cutoff = cutoff_iso(retention_days('analytics'));
            $items = array_values(array_filter($items, fn($x) => (string)($x['created_at'] ?? '') >= $cutoff));
            array_unshift($items, ['id'=>next_id($items),'created_at'=>utc_now(),'event_type'=>$type,'page'=>$page,'payload'=>$meta]);
            return array_slice($items, 0, 20000);
        });
        respond(201, ['ok' => true]);
    }

    // Everything below requires an administrator session.
    if (str_starts_with($route, '/admin/')) require_admin();

    if ($method === 'GET' && $route === '/admin/state') {
        $cms = cms_state();
        respond(200, ['ok'=>true,'state'=>$cms['draft'],'liveUpdatedAt'=>$cms['liveUpdatedAt']??null,'draftUpdatedAt'=>$cms['draftUpdatedAt']??null,'hasUnpublished'=>$cms['live'] != $cms['draft'],'counts'=>state_counts($cms['draft'])]);
    }

    if ($method === 'GET' && $route === '/admin/preview-state') {
        $cms = cms_state();
        respond(200, ['ok'=>true,'state'=>$cms['draft'],'updatedAt'=>$cms['draftUpdatedAt']??null]);
    }

    if ($method === 'PUT' && $route === '/admin/draft') {
        $data = request_json();
        $state = $data['state'] ?? null;
        if (!valid_state($state)) respond(400, ['ok'=>false,'error'=>'Nieprawidłowa struktura konfiguracji CMS.']);
        $now = utc_now();
        mutate_json_file('cms', cms_state(), function ($cms) use ($state, $now) {
            $cms['draft'] = $state; $cms['draftUpdatedAt'] = $now; return $cms;
        });
        respond(200, ['ok'=>true,'draftUpdatedAt'=>$now,'counts'=>state_counts($state)]);
    }

    if ($method === 'POST' && $route === '/admin/publish') {
        $data = request_json();
        $summary = cut_text($data['summary'] ?? 'Publikacja zmian', 180) ?: 'Publikacja zmian';
        $result = mutate_json_file('cms', cms_state(), function ($cms) use ($summary) {
            if (($cms['live'] ?? null) == ($cms['draft'] ?? null)) return ['__data'=>$cms,'__return'=>['changed'=>false,'publishedAt'=>$cms['liveUpdatedAt']??null,'snapshot'=>null]];
            $now = utc_now(); $snapshot = $cms['draft']; $cms['live'] = $snapshot; $cms['liveUpdatedAt'] = $now;
            return ['__data'=>$cms,'__return'=>['changed'=>true,'publishedAt'=>$now,'snapshot'=>$snapshot]];
        });
        if ($result['changed']) {
            mutate_json_file('revisions', [], function ($items) use ($summary, $result) {
                if (!is_array($items)) $items = [];
                array_unshift($items, ['id'=>next_id($items),'created_at'=>$result['publishedAt'],'author'=>'admin','summary'=>$summary,'snapshot'=>$result['snapshot']]);
                return array_slice($items, 0, 100);
            });
        }
        respond(200, ['ok'=>true,'changed'=>$result['changed'],'publishedAt'=>$result['publishedAt'],'message'=>$result['changed']?'Zmiany opublikowane.':'Brak zmian do publikacji.']);
    }

    if ($method === 'GET' && $route === '/admin/leads') {
        $leads = read_json_file('leads', []); if (!is_array($leads)) $leads = [];
        usort($leads, fn($a,$b)=>(int)($b['id']??0)<=>(int)($a['id']??0));
        respond(200, ['ok'=>true,'leads'=>array_slice($leads,0,200)]);
    }

    if ($method === 'PATCH' && preg_match('#^/admin/leads/(\d+)$#', $route, $m)) {
        $id = (int)$m[1]; $data = request_json(); $found = false;
        mutate_json_file('leads', [], function ($items) use ($id, $data, &$found) {
            foreach ($items as &$lead) {
                if ((int)($lead['id']??0) !== $id) continue;
                $found = true;
                if (array_key_exists('status',$data)) {
                    $status = (string)$data['status'];
                    if (!in_array($status,['new','contacted','booked','closed','spam'],true)) respond(400,['ok'=>false,'error'=>'Nieprawidłowy status.']);
                    $lead['status']=$status;
                }
                if (array_key_exists('note',$data)) $lead['note']=cut_text($data['note'],2000);
                break;
            }
            unset($lead); return $items;
        });
        if (!$found) respond(404,['ok'=>false,'error'=>'Nie znaleziono zgłoszenia.']);
        respond(200,['ok'=>true]);
    }

    if ($method === 'GET' && $route === '/admin/revisions') {
        $items = read_json_file('revisions', []); if (!is_array($items)) $items=[];
        $out = array_map(fn($x)=>['id'=>$x['id']??0,'created_at'=>$x['created_at']??null,'author'=>$x['author']??'admin','summary'=>$x['summary']??''],array_slice($items,0,50));
        respond(200,['ok'=>true,'revisions'=>$out]);
    }

    if ($method === 'POST' && preg_match('#^/admin/revisions/(\d+)/restore$#', $route, $m)) {
        $id=(int)$m[1]; $items=read_json_file('revisions',[]); $snapshot=null;
        foreach ((array)$items as $rev) if ((int)($rev['id']??0)===$id) { $snapshot=$rev['snapshot']??null; break; }
        if (!is_array($snapshot)) respond(404,['ok'=>false,'error'=>'Nie znaleziono wersji.']);
        $now=utc_now(); mutate_json_file('cms',cms_state(),function($cms)use($snapshot,$now){$cms['draft']=$snapshot;$cms['draftUpdatedAt']=$now;return $cms;});
        respond(200,['ok'=>true,'draftUpdatedAt'=>$now]);
    }

    if ($method === 'GET' && $route === '/admin/media') {
        $items=read_json_file('media',[]); if(!is_array($items))$items=[];
        usort($items,fn($a,$b)=>(int)($b['id']??0)<=>(int)($a['id']??0));
        respond(200,['ok'=>true,'media'=>$items]);
    }

    if ($method === 'POST' && $route === '/admin/media') {
        $data=request_json(); $raw=(string)($data['dataUrl']??'');
        if(!preg_match('#^data:(image/(?:png|jpeg|webp));base64,(.+)$#s',$raw,$m)) respond(400,['ok'=>false,'error'=>'Obsługiwane są obrazy PNG/JPEG/WEBP.']);
        $mime=$m[1]; $blob=base64_decode($m[2],true); if($blob===false) respond(400,['ok'=>false,'error'=>'Nieprawidłowe dane obrazu.']);
        if(strlen($blob)>MAX_UPLOAD_BYTES) respond(413,['ok'=>false,'error'=>'Plik może mieć maksymalnie 4 MB.']);
        $ext=['image/png'=>'.png','image/jpeg'=>'.jpg','image/webp'=>'.webp'][$mime];
        $original=pathinfo((string)($data['filename']??'image'),PATHINFO_FILENAME);
        $safe=strtolower(preg_replace('/[^a-zA-Z0-9_-]+/','-',iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$original) ?: $original));
        $safe=trim(substr($safe,0,50),'-_') ?: 'image';
        $filename=time().'-'.bin2hex(random_bytes(3)).'-'.$safe.$ext;
        $target=public_upload_dir().DIRECTORY_SEPARATOR.$filename;
        if(@file_put_contents($target,$blob,LOCK_EX)===false) respond(500,['ok'=>false,'error'=>'Nie można zapisać obrazu w public/uploads.']);
        $publicPath='./uploads/'.$filename;
        $item=mutate_json_file('media',[],function($items)use($data,$original,$filename,$publicPath,$mime,$blob){if(!is_array($items))$items=[];$entry=['id'=>next_id($items),'created_at'=>utc_now(),'title'=>cut_text($data['title']??$original,100),'tags'=>cut_text($data['tags']??'',250),'filename'=>$filename,'public_path'=>$publicPath,'mime_type'=>$mime,'bytes'=>strlen($blob)];array_unshift($items,$entry);return ['__data'=>$items,'__return'=>$entry];});
        respond(201,['ok'=>true,'media'=>$item]);
    }

    if ($method === 'DELETE' && preg_match('#^/admin/media/(\d+)$#',$route,$m)) {
        $id=(int)$m[1]; $items=read_json_file('media',[]); $targetItem=null;
        foreach((array)$items as $it) if((int)($it['id']??0)===$id){$targetItem=$it;break;}
        if(!$targetItem) respond(404,['ok'=>false,'error'=>'Nie znaleziono pliku.']);
        $cms=cms_state(); $path=(string)($targetItem['public_path']??'');
        if(recursive_has_value($cms['live'],$path)||recursive_has_value($cms['draft'],$path)) respond(409,['ok'=>false,'error'=>'Plik jest używany w LIVE lub szkicu. Najpierw podmień go w treści.']);
        mutate_json_file('media',[],fn($list)=>array_values(array_filter((array)$list,fn($x)=>(int)($x['id']??0)!==$id)));
        $file=public_upload_dir().DIRECTORY_SEPARATOR.basename((string)$targetItem['filename']); if(is_file($file))@unlink($file);
        respond(200,['ok'=>true]);
    }

    if ($method === 'GET' && $route === '/admin/analytics') {
        $days=max(1,min(365,(int)($_GET['days']??30))); respond(200,analytics_payload($days));
    }

    if ($method === 'POST' && $route === '/admin/reset-draft') {
        $now=utc_now(); $defaults=defaults_state(); mutate_json_file('cms',cms_state(),function($cms)use($defaults,$now){$cms['draft']=$defaults;$cms['draftUpdatedAt']=$now;return $cms;});
        respond(200,['ok'=>true,'draftUpdatedAt'=>$now]);
    }

    if ($method === 'GET' && $route === '/admin/google-config') {
        respond(200,['ok'=>true,'apiKeyConfigured'=>false,'apiKeyMasked'=>'','status'=>['configured'=>false,'available'=>false,'reviews'=>[],'mode'=>'static']]);
    }

    if ($method === 'POST' && $route === '/admin/google-config') {
        respond(200,['ok'=>true,'apiKeyConfigured'=>false,'apiKeyMasked'=>'','status'=>['configured'=>false,'available'=>false,'reviews'=>[],'mode'=>'static','message'=>'Opinie na stronie są statyczne — integracja Google API jest wyłączona.']]);
    }

    respond(404, ['ok' => false, 'error' => 'Nie znaleziono endpointu API.']);
} catch (Throwable $e) {
    log_line('error.log', get_class($e) . ': ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Błąd serwera. Szczegóły zapisano w private/runtime/error.log.']);
}
