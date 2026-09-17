import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import PlotExplorer from './PlotExplorer';

const Icon = ({ children, size = 24, strokeWidth = 1.7, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{children}</g>
  </svg>
);

const CalendarIcon = ({ size = 21 }) => <Icon size={size}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></Icon>;
const ArrowIcon = ({ size = 21 }) => <Icon size={size}><path d="M5 12h14M14 7l5 5-5 5"/></Icon>;
const PinIcon = ({ size = 27 }) => <Icon size={size}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></Icon>;
const HomeIcon = ({ size = 27 }) => <Icon size={size}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></Icon>;
const LayersIcon = ({ size = 27 }) => <Icon size={size}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></Icon>;
const LeafIcon = ({ size = 27 }) => <Icon size={size}><path d="M20 4c-7.7.3-13.6 3.6-15.1 9.1C3.5 18.1 7.2 21 11.2 19.5 16.7 17.4 19.7 11.5 20 4Z"/><path d="M5 19c2.6-4.7 6.4-8.4 11.5-11"/></Icon>;
const RoadIcon = ({ size = 27 }) => <Icon size={size}><path d="M8 3 5 21M16 3l3 18M12 4v3M12 11v3M12 18v2"/></Icon>;
const DropIcon = ({ size = 27 }) => <Icon size={size}><path d="M12 3S5.5 10.4 5.5 15.2A6.5 6.5 0 0 0 18.5 15.2C18.5 10.4 12 3 12 3Z"/></Icon>;
const BoltIcon = ({ size = 27 }) => <Icon size={size}><path d="m13 2-7 11h6l-1 9 7-12h-6l1-8Z"/></Icon>;
const BulbIcon = ({ size = 27 }) => <Icon size={size}><path d="M9 18h6M10 22h4"/><path d="M8.2 15.5C6.8 14.4 6 12.7 6 10.8A6 6 0 1 1 18 10.8c0 1.9-.8 3.6-2.2 4.7-.6.5-.8 1.1-.8 1.5H9c0-.4-.2-1-.8-1.5Z"/></Icon>;
const TreeIcon = ({ size = 27 }) => <Icon size={size}><path d="M12 3 7 9h3l-5 6h5l-4 5h12l-4-5h5l-5-6h3l-5-6Z"/><path d="M12 20v2"/></Icon>;
const EntranceIcon = ({ size = 27 }) => <Icon size={size}><path d="M4 20V7h16v13M4 10h16M8 20V10M16 20V10"/><path d="m10 15 2-2 2 2"/></Icon>;
const SignalIcon = ({ size = 27 }) => <Icon size={size}><path d="M5 9a10 10 0 0 1 14 0M8 12a6 6 0 0 1 8 0M11 15a2 2 0 0 1 2 0"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></Icon>;
const GridIcon = ({ size = 27 }) => <Icon size={size}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></Icon>;
const PhoneIcon = ({ size = 25 }) => <Icon size={size}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c1 .3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></Icon>;
const DocIcon = ({ size = 25 }) => <Icon size={size}><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></Icon>;
const MailIcon = ({ size = 22 }) => <Icon size={size}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
const ClockIcon = ({ size = 22 }) => <Icon size={size}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const CheckIcon = ({ size = 20 }) => <Icon size={size}><path d="m5 12 4 4L19 6"/></Icon>;
const GearIcon = ({ size = 22 }) => <Icon size={size}><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21h-4v-.08A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H3v-4h.08A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.08V3h4v.08A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.23.37.56.7 1 .94.34.19.72.29 1.08.3H21v4h-.08a1.7 1.7 0 0 0-1.52.76Z"/></Icon>;
const CircleDotIcon = ({ size = 17 }) => <Icon size={size}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/></Icon>;
const ChevronDown = ({ size = 18 }) => <Icon size={size}><path d="m7 10 5 5 5-5"/></Icon>;
const ChevronLeft = ({ size = 20 }) => <Icon size={size}><path d="m15 18-6-6 6-6"/></Icon>;
const ChevronRight = ({ size = 20 }) => <Icon size={size}><path d="m9 18 6-6-6-6"/></Icon>;
const GalleryCloseIcon = ({ size = 22 }) => <Icon size={size}><path d="M6 6l12 12M18 6 6 18"/></Icon>;
const ExpandIcon = ({ size = 21 }) => <Icon size={size}><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="M3 8l5-5M21 8l-5-5M3 16l5 5M21 16l-5 5"/></Icon>;
const PlusIcon = ({ size = 20 }) => <Icon size={size}><path d="M12 5v14M5 12h14"/></Icon>;
const MinusIcon = ({ size = 20 }) => <Icon size={size}><path d="M5 12h14"/></Icon>;
const ResetIcon = ({ size = 20 }) => <Icon size={size}><path d="M4 4v6h6"/><path d="M4.6 15a8 8 0 1 0 1.8-8.6L4 10"/></Icon>;
const CrosshairIcon = ({ size = 22 }) => <Icon size={size}><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></Icon>;

const HospitalIcon = ({ size = 30 }) => <Icon size={size}><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"/></Icon>;
const CartIcon = ({ size = 30 }) => <Icon size={size}><circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/><path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H7"/></Icon>;
const SchoolIcon = ({ size = 30 }) => <Icon size={size}><path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12.5V17c3.5 2.7 8.5 2.7 12 0v-4.5M21 11v5"/></Icon>;
const BuildingIcon = ({ size = 30 }) => <Icon size={size}><path d="M3 21h18M5 18h14M6 18V9h12v9M4 9h16L12 3 4 9Z"/><path d="M9 12v4M12 12v4M15 12v4"/></Icon>;
const BusIcon = ({ size = 30 }) => <Icon size={size}><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M7 7h10M7 13h10M8 19v2M16 19v2"/><circle cx="8.5" cy="16" r="1"/><circle cx="15.5" cy="16" r="1"/></Icon>;
const NavigationIcon = ({ size = 22 }) => <Icon size={size}><path d="m21 3-7.5 18-3.7-7.3L3 10.5 21 3Z"/></Icon>;

function Logo({ inverse = false, compact = false }) {
  return (
    <a className={`brand ${inverse ? 'brand--inverse' : ''} ${compact ? 'brand--compact' : ''}`} href="#top" aria-label="Warszawska Park — strona główna">
      <svg className="brand__mark" viewBox="0 0 48 58" role="img" aria-hidden="true">
        <path d="M23.8 54V12"/>
        <path d="M23.8 21C17 18 12.7 12.6 13.2 5.6c7.3 2.6 10.9 7.4 10.6 15.4Z"/>
        <path d="M24 31c7-3.5 11.8-9 12.2-16.5-7.8 2.4-12 7.4-12.2 16.5Z"/>
        <path d="M23.8 40C16 37 10.2 31.6 8.9 23.4c8.7 1.7 13.8 7 14.9 16.6Z"/>
        <path d="M24 48c8.4-2.6 14.7-8 16.3-16.7-9.4 1.2-15 6.7-16.3 16.7Z"/>
      </svg>
      <span className="brand__copy"><strong>WARSZAWSKA PARK</strong><small>LUBSKO</small></span>
    </a>
  );
}

const navItems = [
  { label:'Działki', href:'#dzialki' },
  { label:'Infrastruktura', href:'#infrastruktura' },
  { label:'Postęp', href:'#postep' },
  { label:'Lokalizacja', href:'#lokalizacja' },
  { label:'Galeria', href:'#galeria' },
  { label:'Jak kupić', href:'#jak-kupic' },
  { label:'FAQ', href:'#faq' },
];

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 28);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''} ${open ? 'site-header--open' : ''}`}>
      <div className="header__inner">
        <Logo inverse />
        <nav className={`nav ${open ? 'nav--open' : ''}`} aria-label="Główna nawigacja">
          {navItems.map((item) => <a key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
        </nav>
        <a href="#kontakt" className="header__cta"><CalendarIcon size={19}/><span>Umów spotkanie</span></a>
        <button className={`menu-toggle ${open ? 'is-open' : ''}`} onClick={() => setOpen(v => !v)} aria-label="Otwórz menu" aria-expanded={open}>
          <span/><span/><span/>
        </button>
      </div>
    </header>
  );
}

const features = [
  { icon: <PinIcon/>, title: 'Lubsko, ul. Warszawska', subtitle: 'Świetna lokalizacja' },
  { icon: <HomeIcon/>, title: '40 działek', subtitle: 'W kameralnym kompleksie' },
  { icon: <LayersIcon/>, title: 'Etap I i II', subtitle: 'Realizacja infrastruktury' },
  { icon: <LeafIcon/>, title: 'Warunki zabudowy', subtitle: 'Dla potwierdzonych działek' },
  { icon: <RoadIcon/>, title: 'Droga i media', subtitle: 'Planowane i koordynowane' },
];

function Hero() {
  return (
    <section className="hero" id="top">
      <Header />
      <div className="hero__photo" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />
      <div className="hero__sunwash" aria-hidden="true" />
      <div className="hero__content container">
        <p className="eyebrow">WARSZAWSKA PARK · LUBSKO</p>
        <h1>Działki budowlane<br/>przy ul. Warszawskiej<br/>w Lubsku</h1>
        <p className="hero__lead">Spokojne miejsce na Twój dom. Uporządkowany teren,<br className="desktop-only"/> etapowo realizowana droga, media i infrastruktura wspólna.<br className="desktop-only"/> Wybierz konkretną parcelę i sprawdź jej aktualny status.</p>
        <div className="hero__actions">
          <a className="button button--gold" href="#dzialki">Sprawdź dostępne działki <ArrowIcon/></a>
          <a className="button button--ghost" href="#kontakt">Umów spotkanie <CalendarIcon size={19}/></a>
        </div>
        <p className="hero__note"><span className="info-dot">i</span> Oferta i status inwestycji aktualizowane na podstawie bieżących danych projektu.</p>
      </div>

      <div className="hero__script" aria-hidden="true">Spokój<br/>na dobre plany</div>

      <div className="hero__bottom container">
        <div className="feature-strip">
          {features.map((f, i) => (
            <div className="feature" key={f.title}>
              <div className="feature__icon">{f.icon}</div>
              <div className="feature__text"><strong>{f.title}</strong><span>{f.subtitle}</span></div>
              {i < features.length - 1 && <div className="feature__divider"/>}
            </div>
          ))}
        </div>
        <div className="hero__utility">
          <a className="scroll-cue" href="#dzialki"><span className="scroll-cue__line"/>PRZEWIŃ W DÓŁ <ChevronDown/></a>
          <div className="hero__pager" aria-label="Nawigacja galerii">
            <span className="pager__line"/><span className="pager__count">01 / 06</span><span className="pager__line pager__line--short"/>
            <button aria-label="Poprzednie zdjęcie"><ChevronLeft/></button>
            <button aria-label="Następne zdjęcie" className="accent"><ChevronRight/></button>
          </div>
        </div>
      </div>
    </section>
  );
}



const locationPlaces = [
  { icon:<HospitalIcon size={34}/>, title:'Szpital', distance:'ok. 137 m', time:'ok. 2 min pieszo' },
  { icon:<CartIcon size={34}/>, title:<>Zakupy <span>(spożywcze)</span></>, distance:'ok. 148 m', time:'ok. 2 min pieszo' },
  { icon:<SchoolIcon size={34}/>, title:'Szkoła podstawowa', distance:'ok. 609 m', time:'ok. 8 min pieszo' },
  { icon:<BuildingIcon size={34}/>, title:'Urząd Miejski', distance:'ok. 623 m', time:'ok. 8 min pieszo' },
  { icon:<BusIcon size={34}/>, title:'Dworzec PKS', distance:'ok. 774 m', time:'ok. 10 min pieszo' },
  { icon:<PinIcon size={34}/>, title:'Centrum Lubska', distance:'ok. 900 m', time:'ok. 12 min pieszo' },
];

const locationFacts = [
  { icon:<BuildingIcon size={31}/>, title:'Blisko centrum', subtitle:'WSZYSTKO W ZASIĘGU KILKU MINUT' },
  { icon:<CartIcon size={31}/>, title:<>Codzienne usługi<br/>pod ręką</>, subtitle:'SKLEPY, SZKOŁY, OPIEKA ZDROWOTNA' },
  { icon:<TreeIcon size={31}/>, title:'Spokojna okolica', subtitle:'ZIELEŃ, CISZA I PRZESTRZEŃ' },
  { icon:<RoadIcon size={31}/>, title:<>Dobry dojazd<br/>do Żar i Zielonej Góry</>, subtitle:'WYGODNA KOMUNIKACJA REGIONALNA' },
];

function LocationBotanical({ className='' }) {
  return <svg className={className} viewBox="0 0 180 180" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"><path d="M92 172c-4-38 1-76 16-117M109 63c13-23 26-34 43-41M105 76c-19-15-33-20-50-17M112 98c14-20 29-29 46-30M100 116c-18-13-35-16-51-11M95 140c14-16 28-24 44-25"/><path d="M148 24c-3 15-12 25-31 32 4-17 14-28 31-32ZM56 57c17-3 30 2 43 14-17 5-32 1-43-14ZM158 67c-5 16-16 25-34 28 6-16 17-25 34-28ZM49 104c18-1 31 5 43 18-18 3-32-2-43-18ZM140 114c-6 15-17 23-33 26 5-15 16-24 33-26Z"/></g></svg>;
}

function LocationSection() {
  return <section className="location-section" id="lokalizacja">
    <LocationBotanical className="location-botanical location-botanical--tl"/>
    <LocationBotanical className="location-botanical location-botanical--tr"/>
    <LocationBotanical className="location-botanical location-botanical--bl"/>
    <LocationBotanical className="location-botanical location-botanical--br"/>
    <div className="container location-section__container">
      <div className="location-layout">
        <div className="location-copy">
          <div className="location-kicker">LOKALIZACJA <span/></div>
          <h2>Lokalizacja, która łączy<br/>spokój z wygodą.</h2>
          <p className="location-lead">Warszawska Park powstaje przy ul. Warszawskiej w Lubsku —<br className="desktop-only"/> blisko codziennych usług, a jednocześnie w spokojnym,<br className="desktop-only"/> zielonym otoczeniu.</p>

          <div className="location-places">
            {locationPlaces.map((place) => <article className="location-place" key={String(place.distance)+String(place.time)}>
              <div className="location-place__icon">{place.icon}</div>
              <div><h3>{place.title}</h3><strong>{place.distance}</strong><span>{place.time}</span></div>
            </article>)}
          </div>

          <p className="location-disclaimer"><span>i</span> Odległości orientacyjne. Rzeczywisty czas dojścia może się nieznacznie różnić.</p>
          <div className="location-actions">
            <a className="location-route" href="https://www.google.com/maps/search/?api=1&query=ul.+Warszawska,+Lubsko" target="_blank" rel="noreferrer"><NavigationIcon size={19}/> Wyznacz trasę <ArrowIcon size={18}/></a>
            <a className="location-meeting" href="#kontakt"><CalendarIcon size={19}/> Umów spotkanie</a>
          </div>
        </div>

        <a className="location-map" href="https://www.google.com/maps/search/?api=1&query=ul.+Warszawska,+Lubsko" target="_blank" rel="noreferrer" aria-label="Otwórz lokalizację Warszawska Park w mapach">
          <img src="/assets/location-map-reference.png" alt="Schemat lokalizacji Warszawska Park w Lubsku z najbliższymi punktami usługowymi"/>
        </a>
      </div>

      <div className="location-facts">
        {locationFacts.map((fact,i) => <div className="location-fact" key={i}>
          <div className="location-fact__icon">{fact.icon}</div>
          <div><h3>{fact.title}</h3><span>{fact.subtitle}</span></div>
          {i<locationFacts.length-1 && <i/>}
        </div>)}
        <div className="location-script" aria-hidden="true">Blisko miasta.<br/>Bliżej natury.<span/></div>
      </div>
    </div>
  </section>;
}

const galleryItems = [
  { src:'/assets/gallery-05-dzialki.jpg', title:'Teren inwestycji', caption:'Widok na działki i spokojną zabudowę przy ul. Warszawskiej.' },
  { src:'/assets/gallery-01-inwestycja.jpg', title:'Warszawska Park z góry', caption:'Szeroki widok na teren inwestycji i otwarte pola.' },
  { src:'/assets/gallery-03-jeziora.jpg', title:'Blisko natury', caption:'Zbiorniki wodne, lasy i zieleń w otoczeniu Lubska.' },
  { src:'/assets/gallery-02-miasto.jpg', title:'Miasto pod ręką', caption:'Tereny sportowe i miejska infrastruktura w niedalekim sąsiedztwie.' },
  { src:'/assets/gallery-04-okolica.jpg', title:'Przestrzeń wokół inwestycji', caption:'Otwarte pola i kameralna zabudowa jednorodzinna.' },
];

const panoramaItems = [
  {
    src:'/assets/panoramas/dji_fly_20250505_143132_400_1746536187972_pano_optimized.jpg',
    kicker:'PANORAMA NAD INWESTYCJĄ',
    title:'Rozejrzyj się nad działkami',
    text:'Prawdziwa panorama 360° wykonana nad terenem Warszawska Park. Przeciągnij widok myszką i obejrzyj teren dookoła.',
    initialLon:65,
    initialLat:-18,
    initialFov:76,
    promo:'/assets/panoramas/panorama-promo-inwestycja.jpg',
  },
  {
    src:'/assets/panoramas/dji_fly_20250422_104408_335_1745312040457_pano_optimized.jpg',
    kicker:'PANORAMA OKOLICY',
    title:'Zobacz Lubsko, lasy i wodę dookoła',
    text:'Interaktywna panorama 360° pokazująca szerszy kontekst lokalizacji — lasy, zbiorniki wodne, pola i zabudowę Lubska.',
    initialLon:90,
    initialLat:-12,
    initialFov:76,
    promo:'/assets/panoramas/panorama-promo-okolica.jpg',
  },
];

function PanoramaPromoCard({ item, index, onOpen }){
  return <button type="button" className="panorama-card panorama-card--promo" onClick={() => onOpen(item)} aria-label={`Otwórz panoramę 360 stopni: ${item.title}`}>
    <img src={item.promo || item.src} alt="" aria-hidden="true"/>
    <span className="panorama-card__shade"/>
    <span className="panorama-card__badge"><b>360°</b> PRAWDZIWA PANORAMA</span>
    <span className="panorama-card__copy">
      <small>{item.kicker}</small>
      <strong>{item.title}</strong>
      <em>{item.text}</em>
      <i><ExpandIcon size={17}/> Otwórz panoramę <ArrowIcon size={16}/></i>
    </span>
    <span className="panorama-card__number">0{index + 1}</span>
  </button>;
}

function PanoramaModal({ item, onClose }){
  const dialogRef = useRef(null);
  const canvasRef = useRef(null);
  const closeRef = useRef(null);
  const requestRenderRef = useRef(() => undefined);
  const lonRef = useRef(item.initialLon ?? 205);
  const latRef = useRef(item.initialLat ?? -12);
  const fovRef = useRef(item.initialFov ?? 76);
  const dragRef = useRef({id:-1,x:0,y:0,lon:lonRef.current,lat:latRef.current});
  const [dragging,setDragging] = useState(false);
  const [loadState,setLoadState] = useState('loading');

  useEffect(() => {
    const previousFocus = document.activeElement;
    document.body.classList.add('modal-open');
    closeRef.current?.focus();
    const onKey = (event) => {
      if(event.key === 'Escape') onClose();
      if(event.key === 'Tab' && dialogRef.current){
        const controls = [...dialogRef.current.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')];
        const first = controls[0];
        const last = controls.at(-1);
        if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last?.focus(); }
        if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown',onKey);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown',onKey);
      previousFocus?.focus?.();
    };
  },[onClose]);

  useEffect(() => {
    const container = canvasRef.current;
    if(!container) return undefined;
    let disposed = false;
    let frame = 0;
    let cleanup = () => undefined;

    const start = async () => {
      try{
        const THREE = await import('three');
        if(disposed) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(fovRef.current,1,1,1100);
        const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
        const geometry = new THREE.SphereGeometry(500,72,48);
        const material = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geometry,material);
        let texture;
        geometry.scale(-1,1,1);
        scene.add(mesh);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x0b1b14);
        container.replaceChildren(renderer.domElement);

        const render = () => {
          const lat = Math.max(-78,Math.min(78,latRef.current));
          const phi = THREE.MathUtils.degToRad(90-lat);
          const theta = THREE.MathUtils.degToRad(lonRef.current);
          camera.fov = fovRef.current;
          camera.lookAt(new THREE.Vector3(500*Math.sin(phi)*Math.cos(theta),500*Math.cos(phi),500*Math.sin(phi)*Math.sin(theta)));
          camera.updateProjectionMatrix();
          renderer.render(scene,camera);
        };
        const requestRender = () => {
          if(frame || disposed) return;
          frame = window.requestAnimationFrame(() => { frame=0; render(); });
        };
        requestRenderRef.current = requestRender;
        const resize = () => {
          if(!container.clientWidth || !container.clientHeight) return;
          camera.aspect = container.clientWidth/container.clientHeight;
          renderer.setSize(container.clientWidth,container.clientHeight,false);
          requestRender();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();

        new THREE.TextureLoader().load(item.src,(loaded) => {
          if(disposed){ loaded.dispose(); return; }
          texture = loaded;
          loaded.colorSpace = THREE.SRGBColorSpace;
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          material.map = loaded;
          material.needsUpdate = true;
          setLoadState('ready');
          requestRender();
        },undefined,() => !disposed && setLoadState('error'));

        cleanup = () => {
          observer.disconnect();
          if(frame) window.cancelAnimationFrame(frame);
          texture?.dispose();
          material.dispose();
          geometry.dispose();
          renderer.dispose();
          container.replaceChildren();
        };
      }catch(error){
        console.error('Panorama 360 init error:',error);
        if(!disposed) setLoadState('error');
      }
    };
    void start();
    return () => { disposed=true; requestRenderRef.current=() => undefined; cleanup(); };
  },[item]);

  const changeFov = (delta) => {
    fovRef.current = Math.max(42,Math.min(92,fovRef.current+delta));
    requestRenderRef.current();
  };
  const reset = () => {
    lonRef.current = item.initialLon ?? 205;
    latRef.current = item.initialLat ?? -12;
    fovRef.current = item.initialFov ?? 76;
    requestRenderRef.current();
  };

  return <div ref={dialogRef} className="panorama-modal" role="dialog" aria-modal="true" aria-label={`Panorama 360: ${item.title}`}>
    <div
      className={`panorama-modal__stage ${dragging ? 'is-dragging' : ''}`}
      tabIndex={0}
      aria-label="Panorama 360. Przeciągaj myszką lub palcem. Kółko myszy przybliża widok."
      onPointerDown={(event) => {
        dragRef.current={id:event.pointerId,x:event.clientX,y:event.clientY,lon:lonRef.current,lat:latRef.current};
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if(dragRef.current.id !== event.pointerId) return;
        lonRef.current = dragRef.current.lon-(event.clientX-dragRef.current.x)*.12;
        latRef.current = Math.max(-78,Math.min(78,dragRef.current.lat+(event.clientY-dragRef.current.y)*.08));
        requestRenderRef.current();
      }}
      onPointerUp={(event) => {
        if(dragRef.current.id !== event.pointerId) return;
        dragRef.current.id=-1;
        setDragging(false);
        if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {dragRef.current.id=-1;setDragging(false);}}
      onWheel={(event) => {event.preventDefault();changeFov(event.deltaY*.03);}}
      onKeyDown={(event) => {
        if(event.key === 'ArrowLeft') lonRef.current-=6;
        else if(event.key === 'ArrowRight') lonRef.current+=6;
        else if(event.key === 'ArrowUp') latRef.current-=4;
        else if(event.key === 'ArrowDown') latRef.current+=4;
        else if(event.key === '+' || event.key === '=') changeFov(-5);
        else if(event.key === '-') changeFov(5);
        else if(event.key === 'Home') reset();
        else return;
        event.preventDefault();
        requestRenderRef.current();
      }}
    >
      <div ref={canvasRef} className="panorama-modal__canvas"/>
      {loadState === 'loading' && <div className="panorama-modal__loading"><span aria-hidden="true"/>Ładowanie panoramy z drona…</div>}
      {loadState === 'error' && <div className="panorama-modal__error">Nie udało się uruchomić panoramy w tej przeglądarce.</div>}
    </div>
    <div className="panorama-modal__topbar">
      <div><CrosshairIcon size={23}/><span><small>{item.kicker}</small><strong>{item.title}</strong></span></div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Zamknij panoramę"><GalleryCloseIcon/></button>
    </div>
    <div className="panorama-modal__controls" aria-label="Sterowanie panoramą">
      <button type="button" onClick={() => changeFov(-8)} aria-label="Przybliż"><PlusIcon/></button>
      <button type="button" onClick={() => changeFov(8)} aria-label="Oddal"><MinusIcon/></button>
      <button type="button" onClick={reset} aria-label="Przywróć widok początkowy"><ResetIcon/></button>
    </div>
    <p className="panorama-modal__hint">Przeciągnij, aby rozejrzeć się po okolicy · kółko myszy przybliża widok</p>
  </div>;
}

function GallerySection(){
  const [lightbox,setLightbox] = useState(null);
  const [activePanorama,setActivePanorama] = useState(null);

  useEffect(() => {
    if(!lightbox) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if(event.key === 'Escape') setLightbox(null);
      if(event.key === 'ArrowRight') setLightbox(current => current ? {...current,index:(current.index+1)%galleryItems.length} : current);
      if(event.key === 'ArrowLeft') setLightbox(current => current ? {...current,index:(current.index-1+galleryItems.length)%galleryItems.length} : current);
    };
    window.addEventListener('keydown',onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown',onKeyDown);
    };
  },[lightbox]);

  const activeItem = lightbox ? galleryItems[lightbox.index] : null;
  const openGallery = (index) => setLightbox({index});
  const step = (direction) => setLightbox(current => current ? {...current,index:(current.index+direction+galleryItems.length)%galleryItems.length} : current);

  return <section className="gallery-section" id="galeria">
    <div className="container gallery-section__container">
      <div className="gallery-head">
        <div>
          <div className="gallery-kicker"><span/>GALERIA + PANORAMY 360°</div>
          <h2>Zobacz Warszawska Park z góry</h2>
          <p>Zdjęcia wykonane nad inwestycją i w jej bezpośrednim otoczeniu. Poniżej możesz też uruchomić dwie prawdziwe panoramy sferyczne 360°.</p>
        </div>
        <div className="gallery-head__aside" aria-hidden="true">Blisko miasta.<br/>Bliżej natury.<span/></div>
      </div>

      <div className="gallery-grid">
        {galleryItems.map((item,index) => <button type="button" className={`gallery-card gallery-card--${index+1}`} key={item.src} onClick={() => openGallery(index)} aria-label={`Otwórz zdjęcie: ${item.title}`}>
          <img src={item.src} alt={item.title}/>
          <span className="gallery-card__shade"/>
          <span className="gallery-card__meta"><small>{String(index+1).padStart(2,'0')} / {String(galleryItems.length).padStart(2,'0')}</small><strong>{item.title}</strong><em>{item.caption}</em></span>
          <span className="gallery-card__open"><ExpandIcon size={17}/> Zobacz zdjęcie <ArrowIcon size={16}/></span>
        </button>)}
      </div>

      <div className="panorama-head">
        <div><span>PANORAMY SFERYCZNE 360°</span><h3>Obróć widok i zobacz całe otoczenie</h3></div>
        <p>Kliknij kartę, aby otworzyć pełnoekranową panoramę 360° i swobodnie rozejrzeć się po inwestycji oraz okolicy.</p>
      </div>

      <div className="panorama-grid panorama-grid--promo">
        {panoramaItems.map((item,index) => <PanoramaPromoCard item={item} index={index} onOpen={setActivePanorama} key={item.src}/>) }
      </div>
    </div>

    {lightbox && activeItem && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={activeItem.title} onMouseDown={event => {if(event.target === event.currentTarget) setLightbox(null);}}>
      <button type="button" className="gallery-lightbox__close" onClick={() => setLightbox(null)} aria-label="Zamknij podgląd"><GalleryCloseIcon/></button>
      <button type="button" className="gallery-lightbox__nav gallery-lightbox__nav--left" onClick={() => step(-1)} aria-label="Poprzednie zdjęcie"><ChevronLeft size={25}/></button>
      <figure className="gallery-lightbox__figure">
        <img src={activeItem.src} alt={activeItem.title}/>
        <figcaption><small>{`ZDJĘCIE ${lightbox.index+1} / ${galleryItems.length}`}</small><strong>{activeItem.title}</strong><span>{activeItem.caption}</span></figcaption>
      </figure>
      <button type="button" className="gallery-lightbox__nav gallery-lightbox__nav--right" onClick={() => step(1)} aria-label="Następne zdjęcie"><ChevronRight size={25}/></button>
      <span className="gallery-lightbox__hint">ESC — zamknij</span>
    </div>}
    {activePanorama && <PanoramaModal item={activePanorama} onClose={() => setActivePanorama(null)}/>}
  </section>;
}

const progressColumns = [
  {
    tone:'done', title:'Wykonane', subtitle:'SOLIDNE PODSTAWY', icon:<CheckIcon size={25}/>,
    items:['Podział geodezyjny działek','Warunki zabudowy dla całego terenu','Projekt drogi wewnętrznej','Analiza przyłączy mediów']
  },
  {
    tone:'active', title:'W realizacji', subtitle:'REALNE POSTĘPY', icon:<GearIcon size={24}/>,
    items:['Budowa drogi wewnętrznej (etap I)','Projekt sieci wod-kan','Uzgodnienia z operatorami','Przygotowanie oświetlenia']
  },
  {
    tone:'planned', title:'Planowane', subtitle:'PRZED NAMI', icon:<ClockIcon size={24}/>,
    items:['Budowa sieci wod-kan (etap II)','Przyłącza elektroenergetyczne','Oświetlenie uliczne','Zieleń i nasadzenia']
  }
];

const progressPhotos = [
  { src:'/assets/progress-1.jpg', date:'12.09.2026', title:'Wjazd z ul. Warszawskiej' },
  { src:'/assets/progress-2.jpg', date:'05.09.2026', title:'Teren inwestycji' },
  { src:'/assets/progress-3.jpg', date:'28.08.2026', title:'Prace przygotowawcze' },
];

function ProgressBotanical({ className='' }) {
  return <svg className={className} viewBox="0 0 180 180" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M92 172c-4-38 1-76 16-117M109 63c13-23 26-34 43-41M105 76c-19-15-33-20-50-17M112 98c14-20 29-29 46-30M100 116c-18-13-35-16-51-11M95 140c14-16 28-24 44-25"/>
      <path d="M148 24c-3 15-12 25-31 32 4-17 14-28 31-32ZM56 57c17-3 30 2 43 14-17 5-32 1-43-14ZM158 67c-5 16-16 25-34 28 6-16 17-25 34-28ZM49 104c18-1 31 5 43 18-18 3-32-2-43-18ZM140 114c-6 15-17 23-33 26 5-15 16-24 33-26Z"/>
    </g>
  </svg>;
}

function ProgressStageCard({ stage }) {
  return <article className={`progress-stage progress-stage--${stage.tone}`}>
    <ProgressBotanical className="progress-stage__botanical"/>
    <div className="progress-stage__head">
      <span className="progress-stage__badge">{stage.icon}</span>
      <div><h3>{stage.title}</h3><small>{stage.subtitle}</small></div>
    </div>
    <div className="progress-stage__rule"/>
    <ul>
      {stage.items.map((item) => <li key={item}><span className="progress-stage__item-icon">{stage.tone === 'done' ? <CheckIcon size={15}/> : <CircleDotIcon size={16}/>}</span><span>{item}</span></li>)}
    </ul>
  </article>;
}

function ProgressPhotoCard({ photo }) {
  return <article className="progress-photo-card">
    <img src={photo.src} alt={photo.title}/>
    <div className="progress-photo-card__body"><div><time>{photo.date}</time><strong>{photo.title}</strong></div><span className="progress-photo-card__arrow"><ArrowIcon size={18}/></span></div>
  </article>;
}

function ProgressSection() {
  return <section className="progress-section" id="postep">
    <ProgressBotanical className="progress-botanical progress-botanical--tl"/>
    <ProgressBotanical className="progress-botanical progress-botanical--tr"/>
    <ProgressBotanical className="progress-botanical progress-botanical--bl"/>
    <div className="container progress-section__container">
      <div className="progress-section__head">
        <div>
          <div className="progress-kicker">POSTĘP INWESTYCJI <span/></div>
          <h2>Co jest wykonane. Co realizujemy. Co jest planowane.</h2>
          <p>Transparentnie na każdym etapie. Sprawdź, co już za nami, nad czym pracujemy i jakie są kolejne kroki<br className="desktop-only"/> w rozwoju Warszawska Park.</p>
        </div>
        <aside className="progress-section__aside">
          <div className="progress-date">Stan na: 16.09.2026<span/></div>
          <div className="progress-script">Konsekwentnie<br/>bliżej Twojego miejsca<br/>na przyszłość.</div>
        </aside>
      </div>

      <div className="progress-board">
        {progressColumns.map(stage => <ProgressStageCard stage={stage} key={stage.title}/>)}
        {progressPhotos.map(photo => <ProgressPhotoCard photo={photo} key={photo.title}/>)}
      </div>

    </div>
  </section>;
}

const infraBenefits = [
  { icon:<GridIcon size={38}/>, title:'Uporządkowany podział działek', text:'Przemyślany układ i optymalne powierzchnie — czytelna przestrzeń pod Twój dom.' },
  { icon:<EntranceIcon size={38}/>, title:'Główny wjazd', text:'Wygodny i bezpieczny wjazd z ul. Warszawskiej o szerokości 6 m.' },
  { icon:<RoadIcon size={38}/>, title:'Droga wewnętrzna', text:'Utwardzona droga z zatoczkami mijania i dojazdami do działek.' },
  { icon:<DropIcon size={38}/>, title:'Woda i kanalizacja', text:'Projektowane przyłącza do granic działek, realizowane etapowo.' },
  { icon:<BoltIcon size={38}/>, title:'Energia', text:'Przyłącza elektroenergetyczne i skrzynki przy granicach działek.' },
  { icon:<LeafIcon size={38}/>, title:'Oświetlenie i zieleń', text:'Planowane oświetlenie uliczne, nasadzenia i kameralna strefa zieleni.' },
];

function InfrastructureSection() {
  return <section className="infrastructure-section infrastructure-section--benefits-only" id="infrastruktura">
    <ProgressBotanical className="infra-botanical infra-botanical--tl"/>
    <ProgressBotanical className="infra-botanical infra-botanical--tr"/>
    <ProgressBotanical className="infra-botanical infra-botanical--bl"/>
    <ProgressBotanical className="infra-botanical infra-botanical--br"/>
    <div className="container infrastructure-section__container">
      <div className="infra-intro">
        <div className="infra-intro__copy">
          <div className="infra-kicker">NASZE ATUTY <span/></div>
          <h2>Nie tylko działka. Infrastruktura, która porządkuje cały proces budowy.</h2>
          <p>W Warszawska Park przygotowujemy teren tak, aby budowa domu była prostsza, szybsza i bardziej przewidywalna. Zapewniamy uporządkowany podział działek, wygodny dojazd, dostęp do mediów, pełną dokumentację oraz zieleń. Infrastruktura realizowana jest etapami, z myślą o komforcie przyszłych mieszkańców.</p>
        </div>
        <div className="infra-intro__script" aria-hidden="true">Dobrze<br/>zaplanowana przyszłość<span/></div>
      </div>

      <div className="infra-benefits-layout">
        <div className="infra-benefits-grid">
          {infraBenefits.map(item => <article className="infra-benefit" key={item.title}>
            <div className="infra-benefit__icon">{item.icon}</div>
            <div><h3>{item.title}</h3><p>{item.text}</p></div>
          </article>)}
        </div>
        <article className="infra-operator-card">
          <ProgressBotanical className="infra-operator-card__leaf"/>
          <div className="infra-operator-card__icon"><SignalIcon size={52}/></div>
          <div><h3>Gaz i światłowód</h3><p>Realizacja zależna od warunków i harmonogramów operatorów zewnętrznych, w kolejnych etapach.</p></div>
          <span className="infra-operator-card__rule"/><small>INFRASTRUKTURA<br/>NA KOLEJNY ETAP</small>
        </article>
      </div>
    </div>
  </section>;
}

function ContactFeature({ icon, title, children }) {
  return <div className="contact-feature"><div className="contact-feature__icon">{icon}</div><div><strong>{title}</strong><p>{children}</p></div></div>;
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePlotInquiry = (event) => {
      const plot = event.detail;
      if (!plot?.id) return;
      const price = plot.price ? new Intl.NumberFormat('pl-PL').format(plot.price) + ' zł netto' : '';
      setMessage(`Dzień dobry, interesuje mnie działka ${plot.id}${plot.area ? ` (${new Intl.NumberFormat('pl-PL').format(plot.area)} m²)` : ''}${price ? `, ${price}` : ''}. Proszę o kontakt i aktualne informacje.`);
      setSent(false);
    };
    window.addEventListener('plot-inquiry', handlePlotInquiry);
    return () => window.removeEventListener('plot-inquiry', handlePlotInquiry);
  }, []);

  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };
  return (
    <section className="contact" id="kontakt">
      <div className="contact__bg" aria-hidden="true" />
      <div className="contact__overlay" aria-hidden="true" />
      <div className="contact__inner container">
        <div className="contact__intro">
          <div className="section-kicker"><span/>SKONTAKTUJ SIĘ Z NAMI</div>
          <h2>Porozmawiajmy<br/>o Twojej działce</h2>
          <p className="contact__lead">Masz pytania, chcesz umówić się na spotkanie<br className="desktop-only"/> lub otrzymać pełną dokumentację inwestycji?<br className="desktop-only"/> Jesteśmy do Twojej dyspozycji.</p>
          <div className="contact__features">
            <ContactFeature icon={<PhoneIcon/>} title="Szybki kontakt">Odpowiadamy<br/>w ciągu 24 h</ContactFeature>
            <ContactFeature icon={<DocIcon/>} title="Pełne informacje">Plany, media,<br/>harmonogram</ContactFeature>
            <ContactFeature icon={<CalendarIcon size={25}/>} title="Spotkanie na miejscu">Zobacz teren<br/>na żywo</ContactFeature>
          </div>
          <div className="contact__script" aria-hidden="true">Dobre miejsce<br/>na przyszłość</div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__head"><h3>Wyślij wiadomość</h3><span>ODPOWIADAMY<br/>W CIĄGU 24 GODZIN</span></div>
          <div className="form-grid">
            <label><span className="sr-only">Imię i nazwisko</span><input required placeholder="Imię i nazwisko *" /></label>
            <label><span className="sr-only">Numer telefonu</span><input placeholder="Numer telefonu" inputMode="tel" /></label>
            <label className="form-grid__full"><span className="sr-only">Adres e-mail</span><input required type="email" placeholder="Adres e-mail *" /></label>
            <label className="form-grid__full textarea-wrap"><span className="sr-only">Treść wiadomości</span><textarea value={message} maxLength={500} onChange={e => setMessage(e.target.value)} placeholder="Treść wiadomości"/><span className="char-count">{message.length}/500</span></label>
          </div>
          <div className="consent-row">
            <label className="check-wrap"><input required type="checkbox"/><span className="custom-check"><CheckIcon size={15}/></span><span>Wyrażam zgodę na przetwarzanie moich danych osobowych<br/>w celu odpowiedzi na zapytanie. *</span></label>
            <a href="#privacy">Polityka prywatności</a>
          </div>
          <button className="submit-button" type="submit">Wyślij wiadomość <ArrowIcon/></button>
          {sent && <div className="form-success" role="status">Dziękujemy. Formularz demonstracyjny działa poprawnie.</div>}
        </form>
      </div>
    </section>
  );
}

function MMInvestLogo() {
  return (
    <div className="investor-logo" aria-label="MM Invest Polska">
      <span className="investor-mark investor-mark--mm">
        <svg viewBox="0 0 88 42" aria-hidden="true">
          <path d="M4 34V8l12 16L28 8v26"/>
          <path d="M34 34V8l12 16L58 8v26"/>
          <path d="M66 12h18"/>
          <path d="M75 12v22"/>
          <path d="M68 34h14"/>
        </svg>
      </span>
      <span className="investor-wordmark"><strong>MM INVEST</strong><small>POLSKA</small></span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__main container footer__main--no-map">
        <div className="footer__brand-col">
          <Logo inverse compact/>
          <p>Nowoczesne działki budowlane w spokojnej lokalizacji.<br/>Kompleksowa infrastruktura, przemyślany plan<br/>osiedla i bliskość natury. Tworzymy przestrzeń<br/>do życia z myślą o przyszłości.</p>
          <div className="footer__script">Spokój ma adres</div>
          <div className="social-row"><a href="#facebook" aria-label="Facebook">f</a><a href="#instagram" aria-label="Instagram">◎</a><a href="#youtube" aria-label="YouTube">▶</a><span/><small>OBSERWUJ NAS</small><ArrowIcon size={17}/></div>
        </div>
        <div className="footer__links-col">
          <h4>NAWIGACJA</h4>
          <a href="#top">Strona główna</a><a href="#dzialki">Działki</a><a href="#infrastruktura">Infrastruktura</a><a href="#lokalizacja">Lokalizacja</a><a href="#galeria">Galeria</a><a href="#jak-kupić">Jak kupić</a><a href="#faq">FAQ</a><a href="#kontakt">Kontakt</a>
        </div>
        <div className="footer__contact-col">
          <h4>KONTAKT</h4>
          <div className="footer-contact-row"><PhoneIcon size={21}/><span>Biuro sprzedaży — kontakt po wcześniejszym umówieniu</span></div>
          <div className="footer-contact-row"><MailIcon size={21}/><span>kontakt@warszawskapark.pl</span></div>
          <div className="footer-contact-row"><PinIcon size={21}/><span>ul. Warszawska 58/3<br/>68–300 Lubsko</span></div>
          <div className="footer-contact-row"><ClockIcon size={21}/><span>Pon. – Pt. po wcześniejszym umówieniu<br/>Spotkania również na miejscu inwestycji</span></div>
        </div>
        <div className="footer__investor-col">
          <h4>INWESTOR</h4>
          <MMInvestLogo />
          <p>MM Invest Polska Sp. z o.o.<br/>ul. Warszawska 58/3<br/>68–300 Lubsko</p>
          <p>NIP: 894 316 17 84<br/>KRS: 0000873293<br/>REGON: 387709388</p>
        </div>
      </div>
      <div className="footer__bottom container" id="privacy">
        <span>© 2026 Warszawska Park. Wszelkie prawa zastrzeżone.</span>
        <div className="footer__legal"><a href="#privacy">Polityka prywatności</a><i/> <a href="#cookies">Cookies</a><i/> <a href="#regulamin">Regulamin</a><i/> <span>Realizacja: MM Invest Polska</span></div>
        <div className="footer__motto"><LeafIcon size={22}/><span>BLISKO NATURY<br/>BLIŻEJ CIEBIE</span></div>
      </div>
    </footer>
  );
}

function App() {
  return <><Hero/><PlotExplorer/><LocationSection/><GallerySection/><ProgressSection/><InfrastructureSection/><ContactSection/><Footer/></>;
}

createRoot(document.getElementById('root')).render(<App/>);
