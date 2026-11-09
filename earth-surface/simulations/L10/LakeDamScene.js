// LakeDamScene - a glacial lake behind a moraine, valley running down to the right. blk-l10-s05, 3 beats.
// 0 Warmer years: the glacier shrinks, the lake rises. 1 Dam fails: the water leaves at once and floods downstream.
// 2 what helps: a pipe lowers the lake, sirens down the valley. A made-up valley: no real place is named on it.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, under, svgRock, svgIce, svgWater, svgBoulder, seeded, tween, stopTween, tweening, ease, polyD, n1, INK } from '../L08/LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];

export class LakeDamScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A valley from the side. A glacier at the top melts back into a lake held by a dam of loose moraine. As years warm, the lake rises. When the dam fails, the water leaves at once and floods the valley below. A pipe can lower the lake and sirens can warn the valley.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  async setup() {
    this._l = 0.3; this._f = 0;
    await super.setup();
    this._off = bindActs(this, (a) => {
      if (a === 'warm') { const from = this._l >= 1 ? 0.3 : this._l, to = Math.min(1, from + 0.35); tween(this, 1.4, (u) => { this._l = from + (to - from) * ease(u); }); }
      if (a === 'fail') { this._f = 0; tween(this, 2.8, (u) => { this._f = u; }); }
    });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) { stopTween(this); this._l = step === 0 ? 0.3 : step === 1 ? 1 : 0.55; this._f = 0; }
  paint(st) {
    const W = st.W, step = this.stepIndex, ctl = step === 2 ? 0 : 62, H = st.H - ctl, f = this._f;
    const ground = (x) => { const u = x / W; if (u < 0.22) return H * (0.2 + u * 1.5); if (u < 0.5) return H * (0.53 + Math.sin((u - 0.22) / 0.28 * Math.PI) * 0.09); return H * 0.53 + (u - 0.5) * H * 0.7; };
    const mx = W * 0.62, mw = W * 0.15, mh = H * 0.17, breach = Math.min(1, f * 3);
    const top = (x) => { const q = (x - mx) / mw; const bump = Math.abs(q) < 1 ? (1 - q * q) * mh * (1 - breach * (Math.abs(q) < 0.45 ? 0.9 : 0.35)) : 0; return ground(x) - bump; };
    let s = svgRock(under(ground, -10, W + 10, H + 10, 8), { seed: 6, fill: 'slate', bands: ['slate', 'rockDark', 'slate'], bandH: 36, dip: 12, cracks: 5 });
    s += svgRock(under(top, mx - mw, mx + mw, H, 5).slice(0, -2).concat([[mx + mw, ground(mx + mw) + 8], [mx - mw, ground(mx - mw) + 8]]), { seed: 9, fill: 'soil', grain: true });
    const r = seeded(5);
    for (let i = 0; i < 14; i++) { const x = mx + (r() - 0.5) * mw * 1.7; s += svgBoulder(x, top(x) + 8 + r() * 10, 0.28 + r() * 0.22, { seed: i + 2 }); }
    // the lake: from the glacier's foot to the moraine, level falls as it drains
    const lvl = ground(mx) - mh * (0.35 + this._l * 0.55) * (1 - breach) + breach * mh * 0.1;
    const pts = [];
    for (let x = W * 0.16; x <= mx; x += 6) if (top(x) > lvl) pts.push([x, top(x)]);
    if (pts.length > 2) s += svgWater([[pts[0][0], lvl], [pts[pts.length - 1][0], lvl], ...pts.reverse()], { ripples: 2 });
    // the glacier: shorter in warmer years
    const gx = W * (0.34 - this._l * 0.16);
    const ice = under((x) => ground(x) - (1 - x / gx) * H * 0.1 - 6, -10, gx, 0, 8).slice(0, -2);
    s += svgIce([...ice, [gx, ground(gx)], ...under(ground, -10, gx, 0, 16).slice(0, -2).reverse()], { seed: 3, flow: 30, cracks: 3 });
    // houses in the valley; the flood runs over them
    const hut = (x) => { const y = ground(x) + 2; return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(10) scale(0.72)"><rect x="-20" y="-26" width="40" height="26" rx="3" style="fill:${art('sandLit')};stroke:${INK};stroke-width:3"/><path d="M-28 -24L0 -46L28 -24Z" style="fill:${art('soilTop')};stroke:${INK};stroke-width:3;stroke-linejoin:round"/></g>`; };
    s += hut(W * 0.84) + hut(W * 0.94);
    if (f > 0.1) {
      const reach = Math.min(1, (f - 0.1) / 0.6), end = mx + (W + 10 - mx) * reach, dep = 44 * Math.sin(Math.min(1, f * 1.2) * Math.PI * 0.5) * (f > 0.75 ? 1 - (f - 0.75) * 0.8 : 1);
      s += `<path d="${polyD([...under((x) => ground(x) - dep, mx - 6, end, 0, 8).slice(0, -2), ...under((x) => ground(x) + 4, mx - 6, end, 0, 8).slice(0, -2).reverse()], true)}" style="fill:${art('soil')};opacity:0.9"/>`;
    }
    const n = 14;
    if (step === 0) {
      s += tag(W * 0.2, H * 0.13, 'Glacier', { size: n }) + tag(W * 0.4, H * 0.86, 'Glacial lake', { size: n }) + lead(W * 0.4, H * 0.81, W * 0.42, lvl + 6);
      s += tag(W * 0.66, H * 0.3, 'Dam of loose moraine', { size: n }) + lead(W * 0.62, H * 0.35, mx, top(mx) - 2);
    }
    if (step === 1) {
      if (f === 0) s += tag(W * 0.5, 30, 'A full lake presses on the dam', { size: n });
      if (f > 0.75) s += tag(W * 0.5, 30, 'The lake leaves all at once', { size: n }) + tag(W * 0.74, H * 0.42, 'Flood downstream', { size: 15 });
    }
    if (step === 2) {
      const py = lvl + 14;
      s += `<path d="M${n1(mx - mw * 1.2)} ${n1(py)}L${n1(mx + mw * 1.3)} ${n1(py + 12)}" style="fill:none;stroke:${art('slateDark')};stroke-width:9;stroke-linecap:round"/><path d="M${n1(mx - mw * 1.2)} ${n1(py)}L${n1(mx + mw * 1.3)} ${n1(py + 12)}" style="fill:none;stroke:${art('sea')};stroke-width:4;stroke-linecap:round"/>`;
      s += tag(W * 0.42, H * 0.3, 'Pipe lowers the lake', { size: n }) + lead(W * 0.46, H * 0.35, mx - mw * 0.3, py + 2);
      const sx = W * 0.72, sy = ground(sx);
      s += `<path d="M${n1(sx)} ${n1(sy)}V${n1(sy - 74)}" style="stroke:${art('slateDark')};stroke-width:6;stroke-linecap:round"/><circle cx="${n1(sx)}" cy="${n1(sy - 80)}" r="10" style="fill:${art('sandLit')};stroke:${INK};stroke-width:3"/>`;
      s += tag(W * 0.8, sy - 112, 'Warning siren', { size: n });
    }
    let over = '';
    if (step === 0) over = bar(H + 8, [{ label: 'Warmer years', act: 'warm', disabled: tweening(this) }]);
    if (step === 1) over = bar(H + 8, [{ label: 'Dam fails', act: 'fail', disabled: tweening(this) }]);
    return { svg: world('ld', W, H, s), over };
  }
}
