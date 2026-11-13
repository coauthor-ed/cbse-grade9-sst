import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * SurveyCycleScene — companion to blk-l04-s06. A circular year: the
 * Economic Survey reviews the past year (data cards fan in), feeds the
 * Union Budget, whose policies run through the year and produce next
 * year's data — closing the loop. Beats walk around the ring; free play
 * has a "run a year" button that spins the full cycle once.
 */

const W = 900;
const H = 560;

const STAGES = [
  { id: 'survey', label: 'ECONOMIC SURVEY', sub: 'Ministry of Finance · annual review', angle: -90 },
  { id: 'debate', label: 'PARLIAMENT', sub: 'presented before the Budget', angle: -18 },
  { id: 'budget', label: 'UNION BUDGET', sub: 'blueprint built on survey insights', angle: 54 },
  { id: 'year', label: 'THE YEAR RUNS', sub: 'policies touch farms, firms, families', angle: 126 },
  { id: 'data', label: "NEXT YEAR'S DATA", sub: 'feeds the next survey', angle: 198 },
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
  { type: 'survey', caption: 'Every year starts with a stock-taking.' },
  { type: 'debate', caption: 'It is tabled in Parliament…' },
  { type: 'budget', caption: '…just before the Budget it is meant to inform.' },
  { type: 'year', caption: 'Then the country runs on those choices.' },
  { type: 'loop', caption: 'What happens becomes data for the next Survey.' },
  { type: 'freeplay', caption: 'Run a full year and watch the loop close.' },
];

const STEP_SURVEY = 0;
const STEP_DEBATE = 1;
const STEP_BUDGET = 2;
const STEP_YEAR = 3;
const STEP_LOOP = 4;
const STEP_FREEPLAY = 5;

const BEAT_STEP_MAP = [
  [{ idx: STEP_SURVEY, dwellMs: null }],
  [{ idx: STEP_DEBATE, dwellMs: null }],
  [{ idx: STEP_BUDGET, dwellMs: null }],
  // beat 3 carries two sentences; give the scene both stages
  [{ idx: STEP_YEAR, dwellMs: 1200 }, { idx: STEP_LOOP, dwellMs: null }],
];

const CX = W / 2 + 40, CY = 300, R = 175;

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class SurveyCycleScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A circular cycle of one policy year. The Economic Survey card lights up first, then Parliament, then the ' +
    'Union Budget, then the running year, then the fresh data that returns to the next Survey. Arrows carry a ' +
    'pulse around the ring, and a run-a-year control spins the whole loop once.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'runYear', label: 'Run a full year ↻' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this._spinT = 1; // 1 = settled; <1 animating around ring

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
    if (id === 'runYear') return locked || this.stepIndex < STEP_FREEPLAY;
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
    this.stepIndex = target;
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1); this._stepEnterTime = 0; }
    else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id === 'runYear') { this._spinT = 0; }
    this.requestUiUpdate?.();
  }

  _tick(ctx, dt) {
    this._stepEnterTime += dt;
    if (this._spinT < 1) this._spinT = Math.min(1, this._spinT + dt / 5);
    if (this._lessonLinked && this._beatChainDwell != null) {
      this._beatChainDwell -= dt;
      if (this._beatChainDwell <= 0) {
        this._beatChainPos++;
        const nxt = this._beatChain?.[this._beatChainPos];
        if (nxt) {
          this.stepIndex = nxt.idx;
          this._stepEnterTime = 0;
          this._beatChainDwell = nxt.dwellMs != null ? nxt.dwellMs / 1000 : null;
        } else this._beatChainDwell = null;
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.colors.bgDeep;
    ctx.fillRect(0, 0, W, H);

    this._drawRing(ctx);
    this._drawStages(ctx);

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 36);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.55);
      ctx.fillText('The Survey is a report card AND a blueprint — every year, forever.', W / 2, H - 14);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _activeCount() {
    switch (this.stepIndex) {
      case STEP_SURVEY: return 1;
      case STEP_DEBATE: return 2;
      case STEP_BUDGET: return 3;
      case STEP_YEAR: return 4;
      default: return 5;
    }
  }

  _stageXY(st) {
    const rad = (st.angle * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  }

  _drawRing(ctx) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.accent, 0.35);
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.stroke();

    // spinning pulse during freeplay run or loop beat
    let pulseA = 0.9;
    if (this._spinT < 1) pulseA = this._spinT * 5 % 1;
    else if (this.stepIndex >= STEP_LOOP) pulseA = ((this._stepEnterTime * 0.22) % 1);
    const prad = pulseA * Math.PI * 2 - Math.PI / 2;
    const px = CX + R * Math.cos(prad), py = CY + R * Math.sin(prad);
    ctx.strokeStyle = c.warning;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(CX, CY, R, prad - 0.28, prad);
    ctx.stroke();
    this._dot(ctx, px, py, c.warning, 7);
    ctx.restore();
  }

  _dot(ctx, x, y, color, r) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  _drawStages(ctx) {
    const c = this.colors;
    const activeN = this._activeCount();

    STAGES.forEach((st, k) => {
      if (k >= activeN && !(this.stepIndex >= STEP_LOOP)) return;
      const pop = cruise(clamp01((this._stepEnterTime - 0.15 - k * 0.3) / 0.6));
      if (pop <= 0.02) return;
      const { x, y } = this._stageXY(st);
      const isActive = k === activeN - 1;

      const bw = 210, bh = 74;
      ctx.save();
      ctx.globalAlpha = pop;
      roundRectPath(ctx, x - bw / 2, y - bh / 2, bw, bh, 11);
      ctx.fillStyle = c.panelBg;
      ctx.fill();
      ctx.strokeStyle = isActive ? c.warning : SimDraw.withAlpha(c.accent, 0.7);
      ctx.lineWidth = isActive ? 2.6 : 1.6;
      ctx.stroke();

      ctx.font = '700 12px Inter, system-ui';
      ctx.fillStyle = isActive ? c.warning : c.label;
      ctx.textAlign = 'center';
      ctx.fillText(st.label, x, y - 8);
      ctx.font = '500 10px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.62);
      this._wrapCentered(ctx, st.sub, x, y + 12, bw - 20, 13);
      ctx.restore();
    });

    // side note panel about who prepares it
    if (this.stepIndex >= STEP_SURVEY) {
      const p = cruise(clamp01((this._stepEnterTime - 0.5) / 0.7));
      if (p > 0.02) {
        ctx.save();
        ctx.globalAlpha = p;
        SimDraw.drawPanel(ctx, 40, 430, 300, 92, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.success, 0.55), lineWidth: 1.5 });
        ctx.font = '600 11.5px Inter, system-ui';
        ctx.fillStyle = SimDraw.withAlpha(c.label, 0.75);
        ctx.textAlign = 'left';
        ctx.fillText('Prepared by the Ministry of Finance,', 58, 456);
        ctx.fillText('tabled in Parliament each year', 58, 474);
        ctx.fillText('before the Union Budget.', 58, 492);
        ctx.font = '700 10.5px Inter, system-ui';
        ctx.fillStyle = c.success;
        ctx.fillText('indiabudget.gov.in/economicsurvey', 58, 512);
        ctx.restore();
      }
    }
  }

  _wrapCentered(ctx, text, cx, y, maxW, lh) {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    ctx.textAlign = 'center';
    for (const wd of words) {
      const test = line ? `${line} ${wd}` : wd;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, cx, cy);
        line = wd;
        cy += lh;
      } else line = test;
    }
    if (line) ctx.fillText(line, cx, cy);
  }
}
