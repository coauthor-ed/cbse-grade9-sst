// RestrictionBalanceScene - L03 s08. b0 a speaker at a mike: his view is allowed, his threat stopped by a
// law and a court, drawn as the two tests a limit must pass. b1 two neighbours, your right and mine.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { panel } from '../shared/SstArt.js';
import { drawCivic, dayStage, speech } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];

export class RestrictionBalanceScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A speaker at a microphone. Stating his view is allowed. Threatening families is not, and a court applies the limit: it must be reasonable and follow the law. Then two neighbours each hold the same right, side by side.';

  busy() { return this.age < 0.7; }
  _fig(ctx, c, o) { const s = figureFor(this, { facing: 0, mood: 'smile', ...o }); return drawFigure(ctx, c, s, s.look); }

  _speaker(ctx, c) {
    dayStage(ctx, c, { horizon: 290, ground: 'stone' });
    drawCivic(ctx, c, 'court', 520, 312, { h: 176 });
    this._fig(ctx, c, { role: 'adult', x: 120, y: 444, height: 280, i: 4, facing: 1, pose: 'point' });
    drawCivic(ctx, c, 'mike', 214, 444, { h: 190 });
    speech(ctx, c, 'I disagree with them', 166, 36, 132, 150, { size: 28, display: true });
    pill(ctx, c, 'allowed', 400, 36, { size: 28, bg: mix(c.s3, c.bgSurface, 0.45), ink: c.label, display: true });
    speech(ctx, c, 'Threaten them!', 120, 88, 150, 150, { size: 28, display: true, bg: mix(c.bad, c.bgSurface, 0.75) });
    pill(ctx, c, 'stopped by law', 356, 88, { size: 28, bg: mix(c.bad, c.bgSurface, 0.55), ink: c.label, display: true });
    pill(ctx, c, 'reasonable', 420, 366, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    pill(ctx, c, 'and by law', 580, 366, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
  }

  _two(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    panel(ctx, c, 12, 10, 322, 434, { fill: mix(c.s1, c.bgSurface, 0.8) });
    panel(ctx, c, 346, 10, 322, 434, { fill: mix(c.s3, c.bgSurface, 0.8) });
    pill(ctx, c, 'your right', 173, 48, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'my right', 507, 48, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
    this._fig(ctx, c, { role: 'student', x: 173, y: 434, height: 280, i: 2, facing: 1 });
    this._fig(ctx, c, { role: 'student', x: 507, y: 434, height: 280, i: 5, facing: -1 });
    pill(ctx, c, 'same right, same respect', 340, 104, { size: 28, bg: mix(c.gold, c.bgSurface, 0.3), display: true });
  }

  draw(ctx, c) { if (this.stage === 0) this._speaker(ctx, c); else this._two(ctx, c); }
}
