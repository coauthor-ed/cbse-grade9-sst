import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * StreetLightScene — companion to blk-l07-s07. A dark lane becomes safe the
 * moment a public street light switches on: every walker benefits, and no
 * one can be excluded from the beam. A "sell tickets" attempt fails — light
 * spills over the paywall — while the sandwich stall next door charges per
 * item without trouble. That contrast is what makes something a public good.
 */

const W = 900;
const H = 620;

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
  { type: 'dark', caption: 'A lane after dusk. Everyone walks carefully.' },
  { type: 'light', caption: 'One street light changes the whole lane — for everyone.' },
  { type: 'paywall', caption: 'Try to charge for it: the beam ignores fences.' },
  { type: 'freeplay', caption: 'Compare the stall next door: a sandwich CAN be sold per piece.' },
];

const STEP_DARK = 0;
const STEP_LIGHT = 1;
const STEP_PAYWALL = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_DARK, dwellMs: null }],
  [{ idx: STEP_LIGHT, dwellMs: null }],
  [{ idx: STEP_PAYWALL, dwellMs: null }],
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

export class StreetLightScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A night-time lane with walkers. A street light switches on and its beam covers the whole road for every ' +
    'walker at once; a paywall fence drawn around the lamp fails to contain the light, while the sandwich stall ' +
    'beside it keeps selling per piece. The contrast shows why street lights are public goods and sandwiches are not.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'select', id: 'providerPick', label: 'Who could provide it?', options: [
      { value: 'govt', label: 'Government (taxes)' },
      { value: 'resident', label: 'One generous resident' },
      { value: 'tickets', label: 'Ticket-seller per walker' },
    ] },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.providerPick = 'govt';

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
    if (id === 'providerPick') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'providerPick') this.providerPick = String(value);
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

    const lit = this.stepIndex >= STEP_LIGHT;
    const paywall = this.stepIndex >= STEP_PAYWALL;
    const freeplay = STEPS[this.stepIndex].type === 'freeplay';

    // ground
    ctx.save();
    ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.06);
    ctx.fillRect(0, 430, W, H - 430);
    ctx.strokeStyle = SimDraw.withAlpha(this.colors.label, 0.35);
    ctx.setLineDash([14, 18]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 500); ctx.lineTo(W, 500);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // light beam
    if (lit) {
      const p = cruise(clamp01((this._stepEnterTime - 0.2) / 1.0));
      ctx.save();
      ctx.globalAlpha = 0.22 * p;
      ctx.fillStyle = this.colors.warning;
      ctx.beginPath();
      ctx.moveTo(W / 2, 150);
      ctx.lineTo(W / 2 - 330 * p, 560);
      ctx.lineTo(W / 2 + 330 * p, 560);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // lamp post
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(this.colors.label, 0.8);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(W / 2, 430);
    ctx.lineTo(W / 2, 150);
    ctx.stroke();
    roundRectPath(ctx, W / 2 - 26, 132, 52, 20, 8);
    ctx.fillStyle = lit ? this.colors.warning : SimDraw.withAlpha(this.colors.label, 0.3);
    ctx.fill();
    ctx.restore();

    if (lit && paywall) {
      // failing fence
      const p = cruise(clamp01((this._stepEnterTime - 0.3) / 0.8));
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = this.colors.error;
      ctx.setLineDash([9, 7]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 150, 470);
      ctx.lineTo(W / 2 - 150, 300);
      ctx.lineTo(W / 2 + 150, 300);
      ctx.lineTo(W / 2 + 150, 470);
      ctx.stroke();
      ctx.setLineDash([]);
      SimDraw.drawLabel(ctx, `tickets ₹10`, W / 2, 288 - 8, { bg: this.colors.panelBg, color: this.colors.error });
      ctx.globalAlpha = p;
      SimDraw.drawLabel(ctx, 'light spills right past it', W / 2 + 210, 360, { bg: this.colors.panelBg, color: this.colors.warning });
      ctx.restore();
    }

    // walkers
    for (let i = 0; i < 5; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const p = ((this._stepEnterTime * 0.06 + i / 5) % 1);
      const x = dir === 1 ? p * W : W - p * W;
      const y = 545 + (i % 2) * 26;
      const inBeam = lit && Math.abs(x - W / 2) < 330;
      ctx.save();
      ctx.strokeStyle = inBeam ? this.colors.label : SimDraw.withAlpha(this.colors.label, 0.45);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 16, 6, 0, Math.PI * 2);
      ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 4);
      ctx.moveTo(x - 5, y + 12); ctx.lineTo(x, y + 4); ctx.lineTo(x + 5, y + 12);
      ctx.stroke();
      if (inBeam && paywall && !this._hasTicketFor(i)) {
        ctx.font = '700 10px Inter, system-ui';
        ctx.fillStyle = this.colors.error;
        ctx.textAlign = 'center';
        ctx.fillText('no ticket, still lit', x, y - 28);
      }
      ctx.restore();
    }

    // sandwich stall (excludable contrast) in freeplay
    if (freeplay) {
      const p = cruise(clamp01(this._stepEnterTime / 0.8));
      ctx.save();
      ctx.globalAlpha = p;
      const sx = 70, sy = 380;
      SimDraw.drawPanel(ctx, sx, sy, 170, 90, { bg: this.colors.panelBg, radius: 12, stroke: SimDraw.withAlpha(this.colors.success, 0.7), lineWidth: 1.8 });
      ctx.font = '700 12px Inter, system-ui';
      ctx.fillStyle = this.colors.label;
      ctx.textAlign = 'center';
      ctx.fillText('SANDWICH STALL', sx + 85, sy + 26);
      ctx.font = '600 11px Inter, system-ui';
      ctx.fillStyle = this.colors.success;
      ctx.fillText('₹40 each · pay first', sx + 85, sy + 50);
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.6);
      ctx.fillText('no pay → no sandwich', sx + 85, sy + 72);
      ctx.restore();
    }

    // provider verdict
    if (freeplay && this.providerPick === 'tickets') {
      ctx.save();
      ctx.font = '700 13px Inter, system-ui';
      ctx.fillStyle = this.colors.error;
      ctx.textAlign = 'center';
      ctx.fillText('ticket-seller model: everyone rides free on the beam', W / 2, 60);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 32);
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _hasTicketFor(_i) {
    return this.providerPick !== 'tickets'; // nobody actually gets excluded
  }
}
