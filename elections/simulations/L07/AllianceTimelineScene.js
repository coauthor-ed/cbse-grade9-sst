// AllianceTimelineScene - L07 s04. A to-scale strip, 1960 to 2030, with the book's dates only, and short
// phrases from the book. Beat 3 is the book's seven-year worksheet, cells blank. Same neutral tone for
// every alliance; no result of any election.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { tones, day, folk, pop, tile, say, lines, rr, mix, hi } from '../L06/PartyWorld.js';

const STRIP = { from: 1960, to: 2030, marks: [
  { id: 'y67', at: 1967, when: '1967', label: '', tone: 1 },
  { id: 'y77', at: 1977, when: '1977', label: '', tone: 1 },
  { id: 'y98', at: 1998, when: 'late 1990s', label: '', tone: 1 },
  { id: 'y23', at: 2023, when: '2023', label: '', tone: 1 },
] };
const CARDS = [
  { lit: ['y67'], big: 'Era of alliances begins', sub: 'Single-party dominated elections end' },
  { lit: ['y77'], big: 'First coalition government', sub: 'at the national level' },
  { lit: ['y98', 'y23'], big: 'Two major alliances', sub: 'in your textbook: NDA and UPA' },
];
const YEARS = [1977, 1999, 2004, 2009, 2014, 2019, 2024];
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);

export class AllianceTimelineScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS = [];
  static ARIA_LABEL = 'A date strip from 1960 to 2030 with 1967, 1977, the late 1990s and 2023 marked, each with a short phrase. Then a blank worksheet for seven Lok Sabha elections from 1977 to 2024.';
  busy() { return this.age < 1.2; }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    if (s < 3) {
      day(ctx, c, 680, 456, { ground: 300, sun: false });
      tile(ctx, c, 14, 16, 652, 124, { fill: c.bgSurface });
      drawDateStrip(ctx, c, STRIP, { x: 44, y: 40, w: 592, size: 30, labelSize: 14, lit: CARDS[s].lit });
      const k = pop(a, 0.15), card = CARDS[s];
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      tile(ctx, c, 40, 176, 600, 164, { fill: hi(c) });
      lines(ctx, c, card.big, 340, 232, { size: 38 });
      lines(ctx, c, card.sub, 340, 290, { size: 28, display: false });
      ctx.restore();
      ['adult', 'elder', 'student', 'farmer', 'worker', 'adult', 'teacher', 'shopkeeper'].forEach((role, i) => folk(ctx, this, { role, x: 40 + i * 86, y: 450, height: 92, i: i + 1, facing: 0 }));
    } else {
      ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 456);
      tile(ctx, c, 14, 10, 652, 436, { fill: c.bgSurface });
      const cols = [40, 150, 340, 510], head = ['Year', 'Alliance won', 'National', 'State'];
      head.forEach((h, i) => say(ctx, c, h, cols[i] + 8, 40, { size: 26, align: 'left' }));
      YEARS.forEach((y, i) => {
        const yy = 62 + i * 53;
        ctx.fillStyle = mix(c.gold, c.bgSurface, 0.75); rr(ctx, 30, yy, 104, 46, 8); ctx.fill();
        say(ctx, c, String(y), 82, yy + 23, { size: 30 });
        ctx.strokeStyle = c.stroke; ctx.lineWidth = 2.5; ctx.setLineDash([7, 7]);
        [[146, 182], [336, 162], [506, 146]].forEach(([x, w]) => { rr(ctx, x, yy, w, 46, 8); ctx.stroke(); });
        ctx.setLineDash([]);
      });
    }
  }
}
