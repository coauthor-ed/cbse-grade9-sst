// TermClockScene - L01 s01. b0 Gurmat chosen by her class, hands up, Grade 8. b1 the year has turned:
// the board says Grade 9 and the post is open to question. b2 the same question for a government past
// its term and for a contest of one party.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { speech } from '../shared/CivicArt.js';
import { sheet, tag } from '../shared/DayKit.js';
import { classroom, classmates, gurmat, threeCards } from './ClassArt.js';

const m = (idx) => [{ idx, dwellMs: null }];

export class TermClockScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static ARIA_LABEL = 'A classroom. Her classmates raise their hands to choose Gurmat as class representative in Grade 8. Then the board says Grade 9 and one classmate says she can carry on. Then three cards ask the same question of Gurmat, of a government past its term, and of a contest with only one party.';

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const st = this.stage;
    if (st === 2) { ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, 680, 453); threeCards(ctx, this, this.age, ['?', '?', '?']); return; }
    if (st === 0) {
      classroom(ctx, c, ['Grade 8', 'Class election']);
      classmates(ctx, this, 'reach-up');
      gurmat(ctx, this);
      sheet(ctx, c, 560, 392, 188, 92, { lines: 0 });
      ['Class', 'representative'].forEach((t, i) => tag(ctx, c, t, 560, 372 + i * 40, { size: 25, bg: null }));
      tag(ctx, c, 'Gurmat', 136, 412, { bg: c.gold });
    } else if (st === 1) {
      classroom(ctx, c, ['Grade 9', 'Election?']);
      classmates(ctx, this, 'stand');
      gurmat(ctx, this, { mood: 'neutral' });
      speech(ctx, c, 'She can carry on', 544, 398, 530, 312, { size: 25 });
      tag(ctx, c, 'Gurmat', 136, 412, { bg: c.gold });
    } else {
      classroom(ctx, c, ['Class election']);
      classmates(ctx, this, 'stand');
      gurmat(ctx, this);
      tag(ctx, c, 'Gurmat', 136, 412, { bg: c.gold });
    }
  }
}
