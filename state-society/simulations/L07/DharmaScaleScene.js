// DharmaScaleScene - one balance beam, three settings, three mounts (L07).
// The beat count alone picks the mount: 4 or none -> two notches with iron and wood,
// 3 -> three notches with iron and wood, 2 -> three notches with a king and a village
// headman. The marker on the rail is the only control; each move is one 0.7 s glide.
//
// Rules this file follows (briefs/reference/scene-rules.md has the rest):
//   - colours only from `c` and mix/alpha/lighten/darken of them, never a hex
//   - busy() is true while the marker glides; every glide ends
//   - the notch labels are the ONLY text on the panel, so there are no controls
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { ZONES, alpha, mix, lighten, darken, inOutSine, font, rr, drawBackdrop, drawDepth, drawFloor, drawCard } from 'simulations/base/kit/SimLook.js';
import { drawBalance } from 'simulations/base/kit/SimBalance.js';
import { drawFigure } from 'simulations/base/kit/SimFigure.js';

const CX = ZONES.hero.x + ZONES.hero.w / 2;
const PIVOT_Y = 168;                       // beam pivot
const STAND_H = 190;                       // pivot down to the floor
const FLOOR_Y = PIVOT_Y + STAND_H + 10;
const BEAM_W = 424;
const RAIL_Y = FLOOR_Y + 34;               // the setting track under the beam
const RAIL_X0 = 118, RAIL_X1 = 562;
const NOTCH_X = { 2: [238, 442], 3: [140, 340, 540] };
const RUN_T = 0.70;                        // every marker move is this long, once
const TILT = 0.30;                         // rad, the ruler's setting
const DOWN = 13;                           // px a block sits sunk into its pan
const UP = -15;                            // px a block is held clear of its pan
const FIG_H = 96;

// One entry per beat. The panel is the same in every beat; the learner drives it.
const MAP4 = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }], [{ idx: 3, dwellMs: null }]];
const MAP3 = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const MAP2 = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];

// The three settings, in the only words the panel may use.
const LABELS = [
  'what a thing does when you let it go',
  'what a ruler prefers',
  'what a person is expected to do according to their role',
];

// Mounts by beat count. `people` swaps the blocks for the two figures.
const MOUNT = { 4: { notches: 2, people: false }, 3: { notches: 3, people: false }, 2: { notches: 3, people: true } };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class DharmaScaleScene extends SimScene {
  static BEAT_STEP_MAP = MAP4;
  static BEAT_MAPS = { 4: MAP4, 3: MAP3, 2: MAP2 };
  static NOTE_STAGE = 0;
  static ARIA_LABEL =
    'A balance beam hangs over a floor with one object on each pan. A rail of settings runs beneath it, and a ' +
    'draggable marker slides along the rail. Setting one levels the beam, setting two tips it hard and it stays tipped.';
  static CONTINUOUS = false;

  constructor(container, config) {
    super(container, config);
    this.notch = 0;                    // where the marker is
    this.mx = NOTCH_X[2][0];           // where the marker is drawn
    this.tilt = 0;                     // the beam's angle
    this.sink = DOWN;                  // the left pan's block, px into the pan
    this.hover = UP;                   // the right pan's block, px off the pan
    this.run = null;
    this.grab = false;
    this.hint = false;
    this._placed = 2;                  // notches the panel was last laid out for
  }

  noteRows() {
    return [{ text: 'a schematic balance: it shows that a measurement changed, never how much' }];
  }

  // The mount, read from the beat count every time. SimScene enters stage 0 in setup()
  // and only sets beatCount when the host calls onBeatChange, so a stored mount would be
  // the wrong one for the first beat of a three-notch or people mount. A setup block that
  // mounts with no beats never gets a count: that is the two-notch mount.
  get mount() { return MOUNT[MOUNT[this.beatCount] ? this.beatCount : 4]; }
  get count() { return MOUNT[this.beatCount] ? this.beatCount : 4; }

  // --- the one rule: what the beam does at a notch, for this mount ------------------
  _verdict(i) {
    const people = this.mount.people;
    if (i === 1) return { tilt: TILT, sink: people ? 0 : UP, hover: people ? 0 : DOWN };   // the ruler's setting tips it
    if (people) return { tilt: 0, sink: 0, hover: 0 };                                    // neither figure sinks or floats
    return { tilt: 0, sink: DOWN, hover: UP };                                            // a thing does what it does
  }

  // Move the marker to notch i. `now` snaps (a mount arriving) instead of gliding.
  _place(i, glide = true) {
    const v = this._verdict(i);
    const xs = NOTCH_X[this.mount.notches];
    const x = xs[clamp(i, 0, xs.length - 1)];
    this.notch = clamp(i, 0, xs.length - 1);
    if (!glide) {
      this.mx = x; this.tilt = v.tilt; this.sink = v.sink; this.hover = v.hover; this.run = null;
      return;
    }
    if (Math.abs(this.mx - x) < 0.5 && Math.abs(this.tilt - v.tilt) < 0.001) return;
    this.run = { stage: this.stage, t: 0, x, ...v };
  }

  enter(stage) {
    this.run = null;
    this.grab = false;
    this._place(stage === 0 ? 0 : this.notch, false);
    if (stage === 0) { this.hint = false; return; }
    // The learner's state survives every later beat: no reset, no verdict, no chip.
    const n = this.count;
    this.hint = (n === 4 && stage === 2) || (n === 2 && stage === 1);
  }

  update(d) {
    // A mount that arrives with a beat count the scene first saw in setup() re-places here.
    if (this.mount.notches !== this._placed) { this._placed = this.mount.notches; this._place(0, false); }
    const r = this.run;
    if (!r) return;
    r.t += d;
    const u = inOutSine(Math.min(1, r.t / RUN_T));
    const ease = (from, to) => from + (to - from) * u;
    this.mx = ease(this.mx, r.x);
    this.tilt = ease(this.tilt, r.tilt);
    this.sink = ease(this.sink, r.sink);
    this.hover = ease(this.hover, r.hover);
    if (r.t >= RUN_T) {
      this.mx = r.x; this.tilt = r.tilt; this.sink = r.sink; this.hover = r.hover;
      this.run = null;
    }
  }

  busy() { return !!this.run || this.grab; }

  // --- drawing ------------------------------------------------------------------------
  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    drawDepth(ctx, c, { seed: 4 });
    drawCard(ctx, c, 52, 100, 576, FLOOR_Y - 100, 0.92);
    drawFloor(ctx, c, FLOOR_Y);
    const pans = drawBalance(ctx, c, {
      x: CX, y: PIVOT_Y, w: BEAM_W, tilt: this.tilt, standH: STAND_H, tone: c.gold, t: this.clock,
      left: [], right: [],
    });
    if (this.mount.people) this._people(ctx, c, pans);
    else this._blocks(ctx, c, pans);
    this._rail(ctx, c);
    this._labels(ctx, c);
  }

  _blocks(ctx, c, pans) {
    this._block(ctx, c, pans.left.x, pans.left.y + this.sink, 62, 46, darken(c.stroke, 0.3), true);
    this._block(ctx, c, pans.right.x, pans.right.y + this.hover, 54, 42, lighten(c.gold, 0.42), false);
  }

  // A block drawn on a pan: `by` is the pan surface the block's BASE sits on.
  _block(ctx, c, x, by, w, h, tone, iron) {
    const top = by - h;
    ctx.fillStyle = darken(tone, 0.38);
    rr(ctx, x - w / 2 + 3, top + 5, w, h, 9); ctx.fill();
    ctx.fillStyle = tone;
    rr(ctx, x - w / 2, top, w, h, 9); ctx.fill();
    ctx.save();
    rr(ctx, x - w / 2, top, w, h, 9); ctx.clip();
    if (iron) {
      ctx.strokeStyle = alpha(lighten(tone, 0.55), 0.55); ctx.lineWidth = 2;
      for (let i = -h; i < w; i += 9) { ctx.beginPath(); ctx.moveTo(x - w / 2 + i, by); ctx.lineTo(x - w / 2 + i + h, top); ctx.stroke(); }
    } else {
      ctx.strokeStyle = alpha(darken(tone, 0.35), 0.6); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, top + h * 0.38); ctx.lineTo(x + w / 2 - 6, top + h * 0.38); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - w / 2 + 8, top + h * 0.66); ctx.lineTo(x + w / 2 - 10, top + h * 0.66); ctx.stroke();
    }
    ctx.restore();
  }

  _people(ctx, c, pans) {
    this._figure(ctx, c, pans.left.x - 46, pans.left.y, c.s1, true);
    this._figure(ctx, c, pans.right.x + 46, pans.right.y, c.s4, false);
  }

  // A small flat-vector figure standing on a pan. The held thing goes in `between`.
  _figure(ctx, c, x, y, top, king) {
    drawFigure(ctx, c,
      { x, y, height: FIG_H, facing: 0, pose: 'stand', hands: king ? null : [{ x: x - 20, y: y - 50 }, { x: x + 18, y: y - 52 }] },
      { top, bottom: darken(top, 0.3), skin: king ? 1 : 2, hair: king ? 0 : 1, hairStyle: king ? 'short' : 'bun', mood: 'smile', t: this.clock },
      king
        ? { between: (g, sk) => this._crown(g, c, sk) }
        : { between: (g, sk) => this._staff(g, c, sk) });
  }

  _crown(ctx, c, sk) {
    const t = sk.anchors.top;
    ctx.fillStyle = c.gold;
    ctx.beginPath();
    ctx.moveTo(t.x - 15, t.y - 1);
    ctx.lineTo(t.x - 15, t.y - 8); ctx.lineTo(t.x - 7, t.y - 3);
    ctx.lineTo(t.x, t.y - 12); ctx.lineTo(t.x + 7, t.y - 3);
    ctx.lineTo(t.x + 15, t.y - 8); ctx.lineTo(t.x + 15, t.y - 1);
    ctx.closePath(); ctx.fill();
  }

  _staff(ctx, c, sk) {
    const x = sk.anchors.hand[1].x, y0 = sk.anchors.foot[0].y, y1 = sk.anchors.top.y - 34;
    ctx.strokeStyle = darken(c.gold, 0.3); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    ctx.lineCap = 'butt';
  }

  // The setting track: a rail, a notch per setting, and the marker.
  _rail(ctx, c) {
    const xs = NOTCH_X[this.mount.notches];
    ctx.strokeStyle = alpha(c.stroke, 0.55); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(RAIL_X0, RAIL_Y); ctx.lineTo(RAIL_X1, RAIL_Y); ctx.stroke();
    xs.forEach((x) => {
      ctx.strokeStyle = alpha(c.stroke, 0.8); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, RAIL_Y - 9); ctx.lineTo(x, RAIL_Y + 9); ctx.stroke();
    });
    if (this.hint) {
      const pulse = 0.5 + 0.5 * Math.sin(this.clock * 5);
      ctx.strokeStyle = alpha(c.accent, 0.35 + 0.4 * pulse); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(this.mx, RAIL_Y, 24 + 3 * pulse, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = mix(c.accent, c.label, 0.1);
    rr(ctx, this.mx - 9, RAIL_Y - 20, 18, 40, 9); ctx.fill();
    ctx.fillStyle = alpha(lighten(c.accent, 0.5), 0.85);
    rr(ctx, this.mx - 5, RAIL_Y - 16, 10, 14, 5); ctx.fill();
  }

  // The three labels, each under its own notch. The only text on the panel.
  _labels(ctx, c) {
    const xs = NOTCH_X[this.mount.notches];
    const maxW = xs.length > 1 ? xs[1] - xs[0] - 18 : 320;
    LABELS.slice(0, this.mount.notches).forEach((text, i) => {
      const lines = wrap(ctx, c, text, maxW, 13);
      const on = i === this.notch;
      ctx.font = font(c, on ? 700 : 500, 13);
      ctx.fillStyle = on ? c.label : alpha(c.labelMuted, 0.75);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      lines.forEach((ln, li) => ctx.fillText(ln, xs[i], RAIL_Y + 24 + li * 15));
    });
  }

  // --- input: the marker is the only thing on the panel that moves -------------------
  _notchAt(px) {
    const xs = NOTCH_X[this.mount.notches];
    let best = 0, bd = 1e9;
    xs.forEach((x, i) => { const d = Math.abs(px - x); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  pointerDown(p) {
    if (Math.abs(p.y - RAIL_Y) > 26 || p.x < RAIL_X0 - 20 || p.x > RAIL_X1 + 20) return;
    this.grab = true;
    this._place(this._notchAt(p.x));
    this.animateFor(RUN_T * 1000 + 200);
  }

  pointerMove(p) {
    if (!this.grab) return false;
    this._place(this._notchAt(p.x));
    this.animateFor(RUN_T * 1000 + 200);
    return true;
  }

  pointerUp() { this.grab = false; }
}

// Small local helpers (module functions, so they claim no names on the scene).
function wrap(ctx, c, text, maxW, size) {
  ctx.font = font(c, 500, size);
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  });
  if (line) lines.push(line);
  return lines;
}