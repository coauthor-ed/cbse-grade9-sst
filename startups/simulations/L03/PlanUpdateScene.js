/**
 * PlanUpdateScene - L03 s08 "Changing the plan" (2 beats). SvgScene, design 560 x 480 landscape, 390 x 600
 * portrait. Cast: shared/StallKit.js (bakery, breadLoaf), shared/FinPeople.js (parent as a customer). Drawn
 * here: the plan notebook, its cards, a speech bubble, the four area boxes.
 *   b0 The plan notebook 'ABC Bakery plan' with three cards: products, prices, promotion. Two buttons in the
 *      figure name the two changes in the text: 'customers ask' (a customer: 'Whole wheat bread, please!'; the
 *      products card gets '+ whole wheat bread') and 'new bakery' (a new shopfront 'New Bakery' nearby; the
 *      prices card gets '+ check prices' and the promotion card '+ special offer'). An arrow from the change back
 *      into the plan; the changed cards ring in the accent and their new line writes in (0.6 s). 'customers ask'
 *      at rest and on cold start.
 *   b1 From questions to areas of work: the eight plan cards fly (0.5 s, staggered) into four boxes:
 *      management and operations (needs and idea, location, challenges and risks), finance and accounting
 *      (money and costs, pricing and profits), human resources (human resources), marketing and sales
 *      (potential customers, promotion). The grouping is the scene's reading of the book (Fig 6.6 into Fig 6.9);
 *      the text only names the four areas.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, bakery, breadLoaf } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];

const CSS = `
.pu-ab { position: absolute; transform: translate(-50%, -50%); }
.pu-btn { min-height: 46px; padding: 5px 12px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.pu-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.pu-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.pu-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.pu-walk { animation: pu-walk 0.8s cubic-bezier(.3,.8,.4,1) both; }
@keyframes pu-walk { 0% { transform: translateX(60px); opacity: 0; } 30% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .pu-write { clip-path: inset(0 100% 0 0); animation: pu-write 0.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes pu-write { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
@media (prefers-reduced-motion: reduce) { .pu-walk, svg .pu-write { animation: none; clip-path: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);

const PAPER = 'color-mix(in oklab, var(--sim-series-2) 10%, var(--sim-bg-surface))';
const COVER = 'color-mix(in oklab, var(--sim-series-5) 55%, var(--sim-bg-surface))';

/** The plan notebook: (x, y) top left. */
function notebook(x, y, w, h) {
  let s = rect(x - 6, y - 6, w + 12, h + 16, 14, shade(COVER, 70)) + rect(x - 6, y - 6, w + 12, h + 12, 14, COVER);
  s += lipRect(x, y, w, h, 8, PAPER, 'var(--sim-stroke)');
  for (let i = 0; i < 7; i++) {
    const rx = x + 24 + i * (w - 48) / 6;
    s += `<rect x="${f1(rx - 5)}" y="${f1(y - 16)}" width="10" height="26" rx="5" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>`;
  }
  return s + text(x + w / 2, y + 42, 'ABC Bakery plan', 25, 'var(--sim-label)');
}

/** A plan card: title, an old line, and (optionally) a new line written in; (x, y) top left. */
function planCard(x, y, w, h, title, old, add, on) {
  const ring = on ? 'var(--sim-accent)' : 'var(--sim-stroke)';
  let s = rect(x, y + 3, w, h, 10, ring) + rect(x, y, w, h, 10, on ? 'color-mix(in oklab, var(--sim-accent) 10%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${ring};stroke-width:${on ? 3.5 : 2.5}`);
  s += text(x + 14, y + 30, title, 23, 'var(--sim-label)', 'start');
  s += text(x + 14, y + 58, old, 19, 'var(--sim-label-muted)', 'start', 700);
  if (add) {
    s += `<g class="pu-write" style="--d:0.7s">${text(x + 14, y + 86, add, 21, 'var(--sim-accent)', 'start')}</g>`;
    // a pencil at the end of the new line
    const px = x + w - 22, py = y + 34;
    s += `<g class="mk-pop" style="--d:1.2s"><path d="M${px - 14} ${py + 10}l26 -26" ${stroke(shade('var(--sim-series-2)', 62), 11)}/><path d="M${px - 14} ${py + 10}l26 -26" ${stroke('var(--sim-series-2)', 7)}/><path d="M${px - 17} ${py + 13}l5 -5" ${stroke('var(--sim-label)', 6)}/></g>`;
  }
  return s;
}

const CASES = [
  { btn: 'customers ask', add: { products: '+ whole wheat bread' } },
  { btn: 'new bakery', add: { prices: '+ check prices', promotion: '+ special offer' } },
];
const CARDS = [['products', 'bread, cakes, pastries'], ['prices', 'jar, full cake'], ['promotion', 'posters, social media']];

const AREAS = [
  { t: ['management', 'and operations'], s: 1, c: ['needs and idea', 'location', 'challenges and risks'] },
  { t: ['finance', 'and accounting'], s: 3, c: ['money and costs', 'pricing and profits'] },
  { t: ['human', 'resources'], s: 5, c: ['human resources'] },
  { t: ['marketing', 'and sales'], s: 6, c: ['potential customers', 'promotion'] },
];

export class PlanUpdateScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'The ABC Bakery plan changes when the facts change. If customers ask for whole wheat bread, the products card gets whole wheat bread added. If a new bakery opens nearby, the prices card gets check prices and the promotion card gets a special offer. Then the eight parts of the plan group into four areas of work: management and operations (needs and idea, location, challenges and risks), finance and accounting (money and costs, pricing and profits), human resources, and marketing and sales (potential customers, promotion).';

  async setup() {
    this.which = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-which]');
      if (!b || this.stepIndex !== 0) return;
      const w = +b.dataset.which;
      if (w === this.which) return;
      this.which = w;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.which = 0; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintAreas(P) : this.paintPlan(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the plan and one change from outside.
  paintPlan(P) {
    const G = P
      ? { nb: [22, 214, 346, 326], cw: 318, ch: 92, cy: [270], ch2: 64, ev: [195, 120], arr: [252, 140, 252, 206], btn: [[100, 574], [290, 574]], bw: 176 }
      : { nb: [22, 34, 300, 378], cw: 272, ch: 98, cy: [98, 202, 306], ch2: 96, ev: [440, 230], arr: [374, 250, 330, 250], btn: [[170, 448], [400, 448]], bw: 200 };
    const c = CASES[this.which], [nx, ny, nw, nh] = G.nb;
    let svg = notebook(nx, ny, nw, nh);
    CARDS.forEach(([t, old], i) => {
      const add = c.add[t], h = P ? (add ? G.ch : G.ch2) : G.ch;
      const y = P ? G.cy[0] + CARDS.slice(0, i).reduce((a, [tt]) => a + (c.add[tt] ? G.ch : G.ch2) + 8, 0) : G.cy[i];
      svg += planCard(nx + (nw - G.cw) / 2, y, G.cw, h, t, old, add, !!add);
    });
    let over = '';
    const [ex, ey] = G.ev;
    if (this.which === 0) {
      over += personSlot('parent', { x: ex + (P ? 120 : 50), y: ey + (P ? 80 : 170), h: P ? 150 : 200, facing: -1, mood: 'smile', cls: 'pu-walk' });
      const bw = P ? 236 : 206, bx = P ? ex - 70 : ex - 12, by = P ? ey - 96 : ey - 172, bh = 84;
      svg += `<g class="mk-pop" style="--d:0.4s">${lipRect(bx - bw / 2, by, bw, bh, 18, 'var(--sim-bg-surface)', 'var(--sim-stroke)')}`
        + `<path d="M${f1(bx + 30)} ${f1(by + bh - 1)}l14 20l6 -20Z" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-linejoin:round')}/><path d="M${f1(bx + 31)} ${f1(by + bh - 2)}h18" ${stroke('var(--sim-bg-surface)', 4)}/>`
        + text(bx, by + 34, 'Whole wheat', 23, 'var(--sim-label)') + text(bx, by + 64, 'bread, please!', 23, 'var(--sim-label)') + '</g>';
      svg += breadLoaf(P ? ex - 10 : ex - 34, P ? ey + 76 : ey + 166, P ? 70 : 84);
    } else {
      svg += `<g class="mk-pop" style="--d:0.1s">${bakery(P ? ex - 60 : ex + 22, P ? ey + 78 : ey + 160, P ? 170 : 170, { sign: 'New Bakery', signSize: 22 })}</g>`;
      svg += text(P ? 318 : ex + 22, P ? 130 : ey + 2, 'opens nearby', 22, 'var(--sim-label-muted)', 'middle', 700);
    }
    const [ax0, ay0, ax1, ay1] = G.arr;
    svg += `<g class="mk-pop" style="--d:0.5s">${P
      ? `<path d="M${ax0} ${ay0}V${ay1 - 16}" ${stroke('var(--sim-accent)', 7)}/><path d="M${ax1 - 14} ${ay1 - 18}L${ax1} ${ay1}L${ax1 + 14} ${ay1 - 18}Z" ${fill('var(--sim-accent)')}/>`
      : `<path d="M${ax0} ${ay0}H${ax1 + 16}" ${stroke('var(--sim-accent)', 7)}/><path d="M${ax1 + 18} ${ay1 - 14}L${ax1} ${ay1}L${ax1 + 18} ${ay1 + 14}Z" ${fill('var(--sim-accent)')}/>`}</g>`;
    CASES.forEach((cs, i) => {
      const [bx, by] = G.btn[i];
      over += `<button type="button" class="sv-hit tap btn pu-ab pu-btn${this.which === i ? ' on' : ''}" data-which="${i}" aria-pressed="${this.which === i}" style="left:${bx}px;top:${by}px;width:${G.bw}px">${cs.btn}</button>`;
    });
    return { svg, over };
  }

  // b1: the eight cards in four boxes.
  paintAreas(P) {
    const fs = P ? 18 : 18, chipH = 36, gap = 8, pad = 12;
    const cw = (t) => Math.round(t.length * fs * 0.56 + 26);
    const boxes = P
      ? [[12, 12, 366, 0], [12, 0, 366, 0], [12, 0, 366, 0], [12, 0, 366, 0]]
      : [[12, 14, 262, 222], [286, 14, 262, 222], [12, 250, 262, 210], [286, 250, 262, 210]];
    let svg = '', yCursor = 12, k = 0;
    const cx0 = P ? 195 : 280, cy0 = P ? 300 : 240;
    AREAS.forEach((a, i) => {
      const col = `var(--sim-series-${a.s})`, rim = shade(col, 62);
      let [x, y, w, h] = boxes[i];
      // flow the chips into rows
      const rows = [[]];
      let rx = 0;
      for (const c of a.c) {
        const wd = cw(c);
        if (rx + wd > w - 2 * pad && rows[rows.length - 1].length) { rows.push([]); rx = 0; }
        rows[rows.length - 1].push([c, rx, wd]);
        rx += wd + gap;
      }
      const titleH = P ? 40 : 66;
      if (P) { y = yCursor; h = titleH + rows.length * (chipH + gap) + pad; yCursor += h + 12; }
      svg += `<g class="mk-pop" style="--d:${i * 0.1}s">${lipRect(x, y, w, h, 14, `color-mix(in oklab, ${col} 14%, var(--sim-bg-surface))`, rim)}`;
      svg += P ? text(x + pad, y + 28, a.t.join(' '), 21, 'var(--sim-label)', 'start')
        : text(x + w / 2, y + 28, a.t[0], 21, 'var(--sim-label)') + text(x + w / 2, y + 54, a.t[1], 21, 'var(--sim-label)');
      svg += '</g>';
      rows.forEach((row, r) => {
        const rowW = row.reduce((s, [, , wd]) => s + wd + gap, -gap), ox = P ? x + pad : x + (w - rowW) / 2;
        row.forEach(([c, rx2, wd]) => {
          const chx = ox + rx2, chy = y + titleH + r * (chipH + gap);
          const dx = f1(cx0 - (chx + wd / 2)), dy = f1(cy0 - (chy + chipH / 2));
          svg += `<g class="mk-fly" style="--d:${0.5 + k * 0.12}s;--dx:${dx}px;--dy:${dy}px">${lipRect(chx, chy, wd, chipH, 10, 'var(--sim-bg-surface)', rim)}${text(chx + wd / 2, chy + chipH / 2 + 6, c, fs, 'var(--sim-label)')}</g>`;
          k++;
        });
      });
    });
    return { svg };
  }

  testState() { return { view: this.stepIndex, change: this.stepIndex === 0 ? CASES[this.which].btn : null }; }
}
