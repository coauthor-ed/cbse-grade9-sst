// TribalCouncilScene - blk-l06-s06. Beat 0: an Autonomous District Council: a council house, members
// at the work, what its two powers do. Beat 1: a Gram Sabha sits in a circle under a tree, under the
// PESA Act. Plain everyday clothes: no costume and no feathers.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tile, say, folk, tag, pop } from './CivicWorld.js';

const S_ADC = 0, S_PESA = 1;
const MAP = [S_ADC, S_PESA].map((idx) => [{ idx, dwellMs: null }]);

export class TribalCouncilScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static ARIA_LABEL = 'A district council house with members at the door, and two labels: makes rules, settles disputes, to preserve tribal customs. Then a Gram Sabha meeting in a circle under a tree, named as the primary decision-making body under the PESA Act of 1996.';
  static CONTROLS = [];
  busy() { return this.age < 1; }

  draw(ctx, c) {
    const a = this.age;
    if (this.stage === S_ADC) {
      day(ctx, c, 680, 520, { ground: 290 });
      say(ctx, c, 'Autonomous District Council', 340, 34, { size: 34 });
      drawCivic(ctx, c, 'office', 340, 330, { h: 228 });
      tag(ctx, c, 'To preserve tribal customs', 340, 78, { bg: c.accent, scale: pop(a, 0.5) });
      ['adult', 'elder', 'worker', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: [60, 150, 530, 620][i], y: 376, height: 164, facing: i < 2 ? 1 : -1, i: i + 2 }));
      [['Makes rules', 'legislative'], ['Settles disputes', 'judicial']].forEach(([one, two], i) => {
        const x = 18 + i * 326, k = pop(a, 0.2 + i * 0.2);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, 382, 318, 66, { fill: c.bgSurface, r: 12 });
        say(ctx, c, one, x + 159, 404, { size: 28 });
        say(ctx, c, two, x + 159, 432, { size: 28, display: false, col: c.labelMuted });
        ctx.restore();
      });
    } else {
      day(ctx, c, 680, 520, { ground: 260 });
      drawCivic(ctx, c, 'tree', 340, 292, { h: 240 });
      tag(ctx, c, 'PESA Act, 1996', 340, 32, { bg: c.accent });
      ['elder', 'adult', 'farmer', 'worker', 'adult', 'elder', 'adult', 'farmer'].forEach((role, i) => {
        const ang = Math.PI * (1 - i / 7);
        folk(ctx, this, { role, x: 340 + 296 * Math.cos(ang), y: 410 - 96 * Math.sin(ang), height: 134, facing: 0, i: i + 1, pose: i === 2 ? 'wave' : 'stand' });
      });
      const k = pop(a, 0.35);
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      tile(ctx, c, 90, 380, 500, 66, { fill: c.bgSurface, r: 12 });
      say(ctx, c, 'Gram Sabha', 340, 402, { size: 30 });
      say(ctx, c, 'primary decision-making body', 340, 430, { size: 28, display: false });
      ctx.restore();
    }
  }
}
