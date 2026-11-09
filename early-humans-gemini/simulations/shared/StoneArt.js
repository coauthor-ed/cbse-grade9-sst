// StoneArt.js - drawn things for the early lessons (L01 to L03): stone tools, skulls, soil bands.
// Canvas only. Colours come from the scene's `c`, so the scene sets static COLOR_MAP = GEO_COLOR_MAP.
import { alpha, darken, lighten, mix, mulberry32, rr, inkOn } from 'simulations/base/kit/SimLook.js';

export const STONE = (c, k = 0) => mix(mix(c.strata2, c.strata5, 0.28), c.bgSurface, 0.1 + k);

// Tool outlines, x right, y down, unit height about 2. Sharp points repeat so the smoothing keeps a corner.
const OUT = {
  handaxe: [[0, -1], [0, -1], [0.2, -0.66], [0.38, -0.2], [0.48, 0.3], [0.4, 0.74], [0.14, 0.97], [-0.14, 0.97], [-0.4, 0.74], [-0.48, 0.3], [-0.38, -0.2], [-0.2, -0.66]],
  cleaver: [[-0.44, -0.96], [-0.44, -0.96], [0.44, -0.96], [0.44, -0.96], [0.5, -0.4], [0.5, 0.3], [0.38, 0.76], [0.1, 0.97], [-0.1, 0.97], [-0.38, 0.76], [-0.5, 0.3], [-0.5, -0.4]],
  chopper: [[-0.86, 0.1], [-0.66, -0.34], [-0.42, -0.2], [-0.24, -0.52], [0, -0.3], [0.2, -0.56], [0.44, -0.3], [0.68, -0.34], [0.88, 0.14], [0.74, 0.54], [0.3, 0.72], [-0.3, 0.72], [-0.74, 0.5]],
  scraper: [[-0.62, 0.48], [-0.62, 0.48], [-0.72, 0.02], [-0.5, -0.46], [0, -0.68], [0.5, -0.46], [0.72, 0.02], [0.62, 0.48], [0.62, 0.48], [0, 0.56]],
  borer: [[0, -1], [0, -1], [0.08, -0.5], [0.34, -0.12], [0.5, 0.42], [0.2, 0.8], [-0.28, 0.76], [-0.5, 0.36], [-0.3, -0.14], [-0.08, -0.5]],
  point: [[0, -1], [0, -1], [0.16, -0.52], [0.27, 0], [0.22, 0.5], [0.06, 0.86], [-0.06, 0.86], [-0.22, 0.5], [-0.27, 0], [-0.16, -0.52]],
  flake: [[-0.44, -0.74], [0.1, -0.86], [0.5, -0.5], [0.6, 0.1], [0.34, 0.72], [-0.2, 0.8], [-0.56, 0.26], [-0.6, -0.26]],
  blade: [[0, -1], [0, -1], [0.1, -0.7], [0.12, 0.6], [0.04, 0.96], [-0.1, 0.84], [-0.12, -0.5]],
  polished: [[-0.4, -0.86], [0.4, -0.86], [0.42, -0.5], [0.3, 0.2], [0.18, 0.8], [0, 0.96], [-0.18, 0.8], [-0.3, 0.2], [-0.42, -0.5]],
};
export const TOOL_KINDS = Object.keys(OUT);

function smooth(ctx, pts) {
  const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  ctx.beginPath(); ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  ctx.closePath();
}

/** A knapped stone tool. x, y centre; s half height; o: { rot, tone, dim, seed, flakes, worn }. */
export function drawTool(ctx, c, kind, x, y, s, o = {}) {
  const tone = o.tone ?? STONE(c), rnd = mulberry32(o.seed ?? (kind.length * 97 + 13));
  const cs = Math.cos(o.rot ?? 0), sn = Math.sin(o.rot ?? 0);
  const P = (p) => [x + (p[0] * cs - p[1] * sn) * s, y + (p[0] * sn + p[1] * cs) * s];
  const pts = OUT[kind].map(P);
  ctx.save();
  ctx.globalAlpha *= o.dim ?? 1;
  ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(s * 0.05, s * 0.07); smooth(ctx, pts); ctx.fillStyle = alpha(darken(c.label, 0.4), 0.2); ctx.fill(); ctx.restore();
  smooth(ctx, pts); ctx.fillStyle = tone; ctx.fill();
  ctx.save(); smooth(ctx, pts); ctx.clip();
  if (kind === 'polished') {
    ctx.fillStyle = alpha(lighten(tone, 0.5), 0.4); ctx.beginPath(); ctx.ellipse(x - s * 0.12, y - s * 0.2, s * 0.14, s * 0.56, 0.1 + (o.rot ?? 0), 0, 6.3); ctx.fill();
  } else {
    // Flake scars: scalloped facets, lit from the top left.
    const nF = o.flakes ?? (kind === 'blade' ? 5 : 20);
    for (let i = 0; i < nF; i++) {
      const a = rnd() * 6.283, r = 0.22 + rnd() * 0.8, fx = Math.cos(a) * r * 0.6, fy = Math.sin(a) * r, q = 0.14 + rnd() * 0.17;
      const [px, py] = P([fx, fy]);
      ctx.beginPath(); ctx.ellipse(px, py, q * s, q * s * 0.78, a, 0, 6.283);
      ctx.fillStyle = i % 2 ? alpha(darken(tone, 0.42), 0.24) : alpha(lighten(tone, 0.45), 0.28); ctx.fill();
      ctx.strokeStyle = alpha(darken(tone, 0.55), 0.22); ctx.lineWidth = Math.max(1, s * 0.012); ctx.stroke();
    }
  }
  ctx.restore();
  smooth(ctx, pts); ctx.strokeStyle = darken(tone, 0.42); ctx.lineWidth = Math.max(2, s * 0.03); ctx.stroke();
  if (o.worn) {           // nicks along one edge: wear from use
    ctx.strokeStyle = alpha(c.label, 0.75); ctx.lineWidth = Math.max(2.5, s * 0.03); ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const p = P([0.42 + i * 0.012, -0.2 + i * 0.16]); ctx.beginPath(); ctx.moveTo(p[0] - s * 0.05, p[1]); ctx.lineTo(p[0] + s * 0.04, p[1] + s * 0.04); ctx.stroke(); }
  }
  ctx.restore();
}

// Skull parameters, side view facing left. vault: height of the braincase. len: length back. bun: bulge at the back.
// brow: ridge size. jut: how far the jaw comes forward. chin: chin forward. forehead: 0 sloping .. 1 upright.
export const SKULLS = {
  habilis: { vault: 0.56, len: 0.62, bun: 0, brow: 0.8, jut: 1, chin: 0, forehead: 0.15 },
  erectus: { vault: 0.56, len: 0.86, bun: 0.1, brow: 1, jut: 0.72, chin: 0, forehead: 0.1 },
  neanderthal: { vault: 0.68, len: 0.92, bun: 1, brow: 0.86, jut: 0.56, chin: 0.05, forehead: 0.32 },
  sapiens: { vault: 0.86, len: 0.72, bun: 0, brow: 0.12, jut: 0.02, chin: 1, forehead: 1 },
};
export const mixSkull = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));

/** A skull side view. x, y at the ear; s the scale (about half the skull length). o: { tone, dim, line }. */
export function drawSkull(ctx, c, p, x, y, s, o = {}) {
  const bone = o.tone ?? mix(c.strata1, c.bgSurface, 0.45), edge = darken(bone, 0.5);
  const fy = -p.vault * s, nape = (p.len + 0.1 * p.bun) * s;
  const browX = -(0.74 + 0.12 * p.brow) * s, browY = -0.14 * s;
  const jutX = -(0.72 + 0.34 * p.jut) * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha *= o.dim ?? 1;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // Lower jaw first, so the skull overlaps it.
  ctx.beginPath();
  ctx.moveTo(0.06 * s, 0.1 * s);
  ctx.quadraticCurveTo(0.12 * s, 0.56 * s, -0.08 * s, 0.6 * s);
  const chinX = jutX + (0.1 - 0.16 * p.chin) * s;
  ctx.quadraticCurveTo(chinX * 0.55, 0.72 * s, chinX, 0.76 * s - p.chin * 0.02 * s);
  ctx.quadraticCurveTo(chinX - 0.09 * s * (1 + p.chin), 0.62 * s, jutX + 0.08 * s, 0.5 * s);
  ctx.lineTo(-0.3 * s, 0.42 * s); ctx.quadraticCurveTo(-0.14 * s, 0.34 * s, -0.12 * s, 0.14 * s);
  ctx.closePath();
  ctx.fillStyle = darken(bone, 0.1); ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = Math.max(2, s * 0.03); ctx.stroke();
  // Cranium and upper jaw.
  const cran = () => {
  ctx.beginPath();
  ctx.moveTo(nape * 0.72, 0.16 * s);
  ctx.quadraticCurveTo(nape * 1.1, -0.1 * s, nape, fy * 0.5 - (p.bun * 0.02 * s));
  ctx.quadraticCurveTo(nape * 0.72, fy * 1.26, 0, fy);
  const fh = browX + (0.14 + 0.2 * p.forehead) * s;
  ctx.quadraticCurveTo(fh - 0.06 * s * p.forehead, fy * (0.72 + 0.34 * p.forehead), browX + 0.02 * s, browY - 0.1 * s - 0.06 * s * p.brow);
  ctx.quadraticCurveTo(browX - 0.04 * s * p.brow, browY - 0.04 * s, browX + 0.08 * s, browY + 0.05 * s);
  ctx.quadraticCurveTo(-0.76 * s, 0.06 * s, jutX + 0.04 * s, 0.26 * s);
  ctx.lineTo(jutX, 0.4 * s);
  ctx.lineTo(jutX + 0.08 * s, 0.5 * s);
  ctx.lineTo(-0.28 * s, 0.42 * s);
  ctx.quadraticCurveTo(-0.14 * s, 0.34 * s, -0.08 * s, 0.26 * s);
  ctx.quadraticCurveTo(0.2 * s, 0.34 * s, nape * 0.72, 0.16 * s);
  ctx.closePath();
  };
  cran(); ctx.fillStyle = bone; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = alpha(lighten(bone, 0.7), 0.5); ctx.beginPath(); ctx.ellipse(-0.1 * s, fy * 0.62, 0.42 * s, 0.18 * s, -0.2, 0, 6.3); ctx.fill();
  ctx.fillStyle = alpha(darken(bone, 0.4), 0.2); ctx.beginPath(); ctx.ellipse(nape * 0.8, 0.1 * s, 0.5 * s, 0.34 * s, 0, 0, 6.3); ctx.fill();
  ctx.restore();
  cran(); ctx.strokeStyle = edge; ctx.lineWidth = Math.max(2, s * 0.03); ctx.stroke();
  // Eye socket, nose opening, ear hole, teeth.
  ctx.fillStyle = darken(bone, 0.68);
  ctx.beginPath(); ctx.ellipse(browX + 0.26 * s, 0.03 * s, 0.14 * s, 0.13 * s, 0, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.ellipse(jutX * 0.8 - 0.02 * s, 0.24 * s, 0.05 * s, 0.1 * s, 0.25, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.arc(0.1 * s, 0.1 * s, 0.05 * s, 0, 6.3); ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = Math.max(1.5, s * 0.016);
  for (let i = 0; i < 6; i++) { const tx = jutX + 0.09 * s + i * (Math.abs(jutX) - 0.36 * s) / 5; ctx.beginPath(); ctx.moveTo(tx, 0.44 * s); ctx.lineTo(tx + 0.01 * s, 0.53 * s); ctx.stroke(); }
  ctx.restore();
}

// Soil bands: the same names in every lesson that cuts a trench.
export const BANDS = {
  top: (c) => mix(c.elevLow, c.strata3, 0.55),
  brick: (c) => mix(c.strata3, c.bad, 0.22),
  ash: (c) => mix(c.strata6, c.label, 0.2),
  silt: (c) => mix(c.strata5, c.bgSurface, 0.25),
  dust: (c) => mix(c.strata1, c.strata2, 0.28),
  clay: (c) => mix(c.strata2, c.strata3, 0.4),
  base: (c) => mix(c.strata6, c.strata3, 0.42),
};

/** One band of soil with its own grain. kind: a key of BANDS. Fills x, y, w, h. o: { seed, dim, wave }. */
export function drawBand(ctx, c, kind, x, y, w, h, o = {}) {
  const col = BANDS[kind](c), rnd = mulberry32(o.seed ?? kind.length * 31 + 5), ink = darken(col, 0.4), hi = lighten(col, 0.3);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
  const area = w * h / 900;
  if (kind === 'ash') {
    for (let i = 0; i < area * 3; i++) { ctx.fillStyle = alpha(i % 3 ? ink : hi, 0.6); ctx.fillRect(x + rnd() * w, y + rnd() * h, 2 + rnd() * 5, 1.6 + rnd() * 2); }
  } else if (kind === 'silt') {
    ctx.strokeStyle = alpha(hi, 0.5); ctx.lineWidth = 2;
    for (let yy = y + 5; yy < y + h; yy += 8) { ctx.beginPath(); ctx.moveTo(x, yy); for (let xx = 0; xx <= w; xx += 40) ctx.lineTo(x + xx, yy + Math.sin(xx * 0.03 + yy) * 1.5); ctx.stroke(); }
  } else if (kind === 'brick') {
    const bw = 58, bh = 20;
    for (let r = 0, yy = y + 4; yy < y + h; yy += bh + 5, r++) for (let i = 0; i * bw < w + bw; i++) {
      if (rnd() < 0.28) continue;
      const bx = x + i * (bw + 5) - (r % 2) * 24 + rnd() * 7, tilt = (rnd() - 0.5) * 0.14;
      ctx.save(); ctx.translate(bx + bw / 2, yy + bh / 2); ctx.rotate(tilt);
      rr(ctx, -bw / 2, -bh / 2, bw, bh, 3); ctx.fillStyle = lighten(col, 0.16); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
  } else {
    for (let i = 0; i < area * (kind === 'base' ? 3.4 : 2.2); i++) {
      const r = 1 + rnd() * (kind === 'clay' || kind === 'base' ? 4.5 : 2.2);
      ctx.fillStyle = alpha(i % 2 ? ink : hi, 0.34); ctx.beginPath(); ctx.arc(x + rnd() * w, y + rnd() * h, r, 0, 6.3); ctx.fill();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= 1;
  ctx.fillStyle = alpha(darken(col, 0.5), 0.7); ctx.fillRect(x, y + h - 2, w, 2);
  if (o.dim) { ctx.fillStyle = alpha(c.bgSurface, o.dim); ctx.fillRect(x, y, w, h); }
  ctx.restore();
}

/** An animal bone, drawn. x, y centre, s half length. o: { rot, fossil, dim }. */
export function drawBone(ctx, c, x, y, s, o = {}) {
  const tone = o.fossil ? mix(c.strata5, c.strata1, 0.35) : mix(c.strata1, c.bgSurface, 0.5), edge = darken(tone, 0.5);
  ctx.save(); ctx.globalAlpha *= o.dim ?? 1; ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  const w = s * 0.2, k = s * 0.27, parts = () => {
    ctx.beginPath();
    ctx.rect(-s, -w, s * 2, w * 2);
    for (const [cx, cy] of [[-s, -k * 0.8], [-s, k * 0.8], [s, -k * 0.8], [s, k * 0.8]]) { ctx.moveTo(cx + k, cy); ctx.arc(cx, cy, k, 0, 6.3); }
  };
  parts(); ctx.strokeStyle = edge; ctx.lineWidth = Math.max(4, s * 0.1); ctx.stroke();
  parts(); ctx.fillStyle = tone; ctx.fill();
  ctx.fillStyle = alpha(lighten(tone, 0.6), 0.5); ctx.fillRect(-s * 0.8, -w * 0.6, s * 1.6, w * 0.4);
  ctx.restore();
}

/** Ink for text sitting straight on a band. */
export const onBand = (c, kind) => inkOn(c, BANDS[kind](c));
