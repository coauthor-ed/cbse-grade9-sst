import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';

/**
 * FarmerChoiceScene-intro - blk-l04-s01, beats 0-2 (the hook).
 *
 * The signpost at planting season: a cleared field, a wooden post with two
 * planks ("wheat" left, "chickpeas" right) and last season's price hanging on
 * each. The learner walks one year (Apr / Jul / Oct / Jan) and the tags walk
 * with the playhead - wheat barely moves, chickpeas climb. Nothing is decided
 * here: beat 2 asks the market's question and stops, because the choice itself
 * is blk-l04-s02's Predict.
 *
 * DOM, not canvas: a labelled signpost of planks, tags and chips that change
 * on a tap, no frame-by-frame motion. Every label is a DOM chip; the field,
 * the two crop plants and the farmer are inline SVG with no text in them, so
 * nothing shrinks under the 14px floor when the frame scales for portrait.
 */

const MONTHS = ['Apr', 'Jul', 'Oct', 'Jan'];

// Last season's price per month, rupees per kg. Wheat low and steady,
// chickpeas high and climbing: the whole claim of this slide, in eight numbers.
const CROPS = [
  { id: 'wheat', name: 'Wheat', side: 'left', prices: [28, 27, 28, 28], trend: 'steady' },
  { id: 'chickpeas', name: 'Chickpeas', side: 'right', prices: [62, 71, 83, 95], trend: 'climbing' },
];

const NOTE_ROWS = [
  { text: 'Both crops grow here - the choice is about price, not soil' },
  { text: "Four months of one year, at last season's prices; costs and yields not modelled" },
];

// --------------------------------------------------------------------- art

function wheatPlant() {
  // Three fanning stems, each with its own ear: one plant, three ripe heads.
  const stems = [[-17, 96], [-3, 108], [11, 90]];
  let out = '';
  stems.forEach(([tilt, h], i) => {
    let grains = '';
    for (let g = 0; g < 7; g += 1) {
      const y = 120 - h + 8 + g * 5;
      const w = 10.5 - g * 0.8;
      grains += `<ellipse cx="40" cy="${y}" rx="${w}" ry="3.6" fill="var(--sim-series-2)" stroke="var(--sim-series-2-ink)" stroke-width="1.3" transform="rotate(-24 40 ${y})"/>`;
      grains += `<ellipse cx="50" cy="${y}" rx="${w}" ry="3.6" fill="var(--sim-series-2)" stroke="var(--sim-series-2-ink)" stroke-width="1.3" transform="rotate(24 50 ${y})"/>`;
    }
    out += `<g transform="rotate(${tilt} 45 120)">
      <path d="M45 120 C42 ${120 - h / 2} 48 ${120 - h / 2} 45 ${120 - h}" fill="none" stroke="var(--sim-series-2-ink)" stroke-width="4" stroke-linecap="round"/>
      <path d="M45 ${Math.round(120 - h * 0.58)} C36 ${Math.round(120 - h * 0.64)} 30 ${Math.round(120 - h * 0.7)} 23 ${Math.round(120 - h * 0.76)}" fill="none" stroke="var(--sim-series-2)" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="45" cy="${118 - h}" rx="4.5" ry="7" fill="var(--sim-series-2)" stroke="var(--sim-series-2-ink)" stroke-width="1.3"/>
      ${grains}
    </g>`;
  });
  return `<svg class="fcsi-svg" viewBox="0 0 90 120" role="img" aria-label="A ripe wheat plant, three heads ready to cut">
  ${out}
</svg>`;
}

function chickpeaPlant() {
  const leaflets = [[34, 97, -28], [28, 91, -24], [22, 83, -20], [56, 83, 28], [62, 77, 24], [68, 69, 20], [36, 66, -26], [31, 60, -22]];
  const pods = [[22, 90, -22], [68, 76, 20], [39, 54, -8]];
  return `<svg class="fcsi-svg" viewBox="0 0 90 120" role="img" aria-label="A chickpea plant, pods swelling on it">
  <path d="M45 120 L45 40" fill="none" stroke="var(--sim-series-3-ink)" stroke-width="5" stroke-linecap="round"/>
  <path d="M45 102 C35 98 27 92 21 82" fill="none" stroke="var(--sim-series-3-ink)" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M45 88 C55 84 63 78 69 68" fill="none" stroke="var(--sim-series-3-ink)" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M45 72 C37 68 31 62 27 52" fill="none" stroke="var(--sim-series-3-ink)" stroke-width="3.4" stroke-linecap="round"/>
  ${leaflets.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.4" fill="var(--sim-series-3)" stroke="var(--sim-series-3-ink)" stroke-width="1.3" transform="rotate(${r} ${x} ${y})"/>`).join('')}
  <ellipse cx="45" cy="32" rx="7" ry="10" fill="var(--sim-series-3)" stroke="var(--sim-series-3-ink)" stroke-width="1.5"/>
  ${pods.map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 8}" y="${y - 4}" width="16" height="8" rx="4" fill="var(--sim-series-3)" stroke="var(--sim-series-3-ink)" stroke-width="1.5"/><circle cx="${x - 2.5}" cy="${y}" r="2.2" fill="var(--sim-series-3-ink)"/><circle cx="${x + 2.5}" cy="${y}" r="2.2" fill="var(--sim-series-3-ink)"/></g>`).join('')}
</svg>`;
}

// The farmer reads the sign: he stands just right of the post with one hand out
// to it, boots on the soil line, face on. Mirrored with scaleX(-1) so he faces
// the sign he is standing at. A glyph, not a portrait.
function farmer() {
  return `<svg class="fcsi-svg fcsi-svg--flip" viewBox="0 0 78 120" role="img" aria-label="A farmer standing beside the signpost, reading it">
  <rect x="18" y="98" width="18" height="18" rx="5" fill="var(--sim-bg-deep)" stroke="var(--sim-stroke)" stroke-width="2"/>
  <rect x="38" y="98" width="18" height="18" rx="5" fill="var(--sim-bg-deep)" stroke="var(--sim-stroke)" stroke-width="2"/>
  <path d="M27 56 L26 100" fill="none" stroke="var(--sim-label-muted)" stroke-width="11" stroke-linecap="round"/>
  <path d="M47 56 L48 100" fill="none" stroke="var(--sim-label-muted)" stroke-width="11" stroke-linecap="round"/>
  <rect x="19" y="52" width="36" height="42" rx="12" fill="var(--sim-series-1)" stroke="var(--sim-series-1-ink)" stroke-width="2.5"/>
  <path d="M20 60 L8 82" fill="none" stroke="var(--sim-series-1)" stroke-width="9" stroke-linecap="round"/>
  <circle cx="7" cy="86" r="5.5" fill="var(--sim-flame)"/>
  <path d="M54 58 L70 48" fill="none" stroke="var(--sim-series-1)" stroke-width="9" stroke-linecap="round"/>
  <circle cx="73" cy="46" r="5.5" fill="var(--sim-flame)"/>
  <rect x="30" y="44" width="14" height="12" rx="5" fill="var(--sim-flame)"/>
  <circle cx="37" cy="28" r="13" fill="var(--sim-flame)" stroke="var(--sim-series-1-ink)" stroke-width="2"/>
  <path d="M24 24 C26 12 48 12 50 24 C44 18 30 18 24 24 Z" fill="var(--sim-series-1-ink)"/>
  <circle cx="32" cy="29" r="1.9" fill="var(--sim-bg-deep)"/>
  <circle cx="43" cy="29" r="1.9" fill="var(--sim-bg-deep)"/>
  <path d="M32 35 q5 4 10 0" fill="none" stroke="var(--sim-bg-deep)" stroke-width="2" stroke-linecap="round"/>
</svg>`;
}

// ------------------------------------------------------------------ markup

function plank(crop) {
  const left = crop.side === 'left';
  return `<div class="fcsi-arm" data-crop="${crop.id}" data-side="${crop.side}">
  <div class="fcsi-plank${left ? ' fcsi-plank--left' : ' fcsi-plank--right'}"><span class="fcsi-plank__name">${esc(crop.name)}</span></div>
  <div class="fcsi-tag sim-card" data-tag="${crop.id}"></div>
</div>`;
}

const CSS = `${SIM_LOOK_DOM_CSS}
.fcsi-root { display: flex; flex-direction: column; gap: var(--sim-space-3); }
.fcsi-sign { display: flex; flex-direction: column; gap: var(--sim-space-2); align-items: center; }
.fcsi-top { padding: var(--sim-space-1) var(--sim-space-3); background: color-mix(in srgb, var(--sim-series-8) 26%, var(--sim-bg-surface)); border: 3px solid var(--sim-series-8-ink); color: var(--sim-label); font-size: var(--sim-text-md); font-weight: 700; text-align: center; }
.fcsi-top--q { background: color-mix(in srgb, var(--sim-accent) 22%, var(--sim-bg-surface)); border-color: var(--sim-accent); display: flex; align-items: center; justify-content: center; gap: var(--sim-space-2); }
.fcsi-row { display: grid; grid-template-columns: auto minmax(0, 1fr) 20px auto minmax(0, 1fr) auto; align-items: end; gap: var(--sim-space-2); width: 100%; }
.fcsi-post { align-self: stretch; background: color-mix(in srgb, var(--sim-series-8) 46%, var(--sim-bg-surface)); box-shadow: inset -4px 0 0 var(--sim-series-8-ink); border-radius: var(--sim-radius-sm) var(--sim-radius-sm) 0 0; }
.fcsi-plant { width: 84px; }
.fcsi-svg { display: block; width: 100%; height: auto; }
.fcsi-svg--flip { transform: scaleX(-1); }
.fcsi-arm { display: flex; flex-direction: column; align-items: center; gap: var(--sim-space-2); padding-bottom: 12px; }
.fcsi-plank { display: flex; align-items: center; min-height: 44px; padding: var(--sim-space-1) var(--sim-space-3); background: color-mix(in srgb, var(--sim-series-8) 30%, var(--sim-bg-surface)); border: 3px solid var(--sim-series-8-ink); border-bottom-width: 7px; color: var(--sim-label); }
.fcsi-plank--left { clip-path: polygon(0 50%, 16px 0, 100% 0, 100% 100%, 16px 100%); padding-left: 32px; justify-content: flex-start; }
.fcsi-plank--right { clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%); padding-right: 32px; justify-content: flex-end; }
.fcsi-plank__name { font-size: var(--sim-text-lg); font-weight: 800; letter-spacing: 0.01em; }
.fcsi-arm[data-crop="wheat"] { --crop: var(--sim-series-2); }
.fcsi-arm[data-crop="chickpeas"] { --crop: var(--sim-series-3); }
.fcsi-tag { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sim-space-1); min-height: 66px; min-width: 138px; padding: var(--sim-space-2) var(--sim-space-3); border-top: 4px solid var(--crop); text-align: center; }
.fcsi-tag__v { font-size: var(--sim-text-xl); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fcsi-tag__u { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }
.fcsi-tag__t { font-size: var(--sim-text-sm); font-weight: 700; white-space: nowrap; color: var(--sim-label); background: color-mix(in srgb, var(--crop) 30%, var(--sim-bg-surface)); border: 2px solid var(--crop); border-radius: var(--sim-radius-pill); padding: 0 var(--sim-space-2); }
.fcsi-tag--closed { border-style: dashed; border-top-style: solid; border-top-color: var(--sim-label-muted); }
.fcsi-soil { align-self: stretch; height: 30px; background-color: color-mix(in srgb, var(--sim-series-8) 26%, var(--sim-track)); background-image: repeating-linear-gradient(to bottom, transparent 0 10px, var(--sim-stroke) 10px 12px); border-top: 3px solid var(--sim-series-8-ink); border-radius: 0 0 var(--sim-radius-md) var(--sim-radius-md); }
.fcsi-foot { justify-content: center; flex-wrap: wrap; gap: var(--sim-space-2); }
.fcsi-step { display: flex; align-items: center; justify-content: center; width: 52px; min-height: 42px; border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); color: var(--sim-label); cursor: pointer; }
.fcsi-step::before { content: ''; width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; }
.fcsi-step--prev::before { border-right: 13px solid currentColor; margin-right: 3px; }
.fcsi-step--next::before { border-left: 13px solid currentColor; margin-left: 3px; }
.fcsi-step:hover:enabled { border-color: var(--sim-accent); }
.fcsi-step:disabled { opacity: 0.4; cursor: default; }
.fcsi-month { min-width: 58px; text-align: center; font-size: var(--sim-text-lg); font-weight: 800; font-variant-numeric: tabular-nums; }
.fcsi-hint { animation: fcsi-pulse 2.6s ease-in-out infinite; }
@keyframes fcsi-pulse { 0%, 100% { box-shadow: 0 0 0 0 var(--sim-accent); } 50% { box-shadow: 0 0 0 4px var(--sim-accent); } }
/* The plants collapse to zero width rather than display:none: a display:none
   grid item is not placed, and the two planks would then land in the wrong
   tracks. */
.sim-dom-root--portrait .fcsi-plant { width: 0; overflow: hidden; }
.sim-dom-root--portrait .fcsi-plank__name { font-size: var(--sim-text-md); }
.sim-dom-root--portrait .fcsi-tag { min-height: 60px; min-width: 112px; }
`;

const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
];

export class FarmerChoiceSceneIntro extends DomSimulation {
  static WIDTH = 680;
  // Content-sized per beat (FIT), so this is the opening hint; sim-layout's
  // own numbers (landscape 342 / 347 / 355, portrait 409 / 421 / 439) are in
  // the design note.
  static HEIGHT = 360;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 445;
  static FIT = true;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'A signpost in a cleared field: wheat to the left and chickpeas to the right, each plank carrying last season\u2019s price tag, and a playhead the learner walks through one year.';
  // The year walk is in-panel (the stub says "Dials: none" and names no control
  // bar); these are the scene's own buttons, like the steppers on
  // DemandShiftersScene.
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._month = 0;
    this._found = false;
    this._post = null;
    this._tags = {};
  }

  async setup() {
    await super.setup();
    this.render({
      css: CSS,
      rootClass: 'fcsi-root sl-backdrop',
      html: `<div class="fcsi-sign">
  <div class="fcsi-top" data-top>next season's crop</div>
  <div class="fcsi-row">
    <div class="fcsi-plant">${wheatPlant()}</div>
    ${CROPS[0].side === 'left' ? plank(CROPS[0]) : plank(CROPS[1])}
    <div class="fcsi-post" data-post role="img" aria-label="A wooden signpost with a plank each way"></div>
    <div class="fcsi-plant">${farmer()}</div>
    ${CROPS[0].side === 'left' ? plank(CROPS[1]) : plank(CROPS[0])}
    <div class="fcsi-plant">${chickpeaPlant()}</div>
  </div>
  <div class="fcsi-soil" role="img" aria-label="The field, cleared of last season's crop"></div>
</div>
<div class="sim-row fcsi-foot" aria-live="polite">
  <button type="button" class="fcsi-step fcsi-step--prev" data-d="-1" aria-label="An earlier month"></button>
  <span class="fcsi-month" data-month>Apr</span>
  <button type="button" class="fcsi-step fcsi-step--next" data-d="1" aria-label="A later month"></button>
  <span class="sim-tag fcsi-hint" data-hint></span>
</div>
<div>${noteLineHtml(NOTE_ROWS)}</div>`,
    });
    this._cache();
    this._bind();
    this.onStep();
  }

  destroy() {
    this._tags = {};
    this._post = null;
    super.destroy();
  }

  _cache() {
    this._post = this.root?.querySelector?.('[data-post]');
    CROPS.forEach((c) => {
      this._tags[c.id] = this.root?.querySelector?.(`[data-tag="${c.id}"]`);
    });
  }

  _bind() {
    this.root?.addEventListener?.('click', (e) => {
      const btn = e.target?.closest?.('[data-d]');
      if (!btn || btn.disabled) return;
      this._walk(Number(btn.dataset.d));
    });
  }

  // The learner's one act. The walk carries across a beat change on purpose:
  // beat 1 is when the tags are read off, and it reads them at the month the
  // learner chose.
  onStep() {
    this._paint();
    this.requestUiUpdate?.();
  }

  _walk(d) {
    const next = this._month + d;
    if (next < 0 || next > MONTHS.length - 1) return;
    const wasLast = this._month === MONTHS.length - 1;
    this._month = next;
    const found = !this._found && !wasLast && next === MONTHS.length - 1;
    this._found = this._found || found;
    this._paint();
    if (found) burst(this._post, 22);
  }

  _paint() {
    const beat = this.stepIndex ?? 0;
    const quoted = beat >= 1;
    const last = this._month === MONTHS.length - 1;
    const month = this.root?.querySelector?.('[data-month]');
    if (month) month.textContent = MONTHS[this._month];
    const hint = this.root?.querySelector?.('[data-hint]');
    if (hint) {
      hint.textContent = this._found ? 'a year, both crops' : 'step through the year';
      hint.classList.toggle('sim-tag--accent', this._found);
      hint.classList.toggle('fcsi-hint', !this._found);
    }
    const top = this.root?.querySelector?.('[data-top]');
    if (top) {
      const ask = beat >= 2;
      top.classList.toggle('fcsi-top--q', ask);
      top.innerHTML = ask
        ? '<span class="sim-q">?</span>what is the market asking him?'
        : "next season's crop";
    }
    CROPS.forEach((c) => {
      const tag = this._tags[c.id];
      if (!tag) return;
      tag.classList.toggle('fcsi-tag--closed', !quoted);
      if (quoted) {
        tag.innerHTML = `<span class="fcsi-tag__v">\u20b9${c.prices[this._month]}<span class="fcsi-tag__u">/kg</span></span>`
          + `<span class="fcsi-tag__t">${esc(c.trend)}</span>`;
      } else {
        tag.innerHTML = '<span class="fcsi-tag__v"><span class="sim-q">?</span></span>';
      }
    });
    const btns = Array.from(this.root?.querySelectorAll?.('[data-d]') ?? []);
    btns.forEach((b) => {
      const next = this._month + Number(b.dataset.d);
      b.disabled = next < 0 || next > MONTHS.length - 1;
    });
    this.refit?.();
  }

  // Nothing to wait for: the only motion is the tags' own CSS transition and
  // the hint chip's pulse.
  busy() {
    return false;
  }
}