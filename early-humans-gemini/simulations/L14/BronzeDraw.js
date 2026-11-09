// BronzeDraw.js - drawn things for the L14 canvas scenes: ziggurat, pyramid, village, canal bank, ore. Not a scene.
import { darken, lighten, mix, rr } from 'simulations/base/kit/SimLook.js';

export function tier(ctx, x, y, w, h, col, r = 6) {
  rr(ctx, x, y + 4, w, h, r); ctx.fillStyle = darken(col, 0.42); ctx.fill();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.45); ctx.stroke();
}

/** A stepped temple tower, foot centre at (x, y), s = 1 is about 300 wide. */
export function zigguratArt(ctx, c, x, y, s = 1) {
  const a = mix(c.strata2, c.strata1, 0.3), b = c.strata1;
  [[300, 70, a], [214, 60, b], [130, 54, a]].reduce((yy, [w, h, col]) => { tier(ctx, x - w * s / 2, yy - h * s, w * s, h * s, col); return yy - h * s; }, y);
  rr(ctx, x - 16 * s, y - 184 * s, 32 * s, 184 * s, 3); ctx.fillStyle = darken(a, 0.2); ctx.fill();
  ctx.strokeStyle = darken(a, 0.45); ctx.lineWidth = 2; for (let i = 1; i < 14; i++) { ctx.beginPath(); ctx.moveTo(x - 15 * s, y - i * 13 * s); ctx.lineTo(x + 15 * s, y - i * 13 * s); ctx.stroke(); }
  tier(ctx, x - 40 * s, y - 228 * s, 80 * s, 44 * s, c.s1, 4);
}

/** A pyramid in limestone, foot centre at (x, y), w wide. */
export function pyramidArt(ctx, c, x, y, w) {
  const h = w * 0.62, L = mix(c.strata1, c.bgSurface, 0.2);
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.1, y); ctx.closePath(); ctx.fillStyle = lighten(L, 0.1); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.1, y); ctx.closePath(); ctx.fillStyle = darken(L, 0.22); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = darken(L, 0.3);
  for (let i = 1; i < 8; i++) { const k = i / 8; ctx.beginPath(); ctx.moveTo(x - (w / 2) * (1 - k), y - h * k); ctx.lineTo(x + w * 0.1 * (1 - k), y - h * k); ctx.lineTo(x + (w / 2) * (1 - k), y - h * k); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.lineWidth = 3.5; ctx.strokeStyle = darken(L, 0.45); ctx.stroke();
}

/** A round thatched hut, foot centre at (x, y). */
export function hutArt(ctx, c, x, y, s = 1) {
  const w = c.strata3, t = mix(c.gold, c.strata3, 0.28);
  tier(ctx, x - 44 * s, y - 56 * s, 88 * s, 56 * s, w, 6);
  ctx.beginPath(); ctx.moveTo(x - 58 * s, y - 50 * s); ctx.lineTo(x, y - 100 * s); ctx.lineTo(x + 58 * s, y - 50 * s); ctx.closePath(); ctx.fillStyle = t; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(t, 0.42); ctx.stroke();
  rr(ctx, x - 12 * s, y - 36 * s, 24 * s, 36 * s, 4); ctx.fillStyle = darken(w, 0.5); ctx.fill();
}

/** A trench seen from the side, between (x1) and (x2), water level wet 0..1. */
export function canalArt(ctx, c, x1, x2, y, deep, wet = 0) {
  const soil = mix(c.strata3, c.strata2, 0.4);
  ctx.fillStyle = soil; ctx.fillRect(0, y, 680, 520 - y);
  ctx.fillStyle = darken(soil, 0.26); ctx.fillRect(0, y, 680, 5);
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + 30, y + deep); ctx.lineTo(x2 - 30, y + deep); ctx.lineTo(x2, y); ctx.closePath(); ctx.fillStyle = darken(soil, 0.32); ctx.fill();
  if (wet > 0) { const yy = y + deep * (1 - wet); ctx.beginPath(); ctx.moveTo(x1 + 30 * (yy - y) / deep, yy); ctx.lineTo(x1 + 30, y + deep); ctx.lineTo(x2 - 30, y + deep); ctx.lineTo(x2 - 30 * (yy - y) / deep, yy); ctx.closePath(); ctx.fillStyle = c.seaShallow; ctx.fill(); }
}

/** A lump of ore or metal, centre (x, y). */
export function lumpArt(ctx, x, y, r, col) {
  const pts = [[-1, 0.1], [-0.7, -0.6], [-0.1, -0.85], [0.6, -0.6], [1, 0.05], [0.7, 0.62], [-0.1, 0.8], [-0.8, 0.6]];
  ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(x + a * r, y + b * r) : ctx.moveTo(x + a * r, y + b * r))); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 0.5 * r, y - 0.3 * r); ctx.lineTo(x, y - 0.55 * r); ctx.lineTo(x + 0.4 * r, y - 0.3 * r); ctx.strokeStyle = lighten(col, 0.4); ctx.lineWidth = 3; ctx.stroke();
}

/** A flat bronze axe head, centre (x, y). */
export function bronzeAxe(ctx, c, x, y, s = 1) {
  const b = mix(c.gold, c.strata3, 0.4);
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5); ctx.scale(s, s);
  rr(ctx, -8, -70, 16, 150, 7); ctx.fillStyle = c.strata3; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(c.strata3, 0.45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, -60); ctx.lineTo(-10, -30); ctx.quadraticCurveTo(-34, -22, -46, 2); ctx.quadraticCurveTo(-60, -40, -52, -86); ctx.quadraticCurveTo(-30, -66, -10, -60); ctx.closePath();
  ctx.fillStyle = b; ctx.fill(); ctx.strokeStyle = darken(b, 0.45); ctx.stroke();
  ctx.restore();
}

/** A square stele of dark stone with rows of marks. Centre foot (x, y). */
export function steleArt(ctx, c, x, y, w, h) {
  const st = mix(c.strata6, c.strata5, 0.3);
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h * 0.85); ctx.quadraticCurveTo(x, y - h * 1.12, x + w / 2, y - h * 0.85); ctx.lineTo(x + w / 2, y); ctx.closePath();
  ctx.fillStyle = st; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = darken(st, 0.45); ctx.stroke();
  ctx.strokeStyle = lighten(st, 0.45); ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) { const yy = y - h * 0.08 - i * h * 0.075; ctx.beginPath(); ctx.moveTo(x - w * 0.36, yy); ctx.lineTo(x + w * 0.36, yy); ctx.stroke(); }
}
