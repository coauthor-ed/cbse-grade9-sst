// WomenPanchayatScene - blk-l06-s08. Beat 0: women of the panchayat at a table, deciding. Beat 1:
// the book's list in four tiles, each with a woman at the work.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawDesk } from 'simulations/base/kit/SimProps.js';
import { tones, day, tile, say, folk, tag, pop, rr, mix } from './CivicWorld.js';

const S_MEET = 0, S_WORK = 1;
const MAP = [S_MEET, S_WORK].map((idx) => [{ idx, dwellMs: null }]);
const WOMAN = { outfit: 'kurti', hairStyle: 'braid', dupatta: true, moustache: false, bottom: 'cream' };

export class WomenPanchayatScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static ARIA_LABEL = 'Women of a panchayat at a table with a paper, named a women-friendly panchayat at the national level. Then four tiles with women at work: health, sanitation, livelihoods and self-help groups.';
  static CONTROLS = [];
  busy() { return this.age < 1; }

  draw(ctx, c) {
    const a = this.age, t = tones(c);
    if (this.stage === S_MEET) {
      ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 340); ctx.fillStyle = t.wood; ctx.fillRect(0, 340, 680, 130);
      say(ctx, c, 'South Manubankul Gram Panchayat', 340, 36, { size: 30 });
      tag(ctx, c, 'Women-friendly panchayat', 340, 82, { bg: c.accent, size: 28, scale: pop(a, 0.2) });
      [0, 1, 2, 3].forEach((i) => folk(ctx, this, { role: i === 1 ? 'elder' : 'adult', x: 130 + i * 140, y: 394, height: 226, facing: 0, pose: i === 1 ? 'point' : 'stand', i: [1, 3, 5, 9][i], look: WOMAN }));
      drawDesk(ctx, c, { x0: 50, x1: 630, y: 446, forHeight: 256 });
    } else {
      day(ctx, c, 680, 520, { ground: 440, hills: false, sun: false });
      const cell = (i, j, label, art) => {
        const x = 16 + i * 330, y = 10 + j * 222, k = pop(a, 0.05 + (i + j * 2) * 0.13);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 318, 212, { fill: c.bgSurface });
        art(x, y + 160);
        say(ctx, c, label, x + 159, y + 186, { size: 29 });
        ctx.restore();
      };
      cell(0, 0, 'Health', (x, g) => { folk(ctx, this, { role: 'nurse', x: x + 100, y: g, height: 144, facing: 1, pose: 'point', i: 1 }); folk(ctx, this, { role: 'elder', x: x + 220, y: g, height: 132, facing: -1, i: 3, look: WOMAN }); });
      cell(1, 0, 'Sanitation', (x, g) => {
        ctx.fillStyle = t.greyDark; rr(ctx, x + 216, g - 110, 18, 110, 5); ctx.fill(); rr(ctx, x + 180, g - 116, 54, 16, 6); ctx.fill();
        ctx.fillStyle = t.water; rr(ctx, x + 176, g - 92, 14, 54, 6); ctx.fill();
        ctx.fillStyle = mix(c.s8, c.bgSurface, 0.3); rr(ctx, x + 160, g - 36, 46, 36, 8); ctx.fill();
        folk(ctx, this, { role: 'adult', x: x + 96, y: g, height: 140, facing: 1, i: 5, look: WOMAN });
      });
      cell(0, 1, 'Livelihoods', (x, g) => {
        ctx.fillStyle = t.wood; rr(ctx, x + 150, g - 58, 130, 58, 8); ctx.fill();
        ctx.fillStyle = t.road; rr(ctx, x + 158, g - 74, 40, 18, 6); ctx.fill(); rr(ctx, x + 206, g - 74, 40, 18, 6); ctx.fill();
        folk(ctx, this, { role: 'shopkeeper', x: x + 92, y: g, height: 140, facing: 1, i: 9, look: WOMAN });
      });
      cell(1, 1, 'Self-help groups', (x, g) => { [0, 1, 2].forEach((n) => folk(ctx, this, { role: 'adult', x: x + 76 + n * 82, y: g, height: 134, facing: 0, i: [3, 5, 1][n], look: WOMAN })); });
    }
  }
}
