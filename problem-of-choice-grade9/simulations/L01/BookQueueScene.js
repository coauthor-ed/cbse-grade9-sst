import { CanvasSimulation } from 'simulations/base/CanvasSimulation.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import { readSimColors } from 'simulations/base/SimTheme.js';
import { clamp01, cruise, lerp, smooth } from 'simulations/base/SimMotion.js';

/**
 * BookQueueScene — companion to blk-l01-s01 (chapter hook). Twenty students
 * want the library's new storybook; only a handful of copies exist. The
 * scene hands out copies — each book visibly flies from the library stack
 * (which shrinks as it empties) to its winner — highlights everyone left
 * waiting, then lets the student try different allocation rules in free
 * play — every rule picks different winners, none satisfies all twenty
 * wants.
 *
 * Shared reading circle: the copies are never handed over — they circulate.
 * Each copy rests with a reader for a while, then arcs across the grid to
 * the next reader; a dashed ring marks "their turn", not ownership. Only
 * `copies` books exist in circulation at any moment, so the access strip,
 * the waiting count and mostly-neutral faces stay rule-invariant — that is
 * the slide's own argument ("all twenty wants cannot be satisfied") made
 * visible rather than contradicted.
 *
 * Visual language: flat two-tone shapes from the shared theme tokens only
 * (shirts/hair are `SimDraw.shade()` steps of --sim-accent — the kit's one
 * sanctioned substitute for gradients). Motion is cruise-eased with no
 * overshoot; idle life comes from per-student bob/blink phases.
 */

const W = 900;
const H = 560;

const STUDENTS = 20;
const COLS = 5;
const DEFAULT_COPIES = 5;

// ── Layout ──────────────────────────────────────────────────────────────────
const GRID_LEFT = 120;                 // left margin of the student grid
const GRID_TOP = 168;                  // top of the first student row
const CELL_W = 132;
const CELL_H = 78;
const HEAD_R = 18;                     // student head radius
const STACK_X = 118;                   // library-stack flight origin
const STACK_Y = 148;
const PANEL_Y = 492;                   // status panel
const PANEL_H = 60;
const CAPTION_Y = 32;                  // caption pill centre-line

// Book deal choreography (fits inside beat 0's 1400 ms dwell before leftOut)
const DEAL_STAGGER = 0.09;             // s between consecutive books
const DEAL_FLIGHT = 0.55;              // s per flight

// Reading-circle rotation: each copy spends a cycle with one reader, then
// flies to the next. All copies pass inside one shared window at the cycle
// boundary — a student's old copy departs at the same beat the new one is
// airborne, so nobody is ever drawn holding two books. Only `copies` books
// circulate; the majority between turns is the point.
const CIRCLE_CYCLE = 3.4;              // s per reader's turn
const CIRCLE_PASS_START = 0.70;        // fraction of cycle when passes launch
const CIRCLE_PASS_END = 0.90;          // fraction when all have landed

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
  { type: 'handout', caption: 'Five copies, twenty students.' },
  { type: 'leftOut', caption: 'Whoever gets a copy, fifteen others still wait.' },
  { type: 'rules', caption: 'Try the rules — each one picks different winners.' },
  { type: 'freeplay', caption: 'Change the copy count and the rule. The shortage never fully leaves.' },
];

const STEP_HANDOUT = 0;
const STEP_LEFTOUT = 1;
const STEP_RULES = 2;
const STEP_FREEPLAY = 3;

const BEAT_STEP_MAP = [
  [{ idx: STEP_HANDOUT, dwellMs: 1400 }, { idx: STEP_LEFTOUT, dwellMs: null }],
  [{ idx: STEP_LEFTOUT, dwellMs: null }],
  // Final beat: brief rules moment, then auto-hand off to free play — the
  // terminal step must sit at the unlock boundary or the lesson's controls
  // never appear (locked-while-explaining → free-to-explore, §2.3).
  [{ idx: STEP_RULES, dwellMs: 2200 }, { idx: STEP_FREEPLAY, dwellMs: null }],
];

const RULE_CHIP_TEXT = {
  firstcome: 'FIRST COME',
  lottery: 'LOTTERY',
  circle: 'READING CIRCLE',
};

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function seededShuffle(n, seed) {
  const arr = Array.from({ length: n }, (_, i) => i);
  let s = seed >>> 0 || 1;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function studentPos(i) {
  const col = i % COLS, row = Math.floor(i / COLS);
  return {
    x: GRID_LEFT + col * CELL_W + CELL_W / 2,
    y: GRID_TOP + row * CELL_H + CELL_H / 2,
  };
}

export class BookQueueScene extends CanvasSimulation {
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Twenty students in a grid want the same storybook. Five copies fly out of the library stack to the ' +
    'winners, fifteen students are left waiting, and in free play different allocation rules — first come, ' +
    'lottery, reading circle — pick different winners while the shortage of copies stays. In the shared ' +
    'reading circle the few copies pass from reader to reader, so only five students read at any moment ' +
    'and the other fifteen still wait.';

  static CONTROLS = [
    { type: 'button', id: 'prev', label: '← Back' },
    { type: 'button', id: 'next', label: 'Next →' },
    {
      type: 'slider', id: 'copies', label: 'Copies:', min: 1, max: 19, step: 1, value: DEFAULT_COPIES,
    },
    {
      type: 'select', id: 'rule', label: 'Who gets a copy:', options: [
        { value: 'firstcome', label: 'First come, first served' },
        { value: 'lottery', label: 'Lottery' },
        { value: 'circle', label: 'Shared reading circle' },
      ],
    },
    { type: 'button', id: 'redraw', label: 'Redraw lottery' },
  ];

  constructor(container, config) {
    super(container, config);
    this.allowResume = true;
    this.colors = null;

    this.stepIndex = 0;
    this._stepEnterTime = 0;

    this.copies = DEFAULT_COPIES;
    this.rule = 'firstcome';
    this._lotterySeed = 7;

    this._time = 0;          // global scene clock (bob, blink, dash march)
    this._dealClock = 0;     // seconds since the current deal began
    this._dispCopies = DEFAULT_COPIES;

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
    this._shirts = null; // re-derive shirt ramp from the (possibly new) accent
  }

  // Indigo-family shirt ramp — shade() steps of the accent token only.
  _shirtColor(i) {
    if (!this._shirts) {
      const a = this.colors.accent;
      this._shirts = [
        SimDraw.shade(a, -0.42),
        SimDraw.shade(a, -0.22),
        a,
        SimDraw.shade(a, 0.16),
        SimDraw.shade(a, 0.34),
      ];
    }
    return this._shirts[i % this._shirts.length];
  }

  _isBeatLocked() {
    return this._lessonLinked && this.stepIndex < STEP_FREEPLAY;
  }

  isControlHidden(id) {
    const locked = this._isBeatLocked();
    if (id === 'prev') return locked || this.stepIndex === 0;
    if (id === 'next') return locked || this.stepIndex === STEP_FREEPLAY;
    if (id === 'copies' || id === 'rule' || id === 'redraw') return locked;
    return false;
  }

  onBeatChange(beatIndex) {
    this._lessonLinked = true;
    const clamped = Math.max(0, Math.min(beatIndex, BEAT_STEP_MAP.length - 1));
    const chain = BEAT_STEP_MAP[clamped];
    this._beatChain = chain;
    this._beatChainPos = 0;
    this._beatChainDwell = chain[0].dwellMs != null ? chain[0].dwellMs / 1000 : null;
    this._jumpToStep(chain[0].idx);
  }

  _jumpToStep(i) {
    this.stepIndex = Math.max(0, Math.min(STEPS.length - 1, i));
    this._stepEnterTime = 0;
    // Only the initial handout plays the deal from the stack — and rewinding
    // to it replays deliberately. Every later step (leftOut, rules, free
    // play entry) inherits whatever is already distributed; books must not
    // fly again just because the lesson advanced. Active re-deals happen
    // only when the student changes copies/rule/redraws (see onControlChange).
    if (STEPS[this.stepIndex].type === 'handout') this._dealClock = 0;
    this.requestUiUpdate?.();
  }

  onControlChange(id, value) {
    if (this._canvas) this._canvas.focus({ preventScroll: true });
    if (id === 'next') this._jumpToStep(this.stepIndex + 1);
    else if (id === 'prev') this._jumpToStep(this.stepIndex - 1);
    else if (id === 'copies') {
      this.copies = Math.round(Number(value));
      this._dealClock = 0; // re-deal so the new count plays out
    } else if (id === 'rule') {
      this.rule = String(value);
      this._dealClock = 0;
    } else if (id === 'redraw') {
      this._lotterySeed = (this._lotterySeed * 48271) % 2147483647 || 11;
      this._dealClock = 0;
    }
  }

  _tick(ctx, dt) {
    this._time += dt;
    this._stepEnterTime += dt;
    this._dealClock += dt;
    this._dispCopies = lerp(this._dispCopies, Math.min(this.copies, STUDENTS), Math.min(1, dt * 9));

    if (this._lessonLinked && this._beatChainDwell != null) {
      this._beatChainDwell -= dt;
      if (this._beatChainDwell <= 0) {
        this._beatChainPos++;
        const next = this._beatChain?.[this._beatChainPos];
        if (next) {
          this._jumpToStep(next.idx);
          this._beatChainDwell = next.dwellMs != null ? next.dwellMs / 1000 : null;
        } else {
          this._beatChainDwell = null;
        }
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.colors.bgDeep;
    ctx.fillRect(0, 0, W, H);
    this._drawScene(ctx);
  }

  _drawInitialFrame(ctx) {
    this._tick(ctx, 0);
  }

  _winnerSet() {
    const n = Math.min(this.copies, STUDENTS);
    if (this.rule === 'lottery') return new Set(seededShuffle(STUDENTS, this._lotterySeed).slice(0, n));
    if (this.rule === 'firstcome') return new Set(Array.from({ length: n }, (_, i) => i));
    return new Set(); // circle — nobody "owns" a copy exclusively
  }

  // ── Scene ─────────────────────────────────────────────────────────────────

  _drawScene(ctx) {
    const c = this.colors;
    const step = STEPS[this.stepIndex];
    const freeplay = step.type === 'freeplay';
    const circle = this.rule === 'circle' && (freeplay || step.type === 'rules');
    const winners = this._winnerSet();
    const copies = Math.min(this.copies, STUDENTS);

    this._drawBackdrop(ctx);
    if (circle) this._drawCircleRing(ctx);

    // Deal choreography: winners fly in ascending id order (a clean sweep
    // for first-come, a scatter for lottery). flownCount drains the stack.
    const order = [...winners].sort((a, b) => a - b);
    let flown = 0;
    const flights = order.map((id, k) => {
      const start = k * DEAL_STAGGER;
      if (this._dealClock > start + 0.03) flown++;
      return { id, k, p: cruise(clamp01((this._dealClock - start) / DEAL_FLIGHT)) };
    });

    // In circle mode there is no private stack at all — nobody owns a copy.
    if (!circle) this._drawStack(ctx, copies - flown);

    // Circle rotation: derive every copy's pose from the clock (stateless,
    // so slider changes and theme refreshes re-derive cleanly). Readers are
    // the students holding a copy right now; flyers are mid-pass.
    let circleInfo = null;
    if (circle) {
      const readers = new Set(), resters = [], flyers = [];
      for (let b = 0; b < copies; b++) {
        const pose = this._circlePose(b);
        if (pose.kind === 'reading') { readers.add(pose.id); resters.push(pose.id); }
        else if (pose.kind === 'settled') { readers.add(pose.id); resters.push(pose.id); }
        else flyers.push(pose);
      }
      circleInfo = { readers, resters, flyers };
    }

    for (let i = 0; i < STUDENTS; i++) {
      const { x, y } = studentPos(i);
      const hasBook = !circle && winners.has(i);
      const waiting = step.type === 'leftOut' && !hasBook;
      this._drawStudentAt(ctx, i, x, y, {
        hasBook, waiting,
        reading: circleInfo?.readers.has(i) ?? false,
      });
    }

    // Books in flight + landed books + landing pulses
    for (const f of flights) {
      const { x, y } = studentPos(f.id);
      if (f.p <= 0) continue;
      if (f.p < 1) {
        this._drawFlyingBook(ctx, STACK_X, STACK_Y, x + 24, y - 26, f.p);
      } else {
        this._drawRestingBook(ctx, x + 24, y - 26);
        const sinceLand = this._dealClock - (f.k * DEAL_STAGGER + DEAL_FLIGHT);
        if (sinceLand >= 0 && sinceLand < 0.8) {
          SimDraw.drawPulse(ctx, x, y, HEAD_R + 4, c.success, sinceLand / 0.8);
        }
        SimDraw.drawGlow(ctx, x, y, HEAD_R, c.success, 0.12);
      }
    }

    // Circle books: resting with current readers, arcing between students
    if (circleInfo) {
      for (const id of circleInfo.resters) {
        const { x, y } = studentPos(id);
        this._drawRestingBook(ctx, x + 24, y - 26);
      }
      for (const f of circleInfo.flyers) {
        const a = studentPos(f.fromId), b = studentPos(f.toId);
        this._drawFlyingBook(ctx, a.x + 24, a.y - 26, b.x + 24, b.y - 26, f.u);
      }
    }

    this._drawStatusPanel(ctx, { copies, circle, freeplay });
    this._drawChrome(ctx, step);
  }

  // Deterministic pose of circulating copy `b` at the current clock. One
  // global cycle; all copies launch inside the shared pass window and land
  // together. Holders come from one permutation per cycle, so double-holding
  // is impossible by construction.
  _circlePose(b) {
    const cycle = Math.floor(this._time / CIRCLE_CYCLE);
    const p = (this._time % CIRCLE_CYCLE) / CIRCLE_CYCLE;
    const fromId = this._circleQueue(cycle)[b];
    const toId = this._circleQueue(cycle + 1)[b];
    if (p < CIRCLE_PASS_START) return { kind: 'reading', id: fromId };
    if (p < CIRCLE_PASS_END) {
      const u = cruise(clamp01((p - CIRCLE_PASS_START) / (CIRCLE_PASS_END - CIRCLE_PASS_START)));
      return { kind: 'flying', fromId, toId, u };
    }
    return { kind: 'settled', id: toId };
  }

  // Holder order for one cycle. Each cycle rotates the previous order by a
  // pseudo-random non-zero step: every book always changes hands (never
  // passed to itself), no two books share a reader, and successive rotations
  // send the books wandering around the grid instead of teleporting.
  _circleQueue(cycle) {
    if (!this._circleQueues) this._circleQueues = new Map();
    if (this._circleQueues.has(cycle)) return this._circleQueues.get(cycle);
    let q;
    if (cycle <= 0 || cycle > 1e6) {
      q = seededShuffle(STUDENTS, 7 + Math.abs(cycle) * 131);
    } else {
      const prev = this._circleQueue(cycle - 1);
      const k = 1 + (((cycle * 2654435761) >>> 5) % (STUDENTS - 1)); // 1..19
      q = prev.slice(k).concat(prev.slice(0, k));
    }
    if (this._circleQueues.size > 400) this._circleQueues.clear();
    this._circleQueues.set(cycle, q);
    return q;
  }

  _drawBackdrop(ctx) {
    const c = this.colors;
    // Two flat accent-tinted depth discs — two-tone shading, no gradient.
    ctx.save();
    ctx.fillStyle = SimDraw.withAlpha(c.accent, 0.045);
    ctx.beginPath();
    ctx.arc(W / 2, 300, 235, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SimDraw.withAlpha(c.accent, 0.05);
    ctx.beginPath();
    ctx.arc(W / 2, 300, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawCircleRing(ctx) {
    const c = this.colors;
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.accent, 0.8);
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 9]);
    ctx.lineDashOffset = -this._time * 26; // marching ants — the circle is alive
    roundRectPath(ctx, GRID_LEFT - 26, GRID_TOP - 34, COLS * CELL_W + 52, 356, 26);
    ctx.stroke();
    ctx.restore();
    this._drawOpenBook(ctx, W / 2, GRID_TOP - 34, c.accent);
  }

  _drawOpenBook(ctx, x, y, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath(); // left page
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(-16, -10, -26, -6);
    ctx.lineTo(-26, 8);
    ctx.quadraticCurveTo(-16, 4, 0, 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); // right page
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(16, -10, 26, -6);
    ctx.lineTo(26, 8);
    ctx.quadraticCurveTo(16, 4, 0, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = SimDraw.shade(color, -0.35); // spine
    ctx.fillRect(-1.5, -3, 3, 13);
    ctx.restore();
  }

  // Library stack: `count` books arranged in piles of five, bottom-up.
  // Pre-deal it breathes gently so the eye lands here first.
  _drawStack(ctx, count) {
    const c = this.colors;
    const n = Math.max(0, Math.min(count, STUDENTS));
    const preDeal = this._dealClock < 0.25;

    if (n > 0 && preDeal) {
      SimDraw.drawGlow(ctx, STACK_X, STACK_Y - 14, 46, c.accent, 0.1 + 0.06 * Math.sin(this._time * 4));
    }

    ctx.save();
    if (n > 0) { // hide the desk entirely once every copy has flown out
      ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.25);
      ctx.lineWidth = 2;
      ctx.beginPath(); // desk shelf under the piles
      ctx.moveTo(STACK_X - 82, STACK_Y + 12);
      ctx.lineTo(STACK_X + 140, STACK_Y + 12);
      ctx.stroke();
    }
    ctx.restore();

    const tones = [0, 0.14, -0.18];
    for (let b = 0; b < n; b++) {
      const pile = Math.floor(b / 5), level = b % 5;
      const x = STACK_X - 58 + pile * 56;
      const y = STACK_Y + 6 - level * 13;
      const tilt = ((b * 37) % 7) * 0.008 - 0.02;
      this._drawFlatBook(ctx, x, y, SimDraw.shade(c.accent, tones[b % 3]), tilt);
    }
  }

  _drawFlatBook(ctx, x, y, color, tilt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt); // tiny per-book jitter so piles look placed, not stamped
    ctx.fillStyle = color;
    roundRectPath(ctx, -24, -6, 48, 12, 3);
    ctx.fill();
    ctx.fillStyle = SimDraw.withAlpha('#ffffff', 0.55);
    ctx.fillRect(-24, -1, 48, 1.5); // page edge
    ctx.restore();
  }

  _drawFlyingBook(ctx, x1, y1, x2, y2, p) {
    // Quadratic arc with a lifted control point; slight tumble in flight.
    const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - 70;
    const t = p;
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(p * Math.PI) * 0.45);
    this._drawBookGlyph(ctx, 1.08);
    ctx.restore();
  }

  _drawRestingBook(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.12);
    this._drawBookGlyph(ctx, 1);
    ctx.restore();
  }

  // A closed book, front cover up: spine band on the left, page block at
  // the fore-edge, title marks, ribbon bookmark. Drawn at the origin.
  _drawBookGlyph(ctx, s) {
    const c = this.colors;
    ctx.save();
    ctx.scale(s, s);
    ctx.fillStyle = c.accent; // cover
    roundRectPath(ctx, -9, -12, 18, 24, 3);
    ctx.fill();
    ctx.fillStyle = SimDraw.shade(c.accent, -0.38); // spine
    ctx.fillRect(-9, -10, 4.2, 20);
    ctx.fillStyle = SimDraw.withAlpha('#ffffff', 0.85); // pages
    ctx.fillRect(5.2, -10, 2.6, 20);
    ctx.fillStyle = SimDraw.withAlpha('#ffffff', 0.75); // title
    ctx.fillRect(-3, -2, 7, 2);
    ctx.fillStyle = SimDraw.withAlpha('#ffffff', 0.45); // subtitle
    ctx.fillRect(-3, 1.8, 5, 1.8);
    ctx.fillStyle = SimDraw.withAlpha('#ffffff', 0.6); // ribbon
    ctx.beginPath();
    ctx.moveTo(1.2, -12);
    ctx.lineTo(4.4, -12);
    ctx.lineTo(4.4, -5.5);
    ctx.lineTo(2.8, -7.2);
    ctx.lineTo(1.2, -5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawStudentAt(ctx, i, x, y, { hasBook, waiting, reading = false }) {
    const c = this.colors;
    const shirt = this._shirtColor(i);

    // Realisation ripple on the leftOut beat: each student dims and saddens
    // in turn; the sad ones also stop bobbing (the want just got heavy).
    let dimP = 0;
    if (waiting) dimP = smooth(0.15 + i * 0.03, 0.7 + i * 0.03, this._stepEnterTime);
    const alpha = waiting ? lerp(0.95, 0.45, dimP) : 0.95;
    // happy = holds a copy of one's own; content = it's their turn in the
    // shared circle; sad = the want just landed. Nobody but owners blushes.
    const mood = hasBook ? 'happy'
      : waiting && dimP > 0.5 ? 'sad'
        : reading ? 'content'
          : 'neutral';
    const bob = Math.sin(this._time * 2 + i * 0.7) * 1.8 * (1 - dimP);
    const blink = ((this._time + i * 1.37) % 3.9) < 0.12;

    // floor shadow
    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + HEAD_R + 10, 14 - dimP * 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(0, bob);

    // shoulders / shirt
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.moveTo(x - 15, y + HEAD_R + 9);
    ctx.quadraticCurveTo(x, y + HEAD_R - 7, x + 15, y + HEAD_R + 9);
    ctx.lineTo(x + 15, y + HEAD_R + 11);
    ctx.lineTo(x - 15, y + HEAD_R + 11);
    ctx.closePath();
    ctx.fill();

    // head
    ctx.beginPath();
    ctx.arc(x, y, HEAD_R, 0, Math.PI * 2);
    ctx.fillStyle = SimDraw.shade(c.panelBg, 0.22);
    ctx.fill();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.45);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // hair cap
    ctx.fillStyle = SimDraw.shade(shirt, -0.38);
    ctx.beginPath();
    ctx.arc(x, y - 3, HEAD_R - 1.5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.closePath();
    ctx.fill();

    // face
    const eyeY = y - 3;
    ctx.fillStyle = c.label;
    ctx.strokeStyle = c.label;
    if (blink) {
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - 9, eyeY); ctx.lineTo(x - 5, eyeY);
      ctx.moveTo(x + 5, eyeY); ctx.lineTo(x + 9, eyeY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x - 7, eyeY, 2.2, 0, Math.PI * 2);
      ctx.arc(x + 7, eyeY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (mood === 'happy' || mood === 'content') ctx.arc(x, y + 5, mood === 'content' ? 5.5 : 7, 0.15 * Math.PI, 0.85 * Math.PI);
    else if (mood === 'sad') ctx.arc(x, y + 14, 7, 1.15 * Math.PI, 1.85 * Math.PI);
    else { ctx.moveTo(x - 6, y + 8); ctx.lineTo(x + 6, y + 8); }
    ctx.stroke();

    if (mood === 'happy') { // rosy cheeks
      ctx.fillStyle = SimDraw.withAlpha(c.error, 0.35);
      ctx.beginPath();
      ctx.arc(x - 11, y + 4, 2.6, 0, Math.PI * 2);
      ctx.arc(x + 11, y + 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // winner ring — frames the whole figure (solid = owns a copy)
    if (hasBook) {
      ctx.save();
      ctx.strokeStyle = c.success;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(x, y + bob + 4, 25, 31, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // circle reader ring — dashed accent: it's their turn, not their copy
    if (reading) {
      ctx.save();
      ctx.strokeStyle = SimDraw.withAlpha(c.accent, 0.9);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.ellipse(x, y + bob + 4, 25, 31, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // waiting "?" — floats and pulses above the head
    if (waiting && dimP > 0.35) {
      ctx.save();
      ctx.globalAlpha = alpha * dimP;
      ctx.font = '700 16px Inter, system-ui';
      ctx.fillStyle = c.warning;
      ctx.textAlign = 'center';
      ctx.fillText('?', x + 24, y - 26 + Math.sin(this._time * 3 + i) * 2);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    ctx.font = '500 11px Inter, system-ui';
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.fillText(`#${i + 1}`, x, y + HEAD_R + 24);
    ctx.restore();
  }

  _drawStatusPanel(ctx, { copies, freeplay }) {
    const c = this.colors;
    const px = 40, pw = W - 80, py = PANEL_Y, ph = PANEL_H;
    SimDraw.drawPanel(ctx, px, py, pw, ph, {
      bg: c.panelBg, radius: 12,
      stroke: SimDraw.withAlpha(c.accent, freeplay ? 0.7 : 0.45),
      lineWidth: 1.5,
    });

    const midY = py + ph / 2;

    // left cluster — copies
    this._drawRestingBook(ctx, px + 34, midY);
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '600 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.7);
    ctx.fillText('COPIES', px + 56, py + 24);
    ctx.font = '700 22px Inter, system-ui';
    ctx.fillStyle = c.accent;
    ctx.fillText(String(Math.round(this._dispCopies)), px + 56, py + 47);
    ctx.restore();

    // divider
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.15);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 130, py + 12);
    ctx.lineTo(px + 130, py + ph - 12);
    ctx.stroke();
    ctx.restore();

    // middle — 20-slot access strip. Deliberately rule-invariant: however the
    // copies are allocated or shared, only `copies` students hold one.
    const stripX = px + 158, slot = 13, size = 10;
    ctx.save();
    ctx.font = '600 10px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.6);
    ctx.textAlign = 'left';
    ctx.fillText('STUDENTS WITH ACCESS', stripX, py + 20);
    for (let i = 0; i < STUDENTS; i++) {
      ctx.fillStyle = i < copies ? c.accent : SimDraw.withAlpha(c.label, 0.14);
      roundRectPath(ctx, stripX + i * slot, py + 30, size, size, 2.5);
      ctx.fill();
    }
    ctx.restore();

    // divider
    ctx.save();
    ctx.strokeStyle = SimDraw.withAlpha(c.label, 0.15);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + pw - 218, py + 12);
    ctx.lineTo(px + pw - 218, py + ph - 12);
    ctx.stroke();
    ctx.restore();

    // right cluster — still short under every rule
    const rx = px + pw - 108;
    this._drawPersonGlyph(ctx, rx - 66, midY, c.error);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 11px Inter, system-ui';
    ctx.fillStyle = SimDraw.withAlpha(c.label, 0.7);
    ctx.fillText('STILL WAITING', rx, py + 24);
    ctx.font = '700 18px Inter, system-ui';
    ctx.fillStyle = c.error;
    ctx.fillText(String(STUDENTS - copies), rx, py + 47);
    ctx.restore();
  }

  _drawPersonGlyph(ctx, x, y, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 9);
    ctx.quadraticCurveTo(x, y - 2, x + 8, y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Top chrome: step dots (left), caption pill (centre), rule chip (right).
  // The caption centres itself in the space between dots and chip so long
  // captions never slide under the chip.
  _drawChrome(ctx, step) {
    const c = this.colors;

    // rule chip — only once rules are on the table
    let chipLeft = W; // caption's right boundary
    if (this.stepIndex >= STEP_RULES) {
      const text = `RULE · ${RULE_CHIP_TEXT[this.rule] || ''}`;
      ctx.save();
      ctx.font = '700 11px Inter, system-ui';
      const w = ctx.measureText(text).width + 22;
      const x = W - 44 - w;
      SimDraw.drawPanel(ctx, x, CAPTION_Y - 12, w, 24, {
        bg: c.panelBg, radius: 12,
        stroke: SimDraw.withAlpha(c.accent, 0.55), lineWidth: 1,
      });
      ctx.fillStyle = SimDraw.withAlpha(c.label, 0.85);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + w / 2, CAPTION_Y + 0.5);
      ctx.restore();
      chipLeft = x;
    }

    // caption pill — fades in and rises on step entry
    const capP = smooth(0, 0.4, this._stepEnterTime);
    ctx.save();
    ctx.globalAlpha = capP;
    ctx.font = '600 13.5px Inter, system-ui';
    const textW = ctx.measureText(step.caption).width;
    const pillW = textW + 36, pillH = 28;
    const cx = (110 + chipLeft) / 2, cy = CAPTION_Y + (1 - capP) * 8;
    SimDraw.drawPanel(ctx, cx - pillW / 2, cy - pillH / 2, pillW, pillH, {
      bg: c.panelBg, radius: pillH / 2,
      stroke: SimDraw.withAlpha(c.accent, 0.35), lineWidth: 1,
    });
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(step.caption, cx, cy + 0.5);
    ctx.restore();

    // step dots
    const dx0 = 46, dy = CAPTION_Y, dotGap = 16;
    ctx.save();
    for (let i = 0; i < STEPS.length; i++) {
      const active = i === this.stepIndex;
      ctx.fillStyle = active ? c.accent : SimDraw.withAlpha(c.label, 0.25);
      if (active) roundRectPath(ctx, dx0 + i * dotGap - 4, dy - 3, 14, 6, 3);
      else { ctx.beginPath(); ctx.arc(dx0 + i * dotGap + 3, dy, 3, 0, Math.PI * 2); }
      ctx.fill();
    }
    ctx.restore();
  }
}
