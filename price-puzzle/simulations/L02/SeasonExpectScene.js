/**
 * SeasonExpectScene - L02 s06 "Seasons, Expectations and the Extra Mango" (3 beats). SvgScene, design units
 * 560 x 480 landscape, 390 x 600 portrait. No rupee numbers anywhere (the text gives none).
 *   b0  seasons: three shops (books, sweets, sweaters) over a 12-month strip. Tap a month: the shop whose time
 *       it is fills with buyers, the others stay quiet. Books: Apr and Jun (school starts), sweets: Oct and Nov
 *       (festivals), sweaters: Dec and Jan (winter). "same price all year". Plays Jun, Oct, Dec on entry.
 *   b1  expectations: a family at a TV shop. "price will fall": they walk away, a Diwali calendar, "buy later",
 *       demand today down. "price will rise": they stay and buy now, demand today up. Cold start: fall.
 *   b2  diminishing marginal utility: Israt and three mangoes; she eats them in turn and a bar over each shows
 *       how much she enjoys it: tall, mid, low. "each extra mango adds less". Plays on entry; "again".
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MANGO_CSS, mango } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, pill, btn, arrow } from '../shared/MarketParts.js';

const f1 = (v) => (+v).toFixed(1);
const UP = '\u2191';
const DN = '\u2193';
const GOOD = 'var(--sim-good)';
const BAD = 'var(--sim-bad)';
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SHOPS = [
  { name: 'books', why: 'school starts', col: 'var(--sim-series-4)', months: [3, 5] },
  { name: 'sweets', why: 'festivals', col: 'var(--sim-series-6)', months: [9, 10] },
  { name: 'sweaters', why: 'winter', col: 'var(--sim-series-7)', months: [11, 0] },
];
const shopOf = (m) => SHOPS.findIndex((s) => s.months.includes(m));
const TOUR = [5, 9, 11];
const JOY = [1, 0.56, 0.2];
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))';
const SCREEN = 'color-mix(in oklab, var(--sim-series-5) 26%, black)';

// The same family as BuyersChangeScene (s05): registerCast keeps an existing entry.
registerCast('famA', { name: 'parent', role: 'adult', i: 4, look: { outfit: 'shirt', hairStyle: 'sidepart', top: 's7', bottom: 'khaki', shoeStyle: 'shoe', pattern: 'plain', moustache: true, glasses: false, dupatta: false } });
registerCast('famK', { name: 'child', role: 'child', i: 8, look: { outfit: 'tee', hairStyle: 'short', top: 's8', bottom: 'denim', bottomStyle: 'shorts', pattern: 'plain', glasses: false, dupatta: false } });

const stallArt = (cx, gy, w, dim) => `<g${dim ? ' opacity="0.55"' : ''}>${civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '')}</g>`;

/** Books standing on a counter, (cx, y) = the counter top. */
function books(cx, y, s) {
  const cols = ['var(--sim-series-4)', 'var(--sim-series-1)', 'var(--sim-series-6)', 'var(--sim-series-3)', 'var(--sim-series-7)', 'var(--sim-series-2)'];
  const hs = [34, 40, 30, 38, 33, 36];
  let out = '', x = cx - 3 * 14 * s;
  cols.forEach((c, i) => {
    const w = 12 * s, h = hs[i] * s;
    out += `<rect x="${f1(x)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(2 * s)}" ${fill(c, `stroke:${shade(c, 65)};stroke-width:1.6`)}/>`
      + `<path d="M${f1(x + 2 * s)} ${f1(y - h * 0.75)}h${f1(w - 4 * s)}" ${stroke(shade(c, 65), 1.6)}/>`;
    x += 14 * s;
  });
  return out;
}

/** A tray of round sweets heaped on a counter. */
function sweets(cx, y, s) {
  const c = 'color-mix(in oklab, var(--sim-gold) 80%, var(--sim-series-6))', rim = shade(c, 65);
  let out = `<rect x="${f1(cx - 46 * s)}" y="${f1(y - 6 * s)}" width="${f1(92 * s)}" height="${f1(6 * s)}" rx="${f1(3 * s)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:1.6')}/>`;
  const rows = [[-3, -1, 1, 3], [-2, 0, 2], [-1, 1]];
  rows.forEach((r, k) => r.forEach((u) => {
    out += `<circle cx="${f1(cx + u * 10.5 * s)}" cy="${f1(y - 6 * s - 9 * s - k * 15 * s)}" r="${f1(9 * s)}" ${fill(c, `stroke:${rim};stroke-width:1.5`)}/>`;
  }));
  return out;
}

/** One sweater, front view, (x, y) = the bottom centre, w its width. */
function sweater(x, y, w, col) {
  const t = y - w * 0.82, rim = shade(col, 65);
  const d = `M${f1(x - w * 0.12)} ${f1(t)}L${f1(x - w * 0.32)} ${f1(t + w * 0.05)}L${f1(x - w * 0.56)} ${f1(y - w * 0.3)}L${f1(x - w * 0.42)} ${f1(y - w * 0.2)}`
    + `L${f1(x - w * 0.32)} ${f1(t + w * 0.36)}L${f1(x - w * 0.32)} ${f1(y)}H${f1(x + w * 0.32)}L${f1(x + w * 0.32)} ${f1(t + w * 0.36)}`
    + `L${f1(x + w * 0.42)} ${f1(y - w * 0.2)}L${f1(x + w * 0.56)} ${f1(y - w * 0.3)}L${f1(x + w * 0.32)} ${f1(t + w * 0.05)}L${f1(x + w * 0.12)} ${f1(t)}`
    + `Q${f1(x)} ${f1(t + w * 0.14)} ${f1(x - w * 0.12)} ${f1(t)}Z`;
  return `<path d="${d}" ${fill(col, `stroke:${rim};stroke-width:2;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - w * 0.32)} ${f1(y - w * 0.1)}H${f1(x + w * 0.32)}M${f1(x - w * 0.32)} ${f1(t + w * 0.42)}H${f1(x + w * 0.32)}" ${stroke(rim, 2)}/>`;
}

/** A shop sign: the name, the reason line under it. */
function sign(x, y, w, h, name, why, col, lit, P) {
  const edge = lit ? col : 'var(--sim-stroke)';
  const face = lit ? `color-mix(in oklab, ${col} 18%, var(--sim-bg-surface))` : 'var(--sim-bg-surface)';
  return `<g${lit ? '' : ' opacity="0.6"'}><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(shade(edge, 75))}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(face, `stroke:${edge};stroke-width:${lit ? 3.5 : 2.5}`)}/>`
    + txt(x, y - 2, name, P ? 20 : 24) + txt(x, y + (P ? 19 : 22), why, P ? 15 : 17, 'var(--sim-label-muted)') + '</g>';
}

/** A TV set on its foot, (cx, y) = the foot's bottom, w the screen width. */
function tvSet(cx, y, w) {
  const h = w * 0.6, top = y - 14 - h, x0 = cx - w / 2, frame = 'color-mix(in oklab, var(--sim-label) 75%, var(--sim-series-5))';
  let s = `<path d="M${f1(cx - w * 0.16)} ${f1(y)}L${f1(cx - w * 0.06)} ${f1(y - 16)}H${f1(cx + w * 0.06)}L${f1(cx + w * 0.16)} ${f1(y)}Z" ${fill(frame)}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill(frame)}/>`;
  s += `<rect x="${f1(x0 + 7)}" y="${f1(top + 7)}" width="${f1(w - 14)}" height="${f1(h - 14)}" rx="4" ${fill(SCREEN)}/>`;
  // a calm picture on the screen: sun and two hills
  s += `<circle cx="${f1(x0 + w * 0.7)}" cy="${f1(top + h * 0.34)}" r="${f1(w * 0.07)}" ${fill('var(--sim-gold)')}/>`;
  s += `<path d="M${f1(x0 + 7)} ${f1(top + h - 7)}Q${f1(x0 + w * 0.3)} ${f1(top + h * 0.45)} ${f1(x0 + w * 0.55)} ${f1(top + h - 7)}Z" ${fill('color-mix(in oklab, var(--sim-series-3) 70%, black)')}/>`;
  s += `<path d="M${f1(x0 + w * 0.4)} ${f1(top + h - 7)}Q${f1(x0 + w * 0.7)} ${f1(top + h * 0.55)} ${f1(x0 + w - 7)} ${f1(top + h - 7)}Z" ${fill('color-mix(in oklab, var(--sim-series-3) 50%, black)')}/>`;
  return s;
}

/** A counter (wooden table front), (cx, top) its top centre. */
function counter(cx, top, w, h) {
  const rim = shade(WOOD, 60);
  return `<rect x="${f1(cx - w / 2)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(WOOD, `stroke:${rim};stroke-width:3`)}/>`
    + `<path d="M${f1(cx - w / 2 + 6)} ${f1(top + 16)}H${f1(cx + w / 2 - 6)}" ${stroke(rim, 2.5)}/>`;
}

/** A wall calendar page with Diwali and a lamp, centred on (x, y). */
function calendar(x, y, w) {
  const h = w * 0.92, x0 = x - w / 2, y0 = y - h / 2, band = 'var(--sim-series-6)';
  let s = `<rect x="${f1(x0)}" y="${f1(y0 + 5)}" width="${f1(w)}" height="${f1(h)}" rx="10" ${fill('var(--sim-stroke)')}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="10" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  s += `<path d="M${f1(x0)} ${f1(y0 + h * 0.26)}V${f1(y0 + 10)}q0 -10 10 -10H${f1(x0 + w - 10)}q10 0 10 10V${f1(y0 + h * 0.26)}Z" ${fill(band)}/>`;
  for (const fx of [0.3, 0.7]) s += `<rect x="${f1(x0 + w * fx - 4)}" y="${f1(y0 - 9)}" width="8" height="20" rx="4" ${fill('var(--sim-label-muted)')}/>`;
  s += txt(x, y0 + h * 0.55, 'Diwali', w * 0.22);
  // a small clay lamp with its flame
  const ly = y0 + h * 0.86, lw = w * 0.34, clay = 'color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-series-6))';
  s += `<path d="M${f1(x - lw / 2)} ${f1(ly - 8)}Q${f1(x)} ${f1(ly + 12)} ${f1(x + lw / 2)} ${f1(ly - 8)}Z" ${fill(clay, `stroke:${shade(clay, 65)};stroke-width:1.5`)}/>`;
  s += `<path d="M${f1(x)} ${f1(ly - 24)}Q${f1(x + 7)} ${f1(ly - 13)} ${f1(x)} ${f1(ly - 8)}Q${f1(x - 7)} ${f1(ly - 13)} ${f1(x)} ${f1(ly - 24)}Z" ${fill('var(--sim-gold)')}/>`;
  return s;
}

/** A packed TV box, (x, y) bottom centre. */
function tvBox(x, y, w) {
  const h = w * 0.7, card = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-bg-surface))', rim = shade(card, 62);
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="5" ${fill(card, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - w * 0.28)}" y="${f1(y - h * 0.72)}" width="${f1(w * 0.56)}" height="${f1(h * 0.38)}" rx="3" ${fill('none', `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x - w * 0.1)} ${f1(y - h * 0.22)}H${f1(x + w * 0.1)}" ${stroke(rim, 2.5)}/>`;
}

export class SeasonExpectScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Seasons: a book shop is busy in April and June when school starts, a sweet shop in October and November at festival time, a sweater shop in December and January in winter, while prices stay the same all year. Expectations: a family at a TV shop; if they expect the price to fall they wait for Diwali and demand today falls; if they expect it to rise they buy now and demand today rises. Diminishing marginal utility: Israt eats three mangoes in turn; the first she enjoys a lot, the second less, the third very little. Each extra mango adds less.';

  async setup() {
    this.month = 11;
    this.fresh = -1;
    this.expect = 'fall';
    this.walk = false;
    this.eaten = 3;
    this.popEat = -1;
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

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = -1; this.walk = false; this.popEat = -1; this.popLab = false; }

  enter(step) {
    this.clear();
    this.month = 11; this.expect = 'fall'; this.eaten = 3;
    if (step === 0) this.tour();
    else if (step === 1) { this.anim = true; this.after(0.5, () => this.setExpect('fall', true)); }
    else if (step === 2) this.eat();
  }

  // b0: Jun, Oct, Dec in turn, rest at Dec.
  tour() {
    this.anim = true;
    this.month = -1; this.fresh = -1;
    TOUR.forEach((m, i) => this.after(0.5 + i * 1.3, () => this.pickMonth(m, true)));
    this.after(0.5 + TOUR.length * 1.3, () => { this.anim = false; this.repaint(); });
  }

  pickMonth(m, inTour) {
    if (!inTour) this.clear();
    this.month = m;
    this.fresh = shopOf(m);
    this.repaint();
    this.fresh = -1;
  }

  // b1: the family walks away (fall) or back to the TV (rise).
  setExpect(e, first) {
    this.clear();
    const from = this.expect;
    this.expect = e;
    this.walk = first ? (e === 'fall' ? 'rise' : 'fall') : (from !== e ? from : false);
    this.anim = true;
    this.repaint();
    this.walk = false;
    this.after(0.9, () => { this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; });
  }

  // b2: she eats the three mangoes in turn.
  eat() {
    this.eaten = 0;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.6 + i * 1.0, () => { this.eaten = i + 1; this.popEat = i; this.repaint(); this.popEat = -1; }));
    this.after(0.6 + 3 * 1.0 + 0.4, () => { this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; });
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s === 0 && a === 'month') this.pickMonth(Number(v));
    else if (s === 1 && a === 'expect') this.setExpect(v);
    else if (s === 2 && a === 'again') { this.clear(); this.eat(); this.repaint(); }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    if (this.stepIndex === 0) this.month = 11;
    if (this.stepIndex === 2) this.eaten = 3;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 2 ? this.paintJoy(P) : s === 1 ? this.paintExpect(P) : this.paintSeasons(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: three shops over the year strip.
  paintSeasons(P) {
    let svg = '', over = '';
    const G = P
      ? { xs: [66, 195, 324], sw: 118, sy: 38, sh: 62, gy: 200, w: 120, fy: 382, fh: 132, sp: 25, x0: 9, cw: 62, ch: 46, rows: [404, 456], chip: [195, 540], hint: [195, 582] }
      : { xs: [95, 280, 465], sw: 160, sy: 36, sh: 62, gy: 214, w: 160, fy: 364, fh: 140, sp: 32, x0: 14, cw: 44.3, ch: 48, rows: [384], chip: [384, 462], hint: [16, 468] };
    const on = shopOf(this.month);
    SHOPS.forEach((sh, i) => {
      const x = G.xs[i], lit = i === on, s = G.w / 230, top = G.gy - 84 * s;
      svg += sign(x, G.sy, G.sw, G.sh, sh.name, sh.why, sh.col, lit, P);
      svg += stallArt(x, G.gy, G.w, !lit);
      const goods = i === 0 ? books(x, top, s * 1.25) : i === 1 ? sweets(x, top, s * 1.25)
        : sweater(x - 26 * s, top, 58 * s, sh.col) + sweater(x + 30 * s, top, 58 * s, 'var(--sim-series-1)');
      svg += `<g${lit ? '' : ' opacity="0.55"'}>${goods}</g>`;
      // buyers: four when it is this shop's time of year, one otherwise
      const n = lit ? 4 : 1;
      for (let j = 0; j < n; j++) {
        const px = x + (j - (n - 1) / 2) * G.sp;
        const pop = this.fresh === i && j > 0 ? ' mpp-pop' : '';
        over += personSlot(`buyer${i * 4 + j + 1}`, { x: px, y: G.fy, h: G.fh - (j % 2) * 8, pose: 'stand', facing: 0, mood: lit ? 'happy' : 'smile', cls: pop.trim(), style: (pop ? `--d:${(j * 0.12).toFixed(2)}s;` : '') + (lit ? '' : 'opacity:0.7;filter:grayscale(0.55);') });
      }
    });
    // the month strip: busy months marked in their shop's colour, the picked month lit
    MONTHS.forEach((m, i) => {
      const r = P ? Math.floor(i / 6) : 0, c = P ? i % 6 : i;
      const x = G.x0 + c * G.cw, y = G.rows[r], w = G.cw - 4, k = shopOf(i), lit = i === this.month;
      svg += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${G.ch}" rx="10" ${fill(lit ? 'color-mix(in oklab, var(--sim-accent) 22%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${lit ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${lit ? 3.5 : 2}`)}/>`;
      if (k >= 0) svg += `<rect x="${f1(x + 5)}" y="${f1(y + G.ch - 11)}" width="${f1(w - 10)}" height="6" rx="3" ${fill(SHOPS[k].col)}/>`;
      svg += txt(x + w / 2, y + G.ch / 2 + 2, m, P ? 18 : 17, lit ? 'var(--sim-label)' : 'var(--sim-label-muted)');
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="month" data-val="${i}" aria-pressed="${lit}" aria-label="${m}" style="left:${f1(x)}px;top:${f1(y)}px;width:${f1(w)}px;height:${G.ch}px"></button>`;
    });
    svg += pill(G.chip[0], G.chip[1], 'same price all year', { size: P ? 20 : 20 });
    if (!this.anim) svg += txt(G.hint[0], G.hint[1], 'tap a month', P ? 18 : 18, 'var(--sim-label-muted)', P ? 'middle' : 'start');
    return { svg, over };
  }

  // b1: the family and the TV; what they expect decides when they buy.
  paintExpect(P) {
    let svg = '', over = '';
    const G = P
      ? { b: [[104, 34], [288, 34]], tv: [116, 236, 168], ct: [116, 244, 200, 70], sg: [116, 92], cal: [300, 170, 112], rise: [[214, 168], [274, 120]], fall: [[300, 168], [356, 120]], fy: 520, lab: [[244, 312], [328, 312]], box: [150, 516], dem: [195, 568] }
      : { b: [[150, 40], [370, 40]], tv: [140, 306, 190], ct: [140, 314, 236, 96], sg: [140, 128], cal: [326, 150, 112], rise: [[302, 196], [366, 140]], fall: [[446, 196], [508, 140]], fy: 432, lab: [[334, 206], [478, 208]], box: [240, 430], dem: [140, 456] };
    const fall = this.expect === 'fall';
    over += btn('expect', `price will fall ${DN}`, G.b[0][0], G.b[0][1], { val: 'fall', on: fall, size: P ? 17 : 20 });
    over += btn('expect', `price will rise ${UP}`, G.b[1][0], G.b[1][1], { val: 'rise', on: !fall, size: P ? 17 : 20 });
    svg += pill(G.sg[0], G.sg[1], 'TV shop', { size: P ? 20 : 22 });
    svg += counter(G.ct[0], G.ct[1], G.ct[2], G.ct[3]);
    svg += tvSet(G.tv[0], G.tv[1], G.tv[2]);
    const at = fall ? G.fall : G.rise, was = this.walk ? (this.walk === 'fall' ? G.fall : G.rise) : null;
    ['famA', 'famK'].forEach((who, i) => {
      const [x, h] = at[i], dx = was ? was[i][0] - x : 0;
      const style = was ? `--dx:${f1(dx)}px;--dy:0px;--dur:0.8s` : '';
      over += personSlot(who, { x, y: G.fy, h, pose: was ? 'walk' : 'stand', facing: fall ? 1 : -1, mood: fall ? 'think' : 'happy', cls: was ? 'mq-fly' : '', style });
    });
    if (!this.anim) {
      const pop = this.popLab ? ' class="mq-fade"' : '';
      let lab = '';
      if (fall) {
        lab += calendar(G.cal[0], G.cal[1], G.cal[2]);
        lab += pill(G.lab[1][0], G.lab[1][1], 'buy later', { size: P ? 20 : 22, bg: 'var(--sim-bg-surface)' });
      } else {
        lab += tvBox(G.box[0], G.box[1], P ? 64 : 76);
        lab += pill(G.lab[0][0], G.lab[0][1], 'buy now', { size: P ? 20 : 22 });
      }
      const col = fall ? BAD : GOOD;
      lab += pill(G.dem[0], G.dem[1], `demand today ${fall ? DN : UP}`, { size: P ? 24 : 26, bg: col, ink: 'var(--sim-bg-deep)', edge: col });
      svg += `<g${pop}>${lab}</g>`;
    }
    return { svg, over };
  }

  // b2: Israt eats three mangoes; each bar is shorter than the one before.
  paintJoy(P) {
    let svg = '', over = '';
    const G = P
      ? { chip: [195, 40], fx: 62, fy: 540, fh: 196, xs: [170, 260, 348], bw: 64, base: 456, top: 210, my: 498, r: 20, lab: 548, title: [258, 160], again: [300, 588] }
      : { chip: [250, 42], fx: 100, fy: 432, fh: 236, xs: [262, 372, 482], bw: 76, base: 370, top: 150, my: 418, r: 24, lab: 468, title: [372, 120], again: [496, 42] };
    const col = 'var(--sim-series-3)', n = this.eaten;
    const done = n >= 3 && !this.anim;
    svg += `<g${this.popLab ? ' class="mq-fade"' : ''}${done ? '' : ' opacity="0.3"'}>${pill(G.chip[0], G.chip[1], 'each extra mango adds less', { size: P ? 21 : 22, bg: done ? 'var(--sim-series-3)' : 'var(--sim-bg-surface)', ink: done ? 'var(--sim-ink-on-3, var(--sim-bg-deep))' : 'var(--sim-label)', edge: done ? col : 'var(--sim-stroke)' })}</g>`;
    svg += txt(G.title[0], G.title[1], 'how much she enjoys it', P ? 18 : 20, 'var(--sim-label-muted)');
    svg += `<path d="M${f1(G.xs[0] - G.bw * 0.8)} ${G.base}H${f1(G.xs[2] + G.bw * 0.8)}" ${stroke('var(--sim-label-muted)', 3)}/>`;
    const tops = [];
    G.xs.forEach((x, i) => {
      const h = (G.base - G.top) * JOY[i], eaten = i < n;
      tops.push([x, G.base - h]);
      svg += `<rect x="${f1(x - G.bw / 2)}" y="${f1(G.top)}" width="${G.bw}" height="${f1(G.base - G.top)}" rx="10" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2;stroke-dasharray:6 6;opacity:0.5')}/>`;
      if (eaten) svg += `<rect${this.popEat === i ? ' class="sv-grow"' : ''} x="${f1(x - G.bw / 2)}" y="${f1(G.base - h)}" width="${G.bw}" height="${f1(h)}" rx="10" ${fill(col, `stroke:${shade(col, 65)};stroke-width:2.5`)}/>`;
      svg += mango(x, G.my, G.r, { leaf: true, dim: !eaten && this.anim });
      svg += txt(x, G.lab, ['1st', '2nd', '3rd'][i], P ? 20 : 22, i < n ? 'var(--sim-label)' : 'var(--sim-label-muted)');
    });
    if (done) {
      let d = '';
      for (let i = 0; i < 2; i++) d += arrow(tops[i][0] + G.bw / 2 + 4, tops[i][1] + 6, tops[i + 1][0] - G.bw / 2 - 4, tops[i + 1][1] - 4, 'var(--sim-label-muted)', 3);
      svg += `<g${this.popLab ? ' class="mq-fade"' : ''}>${d}</g>`;
    }
    const mood = n === 0 ? 'smile' : n === 1 ? 'happy' : n === 2 ? 'smile' : 'oops';
    over += personSlot('israt', { x: G.fx, y: G.fy, h: G.fh, pose: 'stand', facing: 1, mood });
    svg += nameTag(G.fx, G.fy + 6, 'israt', P ? 16 : 18);
    if (!this.anim) over += btn('again', 'again', G.again[0], G.again[1]);
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, month: this.month, busyShop: shopOf(this.month), expect: this.expect, eaten: this.eaten, anim: this.anim }; }
}
