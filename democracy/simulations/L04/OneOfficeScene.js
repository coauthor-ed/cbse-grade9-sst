// OneOfficeScene - L04 s01. One principal behind one desk holds all three jobs: the rule book, the
// punishment stamp, the appeal file. b1: a student brings an appeal, and the only person to ask is
// the same person.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawCivic, room, who, tag, arrow, sheet, pop, mix, rr, darken, drawShadow } from './DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const G = 366;
const JOBS = [
  { text: 'makes rules', x: 118, tone: 's1', obj: 212 },
  { text: 'punishes', x: 318, tone: 's2', obj: 318 },
  { text: 'hears appeals', x: 530, tone: 's5', obj: 424 },
];

export class OneOfficeScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'A school principal stands behind one desk with a rule book, a punishment stamp and an appeal file. Three tags say makes rules, punishes, hears appeals. On the second beat a student brings an appeal to the same desk, and a tag says there is only one person to ask.';

  busy() { return this.age < 2.2; }

  draw(ctx, c) {
    const st = this.stage, a = this.age;
    room(ctx, c, { ground: G });
    // the office: a window on the school yard, a notice board
    rr(ctx, 40, 76, 150, 160, 12); ctx.fillStyle = mix(c.bgSurface, c.water, 0.45); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = mix(c.bgSurface, c.s8, 0.55); ctx.stroke();
    drawCivic(ctx, c, 'school', 115, 220, { w: 118 });
    rr(ctx, 470, 84, 130, 110, 8); ctx.fillStyle = mix(c.bgSurface, c.s8, 0.4); ctx.fill();
    sheet(ctx, c, 508, 138, 56, 74, { lines: 3, rot: -0.05 }); sheet(ctx, c, 564, 136, 56, 70, { lines: 3, rot: 0.06 });
    // the principal, big, the hero
    drawShadow(ctx, c, 318, G - 2, 140, 16);
    who(ctx, this, { role: 'teacher', x: 318, y: G - 2, height: 276, i: 1, pose: st === 1 ? 'point' : 'stand', facing: st === 1 ? 1 : 0, look: { glasses: true }, mood: st === 1 ? 'neutral' : 'happy' });
    // the one desk
    rr(ctx, 150, 286, 336, 26, 8); ctx.fillStyle = mix(c.s8, c.label, 0.34); ctx.fill();
    rr(ctx, 164, 312, 308, 72, 8); ctx.fillStyle = darken(mix(c.s8, c.label, 0.28), 0.1); ctx.fill();
    // three things on it, each on a disc of its tag's colour
    JOBS.forEach((j, i) => { const k = pop(a, st === 0 ? 0.25 + i * 0.4 : 0, 0.4); if (k > 0.02) { ctx.beginPath(); ctx.arc(j.obj, 248, 54 * k, 0, Math.PI * 2); ctx.fillStyle = mix(c[j.tone], c.bgSurface, 0.45); ctx.fill(); } });
    drawCivic(ctx, c, 'book', 212, 288, { h: 76 });
    rr(ctx, 300, 256, 36, 22, 6); ctx.fillStyle = c.s2; ctx.fill(); rr(ctx, 311, 232, 14, 28, 6); ctx.fillStyle = mix(c.s2, c.label, 0.4); ctx.fill(); rr(ctx, 292, 276, 52, 12, 4); ctx.fillStyle = mix(c.s2, c.label, 0.3); ctx.fill();
    sheet(ctx, c, 424, 252, 66, 72, { lines: 3, rot: 0.08 });
    JOBS.forEach((j, i) => tag(ctx, c, j.text, j.x, 38, { k: pop(a, st === 0 ? 0.25 + i * 0.4 : 0, 0.4), bg: c[j.tone] }));
    if (st === 1) {
      const u = Math.min(1, a / 1.2), x = 700 - u * 130;
      who(ctx, this, { role: 'student', x, y: 440, height: 226, i: 2, pose: u < 1 ? 'walk' : 'stand', phase: a * 1.4, facing: -1, mood: u < 1 ? 'neutral' : 'worried' });
      sheet(ctx, c, x - 52, 322, 60, 74, { lines: 3, rot: -0.1 });
      arrow(ctx, c, x - 60, 270, 456, 226, { k: (a - 1.2) / 0.5, bend: 0.18, col: c.s5, w: 10 });
      tag(ctx, c, 'only one person to ask', 230, 416, { k: pop(a, 1.7), bg: c.gold });
    }
    drawVignette(ctx, c, 0.2);
  }
}
