// VoterScaleScene - L01 s04. True to scale. One figure stands for 1 crore people, so the 140 marks are
// India's population and 96.8 are lit (the 97th is lit 0.8 of the way up).
// b0 the voters alone. b1 the rest of the people join, muted. b2 one MP and the 25 lakh people behind
// the seat: 100 dots, each figure 25,000 people.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure, drawPersonGlyph } from 'simulations/base/kit/SimFigure.js';
import { panel } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const COLS = 20, ROWS = 7, CW = 31.5, CH = 48, X0 = 25, Y0 = 104;
const VOTERS = 96.8;

export class VoterScaleScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A grid of small people, where one figure stands for one crore. On the first step 96.8 crore voters are lit. On the second the grid grows to 140 crore, the population, and the voters stay lit: more than two of every three. On the third, one Member of Parliament stands beside one hundred dots, each figure 25,000 people, making about 25 lakh.';

  busy() { return this.age < 1.5; }

  _grid(ctx, c) {
    const k = this.age / 1.1;
    for (let i = 0; i < 140; i++) {
      const col = i % COLS, row = Math.floor(i / COLS), x = X0 + col * CW + CW / 2, y = Y0 + row * CH + CH - 3;
      const lit = i < 97;
      if (!lit && this.stage === 0) continue;
      const a = clamp01((this.stage === 0 ? k * 1.0 - i / 140 : lit ? 1 : (k - (i - 97) / 60)) * 3);
      if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha = a;
      if (i === 96) {
        drawPersonGlyph(ctx, c, x, y, 42, { col: mix(c.waste, c.bgSurface, 0.45) });
        ctx.beginPath(); ctx.rect(x - 20, y - 42 * 0.8, 40, 42 * 0.8); ctx.clip();
        drawPersonGlyph(ctx, c, x, y, 42, { col: mix(c.s1, c.label, 0.4) });
      } else drawPersonGlyph(ctx, c, x, y, 42, { col: lit ? mix(c.s1, c.label, 0.4) : mix(c.waste, c.bgSurface, 0.45) });
      ctx.restore();
    }
  }

  _mp(ctx, c) {
    panel(ctx, c, 14, 10, 652, 434, { fill: mix(c.bgSurface, c.gold, 0.1) });
    const s = figureFor(this, { role: 'adult', x: 118, y: 430, height: 262, i: 4, facing: 1, mood: 'smile' });
    drawFigure(ctx, c, s, s.look);
    pill(ctx, c, '1 MP', 118, 92, { size: 36, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    const k = this.age / 1.1;
    for (let i = 0; i < 100; i++) {
      const col = i % 10, row = Math.floor(i / 10), a = clamp01((k - (i / 100)) * 4);
      if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha = a;
      drawPersonGlyph(ctx, c, 262 + col * 38 + 15, 124 + row * 30 + 26, 27, { col: mix(c.s1, c.label, 0.4) });
      ctx.restore();
    }
    pill(ctx, c, 'about 25 lakh people', 450, 46, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, '1 figure = 25,000 people', 450, 92, { size: 26, bg: mix(c.s1, c.label, 0.4), display: false });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === 2) { this._mp(ctx, c); return; }
    pill(ctx, c, '96.8 crore voters', 340 - (this.stage ? 134 : 0), 34, { size: 38, bg: mix(c.s1, c.bgSurface, 0.45), ink: c.label, display: true });
    if (this.stage === 1) pill(ctx, c, '140 crore people', 520, 34, { size: 28, bg: mix(c.waste, c.bgSurface, 0.6), ink: c.label, display: true });
    pill(ctx, c, this.stage === 0 ? '1 figure = 1 crore people' : 'about 2 of every 3', 340, 80, { size: 28, bg: c.bgSurface, ink: c.label });
    this._grid(ctx, c);
  }
}
