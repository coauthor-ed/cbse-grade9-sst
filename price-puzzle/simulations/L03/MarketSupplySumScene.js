/**
 * MarketSupplySumScene - blk-l03-s04, "Three Sellers, One Column".
 *
 * Table 9.2 as a ledger the learner works: three sellers' quantities at three prices, and a market
 * supply column that starts empty. Tapping a price row lights that row's three seller cells and
 * drops their sum into the market cell - the horizontal summation the slide states, done by hand
 * rather than shown as a picture of it.
 *
 * What this file will not do, all from the stub:
 *   - it plots nothing. No market supply curve, no plane, no equilibrium - the column is a column.
 *   - it does not store an answer to compare against: each market cell is written from that row's
 *     own three numbers (`q.reduce`), read off the table the learner is looking at.
 *   - it names no seller-side idea the lesson has not taught (no other supply determinants, no
 *     money beyond the price per kilo).
 *
 * Numbers are Table 9.2 exactly (see FIGURES.md): 1/3/2 -> 6 at Rs 50, 2/4/6 -> 12 at Rs 100,
 * 3/7/8 -> 18 at Rs 150.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';

/* ------------------------------------------------------------------ the ledger */

// Table 9.2, row for row, the slide's own order (cheapest first). `sum` is not a stored answer to
// type against - it is the row's own three numbers added, in the same shape as the textbook column.
const ROWS = [
  { price: 50, q: [1, 3, 2] },
  { price: 100, q: [2, 4, 6] },
  { price: 150, q: [3, 7, 8] },
].map((r) => ({ ...r, sum: r.q.reduce((a, b) => a + b, 0) }));

const SELLERS = ['Seller A', 'Seller B', 'Seller C'];
const RUPEE = '\u20b9';            // the rupee sign, as an escape
const POP_MS = 420;                // one row's cells swelling as their sum lands

/** "Rs 100" with the rupee sign - the price a row's own label says. */
const money = (v) => `${RUPEE}${v}`;
/** "2 + 4 + 6" - the row's addends. */
const addends = (row) => row.q.join(' + ');

const CSS = SIM_LOOK_DOM_CSS + `
.mss-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }

/* one chip slot: the hint, the rule, then the finished column - same box, so no beat reflows */
.mss-chip { margin: 0; align-self: flex-start; }
.mss-chip.is-pulse { animation: mss-pulse 1.4s ease-in-out infinite; }
@keyframes mss-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }

/* ---- the ledger ---- */
.mss-book { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.mss-table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.mss-table th, .mss-table td { padding: 4px 6px; text-align: center; }
.mss-table thead th { font: 800 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 2px solid var(--sim-stroke); vertical-align: bottom; padding-bottom: 6px; }
.mss-table thead th span { display: block; }
.mss-table thead th.is-market { color: var(--sim-accent); }
.mss-table tbody th { font-weight: 400; }
.mss-table tbody tr { cursor: pointer; }
.mss-table tbody tr + tr th, .mss-table tbody tr + tr td { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); }
.mss-table tbody tr:hover td, .mss-table tbody tr:hover th { background: color-mix(in oklab, var(--sim-accent) 8%, transparent); }

/* the price cell is the tap target: a real button, so the keyboard reaches it too. Its added state
   is a tint rather than a solid fill, so the label needs no theme-dependent ink on top. */
.mss-price { width: 100%; padding: 6px 8px; font: 800 var(--sim-text-md)/1.1 var(--sim-font);
  color: var(--sim-label); background: transparent; border: 2px solid var(--sim-stroke);
  border-radius: var(--sim-radius-sm); cursor: pointer; }
.mss-price:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.mss-row.is-added .mss-price { background: color-mix(in oklab, var(--sim-accent) 30%, var(--sim-bg-surface));
  border-color: var(--sim-accent); }
.mss-row.is-suggested .mss-price { border-color: var(--sim-accent); border-style: dashed; }

/* a seller's kilograms: plain until its row is added, then lit for good */
.mss-q { font: 800 var(--sim-text-lg)/1.2 var(--sim-font); color: var(--sim-label);
  transition: background-color 0.25s ease, color 0.25s ease; border-radius: var(--sim-radius-sm); }
.mss-row.is-added .mss-q { background: color-mix(in oklab, var(--sim-accent) 40%, var(--sim-bg-surface)); }

/* the market cell: dashed and unknown until the row is added, then the sum in bold */
.mss-total { display: flex; align-items: center; justify-content: center; gap: 4px; min-height: 38px;
  padding: 3px 6px; border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-sm);
  font: 800 var(--sim-text-lg)/1.1 var(--sim-font); color: var(--sim-label-muted); }
.mss-row.is-added .mss-total { border-style: solid; border-color: var(--sim-good);
  background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); color: var(--sim-label); }
.mss-row.is-fresh .mss-total { animation: mss-pop ${POP_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes mss-pop { from { transform: scale(0.7); } to { transform: scale(1); } }

/* ---- the status line: the row just added, as arithmetic and nothing else ---- */
.mss-status { margin: 0; min-height: 1.3em; font: 800 var(--sim-text-md)/1.3 var(--sim-font);
  color: var(--sim-label-muted); font-variant-numeric: tabular-nums; }
.mss-status.is-set { color: var(--sim-label); }

/* portrait: the four seller names need the room, so the tracks are auto-sized here and the
   market cell's padding thins - nothing shrinks under 14px */
.sim-dom-root--portrait .mss-table thead th { font-size: var(--sim-text-sm); padding: 3px 2px; }
.sim-dom-root--portrait .mss-total { padding: 3px 2px; }
`;

export class MarketSupplySumScene extends DomSimulation {
  static WIDTH = 620;
  static HEIGHT = 380;           // sim-layout: the content measures 367px in landscape, 396 in portrait
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 410;
  static FIT = true;              // ...and it is the same height on every beat, so the frame is content-sized anyway
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }], // the ledger, market column empty, a chip saying what to tap
    [{ idx: 1, dwellMs: null }], // the same ledger, the Rs 100 row marked as where to start
    [{ idx: 2, dwellMs: null }], // the rule chip, all three rows free
  ];
  static ARIA_LABEL =
    'A supply table with three price rows - 50, 100 and 150 rupees - three seller columns (Seller A, Seller B, Seller C) '
    + 'and a market supply column that starts empty. Tapping a price lights that row\'s three seller numbers and fills '
    + 'the market cell with their sum: 6, 12 and 18 kilograms. The market column is complete when all three rows are added.';
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._added = ROWS.map(() => false);   // one flag per row: the learner's own column, kept across beats
    this._last = null;                     // index of the row added last, for the status line
    this._celebrated = false;
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="mss-root">
          <p class="sim-tag mss-chip" data-chip role="status" aria-live="polite"></p>

          <div class="sim-card mss-book" data-book>
            <table class="mss-table" aria-label="Each seller's kilograms at each price, with the market total">
              <caption class="sim-meta">kilograms each seller brings at that price</caption>
              <thead>
                <tr>
                  <th scope="col"><span>price</span><span>per kg</span></th>
                  ${SELLERS.map((s) => `<th scope="col"><span>${esc(s)}</span></th>`).join('')}
                  <th scope="col" class="is-market"><span>market supply</span><span>kg</span></th>
                </tr>
              </thead>
              <tbody>
                ${ROWS.map((r, i) => `
                  <tr class="mss-row" data-row="${i}">
                    <th scope="row"><button class="mss-price" type="button" data-add="${i}"
                      aria-label="add up the three sellers at ${money(r.price)} per kilo">${money(r.price)}</button></th>
                    ${r.q.map((q) => `<td><span class="mss-q">${q}</span></td>`).join('')}
                    <td><span class="mss-total" data-total="${i}">?</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <p class="mss-status" data-status role="status" aria-live="polite"></p>

          ${noteLineHtml([
            { text: 'Three stalls, one market column: each row is added across at the same price.' },
          ])}
        </div>`,
    });

    applyToneInks(this.root);

    this._el = {
      book: this.root?.querySelector?.('[data-book]'),
      chip: this.root?.querySelector?.('[data-chip]'),
      status: this.root?.querySelector?.('[data-status]'),
      rows: ROWS.map((_, i) => this.root?.querySelector?.(`tr[data-row="${i}"]`)),
      totals: ROWS.map((_, i) => this.root?.querySelector?.(`[data-total="${i}"]`)),
    };

    // One handler for the whole body: the price button and the empty space around a cell are the
    // same tap on a phone, and a button click bubbles here too.
    this.root?.querySelector?.('tbody')?.addEventListener?.('click', (e) => {
      const tr = e.target?.closest?.('tr[data-row]');
      if (tr) this._addRow(Number(tr.dataset.row));
    });

    this._paint();
  }

  destroy() {
    this._el = null;
    super.destroy();
  }

  /* ------------------------------------------------------------------ the tapping */

  /**
   * The stub's dial: tap a price row, that row's three seller cells light and their sum lands in
   * the market cell. A row already added is left alone - the column is a set, so a second tap can
   * neither change a number nor replay its pop.
   */
  _addRow(i) {
    if (!(i >= 0) || i >= ROWS.length || this._added[i]) return;
    this._added[i] = true;
    this._last = i;
    this._paint({ fresh: i });
    if (this._added.every(Boolean) && !this._celebrated) {
      this._celebrated = true;
      burst(this._el?.book);
    }
  }

  // The base class clamps the beat, sets this.stepIndex and root.dataset.step, then calls this.
  // The learner's column is their own work, so a beat change never clears it - only the chip and
  // the Rs 100 suggestion are the beat's.
  onStep() {
    this._paint();
  }

  /* ------------------------------------------------------------------ the paint */

  /** Cell states, the chip and the status line, all from the column as it stands. */
  _paint(opts = {}) {
    if (!this._el) return;
    const fresh = opts.fresh ?? -1;

    ROWS.forEach((r, i) => {
      const on = this._added[i];
      this._el.rows[i]?.classList.toggle('is-added', on);
      this._el.rows[i]?.classList.toggle('is-suggested', this.stepIndex === 1 && i === 1 && !on);
      const t = this._el.totals[i];
      if (t) {
        t.textContent = on ? String(r.sum) : '?';
        t.setAttribute('aria-label', on ? `market supply ${r.sum} kilograms` : 'not added yet');
      }
      // Restart the pop only for the row whose sum just landed.
      const tr = this._el.rows[i];
      if (tr && i === fresh) {
        tr.classList.remove('is-fresh');
        void tr.offsetWidth;
        tr.classList.add('is-fresh');
      }
    });

    const chip = this._el.chip;
    if (chip) {
      const done = this._added.every(Boolean);
      const [text, tone] = done
        ? [`${ROWS.map((r) => r.sum).join(', ')} kg in the market column`, 'accent']
        : this.stepIndex >= 2
          ? ['add across the row', 'accent']
          : this.stepIndex === 1
            ? [`start at ${money(100)}`, null]
            : ['tap a price to add that row', null];
      chip.textContent = text;
      chip.className = `sim-tag mss-chip${tone === 'accent' ? ' sim-tag--accent' : ''}`;
      chip.classList.toggle('is-pulse', !done && tone !== 'accent');
    }

    const s = this._el.status;
    if (s) {
      const row = this._last == null ? null : ROWS[this._last];
      s.textContent = row ? `${money(row.price)}: ${addends(row)} = ${row.sum} kg` : '';
      s.classList.toggle('is-set', !!row);
    }
  }
}
