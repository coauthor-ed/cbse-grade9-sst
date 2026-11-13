/**
 * TwoSaversScene - L02 s04 "Priya and Sameer" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 620 portrait.
 * Cast: shared/MoneyKit.js (gullak, coins, tags), shared/FinPeople.js (+ priya and sameer registered here),
 * SimCivic bank, SimIcons calendar.
 *   b0 The same Rs 500, two endings: Priya (left) with a gullak, Sameer (right) with a bank. Both start with
 *      Rs 500; "one year later": Priya's tag stays Rs 500, Sameer's counts up to Rs 540 and "+Rs 40 interest" pops
 *      in the savings colour. Rest / cold start: one year later. "replay" goes back to the start.
 *   b1 Investing: Sameer's Rs 540; a mango tree in years 1-4 (no fruit in year 1, then more each year); two bars:
 *      money grows 8% a year (longer) and prices rise 6% a year (shorter).
 *   b2 Liquidity: a line from "ready any day" to "wait for the year"; Priya's cash at the "any day" end, Sameer's
 *      deposit near the other end, with a calendar: "full Rs 40 after one year".
 * Controls are inside the figure. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, TONE, coinPile, tag, gullak, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast } from '../shared/FinPeople.js';

registerCast('priya', { name: 'Priya', series: 7, role: 'student', i: 11,
  look: { outfit: 'kurti', hairStyle: 'long', top: 's7', bottom: 'cream', dupatta: false, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1 } });
registerCast('sameer', { name: 'Sameer', series: 4, role: 'student', i: 12,
  look: { outfit: 'shirt', hairStyle: 'short', top: 's4', bottom: 'khaki', shoeStyle: 'sneaker', shoe: 'white', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1 } });

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const START = 500, END = 540, RATE = 8, PRICES = 6;
const SAVE_INK = shade(TONE.save, 72);
const BAD = 'var(--sim-bad)';

const CSS = `
.ts-ab { position: absolute; transform: translate(-50%, -50%); }
.ts-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border: 2.5px solid color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.ts-btn--quiet { background: var(--sim-bg-surface); color: var(--sim-label); border-color: var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ts-btn:active { transform: translateY(3px); box-shadow: none; }
.ts-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => iconSvg(name, tone).replace(' width="48" height="48"', '').replace('<svg ', `<svg x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${s}" height="${s}" `);

/** A small mango tree, (x, y) = ground under the trunk, s = scale (1: about 150 tall); n mangoes. No face. */
function mangoTree(x, y, s, n) {
  const bark = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label))', leaf = 'color-mix(in oklab, var(--sim-series-3) 78%, var(--sim-label))';
  const lr = shade(leaf, 70), fruit = 'var(--sim-series-2)';
  let out = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(46 * s)}" ry="${f1(6 * s)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`
    + `<path d="M${f1(x - 8 * s)} ${f1(y)}L${f1(x - 5 * s)} ${f1(y - 62 * s)}H${f1(x + 5 * s)}L${f1(x + 8 * s)} ${f1(y)}Z" ${fill(bark, `stroke:${shade(bark, 70)};stroke-width:2`)}/>`;
  const C = [[-28, -86, 34], [28, -86, 34], [0, -112, 40], [0, -78, 34]];
  for (const [dx, dy, r] of C) out += `<circle cx="${f1(x + dx * s)}" cy="${f1(y + dy * s + 3)}" r="${f1(r * s)}" ${fill(lr)}/>`;
  for (const [dx, dy, r] of C) out += `<circle cx="${f1(x + dx * s)}" cy="${f1(y + dy * s)}" r="${f1(r * s)}" ${fill(leaf)}/>`;
  const spots = [[-30, -76], [24, -70], [-4, -96], [32, -100], [-26, -108], [8, -124], [-12, -70], [14, -88], [-38, -94]];
  for (let i = 0; i < n && i < spots.length; i++) {
    const [dx, dy] = spots[i];
    out += `<ellipse cx="${f1(x + dx * s)}" cy="${f1(y + dy * s)}" rx="${f1(7.5 * s)}" ry="${f1(10 * s)}" transform="rotate(-20 ${f1(x + dx * s)} ${f1(y + dy * s)})" ${fill(fruit, `stroke:${shade(fruit, 66)};stroke-width:2`)}/>`;
  }
  return out;
}

export class TwoSaversScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Priya keeps 500 rupees in a gullak; a year later she still has 500. Sameer puts 500 rupees in a bank deposit at 8% a year; a year later he has 540, so 40 rupees is interest. Investing is like a mango tree: no fruit in year 1, then fruit every year; 8% a year is more than prices rising 6% a year. Liquidity: Priya can spend her cash any day; Sameer gets the full 40 rupees only after one year.';

  async setup() {
    this.later = true;
    this.val = END;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.reset();
      else if (b.dataset.act === 'year') this.grow();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter() { this.clear(); this.later = true; this.val = END; }

  reset() {
    if (this.stepIndex !== 0) return;
    this.clear();
    this.later = false;
    this.val = START;
    this.repaint();
  }

  /** One year: Sameer's tag counts up 500 -> 540 in 8 steps (0.1 s each); the interest pops. */
  grow() {
    if (this.stepIndex !== 0 || this.later) return;
    this.clear();
    this.later = true;
    this.anim = true;
    this.fresh = true;
    for (let i = 1; i <= 8; i++) this.after(0.2 + i * 0.1, () => { this.val = START + 5 * i; this.repaint(); });
    this.after(1.3, () => { this.anim = false; this.repaint(); });
    this.after(1.6, () => { this.fresh = false; });
    this.repaint();
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.later = true;
    this.val = END;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintInvest(P) : v === 2 ? this.paintLiquid(P) : this.paintYear(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the two savers, start or one year later.
  paintYear(P) {
    let svg = '', over = '';
    const G = P
      ? { pr: [66, 282, 150], pot: [196, 282, 92], ptag: [304, 166], pnote: [304, 222],
        sm: [66, 552, 150], bank: [210, 552, 136], stag: [300, 404], gain: [300, 352], rate: [210, 582], tw: 150,
        div: 'M20 306H370', top: [195, 34], btn: [195, 34], replay: [330, 590] }
      : { pr: [66, 430, 165], pot: [190, 430, 124], ptag: [190, 220], pnote: [190, 276],
        sm: [338, 430, 165], bank: [470, 430, 170], stag: [470, 220], gain: [470, 156], rate: [470, 276], tw: 160,
        div: 'M280 70V430', top: [280, 34], btn: [280, 34], replay: [494, 36] };
    svg += `<path d="${G.div}" ${stroke('var(--sim-stroke)', 2.5, 'stroke-dasharray:8 8')}/>`;
    // Priya and her gullak
    over += personSlot('priya', { x: G.pr[0], y: G.pr[1], h: G.pr[2], facing: 1, mood: 'smile' });
    svg += nameTag(G.pr[0], G.pr[1] + 4, 'priya', 18);
    svg += gullak(G.pot[0], G.pot[1], { w: G.pot[2] });
    svg += tag(G.ptag[0], G.ptag[1], 'gullak', START, { w: G.tw, labelSize: 20, valueSize: 32 });
    if (this.later) svg += text(G.pnote[0], G.pnote[1] + (P ? 0 : 0), 'still ' + rs(START), 21, 'var(--sim-label-muted)', 'middle', 700);
    // Sameer and the bank
    over += personSlot('sameer', { x: G.sm[0], y: G.sm[1], h: G.sm[2], facing: 1, mood: this.later ? 'happy' : 'smile' });
    svg += nameTag(G.sm[0], G.sm[1] + 4, 'sameer', 18);
    svg += civicSvg('bank', G.bank[0], G.bank[1], { w: G.bank[2] });
    const grown = this.val > START;
    svg += tag(G.stag[0], G.stag[1], 'bank deposit', this.val, { w: G.tw + 10, labelSize: 20, valueSize: 32, tone: grown ? 'save' : 'plain' });
    svg += text(G.rate[0], G.rate[1], `${RATE}% a year`, 21, 'var(--sim-label)', 'middle', 700);
    if (this.later && (!this.anim || this.val >= END)) {
      svg += `<g${this.fresh ? ' class="mk-pop"' : ''}>${text(G.gain[0], G.gain[1], `+${rs(END - START)} interest`, 26, SAVE_INK)}</g>`;
    }
    // the year: a button at the start, a heading after
    if (!this.later) over += `<div class="ts-ab" style="left:${G.btn[0]}px;top:${G.btn[1]}px"><button type="button" class="sv-hit ts-btn" data-act="year">one year later</button></div>`;
    else {
      svg += text(G.top[0], G.top[1] + 8, 'one year later', 24, 'var(--sim-label)');
      if (!this.anim) over += `<div class="ts-ab" style="left:${G.replay[0]}px;top:${G.replay[1]}px"><button type="button" class="sv-hit ts-btn ts-btn--quiet" data-act="replay">replay</button></div>`;
    }
    return { svg, over };
  }

  // b1: investing, a mango tree over the years, 8% against 6%.
  paintInvest(P) {
    let svg = '';
    const fruit = [0, 3, 6, 9];
    const G = P
      ? { title: [24, 44, 32], sub: [24, 76], tag: [292, 60, 150], xs: [52, 148, 244, 340], gy: 290, s: 0.62, yl: 318, bars: [380, 462], bx: 24, bw: 342, lab: 'above' }
      : { title: [24, 46, 34], sub: [24, 80], tag: [460, 58, 160], xs: [80, 210, 340, 470], gy: 296, s: 0.92, yl: 326, bars: [384, 440], bx: 190, bw: 340, lab: 'left' };
    svg += text(G.title[0], G.title[1], 'investing', G.title[2], 'var(--sim-label)', 'start');
    svg += text(G.sub[0], G.sub[1], 'grows over time', 21, 'var(--sim-label-muted)', 'start', 700);
    svg += tag(G.tag[0], G.tag[1], 'Sameer', END, { w: G.tag[2], labelSize: 20, valueSize: 30, tone: 'save' });
    G.xs.forEach((x, i) => {
      svg += `<g class="mk-pop" style="--d:${(0.15 + i * 0.35).toFixed(2)}s">${mangoTree(x, G.gy, G.s, fruit[i])}${text(x, G.yl, `year ${i + 1}`, 21, i === 0 ? 'var(--sim-label-muted)' : 'var(--sim-label)', 'middle', 700)}</g>`;
    });
    const rows = [
      { lab: 'money grows', pct: RATE, col: TONE.save, ink: SAVE_INK },
      { lab: 'prices rise', pct: PRICES, col: BAD, ink: shade(BAD, 80) },
    ];
    rows.forEach((r, i) => {
      const y = G.bars[i], w = G.bw * (r.pct / RATE), h = 42;
      if (G.lab === 'left') svg += text(G.bx - 14, y + 29, r.lab, 22, 'var(--sim-label)', 'end');
      else svg += text(G.bx, y - 10, r.lab, 21, 'var(--sim-label)', 'start');
      svg += `<g class="mk-grow" style="--d:${(1.5 + i * 0.3).toFixed(2)}s"><rect x="${G.bx}" y="${y + 4}" width="${f1(w)}" height="${h}" rx="10" ${fill(shade(r.col, 64))}/>`
        + `<rect x="${G.bx}" y="${y}" width="${f1(w)}" height="${h}" rx="10" ${fill(`color-mix(in oklab, ${r.col} 40%, var(--sim-bg-surface))`, `stroke:${shade(r.col, 64)};stroke-width:2.5`)}/>`
        + text(G.bx + w - 14, y + 30, `${r.pct}% a year`, 23, 'var(--sim-label)', 'end') + '</g>';
    });
    return { svg };
  }

  // b2: liquidity, from "ready any day" to "wait for the year".
  paintLiquid(P) {
    let svg = '';
    const G = P
      ? { title: [24, 44], sub: [24, 76], ly: 300, x0: 30, x1: 360, pile: [92, 282, 11], ptag: [92, 196], bank: [292, 282, 104], stag: [292, 176],
        cash: [30, 390], cal: [56, 470], tw: 128 }
      : { title: [24, 46], sub: [24, 80], ly: 300, x0: 50, x1: 510, pile: [122, 282, 13], ptag: [122, 186], bank: [418, 282, 130], stag: [418, 168],
        cash: [50, 392], cal: [330, 384], tw: 140 };
    svg += text(G.title[0], G.title[1], 'liquidity', 34, 'var(--sim-label)', 'start');
    svg += text(G.sub[0], G.sub[1], 'how quickly it turns into cash', 21, 'var(--sim-label-muted)', 'start', 700);
    // the line: a fat track with arrow ends, any-day end in the savings colour
    const y = G.ly, a = G.x0, b = G.x1;
    svg += `<path d="M${a + 14} ${y}H${b - 14}" ${stroke('var(--sim-stroke)', 12)}/>`
      + `<path d="M${a + 14} ${y}H${f1((a + b) / 2)}" ${stroke(TONE.save, 12, 'opacity:0.7')}/>`
      + `<path d="M${a} ${y}l20 -14v28z" ${fill(TONE.save)}/><path d="M${b} ${y}l-20 -14v28z" ${fill('var(--sim-stroke)')}/>`;
    svg += text(a, y + 40, 'ready any day', 22, 'var(--sim-label)', 'start');
    svg += text(b, y + 40, 'wait for the year', 22, 'var(--sim-label)', 'end');
    // Priya's cash at the any-day end
    svg += `<circle cx="${G.pile[0]}" cy="${y}" r="10" ${fill('var(--sim-series-7)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
    svg += coinPile(G.pile[0], G.pile[1], START, { r: G.pile[2] });
    svg += tag(G.ptag[0], G.ptag[1], 'Priya', START, { w: G.tw - 12, labelSize: 20, valueSize: 28 });
    // Sameer's deposit towards the far end
    svg += `<circle cx="${G.bank[0]}" cy="${y}" r="10" ${fill('var(--sim-series-4)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
    svg += civicSvg('bank', G.bank[0], G.bank[1] - 4, { w: G.bank[2] });
    svg += tag(G.stag[0], G.stag[1], 'Sameer', END, { w: G.tw, labelSize: 20, valueSize: 28, tone: 'save' });
    svg += text(G.cash[0], G.cash[1], 'cash: the most liquid', 22, SAVE_INK, 'start');
    const [cx, cy] = G.cal;
    svg += icon('calendar', cx, cy, 52, 4);
    svg += text(cx + 36, cy - 4, `full ${rs(END - START)}`, 22, 'var(--sim-label)', 'start');
    svg += text(cx + 36, cy + 24, 'after one year', 21, 'var(--sim-label)', 'start', 700);
    return { svg };
  }

  testState() {
    return { view: this.stepIndex, later: this.later, sameer: this.val, priya: START, anim: this.anim };
  }
}
