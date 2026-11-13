import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * ResourceStrainScene — companion to blk-l02-s02. A central pool holds the
 * four factors of production (land, labour, capital, technology). Beats show
 * the pool, then two projects tugging on it. Free play: a slider splits the
 * pool between the projects — every unit sent to one is gone for the other.
 */

const W = 900;
const H = 560;

const FACTORS = [
  { id: 'land', label: 'Land', icon: 'hill' },
  { id: 'labour', label: 'Labour', icon: 'person' },
  { id: 'capital', label: 'Capital', icon: 'machine' },
  { id: 'tech', label: 'Technology', icon: 'chip' },
];

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
  { type: 'pool', caption: 'Four factors, one finite pool.' },
  { type: 'tug', caption: 'Two projects pull on the same pool.' },
  { type: 'freeplay', caption: 'Split the factors. What one project gains, the other loses.' },
];

const STEP_POOL = 0;
const STEP_TUG = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_POOL, dwellMs: null }],
  [{ idx: STEP_TUG, dwellMs: null }],
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

export class ResourceStrainScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A pool of four factor cards — land, labour, capital and technology — sits between two projects. A slider ' +
    'sends more of the pool to one project and less to the other, showing that the same limited factors cannot ' +
    'fully serve both.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'split', label: 'Pool to Project A (%):', min: 0, max: 100, step: 5, value: 50 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.split = 50;

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
    if (id === 'split') return locked;
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
    else if (id === 'split') this.split = Math.round(Number(value));
    this.requestUiUpdate?.();
  }

  _tick(ctx, dt) {
    this._stepEnterTime += dt;
    if (this._lessonLinked && this._beatChainDwell != null) {
      this._beatChainDwell -= dt;
      if (this._beatChainDwell <= 0) this._beatChainDwell = null;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.colors.bgDeep;
    ctx.fillRect(0, 0, W, H);
    this._drawScene(ctx);
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _drawIcon(ctx, x, y, kind) {
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    switch (kind) {
      case 'hill':
        ctx.moveTo(x - 14, y + 8);
        ctx.quadraticCurveTo(x - 2, y - 12, x + 8, y + 8);
        ctx.moveTo(x - 16, y + 8); ctx.lineTo(x + 16, y + 8);
        break;
      case 'person':
        ctx.arc(x, y - 7, 4.5, 0, Math.PI * 2);
        ctx.moveTo(x - 6, y + 10); ctx.quadraticCurveTo(x, y - 2, x + 6, y + 10);
        break;
      case 'machine':
        roundRectPath(ctx, x - 12, y - 6, 24, 13, 3);
        ctx.moveTo(x - 6, y - 6); ctx.lineTo(x - 3, y - 11); ctx.lineTo(x + 3, y - 11); ctx.lineTo(x + 6, y - 6);
        break;
      default:
        roundRectPath(ctx, x - 9, y - 9, 18, 18, 3);
        ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.lineTo(x - 4, y + 4); ctx.closePath();
        break;
    }
    ctx.stroke();
    ctx.restore();
  }

  _factorCard(ctx, cx, cy, f, alpha) {
    const c = this.colors;
    ctx.save();
    ctx.globalAlpha = alpha;
    SimDraw.drawPanel(ctx, cx - 52, cy - 26, 104, 52, { bg: c.panelBg, radius: 9, stroke: SimDraw.withAlpha(c.accent, 0.55), lineWidth: 1.4 });
    ctx.fillStyle = c.accent;
    this._drawIcon(ctx, cx, cy - 8, f.icon);
    ctx.font = '600 12px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(f.label, cx, cy + 20);
    ctx.restore();
  }

  _projectBox(ctx, x, y, title, sub, shareFrac, color) {
    const c = this.colors;
    SimDraw.drawPanel(ctx, x, y, 210, 120, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(color, 0.6), lineWidth: 1.6 });
    ctx.save();
    ctx.font = '700 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + 105, y + 30);
    ctx.font = '500 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.6);
    ctx.fillText(sub, x + 105, y + 48);

    // received-share bar
    const bw = 170, bh = 16;
    roundRectPath(ctx, x + 20, y + 68, bw, bh, 8);
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.12);
    ctx.fill();
    roundRectPath(ctx, x + 20, y + 68, Math.max(2, bw * shareFrac), bh, 8);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font = '700 12px Inter, system-ui';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(shareFrac * 100)}%`, x + 105, y + 106);
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';

    // central pool
    const px = W / 2 - 250, py = 70, pw = 500, ph = 150;
    SimDraw.drawPanel(ctx, px, py, pw, ph, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.accent, 0.5), lineWidth: 1.5 });
    ctx.save();
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.75);
    ctx.textAlign = 'center';
    ctx.fillText('THE POOL OF FACTORS', W / 2, py + 26);
    ctx.restore();

    FACTORS.forEach((f, k) => {
      let alpha = cruise(clamp01((this._stepEnterTime - k * 0.25) / 0.6));
      if (step.type !== 'pool' && freeplay) {
        // cards drift toward A or B by split
        alpha = 1;
      }
      this._factorCard(ctx, px + pw * (k + 1) / 5, py + 88, f, step.type !== 'pool' ? 1 : alpha);
    });

    if (this.stepIndex >= STEP_TUG) {
      const p = clamp01(this._stepEnterTime / 0.6);
      const toA = freeplay ? this.split / 100 : 0.5;
      const aShare = 0.15 + toA * 0.85;
      const bShare = 0.15 + (1 - toA) * 0.85;

      // flow arrows
      const swayA = freeplay ? 0 : Math.sin(this._stepEnterTime * 3) * 6;
      ctx.save();
      ctx.globalAlpha = freeplay ? 0.9 : 0.55;
      ctx.lineWidth = 3 + aShare * 4;
      ctx.strokeStyle = c.success;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 90, py + ph + 8);
      ctx.quadraticCurveTo(240 + swayA, 320, 240, 356);
      ctx.stroke();
      ctx.lineWidth = 3 + bShare * 4;
      ctx.strokeStyle = c.warning;
      ctx.beginPath();
      ctx.moveTo(W / 2 + 90, py + ph + 8);
      ctx.quadraticCurveTo(660 - swayA, 320, 660, 356);
      ctx.stroke();
      ctx.restore();

      this._projectBox(ctx, 135, 360, 'Project A', 'a new health clinic', aShare, c.success);
      this._projectBox(ctx, 555, 360, 'Project B', 'a highway stretch', bShare, c.warning);

      ctx.save();
      ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
      ctx.textAlign = 'center';
      ctx.font = '600 14px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.fillText(step.caption, W / 2, 36);
      if (freeplay && (toA > 0.98 || toA < 0.02)) {
        ctx.font = '500 11px Inter, system-ui';
        ctx.fillStyle = SimDraw.withAlpha(c.label, 0.6);
        ctx.fillText(toA > 0.98 ? 'Project B starves.' : 'Project A starves.', W / 2, H - 16);
      }
      ctx.restore();
    }
  }
}
