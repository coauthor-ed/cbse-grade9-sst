/**
 * SupplyExpectScene - L04 s06 "What Sellers Expect" (3 beats). SvgScene, design units 560 x 480 landscape,
 * 390 x 600 portrait. Two halves kept apart: b0 is about producing (output), b1 about stock already held (a potato
 * wholesaler, book). No rupee numbers anywhere (the book gives none).
 *   b0  the mango grower (course 'farmer') thinks "buyers will want more soon": his output grows from 4 crates
 *       (dashed "now") to 6, chip "supply rises". Buttons "more soon" / "less soon": less = 2 crates, "supply
 *       falls". Cold start: more soon.
 *   b1  a potato wholesaler between his cold store and today's sale heap; a calendar card "peak season: price up".
 *       "now": 3 sacks go back into the store, the sale heap shrinks 6 -> 3, chip "supply today falls". "peak
 *       season": the held sacks come out, heap 9 "sold later, at the higher price". Cold start: now.
 *   b2  four case cards (inputs cost more / cheaper input / water runs out / flood or drought); tap one: the market
 *       supply curve SmSm' moves left or right from its ghost, with "supply falls" / "supply rises". Rest: case 1.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MANGO_CSS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, paintPeople, personSlot, registerCast } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, frame, axes, pill, crate, btn } from '../shared/MarketParts.js';
import { bigArrow } from '../shared/SupplyParts.js';
import { SHIFT, smGraph, DIR_COL } from '../shared/SupplyMoves.js';

registerCast('farmer', { name: 'the farmer', role: 'farmer', i: 0,
  look: { outfit: 'kurta', hairStyle: 'short', top: 'sage', bottom: 'cream', shoeStyle: 'sandal', pattern: 'plain', moustache: true, glasses: false, dupatta: false, girth: 1 } });
registerCast('wholesaler', { name: 'the wholesaler', role: 'worker', i: 4,
  look: { outfit: 'shirt', hairStyle: 'short', top: 'khaki', bottom: 'brown', shoeStyle: 'shoe', pattern: 'plain', moustache: true, glasses: false, dupatta: false, girth: 1.12 } });

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const UP = 'var(--sim-good)';
const DOWN = 'var(--sim-bad)';
const SACK = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))';
const COLD = 'color-mix(in oklab, var(--sim-water) 18%, var(--sim-bg-surface))';
const CASES = [
  { k: 'cost', icon: 'seed', t: ['seeds, fuel', 'cost more'], d: -1 },
  { k: 'cheap', icon: 'leaf', t: ['a cheaper', 'input'], d: 1 },
  { k: 'water', icon: 'well', t: ['water', 'runs out'], d: -1 },
  { k: 'flood', icon: 'rain', t: ['flood or', 'drought'], d: -1 },
];

const CSS = `
.se-two .mq-btn { width: var(--bw, 180px); }
`;

function icon48(name, x, y, s, tone) {
  return iconSvg(name, tone).replace('<svg class="sim-icon" viewBox="0 0 48 48" width="48" height="48"', `<svg class="sim-icon" viewBox="0 0 48 48" x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${f1(s)}" height="${f1(s)}"`);
}

/** A tied sack of potatoes, (x, y) bottom centre, h tall. */
function sack(x, y, h) {
  const w = h * 0.86, rim = shade(SACK, 62), top = y - h;
  return `<path d="M${f1(x - w * 0.18)} ${f1(top + h * 0.2)}C${f1(x - w * 0.55)} ${f1(top + h * 0.3)} ${f1(x - w * 0.56)} ${f1(y)} ${f1(x - w * 0.36)} ${f1(y)}H${f1(x + w * 0.36)}C${f1(x + w * 0.56)} ${f1(y)} ${f1(x + w * 0.55)} ${f1(top + h * 0.3)} ${f1(x + w * 0.18)} ${f1(top + h * 0.2)}Z" ${fill(SACK, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - w * 0.18)} ${f1(top + h * 0.2)}L${f1(x - w * 0.24)} ${f1(top)}H${f1(x + w * 0.24)}L${f1(x + w * 0.18)} ${f1(top + h * 0.2)}" ${fill(SACK, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - w * 0.2)} ${f1(top + h * 0.2)}H${f1(x + w * 0.2)}" ${stroke(rim, 4)}/>`;
}

/** A pile of n sacks (rows of 4, 3, 2 ...), (x, y) bottom centre, each h tall. */
function sackPile(x, y, n, h, cls) {
  let s = '', i = 0;
  const w = h * 0.86;
  for (let row = 0, per = 4; i < n && per > 0; row++, per--) {
    const m = Math.min(per, n - i), y0 = y - row * h * 0.78;
    for (let j = 0; j < m; j++, i++) {
      const sx = x + (j - (m - 1) / 2) * w * 0.98;
      s += `<g${cls ? cls(i) : ''}>${sack(sx, y0, h)}</g>`;
    }
  }
  return s;
}

export class SupplyExpectScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A mango grower who expects buyers to want more soon produces more: his output grows from 4 crates to 6 and supply rises; if he expects them to want less, he makes 2 and supply falls. A potato wholesaler who expects the price to rise in the peak season moves some sacks back into his cold store, so fewer are for sale today: supply today falls. Other changes: if seeds or fuel cost more, or water runs out, or a flood or drought ruins a crop, the supply curve moves left; a cheaper input moves it right.';

  async setup() {
    this.more = true;
    this.peak = false;
    this.cs = 0;
    this.prevD = null;
    this.anim = false;
    this.fresh = false;
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

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.more = true; this.peak = false; this.cs = 0; this.prevD = 0;
    this.burst(step === 1 ? 1.6 : 1.4);
  }

  burst(sec) {
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.prevD = null; this.repaint(); });
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s === 0 && a === 'exp') { this.clear(); this.more = v === 'more'; this.burst(1.2); }
    else if (s === 1 && a === 'when') { this.clear(); this.peak = v === 'peak'; this.burst(1.4); }
    else if (s === 2 && a === 'case') {
      const i = Number(v);
      this.clear();
      this.prevD = CASES[this.cs].d * SHIFT;
      this.cs = i;
      this.burst(1.2);
    }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.prevD = null;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintMake(P) : s === 1 ? this.paintStock(P) : this.paintCases(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** A thought bubble: a rounded box with two small circles trailing down to (tx, ty). */
  bubble(x, y, w, h, lines, tx, ty, fs) {
    let s = `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="${f1(h / 2.4)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:3')}/>`;
    s += `<circle cx="${f1(tx + (x - tx) * 0.45)}" cy="${f1(ty + (y + h / 2 - ty) * 0.45)}" r="9" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    s += `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="5.5" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    lines.forEach((t, i) => { s += txt(x, y + fs * 0.36 + (i - (lines.length - 1) / 2) * fs * 1.25, t, fs); });
    return s;
  }

  // b0: producing for the future.
  paintMake(P) {
    let svg = '', over = '';
    const G = P
      ? { man: [86, 330, 210], bub: [236, 64, 260, 84], tail: [120, 116], cr: { x0: 236, cols: 2, dx: 104, y0: 330, dy: 66, w: 96 }, chip: [236, 400], b: [[106, 556], [286, 556]], bw: 168, fs: 22 }
      : { man: [100, 380, 250], bub: [250, 74, 300, 96], tail: [140, 120], cr: { x0: 396, cols: 3, dx: 110, y0: 380, dy: 78, w: 104 }, chip: [420, 178], b: [[150, 446], [380, 446]], bw: 190, fs: 24 };
    const more = this.more, n = more ? 6 : 2, fresh = this.fresh;
    over += personSlot('farmer', { x: G.man[0], y: G.man[1], h: G.man[2], pose: 'stand', facing: 0, mood: 'think' });
    const [bx, by, bw, bh] = G.bub;
    svg += this.bubble(bx, by, bw, bh, ['buyers will want', `${more ? 'more' : 'less'} soon`], G.tail[0], G.tail[1], G.fs);
    // the crates: 4 dashed places = his output now; n filled
    const C = G.cr, cols = C.cols, w = C.w;
    for (let i = 0; i < 6; i++) {
      const c = i % cols, r = Math.floor(i / cols), x = C.x0 + (c - (cols - 1) / 2) * C.dx, y = C.y0 - r * C.dy;
      if (i < n) {
        const pop = fresh && (more ? i >= 4 : false) ? ` class="mq-pop" style="--d:${(0.3 + (i - 4) * 0.2).toFixed(2)}s"` : '';
        svg += `<g${pop}>${crate(x, y, 3, { w, r: 6 })}</g>`;
      } else if (i < 4) {
        svg += `<rect x="${f1(x - w / 2)}" y="${f1(y - w * 0.55 - 10)}" width="${w}" height="${f1(w * 0.55 + 10)}" rx="8" ${fill('none', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:8 6')}/>`;
      }
    }
    svg += txt(C.x0, C.y0 + 30, more ? 'now 4 crates, soon 6' : 'now 4 crates, soon 2', P ? 18 : 20, 'var(--sim-label-muted)');
    const col = more ? UP : DOWN;
    const [cx, cy] = G.chip;
    const cy2 = cy;
    svg += `<g${fresh ? ' class="mq-pop" style="--d:0.9s"' : ''}>${pill(cx - 16, cy2, more ? 'supply rises' : 'supply falls', { size: P ? 22 : 24, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}`
      + bigArrow(cx + (P ? 80 : 90), cy2 - 20, cy2 + 20, more ? -1 : 1, col, 14) + '</g>';
    let two = '';
    [['more', 'more soon'], ['less', 'less soon']].forEach(([v, lab], i) => {
      two += `<div style="--bw:${G.bw}px">${btn('exp', lab, G.b[i][0], G.b[i][1], { val: v, on: (v === 'more') === more, size: 19 })}</div>`;
    });
    over += `<div class="se-two">${two}</div>`;
    return { svg, over };
  }

  // b1: holding stock back.
  paintStock(P) {
    let svg = '', over = '';
    const G = P
      ? { cal: [195, 48, 330, 76], st: [12, 118, 186, 248], sh: 40, man: [334, 576, 112], sale: [302, 362], sh2: 42, saleTag: [302, 390], chip: [170, 452], b: [[62, 564], [194, 564]] }
      : { cal: [416, 56, 264, 88], st: [16, 110, 214, 278], sh: 46, man: [292, 388, 200], sale: [452, 388], sh2: 48, saleTag: [452, 414], chip: [440, 166], b: [[96, 446], [250, 446]] };
    const peak = this.peak, fresh = this.fresh;
    // the calendar card: peak season, price up
    const [kx, ky, kw, kh] = G.cal;
    svg += `<rect x="${f1(kx - kw / 2)}" y="${f1(ky - kh / 2)}" width="${kw}" height="${kh}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${peak ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${peak ? 3.5 : 2.5}`)}/>`;
    svg += icon48('calendar', kx - kw / 2 + kh * 0.48, ky, kh * 0.7, 4);
    svg += txt(kx - kw / 2 + kh * 0.95, ky - 6, 'peak season', P ? 21 : 21, 'var(--sim-label)', 'start');
    svg += txt(kx - kw / 2 + kh * 0.95, ky + 22, 'price up', P ? 20 : 20, 'var(--sim-accent)', 'start');
    svg += bigArrow(kx + kw / 2 - 26, ky - 22, ky + 22, -1, 'var(--sim-accent)', 13);
    // the cold store, sacks inside
    const [sx, sy, sw, shh] = G.st, gy = sy + shh;
    svg += `<path d="M${f1(sx - 4)} ${f1(sy + 40)}L${f1(sx + sw / 2)} ${f1(sy)}L${f1(sx + sw + 4)} ${f1(sy + 40)}Z" ${fill('color-mix(in oklab, var(--sim-water) 45%, var(--sim-label))', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-linejoin:round')}/>`;
    svg += `<rect x="${sx}" y="${f1(sy + 38)}" width="${sw}" height="${f1(shh - 38)}" rx="6" ${fill(COLD, 'stroke:var(--sim-stroke);stroke-width:3')}/>`;
    svg += `<rect x="${f1(sx + 12)}" y="${f1(sy + 84)}" width="${f1(sw - 24)}" height="${f1(shh - 84)}" rx="4" ${fill('color-mix(in oklab, var(--sim-water) 30%, var(--sim-bg-deep))')}/>`;
    svg += pill(sx + sw / 2, sy + 62, 'cold store', { size: P ? 18 : 20, bg: 'var(--sim-bg-surface)', edge: 'var(--sim-water)' });
    const inStore = peak ? 3 : 9, onSale = peak ? 9 : 3;
    const moved = (i) => (fresh && (peak ? false : i >= 6) ? ` class="mq-fly" style="--dx:${f1(G.sale[0] - (sx + sw / 2))}px;--dy:-20px;--dur:0.7s;--d:${(0.2 + (i - 6) * 0.15).toFixed(2)}s"` : '');
    svg += sackPile(sx + sw / 2, gy - 2, inStore, G.sh, moved);
    // the wholesaler
    over += personSlot('wholesaler', { x: G.man[0], y: G.man[1], h: G.man[2], pose: 'stand', facing: 0, mood: peak ? 'happy' : 'think' });
    // today's sale heap
    const outCls = (i) => (fresh && peak && i >= 3 ? ` class="mq-fly" style="--dx:${f1(sx + sw / 2 - G.sale[0])}px;--dy:-20px;--dur:0.7s;--d:${(0.2 + (i - 3) * 0.08).toFixed(2)}s"` : '');
    svg += sackPile(G.sale[0], G.sale[1], onSale, G.sh2, outCls);
    svg += pill(G.saleTag[0], G.saleTag[1], peak ? 'for sale in peak season' : 'for sale today', { size: P ? 17 : 19 });
    const pop = fresh ? ' class="mq-pop" style="--d:1.0s"' : '';
    if (!peak) svg += `<g${pop}>${pill(G.chip[0] - 14, G.chip[1], 'supply today falls', { size: P ? 21 : 22, bg: DOWN, ink: 'var(--sim-bg-deep)', edge: DOWN })}${bigArrow(G.chip[0] + (P ? 108 : 112), G.chip[1] - 20, G.chip[1] + 20, 1, DOWN, 13)}</g>`;
    else svg += `<g${pop}>${pill(G.chip[0], G.chip[1], 'sold later, at the higher price', { size: P ? 17 : 19 })}</g>`;
    over += btn('when', 'now', G.b[0][0], G.b[0][1], { val: 'now', on: !peak, size: 19 });
    over += btn('when', 'peak season', G.b[1][0], G.b[1][1], { val: 'peak', on: peak, size: 19 });
    return { svg, over };
  }

  // b2: costs, weather and disasters.
  paintCases(P) {
    let svg = '', over = '';
    const G = P
      ? { g: frame(96, 366, 36, 262, 26, 200), yT: 30, xT: 302, cards: [[100, 372], [290, 372], [100, 472], [290, 472]], cw: 180, ch: 86, why: [195, 560] }
      : { g: frame(112, 356, 36, 330, 26, 200), yT: 34, xT: 372, cards: [[462, 70], [462, 168], [462, 266], [462, 364]], cw: 180, ch: 86, why: [234, 440] };
    const c = CASES[this.cs], d = c.d * SHIFT, fresh = this.fresh;
    const g = G.g;
    svg += axes(g, { xs: [], ys: [], gridX: [6, 12, 18, 24], gridY: [50, 100, 150], yTitleX: G.yT, xTitleY: G.xT, title: P ? 20 : 21 });
    svg += smGraph(g, { d, from: fresh && this.prevD != null ? this.prevD : undefined, arrows: !this.anim, pop: false, lab: P ? 24 : 28 });
    const col = DIR_COL(d);
    svg += `<g${fresh ? ' class="mq-pop" style="--d:0.8s"' : ''}>${pill(G.why[0], G.why[1], d < 0 ? 'supply falls: curve moves left' : 'supply rises: curve moves right', { size: P ? 19 : 21, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}</g>`;
    CASES.forEach((cs, i) => {
      const [x, y] = G.cards[i], on = i === this.cs, w = G.cw, h = G.ch;
      svg += `<g${on ? '' : ' opacity="0.75"'}><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="16" ${fill(on ? 'color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 3.5 : 2.5}`)}/>`
        + icon48(cs.icon, x - w / 2 + 34, y, 46, cs.d > 0 ? 3 : 8)
        + txt(x - w / 2 + 64, y - 5, cs.t[0], 19, 'var(--sim-label)', 'start') + txt(x - w / 2 + 64, y + 20, cs.t[1], 19, 'var(--sim-label)', 'start') + '</g>';
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="case" data-val="${i}" aria-pressed="${on}" aria-label="${cs.t.join(' ')}" style="left:${f1(x - w / 2)}px;top:${f1(y - h / 2)}px;width:${w}px;height:${h}px"></button>`;
    });
    if (!this.anim) svg += txt(P ? 195 : 462, P ? 528 : 428, 'tap a card', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, more: this.more, crates: this.more ? 6 : 2, peak: this.peak, case: CASES[this.cs].k, dir: CASES[this.cs].d > 0 ? 'right' : 'left', anim: this.anim }; }
}
