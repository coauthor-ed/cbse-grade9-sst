// DelimitationScene-answer - L03 s03. b0 the two seats and the weight of one vote. b1 the boundary moves to
// 15 lakh and 15 lakh, and the word delimitation appears. b2 boundaries change; Article 82; four years.
// b3 the dates on a line, and the 29-year gap as a question.
import { clamp01, inOutSine, mix, rr, font } from 'simulations/base/kit/SimLook.js';
import { tag } from '../shared/DayKit.js';
import { DelimitationScene } from './DelimitationScene.js';

const MAPMID = 180;
const m = (idx) => [{ idx, dwellMs: null }];
const YEARS = [1952, 1963, 1973, 2002];
const X = (y) => 70 + ((y - 1950) / 55) * 540;

export class DelimitationAnswerScene extends DelimitationScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static ARIA_LABEL = 'The hill and city seats. One glyph stands for one lakh people under each MP. The boundary moves until each MP has 15 lakh people. Then the four Delimitation Commissions on a line: 1952, 1963, 1973 and 2002, with a gap of 29 years marked with a question.';

  _shift() {
    if (this.stage === 0) return 0;
    if (this.stage === 1) return inOutSine(clamp01(this.age / 1.2)) * 10;
    return 10;
  }

  _dates(ctx, c) {
    const yy = 240;
    ctx.fillStyle = c.bgSurface; rr(ctx, 14, 40, 652, 372, 20); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.stroke; ctx.stroke();
    ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.font = font(c, 700, 34, true); ctx.fillText('Delimitation Commissions', 340, 92);
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.5); ctx.fillRect(X(1973), yy - 9, X(2002) - X(1973), 18);
    ctx.fillStyle = c.stroke; ctx.fillRect(X(1950), yy - 3, X(2005) - X(1950), 6);
    YEARS.forEach((y, i) => {
      ctx.beginPath(); ctx.arc(X(y), yy, 18, 0, 7); ctx.fillStyle = c.s1; ctx.fill();
      tag(ctx, c, String(y), X(y) + (i === 1 ? 0 : i === 0 ? -14 : i === 2 ? 14 : 0), i % 2 ? yy + 56 : yy - 56, { bg: c.s1, size: 30 });
    });
    tag(ctx, c, '29 years: why?', (X(1973) + X(2002)) / 2, yy + 110, { bg: c.gold, size: 34 });
  }

  draw(ctx, c) {
    this.ground(ctx, c);
    if (this.stage === 3) { this._dates(ctx, c); return; }
    this.seats(ctx, c, this._lx(), 5 + Math.round(this._shift()), true, false);
    if (this.stage === 1 && this.age > 1.2) tag(ctx, c, 'Delimitation', 340, MAPMID, { bg: c.gold, size: 36 });
    if (this.stage === 2) { tag(ctx, c, 'Article 82', 340, MAPMID - 44, { bg: c.gold, size: 32 }); tag(ctx, c, 'Boundaries change', 340, MAPMID + 12, { size: 30 }); }
  }
}
