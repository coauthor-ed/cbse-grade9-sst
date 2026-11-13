/**
 * SupplyPointGameScene - blk-l03-s07, the lesson's mini-game (beat-less mount, `mini-game@1`).
 *
 * The concept IS the win condition, in two halves the chapter taught separately:
 *   round 1 - drag kg chips onto three prices on a supply plane. The arrangement passes only when the
 *             pile grows with the price (the Law of Supply's direction), so a downhill or flat scatter
 *             never wins, however lucky it looks.
 *   round 2 - type what the market takes at each price. A cell is right only when it equals its own
 *             row's sum (the horizontal summation), and only right cells put a point on the plane.
 * The board is solved when both rules hold at once.
 *
 * What this file will not do, all from the stub:
 *   - it never prints a stored answer. Rule 1 is tested from the three numbers sitting on the plane,
 *     rule 2 from `cellValue === row sum`, both computed from the numbers the board is showing.
 *   - it has no timer, no hearts and no penalty. A wrong arrangement or a wrong cell stays on the
 *     board, turns red, and waits to be changed. Retries are free.
 *   - it names nothing the lesson has not taught: no equilibrium, no price floor or ceiling, no
 *     technology or number-of-sellers shift, and no individual curve for sellers B and C.
 *
 * Numbers are the chapter's own (see FIGURES.md Fig. 9.4, Table 9.2, Fig. 9.5): A offers 1/2/3 kg at
 * Rs 50/100/150, the three sellers bring 1+3+2, 2+4+6 and 3+7+8, so the market rope runs 6, 12, 18 kg.
 * The tray is the one place model numbers are added: 1, 1, 2, 3, 4 kg instead of the chapter's 1, 2, 3.
 * With one chip per kilo, "upward" would collapse into matching each chip to its own price (the law
 * would sit on the game, not in it) and a flat scatter would be unreachable, although the slide names
 * it. Five chips make many placements genuine upward answers and make a flat one reachable and wrong.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { esc } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { SIM_SVG_CSS } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';
import { simPick } from 'simulations/base/kit/SimPick.js';

/* ------------------------------------------------------------------ the board's numbers */

// The three prices, ascending: slot i is the price SLOTS[i], so "grows with the price" is a single
// comparison across the array. The rail draws them the other way up (the dearest price on top, to sit
// like the plane's price axis) through RAIL.
const SLOTS = [50, 100, 150];
const RAIL = [2, 1, 0];

// The tray, one entry per chip: `id` is what a slot holds, `kg` is what the chip reads and what the
// rule compares. Two chips of 1 kg are two chips, so a flat scatter is a placement the learner can
// actually make (and has to be shown is wrong).
const CHIPS = [
  { id: 'k1', kg: 1 },
  { id: 'k2', kg: 1 },
  { id: 'k3', kg: 2 },
  { id: 'k4', kg: 3 },
  { id: 'k5', kg: 4 },
];
const kgOf = (id) => CHIPS.find((c) => c.id === id)?.kg ?? null;

// Table 9.2, dearest price first so a table row lines up with a point on the plane's price axis.
// `sum` is a reduce of the row, not a stored answer: it is what the learner's own cell is compared to.
const ROWS = [
  { price: 150, q: [3, 7, 8] },
  { price: 100, q: [2, 4, 6] },
  { price: 50, q: [1, 3, 2] },
].map((r) => ({ ...r, sum: r.q[0] + r.q[1] + r.q[2] }));

const SELLERS = ['A', 'B', 'C'];
const RULES = 2;              // slope right way + every market cell its own row's sum
const RUPEE = '\u20b9';
const DEBOUNCE_S = 0.45;       // judge a cell once the typing stops, not on every keystroke
const X_MAX = 20;              // kg on the quantity axis: the market rope reaches 18 (Fig. 9.5b)
const Y_MAX = 150;

const money = (v) => `${RUPEE}${v}`;
const addends = (row) => row.q.join(' + ');

/** A cell's number, or null while it is blank or holds something that is not one. */
function cellValue(raw) {
  const s = String(raw ?? '').toLowerCase().replace(/[^0-9]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// sim-lint-ignore token: --sim-ink-on-1 is set at runtime by applyToneInks() below (and re-picked on every
// theme flip), which is the only thing that can put a readable ink on the chip's series-1 fill in both themes.
const CSS = SIM_LOOK_DOM_CSS + SIM_SVG_CSS + `
.spg-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }
.spg-head { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }

/* ---- the plane: a price rail of three drop slots, then the chart ---- */
.spg-planecard { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.spg-planetitle { display: flex; align-items: baseline; gap: var(--sim-space-2); flex-wrap: wrap; margin: 0 0 6px; }
.spg-planetitle .sim-title { margin: 0; font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.spg-key { display: inline-flex; align-items: center; gap: 6px; font: 800 var(--sim-text-sm)/1 var(--sim-font); color: var(--sim-label-muted); }
.spg-key i { width: 18px; height: 4px; border-radius: 2px; display: inline-block; }
.spg-key--a i { background: var(--sim-series-1); }
.spg-key--m i { background: var(--sim-series-2); }

.spg-planerow { display: flex; align-items: stretch; gap: var(--sim-space-3); }
.spg-slots { display: flex; flex-direction: column; gap: 6px; width: 116px; flex: none; }
.spg-slot { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  box-sizing: border-box; padding: 4px; border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-md);
  background: var(--sim-bg-surface); }
.spg-slot__price { font: 800 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted); font-variant-numeric: tabular-nums; }
.spg-slot__q { font: 800 var(--sim-text-lg)/1 var(--sim-font); color: var(--sim-label-muted); }
.spg-slot.is-full { border-style: solid; border-color: color-mix(in oklab, var(--sim-series-1) 70%, var(--sim-stroke)); }
.spg-slot.is-bad { border-color: var(--sim-bad); background: color-mix(in oklab, var(--sim-bad) 14%, var(--sim-bg-surface));
  animation: spg-shake 0.35s ease both; }
@keyframes spg-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

.spg-svg { display: block; width: 100%; height: auto; }
.spg-svg--port { display: none; }
.sim-dom-root--portrait .spg-svg--land { display: none; }
.sim-dom-root--portrait .spg-svg--port { display: block; }

/* ---- the chips ---- */
.spg-traycard { padding: var(--sim-space-2) var(--sim-space-3); }
.spg-tray { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }
.spg-tray__label { font: 800 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.spg-tray__pick { display: inline-flex; align-items: center; flex-wrap: wrap; gap: var(--sim-space-2); flex: 1;
  min-height: 38px; padding: 0 var(--sim-space-1); box-sizing: border-box;
  border-radius: var(--sim-radius-md); }
.spg-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 58px; height: 38px;
  padding: 0 12px; box-sizing: border-box; border-radius: var(--sim-radius-pill);
  background: var(--sim-series-1); color: var(--sim-ink-on-1);
  font: 800 var(--sim-text-md)/1 var(--sim-font); font-variant-numeric: tabular-nums;
  box-shadow: 0 3px 0 color-mix(in oklab, var(--sim-series-1) 55%, var(--sim-bg-deep)); }
.spg-slot .spg-chip { min-width: 52px; height: 32px; padding: 0 8px; font-size: var(--sim-text-sm); }

/* ---- round two: the sellers' table ---- */
.spg-tablecard { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.spg-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-variant-numeric: tabular-nums; }
.spg-table th, .spg-table td { padding: 5px 6px; text-align: center; }
.spg-table thead th { font: 800 var(--sim-text-sm)/1.15 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 2px solid var(--sim-stroke); vertical-align: bottom; }
.spg-table thead th span { display: block; }
.spg-table thead th.spg-h-market { color: var(--sim-accent); }
.spg-table tbody th { font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
.spg-table tbody td { font: 800 var(--sim-text-lg)/1.2 var(--sim-font); color: var(--sim-label); }
.spg-table tbody tr + tr th, .spg-table tbody tr + tr td { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); }
.spg-col-price { width: 62px; }
.spg-col-market { width: 124px; }
.spg-seller { transition: background-color 0.2s ease; }
tr.is-shown .spg-seller { background: color-mix(in oklab, var(--sim-warning) 20%, transparent); }

.spg-cell { padding: 3px 6px; }
.spg-in { width: 100%; height: 40px; box-sizing: border-box; padding: 0 4px; text-align: center;
  font: 800 var(--sim-text-lg)/1 var(--sim-font); color: var(--sim-label); font-variant-numeric: tabular-nums;
  background: var(--sim-bg-surface); border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-sm); }
.spg-in::placeholder { color: var(--sim-label-muted); opacity: 0.75; }
.spg-in:focus { outline: 3px solid var(--sim-accent); outline-offset: 1px; border-style: solid; }
td.is-right .spg-in { border-style: solid; border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
td.is-wrong .spg-in { border-style: solid; border-color: var(--sim-bad); animation: spg-shake 0.35s ease both; }
td.is-right .spg-in { animation: spg-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes spg-pop { from { transform: scale(0.82); } to { transform: scale(1); } }

/* ---- the status line: the rule that was just tested, and nothing more ---- */
.spg-status { margin: 0; min-height: 1.3em; font: 800 var(--sim-text-md)/1.3 var(--sim-font);
  color: var(--sim-label-muted); font-variant-numeric: tabular-nums; }
.spg-status.is-right { color: var(--sim-good); }
.spg-status.is-wrong { color: var(--sim-bad); }

/* ---- round two is gated behind rule 1; the tray and the slots stay live in both rounds ---- */
[data-round="1"] .spg-round2 { display: none; }

/* portrait: the rail goes above the plane as a row of three, each slot carrying its own price tag */
.sim-dom-root--portrait .spg-planerow { flex-direction: column; }
.sim-dom-root--portrait .spg-slots { flex-direction: row; width: 100%; }
.sim-dom-root--portrait .spg-slot { padding: 6px 2px; }
.sim-dom-root--portrait .spg-table { table-layout: auto; }
.sim-dom-root--portrait .spg-table thead th { font-size: var(--sim-text-sm); padding: 3px 2px; }
.sim-dom-root--portrait .spg-col-price { width: 44px; }
.sim-dom-root--portrait .spg-col-market { width: 86px; }
.sim-dom-root--portrait .spg-in { height: 38px; }
/* five chips have to fit one row in portrait, so the label takes its own line there and the pick gets the
   card's whole width: 5 x 54 + 4 x 6 = 294 of the 312px the pick leaves. Left beside the chips, the 244px
   label left 72px for them and the row wrapped into a column of five. */
.sim-dom-root--portrait .spg-tray { flex-direction: column; align-items: flex-start; gap: 6px; }
.sim-dom-root--portrait .spg-tray__pick { width: 100%; gap: 6px; }
.sim-dom-root--portrait .spg-chip { min-width: 50px; height: 34px; padding: 0 8px; }
`;

export class SupplyPointGameScene extends withChallenge(DomSimulation) {
  static WIDTH = 680;
  // The two rounds are very different heights (464px with the tray alone, 693px with the table too),
  // so the frame is fitted to whichever round is showing: a static worst-case frame would render
  // round one at 0.83 scale with a 230px empty band under the note. HEIGHT is the initial hint only.
  static HEIGHT = 693;                   // round two measured in landscape (661 + the root's padding)
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 888;           // round two's tallest state in portrait (the two-line win message)
  static FIT = true;
  static ARIA_LABEL =
    'A price-quantity plane for mangoes with three drop slots at 50, 100 and 150 rupees, a tray of kilogram '
    + 'chips and a sellers\' table. The learner drags a kilogram chip onto a price slot so the pile grows with '
    + 'the price; in the second round the learner types the market total for each price row, which equals that '
    + 'row\'s three sellers\' kilos and adds a point to the plane. The board is solved when the slope climbs '
    + 'and every market cell equals its row\'s sum at the same time.';
  static OBJECTIVE = {
    prompt: {
      en: 'Place a seller\u2019s three price-quantity points so the curve slopes the right way, then build the '
        + 'market total row by row. Win when the slope and the sum both obey the chapter\u2019s rules.',
    },
  };
  // Each rule is judged exactly (direction of the slope, equality of a cell with its own row's sum), so
  // there is nothing here for a tolerance to soften: tolerance 0 means only both rules win.
  static SCORING = { mode: 'accuracy', tolerance: 0, maxAttempts: Infinity };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._slot = SLOTS.map(() => null);   // kg sitting on each price, null = empty slot
    this._judged = ROWS.map(() => null);   // null = not judged, true = right, false = wrong
    this._bad = new Set();                 // slots whose pair breaks the slope
    this._unlocked = false;                // round two stays open once rule 1 has held once
    this._celebrated = false;
    this._msg = null;                      // { text, tone } for the status line
    this._h = 0;                           // the board's own height, to tell when the frame is stale
    this._timers = [];                     // per-cell debounce handles, dropped on destroy
    this._burstT = null;                   // the confetti handle, dropped on destroy
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="spg-root" data-round="1">
          <div class="spg-head">
            <span class="sim-tag sim-tag--accent" data-rtag>round 1 \u00b7 the seller's own list</span>
            <span class="sim-tag" data-rstate>0 of 3 points</span>
          </div>

          <div class="sim-card spg-planecard" data-plane>
            <p class="spg-planetitle">
              <span class="sim-title">the supply plane</span>
              <span class="spg-key spg-key--a"><i></i>seller A</span>
              <span class="spg-key spg-key--m"><i></i>the whole market</span>
            </p>
            <div class="spg-planerow">
              <div class="spg-slots" data-slots role="group" aria-label="price slots to drop a kilogram chip on"></div>
              ${this._chartSvg('land')}
              ${this._chartSvg('port')}
            </div>
          </div>

          <div class="sim-card spg-traycard spg-round1" data-traycard>
            <div class="spg-tray">
              <span class="spg-tray__label" data-traylabel>tray \u00b7 drag a chip to a price</span>
              <span class="spg-tray__pick" data-bin="tray" role="group" aria-label="the tray, to put a chip back"></span>
            </div>
          </div>

          <div class="sim-card spg-tablecard spg-round2" data-tablecard>
            <div class="spg-tablewrap">
              <table class="spg-table" aria-label="Each seller's kilos at each price, with the market total to fill in">
                <colgroup>
                  <col class="spg-col-price"><col><col><col><col class="spg-col-market">
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">price</th>
                    ${SELLERS.map((s) => `<th scope="col"><span>seller</span><span>${esc(s)}</span></th>`).join('')}
                    <th scope="col" class="spg-h-market"><span>market</span><span>supply</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${ROWS.map((r, i) => `
                    <tr data-row="${i}">
                      <th scope="row">${money(r.price)}</th>
                      ${r.q.map((q, k) => `<td class="spg-seller" data-seller="${k}">${q}</td>`).join('')}
                      <td class="spg-cell" data-cell="${i}">
                        <input class="spg-in" type="text" inputmode="numeric" autocomplete="off" spellcheck="false"
                          maxlength="3" placeholder="?" data-in="${i}"
                          aria-label="market supply at ${money(r.price)} per kilo, in kilograms">
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <p class="spg-status" data-status role="status" aria-live="polite"></p>

          ${noteLineHtml([
            { text: 'the curve and the column are two views of the same three numbers.' },
          ])}
        </div>`,
    });

    applyToneInks(this.root);

    this._el = {
      root: this.root?.querySelector?.('.spg-root'),
      plane: this.root?.querySelector?.('[data-plane]'),
      slots: this.root?.querySelector?.('[data-slots]'),
      trayPick: this.root?.querySelector?.('[data-bin="tray"]'),
      trayLabel: this.root?.querySelector?.('[data-traylabel]'),
      status: this.root?.querySelector?.('[data-status]'),
      rtag: this.root?.querySelector?.('[data-rtag]'),
      rstate: this.root?.querySelector?.('[data-rstate]'),
      rows: ROWS.map((_, i) => this.root?.querySelector?.(`tr[data-row="${i}"]`)),
      cells: ROWS.map((_, i) => this.root?.querySelector?.(`td[data-cell="${i}"]`)),
      inputs: ROWS.map((_, i) => this.root?.querySelector?.(`input[data-in="${i}"]`)),
      landSvg: this.root?.querySelector?.('[data-svg="land"]'),
      portSvg: this.root?.querySelector?.('[data-svg="port"]'),
    };

    this._pick = simPick(this.root, {
      items: '[data-item]',
      targets: '[data-bin]',
      canDrop: (itemId, targetId) => this._canDrop(itemId, targetId),
      onDrop: (itemId, targetId) => this._place(itemId, targetId),
      // Only the red glow is cleared here: re-rendering the rail on a pick would replace the very
      // chip the kit has just selected, and the drop that follows would find nothing selected.
      onPick: () => {
        this._bad.clear();
        for (const el of this._el?.slots?.querySelectorAll?.('.spg-slot') ?? []) el.classList.remove('is-bad');
      },
      // The scene's own status line is the live region: the kit would otherwise add a second,
      // visually hidden one that repeats every pick in its own words.
      announce: () => this._paintStatus(),
    });

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
        this._judgeRow(Number(i));
        const next = this._el.inputs.findIndex((el, k) => k > Number(i) && cellValue(el?.value) == null);
        if (next >= 0) this._el.inputs[next]?.focus?.();
        else this._el.inputs[Number(i)]?.blur?.();
        e.preventDefault();
      }
    });

    this.root?.addEventListener?.('focusout', (e) => {
      const i = e.target?.dataset?.in;
      if (i != null) this._judgeRow(Number(i));
    });

    this._paint();
  }

  destroy() {
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
    clearTimeout(this._burstT);
    this._pick?.destroy?.();
    super.destroy();
  }

  /* ------------------------------------------------------------------ the two rules */

  /** Rule 1: all three prices carry a point, and the pile grows with the price. */
  _slopeOk() {
    const kg = SLOTS.map((_, i) => kgOf(this._slot[i]));
    return kg.every((k) => k != null) && kg[0] < kg[1] && kg[1] < kg[2];
  }

  /** Rule 2: every market cell equals its own row's sum. */
  _columnOk() {
    return ROWS.every((r, i) => cellValue(this._el?.inputs?.[i]?.value) === r.sum);
  }

  /** The stub's reading: the count of rules currently satisfied, target 2. */
  checkObjective() {
    const touched = this._slot.some((v) => v != null)
      || ROWS.some((_, i) => cellValue(this._el?.inputs?.[i]?.value) != null);
    if (!touched) return null;
    const value = (this._slopeOk() ? 1 : 0) + (this._columnOk() ? 1 : 0);
    return { value, target: RULES };
  }

  /* ------------------------------------------------------------------ the slots */

  /** One point per price: a second chip on a full slot is refused, which the kit shakes. */
  _canDrop(chipId, targetId) {
    if (!CHIPS.some((c) => c.id === chipId)) return false;
    if (targetId === 'tray') return true;
    const i = Number(String(targetId).replace('s', ''));
    if (!Number.isInteger(i) || i < 0 || i >= SLOTS.length) return false;
    return this._slot[i] == null || this._slot[i] === chipId;
  }

  /**
   * A chip belongs to exactly one place at a time: the price slot it was dropped on, or the tray.
   * A chip dragged out of a slot leaves that price empty again, and the slots are re-read on every
   * drop, so a broken arrangement drops the count instead of latching. Two chips of the same kilo are
   * two chips, so dragging one never moves the other.
   */
  _place(chipId, targetId) {
    this._bad.clear();
    this._msg = null;                  // a chip moved re-tests the slope, so the old verdict is stale
    const i = SLOTS.findIndex((_, k) => this._slot[k] === chipId);
    if (i >= 0) this._slot[i] = null;
    let to = null;
    if (targetId !== 'tray') {
      const t = Number(String(targetId).replace('s', ''));
      if (Number.isInteger(t) && t >= 0 && t < SLOTS.length) { this._slot[t] = chipId; to = t; }
    }
    this._paint({ slot: to });
    this._score();
  }

  /* ------------------------------------------------------------------ the cells */

  _queueJudge(i) {
    const held = this._timers[i];
    if (held) clearTimeout(held);
    this._timers[i] = setTimeout(() => {
      this._timers[i] = null;
      this._judgeRow(i);
    }, DEBOUNCE_S * 1000);
  }

  /**
   * One cell against its own row's sum: 2 + 4 + 6 = 12 at Rs 100. A wrong number stays in the cell
   * for the learner to change, the row's three sellers' kilos are re-shown (tinted, and written out as
   * addends in the status line) and the market rope keeps nothing there - no point reaches the plane.
   */
  _judgeRow(i) {
    if (i == null || !this._el?.inputs?.[i]) return;
    // Round two is not open yet, so its cells are not on the board and nothing about them is judged.
    if (!this._unlocked) return;
    const row = ROWS[i];
    const v = cellValue(this._el.inputs[i].value);
    const right = v != null && v === row.sum;
    const was = this._judged[i];
    this._judged[i] = right ? true : (v == null ? null : false);
    if (this._judged[i] !== was) this._msg = this._cellMsg(row, v, right);
    this._paint({ fresh: was !== this._judged[i] ? i : -1 });
    this._score();
  }

  /* ------------------------------------------------------------------ the paint */

  _paint(opts = {}) {
    if (!this._el?.root) return;
    const fresh = opts.fresh ?? -1;

    // A slope verdict is only possible with all three prices carrying a point; before that the bad
    // set is empty and no slot glows.
    this._bad.clear();
    if (!this._slopeOk()) {
      for (let i = 0; i < SLOTS.length - 1; i += 1) {
        const a = kgOf(this._slot[i]);
        const b = kgOf(this._slot[i + 1]);
        if (a != null && b != null && a >= b) { this._bad.add(i); this._bad.add(i + 1); }
      }
    }

    this._el.slots.innerHTML = RAIL.map((i) => this._slotHtml(i)).join('');
    this._el.trayPick.innerHTML = this._trayHtml();
    // Only the slot whose state just changed may replay its shake or pop.
    if (opts.slot != null) this._restart(this._el.slots.querySelector(`[data-bin="s${opts.slot}"]`));

    ROWS.forEach((r, i) => {
      const right = this._judged[i] === true;
      const wrong = this._judged[i] === false;
      this._el.cells[i]?.classList.toggle('is-right', right);
      this._el.cells[i]?.classList.toggle('is-wrong', wrong);
      this._el.rows[i]?.classList.toggle('is-shown', wrong);
      const el = this._el.inputs[i];
      if (el && i === fresh) this._restart(el);
    });

    const slope = this._slopeOk();
    if (slope) this._unlocked = true;
    this._el.root.dataset.round = this._unlocked ? '2' : '1';
    if (this._el.rtag) {
      this._el.rtag.textContent = this._unlocked
        ? 'round 2 \u00b7 the whole market'
        : 'round 1 \u00b7 the seller\u2019s own list';
    }
    // The tray stays live in round two, so a learner who wants to re-read rule 1 by moving a point
    // still can; the label says so.
    if (this._el.trayLabel) {
      this._el.trayLabel.textContent = this._unlocked
        ? 'tray \u00b7 the points can still be moved'
        : 'tray \u00b7 drag a chip to a price';
    }
    if (this._el.rstate) {
      const placed = this._slot.filter((v) => v != null).length;
      this._el.rstate.textContent = this._unlocked
        ? `${placed}/3 points \u00b7 ${this._cellsRight()}/3 totals right`
        : `${placed} of 3 points on the plane`;
    }

    const s = this._el.status;
    if (s) {
      const m = this._statusMsg();
      s.textContent = m ? m.text : '';
      s.classList.toggle('is-right', m?.tone === 'right');
      s.classList.toggle('is-wrong', m?.tone === 'wrong');
    }

    this._paintPlane();
    this._refitToContent();
  }

  /** The status line on its own, so the kit's announcements land in the line the learner is reading. */
  _paintStatus() {
    const s = this._el?.status;
    if (!s) return;
    const m = this._statusMsg();
    s.textContent = m ? m.text : '';
    s.classList.toggle('is-right', m?.tone === 'right');
    s.classList.toggle('is-wrong', m?.tone === 'wrong');
    this._refitToContent();
  }

  /**
   * `FIT` sizes the frame to the content, but only when the scene asks it to measure, and two things
   * here change the board's height under the learner's hands: round two's table, and the status line
   * wrapping to a second line for a longer verdict. Left unmeasured, the frame kept its old height and
   * the note line at the foot was the part that got cut, so the height is compared on every paint.
   */
  _refitToContent() {
    const h = Math.round(this._el?.root?.getBoundingClientRect?.().height ?? 0);
    if (!h || h === this._h) return;
    this._h = h;
    this.refit?.();
  }

  /** Restart a one-shot animation on the element whose state has just changed. */
  _restart(el) {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  /** One price slot: its own price, then either the chip sitting on it or a dashed "?". */
  _slotHtml(i) {
    const p = SLOTS[i];
    const id = this._slot[i];
    const kg = kgOf(id);
    const cls = ['spg-slot'];
    if (id != null) cls.push('is-full');
    if (this._bad.has(i)) cls.push('is-bad');
    const body = id != null
      ? `<span class="spg-chip" data-item="${id}" role="button" tabindex="0"`
        + ` aria-label="${kg} kg on the ${money(p)} price">${kg} kg</span>`
      : '<span class="spg-slot__q">?</span>';
    return `<div class="${cls.join(' ')}" data-bin="s${i}"`
      + ` aria-label="the ${money(p)} price, ${id == null ? 'empty' : `${kg} kg`}">`
      + `<span class="spg-slot__price">${money(p)}</span>${body}</div>`;
  }

  /** The chips that are on no price. Three slots hold three points, so two chips are always here. */
  _trayHtml() {
    return CHIPS.filter((c) => !this._slot.includes(c.id))
      .map((c) => `<span class="spg-chip" data-item="${c.id}" role="button" tabindex="0"`
        + ` aria-label="${c.kg} kg chip">${c.kg} kg</span>`)
      .join('');
  }

  _cellsRight() {
    return ROWS.filter((r, i) => cellValue(this._el?.inputs?.[i]?.value) === r.sum).length;
  }

  /**
   * The status line is the rule that was just tested: what the learner needs to hear, never the
   * answer. The first thing the learner has to do leads until they do something.
   */
  _statusMsg() {
    const both = this._slopeOk() && this._columnOk();
    if (both) return { text: 'both rules hold: the slope climbs and the column adds up', tone: 'right' };
    if (this._msg) return this._msg;
    // With the slope settled the board keeps saying so, so the round-two learner can still read it.
    if (this._slopeOk() || !this._unlocked) return this._slopeMsg();
    const n = ROWS.filter((_, i) => cellValue(this._el?.inputs?.[i]?.value) != null).length;
    return { text: n ? `${n} of 3 totals typed` : 'type what the market takes at that price', tone: '' };
  }

  /** Rule 1's own words, whether it holds or not. */
  _slopeMsg() {
    const placed = this._slot.filter((v) => v != null).length;
    if (this._slopeOk()) {
      return { text: `the slope climbs: ${SLOTS.map((_, i) => kgOf(this._slot[i])).join(' kg \u2192 ')} kg`, tone: 'right' };
    }
    if (placed < SLOTS.length) return { text: `${placed} of 3 points on the plane`, tone: '' };
    const i = this._bad.has(0) ? 0 : 1;
    const same = kgOf(this._slot[i]) === kgOf(this._slot[i + 1]);
    return {
      text: same
        ? 'flat: a higher price needs a bigger pile'
        : `${money(SLOTS[i + 1])} offers no more than ${money(SLOTS[i])}: the pile must grow`,
      tone: 'wrong',
    };
  }

  _cellMsg(row, v, right) {
    if (v == null) return null;
    return right
      ? { text: `${money(row.price)}: ${addends(row)} = ${row.sum} kg`, tone: 'right' }
      : { text: `${money(row.price)}: ${addends(row)}`, tone: 'wrong' };
  }

  /* ------------------------------------------------------------------ the plane */

  /** Both traces are drawn from what is on the board, never from a stored answer. */
  _paintPlane() {
    const strand = SLOTS.map((p, i) => ({ x: kgOf(this._slot[i]), y: p })).filter((p) => p.x != null);
    const rope = ROWS.map((r, i) => ({ x: cellValue(this._el?.inputs?.[i]?.value), y: r.price }))
      .filter((p, i) => p.x != null && p.x === ROWS[i].sum)
      .sort((a, b) => a.y - b.y);
    for (const kind of ['land', 'port']) {
      const el = kind === 'land' ? this._el.landSvg : this._el.portSvg;
      if (el) el.innerHTML = this._chartInner(kind, strand, rope);
    }
  }

  /** The two chart boxes: one per orientation, so neither is a shrunken copy of the other. */
  _chartSvg(kind) {
    const box = kind === 'land' ? { w: 496, h: 220 } : { w: 356, h: 250 };
    return `<svg class="spg-svg spg-svg--${kind}" data-svg="${kind}" viewBox="0 0 ${box.w} ${box.h}"`
      + ` width="${box.w}" height="${box.h}" role="img" preserveAspectRatio="xMidYMid meet"`
      + ` aria-label="Price-quantity plane: seller A's own points, and the market total from the cells that are right">`
      + `${this._chartInner(kind, [], [])}</svg>`;
  }

  /** SimChart's own furniture, then the market rope, then A's strand on top, then the two legends' points. */
  _chartInner(kind, strand, rope) {
    const land = kind === 'land';
    const f = chartFrame({
      rect: land ? { x: 0, y: 0, w: 496, h: 220 } : { x: 0, y: 0, w: 356, h: 250 },
      x: { min: 0, max: X_MAX, ticks: [0, 5, 10, 15, 20], label: land ? 'kg of mangoes supplied' : 'kg supplied' },
      y: { min: 0, max: Y_MAX, ticks: [0, 50, 100, 150], label: land ? 'price of mangoes (Rs)' : 'price (Rs)' },
    });
    let { svg } = axesSvg(f);
    // The market rope first, so the one seller's steeper strand always reads on top of it.
    if (rope.length) svg += traceSvg(f, rope, { tone: 2, width: 5, draw: true }).svg;
    if (strand.length) svg += traceSvg(f, strand, { tone: 1, width: 5, draw: true }).svg;
    svg += rope.map((p) => this._pointSvg(f, p, 2, rope)).join('');
    svg += strand.map((p) => this._pointSvg(f, p, 1, strand)).join('');
    if (!strand.length && !rope.length) {
      svg += `<text x="${(f.plot.x + f.plot.w / 2).toFixed(1)}" y="${(f.plot.y + f.plot.h / 2).toFixed(1)}"`
        + ` text-anchor="middle" style="fill:var(--sim-label-muted);font:700 var(--sim-text-md)/1 var(--sim-font)">`
        + `no point on the plane yet</text>`;
    }
    return svg;
  }

  /**
   * One marker with the number the board is showing, read off the slot or the cell. A number centred
   * under its point would land on the trace whenever another point of the same series sits directly
   * below it - a flat or vertical run - and the two labels then read as one stack across a broken line,
   * so that one number goes beside its point, where the plane is empty.
   */
  _pointSvg(f, p, tone, series = []) {
    const x = f.px(p.x);
    const y = f.py(p.y);
    const stacked = series.some((q) => q.x === p.x && f.py(q.y) > y + 2);
    const lx = stacked ? x + 12 : x;
    const ly = y + (stacked ? 5 : 26);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5"`
      + ` style="fill:var(--sim-series-${tone});stroke:var(--sim-bg-surface);stroke-width:3"/>`
      + `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${stacked ? 'start' : 'middle'}"`
      + ` style="fill:var(--sim-label);font:800 var(--sim-text-sm)/1 var(--sim-font)">${p.x}</text>`;
  }

  /* ------------------------------------------------------------------ the verdict */

  /** Hand the board to the challenge wrapper, and let it decide when it is solved. */
  _score() {
    if (!this.checkObjective()) return;
    const res = this.evaluate();
    if (res.solved && !this._celebrated) {
      this._celebrated = true;
      this._paint();
      // The confetti lands on the plane a beat after the last rule turns green.
      this._burstT = setTimeout(() => burst(this._el?.plane), 260);
    } else if (!res.solved) {
      this._celebrated = false;
    }
  }
}