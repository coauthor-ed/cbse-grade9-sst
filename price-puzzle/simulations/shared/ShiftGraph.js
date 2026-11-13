/**
 * ShiftGraph - a market graph with NO numbers whose curves move (added by w3b for L05 s05 MaskWaveScene and
 * s07 FutureSupplyScene; any scene may use it). Same flat look as MarketParts (paper, two axes, big titles),
 * demand in MKT (series-5), supply in SUP (series-7), so "demand" and "supply" read the same as the mango
 * graphs. Model units: quantity 0..12 along, price 0..10 up (no ticks are drawn).
 *   demand  p = 7.5 - 0.9 (q - d)      supply  p = 2 (q - s) - 2      d, s = how far each curve has moved
 *   right (negative: left). The supply curve is steep: makers cannot make many more at once.
 *
 *   gFrame(L, R, T, B, xMax)              a MarketParts frame, xMax 12 (or less: zoom in on E), yMax 10.
 *   eqm(d, s)                             { q, p } where the two curves meet.
 *   gAxes(g, o)                           paper and the two axes, no ticks; o: { yTitle ('price'), xTitle
 *                                         ('quantity'), yTitleX, xTitleY, title (22) }.
 *   shiftGraph(g, o)                      the two curves and E. o: { d, s (0), gd, gs (a dashed ghost of the
 *                                         curve at that shift; null none), fromD, fromS (slide in from that
 *                                         shift: mq-fly), eFrom ({ d, s }: E slides from there), ghostE
 *                                         ({ d, s }: a hollow old E with dashed guides), guides (true: dashed
 *                                         guides from E to both axes), pArrow / qArrow (an arrow along the
 *                                         price / quantity axis from ghostE to E), lab (label size 20), clip
 *                                         (a unique clip id), eName ('E'), eLit (true: accent ring) }.
 *                                         Returns svg. Put BTN_CSS (mq-fly) in the scene css.
 *   DUR                                   0.8 s: the slide time.
 * Colours are tokens only. ASCII only.
 */
import { fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { MKT, txt, frame, arrow } from './MarketParts.js';
import { SUP, SINK } from './SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
export const DUR = 0.8;
const pD = (q, d) => 7.5 - 0.9 * (q - d);
const pS = (q, s) => 2 * (q - s) - 2;
const qD = (p, d) => d + (7.5 - p) / 0.9;
const qS = (p, s) => s + (p + 2) / 2;
const ACC = 'var(--sim-accent)';

export const gFrame = (L, R, T, B, xMax = 12) => frame(L, R, T, B, xMax, 10);

export function eqm(d = 0, s = 0) {
  const q = (9.5 + 0.9 * d + 2 * s) / 2.9;
  return { q, p: pS(q, s) };
}

export function gAxes(g, o = {}) {
  const lab = 'var(--sim-label)', ts = o.title ?? 22;
  let s = `<rect x="${f1(g.L)}" y="${f1(g.T)}" width="${f1(g.R - g.L)}" height="${f1(g.B - g.T)}" ${fill('var(--sim-bg-surface)')}/>`;
  for (let i = 1; i < 4; i++) {
    s += `<path d="M${f1(g.X(i * g.xMax / 4))} ${f1(g.T)}V${f1(g.B)}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.35')}/>`;
    s += `<path d="M${f1(g.L)} ${f1(g.Y(i * 2.5))}H${f1(g.R)}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.35')}/>`;
  }
  s += `<path d="M${f1(g.L)} ${f1(g.T - 8)}V${f1(g.B)}H${f1(g.R + 8)}" ${stroke(lab, 3.5)}/>`;
  s += `<text transform="translate(${f1(o.yTitleX ?? g.L - 22)} ${f1((g.T + g.B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:${lab};font:800 ${ts}px var(--sim-font)">${o.yTitle ?? 'price'}</text>`;
  s += txt((g.L + g.R) / 2, o.xTitleY ?? g.B + 32, o.xTitle ?? 'quantity', ts, lab);
  return s;
}

/** One straight curve over the whole box (the clip trims it). */
function seg(g, kind, sh) {
  const [qa, pa, qb, pb] = kind === 'D' ? [qD(11, sh), 11, qD(-1, sh), -1] : [qS(-1, sh), -1, qS(11, sh), 11];
  return [g.X(qa), g.Y(pa), g.X(qb), g.Y(pb)];
}

function path(g, kind, sh, col, w, extra = '') {
  const [x0, y0, x1, y1] = seg(g, kind, sh);
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke(col, w, extra)}/>`;
}

const fly = (dx, dy, delay = 0) => ` class="mq-fly" style="--dx:${f1(dx)}px;--dy:${f1(dy)}px;--dur:${DUR}s;--d:${delay}s"`;

export function shiftGraph(g, o = {}) {
  const d = o.d ?? 0, s = o.s ?? 0, ls = o.lab ?? 20, id = o.clip ?? 'sgclip';
  const kx = (g.R - g.L) / 12;
  let out = `<clipPath id="${id}"><rect x="${f1(g.L)}" y="${f1(g.T - 6)}" width="${f1(g.R - g.L + 6)}" height="${f1(g.B - g.T + 6)}"/></clipPath>`;
  let body = '';
  const ghost = 'stroke-dasharray:10 9;opacity:0.6';
  if (o.gd != null && o.gd !== d) body += path(g, 'D', o.gd, 'var(--sim-label-muted)', 5, ghost);
  if (o.gs != null && o.gs !== s) body += path(g, 'S', o.gs, 'var(--sim-label-muted)', 5, ghost);
  const slD = o.fromD != null && o.fromD !== d ? fly((o.fromD - d) * kx, 0) : '';
  const slS = o.fromS != null && o.fromS !== s ? fly((o.fromS - s) * kx, 0) : '';
  body += `<g${slD}>${path(g, 'D', d, MKT, 7)}</g><g${slS}>${path(g, 'S', s, SUP, 7)}</g>`;
  out += `<g clip-path="url(#${id})">${body}</g>`;
  // curve names: supply right of its top end, demand below-left of its lower end (clear of each other)
  const halo = (t) => t.replace('style="', 'style="paint-order:stroke;stroke:var(--sim-bg-surface);stroke-width:6;stroke-linejoin:round;');
  const sq = Math.min(g.xMax - 0.8, qS(10, s));
  let dq = qD(2.2, d), dp = 2.2;
  if (dq > g.xMax - 0.4) { dq = g.xMax - 0.4; dp = pD(dq, d); }
  out += `<g${slS}>${halo(txt(g.X(sq) - 4, g.T - 10, 'supply', ls, SINK(7), 'start'))}</g>`;
  out += `<g${slD}>${halo(txt(g.X(dq) - 10, g.Y(dp) + ls + 6, 'demand', ls, SINK(5), 'end'))}</g>`;
  const e = eqm(d, s), ex = g.X(e.q), ey = g.Y(e.p);
  if (o.ghostE) {
    const e0 = eqm(o.ghostE.d, o.ghostE.s), x0 = g.X(e0.q), y0 = g.Y(e0.p);
    out += `<path d="M${f1(g.L)} ${f1(y0)}H${f1(x0)}V${f1(g.B)}" ${stroke('var(--sim-label-muted)', 2, 'stroke-dasharray:5 6')}/>`;
    out += `<circle cx="${f1(x0)}" cy="${f1(y0)}" r="9" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:4 3')}/>`;
    const late = o.fromD != null || o.fromS != null ? ` class="mq-fade" style="--d:${DUR}s"` : '';
    let ar = '';
    if (o.pArrow && Math.abs(y0 - ey) > 26) ar += arrow(g.L + 18, y0 + (ey < y0 ? -6 : 6), g.L + 18, ey + (ey < y0 ? 8 : -8), ACC, 5);
    if (o.qArrow && Math.abs(x0 - ex) > 26) ar += arrow(x0 + (ex > x0 ? 6 : -6), g.B - 18, ex + (ex > x0 ? -8 : 8), g.B - 18, ACC, 5);
    out += `<g${late}>${ar}</g>`;
  }
  const eSl = o.eFrom ? (() => { const f = eqm(o.eFrom.d, o.eFrom.s); return fly(g.X(f.q) - ex, g.Y(f.p) - ey); })() : '';
  let eg = '';
  if (o.guides !== false) eg += `<path d="M${f1(g.L)} ${f1(ey)}H${f1(ex)}V${f1(g.B)}" ${stroke(ACC, 3, 'stroke-dasharray:9 8')}/>`;
  if (o.eLit !== false) eg += `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="20" ${fill('color-mix(in oklab, var(--sim-accent) 18%, transparent)', 'stroke:var(--sim-accent);stroke-width:4')}/>`;
  eg += `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="9" ${fill('var(--sim-label)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
  eg += txt(ex + 22, ey - 16, o.eName ?? 'E', 30, ACC, 'start');
  out += `<g${eSl}>${eg}</g>`;
  return out;
}

/** Where E sits in stage units, for scenes that place a pill next to it. */
export function ePos(g, d = 0, s = 0) { const e = eqm(d, s); return { x: g.X(e.q), y: g.Y(e.p), q: e.q, p: e.p }; }
