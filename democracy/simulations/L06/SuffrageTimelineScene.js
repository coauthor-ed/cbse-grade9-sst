// SuffrageTimelineScene - blk-l06-s09. A to-scale strip: USA 1920, Britain 1928, India 1950. Beat 0
// women marching with blank placards. Beat 1 women and men in one queue, from 1950. Beat 2 the vote
// is there, and social prejudices still act as barriers: no invented numbers.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { tones, day, tile, say, folk, tag, pop, rr, mix } from './CivicWorld.js';

const S_LONG = 0, S_INDIA = 1, S_GAP = 2;
const MAP = [S_LONG, S_INDIA, S_GAP].map((idx) => [{ idx, dwellMs: null }]);
const WOMAN = { outfit: 'kurti', hairStyle: 'braid', dupatta: true, moustache: false, bottom: 'cream' };
const G = 260;

export class SuffrageTimelineScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static ARIA_LABEL = 'A date strip to scale: USA 1920, Britain 1928, India 1950. Women march with blank placards. Then women and men stand in one queue at a booth in India. Then a woman has her vote, and social prejudices stand as a barrier to equal participation.';
  static CONTROLS = [];
  busy() { return this.age < 1.2; }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    day(ctx, c, 680, 520, { ground: G, sun: false });
    tile(ctx, c, 12, 6, 656, 146, { fill: c.bgSurface, r: 14 });
    const marks = [{ id: 'usa', at: 1920, when: '1920', label: 'USA', tone: 2 }, { id: 'uk', at: 1928, when: '1928', label: 'Britain', tone: 2 }];
    if (s >= S_INDIA) marks.push({ id: 'india', at: 1950, when: '1950', label: 'India', tone: 1 });
    drawDateStrip(ctx, c, { from: 1905, to: 1958, marks, spans: s === S_LONG ? [{ from: 1905, to: 1928, label: 'decades of protests', tone: 2 }] : [] }, { x: 34, y: 10, w: 612, size: 28, labelSize: 28, lit: s === S_INDIA ? ['india'] : null });
    if (s === S_LONG) {
      [0, 1, 2, 3, 4, 5].forEach((i) => {
        const x = 70 + i * 106, y = 446 + (i % 2) * 6;
        if (i % 2 === 0) { ctx.fillStyle = t.wood; rr(ctx, x + 22, 222, 7, 110, 3); ctx.fill(); ctx.fillStyle = t.plaster; rr(ctx, x - 22, 164, 96, 62, 8); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.stroke(); }
        folk(ctx, this, { role: 'adult', x, y, height: 180, pose: 'walk', facing: 1, i: [1, 3, 5, 9, 11, 13][i], look: { outfit: i % 2 ? 'coat' : 'shirt', pattern: 'none', hairStyle: i % 3 ? 'bun' : 'bob', bottomStyle: 'long-skirt', bottom: ['brown', 'navy', 'charcoal'][i % 3], moustache: false, dupatta: false, shoeStyle: 'shoe' } });
      });
    } else if (s === S_INDIA) {
      drawCivic(ctx, c, 'booth', 590, 330, { h: 170 });
      ['adult', 'elder', 'adult', 'farmer', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: 64 + i * 96, y: 438 + (i % 2) * 8, height: 186 - (i % 2) * 10, facing: 1, i: i * 2 + 1, look: i % 2 ? {} : WOMAN }));
      tag(ctx, c, 'Men and women alike', 280, 186, { scale: pop(a, 0.2) });
    } else {
      drawCivic(ctx, c, 'booth', 120, 330, { h: 160 });
      folk(ctx, this, { role: 'adult', x: 262, y: 448, height: 204, facing: 1, i: 1, mood: 'think', look: WOMAN });
      const k = pop(a, 0.2);
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      tile(ctx, c, 340, 206, 150, 238, { fill: mix(c.bgSurface, c.waste, 0.34), r: 14 });
      ctx.restore();
      say(ctx, c, 'Social', 415, 300, { size: 28 }); say(ctx, c, 'prejudices', 415, 338, { size: 28 });
      drawCivic(ctx, c, 'parliament', 586, 446, { w: 170 });
      tag(ctx, c, 'Right to vote', 170, 178);
      tag(ctx, c, 'Equal participation', 500, 178, { scale: k });
    }
  }
}
