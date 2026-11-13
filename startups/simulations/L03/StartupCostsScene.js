/**
 * StartupCostsScene - L03 s02b "Money and costs" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 600
 * portrait. Cast: MoneyKit (jar, coin, gullak), StallKit (sugarBag), SimCivic (shop, bank), SimIcons (family,
 * crowd, person), FinPeople (a baker on the staff). Drawn here (no kit prop): an oven, a cake box, nuts, the
 * account book.
 *   b0 Money and costs: the money jar 'initial investment' in the middle (the hero); five things it pays for
 *      round it: oven, shop rent, staff salaries, flour and nuts, packaging. A coin flies from the jar to each
 *      (0.5 s, 0.15 s apart) and stays by it. No numbers (the text gives none).
 *   b1 Where the money comes from: the same jar; five sources round it: your savings (a gullak), bank loan (a
 *      bank), friends, relatives, investors. A coin flies from each into the jar.
 *   b2 Keeping track of the money: an account book (the hero), two pages: 'money in' (good colour, +) and
 *      'money out' (bad colour, -). Rest / cold start: two lines in, one line out. Two buttons in the figure:
 *      'make a sale' writes a line on the money in page, 'buy supplies' a line on the money out page (pop
 *      0.45 s); a page keeps its last 5 lines.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS, jar, coin, gullak } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, sugarBag } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const SALES = ['cake sold', 'bread sold', 'cupcakes sold', 'cake jar sold'];
const BUYS = ['flour bought', 'butter bought', 'boxes bought', 'nuts bought'];
const KEEP = 5;

const CSS = `
.sc-ab { position: absolute; transform: translate(-50%, -50%); }
.sc-btn { min-height: 48px; padding: 5px 10px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.sc-btn.in { border-color: var(--sim-good); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-good); }
.sc-btn.out { border-color: var(--sim-bad); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-bad); }
.sc-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.sc-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .sc-fly { animation: sc-fly 0.5s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes sc-fly { 0% { transform: translate(var(--fx), var(--fy)); opacity: 0; } 20% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .sc-pop { transform-box: fill-box; transform-origin: left center; animation: sc-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes sc-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .sc-fly, svg .sc-pop { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;

/** An oven (drawn here): a box with a glass door and two knobs; (x, y) bottom centre. */
function oven(x, y, w) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, body = 'color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))', rim = shade(body, 60);
  const glow = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))';
  let s = `<rect x="${f1(x0)}" y="${f1(top + 4)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill(rim)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill(body, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x0)} ${f1(top + h * 0.22)}H${f1(x0 + w)}" ${stroke(rim, 2.5)}/>`;
  for (const k of [0.2, 0.36]) s += `<circle cx="${f1(x0 + w * k)}" cy="${f1(top + h * 0.11)}" r="${f1(w * 0.05)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0 + w * 0.12)}" y="${f1(top + h * 0.32)}" width="${f1(w * 0.76)}" height="${f1(h * 0.56)}" rx="6" ${fill(glow, `stroke:${rim};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x0 + w * 0.22)} ${f1(top + h * 0.3)}H${f1(x0 + w * 0.78)}" ${stroke(rim, 5, 'stroke-linecap:round')}/>`;
  s += `<path d="M${f1(x - w * 0.22)} ${f1(top + h * 0.78)}h${f1(w * 0.44)}" ${stroke(shade(glow, 70), 3)}/>`;
  return s;
}

/** A cake box with a ribbon (drawn here); (x, y) bottom centre. */
function cakeBox(x, y, w) {
  const h = w * 0.62, x0 = x - w / 2, top = y - h, body = 'var(--sim-bg-surface)', rib = 'var(--sim-series-6)', rim = 'var(--sim-stroke)';
  return `<rect x="${f1(x0)}" y="${f1(top + 4)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(rim)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(body, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0 - 4)}" y="${f1(top - 4)}" width="${f1(w + 8)}" height="${f1(h * 0.24)}" rx="5" ${fill('color-mix(in oklab, var(--sim-series-6) 18%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - w * 0.06)}" y="${f1(top - 4)}" width="${f1(w * 0.12)}" height="${f1(h + 4)}" ${fill(rib)}/>`
    + `<path d="M${f1(x)} ${f1(top - 4)}c-18 -16 -26 2 -12 6zM${f1(x)} ${f1(top - 4)}c18 -16 26 2 12 6z" ${fill(rib, `stroke:${shade(rib, 64)};stroke-width:2`)}/>`;
}

function nuts(x, y, r) {
  const col = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 25%)';
  let s = '';
  [[-1.4, 0], [0, -0.2], [1.4, 0], [-0.7, -1.1], [0.7, -1.2]].forEach(([dx, dy]) => {
    s += `<ellipse cx="${f1(x + dx * r)}" cy="${f1(y - r * 0.7 + dy * r)}" rx="${f1(r * 0.8)}" ry="${f1(r * 0.6)}" ${fill(col, `stroke:${shade(col, 62)};stroke-width:1.5`)}/>`;
  });
  return s;
}

export class StartupCostsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'The initial investment for ABC Bakery pays for an oven, shop rent, staff salaries, flour and nuts, and packaging. The money can come from your own savings, a bank loan, friends, relatives or investors. Once the bakery opens, an account book has two pages: money in, with a line for every sale, and money out, with a line for every purchase.';

  async setup() {
    this.reset();
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || this.stepIndex !== 2) return;
      if (b.dataset.act === 'sell') { this.ins.push(SALES[this.ns++ % SALES.length]); this.fresh = 'in'; }
      else { this.outs.push(BUYS[this.nb++ % BUYS.length]); this.fresh = 'out'; }
      this.ins = this.ins.slice(-KEEP);
      this.outs = this.outs.slice(-KEEP);
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  reset() { this.ins = [SALES[0], SALES[1]]; this.outs = [BUYS[0]]; this.ns = 2; this.nb = 1; this.fresh = null; }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.reset(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintBook(P) : this.paintJar(P, v === 1);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0 / b1: the jar in the middle, five things round it; coins fly out (b0) or in (b1).
  paintJar(P, isIn) {
    const G = P
      ? { jar: [195, 360, 104], title: [195, 44], spots: [[70, 236], [318, 236], [70, 476], [300, 476], [195, 548]], lab: 22, sub: 20 }
      : { jar: [280, 320, 126], title: [280, 48], spots: [[88, 204], [472, 204], [88, 412], [472, 412], [280, 436]], lab: 24, sub: 21 };
    const [jx, jy, jw] = G.jar, mouth = { x: jx, y: jy - jw * 1.3 - 8 };
    let svg = text(G.title[0], G.title[1], isIn ? 'where the money comes from' : 'initial investment', P ? 26 : 30, 'var(--sim-label)');
    if (!isIn) svg += text(G.title[0], G.title[1] + 30, 'before the first sale', G.sub, 'var(--sim-label-muted)', 'middle', 700);
    // spokes from the jar to each thing, under the jar
    const jc = { x: jx, y: jy - jw * 0.62 };
    G.spots.forEach(([x, y]) => {
      const c = this.coinAt(x, y, jx);
      svg += `<path d="M${f1(jc.x)} ${f1(jc.y)}L${f1(c[0])} ${f1(c[1])}" ${stroke(isIn ? 'var(--sim-good)' : 'var(--sim-series-8)', 3.5, 'stroke-dasharray:3 9;stroke-linecap:round')}/>`;
    });
    svg += jar(jx, jy, isIn ? 900 : 1000, null, { w: jw, max: 1100, label: '' });
    let over = '';
    const things = isIn
      ? [
        { lab: 'your savings', art: (x, y) => gullak(x, y, { w: 84 }) },
        { lab: 'bank loan', art: (x, y) => civicSvg('bank', x, y, { w: 118 }) },
        { lab: 'friends', art: (x, y) => icon('crowd', 2, x, y, 90) },
        { lab: 'relatives', art: (x, y) => icon('family', 6, x, y, 90) },
        { lab: 'investors', art: (x, y) => icon('person', 7, x, y, 80) },
      ]
      : [
        { lab: 'oven', art: (x, y) => oven(x, y, 104) },
        { lab: 'staff salaries', art: (x, y) => { over += personSlot('buyer2', { x, y, h: 116, facing: -1, mood: 'smile' }); return ''; } },
        { lab: 'shop rent', art: (x, y) => civicSvg('shop', x, y, { w: 118 }) },
        { lab: 'flour and nuts', art: (x, y) => sugarBag(x - 20, y, 82, { label: 'flour' }) + nuts(x + 34, y, 12) },
        { lab: 'packaging', art: (x, y) => cakeBox(x, y, 92) },
      ];
    things.forEach((t, i) => {
      const [x, y] = G.spots[i], d = 0.2 + i * 0.15;
      svg += t.art(x, y) + text(x, y + 28, t.lab, G.lab);
      // one coin on the spoke: it flies out to the thing (b0) or in from it (b1)
      const [ex, ey] = this.coinAt(x, y, jx);
      const [cx, cy] = isIn ? [mouth.x, mouth.y - 6] : [ex, ey], [fx, fy] = isIn ? [ex - mouth.x, ey - mouth.y] : [mouth.x - ex, mouth.y - ey];
      svg += `<g class="sc-fly" style="--d:${d.toFixed(2)}s;--fx:${f1(fx)}px;--fy:${f1(fy)}px">${coin(cx + (isIn ? (i - 2) * 8 : 0), cy, 16)}</g>`;
    });
    return { svg, over };
  }

  // b2: the account book: money in on the left page, money out on the right.
  paintBook(P) {
    const G = P
      ? { book: [4, 30, 382, 430], fs: 19, row: 56, r0: 140, btn: [[100, 530], [290, 530]], bw: 178, head: 23 }
      : { book: [24, 18, 512, 360], fs: 22, row: 50, r0: 128, btn: [[160, 432], [400, 432]], bw: 220, head: 26 };
    const [bx, by, bw, bh] = G.book, mid = bx + bw / 2, cover = 'color-mix(in oklab, var(--sim-series-7) 60%, var(--sim-label) 15%)';
    let svg = `<rect x="${bx}" y="${by + 6}" width="${bw}" height="${bh}" rx="14" ${fill(shade(cover, 60))}/>`
      + `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="14" ${fill(cover, `stroke:${shade(cover, 60)};stroke-width:2.5`)}/>`;
    const pages = [{ x: bx + 10, rows: this.ins, head: 'money in', col: 'var(--sim-good)', sign: '+', key: 'in' },
      { x: mid + 4, rows: this.outs, head: 'money out', col: 'var(--sim-bad)', sign: '-', key: 'out' }];
    const pw = bw / 2 - 14;
    pages.forEach((pg) => {
      svg += `<rect x="${f1(pg.x)}" y="${by + 10}" width="${f1(pw)}" height="${bh - 20}" rx="8" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
      svg += `<rect x="${f1(pg.x)}" y="${by + 10}" width="${f1(pw)}" height="${G.head * 2.3}" rx="8" ${fill(`color-mix(in oklab, ${pg.col} 18%, var(--sim-bg-surface))`)}/>`;
      svg += text(pg.x + pw / 2, by + 10 + G.head * 1.5, `${pg.sign} ${pg.head}`, G.head, shade(pg.col, 72));
      for (let i = 0; i < KEEP; i++) {
        const ly = by + G.r0 + i * G.row;
        svg += `<path d="M${f1(pg.x + 12)} ${f1(ly + 12)}H${f1(pg.x + pw - 12)}" ${stroke('color-mix(in oklab, var(--sim-stroke) 60%, transparent)', 1.5)}/>`;
        const lab = pg.rows[i];
        if (!lab) continue;
        const isNew = this.fresh === pg.key && i === pg.rows.length - 1;
        const row = (P ? '' : coin(pg.x + 26, ly - 6, 13)) + text(pg.x + (P ? 10 : 46), ly + 2, `<tspan style="fill:${shade(pg.col, 72)}">${pg.sign}</tspan> ${lab}`, G.fs, 'var(--sim-label)', 'start');
        svg += isNew ? `<g class="sc-pop">${row}</g>` : row;
      }
    });
    // the spine
    svg += `<path d="M${f1(mid)} ${by + 6}V${by + bh - 6}" ${stroke(shade(cover, 55), 4)}/>`;
    this.fresh = null;
    let over = '';
    [['sell', 'make a sale', 'in'], ['buy', 'buy supplies', 'out']].forEach(([act, lab, cls], i) => {
      const [x, y] = G.btn[i];
      over += `<button type="button" class="sv-hit tap btn sc-ab sc-btn ${cls}" data-act="${act}" style="left:${x}px;top:${y}px;width:${G.bw}px">${lab}</button>`;
    });
    return { svg, over };
  }

  /** Where a thing's coin sits: beside it, on the jar side. */
  coinAt(x, y, jx) { return x === jx ? [x, y - 84] : [x + (x < jx ? 58 : -58), y - 104]; }

  testState() { return { view: this.stepIndex, in: this.ins.length, out: this.outs.length }; }
}
