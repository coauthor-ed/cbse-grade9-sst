/**
 * SurplusShortageScene - L05 s07, the two gaps of the source's Fig. 9.8.
 *
 * Beats: 0 the demand line DD' falling from the top left and the supply line SS' climbing from the
 * bottom left, crossing at E with its two dashed guides (Rs 250 and 30 kg); 1 the Rs 300 level with
 * A on DD' and B on SS' and the band between them filled as a surplus; 2 the Rs 150 level with C on
 * SS' and F on DD' as a shortage, each band now carrying a dashed arrow toward E's level.
 *
 * Fig. 9.8's own numbers, not Table 9.3's (see the design note): E = (30 kg, Rs 250), one slope of
 * 25/3 rupees per kg each way, which reproduces the figure's own four derived point readings
 * exactly - 24/36 kg at Rs 300 and 18/42 kg at Rs 150.
 *
 * On beats 0-1 a tap on a band reveals that band's two end quantities (each beat's own sentence is a
 * read of them). On beat 2 a tap walks that band's price level to E, so the gap closes on E - the
 * slide's "the price itself is the market's repair mechanism", watched rather than asserted.
 */
import { SvgScene, chip, fill, stroke, shade, tone } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg } from 'simulations/base/kit/SimChart.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i }]);

// Fig. 9.8's own axis ticks. 30 kg is deliberately NOT a quantity tick: it is E's own reading and
// is printed once, on its guide. The Rs 300 level needs no reading of its own - the tick says 300.
const P_MIN = 0, P_MAX = 400, Q_MIN = 0, Q_MAX = 50;
const P_TICKS = [100, 200, 300, 400];
const Q_TICKS = [10, 20, 40, 50];
const EQ = { q: 30, p: 250 };
const K = 25 / 3;                          // rupees per kg, the same on both lines
const demandP = (q) => EQ.p - K * (q - EQ.q);
const supplyP = (q) => EQ.p + K * (q - EQ.q);
const demandQ = (p) => EQ.q + (EQ.p - p) / K;
const supplyQ = (p) => EQ.q + (p - EQ.p) / K;

const DEM = tone(3);        // demand: the falling line, as the figure draws it in blue
const SUP = tone(1);        // supply: the rising line, as the figure draws it in green
const GUIDE = tone(5);      // E's dashed guides, in the figure's own blue

// One entry per gap. `dL`/`sL` are the figure's own letters for the demand-side and supply-side end
// of the band; which of them is on the left flips with the level, so the pair is read, never fixed.
// The two gap inks are red and amber: neither is either curve's emerald/sky, and neither is E's pink.
const BANDS = [
  { key: 'hi', home: 300, n: 6, name: 'surplus', dL: 'A', sL: 'B' },
  { key: 'lo', home: 150, n: 2, name: 'shortage', dL: 'F', sL: 'C' },
];
const BAND = Object.fromEntries(BANDS.map((b) => [b.key, { ...b, ink: tone(b.n) }]));

const WALK_RATE = 62;       // rupees per second, so Rs 300 -> E takes 0.8 s and Rs 150 -> E 1.6 s
const WALK_DT = 0.055;      // the walk is a short timer chain, not a frame loop (check-scene: no _tick here)
const BAND_H = 9;           // half height of the filled band, in stage px

// One muted line at the foot: what the model leaves out or what the gap is, never the slide's prose.
const NOTES = [
  'both lines are straight, the way the chapter draws them - a real demand curve bends',
  'the gap is the space between the two curves at one price, not a third thing',
  'the curves do not move - the price moves, and the gap goes with it',
];

/** One SVG text run. `col` may be a CSS colour or a tone() string. */
const txt = (x, y, s, o = {}) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''} ${fill(o.col ?? 'var(--sim-label)')} style="font-size:${o.size ?? 17}px">${esc(s)}</text>`;

/**
 * A price: the rupee sign DRAWN and the digits left as real text. `fc-list :charset=20b9` is empty in
 * the render container, so a `\u20b9` text run is a tofu box in every shot here - the same drawn glyph
 * MangoMarketScene, SellerStallScene, MarketTableScene and PriceCeilingFloorScene use, so every price
 * in this bundle reads the same. The glyph's ink follows `col`, so a reading can be printed in its own
 * band's ink.
 */
function priceSvg(x, y, v, o = {}) {
  const k = (o.size ?? 18) / 11.25;
  const glyph = `<path transform="translate(${x.toFixed(1)} ${(y - 11.2 * k).toFixed(1)}) scale(${k.toFixed(3)})" `
    + 'd="M2.3 3.1h9.4M2.3 5.8h9.4M3.7 3.1v8.1M3.7 3.1h3.7a2.4 2.4 0 0 1 0 4.8H3.7M7.3 7.9l4.7 3.3" fill="none" '
    + stroke(o.col ?? 'var(--sim-label)', 1.7 / k, 'stroke-linecap:round;stroke-linejoin:round') + '/>';
  return glyph + txt(x + 15.2 * k, y, String(Math.round(v)), o);
}

const kg = (v) => `${Math.round(v)} kg`;

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

export class SurplusShortageScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  // The host budgets the panel from these; sim-layout names the tallest state it measures.
  static HEIGHT = 600;
  static PORTRAIT_HEIGHT = 700;
  static ARIA_LABEL =
    'A price against quantity plane. The demand line D D prime falls from the top left to the '
    + 'bottom right and the supply line S S prime rises from the bottom left to the top right. They '
    + 'cross at a dot labelled E, at 30 kilograms and Rs 250 a kilogram, with dashed guides from E '
    + 'to the price axis at Rs 250 and the quantity axis at 30 kilograms. The first step adds a '
    + 'dashed level at Rs 300, the point A where it meets the demand curve and the point B where it '
    + 'meets the supply curve, with the span between them filled: a surplus. The second step adds a '
    + 'level at Rs 150 with the point C on the supply curve and the point F on the demand curve and '
    + 'its span filled: a shortage. On the last step each span carries a dashed arrow toward the '
    + 'balance level, labelled price down on the surplus and price up on the shortage, and tapping '
    + 'a span walks that price level to E until the gap closes.';
  // The stub names no dials, and the only things a learner touches are the two spans on the plane,
  // so there is no control bar.
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.lvl = { hi: BAND.hi.home, lo: BAND.lo.home };
    this.seen = { hi: false, lo: false };
    this.won = { hi: false, lo: false };
    this._walk = null;
    this.fresh = true;
  }

  css() {
    return `.sss-read { display: flex; flex-direction: column; gap: var(--sim-space-1); margin-top: var(--sim-space-2); }
.sss-read:empty { display: none; }
.sss-row { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sim-space-2);
  font: 700 var(--sim-text-md)/1.25 var(--sim-font); color: var(--sim-label); }
.sss-name { padding: 1px 10px; border: 2px solid currentColor; border-radius: 999px; }
.sss-kv i { font-style: normal; opacity: 0.7; margin-right: 5px; }
.sss-note { margin-top: var(--sim-space-2); }
@media (prefers-reduced-motion: reduce) { .svs .sv-pop, .svs .sv-draw { animation: none; } }`;
  }

  /** The reading row and the note line live in the flow under the stage, so the plane is never covered. */
  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', '<div class="sss-read"></div>'
      + `<div class="sss-note">${noteLineHtml([{ text: NOTES[0] }])}</div>`);
    this._read = this.root.querySelector('.sss-read');
    this._note = this.root.querySelector('.sss-note');
  }

  /** The host can open straight on beat 2, so the note follows the beat and not the mount. */
  onBeatChange(beatIndex, beatCount) {
    super.onBeatChange(beatIndex, beatCount);
    if (this._note) this._note.innerHTML = noteLineHtml([{ text: NOTES[Math.min(2, Math.max(0, this.stepIndex | 0))] }]);
  }

  /**
   * A walk belongs to the stage that started it: entering a beat stops it where it is rather than
   * leaving a run going against the new stage's plane. The figure itself is never rebuilt.
   */
  enter(step) {
    this._walk = null;
    this.fresh = true;
  }

  /** True only while a level is walking: every walk ends on E or on the band's home level. */
  busy() { return !!this._walk; }

  stageHeight(st) { return st.portrait ? 540 : 470; }

  /** Axes, grid and the plot box, for this orientation. */
  frame(st) {
    return chartFrame({
      rect: { x: 0, y: 0, w: st.W, h: st.H },
      x: { min: Q_MIN, max: Q_MAX, ticks: Q_TICKS, label: 'Quantity (kg)' },
      y: { min: P_MIN, max: P_MAX, ticks: P_TICKS, label: 'Price (per kg)' },
    });
  }

  /** Which gaps exist yet: the Rs 300 one from beat 0, the Rs 150 one from beat 1. */
  keys() { return this.stepIndex >= 1 ? ['hi', 'lo'] : ['hi']; }

  /**
   * The two ends of a band's gap at this level: quantities on each curve, left one first. Each end
   * carries the CURVE it stands on (`dd` / `ss`), never a side: above E the demand end is on the left,
   * below E it is on the right, so anything keyed on left/right silently swaps the shortage's two
   * words (the first draft read `C 18 kg wanted`).
   */
  ends(key, f) {
    const p = this.lvl[key], band = BAND[key];
    const dq = demandQ(p), sq = supplyQ(p);
    const dLeft = dq < sq;
    return {
      y: f.py(p),
      left: { q: dLeft ? dq : sq, x: f.px(dLeft ? dq : sq), letter: dLeft ? band.dL : band.sL, ink: dLeft ? DEM : SUP, on: dLeft ? 'dd' : 'ss' },
      right: { q: dLeft ? sq : dq, x: f.px(dLeft ? sq : dq), letter: dLeft ? band.sL : band.dL, ink: dLeft ? SUP : DEM, on: dLeft ? 'ss' : 'dd' },
    };
  }

  // ---- input ------------------------------------------------------------------------------------

  /** The band under a pointer, with a finger-sized target: a closed band's two ends are one point. */
  hitKey(p, f) {
    for (const key of this.keys()) {
      const e = this.ends(key, f);
      let x0 = Math.min(e.left.x, e.right.x), x1 = Math.max(e.left.x, e.right.x);
      if (x1 - x0 < 46) { const c = (x0 + x1) / 2; x0 = c - 23; x1 = c + 23; }
      if (p.x >= x0 - 8 && p.x <= x1 + 8 && Math.abs(p.y - e.y) <= BAND_H + 13) return key;
    }
    return null;
  }

  /**
   * A tap does the beat's own job: read the gap's two ends on beats 0-1, let the price close it on
   * beat 2. A second tap during a walk reverses it, so input is never dropped.
   */
  pointerDown(p) {
    const key = this.hitKey(p, this.frame(this.sv));
    if (!key) return false;
    if (this.stepIndex >= 2) this.walk(key);
    else { this.seen[key] = true; this.animateFor(300); }
    this.repaint();
    return true;
  }

  /**
   * Send this band's level to E, or back out to its own level if it is already on E. The walk is a
   * short chain of `after()` steps (never setTimeout, so a beat change drops it), eased, and always
   * to a finite target - so `busy()` ends on its own.
   */
  walk(key) {
    const from = this.lvl[key];
    const to = Math.abs(from - EQ.p) < 0.5 ? BAND[key].home : EQ.p;
    if (to === EQ.p) this.won[key] = false;   // re-armed: closing the gap again is a new act
    this._walk = { key, from, to, t: 0, dur: Math.max(0.22, Math.abs(to - from) / WALK_RATE) };
    this.animateFor(this._walk.dur * 1000 + 250);
    this.after(WALK_DT, () => this.stepWalk());
  }

  /** One step of the walk. `k` is eased so the level eases into E instead of stopping dead. */
  stepWalk() {
    const w = this._walk;
    if (!w) return;
    w.t += WALK_DT;
    const k = Math.min(1, w.t / w.dur);
    const e = k < 0.5 ? 2 * k * k : 1 - ((-2 * k + 2) ** 2) / 2;
    this.lvl[w.key] = w.from + (w.to - w.from) * e;
    if (k >= 1) {
      this.lvl[w.key] = w.to;
      this._walk = null;
      // The concept, not the press: the gap closing on E. Once per arrival.
      if (w.to === EQ.p && !this.won[w.key]) { this.won[w.key] = true; this.celebrate(); }
    }
    this.repaint();
    if (this._walk) this.after(WALK_DT, () => this.stepWalk());
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
   * The four end labels DD' / SS', where each line leaves the plane, plus each line's own name along
   * its middle. Every label sits in the empty corner or the open wedge its own line points at, never
   * across a stroke: S leaves the plane at the origin, so its label goes below the axis, where the
   * quantity ticks are already 10 kg and further right.
   */
  endsSvg(f) {
    const b = f.plot;
    const dTop = { x: f.px(demandQ(P_MAX)), y: f.py(P_MAX) };
    const dEnd = { x: f.px(Q_MAX), y: f.py(demandP(Q_MAX)) };
    const sStart = { x: f.px(Q_MIN), y: f.py(supplyP(Q_MIN)) };
    const sTop = { x: f.px(supplyQ(P_MAX)), y: f.py(P_MAX) };
    const dMid = { x: f.px(21), y: f.py(demandP(21)) };
    const sMid = { x: f.px(13), y: f.py(supplyP(13)) };
    return txt(dTop.x - 8, dTop.y + 24, 'D', { col: DEM, size: 19, anchor: 'end' })
      + txt(dEnd.x - 8, dEnd.y - 10, "D'", { col: DEM, size: 19, anchor: 'end' })
      + txt(sStart.x + 10, sStart.y + 22, 'S', { col: SUP, size: 19 })
      + txt(sTop.x - 8, sTop.y + 24, "S'", { col: SUP, size: 19, anchor: 'end' })
      + txt(dMid.x - 13, dMid.y + 6, 'demand', { col: DEM, size: 17, anchor: 'end' })
      + txt(sMid.x + 13, sMid.y + 5, 'supply', { col: SUP, size: 17 });
  }

  /** E and its two dashed guides, from beat 0: every later reading is taken against them. */
  eqSvg(f) {
    const b = f.plot, ex = f.px(EQ.q), ey = f.py(EQ.p);
    const g = `M${ex.toFixed(1)} ${ey.toFixed(1)}H${b.x}M${ex.toFixed(1)} ${ey.toFixed(1)}V${b.y + b.h}`;
    const pop = this.fresh && this.stepIndex === 0 ? ' class="sv-pop" style="--d:0.3s"' : '';
    return `<g${pop}><path d="${g}" ${stroke(GUIDE, 2.5, 'stroke-dasharray:7 6;opacity:0.9')}/>`
      + `<rect x="${b.x - 2}" y="${ey - 1.5}" width="6" height="3" ${fill(GUIDE)}/>`
      + `<rect x="${ex - 1.5}" y="${b.y + b.h - 1}" width="3" height="6" ${fill(GUIDE)}/>`
      // Rs 250 is not a tick, so its reading is printed once, at the left end of its own guide, just
      // inside the plot: the axis margin is only as wide as the rotated axis title.
      + priceSvg(b.x + 8, ey - 10, EQ.p, { col: GUIDE, size: 18 })
      // 30 kg is not a tick either, and this is the only place it is printed.
      + txt(ex, b.y + b.h + 26, '30 kg', { col: GUIDE, size: 18, anchor: 'middle' })
      + `<circle cx="${ex}" cy="${ey}" r="13" ${fill(tone(4), 'opacity:0.28')}/>`
      + `<circle cx="${ex}" cy="${ey}" r="7.5" ${fill(tone(4), 'stroke:var(--sim-bg-surface);stroke-width:2.5')}/>`
      + txt(ex + 17, ey - 14, 'E', { col: tone(4), size: 21 })
      + '</g>';
  }

  /**
   * A band's own dashed level across the plot, its filled span between the two curves, and its end
   * dots and letters in each curve's ink - so it is visible WHICH end is the offered one. No number
   * is printed on the plane: the two quantities live in the reading row under the stage, because in
   * a 286 px portrait plot every position beside, under or beyond a band is already taken by a curve
   * or by the price reading (measured: `18 kg` under C is 6 px from the supply line, and beside the
   * band it lands on the `demand` label).
   */
  bandSvg(f, band, i) {
    const b = f.plot, e = this.ends(band.key, f);
    const w = e.right.x - e.left.x;
    const pop = this.fresh ? ` class="sv-pop" style="--d:${(0.2 + i * 0.18).toFixed(2)}s"` : '';
    const lvl = this.lvl[band.key];
    let g = `<g${pop}>`;
    // The level itself: a dashed line to both axes, so the price reads off the price axis.
    g += `<path d="M${b.x} ${e.y.toFixed(1)}H${b.x + b.w}" ${stroke(band.ink, 2.5, 'stroke-dasharray:7 6;opacity:0.8')}/>`;
    // Rs 150 is not a tick and needs its own reading; Rs 300 is a tick and must not print a second
    // number in the same corner.
    if (!P_TICKS.some((t) => Math.abs(lvl - t) < 4)) g += priceSvg(b.x + 8, e.y - 10, lvl, { col: band.ink, size: 18 });
    if (w < 6) {
      // The gap is closed: the two ends are E, so one green ring says "no gap here" instead of two
      // dots and two letters on top of each other.
      return g + `<circle cx="${e.left.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="20" fill="none" ${stroke('var(--sim-good)', 3.5)}/></g>`;
    }
    g += `<rect x="${e.left.x.toFixed(1)}" y="${(e.y - BAND_H).toFixed(1)}" width="${w.toFixed(1)}" height="${BAND_H * 2}" rx="4" ${fill(band.ink, 'opacity:0.28')}/>`
      + `<path d="M${e.left.x.toFixed(1)} ${e.y.toFixed(1)}H${e.right.x.toFixed(1)}" ${stroke(band.ink, 4)}/>`
      + `<rect x="${(e.left.x - 1.5).toFixed(1)}" y="${(e.y - 11).toFixed(1)}" width="3" height="22" rx="1.5" ${fill(band.ink)}/>`
      + `<rect x="${(e.right.x - 1.5).toFixed(1)}" y="${(e.y - 11).toFixed(1)}" width="3" height="22" rx="1.5" ${fill(band.ink)}/>`;
    for (const end of [e.left, e.right]) {
      g += `<circle cx="${end.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="6.5" ${fill(end.ink, 'stroke:var(--sim-bg-surface);stroke-width:2.5')}/>`
        + txt(end.x, e.y - 16, end.letter, { col: end.ink, size: 19, anchor: 'middle' });
    }
    return g + '</g>';
  }

  /**
   * The reading row under the stage: one row per gap the learner has tapped, its name in its own
   * ink, then each end's quantity with the table's own word for it - `wanted` on DD', `offered` on
   * SS' - so the plane's letters join up with MarketTableScene's columns. The band's span width is
   * deliberately absent: the two ends are the numbers and the difference is the learner's own.
   */
  readHtml() {
    const rows = this.keys().filter((key) => this.seen[key]).map((key) => {
      const band = BAND[key], e = this.ends(key, this.frame(this.sv));
      return `<div class="sss-row"><span class="sss-name" style="color:${band.ink}">${band.name}</span>`
        + `<span class="sss-kv"><i>${e.left.letter}</i>${kg(e.left.q)} ${e.left.on === 'dd' ? 'wanted' : 'offered'}</span>`
        + `<span class="sss-kv"><i>${e.right.letter}</i>${kg(e.right.q)} ${e.right.on === 'dd' ? 'wanted' : 'offered'}</span></div>`;
    });
    return rows.join('');
  }

  /**
   * The head row is one line on every beat, so the panel is the same height on all three (an empty
   * head collapses to zero height and the stage would jump between beats). Every chip is `md`: a
   * portrait head is 348 px, and the pairs below are 218 px (beat 0), 250 px (beat 1) and 303 px
   * (beat 2) - at `big` the last pair wraps onto two rows and the panel jumps on the final beat.
   *
   * Beats 0-1: the beat's gap named in ITS OWN ink, then the tap in the guide's violet (neither
   * gap's). The gap's name is a head chip, not a label on the plane: portrait's 286 px plot leaves no
   * room beside either band for a word that is not already touching a curve or the plot edge.
   * Beat 2: the stub's own two repair chips, each in its band's ink - amber `tap: price up` for the
   * shortage below E, red `tap: price down` for the surplus above it - so the pair reads as a legend.
   *
   * The landing pop rides on `fresh` only: the head is rewritten on every repaint, and an ungated
   * `sv-pop` class restarted on each frame of a walk and never finished.
   */
  headChips() {
    const cls = this.fresh ? 'sv-pop' : '';
    const d = (s) => (cls ? { delay: s } : {});
    if (this.stepIndex >= 2) {
      return chip('tap: price up', 0, 0, { tone: BAND.lo.n, static: true, cls, ...d(0.1) })
        + chip('tap: price down', 0, 0, { tone: BAND.hi.n, static: true, cls, ...d(0.35) });
    }
    const band = this.stepIndex === 0 ? BAND.hi : BAND.lo;
    return chip(band.name, 0, 0, { tone: band.n, static: true, cls, ...d(0.1) })
      + chip('tap the band', 0, 0, { tone: 5, static: true });
  }

  paint(st) {
    const f = this.frame(st);
    let svg = axesSvg(f, {}).svg;
    svg += this.lineSvg(f, demandP, DEM, '0s') + this.lineSvg(f, supplyP, SUP, '0.2s') + this.endsSvg(f) + this.eqSvg(f);
    const keys = this.keys();
    keys.forEach((key, i) => { svg += this.bandSvg(f, BAND[key], i); });
    this.fresh = false;
    if (this._read) this._read.innerHTML = this.readHtml();
    return { svg, over: '', head: this.headChips() };
  }
}
