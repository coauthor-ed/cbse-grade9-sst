/**
 * BusinessPlanCardsScene - L03 s02 "A business plan" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 600
 * portrait. Cast: FinPeople (you), StallKit (breadLoaf, cakeJar), SimIcons, SimCivic (school). Drawn here (no
 * kit prop): the plan notebook, a cupcake, a samosa.
 *   b0 A business plan: a big notebook 'ABC Bakery plan' (the hero): a 'goal' line written in, then 'steps' with
 *      three rows: first idea, opening day, running the bakery. You stand beside it with the name chip.
 *   b1 Eight things to think about: a small notebook in the middle, the book's eight cards round it (needs and
 *      idea, potential customers, money and costs, location, human resources, pricing and profits, promotion,
 *      challenges and risks), each with an icon. No numbers, no arrows; the cards pop in out of reading order
 *      (0.12 s apart) and one dashed loop joins them all (each answer affects the others).
 *   b2 Customers change the other answers: the 'potential customers' card on top with three buttons in it
 *      (children / young adults / families; children at rest and on cold start). Three cards under it change
 *      with the pick (pop 0.45 s): 'needs and idea' (cupcakes and a cake jar / samosas / bread), 'pricing and
 *      profits' (low prices for children; '?' to decide otherwise: the text gives no price for the others),
 *      'location' (near the school / '?' / near homes).
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, breadLoaf, cakeJar } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

// The eight cards, clockwise from top left (no order is meant; they pop in out of this order).
const CARDS = [
  { lines: ['needs and', 'idea'], icon: 'bulb', tone: 2 },
  { lines: ['potential', 'customers'], icon: 'family', tone: 1 },
  { lines: ['money and', 'costs'], icon: 'coin', tone: 8 },
  { lines: ['location'], icon: 'pin', tone: 6 },
  { lines: ['human', 'resources'], icon: 'person', tone: 3 },
  { lines: ['pricing and', 'profits'], icon: 'ticket', tone: 4 },
  { lines: ['promotion'], icon: 'megaphone', tone: 5 },
  { lines: ['challenges', 'and risks'], icon: 'question', tone: 7 },
];
const POP_ORDER = [3, 0, 6, 1, 5, 7, 2, 4];
const WHO = [
  { key: 'children', label: 'children', goods: 'cakes and cupcakes', price: 'low prices', place: 'near the school' },
  { key: 'young', label: 'young adults', goods: 'savoury snacks', price: null, place: null },
  { key: 'families', label: 'families', goods: 'everyday bread', price: null, place: 'near homes' },
];

const CSS = `
.bp-ab { position: absolute; transform: translate(-50%, -50%); }
.bp-btn { min-height: 48px; padding: 4px 8px; cursor: pointer; line-height: 1.05;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.05 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.bp-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.bp-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.bp-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .bp-pop { transform-box: fill-box; transform-origin: center; animation: bp-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes bp-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .bp-write { stroke-dasharray: 400; stroke-dashoffset: 400; animation: bp-write 0.6s ease-out forwards; animation-delay: var(--d, 0s); }
@keyframes bp-write { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { svg .bp-pop, svg .bp-write { animation: none; stroke-dashoffset: 0; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;

/** A flat card with a lip; (x, y) centre. */
function card(x, y, w, h, o = {}) {
  const rim = o.ring ? 'var(--sim-accent)' : 'var(--sim-stroke)';
  const bg = o.ring ? 'color-mix(in oklab, var(--sim-accent) 10%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)';
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(rim)}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(bg, `stroke:${rim};stroke-width:${o.ring ? 3.5 : 2.5}`)}/>`;
}

/** One of the eight plan cards: icon on the left, one or two lines of words. */
function planCard(c, x, y, w, h, size, o = {}) {
  let s = card(x, y, w, h, o) + icon(c.icon, c.tone, x - w / 2 + 28, y, 36);
  const tx = x - w / 2 + 52, n = c.lines.length;
  c.lines.forEach((l, i) => { s += text(tx, y + size * 0.36 + (i - (n - 1) / 2) * size * 1.3, l, size, 'var(--sim-label)', 'start'); });
  return s;
}

/** The plan notebook (drawn here): a page with spiral rings on top; (x, y) top centre. */
function notebook(x, y, w, h, title, size) {
  const x0 = x - w / 2, cover = 'color-mix(in oklab, var(--sim-series-4) 70%, var(--sim-label) 10%)', rim = shade(cover, 64);
  let s = `<rect x="${f1(x0 + 6)}" y="${f1(y + 8)}" width="${f1(w)}" height="${f1(h)}" rx="12" ${fill(rim)}/>`
    + `<rect x="${f1(x0)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="12" ${fill(cover, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0 + 8)}" y="${f1(y + 8)}" width="${f1(w - 16)}" height="${f1(h - 16)}" rx="6" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
  const n = Math.max(4, Math.round(w / 34));
  for (let i = 0; i < n; i++) {
    const rx = x0 + w * (i + 0.5) / n;
    s += `<rect x="${f1(rx - 4)}" y="${f1(y - 10)}" width="8" height="24" rx="4" ${fill('var(--sim-bg-deep)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>`;
  }
  if (title) s += text(x, y + 20 + size * 1.1, title, size, 'var(--sim-label)');
  return s;
}

function cupcake(x, y, h) {
  const w = h * 0.8, cup = 'color-mix(in oklab, var(--sim-series-1) 55%, var(--sim-bg-surface))', top = 'color-mix(in oklab, var(--sim-series-4) 40%, var(--sim-bg-surface))';
  const cy = y - h * 0.5;
  let s = `<path d="M${f1(x - w / 2)} ${f1(cy)}L${f1(x - w * 0.36)} ${f1(y)}H${f1(x + w * 0.36)}L${f1(x + w / 2)} ${f1(cy)}Z" ${fill(cup, `stroke:${shade(cup, 64)};stroke-width:2;stroke-linejoin:round`)}/>`;
  for (let i = 1; i < 4; i++) s += `<path d="M${f1(x - w / 2 + i * w / 4)} ${f1(cy + 2)}L${f1(x - w * 0.36 + i * w * 0.18)} ${f1(y - 2)}" ${stroke(shade(cup, 64), 1.5)}/>`;
  s += `<path d="M${f1(x - w * 0.56)} ${f1(cy)}Q${f1(x - w * 0.56)} ${f1(cy - h * 0.48)} ${f1(x)} ${f1(cy - h * 0.48)}Q${f1(x + w * 0.56)} ${f1(cy - h * 0.48)} ${f1(x + w * 0.56)} ${f1(cy)}Z" ${fill(top, `stroke:${shade(top, 64)};stroke-width:2;stroke-linejoin:round`)}/>`;
  s += `<circle cx="${f1(x)}" cy="${f1(cy - h * 0.52)}" r="${f1(h * 0.08)}" ${fill('var(--sim-series-6)', `stroke:${shade('var(--sim-series-6)', 64)};stroke-width:1.5`)}/>`;
  return s;
}

function samosa(x, y, w) {
  const col = 'color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-series-2))', rim = shade(col, 62), h = w * 0.82;
  return `<path d="M${f1(x - w / 2)} ${f1(y)}Q${f1(x)} ${f1(y + 6)} ${f1(x + w / 2)} ${f1(y)}L${f1(x + 4)} ${f1(y - h)}Q${f1(x)} ${f1(y - h - 4)} ${f1(x - 4)} ${f1(y - h)}Z" ${fill(col, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x)} ${f1(y - h + 6)}L${f1(x - w * 0.12)} ${f1(y - 4)}" ${stroke(rim, 2)}/>`;
}

export class BusinessPlanCardsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A business plan for ABC Bakery: a notebook with the goal and the steps, from the first idea to opening day to running the bakery. The eight things a plan explores, in no fixed order: needs and idea, potential customers, money and costs, location, human resources, pricing and profits, promotion, challenges and risks. Picking the customers changes other answers: for children, cakes and cupcakes, low prices, a shop near the school; for young adults, savoury snacks; for families, everyday bread and a shop near homes.';

  async setup() {
    this.who = 0;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-who]');
      if (!b || this.stepIndex !== 2) return;
      const i = +b.dataset.who;
      if (i === this.who) return;
      this.who = i;
      this.fresh = true;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.who = 0; this.fresh = false; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintCustomers(P) : v === 1 ? this.paintEight(P) : this.paintPlan(P, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the plan notebook, big, with a goal and three steps.
  paintPlan(P, DW, DH) {
    const G = P
      ? { nb: [195, 34, 350, 340], you: [300, 590, 150], fs: 28, row: 34, rs: 24 }
      : { nb: [228, 50, 380, 372], you: [486, 452, 230], fs: 30, row: 40, rs: 26 };
    const [x, y, w, h] = G.nb, x0 = x - w / 2 + 34;
    let svg = notebook(x, y, w, h, 'ABC Bakery plan', G.fs);
    let ly = y + 20 + G.fs * 1.1 + 52;
    svg += text(x0, ly, 'goal', 22, 'var(--sim-label-muted)', 'start', 700);
    // the goal, written in: a hand-written line (no words: the text does not say what it is)
    svg += `<path class="bp-write" style="--d:0.1s" d="M${f1(x0 + 66)} ${f1(ly - 6)}c14 -14 22 10 36 -2s20 -10 32 2s22 6 34 -4s18 -6 30 2s18 2 26 -2" ${stroke('var(--sim-series-1)', 4, 'stroke-linecap:round;stroke-linejoin:round')}/>`;
    ly += 50;
    svg += text(x0, ly, 'steps', 22, 'var(--sim-label-muted)', 'start', 700);
    const steps = [['bulb', 2, 'first idea'], ['shop', 6, 'opening day'], ['coin', 8, 'running the bakery']];
    steps.forEach(([ic, t, lab], i) => {
      const ry = ly + 26 + i * (G.row + 22) + 20;
      svg += `<g class="bp-pop" style="--d:${(0.5 + i * 0.25).toFixed(2)}s">`
        + `<rect x="${f1(x0)}" y="${f1(ry - 22)}" width="26" height="26" rx="6" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>`
        + icon(ic, t, x0 + 54, ry - 9, 38) + text(x0 + 82, ry, lab, G.rs, 'var(--sim-label)', 'start') + '</g>';
      if (i < 2) svg += `<path d="M${f1(x0 + 13)} ${f1(ry + 8)}V${f1(ry + G.row + 2)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:3 6;stroke-linecap:round')}/>`;
    });
    let over = personSlot('you', { x: G.you[0], y: G.you[1], h: G.you[2], facing: -1, mood: 'happy' });
    if (!P) over += frontSvg(DW, DH, nameTag(G.you[0], G.you[1] - G.you[2] - 36, 'you', 18));
    return { svg, over };
  }

  // b1: the eight cards round a small notebook, joined by one dashed loop.
  paintEight(P) {
    const G = P
      ? { nb: [195, 26, 170, 112], pos: [[100, 206], [290, 206], [100, 298], [290, 298], [100, 390], [290, 390], [100, 482], [290, 482]],
        cw: 178, ch: 76, loop: [16, 160, 358, 368] }
      : { nb: [280, 168, 170, 128], pos: [[95, 64], [280, 64], [465, 64], [465, 236], [465, 408], [280, 408], [95, 408], [95, 236]],
        cw: 174, ch: 76, loop: [95, 64, 370, 344] };
    let svg = '';
    const [lx, ly, lw, lh] = G.loop;
    svg += `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="40" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3.5;stroke-dasharray:4 10;stroke-linecap:round')}/>`;
    const [nx, ny, nw, nh] = G.nb;
    svg += notebook(nx, ny, nw, nh, '', 20) + text(nx, ny + 54, 'ABC Bakery', 20) + text(nx, ny + 80, 'plan', 20);
    // order (portrait reads in rows, so the clockwise list is re-ordered into rows)
    const idx = P ? [0, 1, 7, 2, 6, 3, 5, 4] : [0, 1, 2, 3, 4, 5, 6, 7];
    idx.forEach((ci, slot) => {
      const [x, y] = G.pos[slot], d = 0.1 + POP_ORDER.indexOf(ci) * 0.12;
      svg += `<g class="bp-pop" style="--d:${d.toFixed(2)}s">${planCard(CARDS[ci], x, y, G.cw, G.ch, 20)}</g>`;
    });
    return { svg };
  }

  // b2: the customers card with three buttons, and the three answers it changes.
  paintCustomers(P) {
    const w = WHO[this.who];
    const G = P
      ? { top: [195, 66, 370, 116], btnY: 94, btnX: [72, 195, 318], bw: 116, cards: [[195, 198], [195, 318], [195, 438]], cw: 370, ch: 104, row: true }
      : { top: [280, 60, 540, 108], btnY: 84, btnX: [130, 280, 430], bw: 140, cards: [[95, 290], [280, 290], [465, 290]], cw: 174, ch: 260, row: false };
    const [tx, ty, tw, th] = G.top;
    let svg = '';
    // links from the customers card to the three it changes
    G.cards.forEach(([cx, cy]) => {
      svg += P ? '' : `<path d="M${f1(cx)} ${f1(ty + th / 2)}V${f1(cy - G.ch / 2)}" ${stroke('var(--sim-accent)', 3.5, 'stroke-dasharray:4 9;stroke-linecap:round')}/>`;
    });
    if (P) svg += `<path d="M24 ${ty + th / 2}V${G.cards[2][1]}" ${stroke('var(--sim-accent)', 3.5, 'stroke-dasharray:4 9;stroke-linecap:round')}/>`;
    svg += card(tx, ty, tw, th, { ring: true }) + icon('family', 1, tx - tw / 2 + 28, ty - th / 2 + 24, 30) + text(tx - tw / 2 + 50, ty - th / 2 + 32, 'potential customers', 21, 'var(--sim-label)', 'start');
    const pop = (s, d) => (this.fresh ? `<g class="bp-pop" style="--d:${d}s">${s}</g>` : s);
    const answers = [
      { c: CARDS[0], val: w.goods, pic: (x, y, s) => (this.who === 0 ? cupcake(x - s * 0.28, y, s * 0.8) + cakeJar(x + s * 0.34, y, s * 0.78)
        : this.who === 1 ? samosa(x - s * 0.3, y, s * 0.62) + samosa(x + s * 0.3, y, s * 0.62) : breadLoaf(x - s * 0.28, y, s * 0.7) + breadLoaf(x + s * 0.34, y, s * 0.6)) },
      { c: CARDS[5], val: w.price, pic: (x, y, s) => (w.price ? coin(x - s * 0.18, y - s * 0.34, s * 0.3) + `<path d="M${f1(x + s * 0.32)} ${f1(y - s * 0.72)}V${f1(y - s * 0.08)}m-${f1(s * 0.14)} -${f1(s * 0.16)}l${f1(s * 0.14)} ${f1(s * 0.16)}l${f1(s * 0.14)} -${f1(s * 0.16)}" ${stroke('var(--sim-good)', 6, 'stroke-linecap:round;stroke-linejoin:round')}/>` : '') },
      { c: CARDS[3], val: w.place, pic: (x, y, s) => (!w.place ? '' : this.who === 0 ? civicSvg('school', x, y, { w: s * 1.5 })
        : `<g transform="translate(${f1(x - s * 0.62)} ${f1(y - s * 0.62)}) scale(${(s * 0.62 / 48).toFixed(3)})">${iconSvg('house', 6)}</g><g transform="translate(${f1(x + 2)} ${f1(y - s * 0.56)}) scale(${(s * 0.56 / 48).toFixed(3)})">${iconSvg('house', 4)}</g>`) },
    ];
    answers.forEach((a, i) => {
      const [cx, cy] = G.cards[i];
      svg += card(cx, cy, G.cw, G.ch);
      if (P) {
        // a row: title top left, picture left, the answer big on the right
        const x0 = cx - G.cw / 2;
        svg += icon(a.c.icon, a.c.tone, x0 + 24, cy - G.ch / 2 + 22, 28) + text(x0 + 44, cy - G.ch / 2 + 29, a.c.lines.join(' '), 19, 'var(--sim-label-muted)', 'start', 700);
        svg += pop(a.pic(x0 + 78, cy + G.ch / 2 - 10, 62), 0.05 + i * 0.1);
        svg += pop(a.val ? text(x0 + 140, cy + 24, a.val, 22, 'var(--sim-label)', 'start') : text(x0 + 140, cy + 26, '? to decide', 22, 'var(--sim-label-muted)', 'start', 700), 0.1 + i * 0.1);
      } else {
        const y0 = cy - G.ch / 2;
        svg += planCard(a.c, cx, y0 + 40, G.cw - 12, 64, 19).replace(/<rect[^>]*\/><rect[^>]*\/>/, '');
        svg += pop(a.pic(cx, y0 + 172, 84), 0.05 + i * 0.1);
        if (a.val) {
          const words = a.val.split(' '), l1 = words.slice(0, Math.ceil(words.length / 2)).join(' '), l2 = words.slice(Math.ceil(words.length / 2)).join(' ');
          svg += pop(text(cx, y0 + 206, l1, 23) + text(cx, y0 + 236, l2, 23), 0.1 + i * 0.1);
        } else svg += pop(text(cx, y0 + 150, '?', 64, 'var(--sim-label-muted)') + text(cx, y0 + 224, 'to decide', 22, 'var(--sim-label-muted)', 'middle', 700), 0.1 + i * 0.1);
      }
    });
    let over = '';
    WHO.forEach((o, i) => {
      over += `<button type="button" class="sv-hit tap btn bp-ab bp-btn${i === this.who ? ' on' : ''}" data-who="${i}" aria-pressed="${i === this.who}" style="left:${G.btnX[i]}px;top:${G.btnY}px;width:${G.bw}px">${o.label}</button>`;
    });
    this.fresh = false;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, who: this.stepIndex === 2 ? WHO[this.who].key : null }; }
}
