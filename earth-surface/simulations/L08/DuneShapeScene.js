// DuneShapeScene - dunes from above, with the wind drawn. blk-l08-s05, 5 beats.
// 0 barchan, horns downwind. 1 ridges across or along (Across, Along). 2 star. 3 parabolic: plants hold the
// arms, the bare nose moves on (Blow), so the arms point upwind. 4 all five, tap a name.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { LAND_CSS, world, bar, bindActs, tag, lead, tween, stopTween, tweening, ease, n1 } from './LandDraw.js';
import { floor, barchan, ridge, star, parabolic, wind } from './DuneDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2), S(3), S(4)];
const NAMES = ['Barchan', 'Transverse', 'Longitudinal', 'Star', 'Parabolic'];
const CHIPS = NAMES.map((n, i) => ({ id: n, label: n, targets: [n], tone: i + 1 }));

export class DuneShapeScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Dunes seen from above with the wind drawn. Barchans are crescents with horns pointing downwind. Transverse dunes are long ridges across the wind and longitudinal dunes are long ridges along it. A star dune has arms round a high point, with winds from many sides. A parabolic dune is held by plants on its arms while its nose moves downwind, so its arms point upwind.';
  static CONTROLS = [];
  static HEIGHT = 540;
  tl = tapLight({ label: 'Dunes', chips: CHIPS, onChange: () => this.repaint() });
  css() { return LAND_CSS + '.sim-dom-root:not(.sim-dom-root--portrait) .tl-chip { padding-left: 6px; padding-right: 6px; }'; }
  stageHeight(st) { return st.portrait ? (this.stepIndex === 4 ? 470 : 430) : this.stepIndex === 4 ? 400 : 430; }
  async setup() {
    this._along = false; this._go = 0;
    await super.setup();
    this.tl.mount(this.root, this);
    this._off = bindActs(this, (a) => {
      if (a === 'across') this._along = false;
      if (a === 'along') this._along = true;
      if (a === 'blow') { this._go = 0; tween(this, 2.2, (u) => { this._go = ease(u); }); }
    });
    this.enter(this.stepIndex);
  }
  destroy() { stopTween(this); this._off?.(); this.tl.destroy(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) {
    stopTween(this);
    this._along = false; this._go = step === 3 ? 1 : 0;
    if (!this.tl) return;
    this.tl.set({ lit: null });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step !== 4;
  }
  _ctl() { return [1, 3].includes(this.stepIndex) ? 62 : 0; }
  _ridges(x, y, w, h, along) {
    let s = '';
    if (along) { for (let i = 0; i < 4; i++) s += ridge(x + 6, x + w - 6, y + h * (0.14 + i * 0.24), Math.min(16, h * 0.08), i + 2); return s; }
    for (let i = 0; i < 4; i++) s += `<g transform="translate(${n1(x + w * (0.14 + i * 0.24))} ${n1(y + h / 2)}) rotate(90)">${ridge(-h / 2 + 6, h / 2 - 6, 0, Math.min(16, w * 0.04), i + 5)}</g>`;
    return s;
  }
  paint(st) {
    const W = st.W, H = st.H - this._ctl(), step = this.stepIndex;
    const a = Math.min(120, W * 0.3);
    if (step === 4) return { svg: this._all(W, H) };
    let s = floor(0, 0, W, H, { n: 24 }), over = '';
    if (step === 0) {
      const k = Math.min(1.25, W / 340);
      s += barchan(W * 0.36, H * 0.56, k) + barchan(W * 0.72, H * 0.34, k * 0.72) + barchan(W * 0.78, H * 0.8, k * 0.55);
      s += wind(W * 0.04, H * 0.1, W * 0.04 + a, H * 0.1) + tag(W * 0.04 + a + 34, H * 0.1, 'Wind', { size: 15 });
      s += tag(W * 0.44, H * 0.93, 'Horns point downwind', { size: 15 }) + lead(W * 0.42, H * 0.88, W * 0.36 + 62 * k, H * 0.56 + 52 * k);
    } else if (step === 1) {
      s += this._ridges(0, 42, W, H - 42, this._along);
      s += wind(W * 0.04, 22, W * 0.04 + a, 22) + tag(W * 0.04 + a + 34, 22, 'Wind', { size: 15 });
      s += tag(W * 0.74, H - 24, this._along ? 'Longitudinal: along the wind' : 'Transverse: across the wind', { size: 14 });
      over = bar(H + 8, [{ label: 'Across', act: 'across', on: !this._along }, { label: 'Along', act: 'along', on: this._along }]);
    } else if (step === 2) {
      const k = Math.min(1.5, H / 300, W / 240), x = W / 2, y = H / 2;
      s += star(x, y, k);
      for (const [x0, y0, x1, y1] of [[10, H * 0.5, W * 0.2, H * 0.5], [W - 10, H * 0.72, W * 0.8, H * 0.66], [W * 0.5, 8, W * 0.5, H * 0.13], [W * 0.82, H - 10, W * 0.72, H * 0.88]]) s += wind(x0, y0, x1, y1);
      s += tag(W * 0.24, H * 0.1, 'Winds from many sides', { size: 14 }) + tag(W * 0.5, H - 22, 'Star dune', { size: 16 });
    } else {
      const k = Math.min(1.5, W / 300), x = W * 0.42, y = H * 0.52, go = this._go * W * 0.17;
      s += `<g opacity="0.4">${parabolic(x, y, k, 0)}</g>` + parabolic(x, y, k, go);
      s += wind(W * 0.04, H * 0.08, W * 0.04 + a, H * 0.08) + tag(W * 0.04 + a + 34, H * 0.08, 'Wind', { size: 15 });
      s += tag(W * 0.26, H * 0.93, 'Plants hold the arms', { size: 15 });
      s += tag(W * 0.74, H * 0.2, 'Bare nose moves on', { size: 15 }) + lead(W * 0.74, H * 0.25, x + (62 * k + go) * 0.9, y - 34 * k);
      over = bar(H + 8, [{ label: 'Blow', act: 'blow', disabled: tweening(this) }]);
    }
    return { svg: world('du', W, H, s), over };
  }
  _all(W, H) {
    const cols = W < 420 ? 2 : 3, rows = Math.ceil(5 / cols), g = 8, cw = (W - g * (cols - 1)) / cols, ch = (H - g * (rows - 1)) / rows;
    let out = '';
    NAMES.forEach((n, i) => {
      const x = (i % cols) * (cw + g), y = Math.floor(i / cols) * (ch + g), k = Math.min(cw / 190, ch / 170), cx = x + cw / 2, cy = y + ch / 2 + 6;
      const off = this.tl.off(n);
      let m = floor(x, y, cw, ch, { n: 5, seed: i + 3 });
      if (n === 'Barchan') m += barchan(cx, cy, k * 0.76);
      if (n === 'Transverse') m += this._ridges(x, y + 22, cw, ch - 26, false);
      if (n === 'Longitudinal') m += this._ridges(x, y + 22, cw, ch - 26, true);
      if (n === 'Star') m += star(cx, cy, k * 0.7);
      if (n === 'Parabolic') m += parabolic(cx - 6 * k, cy, k * 0.76, 10);
      if (n !== 'Star') m += wind(x + 10, y + 16, x + 58, y + 16, { w: 6 });
      m += tag(cx, y + ch - 17, n, { size: 14 });
      out += `<g style="${off ? 'opacity:0.25' : ''}"><clipPath id="dc${i}"><rect x="${n1(x)}" y="${n1(y)}" width="${n1(cw)}" height="${n1(ch)}" rx="12"/></clipPath><g clip-path="url(#dc${i})">${m}</g><rect x="${n1(x + 1)}" y="${n1(y + 1)}" width="${n1(cw - 2)}" height="${n1(ch - 2)}" rx="12" style="fill:none;stroke:var(--sim-stroke);stroke-width:2.5"/></g>`;
    });
    return out;
  }
}
