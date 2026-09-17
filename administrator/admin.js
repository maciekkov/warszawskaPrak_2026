(() => {
  const app = document.querySelector('#admin-app');
  const API = {
    async json(url, options = {}) {
      const res = await fetch(url, { credentials:'same-origin', cache:'no-store', headers:{'Content-Type':'application/json', ...(options.headers||{})}, ...options });
      let data = null; try { data = await res.json(); } catch (_) {}
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      return data;
    },
    session: () => API.json('/api/admin/session'),
    login: (login,password) => API.json('/api/login',{method:'POST',body:JSON.stringify({login,password})}),
    logout: () => API.json('/api/logout',{method:'POST',body:'{}'}),
    state: () => API.json('/api/admin/state'),
    save: (state) => API.json('/api/admin/draft',{method:'PUT',body:JSON.stringify({state})}),
    publish: (summary) => API.json('/api/admin/publish',{method:'POST',body:JSON.stringify({summary})}),
    leads: () => API.json('/api/admin/leads'),
    updateLead: (id,changes) => API.json(`/api/admin/leads/${id}`,{method:'PATCH',body:JSON.stringify(changes)}),
    analytics: (days) => API.json(`/api/admin/analytics?days=${days}`),
    revisions: () => API.json('/api/admin/revisions'),
    restore: (id) => API.json(`/api/admin/revisions/${id}/restore`,{method:'POST',body:'{}'}),
    media: () => API.json('/api/admin/media'),
    upload: (payload) => API.json('/api/admin/media',{method:'POST',body:JSON.stringify(payload)}),
    deleteMedia: (id) => API.json(`/api/admin/media/${id}`,{method:'DELETE'}),
    resetDraft: () => API.json('/api/admin/reset-draft',{method:'POST',body:'{}'}),
    googleConfig: () => API.json('/api/admin/google-config'),
    saveGoogleConfig: (payload) => API.json('/api/admin/google-config',{method:'POST',body:JSON.stringify(payload)})
  };

  let state = null;
  let serverMeta = { hasUnpublished:false, liveUpdatedAt:null, draftUpdatedAt:null };
  const requestedTab = new URLSearchParams(location.search).get('tab');
  let active = ['dashboard','pricing','home','media','faq','business','leads','analytics','seo','legal','history','settings'].includes(requestedTab) ? requestedTab : 'dashboard';
  let dirty = false;
  let leads = [];
  let media = [];
  let revisions = [];
  let analytics = null;
  let analyticsDays = 30;
  let googleConfig = {apiKeyConfigured:false,apiKeyMasked:'',status:{configured:false,available:false,reviews:[]}};

  const navItems = [
    ['dashboard','⌂','Pulpit'],['pricing','₿','Cennik'],['home','▤','Strona główna'],['media','▣','Galeria warsztatu'],
    ['faq','?','FAQ'],['business','⌖','Kontakt i firma'],['leads','✉','Zgłoszenia'],
    ['analytics','⌁','Analityka'],['seo','◎','SEO'],['legal','§','Prawo i cookies'],['history','↶','Historia zmian'],['settings','⚙','Ustawienia']
  ];

  const esc = (v='') => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const uid = (prefix='id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const fmtDate = (iso) => iso ? new Intl.DateTimeFormat('pl-PL',{dateStyle:'short',timeStyle:'short'}).format(new Date(iso)) : '—';
  const deepGet = (obj,path) => path.split('.').reduce((acc,key) => acc?.[key],obj);
  const deepSet = (obj,path,val) => {
    const parts=path.split('.'); let cur=obj;
    for(let i=0;i<parts.length-1;i++){ const k=parts[i]; cur=cur[k]; }
    cur[parts.at(-1)] = val;
  };
  const toast = (msg,type='good') => {
    let stack=document.querySelector('.toast-stack'); if(!stack){stack=document.createElement('div');stack.className='toast-stack';document.body.appendChild(stack)}
    const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;stack.appendChild(el);setTimeout(()=>el.remove(),3500);
  };
  const markDirty = () => { dirty=true; updateTopbar(); };
  const valueAttr = (v) => esc(v).replace(/\n/g,'&#10;');
  const adminSrc = (v='') => { const s=String(v||''); if (s.startsWith('./')) return '/'+s.slice(2); return s; };
  const field = (label,path,value,{type='text',wide=false,placeholder='',rows=3}={}) => `
    <div class="field ${wide?'wide':''}"><label>${esc(label)}</label>${type==='textarea'
      ? `<textarea class="input" rows="${rows}" data-bind="${path}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
      : `<input class="input" type="${type}" data-bind="${path}" value="${valueAttr(value)}" placeholder="${esc(placeholder)}" />`}</div>`;
  const checkbox = (label,path,checked) => `<label class="check"><input type="checkbox" data-bind="${path}" ${checked?'checked':''}/><span>${esc(label)}</span></label>`;
  const mediaSelect = (label,path,current,{wide=true}={}) => {
    const base=['./assets/real-owner.jpg','./assets/real-geometry.png','./assets/real-tires.png','./assets/real-office.png','./assets/real-front.png','./assets/real-workshop.jpeg'];
    const paths=[...new Set([current,...media.map(m=>m.public_path),...base].filter(Boolean))];
    return `<div class="field ${wide?'wide':''}"><label>${esc(label)}</label><select class="input" data-bind="${path}" data-rerender="true">${paths.map(p=>`<option value="${valueAttr(p)}" ${p===current?'selected':''}>${esc(p)}</option>`).join('')}</select></div>`;
  };

  async function init(){
    try {
      const s=await API.session();
      if(!s.authenticated){ renderLogin(); return; }
      await loadState();
      renderShell();
    } catch(err){ renderServerError(err); }
  }

  function renderServerError(err){
    app.innerHTML=`<div class="login-shell"><div class="login-card"><div class="login-brand"><img class="admin-brand-logo" src="/assets/logo-autoklinika-dark.png" alt="AutoKlinika"/><div><h1>CMS</h1><p>Panel administratora</p></div></div><div class="notice red"><strong>Panel nie może połączyć się z backendem.</strong><br><br>Na Hostingerze sprawdź, czy katalog <b>private</b> leży obok <b>public_html</b> i czy wgrano katalog <b>public/api</b>. Lokalnie uruchom projekt przez <b>npm run dev</b>.<br><br>${esc(err.message)}</div></div></div>`;
  }

  function renderLogin(){
    app.innerHTML=`<div class="login-shell"><form class="login-card" data-login><div class="login-brand"><img class="admin-brand-logo" src="/assets/logo-autoklinika-dark.png" alt="AutoKlinika"/><div><h1>CMS</h1><p>Panel administratora · /administrator</p></div></div><label>Login</label><input name="login" value="admin" autocomplete="username"/><label>Hasło</label><input name="password" value="" type="password" autocomplete="current-password"/><button class="btn btn-primary login-submit" type="submit">Zaloguj do panelu</button><div class="login-error" data-login-error></div><div class="login-note">Login to <b>admin</b>. Hasło produkcyjne znajduje się w prywatnym pliku <b>private/ADMIN_LOGIN.txt</b> utworzonym przez <code>npm run build</code>.</div></form></div>`;
    app.querySelector('[data-login]').addEventListener('submit',async(e)=>{
      e.preventDefault(); const fd=new FormData(e.currentTarget); const error=app.querySelector('[data-login-error]');
      try{await API.login(fd.get('login'),fd.get('password'));await loadState();renderShell();}catch(err){error.textContent=err.message}
    });
  }

  const ensureBookingAvailability = () => {
    state.settings ||= {};
    const defaults={enabled:true,horizonDays:75,limitedWindowDays:2,weekendsClosed:true,services:{diagnostics:{label:'Diagnostyka',leadDays:2},geometry:{label:'Geometria 3D',leadDays:3},climate:{label:'Klimatyzacja',leadDays:0},mechanic:{label:'Mechanika',leadDays:7},tires:{label:'Wulkanizacja',leadDays:2},oil:{label:'Serwis olejowy',leadDays:3}}};
    const current=state.settings.bookingAvailability||{};
    state.settings.bookingAvailability={...defaults,...current,services:{}};
    for(const [key,def] of Object.entries(defaults.services)) state.settings.bookingAvailability.services[key]={...def,...(current.services?.[key]||{})};
  };

  async function loadState(){
    const data=await API.state(); state=data.state; ensureBookingAvailability(); serverMeta=data; dirty=false;
    await Promise.all([loadLeads(),loadMedia(),loadRevisions(),loadAnalytics(analyticsDays)]);
  }
  async function loadLeads(){ try{leads=(await API.leads()).leads||[]}catch(_){leads=[]} }
  async function loadMedia(){ try{media=(await API.media()).media||[]}catch(_){media=[]} }
  async function loadRevisions(){ try{revisions=(await API.revisions()).revisions||[]}catch(_){revisions=[]} }
  async function loadAnalytics(days){ try{analytics=await API.analytics(days)}catch(_){analytics={totals:{},daily:[],pages:[],leadCount:0}} }
  async function loadGoogleConfig(){ try{googleConfig=await API.googleConfig()}catch(_){googleConfig={apiKeyConfigured:false,apiKeyMasked:'',status:{configured:false,available:false,reviews:[]}}} }

  function renderShell(){
    app.innerHTML=`<div class="admin-shell"><aside class="sidebar"><div class="side-brand"><img class="side-brand-logo" src="/assets/logo-autoklinika-dark.png" alt="AutoKlinika"/><div><span>CMS / ADMIN</span></div></div><nav class="nav">${navItems.map(([id,icon,label])=>`<button type="button" data-nav="${id}" class="${active===id?'active':''}"><span class="nav-icon">${icon}</span><span>${label}</span>${id==='leads'&&leads.filter(l=>l.status==='new').length?`<span class="nav-badge">${leads.filter(l=>l.status==='new').length}</span>`:''}</button>`).join('')}</nav><div class="side-footer"><div>Zalogowany: <strong>admin</strong></div><div style="margin-top:5px">PROD CMS · PRIVATE JSON</div></div></aside><main class="main"><header class="topbar"><div class="topbar-left"><h1 data-top-title></h1><span class="status-pill"><i class="status-dot"></i> LIVE</span><span class="draft-pill ${serverMeta.hasUnpublished||dirty?'':'hidden'}" data-draft-pill>${dirty?'NIEZAPISANE':serverMeta.hasUnpublished?'SZKIC':'SZKIC'}</span></div><div class="top-actions"><a class="btn btn-small btn-ghost" href="/index.html?cmsPreview=draft" target="_blank">Podgląd szkicu</a><a class="btn btn-small btn-ghost" href="/index.html" target="_blank">Zobacz LIVE</a><button class="btn btn-small" data-save>Zapisz szkic</button><button class="btn btn-small btn-primary" data-publish>Opublikuj</button><button class="btn btn-small btn-ghost" data-logout>Wyloguj</button></div></header><div class="content" data-content></div></main></div>`;
    bindShell(); renderActive();
  }
  function bindShell(){
    app.querySelectorAll('[data-nav]').forEach(btn=>btn.addEventListener('click',async()=>{active=btn.dataset.nav; if(active==='leads')await loadLeads();if(active==='analytics')await loadAnalytics(analyticsDays);if(active==='history')await loadRevisions();if(active==='media')await loadMedia();app.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===active));renderActive()}));
    app.querySelector('[data-save]').addEventListener('click',saveDraft);
    app.querySelector('[data-publish]').addEventListener('click',publish);
    app.querySelector('[data-logout]').addEventListener('click',async()=>{await API.logout();renderLogin()});
  }
  function updateTopbar(){ const p=app.querySelector('[data-draft-pill]'); if(p){p.classList.toggle('hidden',!(dirty||serverMeta.hasUnpublished));p.textContent=dirty?'NIEZAPISANE':'SZKIC'} }
  async function saveDraft(){
    try{const out=await API.save(state);dirty=false;serverMeta.hasUnpublished=true;serverMeta.draftUpdatedAt=out.draftUpdatedAt;updateTopbar();toast('Szkic zapisany. Zmiany nie są jeszcze publiczne.')}catch(err){toast(err.message,'bad')}
  }
  async function publish(){
    if(dirty){try{await API.save(state);dirty=false}catch(err){toast(err.message,'bad');return}}
    const summary=prompt('Krótko opisz publikowane zmiany:','Aktualizacja treści strony')||'Aktualizacja treści strony';
    try{const out=await API.publish(summary);serverMeta.hasUnpublished=false;serverMeta.liveUpdatedAt=out.publishedAt||serverMeta.liveUpdatedAt;await loadRevisions();updateTopbar();toast(out.changed?'Zmiany opublikowane na stronie LIVE.':'Brak zmian do publikacji.')}catch(err){toast(err.message,'bad')}
  }

  function renderActive(){
    const title=navItems.find(n=>n[0]===active)?.[2]||'Panel';app.querySelector('[data-top-title]').textContent=title;
    const c=app.querySelector('[data-content]');
    const renderers={dashboard:renderDashboard,pricing:renderPricing,home:renderHome,media:renderMedia,faq:renderFaq,business:renderBusiness,leads:renderLeads,analytics:renderAnalytics,seo:renderSeo,legal:renderLegal,history:renderHistory,settings:renderSettings};
    c.innerHTML=renderers[active](); bindContent();
  }

  function bindContent(){
    app.querySelectorAll('[data-bind]').forEach(el=>{
      const event=el.tagName==='INPUT'&&['text','number','url','email','tel','date'].includes(el.type)?'input':'change';
      el.addEventListener(event,()=>{let v=el.type==='checkbox'?el.checked:el.value;if(el.type==='number')v=Number(v);deepSet(state,el.dataset.bind,v);markDirty();if(el.dataset.rerender==='true')renderActive()});
    });
    app.querySelectorAll('[data-action]').forEach(el=>{
      const evt = el.tagName === 'SELECT' ? 'change' : (el.matches('input[type=range]') ? 'input' : 'click');
      el.addEventListener(evt,()=>handleAction(el.dataset.action,el));
    });
  }

  function renderDashboard(){
    const t=analytics?.totals||{};const page=t.page_view||0, phones=t.phone_click||0, forms=t.booking_submit||0, pricing=t.pricing_view||0;
    const recent=leads.slice(0,6);const dailyMap=new Map();(analytics?.daily||[]).forEach(x=>{if(!dailyMap.has(x.day))dailyMap.set(x.day,{});dailyMap.get(x.day)[x.event_type]=x.c});const entries=[...dailyMap.entries()].slice(-14);const max=Math.max(1,...entries.map(([,v])=>Math.max(v.page_view||0,v.phone_click||0)));
    return `<div class="section-head"><div><h2>Pulpit AutoKliniki</h2><p>Najważniejsze liczby, zgłoszenia i stan publikacji. Analityka jest pierwszostronna i zapisywana w prywatnych plikach JSON poza public_html.</p></div><div class="section-actions"><span class="tag ${serverMeta.hasUnpublished?'amber':'green'}">${serverMeta.hasUnpublished?'Są nieopublikowane zmiany':'LIVE zgodny ze szkicem'}</span></div></div>
    <div class="grid grid-4"><div class="card metric"><div class="metric-top">Odsłony <span>30D</span></div><strong>${page}</strong><small>page_view</small></div><div class="card metric"><div class="metric-top">Kliknięcia telefonu</div><strong class="metric-accent">${phones}</strong><small>${page?((phones/page)*100).toFixed(1):'0.0'}% odsłon</small></div><div class="card metric"><div class="metric-top">Formularze</div><strong>${forms}</strong><small>${leads.length} zgłoszeń w bazie</small></div><div class="card metric"><div class="metric-top">Cennik</div><strong>${pricing}</strong><small>wyświetlenia strony cennika</small></div></div>
    <div class="grid grid-2" style="margin-top:14px"><div class="card chart-card"><h3>Ruch i telefon — ostatnie dni</h3><div class="bar-chart">${entries.length?entries.map(([,v])=>`<div class="bar-day"><i class="bar" title="odsłony ${v.page_view||0}" style="height:${Math.max(2,(v.page_view||0)/max*100)}%"></i><i class="bar secondary" title="telefon ${v.phone_click||0}" style="height:${Math.max(2,(v.phone_click||0)/max*100)}%"></i></div>`).join(''):'<div class="empty" style="width:100%">Brak danych — odwiedź stronę, aby zarejestrować pierwsze eventy.</div>'}</div><div class="chart-legend"><span><i class="legend-dot"></i>odsłony</span><span><i class="legend-dot gray"></i>telefon</span></div></div>
    <div class="card card-pad"><h3>Stan CMS</h3><div class="integration"><div><strong>LIVE</strong><div class="muted">${fmtDate(serverMeta.liveUpdatedAt)}</div></div><span class="tag green">ONLINE</span></div><div class="integration"><div><strong>Szkic</strong><div class="muted">${fmtDate(serverMeta.draftUpdatedAt)}</div></div><span class="tag ${serverMeta.hasUnpublished?'amber':'green'}">${serverMeta.hasUnpublished?'DO PUBLIKACJI':'ZGODNY'}</span></div><div class="integration"><div><strong>Treść</strong><div class="muted">${state.services.length} usług · ${countPrices()} cen · ${state.faqs.length} FAQ</div></div><span class="tag">CMS</span></div></div></div>
    <div class="card card-pad" style="margin-top:14px"><div class="section-head" style="margin-bottom:10px"><div><h2 style="font-size:17px">Ostatnie zgłoszenia</h2></div><button class="btn btn-small" data-action="goto-leads">Wszystkie zgłoszenia</button></div>${recent.length?leadTable(recent):'<div class="empty">Brak zgłoszeń.</div>'}</div>
    <div class="grid grid-2" style="margin-top:14px"><div class="card card-pad"><h3>Lejek kontaktowy</h3><div class="integration"><span>Wejścia → telefon</span><strong>${page?((phones/page)*100).toFixed(1):'0.0'}%</strong></div><div class="integration"><span>Wejścia → formularz</span><strong>${page?((forms/page)*100).toFixed(1):'0.0'}%</strong></div><div class="integration"><span>Łączna konwersja</span><strong>${page?(((phones+forms)/page)*100).toFixed(1):'0.0'}%</strong></div></div><div class="card card-pad"><h3>Ostatnie publikacje</h3>${revisions.slice(0,5).map(r=>`<div class="integration"><div><strong>#${r.id} · ${esc(r.summary)}</strong><div class="muted">${fmtDate(r.created_at)}</div></div><span class="tag">${esc(r.author)}</span></div>`).join('')||'<div class="empty">Brak historii.</div>'}</div></div>`;
  }
  function countPrices(){return state.pricing.categories.reduce((n,c)=>n+(c.groups||[]).reduce((m,g)=>m+(g.rows||[]).length,0),0)}

  function renderPricing(){
    return `<div class="section-head"><div><h2>Cennik — jedno źródło prawdy</h2><p>Dodawaj, usuwaj i zmieniaj pozycje. Checkbox „Homepage” powoduje automatyczne użycie tej samej ceny w sekcji „Najczęstsze usługi. Jasne ceny.”</p></div><div class="section-actions"><button class="btn btn-small" data-action="add-category">+ Kategoria</button><a class="btn btn-small btn-ghost" href="/cennik.html?cmsPreview=draft" target="_blank">Podgląd cennika</a></div></div>
    <div class="notice" style="margin-bottom:14px">Pełna wulkanizacja/TPMS pozostaje widoczna na stronie bez rozwijania. Panel obsługuje zarówno proste kategorie, jak i grupy tabelowe.</div>
    ${state.pricing.categories.map((cat,ci)=>`<section class="card editor-card price-category-admin"><div class="editor-card-head"><h3>${esc(cat.title)}</h3><div class="row-actions"><button class="btn btn-small" title="Kategoria w górę" data-action="move-category-up" data-ci="${ci}" ${ci===0?'disabled':''}>↑</button><button class="btn btn-small" title="Kategoria w dół" data-action="move-category-down" data-ci="${ci}" ${ci===state.pricing.categories.length-1?'disabled':''}>↓</button><button class="btn btn-small" data-action="add-group" data-ci="${ci}">+ Grupa</button><button class="btn btn-small btn-danger" data-action="delete-category" data-ci="${ci}">Usuń kategorię</button></div></div><div class="editor-card-body"><div class="form-grid"><div class="field wide"><label>Nazwa kategorii</label><input class="input" data-bind="pricing.categories.${ci}.title" value="${valueAttr(cat.title)}"/></div></div>${(cat.groups||[]).map((g,gi)=>renderPriceGroup(g,ci,gi)).join('')}</div></section>`).join('')}`;
  }
  function renderPriceGroup(g,ci,gi){return `<div class="price-group-admin"><div class="price-group-title"><input class="input" data-bind="pricing.categories.${ci}.groups.${gi}.title" value="${valueAttr(g.title||'')}" placeholder="Tytuł grupy (opcjonalny)"/><input class="input" style="max-width:150px" data-bind="pricing.categories.${ci}.groups.${gi}.leftLabel" value="${valueAttr(g.leftLabel||'USŁUGA')}"/><button class="btn btn-small" title="Grupa w górę" data-action="move-group-up" data-ci="${ci}" data-gi="${gi}" ${gi===0?'disabled':''}>↑</button><button class="btn btn-small" title="Grupa w dół" data-action="move-group-down" data-ci="${ci}" data-gi="${gi}" ${gi===state.pricing.categories[ci].groups.length-1?'disabled':''}>↓</button><button class="btn btn-small" data-action="add-price" data-ci="${ci}" data-gi="${gi}">+ Pozycja</button><button class="btn btn-small btn-danger" data-action="delete-group" data-ci="${ci}" data-gi="${gi}">×</button></div><div class="price-row-admin price-row-head"><span>Kolejność</span><span>Usługa</span><span>Cena</span><span>Uwaga</span><span>Homepage</span><span>Akcje</span></div>${(g.rows||[]).map((r,ri)=>`<div class="price-row-admin"><div class="row-actions"><button class="btn btn-small" title="Przesuń w górę" data-action="move-price-up" data-ci="${ci}" data-gi="${gi}" data-ri="${ri}" ${ri===0?'disabled':''}>↑</button><button class="btn btn-small" title="Przesuń w dół" data-action="move-price-down" data-ci="${ci}" data-gi="${gi}" data-ri="${ri}" ${ri===g.rows.length-1?'disabled':''}>↓</button></div><input class="input" data-bind="pricing.categories.${ci}.groups.${gi}.rows.${ri}.name" value="${valueAttr(r.name)}"/><input class="input" data-bind="pricing.categories.${ci}.groups.${gi}.rows.${ri}.price" value="${valueAttr(r.price)}"/><input class="input" data-bind="pricing.categories.${ci}.groups.${gi}.rows.${ri}.note" value="${valueAttr(r.note||'')}" placeholder="Uwaga / materiał"/><label class="featured" title="Pokaż na homepage"><input type="checkbox" data-bind="pricing.categories.${ci}.groups.${gi}.rows.${ri}.featured" ${r.featured?'checked':''}/></label><div class="row-actions"><button class="btn btn-small btn-danger" data-action="delete-price" data-ci="${ci}" data-gi="${gi}" data-ri="${ri}">Usuń</button></div></div>`).join('')}</div>`}

  function renderServices(){
    return `<div class="section-head"><div><h2>Usługi</h2><p>Treść, grafika i punkt kadrowania sześciu głównych kart. Układ strony pozostaje zablokowany — administrator zmienia dane, a nie geometrię.</p></div><button class="btn btn-small" data-action="add-service">+ Dodaj usługę</button></div><div class="grid grid-2">${state.services.map((s,i)=>{const [x,y]=parsePosition(s.position||'50% 50%');return `<article class="card editor-card"><div class="editor-card-head"><h3>${esc(s.title)}</h3><div>${checkbox('Aktywna',`services.${i}.active`,s.active!==false)}</div></div><div class="editor-card-body"><div class="gallery-card" style="grid-template-columns:190px 1fr"><div class="gallery-preview" style="height:190px"><img src="${esc(adminSrc(s.image))}" alt="${esc(s.alt||s.title)}" style="object-position:${x}% ${y}%"/></div><div><div class="form-grid">${field('Nazwa',`services.${i}.title`,s.title)}${field('Kolejność',`services.${i}.order`,s.order,{type:'number'})}${field('Problem / lead',`services.${i}.lead`,s.lead,{wide:true})}${field('Opis',`services.${i}.body`,s.body,{type:'textarea',wide:true})}${field('Ścieżka zdjęcia',`services.${i}.image`,s.image,{wide:true})}${mediaSelect('Wybierz zdjęcie z biblioteki',`services.${i}.image`,s.image)}${field('ALT zdjęcia',`services.${i}.alt`,s.alt||s.title,{wide:true})}${field('Ścieżka ikony',`services.${i}.iconImage`,s.iconImage,{wide:true})}${mediaSelect('Wybierz ikonę / grafikę z biblioteki',`services.${i}.iconImage`,s.iconImage)}</div><div class="range-line"><span>X</span><input type="range" min="0" max="100" value="${x}" data-action="service-pos" data-axis="x" data-si="${i}"/><b>${x}%</b></div><div class="range-line"><span>Y</span><input type="range" min="0" max="100" value="${y}" data-action="service-pos" data-axis="y" data-si="${i}"/><b>${y}%</b></div></div></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-small btn-danger" data-action="delete-service" data-si="${i}">Usuń usługę</button><a class="btn btn-small btn-ghost" href="/index.html?cmsPreview=draft#services" target="_blank">Podgląd</a></div></div></article>`}).join('')}</div>`;
  }

  function renderHome(){
    const h=state.home;
    return `<div class="section-head"><div><h2>Strona główna — podstawowe treści</h2><p>Panel celowo jest prosty. Zmieniasz tylko najważniejsze teksty strony. Zdjęcia galerii są w osobnej zakładce, a układ, ikony i grafiki usług pozostają częścią projektu.</p></div></div>
    <div class="notice" style="margin-bottom:14px">Nie ma tu sterowania detalami layoutu, ikonami, zdjęciami usług ani sekcją standardu. Te elementy są zamrożone, żeby przypadkowo nie rozjechać strony.</div>
    <section class="card editor-card"><div class="editor-card-head"><h3>Hero</h3></div><div class="editor-card-body"><div class="form-grid">${field('Nagłówek — linia 1','home.hero.titleLine1',h.hero.titleLine1)}${field('Nagłówek — linia 2','home.hero.titleLine2',h.hero.titleLine2)}${field('Opis','home.hero.lead',h.hero.lead,{type:'textarea',wide:true})}</div></div></section>
    <section class="card editor-card" style="margin-top:14px"><div class="editor-card-head"><h3>Standard AutoKliniki</h3></div><div class="editor-card-body"><div class="form-grid">${field('Nagłówek','home.standard.title',h.standard.title,{wide:true})}${field('Opis','home.standard.lead',h.standard.lead,{type:'textarea',wide:true})}</div><div class="inline-note">Zdjęcie samochodu na podnośniku oraz trzy kroki standardu są stałym elementem projektu.</div></div></section>
    <section class="card editor-card" style="margin-top:14px"><div class="editor-card-head"><h3>O nas</h3></div><div class="editor-card-body"><div class="form-grid">${field('Nagłówek','home.about.title',h.about.title,{wide:true})}${field('Opis','home.about.lead',h.about.lead,{type:'textarea',wide:true})}</div></div></section>`;
  }
  function parsePosition(pos){const m=String(pos||'50% 50%').match(/([\d.]+)%\s+([\d.]+)%/);return [Number(m?.[1]||50),Number(m?.[2]||50)]}
  function galleryEditor(g,i){
    const [x,y]=parsePosition(g.position); const label=g.title||`Zdjęcie ${i+1}`; const gallery=state.home.about.gallery||[];
    return `<article class="gallery-card gallery-card-simple"><div class="gallery-preview"><img src="${esc(adminSrc(g.image))}" style="object-position:${x}% ${y}%"/></div><div><div class="gallery-fixed-title"><strong>${esc(label)}</strong><span>${esc(g.id==='owner'?'Karta Michała zachowuje dodatkowy profil po kliknięciu.':'Ten podpis jest wyświetlany pod zdjęciem w karuzeli.')}</span></div>${field('Podpis pod zdjęciem',`home.about.gallery.${i}.title`,label,{wide:true})}${mediaSelect('Zdjęcie',`home.about.gallery.${i}.image`,g.image)}<div class="range-line range-line-large"><span>Kadr X</span><input type="range" min="0" max="100" value="${x}" data-action="gallery-pos" data-axis="x" data-gi="${i}"/><b>${x}%</b></div><div class="range-line range-line-large"><span>Kadr Y</span><input type="range" min="0" max="100" value="${y}" data-action="gallery-pos" data-axis="y" data-gi="${i}"/><b>${y}%</b></div><div class="row-actions" style="margin-top:12px"><button class="btn btn-small" title="Przesuń w lewo" data-action="move-gallery-left" data-gi="${i}" ${i===0?'disabled':''}>←</button><button class="btn btn-small" title="Przesuń w prawo" data-action="move-gallery-right" data-gi="${i}" ${i===gallery.length-1?'disabled':''}>→</button>${g.id==='owner'?'<span class="tag">Michał / profil</span>':`<button class="btn btn-small btn-danger" data-action="delete-gallery-item" data-gi="${i}">Usuń</button>`}</div></div></article>`;
  }

  function renderMedia(){
    const gallery=state.home.about.gallery||[];
    return `<div class="section-head"><div><h2>Galeria warsztatu</h2><p>To jedyne miejsce do zarządzania zdjęciami sekcji „Nasz zespół i warsztat”. Galeria na stronie działa jako karuzela i może mieć dowolną liczbę zdjęć.</p></div><div class="section-actions"><button class="btn btn-small" data-action="add-gallery-item">+ Dodaj slajd</button></div></div><div class="notice" style="margin-bottom:14px">Wgranie zdjęcia poniżej automatycznie dodaje je jako nowy slajd karuzeli. Możesz zmienić podpis, kadr i kolejność.</div><div class="upload-zone"><input id="media-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple/><label for="media-upload"><strong>+ Wgraj i dodaj zdjęcia do karuzeli</strong><div class="muted" style="margin-top:6px">PNG / JPG / WEBP · maks. 1800 px · każdy plik tworzy nową kartę galerii</div></label></div><div class="gallery-admin gallery-admin-simple" style="margin-top:18px">${gallery.map((g,i)=>galleryEditor(g,i)).join('')}</div>${media.length?`<div class="card card-pad" style="margin-top:18px"><h3>Wgrane pliki</h3><div class="media-grid">${media.map(m=>mediaItem(m.public_path,m.title,`${Math.round(m.bytes/1024)} KB`,m.id)).join('')}</div></div>`:''}`;
  }
  function mediaItem(path,title,meta,id=null){return `<article class="media-item"><div class="media-thumb"><img src="${esc(adminSrc(path))}" loading="lazy"/></div><div class="media-meta"><strong title="${esc(title)}">${esc(title)}</strong><span>${esc(meta)}</span><div class="media-actions"><button class="btn btn-small" data-action="copy-path" data-path="${esc(path)}">Kopiuj ścieżkę</button>${id?`<button class="btn btn-small btn-danger" data-action="delete-media" data-id="${id}">Usuń</button>`:''}</div></div></article>`}
  function collectImagePaths(){return (state.home.about.gallery||[]).map(x=>x.image).filter(Boolean)}

  function renderReviews(){
    const b=state.business;
    return `<div class="section-head"><div><h2>Opinie Google</h2><p>Na stronie używamy ręcznie opracowanych, autentycznych opinii klientów z publicznego profilu Google Maps. Nie ma klucza API ani zewnętrznej integracji.</p></div></div>
    <div class="grid grid-2">
      <div class="card card-pad"><h3>Tryb statyczny</h3><div class="integration"><div><strong>Źródło</strong><div class="muted">Google Maps · AutoKlinika Górzyn</div></div><span class="tag green">AKTYWNE</span></div><div class="integration"><div><strong>Ocena wizytówki</strong><div class="muted">5,0 / 5 · 28 opinii</div></div><span class="tag green">PUBLICZNE</span></div><div class="notice blue" style="margin-top:14px">Pięć kart opinii jest zapisanych bezpośrednio w kodzie strony. Dzięki temu sekcja nie zależy od Google API i nie może zniknąć przez brak klucza.</div></div>
      <div class="card card-pad"><h3>Profil firmy</h3><div class="form-grid">${field('Zapytanie / link do profilu','business.googleReviewsQuery',b.googleReviewsQuery||'',{wide:true})}</div><a class="btn btn-small" style="margin-top:14px" href="https://www.google.com/search?q=${encodeURIComponent(b.googleReviewsQuery||`${b.brand||'AutoKlinika'} Górzyn opinie`)}" target="_blank" rel="noopener">Otwórz opinie w Google</a></div>
    </div>`;
  }
  function renderFaq(){return `<div class="section-head"><div><h2>FAQ</h2><p>Pytania są automatycznie sortowane według pola „kolejność”.</p></div><button class="btn btn-small" data-action="add-faq">+ Dodaj pytanie</button></div><div class="grid">${state.faqs.map((f,i)=>`<article class="card card-pad"><div class="form-grid">${field('Pytanie',`faqs.${i}.q`,f.q,{wide:true})}${field('Odpowiedź',`faqs.${i}.a`,f.a,{type:'textarea',wide:true})}${field('Kolejność',`faqs.${i}.order`,f.order,{type:'number'})}<div class="field">${checkbox('Aktywne',`faqs.${i}.active`,f.active!==false)}</div></div><button class="btn btn-small btn-danger" data-action="delete-faq" data-fi="${i}">Usuń</button></article>`).join('')}</div>`}
  function renderBusinessSchedule(b){
    const defaults={monday:['Poniedziałek','08:00','16:00',false],tuesday:['Wtorek','08:00','16:00',false],wednesday:['Środa','08:00','16:00',false],thursday:['Czwartek','08:00','16:00',false],friday:['Piątek','08:00','16:00',false],saturday:['Sobota','','',true],sunday:['Niedziela','','',true]};
    b.weeklySchedule ||= Object.fromEntries(Object.entries(defaults).map(([k,[label,open,close,closed]])=>[k,{label,open,close,closed}]));
    return `<div class="schedule-editor">${Object.entries(defaults).map(([key,[label,open,close,closed]])=>{const x=b.weeklySchedule[key]||{label,open,close,closed};return `<div class="schedule-row"><strong>${label}</strong><label>Od<input class="input" type="time" data-bind="business.weeklySchedule.${key}.open" value="${valueAttr(x.open||'')}" ${x.closed?'disabled':''}/></label><label>Do<input class="input" type="time" data-bind="business.weeklySchedule.${key}.close" value="${valueAttr(x.close||'')}" ${x.closed?'disabled':''}/></label><label class="check"><input type="checkbox" data-bind="business.weeklySchedule.${key}.closed" data-rerender="true" ${x.closed?'checked':''}/><span>Zamknięte</span></label></div>`}).join('')}</div>`;
  }
  function renderBusiness(){const b=state.business;return `<div class="section-head"><div><h2>Kontakt i dane firmy</h2><p>To centralne dane. Numer telefonu, adres i godziny są używane w hero, kontakcie, footerze, cenniku oraz statusie „Otwarte / Zamknięte”.</p></div></div><div class="card card-pad"><div class="form-grid cols-3">${field('Nazwa prawna','business.name',b.name,{wide:true})}${field('Marka','business.brand',b.brand)}${field('Telefon — prezentacja','business.phoneDisplay',b.phoneDisplay)}${field('Telefon E.164','business.phoneE164',b.phoneE164)}${field('E-mail','business.email',b.email,{type:'email'})}${field('Adres','business.addressLine',b.addressLine)}${field('Kod / miejscowość','business.postalCity',b.postalCity)}${field('Skrót godzin (tekst na stronie)','business.hours',b.hours)}${field('Facebook','business.facebook',b.facebook,{type:'url',wide:true})}${field('Zapytanie Google Maps','business.googleMapsQuery',b.googleMapsQuery,{wide:true})}${field('NIP','business.nip',b.nip)}${field('REGON','business.regon',b.regon)}${field('KRS','business.krs',b.krs)}</div><h3 style="margin:22px 0 8px">Godziny tygodniowe — status otwarte / zamknięte</h3><p class="inline-note">Ta tabela steruje statusem „Otwarte teraz / Zamknięte teraz” w czasie polskim (Europe/Warsaw). Wartości powinny odpowiadać godzinom publikowanym w profilu Google.</p>${renderBusinessSchedule(b)}</div>`}

  function renderLeads(){return `<div class="section-head"><div><h2>Zgłoszenia klientów</h2><p>Lekki CRM formularza: nowe → kontakt wykonany → umówiony → zamknięty. Dane formularza są oddzielone od analityki.</p></div><button class="btn btn-small" data-action="refresh-leads">Odśwież</button></div>${leads.length?leadTable(leads):'<div class="empty card">Brak zgłoszeń.</div>'}`}
  function leadTable(items){return `<div class="table-wrap"><table class="data-table lead-table"><thead><tr><th>Data</th><th>Klient</th><th>Telefon</th><th>Auto</th><th>Temat</th><th>Preferowany dzień</th><th>Źródło</th><th>Status</th><th>Notatka</th></tr></thead><tbody>${items.map(l=>`<tr><td>${fmtDate(l.created_at)}</td><td>${esc(l.payload.name||'—')}</td><td><a class="lead-phone" href="tel:${esc(l.payload.phone||'')}">${esc(l.payload.phone||'—')}</a></td><td>${esc(l.payload.car||'—')}</td><td><strong>${esc(l.payload.topic||l.payload.subject||'—')}</strong><div class="muted lead-message">${esc(l.payload.message||'')}</div></td><td>${esc(l.payload.date||'—')}</td><td>${esc(l.source)}</td><td><select class="input" data-action="lead-status" data-id="${l.id}" style="min-width:130px">${[['new','Nowe'],['contacted','Kontakt wykonany'],['booked','Umówiony'],['closed','Zamknięty'],['spam','Spam']].map(([v,n])=>`<option value="${v}" ${l.status===v?'selected':''}>${n}</option>`).join('')}</select></td><td><div class="lead-note-editor"><textarea class="input" rows="2" data-lead-note="${l.id}" placeholder="Notatka wewnętrzna">${esc(l.note||'')}</textarea><button class="btn btn-small" data-action="save-lead-note" data-id="${l.id}">Zapisz</button></div></td></tr>`).join('')}</tbody></table></div>`}

  function renderAnalytics(){const t=analytics?.totals||{};const entries=Object.entries(t).sort((a,b)=>b[1]-a[1]);const dailyMap=new Map();(analytics?.daily||[]).forEach(x=>{if(!dailyMap.has(x.day))dailyMap.set(x.day,{});dailyMap.get(x.day)[x.event_type]=x.c});const days=[...dailyMap.entries()];const max=Math.max(1,...days.map(([,v])=>v.page_view||0));return `<div class="section-head"><div><h2>Analityka ręczna</h2><p>Eventy są zapisywane przez własny backend PHP do prywatnych plików JSON: odsłony, telefon, formularz, cennik, trasa i Facebook. Nie zapisujemy surowego adresu IP ani identyfikatora użytkownika przy eventach.</p></div><select class="input" style="width:150px" data-action="analytics-days"><option value="7" ${analyticsDays===7?'selected':''}>7 dni</option><option value="30" ${analyticsDays===30?'selected':''}>30 dni</option><option value="90" ${analyticsDays===90?'selected':''}>90 dni</option></select></div><div class="grid grid-4">${[['Odsłony',t.page_view||0],['Telefon',t.phone_click||0],['Formularze',t.booking_submit||0],['Trasa',t.directions_click||0]].map(([n,v])=>`<div class="card metric"><div class="metric-top">${n}</div><strong>${v}</strong></div>`).join('')}</div><div class="grid grid-2" style="margin-top:14px"><div class="card chart-card"><h3>Odsłony dziennie</h3><div class="bar-chart">${days.map(([,v])=>`<div class="bar-day"><i class="bar" style="height:${Math.max(2,(v.page_view||0)/max*100)}%"></i></div>`).join('')||'<div class="empty" style="width:100%">Brak danych</div>'}</div></div><div class="card card-pad"><h3>Eventy</h3>${entries.map(([k,v])=>`<div class="integration"><span>${esc(k)}</span><strong>${v}</strong></div>`).join('')||'<div class="empty">Brak eventów</div>'}</div></div><div class="grid grid-3" style="margin-top:14px"><div class="card card-pad"><h3>Źródła ruchu</h3>${(analytics?.sources||[]).map(p=>`<div class="integration"><span>${esc(p.source)}</span><strong>${p.c}</strong></div>`).join('')||'<div class="empty">Brak danych</div>'}</div><div class="card card-pad"><h3>Urządzenia</h3>${(analytics?.devices||[]).map(p=>`<div class="integration"><span>${esc(p.device)}</span><strong>${p.c}</strong></div>`).join('')||'<div class="empty">Brak danych</div>'}</div><div class="card card-pad"><h3>Kampanie UTM</h3>${(analytics?.campaigns||[]).map(p=>`<div class="integration"><span>${esc(p.campaign)}</span><strong>${p.c}</strong></div>`).join('')||'<div class="empty">Brak danych</div>'}</div></div><div class="card card-pad" style="margin-top:14px"><h3>Najczęściej oglądane strony</h3>${(analytics?.pages||[]).map(p=>`<div class="integration"><span>${esc(p.page)}</span><strong>${p.c}</strong></div>`).join('')||'<div class="empty">Brak danych</div>'}</div>`}

  function renderSeo(){return `<div class="section-head"><div><h2>SEO</h2><p>Meta dane, OpenGraph, canonical i kontrola indeksowania. Zmiany nie wpływają na geometrię strony.</p></div></div><div class="grid grid-2">${[['home','Strona główna'],['pricing','Cennik']].map(([key,label])=>`<div class="card card-pad"><h3>${label}</h3><div class="form-grid">${field('Title',`seo.${key}.title`,state.seo[key].title,{wide:true})}${field('Description',`seo.${key}.description`,state.seo[key].description,{type:'textarea',wide:true})}${field('OG title',`seo.${key}.ogTitle`,state.seo[key].ogTitle||state.seo[key].title,{wide:true})}${field('OG description',`seo.${key}.ogDescription`,state.seo[key].ogDescription||state.seo[key].description,{type:'textarea',wide:true})}${field('OG image',`seo.${key}.ogImage`,state.seo[key].ogImage,{wide:true})}${field('Canonical',`seo.${key}.canonical`,state.seo[key].canonical||'',{type:'url',wide:true})}<div class="field wide">${checkbox('Indeksuj stronę',`seo.${key}.index`,state.seo[key].index!==false)}</div></div></div>`).join('')}</div>`}
  function renderLegal(){const l=state.legal;return `<div class="section-head"><div><h2>Prawo i cookies</h2><p>Panel pokazuje stan integracji i daty dokumentów. Treści prawne pozostają osobnymi dokumentami, żeby nie mieszać edycji marketingowej z obowiązkami prawnymi.</p></div></div><div class="notice red" style="margin-bottom:14px">Po dodaniu zewnętrznej analityki, piksela reklamowego, SMTP/CRM lub zmianie hostingu należy ponownie sprawdzić dokumenty prawne i faktycznych odbiorców danych.</div><div class="grid grid-2"><div class="card card-pad"><h3>Aktywne integracje</h3><div class="integration"><div><strong>Google Maps</strong><div class="muted">osadzona mapa ładowana dopiero po zgodzie</div></div><label class="switch"><input type="checkbox" data-bind="legal.mapsEnabled" ${l.mapsEnabled?'checked':''}/><span></span></label></div><div class="integration"><div><strong>Analityka własna</strong><div class="muted">private JSON · bez cookies i identyfikatora użytkownika</div></div><label class="switch"><input type="checkbox" data-bind="legal.analyticsEnabled" ${l.analyticsEnabled?'checked':''}/><span></span></label></div><div class="integration"><div><strong>Marketing pixels</strong><div class="muted">brak integracji w kodzie</div></div><span class="tag ${l.marketingEnabled?'amber':''}">${l.marketingEnabled?'DO WERYFIKACJI':'OFF'}</span></div></div><div class="card card-pad"><h3>Dokumenty</h3><div class="form-grid">${field('Polityka prywatności — data','legal.privacyLastUpdated',l.privacyLastUpdated)}${field('Cookies — data','legal.cookiesLastUpdated',l.cookiesLastUpdated)}${field('Informacje prawne — data','legal.legalLastUpdated',l.legalLastUpdated)}${field('Notatka operacyjna','legal.note',l.note,{type:'textarea',wide:true})}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn btn-small" target="_blank" href="/polityka-prywatnosci.html">Polityka prywatności</a><a class="btn btn-small" target="_blank" href="/cookies.html">Cookies</a><a class="btn btn-small" target="_blank" href="/informacje-prawne.html">Informacje prawne</a></div></div></div>`}
  function renderHistory(){return `<div class="section-head"><div><h2>Historia zmian</h2><p>Każda publikacja zapisuje pełny snapshot. Przywrócenie wersji ładuje ją do szkicu — nic nie trafia na LIVE bez ponownego „Opublikuj”.</p></div><button class="btn btn-small" data-action="refresh-history">Odśwież</button></div><div class="card">${revisions.length?revisions.map(r=>`<div class="revision"><strong>#${r.id}</strong><span class="muted">${fmtDate(r.created_at)}</span><div><strong>${esc(r.summary)}</strong><div class="muted">${esc(r.author)}</div></div><button class="btn btn-small" data-action="restore-revision" data-id="${r.id}">Przywróć do szkicu</button></div>`).join(''):'<div class="empty">Brak historii.</div>'}</div>`}
  function renderSettings(){
    ensureBookingAvailability();
    const a=state.settings.bookingAvailability;
    return `<div class="section-head"><div><h2>Ustawienia</h2><p>Narzędzia serwisowe CMS: backup, import, reset szkicu i konfiguracja formularza.</p></div></div>
    <div class="grid grid-2">
      <div class="card card-pad"><h3>Dostępność formularza</h3><p class="inline-note">Ustaw minimalne wyprzedzenie dla każdej usługi. Kalendarz pokazuje orientacyjne okno przyjęcia — nie udaje kalendarza realnych rezerwacji. Termin nadal potwierdzacie telefonicznie.</p>
        <div class="form-grid">
          ${field('Diagnostyka — dni','settings.bookingAvailability.services.diagnostics.leadDays',a.services.diagnostics.leadDays,{type:'number'})}
          ${field('Geometria 3D — dni','settings.bookingAvailability.services.geometry.leadDays',a.services.geometry.leadDays,{type:'number'})}
          ${field('Klimatyzacja — dni','settings.bookingAvailability.services.climate.leadDays',a.services.climate.leadDays,{type:'number'})}
          ${field('Mechanika — dni','settings.bookingAvailability.services.mechanic.leadDays',a.services.mechanic.leadDays,{type:'number'})}
          ${field('Wulkanizacja — dni','settings.bookingAvailability.services.tires.leadDays',a.services.tires.leadDays,{type:'number'})}
          ${field('Serwis olejowy — dni','settings.bookingAvailability.services.oil.leadDays',a.services.oil.leadDays,{type:'number'})}
          ${field('Najbliższe dni oznaczone żółto','settings.bookingAvailability.limitedWindowDays',a.limitedWindowDays,{type:'number'})}
          ${field('Horyzont kalendarza — dni','settings.bookingAvailability.horizonDays',a.horizonDays,{type:'number'})}
        </div>
        <div style="margin-top:12px;display:grid;gap:8px">${checkbox('Soboty i niedziele niedostępne w formularzu','settings.bookingAvailability.weekendsClosed',a.weekendsClosed)}${checkbox('Włącz inteligentny kalendarz','settings.bookingAvailability.enabled',a.enabled)}</div>
        <div class="notice" style="margin-top:12px">Kolory: <b>czerwony</b> = za małe wyprzedzenie, <b>żółty</b> = najbliższe terminy do potwierdzenia, <b>zielony</b> = dalszy preferowany dzień. To nie są dane o rzeczywistym obłożeniu warsztatu.</div>
      </div>
      <div class="card card-pad"><h3>Backup konfiguracji</h3><p class="inline-note">Eksport zawiera treść, ceny, FAQ, ustawienia i ścieżki mediów. Same pliki z folderu uploads/ należy archiwizować razem z paczką.</p><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn btn-small" data-action="export-json">Eksport JSON</button><label class="btn btn-small" for="import-json">Import JSON</label><input id="import-json" type="file" accept="application/json" class="hidden"/></div></div>
      <div class="card card-pad"><h3>Reset szkicu</h3><div class="notice red">Reset dotyczy tylko szkicu. Opublikowana strona LIVE nie zmieni się, dopóki nie klikniesz „Opublikuj”.</div><button class="btn btn-small btn-danger" style="margin-top:12px" data-action="reset-draft">Przywróć wartości domyślne</button></div>
      <div class="card card-pad"><h3>Retencja danych</h3><div class="form-grid">${field('Zgłoszenia — dni','settings.leadRetentionDays',state.settings.leadRetentionDays,{type:'number'})}${field('Analityka — dni','settings.analyticsRetentionDays',state.settings.analyticsRetentionDays,{type:'number'})}</div><p class="inline-note" style="margin-bottom:0">Serwer używa opublikowanych wartości LIVE. Zakres techniczny: 7–3650 dni.</p></div>
      <div class="card card-pad"><h3>Bezpieczeństwo</h3><div class="notice">Produkcja używa losowego hasła administratora generowanego poza katalogiem publicznym. Dane CMS, zgłoszenia i logi są przechowywane w <b>private/runtime</b> poza <b>public_html</b>. Backend ogranicza próby logowania i formularze.</div></div>
      <div class="card card-pad"><h3>Publikacja</h3><div class="integration"><span>Ostatni LIVE</span><strong>${fmtDate(serverMeta.liveUpdatedAt)}</strong></div><div class="integration"><span>Ostatni szkic</span><strong>${fmtDate(serverMeta.draftUpdatedAt)}</strong></div></div>
    </div>`;
  }

  async function handleAction(action,el){
    const num=(name)=>Number(el.dataset[name]);
    switch(action){
      case 'goto-leads':active='leads';app.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===active));renderActive();break;
      case 'save-google-key':{const input=app.querySelector('#google-api-key-input');const apiKey=String(input?.value||'').trim();if(!apiKey){toast('Wklej klucz Google Places API.','bad');break}try{googleConfig=await API.saveGoogleConfig({apiKey});toast(googleConfig?.status?.available?'Google połączone — opinie są dostępne.':'Klucz zapisany. Sprawdź status profilu.');renderActive()}catch(err){toast(err.message,'bad')}break}
      case 'clear-google-key':if(confirm('Usunąć zapisany lokalnie klucz Google Places API?')){try{googleConfig=await API.saveGoogleConfig({clearApiKey:true});toast('Klucz Google został usunięty.');renderActive()}catch(err){toast(err.message,'bad')}}break;
      case 'google-refresh-status':try{await loadGoogleConfig();renderActive();toast(googleConfig?.status?.available?'Połączenie z Google działa.':'Brak aktywnych danych z Google.','good')}catch(err){toast(err.message,'bad')}break;
      case 'add-category':state.pricing.categories.push({id:uid('cat'),title:'NOWA KATEGORIA',groups:[{id:uid('group'),title:'',leftLabel:'USŁUGA',rows:[]}]});markDirty();renderActive();break;
      case 'move-category-up':{const i=num('ci');if(i>0){const a=state.pricing.categories;[a[i-1],a[i]]=[a[i],a[i-1]];markDirty();renderActive()}break}
      case 'move-category-down':{const i=num('ci'),a=state.pricing.categories;if(i<a.length-1){[a[i+1],a[i]]=[a[i],a[i+1]];markDirty();renderActive()}break}
      case 'delete-category':if(confirm('Usunąć całą kategorię i jej ceny?')){state.pricing.categories.splice(num('ci'),1);markDirty();renderActive()}break;
      case 'add-group':state.pricing.categories[num('ci')].groups.push({id:uid('group'),title:'Nowa grupa',leftLabel:'Pozycja',rows:[]});markDirty();renderActive();break;
      case 'move-group-up':{const ci=num('ci'),i=num('gi'),a=state.pricing.categories[ci].groups;if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];markDirty();renderActive()}break}
      case 'move-group-down':{const ci=num('ci'),i=num('gi'),a=state.pricing.categories[ci].groups;if(i<a.length-1){[a[i+1],a[i]]=[a[i],a[i+1]];markDirty();renderActive()}break}
      case 'delete-group':if(confirm('Usunąć tę grupę?')){state.pricing.categories[num('ci')].groups.splice(num('gi'),1);markDirty();renderActive()}break;
      case 'add-price':state.pricing.categories[num('ci')].groups[num('gi')].rows.push({id:uid('price'),name:'Nowa pozycja',price:'Wycena',note:'',featured:false,iconImage:''});markDirty();renderActive();break;
      case 'move-price-up':{const rows=state.pricing.categories[num('ci')].groups[num('gi')].rows;const i=num('ri');if(i>0){[rows[i-1],rows[i]]=[rows[i],rows[i-1]];markDirty();renderActive()}break}
      case 'move-price-down':{const rows=state.pricing.categories[num('ci')].groups[num('gi')].rows;const i=num('ri');if(i<rows.length-1){[rows[i+1],rows[i]]=[rows[i],rows[i+1]];markDirty();renderActive()}break}
      case 'delete-price':if(confirm('Usunąć pozycję cennika?')){state.pricing.categories[num('ci')].groups[num('gi')].rows.splice(num('ri'),1);markDirty();renderActive()}break;
      case 'gallery-pos':{const idx=num('gi');const g=state.home.about.gallery[idx];let [x,y]=parsePosition(g.position);if(el.dataset.axis==='x')x=Number(el.value);else y=Number(el.value);g.position=`${x}% ${y}%`;markDirty();const img=el.closest('.gallery-card').querySelector('img');img.style.objectPosition=g.position;el.nextElementSibling.textContent=`${el.value}%`;break}
      case 'add-gallery-item':{const preferred=media[0];state.home.about.gallery ||= [];state.home.about.gallery.push({id:uid('gallery'),image:preferred?.public_path||'./assets/real-front.png',title:preferred?.title||'Nowe zdjęcie',copy:'',fit:'cover',position:'50% 50%'});markDirty();renderActive();break}
      case 'move-gallery-left':{const i=num('gi'),a=state.home.about.gallery;if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];markDirty();renderActive()}break}
      case 'move-gallery-right':{const i=num('gi'),a=state.home.about.gallery;if(i<a.length-1){[a[i+1],a[i]]=[a[i],a[i+1]];markDirty();renderActive()}break}
      case 'delete-gallery-item':{const i=num('gi');if(confirm('Usunąć to zdjęcie z karuzeli?')){state.home.about.gallery.splice(i,1);markDirty();renderActive()}break}
      case 'copy-path':await navigator.clipboard.writeText(el.dataset.path);toast('Ścieżka skopiowana.');break;
      case 'delete-media':if(confirm('Usunąć ten wgrany plik? Nie można usunąć pliku używanego w LIVE lub szkicu.')){try{await API.deleteMedia(el.dataset.id);await loadMedia();renderActive();toast('Plik usunięty.')}catch(err){toast(err.message,'bad')}}break;
      case 'add-faq':state.faqs.push({id:uid('faq'),q:'Nowe pytanie',a:'',active:true,order:state.faqs.length+1});markDirty();renderActive();break;
      case 'delete-faq':if(confirm('Usunąć pytanie?')){state.faqs.splice(num('fi'),1);markDirty();renderActive()}break;
      case 'refresh-leads':await loadLeads();renderActive();break;
      case 'lead-status':try{await API.updateLead(el.dataset.id,{status:el.value});await loadLeads();toast('Status zgłoszenia zapisany.')}catch(err){toast(err.message,'bad')}break;
      case 'save-lead-note':try{const note=app.querySelector(`[data-lead-note="${el.dataset.id}"]`)?.value||'';await API.updateLead(el.dataset.id,{note});await loadLeads();toast('Notatka zapisana.')}catch(err){toast(err.message,'bad')}break;
      case 'analytics-days':analyticsDays=Number(el.value);await loadAnalytics(analyticsDays);renderActive();break;
      case 'refresh-history':await loadRevisions();renderActive();break;
      case 'restore-revision':if(confirm('Wczytać tę wersję do szkicu?')){try{await API.restore(el.dataset.id);await loadState();toast('Wersja została wczytana do szkicu.');renderActive();updateTopbar()}catch(err){toast(err.message,'bad')}}break;
      case 'export-json':downloadJson();break;
      case 'reset-draft':if(confirm('Przywrócić domyślną konfigurację do szkicu?')){await API.resetDraft();await loadState();renderActive();updateTopbar();toast('Szkic zresetowany.')}break;
    }
  }

  document.addEventListener('change',async(e)=>{
    if(e.target?.id==='media-upload'){await handleUploads([...e.target.files]);e.target.value=''}
    if(e.target?.id==='import-json'){const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());if(!obj.business||!obj.pricing)throw new Error('To nie wygląda jak backup AutoKlinika CMS.');state=obj;markDirty();renderActive();toast('Backup wczytany do szkicu. Kliknij „Zapisz szkic”.')}catch(err){toast(err.message,'bad')}e.target.value=''}
  });

  async function handleUploads(files){
    let addedToGallery=0;
    state.home.about.gallery ||= [];
    for(const file of files){try{toast(`Przygotowuję ${file.name}...`);const title=file.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').trim()||'Zdjęcie warsztatu';const dataUrl=await compress(file);const item=await API.upload({filename:file.name,title,tags:'upload,gallery',dataUrl});media.unshift(item.media);state.home.about.gallery.push({id:uid('gallery'),image:item.media.public_path,title,copy:'',fit:'cover',position:'50% 50%'});addedToGallery++;toast(`Dodano ${file.name} do karuzeli`)}catch(err){toast(`${file.name}: ${err.message}`,'bad')}}
    if(addedToGallery) markDirty();
    renderActive();
  }
  function compress(file){return new Promise((resolve,reject)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{try{const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);resolve(c.toDataURL('image/webp',.84))}catch(e){reject(e)}};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Nie można odczytać obrazu.'))};img.src=url})}
  function downloadJson(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`autoklinika-cms-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}

  init();
})();
