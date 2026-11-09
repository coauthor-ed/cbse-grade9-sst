// BallotResultScene (file BallotVerdictScene.js) - blk-l07-s07. Beat 0: 1977, a ballot box, people voting, one plain result in
// words. No seat numbers and no bars. Beat 1: three things the period showed to be important,
// as three tiles to tap. Tapping reads a tile: there is no find here, so nothing celebrates.
// Nothing is coloured as good or bad.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { wrapText, font } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, tile, say, folk, pop, rr, clamp01 } from '../L06/CivicWorld.js';

const CHIPS = [
  { id: 'safeguards', label: 'Safeguards', full: 'Constitutional safeguards', targets: ['safeguards'] },
  { id: 'liberties', label: 'Liberties', full: 'Civil liberties', targets: ['liberties'] },
  { id: 'citizens', label: 'Citizens', full: 'Active citizen participation', targets: ['citizens'] },
];
const WORDS = { safeguards: 'Rules in the Constitution that protect democracy', liberties: 'Freedoms of citizens, such as speech and the press', citizens: 'People who take part, and vote' };
const S_RESULT = 0, S_THREE = 1;
const MAP = [S_RESULT, S_THREE].map((idx) => [{ idx, dwellMs: null }]);
const T = [{ x: 16, id: 'safeguards' }, { x: 240, id: 'liberties' }, { x: 464, id: 'citizens' }];

export class BallotResultScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A ballot box with people voting in 1977, and one result in words: the ruling government was defeated. Then three tiles: constitutional safeguards, civil liberties and active citizens, each lit by a chip.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_THREE; }
  enter() { this.tl.reset(); }
  busy() { return this.stage === S_RESULT ? this.age < 2.4 : this.age < 0.9; }

  draw(ctx, c) {
    const a = this.age, t = tones(c);
    day(ctx, c, 680, 520, { ground: 290, sun: this.stage === S_RESULT });
    if (this.stage === S_RESULT) {
      say(ctx, c, '1977', 340, 44, { size: 58 });
      say(ctx, c, 'General elections', 340, 92, { size: 32, display: false });
      drawCivic(ctx, c, 'ballotBox', 340, 368, { h: 218 });
      const k = clamp01((a - 0.3) / 0.9), py = 122 + 40 * k;
      if (k < 1) { rr(ctx, 312, py, 56, 34, 4); ctx.fillStyle = t.plaster; ctx.fill(); ctx.strokeStyle = c.label; ctx.lineWidth = 2.5; ctx.stroke(); }
      ['adult', 'farmer', 'student'].forEach((role, i) => folk(ctx, this, { role, x: 56 + i * 76, y: 368 + i * 3, height: 176 - i * 6, facing: 1, i: i + 1 }));
      ['elder', 'worker', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: 624 - i * 76, y: 368 + i * 3, height: 172 - i * 6, facing: -1, i: i + 4 }));
      const r = pop(a, 1.3);
      ctx.save(); ctx.globalAlpha *= Math.min(1, r);
      tile(ctx, c, 60, 386, 560, 60, { fill: c.bgSurface });
      say(ctx, c, 'The ruling government was defeated', 340, 416, { size: 30 });
      ctx.restore();
    } else {
      const on = this.tl.any();
      T.forEach((b, i) => {
        const lit = this.tl.has(b.id), dim = on && !lit, k = pop(a, 0.05 + i * 0.18);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, b.x, 12, 200, 244, { fill: c.bgSurface, lit, dim });
        if (dim) ctx.globalAlpha *= 0.42;
        if (i === 0) drawCivic(ctx, c, 'book', b.x + 100, 190, { h: 164 });
        else if (i === 1) { drawCivic(ctx, c, 'newspaper', b.x + 72, 190, { h: 126 }); drawCivic(ctx, c, 'mike', b.x + 156, 190, { h: 146 }); }
        else ['adult', 'student', 'farmer'].forEach((role, j) => folk(ctx, this, { role, x: b.x + 46 + j * 54, y: 190, height: 146, i: j + 2 }));
        say(ctx, c, ['Safeguards', 'Liberties', 'Citizens'][i], b.x + 100, 226, { size: 32 });
        ctx.restore();
      });
      tile(ctx, c, 16, 272, 648, 172, { fill: c.bgSurface });
      const id = this.tl.chip()?.id;
      if (id) {
        say(ctx, c, CHIPS.find((x) => x.id === id).full, 340, 310, { size: 32 });
        ctx.font = font(c, 700, 28); ctx.fillStyle = c.label;
        wrapText(ctx, WORDS[id], 40, 342, 600, { lineH: 36, align: 'center', maxLines: 2 });
      } else {
        say(ctx, c, 'Both at once', 340, 310, { size: 32 });
        say(ctx, c, 'Vulnerability: can be harmed', 340, 358, { size: 28, display: false });
        say(ctx, c, 'Resilience: can recover', 340, 400, { size: 28, display: false });
      }
    }
  }
}
