import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * StallRaceScene — companion to blk-l07-s04. Three rival stalls sell the
 * same umbrellas on a market street. Each "season" they compete: prices
 * edge down, quality stars rise, and one stall innovates a foldable design.
 * Buyers stream toward the best value. Free play advances seasons.
 */

const W = 900;
const H = 620;

const STALLS = [
  { id: 'asha', label: "Asha's stall" },
  { id: 'vikram', label: "Vikram's stall" },
  { id: 'meena', label: "Meena's stall" },
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
  { type: 'open', caption: 'Three stalls. One product. Zero instructions.' },
  { type: 'race', caption: 'Rivals undercut and out-build each other for buyers.' },
  { type: 'innovate', caption: 'Someone invents — because standing still loses customers.' },
  { type: 'freeplay', caption: 'Run more seasons. Watch prices, quality and ideas move together.' },
];

const STEP_OPEN = 0;
const STEP_RACE = 1;
const STEP_INNOVATE = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_OPEN, dwellMs: null }],
  [{ idx: STEP_RACE, dwellMs: null }],
  [{ idx: STEP_INNOVATE, dwellMs: null }],
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

// per-stall state evolves with seasons
function stateFor(stallId, season) {
  const base = {
    asha: { price: 260, stars: 2 },
    vikram: { price: 280, stars: 3 },
    meena: { price: 240, stars: 1 },
  }[stallId];
  const s = Math.max(0, season - 1);
  return {
    price: Math.max(150, base.price - s * 18),
    stars: Math.min(5, base.stars + (season >= 2 ? 1 : 0) + (season >= 4 ? 1 : 0)),
    innovated: season >= 3 && stallId === 'meena',
  };
}

export class StallRaceScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Three rival umbrella stalls on a market street. With every season they cut prices, add quality stars and — ' +
    'eventually — one unveils a foldable innovation, while buyers drift toward the best-value stall. A control ' +
    'advances the seasons in free play.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'nextSeason', label: 'Run next season ▶' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.season = 1;

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
    if (id === 'nextSeason') return locked || this.stepIndex < STEP_RACE;
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
    if (target >= STEP_RACE && this.season < 2) this.season = 2;
    if (target >= STEP_INNOVATE && this.season < 3) this.season = 3;
    this.stepIndex = target;
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1); this._stepEnterTime = 0; }
    else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id === 'nextSeason') this.season = Math.min(9, this.season + 1);
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

    // street
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(this.colors.label, 0.3);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 500); ctx.lineTo(W - 40, 500);
    ctx.stroke();
    ctx.restore();

    STALLS.forEach((s, k) => {
      let pop = cruise(clamp01((this._stepEnterTime - 0.15 - k * 0.25) / 0.7));
      this._stall(ctx, 90 + k * 270, 180, s, pop, k);
    });

    // buyers drifting to best value
    if (this.stepIndex >= STEP_RACE) this._drawBuyers(ctx);

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 32);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '600 12px Inter, system-ui';
      ctx.fillStyle = this.colors.warning;
      ctx.fillText(`season ${this.season} · nobody ordered any of this`, W / 2, H - 12);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _stall(ctx, x, y, stall, pop, k) {
    if (pop <= 0.02) return;
    const c = this.colors;
    const st = stateFor(stall.id, this.season);

    ctx.save();
    ctx.globalAlpha = pop;

    // canopy
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 230, y);
    ctx.lineTo(x + 210, y + 34);
    ctx.lineTo(x + 10, y + 34);
    ctx.closePath();
    ctx.fillStyle = [c.accent, c.success, c.warning][k];
    ctx.globalAlpha = pop * 0.8;
    ctx.fill();

    // posts + counter
    ctx.globalAlpha = pop;
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.7);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 34); ctx.lineTo(x + 14, y + 130);
    ctx.moveTo(x + 206, y + 34); ctx.lineTo(x + 206, y + 130);
    ctx.stroke();
    roundRectPath(ctx, x, y + 128, 220, 16, 5);
    ctx.fillStyle = c.panelBg;
    ctx.fill();
    ctx.stroke();

    // umbrella on counter
    this._umbrella(ctx, x + 60, y + 96, st.innovated ? c.error : c.label);

    // name
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(stall.label.toUpperCase(), x + 110, y + 58);

    // price tag
    SimDraw.drawPanel(ctx, x + 140, y + 74, 70, 30, { bg: c.panelBg, radius: 7, stroke: c.warning, lineWidth: 1.6 });
    ctx.font = '800 14px Inter, system-ui';
    ctx.fillStyle = c.warning;
    ctx.fillText(`₹${st.price}`, x + 175, y + 94);

    // quality stars
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.success;
    ctx.fillText('★'.repeat(st.stars), x + 110, y + 168);

    if (st.innovated) {
      ctx.save();
      ctx.globalAlpha = 0.75 + 0.25 * Math.sin(this._stepEnterTime * 4);
      SimDraw.drawLabel(ctx, 'NEW: folds into a handbag!', x + 110, y - 14, { bg: c.panelBg, color: c.error });
      ctx.restore();
    }
    ctx.restore();
  }

  _umbrella(ctx, x, y, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y - 6, 22, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 28);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
    for (const dx of [-14, 0, 14]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y - 6);
      ctx.lineTo(x + dx, y - 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawBuyers(ctx) {
    const c = this.colors;
    const t = this._stepEnterTime;
    // buyer dots flow toward the cheapest high-star stall (recompute best)
    let best = 0, bestScore = -Infinity;
    STALLS.forEach((s, k) => {
      const st = stateFor(s.id, this.season);
      const score = st.stars * 20 - st.price / 10;
      if (score > bestScore) { bestScore = score; best = k; }
    });
    const targetX = 90 + best * 270 + 110;

    for (let i = 0; i < 6; i++) {
      const p = ((t * 0.25 + i / 6) % 1);
      const startX = 80 + ((i * 137) % (W - 160));
      const bx = startX + (targetX - startX) * cruise(p);
      const by = 545 - Math.sin(p * Math.PI) * 18;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.font = '600 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.65);
    ctx.textAlign = 'center';
    ctx.fillText('buyers walk toward the best deal', W / 2, 574);
    ctx.restore();
  }
}
