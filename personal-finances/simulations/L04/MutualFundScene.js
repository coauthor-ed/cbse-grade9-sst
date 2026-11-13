/**
 * MutualFundScene - L04 s06 "Mutual Funds" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 620 portrait.
 * Made-up numbers: 10 savers put in Rs 10,000 each, a pool of Rs 1,00,000; the fund manager buys a basket of 20
 * holdings (14 shares, 6 bonds) of Rs 5,000 each. One saver (accent) owns 1/10 of the pool, so 1/10 of every gain
 * or loss. The pool picture is the FourOptionsScene mutual fund idea (coins from many sides into one pool).
 *   b0 One pool, many savers: 10 saver tokens drop coins into a pool bar of 10 equal parts (one lit: "1/10");
 *      "pool Rs 1,00,000"; the fund manager (FinPeople) and the basket of 20 tiles (share / bond, a key).
 *      "one saver: 1/10 in, 1/10 of the basket". Plays in on entry; rest: all shown.
 *   b1 Spreading the risk: one holding collapses (its tile empties, 0.6 s): basket Rs 1,00,000 -> Rs 95,000
 *      (-Rs 5,000, -5%); the compare card "all in that one company: -100%"; the saver's 1/10: Rs 9,500. Tap any
 *      tile to make that one the one that collapses. Cold start: tile 8 collapsed.
 *   b2 Subject to market risks: the market falls, every tile drops 20% together (0.8 s): basket Rs 80,000
 *      (-20%); the saver's 1/10: Rs 8,000 (-Rs 2,000, 1/10 of the loss). The advert line as a small strip.
 *      "replay" runs the fall again. Cold start: fallen.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, coin, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast } from '../shared/FinPeople.js';

registerCast('manager', { name: 'Fund manager', series: 3, role: 'adult', i: 15,
  look: { outfit: 'shirt', hairStyle: 'bun', top: 's3', bottom: 'stone', shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: true, girth: 1 } });

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const SAVERS = 10, EACH = 10000, POOL = SAVERS * EACH, N = 20, HOLD = POOL / N, FALL = 0.2, ME = 2, GONE0 = 7;
/** Holding types: S = share, B = bond (14 shares, 6 bonds). */
const TYPES = 'SSBSSBSSSBSSBSSSBSSB';
const MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', INK = 'var(--sim-label)';
const ACC_INK = shade('var(--sim-accent)', 62);
const BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
const SH = 'var(--sim-series-5)', BD = 'var(--sim-series-6)', POOLC = 'var(--sim-series-7)';
const pct = (x) => `${Math.round(x * 100)}%`;

const CSS = `
.mf-ab { position: absolute; transform: translate(-50%, -50%); }
.mf-btn { min-height: 48px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border: 2.5px solid color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.mf-btn--quiet { background: var(--sim-bg-surface); color: var(--sim-label); border-color: var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); font-size: 20px; }
.mf-btn:active { transform: translateY(3px); box-shadow: none; }
.mf-btn:focus-visible, .mf-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.mf-hit { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 10px; }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;

/** A saver token (no face): head and shoulders, (x, y) = bottom centre, s = scale (1: about 64 tall). */
function saver(x, y, s, col, lit) {
  const rim = shade(col, 62);
  return `<path d="M${f1(x - 20 * s)} ${f1(y)}V${f1(y - 18 * s)}Q${f1(x - 20 * s)} ${f1(y - 34 * s)} ${f1(x)} ${f1(y - 34 * s)}Q${f1(x + 20 * s)} ${f1(y - 34 * s)} ${f1(x + 20 * s)} ${f1(y - 18 * s)}V${f1(y)}Z" ${fill(col, `stroke:${rim};stroke-width:2.2`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y - 48 * s)}" r="${f1(13 * s)}" ${fill(lit ? 'color-mix(in oklab, var(--sim-accent) 40%, var(--sim-bg-surface))' : 'color-mix(in oklab, var(--sim-label-muted) 30%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2.2`)}/>`;
}

/** One holding tile: a card whose fill shows its value (level 0..1 of Rs 5,000). */
function tile(x, y, w, h, type, level, o = {}) {
  const col = type === 'S' ? SH : BD, rim = shade(col, 62), gone = level <= 0.001;
  let s = `<rect x="${f1(x)}" y="${f1(y + 3)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill('var(--sim-stroke)')}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill('var(--sim-bg-surface)', `stroke:${o.ring ? BAD : gone ? MUTED : rim};stroke-width:${o.ring ? 3.5 : 2.2}${gone ? ';stroke-dasharray:6 5' : ''}`)}/>`;
  const ih = (h - 6) * Math.max(0, Math.min(1, level));
  if (ih > 0.5) s += `<rect x="${f1(x + 3)}" y="${f1(y + h - 3 - ih)}" width="${f1(w - 6)}" height="${f1(ih)}" rx="5" ${fill(`color-mix(in oklab, ${col} 62%, var(--sim-bg-surface))`)}/>`;
  if (o.was) s += `<path d="M${f1(x + 4)} ${f1(y + 3)}H${f1(x + w - 4)}" ${stroke(BAD, 2.5, 'stroke-dasharray:5 4')}/>`;
  // the type mark: a share = a rising line, a bond = ruled lines
  const cx = x + w / 2, cy = y + h / 2, m = Math.min(w, h) * 0.32;
  const ink = gone ? MUTED : rim;
  if (type === 'S') s += `<path d="M${f1(cx - m)} ${f1(cy + m * 0.6)}L${f1(cx - m * 0.2)} ${f1(cy - m * 0.1)}L${f1(cx + m * 0.2)} ${f1(cy + m * 0.3)}L${f1(cx + m)} ${f1(cy - m * 0.6)}" ${stroke(ink, 3, 'fill:none;stroke-linejoin:round')}/>`;
  else s += [-0.45, 0, 0.45].map((d, i) => `<path d="M${f1(cx - m)} ${f1(cy + d * m)}H${f1(cx + (i === 2 ? 0 : m))}" ${stroke(ink, 3)}/>`).join('');
  if (gone) s += `<path d="M${f1(cx - m * 0.8)} ${f1(cy - m * 0.8)}L${f1(cx + m * 0.8)} ${f1(cy + m * 0.8)}M${f1(cx + m * 0.8)} ${f1(cy - m * 0.8)}L${f1(cx - m * 0.8)} ${f1(cy + m * 0.8)}" ${stroke(BAD, 4)}/>`;
  return s;
}

export class MutualFundScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Made-up numbers. Ten savers put in 10,000 rupees each, a pool of 1,00,000 rupees. A fund manager buys a basket of 20 holdings, shares and bonds, of 5,000 rupees each. One saver put in one tenth of the pool, so owns one tenth of the basket. When one company collapses, only its holding empties: the basket falls from 1,00,000 to 95,000 rupees, 5%, and the saver\u2019s tenth from 10,000 to 9,500; all in that one company would lose 100%. When the market falls, every holding drops 20% together: the basket falls to 80,000 rupees and the saver\u2019s tenth to 8,000, one tenth of the loss. Mutual fund investments are subject to market risks.';

  async setup() {
    this.fresh = false;
    this.gone = GONE0;
    this.t = 1;
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'tile') this.collapse(Number(b.dataset.i));
      else if (b.dataset.act === 'fall') this.run();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.gone = GONE0;
    this.t = 1;
    if (step === 0) { this.fresh = true; this.after(2.6, () => { this.fresh = false; }); }
    else this.after(0.3, () => this.run());
  }

  /** b1: tile i is the one that collapses (the old one comes back). */
  collapse(i) {
    if (this.stepIndex !== 1 || !(i >= 0 && i < N) || this.anim) return;
    if (i === this.gone && this.t >= 1) return;
    this.gone = i;
    this.run();
  }

  /** b1 / b2: t runs 0 -> 1 in 6 steps (0.6 s for one company, 0.8 s for the market). */
  run() {
    const v = this.stepIndex;
    if (v === 0) return;
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.anim = true;
    this.t = 0;
    const n = 6, dt = v === 1 ? 0.1 : 0.135;
    for (let i = 1; i <= n; i++) this.after(i * dt, () => { this.t = i / n; if (i === n) this.anim = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.t = 1;
    this.repaint();
    return true;
  }

  busy() { return this.anim || this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  /** The basket value now. */
  value() {
    const v = this.stepIndex;
    if (v === 1) return POOL - HOLD * this.t;
    if (v === 2) return POOL * (1 - FALL * this.t);
    return POOL;
  }

  level(i) {
    const v = this.stepIndex;
    if (v === 1) return i === this.gone ? 1 - this.t : 1;
    if (v === 2) return 1 - FALL * this.t;
    return 1;
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 0 ? this.paintPool(P) : this.paintBasket(P, v);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  pop(d, body) { return `<g${this.fresh ? ` class="mk-pop" style="--d:${d.toFixed(2)}s"` : ''}>${body}</g>`; }

  grid(G, o = {}) {
    let svg = '', over = '';
    for (let i = 0; i < N; i++) {
      const c = i % 5, r = Math.floor(i / 5), x = G.gx + c * (G.tw + G.gap), y = G.gy + r * (G.th + G.gap);
      const lv = this.level(i), ring = this.stepIndex === 1 && i === this.gone;
      svg += this.pop(o.d0 != null ? o.d0 + i * 0.04 : 0, tile(x, y, G.tw, G.th, TYPES[i], lv, { ring, was: this.stepIndex === 2 && this.t > 0 }));
      if (o.hit) over += `<button type="button" class="sv-hit mf-hit" data-act="tile" data-i="${i}" aria-label="holding ${i + 1}, a ${TYPES[i] === 'S' ? 'share' : 'bond'}: make it collapse" aria-pressed="${ring}" style="left:${x}px;top:${y}px;width:${G.tw}px;height:${G.th}px"></button>`;
    }
    return { svg, over };
  }

  // b0: ten savers, one pool, a manager and a basket of 20 holdings.
  paintPool(P) {
    let svg = '', over = '';
    const G = P
      ? { sx: 22, sdx: 38.4, sy: 70, ss: 0.72, py: 92, ph: 40, px0: 6, pw: 378, row: 168, mg: [62, 410, 140],
        gx: 128, gy: 196, tw: 46, th: 36, gap: 6, key: [[16, 214], [16, 248]], call: [195, 470], call2: 502, note: [195, 552] }
      : { sx: 36, sdx: 54, sy: 84, ss: 0.92, py: 106, ph: 48, px0: 10, pw: 540, row: 194, mg: [70, 438, 146],
        gx: 190, gy: 224, tw: 62, th: 42, gap: 8, key: [[18, 230], [18, 262]], call: [357, 466], call2: null, note: null };
    // the savers and their coins
    for (let i = 0; i < SAVERS; i++) {
      const x = G.sx + i * G.sdx, me = i === ME;
      svg += this.pop(0.05 * i, saver(x, G.sy - 10, G.ss, me ? ACC : 'color-mix(in oklab, var(--sim-label-muted) 55%, var(--sim-bg-surface))', me));
    }
    // the pool: 10 equal parts, the saver's part lit
    const sw = G.pw / SAVERS;
    svg += `<rect x="${G.px0}" y="${G.py + 4}" width="${G.pw}" height="${G.ph}" rx="12" ${fill('var(--sim-stroke)')}/>`;
    for (let i = 0; i < SAVERS; i++) {
      const x = G.px0 + i * sw, me = i === ME;
      svg += this.pop(0.5 + 0.05 * i, `<rect x="${f1(x + 1)}" y="${G.py}" width="${f1(sw - 2)}" height="${G.ph}" rx="8" ${fill(me ? 'color-mix(in oklab, var(--sim-accent) 34%, var(--sim-bg-surface))' : `color-mix(in oklab, ${POOLC} 24%, var(--sim-bg-surface))`, `stroke:${me ? ACC : shade(POOLC, 62)};stroke-width:${me ? 3.5 : 2}`)}/>`
        + (me ? (P ? '' : text(x + sw / 2, G.py + G.ph / 2 + 8, '1/10', 22, ACC_INK)) : coin(x + sw / 2, G.py + G.ph / 2, P ? 10 : 13)));
    }
    svg += text(G.px0 + 4, G.row, `pool ${rs(POOL)}`, P ? 25 : 27, INK, 'start');
    svg += P ? text(G.px0 + G.pw - 4, G.row, `10 x ${rs(EACH)}`, 20, MUTED, 'end', 700) : text(G.px0 + G.pw - 4, G.row, `basket: 20 x ${rs(HOLD)}`, 21, MUTED, 'end', 700);
    // the manager buys the basket
    over += personSlot('manager', { x: G.mg[0], y: G.mg[1], h: G.mg[2], facing: 1, mood: 'smile' });
    svg += nameTag(G.mg[0], G.mg[1] + 4, 'manager', P ? 17 : 18);
    const bw = 5 * G.tw + 4 * G.gap, bh = 4 * G.th + 3 * G.gap;
    svg += `<rect x="${G.gx - 10}" y="${G.gy - 10}" width="${bw + 20}" height="${bh + 20}" rx="16" ${fill('color-mix(in oklab, var(--sim-series-7) 10%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    svg += this.grid(G, { d0: 1.0 }).svg;
    // the key: share / bond
    [['S', 'share'], ['B', 'bond']].forEach(([t, lab], j) => {
      const [x, y] = G.key[j];
      svg += tile(x, y - 14, 30, 26, t, 1) + text(x + 38, y + 6, lab, 20, INK, 'start', 700);
    });
    if (P) {
      svg += text(G.call[0], G.call[1], 'one saver: 1/10 in,', 25, ACC_INK);
      svg += text(G.call[0], G.call2, 'owns 1/10 of the basket', 25, ACC_INK);
      svg += text(G.note[0], G.note[1], `20 holdings, ${rs(HOLD)} each`, 20, MUTED, 'middle', 700);
      svg += text(G.note[0], G.note[1] + 30, 'made-up numbers', 19, MUTED, 'middle', 700);
    } else {
      svg += text(G.call[0], G.call[1], `one saver: ${rs(EACH)} = 1/10, owns 1/10`, 23, ACC_INK);
    }
    return { svg, over };
  }

  // b1 (one company collapses) and b2 (the market falls).
  paintBasket(P, v) {
    let svg = '', over = '';
    const G = P
      ? { card: [8, 10, 374, 86], two: [8, 108, 374, 64], gx: 19, gy: 196, tw: 64, th: 50, gap: 8, me: [195, 460], btn: [195, 504], strip: [8, 540, 374, 70] }
      : { card: [12, 10, 292, 100], two: [316, 10, 232, 100], gx: 50, gy: 132, tw: 84, th: 56, gap: 10, me: [280, 430], btn: [462, 438], strip: [12, 404, 380, 70] };
    const val = this.value(), loss = POOL - val, done = this.t >= 1;
    // the basket value
    const [cx, cy, cw, ch] = G.card;
    svg += panel(cx, cy, cw, ch);
    svg += text(cx + 18, cy + 30, 'basket', 20, MUTED, 'start', 700);
    svg += text(cx + 18, cy + ch - 18, rs(val), P ? 34 : 38, INK, 'start');
    if (loss > 0) {
      svg += text(cx + cw - 16, cy + 30, `-${rs(loss)}`, 21, BAD_INK, 'end');
      svg += text(cx + cw - 16, cy + ch - 18, `-${pct(loss / POOL)}`, P ? 32 : 34, BAD_INK, 'end');
    }
    // the second card: b1 the compare, b2 the saver's tenth
    const [tx, ty, tw, th] = G.two;
    const mine = val / SAVERS;
    if (v === 1) {
      svg += panel(tx, ty, tw, th, { bg: 'color-mix(in oklab, var(--sim-bad) 10%, var(--sim-bg-surface))', edge: BAD });
      if (P) svg += text(tx + 16, ty + 42, 'all in that one company:', 21, INK, 'start', 700) + text(tx + tw - 16, ty + 44, '-100%', 30, BAD_INK, 'end');
      else svg += text(tx + tw / 2, ty + 34, 'all in that company:', 20, INK, 'middle', 700) + text(tx + tw / 2, ty + 80, '-100%', 36, BAD_INK);
    } else {
      svg += panel(tx, ty, tw, th, { bg: 'color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface))', edge: ACC, sw: 3 });
      svg += saver(tx + 30, ty + th - 6, P ? 0.68 : 0.78, ACC, true);
      if (P) {
        svg += text(tx + 64, ty + 28, 'one saver\u2019s 1/10', 20, ACC_INK, 'start');
        svg += text(tx + 64, ty + 56, rs(mine), 26, INK, 'start') + (loss > 0 ? text(tx + tw - 14, ty + 56, `-${rs(loss / SAVERS)}`, 24, BAD_INK, 'end') : '');
      } else {
        svg += text(tx + 62, ty + 24, 'one saver\u2019s 1/10', 19, ACC_INK, 'start');
        svg += text(tx + 62, ty + 62, rs(mine), 28, INK, 'start') + (loss > 0 ? text(tx + tw - 14, ty + 92, `-${rs(loss / SAVERS)}`, 21, BAD_INK, 'end') : '');
      }
    }
    // the basket
    const bw = 5 * G.tw + 4 * G.gap, bh = 4 * G.th + 3 * G.gap;
    svg += `<rect x="${G.gx - 10}" y="${G.gy - 10}" width="${bw + 20}" height="${bh + 20}" rx="16" ${fill('color-mix(in oklab, var(--sim-series-7) 10%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    const g = this.grid(G, { hit: v === 1 });
    svg += g.svg;
    over += g.over;
    if (v === 1) {
      const [mx, my] = G.me;
      if (P) {
        svg += text(mx, my, `one saver\u2019s 1/10: ${rs(mine)}`, 24, ACC_INK);
        svg += text(mx, my + 40, 'tap another holding', 21, MUTED, 'middle', 700);
        svg += text(mx, my + 76, `each holding ${rs(HOLD)}`, 20, MUTED, 'middle', 700);
      } else {
        svg += text(mx, my, `one saver\u2019s 1/10: ${rs(mine)}`, 24, ACC_INK);
        svg += text(mx, my + 32, `tap another holding (each ${rs(HOLD)}), made-up`, 20, MUTED, 'middle', 700);
      }
    } else {
      if (!this.anim) {
        over += `<div class="mf-ab" style="left:${G.btn[0]}px;top:${G.btn[1]}px"><button type="button" class="sv-hit mf-btn${done ? ' mf-btn--quiet' : ''}" data-act="fall">${done ? 'replay the fall' : 'market falls'}</button></div>`;
      }
      if (P) svg += text(195, G.btn[1] - 42, `every holding ${pct(FALL)} down`, 21, BAD_INK);
      // the advert strip
      const [sx, sy, sw, sh] = G.strip;
      svg += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="8" ${fill('color-mix(in oklab, var(--sim-label) 8%, var(--sim-bg-surface))', 'stroke:var(--sim-label-muted);stroke-width:1.6')}/>`;
      svg += text(sx + 14, sy + 30, 'Mutual fund investments are', 20, INK, 'start', 700);
      svg += text(sx + 14, sy + 56, 'subject to market risks.', 20, INK, 'start', 700);
    }
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, gone: this.gone, t: this.t, value: Math.round(this.value()), mine: Math.round(this.value() / SAVERS), anim: this.anim }; }
}
