// ClayDraw.js - drawn clay and cuneiform for the L09 SVG scenes: wedges, the sign AN, number signs, tablets, a reed.
// Strings of SVG markup. Not a scene. Colours are tokens only. Shapes are the real signs: one straight wedge is 1,
// one corner mark is 10, and the sign AN (sky, god) is four crossing wedges.
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { n } from '../L07/HarappanDraw.js';

export const TAB = 'color-mix(in oklab, var(--sim-strata-3) 52%, var(--sim-strata-1))';
export const CUT = 'color-mix(in oklab, var(--sim-strata-3) 30%, var(--sim-strata-6))';
const LIP = 'color-mix(in oklab, var(--sim-strata-1) 70%, var(--sim-bg-surface))';

/** One wedge: head at (x, y), pointing along angle a (degrees), len long, head h across. */
export function wedgeSvg(x, y, a, len, h, o = {}) {
  const p = `M0 ${n(-h / 2)}L${n(h * 0.85)} ${n(-h * 0.1)}L${n(len)} 0L${n(h * 0.85)} ${n(h * 0.1)}L0 ${n(h / 2)}Z`;
  const t = `translate(${n(x)} ${n(y)}) rotate(${a})`;
  if (o.ghost) return `<path transform="${t}" d="${p}" ${stroke(CUT, 3, 'stroke-dasharray:4 7')}/>`;
  return `<g transform="${t}"${o.cls ? ` class="${o.cls}"` : ''}><path d="${p}" ${fill(LIP)} transform="translate(1.5 2.5)"/><path d="${p}" ${fill(CUT)}/></g>`;
}

/** The corner mark for 10: a head with no tail, point to the left, s across. */
export function cornerSvg(x, y, s) {
  const p = `M${n(x + s)} ${n(y - s * 0.62)}L${n(x)} ${n(y)}L${n(x + s)} ${n(y + s * 0.62)}Q${n(x + s * 0.56)} ${n(y)} ${n(x + s)} ${n(y - s * 0.62)}Z`;
  return `<path d="${p}" ${fill(LIP)} transform="translate(1.5 2.5)"/><path d="${p}" ${fill(CUT)}/>`;
}

/** The four wedges of AN, centred on (x, y), radius r, in the order they are pressed. */
export function anWedges(x, y, r) {
  const d = r * 0.72, h = r * 0.36;
  return [
    { x: x - r, y, a: 0, len: r * 2, h },
    { x, y: y - r, a: 90, len: r * 2, h },
    { x: x - d, y: y - d, a: 45, len: r * 2, h },
    { x: x - d, y: y + d, a: -45, len: r * 2, h },
  ];
}

/** A number in wedges from left x, vertical centre y: tens as corners, ones as upright wedges. Returns markup and its width. */
export function numberSvg(val, x, y, s) {
  let out = '', px = x;
  for (let i = 0; i < Math.floor(val / 10); i++) { out += cornerSvg(px, y, s * 0.62); px += s * 0.62; }
  const ones = val % 10;
  for (let i = 0; i < ones; i++) { const row = i >= 5 ? 1 : 0, col = i % 5; out += wedgeSvg(px + col * s * 0.34 + s * 0.14, y - s * 0.5 + row * s * 0.56 * (ones > 5 ? 1 : 0) + (ones > 5 ? -s * 0.12 : 0), 90, ones > 5 ? s * 0.56 : s, s * 0.28); }
  return { svg: out, w: px - x + Math.min(ones, 5) * s * 0.34 };
}

/** A clay tablet, box (x, y, w, h). A rounded pillow with a soft top light and a few grains. */
export function tabletSvg(x, y, w, h, o = {}) {
  const col = o.col ?? TAB, r = Math.min(w, h) * 0.13;
  let g = '';
  for (let i = 0; i < 26; i++) { const px = x + 14 + ((i * 73) % 97) / 97 * (w - 28), py = y + 14 + ((i * 41) % 89) / 89 * (h - 28); g += `<circle cx="${n(px)}" cy="${n(py)}" r="${i % 3 ? 1.4 : 2.2}" ${fill(shade(col, 80), 'opacity:0.6')}/>`; }
  return `<rect x="${n(x)}" y="${n(y + 9)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" ${fill(shade(col, 58))}/>`
    + `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" ${fill(col)}/>`
    + `<rect x="${n(x + r * 0.7)}" y="${n(y + 6)}" width="${n(w - r * 1.4)}" height="7" rx="3.5" ${fill(LIP)}/>` + g;
}

/** A cut reed lying at angle a, with its tip at (x, y), s long, and a fist round it. */
export function reedSvg(x, y, a, s, o = {}) {
  const w = s * 0.075, reed = 'var(--sim-strata-1)', fist = 'var(--sim-fig-skin-2, var(--sim-strata-3))';
  const hand = o.hand === false ? '' : `<g transform="translate(${n(s * 0.5)} 0)"><rect x="${n(-s * 0.13)}" y="${n(-w * 2.1)}" width="${n(s * 0.26)}" height="${n(w * 4.2)}" rx="${n(w * 1.6)}" ${fill(shade(fist, 88))}/>`
    + [0, 1, 2, 3].map((i) => `<rect x="${n(-s * 0.115 + i * s * 0.06)}" y="${n(-w * 2.25)}" width="${n(s * 0.053)}" height="${n(w * 3.1)}" rx="${n(s * 0.024)}" ${fill(fist)}/>`).join('')
    + `<rect x="${n(-s * 0.13)}" y="${n(w * 0.45)}" width="${n(s * 0.2)}" height="${n(w * 1.3)}" rx="${n(w * 0.65)}" ${fill(fist)} transform="rotate(-6)"/></g>`;
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${a})"${o.cls ? ` class="${o.cls}"` : ''}>`
    + `<path d="M0 0L${n(s * 0.14)} ${n(-w)}H${n(s)}V${n(w)}H${n(s * 0.14)}Z" ${fill(shade(reed, 84))}/>`
    + `<path d="M0 0L${n(s * 0.14)} ${n(-w)}H${n(s)}V${n(-w * 0.1)}H${n(s * 0.14)}Z" ${fill(reed)}/>`
    + `<rect x="${n(s * 0.72)}" y="${n(-w - 1)}" width="${n(s * 0.03)}" height="${n(w * 2 + 2)}" rx="2" ${fill(shade(reed, 62))}/>`
    + hand + '</g>';
}
