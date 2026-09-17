from __future__ import annotations

import base64
import hashlib
import hmac
import json
import mimetypes
import os
import smtplib
import ssl
import secrets
import sqlite3
import threading
import time
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from zoneinfo import ZoneInfo
from http import cookies
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse
from urllib import request as urllib_request

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / 'data'
UPLOAD_DIR = ROOT / 'uploads'
DB_PATH = DATA_DIR / 'autoklinika-local-v2.db'
LEGACY_DB_PATH = DATA_DIR / 'autoklinika.db'
DEFAULTS_PATH = DATA_DIR / 'default_content.json'
HOST = os.environ.get('AUTOKLINIKA_HOST', '127.0.0.1')
PORT = int(os.environ.get('AUTOKLINIKA_PORT', '5173'))
BUILD_ID = 'v13.4.0-local-dev-booking-20260917'
DEMO_LOGIN = os.environ.get('AUTOKLINIKA_ADMIN_LOGIN', 'admin')
DEMO_PASSWORD = os.environ.get('AUTOKLINIKA_ADMIN_PASSWORD', 'admin')
MAX_JSON = 8 * 1024 * 1024
MAX_UPLOAD = 4 * 1024 * 1024
SESSION_TTL = 8 * 60 * 60
LEAD_RETENTION_DAYS = 365
ANALYTICS_RETENTION_DAYS = 180

DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)
_DB_LOCK = threading.Lock()
_SESSIONS: dict[str, float] = {}
_LOGIN_FAILURES: dict[str, list[float]] = {}
_LEAD_SUBMISSIONS: dict[str, list[float]] = {}
LOGIN_WINDOW = 5 * 60
LOGIN_MAX_FAILURES = 6
LEAD_WINDOW = 10 * 60
LEAD_MAX_SUBMISSIONS = 8
_CAPTCHA_SECRET = secrets.token_bytes(32)


def _captcha_b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode('ascii').rstrip('=')


def _captcha_b64decode(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + '=' * (-len(text) % 4))


def captcha_payload() -> dict:
    a = secrets.randbelow(8) + 2
    b = secrets.randbelow(9) + 1
    payload = {'a': a, 'b': b, 'ts': int(time.time()), 'nonce': secrets.token_hex(6)}
    body = _captcha_b64encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    sig = hmac.new(_CAPTCHA_SECRET, body.encode('ascii'), hashlib.sha256).hexdigest()
    return {'ok': True, 'question': f'{a} + {b} = ?', 'token': f'{body}.{sig}'}


def captcha_verify(token: str, answer: str) -> bool:
    try:
        body, sig = token.split('.', 1)
        expected = hmac.new(_CAPTCHA_SECRET, body.encode('ascii'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, sig): return False
        data = json.loads(_captcha_b64decode(body).decode('utf-8'))
        age = int(time.time()) - int(data.get('ts', 0))
        if age < 2 or age > 3600: return False
        return hmac.compare_digest(str(int(data.get('a', -100)) + int(data.get('b', -100))), str(answer).strip())
    except Exception:
        return False


_GOOGLE_REVIEWS_CACHE = {'place_id': None, 'expires': 0.0, 'payload': None}
GOOGLE_REVIEWS_CACHE_SECONDS = 10 * 60
GOOGLE_PLACE_LOOKUP_CACHE_SECONDS = 24 * 60 * 60
# Google credentials are kept outside the versioned app folder on Windows so updates
# do not silently wipe the configuration. A local fallback is used elsewhere.
def _persistent_config_dir() -> Path:
    base = os.environ.get('LOCALAPPDATA') or os.environ.get('APPDATA')
    if base:
        return Path(base) / 'AutoKlinika'
    return DATA_DIR

PERSISTENT_CONFIG_DIR = _persistent_config_dir()
PERSISTENT_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
SECRETS_PATH = PERSISTENT_CONFIG_DIR / 'server_secrets.json'
LEGACY_SECRETS_PATH = DATA_DIR / 'server_secrets.json'
REVIEWS_SNAPSHOT_PATH = PERSISTENT_CONFIG_DIR / 'google_reviews_snapshot.json'
_GOOGLE_PLACE_LOOKUP_CACHE = {'query': None, 'expires': 0.0, 'place': None}


def _load_server_secrets() -> dict:
    # Migrate the old per-folder secret once, then keep it in persistent app data.
    for candidate in (SECRETS_PATH, LEGACY_SECRETS_PATH):
        try:
            data = json.loads(candidate.read_text(encoding='utf-8'))
            if isinstance(data, dict):
                if candidate == LEGACY_SECRETS_PATH and data and not SECRETS_PATH.exists():
                    _save_server_secrets(data)
                return data
        except Exception:
            pass
    return {}


def _save_server_secrets(data: dict) -> None:
    safe = {k: str(v) for k, v in data.items() if isinstance(k, str) and v}
    PERSISTENT_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    SECRETS_PATH.write_text(json.dumps(safe, ensure_ascii=False, indent=2), encoding='utf-8')


def _load_reviews_snapshot() -> dict | None:
    try:
        data = json.loads(REVIEWS_SNAPSHOT_PATH.read_text(encoding='utf-8'))
        if isinstance(data, dict) and isinstance(data.get('reviews'), list) and data.get('reviews'):
            data = dict(data)
            data['fromSnapshot'] = True
            data['available'] = True
            data['configured'] = bool(_google_api_key())
            return data
    except Exception:
        pass
    return None


def _save_reviews_snapshot(payload: dict) -> None:
    try:
        snap = dict(payload)
        snap['snapshotSavedAt'] = utcnow()
        snap['fromSnapshot'] = False
        PERSISTENT_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        REVIEWS_SNAPSHOT_PATH.write_text(json.dumps(snap, ensure_ascii=False, indent=2), encoding='utf-8')
    except Exception as exc:
        print('[AutoKlinika] Nie zapisano cache opinii:', exc)




def _mail_settings() -> dict:
    saved = _load_server_secrets()
    def pick(env_name: str, key: str, default: str = '') -> str:
        env = os.environ.get(env_name, '').strip()
        if env:
            return env
        return str(saved.get(key) or default).strip()
    try:
        port = int(pick('AUTOKLINIKA_SMTP_PORT', 'smtpPort', '587') or '587')
    except Exception:
        port = 587
    return {
        'host': pick('AUTOKLINIKA_SMTP_HOST', 'smtpHost', 'smtp.gmail.com'),
        'port': port,
        'user': pick('AUTOKLINIKA_SMTP_USER', 'smtpUser', 'autoklinikagorzyn@gmail.com'),
        'password': pick('AUTOKLINIKA_SMTP_PASSWORD', 'smtpPassword'),
        'recipient': pick('AUTOKLINIKA_MAIL_TO', 'mailRecipient', 'autoklinikagorzyn@gmail.com'),
    }


def mail_notifications_configured() -> bool:
    cfg = _mail_settings()
    return bool(cfg['host'] and cfg['user'] and cfg['password'] and cfg['recipient'])


def _lead_email_text(lead_id: int, source: str, payload: dict) -> str:
    now_pl = datetime.now(ZoneInfo('Europe/Warsaw')).strftime('%d.%m.%Y %H:%M')
    topic = str(payload.get('topic') or payload.get('subject') or '').strip()
    source_label = {'homepage': 'Strona główna', 'cennik': 'Cennik'}.get(source, source)
    raw_date = str(payload.get('date') or '').strip()
    try:
        preferred_date = datetime.strptime(raw_date, '%Y-%m-%d').strftime('%d.%m.%Y') if raw_date else '—'
    except Exception:
        preferred_date = raw_date or '—'
    lines = [
        f'AUTOKLINIKA — NOWE ZGŁOSZENIE #{lead_id}',
        '',
        f'Klient: {payload.get("name") or "—"}',
        f'Tel: {payload.get("phone") or "—"}',
        f'Auto: {payload.get("car") or "—"}',
        f'Temat: {topic or "—"}',
        f'Preferowany termin: {preferred_date}',
        f'Źródło: {source_label}',
        f'Otrzymano: {now_pl}',
    ]
    message = str(payload.get('message') or '').strip()
    if message:
        lines.extend(['', 'Opis:', message])
    lines.extend(['', 'Zgłoszenie jest również zapisane w panelu administratora AutoKliniki.'])
    return '\n'.join(lines)


def _send_lead_email(lead_id: int, source: str, payload: dict) -> None:
    cfg = _mail_settings()
    if not mail_notifications_configured():
        print(f'[AutoKlinika] Lead #{lead_id} zapisany; e-mail pominięty (brak konfiguracji SMTP).')
        return
    topic = str(payload.get('topic') or payload.get('subject') or payload.get('car') or 'formularz').strip()[:80]
    msg = EmailMessage()
    msg['Subject'] = f'[AutoKlinika] Nowe zgłoszenie #{lead_id} — {topic or "formularz"}'
    msg['From'] = cfg['user']
    msg['To'] = cfg['recipient']
    msg.set_content(_lead_email_text(lead_id, source, payload))
    context = ssl.create_default_context()
    try:
        if int(cfg['port']) == 465:
            with smtplib.SMTP_SSL(cfg['host'], int(cfg['port']), timeout=12, context=context) as smtp:
                smtp.login(cfg['user'], cfg['password'])
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(cfg['host'], int(cfg['port']), timeout=12) as smtp:
                smtp.ehlo()
                smtp.starttls(context=context)
                smtp.ehlo()
                smtp.login(cfg['user'], cfg['password'])
                smtp.send_message(msg)
        print(f'[AutoKlinika] Powiadomienie e-mail dla lead #{lead_id} wysłane do {cfg["recipient"]}.')
    except Exception as exc:
        # Lead is already safely stored in SQLite; a temporary mail outage must never
        # make the public form look as if the submission was lost.
        print(f'[AutoKlinika] Nie udało się wysłać e-maila dla lead #{lead_id}: {exc}')


def queue_lead_email(lead_id: int, source: str, payload: dict) -> None:
    threading.Thread(
        target=_send_lead_email,
        args=(lead_id, source, dict(payload)),
        daemon=True,
        name=f'autoklinika-mail-{lead_id}',
    ).start()


def _google_api_key() -> str:
    env = os.environ.get('GOOGLE_PLACES_API_KEY', '').strip()
    if env:
        return env
    return str(_load_server_secrets().get('googlePlacesApiKey') or '').strip()


def _resolve_google_place(api_key: str, business: dict) -> dict | None:
    brand = str(business.get('brand') or business.get('name') or 'AutoKlinika').strip()
    address = str(business.get('addressLine') or '').strip()
    city = str(business.get('postalCity') or '').strip()
    query = ' '.join(x for x in (brand, address, city) if x).strip()
    if not query:
        query = str(business.get('googleReviewsQuery') or 'AutoKlinika Górzyn 125').replace('opinie', '').strip()
    now = time.time()
    if (_GOOGLE_PLACE_LOOKUP_CACHE.get('query') == query and _GOOGLE_PLACE_LOOKUP_CACHE.get('place') and _GOOGLE_PLACE_LOOKUP_CACHE.get('expires', 0) > now):
        return _GOOGLE_PLACE_LOOKUP_CACHE['place']
    body = json.dumps({'textQuery': query, 'languageCode': 'pl'}).encode('utf-8')
    req = urllib_request.Request('https://places.googleapis.com/v1/places:searchText', data=body, method='POST', headers={
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri',
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'User-Agent': 'AutoKlinikaWebsite/1.0',
    })
    with urllib_request.urlopen(req, timeout=7) as response:
        raw = json.loads(response.read().decode('utf-8'))
    place = (raw.get('places') or [None])[0]
    if not isinstance(place, dict) or not place.get('id'):
        return None
    result = {
        'id': str(place.get('id')),
        'name': str((place.get('displayName') or {}).get('text') or ''),
        'address': str(place.get('formattedAddress') or ''),
        'googleMapsUri': str(place.get('googleMapsUri') or ''),
    }
    _GOOGLE_PLACE_LOOKUP_CACHE.update({'query': query, 'expires': now + GOOGLE_PLACE_LOOKUP_CACHE_SECONDS, 'place': result})
    return result


def google_reviews_payload() -> dict:
    """Read four real Google reviews server-side without exposing the API key.

    The Google Places API returns a small, Google-selected list of reviews. We preserve
    the order returned by Google and render the first four cards. If no Place ID was
    entered in the CMS, the server resolves the business from its brand/address first.
    """
    api_key = _google_api_key()
    env_place_id = os.environ.get('GOOGLE_PLACES_PLACE_ID', '').strip()
    try:
        with _DB_LOCK, db() as conn:
            row = conn.execute('SELECT live_json FROM cms_state WHERE id=1').fetchone()
        state = json.loads(row['live_json']) if row else {}
    except Exception:
        state = {}
    business = state.get('business') or {}
    explicit_place_id = str(business.get('googlePlaceId') or env_place_id or '').strip()
    fallback_query = str(business.get('googleReviewsQuery') or 'AutoKlinika Górzyn 125 opinie').strip()
    fallback_url = f"https://www.google.com/search?q={quote(fallback_query)}"
    if not api_key:
        snapshot = _load_reviews_snapshot()
        if snapshot:
            snapshot.setdefault('googleMapsUri', fallback_url)
            snapshot['reason'] = 'snapshot_without_api_key'
            return snapshot
        return {
            'ok': True, 'configured': False, 'available': False, 'reason': 'missing_api_key',
            'reviews': [], 'googleMapsUri': fallback_url, 'reviewLimit': 4,
            'setupRequired': True,
        }

    resolved = None
    place_id = explicit_place_id
    if not place_id:
        try:
            resolved = _resolve_google_place(api_key, business)
            place_id = str((resolved or {}).get('id') or '').strip()
            if resolved and resolved.get('googleMapsUri'):
                fallback_url = resolved['googleMapsUri']
        except Exception as exc:
            print('[AutoKlinika] Google Place lookup error:', exc)
    if not place_id:
        return {
            'ok': True, 'configured': True, 'available': False, 'reason': 'place_not_found',
            'reviews': [], 'googleMapsUri': fallback_url, 'reviewLimit': 4,
        }

    now = time.time()
    if (_GOOGLE_REVIEWS_CACHE.get('place_id') == place_id and _GOOGLE_REVIEWS_CACHE.get('payload') and _GOOGLE_REVIEWS_CACHE.get('expires', 0) > now):
        return _GOOGLE_REVIEWS_CACHE['payload']

    url = f"https://places.googleapis.com/v1/places/{quote(place_id, safe='')}?languageCode=pl"
    req = urllib_request.Request(url, headers={
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri',
        'Accept': 'application/json',
        'User-Agent': 'AutoKlinikaWebsite/1.0',
    })
    try:
        with urllib_request.urlopen(req, timeout=7) as response:
            raw = json.loads(response.read().decode('utf-8'))
        reviews = []
        for item in (raw.get('reviews') or [])[:4]:
            author = item.get('authorAttribution') or {}
            text_obj = item.get('text') or {}
            reviews.append({
                'author': str(author.get('displayName') or 'Klient Google')[:120],
                'authorUri': str(author.get('uri') or '')[:1000],
                'photoUri': str(author.get('photoUri') or '')[:1000],
                'rating': max(1, min(5, int(item.get('rating') or 5))),
                'text': str(text_obj.get('text') or '')[:1600],
                'relativeTime': str(item.get('relativePublishTimeDescription') or '')[:120],
                'publishTime': str(item.get('publishTime') or '')[:80],
            })
        payload = {
            'ok': True, 'configured': True, 'available': True,
            'rating': raw.get('rating'), 'reviewCount': raw.get('userRatingCount'),
            'googleMapsUri': raw.get('googleMapsUri') or fallback_url,
            'placeId': place_id, 'placeResolvedAutomatically': not bool(explicit_place_id),
            'reviewLimit': 4, 'reviews': reviews,
        }
        _GOOGLE_REVIEWS_CACHE.update({'place_id': place_id, 'expires': now + GOOGLE_REVIEWS_CACHE_SECONDS, 'payload': payload})
        if reviews:
            _save_reviews_snapshot(payload)
        return payload
    except Exception as exc:
        print('[AutoKlinika] Google reviews API error:', exc)
        snapshot = _load_reviews_snapshot()
        if snapshot:
            snapshot.setdefault('googleMapsUri', fallback_url)
            snapshot['reason'] = 'snapshot_after_api_error'
            return snapshot
        return {
            'ok': True, 'configured': True, 'available': False, 'reason': 'api_error',
            'reviews': [], 'googleMapsUri': fallback_url, 'placeId': place_id, 'reviewLimit': 4,
        }


def utcnow() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def db() -> sqlite3.Connection:
    # The local CMS database must be portable between copied/unzipped project
    # folders.  More importantly, on Windows a failed PRAGMA can leave the
    # sqlite connection holding the corrupt file open unless we close it
    # explicitly.  That was the reason recovery in v12.6 could retry the same
    # malformed file.
    conn = sqlite3.connect(str(DB_PATH), timeout=15)
    try:
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA journal_mode=DELETE')
        conn.execute('PRAGMA synchronous=NORMAL')
        conn.execute('PRAGMA foreign_keys=ON')
        return conn
    except BaseException:
        conn.close()
        raise


def _initialize_db_once(defaults: str) -> None:
    with db() as conn:
        conn.executescript('''
        CREATE TABLE IF NOT EXISTS cms_state (
            id INTEGER PRIMARY KEY CHECK (id=1),
            live_json TEXT NOT NULL,
            draft_json TEXT NOT NULL,
            live_updated_at TEXT NOT NULL,
            draft_updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS revisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            author TEXT NOT NULL,
            summary TEXT NOT NULL,
            snapshot_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'new',
            source TEXT NOT NULL DEFAULT 'homepage',
            payload_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            event_type TEXT NOT NULL,
            page TEXT NOT NULL,
            payload_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            title TEXT NOT NULL,
            tags TEXT NOT NULL,
            filename TEXT NOT NULL,
            public_path TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            bytes INTEGER NOT NULL
        );
        ''')
        lead_cols = {r['name'] for r in conn.execute('PRAGMA table_info(leads)').fetchall()}
        if 'note' not in lead_cols:
            conn.execute("ALTER TABLE leads ADD COLUMN note TEXT NOT NULL DEFAULT ''")
        row = conn.execute('SELECT id FROM cms_state WHERE id=1').fetchone()
        if not row:
            now = utcnow()
            conn.execute(
                'INSERT INTO cms_state(id, live_json, draft_json, live_updated_at, draft_updated_at) VALUES(1,?,?,?,?)',
                (defaults, defaults, now, now),
            )
            conn.execute(
                'INSERT INTO revisions(created_at,author,summary,snapshot_json) VALUES(?,?,?,?)',
                (now, 'system', 'Stan początkowy AutoKlinika WWW', defaults),
            )
        check = conn.execute('PRAGMA quick_check').fetchone()
        if not check or check[0] != 'ok':
            raise sqlite3.DatabaseError(f'SQLite quick_check failed: {check[0] if check else "unknown"}')
        conn.commit()


def _remove_sqlite_sidecars(path: Path) -> None:
    for suffix in ('-wal', '-shm', '-journal'):
        try:
            Path(str(path) + suffix).unlink(missing_ok=True)
        except OSError:
            pass


def _quarantine_broken_db() -> Path | None:
    if not DB_PATH.exists():
        _remove_sqlite_sidecars(DB_PATH)
        return None

    # At this point every connection created by db() is guaranteed closed on
    # configuration failure.  A short retry still helps Windows/AV software
    # release the filesystem handle before the rename.
    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup = DATA_DIR / f'autoklinika.corrupt-{stamp}.db'
    _remove_sqlite_sidecars(DB_PATH)
    for attempt in range(6):
        try:
            DB_PATH.replace(backup)
            _remove_sqlite_sidecars(DB_PATH)
            return backup
        except FileNotFoundError:
            return None
        except OSError:
            if attempt < 5:
                time.sleep(0.15)

    # Do not continue against the same corrupt file. If Windows still refuses
    # the rename, fail with an explicit message instead of reopening it.
    raise sqlite3.DatabaseError(
        f'Nie mogę odłożyć uszkodzonej bazy {DB_PATH.name}. '
        'Zamknij procesy korzystające z katalogu i uruchom ponownie.'
    )


def init_db() -> None:
    defaults = DEFAULTS_PATH.read_text(encoding='utf-8')
    # v12.7 intentionally uses a new database filename. This makes an in-place
    # unzip over an older folder safe even when legacy autoklinika.db is broken.
    if LEGACY_DB_PATH.exists() and not DB_PATH.exists():
        print(f'[AutoKlinika] Pomijam starą bazę {LEGACY_DB_PATH.name}; używam {DB_PATH.name}.')
    with _DB_LOCK:
        try:
            _initialize_db_once(defaults)
            return
        except sqlite3.DatabaseError as exc:
            print(f'[AutoKlinika] Uszkodzona lub nieprzenośna baza SQLite: {exc}')
            backup = _quarantine_broken_db()
            if backup:
                print(f'[AutoKlinika] Kopia uszkodzonej bazy: {backup.name}')
            print('[AutoKlinika] Odtwarzam czystą bazę z data/default_content.json...')
            _initialize_db_once(defaults)
            print('[AutoKlinika] Baza została odbudowana poprawnie.')


def clean_sessions() -> None:
    now = time.time()
    stale = [k for k, exp in _SESSIONS.items() if exp <= now]
    for k in stale:
        _SESSIONS.pop(k, None)


def make_session() -> str:
    clean_sessions()
    token = secrets.token_urlsafe(32)
    _SESSIONS[token] = time.time() + SESSION_TTL
    return token


def is_session_valid(token: str | None) -> bool:
    if not token:
        return False
    clean_sessions()
    exp = _SESSIONS.get(token)
    if not exp or exp <= time.time():
        _SESSIONS.pop(token, None)
        return False
    _SESSIONS[token] = time.time() + SESSION_TTL
    return True


def login_allowed(client_key: str) -> tuple[bool, int]:
    now = time.time()
    attempts = [ts for ts in _LOGIN_FAILURES.get(client_key, []) if now - ts < LOGIN_WINDOW]
    _LOGIN_FAILURES[client_key] = attempts
    if len(attempts) >= LOGIN_MAX_FAILURES:
        retry = max(1, int(LOGIN_WINDOW - (now - attempts[0])))
        return False, retry
    return True, 0


def record_login_failure(client_key: str) -> None:
    now = time.time()
    attempts = [ts for ts in _LOGIN_FAILURES.get(client_key, []) if now - ts < LOGIN_WINDOW]
    attempts.append(now)
    _LOGIN_FAILURES[client_key] = attempts[-LOGIN_MAX_FAILURES:]


def clear_login_failures(client_key: str) -> None:
    _LOGIN_FAILURES.pop(client_key, None)


def lead_submission_allowed(client_key: str) -> tuple[bool, int]:
    # In-memory anti-spam throttle. The address is not written to SQLite and is
    # forgotten on restart / after the rolling window.
    now = time.time()
    attempts = [ts for ts in _LEAD_SUBMISSIONS.get(client_key, []) if now - ts < LEAD_WINDOW]
    _LEAD_SUBMISSIONS[client_key] = attempts
    if len(attempts) >= LEAD_MAX_SUBMISSIONS:
        retry = max(1, int(LEAD_WINDOW - (now - attempts[0])))
        return False, retry
    return True, 0


def record_lead_submission(client_key: str) -> None:
    now = time.time()
    attempts = [ts for ts in _LEAD_SUBMISSIONS.get(client_key, []) if now - ts < LEAD_WINDOW]
    attempts.append(now)
    _LEAD_SUBMISSIONS[client_key] = attempts[-LEAD_MAX_SUBMISSIONS:]


def state_uses_path(value: object, public_path: str) -> bool:
    if isinstance(value, dict):
        return any(state_uses_path(v, public_path) for v in value.values())
    if isinstance(value, list):
        return any(state_uses_path(v, public_path) for v in value)
    return isinstance(value, str) and value == public_path


def retention_days(kind: str) -> int:
    default = LEAD_RETENTION_DAYS if kind == 'lead' else ANALYTICS_RETENTION_DAYS
    key = 'leadRetentionDays' if kind == 'lead' else 'analyticsRetentionDays'
    try:
        with db() as conn:
            row = conn.execute('SELECT live_json FROM cms_state WHERE id=1').fetchone()
        state = json.loads(row['live_json']) if row else {}
        raw = int((state.get('settings') or {}).get(key, default))
        return max(7, min(3650, raw))
    except Exception:
        return default


def booking_service_key(topic: str) -> str:
    value = str(topic or '').lower()
    mapping = [
        ('diagnost', 'diagnostics'), ('geometr', 'geometry'), ('klimatyz', 'climate'),
        ('mechan', 'mechanic'), ('wulkan', 'tires'), ('opon', 'tires'),
        ('olej', 'oil'), ('okresow', 'oil'), ('przegl', 'oil'),
    ]
    return next((key for needle, key in mapping if needle in value), '')


def booking_availability_config() -> dict:
    defaults = {
        'enabled': True, 'horizonDays': 75, 'limitedWindowDays': 2, 'weekendsClosed': True,
        'services': {
            'diagnostics': {'leadDays': 2}, 'geometry': {'leadDays': 3},
            'climate': {'leadDays': 0}, 'mechanic': {'leadDays': 7},
            'tires': {'leadDays': 2}, 'oil': {'leadDays': 3},
        },
    }
    try:
        with db() as conn:
            row = conn.execute('SELECT live_json FROM cms_state WHERE id=1').fetchone()
        state = json.loads(row['live_json']) if row else {}
        raw = ((state.get('settings') or {}).get('bookingAvailability') or {})
    except Exception:
        raw = {}
    cfg = {**defaults, **raw}
    cfg['services'] = {k: {**v, **((raw.get('services') or {}).get(k) or {})} for k, v in defaults['services'].items()}
    return cfg


def validate_preferred_date(payload: dict) -> str | None:
    raw_date = str(payload.get('date') or '').strip()
    if not raw_date:
        return None
    key = booking_service_key(str(payload.get('topic') or payload.get('subject') or ''))
    if not key:
        return 'Wybierz temat usługi przed wskazaniem dnia.'
    cfg = booking_availability_config()
    if cfg.get('enabled', True) is False:
        return None
    try:
        selected = datetime.strptime(raw_date, '%Y-%m-%d').date()
    except ValueError:
        return 'Nieprawidłowa data preferowanego terminu.'
    today = datetime.now(ZoneInfo('Europe/Warsaw')).date()
    lead = max(0, min(60, int((cfg.get('services') or {}).get(key, {}).get('leadDays', 0))))
    earliest = today + timedelta(days=lead)
    if cfg.get('weekendsClosed', True) is not False:
        while earliest.weekday() >= 5:
            earliest += timedelta(days=1)
        if selected.weekday() >= 5:
            return 'Wybierz dzień od poniedziałku do piątku.'
    if selected < earliest:
        return f'Dla wybranego tematu najwcześniejszy preferowany dzień to {earliest.strftime("%d.%m.%Y")}.'
    horizon = max(14, min(365, int(cfg.get('horizonDays', 75))))
    if selected > today + timedelta(days=horizon):
        return 'Wybierz termin z dostępnego zakresu kalendarza.'
    return None


def _find_unsafe_string(value: object, path: str = 'state') -> str | None:
    """Reject obvious script/event-handler payloads in CMS text fields.

    Public templates still treat administrator content as trusted CMS content, so this is
    deliberately a second line of defence rather than a replacement for contextual
    escaping. It protects the demo panel against the most common accidental/pasted XSS
    payloads while keeping normal Polish copy, URLs and asset paths valid.
    """
    if isinstance(value, dict):
        for key, child in value.items():
            hit = _find_unsafe_string(child, f'{path}.{key}')
            if hit:
                return hit
    elif isinstance(value, list):
        for index, child in enumerate(value):
            hit = _find_unsafe_string(child, f'{path}[{index}]')
            if hit:
                return hit
    elif isinstance(value, str):
        low = value.lower().replace('\x00', '')
        forbidden = ('<script', '</script', 'javascript:', 'vbscript:', 'data:text/html')
        if any(token in low for token in forbidden):
            return path
        # Inline event handlers are never required by editable content in this CMS.
        compact = ''.join(low.split())
        for token in ('onerror=', 'onload=', 'onclick=', 'onmouseover=', 'onfocus=', 'onanimationstart='):
            if token in compact:
                return path
    return None


def validate_state(state: object) -> tuple[bool, str]:
    if not isinstance(state, dict):
        return False, 'Stan CMS musi być obiektem.'
    required = ['business', 'home', 'services', 'pricing', 'reviews', 'faqs', 'seo', 'legal', 'settings']
    for key in required:
        if key not in state:
            return False, f'Brak wymaganej sekcji: {key}'
    if not isinstance(state.get('services'), list):
        return False, 'services musi być listą.'
    pricing = state.get('pricing') or {}
    if not isinstance(pricing.get('categories'), list):
        return False, 'pricing.categories musi być listą.'
    business = state.get('business') or {}
    if not str(business.get('phoneDisplay', '')).strip():
        return False, 'Numer telefonu nie może być pusty.'
    unsafe_path = _find_unsafe_string(state)
    if unsafe_path:
        return False, f'Niedozwolony fragment skryptu / handlera w polu: {unsafe_path}'
    return True, ''


def state_counts(state: dict) -> dict:
    categories = state.get('pricing', {}).get('categories', [])
    price_rows = 0
    for cat in categories:
        for group in cat.get('groups', []):
            price_rows += len(group.get('rows', []))
    return {
        'services': len(state.get('services', [])),
        'priceRows': price_rows,
        'faqs': len(state.get('faqs', [])),
        'reviews': len(state.get('reviews', [])),
        'gallery': len(state.get('home', {}).get('about', {}).get('gallery', [])),
    }


class Handler(SimpleHTTPRequestHandler):
    server_version = 'AutoKlinikaCMS/12.5'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        # Keep console useful without logging every static asset.
        msg = fmt % args
        if '/api/' in msg or ' 4' in msg or ' 5' in msg:
            print('[AutoKlinika]', msg)

    def _json(self, status: int, payload: object, extra_headers: dict[str, str] | None = None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> object:
        length = int(self.headers.get('Content-Length') or 0)
        if length <= 0 or length > MAX_JSON:
            raise ValueError('Nieprawidłowy rozmiar żądania.')
        raw = self.rfile.read(length)
        return json.loads(raw.decode('utf-8'))

    def _session_token(self) -> str | None:
        raw = self.headers.get('Cookie')
        if not raw:
            return None
        jar = cookies.SimpleCookie()
        try:
            jar.load(raw)
            return jar.get('ak_admin_session').value if jar.get('ak_admin_session') else None
        except Exception:
            return None

    def _require_admin(self) -> bool:
        if is_session_valid(self._session_token()):
            return True
        self._json(401, {'ok': False, 'error': 'Brak aktywnej sesji administratora.'})
        return False

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        # Local package: always disable browser caching so a newly unpacked build
        # cannot accidentally reuse CSS/JS from an older AutoKlinika package.
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def _is_sensitive_static_path(self, path: str) -> bool:
        decoded = unquote(path).replace('\\', '/')
        parts = [p for p in decoded.split('/') if p]
        if not parts:
            return False
        blocked = {'data', '__pycache__', '.git'}
        if parts[0] in blocked:
            return True
        if parts[-1] in {'server.py'} or parts[-1].endswith(('.db', '.db-wal', '.db-shm')):
            return True
        return False

    def do_HEAD(self):
        path=urlparse(self.path).path
        if self._is_sensitive_static_path(path):
            self._json(404, {'ok': False, 'error': 'Nie znaleziono zasobu.'})
            return
        return super().do_HEAD()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if self._is_sensitive_static_path(path):
            self._json(404, {'ok': False, 'error': 'Nie znaleziono zasobu.'})
            return
        if path == '/administrator':
            self.send_response(302)
            self.send_header('Location', '/administrator/')
            self.end_headers()
            return
        if path == '/api/build-info':
            self._json(200, {'ok': True, 'build': BUILD_ID})
            return
        if path == '/api/captcha':
            self._json(200, captcha_payload())
            return
        if path == '/api/public-state':
            with _DB_LOCK, db() as conn:
                row = conn.execute('SELECT live_json, live_updated_at FROM cms_state WHERE id=1').fetchone()
            state = json.loads(row['live_json'])
            self._json(200, {'ok': True, 'state': state, 'updatedAt': row['live_updated_at'], 'counts': state_counts(state)})
            return
        if path == '/api/google-reviews':
            self._json(200, google_reviews_payload())
            return
        if path == '/api/admin/session':
            valid = is_session_valid(self._session_token())
            self._json(200, {'ok': True, 'authenticated': valid, 'user': 'admin' if valid else None, 'demo': True})
            return
        if path == '/api/admin/state':
            if not self._require_admin(): return
            with _DB_LOCK, db() as conn:
                row = conn.execute('SELECT live_json,draft_json,live_updated_at,draft_updated_at FROM cms_state WHERE id=1').fetchone()
            live = json.loads(row['live_json']); draft = json.loads(row['draft_json'])
            self._json(200, {'ok': True, 'state': draft, 'liveUpdatedAt': row['live_updated_at'], 'draftUpdatedAt': row['draft_updated_at'], 'hasUnpublished': row['live_json'] != row['draft_json'], 'counts': state_counts(draft)})
            return
        if path == '/api/admin/preview-state':
            if not self._require_admin(): return
            with _DB_LOCK, db() as conn:
                row = conn.execute('SELECT draft_json,draft_updated_at FROM cms_state WHERE id=1').fetchone()
            self._json(200, {'ok': True, 'state': json.loads(row['draft_json']), 'updatedAt': row['draft_updated_at']})
            return
        if path == '/api/admin/google-config':
            if not self._require_admin(): return
            key = _google_api_key()
            status = google_reviews_payload()
            self._json(200, {
                'ok': True,
                'apiKeyConfigured': bool(key),
                'apiKeyMasked': (('••••••••' + key[-4:]) if key else ''),
                'status': status,
            })
            return
        if path == '/api/admin/revisions':
            if not self._require_admin(): return
            with _DB_LOCK, db() as conn:
                rows = conn.execute('SELECT id,created_at,author,summary FROM revisions ORDER BY id DESC LIMIT 50').fetchall()
            self._json(200, {'ok': True, 'revisions': [dict(r) for r in rows]})
            return
        if path == '/api/admin/leads':
            if not self._require_admin(): return
            with _DB_LOCK, db() as conn:
                rows = conn.execute('SELECT id,created_at,status,source,note,payload_json FROM leads ORDER BY id DESC LIMIT 200').fetchall()
            leads=[]
            for r in rows:
                item=dict(r); item['payload']=json.loads(item.pop('payload_json')); leads.append(item)
            self._json(200, {'ok': True, 'leads': leads})
            return
        if path == '/api/admin/media':
            if not self._require_admin(): return
            with _DB_LOCK, db() as conn:
                rows=conn.execute('SELECT id,created_at,title,tags,filename,public_path,mime_type,bytes FROM media ORDER BY id DESC').fetchall()
            self._json(200, {'ok': True, 'media':[dict(r) for r in rows]})
            return
        if path == '/api/admin/analytics':
            if not self._require_admin(): return
            qs=parse_qs(parsed.query)
            try: days=max(1,min(365,int(qs.get('days',['30'])[0])))
            except: days=30
            since=(datetime.now(timezone.utc)-timedelta(days=days-1)).date().isoformat()
            with _DB_LOCK, db() as conn:
                totals={r['event_type']:r['c'] for r in conn.execute('SELECT event_type,COUNT(*) c FROM events WHERE date(created_at)>=? GROUP BY event_type',(since,)).fetchall()}
                daily=[dict(r) for r in conn.execute("SELECT substr(created_at,1,10) day, event_type, COUNT(*) c FROM events WHERE date(created_at)>=? GROUP BY day,event_type ORDER BY day",(since,)).fetchall()]
                pages=[dict(r) for r in conn.execute('SELECT page,COUNT(*) c FROM events WHERE event_type=? AND date(created_at)>=? GROUP BY page ORDER BY c DESC LIMIT 10',('page_view',since)).fetchall()]
                page_payloads=[r['payload_json'] for r in conn.execute('SELECT payload_json FROM events WHERE event_type=? AND date(created_at)>=?',('page_view',since)).fetchall()]
                leads=conn.execute('SELECT COUNT(*) c FROM leads WHERE date(created_at)>=?',(since,)).fetchone()['c']
            sources={}; devices={}; campaigns={}
            for raw in page_payloads:
                try: meta=json.loads(raw) if raw else {}
                except Exception: meta={}
                src=str(meta.get('trafficSource') or 'direct')[:100]; sources[src]=sources.get(src,0)+1
                dev=str(meta.get('device') or 'unknown')[:40]; devices[dev]=devices.get(dev,0)+1
                camp=str(meta.get('utmCampaign') or '').strip()[:100]
                if camp: campaigns[camp]=campaigns.get(camp,0)+1
            source_rows=[{'source':k,'c':v} for k,v in sorted(sources.items(),key=lambda kv:kv[1],reverse=True)]
            device_rows=[{'device':k,'c':v} for k,v in sorted(devices.items(),key=lambda kv:kv[1],reverse=True)]
            campaign_rows=[{'campaign':k,'c':v} for k,v in sorted(campaigns.items(),key=lambda kv:kv[1],reverse=True)]
            self._json(200, {'ok':True,'days':days,'totals':totals,'daily':daily,'pages':pages,'sources':source_rows,'devices':device_rows,'campaigns':campaign_rows,'leadCount':leads})
            return
        return super().do_GET()

    def do_POST(self):
        parsed=urlparse(self.path); path=parsed.path
        try:
            if path == '/api/login':
                client_key = self.client_address[0] if self.client_address else 'local'
                allowed, retry = login_allowed(client_key)
                if not allowed:
                    self._json(429, {'ok':False,'error':f'Zbyt wiele prób logowania. Spróbuj ponownie za około {retry} s.'}, {'Retry-After': str(retry)}); return
                data=self._read_json()
                if not isinstance(data,dict): raise ValueError('Nieprawidłowe dane logowania.')
                ok=secrets.compare_digest(str(data.get('login','')),DEMO_LOGIN) and secrets.compare_digest(str(data.get('password','')),DEMO_PASSWORD)
                if not ok:
                    record_login_failure(client_key)
                    self._json(401, {'ok':False,'error':'Nieprawidłowy login lub hasło.'}); return
                clear_login_failures(client_key)
                token=make_session()
                self._json(200, {'ok':True,'user':'admin','demo':True},{'Set-Cookie':f'ak_admin_session={token}; Path=/; HttpOnly; SameSite=Strict; Max-Age={SESSION_TTL}'})
                return
            if path == '/api/logout':
                token=self._session_token()
                if token: _SESSIONS.pop(token,None)
                self._json(200, {'ok':True},{'Set-Cookie':'ak_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'})
                return
            if path == '/api/lead':
                data=self._read_json()
                if not isinstance(data,dict): raise ValueError('Nieprawidłowe zgłoszenie.')
                raw_payload=data.get('payload',data)
                if not isinstance(raw_payload,dict): raise ValueError('Nieprawidłowa treść zgłoszenia.')
                # Honeypot: real users never see/fill this field. Return success without
                # storing anything so simple bots do not learn how the filter works.
                if str(raw_payload.get('website','')).strip():
                    self._json(201, {'ok':True,'id':None}); return
                if not captcha_verify(str(raw_payload.get('captchaToken','')), str(raw_payload.get('captchaAnswer',''))):
                    self._json(400, {'ok':False,'error':'Nieprawidłowy wynik działania. Wpisz poprawną odpowiedź.','refreshCaptcha':True}); return
                client_key = self.client_address[0] if self.client_address else 'local'
                allowed, retry = lead_submission_allowed(client_key)
                if not allowed:
                    self._json(429, {'ok':False,'error':'Zbyt wiele zgłoszeń w krótkim czasie. Spróbuj ponownie później.'}, {'Retry-After': str(retry)}); return
                # Store only fields supported by the public forms. This keeps arbitrary
                # client JSON out of the CRM and gives every field an explicit size cap.
                field_limits={
                    'name':120, 'phone':50, 'car':120, 'topic':160,
                    'subject':160, 'message':3000, 'date':40,
                }
                payload={}
                for key, limit in field_limits.items():
                    if key in raw_payload and raw_payload.get(key) is not None:
                        payload[key]=str(raw_payload.get(key,'')).strip()[:limit]
                phone=payload.get('phone','')
                if not phone: self._json(400, {'ok':False,'error':'Telefon jest wymagany.'}); return
                if not (payload.get('topic') or payload.get('subject')): self._json(400, {'ok':False,'error':'Wybierz temat usługi.'}); return
                date_error=validate_preferred_date(payload)
                if date_error: self._json(400, {'ok':False,'error':date_error}); return
                source=str(data.get('source','homepage')).strip()[:50] or 'homepage'
                with _DB_LOCK, db() as conn:
                    cutoff=(datetime.now(timezone.utc)-timedelta(days=retention_days('lead'))).replace(microsecond=0).isoformat()
                    conn.execute('DELETE FROM leads WHERE created_at < ?', (cutoff,))
                    cur=conn.execute('INSERT INTO leads(created_at,status,source,payload_json) VALUES(?,?,?,?)',(utcnow(),'new',source,json.dumps(payload,ensure_ascii=False)))
                    conn.commit(); lead_id=cur.lastrowid
                record_lead_submission(client_key)
                queue_lead_email(lead_id, source, payload)
                self._json(201, {'ok':True,'id':lead_id,'emailNotificationQueued':mail_notifications_configured()})
                return
            if path == '/api/event':
                data=self._read_json()
                if not isinstance(data,dict): raise ValueError('Nieprawidłowy event.')
                event_type=str(data.get('type','')).strip()[:64]
                if not event_type: self._json(400,{'ok':False,'error':'Brak typu eventu.'}); return
                page=str(data.get('page','')).strip()[:200]
                raw_meta=data.get('meta',{})
                if not isinstance(raw_meta,dict): raw_meta={}
                # Explicit allow-list: analytics must not become a shadow CRM. In
                # particular, names, phone numbers, form messages and arbitrary PII are
                # dropped even when a crafted client posts them directly to this API.
                analytics_keys={
                    'trafficSource':100, 'utmSource':100, 'utmCampaign':120,
                    'utmMedium':100, 'utmContent':120, 'device':40,
                    'cmsSource':40, 'page':160, 'target':160,
                }
                payload={}
                for key, limit in analytics_keys.items():
                    if key in raw_meta and raw_meta.get(key) is not None:
                        value=str(raw_meta.get(key,'')).strip()[:limit]
                        if value: payload[key]=value
                with _DB_LOCK, db() as conn:
                    cutoff=(datetime.now(timezone.utc)-timedelta(days=retention_days('analytics'))).replace(microsecond=0).isoformat()
                    conn.execute('DELETE FROM events WHERE created_at < ?', (cutoff,))
                    conn.execute('INSERT INTO events(created_at,event_type,page,payload_json) VALUES(?,?,?,?)',(utcnow(),event_type,page,json.dumps(payload,ensure_ascii=False)))
                    # Keep local demo database bounded additionally by count.
                    conn.execute('DELETE FROM events WHERE id NOT IN (SELECT id FROM events ORDER BY id DESC LIMIT 20000)')
                    conn.commit()
                self._json(201, {'ok':True})
                return
            if path == '/api/admin/google-config':
                if not self._require_admin(): return
                data = self._read_json()
                if not isinstance(data, dict): raise ValueError('Nieprawidłowa konfiguracja Google.')
                secrets_data = _load_server_secrets()
                if data.get('clearApiKey'):
                    secrets_data.pop('googlePlacesApiKey', None)
                elif 'apiKey' in data:
                    key = str(data.get('apiKey') or '').strip()
                    if key and len(key) < 20:
                        self._json(400, {'ok': False, 'error': 'Klucz Google Places API wygląda na zbyt krótki.'}); return
                    if key:
                        secrets_data['googlePlacesApiKey'] = key
                _save_server_secrets(secrets_data)
                _GOOGLE_REVIEWS_CACHE.update({'place_id': None, 'expires': 0.0, 'payload': None})
                _GOOGLE_PLACE_LOOKUP_CACHE.update({'query': None, 'expires': 0.0, 'place': None})
                status = google_reviews_payload()
                self._json(200, {
                    'ok': True,
                    'apiKeyConfigured': bool(_google_api_key()),
                    'apiKeyMasked': (('••••••••' + _google_api_key()[-4:]) if _google_api_key() else ''),
                    'status': status,
                })
                return
            if path == '/api/admin/publish':
                if not self._require_admin(): return
                data={}
                if int(self.headers.get('Content-Length') or 0): data=self._read_json()
                summary=str(data.get('summary','Publikacja zmian'))[:180] if isinstance(data,dict) else 'Publikacja zmian'
                with _DB_LOCK, db() as conn:
                    row=conn.execute('SELECT live_json,draft_json FROM cms_state WHERE id=1').fetchone()
                    now=utcnow()
                    if row['live_json']==row['draft_json']:
                        self._json(200, {'ok':True,'changed':False,'message':'Brak zmian do publikacji.'}); return
                    conn.execute('UPDATE cms_state SET live_json=?, live_updated_at=? WHERE id=1',(row['draft_json'],now))
                    conn.execute('INSERT INTO revisions(created_at,author,summary,snapshot_json) VALUES(?,?,?,?)',(now,'admin',summary,row['draft_json']))
                    conn.commit()
                self._json(200, {'ok':True,'changed':True,'publishedAt':now})
                return
            if path.startswith('/api/admin/revisions/') and path.endswith('/restore'):
                if not self._require_admin(): return
                parts=[p for p in path.split('/') if p]
                try: rev_id=int(parts[-2])
                except: self._json(400,{'ok':False,'error':'Nieprawidłowe ID wersji.'}); return
                with _DB_LOCK, db() as conn:
                    row=conn.execute('SELECT snapshot_json FROM revisions WHERE id=?',(rev_id,)).fetchone()
                    if not row: self._json(404,{'ok':False,'error':'Nie znaleziono wersji.'}); return
                    now=utcnow(); conn.execute('UPDATE cms_state SET draft_json=?,draft_updated_at=? WHERE id=1',(row['snapshot_json'],now)); conn.commit()
                self._json(200, {'ok':True,'draftUpdatedAt':now})
                return
            if path == '/api/admin/media':
                if not self._require_admin(): return
                data=self._read_json()
                if not isinstance(data,dict): raise ValueError('Nieprawidłowy plik.')
                raw=str(data.get('dataUrl',''))
                if ',' not in raw or not raw.startswith('data:image/'):
                    self._json(400,{'ok':False,'error':'Obsługiwane są obrazy PNG/JPEG/WEBP.'}); return
                header,encoded=raw.split(',',1)
                mime=header.split(';',1)[0].replace('data:','')
                allowed={'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'}
                if mime not in allowed: self._json(400,{'ok':False,'error':'Nieobsługiwany format obrazu.'}); return
                blob=base64.b64decode(encoded,validate=True)
                if len(blob)>MAX_UPLOAD: self._json(413,{'ok':False,'error':'Plik po kompresji może mieć maksymalnie 4 MB.'}); return
                original=Path(str(data.get('filename','image'))).stem
                safe=''.join(c for c in original.lower() if c.isalnum() or c in '-_')[:50] or 'image'
                filename=f'{int(time.time())}-{secrets.token_hex(3)}-{safe}{allowed[mime]}'
                target=UPLOAD_DIR/filename; target.write_bytes(blob)
                title=str(data.get('title') or original)[:100]; tags=str(data.get('tags',''))[:250]
                public_path=f'./uploads/{filename}'
                with _DB_LOCK, db() as conn:
                    cur=conn.execute('INSERT INTO media(created_at,title,tags,filename,public_path,mime_type,bytes) VALUES(?,?,?,?,?,?,?)',(utcnow(),title,tags,filename,public_path,mime,len(blob)))
                    conn.commit(); mid=cur.lastrowid
                self._json(201, {'ok':True,'media':{'id':mid,'title':title,'tags':tags,'filename':filename,'public_path':public_path,'mime_type':mime,'bytes':len(blob)}})
                return
            if path == '/api/admin/reset-draft':
                if not self._require_admin(): return
                defaults=DEFAULTS_PATH.read_text(encoding='utf-8'); now=utcnow()
                with _DB_LOCK, db() as conn:
                    conn.execute('UPDATE cms_state SET draft_json=?,draft_updated_at=? WHERE id=1',(defaults,now)); conn.commit()
                self._json(200,{'ok':True,'draftUpdatedAt':now})
                return
        except (ValueError, json.JSONDecodeError, base64.binascii.Error) as exc:
            self._json(400, {'ok':False,'error':str(exc)}); return
        except Exception as exc:
            self._json(500, {'ok':False,'error':f'Błąd serwera: {exc}'}); return
        self._json(404, {'ok':False,'error':'Nie znaleziono endpointu.'})

    def do_PUT(self):
        path=urlparse(self.path).path
        try:
            if path == '/api/admin/draft':
                if not self._require_admin(): return
                data=self._read_json(); state=data.get('state') if isinstance(data,dict) else None
                ok,msg=validate_state(state)
                if not ok: self._json(400, {'ok':False,'error':msg}); return
                state_json=json.dumps(state,ensure_ascii=False,separators=(',',':')); now=utcnow()
                with _DB_LOCK, db() as conn:
                    conn.execute('UPDATE cms_state SET draft_json=?,draft_updated_at=? WHERE id=1',(state_json,now)); conn.commit()
                self._json(200, {'ok':True,'draftUpdatedAt':now,'counts':state_counts(state)})
                return
        except (ValueError,json.JSONDecodeError) as exc:
            self._json(400,{'ok':False,'error':str(exc)}); return
        except Exception as exc:
            self._json(500,{'ok':False,'error':f'Błąd serwera: {exc}'}); return
        self._json(404, {'ok':False,'error':'Nie znaleziono endpointu.'})

    def do_PATCH(self):
        path=urlparse(self.path).path
        if path.startswith('/api/admin/leads/'):
            if not self._require_admin(): return
            try:
                lead_id=int(path.rsplit('/',1)[1]); data=self._read_json()
                if not isinstance(data, dict): raise ValueError('Nieprawidłowe dane zgłoszenia.')
                updates=[]; params=[]
                if 'status' in data:
                    status=str(data.get('status',''))
                    allowed={'new','contacted','booked','closed','spam'}
                    if status not in allowed: self._json(400,{'ok':False,'error':'Nieprawidłowy status.'}); return
                    updates.append('status=?'); params.append(status)
                if 'note' in data:
                    note=str(data.get('note','')).strip()[:2000]
                    updates.append('note=?'); params.append(note)
                if not updates:
                    self._json(400,{'ok':False,'error':'Brak zmian do zapisania.'}); return
                params.append(lead_id)
                with _DB_LOCK, db() as conn:
                    cur=conn.execute(f"UPDATE leads SET {', '.join(updates)} WHERE id=?", tuple(params)); conn.commit()
                if not cur.rowcount: self._json(404,{'ok':False,'error':'Nie znaleziono zgłoszenia.'}); return
                self._json(200,{'ok':True})
            except Exception as exc:
                self._json(400,{'ok':False,'error':str(exc)})
            return
        self._json(404, {'ok':False,'error':'Nie znaleziono endpointu.'})


    def do_DELETE(self):
        path=urlparse(self.path).path
        if path.startswith('/api/admin/media/'):
            if not self._require_admin(): return
            try:
                media_id=int(path.rsplit('/',1)[1])
                with _DB_LOCK, db() as conn:
                    row=conn.execute('SELECT id,public_path,filename FROM media WHERE id=?',(media_id,)).fetchone()
                    if not row:
                        self._json(404,{'ok':False,'error':'Nie znaleziono pliku.'}); return
                    state_row=conn.execute('SELECT live_json,draft_json FROM cms_state WHERE id=1').fetchone()
                    live=json.loads(state_row['live_json']); draft=json.loads(state_row['draft_json'])
                    if state_uses_path(live,row['public_path']) or state_uses_path(draft,row['public_path']):
                        self._json(409,{'ok':False,'error':'Plik jest używany w LIVE lub szkicu. Najpierw podmień go w treści.'}); return
                    conn.execute('DELETE FROM media WHERE id=?',(media_id,)); conn.commit()
                target=UPLOAD_DIR/row['filename']
                try:
                    if target.exists(): target.unlink()
                except OSError:
                    pass
                self._json(200,{'ok':True})
            except Exception as exc:
                self._json(400,{'ok':False,'error':str(exc)})
            return
        self._json(404, {'ok':False,'error':'Nie znaleziono endpointu.'})


if __name__ == '__main__':
    init_db()
    print(f'AutoKlinika {BUILD_ID}: http://{HOST}:{PORT}')
    print(f'Panel administratora: http://{HOST}:{PORT}/administrator/')
    print('DEMO login: admin / admin (zmień dane przed wdrożeniem publicznym)')
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
