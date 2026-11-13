/**
 * DemandCurveScene - L01 s04 "From a table to a curve" (3 beats). SvgScene, drawn in design units (560 wide
 * landscape, 390 wide portrait) and scaled to the stage width. Cast: shared/MangoKit.js. Table 9.1 (Srivalli):
 * Rs 150 -> 1 kg, Rs 100 -> 2 kg, Rs 50 -> 3 kg. Price UP the y-axis (Rs per kg), quantity ALONG the x-axis (kg).
 *   b0 a demand schedule: a big three-row table with its header, a basket of 1 / 2 / 3 kg per row. The rows pop in
 *      turn; tap a row to light it. No graph yet.
 *   b1 three points: the table shrinks to the side (portrait: a row of three cards above); the empty axes are the
 *      hero. Each row flies to its point in turn (0.6 s): A (1 kg, Rs 150), B (2 kg, Rs 100), C (3 kg, Rs 50), each
 *      with thin dashed guides to both axes. Rest: three lettered points, not joined. Tap a row or a point to light
 *      both. "again" replays the flights.
 *   b2 the demand curve: A, B and C joined into one straight line that slopes down, D at its top left end and D'
 *      at its bottom right end. A marker slides A -> B -> C along the line (0.7 s a step) while the price board and
 *      the basket beside the graph change with it. "price changes: move along the curve". The line never moves.
 *      Rest: the marker at C. "play" replays; tapping A, B or C moves the marker there.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, basket, priceBoard, RS } from '../shared/MangoKit.js';

const f1 = (v) => (+v).toFixed(1);
const PRICES = [150, 100, 50];
const KG = [1, 2, 3];
const NAMES = ['A', 'B', 'C'];
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const FLY_S = 0.6;
const MOVE_S = 0.7;
const SER = 'var(--sim-series-1)';

const CSS = `
.dc-ab { position: absolute; transform: translate(-50%, -50%); }
.dc-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.dc-btn:active { transform: translateY(3px); box-shadow: none; }
.dc-btn:focus-visible, .dc-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.dc-hit { position: absolute; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 14px; }
.dc-hit:hover { background: color-mix(in oklab, var(--sim-accent) 10%, transparent); }
svg .dc-pop { transform-box: fill-box; transform-origin: center; animation: dc-pop 0.4s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes dc-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .dc-fly { animation: dc-fly 0.6s cubic-bezier(.45,0,.3,1) both; }
@keyframes dc-fly { 0% { transform: translate(var(--dx, 0px), var(--dy, 0px)); } 100% { transform: none; } }
svg .dc-fade { animation: dc-fade 0.35s ease-out both; animation-delay: var(--d, 0s); }
@keyframes dc-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .dc-slide { animation: dc-slide 0.7s cubic-bezier(.45,0,.3,1) both; }
@keyframes dc-slide { 0% { transform: translate(var(--dx, 0px), var(--dy, 0px)); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .dc-pop, svg .dc-fly, svg .dc-fade, svg .dc-slide { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** A graph frame: plot box L..R, T..B; x 0..xMax kg, y 0..yMax rupees. */
function frame(L, R, T, B, xMax = 4, yMax = 200) {
  return { L, R, T, B, X: (q) => L + (q / xMax) * (R - L), Y: (p) => B - (p / yMax) * (B - T), xMax, yMax };
}

/** Graph paper, the two axes, ticks Rs 50 / 100 / 150 and 1 / 2 / 3 kg, and the two big axis titles. */
function axes(g, o = {}) {
  const lab = o.dim ? 'var(--sim-label-muted)' : 'var(--sim-label)';
  let s = `<rect x="${g.L}" y="${g.T}" width="${g.R - g.L}" height="${g.B - g.T}" ${fill('var(--sim-bg-surface)')}/>`;
  for (let q = 1; q <= g.xMax; q++) s += `<path d="M${f1(g.X(q))} ${g.T}V${g.B}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.45')}/>`;
  for (let p = 50; p <= g.yMax; p += 50) s += `<path d="M${g.L} ${f1(g.Y(p))}H${g.R}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.45')}/>`;
  for (const p of PRICES) s += text(g.L - 10, g.Y(p) + 7, `${RS}${p}`, o.tick ?? 20, 'var(--sim-label-muted)', 'end');
  for (const q of KG) s += text(g.X(q), g.B + 28, String(q), o.tick ?? 20, 'var(--sim-label-muted)');
  s += `<path d="M${g.L} ${g.T - 8}V${g.B}H${g.R + 8}" ${stroke(lab, 3.5, 'stroke-linecap:round;stroke-linejoin:round')}/>`;
  s += `<text transform="translate(${f1(o.yTitleX ?? g.L - 76)} ${f1((g.T + g.B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:${lab};font:800 ${o.title ?? 22}px var(--sim-font)">price (${RS} per kg)</text>`;
  s += text((g.L + g.R) / 2, g.B + 62, 'quantity (kg)', o.title ?? 22, lab);
  return s;
}

/** A plotted point with its letter; lit adds a ring. */
function dot(x, y, name, o = {}) {
  const r = o.r ?? 11;
  let s = o.lit ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r + 8}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3.5')}/>` : '';
  s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" ${fill(SER, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
  if (name) s += text(x + (o.ldx ?? 16), y + (o.ldy ?? -14), name, o.size ?? 28, 'var(--sim-label)', 'start');
  return s;
}

/** Thin dashed guides from (q, p) to both axes. */
function guides(g, q, p, lit) {
  const col = lit ? 'var(--sim-accent)' : 'var(--sim-label-muted)';
  return `<path d="M${g.L} ${f1(g.Y(p))}H${f1(g.X(q))}V${g.B}" ${stroke(col, lit ? 2.5 : 2, 'stroke-dasharray:6 6')}/>`;
}

export class DemandCurveScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Srivalli\'s demand schedule: at 150 rupees a kg she buys 1 kg, at 100 rupees 2 kg, at 50 rupees 3 kg. On a graph with price up the side and quantity along the bottom, the rows become points A (1 kg, 150 rupees), B (2 kg, 100 rupees) and C (3 kg, 50 rupees). Joined, they make a line that slopes down from left to right: her demand curve DD\'. When only the price changes, she moves along the curve.';

  async setup() {
    this.lit = -1;
    this.rowsIn = 3;
    this.shown = 3;
    this.at = 2;
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

  css() { return MANGO_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.pop = -1; this.fly = -1; this.move = null; }

  enter(step) {
    this.clear();
    this.lit = -1;
    if (step === 0) this.rows();
    else if (step === 1) this.flights();
    else if (step === 2) this.walk();
  }

  // b0: the rows pop in turn.
  rows() {
    this.rowsIn = 0;
    this.anim = true;
    KG.forEach((_, i) => this.after(0.25 + i * 0.45, () => { this.rowsIn = i + 1; this.pop = i; this.repaint(); this.pop = -1; }));
    this.after(0.25 + 3 * 0.45, () => { this.anim = false; this.repaint(); });
  }

  // b1: each row flies to its point.
  flights() {
    this.shown = 0;
    this.anim = true;
    KG.forEach((_, i) => this.after(0.4 + i * (FLY_S + 0.25), () => { this.shown = i + 1; this.fly = i; this.repaint(); this.fly = -1; }));
    this.after(0.4 + 3 * (FLY_S + 0.25), () => { this.anim = false; this.repaint(); });
  }

  // b2: the marker walks A -> B -> C.
  walk() {
    this.at = 0;
    this.anim = true;
    [1, 2].forEach((i, n) => this.after(0.9 + n * (MOVE_S + 0.35), () => this.moveTo(i)));
    this.after(0.9 + 2 * (MOVE_S + 0.35), () => { this.anim = false; this.repaint(); });
  }

  moveTo(i) {
    this.move = { from: this.at };
    this.at = i;
    this.repaint();
    this.move = null;
  }

  act(a, v) {
    const s = this.stepIndex, i = Number(v);
    if (a === 'row' && (s === 0 || s === 1)) {
      if (this.anim) this.skip();
      this.lit = this.lit === i ? -1 : i;
      this.repaint();
    } else if (a === 'again' && s === 1) { this.clear(); this.lit = -1; this.flights(); this.repaint(); }
    else if (a === 'play' && s === 2) { this.clear(); this.walk(); this.repaint(); }
    else if (a === 'pt' && s === 2) { this.clear(); if (i !== this.at) this.moveTo(i); else this.repaint(); }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    const s = this.stepIndex;
    if (s === 0) this.rowsIn = 3;
    if (s === 1) this.shown = 3;
    if (s === 2) this.at = 2;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintCurve(P) : v === 1 ? this.paintPoints(P) : this.paintTable(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the table is the hero.
  paintTable(P) {
    let svg = '', over = '';
    const G = P
      ? { cx: 195, head: 46, colY: 104, x0: 14, x1: 376, ys: [170, 280, 390], rh: 96, px: 92, kx: 212, bx: 318, bw: 84, hint: 486 }
      : { cx: 280, head: 44, colY: 98, x0: 30, x1: 530, ys: [160, 256, 352], rh: 86, px: 134, kx: 296, bx: 440, bw: 96, hint: 444 };
    svg += text(G.cx, G.head, 'Srivalli\'s demand schedule', P ? 25 : 28);
    svg += text(G.px, G.colY, 'price per kg', P ? 19 : 20, 'var(--sim-label-muted)');
    svg += text(G.kx, G.colY, 'she buys', P ? 19 : 20, 'var(--sim-label-muted)');
    svg += `<path d="M${G.x0} ${G.colY + 14}H${G.x1}" ${stroke('var(--sim-stroke)', 2.5)}/>`;
    KG.forEach((kg, i) => {
      if (i >= this.rowsIn) return;
      const y = G.ys[i], on = this.lit === i, dim = this.lit >= 0 && !on;
      const pop = this.pop === i ? ' class="dc-pop"' : '';
      let row = `<rect x="${G.x0}" y="${y - G.rh / 2}" width="${G.x1 - G.x0}" height="${G.rh - 10}" rx="16" ${fill(on ? 'color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 3.5 : 2}`)}/>`;
      row += text(G.px, y + 9, `${RS}${PRICES[i]}`, P ? 36 : 40);
      row += text(G.kx, y + 9, `${kg} kg`, P ? 36 : 40, SER);
      row += basket(G.bx, y + G.rh / 2 - 18, kg, { w: G.bw });
      svg += `<g${pop}${dim ? ' opacity="0.45"' : ''}>${row}</g>`;
      over += `<button type="button" class="sv-hit dc-hit" data-act="row" data-val="${i}" aria-label="${PRICES[i]} rupees a kg: ${kg} kg" aria-pressed="${on ? 'true' : 'false'}" style="left:${G.x0}px;top:${y - G.rh / 2}px;width:${G.x1 - G.x0}px;height:${G.rh - 10}px"></button>`;
    });
    if (!this.anim) svg += text(G.cx, G.hint, 'tap a row', 19, 'var(--sim-label-muted)');
    return { svg, over };
  }

  /** The small table of b1: landscape a column at the left, portrait a row of three cards on top. */
  miniTable(P) {
    let svg = '', over = '';
    KG.forEach((kg, i) => {
      const [x, y] = P ? [70 + i * 125, 52] : [64, 140 + i * 96];
      const w = P ? 112 : 112, h = P ? 76 : 80, on = this.lit === i;
      svg += `<g${this.lit >= 0 && !on ? ' opacity="0.45"' : ''}><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="14" ${fill(on ? 'color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 3.5 : 2}`)}/>`
        + text(x, y - 6, `${RS}${PRICES[i]}`, 24) + text(x, y + 26, `${kg} kg`, 24, SER) + '</g>';
      over += `<button type="button" class="sv-hit dc-hit" data-act="row" data-val="${i}" aria-label="row ${NAMES[i]}: ${PRICES[i]} rupees, ${kg} kg" aria-pressed="${on ? 'true' : 'false'}" style="left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px"></button>`;
    });
    if (!P) svg += text(64, 74, 'her table', 19, 'var(--sim-label-muted)');
    return { svg, over };
  }

  // b1: rows fly to points A, B, C.
  paintPoints(P) {
    const g = P ? frame(118, 366, 124, 436) : frame(250, 536, 34, 374);
    const t = this.miniTable(P);
    let svg = t.svg + axes(g, { yTitleX: P ? 26 : 160 }), over = t.over;
    KG.forEach((kg, i) => {
      if (i >= this.shown) return;
      const x = g.X(kg), y = g.Y(PRICES[i]), on = this.lit === i;
      const [sx, sy] = P ? [70 + i * 125, 52] : [64, 140 + i * 96];
      const fly = this.fly === i ? ` class="dc-fly" style="--dx:${f1(sx - x)}px;--dy:${f1(sy - y)}px"` : '';
      const fade = this.fly === i ? ' class="dc-fade" style="--d:0.55s"' : '';
      svg += `<g${fade}>${guides(g, kg, PRICES[i], on)}</g>`;
      svg += `<g${fly}>${dot(x, y, NAMES[i], { lit: on, r: 12, size: 30 })}</g>`;
      over += `<button type="button" class="sv-hit dc-hit" data-act="row" data-val="${i}" aria-label="point ${NAMES[i]}" aria-pressed="${on ? 'true' : 'false'}" style="left:${f1(x - 26)}px;top:${f1(y - 26)}px;width:52px;height:52px;border-radius:50%"></button>`;
    });
    if (!this.anim) {
      const [bx, by] = P ? [195, 562] : [64, 438];
      over += `<div class="dc-ab" style="left:${bx}px;top:${by}px"><button type="button" class="sv-hit dc-btn" data-act="again">again</button></div>`;
    }
    return { svg, over };
  }

  // b2: the joined line DD' and a marker moving along it.
  paintCurve(P) {
    const g = P ? frame(118, 366, 104, 400) : frame(120, 384, 70, 380);
    let svg = axes(g, { yTitleX: P ? 26 : 30 }), over = '';
    // the line through A, B, C (p = 200 - 50 q), from q 0.5 (D) to q 3.5 (D')
    const [x0, y0, x1, y1] = [g.X(0.5), g.Y(175), g.X(3.5), g.Y(25)];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const draw = this.anim && this.at === 0 && !this.move ? ` class="sv-draw" style="--len:${f1(len)};--dur:0.7s"` : '';
    svg += `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}"${draw} ${stroke(SER, 7, 'stroke-linecap:round')}/>`;
    svg += text(x0 - 10, y0 + 2, 'D', 30, SER, 'end') + text(x1 + 4, y1 + 30, 'D\'', 30, SER, 'start');
    KG.forEach((kg, i) => {
      const x = g.X(kg), y = g.Y(PRICES[i]);
      svg += dot(x, y, NAMES[i], { r: 10, size: 26, ldx: 14, ldy: -12 });
      over += `<button type="button" class="sv-hit dc-hit" data-act="pt" data-val="${i}" aria-label="move to ${NAMES[i]}: ${PRICES[i]} rupees, ${kg} kg" style="left:${f1(x - 26)}px;top:${f1(y - 26)}px;width:52px;height:52px;border-radius:50%"></button>`;
    });
    // the marker, its guides, and the board and basket beside the graph
    const i = this.at, mx = g.X(KG[i]), my = g.Y(PRICES[i]);
    const from = this.move ? this.move.from : i;
    const dx = g.X(KG[from]) - mx, dy = g.Y(PRICES[from]) - my;
    svg += guides(g, KG[i], PRICES[i], true);
    const slide = this.move ? ` class="dc-slide" style="--dx:${f1(dx)}px;--dy:${f1(dy)}px"` : '';
    svg += `<g${slide}><circle cx="${f1(mx)}" cy="${f1(my)}" r="19" ${fill('none', 'stroke:var(--sim-accent);stroke-width:5')}/><circle cx="${f1(mx)}" cy="${f1(my)}" r="7" ${fill('var(--sim-accent)')}/></g>`;
    const R = P
      ? { bx: 96, by: 530, bw: 140, kx: 236, ky: 530, kw: 0, play: [338, 530], lab: [[195, 30], [195, 66]] }
      : { bx: 478, by: 128, bw: 140, kx: 478, ky: 300, kw: 112, play: [478, 400], lab: [[280, 34]] };
    svg += priceBoard(R.bx, R.by, PRICES[i], { w: R.bw, h: 60, active: true });
    // portrait has no room for the basket: the board and a big kg tag side by side
    if (!P) svg += basket(R.kx, R.ky, KG[i], { w: R.kw, fromKg: this.move && KG[i] > KG[from] ? KG[from] : null, per: 0.25 });
    const tagY = P ? R.ky : R.ky + 30, tw = P ? 96 : 76, th = P ? 46 : 34;
    svg += `<rect x="${R.kx - tw / 2}" y="${tagY - th / 2}" width="${tw}" height="${th}" rx="${th / 2}" ${fill('var(--sim-good)')}/>` + text(R.kx, tagY + (P ? 10 : 8), `${KG[i]} kg`, P ? 28 : 22, 'var(--sim-bg-deep)');
    if (P) svg += text(R.lab[0][0], R.lab[0][1], 'price changes:', 24) + text(R.lab[1][0], R.lab[1][1], 'move along the curve', 24);
    else svg += text(R.lab[0][0], R.lab[0][1], 'price changes: move along the curve', 24);
    if (!this.anim) over += `<div class="dc-ab" style="left:${R.play[0]}px;top:${R.play[1]}px"><button type="button" class="sv-hit dc-btn" data-act="play">play</button></div>`;
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, lit: this.lit, rows: this.rowsIn, shown: this.shown, at: this.at, price: PRICES[this.at], kg: KG[this.at] }; }
}
