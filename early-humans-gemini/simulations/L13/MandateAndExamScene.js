// MandateAndExamScene - blk-l13-s06, 4 beats, one idea each. Beat 0: heaven's appointee, with the test: are the people
// doing well? Beat 1: five things officials were examined in. Beat 2: metal money, then paper. Beat 3: two levels of
// society. Chips on beat 1 light a skill. The field reads either way because the belief is a condition. Canvas.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, inkOn, lighten, mix, outBack, pill, rr } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure, drawFigureRow } from 'simulations/base/kit/SimFigure.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { earsField, spadeCoin, knifeCoin, paperNote, bowArt, rodsArt, brushArt, horseArt, chimeArt } from './ChinaThings.js';
import { ground } from '../L12/ChinaDraw.js';

const W = 680, H = 520;
const MAP = [0, 0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const SKILLS = ['Archery', 'Horses', 'Calculations', 'Writing', 'Music'];

export class MandateAndExamScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A king under the sky with two fields: if the people prosper he stays, if they do not he can be dismissed. Then five subjects for officials: archery, horsemanship, calculations, writing and music. Then metal money and paper money. Then two levels of society: rulers, nobles and aristocrats above farmers and labourers.';

  busy() { return this.age < 1.4; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    this[['_mandate', '_exam', '_money', '_levels'][s]](ctx, c, t);
  }

  _mandate(ctx, c, t) {
    ctx.fillStyle = mix(c.skyDay, c.bgSurface, 0.5); ctx.fillRect(0, 0, W, H);
    ground(ctx, c, 330, W, H, mix(c.strata1, c.elevMid, 0.35));
    // Light from heaven onto the ruler.
    ctx.fillStyle = alpha(c.gold, 0.32); ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(380, 0); ctx.lineTo(430, 340); ctx.lineTo(250, 340); ctx.fill();
    rr(ctx, 240, 300, 200, 40, 8); ctx.fillStyle = c.strata3; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(c.strata3, 0.4); ctx.stroke();
    const spec = figureFor(this, { role: 'elder', pose: 'stand', x: 340, y: 302, height: 216, facing: 0 });
    drawFigure(ctx, c, spec, spec.look);
    pill(ctx, c, 'Appointed by heaven', 340, 40, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    earsField(ctx, c, 30, 380, 280, 90, true);
    earsField(ctx, c, 370, 380, 280, 90, false);
    pill(ctx, c, 'People prosper: he stays', 170, 354, { size: 25, display: true, bg: c.good, ink: inkOn(c, c.good), scale: outBack(clamp((t - 0.2) / 0.4, 0, 1)) });
    pill(ctx, c, 'They do not: dismissed', 510, 354, { size: 25, display: true, bg: c.bad, ink: inkOn(c, c.bad), scale: outBack(clamp((t - 0.5) / 0.4, 0, 1)) });
  }

  _exam(ctx, c, t) {
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    pill(ctx, c, 'Officials were examined in', 340, 40, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    const pos = [[122, 96], [340, 96], [558, 96], [231, 300], [449, 300]];
    SKILLS.forEach((name, i) => {
      const [cx, y] = pos[i], w = 196, h = 186, k = outBack(clamp((t - i * 0.12) / 0.34, 0, 1));
      ctx.save(); ctx.translate(cx, y + h); ctx.scale(k, k); ctx.translate(-cx, -y - h);
      rr(ctx, cx - w / 2, y + 5, w, h, 18); ctx.fillStyle = darken(c.bgSurface, 0.2); ctx.fill();
      rr(ctx, cx - w / 2, y, w, h, 18); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.stroke; ctx.stroke();
      const my = y + 74;
      if (i === 0) bowArt(ctx, c, cx, my);
      if (i === 1) horseArt(ctx, c, cx, my);
      if (i === 2) rodsArt(ctx, c, cx, my);
      if (i === 3) brushArt(ctx, c, cx, my);
      if (i === 4) chimeArt(ctx, c, cx, my);
      pill(ctx, c, name, cx, y + 158, { size: 25, display: true, bg: c.s1 });
      ctx.restore();
    });
  }

  _money(ctx, c, t) {
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    pill(ctx, c, 'From metal to paper', 340, 40, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    const a = outBack(clamp(t / 0.4, 0, 1)), b = outBack(clamp((t - 0.3) / 0.4, 0, 1)), d = outBack(clamp((t - 0.6) / 0.4, 0, 1));
    ctx.save(); ctx.translate(126, 240); ctx.scale(a, a); spadeCoin(ctx, c); ctx.restore();
    ctx.save(); ctx.translate(340, 240); ctx.scale(b, b); knifeCoin(ctx, c); ctx.restore();
    ctx.save(); ctx.translate(556, 240); ctx.scale(d, d); paperNote(ctx, c); ctx.restore();
    pill(ctx, c, 'Zhou: metal', 126, 400, { size: 27, display: true, bg: c.s2 });
    pill(ctx, c, 'Money economy', 340, 400, { size: 27, display: true, bg: c.s2 });
    pill(ctx, c, '5th century BCE', 340, 444, { size: 24, display: false, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, 'Later: paper', 556, 400, { size: 27, display: true, bg: c.s1 });
    pill(ctx, c, 'China was first', 556, 444, { size: 24, display: false, bg: c.bgSurface, ink: c.label });
  }

  _levels(ctx, c, t) {
    ctx.fillStyle = mix(c.skyDay, c.bgSurface, 0.6); ctx.fillRect(0, 0, W, H);
    const k = clamp(t / 0.5, 0, 1), stone = mix(c.strata5, c.bgSurface, 0.3);
    const tier = (x, y, w, h, col) => { rr(ctx, x, y + 6, w, h, 10); ctx.fillStyle = darken(col, 0.4); ctx.fill(); rr(ctx, x, y, w, h, 10); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.42); ctx.stroke(); ctx.fillStyle = lighten(col, 0.28); ctx.fillRect(x + 10, y + 5, w - 20, 4); };
    tier(30, 410, 620, 90, mix(c.strata1, c.elevMid, 0.3));
    tier(160, 250, 360, 160, stone);
    drawFigureRow(ctx, c, { x: 196, y: 252, w: 290, height: 112, n: 5, pose: 'stand', facing: 0, overlap: 0.15, role: 'elder' });
    ctx.save(); ctx.globalAlpha = k;
    drawFigureRow(ctx, c, { x: 44, y: 412, w: 600, height: 110, n: 9, pose: 'stand', facing: 0, overlap: 0.1, role: 'farmer' });
    ctx.restore();
    pill(ctx, c, 'By 1500 BCE', 340, 36, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, 'Ruling class, nobles, aristocrats', 340, 92, { size: 27, display: true, bg: c.s5 });
    pill(ctx, c, 'Farmers and labourers', 340, 476, { size: 27, display: true, bg: c.s3, ink: inkOn(c, c.s3) });
  }
}
