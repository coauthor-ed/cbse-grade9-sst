// SaptangaWheelScene - L04 s01 (3 beats) and s02 setup (0). One thing only: the quote. A bullock
// carriage from behind on one wheel tips; the learner fits the second wheel and it rolls.
// The wheel on b2 is fitted from a cold start. The rim carries no limbs.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill, clamp01 } from 'simulations/base/kit/SimLook.js';
import { drawAnimal, animalLook } from 'simulations/base/kit/SimAnimal.js';
import { pal, panel, reading, wheel, tree } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_SET = 0, S_ONE = 1, S_FIT = 2, S_LINE = 3;
const MAP3 = [m(S_ONE), m(S_FIT), m(S_LINE)], MAP0 = [m(S_SET)];
const SPARE = { x: 566, y: 424 }, HIT = 86;
const FIT_T = 0.7, ROLL_T = 2.2;

export class SaptangaWheelScene extends SimScene {
  static BEAT_STEP_MAP = MAP3;
  static BEAT_MAPS = { 3: MAP3, 0: MAP0, [Number.MAX_SAFE_INTEGER]: MAP0 };
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'A loaded bullock carriage seen from behind, leaning over on a single wheel. A spare wheel lies on the road. Fit it to the axle and the carriage stands level and rolls. On the last step the line one wheel does not move the carriage is shown.';
  static CONTROLS = [{ type: 'button', id: 'fit', label: 'Fit the wheel' }];
  fitted = false;
  fitAt = -9;

  enter(stage) { this.fitted = stage === S_LINE || stage === S_SET; this.fitAt = -9; }
  isControlHidden(id) { return id === 'fit' && this.stage !== S_FIT; }
  isControlDisabled(id) { return id === 'fit' && this.fitted; }
  onControlChange(id) { if (id === 'fit') this._fit(); }
  pointerDown(p) { if (this.stage === S_FIT && !this.fitted && Math.hypot(p.x - SPARE.x, p.y - SPARE.y) < HIT) this._fit(); }
  _fit() {
    if (this.fitted) return;
    this.fitted = true; this.fitAt = this.age;
    this.after(FIT_T, () => this.celebrate(340, 330, 20));
  }
  busy() { return this.fitted && this.fitAt >= 0 && this.age - this.fitAt < ROLL_T + 0.4; }

  _road(ctx, c, off) {
    const p = pal(c);
    drawBackdrop(ctx, c, 'dots');
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = mix(c.bgSurface, c.gold, 0.12); ctx.fill();
    rr(ctx, 6, 150, 668, 364, 18); ctx.fillStyle = p.grass; ctx.fill();
    ctx.beginPath(); ctx.moveTo(300, 150); ctx.lineTo(380, 150); ctx.lineTo(620, 514); ctx.lineTo(60, 514); ctx.closePath(); ctx.fillStyle = p.sand; ctx.fill();
    ctx.fillStyle = p.sandDark;
    for (let i = 0; i < 6; i++) { const u = ((i / 6 + off) % 1), y = 160 + u * u * 350, w = 3 + u * 16; ctx.fillRect(340 - w * 8, y, w * 1.4, 3 + u * 5); ctx.fillRect(340 + w * 7, y, w * 1.4, 3 + u * 5); }
    tree(ctx, c, 70, 240, 1.3, 3); tree(ctx, c, 610, 226, 1.2, 8);
  }

  _carriage(ctx, c, tilt, fitK, turn, bob) {
    const p = pal(c);
    drawAnimal(ctx, c, { kind: 'cow', x: 306, y: 208, length: 92, facing: 1, pose: 'walk', phase: turn * 0.2 }, animalLook(c, 'cow', {}));
    drawAnimal(ctx, c, { kind: 'cow', x: 378, y: 216, length: 92, facing: 1, pose: 'walk', phase: turn * 0.2 + 0.5 }, animalLook(c, 'cow', {}));
    ctx.save(); ctx.translate(250, 410 + bob); ctx.rotate(tilt);
    // left wheel: stays on the axle
    ctx.save(); ctx.scale(0.5, 1); wheel(ctx, c, 0, 0, 84, turn); ctx.restore();
    rr(ctx, -6, -9, 200, 18, 6); ctx.fillStyle = p.wood; ctx.fill();
    // body and load
    rr(ctx, -6, -190, 200, 160, 14); ctx.fillStyle = p.woodLight; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = p.wood; ctx.stroke();
    for (let k = 1; k < 4; k++) { ctx.fillStyle = p.wood; ctx.fillRect(-6 + k * 50, -190, 5, 160); }
    ctx.beginPath(); ctx.ellipse(44, -196, 44, 34, 0, 0, 7); ctx.fillStyle = p.sand; ctx.fill(); ctx.strokeStyle = p.sandDark; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(132, -200, 52, 40, 0, 0, 7); ctx.fillStyle = p.thatch; ctx.fill(); ctx.strokeStyle = p.thatchDark; ctx.stroke();
    if (fitK > 0) { const a = 188; ctx.save(); ctx.translate(a, 0); ctx.scale(0.5 * fitK, fitK); wheel(ctx, c, 0, 0, 84, -turn); ctx.restore(); }
    ctx.restore();
  }

  draw(ctx, c) {
    const st = this.stage;
    const since = this.age - this.fitAt, live = this.fitted && this.fitAt >= 0;
    const fitU = !this.fitted ? 0 : live ? clamp01(since / FIT_T) : 1;
    const rollU = live ? clamp01((since - FIT_T) / (ROLL_T - FIT_T)) : 0;
    this._road(ctx, c, rollU * 1.5);
    const tilt = (1 - fitU) * 0.26;
    this._carriage(ctx, c, tilt, fitU, rollU * 18, rollU > 0 && rollU < 1 ? Math.sin(rollU * 40) * 2 : 0);
    if (!this.fitted) {
      ctx.save(); ctx.translate(SPARE.x, SPARE.y); ctx.scale(1, 0.46); wheel(ctx, c, 0, 0, 72, 0.3); ctx.restore();
      if (st === S_FIT) { ctx.beginPath(); ctx.arc(SPARE.x, SPARE.y, 60 + Math.sin((this.clock ?? 0) * 4) * 3, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = c.accent; ctx.stroke(); pill(ctx, c, 'tap the spare wheel', 520, 330, { size: 28, bg: c.accent, display: true }); }
    }
    if (st === S_ONE) pill(ctx, c, 'one wheel: it cannot move', 340, 60, { size: 28, bg: c.warning, display: true });
    if (st === S_FIT && rollU >= 1) pill(ctx, c, 'a pair of wheels: it rolls', 340, 60, { size: 28, bg: c.good, display: true });
    if (st === S_SET) pill(ctx, c, 'the king is away', 340, 60, { size: 28, bg: c.gold, display: true });
    if (st === S_LINE) {
      panel(ctx, c, 90, 20, 500, 112, { fill: c.bgSurface });
      reading(ctx, c, 'one wheel does not', 340, 58, 34); reading(ctx, c, 'move the carriage', 340, 100, 34);
    }
    drawVignette(ctx, c, 0.28);
  }
}
