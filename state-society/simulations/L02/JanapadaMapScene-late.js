// JanapadaMapSceneLate - L02 s10. One map, Magadha's reach. b0 reach drawn. b1 a single ruler in
// a large land: a small figure at the centre and the question of what he is for.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, alpha } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadSstMap, sstFullView, drawSstFull, sstBadge } from './SstMapBase.js';
import { person, crown } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[68, 15], [93, 35]];
const MAG = [85.4, 24.9];

export class JanapadaMapSceneLate extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A map of the subcontinent with Magadha lit and a wide soft area of its control spreading over the Ganga plain. One small crowned figure stands at the centre of a large land.';
  async setup() { this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT); this.animateFor?.(400); }

  draw(ctx, c) {
    if (!drawSstFull(ctx, c, this)) return;
    const v = this.view, q = v.at(MAG);
    ctx.save(); ctx.beginPath(); v.path.context(ctx)(this.map.land); ctx.clip();
    ctx.beginPath(); ctx.ellipse(q[0] - 70, q[1] + 6, 250, 120, -0.1, 0, 7); ctx.fillStyle = alpha(c.gold, 0.42); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = c.gold; ctx.stroke(); ctx.restore();
    sstBadge(ctx, c, q[0], q[1], 12, { r: 22, lit: true });
    pill(ctx, c, "Magadha's reach", q[0] - 150, q[1] - 110, { size: 28, bg: c.gold, display: true });
    if (this.stage === 1) {
      person(ctx, this, { role: 'adult', x: 150, y: 490, height: 210, pose: 'point', facing: 1, i: 3 });
      crown(ctx, c, 150, 268, 1);
      pill(ctx, c, 'What is he for?', 340, 470, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    }
  }
}
