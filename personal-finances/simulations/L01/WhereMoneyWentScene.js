/**
 * WhereMoneyWentScene - L01 s01 "Where Did the Gift Go?" (3 beats). SvgScene, design 560 x 470 landscape,
 * 390 x 580 portrait. Cast: shared/MoneyKit.js (coins, tags, gift cover, jars), shared/FinPeople.js (Meera, uncle).
 *   b0 A gift of Rs 2,000: Meera holds the gift cover; beside her a big coin pile (one coin per Rs 100) with a tag
 *      "gift Rs 2,000". The uncle stands behind, dimmed.
 *   b1 A week at a time: the pile, "left Rs X", three week slots. "next week" (in the figure) moves that week's four
 *      tags out of the pile into its slot, 0.5 s each; the pile shrinks and "left" counts down 2,000 -> 1,380 ->
 *      740 -> 0. Rest / cold start: all 12 tags placed, pile gone, the Rs 250 tag ringed (the biggest),
 *      "Rs 2,000 spent in 12 small payments", "made-up numbers". "replay" empties the weeks again.
 *   b2 Personal finance: the same Rs 2,000 above four empty jars spend / save / invest / later, a branching
 *      arrow "plan first"; Meera thinking beside it. No amounts in the jars (the text gives none).
 * Colours are tokens only. ASCII only (rupee sign from MoneyKit).
 */
import { SvgScene, stroke, fill } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, coinPile, giftCover, tag, jar, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const WEEKS = [
  [['chaat', 140], ['gel pens', 100], ['gift', 200], ['comic', 180]],
  [['snacks', 160], ['movie', 240], ['stickers', 60], ['auto ride', 180]],
  [['snacks', 190], ['phone cover', 250], ['notebook', 120], ['ice cream', 180]],
];
const ALL = WEEKS.flat();
const GIFT = 2000;
const STEP_S = 0.5;
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

const CSS = `
.wm-ab { position: absolute; transform: translate(-50%, -50%); }
.wm-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border: 2.5px solid color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.wm-btn--quiet { background: var(--sim-bg-surface); color: var(--sim-label); border-color: var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.wm-btn:active { transform: translateY(3px); box-shadow: none; }
.wm-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

const leftAfter = (n) => GIFT - ALL.slice(0, n).reduce((s, t) => s + t[1], 0);

export class WhereMoneyWentScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 580;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Meera gets a gift of 2,000 rupees from her uncle at Diwali. Over three weeks, twelve small payments leave the pile, four a week: 2,000 left, then 1,380, then 740, then nothing. The biggest payment is 250 rupees. A plan made first would split the same 2,000 rupees into spend, save, invest and later.';

  async setup() {
    this.count = ALL.length;
    this.anim = false;
    this.fly = -1;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fly = -1; }

  enter() { this.clear(); this.count = ALL.length; }

  /** Move the next week's four tags, one every STEP_S. */
  nextWeek() {
    if (this.anim || this.count >= ALL.length) return;
    const start = this.count;
    this.anim = true;
    for (let i = 0; i < 4; i++) {
      this.after(0.05 + i * STEP_S, () => { this.count = start + i + 1; this.fly = start + i; this.repaint(); this.fly = -1; });
    }
    this.after(0.05 + 4 * STEP_S, () => { this.anim = false; this.repaint(); });
    this.repaint();
  }

  act(a) {
    if (this.stepIndex !== 1) return;
    if (a === 'next') this.nextWeek();
    else if (a === 'replay') { this.clear(); this.count = 0; this.repaint(); }
  }

  skip() {
    if (!this.anim) return false;
    const end = Math.min(ALL.length, Math.ceil((this.count + 0.5) / 4) * 4);
    this.clear();
    this.count = end;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 580 : 470) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 580 : 470, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintWeeks(P) : v === 2 ? this.paintPlan(P) : this.paintGift(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: Meera with the cover, the uncle behind, the pile and its tag.
  paintGift(P) {
    let svg = '', over = '';
    const G = P
      ? { uncle: [312, 540, 196, -1], meera: [128, 545, 220], cover: [222, 420, 108], pile: [195, 292, 17], tag: [195, 66, 176] }
      : { uncle: [64, 420, 196, 1], meera: [176, 430, 206], cover: [262, 318, 112], pile: [420, 420, 20], tag: [420, 196, 180] };
    over += personSlot('uncle', { x: G.uncle[0], y: G.uncle[1], h: G.uncle[2], facing: G.uncle[3], mood: 'smile', dim: true });
    const [cx, cy, cw] = G.cover;
    svg += giftCover(cx, cy, { w: cw });
    over += personSlot('meera', { x: G.meera[0], y: G.meera[1], h: G.meera[2], pose: 'stand', facing: 1, mood: 'happy',
      hands: [{ x: cx - cw * 0.42, y: cy + 6 }, { x: cx - cw * 0.36, y: cy - 8 }] });
    svg += nameTag(G.meera[0], G.meera[1] + 4, 'meera', 17);
    svg += coinPile(G.pile[0], G.pile[1], GIFT, { r: G.pile[2] });
    svg += `<path d="M${G.tag[0]} ${G.tag[1] + 40}V${G.pile[1] - (P ? 118 : 158)}" ${stroke('var(--sim-stroke)', 2.5, 'stroke-dasharray:3 6')}/>`;
    svg += tag(G.tag[0], G.tag[1], 'gift', GIFT, { w: G.tag[2], valueSize: 34, labelSize: 20, cls: 'mk-pop' });
    svg += text(P ? 375 : 545, P ? 22 : 26, 'made-up numbers', 16, 'var(--sim-label-muted)', 'end', 700);
    return { svg, over };
  }

  // b1: the pile, the left amount, three week slots.
  paintWeeks(P) {
    let svg = '', over = '';
    const G = P
      ? { pile: [118, 168, 12], leftX: 292, leftY: [48, 92], btn: [292, 140], xs: [62, 186, 322], tw: 120, wide: [318, 140], head: 214, ty: 256, dy: 60, end: [496, 530], note: 566 }
      : { pile: [88, 300, 12], leftX: 88, leftY: [46, 90], btn: [88, 352], xs: [216, 346, 478], tw: 126, wide: [482, 142], head: 52, ty: 100, dy: 62, end: [404, 404], note: 446 };
    const left = leftAfter(this.count), done = this.count >= ALL.length;
    svg += text(G.leftX, G.leftY[0], 'left', 20, 'var(--sim-label-muted)', 'middle', 700);
    svg += text(G.leftX, G.leftY[1], rs(left), 34, left === 0 ? 'var(--sim-bad)' : 'var(--sim-label)');
    svg += coinPile(G.pile[0], G.pile[1], left, { r: G.pile[2] });
    WEEKS.forEach((wk, w) => {
      const x = G.xs[w], filled = this.count > w * 4;
      svg += text(x, G.head, `week ${w + 1}`, 21, filled ? 'var(--sim-label)' : 'var(--sim-label-muted)');
      wk.forEach(([lab, amt], i) => {
        const n = w * 4 + i, y = G.ty + i * G.dy;
        if (n < this.count) {
          const fly = n === this.fly ? ` class="mk-fly" style="--dx:${f1(G.pile[0] - x)}px;--dy:${f1(G.pile[1] - 30 - y)}px"` : '';
          const wd = amt === 250, tx = wd ? G.wide[0] : x, tww = wd ? G.wide[1] : G.tw;
          svg += `<g${fly}>${tag(tx, y, lab, amt, { w: tww, labelSize: 18, valueSize: 25, ring: done && wd })}</g>`;
        } else {
          svg += `<rect x="${f1(x - G.tw / 2)}" y="${f1(y - G.tw * 0.23)}" width="${G.tw}" height="${f1(G.tw * 0.46)}" rx="10" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2;stroke-dasharray:6 6')}/>`;
        }
      });
    });
    if (done) {
      if (P) {
        svg += `<g class="mk-pop">${text(195, G.end[0], `${rs(GIFT)} spent`, 30)}${text(195, G.end[1], 'in 12 small payments', 23, 'var(--sim-label)', 'middle', 700)}</g>`;
      } else {
        svg += `<g class="mk-pop">${text(280, G.end[0], `${rs(GIFT)} spent in 12 small payments`, 25)}</g>`;
      }
      svg += text(P ? 195 : 280, G.note, 'biggest payment ' + rs(250) + ',  made-up numbers', 16, 'var(--sim-label-muted)', 'middle', 700);
    }
    const lab = done ? 'replay' : 'next week';
    const act = done ? 'replay' : 'next';
    over += `<div class="wm-ab" style="left:${G.btn[0]}px;top:${G.btn[1]}px"><button type="button" class="sv-hit wm-btn${done ? ' wm-btn--quiet' : ''}" data-act="${act}"${this.anim ? ' aria-disabled="true" style="opacity:0.55"' : ''}>${lab}</button></div>`;
    return { svg, over };
  }

  // b2: the same Rs 2,000, split by a plan before spending.
  paintPlan(P) {
    let svg = '', over = '';
    const G = P
      ? { meera: [72, 236, 156], pile: [258, 196, 12], amt: [258, 234], trunk: [250, 290], xs: [55, 148, 242, 335], jw: 74, jb: 452, jh: 104, lab: 492, plan: [268, 272] }
      : { meera: [72, 440, 196], pile: [330, 150, 12], amt: [470, 112], trunk: [166, 214], xs: [175, 287, 399, 511], jw: 86, jb: 404, jh: 112, lab: 442, plan: [344, 196] };
    over += personSlot('meera', { x: G.meera[0], y: G.meera[1], h: G.meera[2], pose: 'stand', facing: 1, mood: 'think' });
    svg += nameTag(G.meera[0], G.meera[1] + 4, 'meera', 17);
    svg += coinPile(G.pile[0], G.pile[1], GIFT, { r: G.pile[2] });
    svg += text(G.amt[0], G.amt[1], rs(GIFT), 30);
    const px = G.pile[0], [ty0, ty1] = G.trunk, x0 = G.xs[0], x3 = G.xs[3], jt = G.jb - G.jh - 12;
    const d = `M${px} ${ty0}V${ty1}M${x0} ${ty1}H${x3}` + G.xs.map((x) => `M${x} ${ty1}V${jt - 14}`).join('');
    svg += `<path d="${d}" ${stroke('var(--sim-accent)', 5)}/>`;
    G.xs.forEach((x) => { svg += `<path d="M${x - 10} ${jt - 20}L${x} ${jt - 6}L${x + 10} ${jt - 20}Z" ${fill('var(--sim-accent)', 'stroke:var(--sim-accent);stroke-width:3;stroke-linejoin:round')}/>`; });
    svg += text(G.plan[0], G.plan[1], 'plan first', 24, 'var(--sim-accent)', 'start');
    const LIDS = ['var(--sim-series-8)', 'var(--sim-series-3)', 'var(--sim-series-5)', 'var(--sim-series-7)'];
    ['spend', 'save', 'invest', 'later'].forEach((w, i) => {
      svg += `<g class="mk-pop" style="--d:${(0.15 + i * 0.15).toFixed(2)}s">${jar(G.xs[i], G.jb, 0, null, { w: G.jw, h: G.jh, lidCol: LIDS[i] })}</g>`;
      svg += text(G.xs[i], G.lab, w, P ? 22 : 25);
    });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, count: this.count, left: leftAfter(this.count), anim: this.anim }; }
}
