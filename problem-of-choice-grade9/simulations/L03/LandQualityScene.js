import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * LandQualityScene — companion to blk-l03-s05. Ten hectare tiles, graded
 * best-to-worst for growing both crops. Beats show the sacrifice pattern
 * (10, 20, 30, 40 kg) while conversion marches across tiles in quality
 * order; the per-step cost bar visibly grows. Free play: a slider converts
 * hectares and a mini curve bends outward live.
 */

const W = 900;
const H = 600;

// sacrifices for each 25-kg barley step (chapter table)
const STEP_COSTS = [10, 20, 30, 40];
const TOTAL_HA = 10;

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
  { type: 'pattern', caption: '10… 20… 30… 40. The price of barley keeps rising.' },
  { type: 'quality', caption: 'Because hectares differ: the easy ones go first.' },
  { type: 'freeplay', caption: 'Convert further — the next hectare always hurts more.' },
];

const STEP_PATTERN = 0;
const STEP_QUALITY = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_PATTERN, dwellMs: null }],
  [{ idx: STEP_QUALITY, dwellMs: null }],
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

export class LandQualityScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Ten hectare tiles ranked from rich loam to stony slope. Converting hectares to barley in quality order makes ' +
    'each step of twenty-five kilograms cost more wheat than the last — ten, then twenty, then thirty, then forty ' +
    '— which is why the production possibility curve bends outward. A slider converts more hectares in free play.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'convertedHa', label: 'Hectares converted:', min: 0, max: TOTAL_HA, step: 1, value: 4 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.convertedHa = 4;

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
    if (id === 'convertedHa') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'convertedHa') this.convertedHa = Math.round(Number(value));
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

    this._drawTiles(ctx);
    this._drawCostBars(ctx);
    this._drawMiniCurve(ctx);
    this._drawChrome(ctx);
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _convertedCount() {
    if (this.stepIndex === STEP_FREEPLAY) return this.convertedHa;
    // pattern beat animates through 2 ha; quality beat through all 10 in order? keep 6 for readability
    return this.stepIndex === STEP_QUALITY ? Math.round(cruise(clamp01((this._stepEnterTime - 0.3) / 2.4)) * 8) : Math.round(cruise(clamp01((this._stepEnterTime - 0.2) / 1.6)) * 2);
  }

  _drawTiles(ctx) {
    const c = this.colors;
    const n = this._convertedCount();

    // tile row with quality gradient: tile i quality = 1 - i/(TOTAL-1)
    const tx = 70, ty = 120, tw = (W - 140) / TOTAL_HA, th = 96;
    for (let i = 0; i < TOTAL_HA; i++) {
      const q = 1 - i / (TOTAL_HA - 1); // 1 best … 0 worst
      const converted = i < n;
      const appear = cruise(clamp01((this._stepEnterTime - 0.15 - i * 0.12) / 0.5));
      if (appear <= 0.02) continue;

      ctx.save();
      ctx.globalAlpha = appear;

      roundRectPath(ctx, tx + i * tw + 4, ty, tw - 8, th, 8);
      // soil colour by quality
      const shadeVal = 0.45 + q * 0.35;
      ctx.fillStyle = converted ? SimDraw.shade('#b98a3c', -0.05) : SimDraw.shade('#7a6339', -(1 - shadeVal) * 0.55);
      ctx.fill();
      ctx.strokeStyle = converted ? c.warning : SimDraw.withAlpha(c.label, 0.25);
      ctx.lineWidth = converted ? 2.5 : 1.4;
      ctx.stroke();

      // quality stars
      const stars = 1 + Math.round(q * 3);
      ctx.font = '600 11px Inter, system-ui';
      ctx.fillStyle = converted ? '#fff8e1' : SimDraw.withAlpha(c.label, 0.65);
      ctx.textAlign = 'center';
      ctx.fillText('★'.repeat(stars), tx + i * tw + tw / 2, ty + th - 12);

      if (i === n && n > 0 && n < TOTAL_HA && this._stepEnterTime % 1.6 < 0.8) {
        ctx.strokeStyle = c.error;
        ctx.lineWidth = 2.5;
        roundRectPath(ctx, tx + i * tw + 4, ty, tw - 8, th, 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.font = '500 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.6);
    ctx.textAlign = 'left';
    ctx.fillText('rich loam — grows both crops well', tx, ty - 12);
    ctx.textAlign = 'right';
    ctx.fillText('stony slope — good for neither', tx + W - 140, ty - 12);
    ctx.restore();
  }

  _drawCostBars(ctx) {
    const c = this.colors;
    const bx = 70, by = 300, bw = (W - 140) / 4, gapShow = this.stepIndex >= STEP_PATTERN;

    ctx.save();
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.75);
    ctx.textAlign = 'left';
    ctx.fillText('WHEAT SACRIFICED PER 25 KG OF BARLEY', bx, by - 16);
    ctx.restore();

    STEP_COSTS.forEach((cost, k) => {
      const appear = cruise(clamp01((this._stepEnterTime - 0.4 - k * 0.45) / 0.6));
      if (!gapShow || appear < 0.02) return;
      const hMax = 130;
      const h = (cost / 40) * hMax;
      const x = bx + k * bw + bw * 0.22;
      const yBase = by + hMax + 26;

      ctx.save();
      ctx.globalAlpha = appear;
      roundRectPath(ctx, x, yBase - h, bw * 0.56, h, 6);
      ctx.fillStyle = SimDraw.withAlpha(k === 3 ? c.error : c.warning, 0.85);
      ctx.fill();
      ctx.font = '700 14px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(`−${cost} kg`, x + bw * 0.28, yBase - h - 8);
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
      ctx.fillText(`step ${k + 1}`, x + bw * 0.28, yBase + 18);
      ctx.restore();
    });
  }

  _drawMiniCurve(ctx) {
    const c = this.colors;
    if (this.stepIndex < STEP_QUALITY) return;
    const cx0 = W - 330, cy0 = 320, cw = 240, ch = 190;

    SimDraw.drawPanel(ctx, cx0 - 14, cy0 - 34, cw + 44, ch + 66, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.accent, 0.4), lineWidth: 1.4 });

    ctx.save();
    ctx.font = '600 12px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.75);
    ctx.textAlign = 'center';
    ctx.fillText('the same story, drawn', cx0 + cw / 2 + 8, cy0 - 14);
    ctx.font = '500 10px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
    ctx.fillText('barley →', cx0 + cw / 2 + 8, cy0 + ch + 22);
    ctx.save();
    ctx.translate(cx0 - 24, cy0 + ch / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('wheat ↑', 0, 0);
    ctx.restore();
    ctx.restore();

    // axes
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.6);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(cx0, cy0 + ch);
    ctx.lineTo(cx0 + cw, cy0 + ch);
    ctx.stroke();
    ctx.restore();

    // straight-line reference (what equal costs would look like)
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.35);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(cx0 + cw, cy0 + ch);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '500 10px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.5);
    ctx.textAlign = 'left';
    ctx.fillText('if every 25 kg cost the same', cx0 + 8, cy0 + ch * 0.42);
    ctx.restore();

    // bowed frontier grows with progress on quality beat
    const pts = [[0, 100], [25, 90], [50, 70], [75, 40], [100, 0]];
    const progress = cruise(clamp01((this._stepEnterTime - 0.6) / 2.2));
    const upto = Math.max(2, Math.ceil(progress * 5));
    ctx.save();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let k = 0; k < upto; k++) {
      const [b, w] = pts[k];
      const px = cx0 + (b / 100) * cw;
      const py = cy0 + ch * (1 - w / 100);
      if (k === 0) ctx.moveTo(px, py);
      else {
        const [pb, pw] = pts[k - 1];
        const mx = cx0 + ((pb + b) / 200) * cw;
        const my = cy0 + ch * (1 - ((pw + w) / 200));
        ctx.quadraticCurveTo(mx, my, px, py);
      }
    }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.font = '600 10.5px Inter, system-ui';
    ctx.fillStyle = c.accent;
    ctx.textAlign = 'left';
    ctx.fillText('what the plot really does', cx0 + 10, cy0 + 18);
    ctx.restore();
  }

  _drawChrome(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, W / 2, 36);
    if (step.type === 'freeplay') {
      const n = this.convertedHa;
      let total = 0;
      for (let k = 0; k < Math.floor(n / 2.5); k++) total += STEP_COSTS[Math.min(3, k)];
      ctx.font = '600 13px Inter, system-ui';
      ctx.fillStyle = c.warning;
      ctx.fillText(`${n} hectares converted · roughly ${total} kg of wheat given up`, W / 2, H - 18);
    }
    ctx.restore();
  }
}
