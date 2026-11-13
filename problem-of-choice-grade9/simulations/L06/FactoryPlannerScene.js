import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * FactoryPlannerScene — companion to blk-l06-s01 and blk-l06-s03. Two ways
 * to fill the same school-uniform order: four tailors (labour-intensive) or
 * a leased embroidery machine plus one operator (capital-intensive). Beats
 * reveal the two lines, then their daily cost tags; free play exposes wage
 * and rent sliders so the student can find the crossover point themselves.
 */

const W = 900;
const H = 620;

const WORKERS = 4;
const MACHINE_OUTPUT_BOOST = 1; // equal output assumption stated on-canvas

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  error:    ['--sim-error', '#f87171'],
  warning:  ['--sim-warning', '#fbbf24'],
  costTagBg: ['--sim-series-1', '#0f1623'],
};

const STEPS = [
  { type: 'routes', caption: 'Same order. Two very different assembly lines.' },
  { type: 'costs', caption: 'Each route carries a daily price tag.' },
  { type: 'freeplay', caption: 'Move wages or rent — watch the winner flip.' },
];

const STEP_ROUTES = 0;
const STEP_COSTS = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_ROUTES, dwellMs: null }],
  [{ idx: STEP_COSTS, dwellMs: null }],
  // third beat (used by blk-l06-s03's free-play instruction) unlocks the sliders
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

export class FactoryPlannerScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Two garment lines side by side filling the same uniform order: four tailors sewing by hand on the left, ' +
    'one embroidery machine with a single operator on the right. Cost tags compare the daily wage bill against ' +
    'the daily lease, crowning whichever line is cheaper; sliders for daily wage and machine rent let students ' +
    'find the point where the cheaper option flips.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'wage', label: 'Daily wage per tailor (₹):', min: 200, max: 900, step: 25, value: 350 },
    { type: 'slider', id: 'rent', label: 'Machine lease per day (₹, incl. operator):', min: 700, max: 2600, step: 50, value: 1600 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.wage = 350;
    this.rent = 1600;

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
    if (id === 'wage' || id === 'rent') return locked || this.stepIndex < STEP_COSTS;
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
    else if (id === 'wage') this.wage = Math.round(Number(value));
    else if (id === 'rent') this.rent = Math.round(Number(value));
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

    // header: shared order
    const c = this.colors;
    SimDraw.drawPanel(ctx, W / 2 - 210, 54, 420, 44, { bg: c.panelBg, radius: 10, stroke: SimDraw.withAlpha(c.accent, 0.5), lineWidth: 1.5 });
    ctx.save();
    ctx.font = '700 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText('ORDER: 40 SCHOOL UNIFORMS — BOTH LINES FINISH IN A DAY', W / 2, 81);
    ctx.restore();

    this._drawLine(ctx, 60, 'TAILOR LINE · labour-intensive', true);
    this._drawLine(ctx, W - 380, 'MACHINE LINE · capital-intensive', false);

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 32);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '600 12px Inter, system-ui';
      ctx.fillStyle = c.warning;
      const crossW = Math.ceil(this.rent / WORKERS / 25) * 25;
      if (crossW >= 200 && crossW <= 900) {
        ctx.fillText(`crossover: below ₹${crossW} a day, hands win again`, W / 2, H - 14);
      }
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _drawLine(ctx, x, title, isLabour) {
    const c = this.colors;
    const bw = 320, bh = 430, by = 130;
    const labourCost = WORKERS * this.wage;
    const machineCost = this.rent;
    const myCost = isLabour ? labourCost : machineCost;
    const otherCost = isLabour ? machineCost : labourCost;
    const winning = myCost < otherCost;
    const tied = myCost === otherCost;
    const showCosts = this.stepIndex >= STEP_COSTS;

    SimDraw.drawPanel(ctx, x, by, bw, bh, {
      bg: c.panelBg,
      radius: 14,
      stroke: showCosts ? (tied ? c.warning : winning ? c.success : c.error) : SimDraw.withAlpha(c.accent, 0.45),
      lineWidth: showCosts ? 2.6 : 1.5,
    });

    ctx.save();
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + bw / 2, by + 28);

    if (isLabour) {
      // four tailors at tables
      const pop = cruise(clamp01((this._stepEnterTime - 0.2) / 0.9));
      for (let i = 0; i < WORKERS; i++) {
        const wx = x + 55 + (i % 2) * 110;
        const wy = by + 90 + Math.floor(i / 2) * 105;
        ctx.save();
        ctx.globalAlpha = pop;
        this._tailor(ctx, wx, wy);
        // table
        roundRectPath(ctx, wx - 34, wy + 26, 68, 10, 4);
        ctx.fillStyle = SimDraw.withAlpha(c.accent, 0.35);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = pop;
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.6);
      ctx.fillText(`${WORKERS} skilled tailors`, x + bw / 2, by + bh - 66);
      ctx.restore();
    } else {
      // one machine, one operator
      const pop = cruise(clamp01((this._stepEnterTime - 0.45) / 0.9));
      ctx.save();
      ctx.globalAlpha = pop;
      this._machine(ctx, x + bw / 2, by + 165);
      this._tailor(ctx, x + bw / 2 + 92, by + 195, true);
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.6);
      ctx.textAlign = 'center';
      ctx.fillText('1 embroidery machine + 1 operator', x + bw / 2, by + bh - 66);
      ctx.restore();
    }
    ctx.restore();

    // cost tag
    if (showCosts) {
      const p = cruise(clamp01((this._stepEnterTime - 0.4) / 0.7));
      if (p > 0.02) {
        ctx.save();
        ctx.globalAlpha = p;
        SimDraw.drawPanel(ctx, x + 30, by + bh - 52, bw - 60, 38, {
          bg: c.costTagBg,
          radius: 9,
          stroke: tied ? c.warning : winning ? c.success : c.error,
          lineWidth: 1.8,
        });
        ctx.font = '700 15px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = tied ? c.warning : winning ? c.success : c.error;
        ctx.fillText(`₹${myCost.toLocaleString('en-IN')} / day`, x + bw / 2, by + bh - 27);
        ctx.restore();

        if (!tied && this.stepIndex >= STEP_COSTS) {
          ctx.save();
          ctx.globalAlpha = cruise(clamp01((this._stepEnterTime - 0.9) / 0.6));
          ctx.font = '700 13px Inter, system-ui';
          ctx.textAlign = 'center';
          ctx.fillStyle = winning ? c.success : c.error;
          ctx.fillText(winning ? 'cheaper — takes the order' : `loses by ₹${Math.abs(myCost - otherCost).toLocaleString('en-IN')}`, x + bw / 2, by + 56);
          ctx.restore();
        }
      }
    }
  }

  _tailor(ctx, x, y, seated) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = c.label;
    ctx.fillStyle = c.label;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y - 26, 9, 0, Math.PI * 2);
    if (seated) {
      ctx.moveTo(x, y - 17); ctx.lineTo(x, y + 2);
      ctx.moveTo(x, y - 10); ctx.lineTo(x + 14, y - 16);
      ctx.moveTo(x, y + 2); ctx.lineTo(x - 8, y + 14);
      ctx.moveTo(x, y + 2); ctx.lineTo(x + 8, y + 14);
    } else {
      ctx.moveTo(x, y - 17); ctx.lineTo(x, y + 6);
      ctx.moveTo(x, y - 10); ctx.lineTo(x - 12, y - 2);
      ctx.moveTo(x, y - 10); ctx.lineTo(x + 12, y - 2);
      ctx.moveTo(x, y + 6); ctx.lineTo(x - 9, y + 20);
      ctx.moveTo(x, y + 6); ctx.lineTo(x + 9, y + 20);
    }
    ctx.stroke();
    // needle arm motion
    ctx.beginPath();
    ctx.arc(x + 12, y - 2 + Math.sin(this._stepEnterTime * 6 + x) * 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _machine(ctx, x, y) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.4;
    // body
    roundRectPath(ctx, x - 46, y - 24, 80, 42, 6);
    ctx.stroke();
    // arm
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 24);
    ctx.quadraticCurveTo(x - 22, y - 48 + Math.sin(this._stepEnterTime * 5) * 4, x - 6, y - 24);
    ctx.stroke();
    // needle
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 24 + (Math.sin(this._stepEnterTime * 12) > 0 ? 0 : 6));
    ctx.lineTo(x - 14, y + 18);
    ctx.stroke();
    // fabric strip
    ctx.strokeStyle = c.warning;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -this._stepEnterTime * 30;
    ctx.beginPath();
    ctx.moveTo(x - 58, y + 20);
    ctx.lineTo(x + 44, y + 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}
