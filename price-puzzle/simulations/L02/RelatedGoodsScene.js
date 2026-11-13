import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc, simTag } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';
import { fmtINR } from 'simulations/base/kit/SimText.js';

/**
 * RelatedGoodsScene - blk-l02-s04, beats 0-2 (substitutes, complements, recap).
 *
 * One pair of goods per beat: the neighbour whose price the learner moves (the
 * dial, a -/+ stepper on that card's price row) and the watched good, whose own
 * price tag stands still while its demand rail answers. Both cards carry a
 * demand rail on one shared scale, so the beat reads in a glance - the left
 * rail leans against its own price (the L01 law), the right rail leans with the
 * neighbour's move (this slide's rule).
 *
 * Nothing runs: the scene is at rest on load, and rests with the last dial
 * setting. The only motion is a ~300 ms CSS ease on each rail's width.
 */

const T_LEFT = 'var(--sim-series-5)';   // the good whose price moves
const T_RIGHT = 'var(--sim-series-2)';  // the watched good



const NOTE_ROWS = [
  { text: 'The watched good\u2019s own price never moves here - only its demand does' },
  { text: 'Counts are a day at one lane / one cinema hall / one shop; every number on screen is [derived]' },
];

// ------------------------------------------------------------------ the art

function artCoffee() {
  return `<svg class="rg-art__svg" viewBox="0 0 200 80" role="img" aria-label="A cup of coffee on a saucer">
  <path d="M28 16 q6 -8 0 -16 M46 14 q6 -8 0 -16" fill="none" stroke="var(--sim-label-muted)" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
  <ellipse cx="112" cy="66" rx="46" ry="9" fill="var(--sim-track)"/>
  <path d="M66 30 h74 v22 a20 20 0 0 1 -20 20 h-34 a20 20 0 0 1 -20 -20 Z" fill="${T_LEFT}" stroke="var(--sim-series-5-ink)" stroke-width="3"/>
  <path d="M140 36 a14 14 0 0 1 0 30" fill="none" stroke="var(--sim-series-5-ink)" stroke-width="6"/>
  <ellipse cx="103" cy="30" rx="37" ry="9" fill="var(--sim-series-5-ink)"/>
</svg>`;
}

function artTea() {
  return `<svg class="rg-art__svg" viewBox="0 0 200 80" role="img" aria-label="A glass of tea">
  <path d="M84 14 h32 l-5 56 a11 11 0 0 1 -22 0 Z" fill="var(--sim-bg-surface)" stroke="var(--sim-stroke)" stroke-width="3"/>
  <path d="M87 32 h26 l-4 38 a9 9 0 0 1 -18 0 Z" fill="var(--sim-flame)"/>
  <ellipse cx="100" cy="32" rx="13" ry="4" fill="var(--sim-gold)"/>
  <rect x="110" y="6" width="7" height="58" rx="3.5" fill="var(--sim-series-2-ink)" transform="rotate(12 113 35)"/>
</svg>`;
}

function artCinema() {
  return `<svg class="rg-art__svg" viewBox="0 0 200 80" role="img" aria-label="A cinema screen above two seats">
  <rect x="44" y="8" width="112" height="52" rx="5" fill="var(--sim-bg-cell)" stroke="var(--sim-series-5-ink)" stroke-width="4"/>
  <path d="M56 46 l20 -18 14 12 12 -9 20 15 Z" fill="${T_LEFT}"/>
  <circle cx="132" cy="24" r="6" fill="var(--sim-gold)"/>
  <rect x="36" y="62" width="40" height="14" rx="6" fill="var(--sim-series-5-ink)"/>
  <rect x="124" y="62" width="40" height="14" rx="6" fill="var(--sim-series-5-ink)"/>
  <rect x="86" y="62" width="28" height="12" rx="6" fill="var(--sim-stroke)"/>
</svg>`;
}

function artPopcorn() {
  return `<svg class="rg-art__svg" viewBox="0 0 200 80" role="img" aria-label="A tub of popcorn">
  <circle cx="78" cy="30" r="9" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <circle cx="94" cy="22" r="11" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <circle cx="112" cy="30" r="9" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <circle cx="86" cy="40" r="10" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <circle cx="105" cy="41" r="9" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <path d="M66 40 h68 l-8 34 h-52 Z" fill="${T_RIGHT}" stroke="var(--sim-series-2-ink)" stroke-width="3"/>
  <path d="M78 44 l-4 26 M95 42 l0 30 M112 44 l4 26" stroke="var(--sim-series-2-ink)" stroke-width="3" opacity="0.6"/>
</svg>`;
}

function artPrinter() {
  return `<svg class="rg-art__svg" viewBox="0 0 200 80" role="img" aria-label="A printer with a sheet coming out">
  <rect x="76" y="6" width="48" height="16" rx="3" fill="var(--sim-bg-surface)" stroke="var(--sim-stroke)" stroke-width="3"/>
  <rect x="50" y="22" width="100" height="40" rx="8" fill="${T_LEFT}" stroke="var(--sim-series-5-ink)" stroke-width="3"/>
  <rect x="50" y="52" width="100" height="12" rx="4" fill="var(--sim-series-5-ink)"/>
  <path d="M82 62 h36 l6 14 h-48 Z" fill="var(--sim-bg-surface)" stroke="var(--sim-stroke)" stroke-width="3"/>
  <circle cx="132" cy="34" r="5" fill="var(--sim-good)"/>
</svg>`;
}

function artCartridge() {
  return `<svg class="rg-art__svg" viewBox="0 0 200 80" role="img" aria-label="An ink cartridge">
  <rect x="70" y="18" width="60" height="52" rx="6" fill="${T_RIGHT}" stroke="var(--sim-series-2-ink)" stroke-width="3"/>
  <rect x="70" y="18" width="60" height="14" rx="6" fill="var(--sim-series-2-ink)"/>
  <rect x="120" y="34" width="14" height="8" rx="3" fill="var(--sim-bg-deep)"/>
  <rect x="82" y="42" width="24" height="16" rx="3" fill="var(--sim-bg-deep)" opacity="0.65"/>
  <path d="M100 26 v6" stroke="var(--sim-bg-deep)" stroke-width="3" stroke-linecap="round"/>
</svg>`;
}

// ------------------------------------------------------------------- pairs

const PAIRS = [
  {
    id: 'cup',
    left: {
      name: 'Coffee shop',
      prices: [20, 30, 50],
      unit: '\u20b9/cup',
      unitText: 'a cup',
      demand: [90, 70, 45],
      count: (n) => `${n}`,
      max: 120,
      scale: 'cups a day \u00b7 0-120',
      art: artCoffee(),
    },
    right: {
      name: 'Tea stall',
      own: '\u20b920 a cup',
      demand: [42, 60, 84],
      count: (n) => `${n}`,
      max: 120,
      scale: 'cups a day \u00b7 0-120',
      art: artTea(),
    },
    pairTag: 'substitutes',
    found: 2,
    foundChip: 'coffee dear, tea wanted',
  },
  {
    id: 'hall',
    left: {
      name: 'Cinema ticket',
      prices: [200, 250, 350],
      unit: '\u20b9',
      unitText: 'a ticket',
      demand: [100, 80, 45],
      count: (n) => `${n}`,
      max: 200,
      scale: 'tickets a day \u00b7 0-200',
      art: artCinema(),
    },
    right: {
      name: 'Popcorn counter',
      own: '\u20b960 a tub',
      demand: [150, 120, 70],
      count: (n) => `${n}`,
      max: 200,
      scale: 'tubs a day \u00b7 0-200',
      art: artPopcorn(),
    },
    pairTag: 'complements',
    found: 2,
    foundChip: 'ticket dear, popcorn unsold',
  },
  {
    id: 'shop',
    left: {
      name: 'Printer',
      prices: [9000, 12000, 16000],
      unit: '\u20b9',
      unitText: 'each',
      demand: [28, 18, 10],
      count: (n) => `${n}`,
      max: 80,
      scale: 'printers a day \u00b7 0-80',
      art: artPrinter(),
    },
    right: {
      name: 'Ink cartridge',
      own: '\u20b9450 each',
      demand: [65, 40, 25],
      count: (n) => `${n}`,
      max: 80,
      scale: 'cartridges a day \u00b7 0-80',
      art: artCartridge(),
    },
    pairTag: 'complements',
    found: 0,
    foundChip: 'printer cheap, cartridges wanted',
  },
];

// The recap on beat 2, one short chip per pair: what moved, what answered. Plain
// words rather than arrows, because "coffee up" next to an arrow reads as the
// wrong good moving. The names are the slide's own two words per pairing.
const LEDGER = [
  { kind: 'substitutes', text: 'coffee dearer \u2192 more tea' },
  { kind: 'complements', text: 'ticket dearer \u2192 less popcorn' },
  { kind: 'complements', text: 'printer cheaper \u2192 more cartridges' },
];

// -------------------------------------------------------------------- card

function cardShell(side, spec) {
  const isLeft = side === 'left';
  return `<article class="sim-card rg-card rg-card--${side}" data-card="${side}" role="group" aria-label="${esc(spec.name)}: ${isLeft ? 'price moves here' : 'own price held'}">
  <div class="rg-head">
    <h2 class="sim-title" data-name>${esc(spec.name)}</h2>
    <span class="rg-role">${isLeft ? 'price moves here' : 'watched'}</span>
  </div>
  <div class="rg-art" data-art></div>
  <div class="rg-price" data-price></div>
  <div class="rg-row">
    <span class="rg-row__label">demand</span>
    <span class="rg-track"><span class="rg-rail"><span class="rg-fill rg-fill--${side}" data-fill></span></span><span class="rg-head-arrow rg-head-arrow--${side}"></span></span>
    <span class="rg-row__v" data-v></span>
  </div>
  <div class="rg-scale" data-scale></div>
  ${isLeft ? `<div class="rg-dial" role="group" aria-label="Change ${esc(spec.name)}'s price">
    <button type="button" class="rg-step" data-d="-1" aria-label="Cheaper">\u2212</button>
    <span class="rg-dial__hint">price</span>
    <button type="button" class="rg-step" data-d="1" aria-label="Dearer">+</button>
  </div>` : '<div class="rg-pair" data-pair></div>'}
</article>`;
}

// ---------------------------------------------------------------------- css

const CSS = `${SIM_LOOK_DOM_CSS}
.rg-top { justify-content: center; }
.rg-pairs { display: flex; gap: var(--sim-space-3); align-items: stretch; }
/* The arrow column is a wrapper too, so every card fills the row's height. */
.rg-pairs > div { display: flex; min-width: 0; }
.rg-pairs > div:first-child,
.rg-pairs > div:last-child { flex: 1 1 0; }
.rg-card { gap: var(--sim-space-2); flex: 1 1 auto; }
.rg-card .sim-title { font-size: var(--sim-text-lg); }
.rg-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--sim-space-2); flex-wrap: wrap; }
.rg-role { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }
.rg-card--left .rg-role { color: var(--sim-series-5-ink); }
.rg-card--right { border-color: var(--sim-series-2-ink); }
.rg-card--right .rg-role { color: var(--sim-series-2-ink); }
.rg-art { display: flex; min-width: 0; min-height: 66px; }
.rg-art__svg { display: block; width: 100%; height: 100%; min-height: 66px; }
.rg-price { display: flex; align-items: baseline; gap: var(--sim-space-2); flex-wrap: wrap; min-height: 30px; }
.rg-price__v { font-size: var(--sim-text-xl); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rg-price__u { font-size: var(--sim-text-sm); color: var(--sim-label-muted); white-space: nowrap; }
.rg-price__tag { font-size: var(--sim-text-sm); }
.rg-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--sim-space-2); }
.rg-row__label { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); white-space: nowrap; }
.rg-track { display: flex; align-items: center; min-width: 0; max-width: 100%; }
.rg-rail { flex: 1; min-width: 0; height: 16px; border-radius: var(--sim-radius-pill); background: var(--sim-track); overflow: hidden; }
.rg-fill { display: block; height: 100%; width: calc(var(--k, 0.4) * 100%); border-radius: var(--sim-radius-pill); transition: width 300ms cubic-bezier(0.2, 0.8, 0.3, 1.1); }
.rg-fill--left { background: ${T_LEFT}; }
.rg-fill--right { background: ${T_RIGHT}; }
.rg-head-arrow { flex: 0 0 12px; height: 20px; margin-left: 2px; clip-path: polygon(100% 50%, 0 0, 0 100%); }
.rg-head-arrow--left { background: ${T_LEFT}; }
.rg-head-arrow--right { background: ${T_RIGHT}; }
.rg-row__v { font-size: var(--sim-text-md); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rg-scale { font-size: var(--sim-text-sm); color: var(--sim-label-muted); text-align: right; }
.rg-dial { display: flex; align-items: center; justify-content: center; gap: var(--sim-space-2); }

.rg-step { min-width: 56px; min-height: 42px; padding: 0 var(--sim-space-3); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); color: var(--sim-label); font-family: inherit; font-size: var(--sim-text-xl); font-weight: 800; line-height: 1; cursor: pointer; }
.rg-step:hover:enabled { border-color: var(--sim-accent); }
.rg-step:disabled { opacity: 0.45; cursor: default; }
.rg-dial__hint { font-size: var(--sim-text-sm); color: var(--sim-label-muted); }
.rg-card--on .rg-step { animation: rg-hint 2.6s ease-in-out infinite; }
.rg-card--found .rg-step { animation: none; }
@keyframes rg-hint { 0%, 100% { box-shadow: 0 0 0 0 var(--sim-accent); } 50% { box-shadow: 0 0 0 4px var(--sim-accent); } }
.rg-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 0 0 auto; }
.rg-arrow__glyph { font-size: var(--sim-text-2xl); line-height: 1; color: var(--sim-label-muted); }
/* The watched card's last row carries the pairing name, so the card has no
   empty band where the left card's dial is. */
.rg-pair { display: flex; align-items: center; justify-content: center; min-height: 42px; }
/* The recap is three cells in a row (kind tag above, the pair below), not three
   stacked rows: a row of them is a third of the height the host must budget.
   FIT lets it appear only on the beat that owns it, with no reserved band. */
.rg-ledger { display: none; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-1) var(--sim-space-2); align-items: center; }
.rg-ledger[data-on="1"] { display: grid; }
.rg-ledger__row { display: flex; flex-direction: column; align-items: center; gap: var(--sim-space-1); min-width: 0; }
.rg-ledger .sim-tag { font-size: var(--sim-text-sm); max-width: 100%; white-space: normal; text-align: center; }
.rg-ledger__kind { color: var(--sim-label-muted); }
.rg-ledger__pair { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label); text-align: center; }
/* One chip line, always: nowrap keeps the found chip from growing the frame. */
.rg-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--sim-space-1); min-height: 34px; }
.rg-foot .sim-tag { max-width: 100%; white-space: nowrap; }
.rg-foot .sim-tag--accent { font-weight: 800; }
.sim-dom-root--portrait .rg-pairs { flex-direction: column; }
/* A phone-wide cell fits kind and pair on one line, so the recap costs three
   rows there instead of six. */
.sim-dom-root--portrait .rg-ledger { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .rg-ledger__row { flex-direction: row; justify-content: center; }
.sim-dom-root--portrait .rg-arrow__glyph { transform: rotate(90deg); }
.sim-dom-root--portrait .rg-art,
.sim-dom-root--portrait .rg-art__svg { min-height: 58px; }
`;

// One entry per real beat (scene-info: blk-l02-s04 = 3).
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
];

export class RelatedGoodsScene extends DomSimulation {
  static WIDTH = 680;
  // Set from sim-layout's own numbers once the card internals are trimmed.
  // FIT: the frame takes the height of the content showing, so beat 2's recap
  // does not leave an empty band under the cards on beats 0 and 1 (and nothing
  // here grows under the learner's hands - the foot is one nowrap chip line).
  // HEIGHT / PORTRAIT_HEIGHT are the initial hints (sim-layout: 520-570 in
  // landscape, 1010-1056 in portrait).
  static FIT = true;
  static HEIGHT = 570;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 1085;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'Two stalls per beat - the neighbour whose price moves and the watched good whose own price holds - each with its own demand bar, so a dearer stand-in lifts its partner and a dearer partner drags it down.';
  // The one dial per beat is the neighbour card's own -/+ stepper, beside the
  // price row it moves, so there is nothing in the host control bar.
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._stop = 1;
    this._prev = null;
    this._found = false;
    this._shown = -1;
  }

  async setup() {
    await super.setup();
    this.render({
      css: CSS,
      rootClass: 'rg-root sl-backdrop',
      html: `<div class="sim-row rg-top">${simTag('one price moves')}${simTag('one price holds')}${simTag('demand answers', { accent: true })}</div>
<div class="rg-pairs" data-pairs>
  <div data-card="left">${cardShell('left', PAIRS[0].left)}</div>
  <div class="rg-arrow" aria-hidden="true"><span class="rg-arrow__glyph">\u2192</span></div>
  <div data-card="right">${cardShell('right', PAIRS[0].right)}</div>
</div>
<div class="rg-ledger" data-ledger aria-label="The three pairs">${LEDGER.map((r) => `<span class="rg-ledger__row"><span class="sim-tag rg-ledger__kind">${esc(r.kind)}</span><span class="rg-ledger__pair">${esc(r.text)}</span></span>`).join('')}</div>
<div class="rg-foot" data-foot aria-live="polite"></div>
<div>${noteLineHtml(NOTE_ROWS)}</div>`,
    });
    this._cache();
    this._bind();
    this.onStep();
  }

  destroy() {
    this._shown = -1;
    super.destroy();
  }

  _cache() {
    this._cards = {
      left: this._ref('left'),
      right: this._ref('right'),
    };
    this._ledger = this.root?.querySelector?.('[data-ledger]');
    this._foot = this.root?.querySelector?.('[data-foot]');
  }

  _ref(side) {
    const host = this.root?.querySelector?.(`[data-card="${side}"]`);
    const el = host?.querySelector?.('.rg-card') ?? host;
    return {
      spec: PAIRS[0][side],
      el,
      name: el?.querySelector?.('[data-name]'),
      art: el?.querySelector?.('[data-art]'),
      price: el?.querySelector?.('[data-price]'),
      fill: el?.querySelector?.('[data-fill]'),
      v: el?.querySelector?.('[data-v]'),
      scale: el?.querySelector?.('[data-scale]'),
      pair: el?.querySelector?.('[data-pair]'),
      btns: Array.from(el?.querySelectorAll?.('[data-d]') ?? []),
    };
  }

  _bind() {
    this.root?.addEventListener?.('click', (e) => {
      const btn = e.target?.closest?.('[data-d]');
      if (!btn || btn.disabled) return;
      this._move(Number(btn.dataset.d));
    });
  }

  _pair() {
    const beat = this.stepIndex ?? 0;
    return PAIRS[Math.max(0, Math.min(PAIRS.length - 1, beat))];
  }

  // Each beat is its own question on its own pair, and any mount may open cold
  // on any beat, so a beat change starts from the middle stop again.
  onStep() {
    this._stop = 1;
    this._prev = null;
    this._found = false;
    this._shown = -1;
    this._paint();
    this.requestUiUpdate?.();
  }

  _move(d) {
    const next = this._stop + d;
    if (next < 0 || next > 2) return;
    this._prev = this._stop;
    this._stop = next;
    // The concept, not the press: the stop the beat is about - dearer on beats
    // 0 and 1, cheaper on beat 2, where a fall is what lifts the partner.
    const found = !this._found && next === this._pair().found;
    this._found = this._found || found;
    this._paint();
    if (found) burst(this._cards.right?.el, 22);
  }

  _paint() {
    const pair = this._pair();
    const beat = this.stepIndex ?? 0;
    // Only the goods themselves change on a beat change; the rails, the price
    // rows and the foot are repainted on every move.
    const swap = this._shown !== beat;
    ['left', 'right'].forEach((side) => {
      const ref = this._cards[side];
      if (!ref?.el) return;
      ref.spec = pair[side];
      if (swap) {
        if (ref.name) ref.name.textContent = ref.spec.name;
        if (ref.art) ref.art.innerHTML = ref.spec.art;
        if (ref.scale) ref.scale.textContent = ref.spec.scale;
        ref.el.setAttribute('aria-label', `${ref.spec.name}: ${side === 'left' ? 'price moves here' : 'own price held'}`);
      }
      const qty = ref.spec.demand[this._stop];
      const k = Math.max(0.03, Math.min(1, qty / ref.spec.max));
      ref.fill?.style?.setProperty('--k', k.toFixed(3));
      if (ref.v) ref.v.textContent = ref.spec.count(qty);
      if (ref.price) {
        ref.price.innerHTML = side === 'left'
          ? `<span class="rg-price__v">${esc(fmtINR(ref.spec.prices[this._stop]))}</span><span class="rg-price__u">${esc(ref.spec.unitText)}</span>${simTag('moves', { accent: true })}`
          : `<span class="rg-price__v">${esc(ref.spec.own)}</span><span class="rg-price__tag">${simTag('held', { accent: true })}</span>`;
      }
      if (side === 'right' && ref.pair) ref.pair.innerHTML = simTag(pair.pairTag, { accent: true });
      ref.el.classList.toggle('sim-card--accent', side === 'right');
      ref.el.classList.toggle('rg-card--found', side === 'right' && this._found);
      ref.btns.forEach((b) => {
        const n = this._stop + Number(b.dataset.d);
        b.disabled = n < 0 || n > 2;
      });
    });
    this._cards.left?.el?.classList?.toggle('rg-card--on', !this._found);
    if (this._ledger) this._ledger.dataset.on = beat === PAIRS.length - 1 ? '1' : '0';
    if (this._foot) this._foot.innerHTML = this._footHtml(pair);
    this._shown = beat;
    this.refit?.();
  }

  // One line under the rails: the dial's own state, then the move just made -
  // or the beat's point once the learner has found it.
  _footHtml(pair) {
    const tag = (text, accent) => `<span class="sim-tag${accent ? ' sim-tag--accent' : ''}">${esc(text)}</span>`;
    const left = pair.left;
    const price = `${fmtINR(left.prices[this._stop])} ${left.unitText}`;
    if (this._found) return tag(price, false) + tag(pair.foundChip, true);
    const before = this._prev;
    if (before === null || before === this._stop) return tag(price, false) + tag('tap \u2212 or +', false);
    const moved = left.demand.map((n, i) => (n !== left.demand[before] ? [before, i] : null)).filter(Boolean);
    const bits = moved.map(([b, i]) => `${left.count(left.demand[b])} \u2192 ${left.count(left.demand[i])}`);
    return tag(price, false) + tag(bits.join(', ') || 'no change', true);
  }

  // Nothing to wait for: the only motion is each rail's own CSS transition.
  busy() {
    return false;
  }
}