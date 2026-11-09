// WindDeskScene - the desert floor from the side. blk-l08-s01 (3 beats) and blk-l08-s09 (2 beats).
// Stage 0 calm, 1 the wind (Calm, Breeze, Strong), 2 the stones left behind, 3 a wall of dust, 4 the agents so far.
// Rule drawn: dust goes high and far, sand hops about a metre, gravel stays. Breeze moves dust only.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, arrow, grains, under, seeded, svgSand, svgBoulder, svgTree, svgGrass, svgSun, n1, INK, SNOW } from './LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];
const LEVELS = [['Calm', 0], ['Breeze', 1], ['Strong', 2]];
const AGENTS = ['Running water', 'Waves', 'Glaciers', 'Wind'];

export class WindDeskScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP, 2: [S(3), S(4)] };
  static ARIA_LABEL = 'A desert floor seen from the side, with a shrub, dust, sand, gravel and a rock. With no wind nothing moves. A breeze lifts dust. A strong wind lifts dust high, makes sand grains hop about a metre, and leaves gravel where it lies.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return st.portrait ? 440 : 430; }
  async setup() {
    this._wind = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a.startsWith('w')) { this._wind = Number(a.slice(1)); this.clockReset(); if (this._wind) this.play(3); } });
  }
  destroy() { this._off?.(); super.destroy(); }
  enter(step) { this._wind = step === 1 ? 2 : 0; if (step === 1 || step === 3) this.play(3); }
  _floor(H) { return H * 0.72; }
  paint(st) {
    const W = st.W, step = this.stepIndex, ctl = step === 1 ? 62 : 0, H = st.H - ctl, g = this._floor(H), wind = step === 3 ? 2 : this._wind;
    const fy = (x) => g + Math.sin(x * 0.012 + 1) * 5;
    const farY = (x) => g - 44 - Math.sin(x * 0.009 + 0.5) * 30 - Math.sin(x * 0.021) * 10;
    let s = svgSun(66, 60, 0.62, { rays: false });
    s += svgSand(under(farY, -10, W + 10, g + 20, 14), { seed: 4, ripples: true });
    const stripped = step === 2;
    s += svgSand(under(fy, -10, W + 10, H + 10, 14), { seed: 7, ripples: !stripped, dark: stripped });
    s += svgTree(W * 0.14, fy(W * 0.14) + 3, 1.1, { kind: 'round', seed: 5, sway: wind ? wind * 3 : 0 }) + svgGrass(W * 0.04, fy(W * 0.04) + 2, W * 0.27, fy(W * 0.27) + 2, { seed: 3, n: 9 });
    const bx = W * 0.72;
    s += svgBoulder(bx + W * 0.12, fy(bx) + 16, 1.5, { seed: 6 });
    // gravel: always there, more of it shows once the fine grains have gone
    const r = seeded(9), n = stripped ? 34 : 9, x0 = stripped ? W * 0.02 : W * 0.5, x1 = stripped ? W * 0.98 : W * 0.72;
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0); s += svgBoulder(x, fy(x) + 7 + r() * (stripped ? 44 : 22), 0.26 + r() * 0.3, { seed: i + 2 }); }
    if (!stripped && step !== 4) s += grains(W * 0.3, g + 18, W * 0.34, 40, 44, { seed: 5, r: 1.2, r2: 2.2, col: art('sandDark') });
    let over = '', top = '';
    if (wind >= 1 && step !== 2) {
      // the dust: a soft plume rising to the right; the strong wind lifts more, higher
      const hi = wind === 2 ? 0.14 : 0.42, k = wind === 2 ? 1 : 0.55;
      for (let i = 0; i < 7; i++) {
        const u = i / 6, x = W * (0.14 + u * 0.72), y = g - 26 - (g - H * hi) * u, rr = (34 + u * 54) * (step === 3 ? 1.5 : 1);
        top += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(Math.max(4, Math.min(rr, W - x - 2, y - 2)))}" style="fill:${art('sandLit')};opacity:${n1(0.3 * k)}"/>`;
      }
      if (step === 3) top += `<path d="${under((x) => H * 0.2 + Math.sin(x * 0.02) * 26 + Math.sin(x * 0.05) * 9, -10, W + 10, H + 10, 14).reduce((d, p, i) => `${d}${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`, '')}Z" style="fill:${art('sandDark')};opacity:0.62"/>`;
    }
    if (wind === 2 && step === 1) for (const [x, w] of [[0.3, 0.13], [0.45, 0.11], [0.58, 0.14]]) {
      const a = W * x, b = a + W * w;
      top += `<path d="M${n1(a)} ${n1(fy(a))}Q${n1((a + b) / 2)} ${n1(g - 70)} ${n1(b)} ${n1(fy(b))}" style="fill:none;stroke:${INK};stroke-width:2.5;stroke-dasharray:3 8;stroke-linecap:round"/>`;
    }
    s += top;
    if (wind) s += arrow(W * 0.06, H * 0.12 + 40, W * 0.06 + Math.min(150, W * 0.3) * (wind === 2 ? 1 : 0.6), H * 0.12 + 40, { w: wind === 2 ? 12 : 8 });
    const lab = (x, y, t, o) => { s += tag(x, y, t, o); };
    if (step === 1 && wind >= 1) lab(W * 0.68, H * 0.13, 'Dust: high and far');
    if (step === 1 && wind === 2) lab(W * 0.42, g - 88, 'Sand hops about 1 m');
    if (step === 1 || step === 0) lab(W * 0.61, g + 58, 'Gravel stays');
    if (step === 0) { lab(W * 0.37, g + 26, 'Loose sand'); lab(W * 0.2, H - 24, 'Few roots'); }
    if (step === 2) lab(W * 0.5, H - 28, 'Stones left on the surface');
    if (step === 3) lab(W * 0.5, H * 0.13, 'Dust hides the sky', { size: 17 });
    if (step === 4) {
      const h = 42, y0 = 26;
      AGENTS.forEach((a, i) => { s += tag(W / 2, y0 + i * (h + 6) + 16, a, { size: 17, col: art('sandLit') }); });
      s += tag(W / 2, y0 + 4 * (h + 6) + 16, 'A fifth agent, under the ground', { size: 15, col: art('seaFar') });
    }
    if (step === 1) over = bar(H + 8, LEVELS.map(([label, v]) => ({ label, act: `w${v}`, on: this._wind === v })));
    return { svg: world('wd', W, H, s), over };
  }
  animate(st, t) {
    const step = this.stepIndex, wind = step === 3 ? 2 : this._wind;
    if (step !== 1 && step !== 3) return;
    if (!wind) return;
    const W = st.W, H = st.H - (step === 1 ? 62 : 0), g = this._floor(H), lv = this.live;
    // Sand: grains on repeated low hops, strong wind only. Dust: specks rising to the right.
    if (wind === 2) for (let i = 0; i < 16; i++) {
      const u = (t * 0.55 + i * 0.137) % 1, x0 = W * (0.1 + (i % 8) * 0.09) + u * W * 0.1, y = g + 2 - Math.sin(u * Math.PI) * (58 + (i % 3) * 8);
      lv.attrs(lv.shape(`s${i}`, 'circle'), { cx: n1(x0), cy: n1(y), r: 3, style: `fill:${art('sandDark')};stroke:${SNOW};stroke-width:1` });
    }
    const hi = wind === 2 ? 0.1 : 0.4;
    for (let i = 0; i < 22; i++) {
      const u = (t * 0.28 + i * 0.0731) % 1, x = W * (0.1 + (i % 7) * 0.07) + u * W * 0.44, y = g - 10 - (g - H * hi) * u * (0.55 + (i % 4) * 0.15);
      lv.attrs(lv.shape(`d${i}`, 'circle'), { cx: n1(x), cy: n1(y), r: 1.8, style: `fill:${art('sandDark')};opacity:0.75` });
    }
  }
}
