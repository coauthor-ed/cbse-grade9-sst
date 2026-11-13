/**
 * CousinsRaceScene - L03 s02 "Less Than Half" (3 beats). SvgScene + SimPlotSvg chart, design 560 x 500 landscape,
 * 390 x 620 portrait. Bhavisha and Dhruv each put Rs 1,000 in at the END of every year at 7% until 65
 * (value after n deposits = 1000 x (1.07^n - 1) / 0.07). Bhavisha starts at 25 (40 deposits), Dhruv at 35 (30).
 * One chart look for the lesson: Bhavisha = series 5, Dhruv = series 8, paid in = muted dashes.
 *   b0 The two totals at 65: both curves on a graph (age 25-65, rupees 0-2,00,000). Two readout cards on top:
 *      Bhavisha Rs 1,99,635, Dhruv Rs 94,461. A dashed "half" line at half of Bhavisha's total; Dhruv's end dot
 *      sits under it; a callout "47% / less than half". "replay" draws both curves by age (2 s).
 *   b1 The first ten years: an age line on the chart (drag on the chart, or the - / + buttons in the figure),
 *      default 35. Curves solid up to that age, faint after it. The cards read the live totals and what each has
 *      paid in: at 35 Bhavisha Rs 13,816 (paid in Rs 10,000), Dhruv Rs 0 (just started).
 *   b2 The gap is not Rs 10,000: dashed "paid in" lines (Rs 40,000 and Rs 30,000 at 65) under the curves; at 65 a
 *      big bracket between the curves (Rs 1,05,174) and a tiny one between the paid-in lines (Rs 10,000). The
 *      cards name both brackets.
 * Chart geometry is in stage px (live layer); static parts in design units (scale k). Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { plotFrame, axesOnSvg, plotLineSvg, toScreen } from 'simulations/base/kit/SimPlotSvg.js';
import { MONEY_CSS, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DEP = 1000, RATE = 0.07, END = 65;
const fv = (n) => (n <= 0 ? 0 : DEP * ((1 + RATE) ** n - 1) / RATE);
const WHO = [
  { key: 'b', name: 'Bhavisha', from: 25, col: 'var(--sim-series-5)' },
  { key: 'd', name: 'Dhruv', from: 35, col: 'var(--sim-series-8)' },
];
const valAt = (w, age) => Math.round(fv(age - w.from));
const paidAt = (w, age) => Math.max(0, age - w.from) * DEP;
const B65 = valAt(WHO[0], END), D65 = valAt(WHO[1], END), GAP = B65 - D65;   // 1,99,635  94,461  1,05,174
const PCT = Math.round((D65 / B65) * 100);                                     // 47
const DRAW_S = 2.0;
const MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)';
const ink = (c) => shade(c, 58);

const CSS = `
.cr-ab { position: absolute; transform: translate(-50%, -50%); }
.cr-row { position: absolute; display: flex; align-items: center; gap: 10px; transform: translate(-50%, -50%); }
.cr-btn { min-height: 48px; min-width: 52px; padding: 4px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 22px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.cr-btn:active { transform: translateY(3px); box-shadow: none; }
.cr-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.cr-btn[aria-disabled="true"] { opacity: 0.4; cursor: default; }
.cr-age { min-width: 96px; text-align: center; font: 800 26px/1 var(--sim-font); color: var(--sim-label); }
.cr-quiet { font-size: 19px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** A vertical bracket at x from y1 (top) to y2, opening to the left. */
const bracket = (x, y1, y2, col, w = 4, dash = '') =>
  `<path d="M${f1(x - 9)} ${f1(y1)}H${f1(x)}V${f1(y2)}H${f1(x - 9)}" ${stroke(col, w, dash ? `stroke-dasharray:${dash}` : '')}/>`;

export class CousinsRaceScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A graph of savings against age, from 25 to 65. Bhavisha puts 1,000 rupees in at the end of every year at 7% from age 25; Dhruv does the same from age 35. At 65 Bhavisha has 1,99,635 rupees and Dhruv 94,461 rupees, which is 47%, less than half. At 35 Bhavisha has 13,816 rupees after paying in 10,000; Dhruv has just started. Bhavisha paid in 40,000 rupees and Dhruv 30,000, only 10,000 apart, but at 65 the gap between them is 1,05,174 rupees.';

  async setup() {
    this.age = 35;
    this.drawing = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.draw();
      else if (b.dataset.act === 'age') this.setAge(this.age + Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.drawing = false; }

  enter() { this.clear(); this.age = 35; }

  setAge(a) {
    if (this.stepIndex !== 1) return;
    const n = Math.max(25, Math.min(END, Math.round(a)));
    if (n === this.age) return;
    this.age = n;
    this.repaint();
  }

  /** b0: both curves draw by age; the cards and the callout come back at the end (timed repaint). */
  draw() {
    if (this.stepIndex !== 0) return;
    this.clear();
    this.clockReset?.();
    this.drawing = true;
    this.play(DRAW_S + 0.2);
    this.after(DRAW_S + 0.3, () => { this.drawing = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.drawing) return false;
    this.clear();
    super.skip?.();
    this.repaint();
    return true;
  }

  busy() { return this.drawing; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 500) * st.W / (st.portrait ? 390 : 560)); }

  /** Design layout plus the chart frame in stage px. */
  geo(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = st.W / DW;
    const top = P ? 150 : 140, bot = P ? 610 : 494;
    const rect = { x: 34 * k, y: top * k, w: (DW - 34) * k, h: (bot - top) * k };
    const f = plotFrame(rect, {
      x: { min: 25, max: END, ticks: [25, 35, 45, 55, 65], label: 'age' },
      y: { min: 0, max: 200000, ticks: [0, 50000, 100000, 150000, 200000], fmt: group },
      rightPad: (P ? 30 : 38) * k,
    });
    f.y.fmt = group;
    const d = { x: (v) => f.px(v) / k, y: (v) => f.py(v) / k };
    const pl = { x: f.plot.x / k, y: f.plot.y / k, w: f.plot.w / k, h: f.plot.h / k };
    return { P, DW, k, f, d, pl, top };
  }

  pointerDown(p) {
    if (this.stepIndex !== 1 || !this.sv) return false;
    const g = this.geo(this.sv), x = p.x / g.k, y = p.y / g.k;
    if (x < g.pl.x - 12 || x > g.pl.x + g.pl.w + 16 || y < g.pl.y - 10 || y > g.pl.y + g.pl.h + 30) return false;
    // the control row sits inside the plot: leave it to its buttons
    const c = this.ctrlBox(g);
    if (x > c.x0 && x < c.x1 && y > c.y0 && y < c.y1) return false;
    this.setAge(g.f.vx(p.x));
    return true;
  }

  pointerMove(p) {
    if (this.stepIndex !== 1 || !this.sv) return false;
    const g = this.geo(this.sv), before = this.age;
    this.age = Math.max(25, Math.min(END, Math.round(g.f.vx(p.x))));
    return this.age !== before;
  }

  /** Box of the b1 control row (design units), top-left inside the plot. */
  ctrlBox(g) {
    const x0 = g.pl.x + 8, y0 = g.pl.y + 4;
    return { x0, y0, x1: x0 + (g.P ? 258 : 268), y1: y0 + 98 };
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 500, k = st.W / DW;
    const out = this.paintAll(this.geo(st));
    return { svg: `<g transform="scale(${k.toFixed(4)})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k.toFixed(4)});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** One readout card: a colour key, a name line, a big value, an optional small line. */
  card(x, y, w, h, o) {
    let s = `<rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="16" ${fill('var(--sim-stroke)')}/>`
      + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.edge ? 3.5 : 2.5}`)}/>`;
    s += o.key;
    s += text(x + 48, y + 30, o.name, o.nameSize ?? 20, o.nameCol ?? 'var(--sim-label)', 'start', 800);
    s += text(x + 16, y + (o.sub ? 62 : 70), o.value, o.valueSize ?? 32, o.valueCol ?? 'var(--sim-label)', 'start', 800);
    if (o.sub) s += text(x + 16, y + 90, o.sub, o.subSize ?? 19, MUTED, 'start', 700);
    return s;
  }

  paintAll(g) {
    const { P, d, pl } = g, v = this.stepIndex;
    let svg = '', over = '';
    const age = v === 1 ? this.age : END;
    const cw = P ? 179 : 256, ch = v === 1 ? 100 : 84, cx = [16, P ? 195 : 288], cy = 8;
    const lineKey = (x, y, c, dash) => `<path d="M${x + 14} ${y + 23}H${x + 38}" ${stroke(c, 7, dash ? 'stroke-dasharray:5 5' : '')}/>`;

    // the readout cards
    if (!this.drawing) {
      if (v === 2) {
        const bx = cx[0], px = cx[1];
        svg += this.card(bx, cy, cw, ch, {
          key: bracket(bx + 34, cy + 10, cy + 38, 'var(--sim-label)', 4.5), name: 'gap at 65',
          value: rs(GAP), valueSize: P ? 28 : 34, edge: 'var(--sim-label)',
        });
        svg += this.card(px, cy, cw, ch, {
          key: bracket(px + 34, cy + 18, cy + 28, MUTED, 3.5), name: P ? 'paid in' : 'paid in (dashed)',
          value: P ? `${rs(10000)} more` : `only ${rs(10000)} more`, valueSize: P ? 22 : 26, valueCol: MUTED,
        });
      } else {
        WHO.forEach((w, i) => {
          const x = cx[i], val = valAt(w, age), started = age > w.from;
          const nm = v === 1 ? `${w.name} at ${age}` : `${w.name} at 65`;
          let sub = null;
          if (v === 1) sub = started ? `paid in ${rs(paidAt(w, age))}` : (age === w.from ? 'just started' : `starts at ${w.from}`);
          svg += this.card(x, cy, cw, ch, {
            key: lineKey(x, cy, w.col), name: nm, nameSize: P ? 18 : 20, nameCol: ink(w.col),
            value: rs(val), valueSize: P ? 28 : 32, sub, subSize: P ? 17 : 19,
          });
        });
      }
    }

    svg += text(6, g.top - 2, 'rupees', 19, 'var(--sim-label)', 'start', 800);

    if (v === 0 && !this.drawing) {
      // half of Bhavisha's total, and Dhruv's end dot under it
      const yH = d.y(B65 / 2), x0 = d.x(P ? 52 : 54), xE = d.x(END);
      svg += `<path d="M${f1(x0)} ${f1(yH)}H${f1(xE + 8)}" ${stroke('var(--sim-label)', 3, 'stroke-dasharray:8 6;opacity:0.75')}/>`;
      svg += text(x0 - 6, yH + 7, 'half', 20, 'var(--sim-label)', 'end', 800);
      svg += this.dots(g, END);
      // the callout, top left inside the plot
      const bx = pl.x + 10, by = pl.y + 6, bw = P ? 214 : 226;
      svg += `<rect x="${f1(bx)}" y="${f1(by)}" width="${bw}" height="118" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;opacity:0.96')}/>`
        + `<g class="mk-pop" style="--d:0.1s">${text(bx + 16, by + 28, 'Dhruv has', 20, 'var(--sim-label)', 'start', 700)}`
        + text(bx + 14, by + 74, `${PCT}%`, 46, ink(WHO[1].col), 'start')
        + text(bx + 136, by + 54, 'of her', 19, 'var(--sim-label)', 'start', 700)
        + text(bx + 136, by + 76, 'total', 19, 'var(--sim-label)', 'start', 700)
        + text(bx + 16, by + 106, 'less than half', 22, 'var(--sim-label)', 'start', 800) + '</g>';
      over += `<div class="cr-ab" style="left:${P ? 322 : f1(bx + bw + 74)}px;top:${f1(P ? g.top - 8 : by + 34)}px"><button type="button" class="sv-hit cr-btn cr-quiet" data-act="replay">replay</button></div>`;
    }

    if (v === 1) {
      const x = d.x(age);
      svg += `<path d="M${f1(x)} ${f1(pl.y + 2)}V${f1(pl.y + pl.h)}" ${stroke(ACC, 3.5, 'stroke-dasharray:9 6')}/>`;
      svg += `<circle cx="${f1(x)}" cy="${f1(pl.y + pl.h)}" r="13" ${fill(ACC, 'stroke:var(--sim-bg-surface);stroke-width:3.5')}/>`;
      svg += this.dots(g, age);
      const c = this.ctrlBox(g);
      svg += `<rect x="${f1(c.x0)}" y="${f1(c.y0)}" width="${f1(c.x1 - c.x0)}" height="${f1(c.y1 - c.y0)}" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;opacity:0.96')}/>`;
      svg += text((c.x0 + c.x1) / 2, c.y1 - 12, 'or drag on the chart', 18, MUTED, 'middle', 700);
      const dn = this.age <= 25, up = this.age >= END;
      over += `<div class="cr-row" style="left:${f1((c.x0 + c.x1) / 2)}px;top:${f1(c.y0 + 34)}px">`
        + `<button type="button" class="sv-hit cr-btn" data-act="age" data-val="-5" aria-label="5 years younger" aria-disabled="${dn}">-5</button>`
        + `<span class="cr-age" aria-live="polite">age ${this.age}</span>`
        + `<button type="button" class="sv-hit cr-btn" data-act="age" data-val="5" aria-label="5 years older" aria-disabled="${up}">+5</button></div>`;
    }

    if (v === 2) {
      // the two brackets at 65: the big gap between the totals, the tiny one between the paid-in lines
      const bx = d.x(END) + (P ? 22 : 26);
      svg += bracket(bx, d.y(B65), d.y(D65), 'var(--sim-label)', 5);
      svg += bracket(bx, d.y(40000), d.y(30000), MUTED, 4);
      svg += this.dots(g, END);
      // where the paid-in lines end
      [40000, 30000].forEach((m, i) => {
        svg += `<circle cx="${f1(d.x(END))}" cy="${f1(d.y(m))}" r="6" ${fill('var(--sim-bg-surface)', `stroke:${WHO[i].col};stroke-width:3.5`)}/>`;
      });
      svg += text(pl.x + 14, d.y(52000), 'paid in', 21, MUTED, 'start', 800);
    }
    return { svg, over };
  }

  /** End dots on both curves at this age (only where a curve has started). */
  dots(g, age) {
    return WHO.map((w) => {
      if (age < w.from) return '';
      return `<circle cx="${f1(g.d.x(age))}" cy="${f1(g.d.y(valAt(w, age)))}" r="9" ${fill(w.col, 'stroke:var(--sim-bg-surface);stroke-width:3.5')}/>`;
    }).join('');
  }

  animate(st, t) {
    const g = this.geo(st), f = g.f, k = g.k, live = this.live, v = this.stepIndex;
    axesOnSvg(live, 'ax', f, 99, { size: Math.round(18 * k), fmtY: group });
    const lin = (u) => u;
    const span = END - 25;
    if (v === 2) {
      WHO.forEach((w) => {
        plotLineSvg(live, `paid-${w.key}`, toScreen(f, [[w.from, 0], [END, (END - w.from) * DEP]]), 99,
          { col: `color-mix(in oklab, ${w.col} 45%, var(--sim-label-muted))`, width: 4 * k, head: false, lip: false });
      });
      // dash the paid-in lines
      for (const w of WHO) {
        const e = live.get(`paid-${w.key}|line`);
        if (e) e.style.strokeDasharray = `${f1(10 * k)} ${f1(8 * k)}`;
      }
    }
    WHO.forEach((w) => {
      const lo = v === 1 ? Math.min(Math.max(this.age, w.from), END) : END;
      if (v === 1) {
        // the part after the chosen age, faint
        const rest = [];
        for (let a = Math.max(lo, w.from); a <= END; a++) rest.push([a, valAt(w, a)]);
        if (rest.length > 1) plotLineSvg(live, `rest-${w.key}`, toScreen(f, rest), 99, { col: `color-mix(in oklab, ${w.col} 30%, var(--sim-bg-surface))`, width: 4 * k, head: false, lip: false });
      }
      const pts = [];
      for (let a = w.from; a <= lo; a++) pts.push([a, valAt(w, a)]);
      if (pts.length < 2) return;
      const dur = DRAW_S * (END - w.from) / span, delay = DRAW_S * (w.from - 25) / span;
      plotLineSvg(live, `c-${w.key}`, toScreen(f, pts), this.drawing ? t : 99,
        { col: w.col, width: 6 * k, by: 'x', dur, delay, ease: lin, head: this.drawing, headR: 8 * k });
    });
  }

  testState() {
    const v = this.stepIndex, age = v === 1 ? this.age : END;
    return { view: v, age, bhavisha: valAt(WHO[0], age), dhruv: valAt(WHO[1], age), b65: B65, d65: D65, gap: GAP, pct: PCT, drawing: this.drawing };
  }
}
