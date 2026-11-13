import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * DecisionDialsScene — companion to blk-l06-s05. Five dials — machine
 * prices, technology level, product nature, labour market, laws and
 * incentives — light up one per beat, each needle tilted toward HANDS or
 * MACHINES. Free play: scenario presets reposition every dial at once so
 * students can read a whole decision, not one factor.
 */

const W = 900;
const H = 620;

const DIALS = [
  { id: 'machines', label: 'Machine cost', hands: 'expensive machines', machines: 'cheap machines', value: -1 },
  { id: 'tech', label: 'Technology level', hands: 'basic technology', machines: 'advanced technology', value: -1 },
  { id: 'product', label: 'Nature of the product', hands: 'custom / designer', machines: 'mass-produced', value: -1 },
  { id: 'labour', label: 'Labour market', hands: 'cheap, plentiful labour', machines: 'scarce, costly labour', value: -1 },
  { id: 'laws', label: 'Laws & incentives', hands: 'strong labour protection', machines: 'machinery subsidies', value: -1 },
];

// value: -1 tilts to HANDS, +1 tilts to MACHINES
const PRESETS = [
  {
    id: 'boutique', label: 'Designer boutique in a big city',
    values: { machines: -1, tech: -1, product: -1, labour: -1, laws: -0.5 },
  },
  {
    id: 'uniformfactory', label: 'Uniform factory, cheap new machines',
    values: { machines: 1, tech: 1, product: 1, labour: 1, laws: 0.5 },
  },
  {
    id: 'village', label: 'Village co-operative with plentiful handworkers',
    values: { machines: -1, tech: -1, product: 0.5, labour: -1, laws: -0.5 },
  },
];

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    '--sim-label',
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  error:    ['--sim-error', '#f87171'],
  warning:  ['--sim-warning', '#fbbf24'],
};

COLOR_TOKEN_MAP.label = ['--sim-label', '#e2e8f0'];

const STEPS = [
  { type: 'd0', caption: 'Dial 1: what machines cost to buy or lease.' },
  { type: 'd1', caption: 'Dial 2: how far the available technology has come.' },
  { type: 'd2', caption: 'Dial 3: whether the product is custom or mass-made.' },
  { type: 'd3', caption: 'Dial 4: what the local labour market looks like.' },
  { type: 'd4', caption: 'Dial 5: what the law rewards and restricts.' },
  { type: 'freeplay', caption: 'Load a scenario — read all five dials as one decision.' },
];

const STEP_D0 = 0;
const STEP_D4 = 4;
const STEP_FREEPLAY = 5;

const BEAT_STEP_MAP = [
  [{ idx: STEP_D0 + 0, dwellMs: null }],
  [{ idx: STEP_D0 + 1, dwellMs: null }],
  [{ idx: STEP_D0 + 2, dwellMs: null }],
  [{ idx: STEP_D0 + 3, dwellMs: null }],
  [{ idx: STEP_D0 + 4, dwellMs: null }],
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

export class DecisionDialsScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Five decision dials for choosing between labour-intensive and capital-intensive production: machine cost, ' +
    'technology level, product nature, the labour market, and laws or incentives. Each beat activates one dial ' +
    'with its needle tilted toward hands or machines; scenario presets move all five together in free play.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'select', id: 'presetPick', label: 'Scenario:', options: PRESETS.map((p) => ({ value: p.id, label: p.label })) },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.presetPick = 'boutique';
    // live dial values (start neutral-ish; beats tilt them)
    this.values = { machines: -1, tech: -1, product: -1, labour: -1, laws: -1 };

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
    if (id === 'presetPick') return locked || this.stepIndex < STEP_FREEPLAY;
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
    // ensure earlier dials are already set when jumping ahead
    for (let k = 0; k <= target && k <= STEP_D4; k++) {
      const d = DIALS[k];
      this.values[d.id] = k === target ? this.values[d.id] : this.values[d.id] ?? -1;
    }
    this.stepIndex = Math.max(this.stepIndex, target);
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1); this._stepEnterTime = 0; }
    else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id === 'presetPick') {
      this.presetPick = String(value);
      const preset = PRESETS.find((p) => p.id === this.presetPick);
      if (preset) this.values = { ...this.values, ...preset.values };
    }
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

    const freeplay = STEPS[this.stepIndex].type === 'freeplay';
    const activeCount = freeplay ? DIALS.length : this.stepIndex + 1;

    DIALS.forEach((d, k) => {
      if (k >= activeCount) return;
      let pop = cruise(clamp01((this._stepEnterTime - 0.15) / 0.7));
      if (!freeplay && k < activeCount - 1) pop = 1;
      this._dial(ctx, 90 + (k % 2) * 400, 80 + Math.floor(k / 2) * 165, d, pop, k === activeCount - 1 && !freeplay);
    });

    // overall verdict strip in freeplay
    if (freeplay) {
      const sum = DIALS.reduce((s, d) => s + (this.values[d.id] || 0), 0);
      const lean = sum > 0.5 ? 'MACHINES' : sum < -0.5 ? 'HANDS' : 'A CLOSE CALL';
      const colr = sum > 0.5 ? this.colors.accent : sum < -0.5 ? this.colors.warning : this.colors.label;
      SimDraw.drawPanel(ctx, W / 2 - 190, H - 74, 380, 46, { bg: this.colors.panelBg, radius: 10, stroke: colr, lineWidth: 2 });
      ctx.save();
      ctx.font = '800 16px Inter, system-ui';
      ctx.fillStyle = colr;
      ctx.textAlign = 'center';
      ctx.fillText(`this setup leans: ${lean}`, W / 2, H - 44);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 34);
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _dial(ctx, x, y, d, pop, isActive) {
    if (pop <= 0.02) return;
    const c = this.colors;
    const v = this.values[d.id] || 0;

    ctx.save();
    ctx.globalAlpha = pop;
    SimDraw.drawPanel(ctx, x, y, 360, 140, {
      bg: c.panelBg,
      radius: 12,
      stroke: isActive ? c.warning : SimDraw.withAlpha(c.accent, 0.45),
      lineWidth: isActive ? 2.6 : 1.5,
    });

    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'left';
    ctx.fillText(d.label, x + 20, y + 28);

    // gauge arc
    const gx = x + 180, gy = y + 92, gr = 52;
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.25);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // needle
    const ang = Math.PI * 1.15 + (v + 1) / 2 * Math.PI * 0.7;
    const wob = isActive ? Math.sin(this._stepEnterTime * 7) * 0.02 : 0;
    ctx.strokeStyle = v > 0.2 ? c.accent : v < -0.2 ? c.warning : c.label;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + (gr - 8) * Math.cos(ang + wob), gy + (gr - 8) * Math.sin(ang + wob));
    ctx.stroke();

    // end labels
    ctx.font = '700 11px Inter, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.warning;
    ctx.fillText('HANDS ←', x + 20, y + 62);
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
    ctx.font = '500 10.5px Inter, system-ui';
    ctx.fillText(d.hands, x + 20, y + 122);

    ctx.textAlign = 'right';
    ctx.fillStyle = c.accent;
    ctx.font = '700 11px Inter, system-ui';
    ctx.fillText('→ MACHINES', x + 340, y + 62);
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
    ctx.font = '500 10.5px Inter, system-ui';
    ctx.fillText(d.machines, x + 340, y + 122);

    ctx.restore();
  }
}
