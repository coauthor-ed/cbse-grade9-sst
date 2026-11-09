// RightAddedScene - L03 s09. b0 a school gate, children aged 6 to 14, the Constitution with a 21A slip.
// b1 the same school: the children go in, under the Right to Education Act, 2009.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01, rr } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawCivic, dayStage } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];

export class RightAddedScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A school with children aged 6 to 14 at the gate, and the Constitution with a slip marked 21A. Then the children walk into school, with the label Right to Education Act, 2009.';

  busy() { return this.age < 1.1; }

  draw(ctx, c) {
    dayStage(ctx, c, { horizon: 262, ground: 'earth' });
    drawCivic(ctx, c, 'school', 290, 276, { w: 470 });
    const k = this.stage === 1 ? 1 - (1 - clamp01(this.age / 1)) ** 2 : 0;
    [['child', 90], ['child', 190], ['student', 300], ['child', 410]].forEach(([role, x], i) => {
      const fx = x + (340 - x) * k * 0.5, fy = 444 - k * 96;
      const s = figureFor(this, { role, x: fx, y: fy, height: (role === 'child' ? 150 : 186) * (1 - k * 0.35), i: i + 2, facing: 1, pose: k > 0 && k < 1 ? { name: 'walk', phase: k * 3 + i * 0.3 } : 'stand', mood: 'smile' });
      drawFigure(ctx, c, s, s.look);
    });
    if (this.stage === 0) {
      drawCivic(ctx, c, 'book', 584, 448, { h: 196 });
      rr(ctx, 596, 216, 70, 84, 6); ctx.fillStyle = mix(c.gold, c.bgSurface, 0.3); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = mix(c.gold, c.label, 0.5); ctx.stroke();
      pill(ctx, c, '21A', 631, 258, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'ages 6 to 14', 130, 32, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'free and compulsory', 460, 32, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    } else pill(ctx, c, 'Right to Education Act, 2009', 340, 32, { size: 32, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
  }
}
