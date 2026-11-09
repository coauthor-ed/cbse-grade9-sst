// OrganTriad.js - the three buildings of government, shared by ThreeOrgansScene and ChecksBalancesScene.
// A helper, not a scene: no class here.
import { drawCivic, who, tag, pop, alpha } from './DayKit.js';

export const ORGANS = [
  { id: 'leg', name: 'Legislature', job: 'makes laws', kind: 'parliament', x: 118, w: 224, tone: 's1', role: 'adult', i: 1, pose: 'point' },
  { id: 'exe', name: 'Executive', job: 'implements laws', kind: 'office', x: 342, w: 204, tone: 's3', role: 'police', i: 2, pose: 'stand' },
  { id: 'jud', name: 'Judiciary', job: 'interprets laws', kind: 'court', x: 562, w: 206, tone: 's5', role: 'elder', i: 3, pose: 'stand' },
];

/** The row of buildings on the ground line g. o: age (arrivals), labels, jobs, lit (id or null), off(id), figures. */
export function drawTriad(ctx, scene, g, o = {}) {
  const c = scene.colors, a = o.age ?? 9;
  ORGANS.forEach((O, i) => {
    const k = pop(a, 0.05 + i * 0.28), off = Number(o.off?.(O.id) ?? 0);   // off: 0 full, 1 dim; between while it eases
    if (k <= 0.02) return;
    ctx.save();
    ctx.globalAlpha *= (1 - off * 0.68) * Math.min(1, k);
    ctx.translate(O.x, g); ctx.scale(k, k); ctx.translate(-O.x, -g);
    if (off < 1 && o.lit) { ctx.fillStyle = alpha(c[O.tone], 0.28 * (1 - off)); ctx.beginPath(); ctx.ellipse(O.x, g - 74, 116, 104, 0, 0, Math.PI * 2); ctx.fill(); }
    drawCivic(ctx, c, O.kind, O.x, g, { w: O.w });
    if (o.figures !== false) who(ctx, scene, { role: O.role, x: O.x + (i === 2 ? -74 : 74), y: g + 20, height: 112, i: O.i, pose: O.pose, facing: i === 2 ? 1 : -1 });
    ctx.restore();
    if (o.labels !== false) tag(ctx, c, O.name, O.x, g + 46, { k: Math.min(1, k), bg: off > 0.5 ? c.bgSurface : c[O.tone] });
    if (o.jobs) tag(ctx, c, O.job, O.x, g + 92, { k: pop(a, 0.5 + i * 0.28), size: 26, bg: c.bgSurface, display: false });
  });
}
