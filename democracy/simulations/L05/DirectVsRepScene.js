// DirectVsRepScene - L05 s03. One village, two ways. Representative: the people elect five, who meet
// in a chamber, and answer at the next election. Direct: everyone raises a hand on the decision.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawCivic, day, who, tag, arrow, pop } from '../L04/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const G = 330;
const FOLK = [[44, 376, 'farmer'], [118, 358, 'teacher'], [196, 374, 'elder'], [272, 354, 'adult'], [346, 378, 'shopkeeper'], [80, 430, 'student'], [172, 442, 'worker'], [268, 432, 'voter'], [356, 444, 'adult']];
const REPS = [[398, 'adult'], [450, 'teacher'], [502, 'elder'], [554, 'farmer'], [606, 'voter']];

export class DirectVsRepScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'The same village shown two ways. In representative democracy villagers elect five people who stand before a chamber, with an arrow back at the next election. In direct democracy everyone gathers under a tree and raises a hand to decide.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'view', label: 'Picture', options: [{ value: 'rep', label: 'Representative' }, { value: 'dir', label: 'Direct' }] }];
  getControlValue(id) { return id === 'view' ? this.view : undefined; }
  onControlChange(id, v) { if (id === 'view') { this.view = v; this._at = this.age; this.requestUiUpdate?.(); } }
  enter(st) { this.view = st === 0 ? 'rep' : 'dir'; this._at = 0; this.requestUiUpdate?.(); }
  busy() { return this.age - (this._at ?? 0) < 1.8; }

  draw(ctx, c) {
    const a = this.age - (this._at ?? 0), rep = this.view === 'rep';
    day(ctx, c, { ground: G - 60, sun: false });
    if (rep) {
      drawCivic(ctx, c, 'parliament', 505, 250, { w: 316 });
      REPS.forEach(([x, role], i) => who(ctx, this, { role, x, y: 336, height: 116, i: i + 1, pose: 'stand', facing: 0 }));
      FOLK.forEach(([x, y, role], i) => who(ctx, this, { role, x, y, height: 120, i, pose: 'stand', facing: 1 }));
      arrow(ctx, c, 240, 214, 390, 240, { k: (a - 0.2) / 0.5, col: c.s1, w: 12, bend: -0.2 });
      arrow(ctx, c, 560, 346, 412, 408, { k: (a - 0.8) / 0.5, col: c.s3, w: 12, bend: -0.2 });
      tag(ctx, c, 'elect', 186, 170, { bg: c.s1, k: pop(a, 0.5), size: 30 });
      tag(ctx, c, 'answer at elections', 530, 426, { bg: c.s3, k: pop(a, 1.1), size: 28 });
      tag(ctx, c, 'Representative: India', 340, 36, { bg: c.gold, size: 34 });
    } else {
      drawCivic(ctx, c, 'tree', 340, 300, { h: 236 });
      drawCivic(ctx, c, 'ballotBox', 340, 350, { w: 96 });
      const ring = [[80, 326], [180, 312], [500, 312], [600, 326]];
      ring.forEach(([x, y], i) => who(ctx, this, { role: FOLK[i][2], x, y, height: 128, i, pose: 'reach-up', facing: x < 340 ? 1 : -1 }));
      FOLK.slice(4, 8).forEach(([x, y, role], i) => who(ctx, this, { role, x: [60, 190, 490, 620][i], y: 440, height: 138, i: i + 4, pose: a > 0.2 + i * 0.12 ? 'reach-up' : 'stand' }));
      tag(ctx, c, 'Direct: Switzerland', 340, 36, { bg: c.gold, size: 34 });
    }
    drawVignette(ctx, c, 0.14);
  }
}
