/**
 * HospitalBillScene - L05 s06 "A Hospital Bill" (2 beats). SvgScene, flat graph-paper chart (SimPlotSvg
 * linScale), design 560 x 490 landscape, 390 x 620 portrait. Made-up numbers: the parent's college fund over
 * 15 years. Years 0-3: Rs 1,25,000, 1,60,000, 1,98,000, 2,40,000; after that the plan grows 9% a year plus
 * Rs 24,000 added each year: Rs 11,58,417 at year 15, over the target bar Rs 11,50,000.
 *   b0 A good plan: the fund line draws to year 3 (Rs 2,40,000); the plan dashed on to the target bar at year
 *      15. A hospital bill card Rs 2,00,000 arrives.
 *   b1 What a plan cannot do: year 3 is a low market year (fund Rs 2,20,000); the bill takes Rs 2,00,000 out,
 *      the fund drops to Rs 20,000 and the 15-year line restarts from there (same rule): about Rs 5,40,000 at
 *      year 15 (5,39,631). Dashed old plan vs the new lower path. A big "?" chip "What protects a family?"
 *      (insurance is not shown: L06 answers it).
 * Rest / cold start: everything drawn; both beats play in on entry, with replay.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { linScale } from 'simulations/base/kit/SimPlotSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const G9 = 1.09, ADD = 24000, BILL = 200000, LOW = 220000, TARGET = 1150000;
const EARLY = [125000, 160000, 198000, 240000];                         // years 0..3, made-up
const grow = (v0, from) => { const p = [[from, v0]]; let v = v0; for (let t = from + 1; t <= 15; t++) { v = v * G9 + ADD; p.push([t, v]); } return p; };
const PLAN = grow(EARLY[3], 3);                                         // ends 11,58,417
const LEFT = LOW - BILL;                                                // 20,000
const AGAIN = grow(LEFT, 3);                                            // ends 5,39,631
const AGAIN_END = Math.round(AGAIN[AGAIN.length - 1][1] / 10000) * 10000;   // about 5,40,000
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80), FUND = 'var(--sim-series-7)';

const CSS = `
.hb-ab { position: absolute; transform: translate(-50%, -50%); }
.hb-btn { min-height: 48px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.hb-btn:active { transform: translateY(3px); box-shadow: none; }
.hb-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .hb-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hb-draw var(--dur, 1s) ease-out forwards; animation-delay: var(--d, 0s); }
@keyframes hb-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { svg .hb-draw { animation: none; stroke-dashoffset: 0; } }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
const dot = (x, y, r, col) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;

export class HospitalBillScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Made-up numbers. A graph of the parent\'s college fund over 15 years. It grows to 2,40,000 rupees by year 3, and the plan reaches the target of 11,50,000 rupees at year 15. In year 3 a hospital bill of 2,00,000 rupees arrives. That year the market is low and the fund is 2,20,000 rupees; the bill takes 2,00,000 out and leaves 20,000 rupees. The plan starts again from there and reaches only about 5,40,000 rupees by year 15. What protects a family?';

  async setup() {
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b?.dataset.act === 'replay') this.play();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.after(0.05, () => this.play()); }

  play() {
    this.clear();
    this.fresh = true;
    this.after(this.stepIndex === 1 ? 3.0 : 2.4, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4);
    const out = this.paintChart(P, this.stepIndex);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** Markup that animates on the fresh play only (cls with a delay); plain at rest. */
  anim(cls, d, body, extra = '') { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s;${extra}"` : ''}>${body}</g>`; }

  paintChart(P, v) {
    let svg = '', over = '';
    const G = P ? { x0: 92, x1: 352, yT: 236, yB: 530, card: [12, 12, 366, 168], q: [195, 588], made: [378, 222], replay: [326, 588] }
      : { x0: 100, x1: 474, yT: 76, yB: 400, card: [114, 84, 236, 150], q: [262, 462], made: [552, 30], replay: [500, 462] };
    const px = linScale(0, 15, G.x0, G.x1), py = linScale(0, 1250000, G.yB, G.yT);
    const path = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(px(x))} ${f1(py(y))}`).join('');
    // graph paper
    svg += `<rect x="${G.x0}" y="${G.yT}" width="${G.x1 - G.x0}" height="${G.yB - G.yT}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 72%, transparent)')}/>`;
    for (let t = 0; t <= 15; t += 3) {
      if (t === 12) continue;
      svg += `<path d="M${f1(px(t))} ${G.yT}V${G.yB}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.35')}/>`;
      svg += text(t === 15 ? px(t) + 14 : px(t), G.yB + 24, t === 15 ? '15 years' : String(t), t === 15 ? 19 : 17, t === 15 ? INK : MUTED, t === 15 ? 'end' : 'middle', t === 15 ? 800 : 700);
    }
    for (let y = 0; y <= 1200000; y += 400000) {
      svg += `<path d="M${G.x0} ${f1(py(y))}H${G.x1}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.4')}/>`;
      svg += text(G.x0 - 8, py(y) + 6, group(y), P ? 15 : 16, MUTED, 'end', 700);
    }
    svg += `<path d="M${G.x0} ${G.yT - 6}V${G.yB}H${G.x1}" ${stroke(INK, 3)}/>`;
    svg += text(G.x0 - 8, G.yT - 14, 'rupees', 18, INK, 'end');
    svg += P ? text(12, 196, 'made-up numbers', 18, MUTED, 'start', 700) : text(G.made[0], G.made[1], 'made-up numbers', 18, MUTED, 'end', 700);
    // the target bar at year 15
    const tx = px(15), ty = py(TARGET);
    svg += `<rect x="${f1(tx - 30)}" y="${f1(ty - 6)}" width="44" height="12" rx="6" ${fill(INK)}/>`;
    svg += text(tx + 14, G.yT - 12, `target ${rs(TARGET)}`, P ? 18 : 20, INK, 'end');
    // the plan: early years solid, then dashed (b0: the plan ahead; b1: the old plan)
    const early = EARLY.map((y, i) => [i, y]);
    svg += `<path d="${path(PLAN)}" ${stroke(v === 1 ? MUTED : FUND, 4, `stroke-dasharray:10 8;fill:none;opacity:${v === 1 ? 0.7 : 0.65}`)}/>`;
    if (v === 1) svg += text(px(11.3), py(PLAN[8][1]) + 26, 'old plan', 19, MUTED, 'start', 800);
    else svg += text(px(9.2), py(PLAN[6][1]) - 16, 'the plan', 19, INK, 'end', 800);
    svg += this.anim('hb-draw', 0, `<path d="${path(early)}" pathLength="1" ${stroke(FUND, 6, 'fill:none;stroke-linejoin:round;stroke-linecap:round')}/>`, '--dur:0.9s');
    const x3 = px(3), y3 = py(EARLY[3]);
    if (v === 0) {
      svg += dot(x3, y3, 10, FUND);
      svg += this.anim('mk-pop', 0.8, text(x3 + 16, y3 + 34, rs(EARLY[3]), P ? 24 : 28, INK, 'start'));
      // the bill arrives
      let [cx, cy, cw, ch] = G.card;
      const cardW = P ? 250 : 200, cardX = P ? 12 : 330;
      if (!P) cy = 244;
      svg += this.anim('mk-pop', 1.4, panel(cardX, cy, cardW, P ? 150 : ch, { edge: BAD, sw: 3.5 })
        + icon('hospital', cardX + 50, cy + 52, 64, 'var(--sim-bad)')
        + text(cardX + 92, cy + 44, 'hospital', 22, INK, 'start') + text(cardX + 92, cy + 74, 'bill', 22, INK, 'start')
        + text(cardX + cardW / 2, cy + 116, rs(BILL), 34, BAD_INK)
        + text(cardX + cardW / 2, cy + (P ? 144 : 144), 'in year 3', 18, MUTED, 'middle', 700));
      if (!P) svg += this.anim('mk-pop', 1.6, `<path d="M${f1(cardX - 4)} ${cy + 60}L${f1(x3 + 16)} ${f1(y3)}" ${stroke(BAD, 3, 'stroke-dasharray:6 5')}/>`);
    } else {
      // year 3: a low market year, then the bill
      const yl = py(LOW), y0 = py(LEFT);
      svg += this.anim('hb-draw', 0.9, `<path d="M${f1(x3)} ${f1(y3)}L${f1(x3)} ${f1(yl)}" pathLength="1" ${stroke(MUTED, 6, 'stroke-linecap:round')}/>`, '--dur:0.4s');
      svg += this.anim('hb-draw', 1.3, `<path d="M${f1(x3)} ${f1(yl)}L${f1(x3)} ${f1(y0)}" pathLength="1" ${stroke(BAD, 7, 'stroke-linecap:round')}/>`, '--dur:0.6s');
      svg += dot(x3, yl, 8, MUTED) + this.anim('mk-pop', 1.8, dot(x3, y0, 10, BAD));
      // the new, lower path
      svg += this.anim('hb-draw', 2.0, `<path d="${path(AGAIN)}" pathLength="1" ${stroke(FUND, 6, 'fill:none;stroke-linejoin:round;stroke-linecap:round')}/>`, '--dur:0.9s');
      const [ex, ey] = AGAIN[AGAIN.length - 1];
      svg += this.anim('mk-pop', 2.7, dot(px(ex), py(ey), 10, FUND) + text(P ? 386 : 556, py(ey) + 28, 'about', P ? 18 : 19, MUTED, 'end', 700) + text(P ? 386 : 556, py(ey) + 60, rs(AGAIN_END), P ? 21 : 23, INK, 'end'));
      // the three steps, in a card (top left)
      const [cx, cy, cw] = G.card;
      const rows = [['low year', rs(LOW), INK], ['bill', `-${rs(BILL)}`, BAD_INK], ['left', rs(LEFT), BAD_INK]];
      const W2 = P ? 280 : cw + 20, X2 = P ? 10 : cx;
      svg += panel(X2, cy, W2, 124, { edge: BAD, sw: 3 });
      rows.forEach(([a, b, c], i) => {
        svg += this.anim('mk-pop', 0.9 + i * 0.45, text(X2 + 16, cy + 34 + i * 38, a, 20, MUTED, 'start', 700) + text(X2 + W2 - 16, cy + 34 + i * 38, b, i === 2 ? 28 : 24, c, 'end'));
      });
      if (!P) svg += `<path d="M${f1(X2 + W2 / 2)} ${cy + 128}L${f1(x3 + 8)} ${f1(yl - 12)}" ${stroke(MUTED, 2.5, 'stroke-dasharray:6 5')}/>`;
      // the question (L06 answers it)
      const [qx, qy] = G.q, qw = P ? 330 : 300;
      svg += this.anim('mk-pop', 2.8, `<rect x="${f1(qx - qw / 2)}" y="${qy - 25}" width="${qw}" height="50" rx="25" ${fill('color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3')}/>`
        + `<circle cx="${f1(qx - qw / 2 + 32)}" cy="${qy}" r="22" ${fill(ACC)}/>` + text(qx - qw / 2 + 32, qy + 11, '?', 32, 'var(--sim-bg-deep)')
        + text(qx + 28, qy + 8, 'What protects a family?', P ? 21 : 21, ACC_INK));
    }
    if (!this.fresh) over += `<div class="hb-ab" style="left:${P ? 342 : 500}px;top:${P ? 74 : 462}px"><button type="button" class="sv-hit hb-btn" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  testState() {
    return { view: this.stepIndex, fresh: this.fresh, year3: EARLY[3], low: LOW, bill: BILL, left: LEFT, planEnd: Math.round(PLAN[PLAN.length - 1][1]), againEnd: Math.round(AGAIN[AGAIN.length - 1][1]), target: TARGET };
  }
}
