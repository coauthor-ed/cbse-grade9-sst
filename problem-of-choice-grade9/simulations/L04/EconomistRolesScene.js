import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * EconomistRolesScene — companion to blk-l04-s04. Four quadrant cards —
 * policy-making, finance, research & education, business consulting —
 * activate one per beat, each with a tiny animated glyph. Free play: a
 * picker replays any card.
 */

const W = 900;
const H = 560;

const ROLES = [
  { id: 'policy', title: 'Policy-making', sub: 'guiding governments on taxation and welfare spending', glyph: 'govt' },
  { id: 'finance', title: 'Finance', sub: 'advising investors on where to put money', glyph: 'chart' },
  { id: 'research', title: 'Research & education', sub: 'studying trends and teaching others', glyph: 'book' },
  { id: 'consulting', title: 'Business consulting', sub: 'helping firms plan growth or cut waste', glyph: 'case' },
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
  { type: 'one', caption: 'Where do economists actually work?' },
  { type: 'two', caption: 'Some steer public money.' },
  { type: 'three', caption: 'Some grow private money.' },
  { type: 'four', caption: 'And some study, teach and advise.' },
  { type: 'freeplay', caption: 'Pick a card — every role runs on the same data-first habit.' },
];

const STEP_ONE = 0;
const STEP_TWO = 1;
const STEP_THREE = 2;
const STEP_FOUR = 3;
const STEP_FREEPLAY = 4;

const BEAT_STEP_MAP = [
  [{ idx: STEP_TWO, dwellMs: null }],
  [{ idx: STEP_THREE, dwellMs: null }],
  [{ idx: STEP_FOUR, dwellMs: null }],
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

export class EconomistRolesScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Four role cards light up in turn as economists\' workplaces: policy-making for governments, finance advice ' +
    'for investors, research and education, and business consulting. Each carries a small animated icon; a picker ' +
    'replays a chosen card in free play.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    {
      type: 'select', id: 'rolePick', label: 'Replay a card:', options: ROLES.map((r) => ({ value: r.id, label: r.title })),
    },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this.rolePick = 'policy';

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
    if (id === 'rolePick') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'rolePick') { this.rolePick = String(value); this._stepEnterTime = 0; }
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
    const visibleCount = freeplay ? ROLES.length : this.stepIndex + 1;

    const positions = [
      [90, 80], [465, 80], [90, 300], [465, 300],
    ];

    ROLES.forEach((r, k) => {
      if (k >= visibleCount) return;
      let pop = cruise(clamp01((this._stepEnterTime - 0.15) / 0.7));
      if (!freeplay && k < visibleCount - 1) pop = 1;
      const focus = freeplay && r.id === this.rolePick;
      this._card(ctx, positions[k][0], positions[k][1], r, pop, focus);
    });

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 40);
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _card(ctx, x, y, role, pop, focus) {
    if (pop <= 0.02) return;
    const c = this.colors;
    const bw = 345, bh = 185;

    ctx.save();
    ctx.globalAlpha = pop;
    SimDraw.drawPanel(ctx, x, y, bw, bh, {
      bg: c.panelBg,
      radius: 14,
      stroke: focus ? c.warning : SimDraw.withAlpha(c.accent, 0.55),
      lineWidth: focus ? 3 : 1.6,
    });

    ctx.fillStyle = focus ? c.warning : c.accent;
    this._glyph(ctx, x + 56, y + 58, role.glyph, focus ? c.warning : c.accent);

    ctx.font = '700 16px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'left';
    ctx.fillText(role.title, x + 108, y + 52);
    ctx.font = '500 12px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.68);
    // wrap sub into two lines
    this._wrap(ctx, role.sub, x + 108, y + 76, bw - 130, 17);

    // animated underline
    const uw = (bw - 216) * (focus ? (Math.sin(this._stepEnterTime * 2.4) + 1) / 2 : 0.6);
    roundRectPath(ctx, x + 108, y + bh - 34, 120 + uw, 5, 2.5);
    ctx.fillStyle = focus ? SimDraw.withAlpha(c.warning, 0.85) : SimDraw.withAlpha(c.accent, 0.6);
    ctx.fill();
    ctx.restore();
  }

  _wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    for (const wd of words) {
      const test = line ? `${line} ${wd}` : wd;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, cy);
        line = wd;
        cy += lh;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, cy);
  }

  _glyph(ctx, x, y, kind, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    switch (kind) {
      case 'govt':
        ctx.moveTo(x - 16, y - 4); ctx.lineTo(x, y - 16); ctx.lineTo(x + 16, y - 4);
        ctx.moveTo(x - 13, y - 3); ctx.lineTo(x - 13, y + 10);
        ctx.moveTo(x + 13, y - 3); ctx.lineTo(x + 13, y + 10);
        ctx.moveTo(x - 16, y + 12); ctx.lineTo(x + 16, y + 12);
        break;
      case 'chart':
        ctx.moveTo(x - 14, y + 12); ctx.lineTo(x - 14, y - 12);
        ctx.lineTo(x + 14, y - 12); ctx.lineTo(x + 14, y + 12); ctx.lineTo(x - 14, y + 12);
        ctx.moveTo(x - 8, y + 6); ctx.lineTo(x - 2, y);
        ctx.moveTo(x - 2, y); ctx.lineTo(x + 3, y + 4);
        ctx.moveTo(x + 3, y + 4); ctx.lineTo(x + 9, y - 6);
        break;
      case 'book':
        ctx.moveTo(x, y - 10);
        ctx.quadraticCurveTo(x - 12, y - 16, x - 15, y - 8);
        ctx.lineTo(x - 15, y + 10);
        ctx.quadraticCurveTo(x - 8, y + 2, x, y + 8);
        ctx.quadraticCurveTo(x + 8, y + 2, x + 15, y + 10);
        ctx.lineTo(x + 15, y - 8);
        ctx.quadraticCurveTo(x + 12, y - 16, x, y - 10);
        break;
      default:
        roundRectPath(ctx, x - 14, y - 8, 28, 20, 3);
        ctx.moveTo(x - 6, y - 8);
        ctx.quadraticCurveTo(x, y - 16, x + 6, y - 8);
        break;
    }
    ctx.stroke();
    ctx.restore();
  }
}
