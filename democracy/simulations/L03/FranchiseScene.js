// FranchiseScene - L03 s03. b0 the real chamber, 543 seats with 400 lit, and the four reasons.
// b1 a class chooses its monitor for one year. b2 a secret vote at 18. b3 the term ends and the arrow
// turns back to the people.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, chipRow, mix, clamp01, drawBackdrop, font } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { hemicycleSeats } from 'simulations/base/kit/SimPicDom.js';
import { pal } from '../shared/SstArt.js';
import { drawCivic, dayStage } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const WHY = ['power from the people', 'bound by the Constitution', 'courts can review', 'the people vote again'];
const K = 1.27, OX = 340 - 200 * K, OY = -16;

export class FranchiseScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A chamber of 543 seats with 400 lit, and four limits: power from the people, bound by the Constitution, courts can review, the people vote again. Then a class with hands up choosing a monitor for one year. Then a voter aged 18 or above behind a secret screen. Then an arrow goes from Parliament back to the people when the term ends.';
  seats = hemicycleSeats(543);

  busy() { return this.age < 1.1; }
  _fig(ctx, c, o) { const s = figureFor(this, { facing: 0, mood: 'smile', ...o }); return drawFigure(ctx, c, s, s.look); }

  _chamber(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    const { seats, r } = this.seats, u = this.age / 0.9;
    seats.forEach((s, i) => {
      const lit = i < 400, a = clamp01(u * 543 / 200 - i / 200);
      ctx.beginPath(); ctx.arc(OX + s.x * K, OY + s.y * K, r * K, 0, 7);
      ctx.fillStyle = lit && a > 0 ? mix(c.s1, c.label, 0.3) : mix(c.waste, c.bgSurface, 0.5); ctx.fill();
    });
    ctx.font = font(c, 700, 44, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label; ctx.fillText('400 of 543', 340, 266);
    chipRow(ctx, c, WHY.map((t) => ({ text: t, bg: mix(c.gold, c.bgSurface, 0.45), ink: c.label })), 340, 318, { size: 28, wrapAt: 640, display: true, align: 'center' });
  }

  _class(ctx, c) {
    const p = pal(c);
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.66); ctx.fillRect(0, 0, 680, 286);
    ctx.fillStyle = mix(c.waste, c.bgSurface, 0.55); ctx.fillRect(0, 286, 680, 190);
    ctx.fillStyle = mix(c.s3, c.label, 0.62); ctx.fillRect(60, 30, 400, 130); ctx.lineWidth = 8; ctx.strokeStyle = p.wood; ctx.strokeRect(60, 30, 400, 130);
    ctx.font = font(c, 700, 34, true); ctx.textAlign = 'center'; ctx.fillStyle = c.bgSurface; ctx.textBaseline = 'middle';
    ctx.fillText('Class monitor', 260, 72); ctx.font = font(c, 700, 30, true); ctx.fillText('for one year', 260, 122);
    this._fig(ctx, c, { role: 'student', x: 590, y: 292, height: 196, i: 3, pose: 'stand' });
    pill(ctx, c, 'monitor', 590, 66, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    const up = clamp01((this.age - 0.2) / 0.5) > 0.3;
    ['student', 'student', 'student', 'student', 'student', 'student'].forEach((role, i) => this._fig(ctx, c, { role, x: 70 + i * 108, y: 450, height: 184, i: i + 5, pose: up && i !== 2 ? 'reach-up' : 'stand' }));
  }

  _secret(ctx, c) {
    dayStage(ctx, c, { horizon: 270, ground: 'stone' });
    drawCivic(ctx, c, 'booth', 390, 446, { h: 288 });
    this._fig(ctx, c, { role: 'voter', x: 140, y: 450, height: 300, i: 2, facing: 1 });
    pill(ctx, c, '18 years or above', 170, 90, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'secret ballot', 520, 90, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    pill(ctx, c, 'Universal Adult Franchise', 340, 36, { size: 32, bg: mix(c.s1, c.bgSurface, 0.5), ink: c.label, display: true });
  }

  _back(ctx, c) {
    dayStage(ctx, c, { horizon: 296, ground: 'earth' });
    drawCivic(ctx, c, 'parliament', 340, 204, { w: 372 });
    const k = 1 - (1 - clamp01(this.age / 0.9)) ** 3, y = 218 + k * 92;
    ctx.fillStyle = mix(c.s3, c.bgSurface, 0.2); ctx.strokeStyle = mix(c.s3, c.label, 0.5); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(322, 218); ctx.lineTo(322, y - 34); ctx.lineTo(296, y - 34); ctx.lineTo(340, y); ctx.lineTo(384, y - 34); ctx.lineTo(358, y - 34); ctx.lineTo(358, 218); ctx.closePath(); ctx.fill(); ctx.stroke();
    ['farmer', 'elder', 'student', 'shopkeeper', 'adult', 'worker', 'doctor'].forEach((role, i) => this._fig(ctx, c, { role, x: 70 + i * 90, y: 450, height: 134, i: i + 1 }));
    pill(ctx, c, 'term ends', 180, 262, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'back to the people', 520, 262, { size: 28, bg: mix(c.s3, c.bgSurface, 0.45), ink: c.label, display: true });
  }

  draw(ctx, c) { [this._chamber, this._class, this._secret, this._back][this.stage].call(this, ctx, c); }
}
