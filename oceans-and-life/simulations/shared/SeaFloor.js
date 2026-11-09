// SeaFloor.js - one sea-floor section, used by every relief scene: left to right a continent, shelf,
// slope, rise, plain, seamount, abyssal hill, volcanic island, mid-ocean ridge with its rift valley,
// trench, submarine canyon and the far continent, on a band of magma. Depths are not to scale: say so
// on the figure. General: later geography modules can reuse it.
//
//   floorDepth(x)            depth below sea level in section units at x (0..1000); negative is land above the sea
//   FEATURES                 [{ id, name, x, from, to }] in that order
//   featureAt(x)             the feature under x
//   mapper(box)              box = { x, y, w, h, seaY }: { X(x), Y(depth), xOf(px), base } section to screen.
//                            o.stretch multiplies depth on screen; the magma band sits under box.y + box.h
//   floorPts(box, o)         screen points of the floor, step o.step (default 8 section units)
//   floorPrims(box, o)       the drawing as a primitive list: rock in layers that follow the floor, sand on the
//                            shelf, magma below and rising under the ridge and the island.
//                            o.magma (true), o.layers (4), o.from, o.to (section x range, default all)
//                            o.island false: this line has no volcanic island (floorDepth takes the same option)
//   drawSeaFloor(ctx, c, box, o) / svgSeaFloor(box, o)
//   waterPts(box, o)         the water body as a closed polygon, for clipping: floor to sea level
//   madeUpMetres(x)          a made-up depth in m for a game's sonar, marked made-up on screen. Not real.
//
// The floor is smooth by construction: floorDepth blends section points with a cosine, so slopes read at
// any width. Keep the colours here: rock is rock and sand is sand.
import { drawPrims, svgPrims, pathLine as line, blend as m } from './SeaArt.js';

// x, depth (positive down; 0 sea level). Land rises above the sea at the ends.
const POINTS = [
  [0, -26], [44, -22], [78, -4], [92, 2], [130, 6], [185, 11], [204, 14], [232, 44], [262, 72], [296, 82], [340, 88], [392, 90], [432, 89],
  [452, 74], [474, 30], [496, 74], [516, 89], [534, 84], [548, 68], [562, 84], [580, 88], [596, 62], [612, 28], [622, 4], [628, -14], [636, 4], [646, 28], [660, 62], [676, 82],
  [706, 58], [730, 36], [744, 34], [752, 52], [760, 52], [768, 34], [784, 38], [810, 64], [832, 84], [850, 104], [866, 134], [880, 138], [894, 110], [908, 84],
  [920, 74], [930, 86], [938, 60], [950, 16], [962, 4], [974, -6], [1000, -24],
];
/** o.island false: the line with no volcanic island, as across the Arabian Sea (low hills stand in its place). */
export function floorDepth(x, o = {}) {
  if (o.island === false && x > 576 && x < 678) { const u = (x - 576) / 102; return 86 - 6 * Math.sin(u * Math.PI) ** 2 + 3 * Math.sin(u * 19); }
  const p = POINTS, k = Math.max(p[0][0], Math.min(p[p.length - 1][0], x));
  for (let i = 1; i < p.length; i++) {
    const [x0, d0] = p[i - 1], [x1, d1] = p[i];
    if (k <= x1) { const u = (k - x0) / (x1 - x0), v = (1 - Math.cos(u * Math.PI)) / 2; return d0 + (d1 - d0) * v; }
  }
  return p[p.length - 1][1];
}
export const FEATURES = [
  { id: 'continent', name: 'Continent', x: 40, from: 0, to: 86 },
  { id: 'shelf', name: 'Continental shelf', x: 145, from: 86, to: 204 },
  { id: 'slope', name: 'Continental slope', x: 232, from: 204, to: 262 },
  { id: 'rise', name: 'Continental rise', x: 298, from: 262, to: 340 },
  { id: 'plain', name: 'Abyssal plain', x: 386, from: 340, to: 432 },
  { id: 'seamount', name: 'Seamount', x: 474, from: 432, to: 516 },
  { id: 'hill', name: 'Abyssal hill', x: 548, from: 516, to: 580 },
  { id: 'island', name: 'Volcanic island', x: 628, from: 580, to: 676 },
  { id: 'ridge', name: 'Mid-ocean ridge', x: 716, from: 676, to: 810 },
  { id: 'rift', name: 'Rift valley', x: 756, from: 746, to: 766 },
  { id: 'trench', name: 'Trench', x: 873, from: 832, to: 908 },
  { id: 'canyon', name: 'Submarine canyon', x: 930, from: 912, to: 946 },
  { id: 'far', name: 'Continent', x: 985, from: 962, to: 1000 },
];
export const featureAt = (x) => FEATURES.find((f) => f.id === 'rift' && x >= f.from && x <= f.to) ?? FEATURES.find((f) => x >= f.from && x <= f.to) ?? null;
export function mapper(box, o = {}) {
  const magma = o.magma === false ? 0 : Math.max(16, box.h * 0.09), base = box.y + box.h - magma;
  const k = (base - 8 - box.seaY) / 140 * (o.stretch ?? 1);
  const X = (x) => box.x + x / 1000 * box.w, Y = (d) => box.seaY + d * k, xOf = (px) => (px - box.x) / box.w * 1000;
  return { X, Y, xOf, base, k, magma };
}
export function floorPts(box, o = {}) {
  const mp = mapper(box, o), p = [], a = o.from ?? 0, b = o.to ?? 1000, st = o.step ?? 8;
  for (let x = a; x <= b + 0.1; x += st) p.push([mp.X(x), Math.min(mp.base - 2, mp.Y(floorDepth(x, o)))]);
  return p;
}
export function waterPts(box, o = {}) {
  const pts = floorPts(box, o), sy = box.seaY, out = [];
  for (const [x, y] of pts) out.push([x, Math.max(y, sy)]);
  return [[pts[0][0], sy], ...out, [pts[pts.length - 1][0], sy]];
}
export function floorPrims(box, o = {}) {
  const mp = mapper(box, o), pts = floorPts(box, o), x0 = pts[0][0], x1 = pts[pts.length - 1][0], bot = box.y + box.h, n = o.layers ?? 4;
  const close = (top) => `${line(top)}L${x1} ${bot}L${x0} ${bot}Z`;
  const out = [{ d: close(pts), f: 'rockLit' }];
  const names = ['rock', 'rockMid', 'rockDark', 'rockDeep'];
  for (let i = 0; i < n; i++) {
    const u = (i + 1) / (n + 1) * 0.92, skin = 5 + 7 * i;
    const lay = pts.map(([x, y], j) => [x, Math.min(mp.base, y + skin + (mp.base - y) * u + Math.sin(j * 0.33 + i) * 1.6)]);
    out.push({ d: close(lay), f: names[Math.min(i, 3)] });
  }
  // A skin of sand on the shelf and the flat plain, soft mud on the rise.
  const skin = (a, b, t) => {
    const top = pts.filter(([x]) => x >= mp.X(a) && x <= mp.X(b));
    if (top.length < 2) return null;
    const under = top.map(([x, y], j) => [x, y + t * Math.sin(Math.min(1, j / 2) * Math.PI / 2) * Math.sin(Math.min(1, (top.length - 1 - j) / 2) * Math.PI / 2)]).reverse();
    return { d: `${line(top)}L${under.map((q) => `${q[0]} ${q[1]}`).join('L')}Z`, f: 'sand' };
  };
  for (const [a, b, t] of [[84, 210, 7], [262, 436, 5], [516, 534, 3], [562, 584, 3]]) { const q = skin(a, b, t); if (q && a >= (o.from ?? 0) && b <= (o.to ?? 1000)) out.push(q); }
  if (o.magma !== false) {
    const wob = []; for (let x = x0; x <= x1 + 0.1; x += Math.max(8, (x1 - x0) / 40)) wob.push([x, mp.base + Math.sin(x * 0.03) * 2.2]);
    out.push({ d: `${line(wob)}L${x1} ${bot}L${x0} ${bot}Z`, f: 'liquid' });
    out.push({ d: `${line(wob.map(([x, y]) => [x, y + 5]))}L${x1} ${bot}L${x0} ${bot}Z`, f: 'sunRay', a: 0.5 });
    // Feeders rising under the ridge's rift and the volcanic island.
    const rise = (sx, w, topOff) => { const bx = mp.X(sx), hw = w / 1000 * box.w, ty = mp.Y(floorDepth(sx, o)) + topOff; return { d: `M${bx - hw} ${mp.base + 2}Q${bx - hw * 0.34} ${(mp.base * 2 + ty) / 3} ${bx - 1.5} ${ty}L${bx + 1.5} ${ty}Q${bx + hw * 0.34} ${(mp.base * 2 + ty) / 3} ${bx + hw} ${mp.base + 2}Z`, f: 'liquid' }; };
    if ((o.from ?? 0) <= 628 && (o.to ?? 1000) >= 628 && o.island !== false) out.push(rise(628, 22, (mp.base - mp.Y(floorDepth(628))) * 0.34));
    if ((o.from ?? 0) <= 756 && (o.to ?? 1000) >= 756) out.push(rise(756, 26, 12));
  }
  return out;
}
export const drawSeaFloor = (ctx, c, box, o = {}) => drawPrims(ctx, c, floorPrims(box, o));
export const svgSeaFloor = (box, o = {}) => svgPrims(floorPrims(box, o));
/** Made-up metres for a sonar game: plain about 4,400 m. Never present as real. */
export const madeUpMetres = (x) => Math.round(floorDepth(x) * 50 / 10) * 10;
