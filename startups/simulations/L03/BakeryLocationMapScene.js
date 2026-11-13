/**
 * BakeryLocationMapScene - L03 s03 "Where the bakery stands" (3 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 600 portrait. Cast: StallKit (bakery, breadLoaf, cakeJar), MoneyKit (coinPile), SimCivic (shop, school,
 * phone, tree), SimIcons (house), FinPeople (you, classmate2, walkers). Drawn here (no kit prop): the kitchen
 * room, an oven, a cake box, a pavement.
 *   b0 Location means two things: 'where it is made' (the kitchen: oven, a table of bread and cakes, you baking)
 *      and 'where it is sold' (the shop counter: the ABC Bakery shopfront; online: a phone). A cake box travels
 *      from the kitchen to each (0.7 s).
 *   b1 A busy area or a quiet lane: two streets side by side (stacked in portrait). Busy area: the bakery next to
 *      a market shop, five people walk past (0.6 s), a tall pile of coins 'higher rent'. Quiet lane: the
 *      bakery by a tree, one person walks past, a small pile 'lower rent'. No numbers.
 *   b2 Selling online: the bakery in the quiet lane, a phone order from homes far away (a dashed line 'order'),
 *      and your friend walks the cake box down the road to the homes (0.9 s), 'delivered'.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS, coinPile } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, bakery, breadLoaf, cakeJar } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

const CSS = `
svg .bl-go { animation: bl-go 0.7s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes bl-go { 0% { transform: translate(var(--fx), var(--fy)); opacity: 0; } 15% { opacity: 1; } 100% { transform: none; opacity: 1; } }
.bl-walk, svg .bl-walk { animation: bl-walk var(--t, 0.6s) cubic-bezier(.3,.7,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes bl-walk { 0% { transform: translateX(var(--fx, -60px)); opacity: 0; } 20% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .bl-pop { transform-box: fill-box; transform-origin: center bottom; animation: bl-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes bl-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .bl-go, .bl-walk, svg .bl-walk, svg .bl-pop { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;
const PAVE = 'color-mix(in oklab, var(--sim-stroke) 22%, var(--sim-bg-surface))';

function oven(x, y, w) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, body = 'color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))', rim = shade(body, 60);
  const glow = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))';
  let s = `<rect x="${f1(x0)}" y="${f1(top + 4)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill(rim)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill(body, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x0)} ${f1(top + h * 0.22)}H${f1(x0 + w)}" ${stroke(rim, 2.5)}/>`;
  for (const k of [0.2, 0.36]) s += `<circle cx="${f1(x0 + w * k)}" cy="${f1(top + h * 0.11)}" r="${f1(w * 0.05)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0 + w * 0.12)}" y="${f1(top + h * 0.32)}" width="${f1(w * 0.76)}" height="${f1(h * 0.56)}" rx="6" ${fill(glow, `stroke:${rim};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x0 + w * 0.22)} ${f1(top + h * 0.3)}H${f1(x0 + w * 0.78)}" ${stroke(rim, 5, 'stroke-linecap:round')}/>`;
  return s;
}

function cakeBox(x, y, w) {
  const h = w * 0.62, x0 = x - w / 2, top = y - h, rib = 'var(--sim-series-6)', rim = 'var(--sim-stroke)';
  return `<rect x="${f1(x0)}" y="${f1(top + 3)}" width="${f1(w)}" height="${f1(h)}" rx="5" ${fill(rim)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="5" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - w * 0.07)}" y="${f1(top)}" width="${f1(w * 0.14)}" height="${f1(h)}" ${fill(rib)}/>`
    + `<path d="M${f1(x)} ${f1(top)}c-14 -12 -20 2 -9 5zM${f1(x)} ${f1(top)}c14 -12 20 2 9 5z" ${fill(rib, `stroke:${shade(rib, 64)};stroke-width:2`)}/>`;
}

const arrow = (x0, y0, x1, y1, col) => {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 14;
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke(col, 4, 'stroke-dasharray:4 10;stroke-linecap:round')}/>`
    + `<path d="M${f1(x1 - L * Math.cos(a - 0.5))} ${f1(y1 - L * Math.sin(a - 0.5))}L${f1(x1)} ${f1(y1)}L${f1(x1 - L * Math.cos(a + 0.5))} ${f1(y1 - L * Math.sin(a + 0.5))}" ${stroke(col, 4, 'stroke-linecap:round;stroke-linejoin:round')}/>`;
};

export class BakeryLocationMapScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Location means where the goods are made and where they are sold: ABC Bakery bakes in its kitchen and sells at its shop counter and online. A shop in a busy area, next to a shop and a school, has many people walking past but a higher rent; a shop in a quiet lane has few people walking past and a lower rent. With orders by phone, a cake from the quiet-lane shop is delivered to homes far away.';

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintOnline(P, DW, DH) : v === 1 ? this.paintStreets(P) : this.paintTwo(P, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: where it is made (the kitchen) and where it is sold (the shop counter, online).
  paintTwo(P, DW, DH) {
    const G = P
      ? { room: [14, 50, 362, 210], h1: [195, 34], oven: [76, 236, 90], you: [168, 244, 140], table: [278, 206, 150], kit: [362, 86, 'end'],
        h2: [195, 298], shop: [112, 540, 150], shopLab: [112, 568], ph: [300, 530, 56], phLab: [300, 568], from: [195, 316], to: [[120, 392], [290, 404]] }
      : { room: [14, 62, 262, 336], h1: [145, 42], oven: [72, 348, 100], you: [158, 360, 170], table: [222, 306, 96], kit: [145, 428, 'middle'],
        h2: [418, 42], shop: [418, 230, 160], shopLab: [418, 258], ph: [418, 410, 58], phLab: [418, 438], from: [276, 230], to: [[334, 160], [384, 340]] };
    const [rx, ry, rw, rh] = G.room;
    let svg = text(G.h1[0], G.h1[1], 'where it is made', 24, 'var(--sim-label-muted)', 'middle', 700);
    svg += text(G.h2[0], G.h2[1], 'where it is sold', 24, 'var(--sim-label-muted)', 'middle', 700);
    // the kitchen: a room with a tiled wall and a floor
    const wall = 'color-mix(in oklab, var(--sim-series-2) 14%, var(--sim-bg-surface))';
    svg += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="16" ${fill(wall, 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    svg += `<rect x="${rx}" y="${ry + rh * 0.78}" width="${rw}" height="${rh * 0.22}" rx="0" ${fill(PAVE)}/>`;
    svg += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="16" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    svg += oven(G.oven[0], G.oven[1], G.oven[2]);
    const [tx, tt, tw] = G.table, tcol = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 30%)';
    let over = personSlot('you', { x: G.you[0], y: G.you[1], h: G.you[2], facing: 1, mood: 'happy' });
    let front = `<rect x="${f1(tx - tw / 2)}" y="${tt}" width="${tw}" height="12" rx="4" ${fill(tcol, `stroke:${shade(tcol, 64)};stroke-width:2`)}/>`
      + `<path d="M${f1(tx - tw / 2 + 10)} ${tt + 12}V${f1(ry + rh * 0.9)}M${f1(tx + tw / 2 - 10)} ${tt + 12}V${f1(ry + rh * 0.9)}" ${stroke(shade(tcol, 64), 6)}/>`
      + breadLoaf(tx - tw * 0.22, tt, tw * 0.4) + cakeJar(tx + tw * 0.26, tt, 44);
    over += frontSvg(P ? 390 : 560, P ? 600 : 480, front);
    svg += text(G.kit[0], G.kit[1], 'kitchen', 26, 'var(--sim-label)', G.kit[2]);
    // where it is sold: the shop counter, and online
    svg += bakery(G.shop[0], G.shop[1], G.shop[2]) + text(G.shopLab[0], G.shopLab[1], 'shop counter', 24);
    svg += civicSvg('phone', G.ph[0], G.ph[1], { w: G.ph[2] }) + text(G.phLab[0], G.phLab[1], 'online', 24);
    // two ways out of the kitchen, a cake box on each
    G.to.forEach(([x, y], i) => {
      svg += arrow(G.from[0], G.from[1] + (P ? 0 : i * 70), x, y, 'var(--sim-accent)');
      const bx = (G.from[0] + x) / 2 + (P ? (i ? 22 : -22) : 0), by = (G.from[1] + (P ? 0 : i * 70) + y) / 2 - 8;
      svg += `<g class="bl-go" style="--d:${(0.2 + i * 0.3).toFixed(2)}s;--fx:${f1(G.from[0] - bx)}px;--fy:${f1(G.from[1] + (P ? 0 : i * 70) - by)}px">${cakeBox(bx, by + 18, 44)}</g>`;
    });
    return { svg, over };
  }

  // b1: a busy area and a quiet lane, side by side.
  paintStreets(P) {
    const panels = P
      ? [{ x: 8, y: 8, w: 374, h: 286 }, { x: 8, y: 304, w: 374, h: 286 }]
      : [{ x: 8, y: 12, w: 268, h: 452 }, { x: 284, y: 12, w: 268, h: 452 }];
    let svg = '', over = '';
    panels.forEach((p, i) => {
      const busy = i === 0, col = busy ? 'var(--sim-series-6)' : 'var(--sim-series-3)';
      svg += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="16" ${fill(`color-mix(in oklab, ${col} 8%, var(--sim-bg-surface))`, `stroke:color-mix(in oklab, ${col} 55%, var(--sim-stroke));stroke-width:3`)}/>`;
      const L = P
        ? { title: [p.x + 16, p.y + 34, 'start'], bak: [p.x + 84, p.y + 182, 120], nb: [p.x + 206, p.y + 182, 92], gy: p.y + 238, pave: [p.y + 170, 76],
          walkX: busy ? [36, 92, 148, 204, 262] : [150], wh: 80, pile: [p.x + 318, p.y + 160], rent: [p.x + 318, p.y + 196], rent2: [p.x + 318, p.y + 222] }
        : { title: [p.x + p.w / 2, p.y + 40, 'middle'], bak: [p.x + 82, p.y + 236, 128], nb: [p.x + 206, p.y + 236, 96], gy: p.y + 300, pave: [p.y + 224, 86],
          walkX: busy ? [30, 80, 132, 184, 236] : [140], wh: 92, pile: [p.x + 134, p.y + 386], rent: [p.x + 134, p.y + 418], rent2: [p.x + 134, p.y + 442] };
      svg += text(L.title[0], L.title[1], busy ? 'busy area' : 'quiet lane', 26, 'var(--sim-label)', L.title[2]);
      svg += `<rect x="${p.x + 3}" y="${L.pave[0]}" width="${p.w - 6}" height="${L.pave[1]}" ${fill(PAVE)}/>`;
      svg += bakery(L.bak[0], L.bak[1], L.bak[2]);
      svg += busy ? civicSvg('shop', L.nb[0], L.nb[1], { w: L.nb[2] }) : civicSvg('tree', L.nb[0], L.nb[1], { w: L.nb[2] * 0.8 });
      // people walking past
      L.walkX.forEach((wx, j) => {
        over += personSlot(`buyer${j + 1 + (busy ? 0 : 5)}`, { x: p.x + wx, y: L.gy, h: L.wh, facing: j % 2 ? -1 : 1, mood: 'smile', cls: 'bl-walk', style: `--d:${(0.1 + j * 0.08).toFixed(2)}s;--fx:${j % 2 ? 50 : -50}px;` });
      });
      // the rent: a pile of coins, tall or small
      svg += `<g class="bl-pop" style="--d:0.6s">${coinPile(L.pile[0], L.pile[1], busy ? 1500 : 500, { r: P ? 10 : 12 })}</g>`;
      svg += text(L.rent[0], L.rent[1], 'rent', 21, 'var(--sim-label-muted)', 'middle', 700) + text(L.rent2[0], L.rent2[1] + 4, busy ? 'higher' : 'lower', 26, busy ? shade('var(--sim-bad)', 80) : shade('var(--sim-good)', 80));
    });
    return { svg, over };
  }

  // b2: an order by phone from homes far away; your friend carries the cake there.
  paintOnline(P, DW, DH) {
    const G = P
      ? { bak: [104, 240, 160], lane: [104, 270], homes: [[262, 520, 72], [338, 514, 62]], homeLab: [300, 552], ph: [318, 150, 50], road: 'M110 250 C 110 380, 260 380, 286 470',
        walk: [214, 468, 128], from: -110, order: [[290, 140], [190, 120]] }
      : { bak: [110, 372, 180], lane: [110, 406], homes: [[446, 372, 90], [522, 364, 74]], homeLab: [480, 406], ph: [472, 196, 64], road: 'M196 372 C 266 404, 326 404, 404 372',
        walk: [360, 376, 150], from: -170, order: [[436, 150], [214, 150]] };
    let svg = '';
    svg += `<path d="${G.road}" ${stroke(PAVE, 36, 'stroke-linecap:round')}/>` + `<path d="${G.road}" ${stroke('var(--sim-stroke)', 3, 'stroke-dasharray:10 12;stroke-linecap:round')}/>`;
    svg += bakery(G.bak[0], G.bak[1], G.bak[2]) + text(G.lane[0], G.lane[1], 'quiet lane', 24, 'var(--sim-label-muted)', 'middle', 700);
    G.homes.forEach(([x, y, s], i) => { svg += icon('house', i ? 4 : 6, x, y, s); });
    svg += text(G.homeLab[0], G.homeLab[1], 'homes far away', 24);
    // the order comes in by phone
    svg += civicSvg('phone', G.ph[0], G.ph[1], { w: G.ph[2] });
    const [[ox0, oy0], [ox1, oy1]] = G.order;
    svg += `<g class="bl-pop" style="--d:0.1s">${arrow(ox0, oy0, ox1, oy1, 'var(--sim-accent)')}</g>` + text((ox0 + ox1) / 2, Math.min(oy0, oy1) - 14, 'order', 24, 'var(--sim-accent)');
    // your friend walks the cake box down the road
    const [wx, wy, wh] = G.walk, hand = { x: wx + wh * 0.22, y: wy - wh * 0.5 };
    let over = personSlot('classmate2', { x: wx, y: wy, h: wh, facing: 1, mood: 'happy', hands: [hand, hand], cls: 'bl-walk', style: `--t:0.9s;--d:0.5s;--fx:${G.from}px;` });
    over += frontSvg(DW, DH, `<g class="bl-walk" style="--t:0.9s;--d:0.5s;--fx:${G.from}px">${cakeBox(hand.x + 6, hand.y + 16, 48)}</g>`);
    svg += `<g class="bl-pop" style="--d:1.4s">${text(wx, wy - wh - 18, 'delivered', 22, shade('var(--sim-good)', 80))}</g>`;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex }; }
}
