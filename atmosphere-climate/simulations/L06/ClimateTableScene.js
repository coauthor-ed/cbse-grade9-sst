// ClimateTableScene - the book's Table 3.3 as a board of ten rows (L07 s01, 3 beats). The rows really sort:
// the Latitude, Rainfall and Height buttons reorder them, and a bar shows each year's rain. Beat 0: by
// rainfall, ends lit. Beat 1: by latitude (book's question 7.1). Beat 2: by latitude, Shillong and Jodhpur
// lit. A beat sets the sort; a button press then belongs to the learner until the next beat.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { mountEl } from 'simulations/base/kit/SimSvg.js';
import { SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import { STATIONS } from '../L07/StationData.js';

const ROW = 38;
const SORTS = [
  { id: 'lat', label: 'Latitude', head: 'Latitude', sort: (a, b) => a.latDeg - b.latDeg, val: (s) => s.lat },
  { id: 'rain', label: 'Rainfall', head: 'Latitude', sort: (a, b) => b.total - a.total, val: (s) => s.lat },
  { id: 'alt', label: 'Height', head: 'Height', sort: (a, b) => b.alt - a.alt, val: (s) => `${s.alt} m` },
];
const MAX = 225.3;
const BEATS = [{ sort: 'rain', lit: ['leh', 'shillong'] }, { sort: 'lat', lit: ['thiruvananthapuram', 'leh'] }, { sort: 'lat', lit: ['shillong', 'jodhpur'] }];
const CSS = `
.ct { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; }
.ct-sorts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-2); }
.ct-sort { appearance: none; min-height: 54px; cursor: pointer; border-radius: var(--look-pill); background: var(--sim-bg-surface); color: var(--sim-label);
  border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); font: 600 var(--sim-text-md)/1.1 var(--sim-font-display, var(--sim-font)); }
.ct-sort[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-series-1) 26%, var(--sim-bg-surface)); border-color: var(--sim-series-1); box-shadow: 0 calc(1px * var(--look-lip)) 0 var(--sim-series-1); transform: translateY(calc(2px * var(--look-lip))); }
.ct-sort:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.ct-board { position: relative; border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); overflow: hidden; box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.ct-row, .ct-headrow { display: grid; grid-template-columns: minmax(0, 1.5fr) 74px minmax(0, 1.5fr); align-items: center; gap: var(--sim-space-2); padding: 0 var(--sim-space-2); box-sizing: border-box; }
.ct-headrow { position: absolute; left: 0; right: 0; top: 0; height: 30px; font: 700 var(--sim-text-sm)/1 var(--sim-font); color: var(--sim-label-muted); background: color-mix(in oklab, var(--sim-track) 60%, var(--sim-bg-surface)); }
.ct-row { position: absolute; left: 0; right: 0; height: ${ROW}px; transition: transform 0.45s var(--look-spring-soft), background-color 0.2s; border-top: 2px solid color-mix(in oklab, var(--sim-track) 70%, transparent); }
.ct-row[data-lit="1"] { background: color-mix(in oklab, var(--sim-series-2) 22%, var(--sim-bg-surface)); }
.ct-row[data-lit="0"] .ct-name, .ct-row[data-lit="0"] .ct-val { color: var(--sim-label-muted); }
.ct-name { font: 700 var(--sim-text-md)/1.05 var(--sim-font); color: var(--sim-label); overflow-wrap: anywhere; }
.ct-val { font: 700 var(--sim-text-md)/1 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
.ct-rain { position: relative; height: 28px; display: flex; align-items: center; }
.ct-bar { position: absolute; left: 0; top: 4px; bottom: 4px; border-radius: 6px; background: var(--sim-series-1); opacity: 0.5; }
.ct-mm { position: relative; font: 600 var(--sim-text-md)/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); padding-left: 6px; }
.ct-foot { font: 700 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.sim-dom-root--portrait .ct-row, .sim-dom-root--portrait .ct-headrow { grid-template-columns: 158px 64px minmax(0, 1fr); gap: 4px; }
.sim-dom-root--portrait .ct-name { font-size: 15px; letter-spacing: -0.2px; overflow-wrap: normal; }
.sim-dom-root--portrait .ct-headrow > :last-child { white-space: nowrap; font-size: 14px; letter-spacing: -0.3px; }
@media (prefers-reduced-motion: reduce) { .ct-row { transition: none; } }
`;

export class ClimateTableScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 520;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 560;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'Ten Indian stations in rows, with latitude or height and the rain of a whole year. Buttons sort the rows by latitude, rainfall or height.';

  async setup() {
    this._sort = 'rain';
    this._lit = BEATS[0].lit;
    await super.setup();
    this.render({ css: SIM_LOOK_DOM_CSS + CSS, rootClass: 'sl-backdrop' });
    const wrap = mountEl(this.root, 'ct');
    const bar = mountEl(wrap, 'ct-sorts');
    this._btn = SORTS.map((s) => {
      const b = mountEl(bar, 'ct-sort', 'button');
      b.type = 'button'; b.textContent = s.label;
      b.setAttribute('aria-pressed', 'false'); b.dataset.sort = s.id;
      b.addEventListener('click', () => { this._sort = s.id; this._lit = null; this._apply(); });
      return b;
    });
    this._board = mountEl(wrap, 'ct-board');
    this._board.style.height = `${30 + ROW * STATIONS.length}px`;
    const h = mountEl(this._board, 'ct-headrow');
    this._hv = [mountEl(h, ''), mountEl(h, ''), mountEl(h, '')];
    this._hv[0].textContent = 'Station'; this._hv[2].textContent = 'Year\u2019s rain, cm';
    this._rows = STATIONS.map((s) => {
      const r = mountEl(this._board, 'ct-row');
      mountEl(r, 'ct-name').textContent = s.name;
      const v = mountEl(r, 'ct-val');
      const rain = mountEl(r, 'ct-rain');
      const bb = mountEl(rain, 'ct-bar'); bb.style.width = `${(s.total / MAX) * 100}%`;
      mountEl(rain, 'ct-mm').textContent = s.total.toFixed(1);
      return { s, r, v };
    });
    const foot = mountEl(wrap, 'ct-foot');
    foot.textContent = 'Monthly averages for each station are representational.';
    this._apply();
  }

  onStep(step) { const b = BEATS[step] ?? BEATS[0]; this._sort = b.sort; this._lit = b.lit; this._apply(); }

  _apply() {
    if (!this._rows) return;
    const S = SORTS.find((x) => x.id === this._sort);
    this._hv[1].textContent = S.head;
    for (const b of this._btn) b.setAttribute('aria-pressed', String(b.dataset.sort === S.id));
    const order = [...STATIONS].sort(S.sort);
    for (const { s, r, v } of this._rows) {
      r.style.transform = `translateY(${30 + order.indexOf(s) * ROW}px)`;
      v.textContent = S.val(s);
      r.dataset.lit = this._lit ? (this._lit.includes(s.id) ? '1' : '0') : '';
    }
  }
}
