import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc, simField, simTag } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';

/**
 * SrivalliScene - one buyer's list, and the weight that fills as the price falls.
 *
 * Two mounts, one file. blk-l01-s02 mounts it with `role: "setup"` and no beats, so the
 * host hands the scene a beat count of 0; blk-l01-s03 mounts the same file with 3 beats.
 * The scene cannot see the slide, only the count, so `beatCount === 0` IS the setup mount
 * (the GasSampleScene / TicketBoothScene reading). On that mount the three prices are
 * plain labels and **no weight is anywhere in the document** - the predict prompt beside it
 * asks what she will do when the mangoes get cheaper, and a panel that already held
 * 1 / 2 / 3 kg would have answered it.
 *
 * The one interaction the stub asks for: tap a price, the basket fills to that stop's
 * weight and the rule chip that stop invokes lights. Nothing runs, nothing counts, nothing
 * is scored - the weights are the slide's own three pairs and nothing else appears.
 */

const RUPEE = '\u20b9';

/** The slide's data, exactly. Nothing here is derived, and nothing else is on screen. */
const STOPS = [
  { rupees: 150, kg: 1, rule: 0 },
  { rupees: 100, kg: 2, rule: 1 },
  { rupees: 50, kg: 3, rule: 1 },
];

/** The two halves of the rule the slide names on beat 1, in its own order. */
const RULES = ['dear means less', 'cheap means more'];

/** Beat 2's parts, as the slide states them: the wish, and the power to back it. */
const PARTS = [
  { text: 'wish', join: null },
  { text: 'purchasing power', join: '+', strong: true },
  { text: 'demand', join: '=' },
];

const MAP_REVEAL = [
  [{ idx: 0, dwellMs: null }], // the verdict: 1 kg, 2 kg, 3 kg under the three prices
  [{ idx: 1, dwellMs: null }], // the pattern has a name: the two rule chips
  [{ idx: 2, dwellMs: null }], // wanting is not demand: wish + purchasing power = demand
];

const HTML = `
<div class="ss" data-root>
  <article class="sim-card sim-card--accent ss-prices" aria-label="one stall, three prices">
    <div class="ss-head">
      <h2 class="sim-title ss-title">One stall, three prices</h2>
      <p class="ss-hint" data-hint hidden><span class="ss-hint__dot" aria-hidden="true"></span>Tap a price</p>
    </div>
    <div class="ss-track">
      <div class="ss-rail" aria-hidden="true"><span class="ss-rail__bar"></span>${rightArrowSvg()}</div>
      <div class="ss-stops" data-stops role="group" aria-label="the price of one kilogram, three times over"></div>
    </div>
  </article>

  <div class="ss-rules" data-rules hidden>
    ${RULES.map((r, i) => `<p class="ss-rule" data-rule="${i}">${simTag(r)}</p>`).join('')}
  </div>

  <article class="sim-card ss-basket-card" aria-label="Srivalli's basket">
    <h3 class="sim-title ss-title">Srivalli's basket</h3>
    <div class="ss-basketrow">
      <div class="ss-basket" data-basket></div>
      <div class="ss-stack" data-reading role="status">${simField('in the basket', '')}<p class="sim-meta">one kilogram is drawn as one mango</p></div>
    </div>
  </article>

  <section class="sim-card ss-parts" data-parts hidden aria-label="what a demand is made of">
    <p class="ss-parts__row">
      ${PARTS.map((p) => `<span class="ss-term">${p.join ? `<span class="ss-join" aria-hidden="true">${esc(p.join)}</span>` : ''}<span class="ss-part${p.strong ? ' ss-part--strong' : ''}">${esc(p.text)}</span></span>`).join('')}
    </p>
  </section>
</div>
${noteLineHtml([
  { text: 'One buyer, one stall, one season - the price is the only thing that changes between taps.' },
])}`;

/** The direction the season runs in. A plain chevron, so no width is distorted by a stretch. */
function rightArrowSvg() {
  return '<svg class="ss-rail__tip" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false">'
    + '<path d="M4 2.5 L9.5 7 L4 11.5" fill="none" stroke="var(--sim-stroke)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/** One mango: an oval body, a shaded cheek, a leaf. Drawn here because SimIcons has no fruit. */
function mangoSvg() {
  return '<svg class="ss-mango" viewBox="0 0 28 28" width="38" height="38" aria-hidden="true" focusable="false">'
    + '<path d="M14 9c0.6-3.4 3.4-5 6.2-4.4 -0.8 3.4 -3.4 5 -6.2 4.4z" fill="var(--sim-series-3)"/>'
    + '<ellipse cx="14" cy="17" rx="8.4" ry="8" fill="var(--sim-series-8)"/>'
    + '<ellipse cx="17.6" cy="20.4" rx="5.4" ry="5.6" fill="var(--sim-ink-on-8, var(--sim-label))" opacity="0.16"/>'
    + '<ellipse cx="10.6" cy="13.6" rx="2.2" ry="2.8" fill="var(--sim-ink-on-8, var(--sim-label))" opacity="0.3"/>'
    + '</svg>';
}

/** The basket, empty and dashed or full and solid. A front view: handle, rim, woven body. */
function basketSvg(empty) {
  const dash = empty ? ' stroke-dasharray="7 5"' : '';
  const weave = empty ? '' : '<path d="M14 44h68M16 55h64M19 65h58" stroke="var(--sim-ink-on-8, var(--sim-label))" stroke-width="2" opacity="0.2" stroke-linecap="round"/>';
  return '<svg class="ss-basket__body" viewBox="0 0 96 76" width="132" height="104" aria-hidden="true" focusable="false">'
    + `<path d="M22 28C22 8 74 8 74 28" fill="none" stroke="var(--sim-stroke)" stroke-width="3"${dash} stroke-linecap="round"/>`
    + `<path d="M8 28h80l-9 40a6 6 0 0 1 -6 5.2H23a6 6 0 0 1 -6 -5.2z" fill="var(--sim-series-8)" opacity="${empty ? 0.26 : 0.45}" stroke="var(--sim-stroke)" stroke-width="2.6"${dash} stroke-linejoin="round"/>`
    + weave
    + '</svg>';
}

const CSS = SIM_LOOK_DOM_CSS + `
/* sim-lint-ignore token: --sim-ink-on-8 / -accent are not stylesheet tokens; applyToneInks(this.root) sets them per tone and theme, which is the only thing that can pick readable ink on the orange mango and the filled stop in both themes. */
.ss { width: 100%; display: grid; gap: var(--sim-space-2); align-content: start; }
.ss-title { margin: 0; }
.ss-prices, .ss-basket-card, .ss-parts { gap: var(--sim-space-2); }

/* card head: the title, and the hint chip that sits beside it (never on a stop) */
.ss-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sim-space-2); }
.ss-hint { margin: 0; display: flex; align-items: center; gap: var(--sim-space-1); padding: 3px var(--sim-space-2); border-radius: var(--sim-radius-pill); border: var(--sim-border-width) solid var(--sim-accent); color: var(--sim-accent); font-size: var(--sim-text-sm); font-weight: 800; }
.ss-hint__dot { width: 9px; height: 9px; border-radius: var(--sim-radius-pill); background: var(--sim-accent); animation: ss-pulse 1.5s ease-in-out infinite; }
@keyframes ss-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

/* the rail: one bar and a chevron, so the season reads left to right without a slope
   that would have to be drawn at three different heights. The bar sits directly above
   the three beads - the track wrapper is the only gap between them. */
.ss-track { display: grid; gap: 0; }
.ss-rail { display: flex; align-items: center; gap: var(--sim-space-1); }
.ss-rail__bar { flex: 1 1 auto; height: 3px; border-radius: var(--sim-radius-pill); background: var(--sim-stroke); }
.ss-rail__tip { flex: none; }

/* three stops, equal columns; each is a bead, the price under it, and the weight under that */
.ss-stops { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-2); }
.ss-stop { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; }
.ss-stop::before { content: ''; width: 13px; height: 13px; border-radius: var(--sim-radius-pill); border: 3px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.ss-stop--on::before { border-color: var(--sim-accent); }
.ss-price { width: 100%; min-height: 48px; padding: 6px var(--sim-space-1); display: flex; align-items: center; justify-content: center; border: var(--sim-border-width) solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-surface-raised); color: var(--sim-label); font-family: var(--sim-font-display); font-size: var(--sim-text-xl); font-weight: 800; font-variant-numeric: tabular-nums; box-sizing: border-box; }
.ss-price__v { white-space: nowrap; }
button.ss-price { cursor: pointer; }
button.ss-price:hover { border-color: var(--sim-accent); }
.ss-price[aria-pressed="true"] { border-color: var(--sim-accent); background: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); }
.ss-kg { font-size: var(--sim-text-sm); font-weight: 800; font-family: var(--sim-font); }

/* the two rules, in their own row under the evidence - never on a stop */
.ss-rules { display: flex; flex-wrap: wrap; gap: var(--sim-space-2); }
.ss-rule { margin: 0; }
.ss-rule--on .sim-tag { border-color: var(--sim-accent); background: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); }

/* the basket: the fruit row sits ON the basket body (one flex column), the field beside it */
.ss-basketrow { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--sim-space-3); align-items: center; }
.sim-dom-root--portrait .ss-basketrow { grid-template-columns: minmax(0, 1fr); justify-items: center; }
.ss-basket { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; width: 150px; min-height: 118px; }
.ss-fruit { display: flex; align-items: flex-start; justify-content: center; gap: 1px; height: 46px; margin-top: -34px; }
.ss-mango { animation: ss-drop 200ms ease-out; }
@keyframes ss-drop { from { transform: translateY(-12px); opacity: 0; } to { transform: none; opacity: 1; } }
.ss-basket__body { display: block; }
.ss-stack { min-width: 0; gap: var(--sim-space-1); }
.sim-dom-root--portrait .ss-stack .sim-meta { text-align: center; }
.ss-stack .sim-field__value { font-family: var(--sim-font-display); font-size: var(--sim-text-xl); font-weight: 800; }
.ss-stack .sim-field__value--none { color: var(--sim-label-muted); font-family: var(--sim-font); font-size: var(--sim-text-md); font-weight: 400; font-style: italic; }
.ss-stack .sim-meta { text-align: right; margin: 0; }

/* beat 2's parts */
/* beat 2's parts. Each join belongs to the term that follows it, so a narrow portrait
   never breaks "= demand" across two lines. */
.ss-parts__row { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: var(--sim-space-2); }
.ss-term { display: inline-flex; align-items: center; gap: var(--sim-space-2); }
.ss-join { font-family: var(--sim-font-display); font-size: var(--sim-text-lg); font-weight: 800; color: var(--sim-label-muted); }
.ss-part { padding: 4px var(--sim-space-2); border: var(--sim-border-width) solid var(--sim-stroke); border-radius: var(--sim-radius-pill); font-size: var(--sim-text-md); font-weight: 700; }
.ss-part--strong { border-color: var(--sim-accent); color: var(--sim-accent); }
`;

export class SrivalliScene extends DomSimulation {
  static WIDTH = 620;
  // Measured by `sim-layout --interact 10` over all three beats and both orientations (and
  // over a tap, which changes nothing about the height): the worst landscape state is beat 2
  // at 546 px, the worst portrait state is beat 2 at 675 px. FIT refits per beat; these two
  // are the host's panel budget, and they are the tallest beat, not padding.
  static HEIGHT = 546;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 675;
  // Beat 2 adds a card that is not there before it, so the frame is the content showing.
  static FIT = true;
  static BEAT_STEP_MAP = MAP_REVEAL;
  static ARIA_LABEL =
    'One mango stall at three prices through a season, and Srivalli\'s basket underneath. The price is the only '
    + 'thing that changes between taps, and the basket refills to whatever weight each price buys.';
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._picked = null;   // which stop is holding the basket, or null while it is empty
    this._kg = 0;
    this._builtFor = null; // the mount the stops were last built for
    this.mount = 'setup';
    this.beat = 0;
  }

  async setup() {
    await super.setup();
    this.render({ css: CSS, html: HTML });
    applyToneInks(this.root);

    // Every query guarded: the headless sanity run has no HTML parser, so all of these are null there.
    this._stops = this.root.querySelector('[data-stops]');
    this._hint = this.root.querySelector('[data-hint]');
    this._rules = this.root.querySelector('[data-rules]');
    this._ruleEls = RULES.map((_, i) => this.root.querySelector(`[data-rule="${i}"]`));
    this._basket = this.root.querySelector('[data-basket]');
    this._readValue = this.root.querySelector('[data-reading] .sim-field__value');
    this._parts = this.root.querySelector('[data-parts]');

    // One delegated listener on the rail: re-rendering the stops on a mount change can
    // never leave a dead handler behind.
    this._stops?.addEventListener('click', (ev) => {
      const btn = ev.target?.closest?.('[data-stop]');
      if (!btn) return;
      this._pick(Number(btn.dataset.stop));
    });

    this._syncDataset();
    this._paint();
  }

  refreshTheme() {
    super.refreshTheme();
    applyToneInks(this.root);
  }

  // -- beats -------------------------------------------------------------------

  // The host hands over a beat count and never the slide, so the count IS the mount: the
  // setup mount never receives a beat. DomSimulation's declarative default reads only
  // BEAT_STEP_MAP (no BEAT_MAPS), so this is written out and mirrors dataset.step itself.
  onBeatChange(beatIndex, beatCount) {
    const prev = this.mount;
    this.mount = Number(beatCount) === 0 ? 'setup' : 'reveal';
    // A different mount is a different panel with a different promise, so the tap does
    // not travel with it: the setup mount must never inherit a weight from a reveal one.
    if (prev !== this.mount) { this._picked = null; this._kg = 0; }
    const n = Number.isFinite(beatIndex) ? Math.trunc(beatIndex) : 0;
    this.beat = this.mount === 'setup' ? 0 : Math.max(0, Math.min(n, MAP_REVEAL.length - 1));
    this.stepIndex = this.beat;
    this._syncDataset();
    this._paint();
    // The basket is NOT reset by a beat: the stub says the scene rests at the last tapped
    // price, so beat 1 opens holding whatever the learner last chose.
  }

  _syncDataset() {
    if (!this.root) return;
    this.root.dataset.step = String(this.beat);
    this.root.dataset.mount = this.mount;
  }

  // -- the tap -----------------------------------------------------------------

  _pick(i) {
    if (this.mount !== 'reveal') return;
    const stop = STOPS[i];
    if (!stop) return;
    const was = this._kg;
    this._picked = i;
    this._kg = stop.kg;
    this._paintTap();
    // The celebration is the basket getting FULLER, which is the slide's own claim
    // ("buy more when they get cheaper") and not the press of a button.
    if (this._kg > was) burst(this._basket);
  }

  // -- painting ----------------------------------------------------------------

  /** The stops, built per mount: on the setup mount they are labels and hold no weight. */
  _buildStops() {
    if (!this._stops || this._builtFor === this.mount) return;
    this._builtFor = this.mount;
    const live = this.mount === 'reveal';
    this._stops.innerHTML = STOPS.map((s, i) => {
      const on = live && this._picked === i;
      const price = `<${live ? 'button type="button"' : 'span'} class="ss-price"${live
        ? ` data-stop="${i}" aria-pressed="${on}" aria-label="at ${s.rupees} rupees a kilogram"`
        : ''}><span class="ss-price__v">${RUPEE}${s.rupees}</span></${live ? 'button' : 'span'}>`;
      // The weight is written here and nowhere else on this mount: an element that is
      // merely hidden is still in the document, and the predict prompt must not see it.
      const kg = live ? `<span class="sim-tag ss-kg">${s.kg} kg</span>` : '';
      return `<p class="ss-stop${on ? ' ss-stop--on' : ''}${live ? '' : ' ss-stop--plain'}">${price}${kg}</p>`;
    }).join('');
  }

  _paint() {
    this._buildStops();
    if (this._hint) this._hint.hidden = !(this.mount === 'reveal' && this._picked === null);
    if (this._rules) this._rules.hidden = !(this.mount === 'reveal' && this.beat >= 1);
    if (this._parts) this._parts.hidden = !(this.mount === 'reveal' && this.beat >= 2);
    this._paintTap();
  }

  /** Everything a tap changes: the pressed stop, the chips, the basket, its reading. */
  _paintTap() {
    const rule = this._picked == null ? -1 : STOPS[this._picked].rule;
    this._ruleEls.forEach((el, i) => el?.classList.toggle('ss-rule--on', i === rule));
    this._stops?.querySelectorAll('[data-stop]').forEach((btn) => {
      const on = Number(btn.dataset.stop) === this._picked;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.closest('.ss-stop')?.classList.toggle('ss-stop--on', on);
    });
    if (this._basket) {
      // The fruit paints AFTER the basket body, so it sits in the basket rather than
      // floating over it: the near rim and the handle are behind the mangoes.
      this._basket.innerHTML = `${basketSvg(!this._kg)}<div class="ss-fruit">${this._kg ? mangoSvg().repeat(this._kg) : ''}</div>`;
    }
    if (this._readValue) {
      this._readValue.className = this._kg ? 'sim-field__value' : 'sim-field__value sim-field__value--none';
      this._readValue.textContent = this._kg ? `${this._kg} kg` : 'empty';
    }
    if (this._hint) this._hint.hidden = !(this.mount === 'reveal' && this._picked === null);
  }

  destroy() {
    this._stops = null;
    this._hint = null;
    this._rules = null;
    this._ruleEls = null;
    this._basket = null;
    this._readValue = null;
    this._parts = null;
    super.destroy();
  }
}