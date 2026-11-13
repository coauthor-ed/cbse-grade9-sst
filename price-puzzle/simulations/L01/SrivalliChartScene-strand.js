/**
 * SrivalliChartScene-strand - the finished curve alone, and two empty slots waiting for the other
 * buyers' curves. Beats 0-2 of blk-l01-s07 ("One Strand of Thread").
 *
 *   0  the price-quantity plane with Srivalli's DD' already drawn and labelled; both ghost slots shut
 *   1  the two slots fade open: dashed, empty, each a "?" - Alex and Israt, still unanswered
 *   2  both slots open and still empty; the head chip is now the question the slide asks
 *
 * The chart vocabulary (axis ends, ticks, axis titles, the D / D' label offsets) is copied from
 * SrivalliChartScene on purpose - the stub says `Reuse: none`, so this file imports nothing from that
 * scene and sets its own state: it opens cold on a finished curve. SimChart lays out the panel, ticks
 * and titles, `traceSvg` draws the one curve, and there is no per-frame code at all - the curve is
 * never animated on and each slot's fade is a one-shot class consumed by the next paint.
 */
import { SvgScene, chip, fill, stroke, tone as T, inkVar } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';
import { esc } from 'simulations/base/SimUi.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';

// The two buyers the slide names, in the order it names them. Nothing else goes in a slot: the
// stub's "invitational, not data".
const SLOTS = ['Alex', 'Israt'];
const SLOT_TONE = 5;                      // both slots share one muted tone: neither is a data series
const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);

// Srivalli's own three points, exactly as s04 plotted them (FIGURES.md Fig. 9.2). The curve is drawn
// from these and only these; no second curve exists in this scene.
const PTS = [{ x: 1, y: 150 }, { x: 2, y: 100 }, { x: 3, y: 50 }];
const AX = {
  x: { min: 0, max: 3.3, ticks: [0, 1, 2, 3], label: 'Quantity of mangoes (kg)' },
  y: { min: 0, max: 160, ticks: [0, 50, 100, 150], label: 'Price of mangoes (\u20b9)' },
};

const CSS = `
.ss-slot { border: 0; cursor: pointer; }
.ss-slot:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
/* The invitation pulses as a halo, not a transform: a chip whose box moves is one automation (and
   one learner on a laggy phone) cannot click. */
@keyframes ss-pulse { 50% { box-shadow: 0 3px 0 var(--sim-stroke), 0 0 0 7px color-mix(in oklab, var(--sim-accent) 35%, transparent); } }
.ss-pulse { animation: ss-pulse 1.4s ease-in-out infinite; }
@keyframes ss-in { from { opacity: 0; } to { opacity: 1; } }
.ss-in { animation: ss-in 0.45s ease-out both; }
@media (prefers-reduced-motion: reduce) { .ss-pulse { animation: none; } }
`;

export class SrivalliChartSceneStrand extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = "A price and quantity plane for mangoes carrying Srivalli's demand curve DD', already drawn from one kilo at 150 rupees to three kilos at 50 rupees. Beside the plane stand two empty dashed slots labelled Alex and Israt; opening a slot shows an empty frame with a question mark, never a curve.";
  static CONTROLS = [];                    // the stub's "Dials: none": the two slot toggles are in-scene
  static HEIGHT = 544;
  static PORTRAIT_HEIGHT = 640;

  css() { return CSS; }

  // The chips are real HTML buttons on the overlay, so one delegated click serves pointer and
  // keyboard alike; a beat step could not be a click target (it is SVG), so nothing is hit-tested
  // by hand and pointerDown always declines the drag the base class would otherwise start.
  async setup() {
    await super.setup();
    this.root.addEventListener('click', (e) => {
      const el = e.target?.closest?.('[data-slot]');
      if (el) this._toggle(Number(el.dataset.slot));
    });
  }

  stageHeight(st) { return st.portrait ? 520 : 430; }

  // The plane, plus the slot column beside (landscape) or under (portrait) it. The slots are kept
  // off the plot rect on purpose: a dashed box drawn on the plane would read as a region of
  // coordinates, which is data this slide has not earned.
  areas(st) {
    if (st.portrait) {
      const w = 150, h = 86, gap = 14, y = 372;
      const x0 = Math.max(6, (st.W - (w * 2 + gap)) / 2);
      return {
        chart: { x: 0, y: 0, w: st.W, h: 350 },
        labelY: 0,
        slots: [0, 1].map((i) => ({ x: x0 + i * (w + gap), y, w, h, cy: y + h + 20 })),
      };
    }
    const w = 156, h = 96, cx = st.W - 104, y0 = 96;
    return {
      chart: { x: 0, y: 0, w: st.W - 208, h: st.H },
      labelY: 74,
      slots: [0, 1].map((i) => {
        const y = y0 + i * 150;
        return { x: cx - w / 2, y, w, h, cy: y + h + 22 };
      }),
    };
  }

  // Every mount is fresh, so this runs once per mount and again on each step change. Beat 0 opens
  // with both slots shut (the learner may open one); from beat 1 on, both are open and empty.
  enter(step) {
    this.open = new Set(step >= 1 ? [0, 1] : []);
    this._fade = new Set(step >= 1 ? [0, 1] : []);
  }

  // Opening a slot shows an empty frame; closing it takes it away. Nothing is ever drawn inside, so
  // the count of curves on the plane stays at one for the whole lesson.
  _toggle(i) {
    if (!Number.isInteger(i) || !SLOTS[i]) return;
    if (this.open.has(i)) this.open.delete(i);
    else { this.open.add(i); this._fade.add(i); }
    this.repaint();
  }

  paint(st) {
    const step = this.stepIndex ?? 0;
    const A = this.areas(st);
    const f = chartFrame({ rect: A.chart, x: AX.x, y: AX.y });
    const fade = this._fade;
    this._fade = new Set();

    let svg = axesSvg(f).svg;

    // The one curve, already drawn - no draw-on animation, so a cold open never replays it.
    svg += traceSvg(f, PTS, { tone: 'accent', width: 6, end: false, draw: false }).svg;
    const a = PTS[0], b = PTS[2];
    svg += `<text x="${(f.px(a.x) - 14).toFixed(1)}" y="${(f.py(a.y) - 14).toFixed(1)}" text-anchor="end" style="fill:var(--sim-label);font-size:18px">D</text>`
      + `<text x="${(f.px(b.x) + 15).toFixed(1)}" y="${(f.py(b.y) + 34).toFixed(1)}" style="fill:var(--sim-label);font-size:18px">D\u2032</text>`;

    // The two ghost slots: a dashed frame and a "?". A curve, a slope hint or a dot would answer the
    // question beat 2 asks, so the frame stays empty by design.
    const c = T(SLOT_TONE);
    let over = '';
    if (A.labelY) svg += `<text x="${(A.slots[0].x + A.slots[0].w / 2).toFixed(1)}" y="${A.labelY}" text-anchor="middle" style="fill:var(--sim-label-muted);font-size:14px;letter-spacing:0.06em">OTHER BUYERS</text>`;
    A.slots.forEach((r, i) => {
      if (this.open.has(i)) {
        const cls = fade.has(i) ? ' class="ss-in"' : '';
        svg += `<g${cls}><rect x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w}" height="${r.h}" rx="14" ${fill(c, 'fill-opacity:0.10')}/>`
          + `<rect x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w}" height="${r.h}" rx="14" ${stroke(c, 2.5, 'stroke-dasharray:9 8;opacity:0.65')}/>`
          + `<text x="${(r.x + r.w / 2).toFixed(1)}" y="${(r.y + r.h / 2 + 12).toFixed(1)}" text-anchor="middle" style="fill:var(--sim-label-muted);font-size:34px">?</text></g>`;
      }
      const on = this.open.has(i);
      const cls = ['sv-chip', 'sv-chip--sm', 'sv-hit', 'ss-slot', on ? '' : 'sv-chip--plain ss-pulse'].filter(Boolean).join(' ');
      const sty = on ? `--c:${c};--ci:${inkVar(SLOT_TONE)};` : '';
      const text = `${SLOTS[i]}?`;
      over += `<button type="button" class="${cls}" data-slot="${i}" style="left:${(r.x + r.w / 2).toFixed(1)}px;top:${r.cy.toFixed(1)}px;${sty}"`
        + ` aria-label="${on ? 'close' : 'open'} ${SLOTS[i]}'s empty curve slot">${esc(text)}</button>`;
    });

    // One state line, then the note: the slide asks the question, so the scene stops at it.
    const openCount = this.open.size;
    const hint = step === 2
      ? chip('add all three \u2014 what shape?', 0, 0, { tone: 'accent', static: true })
      : chip(openCount ? `${openCount} slot${openCount > 1 ? 's' : ''} open \u00b7 0 curves added` : 'tap a slot to open it', 0, 0, { tone: openCount ? 'accent' : 'plain', static: true });
    const note = noteLineHtml([{ text: "only Srivalli's three points are plotted" }]);
    return { svg, over, head: hint + note };
  }

  // Nothing on the stage is draggable; declining keeps the base class from capturing the pointer
  // (which would swallow the click that drives the slot chips).
  pointerDown() { return false; }
}