/**
 * PaidAddedScene - L03 s03 "Paid In and Added" (3 beats). SvgScene + SimPlotSvg axes, design 560 x 480 landscape,
 * 390 x 580 portrait. Bhavisha only: Rs 1,000 at the END of every year at 7% from 25 to 65.
 * One chart look for the lesson: Bhavisha = series 5, paid in = muted, added = the save colour (series 3).
 *   b0 Two parts in every bar: a bar every 5 years (ages 30-65) on the age / rupees graph, each split into paid in
 *      (muted, below) and added (save colour, on top). A card top left reads the bar at 65: total Rs 1,99,635 =
 *      added Rs 1,59,635 + paid in Rs 40,000, "added: about 4 x paid in". Bars rise in turn on entry; "replay".
 *   b1 Interest earns interest: three big bars, years 1-3, stacked in time order (deposit, interest, deposit ...).
 *      Year 1 Rs 1,000 (no interest yet); year 2 = 1,000 + 70 + 1,000 = 2,070; year 3 = 2,070 + 144.90 + 1,000 =
 *      3,214.90. A dashed accent outline marks what 7% is worked out on (1,000 in year 2, 2,070 in year 3); under
 *      the bars "7% of Rs 1,000 = Rs 70", "7% of Rs 2,070 = Rs 144.90". Legend: paid in (principal), added
 *      (interest).
 *   b2 Slow first, fast later: a bar for every year (ages 26-65); one year is chosen (drag on the chart or - / +
 *      in the figure; default 65): its top slice (that year's interest + the Rs 1,000 paid in) is lit, the rest
 *      dimmed. The card reads "this year: +Rs 12,995 interest" at 65, +Rs 838 at 35 (balance Rs 13,816).
 * Numbers checked with node. Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { plotFrame, axesOnSvg } from 'simulations/base/kit/SimPlotSvg.js';
import { MONEY_CSS, RS, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DEP = 1000, RATE = 0.07, FROM = 25, END = 65;
const fv = (n) => (n <= 0 ? 0 : DEP * ((1 + RATE) ** n - 1) / RATE);
const valAt = (age) => fv(age - FROM);
const paidAt = (age) => Math.max(0, age - FROM) * DEP;
const yearInt = (age) => RATE * fv(age - FROM - 1);      // interest in the year that ends at this age
const B = 'var(--sim-series-5)', ADD = 'var(--sim-series-3)', PAID = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)';
const MUTED = 'var(--sim-label-muted)';
const ink = (c) => shade(c, 58);
const soft = (col, p) => `color-mix(in oklab, ${col} ${p}%, var(--sim-bg-surface))`;
const PAID_FILL = soft(PAID, 42), ADD_FILL = soft(ADD, 72);

/** Rupees with paise when there are any: 144.9 -> sign + 144.90; 2070 -> sign + 2,070. */
const rsp = (v) => { const r = Math.round(v * 100); if (r % 100 === 0) return rs(r / 100); return RS + group(Math.floor(r / 100)) + '.' + String(r % 100).padStart(2, '0'); };

const CSS = `
.pa-ab { position: absolute; transform: translate(-50%, -50%); }
.pa-row { position: absolute; display: flex; align-items: center; gap: 10px; transform: translate(-50%, -50%); }
.pa-btn { min-height: 48px; min-width: 52px; padding: 4px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 22px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.pa-btn:active { transform: translateY(3px); box-shadow: none; }
.pa-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.pa-btn[aria-disabled="true"] { opacity: 0.4; cursor: default; }
.pa-age { min-width: 92px; text-align: center; font: 800 25px/1 var(--sim-font); color: var(--sim-label); }
.pa-quiet { font-size: 19px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, col, line, o = '') =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0.5, w))}" height="${f1(Math.max(1, h))}" ${fill(col, `stroke:${line};stroke-width:2${o}`)}/>`;
const swatch = (x, y, col, line) => `<rect x="${x}" y="${y - 17}" width="22" height="22" rx="5" ${fill(col, `stroke:${line};stroke-width:2.5`)}/>`;

export class PaidAddedScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Bhavisha puts 1,000 rupees in at the end of every year at 7% from age 25 to 65. Each bar splits into what she paid in and what was added. At 65 she paid in 40,000 rupees and 1,59,635 rupees was added: 1,99,635 in all. In year 1 there is no interest yet. In year 2, 7% of 1,000 is 70, so 1,000 + 70 + 1,000 = 2,070. In year 3, 7% of 2,070 is 144.90, so 3,214.90. The interest added in one year grows from 838 rupees at 35 to about 13,000 rupees in her last year.';

  async setup() {
    this.age = END;
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.replay();
      else if (b.dataset.act === 'age') this.setAge(this.age + Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); }

  enter() {
    this.clear();
    this.age = END;
    this.fresh = true;
    this.after(1.8, () => { this.fresh = false; });
  }

  replay() {
    this.clear();
    this.fresh = true;
    this.repaint();
    this.after(1.8, () => { this.fresh = false; });
  }

  setAge(a) {
    if (this.stepIndex !== 2) return;
    const n = Math.max(FROM + 1, Math.min(END, Math.round(a)));
    if (n === this.age) return;
    this.fresh = false;
    this.age = n;
    this.repaint();
  }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 480) * st.W / (st.portrait ? 390 : 560)); }

  geo(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = st.W / DW;
    const top = P ? 222 : 24, bot = P ? 632 : 474;
    const r = { x: 34 * k, y: top * k, w: (DW - 34) * k, h: (bot - top) * k };
    const f = plotFrame(r, {
      x: { min: 25, max: 66, ticks: [25, 35, 45, 55, 65], label: 'age' },
      y: { min: 0, max: 200000, ticks: [0, 50000, 100000, 150000, 200000], fmt: group },
      rightPad: 14 * k,
    });
    f.y.fmt = group;
    const d = { x: (v) => f.px(v) / k, y: (v) => f.py(v) / k };
    const pl = { x: f.plot.x / k, y: f.plot.y / k, w: f.plot.w / k, h: f.plot.h / k };
    return { P, DW, k, f, d, pl, top };
  }

  ctrlBox(g) {
    const h = this.stepIndex === 2 ? 182 : 172;
    if (g.P) return { x0: 16, y0: 10, x1: 374, y1: 10 + h };
    const x0 = g.pl.x + 8, y0 = g.pl.y + 4;
    return { x0, y0, x1: x0 + 290, y1: y0 + h };
  }

  pointerDown(p) {
    if (this.stepIndex !== 2 || !this.sv) return false;
    const g = this.geo(this.sv), x = p.x / g.k, y = p.y / g.k, c = this.ctrlBox(g);
    if (x < g.pl.x - 12 || x > g.pl.x + g.pl.w + 16 || y < g.pl.y - 10 || y > g.pl.y + g.pl.h + 30) return false;
    if (x > c.x0 && x < c.x1 && y > c.y0 && y < c.y1) return false;
    this.setAge(g.f.vx(p.x));
    return true;
  }

  pointerMove(p) {
    if (this.stepIndex !== 2 || !this.sv) return false;
    const g = this.geo(this.sv), before = this.age;
    this.age = Math.max(FROM + 1, Math.min(END, Math.round(g.f.vx(p.x))));
    if (this.age !== before) this.fresh = false;
    return this.age !== before;
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 480, k = st.W / DW, v = this.stepIndex;
    const out = v === 1 ? this.paintThree(P) : this.paintBars(this.geo(st), v);
    return { svg: `<g transform="scale(${k.toFixed(4)})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k.toFixed(4)});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** One age bar: paid in below, added on top; o.lit lights this year's slice; o.dim dims the bar. */
  bar(g, age, w, o = {}) {
    const { d } = g, x = d.x(age) - w / 2, base = d.y(0);
    const paid = paidAt(age), tot = valAt(age), yP = d.y(paid), yT = d.y(tot);
    const op = o.dim ? 'opacity:0.3' : '';
    let s = `<g${o.cls ? ` class="${o.cls}" style="--d:${o.d ?? 0}s;${op}"` : (op ? ` style="${op}"` : '')}>`;
    s += rect(x, yP, w, base - yP, PAID_FILL, shade(PAID, 70));
    if (tot - paid > 0) s += rect(x, yT, w, yP - yT, ADD_FILL, shade(ADD, 62));
    s += '</g>';
    return s;
  }

  paintBars(g, v) {
    const { P, d, pl } = g;
    let svg = '', over = '';
    svg += text(6, g.top + 6, 'rupees', 19, 'var(--sim-label)', 'start', 800);
    const c = this.ctrlBox(g);
    const card = () => `<rect x="${f1(c.x0)}" y="${f1(c.y0)}" width="${f1(c.x1 - c.x0)}" height="${f1(c.y1 - c.y0)}" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;opacity:0.96')}/>`;
    if (v === 0) {
      const w = P ? 22 : 30, an = this.fresh;
      [30, 35, 40, 45, 50, 55, 60, 65].forEach((a, i) => { svg += this.bar(g, a, w, an ? { cls: 'mk-rise', d: (0.1 + i * 0.14).toFixed(2) } : {}); });
      // the last bar's parts, named beside it
            // the card: total = added + paid in
      svg += card();
      const x0 = c.x0 + 16;
      svg += text(x0, c.y0 + 30, 'Bhavisha at 65', 20, ink(B), 'start', 800);
      svg += text(x0, c.y0 + 68, rs(Math.round(valAt(END))), P ? 32 : 34, 'var(--sim-label)', 'start');
      svg += swatch(x0, c.y0 + 106, ADD_FILL, shade(ADD, 62)) + text(x0 + 32, c.y0 + 106, `added ${rs(Math.round(valAt(END) - paidAt(END)))}`, P ? 22 : 24, ink(ADD), 'start');
      svg += swatch(x0, c.y0 + 140, PAID_FILL, shade(PAID, 70)) + text(x0 + 32, c.y0 + 140, `paid in ${rs(paidAt(END))}`, P ? 21 : 22, 'var(--sim-label)', 'start', 700);
      svg += text(x0, c.y0 + 166, 'added: about 4 x paid in', 18, MUTED, 'start', 700);
      over += `<div class="pa-ab" style="left:${f1(P ? c.x1 - 62 : c.x1 + 60)}px;top:${f1(c.y0 + (P ? 36 : 30))}px"><button type="button" class="sv-hit pa-btn pa-quiet" data-act="replay">replay</button></div>`;
    } else {
      const age = this.age, w = P ? 5 : 7;
      for (let a = FROM + 1; a <= END; a++) svg += this.bar(g, a, w, { dim: a !== age });
      // the chosen year: its top slice lit (that year's interest, then the deposit at the end of the year)
      const x = d.x(age) - w / 2, tot = valAt(age), yT = d.y(tot), yI0 = d.y(tot - DEP), yI1 = d.y(tot - DEP - yearInt(age));
      svg += `<rect x="${f1(x - 6)}" y="${f1(yT - 6)}" width="${f1(w + 12)}" height="${f1(Math.max(12, yI1 - yT + 12))}" rx="5" ${fill('none', `stroke:${ACC};stroke-width:3.5`)}/>`;
      svg += `<path d="M${f1(x - 7)} ${f1(yI0)}H${f1(x + w + 7)}" ${stroke(ACC, 2)}/>`;
      if (yT - 14 > c.y1 && d.x(age) < c.x1) svg += `<path d="M${f1(d.x(age))} ${f1(yT - 8)}V${f1(c.y1 + 4)}" ${stroke(ACC, 2.5, 'stroke-dasharray:6 6')}/>`;
      svg += `<circle cx="${f1(d.x(age))}" cy="${f1(d.y(0))}" r="12" ${fill(ACC, 'stroke:var(--sim-bg-surface);stroke-width:3.5')}/>`;
      svg += card();
      const x0 = c.x0 + 16, yi = Math.round(yearInt(age));
      svg += text((c.x0 + c.x1) / 2, c.y0 + 82, 'or drag on the chart', 18, MUTED, 'middle', 700);
      svg += text(x0, c.y0 + 112, 'this year', 20, 'var(--sim-label)', 'start', 700);
      svg += text(x0, c.y0 + 146, `+${rs(yi)} interest`, P ? 28 : 30, ink(ADD), 'start');
      svg += text(x0, c.y0 + 172, `balance ${rs(Math.round(tot))}`, 19, MUTED, 'start', 700);
      const dn = age <= FROM + 1, up = age >= END;
      over += `<div class="pa-row" style="left:${f1((c.x0 + c.x1) / 2)}px;top:${f1(c.y0 + 34)}px">`
        + `<button type="button" class="sv-hit pa-btn" data-act="age" data-val="-5" aria-label="5 years younger" aria-disabled="${dn}">-5</button>`
        + `<span class="pa-age" aria-live="polite">age ${age}</span>`
        + `<button type="button" class="sv-hit pa-btn" data-act="age" data-val="5" aria-label="5 years older" aria-disabled="${up}">+5</button></div>`;
    }
    return { svg, over };
  }

  // b1: years 1-3, stacked in time order; what 7% is worked out on.
  paintThree(P) {
    let svg = '', over = '';
    const G = P
      ? { base: 420, top: 160, w: 62, xs: [24, 124, 224], yl: 448, leg: [[20, 36], [20, 70]], eq: [[20, 494], [20, 526], [20, 558]], lab: [20, 104], replay: [326, 52] }
      : { base: 340, top: 96, w: 92, xs: [40, 196, 352], yl: 370, leg: [[24, 40], [262, 40]], eq: [[86, 406], [242, 406], [398, 406]], lab: [150, 470], replay: [506, 40] };
    const V3 = 1000 + 70 + 1000 + 144.9 + 1000, k = (G.base - G.top) / V3, an = this.fresh;
    svg += swatch(G.leg[0][0], G.leg[0][1], PAID_FILL, shade(PAID, 70)) + text(G.leg[0][0] + 32, G.leg[0][1], 'paid in (principal)', 21, 'var(--sim-label)', 'start', 800);
    svg += swatch(G.leg[1][0], G.leg[1][1], ADD_FILL, shade(ADD, 62)) + text(G.leg[1][0] + 32, G.leg[1][1], 'added (interest)', 21, ink(ADD), 'start', 800);
    // parts in time order: [amount, kind]
    const parts = [[[1000, 'p']], [[1000, 'p'], [70, 'a'], [1000, 'p']], [[1000, 'p'], [70, 'a'], [1000, 'p'], [144.9, 'a'], [1000, 'p']]];
    const tots = [1000, 2070, 3214.9], base7 = [0, 1000, 2070], names = ['year 1', 'year 2', 'year 3'];
    parts.forEach((ps, i) => {
      const x = G.xs[i], w = G.w;
      let y = G.base;
      svg += `<rect x="${x + 5}" y="${f1(G.base - tots[i] * k + 5)}" width="${w}" height="${f1(tots[i] * k)}" ${fill('var(--sim-stroke)')}/>`;
      ps.forEach(([amt, kind], j) => {
        const h = amt * k;
        y -= h;
        const newest = j >= ps.length - 2 && i > 0;
        const body = rect(x, y, w, h, kind === 'a' ? soft(ADD, 88) : PAID_FILL, kind === 'a' ? shade(ADD, 55) : shade(PAID, 70), kind === 'a' ? ';stroke-width:2.5' : '');
        svg += an && newest ? `<g class="mk-rise" style="--d:${(0.3 + i * 0.5 + (j - ps.length + 2) * 0.25).toFixed(2)}s">${body}</g>` : body;
      });
      // what 7% is worked out on: last year's balance, at the bottom of this bar
      if (base7[i] > 0) {
        const h = base7[i] * k;
        svg += `<rect x="${x - 5}" y="${f1(G.base - h - 5)}" width="${w + 10}" height="${f1(h + 10)}" rx="6" ${fill('none', `stroke:${ACC};stroke-width:4;stroke-dasharray:10 6`)}/>`;
        svg += text(x + w / 2, G.base - h * 0.3 + 8, rs(base7[i]), P ? 19 : 23, 'var(--sim-label)');
      }
      svg += text(x + w / 2, G.base - tots[i] * k - 12, rsp(tots[i]), P ? 21 : 26, 'var(--sim-label)');
      svg += text(x + w / 2, G.yl, names[i], 21, 'var(--sim-label)', 'middle', 700);
    });
    // the interest slices of year 3, named beside the bar
    const x3 = G.xs[2] + G.w + 10, y70 = G.base - (1000 + 35) * k, y145 = G.base - (2070 + 72.45) * k;
    svg += `<g${an ? ' class="mk-pop" style="--d:1.6s"' : ''}>${text(x3, y145 + 8, '+' + rsp(144.9), P ? 21 : 24, ink(ADD), 'start')}`
      + text(x3, y70 + 8, '+' + rs(70), P ? 21 : 24, ink(ADD), 'start') + '</g>';
    const eqs = ['no interest yet', `7% of ${rs(1000)} = ${rs(70)}`, `7% of ${rs(2070)} = ${rsp(144.9)}`];
    if (P) {
      svg += `<rect x="12" y="${G.eq[0][1] - 26}" width="366" height="100" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
      eqs.forEach((e, i) => { svg += text(G.eq[i][0] + 10, G.eq[i][1], `${names[i]}: ${e}`, 20, i ? 'var(--sim-label)' : MUTED, 'start', i ? 800 : 700); });
    } else {
      svg += text(G.eq[0][0] + 6, G.eq[0][1], 'no interest', 20, MUTED, 'middle', 700) + text(G.eq[0][0] + 6, G.eq[0][1] + 28, 'yet', 20, MUTED, 'middle', 700);
      [[1000, 70], [2070, 144.9]].forEach(([on, got], j) => {
        const e = G.eq[j + 1];
        svg += text(e[0] + 6, e[1], `7% of ${rs(on)}`, 21, 'var(--sim-label)', 'middle', 800) + text(e[0] + 6, e[1] + 28, `= ${rsp(got)}`, 22, ink(ADD), 'middle', 800);
      });
    }
    svg += `<rect x="${G.lab[0] + 2}" y="${G.lab[1] - 18}" width="22" height="16" rx="3" ${fill('none', `stroke:${ACC};stroke-width:3;stroke-dasharray:6 4`)}/>`
      + text(G.lab[0] + 34, G.lab[1] - 3, '7% is worked out on this', 20, 'var(--sim-label)', 'start', 700);
    svg += `<path d="M${P ? 12 : 24} ${G.base}H${P ? 378 : 536}" ${stroke('var(--sim-label)', 3)}/>`;
    over += `<div class="pa-ab" style="left:${G.replay[0]}px;top:${G.replay[1]}px"><button type="button" class="sv-hit pa-btn pa-quiet" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  animate(st) {
    if (this.stepIndex === 1) return;
    const g = this.geo(st);
    axesOnSvg(this.live, 'ax', g.f, 99, { size: Math.round(18 * g.k), fmtY: group, grid: true });
  }

  testState() {
    const v = this.stepIndex, age = v === 2 ? this.age : END;
    return { view: v, age, total: Math.round(valAt(age)), paid: paidAt(age), added: Math.round(valAt(age) - paidAt(age)), yearInterest: Math.round(yearInt(age)) };
  }
}
