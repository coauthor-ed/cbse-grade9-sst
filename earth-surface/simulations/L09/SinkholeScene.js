// SinkholeScene - flat ground over a cavity. blk-l09-s04, 3 beats (Fig 2.25). 0 More years: the cavity grows, the
// roof thins. 1 the roof falls, a sinkhole or doline opens, rubble below. 2 a block of land with many sinkholes.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, svgRock, svgSoil, svgGrass, svgBoulder, roughen, seeded, under, tween, stopTween, tweening, ease, n1, polyD, INK } from '../L08/LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];

export class SinkholeScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Flat ground above limestone with a cavity below. The cavity grows and its rock roof gets thinner until it falls in, leaving a bowl-shaped sinkhole at the surface with rubble at the bottom. A block of land shows many sinkholes side by side.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._c = 0.25; this._f = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'yrs') { const from = this._c >= 1 ? 0.25 : this._c, to = Math.min(1, from + 0.375); tween(this, 1.2, (u) => { this._c = from + (to - from) * ease(u); }); } });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) {
    stopTween(this);
    this._c = 1; this._f = 1;
    if (step === 0) { this._c = 0.25; this._f = 0; }
    if (step === 1) { this._f = 0; tween(this, 1.6, (u) => { this._f = u * u; }); }
  }
  paint(st) { return this.stepIndex === 2 ? this._block(st) : this._cut(st); }
  _cut(st) {
    const W = st.W, step = this.stepIndex, H = st.H - (step === 0 ? 62 : 0), g = H * 0.26, c = this._c, f = this._f, cx = W * 0.5;
    const ry = H * (0.1 + 0.2 * c), rx = W * (0.14 + 0.24 * c), cy = H * 0.7 - (ry - H * 0.1) * 0.55, roofY = cy - ry;
    const opened = f >= 1, hw = rx * 0.82;
    const top = (x) => { const q = (x - cx) / hw; return g + (Math.abs(q) < 1 ? f * (roofY + ry * 1.5 - g) * (1 - q * q) ** 0.8 : 0); };
    let s = svgRock(under(top, -10, W + 10, H + 10, 6), { seed: 5, bands: ['sandLit', 'rockLit', 'sandLit', 'rockLit'], bandH: 42, warp: 3, cracks: 6 });
    const skin = under(top, -10, W + 10, 0, 6).slice(0, -2);
    s += svgSoil([...skin, ...skin.slice().reverse().map(([x, y]) => [x, y + 14])], { seed: 4, top: 7 });
    s += svgGrass(4, g, cx - hw - 6, g, { seed: 2, n: 8 }) + svgGrass(cx + hw + 6, g, W - 4, g, { seed: 3, n: 8 });
    if (!opened) {
      const pts = [];
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * (Math.sin(a) > 0 ? 0.8 : 1)]); }
      const R = roughen(pts, { seed: 6, amp: 5, step: 24 });
      if (f === 0) s += `<path d="${polyD(R, true)}" style="fill:${art('rockDeep')}"/>`;
      else {
        // the roof coming down in pieces
        s += `<path d="${polyD(R, true)}" style="fill:${art('rockDeep')};opacity:${n1(1 - f)}"/>`;
        const r = seeded(4);
        for (let i = 0; i < 9; i++) s += svgBoulder(cx + (r() - 0.5) * rx * 1.5, roofY + (cy + ry * 0.8 - roofY) * f * (0.6 + r() * 0.5) + 10, 0.7 + r() * 0.5, { seed: i + 2 });
      }
    } else {
      const r = seeded(7), b = top(cx);
      for (let i = 0; i < 11; i++) { const x = cx + (r() - 0.5) * hw * 1.1; s += svgBoulder(x, top(x) + 6 + r() * 6, 0.5 + r() * 0.5, { seed: i + 3 }); }
      s += tag(cx, b + 36, 'Fallen roof', { size: 14 });
    }
    if (step === 0) {
      s += tag(W * 0.5, cy + 4, 'Cavity', { size: 16, col: art('sandLit') });
      s += tag(W * 0.5, g + (roofY - g) / 2 + 2, c > 0.9 ? 'Thin roof' : 'Rock roof', { size: 14 });
      s += tag(W * 0.5, g - 34, 'Flat ground, nothing to see', { size: 14 });
    } else if (f > 0.9) s += tag(W * 0.5, 34, 'Sinkhole, or doline', { size: 17 });
    return { svg: world('sk', W, H, s), over: step === 0 ? bar(H + 8, [{ label: 'More years', act: 'yrs', disabled: tweening(this) }]) : '' };
  }
  _block(st) {
    const W = st.W, H = st.H, A = Math.min(W * 0.6, (H - 90) * 1.2), B = A * 0.72, c = 0.87, sn = 0.42, ox = (W - (A + B) * c) / 2, oy = H * 0.5 + (A - B) * sn * 0.5 - 14;
    const P = (a, b, z = 0) => [ox + a * A * c + b * B * c, oy - a * A * sn + b * B * sn + z];
    const dep = 52;
    let s = `<path d="${polyD([P(0, 1), P(1, 1), P(1, 1, dep), P(0, 1, dep)], true)}" style="fill:${art('sandDark')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/>`;
    s += `<path d="${polyD([P(0, 0), P(0, 1), P(0, 1, dep), P(0, 0, dep)], true)}" style="fill:${art('sandLit')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/>`;
    s += `<path d="${polyD([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], true)}" style="fill:${art('grass')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/>`;
    s += svgGrass(...P(0.1, 0.1), ...P(0.9, 0.2), { seed: 3, n: 12 }) + svgGrass(...P(0.1, 0.9), ...P(0.9, 0.84), { seed: 4, n: 12 });
    const pits = [[0.24, 0.3, 1], [0.6, 0.24, 0.72], [0.82, 0.56, 0.6], [0.5, 0.62, 1.15], [0.2, 0.74, 0.7], [0.82, 0.86, 0.5], [0.4, 0.12, 0.45], [0.74, 0.08, 0.42]];
    for (const [a, b, q] of pits) {
      const [x, y] = P(a, b), rx = A * 0.13 * q, ry = rx * 0.5;
      for (let i = 0; i < 4; i++) { const u = 1 - i * 0.24; s += `<ellipse cx="${n1(x)}" cy="${n1(y + i * ry * 0.14)}" rx="${n1(rx * u)}" ry="${n1(ry * u)}" style="fill:${[art('soil'), art('soilDark'), art('rockDark'), art('rockDeep')][i]};stroke:${INK};stroke-width:${i ? 0 : 2.5}"/>`; }
    }
    s += tag(W * 0.5, 30, 'Many sinkholes, side by side', { size: 15 });
    return { svg: world('sb', W, H, s) };
  }
}
