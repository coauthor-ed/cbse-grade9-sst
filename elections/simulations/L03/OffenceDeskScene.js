// OffenceDeskScene - L03 s04. b0 to b2 the three Acts on a shelf, one lit a beat, with what each covers.
// b3 to b5 the book's three examples as small drawn cases. Chips under the figure go back to any example.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, rr, darken, font } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { room, who, tag, drawCivic } from '../shared/DayKit.js';
import { speech } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const CHIPS = [{ id: 'gift', label: 'Gift', targets: ['gift'] }, { id: 'appeal', label: 'Appeal', targets: ['appeal'] }, { id: 'help', label: 'Officials', targets: ['help'] }];
const ACTS = [
  { y: '1950', tone: 's1', tags: ['seats', 'delimitation', 'electoral rolls', 'right to vote'] },
  { y: '1951', tone: 's2', tags: ['nomination', 'campaigns', 'voting', 'disputes'] },
  { y: '1952', tone: 's5', tags: ['President', 'Vice President'] },
];
const STEP_OF = { gift: 3, appeal: 4, help: 5 };
const BEAT_OF = { 3: 'gift', 4: 'appeal', 5: 'help' };

export class OffenceDeskScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4), m(5)];
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Examples', chips: CHIPS }), value: 'gift', options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Three Acts on a shelf: 1950 on seats, delimitation, electoral rolls and the right to vote; 1951 on nomination, campaigns, voting and disputes; 1952 on the President and Vice President. Then three examples of offences: a gift for a decision, an appeal to religion or caste, and help from officials.';
  tl = tapLight({ chips: CHIPS });

  // The chip of the example on show is the selected one, so every other chip changes the picture at once.
  getControlValue(id) { return id === 'lit' ? (this._shown() ?? 'gift') : undefined; }
  onControlChange(id, v) { if (id !== 'lit') return; if (v === BEAT_OF[this.stage]) this.tl.reset(); else if (this.tl.lit()[0] !== v) this.tl.fromControl(v); this.requestUiUpdate?.(); }
  isControlHidden(id) { return id === 'lit' && this.stage < 3; }
  _shown() { return this.tl.lit()[0] ?? BEAT_OF[this.stage] ?? null; }
  enter() { this.tl.reset(); }
  busy() { return this.age < 0.8; }

  _shelf(ctx, c, lit) {
    room(ctx, c, { ground: 402, wall: mix(c.bgSurface, c.s8, 0.12) });
    ctx.fillStyle = mix(c.s8, c.label, 0.3); rr(ctx, 56, 288, 568, 20, 6); ctx.fill();
    ACTS.forEach((a, i) => {
      const x = 92 + i * 180, w = 134, h = i === lit ? 236 : 196, y = 288 - h, col = c[a.tone], dim = i !== lit;
      ctx.save(); if (dim) ctx.globalAlpha *= 0.4;
      ctx.fillStyle = darken(col, 0.3); rr(ctx, x + 6, y + 4, w, h, 10); ctx.fill();
      ctx.fillStyle = col; rr(ctx, x, y, w, h, 10); ctx.fill();
      ctx.fillStyle = c.bgSurface; rr(ctx, x + 16, y + 26, w - 32, 96, 8); ctx.fill();
      ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = font(c, 700, 25, true); ctx.fillText('Act of', x + w / 2, y + 52);
      ctx.font = font(c, 700, 31, true); ctx.fillText(a.y, x + w / 2, y + 90);
      ctx.restore();
    });
    const tags = ACTS[lit].tags;
    tags.forEach((t, i) => tag(ctx, c, t, tags.length > 2 ? 182 + (i % 2) * 316 : 182 + i * 316, tags.length > 2 ? 346 + Math.floor(i / 2) * 52 : 372, { bg: c[ACTS[lit].tone], size: 28 }));
  }

  _gift(ctx, c) {
    room(ctx, c, { ground: 320, wall: mix(c.bgSurface, c.gold, 0.12) });
    who(ctx, this, { role: 'adult', x: 214, y: 420, height: 270, i: 2, pose: 'point', facing: 1, mood: 'smile' });
    who(ctx, this, { role: 'farmer', x: 476, y: 420, height: 262, i: 3, facing: -1 });
    ctx.fillStyle = c.bgSurface; ctx.strokeStyle = c.stroke; ctx.lineWidth = 4; rr(ctx, 306, 214, 72, 50, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(306, 214); ctx.lineTo(342, 242); ctx.lineTo(378, 214); ctx.stroke();
    ['contest', 'withdraw', 'vote', 'stay away'].forEach((t, i) => tag(ctx, c, t, 100 + i * 160, 36, { bg: c.gold, size: 28 }));
    tag(ctx, c, 'gift, offer or promise', 342, 110, { size: 28 });
  }

  _appeal(ctx, c) {
    room(ctx, c, { ground: 300, wall: mix(c.bgSurface, c.water, 0.14) });
    drawCivic(ctx, c, 'mike', 248, 404, { h: 150 });
    who(ctx, this, { role: 'adult', x: 150, y: 424, height: 276, i: 5, pose: 'point', facing: 1 });
    speech(ctx, c, 'Vote by your group', 330, 110, 214, 190, { size: 30 });
    [['religion', 410, 214], ['caste', 566, 214], ['race', 410, 274], ['community', 566, 274], ['language', 488, 334]].forEach(([t, x, y]) => tag(ctx, c, t, x, y, { bg: c.gold, size: 28 }));
  }

  _help(ctx, c) {
    room(ctx, c, { ground: 310, wall: mix(c.bgSurface, c.s3, 0.12) });
    who(ctx, this, { role: 'police', x: 142, y: 424, height: 282, i: 1, facing: 1 });
    who(ctx, this, { role: 'adult', x: 338, y: 424, height: 262, i: 4, pose: 'point', facing: -1, mood: 'smile' });
    speech(ctx, c, 'Help me in the campaign', 250, 56, 318, 140, { size: 27 });
    ['gazetted officers', 'judges, magistrates', 'armed forces', 'police', 'excise officers'].forEach((t, i) => tag(ctx, c, t, 544, 136 + i * 56, { bg: c.gold, size: 24 }));
  }

  draw(ctx, c) {
    const lit = this.tl.lit()[0], st = lit ? STEP_OF[lit] : this.stage;
    if (st < 3) this._shelf(ctx, c, st); else if (st === 3) this._gift(ctx, c); else if (st === 4) this._appeal(ctx, c); else this._help(ctx, c);
  }
}
