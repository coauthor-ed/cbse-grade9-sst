import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * ScarcityFunnelScene — companion to blk-l05-s01. Two rivers — unlimited
 * wants and limited resources — crash into a gate marked SCARCITY, squeeze
 * through CHOICES, then split into three pipes labelled with economics'
* three key questions. Beats advance the flow stage by stage.
 */

const W = 900;
const H = 620;

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  error:    ['--sim-error', '#f87171'],
  warning:  ['--sim-warning', '#fbbf24'],
  inkOnFill: ['--sim-ink-on-fill', '#101a30'],
};

const STEPS = [
  { type: 'rivers', caption: 'Two rivers will not fit through one valley.' },
  { type: 'gate', caption: 'Where they collide, scarcity is born.' },
  { type: 'branch', caption: 'Scarcity forces choices — and choices raise three questions.' },
  { type: 'freeplay', caption: 'Pick a question to trace where it leads.' },
];

const STEP_RIVERS = 0;
const STEP_GATE = 1;
const STEP_BRANCH = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_RIVERS, dwellMs: null }],
  [{ idx: STEP_GATE, dwellMs: null }],
  [{ idx: STEP_BRANCH, dwellMs: null }],
];

const QUESTIONS = [
  { id: 'what', label: 'WHAT to produce?', x: 170 },
  { id: 'how', label: 'HOW to produce?', x: W / 2 },
  { id: 'whom', label: 'FOR WHOM?', x: W - 170 },
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

export class ScarcityFunnelScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A wide river of unlimited wants and a narrow river of limited resources converge on a gate labelled ' +
    'scarcity, pass through a second gate labelled choices, then split into three channels asking what to ' +
    'produce, how to produce, and for whom to produce.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    {
      type: 'select', id: 'questionPick', label: 'Trace:', options: [
        { value: 'none', label: '— pick a question —' },
        ...QUESTIONS.map((q) => ({ value: q.id, label: q.label })),
      ],
    },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.questionPick = 'none';

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
    if (id === 'questionPick') return locked || this.stepIndex < STEP_BRANCH;
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
    else if (id === 'questionPick') this.questionPick = String(value);
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

  _river(ctx, pathFn, width, color, alpha, tOffset) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.setLineDash([16, 12]);
    ctx.lineDashOffset = -(this._stepEnterTime * 40 + tOffset);
    ctx.beginPath();
    pathFn(ctx);
    ctx.stroke();
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';
    const gateP = this.stepIndex >= STEP_GATE ? cruise(clamp01((this._stepEnterTime - 0.2) / 0.8)) : 0;
    const branchP = this.stepIndex >= STEP_BRANCH ? cruise(clamp01((this._stepEnterTime - 0.2) / 0.9)) : 0;

    // ---- rivers ----
    // wants: wide, from top-left; resources: narrow, top-right
    const convergeY = 250;
    this._river(ctx, (g) => {
      g.moveTo(-20, 60);
      g.bezierCurveTo(W * 0.3, 70, W * 0.32, convergeY - 90, W / 2 - 14, convergeY);
    }, 34, c.accent, 0.85, 0);

    const resAlpha = cruise(clamp01((this._stepEnterTime - 0.5) / 0.8));
    this._river(ctx, (g) => {
      g.moveTo(W + 20, 80);
      g.bezierCurveTo(W * 0.72, 92, W * 0.68, convergeY - 100, W / 2 + 14, convergeY);
    }, 18, c.success, 0.85 * resAlpha, 300);

    SimDraw.drawLabel(ctx, 'unlimited wants', 150, 66, { bg: c.panelBg, color: c.accent });
    if (resAlpha > 0.4) SimDraw.drawLabel(ctx, 'limited resources', W - 160, 86, { bg: c.panelBg, color: c.success });

    // ---- gates ----
    if (gateP > 0.02) {
      ctx.save();
      ctx.globalAlpha = gateP;
      // SCARCITY pill
      roundRectPath(ctx, W / 2 - 110, convergeY - 26, 220, 52, 26);
      ctx.fillStyle = c.error;
      ctx.fill();
      ctx.font = '800 22px Inter, system-ui';
      ctx.fillStyle = c.inkOnFill;
      ctx.textAlign = 'center';
      ctx.fillText('SCARCITY', W / 2, convergeY + 8);

      // CHOICES pill below
      if (this.stepIndex >= STEP_GATE) {
        const cy2 = convergeY + 120;
        roundRectPath(ctx, W / 2 - 96, cy2 - 24, 192, 48, 24);
        ctx.fillStyle = c.warning;
        ctx.fill();
        ctx.font = '800 20px Inter, system-ui';
        ctx.fillStyle = '#1f1500';
        ctx.fillText('CHOICES', W / 2, cy2 + 7);
      }
      ctx.restore();
    }

    // ---- three branches ----
    if (branchP > 0.02) {
      const startY = 430;
      QUESTIONS.forEach((q, k) => {
        const p = cruise(clamp01(branchP * 1.4 - k * 0.15));
        if (p <= 0.02) return;
        const focus = freeplay && this.questionPick === q.id;
        const dim = freeplay && this.questionPick !== 'none' && !focus;

        ctx.save();
        ctx.globalAlpha = p * (dim ? 0.35 : 1);
        ctx.strokeStyle = focus ? c.warning : c.accent;
        ctx.lineWidth = focus ? 4 : 2.4;
        ctx.setLineDash([10, 9]);
        ctx.lineDashOffset = -(this._stepEnterTime * 34 + k * 200);
        ctx.beginPath();
        ctx.moveTo(W / 2, 452);
        ctx.quadraticCurveTo(q.x, 480, q.x, 512);
        ctx.stroke();
        ctx.setLineDash([]);

        roundRectPath(ctx, q.x - 118, 514, 236, 54, 12);
        ctx.fillStyle = c.panelBg;
        ctx.fill();
        ctx.strokeStyle = focus ? c.warning : SimDraw.withAlpha(c.accent, 0.65);
        ctx.lineWidth = focus ? 2.6 : 1.6;
        ctx.stroke();
        ctx.font = '700 13.5px Inter, system-ui';
        ctx.fillStyle = focus ? c.warning : c.label;
        ctx.textAlign = 'center';
        ctx.fillText(q.label, q.x, 546);
        ctx.restore();
      });
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, W / 2, 30);
    ctx.restore();
  }
}
