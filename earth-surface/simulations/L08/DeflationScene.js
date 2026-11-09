// DeflationScene - a cut through a desert floor (Fig 2.22). Wind blows loose sand off, a hollow deepens,
// wet sand at the water table stops it and an oasis grows; elsewhere a stony pavement is left.
// Stage 0 hollow, 1 down to the water, 2 desert pavement, 3 people at the oasis.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, arrow, tween, stopTween, tweening, ease, seeded, under, grains, svgSand, svgWater, svgTree, svgGrass, svgBoulder, svgSun, polyD, n1, INK } from './LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2), S(3)];
const bowl = (x, cx, hw, d) => { const q = (x - cx) / hw; return Math.abs(q) >= 1 ? 0 : d * (1 - q * q) ** 1.6; };

export class DeflationScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A cut through a desert floor. Wind blows loose sand away and a shallow hollow forms. The hollow deepens down to the wet ground at the water table, where it stops, and palm trees grow around the water. In another place, wind removes the fine grains and stones settle into a flat pavement.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._d = 0; this._p = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'blow') this._blow(); if (a === 'fine') this._fine(); });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) {
    stopTween(this);
    this._d = step === 0 ? 0 : 1; this._p = 1;
    if (step === 0) this._blow();
    if (step === 2) this._fine();
  }
  _blow() { this._d = 0; tween(this, 2.4, (u) => { this._d = 0.56 * ease(u); }); }
  _fine() { this._p = 0; tween(this, 2.4, (u) => { this._p = ease(u); }); }
  paint(st) { return this.stepIndex === 2 ? this._pave(st) : this._cut(st); }
  _cut(st) {
    const W = st.W, step = this.stepIndex, H = st.H - (step === 0 ? 62 : 0), g = H * 0.4, wt = H * 0.68, cx = W * 0.5, hw = W * 0.4, D = wt - g + 38;
    const top = (x) => g + Math.sin(x * 0.02) * 3 + bowl(x, cx, hw, D * this._d);
    let s = step === 3 ? svgSun(50, 44, 0.5, { rays: false }) : '';
    s += svgSand(under((x) => g - 52 - Math.sin(x * 0.01 + 1) * 22, -10, W + 10, H, 16), { seed: 3 });
    s += `<rect x="0" y="${n1(g - 20)}" width="${W}" height="${n1(H)}" style="fill:${art('sandDark')};opacity:0.28"/>`;
    // the wet ground below the water table
    s += svgSand(under(top, -10, W + 10, H + 10, 8), { seed: 5, ripples: true });
    s += `<path d="${polyD(under((x) => Math.max(wt, top(x)), -10, W + 10, H + 10, 8), true)}" style="fill:${art('seaMid')};opacity:0.52"/>`;
    const atWater = this._d > 0.97;
    if (atWater) {
            const inPool = under(top, cx - hw, cx + hw, wt, 6).slice(0, -2).filter((p) => p[1] > wt);
      s += svgWater([[inPool[0][0] - 3, wt], [inPool[inPool.length - 1][0] + 3, wt], ...inPool.reverse()], { ripples: 2 });
      s += svgTree(cx - hw * 0.74, top(cx - hw * 0.74) + 3, 1.0, { kind: 'palm', seed: 3 }) + svgTree(cx + hw * 0.76, top(cx + hw * 0.76) + 3, 1.15, { kind: 'palm', seed: 5, flip: true }) + svgTree(cx + hw * 0.92, top(cx + hw * 0.92) + 3, 0.8, { kind: 'palm', seed: 6 });
      s += svgGrass(cx - hw * 0.9, top(cx - hw * 0.9), cx - hw * 0.66, top(cx - hw * 0.66), { seed: 3, n: 5 }) + svgGrass(cx + hw * 0.66, top(cx + hw * 0.66), cx + hw * 0.88, top(cx + hw * 0.88), { seed: 4, n: 5 });
    }
    s += `<path d="M0 ${n1(wt)}H${W}" style="stroke:${art('seaDeep')};stroke-width:3;stroke-dasharray:12 8"/>`;
    if (step === 3) {
      const hut = (x, k) => { const y = top(x) + 2; return `<g transform="translate(${n1(x)} ${n1(y)}) scale(${k})"><rect x="-24" y="-30" width="48" height="30" rx="4" style="fill:${art('sandLit')};stroke:${INK};stroke-width:2.5"/><path d="M-32 -28L0 -54L32 -28Z" style="fill:${art('soilTop')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/><rect x="-7" y="-20" width="14" height="20" rx="3" style="fill:${art('soilDark')}"/></g>`; };
      s += hut(W * 0.08, 0.9) + hut(W * 0.93, 0.8);
      s += tag(W * 0.17, g - 80, 'Village', { size: 15 }) + tag(cx, wt + 56, 'Water close to the surface', { size: 15 });
      s += tag(W * 0.76, g - 96, 'Palms and crops', { size: 15 });
    }
    if (step <= 1) s += arrow(W * 0.05, g - 74, W * 0.05 + Math.min(130, W * 0.34), g - 74, { w: 10 }) + tag(W * 0.05 + 46, g - 106, 'Wind', { size: 15 });
    if (step === 0 && this._d > 0.5) s += tag(cx, g + 96, 'Deflation hollow', { size: 15 });
    if (step === 0 && this._d > 0.1) s += grains(W * 0.56, g - 70, W * 0.4, 70, 34, { seed: 7, r: 1.6, r2: 3, col: art('sandDark') }) + tag(W * 0.8, g - 94, 'Blown sand', { size: 14 });
    if (step === 0) s += tag(W * 0.5, H - 26, 'Wet ground below', { size: 14 });
    if (step === 1) { s += tag(W * 0.5, wt + 62, 'Water table', { size: 16, col: art('seaFar') }) + tag(W * 0.74, g - 104, 'Oasis', { size: 17 }) + lead(W * 0.74, g - 88, W * 0.68, top(W * 0.68) - 50); }
    return { svg: world('df', W, H, s), over: step === 0 ? bar(H + 8, [{ label: 'Blow the sand away', act: 'blow', disabled: tweening(this) }]) : '' };
  }
  _pave(st) {
    // A close look at a hand's width of ground: fine grains leave, stones drop together.
    const W = st.W, H = st.H - 62, p = this._p, base = H * 0.86, topY = H * 0.34 + p * H * 0.3;
    let s = `<rect x="0" y="${n1(topY - 90)}" width="${W}" height="${n1(H)}" style="fill:${art('skyLow')};opacity:0.5"/>`;
    s += svgSand([[-10, topY], [W + 10, topY], [W + 10, H + 10], [-10, H + 10]], { seed: 6, dark: true });
    const r = seeded(4), n = Math.round(W / 30), rows = 3;
    for (let k = 0; k < rows; k++) for (let i = 0; i < n; i++) {
      const x = (i + 0.5 + (k % 2) * 0.5) * W / n + (r() - 0.5) * 8;
      const y0 = topY + 14 + (r() * 0.9 + k * 0.7) * (base - topY) * 0.46;      // scattered through the sand
      const y1 = topY + 12 + k * 15 + r() * 5;                                  // packed at the new surface
      s += svgBoulder(x, y0 + (y1 - y0) * p, 0.34 + r() * 0.22, { seed: i + k * 7 + 2 });
    }
    if (p < 0.98) s += grains(W * 0.3, topY - 80, W * 0.68, 70, 40, { seed: 3, r: 1.4, r2: 2.4, col: art('sandDark') });
    s += arrow(W * 0.04, H * 0.13, W * 0.04 + Math.min(130, W * 0.34), H * 0.13, { w: 10 }) + tag(W * 0.04 + 46, H * 0.13 + 32, 'Wind', { size: 15 });
    if (p > 0.9) s += tag(W * 0.62, topY - 30, 'Desert pavement', { size: 17 });
    else s += tag(W * 0.66, H * 0.13, 'Fine grains blow away', { size: 14 });
    return { svg: world('dp', W, H, s), over: bar(H + 8, [{ label: 'Blow the fine grains away', act: 'fine', disabled: tweening(this) }]) };
  }
}
