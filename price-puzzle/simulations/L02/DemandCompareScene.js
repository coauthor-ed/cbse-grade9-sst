/**
 * DemandCompareScene - blk-l02-s03, "One Steep Curve, One Wide One".
 * Base class SvgScene: ONE price-quantity plane carrying both demand curves, so "the market curve
 * is flatter" is a fact on the screen and not a claim (the same 100 rupees is the same drop on
 * both). Six labelled points, tapped one at a time; one 1.6 s run on beat 1 that walks the price
 * from 150 to 50 and lights the same segment on each curve, so the two gains are comparable.
 *
 * Both curves are the straight lines through the slide's own points, and nothing else:
 *   Srivalli  A (1 kg, 150)  B (2 kg, 100)  C (3 kg, 50)    P = 200 - 50Q
 *   market    E (6 kg, 150)  F (12 kg, 100) G (18 kg, 50)   P = 200 - (100/12)Q
 * They meet the price axis at the same height because that is what those six points force; the
 * scene draws it and never names the 200 (the slide has no 200 on it).
 *
 * Labels only. The prose is in the slide; the note line names what to do and nothing more.
 */
import { SvgScene, chip, cardHtml, fill, stroke, glossOf } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);

const RUPEE = '\u20b9';
// The two laws, as the slide's numbers, used exactly. qEnd is where each line reaches price 0.
const CURVES = [
  {
    tone: 1, name: 'Srivalli', qEnd: 4, qAt: (p) => (200 - p) / 50,
    pts: [{ id: 'A', q: 1, p: 150 }, { id: 'B', q: 2, p: 100 }, { id: 'C', q: 3, p: 50 }],
  },
  {
    tone: 3, name: 'the whole market', qEnd: 24, qAt: (p) => (12 * (200 - p)) / 100,
    pts: [{ id: 'E', q: 6, p: 150 }, { id: 'F', q: 12, p: 100 }, { id: 'G', q: 18, p: 50 }],
  },
];
const P_FROM = 200, P_TO = 0, Q_MAX = 24;
const RUN_FROM = 150, RUN_TO = 50, RUN_STEPS = 9, RUN_DT = 0.16;
const TAP_R = 26;

const NOTES = [
  'one plane, two curves - tap a lettered point to read it off both axes',
  'one price move, run it - the same drop on both curves',
  'the panel adds nothing - tap a point again',
];

/** Samples a curve between two prices, high price first. */
function curvePts(c, pFrom, pTo, n = 40) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const p = pFrom + ((pTo - pFrom) * i) / n;
    out.push({ x: c.qAt(p), y: p });
  }
  return out;
}

export class DemandCompareScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  // From sim-layout: the tallest interaction state is 530px landscape, 700px portrait.
  static HEIGHT = 544;
  static PORTRAIT_HEIGHT = 712;
  static ARIA_LABEL =
    'A single price and quantity plane. The vertical axis is the price of a kilo in rupees from 0 '
    + 'to 200, the horizontal axis is the quantity in kilos from 0 to 24. Two downward sloping '
    + 'lines stand on it. The steeper one, in blue, is one buyer: point A at 1 kilo and 150 rupees, '
    + 'B at 2 kilos and 100 rupees, C at 3 kilos and 50 rupees. The flatter one, in green, is every '
    + 'buyer at that market: E at 6 kilos and 150 rupees, F at 12 kilos and 100 rupees, G at 18 '
    + 'kilos and 50 rupees. Both lines start from the same height on the price axis. Tapping a '
    + 'lettered point draws dashed guides from it to both axes. On the second beat a button drops '
    + 'the price from 150 to 50, a dashed line walks down the plane and the segment of each curve '
    + 'between those two prices lights up, with chips reading plus 2 kilos for the blue curve and '
    + 'plus 12 kilos for the green one. On the last beat a chip reads that the market curve is '
    + 'flatter.';
  // The stub's Dials line says the learner only taps a point. The one button is the price move the
  // stub's own "Run shows" describes - a beat that runs a process needs a control to start it.
  static CONTROLS = [{ type: 'button', id: 'drop', label: 'Drop the price' }];

  // ---- state ------------------------------------------------------------------------------------

  enter(step) {
    const s = Math.max(0, Math.min(2, step | 0));
    this.lit = null;          // the tapped point's id
    this.run = null;          // { i, stage } while the price is walking down
    this.gains = s >= 2;      // beat 2 opens with the segments and both gain chips already lit
    this.fresh = true;        // one-shot draw/pop animations, on the first paint of this state
    this._won = {};           // confetti once per beat
  }

  isControlHidden(id) { return id === 'drop' && this.stepIndex !== 1; }
  isControlDisabled(id) { return id === 'drop' && !!this.run; }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `<div class="dcs-note">${noteLineHtml([{ text: NOTES[0] }])}</div>`);
    this._note = this.root.querySelector('.dcs-note');
    this._syncNote();
  }

  onBeatChange(beatIndex, beatCount) {
    super.onBeatChange(beatIndex, beatCount);
    this._syncNote();
  }

  /** One muted line along the foot, one text per beat. Never the modal card. */
  _syncNote() {
    if (!this._note) return;
    this._note.innerHTML = noteLineHtml([{ text: NOTES[Math.max(0, Math.min(2, this.stepIndex | 0))] }]);
  }

  onControlChange(id) {
    if (this.isControlHidden(id) || this.isControlDisabled(id)) return;
    if (id === 'drop') this._startRun();
    this.requestUiUpdate?.();
  }

  stageHeight(st) { return st.portrait ? 560 : 430; }

  /** True only while the price line is walking down - the one thing here that matters in motion.
   *  There is no frame loop, so this is read by tooling (drive-dom's `until idle`), not by a loop. */
  busy() { return !!this.run; }

  /** Chart on the left, kg card on the right in landscape; card under the chart in portrait. */
  areas(st, cardW = 186) {
    return st.portrait
      ? { chart: { x: 0, y: 0, w: st.W, h: st.H - 150 }, card: { x: 0, y: st.H - 142, w: st.W } }
      : { chart: { x: 0, y: 0, w: st.W - cardW - 12, h: st.H }, card: { x: st.W - cardW, y: 0, w: cardW } };
  }

  frame(st) {
    return chartFrame({
      rect: this.areas(st).chart,
      x: { min: 0, max: Q_MAX, ticks: [0, 6, 12, 18, 24], label: 'quantity wanted (kg)' },
      y: { min: 0, max: P_FROM, ticks: [0, 50, 100, 150, 200], label: `price per kg (${RUPEE})` },
    });
  }

  // ---- the run ----------------------------------------------------------------------------------

  _startRun() {
    this.run = { i: 0, stage: this.stepIndex };
    this.fresh = true;
    this.repaint();
    this.after(RUN_DT, () => this._step());
  }

  /** Nine short steps, then the run ends itself. Nothing here can outlive its beat: SvgScene drops
   *  the pending `after` on a step change, and enter() clears this.run. */
  _step() {
    const r = this.run;
    if (!r) return;
    if (r.i >= RUN_STEPS) {
      this.run = null;
      this.gains = true;
      this.repaint();
      this._win(r.stage);
      this.requestUiUpdate?.();
      return;
    }
    r.i += 1;
    this.repaint();
    this.after(RUN_DT, () => this._step());
  }

  /** The concept is found when the two gains can be compared, not when the button is pressed. */
  _win(stage) {
    if (this._won[stage]) return;
    this._won[stage] = true;
    this.celebrate();
  }

  // ---- painting ---------------------------------------------------------------------------------

  paint(st) {
    const f = this.frame(st), A = this.areas(st);
    const runP = this.run ? RUN_FROM + ((RUN_TO - RUN_FROM) * this.run.i) / RUN_STEPS : null;
    const fresh = this.fresh;
    let out = axesSvg(f);

    // The wedge between the two curves: the extra kilos the market takes over and above one
    // buyer, at every price. A faint fill, not a claim - the two lines bound it exactly.
    const wedge = [...curvePts(CURVES[0], P_FROM, P_TO, 24), ...curvePts(CURVES[1], P_TO, P_FROM, 24).reverse()];
    out.svg += `<path d="${wedge.map((p, i) => `${i ? 'L' : 'M'}${f.px(p.x).toFixed(1)} ${f.py(p.y).toFixed(1)}`).join('')}Z" ${fill('var(--sim-series-3)', 'opacity:0.10')}/>`;

    for (const c of CURVES) {
      // The whole curve, drawn once per fresh state.
      out.svg += traceSvg(f, curvePts(c, P_FROM, P_TO), { tone: c.tone, width: 5, end: false, draw: fresh }).svg;
      // The 150 -> 50 segment: lit for the whole run, and kept lit after it, and already lit when
      // the scene opens straight on beat 2.
      const pTo = (runP != null || this.gains) ? (runP ?? RUN_TO) : P_FROM;
      if (pTo < RUN_FROM) {
        const seg = curvePts(c, RUN_FROM, pTo, 16);
        const d = seg.map((p, i) => `${i ? 'L' : 'M'}${f.px(p.x).toFixed(1)} ${f.py(p.y).toFixed(1)}`).join('');
        // A gloss core inside a wider tone stroke: the segment reads as "lit" in either theme,
        // where a plain label-coloured core would go near-black on the light one.
        out.svg += `<path d="${d}" ${stroke(`var(--sim-series-${c.tone})`, 9)}/>`
          + `<path d="${d}" ${stroke(glossOf(`var(--sim-series-${c.tone})`, 45), 3)}/>`;
      }
    }

    // The six points, then the guides of the one that was tapped.
    const dots = [];
    for (const c of CURVES) {
      for (const pt of c.pts) {
        const X = f.px(pt.q), Y = f.py(pt.p);
        dots.push({ ...pt, x: X, y: Y, tone: c.tone });
        const on = this.lit === pt.id;
        out.svg += `<circle class="dcs-dot" data-dot="${pt.id}" cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" r="${on ? 11 : 8}" ${fill(`var(--sim-series-${c.tone})`, `stroke:var(--sim-bg-surface);stroke-width:3`)}/>`;
        // Letters: up-right of every dot, which is open ground above the flat curve and inside the
        // wedge for the steep one - no letter across a line.
        out.svg += `<text x="${(X + 15).toFixed(1)}" y="${(Y - 12).toFixed(1)}" style="fill:var(--sim-label);font-size:19px">${pt.id}</text>`;
        if (on) {
          out.svg += `<path d="M${X.toFixed(1)} ${Y.toFixed(1)}V${f.py(0).toFixed(1)}M${f.px(0).toFixed(1)} ${Y.toFixed(1)}H${X.toFixed(1)}" ${stroke(`var(--sim-series-${c.tone})`, 2.5, 'stroke-dasharray:7 6;opacity:0.85')}/>`;
        }
      }
    }
    this._dots = dots;

    // The price line, while the run walks it down.
    if (runP != null) {
      const Y = f.py(runP);
      out.svg += `<path d="M${f.plot.x} ${Y.toFixed(1)}H${(f.plot.x + f.plot.w).toFixed(1)}" ${stroke('var(--sim-warning)', 3, 'stroke-dasharray:9 7')}/>`;
      out.over += chip(`${RUPEE}${Math.round(runP)}`, f.plot.x + f.plot.w - 6, Y - 18, { tone: 'warning', size: 'sm', align: 'right' });
    }

    // The two gain chips, in the wedge between the curves - beside the segments, not on them.
    // px 7.5 and 13.5 are the midpoints of the two segments in quantity terms, clear of both lines.
    if (this.gains) {
      out.over += chip('+2 kg', f.px(7.5), f.py(100), { tone: 1, cls: 'sv-pop' })
        + chip('+12 kg', f.px(13.5), f.py(45), { tone: 3, cls: 'sv-pop' });
    }

    // The kg schedule, card on the right (landscape) or under the chart (portrait). One short title
    // and bare price labels: at this card width anything longer wraps mid-number.
    out.over += cardHtml(A.card.x, A.card.y, A.card.w, 'kg wanted', [150, 100, 50].map((p) => ({
      label: `${RUPEE}${p}`,
      html: true,
      value: `<span style="color:var(--sim-series-1)">${CURVES[0].qAt(p)}</span>`
        + ` &middot; <span style="color:var(--sim-series-3)">${CURVES[1].qAt(p)}</span> kg`,
    })), { tone: 'accent' });

    this.fresh = false;
    return { svg: out.svg, over: out.over, head: this._headHtml(st) };
  }

  /** The head row: which curve is which, then either what to do or the point just read. */
  _headHtml(st) {
    const legend = chip(CURVES[0].name, 0, 0, { tone: 1, size: 'sm', static: true })
      + chip(CURVES[1].name, 0, 0, { tone: 3, size: 'sm', static: true });
    let mid = '';
    if (this.lit) {
      const d = (this._dots ?? []).find((q) => q.id === this.lit);
      if (d) mid = chip(`${d.id} \u00b7 ${d.q} kg at ${RUPEE}${d.p}`, 0, 0, { tone: d.tone, static: true });
    } else if (!this.run && !this.gains) {
      // The hint only while there is something still to do: not during the run, and not after it.
      mid = chip(this.stepIndex === 1 ? 'tap a point, or drop the price' : 'tap a point to read it',
        0, 0, { tone: 'plain', size: 'sm', static: true });
    }
    const tail = this.stepIndex >= 2 ? chip('the market curve is flatter', 0, 0, { tone: 3, static: true }) : '';
    return legend + mid + tail;
  }

  // ---- input ------------------------------------------------------------------------------------

  /** A tap on a lettered point lights its guides to both axes. A tap anywhere else changes nothing. */
  pointerDown(p) {
    let best = null, bestD = TAP_R;
    for (const d of this._dots ?? []) {
      const dist = Math.hypot(p.x - d.x, p.y - d.y);
      if (dist < bestD) { bestD = dist; best = d; }
    }
    if (!best) return false;
    this.lit = best.id;
    this.repaint();
    return true;
  }
}