/**
 * MarketTableScene - the chapter's Table 9.3 as a ledger the learner reads and points at.
 *
 * Two mounts, one file. blk-l05-s02 mounts it with `role: "setup"` and no beats, so the host
 * hands the scene a beat count of 0; blk-l05-s03 mounts the same file with 3 beats. The scene
 * sees only the count and never the slide, so `beatCount === 0` IS the setup mount (the
 * SrivalliScene / MarketDemandSumScene reading). On the setup mount there is no button anywhere
 * and no outcome word in the document: the predict prompt beside it asks at which price the
 * columns agree, so a panel already holding "excess demand" would answer it.
 *
 * What this file will not do, all from the stub: it plots nothing (no demand or supply line, no
 * point E - that is EquilibriumGraphScene's slide), and it never names the government's role, a
 * shortage or a surplus in those words (Table 9.3 prints "excess demand" and "excess supply",
 * and those are the words used here).
 *
 * Numbers are Table 9.3 exactly (FIGURES.md): 38/6, 12/12, 8/43 at Rs 40, 100, 150 per kg.
 * The only derived numbers are the gaps a tap opens (38-6, 43-8, 12-12), shown only after the
 * learner points at that row.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc, simTag } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';

/**
 * Table 9.3, row for row. `known` is the beat at which that row's outcome may appear - the
 * slide's own first section names the two unbalanced rows, its second names the balance.
 * `gap` is the difference between the two columns, [derived], and only ever shown after a tap.
 * `push` is the price direction the slide's last section gives, by arrow only.
 */
const ROWS = [
  { p: 40, want: 38, offer: 6, outcome: 'excess demand', known: 0, gap: 32, push: 'up' },
  { p: 100, want: 12, offer: 12, outcome: 'market equilibrium', known: 1, gap: 0, push: null },
  { p: 150, want: 8, offer: 43, outcome: 'excess supply', known: 0, gap: 35, push: 'down' },
];

const BALANCE = 1;                 // the row whose two columns match
const SCALE_KG = 43;               // one scale for every bar, so 38 beside 6 reads as 38 beside 6
const WISH_FILL = 'var(--sim-series-1)';   // the wanted column's bars (sky: unmistakably not series-2)
const OFFER_FILL = 'var(--sim-series-8)';  // the offered column's bars (the mango tone SellerStallScene used)

/** One entry per real beat of blk-l05-s03; the setup mount never receives one. */
const MAP = [
  [{ idx: 0, dwellMs: null }], // the verdict: the two unbalanced rows name themselves, the balance row is still "?"
  [{ idx: 1, dwellMs: null }], // the balance point: wanted = offered at 12 kg, with the table's own footer
  [{ idx: 2, dwellMs: null }], // why it sticks: the price pressure under each unbalanced row
];

const CSS = `${SIM_LOOK_DOM_CSS}
.mts { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }

/* the card head: the title, and one chip slot beside it (never over a row) */
.mts-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sim-space-2); }
.mts-title { margin: 0; font-size: var(--sim-text-lg); }
.mts-chip { margin: 0; display: flex; flex-wrap: wrap; gap: var(--sim-space-2); }
.mts-chip:empty { display: none; }
.mts-chip .sim-tag.is-pulse { animation: mts-pulse 1.5s ease-in-out infinite; }
@keyframes mts-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@media (prefers-reduced-motion: reduce) { .mts-chip .sim-tag.is-pulse { animation: none; } }

/* ---- the ledger: a real table, one row per price ---- */
.mts-book { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.mts-table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.mts-table th, .mts-table td { padding: 4px 6px; text-align: center; vertical-align: middle; }
.mts-table thead th { font: 800 var(--sim-text-sm)/1.25 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 2px solid var(--sim-stroke); padding-bottom: 6px; }
.mts-table thead th span { display: block; }
.mts-table thead th span + span { font-weight: 700; }
.mts-table thead th.mts-h-out { color: var(--sim-accent); }
.mts-table tbody th { font-weight: 400; }
.mts-table tbody tr + tr th, .mts-table tbody tr + tr td { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); }

/* the price cell is the tap target: a real button, so the keyboard reaches it too. It carries its
   own colour on the recessed fill, because a button does not reliably inherit the root's ink. */
.mts-price { display: inline-flex; align-items: center; justify-content: center; gap: 3px; width: 100%;
  min-height: 42px; padding: 5px 8px; font: 800 var(--sim-text-lg)/1.1 var(--sim-font);
  font-variant-numeric: tabular-nums; color: var(--sim-label); background: var(--sim-bg-deep);
  border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-sm); white-space: nowrap; }
button.mts-price { cursor: pointer; }
button.mts-price:hover { border-color: var(--sim-accent); }
button.mts-price:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.mts-rs { flex: none; }
.mts-price[aria-pressed="true"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 22%, var(--sim-bg-deep)); }

/* a quantity: the number, then its bar on the one shared scale */
.mts-q { display: flex; flex-direction: column; align-items: center; gap: 5px; justify-content: center; min-height: 62px; }
.mts-q__lab, .mts-out__lab { display: none; font: 700 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.mts-q__n { display: flex; align-items: baseline; gap: 2px; font: 800 var(--sim-text-xl)/1.1 var(--sim-font); color: var(--sim-label);
  border-radius: var(--sim-radius-sm); transition: background-color 0.25s ease; padding: 0 4px; }
.mts-q__u { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }
.mts-row.is-lit .mts-q__n { background: color-mix(in oklab, var(--sim-accent) 30%, var(--sim-bg-surface)); }
.mts-bar { display: flex; align-items: center; width: 100%; height: 8px; border-radius: var(--sim-radius-pill);
  background: var(--sim-track); overflow: hidden; }
.mts-fill { display: block; height: 100%; width: calc(var(--k, 0) * 100%); border-radius: var(--sim-radius-pill);
  transition: width 300ms cubic-bezier(0.2, 0.8, 0.3, 1.05); }
.mts-fill--want { background: ${WISH_FILL}; }
.mts-fill--offer { background: ${OFFER_FILL}; }

/* the outcome cell: dashed and unknown until the beat knows it, then the chip. All three slots
   hold their height from the first paint, so a fill never resizes the frame. */
.mts-out { display: flex; flex-direction: column; align-items: center; gap: 3px; justify-content: center;
  min-height: 78px; padding: 3px 5px; border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-sm); }
.mts-out.is-known { border-style: solid; border-color: color-mix(in oklab, var(--sim-stroke) 70%, transparent); }
.mts-out__chip { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 0; min-height: 32px; }
.mts-out__chip .sim-tag { max-width: 100%; text-align: center; overflow-wrap: anywhere; font-size: var(--sim-text-md); }
.mts-out.is-fresh .mts-out__chip { animation: mts-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes mts-pop { from { transform: scale(0.7); } to { transform: scale(1); } }
.mts-out__gap { min-height: 18px; font: 700 var(--sim-text-sm)/1.3 var(--sim-font); color: var(--sim-label-muted); }
.mts-out__push { display: flex; align-items: center; gap: 3px; min-height: 20px; font: 800 var(--sim-text-sm)/1.3 var(--sim-font); color: var(--sim-warning); }
/* the arrow is set a step larger than its words: at 14px the font's arrow is a hairline mark */
.mts-ar { font-size: var(--sim-text-lg); line-height: 1; }

/* the table's own summary row, shown once the balance row is named */
.mts-eq { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sim-space-2); }
.mts-eq__v { display: flex; align-items: center; justify-content: flex-end; gap: 3px; }

/* Portrait is its own representation of the same table: 380 px cannot hold an outcome chip
   beside two number columns at the 14 px floor, so each price becomes a full-width mini-header
   with its three cells under it. Same numbers, same words, each cell carrying its own label. */
.sim-dom-root--portrait .mts-table, .sim-dom-root--portrait .mts-table tbody { display: block; }
.sim-dom-root--portrait .mts-table thead { display: none; }
.sim-dom-root--portrait .mts-table tbody tr { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 0.85fr) minmax(0, 1.3fr);
  gap: var(--sim-space-1); align-items: stretch; margin-bottom: var(--sim-space-2); }
.sim-dom-root--portrait .mts-table tbody tr + tr th, .sim-dom-root--portrait .mts-table tbody tr + tr td { border-top: 0; }
.sim-dom-root--portrait .mts-table tbody th { grid-column: 1 / -1; }
.sim-dom-root--portrait .mts-table th, .sim-dom-root--portrait .mts-table td { display: block; padding: 2px 2px; }
.sim-dom-root--portrait .mts-q__lab, .sim-dom-root--portrait .mts-out__lab { display: block; }
.sim-dom-root--portrait .mts-q__n { font-size: var(--sim-text-lg); }
.sim-dom-root--portrait .mts-out { min-height: 86px; padding: 3px 2px; }
/* the chip steps down to the house tag size here: its column is a third of 380 px, and
   "equilibrium" at 16 px is a few pixels wider than the chip can be. */
.sim-dom-root--portrait .mts-out__chip .sim-tag { font-size: var(--sim-text-sm); }
.sim-dom-root--portrait .mts-eq { grid-template-columns: minmax(0, 1fr); }
`;

const HTML = `
<div class="mts">
  <div class="sim-card mts-book">
    <div class="mts-head">
      <h2 class="sim-title mts-title">The market's ledger for mangoes</h2>
      <p class="mts-chip" data-chips role="status" aria-live="polite"></p>
    </div>
    <table class="mts-table" aria-label="Mangoes at each price in kilograms: what buyers want, what sellers offer, and what that leaves">
      <thead>
        <tr>
          <th scope="col"><span>price</span><span>per kg</span></th>
          <th scope="col"><span>wanted</span><span>by buyers</span></th>
          <th scope="col"><span>offered</span><span>by sellers</span></th>
          <th scope="col" class="mts-h-out"><span>outcome</span></th>
        </tr>
      </thead>
      <tbody data-body></tbody>
    </table>
    <p class="sim-meta">one scale for every bar - a longer bar is more kg</p>
  </div>

  <div class="sim-card mts-eq" data-eq hidden aria-label="the ledger's own summary row">
    <div class="sim-field"><span class="sim-field__label">Equilibrium price</span><span class="sim-field__value mts-eq__v" data-eq-price></span></div>
    <div class="sim-field"><span class="sim-field__label">Equilibrium quantity</span><span class="sim-field__value" data-eq-qty>12 kg</span></div>
  </div>
</div>
${noteLineHtml([
  { text: 'Table 9.3 - the chapter\'s own rows for mangoes.' },
])}`;

/**
 * The rupee sign, drawn. This harness loads no Nunito and the text form tofus in every sandbox
 * shot of this bundle, so the price column carries a path instead; it inherits `currentColor`,
 * so it also reads on a pressed price cell in either theme.
 */
function rupeeSvg() {
  return '<svg class="mts-rs" viewBox="0 0 14 14" width="17" height="17" aria-hidden="true" focusable="false">'
    + '<path d="M2.3 3.1h9.4M2.3 5.8h9.4M3.7 3.1v8.1M3.7 3.1h3.7a2.4 2.4 0 0 1 0 4.8H3.7M7.3 7.9l4.7 3.3" '
    + 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/** One quantity cell: its own label (portrait only), the number, and its bar on the shared scale. */
function qCell(which, kg) {
  return `<td><span class="mts-q mts-q--${which}">
    <span class="mts-q__lab">${which === 'want' ? 'wanted' : 'offered'}</span>
    <span class="mts-q__n">${kg}<span class="mts-q__u">kg</span></span>
    <span class="mts-bar"><span class="mts-fill mts-fill--${which}" style="--k:${(kg / SCALE_KG).toFixed(3)}"></span></span>
  </span></td>`;
}

/** The outcome cell, with all three slots in place from the first paint. */
function outCell(i) {
  return `<td><span class="mts-out" data-out="${i}">
    <span class="mts-out__lab">outcome</span>
    <span class="mts-out__chip" data-chip></span>
    <span class="mts-out__gap" data-gap></span>
    <span class="mts-out__push" data-push></span>
  </span></td>`;
}

export class MarketTableScene extends DomSimulation {
  static WIDTH = 680;
  // sim-layout's worst measured state over every beat and both orientations (the beat-1 card and
  // the tap-opened gap lines included): 554 landscape, 900 portrait. FIT still sizes each beat.
  static HEIGHT = 556;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 910;
  static FIT = true;               // the beats differ by a chip row and a card, so the frame is the content
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL =
    'A market ledger for mangoes with one row per price: forty, one hundred and one hundred and fifty rupees. '
    + 'Beside each price, what buyers want and what sellers offer in kilograms, each with a bar on one shared scale. '
    + 'The outcome column starts unknown and fills as the rows are read: excess demand at forty rupees, excess supply at '
    + 'one hundred and fifty, and market equilibrium at one hundred, where twelve wanted matches twelve offered. '
    + 'Tapping a row lights it and shows how far apart its two columns are.';
  // The dial is the ledger itself (the stub's "tapping a row lights its outcome chip"), so there
  // is no control bar duplicating three buttons that are already on screen.
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.mount = 'setup';
    this.beat = 0;
    this._lit = ROWS.map(() => false);   // one flag per row: the learner has pointed at it
    this._last = -1;
    this._cheered = false;
    this._builtFor = null;
    this._rows = [];
  }

  async setup() {
    await super.setup();
    this.render({ css: CSS, rootClass: 'sl-backdrop', html: HTML });

    this._body = this.root?.querySelector?.('[data-body]');
    this._chips = this.root?.querySelector?.('[data-chips]');
    this._eq = this.root?.querySelector?.('[data-eq]');
    this._eqPrice = this.root?.querySelector?.('[data-eq-price]');
    if (this._eqPrice) this._eqPrice.innerHTML = `${rupeeSvg()}100`;

    // One delegated listener: the body is rebuilt when the mount changes, so a per-row handler
    // could be left behind. A tap anywhere in the row does the same thing, for phones.
    this._body?.addEventListener?.('click', (ev) => {
      const row = ev.target?.closest?.('[data-row]');
      if (!row || this.mount !== 'verdict') return;
      this._tap(Number(row.dataset.row));
    });

    this._build();
    this._paint();
  }

  destroy() {
    this._rows = [];
    super.destroy();
  }

  // -- beats -------------------------------------------------------------------

  // The host hands over a beat count and never the slide, so the count IS the mount: the setup
  // mount never receives a beat. DomSimulation's declarative default reads only BEAT_STEP_MAP,
  // so this is written out and mirrors dataset.step itself.
  onBeatChange(beatIndex, beatCount) {
    const prev = this.mount;
    this.mount = Number(beatCount) === 0 ? 'setup' : 'verdict';
    // A different mount is a different panel with a different promise, so a tap does not travel
    // with it: the setup mount must never inherit an outcome from a verdict one.
    if (prev !== this.mount) {
      this._lit = ROWS.map(() => false);
      this._last = -1;
      this._cheered = false;
    }
    const n = Number.isFinite(beatIndex) ? Math.trunc(beatIndex) : 0;
    this.beat = this.mount === 'setup' ? 0 : Math.max(0, Math.min(n, MAP.length - 1));
    this.stepIndex = this.beat;
    if (this.root) this.root.dataset.step = String(this.beat);
    this._build();
    this._paint();
    // The taps are NOT reset by a beat: the stub rests at the last tapped row, and the outcome
    // column has to stay readable across the beats.
    this.requestUiUpdate?.();
  }

  // -- the tap -----------------------------------------------------------------

  _tap(i) {
    if (!ROWS[i] || this.mount !== 'verdict') return;
    this._lit[i] = true;
    this._last = i;
    this._paint();
  }

  // -- what a beat is allowed to know -------------------------------------------

  _known(i) {
    return this.mount === 'verdict' && this.beat >= ROWS[i].known;
  }

  // -- building ----------------------------------------------------------------

  /** The body, built per mount: on the setup mount the price cells are labels and hold nothing. */
  _build() {
    if (!this._body || this._builtFor === this.mount) return;
    this._builtFor = this.mount;
    const live = this.mount === 'verdict';
    this._body.innerHTML = ROWS.map((r, i) => {
      const spoken = `at ${r.p} rupees per kilogram`;
      const price = live
        ? `<button type="button" class="mts-price" data-price="${i}" aria-pressed="false" aria-label="${esc(`${spoken}, show how far apart wanted and offered are`)}">${rupeeSvg()}${r.p}</button>`
        : `<span class="mts-price">${rupeeSvg()}${r.p}</span>`;
      return `<tr class="mts-row" data-row="${i}">
        <th scope="row">${price}</th>
        ${qCell('want', r.want)}
        ${qCell('offer', r.offer)}
        ${outCell(i)}
      </tr>`;
    }).join('');
    this._rows = ROWS.map((_, i) => ({
      tr: this._body.querySelector(`tr[data-row="${i}"]`),
      price: this._body.querySelector(`[data-price="${i}"]`),
      q: Array.from(this._body.querySelectorAll(`tr[data-row="${i}"] .mts-q`)),
      out: this._body.querySelector(`[data-out="${i}"]`),
      chip: this._body.querySelector(`[data-out="${i}"] [data-chip]`),
      gap: this._body.querySelector(`[data-out="${i}"] [data-gap]`),
      push: this._body.querySelector(`[data-out="${i}"] [data-push]`),
    }));
  }

  // -- painting ----------------------------------------------------------------

  _paint() {
    const live = this.mount === 'verdict';
    ROWS.forEach((r, i) => {
      const ref = this._rows[i];
      if (!ref?.tr) return;
      const lit = live && this._lit[i];
      const known = this._known(i);
      const fresh = known && ref.chip?.dataset?.shown !== '1';
      ref.tr.classList.toggle('is-lit', lit);
      if (ref.price?.setAttribute) ref.price.setAttribute('aria-pressed', String(lit));
      (ref.q ?? []).forEach((cell) => cell?.classList?.toggle('is-lit', lit));
      ref.out?.classList?.toggle('is-known', known);
      ref.out?.classList?.toggle('is-fresh', fresh);
      if (ref.chip) {
        ref.chip.dataset.shown = known ? '1' : '0';
        ref.chip.innerHTML = known
          ? simTag(r.outcome, { accent: r.push === null })
          : '<span class="sim-q" aria-hidden="true">?</span>';
      }
      // The gap is the tap's own payload: the arithmetic under the outcome, and never a number
      // this scene owns otherwise. The push is the beat's own - the slide's last section says
      // both directions at once, so it waits for the beat and not for the learner.
      if (ref.gap) ref.gap.textContent = lit && known ? `${r.gap} kg apart` : '';
      if (ref.push) ref.push.innerHTML = known && this.beat >= 2 && r.push
        ? `<span class="mts-ar" aria-hidden="true">${r.push === 'up' ? '&uarr;' : '&darr;'}</span>${r.push === 'up' ? 'price up' : 'price down'}`
        : '';
    });

    if (this._chips) {
      const untapped = live && this._lit.some((v) => !v);
      const text = !live ? '' : this.beat >= 2 ? 'the price is the repair'
        : this.beat >= 1 ? 'wanted = offered' : 'tap a row';
      const pulse = untapped ? ' is-pulse' : '';
      this._chips.innerHTML = text ? `<span class="sim-tag${pulse}">${esc(text)}</span>` : '';
    }
    if (this._eq) this._eq.hidden = !this._known(BALANCE);

    // The concept, not a press: the balance row's chip landing is the columns matching. Once.
    if (this._known(BALANCE) && !this._cheered) {
      this._cheered = true;
      burst(this._rows[BALANCE]?.out, 26);
    }
  }

  // Nothing to wait for: the only motion is each bar's own CSS transition and burst().
  busy() {
    return false;
  }
}
