/**
 * SellerCountScene - blk-l04-s04, "How Many Stalls?".
 *
 * The slide's claim - "Supply is built from the count of participants as much as from each
 * participant" - as a market lane of six stall pitches over a supply ledger. Every stall brings the
 * same 2 / 4 / 6 kg at the three prices, so the market column is exactly `count x one stall`: the
 * count is the only thing that ever moves it. Beats open and close stalls; the learner can open or
 * close any stall by tapping its pitch.
 *
 * What this file will not do, all from the stub:
 *   - it draws no curve, no plane and no equilibrium: the market column is a column of kilograms.
 *   - it never moves a price. The three prices are the same on every beat, and the Rs 100 row is
 *     always the one the status line writes out.
 *   - it names no other supply determinant (related-good profitability, technology, expectations).
 *
 * Prices 50 / 100 / 150 are Table 9.2's three rows; three stalls at 2 / 4 / 6 kg give 6 / 12 / 18 kg,
 * which is Table 9.2's market column exactly. The per-stall split is [derived] - see the design
 * note's Requests: the slide and the stub both say every stall brings 4 kg at Rs 100.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const RUPEE = '\u20b9';
const TIMES = '\u00d7';
const DASH = '\u2013';
const POP_MS = 420;
const STAGGER_MS = 120;

/* ------------------------------------------------------------------ the model */

// Table 9.2's three price rows (Rs per kg), cheapest first, and the one stall's own list: the
// same three prices, one seller each. Identical stalls are what make the count the only variable.
const PRICE = [50, 100, 150];
const PER_STALL = [2, 4, 6];

const STALLS = ['A', 'B', 'C', 'D', 'E', 'F'];
// Which stalls each beat puts in the market. Beat 1 is the slide's "three new stalls open"; beat 2
// is its "some stalls close for the season", so the third new stall stays and four sell.
const BEAT_SET = [
  ['A', 'B', 'C'],
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['A', 'B', 'C', 'D'],
];
// When each stall first exists. A pitch before this beat is inert, so the learner cannot open a
// stall the beat is about to open.
const ARRIVES = STALLS.map((s) => BEAT_SET.findIndex((set) => set.includes(s)));

const BEAT_CHIP = [
  'tap a stall to close it',
  'same prices, more sellers',
  'the count moved, not the price',
];

const money = (v) => `${RUPEE}${v}`;
const stalls = (n) => `${n} stall${n === 1 ? '' : 's'}`;

/* ------------------------------------------------------------------ the look */

const CSS = SIM_LOOK_DOM_CSS + `
.scs-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }

/* ---- one chip slot for both chips, so no beat changes the height ---- */
.scs-chips { display: flex; flex-wrap: wrap; gap: var(--sim-space-2); margin: 0; align-items: center; }
.scs-chip { margin: 0; }
.scs-chip.is-pulse { animation: scs-pulse 1.4s ease-in-out infinite; }
@keyframes scs-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }

/* ---- the market lane: six fixed pitches on a ground line, so opening a stall never reflows ---- */
.scs-lane { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--sim-space-2);
  padding-bottom: var(--sim-space-1);
  border-bottom: 2px dashed color-mix(in oklab, var(--sim-stroke) 60%, transparent); }
.scs-stall { display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; min-height: 82px; padding: 4px 2px; box-sizing: border-box; cursor: pointer;
  color: var(--sim-accent); font: var(--sim-font); background: var(--sim-bg-surface);
  border: 2px solid var(--sim-accent); border-radius: var(--sim-radius-sm) var(--sim-radius-sm) 0 0; }
.scs-stall:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.scs-stall .sim-icon { width: 26px; height: 26px; }
.scs-stall__name { font: 800 var(--sim-text-lg)/1.1 var(--sim-font); color: var(--sim-label); }
.scs-stall__state { font: 700 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted); }

/* shut for the season: still a stall, out of the sum - dashed and muted, never erased */
.scs-stall.is-shut { color: var(--sim-label-muted); border-style: dashed; border-color: var(--sim-stroke);
  background: transparent; }
.scs-stall.is-shut .scs-stall__name { color: var(--sim-label-muted); }
/* a pitch the market has not filled yet: inert, empty, and it says so rather than looking broken */
.scs-stall.is-vacant { cursor: default; border-style: dashed; border-color: var(--sim-stroke); background: transparent; }
.scs-stall.is-vacant > *:not(.scs-stall__empty) { display: none; }
.scs-stall__empty { display: none; font: 700 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted); }
.scs-stall.is-vacant .scs-stall__empty { display: block; }
.scs-stall.is-arrive { animation: scs-arrive ${POP_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes scs-arrive { from { transform: scale(0.6); opacity: 0.2; } to { transform: scale(1); opacity: 1; } }

/* ---- the ledger ---- */
.scs-book { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.scs-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.scs-table th, .scs-table td { padding: 4px 3px; text-align: center; }
.scs-table thead th { font: 800 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 2px solid var(--sim-stroke); padding-bottom: 6px; }
.scs-table thead th.is-market { color: var(--sim-good); }
.scs-table thead th span { display: block; }
.scs-table tbody th { font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); }
.scs-table tbody tr + tr th, .scs-table tbody tr + tr td { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); }

.scs-stall-head.is-shut { color: var(--sim-label-muted); }

/* one stall's kilograms: the same number in every stall column, price by price */
.scs-q { display: block; font: 800 var(--sim-text-lg)/1.25 var(--sim-font); color: var(--sim-label);
  border-radius: var(--sim-radius-sm); }
.scs-q.is-shut { color: var(--sim-label-muted); border: 2px dashed color-mix(in oklab, var(--sim-stroke) 60%, transparent); }
.scs-q.is-vacant { color: var(--sim-label-muted); font-weight: 400; }

/* the market cell: count x one stall, always a number */
.scs-total { display: flex; align-items: center; justify-content: center; min-height: 40px; padding: 3px 4px;
  border: 2px solid var(--sim-good); border-radius: var(--sim-radius-sm);
  background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface));
  font: 800 var(--sim-text-lg)/1.1 var(--sim-font); color: var(--sim-label); }
.scs-total.is-fresh { animation: scs-pop ${POP_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes scs-pop { from { transform: scale(0.7); } to { transform: scale(1); } }

/* ---- the status line: the Rs 100 row written out as the count times one stall ---- */
.scs-status { margin: 0; min-height: 1.3em; font: 800 var(--sim-text-md)/1.3 var(--sim-font);
  color: var(--sim-label); font-variant-numeric: tabular-nums; }

/* portrait: the six stall pitches wrap to two rows of three; the table thins its padding only */
.sim-dom-root--portrait .scs-lane { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.sim-dom-root--portrait .scs-book { padding: var(--sim-space-2); }
.sim-dom-root--portrait .scs-table th, .sim-dom-root--portrait .scs-table td { padding: 4px 1px; }
`;

/* ------------------------------------------------------------------ the scene */

export class SellerCountScene extends DomSimulation {
  static WIDTH = 660;
  static HEIGHT = 451;          // sim-layout: the content measures 451px in landscape, 622 in portrait
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 622;
  static FIT = true;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }],   // three stalls, the market column summed over them
    [{ idx: 1, dwellMs: null }],   // three new stalls open, the column rises at every price
    [{ idx: 2, dwellMs: null }],   // two of the new ones close for the season, the column shrinks
  ];
  static ARIA_LABEL =
    'A market lane of six stall tiles above a supply table. The table has three price rows - 50, 100 and 150 rupees per kilo - '
    + 'six stall columns A to F and a market supply column. Three stalls open give 6, 12 and 18 kilograms; when three more '
    + 'stalls open the column reads 12, 24 and 36 at the same prices; when two of the new stalls close it reads 8, 16 and 24. '
    + 'Tapping a stall tile closes it or opens it again and the market column follows.';
  static CONTROLS = [];          // the stub says "Dials: none" - the lane tiles are the dial, in panel

  constructor(container, config) {
    super(container, config);
    this._open = new Set();      // the stalls in the market right now, beats and learner together
    this._byHand = false;        // has the learner, not a beat, moved the count
    this._celebrated = false;
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="scs-root">
          <p class="scs-chips">
            <span class="sim-tag sim-tag--accent scs-chip" data-count role="status" aria-live="polite"></span>
            <span class="sim-tag scs-chip" data-beat></span>
          </p>

          <div class="scs-lane" role="group" aria-label="the stalls in today's market lane">
            ${STALLS.map((s) => `
              <button class="scs-stall" type="button" data-stall="${s}" aria-pressed="true">
                <span class="scs-stall__icon">${iconSvg('shop', 'currentColor')}</span>
                <span class="scs-stall__name">${s}</span>
                <span class="scs-stall__state"></span>
                <span class="scs-stall__empty">empty</span>
              </button>`).join('')}
          </div>

          <div class="sim-card scs-book" data-book>
            <table class="scs-table" aria-label="The kilograms each stall brings at each price, and the market total">
              <caption class="sim-meta">kilograms one stall brings at that price</caption>
              <colgroup>
                <col style="width: 15%">
                ${STALLS.map(() => '<col style="width: 10%">').join('')}
                <col style="width: 25%">
              </colgroup>
              <thead>
                <tr>
                  <th scope="col"><span>price</span><span>per kg</span></th>
                  ${STALLS.map((s) => `<th scope="col" data-head="${s}">${s}</th>`).join('')}
                  <th scope="col" class="is-market"><span>market supply</span><span>kg</span></th>
                </tr>
              </thead>
              <tbody>
                ${PRICE.map((p, i) => `
                  <tr>
                    <th scope="row">${money(p)}</th>
                    ${STALLS.map((s) => `<td><span class="scs-q" data-q="${s}-${i}">${PER_STALL[i]}</span></td>`).join('')}
                    <td><span class="scs-total" data-total="${i}"></span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <p class="scs-status" data-status role="status" aria-live="polite"></p>

          ${noteLineHtml([
            { text: 'the count of sellers moved - no stall changed its own kilograms' },
          ])}
        </div>`,
    });

    this._el = {
      book: this.root?.querySelector?.('[data-book]'),
      chipCount: this.root?.querySelector?.('[data-count]'),
      chipBeat: this.root?.querySelector?.('[data-beat]'),
      status: this.root?.querySelector?.('[data-status]'),
      stalls: STALLS.map((s) => this.root?.querySelector?.(`[data-stall="${s}"]`)),
      heads: STALLS.map((s) => this.root?.querySelector?.(`[data-head="${s}"]`)),
      q: STALLS.map((s) => PRICE.map((_, i) => this.root?.querySelector?.(`[data-q="${s}-${i}"]`))),
      totals: PRICE.map((_, i) => this.root?.querySelector?.(`[data-total="${i}"]`)),
    };

    // One handler for the lane: a stall pitch is the tap target, so a phone tap and Enter both land.
    this._el.lane = this.root?.querySelector?.('.scs-lane');
    this._el.lane?.addEventListener?.('click', (e) => {
      const tile = e.target?.closest?.('[data-stall]');
      if (tile && !tile.disabled) this._toggle(tile.dataset.stall);
    });

    // A mount can open on any beat, so the set starts at this beat's before anything is painted.
    this._open = new Set(BEAT_SET[this._beat()]);
    this._paint();
  }

  destroy() {
    this._el = null;
    super.destroy();
  }

  /* ------------------------------------------------------------------ the beats and the taps */

  /** The clamped beat index: a mount can open on any beat, and none may be past the last. */
  _beat() {
    const i = Number(this.stepIndex);
    return Number.isFinite(i) && i >= 0 ? Math.min(i, BEAT_SET.length - 1) : 0;
  }

  /** A beat change: the beat's own stalls open or close on top of whatever the learner has done. */
  onStep() {
    const want = new Set(BEAT_SET[this._beat()]);
    STALLS.forEach((s) => {
      const here = this._open.has(s);
      const there = want.has(s);
      if (here === there) return;
      if (there) this._open.add(s); else this._open.delete(s);
      this._el?.stalls?.[STALLS.indexOf(s)]?.classList.add(there ? 'is-arrive' : 'is-shut');
    });
    this._byHand = false;
    this._celebrated = false;
    this._paint({ fresh: 'all' });
  }

  /** The learner's own dial: a tap on a stall pitch opens it or closes it, and the column follows. */
  _toggle(s) {
    const i = STALLS.indexOf(s);
    if (i < 0 || ARRIVES[i] > this._beat()) return;   // a stall cannot arrive before its beat
    if (this._open.has(s)) this._open.delete(s); else this._open.add(s);
    this._byHand = true;
    const tile = this._el?.stalls?.[i];
    if (tile) {
      tile.classList.remove('is-arrive');
      void tile.offsetWidth;
      if (this._open.has(s)) tile.classList.add('is-arrive');
    }
    this._paint({ fresh: 'all' });
    if (!this._celebrated) {
      this._celebrated = true;
      burst(this._el?.book);
    }
  }

  /* ------------------------------------------------------------------ the paint */

  /** Tiles, cells, market column, chips and status line, all from the open set as it stands. */
  _paint(opts = {}) {
    if (!this._el) return;
    const beat = this._beat();
    const n = this._open.size;
    const fresh = opts.fresh === 'all';

    STALLS.forEach((s, i) => {
      const tile = this._el.stalls?.[i];
      const vacant = ARRIVES[i] > beat;
      const open = !vacant && this._open.has(s);
      if (tile) {
        tile.classList.toggle('is-vacant', vacant);
        tile.classList.toggle('is-shut', !vacant && !open);
        tile.disabled = vacant;
        tile.setAttribute('aria-pressed', String(open));
        tile.setAttribute('aria-label', vacant
          ? `empty pitch, no stall yet`
          : `Seller ${s}, ${open ? 'open in the market' : 'closed for the season'} - tap to ${open ? 'close' : 'open'} it`);
        const state = tile.querySelector?.('.scs-stall__state');
        if (state) state.textContent = vacant ? '' : (open ? 'open' : 'closed');
      }
      this._el.heads?.[i]?.classList.toggle('is-shut', vacant || !open);
      PRICE.forEach((_, r) => {
        const cell = this._el.q?.[i]?.[r];
        if (!cell) return;
        cell.classList.toggle('is-vacant', vacant);
        cell.classList.toggle('is-shut', !vacant && !open);
        cell.textContent = vacant ? DASH : String(PER_STALL[r]);
        cell.setAttribute('aria-label', vacant
          ? `no stall at pitch ${s} yet`
          : `stall ${s} brings ${PER_STALL[r]} kilograms`);
      });
    });

    PRICE.forEach((p, i) => {
      const total = PER_STALL[i] * n;
      const cell = this._el.totals?.[i];
      if (cell) {
        cell.textContent = String(total);
        cell.setAttribute('aria-label', `market supply ${total} kilograms at ${money(p)} per kilo`);
        if (fresh) {
          cell.classList.remove('is-fresh');
          void cell.offsetWidth;
          cell.classList.add('is-fresh');
        }
      }
    });

    if (this._el.chipCount) this._el.chipCount.textContent = `${stalls(n)} in the market`;
    if (this._el.chipBeat) {
      this._el.chipBeat.textContent = this._byHand ? 'you changed the count, not a price' : BEAT_CHIP[beat];
      this._el.chipBeat.classList.toggle('is-pulse', beat === 0 && !this._byHand);
    }
    if (this._el.status) {
      this._el.status.textContent = `${money(PRICE[1])}: ${PER_STALL[1]} kg ${TIMES} ${stalls(n)} = ${PER_STALL[1] * n} kg`;
    }
  }
}
