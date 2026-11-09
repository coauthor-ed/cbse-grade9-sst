// CandidateWallScene - L06 s02. Boards outside a polling station (name, plain mark, photo box only).
// Stages: 0 the boards alone (predict setup, thin file); 1 each board gets its party, a voter reads a
// leaflet; 2 a rally, agenda and media; 3 a student, four or five years from a first vote; 4 and 5 the
// close (thin file): what stands behind a name; the empty class line. No colour means a party.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, folk, pop, label, candidateBoard, tile, say, rr, WALL as S, hi } from './PartyWorld.js';

const BOARDS = [
  { name: 'Candidate 1', mark: 'circle', party: 'Party A' },
  { name: 'Candidate 2', mark: 'triangle', party: 'Party B' },
  { name: 'Candidate 3', mark: 'square', party: 'Independent' },
];
const G = 318;

export class CandidateWallScene extends SimScene {
  static BEAT_STEP_MAP = [S.PARTIES, S.RALLY, S.YOU].map((idx) => [{ idx, dwellMs: null }]);
  static HEIGHT = 456;
  static ARIA_LABEL = 'Three boards outside a polling station: a name, a plain mark and a photo box. Then each board gets its party and a voter reads a leaflet. Then a rally with agenda and media. Then a student who will vote in four or five years.';
  static CONTROLS = [];
  busy() { return this.age < 1.2; }

  _boards(ctx, c, o = {}) {
    const a = this.age;
    BOARDS.forEach((b, i) => {
      const w = 206, x = 18 + i * 218, y = o.y ?? 96, h = o.h ?? 176;
      candidateBoard(ctx, c, x, y, w, h, { ...b, size: 30, post: G + 24 - y - h, lit: o.lit === i });
      if (o.parties) label(ctx, c, b.party, x + w / 2, y + h + 26, { scale: pop(a, 0.1 + i * 0.14) });
      if (o.klass) label(ctx, c, b.party === 'Independent' ? b.party : 'Class: ?', x + w / 2, y + h + 26, { scale: pop(a, 0.1 + i * 0.14), ...(b.party === 'Independent' ? {} : { bg: hi(c), ink: c.label }) });
    });
  }

  _ground(ctx, c) { day(ctx, c, 680, 456, { ground: G, sun: false }); }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    if (s === S.BOARDS) {
      this._ground(ctx, c); this._boards(ctx, c);
      label(ctx, c, 'Dozens of candidates, one seat', 340, 40, { size: 30 });
      folk(ctx, this, { role: 'voter', x: 340, y: 448, height: 124, pose: 'stand', facing: 0, i: 2, mood: 'think' });
    } else if (s === S.PARTIES) {
      this._ground(ctx, c); this._boards(ctx, c, { parties: true, y: 22, h: 150 });
      folk(ctx, this, { role: 'voter', x: 84, y: 444, height: 190, pose: 'stand', facing: 1, i: 2 });
      drawCivic(ctx, c, 'newspaper', 174, 438, { h: 104 });
      ['Policies', 'Vision', 'Positions on issues'].forEach((text, i) => label(ctx, c, text, 440, 300 + i * 50, { size: 28, scale: pop(a, 0.5 + i * 0.12) }));
    } else if (s === S.RALLY) {
      day(ctx, c, 680, 456, { ground: 250 });
      ctx.fillStyle = t.wood; rr(ctx, 220, 214, 240, 44, 8); ctx.fill();
      tile(ctx, c, 196, 12, 288, 92, { fill: c.bgSurface });
      say(ctx, c, 'Agenda', 340, 40, { size: 30 });
      ctx.fillStyle = t.grey; rr(ctx, 236, 66, 208, 9, 4); ctx.fill(); rr(ctx, 236, 84, 150, 9, 4); ctx.fill();
      folk(ctx, this, { role: 'adult', x: 340, y: 222, height: 96, pose: 'point', facing: 1, i: 5 });
      drawCivic(ctx, c, 'mike', 384, 222, { h: 74 });
      ['adult', 'elder', 'farmer', 'student', 'worker', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: 96 + i * 98, y: 398 + (i % 2) * 14, height: 124, pose: i % 2 ? 'stand' : 'relax', facing: 0, i: i + 1 }));
      drawCivic(ctx, c, 'newspaper', 94, 216, { h: 106 }); drawCivic(ctx, c, 'phone', 586, 216, { h: 106 });
      label(ctx, c, 'Media', 94, 92, { scale: pop(a, 0.5), bg: hi(c), ink: c.label });
      label(ctx, c, 'Media', 586, 92, { scale: pop(a, 0.5), bg: hi(c), ink: c.label });
      label(ctx, c, 'Election rally', 340, 432, { scale: pop(a, 0.3), bg: hi(c), ink: c.label });
    } else if (s === S.YOU) {
      day(ctx, c, 680, 456, { ground: 300 });
      drawCivic(ctx, c, 'booth', 548, 306, { h: 196 });
      folk(ctx, this, { role: 'student', x: 150, y: 420, height: 250, pose: 'stand', facing: 1, i: 3, mood: 'think' });
      drawCivic(ctx, c, 'newspaper', 252, 420, { h: 120 });
      tile(ctx, c, 300, 318, 356, 112, { fill: c.bgSurface });
      say(ctx, c, '4 or 5 years', 478, 356, { size: 44 });
      say(ctx, c, 'until you can vote', 478, 402, { size: 26, display: false });
    } else {
      this._ground(ctx, c);
      if (s === S.BEHIND) {
        this._boards(ctx, c, { parties: true, y: 66, h: 150 });
        [['Organise', 100], ['Campaign', 268], ['Offer choices', 446], ['Inform', 604]].forEach(([x, xx], i) => label(ctx, c, x, xx, 404, { scale: pop(a, 0.3 + i * 0.1), bg: hi(c), ink: c.label }));
      } else {
        this._boards(ctx, c, { klass: true, y: 66, h: 160 });
        label(ctx, c, 'What decides the class?', 340, 400, { size: 28, scale: pop(a, 0.6) });
      }
    }
  }
}
