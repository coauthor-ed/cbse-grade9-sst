/**
 * MarketDemandSumGameScene - blk-l02-s08, the "fill the market column" mini-game (beat-less mount).
 *
 * The concept IS the win condition. Three buyers, three prices, one empty market column; the learner
 * types the total for each price and the market curve redraws from the column - a right cell puts a
 * point on the plane, a wrong one puts nothing there. Beating the board is doing the chapter's own
 * horizontal summation, correctly, at all three prices at once (tie L2).
 *
 * What this file will not do, all from the stub:
 *   - it never prints a stored answer. Every right/wrong test is `cellValue === row sum`, computed
 *     from the three buyer numbers the table is showing.
 *   - it has no timer, no score of its own, no hearts and no penalty. A wrong cell turns red and
 *     waits to be retyped.
 *   - it draws the market curve only, never the three buyers' own curves, and never the sellers' side.
 *   - it names nothing the lesson has not taught: no equilibrium, no surplus, no elasticity, no money
 *     change beyond the price per kilo.
 *
 * Numbers are Table 9.1 exactly (see FIGURES.md): 1/2/3 -> 6 at Rs 150, 2/4/6 -> 12 at Rs 100,
 * 3/6/9 -> 18 at Rs 50. Nothing here is invented.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { esc } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { SIM_SVG_CSS } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';

/* ------------------------------------------------------------------ the table */

// Table 9.1, row for row, dearest price first - a table row then lines up with a point on the
// plane's price axis. `sum` is not stored as the answer to compare against; it is `q.reduce`, kept
// in the same shape as the textbook column so the file reads against FIGURES.md line by line.
const ROWS = [
  { price: 150, q: [1, 2, 3] },
  { price: 100, q: [2, 4, 6] },
  { price: 50, q: [3, 6, 9] },
].map((r) => ({ ...r, sum: r.q[0] + r.q[1] + r.q[2] }));

const BUYERS = ['Srivalli', 'Alex', 'Israt'];
const N_CELLS = ROWS.length;
const ROW_TARGET = 3;

const RUPEE = '\u20b9';          // the rupee sign, as an escape
const DEBOUNCE_S = 0.45;         // judge a cell once the typing stops, not on every keystroke
const X_MAX = 20;                // kg on the quantity axis (18 is the largest market sum)
const Y_MAX = 150;               // Rs on the price axis (Fig. 9.3's top tick)

/** "Rs 150", and the price a cell's own label says. */
const money = (v) => `${RUPEE}${v}`;
/** "2 + 4 + 6" - the row's addends, which is what a wrong cell re-shows. */
const addends = (row) => row.q.join(' + ');

/**
 * What a cell holds right now: null while it is blank or holds something that is not a number, the
 * number otherwise. A stray space, a full stop or a trailing "kg" is stripped rather than refused,
 * so a learner who types "12 kg" is not told off for the unit.
 */
function cellValue(raw) {
  const s = String(raw ?? '').toLowerCase().replace(/[^0-9]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const CSS = SIM_LOOK_DOM_CSS + SIM_SVG_CSS + `
.mds-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }
.mds-head { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }

/* ---- the table ---- */
.mds-tablewrap { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.mds-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-variant-numeric: tabular-nums; }
.mds-table th, .mds-table td { padding: 5px 6px; text-align: center; }
.mds-table thead th { font: 800 var(--sim-text-sm)/1.15 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 2px solid var(--sim-stroke); vertical-align: bottom; }
.mds-table thead th span { display: block; }
.mds-table thead th.mds-h-market { color: var(--sim-accent); }
.mds-table tbody th { font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
.mds-table tbody td { font: 800 var(--sim-text-lg)/1.2 var(--sim-font); color: var(--sim-label); }
.mds-table tbody tr + tr th, .mds-table tbody tr + tr td { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); }
.mds-col-price { width: 62px; }
.mds-col-market { width: 122px; }

/* the buyer cells: plain numbers, tinted for one row when its total came out wrong */
.mds-buyer { transition: background-color 0.2s ease; }
tr.is-shown .mds-buyer { background: color-mix(in oklab, var(--sim-warning) 20%, transparent); }

/* the market cell: an input the learner types into, and its three states */
.mds-cell { padding: 3px 6px; }
.mds-in { width: 100%; height: 40px; box-sizing: border-box; padding: 0 4px; text-align: center;
  font: 800 var(--sim-text-lg)/1 var(--sim-font); color: var(--sim-label); font-variant-numeric: tabular-nums;
  background: var(--sim-bg-surface); border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-sm); }
.mds-in::placeholder { color: var(--sim-label-muted); opacity: 0.75; }
.mds-in:focus { outline: 3px solid var(--sim-accent); outline-offset: 1px; border-style: solid; }
td.is-right .mds-in { border-style: solid; border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
td.is-wrong .mds-in { border-style: solid; border-color: var(--sim-bad); animation: mds-shake 0.3s ease both; }
td.is-right .mds-in { animation: mds-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

@keyframes mds-pop { from { transform: scale(0.82); } to { transform: scale(1); } }
@keyframes mds-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

/* ---- the status line: the row that was just judged, and nothing more ---- */
.mds-status { margin: 0; min-height: 1.3em; font: 800 var(--sim-text-md)/1.3 var(--sim-font);
  color: var(--sim-label-muted); font-variant-numeric: tabular-nums; }
.mds-status.is-right { color: var(--sim-good); }
.mds-status.is-wrong { color: var(--sim-bad); }

/* ---- the chart ---- */
.mds-chartcard { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.mds-chartcard .sim-title { margin: 0 0 4px; font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.mds-svg { display: block; width: 100%; height: auto; }
.mds-svg--port { display: none; }
.sim-dom-root--portrait .mds-svg--land { display: none; }
.sim-dom-root--portrait .mds-svg--port { display: block; }

/* portrait: the same board, narrower - the three names need the room, so the columns are auto-sized
   here (fixed tracks would squeeze "Srivalli" past its cell) and the price column thins */
.sim-dom-root--portrait .mds-table { table-layout: auto; }
.sim-dom-root--portrait .mds-table thead th { font-size: var(--sim-text-sm); padding: 3px 2px; }
.sim-dom-root--portrait .mds-table thead th span { padding: 0 1px; }
.sim-dom-root--portrait .mds-col-price { width: 44px; }
.sim-dom-root--portrait .mds-col-market { width: 84px; }
.sim-dom-root--portrait .mds-in { height: 38px; }
`;

export class MarketDemandSumGameScene extends withChallenge(DomSimulation) {
  static WIDTH = 680;
  // sim-layout's numbers on the finished board (worst state, learner's own entries in): the content
  // measures 650px in landscape and 713px in portrait, so the frame is set from those, not guessed.
  static HEIGHT = 662;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 726;
  static ARIA_LABEL =
    'A demand table with three price rows, three buyer columns - Srivalli, Alex and Israt - and a market demand '
    + 'column of empty cells to fill in. The learner types the total for a price; a right cell turns green and puts '
    + 'a point on the price-quantity plane below, where the market curve is drawn from the cells that are right. '
    + 'The board is solved when all three price rows are right at once.';
  static OBJECTIVE = {
    prompt: {
      en: 'Fill the market column: every cell is the sum of that price\u2019s row. The curve redraws from the '
        + 'column, so it only appears where the column is right.',
    },
  };
  // The board is judged cell by cell, and each cell is judged against its own row sum, so there is
  // nothing here for a numeric tolerance to soften: tolerance 0 means only an exact column wins.
  static SCORING = { mode: 'accuracy', tolerance: 0, maxAttempts: Infinity };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._judged = ROWS.map(() => null);   // null = not judged yet, true = right, false = wrong
    this._timers = [];                     // the per-cell debounce handles, dropped on destroy
    this._celebrated = false;              // confetti fires once per solve
    this._msg = null;                      // { text, tone } for the status line
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="mds-root">
          <div class="mds-head">
            <span class="sim-tag sim-tag--accent">the market column</span>
            <span class="sim-tag">kg the market takes at that price</span>
          </div>

          <div class="sim-card mds-tablewrap">
            <table class="mds-table" aria-label="Each buyer's kilos at each price, with the market total to fill in">
              <colgroup>
                <col class="mds-col-price"><col><col><col><col class="mds-col-market">
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">price</th>
                  ${BUYERS.map((b) => `<th scope="col"><span>${esc(b)}</span></th>`).join('')}
                  <th scope="col" class="mds-h-market"><span>market</span><span>demand</span></th>
                </tr>
              </thead>
              <tbody>
                ${ROWS.map((r, i) => `
                  <tr data-row="${i}">
                    <th scope="row">${money(r.price)}</th>
                    ${r.q.map((q, k) => `<td class="mds-buyer" data-buyer="${k}">${q}</td>`).join('')}
                    <td class="mds-cell" data-cell="${i}">
                      <input class="mds-in" type="text" inputmode="numeric" autocomplete="off" spellcheck="false"
                        maxlength="4" placeholder="?" data-in="${i}"
                        aria-label="market demand at ${money(r.price)} per kilo, in kilograms">
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <p class="mds-status" data-status role="status" aria-live="polite"></p>

          <div class="sim-card mds-chartcard" data-chart>
            <p class="sim-title">the market curve, drawn from the column</p>
            ${this._chartSvg('land')}
            ${this._chartSvg('port')}
          </div>

          ${noteLineHtml([
            { text: 'the column and the curve are two views of the same three sums - the curve carries only the cells that are right.' },
          ])}
        </div>`,
    });

    applyToneInks(this.root);

    this._el = {
      status: this.root?.querySelector?.('[data-status]'),
      chart: this.root?.querySelector?.('[data-chart]'),
      rows: ROWS.map((_, i) => this.root?.querySelector?.(`tr[data-row="${i}"]`)),
      cells: ROWS.map((_, i) => this.root?.querySelector?.(`td[data-cell="${i}"]`)),
      inputs: ROWS.map((_, i) => this.root?.querySelector?.(`input[data-in="${i}"]`)),
      landSvg: this.root?.querySelector?.('[data-svg="land"]'),
      portSvg: this.root?.querySelector?.('[data-svg="port"]'),
    };

    this.root?.addEventListener?.('input', (e) => {
      const i = e.target?.dataset?.in;
      if (i == null) return;
      this._queueJudge(Number(i));
    });

    this.root?.addEventListener?.('keydown', (e) => {
      const i = e.target?.dataset?.in;
      if (i == null) return;
      if (e.key === 'Enter') {
        // Enter judges the cell at once, then walks to the next empty one so the whole column can be
        // filled from the keyboard alone.
        this._judgeRow(i);
        const next = this._el.inputs.findIndex((el, k) => k > i && cellValue(el?.value) == null);
        if (next >= 0) this._el.inputs[next]?.focus?.();
        else this._el.inputs[i]?.blur?.();
        e.preventDefault();
      }
    });

    this.root?.addEventListener?.('focusout', (e) => {
      const i = e.target?.dataset?.in;
      if (i != null) this._judgeRow(i);
    });

    this._paint();
  }

  destroy() {
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
    super.destroy();
  }

  /* ------------------------------------------------------------------ the cells */

  /** A cell's live value, or null when the board is not mounted. */
  _value(i) {
    return cellValue(this._el?.inputs?.[i]?.value);
  }

  /** True once the learner has typed anything at all - before that there is nothing to judge. */
  get _anyTyped() {
    return ROWS.some((_, i) => this._value(i) != null);
  }

  /**
   * Judge a cell once the typing stops. The timer is dropped and a new one started on every
   * keystroke, so "12" is judged as twelve and not as a one.
   */
  _queueJudge(i) {
    const held = this._timers[i];
    if (held) clearTimeout(held);
    this._timers[i] = setTimeout(() => {
      this._timers[i] = null;
      this._judgeRow(i);
    }, DEBOUNCE_S * 1000);
  }

  /**
   * One row's cell against that row's own sum: 1 + 2 + 3 = 6 at Rs 150. A wrong number is left in
   * the cell for the learner to change, the row's three buyer numbers are re-shown (tinted, and
   * written out in the status line), and the column keeps nothing - no point reaches the plane.
   */
  _judgeRow(i) {
    if (i == null || !this._el?.inputs?.[i]) return;
    const row = ROWS[i];
    const v = this._value(i);
    const right = v != null && v === row.sum;
    const was = this._judged[i];
    this._judged[i] = right ? true : (v == null ? null : false);
    this._msg = right
      ? { text: `${money(row.price)}: ${addends(row)} = ${row.sum} kg`, tone: 'right' }
      : (v == null ? null : { text: `${money(row.price)}: ${addends(row)}`, tone: 'wrong' });
    // A cell that has just changed state is the only one that may animate, so a repeated judgement
    // of an unchanged cell cannot replay its pop.
    this._paint({ fresh: was !== this._judged[i] ? i : -1 });
    this._score();
  }

  /** Hand the column to the challenge wrapper, and let it decide when the board is solved. */
  _score() {
    if (!this._anyTyped) return;
    const res = this.evaluate();
    if (res.solved && !this._celebrated) {
      this._celebrated = true;
      // The confetti lands on the finished curve, a beat after the last cell turns green.
      this._paint({ fresh: -1 });
      setTimeout(() => burst(this._el?.chart), 260);
    } else if (!res.solved) {
      this._celebrated = false;
    }
  }

  /**
   * The stub's rule: value is how many cells currently equal their row's sum, target is the number
   * of price rows. null before the first keystroke - an empty column cannot be judged.
   */
  checkObjective() {
    if (!this._anyTyped) return null;
    let value = 0;
    ROWS.forEach((r, i) => { if (this._value(i) === r.sum) value += 1; });
    return { value, target: N_CELLS };
  }

  /* ------------------------------------------------------------------ the paint */

  /** Cell states, the status line and the curve, all from the column as it stands. */
  _paint(opts = {}) {
    if (!this._el) return;
    const fresh = opts.fresh ?? -1;

    ROWS.forEach((r, i) => {
      const right = this._judged[i] === true;
      const wrong = this._judged[i] === false;
      this._el.cells[i]?.classList.toggle('is-right', right);
      this._el.cells[i]?.classList.toggle('is-wrong', wrong);
      this._el.rows[i]?.classList.toggle('is-shown', wrong);
      // Restart the animation only for the cell whose state has just changed.
      const el = this._el.inputs[i];
      if (el && i === fresh) {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      }
    });

    const s = this._el.status;
    if (s) {
      s.textContent = this._msg ? this._msg.text : '';
      s.classList.toggle('is-right', this._msg?.tone === 'right');
      s.classList.toggle('is-wrong', this._msg?.tone === 'wrong');
    }

    this._paintCurve();
  }

  /**
   * The plane. Points are placed only where a cell is right, and the trace runs through the points
   * in price order, so the line grows a point, then a segment, then the whole curve as the column
   * fills.
   */
  _paintCurve() {
    const pts = ROWS.map((r, i) => ({ x: this._value(i) === r.sum ? r.sum : null, y: r.price }))
      .filter((p) => p.x != null)
      .sort((a, b) => b.y - a.y);           // dearest price first, the order the table reads in
    for (const kind of ['land', 'port']) {
      const el = kind === 'land' ? this._el.landSvg : this._el.portSvg;
      if (el) el.innerHTML = this._chartInner(kind, pts);
    }
  }

  /** The two chart boxes: one per orientation, so neither is a shrunken copy of the other. */
  _chartSvg(kind) {
    const box = kind === 'land' ? { w: 648, h: 236 } : { w: 356, h: 250 };
    return `<svg class="mds-svg mds-svg--${kind}" data-svg="${kind}" viewBox="0 0 ${box.w} ${box.h}"`
      + ` width="${box.w}" height="${box.h}" role="img" preserveAspectRatio="xMidYMid meet"`
      + ` aria-label="Price-quantity plane: the market demand curve, drawn only from the cells that are right">`
      + `${this._chartInner(kind, [])}</svg>`;
  }

  /** The furniture from SimChart, the kit's trace, then a marker and a number at each right cell. */
  _chartInner(kind, pts) {
    const land = kind === 'land';
    const f = chartFrame({
      rect: land ? { x: 0, y: 0, w: 648, h: 236 } : { x: 0, y: 0, w: 356, h: 250 },
      x: { min: 0, max: X_MAX, ticks: [0, 5, 10, 15, 20], label: land ? 'kg of mangoes the market takes' : 'kg taken' },
      y: { min: 0, max: Y_MAX, ticks: [0, 50, 100, 150], label: land ? 'price of mangoes (Rs)' : 'price (Rs)' },
    });
    let { svg } = axesSvg(f);
    if (pts.length) svg += traceSvg(f, pts, { tone: 1, width: 5, draw: true }).svg;
    // One marker and one number per right cell: the number the learner typed, read off the table.
    for (const p of pts) {
      const x = f.px(p.x).toFixed(1);
      const y = f.py(p.y).toFixed(1);
      svg += `<circle cx="${x}" cy="${y}" r="6.5" style="fill:var(--sim-series-1);stroke:var(--sim-bg-surface);stroke-width:3"/>`
        + `<text x="${x}" y="${(f.py(p.y) + 26).toFixed(1)}" text-anchor="middle"`
        + ` style="fill:var(--sim-label);font:800 var(--sim-text-sm)/1 var(--sim-font)">${p.x}</text>`;
    }
    if (!pts.length) {
      svg += `<text x="${(f.plot.x + f.plot.w / 2).toFixed(1)}" y="${(f.plot.y + f.plot.h / 2).toFixed(1)}"`
        + ` text-anchor="middle" style="fill:var(--sim-label-muted);font:700 var(--sim-text-md)/1 var(--sim-font)">`
        + `no cell is right yet</text>`;
    }
    return svg;
  }
}