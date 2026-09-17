(() => {
  const fallback = () => structuredClone(window.AKCMS_DEFAULTS || {});
  let cachedState = fallback();
  const withTimeout = async (url, options = {}, ms = 1800) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try { return await fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(id); }
  };

  const getPublicState = async () => {
    const preview = new URLSearchParams(location.search).get('cmsPreview') === 'draft';
    try {
      const endpoint = preview ? '/api/admin/preview-state' : '/api/public-state';
      const res = await withTimeout(endpoint, { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.state) { cachedState = json.state; return { state: json.state, source: preview ? 'draft' : 'api', updatedAt: json.updatedAt }; }
    } catch (_) {}
    cachedState = fallback();
    return { state: cachedState, source: 'fallback', updatedAt: null };
  };

  const post = async (url, payload) => {
    try {
      const res = await fetch(url, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload || {})
      });
      let json = null;
      try { json = await res.json(); } catch (_) {}
      if (!res.ok) return { ok:false, error:json?.error || `HTTP ${res.status}`, httpStatus:res.status, refreshCaptcha:Boolean(json?.refreshCaptcha) };
      return json || { ok:true };
    } catch (_) { return { ok:false, error:'Nie udało się połączyć z serwerem. Spróbuj ponownie.', networkError:true }; }
  };

  const getCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha', { credentials:'same-origin', cache:'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json?.ok ? json : null;
    } catch (_) { return null; }
  };

  const refreshCaptcha = async (form) => {
    if (!form) return false;
    const question = form.querySelector('[data-captcha-question]');
    const token = form.querySelector('input[name="captchaToken"]');
    const answer = form.querySelector('input[name="captchaAnswer"]');
    if (!question || !token || !answer) return false;
    question.textContent = 'Ładowanie…'; token.value=''; answer.value=''; answer.disabled=true;
    const data = await getCaptcha();
    if (!data?.token) { question.textContent='Odśwież stronę'; answer.disabled=true; return false; }
    question.textContent = data.question || 'Działanie'; token.value=data.token; answer.disabled=false; return true;
  };

  const bindCaptcha = (form) => {
    if (!form || form.dataset.captchaBound === '1') return;
    form.dataset.captchaBound='1';
    form.querySelector('[data-captcha-refresh]')?.addEventListener('click',()=>refreshCaptcha(form));
    refreshCaptcha(form);
  };

  const trafficMeta = () => {
    let source = 'direct';
    const qs = new URLSearchParams(location.search || '');
    const utmSource = qs.get('utm_source') || '';
    const utmCampaign = qs.get('utm_campaign') || '';
    if (utmSource) source = utmSource;
    else if (document.referrer) {
      try {
        const host = new URL(document.referrer).hostname;
        if (host && host !== location.hostname) source = host;
      } catch (_) {}
    }
    return {
      trafficSource: source,
      utmSource,
      utmCampaign,
      device: matchMedia?.('(max-width: 767px)')?.matches ? 'mobile' : 'desktop'
    };
  };

  const track = (type, meta = {}) => {
    if (!type || cachedState?.legal?.analyticsEnabled === false) return;
    const payload = { type, page: location.pathname || '/', meta: { ...trafficMeta(), ...meta } };
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        if (navigator.sendBeacon('/api/event', blob)) return;
      }
    } catch (_) {}
    post('/api/event', payload);
  };

  const submitLead = async (source, payload) => {
    const response = await post('/api/lead', { source, payload });
    if (response?.ok) return response;
    if (location.protocol !== 'file:' && !response?.networkError) return response;
    // Offline/file fallback only — server validation errors must stay visible to the user.
    try {
      const key = 'akcms_local_leads_v1';
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      items.unshift({ id: `local-${Date.now()}`, created_at: new Date().toISOString(), status: 'new', source, payload });
      localStorage.setItem(key, JSON.stringify(items.slice(0, 100)));
      return { ok: true, local: true };
    } catch (_) { return response || { ok: false }; }
  };

  const bindTracking = (root = document) => {
    root.querySelectorAll('a[href^="tel:"]').forEach((el) => el.addEventListener('click', () => track('phone_click')));
    root.querySelectorAll('a[href*="google.com/maps"]').forEach((el) => el.addEventListener('click', () => track('directions_click')));
    root.querySelectorAll('a[href*="facebook.com"]').forEach((el) => el.addEventListener('click', () => track('facebook_click')));
    root.querySelectorAll('a[href*="cennik.html"]').forEach((el) => el.addEventListener('click', () => track('pricing_click')));
  };

  window.AKCMSClient = { getPublicState, getCachedState:()=>cachedState, track, submitLead, bindTracking, getCaptcha, refreshCaptcha, bindCaptcha };
})();
