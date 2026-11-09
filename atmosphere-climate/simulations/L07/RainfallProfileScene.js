/**
 * RainfallProfileScene - ten stations, ten bars, one shared date axis.
 *
 * Two mounts of this one file:
 *   blk-l07-s02  beat-less, role: "setup"  -> step 0: ten bars at their true lengths in Table 3.3's
 *                  own order, nobody marked. Delhi and Jodhpur are NOT placed first, NOT highlighted
 *                  and NOT bracketed, and the row order is not a key the answer can be read off. The
 *                  wager can be made - and lost - with this on screen.
 *   blk-l07-s03  4 beats -> steps 1-4: the pair first and dated, then the whole sweep in arrival
 *                  order with both diagonals in one frame, then that frame held.
 *
 * WHAT A BAR IS, AND WHAT IT IS NOT. A bar is a SPAN OF DATES. Its length is the monsoon window and
 * nothing else, so all ten bars are the same height, the same shape, the same end ticks and one of
 * only two colours (the pair the lesson is about, and context for everyone else), and two bars of
 * equal length are identical apart from their row and their name. No bar carries a fill level, a
 * height or a colour that could be read as a rainfall quantity; the annual total rides in its own
 * column as text. Nothing here is a temperature, so the flagged Table 3.3 Jodhpur September value
 * cannot reach this chart, and there is no mountain, terrain or orographic mark anywhere on it - the
 * slide names the Himalaya answer in prose and argues against it there.
 *
 * THE DATES ARE THE CHAPTER'S OWN. Arrival from Fig. 3.10's isochrone bands, withdrawal from
 * Fig. 3.11's; axis day 0 = 1 June, day 136 = 15 October. Six stations sit outside every withdrawal
 * band on Fig. 3.11, so their bars stop at 15 October - the map's last line - and the note says so on
 * screen. Two figures in the stub are this scene's spine and hold by construction: Delhi enters 5
 * days before Jodhpur (30 Jun vs 5 Jul) and leaves 3 days after it (20 Sep vs 17 Sep), so Delhi's bar
 * is longer AT BOTH ENDS, by 82 days against 74.
 */
import { SvgScene, chip, fill, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { axesSvg } from 'simulations/base/kit/SimChart.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const DAY_END = 136;                 // day 0 = 1 June, day 136 = 15 October

/** Table 3.3 (annual rainfall) x Fig. 3.10 (arrival bands) x Fig. 3.11 (withdrawal bands). */
const ST = [
  { id: 'thr', name: 'Thiruvananthapuram', a: 0, b: 136, aL: '1 Jun', bL: '15 Oct', cm: 181.2 },
  { id: 'shi', name: 'Shillong', a: 0, b: 136, aL: '1 Jun', bL: '15 Oct', cm: 225.3 },
  { id: 'ben', name: 'Bengaluru', a: 4, b: 136, aL: '5 Jun', bL: '15 Oct', cm: 88.9 },
  { id: 'che', name: 'Chennai', a: 4, b: 136, aL: '5 Jun', bL: '15 Oct', cm: 128.6 },
  { id: 'kol', name: 'Kolkata', a: 4, b: 136, aL: '5 Jun', bL: '15 Oct', cm: 162.5 },
  { id: 'mum', name: 'Mumbai', a: 9, b: 136, aL: '10 Jun', bL: '15 Oct', cm: 183.4 },
  { id: 'nag', name: 'Nagpur', a: 14, b: 131, aL: '15 Jun', bL: '10 Oct', cm: 124.2 },
  { id: 'del', name: 'Delhi', a: 29, b: 111, aL: '30 Jun', bL: '20 Sep', cm: 67.0 },
  { id: 'jod', name: 'Jodhpur', a: 34, b: 108, aL: '5 Jul', bL: '17 Sep', cm: 36.6 },
  { id: 'leh', name: 'Leh', a: 37, b: 108, aL: '8 Jul', bL: '17 Sep', cm: 8.5 },
];
/** Table 3.3's own row order - the setup mount's order, so the sort key is not the answer. */
const TABLE_ORDER = ['ben', 'mum', 'kol', 'del', 'jod', 'che', 'nag', 'shi', 'thr', 'leh'];
const BY_ID = Object.fromEntries(ST.map((s) => [s.id, s]));
const ARRIVAL_ORDER = [...ST].sort((p, q) => p.a - q.a || q.b - p.b).map((s) => s.id);
const PAIR = ['del', 'jod'];

/**
 * Labelled ticks on the day axis, 1 June = day 0. The last tick is the axis END (15 October, day
 * 136) rather than 1 October: 14 days apart is too close for two centred labels to both read, and
 * the end date is the one the reader needs.
 */
const MONTH_TICKS = [{ d: 0, l: '1 Jun' }, { d: 30, l: '1 Jul' }, { d: 61, l: '1 Aug' }, { d: 92, l: '1 Sep' }, { d: 136, l: '15 Oct' }];

const MAP = [[{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }], [{ idx: 3, dwellMs: null }], [{ idx: 4, dwellMs: null }]];

const HI = 'var(--sim-series-1)';    // the pair the lesson is about, and nothing else
const REST = 'var(--sim-stroke)';    // every other station: context, and never a value
const T_ARR = 'var(--sim-series-3)'; // the arrival diagonal
const T_WDR = 'var(--sim-series-6)'; // the withdrawal diagonal
const INK = 'var(--sim-label)';
const INK_MUTED = 'var(--sim-label-muted)';

const BAR_H = 18;
const ROW_LAND = 52;
const ROW_PORT = 82;
const HEAD = 34;                     // room above the first row for the column head
const FOOT = 58;                     // room below the last row for the date axis and its title
const GROW_S = 0.7;
const GROW_STAGGER = 0.055;

/** Gutter widths: the station name on the left (landscape only), the annual column on the right. */
const GUT_L_LAND = 172, GUT_R_LAND = 112;
const GUT_L_PORT = 10, GUT_R_PORT = 22;

const NOTES = [
  'each bar is a span of dates, not a rainfall amount',
  "a bar's length is how long that station stood inside the monsoon",
  'some bars stop at 15 Oct, the map\u2019s last line \u00b7 these are normal dates: any one year runs ahead or behind',
  'some bars stop at 15 Oct, the map\u2019s last line \u00b7 these are normal dates: any one year runs ahead or behind',
  'some bars stop at 15 Oct, the map\u2019s last line \u00b7 these are normal dates: any one year runs ahead or behind',
];

const CSS = `
.rpf-note { margin-top: var(--sim-space-2); }
.rpf-bar { transform-box: fill-box; transform-origin: left center;
  animation: rpf-grow ${GROW_S}s cubic-bezier(0.34, 1.3, 0.64, 1) both; animation-delay: var(--d, 0s); }
@keyframes rpf-grow { from { transform: scaleX(0); } to { transform: none; } }
.rpf-name, .rpf-days, .rpf-cm, .rpf-head { font-family: var(--sim-font); font-weight: 800; }
.rpf-name { font-size: 14px; } .rpf-days, .rpf-cm { font-size: 14px; } .rpf-head { font-size: 14px; }
.rpf-name { fill: var(--sim-label); } .rpf-days, .rpf-cm, .rpf-head { fill: var(--sim-label-muted); }
.rpf-on { fill: var(--sim-label); }
.rpf-tick { fill: var(--sim-label-muted); } .rpf-tick-on { fill: var(--sim-label); }
`;

export class RainfallProfileScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  // The host budgets the panel from these; `stageHeight` returns the same numbers, but a wrapped
  // title row or a tall interaction state needs the budget to cover it too.
  static HEIGHT = 790;
  static PORTRAIT_HEIGHT = 1150;
  // The stub's only input is the station highlight, and it is a tap or a drag ON a bar, drawn in the
  // panel. A control bar here would draw an empty strip and invite exactly what the stub forbids.
  static CONTROLS = [];
  static ARIA_LABEL =
    'A date chart with ten horizontal bars, one per weather station, all on one shared date axis '
    + 'running from 1 June to 15 October. Each bar begins on the normal date the monsoon arrives at '
    + 'that station and ends on the normal date it withdraws, so the length of a bar is how long the '
    + 'station stood inside the monsoon. A column on the left names every station, and a column on '
    + 'the right gives each one its annual rainfall in centimetres as text. Tapping or dragging '
    + 'across a bar brings that station forward with its arrival date, its withdrawal date and the '
    + 'length of its window in days. Delhi and Jodhpur are highlighted: Delhi is entered earlier, on '
    + '30 June against 5 July, and left later, on 20 September against 17 September, so Delhi\'s bar '
    + 'is longer at both ends - 82 days against 74. On the last two beats the bars are re-sorted by '
    + 'arrival date and two lines are drawn across them, a solid one through the arrival dates and a '
    + 'dashed one through the withdrawal dates, so the two sweeps cross in one frame.';

  css() { return CSS; }

  // ---- state --------------------------------------------------------------------------------------

  /** Step 0 is the setup mount's: s02 has no BEAT_STEP_MAP entry, so setup() lands here and stays. */
  enter(step) {
    const s = Math.max(0, Math.min(4, step | 0));
    this.stageNo = s;   // NOT `this.step`: that is DomSimulation.step(dtMs), and shadowing it kills the scene
    this.sel = null;
    this.won = false;
    // The grow-in is staged content, not a run: finite, and gated by _grow so a tap (which repaints)
    // cannot restart it.
    this._grow = s !== 4;
    if (this._grow) this.after(GROW_S + 10 * GROW_STAGGER + 0.25, () => { this._grow = false; this.repaint(); });
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `<div class="rpf-note">${noteLineHtml([{ text: NOTES[0] }])}</div>`);
    this._note = this.root.querySelector('.rpf-note');
    this._syncNote();
    this.relayout();
  }

  /** The host can open straight on a later beat, so the note is synced from both paths. */
  onBeatChange(beatIndex, beatCount) {
    super.onBeatChange(beatIndex, beatCount);
    this._syncNote();
  }

  _syncNote() {
    if (this._note) this._note.innerHTML = noteLineHtml([{ text: NOTES[Math.max(0, Math.min(4, this.stepIndex | 0))] }]);
  }

  /** Nothing on this chart moves of its own accord: no tween, no easing, no rAF. */
  busy() { return false; }

  // ---- input: the only control is the station highlight --------------------------------------------

  _rowAt(p) {
    const g = this._geo;
    if (!g) return null;
    const i = Math.floor((p.y - g.top) / g.rowH);
    if (i < 0 || i >= g.rows.length) return null;
    if (p.x < g.x0 - 60 || p.x > g.x1 + 60) return null;
    return g.rows[i];
  }

  _pick(row) {
    if (!row || row.id === this.sel) return;
    this.sel = row.id;
    // Repaint here, not only on release: the readout should be there under the learner's finger.
    this.repaint();
    // The concept is found, not a button pressed: by step 2 both bars of the pair carry dates, so
    // the first touch of either one is the moment the comparison is in the learner's hands.
    if (!this.won && this.stageNo >= 2 && PAIR.includes(row.id)) { this.won = true; this.celebrate(); }
  }

  pointerDown(p) { this._pick(this._rowAt(p)); return true; }
  pointerMove(p) { const r = this._rowAt(p); if (!r || r.id === this.sel) return false; this._pick(r); return true; }

  // ---- layout --------------------------------------------------------------------------------------

  _rows() { return orderFor(this.stageNo ?? 0).map((id) => BY_ID[id]); }

  /**
   * The plot frame, laid out from named gutters. `axesSvg` draws the panel, the month gridlines, the
   * tick labels, the baseline and the axis title from this - the chart's furniture is never
   * hand-placed. With no y-axis (a date axis has no vertical quantity) the y scale is a bare 0..10
   * with no ticks, so `axesSvg` draws no row lines and no y numbers.
   */
  _frame(st) {
    const land = !st.portrait;
    const rows = this._rows();
    const rowH = land ? ROW_LAND : ROW_PORT;
    const gl = land ? GUT_L_LAND : GUT_L_PORT;
    const gr = land ? GUT_R_LAND : GUT_R_PORT;
    const h = HEAD + rows.length * rowH + FOOT;
    const plot = { x: gl, y: HEAD, w: Math.max(40, st.W - gl - gr), h: rows.length * rowH };
    return {
      rect: { x: 0, y: 0, w: st.W, h },
      plot,
      x: { min: 0, max: DAY_END, ticks: MONTH_TICKS.map((m) => m.d), fmt: (v) => (MONTH_TICKS.find((m) => m.d === v) ?? v).l, label: land ? 'monsoon window: arrival date to withdrawal date' : 'monsoon window' },
      y: { min: 0, max: 10, ticks: [] },
      px: (d) => plot.x + (d / DAY_END) * plot.w,
      py: (v) => plot.y + plot.h,
      xticks: MONTH_TICKS.map((m) => m.d),
      yticks: [],
    };
  }

  stageHeight(st) { return this._frame(st).rect.h; }

  // ---- the picture ---------------------------------------------------------------------------------

  paint(st) {
    const land = !st.portrait;
    const step = Math.max(0, Math.min(4, this.stepIndex | 0));
    const f = this._frame(st);
    const p = f.plot;
    const rowH = land ? ROW_LAND : ROW_PORT;
    const rows = this._rows();
    const px = f.px;
    const barTop = (i) => p.y + i * rowH + (land ? 32 : 30);
    const dated = (r) => step >= 3 || (step === 2 && PAIR.includes(r.id));
    const lit = (r) => (step > 0 && PAIR.includes(r.id)) || r.id === this.sel;
    this._geo = { rows, x0: p.x, x1: p.x + p.w, top: p.y, rowH };

    let { svg } = axesSvg(f);
    let over = '';

    // The two diagonals, drawn IN THE GAPS between rows - never across a bar, so no bar is ever
    // crossed by anything. Each segment runs from one row's end tick down to the next row's, and
    // all nine segments of a line share one x-to-x direction, so together they read as the sweep:
    // the starts climb left to right (arrival, coast-first) while the ends fall left to right
    // (withdrawal, north-west-first). Both are in the same frame, and they cross.
    if (step >= 3) {
      const run = (key, col, dash) => rows.slice(0, -1).map((r, i) => `<path d="M${px(r[key]).toFixed(1)} ${(barTop(i) + BAR_H).toFixed(1)}L${px(rows[i + 1][key]).toFixed(1)} ${barTop(i + 1).toFixed(1)}"`
        + ` ${fill('none')} stroke="${col}" stroke-width="3" stroke-linecap="round"${dash ? ` stroke-dasharray="9 7"` : ''}/>`).join('');
      svg += run('a', T_ARR, false) + run('b', T_WDR, true);
    }

    rows.forEach((r, i) => {
      const x1 = px(r.a), x2 = px(r.b), y = barTop(i), on = lit(r);
      svg += `<g${this._grow ? ` class="rpf-bar" style="--d:${(i * GROW_STAGGER).toFixed(2)}s"` : ''}>`
        + cushionRect(x1, y, x2 - x1, BAR_H, 9, on ? HI : REST, { gloss: false })
        + '</g>';
      // End ticks: the two dates, standing on the two ends. On every dated row, which is what makes
      // the diagonals traceable back to numbers.
      if (dated(r)) svg += [x1, x2].map((x) => `<rect x="${(x - 1.6).toFixed(1)}" y="${y - 6}" width="3.2" height="${BAR_H + 12}" rx="1.6" ${fill(on ? INK : INK_MUTED)}/>`).join('');
    });

    rows.forEach((r, i) => {
      const on = lit(r), y = barTop(i), x1 = px(r.a), x2 = px(r.b);
      if (land) {
        // Two lines in the left gutter: the station's name, and the length of its window.
        svg += `<text class="rpf-name${on ? ' rpf-on' : ''}" x="${p.x - 14}" y="${y - 1}" text-anchor="end">${esc(r.name)}</text>`;
        if (dated(r) || on) svg += `<text class="rpf-days${on ? ' rpf-on' : ''}" x="${p.x - 14}" y="${y + 16}" text-anchor="end">${r.b - r.a} days</text>`;
      } else {
        // Portrait is too narrow for two side columns, so the window length and the annual total
        // share one right-aligned line above the bar, and the bar's dates go below it.
        const figs = [on || dated(r) ? `${r.b - r.a} days` : '', `${r.cm.toFixed(1)} cm`].filter(Boolean).join(' \u00b7 ');
        svg += `<text class="rpf-name${on ? ' rpf-on' : ''}" x="${p.x - 6}" y="${y - 16}">${esc(r.name)}</text>`
          + `<text class="rpf-cm${on ? ' rpf-on' : ''}" x="${p.x + p.w}" y="${y - 16}" text-anchor="end">${esc(figs)}</text>`;
      }
      if (!dated(r)) return;
      // Date chips at both ends, beside the bar (above it in landscape, below it in portrait).
      const cy = land ? y - 12 : y + BAR_H + 16;
      over += chip(r.aL, x1, cy, { tone: on ? 1 : 'plain', size: land ? 'sm' : undefined, align: x1 - p.x < 26 ? 'left' : undefined, delay: this._grow ? i * GROW_STAGGER : 0, cls: this._grow ? 'sv-pop' : '' })
        + chip(r.bL, x2, cy, { tone: on ? 1 : 'plain', size: land ? 'sm' : undefined, align: 'right', delay: this._grow ? i * GROW_STAGGER : 0, cls: this._grow ? 'sv-pop' : '' });
    });

    // The annual column, to the right of the plot. Text on every row, so it can never be read as a
    // bar's height, a second bar, or a colour key.
    if (land) {
      svg += `<text class="rpf-head" x="${p.x + p.w + 14}" y="${p.y - 12}">annual rain</text>`;
      rows.forEach((r, i) => {
        svg += `<text class="rpf-cm${lit(r) ? ' rpf-on' : ''}" x="${p.x + p.w + 14}" y="${barTop(i) + 13}">${r.cm.toFixed(1)} cm</text>`;
      });
    }

    // The highlight readout, in the title row: the three numbers a touched bar is about.
    let head = chip('ten stations, one bar each: arrival to withdrawal', 0, 0, { tone: 'plain', static: true });
    if (step >= 3) head += chip('arrival', 0, 0, { tone: 3, static: true }) + chip('withdrawal', 0, 0, { tone: 6, static: true });
    if (this.sel) {
      const s = BY_ID[this.sel];
      head += chip(`${esc(s.name)}: ${esc(s.aL)} to ${esc(s.bL)}, ${s.b - s.a} days`, 0, 0, { tone: 1, size: 'big', math: true, static: true });
    } else if (step >= 2) {
      head += PAIR.map((id) => { const s = BY_ID[id]; return chip(`${esc(s.name)}: ${s.b - s.a} days`, 0, 0, { tone: 1, math: true, static: true }); }).join('');
    } else {
      head += chip('tap a bar', 0, 0, { tone: 'plain', static: true });
    }
    return { svg, over, head };
  }
}

/** Row order per step. Step 0 is the neutral setup mount; 1-2 lead with the pair; 3-4 are the sweep. */
function orderFor(step) {
  if (step === 0) return TABLE_ORDER;
  if (step <= 2) return [...PAIR, ...ARRIVAL_ORDER.filter((id) => !PAIR.includes(id))];
  return ARRIVAL_ORDER;
}