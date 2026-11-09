// DuneDraw - dunes seen from above, wind blowing to the right (+x) unless the caller rotates the group.
// Light from the top left. Pure markup, shared by DuneShapeScene and DuneShapeGame. Nothing here is a scene.
import { art, n1, INK, arrow, svgTree, svgGrass, seeded } from './LandDraw.js';

const SL = () => art('sandLit'), SD = () => art('sandDark'), SR = () => art('sandRipple');
const f = (c, rim = true) => `style="fill:${c}${rim ? `;stroke:${INK};stroke-width:2.5;stroke-linejoin:round` : ''}"`;

/** The bare floor a dune stands on. */
export const floor = (x, y, w, h, o = {}) => {
  const r = seeded(o.seed ?? 5); let d = '';
  for (let i = 0; i < (o.n ?? 12); i++) { const px = x + r() * w, py = y + r() * h, l = 14 + r() * 26; d += `M${n1(px)} ${n1(py)}q${n1(l / 2)} ${n1(-3)} ${n1(l)} 0`; }
  return `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" ${f(art('sandRipple'), false)}/><path d="${d}" style="fill:none;stroke:${SD()};stroke-width:2;stroke-linecap:round;opacity:0.5"/>`;
};
/** A barchan at (x, y), size k. Horns point to the right, downwind; the steep slip face is the hollow side. */
export function barchan(x, y, k = 1) {
  const P = (a, b) => `${n1(x + a * k)} ${n1(y + b * k)}`;
  return `<path d="M${P(66, -58)}C${P(-6, -74)} ${P(-70, -50)} ${P(-70, 0)}C${P(-70, 50)} ${P(-6, 74)} ${P(66, 58)}C${P(22, 40)} ${P(10, 20)} ${P(10, 0)}C${P(10, -20)} ${P(22, -40)} ${P(66, -58)}Z" ${f(SL())}/>`
    + `<path d="M${P(66, -58)}C${P(26, -34)} ${P(-8, -22)} ${P(-8, 0)}C${P(-8, 22)} ${P(26, 34)} ${P(66, 58)}C${P(22, 40)} ${P(10, 20)} ${P(10, 0)}C${P(10, -20)} ${P(22, -40)} ${P(66, -58)}Z" ${f(SD(), false)}/>`
    + `<path d="M${P(-46, -24)}q${n1(8 * k)} ${n1(24 * k)} 0 ${n1(48 * k)}M${P(-30, -32)}q${n1(9 * k)} ${n1(32 * k)} 0 ${n1(64 * k)}" style="fill:none;stroke:${SR()};stroke-width:2.5;stroke-linecap:round"/>`;
}
/** A long ridge, straight along y from x0 to x1 (the caller's group sets the direction). Crest with a lit and a shaded side. */
export function ridge(x0, x1, y, h, seed = 1) {
  const r = seeded(seed), top = [], bot = [], n = 8;
  for (let i = 0; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, w = Math.sin(i * 1.3 + seed) * 7 + (r() - 0.5) * 6; top.push([x, y - h + w]); bot.push([x, y + h + w]); }
  const crest = top.map((p, i) => [p[0], (p[1] + bot[i][1]) / 2]);
  const line = (a) => a.map((p, i) => `${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`).join('');
  return `<path d="${line(top)}L${[...bot].reverse().map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z" ${f(SL())}/>`
    + `<path d="${line(crest)}L${[...bot].reverse().map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z" ${f(SD(), false)}/>`;
}
/** A star dune at (x, y): five arms round a high point, lit on one side of each arm. */
export function star(x, y, k = 1) {
  const R = 86 * k, r0 = 32 * k, pts = [];
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5 + 0.2; const q = R * (0.82 + (i % 2) * 0.18); pts.push([x + Math.cos(a) * q, y + Math.sin(a) * q, a]); }
  let lit = '', dark = '';
  for (const [px, py, a] of pts) {
    const l = [x + Math.cos(a - 1.26) * r0, y + Math.sin(a - 1.26) * r0], m = [x + Math.cos(a + 1.26) * r0, y + Math.sin(a + 1.26) * r0];
    lit += `<path d="M${n1(l[0])} ${n1(l[1])}Q${n1((l[0] + px) / 2)} ${n1((l[1] + py) / 2)} ${n1(px)} ${n1(py)}Q${n1((m[0] + px) / 2)} ${n1((m[1] + py) / 2)} ${n1(m[0])} ${n1(m[1])}Z" ${f(SL())}/>`;
    dark += `<path d="M${n1(x)} ${n1(y)}L${n1(px)} ${n1(py)}L${n1((m[0] + x * 2) / 3)} ${n1((m[1] + y * 2) / 3)}Z" ${f(SD(), false)}/>`;
  }
  return lit + dark + `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r0 * 0.8)}" ${f(SL(), false)}/><circle cx="${n1(x - 2 * k)}" cy="${n1(y - 2 * k)}" r="${n1(4 * k)}" ${f(SD(), false)}/>`;
}
/** A parabolic dune: nose at the right, moved on by `go` px; the arm tips stay put, held by plants. */
export function parabolic(x, y, k = 1, go = 0) {
  const nose = 62 * k + go, tip = -74 * k, w = 60 * k, t = 22 * k;
  const P = (a, b) => `${n1(x + a)} ${n1(y + b)}`;
  const outer = `M${P(tip, -w)}C${P(nose * 0.3, -w * 1.05)} ${P(nose, -w * 0.72)} ${P(nose, 0)}C${P(nose, w * 0.72)} ${P(nose * 0.3, w * 1.05)} ${P(tip, w)}`;
  const inner = `L${P(tip, w - t)}C${P(nose * 0.15, w - t)} ${P(nose - t * 1.5, w * 0.46)} ${P(nose - t * 1.5, 0)}C${P(nose - t * 1.5, -w * 0.46)} ${P(nose * 0.15, -w + t)} ${P(tip, -w + t)}Z`;
  const r = seeded(4);
  let plants = '';
  for (const sy of [-1, 1]) for (let i = 0; i < 3; i++) {
    const px = x + tip + 4 * k + i * 26 * k;
    plants += svgTree(px, y + sy * (w - t * 0.4) + 10 * k, 0.46 * k, { kind: 'round', seed: 3 + i + (r() * 4 | 0) });
  }
  return `<path d="${outer}${inner}" ${f(SD())}/><path d="M${P(nose * 0.9, 0)}C${P(nose * 0.8, -w * 0.56)} ${P(nose * 0.2, -w * 0.8)} ${P(tip, -w * 0.9)}L${P(tip, -w + t)}C${P(nose * 0.15, -w + t)} ${P(nose - t * 1.5, -w * 0.46)} ${P(nose - t * 1.5, 0)}Z" ${f(SL(), false)}/>${plants}`;
}
/** A short wind arrow on a plan. */
export const wind = (x0, y0, x1, y1, o = {}) => arrow(x0, y0, x1, y1, { w: 8, ...o });
export const grassLine = svgGrass;
