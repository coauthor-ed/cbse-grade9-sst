// RollRegisterScene - blk-l04-s02 setup and blk-l04-s03. One register, one empty line: the reader's own.
// Setup: the reader's three facts and the booth, no roll. b0 no name, no vote. b1 the three criteria tick in beside it.
// b2 an enumerator at the house, the line fills, a part of the roll per polling station. b3 the two
// mistakes a roll can make. Names on the roll are numbers: no person here is real.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tones, tile, say, folk, tag, pop, tick, wrap, mix, rr } from './BoothWorld.js';

const S_SETUP = 0, S_FIRST = 1, S_WHO = 2, S_HOW = 3, S_TWO = 4;
const m = (idx) => [{ idx, dwellMs: null }];
const MAP_SETUP = [m(S_SETUP)];
const MAP_S03 = [m(S_FIRST), m(S_WHO), m(S_HOW), m(S_TWO)];
const STATIONS = [{ id: '1', label: 'Station 1', first: 1 }, { id: '2', label: 'Station 2', first: 41 }, { id: '3', label: 'Station 3', first: 81 }];
const YOURS = '2';
const CRITERIA = ['Citizen of India', '18 years or above', 'Not disqualified by law'];
const R = { x: 214, y: 66, w: 450, h: 370 };   // the register page

export class RollRegisterScene extends SimScene {
  static BEAT_STEP_MAP = MAP_SETUP;
  static BEAT_MAPS = { 0: MAP_SETUP, 4: MAP_S03 };
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A young person, a citizen aged 18 who lives here, beside a polling booth, asking whether they can vote. Then an electoral roll with numbered voters and one empty line, their own. Later the line is filled after an enumerator visits a house, and the roll is split by polling station.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'st', label: 'Part of the roll', value: YOURS, options: STATIONS.map((s) => ({ value: s.id, label: s.label })) }];

  constructor(container, config) { super(container, config); this._st = YOURS; }
  enter() { this._st = YOURS; }
  busy() { return this.age < 1.6; }
  isControlHidden(id) { return id === 'st' && this.stage !== S_HOW; }
  getControlValue(id) { return id === 'st' ? this._st : undefined; }
  onControlChange(id, v) { if (id === 'st' && this._guard(id)) { this._st = v; this.requestUiUpdate?.(); } }

  // The page. rows: how many plain rows sit above the reader's line.
  _page(ctx, c, o) {
    const t = tones(c), { x, y, w, h } = o.box ?? R;
    tile(ctx, c, x, y, w, h, { fill: mix(c.bgSurface, c.gold, 0.08) });
    ctx.fillStyle = t.wood; rr(ctx, x, y, w, 46, 14); ctx.fill();
    say(ctx, c, o.title ?? 'Electoral roll', x + w / 2, y + 24, { size: 28, col: c.bgSurface });
  }

  _row(ctx, c, x, y, w, n, h = 54) {
    ctx.fillStyle = mix(c.waste, c.bgSurface, 0.78); rr(ctx, x, y, w, h - 8, 8); ctx.fill();
    say(ctx, c, String(n), x + 34, y + (h - 8) / 2 + 1, { size: 26, col: c.labelMuted, display: true });
    say(ctx, c, 'Voter ' + n, x + 66, y + (h - 8) / 2 + 1, { size: 28, display: false, align: 'left' });
  }

  _yours(ctx, c, x, y, w, filled, k = 1) {
    ctx.save();
    ctx.lineWidth = 4; ctx.strokeStyle = c.accent; ctx.fillStyle = filled ? mix(c.good, c.bgSurface, 0.72) : c.bgSurface;
    if (!filled) ctx.setLineDash([12, 9]);
    rr(ctx, x, y, w, 84, 12); ctx.fill(); ctx.stroke();
    ctx.restore();
    if (filled) { ctx.save(); ctx.globalAlpha *= Math.min(1, k); say(ctx, c, 'You, aged 18', x + w / 2, y + 42, { size: 36 }); ctx.restore(); } else say(ctx, c, 'Your line', x + w / 2, y + 42, { size: 32, col: c.labelMuted });
  }

  _you(ctx, x, h, o = {}) { folk(ctx, this, { role: 'student', x, y: 442, height: h, facing: 1, pose: o.pose ?? 'point', mood: o.mood ?? 'think', i: 4, hands: o.hands }); }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    if (s === S_SETUP) {
      // The prompt's three facts and a closed question. No roll here: the roll is the answer.
      day(ctx, c, 680, 456, { ground: 360, hills: false, sun: false });
      drawCivic(ctx, c, 'booth', 556, 372, { h: 250 });
      this._you(ctx, 104, 330);
      tile(ctx, c, 196, 26, 262, 214, { fill: c.bgSurface });
      ['Citizen', 'Aged 18', 'Lives here'].forEach((txt, i) => { tick(ctx, c, 234, 76 + i * 58, 18); say(ctx, c, txt, 266, 77 + i * 58, { size: 31, display: false, align: 'left' }); });
      tag(ctx, c, 'Can I vote?', 330, 290, { size: 32 });
    } else if (s === S_FIRST) {
      day(ctx, c, 680, 456, { ground: 360, hills: false, sun: false });
      this._you(ctx, 104, 330);
      this._page(ctx, c, {});
      [17, 18, 19].forEach((n, i) => this._row(ctx, c, R.x + 18, R.y + 62 + i * 60, R.w - 36, n));
      this._yours(ctx, c, R.x + 18, R.y + 62 + 3 * 60 + 2, R.w - 36, false);
      if (s === S_FIRST) tag(ctx, c, 'No name on the roll, no vote', 340, 28, { size: 28, bg: c.bad, scale: pop(a, 0.25) });
    } else if (s === S_WHO) {
      day(ctx, c, 680, 456, { ground: 360, hills: false, sun: false });
      this._you(ctx, 104, 330, { pose: 'stand', mood: 'smile' });
      this._page(ctx, c, { title: 'Who can be on it?' });
      CRITERIA.forEach((txt, i) => {
        const y = R.y + 58 + i * 74, k = pop(a, 0.2 + i * 0.28);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k * 1.2);
        ctx.fillStyle = mix(c.good, c.bgSurface, 0.82); rr(ctx, R.x + 18, y, R.w - 36, 66, 10); ctx.fill();
        tick(ctx, c, R.x + 56, y + 33, 21 * Math.max(0.2, k));
        say(ctx, c, txt, R.x + 90, y + 34, { size: 29, display: false, align: 'left' });
        ctx.restore();
      });
      this._yours(ctx, c, R.x + 18, R.y + 278, R.w - 36, false);
    } else if (s === S_HOW) {
      day(ctx, c, 680, 456, { ground: 330, hills: false });
      drawCivic(ctx, c, 'school', 118, 318, { w: 214 });
      folk(ctx, this, { role: 'teacher', x: 62, y: 436, height: 232, facing: 1, pose: 'stand', i: 2, mood: 'smile', hands: [{ x: 104, y: 340 }, { x: 96, y: 352 }], between: () => { ctx.fillStyle = tones(c).wood; rr(ctx, 84, 316, 44, 56, 5); ctx.fill(); ctx.fillStyle = c.bgSurface; rr(ctx, 89, 324, 34, 44, 3); ctx.fill(); } });
      this._you(ctx, 178, 214, { pose: 'stand', mood: 'smile', hands: undefined });
      const box = { x: 240, y: 12, w: 426, h: 430 };
      const st = STATIONS.find((d) => d.id === this._st);
      this._page(ctx, c, { box, title: st.label });
      const n = st.first, mine = this._st === YOURS;
      [0, 1, 2, 3, 4].slice(0, mine ? 3 : 5).forEach((i) => this._row(ctx, c, box.x + 16, box.y + 60 + i * 64, box.w - 32, n + i));
      if (mine) this._yours(ctx, c, box.x + 16, box.y + 60 + 3 * 64 + 4, box.w - 32, true, pop(a, 0.4));
      else say(ctx, c, 'Your name is not on this part', box.x + box.w / 2, box.y + 396, { size: 26, display: false, col: c.labelMuted });
      tag(ctx, c, 'Enumerator', 96, 26, { size: 28 });
    } else {
      day(ctx, c, 680, 456, { ground: 360, hills: false, sun: false });
      const cards = [{ x: 16, title: 'Left out', role: 'adult', n: '' }, { x: 348, title: 'Wrongly kept', role: 'adult', n: 'Voter 46' }];
      cards.forEach((d, i) => {
        const k = pop(a, 0.1 + i * 0.2);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, d.x, 14, 316, 428, { fill: c.bgSurface });
        say(ctx, c, d.title, d.x + 158, 54, { size: 36 });
        const y = 104;
        ctx.fillStyle = mix(c.waste, c.bgSurface, 0.78); rr(ctx, d.x + 22, y, 272, 60, 10); ctx.fill();
        if (i === 0) { ctx.save(); ctx.strokeStyle = c.bad; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); rr(ctx, d.x + 22, y, 272, 60, 10); ctx.stroke(); ctx.restore(); say(ctx, c, 'No entry', d.x + 158, y + 31, { size: 28, display: false, col: c.labelMuted }); } else { say(ctx, c, d.n, d.x + 158, y + 31, { size: 28, display: false }); ctx.strokeStyle = c.bad; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(d.x + 40, y + 31); ctx.lineTo(d.x + 276, y + 31); ctx.stroke(); }
        if (i === 0) { drawCivic(ctx, c, 'booth', d.x + 226, 352, { h: 120 }); folk(ctx, this, { role: d.role, x: d.x + 92, y: 352, height: 170, facing: 1, i: 5, mood: 'sad' }); } else { drawCivic(ctx, c, 'school', d.x + 96, 348, { w: 150 }); folk(ctx, this, { role: d.role, x: d.x + 236, y: 356, height: 170, facing: 1, pose: { name: 'walk', phase: 0.2 }, i: 7 }); }
        wrap(ctx, c, i === 0 ? 'Cannot vote' : 'Moved away, name still on', d.x + 158, 398, 286, { size: 28 });
        ctx.restore();
      });
    }
  }
}
