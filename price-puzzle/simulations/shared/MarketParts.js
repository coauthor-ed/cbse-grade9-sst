/**
 * MarketParts - small SVG parts shared by the L02 scenes (price-puzzle): the flat graph look of L01's
 * DemandCurveScene (paper, two axes, Rs ticks up the side, kg along the bottom, big axis titles, round dots
 * with a letter, dashed guides), a market crate, tags, arrows and the in-figure button look. Plain functions
 * returning SVG / overlay strings; design units.
 *
 *   MKT                                 the market colour (var(--sim-series-5)); buyers keep series 1..3.
 *   txt(x, y, t, size, col, anchor)     one line of text (800 weight, var(--sim-font)).
 *   frame(L, R, T, B, xMax, yMax)       a graph frame: { L, R, T, B, X(q), Y(p) }.
 *   axes(g, o)                          paper, the two axes, ticks and titles. o: { xs (kg ticks, [] = none),
 *                                       ys (rupee ticks, [] = none), tick (20), title (22), yTitleX, xTitleY,
 *                                       yTitle, xTitle, dim }.
 *   line(g, q0, p0, q1, p1, col, o)     a straight curve from (q0, p0) to (q1, p1); o: { w (7), draw (s: draws
 *                                       itself), delay, dash, opacity, cls, style }.
 *   dot(x, y, name, o)                  a point with its letter; o: { col, r, lit, size, ldx, ldy }.
 *   guides(g, q, p, o)                  dashed guides from (q, p) to both axes; o: { lit, col }.
 *   arrow(x1, y1, x2, y2, col, w)       an arrow, head at (x2, y2).
 *   pill(x, y, t, o)                    a pill tag centred on (x, y); o: { size (20), bg, ink, edge, padX }.
 *   crate(x, y, kg, o)                  a wooden market crate, (x, y) bottom centre, w (default 150); a heap of
 *                                       3 mangoes per kg sits in it (r from o.r, default 8); o.q: a big "?" in
 *                                       the empty crate. Height 0.55 w.
 *   BTN_CSS                             the button look (.mq-btn, .mq-btn--go, .mq-btn--on, .mq-ab anchor,
 *                                       .mq-hit, .mq-pop, .mq-fade, .mq-fly); add once to css().
 *   btn(act, label, x, y, o)            an in-figure button centred on (x, y); o: { go, on, val, aria, size }.
 * Colours are tokens only. ASCII only.
 */
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { heap, RS } from './MangoKit.js';

const f1 = (v) => (+v).toFixed(1);
export const MKT = 'var(--sim-series-5)';

export const BTN_CSS = `
.mq-ab { position: absolute; transform: translate(-50%, -50%); }
.mq-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mq-btn--on { background: color-mix(in oklab, var(--sim-accent) 22%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.mq-btn--go { background: var(--primary-color, var(--sim-accent)); color: var(--on-primary, var(--sim-ink-on-accent, var(--sim-bg-deep))); border-color: transparent;
  box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 55%, var(--sim-stroke)); }
.mq-btn:active { transform: translateY(3px); box-shadow: none; }
.mq-btn:focus-visible, .mq-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.mq-hit { position: absolute; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 14px; }
.mq-hit:hover { background: color-mix(in oklab, var(--sim-accent) 10%, transparent); }
svg .mq-pop { transform-box: fill-box; transform-origin: center; animation: mq-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes mq-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .mq-fade, .mq-fade { animation: mq-fade 0.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes mq-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .mq-fly, .mq-fly { animation: mq-fly var(--dur, 0.6s) cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes mq-fly { 0% { transform: translate(var(--dx, 0px), var(--dy, 0px)); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .mq-pop, svg .mq-fade, svg .mq-fly, .mq-fade, .mq-fly { animation: none; } }
`;

export const txt = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

export function frame(L, R, T, B, xMax = 20, yMax = 200) {
  return { L, R, T, B, X: (q) => L + (q / xMax) * (R - L), Y: (p) => B - (p / yMax) * (B - T), xMax, yMax };
}

export function axes(g, o = {}) {
  const lab = o.dim ? 'var(--sim-label-muted)' : 'var(--sim-label)';
  const xs = o.xs ?? [3, 6, 9, 12, 15, 18], ys = o.ys ?? [50, 100, 150];
  let s = `<rect x="${f1(g.L)}" y="${f1(g.T)}" width="${f1(g.R - g.L)}" height="${f1(g.B - g.T)}" ${fill('var(--sim-bg-surface)')}/>`;
  for (const q of (o.gridX ?? xs)) s += `<path d="M${f1(g.X(q))} ${f1(g.T)}V${f1(g.B)}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.45')}/>`;
  for (const p of (o.gridY ?? ys)) s += `<path d="M${f1(g.L)} ${f1(g.Y(p))}H${f1(g.R)}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.45')}/>`;
  for (const p of ys) s += txt(g.L - 10, g.Y(p) + 7, `${RS}${p}`, o.tick ?? 20, 'var(--sim-label-muted)', 'end');
  for (const q of xs) s += txt(g.X(q), g.B + 28, String(q), o.tick ?? 20, 'var(--sim-label-muted)');
  s += `<path d="M${f1(g.L)} ${f1(g.T - 8)}V${f1(g.B)}H${f1(g.R + 8)}" ${stroke(lab, 3.5)}/>`;
  s += `<text transform="translate(${f1(o.yTitleX ?? g.L - 76)} ${f1((g.T + g.B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:${lab};font:800 ${o.title ?? 22}px var(--sim-font)">${o.yTitle ?? `price (${RS} per kg)`}</text>`;
  s += txt((g.L + g.R) / 2, o.xTitleY ?? g.B + 62, o.xTitle ?? 'quantity (kg)', o.title ?? 22, lab);
  return s;
}

export function line(g, q0, p0, q1, p1, col, o = {}) {
  const x0 = g.X(q0), y0 = g.Y(p0), x1 = g.X(q1), y1 = g.Y(p1), len = Math.hypot(x1 - x0, y1 - y0);
  const draw = o.draw ? ` class="sv-draw" style="--len:${f1(len)};--dur:${o.draw}s;--d:${o.delay ?? 0}s"` : (o.cls ? ` class="${o.cls}" style="${o.style ?? ''}"` : '');
  const extra = [o.dash ? `stroke-dasharray:${o.dash}` : '', o.opacity != null ? `opacity:${o.opacity}` : ''].filter(Boolean).join(';');
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}"${draw} ${stroke(col, o.w ?? 7, extra)}/>`;
}

export function dot(x, y, name, o = {}) {
  const r = o.r ?? 11, col = o.col ?? MKT;
  let s = o.lit ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r + 8}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3.5')}/>` : '';
  s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
  if (name) s += txt(x + (o.ldx ?? 16), y + (o.ldy ?? -14), name, o.size ?? 28, 'var(--sim-label)', 'start');
  return s;
}

export function guides(g, q, p, o = {}) {
  const col = o.col ?? (o.lit ? 'var(--sim-accent)' : 'var(--sim-label-muted)');
  return `<path d="M${f1(g.L)} ${f1(g.Y(p))}H${f1(g.X(q))}V${f1(g.B)}" ${stroke(col, o.lit ? 2.5 : 2, 'stroke-dasharray:6 6')}/>`;
}

export function arrow(x1, y1, x2, y2, col, w = 6) {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = w * 3, hw = w * 2;
  const bx = x2 - Math.cos(a) * hl, by = y2 - Math.sin(a) * hl;
  const px = -Math.sin(a) * hw, py = Math.cos(a) * hw;
  return `<path d="M${f1(x1)} ${f1(y1)}L${f1(bx)} ${f1(by)}" ${stroke(col, w)}/>`
    + `<path d="M${f1(x2)} ${f1(y2)}L${f1(bx + px)} ${f1(by + py)}L${f1(bx - px)} ${f1(by - py)}Z" ${fill(col, `stroke:${col};stroke-width:2;stroke-linejoin:round`)}/>`;
}

export function pill(x, y, t, o = {}) {
  const fs = o.size ?? 20, tw = String(t).replace(/&[a-z#0-9]+;/g, 'x').length * fs * 0.56 + (o.padX ?? fs * 1.1), th = fs * 1.55;
  const bg = o.bg ?? 'var(--sim-bg-surface)', ink = o.ink ?? 'var(--sim-label)', edge = o.edge ?? 'var(--sim-stroke)';
  return `<rect x="${f1(x - tw / 2)}" y="${f1(y - th / 2)}" width="${f1(tw)}" height="${f1(th)}" rx="${f1(th / 2)}" ${fill(bg, `stroke:${edge};stroke-width:2.5`)}/>`
    + txt(x, y + fs * 0.36, t, fs, ink);
}

export function crate(x, y, kg, o = {}) {
  const w = o.w ?? 150, h = w * 0.55, wood = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))';
  const rim = shade(wood, 60), x0 = x - w / 2, top = y - h;
  let s = `<rect x="${f1(x0 + 6)}" y="${f1(top - 10)}" width="${f1(w - 12)}" height="${f1(h)}" rx="6" ${fill(shade(wood, 78), `stroke:${rim};stroke-width:2.5`)}/>`;
  if (kg > 0) s += heap(x, top + h * 0.45, kg, { r: o.r ?? 8 });
  s += `<rect x="${f1(x0)}" y="${f1(top + h * 0.28)}" width="${f1(w)}" height="${f1(h * 0.72)}" rx="7" ${fill(wood, `stroke:${rim};stroke-width:3`)}/>`;
  s += `<path d="M${f1(x0 + 4)} ${f1(top + h * 0.64)}H${f1(x0 + w - 4)}" ${stroke(rim, 2.5)}/>`;
  for (const fx of [0.12, 0.88]) s += `<path d="M${f1(x0 + w * fx)} ${f1(top + h * 0.3)}V${f1(y - 3)}" ${stroke(rim, 3)}/>`;
  if (o.q) s += txt(x, top + h * 0.86, '?', w * 0.36, 'var(--sim-label-muted)');
  return s;
}

export function btn(act, label, x, y, o = {}) {
  const cls = `mq-btn${o.go ? ' mq-btn--go' : ''}${o.on ? ' mq-btn--on' : ''}`;
  const val = o.val != null ? ` data-val="${o.val}"` : '';
  const aria = o.aria ? ` aria-label="${o.aria}"` : '';
  const pressed = o.on != null ? ` aria-pressed="${o.on ? 'true' : 'false'}"` : '';
  const fs = o.size ? ` style="font-size:${o.size}px"` : '';
  return `<div class="mq-ab" style="left:${f1(x)}px;top:${f1(y)}px"><button type="button" class="sv-hit tap btn ${cls}" data-act="${act}"${val}${aria}${pressed}${fs}>${label}</button></div>`;
}
