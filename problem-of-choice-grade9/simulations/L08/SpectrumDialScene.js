import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * SpectrumDialScene — companion to blk-l08-s02. A spectrum from "all
 * planning" to "all market": real countries drop onto it as markers, none
 * of them at either end. Free play slides an unnamed "your guess" marker
 * anywhere along the line — wherever it lands short of the poles, the
 * verdict reads MIXED.
 */

const W = 900;
const H = 560;

const COUNTRIES = [
  { name: 'North Korea', pos: 0.03 },
  { name: 'Cuba', pos: 0.12 },
  { name: 'China (post-1978)', pos: 0.32 },
  { name: 'India (around 1980)', pos: 0.38 },
  { name: 'India (after 1991)', pos: 0.58 },
  { name: 'Germany', pos: 0.62 },
  { name: 'Sweden', pos: 0.66 },
  { name: 'USA', pos: 0.82 },
  { name: 'Singapore / Hong Kong', pos: 0.9 },
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
  { type: 'poles', caption: 'Two imaginary extremes.' },
  { type: 'countries', caption: 'Now place some real countries.' },
  { type: 'verdict', caption: 'Notice who is missing from the ends: everyone.' },
  { type: 'freeplay', caption: 'Slide a guess of your own — try to find a pure economy.' },
];

const STEP_POLES = 0;
const STEP_COUNTRIES = 1;
const STEP_VERDICT = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_POLES, dwellMs: null }],
  [{ idx: STEP_COUNTRIES, dwellMs: null }],
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

export class SpectrumDialScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A spectrum bar from all planning on the left to all market on the right. Country markers drop onto it — ' +
    'North Korea near the planning end, the United States and Hong Kong toward the market end, India, Germany and ' +
    'Sweden in between — leaving both poles empty. A slider moves an extra guess-marker; anywhere off the poles the ' +
    'label reads mixed.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'guessPos', label: 'Your guess (%):', min: 0, max: 100, step: 1, value: 50 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.guessPos = 50;

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
    if (id === 'guessPos') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'guessPos') this.guessPos = Math.round(Number(value));
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

    this._drawSpectrum(ctx);

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

  _x(posFrac) {
    return 90 + (W - 180) * posFrac;
  }

  _drawSpectrum(ctx) {
    const c = this.colors;
    const y = 260;

    // gradient-ish two-tone bar
    ctx.save();
    roundRectPath(ctx, 90, y - 8, W - 180, 16, 8);
    ctx.fillStyle = c.error;
    ctx.fill();
    roundRectPath(ctx, 90 + (W - 180) * 0.45, y - 8, (W - 180) * 0.55, 16, 8);
    ctx.fillStyle = c.accent;
    ctx.fill();
    // blend zone
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 10; i++) {
      const bx = 90 + (W - 180) * (0.35 + i * 0.02);
      ctx.fillStyle = i % 2 ? c.accent : c.error;
      ctx.fillRect(bx, y - 8, (W - 180) * 0.02, 16);
    }
    ctx.restore();

    // poles
    ctx.save();
    ctx.font = '800 15px Inter, system-ui';
    ctx.fillStyle = c.error;
    ctx.textAlign = 'left';
    ctx.fillText('ALL PLANNING', 90, y - 28);
    ctx.textAlign = 'right';
    ctx.fillStyle = c.accent;
    ctx.fillText('ALL MARKET', W - 90, y - 28);
    ctx.font = '500 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
    ctx.textAlign = 'left';
    ctx.fillText('government decides everything', 90, y + 34);
    ctx.textAlign = 'right';
    ctx.fillText('markets decide everything', W - 90, y + 34);
    ctx.restore();

    // country pins
    if (this.stepIndex >= STEP_COUNTRIES) {
      COUNTRIES.forEach((ctry, k) => {
        const p = cruise(clamp01((this._stepEnterTime - 0.2 - k * 0.18) / 0.5));
        if (p <= 0.02) return;
        const x = this._x(ctry.pos);
        ctx.save();
        ctx.globalAlpha = p;
        // pin
        ctx.strokeStyle = c.success;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x, y - 60 * p);
        ctx.lineTo(x, y - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - 66 * p, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = c.success;
        ctx.fill();

        ctx.font = k % 2 === 0 ? '600 10px Inter, system-ui' : '500 9.5px Inter, system-ui';
        ctx.fillStyle = SimDraw.withAlpha(c.label, 0.8);
        ctx.textAlign = 'center';
        ctx.fillText(ctry.name, x, y - 76 * p - (k % 2 === 0 ? 6 : -8));
        ctx.restore();
      });
    }

    // empty-pole callouts
    if (this.stepIndex >= STEP_VERDICT) {
      const p = cruise(clamp01((this._stepEnterTime - 0.3) / 0.7));
      ctx.save();
      ctx.globalAlpha = p;
      [[90, 'nobody lives here'], [W - 90, 'nor here']].forEach(([x, txt], i) => {
        SimDraw.drawLabel(ctx, txt, i === 0 ? x + 70 : x - 70, y + 64, { bg: c.panelBg, color: c.error });
        ctx.strokeStyle = c.error;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(i === 0 ? x + 4 : x - 4, y + 56);
        ctx.lineTo(i === 0 ? x + 40 : x - 40, y + 58);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();
    }

    // guess marker in freeplay
    if (STEPS[this.stepIndex].type === 'freeplay') {
      const gx = this._x(this.guessPos / 100);
      const mixed = this.guessPos > 2 && this.guessPos < 98;
      ctx.save();
      ctx.strokeStyle = c.warning;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx, y + 44);
      ctx.lineTo(gx, y + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gx, y + 52, 6, 0, Math.PI * 2);
      ctx.fillStyle = c.warning;
      ctx.fill();
      ctx.font = '700 12px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('your guess', gx, y + 74);
      ctx.restore();

      SimDraw.drawLabel(ctx, mixed ? 'MIXED ECONOMY' : this.guessPos <= 2 ? 'pure planned — no real example' : 'pure market — no real example',
        gx, y - 96, { bg: c.panelBg, color: mixed ? c.success : c.error });
    }
  }
}
