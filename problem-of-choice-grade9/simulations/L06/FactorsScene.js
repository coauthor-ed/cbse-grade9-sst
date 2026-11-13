/**
 * FactorsScene - L06 s00 "How to Produce" (2 beats). SvgScene, controls inside the figure.
 *   b0 factors:  four big factor cards (land: a field; labour: a worker with a hammer; capital: a power sewing
 *                line; technology: a chip with a gear). Under them a mix balance: the left pan holds worker
 *                tokens, the right pan machine tokens; the beam leans to the side the producer depends on.
 *                Switch "labour-intensive" (5 workers, 1 machine) / "capital-intensive" (1 worker, 5 machines):
 *                4 tokens fly across the beam (0.5 s), changing from worker to machine or back, and the beam
 *                tips. Rest: labour-intensive.
 *   b1 examples: two columns. Over the left column a token strip of 3 workers and 1 machine (more workers),
 *                over the right 1 worker and 3 machines (more machines). Farming (a field) and handicrafts
 *                (two clay pots) on the left; steel (a factory) and car making (a car body) on the right. Tap a
 *                picture: it lights, its column strip lights, the rest dim. Four labels.
 * Colours are tokens only: workers series-8, machines series-1. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { farmSpec, farmSvg } from 'simulations/base/kit/SimFarm.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);
const TAU = Math.PI * 2;
const WT = 8;   // worker tone (warm)
const MT = 1;   // machine tone (cool)
const FLY_S = 0.5;

const CSS = `
.fs-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 12px; }
.fs-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.fs-btn:active { transform: translateY(3px); box-shadow: none; }
.fs-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.fs-btn:focus-visible, .fs-pic:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.fs-p .fs-btn { font-size: 17px; padding: 4px 11px; }
.fs-pic { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 14px; }
svg .fs-pop { transform-box: fill-box; transform-origin: center; animation: fs-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes fs-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .fs-move { animation: fs-move ${FLY_S}s ease-in-out both; }
@keyframes fs-move { from { transform: translate(var(--x0), var(--y0)); } }
svg .fs-tilt { animation: fs-tilt ${FLY_S}s ease-in-out both; }
@keyframes fs-tilt { from { transform: rotate(var(--a0)); } }
svg .fs-out { animation: fs-out ${FLY_S}s ease-in both; }
@keyframes fs-out { from { opacity: 1; } to { opacity: 0; } }
svg .fs-in { animation: fs-in ${FLY_S}s ease-out both; }
@keyframes fs-in { from { opacity: 0; } to { opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tone) {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${inner}</g>`;
}

/** A gear outline centred on (cx, cy), outer radius r, n teeth. */
function gearPath(cx, cy, r, n = 8) {
  const ri = r * 0.76, w = TAU / n, pts = [];
  for (let i = 0; i < n; i++) {
    const a0 = i * w - Math.PI / 2;
    for (const [rr, a] of [[ri, a0], [r, a0 + 0.14 * w], [r, a0 + 0.44 * w], [ri, a0 + 0.58 * w]]) pts.push(`${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`);
  }
  return `M${pts.join('L')}Z`;
}
const gear = (cx, cy, r, col) => `<path d="${gearPath(cx, cy, r)}" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2;stroke-linejoin:round`)}/>`
  + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * 0.3)}" ${fill('var(--sim-bg-surface)', `stroke:${shade(col, 60)};stroke-width:2`)}/>`;

/** A round token: a worker (person) or a machine (gear) on a tinted disc. */
function token(kind, cx, cy, r) {
  const t = kind === 'w' ? WT : MT, col = `var(--sim-series-${t})`;
  const disc = `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" ${fill(`color-mix(in oklab, ${col} 20%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2.5`)}/>`;
  return disc + (kind === 'w' ? icon('person', cx, cy + r * 0.04, r * 1.45, t) : gear(cx, cy, r * 0.66, col));
}

/** A chip with pins and a gear on it: technology. */
function chipPic(cx, cy, s) {
  const b = s / 2, col = 'var(--sim-series-5)';
  let g = '';
  for (let i = 0; i < 4; i++) {
    const o = -b * 0.6 + i * b * 0.4;
    g += `<rect x="${f1(cx + o - 4)}" y="${f1(cy - b - 12)}" width="8" height="14" rx="2" ${fill('var(--sim-gold)', `stroke:${shade('var(--sim-gold)')};stroke-width:1.5`)}/>`;
    g += `<rect x="${f1(cx + o - 4)}" y="${f1(cy + b - 2)}" width="8" height="14" rx="2" ${fill('var(--sim-gold)', `stroke:${shade('var(--sim-gold)')};stroke-width:1.5`)}/>`;
    g += `<rect x="${f1(cx - b - 12)}" y="${f1(cy + o - 4)}" width="14" height="8" rx="2" ${fill('var(--sim-gold)', `stroke:${shade('var(--sim-gold)')};stroke-width:1.5`)}/>`;
    g += `<rect x="${f1(cx + b - 2)}" y="${f1(cy + o - 4)}" width="14" height="8" rx="2" ${fill('var(--sim-gold)', `stroke:${shade('var(--sim-gold)')};stroke-width:1.5`)}/>`;
  }
  g += `<rect x="${f1(cx - b)}" y="${f1(cy - b)}" width="${f1(s)}" height="${f1(s)}" rx="10" ${fill(col, `stroke:${shade(col, 55)};stroke-width:2.5`)}/>`;
  return g + gear(cx, cy, b * 0.62, 'var(--sim-accent)');
}

/** A car body, side view, facing right; (cx, gy) ground centre, w long. */
function carPic(cx, gy, w) {
  const u = w / 200, x = (v) => f1(cx + (v - 100) * u), y = (v) => f1(gy - v * u), col = 'var(--sim-series-6)';
  const body = `M${x(4)} ${y(22)} L${x(4)} ${y(46)} Q${x(8)} ${y(56)} ${x(30)} ${y(58)} L${x(56)} ${y(60)} L${x(80)} ${y(88)} Q${x(86)} ${y(94)} ${x(98)} ${y(94)}`
    + ` L${x(140)} ${y(94)} Q${x(150)} ${y(94)} ${x(158)} ${y(86)} L${x(176)} ${y(62)} L${x(190)} ${y(58)} Q${x(198)} ${y(54)} ${x(198)} ${y(42)} L${x(196)} ${y(22)} Z`;
  let g = `<ellipse cx="${f1(cx)}" cy="${f1(gy - 2)}" rx="${f1(98 * u)}" ry="${f1(6 * u)}" ${fill('color-mix(in srgb, var(--sim-label) 14%, transparent)')}/>`;
  g += `<path d="${body}" ${fill(col, `stroke:${shade(col, 58)};stroke-width:3;stroke-linejoin:round`)}/>`;
  g += `<path d="M${x(66)} ${y(62)} L${x(84)} ${y(86)} L${x(116)} ${y(86)} L${x(116)} ${y(62)} Z" ${fill('color-mix(in oklab, var(--sim-water) 40%, var(--sim-bg-surface))', `stroke:${shade(col, 58)};stroke-width:2.5`)}/>`;
  g += `<path d="M${x(124)} ${y(62)} L${x(124)} ${y(86)} L${x(146)} ${y(86)} L${x(164)} ${y(62)} Z" ${fill('color-mix(in oklab, var(--sim-water) 40%, var(--sim-bg-surface))', `stroke:${shade(col, 58)};stroke-width:2.5`)}/>`;
  g += `<path d="M${x(120)} ${y(58)} V${y(26)}" ${stroke(shade(col, 58), 2.5 * u)}/>`;
  g += `<rect x="${x(184)}" y="${y(50)}" width="${f1(12 * u)}" height="${f1(7 * u)}" rx="2" ${fill('var(--sim-gold)')}/>`;
  for (const wx of [46, 156]) {
    g += `<circle cx="${x(wx)}" cy="${y(20)}" r="${f1(20 * u)}" ${fill('var(--sim-stroke)', `stroke:${shade('var(--sim-stroke)', 55)};stroke-width:2.5`)}/>`;
    g += `<circle cx="${x(wx)}" cy="${y(20)}" r="${f1(9 * u)}" ${fill('color-mix(in oklab, var(--sim-waste) 50%, var(--sim-bg-surface))')}/>`;
  }
  return g;
}

/** Card frame with a lip. */
const card = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill(shade('var(--sim-bg-surface)', 82))}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;

const MIX = { labour: { w: 5, m: 1, a: -9 }, capital: { w: 1, m: 5, a: 9 } };

const EXAMPLES = [
  { id: 'farming', col: 0, name: 'farming' },
  { id: 'crafts', col: 0, name: 'handicrafts' },
  { id: 'steel', col: 1, name: 'steel' },
  { id: 'cars', col: 1, name: 'car making' },
];

export class FactorsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Four factors of production: land, labour, capital and technology. A balance shows the mix: labour-intensive has 5 workers and 1 machine and leans to the workers; capital-intensive has 1 worker and 5 machines and leans to the machines. Then two examples on each side: farming and handicrafts use more workers; steel and car making use more machines.';

  async setup() {
    this.mix = 'labour';
    this.from = null;
    this.lit = null;
    this.fresh = true;
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

  css() { return CSS; }

  enter() {
    this.mix = 'labour';
    this.from = null;
    this.lit = null;
    this.fresh = true;
    this.after(1.6, () => { this.fresh = false; });
  }

  act(a, v) {
    if (a === 'mix' && this.stepIndex === 0 && MIX[v] && v !== this.mix) {
      this.from = this.mix;
      this.mix = v;
      this.fresh = false;
      this.repaint();
      this.after(FLY_S + 0.15, () => { this.from = null; this.repaint(); });
      return;
    }
    if (a === 'pic' && this.stepIndex === 1 && EXAMPLES.some((e) => e.id === v)) {
      this.lit = this.lit === v ? null : v;
      this.fresh = false;
      this.repaint();
    }
  }

  stageHeight(st) { return st.portrait ? 600 : 476; }

  // ---- b0 ----
  cards(st) {
    const P = st.portrait, W = st.W, fr = this.fresh;
    const cw = P ? (W - 36) / 2 : (W - 24 - 30) / 4, ch = P ? 128 : 150;
    const pos = (i) => P ? [12 + (i % 2) * (cw + 12), 8 + Math.floor(i / 2) * (ch + 14)] : [12 + i * (cw + 10), 8];
    const names = ['land', 'labour', 'capital', 'technology'];
    let svg = '';
    names.forEach((n, i) => {
      const [x, y] = pos(i), cx = x + cw / 2, py = y + (ch - 30) / 2 + 2;
      let pic = '';
      if (i === 0) {
        const fw = Math.min(cw - 30, 104), fh = P ? 64 : 76;
        const spec = farmSpec({ strips: [{ crop: 'wheat', soil: 'loam' }, { crop: 'barley', soil: 'loam' }, { crop: 'wheat', soil: 'rich' }], orient: 'cols', w: fw, h: fh, gap: 5 });
        pic = farmSvg(spec, { x: cx - fw / 2, y: py - fh / 2 });
      } else if (i === 1) {
        pic = icon('person', cx - 14, py, P ? 74 : 84, WT) + `<g transform="rotate(-28 ${f1(cx + 24)} ${f1(py + 4)})">${icon('hammer', cx + 24, py + 4, P ? 46 : 52, 6)}</g>`;
      } else if (i === 2) {
        pic = civicSvg('sewingLine', cx, py + (P ? 36 : 40), { w: Math.min(cw - 16, 118) });
      } else {
        pic = chipPic(cx, py, P ? 56 : 62);
      }
      svg += `<g${fr ? ` class="fs-pop" style="--d:${f1(i * 0.12)}s"` : ''}>${card(x, y, cw, ch)}${pic}${text(cx, y + ch - 14, n, P ? 21 : 21)}</g>`;
    });
    return svg;
  }

  panAt(mix, g) {
    const a = MIX[mix].a * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return { a: MIX[mix].a, l: [g.cx - g.L * c, g.cy - g.L * s], r: [g.cx + g.L * c, g.cy + g.L * s] };
  }

  slot(i, n, g) {
    const row = Math.floor(i / 3), inRow = Math.min(3, n - row * 3), col = i % 3, d = g.r * 2 + 5;
    return [(col - (inRow - 1) / 2) * d, g.chain - g.r - 3 - row * (g.r * 2 + 3)];
  }

  balance(st) {
    const P = st.portrait, W = st.W;
    const g = P ? { cx: W / 2, cy: 352, L: 124, chain: 52, pw: 124, r: 17, base: 520 } : { cx: W / 2, cy: 236, L: 176, chain: 58, pw: 150, r: 20, base: 404 };
    const now = this.panAt(this.mix, g), was = this.from ? this.panAt(this.from, g) : null;
    const nw = MIX[this.mix], fly = !!was;
    let svg = '';
    // Stand: base and post.
    svg += `<rect x="${f1(g.cx - 70)}" y="${f1(g.base)}" width="140" height="14" rx="7" ${fill('var(--sim-stroke)')}/>`;
    svg += `<path d="M${f1(g.cx - 14)} ${f1(g.base)} L${f1(g.cx - 6)} ${f1(g.cy)} L${f1(g.cx + 6)} ${f1(g.cy)} L${f1(g.cx + 14)} ${f1(g.base)} Z" ${fill('color-mix(in oklab, var(--sim-stroke) 70%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
    // Beam (rotates about the pivot).
    const beam = `<rect x="${f1(-g.L - 8)}" y="-7" width="${f1(2 * g.L + 16)}" height="14" rx="7" ${fill('var(--sim-label-muted)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
    svg += `<g transform="translate(${f1(g.cx)} ${f1(g.cy)})"><g class="${fly ? 'fs-tilt' : ''}" style="transform:rotate(${now.a}deg)${fly ? `;--a0:${was.a}deg` : ''}">${beam}</g>`
      + `<circle r="11" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:3')}/></g>`;
    // Pans.
    const pan = (side) => {
      const [x, y] = now[side], kind = side === 'l' ? 'w' : 'm', n = side === 'l' ? nw.w : nw.m;
      let inner = `<path d="M0 0 L${f1(-g.pw / 2 + 8)} ${f1(g.chain)} M0 0 L${f1(g.pw / 2 - 8)} ${f1(g.chain)}" ${stroke('var(--sim-label-muted)', 2.5)}/>`;
      inner += `<path d="M${f1(-g.pw / 2)} ${f1(g.chain)} H${f1(g.pw / 2)} Q${f1(g.pw / 2 - 10)} ${f1(g.chain + 20)} ${f1(g.pw / 2 - 26)} ${f1(g.chain + 20)} H${f1(-g.pw / 2 + 26)} Q${f1(-g.pw / 2 + 10)} ${f1(g.chain + 20)} ${f1(-g.pw / 2)} ${f1(g.chain)} Z" ${fill(`color-mix(in oklab, var(--sim-series-${kind === 'w' ? WT : MT}) 26%, var(--sim-bg-surface))`, `stroke:var(--sim-series-${kind === 'w' ? WT : MT});stroke-width:2.5`)}/>`;
      inner += `<circle r="5" ${fill('var(--sim-stroke)')}/>`;
      // While tokens fly, the arriving ones are the flyers: draw only the token that stays (index 0).
      const shown = fly ? 1 : n;
      for (let i = 0; i < shown; i++) { const [tx, ty] = this.slot(i, n, g); inner += token(kind, tx, ty, g.r); }
      const old = was ? was[side] : null;
      return `<g class="${fly ? 'fs-move' : ''}" style="transform:translate(${f1(x)}px,${f1(y)}px)${fly ? `;--x0:${f1(old[0])}px;--y0:${f1(old[1])}px` : ''}">${inner}</g>`;
    };
    svg += pan('l') + pan('r');
    // Flyers: tokens 1..4 cross from one pan to the other, changing kind on the way.
    if (fly) {
      const toM = this.mix === 'capital', fromSide = toM ? 'l' : 'r', toSide = toM ? 'r' : 'l';
      for (let i = 1; i < 5; i++) {
        const [ax, ay] = this.slot(i, 5, g), s0 = was[fromSide], s1 = now[toSide];
        const x0 = s0[0] + ax, y0 = s0[1] + ay, x1 = s1[0] + ax, y1 = s1[1] + ay;
        svg += `<g class="fs-move" style="transform:translate(${f1(x1)}px,${f1(y1)}px);--x0:${f1(x0)}px;--y0:${f1(y0)}px">`
          + `<g class="fs-out">${token(toM ? 'w' : 'm', 0, 0, g.r)}</g><g class="fs-in">${token(toM ? 'm' : 'w', 0, 0, g.r)}</g></g>`;
      }
    }
    // Counts under the pans.
    const ly = g.base - 2;
    svg += text(g.cx - g.L - (P ? 0 : 6), ly, `${nw.w} ${nw.w === 1 ? 'worker' : 'workers'}`, P ? 20 : 22, `var(--sim-series-${WT}-ink, var(--sim-label))`);
    svg += text(g.cx + g.L + (P ? 0 : 6), ly, `${nw.m} ${nw.m === 1 ? 'machine' : 'machines'}`, P ? 20 : 22, `var(--sim-series-${MT}-ink, var(--sim-label))`);
    return { svg, by: g.base };
  }

  paintFactors(st) {
    const P = st.portrait;
    const b = this.balance(st);
    const svg = this.cards(st) + b.svg;
    const y = P ? 572 : 450, m = this.mix;
    const over = `<div class="${P ? 'fs-p' : 'fs-l'}"><div class="fs-row" style="top:${y}px">`
      + `<button type="button" class="sv-hit fs-btn" data-act="mix" data-val="labour" aria-pressed="${m === 'labour'}">labour-intensive</button>`
      + `<button type="button" class="sv-hit fs-btn" data-act="mix" data-val="capital" aria-pressed="${m === 'capital'}">capital-intensive</button></div></div>`;
    return { svg, over };
  }

  // ---- b1 ----
  examplePic(id, cx, gy, w, h) {
    if (id === 'farming') {
      const fw = w * 0.92, fh = h * 0.7;
      const spec = farmSpec({ strips: [{ crop: 'wheat', soil: 'loam' }, { crop: 'rice', soil: 'wet' }, { crop: 'wheat', soil: 'rich' }, { crop: 'pulse', soil: 'loam' }], orient: 'cols', w: fw, h: fh, gap: 6 });
      return farmSvg(spec, { x: cx - fw / 2, y: gy - fh - 6 });
    }
    if (id === 'crafts') {
      return `<ellipse cx="${f1(cx)}" cy="${f1(gy - 4)}" rx="${f1(w * 0.42)}" ry="8" ${fill('color-mix(in srgb, var(--sim-label) 12%, transparent)')}/>`
        + icon('pot', cx - w * 0.17, gy - h * 0.4, h * 0.82, 8) + icon('pot', cx + w * 0.22, gy - h * 0.27, h * 0.56, 2);
    }
    if (id === 'steel') return civicSvg('factory', cx, gy, { h: h * 0.92 });
    return carPic(cx, gy, Math.min(w * 0.94, h * 1.9));
  }

  strip(cx, y, col, r, on) {
    const kinds = col === 0 ? ['w', 'w', 'w', 'm'] : ['w', 'm', 'm', 'm'], d = r * 2 + 6;
    return `<g style="opacity:${on ? 1 : 0.3}">` + kinds.map((k, i) => token(k, cx + (i - 1.5) * d, y, r)).join('') + '</g>';
  }

  paintExamples(st) {
    const P = st.portrait, W = st.W, fr = this.fresh, lit = this.lit;
    const litCol = lit ? EXAMPLES.find((e) => e.id === lit).col : null;
    const cxs = P ? [W * 0.26, W * 0.74] : [W * 0.26, W * 0.74], pw = P ? 172 : 236, ph = P ? 150 : 128;
    const rows = P ? [92, 330] : [70, 262];
    let svg = '', over = '';
    // A soft divider between the two sides.
    svg += `<path d="M${f1(W / 2)} 20 V${f1(P ? 560 : 452)}" ${stroke('var(--sim-stroke)', 2, 'stroke-dasharray:6 8;opacity:0.6')}/>`;
    [0, 1].forEach((col) => { svg += this.strip(cxs[col], 32, col, P ? 17 : 19, litCol == null || litCol === col); });
    EXAMPLES.forEach((e, i) => {
      const cx = cxs[e.col], y = rows[i % 2], on = !lit || lit === e.id;
      let g = `<rect x="${f1(cx - pw / 2)}" y="${f1(y)}" width="${f1(pw)}" height="${f1(ph + 52)}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${lit === e.id ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${lit === e.id ? 4 : 2.5}`)}/>`;
      g += this.examplePic(e.id, cx, y + ph + 2, pw - 20, ph - 18);
      g += text(cx, y + ph + 36, e.name, P ? 22 : 23);
      svg += `<g style="opacity:${on ? 1 : 0.3}"><g${fr ? ` class="fs-pop" style="--d:${f1(0.15 + i * 0.15)}s"` : ''}>${g}</g></g>`;
      over += `<button type="button" class="fs-pic sv-hit" data-act="pic" data-val="${e.id}" aria-pressed="${lit === e.id}" aria-label="${e.name}: ${e.col ? 'more machines' : 'more workers'}" style="left:${f1(cx - pw / 2)}px;top:${f1(y)}px;width:${f1(pw)}px;height:${f1(ph + 52)}px"></button>`;
    });
    return { svg, over: `<div class="${P ? 'fs-p' : 'fs-l'}">${over}</div>` };
  }

  paint(st) { return this.stepIndex === 1 ? this.paintExamples(st) : this.paintFactors(st); }

  testState() { return { step: this.stepIndex, mix: this.mix, lit: this.lit }; }
}
