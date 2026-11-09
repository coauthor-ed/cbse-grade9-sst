// UndergroundRiverScene - one hill in cutaway. blk-l09-s05, 3 beats. A stream goes down a sinkhole; dye follows the
// water through passages (Pour dye) and comes out at a cave mouth lower down. The figure is schematic, no real place.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, svgCloud, tween, stopTween, tweening, ease, n1 } from '../L08/LandDraw.js';
import { hill, hillTop, passage, routeWater, routePts } from './KarstDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];
const DYE = 'var(--sim-series-6)';

export class UndergroundRiverScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A limestone hill cut open. A stream on top runs into a sinkhole and disappears. Dye poured in follows the water through passages and a chamber inside the hill, and comes out at a cave mouth lower down.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._p = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'dye') this._run(0, 1, 3.4); });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) {
    stopTween(this);
    this._p = [0, 0.3, 0.7][step];
    if (step === 1) this._run(0.3, 0.7, 2);
    if (step === 2) this._run(0.7, 1, 1.6);
  }
  _run(a, b, t) { this._p = a; tween(this, t, (u) => { this._p = a + (b - a) * ease(u); }); }
  paint(st) {
    const W = st.W, step = this.stepIndex, H = st.H - (step === 0 ? 62 : 0), p = this._p;
    let s = svgCloud(W * 0.14, 36, 0.8, { seed: 3 });
    s += hill(W, H);
    s += passage(W, H) + routeWater(W, H, 0, 1);
    if (p > 0.005) s += routeWater(W, H, 0, p, { col: DYE, w: 9 });
    // the stream on the plateau, running to the sinkhole
    const sx = W * 0.56, ex = W * 0.3, line = [];
    for (let x = sx; x >= ex; x -= 8) line.push(`${n1(x)} ${n1(hillTop(x, W, H) + 3)}`);
    s += `<path d="M${line.join('L')}" style="fill:none;stroke:${art('sea')};stroke-width:8;stroke-linecap:round;stroke-linejoin:round"/>`;
    const [mx, my] = routePts(W, H).at(-1);
    s += `<path d="M${n1(mx)} ${n1(my)}L${W + 8} ${n1(my + 6)}" style="fill:none;stroke:${p >= 1 ? DYE : art('sea')};stroke-width:9;stroke-linecap:round"/>`;
    if (step === 0) s += tag(W * 0.62, H * 0.15, 'A stream runs into a sinkhole', { size: 14 }) + lead(W * 0.46, H * 0.19, W * 0.34, hillTop(W * 0.34, W, H) - 2);
    if (step === 1) s += tag(W * 0.4, H * 0.9, 'Underground river', { size: 16, col: art('seaFar') }) + lead(W * 0.46, H * 0.86, W * 0.56, H * 0.67);
    if (step === 2) s += tag(W * 0.66, H * 0.48 + 2, 'Cave mouth', { size: 16 }) + lead(W * 0.72, H * 0.53, mx - 4, my - 10) + tag(W * 0.3, H * 0.92, 'Same water, lower down', { size: 14 });
    return { svg: world('ur', W, H, s), over: step === 0 ? bar(H + 8, [{ label: 'Pour dye', act: 'dye', disabled: tweening(this) }]) : '' };
  }
}
