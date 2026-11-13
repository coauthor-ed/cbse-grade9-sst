import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * CropSeasonsScene — companion to blk-l05-s04. A district picks a crop mix
 * (sugarcane-heavy / balanced / millet-heavy), then runs five monsoons.
 * Gauges track profit, the water table and soil health season by season:
 * sugarcane pays best now and drains the water fastest; millets pay less
 * and keep the district alive. Free play resets or re-runs.
 */

const W = 900;
const H = 620;
const SEASONS = 5;

const MIXES = [
  { id: 'sugar', label: 'Mostly sugarcane', profit: 100, water: -14, soil: -4 },
  { id: 'mix', label: 'Half and half', profit: 72, water: -6, soil: -1 },
  { id: 'millet', label: 'Mostly millets', profit: 48, water: +2, soil: +2 },
];

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
  { type: 'setup', caption: 'One district. Falling groundwater. Pick a mix.' },
  { type: 'run', caption: 'Five monsoons later…' },
  { type: 'verdict', caption: 'High profit now can quietly spend the future.' },
  { type: 'freeplay', caption: 'Try another mix — the land keeps honest books.' },
];

const STEP_SETUP = 0;
const STEP_RUN = 1;
const STEP_VERDICT = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_SETUP, dwellMs: null }],
  [{ idx: STEP_RUN, dwellMs: null }],
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

export class CropSeasonsScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A five-season field trial. Choosing a crop mix — mostly sugarcane, half and half, or mostly millets — then ' +
    'runs monsoon after monsoon while three gauges move: seasonal profit, the depth of the water table and soil ' +
    'health. Sugarcane profits early while the water table plunges; millets earn less and steady both gauges.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    {
      type: 'select', id: 'mixPick', label: 'Crop mix:', options: MIXES.map((m) => ({ value: m.id, label: m.label })),
    },
    { type: 'button', id: 'runSeasons', label: 'Run 5 monsoons ▶' },
    { type: 'button', id: 'resetField', label: 'Reset' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.mixPick = 'sugar';
    this.season = 0; // seasons completed

    this._lessonLinked = false;
    this._beatChain = null;
    this._beatChainPos = 0;
    this._beatChainDwell = null;
    this._autoRan = false;
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
    if (id === 'mixPick') return locked || this.stepIndex < STEP_FREEPLAY || this.season > 0;
    if (id === 'runSeasons') return locked || this.stepIndex < STEP_FREEPLAY;
    if (id === 'resetField') return locked || this.stepIndex < STEP_FREEPLAY;
    return false;
  }

  onBeatChange(beatIndex) {
    this._lessonLinked = true;
    const clamped = Math.max(0, Math.min(beatIndex, BEAT_STEP_MAP.length - 1));
    const chain = BEAT_STEP_MAP[clamped];
    this._beatChain = chain;
    this._beatChainPos = 0;
    this._beatChainDwell = chain[0].dwellMs != null ? chain[0].dwellMs / 1000 : null;
    const target = chain[0].idx;
    if (target >= STEP_RUN && !this._autoRan) {
      // auto-run when the run beat arrives
      this.season = SEASONS;
      this._autoRan = true;
    }
    this.stepIndex = target;
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1); this._stepEnterTime = 0; }
    else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id === 'mixPick') { this.mixPick = String(value); this.reset(); }
    else if (id === 'resetField') this.reset();
    else if (id === 'runSeasons') { this.season = SEASONS; }
    this.requestUiUpdate?.();
  }

  reset() {
    this.season = 0;
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

    const mix = MIXES.find((m) => m.id === this.mixPick) || MIXES[0];
    this._drawGauges(ctx, mix);
    this._drawField(ctx, mix);

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 32);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.55);
      ctx.fillText('Switch mixes, re-run, compare the last row of each ledger.', W / 2, H - 12);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  // animated visible season count
  _seasonProgress(mix) {
    if (this.season < SEASONS) return 0;
    const t = cruise(clamp01((this._stepEnterTime - 0.3) / 2.5));
    return t * SEASONS;
  }

  _gauge(ctx, x, y, title, color, valuesFn) {
    const c = this.colors;
    SimDraw.drawPanel(ctx, x, y, 250, 150, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(color, 0.5), lineWidth: 1.5 });
    ctx.save();
    ctx.font = '700 12.5px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 16, y + 26);
    ctx.font = '600 10.5px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(color, 0.9);
    ctx.fillText('per season', x + 190, y + 26);
    ctx.restore();

    // mini bar chart over 5 seasons
    const bx = x + 18, by = y + 118, bw = 214, bhMax = 74;
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.35);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx - 4, by); ctx.lineTo(bx + bw, by);
    ctx.stroke();

    const prog = this._seasonProgress();
    for (let s = 0; s < SEASONS; s++) {
      const v = valuesFn(s);
      const shown = Math.min(1, Math.max(0, prog - s));
      if (shown <= 0.01) continue;
      const h = Math.abs(v) / 100 * bhMax * shown;
      const barX = bx + s * (bw / SEASONS) + 6;
      roundRectPath(ctx, barX, v >= 0 ? by - h : by, Math.max(bw / SEASONS - 12, 8), Math.max(h, 3), 4);
      ctx.fillStyle = v >= 0 ? SimDraw.withAlpha(color, 0.85) : SimDraw.withAlpha(c.error, 0.85);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawGauges(ctx, mix) {
    // profit per season (constant-ish, slight decline with bad soil)
    this._gauge(ctx, 60, 70, `PROFIT`, this.colors.success, (s) => mix.profit * (1 - 0.03 * s * (-mix.soil / 4)));
    // water table change
    this._gauge(ctx, 330, 70, 'WATER TABLE', this.colors.water, () => mix.water * 7);
    // soil health
    this._gauge(ctx, 600, 70, 'SOIL HEALTH', this.colors.warning, () => mix.soil * 22);
  }

  _drawField(ctx, mix) {
    const c = this.colors;
    const fx = 60, fy = 260, fw = W - 120, fh = 200;

    SimDraw.drawPanel(ctx, fx - 14, fy - 40, fw + 28, fh + 70, { bg: c.panelBg, radius: 14, stroke: SimDraw.withAlpha(c.accent, 0.4), lineWidth: 1.4 });

    // field split visual by mix
    const sugarFrac = mix.id === 'sugar' ? 0.8 : mix.id === 'mix' ? 0.5 : 0.15;
    const prog = cruise(clamp01((this._stepEnterTime - 0.2) / 0.8));

    // soil strip
    roundRectPath(ctx, fx, fy, fw, fh, 10);
    ctx.fillStyle = '#5d4a23';
    ctx.fill();

    const sugarW = fw * sugarFrac;
    // sugarcane side (tall stalks)
    ctx.save();
    roundRectPath(ctx, fx, fy, sugarW, fh, 10);
    ctx.clip();
    for (let i = 0; i < 14; i++) {
      const px = fx + 20 + i * ((sugarW - 30) / 13 || 1);
      for (let j = 0; j < 3; j++) {
        const py = fy + fh * (j + 1) / 4;
        this._cane(ctx, px, py, c.warning, 1 + j * 0.2);
      }
    }
    ctx.restore();

    // millets side (short tufts)
    if (sugarW < fw - 10) {
      ctx.save();
      roundRectPath(ctx, fx + sugarW, fy, fw - sugarW, fh, 10);
      ctx.clip();
      const mw = fw - sugarW;
      for (let i = 0; i < 16; i++) {
        const px = fx + sugarW + 16 + i * ((mw - 26) / 15 || 1);
        for (let j = 0; j < 3; j++) {
          const py = fy + fh * (j + 1) / 4;
          this._millet(ctx, px, py, c.success);
        }
      }
      ctx.restore();
    }

    // overlay alpha by progress
    ctx.save();
    ctx.globalAlpha = 1 - prog;
    roundRectPath(ctx, fx, fy, fw, fh, 10);
    ctx.fillStyle = c.bgDeep;
    ctx.fill();
    ctx.restore();

    // labels
    SimDraw.drawLabel(ctx, 'sugarcane', fx + sugarW / 2, fy + fh + 24, { bg: c.panelBg, color: c.warning });
    if (sugarW < fw - 10) SimDraw.drawLabel(ctx, 'millets & pulses', fx + sugarW + (fw - sugarW) / 2, fy + fh + 24, { bg: c.panelBg, color: c.success });

    // season rain indicator
    const rainsShown = Math.floor(this._seasonProgress());
    for (let s = 0; s < Math.max(rainsShown, this.season > 0 ? rainsShown : 0); s++) {
      const rx = fx + fw - 40 - s * 34;
      this._rainDrop(ctx, rx, fy - 16, s < 3 ? c.accent : c.error);
    }
    if (rainsShown > 0) {
      ctx.save();
      ctx.font = '600 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.65);
      ctx.textAlign = 'right';
      ctx.fillText(`${rainsShown} monsoon${rainsShown > 1 ? 's' : ''} run`, fx + fw, fy - 22);
      ctx.restore();
    }
  }

  _rainDrop(ctx, x, y, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.quadraticCurveTo(x + 5, y + 2, x, y + 6);
    ctx.quadraticCurveTo(x - 5, y + 2, x, y - 6);
    ctx.stroke();
    ctx.restore();
  }

  _cane(ctx, x, y, color, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 8); ctx.lineTo(0, -22);
    ctx.moveTo(-4, 2); ctx.lineTo(-8, -6);
    ctx.moveTo(4, 2); ctx.lineTo(8, -6);
    ctx.moveTo(-4, -8); ctx.lineTo(-8, -16);
    ctx.moveTo(4, -8); ctx.lineTo(8, -16);
    ctx.stroke();
    ctx.restore();
  }

  _millet(ctx, x, y, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 6); ctx.lineTo(x, y - 6);
    ctx.moveTo(x, y - 2); ctx.lineTo(x - 5, y - 7);
    ctx.moveTo(x, y - 2); ctx.lineTo(x + 5, y - 7);
    ctx.stroke();
    ctx.restore();
  }
}
