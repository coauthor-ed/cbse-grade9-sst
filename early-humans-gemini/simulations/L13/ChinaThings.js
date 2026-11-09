// ChinaThings.js - small drawn objects for MandateAndExamScene. Not a scene. Colours from the scene's palette only.
import { darken, lighten, mix, rr, mulberry32 } from 'simulations/base/kit/SimLook.js';

/** A field seen from the side, ripe or failed. */
export function earsField(ctx, c, x, y, w, h, good) {
  const soil = good ? mix(c.strata3, c.elevLow, 0.2) : mix(c.strata1, c.strata2, 0.5);
  rr(ctx, x, y + 5, w, h, 12); ctx.fillStyle = darken(soil, 0.4); ctx.fill();
  rr(ctx, x, y, w, h, 12); ctx.fillStyle = soil; ctx.fill();
  const rnd = mulberry32(good ? 3 : 8);
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const px = x + 16 + i * ((w - 32) / 15), base = y + h - 10, hh = good ? 58 + rnd() * 14 : 18 + rnd() * 10;
    ctx.strokeStyle = good ? c.elevLow : darken(c.strata1, 0.25); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, base); ctx.quadraticCurveTo(px + (good ? 2 : 10), base - hh * 0.6, px + (good ? 4 : 18), base - hh); ctx.stroke();
    if (good) { ctx.fillStyle = c.gold; ctx.beginPath(); ctx.ellipse(px + 4, base - hh - 6, 5, 11, 0.15, 0, 7); ctx.fill(); }
  }
  if (!good) { ctx.strokeStyle = darken(soil, 0.35); ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { const px = x + 30 + i * 52; ctx.beginPath(); ctx.moveTo(px, y + 12); ctx.lineTo(px + 12, y + 30); ctx.lineTo(px + 2, y + 46); ctx.stroke(); } }
}

export function bowArt(ctx, c, x, y) {
  ctx.lineCap = 'round'; ctx.strokeStyle = c.strata3; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(x - 42, y, 62, -1.15, 1.15); ctx.stroke();
  ctx.strokeStyle = c.label; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 17, y - 57); ctx.lineTo(x - 17, y + 57); ctx.stroke();
  ctx.strokeStyle = darken(c.strata3, 0.2); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 36, y); ctx.lineTo(x + 56, y); ctx.stroke();
  ctx.fillStyle = c.s5; ctx.beginPath(); ctx.moveTo(x + 74, y); ctx.lineTo(x + 48, y - 13); ctx.lineTo(x + 48, y + 13); ctx.fill();
}

/** A horse in side view. The kit has no horse, so it is drawn here. */
export function horseArt(ctx, c, x, y) {
  const b = c.strata3, d = darken(b, 0.3);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = d; ctx.lineWidth = 9;
  for (const [a, e] of [[-34, -40], [-20, -24], [28, 30], [42, 48]]) { ctx.beginPath(); ctx.moveTo(x + a, y + 16); ctx.lineTo(x + e, y + 54); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - 58, y - 6);
  ctx.bezierCurveTo(x - 40, y - 28, x + 10, y - 26, x + 34, y - 22);
  ctx.lineTo(x + 56, y - 56); ctx.lineTo(x + 66, y - 66); ctx.lineTo(x + 86, y - 46); ctx.lineTo(x + 78, y - 38); ctx.lineTo(x + 64, y - 42); ctx.lineTo(x + 52, y - 4);
  ctx.bezierCurveTo(x + 48, y + 20, x + 10, y + 26, x - 26, y + 24);
  ctx.bezierCurveTo(x - 50, y + 24, x - 64, y + 12, x - 58, y - 6); ctx.closePath();
  ctx.fillStyle = b; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(b, 0.45); ctx.stroke();
  ctx.strokeStyle = c.strata6; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x + 62, y - 66); ctx.lineTo(x + 44, y - 42); ctx.lineTo(x + 34, y - 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 58, y - 4); ctx.quadraticCurveTo(x - 78, y + 8, x - 72, y + 38); ctx.stroke();
  ctx.fillStyle = c.strata6; ctx.beginPath(); ctx.arc(x + 70, y - 52, 3, 0, 7); ctx.fill();
}

export function rodsArt(ctx, c, x, y) {
  ctx.lineCap = 'round'; ctx.strokeStyle = mix(c.strata1, c.strata3, 0.4); ctx.lineWidth = 9;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - 66 + i * 18, y - 44); ctx.lineTo(x - 66 + i * 18, y + 44); ctx.stroke(); }
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + 32, y - 28 + i * 28); ctx.lineTo(x + 76, y - 28 + i * 28); ctx.stroke(); }
}

export function brushArt(ctx, c, x, y) {
  ctx.save(); ctx.translate(x + 4, y); ctx.rotate(0.6);
  rr(ctx, -8, -66, 16, 96, 7); ctx.fillStyle = c.strata3; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = darken(c.strata3, 0.4); ctx.stroke();
  rr(ctx, -10, 26, 20, 12, 3); ctx.fillStyle = lighten(c.strata5, 0.2); ctx.fill();
  ctx.fillStyle = c.strata6; ctx.beginPath(); ctx.moveTo(-10, 38); ctx.quadraticCurveTo(-13, 62, 0, 82); ctx.quadraticCurveTo(13, 62, 10, 38); ctx.fill();
  ctx.restore();
}

/** A fish of jade on a cord, the book's example of a chime. */
export function chimeArt(ctx, c, x, y) {
  const j = mix(c.elevLow, c.elevPeak, 0.35);
  ctx.strokeStyle = c.strata3; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 10, y - 60); ctx.lineTo(x - 10, y - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 72, y + 6); ctx.bezierCurveTo(x - 40, y - 40, x + 30, y - 34, x + 50, y + 4); ctx.lineTo(x + 76, y - 22); ctx.lineTo(x + 76, y + 34); ctx.lineTo(x + 50, y + 8); ctx.bezierCurveTo(x + 30, y + 44, x - 40, y + 46, x - 72, y + 6);
  ctx.fillStyle = j; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(j, 0.45); ctx.stroke();
  ctx.fillStyle = darken(j, 0.5); ctx.beginPath(); ctx.arc(x - 46, y, 5, 0, 7); ctx.fill();
}

const metal = (c) => mix(c.strata4, c.strata2, 0.45);

/** Early money shaped like a spade. Centre (0, 0). */
export function spadeCoin(ctx, c) {
  const m = metal(c);
  ctx.beginPath(); ctx.moveTo(-16, -110); ctx.lineTo(16, -110); ctx.lineTo(18, -30); ctx.lineTo(62, 60); ctx.lineTo(70, 110); ctx.lineTo(16, 92); ctx.lineTo(0, 60); ctx.lineTo(-16, 92); ctx.lineTo(-70, 110); ctx.lineTo(-62, 60); ctx.lineTo(-18, -30); ctx.closePath();
  ctx.fillStyle = m; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = darken(m, 0.45); ctx.stroke();
  ctx.strokeStyle = lighten(m, 0.3); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 40); ctx.stroke();
}

/** Early money shaped like a knife. Centre (0, 0). */
export function knifeCoin(ctx, c) {
  const m = metal(c);
  ctx.save(); ctx.rotate(0.2);
  ctx.beginPath(); ctx.moveTo(-26, 120); ctx.bezierCurveTo(-34, 40, -30, -60, 8, -126); ctx.bezierCurveTo(38, -80, 34, 0, 16, 40); ctx.lineTo(10, 120); ctx.closePath();
  ctx.fillStyle = m; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = darken(m, 0.45); ctx.stroke();
  ctx.beginPath(); ctx.arc(-8, 132, 18, 0, 7); ctx.fillStyle = m; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-8, 132, 8, 0, 7); ctx.fillStyle = darken(c.bgSurface, 0.1); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/** A plain sheet standing for paper money. It copies no real note. */
export function paperNote(ctx, c) {
  const p = mix(c.elevPeak, c.strata1, 0.2);
  rr(ctx, -78, -112, 156, 232, 8); ctx.fillStyle = darken(p, 0.35); ctx.fill();
  rr(ctx, -78, -118, 156, 232, 8); ctx.fillStyle = p; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = darken(p, 0.45); ctx.stroke();
  rr(ctx, -62, -102, 124, 200, 4); ctx.lineWidth = 3; ctx.strokeStyle = c.s1; ctx.stroke();
  ctx.fillStyle = c.strata6;
  for (let i = 0; i < 4; i++) ctx.fillRect(-42 + i * 26, -84, 8, 88 - (i % 2) * 22);
  ctx.fillStyle = c.bad; rr(ctx, -30, 28, 60, 54, 6); ctx.fill();
}
