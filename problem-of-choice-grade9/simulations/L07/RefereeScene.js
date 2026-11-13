import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * RefereeScene — companion to blk-l07-s02. A football-pitch view of a market
 * economy: buyers and sellers play the game themselves and prices move with
 * the ball; a referee walks the sideline and intervenes ONLY on fouls —
 * unsafe goods, cheating, monopoly chokeholds — never on goals or prices.
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
  inkOnFill: ['--sim-ink-on-fill', '#101a30'],
};

const FOULS = [
  { id: 'adulterate', label: 'selling adulterated oil' },
  { id: 'cheat', label: 'rigging the weighing scale' },
  { id: 'monopoly', label: 'ganging up to fix prices' },
];

const STEPS = [
  { type: 'play', caption: 'The players set the pace. Nobody directs the ball.' },
  { type: 'refEnters', caption: 'One official takes the sideline.' },
  { type: 'whistle', caption: 'The referee acts on fouls — not on goals.' },
  { type: 'freeplay', caption: 'Trigger fouls yourself and watch what gets called.' },
];

const STEP_PLAY = 0;
const STEP_REF = 1;
const STEP_WHISTLE = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_PLAY, dwellMs: null }],
  [{ idx: STEP_REF, dwellMs: 1400 }, { idx: STEP_WHISTLE, dwellMs: null }],
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

export class RefereeScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A football pitch seen from above stands in for a market economy. Sellers and buyers pass a ball labelled ' +
    'price while a referee stays on the sideline; when a seller fouls — adulterating oil, rigging scales or fixing ' +
    'prices — the referee whistles and shows a card, then play resumes untouched. In free play students can trigger ' +
    'each kind of foul.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    ...FOULS.map((f, i) => ({ type: 'button', id: `foul-${f.id}`, label: `Foul ${i + 1}: ${f.label}` })),
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;
    this._foulsCalled = [];

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
    if (id.startsWith('foul-')) return locked || this.stepIndex < STEP_WHISTLE;
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
    if (this.stepIndex >= STEP_WHISTLE && !this._foulsCalled.includes('adulterate')) this._foulsCalled.push('adulterate');
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') { this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1); this._stepEnterTime = 0; }
    else if (id === 'prev') { this.stepIndex = Math.max(0, this.stepIndex - 1); this._stepEnterTime = 0; }
    else if (id.startsWith('foul-')) {
      const fid = id.slice(5);
      if (!this._foulsCalled.includes(fid)) this._foulsCalled.push(fid);
    }
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

    this._drawPitch(ctx);
    this._drawPlayers(ctx);
    if (this.stepIndex >= STEP_REF) this._drawReferee(ctx);
    this._drawFoulLog(ctx);

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 32);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.55);
      ctx.fillText('Notice what never draws a whistle: a goal, or a higher price.', W / 2, H - 12);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _drawPitch(ctx) {
    const c = this.colors;
    const px = 60, py = 70, pw = W - 120, ph = H - 190;
    roundRectPath(ctx, px, py, pw, ph, 14);
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.5);
    ctx.lineWidth = 3;
    ctx.stroke();

    // centre line + circle
    ctx.beginPath();
    ctx.moveTo(px + pw / 2, py);
    ctx.lineTo(px + pw / 2, py + ph);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph / 2, 52, 0, Math.PI * 2);
    ctx.stroke();

    // goal boxes
    roundRectPath(ctx, px, py + ph / 2 - 60, 70, 120, 6);
    ctx.stroke();
    roundRectPath(ctx, px + pw - 70, py + ph / 2 - 60, 70, 120, 6);
    ctx.stroke();
  }

  _player(ctx, x, y, team) {
    const c = this.colors;
    ctx.save();
    ctx.fillStyle = team === 'seller' ? c.accent : c.success;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '700 9px Inter, system-ui';
    ctx.fillStyle = c.inkOnFill;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(team === 'seller' ? 'S' : 'B', x, y + 0.5);
    ctx.restore();
  }

  _drawPlayers(ctx) {
    const c = this.colors;
    const px = 60, py = 70, pw = W - 120, ph = H - 190;
    const t = this._stepEnterTime;

    const sellers = [
      { x: px + pw * 0.28 + Math.sin(t * 0.9) * 26, y: py + ph * 0.3 + Math.cos(t * 0.7) * 18 },
      { x: px + pw * 0.72 + Math.cos(t * 0.8) * 24, y: py + ph * 0.62 + Math.sin(t * 0.6) * 20 },
      { x: px + pw * 0.5 + Math.sin(t * 0.5 + 2) * 30, y: py + ph * 0.78 },
    ];
    const buyers = [
      { x: px + pw * 0.36 + Math.cos(t * 0.75 + 1) * 24, y: py + ph * 0.68 },
      { x: px + pw * 0.64 + Math.sin(t * 0.85 + 3) * 22, y: py + ph * 0.32 },
      { x: px + pw * 0.5 + Math.cos(t * 0.6 + 4) * 26, y: py + ph * 0.16 },
    ];
    sellers.forEach((p) => this._player(ctx, p.x, p.y, 'seller'));
    buyers.forEach((p) => this._player(ctx, p.x, p.y, 'buyer'));

    // ball labelled PRICE travels between them
    const phase = (t * 0.35) % 1;
    const a = sellers[Math.floor(phase * 3) % 3];
    const b = buyers[Math.floor(phase * 3 + 1) % 3];
    const bx = a.x + (b.x - a.x) * cruise(clamp01((phase % (1 / 3)) * 3));
    const by = a.y + (b.y - a.y) * cruise(clamp01((phase % (1 / 3)) * 3));
    ctx.save();
    ctx.fillStyle = c.warning;
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '800 8px Inter, system-ui';
    ctx.fillStyle = '#1f1500';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', bx, by + 0.5);
    ctx.restore();

    // foul flashes near a random seller once fouls exist
    this._foulsCalled.forEach((fid, k) => {
      const foul = FOULS.find((f) => f.id === fid);
      if (!foul) return;
      const src = sellers[k % sellers.length];
      const age = clamp01(((t - k * 0.7) % 3) / 3);
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.font = '700 11px Inter, system-ui';
      ctx.fillStyle = c.error;
      ctx.textAlign = 'center';
      ctx.fillText(`✗ ${foul.label}`, src.x, src.y - 22 - age * 14);
      ctx.restore();
    });
  }

  _drawReferee(ctx) {
    const c = this.colors;
    const t = this._stepEnterTime;
    const rx = 90 + (Math.sin(t * 0.4) + 1) / 2 * (W - 240);
    const ry = H - 92;

    ctx.save();
    ctx.fillStyle = c.error;
    ctx.beginPath();
    ctx.arc(rx, ry, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '700 9px Inter, system-ui';
    ctx.fillStyle = c.inkOnFill;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', rx, ry + 0.5);
    ctx.font = '700 10px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.fillText('referee', rx, ry + 22);
    ctx.restore();

    if (this._foulsCalled.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6);
      SimDraw.drawLabel(ctx, 'WHISTLE!', rx, ry - 24, { bg: c.panelBg, color: c.error });
      ctx.restore();
    }
  }

  _drawFoulLog(ctx) {
    if (!this._foulsCalled.length) return;
    const c = this.colors;
    const x = W - 300, y = 84;
    SimDraw.drawPanel(ctx, x, y, 240, 30 + this._foulsCalled.length * 24, { bg: c.panelBg, radius: 10, stroke: c.error, lineWidth: 1.6 });
    ctx.save();
    ctx.font = '700 11px Inter, system-ui';
    ctx.fillStyle = c.error;
    ctx.textAlign = 'left';
    ctx.fillText('CARDS SHOWN', x + 14, y + 20);
    this._foulsCalled.forEach((fid, k) => {
      const foul = FOULS.find((f) => f.id === fid);
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = c.label;
      ctx.fillText(`🟨 ${foul.label}`, x + 14, y + 42 + k * 24);
    });
    ctx.restore();
  }
}
