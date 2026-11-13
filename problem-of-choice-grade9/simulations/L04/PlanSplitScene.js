/**
 * PlanSplitScene - L04 s03 "Plans Need Data" (2 beats). A made-up example, said once on screen.
 *   b0 family: a family's month as one bar of 10 equal parts: must have 5 (food, medicines, school supplies),
 *              would like 3 (a meal out, a film), saved 2. Tap a part: it lights and the line under the bar
 *              names what goes in it.
 *   b1 data:   three planners, one bar each: a family (must have / would like / saved), the government (roads /
 *              schools / welfare), an enterprise (materials / wages / new ideas). A survey report sends "data"
 *              to all three. Switch "plan with data" / "plan by guessing": guessing greys the report, cuts the
 *              data lines, gives each bar a "?" and the wrong sizes; the family's must-have part is too small and
 *              is marked "food runs short". Rest: with data.
 * Colours are tokens only; parts use series tones. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);

const FAMILY = [
  { id: 'must', name: 'must have', tone: 1, n: 5, say: 'Must have: food, medicines, school supplies.' },
  { id: 'like', name: 'would like', tone: 3, n: 3, say: 'Would like: a meal out, a film.' },
  { id: 'save', name: 'saved', tone: 4, n: 2, say: 'Saved: kept for later.' },
];
const PLANNERS = [
  { name: 'a family', pic: 'house', parts: ['must have', 'would like', 'saved'], data: [5, 3, 2], guess: [2, 6, 2] },
  { name: 'the government', pic: 'gov', parts: ['roads', 'schools', 'welfare'], data: [4, 3, 3], guess: [7, 1, 2] },
  { name: 'an enterprise', pic: 'factory', parts: ['materials', 'wages', 'new ideas'], data: [4, 3, 3], guess: [2, 2, 6] },
];
const TONES = [1, 3, 4];

const CSS = `
.ps-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 10px; }
.ps-btn { min-height: 44px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ps-btn:active { transform: translateY(3px); box-shadow: none; }
.ps-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.ps-btn:focus-visible, .ps-part:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ps-p .ps-btn { font-size: 16px; padding: 4px 11px; }
.ps-part { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 10px; }
.ps-say { position: absolute; left: 10px; right: 10px; transform: translateY(-50%); text-align: center; font: 800 20px/1.25 var(--sim-font); color: var(--sim-label); }
.ps-p .ps-say { font-size: 18px; }
svg .ps-pop { transform-box: fill-box; transform-origin: center; animation: ps-pop 0.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ps-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ps-in { animation: ps-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ps-in { from { opacity: 0; } to { opacity: 1; } }
svg .ps-grow { transform-box: fill-box; transform-origin: left center; animation: ps-grow 0.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ps-grow { from { transform: scaleX(0); } to { transform: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tone) {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${inner}</g>`;
}
const ink = (n) => `var(--sim-ink-on-${n}, var(--sim-bg-deep))`;
const seg = (x, y, w, h, n, o = '') => `<g${o}><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill(`var(--sim-series-${n})`, `stroke:color-mix(in oklab, var(--sim-series-${n}) 62%, black);stroke-width:2`)}/></g>`;

export class PlanSplitScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 504;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up example. A family splits its month into parts: must have 5 of 10, would like 3, saved 2. Then a family, the government and an enterprise each split their plans, using data from a survey report. Planning by guessing gives the wrong sizes, and the family runs short of food.';

  async setup() {
    this.part = null;
    this.mode = 'data';
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
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
    this.part = null;
    this.mode = 'data';
    this.fresh = true;
    this.after(2.2, () => { this.fresh = false; });
  }

  act(a, v) {
    if (a === 'part' && this.stepIndex === 0 && FAMILY.some((p) => p.id === v)) { this.part = this.part === v ? null : v; this.fresh = false; this.repaint(); return; }
    if (a === 'mode' && this.stepIndex === 1 && (v === 'data' || v === 'guess')) { this.mode = v; this.fresh = true; this.repaint(); this.after(1.2, () => { this.fresh = false; }); }
  }

  stageHeight(st) { return st.portrait ? 600 : 480; }

  paintFamily(st) {
    const P = st.portrait, W = st.W, fr = this.fresh;
    let svg = '', over = '';
    svg += `<g${fr ? ' class="ps-pop" style="--d:0s"' : ''}>${icon('house', W / 2, P ? 92 : 96, P ? 110 : 120, 1)}</g>`;
    svg += text(W / 2, P ? 178 : 186, "a family's month", P ? 24 : 27);
    const x0 = P ? 20 : 34, bw = W - 2 * x0, y = P ? 214 : 222, h = P ? 84 : 92, cw = bw / 10;
    let k = 0;
    FAMILY.forEach((p, i) => {
      const lit = !this.part || this.part === p.id;
      let g = '';
      for (let j = 0; j < p.n; j++, k++) g += seg(x0 + k * cw + 2, y, cw - 4, h, p.tone, fr ? ` class="ps-pop" style="--d:${f1(0.3 + k * 0.09)}s"` : '');
      const mx = x0 + (k - p.n / 2) * cw, lab = P ? p.name.split(' ') : [p.name];
      lab.forEach((ln, j) => { g += text(mx, y + h + (P ? 30 : 32) + j * 30, ln, P ? 21 : 23); });
      g += `<rect x="${f1(x0 + (k - p.n) * cw)}" y="${f1(y + h + 6)}" width="${f1(p.n * cw)}" height="5" rx="2.5" ${fill(`var(--sim-series-${p.tone})`)}/>`;
      if (this.part === p.id) g += `<rect x="${f1(x0 + (k - p.n) * cw - 4)}" y="${f1(y - 6)}" width="${f1(p.n * cw + 8)}" height="${f1(h + 12)}" rx="12" ${fill('none', 'stroke:var(--sim-accent);stroke-width:4')}/>`;
      svg += `<g style="opacity:${lit ? 1 : 0.3}">${g}</g>`;
      over += `<button type="button" class="ps-part sv-hit" data-act="part" data-val="${p.id}" aria-pressed="${this.part === p.id}" aria-label="${p.name}, ${p.n} of 10 parts" style="left:${f1(x0 + (k - p.n) * cw)}px;top:${f1(y)}px;width:${f1(p.n * cw)}px;height:${f1(h + 70)}px"></button>`;
    });
    svg += text(x0 + bw, y - 14, '10 parts', P ? 19 : 20, 'var(--sim-label-muted)', ' text-anchor="end"');
    const say = this.part ? FAMILY.find((p) => p.id === this.part).say : 'Tap a part to see what goes in it.';
    over += `<div class="ps-say" style="top:${P ? 420 : 412}px">${say}</div>`;
    svg += text(W / 2, P ? 470 : 456, 'a made-up example', P ? 18 : 19, 'var(--sim-label-muted)');
    return { svg, over: `<div class="${P ? 'ps-p' : 'ps-l'}">${over}</div>` };
  }

  paintData(st) {
    const P = st.portrait, W = st.W, g = this.mode === 'guess', fr = this.fresh;
    let svg = '';
    // The survey report: top centre on a phone, left in landscape.
    const rx = P ? W / 2 : 78, ry = P ? 150 : 270, rw = P ? 76 : 96;
    svg += `<g style="opacity:${g ? 0.25 : 1}">${civicSvg('report', rx, ry, { w: rw })}${text(rx, ry + 26, 'survey', P ? 19 : 21)}</g>`;
    const x0 = P ? 22 : 176, bw = W - x0 - (P ? 22 : 18), rows = P ? [252, 372, 492] : [104, 238, 372], bh = P ? 46 : 50;
    PLANNERS.forEach((pl, i) => {
      const y = rows[i], sizes = g ? pl.guess : pl.data;
      // The data line from the report to this bar.
      if (!g) {
        const sx = P ? rx - rw / 2 - 6 : rx + rw / 2 + 4, sy = P ? ry - 50 : ry - 40, ex = P ? x0 - 6 : x0 - 8, ey = P ? y - 26 : y + bh / 2;
        const d = P ? `M${f1(sx)} ${f1(sy)}H10V${f1(ey)}H${f1(ex)}` : `M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}`;
        svg += `<g${fr ? ` class="ps-in" style="--d:${f1(0.2 + i * 0.2)}s"` : ''}><path d="${d}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3;stroke-dasharray:7 6;stroke-linecap:round')}/>`
          + `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="5" ${fill('var(--sim-accent)')}/></g>`;
      }
      // Who plans: a small picture and a name above the bar.
      const pic = pl.pic === 'gov' ? civicSvg('parliament', x0 + 22, y - 10, { w: 44 }) : icon(pl.pic, x0 + 20, y - 26, 38, pl.pic === 'house' ? 1 : 6);
      svg += pic + text(x0 + 48, y - 18, pl.name, P ? 20 : 21, 'var(--sim-label)', ' text-anchor="start"');
      if (i === 0 && !g) svg += text(x0 + bw, y - 18, 'data', P ? 17 : 18, 'var(--sim-accent)', ' text-anchor="end"');
      let x = x0;
      sizes.forEach((n, j) => {
        const w = bw * n / 10;
        svg += seg(x + 2, y, w - 4, bh, TONES[j], fr ? ` class="ps-grow" style="--d:${f1(0.1 + i * 0.15 + j * 0.08)}s"` : '');
        if (w > 64) svg += `<g${fr ? ` class="ps-in" style="--d:${f1(0.6 + i * 0.15)}s"` : ''}>${text(x + w / 2, y + bh / 2 + 6, pl.parts[j], P ? 16 : 17, ink(TONES[j]))}</g>`;
        x += w;
      });
      if (g) svg += text(x0 + bw - 2, y - 16, '?', P ? 30 : 32, 'var(--sim-bad)', ' text-anchor="end"');
      if (g && i === 0) {
        const w = bw * sizes[0] / 10;
        svg += `<rect x="${f1(x0)}" y="${f1(y - 4)}" width="${f1(w)}" height="${f1(bh + 8)}" rx="10" ${fill('none', 'stroke:var(--sim-bad);stroke-width:3.5;stroke-dasharray:7 5')}/>`;
        svg += `<g class="ps-pop" style="--d:0.7s">${text(x0 + w / 2, y + bh + (P ? 26 : 28), 'food runs short', P ? 18 : 19, 'var(--sim-bad)')}</g>`;
      }
    });
    const over = `<div class="ps-row" style="top:${P ? 30 : 28}px">`
      + `<button type="button" class="sv-hit ps-btn" data-act="mode" data-val="data" aria-pressed="${!g}">plan with data</button>`
      + `<button type="button" class="sv-hit ps-btn" data-act="mode" data-val="guess" aria-pressed="${g}">plan by guessing</button></div>`;
    svg += text(W / 2, P ? 584 : 462, g ? 'guessing: the parts come out wrong' : 'a made-up example', P ? 18 : 19, g ? 'var(--sim-bad)' : 'var(--sim-label-muted)');
    return { svg, over: `<div class="${P ? 'ps-p' : 'ps-l'}">${over}</div>` };
  }

  paint(st) { return this.stepIndex === 1 ? this.paintData(st) : this.paintFamily(st); }

  testState() { return { step: this.stepIndex, part: this.part, mode: this.mode }; }
}
