// PartyRegisterScene - blk-l04-s07. Practice parties A, B and C, with plain marks.
// b0 who can contest. b1 a party's own election. b2 three shelves and what each gets. b3 a dispute.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tile, say, folk, tag, pop, mark, wrap, mix, rr, tones } from './BoothWorld.js';

const S_WHO = 0, S_INNER = 1, S_CLASS = 2, S_DISPUTE = 3;
const MAP = [S_WHO, S_INNER, S_CLASS, S_DISPUTE].map((idx) => [{ idx, dwellMs: null }]);
const SHELVES = [
  { t: 'National party', p: 'Party A', m: 'circle', s: 'Reserved symbol' },
  { t: 'State party', p: 'Party B', m: 'triangle', s: 'Reserved symbol' },
  { t: 'Registered-unrecognised', p: 'Party C', m: null, s: 'Free symbol from a list' },
];

export class PartyRegisterScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static ARIA_LABEL = 'A registered party candidate and an independent candidate, each able to contest. Party members hold their own election. Three shelves show national, state and registered-unrecognised parties and their symbols. Two sides bring a dispute to the Election Commission.';
  static CONTROLS = [];

  busy() { return this.age < 1.6; }

  _card(ctx, c, name, x, y, m, w = 150, tabbed = true) {
    const t = tones(c);
    tile(ctx, c, x - w / 2, y - 36, w, 72, { fill: mix(c.gold, c.bgSurface, 0.72), r: 10 });
    if (tabbed) { ctx.fillStyle = t.wood; rr(ctx, x - w / 2 + 16, y - 46, 50, 14, 5); ctx.fill(); }
    say(ctx, c, name, x - (m ? 26 : 0), y + 1, { size: 27 });
    if (m) mark(ctx, c, m, x + w / 2 - 32, y, 18);
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    if (s === S_WHO) {
      day(ctx, c, 680, 456, { ground: 340, hills: false });
      [{ x: 14, t: 'Party candidate', role: 'adult', i: 3 }, { x: 348, t: 'Independent', role: 'shopkeeper', i: 8 }].forEach((d, i) => {
        const k = pop(a, 0.1 + i * 0.25);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, d.x, 12, 318, 432, { fill: c.bgSurface });
        say(ctx, c, d.t, d.x + 159, 48, { size: 32 });
        folk(ctx, this, { role: d.role, x: d.x + 92, y: 352, height: 244, facing: 1, i: d.i, pose: 'point' });
        if (!i) { drawCivic(ctx, c, 'bookOpen', d.x + 232, 232, { w: 138 }); this._card(ctx, c, 'Party A', d.x + 232, 284, null, 130); } else { tag(ctx, c, 'No party', d.x + 232, 244, { size: 28 }); }
        wrap(ctx, c, i ? 'Not affiliated to a party' : 'Registered with the ECI', d.x + 159, 396, 290, { size: 27 });
        ctx.restore();
      });
    } else if (s === S_INNER) {
      day(ctx, c, 680, 456, { ground: 300 });
      tag(ctx, c, 'Party A elects its own posts', 340, 38, { size: 32, bg: c.bgSurface });
      drawCivic(ctx, c, 'ballotBox', 340, 340, { h: 170 });
      [66, 170, 510, 614].forEach((x, i) => folk(ctx, this, { role: ['adult', 'elder', 'teacher', 'farmer'][i], x, y: 430 + (i % 2) * 8, height: 234, facing: i < 2 ? 1 : -1, pose: i % 2 ? 'wave' : 'stand', i: i + 2, mood: 'smile' }));
      tag(ctx, c, 'Held periodically', 340, 400, { size: 28, bg: c.gold, scale: pop(a, 0.5) });
    } else if (s === S_CLASS) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      SHELVES.forEach((d, i) => {
        const y = 8 + i * 148, k = pop(a, 0.1 + i * 0.22);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, 10, y, 660, 136, { fill: c.bgSurface });
        say(ctx, c, d.t, 34, y + 34, { size: 29, align: 'left' });
        this._card(ctx, c, d.p, 124, y + 92, null, 170, false);
        if (d.m) { mark(ctx, c, d.m, 268, y + 92, 28, c.accent); } else { [0, 1, 2].forEach((j) => { ctx.save(); ctx.globalAlpha *= j === 2 ? 1 : 0.28; mark(ctx, c, 'square', 232 + j * 28, y + 92, 11); ctx.restore(); }); }
        say(ctx, c, d.s, 322, y + 92, { size: 28, display: false, align: 'left' });
        ctx.restore();
      });
    } else {
      day(ctx, c, 680, 456, { ground: 340, hills: false });
      drawCivic(ctx, c, 'court', 340, 350, { w: 280 });
      tag(ctx, c, 'ECI: quasi-judicial', 340, 36, { size: 32, bg: c.bgSurface });
      folk(ctx, this, { role: 'adult', x: 76, y: 436, height: 226, facing: 1, pose: 'point', i: 3, mood: 'think' });
      folk(ctx, this, { role: 'teacher', x: 604, y: 436, height: 226, facing: -1, pose: 'point', i: 5, mood: 'think' });
      this._card(ctx, c, 'Who gets it?', 340, 402, 'square', 260);
    }
  }
}
