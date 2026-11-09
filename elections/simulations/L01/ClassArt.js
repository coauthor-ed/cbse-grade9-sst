// ClassArt.js - the L01 classroom and the three-question cards. A helper, not a scene: no class here.
import { mix, darken, rr, font } from 'simulations/base/kit/SimLook.js';
import { room, who, tag, drawCivic } from '../shared/DayKit.js';

const GURMAT = { outfit: 'kurti', hairStyle: 'braid', dupatta: false, bottom: 'cream', glasses: false, pattern: 'none' };

/** Wall, floor, a blackboard with up to two lines of chalk. */
export function classroom(ctx, c, lines) {
  room(ctx, c, { ground: 296, wall: mix(c.bgSurface, c.gold, 0.14) });
  const X = 150, Y = 20, W = 380, H = 150;
  ctx.fillStyle = mix(c.s8, c.label, 0.5); rr(ctx, X - 8, Y - 8, W + 16, H + 18, 12); ctx.fill();
  ctx.fillStyle = mix(c.s3, c.label, 0.55); rr(ctx, X, Y, W, H, 8); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.bgSurface; ctx.fillStyle = mix(c.bgSurface, c.gold, 0.1);
  lines.forEach((l, i) => { ctx.font = font(c, 700, i === 0 ? 40 : 32, true); ctx.fillText(l, X + W / 2, Y + (lines.length === 1 ? H / 2 : 48 + i * 58)); });
}

/** Classmates in two groups at the sides. pose: 'reach-up' with hands raised, 'stand' otherwise. */
export function classmates(ctx, scene, pose) {
  [[58, 3], [150, 2], [242, 6], [438, 5], [530, 4], [622, 7]].forEach(([x, i]) => who(ctx, scene, { role: 'student', x, y: 346, height: 168, i, pose, facing: 0, mood: 'smile' }));
}

export const gurmat = (ctx, scene, o = {}) => who(ctx, scene, { role: 'student', x: 340, y: 446, height: 276, i: 1, facing: 0, mood: 'smile', look: GURMAT, ...o });

/** A card with a thing in it and a line under it. draw(cx, groundY) paints the thing. */
export function questionCard(ctx, c, x, w, title, tone, answer, k, draw) {
  ctx.save(); ctx.globalAlpha *= Math.min(1, Math.max(0, k));
  const y = 26, h = 400, col = c[tone];
  ctx.fillStyle = darken(col, 0.2); rr(ctx, x, y + 5, w, h, 20); ctx.fill();
  ctx.fillStyle = mix(c.bgSurface, col, 0.12); rr(ctx, x, y, w, h, 20); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  draw(x + w / 2, y + 236);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label; ctx.font = font(c, 700, 25, true);
  title.forEach((t, i) => ctx.fillText(t, x + w / 2, y + 268 + i * 30));
  tag(ctx, c, answer, x + w / 2, y + 362, { bg: tone, size: 42 });
  ctx.restore();
}

/** A ballot paper with one plain mark on it. */
export function oneMarkBallot(ctx, c, cx, base) {
  const w = 126, h = 176, x = cx - w / 2, y = base - h;
  ctx.fillStyle = c.bgSurface; rr(ctx, x, y, w, h, 8); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.stroke; ctx.stroke();
  ctx.lineWidth = 7; ctx.strokeStyle = c.label; ctx.beginPath(); ctx.arc(cx, y + 56, 30, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = c.stroke;
  [118, 144].forEach((yy) => { ctx.beginPath(); ctx.moveTo(x + 16, y + yy); ctx.lineTo(x + w - 16, y + yy); ctx.stroke(); });
}

export const threeCards = (ctx, scene, age, answers) => {
  const c = scene.colors, w = 212, g = 12, x0 = 8;
  const pop = (at) => (age - at) / 0.3;
  questionCard(ctx, c, x0, w, ['Gurmat in', 'Grade 9'], 's1', answers[0], pop(0), (cx, b) => who(ctx, scene, { role: 'student', x: cx, y: b, height: 200, i: 1, facing: 0, mood: 'smile', look: GURMAT }));
  questionCard(ctx, c, x0 + w + g, w, ['Government', 'past its term'], 's3', answers[1], pop(0.2), (cx, b) => drawCivic(ctx, c, 'parliament', cx, b - 20, { w: 190 }));
  questionCard(ctx, c, x0 + 2 * (w + g), w, ['Only one party', 'contesting'], 's5', answers[2], pop(0.4), (cx, b) => oneMarkBallot(ctx, c, cx, b - 8));
};
