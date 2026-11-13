import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * TwinBudgetScene — companion to blk-l04-s03. Two mirrored ledgers: a
 * family's monthly income and a nation's tax revenue. Beats reveal the
 * parallel structure (essentials ↔ welfare & infrastructure, extras ↔
 * other spending, savings ↔ reserves). Free play: one slider sets the
 * essentials share for both at once — the same allocation logic, two
 * very different scales.
 */

const W = 900;
const H = 560;
const INCOME = 30000;      // family, ₹/month
const REVENUE = 9000000;   // nation, ₹ lakh shorthand handled in label

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
  { type: 'family', caption: 'A family splits its monthly income.' },
  { type: 'nation', caption: 'A country splits its tax revenue the same way.' },
  { type: 'mirror', caption: 'Different scale — identical arithmetic of choice.' },
  { type: 'freeplay', caption: 'Move the slider. Both ledgers obey the same rule.' },
];

const STEP_FAMILY = 0;
const STEP_NATION = 1;
const STEP_MIRROR = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_FAMILY, dwellMs: null }],
  [{ idx: STEP_NATION, dwellMs: null }],
  [{ idx: STEP_MIRROR, dwellMs: null }],
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

export class TwinBudgetScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Two side-by-side budget bars. The family bar splits thirty thousand rupees into essentials, extras and ' +
    'savings; the national bar splits tax revenue into welfare and infrastructure, other spending and reserves. ' +
    'One slider sets the essential share for both ledgers together, showing that household management and ' +
    'national budgeting share the same arithmetic.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'essentialsPct', label: 'Essentials share (%):', min: 30, max: 80, step: 5, value: 55 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.essentialsPct = 55;

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
    if (id === 'essentialsPct') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'essentialsPct') this.essentialsPct = Math.round(Number(value));
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

    const ess = this.essentialsPct / 100;
    const extra = 0.65 * (1 - ess); // of remainder
    const save = 1 - ess - extra;

    this._drawLedger(ctx, 60, 'THE SHARMA FAMILY · ₹30,000 a month', [
      { label: 'food, rent, medicines, school', frac: ess, color: c2s(this.colors.success) },
      { label: 'outings, small luxuries', frac: extra, color: c2s(this.colors.warning) },
      { label: 'savings', frac: save, color: c2s(this.colors.accent) },
    ], this.stepIndex >= STEP_FAMILY, (v) => rupee(INCOME * v), true);

    this._drawLedger(ctx, 480, 'THE NATION · tax revenue', [
      { label: 'welfare, health, schools, roads', frac: ess, color: c2s(this.colors.success) },
      { label: 'other departments', frac: extra, color: c2s(this.colors.warning) },
      { label: 'reserves', frac: save, color: c2s(this.colors.accent) },
    ], this.stepIndex >= STEP_NATION, (v) => `₹${(REVENUE * v / 100000).toFixed(1)} L`, false);

    if (this.stepIndex >= STEP_MIRROR) {
      const p = clamp01((this._stepEnterTime - 0.3) / 0.9);
      ctx.save();
      ctx.globalAlpha = p * 0.85;
      ctx.strokeStyle = this.colors.accent;
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(440, 150);
      ctx.quadraticCurveTo(W / 2, 260, 440, 360);
      ctx.stroke();
      ctx.setLineDash([]);
      SimDraw.drawLabel(ctx, 'same split logic', W / 2, 258, { bg: this.colors.panelBg, color: this.colors.accent });
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 36);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.55);
      ctx.fillText('Push the essentials share up and watch both savings shrink.', W / 2, H - 16);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _drawLedger(ctx, x, title, slices, visible, fmt, isFamily) {
    if (!visible) return;
    const c = this.colors;
    const appear = cruise(clamp01((this._stepEnterTime - (isFamily ? 0.2 : 0.3)) / 0.8));

    ctx.save();
    ctx.globalAlpha = appear;
    SimDraw.drawPanel(ctx, x, 90, 360, 380, { bg: c.panelBg, radius: 14, stroke: SimDraw.withAlpha(c.accent, 0.45), lineWidth: 1.5 });
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + 180, 118);

    // stacked horizontal bar
    const bx = x + 26, by = 140, bw = 308, bh = 40;
    let acc = 0;
    slices.forEach((s) => {
      const wseg = bw * s.frac;
      roundRectPath(ctx, bx + acc, by, Math.max(wseg - 2, 2), bh, 6);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = appear * 0.9;
      ctx.fill();
      acc += wseg;
    });
    ctx.globalAlpha = appear;

    // legend rows
    let ly = 220;
    slices.forEach((s) => {
      roundRectPath(ctx, bx, ly - 11, 16, 16, 4);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.font = '600 12px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'left';
      ctx.fillText(s.label, bx + 26, ly + 1);
      ctx.font = '700 12px Inter, system-ui';
      ctx.fillStyle = s.color;
      ctx.textAlign = 'right';
      ctx.fillText(fmt(s.frac), bx + bw, ly + 1);
      ly += 44;
    });
    ctx.restore();
  }
}

function c2s(hex) { return hex; }
