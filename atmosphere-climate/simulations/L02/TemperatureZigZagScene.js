// TemperatureZigZagScene - the temperature line on its own, in four parts, one row per layer. The learner marks
// each part Falls or Rises. A wrong mark says what the line does there. Beat 1 shows all four, with the mark
// from the beat, not from what was tapped. Control names: .zz-b[data-l][data-v].
import { SvgScene, stroke, mountEl } from 'simulations/base/kit/SimSvg.js';
import { SKY_COLOR_MAP, svgSkyColour as sc } from '../shared/SkyArt.js';
import { words, SKY_WHITE } from '../L01/AirBits.js';
import { LAYERS, column, lineD, lineX, skyDefs, skyBands, pauseLines, kmTicks } from './AirColumn.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const ROWS = [
  { id: 'tropo', k0: 0, k1: 12, key: 'falls', tone: 1 },
  { id: 'strato', k0: 12, k1: 50, key: 'rises', tone: 7 },
  { id: 'meso', k0: 52, k1: 80, key: 'falls', tone: 5 },
  { id: 'thermo', k0: 80, k1: 120, key: 'rises', tone: 8, tagKm: 108, tagX: 112 },
];
const nameOf = (id) => LAYERS.find((l) => l.id === id).name;

const CSS = `.svs { padding: 6px; }
.zz-rows { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
.zz-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 6px; align-items: center; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 4px 8px; }
.zz-row b { font: 600 16px/1.1 var(--sim-font-display); color: var(--sim-label); }
.zz-b { min-height: 44px; min-width: 62px; padding: 0 8px; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-deep); color: var(--sim-label); font: 800 15px/1 var(--sim-font); cursor: pointer; box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.zz-b[data-on="1"] { background: color-mix(in oklab, var(--sim-good) 34%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.zz-b[data-bad="1"] { background: color-mix(in oklab, var(--sim-bad) 30%, var(--sim-bg-surface)); border-color: var(--sim-bad); }
.zz-b:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.zz-b[disabled] { cursor: default; opacity: 1; color: var(--sim-label); }
.zz-why { grid-column: 1 / -1; min-height: 22px; margin: 0; text-align: center; font-size: 15px; font-weight: 700; color: var(--sim-label); }
.sim-dom-root--portrait .zz-rows { grid-template-columns: minmax(0, 1fr); gap: 5px; }
.sim-dom-root--portrait .zz-row { padding: 2px 8px; }`;

export class TemperatureZigZagScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 442;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'The temperature line through the four lower layers of the atmosphere. For each layer the learner marks whether the temperature falls or rises going up. It falls, rises, falls, rises.';
  static CONTROLS = [];

  css() { return CSS; }

  async setup() {
    this._marks = {}; this._bad = null; this._why = ''; this._won = false;
    await super.setup();
    this._rows = mountEl(this.root, 'zz-rows');
    this._rows.addEventListener('click', (e) => {
      const b = e.target.closest?.('.zz-b');
      if (b && !b.disabled) this._mark(b.dataset.l, b.dataset.v);
    });
    this._drawRows();
    this.relayout();
  }

  enter(step) {
    this._marks = {}; this._bad = null; this._why = ''; this._won = false;
    if (step === 1) for (const r of ROWS) this._marks[r.id] = r.key;
    this._drawRows();
  }

  _mark(id, v) {
    const r = ROWS.find((x) => x.id === id);
    if (v !== r.key) {
      this._bad = `${id}:${v}`;
      this._why = `Look at the line in the ${nameOf(id).toLowerCase()}: it ${r.key === 'rises' ? 'goes up to the warm side' : 'goes back to the cold side'} as you climb.`;
    } else {
      this._marks[id] = v; this._bad = null; this._why = '';
      if (!this._won && ROWS.every((x) => this._marks[x.id])) {
        this._won = true; this._why = 'Two parts fall and two rise.';
        this.celebrate();
      }
    }
    this._drawRows();
    this.repaint();
  }

  _drawRows() {
    if (!this._rows) return;
    const locked = this.stepIndex === 1;
    const btn = (r, v, label) => `<button type="button" class="zz-b" data-l="${r.id}" data-v="${v}" data-on="${this._marks[r.id] === v ? 1 : 0}" data-bad="${this._bad === `${r.id}:${v}` ? 1 : 0}" ${locked ? 'disabled' : ''}>${label}</button>`;
    this._rows.innerHTML = [...ROWS].reverse().map((r) => `<div class="zz-row"><b>${nameOf(r.id)}</b>${btn(r, 'falls', 'Falls')}${btn(r, 'rises', 'Rises')}</div>`).join('') + `<p class="zz-why" aria-live="polite">${this._why}</p>`;
    this.relayout?.();
  }

  stageHeight(st) { return st.portrait ? 270 : 240; }

  paint(st) {
    const W = st.W, H = st.H, c = column(2, 2, W - 4, H - 4);
    let b = `<defs>${skyDefs('zz')}<clipPath id="zz-clip"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18"/></clipPath></defs><g clip-path="url(#zz-clip)">`;
    b += skyBands(c, 'zz') + pauseLines(c, SKY_WHITE) + kmTicks(c, SKY_WHITE, words);
    b += words(12, H - 12, 'colder', { size: 15, ink: sc('ink') }) + words(W - 14, H - 12, 'warmer', { anchor: 'end', size: 15, ink: sc('ink') });
    for (const r of ROWS) {
      const done = !!this._marks[r.id], col = done ? `var(--sim-series-${r.tone})` : SKY_WHITE;
      b += `<path d="${lineD(c, r.k0, r.k1)}" ${stroke(sc('ink'), 9)}/><path d="${lineD(c, r.k0, r.k1)}" ${stroke(col, 5.5)}/>`;
      if (done) {
        const km = r.tagKm ?? (r.k0 + r.k1) / 2, x = lineX(c, r.tagX ?? km), y = c.yAt(km), right = r.key === 'rises';
        b += words(x + (right ? 14 : -14), y + 5, right ? 'rises' : 'falls', { anchor: right ? 'start' : 'end', size: 16, display: true, ink: SKY_WHITE, halo: sc('ink') });
      }
    }
    b += `</g><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" ${stroke(sc('inkSoft'), 3)}/>`;
    return { svg: b };
  }
}
