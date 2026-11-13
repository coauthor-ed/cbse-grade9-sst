import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc, simTag } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';

/**
 * MarketDemandSumScene - three buyers' rows, added up one price at a time.
 *
 * Two mounts, one file. blk-l02-s01 mounts it with `role: "setup"` and no beats, so the
 * host hands the scene a beat count of 0; blk-l02-s02 mounts the same file with 3 beats.
 * The scene cannot see the slide, only the count, so `beatCount === 0` IS the setup mount
 * (the SrivalliScene / TicketBoothScene reading). On that mount the three price cells are
 * plain labels - not disabled buttons - and **no total is anywhere in the document**: the
 * predict prompt beside it asks what the three buyers take together at Rs 100, and a panel
 * that already held 12 kg would have answered it.
 *
 * The one interaction the stub asks for: tap a price row, that row's buyer cells light and
 * its market cell takes the row's sum (6, 12, 18 kg) with its bar growing on one shared
 * scale. Nothing runs and nothing counts down - the table rests at the last tapped row.
 */

/**
 * Table 9.1 exactly (FIGURES.md), in the order the stub asks for: Rs 150, Rs 100, Rs 50.
 * `verdict` marks the one row whose addition the verdict may name on beat 0.
 */
const ROWS = [
  { p: 150, kg: [1, 2, 3], sum: 6, verdict: false },
  { p: 100, kg: [2, 4, 6], sum: 12, verdict: true },
  { p: 50, kg: [3, 6, 9], sum: 18, verdict: false },
];

/** The three buyers, each with the tone its column's bar carries. */
const BUYERS = [
  { name: 'Srivalli', fill: 'var(--sim-series-2)' },
  { name: 'Alex', fill: 'var(--sim-series-5)' },
  { name: 'Israt', fill: 'var(--sim-series-7)' },
];

/** One scale for every column, so 6 / 12 / 18 kg really is 6 / 12 / 18 of the column. */
const SCALE_KG = 18;

const NOTE_ROWS = [
  { text: 'Three buyers, one stall, one season - the table adds their lists at one price and nothing else.' },
];

/** Beat 2's strip: two moves already in the table, set against each other. */
const SHAPE = [
  { label: 'Srivalli', from: 1, to: 3, fill: BUYERS[0].fill },
  { label: 'everyone', from: 6, to: 18, fill: 'var(--sim-accent)' },
];

// One entry per real beat of blk-l02-s02; the setup mount never gets one.
const MAP_VERDICT = [
  [{ idx: 0, dwellMs: null }], // the verdict: tap a row, its sum lands in the market column
  [{ idx: 1, dwellMs: null }], // market demand, named: the rule chip "add the row"
  [{ idx: 2, dwellMs: null }], // the shape survives the sum: same direction, wider move
];

const CSS = `${SIM_LOOK_DOM_CSS}
/* sim-lint-ignore token: --sim-ink-on-accent is not a stylesheet token; applyToneInks(this.root) sets it per theme, which is the only thing that can pick readable ink on a filled price button in both themes. */
.mds { width: 100%; display: grid; gap: var(--sim-space-2); align-content: start; }
.mds-card { gap: var(--sim-space-2); }
.mds-title { margin: 0; font-size: var(--sim-text-lg); }

/* card head: the title, and the hint chip beside it (never over a row) */
.mds-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sim-space-2); }
.mds-hint { margin: 0; display: flex; align-items: center; gap: var(--sim-space-1); padding: 3px var(--sim-space-2); border-radius: var(--sim-radius-pill); border: var(--sim-border-width) solid var(--sim-accent); color: var(--sim-accent); font-size: var(--sim-text-sm); font-weight: 800; }
.mds-hint__dot { width: 9px; height: 9px; border-radius: var(--sim-radius-pill); background: var(--sim-accent); animation: mds-pulse 1.5s ease-in-out infinite; }
@keyframes mds-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

/* the table: one grid, five columns. The price column is narrow and carries the tap;
   the market column is the widest and carries the sum. */
.mds-grid { display: grid; grid-template-columns: 76px repeat(3, minmax(0, 1fr)) 132px; gap: var(--sim-space-2); align-items: stretch; }
.mds-cell { min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 6px var(--sim-space-1); border: var(--sim-border-width) solid transparent; border-radius: var(--sim-radius-sm); background: transparent; color: var(--sim-label); text-align: center; font-family: inherit; }
.mds-cell--head { padding: 0; border: 0; color: var(--sim-label-muted); font-size: var(--sim-text-sm); font-weight: 700; line-height: 1.2; flex-direction: row; gap: 3px; }
.mds-head__u { font-weight: 700; }
.mds-rs { flex: none; }
/* the price cells sit on the recessed fill, not the card's own, so a button reads as a
   button in both themes - and they carry their own colour, because a button does not
   inherit one reliably from the scene root */
.mds-cell--price { border-color: var(--sim-stroke); background: var(--sim-bg-deep); color: var(--sim-label); }
button.mds-cell--price { cursor: pointer; font-family: var(--sim-font-display); }
button.mds-cell--price:hover { border-color: var(--sim-accent); }
.mds-cell--price .mds-p { display: flex; align-items: center; justify-content: center; gap: 2px; font-size: var(--sim-text-xl); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.mds-price[aria-pressed="true"] { border-color: var(--sim-accent); background: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); }

/* a buyer's own cell: the number, and its bar on the shared scale */
.mds-cell--buy { min-height: 66px; color: var(--sim-label-muted); }
.mds-cell--buy .mds-kg { font-size: var(--sim-text-lg); font-weight: 700; font-variant-numeric: tabular-nums; color: var(--sim-label); }
.mds-cell--buy.mds-cell--lit { border-color: var(--sim-accent); background: var(--sim-bg-surface); }
.mds-cell--buy.mds-cell--lit .mds-kg { font-weight: 800; color: var(--sim-label); }
.mds-u { font-size: var(--sim-text-sm); font-weight: 700; margin-left: 2px; }

.mds-bar { display: flex; align-items: center; width: 100%; height: 8px; border-radius: var(--sim-radius-pill); background: var(--sim-track); overflow: hidden; }
.mds-fill { display: block; height: 100%; width: calc(var(--k, 0) * 100%); border-radius: var(--sim-radius-pill); background: var(--sim-series-8); transition: width 300ms cubic-bezier(0.2, 0.8, 0.3, 1.15); }
.mds-bar--mkt { height: 16px; }
.mds-fill--mkt { background: var(--sim-accent); }

/* the market cell: the hero of the table. Its height is reserved from the first paint, so
   filling a row changes nothing about the frame. */
.mds-cell--mkt { min-height: 92px; border-color: var(--sim-stroke); border-style: dashed; }
.mds-cell--mkt.mds-cell--got { border-style: solid; border-color: var(--sim-accent); background: var(--sim-bg-surface); }
.mds-total { display: flex; align-items: center; justify-content: center; min-height: 34px; font-family: var(--sim-font-display); font-size: var(--sim-text-2xl); font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
.mds-cell--got .mds-total { color: var(--sim-label); }
.mds-add { min-height: 20px; font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }

.mds-chips { display: flex; flex-wrap: wrap; gap: var(--sim-space-2); }
.mds-meta { margin: 0; text-align: right; }

/* beat 2's strip: the same table's own numbers, one buyer's move beside the market's.
   One row of two, so beat 2 stays inside the side-panel budget the table already uses. */
.mds-shape { gap: var(--sim-space-2); }
.mds-shape__chips { justify-content: center; }
.mds-moves { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sim-space-4); }
.mds-move { display: grid; grid-template-columns: minmax(0, 1fr); gap: 3px; margin: 0; }
.mds-move + .mds-move { border-left: var(--sim-border-width) solid var(--sim-stroke); padding-left: var(--sim-space-4); }
.sim-dom-root--portrait .mds-move + .mds-move { border-left: 0; padding-left: 0; }
.mds-move__label { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }
.mds-move__body { display: flex; align-items: center; gap: var(--sim-space-2); }
.mds-move__v { font-size: var(--sim-text-md); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.mds-move__v--small { color: var(--sim-label-muted); font-weight: 700; }
.mds-move__arrow { flex: none; color: var(--sim-label-muted); font-size: var(--sim-text-md); font-weight: 800; line-height: 1; }
.mds-move__bar { flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 3px; }
.mds-move__seg { display: block; height: 12px; border-radius: var(--sim-radius-sm); background: var(--sim-series-8); opacity: 0.42; }
.mds-move__seg--to { opacity: 1; }

/* Portrait is its own representation of the same table: 380 px cannot hold five columns of
   names at 14 px, so each price becomes a full-width mini-header and its four cells sit
   under it in one row of four. Same cells, same numbers, no name shortened. */
.sim-dom-root--portrait .mds-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--sim-space-1); }
.sim-dom-root--portrait .mds-cell--price,
.sim-dom-root--portrait .mds-cell--head.mds-cell--price-head { grid-column: 1 / -1; }
.sim-dom-root--portrait .mds-cell--price { flex-direction: row; justify-content: flex-start; gap: var(--sim-space-2); padding: 4px var(--sim-space-2); }
.sim-dom-root--portrait .mds-cell--head.mds-cell--price-head { justify-content: flex-start; padding: 2px var(--sim-space-2); }
.sim-dom-root--portrait .mds-cell--buy .mds-kg { font-size: var(--sim-text-md); }
.sim-dom-root--portrait .mds-total { font-size: var(--sim-text-xl); min-height: 28px; }
.sim-dom-root--portrait .mds-cell--mkt { min-height: 104px; }
/* the addition may break onto a second line here, so its slot is two lines tall */
.sim-dom-root--portrait .mds-add { min-height: 38px; white-space: normal; }
.sim-dom-root--portrait .mds-moves { grid-template-columns: minmax(0, 1fr); gap: var(--sim-space-2); }
`;

const HTML = `
<div class="mds" data-root>
  <article class="sim-card mds-card" aria-label="one price, three buyers, and the market total">
    <div class="mds-head">
      <h2 class="sim-title mds-title">One price, three buyers</h2>
      <p class="mds-hint" data-hint hidden><span class="mds-hint__dot" aria-hidden="true"></span>Tap a price row</p>
    </div>
    <div class="mds-grid" data-grid role="group" aria-label="demand table: one row per price, one column per buyer, then the market total"></div>
    <p class="sim-meta mds-meta">longer bar, more kg - one scale for every column</p>
    <div class="mds-chips" data-chips></div>
  </article>

  <article class="sim-card mds-shape" data-shape hidden aria-label="the same move, one buyer and the whole market">
    <div class="mds-chips mds-shape__chips" data-shape-chips></div>
    <div class="mds-moves" data-moves></div>
  </article>
</div>
${noteLineHtml(NOTE_ROWS)}`;

/**
 * The rupee sign, drawn. The harness here loads no Nunito and the text form tofus (two
 * L02 scenes log the same), so the price column carries a path instead - it inherits
 * `currentColor`, so it also reads on the filled price button in either theme.
 */
function rupeeSvg() {
  return '<svg class="mds-rs" viewBox="0 0 14 14" width="17" height="17" aria-hidden="true" focusable="false">'
    + '<path d="M2.3 3.1h9.4M2.3 5.8h9.4M3.7 3.1v8.1M3.7 3.1h3.7a2.4 2.4 0 0 1 0 4.8H3.7M7.3 7.9l4.7 3.3" '
    + 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/** One market cell's own markup: the sum, its bar on the shared scale, the addition. */
function marketCell(r, i) {
  return `<div class="mds-cell mds-cell--mkt" data-row="${i}" data-mkt="${i}">
      <span class="mds-total" data-total><span class="sim-q" aria-hidden="true">?</span></span>
      <span class="mds-bar mds-bar--mkt"><span class="mds-fill mds-fill--mkt" data-fill style="--k:0"></span></span>
      <span class="mds-add" data-add></span>
    </div>`;
}

export class MarketDemandSumScene extends DomSimulation {
  static WIDTH = 680;
  // sim-layout's numbers over every beat and both orientations, worst interaction state
  // included (filling a row changes nothing: the market cell reserves its own height).
  static HEIGHT = 640;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 895;
  // Beat 1 adds a chip row and beat 2 a card, so the frame is the content showing.
  static FIT = true;
  static BEAT_STEP_MAP = MAP_VERDICT;
  static ARIA_LABEL =
    'A demand table: one row per price, and a column for each of three buyers beside the market. '
    + 'Tapping a price row adds that row\u2019s three numbers and fills the market cell with the total.';
  // The dial is the table itself (the stub's "tapping a price row"), so there is no control
  // bar duplicating three buttons that are already on screen.
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.mount = 'setup';
    this.beat = 0;
    this._filled = ROWS.map(() => false);
    this._last = -1;
    this._builtFor = null;
    this._cells = [];
  }

  async setup() {
    await super.setup();
    this.render({ css: CSS, rootClass: 'sl-backdrop', html: HTML });
    applyToneInks(this.root);

    this._grid = this.root?.querySelector?.('[data-grid]');
    this._hint = this.root?.querySelector?.('[data-hint]');
    this._chips = this.root?.querySelector?.('[data-chips]');
    this._shape = this.root?.querySelector?.('[data-shape]');
    this._shapeChips = this.root?.querySelector?.('[data-shape-chips]');
    this._moves = this.root?.querySelector?.('[data-moves]');

    // One delegated listener: the grid is rebuilt when the mount changes, so a per-cell
    // handler could be left behind.
    this._grid?.addEventListener?.('click', (ev) => {
      const cell = ev.target?.closest?.('[data-row]');
      if (!cell || this.mount !== 'verdict') return;
      this._tap(Number(cell.dataset.row));
    });

    this._build();
    this._paint();
  }

  refreshTheme() {
    super.refreshTheme();
    applyToneInks(this.root);
  }

  destroy() {
    this._cells = [];
    super.destroy();
  }

  // -- beats -------------------------------------------------------------------

  // The host hands over a beat count and never the slide, so the count IS the mount: the
  // setup mount never receives a beat. DomSimulation's declarative default reads only
  // BEAT_STEP_MAP (no BEAT_MAPS), so this is written out and mirrors dataset.step itself.
  onBeatChange(beatIndex, beatCount) {
    const prev = this.mount;
    this.mount = Number(beatCount) === 0 ? 'setup' : 'verdict';
    // A different mount is a different panel with a different promise, so a tap does not
    // travel with it: the setup mount must never inherit a sum from a verdict one.
    if (prev !== this.mount) {
      this._filled = ROWS.map(() => false);
      this._last = -1;
    }
    const n = Number.isFinite(beatIndex) ? Math.trunc(beatIndex) : 0;
    this.beat = this.mount === 'setup' ? 0 : Math.max(0, Math.min(n, MAP_VERDICT.length - 1));
    this.stepIndex = this.beat;
    if (this.root) this.root.dataset.step = String(this.beat);
    this._build();
    this._paint();
    // The fills are NOT reset by a beat: the stub says the scene rests at the last tapped
    // row, and beat 1 asks for the whole column to be readable.
    this.requestUiUpdate?.();
  }

  // -- the tap -----------------------------------------------------------------

  _tap(i) {
    const r = ROWS[i];
    if (!r) return;
    const first = !this._filled[i];
    this._filled[i] = true;
    this._last = i;
    this._paint();
    // The concept, not the press: the moment a sum appears in the market column. The last
    // row of the column gets the wider burst - the column is now complete.
    const complete = this._filled.every(Boolean);
    if (complete) burst(this._grid, 34);
    else if (first) burst(this._cells[i]?.mkt, 20);
  }

  // -- building ----------------------------------------------------------------

  /** The grid, built per mount: on the setup mount the price cells are labels and hold no sum. */
  _build() {
    if (!this._grid || this._builtFor === this.mount) return;
    this._builtFor = this.mount;
    const live = this.mount === 'verdict';
    const head = [`<div class="mds-cell mds-cell--head mds-cell--price-head">${rupeeSvg()}<span class="mds-head__u">per kg</span></div>`]
      .concat(BUYERS.map((b) => `<div class="mds-cell mds-cell--head">${esc(b.name)}</div>`))
      .concat('<div class="mds-cell mds-cell--head">Market</div>')
      .join('');
    const rows = ROWS.map((r, i) => {
      const label = `at ${r.p} rupees per kilogram, add this row`;
      const price = live
        ? `<button type="button" class="mds-cell mds-cell--price mds-price" data-row="${i}" data-price="${i}" aria-pressed="false" aria-label="${esc(label)}"><span class="mds-p">${rupeeSvg()}${r.p}</span></button>`
        : `<span class="mds-cell mds-cell--price"><span class="mds-p">${rupeeSvg()}${r.p}</span></span>`;
      const buys = r.kg.map((kg, j) => `<div class="mds-cell mds-cell--buy" data-row="${i}">
          <span class="mds-kg">${kg}<span class="mds-u">kg</span></span>
          <span class="mds-bar"><span class="mds-fill" style="--k:${(kg / SCALE_KG).toFixed(3)};background:${BUYERS[j].fill}"></span></span>
        </div>`).join('');
      return price + buys + marketCell(r, i);
    }).join('');
    this._grid.innerHTML = head + rows;
    this._cells = ROWS.map((_, i) => ({
      price: this._grid.querySelector(`[data-price="${i}"]`),
      buys: Array.from(this._grid.querySelectorAll(`.mds-cell--buy[data-row="${i}"]`)),
      mkt: this._grid.querySelector(`[data-mkt="${i}"]`),
      total: this._grid.querySelector(`[data-mkt="${i}"] [data-total]`),
      fill: this._grid.querySelector(`[data-mkt="${i}"] [data-fill]`),
      add: this._grid.querySelector(`[data-mkt="${i}"] [data-add]`),
    }));

    this._moves.innerHTML = SHAPE.map((m) => {
      const from = (m.from / SCALE_KG) * 100;
      const to = (m.to / SCALE_KG) * 100;
      return `<p class="mds-move">
        <span class="mds-move__label">${esc(m.label)}</span>
        <span class="mds-move__body">
          <span class="mds-move__v mds-move__v--small">${m.from}&thinsp;kg</span>
          <span class="mds-move__bar" aria-hidden="true">
            <span class="mds-move__seg" style="width:${from.toFixed(1)}%;background:${m.fill}"></span>
            <span class="mds-move__seg mds-move__seg--to" style="width:${(to - from).toFixed(1)}%;background:${m.fill}"></span>
          </span>
          <span class="mds-move__arrow" aria-hidden="true">&rarr;</span>
          <span class="mds-move__v">${m.to}&thinsp;kg</span>
        </span>
      </p>`;
    }).join('');
  }

  // -- painting ----------------------------------------------------------------

  _paint() {
    const live = this.mount === 'verdict';
    ROWS.forEach((r, i) => {
      const ref = this._cells[i];
      if (!ref) return;
      const got = live && this._filled[i];
      ref.mkt?.classList?.toggle('mds-cell--got', got);
      ref.price?.setAttribute?.('aria-pressed', String(live && this._last === i));
      (ref.buys ?? []).forEach((cell) => cell?.classList?.toggle('mds-cell--lit', got));
      if (ref.total) {
        // The sum is written here only where it is allowed to be, so no node in the
        // document ever holds it on the setup mount.
        ref.total.innerHTML = got ? `${r.sum}<span class="mds-u">kg</span>` : '<span class="sim-q" aria-hidden="true">?</span>';
      }
      if (ref.fill) ref.fill.style.setProperty('--k', got ? (r.sum / SCALE_KG).toFixed(3) : '0');
      if (ref.add) {
        // The verdict may name one worked sum: the Rs 100 row's. From beat 1 the "add the row" rule
        // is on screen, so every filled row may show its own addition - all Table 9.1 digits.
        const show = got && (this.beat >= 1 || r.verdict);
        ref.add.textContent = show ? `${r.kg.join(' + ')} = ${r.sum}` : '';
      }
    });

    if (this._hint) this._hint.hidden = !live || this._filled.some(Boolean);
    if (this._chips) {
      this._chips.innerHTML = this.beat >= 1 ? simTag('add the row', { accent: true }) : '';
    }
    if (this._shape) {
      this._shape.hidden = this.beat < 2;
      if (this._shapeChips && this.beat >= 2) {
        this._shapeChips.innerHTML = simTag('same direction') + simTag('stretched wider', { accent: true });
      }
    }
  }

  // Nothing to wait for: the only motion is each bar's own CSS transition.
  busy() {
    return false;
  }
}