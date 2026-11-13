import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * BalanceBoardScene — companion to blk-l08-s03. A balance beam on a
 * fulcrum labelled MIXED ECONOMY. Government weights — fair competition
 * rules, consumer protection, transparency, public goods, welfare — load
 * one side; market weights — profit-making businesses, innovation,
 * competition — load the other. Beats add the weights; free play lets you
 * unload a side and watch a real economy tip.
 */

const W = 900;
const H = 620;

const GOVT_ITEMS = ['Fair competition rules', 'Consumer protection', 'Transparency', 'Public goods', 'Welfare programmes'];
const MKT_ITEMS = ['Profit-making businesses', 'Innovation', 'Competition'];

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
  { type: 'beam', caption: 'One beam. Two sides. Every mixed economy loads both.' },
  { type: 'govt', caption: 'Government brings rules, protection, public goods and welfare.' },
  { type: 'market', caption: 'The market brings businesses, innovation and rivalry.' },
  { type: 'freeplay', caption: 'Unload a side — see what tips.' },
];

const STEP_BEAM = 0;
const STEP_GOVT = 1;
const STEP_MARKET = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_BEAM, dwellMs: 1200 }, { idx: STEP_GOVT, dwellMs: null }],
  [{ idx: STEP_MARKET, dwellMs: null }],
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

export class BalanceBoardScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A balance beam resting on a fulcrum labelled mixed economy. The left pan carries government weights — fair ' +
    'competition rules, consumer protection, transparency, public goods, welfare programmes — and the right pan ' +
    'carries market weights — profit-making businesses, innovation, competition. Toggles remove either side in ' +
    'free play to show the beam tipping when one contributor is switched off.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'toggleGovt', label: 'Remove govt side' },
    { type: 'button', id: 'toggleMkt', label: 'Remove market side' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.govtOn = true;
    this.mktOn = true;

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
    if (id === 'toggleGovt') return locked || !this.govtOn;
    if (id === 'toggleMkt') return locked || !this.mktOn;
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
    else if (id === 'toggleGovt') this.govtOn = false;
    else if (id === 'toggleMkt') this.mktOn = false;
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

    const c = this.colors;

    const freeplay = STEPS[this.stepIndex].type === 'freeplay';
    const govtVisible = this.govtOn && (this.stepIndex >= STEP_GOVT || freeplay);
    const mktVisible = this.mktOn && (this.stepIndex >= STEP_MARKET || freeplay);

    // beam tilt: -1..1 (negative = govt side down)
    let tilt = 0;
    const gLoad = this.govtOn && (this.stepIndex >= STEP_GOVT || freeplay);
    const mLoad = this.mktOn && (this.stepIndex >= STEP_MARKET || freeplay);
    tilt = (gLoad ? -1 : 0) + (mLoad ? 1 : 0);
    if (gLoad && mLoad) tilt = 0;

    const cx = W / 2, cy = 300;
    const angle = tilt * 0.14 * cruise(clamp01((this._stepEnterTime - 0.2) / 0.9));

    // fulcrum
    ctx.save();
    ctx.fillStyle = c.panelBg;
    ctx.strokeStyle = c.warning;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx - 46, cy + 120);
    ctx.lineTo(cx + 46, cy + 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, cx - 90, cy + 120, 180, 26, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = '800 13px Inter, system-ui';
    ctx.fillStyle = c.warning;
    ctx.textAlign = 'center';
    ctx.fillText('MIXED ECONOMY', cx, cy + 138);
    ctx.restore();

    // beam
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    roundRectPath(ctx, -360, -12, 720, 24, 10);
    ctx.fillStyle = c.accent;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.restore();

    // pans hang from beam ends
    const endY = cy + Math.sin(angle) * 350;
    const gX = cx - 330, mX = cx + 330;

    // government pan
    if (govtVisible) {
      const p = cruise(clamp01((this._stepEnterTime - 0.3) / 0.9));
      this._pan(ctx, gX, endY, 'GOVERNMENT', GOVT_ITEMS, c.error, p, this.govtOn);
    }
    // market pan
    if (mktVisible) {
      const p = cruise(clamp01((this._stepEnterTime - (this.stepIndex >= STEP_MARKET ? 0.4 : 0.3)) / 0.9));
      this._pan(ctx, mX, endY, 'MARKET', this.stepIndex >= STEP_MARKET || freeplay ? MKT_ITEMS : [], c.success, p, this.mktOn);
    }

    // verdict in freeplay
    if (freeplay) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 15px Inter, system-ui';
      if (!this.govtOn && !this.mktOn) ctx.fillStyle = c.label;
      else if (!this.govtOn) ctx.fillStyle = c.accent;
      else if (!this.mktOn) ctx.fillStyle = c.error;
      else ctx.fillStyle = c.label;
      const msg = !this.govtOn && !this.mktOn ? 'nothing left to run an economy with'
        : !this.govtOn ? 'tips toward pure market — who funds the street lights?'
        : !this.mktOn ? 'tips toward pure planning — where does innovation come from?'
        : 'both loaded — that is what "mixed" means';
      ctx.fillText(msg, cx, 80);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 36);
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _pan(ctx, x, y, title, items, color, pop, on) {
    if (pop <= 0.02) return;
    const c = this.colors;

    ctx.save();
    ctx.globalAlpha = pop * (on ? 1 : 0.25);

    // chains
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 40, y);
    ctx.lineTo(x - 40, y + 40);
    ctx.moveTo(x + 40, y);
    ctx.lineTo(x + 40, y + 40);
    ctx.stroke();

    // pan plate
    roundRectPath(ctx, x - 150, y + 40, 300, 30, 8);
    ctx.fillStyle = c.panelBg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // weight blocks stacked above plate
    items.forEach((it, k) => {
      const wp = cruise(clamp01(pop * 1.6 - k * 0.22));
      if (wp <= 0.02) return;
      const bw = 260, bh = 34;
      const by = y + 36 - bh - k * (bh + 8);
      ctx.save();
      ctx.globalAlpha = wp;
      roundRectPath(ctx, x - bw / 2, by, bw, bh, 7);
      ctx.fillStyle = SimDraw.withAlpha(color, 0.28);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.font = '600 11.5px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(it, x, by + 22);
      ctx.restore();
    });

    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(title, x, y + 92);
    ctx.restore();
  }
}
