// TransformFaultScene - a fence across a fault, seen from above. The strain gauge fills on its own; Let it
// slip breaks the rock: the far half of the fence jumps the way its side moves, and the trace on the recorder really moves. The slip
// is one state, so the fence and the trace can never disagree.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, outBack, clamp01, drawBackdrop, rr } from 'simulations/base/kit/SimLook.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawGrass, drawFlowArrow } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const FX = 340, FY = 150, SLIP = 74;

export class TransformFaultScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A fence built across a fault, seen from above. The two sides are locked. When they slip the far half of the fence jumps sideways and a shaking trace appears on the recorder.';
  static CONTROLS = [{ type: 'button', id: 'slip', label: 'Let it slip' }];

  constructor(container, config) { super(container, config); this._b = 0; this._t = -1; this._found = false; }
  enter(stage) { this._b = stage; this._t = stage === 2 ? 1 : -1; this.requestUiUpdate?.(); }
  isControlHidden(id) { return id === 'slip' && this._b !== 1; }
  isControlDisabled(id) { return id === 'slip' && this._t >= 0; }
  onControlChange(id) {
    if (id !== 'slip' || this._t >= 0) return;
    this._t = 0; this.shake?.(8); this.animateFor?.(2200); this.requestUiUpdate?.();
    if (!this._found) { this._found = true; this.after(1.5, () => this.celebrate(FX, FY, 12, { key: 'slip' })); }
  }
  update(d) { if (this._t >= 0 && this._t < 1) this._t = Math.min(1, this._t + d / 1.6); }
  busy() { return this._t >= 0 && this._t < 1; }

  _trace(ctx, c, t) {
    const x = 26, y = 372, w = 628, h = 126, ink = earthColour(c, 'ink');
    ctx.save();
    ctx.fillStyle = earthColour(c, 'snow'); ctx.strokeStyle = ink; ctx.lineWidth = 3;
    rr(ctx, x, y, w, h, 14); ctx.fill(); ctx.stroke();
    ctx.beginPath(); rr(ctx, x, y, w, h, 14); ctx.clip();
    ctx.strokeStyle = c.bad; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    const mid = y + h / 2 + 14, kick = 0.3;
    for (let px = 0; px <= w; px += 3) {
      const u = px / w;
      let a = 2;
      if (t >= 0 && u > kick && u < kick + (1 - kick) * Math.min(1, t * 1.4)) a = 46 * Math.exp(-(u - kick) * 6);
      const py = mid + Math.sin(px * 0.72) * a * (px % 2 ? 1 : 0.8);
      px ? ctx.lineTo(x + px, py) : ctx.moveTo(x + px, py);
    }
    ctx.stroke();
    ctx.restore();
    pill(ctx, c, t >= 0 ? 'Recorder: the ground shakes' : 'Recorder: quiet', 340, y + 24, { bg: ink, ink: earthColour(c, 'snow'), size: 25, display: true });
  }

  _fence(ctx, c, x0, x1, y) {
    const ink = earthColour(c, 'ink'), wood = earthColour(c, 'bark');
    ctx.save();
    ctx.strokeStyle = ink; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = wood; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillStyle = wood; ctx.strokeStyle = ink; ctx.lineWidth = 3;
    for (let x = Math.min(x0, x1) + 16; x < Math.max(x0, x1) - 6; x += 56) { ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow'), t = this._t;
    const off = t < 0 ? 0 : SLIP * outBack(clamp01(t / 0.3));
    drawRock(ctx, c, [[-10, 0], [FX, 0], [FX, 360], [-10, 360]], { seed: 3, fill: 'grass', cracks: 0, grain: false, outline: false, lit: false });
    drawRock(ctx, c, [[FX, 0], [690, 0], [690, 360], [FX, 360]], { seed: 5, fill: 'grassDark', cracks: 0, grain: false, outline: false, lit: false });
    for (let i = 0; i < 6; i++) { drawGrass(ctx, c, 30, 30 + i * 60, 300, 40 + i * 60, { seed: i + 1, n: 12 }); drawGrass(ctx, c, 380, 40 + i * 60, 650, 30 + i * 60, { seed: i + 9, n: 12 }); }
    ctx.save();
    ctx.strokeStyle = ink; ctx.lineWidth = 10; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let y = 0; y <= 360; y += 30) { const x = FX + (y % 60 ? 7 : -7); y ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = mix(earthColour(c, 'soil'), ink, 0.3); ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    this._fence(ctx, c, -10, FX - 4, FY);
    this._fence(ctx, c, FX + 4, 690, FY + off);
    drawFlowArrow(ctx, c, 120, 320, 120, 262, { col: c.warning, w: 12 });
    drawFlowArrow(ctx, c, 560, 40, 560, 96, { col: c.warning, w: 12 });
    pill(ctx, c, 'Fault', FX, 30, { bg: c.gold, ink, size: 26, display: true });
    if (this._b === 0) pill(ctx, c, 'Nothing built, nothing sinks', FX, 320, { bg: ink, ink: snow, size: 25, display: true });
    if (t < 0 && this._b === 1) pill(ctx, c, 'Locked: strain builds', FX, 320, { bg: ink, ink: snow, size: 25, display: true });
    if (t >= 0.3) pill(ctx, c, 'The fence no longer meets', FX, 320, { bg: ink, ink: snow, size: 25, display: true });
    this._trace(ctx, c, t);
  }
}
