import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * NeedsShelvesScene — companion to blk-l01-s02. Items fly onto a NEEDS shelf
 * and a WANTS shelf as the slide's beats advance. In free play, one bicycle
 * must be shelved: used for the school commute it belongs with needs, bought
 * for weekend fun it belongs with wants — the job decides, not the object.
 */

const W = 900;
const H = 560;

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  warning:  ['--sim-warning', '#fbbf24'],
  shelfCard: ['--sim-surface-raised', '#0e1421'],
};

const STEPS = [
  { type: 'needs', caption: 'First shelf: things life does not negotiate on.' },
  { type: 'wants', caption: 'Second shelf: things that make life more fun.' },
  { type: 'freeplay', caption: 'One bicycle, two possible shelves. You decide the job first.' },
];

const STEP_NEEDS = 0;
const STEP_WANTS = 1;
const STEP_FREEPLAY = 2;

const SHELF_STEPS = [STEP_NEEDS, STEP_WANTS];

const BEAT_STEP_MAP = [
  [{ idx: STEP_NEEDS, dwellMs: null }],
  [{ idx: STEP_WANTS, dwellMs: null }],
  [{ idx: STEP_FREEPLAY, dwellMs: null }],
];

const NEED_ITEMS = [
  { icon: 'droplet', label: 'Drinking water' },
  { icon: 'rice', label: 'Rice & dal' },
  { icon: 'roof', label: 'A dry roof' },
];
const WANT_ITEMS = [
  { icon: 'phone', label: 'Newer phone' },
  { icon: 'console', label: 'Game console' },
  { icon: 'park', label: 'Water-park trip' },
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

export class NeedsShelvesScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Two shelves. Drinking water, rice and dal, and roof repairs land on the needs shelf; a newer phone, a game ' +
    'console and a water-park trip land on the wants shelf. A bicycle is then shelved according to whether it is ' +
    'used for the school commute or for weekend fun.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    {
      type: 'select', id: 'bikeJob', label: 'This bicycle is for:', options: [
        { value: 'school', label: 'The daily school commute' },
        { value: 'fun', label: 'Weekend rides for fun' },
      ],
    },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.bikeJob = 'school';

    this._shelfClocks = [0, 0];
    this._shelfArmed = [false, false];
    this._setStep(0);

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
    if (id === 'bikeJob') return locked;
    return false;
  }

  _setStep(idx) {
    this.stepIndex = idx;
    for (let s = 0; s < SHELF_STEPS.length; s++) {
      if (idx >= SHELF_STEPS[s]) {
        if (!this._shelfArmed[s]) { this._shelfClocks[s] = 0; this._shelfArmed[s] = true; }
      } else {
        this._shelfArmed[s] = false;
      }
    }
  }

  onBeatChange(beatIndex) {
    this._lessonLinked = true;
    const clamped = Math.max(0, Math.min(beatIndex, BEAT_STEP_MAP.length - 1));
    const chain = BEAT_STEP_MAP[clamped];
    this._beatChain = chain;
    this._beatChainPos = 0;
    this._beatChainDwell = chain[0].dwellMs != null ? chain[0].dwellMs / 1000 : null;
    this._setStep(chain[0].idx);
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this._setStep(Math.min(STEPS.length - 1, this.stepIndex + 1)); this._stepEnterTime = 0; }
    else if (id === 'prev') { this._setStep(Math.max(0, this.stepIndex - 1)); this._stepEnterTime = 0; }
    else if (id === 'bikeJob') this.bikeJob = String(value);
    this.requestUiUpdate?.();
  }

  _tick(ctx, dt) {
    this._stepEnterTime += dt;
    if (this._lessonLinked && this._beatChainDwell != null) {
      this._beatChainDwell -= dt;
      if (this._beatChainDwell <= 0) this._beatChainDwell = null;
    }

    for (let s = 0; s < SHELF_STEPS.length; s++) {
      if (this._shelfArmed[s]) this._shelfClocks[s] += dt;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.colors.bgDeep;
    ctx.fillRect(0, 0, W, H);
    this._drawScene(ctx);
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  // progress of item k within a shelf's stagger, on that shelf's own clock
  _stagger(clock, k, span = 0.9) {
    return cruise(clamp01((clock - k * 0.35) / span));
  }

  _drawShelf(ctx, x, y, w, title, color, items, visibleCountFn) {
    const c = this.colors;
    SimDraw.drawPanel(ctx, x, y, w, 300, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(color, 0.55), lineWidth: 1.5 });
    ctx.save();
    ctx.font = '700 16px Inter, system-ui';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 34);
    ctx.restore();

    // plank
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.5);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 258);
    ctx.lineTo(x + w - 24, y + 258);
    ctx.stroke();
    ctx.restore();

    items.forEach((it, k) => {
      const p = visibleCountFn(k);
      if (p <= 0.01) return;
      const cx = x + w * (k + 1) / (items.length + 1);
      const cy = y + 258 - 34 - (1 - p) * 60;
      ctx.save();
      ctx.globalAlpha = p;
      this._drawItemCard(ctx, cx, cy, it.icon, it.label, color);
      ctx.restore();
    });
  }

  _drawItemCard(ctx, cx, cy, icon, label, color) {
    const c = this.colors;
    const w = 108, h = 62;
    SimDraw.drawPanel(ctx, cx - w / 2, cy - h / 2, w, h, { bg: c.panelBg, radius: 9, stroke: SimDraw.withAlpha(color, 0.7), lineWidth: 1.4 });
    ctx.save();
    ctx.fillStyle = color;
    this._drawIcon(ctx, cx, cy - 14, icon);
    ctx.font = '600 10.5px Inter, system-ui';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 20);
    ctx.restore();
  }

  _drawIcon(ctx, x, y, kind) {
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    switch (kind) {
      case 'droplet':
        ctx.moveTo(x, y - 11);
        ctx.bezierCurveTo(x + 9, y + 1, x + 7, y + 10, x, y + 10);
        ctx.bezierCurveTo(x - 7, y + 10, x - 9, y + 1, x, y - 11);
        break;
      case 'rice':
        roundRectPath(ctx, x - 10, y - 6, 20, 15, 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 10, y - 6); ctx.lineTo(x, y - 13); ctx.lineTo(x + 10, y - 6); ctx.closePath();
        break;
      case 'roof':
        ctx.moveTo(x - 13, y + 2); ctx.lineTo(x, y - 11); ctx.lineTo(x + 13, y + 2);
        ctx.moveTo(x - 9, y + 3); ctx.lineTo(x - 9, y + 11);
        ctx.moveTo(x + 9, y + 3); ctx.lineTo(x + 9, y + 11);
        ctx.moveTo(x - 9, y + 11); ctx.lineTo(x + 9, y + 11);
        break;
      case 'phone':
        roundRectPath(ctx, x - 7, y - 12, 14, 24, 3);
        break;
      case 'console':
        roundRectPath(ctx, x - 13, y - 7, 26, 14, 5);
        ctx.moveTo(x - 7, y); ctx.lineTo(x - 3, y);
        ctx.moveTo(x - 5, y - 2); ctx.lineTo(x - 5, y + 2);
        ctx.moveTo(x + 6, y - 2); ctx.arc(x + 8, y - 2, 2, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 8, y + 3, 2, 0, Math.PI);
        break;
      case 'park':
        ctx.moveTo(x - 4, y - 12); ctx.lineTo(x - 4, y + 10);
        ctx.moveTo(x - 12, y + 10); ctx.lineTo(x + 4, y + 10);
        ctx.arc(x, y - 3, 8, 0.5 * Math.PI, 1.9 * Math.PI);
        break;
      case 'bike':
        ctx.moveTo(x - 13, y + 8); ctx.arc(x - 8, y + 8, 5, 0, Math.PI * 2);
        ctx.moveTo(x + 13, y + 8); ctx.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
        ctx.moveTo(x - 8, y + 8); ctx.lineTo(x - 2, y - 4); ctx.lineTo(x + 8, y - 4);
        ctx.moveTo(x + 8, y - 4); ctx.lineTo(x + 8, y + 8);
        break;
      default:
        ctx.arc(x, y, 9, 0, Math.PI * 2);
    }
    ctx.stroke();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];

    const needsVisible = (k) => (this.stepIndex >= STEP_NEEDS ? this._stagger(this._shelfClocks[0], k) : 0);
    const wantsVisible = (k) => (this.stepIndex >= STEP_WANTS ? this._stagger(this._shelfClocks[1], k) : 0);

    this._drawShelf(ctx, 40, 70, 395, 'NEEDS — life runs on these', c.success, NEED_ITEMS, needsVisible);
    this._drawShelf(ctx, 465, 70, 395, 'WANTS — nicer with these', c.warning, WANT_ITEMS, wantsVisible);

    // free-play bicycle
    if (this.stepIndex >= STEP_FREEPLAY) {
      const p = clamp01(this._stepEnterTime / 0.7);
      const bikeOnNeeds = this.bikeJob === 'school';
      const tx = bikeOnNeeds ? 237 : 662;
      const ty = 430;
      const bx = 450 + (tx - 450) * cruise(p);
      ctx.save();
      ctx.globalAlpha = p;
      ctx.strokeStyle = c.accent;
      ctx.fillStyle = c.accent;
      ctx.lineWidth = 3;
      this._drawIcon(ctx, bx, ty, 'bike');
      ctx.font = '600 12px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText('one bicycle', 450, ty + 40);
      ctx.strokeStyle = bikeOnNeeds ? c.success : c.warning;
      ctx.fillText(bikeOnNeeds ? "a need's job" : "a want's job", tx, ty + 42);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
      ctx.font = '600 14px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(step.caption, W / 2, 36);
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
      ctx.fillText('Same object, different job, different shelf.', W / 2, H - 18);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
      ctx.font = '600 14px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.fillText(step.caption, W / 2, 36);
      ctx.restore();
    }
  }
}
