// RiverReversalScene - blk-l14-s06c, 4 beats. Beat 0: a tower of water, harvest, city, rulers, marked as what researchers
// argue. Beat 1: a true-scale rail, 2400 to 1800 BCE, with the dry time and two endings. Beat 2: the river shrinks and the
// settlements get smaller. Beat 3: the tower again, harvest at the foot. Canvas.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, inkOn, inOutSine, mix, pill, rr } from 'simulations/base/kit/SimLook.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { tier, hutArt } from './BronzeDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const FROM = -2400, TO = -1800, RX = 50, RW = 580;
const yr = (y) => RX + (y - FROM) / (TO - FROM) * RW;

export class RiverReversalScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A stack of water, harvest, city and rulers. A time rail from 2400 to 1800 BCE shows a dry time around 2200 BCE, the end of Egypt\'s Old Kingdom in 2181 BCE and Akkad in 2154 BCE, and the end of the Mature Harappan stage in 1900 BCE. Many researchers link these with less water.';

  busy() { return this.age < 1.4; }

  _tower(ctx, c, s) {
    const rows = [['Rulers', 'crown', c.s5, 230], ['City', 'building', c.s1, 330], ['Harvest', 'grain', c.gold, 430], ['Water', 'river', c.seaShallow, 530]];
    rows.forEach(([name, ic, col, w], i) => {
      const y = 92 + i * 92, x = 340 - w / 2;
      tier(ctx, x, y, w, 80, col, 12);
      drawIcon(ctx, c, ic, x + 50, y + 40, 28, { tone: mix(col, c.bgSurface, 0.6) });
      ctx.save(); ctx.font = `700 34px ${c.fontDisplay}`; ctx.fillStyle = inkOn(c, col); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, 340 + 16, y + 42); ctx.restore();
      if (s === 3 && i >= 2) { rr(ctx, x - 5, y - 5, w + 10, 90, 15); ctx.lineWidth = 6; ctx.strokeStyle = c.label; ctx.stroke(); }
    });
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, k = inOutSine(clamp(t / 1, 0, 1));
    ctx.fillStyle = mix(c.bgSurface, c.strata1, 0.22); ctx.fillRect(0, 0, W, H);
    if (s === 0 || s === 3) {
      this._tower(ctx, c, s);
      pill(ctx, c, s === 0 ? 'What each layer stands on' : 'Every government needs food', 340, 44, { size: 30, display: true, bg: c.bgSurface, ink: c.label });
    }
    if (s === 1) {
      pill(ctx, c, 'Around 4,200 years ago', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      ctx.fillStyle = alpha(c.warning, 0.34); rr(ctx, yr(-2250), 110, yr(-2100) - yr(-2250), 270, 14); ctx.fill();
      pill(ctx, c, 'A long dry time', (yr(-2250) + yr(-2100)) / 2, 136, { size: 25, display: true, bg: c.warning });
      rr(ctx, RX, 372, RW, 14, 7); ctx.fillStyle = c.track; ctx.fill();
      for (const [y, name, tone, yy] of [[-2181, 'Old Kingdom ends', 's3', 214], [-2154, 'Akkad loses to Assur', 's6', 296]]) {
        const x = yr(y), col = c[tone];
        ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, yy + 18); ctx.lineTo(x, 372); ctx.stroke();
        pill(ctx, c, `${name}, ${-y} BCE`, x + 40, yy, { size: 24, display: true, bg: col, ink: inkOn(c, col) });
      }
      ctx.font = `800 24px ${c.fontBody}`; ctx.fillStyle = c.label; ctx.textBaseline = 'middle';
      ctx.textAlign = 'left'; ctx.fillText('2400 BCE', RX, 412); ctx.textAlign = 'right'; ctx.fillText('1800 BCE', RX + RW, 412);
      pill(ctx, c, 'Many researchers link these', 340, 468, { size: 26, display: true, bg: c.bgSurface, ink: c.label });
    }
    if (s === 2) {
      ctx.fillStyle = mix(c.strata1, c.bgSurface, 0.1); ctx.fillRect(0, 90, W, H);
      const w = 120 - 96 * k;
      ctx.fillStyle = c.seaShallow; ctx.beginPath(); ctx.moveTo(250, 90); ctx.bezierCurveTo(300, 200, 170, 340, 250, 520); ctx.lineTo(250 + w, 520); ctx.bezierCurveTo(170 + w, 340, 300 + w, 200, 250 + w, 90); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = darken(c.seaShallow, 0.3); ctx.lineWidth = 4; ctx.stroke();
      hutArt(ctx, c, 470, 300, 1.25 - 0.45 * k); hutArt(ctx, c, 580, 300, 1.25 - 0.45 * k); hutArt(ctx, c, 500, 450, 1.25 - 0.45 * k);
      pill(ctx, c, 'After 1900 BCE', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Ghaggar-Sarasvati dries', 250, 116, { size: 25, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Settlements get smaller', 500, 486, { size: 25, display: true, bg: c.bgSurface, ink: c.label });
    }
  }
}
