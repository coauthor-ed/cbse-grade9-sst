// CoastSection - one made-up low coast cut across from the sea to the land, for the storm surge scene, the
// game and the early warning flow. Heights are made up and say so. Ground rises from the shoreline; water
// at height h stands flat and reaches inland to where the ground is h. Helper, not a scene.
import { sky, tx, windArrow } from '../L04/SeaDraw.js';
import { svgHut, svgPalm, svgSeaColumn } from '../shared/SeaArt.js';

/** Village, its ground height in metres above sea level, its place along the land (0 shore, 1 far end). */
export const VILLAGES = [
  { id: 'A', h: 0.8, at: 0.09 }, { id: 'B', h: 1.6, at: 0.25 }, { id: 'C', h: 2.6, at: 0.42 }, { id: 'D', h: 3.6, at: 0.58 }, { id: 'E', h: 5.0, at: 0.75 },
];
const TOP_M = 6;
/** Ground height in metres at u (0 shore, 1 far end): straight lines through the villages. */
export function groundAt(u) {
  const pts = [[0, 0], ...VILLAGES.map((v) => [v.at, v.h]), [1, 5.8]];
  for (let i = 1; i < pts.length; i++) if (u <= pts[i][0]) { const [a, b] = pts[i - 1], [c, d] = pts[i]; return b + (d - b) * (u - a) / (c - a); }
  return 5.8;
}
/** Where the ground reaches height h. */
export function shoreAt(h) {
  for (let u = 0; u <= 1; u += 0.005) if (groundAt(u) >= h) return u;
  return 1;
}
/** Layout: W, H, sea width, y of sea level, metres to px. */
export function layout(W, H, o = {}) {
  const seaW = o.seaW ?? W * 0.3, base = o.base ?? H - 26, y0 = o.y0 ?? H * 0.72, mPx = o.mPx ?? (y0 - (o.top ?? H * 0.26)) / TOP_M;
  return { W, H, seaW, base, y0, mPx, x: (u) => seaW + u * (W - seaW), y: (m) => y0 - m * mPx };
}
export function ground(L) {
  const p = [];
  for (let u = 0; u <= 1.001; u += 0.02) p.push(`${L.x(u).toFixed(1)} ${L.y(groundAt(u)).toFixed(1)}`);
  return `M0 ${L.base + 30}L${(L.seaW * 0.35).toFixed(1)} ${(L.base - 4).toFixed(1)}L${p.join('L')}L${L.W} ${L.base + 30}Z`;
}
function surface(L) {
  const p = [];
  for (let u = 0; u <= 1.001; u += 0.02) p.push(`${L.x(u).toFixed(1)} ${L.y(groundAt(u)).toFixed(1)}`);
  return `M${p.join('L')}`;
}
/** Sky, sea at level h, seabed and land. Land lies over the water, so water shows only above the ground. o.storm darkens the sky. */
export function coastSvg(L, h, o = {}) {
  const lvl = L.y(h), reach = L.x(shoreAt(h));
  let s = `<defs><clipPath id="csec"><rect width="${L.W}" height="${L.H}" rx="18"/></clipPath></defs><g clip-path="url(#csec)">`;
  s += `<rect width="${L.W}" height="${L.H}" style="fill:${sky(o.storm ? 'cloudDark' : 'sky')}"/>`;
  s += svgSeaColumn(0, lvl, 1, { w: reach, h: L.H - lvl, wave: 4, len: 70 });
  s += `<path d="${ground(L)}" style="fill:${sky('soil')};stroke:${sky('soilDark')};stroke-width:3"/>`;
  s += `<path d="${surface(L)}" style="fill:none;stroke:${sky('grass')};stroke-width:12;stroke-linecap:round"/>`;
  s += `<path d="M${L.seaW * 0.5} ${L.y0 + (L.base - L.y0) * 0.45}L${L.x(0)} ${L.y0}L${L.x(0.06)} ${L.y(groundAt(0.06))}" style="fill:none;stroke:${sky('sand')};stroke-width:13;stroke-linecap:round;stroke-linejoin:round"/>`;
  for (const [u, k] of [[0.17, 0.36], [0.34, 0.32], [0.5, 0.36], [0.67, 0.32]]) if (L.x(u) > reach) s += svgPalm(L.x(u), L.y(groundAt(u)), k * (o.palm ?? 1), { lean: 10 });
  if (h > 0.05) s += `<path d="M0 ${lvl.toFixed(1)}H${reach.toFixed(1)}" style="stroke:${sky('foam')};stroke-width:4"/>`;
  return s + '</g>';
}
/** The raised cyclone shelter, foot at (x, y). */
export function shelterSvg(x, y, k = 1) {
  return `<rect x="${x - 27 * k}" y="${y - 46 * k}" width="${54 * k}" height="${31 * k}" rx="4" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2.5"/><path d="M${x - 30 * k} ${y - 46 * k}L${x} ${y - 60 * k}L${x + 30 * k} ${y - 46 * k}Z" style="fill:${sky('red')};stroke:${sky('ink')};stroke-width:2.5;stroke-linejoin:round"/><path d="M${x - 19 * k} ${y - 15 * k}V${y}M${x + 19 * k} ${y - 15 * k}V${y}" style="stroke:${sky('ink')};stroke-width:5"/><rect x="${x - 7 * k}" y="${y - 37 * k}" width="${14 * k}" height="${14 * k}" style="fill:${sky('panelLit')}"/>`;
}
/** A hut on its ground with its letter. o.wet: water has reached it. */
export function villageSvg(L, v, o = {}) {
  const x = L.x(v.at), y = L.y(v.h), k = o.k ?? 0.62;
  return svgHut(x, y + 1, k, {}) + `<circle cx="${x}" cy="${y - 52 * k - 16}" r="14" style="fill:${o.lit ? sky('sun') : sky('white')};stroke:${sky('ink')};stroke-width:2.5"/>`
    + tx(x, y - 52 * k - 10.5, v.id, { size: 16, col: sky('ink') });
}
