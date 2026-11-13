/**
 * EquilibriumGraphScene - L05 s04, the market plane from the source's Fig. 9.7.
 *
 * Beats: 0 the demand line DM-DM' falling from the top-left and the supply line SM-SM' climbing
 * from the bottom-left, crossing at E; 1 the dashed guides from E to Rs 100 on the price axis and
 * to 12 kg on the quantity axis; 2 a marker the learner drags anywhere in the plane - off E the
 * price is being pushed up or pushed down, and only on E nothing is pushing at all.
 *
 * The two lines are the source figure's straight lines, not a fit through Table 9.3: those three
 * rows are not collinear with E, so no table row is plotted here (see GENERATION-LOG, Stage 3 L05).
 */
import { SvgScene, chip, fill, stroke, shade, tone } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg } from 'simulations/base/kit/SimChart.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i }]);

// The chapter's own numbers: E = (12 kg, Rs 100). Axes are round numbers only, so Rs 100 and
// 12 kg are printed once - on the guides, exactly as Fig. 9.7 prints them.
const P_MIN = 0, P_MAX = 160, Q_MIN = 0, Q_MAX = 48;
const EQ = { q: 12, p: 100 };
const D_SLOPE = -3.2, S_SLOPE = 2.8;
const demand = (q) => EQ.p + D_SLOPE * (q - EQ.q);
const supply = (q) => EQ.p + S_SLOPE * (q - EQ.q);

const DEM = tone(3);        // demand: the falling line
const SUP = tone(1);        // supply: the rising line
const GUIDE = tone(5);      // the dashed guides, as the source draws them in blue
const SNAP_PX = 20;         // a marker this close to E in stage px IS E

// One muted line at the foot: what the model leaves out, never the slide's own sentence.
const NOTES = [
  'Both lines are straight, the way the chapter draws them - a real demand curve bends.',
  'The two readings come off the axes, so the guides can be read in either order.',
  'The tug is read from the price side: above Rs 100 sellers cut, below it buyers bid up.',
];

/** Rupee sign as an escape: the write tool decodes \\uXXXX into a raw glyph. */
const rupee = (v) => `\u20b9${Math.round(v)}`;

/** One SVG text run. `col` may be a CSS colour or a tone() string. */
const txt = (x, y, s, o = {}) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''} ${fill(o.col ?? 'var(--sim-label)')} style="font-size:${o.size ?? 17}px">${esc(s)}</text>`;

/** Liang-Barsky: the part of a stage-space segment that lies inside the plot box. */
function clipSeg(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1;
  const dx = x1 - x0, dy = y1 - y0;
  const p = [-dx, dx, -dy, dy];
  const q = [x0 - b.x, b.x + b.w - x0, y0 - b.y, b.y + b.h - y0];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return null; continue; }
    const r = q[i] / p[i];
    if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
    else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [{ x: x0 + t0 * dx, y: y0 + t0 * dy }, { x: x0 + t1 * dx, y: y0 + t1 * dy }];
}

export class EquilibriumGraphScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  // The host budgets the panel from these; sim-layout names the tallest state it measures
  // (the head row of three chips plus a wrapped note line).
  static HEIGHT = 570;
  static PORTRAIT_HEIGHT = 670;
  static ARIA_LABEL =
    'A price against quantity plane. The demand line DM to DM prime falls from the top left to the '
    + 'bottom right and the supply line SM to SM prime rises from the bottom left to the top right. '
    + 'They cross at a dot labelled E, at 12 kilograms and Rs 100 a kilogram, and dashed guides '
    + 'from E reach the price axis at Rs 100 and the quantity axis at 12 kilograms. On the last '
    + 'step a marker can be dragged anywhere on the plane: a level dashed line shows its price, a '
    + 'chip beside it reads price pushed up below Rs 100, price pushed down above it, and no '
    + 'pressure at all when the marker sits on E.';
  // The stub names no dials, and the only thing a learner touches is the marker on the plane, so
  // there is no control bar.
  static CONTROLS = [];

  css() {
    return `.egv-note { margin-top: var(--sim-space-2); }
.egv-mark { cursor: grab; touch-action: none; }
.egv-mark:active { cursor: grabbing; }
@media (prefers-reduced-motion: reduce) { .egv-mark .sv-breathe { animation: none; } }`;
  }

  /** The note line lives in the flow under the stage, so the plane is never covered. */
  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `<div class="egv-note">${noteLineHtml([{ text: NOTES[0] }])}</div>`);
    this._note = this.root.querySelector('.egv-note');
  }

  /** The host can open straight on beat 2, so the note follows the beat and not the mount. */
  onBeatChange(beatIndex, beatCount) {
    super.onBeatChange(beatIndex, beatCount);
    if (this._note) this._note.innerHTML = noteLineHtml([{ text: NOTES[Math.min(2, Math.max(0, this.stepIndex | 0))] }]);
  }

  /** Nothing here moves by itself: the two line strokes and the pop-ins are one-shot CSS. */
  busy() { return false; }

  /**
   * Each beat owns what it adds, so a learner who drags the marker on beat 2 and steps back keeps
   * the marker but loses the celebration. The figure itself is never rebuilt or reset.
   */
  enter(step) {
    this.mk = { ...EQ };
    this.won = false;
    this.touched = false;
    this.fresh = true;
  }

  stageHeight(st) { return st.portrait ? 520 : 440; }

  /** Axes, grid and the plot box, for this orientation. Rs 100 and 12 kg are NOT ticks. */
  frame(st) {
    return chartFrame({
      rect: { x: 0, y: 0, w: st.W, h: st.H },
      x: { min: Q_MIN, max: Q_MAX, ticks: [0, 20, 40], label: 'Quantity (kg)' },
      y: { min: P_MIN, max: P_MAX, ticks: [0, 50, 150], label: 'Price (\u20b9 per kg)' },
    });
  }

  /** The marker's data point, clamped inside the plane, with E's magnet: close enough IS E. */
  markFrom(p, f) {
    const q = Math.max(1.5, Math.min(Q_MAX - 1.5, f.vx(p.x)));
    const pr = Math.max(5, Math.min(P_MAX - 5, f.vy(p.y)));
    if (Math.hypot(f.px(q) - f.px(EQ.q), f.py(pr) - f.py(EQ.p)) <= SNAP_PX) return { ...EQ };
    return { q, p: pr };
  }

  onE(f) { return Math.hypot(f.px(this.mk.q) - f.px(EQ.q), f.py(this.mk.p) - f.py(EQ.p)) <= SNAP_PX; }

  /** The tug, read from the price alone: the chapter's own rule, and the reason the marker's
   *  quantity does not change the chip. `up` below the balance, `down` above it, none only on E. */
  tug(f) { return this.onE(f) ? 'none' : (this.mk.p < EQ.p ? 'up' : 'down'); }

  // ---- input ------------------------------------------------------------------------------------

  pointerDown(p) {
    if (this.stepIndex !== 2) return false;
    const f = this.frame(this.sv), b = f.plot;
    if (p.x < b.x - 12 || p.x > b.x + b.w + 12 || p.y < b.y - 12 || p.y > b.y + b.h + 12) return false;
    this._move = true;
    this.touched = true;
    this.fresh = false;
    this.mk = this.markFrom(p, f);
    return true;
  }

  pointerMove(p) {
    if (!this._move) return false;
    this.mk = this.markFrom(p, this.frame(this.sv));
    return true;
  }

  /** The concept is found when a marker that has been away from E comes back onto it. */
  pointerUp() {
    if (!this._move) return;
    this._move = false;
    const f = this.frame(this.sv);
    if (this.touched && !this.won && this.onE(f)) { this.won = true; this.celebrate(); }
  }

  // ---- painting ---------------------------------------------------------------------------------

  /** One straight line, clipped to the plot box, in its own ink with a shade under it. */
  lineSvg(f, fn, col, delay) {
    const b = f.plot, q0 = Q_MIN - 2, q1 = Q_MAX + 2;
    const seg = clipSeg(f.px(q0), f.py(fn(q0)), f.px(q1), f.py(fn(q1)), b);
    if (!seg) return '';
    const d = `M${seg[0].x.toFixed(1)} ${seg[0].y.toFixed(1)}L${seg[1].x.toFixed(1)} ${seg[1].y.toFixed(1)}`;
    // --len and --d ride INSIDE stroke()'s extra: a second style attribute would be dropped by the
    // parser, and the path would lose its colour and never draw at all.
    const cls = this.fresh ? 'sv-draw' : '';
    const extra = cls ? `--len:1;--d:${delay}s` : '';
    return `<path d="${d}" pathLength="1" class="${cls}" ${stroke(shade(col, 60), 7, extra)}/>`
      + `<path d="${d}" pathLength="1" class="${cls}" ${stroke(col, 4.5, extra)}/>`;
  }

  /**
   * The four end labels DM / DM' / SM / SM', where each line leaves the plane, plus the plain name
   * of each line set along its own middle in that line's ink. The names live on the plane, not in
   * the head row: three head chips wrap the head onto two rows and the panel then jumps on a beat.
   */
  endsSvg(f) {
    const dmL = { x: f.px(Q_MIN), y: f.py(demand(Q_MIN)) };
    const dmR = { x: f.px(EQ.q + EQ.p / -D_SLOPE), y: f.py(0) };
    const smL = { x: f.px(Q_MIN), y: f.py(supply(Q_MIN)) };
    const smR = { x: f.px(EQ.q + (P_MAX - EQ.p) / S_SLOPE), y: f.py(P_MAX) };
    const dmMid = { x: f.px(24), y: f.py(demand(24)) };
    const smMid = { x: f.px(24), y: f.py(supply(24)) };
    // Each end label sits in the empty corner its own line points at, never across the stroke; each
    // name sits off its own line, on the side away from E.
    return txt(dmL.x + 10, dmL.y - 10, 'DM', { col: DEM, size: 19 })
      + txt(dmR.x + 10, dmR.y - 12, "DM'", { col: DEM, size: 19 })
      + txt(smL.x + 10, smL.y + 22, 'SM', { col: SUP, size: 19 })
      + txt(smR.x + 10, smR.y + 22, "SM'", { col: SUP, size: 19 })
      + txt(dmMid.x + 14, dmMid.y + 26, 'demand', { col: DEM, size: 17 })
      + txt(smMid.x + 12, smMid.y + 23, 'supply', { col: SUP, size: 17 });
  }

  /**
   * A level's price, printed at the left end of its own dashed line just inside the plot. It cannot
   * sit in the axis margin: the margin is only as wide as the rotated axis title, so a bold reading
   * there overlaps it. Nothing else lives in that corner - both curves are clear of it. A level
   * within a few rupees of a tick is left to the tick, so the two readings never crowd each other.
   */
  levelReading(f, y, col, s, price) {
    if (price != null && [0, 50, 150].some((t) => Math.abs(price - t) < 7)) return '';
    return txt(f.plot.x + 8, y - 9, s, { col, size: 18 });
  }

  /** The two dashed guides and their readings, in the source's blue. */
  guidesSvg(f) {
    const b = f.plot, ex = f.px(EQ.q), ey = f.py(EQ.p);
    const g = `M${ex.toFixed(1)} ${ey.toFixed(1)}H${b.x}M${ex.toFixed(1)} ${ey.toFixed(1)}V${b.y + b.h}`;
    return `<g class="${this.fresh ? 'sv-pop' : ''}" style="--d:0.5s">`
      + `<path d="${g}" ${stroke(GUIDE, 2.5, 'stroke-dasharray:7 6;opacity:0.9')}/>`
      + `<rect x="${b.x - 2}" y="${ey - 1.5}" width="6" height="3" ${fill(GUIDE)}/>`
      + `<rect x="${ex - 1.5}" y="${b.y + b.h - 1}" width="3" height="6" ${fill(GUIDE)}/>`
      + this.levelReading(f, ey, GUIDE, rupee(EQ.p))
      + txt(ex, b.y + b.h + 26, '12 kg', { col: GUIDE, size: 19, anchor: 'middle' })
      + '</g>';
  }

  /** E itself: a dot and its letter, drawn from beat 0 on. */
  dotSvg(f) {
    const ex = f.px(EQ.q), ey = f.py(EQ.p);
    const pop = this.fresh && this.stepIndex === 0 ? ' class="sv-pop" style="--d:0.7s"' : '';
    return `<g${pop}><circle cx="${ex}" cy="${ey}" r="13" ${fill(tone(4), 'opacity:0.28')}/>`
      + `<circle cx="${ex}" cy="${ey}" r="7.5" ${fill(tone(4), 'stroke:var(--sim-bg-surface);stroke-width:2.5')}/>`
      + txt(ex + 17, ey - 14, 'E', { col: tone(4), size: 21 }) + '</g>';
  }

  /** The draggable marker, its level to the price axis, and the arrow of the push. */
  markerSvg(f) {
    const b = f.plot, t = this.tug(f);
    const x = f.px(this.mk.q), y = f.py(this.mk.p);
    const col = t === 'none' ? 'var(--sim-good)' : 'var(--sim-warning)';
    let svg = `<path d="M${x.toFixed(1)} ${y.toFixed(1)}H${b.x}" ${stroke(col, 2.5, 'stroke-dasharray:6 6;opacity:0.85')}/>`;
    // On E the marker is a green RING, so the chapter's own dot stays visible underneath it: the
    // two marks are the same point, and saying so is the whole beat.
    svg += t === 'none'
      ? `<g class="egv-mark"><circle cx="${x}" cy="${y}" r="19" fill="none" ${stroke(col, 3.5)}/></g>`
      : `<g class="egv-mark${this.touched ? '' : ' sv-breathe'}">`
        + `<circle cx="${x}" cy="${y}" r="20" ${fill(col, 'opacity:0.22')}/>`
        + `<circle cx="${x}" cy="${y}" r="10" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:3')}/></g>`;
    // The marker's own price, on its own level, in the marker's ink - unless it is sitting on E,
    // where beat 1 already printed Rs 100, or so near the axis that the dot would cover it.
    if (t !== 'none' && x - b.x > 56) svg += this.levelReading(f, y, col, rupee(this.mk.p), this.mk.p);
    if (t !== 'none') {
      // The direction of the push: an arrow beside the marker, never across it.
      const ax = x + 30, ay = t === 'up' ? y - 20 : y + 20, d = t === 'up' ? 1 : -1;
      svg += `<path d="M${ax} ${ay - 12 * d}L${ax - 9} ${ay + 8 * d}L${ax + 9} ${ay + 8 * d}Z" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:2.5;stroke-linejoin:round')}/>`;
    }
    return { svg, over: '' };
  }

  /**
   * Exactly ONE chip in the head row on every beat, so the panel is the same height on all three
   * (an empty head collapses to zero height and the stage would jump between beats). It names what
   * the beat is about, and on beat 2 it becomes the live tug.
   */
  headChip(f) {
    if (this.stepIndex < 2) {
      return chip(['demand and supply', 'the guides at E'][this.stepIndex], 0, 0, { tone: 2, size: 'big', static: true });
    }
    if (!this.touched) return chip('drag the marker', 0, 0, { tone: 2, size: 'big', static: true });
    const t = this.tug(f);
    return chip(t === 'none' ? 'no pressure' : `price pushed ${t}`, 0, 0, {
      tone: t === 'none' ? 'good' : 'warning', size: 'big', static: true,
    });
  }

  paint(st) {
    const f = this.frame(st);
    let svg = axesSvg(f, {}).svg;
    if (this.stepIndex >= 1) svg += this.guidesSvg(f);
    svg += this.lineSvg(f, demand, DEM, '0s') + this.lineSvg(f, supply, SUP, '0.35s') + this.endsSvg(f) + this.dotSvg(f);
    if (this.stepIndex >= 2) svg += this.markerSvg(f).svg;
    this.fresh = false;
    return { svg, over: '', head: this.headChip(f) };
  }
}
