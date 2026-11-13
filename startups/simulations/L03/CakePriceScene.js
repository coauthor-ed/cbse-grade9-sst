/**
 * CakePriceScene - L03 s04 "Setting the price" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 600
 * portrait. Cast: shared/StallKit.js (cakeJar), shared/MoneyKit.js (tag, rs), shared/FinPeople.js (child,
 * parent). The whole cake on its stand is drawn here (StallKit has no full cake). Made-up numbers (the text):
 * one cake costs Rs 150 to make; at Rs 120 each cake loses Rs 30, at Rs 220 it leaves Rs 70; a mini cake jar
 * Rs 50, a full cake Rs 350.
 *   b0 One cake and its price ('?'), three checks pop in one by one (0.5 s apart): covers its cost, leaves
 *      some profit, customers can pay. No numbers.
 *   b1 Two price bars on one Rs 0 - 250 scale, a dashed cost line at Rs 150 across both: Rs 120 stops under
 *      the line (the gap is hatched in the bad colour, '-Rs 30 a cake'); Rs 220 passes it (the part above is
 *      the good colour, '+Rs 70 a cake') with 'families can pay'. Bars rise 0.5 s, then the gaps pop.
 *   b2 A shop counter: a mini cake jar (tag Rs 50) and a full cake (tag Rs 350); a child with pocket money
 *      comes to the jar, a parent ordering for a birthday comes to the cake (walk in 0.8 s).
 * 'made-up numbers' on b1 and b2. No host controls; nothing to tap (watch only). Colours are tokens only.
 * ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, tag, rs, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, cakeJar } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PRICE_COL = 'var(--sim-series-1)';

const CSS = `
.cp-walk { animation: cp-walk 0.8s cubic-bezier(.3,.8,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes cp-walk { 0% { transform: translateX(var(--dx, 60px)); opacity: 0; } 30% { opacity: 1; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .cp-walk { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

const SPONGE = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 22%)';
const CREAM = 'color-mix(in oklab, var(--sim-series-4) 22%, var(--sim-bg-surface))';
const ICING = 'color-mix(in oklab, var(--sim-series-4) 55%, var(--sim-bg-surface))';
const BERRY = 'var(--sim-series-6)';

/** A round two-layer cake on a stand, side view; (x, y) = the ground under the stand; height about 0.82 w. */
function cake(x, y, w) {
  const x0 = x - w / 2, sh = w * 0.18, top = y - sh - w * 0.52, lay = (w * 0.52) / 2, rim = shade(SPONGE, 62), irim = shade(ICING, 66);
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w * 0.42)}" ry="${f1(w * 0.03)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`;
  // the stand: a foot, a stem, a plate
  s += `<path d="M${f1(x - w * 0.2)} ${f1(y)}Q${f1(x)} ${f1(y - w * 0.07)} ${f1(x + w * 0.2)} ${f1(y)}Z" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-linejoin:round')}/>`;
  s += `<rect x="${f1(x - w * 0.05)}" y="${f1(y - sh + 4)}" width="${f1(w * 0.1)}" height="${f1(sh - 8)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>`;
  s += `<rect x="${f1(x0 - w * 0.06)}" y="${f1(y - sh - 4)}" width="${f1(w * 1.12)}" height="10" rx="5" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>`;
  // two sponge layers with cream between
  const by = y - sh - 4;
  s += `<rect x="${f1(x0)}" y="${f1(by - lay)}" width="${f1(w)}" height="${f1(lay)}" rx="8" ${fill(SPONGE, `stroke:${rim};stroke-width:2.5`)}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(by - lay - w * 0.05)}" width="${f1(w)}" height="${f1(w * 0.05)}" rx="4" ${fill(CREAM, `stroke:${rim};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(lay - w * 0.05 + 2)}" rx="8" ${fill(SPONGE, `stroke:${rim};stroke-width:2.5`)}/>`;
  // the icing on top with drips
  let d = `M${f1(x0 - 3)} ${f1(top - 4)}H${f1(x0 + w + 3)}V${f1(top + w * 0.06)}`;
  const n = 6, sw = (w + 6) / n;
  for (let i = 0; i < n; i++) {
    const dl = w * (i % 2 ? 0.07 : 0.13);
    d += `L${f1(x0 + w + 3 - i * sw - sw * 0.2)} ${f1(top + w * 0.06)}q${f1(-sw * 0.3)} ${f1(dl * 2)} ${f1(-sw * 0.6)} 0`;
  }
  d += `L${f1(x0 - 3)} ${f1(top + w * 0.06)}Z`;
  s += `<path d="${d}" ${fill(ICING, `stroke:${irim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  s += `<rect x="${f1(x0 - 3)}" y="${f1(top - w * 0.06)}" width="${f1(w + 6)}" height="${f1(w * 0.07)}" rx="${f1(w * 0.035)}" ${fill(ICING, `stroke:${irim};stroke-width:2.5`)}/>`;
  // berries on top
  for (const fx of [-0.3, 0, 0.3]) {
    const cx = x + fx * w, cy = top - w * 0.08, r = w * 0.055;
    s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" ${fill(BERRY, `stroke:${shade(BERRY, 62)};stroke-width:2`)}/>`;
    s += `<circle cx="${f1(cx - r * 0.35)}" cy="${f1(cy - r * 0.35)}" r="${f1(r * 0.25)}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)')}/>`;
  }
  return s;
}

/** A tick in a round badge (good) or a cross (bad); centre (x, y). */
function badge(x, y, r, ok = true) {
  const col = ok ? 'var(--sim-good)' : 'var(--sim-bad)', rim = shade(col, 62);
  const mark = ok ? `M${f1(x - r * 0.45)} ${f1(y + r * 0.02)}l${f1(r * 0.3)} ${f1(r * 0.32)}l${f1(r * 0.6)} ${f1(-r * 0.66)}`
    : `M${f1(x - r * 0.38)} ${f1(y - r * 0.38)}l${f1(r * 0.76)} ${f1(r * 0.76)}M${f1(x + r * 0.38)} ${f1(y - r * 0.38)}l${f1(-r * 0.76)} ${f1(r * 0.76)}`;
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="${mark}" ${stroke('var(--sim-bg-deep)', r * 0.24)}/>`;
}

/** A flat card with a lip, (x, y) top left. */
function card(x, y, w, h, col = 'var(--sim-stroke)', bg = 'var(--sim-bg-surface)') {
  return `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(col)}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(bg, `stroke:${col};stroke-width:2.5`)}/>`;
}

const HATCH = '<defs><pattern id="cp-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" style="fill:color-mix(in oklab, var(--sim-bad) 22%, var(--sim-bg-surface))"/><path d="M0 0V12" style="stroke:var(--sim-bad);stroke-width:4"/></pattern></defs>';

export class CakePriceScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Made-up numbers. A cake price must cover the cost, leave some profit and stay affordable. One cake costs 150 rupees to make: at a price of 120 rupees each cake loses 30 rupees; at 220 rupees each cake leaves 70 rupees and families can still pay. A range of prices: a mini cake jar at 50 rupees for a child with pocket money, a full cake at 350 rupees for a parent ordering for a birthday.';

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintTwo(P) : v === 2 ? this.paintRange(P) : this.paintChecks(P);
    if (v > 0) out.svg += text(P ? 195 : 548, 24, 'made-up numbers', 16, 'var(--sim-label-muted)', P ? 'middle' : 'end', 700);
    return { svg: `<g transform="scale(${k})">${HATCH}${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the cake with a '?' price, three checks pop in.
  paintChecks(P) {
    const G = P
      ? { ck: [195, 300, 220], tg: [300, 70], rows: [[30, 336], [30, 418], [30, 500]], rw: 330, rh: 68 }
      : { ck: [148, 436, 236], tg: [160, 130], rows: [[284, 120], [284, 220], [284, 320]], rw: 264, rh: 76 };
    let svg = cake(G.ck[0], G.ck[1], G.ck[2]);
    svg += tag(G.tg[0], G.tg[1], 'price', null, { w: 150, labelSize: 20 }) + text(G.tg[0] + 12, G.tg[1] + 32, '?', 30, 'var(--sim-label)');
    const L = ['covers its cost', 'leaves some profit', 'customers can pay'];
    G.rows.forEach(([x, y], i) => {
      svg += `<g class="mk-pop" style="--d:${0.3 + i * 0.5}s">${card(x, y, G.rw, G.rh)}${badge(x + 36, y + G.rh / 2, 21)}`
        + text(x + 66, y + G.rh / 2 + 8, L[i], 23, 'var(--sim-label)', 'start') + '</g>';
    });
    return { svg };
  }

  // b1: two prices against one cost line.
  paintTwo(P) {
    const G = P
      ? { base: 528, top: 198, cols: [142, 298], bw: 100, x0: 14, x1: 376, cap: 150, lab: 22 }
      : { base: 440, top: 112, cols: [236, 436], bw: 132, x0: 16, x1: 540, cap: 72, lab: 24 };
    const Y = (r) => G.base - (G.base - G.top) * r / 250, yc = Y(150);
    let svg = `<path d="M${G.x0} ${G.base}H${G.x1}" ${stroke('var(--sim-stroke)', 3)}/>`;
    const cases = [{ p: 120, d: -30 }, { p: 220, d: 70 }];
    cases.forEach(({ p, d }, i) => {
      const cx = G.cols[i], x = cx - G.bw / 2, yt = Y(p), edge = shade(PRICE_COL, 64);
      svg += `<g class="mk-rise" style="--d:${0.1 + i * 0.4}s"><rect x="${f1(x)}" y="${f1(yt)}" width="${G.bw}" height="${f1(G.base - yt)}" rx="10" ${fill(`color-mix(in oklab, ${PRICE_COL} 40%, var(--sim-bg-surface))`, `stroke:${edge};stroke-width:3`)}/></g>`;
      svg += text(cx, G.base - 52, rs(p), 32, 'var(--sim-label)') + text(cx, G.base - 16, 'price', 20, 'var(--sim-label-muted)', 'middle', 700);
      if (d < 0) {
        svg += `<g class="mk-pop" style="--d:1.1s"><rect x="${f1(x)}" y="${f1(yc)}" width="${G.bw}" height="${f1(yt - yc)}" rx="6" style="fill:url(#cp-hatch);stroke:var(--sim-bad);stroke-width:3"/>`
          + text(cx, yc - 56, `-${rs(30)}`, 36, 'var(--sim-bad)') + text(cx, yc - 20, 'a cake', 22, 'var(--sim-bad)', 'middle', 700) + '</g>';
      } else {
        svg += `<g class="mk-pop" style="--d:1.3s"><rect x="${f1(x + 4)}" y="${f1(yt + 4)}" width="${G.bw - 8}" height="${f1(yc - yt - 6)}" rx="8" ${fill('color-mix(in oklab, var(--sim-good) 28%, var(--sim-bg-surface))', 'stroke:var(--sim-good);stroke-width:3;stroke-dasharray:9 6')}/>`
          + text(cx, (yt + yc) / 2 - 4, `+${rs(70)}`, 32, shade('var(--sim-good)', 72)) + text(cx, (yt + yc) / 2 + 26, 'a cake', 20, shade('var(--sim-good)', 72), 'middle', 700) + '</g>';
        svg += `<g class="mk-pop" style="--d:1.7s">${badge(cx - 82, yt - 30, 16)}${text(cx - 60, yt - 22, 'families can pay', 22, 'var(--sim-label)', 'start')}</g>`;
      }
    });
    // the cost line on top of both bars
    svg += `<path d="M${G.x0} ${f1(yc)}H${G.x1}" ${stroke('var(--sim-label)', 3, 'stroke-dasharray:10 7')}/>`;
    svg += text(G.x0, yc - 12, 'cost', G.lab, 'var(--sim-label-muted)', 'start', 700) + text(G.x0, yc + 32, rs(150), P ? 25 : 28, 'var(--sim-label)', 'start');
    if (P) svg += text(195, 66, 'one cake costs', 22, 'var(--sim-label-muted)', 'middle', 700) + text(195, 102, `${rs(150)} to make`, 30, 'var(--sim-label)');
    return { svg };
  }

  // b2: a mini cake jar and a full cake on one counter; a child and a parent come to them.
  paintRange(P) {
    const G = P
      ? { ct: [40, 360, 310, 64], jar: [110, 120], ck: [270, 150], tj: [110, 104], tc: [272, 104], lj: [110, 162], lc: [272, 162],
        kid: [92, 592, 150], par: [300, 592, 196], coin: [150, 470] }
      : { ct: [118, 340, 324, 96], jar: [190, 118], ck: [362, 158], tj: [190, 96], tc: [362, 96], lj: [190, 154], lc: [362, 154],
        kid: [62, 456, 150], par: [502, 456, 206], coin: [100, 380] };
    const [cx, cy, cw, ch] = G.ct, top = cy;
    let svg = '';
    // the counter
    svg += `<rect x="${cx}" y="${cy + 4}" width="${cw}" height="${ch}" rx="8" ${fill('color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 40%)')}/>`
      + `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="8" ${fill('color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))', 'stroke:color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 40%);stroke-width:2.5')}/>`
      + `<rect x="${cx - 8}" y="${cy - 6}" width="${cw + 16}" height="12" rx="6" ${fill('color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 40%)')}/>`;
    svg += cakeJar(G.jar[0], top - 6, G.jar[1]);
    svg += cake(G.ck[0], top - 6, G.ck[1]);
    svg += `<g class="mk-pop" style="--d:0.2s">${tag(G.tj[0], G.tj[1], 'mini cake jar', 50, { w: 158, valueSize: 32, labelSize: 19 })}</g>`;
    svg += `<g class="mk-pop" style="--d:0.4s">${tag(G.tc[0], G.tc[1], 'full cake', 350, { w: 158, valueSize: 32, labelSize: 19 })}</g>`;
    svg += `<g class="mk-pop" style="--d:1s">${text(G.lj[0], G.lj[1], 'pocket money', 22, 'var(--sim-label-muted)', 'middle', 700)}${text(G.lc[0], G.lc[1], 'for a birthday', 22, 'var(--sim-label-muted)', 'middle', 700)}</g>`;
    let over = personSlot('child', { x: G.kid[0], y: G.kid[1], h: G.kid[2], facing: 1, mood: 'happy', cls: 'cp-walk', style: '--dx:-60px;--d:0.3s;' });
    over += personSlot('parent', { x: G.par[0], y: G.par[1], h: G.par[2], facing: -1, mood: 'smile', cls: 'cp-walk', style: '--dx:60px;--d:0.5s;' });
    svg += `<g class="mk-pop" style="--d:1.1s">${coin(G.coin[0], G.coin[1], 16)}</g>`;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex }; }
}
