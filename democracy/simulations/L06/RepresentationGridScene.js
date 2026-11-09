// RepresentationGridScene - blk-l06-s02. Beat 0: the 543 seats of the Lok Sabha, one lit, drawn
// from the kit's own hemicycle layout; about 25 lakh people behind that seat. Beat 1: the MP in
// the middle, with the kinds of people that one seat speaks for.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { hemicycleSeats } from 'simulations/base/kit/SimPicDom.js';
import { day, tile, say, folk, tag, pop, mix, ellipse } from './CivicWorld.js';

const SEATS = hemicycleSeats(543);
const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const lit = (() => { let b = 0, d = 1e9; SEATS.seats.forEach((p, i) => { const e = Math.abs(p.a - 2.2) + Math.abs(p.row - 7) * 0.1; if (e < d) { d = e; b = i; } }); return b; })();

export class RepresentationGridScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static ARIA_LABEL = 'The half-circle of the 543 seats of the Lok Sabha with one seat lit, and a reading: one seat, about 25 lakh people. Then one Member of Parliament in the middle of farmers, shopkeepers, students and workers.';
  static CONTROLS = [];

  busy() { return this.age < 1.4; }

  draw(ctx, c) {
    const a = this.age;
    if (this.stage === 0) {
      day(ctx, c, 680, 520, { ground: 300, hills: false, sun: false });
      const s = 1.34, ox = 340 - 200 * s, oy = 8;
      const n = Math.round(543 * Math.min(1, a / 1));
      ctx.fillStyle = mix(c.bgSurface, c.gold, 0.2);
      ctx.beginPath(); ctx.arc(340, oy + 212 * s - 6, 212 * s, Math.PI, 0); ctx.fill();
      SEATS.seats.forEach((p, i) => {
        if (i > n) return;
        const on = i === lit && a > 1;
        if (on) return;                         // drawn last, over its neighbours
        ctx.fillStyle = mix(c.waste, c.bgSurface, 0.42);
        ellipse(ctx, ox + p.x * s, oy + p.y * s, SEATS.r * s, SEATS.r * s); ctx.fill();
      });
      if (a > 1) {                                // the one seat, big enough to see at 390, with a line to its tile
        const p = SEATS.seats[lit], x = ox + p.x * s, y = oy + p.y * s, q = pop(a, 1, 0.4);
        ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, 316); ctx.stroke();
        ctx.fillStyle = c.bgSurface; ellipse(ctx, x, y, 30 * q, 30 * q); ctx.fill();
        ctx.fillStyle = c.accent; ellipse(ctx, x, y, 22 * q, 22 * q); ctx.fill();
      }
      say(ctx, c, '543', 340, oy + 150 * s, { size: 62 });
      say(ctx, c, 'seats', 340, oy + 186 * s, { size: 28, display: false });
      const k = pop(a, 1.05);
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      tile(ctx, c, 36, 312, 608, 130, { fill: c.bgSurface });
      say(ctx, c, '1 seat = 1 MP', 340, 348, { size: 34 });
      say(ctx, c, 'about 25 lakh people on average', 340, 400, { size: 30, display: false });
      ctx.restore();
    } else {
      day(ctx, c, 680, 520, { ground: 290 });
      folk(ctx, this, { role: 'teacher', x: 340, y: 318, height: 216, pose: 'point', facing: 0, i: 3 });
      tag(ctx, c, 'One MP', 340, 56, { bg: c.accent });
      [['farmer', 'Farmers', 72, 2], ['shopkeeper', 'Shopkeepers', 232, 1], ['student', 'Students', 444, 5], ['worker', 'Workers', 596, 4]].forEach(([role, label, x, i], j) => {
        const k = pop(a, 0.1 + j * 0.15);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        folk(ctx, this, { role, x, y: 448, height: 170, facing: 0, i });
        ctx.restore();
        tag(ctx, c, label, x, 250, { size: 28, scale: k });
      });
    }
  }
}
