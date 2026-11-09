// ContourTrenchScene - a hillside in side view. Pick a measure, press Rain, and see how far the water
// runs before it soaks in, and how much soil it takes. Meters are relative: no made-up numbers.
// Stages: 0 Bare, Trench, Bund; 1 Terrace, Check dam; 2 earthen bunds on a hillslope, held.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, ec, plate, words, INK, WHITE } from './EarthBits.js';
import { slopeSvg, STOP } from './SlopeArt.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const NAMES = { bare: 'Bare', trench: 'Trench', bund: 'Bund', terrace: 'Terrace', dam: 'Check dam' };
const SAY = { bare: 'Water runs straight down, with soil', trench: 'Water stops in the trench and soaks in', bund: 'The bank slows the water, which soaks in', terrace: 'Level steps hold the water', dam: 'Water slows and soil settles behind the dam' };

export class ContourTrenchScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 600;
  static HEIGHT = 490;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 590;
  static ARIA_LABEL = 'A hillside in side view. On bare ground rain runs straight down and carries soil. A contour trench, bund, terrace or check dam slows the water so that it soaks in.';
  static CONTROLS = [];

  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 340 : 320; }

  enter(stage) {
    this._stage = stage; this._flow = 0; this._k = stage === 1 ? 'terrace' : stage === 2 ? 'bund' : 'bare'; this._ran = new Set(); this.stopTween(); this._fresh = true;
    this._ctl();
  }
  _ctl() {
    const s = this._stage, busy = !!this._tw;
    if (s === 2) { this.bar([]); return; }
    const list = s === 0 ? ['bare', 'trench', 'bund'] : ['terrace', 'dam'];
    this.bar([...list.map((k) => ({ id: k, label: NAMES[k], on: this._k === k })), { id: 'rain', label: 'Rain', go: true, off: busy }]);
  }
  control(id) {
    if (this._tw) return;
    if (id === 'rain') {
      this.tween(0, 1, 2, (v) => { this._flow = v; }, () => {
        this._ran.add(this._k); this._ctl();
        if (this._ran.size >= 2 && this._ran.has(this._stage ? 'dam' : 'trench') && !this._cel) { this._cel = true; this.celebrate(); }
      });
      this._ctl();
      return;
    }
    this._k = id; this._flow = 0; this._ctl(); this.repaint();
  }
  paint(st) {
    const W = st.W, H = st.H, k = this._k, f = this._flow;
    let b = svgCloud(W * .25, 44, .7, { seed: 4, kind: 'rain' }) + svgCloud(W * .68, 38, .62, { seed: 7, kind: 'rain' });
    if (f > 0 && f < 1) for (let i = 0; i < 16; i++) { const x = (i * 43) % W; b += `<path d="M${x} ${64 + (i * 13) % 34}l-5 16" style="stroke:${ec('sea')};stroke-width:3;stroke-linecap:round"/>`; }
    b += slopeSvg(W, H, k, { flow: f });
    const lost = STOP[k] * Math.max(f, 0), m = (x, y, label, v, role) => plate(x, y, 140, 34, {}) + words(x + 8, y + 22, label, { size: 14 }) + `<rect x="${x + 76}" y="${y + 12}" width="56" height="10" rx="5" style="fill:${ec('snowShade')}"/><rect x="${x + 76}" y="${y + 12}" width="${56 * v}" height="10" rx="5" style="fill:${ec(role)}"/>`;
    b += m(W - 150, H - 46, 'Soil lost', lost, 'soilTop');
    if (this._stage === 2) b += tag(W / 2, H * .13, 'Earthen bunds on a hillslope', this._fresh ? { pop: true } : {});
    else if (f >= 1) b += tag(W / 2, 22, SAY[k], { size: 14 });
    else b += tag(W / 2, 22, NAMES[k], {});
    this._fresh = false;
    return { svg: world(st, 'ct', b) };
  }
}
