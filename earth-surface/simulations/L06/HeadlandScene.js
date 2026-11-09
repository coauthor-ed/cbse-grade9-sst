// HeadlandScene - a headland worn from cliff to stump, side view after the book's figure, with a small view from above.
// The drawing is set by P (HeadlandArt): stages 0 cliff, 1 cave, 2 arch, 3 predict (arch, nothing fallen),
// 4 stack, 5 stump. Waves work replays the step into the stage. The figure on landing is that stage at rest.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, arrow, WHITE } from '../L04/EarthBits.js';
import { headlandSvg, planSvg, tides } from './HeadlandArt.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 3, dwellMs: null }]];
const MAP2 = [4, 5].map((idx) => [{ idx, dwellMs: null }]);
const P_OF = [0, 1, 2, 2, 3, 4];

export class HeadlandScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP, 1: MAP1, 2: MAP2 };
  static WIDTH = 620;
  static HEIGHT = 450;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static ARIA_LABEL = 'A headland in side view between high tide and low tide. Waves cut a cliff, then a cave, then an arch. When the roof falls, the outer leg stands alone as a stack, and later wears down to a stump.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 370 : 350; }

  enter(stage) {
    this._stage = stage; this._P = P_OF[stage]; this._fresh = true; this.stopTween();
    this.bar(stage === 3 ? [] : [{ id: 'run', label: 'Waves work', go: true }]);
  }
  control() {
    if (this._tw) return;
    const to = P_OF[this._stage];
    if (to === 0) { this.tween(0, 1, 1.4, (v) => { this._hit = v; }, () => { this._hit = 0; }); return; }
    this.tween(to - 1, to, 2.4, (v) => { this._P = v; }, () => { this._P = to; });
  }

  paint(st) {
    const W = st.W, H = st.H, s = this._stage, P = this._P, t = tides(H), rest = !this._tw;
    let b = svgCloud(W * .4, 40, .6, { seed: 3 }) + svgCloud(W * .86, 34, .42, { seed: 6 });
    b += headlandSvg(W, H, P, 'hl');
    b += strand([[0, t.high], [W, t.high]], WHITE, 2.5, { dash: '9 7' }) + strand([[0, t.low], [W, t.low]], WHITE, 2.5, { dash: '4 7' });
    const pop = this._fresh ? { pop: true } : {};
    const rx = W - 8;
    b += tag(rx, t.high - 16, 'High tide', { size: 14, anchor: 'end', fill: ec('seaDeep') }) + tag(rx, t.low + 16, 'Low tide', { size: 14, anchor: 'end', fill: ec('seaDeep') });
    if (s === 0) {
      const dx = Math.sin((this._hit ?? 0) * Math.PI * 4) * 14;
      b += arrow([[W * .98 - dx, t.high + 26], [W * .84 - dx, t.high + 10]], { c: WHITE, w: 7, rim: ec('seaDeep') });
      b += pointer(W * .72, H * .13, W * .78, H * .4, {}) + tag(W * .7, H * .13, 'Sea cliff', pop);
    }
    if (s === 1 || s === 2) {
      const pw = st.portrait ? 132 : 150;
      b += planSvg(W - pw - 8, 6, pw, 92, P, 'hl');
      b += pointer(W * .22, H * .46, W * .6, t.high - 6, { }) + tag(W * .22, H * .46, s === 1 ? 'Sea cave' : 'Sea arch', pop);
    }
    if (s === 3) b += tag(W * .6, H * .13, 'Sea arch', pop);
    if (s === 4 && rest) b += pointer(W * .86, H * .2, W * .75, H * .34, {}) + tag(W * .8, H * .17, 'Sea stack', pop) + tag(W * .56, H * .9, 'Broken roof', { ...pop, delay: .1, size: 14 });
    if (s === 5 && rest) b += pointer(W * .58, H * .42, W * .74, t.low + 4, {}) + tag(W * .58, H * .4, 'Stump', pop);
    this._fresh = false;
    return { svg: world(st, 'hl', b) };
  }
}
