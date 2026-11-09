// RiverArt - river shapes for lesson 5. Helper, not a scene. A meander is a sine-generated curve (the
// shape real bends take); bends grow by raising w. outerSide says which side a point's bend bulges to.
import { ec, strand, lerp, WHITE, INK } from '../L04/EarthBits.js';

/** Centre line: points [x, y, angle]. box: { x, y (centre of the long axis start), len, cross, vertical }. w: bend strength; k: full waves.
 * Fitted so the bends never leave cross; straight tails reach both ends of len. */
export function meanderLine(box, w, k = 2, n = 240) {
  const raw = []; let a = 0, b = 0;
  for (let i = 0; i <= n; i++) {
    const th = w * Math.sin(2 * Math.PI * k * (i / n));
    raw.push([a, b]);
    a += Math.cos(th); b += Math.sin(th);
  }
  const L = raw[n][0] || 1, ys = raw.map((p) => p[1]), lo = Math.min(...ys), hi = Math.max(...ys), mid = (lo + hi) / 2;
  const sc = Math.min(box.len / L, (box.cross ?? 1e9) / Math.max(1, hi - lo)), off = (box.len - L * sc) / 2;
  const pts = raw.map(([x, y]) => (box.vertical ? [box.x + (y - mid) * sc, box.y + off + x * sc] : [box.x + off + x * sc, box.y + (y - mid) * sc]));
  pts.unshift(box.vertical ? [pts[0][0], box.y - 8] : [box.x - 8, pts[0][1]]);
  pts.push(box.vertical ? [pts[pts.length - 1][0], box.y + box.len + 8] : [box.x + box.len + 8, pts[pts.length - 1][1]]);
  return pts.map((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], r = pts[Math.max(0, i - 1)]; return [p[0], p[1], Math.atan2(q[1] - r[1], q[0] - r[0])]; });
}
export const normal = (p) => [-Math.sin(p[2]), Math.cos(p[2])];

/** +1 or -1: the multiple of normal() that points to the OUTER bank of the bend at fraction t, found from the shape itself. */
export function outerSign(line, t, half = .1) {
  const n = line.length - 1, A = line[Math.round(n * (t - half))], Z = line[Math.round(n * (t + half))], P = line[Math.round(n * t)], [nx, ny] = normal(P);
  return ((P[0] - (A[0] + Z[0]) / 2) * nx + (P[1] - (A[1] + Z[1]) / 2) * ny) >= 0 ? 1 : -1;
}
/** The neck of the middle bend: the closest two points on either side of the apex, far enough from it. */
export function neck(line) {
  const n = line.length - 1, mid = Math.round(n * 0.5);
  let best = [mid - 40, mid + 40], d = 1e9;
  for (let i = mid - Math.round(n * .2); i < mid - Math.round(n * .08); i++) for (let j = mid + Math.round(n * .08); j < mid + Math.round(n * .2); j++) {
    const e = Math.hypot(line[i][0] - line[j][0], line[i][1] - line[j][1]);
    if (e < d) { d = e; best = [i, j]; }
  }
  return { i: best[0], j: best[1], gap: d };
}
export const toPath = (p) => p.map((q) => [q[0], q[1]]);
export function water(p, w = 22) {
  return strand(p, 'soilDark', w + 6) + strand(p, 'sea', w) + strand(p, 'seaFar', w * 0.26, { opacity: 0.7 });
}
/** A band offset from the centre line for a bend, from index a to b. */
export function offsetBand(line, a, b, d0, d1, sign) {
  const out = [], back = [];
  for (let i = a; i <= b; i += 3) {
    const p = line[i], [nx, ny] = normal(p), k = Math.sin(((i - a) / Math.max(1, b - a)) * Math.PI);
    out.push([p[0] + nx * sign * d0, p[1] + ny * sign * d0]);
    back.push([p[0] + nx * sign * (d0 + (d1 - d0) * k), p[1] + ny * sign * (d0 + (d1 - d0) * k)]);
  }
  return out.concat(back.reverse());
}
