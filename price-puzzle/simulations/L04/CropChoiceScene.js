/**
 * CropChoiceScene - L04 s02 (predict, setup mount) and s03 "The Crop That Earns More" (2 beats). SvgScene, design
 * units 560 x 480 landscape, 390 x 600 portrait. The farmer (he; SimFigure role farmer via MangoPeople
 * registerCast) and his one field of four SimFarm strips (wheat, 'pulse' = chickpeas). No rupee numbers.
 *   setup  the farmer beside his bare field ('idle' strips), two price tags: "wheat: low price" (down arrow) and
 *          "chickpeas: high price" (up arrow). No crop grown, no answer shown.
 *   b0     two in-figure buttons "last season" / "next season". Last season: 3 wheat strips, 1 chickpea strip.
 *          Next season: 1 wheat, 3 chickpeas (grows in), and two chips: "chickpea supply up", "wheat supply
 *          down". Cold start: last season for a moment, then next season grows in and rests.
 *   b1     the same idea in a factory: a factory that can make school bags or suitcases, two earn tags, and its
 *          shelf of 12 places: the one that earns more fills 9 places, the other 3. Buttons "school bags earn
 *          more" / "suitcases earn more". Cold start: school bags earn more.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { farmSpec, farmSvg, cropTone } from 'simulations/base/kit/SimFarm.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { PEOPLE_CSS, paintPeople, personSlot, registerCast } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, pill, btn } from '../shared/MarketParts.js';
import { bigArrow } from '../shared/SupplyParts.js';

registerCast('farmer', { name: 'the farmer', role: 'farmer', i: 0,
  look: { outfit: 'kurta', hairStyle: 'short', top: 'sage', bottom: 'cream', shoeStyle: 'sandal', pattern: 'plain', moustache: true, glasses: false, dupatta: false, girth: 1 } });

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const LAST = ['wheat', 'wheat', 'wheat', 'pulse'];
const NEXT = ['pulse', 'pulse', 'wheat', 'pulse'];
const UP = 'var(--sim-good)';
const DOWN = 'var(--sim-bad)';
const BAG = 'var(--sim-series-1)';
const CASE = 'color-mix(in oklab, var(--sim-series-8) 80%, var(--sim-label))';

/** A school bag (backpack), front view, (x, y) bottom centre, h tall. */
function schoolBag(x, y, h) {
  const w = h * 0.78, x0 = x - w / 2, top = y - h, rim = shade(BAG, 62);
  return `<path d="M${f1(x - w * 0.2)} ${f1(top + h * 0.14)}c0 ${f1(-h * 0.16)} ${f1(w * 0.4)} ${f1(-h * 0.16)} ${f1(w * 0.4)} 0" ${stroke(rim, h * 0.07)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top + h * 0.1)}" width="${f1(w)}" height="${f1(h * 0.9)}" rx="${f1(w * 0.3)}" ${fill(BAG, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0 + w * 0.16)}" y="${f1(top + h * 0.56)}" width="${f1(w * 0.68)}" height="${f1(h * 0.34)}" rx="${f1(w * 0.12)}" ${fill(shade(BAG, 84), `stroke:${rim};stroke-width:2`)}/>`
    + `<path d="M${f1(x0 + w * 0.22)} ${f1(top + h * 0.66)}H${f1(x0 + w * 0.78)}" ${stroke(rim, 2)}/>`;
}

/** A suitcase, side on, (x, y) bottom centre, h tall. */
function suitcase(x, y, h) {
  const w = h * 0.96, x0 = x - w / 2, top = y - h, rim = shade(CASE, 62);
  return `<path d="M${f1(x - w * 0.18)} ${f1(top + h * 0.2)}V${f1(top + h * 0.06)}H${f1(x + w * 0.18)}V${f1(top + h * 0.2)}" ${stroke(rim, h * 0.07)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top + h * 0.18)}" width="${f1(w)}" height="${f1(h * 0.76)}" rx="${f1(h * 0.1)}" ${fill(CASE, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x0 + w * 0.3)} ${f1(top + h * 0.2)}V${f1(top + h * 0.92)}M${f1(x0 + w * 0.7)} ${f1(top + h * 0.2)}V${f1(top + h * 0.92)}" ${stroke(shade(CASE, 80), h * 0.06)}/>`
    + `<circle cx="${f1(x0 + w * 0.18)}" cy="${f1(y - h * 0.03)}" r="${f1(h * 0.05)}" ${fill(rim)}/><circle cx="${f1(x0 + w * 0.82)}" cy="${f1(y - h * 0.03)}" r="${f1(h * 0.05)}" ${fill(rim)}/>`;
}

const CSS = `
svg .cc-swap { transform-box: fill-box; transform-origin: 50% 100%; animation: cc-swap 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes cc-swap { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .cc-swap { animation: none; } }
.cc-two .mq-btn { white-space: normal; text-align: center; line-height: 1.15; width: var(--bw, 200px); }
`;

export class CropChoiceScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN, [Number.MAX_SAFE_INTEGER]: [[{ idx: 2, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'A farmer has one field that can grow wheat or chickpeas. Last season wheat sold at a low price and chickpeas at a high price. Last season three of his four strips were wheat; next season three of the four are chickpeas, so the supply of chickpeas rises and the supply of wheat falls. A factory that can make school bags or suitcases fills most of its shelf with the one that earns more.';

  async setup() {
    this.season = 'next';
    this.earn = 'bag';
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + BTN_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  get view() { return this.hostRole === 'setup' ? 2 : this.stepIndex; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.grow = false; this.popLab = false; this.swap = false; }

  enter(step) {
    this.clear();
    this.season = 'next';
    this.earn = 'bag';
    const v = this.hostRole === 'setup' ? 2 : step;
    if (v === 0) {
      this.season = 'last';
      this.anim = true;
      this.after(1.0, () => this.toSeason('next'));
    } else if (v === 1) {
      this.swap = true;
      this.anim = true;
      this.after(1.4, () => this.rest());
    }
  }

  rest() { this.anim = false; this.grow = false; this.swap = false; this.popLab = true; this.repaint(); this.popLab = false; }

  toSeason(s) {
    this.clear();
    this.season = s;
    this.grow = true;
    this.anim = true;
    this.repaint();
    this.grow = false;
    this.after(1.3, () => this.rest());
  }

  toEarn(e) {
    if (e === this.earn && !this.anim) return;
    this.clear();
    this.earn = e;
    this.swap = true;
    this.anim = true;
    this.repaint();
    this.swap = false;
    this.after(1.2, () => this.rest());
  }

  act(a, v) {
    if (this.view === 0 && a === 'season') this.toSeason(v);
    else if (this.view === 1 && a === 'earn') this.toEarn(v);
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    if (this.view === 0) this.season = 'next';
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.view;
    const out = v === 1 ? this.paintFactory(P) : this.paintField(P, v === 2);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** A price tag "wheat: low price" with its arrow; crop tone rim. */
  priceTag(x, y, crop, P) {
    const name = crop === 'wheat' ? 'wheat' : 'chickpeas', hi = crop === 'pulse';
    const fs = P ? 19 : 21, tone = cropTone(crop);
    let s = pill(x - 14, y, `${name}: ${hi ? 'high' : 'low'} price`, { size: fs, bg: `color-mix(in oklab, ${tone} 18%, var(--sim-bg-surface))`, edge: tone });
    const tw = `${name}: ${hi ? 'high' : 'low'} price`.length * fs * 0.56 + fs * 1.1;
    const ax = x - 14 + tw / 2 + 20;
    s += bigArrow(ax, y - 17, y + 17, hi ? -1 : 1, hi ? UP : DOWN, 13);
    return s;
  }

  // setup and b0: the farmer and his field.
  paintField(P, setup) {
    let svg = '', over = '';
    const G = P
      ? { tags: [[150, 28], [150, 74]], fx: 24, fy: 232, fw: 342, fh: 236, man: [336, 218, 176], chips: [[100, 496], [292, 496]], b: [[100, 556], [290, 556]], bw: 170 }
      : { tags: [[132, 30], [418, 30]], fx: 186, fy: 76, fw: 356, fh: 272, man: [92, 352, 252], chips: [[230, 386], [452, 386]], b: [[190, 446], [400, 446]], bw: 190 };
    svg += this.priceTag(G.tags[0][0], G.tags[0][1], 'wheat', P) + this.priceTag(G.tags[1][0], G.tags[1][1], 'pulse', P);
    const crops = setup ? ['idle', 'idle', 'idle', 'idle'] : this.season === 'last' ? LAST : NEXT;
    const spec = farmSpec({ strips: crops.map((c) => ({ crop: c, soil: 'loam' })), orient: 'rows', w: G.fw, h: G.fh, gap: 8 });
    svg += farmSvg(spec, { x: G.fx, y: G.fy, tags: false, animate: this.grow ? true : undefined, lag: 0.15 });
    const [mx, my, mh] = G.man;
    over += personSlot('farmer', { x: mx, y: my, h: mh, pose: 'stand', facing: 0, mood: setup ? 'think' : 'smile' });
    if (!setup) {
      const next = this.season === 'next';
      if (next && !this.anim) {
        const pop = this.popLab ? ' class="mq-pop"' : '';
        svg += `<g${pop}>${pill(G.chips[0][0], G.chips[0][1], 'chickpea supply up', { size: P ? 16 : 20, bg: UP, ink: 'var(--sim-bg-deep)', edge: UP })}</g>`;
        svg += `<g${pop}${this.popLab ? ' style="--d:0.2s"' : ''}>${pill(G.chips[1][0], G.chips[1][1], 'wheat supply down', { size: P ? 16 : 20, bg: DOWN, ink: 'var(--sim-bg-deep)', edge: DOWN })}</g>`;
      }
      let two = '';
      [['last', 'last season'], ['next', 'next season']].forEach(([v, lab], i) => {
        two += `<div style="--bw:${G.bw}px">${btn('season', lab, G.b[i][0], G.b[i][1], { val: v, on: v === this.season })}</div>`;
      });
      over += `<div class="cc-two">${two}</div>`;
    }
    return { svg, over };
  }

  // b1: a factory fills its shelf with the good that earns more.
  paintFactory(P) {
    let svg = '', over = '';
    const bagWins = this.earn === 'bag';
    const G = P
      ? { fac: [80, 196, 150], tag: [[270, 70], [270, 160]], shelf: [26, 236, 338, 236], cols: 4, rows: 3, b: [[100, 540], [290, 540]], bw: 176 }
      : { fac: [116, 186, 196], tag: [[384, 56], [384, 142]], shelf: [40, 214, 480, 196], cols: 6, rows: 2, b: [[170, 446], [390, 446]], bw: 200 };
    svg += civicSvg('factory', G.fac[0], G.fac[1], { w: G.fac[2] });
    // the two earn tags: the product and how much it earns
    [['bag', 'school bags'], ['case', 'suitcases']].forEach(([k, name], i) => {
      const [tx, ty] = G.tag[i], more = (k === 'bag') === bagWins;
      const col = more ? UP : 'var(--sim-label-muted)';
      svg += `<rect x="${f1(tx - (P ? 116 : 150))}" y="${f1(ty - 38)}" width="${P ? 232 : 300}" height="76" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${more ? UP : 'var(--sim-stroke)'};stroke-width:${more ? 3.5 : 2}`)}/>`;
      svg += k === 'bag' ? schoolBag(tx - (P ? 86 : 116), ty + 28, 54) : suitcase(tx - (P ? 86 : 116), ty + 26, 50);
      svg += txt(tx - (P ? 52 : 80), ty - 6, name, P ? 18 : 22, 'var(--sim-label)', 'start');
      svg += txt(tx - (P ? 52 : 80), ty + 22, more ? 'earns more' : 'earns less', P ? 17 : 20, col, 'start');
      if (more) svg += bigArrow(tx + (P ? 90 : 124), ty - 24, ty + 24, -1, UP, 14);
    });
    // the shelf
    const [sx, sy, sw, sh] = G.shelf, n = G.cols * G.rows, win = Math.round(n * 0.75);
    const cw = sw / G.cols, rh = sh / G.rows;
    svg += `<rect x="${f1(sx - 8)}" y="${f1(sy - 8)}" width="${f1(sw + 16)}" height="${f1(sh + 14)}" rx="10" ${fill('color-mix(in oklab, var(--sim-series-8) 22%, var(--sim-bg-surface))', 'stroke:color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label));stroke-width:2.5')}/>`;
    for (let r = 0; r < G.rows; r++) {
      const by = sy + (r + 1) * rh;
      svg += `<rect x="${f1(sx - 8)}" y="${f1(by - 4)}" width="${f1(sw + 16)}" height="8" rx="3" ${fill('color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label))')}/>`;
      for (let c = 0; c < G.cols; c++) {
        const i = r * G.cols + c, isBag = bagWins ? i < win : i >= n - win;
        const cx = sx + (c + 0.5) * cw, h = rh * 0.74;
        const anim = this.swap ? ` class="cc-swap" style="--d:${(i * 0.05).toFixed(2)}s"` : '';
        svg += `<g${anim}>${isBag ? schoolBag(cx, by - 5, h) : suitcase(cx, by - 5, h * 0.86)}</g>`;
      }
    }
    let two = '';
    [['bag', 'school bags earn more'], ['case', 'suitcases earn more']].forEach(([v, lab], i) => {
      two += `<div style="--bw:${G.bw}px">${btn('earn', lab, G.b[i][0], G.b[i][1], { val: v, on: v === this.earn, size: P ? 17 : 18 })}</div>`;
    });
    over += `<div class="cc-two">${two}</div>`;
    return { svg, over };
  }

  testState() { return { view: this.view, season: this.season, earn: this.earn, anim: this.anim, strips: (this.season === 'last' ? LAST : NEXT).join(',') }; }
}
