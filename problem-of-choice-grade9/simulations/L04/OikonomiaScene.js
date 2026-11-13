import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * OikonomiaScene — companion to blk-l04-s01. The Greek word oikonomia
 * splits into its two roots — oikos (household) and nemein (management) —
 * then the little household icon swells into a parliament building: the
 * same management problem, scaled up to a nation.
 */

const W = 900;
const H = 560;

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  warning:  ['--sim-warning', '#fbbf24'],
};

const STEPS = [
  { type: 'word', caption: 'One ancient Greek word: oikonomia.' },
  { type: 'split', caption: 'It is two roots holding hands.' },
  { type: 'scale', caption: 'Manage a household well, and you are already doing economics. Nations just do it louder.' },
  { type: 'freeplay', caption: 'Replay the split as many times as you like.' },
];

const STEP_WORD = 0;
const STEP_SPLIT = 1;
const STEP_SCALE = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_WORD, dwellMs: null }],
  [{ idx: STEP_SPLIT, dwellMs: null }],
  [{ idx: STEP_SCALE, dwellMs: null }],
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

export class OikonomiaScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'The Greek word oikonomia appears, then separates into oikos, meaning household, and nemein, meaning ' +
    'management. A small household icon then grows into a parliament building with columns, showing that ' +
    'economics began as household management scaled up to a whole country.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'replay', label: 'Replay the split' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this._replayKick = false;

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
    if (id === 'replay') return locked;
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
    else if (id === 'replay') { this.stepIndex = STEP_SPLIT; this._stepEnterTime = 0; }
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

  _drawHouse(ctx, x, y, s) {
    const c = this.colors;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = c.success;
    ctx.fillStyle = SimDraw.withAlpha(c.success, 0.25);
    ctx.lineWidth = 2.6 / Math.max(s, 0.5);
    // body
    roundRectPath(ctx, -34, -14, 68, 46, 4);
    ctx.fill(); ctx.stroke();
    // roof
    ctx.beginPath();
    ctx.moveTo(-44, -14); ctx.lineTo(0, -44); ctx.lineTo(44, -14);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // door
    roundRectPath(ctx, -8, 8, 16, 24, 3);
    ctx.stroke();
    ctx.restore();
  }

  _drawParliament(ctx, x, y, s) {
    const c = this.colors;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = c.accent;
    ctx.fillStyle = SimDraw.withAlpha(c.accent, 0.22);
    ctx.lineWidth = 2.6 / Math.max(s, 0.5);
    // base
    roundRectPath(ctx, -70, -6, 140, 40, 4);
    ctx.fill(); ctx.stroke();
    // pediment
    ctx.beginPath();
    ctx.moveTo(-80, -8); ctx.lineTo(0, -48); ctx.lineTo(80, -8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // columns
    for (let i = 0; i < 5; i++) {
      const colX = -52 + i * 26;
      roundRectPath(ctx, colX - 5, 0, 10, 28, 2);
      ctx.stroke();
    }
    // steps
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-76 + i * 8, 34 + i * 7);
      ctx.lineTo(76 - i * 8, 34 + i * 7);
      ctx.stroke();
    }
    ctx.restore();
  }

  _word(ctx, text, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `700 ${size}px Inter, system-ui`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';

    const cx = W / 2;

    // ---- full word ----
    const wordAlpha = this.stepIndex >= STEP_SPLIT
      ? clamp01(1 - cruise(clamp01((this._stepEnterTime - 0.2) / 0.9)))
      : cruise(clamp01((this._stepEnterTime - 0.2) / 0.9));
    this._word(ctx, 'oikonomia', cx, 150, 54, c.label, Math.max(wordAlpha, 0));

    // ---- split into roots ----
    if (this.stepIndex >= STEP_SPLIT) {
      const p = cruise(clamp01((this._stepEnterTime - 0.2) / 1.1));
      // left root slides left, right root slides right out of the single word
      const spreadX = 210 * p;
      this._word(ctx, 'oikos', cx - spreadX, 150, 40, c.warning, p);
      this._word(ctx, '+', cx, 150, 34, SimDraw.withAlpha(c.label, 0.6 * p), p);
      this._word(ctx, 'nemein', cx + spreadX, 150, 40, c.accent, p);

      // translations fade in beneath
      if (p > 0.75) {
        const tA = clamp01((p - 0.75) / 0.25);
        this._word(ctx, "'household'", cx - spreadX, 186, 17, SimDraw.withAlpha(c.label, 0.75 * tA), tA);
        this._word(ctx, "'management'", cx + spreadX, 186, 17, SimDraw.withAlpha(c.label, 0.75 * tA), tA);
      }
    }

    // ---- scale up: household → parliament ----
    if (this.stepIndex >= STEP_SCALE) {
      const p = freeplay ? 1 : cruise(clamp01((this._stepEnterTime - 0.3) / 1.8));
      const morph = cruise(p);

      // household shrinks/fades toward left, parliament grows at right
      const houseScale = (1 - 0.55 * morph) * 1.15;
      ctx.save();
      ctx.globalAlpha = clamp01(1 - morph * 1.05);
      this._drawHouse(ctx, cx - 190, 360, houseScale);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = clamp01(morph * 1.1);
      const ps = 0.4 + 0.85 * morph;
      this._drawParliament(ctx, cx + 170, 350, ps);

      // equals sign between them
      ctx.font = '700 30px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.65);
      ctx.textAlign = 'center';
      ctx.fillText('=', cx - 12, 372);

      ctx.font = '600 14px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.fillText('same management problem,', cx, 452);
      ctx.fillText('bigger ledger', cx, 474);
      ctx.restore();

      // connecting arrow of rupee flows
      if (morph > 0.5) {
        ctx.save();
        ctx.globalAlpha = (morph - 0.5) * 2 * 0.6;
        ctx.strokeStyle = c.warning;
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(cx - 130, 352);
        ctx.quadraticCurveTo(cx - 10, 300, cx + 60, 340);
        ctx.stroke();
        ctx.setLineDash([]);
        SimDraw.drawLabel(ctx, 'scarce means · competing wants', cx - 20, 292, { bg: c.panelBg, color: c.warning });
        ctx.restore();
      }
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, cx, 36);
    ctx.restore();
  }
}
