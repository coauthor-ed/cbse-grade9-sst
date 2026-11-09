// HeadlandErosionScene - one headland through six stages on a Time slider: whole, crack, sea cave, arch, sea
// stack, stump. The dashed line keeps the original headland. Beat 0 rests on the crack, beat 1 on the arch, beat 2
// on the stump; the slider moves freely and its reading names the stage. A big tag names the process at work.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP } from '../shared/SeaArt.js';
import { frame, seaLabel, ctlBar } from '../shared/SeaBits.js';
import { svgHeadland, geo } from './HeadlandArt.js';

const one = (idx) => [{ idx, dwellMs: null }];
const STAGES = [
  { name: 'Headland', how: 'Waves break along the rock' },
  { name: 'Crack', how: 'Hydraulic action opens a crack' },
  { name: 'Sea cave', how: 'Hydraulic action and abrasion' },
  { name: 'Arch', how: 'The back of the cave wears through' },
  { name: 'Sea stack', how: 'The top falls by gravity' },
  { name: 'Stump', how: 'Eroded and weathered down' },
];
const REST = [1, 3, 5];

export class HeadlandErosionScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 440;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A rocky headland seen from the sea. Over time a crack opens at the foot, becomes a sea cave, wears through to an arch, the top falls to leave a sea stack, and the stack wears down to a stump. A dashed line marks the original headland.';
  static CONTROLS = [];

  _stage = 1;

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'range', id: 'stage', label: 'Time', min: 0, max: 5, step: 1, value: 1, read: (v) => STAGES[v].name, say: (v) => STAGES[v].name }], (id, v) => { this._stage = v; this.repaint(); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  css() { return '.svs { padding: 6px; } .ss-range output { min-width: 5.2em; }'; }

  enter(step) {
    this._stage = REST[step] ?? 1;
    this.ctl?.set('stage', this._stage);
  }

  stageHeight(st) { return st.portrait ? 300 : 360; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, S = STAGES[this._stage], g = geo(W, H);
    let body = svgHeadland(W, H, this._stage, { id: 'he', t: 1 });
    const n = seaLabel(W - 12, 26, S.name, { anchor: 'end', size: P ? 21 : 25, display: true });
    body += n + `<g>${seaLabel(W / 2, H - 16, S.how, { size: P ? 15 : 18 })}</g>`;
    if (this._stage >= 4) body += seaLabel(W * 0.74, g.topY - 12, 'Original headland', { size: 15 });
    if (this._stage === 2) body += seaLabel(W * 0.52, g.topY - 22, 'Blow hole', { anchor: 'end', size: 15 });
    return { svg: frame(st, 'he', body) };
  }
}
