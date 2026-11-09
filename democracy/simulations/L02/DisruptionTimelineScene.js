// DisruptionTimelineScene - L02 s07. A to-scale date strip stays at the foot; the picture above changes.
// b0 a woven cloth on a rod, torn in part: the book's "political and social fabric". b1 a colonial office and
// people kept outside. b2 people on the march. No invader is named, drawn or dressed.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, rr, clamp01, drawBackdrop, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawCivic, dayStage } from '../shared/CivicArt.js';
import { drawDateStrip } from '../shared/DateStrip.js';

const m = (idx) => [{ idx, dwellMs: null }];
const marks = (lit) => ({
  from: 1800, to: 1960,
  marks: [
    { id: 'c19', at: 1850, when: '19th century', label: 'colonised', tone: 8 },
    { id: 'y46', at: 1946.5, when: '1946 and 1947', label: 'Assembly, independence', tone: 3, ghost: lit < 2 },
  ],
});

export class DisruptionTimelineScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A date strip runs along the foot. First a woven cloth frays at one edge: the political and social fabric was disrupted in some parts. Then, in the nineteenth century, people stand outside a colonial office. Then people march together towards 1946 and 1947.';

  busy() { return this.age < 1.1; }

  // A real length of woven cloth hanging from a rod: over-and-under threads in bands, one torn hole
  // and a frayed corner, so it reads as damage in some parts, and most of the cloth still whole.
  _cloth(ctx, c) {
    const X0 = 84, Y0 = 44, W = 512, H = 300, S = 20, r = mulberry32(11);
    const bands = [c.s8, c.s8, c.s2, c.s1, c.s1, c.s3, c.s5, c.s5, c.s3, c.s1, c.s1, c.s2, c.s8, c.s8, c.s8];
    const noise = Array.from({ length: 32 }, () => r());
    const gone = (x, y) => {                       // a ragged hole right of centre, a bite from the lower left
      const dx = x - 438, dy = (y - 158) * 1.15, an = Math.atan2(dy, dx), R = 74 + noise[Math.floor(((an + Math.PI) / (Math.PI * 2)) * 31.99)] * 40;
      return Math.hypot(dx, dy) < R || (x < X0 + 78 + noise[Math.floor((y - Y0) / 20) % 32] * 40 && y > Y0 + 214 - noise[Math.floor((x - X0) / 20) % 32] * 26);
    };
    ctx.fillStyle = c.label; ctx.fillRect(56, 24, 568, 12); ctx.fillStyle = mix(c.gold, c.label, 0.3);
    [64, 616].forEach((x) => { ctx.beginPath(); ctx.arc(x, 30, 12, 0, Math.PI * 2); ctx.fill(); });
    ctx.save(); ctx.lineCap = 'butt';
    for (let j = 0; j * S < H; j++) {
      const col = mix(bands[j % bands.length], c.bgSurface, 0.12), dark = mix(col, c.label, 0.22);
      for (let i = 0; i * S < W; i++) {
        const x = X0 + i * S, y = Y0 + j * S;
        if (gone(x + S / 2, y + S / 2)) continue;
        ctx.fillStyle = (i + j) % 2 ? col : dark;
        rr(ctx, x + 1, y + 1, S - 2, S - 2, 5); ctx.fill();
      }
    }
    // loose threads round the hole and the bite
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 11; i++) {                // threads hang down from the top edge of the hole
      const u = (i + 0.5) / 11, an = Math.PI * (1 + u), x = 438 + Math.cos(an) * 96, y = 158 + Math.sin(an) * 72;
      ctx.strokeStyle = mix(bands[(i * 3) % bands.length], c.bgSurface, 0.12);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (i % 2 ? 10 : -10), y + 40, x + (i % 2 ? -4 : 6), y + 66 + (i % 3) * 16); ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const x = X0 + 16 + i * 18;
      ctx.strokeStyle = mix(bands[(i + 8) % bands.length], c.bgSurface, 0.12);
      ctx.beginPath(); ctx.moveTo(x, Y0 + 218); ctx.quadraticCurveTo(x + 8, Y0 + 250, x - 4, Y0 + 268 + (i % 3) * 8); ctx.stroke();
    }
    ctx.restore();
    pill(ctx, c, 'fabric disrupted in some parts', 340, 376, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
  }

  _office(ctx, c) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 680, 322); ctx.clip();
    dayStage(ctx, c, { horizon: 250, ground: 'stone' });
    drawCivic(ctx, c, 'office', 200, 290, { h: 256 });
    ['farmer', 'elder', 'adult', 'worker'].forEach((role, i) => { const s = figureFor(this, { role, x: 420 + i * 72, y: 312, height: 164, i: i + 1, facing: -1, mood: 'think' }); drawFigure(ctx, c, s, s.look); });
    ctx.restore();
    pill(ctx, c, 'participation limited', 500, 36, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
  }

  _march(ctx, c) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 680, 322); ctx.clip();
    dayStage(ctx, c, { horizon: 250, ground: 'earth' });
    const k = 1 - (1 - clamp01(this.age / 1)) ** 2;
    ['student', 'farmer', 'adult', 'elder', 'worker', 'student', 'adult', 'teacher'].forEach((role, i) => {
      const x = 40 + i * 86 + k * 20, far = i % 2;
      const s = figureFor(this, { role, x, y: far ? 276 : 314, height: far ? 148 : 176, i: i + 2, facing: 1, pose: { name: 'walk', phase: 0.25 + i * 0.17 }, mood: 'smile' });
      drawFigure(ctx, c, s, s.look);
    });
    ctx.restore();
    pill(ctx, c, 'long struggle for independence', 340, 36, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === 0) this._cloth(ctx, c); else if (this.stage === 1) this._office(ctx, c); else this._march(ctx, c);
    if (this.stage > 0) drawDateStrip(ctx, c, marks(this.stage), { x: 24, y: 338, w: 632, size: 28, labelSize: 28, lit: this.stage === 1 ? ['c19'] : ['y46'] });
    else pill(ctx, c, 'over a long passage of time', 340, 424, { size: 28, bg: mix(c.gold, c.bgSurface, 0.45), ink: c.label, display: true });
  }
}
