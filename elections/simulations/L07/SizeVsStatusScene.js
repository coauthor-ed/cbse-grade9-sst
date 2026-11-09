// SizeVsStatusScene - L07 s01. Two made-up party records side by side on a table, an officer between
// them. Stages: 0 the records (predict setup, thin file); 1 votes drawn to scale; 2 the empty class line
// and blank symbol box; 3, 4 the close (thin file): records with a class; what a class cannot show.
// No colour for a party. Numbers are made up and the scene says so.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, folk, pop, label, tile, say, rr, mix, hi, FILES as S } from '../L06/PartyWorld.js';

const RECS = [
  { name: 'Party P', votes: 5.8, seats: 3, states: 1, klass: 'State party', via: '8% route', x: 16 },
  { name: 'Party Q', votes: 2, seats: 12, states: 4, klass: 'National party', via: 'Route 2', x: 350 },
];

export class SizeVsStatusScene extends SimScene {
  static BEAT_STEP_MAP = [S.BOTH, S.BARS, S.EMPTY].map((idx) => [{ idx, dwellMs: null }]);
  static HEIGHT = 456;
  static CONTROLS = [];
  static ARIA_LABEL = 'Two made-up party records. Party P has 5.8 per cent of the votes, 3 seats and 1 State. Party Q has 2 per cent, 12 seats and 4 States. Then the votes as bars. Then an empty class line on each.';
  busy() { return this.age < 1.2; }

  _rec(ctx, c, r, i) {
    const s = this.stage, a = this.age, y = 62, w = 314, h = 340, x = r.x;
    tile(ctx, c, x, y, w, h, { fill: c.bgSurface });
    ctx.fillStyle = hi(c); rr(ctx, x + 12, y - 30, 150, 44, 10); ctx.fill();
    say(ctx, c, r.name, x + 87, y - 8, { size: 30 });
    const rows = [['Votes', r.votes + '%'], ['Seats', String(r.seats)], ['States', String(r.states)]];
    rows.forEach(([k, v], j) => {
      const yy = y + 50 + j * 62;
      say(ctx, c, k, x + 26, yy, { size: 30, align: 'left', display: false });
      say(ctx, c, v, x + w - 24, yy, { size: 40, align: 'right' });
      if (s === S.BARS && j === 0) {
        const k2 = Math.min(1, a / 0.7);
        ctx.fillStyle = mix(c.water, c.bgSurface, 0.2); rr(ctx, x + 26, yy + 24, Math.max(10, (r.votes / 5.8) * (w - 52) * k2), 16, 8); ctx.fill();
      }
    });
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.75); rr(ctx, x + 14, y + h - 104, w - 28, 88, 10); ctx.fill();
    say(ctx, c, 'Class', x + 30, y + h - 76, { size: 30, align: 'left', display: false });
    if (s >= S.STAMPED) {
      say(ctx, c, r.via, x + w - 30, y + h - 76, { size: 30, align: 'right', display: false });
      say(ctx, c, r.klass, x + w / 2, y + h - 40, { size: 32 });
    } else {
      ctx.strokeStyle = s === S.EMPTY ? c.accent : c.stroke; ctx.lineWidth = s === S.EMPTY ? 5 : 3; ctx.setLineDash([10, 9]);
      ctx.beginPath(); ctx.moveTo(x + 30, y + h - 32); ctx.lineTo(x + w - 30, y + h - 32); ctx.stroke(); ctx.setLineDash([]);
    }
    void i;
  }

  draw(ctx, c) {
    const t = tones(c), s = this.stage, a = this.age;
    ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 456);
    ctx.fillStyle = t.wood; ctx.fillRect(0, 380, 680, 76);
    if (s === S.HOW) {
      RECS.forEach((r, i) => {
        tile(ctx, c, r.x, 26, 314, 126, { fill: c.bgSurface });
        say(ctx, c, r.name, r.x + 157, 60, { size: 30 });
        say(ctx, c, r.klass, r.x + 157, 110, { size: 32 });
        void i;
      });
      drawCivic(ctx, c, 'booth', 200, 396, { h: 200 });
      folk(ctx, this, { role: 'voter', x: 390, y: 420, height: 230, facing: -1, i: 3, mood: 'think' });
      tile(ctx, c, 452, 214, 216, 130, { fill: c.bgSurface });
      say(ctx, c, 'How were', 560, 256, { size: 30 }); say(ctx, c, 'the votes cast?', 560, 300, { size: 28 });
    } else {
      RECS.forEach((r, i) => this._rec(ctx, c, r, i));
      label(ctx, c, 'Made-up records', 340, 430, { size: 30, scale: pop(a, 0.1) });
    }
  }
}
