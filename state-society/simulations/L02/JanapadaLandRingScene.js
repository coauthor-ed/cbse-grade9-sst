// JanapadaLandRingScene - L02 s02 setup and s03. Three settlements, each with its own kin lines.
// A ring of land is added around all three while the kin lines stay. The setup shows no ring.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, alpha, pill, clamp01, chipRow } from 'simulations/base/kit/SimLook.js';
import { pal, hut, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_GUESS = 2, S_RING = 3, S_WHY = 4, S_BIG = 5;
const MAP_3 = [m(S_RING), m(S_WHY), m(S_BIG)], MAP_0 = [m(S_GUESS)];
const CAMPS = [{ x: 150, y: 262, tone: 's2', s: 1 }, { x: 372, y: 212, tone: 's1', s: 0.92 }, { x: 540, y: 300, tone: 's6', s: 1 }];

export class JanapadaLandRingScene extends SimScene {
  static BEAT_STEP_MAP = MAP_3;
  static BEAT_MAPS = { 3: MAP_3, 0: MAP_0, [Number.MAX_SAFE_INTEGER]: MAP_0 };
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'Three settlements on one stretch of ground, each with its own dotted kin line in a different colour. A ring of land is then added around all three while the kin lines stay.';

  _ground(ctx, c) {
    const p = pal(c);
    drawBackdrop(ctx, c, 'dots');
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = p.grass; ctx.fill();
    ctx.beginPath(); ctx.moveTo(6, 420); ctx.bezierCurveTo(200, 380, 420, 470, 674, 400); ctx.lineTo(674, 442); ctx.bezierCurveTo(420, 510, 200, 420, 6, 462); ctx.closePath(); ctx.fillStyle = p.water; ctx.fill();
  }

  _camp(ctx, c, C) {
    hut(ctx, c, C.x - 44 * C.s, C.y, C.s); hut(ctx, c, C.x + 44 * C.s, C.y - 6, C.s * 0.95); hut(ctx, c, C.x, C.y + 42 * C.s, C.s * 1.05);
    ctx.save(); ctx.strokeStyle = c[C.tone]; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([2, 12]);
    ctx.beginPath(); ctx.moveTo(C.x - 44 * C.s, C.y - 78 * C.s); ctx.quadraticCurveTo(C.x, C.y - 110 * C.s, C.x + 44 * C.s, C.y - 84 * C.s); ctx.stroke(); ctx.restore();
  }

  draw(ctx, c) {
    const st = this.stage;
    this._ground(ctx, c);
    if (st >= S_RING) {
      const u = st === S_RING ? clamp01(this.age / 1.1) : 1;
      ctx.save(); ctx.lineWidth = 9; ctx.strokeStyle = c.gold; ctx.setLineDash([26, 14]);
      ctx.beginPath(); ctx.ellipse(345, 255, 318, 214, -0.05, -1.5, -1.5 + u * TAU); ctx.stroke(); ctx.restore();
      const f = st === S_RING ? clamp01((this.age - 1.1) / 0.5) : 1;
      if (f > 0) { ctx.beginPath(); ctx.ellipse(345, 255, 318, 214, -0.05, 0, TAU); ctx.fillStyle = alpha(c.gold, 0.13 * f); ctx.fill(); }
    }
    CAMPS.forEach((C) => this._camp(ctx, c, C));
    if (st === S_GUESS) pill(ctx, c, 'three kin groups', 340, 56, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    if (st === S_RING && this.age > 1.1) pill(ctx, c, 'janapada: kin and land', 340, 56, { size: 28, bg: c.gold, display: true, alpha: clamp01((this.age - 1.1) / 0.3) });
    if (st === S_WHY) chipRow(ctx, c, [{ text: 'land', bg: c.s3 }, { text: 'farming', bg: c.gold }, { text: 'trade routes', bg: c.s1 }], 340, 58, { size: 28, display: true, gap: 12, align: 'center' });
    if (st === S_BIG) pill(ctx, c, 'from about 600 BCE: sixteen mah\u0101janapadas', 340, 56, { size: 28, bg: c.gold, display: true });
    drawVignette(ctx, c, 0.3);
  }
  busy() { return this.stage === S_RING && this.age < 1.7; }
}
