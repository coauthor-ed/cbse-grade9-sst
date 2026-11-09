// ChinaDraw.js - drawn things for the L12 to L14 canvas scenes: bone, signs in strokes, wall, bamboo strips, scroll, jar.
// Not a scene. Signs are strokes, not font glyphs, so they draw the same on every device and can change shape.
import { darken, lighten, mix, ellipse, rr, mulberry32 } from 'simulations/base/kit/SimLook.js';

export const boneCol = (c) => mix(c.strata1, c.elevPeak, 0.25);
export const PAPER = (c) => mix(c.elevPeak, c.strata1, 0.16);   // paper and silk stay pale in both themes

/** The outline of an ox shoulder blade, socket at the top. Centred on (x, y), s = 1 is 260 x 390. */
export function bonePath(ctx, x, y, s = 1) {
  const P = (a, b) => [x + a * s, y + b * s];
  ctx.beginPath();
  // Asymmetric on purpose: a straight back edge on the left, a sweeping edge on the right, a thin worn end at the foot.
  ctx.moveTo(...P(-62, -176));
  ctx.bezierCurveTo(...P(-50, -204), ...P(-4, -206), ...P(18, -186));
  ctx.bezierCurveTo(...P(28, -160), ...P(22, -138), ...P(44, -104));
  ctx.bezierCurveTo(...P(84, -44), ...P(128, 60), ...P(132, 146));
  ctx.bezierCurveTo(...P(96, 186), ...P(46, 170), ...P(10, 190));
  ctx.bezierCurveTo(...P(-30, 200), ...P(-84, 182), ...P(-120, 186));
  ctx.bezierCurveTo(...P(-108, 90), ...P(-76, -60), ...P(-62, -176));
  ctx.closePath();
}

/** The bone, lit from the top left. */
export function drawBone(ctx, c, x, y, s = 1) {
  const b = boneCol(c);
  ctx.save();
  ctx.save(); ctx.translate(0, 8 * s); bonePath(ctx, x, y, s); ctx.fillStyle = darken(b, 0.42); ctx.fill(); ctx.restore();
  bonePath(ctx, x, y, s); ctx.fillStyle = b; ctx.fill();
  ctx.clip();
  ctx.fillStyle = darken(b, 0.1); ctx.beginPath(); ctx.ellipse(x + 90 * s, y + 90 * s, 110 * s, 190 * s, 0.1, 0, 7); ctx.fill();
  ctx.fillStyle = lighten(b, 0.25); ctx.beginPath(); ctx.ellipse(x - 56 * s, y - 20 * s, 26 * s, 150 * s, 0.14, 0, 7); ctx.fill();
  ctx.strokeStyle = darken(b, 0.24); ctx.lineWidth = 7 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 30 * s, y - 150 * s); ctx.quadraticCurveTo(x - 14 * s, y - 40 * s, x - 22 * s, y + 40 * s); ctx.stroke();
  const rnd = mulberry32(19);
  ctx.fillStyle = darken(b, 0.26);
  for (let i = 0; i < 90; i++) ctx.fillRect(x + (rnd() - 0.5) * 240 * s, y + (rnd() - 0.5) * 380 * s, 2.4 * s, 1.6 * s);
  ctx.restore();
  bonePath(ctx, x, y, s); ctx.strokeStyle = darken(b, 0.5); ctx.lineWidth = 4 * s; ctx.lineJoin = 'round'; ctx.stroke();
}

/** Places for hollows on the bone, in rows, in bone units. */
export const HOLLOWS = (() => {
  const out = [];
  [-50, 16, 80, 142].forEach((yy, r) => { const n = r === 0 ? 2 : r === 1 ? 3 : 4, w = 70 + r * 40, cx = -6 + r * 3; for (let i = 0; i < n; i++) out.push([cx + (i - (n - 1) / 2) * (w * 2 / Math.max(n - 1, 1)) * 0.46, yy]); });
  return out;
})();

/** One hollow: an oval pit with a round pit beside it, the usual Shang pair. k grows it in. */
export function drawHollow(ctx, c, x, y, s, k = 1, hot = 0) {
  if (k <= 0) return;
  const b = boneCol(c), d = darken(b, 0.6);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = d; ellipse(ctx, 0, 0, 9 * s, 16 * s); ctx.fill();
  ctx.fillStyle = darken(b, 0.42); ellipse(ctx, 1.5 * s, 2 * s, 6 * s, 12 * s); ctx.fill();
  ctx.fillStyle = d; ctx.beginPath(); ctx.arc(15 * s, 2 * s, 8 * s, 0, 7); ctx.fill();
  if (hot > 0) { ctx.globalAlpha = hot; ctx.fillStyle = c.flame; ctx.beginPath(); ctx.arc(15 * s, 2 * s, 7 * s, 0, 7); ctx.fill(); }
  ctx.restore();
}

/** A polyline up to k of its length. */
export function traceLine(ctx, pts, k = 1) {
  let total = 0;
  const seg = pts.slice(1).map((p, i) => { const l = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]); total += l; return l; });
  let left = total * Math.max(0, Math.min(1, k));
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < seg.length; i++) {
    if (left <= 0) break;
    const u = Math.min(1, left / seg[i]);
    ctx.lineTo(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u);
    left -= seg[i];
  }
}

/** Signs in a 100 x 100 box. old and now have the same strokes with the same points, so one can turn into the other. */
export const SIGN = {
  person: {
    old: [[[60, 8], [56, 30], [54, 52], [48, 74], [40, 94]], [[55, 34], [44, 44], [34, 54], [28, 62], [24, 70]]],
    now: [[[52, 8], [47, 36], [38, 58], [26, 76], [10, 90]], [[47, 38], [56, 56], [66, 70], [78, 82], [92, 90]]],
  },
  tree: {
    old: [[[50, 4], [50, 28], [50, 50], [50, 74], [50, 98]], [[50, 46], [41, 38], [33, 28], [27, 18], [22, 8]], [[50, 46], [59, 38], [67, 28], [73, 18], [78, 8]], [[50, 64], [42, 72], [34, 80], [28, 88], [20, 96]], [[50, 64], [58, 72], [66, 80], [72, 88], [80, 96]]],
    now: [[[50, 4], [50, 28], [50, 50], [50, 74], [50, 98]], [[50, 32], [40, 32], [30, 32], [20, 32], [8, 32]], [[50, 32], [60, 32], [70, 32], [80, 32], [92, 32]], [[50, 38], [40, 56], [30, 68], [20, 78], [8, 86]], [[50, 38], [60, 56], [70, 68], [80, 78], [92, 86]]],
  },
  sun: {
    old: [[[50, 12], [72, 20], [86, 44], [80, 72], [50, 88], [24, 76], [14, 48], [24, 22], [50, 12]], [[44, 50], [47, 50], [50, 50], [53, 50], [56, 50]]],
    now: [[[24, 10], [76, 10], [76, 40], [76, 90], [76, 92], [24, 92], [24, 60], [24, 26], [24, 10]], [[24, 50], [38, 50], [50, 50], [62, 50], [76, 50]]],
  },
  moon: {
    old: [[[58, 8], [80, 22], [90, 50], [80, 78], [52, 94], [62, 74], [66, 50], [62, 26], [58, 8]], [[75, 42], [76, 46], [76, 50], [76, 54], [76, 58]]],
    now: [[[28, 8], [76, 8], [76, 40], [76, 72], [68, 94], [62, 90], [28, 8], [28, 8], [28, 8]], [[28, 8], [28, 40], [28, 60], [24, 80], [12, 94]], [[28, 36], [40, 36], [52, 36], [64, 36], [76, 36]]],
  },
  mountain: {
    old: [[[6, 84], [14, 66], [24, 46], [34, 66], [38, 60], [50, 12], [62, 60], [66, 66], [76, 46], [86, 66], [94, 84]], [[6, 84], [28, 84], [50, 84], [72, 84], [94, 84]]],
    now: [[[50, 6], [50, 26], [50, 46], [50, 66], [50, 88]], [[14, 34], [14, 50], [14, 66], [14, 80], [14, 88]], [[14, 88], [34, 88], [50, 88], [68, 88], [86, 88]], [[86, 34], [86, 50], [86, 66], [86, 80], [86, 88]]],
  },
};

/** Draw a sign. t 0 is the old form, 1 the modern one (only signs with matching strokes can use a value in between). */
export function drawSign(ctx, name, x, y, size, col, lw, t = 1) {
  const g = SIGN[name], f = size / 100;
  const set = t >= 1 ? g.now : t <= 0 ? g.old : g.old.map((st, i) => st.map((p, j) => [p[0] + (g.now[i][j][0] - p[0]) * t, p[1] + (g.now[i][j][1] - p[1]) * t]));
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const st of set) {
    ctx.beginPath();
    const pt = st.map((p) => [x + p[0] * f, y + p[1] * f]);
    if (t <= 0 && name !== 'mountain') { // old forms were cut in curves
      ctx.moveTo(pt[0][0], pt[0][1]);
      for (let i = 1; i < pt.length - 1; i++) ctx.quadraticCurveTo(pt[i][0], pt[i][1], (pt[i][0] + pt[i + 1][0]) / 2, (pt[i][1] + pt[i + 1][1]) / 2);
      ctx.lineTo(pt[pt.length - 1][0], pt[pt.length - 1][1]);
    } else pt.forEach((p, i) => { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
    ctx.stroke();
  }
  ctx.restore();
}

/** A square tile for a sign: bone or paper. */
export function signTile(ctx, c, x, y, s, kind = 'bone') {
  const col = kind === 'bone' ? boneCol(c) : PAPER(c);
  rr(ctx, x, y + 6, s, s, 18); ctx.fillStyle = darken(col, 0.4); ctx.fill();
  rr(ctx, x, y, s, s, 18); ctx.fillStyle = col; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.45); ctx.stroke();
  return col;
}

/** A stretch of wall in side view on the line (x1, y1) to (x2, y2). kind: 'earth' or 'stone'. */
export function drawWallRun(ctx, c, x1, y1, x2, y2, h, kind = 'stone') {
  const col = kind === 'earth' ? mix(c.strata2, c.strata1, 0.4) : mix(c.strata5, c.bgSurface, 0.25);
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 22));
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 - h); ctx.lineTo(x1, y1 - h); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.4); ctx.stroke();
  ctx.fillStyle = col;
  for (let i = 0; i < n; i += 2) {
    const a = i / n, b = (i + 1) / n, xa = x1 + (x2 - x1) * a, xb = x1 + (x2 - x1) * b, ya = y1 + (y2 - y1) * a - h, yb = y1 + (y2 - y1) * b - h;
    ctx.beginPath(); ctx.moveTo(xa, ya + 2); ctx.lineTo(xa, ya - h * 0.28); ctx.lineTo(xb, yb - h * 0.28); ctx.lineTo(xb, yb + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.strokeStyle = darken(col, 0.22); ctx.lineWidth = 2;
  for (let r = 1; r < 3; r++) { const k = r / 3; ctx.beginPath(); ctx.moveTo(x1, y1 - h * k); ctx.lineTo(x2, y2 - h * k); ctx.stroke(); }
  ctx.restore();
}

/** Bamboo strips tied side by side. Centre (x, y). The marks stand for writing and are not real text. */
export function drawStrips(ctx, c, x, y, w, h, n = 7) {
  const col = mix(c.strata1, c.elevMid, 0.3), sw = w / n, rnd = mulberry32(5);
  for (let i = 0; i < n; i++) {
    const sx = x - w / 2 + i * sw;
    rr(ctx, sx + 2, y - h / 2 + 4, sw - 4, h, 5); ctx.fillStyle = darken(col, 0.4); ctx.fill();
    rr(ctx, sx + 2, y - h / 2, sw - 4, h, 5); ctx.fillStyle = i % 2 ? col : lighten(col, 0.1); ctx.fill();
    ctx.fillStyle = darken(c.strata6, 0.1);
    for (let j = 0; j < 7; j++) { const q = 0.14 + j * 0.105; ctx.fillRect(sx + sw * 0.32, y - h / 2 + h * q, sw * (0.25 + rnd() * 0.15), h * 0.05); }
  }
  ctx.strokeStyle = darken(c.strata3, 0.1); ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const k of [0.1, 0.9]) { ctx.beginPath(); ctx.moveTo(x - w / 2 - 6, y - h / 2 + h * k); ctx.lineTo(x + w / 2 + 6, y - h / 2 + h * k); ctx.stroke(); }
}

/** A paper or silk roll with lines of writing. Centre (x, y). */
export function drawScroll(ctx, c, x, y, w, h) {
  const col = PAPER(c), rod = darken(c.strata3, 0.1);
  rr(ctx, x - w / 2, y - h / 2 + 4, w, h, 6); ctx.fillStyle = darken(col, 0.3); ctx.fill();
  rr(ctx, x - w / 2, y - h / 2, w, h, 6); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = c.strata6;
  for (let i = 0; i < 6; i++) ctx.fillRect(x - w / 2 + w * (0.14 + i * 0.13), y - h / 2 + h * 0.14, w * 0.05, h * (0.72 - (i % 3) * 0.1));
  for (const sx of [x - w / 2, x + w / 2]) { rr(ctx, sx - 8, y - h / 2 - 12, 16, h + 24, 8); ctx.fillStyle = rod; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = darken(rod, 0.4); ctx.stroke(); }
}

/** A big storage jar, foot at (x, y), s tall. */
export function drawJar(ctx, c, x, y, s, col = c.strata3) {
  const w = s * 0.44, t = y - s;
  ctx.beginPath(); ctx.moveTo(x - w * 0.55, t); ctx.lineTo(x + w * 0.55, t); ctx.lineTo(x + w * 0.46, t + s * 0.14);
  ctx.bezierCurveTo(x + w * 1.34, t + s * 0.32, x + w * 1.1, y - s * 0.1, x + w * 0.5, y); ctx.lineTo(x - w * 0.5, y);
  ctx.bezierCurveTo(x - w * 1.1, y - s * 0.1, x - w * 1.34, t + s * 0.32, x - w * 0.46, t + s * 0.14); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.45); ctx.stroke();
  rr(ctx, x - w * 0.62, t - s * 0.04, w * 1.24, s * 0.08, s * 0.03); ctx.fillStyle = darken(col, 0.18); ctx.fill(); ctx.stroke();
}

/** Ground band with a darker lip along the top. */
export function ground(ctx, c, y, W = 680, H = 520, col = null) {
  const g = col ?? mix(c.strata1, c.bgSurface, 0.3);
  ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  ctx.fillStyle = darken(g, 0.22); ctx.fillRect(0, y, W, 4);
}
