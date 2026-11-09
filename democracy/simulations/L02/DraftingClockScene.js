// DraftingClockScene - L02 s08. An assembly hall with members at long desks. b0 the Assembly forms, 1946.
// b1 a big counter runs up to 2 years, 11 months, 18 days. b2 two sources flow into one book.
// Dr Ambedkar is a named label: a figure would claim a likeness, so none stands for him.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01, drawBackdrop, font } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { panel, pal } from '../shared/SstArt.js';
import { drawCivic } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const TOTAL = 2 * 365 + 11 * 30.4 + 18;
const ROLES = ['adult', 'elder', 'teacher', 'shopkeeper', 'adult', 'elder', 'adult', 'teacher', 'adult'];

export class DraftingClockScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A hall with members of the Constituent Assembly at long desks, formed in 1946. Then a counter runs to 2 years, 11 months, 18 days, with Dr B.R. Ambedkar named as Chairman of the Drafting Committee. Then two streams, Indian traditions and global democratic values, flow into one book.';

  busy() { return this.age < (this.stage === 1 ? 2.3 : 0.9); }

  _hall(ctx, c, y0, rows = 2) {
    const p = pal(c);
    panel(ctx, c, 10, y0, 660, 452 - y0 - 8, { fill: mix(c.gold, c.bgSurface, 0.7) });
    ctx.save(); ctx.beginPath(); ctx.rect(12, y0, 656, 452 - y0 - 10); ctx.clip();
    const row = (y, h, n, x0, gap, off) => {
      for (let i = 0; i < n; i++) { const s = figureFor(this, { role: ROLES[(i + off) % 9], x: x0 + i * gap, y: y + h * 0.5, height: h, i: i + off + 1, facing: 0, mood: 'smile' }); drawFigure(ctx, c, s, s.look); }
      ctx.fillStyle = p.wood; ctx.fillRect(24, y, 632, 24); ctx.fillStyle = p.woodLight; ctx.fillRect(24, y, 632, 6);
    };
    if (rows > 1) row(y0 + 130, 116, 8, 70, 77, 0);
    row(y0 + (rows > 1 ? 250 : 136), 130, 7, 106, 78, 3);
    ctx.restore();
  }

  _counter(ctx, c) {
    const u = 1 - (1 - clamp01(this.age / 2.1)) ** 2, d = TOTAL * u;
    const done = u >= 1, y = done ? 2 : Math.floor(d / 365), mo = done ? 11 : Math.min(11, Math.floor((d - y * 365) / 30.4)), da = done ? 18 : Math.floor(d - y * 365 - mo * 30.4);
    [[y, 'years'], [mo, 'months'], [da, 'days']].forEach(([v, l], i) => {
      const x = 118 + i * 222;
      panel(ctx, c, x - 100, 10, 200, 118, { fill: c.bgSurface });
      ctx.font = font(c, 700, 62, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label; ctx.fillText(String(v), x, 54);
      ctx.font = font(c, 800, 28, false); ctx.fillStyle = c.labelMuted; ctx.fillText(l, x, 106);
    });
  }

  _two(ctx, c) {
    panel(ctx, c, 14, 14, 300, 108, { fill: mix(c.gold, c.bgSurface, 0.6) });
    panel(ctx, c, 366, 14, 300, 108, { fill: mix(c.s1, c.bgSurface, 0.6) });
    pill(ctx, c, 'Indian traditions', 164, 68, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'global democratic', 516, 46, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'values', 516, 92, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    const k = clamp01(this.age / 0.7);
    [[164, c.gold], [516, c.s1]].forEach(([x, col]) => {
      ctx.strokeStyle = mix(col, c.label, 0.2); ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, 130); ctx.quadraticCurveTo(x, 240, x + (340 - x) * k, 130 + 130 * k); ctx.stroke();
    });
    drawCivic(ctx, c, 'book', 340, 446, { h: 196 });
    pill(ctx, c, 'Constitution of India', 340, 150, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === 0) {
      pill(ctx, c, '1946', 150, 40, { size: 50, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
      pill(ctx, c, 'Constituent Assembly', 450, 40, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
      this._hall(ctx, c, 84);
    } else if (this.stage === 1) {
      this._counter(ctx, c);
      this._hall(ctx, c, 232, 1);
      pill(ctx, c, 'Dr B.R. Ambedkar', 340, 158, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'Chairman, Drafting Committee', 340, 202, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label });
    } else this._two(ctx, c);
  }
}
