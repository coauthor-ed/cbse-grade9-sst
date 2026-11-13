/**
 * MangoKit - the price-puzzle course cast: plain functions that return SVG strings for an SvgScene stage.
 * Flat Quill look, tokens only, no faces on fruit, no banknote art (money is a number on a tag).
 * Add MANGO_CSS once to the scene's css() (it holds the mango drop animation).
 *
 *   mango(x, y, r, { leaf, dim, cls, style })        one mango, centre (x, y); about 2.2r wide, 1.7r tall.
 *   heap(x, y, kg, { r, tray, dim })                 a heap of 3 mangoes per kg, stacked; (x, y) = bottom centre
 *                                                    (the tray's underside with tray: true). r default 10.
 *   basket(x, y, kg, { w, fromKg, per, dim, handle }) a shopping basket holding 3 mangoes per kg (0..9 kg);
 *                                                    (x, y) = bottom centre; w default 120 (height 0.5w, handle
 *                                                    0.4w above). fromKg: mangoes past that kg drop in, per s a kg.
 *   pan(x, y, kg, { w, basket, fromKg, per, dim })   a weighing scale with a big "N kg" read-out, a basket of kg on
 *                                                    its pan (basket: false = empty pan); (x, y) = bottom centre;
 *                                                    w default 160, about 0.5w tall without the basket.
 *   panTop(y, w)                                     the y where a basket stands on that scale's pan.
 *   priceBoard(x, y, rupees, { w, h, unit, q, active, dim, cls })   a price board centred on (x, y): the rupee
 *                                                    sign and the number (3,000 style commas), then unit (default
 *                                                    "/ kg", '' for none). q: '?' instead of the price. w default
 *                                                    150, h default 0.42w.
 *   buyer(x, y, who, { h, name, tag, tagDy, tagSize, dim, armL, armR }) a person, feet centre (x, y), h default 120 tall, tinted
 *                                                    by who: 1 Srivalli, 2 Alex, 3 Israt (series 1..3), or a
 *                                                    series number with opts.name; a name tag under the feet
 *                                                    (tag: false hides it). armL / armR: 'down' or 'out' (a hand
 *                                                    held out to hold a basket). No face.
 *   hands(x, y, h)                                   { l, r }: the out-held hand points of buyer() ('out' arms).
 *   purse(x, y, { w, open, dim })                    a purse; (x, y) = bottom centre; w default 54. open: the
 *                                                    flap up and the inside shown empty.
 *   RS                                               the rupee sign.
 * ASCII only.
 */
import { fill, stroke, shade, glossOf } from 'simulations/base/kit/SimSvg.js';

export const RS = '\u20B9';
const f1 = (v) => (+v).toFixed(1);
const MANGO = 'var(--sim-series-2)';
const LEAF = 'var(--sim-series-3)';
const WICKER = 'color-mix(in oklab, var(--sim-series-8) 45%, var(--sim-bg-surface))';
const WICKER_IN = 'color-mix(in oklab, var(--sim-series-8) 40%, black)';
const SKIN = 'color-mix(in oklab, color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-series-2)) 66%, black)';
const HAIR = 'color-mix(in oklab, var(--sim-series-8) 16%, black)';
const NAMES = { 1: 'Srivalli', 2: 'Alex', 3: 'Israt' };

export const MANGO_CSS = `
svg .mk-drop { animation: mk-drop 0.45s cubic-bezier(.3,1.4,.6,1) both; animation-delay: var(--d, 0s); }
@keyframes mk-drop { 0% { transform: translateY(-70px); opacity: 0; } 40% { opacity: 1; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .mk-drop { animation: none; } }
`;

/** Group rows for n fruit, base row b, each row one fewer (at least 1). */
function rows(n, b) {
  const out = [];
  let left = n, k = b;
  for (let guard = 0; left > 0 && guard < 40; guard++) { const m = Math.min(left, Math.max(1, k)); out.push(m); left -= m; if (out.length % 2 === 0 || b <= 3) k--; }
  return out;
}

export function mango(x, y, r, o = {}) {
  const col = MANGO, rim = shade(col, 72);
  const leaf = o.leaf ? `<path d="M${f1(r * 0.55)} ${f1(-r * 0.78)}q${f1(r * 0.55)} ${f1(-r * 0.75)} ${f1(r * 1.25)} ${f1(-r * 0.45)}q${f1(-r * 0.45)} ${f1(r * 0.55)} ${f1(-r * 1.25)} ${f1(r * 0.45)}z" ${fill(LEAF, `stroke:${shade(LEAF, 70)};stroke-width:1.2`)}/>` : '';
  return `<g${o.cls ? ` class="${o.cls}"` : ''} style="${o.style ?? ''}${o.dim ? ';opacity:0.35' : ''}"><g transform="translate(${f1(x)} ${f1(y)}) rotate(-18)">`
    + `<path d="M${f1(r * 0.5)} ${f1(-r * 0.8)}l${f1(r * 0.12)} ${f1(-r * 0.32)}" ${stroke(shade(LEAF, 55), Math.max(1.5, r * 0.16))}/>` + leaf
    + `<ellipse cx="0" cy="0" rx="${f1(r * 1.12)}" ry="${f1(r * 0.84)}" ${fill(col, `stroke:${rim};stroke-width:${f1(Math.max(1.2, r * 0.12))}`)}/>`
    + `<path d="M${f1(-r * 0.95)} ${f1(r * 0.2)}Q${f1(0)} ${f1(r * 1.05)} ${f1(r * 0.98)} ${f1(r * 0.1)}Q${f1(0)} ${f1(r * 0.62)} ${f1(-r * 0.95)} ${f1(r * 0.2)}z" ${fill(shade(col, 84))}/>`
    + `<ellipse cx="${f1(-r * 0.4)}" cy="${f1(-r * 0.36)}" rx="${f1(r * 0.34)}" ry="${f1(r * 0.18)}" ${fill(glossOf(col, 55), 'opacity:0.7')}/>`
    + '</g></g>';
}

export function heap(x, y, kg, o = {}) {
  const r = o.r ?? 10, n = Math.round(kg * 3), dx = r * 2.25, dy = r * 1.45;
  let b = 1;
  while ((b * (b + 1)) / 2 < n) b++;
  let out = '';
  const base = o.tray ? y - r * 0.9 : y;
  if (o.tray) {
    const tw = b * dx + r * 1.6;
    out += `<path d="M${f1(x - tw / 2)} ${f1(y - r * 1.0)}H${f1(x + tw / 2)}L${f1(x + tw / 2 - r * 0.8)} ${f1(y)}H${f1(x - tw / 2 + r * 0.8)}Z" ${fill(WICKER, `stroke:${shade(WICKER, 60)};stroke-width:2;stroke-linejoin:round`)}/>`;
  }
  let i = 0;
  const rr = n ? rows(n, b) : [];
  rr.forEach((m, row) => {
    const cy = base - r * 0.75 - row * dy;
    for (let j = 0; j < m; j++, i++) out += mango(x + (j - (m - 1) / 2) * dx, cy, r, { leaf: row === rr.length - 1 && j === 0 });
  });
  return `<g${o.dim ? ' opacity="0.35"' : ''}>${out}</g>`;
}

export function basket(x, y, kg, o = {}) {
  const w = o.w ?? 120, h = w * 0.5, r = w * 0.085, dx = r * 2.15, dy = r * 1.4, n = Math.max(0, Math.min(27, Math.round(kg * 3)));
  const top = y - h, front = y - h * 0.5, sw = Math.max(2, w * 0.022);
  let out = '';
  if (o.handle !== false) out += `<path d="M${f1(x - w * 0.36)} ${f1(top + 2)}C${f1(x - w * 0.34)} ${f1(top - w * 0.52)} ${f1(x + w * 0.34)} ${f1(top - w * 0.52)} ${f1(x + w * 0.36)} ${f1(top + 2)}" ${stroke(shade(WICKER, 62), w * 0.05)}/>`;
  // Back wall and the dark inside.
  out += `<path d="M${f1(x - w / 2)} ${f1(top)}H${f1(x + w / 2)}L${f1(x + w * 0.4)} ${f1(y)}H${f1(x - w * 0.4)}Z" ${fill(WICKER_IN)}/>`;
  let i = 0;
  const per = o.per ?? 0.5, from = o.fromKg;
  rows(n, n > 15 ? 5 : 4).forEach((m, row) => {
    const cy = front - r * 0.4 - row * dy;
    for (let j = 0; j < m; j++, i++) {
      const kgI = Math.floor(i / 3), fresh = from != null && kgI >= from;
      out += mango(x + (j - (m - 1) / 2) * dx, cy, r, fresh ? { cls: 'mk-drop', style: `--d:${f1((kgI - from) * per + (i % 3) * 0.1)}s` } : {});
    }
  });
  // Front wall with a weave, then the rim.
  out += `<path d="M${f1(x - w * 0.47)} ${f1(front)}H${f1(x + w * 0.47)}L${f1(x + w * 0.4)} ${f1(y)}H${f1(x - w * 0.4)}Z" ${fill(WICKER, `stroke:${shade(WICKER, 60)};stroke-width:${f1(sw)};stroke-linejoin:round`)}/>`;
  const wv = [0.33, 0.66].map((t) => { const yy = front + (y - front) * t, half = w * (0.47 - 0.07 * t); return `M${f1(x - half + 3)} ${f1(yy)}H${f1(x + half - 3)}`; }).join('');
  out += `<path d="${wv}" ${stroke(shade(WICKER, 75), sw * 0.8)}/>`;
  out += `<rect x="${f1(x - w / 2 - 2)}" y="${f1(top - sw)}" width="${f1(w + 4)}" height="${f1(sw * 2)}" rx="${f1(sw)}" ${fill(shade(WICKER, 70))}/>`;
  return `<g${o.dim ? ' opacity="0.35"' : ''}>${out}</g>`;
}

export const panTop = (y, w = 160) => y - w * 0.5;

export function pan(x, y, kg, o = {}) {
  const w = o.w ?? 160, bw = w * 0.8, bh = w * 0.36, by = y - bh, pt = panTop(y, w);
  const body = 'color-mix(in oklab, var(--sim-stroke) 45%, var(--sim-bg-surface))';
  const fs = Math.round(w * 0.19);
  let out = `<rect x="${f1(x - bw / 2)}" y="${f1(by + 4)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(w * 0.08)}" ${fill(shade(body, 70))}/>`
    + `<rect x="${f1(x - bw / 2)}" y="${f1(by)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(w * 0.08)}" ${fill(body, 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`
    + `<rect x="${f1(x - bw * 0.4)}" y="${f1(by + bh * 0.16)}" width="${f1(bw * 0.8)}" height="${f1(bh * 0.66)}" rx="${f1(w * 0.04)}" ${fill('var(--sim-label)')}/>`
    + `<text x="${f1(x)}" y="${f1(by + bh * 0.49 + fs * 0.36)}" text-anchor="middle" style="fill:var(--sim-bg-surface);font:800 ${fs}px var(--sim-font)">${kg} kg</text>`
    + `<rect x="${f1(x - w * 0.04)}" y="${f1(pt + w * 0.05)}" width="${f1(w * 0.08)}" height="${f1(by - pt - w * 0.05)}" ${fill(shade(body, 80))}/>`
    + `<path d="M${f1(x - w / 2)} ${f1(pt)}H${f1(x + w / 2)}Q${f1(x + w * 0.44)} ${f1(pt + w * 0.08)} ${f1(x + w * 0.3)} ${f1(pt + w * 0.08)}H${f1(x - w * 0.3)}Q${f1(x - w * 0.44)} ${f1(pt + w * 0.08)} ${f1(x - w / 2)} ${f1(pt)}Z" ${fill(body, 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-linejoin:round')}/>`;
  if (o.basket !== false) out += basket(x, pt, kg, { w: w * 0.78, fromKg: o.fromKg, per: o.per });
  return `<g${o.dim ? ' opacity="0.35"' : ''}>${out}</g>`;
}

function money(v) {
  if (typeof v !== 'number') return String(v);
  const s = String(Math.round(v));
  return s.length > 3 ? s.slice(0, -3) + ',' + s.slice(-3) : s;
}

export function priceBoard(x, y, rupees, o = {}) {
  const w = o.w ?? 150, h = o.h ?? w * 0.42, unit = o.unit ?? '/ kg', act = !!o.active;
  const edge = act ? 'var(--sim-accent)' : 'var(--sim-stroke)';
  const face = act ? 'color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)';
  const fs = Math.round(h * 0.56), us = Math.round(h * 0.34);
  const main = o.q ? '?' : `${RS}${money(rupees)}`;
  const txt = unit && !o.q
    ? `<text x="${f1(x)}" y="${f1(y + fs * 0.36)}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs}px var(--sim-font)">${main}<tspan style="font-size:${us}px;fill:var(--sim-label-muted)" dx="${f1(us * 0.3)}">${unit}</tspan></text>`
    : `<text x="${f1(x)}" y="${f1(y + fs * 0.36)}" text-anchor="middle" style="fill:${o.q ? 'var(--sim-accent)' : 'var(--sim-label)'};font:800 ${fs}px var(--sim-font)">${main}</text>`;
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.dim ? ' opacity="0.35"' : ''}>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 5)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h * 0.24)}" ${fill(shade(edge, 75))}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h * 0.24)}" ${fill(face, `stroke:${edge};stroke-width:${act ? 3.5 : 3}`)}/>`
    + txt + '</g>';
}

export function hands(x, y, h = 120) {
  return { l: { x: x - h * 0.34, y: y - h * 0.42 }, r: { x: x + h * 0.34, y: y - h * 0.42 } };
}

export function buyer(x, y, who, o = {}) {
  const h = o.h ?? 120, n = typeof who === 'number' ? who : 1, col = `var(--sim-series-${n})`, dark = shade(col, 70);
  const name = o.name ?? NAMES[n] ?? '';
  const hr = h * 0.115, hy = y - h + hr, sh = y - h * 0.72, hip = y - h * 0.3, bw = h * 0.36;
  const lw = h * 0.085, armW = h * 0.075;
  const arm = (side, mode) => {
    const sx = x + side * bw * 0.46, sy = sh + h * 0.04;
    const H = hands(x, y, h)[side < 0 ? 'l' : 'r'];
    const ex = mode === 'out' ? H.x : x + side * bw * 0.55, ey = mode === 'out' ? H.y : y - h * 0.36;
    return `<path d="M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}" ${stroke(dark, armW * 1.15)}/><path d="M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}" ${stroke(col, armW * 0.8)}/>`
      + `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="${f1(armW * 0.62)}" ${fill(SKIN)}/>`;
  };
  let out = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(h * 0.24)}" ry="${f1(h * 0.035)}" ${fill('color-mix(in srgb, var(--sim-label) 14%, transparent)')}/>`;
  // legs
  out += `<path d="M${f1(x - bw * 0.2)} ${f1(hip)}V${f1(y - lw * 0.5)}M${f1(x + bw * 0.2)} ${f1(hip)}V${f1(y - lw * 0.5)}" ${stroke(shade(col, 45), lw)}/>`;
  out += arm(-1, o.armL ?? 'down') + arm(1, o.armR ?? 'down');
  // body: a long tunic
  out += `<path d="M${f1(x - bw * 0.42)} ${f1(sh)}Q${f1(x)} ${f1(sh - h * 0.05)} ${f1(x + bw * 0.42)} ${f1(sh)}L${f1(x + bw * 0.56)} ${f1(hip + h * 0.06)}Q${f1(x)} ${f1(hip + h * 0.11)} ${f1(x - bw * 0.56)} ${f1(hip + h * 0.06)}Z" ${fill(col, `stroke:${dark};stroke-width:${f1(Math.max(1.5, h * 0.018))};stroke-linejoin:round`)}/>`;
  out += `<path d="M${f1(x - bw * 0.5)} ${f1(hip - h * 0.02)}Q${f1(x)} ${f1(hip + h * 0.03)} ${f1(x + bw * 0.5)} ${f1(hip - h * 0.02)}" ${stroke(dark, Math.max(1.5, h * 0.016))}/>`;
  // neck, head, hair
  out += `<rect x="${f1(x - hr * 0.35)}" y="${f1(hy + hr * 0.7)}" width="${f1(hr * 0.7)}" height="${f1(sh - hy - hr * 0.6)}" ${fill(SKIN)}/>`;
  out += `<circle cx="${f1(x)}" cy="${f1(hy)}" r="${f1(hr)}" ${fill(SKIN)}/>`;
  out += `<path d="M${f1(x - hr * 1.02)} ${f1(hy + hr * 0.1)}A${f1(hr * 1.02)} ${f1(hr * 1.02)} 0 0 1 ${f1(x + hr * 1.02)} ${f1(hy + hr * 0.1)}Q${f1(x)} ${f1(hy - hr * 0.55)} ${f1(x - hr * 1.02)} ${f1(hy + hr * 0.1)}Z" ${fill(HAIR)}/>`;
  if (o.tag !== false && name) {
    const fs = o.tagSize ?? Math.max(15, Math.round(h * 0.16)), tw = name.length * fs * 0.6 + 18, ty = y + fs * 0.95 + (o.tagDy ?? 0);
    out += `<rect x="${f1(x - tw / 2)}" y="${f1(ty - fs * 0.8)}" width="${f1(tw)}" height="${f1(fs * 1.4)}" rx="${f1(fs * 0.7)}" ${fill(col)}/>`
      + `<text x="${f1(x)}" y="${f1(ty + fs * 0.32)}" text-anchor="middle" style="fill:var(--sim-ink-on-${n}, var(--sim-bg-deep));font:800 ${fs}px var(--sim-font)">${name}</text>`;
  }
  return `<g${o.dim ? ' opacity="0.35"' : ''}>${out}</g>`;
}

export function purse(x, y, o = {}) {
  const w = o.w ?? 54, h = w * 0.72, col = 'color-mix(in oklab, var(--sim-series-5) 72%, black)', rim = shade(col, 65);
  let out = '';
  if (o.open) {
    out += `<path d="M${f1(x - w * 0.42)} ${f1(y - h * 0.86)}Q${f1(x)} ${f1(y - h * 1.55)} ${f1(x + w * 0.42)} ${f1(y - h * 0.86)}Z" ${fill(shade(col, 85), `stroke:${rim};stroke-width:2;stroke-linejoin:round`)}/>`;
  }
  out += `<path d="M${f1(x - w / 2)} ${f1(y - h * 0.86)}H${f1(x + w / 2)}V${f1(y - h * 0.18)}Q${f1(x + w / 2)} ${f1(y)} ${f1(x + w * 0.3)} ${f1(y)}H${f1(x - w * 0.3)}Q${f1(x - w / 2)} ${f1(y)} ${f1(x - w / 2)} ${f1(y - h * 0.18)}Z" ${fill(col, `stroke:${rim};stroke-width:2;stroke-linejoin:round`)}/>`;
  if (o.open) out += `<ellipse cx="${f1(x)}" cy="${f1(y - h * 0.86)}" rx="${f1(w * 0.46)}" ry="${f1(h * 0.2)}" ${fill('color-mix(in oklab, var(--sim-series-5) 12%, black)', `stroke:${rim};stroke-width:2`)}/>`;
  else out += `<path d="M${f1(x - w / 2)} ${f1(y - h * 0.86)}Q${f1(x)} ${f1(y - h * 0.3)} ${f1(x + w / 2)} ${f1(y - h * 0.86)}" ${fill(shade(col, 85), `stroke:${rim};stroke-width:2`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y - h * 0.5)}" r="${f1(w * 0.07)}" ${fill('var(--sim-gold)', `stroke:${rim};stroke-width:1.5`)}/>`;
  return `<g${o.dim ? ' opacity="0.35"' : ''}>${out}</g>`;
}
