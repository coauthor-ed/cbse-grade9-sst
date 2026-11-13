/**
 * BakeryMarketingScene - L04 s04b "Marketing and sales" (2 beats). SvgScene, design 560 x 480 landscape, 390 x 600
 * portrait. Cast: shared/StallKit.js (bakery, breadLoaf, cakeJar), shared/FinPeople.js (parent and child as
 * customers), shared/MoneyKit.js (bicycle). Drawn here (copied from L03 BakeryPromotionScene: phone, coupon, cake
 * box; new: a mango cake, a recycle mark, an order screen, a play mark, hearts).
 *   b0 Marketing brings customers in: ABC Bakery in the middle, its sign ringed ('a catchy name'); a phone with a
 *      post ('social media') and a special-offer coupon ('discounts') pop in 0.4 s apart; arrows run from them to
 *      the door and a parent and a child walk up (0.6 s); a calendar chip 'every week'.
 *   b1 Five simple ways (the book's list): five buttons in the figure, 'mango cake' (at rest and on cold start),
 *      'special offer', 'order online', 'photos, videos', 'recyclable box'; each shows one picture: a mango cake
 *      ('made to order'), the coupon by the bread and jars ('deals'), a phone order and a delivery bicycle riding
 *      to a house ('delivery'), a phone post with a play mark and hearts ('shared online'), the cake box with a
 *      recycle mark ('can be recycled').
 * No numbers (none in the text). Animation is CSS only; Skip / Replay in the figure. Rest = the final frame.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, bicycle } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, bakery, breadLoaf, cakeJar } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const WAYS = [
  { btn: 'mango cake', cap: 'made to order' },
  { btn: 'special offer', cap: 'deals' },
  { btn: 'order online', cap: 'delivery' },
  { btn: 'photos, videos', cap: 'shared online' },
  { btn: 'recyclable box', cap: 'can be recycled' },
];
const DUR = [2.6, 1.8];

const CSS = `
.mm-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; display: flex; align-items: center; gap: 6px;
  padding: 3px 12px; border-radius: 999px; font: 800 21px/1.2 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.mm-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.mm-chip.big { font-size: 25px; padding: 4px 14px; }
.mm-chip svg { width: 28px; height: 28px; flex: none; }
.mm-ab { position: absolute; transform: translate(-50%, -50%); }
.mm-btn { min-height: 52px; padding: 4px 10px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mm-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.mm-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.mm-btn:focus-visible, .mm-skip:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.mm-skip { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mm-skip:active { transform: translateY(3px); box-shadow: none; }
.mm-in { animation: mm-in 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes mm-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
.mm-walk { animation: mm-walk 0.7s cubic-bezier(.3,.8,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes mm-walk { 0% { transform: translateX(var(--wx, 60px)); opacity: 0; } 35% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .mm-fade { animation: mm-fade 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes mm-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .mm-ride { animation: mm-ride 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes mm-ride { 0% { transform: translateX(var(--fx, -120px)); } 100% { transform: none; } }
.mm-still, .mm-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .mm-in, .mm-walk, svg .mm-fade, svg .mm-ride { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);
const iconAt = (name, x, y, size, tone) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
const iconHtml = (name, tone) => iconSvg(name, tone).replace('width="48" height="48"', 'width="28" height="28"');
const chip = (t, x, y, d, cls = '') => `<div class="mm-chip mm-in${cls ? ` ${cls}` : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;

const BOX = 'color-mix(in oklab, var(--sim-series-4) 26%, var(--sim-bg-surface))';
const SPONGE = 'color-mix(in oklab, var(--sim-series-8) 45%, var(--sim-bg-surface))';
const MANGO = 'color-mix(in oklab, var(--sim-series-2) 70%, var(--sim-series-6) 30%)';
const CREAM = 'color-mix(in oklab, var(--sim-series-2) 22%, var(--sim-bg-surface))';

function arrow(x0, y0, x1, y1, d, col = 'var(--sim-accent)') {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 14;
  const p1 = [x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], p2 = [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)];
  return `<g class="mm-fade" style="--d:${d}s"><path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke(col, 4.5)} style="stroke-dasharray:10 7"/>`
    + `<path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(x1)} ${f1(y1)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke(col, 4.5)} style="stroke-linejoin:round"/></g>`;
}

/** A phone: (x, y) centre, w wide (height 1.8 w); screen = 'post' | 'order'. */
function phone(x, y, w, screen = 'post') {
  const h = w * 1.8, x0 = x - w / 2, y0 = y - h / 2, body = 'color-mix(in oklab, var(--sim-series-5) 60%, var(--sim-label) 30%)';
  let s = rect(x0, y0 + 4, w, h, w * 0.14, shade(body, 70)) + rect(x0, y0, w, h, w * 0.14, body);
  const sx = x0 + w * 0.08, sy = y0 + h * 0.07, sw = w * 0.84, sh = h * 0.86;
  s += rect(sx, sy, sw, sh, w * 0.06, 'var(--sim-bg-surface)');
  if (screen === 'order') {
    // an order list: three rows with a tick box, a big order button
    [[0.12, true], [0.3, true], [0.48, false]].forEach(([t, on]) => {
      const ry = sy + sh * t;
      s += rect(sx + sw * 0.08, ry, sw * 0.16, sw * 0.16, 3, on ? 'var(--sim-good)' : 'var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:1.6');
      s += rect(sx + sw * 0.32, ry + sw * 0.05, sw * 0.58, sh * 0.035, 3, 'var(--sim-label-muted)');
    });
    s += cakeJar(x, sy + sh * 0.8, sh * 0.18);
    s += rect(sx + sw * 0.1, sy + sh * 0.84, sw * 0.8, sh * 0.11, 6, 'var(--sim-accent)');
    return s;
  }
  s += `<circle cx="${f1(sx + sw * 0.16)}" cy="${f1(sy + sh * 0.09)}" r="${f1(sw * 0.09)}" ${fill('var(--sim-series-8)')}/>`;
  s += rect(sx + sw * 0.32, sy + sh * 0.06, sw * 0.56, sh * 0.05, 3, 'var(--sim-label-muted)');
  s += rect(sx + sw * 0.06, sy + sh * 0.2, sw * 0.88, sh * 0.5, 6, 'color-mix(in oklab, var(--sim-series-4) 18%, var(--sim-bg-surface))');
  s += cakeJar(x - sw * 0.18, sy + sh * 0.66, sh * 0.3) + breadLoaf(x + sw * 0.2, sy + sh * 0.64, sw * 0.4);
  const hx = sx + sw * 0.16, hy = sy + sh * 0.8;
  s += heart(hx, hy, sw * 0.08);
  s += rect(sx + sw * 0.32, hy - 4, sw * 0.56, sh * 0.04, 3, 'var(--sim-label-muted)') + rect(sx + sw * 0.06, sy + sh * 0.89, sw * 0.7, sh * 0.04, 3, 'var(--sim-label-muted)');
  return s;
}

function heart(x, y, r, col = 'var(--sim-series-6)') {
  return `<path d="M${f1(x)} ${f1(y + r * 1.2)}l${f1(-r * 1.2)} ${f1(-r * 1.2)}a${f1(r * 0.62)} ${f1(r * 0.62)} 0 0 1 ${f1(r * 1.2)} ${f1(-r * 0.9)}a${f1(r * 0.62)} ${f1(r * 0.62)} 0 0 1 ${f1(r * 1.2)} ${f1(r * 0.9)}Z" ${fill(col, `stroke:${shade(col, 62)};stroke-width:1.5;stroke-linejoin:round`)}/>`;
}

/** A coupon with a dashed edge: (x, y) centre. */
function coupon(x, y, w) {
  const h = w * 0.72, x0 = x - w / 2, y0 = y - h / 2, col = 'var(--sim-series-3)', rim = shade(col, 62), fs = Math.max(18, w * 0.14);
  let s = rect(x0, y0 + 4, w, h, 10, rim) + rect(x0, y0, w, h, 10, `color-mix(in oklab, ${col} 26%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2.5`);
  s += rect(x0 + 7, y0 + 7, w - 14, h - 14, 6, 'none', `stroke:${rim};stroke-width:2;stroke-dasharray:7 5`);
  const r = h * 0.15, cx = x, cy = y0 + h * 0.27;
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr)}`; }
  s += `<path d="${d}Z" ${fill('var(--sim-series-2)', `stroke:${shade('var(--sim-series-2)', 62)};stroke-width:2;stroke-linejoin:round`)}/>`;
  s += text(x, y0 + h * 0.6, 'special', fs, 'var(--sim-label)') + text(x, y0 + h * 0.6 + fs * 1.12, 'offer', fs, 'var(--sim-label)');
  return s;
}

/** A closed cake box with a window and a name band; (x, y) bottom centre. */
function cakeBox(x, y, w) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, rim = shade(BOX, 62);
  let s = rect(x0, top + 4, w, h, 8, rim) + rect(x0, top, w, h, 8, BOX, `stroke:${rim};stroke-width:2.5`);
  s += rect(x0 - 5, top - 4, w + 10, h * 0.14, 6, BOX, `stroke:${rim};stroke-width:2.5`);
  const wx = x0 + w * 0.14, wy = top + h * 0.3, ww = w * 0.72, wh = h * 0.42;
  s += rect(wx, wy, ww, wh, 6, 'color-mix(in oklab, var(--sim-ice) 45%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2`);
  s += cakeJar(x - ww * 0.2, wy + wh - 6, wh * 0.7) + cakeJar(x + ww * 0.2, wy + wh - 6, wh * 0.7);
  s += rect(x0, top + h * 0.13, w, h * 0.15, 0, 'var(--sim-series-8)');
  s += text(x, top + h * 0.13 + h * 0.15 * 0.72, 'ABC Bakery', Math.max(14, w * 0.11), 'var(--sim-bg-deep)');
  return s;
}

/** The recycle mark: three chasing arrows round a circle; centre (x, y), r. */
function recycle(x, y, r) {
  const col = 'var(--sim-good)';
  let s = `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.45)}" ${fill('var(--sim-bg-surface)', `stroke:${col};stroke-width:3`)}/>`;
  for (let i = 0; i < 3; i++) {
    const a0 = -Math.PI / 2 + i * 2 * Math.PI / 3 + 0.25, a1 = a0 + 2 * Math.PI / 3 - 0.6;
    const p0 = [x + Math.cos(a0) * r, y + Math.sin(a0) * r], p1 = [x + Math.cos(a1) * r, y + Math.sin(a1) * r];
    s += `<path d="M${f1(p0[0])} ${f1(p0[1])}A${f1(r)} ${f1(r)} 0 0 1 ${f1(p1[0])} ${f1(p1[1])}" ${stroke(col, r * 0.26)}/>`;
    const t = [-Math.sin(a1), Math.cos(a1)], n = [Math.cos(a1), Math.sin(a1)], L = r * 0.42, W = r * 0.3;
    const tip = [p1[0] + t[0] * L, p1[1] + t[1] * L];
    s += `<path d="M${f1(p1[0] + n[0] * W)} ${f1(p1[1] + n[1] * W)}L${f1(tip[0])} ${f1(tip[1])}L${f1(p1[0] - n[0] * W)} ${f1(p1[1] - n[1] * W)}Z" ${fill(col)}/>`;
  }
  return s;
}

/** A mango cake on a stand: (x, y) the foot of the stand, w the cake width. */
function mangoCake(x, y, w) {
  const h = w * 0.42, x0 = x - w / 2, base = y - w * 0.16, top = base - h, rim = shade(SPONGE, 60);
  let s = `<path d="M${f1(x - w * 0.12)} ${f1(y)}H${f1(x + w * 0.12)}L${f1(x + w * 0.05)} ${f1(base + 6)}H${f1(x - w * 0.05)}Z" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-linejoin:round')}/>`;
  s += `<ellipse cx="${f1(x)}" cy="${f1(base + 6)}" rx="${f1(w * 0.6)}" ry="${f1(w * 0.06)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>`;
  s += `<path d="M${f1(x0)} ${f1(top)}V${f1(base)}A${f1(w / 2)} ${f1(w * 0.1)} 0 0 0 ${f1(x0 + w)} ${f1(base)}V${f1(top)}Z" ${fill(SPONGE, `stroke:${rim};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x0)} ${f1(top + h * 0.5)}A${f1(w / 2)} ${f1(w * 0.1)} 0 0 0 ${f1(x0 + w)} ${f1(top + h * 0.5)}" ${stroke(MANGO, h * 0.12)}/>`;
  s += `<ellipse cx="${f1(x)}" cy="${f1(top)}" rx="${f1(w / 2)}" ry="${f1(w * 0.1)}" ${fill(CREAM, `stroke:${rim};stroke-width:2.5`)}/>`;
  // cream drips
  for (let i = 0; i < 6; i++) { const dx = x0 + w * (0.1 + i * 0.16), dh = h * (0.18 + (i % 3) * 0.08); s += `<path d="M${f1(dx - 8)} ${f1(top + w * 0.06)}v${f1(dh)}a8 8 0 0 0 16 0v${f1(-dh)}Z" ${fill(CREAM)}/>`; }
  // mango slices on top: crescents
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.15 + i * 0.175), sx = x - Math.cos(a) * w * 0.32, sy = top - 2 + Math.sin(a) * w * 0.02 - w * 0.02;
    s += `<path d="M${f1(sx - w * 0.07)} ${f1(sy)}Q${f1(sx)} ${f1(sy - w * 0.1)} ${f1(sx + w * 0.07)} ${f1(sy)}Q${f1(sx)} ${f1(sy - w * 0.04)} ${f1(sx - w * 0.07)} ${f1(sy)}Z" ${fill(MANGO, `stroke:${shade(MANGO, 62)};stroke-width:2;stroke-linejoin:round`)}/>`;
  }
  s += `<path d="M${f1(x + w * 0.02)} ${f1(top - w * 0.06)}q${f1(w * 0.03)} ${f1(-w * 0.07)} ${f1(w * 0.09)} ${f1(-w * 0.06)}q${f1(-w * 0.03)} ${f1(w * 0.06)} ${f1(-w * 0.09)} ${f1(w * 0.06)}Z" ${fill('var(--sim-good)')}/>`;
  return s;
}

export class BakeryMarketingScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Marketing and sales at ABC Bakery. A catchy shop name, a social media post on a phone and a discount coupon bring a parent and a child to the shop, every week. Then five simple ways, one at a time: a mango cake made to order; a special offer; ordering online with delivery by bicycle; photos and videos shared online; and a cake box that can be recycled.';

  async setup() {
    this.which = 0;
    this.still = false;
    this.run = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-which],[data-act]');
      if (!b) return;
      if (b.dataset.act === 'skip') { this.finish(); return; }
      if (b.dataset.act === 'replay') { this.restart(); return; }
      if (this.stepIndex !== 1) return;
      const w = +b.dataset.which;
      if (w === this.which) return;
      this.which = w;
      this.restart();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.which = 0; this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    if (this._timers) this.after(DUR[this.stepIndex] ?? 2, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintWays(P) : this.paintPromo(P);
    const still = this.still ? ' mm-still' : '';
    const pos = this.stepIndex === 1 || P ? 'right:8px;top:8px' : 'right:8px;bottom:8px';
    const btn = `<button type="button" class="sv-hit tap btn mm-skip" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: name, social media and discounts bring customers to the bakery.
  paintPromo(P) {
    const G = P
      ? { bk: [195, 520, 210], name: [195, 282], ph: [70, 150, 76], phl: [86, 236], cu: [316, 140, 124], cul: [316, 236], door: [258, 440],
        par: [52, 590, 156], kid: [346, 590, 104], week: [180, 40] }
      : { bk: [280, 410, 230], name: [280, 150], ph: [84, 168, 76], phl: [84, 60], cu: [476, 150, 150], cul: [476, 60], door: [346, 330],
        par: [70, 462, 172], kid: [430, 462, 118], week: [280, 448] };
    const [bx, by, bw] = G.bk, top = by - bw * 0.9, fs = Math.max(20, bw * 0.085), sh = fs * 1.8, sy = top - sh * 0.3;
    let svg = bakery(bx, by, bw);
    // the sign ringed: the catchy name
    svg += `<g class="mm-fade" style="--d:0.2s"><rect x="${f1(bx - bw * 0.58)}" y="${f1(sy - 7)}" width="${f1(bw * 1.16)}" height="${f1(sh + 14)}" rx="14" ${fill('none', 'stroke:var(--sim-accent);stroke-width:4')}/></g>`;
    svg += `<g class="mk-pop" style="--d:0.6s">${phone(G.ph[0], G.ph[1], G.ph[2])}</g>`;
    svg += `<g class="mk-pop" style="--d:1.0s">${coupon(G.cu[0], G.cu[1], G.cu[2])}</g>`;
    const [dx, dy] = G.door;
    if (P) {
      svg += arrow(G.phl[0] - 30, G.phl[1] + 22, bx - bw * 0.5, by - bw * 0.45, 1.4);
      svg += arrow(G.cul[0] - 10, G.cul[1] + 22, dx + 20, dy - 50, 1.5);
    } else {
      svg += arrow(G.ph[0] + G.ph[2] * 0.6, G.ph[1] + G.ph[2] * 0.5, bx - bw * 0.56, by - bw * 0.42, 1.4);
      svg += arrow(G.cu[0] - G.cu[2] * 0.2, G.cu[1] + G.cu[2] * 0.42, dx + bw * 0.12, dy - 10, 1.5);
    }
    let over = chip('a catchy name', G.name[0], G.name[1], 0.3, 'acc');
    over += chip('social media', G.phl[0], G.phl[1], 0.7);
    over += chip('discounts', G.cul[0], G.cul[1], 1.1);
    over += personSlot('parent', { x: G.par[0], y: G.par[1], h: G.par[2], facing: 1, mood: 'smile', cls: 'mm-walk', style: '--wx:-70px;--d:1.6s;' });
    over += personSlot('child', { x: G.kid[0], y: G.kid[1], h: G.kid[2], facing: -1, mood: 'happy', cls: 'mm-walk', style: '--wx:70px;--d:1.8s;' });
    over += chip(`${iconHtml('calendar', 4)}every week`, G.week[0], G.week[1] + (P ? 0 : 0), 2.1);
    return { svg, over };
  }

  // b1: the five ways, one picture each.
  paintWays(P) {
    // the picture lives in a 300 x 300 box
    const T = P ? { x: 45, y: 40, s: 1 } : { x: 236, y: 52, s: 1.04 };
    const at = (bx, by) => [T.x + bx * T.s, T.y + by * T.s];
    const pic = this.picture(this.which);
    let svg = `<g transform="translate(${T.x} ${T.y}) scale(${T.s})">${pic.svg}</g>`;
    let over = '';
    const [cx, cy] = at(...pic.cap);
    over += chip(WAYS[this.which].cap, cx, cy, pic.capD ?? 0.6, 'acc big');
    const pos = P
      ? [[100, 402], [290, 402], [100, 468], [290, 468], [195, 534]]
      : [[118, 52], [118, 130], [118, 208], [118, 286], [118, 364]];
    const bw = P ? 180 : 200;
    WAYS.forEach((w, i) => {
      const [x, y] = pos[i];
      over += `<button type="button" class="sv-hit tap btn mm-ab mm-btn${this.which === i ? ' on' : ''}" data-which="${i}" aria-pressed="${this.which === i}" style="left:${x}px;top:${y}px;width:${bw}px">${w.btn}</button>`;
    });
    if (!P) svg += `<path d="M232 30V400" ${stroke('var(--sim-stroke)', 2)} style="stroke-dasharray:3 8;stroke-linecap:round"/>`;
    return { svg, over };
  }

  picture(i) {
    if (i === 0) {
      return { svg: `<g class="mk-pop" style="--d:0.1s">${mangoCake(150, 250, 230)}</g>`, cap: [150, 40] };
    }
    if (i === 1) {
      let s = `<g class="mk-pop" style="--d:0.4s">${breadLoaf(62, 280, 96)}${breadLoaf(150, 280, 84)}${cakeJar(232, 280, 70)}</g>`;
      s += `<g class="mk-pop" style="--d:0.1s">${coupon(150, 124, 210)}</g>`;
      s += `<path d="M10 284H290" ${stroke('var(--sim-label-muted)', 3)}/>`;
      return { svg: s, cap: [150, 20], capD: 0.7 };
    }
    if (i === 2) {
      let s = `<g class="mk-pop" style="--d:0.1s">${phone(48, 120, 76, 'order')}</g>`;
      s += iconAt('house', 252, 220, 92, 5);
      s += `<path d="M10 268H296" ${stroke('var(--sim-label-muted)', 3)} style="stroke-dasharray:10 8"/>`;
      s += `<g class="mm-ride" style="--d:0.5s;--fx:-130px">${bicycle(150, 268, 150, { col: 'var(--sim-series-1)' })}`
        + `<g transform="translate(0 0)">${rect(90, 194, 58, 42, 6, BOX, `stroke:${shade(BOX, 62)};stroke-width:2.5`)}${rect(90, 206, 58, 9, 0, 'var(--sim-series-8)')}</g></g>`;
      s += arrow(90, 150, 220, 168, 0.3);
      return { svg: s, cap: [190, 40], capD: 1.2 };
    }
    if (i === 3) {
      let s = `<g class="mk-pop" style="--d:0.1s">${phone(150, 150, 140)}</g>`;
      // a play mark over the post
      s += `<g class="mk-pop" style="--d:0.5s"><circle cx="150" cy="118" r="26" ${fill('color-mix(in oklab, var(--sim-label) 70%, transparent)')}/><path d="M141 104L166 118L141 132Z" ${fill('var(--sim-bg-surface)')}/></g>`;
      [[248, 90, 14, 0.8], [262, 150, 10, 1.0], [42, 120, 12, 1.1], [236, 210, 9, 1.2]].forEach(([x, y, r, d]) => { s += `<g class="mk-pop" style="--d:${d}s">${heart(x, y, r)}</g>`; });
      return { svg: s, cap: [150, 296], capD: 0.9 };
    }
    let s = `<g class="mk-pop" style="--d:0.1s">${cakeBox(130, 260, 190)}</g>`;
    s += `<g class="mk-pop" style="--d:0.6s">${recycle(246, 110, 30)}</g>`;
    return { svg: s, cap: [150, 296], capD: 0.9 };
  }

  testState() { return { view: this.stepIndex, way: this.stepIndex === 1 ? WAYS[this.which].btn : null, still: this.still }; }
}
