/**
 * GreekWordScene - L04 s01 "A Greek Word" (2 beats).
 *   b0 split: the word "oikonomia" sits whole, then splits into its two parts. Under each part: the Greek word
 *             (oikos, nemein), its meaning (household, management) and a big picture (a house; a plan sheet with
 *             ticks). Last: "economics = household management". "Split again" replays it.
 *   b1 scale: one plan, two sizes. A family (one house) or a country (fields, factory, houses, school, hospital,
 *             road). Above the hero, wants keep coming (many); below it, its limited resources (money for the
 *             family; land, labour, capital for the country). Enters on the family, then grows to the country;
 *             the two buttons switch between them. The line under it holds for both: limited resources, many
 *             wants, so we plan.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.gw-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 10px; }
.gw-btn { min-height: 44px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.gw-btn:active { transform: translateY(3px); box-shadow: none; }
.gw-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.gw-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.gw-p .gw-btn { font-size: 17px; padding: 4px 13px; }
svg .gw-pop { transform-box: fill-box; transform-origin: center; animation: gw-pop 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes gw-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .gw-in { animation: gw-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes gw-in { from { opacity: 0; } to { opacity: 1; } }
svg .gw-apart { animation: gw-apart 0.7s cubic-bezier(0.3, 0.7, 0.3, 1) both; animation-delay: var(--d, 0s); }
@keyframes gw-apart { from { transform: translateX(var(--dx)); } to { transform: none; } }
svg .gw-drop { animation: gw-drop 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes gw-drop { from { transform: translateY(-26px); opacity: 0; } to { transform: none; opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

/** An icon from the kit, size px, centred on (cx, cy). */
function icon(name, cx, cy, size, tone, extra = '') {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g${extra}><g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:${typeof tone === 'number' ? `var(--sim-series-${tone})` : tone}">${inner}</g></g>`;
}

/** A plan sheet: a board with three ticked rows (managing = planning what goes where). */
function planSvg(cx, cy, size) {
  const s = size / 48, tf = `translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${s.toFixed(3)})`;
  const B = 'var(--sim-series-3)', D = 'color-mix(in oklab, var(--sim-series-3) 64%, black)', P = 'var(--sim-bg-surface)', K = 'var(--sim-good)', L = 'var(--sim-label-muted)';
  let rows = '';
  for (let k = 0; k < 3; k++) {
    const y = 17 + k * 9;
    rows += `<rect x="12" y="${y}" width="6" height="6" rx="1.5" ${fill(P, `stroke:${D};stroke-width:1.2`)}/>`
      + `<path d="M13 ${y + 3}l2 2l3.6 -4.4" ${fill('none', `stroke:${K};stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round`)}/>`
      + `<rect x="21" y="${y + 1.5}" width="${15 - k * 3}" height="3" rx="1.5" ${fill(L)}/>`;
  }
  return `<g transform="${tf}"><rect x="7" y="6" width="34" height="40" rx="4" ${fill(B)}/><rect x="10" y="11" width="28" height="32" rx="2" ${fill(P)}/>`
    + `<rect x="17" y="3" width="14" height="7" rx="3" ${fill(D)}/>${rows}</g>`;
}

/** A small resource block (limited: a few, never growing). */
const block = (x, y, s, n, extra = '') =>
  `<g${extra}><rect x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}" rx="${f1(s / 5)}" ${fill(`var(--sim-series-${n})`, `stroke:color-mix(in oklab, var(--sim-series-${n}) 64%, black);stroke-width:2`)}/></g>`;

const WANTS = { family: [['phone', 2], ['ticket', 6], ['cup', 1], ['book', 3], ['plane', 5], ['tyre', 8]], country: [['school', 3], ['hospital', 1], ['road', 8], ['train', 5], ['canal', 2], ['house', 6]] };
const RES = { family: [['money', 4]], country: [['land', 4], ['labour', 2], ['capital', 6]] };
const COUNTRY = [['field', 4], ['factory', 6], ['house', 1], ['school', 3], ['hospital', 1], ['road', 8]];

export class GreekWordScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 528;
  static PORTRAIT_HEIGHT = 572;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The Greek word oikonomia splits into oikos, the household, and nemein, management: economics first meant household management. Then one family and one whole country: each has many wants and limited resources, so each must plan. Buttons switch between the family and the country.';

  async setup() {
    this.view = 'family';
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

  enter(step) {
    this.fresh = true;
    this.view = 'family';
    this.picked = false;
    if (step === 1) {
      // The family first, then the same picture grows to a country (the rest state), unless the learner picked.
      this.after(2.4, () => { if (this.picked) return; this.view = 'country'; this.fresh = true; this.repaint(); });
    }
  }

  act(a, v) {
    if (a === 'again' && this.stepIndex === 0) { this.fresh = true; this.repaint(); return; }
    if (a === 'view' && this.stepIndex === 1 && (v === 'family' || v === 'country')) {
      this.picked = true;
      this.view = v;
      this.fresh = true;
      this.repaint();
    }
  }

  stageHeight(st) { return st.portrait ? 548 : 504; }

  paintSplit(st) {
    const P = st.portrait, W = st.W;
    const lx = W * 0.27, rx = W * 0.73;
    const fs = P ? 40 : 50, wy = P ? 64 : 70;
    // The whole word: two halves that start touching in the middle, then move apart.
    const gap = P ? 3 : 4;
    const leftW = P ? 82 : 102, rightW = P ? 120 : 150;   // rough widths of "oiko" and "nomia" at fs
    const dxL = W / 2 - gap - leftW / 2 - lx, dxR = W / 2 + gap + rightW / 2 - rx;
    const half = (x, t, n, dx) => `<g class="gw-apart" style="--dx:${f1(dx)}px;--d:0.7s">`
      + `<rect x="${f1(x - (t.length * fs * 0.3) - 12)}" y="${f1(wy - fs * 0.82)}" width="${f1(t.length * fs * 0.6 + 24)}" height="${f1(fs * 1.12)}" rx="14" ${fill(`color-mix(in oklab, var(--sim-series-${n}) 16%, var(--sim-bg-surface))`, `stroke:var(--sim-series-${n});stroke-width:3`)}/>`
      + text(x, wy, t, fs, `color-mix(in oklab, var(--sim-series-${n}) 70%, var(--sim-label))`) + '</g>';
    let svg = half(lx, 'oiko', 1, dxL) + half(rx, 'nomia', 3, dxR);
    const ay0 = wy + fs * 0.42, ay1 = P ? 128 : 140;
    for (const x of [lx, rx]) {
      svg += `<g class="gw-in" style="--d:1.4s"><line x1="${f1(x)}" y1="${f1(ay0)}" x2="${f1(x)}" y2="${f1(ay1 - 8)}" style="stroke:var(--sim-label-muted);stroke-width:3.5;stroke-dasharray:8 6;stroke-linecap:round"/>`
        + `<path d="M${f1(x)} ${f1(ay1)}l-8 -11h16z" ${fill('var(--sim-label-muted)')}/></g>`;
    }
    const gy = P ? 160 : 176, my = P ? 190 : 210, py = P ? 268 : 300, ps = P ? 96 : 120;
    svg += `<g class="gw-in" style="--d:1.6s">${text(lx, gy, 'oikos', P ? 26 : 30)}${text(rx, gy, 'nemein', P ? 26 : 30)}</g>`;
    svg += `<g class="gw-in" style="--d:1.9s">${text(lx, my, 'household', P ? 21 : 23, 'var(--sim-label-muted)')}${text(rx, my, 'management', P ? 21 : 23, 'var(--sim-label-muted)')}</g>`;
    svg += `<g class="gw-pop" style="--d:2.1s">${icon('house', lx, py, ps, 1)}</g>`;
    svg += `<g class="gw-pop" style="--d:2.3s">${planSvg(rx, py, ps)}</g>`;
    svg += `<g class="gw-in" style="--d:2.4s">${text(W / 2, py + 8, '+', P ? 34 : 40, 'var(--sim-label-muted)')}</g>`;
    const ry = P ? 372 : 414;
    svg += `<g class="gw-pop" style="--d:2.8s"><rect x="${f1(W / 2 - (P ? 172 : 230))}" y="${f1(ry - (P ? 30 : 32))}" width="${f1(P ? 344 : 460)}" height="${P ? 70 : 54}" rx="16" ${fill('color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3')}/>`
      + (P ? text(W / 2, ry - 8, 'economics =', 20) + text(W / 2, ry + 20, 'household management', 20)
        : text(W / 2, ry + 2, 'economics = household management', 25)) + '</g>';
    const over = `<div class="gw-row" style="top:${P ? 470 : 474}px"><button type="button" class="sv-hit gw-btn" data-act="again">Split again</button></div>`;
    return { svg, over: `<div class="${P ? 'gw-p' : 'gw-l'}">${over}</div>` };
  }

  paintScale(st) {
    const P = st.portrait, W = st.W, v = this.view, fr = this.fresh;
    const anim = (cls, d) => (fr ? ` class="${cls}" style="--d:${f1(d)}s"` : '');
    let svg = '';
    // Wants: a row of icons dropping in, with "+ more" at the end (they never stop).
    const wy = 124, ws = P ? 36 : 46, wg = P ? 8 : 12, list = WANTS[v];
    const wx0 = W / 2 - ((list.length - 1) * (ws + wg)) / 2 - 22;
    svg += text(W / 2, wy - (P ? 38 : 42), 'many wants', P ? 21 : 23, 'var(--sim-label-muted)');
    list.forEach(([n, t], i) => { svg += icon(n, wx0 + i * (ws + wg), wy, ws, t, anim('gw-drop', 0.2 + i * 0.18)); });
    svg += `<g${anim('gw-in', 1.4)}>${text(wx0 + list.length * (ws + wg) + 6, wy + 8, '+ more', P ? 18 : 20, 'var(--sim-label-muted)')}</g>`;
    // The hero: one house, or a country of many places.
    const hy = P ? 232 : 236;
    if (v === 'family') {
      svg += icon('house', W / 2, hy, P ? 132 : 150, 1, anim('gw-pop', 0.05));
      svg += text(W / 2, hy + (P ? 86 : 96), 'a family', P ? 24 : 26);
    } else {
      const s = P ? 62 : 70, gx = s + (P ? 18 : 26), gy = s + 6;
      COUNTRY.forEach(([n, t], i) => {
        const c = i % 3, r = Math.floor(i / 3);
        svg += icon(n, W / 2 + (c - 1) * gx, hy - gy / 2 + r * gy - 6, s, t, anim('gw-pop', 0.05 + i * 0.1));
      });
      svg += `<rect x="${f1(W / 2 - 1.5 * gx - 4)}" y="${f1(hy - gy - 6)}" width="${f1(3 * gx + 8)}" height="${f1(2 * gy + 8)}" rx="22" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:9 7')}/>`;
      const ty0 = hy + gy + (P ? 6 : 4);
      svg += `<rect x="${f1(W / 2 - 74)}" y="${f1(ty0 - 17)}" width="148" height="34" rx="17" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
      svg += text(W / 2, ty0 + 8, 'a country', P ? 22 : 23);
    }
    // Limited resources: a few blocks each, in a tray.
    const ty = P ? 374 : 386, res = RES[v], bs = P ? 22 : 26;
    svg += text(W / 2, ty - (P ? 20 : 22), 'limited resources', P ? 21 : 23, 'var(--sim-label-muted)');
    const colW = P ? 116 : 150, x0 = W / 2 - ((res.length - 1) * colW) / 2;
    res.forEach(([name, n], i) => {
      const cx = x0 + i * colW;
      for (let k = 0; k < 3; k++) svg += block(cx - 1.5 * bs - 4 + k * (bs + 4), ty, bs, n, anim('gw-pop', 0.6 + i * 0.15 + k * 0.05));
      svg += text(cx, ty + bs + (P ? 26 : 28), name, P ? 20 : 22);
    });
    const over = `<div class="gw-row" style="top:${P ? 30 : 28}px">`
      + `<button type="button" class="sv-hit gw-btn" data-act="view" data-val="family" aria-pressed="${v === 'family'}">a family</button>`
      + `<button type="button" class="sv-hit gw-btn" data-act="view" data-val="country" aria-pressed="${v === 'country'}">a country</button></div>`;
    svg += `<g${anim('gw-in', 1.2)}>${text(W / 2, P ? 506 : 490, 'so both must plan', P ? 22 : 24, 'var(--sim-accent)')}</g>`;
    if (fr) this.after(1.8, () => { this.fresh = false; });
    return { svg, over: `<div class="${P ? 'gw-p' : 'gw-l'}">${over}</div>` };
  }

  paint(st) {
    return this.stepIndex === 1 ? this.paintScale(st) : this.paintSplit(st);
  }

  testState() { return { step: this.stepIndex, view: this.view }; }
}
