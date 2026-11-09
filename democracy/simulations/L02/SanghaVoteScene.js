// SanghaVoteScene - L02 s05. Monks in a ring under a tree. b0 they discuss: bubbles carry the talk.
// b1 hands go up, the count is true of the figures on screen, and one member is chosen as leader.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01 } from 'simulations/base/kit/SimLook.js';
import { person, tree } from '../shared/SstArt.js';
import { dayStage, speech } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const SAMGHA = 'Bauddha Sa\u1E41gha';
// x, ground y, height, facing. Back of the ring first.
const RING = [[150, 288, 132, 1], [270, 274, 124, 0], [410, 274, 124, 0], [530, 288, 132, -1], [76, 358, 164, 1], [604, 358, 164, -1], [200, 410, 190, 1], [340, 434, 200, 0], [480, 410, 190, -1]];
const YES = new Set([0, 1, 3, 4, 5, 7, 8]);
const ROBE = (c) => ({ outfit: 'drape', top: 's8', bottom: 's8', hairStyle: 'crop', moustache: false, dupatta: false, glasses: false, shoeStyle: 'sandal', pattern: 'none' });

export class SanghaVoteScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'Nine monks in a ring under a tree. First they discuss a matter, shown with speech bubbles. Then seven of the nine raise their hands, the count is shown, and one member stands chosen as leader.';

  busy() { return this.age < 1.2; }

  draw(ctx, c) {
    dayStage(ctx, c, { horizon: 220, ground: 'earth' });
    tree(ctx, c, 340, 240, 3, 6);
    const hands = this.stage === 1 ? clamp01((this.age - 0.2) / 0.6) : 0;
    RING.forEach(([x, y, h, f], i) => {
      const up = hands > 0.1 + i * 0.09 && YES.has(i);
      person(ctx, this, { role: 'adult', x, y, height: h, facing: up ? 0 : f, i: i + 1, pose: up ? 'reach-up' : 'stand', mood: 'smile', look: ROBE(c) });
    });
    pill(ctx, c, SAMGHA, 180, 30, { size: 30, bg: c.bgSurface, ink: c.label, display: false });
    if (this.stage === 0) {
      speech(ctx, c, 'What do you think?', 176, 86, 268, 152, { display: true });
      speech(ctx, c, 'I see it differently', 500, 86, 412, 152, { display: true });
    } else {
      pill(ctx, c, '7 of 9 hands up', 520, 30, { size: 30, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
      if (hands >= 1) pill(ctx, c, 'leader chosen', 340, 430, { size: 28, bg: mix(c.s3, c.bgSurface, 0.45), ink: c.label, display: true });
    }
  }
}
