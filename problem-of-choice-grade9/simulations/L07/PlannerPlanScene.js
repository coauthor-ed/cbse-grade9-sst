import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * PlannerPlanScene — companion to blk-l07-s03. A planning office stamps
 * yearly quota cards onto three factories, nails fixed prices to each one,
 * and never consults the demand meter on the wall. Beats reveal the plan,
 * the frozen prices, then a demand surge the plan simply ignores — leaving
 * a shortage sign on the shop window.
 */

const W = 900;
const H = 620;

const FACTORIES = [
  { id: 'umbrella', label: 'Umbrella factory', quota: 1000, price: 120 },
  { id: 'blanket', label: 'Blanket mill', quota: 600, price: 300 },
  { id: 'stove', label: 'Stove works', quota: 400, price: 850 },
];

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
  { type: 'quotas', caption: 'The plan arrives. Every factory gets its number.' },
  { type: 'prices', caption: 'Prices are stamped too — by decree, not by haggling.' },
  { type: 'demand', caption: 'Demand surges. The plan does not hear it.' },
  { type: 'freeplay', caption: 'Push demand around; watch the gap grow or shrink.' },
];

const STEP_QUOTAS = 0;
const STEP_PRICES = 1;
const STEP_DEMAND = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_QUOTAS, dwellMs: null }],
  [{ idx: STEP_PRICES, dwellMs: null }],
  [{ idx: STEP_DEMAND, dwellMs: null }],
  // beat 3 (why the plan can't adapt) hands off to free play
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

export class PlannerPlanScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A central planning board assigns yearly quotas to an umbrella factory, a blanket mill and a stove works, and ' +
    'fixes each product\'s price by decree. A demand meter on the wall can be pushed up in free play, but the plan ' +
    'does not respond — shelves empty and a shortage sign appears while prices stay frozen.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'demandIdx', label: 'Buyers this year (×):', min: 0.5, max: 3, step: 0.25, value: 2 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.demandIdx = 2;

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
    if (id === 'demandIdx') return locked || this.stepIndex < STEP_DEMAND;
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
    else if (id === 'demandIdx') this.demandIdx = Number(value);
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

    // planning office header
    SimDraw.drawPanel(ctx, W / 2 - 230, 50, 460, 46, { bg: this.colors.panelBg, radius: 10, stroke: SimDraw.withAlpha(this.colors.error, 0.55), lineWidth: 1.6 });
    ctx.save();
    ctx.font = '800 15px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.textAlign = 'center';
    ctx.fillText('CENTRAL PLANNING OFFICE · YEAR PLAN', W / 2, 78);
    ctx.restore();

    FACTORIES.forEach((f, k) => {
      let pop = cruise(clamp01((this._stepEnterTime - 0.15 - k * 0.25) / 0.7));
      this._factoryCard(ctx, 70 + k * 260, 130, f, pop, this.stepIndex >= STEP_PRICES ? cruise(clamp01((this._stepEnterTime - 0.8 - k * 0.2) / 0.5)) : 0);
    });

    // demand meter
    const showDemand = this.stepIndex >= STEP_DEMAND || (!this._isBeatLocked() && STEPS[this.stepIndex].type === 'freeplay');
    if (showDemand) {
      const p = cruise(clamp01((this._stepEnterTime - 0.3) / 0.7));
      if (p > 0.02) this._drawDemandMeter(ctx, p);
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 32);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.55);
      ctx.fillText('Quotas move only when the next five-year plan says so.', W / 2, H - 12);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _factoryCard(ctx, x, y, f, pop, stampPop) {
    if (pop <= 0.02) return;
    const c = this.colors;
    const bw = 240, bh = 210;

    ctx.save();
    ctx.globalAlpha = pop;
    SimDraw.drawPanel(ctx, x, y, bw, bh, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.accent, 0.45), lineWidth: 1.5 });

    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(f.label.toUpperCase(), x + bw / 2, y + 28);

    // quota card (stamped)
    if (stampPop > 0.02) {
      ctx.save();
      ctx.translate(x + bw / 2, y + 92);
      ctx.rotate(-0.05);
      ctx.globalAlpha = stampPop;
      roundRectPath(ctx, -80, -26, 160, 52, 8);
      ctx.fillStyle = c.error;
      ctx.fill();
      ctx.font = '800 14px Inter, system-ui';
      ctx.fillStyle = c.inkOnFill;
      ctx.textAlign = 'center';
      ctx.fillText(`QUOTA: ${f.quota}`, 0, 6);
      ctx.restore();

      // fixed price tag
      ctx.save();
      ctx.globalAlpha = stampPop;
      roundRectPath(ctx, x + bw / 2 - 70, y + 138, 140, 34, 7);
      ctx.fillStyle = c.warning;
      ctx.fill();
      ctx.font = '800 13px Inter, system-ui';
      ctx.fillStyle = '#1f1500';
      ctx.textAlign = 'center';
      ctx.fillText(`PRICE FIXED ₹${f.price}`, x + bw / 2, y + 160);
      ctx.restore();
    }
    ctx.restore();
  }

  _drawDemandMeter(ctx, p) {
    const c = this.colors;
    const mx = W / 2 - 170, my = H - 190;

    ctx.save();
    ctx.globalAlpha = p;
    SimDraw.drawPanel(ctx, mx, my, 340, 120, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.accent, 0.5), lineWidth: 1.5 });
    ctx.font = '700 12px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'left';
    ctx.fillText('WHAT BUYERS WANT THIS YEAR', mx + 16, my + 24);

    // gauge
    const gx = mx + 60, gy = my + 88, gr = 44;
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.25);
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, Math.PI, Math.PI * 2);
    ctx.stroke();
    const ang = Math.PI + ((this.demandIdx - 0.5) / 2.5) * Math.PI;
    ctx.strokeStyle = this.demandIdx > 1.05 ? c.error : c.success;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + (gr - 6) * Math.cos(ang), gy + (gr - 6) * Math.sin(ang));
    ctx.stroke();
    ctx.font = '800 18px Inter, system-ui';
    ctx.fillStyle = this.demandIdx > 1.05 ? c.error : c.success;
    ctx.textAlign = 'left';
    ctx.fillText(`${this.demandIdx.toFixed(2)}×`, gx + 130, gy - 6);

    if (this.demandIdx > 1.05) {
      ctx.font = '700 12.5px Inter, system-ui';
      ctx.fillStyle = c.error;
      ctx.fillText('plan supply unchanged → SHELVES EMPTY', mx + 16, my + 112);
    } else {
      ctx.font = '600 12px Inter, system-ui';
      ctx.fillStyle = c.success;
      ctx.fillText('plan covers demand — for now', mx + 16, my + 112);
    }
    ctx.restore();
  }
}
