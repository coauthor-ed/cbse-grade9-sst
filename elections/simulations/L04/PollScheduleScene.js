// PollScheduleScene - blk-l04-s01. One example year as a strip, four lanes from the book.
// b0 the two events that start the work. b1 the lanes, TapLight on each factor. b2 pick a month and the
// scene names the clash. b3 polling in phases over several weeks. No turnout, no invented figures.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, burst } from 'simulations/base/kit/SimLookDom.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import { civicHtml, CIVIC_CSS } from '../shared/CivicArt.js';
import { esc } from 'simulations/base/SimUi.js';

const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Months are 0 to 11. An example year for one place; no real calendar.
const LANES = [
  { id: 'weather', label: 'Weather', tone: 1, on: [5, 6, 7, 8], clash: 'heavy rain' },
  { id: 'farm', label: 'Farming', tone: 3, on: [3, 5, 6, 9, 10], clash: 'sowing or harvest' },
  { id: 'exam', label: 'Exams', tone: 5, on: [1, 2, 11], clash: 'examinations' },
  { id: 'fest', label: 'Festivals', tone: 7, on: [2, 7, 9, 10], clash: 'festivals' },
];
const CHIPS = LANES.map((l) => ({ id: l.id, label: l.label, targets: [l.id], tone: l.tone }));
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const FREE = [0, 4];
const PHASES = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

const CSS = `
.ps { display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; padding: 6px 12px 10px; font-family: var(--sim-font); color: var(--sim-label); }
.ps-panel { background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px 12px;
  box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-stroke) 60%, var(--sim-label)); }
.ps-h { margin: 0 0 6px; font: 700 21px/1.15 var(--sim-font-display, var(--sim-font)); }
.ps-grid { display: grid; grid-template-columns: 76px repeat(12, minmax(0, 1fr)); gap: 3px 2px; align-items: center; }
.ps-m { text-align: center; font: 800 14px/1 var(--sim-font); color: var(--sim-label-muted); }
.ps-m[data-pick="1"] { color: var(--sim-label); }
.ps-l { font: 800 14px/1.05 var(--sim-font); min-width: 0; }
.ps-c { height: 30px; border-radius: 6px; background: color-mix(in oklab, var(--sim-track) 60%, var(--sim-bg-surface)); }
.ps-c[data-on="1"] { background: var(--c); box-shadow: inset 0 calc(-3px * var(--look-lip)) 0 color-mix(in oklab, var(--c) 68%, var(--sim-label)); }
.ps-c[data-dim="1"] { opacity: 0.22; }
.ps-c[data-pick="1"] { outline: 3px solid var(--sim-label); outline-offset: 0; }
.ps-note { margin: 6px 0 0; font: 700 14px/1.2 var(--sim-font); color: var(--sim-label-muted); text-align: right; }
.ps-months { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
.sim-dom-root--portrait .ps-months { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.sim-dom-root--portrait [data-beat="2"] .ps-c, .sim-dom-root--portrait[data-beat="2"] .ps-c { height: 20px; }
.sim-dom-root--portrait[data-beat="2"] .ps-note { display: none; }
.sim-dom-root--portrait[data-beat="2"] .ps-say { min-height: 46px; font-size: 17px; }
.ps-btn { min-height: 50px; padding: 2px; border-radius: var(--sim-radius-md); font: 800 16px/1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); cursor: pointer;
  border: calc(2px * var(--look-rim)) solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-stroke) 60%, var(--sim-label)); touch-action: pan-y; }
.ps-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 30%, var(--sim-bg-surface)); border-color: var(--sim-accent); }
.ps-say { min-height: 52px; margin: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 6px 10px; border-radius: var(--sim-radius-md); font: 700 19px/1.2 var(--sim-font-display, var(--sim-font));
  background: color-mix(in oklab, var(--sim-gold) 18%, var(--sim-bg-surface)); }
.ps-say[data-free="1"] { background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); }
.ps-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ps-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; min-height: 250px; padding: 12px; background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--c);
  border-radius: var(--sim-radius-lg); box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--c) 60%, var(--sim-label)); font: 700 22px/1.2 var(--sim-font-display, var(--sim-font)); }
.ps-big { font: 700 44px/1 var(--sim-font-display, var(--sim-font)); }
.ps-or { text-align: center; font: 800 18px/1 var(--sim-font); color: var(--sim-label-muted); }
.ps-weeks { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.ps-week { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 2px 8px; border-radius: var(--sim-radius-md); background: color-mix(in oklab, var(--c) 18%, var(--sim-bg-surface)); border: calc(2px * var(--look-rim)) solid var(--c); font: 700 16px/1.1 var(--sim-font-display, var(--sim-font)); animation: ps-in 0.34s var(--look-spring) both; animation-delay: var(--d, 0s); }
.ps-week svg { width: 100%; max-width: 86px; }
@keyframes ps-in { from { transform: translateY(8px) scale(0.95); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ps-week { animation: none; } }
`;

export class PollScheduleScene extends DomSimulation {
  static WIDTH = 620;
  static HEIGHT = 450;
  static PORTRAIT_WIDTH = 348;
  static PORTRAIT_HEIGHT = 450;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Two events that start election work, then an example year with four lanes for weather, farming, examinations and festivals. Picking a month names what clashes with polling in that month. Then four weeks of polling in phases.';

  tl = tapLight({ label: 'Factors', chips: CHIPS, onChange: () => this.paint() });

  async setup() {
    this.bt = -1; this.pick = -1; this.found = new Set();
    await super.setup();
    this.render({ css: SIM_LOOK_DOM_CSS + TAP_LIGHT_CSS + CIVIC_CSS + CSS, html: '<div class="ps"><div data-body></div><div data-chips></div></div>' });
    this.onBeatChange(0, 4);
  }

  onBeatChange(beat) {
    const b = Math.max(0, Math.min(3, Math.trunc(beat) || 0));
    this.root.dataset.beat = String(b);
    if (b === this.bt) return;
    this.bt = b; this.pick = -1;
    if (!this.chipsHost) { this.chipsHost = this.root.querySelector('[data-chips]'); if (this.chipsHost) this.tl.mount(this.chipsHost, this); }
    this.tl.reset();
    if (this.chipsHost) this.chipsHost.hidden = b !== 1;
    this.paint();
  }

  strip(lit) {
    const pick = this.bt === 2 ? this.pick : -1;
    const head = `<span></span>${M.map((m, i) => `<span class="ps-m" data-pick="${i === pick ? 1 : 0}">${m[0]}</span>`).join('')}`;
    const rows = LANES.map((l) => {
      const dim = lit && lit !== l.id ? 1 : 0;
      return `<span class="ps-l">${esc(l.label)}</span>` + M.map((_, i) => `<span class="ps-c" style="--c:var(--sim-series-${l.tone})" data-on="${l.on.includes(i) ? 1 : 0}" data-dim="${dim}" data-pick="${i === pick ? 1 : 0}"></span>`).join('');
    }).join('');
    return `<div class="ps-grid">${head}${rows}</div><p class="ps-note">An example year</p>`;
  }

  clashes(i) { return LANES.filter((l) => l.on.includes(i)).map((l) => l.clash); }

  paint() {
    const host = this.root.querySelector('[data-body]');
    if (!host) return;
    if (this.bt === 0) {
      host.innerHTML = `<div class="ps-two">
        <div class="ps-card" style="--c:var(--sim-series-1)"><span class="ps-big">5 years</span><span>The term of the Legislature ends</span></div>
        <div class="ps-card" style="--c:var(--sim-series-5)">${civicHtml('office', { size: 118 })}<span>The Legislature is dissolved early</span></div></div>`;
    } else if (this.bt === 1) {
      const lane = LANES.find((l) => l.id === this.tl.chip()?.id);
      host.innerHTML = `<div class="ps-panel"><p class="ps-h">${lane ? esc(lane.label) + ': ' + esc(lane.clash) : 'One year, four factors'}</p>${this.strip(lane?.id)}</div>`;
    } else if (this.bt === 2) {
      const list = this.pick < 0 ? ['-'] : this.clashes(this.pick);
      const say = this.pick < 0 ? 'Which months are free of all four?' : list.length ? `${M[this.pick]}: clash with ${list.join(' and ')}` : `${M[this.pick]}: no clash in this example`;
      host.innerHTML = `<div class="ps-panel"><p class="ps-h">Tap a month</p>${this.strip()}</div>
        <p class="ps-say" data-free="${list.length ? 0 : 1}" aria-live="polite" style="margin-top:8px">${esc(say)}</p>
        <div class="ps-months" style="margin-top:8px">${M.map((m, i) => `<button type="button" class="ps-btn" data-m="${i}" aria-pressed="${i === this.pick}">${m}</button>`).join('')}</div>`;
      host.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => this.choose(+b.dataset.m)));
    } else {
      host.innerHTML = `<div class="ps-panel"><p class="ps-h">One election, four phases</p><div class="ps-weeks">${PHASES.map((w, i) => `<div class="ps-week" style="--c:var(--sim-series-${i + 1});--d:${0.1 + i * 0.16}s">${civicHtml('booth', { size: 86 })}<span>${w}</span></div>`).join('')}</div><p class="ps-note">An example: the number of phases varies</p></div>`;
    }
    this.relayout?.();
  }

  choose(i) {
    this.pick = i;
    this.paint();
    if (FREE.includes(i) && !this.found.has(i)) { this.found.add(i); burst(this.root.querySelector('.ps-say') ?? this.root); }
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
