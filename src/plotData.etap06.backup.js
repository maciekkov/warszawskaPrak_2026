const PLOT_DATA_MAPPING = {
  '251/2': { klasa: 'INWESTYCYJNA', size: 1456 },
  '265/1': { klasa: 'INWESTYCYJNA', size: 1464 },
  '265/2': { klasa: 'PARK', size: 915 },
  '251/3': { klasa: 'PARK', size: 933 },

  // ETAP I
  '251/4': { klasa: 'PRYWATNA', etap: 'I', size: 1129, priceNetto: 99352, priceBrutto: 122203, pricePerM2Netto: 88 },
  '265/3': { klasa: 'FUNKCJONALNA', etap: 'I', size: 1184, priceNetto: 97088, priceBrutto: 119417, pricePerM2Netto: 82 },
  '251/5': { klasa: 'PRYWATNA', etap: 'I', size: 1129, priceNetto: 99352, priceBrutto: 122203, pricePerM2Netto: 88 },
  '265/4': { klasa: 'FUNKCJONALNA', etap: 'I', size: 1187, priceNetto: 97334, priceBrutto: 119721, pricePerM2Netto: 82 },
  '251/6': { klasa: 'PRYWATNA', etap: 'I', size: 1129, priceNetto: 99352, priceBrutto: 122203, pricePerM2Netto: 88 },
  '265/5': { klasa: 'FUNKCJONALNA', etap: 'I', size: 1190, priceNetto: 97580, priceBrutto: 120023, pricePerM2Netto: 82 },
  '265/31': { klasa: 'FUNKCJONALNA', etap: 'I', size: 900, priceNetto: 73800, priceBrutto: 90774, pricePerM2Netto: 82 },
  '265/30': { klasa: 'FUNKCJONALNA', etap: 'I', size: 901, priceNetto: 73882, priceBrutto: 90875, pricePerM2Netto: 82 },
  '265/29': { klasa: 'PANORAMA', etap: 'I', size: 944, priceNetto: 85904, priceBrutto: 105662, pricePerM2Netto: 91 },
  '265/28': { klasa: 'PANORAMA', etap: 'I', size: 989, priceNetto: 89999, priceBrutto: 110699, pricePerM2Netto: 91 },
  '265/27': { klasa: 'PANORAMA', etap: 'I', size: 989, priceNetto: 89999, priceBrutto: 110699, pricePerM2Netto: 91 },
  '265/26': { klasa: 'PANORAMA', etap: 'I', size: 1035, priceNetto: 94185, priceBrutto: 115847, pricePerM2Netto: 91 },
  '265/25': { klasa: 'PANORAMA', etap: 'I', size: 1035, priceNetto: 94185, priceBrutto: 115847, pricePerM2Netto: 91 },
  '265/24': { klasa: 'PANORAMA', etap: 'I', size: 1035, priceNetto: 94185, priceBrutto: 115847, pricePerM2Netto: 91 },
  '265/23': { klasa: 'PANORAMA', etap: 'I', size: 1035, priceNetto: 94185, priceBrutto: 115847, pricePerM2Netto: 91 },
  '265/6': { klasa: 'FUNKCJONALNA', etap: 'I', size: 1193, priceNetto: 97826, priceBrutto: 120325, pricePerM2Netto: 82 },
  '251/7': { klasa: 'PRYWATNA', etap: 'I', size: 1129, priceNetto: 99352, priceBrutto: 122203, pricePerM2Netto: 88 },
  '265/7': { klasa: 'FUNKCJONALNA', etap: 'I', size: 1210, priceNetto: 99220, priceBrutto: 122041, pricePerM2Netto: 82 },
  '251/8': { klasa: 'PRYWATNA', etap: 'I', size: 1140, priceNetto: 100320, priceBrutto: 123394, pricePerM2Netto: 88 },

  // ETAP II
  '251/9': { klasa: 'PRYWATNA', etap: 'II', size: 1008, priceNetto: 82656, priceBrutto: 101667, pricePerM2Netto: 82 },
  '265/8': { klasa: 'FUNKCJONALNA', etap: 'II', size: 1056, priceNetto: 80256, priceBrutto: 98715, pricePerM2Netto: 76 },
  '251/10': { klasa: 'PRYWATNA', etap: 'II', size: 1008, priceNetto: 82656, priceBrutto: 101667, pricePerM2Netto: 82 },
  '265/9': { klasa: 'FUNKCJONALNA', etap: 'II', size: 1058, priceNetto: 80408, priceBrutto: 98902, pricePerM2Netto: 76 },
  '265/22': { klasa: 'PANORAMA', etap: 'II', size: 1080, priceNetto: 91800, priceBrutto: 112914, pricePerM2Netto: 85 },
  '265/21': { klasa: 'PANORAMA', etap: 'II', size: 1080, priceNetto: 91800, priceBrutto: 112914, pricePerM2Netto: 85 },
  '265/20': { klasa: 'PANORAMA', etap: 'II', size: 1080, priceNetto: 91800, priceBrutto: 112914, pricePerM2Netto: 85 },
  '265/19': { klasa: 'PANORAMA', etap: 'II', size: 1080, priceNetto: 91800, priceBrutto: 112914, pricePerM2Netto: 85 },
  '265/18': { klasa: 'PANORAMA', etap: 'II', size: 1080, priceNetto: 91800, priceBrutto: 112914, pricePerM2Netto: 85 },
  '265/17': { klasa: 'PANORAMA', etap: 'II', size: 1125, priceNetto: 95625, priceBrutto: 117619, pricePerM2Netto: 85 },
  '265/10': { klasa: 'FUNKCJONALNA', etap: 'II', size: 895, priceNetto: 68020, priceBrutto: 83665, pricePerM2Netto: 76 },
  '251/11': { klasa: 'PRYWATNA', etap: 'II', size: 868, priceNetto: 71176, priceBrutto: 87546, pricePerM2Netto: 82 },
  '251/12': { klasa: 'PRYWATNA', etap: 'II', size: 868, priceNetto: 71176, priceBrutto: 87546, pricePerM2Netto: 82 },
  '265/11': { klasa: 'FUNKCJONALNA', etap: 'II', size: 894, priceNetto: 67944, priceBrutto: 83571, pricePerM2Netto: 76 },
  '265/12': { klasa: 'FUNKCJONALNA', etap: 'II', size: 895, priceNetto: 68020, priceBrutto: 83665, pricePerM2Netto: 76 },
  '251/13': { klasa: 'PRYWATNA', etap: 'II', size: 868, priceNetto: 71176, priceBrutto: 87546, pricePerM2Netto: 82 },
  '251/14': { klasa: 'PRYWATNA', etap: 'II', size: 863, priceNetto: 70766, priceBrutto: 87042, pricePerM2Netto: 82 },
  '265/13': { klasa: 'FUNKCJONALNA', etap: 'II', size: 884, priceNetto: 67184, priceBrutto: 82636, pricePerM2Netto: 76 },
  '265/16': { klasa: 'PANORAMA', etap: 'II', size: 1332, priceNetto: 113220, priceBrutto: 139261, pricePerM2Netto: 85 },
  '265/15': { klasa: 'PANORAMA', etap: 'II', size: 1125, priceNetto: 95625, priceBrutto: 117619, pricePerM2Netto: 85 },
  '265/14': { klasa: 'PANORAMA', etap: 'II', size: 1125, priceNetto: 95625, priceBrutto: 117619, pricePerM2Netto: 85 },
  '265/32': { klasa: 'DROGOWA', size: 0 },
};

const ID_TO_GEODETIC = {
  1:'251/2', 2:'265/1', 3:'265/2', 4:'251/3', 5:'251/4', 6:'265/3', 7:'265/4', 8:'265/5', 9:'251/6', 10:'251/5',
  11:'251/7', 12:'265/6', 13:'265/7', 14:'251/8', 15:'251/9', 16:'265/8', 17:'265/9', 18:'251/10', 19:'251/11', 20:'265/10',
  21:'265/11', 22:'251/12', 23:'251/13', 24:'251/14', 25:'265/13', 26:'265/12', 27:'265/31', 28:'265/30', 29:'265/29', 30:'265/28',
  31:'265/27', 32:'265/26', 33:'265/25', 34:'265/24', 35:'265/23', 36:'265/22', 37:'265/21', 38:'265/20', 39:'265/19', 40:'265/18',
  41:'265/17', 42:'265/16', 43:'265/15', 44:'265/14', 45:'265/32'
};

const MASTERPLAN_GEOMETRY = {
  1: 'M 1765,601 L 1766,681 L 1950,680 L 1964,645 L 1964,637 L 1948,600 Z',
  2: 'M 1764,505 L 1765,597 L 1946,597 L 1909,505 Z',
  3: 'M 1761,505 L 1641,505 L 1635,518 L 1635,547 L 1644,561 L 1642,597 L 1761,597 Z',
  4: 'M 1761,601 L 1624,601 L 1623,681 L 1762,681 Z',
  5: 'M 1463,603 L 1464,683 L 1620,681 L 1620,602 Z',
  6: 'M 1464,507 L 1463,599 L 1597,598 L 1597,557 L 1604,547 L 1605,524 L 1596,508 Z',
  7: 'M 1317,522 L 1317,549 L 1325,561 L 1324,600 L 1460,599 L 1460,507 L 1325,506 Z',
  8: 'M 1145,508 L 1146,601 L 1279,600 L 1279,560 L 1287,548 L 1287,522 L 1279,509 Z',
  9: 'M 1145,605 L 1145,685 L 1301,684 L 1301,604 Z',
  10: 'M 1460,603 L 1305,604 L 1305,683 L 1459,683 Z',
  11: 'M 986,605 L 986,685 L 1141,684 L 1141,605 Z',
  12: 'M 1000,518 L 999,552 L 1006,563 L 1006,602 L 1142,601 L 1142,508 L 1009,507 Z',
  13: 'M 961,509 L 826,509 L 824,602 L 961,602 L 961,561 L 967,551 L 967,520 Z',
  14: 'M 982,606 L 825,606 L 823,686 L 982,685 Z',
  15: 'M 821,607 L 682,607 L 681,688 L 819,687 Z',
  16: 'M 701,511 L 694,524 L 695,551 L 702,565 L 701,603 L 821,602 L 822,509 Z',
  17: 'M 656,510 L 539,510 L 537,604 L 655,604 L 655,563 L 664,549 L 664,524 Z',
  18: 'M 678,608 L 538,608 L 537,688 L 677,688 Z',
  19: 'M 414,608 L 414,689 L 533,688 L 533,608 Z',
  20: 'M 433,513 L 428,521 L 428,553 L 435,564 L 436,605 L 534,604 L 534,510 L 444,510 Z',
  21: 'M 391,513 L 291,512 L 291,605 L 391,605 L 391,564 L 397,555 L 397,522 Z',
  22: 'M 410,609 L 292,609 L 292,690 L 410,689 Z',
  23: 'M 288,610 L 168,610 L 167,690 L 288,690 Z',
  24: 'M 47,611 L 46,691 L 163,691 L 164,610 Z',
  25: 'M 143,514 L 46,515 L 46,607 L 142,607 L 143,565 L 150,550 L 150,525 Z',
  26: 'M 186,525 L 185,554 L 192,570 L 192,606 L 288,605 L 287,512 L 195,512 Z',
  27: 'M 1492,410 L 1493,477 L 1640,475 L 1639,409 Z',
  28: 'M 1340,412 L 1341,478 L 1489,476 L 1488,410 Z',
  29: 'M 1264,328 L 1262,477 L 1336,478 L 1337,328 Z',
  30: 'M 1190,328 L 1189,478 L 1258,477 L 1260,328 Z',
  31: 'M 1117,328 L 1115,478 L 1186,478 L 1186,329 Z',
  32: 'M 1038,329 L 1037,479 L 1112,478 L 1113,329 Z',
  33: 'M 960,330 L 960,479 L 1032,479 L 1034,329 Z',
  34: 'M 956,329 L 882,330 L 881,479 L 956,479 Z',
  35: 'M 804,331 L 801,480 L 878,479 L 878,330 Z',
  36: 'M 723,331 L 722,480 L 796,480 L 800,332 Z',
  37: 'M 641,332 L 640,480 L 718,480 L 719,331 Z',
  38: 'M 559,332 L 558,481 L 636,480 L 637,332 Z',
  39: 'M 481,332 L 478,335 L 477,480 L 554,481 L 555,332 Z',
  40: 'M 474,333 L 397,333 L 395,481 L 474,480 Z',
  41: 'M 311,333 L 309,481 L 391,481 L 393,333 Z',
  42: 'M 226,334 L 224,481 L 306,481 L 307,333 Z',
  43: 'M 136,334 L 133,481 L 220,482 L 222,334 Z',
  44: 'M 46,335 L 46,511 L 128,511 L 132,334 Z',
  45: 'M 1906,497 L 1890,459 L 133,486 L 154,526 L 146,606 L 188,606 L 193,509 L 390,508 L 382,524 L 382,606 L 430,606 L 434,507 L 657,506 L 649,522 L 649,604 L 697,604 L 701,506 L 962,505 L 954,521 L 954,603 L 1002,603 L 1006,504 L 1279,504 L 1271,520 L 1271,602 L 1319,602 L 1322,503 L 1598,504 L 1590,520 L 1590,600 L 1638,600 L 1640,501 Z',
};

const STAGE_ONE_ORDER = ['251/4','251/5','251/6','251/7','251/8','265/3','265/4','265/5','265/6','265/7','265/23','265/24','265/25','265/26','265/27','265/28','265/29','265/30','265/31'];
const SEWERAGE = new Set(['251/3','251/4','251/5','251/6','265/3','265/4','265/5','265/31','265/30','265/29','265/28']);

function pointsFromPath(d){
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  const points = [];
  for(let i = 0; i < nums.length; i += 2){
    if(Number.isFinite(nums[i]) && Number.isFinite(nums[i + 1])) points.push([nums[i], nums[i + 1]]);
  }
  return points;
}

function geometryMetrics(d, rawId){
  const points = pointsFromPath(d);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);

  // Centroid wielokąta — daje stabilne i naturalne położenie numeru działki.
  let twiceArea = 0, cxAcc = 0, cyAcc = 0;
  for(let i = 0; i < points.length; i++){
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cxAcc += (x1 + x2) * cross;
    cyAcc += (y1 + y2) * cross;
  }
  let cx = (minX + maxX) / 2;
  let cy = (minY + maxY) / 2;
  if(Math.abs(twiceArea) > 0.001){
    cx = cxAcc / (3 * twiceArea);
    cy = cyAcc / (3 * twiceArea);
  }

  // W indeksie referencyjnym etykieta drogi była ustawiona ręcznie w czytelnym miejscu.
  if(rawId === 45){ cx = 1750; cy = 482; }

  return { points, cx, cy, bbox:{ x:minX, y:minY, width:maxX-minX, height:maxY-minY } };
}

function typeFromClass(klasa){
  if(klasa === 'PANORAMA' || klasa === 'PARK') return 'panorama';
  if(klasa === 'PRYWATNA') return 'kameralna';
  return 'funkcjonalna';
}
function typeLabel(type){
  return type === 'panorama' ? 'Panorama' : type === 'kameralna' ? 'Kameralna' : 'Funkcjonalna';
}
function statusFor(data){
  if(data.klasa === 'DROGOWA' || data.klasa === 'PARK' || data.klasa === 'INWESTYCYJNA') return 'common';
  if(data.etap === 'II') return 'stage2';
  return 'available';
}
function statusLabel(status){
  if(status === 'available') return 'Dostępna';
  if(status === 'stage2') return 'Etap II';
  return 'Teren wspólny';
}

export const PLOTS = Object.entries(ID_TO_GEODETIC).map(([rawIdText, id]) => {
  const rawId = Number(rawIdText);
  const data = PLOT_DATA_MAPPING[id] || {};
  const d = MASTERPLAN_GEOMETRY[rawId];
  const metrics = geometryMetrics(d, rawId);
  const type = typeFromClass(data.klasa);
  const status = statusFor(data);
  return {
    rawId,
    id,
    ...data,
    ...metrics,
    d,
    type,
    typeLabel:typeLabel(type),
    status,
    statusLabel:statusLabel(status),
    sellable:status !== 'common',
    sewerage:SEWERAGE.has(id),
  };
});

export const SELLABLE_PLOTS = PLOTS.filter(p => p.sellable).sort((a,b) => {
  const stageCmp = (a.etap || '').localeCompare(b.etap || '');
  if(stageCmp) return stageCmp;
  const [a1,a2] = a.id.split('/').map(Number);
  const [b1,b2] = b.id.split('/').map(Number);
  return a1 - b1 || a2 - b2;
});

export const DEFAULT_PLOT_ID = STAGE_ONE_ORDER.find(id => SELLABLE_PLOTS.some(p => p.id === id)) || SELLABLE_PLOTS[0]?.id;

export const PLOT_PHOTOS = {
  panorama:'/assets/plot-panorama.jpg',
  kameralna:'/assets/plot-kameralna.jpg',
  funkcjonalna:'/assets/plot-funkcjonalna.jpg',
};

// Ten sam podkład, który znajduje się w dostarczonym index (1).html / poprzednim masterplanie.
// W paczce zachowujemy lokalny fallback, ale online aplikacja korzysta z właściwego zdjęcia 2013×1019.
export const MASTERPLAN_BACKGROUND_URL = '/assets/masterplan-map.jpg';
export const MASTERPLAN_BACKGROUND_FALLBACK = '/assets/hero-bg.jpg';
export const MASTERPLAN_VIEWBOX = '0 0 2013 1019';

export const formatPLN = (value) => value == null ? '—' : `${new Intl.NumberFormat('pl-PL').format(value)} zł`;
export const formatArea = (value) => value == null ? '—' : `${new Intl.NumberFormat('pl-PL').format(value)} m²`;
