import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * SteelAllocationScene — companion to blk-l02-s01. One truckload of steel,
 * three waiting claimants (hospital, aircraft plant, fridge factory). Beats
 * show the pile and the queue; free play sends the steel to one buyer while
 * the other two fade to "went without".
 */

const W = 900;
const H = 560;

const BUYERS = [
  { id: 'hospital', label: 'Hospital', sub: 'surgical tables', icon: 'cross' },
  { id: 'aircraft', label: 'Aircraft plant', sub: 'fuselage frames', icon: 'plane' },
  { id: 'fridge', label: 'Fridge factory', sub: 'cabinets', icon: 'fridge' },
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
  { type: 'arrival', caption: 'One truckload of steel.' },
  { type: 'claimants', caption: 'Three buyers. Every tonne has three claimants.' },
  { type: 'freeplay', caption: 'Send the steel somewhere — the others go without.' },
];

const STEP_ARRIVAL = 0;
const STEP_CLAIMANTS = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_ARRIVAL, dwellMs: null }],
  [{ idx: STEP_CLAIMANTS, dwellMs: null }],
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

export class SteelAllocationScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'One truckload of steel stands between three waiting buyers: a hospital wanting surgical tables, an aircraft ' +
    'plant wanting fuselage frames and a fridge factory wanting cabinets. Choosing a recipient in free play ' +
    'delivers the steel there and leaves the other two marked as gone without.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    {
      type: 'select', id: 'recipient', label: 'The steel goes to:', options: [
        { value: 'none', label: '— decide —' },
        { value: 'hospital', label: 'Hospital' },
        { value: 'aircraft', label: 'Aircraft plant' },
        { value: 'fridge', label: 'Fridge factory' },
      ],
    },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.recipient = 'none';

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
    if (id === 'recipient') return locked;
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
    else if (id === 'recipient') this.recipient = String(value);
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

  _drawIcon(ctx, x, y, kind) {
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    if (kind === 'cross') {
      ctx.moveTo(x - 12, y - 4); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x - 4, y - 12);
      ctx.lineTo(x + 4, y - 12); ctx.lineTo(x + 4, y - 4); ctx.lineTo(x + 12, y - 4);
      ctx.lineTo(x + 12, y + 4); ctx.lineTo(x + 4, y + 4); ctx.lineTo(x + 4, y + 12);
      ctx.lineTo(x - 4, y + 12); ctx.lineTo(x - 4, y + 4); ctx.lineTo(x - 12, y + 4);
      ctx.closePath();
    } else if (kind === 'plane') {
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x + 4, y - 2);
      ctx.lineTo(x + 15, y + 8);
      ctx.lineTo(x + 15, y + 11);
      ctx.lineTo(x + 3, y + 6);
      ctx.lineTo(x + 1, y + 12);
      ctx.lineTo(x + 5, y + 15);
      ctx.lineTo(x - 5, y + 15);
      ctx.lineTo(x - 1, y + 12);
      ctx.lineTo(x - 3, y + 6);
      ctx.lineTo(x - 15, y + 11);
      ctx.lineTo(x - 15, y + 8);
      ctx.lineTo(x - 4, y - 2);
      ctx.closePath();
    } else {
      roundRectPath(ctx, x - 9, y - 14, 18, 28, 3);
      ctx.moveTo(x - 9, y - 4); ctx.lineTo(x + 9, y - 4);
      ctx.moveTo(x + 3, y + 2); ctx.lineTo(x + 7, y + 2);
      ctx.moveTo(x + 3, y + 6); ctx.lineTo(x + 7, y + 6);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawTruck(ctx, x, y) {
    const c = this.colors;
    ctx.save();
    // cargo bed with ingots
    roundRectPath(ctx, x, y - 34, 130, 40, 6);
    ctx.fillStyle = c.panelBg;
    ctx.fill();
    ctx.strokeStyle = SimDraw.withAlpha(c.accent, 0.9);
    ctx.lineWidth = 2.4;
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      roundRectPath(ctx, x + 10 + i * 29, y - 26, 22, 12, 3);
      ctx.fillStyle = SimDraw.withAlpha(c.accent, 0.75);
      ctx.fill();
    }
    // cab
    roundRectPath(ctx, x + 134, y - 26, 36, 32, 5);
    ctx.fillStyle = c.panelBg;
    ctx.fill();
    ctx.stroke();
    // wheels
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.85);
    ctx.beginPath();
    ctx.arc(x + 30, y + 12, 10, 0, Math.PI * 2);
    ctx.arc(x + 60, y + 12, 10, 0, Math.PI * 2);
    ctx.arc(x + 150, y + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';

    // ground
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.35);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 172);
    ctx.lineTo(W - 50, 172);
    ctx.stroke();
    ctx.restore();

    this._drawTruck(ctx, W / 2 - 160, 160);

    // buyer cards row
    BUYERS.forEach((b, k) => {
      const cx = W / 2 + (k - 1) * 260;
      const cy = 330;
      const appear = cruise(clamp01((this._stepEnterTime - k * 0.3) / 0.7));
      if (step.type === 'arrival' && appear < 0.02) return;

      const chosen = freeplay && this.recipient === b.id;
      const denied = freeplay && this.recipient !== 'none' && !chosen;

      ctx.save();
      ctx.globalAlpha = (step.type === 'arrival' ? appear : 1) * (denied ? 0.38 : 1);

      const bw = 220, bh = 120;
      SimDraw.drawPanel(ctx, cx - bw / 2, cy - bh / 2, bw, bh, {
        bg: c.panelBg,
        radius: 12,
        stroke: chosen ? SimDraw.withAlpha(c.success, 0.95) : denied ? SimDraw.withAlpha(c.error, 0.6) : SimDraw.withAlpha(c.accent, 0.45),
        lineWidth: chosen || denied ? 2 : 1.5,
      });

      ctx.fillStyle = chosen ? c.success : denied ? c.error : c.accent;
      this._drawIcon(ctx, cx, cy - 26, b.icon);

      ctx.font = '700 15px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(b.label, cx, cy + 16);
      ctx.font = '500 11.5px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.65);
      ctx.fillText(b.sub, cx, cy + 36);

      if (chosen) {
        ctx.font = '700 12px Inter, system-ui';
        ctx.fillStyle = c.success;
        ctx.fillText('STEEL ARRIVES', cx, cy + 54);
      } else if (denied) {
        ctx.font = '700 12px Inter, system-ui';
        ctx.fillStyle = c.error;
        ctx.fillText('GOES WITHOUT', cx, cy + 54);
      }
      ctx.restore();

      // tug lines from truck when claimants beat active
      if (step.type === 'claimants') {
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin((this._stepEnterTime + k) * 3);
        ctx.strokeStyle = c.warning;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 20 + k * 20, 178);
        ctx.quadraticCurveTo(cx, 230, cx, cy - 62);
        ctx.stroke();
        ctx.restore();
      }
    });

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, W / 2, 36);
    if (freeplay && this.recipient !== 'none') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
      ctx.fillText('Same steel. Different winners, different losers — every time.', W / 2, H - 16);
    }
    ctx.restore();
  }
}
