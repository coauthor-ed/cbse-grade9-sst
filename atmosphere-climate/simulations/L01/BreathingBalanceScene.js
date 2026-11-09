// BreathingBalanceScene - four arrows, one loop; two columns that balance when the rates match.
//
// Beats (3, all from blk-l01-s05):
//   0 the loop at rest, four arcs named, columns empty, Run and the rate dial live
//   1 the run - a packet goes round the loop, the columns fill, the dial stays live
//   2 balance - the columns are level, the marker is lit, the scene is still live
//
// The numbers are the slide's (78 / 21 / 0.04 squares of a hundred) and they live
// only in the arrow thicknesses: no percentage is printed anywhere on this scene.
// Columns are a RATE picture - one token is a parcel of air moved, not a volume of
// gas - which is the only reading under which "the two do not match until the cycle
// has turned over a few times" can be true, and what the note line tells the learner.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  alpha, darken, font, inkOn, pill, chipRow, chipColumn,
  popAt, drawBackdrop, drawDepth, drawCard, drawVignette, drawBadge, drawShadow,
} from 'simulations/base/kit/SimLook.js';
import { drawFigure } from 'simulations/base/kit/SimFigure.js';

const BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const S_REST = 0, S_RUN = 1, S_SETTLED = 2;

const CX = 340, CY = 262, R = 140;                 // the loop
const FIG_X = 340, FIG_Y = 344, FIG_H = 132;        // the figure's feet and height
const COL_W = 132;                                  // OUT card 16..148, IN card 532..664
const COL_L = { x: 16, y: 140, w: COL_W, h: 294 };
const COL_R = { x: 680 - 16 - COL_W, y: 140, w: COL_W, h: 294 };
const BASE_Y = COL_L.y + COL_L.h - 16;             // token stacks grow up from here
const TOK_H = 26, TOK_GAP = 4, TOK_STEP = TOK_H + TOK_GAP;
const SETTLED = 6;                                  // tokens on each side when balanced
const TARGET_Y = BASE_Y - SETTLED * TOK_STEP + TOK_GAP;
const RATE_MIN = 6, RATE_MAX = 30, RATE_DEF = 20;  // breaths per minute, the real span

// The four arcs of the loop, in the order the packet meets them. Each spans 90 deg,
// beginning at A0 - 90k and ending 90 deg later; the centre of arc k is A0 - 90k - 45.
const A0 = 135;
const ARCS = [
  { gas: 'nitrogen', formula: 'N2', way: 'out', w: 15, col: 's1', name: 'nitrogen out' },
  { gas: 'oxygen', formula: 'O2', way: 'in', w: 8, col: 's2', name: 'oxygen in' },
  { gas: 'carbon dioxide', formula: 'CO2', way: 'out', w: 4, col: 's3', name: 'carbon dioxide out' },
  { gas: 'oxygen', formula: 'O2', way: 'in', w: 8, col: 's2', name: 'oxygen in again' },
];

const rad = (d) => (d * Math.PI) / 180;
const polar = (deg, r = R) => ({ x: CX + r * Math.cos(rad(deg)), y: CY - r * Math.sin(rad(deg)) });

export class BreathingBalanceScene extends SimScene {
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static NOTE_STAGE = 0;                            // one muted line along the bottom, every beat
  static ARIA_LABEL =
    'A person breathes at the centre of a ring of four curved arrows running one way only: nitrogen out, oxygen in, ' +
    'carbon dioxide out, then oxygen in again. Running the loop fills an OUT column on the left and an IN column on ' +
    'the right, and the run stops by itself when the two columns reach the same height.';
  static CONTROLS = [
    { type: 'button', id: 'run', label: 'Run' },
    { type: 'slider', id: 'rate', label: 'Breathing rate', min: RATE_MIN, max: RATE_MAX, step: 1, value: RATE_DEF, suffix: ' /min' },
  ];

  constructor(container, config) {
    super(container, config);
    this._rate = RATE_DEF;
    this._run = null;          // { stage, prog, left } while a circuit is in flight
    this._circuits = 0;        // circuits completed since this stage was entered
    this._out = [];            // tokens in the OUT column
    this._in = [];             // tokens in the IN column
    this._balanced = false;
    this._markAt = -9;         // when the marker lit
  }

  noteRows() {
    return [{ text: 'gas moved, not kept: the rates match. CO2 is drawn thicker than life' }];
  }

  enter(stage) {
    this._run = null;
    this._circuits = 0;
    this._out = [];
    this._in = [];
    this._balanced = false;
    this._markAt = -9;
    if (stage === S_RUN) this.after(0.35, () => this._start());
    if (stage === S_SETTLED) {
      this._settle();
      this._markAt = 0;
      this._balanced = true;
    }
  }

  period() { return 60 / this._rate; }              // seconds for one circuit = one breath

  _start() {
    if (this._run) return;
    // A first run needs the three circuits that turn the loop over; once the columns
    // are level, a further run is a plain two-circuit trade. Derived from the columns
    // themselves, so it cannot disagree with what is on screen.
    const level = this._out.length >= SETTLED;
    this._run = { stage: this.stage, prog: 0, left: level ? 2 : 3, wasLevel: level };
  }

  // What one circuit drops, in the loop's own order. The IN side lags while the loop
  // is still turning over: the nitrogen you inhale and the oxygen that comes back are
  // in transit, so the columns only level once the third circuit closes the loop.
  // Past the steady level the columns hold: they are a rate picture, not a store.
  _drop() {
    this._circuits++;
    const k = this._circuits;
    if (this._out.length < SETTLED) this._out.push({ gas: 'N2', k }, { gas: 'CO2', k });
    if (this._in.length < SETTLED) {
      this._in.push({ gas: 'O2', k });
      if (k >= 2) this._in.push({ gas: 'N2', k });
      if (k === 3) this._in.push({ gas: 'O2', k });
    }
  }

  _isBalanced() { return this._out.length === this._in.length && this._out.length >= SETTLED; }

  // Beat 2's opening state: exactly what three circuits of _drop() produce, so the
  // settled columns and a run that reaches balance are the same numbers.
  _settle() {
    this._out = [];
    this._in = [];
    for (let i = 0; i < 3; i++) this._drop();
  }

  update(d) {
    const r = this._run;
    if (!r) return;
    r.prog += d / this.period();
    let guard = 0;
    while (r.prog >= 1 && r.left > 0 && guard++ < 4) {
      r.prog -= 1;
      this._drop();
      r.left--;
      if (!r.wasLevel && this._isBalanced()) {
        r.prog = 0;
        this._run = null;
        this._balanced = true;
        this._markAt = this.clock;
        return;                                      // the run stops itself: no confetti, no banner
      }
    }
    if (r.left <= 0) { r.prog = 0; this._run = null; }
  }

  busy() { return !!this._run; }

  // ---- drawing -------------------------------------------------------------

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    drawDepth(ctx, c, { t: this.clock });
    this._columns(ctx, c);
    this._ring(ctx, c);
    this._figure(ctx, c);
    this._chips(ctx, c);
    drawVignette(ctx, c, 0.7);
  }

  // The loop: a faint track, four thick arcs each with a clockwise head, a numbered
  // badge and a formula pill on every arc, and the radial transfers at the corners.
  _ring(ctx, c) {
    const t = this.clock;
    ctx.save();
    ctx.strokeStyle = alpha(c.stroke, 0.35);
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ARCS.forEach((a, k) => {
      const col = c[a.col];
      const from = A0 - 90 * k, to = from - 90;
      this._arcStroke(ctx, c, col, from, to - 6, a.w);
      this._arrowHead(ctx, c, col, to, a.w);
      const mid = from - 45;
      const p = polar(mid);
      this._badge(ctx, c, k + 1, p.x, p.y, col);
      const q = polar(mid, R - 30);
      pill(ctx, c, a.formula, q.x, q.y, { bg: col, size: 13 });
    });

    // Radial transfers, one per arc, at the arc's leading corner. out: figure -> ring.
    // in: ring -> figure. Dots, not arrowheads, so nothing on the scene opposes the flow.
    ARCS.forEach((a, k) => {
      const deg = A0 - 90 * k;
      const col = c[a.col];
      const inner = polar(deg, R - 34), outer = polar(deg, R - 9);
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = alpha(col, 0.45);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(inner.x, inner.y);
      ctx.lineTo(outer.x, outer.y);
      ctx.stroke();
      ctx.restore();
      if (this.stage === S_REST) return;
      for (let i = 0; i < 3; i++) {
        let u = (t * 0.5 + i / 3) % 1;
        if (a.way === 'out') u = 1 - u;
        const q = polar(deg, R - 34 + 25 * u);
        ctx.beginPath();
        ctx.arc(q.x, q.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = alpha(col, 0.3 + 0.7 * Math.sin(Math.PI * u));
        ctx.fill();
      }
    });

    // The small nitrogen inlet on the oxygen-in arc: a thin dashed branch, the only
    // extra arrowhead on the scene, and the slide's claim that most of what you breathe
    // in you breathe straight back out.
    this._inlet(ctx, c, t);
    if (this._run) this._packet(ctx, c);
  }

  _arcStroke(ctx, c, col, from, to, w) {
    ctx.save();
    ctx.strokeStyle = alpha(c.bgDeep, 0.9);
    ctx.lineWidth = w + 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(CX, CY, R, rad(-to), rad(-from), true);
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(CX, CY, R, rad(-to), rad(-from), true);
    ctx.stroke();
    ctx.restore();
  }

  _arrowHead(ctx, c, col, deg, w) {
    const p = polar(deg);
    const a = rad(deg);
    const tx = Math.sin(a), ty = Math.cos(a);        // clockwise tangent (angle decreasing)
    const nx = Math.cos(a), ny = -Math.sin(a);
    const L = 10 + w * 0.8, hw = w * 0.62 + 4;
    ctx.beginPath();
    ctx.moveTo(p.x + tx * L, p.y + ty * L);
    ctx.lineTo(p.x - nx * hw, p.y - ny * hw);
    ctx.lineTo(p.x + nx * hw, p.y + ny * hw);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  }

  _badge(ctx, c, n, x, y, col) {
    ctx.beginPath();
    ctx.arc(x, y + 1.5, 13, 0, Math.PI * 2);
    ctx.fillStyle = darken(col, 0.4);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.font = font(c, 800, 15, true);
    ctx.fillStyle = inkOn(c, col);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(n), x, y + 1);
  }

  _inlet(ctx, c, t) {
    const col = c.s1;
    const deg = 62;
    const a = polar(deg, R - 34), b = polar(deg, R - 12);
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = alpha(col, 0.85);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
    if (this.stage !== S_REST) {
      for (let i = 0; i < 2; i++) {
        const u = 1 - ((t * 0.55 + i / 2) % 1);
        const q = polar(deg, R - 12 - 22 * u);
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = alpha(col, 0.35 + 0.65 * u);
        ctx.fill();
      }
    }
    const lab = polar(deg, R + 44);
    pill(ctx, c, 'nitrogen in', lab.x, lab.y, { bg: col, size: 12 });
  }

  // The packet in flight: a cluster of dots on the ring, coloured by the arc it is on,
  // with a short fading tail behind it.
  _packet(ctx, c) {
    const prog = this._run.prog;
    const arcAt = (p) => {
      const u = Math.max(0, Math.min(0.9999, p)) * 4;
      const k = Math.floor(u);
      return { k, local: u - k, deg: A0 - 90 * k - 90 * (u - k) };
    };
    const head = arcAt(prog);
    for (let j = 5; j >= 0; j--) {
      const s = arcAt(prog - j * 0.016);
      const col = c[ARCS[s.k].col];
      const r = R + (j === 0 ? 0 : 0);
      const q = polar(s.deg, r);
      const a = j === 0 ? 1 : 0.5 - j * 0.09;
      const rad0 = 4.4 - j * 0.45;
      for (let i = 0; i < 5; i++) {
        const off = degOffset(i, head.deg);
        const px = q.x + Math.cos(off) * rad0 * 1.7;
        const py = q.y + Math.sin(off) * rad0 * 1.7;
        ctx.beginPath();
        ctx.arc(px, py, rad0, 0, Math.PI * 2);
        ctx.fillStyle = alpha(col, a);
        ctx.fill();
      }
    }
  }

  _figure(ctx, c) {
    const per = this.period();
    const t = this._run ? this._run.prog : (this.clock / per) % 1;   // the chest moves on every breath
    const breath = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
    const crouch = 0.055 - 0.05 * breath;
    drawShadow(ctx, c, FIG_X, FIG_Y + 4, 30, 8);
    drawFigure(ctx, c,
      { x: FIG_X, y: FIG_Y, height: FIG_H, facing: 1, pose: { name: 'stand', crouch, tilt: -1.5 - 1.5 * breath, lean: 1 } },
      { skin: 1, hair: 0, hairStyle: 'short', top: c.s5, bottom: c.s6, shoe: c.stroke, mood: 'smile', t: this.clock });
  }

  _columns(ctx, c) {
    this._column(ctx, c, COL_L, this._out, 'OUT', 'what leaves you', c.s1);
    this._column(ctx, c, COL_R, this._in, 'IN', 'what enters you', c.s2);
    // The balance marker: two dashed target lines, dark until the columns are level.
    const lit = this._balanced;
    for (const col of [COL_L, COL_R]) {
      const x0 = col.x + 12, x1 = col.x + col.w - 22;
      ctx.save();
      ctx.setLineDash(lit ? [] : [4, 4]);
      ctx.strokeStyle = lit ? c.good : alpha(c.label, 0.3);
      ctx.lineWidth = lit ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, TARGET_Y);
      ctx.lineTo(x1, TARGET_Y);
      ctx.stroke();
      ctx.restore();
      if (lit) {
        const p = popAt(this.clock, this._markAt);
        if (p) drawBadge(ctx, c, 'check', x1 + 11, TARGET_Y, 10 * p.scale, c.good);
      }
    }
  }

  _column(ctx, c, box, toks, title, sub, accent) {
    drawCard(ctx, c, box.x, box.y, box.w, box.h, 1, { accent });
    pill(ctx, c, title, box.x + box.w / 2, box.y + 24, { bg: accent, size: 15, display: true });
    ctx.font = font(c, 600, 12);
    ctx.fillStyle = c.labelMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sub, box.x + box.w / 2, box.y + 48);
    const n = Math.min(toks.length, SETTLED);
    if (!n) {
      ctx.font = font(c, 600, 12);
      ctx.fillStyle = alpha(c.labelMuted, 0.7);
      ctx.fillText('empty', box.x + box.w / 2, BASE_Y - 8);
      return;
    }
    // The tokens dropped by the circuit now in flight pop in over its first third of
    // a second; everything older is settled. The pop is derived from the run's own
    // progress, so no wall-clock stamp is carried in a token.
    const since = this._run ? this._run.prog * this.period() : 99;
    const items = toks.slice(-n).map((tk) => ({
      text: tk.gas,
      bg: tk.gas === 'N2' ? c.s1 : tk.gas === 'O2' ? c.s2 : c.s3,
      size: 13,
      pop: tk.k === this._circuits ? popAt(since, 0) : 1,
    }));
    const top = BASE_Y - n * TOK_STEP + TOK_GAP;
    chipColumn(ctx, c, items, box.x + box.w / 2, top, { align: 'center', gap: TOK_GAP, size: 13 });
  }

  _chips(ctx, c) {
    const items = ARCS.map((a, k) => ({ text: `${k + 1}  ${a.name}`, bg: c[a.col], size: 13 }));
    chipRow(ctx, c, items, CX, 34, { align: 'center', gap: 9, size: 13 });
    if (this.stage === S_REST && !this._run) {
      const p = 0.5 + 0.5 * Math.sin(this.clock * 3.4);
      pill(ctx, c, 'press Run', CX, 468, { bg: c.accent, size: 14, scale: 0.94 + 0.06 * p, alpha: 0.75 + 0.25 * p });
    } else if (this._run) {
      const left = this._run.left - this._run.prog;
      pill(ctx, c, `${Math.ceil(left)} more to level`, CX, 468, { bg: c.raised, ink: c.label, size: 13 });
    }
  }

  // Host controls. `v` is a STRING for the slider, true for the button.
  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'rate') {
      this._rate = Math.min(RATE_MAX, Math.max(RATE_MIN, Number(v) || RATE_DEF));
    } else if (id === 'run') {
      this._start();
    }
    this.requestUiUpdate?.();
  }

  getControlValue(id) { return id === 'rate' ? String(this._rate) : super.getControlValue(id); }

  // A tap anywhere on the ring is Run, so the scene works on a phone.
  pointerDown(p) {
    if (this._run) return;
    const d = Math.hypot(p.x - CX, p.y - CY);
    if (d < R - 46 || d > R + 46) return;
    this._start();
    this.animateFor(600);
  }
}

function degOffset(i, deg) {
  return rad((i - 2) * 26 + (deg % 17));
}
