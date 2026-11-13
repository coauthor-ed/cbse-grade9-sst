/**
 * BakeryRisksScene - L03 s06 "Challenges and risks" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 600
 * portrait. Cast: shared/StallKit.js (bakery, breadLoaf, sugarBag, cakeJar), shared/MoneyKit.js (coin),
 * shared/FinPeople.js (two generic buyers). Drawn here: a butter block, a price-up arrow, weekly money bars, a
 * bin, a shelf, the risk cards.
 *   b0 Four risk cards pop in (0.4 s apart), a picture and a short label each: other bakeries nearby (two more
 *      shopfronts), flour and butter costlier (flour sack, butter, a red arrow up), tastes change (a cake jar
 *      swapping for a loaf), money in unevenly (four weekly bars of different heights).
 *   b1 Perishable inventory: a shelf labelled 'inventory' (flour, butter, loaves). Evening. Two buttons in the
 *      figure: 'too many' (8 baked, 5 sold as faint outlines, 3 left over go into the bin: 'thrown away') and
 *      'too few' (3 baked, all sold, the shelf is empty and two customers walk off: 'left without buying').
 *      'too many' at rest and on cold start.
 *   b2 The plan asks: four question cards, each with its picture from b0 / b1: perishable stock? same quality
 *      every day? customers up and down? other bakeries nearby?
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, bakery, breadLoaf, sugarBag, cakeJar } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

const CSS = `
.br-ab { position: absolute; transform: translate(-50%, -50%); }
.br-btn { min-height: 46px; padding: 5px 12px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.br-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.br-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.br-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.br-walk { animation: br-walk 0.8s cubic-bezier(.3,.8,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes br-walk { 0% { transform: translateX(-50px); opacity: 0; } 30% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .br-drop { animation: br-drop 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes br-drop { 0% { transform: translate(var(--dx, 0px), var(--dy, -60px)); opacity: 0.3; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .br-walk, svg .br-drop { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);

const BUTTER = 'color-mix(in oklab, var(--sim-series-2) 45%, var(--sim-bg-surface))';
const WOODC = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 40%)';
const SHELF = 'color-mix(in oklab, var(--sim-series-8) 22%, var(--sim-bg-surface))';

/** A wrapped butter block, bottom centre. */
function butter(x, y, w) {
  const h = w * 0.5, rim = shade(BUTTER, 62);
  return lipRect(x - w / 2, y - h, w, h, 6, BUTTER, rim) + rect(x - w / 2, y - h, w * 0.4, h, 6, 'color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)')
    + text(x + w * 0.18, y - h * 0.3, 'butter', Math.max(18, w * 0.2), 'var(--sim-label)');
}

/** A thick arrow, up (dir -1) or right (dir 0), from its tail (x, y). */
function arrow(x, y, len, col, dir = -1) {
  const t = 9, hd = 20;
  if (dir === -1) return `<path d="M${f1(x)} ${f1(y)}V${f1(y - len + hd)}" ${stroke(col, t)}/><path d="M${f1(x - hd)} ${f1(y - len + hd)}L${f1(x)} ${f1(y - len)}L${f1(x + hd)} ${f1(y - len + hd)}Z" ${fill(col, `stroke:${col};stroke-width:3;stroke-linejoin:round`)}/>`;
  return `<path d="M${f1(x)} ${f1(y)}H${f1(x + len - hd)}" ${stroke(col, t)}/><path d="M${f1(x + len - hd)} ${f1(y - hd)}L${f1(x + len)} ${f1(y)}L${f1(x + len - hd)} ${f1(y + hd)}Z" ${fill(col, `stroke:${col};stroke-width:3;stroke-linejoin:round`)}/>`;
}

/** Four weekly money bars of uneven height on a base; (x, y) left end of the base, w wide, h tall. */
function weekBars(x, y, w, h) {
  const hs = [0.85, 0.35, 0.65, 0.2], bw = w / 4 - 10, col = 'var(--sim-series-3)';
  let s = `<path d="M${f1(x - 4)} ${f1(y)}H${f1(x + w + 4)}" ${stroke('var(--sim-stroke)', 3)}/>`;
  hs.forEach((r, i) => {
    const bx = x + 5 + i * (w / 4), bh = (h - 30) * r;
    s += lipRect(bx, y - bh, bw, bh, 5, `color-mix(in oklab, ${col} 45%, var(--sim-bg-surface))`, shade(col, 62));
  });
  return s + coin(x + 5 + bw / 2, y - (h - 30) * 0.85 - 18, 13);
}

/** A bin with a lid; (x, y) bottom centre, w wide. */
function bin(x, y, w, inside = '') {
  const h = w * 1.05, top = y - h, col = 'color-mix(in oklab, var(--sim-label-muted) 45%, var(--sim-bg-surface))', rim = 'var(--sim-label-muted)';
  let s = inside;
  s += `<path d="M${f1(x - w / 2)} ${f1(top)}L${f1(x - w * 0.4)} ${f1(y)}H${f1(x + w * 0.4)}L${f1(x + w / 2)} ${f1(top)}Z" ${fill(col, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  for (const fx of [-0.2, 0, 0.2]) s += `<path d="M${f1(x + fx * w)} ${f1(top + h * 0.15)}V${f1(y - h * 0.12)}" ${stroke(rim, 3)}/>`;
  s += rect(x - w * 0.56, top - 10, w * 1.12, 12, 5, col, `stroke:${rim};stroke-width:2.5`);
  return s;
}

/** A wall shelf with n boards; (x, y) top left. */
function shelfFrame(x, y, w, h, boards) {
  let s = lipRect(x, y, w, h, 10, SHELF, WOODC);
  for (const by of boards) s += rect(x - 4, by, w + 8, 10, 4, WOODC);
  return s;
}

/** A card with a picture slot and a one- or two-line label at its foot; (x, y) top left. */
function riskCard(x, y, w, h, lines, pic, ring = 'var(--sim-stroke)') {
  let s = lipRect(x, y, w, h, 14, 'var(--sim-bg-surface)', ring);
  s += pic(x + w / 2, y + (h - 62) * 0.78);
  lines.forEach((l, i) => { s += text(x + w / 2, y + h - 14 - (lines.length - 1 - i) * 29, l, 22, 'var(--sim-label)'); });
  return s;
}

const PICS = {
  rivals: (x, y) => bakery(x - 52, y, 90, { sign: 'Bakery', signSize: 16 }) + bakery(x + 52, y, 90, { sign: 'Bakery', signSize: 16 }),
  costs: (x, y) => sugarBag(x - 56, y, 74, { label: 'flour' }) + butter(x + 6, y, 64) + arrow(x + 70, y, 82, 'var(--sim-bad)', -1),
  tastes: (x, y) => cakeJar(x - 56, y, 70) + arrow(x - 28, y - 34, 56, 'var(--sim-label-muted)', 0) + breadLoaf(x + 60, y, 76),
  uneven: (x, y) => weekBars(x - 80, y, 160, 100),
  perish: (x, y) => breadLoaf(x - 34, y, 70) + breadLoaf(x + 34, y, 62),
  quality: (x, y) => [-56, 0, 56].map((dx) => cakeJar(x + dx, y, 62)).join(''),
};

export class BakeryRisksScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Challenges and risks for a bakery: other bakeries nearby, flour and butter getting costlier, customers changing what they like, and money coming in unevenly from week to week. Perishable inventory on a shelf: flour, butter and loaves. Bake too many: 8 baked, 5 sold, 3 thrown away in the evening. Bake too few: 3 baked, all sold, and two customers leave without buying. The plan asks: how to manage perishable stock, keep the same quality every day, handle customers going up and down, and compete with other bakeries nearby.';

  async setup() {
    this.many = 1;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-many]');
      if (!b || this.stepIndex !== 1) return;
      const m = +b.dataset.many;
      if (m === this.many) return;
      this.many = m;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.many = 1; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintShelf(P) : this.paintCards(P, v === 2);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0 risks / b2 the plan's questions: four cards in a 2 x 2 grid.
  paintCards(P, ask) {
    const G = P ? { x: [10, 200], y: ask ? [56, 326] : [16, 304], w: 180, h: ask ? 262 : 276 }
      : { x: [14, 286], y: ask ? [52, 268] : [14, 246], w: 260, h: ask ? 206 : 222 };
    const cards = ask
      ? [[['perishable', 'stock?'], 'perish'], [['same quality', 'every day?'], 'quality'], [['customers up', 'and down?'], 'uneven'], [['other bakeries', 'nearby?'], 'rivals']]
      : [[['other bakeries', 'nearby'], 'rivals'], [['flour and butter', 'costlier'], 'costs'], [['tastes', 'change'], 'tastes'], [['money comes in', 'unevenly'], 'uneven']];
    const sc = P ? 0.84 : 1;
    let svg = ask ? text(P ? 195 : 280, 38, 'the plan asks', 26, 'var(--sim-label)') : '';
    cards.forEach(([lines, pic], i) => {
      const x = G.x[i % 2], y = G.y[i >> 1], ring = ask ? 'var(--sim-accent)' : 'var(--sim-stroke)';
      const draw = (cx, cy) => `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${sc})">${PICS[pic](0, 0)}</g>`;
      svg += `<g class="mk-pop" style="--d:${0.2 + i * 0.4}s">${riskCard(x, y, G.w, G.h, lines, draw, ring)}`;
      if (ask) svg += `<circle cx="${x + G.w - 26}" cy="${y + 26}" r="17" ${fill('var(--sim-accent)')}/>${text(x + G.w - 26, y + 34, '?', 24, 'var(--sim-bg-surface)')}`;
      svg += '</g>';
    });
    return { svg };
  }

  // b1: the inventory shelf at evening, too many or too few.
  paintShelf(P) {
    const many = this.many === 1, n = many ? 8 : 3, sold = many ? 5 : 3;
    const G = P
      ? { sh: [40, 70, 310, 250], lab: [130, 46], moon: [360, 40], lw: 56, rows: [168, 246], out: [195, 470], bin: [195, 540, 84], tx: [195, 390], who: [[70, 534], [320, 534]], wh: 140, btn: [[98, 568], [292, 568]], bw: 172 }
      : { sh: [24, 70, 286, 300], lab: [167, 50], moon: [528, 46], lw: 58, rows: [190, 280], out: [430, 300], bin: [430, 390, 120], tx: [430, 170], who: [[386, 404], [488, 404]], wh: 168, btn: [[170, 444], [400, 444]], bw: 190 };
    const [sx, sy, sw, shh] = G.sh;
    let svg = text(G.lab[0], G.lab[1], 'inventory', 26, 'var(--sim-label)');
    // evening: a moon
    svg += `<circle cx="${G.moon[0]}" cy="${G.moon[1]}" r="20" ${fill('color-mix(in oklab, var(--sim-series-2) 60%, var(--sim-bg-surface))')}/><circle cx="${G.moon[0] + 9}" cy="${G.moon[1] - 6}" r="17" ${fill('var(--sim-bg-deep)')}/>`;
    svg += text(G.moon[0] - 30, G.moon[1] + 8, 'evening', 22, 'var(--sim-label-muted)', 'end', 700);
    svg += shelfFrame(sx, sy, sw, shh, [G.rows[0], G.rows[1] - 0.5]);
    // the top board: flour and butter
    svg += sugarBag(sx + sw * 0.28, G.rows[0] - 2 - 0, 92, { label: 'flour' }) + butter(sx + sw * 0.7, G.rows[0] - 2, 92);
    // loaves: 4 per row on the two lower boards (row 2 sits on the shelf floor)
    const at = (i) => [sx + sw * (0.14 + (i % 4) * 0.24), i < 4 ? G.rows[1] - 2 : sy + shh - 6];
    for (let i = 0; i < n; i++) {
      const [x, y] = at(i);
      if (i < sold) svg += `<g style="opacity:0.3"><g class="mk-pop" style="--d:${0.1 + i * 0.08}s">${breadLoaf(x, y, G.lw)}</g></g>`;
    }
    let over = '';
    if (many) {
      // three left over drop into the bin
      let inside = '';
      const btop = G.bin[1] - G.bin[2] * 1.05;
      [-0.22, 0.02, 0.24].forEach((fx, i) => { inside += `<g class="br-drop" style="--d:${0.6 + i * 0.15}s;--dy:-80px">${breadLoaf(G.bin[0] + fx * G.bin[2], btop + 6 - (i === 1 ? 10 : 0), G.bin[2] * 0.42)}</g>`; });
      svg += bin(G.bin[0], G.bin[1], G.bin[2]) + inside;
      svg += `<g class="mk-pop" style="--d:1.1s">${text(G.tx[0], G.tx[1], 'thrown away', 28, 'var(--sim-bad)')}${text(G.tx[0], G.tx[1] + 34, '3 left over', 22, 'var(--sim-bad)', 'middle', 700)}</g>`;
    } else {
      svg += `<g class="mk-pop" style="--d:0.8s">${text(G.tx[0], G.tx[1], 'left without', 28, 'var(--sim-bad)')}${text(G.tx[0], G.tx[1] + 32, 'buying', 28, 'var(--sim-bad)')}</g>`;
      G.who.forEach(([x, y], i) => { over += personSlot(`buyer${i + 1}`, { x, y, h: G.wh, facing: 1, mood: 'sad', cls: 'br-walk', style: `animation-delay:${0.3 + i * 0.2}s;` }); });
    }
    svg += text(sx + sw / 2, sy + shh + 34, `${n} baked, ${sold} sold`, 24, 'var(--sim-label)');
    G.btn.forEach(([bx, by], i) => {
      const m = i === 0 ? 1 : 0;
      over += `<button type="button" class="sv-hit tap btn br-ab br-btn${this.many === m ? ' on' : ''}" data-many="${m}" aria-pressed="${this.many === m}" style="left:${bx}px;top:${by}px;width:${G.bw}px">${i === 0 ? 'bake too many' : 'bake too few'}</button>`;
    });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, case: this.stepIndex === 1 ? (this.many ? 'too many' : 'too few') : null }; }
}
