// AcidRainScene - a limestone hill in cutaway. blk-l09-s01, 3 beats. 0 rain soaks in by cracks. 1 weak acid:
// a little carbon dioxide from air, more from soil. 2 More years: cracks widen into passages, then a cave.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, arrow, svgCloud, svgRain, tween, stopTween, tweening, ease, n1, INK } from '../L08/LandDraw.js';
import { hill, hillTop } from './KarstDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];
const CRACKS = [[0.16, [[0, 0], [8, 0.2], [-6, 0.4], [4, 0.62]]], [0.42, [[0, 0], [-8, 0.16], [6, 0.34], [-4, 0.54]]], [0.54, [[0, 0], [8, 0.18], [-6, 0.3], [4, 0.46]]]];

export class AcidRainScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A limestone hill cut open, with rain falling on it. Some rain runs off and some soaks in through cracks. The water takes up carbon dioxide from air and soil and becomes a weak acid. Over many years it widens the cracks into passages and a cave.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._y = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'yrs') this._more(); });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) { stopTween(this); this._y = 0; if (step < 2) this.play(4); }
  _more() {
    const from = this._y >= 1 ? 0 : this._y, to = from >= 0.66 ? 1 : from >= 0.33 ? 0.67 : 0.34;
    const wasCave = from < 1 && to === 1;
    tween(this, 1.4, (u) => { this._y = from + (to - from) * ease(u); }, () => { if (wasCave) this._foundCave(); });
  }
  _foundCave() { if (this.stepIndex === 2 && !this._found) { this._found = true; this.celebrate(this.sv.W * 0.46, this.sv.H * 0.6); } }
  paint(st) {
    const W = st.W, step = this.stepIndex, H = st.H - (step === 2 ? 62 : 0), y = this._y, Htop = (x) => hillTop(x, W, H, { sink: false });
    let s = svgCloud(W * 0.28, 44, 1.1, { kind: 'rain', seed: 3 }) + svgCloud(W * 0.68, 50, 1.3, { kind: 'rain', seed: 5 });
    s += svgRain(W * 0.28, 48, 1, { w: W * 0.3, h: H * 0.13 }) + svgRain(W * 0.68, 54, 1, { w: W * 0.36, h: H * 0.17 });
    s += hill(W, H, { sink: false });
    const wide = 5 + y * 20;
    let d = '';
    for (const [fx, pts] of CRACKS) {
      const x0 = W * fx, y0 = Htop(x0) + 12;
      d += pts.map(([dx, q], i) => `${i ? 'L' : 'M'}${n1(x0 + dx * (W / 348))} ${n1(y0 + q * H)}`).join('');
    }
    s += `<path d="${d}" style="fill:none;stroke:${art('rockDeep')};stroke-width:${n1(wide)};stroke-linecap:round;stroke-linejoin:round"/>`;
    s += `<path d="${d}" style="fill:none;stroke:${art('sea')};stroke-width:${n1(Math.max(2.5, wide * 0.45))};stroke-linecap:round;stroke-linejoin:round"/>`;
    if (y > 0.97) s += `<ellipse cx="${n1(W * 0.46)}" cy="${n1(H * 0.74)}" rx="${n1(W * 0.26)}" ry="${n1(H * 0.1)}" style="fill:${art('rockDeep')}"/>`;
    else if (y > 0.5) s += `<ellipse cx="${n1(W * 0.46)}" cy="${n1(H * 0.74)}" rx="${n1(W * 0.26 * (y - 0.3))}" ry="${n1(H * 0.1 * (y - 0.3))}" style="fill:${art('rockDeep')}"/>`;
    if (step === 0) {
      s += tag(W * 0.3, H * 0.9, 'Limestone', { size: 16 }) + tag(W * 0.67, H * 0.36 + 34, 'Cracks', { size: 15 }) + lead(W * 0.67 - 36, H * 0.43, W * 0.56, H * 0.44);
      s += arrow(W * 0.74, H * 0.31, W * 0.9, H * 0.6, { w: 7 }) + tag(W * 0.8, H * 0.76, 'Some runs off', { size: 14 });
    }
    if (step === 1) {
      s += tag(W * 0.5, H * 0.21 - 6, 'Air: a little carbon dioxide', { size: 14 });
      s += tag(W * 0.5, H * 0.34 + 18, 'Soil: much more', { size: 15 }) + lead(W * 0.5, H * 0.38, W * 0.5, H * 0.28);
      s += tag(W * 0.46, H * 0.86, 'Weak acid dissolves limestone', { size: 14 });
    }
    if (step === 2) {
      s += tag(W * 0.46, H * 0.92, y > 0.97 ? 'A cave' : y > 0.3 ? 'Cracks become passages' : 'Narrow cracks', { size: 16 });
    }
    return { svg: world('ar', W, H, s), over: step === 2 ? bar(H + 8, [{ label: 'More years', act: 'yrs', disabled: tweening(this) }]) : '' };
  }
  animate(st, t) {
    if (this.stepIndex > 1 || !this.isPlaying()) return;
    const W = st.W, H = st.H, lv = this.live;
    CRACKS.forEach(([fx, pts], k) => {
      const x0 = W * fx, y0 = hillTop(x0, W, H, { sink: false }) + 12, u = (t * 0.32 + k * 0.33) % 1, q = u * pts[3][1];
      lv.attrs(lv.shape(`d${k}`, 'circle'), { cx: n1(x0), cy: n1(y0 + q * H), r: 5, style: `fill:${art('seaDeep')};stroke:${INK};stroke-width:1.5` });
    });
  }
}
