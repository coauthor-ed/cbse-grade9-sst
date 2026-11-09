// PowerSourceScene - L01 s03. One idea a beat.
// b0 a crowned ruler on a dais, thick arrows down to the people: a ruler whose power does not depend on the people's choice.
// b1 people at a polling booth, thick arrows up to Parliament: power given by the people.
// b2 the same picture takes its name, popular sovereignty.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01 } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { crown, panel, MAN } from '../shared/SstArt.js';
import { drawCivic, dayStage } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const ROLES = ['farmer', 'adult', 'elder', 'shopkeeper', 'adult', 'student', 'worker', 'elder'];

function arrow(ctx, x, y0, y1, k, col, rim) {
  const y = y0 + (y1 - y0) * k, d = Math.sign(y1 - y0) || 1, w = 17, hw = 36, hl = 40;
  if (Math.abs(y - y0) < hl) return;
  ctx.beginPath();
  ctx.moveTo(x - w, y0); ctx.lineTo(x - w, y - d * hl); ctx.lineTo(x - hw, y - d * hl); ctx.lineTo(x, y);
  ctx.lineTo(x + hw, y - d * hl); ctx.lineTo(x + w, y - d * hl); ctx.lineTo(x + w, y0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.strokeStyle = rim; ctx.stroke();
}

export class PowerSourceScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'First, a crowned ruler stands on a raised dais with thick arrows pointing down to a row of people. Then people queue at a polling booth and thick arrows point up from them to the Parliament building. Last, that picture is named popular sovereignty.';

  busy() { return this.age < 1.2; }

  _people(ctx, c, x0, n, gap, h, facing) {
    for (let i = 0; i < n; i++) {
      const s = figureFor(this, { role: ROLES[i % ROLES.length], x: x0 + i * gap, y: 446, height: h, i: i + 1, facing, mood: 'smile' });
      drawFigure(ctx, c, s, s.look);
    }
  }

  _ruler(ctx, c) {
    dayStage(ctx, c, { horizon: 256, ground: 'stone' });
    const k = 1 - (1 - clamp01(this.age / 0.9)) ** 3;
    panel(ctx, c, 170, 196, 340, 40, { fill: mix(c.gold, c.bgSurface, 0.45) });
    const s = figureFor(this, { role: 'adult', x: 340, y: 200, height: 170, i: 3, facing: 0, pose: 'stand', look: { ...MAN, outfit: 'kurta' } });
    const sk = drawFigure(ctx, c, s, s.look), hd = sk.anchors.head;
    crown(ctx, c, hd.x, hd.y - hd.r * 1.15, 1.2);
    [150, 340, 530].forEach((x) => arrow(ctx, x, 246, 322, k, mix(c.waste, c.bgSurface, 0.3), mix(c.waste, c.label, 0.5)));
    this._people(ctx, c, 66, 7, 91, 112, 0);
    pill(ctx, c, 'not chosen', 120, 36, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'by the people', 120, 82, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
  }

  _people2(ctx, c) {
    dayStage(ctx, c, { horizon: 296, ground: 'earth' });
    const k = 1 - (1 - clamp01(this.age / 0.9)) ** 3;
    drawCivic(ctx, c, 'parliament', 340, 204, { w: 372 });
    [96, 584].forEach((x) => arrow(ctx, x, 306, 214, k, mix(c.s3, c.bgSurface, 0.2), mix(c.s3, c.label, 0.5)));
    drawCivic(ctx, c, 'booth', 96, 452, { h: 128 });
    this._people(ctx, c, 226, 6, 84, 118, -1);
    if (this.stage === 1) pill(ctx, c, 'power from the people', 340, 258, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    else pill(ctx, c, 'popular sovereignty', 340, 258, { size: 36, bg: mix(c.s3, c.bgSurface, 0.45), ink: c.label, display: true });
  }

  draw(ctx, c) { if (this.stage === 0) this._ruler(ctx, c); else this._people2(ctx, c); }
}
