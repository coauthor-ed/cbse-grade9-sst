// ReliefRaceScene-synthesis - one mountain, the whole story. blk-l10-s10, 5 beats. 0 internal forces build it up.
// 1 five agents wear it down. 2 people live on the result, with four disasters beside the landforms. 3 and 4 all together.
// Self-contained: it no longer shares L03's scene.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, art, world, tag, lead, arrow, under, svgRock, svgSnow, svgIce, svgWater, svgSand, svgTree, n1, INK } from '../L08/LandDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2), S(3), S(3)];

export class ReliefRaceSceneSynthesis extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'One mountain from the side. Arrows from below show internal forces building it. Labels show five agents wearing it down: running water, waves and tides, glaciers, wind and underground water. Houses at its foot show people living on the result, with four disasters beside the landforms.';
  static CONTROLS = [];
  css() { return LAND_CSS; }
  stageHeight(st) { return 430; }
  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex, base = H * 0.84, cx = W * 0.5;
    const bump = (x, c, w, h) => Math.max(0, 1 - ((x - c) / w) ** 2) ** 1.5 * h;
    const ground = (x) => base - Math.max(bump(x, cx, W * 0.34, H * 0.62), bump(x, cx - W * 0.16, W * 0.2, H * 0.34), bump(x, cx + W * 0.17, W * 0.2, H * 0.4)) + Math.sin(x * 0.05) * 2;
    let s = '';
    // sea on the right, desert on the left
    s += svgSand(under(() => base, -10, W * 0.2, H + 10, 20), { seed: 4, ripples: true });
    s += svgRock(under((x) => Math.min(ground(x), base + 2), W * 0.08, W * 0.9, H + 10, 7), { seed: 6, fill: 'rock', bands: ['rock', 'rockDark', 'rock', 'slate'], bandH: 30, warp: 8, dip: 6, cracks: 6 });
    const sn = under(ground, cx - W * 0.1, cx + W * 0.1, 0, 5).slice(0, -2);
    s += svgSnow([...sn, ...sn.slice().reverse().map(([x, y]) => [x, y + Math.max(0, 30 - Math.abs(x - cx) * 0.4)])], { seed: 3 });
    s += svgWater([[W * 0.86, base + 2], [W + 10, base + 2], [W + 10, H + 10], [W * 0.82, H + 10]], { ripples: 3 });
    s += svgWater([[W * 0.88, base + 4], [W + 10, base + 4], [W + 10, H + 10], [W * 0.84, H + 10]], { ripples: 3 });
    const u0 = step === 0 || step === 3, d0 = step === 1 || step === 3, p0 = step === 2 || step === 3;
    if (d0) {
      const rv = [];
      for (let x = cx + W * 0.08; x <= W * 0.86; x += 10) rv.push(`${n1(x)} ${n1(ground(x) + 5)}`);
      s += `<path d="M${rv.join('L')}" style="fill:none;stroke:${art('sea')};stroke-width:6;stroke-linecap:round;stroke-linejoin:round"/>`;
    }
    if (p0) {
      const hut = (x) => `<g transform="translate(${n1(x)} ${n1(base + 4)}) scale(0.7)"><rect x="-20" y="-26" width="40" height="26" rx="3" style="fill:${art('sandLit')};stroke:${INK};stroke-width:3"/><path d="M-28 -24L0 -46L28 -24Z" style="fill:${art('soilTop')};stroke:${INK};stroke-width:3;stroke-linejoin:round"/></g>`;
      s += hut(W * 0.74) + hut(W * 0.8) + svgTree(W * 0.68, base + 4, 0.7, { kind: 'round', seed: 3 });
    }
    if (u0) for (const x of [0.28, 0.46, 0.64]) s += arrow(W * x, H - 14, W * x, base + 28, { w: 9, col: art('hot') });
    if (step === 0) {
      s += tag(W * 0.5, H - 18 - 72, 'Earthquakes, volcanoes', { size: 14 }) + tag(W * 0.5, 30, 'Folding and faulting build it up', { size: 14 });
          }
    if (step === 1) {
      s += tag(cx + W * 0.2, 30, 'Glaciers', { size: 14 }) + lead(cx + W * 0.16, 44, cx + W * 0.04, ground(cx + W * 0.04) + 8);
      s += tag(W * 0.82, H * 0.5, 'Running water', { size: 14 }) + tag(W * 0.84, H - 22, 'Waves, tides', { size: 14 });
      s += tag(W * 0.12, H * 0.72, 'Wind', { size: 14 }) + tag(W * 0.42, H * 0.72, 'Underground water', { size: 14 });
    }
    if (step === 2) {
      s += tag(W * 0.76, H * 0.66, 'Homes, farms, roads', { size: 14 });
      s += lead(W * 0.3, 40, cx - W * 0.06, ground(cx - W * 0.06) + 6) + tag(W * 0.28, 30, 'Avalanche', { size: 14 }) + lead(W * 0.74, 40, cx + W * 0.12, ground(cx + W * 0.12) + 4) + tag(W * 0.74, 30, 'Glacial lake flood', { size: 14 }) + tag(W * 0.5, H * 0.5, 'Landslide', { size: 14 }) + tag(W * 0.17, H * 0.74, 'Dust storm', { size: 14 });
    }
    if (step === 3) s += tag(W * 0.5, 30, 'Forces inside and outside, people between', { size: 14 });
    return { svg: world('rr', W, H, s) };
  }
}
