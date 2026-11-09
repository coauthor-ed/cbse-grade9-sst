// MyFootprintScene - the book's self-check, word for word (L08 s06, 3 beats). (0) tick a line in each of four
// groups. (1) the score by the book's points. (2) two pledges, chosen or typed. Ungraded. Nothing is sent or
// stored: state lives in this scene object only. Group tabs keep it within a phone screen.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import { mountEl } from 'simulations/base/kit/SimSvg.js';

const GROUPS = [
  { id: 'A', name: 'Transport', opts: [['I usually walk/use a cycle.', 'Low', 1], ['I use public transport/carpool.', 'Medium', 2], ['I travel by private cars even for short distances.', 'High', 3], ['I take flights more than twice a year.', 'Very high', 4]] },
  { id: 'B', name: 'Electricity', opts: [['I always switch off electrical appliances (lights, fans, etc.) when not in use.', 'Low', 1], ['I sometimes forget to switch off electrical appliances (lights, fans, etc.).', 'Medium', 2], ['I leave electrical appliances (lights, fans, etc.) on frequently.', 'High', 3]] },
  { id: 'C', name: 'Water', opts: [['I use water judiciously, for example, just one bucket of water for bathing.', 'Low', 1], ['I sometimes waste water (leaving the tap running/more buckets of water for a bath/long showers).', 'Medium', 2], ['I rarely think about saving water.', 'High', 3]] },
  { id: 'D', name: 'Waste', opts: [['I reuse, recycle, and avoid single-use plastics.', 'Low', 1], ['I sometimes use disposable plastics (bottles/bags/straws).', 'Medium', 2], ['I often throw away plastic and do not recycle.', 'High', 3]] },
];
const PLEDGES = ['Walk or cycle more often', 'Switch off lights and fans', 'Use one bucket for bathing', 'Carry my own bag and bottle', 'Use the bus or share a ride'];
const CSS = `
.mf { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; }
.mf-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
.mf-tab, .mf-opt, .mf-pl { appearance: none; cursor: pointer; font-family: var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke);
  box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.mf-tab { min-height: 48px; padding: 2px; border-radius: var(--sim-radius-md); font-size: 14px; font-weight: 800; line-height: 1.1; }
.mf-tab[aria-selected="true"] { background: color-mix(in oklab, var(--sim-series-3) 28%, var(--sim-bg-surface)); border-color: var(--sim-series-3); }
.mf-tab[data-done="1"]::after { content: ' \\2713'; }
.mf-opt { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; width: 100%; min-height: 56px; padding: var(--sim-space-2); border-radius: var(--sim-radius-md); text-align: left; font-size: var(--sim-text-md); font-weight: 700; line-height: 1.2; }
.mf-opt small { font-size: 14px; color: var(--sim-label-muted); }
.mf-opt[aria-checked="true"] { background: color-mix(in oklab, var(--sim-series-3) 26%, var(--sim-bg-surface)); border-color: var(--sim-series-3); }
.mf-list { display: flex; flex-direction: column; gap: var(--sim-space-2); }
.mf-total { display: flex; align-items: baseline; justify-content: center; gap: var(--sim-space-2); padding: var(--sim-space-2); border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.mf-num { font: 600 44px/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.mf-of { font: 700 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.mf-row { display: grid; grid-template-columns: minmax(0, 1fr) 60px; gap: var(--sim-space-2); align-items: center; min-height: 44px; font: 700 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); border-bottom: 2px solid var(--sim-track); }
.mf-pts { font: 600 var(--sim-text-lg)/1 var(--sim-font-display, var(--sim-font)); text-align: right; }
.mf-pls { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--sim-space-2); }
.mf-pl { min-height: 48px; padding: 4px var(--sim-space-2); border-radius: var(--look-pill); font-size: var(--sim-text-md); font-weight: 700; }
.mf-pl[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-series-1) 26%, var(--sim-bg-surface)); border-color: var(--sim-series-1); }
.mf-in { width: 100%; min-height: 48px; box-sizing: border-box; padding: 0 var(--sim-space-3); border-radius: var(--sim-radius-md); border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); background: var(--sim-bg-surface); color: var(--sim-label); font: 700 var(--sim-text-md)/1.2 var(--sim-font); }
.mf-note { margin: 0; text-align: center; font: 700 var(--sim-text-md)/1.25 var(--sim-font); color: var(--sim-label-muted); }
.mf button:focus-visible, .mf-in:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
`;

export class MyFootprintScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 460;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 560;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A carbon footprint self-check: tick one line in each of four groups, read your score, and choose two changes. Nothing is saved.';

  async setup() {
    this._ticked = {}; this._tab = 0; this._pl = []; this._own = ''; this._step = 0;
    await super.setup();
    this.render({ css: SIM_LOOK_DOM_CSS + CSS, rootClass: 'sl-backdrop' });
    this._w = mountEl(this.root, 'mf');
    this._w.addEventListener('click', (e) => this._click(e));
    this._w.addEventListener('input', (e) => { if (e.target?.classList?.contains('mf-in')) this._own = e.target.value; });
    this._draw();
  }
  onStep(step) { this._step = step; this._draw(); }

  _total() { return GROUPS.reduce((n, g) => n + (this._ticked[g.id] != null ? g.opts[this._ticked[g.id]][2] : 0), 0); }
  _left() { return GROUPS.filter((g) => this._ticked[g.id] == null).length; }

  _click(e) {
    const b = e.target?.closest?.('button');
    if (!b) return;
    const d = b.dataset;
    if (d.tab != null) this._tab = Number(d.tab);
    else if (d.opt != null) {
      this._ticked[GROUPS[this._tab].id] = Number(d.opt);
      const next = GROUPS.findIndex((g) => this._ticked[g.id] == null);
      if (next >= 0) this._tab = next;
    } else if (d.pl != null) {
      const i = this._pl.indexOf(d.pl);
      if (i >= 0) this._pl.splice(i, 1); else { if (this._pl.length >= 2) this._pl.shift(); this._pl.push(d.pl); }
    }
    this._draw();
    this.relayout?.();
  }

  _draw() {
    if (!this._w) return;
    const s = this._step;
    let html;
    if (s === 0) {
      const g = GROUPS[this._tab];
      html = `<div class="mf-tabs" role="tablist">${GROUPS.map((q, i) => `<button type="button" class="mf-tab" role="tab" data-tab="${i}" aria-selected="${i === this._tab}" data-done="${this._ticked[q.id] != null ? 1 : 0}">${q.name}</button>`).join('')}</div>
        <div class="mf-list" role="radiogroup" aria-label="${g.name}">${g.opts.map((o, i) => `<button type="button" class="mf-opt" role="radio" data-opt="${i}" aria-checked="${this._ticked[g.id] === i}"><span>${o[0]}</span><small>${o[1]} impact</small></button>`).join('')}</div>`;
    } else if (s === 1) {
      const left = this._left();
      html = `<div class="mf-total"><span class="mf-num">${this._total()}</span><span class="mf-of">points, from a lowest of 4 to a highest of 13</span></div>`
        + GROUPS.map((g) => { const t = this._ticked[g.id]; return `<div class="mf-row"><span>${g.name}: ${t != null ? `${g.opts[t][1].toLowerCase()} impact` : 'not ticked'}</span><span class="mf-pts">${t != null ? g.opts[t][2] : '-'}</span></div>`; }).join('')
        + (left ? `<p class="mf-note">${left === 4 ? 'Go back one step to tick your lines.' : `${left} ${left === 1 ? 'group is' : 'groups are'} still to tick.`}</p>` : '');
    } else {
      html = `<p class="mf-note">Pick two, or type your own. ${this._pl.length} of 2 picked.</p><div class="mf-pls">${PLEDGES.map((p) => `<button type="button" class="mf-pl" data-pl="${p}" aria-pressed="${this._pl.includes(p)}">${p}</button>`).join('')}</div><input class="mf-in" type="text" maxlength="80" aria-label="Your own change" placeholder="Or type your own" value="${this._own.replace(/"/g, '&quot;')}">`;
    }
    this._w.innerHTML = html;
    this.relayout?.();
  }
}
