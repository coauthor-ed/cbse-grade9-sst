// LogographScene - blk-l12-s06, shows from beat 3 of 5 (earlier beats are drawings). One big tile. The sign starts as the
// old cut form on bone, then changes shape and thickens into the brush form on paper. The rail under it names the two
// ends. Person on beat 3, tree on beat 4. Signs are strokes, so no Chinese font is needed. Canvas.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, inOutSine, mix, pill, rr } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { boneCol, PAPER, drawSign } from './ChinaDraw.js';

const W = 680, H = 520;
const MAP = [0, 0, 0, 0, 1].map((idx) => [{ idx, dwellMs: null }]);
const CASES = [{ sign: 'person', name: 'Person' }, { sign: 'tree', name: 'Tree' }];

export class LogographScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A large tile. The old sign for person, a side view of a standing figure, changes into the modern two-stroke character. Then the old sign for tree, with branches and roots, changes into the modern character.';

  busy() { return this.age < 2; }

  draw(ctx, c) {
    const s = this.stage ?? 0, k = inOutSine(clamp((this.age - 0.1) / 1.5, 0, 1));
    const g = CASES[s];
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    const size = 340, x = (W - size) / 2, y = 66;
    const col = mix(boneCol(c), PAPER(c), k);
    rr(ctx, x, y + 8, size, size, 24); ctx.fillStyle = darken(col, 0.4); ctx.fill();
    rr(ctx, x, y, size, size, 24); ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = darken(col, 0.42); ctx.stroke();
    const ink = mix(darken(c.strata3, 0.5), c.strata6, k), pad = 44, lw = 9 + k * 15;
    drawSign(ctx, g.sign, x + pad, y + pad, size - pad * 2, ink, lw, k);
    pill(ctx, c, g.name, W / 2, 34, { size: 36, display: true, bg: c.bgSurface, ink: c.label });
    // The two ends of the change, read at a glance.
    const ry = 456, lx = 130, rx = 550;
    ctx.fillStyle = c.track; rr(ctx, lx, ry - 6, rx - lx, 12, 6); ctx.fill();
    ctx.fillStyle = c.accent; rr(ctx, lx, ry - 6, Math.max(12, (rx - lx) * k), 12, 6); ctx.fill();
    pill(ctx, c, 'Knife on bone', 130, 490, { size: 26, display: true, bg: mix(c.s2, c.bgSurface, k), ink: c.label });
    pill(ctx, c, 'Brush and ink', 550, 490, { size: 26, display: true, bg: mix(c.bgSurface, c.s2, k), ink: c.label });
  }
}
