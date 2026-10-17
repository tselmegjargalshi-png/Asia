/**
 * Coarse, hand-authored continent outlines (lon, lat) used to sample a dotted
 * globe. Deliberately low resolution: the globe is an abstract sculpture, not a map.
 */
type Poly = [number, number][];

const EURASIA: Poly = [
  [-9, 43], [-9, 37], [-5, 36], [0, 38], [3, 43], [8, 44], [10, 44], [12, 42], [16, 38], [18, 40], [14, 42], [13, 45],
  [15, 45], [19, 42], [20, 39], [23, 37], [24, 40], [27, 37], [30, 36], [36, 36], [35, 32], [35, 28], [39, 22], [43, 13],
  [52, 16], [57, 19], [59, 23], [56, 26], [51, 25], [48, 30], [50, 30], [56, 27], [61, 25], [67, 24], [70, 21], [73, 16],
  [77, 8], [80, 11], [80, 16], [87, 21], [91, 22], [94, 17], [98, 16], [98, 9], [101, 3], [104, 1.5], [103, 5], [100, 13],
  [105, 9], [109, 12], [108, 16], [106, 20], [110, 21], [117, 23], [120, 27], [122, 31], [121, 35], [119, 37], [122, 40],
  [121, 41], [126, 38], [126, 35], [129, 35], [129, 38], [128, 40], [130, 43], [135, 44], [141, 48], [140, 53], [135, 55],
  [141, 59], [150, 59], [156, 57], [156, 51], [160, 54], [163, 59], [170, 60], [180, 65], [180, 69], [170, 70], [160, 70],
  [150, 71], [140, 72], [130, 71], [120, 73], [113, 74], [105, 77], [95, 76], [80, 73], [70, 73], [68, 69], [60, 69],
  [55, 68], [45, 68], [40, 66], [33, 69], [25, 71], [15, 68], [10, 63], [5, 61], [5, 58], [8, 57], [10, 59], [12, 56],
  [9, 55], [8, 54], [4, 52], [2, 51], [-2, 48], [-5, 48], [-1, 46], [-2, 43], [-9, 43],
];
const AFRICA: Poly = [
  [-17, 21], [-17, 15], [-15, 11], [-8, 4], [-2, 5], [5, 6], [9, 4], [10, -2], [12, -6], [13, -12], [12, -18], [15, -27],
  [18, -34], [20, -35], [26, -34], [32, -29], [35, -24], [35, -18], [40, -15], [40, -10], [39, -5], [43, 0], [51, 11],
  [44, 11], [43, 13], [39, 16], [36, 22], [34, 27], [32, 31], [25, 32], [20, 31], [15, 32], [11, 34], [10, 37], [3, 37],
  [-2, 35], [-6, 36], [-10, 30], [-13, 27], [-17, 21],
];
const NORTH_AMERICA: Poly = [
  [-168, 66], [-162, 70], [-156, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 70], [-80, 63],
  [-90, 57], [-82, 52], [-79, 55], [-77, 60], [-70, 58], [-62, 58], [-56, 52], [-60, 47], [-66, 44], [-70, 42], [-74, 40],
  [-76, 36], [-81, 31], [-80, 26], [-82, 26], [-84, 30], [-89, 30], [-94, 29], [-97, 26], [-97, 21], [-94, 18], [-90, 21],
  [-87, 21], [-88, 16], [-84, 15], [-83, 10], [-79, 9], [-77, 8], [-80, 7], [-85, 10], [-91, 14], [-96, 16], [-105, 20],
  [-106, 23], [-112, 29], [-110, 23], [-115, 30], [-117, 33], [-121, 35], [-124, 40], [-124, 46], [-125, 50], [-130, 55],
  [-138, 59], [-148, 60], [-152, 58], [-158, 57], [-165, 55], [-160, 59], [-165, 62], [-168, 66],
];
const GREENLAND: Poly = [[-73, 78], [-60, 82], [-30, 83], [-20, 80], [-20, 72], [-25, 70], [-40, 65], [-43, 60], [-50, 62], [-55, 68], [-60, 75], [-73, 78]];
const SOUTH_AMERICA: Poly = [
  [-80, 9], [-75, 11], [-72, 12], [-62, 11], [-55, 6], [-50, 2], [-48, -1], [-40, -3], [-35, -6], [-35, -9], [-39, -14],
  [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-62, -41], [-65, -46], [-68, -51], [-72, -54], [-75, -50], [-74, -42],
  [-72, -30], [-71, -18], [-76, -14], [-81, -6], [-80, -2], [-78, 2], [-77, 7], [-80, 9],
];
const AUSTRALIA: Poly = [
  [114, -22], [114, -34], [118, -35], [124, -33], [131, -31], [135, -34], [138, -35], [141, -38], [147, -39], [150, -37],
  [153, -31], [153, -25], [146, -19], [145, -15], [142, -11], [141, -17], [136, -12], [131, -11], [126, -14], [122, -18], [114, -22],
];
const ISLANDS: Poly[] = [
  [[130, 31], [131, 34], [135, 34], [140, 35], [141, 38], [142, 41], [140, 41], [139, 38], [136, 37], [133, 35], [130, 33]],
  [[140, 42], [145, 43], [145, 44], [142, 45.5], [140, 43]],
  [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 57], [-4, 58.6], [-6, 57], [-5, 55], [-3, 54], [-5, 52], [-5, 50]],
  [[-10, 52], [-6, 52], [-6, 55], [-8, 55], [-10, 54]],
  [[95, 5], [98, 4], [104, -2], [106, -6], [102, -4], [97, 1]],
  [[109, 1], [110, -3], [116, -4], [119, 1], [117, 7], [113, 3]],
  [[105, -6], [114, -7], [114, -8.5], [106, -7]],
  [[119, -5], [121, -1], [124, 1], [121, -2], [122, -5]],
  [[131, -1], [141, -3], [150, -10], [143, -9], [138, -8], [132, -4]],
  [[120, 18], [122, 18], [124, 13], [126, 7], [122, 7], [120, 14]],
  [[120, 22], [122, 25], [121, 25.3], [120, 23]],
  [[80, 6], [82, 7], [80, 10]],
  [[172, -34], [178, -38], [175, -41], [168, -46], [167, -45], [172, -41]],
  [[-24, 64], [-14, 64], [-14, 66], [-22, 66.5]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
];

const POLYS: Poly[] = [EURASIA, AFRICA, NORTH_AMERICA, GREENLAND, SOUTH_AMERICA, AUSTRALIA, ...ISLANDS];

function inPoly(lon: number, lat: number, poly: Poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function isLand(lon: number, lat: number) {
  if (lat < -72) return true; // Antarctic band
  for (const p of POLYS) if (inPoly(lon, lat, p)) return true;
  return false;
}

export type City = { name: string; lat: number; lon: number; code: string };

export const CITIES: City[] = [
  { name: "Tokyo", code: "TYO", lat: 35.68, lon: 139.69 },
  { name: "Seoul", code: "SEL", lat: 37.57, lon: 126.98 },
  { name: "Singapore", code: "SIN", lat: 1.35, lon: 103.82 },
  { name: "Hong Kong", code: "HKG", lat: 22.32, lon: 114.17 },
  { name: "Bangkok", code: "BKK", lat: 13.76, lon: 100.5 },
  { name: "Ulaanbaatar", code: "ULN", lat: 47.89, lon: 106.91 },
  { name: "Dubai", code: "DXB", lat: 25.2, lon: 55.27 },
  { name: "London", code: "LON", lat: 51.51, lon: -0.13 },
  { name: "New York", code: "NYC", lat: 40.71, lon: -74.01 },
];

export const ROUTES: [string, string][] = [
  ["Tokyo", "Seoul"],
  ["Seoul", "Ulaanbaatar"],
  ["Ulaanbaatar", "Hong Kong"],
  ["Hong Kong", "Singapore"],
  ["Singapore", "Bangkok"],
  ["Bangkok", "Hong Kong"],
  ["Tokyo", "Hong Kong"],
  ["Tokyo", "Singapore"],
  ["Singapore", "Dubai"],
  ["Hong Kong", "Dubai"],
  ["Dubai", "London"],
  ["London", "New York"],
  ["Tokyo", "New York"],
  ["Ulaanbaatar", "London"],
];

/** lat/lon (degrees) to a point on a sphere of radius r (Three.js, y-up). */
export function latLonToVec(lat: number, lon: number, r: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

/** Evenly distributed points on a unit sphere, split into land and ocean sets. */
export function sampleGlobe(count: number) {
  const land: number[] = [];
  const ocean: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = golden * i;
    const x = Math.cos(t) * rad;
    const z = Math.sin(t) * rad;
    const lat = (Math.asin(y) * 180) / Math.PI;
    // invert latLonToVec: x = -sinφ cosθ, z = sinφ sinθ
    let lon = (Math.atan2(z, -x) * 180) / Math.PI - 180;
    if (lon < -180) lon += 360;
    if (isLand(lon, lat)) land.push(x, y, z);
    else if (i % 5 === 0) ocean.push(x, y, z);
  }
  return { land: new Float32Array(land), ocean: new Float32Array(ocean) };
}
