/**
 * SupplyCompareScene - blk-l03-s05, "One Strand, One Wide Rope".
 * Base class SvgScene: ONE price-quantity plane carrying both supply curves, so "the market line is
 * wider and flatter" is a fact on the screen and not a claim (the same 100 rupees is the same
 * vertical climb on both). Six labelled points; a tap on a curve walks its three points one at a
 * time, each with dashed guides to both axes, so the learner reads the two widths off the plane.
 *
 * Both curves are the straight lines through the slide's own points, and nothing else:
 *   Seller A  A (1 kg, 50)  B (2 kg, 100)  C (3 kg, 150)     P = 50Q
 *   market    E (6 kg, 50)  F (12 kg, 100) G (18 kg, 150)     P = (100/12)Q
 * Both pass through the origin, which those six points force; the scene draws it and never names
 * it (the slide has no zero on it). The point letters A/B/C and E/F/G are the chapter's L02
 * convention - the source figure labels both panels A, B, C, which would collide on one plane.
 *
 * Labels only. The prose is in the slide; the note line names what to do and nothing more.
 *
 * The exports below are the curve-drawing vocabulary: SupplyCompareScene-mapped's stub names this
 * file as its shared helper, so it can take the same plane, the same two curves and the same
 * crossing read instead of re-typing them.
 */
import { SvgScene, chip, cardHtml, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);

const RUPEE = '\u20b9';
const PRICES = [50, 100, 150];
// The two laws, as the slide's numbers, used exactly.
export const SUPPLY_CURVES = [
  {
    key: 'a', tone: 1, name: 'Seller A', qAt: (p) => p / 50, lit: 3,
    pts: [{ id: 'A', q: 1, p: 50 }, { id: 'B', q: 2, p: 100 }, { id: 'C', q: 3, p: 150 }],
  },
  {
    key: 'mkt', tone: 3, name: 'the whole market', qAt: (p) => (12 * p) / 100, lit: 0,
    pts: [{ id: 'E', q: 6, p: 50 }, { id: 'F', q: 12, p: 100 }, { id: 'G', q: 18, p: 150 }],
  },
];
export const SUPPLY_AXES = {
  x: { min: 0, max: 20, ticks: [0, 6, 12, 18], label: 'quantity supplied (kg)' },
  // 170, not 150: the dashed line's two readings sit just above it, and at the top taught price
  // they need a chip's height of headroom inside the panel.
  y: { min: 0, max: 170, ticks: [0, 50, 100, 150], label: `price per kg (${RUPEE})` },
};
// The wedge between the two lines is read from these two spots, in kg and rupees.
const NAME_AT = { a: { q: 6.2, p: 132 }, mkt: { q: 14.6, p: 34 } };
const P_FROM = 0, P_TO = 156;
const WALK_DT = 0.36, SWEEP_DT = 0.45;
const TAP_R = 22;

const NOTES = [
  'one plane, two supply curves - tap a curve to light its three points',
  'same three prices, same slope direction - different width',
  'one price, read twice - A\u2019s kilos against the market\u2019s',
];

/** chartFrame over a rect, on the shared supply plane. */
export function supplyPlane(rect) {
  return chartFrame({ rect, x: SUPPLY_AXES.x, y: SUPPLY_AXES.y });
}

/** Samples a curve between two prices, low price first (supply rises with price). */
export function supplySamples(c, pFrom = P_FROM, pTo = P_TO, n = 28) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const p = pFrom + ((pTo - pFrom) * i) / n;
    out.push({ x: c.qAt(p), y: p });
  }
  return out;
}

/** The curve's line, its three dots, and (lit > 0) the guide Ls from its lit dots to both axes.
 *  @opts draw  animate the line on (fresh paint); lit  how many of the three dots are lit;
 *  dotAlpha  opacity of the kept guides once the walk has ended. */
export function supplyCurveSvg(f, c, o = {}) {
  const lit = o.lit ?? c.lit ?? 3;
  let svg = traceSvg(f, supplySamples(c), { tone: c.tone, width: 5, end: false, draw: !!o.draw }).svg;
  const dots = [];
  c.pts.forEach((pt, i) => {
    const x = f.px(pt.q), y = f.py(pt.p);
    const on = i < lit;
    dots.push({ ...pt, key: c.key, tone: c.tone, x, y });
    if (on && o.dotAlpha != null && o.dotAlpha < 1) svg += supplyGuides(f, pt, c.tone, o.dotAlpha, false);
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 10.5 : 7.5}"`
      + ` ${fill(`var(--sim-series-${c.tone})`, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
    // Letters below-right of every dot: open ground inside the wedge on both curves, and clear of
    // the crossing chips on beat 2, which sit above the dashed line.
    const dx = 14, dy = 21;
    svg += `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" style="fill:var(--sim-label);font-size:18px">${pt.id}</text>`;
  });
  return { svg, dots };
}

/** The dashed guide L from one point to the quantity axis, and - while a point is being read - also
 *  to the price axis. Lit points keep the drop only: six full Ls at once is a ladder, and the price
 *  half would just redraw the grid line the point already sits on. */
export function supplyGuides(f, pt, tone, alpha = 0.85, armToPriceAxis = true) {
  const x = f.px(pt.q).toFixed(1), y = f.py(pt.p).toFixed(1);
  const arm = armToPriceAxis ? `M${f.px(0).toFixed(1)} ${y}H${x}` : '';
  return `<path d="M${x} ${y}V${f.py(0).toFixed(1)}${arm}"`
    + ` ${stroke(`var(--sim-series-${tone})`, 2.5, `stroke-dasharray:7 6;opacity:${alpha}`)}/>`;
}

/** The dashed line across the plane at one price, the slide's own line at Rs 100. */
export function supplyPriceLine(f, price) {
  const y = f.py(price).toFixed(1);
  return `<path d="M${f.plot.x} ${y}H${(f.plot.x + f.plot.w).toFixed(1)}"`
    + ` ${stroke('var(--sim-warning)', 3, 'stroke-dasharray:9 7')}/>`;
}

export class SupplyCompareScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  // From sim-layout: the tallest interaction state is 556px landscape, 700px portrait.
  static HEIGHT = 562;
  static PORTRAIT_HEIGHT = 704;
  static ARIA_LABEL =
    'A single price and quantity plane. The vertical axis is the price of a kilo in rupees from 0 '
    + 'to 170, the horizontal axis is the quantity supplied in kilos from 0 to 20. Two upward '
    + 'sloping lines stand on it, both starting from the same corner. The steeper one, in blue, is '
    + 'Seller A: point A at 1 kilo and 50 rupees, B at 2 kilos and 100 rupees, C at 3 kilos and 150 '
    + 'rupees. The flatter and much wider one, in green, is every seller at that market: E at 6 '
    + 'kilos and 50 rupees, F at 12 kilos and 100 rupees, G at 18 kilos and 150 rupees. Tapping a '
    + 'curve lights its three points one at a time, each with a dashed guide down to the quantity '
    + 'axis. On the last beat a dashed line spans the plane at 100 rupees - at the default it meets '
    + 'the blue curve at 2 kilos and the green one at 12 kilos - and a price dial moves it to 50 or '
    + '150 rupees, where the same line meets them at 1 and 6 kilos, or at 3 and 18 kilos.';
  // One dial beyond the stub: the beat-2 dashed line follows it, defaulting to the stub's Rs 100.
  static CONTROLS = [{
    type: 'segmented', id: 'price', label: 'Line at', value: '100',
    options: PRICES.map((p) => ({ value: String(p), label: RUPEE + p })),
  }];

  // ---- state ------------------------------------------------------------------------------------

  enter(step) {
    this.stepIndex = Math.max(0, Math.min(2, step | 0));
    this.walk = null;      // { key, i, stage, mine } while a curve's points are stepping
    this.sweep = null;     // 0 nothing, 1 the dashed line, 2 line + crossing chips
    this.price = 100;
    this.fresh = true;
    this._won = {};
    // Each beat opens with the run its own prose describes, so the slide's picture is on screen
    // before anything is touched: A's points on beat 0, the market's on beat 1, the dashed line on 2.
    if (this.stepIndex === 0) this._walk('a', false);
    else if (this.stepIndex === 1) this._walk('mkt', false);
    else this._sweepStart();
  }

  isControlHidden(id) { return id === 'price' && this.stepIndex < 2; }
  getControlValue(id) { return id === 'price' ? String(this.price) : undefined; }

  async setup() {
    // Which curves have been read is the lesson's own state, not a beat's: A stays lit on beat 1
    // and both stay lit under the dashed line on beat 2.
    this.lit = { a: 0, mkt: 0 };   // how many of that curve's dots are lit
    this.mine = { a: false, mkt: false };  // the learner lit it, not a beat's auto-walk
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `<div class="scs-note">${noteLineHtml([{ text: NOTES[0] }])}</div>`);
    this._note = this.root.querySelector('.scs-note');
    this._syncNote();
  }

  onBeatChange(beatIndex) {
    super.onBeatChange(beatIndex);
    this._syncNote();
  }

  /** One muted line along the foot, one text per beat. Never the modal card. */
  _syncNote() {
    if (!this._note) return;
    this._note.innerHTML = noteLineHtml([{ text: NOTES[Math.max(0, Math.min(2, this.stepIndex | 0))] }]);
  }

  onControlChange(id, v) {
    if (id !== 'price' || this.isControlHidden(id)) return;
    const p = Number(v);
    if (!PRICES.includes(p)) return;
    this.price = p;
    this._sweepStart();
    this.repaint();
    this.requestUiUpdate?.();
  }

  /** Chart on the left, kg card on the right in landscape; card under the chart in portrait. */
  areas(st, cardW = 210) {
    return st.portrait
      ? { chart: { x: 0, y: 0, w: st.W, h: st.H - 130 }, card: { x: 0, y: st.H - 122, w: st.W } }
      : { chart: { x: 0, y: 0, w: st.W - cardW - 14, h: st.H }, card: { x: st.W - cardW, y: 0, w: cardW } };
  }

  stageHeight(st) { return st.portrait ? 520 : 430; }

  frame(st) { return supplyPlane(this.areas(st).chart); }

  /** True while a curve's points are stepping or the dashed line is sweeping out. A DOM scene has
   *  no frame loop, so this is read by tooling (drive-dom's `until idle`), not by a loop. */
  busy() { return !!this.walk || !!(this.sweep && this.sweep.i < 2); }

  // ---- the runs ---------------------------------------------------------------------------------

  /** Three short steps, then the walk ends itself. Nothing here outlives its beat: SvgScene drops
   *  the pending `after` on a step change, and enter() clears this.walk. */
  _walk(key, mine) {
    const stage = this.stepIndex;
    this.walk = { key, i: 0, stage, mine: !!mine };
    this.lit[key] = 0;
    this.repaint();
    this.after(WALK_DT, () => this._walkStep());
  }

  _walkStep() {
    const w = this.walk;
    if (!w) return;
    if (w.i >= 3) {
      this.walk = null;
      this.lit[w.key] = 3;
      this.repaint();
      if (w.mine) { this.mine[w.key] = true; this._win(w.stage); }
      return;
    }
    w.i += 1;
    this.repaint();
    this.after(WALK_DT, () => this._walkStep());
  }

  /** Two short steps: the dashed line goes out, then the two crossings are named. */
  _sweepStart() {
    const stage = this.stepIndex;
    this.sweep = { i: 0, stage };
    this.repaint();
    this.after(SWEEP_DT, () => this._sweepStep());
  }

  _sweepStep() {
    const s = this.sweep;
    if (!s) return;
    s.i += 1;
    this.repaint();
    if (s.i === 1) this.after(SWEEP_DT, () => this._sweepStep());
  }

  /** The concept is the learner's own comparison: both curves lit by their own taps. */
  _win(stage) {
    if (this._won[stage] || !(this.mine.a && this.mine.mkt)) return;
    this._won[stage] = true;
    this.celebrate();
  }

  // ---- painting ---------------------------------------------------------------------------------

  paint(st) {
    const f = this.frame(st), A = this.areas(st);
    const fresh = this.fresh;
    let out = axesSvg(f);

    // The wedge between the two lines: the kilos the market answers with over and above one seller,
    // at every price. A faint fill, not a claim - the two lines bound it exactly.
    const wedge = [...supplySamples(SUPPLY_CURVES[0]), ...supplySamples(SUPPLY_CURVES[1]).reverse()];
    out.svg += `<path d="${wedge.map((p, i) => `${i ? 'L' : 'M'}${f.px(p.x).toFixed(1)} ${f.py(p.y).toFixed(1)}`).join('')}Z" ${fill('var(--sim-series-3)', 'opacity:0.10')}/>`;

    // While a curve is being walked, its lit point carries a full-strength guide L; the dots it has
    // already passed keep a faint one, so the reading stays on the plane after the walk ends.
    let dots = [];
    for (const c of SUPPLY_CURVES) {
      const walking = this.walk && this.walk.key === c.key;
      const lit = walking ? this.walk.i : this.lit[c.key];
      const one = supplyCurveSvg(f, c, { draw: fresh, lit, dotAlpha: 0.4 });
      if (walking) {
        const pt = c.pts[Math.max(0, lit - 1)];
        if (pt && lit > 0) one.svg = supplyGuides(f, pt, c.tone, 0.9) + one.svg;
      }
      out.svg += one.svg;
      dots = dots.concat(one.dots);
    }

    // The dashed line at the chosen price, over both curves so each crossing is visible, with its
    // two readings named just above it.
    if (this.stepIndex >= 2 && this.sweep && this.sweep.i >= 1) {
      out.svg += supplyPriceLine(f, this.price);
      if (this.sweep.i >= 2) {
        const y = f.py(this.price) - 20;
        out.over += SUPPLY_CURVES
          .map((c) => chip(`${c.qAt(this.price)} kg`, f.px(c.qAt(this.price)), y, { tone: c.tone, cls: 'sv-pop' }))
          .join('');
      }
    }

    // The two names, in open ground beside their own lines.
    for (const c of SUPPLY_CURVES) {
      const at = NAME_AT[c.key];
      out.over += chip(c.name, f.px(at.q), f.py(at.p), { tone: c.tone, size: 'sm' });
    }

    // The kg schedule, card on the right (landscape) or under the chart (portrait). Two coloured
    // numbers per row, keyed by the legend chips in the head row - the same shape the L02 demand
    // scene's card uses, and it fits the card width without wrapping mid-number.
    out.over += cardHtml(A.card.x, A.card.y, A.card.w, 'kg offered', PRICES.map((p) => ({
      label: `${RUPEE}${p}`,
      html: true,
      value: `<span style="color:var(--sim-series-1)">${SUPPLY_CURVES[0].qAt(p)}</span>`
        + ` \u00b7 <span style="color:var(--sim-series-3)">${SUPPLY_CURVES[1].qAt(p)}</span> kg`,
    })), { tone: 'accent' });

    this.fresh = false;
    return { svg: out.svg, over: out.over, head: this._headHtml() };
  }

  /** The head row: which curve is which, then what to do, then the beat's own takeaway. */
  _headHtml() {
    const legend = SUPPLY_CURVES.map((c) => chip(c.name, 0, 0, { tone: c.tone, size: 'sm', static: true })).join('');
    let mid = '';
    if (!this.walk) {
      const left = SUPPLY_CURVES.filter((c) => !this.mine[c.key]);
      if (left.length === 2) mid = chip('tap a curve to light its three points', 0, 0, { tone: 'plain', size: 'sm', static: true });
      else if (left.length === 1) mid = chip(`now tap ${left[0].name}`, 0, 0, { tone: 'plain', size: 'sm', static: true });
    }
    const tail = this.stepIndex === 1 ? chip('wider, and flatter', 0, 0, { tone: 3, static: true })
      : this.stepIndex >= 2 ? chip('one voice from many stalls', 0, 0, { tone: 'accent', static: true }) : '';
    return legend + mid + tail;
  }

  // ---- input ------------------------------------------------------------------------------------

  /** A tap near a curve walks its three points; a tap anywhere else changes nothing. */
  pointerDown(p) {
    const hit = this._hitCurve(p);
    if (!hit) return false;
    this._walk(hit.key, true);
    return true;
  }

  /** Nearest sampled point of either line, within TAP_R stage px. */
  _hitCurve(p) {
    const f = this.frame(this.sv);
    let best = null, bestD = TAP_R;
    for (const c of SUPPLY_CURVES) {
      for (const s of supplySamples(c, P_FROM, P_TO, 40)) {
        const d = Math.hypot(p.x - f.px(s.x), p.y - f.py(s.y));
        if (d < bestD) { bestD = d; best = c; }
      }
    }
    return best;
  }
}