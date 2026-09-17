import { PLOTS } from './plotData';
import './ui-fixes.css';

function syncPlotDrawerInfrastructure() {
  const drawer = document.querySelector('.plot-detail-drawer');
  if (!drawer) return;

  const selectedShape = document.querySelector('.masterplot.is-selected[data-plot]');
  const selectedId = selectedShape?.getAttribute('data-plot');
  if (!selectedId) return;

  const plot = PLOTS.find((item) => item.id === selectedId);
  if (!plot || plot.status === 'commonInteractive') return;

  const sewerRow = Array.from(drawer.querySelectorAll('.plot-media')).find(
    (row) => row.querySelector('b')?.textContent?.trim() === 'Kanalizacja',
  );

  if (sewerRow) {
    sewerRow.hidden = !plot.sewerage;
  }
}

const root = document.getElementById('root');

if (root) {
  const observer = new MutationObserver(syncPlotDrawerInfrastructure);
  observer.observe(root, { childList: true, subtree: true, characterData: true });

  root.addEventListener(
    'click',
    () => requestAnimationFrame(syncPlotDrawerInfrastructure),
    true,
  );

  requestAnimationFrame(syncPlotDrawerInfrastructure);
}
