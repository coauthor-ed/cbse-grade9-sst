// KarstDraw - one limestone hill in cutaway, and small parts: shared by the L09 scenes. Generic rock: no real
// place is claimed. Limestone is pale, beds nearly level, joints upright. Nothing here is a scene.
import { art, svgRock, svgSoil, svgGrass, svgTree, svgWater, polyD, n1, INK, under } from '../L08/LandDraw.js';

/** The hill's top at x: a flat plateau, a sinkhole bowl, a slope down to a valley floor. */
export function hillTop(x, W, H, o = {}) {
  const plat = H * 0.26, foot = H * 0.84, s0 = W * 0.6, s1 = W * 0.9;
  let y = plat;
  if (x > s0) { const u = Math.min(1, (x - s0) / (s1 - s0)); y = plat + (foot - plat) * (0.5 - 0.5 * Math.cos(u * Math.PI)); }
  if (o.sink !== false) { const q = (x - W * 0.28) / (W * 0.1); if (Math.abs(q) < 1) y += (1 - q * q) ** 1.5 * H * 0.11; }
  return y;
}
/** Limestone body, soil skin, grass. */
export function hill(W, H, o = {}) {
  const top = (x) => hillTop(x, W, H, o);
  let s = svgRock(under(top, -10, W + 10, H + 10, 8), { seed: 5, bands: ['sandLit', 'rockLit', 'sandLit', 'rockLit'], bandH: 46, dip: 1, warp: 3, cracks: 6 });
  const skin = under(top, -10, W + 10, 0, 8).slice(0, -2);
  s += svgSoil([...skin, ...skin.slice().reverse().map(([x, y]) => [x, y + 15])], { seed: 3, top: 7 });
  if (o.sink === false) s += svgGrass(4, top(4), W * 0.56, top(W * 0.56), { seed: 2, n: 15 });
  else s += svgGrass(4, top(4), W * 0.16, top(W * 0.16), { seed: 2, n: 5 }) + svgGrass(W * 0.4, top(W * 0.4), W * 0.56, top(W * 0.56), { seed: 3, n: 6 });
  return s;
}
export const routePts = (W, H) => [[W * 0.28, H * 0.37], [W * 0.3, H * 0.5], [W * 0.46, H * 0.6], [W * 0.62, H * 0.68], [W * 0.76, H * 0.76], [W * 0.88, H * 0.84]];
const thru = (pts) => { let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`; for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += `Q${n1(pts[i][0])} ${n1(pts[i][1])} ${n1(m[0])} ${n1(m[1])}`; } const e = pts[pts.length - 1]; return `${d}L${n1(e[0])} ${n1(e[1])}`; };
export const routeD = (W, H) => thru(routePts(W, H));
/** The dark passage and chamber through the hill. */
export function passage(W, H) {
  return `<path d="${routeD(W, H)}" style="fill:none;stroke:${art('rockDeep')};stroke-width:${n1(Math.max(26, W * 0.06))};stroke-linecap:round"/>`
    + `<ellipse cx="${n1(W * 0.46)}" cy="${n1(H * 0.6)}" rx="${n1(W * 0.15)}" ry="${n1(H * 0.09)}" style="fill:${art('rockDeep')}"/>`;
}
/** Water along the route, from fraction a to b of its length. */
export function routeWater(W, H, a, b, o = {}) {
  return `<path d="${routeD(W, H)}" pathLength="1" style="fill:none;stroke:${o.col ?? art('sea')};stroke-width:${o.w ?? 11};stroke-linecap:round;stroke-dasharray:${n1((b - a) * 1000) / 1000} 2;stroke-dashoffset:${-a}"/>`;
}
/** A stalactite hanging from (x, y), length l, base half width w. */
export function stalactite(x, y, l, w) {
  return `<path d="M${n1(x - w)} ${n1(y)}Q${n1(x - w * 0.3)} ${n1(y + l * 0.5)} ${n1(x)} ${n1(y + l)}Q${n1(x + w * 0.3)} ${n1(y + l * 0.5)} ${n1(x + w)} ${n1(y)}Z" style="fill:${art('sandLit')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/>`;
}
/** A stalagmite rising from (x, y), height l, base half width w: rounder than a stalactite. */
export function stalagmite(x, y, l, w) {
  return `<path d="M${n1(x - w)} ${n1(y)}C${n1(x - w * 0.8)} ${n1(y - l * 0.6)} ${n1(x - w * 0.3)} ${n1(y - l)} ${n1(x)} ${n1(y - l)}C${n1(x + w * 0.3)} ${n1(y - l)} ${n1(x + w * 0.8)} ${n1(y - l * 0.6)} ${n1(x + w)} ${n1(y)}Z" style="fill:${art('sandLit')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/>`;
}
export { svgTree, svgWater, polyD };
