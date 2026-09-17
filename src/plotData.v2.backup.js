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

const RAW_POINTS = {
  1:[[1951,680],[1966,641],[1949,601],[1766,601],[1767,681]],
  2:[[1947,597],[1909,505],[1765,506],[1766,597]],
  3:[[1761,598],[1760,505],[1643,505],[1636,519],[1636,545],[1646,563],[1643,598]],
  4:[[1761,601],[1762,681],[1624,682],[1624,602]],
  5:[[1621,602],[1619,682],[1464,683],[1464,603]],
  6:[[1465,509],[1596,509],[1605,524],[1604,546],[1597,556],[1598,599],[1464,600]],
  7:[[1459,600],[1459,509],[1325,508],[1319,522],[1318,550],[1326,562],[1326,600]],
  8:[[1279,600],[1278,559],[1287,548],[1287,524],[1277,509],[1146,508],[1147,601]],
  9:[[1146,605],[1301,604],[1302,684],[1146,684]],
  10:[[1459,682],[1459,603],[1306,604],[1306,684]],
  11:[[1142,685],[1141,605],[986,606],[986,686]],
  12:[[1141,601],[1141,509],[1009,509],[1001,520],[1000,551],[1009,565],[1006,602]],
  13:[[961,603],[961,561],[968,549],[968,523],[960,509],[826,510],[825,603]],
  14:[[981,607],[982,685],[825,687],[825,607]],
  15:[[819,687],[820,607],[683,608],[682,688]],
  16:[[820,603],[821,510],[704,510],[696,524],[696,549],[705,568],[702,603]],
  17:[[655,604],[654,563],[663,549],[663,525],[655,511],[539,511],[539,605]],
  18:[[678,688],[677,609],[539,609],[537,689]],
  19:[[533,689],[533,609],[414,609],[415,689]],
  20:[[533,605],[534,512],[436,511],[429,523],[430,554],[437,565],[437,605]],
  21:[[391,606],[391,563],[398,554],[397,522],[389,512],[292,513],[292,605]],
  22:[[411,689],[292,690],[292,611],[410,609]],
  23:[[287,691],[287,610],[169,611],[169,691]],
  24:[[164,691],[165,611],[48,611],[48,691]],
  25:[[47,607],[47,515],[141,515],[150,527],[149,551],[142,567],[142,607]],
  26:[[193,607],[194,571],[187,555],[187,527],[195,513],[287,512],[287,605]],
  27:[[1641,476],[1639,410],[1493,411],[1494,477]],
  28:[[1488,477],[1488,411],[1341,412],[1342,478]],
  29:[[1337,477],[1336,329],[1265,329],[1263,478]],
  30:[[1259,478],[1260,329],[1190,329],[1190,479]],
  31:[[1185,479],[1185,329],[1117,329],[1116,479]],
  32:[[1111,479],[1113,329],[1038,329],[1037,479]],
  33:[[1033,479],[1034,329],[960,330],[962,479]],
  34:[[956,479],[956,330],[883,331],[882,480]],
  35:[[877,480],[879,331],[805,331],[802,479]],
  36:[[797,480],[799,331],[724,331],[723,479]],
  37:[[717,480],[719,331],[642,332],[641,481]],
  38:[[636,480],[638,332],[560,332],[559,480]],
  39:[[553,480],[555,332],[481,333],[479,480]],
  40:[[473,481],[475,333],[398,333],[396,481]],
  41:[[391,481],[393,333],[312,333],[311,482]],
  42:[[305,482],[307,333],[227,334],[226,482]],
  43:[[220,482],[222,335],[137,334],[135,482]],
  44:[[129,511],[132,335],[47,336],[48,510]],
  45:[[1644,464],[1890,460],[1908,501],[1644,502]],
};

const STAGE_ONE_ORDER = ['251/4','251/5','251/6','251/7','251/8','265/3','265/4','265/5','265/6','265/7','265/23','265/24','265/25','265/26','265/27','265/28','265/29','265/30','265/31'];
const SEWERAGE = new Set(['251/3','251/4','251/5','251/6','265/3','265/4','265/5','265/31','265/30','265/29','265/28']);

const sx = 1024 / 2013;
const sy = 518 / 1019;

function scaledPoints(points){
  return points.map(([x,y]) => [Math.round(x * sx), Math.round(y * sy)]);
}
function pathFromPoints(points){
  const p = scaledPoints(points);
  return p.map(([x,y],i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z';
}
function centerFromPoints(points){
  const p = scaledPoints(points);
  const xs = p.map(([x]) => x), ys = p.map(([,y]) => y);
  return { cx:(Math.min(...xs)+Math.max(...xs))/2, cy:(Math.min(...ys)+Math.max(...ys))/2 };
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

export const PLOTS = Object.entries(ID_TO_GEODETIC).map(([rawId, id]) => {
  const data = PLOT_DATA_MAPPING[id] || {};
  const points = RAW_POINTS[rawId];
  const center = centerFromPoints(points);
  const type = typeFromClass(data.klasa);
  const status = statusFor(data);
  return {
    rawId:Number(rawId),
    id,
    ...data,
    ...center,
    d:pathFromPoints(points),
    points:scaledPoints(points),
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

export const MASTERPLAN_VIEWBOX = '0 0 1024 518';

export const formatPLN = (value) => value == null ? '—' : `${new Intl.NumberFormat('pl-PL').format(value)} zł`;
export const formatArea = (value) => value == null ? '—' : `${new Intl.NumberFormat('pl-PL').format(value)} m²`;
