// SlopeLoadScene - a hillside. blk-l10-s01, 3 beats. 0 the four disasters named. 1 rain: Dry, Light, Heavy; two bars,
// weight up and friction down as water soaks in. 2 Shake: loose rock moves. Bars show direction, not measurements.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, panel, svgCloud, svgRain, tween, stopTween, tweening, ease, n1 } from '../L08/LandDraw.js';
import { slopeOf, slopeBody, trees, looseRocks } from './SlopeDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];
const RAIN = [['Dry', 0], ['Light', 1], ['Heavy', 2]];

export class SlopeLoadScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A steep hillside above a road. Rain soaks into the soil: its weight bar rises and its friction bar falls. Shaking moves the loose rock on the slope.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._r = 0; this._s = 0; this._sh = 0;
    await super.setup();
    this._off = bindActs(this, (a) => {
      if (a.startsWith('r')) { const to = Number(a.slice(1)) / 2, from = this._s; this._r = to * 2; tween(this, 0.8, (u) => { this._s = from + (to - from) * ease(u); }); }
      if (a === 'shake') { this._sh = 0; tween(this, 1.2, (u) => { this._sh = u; }); }
    });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) { stopTween(this); this._r = step === 1 ? 2 : 0; this._s = step === 1 ? 1 : 0; this._sh = 0; }
  paint(st) {
    const W = st.W, step = this.stepIndex, H = st.H - (step === 0 ? 0 : 62), L = slopeOf(W, H, { steep: true }), sh = step === 2 ? this._sh : 0;
    const wob = sh > 0 && sh < 1 ? Math.sin(sh * 40) * 4 * (1 - sh) : 0;
    let s = `<g transform="translate(${n1(wob)} 0)">${slopeBody(L, { soak: this._s })}${trees(L, 3)}${looseRocks(L, 8, sh * 46)}</g>`;
    if (step === 0) {
      ['Landslide', 'Avalanche', 'GLOF', 'Dust storm'].forEach((t, i) => { const c = W < 420 ? 2 : 4, xs = (W - 16) / c; s += tag(8 + xs * ((i % c) + 0.5), 28 + Math.floor(i / c) * 36, t, { size: 15, col: i ? undefined : art('sandLit') }); });
    }
    if (step === 1) {
      if (this._r) s += svgCloud(W * 0.62, 48, 1.3, { kind: 'rain', seed: 4 }) + svgRain(W * 0.62, 54, 1, { w: W * 0.6, h: H * 0.5, heavy: this._r === 2 });
      const x = W < 420 ? W * 0.5 : W * 0.56, w = W - x - 10, y = H * 0.54, m = (l, v, col, yy) => panel(x, yy, w, 42, { r: 12 })
        + `<rect x="${n1(x + 8)}" y="${yy + 26}" width="${n1(w - 16)}" height="9" rx="4" style="fill:var(--sim-track)"/><rect x="${n1(x + 8)}" y="${yy + 26}" width="${n1((w - 16) * v)}" height="9" rx="4" style="fill:${col}"/>`
        + `<text x="${n1(x + 10)}" y="${yy + 19}" style="fill:var(--sim-label);font-size:14px;font-weight:800">${l}</text>`;
      s += m('Weight', 0.4 + this._s * 0.55, 'var(--sim-series-2)', y) + m('Friction', 0.85 - this._s * 0.62, 'var(--sim-series-3)', y + 52);
    }
    if (step === 2) s += tag(W * 0.74, H * 0.3, 'Steep slope', { size: 15 }) + tag(W * 0.68, H * 0.66 - 12, 'Loose rock', { size: 15 });
    let over = '';
    if (step === 1) over = bar(H + 8, RAIN.map(([label, v]) => ({ label, act: `r${v}`, on: this._r === v })));
    if (step === 2) over = bar(H + 8, [{ label: 'Shake', act: 'shake', disabled: tweening(this) }]);
    return { svg: world('sl', W, H, s), over };
  }
}
