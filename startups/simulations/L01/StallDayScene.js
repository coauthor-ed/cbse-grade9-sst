/**
 * StallDayScene - L01 s01 "A stall at the school festival" (3 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 600 portrait. Cast: shared/StallKit.js (stall, glasses, props, report card) + FinPeople people.
 *   b0 The festival: the nimbu pani stall (the hero), you and two classmates behind it, a parent and a child
 *      walk up (0.8 s); a bunting line and the banner 'Young Entrepreneurs Challenge'. Rest: visitors at the stall.
 *   b1 Choices before the first glass: the same stall, no people; three choice tags hang from the awning over
 *      their props: 'lemons and sugar' (lemons + sugar bag), 'glasses' (cup stack + glasses), 'price per glass'
 *      (a price board with no price yet). Tapping a tag lights its prop, dims the other two, and the card on top
 *      asks that choice's question (the text's three questions). Rest / cold start: nothing picked, all three
 *      tags visible, the card says 'Tap each choice on the stall.'
 *   b2 The report at the end of the day: the stall at dusk (a --sim-sky-dusk wash, empty glasses), you behind
 *      it; the report card big beside it, 'for the class teacher', three rows with blank lines: money spent,
 *      profit or loss, people who liked it (no numbers: the report is still to be filled).
 * Empty glasses (b1, b2) get a muted-label outline and a lifted body (.sd-gl): StallKit's empty glass is dark on dark
 * in the dark theme. No host controls; the tags are buttons inside the figure. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, stall, stallTop, glass, jug, lemonPile, sugarBag, cupStack, priceBoard, reportCard, bunting, banner } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const CHOICES = [
  { tag: 'lemons and sugar', q: 'How much will you spend on lemons and sugar?' },
  { tag: 'glasses', q: 'Where will you get the glasses?' },
  { tag: 'price per glass', q: 'How much will you charge for each glass?' },
];

const CSS = `
.sd-ab { position: absolute; transform: translate(-50%, -50%); }
.sd-tag { cursor: pointer; padding: 6px 10px; text-align: center; line-height: 1.1; white-space: normal;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.sd-tag.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.sd-tag:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.sd-tag:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.sd-card { position: absolute; display: flex; align-items: center; justify-content: center; text-align: center; box-sizing: border-box;
  padding: 8px 14px; border-radius: 14px; text-wrap: balance; font: 800 24px/1.2 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.sd-card.on { border-color: var(--sim-accent); }
.sd-card.hint { color: var(--sim-label-muted); border-style: dashed; }
.sd-walk { animation: sd-walk 0.8s cubic-bezier(.3,.8,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes sd-walk { 0% { transform: translateX(70px); opacity: 0; } 30% { opacity: 1; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .sd-walk { animation: none; } }
`;

export class StallDayScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A nimbu pani stall at the school festival, in the Young Entrepreneurs Challenge: you and two classmates stand behind it, and a parent and a child come up. Three choices before the first glass, each a tag on the stall: lemons and sugar (how much to spend), glasses (where to get them), price per glass (how much to charge). In the evening, a report for the class teacher with three lines still to fill: money spent, profit or loss, people who liked it.';

  async setup() {
    this.pick = -1;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-pick]');
      if (!b || this.stepIndex !== 1) return;
      const i = +b.dataset.pick;
      this.pick = this.pick === i ? -1 : i;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.pick = -1; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintChoices(P, DW, DH) : v === 2 ? this.paintReport(P, DW, DH) : this.paintFestival(P, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the stall at the festival, the team behind it, visitors walking up.
  paintFestival(P, DW, DH) {
    const G = P
      ? { ban: [195, 36, 380, 20], bunt: [8, 78, 382, 78], sx: 162, gy: 528, sw: 290, kids: [86, 162, 238], kh: 196, front: true,
        vis: [[292, 580, 210, -1], [346, 580, 136, -1]] }
      : { ban: [280, 36, 486, 24], bunt: [8, 78, 552, 78], sx: 205, gy: 455, sw: 260, kids: [134, 205, 276], kh: 186,
        vis: [[432, 462, 212, -1], [503, 462, 138, -1]] };
    let svg = banner(G.ban[0], G.ban[1], G.ban[2], 'Young Entrepreneurs Challenge', { size: G.ban[3] });
    svg += bunting(G.bunt[0], G.bunt[1], G.bunt[2], G.bunt[3], P ? 9 : 12, { sag: 18, size: 24 });
    svg += stall(G.sx, G.gy, G.sw, { part: 'back' });
    let over = '';
    const who = ['you', 'classmate1', 'classmate2'];
    G.kids.forEach((x, i) => { over += personSlot(who[i], { x, y: G.gy - 4, h: G.kh, facing: 0, mood: i === 0 ? 'happy' : 'smile' }); });
    let vis = '';
    G.vis.forEach(([x, y, h, f], i) => { vis += personSlot(i ? 'child' : 'parent', { x, y, h, facing: f, mood: 'smile', cls: 'sd-walk', style: `--d:${0.2 + i * 0.15}s;` }); });
    if (!G.front) over += vis;
    const top = stallTop(G.gy, G.sw), [k0, k1, k2] = G.kids;
    let front = stall(G.sx, G.gy, G.sw, { part: 'front' });
    // props sit in the gaps between the three faces, never over them
    front += jug(G.sx - G.sw * 0.42, top, 60) + glass((k0 + k1) / 2, top, 40) + glass((k1 + k2) / 2, top, 40) + lemonPile(G.sx + G.sw * 0.4, top, 9);
    front += nameTag(k0, G.gy - G.kh - 36, 'you', 18);
    over += frontSvg(DW, DH, front);
    if (G.front) over += vis;
    return { svg, over };
  }

  // b1: three choice tags hanging over their props.
  paintChoices(P, DW, DH) {
    const G = P
      ? { sx: 195, gy: 588, sw: 340, card: [14, 24, 362, 132], tagY: 318, tags: [[82, 132], [198, 100], [314, 120]] }
      : { sx: 280, gy: 468, sw: 340, card: [20, 12, 520, 84], tagY: 196, tags: [[165, 132], [285, 100], [400, 120]] };
    const pick = this.pick, top = stallTop(G.gy, G.sw), aBot = G.gy - G.sw * 0.98 + G.sw * 0.07;
    let svg = stall(G.sx, G.gy, G.sw, { part: 'back', sign: '' });
    G.tags.forEach(([x]) => { svg += `<path d="M${x} ${f1(aBot)}V${G.tagY}" ${stroke('var(--sim-stroke)', 2.5)}/>`; });
    let front = stall(G.sx, G.gy, G.sw, { part: 'front' });
    const props = [
      (x) => lemonPile(x - 22, top, 12) + sugarBag(x + 40, top, 84),
      (x) => cupStack(x - 28, top, 74) + glass(x + 16, top, 52, { full: false, cls: 'sd-gl' }) + glass(x + 50, top, 52, { full: false, cls: 'sd-gl' }),
      (x) => priceBoard(x + 6, top, 82, '?', { unit: 'a glass' }),
    ];
    props.forEach((fn, i) => {
      const x = G.tags[i][0], on = pick === i, dim = pick >= 0 && !on;
      const glow = on ? `<ellipse cx="${x + (i === 1 ? 6 : 8)}" cy="${f1(top - 40)}" rx="78" ry="58" ${fill('color-mix(in oklab, var(--sim-accent) 22%, transparent)', 'stroke:var(--sim-accent);stroke-width:3')}/>` : '';
      front += `<g${on ? ' class="st-glow"' : ''}${dim ? ' style="opacity:0.32"' : ''}>${glow}${fn(x)}</g>`;
    });
    let over = frontSvg(DW, DH, front);
    const [cx, cy, cw, ch] = G.card;
    const q = pick >= 0 ? CHOICES[pick].q : 'Tap each choice on the stall.';
    over += `<div class="sd-card${pick >= 0 ? ' on' : ' hint'}" style="left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px">${q}</div>`;
    G.tags.forEach(([x, w], i) => {
      over += `<button type="button" class="sv-hit tap btn sd-ab sd-tag${pick === i ? ' on' : ''}" data-pick="${i}" aria-pressed="${pick === i}" style="left:${x}px;top:${G.tagY + 26}px;width:${w}px">${CHOICES[i].tag}</button>`;
    });
    return { svg, over };
  }

  // b2: the stall at dusk and the report card, still to be filled.
  paintReport(P, DW, DH) {
    const G = P
      ? { sx: 112, gy: 272, sw: 196, you: [112, 182], card: [195, 300, 350, 22], sun: [318, 150, 46] }
      : { sx: 128, gy: 440, sw: 210, you: [128, 196], card: [400, 112, 290, 22], sun: [52, 118, 40] };
    let svg = `<rect x="0" y="0" width="${DW}" height="${DH}" rx="16" ${fill('color-mix(in oklab, var(--sim-sky-dusk) 30%, transparent)')}/>`;
    svg += `<circle cx="${G.sun[0]}" cy="${G.sun[1]}" r="${G.sun[2]}" ${fill('color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-sky-dusk))')}/>`;
    svg += stall(G.sx, G.gy, G.sw, { part: 'back' });
    let over = personSlot('you', { x: G.you[0], y: G.gy - 4, h: G.you[1], facing: 0, mood: 'think' });
    const top = stallTop(G.gy, G.sw);
    let front = stall(G.sx, G.gy, G.sw, { part: 'front' });
    front += jug(G.sx - G.sw * 0.3, top, 56, { full: false }) + glass(G.sx + G.sw * 0.12, top, 40, { full: false, cls: 'sd-gl' }) + glass(G.sx + G.sw * 0.3, top, 40, { full: false, cls: 'sd-gl' });
    over += frontSvg(DW, DH, front);
    const [cx, cy, cw, fs] = G.card;
    svg += `<g class="mk-pop" style="--d:0.15s">${reportCard(cx, cy, cw, [{ label: 'money spent' }, { label: 'profit or loss' }, { label: 'people who liked it' }], { title: 'for the class teacher', size: fs, stack: true })}</g>`;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, pick: this.pick }; }
}
