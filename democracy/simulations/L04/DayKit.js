// DayKit.js - small drawn helpers for the L04 and L05 canvas scenes. A helper, not a scene: no class here.
// Daylight stage, a person, big tags, thick arrows, a law sheet, a reading card.
// Colours come from tokens only, so both themes and the plain look stay safe.
import { alpha, mix, darken, lighten, rr, font, pill, wrapText, drawShadow, outBack, clamp01 } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';
import { drawCivic as artCivic, civicSize } from '../shared/CivicArt.js';

/** CivicArt's drawing, with a guard: the headless check harness has a Path2D without roundRect. */
export function drawCivic(ctx, c, kind, x, y, o = {}) {
  if (typeof Path2D === 'undefined' || !Path2D.prototype?.roundRect) {
    const s = civicSize(kind), k = o.w ? o.w / s.w : o.h ? o.h / s.h : 1;
    return { x: x - (s.w * k) / 2, y: y - s.h * k, w: s.w * k, h: s.h * k };
  }
  return artCivic(ctx, c, kind, x, y, o);
}

/** A picture too slow to redraw each frame (a detailed map, forty figures), painted once per theme. null with no OffscreenCanvas. */
export function plate(scene, key, c, w, h, paint) {
  if (scene._plateFor !== c) { scene._plateSet = {}; scene._plateFor = c; }
  const set = scene._plateSet;
  if (key in set) return set[key];
  if (typeof OffscreenCanvas === 'undefined') { set[key] = null; return null; }
  const cv = new OffscreenCanvas(w * 2, h * 2), x = cv.getContext('2d');
  x.scale(2, 2);
  paint(x);
  set[key] = cv;
  return cv;
}

export const TAG = 30;                                  // design px: a 680 x 453 scene shows at 0.48-0.52 on a 390 phone

/** How far a thing arrived: 0 before `at`, a spring to 1 over `d` seconds. */
export const pop = (age, at, d = 0.4) => outBack(clamp01((age - at) / d));

/** Sky over ground, one quiet ridge of far trees. The dark theme gets the same world at night. */
export function day(ctx, c, o = {}) {
  const g = o.ground ?? 340, W = o.W ?? 680, H = o.H ?? 453;
  ctx.fillStyle = mix(c.bgSurface, c.water, 0.2); ctx.fillRect(0, 0, W, H);
  if (o.sun !== false) { ctx.fillStyle = mix(c.bgSurface, c.gold, 0.5); ctx.beginPath(); ctx.arc(o.sunX ?? 70, 66, 30, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = mix(mix(c.bgSurface, c.water, 0.2), c.s3, 0.2);
  ctx.beginPath(); ctx.moveTo(0, g);
  for (let i = 0; i <= 12; i++) { const x = (i / 12) * W; ctx.quadraticCurveTo(x - W / 24, g - 56 - (i % 3) * 16, x, g - 28); }
  ctx.lineTo(W, g); ctx.closePath(); ctx.fill();
  ctx.fillStyle = o.floor ?? mix(c.bgSurface, c.s3, 0.32); ctx.fillRect(0, g, W, H - g);
  ctx.fillStyle = alpha(c.label, 0.1); ctx.fillRect(0, g, W, 3);
}

/** A room: wall, skirting, floor. */
export function room(ctx, c, o = {}) {
  const g = o.ground ?? 340, W = o.W ?? 680, H = o.H ?? 453;
  ctx.fillStyle = o.wall ?? mix(c.bgSurface, c.gold, 0.16); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(c.bgSurface, c.s8, 0.3); ctx.fillRect(0, g - 16, W, 16);
  ctx.fillStyle = o.floor ?? mix(c.bgSurface, c.s8, 0.46); ctx.fillRect(0, g, W, H - g);
}

/** A person from the kit, in everyday dress. */
export function who(ctx, scene, o) {
  const spec = figureFor(scene, { role: o.role ?? 'adult', pose: o.pose ?? 'stand', x: o.x, y: o.y, height: o.height, facing: o.facing ?? 0, i: o.i ?? 0, mood: o.mood, hands: o.hands, phase: o.phase, seat: o.seat });
  const look = o.look ? { ...spec.look, ...o.look } : spec.look;
  return drawFigure(ctx, scene.colors, spec, look, { behind: o.behind, between: o.between });
}

/** A big flat tag. k: arrival 0..1. */
export function tag(ctx, c, text, x, y, o = {}) {
  const k = o.k ?? 1;
  if (k <= 0.01) return null;
  // a soft fill, so label ink reads in both themes on every tone
  const bg = o.bg ? mix(o.bg, c.bgSurface, 0.56) : c.bgSurface;
  return pill(ctx, c, text, x, y, { size: o.size ?? TAG, bg, ink: c.label, display: o.display ?? true, scale: Math.max(0.02, k), align: o.align });
}

/** A thick arrow with a solid head. k: how far it has drawn, 0..1. bend: sideways pull of the middle. */
export function arrow(ctx, c, x0, y0, x1, y1, o = {}) {
  const k = clamp01(o.k ?? 1), col = o.col ?? c.accent, w = o.w ?? 12, bend = o.bend ?? 0;
  if (k <= 0.01) return;
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
  const at = (t) => ({ x: (1 - t) ** 2 * x0 + 2 * t * (1 - t) * mx + t * t * x1, y: (1 - t) ** 2 * y0 + 2 * t * (1 - t) * my + t * t * y1 });
  const head = w * 2.1, e = at(k), p = at(Math.max(0, k - 0.04)), ang = Math.atan2(e.y - p.y, e.x - p.x);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0);
  for (let i = 1; i <= 24; i++) { const q = at((i / 24) * k); ctx.lineTo(q.x - Math.cos(ang) * (i === 24 ? head * 0.6 : 0), q.y - Math.sin(ang) * (i === 24 ? head * 0.6 : 0)); }
  ctx.stroke();
  ctx.translate(e.x, e.y); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-head, -head * 0.72); ctx.lineTo(-head, head * 0.72); ctx.closePath(); ctx.fill();
  ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

/** A sheet of paper with ruled lines. (x, y) centre. Words are big or absent: never a face. */
export function sheet(ctx, c, x, y, w, h, o = {}) {
  const L = lookOf(), rim = o.rim ?? mix(c.label, c.gold, 0.3);
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  rr(ctx, -w / 2, -h / 2 + 4 * (L.lip ?? 1), w, h, 8); ctx.fillStyle = darken(rim, 0.2); ctx.fill();
  rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.fillStyle = o.fill ?? mix(c.bgSurface, c.gold, 0.14); ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = rim; ctx.stroke();
  ctx.fillStyle = alpha(c.label, 0.42);
  const n = o.lines ?? 4, top = o.title ? -h / 2 + h * 0.42 : -h / 2 + h * 0.2;
  for (let i = 0; i < n; i++) rr(ctx, -w * 0.36, top + (i * (h / 2 - top)) / (n + 0.2) * 0.96, w * (i === n - 1 ? 0.44 : 0.72), Math.max(4, h * 0.036), 2), ctx.fill();
  if (o.title) { ctx.font = font(c, 700, o.size ?? 22, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.title, 0, -h / 2 + h * 0.22); }
  ctx.restore();
}

/** A rimmed reading card with wrapped body text. */
export function card(ctx, c, x, y, w, h, o = {}) {
  const L = lookOf(), rim = o.rim ?? c.stroke, r = 18 * (L.radius ?? 1), size = o.size ?? 27;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  rr(ctx, x, y + 5 * (L.lip ?? 1), w, h, r); ctx.fillStyle = darken(rim, 0.24); ctx.fill();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = o.fill ?? c.bgSurface; ctx.fill();
  ctx.lineWidth = 3 * Math.max(0.5, L.rim ?? 1); ctx.strokeStyle = rim; ctx.stroke();
  let ty = y + 14;
  if (o.title) {
    ctx.font = font(c, 700, o.titleSize ?? 32, true); ctx.fillStyle = o.titleCol ?? c.label; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(o.title, x + 18, ty); ty += (o.titleSize ?? 32) + 12;
  }
  if (o.text) {
    ctx.font = font(c, 700, size); ctx.fillStyle = c.label; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    wrapText(ctx, o.text, x + 18, ty, w - 36, { lh: Math.round(size * 1.24) });
  }
  ctx.restore();
}

export { alpha, mix, darken, lighten, rr, font, pill, drawShadow, clamp01 };
