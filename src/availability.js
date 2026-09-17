(() => {
  const DEFAULTS = {
    enabled: true,
    horizonDays: 75,
    limitedWindowDays: 2,
    weekendsClosed: true,
    services: {
      diagnostics: { label: 'Diagnostyka', leadDays: 2 },
      geometry: { label: 'Geometria 3D', leadDays: 3 },
      climate: { label: 'Klimatyzacja', leadDays: 0 },
      mechanic: { label: 'Mechanika', leadDays: 7 },
      tires: { label: 'Wulkanizacja', leadDays: 2 },
      oil: { label: 'Serwis olejowy', leadDays: 3 },
    },
  };

  const TOPIC_KEYS = [
    ['diagnostyka', 'diagnostics'],
    ['geometria', 'geometry'],
    ['klimatyzacja', 'climate'],
    ['mechanika', 'mechanic'],
    ['wulkanizacja', 'tires'],
    ['opon', 'tires'],
    ['olej', 'oil'],
    ['okresow', 'oil'],
    ['przeglad', 'oil'],
  ];

  const MONTHS = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];
  const WEEKDAYS = ['Pn','Wt','Śr','Cz','Pt','Sb','Nd'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
  const parseIso = (value) => {
    const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? new Date(Date.UTC(Number(m[1]), Number(m[2])-1, Number(m[3]), 12)) : null;
  };
  const addDays = (date, days) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + Number(days || 0), 12));
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);
  const sameMonth = (a, b) => a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
  const isWeekend = (date) => [0,6].includes(date.getUTCDay());
  const normalizeText = (value='') => String(value).toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const warsawToday = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/Warsaw', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
    const get = (type) => Number(parts.find((p) => p.type === type)?.value || 0);
    return new Date(Date.UTC(get('year'), get('month') - 1, get('day'), 12));
  };

  const mergeConfig = (settings={}) => {
    const raw = settings.bookingAvailability || {};
    const cfg = {
      ...DEFAULTS,
      ...raw,
      services: {},
    };
    for (const [key, def] of Object.entries(DEFAULTS.services)) {
      cfg.services[key] = { ...def, ...(raw.services?.[key] || {}) };
      cfg.services[key].leadDays = Math.max(0, Math.min(60, Number(cfg.services[key].leadDays || 0)));
    }
    cfg.horizonDays = Math.max(14, Math.min(365, Number(cfg.horizonDays || DEFAULTS.horizonDays)));
    cfg.limitedWindowDays = Math.max(0, Math.min(14, Number(cfg.limitedWindowDays ?? DEFAULTS.limitedWindowDays)));
    cfg.weekendsClosed = cfg.weekendsClosed !== false;
    cfg.enabled = cfg.enabled !== false;
    return cfg;
  };

  const topicKey = (value='') => {
    const v = normalizeText(value);
    return TOPIC_KEYS.find(([needle]) => v.includes(needle))?.[1] || '';
  };

  const advanceToWorkingDay = (date, cfg) => {
    let out = new Date(date);
    if (!cfg.weekendsClosed) return out;
    while (isWeekend(out)) out = addDays(out, 1);
    return out;
  };

  const earliestFor = (serviceKey, cfg, today = warsawToday()) => {
    const lead = cfg.enabled === false ? 0 : (cfg.services[serviceKey]?.leadDays ?? 0);
    return advanceToWorkingDay(addDays(today, lead), cfg);
  };

  const nthSelectableDayAfter = (start, count, cfg) => {
    let d = new Date(start);
    let left = Math.max(0, count);
    while (left > 0) {
      d = addDays(d, 1);
      if (!cfg.weekendsClosed || !isWeekend(d)) left -= 1;
    }
    return d;
  };

  const dayStatus = (date, serviceKey, cfg, today, earliest, yellowUntil) => {
    const diff = daysBetween(today, date);
    if (diff < 0) return { key:'past', enabled:false, label:'Termin minął' };
    if (cfg.weekendsClosed && isWeekend(date)) return { key:'closed', enabled:false, label:'Warsztat nie przyjmuje online w weekend' };
    if (date < earliest) return { key:'blocked', enabled:false, label:'Za małe wyprzedzenie dla tej usługi' };
    if (date <= yellowUntil) return { key:'limited', enabled:true, label:'Najbliższy termin — do potwierdzenia' };
    return { key:'open', enabled:true, label:'Możesz wskazać ten dzień' };
  };

  const formatDate = (date, long=false) => new Intl.DateTimeFormat('pl-PL', long
    ? { weekday:'short', day:'2-digit', month:'long', year:'numeric', timeZone:'Europe/Warsaw' }
    : { day:'2-digit', month:'2-digit', year:'numeric', timeZone:'Europe/Warsaw' }
  ).format(date);

  const template = () => `
    <button type="button" class="availability-trigger" data-availability-trigger aria-haspopup="dialog" aria-expanded="false">
      <span data-availability-value>Najpierw wybierz temat</span><span class="availability-trigger-icon" aria-hidden="true">▣</span>
    </button>
    <input type="hidden" name="date" data-availability-input />
    <div class="availability-hint" data-availability-hint>Termin jest preferencją — potwierdzimy go telefonicznie.</div>
    <div class="availability-panel" data-availability-panel hidden role="dialog" aria-label="Wybierz preferowany dzień">
      <div class="availability-head">
        <button type="button" class="availability-nav" data-calendar-prev aria-label="Poprzedni miesiąc">‹</button>
        <strong data-calendar-title></strong>
        <button type="button" class="availability-nav" data-calendar-next aria-label="Następny miesiąc">›</button>
      </div>
      <div class="availability-weekdays">${WEEKDAYS.map((d)=>`<span>${d}</span>`).join('')}</div>
      <div class="availability-days" data-calendar-days></div>
      <div class="availability-legend">
        <span><i class="is-blocked"></i>Niedostępny online</span>
        <span><i class="is-limited"></i>Najbliższy / do potwierdzenia</span>
        <span><i class="is-open"></i>Możesz wskazać</span>
      </div>
      <p class="availability-note">To orientacyjne okno przyjęć według minimalnego wyprzedzenia ustawionego przez warsztat, a nie kalendarz rezerwacji na żywo. Termin zawsze potwierdzamy telefonicznie.</p>
    </div>`;

  const bind = (form, settings={}) => {
    if (!form) return null;
    const cfg = mergeConfig(settings);
    const topic = form.querySelector('select[name="topic"], select[name="subject"], input[name="topic"], input[name="subject"]');
    const holder = form.querySelector('[data-availability]');
    if (!holder) return null;
    holder.innerHTML = template();
    const trigger = holder.querySelector('[data-availability-trigger]');
    const valueEl = holder.querySelector('[data-availability-value]');
    const input = holder.querySelector('[data-availability-input]');
    const hint = holder.querySelector('[data-availability-hint]');
    const panel = holder.querySelector('[data-availability-panel]');
    const title = holder.querySelector('[data-calendar-title]');
    const days = holder.querySelector('[data-calendar-days]');
    const prev = holder.querySelector('[data-calendar-prev]');
    const next = holder.querySelector('[data-calendar-next]');
    const today = warsawToday();
    const maxDate = addDays(today, cfg.horizonDays);
    let view = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 12));
    let selected = null;

    const getKey = () => topicKey(topic?.value || '');
    const close = () => { panel.hidden = true; trigger.setAttribute('aria-expanded','false'); };
    const open = () => {
      const key = getKey();
      if (!key) {
        topic?.focus();
        holder.classList.add('needs-topic');
        setTimeout(()=>holder.classList.remove('needs-topic'), 650);
        return;
      }
      const earliest = earliestFor(key, cfg, today);
      if (!selected && !sameMonth(view, earliest) && earliest > addDays(today, 24)) view = new Date(Date.UTC(earliest.getUTCFullYear(), earliest.getUTCMonth(), 1, 12));
      render();
      panel.hidden = false;
      trigger.setAttribute('aria-expanded','true');
    };

    const render = () => {
      const key = getKey();
      const service = cfg.services[key];
      if (!key || !service) {
        title.textContent = '';
        days.innerHTML = '';
        trigger.disabled = true;
        valueEl.textContent = 'Najpierw wybierz temat';
        hint.textContent = 'Wybierz temat — pokażemy najwcześniejsze orientacyjne okno przyjęcia.';
        return;
      }
      trigger.disabled = false;
      const earliest = earliestFor(key, cfg, today);
      const yellowUntil = nthSelectableDayAfter(earliest, Math.max(0, cfg.limitedWindowDays - 1), cfg);
      const leadDays = cfg.enabled === false ? 0 : service.leadDays;
      hint.innerHTML = cfg.enabled === false
        ? `<strong>${service.label}:</strong> inteligentne wyprzedzenie jest wyłączone. Możesz wskazać dowolny przyszły dzień roboczy.`
        : `<strong>${service.label}:</strong> minimalne wyprzedzenie ${leadDays === 0 ? '0 dni' : `${leadDays} ${leadDays === 1 ? 'dzień' : 'dni'}`}. Najwcześniej online: <b>${formatDate(earliest, true)}</b>.`;
      title.textContent = `${MONTHS[view.getUTCMonth()]} ${view.getUTCFullYear()}`;
      const monthStart = new Date(Date.UTC(view.getUTCFullYear(), view.getUTCMonth(), 1, 12));
      const offset = (monthStart.getUTCDay() + 6) % 7;
      const gridStart = addDays(monthStart, -offset);
      let html = '';
      for (let i = 0; i < 42; i++) {
        const d = addDays(gridStart, i);
        const status = dayStatus(d, key, cfg, today, earliest, yellowUntil);
        const outside = d.getUTCMonth() !== view.getUTCMonth();
        const tooFar = d > maxDate;
        const enabled = status.enabled && !outside && !tooFar;
        const active = selected && iso(selected) === iso(d);
        const cls = ['availability-day', `is-${status.key}`, outside ? 'is-outside' : '', active ? 'is-selected' : ''].filter(Boolean).join(' ');
        html += `<button type="button" class="${cls}" data-date="${iso(d)}" ${enabled ? '' : 'disabled'} title="${status.label}"><span>${d.getUTCDate()}</span></button>`;
      }
      days.innerHTML = html;
      const minMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 12));
      const maxMonth = new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), 1, 12));
      prev.disabled = view <= minMonth;
      next.disabled = view >= maxMonth;
    };

    const syncTopic = () => {
      const key = getKey();
      selected = null;
      input.value = '';
      valueEl.textContent = key ? 'Wybierz preferowany dzień' : 'Najpierw wybierz temat';
      const earliest = key ? earliestFor(key, cfg, today) : today;
      view = new Date(Date.UTC(earliest.getUTCFullYear(), earliest.getUTCMonth(), 1, 12));
      close();
      render();
    };

    topic?.addEventListener('change', syncTopic);
    trigger.addEventListener('click', () => panel.hidden ? open() : close());
    prev.addEventListener('click', () => { view = new Date(Date.UTC(view.getUTCFullYear(), view.getUTCMonth()-1, 1, 12)); render(); });
    next.addEventListener('click', () => { view = new Date(Date.UTC(view.getUTCFullYear(), view.getUTCMonth()+1, 1, 12)); render(); });
    days.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-date]');
      if (!btn || btn.disabled) return;
      selected = parseIso(btn.dataset.date);
      input.value = btn.dataset.date;
      valueEl.textContent = formatDate(selected, true);
      input.dispatchEvent(new Event('change', { bubbles:true }));
      render();
      setTimeout(close, 110);
    });
    document.addEventListener('click', (event) => { if (!holder.contains(event.target)) close(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) close(); });
    syncTopic();
    return { render, close, get selected(){ return selected; } };
  };

  window.AKAvailability = { bind, defaults: DEFAULTS, mergeConfig, topicKey, earliestFor };
})();
