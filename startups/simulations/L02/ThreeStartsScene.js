/**
 * ThreeStartsScene - L02 s07 "Three small starts" (2 beats). SvgScene, design 560 x 506 landscape, 390 x 620
 * portrait. Three columns, the same people as in s01, s02-s04 and s05: the young man of the Jataka tale, the
 * Lijjat founders (three of the seven drawn, the chip says 7), M. S. Oberoi (a generic figure, no likeness).
 *   b0 The starts, big: the young man holding a dead mouse; the women with a borrowed rolling board, a pin and a
 *      recipe card ("Rs 80 and a recipe"); Oberoi behind a small front desk ("Rs 50 a month").
 *   b1 What each built: the starts shrink to the foot of each column, a staircase of four steps rises in each
 *      column (one step after another, 0.3 s apart), and on top the result: a heap of coins and the city's homes
 *      ("helped his city"); 45,000 women, Rs 1,600 crore a year; a row of hotels ("a hotel chain").
 * Only the numbers in the text. Animation is CSS only; Skip / Replay in the figure. Rest = the final frame.
 * Drawn here (not in the shared kit): dead mouse, rolling board and pin, recipe card, small hotel, desk, bell.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, RS, coinPile } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const DUR = [1.8, 3.2];

// The same people as in the other L02 scenes (the first file to load registers them; the entries are identical).
const OLD = { shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', glasses: false, dupatta: false };
registerCast('youngman', { name: 'Young man', series: 0, role: 'adult', i: 43, look: { ...OLD, outfit: 'kurta', top: 'stone', bottom: 'cream', hairStyle: 'short', moustache: false, girth: 0.95, sleeves: 'rolled' } });
const W7 = [
  { outfit: 'drape', hairStyle: 'bun' }, { outfit: 'kurti', hairStyle: 'braid', dupatta: true }, { outfit: 'drape', hairStyle: 'long' },
  { outfit: 'kurti', hairStyle: 'bun', dupatta: true }, { outfit: 'drape', hairStyle: 'braid' }, { outfit: 'kurti', hairStyle: 'long', dupatta: true },
  { outfit: 'drape', hairStyle: 'bun' },
];
W7.forEach((w, i) => registerCast(`lijjat${i + 1}`, { name: 'Member', series: i + 1, role: 'adult', i: 51 + i,
  look: { top: `s${i + 1}`, bottom: w.outfit === 'drape' ? `s${i + 1}` : 'cream', bottomStyle: 'long-skirt', trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1 + (i % 3) * 0.04, ...w } }));
registerCast('oberoi', { name: 'M. S. Oberoi', series: 0, role: 'adult', i: 61,
  look: { outfit: 'coat', top: 'navy', bottom: 'cream', hairStyle: 'sidepart', moustache: true, shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', glasses: false, dupatta: false, girth: 1, sleeves: 'long' } });

const CSS = `
.ts-chip { position: absolute; transform: translate(-50%, -50%); text-align: center; padding: 4px 12px; border-radius: 16px;
  font: 800 20px/1.15 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); white-space: nowrap; }
.ts-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.ts-chip.head { font-size: 22px; border-radius: 999px; }
.sim-dom-root--portrait .ts-chip { font-size: 18px; padding: 3px 9px; }
.sim-dom-root--portrait .ts-chip.head { font-size: 19px; }
.ts-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ts-btn:active { transform: translateY(3px); box-shadow: none; }
.ts-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ts-in { animation: ts-in 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ts-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
svg .ts-pop { transform-box: fill-box; transform-origin: 50% 100%; animation: ts-pop 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ts-pop { 0% { opacity: 0; transform: scale(0.3); } 100% { opacity: 1; transform: none; } }
.ts-still, .ts-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .ts-in, svg .ts-pop { animation: none; } }
`;

const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const WOOD_LT = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-bg-surface))';
const RIM = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';

function icon(name, x, y, size, tone) {
  return iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
}

function deadMouse(x, y, s = 1) {
  const body = 'color-mix(in oklab, var(--sim-label) 42%, var(--sim-bg-surface))', rim = 'color-mix(in oklab, var(--sim-label) 70%, var(--sim-bg-surface))';
  return `<path d="M${f1(x + 20 * s)} ${f1(y - 4 * s)}q${f1(18 * s)} ${f1(-2 * s)} ${f1(22 * s)} ${f1(-14 * s)}q${f1(3 * s)} ${f1(-9 * s)} ${f1(-6 * s)} ${f1(-12 * s)}" ${stroke(rim, 3 * s)}/>`
    + `<path d="M${f1(x - 8 * s)} ${f1(y - 14 * s)}l${f1(-3 * s)} ${f1(-9 * s)}M${f1(x + 6 * s)} ${f1(y - 15 * s)}l${f1(2 * s)} ${f1(-9 * s)}" ${stroke(rim, 3 * s)}/>`
    + `<ellipse cx="${f1(x)}" cy="${f1(y - 9 * s)}" rx="${f1(21 * s)}" ry="${f1(11 * s)}" ${fill(body, `stroke:${rim};stroke-width:${f1(2.5 * s)}`)}/>`
    + `<path d="M${f1(x - 18 * s)} ${f1(y - 13 * s)}q${f1(-12 * s)} ${f1(2 * s)} ${f1(-14 * s)} ${f1(6 * s)}q${f1(6 * s)} ${f1(5 * s)} ${f1(14 * s)} ${f1(2 * s)}z" ${fill(body, `stroke:${rim};stroke-width:${f1(2.5 * s)};stroke-linejoin:round`)}/>`
    + `<circle cx="${f1(x - 15 * s)}" cy="${f1(y - 21 * s)}" r="${f1(5.5 * s)}" ${fill(body, `stroke:${rim};stroke-width:${f1(2 * s)}`)}/>`;
}

// A round rolling board with a pin across it, and a recipe card. (x, y) = bottom centre of the board.
function papadKit(x, y, s = 1) {
  return `<ellipse cx="${f1(x - 18 * s)}" cy="${f1(y - 8 * s)}" rx="${f1(32 * s)}" ry="${f1(10 * s)}" ${fill(WOOD_LT, `stroke:${RIM};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - 54 * s)}" y="${f1(y - 24 * s)}" width="${f1(72 * s)}" height="${f1(9 * s)}" rx="${f1(4.5 * s)}" transform="rotate(-8 ${f1(x - 18 * s)} ${f1(y - 20 * s)})" ${fill(WOOD, `stroke:${RIM};stroke-width:2`)}/>`
    + `<g transform="rotate(6 ${f1(x + 34 * s)} ${f1(y - 22 * s)})"><rect x="${f1(x + 16 * s)}" y="${f1(y - 46 * s)}" width="${f1(38 * s)}" height="${f1(46 * s)}" rx="4" ${fill('var(--sim-bg-surface)', `stroke:${RIM};stroke-width:2`)}/>`
    + [0, 1, 2, 3].map((i) => `<path d="M${f1(x + 22 * s)} ${f1(y - (36 - i * 9) * s)}H${f1(x + (i === 0 ? 46 : 40) * s)}" ${stroke(i === 0 ? 'var(--sim-series-6)' : 'var(--sim-label-muted)', i === 0 ? 3 : 2)}/>`).join('')
    + '</g>';
}

function hotel(x, y, w, floors, tone) {
  const fh = w * 0.3, h = floors * fh + w * 0.2, x0 = x - w / 2, top = y - h;
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="3" ${fill(`color-mix(in oklab, var(--sim-series-${tone}) 22%, var(--sim-bg-surface))`, `stroke:${RIM};stroke-width:2`)}/>`
    + `<path d="M${f1(x0 - w * 0.08)} ${f1(top + 2)}L${f1(x)} ${f1(top - w * 0.26)}L${f1(x0 + w * 1.08)} ${f1(top + 2)}Z" ${fill('color-mix(in oklab, var(--sim-series-6) 70%, var(--sim-label) 15%)', `stroke:${RIM};stroke-width:2;stroke-linejoin:round`)}/>`;
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < 2; c++) s += `<rect x="${f1(x0 + w * (0.16 + c * 0.44))}" y="${f1(top + w * 0.08 + f * fh)}" width="${f1(w * 0.24)}" height="${f1(fh * 0.56)}" rx="2" ${fill('color-mix(in oklab, var(--sim-water) 40%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:1.5`)}/>`;
  }
  return s + `<rect x="${f1(x - w * 0.13)}" y="${f1(y - w * 0.2)}" width="${f1(w * 0.26)}" height="${f1(w * 0.2)}" rx="${f1(w * 0.1)}" ${fill(WOOD)}/>`;
}

function desk(x0, x1, top, ground) {
  const gold = 'var(--sim-gold)', bx = x1 - 30;
  return `<rect x="${f1(x0 - 6)}" y="${f1(top - 10)}" width="${f1(x1 - x0 + 12)}" height="12" rx="5" ${fill(WOOD, `stroke:${RIM};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(x1 - x0)}" height="${f1(ground - top)}" rx="4" ${fill(WOOD_LT, `stroke:${RIM};stroke-width:2.5`)}/>`
    + `<path d="M${f1(bx - 13)} ${f1(top - 10)}Q${f1(bx - 13)} ${f1(top - 27)} ${f1(bx)} ${f1(top - 27)}Q${f1(bx + 13)} ${f1(top - 27)} ${f1(bx + 13)} ${f1(top - 10)}Z" ${fill(gold, 'stroke:color-mix(in oklab, var(--sim-gold) 55%, var(--sim-label));stroke-width:2')}/>`;
}

const chip = (t, x, y, d, cls = '') => `<div class="ts-chip ts-in${cls ? ` ${cls}` : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;
const txt = (x, y, t, size, col = 'var(--sim-label)') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

export class ThreeStartsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 506;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three small starts side by side. The young man of the Jataka tale with a dead mouse; the seven Lijjat women with 80 rupees, a borrowed rolling board and a recipe; Mohan Singh Oberoi as a desk clerk paid 50 rupees a month. Then, in each column, a staircase of steps rises from the small start to what each built: wealth that helped his city; 45,000 women members and 1,600 crore rupees a year; a chain of hotels.';

  async setup() {
    this.still = false;
    this.run = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'skip') this.finish();
      else this.restart();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  enter() { this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    if (this._timers) this.after(DUR[this.stepIndex] ?? 2, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 506) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 506, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = this.paintCols(P, DW, DH, v === 1);
    const still = this.still ? ' ts-still' : '';
    const btn = `<button type="button" class="sv-hit tap btn ts-btn" data-act="${this.still ? 'replay' : 'skip'}" style="right:8px;bottom:6px">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  paintCols(P, DW, DH, built) {
    const cw = (DW - 20) / 3, X = [0, 1, 2].map((i) => 10 + cw * (i + 0.5));
    // b0: the starts big; b1: the starts small at the foot, steps, results on top.
    const L = built
      ? (P ? { ground: 596, h: 120, head: 26, startY: 420, s: 0.8 } : { ground: 470, h: 112, head: 24, startY: 324, s: 0.8 })
      : (P ? { ground: 500, h: 236, head: 30, startY: 552, s: 1.25 } : { ground: 398, h: 228, head: 30, startY: 440, s: 1.4 });
    let svg = '', over = '', front = '';
    // column panels
    X.forEach((x) => {
      svg += `<rect x="${f1(x - cw / 2 + 4)}" y="8" width="${f1(cw - 8)}" height="${DH - 16}" rx="18" ${fill('color-mix(in oklab, var(--sim-bg-surface) 55%, transparent)', 'stroke:var(--sim-stroke);stroke-width:1.5;opacity:0.8')}/>`;
    });
    const heads = ['Young man', '7 women', 'Oberoi'];
    X.forEach((x, i) => { over += chip(heads[i], x, L.head, 0, 'head'); });
    const g = L.ground, h = L.h, s = L.s;
    const off = cw * (P ? 0.2 : 0.2);
    // 1. the young man and the dead mouse
    over += personSlot('youngman', { x: X[0] - off, y: g, h, facing: 1, mood: 'think' });
    front += deadMouse(X[0] + off + 6, g - h * 0.42, s * (P ? 0.8 : 0.9));
    // 2. three of the seven women, the rolling board and the recipe
    [-1, 0, 1].forEach((d, j) => { over += personSlot(`lijjat${j + 1}`, { x: X[1] + d * cw * 0.2, y: g - (j === 1 ? 6 : 0), h: h * (j === 1 ? 0.96 : 0.92), mood: 'smile' }); });
    front += papadKit(X[1] + (P ? -2 : 0), g + 2, s * (P ? 0.72 : 0.85));
    // 3. Oberoi behind a small desk
    over += personSlot('oberoi', { x: X[2] - off * 0.2, y: g, h, mood: 'smile' });
    front += desk(X[2] - cw * 0.4, X[2] + cw * 0.36, g - h * 0.3, g);
    over += frontSvg(DW, DH, front);
    const starts = ['a dead<br>mouse', `${RS}80 and<br>a recipe`, `${RS}50<br>a month`];
    X.forEach((x, i) => { over += chip(starts[i], built ? x + (i === 1 ? 0 : cw * 0.22) : x, L.startY, built ? 0 : 0.3 + i * 0.25, built ? '' : 'acc'); });
    if (!built) return { svg, over };

    // steps: four in each column, one after another
    const sTop = P ? 232 : 188, sBot = P ? 384 : 294, sw = (cw - (P ? 24 : 40)) / 4, rise = (sBot - sTop) / 4;
    X.forEach((x, i) => {
      for (let j = 0; j < 4; j++) {
        const sx = x - cw / 2 + (P ? 12 : 20) + j * sw, sy = sBot - rise * (j + 1);
        svg += `<g class="ts-pop" style="--d:${(0.2 + j * 0.3 + i * 0.08).toFixed(2)}s"><rect x="${f1(sx)}" y="${f1(sy)}" width="${f1(sw - 3)}" height="${f1(sBot - sy)}" rx="5" ${fill(`color-mix(in oklab, var(--sim-accent) ${18 + j * 12}%, var(--sim-bg-surface))`, 'stroke:var(--sim-accent);stroke-width:2')}/></g>`;
      }
    });
    // results on top
    const d = 1.6, rT = P ? 52 : 46;
    // 1. wealth and the city
    svg += `<g class="ts-pop" style="--d:${d}s">${coinPile(X[0] - cw * 0.2, rT + (P ? 120 : 110), 1000, { r: P ? 9 : 10 })}`
      + icon('house', X[0] + cw * 0.22, rT + (P ? 40 : 34), P ? 44 : 50, 2) + icon('house', X[0] + cw * 0.22, rT + (P ? 86 : 84), P ? 44 : 50, 5) + '</g>';
    svg += `<g class="ts-pop" style="--d:${d + 0.3}s">` + (P ? txt(X[0], rT + 148, 'helped', 20) + txt(X[0], rT + 170, 'his city', 20) : txt(X[0], rT + 136, 'helped his city', 20)) + '</g>';
    // 2. Lijjat today
    svg += `<g class="ts-pop" style="--d:${d + 0.15}s">${txt(X[1], rT + (P ? 32 : 36), '45,000', P ? 30 : 38, 'var(--sim-accent)')}${txt(X[1], rT + (P ? 54 : 60), 'women', 20)}`
      + `${txt(X[1], rT + (P ? 96 : 104), `${RS}1,600 ${P ? '' : 'crore'}`, P ? 28 : 30, 'var(--sim-accent)')}${txt(X[1], rT + (P ? 120 : 128), P ? 'crore a year' : 'a year', P ? 18 : 20)}</g>`;
    // 3. a hotel chain
    const hy = rT + (P ? 116 : 108), hw = P ? 36 : 44;
    [[-1.15, 2, 4], [0, 3, 7], [1.15, 2, 3]].forEach(([dx, fl, t], j) => {
      svg += `<g class="ts-pop" style="--d:${(d + 0.2 + j * 0.15).toFixed(2)}s">${hotel(X[2] + dx * hw, hy, hw, fl, t)}</g>`;
    });
    svg += `<g class="ts-pop" style="--d:${d + 0.6}s">${txt(X[2], hy + 26, P ? 'hotel chain' : 'a hotel chain', P ? 18 : 20)}</g>`;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
