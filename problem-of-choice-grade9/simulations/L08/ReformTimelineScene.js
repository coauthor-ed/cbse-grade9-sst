import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * ReformTimelineScene — companion to blk-l08-s04. India's road from 1947 to
 * today along a scrubbable timeline: decades of licences-and-permits with a
 * state-dominated core sector, the 1991 crisis marker, then reforms opening
 * the gates to private enterprise, trade and competition while government
 * keeps building roads, schools and welfare. Beats advance the story;
 * free play lets you scrub any year.
 */

const W = 900;
const H = 620;

const YEAR_MIN = 1947;
const YEAR_MAX = 2020;

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
  { type: 'start', caption: '1950s–80s: the licence decades.' },
  { type: 'crisis', caption: '1991: the year the ledger ran out.' },
  { type: 'reform', caption: 'Reforms open the gates.' },
  { type: 'today', caption: 'Today: market-leaning mix, government still on duty.' },
  { type: 'freeplay', caption: 'Scrub any year. Watch who runs what.' },
];

const STEP_START = 0;
const STEP_CRISIS = 1;
const STEP_REFORM = 2;
const STEP_TODAY = 3;
const STEP_FREEPLAY = 4;

const BEAT_STEP_MAP = [
  [{ idx: STEP_START, dwellMs: null }],
  [{ idx: STEP_CRISIS, dwellMs: null }],
  [{ idx: STEP_REFORM, dwellMs: null }],
  // beat 3 ("today") keeps the modern era on screen
  [{ idx: STEP_TODAY, dwellMs: null }],
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

export class ReformTimelineScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A timeline of India from 1947 to 2020. Early decades show permit queues outside ministry windows while the ' +
    'state runs banking, transport and heavy industry; 1991 is marked as a crisis year; reforms afterwards open ' +
    'factory gates, trade arrows and competition while government continues providing roads, schools and welfare. ' +
    'A scrubber revisits any year in free play.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'slider', id: 'yearPick', label: 'Year:', min: YEAR_MIN, max: YEAR_MAX, step: 1, value: 1980 },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.yearPick = 1980;

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
    if (id === 'yearPick') return locked || this.stepIndex < STEP_FREEPLAY;
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
    this.yearPick = [1965, 1991, 1996, 2015][Math.min(target, 3)];
    this.stepIndex = target;
    this._stepEnterTime = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1); this._stepEnterTime = 0; }
    else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id === 'yearPick') this.yearPick = Math.round(Number(value));
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
    const year = freeplay ? this.yearPick : [1965, 1991, 1996, 2015][Math.min(this.stepIndex, 3)];

    // timeline bar
    const ty = 150, tx = 70, tw = W - 140;
    ctx.save();
    roundRectPath(ctx, tx, ty - 4, tw, 8, 4);
    ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.25);
    ctx.fill();

    // era shading
    const x91 = tx + tw * ((1991 - YEAR_MIN) / (YEAR_MAX - YEAR_MIN));
    ctx.fillStyle = SimDraw.withAlpha(this.colors.error, 0.18);
    ctx.fillRect(tx, ty - 4, x91 - tx, 8);

    // crisis marker
    ctx.strokeStyle = this.colors.error;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x91, ty - 26);
    ctx.lineTo(x91, ty + 26);
    ctx.stroke();
    SimDraw.drawLabel(ctx, '1991 · crisis', x91, ty - 40, { bg: c2p(this.colors.panelBg), color: this.colors.error });

    // moving cursor
    const cxr = tx + tw * ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN));
    ctx.fillStyle = this.colors.warning;
    ctx.beginPath();
    ctx.arc(cxr, ty, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '800 16px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.textAlign = 'center';
    ctx.fillText(String(year), cxr, ty + 40);
    ctx.restore();

    this._drawEra(ctx, year, freeplay);

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

  _drawEra(ctx, year, freeplay) {
    const c = this.colors;
    const preReform = year < 1991;
    const reformP = preReform ? 0 : cruise(clamp01((year - 1991) / 10));

    // left panel: state sector (always present, dominant early)
    const lx = 70, ly = 230;
    SimDraw.drawPanel(ctx, lx, ly, 350, 300, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.error, 0.55), lineWidth: 1.8 });
    ctx.save();
    ctx.font = '800 13px Inter, system-ui';
    ctx.fillStyle = c.error;
    ctx.textAlign = 'center';
    ctx.fillText('GOVERNMENT SIDE', lx + 175, ly + 26);
    ctx.font = '600 11px Inter, system-ui';
    ctx.fillStyle = c.label;
    ['banking · transport · heavy industry', 'licences & permits for production', 'roads, schools, welfare programmes'].forEach((t, k) => {
      ctx.globalAlpha = k === 2 ? Math.max(reformP, preReform ? 0.45 : 0.45) : 1;
      ctx.fillText(t, lx + 175, ly + 56 + k * 22);
    });

    // permit queue in pre-reform years
    if (preReform || reformP < 1) {
      const qp = preReform ? 1 : 1 - reformP;
      ctx.globalAlpha = qp;
      ctx.font = '700 11px Inter, system-ui';
      ctx.fillStyle = c.error;
      ctx.fillText('PERMIT QUEUE', lx + 90, ly + 170);
      for (let i = 0; i < 5; i++) {
        const px = lx + 60 + i * 15;
        const py = ly + 190 + Math.sin(this._stepEnterTime * 2 + i) * 2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = SimDraw.withAlpha(c.label, 0.7);
        ctx.fill();
      }
      // stamp
      ctx.save();
      ctx.translate(lx + 250, ly + 200);
      ctx.rotate(-0.12);
      roundRectPath(ctx, -52, -20, 104, 40, 6);
      ctx.strokeStyle = c.error;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.font = '800 11px Inter, system-ui';
      ctx.fillStyle = c.error;
      ctx.textAlign = 'center';
      ctx.fillText('APPROVED?', 0, -4);
      ctx.fillText('WAIT…', 0, 12);
      ctx.restore();
    }
    ctx.restore();

    // right panel: private sector
    const rx = W - 420, ry = 230;
    const rp = preReform ? 0.35 : 0.35 + reformP * 0.65;
    SimDraw.drawPanel(ctx, rx, ry, 350, 300, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.success, 0.55), lineWidth: 1.8 });
    ctx.save();
    ctx.font = '800 13px Inter, system-ui';
    ctx.fillStyle = c.success;
    ctx.textAlign = 'center';
    ctx.fillText('PRIVATE & MARKET SIDE', rx + 175, ry + 26);
    ctx.font = '600 11px Inter, system-ui';
    ctx.fillStyle = c.label;
    const items = [
      ['small shops & family firms', true],
      ['factories freed from licence queues', !preReform],
      ['global trade & investment flow in', !preReform],
      ['competition raises quality, lowers prices', !preReform],
    ];
    items.forEach(([t, on], k) => {
      ctx.globalAlpha = on ? 0.95 : 0.22;
      ctx.fillText(t, rx + 175, ry + 60 + k * 24);
    });

    if (!preReform) {
      // trade arrows
      const t = this._stepEnterTime;
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < 3; i++) {
        const p = ((t * 0.35 + i / 3) % 1);
        SimDraw.drawArrow(ctx, rx + 30 + p * 120, ry + 210, rx + 30 + p * 120 + 30, ry + 210, { color: c.success, lineWidth: 2.5 });
      }
      ctx.font = '600 10.5px Inter, system-ui';
      ctx.fillStyle = c.success;
      ctx.textAlign = 'left';
      ctx.fillText('trade flows', rx + 200, ry + 214);
    } else {
      ctx.font = '600 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.5);
      ctx.textAlign = 'center';
      ctx.fillText('waiting for permits before nearly anything', rx + 175, ry + 220);
    }
    ctx.restore();
  }
}

function c2p(hex) { return hex; }
