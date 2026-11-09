// CirqueScene - a mountain with a cirque, an arete and a pass, after the book's glacial landforms figure.
// Stages: one per beat lights its landform; chips light any of the three. Nothing here is a real place.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, pointer } from '../L04/EarthBits.js';
import { mountainSvg, MOUNT } from './IceArt.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'cirque', label: 'Cirque', targets: ['cirque'], tone: 5 },
  { id: 'arete', label: 'Arete', targets: ['arete'], tone: 4 },
  { id: 'pass', label: 'Pass', targets: ['pass'], tone: 2 },
];
const SPOT = { cirque: [.8, .2, 'Bowl: cirque'], arete: [.16, .2, 'Sharp ridge: arete'], pass: [.76, .14, 'Low gap: pass'] };

export class CirqueScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 600;
  static HEIGHT = 450;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static ARIA_LABEL = 'A mountain carved by ice. A bowl-shaped cirque holds ice at the head of a glacier. A sharp ridge called an arete runs down from the peak. A low gap called a pass lies between two peaks.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Glacial landforms', chips: CHIPS, onChange: () => this.repaint() });
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 360 : 350; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(stage) { this._fresh = true; this.tl.set({ lit: CHIPS[stage].id }); }
  paint(st) {
    const W = st.W, H = st.H, lit = this.tl.any() ? this.tl.lit()[0] : null;
    let b = svgCloud(W * .8, 36, .6, { seed: 4 }) + svgCloud(W * .14, 44, .46, { seed: 6 }) + mountainSvg(W, H, { lit });
    if (lit) {
      const [u, v, n] = SPOT[lit], [a, c] = MOUNT[lit], x = clamp2(u * W, 90, W - 90), y = v * H;
      b += pointer(x, y, a * W, c * H, {}) + tag(x, y, n, this._fresh ? { pop: true } : {});
    }
    this._fresh = false;
    return { svg: world(st, 'cq', b) };
  }
}
const clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
