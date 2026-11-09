// SlopeDraw - a hillside from the side, for SlopeLoadScene and SlideTriggerScene. No real place. Nothing here is a scene.
import { art, svgRock, svgSoil, svgTree, svgGrass, svgBoulder, seeded, polyD, under, n1, INK, SNOW } from '../L08/LandDraw.js';

/** Layout of a slope in a world W by H. steep: 0 gentle, 1 steep. cut: a road cut at the foot. */
export function slopeOf(W, H, o = {}) {
  const road = H * 0.84, toe = W * (o.cut ? 0.66 : 0.78), rise = H * (o.steep ? 0.68 : 0.36), top = road - rise;
  const cutH = o.cut ? H * 0.17 : 0;
  // ground line: from the top left to the shoulder of the cut, straight down the cut, along the road
  const sh = o.cut ? [toe - W * 0.03, road - cutH] : [toe, road];
  const yAt = (x) => (x >= sh[0] ? (o.cut && x < toe ? sh[1] + (x - sh[0]) / (toe - sh[0]) * cutH : road) : top + (x / sh[0]) * (sh[1] - top));
  return { W, H, road, toe, top, sh, cutH, yAt, steep: !!o.steep, cut: !!o.cut };
}
/** Rock and soil. soak 0..1 darkens the soil from the top down. loose: scatter rock. */
export function slopeBody(L, o = {}) {
  const { W, H, road, toe, top, sh } = L, ground = [[-10, top - (10 / sh[0]) * (sh[1] - top)], sh, [toe, road], [W + 10, road], [W + 10, H + 10], [-10, H + 10]];
  let s = svgRock(ground, { seed: 5, bands: ['slate', 'rockDark', 'rock'], bandH: 34, dip: 14, warp: 3, cracks: 6 });
  const th = H * 0.12, soil = [[-10, ground[0][1]], sh, [sh[0] - 14, sh[1] + th * 0.5], [-10, ground[0][1] + th]];
  s += svgSoil(soil, { seed: 3, stones: 7, top: 8 });
  if (o.soak) s += `<path d="${polyD(soil, true)}" style="fill:${art('seaDeep')};opacity:${n1(0.42 * o.soak)}"/>`;
  s += `<rect x="${n1(toe)}" y="${n1(road)}" width="${n1(W - toe + 10)}" height="12" style="fill:${art('slateDark')}"/>`;
  s += `<path d="M${n1(toe + 12)} ${n1(road + 6)}H${W}" style="stroke:${SNOW};stroke-width:3;stroke-dasharray:14 12"/>`;
  return s;
}
export function trees(L, n = 4, o = {}) {
  let s = '';
  for (let i = 0; i < n; i++) { const x = L.sh[0] * (0.12 + i * (0.78 / n)); s += svgTree(x, L.yAt(x) + 4, o.k ?? 0.9, { kind: i % 2 ? 'pine' : 'round', seed: i + 3 }); }
  return s;
}
export function looseRocks(L, n = 7, dx = 0) {
  const r = seeded(6); let s = '';
  for (let i = 0; i < n; i++) { const x = L.sh[0] * (0.2 + r() * 0.74) + dx * (0.5 + r() * 0.5); s += svgBoulder(x, L.yAt(x) + 5, 0.34 + r() * 0.3, { seed: i + 2 }); }
  return s;
}
/** The drain: a channel at the foot of the cut, open or blocked with mud. */
export function drain(L, blocked) {
  const x = L.toe + 2, y = L.road;
  return `<rect x="${n1(x)}" y="${n1(y - 2)}" width="26" height="14" rx="4" style="fill:${blocked ? art('soilDark') : art('sea')};stroke:${INK};stroke-width:2.5"/>`;
}
/** Slide: f 0..1. Soil leaves the top of the cut, a scar stays, a heap lies across the road. */
export function slideHeap(L, f) {
  const { sh, road, toe, W } = L, ex = toe + (W - toe) * 0.72 * f, h = 62 * f;
  const scar = `<path d="${polyD([[sh[0] * 0.5, L.yAt(sh[0] * 0.5)], sh, [sh[0] - 14, sh[1] + 40], [sh[0] * 0.56, L.yAt(sh[0] * 0.5) + 30]], true)}" style="fill:${art('rockDeep')};opacity:${n1(0.75 * f)}"/>`;
  const heap = svgSoil(under((x) => road - h * Math.sin(Math.min(1, Math.max(0, (x - toe + 40) / (ex - toe + 40))) * Math.PI) ** 0.7 - 3, toe - 40, ex + 4, road + 3, 6), { seed: 8, stones: 9, top: 6 });
  let b = '';
  const r = seeded(9);
  for (let i = 0; i < 8; i++) { const x = toe + r() * (ex - toe) * 0.86; b += svgBoulder(x, road - r() * h * 0.55, 0.4 + r() * 0.5, { seed: i + 3 }); }
  return scar + heap + b;
}
export { svgGrass };
