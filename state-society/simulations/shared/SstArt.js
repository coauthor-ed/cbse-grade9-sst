// SstArt.js - drawn things shared by the state-society scenes: an earth palette made only from
// sim tokens, huts, fire, trees, palm leaf, stone, a bullock carriage, ancient-dress figures and
// the panel a scene sits on. Functions only. The look comes from tokens and LookProfile, so the
// plain look stays safe. Faces go on people, never on evidence (rock, plate, coin, book).
import { alpha, mix, lighten, darken, rr, ellipse, drawShadow, mulberry32, font, inkOn } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';

export const TAU = Math.PI * 2;

/** The module's earth colours, all mixed from tokens. */
export function pal(c) {
  const base = c.bgSurface;
  return {
    earth: mix(c.s8, base, 0.55), earthDark: mix(c.s8, c.label, 0.45),
    sand: mix(c.gold, base, 0.68), sandDark: mix(c.gold, c.label, 0.28),
    thatch: mix(c.gold, c.s8, 0.35), thatchDark: darken(mix(c.gold, c.s8, 0.45), 0.25),
    wood: mix(c.s8, c.label, 0.5), woodLight: mix(c.s8, c.gold, 0.5),
    stone: mix(c.waste, base, 0.3), stoneDark: mix(c.waste, c.label, 0.35), stoneLight: mix(c.waste, base, 0.62),
    leaf: mix(c.s3, c.s8, 0.25), leafDark: mix(c.s3, c.label, 0.4), grass: mix(c.s3, base, 0.62),
    water: c.water, waterDeep: mix(c.water, c.label, 0.3),
    palm: mix(c.gold, base, 0.5), palmEdge: mix(c.gold, c.s8, 0.55),
    ink: mix(c.label, c.s8, 0.15), panel: mix(base, c.gold, 0.1),
  };
}

/** A rimmed panel with a flat lip. o: { fill, rim, r, lit, off }. */
export function panel(ctx, c, x, y, w, h, o = {}) {
  const L = lookOf();
  const fill = o.fill ?? mix(c.bgSurface, c.gold, 0.08), rim = o.rim ?? c.stroke, r = (o.r ?? 18) * (L.radius ?? 1);
  ctx.save();
  if (o.off) ctx.globalAlpha *= 0.34;
  rr(ctx, x, y + 4 * (L.lip ?? 1), w, h, r); ctx.fillStyle = darken(rim, 0.25); ctx.fill();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = (o.lit ? 4 : 2.5) * Math.max(0.5, L.rim ?? 1); ctx.strokeStyle = o.lit ? (o.litCol ?? c.accent) : rim; ctx.stroke();
  ctx.restore();
}

/** A round thatched hut with its door to the viewer. (x, y) ground centre, s scale (1 = 80 px wide). */
export function hut(ctx, c, x, y, s = 1, o = {}) {
  const p = pal(c), w = 80 * s, h = 34 * s;
  drawShadow(ctx, c, x, y + 2, w * 0.56, 8 * s);
  rr(ctx, x - w * 0.4, y - h, w * 0.8, h, 6 * s); ctx.fillStyle = o.wall ?? p.sand; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = p.earthDark; ctx.stroke();
  rr(ctx, x - 9 * s, y - h * 0.78, 18 * s, h * 0.78, 8 * s); ctx.fillStyle = p.earthDark; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - w * 0.56, y - h * 0.86);
  ctx.quadraticCurveTo(x - w * 0.2, y - h * 1.4, x, y - h * 2.2);
  ctx.quadraticCurveTo(x + w * 0.2, y - h * 1.4, x + w * 0.56, y - h * 0.86);
  ctx.quadraticCurveTo(x, y - h * 0.6, x - w * 0.56, y - h * 0.86);
  ctx.fillStyle = p.thatch; ctx.fill(); ctx.strokeStyle = p.thatchDark; ctx.stroke();
  ctx.strokeStyle = alpha(p.thatchDark, 0.6); ctx.lineWidth = 1.5;
  for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x + k * 3 * s, y - h * 2); ctx.lineTo(x + k * 16 * s, y - h * 0.92); ctx.stroke(); }
}

/** A small cooking fire. t seconds, 0 = still. */
export function fire(ctx, c, x, y, s = 1, t = 0) {
  const p = pal(c);
  ctx.strokeStyle = p.wood; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 16 * s, y); ctx.lineTo(x + 16 * s, y - 6 * s); ctx.moveTo(x + 16 * s, y); ctx.lineTo(x - 16 * s, y - 6 * s); ctx.stroke();
  const f = 1 + Math.sin(t * 7) * 0.06;
  for (const [k, col] of [[1, c.flame], [0.6, c.gold]]) {
    ctx.beginPath();
    ctx.moveTo(x - 13 * s * k, y - 4 * s);
    ctx.quadraticCurveTo(x - 15 * s * k, y - 22 * s * k * f, x, y - 38 * s * k * f);
    ctx.quadraticCurveTo(x + 15 * s * k, y - 22 * s * k * f, x + 13 * s * k, y - 4 * s);
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
}

/** A round-crowned tree. */
export function tree(ctx, c, x, y, s = 1, seed = 1) {
  const p = pal(c), r = mulberry32(seed);
  drawShadow(ctx, c, x, y, 26 * s, 6 * s);
  rr(ctx, x - 5 * s, y - 40 * s, 10 * s, 40 * s, 3 * s); ctx.fillStyle = p.wood; ctx.fill();
  for (let i = 0; i < 4; i++) {
    const a = r() * TAU, d = 12 * s;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y - 58 * s + Math.sin(a) * d * 0.7, (18 + r() * 8) * s, 0, TAU);
    ctx.fillStyle = i % 2 ? p.leaf : mix(p.leaf, p.leafDark, 0.3); ctx.fill();
  }
}

/** A palm-leaf folio. lines: rows of little script dashes, drawn, never legible. */
export function palmLeaf(ctx, c, x, y, w, h, o = {}) {
  const p = pal(c), r = mulberry32(o.seed ?? 3);
  ctx.save();
  if (o.rot) { ctx.translate(x + w / 2, y + h / 2); ctx.rotate(o.rot); ctx.translate(-x - w / 2, -y - h / 2); }
  rr(ctx, x, y + 4, w, h, h * 0.28); ctx.fillStyle = darken(p.palmEdge, 0.2); ctx.fill();
  rr(ctx, x, y, w, h, h * 0.28); ctx.fillStyle = o.fill ?? p.palm; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = p.palmEdge; ctx.stroke();
  ctx.fillStyle = p.ink;
  const rows = o.rows ?? 3;
  for (let i = 0; i < rows; i++) {
    let xx = x + h * 0.4; const yy = y + (h * (i + 0.7)) / (rows + 0.4);
    while (xx < x + w - h * 0.4) { const d = 5 + r() * 12; if (Math.abs(xx + d / 2 - x - w / 2) > 8) ctx.fillRect(xx, yy, d, 2.4); xx += d + 3; }
  }
  ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, Math.min(5, h * 0.09), 0, TAU); ctx.fillStyle = p.palmEdge; ctx.fill();
  ctx.restore();
}

/** Ancient dress on the kit figure: a plain drape, sandals, no costume of any one group. */
/** Look overrides for a man, for the kings and officers the book writes of as men. */
export const MAN = { hairStyle: 'short', moustache: true, dupatta: false };

export const DRAPE = { outfit: 'drape', bottom: 'cream', shoeStyle: 'sandal', pattern: 'none', glasses: false };

/** A person in plain drape. o: role, x, y, height, pose, facing, i, mood, hands, seat, look, t, behind, between. */
export function person(ctx, scene, o = {}) {
  const c = scene.colors;
  const spec = figureFor(scene, { role: o.role ?? 'adult', pose: o.pose ?? 'stand', x: o.x, y: o.y, height: o.height, facing: o.facing ?? 0, i: o.i ?? 0, mood: o.mood, hands: o.hands, seat: o.seat, hip: o.hip, look: { ...DRAPE, ...(o.look ?? {}) } });
  const look = o.t ? { ...spec.look, t: o.t } : spec.look;
  return drawFigure(ctx, c, spec, look, { behind: o.behind, between: o.between });
}

/** A seeded boulder outline, as a path. Rough, with no face on it. */
export function boulderPath(ctx, cx, cy, rx, ry, seed = 7) {
  const r = mulberry32(seed), pts = [], n = 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, k = 0.9 + r() * 0.18;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    if (i === 0) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(a[0], a[1], mx, my);
  }
  ctx.quadraticCurveTo(pts[0][0], pts[0][1], (pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
  ctx.closePath();
}

/** One wooden spoked wheel. */
export function wheel(ctx, c, x, y, r, angle = 0, o = {}) {
  const p = pal(c);
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.lineWidth = r * 0.17; ctx.strokeStyle = o.rim ?? p.wood; ctx.stroke();
  ctx.lineWidth = r * 0.09; ctx.strokeStyle = o.spoke ?? p.woodLight;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, TAU); ctx.fillStyle = p.wood; ctx.fill();
  ctx.restore();
}

/** Crown mark for king lines. Drawn, not an emoji. */
export function crown(ctx, c, x, y, s = 1, col) {
  const k = col ?? c.gold;
  ctx.beginPath();
  ctx.moveTo(x - 22 * s, y + 14 * s); ctx.lineTo(x - 26 * s, y - 12 * s); ctx.lineTo(x - 11 * s, y + 2 * s);
  ctx.lineTo(x, y - 18 * s); ctx.lineTo(x + 11 * s, y + 2 * s); ctx.lineTo(x + 26 * s, y - 12 * s); ctx.lineTo(x + 22 * s, y + 14 * s);
  ctx.closePath(); ctx.fillStyle = k; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = darken(k, 0.35); ctx.lineJoin = 'round'; ctx.stroke();
}

/** Big centred text in Fredoka, for one short label. */
export function reading(ctx, c, text, x, y, size = 28, col) {
  ctx.font = font(c, 700, size, !/\u012B/.test(text)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';   // the display face has no i-macron
  ctx.fillStyle = col ?? c.label; ctx.fillText(text, x, y);
}
export { inkOn, lighten, ellipse };
