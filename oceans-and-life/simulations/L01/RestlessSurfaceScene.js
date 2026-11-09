// RestlessSurfaceScene.js - the sea surface moving while the sea floor does not.
// The floor is drawn from a fixed point list and no code path ever changes it: that stillness is
// the whole point of the slide. The switch on the right is the only control.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  alpha, mix, darken, font, rr, pill, drawBackdrop, drawCard,
} from 'simulations/base/kit/SimLook.js';

const SURFACE_Y = 170;      // the level of the sea surface when it is calm
const FLOOR_PTS = [[120, 395], [200, 401], [280, 395], [360, 400], [440, 394], [520, 399], [600, 395], [664, 399]];
const CLIFF = [[16, 88], [58, 80], [96, 96], [120, 132], [120, 440], [16, 440]];
const COCO_X = 170, COCO_R = 12;
const CARD = { x: 500, y: 196, w: 156, h: 124 };
const SLOT = { x: 516, y: 250, w: 124, h: 28 };
const KNOB_CALM = 530, KNOB_MOVING = 626;
const ROLL_AMP = 9, ROLL_LEN = 110, ROLL_SPEED = 45;

export class RestlessSurfaceScene extends SimScene {
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static NOTE_STAGE = 0;
  static CONTINUOUS = true; // the rolling surface and the bobbing coconut go on for as long as the switch is on "moving": that never-ending motion is the content
  static ARIA_LABEL =
    'A side-on view of the sea: a low dark cliff at the left with a tag reading Kovalam, the sea '
    + 'surface drawn as a smooth level line, a coconut resting on it, and the sea floor drawn as a '
    + 'still line far below. A switch on the right, marked calm and moving, throws the surface '
    + 'between a flat line and a slow rolling texture. The coconut rides up and down on the rolling '
    + 'surface without travelling sideways, and the floor below never moves at all.';
  static CONTROLS = [
    { type: 'segmented', id: 'sea', label: 'Sea state', options: [{ value: 'calm', label: 'calm' }, { value: 'moving', label: 'moving' }] },
  ];

  constructor(container, config) {
    super(container, config);
    this._target = 'calm';      // the state the switch is in
    this._rough = 0;            // how rolled the surface is right now, 0..1
    this._knob = 0;             // where the knob has slid to, 0..1
    this._phase = 0;            // how far the surface has travelled
    this._trail = [];           // recent coconut heights, to show that it bobs
  }

  noteRows() {
    return [{ text: 'the sea is drawn small and slow, so the still floor below stands out' }];
  }

  enter(stage) {
    this._target = stage === 1 ? 'moving' : 'calm';
  }

  _surfaceY(x) {
    const amp = ROLL_AMP * this._rough;
    if (amp < 0.02) return SURFACE_Y;
    return SURFACE_Y - amp * Math.sin(((x - this._phase) * Math.PI * 2) / ROLL_LEN);
  }

  _coconutY() { return this._surfaceY(COCO_X) - COCO_R; }

  update(d) {
    this._phase += d * ROLL_SPEED;
    const t = this._target === 'moving' ? 1 : 0;
    this._rough += (t - this._rough) * Math.min(1, d * 3.2);
    this._knob += (t - this._knob) * Math.min(1, d * 9);
    this._trail.push({ t: this.clock, y: this._coconutY() });
    while (this._trail.length && this.clock - this._trail[0].t > 0.6) this._trail.shift();
  }

  busy() { return this._rough > 0.02 || Math.abs((this._target === 'moving' ? 1 : 0) - this._rough) > 0.01; }

  _setState(s) {
    if (this._target === s) return;
    this._target = s;
    this.requestUiUpdate?.();
  }

  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'sea') this._setState(v === 'moving' ? 'moving' : 'calm');
  }

  getControlValue(id) { return id === 'sea' ? this._target : super.getControlValue(id); }

  // The switch in the picture: tap the calm half or the moving half of the card.
  pointerDown(p) {
    if (p.x < CARD.x || p.x > CARD.x + CARD.w || p.y < CARD.y || p.y > CARD.y + CARD.h) return;
    this._setState(p.x < (CARD.x + CARD.w) / 2 ? 'calm' : 'moving');
    this.animateFor(400);
  }

  testState() {
    return {
      stage: this.stage,
      mode: this._target,
      rough: this._rough,
      coconutX: COCO_X,
      coconutY: this._coconutY(),
      surfaceAtCoconut: this._surfaceY(COCO_X),
      bobDelta: this._rough < 0.01 || !this._trail.length ? 0 : Math.abs(this._coconutY() - this._trail[0].y),
      floorY: FLOOR_PTS[0][1],
      floorSig: FLOOR_PTS.map(([x, y]) => `${x}:${y}`).join(','),
    };
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    const water = c.water;
    const rock = mix(c.s5, c.bgDeep, 0.5);

    // The sea: from the surface down to the floor, between the cliff and the right-hand edge.
    ctx.save();
    ctx.beginPath();
    for (let x = 120; x <= 664; x += 8) {
      const y = this._surfaceY(x);
      if (x === 120) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let i = FLOOR_PTS.length - 1; i >= 0; i--) ctx.lineTo(FLOOR_PTS[i][0], FLOOR_PTS[i][1]);
    ctx.closePath();
    ctx.fillStyle = alpha(water, 0.34);
    ctx.fill();
    ctx.restore();

    // The sea floor: a still line with the rock under it. Nothing here is ever animated.
    ctx.save();
    ctx.beginPath();
    FLOOR_PTS.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineTo(664, 520);
    ctx.lineTo(120, 520);
    ctx.closePath();
    ctx.fillStyle = rock;
    ctx.fill();
    ctx.beginPath();
    FLOOR_PTS.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = alpha(darken(rock, 0.35), 0.95);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // The cliff, and the tag on it.
    ctx.save();
    ctx.beginPath();
    CLIFF.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = darken(rock, 0.3);
    ctx.fill();
    ctx.restore();
    pill(ctx, c, 'Kovalam', 58, 128, { bg: c.raised, size: 14 });

    // The surface itself: a band that rolls with the sea.
    ctx.save();
    ctx.beginPath();
    for (let x = 120; x <= 664; x += 8) {
      const y = this._surfaceY(x);
      if (x === 120) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let x = 664; x >= 120; x -= 8) ctx.lineTo(x, this._surfaceY(x) + 6);
    ctx.closePath();
    ctx.fillStyle = alpha(water, 0.9);
    ctx.fill();
    ctx.beginPath();
    for (let x = 120; x <= 664; x += 8) {
      const y = this._surfaceY(x);
      if (x === 120) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = mix(water, c.label, 0.15);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // The coconut, riding the surface at its own x and never moving sideways.
    const cy = this._coconutY();
    ctx.save();
    ctx.fillStyle = mix(c.gold, c.bgDeep, 0.35);
    ctx.beginPath();
    ctx.arc(COCO_X, cy, COCO_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = alpha(darken(mix(c.gold, c.bgDeep, 0.35), 0.4), 0.9);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = alpha(darken(mix(c.gold, c.bgDeep, 0.35), 0.45), 0.8);
    for (const a of [-0.9, 0, 0.9]) {
      ctx.beginPath();
      ctx.arc(COCO_X + Math.cos(a) * 5.5, cy + Math.sin(a) * 5.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // The switch, on the right of the picture.
    drawCard(ctx, c, CARD.x, CARD.y, CARD.w, CARD.h);
    ctx.save();
    rr(ctx, SLOT.x, SLOT.y, SLOT.w, SLOT.h, 14);
    ctx.fillStyle = mix(c.bgDeep, water, 0.22);
    ctx.fill();
    ctx.strokeStyle = alpha(c.stroke, 0.6);
    ctx.lineWidth = 2;
    ctx.stroke();
    const kx = KNOB_CALM + this._knob * (KNOB_MOVING - KNOB_CALM);
    ctx.beginPath();
    ctx.arc(kx, SLOT.y + SLOT.h / 2, 15, 0, Math.PI * 2);
    ctx.fillStyle = this._target === 'moving' ? c.accent : c.raised;
    ctx.fill();
    ctx.strokeStyle = alpha(c.stroke, 0.85);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = font(c, 700, 14);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this._target === 'calm' ? c.label : c.labelMuted;
    ctx.fillText('calm', KNOB_CALM, SLOT.y + SLOT.h + 24);
    ctx.fillStyle = this._target === 'moving' ? c.label : c.labelMuted;
    ctx.fillText('moving', KNOB_MOVING, SLOT.y + SLOT.h + 24);
    ctx.restore();
  }
}
