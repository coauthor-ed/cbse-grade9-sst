/**
 * WorkshopScene - Masterji's order (a made-up example, said once on screen). One file on two slides:
 *   blk-l06-s01 (1 beat)  step 0 routes: two routes stacked. Top: 4 tailors at their hand stations, hands on
 *                         the cloth. Below: one power sewing line with its operator. Each route has a daily bill
 *                         bar to ONE scale (Rs 0 to 1,800) with its tag: "4 x Rs 250 = Rs 1,000" and "Rs 1,200".
 *                         A dashed mark at Rs 1,200 runs through both bars. The bars grow in; "cheaper" lands
 *                         on the hands route; the machine route dims. Replay re-grows the bars.
 *   blk-l06-s03 (2 beats) step 1 flip: wage Rs 400. The hands bar grows from 1,000 to 1,600 (0.6 s) past the
 *                         1,200 mark; the overhang is marked "+Rs 400"; "cheaper" moves to the machine route; the
 *                         tailors dim to 50%. Replay.
 *                         step 2 wage: wage buttons inside the figure (minus, Rs 250, Rs 300, Rs 400, plus; steps of
 *                         50 from 200 to 450). The hands bar follows 4 x wage; at Rs 300 both bars are equal and
 *                         "same cost" shows; below, hands cheaper; above, machine cheaper. Rest: Rs 300.
 * SvgScene for bars, tags and buttons (portrait gets its own layout: bars under each route). The people and
 * stations are drawn on two small canvases on the overlay (SimFigure is canvas only; drawCivic draws the
 * stations so the tables sit in front of the people). Colours are tokens only: hands series-8, machine
 * series-1 (the same as FactorsScene). The rupee and times signs are written as escapes. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { loadColors } from 'simulations/base/kit/SimLook.js';
import { drawCivic } from 'simulations/base/kit/SimCivic.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';

const R = '\u20B9';
const X = '\u00D7';
const MAP_1 = [[{ idx: 0, dwellMs: null }]];
const MAP_2 = [[{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const LINE = 1200;
const MAX = 1800;
const REST = [250, 400, 300];
const HT = 8;   // hands tone
const MT = 1;   // machine tone
const f1 = (v) => (+v).toFixed(1);
const money = (n) => (n >= 1000 ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, '0')}` : String(n));

const CSS = `
.ws-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; align-items: center; gap: 10px; }
.ws-btn { min-height: 46px; min-width: 46px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ws-btn:active { transform: translateY(3px); box-shadow: none; }
.ws-btn:disabled { opacity: 0.4; cursor: default; }
.ws-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.ws-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ws-p .ws-btn { font-size: 18px; padding: 4px 10px; min-width: 44px; }
.ws-cap { position: absolute; left: 0; right: 0; text-align: center; transform: translateY(-50%); font: 800 17px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.ws-pic { position: absolute; pointer-events: none; }
.ws-dim { opacity: 0.5; }
.ws-fade { animation: ws-fade 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ws-fade { from { opacity: 1; } to { opacity: 0.5; } }
svg .ws-grow { transform-box: fill-box; transform-origin: left center; animation: ws-grow 0.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ws-grow { from { transform: scaleX(var(--s0, 0)); } to { transform: none; } }
svg .ws-pop { transform-box: fill-box; transform-origin: center; animation: ws-pop 0.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ws-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ws-in { animation: ws-in 0.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ws-in { from { opacity: 0; } to { opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

/** A reading pill (tag) left-aligned at x, centred on y. */
function tag(x, y, t, size, col, o = '') {
  const w = t.length * size * 0.56 + 22, h = size + 14;
  return `<g${o}><rect x="${f1(x)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill('var(--sim-bg-surface)', `stroke:${col};stroke-width:2.5`)}/>`
    + text(x + w / 2, y + size * 0.36, t, size, 'var(--sim-label)') + '</g>';
}
/** A filled chip (cheaper / same cost), centred on (x, y). */
function chipFill(x, y, t, size, tok, o = '') {
  const w = t.length * size * 0.56 + 26, h = size + 14;
  return `<g${o}><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(`var(--sim-${tok})`, `stroke:${shade(`var(--sim-${tok})`, 65)};stroke-width:2`)}/>`
    + text(x, y + size * 0.36, t, size, `var(--sim-ink-on-${tok}, var(--sim-bg-deep))`) + '</g>';
}

export class WorkshopScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 496;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP_2;
  static BEAT_MAPS = { 1: MAP_1, 2: MAP_2 };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up example. Masterji can stitch 40 school uniforms with 4 tailors at their tables, or with one power sewing line and its operator. Each way has a bar for its bill a day: 4 tailors at 250 rupees cost 1,000 rupees; the sewing line costs 1,200 rupees. When the wage rises to 400 rupees, the tailors cost 1,600 rupees and the machine is cheaper by 400 rupees. Wage buttons let you try 200 to 450 rupees: at 300 rupees both bills are 1,200 rupees.';

  async setup() {
    this.wage = REST[0];
    this.from = null;
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

  enter(step) {
    this.wage = REST[step] ?? REST[0];
    this.from = null;
    this.fresh = true;
    this.after(2.2, () => { this.fresh = false; });
  }

  act(a, v) {
    if (a === 'replay' && this.stepIndex < 2) {
      this.fresh = false;
      this.repaint();   // drop the old animation nodes first, so the next paint replays them
      this.fresh = true;
      this.repaint();
      this.after(2.2, () => { this.fresh = false; });
      return;
    }
    if (a !== 'wage' || this.stepIndex !== 2) return;
    let w = this.wage;
    if (v === 'minus') w -= 50; else if (v === 'plus') w += 50; else w = Number(v);
    if (!Number.isFinite(w)) return;
    w = Math.max(200, Math.min(450, w));
    if (w === this.wage) return;
    this.from = this.wage;
    this.wage = w;
    this.fresh = false;
    this.repaint();
    this.after(0.7, () => { this.from = null; });
  }

  stageHeight(st) { return st.portrait ? 600 : 470; }

  geom(st) {
    const P = st.portrait, W = st.W;
    if (P) {
      const x0 = 16, BL = W - 32;
      return { P, W, x0, BL, k: BL / MAX, bh: 38,
        a: { box: [0, 28, W, 134], ground: 156, xs: [0.13, 0.37, 0.63, 0.87].map((f) => f * W), barY: 188, tagY: 228, chipY: 228 },
        b: { box: [0, 262, W, 144], ground: 398, cx: W / 2, barY: 432, tagY: 472, chipY: 472 },
        sepY: 256, ctlY: 562, capY: 526, exY: 16 };
    }
    const x0 = 322, BL = W - x0 - 14;
    return { P, W, x0, BL, k: BL / MAX, bh: 46,
      a: { box: [0, 42, 316, 170], ground: 198, xs: [44, 118, 192, 266], barY: 130, tagY: 86, chipY: 178 },
      b: { box: [0, 238, 316, 170], ground: 392, cx: 158, barY: 330, tagY: 286, chipY: 378 },
      sameY: 232, ctlY: 440, capY: 408, exY: 20 };
  }

  bar(g, row, val, tok, o) {
    const len = val * g.k, y = row.barY - g.bh / 2;
    const anim = o.anim ? ` class="ws-grow" style="--s0:${(o.s0 ?? 0).toFixed(3)};--d:${o.d ?? 0}s"` : '';
    const col = `var(--sim-series-${tok})`;
    return `<rect x="${f1(g.x0)}" y="${f1(y + 4)}" width="${f1(len)}" height="${g.bh}" rx="10" ${fill(shade(col, 60), 'opacity:0.35')}/>`
      + `<g${anim}><rect x="${f1(g.x0)}" y="${f1(y)}" width="${f1(len)}" height="${g.bh}" rx="10" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2.5`)}/></g>`;
  }

  paint(st) {
    const g = this.geom(st), P = g.P, s = this.stepIndex, w = this.wage, fr = this.fresh;
    const hands = 4 * w, cheaper = hands < LINE ? 'a' : hands > LINE ? 'b' : null;
    let svg = '', over = '';
    // Where the bars start: a base line for one scale, and the Rs 1,200 mark through both bars.
    const yTop = g.a.barY - g.bh / 2 - 10, yBot = g.b.barY + g.bh / 2 + 10, mx = g.x0 + LINE * g.k;
    svg += `<path d="M${f1(g.x0)} ${f1(yTop)} V${f1(yBot)}" ${stroke('var(--sim-stroke)', 3)}/>`;
    if (P) {
      svg += `<path d="M6 ${g.sepY} H${f1(g.W - 6)}" ${stroke('var(--sim-stroke)', 2, 'stroke-dasharray:3 9;opacity:0.7')}/>`;
      for (const r of [g.a, g.b]) svg += `<path d="M${f1(mx)} ${f1(r.barY - g.bh / 2 - 8)} V${f1(r.barY + g.bh / 2 + 8)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:6 5')}/>`;
    } else {
      svg += `<path d="M${f1(mx)} ${f1(yTop)} V${f1(yBot)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:6 5')}/>`;
      svg += `<path d="M6 ${f1((g.a.box[1] + g.a.box[3] + g.b.box[1]) / 2 + 2)} H${f1(g.W - 6)}" ${stroke('var(--sim-stroke)', 2, 'stroke-dasharray:3 9;opacity:0.7')}/>`;
    }
    // The bars. Step 0 grows both from zero; step 1 grows the hands bar from 1,000 to 1,600; step 2 follows the wage.
    const growA = fr && s < 2 ? { anim: true, s0: s === 1 ? 1000 / hands : 0, d: s === 1 ? 0.5 : 0.3 } : this.from ? { anim: true, s0: (4 * this.from) / hands, d: 0 } : {};
    const growB = fr && s === 0 ? { anim: true, s0: 0, d: 0.5 } : {};
    svg += this.bar(g, g.a, hands, HT, growA) + this.bar(g, g.b, LINE, MT, growB);
    // The overhang of the dearer bar past the cheaper one, with the difference.
    if (s > 0 && cheaper) {
      const lo = Math.min(hands, LINE), hi = Math.max(hands, LINE), row = cheaper === 'a' ? g.b : g.a;
      const x1 = g.x0 + lo * g.k, x2 = g.x0 + hi * g.k, y = row.barY - g.bh / 2;
      const o = fr ? ' class="ws-in" style="--d:1.15s"' : this.from ? ' class="ws-in" style="--d:0.6s"' : '';
      svg += `<g${o}><rect x="${f1(x1)}" y="${f1(y - 3)}" width="${f1(x2 - x1)}" height="${f1(g.bh + 6)}" rx="6" ${fill('none', 'stroke:var(--sim-bad);stroke-width:3;stroke-dasharray:6 4')}/>`
        + text(x1 + 8, y + g.bh + (P ? 24 : 26), `+${R}${hi - lo}`, P ? 19 : 20, 'var(--sim-bad)', ' text-anchor="start"') + '</g>';
    }
    // Tags: the sum on the hands route, the rent on the machine route.
    const ts = P ? 19 : 20;
    svg += tag(g.x0, g.a.tagY, `4 ${X} ${R}${w} = ${R}${money(hands)}`, ts, `var(--sim-series-${HT})`);
    svg += tag(g.x0, g.b.tagY, `${R}${money(LINE)}`, ts, `var(--sim-series-${MT})`);
    // The verdict.
    const vd = fr ? (s === 1 ? 1.3 : 1.2) : this.from ? 0.6 : 0;
    const vo = vd ? ` class="ws-pop" style="--d:${vd}s"` : '';
    if (cheaper) {
      const row = cheaper === 'a' ? g.a : g.b;
      const cx = P ? g.W - 16 - 52 : g.x0 + (cheaper === 'a' ? (hands * g.k) / 2 : (LINE * g.k) / 2) + 6;
      svg += chipFill(cx, row.chipY, 'cheaper', P ? 19 : 20, 'good', vo);
    } else if (P) {
      svg += chipFill(g.W - 16 - 64, g.a.chipY, 'same cost', 19, 'accent', vo);
      svg += chipFill(g.W - 16 - 64, g.b.chipY, 'same cost', 19, 'accent', vo);
    } else {
      svg += chipFill(g.x0 + (LINE * g.k) / 2, g.sameY, 'same cost', 20, 'accent', vo);
    }
    svg += text(P ? g.W / 2 : 10, g.exY, 'a made-up example', P ? 17 : 18, 'var(--sim-label-muted)', P ? '' : ' text-anchor="start"');
    // People and stations: two canvases, drawn after render.
    const dimA = cheaper === 'b', dimB = cheaper === 'a';
    // The host forces every canvas to width 100%, so each canvas sits in a sized div and fills it.
    const pic = (id, box, dim, d) => `<div class="ws-pic ${dim ? (fr || this.from ? 'ws-fade' : 'ws-dim') : ''}" style="left:${box[0]}px;top:${box[1]}px;width:${box[2]}px;height:${box[3]}px;--d:${d}s"><canvas data-pic="${id}" width="${Math.round(box[2])}" height="${Math.round(box[3])}" style="display:block;width:100%;height:100%"></canvas></div>`;
    over += pic('a', g.a.box, dimA, fr ? 1.3 : 0.4) + pic('b', g.b.box, dimB, fr ? 1.2 : 0.4);
    // Controls.
    if (s < 2) {
      over += `<div class="ws-row" style="top:${g.ctlY}px"><button type="button" class="sv-hit ws-btn" data-act="replay" aria-label="replay the bars">${s === 1 ? 'replay the rise' : 'replay'}</button></div>`;
    } else {
      over += `<div class="ws-cap" style="top:${g.capY}px">one tailor's wage a day</div>`;
      const b = (val, label, extra = '') => `<button type="button" class="sv-hit ws-btn" data-act="wage" data-val="${val}"${extra}>${label}</button>`;
      over += `<div class="ws-row" style="top:${g.ctlY}px">`
        + b('minus', '\u2212', ` aria-label="wage down 50 rupees"${w <= 200 ? ' disabled' : ''}`)
        + [250, 300, 400].map((v) => b(v, `${R}${v}`, ` aria-pressed="${w === v}"`)).join('')
        + b('plus', '+', ` aria-label="wage up 50 rupees"${w >= 450 ? ' disabled' : ''}`)
        + '</div>';
    }
    return { svg, over: `<div class="${P ? 'ws-p' : 'ws-l'}">${over}</div>` };
  }

  repaint() {
    super.repaint();
    if (!this.sv) return;
    const g = this.geom(this.sv);
    let c;
    try { c = loadColors(this.root); } catch (_) { return; }
    for (const el of this.sv.wrap.querySelectorAll('canvas[data-pic]')) {
      const id = el.dataset.pic, row = g[id], [bx, by, bw, bh] = row.box;
      const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      el.width = Math.round(bw * dpr);
      el.height = Math.round(bh * dpr);
      const ctx = el.getContext('2d');
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, -bx * dpr, -by * dpr);
      if (id === 'a') this.drawTailors(ctx, c, g, row);
      else this.drawLine(ctx, c, g, row);
    }
  }

  drawTailors(ctx, c, g, row) {
    const H = g.P ? 104 : 124, tw = g.P ? 70 : 72;
    row.xs.forEach((x, i) => {
      const top = row.ground - tw * (190 - 52) / 220 + 6;
      const spec = figureFor(c, { role: 'worker', pose: 'stand', facing: 0, x, y: row.ground - 2, height: H, i: [1, 4, 2, 7][i],
        hands: [{ x: x + 12, y: top + 8 }, { x: x - 12, y: top + 8 }], mood: 'smile' });
      drawFigure(ctx, c, spec, spec.look);
      drawCivic(ctx, c, 'tailor', x, row.ground, { w: tw });
    });
  }

  drawLine(ctx, c, g, row) {
    const lw = g.P ? 220 : 236, H = g.P ? 126 : 146, k = lw / 300;
    const top = row.ground - (180 - 100) * k;
    const ox = row.cx - 6;
    const spec = figureFor(c, { role: 'worker', pose: 'stand', facing: 0, x: ox, y: row.ground - 8, height: H, i: 3,
      hands: [{ x: ox + 18, y: top - 4 }, { x: ox - 16, y: top - 4 }], mood: 'smile' });
    drawFigure(ctx, c, spec, spec.look);
    drawCivic(ctx, c, 'sewingLine', row.cx, row.ground, { w: lw });
  }

  testState() { return { step: this.stepIndex, wage: this.wage, hands: 4 * this.wage, line: LINE, cheaper: 4 * this.wage < LINE ? 'hands' : 4 * this.wage > LINE ? 'machine' : 'same' }; }
}
