// TermClockScene-return - L01 s08. b0 the three questions answered No. b1 a voter puts a ballot in the box:
// votes, then a row of empty seats and the question of how one becomes the other.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, rr, clamp01 } from 'simulations/base/kit/SimLook.js';
import { day, who, tag, arrow, drawCivic } from '../shared/DayKit.js';
import { threeCards } from './ClassArt.js';

const m = (idx) => [{ idx, dwellMs: null }];

export class TermClockReturnScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'Three cards answer No: Gurmat in Grade 9, a government past its term, and a contest of one party. Then a voter puts a ballot in a box, and an arrow with a question mark leads from the box to a row of empty seats.';

  busy() { return this.age < 1.8; }

  draw(ctx, c) {
    if (this.stage === 0) { ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, 680, 453); threeCards(ctx, this, this.age, ['No', 'No', 'No']); return; }
    day(ctx, c, { ground: 340 });
    who(ctx, this, { role: 'voter', x: 96, y: 410, height: 250, i: 2, pose: 'point', facing: 1, mood: 'smile' });
    const u = clamp01(this.age / 0.9), bx = 236, by = 400;
    drawCivic(ctx, c, 'ballotBox', bx, by, { w: 190 });
    if (u < 1) { ctx.fillStyle = c.bgSurface; ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; rr(ctx, bx - 22, 120 + u * 130, 44, 58, 5); ctx.fill(); ctx.stroke(); }
    tag(ctx, c, 'Votes', bx, 428, { bg: c.gold });
    arrow(ctx, c, 340, 300, 448, 300, { col: c.accent, k: clamp01((this.age - 0.9) / 0.5) });
    tag(ctx, c, '?', 394, 244, { bg: c.gold, size: 44, k: clamp01((this.age - 1.2) / 0.3) });
    for (let i = 0; i < 12; i++) {
      const x = 474 + (i % 4) * 46, y = 228 + Math.floor(i / 4) * 54;
      ctx.fillStyle = mix(c.bgSurface, c.s8, 0.5); rr(ctx, x, y, 38, 42, 10); ctx.fill();
      ctx.fillStyle = mix(c.bgSurface, c.s8, 0.3); rr(ctx, x + 5, y + 5, 28, 24, 7); ctx.fill();
    }
    tag(ctx, c, 'Seats', 564, 428, { bg: c.gold });
  }
}
