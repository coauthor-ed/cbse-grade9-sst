// ConstitutionTimelineScene - L01 s06. b0 two dates on a to-scale strip, two months apart, over the
// book. b1 the five grounds on which no citizen may be discriminated against, over a row of citizens.
// b2 elections on one side, the limits on the winners on the other. The book stays the same object.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, chipRow, mix, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { panel } from '../shared/SstArt.js';
import { drawCivic } from '../shared/CivicArt.js';
import { drawDateStrip } from '../shared/DateStrip.js';

const m = (idx) => [{ idx, dwellMs: null }];
const STRIP = {
  from: 1949.82, to: 1950.14,
  marks: [
    { id: 'a', at: 1949.9, when: '26 Nov 1949', label: 'adopted', tone: 2 },
    { id: 'b', at: 1950.07, when: '26 Jan 1950', label: 'came into force', tone: 3 },
  ],
  spans: [{ from: 1949.9, to: 1950.07, label: '2 months', tone: 'accent' }],
};
const GROUNDS = ['religion', 'race', 'caste', 'sex', 'place of birth'];

export class ConstitutionTimelineScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A thick bound book, the Constitution, over a date strip: adopted 26 November 1949 and in force 26 January 1950, two months apart. Then five grounds on which no citizen may be discriminated against, over a row of citizens. Then a ballot box for who governs beside the book for what the winners must respect.';

  busy() { return this.age < 1.1; }

  _citizens(ctx, c) {
    const R = ['farmer', 'elder', 'student', 'shopkeeper', 'adult', 'worker', 'doctor'];
    R.forEach((role, i) => { const s = figureFor(this, { role, x: 64 + i * 92, y: 450, height: 220, i: i + 1, facing: 0, mood: 'smile' }); drawFigure(ctx, c, s, s.look); });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === 0) {
      drawCivic(ctx, c, 'book', 220, 216, { h: 204 });
      pill(ctx, c, 'Constitution', 470, 92, { size: 34, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'of India', 470, 146, { size: 34, bg: c.bgSurface, ink: c.label, display: true });
      drawDateStrip(ctx, c, STRIP, { x: 24, y: 256, w: 632, size: 34, labelSize: 28, k: clamp01(this.age / 0.9) });
    } else if (this.stage === 1) {
      pill(ctx, c, 'No discrimination on the basis of', 340, 32, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      chipRow(ctx, c, GROUNDS.map((t) => ({ text: t, bg: mix(c.s5, c.bgSurface, 0.6), ink: c.label })), 340, 84, { size: 28, wrapAt: 630, display: true, align: 'center' });
      this._citizens(ctx, c);
    } else {
      panel(ctx, c, 12, 10, 322, 434, { fill: mix(c.s1, c.bgSurface, 0.82) });
      panel(ctx, c, 346, 10, 322, 434, { fill: mix(c.s5, c.bgSurface, 0.82) });
      pill(ctx, c, 'Elections', 173, 46, { size: 34, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'Constitution', 507, 46, { size: 34, bg: c.bgSurface, ink: c.label, display: true });
      drawCivic(ctx, c, 'ballotBox', 173, 300, { h: 196 });
      drawCivic(ctx, c, 'book', 507, 300, { h: 206 });
      pill(ctx, c, 'who governs', 173, 354, { size: 30, bg: mix(c.s1, c.bgSurface, 0.5), ink: c.label, display: true });
      pill(ctx, c, 'what winners', 507, 346, { size: 28, bg: mix(c.s5, c.bgSurface, 0.5), ink: c.label, display: true });
      pill(ctx, c, 'must respect', 507, 396, { size: 28, bg: mix(c.s5, c.bgSurface, 0.5), ink: c.label, display: true });
    }
  }
}
