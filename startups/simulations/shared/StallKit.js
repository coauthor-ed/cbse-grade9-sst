/**
 * StallKit - the startups course cast: plain functions that return SVG strings for an SvgScene stage (same style
 * as MoneyKit.js). Flat Quill look, tokens only, no faces on objects, no brand names. Add STALL_CSS once to the
 * scene's css() (with MONEY_CSS / PEOPLE_CSS as needed). Every function takes { dim, cls, style } in its options
 * (dim: opacity 0.32; cls / style on the outer <g>).
 *
 *   stall(x, y, w, { sign, part, dim, cls })   a school-festival stall, front view: a table with a cloth (a
 *                                            scalloped hem), a striped awning on two poles, a sign board on top of
 *                                            the awning (sign default 'nimbu pani'; '' = no board). (x, y) = the
 *                                            ground under the middle; w = table width; the board top is about
 *                                            1.22 w above y, the awning ends 0.06 w past each pole.
 *                                            part: 'back' (poles, awning, sign) | 'front' (table, cloth) | both
 *                                            (default). People stand behind the table: draw the back in the svg,
 *                                            the people in the overlay, then the front with FinPeople frontSvg.
 *   stallTop(y, w) -> y                      the y of the table top (props stand on it); STALL.awningY(y, w) the
 *                                            bottom of the awning valance.
 *   glass(x, y, h, { full, dim })            a glass of nimbu pani (pale yellow-green), a lemon slice on the rim;
 *                                            (x, y) = bottom centre; h default 60; full false = an empty glass
 *                                            (muted-label rim, a pale ice body: reads in the dark theme too).
 *   jug(x, y, h, { full, dim })              a jug with a handle (handle on the right); (x, y) = bottom centre;
 *                                            full false = empty, drawn like the empty glass.
 *   lemon(x, y, r, { dim })                  one lemon lying down, centre (x, y), 2r long (r default 14).
 *   lemonPile(x, y, r, { dim })              five lemons in a small heap; (x, y) = bottom centre.
 *   sugarBag(x, y, h, { label, dim })        a cloth sack, top tied; label default 'sugar' ('' = none); bottom centre.
 *   cupStack(x, y, h, { n, dim })            a stack of paper cups (n default 6), bottom centre.
 *   priceBoard(x, y, w, price, { unit, dim })   a small chalk board on legs: the price big (rupee sign + number),
 *                                            unit under it (default 'a glass'); (x, y) = the ground under it;
 *                                            height about 1.1 w. price may be a string (e.g. '?').
 *   reportCard(x, y, w, rows, { title, size, dim })   a clipboard with a sheet: title (optional) and 2-3 rows
 *                                            [{ label, value }] (value null or '' = a blank line to fill in);
 *                                            (x, y) = top centre of the board; height = cardHeight(w, n, o).
 *                                            stack: true puts each label on its own line with a full-width blank
 *                                            line under it (for long labels).
 *   bunting(x0, y0, x1, y1, n, { sag, size, dim })   a string of n triangle flags in series colours, sagging.
 *   banner(x, y, w, text, { size, dim })     a cloth banner on two cords, text in the middle; centre (x, y).
 *   bakery(x, y, w, { sign, dim })           a small bakery shopfront: a sign band (default 'ABC Bakery'), a
 *                                            short striped awning, a display window with loaves, a door. (x, y) =
 *                                            ground under the middle; height about 0.9 w.
 *   breadLoaf(x, y, w, { dim })              a loaf, side view, (x, y) = bottom centre; height 0.45 w.
 *   cakeJar(x, y, h, { dim })                a mini cake jar (layers in a jar with a lid); bottom centre.
 * People (registered into FinPeople's CAST on import, so personSlot('you', ...) works):
 *   you (Class 9, school uniform, series 1), classmate1 (series 2), classmate2 (series 3), parent and child
 *   (visitors, neutral tops, no series), maker (the jute bag maker, an adult woman, series 5); teacher is
 *   FinPeople's own. STALL_CAST lists the keys.
 * ASCII only (the rupee sign comes from MoneyKit's RS).
 */
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { RS, group } from './MoneyKit.js';
import { registerCast } from './FinPeople.js';

const f1 = (v) => (+v).toFixed(1);

export const STALL_CAST = ['you', 'classmate1', 'classmate2', 'parent', 'child', 'maker'];
const UNIFORM = { outfit: 'shirt', bottom: 'navy', shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1, sleeves: 'short' };
registerCast('you', { name: 'You', series: 1, role: 'student', i: 21, look: { ...UNIFORM, top: 's1', hairStyle: 'ponytail', bottomStyle: 'skirt' } });
registerCast('classmate1', { name: 'Classmate', series: 2, role: 'student', i: 22, look: { ...UNIFORM, top: 's2', hairStyle: 'short' } });
registerCast('classmate2', { name: 'Classmate', series: 3, role: 'student', i: 23, look: { ...UNIFORM, top: 's3', hairStyle: 'braid', bottomStyle: 'skirt' } });
registerCast('parent', { name: 'Parent', series: 0, role: 'adult', i: 24,
  look: { outfit: 'kurta', hairStyle: 'sidepart', top: 'stone', bottom: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.06 } });
registerCast('child', { name: 'Child', series: 0, role: 'child', i: 25,
  look: { outfit: 'tee', hairStyle: 'bob', top: 'sage', bottom: 'khaki', bottomStyle: 'shorts', shoeStyle: 'sneaker', shoe: 'white', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1 } });
registerCast('maker', { name: 'Bag maker', series: 5, role: 'worker', i: 26,
  look: { outfit: 'kurti', hairStyle: 'bun', top: 's5', bottom: 'cream', dupatta: true, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1.02 } });

export const STALL_CSS = `
svg .st-glow { transform-box: fill-box; transform-origin: center; animation: st-glow 0.6s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes st-glow { 0% { transform: scale(0.85); opacity: 0.4; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .st-glow { animation: none; } }
`;

const wrap = (o, body) => `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style || o.dim ? ` style="${o.style ?? ''}${o.dim ? ';opacity:0.32' : ''}"` : ''}>${body}</g>`;
const txt = (x, y, t, size, col, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${f1(size)}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;

// Materials (tokens only).
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const AWN = 'var(--sim-series-6)';
const AWN2 = 'var(--sim-bg-surface)';
const CLOTH = 'color-mix(in oklab, var(--sim-series-1) 55%, var(--sim-bg-surface))';
const DRINK = 'color-mix(in oklab, color-mix(in oklab, var(--sim-series-2) 55%, var(--sim-series-3)) 55%, var(--sim-bg-surface))';
const LEMON = 'color-mix(in oklab, var(--sim-series-2) 72%, var(--sim-series-3) 28%)';
const GLASSC = 'color-mix(in oklab, var(--sim-series-7) 12%, var(--sim-bg-surface))';
// An empty glass / jug: no drink to show its shape, so a pale ice body and a muted-label rim (dark on dark otherwise).
const GLASS_EMPTY = 'color-mix(in oklab, var(--sim-ice) 45%, var(--sim-bg-surface))';
const RIM_EMPTY = 'var(--sim-label-muted)';
const SACK = 'color-mix(in oklab, var(--sim-series-8) 28%, var(--sim-bg-surface))';
const CHALK = 'color-mix(in oklab, var(--sim-series-3) 28%, var(--sim-label))';
const CRUST = 'color-mix(in oklab, var(--sim-series-8) 70%, var(--sim-series-2))';

export const STALL = {
  topY: (y, w) => y - w * 0.36,
  awningY: (y, w) => y - w * 0.92,
};
export const stallTop = (y, w) => STALL.topY(y, w);

function stallBack(x, y, w, o) {
  const pole = w * 0.025, px = w * 0.47, aw = w * 1.06, ax = x - aw / 2, aTop = y - w * 1.06, aBot = y - w * 0.98;
  const valH = w * 0.07, n = 8, sw = aw / n, rim = shade(AWN, 66);
  let s = '';
  for (const sx of [-1, 1]) s += rect(x + sx * px - pole / 2, aBot, pole, y - aBot, pole / 2, WOOD, `stroke:${shade(WOOD, 70)};stroke-width:1.5`);
  // the roof band: stripes with a top edge
  s += rect(ax, aTop + 4, aw, aBot - aTop, 6, rim);
  for (let i = 0; i < n; i++) s += `<rect x="${f1(ax + i * sw)}" y="${f1(aTop)}" width="${f1(sw + 0.5)}" height="${f1(aBot - aTop)}" ${fill(i % 2 ? AWN2 : AWN)}/>`;
  s += rect(ax, aTop, aw, aBot - aTop, 6, 'none', `stroke:${rim};stroke-width:2.5`);
  // the scalloped valance
  let d = `M${f1(ax)} ${f1(aBot)}`;
  for (let i = 0; i < n; i++) d += `a${f1(sw / 2)} ${f1(valH)} 0 0 0 ${f1(sw)} 0`;
  s += `<path d="${d}Z" transform="translate(0 3)" ${fill(rim)}/>`;
  for (let i = 0; i < n; i++) {
    s += `<path d="M${f1(ax + i * sw)} ${f1(aBot)}a${f1(sw / 2)} ${f1(valH)} 0 0 0 ${f1(sw)} 0Z" ${fill(i % 2 ? AWN2 : AWN, `stroke:${rim};stroke-width:2`)}/>`;
  }
  const sign = o.sign ?? 'nimbu pani';
  if (sign) {
    const fs = o.signSize ?? Math.max(20, w * 0.09), bw = Math.max(w * 0.5, sign.length * fs * 0.6 + fs * 1.4), bh = fs * 1.7, by = aTop - bh - w * 0.03;
    s += `<path d="M${f1(x - bw * 0.3)} ${f1(by + bh)}V${f1(aTop)}M${f1(x + bw * 0.3)} ${f1(by + bh)}V${f1(aTop)}" ${stroke(WOOD, 4)}/>`;
    s += rect(x - bw / 2, by + 3, bw, bh, 10, shade(WOOD, 70));
    s += rect(x - bw / 2, by, bw, bh, 10, 'var(--sim-bg-surface)', `stroke:${shade(WOOD, 70)};stroke-width:3`);
    s += txt(x, by + bh * 0.5 + fs * 0.36, sign, fs, 'var(--sim-label)');
  }
  return s;
}

function stallFront(x, y, w) {
  const top = y - w * 0.36, slab = w * 0.045, x0 = x - w / 2, hem = y - w * 0.035, n = 9, sw = w / n;
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w * 0.56)}" ry="${f1(w * 0.025)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  // legs peeking under the cloth
  for (const lx of [x0 + w * 0.06, x0 + w * 0.94 - 8]) s += rect(lx, hem - 6, 8, y - hem + 6, 2, shade(WOOD, 70));
  // the cloth: straight top, scalloped hem
  let d = `M${f1(x0)} ${f1(top + slab)}H${f1(x0 + w)}V${f1(hem)}`;
  for (let i = 0; i < n; i++) d += `a${f1(sw / 2)} ${f1(sw * 0.28)} 0 0 1 ${f1(-sw)} 0`;
  d += 'Z';
  const crim = shade(CLOTH, 68);
  s += `<path d="${d}" transform="translate(0 3)" ${fill(crim)}/><path d="${d}" ${fill(CLOTH, `stroke:${crim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  // one woven stripe across the cloth
  s += rect(x0, top + slab + w * 0.07, w, w * 0.035, 0, 'color-mix(in oklab, var(--sim-series-2) 60%, var(--sim-bg-surface))');
  // the table top
  s += rect(x0 - w * 0.02, top + 3, w * 1.04, slab, 4, shade(WOOD, 66));
  s += rect(x0 - w * 0.02, top, w * 1.04, slab, 4, WOOD, `stroke:${shade(WOOD, 66)};stroke-width:2`);
  return s;
}

export function stall(x, y, w = 260, o = {}) {
  const part = o.part ?? 'both';
  const body = (part !== 'front' ? stallBack(x, y, w, o) : '') + (part !== 'back' ? stallFront(x, y, w) : '');
  return wrap(o, body);
}

export function glass(x, y, h = 60, o = {}) {
  const empty = o.full === false, wt = h * 0.68, wb = h * 0.52, top = y - h, lv = top + h * 0.2, rim = empty ? RIM_EMPTY : 'var(--sim-stroke)';
  const at = (yy) => (wb + (wt - wb) * (y - yy) / h) / 2;
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(wb * 0.6)}" ry="${f1(h * 0.05)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  s += `<path d="M${f1(x - wt / 2)} ${f1(top)}L${f1(x - wb / 2)} ${f1(y)}H${f1(x + wb / 2)}L${f1(x + wt / 2)} ${f1(top)}Z" ${fill(empty ? GLASS_EMPTY : GLASSC)}/>`;
  if (o.full !== false) {
    const a = at(lv) - 2.5;
    s += `<path d="M${f1(x - a)} ${f1(lv)}L${f1(x - wb / 2 + 2.5)} ${f1(y - 3)}H${f1(x + wb / 2 - 2.5)}L${f1(x + a)} ${f1(lv)}Z" ${fill(DRINK)}/>`;
    s += `<path d="M${f1(x - a)} ${f1(lv)}H${f1(x + a)}" ${stroke(shade(DRINK, 80), 2)}/>`;
    // two bubbles
    s += `<circle cx="${f1(x - wb * 0.12)}" cy="${f1(y - h * 0.35)}" r="${f1(h * 0.035)}" ${fill('var(--sim-bg-surface)')}/><circle cx="${f1(x + wb * 0.1)}" cy="${f1(y - h * 0.55)}" r="${f1(h * 0.025)}" ${fill('var(--sim-bg-surface)')}/>`;
  }
  s += `<path d="M${f1(x - wt / 2)} ${f1(top)}L${f1(x - wb / 2)} ${f1(y)}H${f1(x + wb / 2)}L${f1(x + wt / 2)} ${f1(top)}" ${stroke(rim, Math.max(2, h * 0.045))}/>`;
  s += `<path d="M${f1(x - wt * 0.32)} ${f1(top + h * 0.12)}L${f1(x - wb * 0.3)} ${f1(y - h * 0.12)}" ${stroke('color-mix(in oklab, var(--sim-bg-surface) 80%, transparent)', Math.max(2, h * 0.05))}/>`;
  if (o.full !== false) {
    // a lemon slice on the rim (a wheel cut through, sitting on the right edge)
    const r = h * 0.17, cx = x + wt / 2 - r * 0.2, cy = top + r * 0.15;
    s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" ${fill(LEMON, `stroke:${shade(LEMON, 70)};stroke-width:2`)}/>`;
    s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * 0.7)}" ${fill('color-mix(in oklab, var(--sim-series-2) 30%, var(--sim-bg-surface))')}/>`;
    for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; s += `<path d="M${f1(cx)} ${f1(cy)}l${f1(Math.cos(a) * r * 0.66)} ${f1(Math.sin(a) * r * 0.66)}" ${stroke(LEMON, 1.6)}/>`; }
  }
  return wrap(o, s);
}

export function jug(x, y, h = 90, o = {}) {
  const empty = o.full === false, w = h * 0.7, top = y - h, rim = empty ? RIM_EMPTY : 'var(--sim-stroke)', x0 = x - w / 2;
  const body = `M${f1(x0 + w * 0.08)} ${f1(top)}H${f1(x0 + w * 0.86)}L${f1(x0 + w * 0.96)} ${f1(y - h * 0.12)}Q${f1(x0 + w)} ${f1(y)} ${f1(x0 + w * 0.82)} ${f1(y)}H${f1(x0 + w * 0.18)}Q${f1(x0)} ${f1(y)} ${f1(x0 + w * 0.04)} ${f1(y - h * 0.12)}Z`;
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w * 0.55)}" ry="${f1(h * 0.04)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  s += `<path d="M${f1(x0 + w * 0.9)} ${f1(top + h * 0.18)}q${f1(w * 0.34)} 0 ${f1(w * 0.3)} ${f1(h * 0.3)}q${f1(-w * 0.04)} ${f1(h * 0.22)} ${f1(-w * 0.24)} ${f1(h * 0.24)}" ${stroke(rim, Math.max(4, h * 0.07))}/>`;
  s += `<path d="${body}" ${fill(empty ? GLASS_EMPTY : GLASSC)}/>`;
  if (o.full !== false) s += `<path d="M${f1(x0 + w * 0.06)} ${f1(top + h * 0.3)}H${f1(x0 + w * 0.9)}L${f1(x0 + w * 0.95)} ${f1(y - h * 0.12)}Q${f1(x0 + w * 0.98)} ${f1(y - 3)} ${f1(x0 + w * 0.82)} ${f1(y - 3)}H${f1(x0 + w * 0.18)}Q${f1(x0 + w * 0.02)} ${f1(y - 3)} ${f1(x0 + w * 0.05)} ${f1(y - h * 0.12)}Z" ${fill(DRINK)}/>`;
  s += `<path d="${body}" ${fill('none', `stroke:${rim};stroke-width:${f1(Math.max(2.5, h * 0.04))};stroke-linejoin:round`)}/>`;
  s += `<path d="M${f1(x0 + w * 0.08)} ${f1(top)}l${f1(-w * 0.1)} ${f1(-h * 0.06)}" ${stroke(rim, Math.max(2.5, h * 0.04))}/>`;
  if (o.full !== false) for (let i = 0; i < 2; i++) s += lemonWheel(x0 + w * (0.35 + i * 0.3), top + h * (0.55 + i * 0.12), h * 0.1);
  return wrap(o, s);
}

function lemonWheel(cx, cy, r) {
  return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" ${fill(LEMON, `stroke:${shade(LEMON, 70)};stroke-width:1.5`)}/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * 0.65)}" ${fill('color-mix(in oklab, var(--sim-series-2) 30%, var(--sim-bg-surface))')}/>`;
}

export function lemon(x, y, r = 14, o = {}) {
  const rim = shade(LEMON, 66);
  const d = `M${f1(x - r * 1.15)} ${f1(y)}Q${f1(x - r)} ${f1(y - r * 0.8)} ${f1(x)} ${f1(y - r * 0.8)}Q${f1(x + r)} ${f1(y - r * 0.8)} ${f1(x + r * 1.15)} ${f1(y)}Q${f1(x + r)} ${f1(y + r * 0.8)} ${f1(x)} ${f1(y + r * 0.8)}Q${f1(x - r)} ${f1(y + r * 0.8)} ${f1(x - r * 1.15)} ${f1(y)}Z`;
  const s = `<path d="${d}" ${fill(LEMON, `stroke:${rim};stroke-width:2`)}/>`
    + `<path d="M${f1(x - r * 0.5)} ${f1(y - r * 0.45)}q${f1(r * 0.4)} ${f1(-r * 0.15)} ${f1(r * 0.8)} 0" ${stroke('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)', Math.max(2, r * 0.16))}/>`
    + `<path d="M${f1(x + r * 1.1)} ${f1(y)}q${f1(r * 0.3)} ${f1(-r * 0.5)} ${f1(r * 0.7)} ${f1(-r * 0.4)}q${f1(-r * 0.2)} ${f1(r * 0.4)} ${f1(-r * 0.7)} ${f1(r * 0.4)}Z" ${fill('var(--sim-series-3)', `stroke:${shade('var(--sim-series-3)', 66)};stroke-width:1.5`)}/>`;
  return wrap(o, s);
}

export function lemonPile(x, y, r = 14, o = {}) {
  const pos = [[-1.9, 0.8], [0, 0.8], [1.9, 0.8], [-0.95, -0.55], [0.95, -0.55]];
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * 3.4)}" ry="${f1(r * 0.4)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  for (const [dx, dy] of pos) s += lemon(x + dx * r, y - r * 1.6 + dy * r, r);
  return wrap(o, s);
}

export function sugarBag(x, y, h = 80, o = {}) {
  const w = h * 0.72, top = y - h, rim = shade(SACK, 62), x0 = x - w / 2;
  const d = `M${f1(x0 + w * 0.12)} ${f1(top + h * 0.2)}Q${f1(x0 - w * 0.04)} ${f1(y - h * 0.3)} ${f1(x0 + w * 0.04)} ${f1(y - h * 0.06)}Q${f1(x)} ${f1(y + h * 0.04)} ${f1(x0 + w * 0.96)} ${f1(y - h * 0.06)}Q${f1(x0 + w * 1.04)} ${f1(y - h * 0.3)} ${f1(x0 + w * 0.88)} ${f1(top + h * 0.2)}Z`;
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w * 0.55)}" ry="${f1(h * 0.04)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  s += `<path d="${d}" ${fill(SACK, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  // the gathered top and the tie
  s += `<path d="M${f1(x0 + w * 0.2)} ${f1(top + h * 0.2)}L${f1(x - w * 0.18)} ${f1(top)}H${f1(x + w * 0.18)}L${f1(x0 + w * 0.8)} ${f1(top + h * 0.2)}Z" ${fill(SACK, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  s += `<path d="M${f1(x0 + w * 0.18)} ${f1(top + h * 0.2)}H${f1(x0 + w * 0.82)}" ${stroke(shade('var(--sim-series-6)', 80), Math.max(3, h * 0.05))}/>`;
  const label = o.label ?? 'sugar';
  if (label) {
    const fs = Math.max(13, h * 0.2);
    s += rect(x - w * 0.36, y - h * 0.56, w * 0.72, fs * 1.4, 4, 'var(--sim-bg-surface)', `stroke:${rim};stroke-width:1.5`);
    s += txt(x, y - h * 0.56 + fs * 1.05, label, fs, 'var(--sim-label)');
  }
  return wrap(o, s);
}

export function cupStack(x, y, h = 80, o = {}) {
  const n = o.n ?? 6, cw = h * 0.5, ch = h * 0.34, step = (h - ch) / Math.max(1, n - 1), rim = 'var(--sim-stroke)';
  const cup = 'color-mix(in oklab, var(--sim-series-1) 18%, var(--sim-bg-surface))';
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(cw * 0.6)}" ry="${f1(h * 0.04)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  // cups stacked mouth-down: the bottom cup is whole, each one above shows its top band
  for (let i = 0; i < n; i++) {
    const yb = y - i * step, yt = yb - ch, wb = cw, wt = cw * 0.72;
    s += `<path d="M${f1(x - wb / 2)} ${f1(yb)}L${f1(x - wt / 2)} ${f1(yt)}H${f1(x + wt / 2)}L${f1(x + wb / 2)} ${f1(yb)}Z" ${fill(cup, `stroke:${rim};stroke-width:2;stroke-linejoin:round`)}/>`;
    s += `<path d="M${f1(x - wb / 2 + 2)} ${f1(yb - 3)}H${f1(x + wb / 2 - 2)}" ${stroke('var(--sim-series-1)', 2.5)}/>`;
  }
  return wrap(o, s);
}

export function priceBoard(x, y, w = 110, price = 5, o = {}) {
  const h = w * 0.8, top = y - w * 1.1, x0 = x - w / 2, frame = shade(WOOD, 80);
  let s = `<path d="M${f1(x0 + w * 0.12)} ${f1(top + h)}L${f1(x0 + w * 0.02)} ${f1(y)}M${f1(x0 + w * 0.88)} ${f1(top + h)}L${f1(x0 + w * 0.98)} ${f1(y)}" ${stroke(frame, Math.max(4, w * 0.05))}/>`;
  s += rect(x0, top + 3, w, h, 8, shade(WOOD, 60));
  s += rect(x0, top, w, h, 8, WOOD);
  s += rect(x0 + w * 0.06, top + w * 0.06, w * 0.88, h - w * 0.12, 4, CHALK);
  const fs = o.size ?? w * 0.36, us = Math.max(14, w * 0.15);
  s += txt(x, top + h * 0.52, price == null ? '' : typeof price === 'string' ? price : RS + group(price), fs, 'var(--sim-bg-deep)');
  s += txt(x, top + h * 0.84, o.unit ?? 'a glass', us, 'color-mix(in oklab, var(--sim-bg-deep) 80%, transparent)', 'middle', 700);
  return wrap(o, s);
}

export function cardHeight(w, n, o = {}) {
  const fs = o.size ?? Math.max(18, w * 0.08), rh = fs * (o.stack ? 2.9 : 2.3);
  return w * 0.08 + (o.title ? fs * 2.2 : fs * 0.6) + n * rh + fs * 0.8;
}

export function reportCard(x, y, w = 260, rows = [], o = {}) {
  const fs = o.size ?? Math.max(18, w * 0.08), rh = fs * (o.stack ? 2.9 : 2.3), H = cardHeight(w, rows.length, o), x0 = x - w / 2;
  const board = WOOD, brim = shade(WOOD, 66);
  let s = rect(x0, y + 4, w, H, 12, brim) + rect(x0, y, w, H, 12, board, `stroke:${brim};stroke-width:2.5`);
  const px = x0 + w * 0.06, py = y + w * 0.08, pw = w * 0.88, ph = H - w * 0.08 - w * 0.05;
  s += rect(px, py, pw, ph, 6, 'var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2');
  // the clip
  const cw = w * 0.34, ch = w * 0.09;
  s += rect(x - cw / 2, y - ch * 0.45, cw, ch, ch * 0.35, 'color-mix(in oklab, var(--sim-stroke) 70%, var(--sim-label))');
  s += rect(x - cw * 0.3, y - ch * 0.75, cw * 0.6, ch * 0.5, ch * 0.2, 'none', 'stroke:color-mix(in oklab, var(--sim-stroke) 70%, var(--sim-label));stroke-width:3');
  let ry = py + (o.title ? fs * 1.75 : fs * 0.2);
  if (o.title) s += txt(x, py + fs * 1.35, o.title, fs * 1.05, 'var(--sim-label)');
  for (const r of rows) {
    const base = ry + (o.stack ? fs * 1.2 : rh * 0.7);
    s += txt(px + fs * 0.6, base, r.label, fs, 'var(--sim-label-muted)', 'start', 700);
    const vx = px + pw - fs * 0.6;
    if (o.stack && (r.value == null || r.value === '')) {
      s += `<path d="M${f1(px + fs * 0.6)} ${f1(base + fs * 1.25)}H${f1(vx)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:8 7')}/>`;
    } else if (r.value == null || r.value === '') {
      const lw = Math.min(pw * 0.32, pw - fs * 0.6 - r.label.length * fs * 0.55 - fs);
      s += `<path d="M${f1(vx - lw)} ${f1(base + 2)}H${f1(vx)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:7 6')}/>`;
    } else s += txt(vx, base, r.value, fs * 1.1, r.col ?? 'var(--sim-label)', 'end');
    ry += rh;
  }
  return wrap(o, s);
}

export function bunting(x0, y0, x1, y1, n = 8, o = {}) {
  const sag = o.sag ?? 24, size = o.size ?? 26, mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag;
  const at = (t) => ({ x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1 });
  let s = `<path d="M${f1(x0)} ${f1(y0)}Q${f1(mx)} ${f1(my)} ${f1(x1)} ${f1(y1)}" ${stroke('var(--sim-stroke)', 2)}/>`;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, p = at(t), col = `var(--sim-series-${[2, 6, 3, 1, 4, 8][i % 6]})`;
    s += `<path d="M${f1(p.x - size * 0.42)} ${f1(p.y)}L${f1(p.x + size * 0.42)} ${f1(p.y)}L${f1(p.x)} ${f1(p.y + size)}Z" ${fill(col, `stroke:${shade(col, 66)};stroke-width:1.5;stroke-linejoin:round`)}/>`;
  }
  return wrap(o, s);
}

export function banner(x, y, w, t, o = {}) {
  const fs = o.size ?? 22, h = fs * 1.9, x0 = x - w / 2, col = o.col ?? 'var(--sim-series-5)', rim = shade(col, 62);
  const bg = `color-mix(in oklab, ${col} 22%, var(--sim-bg-surface))`;
  const d = `M${f1(x0)} ${f1(y - h / 2)}H${f1(x0 + w)}L${f1(x0 + w - h * 0.25)} ${f1(y)}L${f1(x0 + w)} ${f1(y + h / 2)}H${f1(x0)}L${f1(x0 + h * 0.25)} ${f1(y)}Z`;
  let s = `<path d="${d}" transform="translate(0 3)" ${fill(rim)}/><path d="${d}" ${fill(bg, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  s += txt(x, y + fs * 0.36, t, fs, 'var(--sim-label)');
  return wrap(o, s);
}

export function breadLoaf(x, y, w = 60, o = {}) {
  const h = w * 0.45, rim = shade(CRUST, 64);
  let s = `<path d="M${f1(x - w / 2)} ${f1(y)}V${f1(y - h * 0.45)}Q${f1(x - w / 2)} ${f1(y - h)} ${f1(x - w * 0.2)} ${f1(y - h)}H${f1(x + w * 0.2)}Q${f1(x + w / 2)} ${f1(y - h)} ${f1(x + w / 2)} ${f1(y - h * 0.45)}V${f1(y)}Z" ${fill(CRUST, `stroke:${rim};stroke-width:2;stroke-linejoin:round`)}/>`;
  for (let i = 0; i < 3; i++) s += `<path d="M${f1(x - w * 0.24 + i * w * 0.2)} ${f1(y - h * 0.86)}l${f1(w * 0.08)} ${f1(h * 0.3)}" ${stroke(rim, 2)}/>`;
  return wrap(o, s);
}

export function cakeJar(x, y, h = 60, o = {}) {
  const w = h * 0.62, top = y - h * 0.86, rim = 'var(--sim-stroke)', x0 = x - w / 2;
  const layers = ['color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 25%)', 'color-mix(in oklab, var(--sim-series-4) 30%, var(--sim-bg-surface))',
    'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 25%)', 'color-mix(in oklab, var(--sim-series-4) 30%, var(--sim-bg-surface))'];
  let s = rect(x0, top, w, y - top, w * 0.12, GLASSC);
  const lh = (y - top - 6) * 0.8 / layers.length;
  layers.forEach((c, i) => { s += rect(x0 + 3, y - 3 - (i + 1) * lh, w - 6, lh, i === 0 ? w * 0.1 : 0, c); });
  s += rect(x0, top, w, y - top, w * 0.12, 'none', `stroke:${rim};stroke-width:2.5`);
  s += rect(x0 - 3, top - h * 0.14, w + 6, h * 0.14, 4, 'var(--sim-series-4)', `stroke:${shade('var(--sim-series-4)', 66)};stroke-width:2`);
  return wrap(o, s);
}

export function bakery(x, y, w = 300, o = {}) {
  const H = w * 0.9, x0 = x - w / 2, top = y - H, wall = 'color-mix(in oklab, var(--sim-series-2) 18%, var(--sim-bg-surface))', rim = 'var(--sim-stroke)';
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w * 0.56)}" ry="${f1(w * 0.025)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  s += rect(x0, top, w, H, 6, wall, `stroke:${rim};stroke-width:2.5`);
  // the sign band
  const sign = o.sign ?? 'ABC Bakery', fs = o.signSize ?? Math.max(20, w * 0.085), sh = fs * 1.8;
  s += rect(x0 - w * 0.03, top - sh * 0.3, w * 1.06, sh, 8, 'var(--sim-series-8)', `stroke:${shade('var(--sim-series-8)', 62)};stroke-width:2.5`);
  s += txt(x, top - sh * 0.3 + sh * 0.5 + fs * 0.36, sign, fs, 'var(--sim-ink-on-8, var(--sim-bg-deep))');
  // a short striped awning
  const ay = top + sh * 0.85, ah = w * 0.08, n = 8, sw = (w * 1.04) / n, ax = x0 - w * 0.02;
  for (let i = 0; i < n; i++) s += `<path d="M${f1(ax + i * sw)} ${f1(ay)}H${f1(ax + (i + 1) * sw)}V${f1(ay + ah)}a${f1(sw / 2)} ${f1(ah * 0.5)} 0 0 1 ${f1(-sw)} 0Z" ${fill(i % 2 ? 'var(--sim-bg-surface)' : 'var(--sim-series-4)', `stroke:${shade('var(--sim-series-4)', 66)};stroke-width:1.5`)}/>`;
  // the display window with loaves and a jar
  const wx = x0 + w * 0.08, wy = ay + ah * 1.8, ww = w * 0.52, wh = y - wy - w * 0.08;
  s += rect(wx, wy, ww, wh, 6, GLASSC, `stroke:${rim};stroke-width:2.5`);
  s += `<path d="M${f1(wx)} ${f1(wy + wh * 0.72)}H${f1(wx + ww)}" ${stroke(rim, 2)}/>`;
  s += breadLoaf(wx + ww * 0.25, wy + wh * 0.72, ww * 0.3) + breadLoaf(wx + ww * 0.58, wy + wh * 0.72, ww * 0.26) + cakeJar(wx + ww * 0.85, wy + wh * 0.72, wh * 0.4);
  // the door
  const dx = x0 + w * 0.68, dw = w * 0.24;
  s += rect(dx, wy - ah * 0.5, dw, y - wy + ah * 0.5, 4, WOOD, `stroke:${shade(WOOD, 66)};stroke-width:2.5`);
  s += `<circle cx="${f1(dx + dw * 0.8)}" cy="${f1((wy + y) / 2)}" r="${f1(w * 0.012)}" ${fill('var(--sim-series-2)')}/>`;
  return wrap(o, s);
}
