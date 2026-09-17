import React, { useEffect, useMemo, useState } from 'react';
import { MASTERPLAN_BACKGROUND_URL, PLOT_PHOTOS, PLOTS, SELLABLE_PLOTS, formatArea, formatPLN } from './plotData';

const SvgIcon = ({ children, size = 24, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{children}</g>
  </svg>
);

const MountainIcon = () => <SvgIcon size={29}><path d="m3 19 6.3-10 3.3 4.7L15.6 9 21 19Z"/><path d="m7.2 12 2.2 1.8 2-2.2"/></SvgIcon>;
const HouseIcon = () => <SvgIcon size={29}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></SvgIcon>;
const LeafIcon = ({ size = 29 }) => <SvgIcon size={size}><path d="M20 4c-7.7.3-13.6 3.6-15.1 9.1C3.5 18.1 7.2 21 11.2 19.5 16.7 17.4 19.7 11.5 20 4Z"/><path d="M5 19c2.6-4.7 6.4-8.4 11.5-11"/></SvgIcon>;
const TreeIcon = ({ size = 28 }) => <SvgIcon size={size}><path d="M12 3 7 10h3l-4 6h4v5h4v-5h4l-4-6h3Z"/></SvgIcon>;
const CityIcon = () => <SvgIcon size={28}><path d="M4 21V9h6v12M10 21V4h10v17M7 12h.01M7 16h.01M14 8h2M14 12h2M14 16h2"/></SvgIcon>;
const RoadIcon = ({ size = 28, className = '' }) => <SvgIcon size={size} className={className}><path d="M8 3 5 21M16 3l3 18M12 4v3M12 11v3M12 18v2"/></SvgIcon>;
const AreaIcon = () => <SvgIcon size={22}><path d="M5 5h14v14H5z"/><path d="M8 8h8M8 12h5M8 16h8"/></SvgIcon>;
const CoinIcon = () => <SvgIcon size={22}><circle cx="12" cy="12" r="8"/><path d="M14.5 9.2c-.5-.7-1.4-1.1-2.5-1.1-1.5 0-2.6.7-2.6 1.9 0 1.3 1.1 1.7 2.7 2.1 1.6.4 2.6.9 2.6 2.1 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.4-2.9-1.2M12 6.7v10.6"/></SvgIcon>;
const RulerIcon = () => <SvgIcon size={22}><path d="m4 17 13-13 3 3L7 20H4z"/><path d="m13 8 3 3M10 11l2 2M7 14l3 3"/></SvgIcon>;
const BoltIcon = ({ size = 17, className = '' }) => <SvgIcon size={size} className={className}><path d="m13 2-7 12h6l-1 8 7-12h-6z"/></SvgIcon>;
const DropletIcon = ({ size = 17, className = '' }) => <SvgIcon size={size} className={className}><path d="M12 2S6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/></SvgIcon>;
const SewerIcon = ({ size = 17, className = '' }) => <SvgIcon size={size} className={className}><circle cx="12" cy="7.5" r="3.25"/><path d="M6.5 7.5h11"/><path d="M9.2 10.7 7.4 19"/><path d="M12 10.7V19"/><path d="m14.8 10.7 1.8 8.3"/><path d="M7.2 15.2H16.8"/></SvgIcon>;
const WifiIcon = ({ size = 17, className = '' }) => <SvgIcon size={size} className={className}><path d="M5 10.5a10 10 0 0 1 14 0M8 14a6 6 0 0 1 8 0M11 17.5a2 2 0 0 1 2 0"/><path d="M12 20h.01"/></SvgIcon>;
const ArrowIcon = ({ size = 18 }) => <SvgIcon size={size}><path d="M5 12h14M14 7l5 5-5 5"/></SvgIcon>;
const CloseIcon = () => <SvgIcon size={19}><path d="M6 6l12 12M18 6 6 18"/></SvgIcon>;

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
  if(plot.status === 'reserved') return 'reserved';
  if(plot.status === 'sold') return 'sold';
  if(plot.status === 'stage2') return 'stage2';
  if(plot.status === 'commonInteractive') return 'common-interactive';
  return 'common';
}

function plotPalette(plot){
  const palettes = {
    available:{ base:'rgba(45,150,76,.10)', hover:'rgba(45,205,91,.50)', selected:'rgba(38,210,88,.64)', strokeBase:'rgba(69,177,95,.20)', strokeHover:'rgba(126,255,164,.98)', strokeSelected:'rgba(161,255,190,1)' },
    reserved:{ base:'rgba(198,150,45,.10)', hover:'rgba(239,177,43,.50)', selected:'rgba(242,174,32,.64)', strokeBase:'rgba(204,156,55,.20)', strokeHover:'rgba(255,220,112,.98)', strokeSelected:'rgba(255,231,145,1)' },
    sold:{ base:'rgba(177,67,57,.10)', hover:'rgba(224,74,60,.50)', selected:'rgba(229,66,53,.64)', strokeBase:'rgba(192,78,67,.20)', strokeHover:'rgba(255,136,122,.98)', strokeSelected:'rgba(255,162,149,1)' },
    stage2:{ base:'rgba(190,145,55,.11)', hover:'rgba(134,138,141,.42)', selected:'rgba(134,138,141,.52)', strokeBase:'rgba(190,145,55,.20)', strokeHover:'rgba(228,232,235,.95)', strokeSelected:'rgba(240,242,244,.98)' },
    commonInteractive:{ base:'rgba(69,117,170,.10)', hover:'rgba(89,157,236,.48)', selected:'rgba(89,157,236,.60)', strokeBase:'rgba(69,117,170,.22)', strokeHover:'rgba(147,201,255,.95)', strokeSelected:'rgba(186,224,255,1)' },
    common:{ base:'rgba(112,119,105,.01)', hover:'rgba(112,119,105,.01)', selected:'rgba(112,119,105,.01)', strokeBase:'rgba(0,0,0,0)', strokeHover:'rgba(0,0,0,0)', strokeSelected:'rgba(0,0,0,0)' },
  };
  if(plot.status === 'commonInteractive') return palettes.commonInteractive;
  return palettes[plot.status] || palettes.common;
}

function mediaRows(plot){
  if(plot.status === 'commonInteractive'){
    return [
      { icon:<span className="plot-media__icon-mark plot-media__icon-mark--common"><TreeIcon size={17}/></span>, label:'Przeznaczenie', value:plot.featureValue || 'zieleń wspólna' },
      { icon:<span className="plot-media__icon-mark plot-media__icon-mark--common"><LeafIcon size={17}/></span>, label:'Dostępność', value:'teren wspólny dla mieszkańców' },
      { icon:<span className="plot-media__icon-mark plot-media__icon-mark--road"><RoadIcon size={17}/></span>, label:'Powiązanie', value:'element układu osiedla' },
      { icon:<span className="plot-media__icon-mark plot-media__icon-mark--water"><DropletIcon/></span>, label:'Charakter', value:'spokojna zieleń i nasadzenia' },
    ];
  }

  return [
    { icon:<span className="plot-media__icon-mark plot-media__icon-mark--bolt"><BoltIcon/></span>, label:'Prąd', value:'przyłącze planowane' },
    { icon:<span className="plot-media__icon-mark plot-media__icon-mark--water"><DropletIcon/></span>, label:'Woda', value:'przyłącze planowane' },
    { icon:<span className="plot-media__icon-mark plot-media__icon-mark--sewer"><SewerIcon/></span>, label:'Kanalizacja', value:plot.sewerage ? 'miejska — przewidziana' : 'rozwiązanie indywidualne' },
    { icon:<span className="plot-media__icon-mark plot-media__icon-mark--road"><RoadIcon size={17}/></span>, label:'Droga wewnętrzna', value:'projektowana' },
    { icon:<span className="plot-media__icon-mark plot-media__icon-mark--wifi"><WifiIcon/></span>, label:'Światłowód', value:'w zasięgu operatorów' },
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

const MASTERPLAN_CROPPED_VIEWBOX = '0 245 2013 600';

function Stage2HoverNotice({ plot }){
  if(!plot) return null;
  return <div className="masterplan-hover-note" aria-live="polite"><strong>{plot.id}</strong><span>Etap drugi już wkrótce</span></div>;
}

function MasterplanMap({ selectedId, hoveredId, typeFilter, onSelect, onHover, onClear }){
  const hoveredPlot = hoveredId ? PLOTS.find(plot => plot.id === hoveredId) || null : null;
  const stage2HoverPlot = hoveredPlot?.status === 'stage2' ? hoveredPlot : null;

  const handleBackgroundClick = (event) => {
    if(event.target.closest('[data-plot]')) return;
    onClear();
  };

  return (
    <div className="masterplan-wrap masterplan-wrap--wide">
      <div className="masterplan-stage masterplan-stage--fit" onClick={handleBackgroundClick}>
        <svg className="masterplan-svg" viewBox={MASTERPLAN_CROPPED_VIEWBOX} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Interaktywna mapa działek Warszawska Park">
          <image href={MASTERPLAN_BACKGROUND_URL} x="0" y="0" width="2013" height="1019" preserveAspectRatio="none" aria-hidden="true" />
          {PLOTS.map(plot => {
            const selected = plot.id === selectedId;
            const hovered = plot.id === hoveredId;
            const mutedByType = typeFilter !== 'all' && plot.sellable && plot.type !== typeFilter;
            const selectable = plot.mapSelectable;
            const hoverable = plot.hoverable;
            const palette = plotPalette(plot);
            const verticalLabel = plot.rawId >= 29 && plot.rawId <= 44;
            const fill = selected ? palette.selected : hovered ? palette.hover : palette.base;
            const stroke = selected ? palette.strokeSelected : hovered ? palette.strokeHover : palette.strokeBase;
            const strokeWidth = selected ? 1.38 : hovered ? 1.18 : .48;

            return <g key={plot.id}
              data-plot={plot.id}
              className={`masterplot masterplot--${statusClass(plot)} ${selected ? 'is-selected' : ''} ${hovered ? 'is-hovered' : ''} ${mutedByType ? 'is-muted' : ''}`}
              role={selectable ? 'button' : 'img'}
              tabIndex={selectable ? 0 : -1}
              aria-label={plot.status === 'stage2' ? `Działka ${plot.id}, etap drugi już wkrótce` : plot.status === 'commonInteractive' ? `${plot.heading || 'Teren wspólny'} ${plot.id}` : `Działka ${plot.id}, ${plot.size} metrów kwadratowych, ${plot.statusLabel}`}
              onMouseEnter={() => hoverable && onHover(plot.id)}
              onMouseLeave={() => hoverable && onHover(null)}
              onFocus={() => hoverable && onHover(plot.id)}
              onBlur={() => hoverable && onHover(null)}
              onClick={event => { if(selectable){ event.stopPropagation(); onSelect(plot.id); } }}
              onKeyDown={e => { if(selectable && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); onSelect(plot.id); } }}>
              <path d={plot.d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" pointerEvents={hoverable ? 'all' : 'none'} />
              {plot.klasa !== 'DROGOWA' && <text
                x={plot.cx}
                y={plot.cy}
                transform={verticalLabel ? `rotate(90 ${plot.cx} ${plot.cy})` : undefined}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`masterplot-label ${verticalLabel ? 'masterplot-label--vertical' : ''} ${mutedByType ? 'is-muted' : ''}`}
              >{plot.id}</text>}
            </g>;
          })}
        </svg>
        <Compass/>
        <MapLegend/>
        <Stage2HoverNotice plot={stage2HoverPlot}/>
      </div>
    </div>
  );
}

function PlotDetail({ plot, onAsk, onClose, open }){
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if(!plot || !open){ setEntered(false); return; }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [open, plot]);
  if(!plot) return null;
  const media = mediaRows(plot);
  const isCommon = plot.status === 'commonInteractive';
  const plotImage = plot.photo || PLOT_PHOTOS[plot.type] || PLOT_PHOTOS.common;
  const title = isCommon ? plot.heading : `Działka ${plot.id}`;
  const eyebrow = isCommon ? plot.title : `${plot.typeLabel} · etap ${plot.etap}`;
  const description = isCommon ? plot.description : DESCRIPTIONS[plot.type];

  return <aside className={`plot-detail plot-detail-drawer ${entered ? 'is-open' : ''}`} aria-live="polite" onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <button className="plot-detail-drawer__close" type="button" onClick={onClose} aria-label="Zamknij szczegóły działki"><CloseIcon/></button>
    <div className="plot-detail__photo">
      <img src={plotImage} alt={isCommon ? `Wizja wspólnej zieleni dla ${plot.id}` : `Otoczenie działki ${plot.id}`}/>
      <span className={`plot-status plot-status--${statusClass(plot)}`}><i/>{plot.statusLabel}</span>
      <span className="plot-detail__photo-count">01 / 01</span>
    </div>
    <div className="plot-detail__body">
      <div className="plot-detail__title-row"><div><span className="plot-detail__type">{eyebrow}</span><h3>{title}</h3></div></div>
      <div className="plot-metrics">
        <div><span className="plot-metric__icon"><AreaIcon/></span><span>Powierzchnia<strong>{formatArea(plot.size)}</strong></span></div>
        {isCommon ? (
          <>
            <div><span className="plot-metric__icon"><TreeIcon size={18}/></span><span>{plot.featureLabel || 'Funkcja'}<strong>{plot.featureValue || 'zieleń wspólna'}</strong></span></div>
            <div><span className="plot-metric__icon"><LeafIcon size={18}/></span><span>Status<strong>{plot.statusLabel}</strong></span></div>
          </>
        ) : (
          <>
            <div><span className="plot-metric__icon"><CoinIcon/></span><span>Cena netto<strong>{formatPLN(plot.priceNetto)}</strong></span></div>
            <div><span className="plot-metric__icon"><RulerIcon/></span><span>Cena za m²<strong>{plot.pricePerM2Netto ? `${plot.pricePerM2Netto} zł` : '—'}</strong></span></div>
          </>
        )}
      </div>
      <p className="plot-detail__description">{description}</p>
      <div className="plot-detail__media">
        <h4>{isCommon ? 'Charakter terenu' : 'Media i infrastruktura'}</h4>
        <div className="plot-media-grid">{media.map(item => <div className="plot-media" key={item.label}><span className="plot-media__icon">{item.icon}</span><span><b>{item.label}</b><small>{item.value}</small></span></div>)}</div>
      </div>
      <div className="plot-detail__actions">
        <button className="plot-primary" onClick={() => onAsk(plot)}>{isCommon ? 'Zapytaj o inwestycję' : 'Zapytaj o działkę'} <ArrowIcon/></button>
        <a className="plot-secondary" href={isCommon ? '#masterplan' : '#tabela-dzialek'}>{isCommon ? 'Wróć do planu' : 'Porównaj w tabeli'}</a>
      </div>
      <p className="plot-detail__fineprint">{isCommon ? 'Opis ma charakter koncepcyjny i pokazuje kierunek zagospodarowania wspólnych terenów zielonych.' : 'Cena i status mają charakter informacyjny. Wiążące są dane potwierdzone przed zawarciem umowy.'}</p>
    </div>
  </aside>;
}

function TableStatus({ plot }){
  return <span className={`table-status table-status--${statusClass(plot)}`}><i/>{plot.statusLabel}</span>;
}

export default function PlotExplorer(){
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const selectedPlot = useMemo(() => selectedId ? PLOTS.find(p => p.id === selectedId) || null : null, [selectedId]);
  const filteredRows = useMemo(() => SELLABLE_PLOTS.filter(plot => typeFilter === 'all' || plot.type === typeFilter), [typeFilter]);
  const stageOneRows = useMemo(() => filteredRows.filter(plot => plot.etap === 'I'), [filteredRows]);
  const visibleRows = stageOneRows;

  const chooseType = (type) => {
    const next = typeFilter === type ? 'all' : type;
    setTypeFilter(next);
    if(selectedId){
      const current = SELLABLE_PLOTS.find(p => p.id === selectedId);
      if(next !== 'all' && current?.type !== next) setSelectedId(null);
    }
  };

  const selectPlot = (id, fromTable = false) => {
    setSelectedId(id);
    if(fromTable){
      window.setTimeout(() => document.querySelector('.plot-explorer__main')?.scrollIntoView({ behavior:'smooth', block:'center' }), 60);
    }
  };

  const toggleMapPlot = (id) => setSelectedId(current => current === id ? null : id);

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

      <div className="plot-explorer__main plot-explorer__main--wide" id="masterplan">
        <MasterplanMap selectedId={selectedPlot?.id} hoveredId={hoveredId} typeFilter={typeFilter} onSelect={toggleMapPlot} onHover={setHoveredId} onClear={() => setSelectedId(null)}/>
        <PlotDetail plot={selectedPlot} open={Boolean(selectedPlot)} onAsk={askAboutPlot} onClose={() => setSelectedId(null)}/>
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
            <span>Etap I · {visibleRows.length} działek teraz</span>
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
              <td><span className="table-media-icons" title="Prąd, woda, droga; kanalizacja wg działki"><span className="table-media-icon table-media-icon--bolt"><BoltIcon/></span><span className="table-media-icon table-media-icon--water"><DropletIcon/></span><span className="table-media-icon table-media-icon--road"><RoadIcon size={17}/></span>{plot.sewerage && <span className="table-media-icon table-media-icon--sewer"><SewerIcon/></span>}</span></td>
              <td><button className="table-detail-btn" onClick={e => {e.stopPropagation();selectPlot(plot.id,true);}}>Zobacz <ArrowIcon/></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="plots-table-more plots-table-more--static"><span>Etap II — już wkrótce</span></div>
        <p className="plots-table-note">Podane ceny są cenami netto. Szczegóły podatkowe i aktualny status działki potwierdzamy przed zawarciem umowy.</p>
      </div>
    </div>
  </section>;
}
