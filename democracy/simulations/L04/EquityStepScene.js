// EquityStepScene - L04 s08. Two runners on one track. b0 same speed, one far behind: the gap stays.
// b1 help moves the back runner up to a fair start, and the card holds Article 46 word for word.
// b2 the law stays equal for all; equity is about sharing resources.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { day, who, tag, card, pop, rr, mix, clamp01 } from './DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const L1 = 226, L2 = 330;   // the feet in the two lanes
const A46 = '\u201Cthe State shall promote with special care the educational and economic interests of the weaker sections of the people, and, in particular, of the Scheduled Castes and the Scheduled Tribes, and shall protect them from social injustice and all forms of exploitation.\u201D';

export class EquityStepScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static ARIA_LABEL = 'Two runners on one track. One starts far behind. They run at the same speed and the gap between them stays the same. On the second beat the runner behind is helped to a fair start, and a card shows the words of Article 46. On the third, a card sets equal before the law beside equity.';

  busy() { return this.age < 3; }

  // a track with two lanes between y0 and y1
  _track(ctx, c, y0, y1) {
    day(ctx, c, { ground: y0, floor: mix(c.bgSurface, c.s3, 0.34), sun: false });
    rr(ctx, 0, y0, 680, y1 - y0, 0); ctx.fillStyle = mix(c.s2, c.bgSurface, 0.56); ctx.fill();
    ctx.fillStyle = c.bgSurface;
    ctx.fillRect(0, y0, 680, 5); ctx.fillRect(0, (y0 + y1) / 2 - 2, 680, 5); ctx.fillRect(0, y1 - 5, 680, 5);
    const n = 8, h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? c.bgSurface : c.label; ctx.fillRect(630, y0 + i * h, 16, h); }
  }

  draw(ctx, c) {
    const st = this.stage, a = this.age;
    if (st === 0) {
      this._track(ctx, c, 120, 346);
      const u = clamp01(a / 2.4), run = a < 2.4 ? 'run' : 'stand', ph = a * 2.2;
      const x1 = 280 + u * 310, x2 = 60 + u * 310;
      who(ctx, this, { role: 'student', x: x1, y: L1, height: 168, i: 1, pose: run, phase: ph, facing: 1 });
      who(ctx, this, { role: 'student', x: x2, y: L2, height: 180, i: 2, pose: run, phase: ph + 0.4, facing: 1 });
      const yy = 394;
      ctx.strokeStyle = c.label; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x2, yy); ctx.lineTo(x1, yy); ctx.moveTo(x2, yy - 14); ctx.lineTo(x2, yy + 14); ctx.moveTo(x1, yy - 14); ctx.lineTo(x1, yy + 14); ctx.stroke();
      tag(ctx, c, 'same rule, same gap', 340, 40, { bg: c.gold, size: 34, k: pop(a, 1.2) });
      tag(ctx, c, 'gap', (x1 + x2) / 2, yy, { size: 28 });
    } else {
      this._track(ctx, c, 34, 130);
      const u = st === 2 ? 1 : clamp01(a / 1.1);
      who(ctx, this, { role: 'student', x: 250, y: 84, height: 74, i: 1, pose: 'stand', facing: 1 });
      who(ctx, this, { role: 'student', x: 50 + u * 200, y: 126, height: 80, i: 2, pose: u < 1 ? 'run' : 'stand', phase: a * 2, facing: 1 });
      tag(ctx, c, 'a fair start', 470, 82, { bg: c.gold, size: 30, k: pop(a, 1) });
      if (st === 1) card(ctx, c, 14, 138, 652, 306, { title: 'Article 46', text: A46, size: 27, titleSize: 30, rim: c.gold });
      else {
        card(ctx, c, 14, 146, 652, 138, { title: 'Equal before the law', text: 'The same law for everyone.', size: 30, titleSize: 34, rim: c.s1 });
        card(ctx, c, 14, 298, 652, 138, { title: 'Equitable', text: 'Resources shared so that each person gets a fair chance.', size: 30, titleSize: 34, rim: c.gold });
      }
    }
    drawVignette(ctx, c, 0.14);
  }
}
