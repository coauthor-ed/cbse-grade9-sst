// InundationCycleScene - blk-l10-s06, 4 beats. Beat 0: the river's long slope, high in the south, low at the sea, with the flow
// arrow: the answer to the predict. Beats 1-3: a slice across the valley: the flood rises and rests, then it falls and leaves
// black mud with new shoots, then a farmer's ditch leads water to a reservoir. Canvas: the farmer comes from SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, inkOn, lighten, mix, pill, rr, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';

const W = 680, H = 520;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const BANK = 330, BED = 430, RIVER_R = 210, LOW = 352, HIGH = 262;

export class InundationCycleScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'The Nile runs downhill from the high south to the low north. Across the valley, the summer flood covers the fields, then falls and leaves black mud. A farmer digs a ditch that leads water to a reservoir.';

  busy() { const s = this.stage ?? 0; return this.age < (s === 0 ? 1.6 : s === 1 ? 2.4 : 1.6); }

  draw(ctx, c) {
    const s = this.stage ?? 0;
    if (s === 0) { this._slope(ctx, c); return; }
    this._section(ctx, c, s);
  }

  _sky(ctx, c, y) { ctx.fillStyle = mix(c.bgSurface, c.s1, 0.12); ctx.fillRect(0, 0, W, y); }

  _slope(ctx, c) {
    const k = clamp(this.age / 1.3, 0, 1), sand = mix(c.gold, c.bgSurface, 0.32);
    this._sky(ctx, c, H);
    const y = (x) => 120 + (x / W) * 280 + Math.sin(x / 60) * 3;
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, y(x)); ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = sand; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, y(0) - 6); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, y(x) - 6); ctx.lineCap = 'round'; ctx.strokeStyle = c.seaShallow; ctx.lineWidth = 22; ctx.stroke();
    ctx.fillStyle = c.seaShallow; ctx.fillRect(610, y(610) - 8, 80, H);
    // The flow arrow draws on, once.
    const ax = 250 + 310 * easeOutCubic(k), ay = y(ax) - 66;
    ctx.strokeStyle = c.label; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(250, y(250) - 66); ctx.lineTo(ax, ay); ctx.stroke();
    const dir = Math.atan2(280, W);
    ctx.beginPath(); ctx.moveTo(ax - 30 * Math.cos(dir - 0.6), ay - 30 * Math.sin(dir - 0.6)); ctx.lineTo(ax, ay); ctx.lineTo(ax - 30 * Math.cos(dir + 0.6), ay - 30 * Math.sin(dir + 0.6)); ctx.stroke();
    pill(ctx, c, 'Upper Egypt', 120, 60, { size: 32, bg: c.s5, display: true });
    pill(ctx, c, 'South: higher', 124, 262, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'Lower Egypt', 440, 400, { size: 32, bg: c.s2, display: true });
    pill(ctx, c, 'North: the sea', 530, 484, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'The river flows downhill', 450, 96, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
  }

  _section(ctx, c, s) {
    const t = this.age, sand = mix(c.gold, c.bgSurface, 0.32), field = mix(c.gold, c.elevHigh, 0.5);
    const rise = s === 1 ? easeOutCubic(clamp(t / 2.2, 0, 1)) : 0, fall = s === 2 ? clamp(t / 1.3, 0, 1) : 1;
    const water = s === 1 ? LOW - (LOW - HIGH) * rise : s === 2 ? HIGH + (LOW - HIGH) * fall : LOW;
    this._sky(ctx, c, H);
    // Water first, so the ground cuts it.
    ctx.fillStyle = c.seaShallow; ctx.fillRect(0, water, W, BED + 60 - water);
    ctx.fillStyle = alpha(lighten(c.seaShallow, 0.4), 0.8); ctx.fillRect(0, water, W, 5);
    // The river bed and the plain.
    ctx.beginPath(); ctx.moveTo(0, BED); ctx.lineTo(RIVER_R - 50, BED); ctx.quadraticCurveTo(RIVER_R, BED, RIVER_R + 30, BANK); ctx.lineTo(590, BANK - 6); ctx.quadraticCurveTo(630, BANK - 8, 640, 200); ctx.lineTo(W, 190); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = field; ctx.fill();
    const rnd = mulberry32(5); ctx.fillStyle = alpha(darken(field, 0.4), 0.3); for (let i = 0; i < 90; i++) ctx.fillRect(rnd() * W, 350 + rnd() * 160, 4, 2);
    ctx.beginPath(); ctx.moveTo(640, 200); ctx.lineTo(W, 190); ctx.lineTo(W, H); ctx.lineTo(600, H); ctx.lineTo(600, BANK); ctx.quadraticCurveTo(630, BANK - 8, 640, 200); ctx.closePath(); ctx.fillStyle = sand; ctx.fill();
    pill(ctx, c, 'Desert', 620, 160, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
    if (s === 1) {
      const fa = clamp((t - 1.5) / 0.5, 0, 1); ctx.save(); ctx.globalAlpha *= fa; pill(ctx, c, 'The summer flood', 340, 56, { size: 36, bg: c.s1, display: true }); ctx.restore();
      pill(ctx, c, 'Nile', 92, 390, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'Fields under water', 410, 300, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    }
    if (s >= 2) {
      const m = s === 2 ? clamp((t - 0.6) / 0.7, 0, 1) : 1;
      ctx.save(); ctx.globalAlpha *= m; rr(ctx, RIVER_R + 28, BANK - 16, 362, 22, 8); ctx.fillStyle = darken(c.elevHigh, 0.68); ctx.fill(); ctx.restore();
      pill(ctx, c, 'Nile', 92, 390, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    }
    if (s === 2) {
      this._crop(ctx, c, clamp((t - 0.9) / 0.6, 0, 1) * 0.5);
      const ma = clamp((t - 0.9) / 0.5, 0, 1), mud = darken(c.elevHigh, 0.62); ctx.save(); ctx.globalAlpha *= ma; pill(ctx, c, 'Rich black mud', 400, 408, { size: 36, bg: mud, ink: inkOn(c, mud), display: true }); ctx.restore();
    }
    if (s === 3) this._ditch(ctx, c, clamp(t / 1.4, 0, 1));
  }

  _crop(ctx, c, g) {
    if (g <= 0.01) return;
    ctx.strokeStyle = c.elevLow; ctx.lineCap = 'round'; ctx.lineWidth = 5;
    for (let x = 262; x < 585; x += 26) { const h = 12 + 40 * g; ctx.beginPath(); ctx.moveTo(x, BANK - 14); ctx.lineTo(x, BANK - 14 - h); ctx.moveTo(x, BANK - 14 - h * 0.5); ctx.lineTo(x + 8, BANK - 14 - h * 0.8); ctx.moveTo(x, BANK - 14 - h * 0.4); ctx.lineTo(x - 8, BANK - 14 - h * 0.7); ctx.stroke(); }
  }

  _ditch(ctx, c, k) {
    // A ditch cut through the bank to a reservoir, seen in the same slice.
    const y = BANK - 16, x0 = RIVER_R + 6, x1 = 460;
    rr(ctx, x0, y + 14, x1 - x0, 50, 8); ctx.fillStyle = darken(c.elevHigh, 0.48); ctx.fill();
    rr(ctx, x0 + 4, LOW, (x1 - x0 - 8) * k, 26, 6); ctx.fillStyle = c.seaShallow; ctx.fill();
    rr(ctx, 440, y + 14, 150, 100, 12); ctx.fillStyle = darken(c.elevHigh, 0.48); ctx.fill();
    const lvl = clamp((k - 0.55) / 0.45, 0, 1);
    if (lvl > 0) { rr(ctx, 446, LOW + 68 - 68 * lvl, 138, 68 * lvl, 8); ctx.fillStyle = c.seaShallow; ctx.fill(); }
    const hands = [{ x: 362, y: y - 54 }, { x: 396, y: y - 90 }];
    const spec = figureFor(this, { role: 'farmer', pose: { name: 'stand', crouch: 0.3, lean: 0.25 }, x: 322, y: y + 8, height: 196, facing: 1, hands, i: 2 });
    drawFigure(ctx, c, spec, spec.look);
    ctx.strokeStyle = darken(c.elevHigh, 0.3); ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(404, y - 106); ctx.lineTo(352, y - 38); ctx.lineTo(368, y - 6); ctx.stroke();
    pill(ctx, c, 'Ditch', 330, 428, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'Reservoir', 500, 472, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'Nile', 92, 390, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
  }
}
