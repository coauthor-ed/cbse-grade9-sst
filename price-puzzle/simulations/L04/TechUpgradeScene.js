/**
 * TechUpgradeScene - blk-l04-s05, "Better Tools, Cheaper Kilos".
 *
 * The slide's claim - "New technology cuts the cost of producing a kilogram - and a cheaper kilogram
 * means more kilograms offered at every price" - as a mango field with three tools the learner fits,
 * above a three-row offer table whose price column never moves.
 *
 * The model is one line of arithmetic the learner can check by hand:
 *   - each tool fitted adds exactly 1 kg to the offer at EVERY price (a parallel rightward shift),
 *   - and cuts the cost of a kilogram by its own saving (4 / 3 / 3 from Rs 40 to Rs 30).
 * So switching a tool off drops the cost chip and every row at once, which is the causal chain the
 * slide states rather than a script that plays once.
 *
 * What this file will not do, all from the stub:
 *   - it draws no curve and no plane, and names no equilibrium.
 *   - it never moves a price: 50 / 100 / 150 are the same three on every beat.
 *   - it names no other supply determinant (seller count, expectations).
 *
 * Prices and the base column 6 / 12 / 18 kg are the chapter's own (Table 9.2's market column), so no
 * total the learner summed in L03 changes. The cost per kilogram and each tool's saving are mine -
 * see the design note's Model numbers.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { simRecord } from 'simulations/base/SimUi.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const RUPEE = '\u20b9';
const ARROW = '\u2192';
const POP_MS = 400;

/* ------------------------------------------------------------------ the model */

// Table 9.2's three price rows and its market supply column, used exactly.
const PRICE = [50, 100, 150];
const BASE = [6, 12, 18];

// The slide's three tools. `save` is what the tool takes off the cost of a kilogram; `fruit` is what
// it adds to each plant; the van adds none - it carries the fruit further.
const TOOLS = [
  { key: 'drip', name: 'drip irrigation', icon: 'rain', save: 4, fruit: 1, does: 'water to each plant' },
  { key: 'sensor', name: 'weather sensors', icon: 'sun', save: 3, fruit: 1, does: 'the harvest called right' },
  { key: 'van', name: 'cold-storage van', icon: 'truck', save: 3, fruit: 0, does: 'far markets reached' },
];
const FRUIT_BARE = 2;             // fruit per plant before any tool
const COST_BARE = 40;             // cost of one kilogram before any tool, in Rs

const BEAT_LABEL = ['The wrong idea', 'The tools', 'Cheaper kilos'];
const BEAT_CHIP = [
  'only price was on the table',
  'pull a tool out - watch the field',
  'nobody changed a price',
];
// Which tools each beat opens with. Beat 1 is the learner's to fit (the beat shows the bare field);
// beat 2 is the slide's conclusion, so the technology is in place and the learner can take it out
// again to test what it was doing.
const BEAT_TOOLS = [[], [], TOOLS.map((t) => t.key)];
const NOTE = [
  'prices are one thing that can move the offer - they are not the only one',
  'the tools are in the field, not in the price column',
  'cheaper kilos, more kilos at every price - nobody changed a price',
];
const QUESTION = `cheaper kilo ${ARROW} ?`;
const RULE = `cheaper kilo ${ARROW} more kilos at every price`;

const money = (v) => `${RUPEE}${v}`;
const off = () => PRICE.map((_, i) => BASE[i]);
const withTools = (on) => PRICE.map((_, i) => BASE[i] + on.size);
const cost = (on) => COST_BARE - TOOLS.reduce((sum, t) => sum + (on.has(t.key) ? t.save : 0), 0);
const fruit = (on) => FRUIT_BARE + TOOLS.reduce((n, t) => n + (on.has(t.key) ? t.fruit : 0), 0);

/* ------------------------------------------------------------------ the look */

const CSS = SIM_LOOK_DOM_CSS + `
.tu-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }
.tu-root > .sim-record { margin: 0; }
.tu-root .sim-record, .sim-dom-root--portrait .tu-root .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* ---- the wrong idea: one fixed-height bar, struck through once it is dead ---- */
.tu-idea { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center;
  gap: var(--sim-space-2); padding: var(--sim-space-1) var(--sim-space-3); box-sizing: border-box;
  border: 2px solid var(--sim-bad); border-radius: var(--sim-radius-md);
  background: color-mix(in oklab, var(--sim-bad) 12%, var(--sim-bg-surface)); }
.tu-idea.is-dead { border-color: var(--sim-stroke); background: var(--sim-bg-deep); }
.tu-idea__text { font: 800 var(--sim-text-md)/1.25 var(--sim-font); color: var(--sim-label); }
.tu-idea.is-dead .tu-idea__text { color: var(--sim-label-muted); text-decoration: line-through; }
.tu-idea__btn { font: 800 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-ink-on-bad, var(--sim-bg-deep));
  background: var(--sim-bad); border: 0; border-radius: var(--sim-radius-pill);
  padding: 5px var(--sim-space-3); cursor: pointer; }
.tu-idea__btn:hover { filter: brightness(1.08); }
/* a spent button still has to be readable: the flat muted fill says "not any more", the ink does not fade */
.tu-idea__btn[disabled] { background: color-mix(in oklab, var(--sim-label-muted) 26%, var(--sim-bg-surface));
  color: var(--sim-label); cursor: default; }
.tu-idea.is-struck .tu-idea__text { animation: tu-strike .4s ease both; }
@keyframes tu-strike { from { opacity: 1; } 45% { opacity: .25; } to { opacity: 1; } }

/* ---- the main pair: the field (the hero) and the offer table ---- */
.tu-main { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); gap: var(--sim-space-2); align-items: start; }
.tu-card { display: flex; flex-direction: column; gap: var(--sim-space-2); margin: 0; }
.tu-title { font: 800 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); text-transform: uppercase; }

/* ---- the field: sky, ground, three mango trees, a drip line, a sensor stake, a van at the gate ---- */
.tu-soil { position: relative; height: 108px; border-radius: var(--sim-radius-sm); overflow: hidden;
  background: linear-gradient(color-mix(in oklab, var(--sim-series-1) 16%, var(--sim-bg-deep)),
    color-mix(in oklab, var(--sim-series-1) 6%, var(--sim-bg-deep))); }
.tu-ground { position: absolute; inset: auto 0 0 0; height: 26px;
  background: color-mix(in oklab, var(--sim-series-8) 46%, var(--sim-bg-deep));
  border-top: 3px solid color-mix(in oklab, var(--sim-series-8) 85%, var(--sim-bg-deep)); }
.tu-plants { position: absolute; inset: 8px 92px 26px 6px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end; justify-items: center; gap: var(--sim-space-2); }
/* one tree: a trunk with a canopy, and the fruit hanging on the canopy - the dots are the count */
.tu-plant { position: relative; width: 58px; height: 74px; }
.tu-trunk { position: absolute; inset: auto 0 0 0; width: 7px; height: 26px; margin: 0 auto;
  background: color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-bg-deep)); border-radius: 3px 3px 0 0; }
.tu-canopy { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 52px; height: 44px;
  border-radius: 50% 50% 42% 42%;
  background: color-mix(in oklab, var(--sim-series-3) 78%, var(--sim-bg-deep)); }
.tu-fruit { position: absolute; width: 14px; height: 14px; border-radius: 50%;
  background: var(--sim-series-2);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--sim-series-3) 78%, var(--sim-bg-deep)); }
.tu-fruit--1 { top: 8px; left: 4px; }
.tu-fruit--2 { top: 20px; right: 4px; }
.tu-fruit--3 { top: 26px; left: 21px; display: none; }
.tu-fruit--4 { top: 6px; right: 20px; display: none; }
.tu-plant.has-third .tu-fruit--3 { display: block; }
.tu-plant.has-fourth .tu-fruit--4 { display: block; }

/* the drip line: a pipe along the ground with three emitters; it only exists once fitted */
.tu-drip { position: absolute; inset: auto 0 22px 0; height: 10px; opacity: 0; transition: opacity .3s ease; }
.tu-field.has-drip .tu-drip { opacity: 1; }
.tu-drip__pipe { position: absolute; inset: 3px 8px auto 8px; height: 5px; border-radius: 3px;
  background: var(--sim-series-7); box-shadow: 0 1px 0 color-mix(in oklab, var(--sim-bg-deep) 45%, transparent); }
.tu-drop { position: absolute; top: 0; width: 5px; height: 9px; border-radius: 0 0 5px 5px; background: var(--sim-series-7); }
.tu-drop--1 { left: 17%; } .tu-drop--2 { left: 47%; } .tu-drop--3 { left: 77%; }
.tu-field.has-drip .tu-drop { animation: tu-drop 1.1s ease-in 2 both; }
@keyframes tu-drop { from { transform: translateY(-8px); opacity: 0; } 30% { opacity: 1; }
  to { transform: translateY(14px); opacity: 0; } }

/* the weather-sensor stake */
.tu-sensor { position: absolute; inset: 10px auto auto 12px; width: 8px; height: 72px; border-radius: 4px;
  background: color-mix(in oklab, var(--sim-series-5) 70%, var(--sim-bg-deep)); opacity: 0; transition: opacity .3s ease; }
.tu-field.has-sensor .tu-sensor { opacity: 1; }
.tu-sensor__dial { position: absolute; top: -16px; left: 50%; transform: translateX(-50%);
  width: 28px; height: 20px; border-radius: 14px 14px 3px 3px;
  background: var(--sim-series-5); box-shadow: 0 2px 0 color-mix(in oklab, var(--sim-bg-deep) 45%, transparent); }
.tu-sensor__dial::after { content: ''; position: absolute; inset: 5px 6px auto 6px; height: 4px; border-radius: 2px;
  background: color-mix(in oklab, var(--sim-bg-deep) 55%, transparent); }

/* the cold-storage van at the gate: one body, a cab window and two wheels; parked off the road until fitted */
.tu-van { position: absolute; inset: auto 10px 26px auto; width: 82px; height: 38px; border-radius: 5px 7px 3px 3px;
  background: color-mix(in oklab, var(--sim-series-7) 62%, var(--sim-bg-surface));
  border: 2px solid color-mix(in oklab, var(--sim-series-7) 90%, var(--sim-bg-deep));
  transform: translateX(120px); opacity: 0; transition: transform .45s ease, opacity .3s ease; }
.tu-field.has-van .tu-van { transform: none; opacity: 1; }
.tu-van__cab { position: absolute; top: 6px; left: 6px; width: 24px; height: 15px; border-radius: 3px;
  background: color-mix(in oklab, var(--sim-series-1) 80%, var(--sim-bg-deep)); }
.tu-van__wheel { position: absolute; bottom: 3px; width: 11px; height: 11px; border-radius: 50%;
  background: color-mix(in oklab, var(--sim-label-muted) 55%, var(--sim-bg-deep)); }
.tu-van__wheel--a { left: 8px; } .tu-van__wheel--b { right: 8px; }

/* two state chips under the field: what actually changed out there */
.tu-chips { display: flex; flex-wrap: wrap; gap: var(--sim-space-2); margin: 0; }
.tu-chip { margin: 0; }
.tu-chip.is-fresh { animation: tu-pop .35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes tu-pop { from { transform: scale(0.8); } to { transform: scale(1); } }

/* ---- the offer table ---- */
.tu-cost { display: flex; align-items: center; justify-content: space-between; gap: var(--sim-space-2);
  min-height: 34px; padding: 4px var(--sim-space-3); box-sizing: border-box;
  border-radius: var(--sim-radius-sm); border: 2px dashed color-mix(in oklab, var(--sim-stroke) 70%, transparent);
  font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.tu-cost.is-known { border-style: solid; border-color: var(--sim-good);
  background: color-mix(in oklab, var(--sim-good) 14%, var(--sim-bg-surface)); color: var(--sim-label); }
.tu-cost.is-fresh { animation: tu-pop .4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.tu-cost__was { color: var(--sim-label-muted); text-decoration: line-through; }
.tu-cost__now { font-size: var(--sim-text-lg); }

.tu-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.tu-table th, .tu-table td { padding: 3px 2px; text-align: center; }
.tu-table thead th { font: 800 var(--sim-text-sm)/1.15 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 2px solid var(--sim-stroke); padding-bottom: 5px; }
.tu-table thead th span { display: block; }
.tu-table tbody th { font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); }
.tu-table tbody tr + tr th, .tu-table tbody tr + tr td { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); }
/* the price column's own tag: it sits in the header on every beat, invisible until beat 2 names
   the prices, so no beat changes a row's height */
.tu-lock { display: block; margin-top: 2px; font: 800 var(--sim-text-sm)/1.1 var(--sim-font);
  color: var(--sim-good); visibility: hidden; }
.tu-lock.is-shown { visibility: visible; }
.tu-offer { display: flex; align-items: baseline; justify-content: center; gap: 5px; min-height: 30px;
  padding: 2px 3px; border: 2px solid transparent; border-radius: var(--sim-radius-sm); }
/* the old offer, struck through, only while a tool is fitted - same cell, so no row changes height */
.tu-was { font: 700 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted); text-decoration: line-through; }
.tu-now { font: 800 var(--sim-text-lg)/1.2 var(--sim-font); color: var(--sim-label); }
.tu-offer.is-shifted { background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface));
  border-color: var(--sim-good); }
.tu-offer.is-fresh { animation: tu-pop ${POP_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.tu-was { display: block; font: 700 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted);
  text-decoration: line-through; min-height: 16px; }
/* The check cell is a fixed box, so reading a row never changes a row's height. */
.tu-check { display: grid; place-items: center; width: 100%; height: 30px; font: inherit;
  color: var(--sim-accent); background: transparent; border: 0; padding: 0; cursor: pointer; }
.tu-check .sim-q { color: var(--sim-accent); }
.tu-check__delta { display: none; font: 800 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted); }
.tu-check__delta.is-kg { color: var(--sim-good); }
.tu-check.is-read .tu-check__delta { display: block; }
.tu-check.is-read .sim-q { display: none; }

/* ---- the rule slot: one fixed bar, a question on beats 0-1 and the rule on beat 2 ---- */
.tu-rule { display: flex; align-items: center; justify-content: center; gap: var(--sim-space-2);
  min-height: 38px; padding: 6px var(--sim-space-3); box-sizing: border-box; text-align: center;
  border: 2px dashed color-mix(in oklab, var(--sim-stroke) 70%, transparent); border-radius: var(--sim-radius-md);
  font: 800 var(--sim-text-md)/1.25 var(--sim-font); color: var(--sim-label-muted); }
.tu-rule.is-answered { border-style: solid; border-color: var(--sim-good); color: var(--sim-label);
  background: color-mix(in oklab, var(--sim-good) 12%, var(--sim-bg-surface)); }
.tu-rule__q { font: inherit; color: var(--sim-accent); }

/* ---- the three tools: a row of three, each a toggle ---- */
.tu-tools { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-2); }
.tu-tool { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "icon name" "icon does" "icon save";
  gap: 1px var(--sim-space-2); align-items: center; text-align: start; margin: 0; padding: var(--sim-space-2);
  font: inherit; color: var(--sim-label); cursor: pointer;
  border: 2px dashed color-mix(in oklab, var(--sim-stroke) 70%, transparent); background: transparent; }
.tu-tool[hidden] { display: none; }
.tu-tool__icon { grid-area: icon; display: grid; place-items: center; width: 30px; height: 30px; color: var(--sim-label-muted); }
.tu-tool__icon .sim-icon { width: 28px; height: 28px; }
.tu-tool__name { grid-area: name; font: 800 var(--sim-text-sm)/1.2 var(--sim-font); }
.tu-tool__does { grid-area: does; font: 700 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.tu-tool__save { grid-area: save; font: 800 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.tu-tool:hover { border-color: var(--sim-accent); }
.tu-tool.is-on { border-style: solid; border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 12%, var(--sim-bg-surface)); }
.tu-tool.is-on .tu-tool__icon, .tu-tool.is-on .tu-tool__save { color: var(--sim-good); }
.tu-tool[disabled] { cursor: default; }
.tu-tool[disabled]:hover { border-color: color-mix(in oklab, var(--sim-stroke) 70%, transparent); }

/* portrait: the pair stacks, field above supply, and the soil shortens - a phone gets the same
   information in less height rather than a shrunken drawing */
.sim-dom-root--portrait .tu-main { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .tu-soil { height: 92px; }
.sim-dom-root--portrait .tu-tools { grid-template-columns: minmax(0, 1fr); gap: var(--sim-space-1); }
.sim-dom-root--portrait .tu-tool { padding: 6px var(--sim-space-2); }
.sim-dom-root--portrait .tu-idea { grid-template-columns: minmax(0, 1fr) auto; }
.sim-dom-root--portrait .tu-idea__text { grid-column: 1; grid-row: 1; }
.sim-dom-root--portrait .tu-idea .sim-tag { grid-column: 1; grid-row: 2; justify-self: start; }
.sim-dom-root--portrait .tu-idea__btn { grid-column: 2; grid-row: 1 / span 2; }
`;
// sim-lint-ignore token: --sim-ink-on-bad is set on the root at mount by the theme, not by a stylesheet.

/* ------------------------------------------------------------------ the scene */

export class TechUpgradeScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 615;              // sim-layout's own numbers; FIT then refits per beat
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 1085;
  static FIT = true;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }],     // only price is on the table - the dead end
    [{ idx: 1, dwellMs: null }],     // the three tools arrive, and the learner fits them
    [{ idx: 2, dwellMs: null }],     // cheaper kilos: the cost chip and all three rows move together
  ];
  static ARIA_LABEL =
    'A mango field above a supply table. Three tools - drip irrigation, weather sensors and a cold-storage van - '
    + 'raise the fruit on each plant and cut the cost of a kilogram. The table has three price rows, 50, 100 and 150 '
    + 'rupees per kilo, and the kilos offered rise at all three while the prices never move.';
  static CONTROLS = [];              // the stub says "Dials: none" - the tool cards are the dial, in panel

  constructor(container, config) {
    super(container, config);
    this._on = new Set();            // the tools fitted right now, learner and beats together
    this._dead = false;              // has the wrong idea been crossed out
    this._read = new Set();          // the table rows the learner has checked
    this._broke = {};
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="tu-root">
          <div data-record>${simRecord(BEAT_LABEL, 0, 'Better tools, cheaper kilos')}</div>
          <div class="tu-idea" data-idea>
            <span class="sim-tag" data-idea-tag>wrong idea</span>
            <span class="tu-idea__text" data-idea-text>only its own price can change the offer</span>
            <button class="tu-idea__btn" type="button" data-cross>cross it out</button>
          </div>

          <div class="tu-main">
            <div class="sim-card tu-card tu-field" data-field>
              <span class="tu-title">one mango field</span>
              <div class="tu-soil" role="img" aria-label="A field with three mango plants, a drip line along the ground, a weather sensor stake and a cold-storage van at the gate">
                <div class="tu-plants" data-plants></div>
                <div class="tu-drip" aria-hidden="true">
                  <span class="tu-drip__pipe"></span>
                  <span class="tu-drop tu-drop--1"></span>
                  <span class="tu-drop tu-drop--2"></span>
                  <span class="tu-drop tu-drop--3"></span>
                </div>
                <div class="tu-sensor" aria-hidden="true"><span class="tu-sensor__dial"></span></div>
                <div class="tu-van" aria-hidden="true">
                  <span class="tu-van__cab"></span>
                  <span class="tu-van__wheel tu-van__wheel--a"></span>
                  <span class="tu-van__wheel tu-van__wheel--b"></span>
                </div>
                <div class="tu-ground"></div>
              </div>
              <p class="tu-chips">
                <span class="sim-tag tu-chip" data-beat></span>
                <span class="sim-tag tu-chip" data-fruit></span>
                <span class="sim-tag tu-chip" data-markets></span>
              </p>
            </div>

            <div class="sim-card tu-card tu-supply" data-supply>
              <span class="tu-title">what the market is offered</span>
              <div class="tu-cost" data-cost role="status" aria-live="polite"></div>
              <table class="tu-table" aria-label="Kilos offered at each price, and what happened to that price">
                <colgroup>
                  <col style="width: 32%">
                  <col style="width: 30%">
                  <col style="width: 38%">
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col"><span>price</span><span>per kg</span><span class="tu-lock" data-lock>not moved</span></th>
                    <th scope="col"><span>offered</span><span>kg</span></th>
                    <th scope="col"><span>the price</span><span>moved?</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${PRICE.map((p, i) => `
                    <tr>
                      <th scope="row">${money(p)}</th>
                      <td><span class="tu-offer" data-offer="${i}">
                          <span class="tu-was" data-was="${i}"></span>
                          <span class="tu-now" data-now="${i}"></span>
                        </span></td>
                      <td><button class="tu-check" type="button" data-check="${i}" aria-pressed="false"
                        aria-label="check what happened at ${money(p)} per kilo"><span class="sim-q" aria-hidden="true">?</span><span class="tu-check__delta" data-delta="${i}"></span></button></td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="tu-rule" data-rule role="status" aria-live="polite"></div>

          <div class="tu-tools" role="group" aria-label="the three tools">
            ${TOOLS.map((t) => `
              <button class="tu-tool" type="button" data-tool="${t.key}" aria-pressed="false" hidden>
                <span class="tu-tool__icon" aria-hidden="true">${iconSvg(t.icon, 'currentColor')}</span>
                <span class="tu-tool__name">${t.name}</span>
                <span class="tu-tool__does">${t.does}</span>
                <span class="tu-tool__save">${RUPEE}${t.save}/kg off</span>
              </button>`).join('')}
          </div>

          ${noteLineHtml([{ text: NOTE[0] }])}
        </div>`,
    });

    const q = (sel) => this.root?.querySelector?.(sel) ?? null;
    this._el = {
      record: q('[data-record]'),
      idea: q('[data-idea]'),
      ideaTag: q('[data-idea-tag]'),
      ideaText: q('[data-idea-text]'),
      cross: q('[data-cross]'),
      field: q('[data-field]'),
      plants: q('[data-plants]'),
      beatChip: q('[data-beat]'),
      fruit: q('[data-fruit]'),
      markets: q('[data-markets]'),
      supply: q('[data-supply]'),
      cost: q('[data-cost]'),
      lock: q('[data-lock]'),
      rule: q('[data-rule]'),
      note: q('.sl-note-line'),
      tools: TOOLS.map((t) => q(`[data-tool="${t.key}"]`)),
      offers: PRICE.map((_, i) => q(`[data-offer="${i}"]`)),
      now: PRICE.map((_, i) => q(`[data-now="${i}"]`)),
      was: PRICE.map((_, i) => q(`[data-was="${i}"]`)),
      checks: PRICE.map((_, i) => q(`[data-check="${i}"]`)),
      deltas: PRICE.map((_, i) => q(`[data-delta="${i}"]`)),
    };

    // Three identical plants: the fruit dots on them are the output readout, so the chip and the
    // drawing can never disagree.
    if (this._el.plants) {
      this._el.plants.innerHTML = [0, 1, 2].map(() => `
        <span class="tu-plant">
          <span class="tu-canopy"></span>
          <span class="tu-fruit tu-fruit--1"></span>
          <span class="tu-fruit tu-fruit--2"></span>
          <span class="tu-fruit tu-fruit--3"></span>
          <span class="tu-fruit tu-fruit--4"></span>
          <span class="tu-trunk"></span>
        </span>`).join('');
      this._el.plantEls = Array.from(this._el.plants.children);
    }

    applyToneInks(this.root);

    this.root?.addEventListener?.('click', (e) => {
      const tool = e.target?.closest?.('[data-tool]');
      if (tool && !tool.disabled) { this._toggle(tool.dataset.tool); return; }
      const check = e.target?.closest?.('[data-check]');
      if (check) { this._checkRow(Number(check.dataset.check)); return; }
      if (e.target?.closest?.('[data-cross]')) this._cross();
    });

    this._paintRecord();
    this._paint();
  }

  destroy() {
    this._el = null;
    super.destroy();
  }

  /* ------------------------------------------------------------------ the beats and the taps */

  /** The clamped beat index: a mount can open on any beat, and none may be past the last. */
  _beat() {
    const i = Number(this.stepIndex);
    return Number.isFinite(i) && i >= 0 ? Math.min(i, 2) : 0;
  }

  /**
   * A beat change. The tools arrive at beat 1 with none of them fitted - which tools go in is the
   * learner's, and the field answers. Beat 2 is the slide's conclusion (the technology is in place
   * and the whole table has moved), so that beat opens fully fitted; the learner can still take a
   * tool out on it and watch the cost and every row fall back.
   */
  onStep() {
    const beat = this._beat();
    this._on = new Set(BEAT_TOOLS[beat]);
    this._read.clear();
    if (beat > 0 && !this._dead) this._cross({ silent: true });
    this._paint({ fresh: 'all' });
  }

  /** The learner's dial: fit a tool or pull it out again, and the field, the cost and every row follow. */
  _toggle(key) {
    if (this._beat() < 1) return;                       // no tool exists before the beat that brings one
    if (this._on.has(key)) this._on.delete(key); else this._on.add(key);
    this._paint({ fresh: 'all' });
    this._maybeBurst(this._beat());
  }

  /** Check one row of the table: it says what happened to that price, never what the offer did. */
  _checkRow(i) {
    if (!Number.isInteger(i) || i < 0 || i > 2) return;
    this._read.has(i) ? this._read.delete(i) : this._read.add(i);
    this._paint();
    if (this._beat() === 2 && this._read.size === 3) this._maybeBurst(2);
  }

  /** The dead end is the learner's to reject; a beat that moves past it rejects it for them. */
  _cross(opts = {}) {
    if (this._dead) return;
    this._dead = true;
    this._paint({ strike: true });
    if (!opts.silent) this._maybeBurst(0);
  }

  /* ------------------------------------------------------------------ the paint */

  /** Everything on screen, from the tool set and the beat. */
  _paint(opts = {}) {
    const el = this._el;
    if (!el) return;
    const beat = this._beat();
    const on = this._on;
    const n = on.size;
    const fresh = opts.fresh === 'all';
    const offers = withTools(on);
    const perKg = cost(on);

    // the wrong idea
    el.idea?.classList.toggle('is-dead', this._dead || beat > 0);
    if (opts.strike && el.idea) {
      el.idea.classList.remove('is-struck');
      void el.idea.offsetWidth;
      el.idea.classList.add('is-struck');
    }
    if (el.ideaTag) el.ideaTag.textContent = (this._dead || beat > 0) ? 'dead end' : 'wrong idea';
    if (el.cross) {
      el.cross.disabled = this._dead || beat > 0;
      el.cross.textContent = this._dead ? 'crossed out' : 'cross it out';
    }

    // the field
    el.field?.classList.toggle('has-drip', on.has('drip'));
    el.field?.classList.toggle('has-sensor', on.has('sensor'));
    el.field?.classList.toggle('has-van', on.has('van'));
    const perPlant = fruit(on);
    el.plantEls?.forEach((p) => {
      if (!p) return;
      p.classList.toggle('has-third', perPlant >= 3);
      p.classList.toggle('has-fourth', perPlant >= 4);
    });
    if (el.fruit) {
      el.fruit.textContent = `${perPlant} fruit per plant`;
      this._pop(el.fruit, fresh && n > 0);
    }
    if (el.markets) {
      el.markets.textContent = on.has('van') ? 'markets reached: 3' : 'markets reached: 1';
      this._pop(el.markets, fresh && on.has('van'));
    }

    // the cost of a kilogram: unknown until the slide names it, then a live number
    const known = beat >= 2;
    if (el.cost) {
      el.cost.classList.toggle('is-known', known);
      this._pop(el.cost, fresh && known);
      el.cost.innerHTML = known
        ? `<span>cost per kg</span><span><span class="tu-cost__was">${money(COST_BARE)}</span> ${ARROW} <span class="tu-cost__now">${money(perKg)}</span></span>`
        : `<span>cost per kg</span><span class="sim-q" aria-hidden="true">?</span>`;
    }

    // the table: three prices that never move, three offers that do
    PRICE.forEach((p, i) => {
      const cell = el.offers?.[i];
      if (el.now?.[i]) el.now[i].textContent = String(offers[i]);
      if (cell) {
        cell.classList.toggle('is-shifted', offers[i] !== BASE[i]);
        this._pop(cell, fresh && offers[i] !== BASE[i]);
      }
      if (el.was?.[i]) el.was[i].textContent = known && n > 0 ? String(BASE[i]) : '';
      const read = this._read.has(i);
      el.checks?.[i]?.classList.toggle('is-read', read);
      el.checks?.[i]?.setAttribute('aria-pressed', String(read));
      if (el.deltas?.[i]) {
        // the price's own story: it never moved, whatever the offer did
        const delta = el.deltas[i];
        delta.textContent = known && n > 0 ? `held +${n} kg` : 'held';
        delta.classList.toggle('is-kg', known && n > 0);
      }
    });
    el.lock?.classList.toggle('is-shown', known);

    // the rule slot, and the beat's own chip and note
    if (el.rule) {
      const answered = known && n > 0;
      el.rule.classList.toggle('is-answered', answered);
      el.rule.innerHTML = answered
        ? `<span class="sim-icon" aria-hidden="true">${iconSvg('check', 'currentColor')}</span><span>${RULE}</span>`
        : `<span class="tu-rule__q">${QUESTION}</span>`;
    }
    TOOLS.forEach((t, i) => {
      const card = el.tools?.[i];
      if (!card) return;
      card.hidden = beat < 1;
      const fitted = on.has(t.key);
      card.classList.toggle('is-on', fitted);
      card.disabled = beat < 1;
      card.setAttribute('aria-pressed', String(fitted));
      card.setAttribute('aria-label', `${t.name} - ${fitted ? 'fitted, tap to take it out' : 'not fitted, tap to fit it'}`);
    });
    if (el.note) el.note.textContent = NOTE[beat];
    if (el.beatChip) el.beatChip.textContent = BEAT_CHIP[beat];

    this._paintRecord();
  }

  /** Restart a one-shot pop: the class has to come off and go back on, or a second tap does nothing. */
  _pop(node, on) {
    if (!node) return;
    if (!on) { node.classList.remove('is-fresh'); return; }
    node.classList.remove('is-fresh');
    void node.offsetWidth;
    node.classList.add('is-fresh');
  }

  /** simRecord emits no data attribute of its own, so the strip is moved by position. */
  _paintRecord() {
    const steps = this._el?.record?.querySelectorAll?.('.sim-record__step') ?? [];
    const beat = this._beat();
    Array.from(steps).forEach((step, i) => {
      if (i === beat) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------------ celebration */

  /** The concept, not the press: beat 0 the dead end is crossed out, beat 1 all three tools fitted,
   *  beat 2 all three rows checked with every price still where it was. */
  _maybeBurst(beat) {
    if (this._broke[beat]) return;
    const ready = beat === 0 ? this._dead
      : beat === 1 ? this._on.size === TOOLS.length
        : this._read.size === 3 && this._on.size > 0;
    if (!ready) return;
    this._broke[beat] = true;
    // The idea bar is one line tall and clips confetti to nothing, and the field card is the widest
    // box on the scene, so the root carries the beat-0 burst and each card its own.
    burst(beat === 0 ? this.root : (beat === 1 ? this._el?.field : this._el?.supply));
  }
}