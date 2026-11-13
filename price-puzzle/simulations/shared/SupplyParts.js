/**
 * SupplyParts - the supply side of the price-puzzle cast (added by w2a for L03; any L03 / L04 scene may use it).
 * A seller stands BEHIND his stall: the person is a MangoPeople slot in the overlay, the stall, the heap on its
 * counter and any tags go in a front SVG layer (MangoPeople frontSvg) so the cart hides the legs. Design units.
 *
 *   SUP                                     market supply colour, var(--sim-series-7) (never series-5: that is
 *                                           market demand MKT and Seller B's top).
 *   SER(n), INK(n), SINK(n)                 series fill, ink on a series fill, series colour readable as text.
 *   SELLERS                                 ['sellerA', 'sellerB', 'sellerC'] (series 4 / 5 / 6).
 *   stallGeo(cx, gy, w)                     { k, top, awn, counter, cart } y values of a SimCivic stall drawn w wide
 *                                           with its ground centre at (cx, gy): awn = under the awning, counter =
 *                                           the cart top (where a heap stands), cart = the middle of the cart face.
 *   stallArt(cx, gy, w, { dim })            the SimCivic 'stall' without its own produce (our heap goes on it).
 *   sellerStall(who, cx, gy, w, kg, o)      { over, front }: the seller behind the stall, the stall, a heap of kg
 *                                           (3 mangoes a kg) on the left of the counter (the seller stands right of centre so the heap never hides
 *                                           his face), a name tag on the cart. Put over in the
 *                                           overlay BEFORE frontSvg(DW, DH, front). o: { mood, dim, r (mango radius),
 *                                           heapCls, heapStyle, tag (false: no name tag), tagSize, pose, h, side (person and heap
 *                                           offset, default 0.2 w: person at cx + side, heap at cx - side) }.
 *   poles(cx, boardY, top, gap)             two poles from a price board down to the stall roof.
 *   bigArrow(x, y1, y2, dir, col, w)        a block arrow up (dir -1) or down (dir 1) between y1 (top) and y2.
 * Colours are tokens only. ASCII only.
 */
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { heap } from './MangoKit.js';
import { personSlot, nameTag } from './MangoPeople.js';

const f1 = (v) => (+v).toFixed(1);

export const SUP = 'var(--sim-series-7)';
export const SER = (n) => `var(--sim-series-${n})`;
export const INK = (n) => `var(--sim-ink-on-${n}, var(--sim-bg-deep))`;
export const SINK = (n) => `var(--sim-series-${n}-ink, var(--sim-series-${n}))`;
export const SELLERS = ['sellerA', 'sellerB', 'sellerC'];

export function stallGeo(cx, gy, w) {
  const k = w / 230;
  return { k, top: gy - 200 * k, awn: gy - 150 * k, counter: gy - 84 * k, cart: gy - 70 * k };
}

export function stallArt(cx, gy, w, o = {}) {
  const s = civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');
  return o.dim ? `<g opacity="0.4">${s}</g>` : s;
}

export function sellerStall(who, cx, gy, w, kg, o = {}) {
  const G = stallGeo(cx, gy, w), k = G.k;
  const h = o.h ?? 138 * k, side = o.side ?? 0.2 * w;
  const over = personSlot(who, { x: cx + side, y: gy - 4 * k, h, pose: o.pose ?? 'stand', facing: 0, mood: o.mood ?? 'smile', dim: o.dim });
  let front = stallArt(cx, gy, w, { dim: o.dim });
  if (kg > 0) {
    const hp = heap(cx - side, G.counter + 1, kg, { r: o.r ?? 10 * k });
    front += o.heapCls ? `<g class="${o.heapCls}" style="${o.heapStyle ?? ''}">${hp}</g>` : (o.dim ? `<g opacity="0.4">${hp}</g>` : hp);
  }
  if (o.tag !== false) {
    const ts = o.tagSize ?? Math.max(14, Math.min(19, 19 * k));
    front += `<g${o.dim ? ' opacity="0.4"' : ''}>${nameTag(cx, G.counter + 3 * k, who, ts)}</g>`;
  }
  return { over, front, G };
}

export function poles(cx, boardY, top, gap = 40) {
  return `<path d="M${f1(cx - gap)} ${f1(boardY)}V${f1(top + 12)}M${f1(cx + gap)} ${f1(boardY)}V${f1(top + 12)}" ${stroke('var(--sim-stroke)', 3)}/>`;
}

export function bigArrow(x, y1, y2, dir, col, w = 30) {
  const head = w * 1.15, hw = w * 1.05;
  const tip = dir < 0 ? y1 : y2, base = dir < 0 ? y2 : y1, neck = tip - dir * head;
  const d = `M${f1(x - w / 2)} ${f1(base)}L${f1(x - w / 2)} ${f1(neck)}L${f1(x - hw)} ${f1(neck)}L${f1(x)} ${f1(tip)}L${f1(x + hw)} ${f1(neck)}L${f1(x + w / 2)} ${f1(neck)}L${f1(x + w / 2)} ${f1(base)}Z`;
  return `<path d="${d}" transform="translate(0 4)" ${fill(shade(col, 70))}/><path d="${d}" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2.5;stroke-linejoin:round`)}/>`;
}
