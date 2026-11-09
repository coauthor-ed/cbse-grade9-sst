// VvsUShapeScene - one valley seen end-on. Predict: the river's V. Let the ice flow: ice fills the valley, the walls and
// floor are cut back, the ice melts and a U is left. Beat 2 adds a hanging valley high on the right wall with a stream.
// Beat 3 lets the sea in: a fjord. Stages: 0 press to change V to U; 1 hanging valley; 2 fjord; 3 predict.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgRock, svgSnow, svgWater, svgGrass } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { iceBody } from './IceArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, clamp, lerp } from '../L04/EarthBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 3, dwellMs: null }]];
const N = 28;
// floor height of the valley at u (0..1 across), 0 at the rim and 1 at the deepest point
const vee = (u) => 1 - Math.abs(u - .5) * 2.04;
const you = (u) => { const d = Math.abs(u - .5) / .46; return d >= 1 ? 0 : Math.pow(1 - Math.pow(d, 4.2), .5) * 1.16; };

export class VvsUShapeScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP, 1: MAP1 };
  static WIDTH = 620;
  static HEIGHT = 450;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static ARIA_LABEL = 'A valley seen end-on. A river valley shaped like a V fills with ice. When the ice melts the valley has a wide floor and steep sides, a U shape. A small side valley is left hanging, and the sea can flood the valley to make a fjord.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 370 : 350; }

  enter(stage) {
    this._stage = stage; this._k = stage === 0 || stage === 3 ? 0 : 1; this._ice = 0; this._sea = 0; this._fresh = true; this.stopTween();
    this._ctl();
  }
  _ctl() {
    const s = this._stage;
    if (s === 0) this.bar([{ id: this._k >= 1 ? 'back' : 'go', label: this._k >= 1 ? 'Start again' : 'Let the ice flow', go: this._k < 1, off: !!this._tw }]);
    else if (s === 2) this.bar([{ id: 'sea', label: 'Let the sea in', go: true, off: this._sea >= 1 || !!this._tw }]);
    else this.bar([]);
  }
  control(id) {
    if (this._tw) return;
    if (id === 'back') { this._k = 0; this._ctl(); this.repaint(); return; }
    if (id === 'sea') {
      this.tween(0, 1, 2, (v) => { this._sea = v; }, () => { this._ctl(); if (!this._cel2) { this._cel2 = true; this.celebrate(); this.repaint(); } });
      this._ctl(); return;
    }
    this.tween(0, 1, 3.6, (v) => { this._ice = clamp(v / .25) * (1 - clamp((v - .75) / .25)); this._k = clamp((v - .15) / .6); }, () => {
      this._k = 1; this._ice = 0; this._ctl();
      if (!this._cel) { this._cel = true; this.celebrate(); this.repaint(); }
    });
    this._ctl();
  }

  paint(st) {
    const W = st.W, H = st.H, s = this._stage, top = H * .22, dep = H * .6, k = this._k;
    const fy = (u) => top + dep * lerp(vee(clamp(u)), you(clamp(u)), k) * (u < 0 || u > 1 ? 0 : 1);
    const prof = [];
    for (let i = 0; i <= N; i++) { const u = i / N; prof.push([u * W, fy(u)]); }
    let b = svgCloud(W * .3, 40, .62, { seed: 3 }) + svgCloud(W * .76, 30, .5, { seed: 7 });
    // far wall of the valley, for depth
    b += `<path d="M0 ${top + 20}L${W * .22} ${top + dep * .3}L${W * .5} ${top + dep * .42}L${W * .78} ${top + dep * .3}L${W} ${top + 20}V${H}H0Z" style="fill:${ec('rockLit')};opacity:.7"/>`;
    if (this._sea > 0) { const y = lerp(top + dep * 1.02, top + dep * .38, this._sea); b += svgWater([[0, y], [W, y], [W, H + 10], [0, H + 10]], { t: 2, ripples: 5, deep: .7 }); }
    const ice = this._ice;
    if (ice > 0) {
      const lev = lerp(top + dep * 1.02, top + dep * .08, ice), q = prof.filter((p) => p[1] > lev);
      if (q.length > 2) b += iceBody([[q[0][0], lev], ...q, [q[q.length - 1][0], lev]], [], { curve: false });
    }
    // one piece of rock: shoulders, the valley's own profile, shoulders
    const inner = prof.slice(1, N);
    b += svgRock([[-10, top - 42], [W * .08, top - 58], [W * .16, top - 26], [W * .03, top], ...inner, [W * .97, top], [W * .84, top - 24], [W * .92, top - 60], [W + 10, top - 46], [W + 10, H + 10], [-10, H + 10]], { seed: 6, fill: 'rock', cracks: 9, grain: true, outline: true, lit: true });
    b += svgSnow([[-10, top - 44], [W * .08, top - 58], [W * .14, top - 34], [W * .06, top - 30]], { seed: 2 }) + svgSnow([[W + 10, top - 48], [W * .92, top - 60], [W * .86, top - 30], [W * .94, top - 34]], { seed: 4 });
    if (this._sea <= 0 && !ice) {
      const mid = fy(.5);
      b += `<ellipse cx="${W / 2}" cy="${mid - 3}" rx="${lerp(12, 30, k)}" ry="6" style="fill:${ec('sea')};stroke:${ec('seaDeep')};stroke-width:2.5"/>`;
      if (k >= 1) b += svgGrass(W * .22, mid - 3, W * .78, mid - 3, { seed: 3, n: 14, tall: 10 });
    }
    const p = this._fresh ? { pop: true } : {};
    if (s === 3) b += tag(W / 2, top + dep * .28 - 30, 'River valley', p);
    if (s === 0) b += tag(W / 2, top - 30 + 6, k >= 1 ? 'U-shaped valley' : ice > 0 ? 'Ice widens and deepens' : 'V-shaped river valley', {});
    if (s === 1) {
      // the side valley: the wall's rim is cut down to here, and its floor ends high above the main floor
      const wx = W * .9, hy = top + dep * .3;
      b += `<path d="M${wx} ${top - 70}H${W + 10}V${hy + 8}H${wx + 12}Q${wx + 2} ${hy + 8} ${wx} ${hy - 6}Z" style="fill:url(#vu-sky)"/><path d="M${wx} ${hy - 6}Q${wx + 2} ${hy + 8} ${wx + 12} ${hy + 8}H${W + 10}" style="fill:none;stroke:${ec('rockDeep')};stroke-width:3.5"/>`;
      const fall = [[W + 6, hy + 4], [wx + 8, hy + 4], [wx - 8, hy + 22], [wx - 12, top + dep * .9], [W * .8, top + dep * 1.1]];
      b += strand(fall, 'seaDeep', 8) + strand(fall, 'sea', 4.5);
      b += pointer(W * .58, top - 30, wx + 18, hy - 2, {}) + tag(W * .52, top - 30, 'Hanging valley', p) + tag(W * .42, top + dep * .6, 'Main floor lies far below', { ...p, delay: .1, size: 14 });
    }
    if (s === 2) b += tag(W / 2, top - 22, this._sea >= 1 ? 'Fjord: a deep, narrow sea inlet' : 'U-shaped valley at the coast', { size: 15 });
    this._fresh = false;
    return { svg: world(st, 'vu', b) };
  }
}
