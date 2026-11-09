// SlopeArt - a hillside in side view with one soil measure on it, for ContourTrenchScene and HoldTheSlopeScene.
// slopeSvg(W, H, kind, o): kind 'bare' | 'trench' | 'bund' | 'terrace' | 'dam' | 'plants'. o.flow 0..1 draws the
// water at that point of a storm; o.seed. The water runs fast on bare ground and stops at each measure.
import { svgSoil, svgGrass, svgRock, svgTree } from '../shared/EarthArt.js';
import { ec, strand, arrow, lerp, WHITE } from './EarthBits.js';

export const STOP = { bare: 1, trench: .3, bund: .36, terrace: .2, dam: .55, plants: .3 };

const Sx = (W, u) => u * W;
export function surface(W, H, kind) {
  const top = H * .22, foot = H * .86, n = 3, p = [[-10, top]];
  const y = (u) => lerp(top, foot, u);
  if (kind === 'terrace') {
    const steps = 5;
    for (let i = 0; i < steps; i++) { const a = i / steps, b = (i + 1) / steps; p.push([W * a + 8, y(a)], [W * b - 4, y(a) + 2], [W * b + 4, y(b)]); }
    p.push([W + 10, foot]);
    return p;
  }
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, x = W * u; let yy = y(u);
    if (kind === 'trench') for (let k = 1; k <= n; k++) { const d = (u - k / (n + 1)) / .028; yy += 20 * Math.exp(-d * d); }
    if (kind === 'bund') for (let k = 1; k <= n; k++) { const d = (u - k / (n + 1)) / .03; yy -= 16 * Math.exp(-d * d); }
    p.push([x, yy]);
  }
  p.push([W + 10, foot]);
  return p;
}

export function slopeSvg(W, H, kind, o = {}) {
  const P = surface(W, H, kind), f = o.flow ?? 0;
  let b = svgSoil([...P, [W + 10, H + 10], [-10, H + 10]], { seed: o.seed ?? 5, stones: 6, top: 15 });
  const yAt = (x) => { for (let i = 1; i < P.length; i++) if (P[i][0] >= x) { const [a, c] = [P[i - 1], P[i]], t = (x - a[0]) / Math.max(1, c[0] - a[0]); return lerp(a[1], c[1], t); } return P[P.length - 1][1]; };
  if (kind === 'dam') {
    const x = W * .62, y = yAt(x);
    b += svgSoil([[x - 90, yAt(x - 90) + 1], [x, y - 24], [x, y + 6]], { seed: 3 });
    b += svgRock([[x - 2, y - 34], [x + 16, y - 32], [x + 18, y + 16], [x - 4, y + 16]], { seed: 2, fill: 'rock', outline: true });
  }
  if (kind === 'bund' || kind === 'plants' || kind === 'terrace') b += svgGrass(0, yAt(0), W, yAt(W), { seed: 4, n: kind === 'plants' ? 34 : 12, tall: kind === 'plants' ? 22 : 10 });
  if (kind === 'plants') for (const u of [.2, .5, .8]) b += svgTree(W * u, yAt(W * u) + 2, .5, { kind: 'round', seed: 3 });
  if (f > 0) {
    const stop = STOP[kind], x1 = W * Math.min(1, stop * f + (kind === 'bare' ? 0 : .02)), line = [];
    for (let x = 0; x <= x1; x += 14) line.push([x, yAt(x) - 3]);
    if (line.length > 1) b += strand(line, 'seaDeep', kind === 'bare' ? 10 : 7) + strand(line, 'sea', kind === 'bare' ? 6 : 4);
    if (kind !== 'bare') for (let i = 1; i <= 3; i++) { const x = W * i / 4; if (x / W < stop * 2.8) b += arrow([[x, yAt(x) + 8], [x, yAt(x) + 34 * f]], { c: ec('sea'), w: 4, rim: ec('seaDeep') }); }
  }
  return b;
}
