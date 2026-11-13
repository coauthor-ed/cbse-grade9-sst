import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * TwoEnvelopesScene — companion to blk-l02-s08 (chapter wrap for L02).
 * ₹1,000 in two possible envelopes: A buys football shoes today; B saves
 * toward a tennis racket. Beats open the choice, then advance a clock of
 * months. Free play: a month slider shows what each path holds — one path's
* gain is always drawn next to the other path's absence.
 */

const W = 900;
const H = 560;
const PRINCIPAL = 1000;

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
  { type: 'choice', caption: '₹1,000. Envelope A spends it today. Envelope B keeps it.' },
  { type: 'clock', caption: 'Months pass. Each envelope tells a different story.' },
  { type: 'freeplay', caption: 'Scrub the months. Watch both roads at once.' },
];

const STEP_CHOICE = 0;
const STEP_CLOCK = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_CHOICE, dwellMs: null }],
  [{ idx: STEP_CLOCK, dwellMs: null }],
  [{ idx: STEP_FREEPLAY, dwellMs: null }],
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

const rupee = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export class TwoEnvelopesScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Two envelopes labelled spend and save. The spend envelope turns into football shoes that wear with time; ' +
    'the save envelope grows month by month towards a tennis racket. A month slider advances both stories side ' +
    'by side, showing what each chosen road costs the other.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'months', label: 'Months later:', min: 0, max: 6, step: 1, value: 0 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.months = 0;

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
    if (id === 'months') return locked;
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
    if (this.stepIndex === STEP_CLOCK && this.months === 0) this.months = 3; // auto-advance story
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') {
      this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1);
      this._stepEnterTime = 0;
      if (this.stepIndex === STEP_CLOCK && this.months === 0) this.months = 3;
    } else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id === 'months') this.months = Math.round(Number(value));
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

  _envelope(ctx, cx, cy, title, color, alpha) {
    const c = this.colors;
    ctx.save();
    ctx.globalAlpha = alpha;
    roundRectPath(ctx, cx - 90, cy - 60, 180, 120, 10);
    ctx.fillStyle = c.panelBg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 90, cy - 60);
    ctx.lineTo(cx, cy + 8);
    ctx.lineTo(cx + 90, cy - 60);
    ctx.stroke();
    ctx.font = '700 14px Inter, system-ui';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, cy - 78);
    ctx.restore();
  }

  _shoe(ctx, x, y, s, wearFrac, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-26, 8);
    ctx.quadraticCurveTo(-28, -8, -10, -10);
    ctx.quadraticCurveTo(2, -12, 8, -22);
    ctx.lineTo(16, -22);
    ctx.quadraticCurveTo(26, -20, 27, 8);
    ctx.closePath();
    ctx.stroke();
    // sole wears away with time
    ctx.strokeStyle = SimDraw.withAlpha(color, 1 - wearFrac * 0.75);
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-27, 10);
    ctx.lineTo(28, 10);
    ctx.stroke();
    ctx.restore();
  }

  _racket(ctx, x, y, s, ghost, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = ghost ? SimDraw.withAlpha(color, 0.35) : color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, -18, 13, 20, 0, 0, Math.PI * 2);
    ctx.moveTo(-9, -36); ctx.lineTo(9, 0);
    ctx.moveTo(9, -36); ctx.lineTo(-9, 0);
    ctx.moveTo(0, 2); ctx.lineTo(0, 30);
    ctx.stroke();
    ctx.restore();
  }

  _coinStack(ctx, x, y, n, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      roundRectPath(ctx, x - 16, y - i * 7 - 7, 32, 6, 3);
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';

    let months = freeplay ? this.months : this.stepIndex >= STEP_CLOCK ? this.months : 0;
    const appear = cruise(clamp01(this._stepEnterTime / 0.8));

    // ---- Envelope A ----
    const ax = W / 2 - 210, ay = 250;
    this._envelope(ctx, ax, ay, 'A · SPEND TODAY', c.error, appear);
    if (months === 0) {
      ctx.save();
      ctx.globalAlpha = appear;
      ctx.font = '700 15px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(`${rupee(PRINCIPAL)} inside`, ax, ay + 88);
      ctx.restore();
    } else {
      const wear = clamp01(months / 6);
      ctx.save();
      ctx.globalAlpha = appear;
      this._shoe(ctx, ax, ay + 40, 1.5, wear, c.error);
      ctx.font = '600 12.5px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(`football shoes · ${months} month${months > 1 ? 's' : ''} old`, ax, ay + 92);
      ctx.fillStyle = c.error;
      ctx.fillText(`${rupee(PRINCIPAL)} spent — gone`, ax, ay + 114);
      ctx.restore();
    }

    // ---- Envelope B ----
    const bx = W / 2 + 210, by = 250;
    this._envelope(ctx, bx, by, 'B · SAVE', c.success, appear);
    if (months === 0) {
      ctx.save();
      ctx.globalAlpha = appear;
      ctx.font = '700 15px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(`${rupee(PRINCIPAL)} waiting`, bx, by + 88);
      ctx.restore();
    } else {
      const grown = PRINCIPAL * (1 + months * 0.01);
      ctx.save();
      ctx.globalAlpha = appear;
      this._coinStack(ctx, bx - 40, by + 66, Math.min(6, months), c.success);
      ctx.font = '600 12.5px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(`${rupee(grown)} and counting`, bx + 24, by + 84);
      // racket still missing until fully saved
      const ready = months >= 6;
      this._racket(ctx, bx + 70, by + 44, 0.9, !ready, ready ? c.success : c.accent);
      ctx.fillStyle = ready ? c.success : c.warning;
      ctx.fillText(ready ? 'racket within reach' : 'racket not yet', bx + 70, by + 92);
      ctx.restore();
    }

    // middle contrast marker
    if (months > 0) {
      ctx.save();
      ctx.globalAlpha = appear * 0.9;
      ctx.font = '600 13px Inter, system-ui';
      ctx.fillStyle = c.warning;
      ctx.textAlign = 'center';
      ctx.fillText('A has shoes, no money.', W / 2, 120);
      ctx.fillText('B has money, no shoes.', W / 2, 144);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, W / 2, 36);
    if (freeplay) {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
      ctx.fillText('Whichever envelope opens, the other one closes.', W / 2, H - 16);
    }
    ctx.restore();
  }
}
