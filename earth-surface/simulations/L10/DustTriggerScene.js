// DustTriggerScene - a farm field from the side. blk-l10-s06, 3 beats. 0 Long drought: the field dries, plants thin.
// 1 Strong wind: loose soil lifts and a wall of dust crosses the land. 2 what helps: a belt of trees, ground cover.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, arrow, under, grains, svgSand, svgSoil, svgTree, svgGrass, svgSun, tween, stopTween, tweening, ease, polyD, seeded, n1 } from '../L08/LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];

export class DustTriggerScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A field from the side. Long drought dries the soil and thins the plants. Strong wind then lifts loose soil into a wall of dust that crosses the land. A belt of trees and ground cover protect the next field.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._d = 0; this._w = 0;
    await super.setup();
    this._off = bindActs(this, (a) => {
      if (a === 'dry') { const from = this._d >= 1 ? 0 : this._d; tween(this, 1.8, (u) => { this._d = from + (1 - from) * ease(u); }); }
      if (a === 'wind') { this._w = 0; tween(this, 3, (u) => { this._w = ease(u); }); }
    });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) { stopTween(this); this._d = step === 0 ? 0 : 1; this._w = step === 2 ? 0.55 : 0; }
  paint(st) {
    const W = st.W, step = this.stepIndex, ctl = step === 2 ? 0 : 62, H = st.H - ctl, g = H * 0.7, d = this._d, w = this._w;
    const fy = (x) => g + Math.sin(x * 0.01) * 4;
    let s = step === 2 || w > 0 ? '' : svgSun(52, 46, 0.56, { rays: false });
    const r = seeded(6);
    const dry = d > 0.5;
    s += dry ? svgSand(under(fy, -10, W + 10, H + 10, 12), { seed: 5, dark: true }) : svgSoil(under(fy, -10, W + 10, H + 10, 12), { seed: 5, stones: 6, top: 12 });
    if (dry) { let c = ''; for (let i = 0; i < 16; i++) { const x = r() * W, y = g + 16 + r() * (H - g - 22), a = 18 + r() * 24; c += `M${n1(x)} ${n1(y)}l${n1(a * 0.4)} ${n1(5)}l${n1(a * 0.3)} ${n1(-6)}l${n1(a * 0.4)} ${n1(4)}`; } s += `<path d="${c}" style="fill:none;stroke:${art('soilDark')};stroke-width:2.5;stroke-linecap:round;opacity:0.7"/>`; }
    // plants thin out as the drought goes on
    const n = Math.round(14 * (1 - d * 0.82));
    for (let i = 0; i < 14; i++) { const x = W * (0.05 + i * 0.066); if (step === 2 && x < W * 0.52) continue; s += i < n ? svgGrass(x - 12, fy(x) + 2, x + 12, fy(x) + 2, { seed: i + 2, n: 3, tall: 18 }) : svgTree(x, fy(x) + 3, 0.28, { kind: 'bare', seed: i }); }
    if (step === 2) {
      s += `<path d="${polyD(under(fy, W * 0.66, W + 10, H + 10, 12), true)}" style="fill:${art('grass')}"/>` + svgGrass(W * 0.7, fy(W * 0.7) + 2, W * 0.99, fy(W) + 2, { seed: 6, n: 12, tall: 16 });
    }
    if (w > 0) {
      // the wall of dust: tall at its front, moving right; stops at the tree belt on the last beat
      const front = step === 2 ? W * 0.42 : -W * 0.1 + w * W * 1.25;
      const pts = [[-20, g + 10], [-20, H * 0.12]];
      for (let x = -20; x <= front; x += 26) pts.push([x, H * 0.14 + Math.sin(x * 0.03) * 12 + (x / W) * 18]);
      pts.push([front + 16, H * 0.4], [front + 34, g + 4]);
      let wall = `<path d="${polyD(pts, true)}" style="fill:${art('sandDark')}"/>`;
      for (let i = 0; i < 6; i++) { const y = H * 0.18 + i * (g - H * 0.18) / 6, rr = 30 + (i % 2) * 8; wall += `<circle cx="${n1(Math.min(W - rr - 2, Math.max(rr, front + 8 + (i % 2) * 8)))}" cy="${n1(Math.max(rr + 2, y))}" r="${rr}" style="fill:${art('sandDark')}"/>`; }
      for (let x = 20; x < front - 10; x += 56) wall += `<circle cx="${n1(x)}" cy="${n1(H * 0.2)}" r="32" style="fill:${art('sandDark')}"/>`;
      s += `<g style="opacity:0.88">${wall}</g>`;
      s += grains(Math.max(0, front - 90), g - 90, 130, 90, 26, { seed: 3, r: 1.5, r2: 3, col: art('soilDark') });
    }
    if (step === 2) for (const x of [0.5, 0.56, 0.62, 0.68]) s += svgTree(W * x, fy(W * x) + 3, 1.15, { kind: x === 0.56 ? 'pine' : 'round', seed: Math.round(x * 30) + 1 });
    const q = 14;
    if (step === 0) s += tag(W * 0.5, H * 0.9, d > 0.9 ? 'Dry, loose soil, few plants' : 'Field with plant cover', { size: q });
    if (step === 1) {
      s += arrow(W * 0.05, 34, W * 0.05 + Math.min(120, W * 0.3), 34, { w: 9, op: w > 0 ? 0 : 1 });
      if (w > 0.85) s += tag(W * 0.5, H * 0.32, 'Dust hides the sky', { size: 15 });
      if (w === 0) s += tag(W * 0.5, H * 0.9, 'Dry, bare ground waits for the wind', { size: q });
    }
    if (step === 2) s += tag(W * 0.58, H * 0.16, 'Belt of trees slows the wind', { size: q }) + tag(W * 0.8, H * 0.9, 'Ground cover', { size: q });
    let over = '';
    if (step === 0) over = bar(H + 8, [{ label: 'Long drought', act: 'dry', disabled: tweening(this) }]);
    if (step === 1) over = bar(H + 8, [{ label: 'Strong wind', act: 'wind', disabled: tweening(this) }]);
    return { svg: world('du', W, H, s), over };
  }
}
