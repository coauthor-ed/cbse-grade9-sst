// LegitimacyGapScene - blk-l14-s05b, 5 beats. Beat 0: grain carried up to a ruler, and the question. Beats 1 to 3: one big
// drawing per answer: the god's house, the pharaoh's stone, the king under heaven with a field as the test. Beat 4: a
// Harappan street with an empty place and a question mark: we do not know. The same farmer with a jar stands in beats 1
// to 4: the grain does not change, who receives it does. Canvas.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, mix, outBack, pill } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawJar, ground } from '../L12/ChinaDraw.js';
import { earsField } from '../L13/ChinaThings.js';
import { zigguratArt, pyramidArt, tier } from './BronzeDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const READ = ['Why give up your grain?', 'The city\'s god', 'A god on earth', 'A test for kings', 'We do not know'];
const NOTE = ['', 'The temple kept the grain', 'Duty to the order of the world', 'Are the people doing well?', 'No palace found, no script read'];

export class LegitimacyGapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'Why did people obey rulers? In Mesopotamia a ziggurat was the house of the city\'s god. In Egypt the pharaoh was treated as a god on earth. In China a king could be dismissed if the people did not prosper. For the Harappans, no palace has been found and the script is unread, so we do not know.';

  busy() { return this.age < 1; }

  _carrier(ctx, c, x) {
    const f = figureFor(this, { role: 'farmer', pose: 'carry', x, y: 460, height: 190, facing: 1, i: 0, hands: [{ x: x + 56, y: 368 }, { x: x + 50, y: 372 }] });
    drawFigure(ctx, c, f, f.look, { between: () => drawJar(ctx, c, x + 66, 400, 62) });
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, k = outBack(clamp(t / 0.42, 0, 1));
    ctx.fillStyle = s === 2 ? mix(c.gold, c.bgSurface, 0.75) : mix(c.skyDay, c.bgSurface, 0.55); ctx.fillRect(0, 0, W, H);
    ground(ctx, c, 410);
    if (s === 0) {
      tier(ctx, 400, 300, 240, 110, mix(c.strata5, c.bgSurface, 0.3), 10);
      const r = figureFor(this, { role: 'elder', pose: 'stand', x: 510, y: 302, height: 170, facing: -1 }); drawFigure(ctx, c, r, r.look);
      drawJar(ctx, c, 450, 302, 74);
      [70, 180, 290].forEach((x, i) => {
        const f = figureFor(this, { role: 'farmer', pose: 'carry', x, y: 460, height: 190, facing: 1, i, hands: [{ x: x + 56, y: 368 }, { x: x + 50, y: 372 }] });
        drawFigure(ctx, c, f, f.look, { between: () => drawJar(ctx, c, x + 66, 400, 62) });
      });
    }
    if (s === 1) { ctx.save(); ctx.translate(430, 420); ctx.scale(k, k); zigguratArt(ctx, c, 0, 0, 1.28); ctx.restore(); this._carrier(ctx, c, 76); }
    if (s === 2) {
      pyramidArt(ctx, c, 470, 420, 400 * k);
      const f = figureFor(this, { role: 'elder', pose: 'stand', x: 270, y: 452, height: 220, facing: -1 }); drawFigure(ctx, c, f, f.look);
      this._carrier(ctx, c, 76);
    }
    if (s === 3) {
      ctx.fillStyle = alpha(c.gold, 0.32); ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(340, 0); ctx.lineTo(390, 420); ctx.lineTo(190, 420); ctx.fill();
      const f = figureFor(this, { role: 'elder', pose: 'point', x: 290, y: 430, height: 250, facing: 1 }); drawFigure(ctx, c, f, f.look);
      earsField(ctx, c, 380, 300, 280, 110, k > 0.5);
      this._carrier(ctx, c, 76);
    }
    if (s === 4) {
      const col = mix(c.strata3, c.strata2, 0.4);
      tier(ctx, 40, 290, 170, 130, col, 8); tier(ctx, 470, 290, 170, 130, col, 8);
      ctx.setLineDash([12, 12]); ctx.lineWidth = 6; ctx.strokeStyle = darken(c.strata1, 0.4); ctx.strokeRect(236, 150, 208, 266); ctx.setLineDash([]);
      pill(ctx, c, '?', 340, 280, { size: 92, display: true, bg: c.warning, scale: k });
      this._carrier(ctx, c, 110);
    }
    pill(ctx, c, READ[s], 340, 44, { size: 34, display: true, bg: c.bgSurface, ink: c.label });
    if (NOTE[s]) pill(ctx, c, NOTE[s], 340, 472, { size: 27, display: true, bg: c.bgSurface, ink: c.label });
  }
}
