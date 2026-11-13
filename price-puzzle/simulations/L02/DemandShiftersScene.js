import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc, simTag } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';

/**
 * DemandShiftersScene - blk-l02-s05, beats 0-2 (Pocket, Taste, Headcount).
 *
 * Three buyer-side panels in one row. Each panel is a card with a piece of
 * art, a state chip, the good's own price chip (which never changes), one or
 * more demand arrows and its own -/+ stepper. Nothing runs: the scene is at
 * rest until the learner taps a panel, and rests with the three arrows they
 * set (stub's "Rests with all three arrows set by the learner").
 *
 * The one rule the slide teaches - demand moves while the good's own price
 * stands still - is the banner across the top; the arrows are the labels,
 * the prose is in the slide's markdown.
 *
 * DOM, not canvas: three labelled panels of chips and arrows that change on
 * a tap, no frame-by-frame motion. Arrow length is a CSS width transition on
 * one element, so a stepper press reads as a swing and the panel comes to
 * rest by itself.
 */

// The good's own price, the one number that never moves in this scene: the
// Fig 9.3 point A price, held still on every beat.
const PRICE_TAG = 'mangoes \u20b9150/kg';
const T_POCKET = 'var(--sim-series-2)';
const T_TASTE = 'var(--sim-series-5)';
const T_ORANGE = 'var(--sim-flame)';
const T_COLONY = 'var(--sim-series-7)';

const NOTE_ROWS = [
  { text: 'Three forces, one rule: demand moves while the good\u2019s own price stands still' },
  { text: 'Added families buy like the chapter\u2019s average buyer (2 / 4 / 6 kg at \u20b9150 / \u20b9100 / \u20b950)' },
];

// --------------------------------------------------------------------- art

function artPocket(step) {
  const coins = step + 1;
  let stack = '';
  for (let i = 0; i < coins; i += 1) {
    const y = 60 - i * 12;
    stack += `<ellipse cx="152" cy="${y}" rx="17" ry="7" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2.5"/>`;
  }
  return `<svg class="ds-art__svg" viewBox="0 0 200 76" role="img" aria-label="A wallet with ${coins} coins">
  <rect x="14" y="20" width="106" height="46" rx="13" fill="${T_POCKET}" stroke="var(--sim-series-2-ink)" stroke-width="3"/>
  <rect x="14" y="20" width="106" height="13" rx="6" fill="var(--sim-series-2-ink)"/>
  <circle cx="102" cy="45" r="8" fill="var(--sim-bg-deep)"/>
  ${stack}
</svg>`;
}

// Srivalli at her own stall on the right; the rival's stand on the left grows
// plumper as its oranges get cheaper, so the stand-in's demand is visible
// without a word of prose.
function artTaste(step) {
  const size = 5 + step * 1.7;
  return `<svg class="ds-art__svg" viewBox="0 0 200 76" role="img" aria-label="Srivalli at her mango stall, with a stand of oranges beside it">
  <rect x="4" y="52" width="66" height="20" rx="6" fill="var(--sim-track)"/>
  <rect x="8" y="36" width="58" height="9" rx="4.5" fill="var(--sim-label-muted)"/>
  <circle cx="22" cy="48" r="${size}" fill="${T_ORANGE}" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <circle cx="44" cy="48" r="${size}" fill="${T_ORANGE}" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <rect x="110" y="52" width="86" height="20" rx="6" fill="var(--sim-series-5-ink)"/>
  <rect x="106" y="36" width="94" height="9" rx="4.5" fill="${T_TASTE}"/>
  <ellipse cx="140" cy="47" rx="13" ry="8" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2"/>
  <rect x="84" y="40" width="28" height="32" rx="12" fill="${T_TASTE}" stroke="var(--sim-series-5-ink)" stroke-width="3"/>
  <circle cx="98" cy="26" r="14" fill="var(--sim-gold)" stroke="var(--sim-bg-deep)" stroke-width="2.5"/>
  <circle cx="93" cy="25" r="1.9" fill="var(--sim-bg-deep)"/>
  <circle cx="103" cy="25" r="1.9" fill="var(--sim-bg-deep)"/>
  <path d="M93 32 q5 4.5 10 0" fill="none" stroke="var(--sim-bg-deep)" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M110 50 q12 7 22 1" fill="none" stroke="var(--sim-gold)" stroke-width="5" stroke-linecap="round"/>
</svg>`;
}

function house(x, y) {
  return `<g transform="translate(${x} ${y})">
  <rect x="4" y="11" width="30" height="25" rx="4" fill="${T_COLONY}" stroke="var(--sim-series-7-ink)" stroke-width="3"/>
  <path d="M0 13 L19 1 L38 13 Z" fill="var(--sim-series-7-ink)"/>
  <rect x="15" y="25" width="9" height="11" rx="2" fill="var(--sim-series-7-ink)"/>
</g>`;
}

function artColony(step) {
  const n = [3, 4, 6][step];
  const per = 4;
  let out = '';
  for (let i = 0; i < n; i += 1) {
    const row = Math.floor(i / per);
    const col = i % per;
    out += house(6 + col * 44, 42 - row * 30);
  }
  return `<svg class="ds-art__svg" viewBox="0 0 200 76" role="img" aria-label="${n} houses in the colony">${out}</svg>`;
}

// ------------------------------------------------------------------ panels

function rowShell(r, i) {
  return `<div class="ds-row">
  <span class="ds-row__label">${esc(r.label)}</span>
  <span class="ds-track"><span class="ds-rail"><span class="ds-fill" data-fill="${i}" style="background:${r.fill}"></span></span><span class="ds-head" style="background:${r.fill}"></span></span>
  <span class="ds-row__v" data-v="${i}"></span>
</div>`;
}

class Panel {
  constructor(spec) { Object.assign(this, spec); }

  shell() {
    return `<article class="sim-card ds-panel" data-panel="${this.id}" role="group" aria-label="${esc(this.title)}: ${esc(this.force)}">
  <div class="sim-row ds-head">
    <h2 class="sim-title">${esc(this.title)}</h2>
  </div>
  <div class="ds-art" data-art></div>
  <div class="sim-row ds-chips" data-chips></div>
  <div class="ds-rows" data-rows aria-live="polite">${this.rows.map(rowShell).join('')}</div>
  <div class="ds-btns" role="group" aria-label="${esc(this.title)}: change it">
    <button type="button" class="ds-step" data-d="-1" aria-label="${esc(this.down)}">\u2212</button>
    <button type="button" class="ds-step" data-d="1" aria-label="${esc(this.up)}">+</button>
  </div>
  <p class="ds-msg" data-msg></p>
</article>`;
  }
}

const PANELS = [
  new Panel({
    id: 'pocket',
    title: 'Pocket',
    force: 'income',
    down: 'cut Aparna\u2019s pay',
    up: 'raise Aparna\u2019s pay',
    rows: [{ label: 'mangoes', max: 3, fill: T_POCKET }],
    found: 'same \u20b9150, 3 kg',
    view(step) {
      const kg = [1, 2, 3][step];
      return {
        state: ['pay tight', 'pay as now', 'pay raised'][step],
        chips: [PRICE_TAG],
        art: artPocket(step),
        vals: [{ kg, v: `${kg} kg` }],
      };
    },
  }),
  new Panel({
    id: 'taste',
    title: 'Taste',
    force: 'taste',
    down: 'oranges dearer',
    up: 'oranges cheaper',
    // One scale for both rows: two arrows a learner compares must be on the same
    // rail, or a 1.2 kg mango bar looks bigger than a 5 kg orange bar.
    rows: [{ label: 'mangoes', max: 5, fill: T_TASTE }, { label: 'oranges', max: 5, fill: T_ORANGE }],
    found: 'mangoes held',
    view(step) {
      const rival = [150, 120, 90][step];
      return {
        // The dial is the rival's own price, so the state chip IS that price.
        state: `oranges \u20b9${rival}/kg`,
        chips: [PRICE_TAG],
        art: artTaste(step),
        vals: [
          { kg: [1, 1, 1.2][step], v: ['1 kg', '1 kg', '1.2 kg'][step] },
          { kg: [2, 3, 5][step], v: `${[2, 3, 5][step]} kg` },
        ],
      };
    },
  }),
  new Panel({
    id: 'colony',
    title: 'Headcount',
    force: 'buyers',
    down: 'one family fewer',
    up: 'one family more',
    rows: [
      { label: '\u20b9150', max: 36, fill: T_COLONY },
      { label: '\u20b9100', max: 36, fill: T_COLONY },
      { label: '\u20b950', max: 36, fill: T_COLONY },
    ],
    found: 'every price up',
    view(step) {
      const fam = [3, 4, 6][step];
      // Chapter numbers: 3 buyers buy 6 / 12 / 18 kg (Table 9.1); each family
      // added buys like the average buyer, 2 / 4 / 6 kg.
      const kg = [[6, 12, 18], [8, 16, 24], [12, 24, 36]][step];
      return {
        state: `${fam} ${fam === 1 ? 'family' : 'families'}`,
        chips: ['same three prices'],
        art: artColony(step),
        vals: kg.map((k) => ({ kg: k, v: `${k} kg` })),
      };
    },
  }),
];

const CSS = `${SIM_LOOK_DOM_CSS}
.ds-top { justify-content: center; }
.ds-panels { align-items: stretch; }
.ds-panel { gap: var(--sim-space-2); }
.ds-panel .sim-title { font-size: var(--sim-text-md); }
.ds-head { gap: var(--sim-space-2); }
.ds-art { min-width: 0; flex: 1 1 auto; min-height: 64px; display: flex; }
.ds-art__svg { display: block; width: 100%; height: 100%; min-height: 64px; }
.ds-chips { gap: var(--sim-space-1); }
.ds-rows { display: flex; flex-direction: column; gap: var(--sim-space-2); }
.ds-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--sim-space-2); }
.ds-row__label { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); white-space: nowrap; }
.ds-track { display: flex; align-items: center; min-width: 0; }
.ds-rail { flex: 1; min-width: 0; height: 14px; border-radius: var(--sim-radius-pill); background: var(--sim-track); overflow: hidden; }
.ds-fill { display: block; height: 100%; width: calc(var(--k, 0.34) * 100%); border-radius: var(--sim-radius-pill); transition: width 300ms cubic-bezier(0.2, 0.8, 0.3, 1.15); }
.ds-head { flex: 0 0 12px; height: 18px; margin-left: 2px; clip-path: polygon(100% 50%, 0 0, 0 100%); }
.ds-row__v { font-size: var(--sim-text-md); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ds-btns { display: flex; gap: var(--sim-space-2); justify-content: center; }
.ds-step { min-width: 56px; min-height: 42px; padding: 0 var(--sim-space-3); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); color: var(--sim-label); font-family: inherit; font-size: var(--sim-text-xl); font-weight: 800; line-height: 1; cursor: pointer; }
.ds-step:hover:enabled { border-color: var(--sim-accent); }
.ds-step:disabled { opacity: 0.45; cursor: default; }
.ds-msg { margin: 0; min-height: 56px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--sim-space-1); text-align: center; }
.ds-msg .sim-tag { max-width: 100%; white-space: normal; }
.ds-panel--on .ds-step { animation: ds-hint 2.6s ease-in-out infinite; }
.ds-panel--found .ds-step { animation: none; }
@keyframes ds-hint { 0%, 100% { box-shadow: 0 0 0 0 var(--sim-accent); } 50% { box-shadow: 0 0 0 4px var(--sim-accent); } }
.sim-dom-root--portrait .ds-panel:not(.ds-panel--on) .ds-art,
.sim-dom-root--portrait .ds-panel:not(.ds-panel--on) .ds-rows,
.sim-dom-root--portrait .ds-panel:not(.ds-panel--on) .ds-msg { display: none; }
/* A phone-wide panel fits one chip line, so the foot only needs one line there. */
.sim-dom-root--portrait .ds-msg { min-height: 30px; }
.sim-dom-root--portrait .ds-art,
.sim-dom-root--portrait .ds-art__svg { min-height: 56px; }
`;

// One entry per real beat; panel i is the one the beat is about.
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
];

export class DemandShiftersScene extends DomSimulation {
  static WIDTH = 680;
  // sim-layout's numbers, after the panel internals were trimmed to a fixed
  // height: landscape rests at 521 px on every beat (interaction states reach
  // the same), portrait 825 / 851 / 877.
  static HEIGHT = 530;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 885;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'Three buyer-side panels - a wallet, a taste held against a cheaper stand-in, and a growing colony - each with its own demand arrow, all while the good\u2019s own price stays put.';
  // The three steppers ARE the panel's own content (stub: "the learner taps each
  // panel"), so they are in-panel buttons, not host controls.
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._step = [1, 1, 1];
    this._prev = [null, null, null];
    this._found = [false, false, false];
    this._panels = [];
  }

  async setup() {
    await super.setup();
    this.render({
      css: CSS,
      rootClass: 'ds-root sl-backdrop',
      html: `<div class="sim-row ds-top">${simTag('the good\u2019s own price is not moving', { accent: true })}${simTag('demand moves')}</div>
<div class="sim-grid-3 ds-panels">${PANELS.map((p) => p.shell()).join('')}</div>
<div>${noteLineHtml(NOTE_ROWS)}</div>`,
    });
    this._cache();
    this._bind();
    this.onStep();
  }

  destroy() {
    this._panels = [];
    super.destroy();
  }

  _cache() {
    this._panels = PANELS.map((p) => {
      const el = this.root?.querySelector?.(`[data-panel="${p.id}"]`);
      return {
        spec: p,
        el,
        art: el?.querySelector?.('[data-art]'),
        chips: el?.querySelector?.('[data-chips]'),
        rows: Array.from(el?.querySelectorAll?.('[data-rows] .ds-row') ?? []).map((row) => ({
          fill: row.querySelector('[data-fill]'),
          v: row.querySelector('[data-v]'),
        })),
        btns: Array.from(el?.querySelectorAll?.('[data-d]') ?? []),
        msg: el?.querySelector?.('[data-msg]'),
        artStep: -1,
      };
    });
  }

  _bind() {
    this.root?.addEventListener?.('click', (e) => {
      const btn = e.target?.closest?.('[data-d]');
      if (!btn || btn.disabled) return;
      const i = PANELS.findIndex((p) => p.id === btn.closest('[data-panel]')?.dataset?.panel);
      if (i >= 0) this._bump(i, Number(btn.dataset.d));
    });
  }

  // Each beat is its own question on its own panel, so a step change (and
  // every mount, which may open cold on any beat) starts from the middle stop.
  onStep() {
    this._step = [1, 1, 1];
    this._prev = [null, null, null];
    this._found = [false, false, false];
    this._paint();
    this.requestUiUpdate?.();
  }

  _bump(i, d) {
    const next = this._step[i] + d;
    if (next < 0 || next > 2) return;
    this._prev[i] = this._step[i];
    this._step[i] = next;
    // The concept, not the press: the top stop of every panel is the state the
    // beat is about (pay raised, oranges at their cheapest, six families).
    const found = !this._found[i] && next === 2;
    this._found[i] = this._found[i] || found;
    this._paint();
    if (found) burst(this._panels[i]?.el, 22);
  }

  _paint() {
    const beat = this.stepIndex ?? 0;
    PANELS.forEach((spec, i) => {
      const ref = this._panels[i];
      if (!ref?.el) return;
      const v = spec.view(this._step[i]);
      const on = i === beat;
      ref.el.classList.toggle('ds-panel--on', on);
      ref.el.classList.toggle('ds-panel--found', this._found[i]);
      ref.el.classList.toggle('sim-card--accent', on);
      ref.el.classList.toggle('sim-card--muted', !on);
      if (ref.art && ref.artStep !== this._step[i]) {
        ref.art.innerHTML = v.art;
        ref.artStep = this._step[i];
      }
      if (ref.chips) {
        ref.chips.innerHTML = simTag(spec.force) + v.chips.map((c) => simTag(c)).join('');
      }
      spec.rows.forEach((row, j) => {
        const ref2 = ref.rows[j];
        const val = v.vals[j];
        if (!ref2 || !val) return;
        const k = Math.max(0.03, Math.min(1, val.kg / row.max));
        ref2.fill?.style?.setProperty('--k', k.toFixed(3));
        if (ref2.v) ref2.v.textContent = val.v;
      });
      ref.btns.forEach((b) => {
        const next = this._step[i] + Number(b.dataset.d);
        b.disabled = next < 0 || next > 2;
      });
      if (ref.msg) {
        ref.msg.innerHTML = on ? this._foot(i, v, this._found[i]) : '';
      }
    });
    this.refit?.();
  }

  // One line under the arrows: the dial's own state, then the move the learner
  // just made - or the beat's point once they have found it.
  _foot(i, v, found) {
    const tag = (text, accent) => `<span class="sim-tag${accent ? ' sim-tag--accent' : ''}">${esc(text)}</span>`;
    return tag(v.state, true) + (found ? tag(PANELS[i].found, true) : tag(this._move(i, v) || 'tap \u2212 or +', false));
  }

  _move(i, v) {
    const prev = this._prev[i];
    if (prev === null || prev === this._step[i]) return '';
    const before = PANELS[i].view(prev).vals;
    const moved = v.vals.map((val, j) => !!(before[j] && before[j].v !== val.v));
    // Every row moved together (the colony's three prices): one compact line
    // beats three little ones in a foot that is two chips tall.
    if (moved.every(Boolean)) return `${before.map((b) => b.kg).join('/')} \u2192 ${v.vals.map((x) => x.kg).join('/')} kg`;
    return v.vals.map((val, j) => (moved[j] ? `${before[j].v} \u2192 ${val.v}` : '')).filter(Boolean).join(', ');
  }

  // Nothing to wait for: the only motion is the arrow's own CSS transition.
  busy() {
    return false;
  }
}