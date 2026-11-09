// DuneMoveScene - a dune from the side. blk-l08-s05b, 2 beats. Stage 0: sand climbs the gentle windward slope,
// slides down the steep slip face, and the whole dune moves downwind (Blow). Stage 1: dunes and people.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, arrow, tween, stopTween, tweening, ease, under, svgSand, svgWater, svgTree, svgGrass, polyD, n1, INK, SNOW } from './LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1)];

export class DuneMoveScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A dune from the side, with a long gentle windward slope and a short steep slip face. Sand climbs the gentle slope and slides down the steep face, so the dune moves downwind. A second view shows a coastal dune between the sea and a village.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._go = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'blow') { this._go = 0; this._blow(); } });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) { stopTween(this); this._go = 0; if (step === 0) this._blow(); }
  _blow() { tween(this, 3, (u) => { this._go = ease(u); }); this.play(3); }
  _top(x, cx, w, g, h) {
    // gentle on the left for about 3/4 of the width, steep on the right
    const a = cx - w * 0.72, b = cx + w * 0.3;
    if (x <= a || x >= b) return g;
    return x < cx ? g - h * Math.sin(((x - a) / (cx - a)) * Math.PI / 2) ** 1.3 : g - h * (1 - (x - cx) / (b - cx));
  }
  paint(st) { return this.stepIndex === 0 ? this._dune(st) : this._coast(st); }
  _dune(st) {
    const W = st.W, H = st.H - 62, g = H * 0.8, h = H * 0.34, w = W * 0.72, cx0 = W * 0.44, go = W * 0.1, cx = cx0 + this._go * go;
    const st0 = (x) => this._top(x, cx0, w, g, h), top = (x) => this._top(x, cx, w, g, h);
    let s = svgSand(under((x) => g - 2, -10, W + 10, H + 10, 24), { seed: 3, dark: true });
    s += svgSand(under(top, -10, W + 10, g + 4, 6), { seed: 6, ripples: true });
    s += `<path d="${polyD([[cx, g - h], [cx + w * 0.3, g], [cx + w * 0.14, g]], true)}" style="fill:${art('sandDark')}"/>`;
    s += `<path d="${polyD(under(st0, cx0 - w * 0.72, cx0 + w * 0.3, g, 6).slice(0, -2))}" style="fill:none;stroke:${INK};stroke-width:2.5;stroke-dasharray:7 7;opacity:0.7"/>`;
    s += arrow(W * 0.03, H * 0.13, W * 0.03 + Math.min(130, W * 0.34), H * 0.13, { w: 11 }) + tag(W * 0.03 + 46, H * 0.13 + 32, 'Wind', { size: 15 });
    s += tag(W * 0.27, g + 30, 'Windward slope', { size: 15 }) + tag(W * 0.76, g + 30, 'Slip face', { size: 15 }) + lead(W * 0.76, g + 16, cx + w * 0.17, g - h * 0.46);
    if (this._go > 0.95) s += tag(W * 0.72, H * 0.12, 'The dune has moved on', { size: 14 });
    return { svg: world('dm', W, H, s), over: bar(H + 8, [{ label: 'Blow', act: 'blow', disabled: tweening(this) }]) };
  }
  _coast(st) {
    const W = st.W, H = st.H, g = H * 0.7;
    const top = (x) => g - Math.max(0, 1 - ((x - W * 0.42) / (W * 0.24)) ** 2) * H * 0.3 + Math.sin(x * 0.03) * 2;
    let s = svgSand(under(top, -10, W + 10, H + 10, 6), { seed: 5, ripples: true });
    s += svgWater([[-10, g + 8], [W * 0.14, g + 8], [W * 0.1, H + 10], [-10, H + 10]], { ripples: 3 });
    s += svgGrass(W * 0.3, top(W * 0.3), W * 0.54, top(W * 0.54), { seed: 3, n: 8 });
    const hut = (x, k) => `<g transform="translate(${n1(x)} ${n1(g + 4)}) scale(${k})"><rect x="-22" y="-28" width="44" height="28" rx="4" style="fill:${art('sandLit')};stroke:${INK};stroke-width:2.5"/><path d="M-30 -26L0 -50L30 -26Z" style="fill:${art('soilTop')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/></g>`;
    s += hut(W * 0.76, 1) + hut(W * 0.92, 0.84) + svgTree(W * 0.66, g + 6, 0.8, { kind: 'palm', seed: 4 });
    s += arrow(W * 0.02, g - 90, W * 0.2, g - 90, { w: 10 });
    s += tag(W * 0.5, 26, 'Barrier against wind and sand', { size: 14 }) + tag(W * 0.28, 64, 'Shelter from sea winds', { size: 14 });
    s += tag(W * 0.72, 102, 'Tourists and sports', { size: 14 }) + tag(W * 0.5, H - 22, 'Sand for building', { size: 14 });
    return { svg: world('dc', W, H, s) };
  }
  animate(st, t) {
    if (this.stepIndex !== 0 || !this.isPlaying()) return;
    const W = st.W, H = st.H - 62, g = H * 0.8, h = H * 0.34, w = W * 0.72, cx = W * 0.44 + this._go * W * 0.1, lv = this.live;
    for (let i = 0; i < 10; i++) {
      const u = (t * 0.45 + i * 0.1) % 1, x = cx - w * 0.72 + u * (w * 1.02);
      lv.attrs(lv.shape(`g${i}`, 'circle'), { cx: n1(x), cy: n1(this._top(x, cx, w, g, h) - 5), r: 3.2, style: `fill:${art('sandDark')};stroke:${SNOW};stroke-width:1` });
    }
  }
}
