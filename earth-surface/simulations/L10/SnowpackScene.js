// SnowpackScene - a snow slope from the side. blk-l10-s04, 3 beats. 0 Heavy snow: new snow loads a weak layer.
// 1 Warm spell, Strong wind, Disturbance: each shows its own change; Disturbance releases the slab.
// 2 what helps: snow fences on the slope, a tunnel for the road. No person is drawn; a track stands for a skier.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, svgRock, svgSnow, svgCloud, tween, stopTween, tweening, ease, polyD, seeded, n1, INK, SNOW } from '../L08/LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];

export class SnowpackScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A steep mountain slope with layers of snow. Heavy new snow loads a weak layer. A warm spell melts the top, strong wind piles snow unevenly, and a disturbance can release the slab, which slides down. Snow fences on the slope and a tunnel for the road reduce the danger.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._n = 0; this._m = ''; this._f = 0;
    await super.setup();
    this._off = bindActs(this, (a) => {
      if (a === 'snow') { const from = this._n >= 1 ? 0 : this._n; tween(this, 1.5, (u) => { this._n = from + (1 - from) * ease(u); }); }
      if (['warm', 'wind', 'dist'].includes(a)) {
        this._m = a; this._f = 0;
        if (a === 'dist') tween(this, 2, (u) => { this._f = ease(u); });
      }
    });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) { stopTween(this); this._n = step === 0 ? 0 : 1; this._m = step === 1 ? 'warm' : ''; this._f = 0; }
  paint(st) {
    const W = st.W, step = this.stepIndex, ctl = step === 2 ? 0 : step === 1 && W < 420 ? 116 : 62, H = st.H - ctl, road = H * 0.88;
    const a = [-10, H * 0.14], b = [W * 0.78, road], gy = (x) => a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]), f = this._f;
    let s = svgRock([a, [W * 0.2, gy(W * 0.2)], b, [W + 10, road], [W + 10, H + 10], [-10, H + 10]], { seed: 6, fill: 'slate', bands: ['slate', 'slateDark'], bandH: 40, dip: 24, cracks: 5 });
    s += svgCloud(W * 0.76, 44, 1.1, { seed: 3 });
    // three snow layers parallel to the ground: old base, weak layer, new snow
    const x0 = -10, x1 = W * 0.76, off = (x, t) => gy(x) - t * Math.min(1, Math.max(0.02, (x1 - x) / (W * 0.34)));
    const seg = (t0, t1, xa = x0, xb = x1) => { const u = [], l = []; for (let i = 0; i <= 12; i++) { const x = xa + (xb - xa) * i / 12; u.push([x, off(x, t1)]); l.push([x, off(x, t0)]); } return [...u, ...l.reverse()]; };
    s += svgSnow(seg(0, 34), { seed: 3, shade: true });
    s += `<path d="${polyD(seg(34, 42), true)}" style="fill:${art('iceShade')}"/>`;
    const nt = 44 + this._n * 44;
    if (f < 1) {
      const dx = f * W * 0.34, dy = dx * (b[1] - a[1]) / (b[0] - a[0]);
      s += `<g transform="translate(${n1(dx)} ${n1(dy)})">${svgSnow(seg(42, nt), { seed: 4 })}</g>`;
    } else {
      s += svgSnow(seg(42, 50, x0, W * 0.3), { seed: 4 });
      const r = seeded(4);
      s += svgSnow([[W * 0.58, road - 10], [W * 0.72, road - 74], [W * 0.92, road - 46], [W + 10, road - 10], [W + 10, road + 2], [W * 0.58, road + 2]], { seed: 8, shade: true });
      for (let i = 0; i < 7; i++) s += `<circle cx="${n1(W * 0.66 + r() * W * 0.26)}" cy="${n1(road - 30 - r() * 34)}" r="${n1(8 + r() * 8)}" style="fill:${SNOW};stroke:${art('snowEdge')};stroke-width:2"/>`;
    }
    s += `<rect x="${n1(W * 0.78)}" y="${n1(road)}" width="${n1(W)}" height="10" style="fill:${art('slateDark')}"/>`;
    const n = 14, m = this._m;
    if (step === 0) {
      if (this._n > 0.9) s += tag(W * 0.62, H * 0.26, 'Heavy new snow', { size: n }) + lead(W * 0.62, H * 0.31, W * 0.44, off(W * 0.44, nt - 12));
      s += tag(W * 0.34, H * 0.86, 'Weak layer', { size: n }) + lead(W * 0.34, H * 0.81, W * 0.34, off(W * 0.34, 38));
    }
    if (step === 1) {
      if (m === 'warm') s += tag(W * 0.62, H * 0.26, 'Top melts, friction falls', { size: n }) + `<path d="${polyD(seg(nt - 7, nt), true)}" style="fill:${art('sea')};opacity:0.7"/>`;
      if (m === 'wind') {
        s += `<path d="${polyD([[W * 0.3, off(W * 0.3, nt - 2)], [W * 0.42, off(W * 0.42, nt + 34)], [W * 0.58, off(W * 0.58, nt - 2)]], true)}" style="fill:${SNOW};stroke:${art('snowEdge')};stroke-width:2.5;stroke-linejoin:round"/>`;
        s += tag(W * 0.62, H * 0.26, 'Snow piled unevenly', { size: n });
      }
      if (m === 'dist') {
        if (f === 0) s += tag(W * 0.62, H * 0.26, 'A track across the slope', { size: n });
        if (f > 0.9) s += tag(W * 0.5, 30, 'The snow slides', { size: 16 });
        else s += `<path d="M${n1(W * 0.1)} ${n1(off(W * 0.1, nt))}L${n1(W * 0.36)} ${n1(off(W * 0.36, nt))}" style="fill:none;stroke:${INK};stroke-width:3;stroke-dasharray:9 6"/>`;
      }
    }
    if (step === 2) {
      for (const fx of [0.2, 0.32, 0.44]) { const x = W * fx, y = off(x, nt); s += `<path d="M${n1(x)} ${n1(y + 12)}V${n1(y - 26)}M${n1(x + 16)} ${n1(y + 18)}V${n1(y - 16)}M${n1(x - 5)} ${n1(y - 16)}L${n1(x + 21)} ${n1(y - 6)}M${n1(x - 5)} ${n1(y - 4)}L${n1(x + 21)} ${n1(y + 6)}" style="fill:none;stroke:${art('barkDark')};stroke-width:4;stroke-linecap:round"/>`; }
      s += tag(W * 0.62, H * 0.24, 'Snow fences', { size: 15 }) + lead(W * 0.62, H * 0.29, W * 0.47, off(W * 0.47, nt + 24));
      const tx = W * 0.84, ty = road;
      s += `<path d="M${n1(tx - 40)} ${n1(ty)}A40 40 0 0 1 ${n1(tx + 40)} ${n1(ty)}Z" style="fill:${art('rockDeep')};stroke:${INK};stroke-width:3"/>` + tag(W * 0.8, H * 0.7, 'Road tunnel', { size: 15 });
    }
    let over = '';
    if (step === 0) over = bar(H + 8, [{ label: 'Heavy snow', act: 'snow', disabled: tweening(this) }]);
    if (step === 1) over = bar(H + 8, [['Warm spell', 'warm'], ['Strong wind', 'wind'], ['Disturbance', 'dist']].map(([label, act]) => ({ label, act, on: m === act, disabled: tweening(this) })));
    return { svg: world('sn', W, H, s), over };
  }
}
