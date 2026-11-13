import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * FieldSplitScene — companion to blk-l02-s05. The farmer's single plot,
 * 10 hectares, currently all wheat. Beats show the whole field under wheat
 * and then a slice converting to barley. Free play: a slider decides how
 * many hectares switch to barley; the converted area is drawn over the
 * wheat with a "wheat given up" tag and live totals.
 */

const W = 900;
const H = 560;

const TOTAL_HA = 10;
const DEFAULT_BARLEY_HA = 3;

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  error:    ['--sim-error', '#f87171'],
  warning:  ['--sim-warning', '#fbbf24'],
  water:    ['--sim-water', '#38bdf8'],
};

const STEPS = [
  { type: 'wholeWheat', caption: 'One plot. Ten hectares. All wheat.' },
  { type: 'convert', caption: 'Every hectare switched to barley is a hectare wheat loses.' },
  { type: 'freeplay', caption: 'Move the boundary yourself — read what each hectare costs.' },
];

const STEP_WHOLE = 0;
const STEP_CONVERT = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_WHOLE, dwellMs: null }],
  [{ idx: STEP_CONVERT, dwellMs: null }],
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

export class FieldSplitScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'The farmer\'s ten-hectare plot drawn as a strip of wheat fields. A slider converts hectares to barley one ' +
    'at a time; the converted hectares are overlaid and tagged as wheat given up, with live totals for both crops.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'barleyHa', label: 'Hectares to barley:', min: 0, max: TOTAL_HA, step: 1, value: DEFAULT_BARLEY_HA },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.barleyHa = DEFAULT_BARLEY_HA;

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
    if (id === 'barleyHa') return locked;
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
    else if (id === 'barleyHa') this.barleyHa = Math.round(Number(value));
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

  _drawPlotStrip(ctx, x, y, w, h, barleyHa) {
    const c = this.colors;
    const cellW = w / TOTAL_HA;
    for (let i = 0; i < TOTAL_HA; i++) {
      const isBarley = i < barleyHa;
      // soil
      ctx.save();
      roundRectPath(ctx, x + i * cellW + 3, y + 3, cellW - 6, h - 6, 6);
      ctx.fillStyle = isBarley ? SimDraw.shade('#8a6b2f', -0.25) : '#5d4a23';
      ctx.fill();
      ctx.restore();

      // plants
      const rows = 3, cols = 3;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const px = x + i * cellW + cellW * (col + 1) / (cols + 1);
          const py = y + h * (r + 1) / (rows + 1);
          this._drawPlant(ctx, px, py, isBarley ? c.warning : c.success, isBarley);
        }
      }
    }
    // boundary line
    if (barleyHa > 0 && barleyHa < TOTAL_HA) {
      const bx = x + barleyHa * cellW;
      ctx.save();
      ctx.strokeStyle = c.error;
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(bx, y - 14);
      ctx.lineTo(bx, y + h + 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.font = '600 11.5px Inter, system-ui';
      ctx.fillStyle = c.error;
      ctx.textAlign = 'center';
      ctx.fillText('wheat given up →', bx - 78, y - 22);
      ctx.textAlign = 'left';
      ctx.fillStyle = c.warning;
      ctx.fillText('← barley moves in', bx + 12, y - 22);
      ctx.restore();
    }
  }

  _drawPlant(ctx, x, y, color, tall) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y - (tall ? 12 : 9));
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x - 4, y - 8);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x + 4, y - 8);
    ctx.stroke();
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];

    let barleyHa = 0;
    if (this.stepIndex === STEP_WHOLE) barleyHa = 0;
    else if (this.stepIndex === STEP_CONVERT) {
      barleyHa = Math.round(cruise(clamp01((this._stepEnterTime - 0.4) / 1.6)) * DEFAULT_BARLEY_HA);
    } else barleyHa = this.barleyHa;

    const fx = 60, fy = 150, fw = W - 120, fh = 190;
    SimDraw.drawPanel(ctx, fx - 20, fy - 60, fw + 40, fh + 130, { bg: c.panelBg, radius: 14, stroke: SimDraw.withAlpha(c.accent, 0.45), lineWidth: 1.5 });

    this._drawPlotStrip(ctx, fx, fy, fw, fh, barleyHa);

    // hectare ruler
    ctx.save();
    ctx.font = '500 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
    ctx.textAlign = 'center';
    const cellW = fw / TOTAL_HA;
    for (let i = 0; i <= TOTAL_HA; i++) {
      ctx.fillText(String(i), fx + i * cellW, fy + fh + 26);
    }
    ctx.font = '600 12px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText('hectares of the same plot', W / 2, fy + fh + 48);
    ctx.restore();

    // legend + totals
    const ly = 470;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 15px Inter, system-ui';
    ctx.fillStyle = c.warning;
    ctx.fillText(`Barley: ${barleyHa} ha`, W / 2 - 170, ly);
    ctx.fillStyle = c.success;
    ctx.fillText(`Wheat keeps: ${TOTAL_HA - barleyHa} ha`, W / 2 + 40, ly);
    if (barleyHa > 0) {
      ctx.font = '600 13px Inter, system-ui';
      ctx.fillStyle = c.error;
      ctx.fillText(`${barleyHa} ha of wheat sacrificed`, W / 2 + 250, ly);
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, W / 2, 36);
    ctx.restore();
  }
}
