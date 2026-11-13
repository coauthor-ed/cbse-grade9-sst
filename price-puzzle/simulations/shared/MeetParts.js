/**
 * MeetParts - the L05 market picture shared by MarketMeetScene (s01) and SurplusGapScene (s02 / s03), added by
 * w3a: buyers (Srivalli, Alex, Israt) on one side, Seller A, B and C behind one long stall on the other, a
 * crate in front of each side. Design units: landscape 560 x 500 (buyers left, sellers right), portrait
 * 390 x 600 (sellers on top, buyers below, prices in the band between).
 *
 *   MEET_H                                 { land: 500, port: 600 } design heights.
 *   meetGeo(P)                             the layout: boards (three price boards), big (one board), buyers,
 *                                          stall, sellers, crates (B buyers, S sellers), chips (spots over
 *                                          each side), hint, tag spots (tagB / tagS: where a portrait tag goes; landscape tags sit over their crate).
 *   people(G, o)                           { over, front }: the three buyers and the three sellers behind the
 *                                          stall (stall art in front). o: { moods: [3] buyer moods, sMood,
 *                                          row (true: a low row of mangoes along the counter), dimB, dimS }.
 *   bigCrate(x, y, w, kg, o)               a market crate (MarketParts look) holding kg (3 mangoes a kg);
 *                                          o: { ghost (kg wanted: dim mangoes behind the real ones),
 *                                          ring (accent outline), cls, style }.
 *   priceRow(G, sel, o)                    { svg, over }: the three price boards with hit buttons
 *                                          (data-act "price", data-val = index in PRICES). o: { arrow: index
 *                                          to put a down (1) / up (-1) block arrow beside, dir }.
 *   PRICES                                 [150, 100, 50]; WANT [6, 12, 18]; OFFER [18, 12, 6] (STORYBOARD 0).
 * Colours are tokens only. ASCII only.
 */
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { heap, mango, priceBoard } from './MangoKit.js';
import { personSlot } from './MangoPeople.js';
import { stallArt, SELLERS, bigArrow } from './SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
export const PRICES = [150, 100, 50];
export const WANT = [6, 12, 18];
export const OFFER = [18, 12, 6];
export const SPLIT = [[3, 7, 8], [2, 4, 6], [1, 3, 2]];
export const BUYERS = ['srivalli', 'alex', 'israt'];
export const MEET_H = { land: 500, port: 600 };

export function meetGeo(P) {
  return P
    ? { DW: 390, DH: 600, boards: { xs: [84, 195, 306], y: 360, w: 100, h: 50, aw: 13, outer: true }, big: [195, 360, 176, 66], hint: 404,
      buyers: { xs: [80, 195, 310], gy: 596, h: 156, facing: 0 }, stall: { cx: 195, gy: 242, w: 250 },
      sellers: { xs: [130, 195, 260], h: 140 }, crB: [195, 598, 150], crS: [195, 336, 124],
      chipB: [195, 412], chipS: [195, 30], tagB: [195, 410], tagS: [195, 200], case: [195, 30] }
    : { DW: 560, DH: 500, boards: { xs: [100, 280, 460], y: 46, w: 140, h: 56 }, big: [280, 54, 200, 76], hint: 96,
      buyers: { xs: [56, 128, 200], gy: 405, h: 190, facing: 1 }, stall: { cx: 405, gy: 405, w: 290 },
      sellers: { xs: [333, 405, 477], h: 160 }, crB: [128, 494, 176], crS: [405, 494, 176],
      chipB: [122, 160], chipS: [405, 128], tagB: [128, 372], tagS: [405, 372], case: [280, 108] };
}

export function people(G, o = {}) {
  let over = '', front = '';
  const B = G.buyers, S = G.stall, moods = o.moods ?? ['smile', 'smile', 'smile'];
  BUYERS.forEach((w, j) => { over += personSlot(w, { x: B.xs[j], y: B.gy, h: B.h, pose: 'stand', facing: B.facing, mood: moods[j], dim: o.dimB }); });
  const k = S.w / 230, counter = S.gy - 84 * k;
  SELLERS.forEach((w, j) => { over += personSlot(w, { x: G.sellers.xs[j], y: S.gy - 4 * k, h: G.sellers.h, pose: 'stand', facing: 0, mood: o.sMood ?? 'smile', dim: o.dimS }); });
  front += stallArt(S.cx, S.gy, S.w, { dim: o.dimS });
  if (o.row) {
    // a low row of mangoes along the counter (two layers), so no face is hidden
    const r = 6.2 * k, dx = r * 2.2, n = Math.floor((S.w * 0.78) / dx);
    let m = '';
    for (let l = 0; l < 2; l++) for (let j = 0; j < n - l; j++) m += mango(S.cx + (j - (n - l - 1) / 2) * dx, counter - r * 0.7 - l * r * 1.3, r);
    front += o.dimS ? `<g opacity="0.4">${m}</g>` : m;
  }
  return { over, front };
}

export function bigCrate(x, y, w, kg, o = {}) {
  const h = w * 0.55, wood = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))';
  const rim = shade(wood, 60), x0 = x - w / 2, top = y - h, r = w * 0.04;
  let s = '';
  if (o.ring) s += `<rect x="${f1(x0 - 9)}" y="${f1(top - 26 - w * 0.12)}" width="${f1(w + 18)}" height="${f1(h + 34 + w * 0.12)}" rx="16" ${fill('color-mix(in oklab, var(--sim-accent) 14%, transparent)', 'stroke:var(--sim-accent);stroke-width:4;stroke-dasharray:10 7')}/>`;
  s += `<rect x="${f1(x0 + 6)}" y="${f1(top - 10)}" width="${f1(w - 12)}" height="${f1(h)}" rx="6" ${fill(shade(wood, 78), `stroke:${rim};stroke-width:2.5`)}/>`;
  if (o.ghost > 0) s += `<g style="opacity:0.3">${heap(x, top + h * 0.45, o.ghost, { r })}</g>`;
  if (kg > 0) s += `<g${o.cls ? ` class="${o.cls}" style="${o.style ?? ''}"` : ''}>${heap(x, top + h * 0.45, kg, { r })}</g>`;
  s += `<rect x="${f1(x0)}" y="${f1(top + h * 0.28)}" width="${f1(w)}" height="${f1(h * 0.72)}" rx="7" ${fill(wood, `stroke:${rim};stroke-width:3`)}/>`;
  s += `<path d="M${f1(x0 + 4)} ${f1(top + h * 0.64)}H${f1(x0 + w - 4)}" ${stroke(rim, 2.5)}/>`;
  for (const fx of [0.12, 0.88]) s += `<path d="M${f1(x0 + w * fx)} ${f1(top + h * 0.3)}V${f1(y - 3)}" ${stroke(rim, 3)}/>`;
  return s;
}

export function priceRow(G, sel, o = {}) {
  const b = G.boards;
  let svg = '', over = '';
  PRICES.forEach((p, j) => {
    const on = j === sel;
    svg += priceBoard(b.xs[j], b.y, p, { w: b.w, h: b.h, active: on, dim: !on });
    over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="price" data-val="${j}" aria-label="${p} rupees a kg" aria-pressed="${on}" style="left:${f1(b.xs[j] - b.w / 2 - 4)}px;top:${f1(b.y - b.h / 2 - 6)}px;width:${f1(b.w + 8)}px;height:${f1(b.h + 16)}px"></button>`;
  });
  if (o.dir) {
    const aw = b.aw ?? 18, side = b.outer && sel === 0 ? -1 : 1, x = b.xs[sel] + side * (b.w / 2 + aw * 1.05 + 2), half = b.h * 0.55;
    svg += `<g${o.pop ? ' class="mq-pop" style="--d:0.2s"' : ''}>${bigArrow(x, b.y - half, b.y + half, o.dir, 'var(--sim-accent)', aw)}</g>`;
  }
  return { svg, over };
}
