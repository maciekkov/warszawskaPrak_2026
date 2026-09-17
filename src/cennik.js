(async () => {
const cmsResult = await window.AKCMSClient.getPublicState();
const cmsState = cmsResult.state || window.AKCMS_DEFAULTS;
const business = cmsState.business || window.AKCMS_DEFAULTS.business;
const categories = cmsState.pricing?.categories || window.AKCMS_DEFAULTS.pricing.categories;
const phoneDisplay = business.phoneDisplay || '505 104 110';
const phoneHref = `tel:${business.phoneE164 || phoneDisplay.replace(/\D/g, '')}`;
const facebookHref = business.facebook || 'https://www.facebook.com/autoklinikamk/?locale=pl_PL';
const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.googleMapsQuery || `${business.addressLine}, ${business.postalCity}`)}`;
const seo = cmsState.seo?.pricing;
const upsertMeta = (selector, attrs) => { let el=document.head.querySelector(selector); if(!el){ el=document.createElement('meta'); document.head.appendChild(el); } Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v)); return el; };
const applySeo = (cfg={}) => {
  if (cfg.title) document.title = cfg.title;
  if (cfg.description) upsertMeta('meta[name="description"]',{name:'description',content:cfg.description});
  upsertMeta('meta[name="robots"]',{name:'robots',content:cfg.index===false?'noindex,nofollow':'index,follow'});
  const ogTitle=cfg.ogTitle||cfg.title, ogDescription=cfg.ogDescription||cfg.description;
  if(ogTitle) upsertMeta('meta[property="og:title"]',{property:'og:title',content:ogTitle});
  if(ogDescription) upsertMeta('meta[property="og:description"]',{property:'og:description',content:ogDescription});
  if(cfg.ogImage) upsertMeta('meta[property="og:image"]',{property:'og:image',content:cfg.ogImage});
  if(cfg.canonical){ let link=document.head.querySelector('link[rel="canonical"]'); if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link);} link.href=cfg.canonical; }
};
applySeo(seo);
window.AKCMSClient.track('page_view', { cmsSource: cmsResult.source, page: 'cennik' });
window.AKCMSClient.track('pricing_view');

const Icon = ({ name, size = 24 }) => {
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  const paths = {
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.45 19.45 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.98.72 2.92a2 2 0 0 1-.45 2.11L8.1 10.03a16 16 0 0 0 5.87 5.87l1.28-1.28a2 2 0 0 1 2.11-.45c.94.35 1.92.59 2.92.72A2 2 0 0 1 22 16.92Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    gear: '<path d="M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.3v-4h.1A1.7 1.7 0 0 0 4 8.5a1.7 1.7 0 0 0-.34-1.88L3.6 6.56 6.46 3.7l.06.06A1.7 1.7 0 0 0 8.4 4.1a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2.3h4v.1A1.7 1.7 0 0 0 14.9 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.9 8.4c.12.37.33.7.6 1 .31.3.71.47 1.1.5h.1v4h-.1a1.7 1.7 0 0 0-1.6 1.1Z"/>',
    document: '<path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
    coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    tire: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5M6.3 6.3l3.5 3.5M14.2 14.2l3.5 3.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/>',
    route: '<path d="M7 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm10 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="M9.5 8.5c5 0 5 7 1 7H8"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    facebook: '<path d="M14.2 8.3V6.6c0-.8.5-1 1.1-1h2.8V2.1h-3.9c-3.5 0-4.8 2.1-4.8 4.7v1.5H7v3.9h2.4V22h4.8v-9.8h3.4l.5-3.9h-3.9Z" fill="currentColor" stroke="none"/>'
  };
  return `<svg ${common}>${paths[name] || ''}</svg>`;
};

const logo = (homeHref = './index.html', onDark = false) => onDark ? `
<a class="brand brand-plate brand-on-dark" href="${homeHref}" aria-label="AutoKlinika — strona główna">
  <img class="brand-logo-img" src="./assets/logo-autoklinika-light.png" alt="AutoKlinika" />
</a>` : `
<a class="brand brand-plate header-brand" href="${homeHref}" aria-label="AutoKlinika — strona główna">
  <span class="brand-logo-stack" aria-hidden="true">
    <img class="brand-logo-img brand-logo-light" src="./assets/logo-autoklinika-light.png" alt="" />
    <img class="brand-logo-img brand-logo-dark" src="./assets/logo-autoklinika-dark.png" alt="" />
  </span>
  <span class="sr-only">AutoKlinika</span>
</a>`;
const brandify = (value='') => String(value).replace(/AUTOKLINIKI|AUTOKLINIKA|AutoKlinika|Autoklinika/g, (word) => {
  const k=word.toLowerCase().indexOf('k'); if(k<1)return word;
  return `<span class="brand-word"><span class="brand-letter">${word[0]}</span>${word.slice(1,k)}<span class="brand-letter">${word[k]}</span>${word.slice(k+1)}</span>`;
});

const table = (rows, leftLabel = 'USŁUGA', rightLabel = 'CENA') => `
  <div class="pricing-table two-col">
    <div class="pricing-row pricing-head"><span>${leftLabel}</span><span>${rightLabel}</span></div>
    ${(rows || []).map((row) => `<div class="pricing-row"><strong>${row.name}</strong><b>${row.price}</b></div>`).join('')}
  </div>`;

const priceAnchorId = (value = '') => `price-${String(value || 'section').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`;

const renderCategory = (category) => {
  const groups = category.groups || [];
  const grouped = groups.length > 1 || (groups[0]?.title || '').trim();
  return `<section id="${priceAnchorId(category.id)}" class="price-category ${category.id === 'tires' ? 'price-tires-expanded' : ''}" data-price-category tabindex="-1">
    <div class="shell category-inner">
      <div class="category-title"><span>${category.title}</span><i></i></div>
      ${grouped ? `<div class="tire-groups">${groups.map((group) => `<article class="tire-group"><h3>${group.title || category.title}</h3>${table(group.rows, (group.leftLabel || 'USŁUGA').toUpperCase(), 'CENA')}</article>`).join('')}</div>` : table(groups[0]?.rows || [])}
    </div>
  </section>`;
};

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="top"></div>
  <header class="site-header" data-header>
    <div class="nav-row"><div class="shell nav-inner">
      ${logo()}
      <button class="menu-toggle" aria-label="Otwórz menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button>
      <nav class="main-nav" data-menu><a href="./index.html#services">Usługi</a><a class="active" href="./cennik.html" aria-current="page">Cennik</a><a href="./index.html#process">Jak pracujemy</a><a href="./index.html#about">O nas</a><a href="#contact">Kontakt</a></nav>
      <a class="header-social" href="${facebookHref}" target="_blank" rel="noopener noreferrer" aria-label="AutoKlinika na Facebooku">${Icon({name:'facebook',size:20})}<span class="sr-only">Facebook</span></a>
      <a class="btn btn-primary header-phone phone-cta" href="${phoneHref}">${Icon({name:'phone',size:20})}<span>Zadzwoń ${phoneDisplay}</span></a>
    </div></div>
  </header>

  <main>
    <section class="price-hero" aria-labelledby="price-title">
      <div class="price-hero-media" aria-hidden="true"><img src="./assets/pricing-hero-workshop.png" alt="" /><span class="media-shade"></span></div>
      <div class="shell price-hero-shell"><div class="price-hero-copy">
        <div class="eyebrow">${brandify('AUTOKLINIKA · GÓRZYN K. LUBSKA')}</div><h1 id="price-title">Cennik <span>usług</span></h1>
        <p>Pełny cennik pozycji dostępnych w aktualnej ofercie. Przy pracach niestandardowych najpierw ustalamy przyczynę, zakres i koszt.</p>
        <div class="hero-actions"><a class="btn btn-primary btn-hero phone-cta" href="${phoneHref}">${Icon({name:'phone',size:20})}<span>Zadzwoń ${phoneDisplay}</span></a><a class="btn btn-secondary btn-hero" href="#contact">${Icon({name:'calendar',size:19})}<span>Poproś o termin</span></a></div>
        <div class="hero-micro">${Icon({name:'clock',size:17})}<span>${business.hours} · ${business.addressLine}</span></div>
      </div><aside class="price-hero-claim"><span></span><strong>JASNE ZASADY</strong><strong>UCZCIWY ZAKRES</strong><strong>BEZ ZGADYWANIA</strong></aside></div>
    </section>

    <section class="price-info-strip" aria-label="Najważniejsze zasady cennika"><div class="shell price-info-grid">
      <article><span>${Icon({name:'gear',size:32})}</span><div><strong>Części i materiały</strong><small>wyceniamy zgodnie z zakresem</small></div></article>
      <article><span>${Icon({name:'document',size:32})}</span><div><strong>Przed pracą uzgadniamy</strong><small>koszt i plan</small></div></article>
      <article><span>${Icon({name:'coins',size:32})}</span><div><strong>Ceny robocizny</strong><small>podane są jasno</small></div></article>
      <article><span>${Icon({name:'tire',size:32})}</span><div><strong>Pełny cennik opon i TPMS</strong><small>bez ukrywania tabel</small></div></article>
    </div></section>

    ${categories.map(renderCategory).join('')}

    <section class="price-note"><div class="shell note-box">${Icon({name:'info',size:27})}<p>W przypadku zapieczonych śrub, skorodowanych elementów lub prac wykraczających poza standardowy zakres cena może się zmienić. Zanim wykonamy dodatkową pracę, najpierw uzgadniamy ją z klientem.</p></div></section>

    <section class="price-contact" id="contact" aria-labelledby="contact-title"><div class="shell contact-grid">
      <div class="contact-copy"><div class="eyebrow eyebrow-line">KONTAKT</div><h2 id="contact-title">Masz pytania dotyczące cen?</h2><p>Zadzwoń lub opisz problem. Powiemy, od czego zacząć i jak wygląda dalszy krok.</p>
        <div class="contact-lines"><a href="${mapHref}" target="_blank" rel="noopener">${Icon({name:'pin',size:25})}<span>${business.addressLine}, ${business.postalCity}</span></a><a href="${phoneHref}">${Icon({name:'phone',size:25})}<span>${phoneDisplay}</span></a><span>${Icon({name:'clock',size:25})}<span>${business.hours}</span></span></div>
        <div class="contact-actions"><a class="btn btn-primary phone-cta" href="${phoneHref}">${Icon({name:'phone',size:19})}<span>Zadzwoń teraz</span></a><a class="btn btn-secondary" href="${mapHref}" target="_blank" rel="noopener">${Icon({name:'route',size:19})}<span>Wyznacz trasę</span></a></div>
      </div>
      <figure class="contact-photo"><img src="./assets/pricing-contact-workshop.png" alt="Samochód na podnośniku w warsztacie AutoKlinika" /></figure>
      <form class="booking-card" data-booking-form><input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;pointer-events:none" /><h3>Poproś o termin</h3>
        <div class="form-grid two"><label><span>Imię</span><input name="name" autocomplete="name" /></label><label><span>Telefon <b>*</b></span><input name="phone" inputmode="tel" required /></label></div>
        <div class="form-grid two"><label><span>Samochód</span><input name="car" /></label><label><span>Temat <b>*</b></span><span class="topic-select-wrap"><select name="topic" required><option value="" selected disabled>Wybierz temat</option><option>Diagnostyka</option><option>Geometria 3D</option><option>Klimatyzacja</option><option>Mechanika</option><option>Wulkanizacja</option><option>Serwis olejowy</option></select></span></label></div>
        <label><span>Opis objawu lub usługi</span><textarea name="message" rows="2"></textarea></label><div class="availability-field"><span class="availability-field-label">Preferowany dzień</span><div data-availability></div></div>
        <div class="captcha-box"><div><span>Kontrola antyspamowa</span><strong data-captcha-question>Ładowanie…</strong></div><input type="hidden" name="captchaToken" /><input name="captchaAnswer" inputmode="numeric" autocomplete="off" required aria-label="Wynik działania" placeholder="Wynik" /><button type="button" data-captcha-refresh aria-label="Nowe działanie" title="Nowe działanie">↻</button></div>
        <div class="form-error" data-form-error hidden></div>
        <span class="form-privacy-note">Dane z tego zgłoszenia są używane do obsługi zapytania i ustalenia terminu. Szczegóły: <a href="./polityka-prywatnosci.html">Polityka prywatności</a>.</span>
        <button class="btn btn-primary submit-btn" type="submit">${Icon({name:'send',size:19})}<span>Wyślij zgłoszenie</span></button><small>Wysłanie formularza nie oznacza jeszcze rezerwacji terminu. Skontaktujemy się z Tobą, aby potwierdzić szczegóły.</small>
        <div class="form-success" data-form-success hidden>${Icon({name:'check',size:18})}<span>Zgłoszenie dotarło. Oddzwonimy w godzinach pracy.</span></div>
      </form>
    </div></section>
  </main>

  <footer class="site-footer"><div class="shell footer-main">
    <div class="footer-brand">${logo('./index.html',true)}<p>Najpierw diagnoza. Potem naprawa.</p></div>
    <div class="footer-col"><h3>Usługi</h3>${(cmsState.services || []).filter(s=>s.active!==false).slice(0,6).map(s=>`<a href="./index.html#services">${s.title}</a>`).join('')}</div>
    <div class="footer-col"><h3>Informacje</h3><a href="./cennik.html">Cennik</a><a href="./index.html#process">Jak pracujemy</a><a href="./index.html#about">O nas</a><a href="#contact">Kontakt</a></div>
    <div class="footer-col"><h3>Kontakt</h3><a href="${mapHref}" target="_blank" rel="noopener">${Icon({name:'pin',size:19})}<span>${business.addressLine}, ${business.postalCity}</span></a><a href="${phoneHref}">${Icon({name:'phone',size:19})}<span>${phoneDisplay}</span></a><span>${Icon({name:'clock',size:19})}<span>${business.hours}</span></span></div>
  </div><div class="footer-legal"><div class="shell"><span>© ${new Date().getFullYear()} ${brandify(business.name || 'AUTOKLINIKA Sp. z o.o.')}</span><div class="footer-legal-links"><a href="./polityka-prywatnosci.html">Polityka prywatności</a><a href="./cookies.html">Cookies</a><a href="./informacje-prawne.html">Informacje prawne</a><button type="button" data-open-cookie-settings>Ustawienia cookies</button></div></div></div></footer>`;

const scrollToLinkedPriceCategory = () => {
  const rawHash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
  if (!rawHash || !rawHash.startsWith('price-')) return;
  const target = document.getElementById(rawHash);
  if (!target) return;
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
    target.classList.add('is-deep-link-target');
    target.focus({ preventScroll: true });
    window.setTimeout(() => target.classList.remove('is-deep-link-target'), 1800);
  });
};
scrollToLinkedPriceCategory();
window.addEventListener('hashchange', scrollToLinkedPriceCategory);

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const bookingForm = document.querySelector('[data-booking-form]');
const formSuccess = document.querySelector('[data-form-success]');
window.AKAvailability?.bind(bookingForm, cmsState.settings || {});
const syncHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
syncHeaderState();
window.addEventListener('scroll', syncHeaderState, { passive: true });
menuButton?.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); menu?.classList.toggle('is-open', !open); });
window.AKCMSClient.bindCaptcha(bookingForm);
bookingForm?.addEventListener('submit', async (event) => {
  event.preventDefault(); if (!bookingForm.reportValidity()) return;
  const submit = bookingForm.querySelector('button[type="submit"]');
  const error = bookingForm.querySelector('[data-form-error]');
  if (error) { error.hidden = true; error.textContent = ''; }
  if (formSuccess) formSuccess.hidden = true;
  if (submit) submit.disabled = true;
  const result = await window.AKCMSClient.submitLead('cennik', Object.fromEntries(new FormData(bookingForm).entries()));
  if (submit) submit.disabled = false;
  if (result?.ok) {
    if (formSuccess) formSuccess.hidden = false;
    bookingForm.querySelector('input[name="captchaAnswer"]').value = '';
    await window.AKCMSClient.refreshCaptcha(bookingForm);
    window.AKCMSClient.track('booking_submit', { page: 'cennik' });
  } else {
    if (error) { error.textContent = result?.error || 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.'; error.hidden = false; }
    if (result?.refreshCaptcha) await window.AKCMSClient.refreshCaptcha(bookingForm);
  }
});
window.AKCMSClient.bindTracking(document);
})();
