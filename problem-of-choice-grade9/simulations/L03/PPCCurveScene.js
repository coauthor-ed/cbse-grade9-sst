/**
 * PPCCurveScene - L03 s02 "The Production Possibility Curve" (3 beats).
 *   b0 curve:  the axes build (Barley (kg) across, Wheat (kg) up); the table's five points A to E pop in one by
 *              one, each with dashed guides to its two axis numbers. The ticks are the table values.
 *   b1 inside: the points stay; the smooth curve draws through them, bowing outward. The curve is the hero.
 *   b2 beyond: the region under the curve fills softly; F (50, 50) pops inside ("inside: idle land or labour"),
 *              X (75, 60) outside ("outside: not possible"); a short "PPC" tag on the curve. At rest a handle sits
 *              on C: the learner drags it along the curve, and it snaps to A to E, so the readout never shows a
 *              spline decimal. Tapping F or X reads them too (the named cases: on, inside, outside).
 * The curve: the table is exactly wheat = 100 - 0.2 b - 0.008 b^2 (second differences -10 each), so the drawn
 * curve passes through every table point and bows outward. Only the table numbers and F, X are used.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { ease, dur } from 'simulations/base/kit/SimAnim.js';
import { plotFrame, plotPanelSvg, axesOnSvg, plotLineSvg, toScreen, AXES } from 'simulations/base/kit/SimPlotSvg.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PTS = [['A', 0, 100], ['B', 25, 90], ['C', 50, 70], ['D', 75, 40], ['E', 100, 0]];
const F = { k: 'F', b: 50, w: 50, tone: 'warning', l1: 'inside:', l2: 'idle land or labour' };
const X = { k: 'X', b: 75, w: 60, tone: 'bad', l1: 'outside:', l2: 'not possible' };
const wheatAt = (b) => 100 - 0.2 * b - 0.008 * b * b;
const CURVE = Array.from({ length: 51 }, (_, i) => [i * 2, wheatAt(i * 2)]);
const POP0 = AXES.end + 0.1, POP_GAP = 0.5, POP_S = 0.4;
const LINE = { dur: 1.8, delay: 0.3, ease: ease.smooth, by: 'x', width: 7, tone: 'accent', headR: 9 };
const B2 = { fill: 0.45, f: 0.5, x: 1.1, hand: 1.6, end: 2.1 };
const END = [POP0 + 4 * POP_GAP + POP_S + 0.2, LINE.delay + LINE.dur + 0.6, B2.end];
const f1 = (v) => (+v).toFixed(1);
const clamp01 = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u);
const popK = (u) => { const q = clamp01(u); return q >= 1 ? 1 : 1 + 2.2 * (q - 1) ** 3 + 1.2 * (q - 1) ** 2; };

const CSS = `
.pc-read { display: inline-block; padding: 5px 16px; border-radius: var(--look-pill, 999px); white-space: nowrap;
  font: 800 19px/1.25 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: calc(2.5px * var(--look-rim, 1)) solid var(--c, var(--sim-accent)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c, var(--sim-accent)); }
.pc-read b { color: var(--c, var(--sim-accent)); }
.pc-head { display: inline-block; font: 800 19px/1.25 var(--sim-font); color: var(--sim-label-muted); }
.pc-head b { color: var(--sim-accent); }
.pc-btn { min-height: 44px; min-width: 64px; padding: 6px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 17px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.pc-btn:active { transform: translateY(3px); box-shadow: none; }
.pc-pt { position: absolute; transform: translate(-50%, -50%); width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; }
.pc-btn:focus-visible, .pc-pt:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
svg .pc-ring { transform-box: fill-box; transform-origin: center; animation: pc-ring 1.4s ease-out 3; }
@keyframes pc-ring { 0% { transform: scale(0.7); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { svg .pc-ring { animation: none; opacity: 0; } }
`;

export class PPCCurveScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A graph with barley in kg across and wheat in kg up. The farmer\'s five choices A to E: 0 and 100, 25 and 90, 50 and 70, 75 and 40, 100 and 0. A smooth curve joins them and bows outward. Point F, 50 barley and 50 wheat, lies inside the curve: idle land or labour. Point X, 75 barley and 60 wheat, lies outside: not possible. Drag the dot along the curve to read each point.';

  async setup() {
    this.at = 2;          // handle on C
    this.pick = null;     // null: the handle; 'F' or 'X': a tapped case
    this.moved = false;
    this.dragging = false;
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

  stageHeight(st) { return st.portrait ? 470 : 352; }   // landscape: fits above the 1280x720 footer

  enter(step) {
    this.at = 2;
    this.pick = null;
    this.moved = false;
    this.dragging = false;
    this.play(END[step] ?? 1);
    this.after(dur(END[step] ?? 1) + 0.05, () => this.repaint());   // the rest state's buttons (Replay, the point taps)
  }

  act(a, v) {
    if (a === 'skip') { this.skip(); this.repaint(); return; }
    if (a === 'replay') { this.clockReset(); this.enter(this.stepIndex); this.repaint(); return; }
    if (this.stepIndex !== 2) return;
    if (this.isPlaying()) this.skip();
    if (a === 'pt') {
      const i = PTS.findIndex((p) => p[0] === v);
      if (i >= 0) { this.at = i; this.pick = null; } else if (v === 'F' || v === 'X') this.pick = v;
      this.moved = true;
      this.repaint();
    }
  }

  /** The chart frame for this stage size and beat. */
  geo(st) {
    const P = st.portrait, top = P ? 6 : 4, step = this.stepIndex;
    const rect = { x: P ? 0 : 6, y: top, w: st.W - (P ? 0 : 12), h: st.H - top - 6 };
    let yt = [0, 40, 70, 90, 100];
    if (step === 2) {
      const hw = this.pick ? (this.pick === 'F' ? F.w : X.w) : PTS[this.at][2];
      yt = [...new Set([0, 100, hw])].sort((a, b) => a - b);
    }
    const f = plotFrame(rect, { x: { min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: 'Barley (kg)' }, y: { min: 0, max: 100, ticks: yt, label: 'Wheat (kg)' } });
    return { P, f, rect, pts: toScreen(f, CURVE), base: f.plot.y + f.plot.h, left: f.plot.x };
  }

  pointerDown(p) {
    if (this.isPlaying()) { this.skip(); this.repaint(); return false; }
    if (this.stepIndex !== 2 || !this.sv) return false;
    const g = this.geo(this.sv);
    const near = (b, w, r) => Math.hypot(p.x - g.f.px(b), p.y - g.f.py(w)) < r;
    if (near(F.b, F.w, 26)) { this.pick = 'F'; this.moved = true; this.repaint(); return false; }
    if (near(X.b, X.w, 26)) { this.pick = 'X'; this.moved = true; this.repaint(); return false; }
    const b = g.f.vx(p.x);
    if (b < -12 || b > 112) return false;
    const onCurve = Math.abs(p.y - g.f.py(wheatAt(Math.max(0, Math.min(100, b))))) < 46;
    if (!onCurve) return false;
    this.dragging = true;
    this.snapTo(b);
    return true;
  }

  pointerMove(p) {
    if (!this.dragging || !this.sv) return false;
    return this.snapTo(this.geo(this.sv).f.vx(p.x));
  }

  pointerUp() { this.dragging = false; }

  /** Snap the handle to the nearest table point by barley; true if it moved. */
  snapTo(b) {
    const i = Math.max(0, Math.min(4, Math.round(b / 25)));
    const was = this.at, wasPick = this.pick;
    this.at = i; this.pick = null; this.moved = true;
    if (i !== was || wasPick) { this.repaint(); return true; }
    return false;
  }

  paint(st) {
    const g = this.geo(st), step = this.stepIndex, playing = this.isPlaying();
    let svg = plotPanelSvg(g.f), over = '', head = '';
    const corner = (act, label) => `<button type="button" class="pc-btn" data-act="${act}">${label}</button>`;
    let btn = '';
    if (step < 2) btn = corner(playing ? 'skip' : 'replay', playing ? 'Skip' : 'Replay');   // b2: a tap on the board skips

    if (step === 0) head = '<span class="pc-head">The table as <b>5 points</b></span>';
    else if (step === 1) head = '<span class="pc-head">On the curve: <b>all in use</b></span>';
    else {
      const c = this.pick ? (this.pick === 'F' ? F : X) : null;
      const [k, b, w] = c ? [c.k, c.b, c.w] : PTS[this.at];
      const tone = c ? `var(--sim-${c.tone})` : 'var(--sim-accent)';
      head = `<span class="pc-read" style="--c:${tone}"><b>${k}:</b> barley ${b} kg, wheat ${w} kg</span>`;
      {
        PTS.forEach(([n, pb2, pw]) => { over += `<button type="button" class="sv-hit pc-pt" data-act="pt" data-val="${n}" aria-label="point ${n}: barley ${pb2} kg, wheat ${pw} kg" style="left:${f1(g.f.px(pb2))}px;top:${f1(g.f.py(pw))}px"></button>`; });
        for (const c2 of [F, X]) over += `<button type="button" class="sv-hit pc-pt" data-act="pt" data-val="${c2.k}" aria-label="point ${c2.k}: barley ${c2.b} kg, wheat ${c2.w} kg, ${c2.l1} ${c2.l2}" style="left:${f1(g.f.px(c2.b))}px;top:${f1(g.f.py(c2.w))}px"></button>`;
      }
    }
    return { svg, over, head: head + btn };
  }

  animate(st, t) {
    const live = this.live, g = this.geo(st), f = g.f, step = this.stepIndex;
    axesOnSvg(live, 'axes', f, step === 0 ? t : 99, { grid: false, size: 16 });

    // b2: the soft fill under the curve, under everything else.
    if (step === 2) {
      const a = clamp01(t / B2.fill);
      const d = `M${f1(g.left)} ${f1(g.base)}` + g.pts.map((p) => `L${f1(p[0])} ${f1(p[1])}`).join('') + 'Z';
      const e = live.shape('area', 'path');
      live.attrs(e, { d });
      live.css(e, { fill: 'var(--sim-accent)', opacity: (0.16 * a).toFixed(3) });
      if (a < 1) live.more();
    }

    // The curve: draws on in b1, rests in b2.
    if (step >= 1) {
      plotLineSvg(live, 'curve', g.pts, step === 1 ? t : 99, { ...LINE, head: step === 1 && t < LINE.delay + LINE.dur });
    }

    // Guides (b0: every table point, as it lands; b2: the handle or the tapped case).
    const guide = (key, b, w, col, a, wide) => {
      const x = f.px(b), y = f.py(w);
      const e = live.shape(key, 'path');
      live.attrs(e, { d: `M${f1(g.left)} ${f1(y)}H${f1(x)}V${f1(g.base)}` });
      live.css(e, { fill: 'none', stroke: col, 'stroke-width': wide ? 3 : 2, 'stroke-dasharray': '7 6', opacity: a.toFixed(3) });
    };

    PTS.forEach(([n, b, w], i) => {
      let k = 1, a = 1;
      if (step === 0) { k = popK((t - POP0 - i * POP_GAP) / POP_S); a = clamp01((t - POP0 - i * POP_GAP) / 0.15); }
      if (k <= 0 || a <= 0) return;
      const lit = step === 2 && !this.pick && i === this.at;
      const dim = step === 2 && !lit ? 0.5 : step === 1 ? 0.85 : 1;
      if (step === 0) guide(`g${n}`, b, w, 'var(--sim-label-muted)', 0.55 * a, false);
      if (lit) guide(`g${n}`, b, w, 'var(--sim-accent)', 0.9, true);
      this.dot(live, `p${n}`, f.px(b), f.py(w), (step === 1 ? 8 : 10) * k, lit ? 'var(--sim-accent)' : 'var(--sim-label)', dim);
      this.letter(live, `l${n}`, n, b, w, f, g.P, a * dim, lit ? 'var(--sim-accent)' : 'var(--sim-label)');
    });
    if (step === 0 && t < END[0]) live.more();

    if (step === 2) {
      for (const c of [F, X]) {
        const at = c === F ? B2.f : B2.x, k = popK((t - at) / POP_S);
        if (k <= 0) { live.more(); continue; }
        const col = `var(--sim-${c.tone})`, on = this.pick === c.k;
        if (on) guide(`g${c.k}`, c.b, c.w, col, 0.9, true);
        this.dot(live, `p${c.k}`, f.px(c.b), f.py(c.w), 11 * k, col, 1, true);
        this.letter(live, `l${c.k}`, c.k, c.b, c.w, f, g.P, clamp01(k), col);
        this.tag(live, `t${c.k}`, c, f, g, clamp01((t - at - 0.15) / 0.3), on);
        if (k < 1) live.more();
      }
      // One short name for the curve: a tag just under its top part, with a leader up to the line.
      const tb = 12, cx = f.px(tb), cy = f.py(wheatAt(tb)), tx = cx + 4, ty = cy + 44;
      const a = clamp01((t - 0.2) / 0.3);
      const e = live.shape('ppc', 'g', { html: `<path d="M${f1(cx + 18)} ${f1(ty - 15)}L${f1(cx + 8)} ${f1(cy + 4)}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3;stroke-linecap:round')}/><rect x="${f1(tx)}" y="${f1(ty - 15)}" width="58" height="30" rx="15" ${fill('var(--sim-accent)')}/>`
        + `<text x="${f1(tx + 29)}" y="${f1(ty + 6)}" text-anchor="middle" style="fill:var(--sim-ink-on-accent, var(--sim-bg-deep));font:800 17px var(--sim-font)">PPC</text>` });
      live.css(e, { opacity: a < 1 ? a.toFixed(3) : null });
      // The handle on the curve (or on the tapped case: then the curve point dims).
      if (t >= B2.hand) {
        const [, hb, hw] = PTS[this.at], hx = f.px(hb), hy = f.py(hw);
        const ring = this.moved ? '' : `<circle class="pc-ring" cx="${f1(hx)}" cy="${f1(hy)}" r="20" ${fill('var(--sim-accent)', 'opacity:0.6')}/>`;
        const h = live.shape('hand', 'g', { cls: 'sv-drag', html: `${ring}<circle cx="${f1(hx)}" cy="${f1(hy)}" r="17" ${fill('var(--sim-bg-surface)', `stroke:var(--sim-accent);stroke-width:6;opacity:${this.pick ? 0.55 : 1}`)}/>`
          + `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="6" ${fill('var(--sim-accent)')}/>` });
        live.css(h, { 'pointer-events': 'none' });
      } else live.more();
    }
  }

  dot(live, key, x, y, r, col, a, ring) {
    const e = live.shape(key, 'g', { html: `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(Math.max(0, r))}" ${fill(col, ring ? 'stroke:var(--sim-bg-surface);stroke-width:3' : 'stroke:var(--sim-bg-surface);stroke-width:2.5')}/>` });
    live.css(e, { opacity: a < 1 ? a.toFixed(3) : null });
  }

  /** The point's letter, set outside the curve (up and right), clear of the axes. */
  letter(live, key, n, b, w, f, P, a, col) {
    let dx = 16, dy = -14, anchor = 'start';
    if (n === 'A') { dx = 16; dy = 8; }
    if (n === 'E') { dx = 0; dy = -20; anchor = 'middle'; }
    if (n === 'F') { dx = -16; dy = 7; anchor = 'end'; }
    if (n === 'X') { dx = 16; dy = 7; }
    const e = live.shape(key, 'text', { html: n });
    live.attrs(e, { x: f1(f.px(b) + dx), y: f1(f.py(w) + dy), 'text-anchor': anchor });
    live.css(e, { fill: col, 'font-size': '22px', 'font-weight': '800', 'font-family': 'var(--sim-font-display, var(--sim-font))', opacity: a < 1 ? a.toFixed(3) : null });
  }

  /** A two-line tag: F's under-left of it (inside the filled region), X's above it (outside). */
  tag(live, key, c, f, g, a, on) {
    if (a <= 0) return;
    const x = f.px(c.b), y = f.py(c.w), w = c === F ? (g.P ? 172 : 196) : 136, h = 60, pb = f.plot;
    let tx, ty, lead = '';
    const col = `var(--sim-${c.tone})`;
    if (c === F) {
      // Under F, below the wheat-40 guide, kept left of D's handle (portrait: flush with the plot's left edge).
      tx = g.P ? pb.x + 6 : Math.max(pb.x + 6, Math.min(pb.x + pb.w - w, x - w / 2 - 10)); ty = y + 50;   // below D's guide at 40
    } else {
      // X: in the empty top right corner (outside the curve), a dashed leader down to the point.
      tx = g.rect.x + g.rect.w - w - 8; ty = pb.y + 4;
      lead = `<path d="M${f1(x)} ${f1(ty + h)}L${f1(x)} ${f1(y - 14)}" ${fill('none', `stroke:${col};stroke-width:2.5;stroke-dasharray:5 5`)}/>`;
    }
    const e = live.shape(key, 'g', { html: lead + `<rect x="${f1(tx)}" y="${f1(ty)}" width="${w}" height="${h}" rx="12" ${fill('var(--sim-bg-surface)', `stroke:${col};stroke-width:${on ? 3.5 : 2.5}`)}/>`
      + `<text x="${f1(tx + w / 2)}" y="${f1(ty + 24)}" text-anchor="middle" style="fill:${col};font:800 17px var(--sim-font)">${c.l1}</text>`
      + `<text x="${f1(tx + w / 2)}" y="${f1(ty + 48)}" text-anchor="middle" style="fill:var(--sim-label);font:700 17px var(--sim-font)">${c.l2}</text>` });
    live.css(e, { opacity: a < 1 ? a.toFixed(3) : null });
  }

  testState() { return { step: this.stepIndex, at: PTS[this.at][0], pick: this.pick, playing: this.isPlaying() }; }
}
