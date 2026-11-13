import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * ShoeFitterScene — companion to blk-l05-s06. Four customers queue up one
 * per beat — a school student, an office-goer, an athlete, someone wanting
 * everyday slippers. Free play: pick a shoe type for each customer slot;
 * the scene scores the match and names what the shoe optimises for.
 */

const W = 900;
const H = 560;

const CUSTOMERS = [
  { id: 'student', label: 'School student', need: 'durable, simple, affordable', best: 'school' },
  { id: 'office', label: 'Office-goer', need: 'polished, formal, comfortable', best: 'office' },
  { id: 'athlete', label: 'Athlete', need: 'grip, light weight, ankle support', best: 'sports' },
  { id: 'daily', label: 'Daily errands', need: 'easy on the feet, easy on the wallet', best: 'casual' },
];

const SHOES = [
  { id: 'school', label: 'School shoes' },
  { id: 'office', label: 'Office leather' },
  { id: 'sports', label: 'Sports shoes' },
  { id: 'casual', label: 'Casual slippers' },
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
  { type: 'q1', caption: 'First in line: a school student.' },
  { type: 'q2', caption: 'Next: an office-goer.' },
  { type: 'q3', caption: 'Then: an athlete.' },
  { type: 'q4', caption: 'And finally: everyday errands.' },
  { type: 'freeplay', caption: 'Fit each customer. One product, four different answers.' },
];

const STEP_Q1 = 0;
const STEP_Q2 = 1;
const STEP_Q3 = 2;
const STEP_Q4 = 3;
const STEP_FREEPLAY = 4;

const BEAT_STEP_MAP = [
  [{ idx: STEP_Q1, dwellMs: null }],
  [{ idx: STEP_Q2, dwellMs: null }],
  [{ idx: STEP_Q3, dwellMs: 1200 }, { idx: STEP_Q4, dwellMs: null }],
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

export class ShoeFitterScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A fitting counter. Customers appear one by one — a school student, an office-goer, an athlete and someone ' +
    'doing daily errands — each with a written need. In free play a picker assigns a shoe type to the current ' +
    'customer and the scene scores the fit, showing which group each kind of shoe is really produced for.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    {
      type: 'select', id: 'shoePick', label: 'Offer this shoe:', options: [
        { value: 'none', label: '— pick —' },
        ...SHOES.map((s) => ({ value: s.id, label: s.label })),
      ],
    },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.shoePick = 'none';

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
    if (id === 'shoePick') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'shoePick') this.shoePick = String(value);
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

    // counter line
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(this.colors.label, 0.4);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 420); ctx.lineTo(W - 60, 420);
    ctx.stroke();
    ctx.restore();

    const freeplay = STEPS[this.stepIndex].type === 'freeplay';
    const visible = freeplay ? CUSTOMERS.length : this.stepIndex + 1;

    CUSTOMERS.forEach((cust, k) => {
      if (k >= visible) return;
      let pop = cruise(clamp01((this._stepEnterTime - 0.15) / 0.7));
      if (!freeplay && k < visible - 1) pop = 1;
      const chosen = freeplay && this.shoePick !== 'none' ? SHOES.find((s) => s.id === this.shoePick) : null;
      const fit = chosen ? (chosen.id === cust.best ? 'good' : 'poor') : null;
      const focus = Boolean(fit);
      this._drawCustomer(ctx, 120 + (k % 4) * 220, 300, cust, pop, focus, fit);
    });

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 34);
    if (freeplay) {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.55);
      ctx.fillText('Offer one shoe to all four — count who walks away unhappy.', W / 2, H - 14);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _drawCustomer(ctx, cx, cy, cust, pop, focus, fit) {
    if (pop <= 0.02) return;
    const c = this.colors;

    ctx.save();
    ctx.globalAlpha = pop;

    // person
    const personColor = focus ? (fit === 'good' ? c.success : c.error) : c.label;
    ctx.strokeStyle = personColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy - 66, 16, 0, Math.PI * 2);
    ctx.moveTo(cx, cy - 50);
    ctx.lineTo(cx, cy + 6);
    ctx.moveTo(cx, cy - 36); ctx.lineTo(cx - 18, cy - 20);
    ctx.moveTo(cx, cy - 36); ctx.lineTo(cx + 18, cy - 20);
    ctx.moveTo(cx, cy + 6); ctx.lineTo(cx - 14, cy + 30);
    ctx.moveTo(cx, cy + 6); ctx.lineTo(cx + 14, cy + 30);
    ctx.stroke();

    // feet/shoes
    this._shoePair(ctx, cx, cy + 40, fit === 'good' ? c.success : fit === 'poor' ? c.error : SimDraw.withAlpha(c.accent, 0.8));

    // name tag + need
    roundRectPath(ctx, cx - 100, cy + 64, 200, 56, 10);
    ctx.fillStyle = c.panelBg;
    ctx.fill();
    ctx.strokeStyle = focus ? c.warning : SimDraw.withAlpha(c.accent, 0.5);
    ctx.lineWidth = focus ? 2.4 : 1.4;
    ctx.stroke();
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(cust.label, cx, cy + 86);
    ctx.font = '500 10px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.65);
    ctx.fillText(cust.need, cx, cy + 106);

    // verdict
    if (fit) {
      SimDraw.drawLabel(ctx,
        fit === 'good' ? `right call — made for ${cust.label.toLowerCase()}s` : 'wrong fit — built for someone else',
        cx, cy - 108, { bg: c.panelBg, color: fit === 'good' ? c.success : c.error });
    }
    ctx.restore();
  }

  _shoePair(ctx, cx, y, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    for (const dx of [-22, 22]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx - 14, y);
      ctx.quadraticCurveTo(cx + dx - 12, y - 9, cx + dx - 2, y - 9);
      ctx.lineTo(cx + dx + 12, y - 4);
      ctx.quadraticCurveTo(cx + dx + 15, y - 2, cx + dx + 14, y);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
}
