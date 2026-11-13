/**
 * OberoiAreasScene - L04 s05 "Oberoi's hotels and the four areas" (3 beats). SvgScene, design 560 x 480
 * landscape, 390 x 600 portrait. Cast: shared/FinPeople.js (M. S. Oberoi, the same entry as L02
 * OberoiTimelineScene), shared/MoneyKit.js (coin). Drawn here: the plain generic hotel (copied from L02
 * OberoiTimelineScene: no logo, no group name, no real building), action cards, a star badge, a heart. The four
 * boxes match L04 FourAreasBoardScene / L03 PlanUpdateScene (management and operations series 1 top left,
 * finance and accounting 3 top right, human resources 5 bottom left, marketing and sales 6 bottom right; tinted
 * fill, lip, 21 px titles; portrait stacked full width, one-line titles).
 *   b0 A hotel and M. S. Oberoi; five action cards pop in 0.35 s apart: train staff, money for growth, renovate
 *      and run well, trusted brand, customers first.
 *   b1 Each action in its area: the four boxes; four cards fly (0.15 s apart) from where they were into their
 *      boxes (train staff -> human resources, money for growth -> finance, renovate and run well -> operations,
 *      trusted brand -> marketing) and take the area's colour; 'customers first' sits where the four boxes meet
 *      (the top priority in all of them).
 *   b2 What improved the quality: management and operations ('high standards') and human resources ('trained
 *      staff') lit, each with a gold star, and a 'quality' chip; finance ('money for growth') and marketing
 *      ('trusted brand') dimmed, each with an arrow into the lit box beside it.
 * No numbers. Animation is CSS only; a Skip / Replay button sits in the figure. Rest = the final frame.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DUR = [2.4, 1.9, 1.6];

// The same man as in L02 (OberoiTimelineScene / ThreeStartsScene register the same entry).
registerCast('oberoi', { name: 'M. S. Oberoi', series: 0, role: 'adult', i: 61,
  look: { outfit: 'coat', top: 'navy', bottom: 'cream', hairStyle: 'sidepart', moustache: true, shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', glasses: false, dupatta: false, girth: 1, sleeves: 'long' } });

const CSS = `
.oa-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; display: flex; align-items: center; gap: 6px;
  padding: 3px 12px; border-radius: 999px; font: 800 21px/1.2 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.oa-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.oa-chip.gold { border-color: color-mix(in oklab, var(--sim-gold) 60%, var(--sim-label)); background: color-mix(in oklab, var(--sim-gold) 26%, var(--sim-bg-surface)); }
.oa-chip.big { font-size: 24px; padding: 4px 14px; }
.oa-chip svg { width: 28px; height: 28px; flex: none; }
.oa-skip { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.oa-skip:active { transform: translateY(3px); box-shadow: none; }
.oa-skip:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.oa-in { animation: oa-in 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes oa-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
svg .oa-fade { animation: oa-fade 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes oa-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .oa-fly { animation: oa-fly 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes oa-fly { 0% { transform: translate(var(--dx, 0px), var(--dy, 0px)); } 100% { transform: none; } }
svg .oa-dim { opacity: 0.5; animation: oa-dim 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes oa-dim { 0% { opacity: 1; } 100% { opacity: 0.5; } }
.oa-still, .oa-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .oa-in, svg .oa-fade, svg .oa-fly, svg .oa-dim { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);
const iconAt = (name, x, y, size, tone) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
const chip = (t, x, y, d, cls = '') => `<div class="oa-chip oa-in${cls ? ` ${cls}` : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;

const RIM = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const GOLD = 'var(--sim-gold)';
const GOLD_RIM = 'color-mix(in oklab, var(--sim-gold) 55%, var(--sim-label))';

// A generic hotel (as in L02): a pitched roof, floors of windows, a porch door. (x, y) = ground under the middle.
function hotel(x, y, w, o = {}) {
  const floors = o.floors ?? 2, fh = w * 0.3, h = floors * fh + w * 0.2, x0 = x - w / 2, top = y - h;
  const wall = `color-mix(in oklab, var(--sim-series-${o.tone ?? 4}) 22%, var(--sim-bg-surface))`;
  const roof = `color-mix(in oklab, var(--sim-series-${o.roof ?? 6}) 70%, var(--sim-label) 15%)`;
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="3" ${fill(wall, `stroke:${RIM};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x0 - w * 0.08)} ${f1(top + 2)}L${f1(x)} ${f1(top - w * 0.26)}L${f1(x0 + w * 1.08)} ${f1(top + 2)}Z" ${fill(roof, `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  const cols = Math.max(2, Math.round(w / 46)), gap = w / cols, ww = gap * 0.46;
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = x0 + gap * (c + 0.5) - ww / 2, wy = top + w * 0.08 + f * fh;
      s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="${f1(ww)}" height="${f1(fh * 0.56)}" rx="2" ${fill('color-mix(in oklab, var(--sim-water) 40%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:2`)}/>`;
    }
  }
  const dw = w * 0.26, dh = w * 0.2;
  s += `<rect x="${f1(x - dw / 2)}" y="${f1(y - dh)}" width="${f1(dw)}" height="${f1(dh)}" rx="${f1(dw * 0.4)}" ${fill(WOOD, `stroke:${RIM};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0 - 4)}" y="${f1(y - 4)}" width="${f1(w + 8)}" height="6" rx="3" ${fill(RIM)}/>`;
  return s;
}

function heart(x, y, r, col = 'var(--sim-series-6)') {
  return `<path d="M${f1(x)} ${f1(y + r * 1.1)}l${f1(-r * 1.2)} ${f1(-r * 1.2)}a${f1(r * 0.62)} ${f1(r * 0.62)} 0 0 1 ${f1(r * 1.2)} ${f1(-r * 0.9)}a${f1(r * 0.62)} ${f1(r * 0.62)} 0 0 1 ${f1(r * 1.2)} ${f1(r * 0.9)}Z" ${fill(col, `stroke:${shade(col, 62)};stroke-width:1.5;stroke-linejoin:round`)}/>`;
}

function star(x, y, r) {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`; }
  return `<path d="${d}Z" ${fill(GOLD, `stroke:${GOLD_RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`;
}

// The five actions (book's bullets). area: index into AREAS (-1 = all areas).
const ACTS = [
  { t: 'train staff', ic: 'person', area: 2 },
  { t: 'money for growth', ic: 'coin', area: 1 },
  { t: 'renovate, run well', ic: 'hammer', area: 0 },
  { t: 'trusted brand', ic: 'seal', area: 3 },
  { t: 'customers first', ic: 'heart', area: -1 },
];
const AREAS = [
  { t: ['management', 'and operations'], s: 1, b3: 'high standards', lit: true },
  { t: ['finance', 'and accounting'], s: 3, b3: 'money for growth', lit: false },
  { t: ['human', 'resources'], s: 5, b3: 'trained staff', lit: true },
  { t: ['marketing', 'and sales'], s: 6, b3: 'trusted brand', lit: false },
];

function actIcon(ic, x, y, s, tone) {
  if (ic === 'coin') return coin(x, y, s * 0.4);
  if (ic === 'heart') return heart(x, y - s * 0.1, s * 0.34);
  return iconAt(ic, x, y, s, tone);
}

/** An action card: (x, y) top left. */
function card(x, y, w, h, a, label, rim, fs) {
  let s = lipRect(x, y, w, h, 12, 'var(--sim-bg-surface)', rim);
  s += actIcon(a.ic, x + h * 0.52, y + h / 2, h * 0.66, a.ic === 'person' ? 5 : a.ic === 'hammer' ? 1 : 6);
  s += text(x + h * 0.95, y + h / 2 + fs * 0.36, label, fs, 'var(--sim-label)', 'start');
  return s;
}

export class OberoiAreasScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'M. S. Oberoi and his hotels. Five actions: train staff, manage money for growth, renovate hotels and run them well, build a trusted brand, put customers first. Each action goes into its area: training staff into human resources, money for growth into finance and accounting, renovating and running hotels into management and operations, the trusted brand into marketing and sales; customers first sits across all four areas. What improved quality: management and operations kept high standards and human resources trained the staff, both marked with a star; finance managed money for growth and marketing built the trusted brand, working with them.';

  async setup() {
    this.still = false;
    this.run = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'skip') this.finish();
      else this.restart();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  enter() { this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    if (this._timers) this.after(DUR[this.stepIndex] ?? 2, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 0 ? this.paintActions(P) : this.paintAreas(P, v);
    const still = this.still ? ' oa-still' : '';
    const pos = v === 0 && P ? 'left:8px;top:8px' : 'right:8px;bottom:8px';
    const btn = `<button type="button" class="sv-hit tap btn oa-skip" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  /** b0 card boxes [x, y, w, h], one per action. */
  actBoxes(P) {
    return ACTS.map((_, i) => (P ? [12, 296 + i * 58, 366, 50] : [250, 24 + i * 80, 298, 62]));
  }

  /** Area boxes [x, y, w, h] (b1, b2): FourAreasBoardScene's grid, ending above the Skip button. */
  areaBoxes(P) {
    return P
      ? [0, 1, 2, 3].map((i) => [12, 8 + i * 124, 366, 112])
      : [[12, 12, 262, 200], [286, 12, 262, 200], [12, 240, 262, 188], [286, 240, 262, 188]];
  }

  /** Where the area's card sits (top left, size) in a box. */
  cardIn(P, [x, y, w]) {
    return P ? [x + 12, y + 46, w - 24, 52] : [x + 8, y + 76, w - 16, 58];
  }

  // b0: Oberoi, his hotel, five actions.
  paintActions(P) {
    let svg = P
      ? hotel(108, 240, 150, { floors: 2 })
      : hotel(118, 300, 190, { floors: 2 });
    let over = P
      ? personSlot('oberoi', { x: 290, y: 252, h: 216, facing: -1, mood: 'smile' })
      : personSlot('oberoi', { x: 118, y: 452, h: 226, mood: 'smile' });
    over += P ? chip('M. S. Oberoi', 108, 268, 0.2) : chip('M. S. Oberoi', 118, 464, 0.2);
    const fs = P ? 21 : 22;
    this.actBoxes(P).forEach(([x, y, w, h], i) => {
      const a = ACTS[i], rim = a.area < 0 ? 'var(--sim-accent)' : 'var(--sim-stroke)';
      svg += `<g class="mk-pop" style="--d:${(0.4 + i * 0.35).toFixed(2)}s">${card(x, y, w, h, a, a.t, rim, fs)}</g>`;
    });
    return { svg, over };
  }

  // b1: the cards in their areas; b2: what improved quality.
  paintAreas(P, v) {
    const B = this.areaBoxes(P), from = this.actBoxes(P);
    let svg = '', over = '';
    AREAS.forEach((a, i) => {
      const [x, y, w, h] = B[i], col = `var(--sim-series-${a.s})`, rim = shade(col, 62);
      const dim = v === 2 && !a.lit;
      let s = lipRect(x, y, w, h, 14, `color-mix(in oklab, ${col} 14%, var(--sim-bg-surface))`, rim);
      s += P ? text(x + 14, y + 30, a.t.join(' '), 21, 'var(--sim-label)', 'start')
        : text(x + w / 2, y + 28, a.t[0], 21) + text(x + w / 2, y + 57, a.t[1], 21);
      const ai = ACTS.findIndex((c) => c.area === i), act = ACTS[ai];
      const [cx, cy, cw, ch] = this.cardIn(P, B[i]);
      const label = v === 2 ? a.b3 : act.t;
      const c = card(cx, cy, cw, ch, act, label, rim, P ? 21 : 19);
      if (v === 1) {
        const [fx, fy] = from[ai];
        s += `<g class="oa-fly" style="--d:${(0.3 + i * 0.15).toFixed(2)}s;--dx:${f1(fx - cx)}px;--dy:${f1(fy - cy)}px">${c}</g>`;
      } else s += c;
      svg += dim ? `<g class="oa-dim" style="--d:0.1s">${s}</g>` : s;
      if (v === 2 && a.lit) {
        svg += `<g class="mk-pop" style="--d:0.4s">${star(x + w - 28, y + 30, 22)}</g>`;
      }
    });
    if (v === 1) {
      const [mx, my] = P ? [195, 8 + 2 * 124 - 6] : [280, 226];
      over += chip(`<svg viewBox="0 0 28 28">${heart(14, 13, 11)}</svg>customers first`, mx, my, 1.2, 'acc big');
    } else {
      // arrows: finance -> operations, marketing -> human resources
      [[1, 0], [3, 2]].forEach(([fromI, toI], j) => {
        const [fx, fy, fw, fh] = this.cardIn(P, B[fromI]), [tx, ty, tw, th] = this.cardIn(P, B[toI]);
        const d = (0.8 + j * 0.2).toFixed(2);
        if (P) {
          const ax = fx + fw - 36, y0 = fy - 2, y1 = ty + th + 8;
          svg += `<g class="oa-fade" style="--d:${d}s"><path d="M${f1(ax)} ${f1(y0)}V${f1(y1 + 14)}" ${stroke('var(--sim-accent)', 6)}/><path d="M${f1(ax - 13)} ${f1(y1 + 16)}L${f1(ax)} ${f1(y1)}L${f1(ax + 13)} ${f1(y1 + 16)}Z" ${fill('var(--sim-accent)')}/></g>`;
        } else {
          const ay = fy + fh + 28, x0 = fx + 90, x1 = tx + tw - 90;
          svg += `<g class="oa-fade" style="--d:${d}s"><path d="M${f1(x0)} ${f1(ay)}H${f1(x1 + 16)}" ${stroke('var(--sim-accent)', 6)}/><path d="M${f1(x1 + 18)} ${f1(ay - 13)}L${f1(x1)} ${f1(ay)}L${f1(x1 + 18)} ${f1(ay + 13)}Z" ${fill('var(--sim-accent)')}/></g>`;
        }
      });
      const [qx, qy] = P ? [100, 576] : [143, 226];
      over += chip(`<svg viewBox="0 0 28 28">${star(14, 15, 12)}</svg>quality`, qx, qy, 0.6, 'gold big');
    }
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
