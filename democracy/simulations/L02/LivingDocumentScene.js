// LivingDocumentScene - L02 s09. The open Constitution with four values as bookmarks. b0 a dynamic
// document, not a rigid code. b1 the learner presses Add an amendment: a hand brings in a slip, the
// count is true, and the four values do not move. Figure-performed step.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01, drawBackdrop, rr } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawCivic } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const VALUES = [['liberty', 's1'], ['equality', 's2'], ['justice', 's3'], ['fraternity', 's5']];
const MAX = 4;

export class LivingDocumentScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'An open book, the Constitution, with four bookmarks: liberty, equality, justice and fraternity. Press Add an amendment and a person lays a slip into the book under Article 368. The slips add up and the four bookmarks stay where they are.';
  static CONTROLS = [{ type: 'button', id: 'add', label: 'Add an amendment' }];
  slips = 0;
  born = 0;

  isControlHidden(id) { return id === 'add' && this.stage !== 1; }
  isControlDisabled(id) { return id === 'add' && this.slips >= MAX; }
  enter() { this.slips = 0; this.born = 0; }
  onControlChange(id) {
    if (id !== 'add' || this.slips >= MAX) return;
    this.slips += 1; this.born = this.age;
    if (this.slips === 1) this.after(0.6, () => this.celebrate(340, 300, 14));
    this.animateFor?.(900); this.requestDraw?.();
  }
  busy() { return this.age < 0.7 || this.age - this.born < 0.7; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    pill(ctx, c, this.stage ? 'Article 368' : 'a dynamic document', 340, 30, { size: 32, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    VALUES.forEach(([t, s], i) => {
      const x = 100 + i * 160;
      rr(ctx, x - 30, 62, 60, 110, 8); ctx.fillStyle = mix(c[s], c.bgSurface, 0.2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = mix(c[s], c.label, 0.5); ctx.stroke();
      pill(ctx, c, t, x, 92, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    });
    drawCivic(ctx, c, 'bookOpen', 290, 416, { w: 440 });
    for (let i = 0; i < this.slips; i++) {
      const fresh = i === this.slips - 1 ? 1 - (1 - clamp01((this.age - this.born) / 0.5)) ** 3 : 1;
      const tx = 290 + 18 * i, ty = 330 - 6 * i, x = 640 + (tx - 640) * fresh, y = 280 + (ty - 280) * fresh;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.05 + i * 0.04);
      rr(ctx, -42, -56, 84, 112, 6); ctx.fillStyle = mix(c.gold, c.bgSurface, 0.3); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = mix(c.gold, c.label, 0.5); ctx.stroke();
      ctx.strokeStyle = mix(c.gold, c.label, 0.4); ctx.lineWidth = 3; for (let l = 0; l < 4; l++) { ctx.beginPath(); ctx.moveTo(-28, -32 + l * 20); ctx.lineTo(28, -32 + l * 20); ctx.stroke(); }
      ctx.restore();
    }
    const s = figureFor(this, { role: 'adult', x: 606, y: 448, height: 256, i: 5, facing: -1, pose: this.stage === 1 ? 'point' : 'stand', mood: 'smile' });
    drawFigure(ctx, c, s, s.look);
    if (this.stage === 1) pill(ctx, c, `${this.slips} ${this.slips === 1 ? 'amendment' : 'amendments'} added`, 190, 196, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    if (this.stage === 1 && this.slips > 0) pill(ctx, c, 'the four values stay', 190, 240 , { size: 28, bg: mix(c.s3, c.bgSurface, 0.5), ink: c.label, display: true });
  }
}
