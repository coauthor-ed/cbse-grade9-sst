// WarningChainScene - the four stages, in the book's order and words, on one drawn coast. On the first beat
// the cards can be tapped into order; each later beat has them in order and lights its stage on the coast.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, sky, bindActs } from '../L04/SeaDraw.js';
import { warnWorld } from './WarnWorld.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }], [{ idx: 3, dwellMs: null }]];
const STAGES = [
  { id: 'd', name: 'Detection', does: 'seismic stations', lit: [8, 9, 10], show: [] },
  { id: 'c', name: 'Confirmation', does: 'recorders on the sea floor', lit: ['obpr'], show: ['obpr', 'hump'] },
  { id: 't', name: 'Tracking', does: 'tide gauges and radars', lit: [6, 'radar'], show: ['radar', 'hump'] },
  { id: 'w', name: 'Warning Dissemination', does: 'satellite, SMS and more', lit: [4, 1, '3b'], show: [] },
];
const SHUFFLED = ['t', 'd', 'w', 'c'];
const CSS = `
.wc-card { position: absolute; transform: translate(-50%, -50%); pointer-events: auto; cursor: pointer; touch-action: manipulation; box-sizing: border-box; min-height: 48px; padding: 3px 6px; font: 800 15px/1.15 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.wc-card[data-on="1"] { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: var(--sim-accent); }
.wc-card[data-placed="1"] { border-color: var(--sim-good); }
.sim-dom-root:not(.sim-dom-root--portrait) .wc-card { font-size: 20px; line-height: 1.1; min-height: 64px; }
.wc-card[disabled] { cursor: default; }
.wc-card--label { pointer-events: none; cursor: default; display: flex; align-items: center; justify-content: center; text-align: center; }
.wc-card:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
`;

export class WarningChainScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Four stages of a tsunami warning: Detection, Confirmation, Tracking and Warning Dissemination, each lit on a drawn coast.';
  static CONTROLS = [];
  css() { return AIR_CSS + CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 470 : 430; }
  async setup() {
    this._n = 0; this._msg = ''; this._won = false;
    await super.setup();
    this._off = bindActs(this, (a) => {
      if (this.stepIndex !== 0 || this._n >= 4) return;
      const want = STAGES[this._n];
      if (a === want.id) { this._n += 1; this._msg = this._n >= 4 ? 'The stages are in order.' : ''; if (this._n >= 4 && !this._won) { this._won = true; this.celebrate(this.sv.W / 2, 110); } }
      else if (STAGES.findIndex((x) => x.id === a) >= this._n) this._msg = `${want.name} comes next.`;
    });
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  enter(step) { this._msg = ''; }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, cardsH = port ? 124 : 78, figH = H - cardsH - 30;
    const stage = STAGES[step], w = warnWorld(W, figH, { lit: new Set(stage.lit), show: new Set(stage.show) });
    let s = w.svg;
    s += tx(14, 26, stage.does, { size: port ? 16 : 21, anchor: 'start', col: sky('ink'), halo: sky('cloud'), haloW: 5, display: true, weight: 700 });
    const placed = (i) => (step === 0 ? STAGES.findIndex((x) => x.id === SHUFFLED[i]) < this._n : true);
    const order = step === 0 && this._n < 4 ? SHUFFLED : STAGES.map((x) => x.id);
    let over = '';
    const cw = port ? (W - 18) / 2 : (W - 30) / 4, ch = port ? 52 : 66;
    order.forEach((id, i) => {
      const k = STAGES.findIndex((x) => x.id === id), g = STAGES[k];
      const x = port ? 6 + cw / 2 + (i % 2) * (cw + 6) : 6 + cw / 2 + i * (cw + 6), y = figH + 8 + ch / 2 + (port ? Math.floor(i / 2) * (ch + 6) : 0);
      const isOn = step > 0 ? k === step : k === 0 && this._n >= 4;
      const num = (step > 0 || k < this._n) ? `${k + 1} ` : '';
      // Only the sorting beat has live cards: a placed card is done, and later beats show the order as plain labels.
      const attrs = `data-on="${isOn ? 1 : 0}" data-placed="${step === 0 && k < this._n ? 1 : 0}" style="left:${x}px;top:${y}px;width:${cw}px"`;
      over += step === 0 ? `<button type="button" class="wc-card" data-act="${id}" ${k < this._n ? 'disabled ' : ''}${attrs}>${num}${g.name}</button>` : `<div class="wc-card wc-card--label" ${attrs}>${num}${g.name}</div>`;
    });
    const hint = step === 0 ? (this._msg || (this._n ? '' : 'Tap the stages in the order they happen')) : '';
    if (hint) s += tx(W / 2, H - 8, hint, { size: port ? 15 : 20, col: 'var(--sim-label)' });
    return { svg: s, over };
  }
}
