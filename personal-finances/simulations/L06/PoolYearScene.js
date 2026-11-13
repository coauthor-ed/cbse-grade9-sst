/**
 * PoolYearScene - L06 s02 "How Insurance Works" (3 beats, observe after a deferred predict). SvgScene, design
 * 560 x 490 landscape, 390 x 620 portrait. Made-up numbers: 1,000 families (40 x 25 dots) each pay Rs 500 a
 * month, so Rs 5,00,000 a month comes into one pool, Rs 60,00,000 in 12 months.
 *   b0 premiums in: the month counter runs 1..12 (play / +1 month); each month one block of Rs 5,00,000 drops
 *      into the pool bar; key number Rs 60,00,000 in 12 months.
 *   b1 claims: 25 dots light up (hospital), Rs 80,000 each = Rs 20,00,000 paid to them. The pool bar splits
 *      into three labelled parts (made-up split): paid to 25 families Rs 20,00,000, company costs
 *      Rs 15,00,000, kept for years with more claims Rs 25,00,000. Never a refund.
 *   b2 risk sharing: all 1,000 dots turn to "covered all year" (975 never claimed). Two cards: one family
 *      alone, a Rs 80,000 bill empties its savings (years to recover); in the pool, Rs 6,000 a year and the
 *      bill is paid.
 * Rest / cold start: b0 at month 12, b1 and b2 fully drawn; every beat plays in on entry, with replay.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const FAMILIES = 1000, COLS = 40, ROWS = 25, PREMIUM = 500, MONTHS = 12;
const MONTH_IN = FAMILIES * PREMIUM;            // 5,00,000
const YEAR_IN = MONTH_IN * MONTHS;              // 60,00,000
const SICK_N = 25, BILL = 80000, CLAIMS = SICK_N * BILL;   // 20,00,000
const COSTS = 1500000, KEPT = YEAR_IN - CLAIMS - COSTS;   // made-up split: 15,00,000 and 25,00,000
const YEAR_EACH = PREMIUM * MONTHS;             // 6,000
const TICK = 0.45;                              // seconds per month
// 25 families who need hospital care: a fixed spread (a small LCG, same every mount).
const SICK = (() => { const s = new Set(); let v = 11; while (s.size < SICK_N) { v = (v * 1103515245 + 12345) % 2147483648; const i = (v >> 8) % FAMILIES; if (i % COLS > 1 && i % COLS < COLS - 2) s.add(i); } return s; })();

const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)';
const FAM = 'var(--sim-series-1)', BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
const COVER = 'var(--sim-series-3)', COVER_INK = 'color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label))';
const COIN = 'var(--sim-series-2)', KEEP = 'var(--sim-series-7)';
const COST = 'color-mix(in oklab, var(--sim-label-muted) 45%, var(--sim-bg-surface))';
const ACC_INK = shade('var(--sim-accent)', 62);

const CSS = `
.py-ab { position: absolute; transform: translate(-50%, -50%); display: flex; gap: 10px; }
.py-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.py-btn--go { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: color-mix(in oklab, var(--sim-accent) 70%, black);
  box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.py-btn:active { transform: translateY(3px); box-shadow: none; }
.py-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .py-drain { transform-box: fill-box; transform-origin: left center; animation: py-drain 1.1s ease-in both; animation-delay: var(--d, 0s); }
@keyframes py-drain { 0% { transform: none; } 100% { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) { svg .py-drain { animation: none; transform: scaleX(0); } }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
const btn = (act, label, go) => `<button type="button" class="sv-hit py-btn${go ? ' py-btn--go' : ''}" data-act="${act}">${label}</button>`;
const calm = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class PoolYearScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Made-up numbers. 1,000 families shown as dots each pay a premium of 500 rupees a month into one pool: 5,00,000 rupees a month, 60,00,000 rupees in 12 months. This year 25 families need hospital care, 80,000 rupees each, so the pool pays 20,00,000 rupees to them. In a made-up split, 15,00,000 rupees pays the company\'s costs and 25,00,000 rupees is kept for years with more claims. One family alone would have its savings emptied by an 80,000 rupee bill; in the pool it pays 6,000 rupees a year and the bill is paid. All 1,000 families were covered all year, including the 975 that never claimed.';

  async setup() {
    this.fresh = false;
    this.month = MONTHS;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      const a = b?.dataset.act;
      if (a === 'replay' || a === 'play') this.run();
      else if (a === 'step') { this.clear(); this.month = this.month >= MONTHS ? 1 : this.month + 1; this.fresh = true; this.repaint(); this.after(0.6, () => { this.fresh = false; this.repaint(); }); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.month = MONTHS; this.after(0.05, () => this.run()); }

  run() {
    this.clear();
    if (calm()) { this.month = MONTHS; this.repaint(); return; }
    this.fresh = true;
    if (this.stepIndex === 0) {
      this.month = 0;
      for (let m = 1; m <= MONTHS; m++) this.after(m * TICK, () => { this.month = m; this.repaint(); });
      this.after(MONTHS * TICK + 0.6, () => { this.fresh = false; this.repaint(); });
    } else {
      this.after(this.stepIndex === 1 ? 3.0 : 2.6, () => { this.fresh = false; this.repaint(); });
    }
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.month = MONTHS;
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  /** Markup that animates on the fresh play only; plain at rest. */
  anim(cls, d, body, extra = '') { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s;${extra}"` : ''}>${body}</g>`; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4);
    const out = this.paintBeat(P, this.stepIndex);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  layout(P) {
    return P ? { gx: 23, gy: 56, pitch: 8.6, r: 3.1, head: [20, 38], corner: [372, 30], bar: [23, 408, 344, 44] }
      : { gx: 24, gy: 64, pitch: 8.8, r: 3.2, head: [24, 46], corner: [548, 30], bar: [24, 322, 516, 46] };
  }

  /** The 1,000 dots; mode 'plain' | 'sick' | 'cover'. */
  dots(G, mode) {
    let svg = '';
    const pos = (i) => [G.gx + (i % COLS + 0.5) * G.pitch, G.gy + (Math.floor(i / COLS) + 0.5) * G.pitch];
    if (mode === 'cover') {
      for (let c = 0; c < COLS; c++) {
        let col = '';
        for (let r = 0; r < ROWS; r++) { const [x, y] = pos(r * COLS + c); col += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${G.r}" ${fill(COVER)}/>`; }
        svg += this.anim('mk-pop', (c * 0.02).toFixed(2), col);
      }
      return svg;
    }
    let base = '';
    for (let i = 0; i < FAMILIES; i++) {
      if (mode === 'sick' && SICK.has(i)) continue;
      const [x, y] = pos(i);
      base += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${G.r}" ${fill(FAM, mode === 'sick' ? 'opacity:0.35' : '')}/>`;
    }
    svg += base;
    if (mode === 'sick') {
      [...SICK].sort((a, b) => a - b).forEach((i, j) => {
        const [x, y] = pos(i);
        svg += this.anim('mk-pop', (0.1 + j * 0.05).toFixed(2), `<circle cx="${f1(x)}" cy="${f1(y)}" r="${G.r + 3}" ${fill(BAD, 'stroke:var(--sim-bg-surface);stroke-width:1.5')}/>`);
      });
    }
    return svg;
  }

  /** The pool bar: 12 month blocks (b0) or three parts (b1). */
  poolBar(G, P, v) {
    const [bx, by, bw, bh] = G.bar;
    let svg = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" ${fill('color-mix(in oklab, var(--sim-label) 6%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:7 6')}/>`;
    const step = bw / MONTHS;
    if (v === 0) {
      for (let m = 0; m < this.month; m++) {
        const blk = `<rect x="${f1(bx + m * step + 2)}" y="${by + 3}" width="${f1(step - 4)}" height="${bh - 6}" rx="7" ${fill(COIN, 'stroke:color-mix(in oklab, var(--sim-series-2) 60%, var(--sim-label));stroke-width:2')}/>`;
        svg += this.fresh && m === this.month - 1 ? `<g class="mk-fly" style="--dy:-130px">${blk}</g>` : blk;
      }
      return svg;
    }
    const parts = [[CLAIMS, BAD], [COSTS, COST], [KEPT, KEEP]];
    let x = bx;
    parts.forEach(([amt, col], i) => {
      const w = bw * amt / YEAR_IN;
      svg += this.anim('mk-pop', (1.5 + i * 0.4).toFixed(2), `<rect x="${f1(x + 2)}" y="${by + 3}" width="${f1(w - 4)}" height="${bh - 6}" rx="7" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:2')}/>`);
      x += w;
    });
    return svg;
  }

  paintBeat(P, v) {
    let svg = '', over = '';
    const G = this.layout(P);
    const [bx, by, bw, bh] = G.bar;
    svg += text(G.head[0], G.head[1], '1,000 families', P ? 24 : 26, INK, 'start');
    svg += this.dots(G, v === 0 ? 'plain' : v === 1 ? 'sick' : 'cover');
    const gBottom = G.gy + ROWS * G.pitch;
    if (v === 0) {
      svg += text(bx, by - 12, 'the pool', 21, INK, 'start');
      svg += text(bx + bw, by - 12, `${rs(MONTH_IN)} a month`, 19, MUTED, 'end', 700);
      svg += text(G.corner[0], G.corner[1] + 6, 'made-up numbers', 18, MUTED, 'end', 700);
      const m = this.month;
      if (P) {
        svg += text(20, gBottom + 34, `${rs(PREMIUM)} a month each`, 23, INK, 'start');
        svg += text(370, gBottom + 34, `month ${m}`, 26, ACC_INK, 'end');
        over += `<div class="py-ab" style="left:195px;top:${gBottom + 74}px">${btn('play', 'play', true)}${btn('step', '+1 month')}</div>`;
        svg += text(195, by + bh + 52, rs(m * MONTH_IN), 38, INK);
        svg += text(195, by + bh + 82, m === MONTHS ? 'in 12 months' : `after ${m} month${m === 1 ? '' : 's'}`, 21, MUTED, 'middle', 700);
      } else {
        const cx = 474;
        svg += text(cx, 92, 'each family', 20, MUTED, 'middle', 700);
        svg += text(cx, 134, rs(PREMIUM), 38, INK);
        svg += text(cx, 162, 'a month', 20, MUTED, 'middle', 700);
        svg += text(cx, 214, 'month', 20, MUTED, 'middle', 700);
        svg += text(cx - 6, 262, String(m), 50, ACC_INK, 'end');
        svg += text(cx + 4, 262, 'of 12', 21, MUTED, 'start', 700);
        svg += text(bx, by + bh + 50, rs(m * MONTH_IN), 38, INK, 'start');
        svg += text(bx, by + bh + 80, m === MONTHS ? 'in 12 months' : `after ${m} month${m === 1 ? '' : 's'}`, 21, MUTED, 'start', 700);
        over += `<div class="py-ab" style="left:432px;top:${by + bh + 50}px">${btn('play', 'play', true)}${btn('step', '+1 month')}</div>`;
      }
      svg += this.poolBar(G, P, 0);
    } else if (v === 1) {
      svg += text(bx, by - 12, 'the pool (made-up split)', 20, INK, 'start');
      svg += this.poolBar(G, P, 1);
      if (P) {
        svg += icon('hospital', 40, gBottom + 34, 44, 'var(--sim-bad)');
        svg += text(70, gBottom + 30, `25 families x ${rs(BILL)}`, 22, INK, 'start');
        svg += this.anim('mk-pop', 1.4, text(70, gBottom + 66, `= ${rs(CLAIMS)} paid`, 28, BAD_INK, 'start'));
      } else {
        const cx = 474;
        svg += icon('hospital', cx, 110, 64, 'var(--sim-bad)');
        svg += text(cx, 172, '25 families', 23, INK);
        svg += text(cx, 200, `${rs(BILL)} each`, 20, MUTED, 'middle', 700);
        svg += this.anim('mk-pop', 1.4, text(cx, 246, rs(CLAIMS), 30, BAD_INK) + text(cx, 272, 'paid to them', 20, MUTED, 'middle', 700));
      }
      const rows = [['paid to 25 families', rs(CLAIMS), BAD, BAD_INK], ['company costs', rs(COSTS), COST, INK], ['kept for years with more claims', rs(KEPT), KEEP, INK]];
      const y0 = by + bh + (P ? 38 : 34), dy = P ? 42 : 33;
      rows.forEach(([label, amt, col, ink], i) => {
        const y = y0 + i * dy;
        const lab = P && i === 2 ? text(52, y, 'kept for years', 20, INK, 'start', 700) + text(52, y + 24, 'with more claims', 20, INK, 'start', 700) : text(52, y, label, 20, INK, 'start', 700);
        svg += this.anim('mk-pop', (1.5 + i * 0.4).toFixed(2), `<rect x="${bx}" y="${y - 17}" width="20" height="20" rx="5" ${fill(col)}/>` + lab + text(bx + bw, y, amt, 23, ink, 'end'));
      });
      if (!this.fresh) over += `<div class="py-ab" style="left:${P ? 330 : 500}px;top:${G.corner[1]}px">${btn('replay', 'replay')}</div>`;
    } else {
      if (P) {
        svg += icon('check', 38, gBottom + 34, 40, 'var(--sim-series-3)');
        svg += this.anim('mk-pop', 0.9, text(66, gBottom + 42, 'all 1,000 covered all year', 23, COVER_INK, 'start'));
        svg += text(66, gBottom + 68, '975 never claimed', 19, MUTED, 'start', 700);
      } else {
        const cx = 474;
        svg += icon('check', cx, 104, 64, 'var(--sim-series-3)');
        svg += this.anim('mk-pop', 0.9, text(cx, 168, 'all 1,000', 30, COVER_INK) + text(cx, 196, 'covered', 21, INK) + text(cx, 220, 'all year', 21, INK));
        svg += text(cx, 256, '975 never', 19, MUTED, 'middle', 700) + text(cx, 278, 'claimed', 19, MUTED, 'middle', 700);
      }
      // two cards: alone vs in the pool
      const cy = P ? gBottom + 90 : by - 14, ch = P ? 196 : 158, cw = P ? 171 : 252;
      const xa = P ? 20 : 24, xb = P ? 199 : 288;
      svg += panel(xa, cy, cw, ch, { edge: BAD, sw: 3 }) + panel(xb, cy, cw, ch, { edge: COVER, sw: 3 });
      const ma = xa + cw / 2, mb = xb + cw / 2;
      svg += P ? text(ma, cy + 30, 'one family', 20, INK) + text(ma, cy + 54, 'alone', 20, INK) : text(ma, cy + 32, 'one family alone', 21, INK);
      const sy = cy + (P ? 70 : 50), sw = cw - 36;
      svg += `<rect x="${f1(xa + 18)}" y="${f1(sy)}" width="${f1(sw)}" height="28" rx="8" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:6 5')}/>`;
      if (this.fresh) svg += `<rect class="py-drain" style="--d:0.6s" x="${f1(xa + 20)}" y="${f1(sy + 2)}" width="${f1(sw - 4)}" height="24" rx="7" ${fill(COVER)}/>`;
      svg += text(ma, sy + 21, 'savings: empty', 17, MUTED, 'middle', 700);
      svg += text(ma, sy + (P ? 66 : 64), `${rs(BILL)} bill`, P ? 26 : 28, BAD_INK);
      svg += P ? text(ma, sy + 96, 'years to', 19, MUTED, 'middle', 700) + text(ma, sy + 118, 'recover', 19, MUTED, 'middle', 700) : text(ma, sy + 94, 'years to recover', 19, MUTED, 'middle', 700);
      svg += P ? text(mb, cy + 30, 'in the', 20, INK) + text(mb, cy + 54, 'pool', 20, INK) : text(mb, cy + 32, 'in the pool', 21, INK);
      svg += this.anim('mk-pop', 1.6, text(mb, sy + (P ? 32 : 30), rs(YEAR_EACH), P ? 30 : 32, INK) + text(mb, sy + (P ? 58 : 58), 'a year', 20, MUTED, 'middle', 700));
      svg += this.anim('mk-pop', 2.0, icon('check', mb - (P ? 50 : 62), sy + (P ? 92 : 88), 30, 'var(--sim-series-3)') + text(mb - (P ? 30 : 42), sy + (P ? 100 : 96), 'bill paid', 21, COVER_INK, 'start'));
      if (!this.fresh) over += `<div class="py-ab" style="left:${P ? 330 : 500}px;top:${G.corner[1]}px">${btn('replay', 'replay')}</div>`;
    }
    return { svg, over };
  }

  testState() {
    return { view: this.stepIndex, fresh: this.fresh, month: this.month, pool: this.month * MONTH_IN, yearIn: YEAR_IN, sick: SICK.size, claims: CLAIMS, costs: COSTS, kept: KEPT, yearEach: YEAR_EACH };
  }
}
