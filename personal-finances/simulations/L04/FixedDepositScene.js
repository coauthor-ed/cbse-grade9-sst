/**
 * FixedDepositScene - L04 s04 "Fixed Deposits" (2 beats). SvgScene, design 560 x 500 landscape, 390 x 620 portrait.
 * A made-up deposit: Rs 10,000 for 3 years at 7% a year, interest added each year (compounding):
 * 10,700, 11,449, 12,250.43. Early exit (made-up): 6% for the time held, so after 1 year Rs 10,600, not 10,700.
 *   b0 A rate fixed in advance: the deposit slip (Rs 10,000, 3 years, 7% a year, made-up rate) and four bars on a
 *      timeline (deposit day, 1 year, 2 years, 3 years). Each year's interest is a green slice on top with its
 *      "+Rs" line (earlier years' interest stays on, paler); the bars rise one year at a time (replay). Pill "rate fixed for 3 years".
 *   b1 Maturity period: a bracket from "deposit day" to "maturity date", labelled "maturity period: 3 years".
 *      A "take out early" button (in the figure): the deposit stops at 1 year, Rs 10,600 instead of Rs 10,700
 *      ("made-up rates"); years 2 and 3 go faint and dashed. Pressing again keeps it to maturity. Three chips:
 *      PPF, NSC, Sukanya Samriddhi Yojana, "backed by the government". Cold start: kept to maturity.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS, TONE, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const P0 = 10000, RATE = 0.07, EARLY = 0.06, YEARS = 3;
const AMT = [0, 1, 2, 3].map((n) => Math.round(P0 * (1 + RATE) ** n * 100) / 100);   // 10000 10700 11449 12250.43
const EARLY1 = Math.round(P0 * (1 + EARLY));                                          // 10600
const MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', INK = 'var(--sim-label)';
const ACC_INK = shade('var(--sim-accent)', 62);
const BASE = 'color-mix(in oklab, var(--sim-series-7) 34%, var(--sim-bg-surface))';
const SAVE = TONE.save, SAVE_INK = shade(TONE.save, 62);
const STEP_S = 0.6;
/** Rupees with paise when there are any: 12250.43 -> sign + 12,250.43. */
const rp = (n) => { const r = Math.round(n * 100) / 100, p = Math.round((r % 1) * 100); return rs(Math.floor(r)) + (p ? '.' + String(p).padStart(2, '0') : ''); };
const LABELS = ['deposit day', '1 year', '2 years', '3 years'];

const CSS = `
.fd-ab { position: absolute; transform: translate(-50%, -50%); }
.fd-btn { min-height: 48px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 22px/1.1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border: 2.5px solid color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.fd-btn--quiet { background: var(--sim-bg-surface); color: var(--sim-label); border-color: var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); font-size: 20px; }
.fd-btn:active { transform: translateY(3px); box-shadow: none; }
.fd-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:2.5`)}/>`;
const pill = (cx, cy, label, size = 21, o = {}) => {
  const w = label.length * size * 0.56 + 28, h = size + 18;
  return `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(o.bg ?? 'color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface))', `stroke:${o.edge ?? 'var(--sim-accent)'};stroke-width:2.5`)}/>`
    + text(cx, cy + size * 0.36, label, size, o.ink ?? ACC_INK);
};

export class FixedDepositScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up fixed deposit: 10,000 rupees for 3 years at 7% a year, a rate fixed for the whole 3 years. Each year interest is added: 10,700 rupees after 1 year, 11,449 after 2 years and 12,250.43 after 3 years. The maturity period runs from the deposit day to the maturity date, 3 years. Taken out early after 1 year at a made-up lower rate of 6%, it pays 10,600 rupees instead of 10,700. The government also backs PPF, NSC and the Sukanya Samriddhi Yojana.';

  async setup() {
    this.early = false;
    this.shown = 4;
    this.rising = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.rise();
      else if (b.dataset.act === 'early') { this.early = !this.early; this.repaint(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.rising = false; }

  enter(step) {
    this.clear();
    this.early = false;
    this.shown = 4;
    if (step === 0) this.after(0.05, () => this.rise());
  }

  /** b0: the bars come in one year at a time, STEP_S apart; the rest state has all four. */
  rise() {
    if (this.stepIndex !== 0) return;
    this.clear();
    this.rising = true;
    this.shown = 1;
    for (let i = 2; i <= 4; i++) this.after(STEP_S * (i - 1), () => { this.shown = i; this.repaint(); });
    this.after(STEP_S * 3 + 0.5, () => { this.rising = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.rising) return false;
    this.clear();
    this.shown = 4;
    this.repaint();
    return true;
  }

  busy() { return this.rising; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 500) * st.W / (st.portrait ? 390 : 560)); }

  lay(P) {
    return P
      ? { DW: 390, DH: 620, xs: [50, 134, 220, 320], base: 420, sc: 0.012, bw: 60, small: 20, big: 21, yl: 446, br: 486, brl: 516 }
      : { DW: 560, DH: 500, xs: [90, 215, 340, 470], base: 400, sc: 0.013, bw: 80, small: 22, big: 28, yl: 428, br: 446, brl: 484 };
  }

  paint(st) {
    const P = st.portrait, L = this.lay(P), k = st.W / L.DW, v = this.stepIndex;
    let svg = '', over = '';

    // the deposit slip
    const sw = P ? 366 : 250, sh = P ? 100 : (v === 0 ? 150 : 100);
    svg += panel(12, 10, sw, sh);
    svg += civicSvg('bank', 50, 62, { w: 60 });
    svg += text(92, 36, 'fixed deposit', 20, MUTED, 'start', 700);
    svg += text(92, 84, rs(P0), 34, INK, 'start');
    if (P) {
      svg += text(366, 42, '3 years', 23, INK, 'end') + text(366, 72, '7% a year', 23, INK, 'end');
      svg += text(366, 100, 'made-up rate', 19, MUTED, 'end', 700);
    } else if (v === 0) {
      svg += text(30, 120, '3 years, 7% a year', 23, INK, 'start') + text(30, 146, 'made-up rate', 19, MUTED, 'start', 700);
    }

    // the timeline bars: the deposit, then each year's interest stacked on top (older interest paler)
    const early = v === 1 && this.early;
    for (let i = 0; i < 4; i++) {
      if (v === 0 && i >= this.shown) continue;
      const x = L.xs[i], key = early && i === 1, gone = early && i > 1;
      const amt = key ? EARLY1 : AMT[i], prev = i ? AMT[i - 1] : 0;
      const top = L.base - amt * L.sc, x0 = x - L.bw / 2;
      const anim = v === 0 && this.rising && i === this.shown - 1 ? ' class="mk-rise"' : '';
      let g = '';
      if (gone) {
        g += `<rect x="${f1(x0)}" y="${f1(top)}" width="${L.bw}" height="${f1(L.base - top)}" rx="6" ${fill('none', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:7 6')}/>`;
      } else {
        const b0 = L.base - P0 * L.sc;
        g += `<rect x="${f1(x0)}" y="${f1(b0)}" width="${L.bw}" height="${f1(L.base - b0)}" rx="6" ${fill(BASE, 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
        for (let j = 1; j <= i; j++) {
          const lo = key ? P0 : AMT[j - 1], hi = key ? EARLY1 : AMT[j];
          const yh = L.base - hi * L.sc, yl = L.base - lo * L.sc, newest = j === i;
          g += `<rect x="${f1(x0)}" y="${f1(yh)}" width="${L.bw}" height="${f1(yl - yh)}" rx="2" ${fill(newest ? SAVE : `color-mix(in oklab, ${SAVE} 50%, var(--sim-bg-surface))`, `stroke:${shade(SAVE, 66)};stroke-width:2`)}/>`;
        }
      }
      svg += `<g${anim}${gone ? ' style="opacity:0.45"' : ''}>${g}</g>`;
      const last = i === 3 && !early, big = last || key;
      if (!(gone && P)) svg += `<g${anim ? ' class="mk-pop" style="--d:0.3s"' : ''}${gone ? ' style="opacity:0.4"' : ''}>`
        + text(x, top - (i ? (big ? 40 : 36) : 12), rp(amt), big ? L.big : L.small, key ? ACC_INK : INK)
        + (i ? text(x, top - 10, `+${rp(amt - prev)}${key && !P ? ' at 6%' : ''}`, 20, key ? ACC_INK : SAVE_INK) : '') + '</g>';
      const lit = i === 0 || (v === 1 && i === 3 && !early) || key;
      if (P && i === 0) svg += text(x, L.yl, 'deposit', 20, INK, 'middle', 700) + text(x, L.yl + 25, 'day', 20, INK, 'middle', 700);
      else svg += text(x, L.yl, LABELS[i], 20, lit ? INK : MUTED, 'middle', 700);
    }
    svg += `<path d="M${L.xs[0] - L.bw / 2 - 12} ${L.base}H${L.xs[3] + L.bw / 2 + 12}" ${stroke('var(--sim-stroke)', 3)}/>`;

    if (v === 0) {
      const cx = P ? 195 : 412;
      svg += pill(cx, P ? 140 : 40, 'rate fixed for 3 years', 22);
      if (!P) svg += text(cx, 90, '7% in year 1, 2 and 3', 21, INK, 'middle', 700);
      if (!this.rising) over += `<div class="fd-ab" style="left:${P ? 195 : 412}px;top:${P ? 196 : 138}px"><button type="button" class="sv-hit fd-btn fd-btn--quiet" data-act="replay">replay</button></div>`;
    } else {
      // the maturity bracket; early: the part actually held is solid, the rest dashed
      const x0 = L.xs[0], x1 = L.xs[1], x3 = L.xs[3], y = L.br;
      if (early) {
        svg += `<path d="M${x0} ${y - 10}V${y}H${x1}V${y - 10}" ${stroke(ACC, 5)}/>`
          + `<path d="M${x1} ${y}H${x3}V${y - 10}" ${stroke(MUTED, 3.5, 'stroke-dasharray:8 7')}/>`;
        svg += text((x0 + x3) / 2, L.brl, 'out after 1 year, before maturity', P ? 20 : 22, ACC_INK);
      } else {
        svg += `<path d="M${x0} ${y - 10}V${y}H${x3}V${y - 10}" ${stroke(INK, 4)}/>`;
        svg += text((x0 + x3) / 2, L.brl, 'maturity period: 3 years', P ? 22 : 24, INK);
      }
      // the button and its note
      const bx = P ? 120 : 110, by = P ? 148 : 140;
      over += `<div class="fd-ab" style="left:${bx}px;top:${by}px"><button type="button" class="sv-hit fd-btn${early ? ' fd-btn--quiet' : ''}" data-act="early" aria-pressed="${early}">${early ? 'keep to maturity' : 'take out early'}</button></div>`;
      svg += text(P ? 226 : 92, P ? 156 : 192, early ? (P ? 'at 6%, made-up' : 'made-up rates') : 'out at 1 year?', 20, early ? ACC_INK : MUTED, P ? 'start' : 'middle', 700);
      // the government-backed ones
      const chip = (cx, cy, t, size) => pill(cx, cy, t, size, { bg: 'var(--sim-bg-surface)', edge: 'var(--sim-stroke)', ink: INK });
      if (P) {
        svg += chip(42, 556, 'PPF', 20) + chip(114, 556, 'NSC', 20) + text(156, 563, 'government-backed', 20, MUTED, 'start', 700);
        svg += chip(195, 598, 'Sukanya Samriddhi Yojana', 20);
      } else {
        svg += text(412, 34, 'backed by the government', 20, MUTED, 'middle', 700);
        svg += chip(354, 72, 'PPF', 22) + chip(458, 72, 'NSC', 22) + chip(412, 118, 'Sukanya Samriddhi Yojana', 21);
      }
    }
    return { svg: `<g transform="scale(${k.toFixed(4)})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${L.DW}px;height:${L.DH}px;transform:scale(${k.toFixed(4)});transform-origin:0 0">${over}</div>` };
  }

  testState() {
    return { view: this.stepIndex, early: this.early, amounts: AMT, early1: EARLY1, shown: this.shown, rising: this.rising };
  }
}
