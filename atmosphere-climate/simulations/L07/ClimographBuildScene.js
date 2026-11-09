// ClimographBuildScene - the book's temperature and rainfall graph, Fig. 3.14, for any of the ten stations
// (L07 s04, 3 beats). (0) Delhi, the two scales named. (1) Delhi, May and July lit with their readings.
// (2) a station picker: the learner reads any station. Values are the table's, exactly. The Chennai
// slide uses the subclass ClimographChennaiScene through the hooks at the foot.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { STATIONS, stationOf, climoSvg } from './StationData.js';
import { READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const CLIMO_CSS = `
.cg-pick { display: block; width: 100%; min-height: 48px; margin-top: var(--sim-space-2); padding: 0 var(--sim-space-3); border-radius: var(--look-pill); background: var(--sim-bg-surface); color: var(--sim-label);
  border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); font: 700 var(--sim-text-lg)/1 var(--sim-font); }
.cg-pick[hidden] { display: none; }
.cg-pick:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
`;
const SCALES = { tMin: -10, tMax: 40, rMax: 70, tStep: 10, rStep: 10 };

export class ClimographBuildScene extends SvgScene {
  static HEIGHT = 535;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A graph of one station: bars of rainfall for each month and a line of temperature. A picker changes the station.';

  css() { return READ_CSS + CLIMO_CSS; }
  stageHeight(st) { return st.portrait ? 336 : 350; }

  async setup() {
    this._id = this.startId();
    await super.setup();
    const sel = document.createElement('select');
    sel.className = 'cg-pick'; sel.setAttribute('aria-label', 'Choose a station');
    for (const s of STATIONS) { const o = document.createElement('option'); o.value = s.id; o.textContent = s.name; sel.appendChild(o); }
    this._chg = () => { this._id = sel.value; this.repaint(); };
    sel.addEventListener('change', this._chg);
    this.root.appendChild(sel);
    this._sel = sel;
    this._syncPick();
    this.repaint();
  }
  destroy() { this._sel?.removeEventListener?.('change', this._chg); super.destroy(); }
  enter() { this._id = this.startId(); this._syncPick(); }
  startId() { return 'delhi'; }
  pickStep() { return 2; }
  _syncPick() {
    if (!this._sel) return;
    this._sel.hidden = this.stepIndex !== this.pickStep();
    this._sel.value = this._id;
    this.relayout?.();
  }
  lit(step) { return step === 1 ? [4, 6] : null; }
  scales(s) { return s.temp[0] < 0 || Math.max(...s.rain) > 20 ? SCALES : { tMin: 0, tMax: 35, rMax: 20, tStep: 5, rStep: 5 }; }

  card(s, step) {
    if (step === 0) return readCard('Delhi', 'line: temperature, left scale. Bars: rain, right scale');
    if (step === 1) return readCard('33.3 °C to 30.0 °C', 'May to July: the rain cools the air');
    return readCard(s.name, `${s.lat}, ${s.alt} m, ${s.total.toFixed(1)} cm a year`);
  }
  paintExtra() { return ''; }

  paint(st) {
    const s = stationOf(this._id), step = this.stepIndex, box = { x: 0, y: 2, w: st.W, h: st.H - 8 };
    const svg = climoSvg(s, box, { ...this.scales(s), lit: this.lit(step) ?? undefined, grow: true }) + this.paintExtra(st, s, step, box);
    return { svg, head: this.card(s, step) };
  }
}
