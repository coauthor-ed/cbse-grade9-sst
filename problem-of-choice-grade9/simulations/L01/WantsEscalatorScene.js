import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * WantsEscalatorScene — companion to blk-l01-s05 (recall of the upgrade-trail
 * prediction). A climber rides an escalator whose rungs are wants: bicycle →
 * motorbike → car → … Each satisfied want reveals the next one further up.
 * The top of the escalator is never drawn — there isn't one. Free play adds
 * a "climb" button that satisfies the current want and reveals the next.
 */

const W = 900;
const H = 560;

const RUNGS = [
  { label: 'Bicycle', icon: 'bike' },
  { label: 'Motorbike', icon: 'moto' },
  { label: 'Car', icon: 'car' },
  { label: '…', icon: 'q' },
];

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  warning:  ['--sim-warning', '#fbbf24'],
};

const STEPS = [
  { type: 'first', caption: 'One want satisfied: a bicycle.' },
  { type: 'reveal', caption: 'Satisfied, it points to the next want.' },
  { type: 'noTop', caption: 'The trail keeps regenerating — there is no top rung in sight.' },
  { type: 'freeplay', caption: 'Climb as long as you like. The next want is always waiting.' },
];

const STEP_FIRST = 0;
const STEP_REVEAL = 1;
const STEP_NOTOP = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_FIRST, dwellMs: 1000 }, { idx: STEP_REVEAL, dwellMs: null }],
  [{ idx: STEP_NOTOP, dwellMs: null }],
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

export class WantsEscalatorScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'An escalator of wants. A climber stands on the bicycle rung; above it appear a motorbike rung, then a car ' +
    'rung, then an unfinished dotted rung. Climbing satisfies the current want and reveals the next one, and the ' +
    'escalator never shows a top.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'climb', label: 'Satisfy this want ↑' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this._climbCount = 0;
    this._climbAnim = 1; // 1 = settled

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
    if (id === 'climb') return locked;
    return false;
  }

  onBeatChange(beatIndex) {
    this._lessonLinked = true;
    const clamped = Math.max(0, Math.min(beatIndex, BEAT_STEP_MAP.length - 1));
    const chain = BEAT_STEP_MAP[clamped];
    this._beatChain = chain;
    this._beatChainPos = 0;
    this._beatChainDwell = chain[0].dwellMs != null ? chain[0].dwellMs / 1000 : null;
    this._jumpToStep(chain[0].idx);
  }

  _jumpToStep(i) {
    this.stepIndex = Math.max(0, Math.min(STEPS.length - 1, i));
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') this._jumpToStep(this.stepIndex + 1);
    else if (id === 'prev') this._jumpToStep(this.stepIndex - 1);
    else if (id === 'climb') {
      if (this._climbAnim >= 1) { this._climbCount++; this._climbAnim = 0; }
    }
  }

  _tick(ctx, dt) {
    this._stepEnterTime += dt;
    if (this._climbAnim < 1) this._climbAnim = Math.min(1, this._climbAnim + dt / 1.4);

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

  _rungY(k, baseY, gap) {
    // rungs climb as the student satisfies wants; k counts satisfied wants
    return baseY - (k - this._climbCount - this._climbAnim) * gap;
  }

  _drawIcon(ctx, x, y, kind, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    switch (kind) {
      case 'bike':
        ctx.arc(x - 10, y + 7, 6, 0, Math.PI * 2);
        ctx.moveTo(x + 16, y + 7); ctx.arc(x + 10, y + 7, 6, 0, Math.PI * 2);
        ctx.moveTo(x - 10, y + 7); ctx.lineTo(x - 2, y - 6); ctx.lineTo(x + 10, y - 6);
        ctx.moveTo(x + 10, y - 6); ctx.lineTo(x + 10, y + 7);
        break;
      case 'moto':
        ctx.arc(x - 11, y + 7, 6, 0, Math.PI * 2);
        ctx.moveTo(x + 17, y + 7); ctx.arc(x + 11, y + 7, 6, 0, Math.PI * 2);
        ctx.moveTo(x - 11, y + 7); ctx.lineTo(x - 3, y - 7); ctx.lineTo(x + 8, y - 7);
        ctx.moveTo(x + 8, y - 7); ctx.lineTo(x + 11, y + 7);
        break;
      case 'car':
        roundRectPath(ctx, x - 16, y - 6, 32, 11, 4);
        ctx.moveTo(x - 8, y - 6); ctx.lineTo(x - 3, y - 13); ctx.lineTo(x + 7, y - 13); ctx.lineTo(x + 10, y - 6);
        break;
      default:
        ctx.font = '700 18px Inter, system-ui';
        ctx.fillText('?', x - 4, y + 5);
        ctx.font = '600 12px Inter, system-ui';
    }
    ctx.stroke();
    // wheels fill
    if (kind === 'bike' || kind === 'moto' || kind === 'car') {
      ctx.beginPath();
      ctx.arc(x - 10, y + 7, 2, 0, Math.PI * 2);
      ctx.arc(x + 10, y + 7, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];

    const baseX = W / 2 - 60;
    const baseY = 470;
    const gap = 108;

    // escalator stringer (a rising rail, no top)
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.accent, 0.5);
    ctx.lineWidth = 4;
    ctx.setLineDash(step.type === 'noTop' || step.type === 'freeplay' ? [] : []);
    ctx.beginPath();
    ctx.moveTo(120, baseY + 30);
    ctx.lineTo(W - 160, 40);
    ctx.stroke();
    ctx.restore();

    // visible rungs: index 0..3, each with its own reveal progress
    const revealBase = this.stepIndex === STEP_FIRST ? 1 : this.stepIndex === STEP_REVEAL ? 2 : RUNGS.length;
    for (let k = 0; k < RUNGS.length; k++) {
      const y = this._rungY(k, 370, gap);
      if (y < 20 || y > H) continue;
      const shown = k < revealBase ? 1 : 0;
      const isNext = k === Math.min(this._climbCount + 1, RUNGS.length - 1);
      const satisfied = k < this._climbCount;
      const alpha = shown * (satisfied ? 0.55 : 1);
      if (alpha < 0.02) continue;

      const x = baseX + k * 118;
      ctx.save();
      ctx.globalAlpha = alpha;
      // rung plank
      ctx.strokeStyle = satisfied ? SimDraw.withAlpha(c.success, 0.8) : isNext ? c.accent : SimDraw.withAlpha(c.label, 0.35);
      ctx.lineWidth = satisfied ? 3 : 4;
      if (k === RUNGS.length - 1) ctx.setLineDash([7, 6]);
      ctx.beginPath();
      ctx.moveTo(x - 46, y + 16);
      ctx.lineTo(x + 46, y + 16);
      ctx.stroke();
      ctx.setLineDash([]);

      this._drawIcon(ctx, x, y - 6, RUNGS[k].icon, satisfied ? c.success : isNext ? c.accent : SimDraw.withAlpha(c.label, 0.6));
      ctx.font = '600 12.5px Inter, system-ui';
      ctx.fillStyle = satisfied ? c.success : isNext ? c.accent : SimDraw.withAlpha(c.label, 0.6);
      ctx.textAlign = 'center';
      ctx.fillText(satisfied ? `${RUNGS[k].label} ✓` : RUNGS[k].label, x, y + 34);
      ctx.restore();

      // "next want" bubble on the rung above the satisfied one
      if (isNext && this._climbCount > 0 && this._climbAnim >= 0.6 && k < RUNGS.length - 1) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.font = '600 12px Inter, system-ui';
        ctx.fillStyle = c.warning;
        ctx.textAlign = 'center';
        ctx.fillText('now I want…', x, y - 26);
        ctx.restore();
      }
    }

    // climber on current rung
    const cy = this._rungY(Math.min(this._climbCount, RUNGS.length - 1), 350, gap) + 16;
    const cx = baseX + Math.min(this._climbCount, RUNGS.length - 1) * 118;
    ctx.save();
    this._drawClimber(ctx, cx, cy - 26);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(step.caption, W / 2, 36);
    if (step.type === 'freeplay') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
      ctx.fillText('Needs run out. Wants climb on.', W / 2, H - 16);
    }
    ctx.restore();
  }

  _drawClimber(ctx, x, y) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = c.label;
    ctx.fillStyle = c.label;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y - 14, 6.5, 0, Math.PI * 2); // head
    ctx.moveTo(x, y - 7);
    ctx.lineTo(x, y + 8); // body
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x - 8, y + 4); // arms
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x + 8, y + 4);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x - 6, y + 18); // legs
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x + 6, y + 18);
    ctx.stroke();
    ctx.restore();
  }
}
