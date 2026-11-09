// ThreeOrgansScene - L04 s03. b0 three buildings, three jobs. b1 one law, a helmet rule, goes from
// Parliament to a police officer on the road to a court. b2 dividing lines rise between the three.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { day, tag, sheet, pop, rr, clamp01 } from './DayKit.js';
import { ORGANS, drawTriad } from './OrganTriad.js';

const m = (idx) => [{ idx, dwellMs: null }];
const G = 286;
const ease = (t) => { const u = clamp01(t); return u * u * (3 - 2 * u); };
const STOPS = [{ x: 118, y: 130, t: 'Parliament passes it', o: 'leg' }, { x: 342, y: 150, t: 'Police carry it out', o: 'exe' }, { x: 562, y: 150, t: 'A court says what it means', o: 'jud' }];

export class ThreeOrgansScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static ARIA_LABEL = 'Three buildings stand in a row: Parliament for the legislature, an office for the executive, a court for the judiciary. A sheet with a helmet law moves from one to the next. Then a dividing line rises between each pair of buildings.';

  busy() { return this.age < (this.stage === 1 ? 3.6 : this.stage === 2 ? 2.3 : 1.5); }

  draw(ctx, c) {
    const st = this.stage, a = this.age;
    day(ctx, c, { ground: G, sun: st === 0 }); 
    if (st === 0) {
      drawTriad(ctx, this, G, { age: a, jobs: true });
      tag(ctx, c, 'Three organs, three jobs', 340, 42, { k: pop(a, 1.2), bg: c.gold, size: 34 });
    }
    if (st === 1) {
      const u = a < 0.9 ? 0 : a < 1.7 ? ease((a - 0.9) / 0.8) : a < 2.7 ? 1 : a < 3.5 ? 1 + ease((a - 2.7) / 0.8) : 2;
      const now = u < 0.5 ? 0 : u < 1.5 ? 1 : 2, i0 = Math.min(1, Math.floor(u)), f = u - i0;
      drawTriad(ctx, this, G, { off: (id) => Math.min(1, Math.abs(u - STOPS.findIndex((q) => q.o === id))), lit: true, jobs: false });
      const x = STOPS[i0].x + (STOPS[i0 + 1].x - STOPS[i0].x) * f, y = 74 - Math.sin(f * Math.PI) * 20;
      sheet(ctx, c, x, y, 158, 100, { title: 'helmet law', size: 27, lines: 2 });
      tag(ctx, c, STOPS[now].t, 340, 414, { bg: c[ORGANS[now].tone], size: 32 });
    }
    if (st === 2) {
      drawTriad(ctx, this, G, { jobs: false });
      const s = ease((a - 0.5) / 1.1);
      [235, 451].forEach((x) => {                 // a dividing line rises between each pair of organs
        const h = 216 * s;
        ctx.fillStyle = c.label; rr(ctx, x - 4, G + 10 - h, 8, h, 4); ctx.fill();
      });
      tag(ctx, c, 'separation of powers', 340, 412, { k: pop(a, 1.7), bg: c.gold, size: 36 });
    }
    drawVignette(ctx, c, 0.18);
  }
}
