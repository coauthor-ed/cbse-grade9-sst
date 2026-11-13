/**
 * FixedVariableBarsScene - L05 s03 "Fixed costs", "Variable costs", "Both kinds together" (3 beats). SvgScene,
 * design 560 x 480 landscape, 390 x 600 portrait. Cast: StallKit (breadLoaf, sugarBag), MoneyKit (rs). Drawn here
 * (no kit prop): an oven, a mixer and a cake box (as in L03 StartupCostsScene / L04 FinanceAccountsScene), a fridge.
 * Fixed cost = series 5 + the word 'fixed'; variable cost = series 8 + the word 'variable' (never colour alone).
 *   b0 Fixed costs: oven, mixer, fridge under 'equipment: fixed cost'; two months side by side, 100 loaves and
 *      2,000 loaves (a loaf against a heap); the rent bar is 40,000 in both, the same height ('=' between).
 *   b1 Variable costs: a pile for 1,000 loaves (a flour sack, a sugar sack, a stack of packets) and for 2,000
 *      loaves the same pile twice ('x 2'): twice the flour, twice the packets. No amounts (the text gives none).
 *   b2 Both kinds together: a slider for loaves, 0 to 2,000 in steps of 100 (rest / cold start 1,000). Two bars:
 *      'variable' = 20 x loaves, and 'total' = rent 40,000 (fixed, flat) + the variable part. Readout: loaves,
 *      'Rs 20 a loaf (made-up)', variable + rent = total. 1,000 -> 20,000 + 40,000 = 60,000; 2,000 -> 40,000 +
 *      40,000 = 80,000. Moving the slider changes the bars in place (the slider is never re-made mid-drag).
 * No host controls. Colours are tokens only. ASCII only (the rupee sign comes from MoneyKit's rs()).
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, rs, group } from '../shared/MoneyKit.js';
import { STALL_CSS, breadLoaf, sugarBag } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const FIXED = 'var(--sim-series-5)', VARC = 'var(--sim-series-8)';
const RENT = 40000, PER = 20, MAXL = 2000, PX = 3.5 / 1000;

const CSS = `
.fv-ab { position: absolute; }
.fv-range { -webkit-appearance: none; appearance: none; height: 44px; margin: 0; background: transparent; cursor: pointer; touch-action: none; }
.fv-range::-webkit-slider-runnable-track { height: 12px; border-radius: 6px; background: color-mix(in oklab, ${VARC} 30%, var(--sim-bg-surface)); border: 2px solid ${shade(VARC, 62)}; }
.fv-range::-moz-range-track { height: 10px; border-radius: 6px; background: color-mix(in oklab, ${VARC} 30%, var(--sim-bg-surface)); border: 2px solid ${shade(VARC, 62)}; }
.fv-range::-webkit-slider-thumb { -webkit-appearance: none; width: 34px; height: 34px; margin-top: -13px; border-radius: 50%; background: var(--sim-bg-surface); border: 4px solid ${shade(VARC, 62)}; box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 ${shade(VARC, 62)}; }
.fv-range::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: var(--sim-bg-surface); border: 4px solid ${shade(VARC, 62)}; }
.fv-range:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .fv-pop { transform-box: fill-box; transform-origin: center bottom; animation: fv-pop 0.5s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes fv-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .fv-grow { transform-box: fill-box; transform-origin: bottom; animation: fv-grow 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes fv-grow { 0% { transform: scaleY(0); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .fv-pop, svg .fv-grow { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800, k = '') =>
  `<text${k ? ` data-k="${k}"` : ''} x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '', k = '') => `<rect${k ? ` data-k="${k}"` : ''} x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const tint = (col, pct) => `color-mix(in oklab, ${col} ${pct}%, var(--sim-bg-surface))`;

function oven(x, y, w) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, body = 'color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))', rim = shade(body, 60);
  const glow = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))';
  let s = rect(x0, top + 4, w, h, 8, rim) + rect(x0, top, w, h, 8, body, `stroke:${rim};stroke-width:2.5`) + `<path d="M${f1(x0)} ${f1(top + h * 0.22)}H${f1(x0 + w)}" ${stroke(rim, 2.5)}/>`;
  for (const k of [0.2, 0.36]) s += `<circle cx="${f1(x0 + w * k)}" cy="${f1(top + h * 0.11)}" r="${f1(w * 0.05)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:2`)}/>`;
  s += rect(x0 + w * 0.12, top + h * 0.32, w * 0.76, h * 0.56, 6, glow, `stroke:${rim};stroke-width:2.5`);
  s += `<path d="M${f1(x0 + w * 0.22)} ${f1(top + h * 0.3)}H${f1(x0 + w * 0.78)}" ${stroke(rim, 5, 'stroke-linecap:round')}/>`;
  return s;
}

function mixer(x, y, h) {
  const body = 'color-mix(in oklab, var(--sim-series-4) 45%, var(--sim-bg-surface))', rim = shade(body, 60), bowl = 'color-mix(in oklab, var(--sim-label-muted) 25%, var(--sim-bg-surface))';
  const w = h * 0.8;
  return rect(x - w / 2, y - h * 0.12, w, h * 0.12, 4, body, `stroke:${rim};stroke-width:2`)
    + rect(x - w / 2 + 3, y - h, w * 0.24, h * 0.9, 4, body, `stroke:${rim};stroke-width:2`)
    + rect(x - w / 2 + 3, y - h, w * 0.92, h * 0.26, h * 0.12, body, `stroke:${rim};stroke-width:2`)
    + `<path d="M${f1(x - w * 0.12)} ${f1(y - h * 0.5)}h${f1(w * 0.62)}l-${f1(w * 0.08)} ${f1(h * 0.36)}h-${f1(w * 0.46)}Z" ${fill(bowl, `stroke:${shade(bowl, 60)};stroke-width:2;stroke-linejoin:round`)}/>`;
}

/** A tall fridge with two doors (drawn here); (x, y) bottom centre. */
function fridge(x, y, h) {
  const w = h * 0.56, x0 = x - w / 2, top = y - h, body = 'color-mix(in oklab, var(--sim-series-7) 14%, var(--sim-bg-surface))', rim = 'var(--sim-stroke)';
  return rect(x0, top + 4, w, h, 8, rim) + rect(x0, top, w, h, 8, body, `stroke:${rim};stroke-width:2.5`)
    + `<path d="M${f1(x0)} ${f1(top + h * 0.36)}H${f1(x0 + w)}" ${stroke(rim, 2.5)}/>`
    + rect(x0 + w * 0.78, top + h * 0.12, 5, h * 0.16, 2.5, rim) + rect(x0 + w * 0.78, top + h * 0.46, 5, h * 0.22, 2.5, rim);
}

function cakeBox(x, y, w) {
  const h = w * 0.62, x0 = x - w / 2, top = y - h, rib = 'var(--sim-series-6)', rim = 'var(--sim-stroke)';
  return rect(x0, top + 3, w, h, 5, rim) + rect(x0, top, w, h, 5, 'var(--sim-bg-surface)', `stroke:${rim};stroke-width:2`)
    + rect(x0 - 3, top - 3, w + 6, h * 0.26, 4, 'color-mix(in oklab, var(--sim-series-6) 18%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2`)
    + rect(x - w * 0.06, top - 3, w * 0.12, h + 3, 0, rib);
}

/** The ingredients and packets for 1,000 loaves: flour sack, sugar sack, a stack of two packets; (x, y) ground middle. */
function pile(x, y, s = 1) {
  return sugarBag(x - 66 * s, y, 74 * s, { label: 'flour' }) + sugarBag(x, y, 74 * s, { label: 'sugar' })
    + cakeBox(x + 64 * s, y, 52 * s) + cakeBox(x + 64 * s, y - 34 * s, 52 * s);
}

/** A heap of n loaves (rows narrowing upwards); (x, y) ground middle, loaf width w. */
function loaves(x, y, n, w) {
  let s = '', row = 0, left = n;
  const base = Math.ceil((Math.sqrt(8 * n + 1) - 1) / 2);
  for (let b = base; b > 0 && left > 0; b--, row++) {
    const k = Math.min(b, left);
    for (let i = 0; i < k; i++) s += breadLoaf(x + (i - (k - 1) / 2) * w * 0.95, y - row * w * 0.4, w);
    left -= k;
  }
  return s;
}

export class FixedVariableBarsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Fixed costs stay the same: ABC Bakery pays rent of 40,000 rupees a month whether it bakes 100 loaves or 2,000; ovens, mixers and fridges are fixed costs too. Variable costs go up with baking: twice the loaves needs twice the flour, sugar and packets. With a made-up 20 rupees a loaf, 1,000 loaves cost 20,000 plus rent 40,000, total 60,000; 2,000 loaves cost 40,000 plus 40,000, total 80,000. A slider sets the loaves.';

  async setup() {
    this.loaves = 1000;
    await super.setup();
    this._onInput = (e) => {
      const r = e.target?.closest?.('.fv-range');
      if (!r || this.stepIndex !== 2) return;
      this.loaves = Math.max(0, Math.min(MAXL, Math.round(+r.value / 100) * 100));
      this.update();
    };
    this.root.addEventListener('input', this._onInput);
  }

  destroy() {
    this.root?.removeEventListener('input', this._onInput);
    super.destroy();
  }

  css() { return MONEY_CSS + STALL_CSS + CSS; }

  enter() { this.loaves = 1000; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    this.P = P;
    const out = v === 0 ? this.paintFixed(P) : v === 1 ? this.paintVariable(P) : this.paintBoth(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  heading(P, t, sub, col) {
    return text(20, 40, t, 30, shade(col, 72), 'start') + (sub ? text(20, 74, sub, 21, 'var(--sim-label-muted)', 'start', 700) : '');
  }

  // b0: rent is the same for 100 and 2,000 loaves; equipment is fixed too.
  paintFixed(P) {
    const G = P
      ? { eq: [[80, 196], [195, 196], [310, 196]], eqLab: 222, br: [116, 252, 452], base: 452, cols: [110, 280], bw: 104, lab: 484, pile: 566, eqSize: 1 }
      : { eq: [[318, 154], [414, 154], [506, 154]], eqLab: 180, br: [272, 540, 212], base: 400, cols: [140, 390], bw: 110, lab: 428, pile: null, eqSize: 0.9 };
    let svg = this.heading(P, 'fixed cost', 'stays the same', FIXED);
    // equipment
    const s = G.eqSize;
    const eq = [[oven, 84 * s, 'oven'], [mixer, 74 * s, 'mixer'], [fridge, 104 * s, 'fridge']];
    eq.forEach(([fn, size, lab], i) => {
      const [x, y] = G.eq[i];
      svg += `<g class="fv-pop" style="--d:${(0.2 + i * 0.15).toFixed(2)}s">${fn(x, y, size)}${text(x, G.eqLab, lab, 20)}</g>`;
    });
    if (P) svg += text(195, G.eqLab + 30, 'equipment: fixed', 21, shade(FIXED, 72));
    else svg += text(412, G.eqLab + 30, 'equipment: fixed', 21, shade(FIXED, 72));
    // two months: rent bars of the same height
    const h = RENT * PX * (P ? 0.86 : 1), base = G.base;
    svg += `<path d="M${P ? 20 : 30} ${base}H${P ? 370 : 540}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-linecap:round')}/>`;
    [['100 loaves', 1], ['2,000 loaves', 10]].forEach(([lab, n], i) => {
      const cx = G.cols[i], x = cx - G.bw / 2;
      svg += `<g class="fv-grow" style="--d:${(0.7 + i * 0.3).toFixed(2)}s">${rect(x, base - h, G.bw, h, 6, tint(FIXED, 34), `stroke:${shade(FIXED, 62)};stroke-width:2.5`)}</g>`;
      svg += text(cx, base - h / 2 - 4, 'rent', 22, shade(FIXED, 75)) + text(cx, base - h / 2 + 22, 'fixed', 19, shade(FIXED, 75), 'middle', 700);
      svg += text(cx, base - h - 12, rs(RENT), 24);
      svg += text(cx, G.lab, lab, 23);
      // the loaves baked that month
      if (P) svg += loaves(cx, G.pile, n, 30);
      else svg += loaves(cx + G.bw / 2 + (n === 1 ? 32 : 58), base - 2, n, n === 1 ? 34 : 26);
    });
    // the same rent
    const mx = (G.cols[0] + G.cols[1]) / 2 + (P ? 0 : -6);
    svg += `<g class="fv-pop" style="--d:1.4s">${text(mx, base - h / 2 + 14, '=', 44, shade(FIXED, 72))}</g>`;
    return { svg };
  }

  // b1: twice the loaves, twice the pile.
  paintVariable(P) {
    let svg = this.heading(P, 'variable cost', 'goes up with baking', VARC);
    if (P) {
      svg += `<g class="fv-pop" style="--d:0.2s">${pile(195, 204, 1.15)}</g>` + text(195, 236, '1,000 loaves', 24);
      svg += `<g class="fv-pop" style="--d:0.6s">${text(195, 280, 'x 2', 34, shade(VARC, 72))}</g>`;
      svg += `<g class="fv-pop" style="--d:0.8s">${pile(195, 382, 1.15)}</g><g class="fv-pop" style="--d:1.0s">${pile(195, 452, 1.15)}</g>`;
      svg += text(195, 486, '2,000 loaves', 24) + text(195, 520, 'twice the flour, sugar', 21, shade(VARC, 72)) + text(195, 548, 'and packets', 21, shade(VARC, 72));
    } else {
      svg += `<g class="fv-pop" style="--d:0.2s">${pile(135, 360, 1.25)}</g>` + text(135, 396, '1,000 loaves', 24);
      svg += `<g class="fv-pop" style="--d:0.6s">${text(272, 214, 'x 2', 38, shade(VARC, 72))}</g>`;
      svg += `<path d="M246 232H290" ${stroke(shade(VARC, 62), 4, 'stroke-linecap:round')}/><path d="M288 222L302 232L288 242Z" ${fill(shade(VARC, 62))}/>`;
      svg += `<g class="fv-pop" style="--d:0.8s">${pile(432, 274, 1.25)}</g><g class="fv-pop" style="--d:1.0s">${pile(432, 360, 1.25)}</g>`;
      svg += text(432, 396, '2,000 loaves', 24);
      svg += text(280, 446, 'twice the flour, sugar and packets', 22, shade(VARC, 72));
    }
    return { svg };
  }

  // b2: the slider and two bars (variable; total = rent + variable).
  paintBoth(P) {
    const G = P
      ? { base: 352, xs: [64, 226], bw: 100, read: [195, 424], lines: 32, slider: [30, 548, 330] }
      : { base: 380, xs: [56, 210], bw: 110, read: [452, 110], lines: 40, slider: [40, 438, 480] };
    this.G = G;
    let svg = this.heading(P, 'both together', '', VARC);
    const base = G.base;
    svg += `<path d="M${P ? 30 : 30} ${base}H${P ? 360 : 340}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-linecap:round')}/>`;
    // variable bar
    const [xv, xt] = G.xs, bw = G.bw;
    svg += `<g class="fv-grow" style="--d:0.2s">${rect(xv, base, bw, 0, 4, tint(VARC, 40), `stroke:${shade(VARC, 62)};stroke-width:2.5`, 'vbar')}</g>`;
    svg += text(xv + bw / 2, base - 12, '', 23, 'var(--sim-label)', 'middle', 800, 'vval');
    svg += text(xv + bw / 2, base + 28, 'variable', 21, shade(VARC, 75));
    // total bar: rent (fixed) at the bottom, the variable part on top
    const rh = RENT * PX;
    svg += `<g class="fv-grow" style="--d:0.2s">${rect(xt, base - rh, bw, rh, 0, tint(FIXED, 34), `stroke:${shade(FIXED, 62)};stroke-width:2.5`)}</g>`;
    svg += text(xt + bw / 2, base - rh / 2 - 2, 'rent', 21, shade(FIXED, 75)) + text(xt + bw / 2, base - rh / 2 + 24, rs(RENT), 20);
    svg += `<g class="fv-grow" style="--d:0.5s">${rect(xt, base - rh, bw, 0, 0, tint(VARC, 40), `stroke:${shade(VARC, 62)};stroke-width:2.5`, 'tbar')}</g>`;
    svg += text(xt + bw / 2, base - 12, '', 23, 'var(--sim-label)', 'middle', 800, 'tval');
    svg += text(xt + bw / 2, base, '', 20, shade(VARC, 75), 'middle', 800, 'tvl');
    svg += text(xt + bw / 2, base + 28, 'total', 21);
    // readout
    const [rx, ry] = G.read, L = G.lines, anchor = 'middle';
    svg += text(rx, ry, '', 28, 'var(--sim-label)', anchor, 800, 'rl');
    svg += text(rx, ry + L * 0.9, rs(PER) + ' a loaf (made-up)', 19, 'var(--sim-label-muted)', anchor, 700);
    if (P) {
      svg += text(rx, ry + L * 2, '', 22, 'var(--sim-label)', anchor, 800, 'rv');
    } else {
      svg += text(rx, ry + L * 2.2, 'variable', 21, shade(VARC, 75), anchor) + text(rx, ry + L * 3, '', 24, 'var(--sim-label)', anchor, 800, 'rv');
      svg += text(rx, ry + L * 4, '+ rent', 21, shade(FIXED, 75), anchor) + text(rx, ry + L * 4.8, rs(RENT), 24);
      svg += `<path d="M${rx - 80} ${f1(ry + L * 5.2)}H${rx + 80}" ${stroke('var(--sim-label)', 2.5)}/>`;
      svg += text(rx, ry + L * 5.8, '= total', 22, 'var(--sim-label)', anchor) + text(rx, ry + L * 6.9, '', 30, 'var(--sim-label)', anchor, 800, 'rt');
    }
    const [sx, sy, sw] = G.slider;
    const over = `<input type="range" class="sv-hit tap fv-ab fv-range" min="0" max="${MAXL}" step="100" value="${this.loaves}" aria-label="loaves baked" style="left:${sx}px;top:${sy - 22}px;width:${sw}px">`;
    svg += text(sx, sy + 34, '0', 19, 'var(--sim-label-muted)', 'start', 700) + text(sx + sw, sy + 34, group(MAXL), 19, 'var(--sim-label-muted)', 'end', 700);
    svg += text(sx + sw / 2, sy + 34, 'loaves', 19, 'var(--sim-label-muted)', 'middle', 700);
    return { svg, over };
  }

  repaint() {
    super.repaint();
    if (this.stepIndex === 2) this.update();
  }

  /** Set the bars and readouts for this.loaves, in place (b2). */
  update() {
    const w = this.sv?.wrap ?? this.root;
    const G = this.G;
    if (!w || !G) return;
    const q = (k) => w.querySelector(`[data-k="${k}"]`);
    const vc = this.loaves * PER, rh = RENT * PX, vh = vc * PX, base = G.base;
    const set = (el, a) => { if (el) for (const [n, val] of Object.entries(a)) el.setAttribute(n, f1(val)); };
    const txt = (el, t, y) => { if (el) { el.textContent = t; if (y != null) el.setAttribute('y', f1(y)); } };
    set(q('vbar'), { y: base - vh, height: vh });
    set(q('tbar'), { y: base - rh - vh, height: vh });
    txt(q('vval'), rs(vc), base - vh - 12);
    txt(q('tval'), rs(RENT + vc), base - rh - vh - 12);
    txt(q('tvl'), vh >= 34 ? 'variable' : '', base - rh - vh / 2 + 7);
    txt(q('rl'), `${group(this.loaves)} loaves`);
    if (this.P) txt(q('rv'), `${rs(vc)} + ${rs(RENT)} = ${rs(RENT + vc)}`);
    else { txt(q('rv'), rs(vc)); txt(q('rt'), rs(RENT + vc)); }
  }

  testState() { return { view: this.stepIndex, loaves: this.loaves, variable: this.loaves * PER, total: RENT + this.loaves * PER }; }
}
