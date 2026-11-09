// DutiesScene - L03 s09b. Three cards, one lit a beat. Each says who it speaks to and whether a court
// enforces it: the book's Let's Explore asks for exactly these differences.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { panel } from '../shared/SstArt.js';
import { drawCivic } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const W = 216, G = 8, X = [8, 8 + W + G, 8 + 2 * (W + G)];
const CARD = [
  { name: ['Fundamental', 'Rights'], s: 's1', who: 'for citizens', court: 'court: yes' },
  { name: ['Fundamental', 'Duties'], s: 's3', who: 'duty of citizens', court: 'court: no' },
  { name: ['Directive', 'Principles'], s: 's5', who: 'guide the State', court: 'court: no' },
];

export class DutiesScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'Three cards, lit one at a time. Fundamental Rights are for citizens and a court enforces them. Fundamental Duties are asked of citizens, and a court does not enforce them. Directive Principles guide the State, and a court does not enforce them.';

  busy() { return this.age < 0.6; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    const fig = (o) => { const s = figureFor(this, { facing: 0, mood: 'smile', ...o }); drawFigure(ctx, c, s, s.look); };
    CARD.forEach((k, i) => {
      const off = i > this.stage, lit = i === this.stage, x = X[i], cx = x + W / 2;
      panel(ctx, c, x, 10, W, 434, { fill: mix(c[k.s], c.bgSurface, 0.8), lit, litCol: c[k.s], off });
      ctx.save(); if (off) ctx.globalAlpha *= 0.34;
      if (i === 0) { fig({ role: 'voter', x: cx - 50, y: 314, height: 176, i: 2, facing: 1 }); drawCivic(ctx, c, 'court', cx + 50, 314, { h: 92 }); }
      if (i === 1) { fig({ role: 'student', x: cx - 50, y: 314, height: 166, i: 3, facing: 1 }); drawCivic(ctx, c, 'book', cx + 54, 314, { h: 112 }); }
      if (i === 2) { drawCivic(ctx, c, 'office', cx, 314, { h: 160 }); }
      ctx.restore();
      ctx.save(); if (off) ctx.globalAlpha *= 0.4;
      pill(ctx, c, k.name[0], cx, 40, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, k.name[1], cx, 82, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      if (!off) { pill(ctx, c, k.who, cx, 352, { size: 28, bg: mix(c[k.s], c.bgSurface, 0.5), ink: c.label, display: false }); pill(ctx, c, k.court, cx, 402, { size: 28, bg: c.bgSurface, ink: c.label, display: false }); }
      ctx.restore();
    });
  }
}
