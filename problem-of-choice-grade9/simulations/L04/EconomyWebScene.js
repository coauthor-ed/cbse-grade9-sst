import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * EconomyWebScene — companion to blk-l04-s02. Four economic entities —
 * consumers, producers, government, financial institutions — sit in a
 * ring. Beats light up the flows between them one at a time (wages,
 * prices, taxes, loans) until the whole web pulses: an economy is these
 * interactions, not any single player.
 */

const W = 900;
const H = 560;

const NODES = [
  { id: 'consumers', label: 'Consumers', x: W / 2, y: 130 },
  { id: 'producers', label: 'Producers', x: W - 170, y: 330 },
  { id: 'govt', label: 'Government', x: W / 2, y: 500 },
  { id: 'banks', label: 'Financial institutions', x: 170, y: 330 },
];

// flows: [fromIdx, toIdx, label]
const FLOWS = [
  [0, 1, 'spending'],
  [1, 0, 'goods & services'],
  [0, 2, 'taxes'],
  [2, 0, 'public services'],
  [1, 2, 'taxes'],
  [2, 1, 'roads, rules'],
  [3, 1, 'loans'],
  [1, 3, 'interest & savings'],
];

const COLOR_TOKEN_MAP = {
  bgDeep:   ['--sim-bg-deep', '#0a0f1e'],
  panelBg:  ['--sim-bg-surface', '#111827'],
  label:    ['--sim-label', '#e2e8f0'],
  accent:   ['--sim-accent', '#818cf8'],
  success:  ['--sim-success', '#34d399'],
  error:    ['--sim-error', '#f87171'],
  warning:  ['--sim-warning', '#fbbf24'],
  water:    ['--sim-water', '#38bdf8'],
};

const STEPS = [
  { type: 'nodes', caption: 'Four kinds of players share every economy.' },
  { type: 'flows', caption: 'And they never stop passing things around.' },
  { type: 'pulse', caption: 'Wages, prices, taxes, loans — the web is the economy.' },
  { type: 'freeplay', caption: 'Hover a flow by picking it below; watch who pays whom.' },
];

const STEP_NODES = 0;
const STEP_FLOWS = 1;
const STEP_PULSE = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_NODES, dwellMs: null }],
  [{ idx: STEP_FLOWS, dwellMs: null }],
  [{ idx: STEP_PULSE, dwellMs: null }],
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

export class EconomyWebScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A ring of four economic entities — consumers, producers, government and financial institutions. Arrows ' +
    'light up one at a time showing spending, goods, taxes, public services, loans and interest flowing between ' +
    'them, until the whole web pulses together as the economy. A picker highlights a single flow in free play.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'pulse', label: 'Pulse all flows' },
    {
      type: 'select', id: 'flowPick', label: 'Inspect a flow:', options: FLOWS.map((f, i) => ({
        value: String(i),
        label: `${NODES[f[0]].label} → ${NODES[f[1]].label}: ${f[2]}`,
      })),
    },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.flowPick = '0';

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
    if (id === 'pulse' || id === 'flowPick') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'flowPick') this.flowPick = String(value);
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

  _nodeAlpha(i) {
    return cruise(clamp01((this._stepEnterTime - 0.15 - i * 0.25) / 0.6));
  }

  _visibleFlows() {
    if (this.stepIndex === STEP_FLOWS) {
      return Math.min(FLOWS.length, Math.floor(clamp01((this._stepEnterTime - 0.2) / 2.4) * FLOWS.length));
    }
    return this.stepIndex >= STEP_FLOWS ? FLOWS.length : 0;
  }

  _edgePoint(from, to, t) {
    // curve control point pushed toward center for arc feel
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
    const cxp = mx + (W / 2 - mx) * 0.35;
    const cyp = my + (H / 2 - my) * 0.35;
    const u = 1 - t;
    return {
      x: u * u * from.x + 2 * u * t * cxp + t * t * to.x,
      y: u * u * from.y + 2 * u * t * cyp + t * t * to.y,
    };
  }

  _drawFlow(ctx, f, k, highlight) {
    const c = this.colors;
    const from = NODES[f[0]], to = NODES[f[1]];
    const appear = cruise(clamp01((this._stepEnterTime - 0.2 - k * 0.28) / 0.5));
    if (appear <= 0.02) return;

    const color = highlight ? c.warning : k % 3 === 0 ? c.success : k % 3 === 1 ? c.accent : c.water;
    const alpha = highlight ? 1 : 0.55 + 0.25 * Math.sin(this._stepEnterTime * 2.5 + k);

    ctx.save();
    ctx.globalAlpha = appear * alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = highlight ? 3.5 : 2.2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const mx = (from.x + to.x) / 2 + (W / 2 - (from.x + to.x) / 2) * 0.35;
    const my = (from.y + to.y) / 2 + (H / 2 - (from.y + to.y) / 2) * 0.35;
    ctx.quadraticCurveTo(mx, my, to.x, to.y);
    ctx.stroke();

    // moving dot along path
    const tt = ((this._stepEnterTime * 0.45 + k * 0.13) % 1);
    const pt = this._edgePoint(from, to, tt);
    this._dot(ctx, pt.x, pt.y, color, highlight ? 6 : 4);

    // label near midpoint
    ctx.font = '600 11px Inter, system-ui';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(f[2], mx + (mx < W / 2 ? -34 : 34), my + 14);
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

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';

    // nodes
    NODES.forEach((n, i) => {
      const a = this._nodeAlpha(i);
      if (a <= 0.02) return;
      ctx.save();
      ctx.globalAlpha = a;
      const isFocus = freeplay && FLOWS[Number(this.flowPick)] && (FLOWS[Number(this.flowPick)][0] === i || FLOWS[Number(this.flowPick)][1] === i);
      const bw = 190, bh = 62;
      roundRectPath(ctx, n.x - bw / 2, n.y - bh / 2, bw, bh, 12);
      ctx.fillStyle = c.panelBg;
      ctx.fill();
      ctx.strokeStyle = isFocus ? c.warning : SimDraw.withAlpha(c.accent, 0.65);
      ctx.lineWidth = isFocus ? 3 : 2;
      ctx.stroke();

      // tiny glyph
      ctx.fillStyle = isFocus ? c.warning : c.accent;
      this._glyph(ctx, n.x - bw / 2 + 26, n.y, i);
      ctx.font = '700 13px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.textAlign = 'left';
      ctx.fillText(n.label, n.x - bw / 2 + 46, n.y + 4);
      ctx.restore();
    });

    // flows
    if (freeplay) {
      const idx = Math.max(0, Math.min(FLOWS.length - 1, Number(this.flowPick)));
      FLOWS.forEach((f, k) => this._drawFlow(ctx, f, k, k === idx));
    } else if (this.stepIndex >= STEP_FLOWS) {
      const vis = this._visibleFlows();
      for (let k = 0; k < vis; k++) this._drawFlow(ctx, FLOWS[k], k, false);
      if (this.stepIndex >= STEP_PULSE) {
        // whole-web breathing ring
        const pulse = (Math.sin(this._stepEnterTime * 2) + 1) / 2;
        ctx.save();
        ctx.globalAlpha = 0.10 + pulse * 0.08;
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.ellipse(W / 2, (130 + 500) / 2 - 15, W / 2 - 60, 250, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText(step.caption, W / 2, 36);
    ctx.restore();
  }

  _glyph(ctx, x, y, kind) {
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    switch (kind) {
      case 0: // consumer: person
        ctx.arc(x, y - 6, 5, 0, Math.PI * 2);
        ctx.moveTo(x - 7, y + 10); ctx.quadraticCurveTo(x, y - 1, x + 7, y + 10);
        break;
      case 1: // producer: factory
        ctx.rect(x - 9, y - 4, 18, 12);
        ctx.moveTo(x - 9, y - 4); ctx.lineTo(x - 9, y - 10); ctx.lineTo(x - 2, y - 4);
        ctx.moveTo(x + 1, y - 4); ctx.lineTo(x + 1, y - 10); ctx.lineTo(x + 8, y - 4);
        break;
      case 2: // government: building
        ctx.moveTo(x - 9, y - 6); ctx.lineTo(x, y - 12); ctx.lineTo(x + 9, y - 6);
        ctx.moveTo(x - 7, y - 5); ctx.lineTo(x - 7, y + 8);
        ctx.moveTo(x + 7, y - 5); ctx.lineTo(x + 7, y + 8);
        ctx.moveTo(x - 9, y + 9); ctx.lineTo(x + 9, y + 9);
        break;
      default: // bank/finance: coin
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4);
        ctx.moveTo(x - 3, y - 2); ctx.lineTo(x + 3, y - 2);
        ctx.moveTo(x - 3, y + 2); ctx.lineTo(x + 3, y + 2);
        break;
    }
    ctx.stroke();
    ctx.restore();
  }
}
