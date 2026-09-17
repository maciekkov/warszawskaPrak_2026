(() => {
  'use strict';
  const STORAGE_KEY = 'ak_privacy_consent_v1';
  const MAX_AGE = 1000 * 60 * 60 * 24 * 183; // ok. 6 miesięcy
  const defaultPrefs = { necessary: true, external: false };
  let prefs = { ...defaultPrefs };
  let banner, modal, externalToggle;
  let mapsAvailable = true;
  let analyticsEnabled = true;

  const safeParse = (value) => { try { return JSON.parse(value); } catch { return null; } };
  const storageGet = (key) => { try { return window.localStorage.getItem(key); } catch { return null; } };
  const storageSet = (key, value) => { try { window.localStorage.setItem(key, value); return true; } catch { return false; } };
  const getStored = () => {
    const parsed = safeParse(storageGet(STORAGE_KEY));
    if (!parsed || parsed.version !== 1 || !parsed.savedAt || Date.now() - new Date(parsed.savedAt).getTime() > MAX_AGE) return null;
    return { necessary: true, external: Boolean(parsed.external) };
  };
  const save = (next, source = 'settings') => {
    prefs = { necessary: true, external: mapsAvailable ? Boolean(next.external) : false };
    storageSet(STORAGE_KEY, JSON.stringify({ version:1, external:prefs.external, savedAt:new Date().toISOString(), source }));
    apply();
    hideBanner();
    closeSettings(false);
    window.dispatchEvent(new CustomEvent('akConsentChanged', { detail: { ...prefs } }));
  };
  const injectUi = () => {
    document.body.insertAdjacentHTML('beforeend', `
      <aside class="ak-cookie-banner" data-cookie-banner hidden role="region" aria-label="Ustawienia prywatności">
        <div class="ak-cookie-inner">
          <div><div class="ak-cookie-kicker">Prywatność i cookies</div><h2 class="ak-cookie-title">Ty decydujesz o treściach zewnętrznych.</h2><p class="ak-cookie-copy">Serwis używa tylko pamięci niezbędnej do zapamiętania Twojego wyboru. Google Maps uruchamiamy dopiero po Twojej zgodzie, ponieważ zewnętrzna mapa może przekazywać dane do Google. <a href="./cookies.html">Dowiedz się więcej</a>.</p></div>
          <div class="ak-cookie-actions">
            <button class="ak-cookie-btn reject" type="button" data-cookie-reject>Odrzuć opcjonalne</button>
            <button class="ak-cookie-btn settings" type="button" data-cookie-settings>Ustawienia</button>
            <button class="ak-cookie-btn primary" type="button" data-cookie-accept>Akceptuj wszystkie</button>
          </div>
        </div>
      </aside>
      <div class="ak-cookie-modal-wrap" data-cookie-modal hidden>
        <section class="ak-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="ak-cookie-title">
          <div class="ak-cookie-modal-head"><div><h2 id="ak-cookie-title">Ustawienia prywatności</h2><p>Opcjonalne technologie są domyślnie wyłączone. Zmianę możesz cofnąć w każdej chwili.</p></div><button class="ak-cookie-close" type="button" data-cookie-close aria-label="Zamknij">×</button></div>
          <div class="ak-cookie-modal-body">
            <div class="ak-cookie-row"><div><h3>Niezbędne</h3><p>Zapamiętują Twój wybór prywatności i pozwalają stronie działać zgodnie z tym wyborem.</p><small>Technologia: localStorage · ważność wyboru: do ok. 6 miesięcy.</small></div><span class="ak-cookie-lock">ZAWSZE AKTYWNE</span></div>
            <div class="ak-cookie-row"><div><h3>Treści zewnętrzne — Google Maps</h3><p>${mapsAvailable?'Po włączeniu osadzamy mapę Google. Google może wtedy otrzymać m.in. adres IP i dane urządzenia oraz użyć własnych cookies lub podobnych technologii.':'Osadzona mapa Google jest obecnie wyłączona przez administratora serwisu.'}</p><small>${mapsAvailable?'Mapa jest blokowana do czasu zgody. Bez zgody nadal działa link „Wyznacz trasę”.':'Link „Wyznacz trasę” nadal działa jako zwykły link zewnętrzny.'}</small></div>${mapsAvailable?'<label class="ak-switch"><input type="checkbox" data-cookie-external><span aria-hidden="true"></span><span class="sr-only">Zezwól na Google Maps</span></label>':'<span class="ak-cookie-lock">WYŁĄCZONE</span>'}</div>
            <div class="ak-cookie-row"><div><h3>Analityka własna</h3><p>${analyticsEnabled?'Serwis zapisuje zagregowane zdarzenia (np. odsłona, kliknięcie telefonu, cennika lub trasy) w prywatnych plikach JSON poza public_html. Mechanizm nie używa cookies, identyfikatora użytkownika ani danych formularza.':'Analityka własna jest obecnie wyłączona przez administratora.'}</p><small>Marketing, remarketing i zewnętrzne piksele reklamowe pozostają nieaktywne.</small></div><span class="ak-cookie-lock">${analyticsEnabled?'BEZ COOKIES':'NIEAKTYWNA'}</span></div>
          </div>
          <p class="ak-cookie-note">Podstawę zasad dotyczących zapisu/odczytu informacji na urządzeniu stanowi m.in. art. 399 Prawa komunikacji elektronicznej; zgoda na opcjonalne technologie musi być dobrowolna i możliwa do łatwego wycofania.</p>
          <div class="ak-cookie-modal-actions"><button class="ak-cookie-btn reject" type="button" data-cookie-modal-reject>Odrzuć opcjonalne</button><button class="ak-cookie-btn primary" type="button" data-cookie-save>Zapisz wybór</button></div>
        </section>
      </div>`);
    banner = document.querySelector('[data-cookie-banner]');
    modal = document.querySelector('[data-cookie-modal]');
    externalToggle = document.querySelector('[data-cookie-external]');
    document.querySelector('[data-cookie-accept]')?.addEventListener('click', () => save({ external:true }, 'accept_all'));
    document.querySelector('[data-cookie-reject]')?.addEventListener('click', () => save({ external:false }, 'reject_optional'));
    document.querySelector('[data-cookie-settings]')?.addEventListener('click', openSettings);
    document.querySelector('[data-cookie-close]')?.addEventListener('click', closeSettings);
    document.querySelector('[data-cookie-modal-reject]')?.addEventListener('click', () => save({ external:false }, 'settings_reject'));
    document.querySelector('[data-cookie-save]')?.addEventListener('click', () => save({ external:Boolean(externalToggle?.checked) }, 'settings_save'));
    modal?.addEventListener('click', (event) => { if (event.target === modal) closeSettings(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal && !modal.hidden) closeSettings(); });
    document.addEventListener('click', (event) => {
      const opener = event.target.closest('[data-open-cookie-settings]');
      if (opener) { event.preventDefault(); openSettings(); }
      const mapEnable = event.target.closest('[data-enable-maps]');
      if (mapEnable) { event.preventDefault(); if (mapsAvailable) openSettings(true); }
    });
  };
  function showBanner(){ if (banner) banner.hidden = false; }
  function hideBanner(){ if (banner) banner.hidden = true; }
  function openSettings(focusExternal = false){
    if (!modal) return;
    externalToggle.checked = prefs.external;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => focusExternal ? externalToggle?.focus() : document.querySelector('[data-cookie-close]')?.focus(), 0);
  }
  function closeSettings(restoreBanner = true){
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (restoreBanner && !getStored()) showBanner();
  }
  const loadMap = (card) => {
    if (!mapsAvailable) return;
    if (card.querySelector('iframe[data-consent-loaded="true"]')) return;
    const placeholder = card.querySelector('[data-map-consent]');
    const iframe = document.createElement('iframe');
    iframe.className = 'google-map';
    iframe.title = 'Google Maps — AutoKlinika, Górzyn 125';
    const query = card.dataset.mapQuery || 'G%C3%B3rzyn+125%2C+68-300+Lubsko';
    iframe.src = `https://www.google.com/maps?q=${query}&z=14&output=embed`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen','');
    iframe.dataset.consentLoaded = 'true';
    card.prepend(iframe);
    if (placeholder) placeholder.hidden = true;
  };
  const unloadMap = (card) => {
    card.querySelector('iframe[data-consent-loaded="true"]')?.remove();
    const placeholder = card.querySelector('[data-map-consent]');
    if (placeholder) placeholder.hidden = false;
  };
  const syncSettingsPage = () => {
    document.querySelectorAll('[data-settings-external]').forEach((el) => { el.checked = prefs.external; el.disabled = !mapsAvailable; });
    document.querySelectorAll('[data-settings-save]').forEach((btn) => btn.onclick = () => {
      const input = document.querySelector('[data-settings-external]');
      save({ external:Boolean(input?.checked) }, 'settings_page');
      const msg = document.querySelector('[data-settings-saved]'); if (msg) { msg.hidden=false; setTimeout(()=>msg.hidden=true,3000); }
    });
    document.querySelectorAll('[data-settings-reject]').forEach((btn) => btn.onclick = () => save({ external:false }, 'settings_page_reject'));
    document.querySelectorAll('[data-settings-accept]').forEach((btn) => btn.onclick = () => save({ external:true }, 'settings_page_accept'));
  };
  function apply(){
    document.querySelectorAll('.contact-map-card').forEach((card) => (mapsAvailable && prefs.external) ? loadMap(card) : unloadMap(card));
    if (externalToggle) externalToggle.checked = prefs.external;
    syncSettingsPage();
  }
  const boot = async () => {
    try {
      const result = await window.AKCMSClient?.getPublicState?.();
      const legal = result?.state?.legal || window.AKCMS_DEFAULTS?.legal || {};
      mapsAvailable = legal.mapsEnabled !== false;
      analyticsEnabled = legal.analyticsEnabled !== false;
    } catch (_) {}
    injectUi();
    const stored = getStored();
    prefs = stored || { ...defaultPrefs };
    apply();
    if (!stored) showBanner();
    else hideBanner();
    window.AutoKlinikaConsent = { get:()=>({ ...prefs }), openSettings, saveExternal:(value)=>save({external:Boolean(value)},'api') };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
