import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * PPCBuildScene — companion to blk-l03-s02. The chapter's flagship graph:
 * the five table combinations A–E appear one by one, join into a smooth
 * downward-bowed frontier, then an interior point F(50,50) shows feasible-
 * but-wasteful and an exterior point X(75,60) shows impossible. Free play:
 * a slider walks a dot along the frontier reading out each move's sacrifice.
 */

const W = 900;
const H = 620;

// Canonical chapter data (kg)
const POINTS = [
  { name: 'A', barley: 0, wheat: 100 },
  { name: 'B', barley: 25, wheat: 90 },
  { name: 'C', barley: 50, wheat: 70 },
  { name: 'D', barley: 75, wheat: 40 },
  { name: 'E', barley: 100, wheat: 0 },
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
  { type: 'points', caption: 'Five combinations, straight from the table.' },
  { type: 'curve', caption: 'Joined smoothly, they trace the plot\'s ceiling.' },
  { type: 'insideF', caption: 'F sits inside: possible — but wasteful.' },
  { type: 'beyondX', caption: 'X sits beyond: no wish puts it on the map.' },
  { type: 'freeplay', caption: 'Walk the frontier. Read what each step gives up.' },
];

const STEP_POINTS = 0;
const STEP_CURVE = 1;
const STEP_INSIDE = 2;
const STEP_BEYOND = 3;
const STEP_FREEPLAY = 4;

const BEAT_STEP_MAP = [
  [{ idx: STEP_POINTS, dwellMs: 1400 }, { idx: STEP_CURVE, dwellMs: null }],
  [{ idx: STEP_INSIDE, dwellMs: null }],
  [{ idx: STEP_BEYOND, dwellMs: 1800 }, { idx: STEP_FREEPLAY, dwellMs: null }],
];

// plot area
const PX = 110, PY = 60, PW = W - PX - 90, PH = H - PY - 130;
const AXIS_MAX = 120;

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const sx = (barley) => PX + PW * (barley / AXIS_MAX);
const sy = (wheat) => PY + PH * (1 - wheat / AXIS_MAX);

export class PPCBuildScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A production possibility curve built live: points A through E — zero barley with hundred kilograms of ' +
    'wheat up to hundred kilograms of barley with zero wheat — are plotted, then joined into a bowed frontier. ' +
    'An interior point F shows a wasteful combination and an exterior point X shows an impossible one. A slider ' +
    'then walks a dot along the frontier reading the wheat sacrificed per move.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'walkBarley', label: 'Barley along the curve:', min: 0, max: 100, step: 5, value: 25 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.walkBarley = 25;

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
    if (id === 'walkBarley') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'walkBarley') this.walkBarley = Math.round(Number(value));
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

    this._drawFrame(ctx);
    this._drawScene(ctx);
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _drawFrame(ctx) {
    const c = this.colors;

    // feasible-region shading (under the frontier)
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(0));
    for (let b = 0; b <= 100; b += 4) {
      ctx.lineTo(sx(b), sy(this.frontier(b)));
    }
    ctx.lineTo(sx(100), sy(0));
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // axes
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.7);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PX, PY - 8);
    ctx.lineTo(PX, PY + PH);
    ctx.lineTo(PX + PW + 10, PY + PH);
    ctx.stroke();

    // grid ticks
    ctx.font = '500 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
    ctx.textAlign = 'center';
    for (let v = 0; v <= 100; v += 20) {
      ctx.fillText(String(v), sx(v), PY + PH + 18);
      ctx.textAlign = 'right';
      ctx.fillText(String(v), PX - 8, sy(v) + 4);
      ctx.textAlign = 'center';
      if (v > 0) {
        ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.12);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx(v), PY); ctx.lineTo(sx(v), PY + PH);
        ctx.moveTo(PX, sy(v)); ctx.lineTo(PX + PW, sy(v));
        ctx.stroke();
      }
    }
    ctx.font = '600 12.5px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText('Barley (kg)', PX + PW / 2, H - 26);
    ctx.save();
    ctx.translate(28, PY + PH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Wheat (kg)', 0, 0);
    ctx.restore();
    ctx.restore();
  }

  // smooth monotone frontier through the five points (Catmull-Rom style y interpolation)
  frontier(barley) {
    for (let i = 0; i < POINTS.length - 1; i++) {
      const p0 = POINTS[Math.max(0, i - 1)], p1 = POINTS[i], p2 = POINTS[i + 1], p3 = POINTS[Math.min(POINTS.length - 1, i + 2)];
      if (barley >= p1.barley && barley <= p2.barley) {
        const t = (barley - p1.barley) / (p2.barley - p1.barley);
        const t2 = t * t, t3 = t2 * t;
        return (
          0.5 * ((2 * p1.wheat) +
            (-p0.wheat + p2.wheat) * t +
            (2 * p0.wheat - 5 * p1.wheat + 4 * p2.wheat - p3.wheat) * t2 +
            (-p0.wheat + 3 * p1.wheat - 3 * p2.wheat + p3.wheat) * t3)
        );
      }
    }
    return 0;
  }

  _dot(ctx, x, y, color, radius = 6, fill = true) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke(); }
    ctx.restore();
  }

  _labelPoint(ctx, name, barley, wheat, dx = -16, dy = -12) {
    const c = this.colors;
    ctx.save();
    ctx.font = '700 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(name, sx(barley) + dx, sy(wheat) + dy);
    ctx.restore();
  }

  _drawCurveProgress(ctx, progress) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    const total = 100;
    const upto = total * progress;
    let started = false;
    for (let b = 0; b <= upto; b += 1) {
      const x = sx(b), y = sy(this.frontier(b));
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';

    // points reveal staggered
    const nVisible = this.stepIndex >= STEP_POINTS
      ? Math.min(POINTS.length, Math.floor(clamp01((this._stepEnterTime - 0.2) / 1.4) * POINTS.length) + (this.stepIndex > STEP_POINTS ? POINTS.length : 0)) || (this.stepIndex > STEP_POINTS ? POINTS.length : 1)
      : 0;
    const shownCount = this.stepIndex > STEP_POINTS ? POINTS.length : nVisible;

    POINTS.forEach((p, k) => {
      if (k >= shownCount) return;
      const pop = cruise(clamp01((this._stepEnterTime - 0.2 - k * 0.35) / 0.5));
      const r = 6 * (this.stepIndex > STEP_POINTS ? 1 : 0.4 + 0.6 * pop);
      this._dot(ctx, sx(p.barley), sy(p.wheat), c.accent, r);
      this._labelPoint(ctx, `${p.name} (${p.barley}, ${p.wheat})`, p.barley, p.wheat,
        p.name === 'A' ? -34 : p.name === 'E' ? 40 : 0,
        p.name === 'E' ? 18 : -14);
    });

    if (this.stepIndex >= STEP_CURVE) {
      const progress = cruise(clamp01((this._stepEnterTime - 0.3) / 1.6));
      this._drawCurveProgress(ctx, this.stepIndex > STEP_CURVE ? 1 : progress);
    }

    // F inside
    if (this.stepIndex >= STEP_INSIDE && !freeplay) {
      const pop = cruise(clamp01((this._stepEnterTime - 0.4) / 0.7));
      if (pop > 0.02) {
        ctx.save();
        ctx.globalAlpha = pop;
        this._dot(ctx, sx(50), sy(50), c.success, 7);
        ctx.font = '700 13px Inter, system-ui';
        ctx.fillStyle = c.success;
        ctx.textAlign = 'left';
        ctx.fillText('F (50, 50)', sx(50) + 12, sy(50) - 8);
        // gap markers: idle resources between F and frontier at same barley
        const fy = sy(this.frontier(50));
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = c.error;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx(50), sy(50));
        ctx.lineTo(sx(50), fy);
        ctx.stroke();
        ctx.setLineDash([]);
        SimDraw.drawLabel(ctx, 'idle capacity', sx(50) + 62, (sy(50) + fy) / 2, { bg: c.panelBg, color: c.error });
        ctx.restore();
      }
    }

    // X beyond
    if (this.stepIndex >= STEP_BEYOND && !freeplay) {
      const pop = cruise(clamp01((this._stepEnterTime - 0.4) / 0.7));
      if (pop > 0.02) {
        ctx.save();
        ctx.globalAlpha = pop;
        const xx = sx(75), xy = sy(60);
        ctx.strokeStyle = c.error;
        ctx.lineWidth = 2.6;
        const r = 9 * pop;
        ctx.beginPath();
        ctx.moveTo(xx - r, xy - r); ctx.lineTo(xx + r, xy + r);
        ctx.moveTo(xx + r, xy - r); ctx.lineTo(xx - r, xy + r);
        ctx.stroke();
        ctx.font = '700 13px Inter, system-ui';
        ctx.fillStyle = c.error;
        ctx.textAlign = 'left';
        ctx.fillText('X (75, 60) — beyond the plot', xx + 14, xy + 4);
        ctx.restore();
      }
    }

    // freeplay walker
    if (freeplay) {
      const b = this.walkBarley;
      const w = this.frontier(Math.max(0, Math.min(100, b)));
      this._dot(ctx, sx(b), sy(w), c.warning, 7);
      // nearest lower combination for sacrifice readout
      let prev = POINTS[0];
      for (const p of POINTS) { if (p.barley <= b) prev = p; else break; }
      const sacrifice = prev.wheat - w;

      SimDraw.drawLabel(ctx,
        `${Math.round(b)} kg barley · ${Math.round(w)} kg wheat`,
        sx(b), sy(w) - 24, { bg: c.panelBg, color: c.warning });

      if (b > prev.barley + 0.01) {
        ctx.save();
        ctx.font = '600 12.5px Inter, system-ui';
        ctx.fillStyle = c.error;
        ctx.textAlign = 'left';
        ctx.fillText(`since ${prev.name}: −${(prev.wheat - w).toFixed(1)} kg wheat`, sx(b) + 14, sy(w) + 20);
        ctx.restore();
      }
    }

    // caption + takeaway
    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, W / 2, 32);
    if (freeplay) {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.55);
      ctx.fillText('Every point on the line spends everything. Inside wastes. Outside cannot happen.', W / 2, H - 16);
    }
    ctx.restore();
  }
}
