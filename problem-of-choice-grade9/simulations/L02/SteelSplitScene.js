/**
 * SteelSplitScene - L02 s01 "One Load of Steel" (2 beats). Book Fig 8.2: steel for medical equipment, aircraft
 * or refrigerators.
 *   b0 pile:      one pile of 10 steel bars (big, top centre). Arrows lead from the pile to three uses, with
 *                 "or" between them: the same steel could go to any one of them. Nothing to tap; the pile builds,
 *                 then the arrows draw.
 *   b1 competing: the 10 bars shared out, one stack per use (at rest 4, 3, 3). "+1 bar" under a use moves one
 *                 bar to it, and that bar flies out of another stack (the fullest other one): "-1" there, "+1"
 *                 here. The total stays 10. Each stack's count is the bars drawn in it. Named cases: "all to
 *                 medical equipment" (10, 0, 0) and "share out" (4, 3, 3, the rest state). Any split is allowed.
 * Drawn in stage px (st.W wide). Colours are tokens only; the steel is label-muted mixed into the surface.
 * ASCII only.
 */
import { SvgScene, fill, chip } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const TOTAL = 10;
const REST = [4, 3, 3];
const USES = [
  { name: ['medical', 'equipment'], full: 'medical equipment', tone: 1, pic: 'monitor' },
  { name: ['aircraft'], full: 'aircraft', tone: 5, pic: 'plane' },
  { name: ['refrigerators'], full: 'refrigerators', tone: 3, pic: 'fridge' },
];
const FLY_S = 0.6;
const f1 = (v) => (+v).toFixed(1);
const MINUS = String.fromCharCode(0x2212);

const STEEL = 'color-mix(in srgb, var(--sim-label-muted) 42%, var(--sim-bg-surface))';
const STEEL_RIM = 'color-mix(in srgb, var(--sim-label-muted) 85%, var(--sim-label))';
const STEEL_TOP = 'color-mix(in srgb, var(--sim-label-muted) 18%, var(--sim-bg-surface))';

const CSS = `
.ss-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: nowrap; }
.ss-btn { min-height: 44px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 17px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--c, var(--sim-stroke)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c, var(--sim-stroke)); }
.ss-btn:active { transform: translateY(3px); box-shadow: none; }
.ss-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.ss-btn:disabled { opacity: 0.4; cursor: default; }
.ss-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ss-add { position: absolute; transform: translate(-50%, -50%); font-size: 19px; padding: 5px 16px; }
.ss-add:active { transform: translate(-50%, calc(-50% + 3px)); }
.ss-add.ss-pulse { outline: 3px dashed var(--sim-accent); outline-offset: 5px; animation: ss-pulse 1.3s ease-in-out infinite; }
@keyframes ss-pulse { 50% { box-shadow: 0 0 0 6px color-mix(in oklab, var(--sim-accent) 40%, transparent); } }
.ss-p .ss-btn { font-size: 16px; padding: 4px 11px; }
.ss-p .ss-add { font-size: 18px; padding: 4px 12px; }
svg .ss-pop { transform-box: fill-box; transform-origin: center; animation: ss-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ss-pop { 0% { transform: translateY(-14px) scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ss-in { animation: ss-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ss-in { from { opacity: 0; } to { opacity: 1; } }
svg .ss-fly { animation: ss-fly ${FLY_S}s cubic-bezier(0.3, 0.7, 0.3, 1) both; }
@keyframes ss-fly { from { transform: translate(var(--dx), var(--dy)); } to { transform: none; } }
svg .ss-fade { animation: ss-fade 0.9s ease-out both; }
@keyframes ss-fade { 0% { opacity: 1; } 100% { opacity: 0; } }
svg .ss-rise { animation: ss-rise 0.9s ease-out both; }
@keyframes ss-rise { 0% { opacity: 0; transform: translateY(8px); } 25% { opacity: 1; transform: none; } 75% { opacity: 1; } 100% { opacity: 0; } }
`;

/** One steel bar: a flat rounded bar, a paler top face, a darker rim (no gloss). */
function barSvg(x, y, w, h, extra = '') {
  return `<g${extra}><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(Math.min(5, h / 3))}" ${fill(STEEL, `stroke:${STEEL_RIM};stroke-width:2`)}/>`
    + `<rect x="${f1(x + 4)}" y="${f1(y + 3)}" width="${f1(w - 8)}" height="${f1(Math.max(2, h * 0.22))}" rx="1.5" ${fill(STEEL_TOP)}/></g>`;
}

/** A use's picture on a 48 grid, centred on (cx, cy), size px across, in series tone n. */
function picSvg(kind, cx, cy, size, n) {
  const s = size / 48, tf = `translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(+s).toFixed(3)})`;
  const B = 'var(--i)', D = 'color-mix(in oklab, var(--i) 64%, black)', L = 'color-mix(in oklab, var(--i) 45%, white)', I = 'var(--sim-bg-deep)';
  let body = '';
  if (kind === 'plane') {
    body = (iconSvg('plane', n).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  } else if (kind === 'monitor') {
    // A heart monitor on a wheeled stand.
    body = `<rect x="6" y="5" width="36" height="24" rx="4" fill="${B}"/><rect x="9.5" y="8.5" width="29" height="17" rx="2" fill="${I}"/>`
      + `<path d="M11 18H17L19.5 12L23 23L26 15L28 18H37" fill="none" stroke="${D}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`
      + `<rect x="22.5" y="29" width="3" height="10" rx="1.5" fill="${D}"/><rect x="12" y="38" width="24" height="4" rx="2" fill="${D}"/>`
      + `<circle cx="14" cy="44" r="2.6" fill="${D}"/><circle cx="34" cy="44" r="2.6" fill="${D}"/><rect x="33" y="7" width="4" height="2" rx="1" fill="${L}"/>`;
  } else {
    // A refrigerator: two doors, handles, small feet.
    body = `<rect x="12" y="3" width="24" height="40" rx="4" fill="${B}"/><rect x="12" y="16" width="24" height="2.4" fill="${D}"/>`
      + `<rect x="15.5" y="7" width="2.6" height="6" rx="1.3" fill="${I}"/><rect x="15.5" y="21" width="2.6" height="11" rx="1.3" fill="${I}"/>`
      + `<rect x="30" y="6" width="3" height="8" rx="1.5" fill="${L}"/><rect x="14" y="42" width="5" height="3.5" rx="1.2" fill="${D}"/><rect x="29" y="42" width="5" height="3.5" rx="1.2" fill="${D}"/>`;
  }
  return `<g transform="${tf}" style="--i:var(--sim-series-${n})">${body}</g>`;
}

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle"${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

export class SteelSplitScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 496;   // the host budgets the landscape panel from this (about 465 / HEIGHT at 1280x720)
  static PORTRAIT_HEIGHT = 560;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Ten steel bars. The same steel can make medical equipment, aircraft or refrigerators. Then the bars are shared out, 4, 3 and 3. Tap +1 bar under a use to give it one more bar: that bar is taken from another use, and the total stays 10.';

  async setup() {
    this.counts = REST.slice();
    this.fly = null;        // { from, to } while a bar is in the air
    this.moved = false;
    this.fresh = true;      // the beat's entrance animation plays on this paint only
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.disabled) return;
      this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() {
    this.counts = REST.slice();
    this.fly = null;
    this.moved = false;
    this.fresh = true;
    this.after(1.6, () => { this.fresh = false; });
  }

  act(a, v) {
    if (this.stepIndex !== 1) return;
    this.fresh = false;
    if (a === 'add') {
      const i = Number(v);
      if (!(i >= 0 && i < 3)) return;
      // The bar comes from the fullest other use (ties: the next use round the row).
      const others = [(i + 1) % 3, (i + 2) % 3];
      const j = this.counts[others[1]] > this.counts[others[0]] ? others[1] : others[0];
      if (this.counts[j] <= 0) return;
      this.counts[j] -= 1;
      this.counts[i] += 1;
      this.fly = { from: j, to: i };
      this.moved = true;
      this.after(0.95, () => { this.fly = null; this.repaint(); });
    } else if (a === 'allmed') {
      this.counts = [TOTAL, 0, 0]; this.fly = null; this.moved = true;
    } else if (a === 'share') {
      this.counts = REST.slice(); this.fly = null; this.moved = true;
    } else return;
    this.repaint();
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    const cx = (k) => W * (1 + 2 * k) / 6;
    return P
      ? { P, W, cx, head: 24, picY: 78, pic: 52, lab: 132, binTop: 158, base: 368, barW: 100, barH: 17, step: 20, cnt: 398, add: 444, cases: 500, H: 532, fs: 17, cfs: 22 }
      : { P, W, cx, head: 24, picY: 76, pic: 58, lab: 134, binTop: 158, base: 368, barW: 126, barH: 17, step: 20, cnt: 398, add: 442, H: 470, fs: 19, cfs: 24 };
  }

  stageHeight(st) { return this.layout(st).H; }

  /** Top-left of bar k (0 = bottom) in use i's stack. */
  slot(L, i, k) { return { x: L.cx(i) - L.barW / 2, y: L.base - (k + 1) * L.step + (L.step - L.barH) }; }

  paintPile(L) {
    const P = L.P, W = L.W, bw = P ? 74 : 90, bh = P ? 22 : 24, g = 5, rows = [4, 3, 2, 1];
    const baseY = P ? 176 : 156;
    let svg = '', n = 0;
    rows.forEach((cnt, r) => {
      const rowW = cnt * bw + (cnt - 1) * g, x0 = W / 2 - rowW / 2, y = baseY - (r + 1) * (bh + 4);
      for (let k = 0; k < cnt; k++) {
        svg += barSvg(x0 + k * (bw + g), y, bw, bh, ` class="ss-pop" style="--d:${f1(n * 0.07)}s"`);
        n += 1;
      }
    });
    svg += text(W / 2, baseY + (P ? 30 : 32), '10 steel bars', P ? 22 : 24, 'var(--sim-label)', ' class="ss-in" style="--d:0.7s"');
    // Arrows from the pile to each use, then the uses, with "or" between them.
    const ay0 = baseY + (P ? 46 : 46), useY = P ? 316 : 300, ay1 = useY - (P ? 44 : 48);
    USES.forEach((u, i) => {
      const x = L.cx(i), d = 1.0 + i * 0.25;
      const sx = W / 2 + (x - W / 2) * 0.25, ang = Math.atan2(ay1 - ay0, x - sx), hx = x, hy = ay1;
      const p1 = `${f1(hx - 12 * Math.cos(ang - 0.45))} ${f1(hy - 12 * Math.sin(ang - 0.45))}`, p2 = `${f1(hx - 12 * Math.cos(ang + 0.45))} ${f1(hy - 12 * Math.sin(ang + 0.45))}`;
      svg += `<g class="ss-in" style="--d:${f1(d)}s"><line x1="${f1(sx)}" y1="${f1(ay0)}" x2="${f1(hx - 6 * Math.cos(ang))}" y2="${f1(hy - 6 * Math.sin(ang))}" style="stroke:var(--sim-label-muted);stroke-width:3.5;stroke-dasharray:9 7;stroke-linecap:round"/>`
        + `<path d="M${f1(hx)} ${f1(hy)}L${p1}L${p2}Z" ${fill('var(--sim-label-muted)')}/></g>`;
      svg += `<g class="ss-pop" style="--d:${f1(d + 0.15)}s">${picSvg(u.pic, x, useY, P ? 70 : 80, u.tone)}</g>`;
      u.name.forEach((ln, k) => { svg += text(x, useY + (P ? 58 : 64) + k * (L.fs + 8), ln, L.fs + 1, 'var(--sim-label)', ` class="ss-in" style="--d:${f1(d + 0.2)}s"`); });
    });
    for (const k of [1, 2]) svg += text(W * k / 3, useY + 8, 'or', P ? 20 : 22, 'var(--sim-label-muted)', ' class="ss-in" style="--d:1.9s"');
    return svg;
  }

  paintSplit(L) {
    const P = L.P;
    let svg = '', over = '';
    USES.forEach((u, i) => {
      const x = L.cx(i), c = this.counts[i], tone = `var(--sim-series-${u.tone})`;
      svg += picSvg(u.pic, x, L.picY, L.pic, u.tone);
      if (u.name.length === 2) u.name.forEach((ln, k) => { svg += text(x, L.lab - 11 + k * (L.fs + 7), ln, L.fs); });
      else svg += text(x, L.lab + 2, u.name[0], L.fs);
      // The bin: room for all 10 bars, so an empty or full stack reads at a glance.
      svg += `<rect x="${f1(x - L.barW / 2 - 9)}" y="${f1(L.binTop)}" width="${f1(L.barW + 18)}" height="${f1(L.base - L.binTop + 8)}" rx="12" ${fill(`color-mix(in srgb, ${tone} 8%, transparent)`, `stroke:color-mix(in srgb, ${tone} 70%, var(--sim-stroke));stroke-width:2.5;stroke-dasharray:8 6`)}/>`;
      for (let k = 0; k < c; k++) {
        const s = this.slot(L, i, k);
        let extra = '';
        if (this.fly && this.fly.to === i && k === c - 1) {
          const from = this.slot(L, this.fly.from, this.counts[this.fly.from]);
          extra = ` class="ss-fly" style="--dx:${f1(from.x - s.x)}px;--dy:${f1(from.y - s.y)}px"`;
        } else if (this.fresh) extra = ` class="ss-pop" style="--d:${f1(0.1 + k * 0.05 + i * 0.12)}s"`;
        svg += barSvg(s.x, s.y, L.barW, L.barH, extra);
      }
      // The count under the stack: the bars drawn above it.
      svg += text(x, L.cnt, `${c} ${c === 1 ? 'bar' : 'bars'}`, L.cfs);
      if (this.fly && this.fly.from === i) {
        const s = this.slot(L, i, c);
        svg += `<rect class="ss-fade" x="${f1(s.x)}" y="${f1(s.y)}" width="${f1(L.barW)}" height="${f1(L.barH)}" rx="5" ${fill('none', 'stroke:var(--sim-bad);stroke-width:2.5;stroke-dasharray:6 4')}/>`;
        svg += `<g class="ss-rise">${text(x + L.barW / 2 + (P ? -6 : 2), s.y - 6, `${MINUS}1`, L.cfs, 'var(--sim-bad)', ' text-anchor="start"')}</g>`;
      }
      if (this.fly && this.fly.to === i) {
        const s = this.slot(L, i, c - 1);
        svg += `<g class="ss-rise">${text(x + L.barW / 2 + (P ? -6 : 2), s.y - 6, '+1', L.cfs, 'var(--sim-good)', ' text-anchor="start"')}</g>`;
      }
      const othersEmpty = this.counts[(i + 1) % 3] + this.counts[(i + 2) % 3] === 0;
      const pulse = !this.moved && i === 1;
      over += `<button type="button" class="sv-hit ss-btn ss-add${pulse ? ' ss-pulse' : ''}" data-act="add" data-val="${i}"${othersEmpty ? ' disabled' : ''}`
        + ` aria-label="one more bar for ${u.full}, taken from another use" style="--c:${tone};left:${f1(x)}px;top:${f1(L.add)}px">+1 bar</button>`;
    });
    const isAll = this.counts[0] === TOTAL, isShare = this.counts.join() === REST.join();
    const cases = `<button type="button" class="sv-hit ss-btn" data-act="allmed" aria-pressed="${isAll}">all to medical equipment</button>`
      + `<button type="button" class="sv-hit ss-btn" data-act="share" aria-pressed="${isShare}">share out</button>`;
    const total = chip('10 bars in all', 0, 0, { tone: 'plain', static: true });
    if (P) {
      over += `<div class="ss-row" style="top:${L.head}px">${total}</div>`;
      over += `<div class="ss-row" style="top:${L.cases}px">${cases}</div>`;
    } else {
      over += `<div class="ss-row" style="top:${L.head}px">${total}${cases}</div>`;
    }
    return { svg, over };
  }

  paint(st) {
    const L = this.layout(st);
    const wrapOpen = L.P ? '<div class="ss-p">' : '<div class="ss-l">';
    if (this.stepIndex !== 1) return { svg: this.paintPile(L), over: '' };
    const { svg, over } = this.paintSplit(L);
    return { svg, over: wrapOpen + over + '</div>' };
  }

  testState() { return { step: this.stepIndex, counts: this.counts.join(','), total: this.counts.reduce((a, b) => a + b, 0), moved: this.moved }; }
}
