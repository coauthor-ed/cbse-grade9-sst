/**
 * BicycleSavingsScene - L01 s04 "Saving What Is Left, or Saving First" (3 beats). SvgScene, design 560 x 480
 * landscape, 390 x 600 portrait. Cast: shared/MoneyKit.js (jar, tags, bicycle, paper).
 *   b0 Saving what is left: the jar (the hero) with a dashed line at Rs 3,000 that runs to the bicycle's tag.
 *      Six month chips drop what was left into the jar in turn (Rs 200, 0, 150, 300, 100, 250; 0.5 s each; the Rs 0
 *      chip is empty). Jar total big: Rs 1,000; a bracket "Rs 2,000 short". Rest / cold start: all six dropped.
 *   b1 Saving first: the same jar, empty again; six chips of Rs 500, kept on day 1, drop in turn; the jar reaches
 *      the line exactly at month 6 and the bicycle lights. Under it: "expenses = income - savings" and
 *      "1,000 = 1,500 - 500".
 *   b2 A budget: one wide bar for Meera's month, Rs 1,500 coming in, split savings Rs 500 (first, on the left) and
 *      expenses Rs 1,000; a "written plan" paper. Nothing else.
 * "replay" (in the figure) replays b0 / b1. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, TONE, tag, jar, jarLevel, bicycle, paper, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const LEFT = [200, 0, 150, 300, 100, 250];
const FIRST = [500, 500, 500, 500, 500, 500];
const GOAL = 3000, MAX = 3300, STEP_S = 0.5;

const CSS = `
.bs-ab { position: absolute; transform: translate(-50%, -50%); }
.bs-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.bs-btn:active { transform: translateY(3px); box-shadow: none; }
.bs-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .bs-drop { animation: bs-drop 0.5s cubic-bezier(.4,0,.6,1) both; }
@keyframes bs-drop { 0% { transform: translate(var(--dx, 0px), var(--dy, 0px)); opacity: 1; } 75% { transform: none; opacity: 1; } 100% { transform: translateY(26px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { svg .bs-drop { animation: none; opacity: 0; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** A month chip centred on (x, y): the amount big; empty (dashed) when spent is true or the amount is 0. */
function monthChip(x, y, w, h, amt, o = {}) {
  const used = o.used, zero = amt === 0, col = TONE.save;
  const bg = used || zero ? 'none' : `color-mix(in oklab, ${col} 30%, var(--sim-bg-surface))`;
  const edge = used || zero ? 'var(--sim-stroke)' : shade(col, 66);
  let s = '';
  if (!used && !zero) s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 3)}" width="${w}" height="${h}" rx="12" ${fill(edge)}/>`;
  s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="12" ${fill(bg, `stroke:${edge};stroke-width:2.5${used || zero ? ';stroke-dasharray:6 5' : ''}`)}/>`;
  s += text(x, y + (o.size ?? 20) * 0.36, rs(amt), o.size ?? 20, used ? 'var(--sim-label-muted)' : 'var(--sim-label)');
  return s;
}

export class BicycleSavingsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Meera wants a bicycle that costs 3,000 rupees. Saving what is left at the end of each month (200, 0, 150, 300, 100 and 250 rupees) fills the jar to only 1,000 rupees, 2,000 short. Saving 500 rupees first, on the day her money comes, fills it to 3,000 rupees in six months: expenses equal income minus savings, 1,000 = 1,500 - 500. Her budget for one month: 1,500 rupees in, 500 to savings, 1,000 to expenses.';

  async setup() {
    this.n = 6;
    this.anim = false;
    this.drop = -1;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b && b.dataset.act === 'replay') this.play();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.drop = -1; }

  enter(step) {
    this.clear();
    this.n = 6;
    if (step === 1) this.play(true);
  }

  /** Drop the six chips in turn. */
  play(quiet) {
    if (this.stepIndex > 1) return;
    this.clear();
    this.n = 0;
    this.anim = true;
    for (let i = 0; i < 6; i++) this.after(0.4 + i * STEP_S, () => { this.n = i + 1; this.drop = i; this.repaint(); this.drop = -1; });
    this.after(0.4 + 6 * STEP_S + 0.1, () => { this.anim = false; this.repaint(); });
    if (!quiet) this.repaint();
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.n = 6;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintBudget(P) : this.paintJar(P, v === 1);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0 / b1: chips, the jar, the line to the bicycle.
  paintJar(P, first) {
    let svg = '', over = '';
    const G = P
      ? { chips: [[65, 46], [195, 46], [325, 46], [65, 124], [195, 124], [325, 124]], cw: 104, ch: 48, cs: 22, mlab: null,
        jar: [122, 452, 176, 240], bike: [300, 452, 150], tagW: 150, short: [218, 1], cap: 486, btn: [312, 494], eq: [528, 562], note: 590, total: 32 }
      : { chips: [0, 1, 2, 3, 4, 5].map((i) => [62 + i * 87, 42]), cw: 78, ch: 46, cs: 20, mlab: 84,
        jar: [196, 362, 196, 236], bike: [452, 362, 186], tagW: 156, short: [306, 0], cap: 396, btn: [62, 446], eq: [424, 460], note: 466, total: 36 };
    const amts = first ? FIRST : LEFT, total = amts.slice(0, this.n).reduce((s, a) => s + a, 0);
    const [jx, jb, jw, jh] = G.jar, mouth = jb - jh - 6;
    amts.forEach((a, i) => {
      const [x, y] = G.chips[i];
      svg += monthChip(x, y, G.cw, G.ch, a, { used: i < this.n, size: G.cs });
      const ml = `month ${i + 1}`;
      if (G.mlab) svg += text(x, G.mlab, ml, 16, 'var(--sim-label-muted)', 'middle', 700);
      else svg += text(x - G.cw / 2 + 6, y - G.ch / 2 - 5, ml, 15, 'var(--sim-label-muted)', 'start', 700);
    });
    const ty = jarLevel(jb, GOAL, { h: jh, max: MAX });
    const [bx, bg, bw] = G.bike, reached = total >= GOAL;
    // the goal line runs from the jar to the bicycle's tag
    svg += `<path d="M${f1(jx + jw / 2)} ${f1(ty)}H${f1(bx - G.tagW / 2)}" ${stroke('var(--sim-label)', 3, 'stroke-dasharray:10 7')}/>`;
    svg += jar(jx, jb, total, GOAL, { w: jw, h: jh, max: MAX, label: '' });
    svg += `<g${first && reached && this.drop === 5 ? ' class="mk-pop"' : ''}>${tag(bx, ty, 'bicycle', GOAL, { w: G.tagW, tone: first && reached ? 'save' : 'plain', valueSize: 28, labelSize: 19 })}</g>`;
    svg += `<g${first && reached && this.drop === 5 ? ' class="mk-pop" style="--d:0.2s"' : ''}>${bicycle(bx, bg, bw, { dim: first && !reached })}</g>`;
    // the total, big, in the empty part of the jar
    const lv = jarLevel(jb, total, { h: jh, max: MAX });
    const totY = total >= GOAL ? jb - jh * 0.42 : Math.min(lv - 22, ty + (lv - ty) / 2 + 12);
    svg += text(jx, totY, rs(total), G.total, total >= GOAL ? 'var(--sim-bg-deep)' : 'var(--sim-label)');
    if (this.drop >= 0) {
      const [cx, cy] = G.chips[this.drop];
      svg += `<g class="bs-drop" style="--dx:${f1(cx - jx)}px;--dy:${f1(cy - mouth)}px">${monthChip(jx, mouth, G.cw, G.ch, amts[this.drop], { size: G.cs })}</g>`;
    }
    if (!first && this.n === 6) {
      const sx = G.short[0];
      svg += `<path d="M${sx - 8} ${f1(ty + 2)}H${sx}V${f1(lv - 2)}H${sx - 8}" ${stroke('var(--sim-bad)', 3.5)}/>`;
      if (G.short[1]) svg += text(sx + 10, (ty + lv) / 2 - 4, rs(GOAL - total), 24, 'var(--sim-bad)', 'start') + text(sx + 10, (ty + lv) / 2 + 26, 'short', 22, 'var(--sim-bad)', 'start');
      else svg += text(sx + 10, (ty + lv) / 2 + 6, `${rs(GOAL - total)} short`, 24, 'var(--sim-bad)', 'start');
    }
    if (!first) svg += text(jx, G.cap, 'what was left', 20, 'var(--sim-label-muted)', 'middle', 700);
    if (!first) svg += text(P ? 195 : 548, G.note, 'made-up numbers', 15, 'var(--sim-label-muted)', P ? 'middle' : 'end', 700);
    if (first) {
      if (P) svg += text(jx, G.cap, 'kept on day 1', 20, 'var(--sim-label-muted)', 'middle', 700);
      const ex = P ? 195 : 318, fs = P ? 22 : 25;
      svg += `<text x="${ex}" y="${G.eq[0]}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs}px var(--sim-font)">expenses = income - <tspan style="fill:${shade(TONE.save, 80)}">savings</tspan></text>`;
      svg += `<text x="${ex}" y="${G.eq[1]}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs}px var(--sim-font)">1,000 = 1,500 - <tspan style="fill:${shade(TONE.save, 80)}">500</tspan></text>`;
    }
    if (!this.anim) over += `<div class="bs-ab" style="left:${G.btn[0]}px;top:${P && first ? G.cap : G.btn[1]}px"><button type="button" class="sv-hit bs-btn" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  // b2: Meera's month as one bar.
  paintBudget(P) {
    let svg = '';
    const G = P
      ? { paper: [62, 96, 70], pl: [116, 92, 118], x0: 20, x1: 370, by: 250, bh: 116, brace: 212, inc: 188, first: 420, fs: [21, 28] }
      : { paper: [74, 92, 76], pl: [138, 88, 118], x0: 36, x1: 524, by: 236, bh: 120, brace: 196, inc: 172, first: 410, fs: [23, 32] };
    svg += paper(G.paper[0], G.paper[1], G.paper[2]);
    svg += text(G.pl[0], G.pl[1], 'written plan', P ? 26 : 28, 'var(--sim-label)', 'start');
    svg += text(G.pl[0], G.pl[2], 'made in advance', 19, 'var(--sim-label-muted)', 'start', 700);
    const W = G.x1 - G.x0, xs = G.x0 + W / 3;
    svg += `<path d="M${G.x0} ${G.brace + 10}V${G.brace}H${G.x1}V${G.brace + 10}" ${stroke('var(--sim-label)', 3)}/>`;
    svg += text((G.x0 + G.x1) / 2, G.inc, `${rs(1500)} comes in`, P ? 26 : 28);
    const seg = (x, w, col, lab, amt, d) => {
      const edge = shade(col, 64);
      return `<g class="mk-grow" style="--d:${d}s"><rect x="${f1(x)}" y="${G.by + 4}" width="${f1(w)}" height="${G.bh}" rx="14" ${fill(edge)}/>`
        + `<rect x="${f1(x)}" y="${G.by}" width="${f1(w)}" height="${G.bh}" rx="14" ${fill(`color-mix(in oklab, ${col} 40%, var(--sim-bg-surface))`, `stroke:${edge};stroke-width:3`)}/>`
        + text(x + w / 2, G.by + G.bh * 0.4, lab, G.fs[0], 'var(--sim-label)', 'middle', 700)
        + text(x + w / 2, G.by + G.bh * 0.78, rs(amt), G.fs[1]) + '</g>';
    };
    svg += seg(G.x0, W / 3 - 3, TONE.save, 'savings', 500, 0.1);
    svg += seg(xs + 3, W * 2 / 3 - 3, 'var(--sim-series-1)', 'expenses', 1000, 0.6);
    const fx = G.x0 + W / 6;
    svg += `<path d="M${f1(fx)} ${G.by + G.bh + 12}l-10 14h20z" ${fill('var(--sim-accent)')}/>`;
    svg += text(fx, G.first, 'first', 24, 'var(--sim-accent)');
    return { svg };
  }

  testState() {
    const v = this.stepIndex, amts = v === 1 ? FIRST : LEFT;
    return { view: v, n: this.n, total: v === 2 ? null : amts.slice(0, this.n).reduce((s, a) => s + a, 0), anim: this.anim };
  }
}
