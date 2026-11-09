// PartyWorld.js - the daylight world for the elections L06 to L08 scenes (copied from democracy CivicWorld). A helper, not a scene.
// Colours are mixed from tokens, so dark is night and the plain look stays safe.
import { mix, darken, lighten, rr, ellipse, font, clamp01, outBack, pill, drawShadow, inkOn, alpha } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';

export const TAU = Math.PI * 2;

/** Spring from 0 to 1, starting at time `at`. */
export const pop = (age, at = 0, dur = 0.42) => outBack(clamp01((age - at) / dur));

export function tones(c) {
  const base = c.bgSurface;
  return {
    sky: mix(c.water, base, 0.68), skyLow: mix(c.water, base, 0.84), hill: mix(c.s3, base, 0.58), hillFar: mix(c.water, base, 0.5),
    ground: mix(c.s3, base, 0.42), groundDark: mix(c.s3, c.label, 0.34), road: mix(c.gold, base, 0.56), roadEdge: mix(c.gold, c.s8, 0.5),
    sand: mix(c.gold, base, 0.46), sandDark: mix(c.gold, c.s8, 0.42), rock: mix(c.waste, base, 0.34), rockDark: mix(c.waste, c.label, 0.42),
    snow: mix(base, c.water, 0.08), leaf: mix(c.s3, c.s8, 0.2), leafDark: mix(c.s3, c.label, 0.42), wood: darken(c.s8, 0.22),
    water: mix(c.water, base, 0.28), waterDark: mix(c.water, c.label, 0.26), plaster: mix(c.gold, base, 0.8), grey: mix(c.waste, base, 0.55), greyDark: mix(c.waste, c.label, 0.5),
    sun: mix(c.gold, base, 0.42),
  };
}

/** Sky, far hills and ground. o: ground (y), hills (false for none), sun (false for none). */
export function day(ctx, c, W, H, o = {}) {
  const t = tones(c), g = o.ground ?? 340;
  ctx.fillStyle = t.sky; ctx.fillRect(0, 0, W, g);
  ctx.fillStyle = t.skyLow; ctx.fillRect(0, g * 0.55, W, g * 0.45);
  if (o.sun !== false) { ctx.fillStyle = t.sun; ellipse(ctx, 92, 74, 40, 40); ctx.fill(); }
  if (o.hills !== false) {
    ctx.fillStyle = t.hillFar;
    ctx.beginPath(); ctx.moveTo(0, g);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, g - 46 - 26 * Math.sin(x / 90 + 1) - 12 * Math.sin(x / 37));
    ctx.lineTo(W, g); ctx.fill();
    ctx.fillStyle = t.hill;
    ctx.beginPath(); ctx.moveTo(0, g);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, g - 18 - 16 * Math.sin(x / 70 + 3));
    ctx.lineTo(W, g); ctx.fill();
  }
  ctx.fillStyle = t.ground; ctx.fillRect(0, g, W, H - g);
  ctx.fillStyle = darken(t.ground, 0.08); ctx.fillRect(0, g, W, 5);
}

/** A person in everyday clothes. o: role, x, y, height, pose, facing, i, mood, hands, feet, seat, hip, look, phase, walk, between, behind. */
export function folk(ctx, scene, o = {}) {
  const spec = figureFor(scene, { role: o.role ?? 'adult', pose: o.pose ?? 'stand', x: o.x, y: o.y, height: o.height, facing: o.facing ?? 0, i: o.i ?? 0, mood: o.mood, hands: o.hands, seat: o.seat, hip: o.hip, look: o.look ?? {} });
  if (o.walk != null) spec.walk = o.walk;
  return drawFigure(ctx, scene.colors, spec, spec.look, { behind: o.behind, between: o.between });
}

/** A rimmed tile with a flat lip. o: fill, rim, r, lit, dim. */
export function tile(ctx, c, x, y, w, h, o = {}) {
  const L = lookOf(), r = (o.r ?? 16) * (L.radius ?? 1), rim = o.rim ?? c.stroke, fill = o.fill ?? c.bgSurface;
  ctx.save();
  if (o.dim) ctx.globalAlpha *= 0.42;
  if (L.lip > 0) { rr(ctx, x, y + 4 * L.lip, w, h, r); ctx.fillStyle = darken(rim, 0.25); ctx.fill(); }
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = (o.lit ? 4 : 2.5) * Math.max(0.5, L.rim ?? 1); ctx.strokeStyle = o.lit ? (o.litCol ?? c.accent) : rim; ctx.stroke();
  ctx.restore();
}

/** Text in the display face or body face. o: size, col, weight, align, display. */
export function say(ctx, c, text, x, y, o = {}) {
  ctx.font = font(c, o.weight ?? 700, o.size ?? 28, o.display ?? true);
  ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = o.col ?? c.label; ctx.fillText(text, x, y);
}

/** A tag on an opaque fill, sized for the phone. */
export const tag = (ctx, c, text, x, y, o = {}) => pill(ctx, c, text, x, y, { size: 28, bg: c.bgSurface, ...o, ink: o.ink ?? (o.bg ? undefined : c.label) });

// -- four kinds of land, each drawn into a box whose bottom edge is its ground ----------------------
export function mountain(ctx, c, x, y, w, h) {
  const t = tones(c);
  ctx.fillStyle = t.rockDark; ctx.beginPath(); ctx.moveTo(x + w * 0.42, y - h * 0.72); ctx.lineTo(x + w, y); ctx.lineTo(x + w * 0.1, y); ctx.fill();
  ctx.fillStyle = t.rock; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.3, y - h); ctx.lineTo(x + w * 0.74, y); ctx.fill();
  ctx.fillStyle = t.snow; ctx.beginPath(); ctx.moveTo(x + w * 0.3, y - h); ctx.lineTo(x + w * 0.4, y - h * 0.66); ctx.lineTo(x + w * 0.32, y - h * 0.74); ctx.lineTo(x + w * 0.26, y - h * 0.62); ctx.lineTo(x + w * 0.2, y - h * 0.68); ctx.fill();
}
export function pine(ctx, c, x, y, s = 1) {
  const t = tones(c);
  ctx.fillStyle = t.wood; ctx.fillRect(x - 5 * s, y - 22 * s, 10 * s, 22 * s);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 1 ? t.leaf : t.leafDark;
    ctx.beginPath(); ctx.moveTo(x, y - (108 - i * 26) * s); ctx.lineTo(x + (26 + i * 9) * s, y - (48 - i * 12) * s); ctx.lineTo(x - (26 + i * 9) * s, y - (48 - i * 12) * s); ctx.fill();
  }
}
export function dunes(ctx, c, x, y, w, h) {
  const t = tones(c);
  ctx.fillStyle = t.sandDark; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w * 0.4, y - h * 1.5, x + w, y - h * 0.3); ctx.lineTo(x + w, y); ctx.fill();
  ctx.fillStyle = t.sand; ctx.beginPath(); ctx.moveTo(x, y - h * 0.2); ctx.quadraticCurveTo(x + w * 0.55, y - h * 0.96, x + w, y); ctx.lineTo(x, y); ctx.fill();
}
export function sea(ctx, c, x, y, w, h) {
  const t = tones(c);
  ctx.fillStyle = t.water; ctx.fillRect(x, y - h, w, h);
  ctx.strokeStyle = t.skyLow; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const yy = y - h + 16 + i * (h / 5), xx = x + 12 + ((i * 53) % Math.max(10, w - 60)); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 40, yy); ctx.stroke(); }
  ctx.fillStyle = t.sand; ellipse(ctx, x + w * 0.5, y - h * 0.46, w * 0.34, h * 0.28); ctx.fill();
}

export { mix, darken, lighten, rr, ellipse, font, clamp01, pill, drawShadow, inkOn, alpha };

// -- election bits shared by L06 to L08 --------------------------------------------------------------

export const WALL = { BOARDS: 0, PARTIES: 1, RALLY: 2, YOU: 3, BEHIND: 4, CLASS: 5 };

/** A plain ballot mark: 'circle', 'triangle' or 'square'. Never an object: most objects are real symbols. */
export function mark(ctx, c, kind, x, y, r, o = {}) {
  ctx.save();
  ctx.lineWidth = o.lw ?? 5; ctx.strokeStyle = o.col ?? c.label; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (kind === 'circle') ctx.arc(x, y, r, 0, TAU);
  else if (kind === 'triangle') { ctx.moveTo(x, y - r * 1.05); ctx.lineTo(x + r, y + r * 0.8); ctx.lineTo(x - r, y + r * 0.8); ctx.closePath(); }
  else rr(ctx, x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 3);
  ctx.stroke();
  ctx.restore();
}

export const hi = (c) => mix(c.gold, c.bgSurface, 0.6);

/** A paper label sized to its text: reads over any ground. */
export const label = (ctx, c, text, x, y, o = {}) => pill(ctx, c, text, x, y, { size: 26, bg: c.bgSurface, ink: c.label, ...o });

/** A candidate's board on two posts. No face on it: the photo box holds a plain head-and-shoulders outline. */
export function candidateBoard(ctx, c, x, y, w, h, o = {}) {
  const t = tones(c);
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.fillStyle = t.wood; ctx.fillRect(x + 16, y + h - 2, 10, o.post ?? 30); ctx.fillRect(x + w - 26, y + h - 2, 10, o.post ?? 30);
  tile(ctx, c, x, y, w, h, { fill: c.bgSurface, r: 10, lit: o.lit });
  const ph = h - 58, pw = Math.min(ph * 0.9, w * 0.46), px = x + 12, py = y + 10;
  ctx.fillStyle = t.grey; rr(ctx, px, py, pw, ph, 6); ctx.fill();
  ctx.save(); rr(ctx, px, py, pw, ph, 6); ctx.clip();
  ctx.fillStyle = mix(t.grey, c.bgSurface, 0.55);
  ellipse(ctx, px + pw / 2, py + ph * 0.38, pw * 0.2, pw * 0.2); ctx.fill();
  ellipse(ctx, px + pw / 2, py + ph * 1.02, pw * 0.38, ph * 0.36); ctx.fill();
  ctx.restore();
  mark(ctx, c, o.mark ?? 'circle', px + pw + (w - 24 - pw) / 2 + 2, py + ph / 2, Math.min(ph * 0.3, 24));
  ctx.font = font(c, 700, o.size ?? 26, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
  ctx.fillText(o.name ?? '', x + w / 2, y + h - 24);
  ctx.restore();
}

/** Two-line wrap into a centred box. */
export function lines(ctx, c, text, x, y, o = {}) {
  const parts = Array.isArray(text) ? text : [text];
  const lh = o.lh ?? (o.size ?? 26) * 1.18;
  parts.forEach((p, i) => say(ctx, c, p, x, y + (i - (parts.length - 1) / 2) * lh, { size: o.size ?? 26, col: o.col, display: o.display, weight: o.weight, align: o.align }));
}

export const FILES = { BOTH: 0, BARS: 1, EMPTY: 2, STAMPED: 3, HOW: 4 };

/** A tick or a cross, drawn: the harness font never decides it. */
export function tickOrCross(ctx, c, ok, x, y, r = 14) {
  ctx.save(); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = ok ? c.good : c.bad;
  ctx.beginPath();
  if (ok) { ctx.moveTo(x - r, y); ctx.lineTo(x - r * 0.25, y + r * 0.8); ctx.lineTo(x + r, y - r * 0.8); }
  else { ctx.moveTo(x - r * 0.8, y - r * 0.8); ctx.lineTo(x + r * 0.8, y + r * 0.8); ctx.moveTo(x + r * 0.8, y - r * 0.8); ctx.lineTo(x - r * 0.8, y + r * 0.8); }
  ctx.stroke(); ctx.restore();
}

/** A plain seat on two wheels, drawn around a seated figure. */
export function wheelchair(ctx, c, x, y, s = 1) {
  ctx.save(); ctx.lineWidth = 7 * s; ctx.strokeStyle = c.label; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y - 44 * s, 44 * s, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 62 * s, y - 14 * s, 14 * s, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 28 * s, y - 126 * s); ctx.lineTo(x - 14 * s, y - 62 * s); ctx.lineTo(x + 54 * s, y - 62 * s); ctx.lineTo(x + 62 * s, y - 28 * s); ctx.stroke();
  ctx.restore();
}

export const ROAD = { TASK: 0, NAMED: 1, EMPTY: 2 };
