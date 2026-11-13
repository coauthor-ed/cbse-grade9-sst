import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { simTag, simField } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';

/**
 * ExpectationsWeatherScene - blk-l04-s06, beats 0-2 (boom hearsay, crash
 * hearsay, a failed monsoon).
 *
 * One wholesaler's shed in three states. The price banner across the top never
 * changes on any beat - that non-move IS the lesson - while the sacks on his
 * cart do, because of a decision (beats 0-1) or the weather (beat 2).
 *
 * The learner works the lever (beats 0-1) or the monsoon strip (beat 2); only
 * that beat's control is live, because beat 2's point is a force the seller
 * does not choose.
 *
 * DOM, not canvas: a labelled panel, two piles of sacks and one number that
 * changes on a tap. The only motion is a CSS width ease on the meter fill and
 * a pop on the changed readout, so the scene is at rest between taps.
 */

// One price for the whole scene - the number that must not move. The slide
// gives no figures of its own; these are the model numbers in the design note.
// Two lever stops only: everything he has, or the 12 sacks he can be bothered
// to dig out for a buyer who will not pay more.
const PRICE = '\u20b920/kg';
const STORE = 68;                       // sacks in the storehouse
const HELD_SHIP = 12;                   // ships today when he holds back
const MONSOON = [STORE, 40, 18];        // what the crop leaves him, stop by stop
const MONSOON_CHIP = ['monsoon on time', 'rain thinning', 'monsoon failed'];
const HOLDING = 'holding it back';
const SELLING = 'selling all today';
const LOCKED = 'not his choice today';

const BEAT_SPEC = [
  {
    radio: 'radio: boom next season',
    signal: 'boom rumour',
    startHold: false,     // he would ship the lot, until the rumour
    lever: true,
    strip: false,
    mover: 'his expectation',
    rule: 'expecting dearer \u2192 hold back',
    hint: 'tap the lever',
    found: 'held back: 12 sacks',
  },
  {
    radio: 'radio: crash expected',
    signal: 'crash rumour',
    startHold: true,      // he was holding, until the other rumour
    lever: true,
    strip: false,
    mover: 'his expectation',
    rule: 'expecting cheaper \u2192 sell all',
    hint: 'tap the lever',
    found: 'sold all: 68 sacks',
  },
  {
    radio: 'radio: quiet on the wire',
    signal: 'no price signal',
    startHold: false,
    lever: false,
    strip: true,
    mover: 'the monsoon',
    rule: 'no price signal \u2192 supply shifts',
    hint: 'tap the weather strip',
    found: 'monsoon failed: 18 sacks',
  },
];

// The other two forces the slide names, each with the direction it pushes
// supply. The strip is the one the learner can push.
const FORCES = [
  { name: 'input costs \u2191', live: false },
  { name: 'monsoon fails', live: true },
  { name: 'orchard disaster', live: false },
];
// The slide's three examples all push the same way, so the direction rides on
// one shared chip instead of being repeated in each of them.
const FORCE_RESULT = 'supply \u2193';

const NOTE_ROWS = [
  { text: `One wholesaler\u2019s shed, not the market\u2019s supply; one sack glyph = 20 sacks; price held at ${PRICE} to show the rule` },
];

// --------------------------------------------------------------------- art

// One glyph = 20 sacks, and a part-filled glyph is drawn part width, so the
// piles are honest about the remainder (the exact counts are on the chips).
function pileSvg(n, o) {
  const W = 44;
  const H = 22;
  const STEP = 22;
  const per = 20;
  const parts = [];
  const full = Math.floor(n / per);
  for (let i = 0; i < full; i += 1) parts.push(W);
  const rem = n % per;
  if (rem > 0) parts.push(Math.max(15, (W * rem) / per));
  return parts.map((pw, i) => {
    const col = i % o.perRow;
    const row = Math.floor(i / o.perRow);
    const x = o.x + col * (W + 6);
    const y = o.y - (row + 1) * STEP;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${pw.toFixed(1)}" height="${H}" rx="7" fill="${o.fill}" stroke="${o.ink}" stroke-width="3"/>`;
  }).join('');
}

// The shed, cut open: his cart on the left (what ships today), the shelf on the
// right (what he kept), and the radio on the wall that started all of this.
function shedArt(today, kept) {
  return `<svg class="ew-art__svg" viewBox="0 0 320 120" role="img" aria-label="A storehouse: ${today} sacks on the cart to ship today, ${kept} sacks kept on the shelf">
  <rect x="6" y="4" width="308" height="112" rx="12" fill="var(--sim-bg-surface)" stroke="var(--sim-stroke)" stroke-width="3"/>
  <path d="M12 36 L160 10 L308 36 Z" fill="var(--sim-stroke)"/>
  <rect x="12" y="104" width="296" height="8" rx="4" fill="var(--sim-stroke)"/>
  <line x1="152" y1="44" x2="152" y2="104" stroke="var(--sim-stroke)" stroke-width="3" stroke-dasharray="6 8" stroke-linecap="round"/>
  <g>
    <rect x="20" y="78" width="112" height="10" rx="5" fill="var(--sim-stroke)"/>
    <circle cx="42" cy="96" r="8" fill="var(--sim-stroke)"/>
    <circle cx="110" cy="96" r="8" fill="var(--sim-stroke)"/>
    ${pileSvg(today, { x: 24, y: 78, perRow: 2, fill: 'var(--sim-gold)', ink: 'var(--sim-bg-deep)' })}
  </g>
  <g>
    <rect x="164" y="36" width="5" height="49" rx="2" fill="var(--sim-stroke)"/>
    <rect x="233" y="36" width="5" height="49" rx="2" fill="var(--sim-stroke)"/>
    <rect x="162" y="78" width="78" height="7" rx="3" fill="var(--sim-stroke)"/>
    ${pileSvg(kept, { x: 170, y: 78, perRow: 1, fill: 'var(--sim-track)', ink: 'var(--sim-label-muted)' })}
  </g>
  <g>
    <line x1="288" y1="48" x2="296" y2="36" stroke="var(--sim-series-1-ink)" stroke-width="3" stroke-linecap="round"/>
    <rect x="264" y="48" width="44" height="30" rx="7" fill="var(--sim-series-1)" stroke="var(--sim-series-1-ink)" stroke-width="3"/>
    <circle cx="277" cy="63" r="6" fill="var(--sim-series-1-ink)"/>
    <rect x="288" y="58" width="14" height="9" rx="4" fill="var(--sim-series-1-ink)"/>
  </g>
</svg>`;
}

// The weather strip over the roof: five days of one monsoon, one stop of the
// season per tap. Wet cells carry rain marks on water, dry ones a sun.
function skyStrip(stage) {
  // Wet days shrink as the season fails; the marks carry the state, the fill
  // only says "rain" (water) against "no rain" (a plain cell).
  const wetDays = stage === 0 ? 5 : (stage === 1 ? 2 : 0);
  const cell = (i) => {
    const x = i * 100;
    const wet = i < wetDays;
    const fill = stage === 0 ? 'var(--sim-water)' : 'var(--sim-track)';
    const rain = (drops) => `<path d="${drops.map((dx) => `M${x + dx} 8 l-5 9`).join(' ')}" stroke="var(--sim-bg-deep)" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    const mark = wet
      ? (stage === 0 ? rain([32, 50, 68]) : rain([44, 62]))
      : `<circle cx="${x + 50}" cy="16" r="8" fill="var(--sim-gold)"/>
    <path d="M${x + 50} 4 v-3 M${x + 50} 28 v3 M${x + 38} 16 h-3 M${x + 62} 16 h3" stroke="var(--sim-gold)" stroke-width="3.5" stroke-linecap="round"/>`;
    return `<g>
    <rect x="${x}" y="0" width="96" height="32" rx="8" fill="${fill}" stroke="var(--sim-stroke)" stroke-width="3"/>
    ${mark}
  </g>`;
  };
  return `<svg class="ew-sky__svg" viewBox="0 0 496 32" role="img" aria-label="Five days of the monsoon: ${MONSOON_CHIP[stage]}">${[0, 1, 2, 3, 4].map(cell).join('')}</svg>`;
}

// ------------------------------------------------------------------- markup

// One entry per real beat.
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
];

const CSS = `${SIM_LOOK_DOM_CSS}
.ew-top { justify-content: center; gap: var(--sim-space-2); }
.ew-stripbtn { display: flex; flex-direction: column; align-items: stretch; gap: var(--sim-space-1); width: 100%; padding: var(--sim-space-1); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); cursor: pointer; overflow: hidden; }
.ew-stripbtn:disabled { cursor: default; opacity: 0.8; }
.ew-stripbtn:focus-visible, .ew-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.ew-sky { display: block; width: 100%; }
.ew-sky__svg { display: block; width: 100%; height: auto; }
.ew-stripchip { justify-content: center; }
.ew-hero { align-items: stretch; }
.ew-card { gap: var(--sim-space-2); }
.ew-card .sim-title { font-size: var(--sim-text-md); }
.ew-radio, .ew-piles { justify-content: center; gap: var(--sim-space-2); }
.ew-art { display: flex; min-width: 0; }
.ew-art__svg { display: block; width: 100%; height: auto; }
.ew-meta { margin: 0; }
.ew-sup { justify-content: space-evenly; }
.ew-leverbar { gap: var(--sim-space-2); padding: var(--sim-space-2); }
.ew-lever { display: flex; flex-direction: column; gap: var(--sim-space-1); flex: 1 1 0; min-width: 0; }
.ew-track { display: flex; align-items: center; height: 16px; border-radius: var(--sim-radius-pill); background: var(--sim-track); }
.ew-knob { width: 30px; height: 26px; margin: -5px 0; border-radius: var(--sim-radius-sm); background: var(--sim-accent); border: 2px solid var(--sim-bg-deep); margin-inline-end: auto; transition: margin 280ms cubic-bezier(0.2, 0.8, 0.3, 1.15); }
.ew-lever--hold .ew-knob { margin-inline-start: auto; margin-inline-end: 0; }
.ew-stops { display: flex; justify-content: space-between; gap: var(--sim-space-2); }
.ew-stops span { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); white-space: nowrap; }
.ew-stops .ew-stop--on { color: var(--sim-label); }
.ew-leverrow { display: flex; align-items: center; gap: var(--sim-space-3); }
.ew-btn { flex: 0 0 auto; min-height: 42px; padding: 0 var(--sim-space-3); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); color: var(--sim-label); font-family: inherit; font-size: var(--sim-text-md); font-weight: 800; line-height: 1.2; cursor: pointer; }
.ew-btn[aria-pressed="true"] { border-color: var(--sim-accent); box-shadow: inset 0 0 0 2px var(--sim-accent); }
.ew-btn:disabled { opacity: 0.5; cursor: default; }
.ew-lock { opacity: 0.55; }
@keyframes ew-ring { 0%, 100% { box-shadow: 0 0 0 0 var(--sim-accent); } 50% { box-shadow: 0 0 0 5px var(--sim-accent); } }
.ew-leverbar.ew-live .ew-btn:not(:disabled), .ew-stripbtn.ew-live:not(:disabled) { animation: ew-ring 2.4s ease-in-out infinite; }
.ew-big { display: flex; align-items: baseline; justify-content: center; gap: var(--sim-space-2); }
.ew-big__n { font-size: calc(var(--sim-text-2xl) * 1.5); font-weight: 800; line-height: 1.05; font-variant-numeric: tabular-nums; }
.ew-big__n--pop { animation: ew-pop 260ms ease-out; }
.ew-big__u { font-size: var(--sim-text-md); font-weight: 700; color: var(--sim-label-muted); white-space: nowrap; }
@keyframes ew-pop { 0% { transform: scale(1.18); } 100% { transform: scale(1); } }
.ew-rail { display: grid; height: 16px; border-radius: var(--sim-radius-pill); background: var(--sim-track); overflow: hidden; }
.ew-rail__fill { grid-area: 1 / 1; }
.ew-rail__fill { display: block; width: calc(var(--k, 1) * 100%); height: 100%; border-radius: var(--sim-radius-pill); background: var(--sim-series-1); transition: width 320ms cubic-bezier(0.2, 0.8, 0.3, 1.05); }
.ew-vs, .ew-foot, .ew-forces { justify-content: center; gap: var(--sim-space-2); }
.ew-vs .sim-tag, .ew-foot .sim-tag, .ew-forces .sim-tag { white-space: normal; }
.ew-mover { justify-content: center; }
.sim-dom-root--portrait .ew-big__n { font-size: calc(var(--sim-text-2xl) * 1.3); }
.sim-dom-root--portrait .ew-leverrow { flex-direction: column; align-items: stretch; }
.sim-dom-root--portrait .ew-btn { width: 100%; }
`;

export class ExpectationsWeatherScene extends DomSimulation {
  static WIDTH = 680;
  // sim-layout's own numbers: landscape rests at 540 px on beats 0-1 and 568 on
  // beat 2 (the extra force chips), portrait 886 / 950; the interaction states
  // reach the same heights, so nothing grows under the learner's hands.
  static HEIGHT = 570;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 955;
  // Content-sized frames: beat 2 adds the three no-signal force chips, and no
  // tap changes the height after that.
  static FIT = true;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'A wholesaler\u2019s shed: the sacks on his cart move with the hold-back lever and with the monsoon, while the price banner stays put.';
  // The lever and the strip are the content of their own beats, so they are
  // in-panel buttons (a phone taps the thing itself), not host controls.
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._hold = false;      // the lever: true = keep the stock for later
    this._strip = 0;         // the monsoon strip stop, 0-2
    this._prev = null;       // sacks last shown, for the move chip
    this._move = '';
    this._found = false;
  }

  async setup() {
    await super.setup();
    this.render({
      css: CSS,
      rootClass: 'ew-root sl-backdrop',
      html: `<div class="sim-row ew-top">
  <span class="sim-tag sim-tag--accent">potatoes ${PRICE}</span>
  <span class="sim-tag">not moved</span>
  <span class="sim-tag" data-signal></span>
  <span class="sim-tag" data-stripchip></span>
</div>
<button type="button" class="ew-stripbtn" data-strip aria-label="Weather strip: tap to step the monsoon">
  <span class="ew-sky" data-sky></span>
</button>
<div class="sim-grid-2 ew-hero">
  <article class="sim-card ew-card" data-shed aria-label="The wholesaler\u2019s shed">
    <div class="sim-row ew-radio" data-radio></div>
    <div class="ew-art" data-art></div>
    <div class="sim-row ew-piles" data-piles></div>
  </article>
  <article class="sim-card ew-card ew-sup" data-sup aria-label="Today\u2019s supply">
    <h2 class="sim-title">Today\u2019s supply</h2>
    <div class="ew-big" aria-live="polite">
      <span class="ew-big__n" data-big>${STORE}</span>
      <span class="ew-big__u">sacks today</span>
    </div>
    <div class="ew-rail"><span class="ew-rail__fill" data-fill></span></div>
    <p class="sim-meta ew-meta">${STORE} sacks = his whole store</p>
    <div class="ew-mover" data-mover></div>
    <div class="sim-row ew-vs" data-vs></div>
  </article>
</div>
<div class="sim-card ew-leverbar" data-leverbox>
  <div class="ew-leverrow">
    <div class="ew-lever">
      <div class="ew-track" aria-hidden="true"><span class="ew-knob" data-knob></span></div>
      <div class="ew-stops"><span data-stop-sell>sell all today</span><span data-stop-hold>hold back</span></div>
    </div>
    <button type="button" class="ew-btn" data-lever></button>
  </div>
</div>
<div class="sim-row ew-forces" data-forces></div>
<div class="sim-row ew-foot" data-foot></div>
<div>${noteLineHtml(NOTE_ROWS)}</div>`,
    });
    this._cache();
    this._bind();
    this.onStep();
  }

  destroy() {
    this._els = null;
    super.destroy();
  }

  _cache() {
    const q = (sel) => this.root?.querySelector?.(sel);
    this._els = {
      signal: q('[data-signal]'),
      stripBtn: q('[data-strip]'),
      sky: q('[data-sky]'),
      stripChip: q('[data-stripchip]'),
      radio: q('[data-radio]'),
      art: q('[data-art]'),
      piles: q('[data-piles]'),
      leverBox: q('[data-leverbox]'),
      lever: q('[data-lever]'),
      stopSell: q('[data-stop-sell]'),
      stopHold: q('[data-stop-hold]'),
      sup: q('[data-sup]'),
      big: q('[data-big]'),
      fill: q('[data-fill]'),
      mover: q('[data-mover]'),
      vs: q('[data-vs]'),
      forces: q('[data-forces]'),
      foot: q('[data-foot]'),
    };
  }

  _bind() {
    this.root?.addEventListener?.('click', (e) => {
      const lever = e.target?.closest?.('[data-lever]');
      if (lever && !lever.disabled) {
        this._hold = !this._hold;
        this._tapped();
        return;
      }
      const strip = e.target?.closest?.('[data-strip]');
      if (strip && !strip.disabled && this._strip < MONSOON.length - 1) {
        this._strip += 1;
        this._tapped();
      }
    });
  }

  // Every mount may open cold on any beat, so each beat starts from the
  // wholesaler's whole store, and the found flag is per beat.
  onStep() {
    this._hold = BEAT_SPEC[this.stepIndex ?? 0].startHold;
    this._strip = 0;
    this._prev = this._today();
    this._move = '';
    this._found = false;
    this._paint();
    this.requestUiUpdate?.();
  }

  // Sacks shipping today, from the beat and the state of its one control.
  _today() {
    const spec = BEAT_SPEC[this.stepIndex ?? 0];
    if (spec.strip) return MONSOON[this._strip];
    return this._hold ? HELD_SHIP : STORE;
  }

  // One place that notices a tap, so the move chip, the found chip and the
  // confetti can never disagree about what the learner's tap just did.
  _tapped() {
    const n = this._today();
    const d = n - this._prev;
    this._move = d === 0 ? '' : `${d < 0 ? '\u2193' : '\u2191'} ${Math.abs(d)} sacks`;
    this._prev = n;
    const found = !this._found && this._beatFound(n);
    this._found = this._found || found;
    this._paint(found);
    if (found) burst(this._els?.sup, 24);
  }

  _beatFound(n) {
    const beat = this.stepIndex ?? 0;
    const spec = BEAT_SPEC[beat];
    if (spec.strip) return this._strip === MONSOON.length - 1 && n === MONSOON[2];
    return this._hold === (beat === 0);
  }

  _paint(found = false) {
    const els = this._els;
    if (!els) return;
    const beat = this.stepIndex ?? 0;
    const spec = BEAT_SPEC[beat];
    const today = this._today();
    const kept = STORE - today;

    if (els.signal) els.signal.textContent = spec.signal;
    if (els.radio) els.radio.innerHTML = simTag(spec.radio, { accent: true });
    if (els.sky) els.sky.innerHTML = skyStrip(spec.strip ? this._strip : 0);
    if (els.stripChip) {
      els.stripChip.innerHTML = simTag(MONSOON_CHIP[spec.strip ? this._strip : 0], { accent: spec.strip && this._found });
    }
    if (els.stripBtn) {
      els.stripBtn.disabled = !spec.strip || this._strip >= MONSOON.length - 1;
      els.stripBtn.classList.toggle('ew-live', !this._found && spec.strip && this._strip < MONSOON.length - 1);
      els.stripBtn.setAttribute('aria-label', `Weather strip: tap to step the monsoon. Now: ${MONSOON_CHIP[spec.strip ? this._strip : 0]}`);
    }
    if (els.art) els.art.innerHTML = shedArt(today, kept);
    if (els.piles) {
      els.piles.innerHTML = simTag(`${today} on the cart`, { accent: true }) + simTag(`${kept} in store`);
    }
    if (els.leverBox) {
      els.leverBox.classList.toggle('ew-lever--hold', this._hold);
      els.leverBox.classList.toggle('ew-lock', !spec.lever);
      els.leverBox.classList.toggle('ew-live', !this._found && spec.lever);
    }
    // The button names the ACTION it takes, so it is never a toggle the
    // learner has to decode; the state chip and the knob say where he is.
    if (els.lever) {
      els.lever.textContent = this._hold ? 'sell it all today' : 'hold it back for later';
      els.lever.setAttribute('aria-label', `Hold-back lever: ${spec.lever ? (this._hold ? HOLDING : SELLING) : LOCKED}`);
      els.lever.disabled = !spec.lever;
    }
    if (els.stopSell) els.stopSell.classList.toggle('ew-stop--on', spec.lever && !this._hold);
    if (els.stopHold) els.stopHold.classList.toggle('ew-stop--on', spec.lever && this._hold);
    if (els.big) {
      els.big.textContent = today;
      if (found) {
        els.big.classList.remove('ew-big__n--pop');
        void els.big.offsetWidth;
        els.big.classList.add('ew-big__n--pop');
      }
    }
    if (els.fill) els.fill.style.setProperty('--k', (today / STORE).toFixed(3));
    if (els.mover) els.mover.innerHTML = simField('moved by', spec.mover);
    if (els.vs) {
      els.vs.innerHTML = (this._move ? simTag(this._move) : '') + simTag(`${PRICE} unchanged`, { accent: true });
    }
    if (els.forces) {
      els.forces.innerHTML = spec.strip
        ? FORCES.map((f) => simTag(f.name, { accent: f.live && this._found })).join('') + simTag(FORCE_RESULT, { accent: this._found })
        : '';
    }
    if (els.foot) {
      els.foot.innerHTML = simTag(spec.rule, { accent: this._found }) + simTag(this._found ? spec.found : spec.hint);
    }
    this.refit?.();
  }

  // Nothing waits: the only motion is the meter ease and the readout pop.
  busy() {
    return false;
  }
}