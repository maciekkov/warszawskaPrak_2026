import React, { useMemo, useState } from 'react';
import { DEFAULT_PLOT_ID, MASTERPLAN_BACKGROUND_FALLBACK, MASTERPLAN_BACKGROUND_URL, MASTERPLAN_VIEWBOX, PLOT_PHOTOS, PLOTS, SELLABLE_PLOTS, formatArea, formatPLN } from './plotData';

const SvgIcon = ({ children, size = 24, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{children}</g>
  </svg>
);

const MountainIcon = () => <SvgIcon size={29}><path d="m3 19 6.3-10 3.3 4.7L15.6 9 21 19Z"/><path d="m7.2 12 2.2 1.8 2-2.2"/></SvgIcon>;
const HouseIcon = () => <SvgIcon size={29}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></SvgIcon>;
const LeafIcon = () => <SvgIcon size={29}><path d="M20 4c-7.7.3-13.6 3.6-15.1 9.1C3.5 18.1 7.2 21 11.2 19.5 16.7 17.4 19.7 11.5 20 4Z"/><path d="M5 19c2.6-4.7 6.4-8.4 11.5-11"/></SvgIcon>;
const TreeIcon = () => <SvgIcon size={28}><path d="M12 3 7 10h3l-4 6h4v5h4v-5h4l-4-6h3Z"/></SvgIcon>;
const CityIcon = () => <SvgIcon size={28}><path d="M4 21V9h6v12M10 21V4h10v17M7 12h.01M7 16h.01M14 8h2M14 12h2M14 16h2"/></SvgIcon>;
const RoadIcon = () => <SvgIcon size={28}><path d="M8 3 5 21M16 3l3 18M12 4v3M12 11v3M12 18v2"/></SvgIcon>;
const AreaIcon = () => <SvgIcon size={22}><path d="M5 5h14v14H5z"/><path d="M8 8h8M8 12h5M8 16h8"/></SvgIcon>;
const CoinIcon = () => <SvgIcon size={22}><circle cx="12" cy="12" r="8"/><path d="M14.5 9.2c-.5-.7-1.4-1.1-2.5-1.1-1.5 0-2.6.7-2.6 1.9 0 1.3 1.1 1.7 2.7 2.1 1.6.4 2.6.9 2.6 2.1 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.4-2.9-1.2M12 6.7v10.6"/></SvgIcon>;
const RulerIcon = () => <SvgIcon size={22}><path d="m4 17 13-13 3 3L7 20H4z"/><path d="m13 8 3 3M10 11l2 2M7 14l3 3"/></SvgIcon>;
const BoltIcon = () => <SvgIcon size={17}><path d="m13 2-7 12h6l-1 8 7-12h-6z"/></SvgIcon>;
const DropletIcon = () => <SvgIcon size={17}><path d="M12 2S6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/></SvgIcon>;
const SewerIcon = () => <SvgIcon size={17}><path d="M4 7h16M6 7v5a6 6 0 0 0 12 0V7M9 12h6M12 12v9"/></SvgIcon>;
const WifiIcon = () => <SvgIcon size={17}><path d="M5 10.5a10 10 0 0 1 14 0M8 14a6 6 0 0 1 8 0M11 17.5a2 2 0 0 1 2 0"/><path d="M12 20h.01"/></SvgIcon>;
const ArrowIcon = () => <SvgIcon size={18}><path d="M5 12h14M14 7l5 5-5 5"/></SvgIcon>;
const MailIcon = () => <SvgIcon size={18}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></SvgIcon>;

const TOP_CARDS = [
  { type:'panorama', icon:<MountainIcon/>, title:'Panoramiczne widoki', text:'Działki z otwartą przestrzenią i spokojnym otoczeniem.' },
  { type:'kameralna', icon:<HouseIcon/>, title:'Kameralne osiedle', text:'Czytelny układ parceli i spokojny, jednorodzinny charakter.' },
  { type:'funkcjonalna', icon:<LeafIcon/>, title:'Funkcjonalne działki', text:'Metraże i proporcje pozwalające wygodnie zaplanować dom.' },
];

const DESCRIPTIONS = {
  panorama:'Działka o otwartym charakterze i korzystnym układzie. Daje dużo swobody w ustawieniu domu oraz urządzeniu ogrodu.',
  kameralna:'Działka o zrównoważonym metrażu, przygotowana z myślą o wygodnej zabudowie jednorodzinnej i prywatnej strefie ogrodu.',
  funkcjonalna:'Działka o praktycznych proporcjach i większej swobodzie zagospodarowania. Dobra baza pod indywidualny projekt domu.',
};

function statusClass(plot){
  if(plot.status === 'available') return 'available';
  if(plot.status === 'stage2') return 'stage2';
  return 'common';
}

function mediaRows(plot){
  return [
    { icon:<BoltIcon/>, label:'Prąd', value:'przyłącze planowane' },
    { icon:<DropletIcon/>, label:'Woda', value:'przyłącze planowane' },
    { icon:<SewerIcon/>, label:'Kanalizacja', value:plot.sewerage ? 'miejska — przewidziana' : 'oczyszczalnia indywidualna' },
    { icon:<RoadIcon/>, label:'Droga wewnętrzna', value:'projektowana' },
    { icon:<WifiIcon/>, label:'Światłowód', value:'w zasięgu operatorów' },
  ];
}

function MapLegend(){
  return <div className="masterplan-legend" aria-label="Legenda mapy">
    <span><i className="legend-dot legend-dot--available"/>Dostępna</span>
    <span><i className="legend-dot legend-dot--stage2"/>Etap II</span>
    <span><i className="legend-dot legend-dot--common"/>Teren wspólny</span>
  </div>;
}

function Compass(){
  return <div className="masterplan-compass" aria-hidden="true"><span>N</span><svg viewBox="0 0 42 58"><path d="M21 2 8 48l13-7 13 7L21 2Z" fill="rgba(255,255,255,.94)" stroke="rgba(13,52,39,.74)"/><path d="M21 7v34" stroke="#d0a851" strokeWidth="1.2"/></svg></div>;
}

function MasterplanMap({ selectedId, hoveredId, typeFilter, onSelect, onHover }){
  const handleMapImageError = (event) => {
    if(event.currentTarget.dataset.fallbackApplied === '1') return;
    event.currentTarget.dataset.fallbackApplied = '1';
    event.currentTarget.src = MASTERPLAN_BACKGROUND_FALLBACK;
  };

  return (
    <div className="masterplan-wrap">
      <div className="masterplan-stage">
        <img
          className="masterplan-base"
          src={MASTERPLAN_BACKGROUND_URL}
          onError={handleMapImageError}
          alt="Widok z góry na teren Warszawska Park przy ul. Warszawskiej w Lubsku"
          draggable="false"
        />
        <svg className="masterplan-svg" viewBox={MASTERPLAN_VIEWBOX} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Interaktywna mapa działek Warszawska Park">
          <defs>
            <filter id="plotGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {PLOTS.map(plot => {
            const selected = plot.id === selectedId;
            const hovered = plot.id === hoveredId;
            const mutedByType = typeFilter !== 'all' && plot.sellable && plot.type !== typeFilter;
            const interactive = plot.sellable;
            const isRoad = plot.klasa === 'DROGOWA';
            const isParkOrInvestment = plot.status === 'common' && !isRoad;
            const active = selected || hovered;

            let activeFill = 'rgba(70,132,96,.32)';
            if(plot.status === 'stage2') activeFill = 'rgba(193,155,82,.28)';
            if(isParkOrInvestment) activeFill = 'rgba(91,125,83,.22)';
            if(isRoad) activeFill = 'rgba(184,142,74,.20)';

            return <g key={plot.id}
              data-plot={plot.id}
              className={`masterplot masterplot--${statusClass(plot)} ${selected ? 'is-selected' : ''} ${hovered ? 'is-hovered' : ''} ${mutedByType ? 'is-muted' : ''}`}
              role={interactive ? 'button' : 'img'}
              tabIndex={interactive ? 0 : -1}
              aria-label={interactive ? `Działka ${plot.id}, ${plot.size} metrów kwadratowych, ${plot.statusLabel}` : `${plot.id}, teren wspólny`}
              onMouseEnter={() => onHover(plot.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(plot.id)}
              onBlur={() => onHover(null)}
              onClick={() => interactive && onSelect(plot.id)}
              onKeyDown={e => { if(interactive && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); onSelect(plot.id); } }}>
              <path
                d={plot.d}
                fill={active ? activeFill : 'rgba(0,0,0,0.001)'}
                stroke={active ? 'rgba(255,255,255,.98)' : 'rgba(255,255,255,0)'}
                strokeWidth={hovered ? 5 : selected ? 3.2 : 0}
                vectorEffect="non-scaling-stroke"
                filter={hovered ? 'url(#plotGlow)' : undefined}
                pointerEvents="all"
              />
              <text
                x={plot.cx}
                y={plot.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`masterplot-label ${plot.bbox.width < 110 ? 'masterplot-label--small' : ''} ${mutedByType ? 'is-muted' : ''}`}
              >{plot.id}</text>
            </g>;
          })}
        </svg>
        <Compass/>
        <div className="masterplan-caption">NAJEDŹ LUB KLIKNIJ DZIAŁKĘ</div>
        <MapLegend/>
      </div>
    </div>
  );
}

function PlotDetail({ plot, onAsk }){
  if(!plot) return null;
  const media = mediaRows(plot);
  return <aside className="plot-detail" aria-live="polite">
    <div className="plot-detail__photo">
      <img src={PLOT_PHOTOS[plot.type]} alt={`Otoczenie działki ${plot.id}`}/>
      <span className={`plot-status plot-status--${statusClass(plot)}`}><i/>{plot.statusLabel}</span>
      <span className="plot-detail__photo-count">01 / 03</span>
    </div>
    <div className="plot-detail__body">
      <div className="plot-detail__title-row"><div><span className="plot-detail__type">{plot.typeLabel} · etap {plot.etap}</span><h3>Działka {plot.id}</h3></div></div>
      <div className="plot-metrics">
        <div><span className="plot-metric__icon"><AreaIcon/></span><span>Powierzchnia<strong>{formatArea(plot.size)}</strong></span></div>
        <div><span className="plot-metric__icon"><CoinIcon/></span><span>Cena netto<strong>{formatPLN(plot.priceNetto)}</strong></span></div>
        <div><span className="plot-metric__icon"><RulerIcon/></span><span>Cena za m²<strong>{plot.pricePerM2Netto ? `${plot.pricePerM2Netto} zł` : '—'}</strong></span></div>
      </div>
      <p className="plot-detail__description">{DESCRIPTIONS[plot.type]}</p>
      <div className="plot-detail__media">
        <h4>Media i infrastruktura</h4>
        <div className="plot-media-grid">{media.map(item => <div className="plot-media" key={item.label}><span className="plot-media__icon">{item.icon}</span><span><b>{item.label}</b><small>{item.value}</small></span></div>)}</div>
      </div>
      <div className="plot-detail__actions">
        <button className="plot-primary" onClick={() => onAsk(plot)}>Zapytaj o działkę <ArrowIcon/></button>
        <a className="plot-secondary" href="#tabela-dzialek">Porównaj w tabeli</a>
      </div>
      <p className="plot-detail__fineprint">Cena i status mają charakter informacyjny. Wiążące są dane potwierdzone przed zawarciem umowy.</p>
    </div>
  </aside>;
}

function TableStatus({ plot }){
  return <span className={`table-status table-status--${statusClass(plot)}`}><i/>{plot.statusLabel}</span>;
}

export default function PlotExplorer(){
  const [selectedId, setSelectedId] = useState(DEFAULT_PLOT_ID);
  const [hoveredId, setHoveredId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const selectedPlot = useMemo(() => PLOTS.find(p => p.id === selectedId) || SELLABLE_PLOTS[0], [selectedId]);
  const filteredRows = useMemo(() => SELLABLE_PLOTS.filter(plot => typeFilter === 'all' || plot.type === typeFilter), [typeFilter]);
  const visibleRows = expanded ? filteredRows : filteredRows.slice(0, 12);

  const chooseType = (type) => {
    const next = typeFilter === type ? 'all' : type;
    setTypeFilter(next);
    if(next !== 'all'){
      const candidate = SELLABLE_PLOTS.find(p => p.type === next && p.etap === 'I') || SELLABLE_PLOTS.find(p => p.type === next);
      if(candidate) setSelectedId(candidate.id);
    }
  };

  const selectPlot = (id, fromTable = false) => {
    setSelectedId(id);
    if(fromTable){
      window.setTimeout(() => document.querySelector('.plot-explorer__main')?.scrollIntoView({ behavior:'smooth', block:'center' }), 60);
    }
  };

  const askAboutPlot = (plot) => {
    window.dispatchEvent(new CustomEvent('plot-inquiry', { detail:{ id:plot.id, area:plot.size, price:plot.priceNetto } }));
    document.getElementById('kontakt')?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  return <section className="plot-explorer" id="dzialki">
    <div className="plot-botanical plot-botanical--right" aria-hidden="true"><LeafIcon/></div>
    <div className="plot-botanical plot-botanical--left" aria-hidden="true"><LeafIcon/></div>
    <div className="container plot-explorer__container">
      <div className="plot-section-head">
        <div>
          <div className="plot-kicker"><span/>PRZESTRZEŃ DO DOBREGO ŻYCIA</div>
          <h2>Wybierz działkę i poznaj szczegóły</h2>
          <p>Kliknij wybraną działkę na planie, aby zobaczyć jej powierzchnię, cenę, etap oraz zakres planowanej infrastruktury.</p>
        </div>
        <div className="plot-section-head__aside" aria-hidden="true"><span>Spokój<br/>ma adres</span><small>NATURA<br/>PRZESTRZEŃ<br/>WARSZAWSKA PARK</small></div>
      </div>

      <div className="plot-type-cards" aria-label="Typy działek">
        {TOP_CARDS.map(card => <button key={card.type} className={`plot-type-card ${typeFilter === card.type ? 'is-active' : ''}`} onClick={() => chooseType(card.type)} aria-pressed={typeFilter === card.type}>
          <span className="plot-type-card__icon">{card.icon}</span><span><strong>{card.title}</strong><small>{card.text}</small></span>
        </button>)}
      </div>

      <div className="plot-explorer__main" id="masterplan">
        <MasterplanMap selectedId={selectedPlot?.id} hoveredId={hoveredId} typeFilter={typeFilter} onSelect={setSelectedId} onHover={setHoveredId}/>
        <PlotDetail plot={selectedPlot} onAsk={askAboutPlot}/>
      </div>

      <div className="plot-benefits" aria-label="Atuty lokalizacji">
        <div className="plot-benefit"><span className="plot-benefit__icon"><TreeIcon/></span><span><strong>Otoczenie zieleni</strong><em>NATURALNY SPOKÓJ</em><small>Spokojny charakter terenu i dużo otwartej przestrzeni.</small></span></div>
        <div className="plot-benefit"><span className="plot-benefit__icon"><CityIcon/></span><span><strong>Lubsko pod ręką</strong><em>WYGODNA CODZIENNOŚĆ</em><small>Miasto, usługi i codzienne potrzeby w bliskim zasięgu.</small></span></div>
        <div className="plot-benefit"><span className="plot-benefit__icon"><RoadIcon/></span><span><strong>Droga i media</strong><em>SPÓJNA INFRASTRUKTURA</em><small>Droga wewnętrzna i przyłącza realizowane etapowo.</small></span></div>
        <div className="plot-benefits__script" aria-hidden="true">Tu<br/>żyje się lepiej</div>
      </div>

      <div className="plots-table-section" id="tabela-dzialek">
        <div className="plots-table-head">
          <div><div className="plot-kicker"><span/>LISTA DZIAŁEK</div><h3>Dostępne działki w Warszawska Park</h3></div>
          <div className="plots-table-head__tools">
            {typeFilter !== 'all' && <button onClick={() => setTypeFilter('all')}>Wyczyść filtr</button>}
            <span>{filteredRows.length} działek</span>
          </div>
        </div>
        <div className="plots-table-shell">
          <table className="plots-table">
            <thead><tr><th>Nr działki</th><th>Powierzchnia</th><th>Cena netto</th><th>Cena / m²</th><th>Etap</th><th>Status</th><th>Media</th><th>Szczegóły</th></tr></thead>
            <tbody>{visibleRows.map(plot => <tr key={plot.id} className={plot.id === selectedPlot?.id ? 'is-selected' : ''} onClick={() => selectPlot(plot.id, true)}>
              <td><strong>{plot.id}</strong><small>{plot.typeLabel}</small></td>
              <td>{formatArea(plot.size)}</td>
              <td>{formatPLN(plot.priceNetto)}</td>
              <td>{plot.pricePerM2Netto ? `${plot.pricePerM2Netto} zł` : '—'}</td>
              <td>{plot.etap}</td>
              <td><TableStatus plot={plot}/></td>
              <td><span className="table-media-icons" title="Prąd, woda, droga; kanalizacja wg działki"><BoltIcon/><DropletIcon/><RoadIcon/>{plot.sewerage && <SewerIcon/>}</span></td>
              <td><button className="table-detail-btn" onClick={e => {e.stopPropagation();selectPlot(plot.id,true);}}>Zobacz <ArrowIcon/></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        {filteredRows.length > 12 && <div className="plots-table-more"><button onClick={() => setExpanded(v => !v)}>{expanded ? 'Pokaż mniej' : `Pokaż wszystkie (${filteredRows.length})`}</button></div>}
        <p className="plots-table-note">Podane ceny są cenami netto. Szczegóły podatkowe i aktualny status działki potwierdzamy przed zawarciem umowy.</p>
      </div>
    </div>
  </section>;
}
