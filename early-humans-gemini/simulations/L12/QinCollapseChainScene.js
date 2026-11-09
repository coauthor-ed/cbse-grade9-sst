// QinCollapseChainScene - blk-l12-s03b, 4 beats. A wall on a hillside. Beat 0: empty, with the 15 years read big. Beat 1:
// workers carry stone. Beat 2: rain, a late party, and the stamp that says who told us. Beat 3: the two records side by
// side, the Han account and the Qin strips. The lesson is about who wrote what. Canvas: people are SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, mix, outBack, pill, rr } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure, drawFigureRow } from 'simulations/base/kit/SimFigure.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawWallRun, drawScroll, drawStrips, ground } from './ChinaDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);

export class QinCollapseChainScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'The Qin lasted 15 years. Workers called up by order build a wall. In rain, a late party faces death in the account of a Han historian. Bamboo strips with real Qin laws list smaller penalties, so we ask who wrote each record.';

  busy() { return this.age < 1.4; }

  _land(ctx, c, wet) {
    const sky = wet ? mix(c.strata5, c.bgSurface, 0.45) : mix(c.skyDay, c.bgSurface, 0.55);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mix(c.elevMid, c.bgSurface, 0.2);
    ctx.beginPath(); ctx.moveTo(0, 300); ctx.quadraticCurveTo(200, 150, 400, 220); ctx.quadraticCurveTo(560, 270, W, 170); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    ground(ctx, c, 400, W, H, mix(c.strata1, c.elevMid, 0.3));
    drawWallRun(ctx, c, 40, 300, 330, 214, 60, 'earth');
    drawWallRun(ctx, c, 330, 214, 640, 246, 60, 'earth');
    rr(ctx, 304, 130, 60, 86, 6); ctx.fillStyle = mix(c.strata2, c.strata1, 0.4); ctx.fill(); ctx.strokeStyle = darken(c.strata2, 0.4); ctx.lineWidth = 3; ctx.stroke();
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, k = outBack(clamp(t / 0.4, 0, 1));
    if (s === 3) { this._records(ctx, c, k); return; }
    this._land(ctx, c, s === 2);
    if (s === 0) {
      pill(ctx, c, '15 years', W / 2, 60, { size: 54, display: true, bg: c.s1, scale: k });
      pill(ctx, c, '221 to 206 BCE', W / 2, 124, { size: 30, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Why so short?', W / 2, 456, { size: 34, display: true, bg: c.bgSurface, ink: c.label });
    }
    if (s === 1) {
      const stone = mix(c.strata5, c.bgSurface, 0.2), hold = (x, y) => { rr(ctx, x - 26, y - 22, 52, 34, 6); ctx.fillStyle = stone; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(stone, 0.45); ctx.stroke(); };
      for (let i = 0; i < 4; i++) {
        const x = 110 + i * 150, hy = 372, spec = figureFor(this, { role: 'worker', pose: 'carry', x, y: 476, height: 180, facing: 1, i, hands: [{ x: x + 50, y: hy }, { x: x + 44, y: hy + 4 }] });
        drawFigure(ctx, c, spec, spec.look, { between: () => hold(x + 54, hy) });
      }
      pill(ctx, c, 'Called up by order', W / 2, 52, { size: 34, display: true, bg: c.bgSurface, ink: c.label });
    }
    if (s === 2) {
      ctx.strokeStyle = alpha(c.seaShallow, 0.7); ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let i = 0; i < 46; i++) { const x = (i * 149) % 700, y = (i * 83) % 400; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 26); ctx.stroke(); }
      ctx.fillStyle = mix(c.seaShallow, c.strata2, 0.4); ctx.beginPath(); ctx.ellipse(350, 452, 300, 36, 0, 0, 7); ctx.fill();
      drawFigureRow(ctx, c, { x: 120, y: 456, w: 420, height: 170, n: 4, pose: 'stand', facing: 1, overlap: 0.1 });
      pill(ctx, c, 'Late: death?', 180, 52, { size: 34, display: true, bg: c.bad });
      pill(ctx, c, 'Told by a Han historian', 454, 52, { size: 28, display: true, bg: c.warning, scale: k });
    }
  }

  _records(ctx, c, k) {
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    pill(ctx, c, 'Who wrote it?', W / 2, 44, { size: 36, display: true, bg: c.bgSurface, ink: c.label });
    const card = (x, title, line1, line2) => {
      rr(ctx, x, 100, 300, 370, 20); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.stroke; ctx.stroke();
      pill(ctx, c, title, x + 150, 136, { size: 28, display: true, bg: x < 300 ? c.s2 : c.s3 });
      pill(ctx, c, line1, x + 150, 396, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, line2, x + 150, 436, { size: 26, display: true, bg: c.bgSurface, ink: c.label });
    };
    card(30, 'Han historian', 'Written later', 'Lateness: death');
    card(350, 'Qin law strips', 'Dug up, from the time', 'Lateness: a fine');
    ctx.save(); ctx.translate(180, 270); ctx.scale(k, k); drawScroll(ctx, c, 0, 0, 200, 140); ctx.restore();
    ctx.save(); ctx.translate(500, 270); ctx.scale(k, k); drawStrips(ctx, c, 0, 0, 190, 170); ctx.restore();
  }
}
