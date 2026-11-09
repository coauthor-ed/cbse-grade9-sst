// MediaPillarScene - L04 s10. Three stone pillars and a fourth, a press stand with paper, TV and phone.
// b0 people read. b1 an issue goes from people to the paper to the office, and an answer comes back.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawCivic, day, who, tag, arrow, pop, rr, mix, darken } from './DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const G = 318;
const P = [{ x: 74, t: 'Legislature', tone: 's1' }, { x: 202, t: 'Executive', tone: 's3' }, { x: 330, t: 'Judiciary', tone: 's5' }];

export class MediaPillarScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'A roof rests on three stone pillars, for the legislature, executive and judiciary, and on a fourth pillar built of a newspaper, a television and a phone. People read the news. Then a problem of no water goes from the people through the paper to an office, and an answer comes back.';

  busy() { return this.age < 3.4; }

  _pillar(ctx, c, x, w, tone) {
    rr(ctx, x - w / 2, 78, w, G - 78, 8); ctx.fillStyle = mix(c.waste, c.bgSurface, 0.5); ctx.fill();
    for (const d of [-0.22, 0, 0.22]) { ctx.fillStyle = darken(mix(c.waste, c.bgSurface, 0.5), 0.1); ctx.fillRect(x + d * w - 3, 86, 6, G - 94); }
    rr(ctx, x - w / 2 - 10, 66, w + 20, 18, 6); ctx.fillStyle = darken(mix(c.waste, c.bgSurface, 0.5), 0.14); ctx.fill();
    rr(ctx, x - w / 2 - 10, G - 16, w + 20, 18, 6); ctx.fillStyle = darken(mix(c.waste, c.bgSurface, 0.5), 0.14); ctx.fill();
    rr(ctx, x - w / 2 + 6, 100, w - 12, 12, 5); ctx.fillStyle = c[tone]; ctx.fill();
  }

  draw(ctx, c) {
    const st = this.stage, a = this.age;
    day(ctx, c, { ground: G });
    rr(ctx, 16, 14, 648, 54, 12); ctx.fillStyle = mix(c.waste, c.bgSurface, 0.32); ctx.fill();
    tag(ctx, c, 'democracy', 200, 40, { size: 30 });
    tag(ctx, c, 'fourth pillar', 546, 40, { bg: c.gold, size: 30 });
    P.forEach((p) => this._pillar(ctx, c, p.x, 70, p.tone));
    // the fourth pillar, the hero
    const fx = 548;
    rr(ctx, fx - 92, 68, 184, G - 68, 14); ctx.fillStyle = mix(c.gold, c.bgSurface, 0.52); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = mix(c.gold, c.label, 0.4); ctx.stroke();
    rr(ctx, fx - 74, 82, 148, 92, 8); ctx.fillStyle = mix(c.label, c.bgDeep, 0.45); ctx.fill(); rr(ctx, fx - 62, 92, 124, 66, 5); ctx.fillStyle = mix(c.water, c.bgSurface, 0.3); ctx.fill();
    who(ctx, this, { role: 'teacher', x: fx, y: 190, height: 100, i: 4 });
    drawCivic(ctx, c, 'newspaper', fx - 34, 300, { w: 88 });
    drawCivic(ctx, c, 'phone', fx + 48, 302, { h: 112 });
    if (st === 0) {
      who(ctx, this, { role: 'adult', x: 90, y: 418, height: 176, i: 1, pose: 'carry', facing: 1 });
      who(ctx, this, { role: 'farmer', x: 250, y: 430, height: 176, i: 2, pose: 'carry', facing: 1 });
      who(ctx, this, { role: 'student', x: 414, y: 444, height: 176, i: 3, pose: 'carry', facing: 1 });
      tag(ctx, c, 'keeps people informed', 340, 426, { bg: c.gold, size: 32, k: pop(a, 0.5) });
    } else {
      who(ctx, this, { role: 'farmer', x: 64, y: 442, height: 190, i: 2, pose: 'point', facing: 1 });
      tag(ctx, c, 'no water in our ward', 330, 414, { bg: c.s2, size: 30, k: pop(a, 0.2) });
      arrow(ctx, c, 486, 412, 536, 324, { k: (a - 0.7) / 0.4, col: c.s2, w: 11, bend: 0.2 });
      arrow(ctx, c, 450, 206, 246, 206, { k: (a - 1.2) / 0.6, col: c.s2, w: 12 });
      tag(ctx, c, 'water tanker sent', 256, 352, { bg: c.good, size: 30, k: pop(a, 2.3) });
    }
    drawVignette(ctx, c, 0.14);
  }
}
