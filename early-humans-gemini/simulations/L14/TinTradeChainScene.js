// TinTradeChainScene - blk-l14-s04c, 4 beats. Beat 0: Mehrgarh, stored food and copper, a village. Beat 1: copper near, tin
// far, mixed into bronze. Beat 2: someone counts the trade. Beat 3: the idea, stamped as an idea. Canvas.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, inkOn, mix, outBack, pill, rr } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawJar, ground } from '../L12/ChinaDraw.js';
import { hutArt, lumpArt, bronzeAxe } from './BronzeDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);

export class TinTradeChainScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A village with stored food and copper stays a village. Bronze is copper mixed with a little tin, and tin comes from far away. Someone has to count what comes in. Historians suggest that this trade may have added to the power of those who ran it, but it is not proven.';

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, k = outBack(clamp(t / 0.4, 0, 1));
    ctx.fillStyle = mix(c.skyDay, c.bgSurface, 0.55); ctx.fillRect(0, 0, W, H);
    ground(ctx, c, 400);
    const copper = mix(c.s8, c.strata3, 0.4), tin = mix(c.strata5, c.bgSurface, 0.35);
    if (s === 0) {
      hutArt(ctx, c, 130, 410, 1.5); hutArt(ctx, c, 300, 410, 1.2);
      drawJar(ctx, c, 440, 412, 130); drawJar(ctx, c, 530, 412, 104);
      lumpArt(ctx, 610, 384, 34, copper);
      pill(ctx, c, 'Mehrgarh: still a village', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Stored food', 452, 452, { size: 26, display: true, bg: c.gold });
      pill(ctx, c, 'Copper', 600, 452, { size: 26, display: true, bg: copper, ink: inkOn(c, copper) });
    }
    if (s === 1) {
      lumpArt(ctx, 120, 300, 84, copper);
      ctx.fillStyle = alpha(c.strata5, 0.5); ctx.beginPath(); ctx.moveTo(460, 400); ctx.lineTo(560, 170); ctx.lineTo(680, 400); ctx.fill();
      lumpArt(ctx, 590, 340, 30 * k, tin);
      const k2 = clamp((t - 0.2) / 0.6, 0, 1);
      ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.setLineDash([3, 13]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(560, 340); ctx.quadraticCurveTo(440, 240, 460 - 120 * k2, 300); ctx.stroke(); ctx.setLineDash([]);
      bronzeAxe(ctx, c, 330, 290, 1.1 * clamp(k2 * 1.3, 0, 1));
      pill(ctx, c, 'Bronze: copper and a little tin', 340, 44, { size: 30, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Copper', 120, 452, { size: 28, display: true, bg: copper, ink: inkOn(c, copper) });
      pill(ctx, c, 'Tin: rare, far away', 530, 452, { size: 28, display: true, bg: tin, ink: inkOn(c, tin) });
    }
    if (s === 2) {
      [190, 280, 370].forEach((x, i) => { rr(ctx, x - 36, 340 - i * 0 + 6, 72, 60, 6); ctx.fillStyle = darken(c.strata2, 0.2); ctx.fill(); rr(ctx, x - 36, 340, 72, 60, 6); ctx.fillStyle = c.strata2; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(c.strata2, 0.45); ctx.stroke(); });
      const f = figureFor(this, { role: 'elder', pose: 'point', x: 520, y: 452, height: 270, facing: -1 });
      drawFigure(ctx, c, f, f.look);
      drawIcon(ctx, c, 'tablet', 280, 200, 78 * k, { tone: c.strata2 });
      pill(ctx, c, 'Someone must count it', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Send, store, record', 200, 452, { size: 28, display: true, bg: c.s2 });
    }
    if (s === 3) {
      bronzeAxe(ctx, c, 150, 262, 0.9); drawIcon(ctx, c, 'tablet', 340, 250, 70, { tone: c.strata2 }); drawIcon(ctx, c, 'crown', 530, 250, 70, { tone: c.s5 });
      ctx.strokeStyle = c.label; ctx.lineWidth = 7; ctx.lineCap = 'round';
      for (const x of [226, 432]) { ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x + 26, 250); ctx.moveTo(x + 14, 238); ctx.lineTo(x + 26, 250); ctx.lineTo(x + 14, 262); ctx.stroke(); }
      pill(ctx, c, 'Trade may add to power', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'An idea, not a proof', 340, 452, { size: 30, display: true, bg: c.warning, scale: k });
    }
  }
}
