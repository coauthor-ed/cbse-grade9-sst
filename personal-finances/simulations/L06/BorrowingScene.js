/**
 * BorrowingScene - L06 s04 "Borrowing" (3 beats). SvgScene, design 560 x 490 landscape, 390 x 620 portrait.
 * One borrower (a young woman, FinPeople cast registered here) at a bank counter (SimCivic bank, book Fig 5.7).
 * Made-up numbers: borrow Rs 50,000 now, pay back Rs 56,000 over two years (Rs 6,000 interest).
 *   b0 a loan: bank -> tag "loan Rs 50,000" -> the borrower; two cards: now gets Rs 50,000 / over 2 years pays
 *      back Rs 56,000; "Rs 6,000 is the interest".
 *   b1 two loans of Rs 50,000: education loan (nursing course; income line steps up for years, "productive")
 *      vs phone and TV (value line falls while payments go on, "debt burden"). Payments strip (2 years) in
 *      both cards, so the only difference is what the money buys.
 *   b2 a checklist card: Needed? / Can repay on time? / Monthly payment fits? Tap a box to tick or untick;
 *      all three ticked -> "responsible borrowing", else "not yet: wait, or borrow less".
 * Rest / cold start: everything drawn, all three ticked; every beat plays in on entry, with replay.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS, rs, tag } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';

registerCast('l06borrower', { name: 'Borrower', series: 5, role: 'adult', i: 23,
  look: { outfit: 'kurti', hairStyle: 'long', top: 's5', bottom: 'cream', dupatta: true, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 0.96 } });

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const LOAN = 50000, BACK = 56000, INTEREST = BACK - LOAN;     // made-up: 6,000 over two years
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const GOOD = 'var(--sim-series-3)', GOOD_INK = 'color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label))';
const BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
const CHECKS = ['Needed?', 'Can repay on time?', 'Monthly payment fits?'];
// Shapes only (no numbers on the mini charts): income in relative units over 8 years; value of the phone and TV.
const INCOME = [[0, 1], [2, 1], [2, 1.7], [5, 1.7], [5, 2.2], [8, 2.2]];
const VALUE = [[0, 2.2], [1, 1.4], [2, 0.9], [3, 0.6], [4, 0.4], [8, 0.2]];

const CSS = `
.bw-ab { position: absolute; transform: translate(-50%, -50%); }
.bw-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.bw-btn:active { transform: translateY(3px); box-shadow: none; }
.bw-btn:focus-visible, .bw-row:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.bw-row { position: absolute; background: transparent; border: 0; padding: 0; margin: 0; cursor: pointer; border-radius: 14px; }
svg .bw-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: bw-draw var(--dur, 1s) ease-out forwards; animation-delay: var(--d, 0s); }
@keyframes bw-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { svg .bw-draw { animation: none; stroke-dashoffset: 0; } }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
const arrow = (x0, y0, x1, y1, col, w = 4) => {
  const a = Math.atan2(y1 - y0, x1 - x0), h = 12;
  const p = (da) => `${f1(x1 - h * Math.cos(a + da))} ${f1(y1 - h * Math.sin(a + da))}`;
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}M${p(0.5)}L${f1(x1)} ${f1(y1)}L${p(-0.5)}" ${stroke(col, w, 'fill:none;stroke-linecap:round;stroke-linejoin:round')}/>`;
};
const pill = (cx, cy, label, col, ink, size = 22) => {
  const w = label.length * size * 0.56 + size * 1.6;
  return `<rect x="${f1(cx - w / 2)}" y="${f1(cy - size * 0.95)}" width="${f1(w)}" height="${f1(size * 1.9)}" rx="${f1(size * 0.95)}" ${fill(`color-mix(in oklab, ${col} 20%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:3`)}/>`
    + text(cx, cy + size * 0.36, label, size, ink);
};
/** A simple television: a screen on a short stand (no face). */
const tv = (x, y, w) => {
  const h = w * 0.62;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill('var(--sim-label)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
    + `<rect x="${f1(x - w / 2 + 5)}" y="${f1(y - h + 5)}" width="${f1(w - 10)}" height="${f1(h - 10)}" rx="3" ${fill('color-mix(in oklab, var(--sim-series-1) 55%, var(--sim-bg-surface))')}/>`
    + `<path d="M${f1(x - w * 0.18)} ${f1(y + 9)}H${f1(x + w * 0.18)}M${f1(x)} ${f1(y)}V${f1(y + 9)}" ${stroke('var(--sim-label)', 4, 'stroke-linecap:round')}/>`;
};
const calm = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class BorrowingScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Made-up numbers. A young woman takes a loan at a bank: she gets 50,000 rupees now and pays back 56,000 rupees over two years; 6,000 rupees is the interest. Two loans of 50,000 rupees: an education loan for a nursing course, after which her income steps up for many years (productive), and a loan for a phone and a TV, whose value falls while the payments go on (a debt burden). A checklist for responsible borrowing: Needed? Can repay on time? Monthly payment fits? Tap a box to tick or untick it.';

  async setup() {
    this.fresh = false;
    this.ticks = [true, true, true];
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      const a = b?.dataset.act;
      if (a === 'replay') this.run();
      else if (a === 'tick') { this.clear(); const i = Number(b.dataset.val); this.ticks[i] = !this.ticks[i]; this.repaint(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.ticks = [true, true, true]; this.after(0.05, () => this.run()); }

  run() {
    this.clear();
    this.ticks = [true, true, true];
    if (calm()) { this.repaint(); return; }
    this.fresh = true;
    if (this.stepIndex === 2) {
      this.ticks = [false, false, false];
      CHECKS.forEach((_, i) => this.after(0.5 + i * 0.6, () => { this.ticks[i] = true; this.lastTick = i; this.repaint(); }));
      this.after(0.5 + 3 * 0.6 + 0.4, () => { this.fresh = false; this.repaint(); });
    } else {
      this.after(2.6, () => { this.fresh = false; this.repaint(); });
    }
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.ticks = [true, true, true];
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  repaint() { super.repaint(); paintPeople(this); }

  anim(cls, d, body, extra = '') { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s;${extra}"` : ''}>${body}</g>`; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4);
    const v = this.stepIndex;
    const out = v === 0 ? this.paintLoan(P) : v === 1 ? this.paintTwo(P) : this.paintCheck(P);
    let over = out.over ?? '';
    if (!this.fresh && v !== 2) over += `<div class="bw-ab" style="left:${P ? 330 : 500}px;top:${P ? 594 : 462}px"><button type="button" class="sv-hit bw-btn" data-act="replay">replay</button></div>`;
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  paintLoan(P) {
    let svg = '', over = '';
    const G = P ? { bank: [92, 212, 160], who: [320, 212, 150], tag: [195, 248, 180], ground: 214, made: [370, 28] }
      : { bank: [112, 236, 200], who: [460, 236, 170], tag: [312, 150, 196], ground: 238, made: [548, 28] };
    svg += text(G.made[0], G.made[1] + 6, 'made-up numbers', 18, MUTED, 'end', 700);
    svg += `<path d="M12 ${G.ground}H${P ? 378 : 548}" ${stroke('var(--sim-stroke)', 2.5)}/>`;
    svg += civicSvg('bank', G.bank[0], G.bank[1], { w: G.bank[2] });
    over += personSlot('l06borrower', { x: G.who[0], y: G.who[1], h: G.who[2], facing: -1, mood: 'smile' });
    const [tx, ty, tw] = G.tag;
    if (P) {
      svg += this.anim('mk-pop', 0.4, arrow(180, 150, 280, 150, ACC));
      svg += this.anim('mk-pop', 0.6, tag(tx, ty + 22, 'loan', LOAN, { w: tw, tone: 'save', valueSize: 30 }));
    } else {
      svg += this.anim('mk-pop', 0.4, tag(tx, ty, 'loan', LOAN, { w: tw, tone: 'save', valueSize: 32 }));
      svg += this.anim('mk-pop', 0.7, arrow(tx - tw / 2 - 2, ty + 54, tx + tw / 2 + 30, ty + 54, ACC));
    }
    // now -> later
    const C = P ? [[16, 330, 358, 92], [16, 436, 358, 92]] : [[24, 268, 240, 120], [296, 268, 240, 120]];
    const cards = [['now she gets', rs(LOAN), INK], ['over 2 years she pays back', rs(BACK), BAD_INK]];
    cards.forEach(([lab, amt, ink], i) => {
      const [x, y, w, h] = C[i];
      const lines = !P && i === 1 ? ['over 2 years', 'she pays back'] : [lab];
      let body = panel(x, y, w, h, { edge: i ? BAD : GOOD, sw: 3 });
      lines.forEach((ln, j) => { body += text(x + w / 2, y + 30 + j * 24, ln, 20, MUTED, 'middle', 700); });
      body += text(x + w / 2, y + h - (P ? 18 : 22), amt, P ? 32 : 36, ink);
      svg += this.anim('mk-pop', (1.0 + i * 0.5).toFixed(1), body);
    });
    if (!P) svg += this.anim('mk-pop', 1.4, arrow(268, 328, 290, 328, MUTED, 3.5));
    svg += this.anim('mk-pop', 2.0, P ? text(20, 572, `${rs(INTEREST)} is the interest`, 25, ACC_INK, 'start')
      : text(24, 440, `${rs(INTEREST)} is the interest`, 28, ACC_INK, 'start'));
    return { svg, over };
  }

  /** A mini chart (shape only): line pts over years 0..8, payments strip for years 0..2. */
  mini(x, y, w, h, pts, col, label, d) {
    const px = (t) => x + t / 8 * w, py = (v) => y + h - v / 2.4 * h;
    let svg = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 72%, transparent)')}/>`;
    for (let t = 2; t < 8; t += 2) svg += `<path d="M${f1(px(t))} ${f1(y)}V${f1(y + h)}" ${stroke('var(--sim-stroke)', 1.2, 'opacity:0.35')}/>`;
    svg += `<path d="M${f1(x)} ${f1(y - 4)}V${f1(y + h)}H${f1(x + w)}" ${stroke(INK, 2.5, 'fill:none')}/>`;
    const path = pts.map(([t, v], i) => `${i ? 'L' : 'M'}${f1(px(t))} ${f1(py(v))}`).join('');
    svg += this.anim('bw-draw', d, `<path d="${path}" pathLength="1" ${stroke(col, 5, 'fill:none;stroke-linejoin:round;stroke-linecap:round')}/>`, '--dur:1.0s');
    const [et, ev] = pts[pts.length - 1];
    svg += text(px(et), py(ev) < y + 30 ? py(ev) + 28 : py(ev) - 12, label, 20, INK, 'end');
    // payments: 24 small marks under the axis, years 0..2
    let marks = '';
    for (let m = 0; m < 24; m++) marks += `<rect x="${f1(px(m / 12) + 0.6)}" y="${f1(y + h + 8)}" width="${f1(w / 96 - 1.2)}" height="12" rx="2" ${fill(BAD, 'opacity:0.8')}/>`;
    svg += marks + text(px(2) + 8, y + h + 20, 'payments', 18, BAD_INK, 'start', 700);
    svg += text(x + w, y + h + 44, 'years', 18, MUTED, 'end', 700);
    return svg;
  }

  paintTwo(P) {
    let svg = '';
    const cards = [
      { title: 'education loan', sub: 'nursing course', pic: 'book', pts: INCOME, col: GOOD, label: 'income', chip: 'productive', chipCol: GOOD, chipInk: GOOD_INK },
      { title: 'phone and TV', sub: 'not really needed', pic: 'tv', pts: VALUE, col: 'var(--sim-series-8)', label: 'value', chip: 'debt burden', chipCol: BAD, chipInk: BAD_INK },
    ];
    cards.forEach((c, i) => {
      const d = i * 0.9;
      if (P) {
        const x = 16, y = 14 + i * 278, w = 358, h = 266;
        svg += panel(x, y, w, h, { edge: c.chipCol, sw: 3 });
        svg += text(x + 16, y + 34, c.title, 23, INK, 'start') + text(x + w - 16, y + 34, rs(LOAN), 25, INK, 'end');
        svg += (c.pic === 'book' ? icon('book', x + 34, y + 70, 40, 3) : icon('phone', x + 26, y + 70, 36, 6) + tv(x + 62, y + 80, 40)) + text(x + (c.pic === 'book' ? 62 : 92), y + 77, c.sub, 19, MUTED, 'start', 700);
        svg += this.mini(x + 22, y + 104, 190, 110, c.pts, c.col, c.label, d + 0.3);
        // the whole chip on one line, inside the card (right edge x + w)
        svg += this.anim('mk-pop', d + 1.3, pill(x + 282, y + 164, c.chip, c.chipCol, c.chipInk, 16));
      } else {
        const x = 24 + i * 268, y = 14, w = 244, h = 420;
        svg += panel(x, y, w, h, { edge: c.chipCol, sw: 3 });
        svg += text(x + w / 2, y + 36, c.title, 23, INK) + text(x + w / 2, y + 76, rs(LOAN), 30, INK);
        svg += (c.pic === 'book' ? icon('book', x + w / 2, y + 112, 44, 3) : icon('phone', x + w / 2 - 28, y + 112, 38, 6) + tv(x + w / 2 + 22, y + 126, 46)) + text(x + w / 2, y + 162, c.sub, 19, MUTED, 'middle', 700);
        svg += this.mini(x + 22, y + 184, w - 44, 130, c.pts, c.col, c.label, d + 0.3);
        svg += this.anim('mk-pop', d + 1.3, pill(x + w / 2, y + 388, c.chip, c.chipCol, c.chipInk, 23));
      }
    });
    return { svg };
  }

  paintCheck(P) {
    let svg = '', over = '';
    const C = P ? { x: 16, y: 16, w: 358, h: 330, row0: 110, dy: 76, size: 24 } : { x: 24, y: 20, w: 380, h: 350, row0: 116, dy: 82, size: 26 };
    svg += panel(C.x, C.y, C.w, C.h);
    svg += text(C.x + 22, C.y + 48, 'before a loan', P ? 26 : 28, INK, 'start');
    CHECKS.forEach((q, i) => {
      const y = C.y + C.row0 + i * C.dy, on = this.ticks[i], bx = C.x + 24;
      const box = `<rect x="${bx}" y="${y - 26}" width="52" height="52" rx="12" ${fill(on ? GOOD : 'var(--sim-bg-surface)', `stroke:${on ? GOOD_INK : 'var(--sim-stroke)'};stroke-width:3`)}/>`
        + (on ? `<path d="M${bx + 13} ${y + 1}l9 9l18 -20" ${stroke('var(--sim-bg-surface)', 6, 'fill:none;stroke-linecap:round;stroke-linejoin:round')}/>` : '');
      svg += (this.fresh && on && this.lastTick === i ? `<g class="mk-pop">${box}</g>` : box) + text(bx + 70, y + 9, q, C.size, on ? INK : MUTED, 'start');
      over += `<button type="button" class="sv-hit bw-row" data-act="tick" data-val="${i}" aria-pressed="${on}" aria-label="${q}" style="left:${C.x + 10}px;top:${y - 34}px;width:${C.w - 20}px;height:68px"></button>`;
    });
    const all = this.ticks.every(Boolean);
    const cy = P ? 392 : 420;
    if (all) svg += pill(P ? 195 : 214, cy, 'responsible borrowing', GOOD, GOOD_INK, P ? 22 : 24);
    else svg += pill(P ? 195 : 214, cy, 'not yet: wait, or borrow less', BAD, BAD_INK, P ? 19 : 21);
    over += personSlot('l06borrower', { x: P ? 195 : 482, y: P ? 600 : 400, h: P ? 150 : 210, facing: P ? 0 : -1, mood: all ? 'happy' : 'think' });
    return { svg, over };
  }

  testState() {
    return { view: this.stepIndex, fresh: this.fresh, ticks: this.ticks.slice(), loan: LOAN, back: BACK, interest: INTEREST };
  }
}
