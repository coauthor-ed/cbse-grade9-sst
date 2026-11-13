import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise } from 'simulations/base/SimMotion.js';

/**
 * ChoiceChainScene — companion to blk-l09-s01. The whole chapter assembled
 * as one chain: unlimited wants meet limited resources → scarcity → choices
 * carrying opportunity costs → the three key questions → different economic
 * systems answering them → everyone mixing in practice. The farmer's little
 * field appears inside every node — one plot of land, seen through each
 * lens in turn.
 */

const W = 900;
const H = 620;

const NODES = [
  { id: 'clash', title: 'WANTS × RESOURCES', sub: 'endless wishes, finite means', glyph: 'clash' },
  { id: 'scarcity', title: 'SCARCITY', sub: 'the permanent squeeze', glyph: 'gate' },
  { id: 'choice', title: 'CHOICES · OPPORTUNITY COST', sub: 'every yes is a no to something', glyph: 'scale' },
  { id: 'three', title: 'WHAT · HOW · FOR WHOM', sub: "every economy's three questions", glyph: 'trident' },
  { id: 'systems', title: 'PLANNED ⇄ MARKET', sub: 'who answers the questions?', glyph: 'twoflags' },
  { id: 'mixed', title: 'EVERYONE MIXES', sub: 'India 1991 onward, like most of the world', glyph: 'blend' },
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
  { type: 's0', caption: 'The chapter began with a collision.' },
  { type: 's1', caption: 'Scarcity forced choices.' },
  { type: 's2', caption: 'Every choice carried its hidden price.' },
  { type: 's3', caption: 'Choices raised three great questions.' },
  { type: 's4', caption: 'Systems answer them differently.' },
  { type: 's5', caption: 'And in practice… everyone mixes.' },
  { type: 'freeplay', caption: 'Walk the whole chain again from any link.' },
];

const STEP_S0 = 0;
const STEP_S5 = 5;
const STEP_FREEPLAY = 6;

// beats 0..4 advance two nodes each on the last beat? No — one node per beat, beat 4 covers nodes 4+5.
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
  [{ idx: 3, dwellMs: null }],
  [{ idx: 4, dwellMs: 1100 }, { idx: 5, dwellMs: null }],
];

// snake grid: 2 rows x 3 cols with real gutters so connectors live between cards
const BW = 250;
const BH = 170;
const POS = [
  [30, 115], [325, 115], [620, 115],
  [620, 355], [325, 355], [30, 355],
];
const TOP_MID = POS[0][1] + BH / 2;
const BOT_MID = POS[3][1] + BH / 2;
const COL3_CX = POS[2][0] + BW / 2;

// edge-to-edge segments in the gutters: right along the top, down the right column, left along the bottom
const CONNECTORS = [
  { x1: POS[0][0] + BW, y1: TOP_MID, x2: POS[1][0], y2: TOP_MID },
  { x1: POS[1][0] + BW, y1: TOP_MID, x2: POS[2][0], y2: TOP_MID },
  { x1: COL3_CX, y1: POS[2][1] + BH, x2: COL3_CX, y2: POS[3][1] },
  { x1: POS[3][0], y1: BOT_MID, x2: POS[4][0] + BW, y2: BOT_MID },
  { x1: POS[4][0], y1: BOT_MID, x2: POS[5][0] + BW, y2: BOT_MID },
];
const HEAD_LEN = 11;

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class ChoiceChainScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'The chapter assembled as a six-link chain: unlimited wants meeting limited resources, scarcity, choices with ' +
    'opportunity costs, the three key questions, planned versus market systems, and the mixed economies everyone ' +
    'becomes in practice. A small farm-plot icon sits inside every link, showing one field viewed through each ' +
    'idea in turn.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    { type: 'button', id: 'replayAll', label: 'Replay the chain ↻' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;

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
    if (id === 'replayAll') return locked || this.stepIndex < STEP_FREEPLAY;
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
    else if (id === 'replayAll') { this.stepIndex = 0; this._stepEnterTime = 0; }
    this.requestUiUpdate?.();
  }

  _tick(ctx, dt) {
    this._stepEnterTime += dt;
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

    NODES.forEach((n, k) => {
      let pop = cruise(clamp01((this._stepEnterTime - 0.15 - k * 0.22) / 0.7));
      if (k <= this.stepIndex - 1 || STEPS[this.stepIndex].type === 'freeplay') pop = k < this.stepIndex || STEPS[this.stepIndex].type === 'freeplay' ? 1 : pop;
      if (k > this.stepIndex && STEPS[this.stepIndex].type !== 'freeplay') return;
      const [x, y] = POS[k];
      this._node(ctx, x, y, n, pop, k === this.stepIndex);
    });

    // gutter connectors: flowing dashes + solid heads, revealed link by link
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(this.colors.accent, 0.75);
    ctx.fillStyle = SimDraw.withAlpha(this.colors.accent, 0.9);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.setLineDash([9, 7]);
    ctx.lineDashOffset = -((this._stepEnterTime * 26) % 16);
    for (let k = 0; k < CONNECTORS.length; k++) {
      if (k >= this.stepIndex && STEPS[this.stepIndex].type !== 'freeplay') break;
      const { x1, y1, x2, y2 } = CONNECTORS[k];
      const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
      const px = -dy, py = dx;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 - dx * (HEAD_LEN - 3), y2 - dy * (HEAD_LEN - 3));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - dx * HEAD_LEN + px * HEAD_LEN * 0.45, y2 - dy * HEAD_LEN + py * HEAD_LEN * 0.45);
      ctx.lineTo(x2 - dx * HEAD_LEN - px * HEAD_LEN * 0.45, y2 - dy * HEAD_LEN - py * HEAD_LEN * 0.45);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = clamp01(this._stepEnterTime / 0.4);
    ctx.textAlign = 'center';
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = this.colors.label;
    ctx.fillText(STEPS[this.stepIndex].caption, W / 2, 36);
    if (STEPS[this.stepIndex].type === 'freeplay') {
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillStyle = SimDraw.withAlpha(this.colors.label, 0.55);
      ctx.fillText('Same field in every box — only the lens changed.', W / 2, H - 14);
    }
    ctx.restore();
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _node(ctx, x, y, n, pop, active) {
    if (pop <= 0.02) return;
    const c = this.colors;
    const bw = 250, bh = 170;

    ctx.save();
    ctx.globalAlpha = pop;
    SimDraw.drawPanel(ctx, x, y, bw, bh, {
      bg: c.panelBg,
      radius: 14,
      stroke: active ? c.warning : SimDraw.withAlpha(c.accent, 0.55),
      lineWidth: active ? 3 : 1.6,
    });

    ctx.fillStyle = c.accent;
    this._glyph(ctx, x + bw / 2, y + 44, n.glyph, active ? c.warning : c.accent);

    ctx.font = '800 13px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(n.title, x + bw / 2, y + 92);

    ctx.font = '500 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.65);
    this._wrapCentered(ctx, n.sub, x + bw / 2, y + 114, bw - 24, 15);

    // the farmer's tiny field motif
    this._fieldIcon(ctx, x + 26, y + bh - 24);
    ctx.font = '600 9.5px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.success, 0.8);
    ctx.textAlign = 'left';
    ctx.fillText('same field, new lens', x + 42, y + bh - 20);
    ctx.restore();
  }

  _fieldIcon(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = this.colors.success;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    roundRectPath(ctx, x - 13, y - 9, 26, 18, 4);
    ctx.stroke();
    // three sprouts, each a stem with two leaves
    for (const dx of [-7, 0, 7]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + 5);
      ctx.lineTo(x + dx, y - 3);
      ctx.moveTo(x + dx, y - 3);
      ctx.lineTo(x + dx - 3.5, y - 6.5);
      ctx.moveTo(x + dx, y - 0.5);
      ctx.lineTo(x + dx + 3.5, y - 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  _glyph(ctx, x, y, kind, color) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // small filled triangular arrowhead pointing at (hx, hy) along unit dir (dx, dy)
    const head = (hx, hy, dx, dy, s = 9) => {
      const px = -dy, py = dx;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - dx * s + px * s * 0.45, hy - dy * s + py * s * 0.45);
      ctx.lineTo(hx - dx * s - px * s * 0.45, hy - dy * s - py * s * 0.45);
      ctx.closePath();
      ctx.fill();
    };

    switch (kind) {
      case 'clash': {
        // unlimited wants (∞) straining against a finite lump of resources (solid block)
        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.bezierCurveTo(x - 25, y - 10, x - 35, y - 10, x - 35, y);
        ctx.bezierCurveTo(x - 35, y + 10, x - 25, y + 10, x - 15, y);
        ctx.bezierCurveTo(x - 5, y - 10, x + 5, y - 10, x + 5, y);
        ctx.bezierCurveTo(x + 5, y + 10, x - 5, y + 10, x - 15, y);
        ctx.stroke();
        // impact flash where the endless presses on the finite
        ctx.beginPath();
        ctx.moveTo(x + 13, y); ctx.lineTo(x + 7, y);
        ctx.moveTo(x + 13, y); ctx.lineTo(x + 9, y - 6);
        ctx.moveTo(x + 13, y); ctx.lineTo(x + 9, y + 6);
        ctx.stroke();
        roundRectPath(ctx, x + 13, y - 8, 16, 16, 3);
        ctx.fill();
        break;
      }
      case 'gate': {
        // scarcity as a squeeze: two jaws closing on what little remains
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 10); ctx.lineTo(x + 20, y - 10);
        ctx.moveTo(x - 20, y + 10); ctx.lineTo(x + 20, y + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, y, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        // pressure from both sides
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x, y - 21); ctx.lineTo(x, y - 16);
        ctx.moveTo(x, y + 16); ctx.lineTo(x, y + 21);
        ctx.stroke();
        head(x, y - 15, 0, 1, 7);
        head(x, y + 15, 0, -1, 7);
        break;
      }
      case 'scale': {
        // balance scale tipped toward the chosen option (✓); the forgone one sits lighter (✗)
        ctx.beginPath();
        ctx.moveTo(x - 12, y + 15); ctx.lineTo(x + 12, y + 15); // base
        ctx.moveTo(x, y + 15); ctx.lineTo(x, y - 12);           // post
        ctx.moveTo(x - 21, y - 15); ctx.lineTo(x + 21, y - 7);  // tilted beam
        ctx.moveTo(x - 21, y - 15); ctx.lineTo(x - 21, y - 6);  // left strings
        ctx.moveTo(x + 21, y - 7); ctx.lineTo(x + 21, y + 2);   // right strings
        ctx.stroke();
        ctx.beginPath(); ctx.arc(x - 21, y - 6, 6, 0, Math.PI); ctx.stroke(); // light pan
        ctx.beginPath(); ctx.arc(x + 21, y + 2, 6, 0, Math.PI); ctx.stroke(); // heavy pan
        // ✗ resting in the raised pan — the road not taken
        ctx.strokeStyle = c.error;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 24, y - 8); ctx.lineTo(x - 18, y - 2);
        ctx.moveTo(x - 18, y - 8); ctx.lineTo(x - 24, y - 2);
        ctx.stroke();
        // ✓ settled low in the chosen pan
        ctx.strokeStyle = c.success;
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 4); ctx.lineTo(x + 20, y + 7); ctx.lineTo(x + 25, y);
        ctx.stroke();
        break;
      }
      case 'trident': {
        // the three questions every economy must answer
        ctx.font = '800 24px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const qx = [x - 22, x, x + 22];
        const qy = [y + 3, y - 4, y + 3];
        for (let i = 0; i < 3; i++) ctx.fillText('?', qx[i], qy[i]);
        break;
      }
      case 'twoflags': {
        // two-way exchange between opposing systems
        ctx.beginPath();
        ctx.moveTo(x - 26, y - 8); ctx.lineTo(x + 17, y - 8);
        ctx.moveTo(x + 26, y + 8); ctx.lineTo(x - 17, y + 8);
        ctx.stroke();
        head(x + 26, y - 8, 1, 0);
        head(x - 26, y + 8, -1, 0);
        break;
      }
      default: {
        // everyone mixes: three overlapping colours blending into one economy
        const trio = [
          [x - 10, y - 6, c.accent],
          [x + 10, y - 6, c.warning],
          [x, y + 7, c.success],
        ];
        ctx.lineWidth = 2;
        for (const [bx, by, col] of trio) {
          ctx.beginPath();
          ctx.fillStyle = SimDraw.withAlpha(col, 0.25);
          ctx.arc(bx, by, 9.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = col;
          ctx.stroke();
        }
        break;
      }
    }
    ctx.restore();
  }

  _wrapCentered(ctx, text, cx, y, maxW, lh) {
    const words = text.split(' ');
    let line = '';
    let cy = y;
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
