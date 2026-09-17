(async () => {
let phoneDisplay = '505 104 110';
let phoneHref = 'tel:+48505104110';
let facebookHref = 'https://www.facebook.com/autoklinikamk/?locale=pl_PL';

const Icon = ({name, size = 24}) => {
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  const paths = {
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.45 19.45 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.98.72 2.92a2 2 0 0 1-.45 2.11L8.1 10.03a16 16 0 0 0 5.87 5.87l1.28-1.28a2 2 0 0 1 2.11-.45c.94.35 1.92.59 2.92.72A2 2 0 0 1 22 16.92Z"/>',
    star: '<path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2-4.6-4.4 6.3-.9L12 2.8Z"/>',
    gear: '<path d="M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.3v-4h.1A1.7 1.7 0 0 0 4 8.5a1.7 1.7 0 0 0-.34-1.88L3.6 6.56 6.46 3.7l.06.06A1.7 1.7 0 0 0 8.4 4.1a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2.3h4v.1A1.7 1.7 0 0 0 14.9 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.9 8.4c.12.37.33.7.6 1 .31.3.71.47 1.1.5h.1v4h-.1a1.7 1.7 0 0 0-1.6 1.1Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    lift: '<path d="M3 17h18M5 17v-5h14v5M7 12l1.5-5h7L17 12M7 21v-4M17 21v-4"/><circle cx="9" cy="17" r="1.7"/><circle cx="15" cy="17" r="1.7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 12h10M9 9v6M15 9v6"/>',
    align: '<path d="M6 4v16M18 4v16M3 8h6M15 8h6M3 16h6M15 16h6"/><circle cx="12" cy="12" r="2.3"/>',
    snow: '<path d="M12 2v20M4.22 6.5l15.56 9M4.22 17.5l15.56-9M8.5 4.2 12 7.7l3.5-3.5M8.5 19.8 12 16.3l3.5 3.5"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.5 2.5-3-3 2.5-2.5Z"/>',
    tire: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5M6.3 6.3l3.5 3.5M14.2 14.2l3.5 3.5"/>',
    oil: '<path d="M3 13h13l2-3h3v7h-3l-2-2H8l-2 3H3v-5Z"/><path d="M13 10 11 6H7"/>',
    clipboard: '<path d="M9 5h6"/><path d="M9 3h6a2 2 0 0 1 2 2v1h2v15H5V6h2V5a2 2 0 0 1 2-2Z"/><path d="m9 13 2 2 4-4"/>',
    usercheck: '<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    car: '<path d="M5 17h14l1-6-2-4H6l-2 4 1 6Z"/><path d="M7 17v2M17 17v2"/><path d="M4 11h16"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
    route: '<path d="M6 19c-2 0-3-1.3-3-3s1.2-3 3-3h12c1.8 0 3-1.3 3-3s-1.2-3-3-3H9"/><path d="m12 4-3 3 3 3"/><circle cx="6" cy="19" r="2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    facebook: '<path d="M14.2 8.3V6.6c0-.8.5-1 1.1-1h2.8V2.1h-3.9c-3.5 0-4.8 2.1-4.8 4.7v1.5H7v3.9h2.4V22h4.8v-9.8h3.4l.5-3.9h-3.9Z" fill="currentColor" stroke="none"/>'
  };
  return `<svg ${common}>${paths[name] || ''}</svg>`;
};

const logo = `
<a class="brand brand-plate header-brand" href="#top" aria-label="AutoKlinika — strona główna">
  <span class="brand-logo-stack" aria-hidden="true">
    <img class="brand-logo-img brand-logo-light" src="./assets/logo-autoklinika-light.png" alt="" />
    <img class="brand-logo-img brand-logo-dark" src="./assets/logo-autoklinika-dark.png" alt="" />
  </span>
  <span class="sr-only">AutoKlinika</span>
</a>`;
const logoLight = `
<a class="brand brand-plate brand-on-dark" href="#top" aria-label="AutoKlinika — strona główna">
  <img class="brand-logo-img" src="./assets/logo-autoklinika-light.png" alt="AutoKlinika" />
</a>`;

const brandify = (value='') => String(value).replace(/AUTOKLINIKI|AUTOKLINIKA|AutoKlinika|Autoklinika/g, (word) => {
  const k = word.toLowerCase().indexOf('k');
  if (k < 1) return word;
  return `<span class="brand-word"><span class="brand-letter">${word[0]}</span>${word.slice(1,k)}<span class="brand-letter">${word[k]}</span>${word.slice(k+1)}</span>`;
});

const escapeHtml = (value='') => String(value ?? '').replace(/[&<>\"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char]));

let services = [
  { title: 'Diagnostyka', iconImage: 'icon-service-diagnostyka.png', image: 'service-premium-diagnostyka.png', lead: 'Kontrolka, utrata mocy, nierówna praca.', body: 'Odczyt błędów, analiza parametrów, weryfikacja przyczyny.' },
  { title: 'Geometria 3D', iconImage: 'icon-service-geometria.png', image: 'service-premium-geometria.png', lead: 'Auto ściąga albo zużywa opony.', body: 'Precyzyjna kontrola i regulacja ustawienia kół.' },
  { title: 'Serwis klimatyzacji', iconImage: 'icon-service-klimatyzacja.png', image: 'service-premium-klimatyzacja.png', lead: 'Klimatyzacja nie chłodzi.', body: 'Ozonowanie, odgrzybianie, sprawdzenie szczelności i uzupełnienie czynnika.' },
  { title: 'Mechanika', iconImage: 'icon-service-mechanika.png', image: 'service-premium-mechanika.png', lead: 'Stuki, hamulce, rozrząd, sprzęgło.', body: 'Profesjonalna naprawa z użyciem sprawdzonych części.' },
  { title: 'Wulkanizacja', iconImage: 'icon-service-wulkanizacja.png', image: 'service-premium-wulkanizacja.png', lead: 'Wymiana i wyważanie opon.', body: 'Montaż, wyważanie, naprawa opon, przechowywanie.' },
  { title: 'Serwis okresowy', iconImage: 'icon-service-olej.png', image: 'service-premium-olej.png', lead: 'Przegląd, olej, filtry.', body: 'Wymiana oleju i filtrów zgodnie z zaleceniami producenta.' }
];

let facts = [
  {id:'rating', icon:'star', title:'5,0 / 5 w Google', copy:'28 opinii klientów'},
  {id:'experience', icon:'gear', title:'15+ lat doświadczenia', copy:'diagnostyka i mechanika'},
  {id:'bays', icon:'lift', title:'3 stanowiska serwisowe', copy:'sprawna organizacja pracy'},
  {id:'cost', icon:'shield', title:'Koszt przed naprawą', copy:'pracę dodatkową uzgadniamy'}
];

const factIconImages = {
  rating: './assets/fact-google.png',
  experience: './assets/fact-experience.png',
  bays: './assets/fact-workshop.png',
  cost: './assets/fact-cost.png'
};


let standardSteps = [
  { number:'01', icon:'scan', title:'Najpierw szukamy przyczyny.', copy:'Dokładna diagnostyka i weryfikacja objawu — nie zgadywanie.' },
  { number:'02', icon:'clipboard', title:'Przedstawiamy plan i koszt.', copy:'Wiesz, co proponujemy, na jakich zasadach i za ile.' },
  { number:'03', icon:'usercheck', title:'Naprawę zaczynamy po Twojej decyzji.', copy:'To Ty decydujesz, co naprawiamy. Bez nieuzgodnionych niespodzianek.' }
];

let popularPrices = [
  { iconImage:'icon-service-diagnostyka.png', name:'Diagnostyka komputerowa', price:'100 zł', categoryId:'diagnostics' },
  { iconImage:'icon-service-geometria.png', name:'Geometria 3D — kontrola', price:'100 zł', categoryId:'diagnostics' },
  { iconImage:'icon-service-geometria.png', name:'Geometria 3D — regulacja', price:'od 150 zł', categoryId:'diagnostics' },
  { iconImage:'icon-service-klimatyzacja.png', name:'Serwis klimatyzacji R134a', price:'150 zł', categoryId:'climate' },
  { iconImage:'icon-service-olej.png', name:'Serwis olejowy — robocizna', price:'100 zł', categoryId:'oil' },
  { iconImage:'icon-service-mechanika.png', name:'Wymiana klocków hamulcowych — oś', price:'od 150 zł', categoryId:'mechanic' }
];

let processSteps = [
  { number:'01', title:'Przyjęcie i objaw', copy:'Zapisujemy objaw, warunki występowania i oczekiwania. Krótka rozmowa oraz przyjęcie auta są bezpłatne.', code:'INTAKE', note:'WEJŚCIE' },
  { number:'02', title:'Diagnoza przyczyny', copy:'Testy komputerowe i mechaniczne. Potwierdzamy źródło problemu — nie wymieniamy części na próbę.', code:'DIAG', note:'POMIAR' },
  { number:'03', title:'Plan i koszt', copy:'Dostajesz zakres prac, rekomendowane rozwiązanie i koszt przed rozpoczęciem naprawy.', code:'PLAN', note:'WYCENA' },
  { number:'04', title:'Twoja akceptacja', copy:'Bez Twojej zgody nie rozszerzamy zlecenia. Każdą dodatkową pracę uzgadniamy przed wykonaniem.', code:'APPROVAL', note:'ZGODA' },
  { number:'05', title:'Naprawa i kontrola', copy:'Realizujemy uzgodnione prace, sprawdzamy efekt i informujemy, gdy samochód jest gotowy do odbioru.', code:'SERVICE', note:'ODBIÓR' }
];

let workshopGallery = [
  { id:'owner', image:'real-owner.jpg', title:'Michał', copy:'Szef · doświadczenie i diagnostyka', fit:'cover', position:'50% 34%' },
  { id:'geometry', image:'real-geometry.png', title:'Stanowisko geometrii', copy:'', fit:'cover', position:'48% 50%' },
  { id:'tires', image:'real-tires.png', title:'Serwis opon', copy:'', fit:'cover', position:'82% 50%' },
  { id:'office', image:'real-office.png', title:'Biuro obsługi', copy:'', fit:'cover', position:'78% 50%' },
  { id:'front', image:'real-front.png', title:'Nasz warsztat', copy:'', fit:'cover', position:'72% 50%' }
];

let reviews = [
  {
    source:'Google Maps', sourceClass:'google', author:'Patryk K.', initials:'P', rating:5,
    meta:'Opinia Google · 4 miesiące temu',
    excerpt:'Poważna naprawa silnika i układu paliwowego wykonana profesjonalnie. Rzetelny, dokładny i uczciwy fachowiec — bez ukrytych kosztów.',
    fullText:'Z pełnym przekonaniem wystawiam temu warsztatowi ocenę 5/5. Miałem wykonywaną poważną naprawę – temat związany z silnikiem oraz prace przy układzie paliwowym – wszystko zostało zrobione profesjonalnie i bez żadnych zastrzeżeń. Mechanik to człowiek z ogromną wiedzą i doświadczeniem, widać że szkolił się za granicą i zna się na swojej pracy. Rzetelny, dokładny, sumienny i przede wszystkim uczciwy – co w tej branży naprawdę ma ogromne znaczenie. Nie jest to „wymieniacz części”, tylko prawdziwy fachowiec z krwi i kości, który diagnozuje problem i naprawia go tak, jak należy. Auto po naprawie działa bez zarzutu. Świetny kontakt, wszystko jasno wytłumaczone, żadnych ukrytych kosztów. Z czystym sumieniem polecam każdemu – jeśli ktoś szuka sprawdzonego mechanika, to zdecydowanie warto tu przyjechać. Warsztat jest nowy ale wg mnie zje konkurencję na lata.',
    href:'https://www.google.com/maps/search/?api=1&query=AutoKlinika%20G%C3%B3rzyn%20125',
    label:'OPINIA KLIENTA'
  },
  {
    source:'Google Maps', sourceClass:'google', author:'Ilona Z.', initials:'I', rating:5,
    meta:'Opinia Google · 4 miesiące temu',
    excerpt:'Michał zawsze podchodzi rzetelnie, wszystko tłumaczy, sprawdza i jest uczciwy. Naprawiał nasze dwa samochody i nigdy nie było później problemów.',
    fullText:'Michał zawsze podchodzi rzetelnie, wszystko tłumaczy, sprawdza i jest uczciwy. Zna się na rzeczy. Naprawiał nasze dwa samochody i nigdy nie było później problemów. Pomocny człowiek z dobrym sercem. Z czystym sumieniem polecamy.',
    href:'https://www.google.com/maps/search/?api=1&query=AutoKlinika%20G%C3%B3rzyn%20125',
    label:'OPINIA KLIENTA'
  },
  {
    source:'Google Maps', sourceClass:'google', author:'Konrad L.', initials:'K', rating:5,
    meta:'Opinia Google · miesiąc temu',
    excerpt:'Szybka i trafna diagnoza. Przejrzysta wycena kosztów oraz uczciwe i solidne podejście do klienta.',
    fullText:'Bardzo polecam warsztat AutoKlinika. Szybka i trafna diagnoza. Przejrzysta wycena kosztów. Uczciwe i solidne podejście do klienta. Serdecznie polecam warsztat!',
    href:'https://www.google.com/maps/search/?api=1&query=AutoKlinika%20G%C3%B3rzyn%20125',
    label:'OPINIA KLIENTA'
  },
  {
    source:'Google Maps', sourceClass:'google', author:'Damian M.', initials:'D', rating:5,
    meta:'Opinia Google · 3 miesiące temu',
    excerpt:'Doświadczony i bardzo pomocny właściciel warsztatu. Z pełnym przekonaniem wystawiam 5/5 i polecam AutoKlinikę Górzyn.',
    fullText:'Doświadczony, strasznie pomocny właściciel warsztatu, z pełnym przekonaniem wystawiam opinię 5/5 gwiazdek. Polecam serdecznie, jeśli potrzebujecie doświadczonego mechanika to AutoKlinika Górzyn :D',
    href:'https://www.google.com/maps/search/?api=1&query=AutoKlinika%20G%C3%B3rzyn%20125',
    label:'OPINIA KLIENTA'
  },
  {
    source:'Google Maps', sourceClass:'google', author:'Tomasz S.', initials:'T', rating:5,
    meta:'Opinia Google · miesiąc temu',
    excerpt:'Konkretne podejście do klienta, wiedza, spokój i dobry kontakt przy weryfikacji usterki. Otwartość na różne marki pojazdów.',
    fullText:'Polecam każdemu 👍 konkretne podejście do klienta wiedza spokój człowiek otwarty na różne marki pojazdów dobry kontakt w weryfikacji usterki polecam.',
    href:'https://www.google.com/maps/search/?api=1&query=AutoKlinika%20G%C3%B3rzyn%20125',
    label:'OPINIA KLIENTA'
  }
];

let faqs = [
  { q:'Czy muszę wiedzieć, co jest zepsute?', a:'Nie. Wystarczy, że powiesz, co dzieje się z autem. Zajmiemy się diagnozą i weryfikacją przyczyny, a następnie przedstawimy plan naprawy i koszt.' },
  { q:'Czy wstępna rozmowa jest płatna?', a:'Krótka rozmowa i przyjęcie objawu są bezpłatne. Diagnostyka komputerowa lub mechaniczna jest rozliczana zgodnie z cennikiem.' },
  { q:'Czy zaczynacie naprawę bez mojej zgody?', a:'Nie. Najpierw przedstawiamy zakres i koszt. Naprawę rozpoczynamy dopiero po Twojej decyzji.' },
  { q:'Czy mogę umówić się online?', a:'Tak. Wyślij formularz „Poproś o termin”. Oddzwonimy w godzinach pracy, aby potwierdzić zakres i termin.' },
  { q:'Czy obsługujecie auta grupy VAG?', a:'Obsługę konkretnego modelu i zakres prac potwierdzimy przy kontakcie przed wizytą.' },
  { q:'Jakie formy płatności akceptujecie?', a:'Akceptujemy gotówkę, płatność kartą oraz BLIK.' },
  { q:'Gdzie się znajdujecie?', a:'AutoKlinika mieści się w Górzynie 125, 68-300 Lubsko.' }
];

const cmsResult = await window.AKCMSClient.getPublicState();
const cmsState = cmsResult.state || window.AKCMS_DEFAULTS;
const business = cmsState.business || window.AKCMS_DEFAULTS.business;
const home = cmsState.home || window.AKCMS_DEFAULTS.home;
phoneDisplay = business.phoneDisplay || phoneDisplay;
phoneHref = `tel:${business.phoneE164 || phoneDisplay.replace(/\D/g, '')}`;
facebookHref = business.facebook || facebookHref;
services = (cmsState.services || services).filter((item) => item.active !== false).sort((a,b) => (a.order || 0) - (b.order || 0));
facts = (home.facts || facts).map((f) => f.id === 'rating' ? { ...f, title: '5,0 / 5 w Google', copy: '28 opinii klientów' } : f);
standardSteps = home.standard?.steps || standardSteps;
processSteps = home.process?.steps || processSteps;
workshopGallery = home.about?.gallery || workshopGallery;
const ownerProfile = home.about?.ownerProfile || {
  title:'Michał',
  subtitle:'Szef AutoKliniki · diagnostyka, mechanika i elektromechanika.',
  text:'Michał od ponad 15 lat pracuje przy diagnostyce i naprawach samochodów. W Górzynie rozwijał własny serwis Auto-Elektro, prowadzony od 2017 roku. Dziś w AutoKlinice bierze na siebie przede wszystkim trudniejsze diagnozy: łączy odczyty ze sterowników z pomiarami i kontrolą mechaniczną, szuka rzeczywistej przyczyny usterki, ustala zakres naprawy i kontroluje efekt po wykonaniu prac.',
  highlights:['15+ lat praktyki','Auto-Elektro w Górzynie od 2017','Trudne diagnozy i kontrola jakości']
};
// Opinie/oceny są statyczne i źródłowe — bez klucza Google API oraz bez wywołań w tle.
faqs = (cmsState.faqs || faqs).filter((item) => item.active !== false).sort((a,b) => (a.order || 0) - (b.order || 0));
const collectFeaturedPrices = (categories = []) => categories.flatMap((category) =>
  (category.groups || []).flatMap((group) =>
    (group.rows || []).filter((row) => row.featured).map((row) => ({
      iconImage: row.iconImage || './assets/icon-service-diagnostyka.png',
      name: row.name,
      price: row.price,
      categoryId: category.id || '',
      groupId: group.id || '',
      rowId: row.id || ''
    }))
  )
).slice(0, 6);
popularPrices = collectFeaturedPrices(cmsState.pricing?.categories || []);
if (!popularPrices.length) popularPrices = collectFeaturedPrices(window.AKCMS_DEFAULTS.pricing.categories || []);
const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.googleMapsQuery || `${business.addressLine}, ${business.postalCity}`)}`;
const reviewsHref = 'https://www.google.com/maps/search/?api=1&query=AutoKlinika%20G%C3%B3rzyn%20125';
const assetSrc = (path) => path && (path.startsWith('./') || path.startsWith('/') || path.startsWith('data:') || path.startsWith('http')) ? path : `./assets/${path}`;

const scheduleKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const fallbackSchedule = {
  monday:{open:'08:00',close:'16:00',closed:false}, tuesday:{open:'08:00',close:'16:00',closed:false},
  wednesday:{open:'08:00',close:'16:00',closed:false}, thursday:{open:'08:00',close:'16:00',closed:false},
  friday:{open:'08:00',close:'16:00',closed:false}, saturday:{closed:true}, sunday:{closed:true}
};
const getWarsawNow = () => {
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Warsaw',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
  const get=(type)=>parts.find(p=>p.type===type)?.value;
  const dayMap={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
  return { day:dayMap[get('weekday')], minutes:Number(get('hour'))*60+Number(get('minute')) };
};
const toMinutes = (value='') => { const m=String(value).match(/^(\d{1,2}):(\d{2})$/); return m ? Number(m[1])*60+Number(m[2]) : null; };
const getBusinessStatus = () => {
  const now=getWarsawNow(); const key=scheduleKeys[now.day]; const schedule=business.weeklySchedule || fallbackSchedule; const cfg=schedule[key] || fallbackSchedule[key] || {closed:true};
  const open=toMinutes(cfg.open), close=toMinutes(cfg.close); const isOpen=!cfg.closed && open!=null && close!=null && now.minutes>=open && now.minutes<close;
  return {isOpen,label:isOpen?'Otwarte teraz':'Zamknięte teraz',key,cfg};
};
const businessStatus = getBusinessStatus();
const seo = cmsState.seo?.home;
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
const mapsFeatureEnabled = cmsState.legal?.mapsEnabled !== false;
window.AKCMSClient.track('page_view', { cmsSource: cmsResult.source });

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="top"></div>
  <header class="site-header" data-header>
    <div class="nav-row">
      <div class="shell nav-inner">
        ${logo}
        <button class="menu-toggle" aria-label="Otwórz menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button>
        <nav class="main-nav" data-menu>
          <a href="#services">Usługi</a>
          <a href="./cennik.html">Cennik</a>
          <a href="#process">Jak pracujemy</a>
          <a href="#about">O nas</a>
          <a href="#contact">Kontakt</a>
        </nav>
        <a class="header-social" href="${facebookHref}" target="_blank" rel="noopener noreferrer" aria-label="AutoKlinika na Facebooku">${Icon({name:'facebook', size:20})}<span class="sr-only">Facebook</span></a>
        <a class="btn btn-primary header-phone phone-cta" href="${phoneHref}">${Icon({name:'phone', size:20})}<span>Zadzwoń ${phoneDisplay}</span></a>
      </div>
    </div>
  </header>

  <main>
    <section class="hero section-dark" aria-labelledby="hero-title">
      <div class="hero-visual" aria-hidden="true">
        <img src="${assetSrc(home.hero?.image || './assets/hero-workshop-service-bay.png')}" alt="" fetchpriority="high" decoding="async" />
        <div class="hero-photo-shade"></div>
      </div>
      <div class="hero-ekg" aria-hidden="true">
        <svg viewBox="0 0 1000 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroEkgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ff0000" stop-opacity="0"/>
              <stop offset="10%" stop-color="#ff0000" stop-opacity=".48"/>
              <stop offset="52%" stop-color="#ff1f2a" stop-opacity="1"/>
              <stop offset="76%" stop-color="#ff3038" stop-opacity="1"/>
              <stop offset="100%" stop-color="#ff3038" stop-opacity="0"/>
            </linearGradient>
            <filter id="heroEkgGlow" x="-40%" y="-120%" width="180%" height="340%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path class="hero-ekg-base" d="M0,75 L450,75 L490,75 L510,67 L530,82 L548,75 L570,75 L592,58 L614,126 L638,14 L660,96 L680,75 L720,75 L742,66 L762,75 L1000,75"/>
          <path class="hero-ekg-run" d="M0,75 L450,75 L490,75 L510,67 L530,82 L548,75 L570,75 L592,58 L614,126 L638,14 L660,96 L680,75 L720,75 L742,66 L762,75 L1000,75" filter="url(#heroEkgGlow)"/>
        </svg>
      </div>
      <div class="shell hero-shell">
        <div class="hero-copy">
          <div class="eyebrow">${brandify(home.hero?.eyebrow || 'AUTOKLINIKA · GÓRZYN K. LUBSKA')}</div>
          <h1 id="hero-title">${home.hero?.titleLine1 || 'Najpierw diagnoza.'}<br><span>${home.hero?.titleLine2 || 'Potem naprawa.'}</span></h1>
          <p class="hero-lead">${home.hero?.lead || ''}</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-hero phone-cta" href="${phoneHref}">${Icon({name:'phone', size:20})}<span>${home.hero?.primaryLabel || 'Zadzwoń'} ${phoneDisplay}</span></a>
            <a class="btn btn-secondary btn-hero" href="./cennik.html"><span>${home.hero?.secondaryLabel || 'Sprawdź cennik'}</span>${Icon({name:'arrow', size:19})}</a>
          </div>
          <div class="hero-trust">
            <span class="trust-item">${Icon({name:'clock', size:17})} ${business.hours} · ${business.addressLine}</span>
            <span class="trust-rating"><span class="stars">★★★★★</span><span>5,0 w Google · 28 opinii</span></span>
          </div>
        </div>
        <aside class="hero-claim" aria-label="Filary AutoKliniki">
          <span></span>
          ${(home.hero?.claim || []).map((item) => `<strong>${item}</strong>`).join('')}
        </aside>
      </div>
      <div class="hero-facts" aria-label="AutoKlinika w skrócie">
        <div class="shell facts-grid">
          ${facts.map((f) => `<article class="fact"> <div class="fact-icon"><img src="${assetSrc(factIconImages[f.id] || factIconImages.cost)}" alt="" aria-hidden="true" /></div><div><h2>${f.title}</h2><p>${f.copy}</p></div></article>`).join('')}
        </div>
      </div>
    </section>

    <section id="services" class="services section-dark" aria-labelledby="services-title">
      <div class="shell services-shell">
        <div class="section-heading-row">
          <div>
            <div class="eyebrow eyebrow-redline">NAJCZĘSTSZE TEMATY</div>
            <h2 id="services-title">Z czym do nas przyjeżdżasz?</h2>
            <p>Nie musisz znać nazwy usterki. Powiedz, co robi samochód — zaczniemy od weryfikacji objawu.</p>
          </div>
          <a class="text-link" href="#all-services">ZOBACZ WSZYSTKIE USŁUGI ${Icon({name:'arrow',size:18})}</a>
        </div>
        <div class="services-grid">
          ${services.map((s) => `
            <article class="service-card">
              <div class="service-photo"><img src="${assetSrc(s.image)}" alt="${s.alt || s.title}" loading="lazy" style="object-position:${s.position || '50% 50%'}" /></div>
              <div class="service-card-body">
                <div class="service-title"><span class="service-icon"><img src="${assetSrc(s.iconImage)}" alt="" aria-hidden="true" /></span><h3>${s.title}</h3></div>
                <p class="service-lead">${s.lead}</p>
                <p class="service-body">${s.body}</p>
                <a href="#contact" class="service-link">Zobacz usługę ${Icon({name:'arrow',size:17})}</a>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <section id="standard" class="standard section-dark" aria-labelledby="standard-title">
      <div class="shell standard-shell">
        <div class="standard-copy">
          <div class="eyebrow eyebrow-redline">${brandify(home.standard?.eyebrow || 'STANDARD AUTOKLINIKI')}</div>
          <h2 id="standard-title">${home.standard?.title || ''}</h2>
          <p class="standard-lead">${home.standard?.lead || ''}</p>
          <div class="standard-steps">
            ${standardSteps.map((step) => `
              <article class="standard-step">
                <div class="standard-step-top"><span class="standard-number">${step.number}</span><span class="standard-icon">${Icon({name:step.icon,size:24})}</span></div>
                <h3>${step.title}</h3>
                <p>${step.copy}</p>
              </article>
            `).join('')}
          </div>
        </div>
        <figure class="standard-photo">
          <img src="${assetSrc('./assets/real-geometry.png')}" alt="Samochód na stanowisku serwisowym w warsztacie AutoKlinika" loading="lazy" style="object-position:${home.standard?.position || '50% 52%'}" />
        </figure>
      </div>
    </section>

    <section id="pricing" class="popular-prices section-dark" aria-labelledby="pricing-title">
      <div class="shell prices-shell">
        <div class="compact-heading-row">
          <div>
            <div class="eyebrow eyebrow-redline">POPULARNE USŁUGI</div>
            <h2 id="pricing-title">Najczęstsze usługi. Jasne ceny.</h2>
            <p>To tylko wybrane pozycje. Pełny cennik znajdziesz na osobnej stronie.</p>
          </div>
          <a class="text-link" href="./cennik.html">ZOBACZ PEŁNY CENNIK ${Icon({name:'arrow',size:18})}</a>
        </div>
        <div class="price-grid">
          ${popularPrices.map((item) => `
            <a class="price-card" href="./cennik.html#price-${encodeURIComponent(item.categoryId || 'diagnostics')}" aria-label="${escapeHtml(item.name)} — przejdź do odpowiedniej sekcji cennika">
              <span class="price-icon"><img src="${assetSrc(item.iconImage)}" alt="" aria-hidden="true" /></span>
              <h3>${escapeHtml(item.name)}</h3>
              <strong>${escapeHtml(item.price)}</strong>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <section id="process" class="process" aria-labelledby="process-title">
      <div class="process-ghost" aria-hidden="true"><span>01</span><i></i><span>05</span></div>
      <div class="process-corner-geometry" aria-hidden="true"></div>
      <div class="shell process-shell">
        <div class="process-heading-row">
          <div class="process-heading">
            <div class="eyebrow eyebrow-redline">${home.process?.eyebrow || 'JAK PRACUJEMY'}</div>
            <h2 id="process-title">${home.process?.titleLine1 || ''}<br>${home.process?.titleLine2 || ''}<span>.</span></h2>
            <p>${home.process?.lead || ''}</p>
          </div>
          <div class="process-manifesto" aria-hidden="true"><i></i><div>${(home.process?.manifesto || []).map((line) => `<span>${line}</span>`).join('')}<b></b></div></div>
        </div>

        <div class="process-tech-panel">
          <div class="process-tech-head">
            <span class="process-live"><i></i> PROTOKÓŁ SERWISOWY / 5 ETAPÓW</span>
            <span class="process-tech-sequence">OBJAW <b>→</b> DIAGNOZA <b>→</b> WYCENA <b>→</b> ZGODA <b>→</b> KONTROLA</span>
          </div>
          <div class="process-grid">
            ${processSteps.map((step, index) => {
              const icons=['clipboard','scan','route','usercheck','wrench'];
              const codes=['INTAKE','DIAG','PLAN','APPROVAL','SERVICE'];
              const notes=['WEJŚCIE','POMIAR','WYCENA','ZGODA','ODBIÓR'];
              return `
              <article class="process-step">
                <div class="process-card-top">
                  <span class="process-number">${step.number}</span>
                  <span class="process-code">${step.code || codes[index]}</span>
                </div>
                <div class="process-icon">${Icon({name:icons[index],size:22})}</div>
                <h3>${step.title}</h3>
                <p>${step.copy}</p>
                <div class="process-card-footer"><span class="process-status-dot"></span>${step.note || notes[index]}</div>
              </article>`;
            }).join('')}
          </div>
          <div class="process-promises" aria-label="Zasady obsługi">
            <span>${Icon({name:'scan',size:15})}<b>Najpierw diagnoza</b><small>bez wymiany części na chybił-trafił</small></span>
            <span>${Icon({name:'clipboard',size:15})}<b>Koszt przed naprawą</b><small>jasny zakres zanim zaczniemy</small></span>
            <span>${Icon({name:'usercheck',size:15})}<b>Twoja zgoda</b><small>zero nieuzgodnionych prac</small></span>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="about-workshop section-dark" aria-labelledby="about-title">
      <div class="shell about-shell">
        <div class="about-copy">
          <div class="eyebrow eyebrow-redline">${home.about?.eyebrow || 'NASZ ZESPÓŁ I WARSZTAT'}</div>
          <h2 id="about-title">${home.about?.title || ''}</h2>
          <p>${home.about?.lead || ''}</p>
          <a class="btn btn-secondary about-btn" href="#contact">Poznaj nas bliżej ${Icon({name:'arrow',size:18})}</a>
        </div>
        <div class="workshop-carousel" data-workshop-carousel>
          <button class="workshop-carousel-nav workshop-carousel-prev" type="button" data-workshop-prev aria-label="Poprzednie zdjęcia"><span aria-hidden="true">‹</span></button>
          <div class="workshop-carousel-viewport">
            <div class="workshop-gallery" data-workshop-track>
              ${workshopGallery.map((item, index) => `
                <figure class="workshop-shot fit-${item.fit || 'cover'}">
                  <button class="workshop-open" type="button" data-gallery-open="${index}" aria-label="Powiększ zdjęcie: ${escapeHtml(item.title)}">
                    <div class="workshop-media" style="--workshop-image:url('${assetSrc(item.image)}')">
                      <img src="${assetSrc(item.image)}" alt="${escapeHtml(item.title)} — AutoKlinika" loading="lazy" style="object-position:${item.position || '50% 50%'}" />
                    </div>
                  </button>
                  <figcaption><strong>${escapeHtml(item.title)}</strong>${item.id === 'owner' ? `<button type="button" class="owner-profile-trigger" data-owner-profile>${escapeHtml(item.copy || 'Szef · doświadczenie i diagnostyka')}</button>` : ''}</figcaption>
                </figure>
              `).join('')}
            </div>
          </div>
          <button class="workshop-carousel-nav workshop-carousel-next" type="button" data-workshop-next aria-label="Następne zdjęcia"><span aria-hidden="true">›</span></button>
        </div>
      </div>
    </section>

    <section id="reviews" class="reviews" aria-labelledby="reviews-title">
      <div class="shell reviews-shell">
        <div class="reviews-heading">
          <div>
            <div class="eyebrow eyebrow-redline">OPINIE KLIENTÓW</div>
            <h2 id="reviews-title">Sprawdź, jak oceniają nas kierowcy.</h2>
            <p class="reviews-lead">Pięć prawdziwych opinii klientów z profilu Google AutoKliniki. Na karcie pokazujemy skrót — pełną treść możesz rozwinąć bez opuszczania strony.</p>
          </div>
          <div class="reviews-summary"><span class="stars">★★★★★</span><strong>5,0 / 5 w Google</strong><span class="summary-divider"></span><span>28 opinii</span><a href="${reviewsHref}" target="_blank" rel="noopener" class="reviews-link">Zobacz profil Google ${Icon({name:'arrow',size:16})}</a></div>
        </div>
        <div class="reviews-grid">
          ${reviews.map((review) => `
            <article class="review-card review-static ${review.sourceClass || ''}">
              <div class="review-card-source"><span class="review-source-mark ${review.sourceClass || ''}">${escapeHtml(review.initials || review.source?.[0] || 'G')}</span><span>${escapeHtml(review.source)}</span><em>${escapeHtml(review.label || 'PUBLICZNE ŹRÓDŁO')}</em></div>
              <div class="review-top">
                <span class="review-avatar ${review.sourceClass || ''}">${escapeHtml(review.initials || 'G')}</span>
                <div><div class="review-stars" aria-label="${review.rating || 5} na 5 gwiazdek">★★★★★</div><strong>${escapeHtml(review.author)}</strong><small>${escapeHtml(review.meta)}</small></div>
              </div>
              <details class="review-copy">
                <summary>
                  <span class="review-preview">${escapeHtml(review.excerpt)}</span>
                  <span class="review-toggle"><span class="review-toggle-more">Rozwiń opinię</span><span class="review-toggle-less">Zwiń opinię</span><span class="review-toggle-icon" aria-hidden="true">⌄</span></span>
                </summary>
                <p class="review-full">${escapeHtml(review.fullText)}</p>
              </details>
              <a class="review-card-link" href="${escapeHtml(review.href)}" target="_blank" rel="noopener noreferrer">Zobacz w Google Maps ${Icon({name:'arrow',size:13})}</a>
            </article>
          `).join('')}
        </div>
        <div class="reviews-footnote"><span></span>Opinie przepisane z publicznego profilu Google. Imiona zachowane, nazwiska skrócone do inicjału. Sekcja statyczna — bez Google API.</div>
      </div>
    </section>

    <section id="faq" class="faq" aria-labelledby="faq-title">
      <div class="shell faq-shell">
        <div class="faq-heading">
          <div class="eyebrow eyebrow-redline">FAQ</div>
          <h2 id="faq-title">Najczęstsze pytania przed wizytą</h2>
        </div>
        <div class="faq-grid">
          <div class="faq-column">
            ${faqs.slice(0,4).map((item,index) => `
              <div class="faq-item ${index===0?'is-open':''}">
                <button class="faq-question" type="button" aria-expanded="${index===0?'true':'false'}"><span>${item.q}</span><span class="faq-chevron">${Icon({name:'chevron',size:18})}</span></button>
                <div class="faq-answer"><p>${brandify(item.a)}</p></div>
              </div>
            `).join('')}
          </div>
          <div class="faq-column">
            ${faqs.slice(4).map((item) => `
              <div class="faq-item">
                <button class="faq-question" type="button" aria-expanded="false"><span>${item.q}</span><span class="faq-chevron">${Icon({name:'chevron',size:18})}</span></button>
                <div class="faq-answer"><p>${brandify(item.a)}</p></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="home-contact section-dark" aria-labelledby="contact-title">
      <div class="shell home-contact-shell">
        <div class="home-contact-copy">
          <div class="eyebrow eyebrow-redline">KONTAKT</div>
          <div class="contact-logo">${logoLight}</div>
          <h2 id="contact-title">${business.addressLine.replace(/\s+125$/, '')} k. Lubska.</h2>
          <div class="contact-lines">
            <span>${Icon({name:'pin',size:24})}<span>${business.addressLine}, ${business.postalCity}</span></span>
            <a href="${phoneHref}">${Icon({name:'phone',size:24})}<span>${phoneDisplay}</span></a>
            <span>${Icon({name:'clock',size:24})}<span>${business.hours}</span></span>
            <span class="open-now ${businessStatus.isOpen?'is-open':'is-closed'}" data-business-status><i></i><strong>${businessStatus.label}</strong></span>
          </div>
          <div class="contact-actions">
            <a class="btn btn-primary phone-cta" href="${phoneHref}">${Icon({name:'phone',size:18})} Zadzwoń teraz</a>
            <a class="btn btn-secondary" href="${mapHref}" target="_blank" rel="noopener">${Icon({name:'route',size:18})} Wyznacz trasę</a>
          </div>
        </div>
        <figure class="contact-map-card" data-map-query="${encodeURIComponent(business.googleMapsQuery || `${business.addressLine}, ${business.postalCity}`)}" aria-label="Mapa AutoKliniki w Górzynie — Google Maps ładowane po zgodzie">
          <div class="map-consent-placeholder" data-map-consent>
            <div class="map-consent-box"><strong>${mapsFeatureEnabled?'Mapa Google jest wyłączona.':'Mapa Google jest wyłączona przez administratora.'}</strong><p>${mapsFeatureEnabled?'Nie łączymy się z Google bez Twojej decyzji. Możesz włączyć mapę albo skorzystać bezpośrednio z linku do trasy.':'Skorzystaj z przycisku „Wyznacz trasę”, aby otworzyć lokalizację bezpośrednio w Google Maps.'}</p>${mapsFeatureEnabled?'<button type="button" data-enable-maps>Włącz mapę Google</button>':''}<div class="map-consent-status">${mapsFeatureEnabled?'Kategorię możesz później wyłączyć w ustawieniach cookies.':'Osadzona mapa jest obecnie nieaktywna.'}</div></div>
          </div>
          <a class="map-open-link" href="${mapHref}" target="_blank" rel="noopener">Otwórz w Google Maps ${Icon({name:'arrow',size:15})}</a>
        </figure>
        <form class="home-booking-card" data-home-booking-form>
          <input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;pointer-events:none" />
          <h3>Poproś o termin</h3>
          <div class="home-form-grid">
            <label><span>Imię</span><input name="name" autocomplete="name" placeholder="Twoje imię" /></label>
            <label><span>Telefon <b>*</b></span><input name="phone" autocomplete="tel" inputmode="tel" placeholder="np. 505 104 110" required /></label>
            <label><span>Samochód</span><input name="car" placeholder="np. BMW 320d" /></label>
            <label><span>Temat <b>*</b></span><span class="topic-select-wrap"><select name="topic" required><option value="" selected disabled>Wybierz temat</option><option>Diagnostyka</option><option>Geometria 3D</option><option>Klimatyzacja</option><option>Mechanika</option><option>Wulkanizacja</option><option>Serwis olejowy</option></select></span></label>
          </div>
          <label class="form-wide"><span>Opis objawu lub usługi</span><textarea name="message" placeholder="Np. kontrolka silnika, hałas z przodu..."></textarea></label>
          <div class="form-wide availability-field"><span class="availability-field-label">Preferowany dzień</span><div data-availability></div></div>
          <div class="form-wide captcha-box"><div><span>Kontrola antyspamowa</span><strong data-captcha-question>Ładowanie…</strong></div><input type="hidden" name="captchaToken" /><input name="captchaAnswer" inputmode="numeric" autocomplete="off" required aria-label="Wynik działania" placeholder="Wynik" /><button type="button" data-captcha-refresh aria-label="Nowe działanie" title="Nowe działanie">↻</button></div>
          <div class="form-error" data-form-error hidden></div>
          <span class="form-privacy-note">Dane z tego zgłoszenia są zapisywane w systemie ${brandify('AutoKliniki')} wyłącznie w celu obsługi zapytania i ustalenia terminu. Szczegóły: <a href="./polityka-prywatnosci.html">Polityka prywatności</a>.</span>
          <button class="btn btn-primary home-submit" type="submit">${Icon({name:'send',size:19})} Wyślij zgłoszenie</button>
          <small>Wysłanie formularza nie oznacza jeszcze rezerwacji terminu. Skontaktujemy się z Tobą, aby potwierdzić szczegóły.</small>
          <div class="home-form-success" hidden>${Icon({name:'check',size:17})}<span>Zgłoszenie dotarło. Oddzwonimy w godzinach pracy, aby potwierdzić zakres i termin.</span></div>
        </form>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell footer-main">
      <div class="footer-brand">
        ${logoLight}
        <p>Najpierw diagnoza. Potem naprawa.</p>
      </div>
      <div class="footer-col"><h3>Usługi</h3><a href="#services">Diagnostyka komputerowa</a><a href="#services">Geometria 3D</a><a href="#services">Klimatyzacja</a><a href="#services">Mechanika</a><a href="#services">Wulkanizacja</a><a href="#services">Serwis okresowy</a></div>
      <div class="footer-col"><h3>Informacje</h3><a href="./cennik.html">Cennik</a><a href="#process">Jak pracujemy</a><a href="#about">O nas</a><a href="#contact">Kontakt</a></div>
      <div class="footer-col footer-contact"><h3>Kontakt</h3><span>${Icon({name:'pin',size:18})} ${business.addressLine}, ${business.postalCity}</span><a href="${phoneHref}">${Icon({name:'phone',size:18})} ${phoneDisplay}</a><span>${Icon({name:'clock',size:18})} ${business.hours}</span></div>
    </div>
    <div class="footer-legal"><div class="shell"><span>© ${new Date().getFullYear()} ${brandify('AUTOKLINIKA')} Sp. z o.o.</span><div class="footer-legal-links"><a href="./polityka-prywatnosci.html">Polityka prywatności</a><a href="./cookies.html">Cookies</a><a href="./informacje-prawne.html">Informacje prawne</a><button type="button" data-open-cookie-settings>Ustawienia cookies</button></div></div></div>
  </footer>

  <div class="gallery-lightbox" data-gallery-lightbox hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Galeria AutoKliniki">
    <button class="lightbox-close" type="button" data-lightbox-close aria-label="Zamknij galerię">×</button>
    <button class="lightbox-nav lightbox-prev" type="button" data-lightbox-prev aria-label="Poprzednie zdjęcie">‹</button>
    <figure class="lightbox-frame"><img data-lightbox-image alt=""/><figcaption><strong data-lightbox-title></strong><span data-lightbox-counter></span></figcaption></figure>
    <button class="lightbox-nav lightbox-next" type="button" data-lightbox-next aria-label="Następne zdjęcie">›</button>
  </div>

  <div class="owner-modal" data-owner-modal hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="owner-modal-title">
    <div class="owner-modal-card">
      <button class="owner-modal-close" type="button" data-owner-close aria-label="Zamknij">×</button>
      <div class="owner-modal-kicker">AUTOKLINIKA · MICHAŁ / SZEF</div>
      <h3 id="owner-modal-title">${escapeHtml(ownerProfile.title)}</h3>
      <strong>${escapeHtml(ownerProfile.subtitle)}</strong>
      <p>${escapeHtml(ownerProfile.text)}</p>
      <div class="owner-highlights">${(ownerProfile.highlights || []).map((item)=>`<span>${Icon({name:'check',size:15})}${escapeHtml(item)}</span>`).join('')}</div>
    </div>
  </div>
`;

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');

const syncHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
syncHeaderState();
window.addEventListener('scroll', syncHeaderState, {passive:true});

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('is-open', !open);
});

const refreshBusinessStatus = () => {
  const status=getBusinessStatus();
  document.querySelectorAll('[data-business-status]').forEach((el) => {
    el.classList.toggle('is-open',status.isOpen);
    el.classList.toggle('is-closed',!status.isOpen);
    const label=el.querySelector('strong'); if(label) label.textContent=status.label;
  });
};
refreshBusinessStatus();
setInterval(refreshBusinessStatus,60_000);

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const open = item.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
});

// Workshop carousel — centered cards, premium arrows, arbitrary gallery length from CMS.
const workshopTrack = document.querySelector('[data-workshop-track]');
const workshopPrev = document.querySelector('[data-workshop-prev]');
const workshopNext = document.querySelector('[data-workshop-next]');
const workshopStep = () => {
  const card = workshopTrack?.querySelector('.workshop-shot');
  if (!card || !workshopTrack) return 0;
  const styles = getComputedStyle(workshopTrack);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
  return card.getBoundingClientRect().width + gap;
};
const updateWorkshopNav = () => {
  if (!workshopTrack) return;
  const max = Math.max(0, workshopTrack.scrollWidth - workshopTrack.clientWidth);
  if (workshopPrev) workshopPrev.disabled = workshopTrack.scrollLeft <= 2;
  if (workshopNext) workshopNext.disabled = workshopTrack.scrollLeft >= max - 2;
};
workshopPrev?.addEventListener('click', () => workshopTrack?.scrollBy({left:-workshopStep(),behavior:'smooth'}));
workshopNext?.addEventListener('click', () => workshopTrack?.scrollBy({left:workshopStep(),behavior:'smooth'}));
workshopTrack?.addEventListener('scroll', () => requestAnimationFrame(updateWorkshopNav), {passive:true});
window.addEventListener('resize', updateWorkshopNav, {passive:true});
updateWorkshopNav();

// Fullscreen workshop gallery.
const lightbox = document.querySelector('[data-gallery-lightbox]');
const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
const lightboxTitle = lightbox?.querySelector('[data-lightbox-title]');
const lightboxCounter = lightbox?.querySelector('[data-lightbox-counter]');
let lightboxIndex = 0;
const renderLightbox = () => {
  const item = workshopGallery[lightboxIndex]; if (!item || !lightbox) return;
  lightboxImage.src = assetSrc(item.image); lightboxImage.alt = `${item.title} — AutoKlinika`;
  lightboxTitle.textContent = item.title || 'AutoKlinika';
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${workshopGallery.length}`;
};
const openLightbox = (index) => {
  if (!lightbox) return; lightboxIndex = index; renderLightbox(); lightbox.hidden = false; lightbox.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); lightbox.querySelector('[data-lightbox-close]')?.focus();
};
const closeLightbox = () => { if (!lightbox) return; lightbox.hidden = true; lightbox.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); };
document.querySelectorAll('[data-gallery-open]').forEach((button) => button.addEventListener('click', () => openLightbox(Number(button.dataset.galleryOpen || 0))));
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox || event.target.closest('[data-lightbox-close]')) closeLightbox(); });
lightbox?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => { lightboxIndex=(lightboxIndex-1+workshopGallery.length)%workshopGallery.length; renderLightbox(); });
lightbox?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => { lightboxIndex=(lightboxIndex+1)%workshopGallery.length; renderLightbox(); });

// Premium bio card for Michał.
const ownerModal = document.querySelector('[data-owner-modal]');
const openOwner = () => { if (!ownerModal) return; ownerModal.hidden=false; ownerModal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); ownerModal.querySelector('[data-owner-close]')?.focus(); };
const closeOwner = () => { if (!ownerModal) return; ownerModal.hidden=true; ownerModal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); };
document.querySelectorAll('[data-owner-profile]').forEach((button)=>button.addEventListener('click',openOwner));
ownerModal?.addEventListener('click',(event)=>{ if(event.target===ownerModal || event.target.closest('[data-owner-close]')) closeOwner(); });

document.addEventListener('keydown',(event)=>{
  if(event.key==='Escape'){ if(lightbox && !lightbox.hidden) closeLightbox(); if(ownerModal && !ownerModal.hidden) closeOwner(); }
  if(lightbox && !lightbox.hidden && event.key==='ArrowLeft'){ lightboxIndex=(lightboxIndex-1+workshopGallery.length)%workshopGallery.length; renderLightbox(); }
  if(lightbox && !lightbox.hidden && event.key==='ArrowRight'){ lightboxIndex=(lightboxIndex+1)%workshopGallery.length; renderLightbox(); }
});


const homeBookingForm = document.querySelector('[data-home-booking-form]');
window.AKAvailability?.bind(homeBookingForm, cmsState.settings || {});
window.AKCMSClient.bindCaptcha(homeBookingForm);
homeBookingForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!homeBookingForm.reportValidity()) return;
  const data = Object.fromEntries(new FormData(homeBookingForm).entries());
  const submit = homeBookingForm.querySelector('button[type="submit"]');
  const error = homeBookingForm.querySelector('[data-form-error]');
  const success = homeBookingForm.querySelector('.home-form-success');
  if (error) { error.hidden = true; error.textContent = ''; }
  if (success) success.hidden = true;
  if (submit) submit.disabled = true;
  const result = await window.AKCMSClient.submitLead('homepage', data);
  if (submit) submit.disabled = false;
  if (result?.ok) {
    if (success) success.hidden = false;
    homeBookingForm.querySelector('input[name="captchaAnswer"]').value = '';
    await window.AKCMSClient.refreshCaptcha(homeBookingForm);
    window.AKCMSClient.track('booking_submit');
  } else {
    if (error) { error.textContent = result?.error || 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.'; error.hidden = false; }
    if (result?.refreshCaptcha) await window.AKCMSClient.refreshCaptcha(homeBookingForm);
  }
});
window.AKCMSClient.bindTracking(document);

})();
