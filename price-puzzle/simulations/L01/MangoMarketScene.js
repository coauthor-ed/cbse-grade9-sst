import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc } from 'simulations/base/SimUi.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';

/**
 * MangoMarketScene - one stall, two price tags (blk-l01-s01, beat 1 of 3).
 *
 * The slide's one claim: at season start the same stall hangs Rs150/kg, at
 * season end the same stall hangs Rs50/kg - nobody moved the stall, nobody
 * changed the mangoes. So this scene draws ONE stall with ONE heap of 12
 * mangoes in every state, and the season dial moves a marker between the two
 * hanging tags. What answers the tag is the buyers' "carried home" tally
 * (beat 3), which is the only thing on screen that grows across the season.
 *
 * Labels only - the prose is the slide's. No demand, no equilibrium, no curve.
 */
const RUPEE = '\u20b9';

// Model numbers (design note "Model numbers"): season 0..100; Rs150 lit while
// s < 50; baskets carried home 0..4 on the dear tag, 4..12 on the cheap one.
const SEASON_MAX = 100;
const HEAP = 12;
const RAIL_L = 215;
const RAIL_R = 405;

const TAGS = [
  { key: 'dear', x: RAIL_L, price: `${RUPEE}150`, state: 'season start' },
  { key: 'cheap', x: RAIL_R, price: `${RUPEE}50`, state: 'season end' },
];

const railX = (s) => RAIL_L + (s / SEASON_MAX) * (RAIL_R - RAIL_L);
const litTag = (s) => (s < 50 ? 'dear' : 'cheap');
const carried = (s) => (s < 50 ? Math.round((s / 50) * 4) : 4 + Math.round(((s - 50) / 50) * 8));

function mango(x, y) {
  return `<g class="mm-mango">
    <ellipse cx="${x}" cy="${y}" rx="13" ry="11"/>
    <path class="mm-leaf" d="M${x} ${y - 10}c5 -7 12 -6 13 -5c-1 6 -7 10 -13 8z"/>
  </g>`;
}

// The scene font (Nunito, else whatever the device has) has no U+20B9 on many
// systems - it renders as a tofu box - so the rupee sign is a drawn glyph and
// only the digits are text. Same shape on both tags, so the tags stay comparable.
const RUPEE_D = 'M3 5h12v2.8H3zM2 9.6h14v2.8H2zM7.2 3.2h3.1v11.4c0 3.2 1.5 4.8 5.3 4.8h3l-.9 2.9h-2.4c-5.1 0-8.1-2.9-8.1-7.7z';

function tagSvg(t) {
  const digits = t.price.slice(1);
  const width = 26 + 6 + 16 * digits.length; // rupee + gap + digits, at 26px bold
  const x0 = Math.round(t.x - width / 2);
  // focusable + labelled, but NOT role="button": sim-layout's interaction probe
  // calls .click() on every [role=button] in the root and an SVG element has none.
  return `<g class="mm-tag" data-tag="${t.key}" tabindex="0"
      aria-label="${esc(t.state)}: tag ${esc(t.price)} per kg. Tap to jump the season here.">
    <line class="mm-string" x1="${t.x}" y1="46" x2="${t.x}" y2="72"/>
    <rect class="mm-tag__board" x="${t.x - 66}" y="72" width="132" height="54" rx="8"/>
    <path class="mm-rupee" transform="translate(${x0} 79) scale(0.88)" d="${RUPEE_D}"/>
    <text class="mm-tag__price" x="${x0 + 32}" y="103" text-anchor="start">${esc(digits)}</text>
    <text class="mm-tag__unit" x="${t.x}" y="120">per kg</text>
  </g>`;
}

function heapSvg() {
  // Two rows of six resting on one counter top (y = 200): the back row peeks
  // over the front one. Counted from this, never from a look.
  const back = [235, 265, 295, 325, 355, 385].map((x, i) => mango(x + (i % 2 ? 7 : -7), 168)).join('');
  const front = [235, 265, 295, 325, 355, 385].map((x) => mango(x, 189)).join('');
  return `${back}${front}`;
}

function stallSvg() {
  const stripes = [0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<rect class="${i % 2 ? 'mm-stripe mm-stripe--alt' : 'mm-stripe'}" x="${i * 77.5}" y="0" width="77.5" height="46"/>`)
    .join('');
  return `<svg class="mm-svg" viewBox="0 0 620 280" role="img"
      aria-label="One mango stall: two price tags hang from the awning, a season marker slides between them, and a heap of twelve mangoes sits on the counter.">
    <g class="mm-awning">${stripes}<rect class="mm-awning__lip" x="0" y="40" width="620" height="6"/></g>
    <rect class="mm-post" x="16" y="46" width="14" height="216" rx="3"/>
    <rect class="mm-post" x="590" y="46" width="14" height="216" rx="3"/>
    ${TAGS.map(tagSvg).join('')}
    <g class="mm-rail">
      <line class="mm-rail__line" x1="${RAIL_L}" y1="150" x2="${RAIL_R}" y2="150"/>
      <line class="mm-rail__tick" x1="${RAIL_L}" y1="143" x2="${RAIL_L}" y2="157"/>
      <line class="mm-rail__tick" x1="${RAIL_R}" y1="143" x2="${RAIL_R}" y2="157"/>
      <text class="mm-rail__label" x="${RAIL_L - 12}" y="155" text-anchor="end">season start</text>
      <text class="mm-rail__label" x="${RAIL_R + 12}" y="155">season end</text>
      <g class="mm-mark"><path d="M-11 -18 L11 -18 L0 0 Z"/><circle class="mm-mark__dot" cx="0" cy="-24" r="4"/></g>
    </g>
    <g class="mm-heap">${heapSvg()}</g>
    <rect class="mm-counter__top" x="40" y="200" width="540" height="14" rx="3"/>
    <rect class="mm-counter__front" x="48" y="214" width="524" height="44" rx="4"/>
    <line class="mm-counter__front" x1="200" y1="214" x2="200" y2="258"/>
    <line class="mm-counter__front" x1="420" y1="214" x2="420" y2="258"/>
    <line class="mm-ground" x1="10" y1="262" x2="610" y2="262"/>
  </svg>`;
}

function basketSvg() {
  return `<svg class="mm-basket__svg" viewBox="0 0 24 24" aria-hidden="true">
    <path class="mm-basket__handle" d="M7 9a5 5 0 0 1 10 0" fill="none"/>
    <path class="mm-basket__body" d="M2.5 9h19l-2.2 12.5H4.7z"/>
    <circle class="mm-basket__mango" cx="12" cy="12.5" r="3.4"/>
  </svg>`;
}

const CSS = SIM_LOOK_DOM_CSS + `
.mm-stack { gap: var(--sim-space-3); }
.mm-hero .mm-svg { display: block; width: 100%; height: auto; }
.mm-svg text { font-family: inherit; }
.mm-awning .mm-stripe { fill: var(--sim-series-2); }
.mm-awning .mm-stripe--alt { fill: color-mix(in oklab, var(--sim-series-2) 72%, black); }
.mm-awning__lip { fill: color-mix(in oklab, var(--sim-series-2) 55%, black); }
.mm-post { fill: var(--sim-series-8); }
.mm-string { stroke: var(--sim-stroke); stroke-width: 2; }
.mm-tag { cursor: pointer; }
/* The board is the tap target: the string and the glyphs let the click through to it. */
.mm-string, .mm-rupee, .mm-tag__price, .mm-tag__unit { pointer-events: none; }
.mm-tag__board { fill: var(--sim-surface-raised); stroke: var(--sim-border); stroke-width: 2; transition: fill .25s, stroke .25s; }
.mm-tag__price { fill: var(--sim-label-muted); font-size: var(--sim-text-xl); font-weight: 700; transition: fill .25s; }
.mm-tag__unit { fill: var(--sim-label-muted); font-size: var(--sim-text-sm); transition: fill .25s; }
.mm-tag.is-lit .mm-tag__board { fill: var(--sim-series-2); stroke: var(--sim-accent); }
/* sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it per tone and theme, which is the only thing that can pick readable ink on the amber tag in both themes. */
.mm-tag.is-lit .mm-tag__price, .mm-tag.is-lit .mm-tag__unit { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); }
.mm-tag:focus-visible .mm-tag__board { stroke: var(--sim-accent); stroke-width: 4; }
.mm-rail__line, .mm-rail__tick { stroke: var(--sim-stroke); stroke-width: 3; stroke-linecap: round; }
.mm-rail__label { fill: var(--sim-label-muted); font-size: var(--sim-text-sm); }
.mm-mark { transform: translate(${RAIL_L}px, 150px); transition: transform .3s ease; }
.mm-mark path { fill: var(--sim-accent); }
.mm-mark__dot { fill: var(--sim-accent); }
.mm-rupee { fill: var(--sim-label-muted); transition: fill .25s; }
.mm-tag.is-lit .mm-rupee { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); }

.mm-mango ellipse { fill: var(--sim-series-8); stroke: color-mix(in oklab, var(--sim-series-8) 70%, black); stroke-width: 1.5; }
.mm-mango .mm-leaf { fill: var(--sim-series-3); }
.mm-counter__top { fill: var(--sim-strata-1); stroke: var(--sim-strata-2); stroke-width: 2; }
.mm-counter__front { fill: var(--sim-strata-2); stroke: var(--sim-strata-3); stroke-width: 2; }
.mm-counter__front line { stroke: var(--sim-strata-3); stroke-width: 2; opacity: .7; }
.mm-ground { stroke: var(--sim-stroke); stroke-width: 2; opacity: .5; }
.mm-hint { align-self: center; }
.mm-buy__head { align-items: center; gap: var(--sim-space-2); }
.mm-buy__head .sim-title { font-size: var(--sim-text-lg); margin: 0; }
.mm-baskets { display: flex; flex-wrap: wrap; gap: var(--sim-space-2); margin-top: var(--sim-space-2); }
.mm-basket { opacity: .2; transform: scale(.82); transition: opacity .25s, transform .25s; }
.mm-basket.is-on { opacity: 1; transform: scale(1); }
.mm-basket__svg { width: 34px; height: 34px; display: block; }
.mm-basket__body { fill: var(--sim-series-1); stroke: var(--sim-bg-deep); stroke-width: 1.4; }
.mm-basket__handle { stroke: var(--sim-series-1); stroke-width: 2; }
.mm-basket__mango { fill: var(--sim-series-8); }
`;

export class MangoMarketScene extends DomSimulation {
  static WIDTH = 640;
  static HEIGHT = 548; // sim-layout: beat 2 (buyers row open) is 536px tall
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 525; // sim-layout: portrait beat 2 is 513px tall
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }], // both tags on the stall, Rs150 lit
    [{ idx: 1, dwellMs: null }], // the same stall, nothing added
    [{ idx: 2, dwellMs: null }], // the buyers' side: baskets carried home
  ];
  static ARIA_LABEL = 'One mango stall with two hanging price tags, 150 rupees and 50 rupees per kg, and a season slider between season start and season end.';
  static CONTROLS = [
    { type: 'slider', id: 'season', label: 'Season: start to end', min: 0, max: SEASON_MAX, step: 5, value: 0 },
  ];

  async setup() {
    await super.setup();
    this.season = 0;
    this._seen = { dear: false, cheap: false };
    this._celebrated = false;
    this.render({
      css: CSS,
      html: `<div class="sim-stack mm-stack">
        <div class="sim-card mm-hero">${stallSvg()}</div>
        <p class="sim-tag mm-hint">drag the season dial, or tap a tag</p>
        <article class="sim-card mm-buy" hidden>
          <div class="sim-row mm-buy__head">
            ${iconSvg('person', 7)}
            <h2 class="sim-title">Carried home</h2>
            <span class="sim-tag mm-count">0 baskets</span>
          </div>
          <div class="mm-baskets">${Array.from({ length: HEAP }, () => `<span class="mm-basket">${basketSvg()}</span>`).join('')}</div>
        </article>
        <p class="sim-meta">One stall, one heap of ${HEAP} mangoes - drawn from the side</p>
        ${noteLineHtml([
          { text: `Model: the stall and the same ${HEAP} mangoes are held fixed all season; only season start and season end are shown, and real markets move day to day.` },
        ])}
      </div>`,
    });
    applyToneInks(this.root);
    this._mark = this.root.querySelector('.mm-mark');
    this._tags = Array.from(this.root.querySelectorAll('.mm-tag'));
    this._baskets = Array.from(this.root.querySelectorAll('.mm-basket'));
    this._count = this.root.querySelector('.mm-count');
    this._buy = this.root.querySelector('.mm-buy');
    this._hint = this.root.querySelector('.mm-hint');
    this._hero = this.root.querySelector('.mm-hero');
    for (const tag of this._tags) {
      const to = tag.dataset.tag === 'cheap' ? SEASON_MAX : 0;
      tag.addEventListener('click', () => this._setSeason(to, true));
      tag.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        this._setSeason(to, true);
      });
    }
    this.onStep();
  }

  // The base class clamps the beat, sets this.stepIndex and root.dataset.step, then calls this.
  onStep() {
    if (this._buy) this._buy.hidden = this.stepIndex < 2;
    if (this._hint) this._hint.hidden = this.stepIndex >= 2;
    this._applySeason();
  }

  onControlChange(id, v) {
    if (id !== 'season') return;
    this._setSeason(Number(v), false);
  }

  // The host draws each control at this value, so a tag tap moves the bar too.
  getControlValue(id) {
    if (id === 'season') return String(this.season);
    return undefined;
  }

  // The amber tag's ink is the one thing CSS cascade cannot decide: re-pick it.
  refreshTheme() {
    if (this.root) applyToneInks(this.root);
  }

  _setSeason(raw, fromScene) {
    const s = Math.max(0, Math.min(SEASON_MAX, Math.round(Number(raw) || 0)));
    this.season = s;
    this._applySeason();
    if (fromScene) this.requestUiUpdate?.();
  }

  _applySeason() {
    const s = this.season ?? 0;
    const lit = litTag(s);
    if (this._mark) this._mark.style.transform = `translate(${railX(s)}px, 150px)`;
    for (const tag of this._tags) tag.classList.toggle('is-lit', tag.dataset.tag === lit);
    const n = carried(s);
    this._baskets?.forEach((b, i) => b.classList.toggle('is-on', i < n));
    if (this._count) this._count.textContent = `${n} basket${n === 1 ? '' : 's'}`;
    this._seen[lit] = true;
    if (this._seen.dear && this._seen.cheap && !this._celebrated) {
      this._celebrated = true;
      if (this._hero) burst(this._hero);
    }
  }

  destroy() {
    this._mark = this._tags = this._baskets = this._count = this._buy = this._hint = this._hero = null;
    super.destroy();
  }
}