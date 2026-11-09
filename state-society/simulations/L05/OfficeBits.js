// OfficeBits.js - small drawn things for the L05 scenes. A helper, not a scene.
import { alpha, mix, rr, font, darken, lighten, inkOn } from 'simulations/base/kit/SimLook.js';
import { pal, panel, person } from '../shared/SstArt.js';

export const MAN = { hairStyle: 'short', dupatta: false };

/** A rimmed tile with a person standing in it and up to two lines of name. o: x y w h role i label sub lit off tone */
export function officerTile(ctx, scene, c, t, o) {
  const P = pal(c);
  panel(ctx, c, o.x, o.y, o.w, o.h, { fill: o.fill ?? P.panel, lit: o.lit, off: o.off, litCol: o.litCol });
  ctx.save();
  if (o.off) ctx.globalAlpha *= 0.34;
  const fh = o.fig ?? o.h * 0.62, gy = o.y + 10 + fh;
  person(ctx, scene, { role: o.role ?? 'adult', x: o.x + o.w / 2, y: gy, height: fh, facing: o.facing ?? 0, i: o.i ?? 1, t, mood: 'smile', look: o.look ?? MAN });
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
  ctx.font = font(c, 700, o.size ?? 28, true);
  ctx.fillText(o.label, o.x + o.w / 2, gy + 26);
  if (o.sub) { ctx.font = font(c, 700, o.subSize ?? 28); ctx.fillStyle = c.labelMuted; ctx.fillText(o.sub, o.x + o.w / 2, gy + (o.subY ?? 54)); }
  ctx.restore();
}

/** A speech bubble with one or two lines, tail towards (tx, ty). No sentence from the slide. */
export function bubble(ctx, c, text, x, y, w, tx, ty, size = 28) {
  const P = pal(c);
  ctx.font = font(c, 800, size);
  const words = text.split(' '), lines = [];
  let cur = '';
  for (const wd of words) {
    const n = cur ? `${cur} ${wd}` : wd;
    if (ctx.measureText(n).width > w - 28 && cur) { lines.push(cur); cur = wd; } else cur = n;
  }
  lines.push(cur);
  const h = lines.length * (size + 6) + 22;
  ctx.fillStyle = c.bgSurface; ctx.strokeStyle = c.stroke; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + w * 0.4, y + h - 4); ctx.lineTo(tx, ty); ctx.lineTo(x + w * 0.6, y + h - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  rr(ctx, x, y, w, h, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = c.bgSurface; ctx.fillRect(x + w * 0.4 + 2, y + h - 5, w * 0.2 - 4, 6);
  ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, x + w / 2, y + 11 + (size + 6) * (i + 0.5)));
  void P;
}

/** A copper plate with a ring and rows of script. No face on it. */
export function copperPlate(ctx, c, x, y, w, h, rot = 0) {
  const cu = mix(c.s8, c.gold, 0.45);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = alpha(c.label, 0.2); rr(ctx, -w / 2 + 5, -h / 2 + 8, w, h, 10); ctx.fill();
  ctx.fillStyle = darken(cu, 0.3); rr(ctx, -w / 2, -h / 2 + 4, w, h, 10); ctx.fill();
  ctx.fillStyle = cu; rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.fillStyle = alpha(lighten(cu, 0.5), 0.5); rr(ctx, -w / 2 + 6, -h / 2 + 4, w - 12, 6, 3); ctx.fill();
  ctx.strokeStyle = darken(cu, 0.5); ctx.lineWidth = 3; ctx.lineCap = 'round';
  const rows = Math.max(3, Math.floor((h - 26) / 16));
  for (let r = 0; r < rows; r++) {
    const ly = -h / 2 + 22 + r * 16;
    ctx.setLineDash([9, 5, 4, 6]); ctx.lineDashOffset = r * 7;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 34, ly); ctx.lineTo(w / 2 - 14, ly); ctx.stroke();
  }
  ctx.setLineDash([]); ctx.lineCap = 'butt';
  ctx.strokeStyle = darken(cu, 0.45); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(-w / 2 + 18, 0, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

export const pillInk = (c, bg) => inkOn(c, bg);
export { mix };
