// HaftedPointScene - L03 s06. A point tied to a shaft, big. A thrown spear and the distance it buys. Then tools to true scale.
// Scene mounts at the haft beat. Earlier beats draw the haft too, for a deep link.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { alpha, mix, darken, lighten, pill, font, rr, clamp01, outBack, inOutSine, drawBackdrop, drawCard } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { drawAnimal } from 'simulations/base/kit/SimAnimal.js';
import { drawTool, drawBand } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_FAR = 4, S_SMALL = 5;
const FY = 410;

export class HaftedPointScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4), m(5)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'A small stone point tied to a long wooden shaft to make a spear. A hunter throws it at a deer while standing far back. Last, a handaxe, a point and a tiny blade stand to true scale on one centimetre scale.';

  busy() { return this.age < 2.2; }

  _spear(ctx, c, x, y, len, rot, k = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const wood = mix(c.strata3, c.strata1, 0.25), s = len / 8;
    rr(ctx, -len, -s * 0.2, len, s * 0.4, s * 0.16); ctx.fillStyle = wood; ctx.fill(); ctx.strokeStyle = darken(wood, 0.45); ctx.lineWidth = Math.max(2, s * 0.06); ctx.stroke();
    ctx.fillStyle = alpha(lighten(wood, 0.5), 0.5); ctx.fillRect(-len + s * 0.3, -s * 0.12, len - s * 0.6, s * 0.08);
    drawTool(ctx, c, 'point', s * 0.82 - (1 - k) * -s * 2, 0, s * 1.2, { rot: Math.PI / 2 });
    if (k > 0.9) {         // the cord that ties it
      const cord = mix(c.strata1, c.bgSurface, 0.2);
      ctx.strokeStyle = darken(cord, 0.35); ctx.lineWidth = Math.max(3, s * 0.1);
      for (let i = 0; i < 5; i++) { const cx = -s * 0.02 - i * s * 0.14; ctx.beginPath(); ctx.moveTo(cx, -s * 0.3); ctx.lineTo(cx - s * 0.06, s * 0.3); ctx.stroke(); }
    }
    ctx.restore();
  }

  draw(ctx, c) {
    const st = this.stage;
    if (st < S_FAR) {
      drawBackdrop(ctx, c, 'dots');
      drawCard(ctx, c, 12, 90, 656, 300);
      const k = outBack(clamp01(this.age / 0.7));
      this._spear(ctx, c, 500, 240, 460, 0, k);
      pill(ctx, c, 'stone point', 580, 136, { size: 28, bg: c.gold, display: true });
      pill(ctx, c, 'wooden shaft', 190, 330, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'tied on', 458, 340, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'a small stone, a long weapon', 340, 450, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
      return;
    }
    if (st === S_FAR) {
      ctx.fillStyle = mix(c.skyDay ?? c.bgSurface, c.bgSurface, 0.4); ctx.fillRect(0, 0, 680, 520);
      drawBand(ctx, c, 'dust', 0, FY, 680, 110, { seed: 4 });
      const t = clamp01(this.age / 1.2), u = inOutSine(t);
      const fig = figureFor(this, { role: 'adult', pose: { name: 'throw', u: Math.min(1, this.age / 0.5) }, x: 110, y: FY, height: 210, facing: 1, i: 3, look: { outfit: 'drape', top: c.strata3, bottom: c.strata2, shoeStyle: 'none' } });
      drawFigure(ctx, c, fig, fig.look);
      drawAnimal(ctx, c, { x: 568, y: FY + 8, length: 170, facing: -1, kind: 'deer', pose: 'stand' }, { t: 0 });
      const x = 160 + u * 280, y = 226 - Math.sin(u * Math.PI) * 60 + u * 170;
      this._spear(ctx, c, x, y, 150, -0.1 + u * 0.75, 1);
      // Reach: how far the hunter stays back, and how near a hand tool needs to be.
      const by = FY + 62;
      ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(116, by); ctx.lineTo(488, by); ctx.moveTo(116, by - 12); ctx.lineTo(116, by + 12); ctx.moveTo(488, by - 12); ctx.lineTo(488, by + 12); ctx.stroke();
      pill(ctx, c, 'the hunter stays well back', 300, by + 2, { size: 26, bg: c.gold, display: true });
      return;
    }
    // True scale: one length of the page for all three. 15 cm, a point, 2 cm.
    drawBackdrop(ctx, c, 'dots');
    drawCard(ctx, c, 12, 12, 656, 496);
    const CM = 27.5, base = 470;
    ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(84, base); ctx.lineTo(84, base - 15 * CM); ctx.stroke();
    ctx.font = font(c, 700, 25, true); ctx.fillStyle = c.label; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 15; i++) {
      const y = base - i * CM, big = i % 5 === 0;
      ctx.lineWidth = big ? 4 : 2; ctx.beginPath(); ctx.moveTo(84, y); ctx.lineTo(big ? 104 : 96, y); ctx.stroke();
      if (big) ctx.fillText(String(i), 70, y);
    }
    ctx.textAlign = 'right'; ctx.fillText('cm', 70, 30);
    const k = outBack(clamp01(this.age / 0.5));
    drawTool(ctx, c, 'handaxe', 226, base - 7.5 * CM, 7.5 * CM * k);
    drawTool(ctx, c, 'point', 400, base - 2.7 * CM, 2.7 * CM * k);
    drawTool(ctx, c, 'blade', 548, base - 1.05 * CM, 1.05 * CM * k);
    pill(ctx, c, 'handaxe', 372, 110, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'point', 400, base - 5.4 * CM - 34, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'next: tiny blades', 548, base - 2.1 * CM - 34, { size: 25, bg: c.gold, display: true });
  }
}
