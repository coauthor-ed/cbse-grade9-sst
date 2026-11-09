// TwoWrittenLawsScene - blk-l14-s04d, 3 beats. Beat 0: two records on a true-scale rail, 1792 BCE and 221 BCE. Beat 1: the
// two designs: three penalties by rank, and the Han account of Qin law, stamped as an account. Beat 2: what happened to
// each, with no cause claimed. Canvas: the stele and strips are drawn.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, inkOn, mix, outBack, pill, rr } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawStrips, drawScroll } from '../L12/ChinaDraw.js';
import { steleArt } from './BronzeDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const RANKS = [['Free citizen', "Offender's own eye", 's6'], ['Commoner', 'Fine in silver', 's2'], ['Slave', 'Half value, to the owner', 's5']];
const RX = 60, RW = 560, FROM = -2000, TO = -100;
const yr = (y) => RX + (y - FROM) / (TO - FROM) * RW;

export class TwoWrittenLawsScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'Two written laws, more than 1,500 years apart: Hammurabi in 1792 BCE and the Qin in 221 BCE. Hammurabi graded penalties by rank. A Han historian says Qin law was harsh for all, though strips dug up show smaller penalties. Babylon lost its place by the end of 1400 BCE and the Qin fell in 206 BCE.';

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, k = outBack(clamp(t / 0.4, 0, 1));
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    if (s === 0) {
      pill(ctx, c, 'More than 1,500 years apart', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      steleArt(ctx, c, yr(-1792), 340, 130 * k, 220);
      ctx.save(); ctx.translate(yr(-221), 240); ctx.scale(k, k); drawStrips(ctx, c, 0, 0, 170, 190); ctx.restore();
      rr(ctx, RX, 392, RW, 16, 8); ctx.fillStyle = c.track; ctx.fill();
      rr(ctx, yr(-1792), 392, yr(-221) - yr(-1792), 16, 8); ctx.fillStyle = c.accent; ctx.fill();
      for (const [y, col] of [[-1792, c.s6], [-221, c.s2]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(yr(y), 400, 15, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.4); ctx.stroke(); }
      pill(ctx, c, 'Hammurabi, 1792 BCE', yr(-1792) + 44, 450, { size: 26, display: true, bg: c.s6, ink: inkOn(c, c.s6) });
      pill(ctx, c, 'Qin, 221 BCE', yr(-221) - 10, 450, { size: 26, display: true, bg: c.s2 });
      pill(ctx, c, 'Neither copied the other', 340, 494, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
    }
    if (s === 1) {
      pill(ctx, c, 'Hammurabi: by rank', 186, 40, { size: 30, display: true, bg: c.s6, ink: inkOn(c, c.s6) });
      pill(ctx, c, 'Qin: in a later account', 510, 40, { size: 26, display: true, bg: c.s2 });
      RANKS.forEach(([who, what, tone], i) => {
        const y = 100 + i * 126, g = outBack(clamp((t - i * 0.12) / 0.34, 0, 1));
        ctx.save(); ctx.translate(180, y + 52); ctx.scale(g, g);
        rr(ctx, -166, -52, 332, 108, 16); ctx.fillStyle = darken(c.bgSurface, 0.2); ctx.fill();
        rr(ctx, -166, -56, 332, 108, 16); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c[tone]; ctx.stroke();
        pill(ctx, c, `Eye of a ${who.toLowerCase()}`, 0, -26, { size: 26, display: true, bg: c[tone], ink: inkOn(c, c[tone]) });
        ctx.restore();
        pill(ctx, c, what, 180, y + 74, { size: 25, display: false, bg: c.bgSurface, ink: c.label });
      });
      drawScroll(ctx, c, 510, 200, 170, 170);
      pill(ctx, c, 'Late workers: death', 510, 332, { size: 26, display: true, bg: c.bad, ink: inkOn(c, c.bad) });
      pill(ctx, c, 'Strips: smaller penalties', 510, 384, { size: 26, display: true, bg: c.warning });
    }
    if (s === 2) {
      pill(ctx, c, 'What happened next', 340, 40, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      steleArt(ctx, c, 180, 330, 120, 200);
      ctx.save(); ctx.translate(500, 230); ctx.scale(k, k); drawStrips(ctx, c, 0, 0, 170, 190); ctx.restore();
      pill(ctx, c, 'Babylon: end of 1400 BCE', 180, 384, { size: 26, display: true, bg: c.s6, ink: inkOn(c, c.s6) });
      pill(ctx, c, 'Several reasons', 180, 432, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Qin: 206 BCE', 500, 384, { size: 26, display: true, bg: c.s2 });
      pill(ctx, c, 'Historians still argue', 500, 432, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
    }
  }
}
