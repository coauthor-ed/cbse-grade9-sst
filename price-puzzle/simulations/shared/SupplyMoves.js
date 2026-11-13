/**
 * SupplyMoves - the market supply curve SmSm' that moves (added by w2b for L03 s08 SupplyRecapScene and L04 s01
 * SupplyShiftScene; any scene may use it). Same graph look as MarketParts (L01 DemandCurveScene). Design units.
 * Table 9.2 market supply: (6 kg, Rs 50), (12 kg, Rs 100), (18 kg, Rs 150); the line runs (1.5, 12.5) ->
 * (19.5, 162.5). A shift of d kg moves the whole line d kg along (no numbers are drawn for a moved curve).
 *
 *   SHIFT                                  5 (kg): how far a whole-curve move goes.
 *   qAt(p, d)                              kg on the curve shifted d at price p.
 *   smGraph(g, o)                          the curve on frame g (MarketParts frame, xMax 26 suits): o = { d (shift,
 *                                          0), ghost (true: the d = 0 curve dashed when d != 0), from (the shift it
 *                                          slides from, for a slide-in), arrows (true: an arrow at Rs 50/100/150
 *                                          from the ghost to the curve once at rest), pop (fade the arrows in),
 *                                          w (7), lab (label size 28) }. Returns svg. A curve moved left
 *                                          keeps only its Sm' label (left of the top end; the foot is clipped).
 *   smLabel(x, y, prime, size, anchor)     "Sm" / "Sm'" in series-7 ink.
 *   moverIcon(kind, x, y, s)               a picture for a thing that moves the curve, centred on (x, y), about s
 *                                          wide: 'crop' (SimFarm wheat + chickpea strips), 'sellers' (three
 *                                          small stalls), 'tech' (a drip pipe dripping on young plants),
 *                                          'expect' (a calendar with an up arrow), 'price' (a price board).
 *   DIR_COL(d)                             right: var(--sim-good), left: var(--sim-bad) (as L02 DemandRecapScene).
 * Colours are tokens only. ASCII only.
 */
import { fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { farmSpec, farmSvg } from 'simulations/base/kit/SimFarm.js';
import { line, arrow } from './MarketParts.js';
import { priceBoard } from './MangoKit.js';
import { SUP, SINK, stallArt } from './SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
export const SHIFT = 5;
const Q0 = 1.5, P0 = 12.5, Q1 = 19.5, P1 = 162.5, SL = (P1 - P0) / (Q1 - Q0);
export const qAt = (p, d = 0) => Q0 + (p - P0) / SL + d;
export const DIR_COL = (d) => (d > 0 ? 'var(--sim-good)' : 'var(--sim-bad)');

export function smLabel(x, y, prime, size = 28, anchor = 'start') {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${SINK(7)};font:800 ${size}px var(--sim-font)">S<tspan style="font-size:${Math.round(size * 0.68)}px" dy="${Math.round(size * 0.2)}">m</tspan>${prime ? `<tspan dy="-${Math.round(size * 0.2)}">'</tspan>` : ''}</text>`;
}

/** The ends of the curve shifted d, clipped so it starts at 0.6 kg or more and ends by g.xMax - 0.4. */
function ends(g, d) {
  let qa = Q0 + d, pa = P0, qb = Q1 + d, pb = P1;
  if (qa < 0.6) { pa = P0 + (0.6 - qa) * SL; qa = 0.6; }
  const top = g.xMax - 0.4;
  if (qb > top) { pb = P1 - (qb - top) * SL; qb = top; }
  return [qa, pa, qb, pb];
}

export function smGraph(g, o = {}) {
  const d = o.d ?? 0, w = o.w ?? 7, ls = o.lab ?? 28;
  let s = '';
  if (d !== 0 && o.ghost !== false) {
    const [a, b, c, e] = ends(g, 0);
    s += line(g, a, b, c, e, 'var(--sim-label-muted)', { w: 5, dash: '10 9', opacity: 0.6 });
  }
  const [a, b, c, e] = ends(g, d);
  const slide = o.from != null && o.from !== d ? ` class="mq-fly" style="--dx:${f1(g.X(o.from) - g.X(d))}px;--dy:0px;--dur:0.8s"` : '';
  s += `<g${slide}>${line(g, a, b, c, e, SUP, { w })}`
    + (d < 0 ? '' : smLabel(g.X(a) + 14, g.Y(b) + 6, false, ls))
    + (d < 0 ? smLabel(g.X(c) - 12, g.Y(e) + 4, true, ls, 'end') : smLabel(g.X(c) + 8, g.Y(e) + 8, true, ls)) + '</g>';
  if (d !== 0 && o.arrows) {
    let ar = '';
    for (const p of [150, 100, 50]) {
      const x0 = g.X(qAt(p, 0)), x1 = g.X(qAt(p, d)), k = d > 0 ? 1 : -1;
      if (Math.abs(x1 - x0) > 30) ar += arrow(x0 + k * 12, g.Y(p), x1 - k * 14, g.Y(p), DIR_COL(d), 4.5);
    }
    s += `<g${o.pop ? ' class="mq-fade"' : ''}>${ar}</g>`;
  }
  return s;
}

/** A drip pipe along a strip of young plants, drops falling. */
function drip(x, y, s) {
  const k = s / 120, x0 = x - 58 * k, x1 = x + 58 * k, gy = y + 26 * k;
  let o = `<rect x="${f1(x0 - 4 * k)}" y="${f1(gy)}" width="${f1(124 * k)}" height="${f1(16 * k)}" rx="${f1(6 * k)}" ${fill('color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))', 'stroke:color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label));stroke-width:2')}/>`;
  for (let i = 0; i < 4; i++) {
    const px = x0 + (i + 0.5) * (116 * k / 4);
    o += `<path d="M${f1(px)} ${f1(gy)}V${f1(gy - 22 * k)}" ${stroke('var(--sim-series-3)', 3 * k)}/>`
      + `<path d="M${f1(px)} ${f1(gy - 16 * k)}c${f1(-12 * k)} ${f1(-2 * k)} ${f1(-14 * k)} ${f1(-12 * k)} ${f1(-14 * k)} ${f1(-14 * k)}c${f1(8 * k)} 0 ${f1(14 * k)} ${f1(4 * k)} ${f1(14 * k)} ${f1(14 * k)}z" ${fill('var(--sim-series-3)')}/>`
      + `<path d="M${f1(px)} ${f1(gy - 12 * k)}c${f1(12 * k)} ${f1(-2 * k)} ${f1(14 * k)} ${f1(-12 * k)} ${f1(14 * k)} ${f1(-14 * k)}c${f1(-8 * k)} 0 ${f1(-14 * k)} ${f1(4 * k)} ${f1(-14 * k)} ${f1(14 * k)}z" ${fill('color-mix(in oklab, var(--sim-series-3) 70%, var(--sim-bg-surface))')}/>`;
  }
  const py = y - 22 * k;
  o += `<path d="M${f1(x0 - 6 * k)} ${f1(py)}H${f1(x1 + 6 * k)}" ${stroke('var(--sim-label)', 9 * k)}/>`;
  o += `<path d="M${f1(x0 - 6 * k)} ${f1(py)}H${f1(x1 + 6 * k)}" ${stroke('color-mix(in oklab, var(--sim-label) 55%, var(--sim-bg-surface))', 4 * k)}/>`;
  for (let i = 0; i < 4; i++) {
    const px = x0 + (i + 0.5) * (116 * k / 4) + 10 * k;
    o += `<path d="M${f1(px)} ${f1(py + 8 * k)}c${f1(-4 * k)} ${f1(6 * k)} ${f1(-4 * k)} ${f1(10 * k)} 0 ${f1(10 * k)}c${f1(4 * k)} 0 ${f1(4 * k)} ${f1(-4 * k)} 0 ${f1(-10 * k)}z" ${fill('var(--sim-water)')}/>`;
  }
  return o;
}

function icon48(name, x, y, s, tone) {
  return iconSvg(name, tone).replace('<svg class="sim-icon" viewBox="0 0 48 48" width="48" height="48"', `<svg class="sim-icon" viewBox="0 0 48 48" x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${f1(s)}" height="${f1(s)}"`);
}

export function moverIcon(kind, x, y, s = 120) {
  if (kind === 'crop') {
    const w = s, h = s * 0.66;
    const spec = farmSpec({ strips: [{ crop: 'wheat', soil: 'loam' }, { crop: 'pulse', soil: 'loam' }], orient: 'rows', w, h, gap: 4, border: false });
    return farmSvg(spec, { x: x - w / 2, y: y - h / 2, tags: false });
  }
  if (kind === 'sellers') {
    const w = s * 0.46, gy = y + s * 0.3;
    return stallArt(x - s * 0.34, gy - s * 0.08, w) + stallArt(x + s * 0.34, gy - s * 0.08, w) + stallArt(x, gy, w * 1.1);
  }
  if (kind === 'tech') return drip(x, y, s);
  if (kind === 'expect') {
    const k = s / 120;
    return icon48('calendar', x - 12 * k, y, s * 0.7, 'var(--sim-series-4)')
      + `<path d="M${f1(x + 40 * k)} ${f1(y + 26 * k)}V${f1(y - 22 * k)}" ${stroke('var(--sim-accent)', 7 * k)}/>`
      + `<path d="M${f1(x + 26 * k)} ${f1(y - 14 * k)}L${f1(x + 40 * k)} ${f1(y - 32 * k)}L${f1(x + 54 * k)} ${f1(y - 14 * k)}Z" ${fill('var(--sim-accent)', 'stroke:var(--sim-accent);stroke-width:3;stroke-linejoin:round')}/>`;
  }
  if (kind === 'price') return priceBoard(x, y, 100, { w: s * 0.9, h: s * 0.4, unit: '' });
  return '';
}
