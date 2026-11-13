/**
 * MoneyKit - the personal-finances course cast: plain functions that return SVG strings for an SvgScene stage.
 * Flat Quill look, tokens only, no faces on objects, no banknote art (money is a number on a tag or a coin).
 * Kit candidate (with FinPeople): coins, tags, jar, gullak. Add MONEY_CSS once to the scene's css().
 *
 *   RS, rs(n)                                the rupee sign; rs(2000) -> sign + '2,000' (Indian grouping:
 *                                            1,00,000 for a lakh).
 *   TONE                                     { need, want, save, plain } -> CSS colour. Needs, wants and savings
 *                                            are three different series colours; the word on the tag or row
 *                                            always says which (never colour alone).
 *   coin(x, y, r, { dim, cls, style })       one coin face-on, centre (x, y), 2r across (r default 14), with a
 *                                            rupee sign.
 *   coinPile(x, y, rupees, { r, dim, cls })  a heap of coins, one per Rs 100 (rounded), stacked in rows that
 *                                            narrow upwards; (x, y) = bottom centre. r default 14. A base row of b
 *                                            coins is about 1.75 r b wide; 20 coins (Rs 2,000) = 6 rows, base 6.
 *                                            rupees 0 draws a faint dashed ring (the empty spot).
 *   giftCover(x, y, { w, tag, dim, cls })    a gift envelope centred on (x, y); w default 120, height 0.64w.
 *                                            A flap, one pattern stripe, an optional small tag text (tag: '...').
 *   tag(x, y, label, rupees, { w, tone, dim, cls, ring })   a price tag centred on (x, y): a hole + string on
 *                                            the left, label (2-3 words) on top, rupees big under it. w default
 *                                            128, height 0.46w. tone 'need' | 'want' | 'save' | 'plain'
 *                                            (default plain). ring: an accent outline (to point at one tag).
 *   jar(x, y, rupees, target, { w, h, max, label, dim, cls, lid })   a clear jar, (x, y) = bottom centre,
 *                                            w default 160, h default 1.3w (body). Coins fill it to rupees on a
 *                                            scale of max (default 1.1 x target). A dashed target line with its
 *                                            amount (label overrides the text; target null = no line).
 *                                            jarLevel(y, rupees, { h, max, target }) gives the y of a fill level.
 *   gullak(x, y, { w, dim, cls })            a round clay pot with a coin slit on top; (x, y) = bottom centre;
 *                                            w default 120, about 1.05w tall.
 *   bicycle(x, y, w, { col, dim, cls })      a side-view bicycle, no rider, facing right; (x, y) = ground under
 *                                            the middle; w default 180 (wheel edge to wheel edge), about 0.5w tall;
 *                                            wheelbase 1.6 x wheel diameter, a clear gap between the wheels.
 *                                            col: the frame colour (default --sim-series-1).
 *   paper(x, y, w, { dim, cls })             a written plan: a sheet with ruled lines and a pen; centre (x, y),
 *                                            w default 80, height 1.25w.
 * ASCII only (the rupee sign is built from its code point).
 */
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';

export const RS = String.fromCharCode(0x20b9);
const f1 = (v) => (+v).toFixed(1);

/** Indian digit grouping: 1500 -> 1,500; 100000 -> 1,00,000. */
export function group(n) {
  const s = String(Math.round(Math.abs(n)));
  const neg = n < 0 ? '-' : '';
  if (s.length <= 3) return neg + s;
  const last = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts = [];
  while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
  if (rest) parts.unshift(rest);
  return neg + parts.join(',') + ',' + last;
}
export const rs = (n) => RS + group(n);

export const TONE = {
  need: 'var(--sim-series-5)',
  want: 'var(--sim-series-8)',
  save: 'var(--sim-series-3)',
  plain: 'var(--sim-bg-surface)',
};
const COIN = 'var(--sim-series-2)';
const CLAY = 'color-mix(in oklab, var(--sim-series-8) 62%, var(--sim-series-6))';
const GLASS = 'color-mix(in oklab, var(--sim-series-7) 10%, var(--sim-bg-surface))';
const GIFT = 'var(--sim-series-6)';

export const MONEY_CSS = `
svg .mk-pop { transform-box: fill-box; transform-origin: center; animation: mk-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes mk-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .mk-fly { animation: mk-fly 0.5s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes mk-fly { 0% { transform: translate(var(--dx, 0px), var(--dy, 0px)) scale(0.7); opacity: 0.4; } 100% { transform: none; opacity: 1; } }
svg .mk-grow { transform-box: fill-box; transform-origin: left center; animation: mk-grow 0.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes mk-grow { 0% { transform: scaleX(0); } 100% { transform: none; } }
svg .mk-rise { transform-box: fill-box; transform-origin: bottom center; animation: mk-rise 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes mk-rise { 0% { transform: scaleY(0); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .mk-pop, svg .mk-fly, svg .mk-grow, svg .mk-rise { animation: none; } }
`;

const wrap = (o, body) => `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style || o.dim ? ` style="${o.style ?? ''}${o.dim ? ';opacity:0.32' : ''}"` : ''}>${body}</g>`;
const txt = (x, y, t, size, col, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${f1(size)}px var(--sim-font)">${t}</text>`;

export function coin(x, y, r = 14, o = {}) {
  const rim = shade(COIN, 66);
  const body = `<circle cx="${f1(x)}" cy="${f1(y + r * 0.12)}" r="${f1(r)}" ${fill(rim)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(COIN, `stroke:${rim};stroke-width:${f1(Math.max(1.2, r * 0.1))}`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 0.72)}" ${fill('none', `stroke:${rim};stroke-width:${f1(Math.max(1, r * 0.07))};opacity:0.6`)}/>`
    + (r >= 15 ? txt(x, y + r * 0.36, RS, r * 1.0, rim) : '');
  return wrap(o, body);
}

/** Rows (bottom first) for n coins: a pyramid base b, each row one fewer; leftovers on top. */
function pileRows(n) {
  if (n <= 0) return [];
  let b = Math.ceil((Math.sqrt(8 * n + 1) - 1) / 2);
  const out = [];
  let left = n;
  while (left > 0 && b > 0) { const m = Math.min(left, b); out.push(m); left -= m; b--; }
  if (left > 0) out.push(left);
  return out;
}

export function coinPile(x, y, rupees, o = {}) {
  const r = o.r ?? 14, n = Math.round(Math.max(0, rupees) / 100);
  if (n === 0) {
    return wrap(o, `<ellipse cx="${f1(x)}" cy="${f1(y - r * 0.5)}" rx="${f1(r * 3)}" ry="${f1(r * 0.8)}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2;stroke-dasharray:5 6')}/>`);
  }
  const rows = pileRows(n), dx = r * 1.75, dy = r * 1.32;
  let body = `<ellipse cx="${f1(x)}" cy="${f1(y - r * 0.15)}" rx="${f1(rows[0] * dx * 0.55 + r)}" ry="${f1(r * 0.45)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  rows.forEach((m, j) => {
    const cy = y - r - j * dy;
    for (let i = 0; i < m; i++) body += coin(x + (i - (m - 1) / 2) * dx, cy, r);
  });
  return wrap(o, body);
}

export function giftCover(x, y, o = {}) {
  const w = o.w ?? 120, h = w * 0.64, x0 = x - w / 2, y0 = y - h / 2, rim = shade(GIFT, 64), gold = COIN;
  let body = `<rect x="${f1(x0)}" y="${f1(y0 + 3)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w * 0.06)}" ${fill(rim)}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w * 0.06)}" ${fill(GIFT, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0 + h * 0.62)}" width="${f1(w)}" height="${f1(h * 0.14)}" ${fill(gold)}/>`;
  for (let i = 0; i < 6; i++) body += `<circle cx="${f1(x0 + w * (0.1 + i * 0.16))}" cy="${f1(y0 + h * 0.69)}" r="${f1(h * 0.035)}" ${fill(rim)}/>`;
  body += `<path d="M${f1(x0)} ${f1(y0)}L${f1(x)} ${f1(y0 + h * 0.46)}L${f1(x0 + w)} ${f1(y0)}" ${fill(shade(GIFT, 82), `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y0 + h * 0.42)}" r="${f1(h * 0.09)}" ${fill(gold, `stroke:${shade(gold, 66)};stroke-width:2`)}/>`;
  if (o.tag) {
    const fs = Math.max(14, w * 0.15), tw = o.tag.length * fs * 0.6 + fs, ty = y0 + h + 10;
    body += `<path d="M${f1(x + w * 0.3)} ${f1(y0 + h * 0.8)}L${f1(x + w * 0.3)} ${f1(ty)}" ${stroke('var(--sim-stroke)', 2)}/>`
      + `<rect x="${f1(x + w * 0.3 - tw / 2)}" y="${f1(ty)}" width="${f1(tw)}" height="${f1(fs * 1.5)}" rx="6" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
      + txt(x + w * 0.3, ty + fs * 1.1, o.tag, fs, 'var(--sim-label)');
  }
  return wrap(o, body);
}

export function tag(x, y, label, rupees, o = {}) {
  const w = o.w ?? 128, h = o.h ?? w * 0.46, t = o.tone ?? 'plain', col = TONE[t] ?? TONE.plain;
  const plain = t === 'plain';
  const rim = plain ? 'var(--sim-stroke)' : shade(col, 66);
  const ink = plain ? 'var(--sim-label)' : 'var(--sim-label)';
  const bg = plain ? 'var(--sim-bg-surface)' : `color-mix(in oklab, ${col} 26%, var(--sim-bg-surface))`;
  const x0 = x - w / 2, y0 = y - h / 2, n = h * 0.32;
  const d = `M${f1(x0 + n)} ${f1(y0)}H${f1(x0 + w - 8)}Q${f1(x0 + w)} ${f1(y0)} ${f1(x0 + w)} ${f1(y0 + 8)}V${f1(y0 + h - 8)}Q${f1(x0 + w)} ${f1(y0 + h)} ${f1(x0 + w - 8)} ${f1(y0 + h)}H${f1(x0 + n)}L${f1(x0)} ${f1(y)}Z`;
  const ls = o.labelSize ?? Math.max(13, Math.min(h * 0.34, w * 0.15, (w - n - 14) / (Math.max(1, String(label ?? '').length) * 0.56))), vs = o.valueSize ?? Math.max(18, h * 0.46);
  let body = `<path d="${d}" transform="translate(0 3)" ${fill(rim)}/>`
    + `<path d="${d}" ${fill(bg, `stroke:${o.ring ? 'var(--sim-accent)' : rim};stroke-width:${o.ring ? 4 : 2.5};stroke-linejoin:round`)}/>`
    + (plain ? '' : `<rect x="${f1(x0 + n + 2)}" y="${f1(y0 + 2)}" width="${f1(Math.max(6, w * 0.05))}" height="${f1(h - 4)}" ${fill(col)}/>`)
    + `<circle cx="${f1(x0 + n * 0.75)}" cy="${f1(y)}" r="${f1(h * 0.08)}" ${fill('var(--sim-bg-deep)', `stroke:${rim};stroke-width:1.5`)}/>`
    + `<path d="M${f1(x0 + n * 0.75)} ${f1(y)}q${f1(-n * 0.9)} ${f1(-h * 0.25)} ${f1(-n * 1.3)} ${f1(-h * 0.5)}" ${stroke(rim, 1.8)}/>`;
  const cx = x0 + n + (w - n) / 2 + (plain ? 0 : w * 0.025);
  if (label) body += txt(cx, y0 + h * 0.34, label, ls, 'var(--sim-label-muted)', 'middle', 700) + txt(cx, y0 + h * 0.9, rupees == null ? '' : rs(rupees), vs, ink);
  else body += txt(cx, y + vs * 0.36, rupees == null ? '' : rs(rupees), vs, ink);
  return wrap(o, body);
}

export function jarLevel(y, rupees, o = {}) {
  const h = o.h, max = o.max ?? (o.target ?? 1000) * 1.1, inner = h - h * 0.06;
  return y - h * 0.04 - inner * Math.min(1, Math.max(0, rupees) / max);
}

export function jar(x, y, rupees, target, o = {}) {
  const w = o.w ?? 160, h = o.h ?? w * 1.3, max = o.max ?? (target ?? 1000) * 1.1;
  const x0 = x - w / 2, top = y - h, r = w * 0.16, neck = w * 0.08;
  const body = `M${f1(x0 + neck)} ${f1(top)}Q${f1(x0)} ${f1(top + neck)} ${f1(x0)} ${f1(top + neck * 2.4)}V${f1(y - r)}Q${f1(x0)} ${f1(y)} ${f1(x0 + r)} ${f1(y)}H${f1(x0 + w - r)}Q${f1(x0 + w)} ${f1(y)} ${f1(x0 + w)} ${f1(y - r)}V${f1(top + neck * 2.4)}Q${f1(x0 + w)} ${f1(top + neck)} ${f1(x0 + w - neck)} ${f1(top)}Z`;
  let out = `<path d="${body}" ${fill(GLASS, 'stroke:var(--sim-stroke);stroke-width:3.5;stroke-linejoin:round')}/>`;
  const lv = jarLevel(y, rupees, { h, max });
  if (rupees > 0) {
    const pad = 6, fx0 = x0 + pad, fw = w - pad * 2, rr = Math.min(r - 3, (y - pad - lv) / 2);
    out += `<path d="M${f1(fx0)} ${f1(lv)}H${f1(fx0 + fw)}V${f1(y - pad - rr)}Q${f1(fx0 + fw)} ${f1(y - pad)} ${f1(fx0 + fw - rr)} ${f1(y - pad)}H${f1(fx0 + rr)}Q${f1(fx0)} ${f1(y - pad)} ${f1(fx0)} ${f1(y - pad - rr)}Z" ${fill(COIN, `stroke:${shade(COIN, 70)};stroke-width:2`)}/>`;
    // coin edges as short arcs in rows, so the fill reads as stacked coins
    const cr = Math.max(7, w * 0.07);
    for (let yy = y - pad - cr * 0.9, row = 0; yy > lv + cr * 0.5; yy -= cr * 1.15, row++) {
      for (let xx = fx0 + cr + (row % 2) * cr, i = 0; xx < fx0 + fw - cr * 0.6; xx += cr * 2.1, i++) {
        out += `<path d="M${f1(xx - cr * 0.8)} ${f1(yy)}a${f1(cr * 0.8)} ${f1(cr * 0.35)} 0 0 0 ${f1(cr * 1.6)} 0" ${stroke(shade(COIN, 72), 1.6)}/>`;
      }
    }
  }
  out += `<path d="M${f1(x0 + w * 0.12)} ${f1(top + neck * 3)}V${f1(y - r * 1.2)}" ${stroke('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)', Math.max(4, w * 0.04))}/>`;
  if (o.lid !== false) out += `<rect x="${f1(x0 + neck - 4)}" y="${f1(top - w * 0.1)}" width="${f1(w - neck * 2 + 8)}" height="${f1(w * 0.1)}" rx="5" ${fill(o.lidCol ?? 'color-mix(in oklab, var(--sim-stroke) 70%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  if (target != null) {
    const ty = jarLevel(y, target, { h, max });
    out += `<path d="M${f1(x0 - 10)} ${f1(ty)}H${f1(x0 + w + (o.lineTo ?? 10))}" ${stroke('var(--sim-label)', 3, 'stroke-dasharray:10 7')}/>`;
    if (o.label !== '') out += txt(x0 - 14, ty + 7, o.label ?? rs(target), o.labelSize ?? 20, 'var(--sim-label)', 'end');
  }
  return wrap(o, out);
}

export function gullak(x, y, o = {}) {
  const w = o.w ?? 120, rx = w / 2, ry = w * 0.42, cy = y - ry - 4, rim = shade(CLAY, 62);
  let body = `<ellipse cx="${f1(x)}" cy="${f1(y - 2)}" rx="${f1(rx * 0.55)}" ry="${f1(w * 0.05)}" ${fill(rim)}/>`
    + `<ellipse cx="${f1(x)}" cy="${f1(cy + 3)}" rx="${f1(rx)}" ry="${f1(ry)}" ${fill(rim)}/>`
    + `<ellipse cx="${f1(x)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" ${fill(CLAY, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x - rx * 0.92)} ${f1(cy + ry * 0.2)}Q${f1(x)} ${f1(cy + ry * 0.45)} ${f1(x + rx * 0.92)} ${f1(cy + ry * 0.2)}" ${stroke(rim, 2.5)}/>`
    + `<path d="M${f1(x - rx * 0.3)} ${f1(cy - ry * 0.9)}Q${f1(x)} ${f1(cy - ry * 1.25)} ${f1(x + rx * 0.3)} ${f1(cy - ry * 0.9)}" ${fill(CLAY, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<ellipse cx="${f1(x)}" cy="${f1(cy - ry * 1.12)}" rx="${f1(w * 0.09)}" ry="${f1(w * 0.06)}" ${fill(shade(CLAY, 82), `stroke:${rim};stroke-width:2`)}/>`
    + `<rect x="${f1(x - w * 0.16)}" y="${f1(cy - ry * 0.72)}" width="${f1(w * 0.32)}" height="${f1(w * 0.05)}" rx="${f1(w * 0.025)}" ${fill('var(--sim-bg-deep)')}/>`;
  return wrap(o, body);
}

export function bicycle(x, y, w = 180, o = {}) {
  // w = wheel edge to wheel edge; wheelbase = 1.6 x wheel diameter (3.2 R), so 5.2 R = w and a clear gap between wheels.
  const col = o.col ?? 'var(--sim-series-1)', rim = shade(col, 62), R = w / 5.2, ink = 'var(--sim-label)';
  const bx = x - w / 2 + R, fx = x + w / 2 - R, wy = y - R, wb = fx - bx;
  const crank = { x: bx + wb * 0.44, y: wy + R * 0.08 }, seat = { x: bx + wb * 0.3, y: wy - R * 1.32 };
  const headT = { x: fx - wb * 0.17, y: wy - R * 1.36 }, headB = { x: fx - wb * 0.13, y: wy - R * 0.98 };
  const wheel = (cx) => {
    let s = `<circle cx="${f1(cx)}" cy="${f1(wy)}" r="${f1(R)}" ${stroke(ink, Math.max(4, R * 0.16))}/>`
      + `<circle cx="${f1(cx)}" cy="${f1(wy)}" r="${f1(R * 0.8)}" ${stroke('var(--sim-stroke)', 1.5)}/>`;
    for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 6; s += `<path d="M${f1(cx - Math.cos(a) * R * 0.78)} ${f1(wy - Math.sin(a) * R * 0.78)}L${f1(cx + Math.cos(a) * R * 0.78)} ${f1(wy + Math.sin(a) * R * 0.78)}" ${stroke('var(--sim-stroke)', 1.4)}/>`; }
    return s + `<circle cx="${f1(cx)}" cy="${f1(wy)}" r="${f1(R * 0.11)}" ${fill(ink)}/>`;
  };
  const fw = Math.max(4, R * 0.2);
  let body = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w * 0.55)}" ry="${f1(w * 0.03)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>` + wheel(bx) + wheel(fx);
  // chain stay, seat stay, seat tube, top tube, down tube, head tube + fork
  const frame = `M${f1(bx)} ${f1(wy)}L${f1(crank.x)} ${f1(crank.y)}L${f1(seat.x)} ${f1(seat.y)}L${f1(bx)} ${f1(wy)}`
    + `M${f1(seat.x)} ${f1(seat.y)}L${f1(headT.x)} ${f1(headT.y)}M${f1(crank.x)} ${f1(crank.y)}L${f1(headB.x)} ${f1(headB.y)}`
    + `M${f1(headT.x)} ${f1(headT.y)}L${f1(headB.x)} ${f1(headB.y)}L${f1(fx)} ${f1(wy)}`;
  body += `<path d="${frame}" ${stroke(rim, fw + 3)}/><path d="${frame}" ${stroke(col, fw)}/>`;
  const sp = { x: seat.x - R * 0.06, y: seat.y - R * 0.28 };
  body += `<path d="M${f1(seat.x)} ${f1(seat.y)}L${f1(sp.x)} ${f1(sp.y)}" ${stroke(ink, fw * 0.8)}/>`
    + `<path d="M${f1(sp.x - R * 0.42)} ${f1(sp.y - 2)}Q${f1(sp.x)} ${f1(sp.y - R * 0.14)} ${f1(sp.x + R * 0.36)} ${f1(sp.y)}" ${stroke(ink, fw * 1.4)}/>`
    + `<path d="M${f1(headT.x)} ${f1(headT.y)}L${f1(headT.x - R * 0.06)} ${f1(headT.y - R * 0.3)}Q${f1(headT.x - R * 0.2)} ${f1(headT.y - R * 0.42)} ${f1(headT.x - R * 0.5)} ${f1(headT.y - R * 0.36)}" ${stroke(ink, fw * 0.9)}/>`
    + `<circle cx="${f1(crank.x)}" cy="${f1(crank.y)}" r="${f1(R * 0.22)}" ${fill(rim)}/>`
    + `<path d="M${f1(crank.x)} ${f1(crank.y)}l${f1(R * 0.26)} ${f1(R * 0.32)}h${f1(R * 0.18)}" ${stroke(ink, 3)}/>`;
  return wrap(o, body);
}

export function paper(x, y, w = 80, o = {}) {
  const h = w * 1.25, x0 = x - w / 2, y0 = y - h / 2, f = w * 0.2;
  const d = `M${f1(x0)} ${f1(y0)}H${f1(x0 + w - f)}L${f1(x0 + w)} ${f1(y0 + f)}V${f1(y0 + h)}H${f1(x0)}Z`;
  let body = `<path d="${d}" transform="translate(3 4)" ${fill('var(--sim-stroke)')}/><path d="${d}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-linejoin:round')}/>`
    + `<path d="M${f1(x0 + w - f)} ${f1(y0)}V${f1(y0 + f)}H${f1(x0 + w)}" ${stroke('var(--sim-stroke)', 2)}/>`;
  for (let i = 0; i < 4; i++) {
    const ly = y0 + h * (0.32 + i * 0.16);
    body += `<path d="M${f1(x0 + w * 0.16)} ${f1(ly)}H${f1(x0 + w * (i === 3 ? 0.55 : 0.84))}" ${stroke(i === 0 ? TONE.save : 'var(--sim-label-muted)', 4)}/>`;
  }
  const px = x0 + w * 0.92, py = y0 + h * 0.86;
  body += `<path d="M${f1(px)} ${f1(py)}l${f1(w * 0.28)} ${f1(-w * 0.5)}" ${stroke(shade('var(--sim-series-1)', 62), w * 0.13)}/>`
    + `<path d="M${f1(px)} ${f1(py)}l${f1(w * 0.28)} ${f1(-w * 0.5)}" ${stroke('var(--sim-series-1)', w * 0.09)}/>`;
  return wrap(o, body);
}
