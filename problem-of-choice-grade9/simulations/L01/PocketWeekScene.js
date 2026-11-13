import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * PocketWeekScene — companion to blk-l01-s06. Meera has ₹500 for the week;
 * her wish-list totals ₹750. Beats fill the budget bar and then overshoot it
 * in red. Free play: the student buys items one at a time and watches the
 * money run out — the squeeze that forces a choice.
 */

const W = 900;
const H = 560;

const BUDGET = 500;
const ITEMS = [
  { id: 'snacks', label: 'Snacks', cost: 150 },
  { id: 'movie', label: 'Movie ticket', cost: 200 },
  { id: 'topup', label: 'Game top-up', cost: 150 },
  { id: 'gift', label: 'Gift for brother', cost: 250 },
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
  { type: 'list', caption: '₹500 in the purse, ₹750 on the list.' },
  { type: 'overshoot', caption: 'The list costs ₹750. The purse holds ₹500.' },
  { type: 'freeplay', caption: 'Buy what you can — the money runs out before the list does.' },
];

const STEP_LIST = 0;
const STEP_OVERSHOOT = 1;
const STEP_FREEPLAY = 2;

const BEAT_STEP_MAP = [
  [{ idx: STEP_LIST, dwellMs: null }],
  [{ idx: STEP_OVERSHOOT, dwellMs: null }],
  [{ idx: STEP_FREEPLAY, dwellMs: null }],
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

const rupee = (n) => `₹${n}`;

export class PocketWeekScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A weekly budget bar of five hundred rupees. Four wished-for items — snacks, a movie ticket, a game top-up ' +
    'and a gift — total seven hundred and fifty rupees, pushing the bar past its limit into red. In free play, ' +
    'buying items one at a time exhausts the budget before the list is finished.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    ...ITEMS.map((it) => ({ type: 'button', id: `buy-${it.id}`, label: `Buy ${it.label} (−${rupee(it.cost)})` })),
    { type: 'button', id: 'reset', label: 'Reset week' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.bought = new Set();

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
    if (id.startsWith('buy-') || id === 'reset') return locked;
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
    else if (id === 'reset') this.bought.clear();
    else if (id.startsWith('buy-')) {
      const item = ITEMS.find((it) => `buy-${it.id}` === id);
      const spent = this._spent();
      if (item && spent < BUDGET) this.bought.add(item.id);
    }
    this.requestUiUpdate?.();
  }

  _spent() {
    return ITEMS.filter((it) => this.bought.has(it.id)).reduce((s, it) => s + it.cost, 0);
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

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';

    // In beats 0-1 the full wish-list is shown; in free play show purchases.
    const shownItems = freeplay ? ITEMS.map((it) => ({ ...it, on: this.bought.has(it.id) }))
      : ITEMS.map((it) => ({ ...it, on: true }));

    // ---- budget bar ----
    const bx = 60, by = 90, bw = W - 120, bh = 46;
    const totalList = ITEMS.reduce((s, it) => s + it.cost, 0);
    const spent = this._spent();

    SimDraw.drawPanel(ctx, bx - 16, by - 46, bw + 32, bh + 74, { bg: c.panelBg, radius: 12, stroke: SimDraw.withAlpha(c.accent, 0.5), lineWidth: 1.5 });

    ctx.save();
    ctx.font = '600 13px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.8);
    ctx.textAlign = 'left';
    ctx.fillText(`MEERA'S WEEK: ${rupee(BUDGET)}`, bx, by - 22);
    ctx.textAlign = 'right';
    if (freeplay) {
      ctx.fillStyle = spent > BUDGET ? c.error : c.success;
      ctx.fillText(`${rupee(BUDGET - Math.min(spent, BUDGET))} left`, bx + bw, by - 22);
    } else if (this.stepIndex === STEP_LIST) {
      ctx.fillStyle = c.label;
      ctx.fillText(`wish-list: ${ITEMS.length} items`, bx + bw, by - 22);
    } else {
      ctx.fillStyle = c.error;
      ctx.fillText(`list adds up to ${rupee(totalList)}`, bx + bw, by - 22);
    }
    ctx.restore();

    // track
    ctx.save();
    roundRectPath(ctx, bx, by, bw, bh, 10);
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.12);
    ctx.fill();
    ctx.restore();

    // budget limit marker at 500 of 750 scale
    const scaleMax = Math.max(totalList, BUDGET);
    const limitX = bx + bw * (BUDGET / scaleMax);
    ctx.save();
    ctx.strokeStyle = c.label;
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(limitX, by - 8);
    ctx.lineTo(limitX, by + bh + 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '600 11px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText('budget ends here', limitX, by + bh + 24);
    ctx.restore();

    // fill — beat 1 grows the bar up to the purse's limit in green; beat 2
    // resumes from there so only the overshoot past the marker extends,
    // recoloured red; free play tracks purchases live.
    const limitW = limitX - bx;
    const p = cruise(clamp01(this._stepEnterTime / 1.4));
    const targetW = freeplay ? bw * (spent / scaleMax)
      : this.stepIndex === STEP_LIST ? limitW : bw;
    const startW = this.stepIndex === STEP_OVERSHOOT && !freeplay ? limitW : 0;
    const fillW = freeplay ? targetW : startW + (targetW - startW) * p;
    if (fillW > 1) {
      ctx.save();
      roundRectPath(ctx, bx, by, fillW, bh, 10);
      ctx.fillStyle = SimDraw.withAlpha(c.success, 0.75);
      ctx.fill();
      if (fillW > limitW) {
        ctx.clip();
        ctx.fillStyle = SimDraw.withAlpha(c.error, 0.75);
        ctx.fillRect(limitX, by - 8, fillW - limitW + 16, bh + 16);
      }
      ctx.restore();
    }

    // ---- item cards ----
    const cy = 300;
    shownItems.forEach((it, k) => {
      const cx = 60 + (W - 120) * (k + 0.5) / shownItems.length;
      const appear = this.stepIndex === STEP_LIST ? cruise(clamp01((this._stepEnterTime - k * 0.3) / 0.7)) : 1;
      if (appear < 0.02) return;
      const boughtNow = freeplay && it.on;
      ctx.save();
      ctx.globalAlpha = appear * (freeplay && !it.on && spent >= BUDGET ? 0.4 : 1);
      const w = 150, h = 92;
      SimDraw.drawPanel(ctx, cx - w / 2, cy - h / 2, w, h, {
        bg: c.panelBg,
        radius: 10,
        stroke: boughtNow ? SimDraw.withAlpha(c.success, 0.9) : SimDraw.withAlpha(c.accent, 0.5),
        lineWidth: 1.6,
      });
      ctx.textAlign = 'center';
      ctx.font = '600 13.5px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.fillText(it.label, cx, cy - 12);
      ctx.font = '700 17px Inter, system-ui';
      ctx.fillStyle = c.accent;
      ctx.fillText(rupee(it.cost), cx, cy + 14);
      if (boughtNow) {
        ctx.font = '700 12px Inter, system-ui';
        ctx.fillStyle = c.success;
        ctx.fillText('BOUGHT', cx, cy + 36);
      }
      ctx.restore();
    });

    // ---- verdict line ----
    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    if (!freeplay) {
      ctx.font = '700 18px Inter, system-ui';
      if (this.stepIndex === STEP_LIST) {
        ctx.fillStyle = c.label;
        ctx.fillText(`${ITEMS.length} wishes on the list. ${rupee(BUDGET)} in the purse.`, W / 2, 420);
      } else {
        ctx.fillStyle = c.error;
        ctx.fillText(`${rupee(totalList - BUDGET)} of wishes. Zero extra rupees.`, W / 2, 420);
      }
      ctx.font = '600 13px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.fillText(step.caption, W / 2, 36);
    } else {
      const left = BUDGET - spent;
      ctx.font = '700 17px Inter, system-ui';
      ctx.fillStyle = left <= 0 ? c.error : c.label;
      ctx.fillText(left <= 0 ? 'Purse empty — and the list is not finished.' : `${rupee(left)} still in the purse.`, W / 2, 420);
      ctx.font = '600 13px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.fillText(step.caption, W / 2, 36);
    }
    ctx.restore();
  }
}
