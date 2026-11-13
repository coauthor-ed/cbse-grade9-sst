import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { esc, simRecord, simArrow } from 'simulations/base/SimUi.js';

/**
 * PublicGoodsScene - one village park, five families and a gate nobody can
 * close (blk-l06-s05, 3 beats).
 *
 * The slide's claim is a thought experiment, so the scene is the experiment:
 * the learner runs the village. Every family pays \u20b95,000 only if the others do,
 * so the five pay bars are the whole market - tap a row and it flips between
 * waiting and paying, and the park plan fills in only when all five have paid.
 * That outcome (nobody pays, so the park is never built) is the slide's, found
 * by hand rather than told.
 *
 * Beat 1 is the catch the slide names: the barrier at the gate is crossed out,
 * because a park anyone can walk into cannot charge a fee. Beat 2 folds the five
 * rows to one line and puts the park beside roads, defence, streetlights and
 * sanitation under one tag.
 *
 * Labels only. The bars and the fund line are the model; the park plan is the
 * picture.
 */

// Model numbers (design note "Model numbers"): the slide names one number, the
// \u20b95,000 price per family, and the village size is the scene's own.
const FAMILIES = 5;
const PRICE = 5000;
const NEED = FAMILIES * PRICE; // \u20b925,000 - the park needs every family

// One line of the note, per beat: what the model leaves out.
const NOTES = [
  [{ text: 'each family waits for the other four, so nobody pays' }],
  [{ text: 'a park with no gate cannot charge a fee: anyone on the road can walk in' }],
  [{ text: 'roads, defence, streetlights and sanitation: once they exist, anyone may use them' }],
];

// The slide's own names, in the order it names them.
const GOODS = [
  { key: 'park', name: 'the park', icon: 'tree' },
  { key: 'roads', name: 'roads', icon: 'road' },
  { key: 'defence', name: 'defence', icon: null }, // no neutral glyph in SimIcons: drawn shield
  { key: 'lamps', name: 'streetlights', icon: 'bulb' },
  { key: 'sanitation', name: 'sanitation', icon: 'canal' },
];

const rs = (n) => `\u20b9${n.toLocaleString('en-IN')}`;

// Geometry inside the hero SVG's own 640x200 viewBox - not scene positions: the
// whole SVG is one hero inside one card. The viewBox is kept low and wide so the
// card stays inside the side-panel height budget at full width.
const VB_W = 640;
const VB_H = 200;
const PLOT = { x: 20, y: 76, w: 520, h: 108 };
const GATE = { left: 456, right: 512, top: 58, bottom: 184, beamY: 50, beamH: 8 };
const BOARD = { x: 390, y: 6, w: 200, h: 40 };

// The same rupee shape the L01 and L05 stall boards draw, so every price in this
// course looks alike (the render font may have no U+20B9 glyph).
const RUPEE_D = 'M3 5h12v2.8H3zM2 9.6h14v2.8H2zM7.2 3.2h3.1v11.4c0 3.2 1.5 4.8 5.3 4.8h3l-.9 2.9h-2.4c-5.1 0-8.1-2.9-8.1-7.7z';

// A shield outline, for the one good SimIcons has no neutral glyph for.
const SHIELD = '<svg class="pg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6 20 5.6v6.1c0 4.6-3.1 8.3-8 9.7-4.9-1.4-8-5.1-8-9.7V5.6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

/** One tree, standing on `y`. */
function tree(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect class="pg-tree__trunk" x="-4" y="-2" width="8" height="18" rx="2"/>
    <circle class="pg-tree__canopy" cx="0" cy="-22" r="21"/>
  </g>`;
}

/** The park's inside, drawn twice: once as a ghost plan, once as the built park. */
function parkInside(ghost) {
  const c = ghost ? 'pg-ghost' : 'pg-built';
  return `<g class="${c}">
    <path class="pg-path" d="M490 84 C472 116 430 130 372 134 L262 142"/>
    <ellipse class="pg-pond" cx="150" cy="150" rx="44" ry="19"/>
    ${tree(104, 124, 0.95)}
    ${tree(300, 178, 0.8)}
    ${tree(420, 112, 0.9)}
  </g>`;
}

function parkSvg() {
  const gates = GATE;
  return `<svg class="pg-svg" viewBox="0 0 ${VB_W} ${VB_H}" role="img"
      aria-label="A plan of a village park: an open gate with a price board reading 5,000 rupees per family, a lawn with a path, a pond and three trees, and a road on the far side. The park's inside is drawn as a faint plan until every family has paid.">
    <rect class="pg-road" x="${PLOT.x + PLOT.w}" y="${PLOT.y}" width="${VB_W - PLOT.x - PLOT.w}" height="${PLOT.h}"/>
    <line class="pg-road__line" x1="${PLOT.x + PLOT.w + 46}" y1="${PLOT.y + 8}" x2="${PLOT.x + PLOT.w + 46}" y2="${PLOT.y + PLOT.h - 8}"/>
    <rect class="pg-ground" x="0" y="${PLOT.y + PLOT.h}" width="${VB_W}" height="${VB_H - PLOT.y - PLOT.h}"/>
    <rect class="pg-soil" x="${PLOT.x}" y="${PLOT.y}" width="${PLOT.w}" height="${PLOT.h}" rx="12"/>
    <rect class="pg-lawn" x="${PLOT.x}" y="${PLOT.y}" width="${PLOT.w}" height="${PLOT.h}" rx="12"/>
    ${parkInside(true)}
    ${parkInside(false)}
    <path class="pg-boundary" d="M${PLOT.x} ${PLOT.y} H${gates.left} M${gates.right} ${PLOT.y} H${PLOT.x + PLOT.w} V${PLOT.y + PLOT.h} H${PLOT.x} Z"/>
    <rect class="pg-gate__post" x="${gates.left}" y="${gates.top}" width="12" height="${gates.bottom - gates.top}" rx="3"/>
    <rect class="pg-gate__post" x="${gates.right}" y="${gates.top}" width="12" height="${gates.bottom - gates.top}" rx="3"/>
    <rect class="pg-gate__beam" x="${gates.left - 12}" y="${gates.beamY}" width="${gates.right - gates.left + 36}" height="${gates.beamH}" rx="4"/>
    <g class="pg-board">
      <line class="pg-board__string" x1="${gates.left + 6}" y1="${BOARD.y + BOARD.h}" x2="${gates.left + 6}" y2="${gates.beamY}"/>
      <line class="pg-board__string" x1="${gates.right + 6}" y1="${BOARD.y + BOARD.h}" x2="${gates.right + 6}" y2="${gates.beamY}"/>
      <rect class="pg-board__face" x="${BOARD.x}" y="${BOARD.y}" width="${BOARD.w}" height="${BOARD.h}" rx="9"/>
      <path class="pg-board__rupee" transform="translate(420 18) scale(0.8)" d="${RUPEE_D}"/>
      <text class="pg-board__amt" x="480" y="34" text-anchor="middle">5,000</text>
      <text class="pg-board__unit" x="518" y="34">per family</text>
    </g>
    <g class="pg-barrier">
      <rect class="pg-barrier__arm" x="${gates.left + 4}" y="130" width="${gates.right - gates.left - 8}" height="10" rx="5"/>
      <path class="pg-barrier__x" d="M${gates.left - 8} 120 L${gates.right + 8} 150 M${gates.right + 8} 120 L${gates.left - 8} 150"/>
    </g>
  </svg>`;
}

/** One family, as one tap target: glyph, name, its own bar, what it paid. */
function familyRow(i) {
  return `<button class="sim-card pg-fam" type="button" data-i="${i}" aria-pressed="false">
      <span class="pg-fam__glyph">${iconSvg('family', 7)}</span>
      <span class="pg-fam__name">family ${i + 1}</span>
      <span class="pg-track"><span class="pg-fill"></span></span>
      <span class="pg-amt">${rs(0)}</span>
      <span class="sim-tag pg-state">waiting</span>
    </button>`;
}

const CSS = SIM_LOOK_DOM_CSS + `
.pg-stack { gap: var(--sim-space-3); }
.pg-head { align-items: center; gap: var(--sim-space-2); justify-content: space-between; }
/* Three short words: hug the content, not the whole head. */
.pg-record { flex: 0 1 auto; }
.pg-record .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.pg-hero { padding: var(--sim-space-2); }
.pg-svg { display: block; width: 100%; height: auto; }
.pg-svg text { font-family: inherit; }
.pg-road { fill: color-mix(in oklab, var(--sim-strata-2) 42%, var(--sim-bg-deep)); }
.pg-road__line { stroke: var(--sim-strata-1); stroke-width: 3; stroke-dasharray: 12 12; opacity: .7; }
.pg-ground { fill: color-mix(in oklab, var(--sim-strata-2) 60%, var(--sim-bg-deep)); }
/* Rough ground under the bare plot, so the park's land reads as land even
   before anyone pays for it. */
.pg-soil { fill: color-mix(in oklab, var(--sim-series-3) 26%, var(--sim-bg-deep)); }
/* The lawn only fades in when the park is funded. */
.pg-lawn { fill: var(--sim-series-3); opacity: 0; transition: opacity .45s ease; }
.pg-boundary { fill: none; stroke: var(--sim-strata-3); stroke-width: 2.5; stroke-dasharray: 10 8; }
.pg-built { opacity: 0; transition: opacity .45s ease; }
.pg-ghost { opacity: 1; transition: opacity .45s ease; }
.sim-ui[data-built="1"] .pg-built { opacity: 1; }
.sim-ui[data-built="1"] .pg-ghost { opacity: 0; }
.pg-path { fill: none; stroke: var(--sim-strata-1); stroke-width: 11; stroke-linecap: round; }
.pg-pond { fill: var(--sim-water); stroke: var(--sim-strata-3); stroke-width: 2; }
.pg-tree__trunk { fill: var(--sim-series-8); }
.pg-tree__canopy { fill: var(--sim-series-3); stroke: color-mix(in oklab, var(--sim-series-3) 62%, black); stroke-width: 2; }
/* The faint plan under the bare plot: same shapes, outline only. */
.pg-ghost .pg-path { stroke: var(--sim-muted); stroke-width: 2.5; stroke-dasharray: 8 8; }
.pg-ghost .pg-pond { fill: none; stroke: var(--sim-muted); stroke-width: 2.5; stroke-dasharray: 6 6; }
.pg-ghost .pg-tree__canopy { fill: none; stroke: var(--sim-muted); stroke-width: 2.5; stroke-dasharray: 5 5; }
.pg-ghost .pg-tree__trunk { fill: var(--sim-muted); }
.pg-gate__post, .pg-gate__beam { fill: var(--sim-strata-3); }
.pg-board__string { stroke: var(--sim-strata-3); stroke-width: 2; }
.pg-board__face { fill: var(--sim-series-2); stroke: var(--sim-border); stroke-width: 2; }
.pg-board__amt { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); font-size: var(--sim-text-xl); font-weight: 700; }
.pg-board__unit { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); font-size: var(--sim-text-sm); }
.pg-board__rupee { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); }
/* sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it per tone and theme, the only thing that can pick readable ink on the amber board in both themes. */
.pg-barrier { opacity: 0; transition: opacity .35s ease; }
.sim-ui[data-step="1"] .pg-barrier { opacity: 1; }
.pg-barrier__arm { fill: var(--sim-strata-3); }
.pg-barrier__x { stroke: var(--sim-bad); stroke-width: 6; stroke-linecap: round; }
.pg-readout { align-items: center; gap: var(--sim-space-2); padding: var(--sim-space-2) var(--sim-space-1) 0; }
.pg-fund { font-weight: 700; }
.pg-famhead { align-items: center; justify-content: space-between; gap: var(--sim-space-2); margin-bottom: var(--sim-space-2); flex-wrap: wrap; }
.pg-tap { text-align: right; }
/* Five families side by side, the way a village council would list them; each
   card is the tap target that switches that family between waiting and paying. */
.pg-fams { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--sim-space-2); }
.pg-fam { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 100%;
  font: inherit; color: inherit; text-align: center; cursor: pointer; appearance: none;
  padding: var(--sim-space-2); }
.pg-fam:hover { background: var(--sim-bg-cell); }
.pg-fam:focus-visible { outline: 2px solid var(--sim-accent); outline-offset: 1px; }
.pg-fam[aria-pressed="true"] { background: var(--sim-bg-cell); }
.pg-fam__glyph { display: flex; }
.pg-fam__glyph .sim-icon { width: 26px; height: 26px; display: block; }
.pg-fam__name { font-size: var(--sim-text-sm); white-space: nowrap; }
.pg-track { display: block; width: 100%; height: 10px; border-radius: var(--sim-radius-pill);
  background: var(--sim-bg-deep); border: 1px solid var(--sim-stroke); overflow: hidden; }
.pg-fill { display: block; height: 100%; width: 0; border-radius: var(--sim-radius-pill);
  background: var(--sim-good); transition: width .3s ease; }
.pg-amt { font-size: var(--sim-text-md); }
.pg-fam[aria-pressed="true"] .pg-amt { color: var(--sim-good); font-weight: 700; }
.pg-state { justify-content: center; }
/* Beat 2 folds the five cards away so the goods row has room. */
.pg-fold { align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }
.pg-gate { align-items: center; gap: var(--sim-space-2); padding: var(--sim-space-2) var(--sim-space-1) 0; }
.pg-person { display: flex; }
.pg-person .sim-icon { width: 26px; height: 26px; display: block; }
.pg-say { font-weight: 700; }
.pg-strike { text-decoration: line-through; text-decoration-thickness: 2px; text-decoration-color: var(--sim-bad); }
.pg-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--sim-space-2); }
.pg-good { display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--sim-space-2) var(--sim-space-1); text-align: center; }
.pg-good__icon { color: var(--sim-series-7); display: flex; }
.pg-good__icon .sim-icon, .pg-icon { width: 26px; height: 26px; display: block; }
.pg-good__name { font-size: var(--sim-text-sm); line-height: 1.2; overflow-wrap: anywhere; }
/* Portrait: the five families and the five goods go to two columns, and the
   SVG's own text is bumped because this 640-wide viewBox scales to about 0.55. */
.sim-dom-root--portrait .pg-grid, .sim-dom-root--portrait .pg-fams { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sim-dom-root--portrait .pg-board__amt { font-size: 34px; }
.sim-dom-root--portrait .pg-board__unit { font-size: 26px; }
`;

export class PublicGoodsScene extends DomSimulation {
  static WIDTH = 660;
  static HEIGHT = 670; // sim-layout: tallest landscape interaction state (beat 1) is 668
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 1035; // sim-layout: tallest portrait interaction state is 1031
  static FIT = true;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }], // beat 0: the price, and five families who all wait
    [{ idx: 1, dwellMs: null }], // beat 1: the gate that cannot be closed
    [{ idx: 2, dwellMs: null }], // beat 2: the park joins the goods the government provides
  ];
  static ARIA_LABEL = 'A plan of a village park whose gate carries a price board of 5,000 rupees per family, with a card for each of five families underneath. Tapping a family card switches it between waiting and paying; the park plan fills in only when all five have paid. The second beat crosses out the barrier at the gate, and the third puts the park beside roads, defence, streetlights and sanitation.';
  static CONTROLS = [];

  async setup() {
    await super.setup();
    this.paid = Array.from({ length: FAMILIES }, () => false);
    this._celebrated = false;
    this.render({
      css: CSS,
      html: `<div class="sim-stack pg-stack">
        <div class="sim-row pg-head">
          <span class="sim-tag sim-tag--accent">village park</span>
          <span class="pg-record"></span>
        </div>
        <div class="sim-card pg-hero">
          ${parkSvg()}
          <div class="sim-row pg-readout">
            <span class="sim-tag pg-fund"></span>
            <span class="sim-tag pg-outcome"></span>
            <span class="sim-tag sim-tag--accent pg-tax" hidden>paid for by tax</span>
          </div>
          <div class="sim-row pg-gate" hidden>
            <span class="sim-tag">a fence at the gate</span>
            <span class="pg-say pg-strike">${rs(PRICE)} a head</span>
            ${simArrow()}
            <span class="pg-person">${iconSvg('person', 7)}</span>
            <span class="sim-tag sim-tag--accent">no fence: use it free</span>
          </div>
        </div>
        <div class="sim-card pg-families">
          <div class="sim-row pg-famhead">
            <span class="sim-tag">five families, ${rs(PRICE)} each</span>
            <span class="sim-meta pg-tap">tap one to switch it</span>
          </div>
          <div class="pg-fams">${Array.from({ length: FAMILIES }, (_, i) => familyRow(i)).join('')}</div>
          <div class="sim-row pg-fold" hidden>
            <span class="sim-tag pg-fold__dots"></span>
            <span class="sim-tag pg-fold__fund"></span>
          </div>
        </div>
        <div class="pg-goods" hidden>
          <div class="sim-row pg-goodshead"><span class="sim-tag sim-tag--accent">the same for the whole row</span></div>
          <div class="pg-grid">${GOODS.map((g) => `<div class="sim-card pg-good">
              <span class="pg-good__icon">${g.icon ? iconSvg(g.icon, 7) : SHIELD}</span>
              <span class="pg-good__name">${esc(g.name)}</span>
            </div>`).join('')}</div>
        </div>
        <div class="pg-note"></div>
      </div>`,
    });
    applyToneInks(this.root);
    this._park = this.root.querySelector('.pg-hero');
    this._record = this.root.querySelector('.pg-record');
    this._fund = this.root.querySelector('.pg-fund');
    this._outcome = this.root.querySelector('.pg-outcome');
    this._tax = this.root.querySelector('.pg-tax');
    this._fams = this.root.querySelector('.pg-fams');
    this._fold = this.root.querySelector('.pg-fold');
    this._foldDots = this.root.querySelector('.pg-fold__dots');
    this._foldFund = this.root.querySelector('.pg-fold__fund');
    this._gate = this.root.querySelector('.pg-gate');
    this._goods = this.root.querySelector('.pg-goods');
    this._note = this.root.querySelector('.pg-note');
    this._bars = Array.from(this.root.querySelectorAll('.pg-fam')).map((el) => ({
      el,
      amt: el.querySelector('.pg-amt'),
      fill: el.querySelector('.pg-fill'),
      state: el.querySelector('.pg-state'),
    }));
    // One delegated listener on the root, so a tap anywhere on a card lands.
    this.root.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('.pg-fam');
      if (!btn || !this._fams?.contains(btn)) return;
      this._toggle(Number(btn.dataset.i));
    });
    this.onStep();
  }

  // The base class clamps the beat, sets this.stepIndex and root.dataset.step, then calls this.
  onStep() {
    if (this._record) {
      this._record.innerHTML = simRecord(['the price', 'the catch', 'the builder'], this.stepIndex, 'Park');
    }
    if (this._gate) this._gate.hidden = this.stepIndex !== 1;
    if (this._goods) this._goods.hidden = this.stepIndex !== 2;
    if (this._fams) this._fams.hidden = this.stepIndex === 2;
    if (this._fold) this._fold.hidden = this.stepIndex !== 2;
    if (this._tax) this._tax.hidden = this.stepIndex !== 2;
    if (this._note) this._note.innerHTML = noteLineHtml(NOTES[this.stepIndex] || []);
    // On the last beat the park stands whatever the village did: the government
    // builds it. Before that it stands only if the learner got all five to pay.
    this.root.dataset.built = this.stepIndex === 2 || this._allPaid() ? '1' : '0';
    this._paint();
  }

  /** One family row: waiting <-> paying. The whole experiment is this toggle. */
  _toggle(i) {
    if (!(i >= 0 && i < FAMILIES)) return;
    this.paid[i] = !this.paid[i];
    this._paint();
    // The concept lands when the learner has found the only way the park gets
    // built - not when any beat arrived.
    if (this._allPaid() && !this._celebrated) {
      this._celebrated = true;
      if (this._park) burst(this._park);
    }
  }

  _allPaid() {
    return this.paid.every(Boolean);
  }

  _paidCount() {
    return this.paid.filter(Boolean).length;
  }

  _paint() {
    const n = this._paidCount();
    const got = n * PRICE;
    this.paid.forEach((on, i) => {
      const bar = this._bars[i];
      if (!bar) return;
      if (bar.el.getAttribute('aria-pressed') !== String(on)) bar.el.setAttribute('aria-pressed', String(on));
      if (bar.amt) bar.amt.textContent = on ? rs(PRICE) : rs(0);
      if (bar.fill) bar.fill.style.width = on ? '100%' : '0%';
      if (bar.state) {
        bar.state.textContent = on ? 'paid' : 'waiting';
        bar.state.classList.toggle('sim-tag--accent', on);
      }
    });
    const built = this._allPaid();
    if (this._fund) this._fund.textContent = `${rs(got)} of ${rs(NEED)}`;
    if (this._outcome) {
      this._outcome.textContent = built
        ? 'park built'
        : (n === 0 ? `all ${FAMILIES} waiting` : `short ${rs(NEED - got)}`);
      this._outcome.classList.toggle('sim-tag--accent', built);
    }
    if (this._foldDots) {
      this._foldDots.textContent = Array.from({ length: FAMILIES }, (_, i) => (this.paid[i] ? '\u25cf' : '\u25cb')).join(' ');
      this._foldDots.classList.toggle('sim-tag--accent', built);
    }
    if (this._foldFund) {
      this._foldFund.textContent = built
        ? `all ${FAMILIES} paid ${rs(PRICE)} each`
        : `${n} of ${FAMILIES} paid - ${rs(got)} of ${rs(NEED)}`;
    }
  }

  refreshTheme() {
    if (this.root) applyToneInks(this.root);
  }

  destroy() {
    this._park = this._record = this._fund = this._outcome = this._tax = null;
    this._fams = this._fold = this._foldDots = this._foldFund = this._gate = null;
    this._goods = this._note = null;
    this._bars = [];
    super.destroy();
  }
}
