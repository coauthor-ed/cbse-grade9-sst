/**
 * EquilibriumGameScene - blk-l05-s09, the L05 mini-game (mini-game@1, mounted once, no beats).
 *
 * The concept IS the win condition. Three prices from the chapter's Table 9.3 stand side by side
 * with the two columns that decide the market - what buyers want and what sellers offer - and the
 * learner calls the one price where those columns read the same. Nothing else can clear the deck:
 * the file finds that price by comparing the two columns, never by storing it, so a wrong call
 * cannot be argued into being right (tie L2).
 *
 * The call and the market's price are kept apart on purpose. Tapping a row both calls it and puts
 * the market there; `start the market` then runs the adjust, which moves the market's marker one
 * stop toward the matching row and shows the two columns swap as it lands - but it never writes the
 * learner's call. The run therefore shows the mechanism (below the balance the shortage pushes the
 * price up, above it the surplus pushes it down) and hands over nothing: the win still needs the
 * learner's own tap on Rs 100.
 *
 * What this file will not do, all from the stub:
 *   - it has no timer, no score of its own, no hearts, no penalty. A wrong row stays called and
 *     red, and can be called again for free.
 *   - it names no price the table does not list, draws no curves, and mentions no government
 *     intervention on price (the stub's `Not yet taught`).
 *   - it never prints a stored answer: the balance row is `ROWS.findIndex(r => r.want === r.offer)`.
 *
 * Numbers are Table 9.3 exactly (see FIGURES.md): Rs 40 | 38 kg | 6 kg, Rs 100 | 12 kg | 12 kg,
 * Rs 150 | 8 kg | 43 kg. The gap chips are want - offer, computed on screen.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';

/* ------------------------------------------------------------------ the three prices */

const RUPEE = '\u20b9';
const money = (v) => `${RUPEE}${v}`;

// Table 9.3, row for row, cheapest price first. `out` is the chapter's own outcome word; `want` and
// `offer` are the two columns the whole game turns on.
const ROWS = [
  { price: 40, want: 38, offer: 6, out: 'excess demand' },
  { price: 100, want: 12, offer: 12, out: 'equal' },
  { price: 150, want: 8, offer: 43, out: 'excess supply' },
];

// The balance is FOUND, not written down: one row whose two columns read the same. Everything the
// game judges - the win, the deck's glow, the run's destination - comes from this one number.
const BAL = ROWS.findIndex((r) => r.want === r.offer);

/** The column that leads at this price, or '' when they agree. Drives the argue tint and the push. */
const leads = (r) => (r.want > r.offer ? 'want' : r.offer > r.want ? 'offer' : '');

/** How far apart the columns stand, in kilos, as a short chip. '' when they agree. */
function gapText(r) {
  if (r.want > r.offer) return `${r.want - r.offer} kg more wanted`;
  if (r.offer > r.want) return `${r.offer - r.want} kg more offered`;
  return '';
}

// Run timing, in ms. The two CSS numbers that must agree with these carry a comment each way.
const ARGUE_MS = 900;     // the columns jostle before the price moves
const SLIDE_MS = 900;     // the marker slides one stop

/* ------------------------------------------------------------------ the look */

const CSS = SIM_LOOK_DOM_CSS + `
.eq-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; --at: 0; }
.eq-head { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }

/* ---- the deck: the table whose row you call ---- */
.eq-deck { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); transition: border-color .25s ease; }
.eq-deck.is-solved { border-color: var(--sim-good); outline: 3px solid color-mix(in oklab, var(--sim-good) 45%, transparent); outline-offset: 2px; }
.eq-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-variant-numeric: tabular-nums; }
.eq-table th, .eq-table td { padding: 5px 6px; text-align: center; }
.eq-table thead th { font: 800 var(--sim-text-sm)/1.15 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 2px solid var(--sim-stroke); vertical-align: bottom; }
.eq-table thead th span { display: block; }
.eq-table tbody th { font: 800 var(--sim-text-xl)/1.2 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
.eq-table tbody tr { cursor: pointer; }
.eq-table tbody tr + tr th, .eq-table tbody tr + tr td { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); }
.eq-c-price { width: 78px; }
.eq-c-q { width: 96px; }

/* the two columns: plain numbers, and on a row that is called the leading side takes the accent
   while the other steps back - that tint is the "they argue", drawn instead of said */
.eq-q { font: 800 var(--sim-text-lg)/1.2 var(--sim-font); color: var(--sim-label); border-radius: var(--sim-radius-sm);
  transition: background-color .2s ease, color .2s ease; }
.eq-table tbody tr:hover td, .eq-table tbody tr:hover th { background: color-mix(in oklab, var(--sim-accent) 8%, transparent); }
tr.is-lead-want .eq-q[data-side="want"] { color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, transparent); }
tr.is-lead-want .eq-q[data-side="offer"] { color: var(--sim-label-muted); }
tr.is-lead-offer .eq-q[data-side="offer"] { color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, transparent); }
tr.is-lead-offer .eq-q[data-side="want"] { color: var(--sim-label-muted); }

/* the row the market's marker is on, and the row the learner called */
tr.is-market th:first-child { box-shadow: inset 4px 0 0 0 var(--sim-accent); }
tr.is-bad { background: color-mix(in oklab, var(--sim-bad) 10%, transparent); }
tr.is-bad th { color: var(--sim-bad); }
tr.is-good { background: color-mix(in oklab, var(--sim-good) 12%, transparent); }
tr.is-good th { color: var(--sim-good); }
tr.is-fresh { animation: eq-pop .34s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes eq-pop { from { transform: scale(0.97); } to { transform: scale(1); } }

/* the call button: the words; the whole row is the hit area as well */
.eq-call { width: 100%; height: 38px; box-sizing: border-box; padding: 0 6px; cursor: pointer;
  font: 800 var(--sim-text-sm)/1 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-pill);
  transition: background-color .18s ease, border-color .18s ease, color .18s ease; }
.eq-call:hover { border-color: var(--sim-accent); }
.eq-call:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.eq-long { display: inline; }
.eq-short { display: none; }
tr.is-called .eq-call { border-color: var(--sim-accent); color: var(--sim-accent); }
tr.is-bad .eq-call { border-color: var(--sim-bad); color: var(--sim-bad); }
tr.is-good .eq-call { border-color: var(--sim-good); color: var(--sim-good);
  background: color-mix(in oklab, var(--sim-good) 14%, var(--sim-bg-surface)); }

/* ---- the status line: the row that was just judged, and nothing more ---- */
.eq-status { margin: 0; min-height: 1.3em; font: 800 var(--sim-text-md)/1.3 var(--sim-font);
  color: var(--sim-label-muted); font-variant-numeric: tabular-nums; }
.eq-status.is-right { color: var(--sim-good); }
.eq-status.is-wrong { color: var(--sim-bad); }

/* ---- the market's own repair: the track, the readout, the run button ---- */
.eq-strip { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); display: flex; flex-direction: column; gap: var(--sim-space-2); }
.eq-striphead { display: flex; align-items: center; justify-content: space-between; gap: var(--sim-space-2); flex-wrap: wrap; }
.eq-striphead .sim-title { margin: 0; font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.eq-at.is-equal { color: var(--sim-good); border-color: var(--sim-good); }

/* the track: three price stops in three equal tracks, so the marker sits at exactly 1/6, 3/6, 5/6.
   Percentages, so the portrait layout needs no second set of numbers. */
.eq-track { padding: 2px 0 4px; }
.eq-labels { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.eq-stop { text-align: center; font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted);
  transition: color .25s ease; }
.eq-stop.is-on { color: var(--sim-accent); }
.eq-rail { position: relative; height: 6px; margin-top: 8px; border-radius: var(--sim-radius-pill);
  background: color-mix(in oklab, var(--sim-stroke) 70%, transparent); }
.eq-marker { position: absolute; top: 50%; left: calc(16.667% + var(--at) * 33.333%); width: 20px; height: 20px;
  margin: -10px 0 0 -10px; border-radius: var(--sim-radius-pill); background: var(--sim-accent);
  border: 3px solid var(--sim-bg-surface); transition: left 900ms cubic-bezier(0.4, 0, 0.2, 1); }

/* the readout: the two columns at the marker's stop, and the chapter's own outcome word */
.eq-read { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }
.eq-chip { font-weight: 800; }
.eq-chip--gap { color: var(--sim-bad); }
.eq-chip--out { color: var(--sim-label); background: color-mix(in oklab, var(--sim-warning) 26%, var(--sim-bg-surface)); }
.eq-chip--out.is-equal { color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 22%, var(--sim-bg-surface)); }

/* the argue: the leading column flashes and jostles the way it is pushing the price, then stops.
   Finite, so the scene comes to rest on its own. Durations must match ARGUE_MS in the file. */
.eq-root[data-state="argue"] .eq-chip[data-side="want"] { animation: eq-jostle-up 300ms ease-in-out 3; }
.eq-root[data-state="argue"] .eq-chip[data-side="offer"] { animation: eq-jostle-down 300ms ease-in-out 3; }
.eq-root[data-state="argue"][data-push="up"] .eq-chip[data-side="want"],
.eq-root[data-state="argue"][data-push="down"] .eq-chip[data-side="offer"] {
  background: color-mix(in oklab, var(--sim-warning) 32%, var(--sim-bg-surface)); }
@keyframes eq-jostle-up { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes eq-jostle-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
.eq-root[data-state="pulse"] .eq-read { animation: eq-pulse 500ms ease both; }
@keyframes eq-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }

/* the run button */
.eq-btn { height: 40px; box-sizing: border-box; padding: 0 var(--sim-space-3); cursor: pointer;
  font: 800 var(--sim-text-md)/1 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-pill);
  transition: background-color .18s ease, border-color .18s ease, color .18s ease; }
.eq-btn:hover { border-color: var(--sim-accent); color: var(--sim-accent); }
.eq-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.eq-btn[disabled] { cursor: default; color: var(--sim-label-muted); border-style: dashed; }

/* portrait: the call button drops its long words, and the number columns thin */
.sim-dom-root--portrait .eq-long { display: none; }
.sim-dom-root--portrait .eq-short { display: inline; }
.sim-dom-root--portrait .eq-table { table-layout: auto; }
.sim-dom-root--portrait .eq-table thead th { padding: 3px 2px; }
.sim-dom-root--portrait .eq-table thead th span { padding: 0 1px; }
.sim-dom-root--portrait .eq-c-price { width: 52px; }
.sim-dom-root--portrait .eq-c-q { width: 68px; }
.sim-dom-root--portrait .eq-table tbody th { font-size: var(--sim-text-lg); }
.sim-dom-root--portrait .eq-q { font-size: var(--sim-text-md); }
`;

/* ------------------------------------------------------------------ the scene */

export class EquilibriumGameScene extends withChallenge(DomSimulation) {
  static WIDTH = 680;
  static HEIGHT = 559;              // sim-layout on the finished board: 547px of content in the worst state
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 693;      // sim-layout portrait: 681px in the worst state
  static ARIA_LABEL =
    'A market table with three price rows for mangoes: Rs 40 with 38 kg wanted and 6 kg offered, Rs 100 with '
    + '12 kg wanted and 12 kg offered, and Rs 150 with 8 kg wanted and 43 kg offered. Each row has a call button, '
    + 'and a whole row can be tapped to call that price the balance. Under the table a price track carries a marker '
    + 'showing where the market is, with the two columns and the market outcome at that price beside it. The start '
    + 'the market button runs the adjust: the two columns jostle where they disagree, then the marker slides one '
    + 'stop toward the price where the columns read the same. The board is solved when the called price is the one '
    + 'where the wanting and the offering are equal.';
  static OBJECTIVE = {
    prompt: {
      en: 'Call the price where the buyers\u2019 column and the sellers\u2019 column read the same. Run the market '
        + 'from any price and watch it move there on its own.',
    },
  };
  // Judged against an exact 1 or 0, so there is nothing here for a numeric tolerance to soften.
  static SCORING = { mode: 'accuracy', tolerance: 0, maxAttempts: Infinity };
  static CONTROLS = [];             // the call and the run are in-panel buttons, as the stub describes them

  constructor(container, config) {
    super(container, config);
    this._call = null;               // the row the learner called, null before the first call
    this._at = 0;                    // the stop the readout is showing: where the market is
    this._marker = 0;                // the stop the marker dot is sliding to (it equals _at at rest)
    this._going = false;             // a run in progress (not `_running`: that is a base-class name)
    this._phase = 'rest';            // 'rest' | 'argue' | 'run', mirrored onto data-state for the CSS
    this._timers = [];               // the run chain's handles, dropped on destroy
    this._celebrated = false;        // confetti fires once per solve
    this._msg = null;                // { text, tone } for the status line
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="eq-root" data-state="rest" data-push="${leads(ROWS[0])}">
          <div class="eq-head">
            <span class="sim-tag sim-tag--accent">call the balance</span>
            <span class="sim-tag">mangoes, at three prices</span>
          </div>

          <div class="sim-card eq-deck" data-deck>
            <table class="eq-table" aria-label="Each price with what buyers want and what sellers offer, and your call">
              <colgroup>
                <col class="eq-c-price"><col class="eq-c-q"><col class="eq-c-q"><col>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">price</th>
                  <th scope="col"><span>buyers</span><span>want</span></th>
                  <th scope="col"><span>sellers</span><span>offer</span></th>
                  <th scope="col"><span>your call</span></th>
                </tr>
              </thead>
              <tbody>
                ${ROWS.map((r, i) => `
                  <tr data-row="${i}">
                    <th scope="row">${money(r.price)}</th>
                    <td class="eq-q" data-side="want" data-q="${i}">${r.want} kg</td>
                    <td class="eq-q" data-side="offer" data-q="${i}">${r.offer} kg</td>
                    <td>
                      <button type="button" class="eq-call" data-call="${i}" aria-pressed="false"
                        aria-label="call ${money(r.price)} the balance">${escCall('call this price')}</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <p class="eq-status" data-status role="status" aria-live="polite">tap the price where the two columns agree</p>

          <div class="sim-card eq-strip" data-strip>
            <div class="eq-striphead">
              <span class="sim-title">the market\u2019s own repair</span>
              <span class="sim-tag eq-at" data-at>market at ${money(ROWS[0].price)}</span>
            </div>

            <div class="eq-track" aria-hidden="true">
              <div class="eq-labels">
                ${ROWS.map((r, i) => `<span class="eq-stop" data-stop="${i}">${money(r.price)}</span>`).join('')}
              </div>
              <div class="eq-rail"><span class="eq-marker" data-marker></span></div>
            </div>

            <div class="eq-read" data-read>
              <span class="sim-tag eq-chip" data-side="want">want ${ROWS[0].want} kg</span>
              <span class="sim-tag eq-chip" data-side="offer">offer ${ROWS[0].offer} kg</span>
              <span class="sim-tag eq-chip eq-chip--gap" data-gap hidden></span>
              <span class="sim-tag eq-chip eq-chip--out" data-outcome>${ROWS[0].out}</span>
            </div>

            <button type="button" class="eq-btn" data-run>start the market</button>
          </div>

          ${noteLineHtml([
            { text: 'the three rows are the chapter\u2019s own market table; the market re-runs from any price you call.' },
          ])}
        </div>`,
    });

    this._el = {
      root: this.root?.querySelector?.('.eq-root'),
      deck: this.root?.querySelector?.('[data-deck]'),
      rows: ROWS.map((_, i) => this.root?.querySelector?.(`tr[data-row="${i}"]`)),
      buttons: ROWS.map((_, i) => this.root?.querySelector?.(`button[data-call="${i}"]`)),
      stops: ROWS.map((_, i) => this.root?.querySelector?.(`span[data-stop="${i}"]`)),
      status: this.root?.querySelector?.('[data-status]'),
      at: this.root?.querySelector?.('[data-at]'),
      want: this.root?.querySelector?.('.eq-read [data-side="want"]'),
      offer: this.root?.querySelector?.('.eq-read [data-side="offer"]'),
      gap: this.root?.querySelector?.('[data-gap]'),
      outcome: this.root?.querySelector?.('[data-outcome]'),
      read: this.root?.querySelector?.('[data-read]'),
      run: this.root?.querySelector?.('[data-run]'),
    };

    // One delegated click: the button, and the whole row around it, are the same action, so a phone
    // tap on the price or on either column calls that price too.
    this.root?.addEventListener?.('click', (ev) => {
      const run = ev.target?.closest?.('[data-run]');
      if (run) { this._runAdjust(); return; }
      const tr = ev.target?.closest?.('tr[data-row]');
      if (tr) this._callRow(Number(tr.dataset.row));
    });

    this._paint();
  }

  destroy() {
    this._clearTimers();
    super.destroy();
  }

  /* ------------------------------------------------------------------ the call */

  /**
   * The learner taps a row. A new call cancels a run in flight (retries are free, so a tap is never
   * ignored) and puts the market where they put it.
   */
  _callRow(i) {
    if (!Number.isInteger(i) || !ROWS[i]) return;
    this._clearTimers();
    this._going = false;
    this._call = i;
    this._at = i;
    this._marker = i;
    const r = ROWS[i];
    const right = leads(r) === '';
    this._msg = right
      ? { text: `${money(r.price)}: ${r.want} kg wanted, ${r.offer} kg offered \u2014 the columns match`, tone: 'right' }
      : { text: `${money(r.price)}: ${r.want} kg wanted, ${r.offer} kg offered \u2014 ${r.out}`, tone: 'wrong' };
    this._paint({ fresh: i });
    this._score();
  }

  /** Hand the call to the challenge wrapper, then celebrate the first time it comes back solved. */
  _score() {
    const res = this.evaluate();
    if (res.solved && !this._celebrated) {
      this._celebrated = true;
      burst(this._el?.deck);         // the confetti lands on the deck as its border turns green
    } else if (!res.solved) {
      this._celebrated = false;
    }
  }

  /**
   * The stub's rule: value is how many called rows have wanted === offered (one call, so 1 or 0) and
   * target is the one balance row. null before the first call - an uncalled table cannot be judged.
   */
  checkObjective() {
    if (this._call == null) return null;
    return { value: leads(ROWS[this._call]) === '' ? 1 : 0, target: 1 };
  }

  /* ------------------------------------------------------------------ the run */

  /**
   * The market's own repair, one leg at a time: the columns jostle where they disagree, then the
   * marker slides one stop in the direction the disagreement pushes the price - up (to the right) from
   * a shortage, down (to the left) from a surplus - and the readout swaps as it lands. Every branch
   * ends here within about two seconds, and a call at the balance row runs no leg at all.
   */
  _runAdjust() {
    if (this._going) return;
    this._clearTimers();
    const from = this._at;
    if (from === BAL) {
      const b = ROWS[BAL];
      this._msg = { text: `the market is already at ${money(b.price)}: ${b.want} kg each way`, tone: 'right' };
      this._paint();
      this._pulse();
      return;
    }
    const to = from < BAL ? from + 1 : from - 1;
    const r = ROWS[from];
    this._going = true;
    this._phase = 'argue';
    this._msg = { text: `at ${money(r.price)} the columns argue: ${r.want} kg wanted, ${r.offer} kg offered`, tone: 'wrong' };
    this._paint();

    this._after(ARGUE_MS, () => {
      this._phase = 'run';
      this._marker = to;             // the marker slides now; the readout still shows where it was
      this._paint();
    });

    this._after(ARGUE_MS + SLIDE_MS, () => {
      this._going = false;
      this._phase = 'rest';
      this._at = to;                 // the marker has landed, so the columns and the market-at chip swap
      const b = ROWS[this._at];
      this._msg = leads(b) === ''
        ? { text: `the market stopped at ${money(b.price)}: ${b.want} kg each way \u2014 now call that price`, tone: 'right' }
        : { text: `the market moved to ${money(b.price)}`, tone: 'wrong' };
      this._paint();
    });
  }

  /** A delayed leg of the run. Held in one list, dropped on destroy (there are no beats to outlive). */
  _after(ms, fn) {
    const t = setTimeout(() => {
      this._timers = this._timers.filter((x) => x !== t);
      fn();
    }, ms);
    this._timers.push(t);
  }

  _clearTimers() {
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
  }

  /** One pulse on the readout, for pressing the run button when the marker already sits at balance. */
  _pulse() {
    const el = this._el?.read;
    if (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    }
  }

  /* ------------------------------------------------------------------ the paint */

  /** Every visible thing, from three numbers and one marker position. No drawing in prose. */
  _paint(opts = {}) {
    const root = this._el?.root;
    if (!this._el || !root) return;
    const fresh = opts.fresh ?? -1;
    const r = ROWS[this._at];
    const solved = this._call != null && leads(ROWS[this._call]) === '';

    // The marker, in percentages: one transition, both orientations. The custom property and the
    // two data attributes live on `.eq-root` itself - they are what the CSS rules above read.
    root.style.setProperty('--at', String(this._marker));
    root.dataset.state = this._going ? this._phase : 'rest';
    // Which way the disagreement at the marker's stop pushes the price: a shortage presses it up,
    // a surplus presses it down. Set on every paint so the argue always jostles the leading column.
    root.dataset.push = leads(r) === 'want' ? 'up' : 'down';

    ROWS.forEach((row, i) => {
      const tr = this._el.rows[i];
      if (tr) {
        const called = this._call === i;
        tr.classList.toggle('is-called', called);
        tr.classList.toggle('is-bad', called && leads(row) !== '');
        tr.classList.toggle('is-good', called && leads(row) === '');
        tr.classList.toggle('is-market', this._at === i);
        // The leading column is tinted only on a row that is live - the row the learner called or the
        // one the marker is on. An untouched deck stays calm.
        const live = called || this._at === i;
        tr.classList.toggle('is-lead-want', live && leads(row) === 'want');
        tr.classList.toggle('is-lead-offer', live && leads(row) === 'offer');
        // Restart the pop only for the row whose call has just changed.
        if (i === fresh) {
          tr.style.animation = 'none';
          void tr.offsetWidth;
          tr.style.animation = '';
        }
      }
      const btn = this._el.buttons[i];
      if (btn) {
        const called = this._call === i;
        btn.setAttribute('aria-pressed', called ? 'true' : 'false');
        btn.innerHTML = called
          ? (leads(row) === '' ? 'the balance' : 'called')
          : escCall('call this price');
      }
      this._el.stops[i]?.classList.toggle('is-on', i === this._at);
    });

    this._el.deck?.classList.toggle('is-solved', solved);
    if (this._el.at) {
      this._el.at.textContent = `market at ${money(r.price)}`;
      this._el.at.classList.toggle('is-equal', this._at === BAL);
    }
    if (this._el.want) this._el.want.textContent = `want ${r.want} kg`;
    if (this._el.offer) this._el.offer.textContent = `offer ${r.offer} kg`;
    if (this._el.gap) {
      const g = gapText(r);
      this._el.gap.textContent = g;
      this._el.gap.hidden = !g;
    }
    if (this._el.outcome) {
      this._el.outcome.textContent = r.out;
      this._el.outcome.classList.toggle('is-equal', leads(r) === '');
    }

    if (this._el.run) {
      this._el.run.disabled = this._going;
      this._el.run.textContent = this._going ? 'the market is moving' : 'start the market';
    }

    const s = this._el.status;
    if (s) {
      s.textContent = this._msg ? this._msg.text : '';
      s.classList.toggle('is-right', this._msg?.tone === 'right');
      s.classList.toggle('is-wrong', this._msg?.tone === 'wrong');
    }
  }
}

/** The call button's own words, long in landscape and short in portrait. No text to escape. */
function escCall(long) {
  return `<span class="eq-long">${long}</span><span class="eq-short">call</span>`;
}