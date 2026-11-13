/**
 * HouseholdSplitScene - L02 s05 "Save First: a Family's Year" (2 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 620 portrait. Cast: shared/MoneyKit.js (jar, tones, rupees), SimIcons family + coin.
 *   b0 A family's year: income Rs 1,00,000 as one wide bar. Savings (save colour, left, kept aside first) and
 *      spending (the rest). Three share buttons in the figure: 5%, 20%, 30% (aria-pressed, 20% at rest):
 *      5,000 | 95,000; 20,000 | 80,000; 30,000 | 70,000. The line "expenses = income - savings" with the live
 *      numbers under it. The split slides to the new share in 0.5 s.
 *   b1 A small income: a month of Rs 12,000 as one tall column, filled from the bottom: save Rs 300 first (save
 *      colour), then rent 4,000, food 4,500, school fees 1,500, travel 1,700 (made-up numbers). Beside it a jar
 *      "for emergencies" that holds Rs 3,600 after 12 months. "a year of Rs 300" refills it month by month
 *      (0.35 s a month). Rest / cold start: the jar holds Rs 3,600.
 * Controls are inside the figure. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, TONE, jar, coin, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const INCOME = 100000, SHARES = [5, 20, 30], START_SHARE = 20;
const MONTH = 12000, SAVE = 300, MONTHS = 12;
const COSTS = [['rent', 4000], ['food', 4500], ['school fees', 1500], ['travel', 1700]];
const SAVE_INK = shade(TONE.save, 64);
const SPEND = 'var(--sim-series-1)';
const SPEND_INK = shade(SPEND, 62);
const NEED_INK = shade(TONE.need, 62);
const MONTH_S = 0.35;

const CSS = `
.hs-ab { position: absolute; transform: translate(-50%, -50%); }
.hs-row { position: absolute; display: flex; gap: 10px; transform: translate(-50%, -50%); }
.hs-btn { min-height: 46px; min-width: 76px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.hs-btn[aria-pressed="true"], .hs-btn--go { background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.hs-btn:active { transform: translateY(3px); box-shadow: none; }
.hs-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => iconSvg(name, tone).replace(' width="48" height="48"', '').replace('<svg ', `<svg x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${s}" height="${s}" `);
const soft = (col, p = 34) => `color-mix(in oklab, ${col} ${p}%, var(--sim-bg-surface))`;

export class HouseholdSplitScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A family gets 1,00,000 rupees in a year. Savings are kept aside first and the rest is spent. Buttons for 5%, 20% and 30%: savings 5,000, 20,000 or 30,000 rupees; spending 95,000, 80,000 or 70,000. Expenses equal income minus savings. A family with 12,000 rupees a month (made-up numbers): save 300 first, then rent 4,000, food 4,500, school fees 1,500 and travel 1,700. A jar for emergencies holds 3,600 rupees after 12 months.';

  async setup() {
    this.share = START_SHARE;
    this.shown = START_SHARE;
    this.months = MONTHS;
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'share') this.pick(Number(b.dataset.val));
      else if (b.dataset.act === 'year') this.fillYear();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; }

  enter() { this.clear(); this.share = START_SHARE; this.shown = START_SHARE; this.months = MONTHS; }

  /** b0: a new share; the split slides there in 8 steps (0.5 s). */
  pick(v) {
    if (this.stepIndex !== 0 || !SHARES.includes(v) || v === this.share) return;
    this.clear();
    const from = this.shown;
    this.share = v;
    this.anim = true;
    for (let i = 1; i <= 8; i++) this.after(i * 0.06, () => { this.shown = from + ((v - from) * i) / 8; this.repaint(); });
    this.after(0.55, () => { this.anim = false; this.shown = v; this.repaint(); });
    this.repaint();
  }

  /** b1: the jar empties, then Rs 300 goes in each month for 12 months. */
  fillYear() {
    if (this.stepIndex !== 1 || this.anim) return;
    this.clear();
    this.anim = true;
    this.months = 0;
    for (let m = 1; m <= MONTHS; m++) this.after(0.3 + m * MONTH_S, () => { this.months = m; this.repaint(); });
    this.after(0.5 + MONTHS * MONTH_S, () => { this.anim = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.shown = this.share;
    this.months = MONTHS;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintMonth(P) : this.paintYear(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: Rs 1,00,000 split into savings (first) and spending.
  paintYear(P) {
    let svg = '', over = '';
    const G = P
      ? { ic: [50, 58, 64], tx: 92, ty: [44, 84], lab: 150, val: 184, x0: 24, x1: 366, by: 200, bh: 92, order: 324, rowL: [195, 370], row: [195, 414], eq: 468 }
      : { ic: [62, 60, 76], tx: 112, ty: [46, 88], lab: 156, val: 192, x0: 40, x1: 520, by: 208, bh: 96, order: 336, rowL: [40, 390], row: [340, 384], eq: 432 };
    const sv = Math.round((INCOME * this.shown) / 100), sp = INCOME - sv;
    const save = Math.round((INCOME * this.share) / 100), spend = INCOME - save;
    svg += icon('family', G.ic[0], G.ic[1], G.ic[2], 1);
    svg += text(G.tx, G.ty[0], 'a family: income in a year', 21, 'var(--sim-label-muted)', 'start', 700);
    svg += text(G.tx, G.ty[1], rs(INCOME), P ? 32 : 36, 'var(--sim-label)', 'start');
    // the bar
    const W = G.x1 - G.x0, ws = (W * this.shown) / 100, y = G.by, h = G.bh;
    svg += `<rect x="${G.x0}" y="${y + 5}" width="${W}" height="${h}" rx="14" ${fill('var(--sim-stroke)')}/>`;
    svg += `<rect x="${G.x0}" y="${y}" width="${W}" height="${h}" rx="14" ${fill(soft(SPEND, 30), `stroke:${SPEND_INK};stroke-width:3`)}/>`;
    svg += `<path d="M${f1(G.x0 + 14)} ${y}H${f1(G.x0 + ws)}V${y + h}H${f1(G.x0 + 14)}Q${G.x0} ${y + h} ${G.x0} ${y + h - 14}V${y + 14}Q${G.x0} ${y} ${f1(G.x0 + 14)} ${y}Z" ${fill(soft(TONE.save, 62), `stroke:${SAVE_INK};stroke-width:3`)}/>`;
    svg += `<path d="M${f1(G.x0 + ws)} ${y - 8}V${y + h + 8}" ${stroke('var(--sim-label)', 4)}/>`;
    // coins in the savings part, a rupee for each Rs 5,000
    const nc = Math.round(sv / 5000), cr = P ? 11 : 12;
    for (let i = 0; i < nc; i++) {
      const col = Math.floor(i / 2), row = i % 2;
      const cx = G.x0 + 16 + cr + col * (cr * 2.3), cy = y + h / 2 + (row ? cr * 1.3 : -cr * 1.3);
      if (cx + cr < G.x0 + ws - 4) svg += coin(cx, cy, cr);
    }
    if (ws < 40) svg += coin(G.x0 + ws / 2, y + h / 2, Math.min(cr, ws / 2 - 2));
    // the two amounts above the bar
    svg += text(G.x0, G.lab, 'savings', 22, SAVE_INK, 'start');
    svg += text(G.x0, G.val, rs(sv), P ? 30 : 32, 'var(--sim-label)', 'start');
    svg += text(G.x1, G.lab, 'spending', 22, SPEND_INK, 'end');
    svg += text(G.x1, G.val, rs(sp), P ? 30 : 32, 'var(--sim-label)', 'end');
    // order: kept aside first, the rest is spent
    svg += text(G.x0, G.order, P ? '1. kept first' : '1. kept aside first', 21, SAVE_INK, 'start');
    svg += text(G.x1, G.order, '2. the rest is spent', 21, SPEND_INK, 'end');
    // share buttons
    svg += text(G.rowL[0], G.rowL[1], P ? 'keep aside' : 'keep aside', 22, 'var(--sim-label)', P ? 'middle' : 'start');
    const btns = SHARES.map((s) => `<button type="button" class="sv-hit hs-btn" data-act="share" data-val="${s}" aria-pressed="${s === this.share}" aria-label="keep ${s}% aside">${s}%</button>`).join('');
    over += `<div class="hs-row" style="left:${G.row[0]}px;top:${G.row[1]}px">${btns}</div>`;
    // the rule with the live numbers
    if (P) {
      svg += text(195, G.eq, 'expenses = income - savings', 22, 'var(--sim-label-muted)', 'middle', 700);
      const rows = [['income', rs(INCOME), 'var(--sim-label)'], ['- savings', rs(save), SAVE_INK], ['= expenses', rs(spend), SPEND_INK]];
      rows.forEach(([l, v, c], i) => {
        const yy = G.eq + 38 + i * 34;
        svg += text(60, yy, l, 22, c, 'start', 700) + text(336, yy, v, 26, c, 'end');
      });
      svg += `<path d="M60 ${G.eq + 84}H336" ${stroke('var(--sim-label)', 2.5)}/>`;
    } else {
      svg += text(280, G.eq, 'expenses = income - savings', 22, 'var(--sim-label-muted)', 'middle', 700);
      svg += `<text x="280" y="${G.eq + 38}" text-anchor="middle" style="font:800 30px var(--sim-font);fill:var(--sim-label)">`
        + `<tspan style="fill:${SPEND_INK}">${rs(spend)}</tspan> = ${rs(INCOME)} - <tspan style="fill:${SAVE_INK}">${rs(save)}</tspan></text>`;
    }
    return { svg, over };
  }

  // b1: a month of Rs 12,000, save Rs 300 first; a jar for emergencies.
  paintMonth(P) {
    let svg = '', over = '';
    const G = P
      ? { hd: [24, 42], note: [24, 72], x0: 24, cw: 88, top: 100, bot: 392, lx: 126, jar: [76, 588, 96], jt: [146], btn: [262, 594] }
      : { hd: [30, 44], note: [30, 74], x0: 30, cw: 104, top: 100, bot: 452, lx: 150, jar: [462, 404, 122], jt: [462], btn: [462, 112] };
    svg += text(G.hd[0], G.hd[1], `${rs(MONTH)} a month`, P ? 30 : 32, 'var(--sim-label)', 'start');
    svg += text(G.note[0], G.note[1], 'made-up numbers', 20, 'var(--sim-label-muted)', 'start', 700);
    // the column, bottom up: save first, then the costs
    const k = (G.bot - G.top) / MONTH, x = G.x0, w = G.cw;
    svg += `<rect x="${x + 4}" y="${G.top + 4}" width="${w}" height="${G.bot - G.top}" rx="10" ${fill('var(--sim-stroke)')}/>`;
    let yb = G.bot;
    const hs = SAVE * k;
    const segs = [];
    COSTS.forEach(([n, v], i) => {
      const y1 = yb - hs - COSTS.slice(0, i).reduce((s, c) => s + c[1], 0) * k, y0 = y1 - v * k;
      segs.push({ n, v, y0, y1 });
    });
    segs.forEach((s, i) => {
      svg += `<rect x="${x}" y="${f1(s.y0)}" width="${w}" height="${f1(s.y1 - s.y0)}" ${fill(soft(TONE.need, i % 2 ? 24 : 38), `stroke:${NEED_INK};stroke-width:2.5`)}/>`;
      svg += `<text x="${G.lx}" y="${f1((s.y0 + s.y1) / 2 + 8)}" style="font:700 21px var(--sim-font);fill:var(--sim-label)">${s.n} <tspan style="font-weight:800;font-size:23px">${rs(s.v)}</tspan></text>`;
    });
    // the save slice: thin, at the bottom, put in first
    svg += `<rect x="${x - 3}" y="${f1(yb - hs - 1.5)}" width="${w + 6}" height="${f1(hs + 3)}" rx="2" ${fill('var(--sim-series-3)', `stroke:${SAVE_INK};stroke-width:2.5`)}/>`;
    svg += `<rect x="${x}" y="${G.top}" width="${w}" height="${G.bot - G.top}" rx="10" ${fill('none', 'stroke:var(--sim-label);stroke-width:3')}/>`;
    const sy = yb - hs / 2;
    svg += `<path d="M${x + w + 8} ${f1(sy)}H${G.lx - 6}" ${stroke(SAVE_INK, 3)}/>`;
    svg += `<text x="${G.lx}" y="${f1(sy + 30)}" style="font:800 23px var(--sim-font);fill:${SAVE_INK}">save first ${rs(SAVE)}</text>`;
    // the jar
    const [jx, jy, jw] = G.jar, m = this.months, held = m * SAVE;
    svg += jar(jx, jy, held, null, { w: jw, max: MONTHS * SAVE * 1.08 });
    if (P) {
      const tx = G.jt[0];
      svg += text(tx, 480, 'for emergencies', 22, SAVE_INK, 'start');
      svg += text(tx, 518, rs(held), 32, 'var(--sim-label)', 'start');
      svg += text(tx, 548, m === MONTHS && !this.anim ? 'after 12 months' : `month ${m}`, 20, 'var(--sim-label-muted)', 'start', 700);
      svg += `<path d="M${G.lx - 8} ${f1(sy + 22)}Q${jx} ${f1(sy + 24)} ${jx} ${jy - jw * 1.46}" ${stroke(SAVE_INK, 3, 'stroke-dasharray:7 6')}/>`;
    } else {
      const top = jy - jw * 1.3 - jw * 0.1;
      svg += text(jx, top - 14, rs(held), 34, 'var(--sim-label)');
      svg += text(jx, top - 52, m === MONTHS && !this.anim ? 'after 12 months' : `month ${m}`, 21, 'var(--sim-label-muted)', 'middle', 700);
      svg += text(jx + 14, jy + 34, 'for emergencies', 22, SAVE_INK);
      svg += `<path d="M${G.lx + 196} ${f1(sy + 22)}Q${jx - jw / 2 - 14} ${f1(sy + 22)} ${jx - jw / 2 - 8} ${jy - 64}" ${stroke(SAVE_INK, 3, 'stroke-dasharray:7 6')}/>`
        + `<path d="M${jx - jw / 2 - 17} ${jy - 54}l9 -12l8 11" ${stroke(SAVE_INK, 3)}/>`;
    }
    if (this.anim && m > 0) svg += `<g class="mk-pop" style="--d:0s">${coin(jx, jy - jw * 1.3 - 18, 14)}</g>`;
    if (!this.anim) over += `<div class="hs-ab" style="left:${G.btn[0]}px;top:${G.btn[1]}px"><button type="button" class="sv-hit hs-btn hs-btn--go" data-act="year">a year of ${rs(SAVE)}</button></div>`;
    return { svg, over };
  }

  testState() {
    return { view: this.stepIndex, share: this.share, savings: Math.round((INCOME * this.share) / 100), spending: INCOME - Math.round((INCOME * this.share) / 100), months: this.months, jar: this.months * SAVE, anim: this.anim };
  }
}
