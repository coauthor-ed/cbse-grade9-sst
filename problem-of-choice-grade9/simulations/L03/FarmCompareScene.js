import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * FarmCompareScene — companion to blk-l03-s07. Two identical plots side by
 * side: the left farm runs on the frontier (tractor out, both workers in,
 * full combination C); the right farm idles inside it (tractor parked,
 * worker asleep, smaller harvest). Beats reveal the comparison; free play
 * has a button that wakes the lazy farm up to the line.
 */

const W = 900;
const H = 560;

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  error:    ['--sim-error', '#f87171'],
  warning:  ['--sim-warning', '#fbbf24'],
};

const STEPS = [
  { type: 'compare', caption: 'Same plot. Same season. Two different efforts.' },
  { type: 'verdict', caption: 'On the line is efficiency; inside it is waste.' },
  { type: 'freeplay', caption: 'Wake the right-hand farm and watch it climb to its own ceiling.' },
];

const STEP_COMPARE = 0;
const STEP_VERDICT = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_COMPARE, dwellMs: null }],
  [{ idx: STEP_VERDICT, dwellMs: null }],
];

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class FarmCompareScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Two identical farm panels. The left runs at full effort — tractor working, two workers busy, a full ' +
    'combination-C harvest tag. The right idles inside its frontier — tractor parked, one worker asleep, a ' +
    'smaller harvest tag. A wake-up control brings the idle farm to its ceiling in free play.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'wake', label: 'Wake the idle farm ↑' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this._wakeProgress = 0; // 0 idle … 1 efficient
    this._waking = false;

    this._lessonLinked = false;
    this._beatChain = null;
    this._beatChainPos = 0;
    this._beatChainDwell = null;
  }

  async setup() {
    await super.setup();
    this._canvas.setAttribute('role', 'img');
    this._canvas.setAttribute('aria-label', this.constructor.ARIA_LABEL);
    this._reloadColors();
    this._drawInitialFrame(this._ctx);
  }

  _reloadColors() {
    this.colors = readSimColors(this.container, COLOR_TOKEN_MAP);
  }

  _isBeatLocked() {
    return this._lessonLinked && this.stepIndex < STEP_FREEPLAY;
  }

  isControlHidden(id) {
    const locked = this._isBeatLocked();
    if (id === 'prev') return locked || this.stepIndex === 0;
    if (id === 'next') return locked || this.stepIndex === STEP_FREEPLAY;
    if (id === 'wake') return locked || this._wakeProgress >= 1;
    return false;
  }

  onBeatChange(beatIndex) {
    this._lessonLinked = true;
    const clamped = Math.max(0, Math.min(beatIndex, BEAT_STEP_MAP.length - 1));
    const chain = BEAT_STEP_MAP[clamped];
    this._beatChain = chain;
    this._beatChainPos = 0;
    this._beatChainDwell = chain[0].dwellMs != null ? chain[0].dwellMs / 1000 : null;
    this.stepIndex = chain[0].idx;
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1); this._stepEnterTime = 0; }
    else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id === 'wake') this._waking = true;
    this.requestUiUpdate?.();
  }

  _tick(ctx, dt) {
    this._stepEnterTime += dt;
    if (this._waking && this._wakeProgress < 1) {
      this._wakeProgress = Math.min(1, this._wakeProgress + dt / 2.2);
    }
    if (this._lessonLinked && this._beatChainDwell != null) {
      this._beatChainDwell -= dt;
      if (this._beatChainDwell <= 0) this._beatChainDwell = null;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.colors.bgDeep;
    ctx.fillRect(0, 0, W, H);

    this._drawFarm(ctx, W / 2 - 420, 'FARM ONE — on the line', true);
    this._drawFarm(ctx, W / 2 + 40, 'FARM TWO — inside the line', false);

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 36);
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _drawFarm(ctx, x, title, efficient) {
    const c = this.colors;
    const eff = efficient ? 1 : this._wakeProgress;
    const appear = cruise(clamp01((this._stepEnterTime - (x < W / 2 ? 0.2 : 0.6)) / 0.8));
    if (appear < 0.02) return;

    ctx.save();
    ctx.globalAlpha = appear;

    SimDraw.drawPanel(ctx, x, 70, 380, 400, {
      bg: c.panelBg,
      radius: 14,
      stroke: SimDraw.withAlpha(efficient ? c.success : eff >= 1 ? c.success : c.error, eff >= 1 ? 0.9 : 0.7),
      lineWidth: 2,
    });

    ctx.font = '700 14px Inter, system-ui';
    ctx.fillStyle = efficient ? c.success : eff >= 1 ? c.success : c.error;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + 190, 100);

    // field rows: number of crop rows scales with effort
    const fx = x + 30, fy = 130, fw = 320, fh = 190;
    roundRectPath(ctx, fx, fy, fw, fh, 10);
    ctx.fillStyle = SimDraw.shade('#3d5226', -0.15 * (1 - eff) - 0.05);
    ctx.fill();
    const rows = Math.max(1, Math.round(1 + eff * 4));
    for (let r = 0; r < rows; r++) {
      const ry = fy + fh * (r + 1) / 6;
      ctx.strokeStyle = SimDraw.withAlpha(c.warning, 0.75);
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = 0; px <= fw - 24; px += 8) {
        const yy = ry + Math.sin(px / 26 + r) * 2.5;
        if (px === 0) ctx.moveTo(fx + 12 + px, yy);
        else ctx.lineTo(fx + 12 + px, yy);
      }
      ctx.stroke();
    }

    // tractor: parked vs moving
    const tractorX = efficient ? fx + fw * 0.62 + Math.sin(this._stepEnterTime * 2) * 6 : fx + fw * 0.68;
    this._drawTractor(ctx, tractorX, fy + fh - 18, !efficient && eff < 1);

    // workers
    const wx = efficient ? fx + fw * 0.25 : fx + fw * 0.25;
    this._drawWorker(ctx, wx, fy + fh - 16, false);
    this._drawWorker(ctx, wx + 46, fy + fh - 16, !efficient && eff < 1); // second worker asleep when idle

    // harvest tag
    const barley = Math.round(50 * (0.55 + 0.45 * eff));
    const wheat = Math.round(70 * (0.55 + 0.45 * eff));
    SimDraw.drawLabel(ctx,
      `harvest: ${barley} kg barley · ${wheat} kg wheat`,
      x + 190, 372, { bg: c.panelBg, color: eff >= 1 ? c.success : c.error });

    // status strip
    ctx.font = '600 12px Inter, system-ui';
    ctx.fillStyle = eff >= 1 ? c.success : c.error;
    ctx.textAlign = 'center';
    ctx.fillText(eff >= 1 ? 'every factor employed' : 'tractor parked · worker asleep · land half-worked',
      x + 190, 404);

    // mini frontier marker
    const mx = x + 190, my = 448;
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.accent, 0.85);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(mx - 60, my - 20);
    ctx.quadraticCurveTo(mx - 30, my + 34, mx + 60, my + 34);
    ctx.stroke();
    const dotT = 0.35 + eff * 0.65;
    const dpx = mx - 60 + 120 * dotT;
    const dpy = my - 20 + 54 * dotT * dotT;
    this._dot(ctx, dpx, dpy, eff >= 1 ? c.success : c.error, 5);
    ctx.restore();

    ctx.restore();
  }

  _dot(ctx, x, y, color, r) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  _drawTractor(ctx, x, y, asleep) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = asleep ? c.error : c.success;
    ctx.fillStyle = asleep ? SimDraw.withAlpha(c.error, 0.25) : SimDraw.withAlpha(c.success, 0.25);
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, x - 20, y - 12, 28, 14, 3);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 14, y - 8, 8, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 13, y + 6, 5, 0, Math.PI * 2);
    ctx.arc(x + 14, y + 6, 5, 0, Math.PI * 2);
    ctx.fill();
    if (asleep) {
      ctx.font = '700 12px Inter, system-ui';
      ctx.fillStyle = c.error;
      ctx.textAlign = 'center';
      ctx.fillText('z z', x + 14, y - 22);
    }
    ctx.restore();
  }

  _drawWorker(ctx, x, y, sleeping) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = sleeping ? SimDraw.withAlpha(c.label, 0.45) : c.label;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 12, 5, 0, Math.PI * 2);
    ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 6);
    ctx.moveTo(x - 6, y + 14);
    ctx.lineTo(x, y + 6); ctx.lineTo(x + 6, y + 14);
    ctx.stroke();
    if (sleeping) {
      ctx.font = '600 10px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.5);
      ctx.textAlign = 'center';
      ctx.fillText('z z', x + 10, y - 14);
    }
    ctx.restore();
  }
}
