// SstWorld.js - small shared drawing parts for the L09-L11 scenes of state-society: a hut, a tree, the ground,
// big labels. A helper, not a scene. Earth, stone, palm leaf, river; every colour comes from the scene's tokens.
import { mix, darken, lighten, rr, font, pill, clamp01 } from 'simulations/base/kit/SimLook.js';
import { figureFor, figureLook, solveFigure, paintFigure } from 'simulations/base/kit/SimFigure.js';

// The display face has no i with a macron: its macron lands beside the letter. Such a label uses the body face.
const NO_DISPLAY = /\u012B/;

export const ease = (t) => { const u = clamp01(t); return u * u * (3 - 2 * u); };
export const seg = (t, a, b) => clamp01((t - a) / (b - a));
export const lerp2 = (a, b, k) => a + (b - a) * k;

export const earth = (c) => mix(mix(c.s8, c.waste, 0.55), c.gold, 0.2);
export const stone = (c) => mix(lighten(c.waste, 0.3), c.gold, 0.12);
export const leaf = (c) => mix(c.s3, c.waste, 0.3);
export const thatch = (c) => mix(mix(c.gold, c.waste, 0.3), c.s8, 0.18);
export const sky = (c) => mix(mix(c.glass, c.bgSurface, 0.55), c.gold, 0.08);
// A man and a woman with a fixed look, so a named role never changes between shots.
export const MAN = { outfit: 'kurta', hairStyle: 'short', dupatta: false, bottomStyle: 'dhoti' };
export const WOMAN = { outfit: 'kurti', hairStyle: 'braid', dupatta: true };
export const mud = (c) => mix(c.s8, c.bgSurface, 0.45);
export const riverOf = (c) => mix(c.water, c.s1, 0.5);

/** The ground from y to the frame's foot: a flat band with one lighter strip along the top. */
export function ground(ctx, c, y, W = 680, H = 520, col = null) {
  const g = col ?? mix(earth(c), c.bgDeep, 0.28);
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, H - y);
  ctx.fillStyle = lighten(g, 0.14);
  ctx.fillRect(0, y, W, 7);
}

/** A thatched hut. x: centre, y: ground, w: width. */
export function hut(ctx, c, x, y, w, o = {}) {
  const h = w * 0.5, roof = w * 0.46, wall = o.wall ?? mud(c), top = o.roof ?? thatch(c);
  ctx.fillStyle = darken(wall, 0.2);
  rr(ctx, x - w * 0.42, y - h - 2, w * 0.84, h + 4, w * 0.04); ctx.fill();
  ctx.fillStyle = wall;
  rr(ctx, x - w * 0.4, y - h, w * 0.8, h, w * 0.03); ctx.fill();
  ctx.fillStyle = darken(wall, 0.42);
  rr(ctx, x - w * 0.1, y - h * 0.68, w * 0.2, h * 0.68, w * 0.03); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - w * 0.56, y - h + 3);
  ctx.quadraticCurveTo(x - w * 0.12, y - h - roof * 0.9, x, y - h - roof);
  ctx.quadraticCurveTo(x + w * 0.12, y - h - roof * 0.9, x + w * 0.56, y - h + 3);
  ctx.closePath();
  ctx.fillStyle = darken(top, 0.18); ctx.fill();
  ctx.save(); ctx.translate(-w * 0.02, -w * 0.02);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y - h - 2);
  ctx.quadraticCurveTo(x - w * 0.12, y - h - roof * 0.88, x, y - h - roof * 0.96);
  ctx.quadraticCurveTo(x + w * 0.1, y - h - roof * 0.8, x + w * 0.46, y - h - 2);
  ctx.closePath();
  ctx.fillStyle = top; ctx.fill(); ctx.restore();
}

/** A rounded tree. x: trunk, y: ground, h: height. */
export function tree(ctx, c, x, y, h, o = {}) {
  const col = o.col ?? leaf(c);
  ctx.fillStyle = darken(mix(c.s8, c.waste, 0.5), 0.3);
  rr(ctx, x - h * 0.05, y - h * 0.5, h * 0.1, h * 0.5, h * 0.03); ctx.fill();
  const blob = (bx, by, r, k) => { ctx.fillStyle = k; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); };
  blob(x - h * 0.17, y - h * 0.58, h * 0.24, darken(col, 0.2));
  blob(x + h * 0.19, y - h * 0.56, h * 0.23, darken(col, 0.2));
  blob(x, y - h * 0.74, h * 0.28, col);
  blob(x - h * 0.09, y - h * 0.8, h * 0.13, lighten(col, 0.14));
}

/** A low mat or log to sit on. */
export function log(ctx, c, x, y, w, h = 16) {
  ctx.fillStyle = darken(mix(c.s8, c.waste, 0.45), 0.2);
  rr(ctx, x - w / 2, y, w, h, h * 0.45); ctx.fill();
  ctx.fillStyle = lighten(mix(c.s8, c.waste, 0.45), 0.08);
  rr(ctx, x - w / 2, y, w, h * 0.45, h * 0.22); ctx.fill();
}

/** Text with nothing behind it, in the label ink. */
export function say(ctx, c, text, x, y, o = {}) {
  ctx.save();
  ctx.font = font(c, o.weight ?? 700, o.size ?? 28, (o.display ?? true) && !NO_DISPLAY.test(text));
  ctx.fillStyle = o.col ?? c.label;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha *= o.a ?? 1;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** A big reading on a flat lipped plate, centred on (x, y). */
export function plate(ctx, c, text, x, y, o = {}) {
  return pill(ctx, c, text, x, y, { size: o.size ?? 28, display: !NO_DISPLAY.test(text), bg: o.bg ?? c.bgSurface, ink: o.ink ?? c.label, ...o });
}

// A person, solved once per pose and theme: these scenes redraw whole frames, and solving a figure each frame is the
// costly part. The arguments are those of figureFor.
const PEOPLE = new WeakMap();
export function person(scene, ctx, c, o) {
  let m = PEOPLE.get(scene);
  if (!m) { m = new Map(); PEOPLE.set(scene, m); }
  const key = `${c.bgSurface}|${c.label}|${JSON.stringify(o)}`;
  let hit = m.get(key);
  if (!hit) {
    if (m.size > 80) m.clear();
    const spec = figureFor(scene, o);
    hit = { sk: solveFigure(spec), look: figureLook(c, spec.look) };
    m.set(key, hit);
  }
  paintFigure(ctx, c, hit.sk, hit.look);
}
