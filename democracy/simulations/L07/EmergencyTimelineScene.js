// EmergencyTimelineScene - blk-l07-s05. One beat each: the early 1970s, the mass movements of those
// years, June 1975, what happened during the period. A to-scale strip stays on top.
// Grey paper and grey tiles: no alarm colour, no likeness of anyone, no judgement beyond the book.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { drawCivic } from '../shared/CivicArt.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { tones, tile, say, folk, pop, mix } from '../L06/CivicWorld.js';

const S_EARLY = 0, S_MOVES = 1, S_JUNE = 2, S_DURING = 3;
const MAP = [S_EARLY, S_MOVES, S_JUNE, S_DURING].map((idx) => [{ idx, dwellMs: null }]);
const X0 = 26, TW = 628;

export class EmergencyTimelineScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static ARIA_LABEL = 'A date strip from 1970 to 1977 in plain grey. Early 1970s: three causes of protest. Then the mass movements led by Jayaprakash Narayan. June 1975: the National Emergency, on the grounds of internal disturbance. During the period: Fundamental Rights, the press, and leaders and activists, in three tiles.';
  static CONTROLS = [];

  busy() { return this.age < 1.2; }

  _strip(c) {
    const s = this.stage, tone = 'waste';
    const marks = [{ id: 'early', at: 1971.5, when: 'Early 1970s', label: 'Protests', tone }];
    if (s >= S_JUNE) marks.push({ id: 'june', at: 1975.45, when: 'June 1975', label: 'Emergency', tone });
    return { from: 1970, to: 1978, marks, spans: s >= S_JUNE ? [{ from: 1975.45, to: 1977.2, label: '1975-77', tone }] : [] };
  }

  _row(ctx, c, y, k, art, title, line) {
    const t = tones(c), h = 92;
    ctx.save(); ctx.globalAlpha *= Math.min(1, k); ctx.translate(0, (1 - k) * 18);
    tile(ctx, c, X0, y, TW, h, { fill: mix(c.bgSurface, c.waste, 0.1), rim: t.greyDark });
    art(X0 + 62, y + h - 8);
    say(ctx, c, title, X0 + 126, y + 30, { align: 'left', size: 30 });
    say(ctx, c, line, X0 + 126, y + 66, { align: 'left', size: 28, display: false, col: c.label });
    ctx.restore();
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    drawBackdrop(ctx, c, 'dots');
    drawDateStrip(ctx, c, this._strip(c), { x: 40, y: 14, w: 600, size: 28, labelSize: 28, lit: s <= S_MOVES ? ['early'] : s === S_JUNE ? ['june'] : null });
    const top = 150;
    if (s === S_EARLY) {
      ['Rising unemployment', 'Inflation', 'Allegations of misgovernance'].forEach((text, i) => {
        const k = pop(a, 0.1 + i * 0.25);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, X0 + 14, top + i * 56, TW - 28, 48, { fill: c.bgSurface, rim: t.greyDark, r: 12 });
        say(ctx, c, text, 340, top + 25 + i * 56, { size: 28 });
        ctx.restore();
      });
      const base = 450;
      for (let i = 0; i < 7; i++) folk(ctx, this, { role: ['adult', 'student', 'farmer', 'worker', 'adult', 'shopkeeper', 'student'][i], x: 70 + i * 90, y: base + (i % 2) * 6, height: 122, pose: 'stand', facing: 0, i });
    } else if (s === S_JUNE) {
      const k = pop(a, 0.05);
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      tile(ctx, c, X0, top, TW, 120, { fill: mix(c.bgSurface, c.waste, 0.1), rim: t.greyDark });
      say(ctx, c, 'National Emergency', 340, top + 40, { size: 42 });
      say(ctx, c, 'on the grounds of internal disturbance', 340, top + 88, { size: 28, display: false });
      ctx.restore();
      [['352', 'National Emergency'], ['356', "President's Rule"], ['360', 'Financial Emergency']].forEach(([n, l], i) => {
        const y = top + 134 + i * 52, kk = pop(a, 0.3 + i * 0.2);
        ctx.save(); ctx.globalAlpha *= Math.min(1, kk);
        say(ctx, c, 'Article ' + n, X0 + 16, y + 24, { align: 'left', size: 28 });
        say(ctx, c, l, X0 + 216, y + 24, { align: 'left', size: 28, display: false });
        ctx.restore();
      });
    } else if (s === S_DURING) {
      this._row(ctx, c, top, pop(a, 0.05), (x, y) => drawCivic(ctx, c, 'book', x, y, { h: 72 }), 'Fundamental Rights', 'a majority were suspended');
      this._row(ctx, c, top + 102, pop(a, 0.3), (x, y) => drawCivic(ctx, c, 'newspaper', x, y, { h: 72 }), 'The press', 'was censored');
      this._row(ctx, c, top + 204, pop(a, 0.55), (x, y) => { folk(ctx, this, { role: 'adult', x: x - 18, y: y + 4, height: 76, i: 2, mood: 'think' }); folk(ctx, this, { role: 'student', x: x + 22, y: y + 4, height: 72, i: 5, mood: 'think' }); }, 'Political leaders, activists', 'numerous were arrested');
    } else {
      const k = pop(a, 0.05);
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      tile(ctx, c, X0, top, TW, 96, { fill: mix(c.bgSurface, c.waste, 0.1), rim: t.greyDark });
      say(ctx, c, 'Jayaprakash Narayan', 340, top + 34, { size: 34 });
      say(ctx, c, 'popularly known as Lok Nayak', 340, top + 70, { size: 28, display: false });
      ctx.restore();
      ['Bihar', 'Gujarat'].forEach((n, i) => { tile(ctx, c, 170 + i * 180, top + 108, 160, 52, { fill: c.bgSurface, rim: t.greyDark, r: 12 }); say(ctx, c, n, 250 + i * 180, top + 135, { size: 28 }); });
      for (let i = 0; i < 8; i++) folk(ctx, this, { role: i % 2 ? 'student' : ['adult', 'farmer', 'worker', 'adult'][i / 2], x: 60 + i * 80, y: 448 + (i % 2) * 5, height: 124, pose: 'walk', facing: 1, i: i + 2 });
    }
  }
}
