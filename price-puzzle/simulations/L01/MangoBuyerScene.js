/**
 * MangoBuyerScene - L01 s02 (predict, setup mount) and s03 "Lower price, more mangoes" (3 beats). SvgScene, drawn
 * in design units (560 wide landscape, 390 wide portrait) and scaled to the stage width. Cast: shared/MangoKit.js.
 *   setup (the predict): Srivalli, the scale with her basket at 1 kg, the price board Rs 150 (landscape: on a
 *          stall). Below: three slots, Rs 150 -> 1 kg, Rs 100 -> ?, Rs 50 -> ?. Nothing to tap, no arrows, no hint.
 *   b0 what she did: the same picture; the three slots are buttons. On entry the scene walks Rs 150, Rs 100, Rs 50
 *          (her basket fills 1 -> 2 -> 3 kg, 0.5 s a kg); each slot shows its kg as it is visited. Rest: Rs 50, 3 kg,
 *          all three answers. Tap a slot: the board and the basket change to it.
 *   b1 the law: a price board on a vertical track (Rs 150 high, Rs 50 low) beside the scale. "price rises": the
 *          board climbs 50 -> 100 -> 150 while the basket empties 3 -> 2 -> 1 kg (0.7 s a step); a big up arrow
 *          by the price, a big down arrow by the basket; "opposite directions". "price falls" plays the reverse.
 *          Rest: price rises (Rs 150, 1 kg), the bold line of the slide.
 *   b2 why: three columns, Rs 150 / Rs 100 / Rs 50, each with its basket (1 / 2 / 3 kg) and a bar for the money
 *          one kg takes (the price itself). Bars grow in turn, then "each kg takes less of her money". Tap a basket
 *          to light its column. No money amounts are invented: the bars are the three prices.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MANGO_CSS, heap, basket, pan, priceBoard, purse } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag } from '../shared/MangoPeople.js';

const f1 = (v) => (+v).toFixed(1);
const PRICES = [150, 100, 50];
const KG = [1, 2, 3];
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const STEP_S = 0.7;

const CSS = `
.mb-ab { position: absolute; transform: translate(-50%, -50%); }
.mb-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mb-btn--on { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.mb-btn:active { transform: translateY(3px); box-shadow: none; }
.mb-btn:focus-visible, .mb-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.mb-hit { position: absolute; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 14px; }
.mb-hit:hover { background: color-mix(in oklab, var(--sim-accent) 10%, transparent); }
svg .mb-slide { animation: mb-slide 0.6s cubic-bezier(.4,0,.3,1) both; }
@keyframes mb-slide { 0% { transform: translateY(var(--dy, 0px)); } 100% { transform: none; } }
svg .mb-pop { transform-box: fill-box; transform-origin: center; animation: mb-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes mb-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .mb-grow { transform-box: fill-box; transform-origin: left center; animation: mb-grow 0.55s ease-out both; animation-delay: var(--d, 0s); }
@keyframes mb-grow { 0% { transform: scaleX(0); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .mb-slide, svg .mb-pop, svg .mb-grow { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

/** A big block arrow, up (dir -1) or down (dir 1), centred on x between y1 (top) and y2 (bottom). */
function bigArrow(x, y1, y2, dir, col, w = 30) {
  const head = w * 1.15, hw = w * 1.05;
  const tip = dir < 0 ? y1 : y2, base = dir < 0 ? y2 : y1, neck = tip - dir * head;
  const d = `M${f1(x - w / 2)} ${f1(base)}L${f1(x - w / 2)} ${f1(neck)}L${f1(x - hw)} ${f1(neck)}L${f1(x)} ${f1(tip)}L${f1(x + hw)} ${f1(neck)}L${f1(x + w / 2)} ${f1(neck)}L${f1(x + w / 2)} ${f1(base)}Z`;
  return `<path d="${d}" transform="translate(0 4)" ${fill(shade(col, 70))}/><path d="${d}" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2.5;stroke-linejoin:round`)}/>`;
}

const stallArt = (cx, gy, w) => civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');

export class MangoBuyerScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN, [Number.MAX_SAFE_INTEGER]: [[{ idx: 3, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'Srivalli buys mangoes. At 150 rupees a kg her basket on the scale holds 1 kg; at 100 rupees, 2 kg; at 50 rupees, 3 kg. When the price rises the quantity she buys falls, and when the price falls it rises: they move in opposite directions. At a lower price each kg takes less of her money.';

  async setup() {
    this.sel = 2;
    this.visited = new Set([0, 1, 2]);
    this.fromKg = null;
    this.mode = 'rise';
    this.pos = 2;
    this.prevPos = 2;
    this.bars = 3;
    this.lit = -1;
    this.line = true;
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  /** The view this mount shows: a setup mount never leaves the predict picture. */
  get view() { return this.hostRole === 'setup' ? 3 : this.stepIndex; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; }

  enter(step) {
    this.clear();
    this.fromKg = null;
    this.lit = -1;
    const v = this.hostRole === 'setup' ? 3 : step;
    if (v === 3) { this.sel = 0; this.visited = new Set([0]); }
    else if (v === 0) this.tour();
    else if (v === 1) this.play1('rise');
    else if (v === 2) this.grow();
  }

  // b0: walk 150 -> 100 -> 50.
  tour() {
    this.sel = 0;
    this.visited = new Set([0]);
    this.anim = true;
    [1, 2].forEach((i, n) => this.after(0.6 + n * 1.0, () => this.pick(i)));
    this.after(0.6 + 1.0 + 1.0, () => { this.anim = false; this.repaint(); });
  }

  pick(i) {
    const was = KG[this.sel];
    this.sel = i;
    this.visited.add(i);
    this.fromKg = KG[i] > was ? was : null;
    this.repaint();
    this.fromKg = null;
  }

  // b1: the price moves one way, the kg the other. pos indexes PRICES (0 = 150 high, 2 = 50 low).
  play1(mode) {
    this.clear();
    this.mode = mode;
    const seq = mode === 'rise' ? [2, 1, 0] : [0, 1, 2];
    this.pos = seq[0];
    this.prevPos = seq[0];
    this.anim = true;
    this.arrowPop = true;
    [1, 2].forEach((n) => this.after(0.5 + (n - 1) * STEP_S, () => { this.prevPos = this.pos; this.pos = seq[n]; this.slide = true; this.repaint(); this.slide = false; }));
    this.after(0.5 + 2 * STEP_S, () => { this.anim = false; this.repaint(); });
  }

  // b2: bars grow in turn, then the line.
  grow() {
    this.bars = 0;
    this.line = false;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.4 + i * 0.6, () => { this.bars = i + 1; this.barPop = i; this.repaint(); this.barPop = -1; }));
    this.after(0.4 + 3 * 0.6, () => { this.line = true; this.anim = false; this.linePop = true; this.repaint(); this.linePop = false; });
  }

  act(a, v) {
    const s = this.view, i = Number(v);
    if (s === 0 && a === 'price') { this.clear(); this.pick(i); }
    else if (s === 1 && a === 'mode') { this.play1(v); this.repaint(); this.arrowPop = false; }
    else if (s === 2 && a === 'basket') { this.clear(); this.bars = 3; this.line = true; this.lit = i; this.linePop = true; this.repaint(); this.linePop = false; }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    const s = this.view;
    if (s === 0) { this.sel = 2; this.visited = new Set([0, 1, 2]); }
    if (s === 1) { this.pos = this.mode === 'rise' ? 0 : 2; this.prevPos = this.pos; }
    if (s === 2) { this.bars = 3; this.line = true; }
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.view;
    const out = v === 1 ? this.paintLaw(P) : v === 2 ? this.paintWhy(P) : this.paintBuy(P, v === 3);
    this.arrowPop = false;
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // setup and b0: Srivalli, the scale, the board; the three price slots below.
  paintBuy(P, setup) {
    let svg = '', over = '';
    const price = PRICES[this.sel], kg = KG[this.sel];
    const G = P
      ? { her: [74, 324, 164], scale: [262, 324, 188], board: [195, 54, 176], slots: [70, 195, 320], sy: 398, ky: 456, sw: 112, hint: 528 }
      : { her: [72, 300, 188], scale: [236, 300, 180], board: [446, 50, 168], slots: [100, 280, 460], sy: 372, ky: 428, sw: 128, hint: 466, stall: [448, 300, 216] };
    if (G.stall) {
      const [cx, gy, w] = G.stall;
      svg += `<path d="M${cx - 44} ${G.board[1] + 30}V${gy - w * 0.78}M${cx + 44} ${G.board[1] + 30}V${gy - w * 0.78}" ${stroke('var(--sim-stroke)', 3)}/>`;
      svg += stallArt(cx, gy, w) + heap(cx, gy - 84 * (w / 230), 3, { r: 10 });
    }
    svg += priceBoard(G.board[0], G.board[1], price, { w: G.board[2], h: 72, active: !setup });
    // Srivalli, facing the scale; setup: thinking (no hint of the answer), b0: smiling at what she got.
    over += personSlot('srivalli', { x: G.her[0], y: G.her[1], h: G.her[2], pose: 'stand', facing: 1, mood: setup ? 'think' : 'smile' });
    svg += nameTag(G.her[0], G.her[1] + 4, 'srivalli', 17);
    svg += pan(G.scale[0], G.scale[1], kg, { w: G.scale[2], fromKg: this.fromKg, per: 0.5 });
    PRICES.forEach((p, i) => {
      const x = G.slots[i], on = i === this.sel && !setup, seen = this.visited.has(i);
      svg += priceBoard(x, G.sy, p, { w: G.sw, h: 50, active: on, dim: setup && i > 0 ? false : (!setup && !seen) });
      const kx = x, ky = G.ky, known = seen;
      svg += `<path d="M${kx} ${G.sy + 30}V${ky - 22}" ${stroke('var(--sim-stroke)', 3)}/>`;
      const pop = !setup && i === this.sel && this.anim ? ' class="mb-pop" style="--d:0.3s"' : '';
      svg += `<g${known ? pop : ''}><rect x="${kx - 46}" y="${ky - 20}" width="92" height="40" rx="20" ${fill(known ? 'var(--sim-good)' : 'var(--sim-bg-surface)', `stroke:${known ? 'var(--sim-good)' : 'var(--sim-stroke)'};stroke-width:2.5${known ? '' : ';stroke-dasharray:6 5'}`)}/>`
        + text(kx, ky + 8, known ? `${KG[i]} kg` : '?', 22, known ? 'var(--sim-bg-deep)' : 'var(--sim-accent)') + '</g>';
      if (!setup) over += `<button type="button" class="sv-hit mb-hit" data-act="price" data-val="${i}" aria-label="${p} rupees a kg" style="left:${x - G.sw / 2 - 4}px;top:${G.sy - 30}px;width:${G.sw + 8}px;height:${ky - G.sy + 54}px"></button>`;
    });
    if (!setup && !this.anim) svg += text(P ? 195 : 280, G.hint, 'tap a price', 19, 'var(--sim-label-muted)');
    return { svg, over };
  }

  // b1: the price on a track, the basket on the scale, two opposite arrows.
  paintLaw(P) {
    let svg = '', over = '';
    const G = P
      ? { tx: 128, ys: [104, 214, 324], bw: 122, bh: 54, aP: 30, sx: 272, sg: 382, sw: 152, aQ: 366, ay: [80, 360], lab: 40, opp: 452, btn: [100, 290], by: 520 }
      : { tx: 170, ys: [96, 196, 296], bw: 164, bh: 66, aP: 50, sx: 390, sg: 340, sw: 176, aQ: 520, ay: [70, 330], lab: 34, opp: 392, btn: [180, 380], by: 446 };
    const rise = this.mode === 'rise';
    svg += text(G.tx, G.lab, 'price', 24, 'var(--sim-label-muted)') + text(G.sx, G.lab, 'quantity', 24, 'var(--sim-label-muted)');
    // the track: three level marks
    svg += `<path d="M${G.tx} ${G.ys[0]}V${G.ys[2]}" ${stroke('color-mix(in oklab, var(--sim-stroke) 70%, transparent)', 4, 'stroke-dasharray:2 10')}/>`;
    G.ys.forEach((y) => { svg += `<circle cx="${G.tx}" cy="${y}" r="6" ${fill('var(--sim-stroke)')}/>`; });
    const y = G.ys[this.pos], dy = G.ys[this.prevPos] - y;
    svg += `<g${this.slide ? ` class="mb-slide" style="--dy:${f1(dy)}px"` : ''}>${priceBoard(G.tx, y, PRICES[this.pos], { w: G.bw, h: G.bh, active: true })}</g>`;
    svg += pan(G.sx, G.sg, KG[this.pos], { w: G.sw, fromKg: this.slide && KG[this.pos] > KG[this.prevPos] ? KG[this.prevPos] : null, per: 0.3 });
    const pc = 'var(--sim-series-5)', qc = 'var(--sim-series-2)', pop = this.arrowPop ? ' class="mb-pop"' : '';
    svg += `<g${pop}>${bigArrow(G.aP, G.ay[0], G.ay[1], rise ? -1 : 1, pc, P ? 24 : 30)}</g>`;
    svg += `<g${pop}>${bigArrow(G.aQ, G.ay[0], G.ay[1], rise ? 1 : -1, qc, P ? 24 : 30)}</g>`;
    svg += text(P ? 195 : 280, G.opp, 'opposite directions', P ? 26 : 28, 'var(--sim-label)');
    over += `<div class="mb-ab" style="left:${G.btn[0]}px;top:${G.by}px"><button type="button" class="sv-hit mb-btn${rise ? ' mb-btn--on' : ''}" data-act="mode" data-val="rise">price rises</button></div>`;
    over += `<div class="mb-ab" style="left:${G.btn[1]}px;top:${G.by}px"><button type="button" class="sv-hit mb-btn${rise ? '' : ' mb-btn--on'}" data-act="mode" data-val="fall">price falls</button></div>`;
    return { svg, over };
  }

  // b2: three prices, three baskets, the money one kg takes.
  paintWhy(P) {
    let svg = '', over = '';
    const G = P
      ? { xs: [68, 195, 322], bY: 46, bw: 118, bh: 48, kY: 214, kw: 98, tagY: 248, barL: 10, barY: 330, barMax: 116, lab: 296, line: [440, 476], purse: [30, 312] }
      : { xs: [100, 280, 460], bY: 48, bw: 140, bh: 58, kY: 222, kw: 120, tagY: 256, barL: 0, barY: 330, barMax: 150, lab: 296, line: [404, 440], purse: [36, 312] };
    PRICES.forEach((p, i) => {
      const x = G.xs[i], dim = this.lit >= 0 && this.lit !== i;
      const g = (s) => `<g${dim ? ' opacity="0.4"' : ''}>${s}</g>`;
      let col = priceBoard(x, G.bY, p, { w: G.bw, h: G.bh, active: this.lit === i });
      col += basket(x, G.kY, KG[i], { w: G.kw });
      col += `<rect x="${x - 34}" y="${G.tagY - 16}" width="68" height="32" rx="16" ${fill('var(--sim-good)')}/>` + text(x, G.tagY + 7, `${KG[i]} kg`, 20, 'var(--sim-bg-deep)');
      if (this.bars > i) {
        const bw = G.barMax * p / 150, bx = x - G.barMax / 2, cls = this.barPop === i ? ' class="mb-grow"' : '';
        col += `<g${cls}><rect x="${f1(bx)}" y="${G.barY - 18}" width="${f1(bw)}" height="36" rx="10" ${fill('color-mix(in oklab, var(--sim-series-5) 70%, var(--sim-label))')}/></g>`;
      } else {
        col += `<rect x="${f1(x - G.barMax / 2)}" y="${G.barY - 18}" width="${G.barMax}" height="36" rx="10" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2;stroke-dasharray:6 5')}/>`;
      }
      svg += g(col);
      over += `<button type="button" class="sv-hit mb-hit" data-act="basket" data-val="${i}" aria-label="basket at ${p} rupees a kg" style="left:${x - G.bw / 2}px;top:${G.kY - G.kw * 0.8}px;width:${G.bw}px;height:${G.kw * 0.8 + 30}px"></button>`;
    });
    svg += purse(G.purse[0], G.purse[1] - 2, { w: 34 }) + text(G.purse[0] + 26, G.lab + 3, 'her money for 1 kg', P ? 18 : 19, 'var(--sim-label-muted)', 'start');
    if (this.line) {
      const pop = this.linePop ? ' class="mb-pop"' : '';
      svg += `<g${pop}>${text(P ? 195 : 280, G.line[0], 'each kg takes less', P ? 25 : 27, 'var(--sim-label)')}${text(P ? 195 : 280, G.line[1], 'of her money', P ? 25 : 27, 'var(--sim-label)')}</g>`;
    }
    if (!this.anim) svg += text(P ? 195 : 280, P ? 540 : 470, 'tap a basket', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  testState() {
    return { view: this.view, price: PRICES[this.view === 1 ? this.pos : this.sel], kg: KG[this.view === 1 ? this.pos : this.sel], mode: this.mode, visited: [...this.visited].sort(), bars: this.bars, line: this.line };
  }
}
