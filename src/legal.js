(async () => {
  const cmsResult = await (window.AKCMSClient?.getPublicState?.() || Promise.resolve({state:window.AKCMS_DEFAULTS}));
  const cmsState = cmsResult.state || window.AKCMS_DEFAULTS || {};
  const business = cmsState.business || {};
  const phoneDisplay = business.phoneDisplay || '505 104 110';
  const phoneHref = `tel:${business.phoneE164 || '+48505104110'}`;
  const facebookHref = business.facebook || 'https://www.facebook.com/autoklinikamk/?locale=pl_PL';
  const address = `${business.addressLine || 'Górzyn 125'}, ${business.postalCity || '68-300 Lubsko'}`;
  const icon = (name, size=18) => {
    const paths = {
      pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/>',
      clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
      phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.45 19.45 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.98.72 2.92a2 2 0 0 1-.45 2.11L8.1 10.03a16 16 0 0 0 5.87 5.87l1.28-1.28a2 2 0 0 1 2.11-.45c.94.35 1.92.59 2.92.72A2 2 0 0 1 22 16.92Z"/>',
      facebook:'<path d="M14.2 8.3V6.6c0-.8.5-1 1.1-1h2.8V2.1h-3.9c-3.5 0-4.8 2.1-4.8 4.7v1.5H7v3.9h2.4V22h4.8v-9.8h3.4l.5-3.9h-3.9Z" fill="currentColor" stroke="none"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`;
  };
  const logo = `<a class="brand brand-plate" href="./index.html" aria-label="AutoKlinika — strona główna"><img class="brand-logo-img" src="./assets/logo-autoklinika-dark.png" alt="AutoKlinika" /></a>`;
  const brandify = (value='') => String(value).replace(/AUTOKLINIKI|AUTOKLINIKA|AutoKlinika|Autoklinika/g, (word) => { const k=word.toLowerCase().indexOf('k'); return k>0 ? `<span class="brand-word"><span class="brand-letter">${word[0]}</span>${word.slice(1,k)}<span class="brand-letter">${word[k]}</span>${word.slice(k+1)}</span>` : word; });
  const headerHost = document.querySelector('#legal-header');
  const footerHost = document.querySelector('#legal-footer');
  if (headerHost) headerHost.innerHTML = `<header class="site-header" data-header><div class="nav-row"><div class="shell nav-inner">${logo}<button class="menu-toggle" aria-label="Otwórz menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button><nav class="main-nav" data-menu><a href="./index.html#services">Usługi</a><a href="./cennik.html">Cennik</a><a href="./index.html#process">Jak pracujemy</a><a href="./index.html#about">O nas</a><a href="./index.html#contact">Kontakt</a></nav><a class="header-social" href="${facebookHref}" target="_blank" rel="noopener noreferrer" aria-label="AutoKlinika na Facebooku">${icon('facebook',20)}<span class="sr-only">Facebook</span></a><a class="btn btn-primary header-phone phone-cta" href="${phoneHref}">${icon('phone',20)}<span>Zadzwoń ${phoneDisplay}</span></a></div></div></header>`;
  if (footerHost) footerHost.innerHTML = `<footer class="site-footer"><div class="shell footer-main"><div class="footer-brand">${logo}<p>Najpierw diagnoza. Potem naprawa.</p></div><div class="footer-col"><h3>Usługi</h3>${(cmsState.services||[]).filter(x=>x.active!==false).slice(0,6).map(x=>`<a href="./index.html#services">${x.title}</a>`).join('')}</div><div class="footer-col"><h3>Informacje</h3><a href="./cennik.html">Cennik</a><a href="./index.html#process">Jak pracujemy</a><a href="./index.html#about">O nas</a><a href="./index.html#contact">Kontakt</a></div><div class="footer-col footer-contact"><h3>Kontakt</h3><span>${icon('pin',18)} ${address}</span><a href="${phoneHref}">${icon('phone',18)} ${phoneDisplay}</a><span>${icon('clock',18)} ${business.hours || 'Pn–Pt 08:00–16:00'}</span></div></div><div class="footer-legal"><div class="shell"><span>© ${new Date().getFullYear()} ${brandify(business.name || 'AUTOKLINIKA Sp. z o.o.')}</span><div class="footer-legal-links"><a href="./polityka-prywatnosci.html">Polityka prywatności</a><a href="./cookies.html">Cookies</a><a href="./informacje-prawne.html">Informacje prawne</a><button type="button" data-open-cookie-settings>Ustawienia cookies</button></div></div></div></footer>`;

  // Aktualizuj wyłącznie dane przedsiębiorcy w dokumentach prawnych; same klauzule pozostają zablokowane w plikach źródłowych.
  const replacements = [
    ['AUTOKLINIKA SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ', business.name || 'AUTOKLINIKA Sp. z o.o.'],
    ['AUTOKLINIKA Sp. z o.o.', business.name || 'AUTOKLINIKA Sp. z o.o.'],
    ['Górzyn 125, 68-300 Górzyn', address],
    ['KRS 0001203806', `KRS ${business.krs || '0001203806'}`],
    ['NIP 9282118147', `NIP ${business.nip || '9282118147'}`],
    ['REGON 543174774', `REGON ${business.regon || '543174774'}`],
    ['505 104 110', phoneDisplay],
    ['autoklinikagorzyn@gmail.com', business.email || 'autoklinikagorzyn@gmail.com']
  ];
  const walker = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => { let txt=node.nodeValue; replacements.forEach(([a,b])=>txt=txt.split(a).join(b)); node.nodeValue=txt; });
  document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href=phoneHref;if(a.textContent.trim().match(/^\d[\d\s]+$/))a.textContent=phoneDisplay});
  document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{if(business.email){a.href=`mailto:${business.email}`;a.textContent=business.email}});

  document.querySelectorAll('[data-lead-retention]').forEach(el=>{ el.textContent=`${cmsState.settings?.leadRetentionDays || 365} dni`; });
  document.querySelectorAll('[data-analytics-retention]').forEach(el=>{ el.textContent=`${cmsState.settings?.analyticsRetentionDays || 180} dni`; });
  document.querySelectorAll('[data-own-analytics-status]').forEach(el=>{ el.textContent=cmsState.legal?.analyticsEnabled===false?'NIEAKTYWNA':'BEZ COOKIES'; });

  const legalMetaDate = document.querySelector('.legal-meta span:nth-child(2)');
  if (legalMetaDate) {
    const path=location.pathname;
    const date=path.includes('cookies')?cmsState.legal?.cookiesLastUpdated:cmsState.legal?.privacyLastUpdated;
    if(date) legalMetaDate.textContent=`Data obowiązywania: ${date}`;
  }

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  window.addEventListener('scroll', () => header?.classList.toggle('is-scrolled', window.scrollY > 60), { passive:true });
  menuButton?.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); menu?.classList.toggle('is-open', !open); });
  window.AKCMSClient?.bindTracking?.(document);
})();
