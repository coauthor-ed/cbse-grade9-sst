/**
 * MixBinsScene - L08 s02 "Most Economies Mix" (2 beats). SvgScene; portrait has its own layout.
 *   b0 mixed: who makes economic choices, on one street. Three switches inside the figure:
 *     planned - only the government's planning office acts: a plan sheet goes to the factory, the shop is dim;
 *     market  - only private firms and shops act: the government building is small, a referee with rules only;
 *     mixed   - both act on the same street: the government sends a rule sheet to a private shop AND runs its own
 *               public sector company (the factory, tagged), the private shop sells beside it.
 *     One status line per switch. On entry mixed is built in 0.5 s steps. Rest: mixed.
 *   b1 even: the book's names as chips in bins. The mixed bin is the hero (biggest, centre): India (after 1991),
 *     China (after 1978), Germany, Sweden drop in (0.5 s each). Beside it the market bin holds the United States of
 *     America and Singapore, each with a small government badge and one tag "government involved too". The planned
 *     bin stays dim and empty (this sentence names none). Rest: all chips in.
 * No flags, maps, leaders, scores or positions on a bar: only the book's names in the book's groups.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);
const GT = 1;   // government tone
const PT = 6;   // private tone

const SYS = [
  { id: 'planned', say: 'Pure planned economy: rare' },
  { id: 'mixed', say: 'Mixed economy: most countries' },
  { id: 'market', say: 'Pure market economy: rare' },
];
const MIXED = [['India', '(after 1991)'], ['China', '(after 1978)'], ['Germany'], ['Sweden']];
const MARKET = [['United States', 'of America'], ['Singapore']];

const CSS = `
.mb-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 10px; }
.mb-btn { min-height: 44px; min-width: 104px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mb-btn:active { transform: translateY(3px); box-shadow: none; }
.mb-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.mb-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.mb-p .mb-btn { font-size: 17px; min-width: 96px; padding: 4px 10px; }
.mb-say { position: absolute; left: 10px; right: 10px; transform: translateY(-50%); text-align: center; font: 800 22px/1.25 var(--sim-font); color: var(--sim-label); }
.mb-p .mb-say { font-size: 19px; }
svg .mb-drop { animation: mb-drop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes mb-drop { 0% { transform: translateY(-40px); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .mb-fade { animation: mb-fade 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes mb-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .mb-line { stroke-dasharray: 9 8; animation: mb-march 0.9s linear 4, mb-fade 0.5s ease both; animation-delay: 0s, var(--d, 0s); }
@keyframes mb-march { to { stroke-dashoffset: -17; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tn) {
  const inner = (iconSvg(name, tn).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tn})">${inner}</g>`;
}

/** A tag: a rounded pill in a tone with text, centred on (x, y). */
function tag(x, y, t, tn, size = 18) {
  const w = t.length * size * 0.56 + 24, h = size + 14;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${h}" rx="${h / 2}" ${fill(`color-mix(in oklab, var(--sim-series-${tn}) 20%, var(--sim-bg-surface))`, `stroke:var(--sim-series-${tn});stroke-width:2.5`)}/>`
    + text(x, y + size * 0.36, t, size);
}

/** A curved arrow from (x0, y0) to (x1, y1), bulging up by b. */
function arc(x0, y0, x1, y1, b, col, cls, d) {
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - b;
  const ang = Math.atan2(y1 - my, x1 - mx), ah = 13;
  const p1 = [x1 - ah * Math.cos(ang - 0.5), y1 - ah * Math.sin(ang - 0.5)], p2 = [x1 - ah * Math.cos(ang + 0.5), y1 - ah * Math.sin(ang + 0.5)];
  return `<g class="${cls}" style="--d:${f1(d)}s"><path class="mb-line" style="--d:${f1(d)}s;fill:none;stroke:${col};stroke-width:4;stroke-linecap:round" d="M${f1(x0)} ${f1(y0)}Q${f1(mx)} ${f1(my)} ${f1(x1)} ${f1(y1)}"/>`
    + `<path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(x1)} ${f1(y1)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke(col, 4)}/></g>`;
}

/** The middle of the arc() curve, (x, y). */
const apex = (x0, y0, x1, y1, b) => { const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - b; return [(x0 + 2 * mx + x1) / 4, (y0 + 2 * my + y1) / 4]; };

/** A sheet of paper (the plan or the rules), centred on (x, y). */
function sheet(x, y, w, tn) {
  const h = w * 1.25;
  let s = `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="4" ${fill('var(--sim-bg-surface)', `stroke:var(--sim-series-${tn});stroke-width:3`)}/>`;
  for (let i = 0; i < 4; i++) s += `<rect x="${f1(x - w * 0.32)}" y="${f1(y - h * 0.3 + i * h * 0.17)}" width="${f1(w * (i === 3 ? 0.4 : 0.64))}" height="3.5" rx="1.7" ${fill(`var(--sim-series-${tn})`)}/>`;
  return s;
}

export class MixBinsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 508;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Step 1: one street. The government building, a factory and a private shop. Buttons switch the system. Planned: only the government plans, a plan sheet goes to the factory and the shop is dim. Market: only private firms and shops act; the government only makes rules. Mixed: both act; the government sends rules to the private shop and runs its own public sector factory. Pure planned and pure market are rare; most economies are mixed. Step 2: three bins. The mixed bin holds India after 1991, China after 1978, Germany and Sweden. The market bin holds the United States of America and Singapore, each with government involved too.';

  async setup() {
    this.sys = 'mixed';
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'sys' && SYS.some((s) => s.id === b.dataset.val)) {
        this.sys = b.dataset.val; this.fresh = true; this.repaint();
        this.after(1.8, () => { this.fresh = false; });
      }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() {
    this.sys = 'mixed';
    this.fresh = true;
    this.after(2.6, () => { this.fresh = false; });
  }

  stageHeight(st) { return st.portrait ? 600 : 484; }

  anim(cls, d) { return this.fresh ? ` class="${cls}" style="--d:${f1(d)}s"` : ''; }

  /** The street for the current system. L: { gx, fx, sx, g (ground y), gw, fw, sw } */
  street(L) {
    const s = this.sys, g = L.g;
    let svg = '';
    const govW = s === 'market' ? L.gw * 0.55 : L.gw;
    const shopDim = s === 'planned';
    // ground line
    svg += `<rect x="0" y="${g}" width="${L.W}" height="5" rx="2" ${fill('color-mix(in srgb, var(--sim-label) 22%, transparent)')}/>`;
    // the government building
    svg += `<g${this.anim('mb-drop', 0)}>${civicSvg('planOffice', L.gx, g, { w: govW })}</g>`;
    svg += `<g${this.anim('mb-fade', 0.25)}>${tag(L.gx, g + 28, 'government', GT, L.ts)}</g>`;
    if (s === 'market') svg += `<g${this.anim('mb-fade', 0.4)}>${icon('scales', L.gx, g - govW * 0.73 - 26, 46, GT)}</g>`;
    // the factory
    const fTag = s === 'market' ? ['private firm', PT] : s === 'planned' ? ['government-run', GT] : ['public sector', GT];
    svg += `<g${this.anim('mb-drop', 0.5)}>${civicSvg('factory', L.fx, g, { w: L.fw })}</g>`;
    svg += `<g${this.anim('mb-fade', 0.75)}>${tag(L.fx, g + 28, fTag[0], fTag[1], L.ts)}</g>`;
    // the private shop
    svg += `<g${this.anim('mb-drop', 1.0)}${shopDim ? ' opacity="0.28"' : ''}>${civicSvg('shop', L.sx, g, { w: L.sw })}</g>`;
    if (!shopDim) svg += `<g${this.anim('mb-fade', 1.25)}>${tag(L.sx, g + 28, 'private shop', PT, L.ts)}</g>`;
    // who acts: arrows from the government
    const top = g - L.gw * 0.73 - 10;
    const col = `var(--sim-series-${GT})`, fc = this.fresh ? 'mb-fade' : '';
    const fTop = g - L.fw * 0.69 - 8, sTop = g - L.sw * 0.875 - 8;
    if (s === 'planned') {
      const a = [L.gx + 30, top, L.fx, fTop, L.bulge], [ax, ay] = apex(...a);
      svg += arc(...a, col, fc, 1.4);
      svg += `<g${this.anim('mb-drop', 1.7)}>${sheet(ax, ay - 34, 34, GT)}${text(ax + 26, ay - 26, 'plan', L.ts, col, 'start')}</g>`;
    } else if (s === 'mixed') {
      const a = [L.gx + 30, top, L.fx - 10, fTop, L.bulge * 0.5], [ax, ay] = apex(...a);
      svg += arc(...a, col, fc, 1.4);
      svg += `<g${this.anim('mb-fade', 1.6)}>${text(ax - 22, ay + 28, 'runs', L.ts, col)}</g>`;
      const b = [L.gx + 40, top - 6, L.sx, sTop, L.bulge * 1.5], [bx, by] = apex(...b);
      svg += arc(...b, col, fc, 1.8);
      svg += `<g${this.anim('mb-drop', 2.0)}>${sheet(bx, by - 30, 30, GT)}${text(bx + 24, by - 23, 'rules', L.ts, col, 'start')}</g>`;
    } else {
      // market: the government (small, a referee) only makes rules
      const b = [L.gx + 20, top + L.gw * 0.3, L.sx, sTop, L.bulge * 1.1], [bx, by] = apex(...b);
      svg += arc(...b, col, fc, 1.3);
      svg += `<g${this.anim('mb-fade', 1.5)}>${text(bx, by - 16, 'rules only', L.ts, col)}</g>`;
    }
    return svg;
  }

  bin(x, y, w, h, title, dim, tn) {
    const op = dim ? ' opacity="0.3"' : '';
    return `<g${op}><path d="M${f1(x)} ${f1(y)}V${f1(y + h - 18)}Q${f1(x)} ${f1(y + h)} ${f1(x + 18)} ${f1(y + h)}H${f1(x + w - 18)}Q${f1(x + w)} ${f1(y + h)} ${f1(x + w)} ${f1(y + h - 18)}V${f1(y)}" ${fill(`color-mix(in oklab, var(--sim-series-${tn}) 10%, var(--sim-bg-surface))`, `stroke:var(--sim-series-${tn});stroke-width:4;stroke-linejoin:round`)}/>`
      + `<rect x="${f1(x - 8)}" y="${f1(y - 4)}" width="${f1(w + 16)}" height="9" rx="4.5" ${fill(`var(--sim-series-${tn})`)}/></g>`;
  }

  /** A name chip: lines of text in a white pill, centred on (x, y). */
  name(x, y, lines, w, size, cls) {
    const lh = size + 4, h = lines.length * lh + 14;
    let s = `<g${cls}><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="12" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    lines.forEach((t, i) => { s += text(x, y - (lines.length - 1) * lh / 2 + i * lh + size * 0.36, t, i ? size - 2 : size, i ? 'var(--sim-label-muted)' : 'var(--sim-label)'); });
    return s + '</g>';
  }

  paintBins(st) {
    const P = st.portrait, W = st.W;
    let svg = '', over = '';
    if (!P) {
      // planned (dim, small) | mixed (hero) | market
      const mx = 120, mw = W - 120 - 178, kx = W - 166, kw = 156, mc = mx + mw / 2, kc = kx + kw / 2;
      svg += this.bin(18, 96, 84, 250, '', true, GT);
      svg += text(60, 76, 'planned', 18, 'var(--sim-label-muted)');
      svg += this.bin(mx, 96, mw, 330, '', false, 3);
      svg += text(mc, 72, 'mixed', 30);
      MIXED.forEach((n, i) => { svg += this.name(mc, 140 + i * 74, n, mw - 32, 21, this.anim('mb-drop', 0.3 + i * 0.5)); });
      svg += this.bin(kx, 96, kw, 250, '', false, PT);
      svg += text(kc, 76, 'market', 22);
      MARKET.forEach((n, i) => {
        const y = i ? 246 : 156, d = 2.4 + i * 0.5, h = n.length * 22 + 14;
        svg += this.name(kc, y, n, kw - 18, 18, this.anim('mb-drop', d));
        svg += `<g${this.anim('mb-fade', d + 0.3)}>${icon('building', kc + kw / 2 - 26, y - h / 2 - 8, 30, GT)}</g>`;
      });
      svg += `<g${this.anim('mb-fade', 3.6)}>${text(kc, 380, 'government', 18, `var(--sim-series-${GT})`)}${text(kc, 402, 'involved too', 18, `var(--sim-series-${GT})`)}</g>`;
      over += `<div class="mb-say" style="top:462px">Almost all economies are mixed.</div>`;
      return { svg, over: `<div class="mb-l">${over}</div>` };
    }
    // portrait: mixed bin on top (2 x 2), market bin below, planned as a dim strip
    svg += text(W / 2, 30, 'mixed', 26);
    svg += this.bin(14, 46, W - 28, 214, '', false, 3);
    MIXED.forEach((n, i) => {
      const cx = i % 2 ? W * 0.75 : W * 0.25, cy = 106 + Math.floor(i / 2) * 92;
      svg += this.name(cx, cy, n, W / 2 - 26, 20, this.anim('mb-drop', 0.3 + i * 0.5));
    });
    svg += text(W / 2, 300, 'market', 21);
    svg += this.bin(14, 314, W - 28, 176, '', false, PT);
    MARKET.forEach((n, i) => {
      const cx = i ? W * 0.74 : W * 0.28, cy = 366, d = 2.4 + i * 0.5;
      svg += this.name(cx, cy, n, i ? 140 : 164, 17, this.anim('mb-drop', d));
      svg += `<g${this.anim('mb-fade', d + 0.3)}>${icon('building', cx + (i ? 62 : 74), cy - 34, 30, GT)}</g>`;
    });
    svg += `<g${this.anim('mb-fade', 3.6)}>${text(W / 2, 452, 'government involved too', 17, `var(--sim-series-${GT})`)}</g>`;
    svg += `<g opacity="0.3">${text(W / 2, 530, 'planned', 16, 'var(--sim-label-muted)')}<rect x="${f1(W / 2 - 60)}" y="540" width="120" height="8" rx="4" ${fill(`var(--sim-series-${GT})`)}/></g>`;
    over += `<div class="mb-say" style="top:580px">Almost all economies are mixed.</div>`;
    return { svg, over: `<div class="mb-p">${over}</div>` };
  }

  paint(st) {
    if (this.stepIndex === 1) return this.paintBins(st);
    const P = st.portrait, W = st.W, s = SYS.find((x) => x.id === this.sys);
    const btns = SYS.map((x) => `<button type="button" class="sv-hit mb-btn" data-act="sys" data-val="${x.id}" aria-pressed="${x.id === this.sys}">${x.id}</button>`).join('');
    if (!P) {
      const L = { W, g: 300, gx: W * 0.17, fx: W * 0.5, sx: W * 0.84, gw: 172, fw: 170, sw: 148, bulge: 70, ts: 18 };
      const svg = this.street(L);
      const over = `<div class="mb-say" style="top:386px">${s.say}</div><div class="mb-row" style="top:450px">${btns}</div>`;
      return { svg, over: `<div class="mb-l">${over}</div>` };
    }
    // portrait: the government building on top, the factory and the shop on the street below
    const L = { W, g: 400, gx: 92, fx: 112, sx: 290, gw: 150, fw: 180, sw: 150, bulge: 70, ts: 16 };
    let svg = '';
    const st2 = this.sys, govW = st2 === 'market' ? 90 : 150;
    svg += `<rect x="${f1(W * 0.2)}" y="190" width="${f1(W * 0.6)}" height="4" rx="2" ${fill('color-mix(in srgb, var(--sim-label) 14%, transparent)')}/>`;
    svg += `<g${this.anim('mb-drop', 0)}>${civicSvg('planOffice', W / 2, 190, { w: govW })}</g>`;
    svg += `<g${this.anim('mb-fade', 0.25)}>${tag(W / 2, 216, 'government', GT, 16)}</g>`;
    if (st2 === 'market') svg += `<g${this.anim('mb-fade', 0.4)}>${icon('scales', W / 2 + 76, 150, 44, GT)}</g>`;
    svg += this.streetPortrait(L, govW);
    const over = `<div class="mb-say" style="top:494px">${s.say}</div><div class="mb-row" style="top:562px">${btns}</div>`;
    return { svg, over: `<div class="mb-p">${over}</div> ` };
  }

  /** Portrait street: factory and shop on the ground at L.g; arrows come down from the building above. */
  streetPortrait(L, govW) {
    const s = this.sys, g = L.g, W = L.W;
    let svg = `<rect x="0" y="${g}" width="${W}" height="5" rx="2" ${fill('color-mix(in srgb, var(--sim-label) 22%, transparent)')}/>`;
    const fx = W * 0.27, sx = W * 0.77, fw = 160, sw = 132;
    const fTag = s === 'market' ? ['private firm', PT] : s === 'planned' ? ['government-run', GT] : ['public sector', GT];
    svg += `<g${this.anim('mb-drop', 0.5)}>${civicSvg('factory', fx, g, { w: fw })}</g>`;
    svg += `<g${this.anim('mb-fade', 0.75)}>${tag(fx, g + 26, fTag[0], fTag[1], 16)}</g>`;
    const shopDim = s === 'planned';
    svg += `<g${this.anim('mb-drop', 1.0)}${shopDim ? ' opacity="0.28"' : ''}>${civicSvg('shop', sx, g, { w: sw })}</g>`;
    if (!shopDim) svg += `<g${this.anim('mb-fade', 1.25)}>${tag(sx, g + 26, 'private shop', PT, 16)}</g>`;
    const col = `var(--sim-series-${GT})`, fd = this.fresh ? 'mb-fade' : '';
    const down = (x0, y0, x1, y1, d) => {
      return `<g class="${fd}" style="--d:${f1(d)}s"><path class="mb-line" style="--d:${f1(d)}s;fill:none;stroke:${col};stroke-width:4;stroke-linecap:round" d="M${f1(x0)} ${f1(y0)}C${f1(x0)} ${f1((y0 + y1) / 2)} ${f1(x1)} ${f1((y0 + y1) / 2)} ${f1(x1)} ${f1(y1)}"/>`
        + `<path d="M${f1(x1 - 9)} ${f1(y1 - 11)}L${f1(x1)} ${f1(y1)}L${f1(x1 + 9)} ${f1(y1 - 11)}" ${stroke(col, 4)}/></g>`;
    };
    const ftop = g - fw * 0.69 - 6, stop = g - sw * 0.875 - 6;
    const c0 = W / 2;
    if (s === 'planned') {
      svg += down(c0 - 40, 236, fx, ftop, 1.4);
      svg += `<g${this.anim('mb-drop', 1.7)}>${sheet(c0 + 10, 262, 30, GT)}${text(c0 + 32, 270, 'plan', 16, col, 'start')}</g>`;
    } else if (s === 'mixed') {
      svg += down(c0 - 40, 236, fx, ftop, 1.4);
      svg += `<g${this.anim('mb-fade', 1.6)}>${text(fx - 28, 266, 'runs', 16, col, 'end')}</g>`;
      svg += down(c0 + 40, 236, sx, stop, 1.8);
      svg += `<g${this.anim('mb-drop', 2.0)}>${sheet(sx + 54, 232, 28, GT)}${text(sx + 34, 240, 'rules', 16, col, 'end')}</g>`;
    } else {
      svg += down(c0 + 30, 236, sx, stop, 1.3);
      svg += `<g${this.anim('mb-fade', 1.5)}>${text(c0 - 20, 270, 'rules only', 16, col, 'end')}</g>`;
    }
    return svg;
  }

  testState() { return { step: this.stepIndex, sys: this.sys }; }
}
