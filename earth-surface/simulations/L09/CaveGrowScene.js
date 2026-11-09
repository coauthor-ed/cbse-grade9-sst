// CaveGrowScene - a limestone cave chamber (Fig 2.24). blk-l09-s02 setup (a drip, no forms yet), blk-l09-s03 3 beats.
// Rule drawn: rock grows at both ends of a drip. Stalactite down, stalagmite up, pillar when they join; cave mouth last.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, svgRock, roughen, tween, stopTween, tweening, ease, n1, polyD, SNOW } from '../L08/LandDraw.js';
import { stalactite, stalagmite } from './KarstDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(1), S(2), S(3)];
const START = [0, 0.32, 0.6, 0.6];

export class CaveGrowScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: [S(0)], [Number.MAX_SAFE_INTEGER]: [S(0)], 1: [S(0)], 3: MAP };
  static ARIA_LABEL = 'A cave chamber inside limestone. Water drips from a crack in the roof to the floor. Over many years rock grows down from the roof as a stalactite and up from the floor as a stalagmite, until they join as a pillar. A cave mouth opens to daylight on the right.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._g = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'yrs') this._more(); });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) { stopTween(this); this._g = START[step]; this.play(3); }
  _more() {
    const step = this.stepIndex, from = this._g >= 1 ? START[step] : this._g, to = Math.min(step === 3 ? 1 : 0.6, from + 0.2);
    tween(this, 1.2, (u) => { this._g = from + (to - from) * ease(u); }, () => { if (to === 1) this._foundJoin(); });
  }
  _foundJoin() { if (this.stepIndex === 3 && !this._found) { this._found = true; this.celebrate(this.sv.W * 0.46, this.sv.H * 0.45); } }
  paint(st) {
    const W = st.W, step = this.stepIndex, ctl = step === 0 || step === 2 ? 0 : 62, H = st.H - ctl, g = this._g;
    const roof = H * 0.2, flo = H * 0.82, gap = flo - roof, x0 = W * 0.46;
    let s = svgRock([[-10, -10], [W + 10, -10], [W + 10, H + 10], [-10, H + 10]], { seed: 4, bands: ['sandLit', 'rockLit', 'sandLit', 'rockLit'], bandH: 40, warp: 3, cracks: 6 });
    const ch = roughen([[W * 0.06, H * 0.5], [W * 0.14, roof + 6], [W * 0.4, roof], [W * 0.72, roof + 8], [W * 0.84, H * 0.3], [W + 12, H * 0.4], [W + 12, H * 0.74], [W * 0.84, flo], [W * 0.5, flo + 4], [W * 0.14, flo - 4]], { seed: 3, amp: 5, step: 30 });
    s += `<path d="${polyD(ch, true)}" style="fill:${art('rockDeep')}"/>`;
    s += `<path d="${polyD([[W * 0.14, flo + 14], [W * 0.15, flo - 8], [W * 0.5, flo - 2], [W * 0.84, flo - 4], [W + 12, H * 0.74], [W + 12, flo + 30], [W * 0.14, flo + 30]], true)}" style="fill:${art('rockDark')}"/>`;
    // daylight at the mouth on the right
    s += `<path d="${polyD(roughen([[W * 0.93, H * 0.4], [W + 14, H * 0.34], [W + 14, H * 0.76], [W * 0.95, H * 0.72], [W * 0.9, H * 0.56]], { seed: 8, amp: 4, step: 20 }), true)}" style="fill:${art('skyLow')}"/>`;
    s += `<path d="${polyD([[W * 0.92, H * 0.42], [W * 0.92, H * 0.74], [W * 0.4, flo], [W * 0.5, H * 0.6]], true)}" style="fill:${art('rockDark')};opacity:0.38"/>`;
    // the drip's crack
    s += `<path d="M${n1(x0)} 0L${n1(x0 + 6)} ${n1(H * 0.08)}L${n1(x0 - 4)} ${n1(H * 0.14)}L${n1(x0)} ${n1(roof + 2)}" style="fill:none;stroke:${art('rockDeep')};stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/>`;
    if (g > 0) {
      for (const [fx, k] of [[0.24, 0.6], [0.68, 0.72]]) {
        s += stalactite(W * fx, roof + 6, gap * 0.3 * g * k, 15 * k + 6) + stalagmite(W * fx + 4, flo, gap * 0.24 * g * k, 20 * k + 8);
      }
      const top = g >= 1 ? gap * 0.56 : gap * 0.5 * g, bot = g >= 1 ? gap * 0.5 : gap * 0.42 * g;
      s += stalagmite(x0, flo, bot, 32 + 8 * g) + stalactite(x0, roof + 4, top, 26 + 8 * g);
    }
    const tipY = g > 0 ? roof + gap * 0.5 * g : roof + 4;
    if (g < 1) s += `<ellipse cx="${n1(x0)}" cy="${n1(tipY + 7)}" rx="6" ry="8" style="fill:${art('sea')};stroke:${SNOW};stroke-width:2"/>`;
    const n = W < 420 ? 14 : 15;
    if (step === 0) s += tag(W * 0.74, H * 0.1, 'Slow drip', { size: n }) + lead(W * 0.62, H * 0.13, x0 + 8, tipY + 6, { col: SNOW });
    if (step === 1) s += tag(W * 0.74, H * 0.1, 'Rock grows down', { size: n }) + tag(W * 0.74, H * 0.93, 'Rock grows up', { size: n });
    if (step === 2) {
      s += tag(W * 0.74, H * 0.1, 'Stalactite', { size: 16 }) + lead(W * 0.66, H * 0.13, x0 + 6, roof + gap * 0.16, { col: SNOW });
      s += tag(W * 0.74, H * 0.93, 'Stalagmite', { size: 16 }) + lead(W * 0.66, H * 0.9, x0 + 8, flo - gap * 0.12, { col: SNOW });
    }
    if (step === 3) {
      if (g >= 1) s += tag(W * 0.28, H * 0.93, 'Pillar', { size: 16 }) + lead(W * 0.32, H * 0.89, x0 - 12, flo - gap * 0.28, { col: SNOW });
      s += tag(W * 0.76, H * 0.93, 'Cave mouth', { size: 15 }) + lead(W * 0.82, H * 0.89, W * 0.94, H * 0.72, { col: SNOW });
    }
    return { svg: world('cv', W, H, s), over: ctl ? bar(H + 8, [{ label: 'More years', act: 'yrs', disabled: tweening(this) || (step === 3 && g >= 1) }]) : '' };
  }
  animate(st, t) {
    if (this._g >= 1 || !this.isPlaying()) return;
    const W = st.W, ctl = this.stepIndex === 0 || this.stepIndex === 2 ? 0 : 62, H = st.H - ctl, roof = H * 0.2, flo = H * 0.82, gap = flo - roof, x0 = W * 0.46, lv = this.live;
    const y0 = roof + gap * 0.5 * this._g + 12, y1 = flo - gap * 0.42 * this._g - 6, u = (t * 0.7) % 1;
    lv.attrs(lv.shape('drop', 'ellipse'), { cx: n1(x0), cy: n1(y0 + (y1 - y0) * u * u), rx: 4.5, ry: 7, style: `fill:${art('sea')};stroke:${SNOW};stroke-width:1.5` });
  }
}
