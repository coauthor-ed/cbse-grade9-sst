// GlacierFlowScene - a glacier in long section. Snow piles up, presses into ice, and the ice flows downhill by its own
// weight. A stake on the ice moves with it; the rate is shown, not measured. Stages: 0 Ten years pass; 1 rocks in the
// base scrape the bed, and the ice ends in a river. The slope and ice depth are stretched to be seen.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgRock, svgSnow, svgBoulder } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { iceBody } from './IceArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, arrow, lerp, INK, WHITE } from '../L04/EarthBits.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const MOVES = 4;

export class GlacierFlowScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 620;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static ARIA_LABEL = 'A glacier in side view. Snow high up presses into ice, and the ice flows slowly downhill by its own weight. Rocks frozen in its base scrape the land. At its end the ice melts into a river.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 370 : 340; }
  enter(stage) {
    this._stage = stage; this._s = stage ? MOVES : 0; this._fresh = true; this.stopTween();
    this._ctl();
  }
  _ctl() { this.bar(this._stage === 0 ? [{ id: 'go', label: 'Ten years pass', go: true, off: this._s >= MOVES }] : []); }
  control() {
    if (this._tw) return;
    const s0 = this._s;
    this.tween(s0, s0 + 1, .9, (v) => { this._s = v; }, () => { this._s = s0 + 1; this._ctl(); if (this._s >= MOVES && !this._cel) { this._cel = true; this.celebrate(); this.repaint(); } });
  }
  paint(st) {
    const W = st.W, H = st.H, s = this._stage, X = (u) => u * W, Y = (v) => v * H;
    const bed = [[-.02, .3], [.14, .36], [.34, .5], [.54, .62], [.72, .74], [.84, .78]], top = [[-.02, .14], [.14, .2], [.34, .32], [.54, .47], [.72, .63], [.8, .74], [.84, .78]];
    const P = (a) => a.map(([u, v]) => [X(u), Y(v)]);
    const at = (u) => { for (let i = 1; i < top.length; i++) if (top[i][0] >= u) { const a = top[i - 1], c = top[i], t = (u - a[0]) / (c[0] - a[0]); return Y(lerp(a[1], c[1], t)); } return Y(.78); };
    let b = svgCloud(X(.62), Y(.14), .7, { seed: 5 }) + svgCloud(X(.36), Y(.08), .5, { seed: 3 });
    b += svgRock([...P(bed), [X(1.02), Y(.8)], [X(1.02), H + 10], [X(-.02), H + 10]], { seed: 8, fill: 'rock', cracks: 7, grain: true, outline: true });
    b += iceBody([...P(top), ...P(bed).reverse()], P([[.04, .24], [.2, .32], [.36, .44], [.54, .57], [.7, .7]]), { spread: 1.6, curve: false });
    b += svgSnow(P([[-.02, .1], [.14, .16], [.3, .27], [.28, .31], [.14, .23], [-.02, .17]]), { seed: 5 });
    const river = P([[.84, .78], [.92, .8], [1.02, .8]]);
    b += strand(river, 'seaDeep', 16) + strand(river, 'sea', 11);
    const u = .22 + this._s * .085, sy = at(u);
    b += `<path d="M${X(u)} ${sy + 8}V${sy - 34}" style="stroke:${ec('barkDark')};stroke-width:6;stroke-linecap:round"/><path d="M${X(u)} ${sy - 34}l18 6l-18 6z" style="fill:${ec('flame')}"/>`;
    if (this._s > 0) b += `<path d="M${X(.22)} ${at(.22) + 8}V${at(.22) - 26}" style="stroke:${INK};stroke-width:3;stroke-dasharray:5 5"/>`;
    const p = this._fresh ? { pop: true } : {};
    if (s === 0) {
      b += tag(X(.2), 22, 'Snow piles up', p) + arrow(P([[.42, .5], [.56, .62]]), { c: WHITE, w: 7, rim: ec('iceCrack') });
      b += tag(X(.72), Y(.4), this._s ? 'The stake moved with the ice' : 'Stake on the ice', { ...p, size: 14 }) + tag(W / 2, Y(.92), 'Ice flows by its own weight', { ...p, delay: .1 });
    } else {
      for (const [a, c] of [[.3, .46], [.42, .56], [.54, .63], [.64, .69]]) b += svgBoulder(X(a), Y(c) + 2, .34, { seed: 3 + Math.round(a * 10) });
      for (const [a, c] of [[.3, .5], [.44, .6], [.58, .68]]) b += `<path d="M${X(a)} ${Y(c)}l26 14" style="stroke:${ec('rockDeep')};stroke-width:3.5;stroke-linecap:round"/>`;
      b += tag(W / 2, Y(.92), 'Rocks in the ice scrape the land', p) + pointer(X(.84), Y(.5), X(.93), Y(.79), {}) + tag(X(.8), Y(.47), 'Meltwater river', { ...p, delay: .1 });
    }
    this._fresh = false;
    return { svg: world(st, 'gf', b) };
  }
}
