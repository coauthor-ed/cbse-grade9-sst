/**
 * BakeryCustomersSetupScene - L03 s01 setup (the predict "Opening a bakery", 1 beat). SvgScene, design 560 x 480
 * landscape, 390 x 600 portrait. Cast: shared/StallKit.js (bakery) + FinPeople people (you, classmate1,
 * classmate2, parent, child) + two school children registered here (uniform, no series top).
 *   b0 ABC Bakery (the hero) on a pavement, you and your two friends beside it. On the other side stand the main
 *      customers: two buttons in the figure, 'families nearby' (mother, father, child under two house icons) and
 *      'school children' (three children in uniform under a SimCivic school). Tapping a button walks that group up (0.6 s).
 *      Cold start / rest: families (the first plan). Nothing else changes: the bakery, its goods and its sign
 *      stay the same, so the answer to the predict is not shown.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, bakery } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }]];
const KID = { outfit: 'shirt', top: 'cream', bottom: 'navy', shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1, sleeves: 'short' };
registerCast('schoolkid1', { name: 'School child', series: 0, role: 'child', i: 31, look: { ...KID, hairStyle: 'short', bottomStyle: 'shorts' } });
registerCast('schoolkid2', { name: 'School child', series: 0, role: 'child', i: 32, look: { ...KID, hairStyle: 'braid', bottomStyle: 'skirt' } });
registerCast('schoolkid3', { name: 'School child', series: 0, role: 'child', i: 33, look: { ...KID, hairStyle: 'bob', bottomStyle: 'skirt' } });

const GROUPS = [
  { key: 'fam', label: 'families nearby', icon: 'house', tone: 6, who: [['mother', 0.94], ['parent', 1], ['child', 0.66]] },
  { key: 'kids', label: 'school children', icon: 'school', tone: 4, who: [['schoolkid1', 0.72], ['schoolkid2', 0.7], ['schoolkid3', 0.74]] },
];

const CSS = `
.bc-ab { position: absolute; transform: translate(-50%, -50%); }
.bc-btn { min-height: 48px; padding: 5px 10px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.bc-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.bc-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.bc-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.bc-walk { animation: bc-walk 0.6s cubic-bezier(.3,.8,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes bc-walk { 0% { transform: translateX(60px); opacity: 0; } 35% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .bc-pop { transform-box: fill-box; transform-origin: center bottom; animation: bc-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes bc-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .bc-walk, svg .bc-pop { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** A SimIcons icon, s design px across, bottom centre (x, y). */
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;

export class BakeryCustomersSetupScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 1: MAIN, [Number.MAX_SAFE_INTEGER]: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'ABC Bakery, a small shop that you and two friends plan to open. Who will the main customers be? Two buttons: families who live nearby, or children from the school next door. Tapping one brings that group to the shop.';

  async setup() {
    this.g = 0;
    this.moved = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-g]');
      if (!b) return;
      const g = +b.dataset.g;
      if (g === this.g) return;
      this.g = g;
      this.moved = true;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.g = 0; this.moved = false; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const G = P
      ? { bx: 150, bg: 286, bw: 210, gy: 500, pave: [262, 286], kids: [44, 96, 148], kh: 138, cust: [246, 296, 348], ch: 150, ic: [322, 170, 120],
        cap: [195, 540], btn: [[103, 578], [287, 578]], bw2: 176 }
      : { bx: 290, bg: 372, bw: 214, gy: 372, pave: [352, 376], kids: [48, 102, 156], kh: 150, cust: [436, 486, 534], ch: 160, ic: [486, 168, 140],
        cap: [280, 412], btn: [[168, 448], [392, 448]], bw2: 212 };
    const grp = GROUPS[this.g];
    // the pavement and a soft road edge
    let svg = `<rect x="0" y="${G.pave[0]}" width="${DW}" height="${G.pave[1] - G.pave[0] + 8}" rx="8" ${fill('color-mix(in oklab, var(--sim-stroke) 22%, var(--sim-bg-surface))')}/>`;
    if (P) svg += `<rect x="0" y="${G.gy - 22}" width="${DW}" height="30" rx="8" ${fill('color-mix(in oklab, var(--sim-stroke) 22%, var(--sim-bg-surface))')}/>`;
    svg += bakery(G.bx, G.bg, G.bw);
    // where the customers come from: their homes or the school next door, over the group
    const [ix, iy, iw] = G.ic;
    const home = grp.icon === 'house' ? icon('house', 6, ix - iw * 0.26, iy, iw * 0.5) + icon('house', 4, ix + iw * 0.26, iy - 4, iw * 0.44) : civicSvg('school', ix, iy, { w: iw });
    svg += `<g class="bc-pop"${this.moved ? '' : ' style="animation:none"'} data-k="${grp.key}">${home}</g>`;
    // the team, beside the shop
    let over = '';
    ['you', 'classmate1', 'classmate2'].forEach((w, i) => { over += personSlot(w, { x: G.kids[i], y: G.gy, h: G.kh, facing: 0, mood: i ? 'smile' : 'happy' }); });
    // the customers
    grp.who.forEach(([w, s], i) => {
      over += personSlot(w, { x: G.cust[i], y: G.gy, h: G.ch * s, facing: -1, mood: 'smile', cls: this.moved ? 'bc-walk' : '', style: `--d:${(i * 0.12).toFixed(2)}s;` });
    });
    let front = nameTag(G.kids[0], G.gy - G.kh - 34, 'you', 18);
    over += frontSvg(DW, DH, front);
    svg += text(G.cap[0], G.cap[1], 'main customers?', 22, 'var(--sim-label)');
    GROUPS.forEach((g, i) => {
      const [bx, by] = G.btn[i];
      over += `<button type="button" class="sv-hit tap btn bc-ab bc-btn${i === this.g ? ' on' : ''}" data-g="${i}" aria-pressed="${i === this.g}" style="left:${bx}px;top:${by}px;width:${G.bw2}px">${g.label}</button>`;
    });
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { view: this.stepIndex, group: GROUPS[this.g].key }; }
}
