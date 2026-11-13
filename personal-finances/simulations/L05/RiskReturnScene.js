/**
 * RiskReturnScene - L05 s03 "Risk and Return Go Together" (2 beats). SvgScene with a flat graph-paper plane
 * (SimPlotSvg linScale), design 560 x 490 landscape, 390 x 620 portrait. Book Fig 5.9 as a plane: x = risk,
 * y = return, no numbers, only Low -> High. A rising dashed line through five dots: fixed deposit (low, low),
 * government bond and company bond (two close dots), mutual fund, shares (high, high potential).
 *   b0 The places: the five dots on the line; tap a dot for its one-line card (cold start: fixed deposit).
 *   b1 The trade-off: a shaded band shows the spread of outcomes, widening to the right (draws in left to
 *      right); a "no gain" line at zero return; the shares end of the band reaches below it: "may lose". End
 *      labels "Low risk, low return" and "Higher risk, higher potential return". Replay.
 * Nothing implies a guarantee: the line is dashed and the words say "may" / "potential".
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { linScale } from 'simulations/base/kit/SimPlotSvg.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
// risk and return on a 0..10 scale (no numbers on screen); lab = where the name sits (dx, dy, anchor)
const PLACES = [
  { key: 'fd', name: 'fixed deposit', r: 1.2, v: 2.0, col: 'var(--sim-series-4)', lab: [16, 30, 'start'], card: ['Fixed deposit', 'low risk, steady but lower return'] },
  { key: 'gov', name: 'government bond', r: 2.7, v: 3.0, col: 'var(--sim-series-5)', lab: [18, 26, 'start'], card: ['Government bond', 'close to a fixed deposit; safer'] },
  { key: 'co', name: 'company bond', r: 3.5, v: 3.8, col: 'var(--sim-series-6)', lab: [-16, -16, 'end'], card: ['Company bond', 'a little more risk, a higher rate'] },
  { key: 'mf', name: 'mutual fund', r: 5.9, v: 5.6, col: 'var(--sim-series-7)', lab: [18, 26, 'start'], card: ['Mutual fund', 'may give higher returns'] },
  { key: 'sh', name: 'shares', r: 8.6, v: 8.0, col: 'var(--sim-series-8)', lab: [6, 42, 'middle'], card: ['Shares', 'highest risk; may give the highest return'] },
];
const LINE = [[0.4, 1.3], [9.7, 8.9]];
const lineY = (r) => LINE[0][1] + (LINE[1][1] - LINE[0][1]) * (r - LINE[0][0]) / (LINE[1][0] - LINE[0][0]);
const spread = (r) => 0.25 + Math.pow(r / 10, 1.5) * 10.8;   // half-width of the outcome band
const Y_LO = -3, Y_HI = 11;

const CSS = `
.rr-ab { position: absolute; transform: translate(-50%, -50%); }
.rr-dot { width: 52px; height: 52px; border-radius: 50%; padding: 0; cursor: pointer; background: transparent; border: none; }
.rr-dot:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.rr-btn { min-height: 48px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.rr-btn:active { transform: translateY(3px); box-shadow: none; }
.rr-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .rr-sweep { animation: rr-sweep 1.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes rr-sweep { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@media (prefers-reduced-motion: reduce) { svg .rr-sweep { animation: none; } }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;

export class RiskReturnScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A plane with risk across, from low to high, and return up, from low to high. A rising dashed line passes through a fixed deposit (low risk, low return), a government bond and a company bond close to it, a mutual fund, and shares (highest risk, highest potential return). A shaded band shows the spread of possible outcomes; it widens to the right, and at shares it reaches below the no-gain line: shares may lose. Low risk, low return; higher risk, higher potential return.';

  async setup() {
    this.sel = 'fd';
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'pick') { this.sel = b.dataset.val; this.repaint(); }
      else if (b.dataset.act === 'replay') this.play();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter(step) {
    this.clear();
    this.sel = 'fd';
    if (step === 1) this.after(0.05, () => this.play());
  }

  play() {
    if (this.stepIndex !== 1) return;
    this.clear();
    this.fresh = true;
    this.after(2.6, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4);
    const out = this.paintPlane(P, this.stepIndex);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  paintPlane(P, v) {
    let svg = '', over = '';
    const G = P ? { x0: 58, x1: 380, yT: 150, yB: 540, card: [12, 8, 366, 92] } : { x0: 64, x1: 548, yT: 22, yB: 398, card: [80, 30, 318, 84] };
    const px = linScale(0, 10, G.x0, G.x1), py = linScale(Y_LO, Y_HI, G.yB, G.yT);
    const y0 = py(0);
    // graph paper
    svg += `<rect x="${G.x0}" y="${G.yT}" width="${G.x1 - G.x0}" height="${G.yB - G.yT}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 72%, transparent)')}/>`;
    for (let i = 1; i < 10; i++) svg += `<path d="M${f1(px(i))} ${G.yT}V${G.yB}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.35')}/>`;
    for (let j = Y_LO + 1; j < Y_HI; j++) svg += `<path d="M${G.x0} ${f1(py(j))}H${G.x1}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.35')}/>`;
    // axes: risk across, return up; Low -> High, no numbers
    svg += `<path d="M${G.x0} ${G.yT - 8}V${G.yB}H${G.x1 + 8}" ${stroke(INK, 3.5)}/>`
      + `<path d="M${G.x0} ${G.yT - 16}l-9 14h18z" ${fill(INK)}/><path d="M${G.x1 + 16} ${G.yB}l-14 -9v18z" ${fill(INK)}/>`;
    svg += text(G.x0 + 8, G.yB + 28, 'Low', 20, MUTED, 'start', 700) + text(G.x1, G.yB + 28, 'High', 20, MUTED, 'end', 700)
      + text((G.x0 + G.x1) / 2, G.yB + 30, 'risk', 24, INK);
    const ry = (G.yT + G.yB) / 2;
    svg += `<text transform="translate(${G.x0 - 18} ${f1(ry)}) rotate(-90)" text-anchor="middle" style="fill:${INK};font:800 24px var(--sim-font)">return</text>`
      + `<text transform="translate(${G.x0 - 18} ${f1(G.yB - 10)}) rotate(-90)" text-anchor="start" style="fill:${MUTED};font:700 18px var(--sim-font)">Low</text>`
      + `<text transform="translate(${G.x0 - 18} ${f1(G.yT + 10)}) rotate(-90)" text-anchor="end" style="fill:${MUTED};font:700 18px var(--sim-font)">High</text>`;

    if (v === 1) {
      // the spread of outcomes, widening to the right
      const xs = [];
      for (let r = 0.2; r <= 9.81; r += 0.2) xs.push(r);
      const up = xs.map((r) => [px(r), py(Math.min(Y_HI, lineY(r) + spread(r)))]);
      const dn = xs.map((r) => [px(r), py(Math.max(Y_LO, lineY(r) - spread(r)))]).reverse();
      const d = [...up, ...dn].map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';
      svg += `<g${this.fresh ? ' class="rr-sweep"' : ''}><path d="${d}" ${fill('color-mix(in oklab, var(--sim-series-7) 22%, transparent)', 'stroke:color-mix(in oklab, var(--sim-series-7) 55%, transparent);stroke-width:2')}/>`;
      // where the band dips below no gain
      const neg = xs.filter((r) => lineY(r) - spread(r) < 0);
      if (neg.length) {
        const lo = neg.map((r) => [px(r), py(Math.max(Y_LO, lineY(r) - spread(r)))]);
        const dd = `M${f1(lo[0][0])} ${f1(y0)}` + lo.map(([x, y]) => `L${f1(x)} ${f1(y)}`).join('') + `L${f1(lo[lo.length - 1][0])} ${f1(y0)}Z`;
        svg += `<path d="${dd}" ${fill('color-mix(in oklab, var(--sim-bad) 40%, transparent)')}/>`;
      }
      svg += '</g>';
      svg += `<path d="M${G.x0} ${f1(y0)}H${G.x1}" ${stroke(INK, 3, 'stroke-dasharray:10 7')}/>`;
      svg += text(px(7.4), y0 - 10, 'no gain', 19, INK, 'end', 800);
      svg += `<g${this.fresh ? ' class="mk-pop" style="--d:1.5s"' : ''}>${text(G.x1 - 8, y0 + (P ? 34 : 36), 'may lose', P ? 24 : 28, BAD_INK, 'end')}</g>`;
    }
    // the rising line (dashed: a tendency, not a promise of return)
    svg += `<path d="M${f1(px(LINE[0][0]))} ${f1(py(LINE[0][1]))}L${f1(px(LINE[1][0]))} ${f1(py(LINE[1][1]))}" ${stroke(INK, 3.5, 'stroke-dasharray:12 8;opacity:0.7')}/>`;
    // the five places
    PLACES.forEach((p, i) => {
      const x = px(p.r), y = py(p.v), on = v === 1 || this.sel === p.key;
      if (v === 0 && on) svg += `<circle cx="${f1(x)}" cy="${f1(y)}" r="22" ${fill('none', `stroke:${ACC};stroke-width:4`)}/>`;
      svg += `<g class="mk-pop" style="--d:${(v === 0 ? i * 0.12 : 0).toFixed(2)}s"><circle cx="${f1(x)}" cy="${f1(y)}" r="13" ${fill(p.col, `stroke:${shade(p.col, 62)};stroke-width:3`)}/></g>`;
      const [dx, dy, an] = p.lab;
      const PL = { gov: [0, 36, 'middle'], co: [18, 24, 'start'] }[p.key];
      const [ldx, ldy, lan] = P && PL ? PL : [dx, dy, an];
      if (!((v === 1 || P) && (p.key === 'gov' || p.key === 'co'))) svg += text(x + ldx, y + ldy, p.name, P ? 19 : 20, INK, lan, 800);
      if (v === 0) over += `<div class="rr-ab" style="left:${f1(x)}px;top:${f1(y)}px"><button type="button" class="sv-hit rr-dot" data-act="pick" data-val="${p.key}" aria-pressed="${this.sel === p.key}" aria-label="${p.name}"></button></div>`;
    });
    if (v === 1 || P) {
      const gx = px(3.1), gy = py(3.4);
      svg += text(gx + 22, gy + 34, 'bonds', 20, INK, 'start', 800);
    }
    const [cx, cy, cw, ch] = G.card;
    if (v === 0) {
      const p = PLACES.find((q) => q.key === this.sel) ?? PLACES[0];
      svg += panel(cx, cy, cw, ch, { edge: p.col, sw: 3.5 });
      svg += `<rect x="${cx + 3}" y="${cy + 3}" width="10" height="${ch - 6}" rx="5" ${fill(p.col)}/>`;
      svg += text(cx + 24, cy + 34, p.card[0], 24, INK, 'start') + text(cx + 24, cy + 66, p.card[1], P ? 19 : 18, INK, 'start', 700);
      svg += text(P ? 378 : 548, P ? 128 : 44, 'tap a dot', 19, MUTED, 'end', 700);
    } else {
      // the trade-off, end labels
      svg += `<g${this.fresh ? ' class="mk-pop" style="--d:1.9s"' : ''}>`
        + text(P ? 12 : cx, P ? 34 : cy + 22, 'Higher risk,', P ? 22 : 22, INK, 'start')
        + text(P ? 12 : cx, P ? 62 : cy + 50, 'higher potential return', P ? 22 : 22, ACC_INK, 'start') + '</g>';
      svg += text(P ? px(0.4) : px(1.6), P ? py(-2.2) : py(-1.6), 'Low risk, low return', P ? 20 : 22, INK, 'start');
      if (!this.fresh) over += `<div class="rr-ab" style="left:${P ? 330 : 480}px;top:${P ? 100 : 462}px"><button type="button" class="sv-hit rr-btn" data-act="replay">replay</button></div>`;
    }
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, sel: this.sel, fresh: this.fresh, places: PLACES.map((p) => p.key) }; }
}
