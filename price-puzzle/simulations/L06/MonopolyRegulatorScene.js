import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

/**
 * MonopolyRegulatorScene - blk-l06-s04, "One Seller, No Rival" (3 beats).
 *
 * The slide's one claim: this market shape is one seller with no close substitute, so it sets the
 * price itself and shrinks the quantity on purpose - and the government's answer is to regulate it,
 * with a different referee watching each product.
 *
 * So the scene is three pictures and nothing else:
 *   - a market lane with two pitches: the seller's stall filled, the rival pitch dashed, empty and
 *     labelled `no close substitute` (the definition, on every beat);
 *   - the seller's own two readings - price and quantity - which move together between the
 *     competitive stop and the monopolist's stop (the slide's own contrast);
 *   - a referee badge pinned above the lane and four badges below it, the row lighting one by one.
 *
 * What this file will not do, all from the stub: no price ceiling or floor, no public goods, no
 * intervention costs, no revenue or profit, no demand curve behind the two stops, and the rival
 * pitch is never filled - a control that opened it would argue with the slide.
 *
 * The two stops are the scene's own numbers (the slide states only the direction): the competitive
 * baseline is the competitive outcome L05 taught, and the monopolist's stop is the same product at
 * a higher price and a smaller quantity. Labels only - the prose is the slide's.
 */

const DASH = '\u2014';
const UP = '\u25b2';
const DOWN = '\u25bc';

// The scene font has no U+20B9 on many systems (it renders as a tofu box), so the rupee sign is a
// drawn glyph and only the digits are text - the same shape the course's other price boards use, so
// the boards stay comparable from lesson to lesson.
const RUPEE_D = 'M3 5h12v2.8H3zM2 9.6h14v2.8H2zM7.2 3.2h3.1v11.4c0 3.2 1.5 4.8 5.3 4.8h3l-.9 2.9h-2.4c-5.1 0-8.1-2.9-8.1-7.7z';
const rupeeSvg = () =>
  `<svg class="mr-rupee" viewBox="0 0 18 24" aria-hidden="true" focusable="false"><path d="${RUPEE_D}"/></svg>`;

// ---------------------------------------------------------------- the model

// The two stops of the same market, one line each. `cap` names the state on screen, so no reading
// has to remember which stop the control is on; `qty` is the slide's "shrinks the quantity on
// purpose", `price` its "sets the price itself".
const STOPS = {
  competitive: { price: 100, qty: 20, priceCap: 'competitive price', qtyCap: 'a rival undercuts it' },
  monopolist: { price: 150, qty: 12, priceCap: `${UP} monopolist's price`, qtyCap: `${DOWN} no rival to undercut` },
};
const STOPS_IN_ORDER = ['competitive', 'monopolist'];

// One short tag per beat, in a fixed slot so no beat changes the height.
const BEAT_CHIP = ['one seller, unique product', 'price up, quantity down', 'regulate, do not abolish'];

// The four referees and the product each one watches - the slide's own line, nothing else.
const REFEREES = [
  { name: 'RBI', product: 'banking' },
  { name: 'CCPA', product: 'consumer rights' },
  { name: 'TRAI', product: 'telecom' },
  { name: 'SEBI', product: 'securities' },
];

const stopOf = (key) => STOPS[key] || STOPS.competitive;

// ---------------------------------------------------------------- the look

const CSS = SIM_LOOK_DOM_CSS + `
.mr-root { display: flex; flex-direction: column; gap: var(--sim-space-3); width: 100%; box-sizing: border-box; }

/* ---- one chip slot for both chips, so no beat changes the height ---- */
.mr-chips { display: flex; flex-wrap: wrap; gap: var(--sim-space-2); margin: 0; align-items: center; }
.mr-chip { margin: 0; }

/* ---- the hero: the referee badge pinned above a lane of two pitches ---- */
.mr-hero { display: flex; flex-direction: column; gap: var(--sim-space-3); }

/* the pinned badge: a "?" slot until beat 2, then the referee's own badge */
.mr-pin { display: flex; align-items: center; gap: var(--sim-space-2); }
.mr-pin__badge { display: inline-flex; align-items: center; gap: var(--sim-space-2); padding: 4px 12px;
  border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-pill);
  font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted);
  background: transparent; transition: background .3s ease, color .3s ease, border-color .3s ease; }
.mr-pin__badge .sim-icon { width: 22px; height: 22px; }
/* sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it per tone and theme, the only thing that can pick readable ink on the accent and amber fills in both themes. */
.mr-pin__badge.is-lit { border-style: solid; border-color: var(--sim-accent);
  background: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-label)); }
.sim-ui[data-step="2"] .mr-pin__badge { border-style: solid; border-color: var(--sim-accent);
  background: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-label)); }
.mr-pin__what { font: 700 var(--sim-text-sm)/1.3 var(--sim-font); color: var(--sim-label-muted); }

/* the lane: two equal pitches, so the empty one is visibly the rival's slot and not a gap */
.mr-lane { align-items: stretch; }
.mr-pitch { display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  gap: var(--sim-space-1); min-height: 132px; padding: var(--sim-space-2); box-sizing: border-box;
  border: 2px solid var(--sim-accent); border-radius: var(--sim-radius-md);
  background: color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface)); }
.mr-pitch .sim-icon { width: 40px; height: 40px; color: var(--sim-accent); }
.mr-pitch__board { display: inline-flex; align-items: center; gap: 5px; padding: 2px 10px; border-radius: var(--sim-radius-sm);
  border: 2px solid var(--sim-stroke); background: var(--sim-bg-deep);
  font: 800 var(--sim-text-lg)/1.25 var(--sim-font); color: var(--sim-label); font-variant-numeric: tabular-nums; }
/* the drawn rupee glyph: sized off the text beside it, so it never outgrows the digits */
.mr-rupee { height: .82em; width: auto; fill: currentColor; display: block; }
.mr-pitch__name { font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); text-align: center; }
.mr-pitch__why { font: 700 var(--sim-text-sm)/1.25 var(--sim-font); color: var(--sim-label-muted); text-align: center; }

/* the empty rival pitch: still a pitch, still there - dashed, ghosted, and saying why it is empty */
.mr-pitch--empty { border-style: dashed; border-color: var(--sim-stroke); background: transparent; }
.mr-pitch--empty .sim-icon { color: var(--sim-label-muted); opacity: .45; }
.mr-pitch--empty .mr-pitch__board { border-style: dashed; color: var(--sim-label-muted); }
.mr-pitch--empty .mr-pitch__name { color: var(--sim-label-muted); }

/* ---- the seller's two readings: price up, quantity down, together ---- */
.mr-read { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: var(--sim-space-2) var(--sim-space-3); }
.mr-read__label { font: 700 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.mr-read__value { display: flex; align-items: baseline; gap: 6px; font: 800 var(--sim-text-2xl)/1.15 var(--sim-font);
  color: var(--sim-label); font-variant-numeric: tabular-nums; }
.mr-read__unit { font: 700 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.mr-read__cap { font: 700 var(--sim-text-sm)/1.25 var(--sim-font); color: var(--sim-label-muted); }
/* the stub's beat 1: the price chip slides up, the quantity chip shrinks. Both are re-armed on every
   value change (the reflow trick in _swap), so the learner's own toggle animates as well. */
.mr-read--rise { animation: mr-rise .45s ease both; }
@keyframes mr-rise { 0% { transform: translateY(12px); } 55% { transform: translateY(-5px); } 100% { transform: translateY(0); } }
.mr-read--shrink { animation: mr-shrink .45s ease both; }
@keyframes mr-shrink { 0% { transform: scale(1.12); } 55% { transform: scale(.88); } 100% { transform: scale(1); } }

/* ---- the four referees: name over the product it watches ---- */
.mr-referees { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--sim-space-2); }
.mr-badge { display: flex; flex-direction: column; align-items: center; gap: 2px; margin: 0;
  padding: var(--sim-space-2) var(--sim-space-1); box-sizing: border-box; cursor: default;
  border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-md); background: transparent;
  font: inherit; color: var(--sim-label-muted);
  transition: background .2s ease, color .2s ease, border-color .2s ease; }
.mr-badge__name { font: 800 var(--sim-text-md)/1.2 var(--sim-font); }
.mr-badge__product { font: 700 var(--sim-text-sm)/1.2 var(--sim-font); }
.mr-badge__q { font: 800 var(--sim-text-md)/1.2 var(--sim-font); }
.mr-badge:not(.is-lit) .mr-badge__name, .mr-badge:not(.is-lit) .mr-badge__product { display: none; }
.mr-badge:not(.is-lit) .mr-badge__q { display: block; }
.mr-badge.is-lit .mr-badge__q { display: none; }
/* "lights up one by one": the fill and the border land at once (so text on the fill is final in every
   theme the moment the badge lights) and only the pop is staggered, 0.14s apart. The stagger replays
   because the lit state itself changes - returning to an earlier beat puts the badges out again. */
.sim-ui[data-step="2"] .mr-badge.is-lit { border-style: solid; border-color: var(--sim-series-1);
  background: var(--sim-series-1); color: var(--sim-ink-on-1, var(--sim-label));
  animation: mr-pop .34s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: calc(var(--i) * 140ms); }
@keyframes mr-pop { from { transform: scale(.82); } to { transform: scale(1); } }
.mr-badge.is-lit { cursor: pointer; }
/* the pin reads on the badge's own fill, in both themes: an accent ring on an accent-filled badge is
   invisible in the light theme, so the ring is label ink, offset outside the badge. */
.mr-badge.is-pinned { outline: 3px solid var(--sim-label); outline-offset: 2px; }
.mr-badge:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }

/* ---- portrait: the referee row folds to two by two, nothing else changes ---- */
.sim-dom-root--portrait .mr-referees { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sim-dom-root--portrait .mr-read__value { font-size: var(--sim-text-xl); }
`;

// ---------------------------------------------------------------- the scene

export class MonopolyRegulatorScene extends DomSimulation {
  static WIDTH = 660;
  static HEIGHT = 560;        // sim-layout: the content measures 556px in landscape, 869 in portrait
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 880;
  static FIT = true;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }],   // one seller, one empty rival pitch, the competitive baseline
    [{ idx: 1, dwellMs: null }],   // no rival to undercut: price up, quantity down
    [{ idx: 2, dwellMs: null }],   // the referee badge lights, and the four referees by name
  ];
  static ARIA_LABEL =
    'A market lane of two stall pitches: the first stall is open and its board reads the price, the second pitch is dashed, empty and labelled no close substitute. '
    + 'Below the lane, the seller\'s own two readings - the price it charges and the units it sells - move together between a competitive stop of 100 rupees for 20 units '
    + 'and a monopolist\'s stop of 150 rupees for 12 units. A referee badge pinned above the lane lights on the last beat, and four badges below name the referees: '
    + 'RBI for banking, CCPA for consumer rights, TRAI for telecom and SEBI for securities.';
  static CONTROLS = [
    {
      type: 'segmented', id: 'choice', label: "The seller's price",
      options: STOPS_IN_ORDER.map((k) => ({ value: k, label: STOPS[k].priceCap.replace(`${UP} `, '') })),
      value: 'competitive',
    },
  ];

  constructor(container, config) {
    super(container, config);
    this._stop = 'competitive';   // where the seller's price and quantity stand right now
    this._seen = new Set();       // the stops the learner has set by hand, for the celebration
    this._celebrated = false;
    this._pinned = -1;            // the referee badge the learner last tapped
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="mr-root">
          <p class="mr-chips">
            <span class="sim-tag sim-tag--accent mr-chip">Monopoly</span>
            <span class="sim-tag mr-chip" data-beat role="status" aria-live="polite"></span>
          </p>

          <div class="sim-card sim-card--accent mr-hero" data-hero>
            <div class="mr-pin">
              <span class="mr-pin__badge" data-pin>
                <span class="mr-pin__icon">${iconSvg('scales', 'currentColor')}</span>
                <span data-pin-q>?</span>
                <span data-pin-name hidden>the referee</span>
              </span>
              <span class="mr-pin__what">watches price + quantity</span>
            </div>

            <div class="sim-grid-2 mr-lane" role="group" aria-label="the market lane: one open stall and one empty rival pitch">
              <div class="mr-pitch">
                <span>${iconSvg('shop', 'currentColor')}</span>
                <span class="mr-pitch__board">${rupeeSvg()}<span data-board></span></span>
                <span class="mr-pitch__name">the only seller</span>
              </div>
              <div class="mr-pitch mr-pitch--empty">
                <span>${iconSvg('shop', 'currentColor')}</span>
                <span class="mr-pitch__board">${DASH}</span>
                <span class="mr-pitch__name">no rival stall</span>
                <span class="mr-pitch__why">no close substitute</span>
              </div>
            </div>
          </div>

          <div class="sim-grid-2">
            <div class="sim-card mr-read" data-price-card>
              <span class="mr-read__label">price it charges</span>
              <span class="mr-read__value">${rupeeSvg()}<span data-price></span> <span class="mr-read__unit">per unit</span></span>
              <span class="mr-read__cap" data-price-cap></span>
            </div>
            <div class="sim-card mr-read" data-qty-card>
              <span class="mr-read__label">units sold</span>
              <span class="mr-read__value"><span data-qty></span> <span class="mr-read__unit">units</span></span>
              <span class="mr-read__cap" data-qty-cap></span>
            </div>
          </div>

          <div class="mr-referees" role="group" aria-label="the referees and the product each one watches">
            ${REFEREES.map((r, i) => `
              <button class="mr-badge" type="button" style="--i:${i}" data-ref="${i}"
                aria-pressed="false" aria-label="${r.name} watches ${r.product}">
                <span class="mr-badge__q" aria-hidden="true">?</span>
                <span class="mr-badge__name">${r.name}</span>
                <span class="mr-badge__product">${r.product}</span>
              </button>`).join('')}
          </div>

          <p class="sim-meta">schematic lane: the two pitches are the market shape, the units are the model's</p>
          ${noteLineHtml([
            { text: 'Regulating keeps price and quantity in check - it does not abolish the seller.' },
          ])}
        </div>`,
    });

    this._el = {
      hero: this.root.querySelector('[data-hero]'),
      beat: this.root.querySelector('[data-beat]'),
      board: this.root.querySelector('[data-board]'),
      price: this.root.querySelector('[data-price]'),
      qty: this.root.querySelector('[data-qty]'),
      priceCap: this.root.querySelector('[data-price-cap]'),
      qtyCap: this.root.querySelector('[data-qty-cap]'),
      priceCard: this.root.querySelector('[data-price-card]'),
      qtyCard: this.root.querySelector('[data-qty-card]'),
      pin: this.root.querySelector('[data-pin]'),
      pinQ: this.root.querySelector('[data-pin-q]'),
      pinName: this.root.querySelector('[data-pin-name]'),
      badges: Array.from(this.root.querySelectorAll('.mr-badge')),
    };
    this._el.badges.forEach((b) => b.addEventListener('click', () => this._pin(Number(b.dataset.ref))));
    applyToneInks(this.root);

    this._paint(false);
  }

  /** The amber series-1 fill is the one thing the CSS cascade cannot decide. */
  refreshTheme() {
    if (this.root) applyToneInks(this.root);
  }

  destroy() {
    this._el = null;
    super.destroy();
  }

  /* ------------------------------------------------------------------ the beats */

  /** The clamped beat index: a mount can open on any beat, and none may be past the last. */
  _beat() {
    const i = Number(this.stepIndex);
    return Number.isFinite(i) && i >= 0 ? Math.min(i, BEAT_CHIP.length - 1) : 0;
  }

  /**
   * A beat change. Beat 0 rests on the competitive baseline (a move needs a "before"), beat 1 is the
   * monopolist's own stop - the stub's price chip up and quantity chip down - and beat 2 lights the
   * four referees. From beat 1 on, the learner's own stop stands until the next beat or mount.
   */
  onStep() {
    const beat = this._beat();
    if (this._el?.beat) this._el.beat.textContent = BEAT_CHIP[beat];
    this._stop = beat === 0 ? 'competitive' : 'monopolist';
    this._pinned = -1;
    this._paint(beat >= 1);
    // The referees belong to their beat: stepping back to 0 or 1 puts them out again, so an earlier
    // beat never shows names that beat 2 is there to reveal.
    const lit = beat >= 2;
    this._el.badges?.forEach((b) => b.classList.toggle('is-lit', lit));
    if (this._el.pinQ) this._el.pinQ.hidden = lit;
    if (this._el.pinName) this._el.pinName.hidden = !lit;
  }

  /** Hidden on beat 0: the beat keeps the empty-slot reveal, so the dial opens on beat 1. */
  isControlHidden(id) {
    return id === 'choice' && this._beat() < 1;
  }

  /** The learner's own price choice: both readings and the stall's board move together. */
  onControlChange(id, v) {
    if (id !== 'choice' || this.isControlHidden(id)) return;
    if (!STOPS_IN_ORDER.includes(v)) return;
    if (v === this._stop) return;
    this._stop = v;
    this._paint(true);
    this._seen.add(v);
    // The concept lands when the learner has pushed both stops by their own hand and watched price
    // and quantity move as one - not when beat 1 arrives with it.
    if (this._seen.size === STOPS_IN_ORDER.length && !this._celebrated) {
      this._celebrated = true;
      burst(this._el?.hero);
    }
  }

  /** The host draws the control at this value, so the bar and the two readings cannot disagree. */
  getControlValue(id) {
    if (id === 'choice') return this._stop;
    return undefined;
  }

  /** A tap on a lit referee badge pins it: one tap is a real read of who watches what. */
  _pin(i) {
    const badge = this._el?.badges?.[i];
    if (!badge || !badge.classList.contains('is-lit')) return;
    this._pinned = this._pinned === i ? -1 : i;
    this._el.badges.forEach((b, k) => {
      b.classList.toggle('is-pinned', k === this._pinned);
      b.setAttribute('aria-pressed', String(k === this._pinned));
    });
  }

  /* ------------------------------------------------------------------ the paint */

  /** The board, both readings and their captions, all from the one stop that is standing. */
  _paint(move) {
    if (!this._el) return;
    const stop = stopOf(this._stop);
    const el = this._el;
    if (el.board) el.board.textContent = String(stop.price);
    if (el.price) el.price.textContent = String(stop.price);
    if (el.qty) el.qty.textContent = String(stop.qty);
    if (el.priceCap) el.priceCap.textContent = stop.priceCap;
    if (el.qtyCap) el.qtyCap.textContent = stop.qtyCap;
    if (move) this._swap();
  }

  /** Re-arm the stub's beat-1 motions: the price chip slides up, the quantity chip shrinks. */
  _swap() {
    const { priceCard, qtyCard } = this._el;
    if (!priceCard || !qtyCard) return;
    [[priceCard, 'mr-read--rise'], [qtyCard, 'mr-read--shrink']].forEach(([card, cls]) => {
      card.classList.remove(cls);
      void card.offsetWidth;
      card.classList.add(cls);
    });
  }
}
