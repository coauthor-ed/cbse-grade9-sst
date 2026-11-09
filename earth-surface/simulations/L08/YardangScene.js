// YardangScene - a block of desert rock with hard and soft bands side by side, wind along them (Fig 2.21).
// Stage 0 (setup, blk-l08-s02) flat, nothing named beyond hard and soft. Stage 1 the soft bands wear down,
// hard ridges stay. Stage 2 one ridge from the side, sand striking low. Stage 3 a ventifact.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { lerp } from 'simulations/base/kit/SimLook.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, arrow, tween, stopTween, tweening, ease, under, grains, svgRock, svgSand, polyD, n1, INK, SNOW } from './LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(1), S(2), S(3)];
const BANDS = [[0, 0.22, 1], [0.22, 0.39, 0], [0.39, 0.61, 1], [0.61, 0.78, 0], [0.78, 1, 1]];
const C30 = 0.87, S30 = 0.42;
const Z = 58;                // the block's height above its base line, in px

export class YardangScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: [S(0)], [Number.MAX_SAFE_INTEGER]: [S(0)], 1: [S(0)], 3: MAP };
  static ARIA_LABEL = 'A block of desert rock with bands of hard and soft rock side by side, and wind blowing along the bands. The soft bands wear low, and the hard bands stay as long streamlined ridges. A side view shows sand hopping low and striking the foot of a ridge. A single stone has a smooth flat face towards the wind.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return st.portrait ? 430 : 430; }
  async setup() {
    this._u = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'run') this._run(); });
  }
  destroy() { stopTween(this); this._off?.(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  enter(step) {
    stopTween(this);
    this._u = step === 0 ? 0 : 1;
    if (step === 1) this._run();
    if (step >= 2) this.play(3);
  }
  _run() { this._u = 0; tween(this, 2.8, (u) => { this._u = ease(u); }); }
  paint(st) { return [this._block, this._block, this._ridge, this._stone][this.stepIndex].call(this, st); }

  _block(st) {
    const W = st.W, step = this.stepIndex, H = st.H - (step === 1 ? 62 : 0), u = this._u;
    const U = Math.min(W * 0.96, (H - 96) * 1.72), A = U * 0.74, B = U * 0.42, ox = (W - (A + B) * C30) / 2, oy = H * 0.6 + (A - B) * S30 * 0.5 - 6;
    const P = (a, b, z) => [ox + a * A * C30 + b * B * C30, oy - a * A * S30 + b * B * S30 - z];
    let s = svgSand(under((x) => H * 0.5 + Math.sin(x * 0.012) * 8, -10, W + 10, H + 10, 16), { seed: 3, ripples: true });
    // the base: a darker plinth under the whole block
    const base = 26;
    s += `<path d="${polyD([P(0, 1, 0), P(1, 1, 0), P(1, 1, -base), P(0, 1, -base)], true)}" style="fill:${art('rockDark')}"/>`;
    s += `<path d="${polyD([P(0, 0, 0), P(0, 1, 0), P(0, 1, -base), P(0, 0, -base)], true)}" style="fill:${art('rockDark')}"/>`;
    const N = 12;
    for (const [b0, b1, hard] of BANDS) {
      const mid = (b0 + b1) / 2, half = (b1 - b0) / 2;
      // hard band: stays high, narrows towards the downwind tail; soft band: sinks to a sandy floor
      const z = hard ? Z * (1 - 0.1 * u) : Z * (1 - 0.86 * u);
      const hw = (a) => (hard ? half * lerp(1, 0.14 + 0.86 * (1 - a) ** 1.3, u) : half);
      const zAt = (a) => (hard ? z * lerp(1, 1 - 0.8 * a ** 1.6, u) : z);
      const top = [], bot = [];
      for (let i = 0; i <= N; i++) { const a = i / N; top.push(P(a, mid - hw(a), zAt(a))); bot.push(P(a, mid + hw(a), zAt(a))); }
      const wall = [...bot, ...bot.map((p, i) => P(i / N, mid + hw(i / N), 0)).reverse()];
      const end = [P(0, mid - hw(0), zAt(0)), P(0, mid + hw(0), zAt(0)), P(0, mid + hw(0), 0), P(0, mid - hw(0), 0)];
      if (hard) {
        s += svgRock(end, { seed: 3, fill: 'rockDark', cracks: 2 }) + svgRock(wall, { seed: 5, fill: 'rockDark', cracks: 2, grain: true });
        s += svgRock([...top, ...bot.slice().reverse()], { seed: 8, fill: 'rock', lit: true, cracks: 3 });
      } else {
        s += `<path d="${polyD(end, true)}" style="fill:${art('sandDark')}"/>`;
        s += svgSand([...top, ...bot.slice().reverse()], { seed: 9, ripples: u > 0.5 });
        if (u < 0.6) s += `<path d="${polyD(wall, true)}" style="fill:${art('sandDark')}"/>`;
      }
    }
    const [ax, ay] = P(0.02, -0.06, Z + 30), [bx, by] = P(0.98, -0.06, Z + 30);
    s += arrow(ax, ay, bx, by, { w: 11 });
    s += tag(lerp(ax, bx, 0.28), lerp(ay, by, 0.28) - 32, 'Wind', { size: 16 });
    const lab = (a, b, z, t, dx, dy, o) => { const [x, y] = P(a, b, z); s += lead(x, y, x + dx, y + dy) + tag(x + dx, y + dy, t, o); };
    if (step === 0) { lab(0.16, 0.92, Z, 'Hard rock', W * 0.26, 30); s += tag(W * 0.3, H - 26, 'Soft rock', { size: 15 }); { const [x, y] = P(0.18, 0.7, Z); s += lead(W * 0.3, H - 38, x, y); } }
    else if (u > 0.9) { lab(0.3, 0.5, Z * 0.86, 'Yardang', W * 0.04, -H * 0.26); s += tag(W * 0.62, H - 26, 'Soft rock worn low', { size: 15 }); { const [x, y] = P(0.62, 0.7, Z * 0.14); s += lead(W * 0.62, H - 38, x, y); } }
    return { svg: world('yd', W, H, s), over: step === 1 ? bar(H + 8, [{ label: 'Run the wind again', act: 'run', disabled: tweening(this) }]) : '' };
  }

  _ridge(st) {
    const W = st.W, H = st.H, g = H * 0.76;
    const profile = [[W * 0.3, g + 4], [W * 0.29, g - 12], [W * 0.33, g - 34], [W * 0.31, g - 84], [W * 0.38, g - 122], [W * 0.5, g - 134], [W * 0.68, g - 112], [W * 0.84, g - 72], [W * 0.97, g - 20], [W + 12, g + 4]];
    let s = svgSand(under((x) => g - 4 + Math.sin(x * 0.02) * 3, -10, W + 10, H + 10, 16), { seed: 4, ripples: true });
    s += svgRock([...profile, [W + 12, g + 30], [W * 0.3, g + 30]], { seed: 6, fill: 'rock', bands: ['rock', 'rockDark', 'rock'], bandH: 26, dip: 2, cracks: 4, lit: true, outline: true });
    s += svgSand(under((x) => g + 8 + Math.sin(x * 0.02) * 3, -10, W + 10, H + 10, 16), { seed: 5, ripples: true });
    s += arrow(W * 0.03, H * 0.16, W * 0.03 + Math.min(150, W * 0.36), H * 0.16, { w: 11 }) + tag(W * 0.03 + 52, H * 0.16 - 32, 'Wind', { size: 16 });
    for (const [x, q] of [[0.02, 0.15], [0.1, 0.15], [0.17, 0.13]]) s += `<path d="M${n1(W * x)} ${n1(g + 4)}Q${n1(W * (x + q / 2))} ${n1(g - 66)} ${n1(W * (x + q))} ${n1(g - 8)}" style="fill:none;stroke:${INK};stroke-width:2.5;stroke-dasharray:3 8;stroke-linecap:round"/>`;
    s += grains(W * 0.24, g - 30, W * 0.05, 30, 14, { seed: 2, r: 2, r2: 3, col: art('sandDark') });
    s += lead(W * 0.29, g - 14, W * 0.4, g + 46) + tag(W * 0.5, g + 54, 'Sand strikes the foot of the ridge', { size: W < 420 ? 14 : 16 });
    s += tag(W * 0.62, g - 178, 'One ridge, from the side', { size: 14 });
    return { svg: world('yr', W, H, s) };
  }

  _stone(st) {
    const W = st.W, H = st.H, g = H * 0.78, k = Math.min(W / 348, 1.25), cx = W * 0.56;
    const P = (x, y) => [cx + x * k, g + y * k];
    let s = svgSand(under((x) => g - 2 + Math.sin(x * 0.015) * 4, -10, W + 10, H + 10, 16), { seed: 8, ripples: true });
    const body = [P(-104, 8), P(-30, -112), P(26, -122), P(112, -46), P(124, 8)];
    s += `<ellipse cx="${n1(cx)}" cy="${n1(g + 12 * k)}" rx="${n1(138 * k)}" ry="${n1(15 * k)}" style="fill:${art('sandDark')};opacity:0.6"/>`;
    s += svgRock(body, { seed: 11, fill: 'rockDark', cracks: 5, grain: true, outline: true });
    // the windward face: flat, polished, one clean highlight
    const face = [P(-104, 8), P(-30, -112), P(-4, -62), P(-20, 8)];
    s += `<path d="${polyD(face, true)}" style="fill:${art('rockLit')};stroke:${INK};stroke-width:3;stroke-linejoin:round"/>`;
    s += `<path d="${polyD([P(-72, -18), P(-32, -84)])}" style="fill:none;stroke:${SNOW};stroke-width:7;stroke-linecap:round;opacity:0.65"/>`;
    s += arrow(W * 0.03, H * 0.2, W * 0.03 + Math.min(130, W * 0.32), H * 0.2, { w: 11 }) + tag(W * 0.03 + 48, H * 0.2 - 32, 'Wind', { size: 16 });
    s += tag(W * 0.27, H * 0.47, 'Smooth, flat face', { size: 15 });
    s += tag(W * 0.74, H * 0.13, 'Rough, sheltered side', { size: 15 }) + lead(W * 0.74, H * 0.17, cx + 66 * k, g - 60 * k);
    return { svg: world('yv', W, H, s) };
  }

  animate(st, t) {
    const step = this.stepIndex;
    if (step !== 2 && step !== 3) return;
    const W = st.W, H = st.H, g = step === 2 ? H * 0.76 : H * 0.78, lv = this.live, hit = step === 2 ? W * 0.29 : W * 0.34;
    for (let i = 0; i < 12; i++) {
      const u = (t * 0.7 + i * 0.083) % 1, x = hit * u, y = g + 2 - Math.sin(Math.min(1, u * 0.92) * Math.PI * 0.8) * (44 + (i % 3) * 9);
      lv.attrs(lv.shape(`g${i}`, 'circle'), { cx: n1(x), cy: n1(y), r: 3, style: `fill:${art('sandDark')};stroke:${SNOW};stroke-width:1` });
    }
  }
}
