// MoraineScene - two glaciers joining, from above. Till rides along the edges and down the join. Stages: 0 lateral;
// 1 medial, on the ice; 2 terminal, with Melt the ice; 3 ice gone, ridges remain; 4 the close, a lake behind a moraine.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec } from '../L04/EarthBits.js';
import { moraineSvg } from './IceArt.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 4, dwellMs: null }]];

export class MoraineScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 4: MAP, 1: MAP1 };
  static WIDTH = 560;
  static HEIGHT = 490;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static ARIA_LABEL = 'Two glaciers joining, seen from above. Loose rock lies along their sides, down the middle where they join, and in a ridge across the end. When the ice melts, the ridges remain.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 410 : 390; }
  enter(stage) {
    this._stage = stage; this._m = stage >= 3 ? 1 : 0; this._fresh = true; this.stopTween();
    this._ctl();
  }
  _ctl() { this.bar(this._stage === 2 ? [{ id: 'melt', label: 'Melt the ice', go: true, off: this._m > 0 }] : []); }
  control() {
    if (this._tw) return;
    this.tween(0, 1, 3, (v) => { this._m = v; }, () => { this._ctl(); if (!this._cel) { this._cel = true; this.celebrate(); this.repaint(); } });
    this._ctl();
  }
  paint(st) {
    const W = st.W, H = st.H, s = this._stage, X = (u) => u * W, Y = (v) => v * H, p = this._fresh ? { pop: true } : {};
    let b = moraineSvg(W, H, { melt: this._m, lit: ['lat', 'med', 'ter', null, null][s], lake: s === 4 });
    if (s === 0) b += pointer(X(.16), Y(.5), X(.3), Y(.46), {}) + tag(X(.18), Y(.5), 'Lateral', p) + pointer(X(.84), Y(.5), X(.7), Y(.46), {}) + tag(X(.84), Y(.5), 'Lateral', p);
    if (s === 1) b += pointer(X(.84), Y(.34), X(.51), Y(.42), {}) + tag(X(.8), Y(.34), 'Medial', p);
    if (s === 2) b += pointer(X(.84), Y(.72), X(.66), Y(.83), {}) + tag(X(.82), Y(.72), 'Terminal', p);
    if (s === 3) b += tag(X(.5), Y(.08), 'Ice gone, ridges remain', p) + tag(X(.17), Y(.5), 'Lateral', p) + tag(X(.84), Y(.72), 'Terminal', p) + tag(X(.5), Y(.6), 'Medial', p);
    if (s === 4) b += tag(X(.5), Y(.62), 'Lake', { ...p, fill: ec('seaDeep') }) + pointer(X(.84), Y(.72), X(.68), Y(.83), {}) + tag(X(.8), Y(.72), 'Moraine dam', p);
    this._fresh = false;
    return { svg: world(st, 'mr', b, { ground: 'rock' }) };
  }
}
