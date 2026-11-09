// RuleOfLawScalesScene - L03 s04. b0 a cricket ground: the captain argues, the umpire's decision stands.
// b1 court steps: a minister and a student go up the same steps to the same door. b2 a powerful man's
// phone call changes nothing: the case goes up the same steps.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01 } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawCivic, dayStage, speech } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];

export class RuleOfLawScalesScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'On a cricket ground, a captain argues and the umpire holds his decision: same rules for both. Then a minister and a student go up the same court steps to the same door. Then a powerful man on the phone asks for a favour, and the case still goes up the same court steps.';

  busy() { return this.age < 1.1; }
  _fig(ctx, c, o) { const s = figureFor(this, { facing: 0, mood: 'smile', ...o }); return drawFigure(ctx, c, s, s.look); }

  _cricket(ctx, c) {
    dayStage(ctx, c, { horizon: 170, ground: 'grass' });
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.4); ctx.beginPath(); ctx.moveTo(250, 170); ctx.lineTo(430, 170); ctx.lineTo(640, 456); ctx.lineTo(40, 456); ctx.closePath(); ctx.fill();
    [322, 340, 358].forEach((x) => { ctx.fillStyle = mix(c.gold, c.label, 0.5); ctx.fillRect(x, 130, 6, 56); });
    this._fig(ctx, c, { role: 'adult', x: 200, y: 440, height: 300, i: 4, facing: 1, pose: 'point', look: { outfit: 'tee', top: 's1', bottom: 'cream' } , mood: 'oops' });
    this._fig(ctx, c, { role: 'elder', x: 490, y: 440, height: 310, i: 1, facing: 0, pose: 'point', look: { outfit: 'coat', top: 'white', bottom: 'cream' } });
    speech(ctx, c, 'That was not out!', 180, 62, 212, 130, { size: 28, display: true });
    pill(ctx, c, 'the umpire decides', 490, 32, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'same rules for both', 340, 424, { size: 30, bg: mix(c.gold, c.bgSurface, 0.3), display: true });
  }

  _steps(ctx, c, k, x) { return { x: 110 + k * 180 + x, y: 500 - k * 44 }; }

  _court(ctx, c) {
    dayStage(ctx, c, { horizon: 350, ground: 'stone' });
    drawCivic(ctx, c, 'court', 340, 372, { h: 340 });
    const k = 1 - (1 - clamp01(this.age / 1)) ** 2;
    this._fig(ctx, c, { role: 'adult', x: 110 + k * 60, y: 450, height: 186, i: 4, facing: 1, pose: k < 1 ? { name: 'walk', phase: k * 2 } : 'stand', look: { outfit: 'kurta', top: 'white', bottom: 'cream' } });
    this._fig(ctx, c, { role: 'student', x: 570 - k * 60, y: 450, height: 168, i: 2, facing: -1, pose: k < 1 ? { name: 'walk', phase: k * 2 + 0.4 } : 'stand' });
    pill(ctx, c, 'a minister', 100, 234, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'a student', 580, 250, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'same court, same procedure', 340, 28, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
  }

  _call(ctx, c) {
    dayStage(ctx, c, { horizon: 350, ground: 'stone' });
    drawCivic(ctx, c, 'court', 470, 372, { h: 330 });
    const s = this._fig(ctx, c, { role: 'adult', x: 130, y: 448, height: 300, i: 6, facing: 1, pose: { name: 'stand' }, look: { outfit: 'shirt', top: 'gold' }, mood: 'think' });
    drawCivic(ctx, c, 'phone', s.anchors.head.x + 40, s.anchors.head.y + 40, { h: 60 });
    speech(ctx, c, 'Can you fix this?', 160, 44, 150, 100, { size: 28, display: true });
    pill(ctx, c, 'the call changes nothing', 440, 420, { size: 30, bg: mix(c.gold, c.bgSurface, 0.3), display: true });
  }

  draw(ctx, c) { [this._cricket, this._court, this._call][this.stage].call(this, ctx, c); }
}
