/**
 * DandekarJourneyScene - L06 s08 "The Dandekar brothers", "Good quality at fair prices", "From a laboratory to a
 * well-known brand" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 620 portrait.
 *   b0 Chip '1931, South Mumbai'; the two brothers; a paper packet 'ink powder' -> an arrow -> three reused glass
 *      bottles of liquid ink (a small reuse loop over them) 'liquid ink in recycled bottles'. Two problem chips:
 *      'money problems' (an empty money bag), 'customers unsure' (a customer with a '?').
 *   b1 A shelf of stationery (ink bottle, pencils, notebook) with chips 'good quality' (a tick) and 'fair
 *      prices' (a coin, no number); an artist at an easel with a palette of dull grey paints and a '?', label
 *      'no good art materials'; a big chip 'opportunity' (a bulb) lights over the artist.
 *   b2 A steamship sails 'to Glasgow' ('study colour chemistry') -> a laboratory in India (flasks of colour) ->
 *      a shelf: pencils, crayons, geometry box, paints; chip 'a well-known brand' (no brand name, no logo).
 * Cast (registered here): dandekar1, dandekar2, artist; a generic customer (FinPeople buyer). Props drawn in this
 * file: packet, bottle, shelf goods, easel, palette, ship, flask, crayon box, geometry box, paint tubes.
 * No made-up numbers (only 1931 from the text). No map. Animation is CSS only; Skip / Replay. No host controls.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DUR = [2.8, 2.6, 3.4];

registerCast('dandekar1', { name: 'Digambar', series: 0, role: 'adult', i: 93,
  look: { outfit: 'kurta', top: 'stone', bottom: 'cream', hairStyle: 'sidepart', moustache: true, glasses: true, shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', dupatta: false, girth: 1.04 } });
registerCast('dandekar2', { name: 'Govind', series: 0, role: 'adult', i: 94,
  look: { outfit: 'shirt', top: 'cream', bottom: 'stone', hairStyle: 'crop', moustache: false, glasses: false, shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', dupatta: false, girth: 0.98, sleeves: 'long' } });
registerCast('artist', { name: 'Artist', series: 0, role: 'adult', i: 95,
  look: { outfit: 'kurti', top: 'sage', bottom: 'cream', bottomStyle: 'long-skirt', hairStyle: 'bun', dupatta: true, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1 } });

const CSS = `
.dj-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.dj-btn:active { transform: translateY(3px); box-shadow: none; }
.dj-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .dj-pop { transform-box: fill-box; transform-origin: 50% 100%; animation: dj-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes dj-pop { 0% { opacity: 0; transform: scale(0.4); } 100% { opacity: 1; transform: none; } }
svg .dj-fade { animation: dj-fade 0.45s ease both; animation-delay: var(--d, 0s); }
@keyframes dj-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .dj-fill { transform-box: fill-box; transform-origin: 50% 100%; animation: dj-fill 0.7s ease-out both; animation-delay: var(--d, 0s); }
@keyframes dj-fill { 0% { transform: scaleY(0); } 100% { transform: none; } }
svg .dj-sail { animation: dj-sail 1.4s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes dj-sail { 0% { transform: translateX(var(--fx, -90px)); opacity: 0.3; } 100% { transform: none; opacity: 1; } }
.dj-still, .dj-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { svg .dj-pop, svg .dj-fade, svg .dj-fill, svg .dj-sail { animation: none; } }
`;

const txt = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${f1(size)}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
const RIM = 'var(--sim-stroke)';
const ACC = 'var(--sim-accent)';
const MUTED = 'var(--sim-label-muted)';
const INK = 'color-mix(in oklab, var(--sim-series-1) 60%, var(--sim-label) 40%)';
const GLASS = 'color-mix(in oklab, var(--sim-water) 22%, var(--sim-bg-surface))';
const PAPER = 'color-mix(in oklab, var(--sim-series-8) 22%, var(--sim-bg-surface))';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const DULL = 'color-mix(in oklab, var(--sim-label) 30%, var(--sim-bg-surface))';
const PROB = 'var(--sim-series-6)';
const ser = (n) => `var(--sim-series-${n})`;
const tint = (n, k = 12) => `color-mix(in oklab, var(--sim-series-${n}) ${k}%, var(--sim-bg-surface))`;

function chip(x, y, t, size = 22, o = {}) {
  const ic = o.icon ? size * 1.3 : 0, w = t.length * size * 0.56 + 28 + (ic ? ic + 6 : 0), h = size * 1.6, col = o.col ?? RIM;
  let s = `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(o.tint ?? 'var(--sim-bg-surface)', `stroke:${col};stroke-width:2.5`)}/>`;
  if (ic) s += icon(o.icon, x - w / 2 + 14 + ic / 2, y, ic, o.tone ?? 1);
  s += txt(x + (ic ? (ic + 6) / 2 : 0), y + size * 0.36, t, size);
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.d != null ? ` style="--d:${o.d}s"` : ''}>${s}</g>`;
}

function arrow(x0, y0, x1, y1, col = ACC, w = 6) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 15;
  const p1 = [x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], p2 = [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)];
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke(col, w)}/><path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(x1)} ${f1(y1)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke(col, w)}/>`;
}

/** A paper packet of ink powder, a small heap of powder beside it. (x, y) = bottom centre. */
function packet(x, y, w) {
  const h = w * 1.2, t = y - h;
  let s = `<path d="M${f1(x - w * 0.42)} ${f1(y)}L${f1(x - w * 0.5)} ${f1(t + h * 0.14)}H${f1(x + w * 0.5)}L${f1(x + w * 0.42)} ${f1(y)}Z" ${fill(PAPER, `stroke:${RIM};stroke-width:2.5`)}/>`;
  for (let i = 0; i < 6; i++) s += `<path d="M${f1(x - w * 0.5 + i * w / 6)} ${f1(t + h * 0.14)}l${f1(w / 12)} ${f1(-h * 0.12)}l${f1(w / 12)} ${f1(h * 0.12)}" ${stroke(RIM, 2)} style="fill:${PAPER}"/>`;
  s += `<rect x="${f1(x - w * 0.3)}" y="${f1(t + h * 0.4)}" width="${f1(w * 0.6)}" height="${f1(h * 0.3)}" rx="4" ${fill(INK)}/>`;
  s += `<path d="M${f1(x + w * 0.5)} ${f1(y)}q${f1(w * 0.22)} ${f1(-w * 0.3)} ${f1(w * 0.44)} 0z" ${fill(INK)}/>`;
  return s;
}

/** A reused glass bottle of liquid ink. (x, y) = bottom centre; d = fill delay (null = no animation). */
function bottle(x, y, h, d = null, ink = INK) {
  const w = h * 0.5, neck = h * 0.22, bt = y - h + neck;
  let s = `<path d="M${f1(x - w / 2)} ${f1(y - 6)}V${f1(bt + 10)}Q${f1(x - w / 2)} ${f1(bt)} ${f1(x - w * 0.22)} ${f1(bt - 4)}V${f1(y - h)}H${f1(x + w * 0.22)}V${f1(bt - 4)}Q${f1(x + w / 2)} ${f1(bt)} ${f1(x + w / 2)} ${f1(bt + 10)}V${f1(y - 6)}Q${f1(x + w / 2)} ${f1(y)} ${f1(x + w / 2 - 6)} ${f1(y)}H${f1(x - w / 2 + 6)}Q${f1(x - w / 2)} ${f1(y)} ${f1(x - w / 2)} ${f1(y - 6)}Z" ${fill(GLASS, `stroke:${RIM};stroke-width:2.5`)}/>`;
  const lh = (y - bt) * 0.72;
  s += `<rect${d != null ? ' class="dj-fill"' : ''} x="${f1(x - w / 2 + 4)}" y="${f1(y - 4 - lh)}" width="${f1(w - 8)}" height="${f1(lh)}" rx="4" ${fill(ink, d != null ? `--d:${d}s` : '')}/>`;
  s += `<rect x="${f1(x - w * 0.26)}" y="${f1(y - h - 6)}" width="${f1(w * 0.52)}" height="10" rx="3" ${fill(WOOD)}/>`;
  s += `<path d="M${f1(x - w * 0.3)} ${f1(bt + 14)}V${f1(y - lh)}" ${stroke('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)', 3)}/>`;
  return s;
}

/** A small reuse loop (two curved arrows round a circle). Centre (x, y), radius r. */
function reuse(x, y, r) {
  const col = 'var(--sim-series-3)';
  return `<path d="M${f1(x - r)} ${f1(y)}A${r} ${r} 0 0 1 ${f1(x + r * 0.7)} ${f1(y - r * 0.7)}" ${stroke(col, 4)}/>`
    + `<path d="M${f1(x + r)} ${f1(y)}A${r} ${r} 0 0 1 ${f1(x - r * 0.7)} ${f1(y + r * 0.7)}" ${stroke(col, 4)}/>`
    + `<path d="M${f1(x + r * 0.7 - 9)} ${f1(y - r * 0.7 - 6)}L${f1(x + r * 0.7)} ${f1(y - r * 0.7)}L${f1(x + r * 0.7 - 4)} ${f1(y - r * 0.7 + 9)}" ${stroke(col, 4)}/>`
    + `<path d="M${f1(x - r * 0.7 + 9)} ${f1(y + r * 0.7 + 6)}L${f1(x - r * 0.7)} ${f1(y + r * 0.7)}L${f1(x - r * 0.7 + 4)} ${f1(y + r * 0.7 - 9)}" ${stroke(col, 4)}/>`;
}

/** An upright pencil, (x, y) = bottom of the body, tip up. */
function pencil(x, y, len, n) {
  const w = 14, t = y - len, col = ser(n);
  return `<rect x="${f1(x - w / 2)}" y="${f1(t)}" width="${w}" height="${f1(len)}" rx="2" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2`)}/>`
    + `<path d="M${f1(x - w / 2)} ${f1(t)}L${f1(x)} ${f1(t - 18)}L${f1(x + w / 2)} ${f1(t)}Z" ${fill(PAPER, `stroke:${RIM};stroke-width:2`)}/>`
    + `<path d="M${f1(x - 3)} ${f1(t - 11)}L${f1(x)} ${f1(t - 18)}L${f1(x + 3)} ${f1(t - 11)}Z" ${fill('var(--sim-label)')}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y)}" width="${w}" height="9" rx="2" ${fill('color-mix(in oklab, var(--sim-series-4) 50%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:2`)}/>`;
}

function pencils(x, y, h) { return pencil(x - 20, y, h * 0.8, 2) + pencil(x, y, h * 0.92, 1) + pencil(x + 20, y, h * 0.72, 3); }

function crayons(x, y, w) {
  const h = w * 0.7, t = y - h;
  let s = '';
  [6, 2, 3, 1, 5].forEach((n, i) => {
    const cx = x - w * 0.36 + i * w * 0.18, ch = h * 0.42;
    s += `<rect x="${f1(cx - 6)}" y="${f1(t - ch * 0.5)}" width="12" height="${f1(ch)}" rx="2" ${fill(ser(n), `stroke:${shade(ser(n), 60)};stroke-width:1.5`)}/>`
      + `<path d="M${f1(cx - 6)} ${f1(t - ch * 0.5)}L${f1(cx)} ${f1(t - ch * 0.5 - 12)}L${f1(cx + 6)} ${f1(t - ch * 0.5)}Z" ${fill(ser(n))}/>`;
  });
  s += `<rect x="${f1(x - w / 2)}" y="${f1(t)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(tint(2, 40), `stroke:${shade(ser(2), 62)};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x - w / 2)} ${f1(t + h * 0.4)}Q${f1(x)} ${f1(t + h * 0.15)} ${f1(x + w / 2)} ${f1(t + h * 0.4)}" ${stroke(ser(2), 4)}/>`;
  return s;
}

function geometryBox(x, y, w) {
  const h = w * 0.5, t = y - h, col = ser(7);
  let s = `<rect x="${f1(x - w / 2)}" y="${f1(t)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(tint(7, 30), `stroke:${shade(col, 62)};stroke-width:2.5`)}/>`;
  // a ruler on the lid
  s += `<rect x="${f1(x - w * 0.42)}" y="${f1(t + h * 0.18)}" width="${f1(w * 0.84)}" height="${f1(h * 0.24)}" rx="2" ${fill(PAPER, `stroke:${RIM};stroke-width:2`)}/>`;
  for (let i = 1; i < 10; i++) s += `<path d="M${f1(x - w * 0.42 + i * w * 0.084)} ${f1(t + h * 0.18)}v${f1(i % 5 ? h * 0.08 : h * 0.14)}" ${stroke(RIM, 1.5)}/>`;
  // a compass
  const cx = x, cy = t + h * 0.52;
  s += `<path d="M${f1(cx - w * 0.16)} ${f1(y - h * 0.08)}L${f1(cx)} ${f1(cy)}L${f1(cx + w * 0.16)} ${f1(y - h * 0.08)}" ${stroke('color-mix(in oklab, var(--sim-label) 60%, var(--sim-bg-surface))', 4)}/>`;
  s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="5" ${fill('var(--sim-label)')}/>`;
  return s;
}

function paints(x, y, w) {
  let s = '';
  [6, 1, 3].forEach((n, i) => {
    const tx = x - w * 0.32 + i * w * 0.32, th = w * 0.62, col = ser(n);
    s += `<rect x="${f1(tx - 11)}" y="${f1(y - th)}" width="22" height="${f1(th - 8)}" rx="5" ${fill(tint(n, 30), `stroke:${shade(col, 60)};stroke-width:2`)}/>`
      + `<rect x="${f1(tx - 11)}" y="${f1(y - th * 0.62)}" width="22" height="${f1(th * 0.3)}" ${fill(col)}/>`
      + `<rect x="${f1(tx - 6)}" y="${f1(y - 10)}" width="12" height="10" rx="2" ${fill('var(--sim-label)')}/>`;
  });
  return s;
}

/** An easel with a canvas, (x, y) = ground under the middle; dull = grey smudges. */
function easel(x, y, h) {
  const cw = h * 0.62, ch = h * 0.46, ct = y - h;
  let s = `<path d="M${f1(x - cw * 0.4)} ${f1(y)}L${f1(x)} ${f1(ct - 8)}L${f1(x + cw * 0.4)} ${f1(y)}M${f1(x)} ${f1(ct)}L${f1(x)} ${f1(y)}" ${stroke(WOOD, 6)}/>`;
  s += `<rect x="${f1(x - cw / 2)}" y="${f1(ct)}" width="${f1(cw)}" height="${f1(ch)}" rx="3" ${fill('var(--sim-bg-surface)', `stroke:${RIM};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x - cw * 0.34)} ${f1(ct + ch * 0.7)}q${f1(cw * 0.2)} ${f1(-ch * 0.4)} ${f1(cw * 0.36)} ${f1(-ch * 0.1)}t${f1(cw * 0.3)} ${f1(-ch * 0.12)}" ${stroke(DULL, 8)}/>`;
  s += `<circle cx="${f1(x + cw * 0.22)}" cy="${f1(ct + ch * 0.28)}" r="${f1(ch * 0.12)}" ${fill(DULL)}/>`;
  s += `<rect x="${f1(x - cw * 0.55)}" y="${f1(ct + ch)}" width="${f1(cw * 1.1)}" height="7" rx="3" ${fill(WOOD)}/>`;
  return s;
}

function palette(x, y, r) {
  let s = `<path d="M${f1(x - r)} ${f1(y)}C${f1(x - r)} ${f1(y - r * 0.8)} ${f1(x + r)} ${f1(y - r * 0.8)} ${f1(x + r)} ${f1(y)}C${f1(x + r)} ${f1(y + r * 0.6)} ${f1(x + r * 0.1)} ${f1(y + r * 0.5)} ${f1(x - r * 0.1)} ${f1(y + r * 0.3)}C${f1(x - r * 0.3)} ${f1(y + r * 0.6)} ${f1(x - r)} ${f1(y + r * 0.5)} ${f1(x - r)} ${f1(y)}Z" ${fill(PAPER, `stroke:${WOOD};stroke-width:3`)}/>`;
  [[-0.55, -0.15], [-0.15, -0.38], [0.3, -0.35], [0.6, -0.05]].forEach(([dx, dy], i) => {
    s += `<circle cx="${f1(x + dx * r)}" cy="${f1(y + dy * r)}" r="${f1(r * 0.15)}" ${fill(`color-mix(in oklab, var(--sim-label) ${22 + i * 8}%, var(--sim-bg-surface))`)}/>`;
  });
  return s;
}

/** A '?' in a round bubble. */
function ask(x, y, r = 24) {
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" ${fill('var(--sim-bg-surface)', `stroke:${RIM};stroke-width:2.5`)}/>` + txt(x, y + r * 0.42, '?', r * 1.25);
}

/** A steamship, (x, y) = waterline middle, w long. */
function ship(x, y, w) {
  const h = w * 0.22, col = ser(1);
  let s = `<path d="M${f1(x - w / 2)} ${f1(y - h)}H${f1(x + w / 2)}L${f1(x + w * 0.38)} ${f1(y + h * 0.3)}H${f1(x - w * 0.42)}Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  s += `<rect x="${f1(x - w * 0.3)}" y="${f1(y - h * 2)}" width="${f1(w * 0.55)}" height="${f1(h)}" rx="4" ${fill('var(--sim-bg-surface)', `stroke:${RIM};stroke-width:2.5`)}/>`;
  for (let i = 0; i < 4; i++) s += `<circle cx="${f1(x - w * 0.22 + i * w * 0.13)}" cy="${f1(y - h * 1.5)}" r="${f1(h * 0.18)}" ${fill(GLASS, `stroke:${RIM};stroke-width:1.5`)}/>`;
  [-0.12, 0.08].forEach((dx) => { s += `<rect x="${f1(x + dx * w)}" y="${f1(y - h * 3)}" width="${f1(w * 0.08)}" height="${f1(h * 1.05)}" rx="2" ${fill(PROB, `stroke:${shade(PROB, 60)};stroke-width:2`)}/>`; });
  return s;
}

function waves(x0, x1, y) {
  let d = `M${f1(x0)} ${f1(y)}`;
  for (let x = x0; x < x1; x += 28) d += `q7 -7 14 0t14 0`;
  return `<rect x="${f1(x0)}" y="${f1(y)}" width="${f1(x1 - x0)}" height="26" rx="8" ${fill('color-mix(in oklab, var(--sim-water) 40%, var(--sim-bg-surface))')}/><path d="${d}" ${stroke('var(--sim-water)', 3)}/>`;
}

function flask(x, y, h, n) {
  const w = h * 0.8, nk = h * 0.36, col = ser(n);
  const body = `M${f1(x - w * 0.12)} ${f1(y - h)}V${f1(y - h + nk)}L${f1(x - w / 2)} ${f1(y - 4)}Q${f1(x - w / 2)} ${f1(y)} ${f1(x - w / 2 + 6)} ${f1(y)}H${f1(x + w / 2 - 6)}Q${f1(x + w / 2)} ${f1(y)} ${f1(x + w / 2)} ${f1(y - 4)}L${f1(x + w * 0.12)} ${f1(y - h + nk)}V${f1(y - h)}Z`;
  const lt = y - h * 0.38, lx = w * 0.5 * (h * 0.38) / (h - nk);
  return `<path d="${body}" ${fill(GLASS, `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - lx - w * 0.06)} ${f1(lt)}H${f1(x + lx + w * 0.06)}L${f1(x + w / 2 - 3)} ${f1(y - 3)}H${f1(x - w / 2 + 3)}Z" ${fill(col)}/>`;
}

export class DandekarJourneyScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'The Dandekar brothers. In 1931, in South Mumbai, two brothers sell ink powder; with few resources they sell liquid ink in reused glass bottles; problems: money, and customers who are unsure. Then a shelf of good-quality stationery at fair prices, and an artist at an easel with only dull grey paints: the brothers see an opportunity. Last, a ship to Glasgow to study colour chemistry, a laboratory in India with flasks of colour, and a shelf of pencils, crayons, a geometry box and paints: a well-known brand.';

  async setup() {
    this.still = false;
    this.run = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'skip') this.finish();
      else this.restart();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + CSS; }

  enter() { this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    if (this._timers) this.after(DUR[this.stepIndex] ?? 2, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintArt(P) : v === 2 ? this.paintBrand(P) : this.paintStart(P);
    const still = this.still ? ' dj-still' : '';
    const pos = P ? (v === 2 ? 'right:8px;top:8px' : 'left:8px;bottom:8px') : (v === 1 ? 'left:8px;bottom:8px' : 'right:8px;bottom:8px');
    const btn = `<button type="button" class="sv-hit tap btn dj-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: 1931, ink powder -> liquid ink in reused bottles; two problems.
  paintStart(P) {
    const G = P
      ? { when: [195, 34], bros: [[70, 262], [150, 262]], bh: 160, pk: [304, 176, 66], pkl: [304, 208], arr: [290, 222, 240, 262],
        bt: [[140, 352], [195, 352], [250, 352]], bth: 84, loop: [300, 300], btl: [195, 384], p1: [140, 456], p2: [140, 512], cu: [326, 590], ask: [350, 432] }
      : { when: [150, 36], bros: [[70, 300], [160, 300]], bh: 176, pk: [290, 190, 70], pkl: [290, 224], arr: [338, 150, 384, 150],
        bt: [[420, 200], [468, 200], [516, 200]], bth: 96, loop: [468, 70], btl: [468, 230], p1: [150, 372], p2: [150, 430], cu: [430, 462], ask: [490, 316] };
    let svg = chip(G.when[0], G.when[1], '1931, South Mumbai', 26, { col: ACC, tint: `color-mix(in oklab, ${ACC} 14%, var(--sim-bg-surface))`, cls: 'dj-pop', d: 0 });
    svg += `<g class="dj-pop" style="--d:0.3s">${packet(G.pk[0], G.pk[1], G.pk[2])}${txt(G.pkl[0], G.pkl[1], 'ink powder', 22)}</g>`;
    svg += `<g class="dj-fade" style="--d:0.7s">${arrow(...G.arr)}</g>`;
    G.bt.forEach(([x, y], i) => { svg += `<g class="dj-pop" style="--d:${0.9 + i * 0.15}s">${bottle(x, y, G.bth, 1.3 + i * 0.15)}</g>`; });
    svg += `<g class="dj-fade" style="--d:1.6s">${reuse(G.loop[0], G.loop[1], 22)}</g>`;
    svg += `<g class="dj-fade" style="--d:1.2s">${txt(G.btl[0], G.btl[1], 'liquid ink in', 21, 'var(--sim-label)', 'middle', 700)}${txt(G.btl[0], G.btl[1] + 25, 'recycled bottles', 22)}</g>`;
    svg += chip(G.p1[0], G.p1[1], 'money problems', 22, { icon: 'money-bag', tone: 8, col: PROB, tint: tint(6, 10), cls: 'dj-pop', d: 1.8 });
    svg += chip(G.p2[0], G.p2[1], 'customers unsure', 22, { col: PROB, tint: tint(6, 10), cls: 'dj-pop', d: 2.1 });
    svg += `<g class="dj-pop" style="--d:2.1s">${ask(G.ask[0], G.ask[1])}</g>`;
    let over = '';
    ['dandekar1', 'dandekar2'].forEach((who, i) => { over += personSlot(who, { x: G.bros[i][0], y: G.bros[i][1], h: G.bh, facing: 0, mood: i ? 'think' : 'smile', cls: 'mpp-pop', style: `--d:${0.1 + i * 0.12}s;` }); });
    over += personSlot('buyer3', { x: G.cu[0], y: G.cu[1], h: P ? 130 : 140, facing: -1, mood: 'think', cls: 'mpp-pop', style: '--d:1.9s;' });
    return { svg, over };
  }

  // b1: good quality, fair prices; the artists' need is an opportunity.
  paintArt(P) {
    const G = P
      ? { shelf: [24, 186, 342], items: 186, q: [195, 226], fp: [195, 274], opp: [195, 334], art: [130, 598], ea: [286, 598], pal: [62, 478], ask: [206, 440], need: [195, 382] }
      : { shelf: [16, 196, 250], items: 196, q: [141, 250], fp: [141, 304], opp: [418, 60], art: [372, 446], ea: [490, 446], pal: [316, 380], ask: [420, 236], need: [418, 120] };
    const [sx, sy, sw] = G.shelf;
    let svg = `<g class="dj-pop">`;
    svg += `<rect x="${f1(sx)}" y="${f1(sy)}" width="${f1(sw)}" height="12" rx="4" ${fill(WOOD)}/>`;
    const step = sw / 4;
    svg += bottle(sx + step * 0.6, sy, 80) + pencils(sx + step * 1.7, sy, 92) + icon('book', sx + step * 2.8, sy - 38, 80, 5) + bottle(sx + step * 3.6, sy, 64, null, ser(6));
    svg += '</g>';
    svg += chip(G.q[0], G.q[1], 'good quality', 22, { icon: 'check', tone: 3, col: 'var(--sim-series-3)', tint: tint(3, 12), cls: 'dj-pop', d: 0.4 });
    svg += chip(G.fp[0], G.fp[1], 'fair prices', 22, { icon: 'coin', tone: 2, col: 'var(--sim-series-2)', tint: tint(2, 12), cls: 'dj-pop', d: 0.7 });
    svg += `<g class="dj-fade" style="--d:1.0s">${easel(G.ea[0], G.ea[1], P ? 170 : 200)}${palette(G.pal[0], G.pal[1], 34)}</g>`;
    svg += `<g class="dj-fade" style="--d:1.3s">${txt(G.need[0], G.need[1], 'no good art materials', 22)}</g>`;
    svg += `<g class="dj-pop" style="--d:1.4s">${ask(G.ask[0], G.ask[1], 26)}</g>`;
    svg += chip(G.opp[0], G.opp[1], 'opportunity', 30, { icon: 'bulb', tone: 2, col: ACC, tint: `color-mix(in oklab, ${ACC} 16%, var(--sim-bg-surface))`, cls: 'dj-pop', d: 1.9 });
    const over = personSlot('artist', { x: G.art[0], y: G.art[1], h: P ? 160 : 176, facing: 1, mood: 'sad', cls: 'mpp-pop', style: '--d:0.9s;' });
    return { svg, over };
  }

  // b2: Glasgow -> a laboratory in India -> the products.
  paintBrand(P) {
    const G = P
      ? { sea: [14, 220, 140], ship: [110, 140, 150], to: [292, 72], study: [195, 196], a1: [330, 100, 330, 168],
        lab: [195, 304], labl: [195, 348], a2: null, prod: [[100, 440, 'pencils'], [290, 440, 'crayons'], [100, 540, 'geometry box'], [290, 540, 'paints']], brand: [195, 598] }
      : { sea: [16, 260, 158], ship: [140, 158, 170], to: [140, 208], study: [140, 248], a1: [282, 120, 322, 120],
        lab: [440, 176], labl: [440, 236], a2: [440, 250, 440, 290], prod: [[80, 372, 'pencils'], [210, 372, 'crayons'], [344, 372, 'geometry box'], [478, 372, 'paints']], brand: [280, 450] };
    let svg = `<g class="dj-fade">${waves(G.sea[0], G.sea[1], G.sea[2])}</g>`;
    svg += `<g class="dj-sail" style="--d:0.1s;--fx:-30px">${ship(G.ship[0], G.ship[1], G.ship[2])}</g>`;
    svg += chip(G.to[0], G.to[1], 'to Glasgow', 24, { col: 'var(--sim-series-1)', tint: tint(1, 12), cls: 'dj-pop', d: 0.3 });
    svg += `<g class="dj-fade" style="--d:0.8s">${txt(G.study[0], G.study[1], 'study colour chemistry', 21)}</g>`;
    svg += `<g class="dj-fade" style="--d:1.2s">${arrow(...G.a1)}</g>`;
    // the laboratory: a bench with three flasks
    const [lx, ly] = G.lab;
    const legB = P ? 24 : 30; // portrait: short legs stay clear of the label below
    let lab = `<rect x="${f1(lx - 110)}" y="${f1(ly)}" width="220" height="14" rx="4" ${fill(WOOD)}/>`
      + `<path d="M${f1(lx - 96)} ${f1(ly + 14)}V${f1(ly + legB)}M${f1(lx + 96)} ${f1(ly + 14)}V${f1(ly + legB)}" ${stroke(WOOD, 6)}/>`;
    const fh = P ? 0.72 : 1; // portrait: shorter flasks keep clear of the study label
    lab += flask(lx - 62, ly, 84 * fh, 6) + flask(lx, ly, 100 * fh, 2) + flask(lx + 62, ly, 84 * fh, 1);
    svg += `<g class="dj-pop" style="--d:1.4s">${lab}</g>`;
    svg += `<g class="dj-fade" style="--d:1.6s">${txt(G.labl[0], G.labl[1], 'a laboratory in India', 21)}</g>`;
    if (G.a2) svg += `<g class="dj-fade" style="--d:1.9s">${arrow(...G.a2)}</g>`;
    G.prod.forEach(([x, y, t], i) => {
      const d = 2.0 + i * 0.2;
      const pic = i === 0 ? pencils(x, y - 8, P ? 70 : 80) : i === 1 ? crayons(x, y, 90) : i === 2 ? geometryBox(x, y, 110) : paints(x, y, 96);
      svg += `<g class="dj-pop" style="--d:${d}s">${pic}${txt(x, y + 28, t, 21)}</g>`;
    });
    svg += chip(G.brand[0], G.brand[1], 'a well-known brand', P ? 22 : 24, { col: ACC, tint: `color-mix(in oklab, ${ACC} 14%, var(--sim-bg-surface))`, cls: 'dj-pop', d: 2.8 });
    return { svg, over: '' };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
