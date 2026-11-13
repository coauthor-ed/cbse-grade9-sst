/**
 * GovParts - the L06 government parts (added by w4a; any L06 scene may use it, add to it only additively).
 * Plain functions returning SVG strings for an SvgScene stage, design units. The medicine counter and box are
 * copies of L05 MarketCloseScene counter() / medBox() (MarketClose itself is unchanged).
 *
 *   medBox(x, y, w)                       a box of medicine, (x, y) bottom centre, w wide (0.7 w tall).
 *   counter(cx, gy, w, o)                 { svg, top }: the medicine counter (sign "medicines", a shelf wall of
 *                                         boxes, a wooden counter); (cx, gy) ground centre. o: { boxes (0..8,
 *                                         default 8: how many boxes stand on the two shelves), sign (text) }.
 *                                         top = the counter top (where a tag stands).
 *   govBuilding(cx, gy, w, o)             { svg, top, h }: the government building (SimCivic 'court': steps,
 *                                         four columns, a plain pediment; no flag, no emblem, no scales) and,
 *                                         unless o.label === false, a name pill "the government" on its steps.
 *                                         o: { label (text), size (pill font), dim }.
 *   icon(name, x, y, size, col)           a SimIcons icon centred on (x, y), size across.
 *   lid(g, p, o)                          a price ceiling on a MarketParts frame g: a thick lid bar whose
 *                                         bottom edge sits on the price p line, a knob on top. o: { col, x0,
 *                                         x1 (default g.L .. g.R), w (bar height, 12), cls, style }.
 *   floorBar(g, p, o)                     a price floor: a hatched slab whose top edge is the price p line.
 *                                         o: { col, x0, x1, w (14) }.
 *   capTag(x, y, t, o)                    a pill tag with a lid on top (kind 'ceil') or a slab under it (kind
 *                                         'floor'); o: { kind, size (22), bg, ink, edge, cap (lid colour),
 *                                         ext (floor only: the slab runs ext further right, room for an arrow) }.
 *   castFamilies()                        registers the L05 MarketClose medicine families with the SAME looks
 *                                         (medA / medK can pay, poorA / poorK cannot) plus waitA (an elder who
 *                                         waits) and worker (a worker); safe to call more than once.
 *   CAP                                   the ceiling / floor colour (var(--sim-label): a dark bar on paper).
 * Colours are tokens only. ASCII only.
 */
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { txt, pill } from './MarketParts.js';
import { registerCast } from './MangoPeople.js';

const f1 = (v) => (+v).toFixed(1);
const BOX = 'var(--sim-bg-surface)';
const BOXC = 'var(--sim-series-1)';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))';
export const CAP = 'var(--sim-label)';

export function medBox(x, y, w) {
  const h = w * 0.7, x0 = x - w / 2, y0 = y - h;
  let s = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w * 0.08)}" ${fill(BOX, `stroke:${shade(BOXC, 60)};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(y0 + h * 0.3)}" width="${f1(w)}" height="${f1(h * 0.4)}" ${fill(BOXC, `stroke:${shade(BOXC, 60)};stroke-width:1.5`)}/>`;
  const cw = w * 0.46, ch = h * 0.24, cx = x - cw / 2, cy = y0 + h * 0.38;
  s += `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(cw)}" height="${f1(ch)}" rx="${f1(ch / 2)}" ${fill(BOX, `stroke:${shade(BOXC, 50)};stroke-width:1.5`)}/>`;
  s += `<path d="M${f1(x)} ${f1(cy)}h${f1(cw / 2 - ch / 2)}a${f1(ch / 2)} ${f1(ch / 2)} 0 0 1 0 ${f1(ch)}h${f1(-(cw / 2 - ch / 2))}Z" ${fill('var(--sim-gold)', `stroke:${shade(BOXC, 50)};stroke-width:1.5`)}/>`;
  return s;
}

export function counter(cx, gy, w, o = {}) {
  const x0 = cx - w / 2, top = gy - w * 0.95, ch = w * 0.34, n = o.boxes ?? 8;
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(gy - top)}" rx="8" ${fill('color-mix(in oklab, var(--sim-series-1) 12%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  s += `<rect x="${f1(x0 + w * 0.12)}" y="${f1(top - 22)}" width="${f1(w * 0.76)}" height="40" rx="9" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  s += txt(cx, top + 6, o.sign ?? 'medicines', 24, 'var(--sim-label)');
  let k = 0;
  for (let r = 0; r < 2; r++) {
    const sy = top + 34 + r * (w * 0.2) + w * 0.16;
    for (let i = 0; i < 4; i++) { if (k++ < n) s += medBox(x0 + w * (0.17 + i * 0.22), sy, w * 0.15); }
    s += `<path d="M${f1(x0 + 8)} ${f1(sy + 2)}H${f1(x0 + w - 8)}" ${stroke(shade(WOOD, 60), 5)}/>`;
  }
  s += `<rect x="${f1(x0 - 10)}" y="${f1(gy - ch)}" width="${f1(w + 20)}" height="${f1(ch)}" rx="6" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:3`)}/>`;
  s += `<rect x="${f1(x0 - 16)}" y="${f1(gy - ch - 10)}" width="${f1(w + 32)}" height="14" rx="5" ${fill(shade(WOOD, 85), `stroke:${shade(WOOD, 60)};stroke-width:2.5`)}/>`;
  return { svg: s, top: gy - ch - 10 };
}

export function govBuilding(cx, gy, w, o = {}) {
  const h = w * 230 / 300;
  let s = civicSvg('court', cx, gy, { w });
  if (o.dim) s = `<g opacity="0.35">${s}</g>`;
  if (o.label !== false) {
    const fs = o.size ?? 20;
    s += pill(cx, gy - h * 0.07, o.label ?? 'the government', { size: fs, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: 'var(--sim-label)' });
  }
  return { svg: s, top: gy - h, h };
}

export function icon(name, x, y, size, col = 'var(--sim-series-4)') {
  return iconSvg(name, col).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
}

export function lid(g, p, o = {}) {
  const col = o.col ?? CAP, x0 = o.x0 ?? g.L, x1 = o.x1 ?? g.R, y = g.Y(p), w = o.w ?? 12, kx = (x0 + x1) / 2;
  const cls = o.cls ? ` class="${o.cls}" style="${o.style ?? ''}"` : '';
  return `<g${cls}><rect x="${f1(x0 - 4)}" y="${f1(y - w)}" width="${f1(x1 - x0 + 8)}" height="${f1(w)}" rx="${f1(w / 2)}" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2`)}/>`
    + `<rect x="${f1(kx - 22)}" y="${f1(y - w - 12)}" width="44" height="14" rx="7" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2`)}/></g>`;
}

export function floorBar(g, p, o = {}) {
  const col = o.col ?? CAP, x0 = o.x0 ?? g.L, x1 = o.x1 ?? g.R, y = g.Y(p), w = o.w ?? 14;
  let s = `<rect x="${f1(x0 - 4)}" y="${f1(y)}" width="${f1(x1 - x0 + 8)}" height="${f1(w)}" rx="3" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2`)}/>`;
  for (let x = x0 + 6; x < x1; x += 18) s += `<path d="M${f1(x)} ${f1(y + w - 2)}L${f1(x + 10)} ${f1(y + 2)}" ${stroke('var(--sim-bg-surface)', 2.5, 'opacity:0.7')}/>`;
  return s;
}

export function capTag(x, y, t, o = {}) {
  const fs = o.size ?? 22, tw = String(t).replace(/&[a-z#0-9]+;/g, 'x').length * fs * 0.56 + fs * 1.1, th = fs * 1.55, col = o.cap ?? CAP;
  let s = pill(x, y, t, { size: fs, bg: o.bg, ink: o.ink, edge: o.edge });
  if (o.kind === 'floor') {
    s += `<rect x="${f1(x - tw / 2 - 12)}" y="${f1(y + th / 2 + 2)}" width="${f1(tw + 24 + (o.ext ?? 0))}" height="12" rx="3" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2`)}/>`;
  } else {
    s += `<rect x="${f1(x - tw / 2 - 12)}" y="${f1(y - th / 2 - 14)}" width="${f1(tw + 24)}" height="12" rx="6" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2`)}/>`;
    s += `<rect x="${f1(x - 16)}" y="${f1(y - th / 2 - 24)}" width="32" height="12" rx="6" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2`)}/>`;
  }
  return s;
}

export function castFamilies() {
  registerCast('medA', { name: 'parent', role: 'adult', i: 21, look: { outfit: 'kurti', hairStyle: 'long', top: 's2', bottom: 'cream', dupatta: true, pattern: 'plain', glasses: false, moustache: false } });
  registerCast('medK', { name: 'child', role: 'child', i: 22, look: { outfit: 'tee', hairStyle: 'short', top: 's4', bottom: 'denim', bottomStyle: 'shorts', pattern: 'plain', glasses: false, dupatta: false } });
  registerCast('poorA', { name: 'parent', role: 'adult', i: 23, look: { outfit: 'shirt', hairStyle: 'sidepart', top: 's6', bottom: 'khaki', pattern: 'plain', moustache: true, glasses: false, dupatta: false } });
  registerCast('poorK', { name: 'child', role: 'child', i: 24, look: { outfit: 'kurti', hairStyle: 'braid', top: 's3', bottom: 'cream', pattern: 'plain', glasses: false, dupatta: false } });
  registerCast('waitA', { name: 'grandmother', role: 'elder', i: 25, look: { outfit: 'kurti', hairStyle: 'bun', top: 's8', bottom: 'cream', dupatta: true, pattern: 'plain', glasses: true, moustache: false } });
  registerCast('worker', { name: 'worker', role: 'worker', i: 26, look: { outfit: 'shirt', hairStyle: 'short', top: 's1', bottom: 'khaki', pattern: 'plain', moustache: false, glasses: false, dupatta: false } });
  registerCast('chemist', { name: 'shopkeeper', role: 'shopkeeper', i: 27, look: { outfit: 'kurta', hairStyle: 'sidepart', top: 's3', bottom: 'cream', pattern: 'plain', moustache: true, glasses: true, dupatta: false } });
}
