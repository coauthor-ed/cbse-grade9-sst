// EnforcementProblemScene - blk-l14-s04b, 4 beats. A canal to dig. Beat 0: neighbours meet. Beat 1: three dig and one sits.
// Beat 2: a guarded grain store. Beat 3: the store's family on a raised house, and it stays. "One explanation" stays on
// screen on every beat, because that is what this is. Canvas: people are SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, inkOn, mix, outBack, pill } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure, drawFigureRow } from 'simulations/base/kit/SimFigure.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawJar } from '../L12/ChinaDraw.js';
import { canalArt, tier } from './BronzeDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const READ = ['Neighbours could agree', 'One stays at home', 'Who guards the store?', 'Power that stays?'];

export class EnforcementProblemScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'One explanation for rulers, in four steps. Neighbours meet to share the work on a canal. One person skips the digging. Someone guards the grain store and can say who eats. The family that holds the store may keep that power.';

  busy() { return this.age < 1; }

  _dig(ctx, c, x, i, y) {
    const spec = figureFor(this, { role: 'farmer', pose: { name: 'stand', crouch: 0.3, lean: 0.25 }, x, y, height: 170, facing: 1, i, hands: [{ x: x + 62, y: y - 66 }, { x: x + 44, y: y - 88 }] });
    drawFigure(ctx, c, spec, spec.look);
    ctx.strokeStyle = c.strata3; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 36, y - 96); ctx.lineTo(x + 84, y - 16); ctx.stroke();
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, k = outBack(clamp(t / 0.4, 0, 1));
    ctx.fillStyle = mix(c.skyDay, c.bgSurface, 0.55); ctx.fillRect(0, 0, W, H);
    canalArt(ctx, c, 420, 660, 360, 110, s >= 3 ? 0.7 : 0.2);
    if (s === 0) drawFigureRow(ctx, c, { x: 60, y: 366, w: 360, height: 180, n: 4, pose: 'stand', facing: 1, overlap: 0.2, role: 'farmer' });
    if (s === 1) {
      [150, 280, 410].forEach((x, i) => this._dig(ctx, c, x, i, 366));
      const f = figureFor(this, { role: 'farmer', pose: 'sit', x: 60, y: 352, height: 170, facing: 1, i: 3, seat: { x: 60, y: 356 } });
      drawFigure(ctx, c, f, f.look);
      pill(ctx, c, 'Still gets the water', 120, 440, { size: 26, display: true, bg: c.bad, ink: inkOn(c, c.bad), scale: k });
    }
    if (s >= 2) {
      const bx = 250;
      if (s === 3) tier(ctx, bx - 150, 300, 300, 62, mix(c.strata5, c.bgSurface, 0.3), 10);
      const fy = s === 3 ? 300 : 362;
      [-110, -40, 34].forEach((d, i) => drawJar(ctx, c, bx + d + 70, fy, 130 - i * 8, c.strata3));
      const g = figureFor(this, { role: 'elder', pose: 'stand', x: bx - 110, y: fy + 2, height: 190, facing: 1 });
      drawFigure(ctx, c, g, g.look);
      if (s === 2) drawFigureRow(ctx, c, { x: 430, y: 372, w: 220, height: 130, n: 3, pose: 'stand', facing: -1, overlap: 0.2, role: 'farmer' });
      if (s === 3) drawFigureRow(ctx, c, { x: 20, y: 460, w: 640, height: 110, n: 6, pose: 'stand', facing: 0, overlap: 0.2, role: 'farmer' });
    }
    pill(ctx, c, READ[s], 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, 'One explanation', 552, 96, { size: 26, display: true, bg: c.warning });
  }
}
