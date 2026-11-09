// PressureColumnScene.js - a hundred kilometres of air standing on one person, and one switch.
//
//   blk-l02-s12 - 3 beats. beat 0 the column grows under Run; beat 1 the switch goes and the
//     body reacts; beat 2 the switch is back, the column is full, and the scene stops.
//
// The column is the shared one: this scene imports makeAltitudeScale and the slab drawing from
// AtmosphereProfile.js, so the 10 km units here are the 10 km the learner climbed in
// AltitudeClimbScene. Two arrow sets sit on seven body sites solved off the real figure, and ONE
// length L feeds both, so the match between them is true by construction rather than by drawing
// them the same twice.
//
// The stub's rules, all load-bearing here: no number moves when the switch is thrown (the total is
// a function of km and km does not move), no word on the frame says why the figure feels nothing,
// and nothing appears on beat 2. The words "balanced", "equilibrium" and "cancel" are not on this
// scene in any form; L04 opens with wind and no wind arrow is drawn here.
//
// Rules: briefs/reference/scene-rules.md. Colours only from `c`.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  ZONES, alpha, mix, font, rr, pill, chipRow, chipColumn, drawBackdrop, drawDepth, drawCard,
  drawShadow, drawMotes, drawVignette,
} from 'simulations/base/kit/SimLook.js';
import { solveFigure, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { SimDraw } from 'simulations/base/SimDrawUtils.js';
import {
  COLUMN_SLAB_KM, makeAltitudeScale, drawColumnSlabs,
} from './AtmosphereProfile.js';

// One entry per REAL beat (scene-info: blk-l02-s12 has 3).
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],   // the weight, accumulating
  [{ idx: 1, dwellMs: null }],   // the switch, and the unpleasant part
  [{ idx: 2, dwellMs: null }],   // and still nothing
];
const S_B0 = 0, S_B1 = 1, S_B2 = 2;

// -- the frame ------------------------------------------------------------------
// The column's window: 100 km, the hundred kilometres the slide says was just climbed. It is a
// fragment of the shared scale, not a new one - makeAltitudeScale is the only mapping in the lesson.
// The column's foot sits 38 px above the head, which is the room the head's own arrow pair needs
// (2L + GAP at the longest L), so the topmost arrow never runs into the slab above it.
const KM_TOP = 100;
const SLAB = COLUMN_SLAB_KM;              // 10 km, declared once in the shared helper
const GROUND_Y = 400;                     // the feet: high enough that the sole arrows' tails clear
                                          // the bottom chip band (they reach y 450), low enough to
                                          // fill the hero's foot
const FIG_H = 160;                        // 160 px: a readable face, and half the hero's height
// The column STANDS on the head: its foot is the top of the head, not a slab-height above it, so
// there is no gap for the eye to read as "floating above". The head's own arriving arrow then
// reaches up INTO the column, which is the truer picture - the push comes out of the air above.
const SLAB_PX = 14;                       // 10 slabs of 14 px = 140 px of column
const COL_W = 170;                        // most of the hero's width: the air above a person is not a
                                          // narrow tower, and the slabs have to read as slabs
const COL_X = ZONES.hero.x + (ZONES.hero.w - COL_W) / 2;
const COL_FOOT_Y = GROUND_Y - FIG_H;      // 240: the top of the head
const s = makeAltitudeScale({
  groundY: COL_FOOT_Y, kmTop: KM_TOP, topY: COL_FOOT_Y - SLAB_PX * (KM_TOP / SLAB),
});
// The km rule goes on the column's RIGHT: the left zone's card is there, and a rule with its
// numbers hanging left would sit under that card for the whole scene.
const RULE_X = COL_X + COL_W + 18;

// -- the model numbers (the slide's, used exactly) --------------------------------
// 10 N on a fingernail. It is what the air above that patch presses with, so it is constant and
// is never a function of anything the learner does.
const N_PER_CM2 = 10;
// 10.0 kN over the ~1 m2 of head and shoulders the column stands on = 1.0 t, the slide's "about a
// tonne". 1.0 kN arrives per 10 km slab. Both are derived from the slide, not chosen.
const TOTAL_KN = 10.0;
const TOTAL_T = 1.0;
const PATCHES = 1000;                     // 10.0 kN / 10 N per cm2 - the tie between the two readouts

// The arrows. ONE length, computed from km and used by both sets: the match is the model, not a
// coincidence of drawing. 10 px of arrow on an empty column, 26 px on the full hundred - 2L+GAP is
// 57 px at the longest, which is what the headroom above the figure is sized for.
const L_MIN = 10, L_SPAN = 16;
const GAP = 5;                            // clear space between the inner head and the outer tail

// The figure, and the one place its mood lives.
const FIG = { x: ZONES.hero.x + ZONES.hero.w / 2, y: GROUND_Y, h: FIG_H };
const RUN_S = 4.0;                        // the whole column, ground to 100 km
const CROUCH_OFF = 0.18;                  // "it does not do it gently"
const CROUCH_ON = 0.50;                   // coming back is not so quick

// The left card: the two readouts, one card, because they are one fact at two scales.
const CARD_L = { x: ZONES.left.x, y: ZONES.left.y + 30, w: ZONES.left.w, h: 232 };
// The right card: the switch plate, and under it the key for the two arrow colours.
const CARD_R = { x: ZONES.right.x, y: ZONES.right.y + 30, w: ZONES.right.w, h: 118 };
const PLATE = { x: CARD_R.x + 20, y: CARD_R.y + 46, w: CARD_R.w - 40, h: 46 };
const KEY_Y = CARD_R.y + CARD_R.h + 20;

const NOTE = 'the 10 km slabs are a drawing convention: the real air between them thins out';

export class PressureColumnScene extends SimScene {
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static NOTE_STAGE = 0;                                 // one muted bottom line, every beat
  static CONTINUOUS = false;
  static ARIA_LABEL =
    'A person stands under a tall column of air built from ten slabs, each ten kilometres of height. '
    + 'Pressing Run grows the column from the ground up, slab by slab, while a readout of the weight '
    + 'on the head and shoulders climbs from zero newtons to ten kilonewtons, about one tonne, and a '
    + 'second readout holds at ten newtons on one square centimetre. Arrows point inward onto the '
    + 'person from seven places and arrows point outward from the same seven, always the same length. '
    + 'A switch removes the outward set; the inward set, the column and both numbers stay exactly as '
    + 'they were, and the person crouches. Throwing the switch back restores them.';
  static CONTROLS = [
    { type: 'button', id: 'run', label: 'Run' },
    { type: 'toggle', id: 'inside', label: 'push from inside', value: true },
  ];

  constructor(container, config) {
    super(container, config);
    this._km = 0;                            // how much column exists, in km
    this._inside = true;                     // the switch: the body's own push outward
    this._crouch = 0;                        // 0 upright, 1 the distress crouch
    this._ease = null;                       // { t, from, to, secs, stage } while moving
    this._prompt = true;                     // the pulsing "press Run" chip
  }

  // The one line the stub allows: it says the slabs are a convention and stops there. It must not
  // say the two pressures cancel, must not use "balanced", and must not excuse the figure.
  noteRows() { return [{ text: NOTE }]; }

  async setup() {
    await super.setup();
    // The stub: the switch must be operable by keyboard as well as by tap.
    if (this._canvas) {
      this._canvas.tabIndex = 0;
      this._onKey = (e) => this._key(e);
      this._canvas.addEventListener('keydown', this._onKey);
    }
  }

  destroy() {
    if (this._canvas && this._onKey) this._canvas.removeEventListener('keydown', this._onKey);
    super.destroy();
  }

  /**
   * Each stage owns the whole frame. Beat 1 does NOT inherit a full column: it starts from whatever
   * km the learner reached, and a short column is carried up to 100 km by the same 4 s ease Run uses,
   * so a learner who skipped beat 0 watches the column arrive rather than finding it already there.
   * Beat 2 sets its own opening state outright - switch on, column full, at rest - because the stub
   * says it "stops and stays stopped" and must not depend on how long beat 1 was watched.
   */
  enter(stage) {
    this._ease = null;
    this._crouchEase = null;
    this._crouch = 0;
    this._prompt = false;
    if (stage === S_B0) {
      this._km = 0;
      this._inside = true;
      // The first build is watched for the learner, once, half a second in: the stub's beat 0 IS the
      // weight accumulating, and an empty hero with a Run button is a frame with nothing in it. Run
      // stays live afterwards, so throwing it again replays the build from the ground.
      this.after(0.5, () => this._launch());
      return;
    }
    if (stage === S_B1) {
      this._inside = true;
      // The column is at full height for this beat. If this mount arrived here without one, carry
      // it up first, so the beat is never entered on a bare figure; either way the switch goes 0.9 s
      // after the column is standing, and it is the COLUMN standing that triggers it, not the clock
      // of the stage - so a learner who skipped beat 0 sees the same beat as one who watched it.
      if (this._km < KM_TOP) this._launch();
      else this.after(0.9, () => this._setInside(false));
      return;
    }
    this._km = KM_TOP;
    this._inside = true;
  }

  // -- the model -----------------------------------------------------------------

  /** Arrow length for the current column. Computed ONCE and used by both sets: that is the link. */
  get _len() { return L_MIN + L_SPAN * (this._km / KM_TOP); }

  get _kn() { return TOTAL_KN * (this._km / KM_TOP); }

  _launch() {
    if (this._ease) return;
    this._ease = { t: 0, from: this._km, to: KM_TOP, secs: RUN_S, stage: this.stage };
    this._prompt = false;
    this.animateFor?.(RUN_S * 1000 + 120);
  }

  /**
   * The one setter for the switch, so the control bar's toggle and the drawn lever can never
   * disagree. The crouch is the ONLY thing it touches: km, and therefore every number on the
   * frame, is a function of the column alone and this cannot move it.
   */
  _setInside(on) {
    if (this._inside === on) return;
    this._inside = on;
    this._easeCrouch(on ? 0 : 1, on ? CROUCH_ON : CROUCH_OFF);
    this.requestUiUpdate?.();
  }

  _easeCrouch(to, secs) {
    this._crouchEase = { t: 0, from: this._crouch, to, secs };
    this.animateFor?.(secs * 1000 + 120);
  }

  update(d) {
    const r = this._ease;
    if (r) {
      r.t += d;
      const u = Math.min(1, r.t / r.secs);
      this._km = r.from + (r.to - r.from) * (u * u * (3 - 2 * u));
      if (u >= 1) {
        this._km = r.to;
        this._ease = null;                   // it stops at 100 km and stays there
        if (r.stage === S_B1) this.after(0.9, () => this._setInside(false));
      }
    }
    const k = this._crouchEase;
    if (k) {
      k.t += d;
      const u = Math.min(1, k.t / k.secs);
      this._crouch = k.from + (k.to - k.from) * (u * u * (3 - 2 * u));
      if (u >= 1) this._crouchEase = null;
    }
  }

  // A run is easing, or the body is getting into or out of the crouch. Both end.
  busy() { return !!this._ease || !!this._crouchEase; }

  // -- drawing -------------------------------------------------------------------

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    drawDepth(ctx, c, { t: this.clock * 0.3 });

    // Solved ONCE per frame, before anything reads it: the arrows take their seven sites off this
    // exact solve, so an arrow can never sit on a different pose from the body it belongs to.
    this._solve();

    // The column first: it stands behind and above the figure, and the arrows are drawn over it.
    this._column(ctx, c);
    drawMotes(ctx, c, this.clock, { x: ZONES.hero.x, y: ZONES.hero.y, w: ZONES.hero.w, h: 200 }, { n: 14, col: c.s1 });
    this._arrows(ctx, c);
    this._figure(ctx, c);
    this._leftCard(ctx, c);
    this._rightCard(ctx, c);
    this._chips(ctx, c);
    drawVignette(ctx, c, 0.5);
  }

  _column(ctx, c) {
    drawColumnSlabs(ctx, c, s, {
      x: COL_X, width: COL_W, km: this._km, slabKm: SLAB, baseA: 0.4, riseA: 0.55,
    });
    // A km rule on the column's right, ticked every slab and labelled at 0, 50 and 100 only: the
    // frame is a fragment, and 10 km is a unit the learner has already climbed. Nothing is styled
    // as a boundary - this scene's slide has taught no band.
    const x = RULE_X;
    ctx.strokeStyle = alpha(c.stroke, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, s.yFor(0));
    ctx.lineTo(x, s.yFor(KM_TOP));
    ctx.stroke();
    ctx.font = font(c, 600, 12);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let km = 0; km <= KM_TOP; km += SLAB) {
      const y = s.yFor(km);
      const big = km % 50 === 0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (big ? 9 : 5), y);
      ctx.stroke();
      if (big) {
        ctx.fillStyle = c.label;
        ctx.fillText(`${km} km`, x + 13, y);
      }
    }
  }

  /** The seven matched sites, read off the solved figure so they sit on the real body. */
  _sites() {
    const sk = this._sk;
    const sh = sk.joints.arms.map((a) => a.shoulder);
    const foot = sk.anchors.foot;
    const hip = sk.joints.hip;
    const head = sk.joints.head;
    return [
      [{ x: head.x, y: head.y - head.r * 0.92 }, 0, -1],                     // top of the head
      [{ x: sh[0].x, y: sh[0].y - 3 }, 0.6, -0.8],                           // her right shoulder
      [{ x: sh[1].x, y: sh[1].y - 3 }, -0.6, -0.8],                          // her left shoulder
      [{ x: hip.x + 15, y: hip.y - 10 }, 0.9, -0.44],                        // right flank
      [{ x: hip.x - 15, y: hip.y - 10 }, -0.9, -0.44],                       // left flank
      [{ x: foot[0].x, y: foot[0].y + 1 }, 0.5, 0.87],                       // right sole
      [{ x: foot[1].x, y: foot[1].y + 1 }, -0.5, 0.87],                      // left sole
    ].map(([p, ux, uy]) => ({ p, ux, uy, len: Math.hypot(ux, uy) || 1 }));
  }

  /**
   * Both sets, on every site. ONE L feeds them, so "the same length" is arithmetic rather than a
   * thing drawn carefully twice; the leaving set is simply not drawn when the switch is off, which
   * is the whole visible consequence of throwing it.
   */
  _arrows(ctx, c) {
    const colOut = c.s1;                   // the air outside, arriving
    const colIn = c.s2;                    // the body, pushing back out
    const L = this._len;
    const o = SimDraw.drawArrow;
    for (const site of this._sites()) {
      const ux = site.ux / site.len, uy = site.uy / site.len;
      const inner = L;                     // ray 0 .. L, away from the body
      const outer0 = L + GAP;              // ray L+GAP .. 2L+GAP, back at the body
      // The arriving set first, so the body and the leaving set sit on top of it.
      o(ctx, site.p.x + ux * (outer0 + inner), site.p.y + uy * (outer0 + inner),
        site.p.x + ux * outer0, site.p.y + uy * outer0, { color: colOut, lineWidth: 4 });
      if (this._inside) {
        o(ctx, site.p.x, site.p.y, site.p.x + ux * inner, site.p.y + uy * inner, { color: colIn, lineWidth: 4 });
      }
    }
  }

  /**
   * The frame's figure, solved from the crouch alone. Hands to the knees once the crouch is on: the
   * grip points come off the UPRIGHT solve's knees, so they land on the leg whatever the crouch does
   * to the rest of the pose, and the figure never reaches for a point out of its own range.
   */
  _solve() {
    const crouch = this._crouch;
    // A SMALL crouch and a big lean. A deep crouch drops the head 11 px and opens a visible gap
    // under the column, which reads as the air sinking rather than as a person reacting; the lean,
    // the hands on the knees and the face carry the distress instead, and the column keeps standing
    // on the head it was standing on.
    const spec = {
      x: FIG.x, y: GROUND_Y, height: FIG.h, facing: 0,
      pose: { name: 'stand', crouch: 0.12 * crouch, lean: 13 * crouch, tilt: 7 * crouch },
    };
    if (crouch > 0.02) {
      const up = solveFigure({ ...spec, pose: 'stand' });
      spec.hands = [{ x: up.anchors.knee[0].x, y: up.anchors.knee[0].y + 6 },
        { x: up.anchors.knee[1].x, y: up.anchors.knee[1].y + 6 }];
    }
    this._spec = spec;
    this._sk = solveFigure(spec);
  }

  _figure(ctx, c) {
    // The contact shadow is flat and small: this is a floor, not a stage.
    drawShadow(ctx, c, FIG.x, GROUND_Y + 5, 30, 7, 0.65);
    drawFigure(ctx, c, this._spec,
      { top: c.s5, bottom: c.s5, skin: 1, hairStyle: 'short', mood: this._crouch > 0.5 ? 'oops' : 'smile' });
    // The 1 cm2 patch: the same gold square the left card draws, so the chip and its evidence are
    // one mark. It is the patch itself, not a label for the patch - and it is not drawn while the
    // hands are on the knees, where it would be under an arm.
    if (this._crouch < 0.5) {
      ctx.fillStyle = c.gold;
      ctx.fillRect(FIG.x + 7, this._sk.joints.hip.y - 12, 8, 8);
    }
  }

  // -- the readouts --------------------------------------------------------------

  _leftCard(ctx, c) {
    drawCard(ctx, c, CARD_L.x, CARD_L.y, CARD_L.w, CARD_L.h, 1, { accent: c.accent });
    const cx = CARD_L.x + CARD_L.w / 2;
    const sub = (text, y) => {
      ctx.font = font(c, 600, 12);
      ctx.fillStyle = c.label;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cx, y);
    };

    chipRow(ctx, c, [{ text: 'one square centimetre', bg: c.raised }], cx, CARD_L.y + 20, { align: 'center', size: 13 });
    // The 1 cm2 mark, drawn on the same row as its own number, never on it.
    const fy = CARD_L.y + 58;
    ctx.fillStyle = c.gold;
    ctx.fillRect(CARD_L.x + 30, fy - 7, 14, 14);
    pill(ctx, c, `${N_PER_CM2} N`, CARD_L.x + 106, fy, { bg: c.accent, size: 24, display: true });
    sub('on a fingernail', fy + 26);
    sub(`${PATCHES} such patches`, fy + 44);

    // The total, climbing. Held as strings and rewritten only when the rounded value changes, so a
    // 4 s climb never redraws the same text on itself.
    const knText = `${(Math.round(this._kn * 10) / 10).toFixed(1)} kN`;
    const tText = `${(Math.round((TOTAL_T * this._km / KM_TOP) * 10) / 10).toFixed(1)} t`;
    if (knText !== this._knText || tText !== this._tText) { this._knText = knText; this._tText = tText; }
    ctx.strokeStyle = alpha(c.stroke, 0.7);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CARD_L.x + 20, CARD_L.y + 122);
    ctx.lineTo(CARD_L.x + CARD_L.w - 20, CARD_L.y + 122);
    ctx.stroke();
    chipRow(ctx, c, [{ text: 'head and shoulders', bg: c.raised }], cx, CARD_L.y + 140, { align: 'center', size: 13 });
    pill(ctx, c, this._knText, cx, CARD_L.y + 178, { bg: c.accent, size: 30, display: true });
    // The same number in tonnes: "about a tonne" is something the learner reads off the frame, not
    // something the scene asserts in a caption.
    sub(`= ${this._tText}`, CARD_L.y + 208);
  }

  _rightCard(ctx, c) {
    drawCard(ctx, c, CARD_R.x, CARD_R.y, CARD_R.w, CARD_R.h, 1, { accent: c.s2 });
    chipRow(ctx, c, [{ text: 'push from inside', bg: c.raised }],
      CARD_R.x + CARD_R.w / 2, CARD_R.y + 18, { align: 'center', size: 13 });

    // The lever: a plate with a knob that sits left when the push is on and right when it is off.
    const on = this._inside;
    const kx = on ? PLATE.x + 15 : PLATE.x + PLATE.w - 15;
    ctx.fillStyle = mix(c.bgDeep, c.stroke, 0.4);
    rr(ctx, PLATE.x, PLATE.y, PLATE.w, PLATE.h, PLATE.h / 2);
    ctx.fill();
    ctx.strokeStyle = alpha(c.stroke, 0.9);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = on ? c.s2 : c.raised;
    ctx.beginPath();
    ctx.arc(kx, PLATE.y + PLATE.h / 2, PLATE.h / 2 - 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = font(c, 700, 13);
    ctx.textBaseline = 'middle';
    ctx.fillStyle = on ? c.label : c.labelMuted;
    ctx.textAlign = 'center';
    ctx.fillText(on ? 'on' : 'off', CARD_R.x + CARD_R.w / 2, PLATE.y + PLATE.h / 2);

    // The key for the two arrow colours, STACKED: two chips side by side are ~200 px in a 170 px
    // zone and ran off the canvas. It names the two sets and nothing else - not what they do, not
    // what happens when one of them is missing.
    chipColumn(ctx, c, [{ text: 'from outside', bg: c.s1 }, { text: 'from inside', bg: c.s2 }],
      CARD_R.x + CARD_R.w / 2, KEY_Y, { align: 'center', size: 13 });
  }

  _chips(ctx, c) {
    // One static title chip, left of the top band, on every beat: it names the frame and changes
    // never, so beat 2 cannot be said to have "added" anything.
    chipRow(ctx, c, [{ text: 'a column of air, on your head', bg: c.raised }],
      ZONES.top.x + 4, ZONES.top.y + ZONES.top.h / 2, { align: 'left', size: 14 });

    // The pulsing prompt, and only while there is something to do. It says what to press, never
    // what it means.
    const msg = this.stage === S_B0 ? 'press Run to build the column'
      : (this.stage === S_B1 && !this._inside ? 'throw the switch back' : null);
    if (!msg) return;
    const k = 0.5 + 0.5 * Math.sin(this.clock * 3.4);
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.45 * k;
    chipRow(ctx, c, [{ text: msg, bg: c.gold }],
      ZONES.top.x + ZONES.top.w - 4, ZONES.top.y + ZONES.top.h / 2, { align: 'right', size: 14 });
    ctx.restore();
  }

  // -- controls and input --------------------------------------------------------

  isControlHidden(id) { return id === 'run' && this.stage !== S_B0; }

  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'run') this._launch();
    else if (id === 'inside') this._setInside(!!v);
    this.requestUiUpdate?.();
  }

  /** What the host shows in the toggle: the scene's own value, so the bar and the lever agree. */
  getControlValue(id) { return id === 'inside' ? this._inside : super.getControlValue(id); }

  /** Tapping the plate throws the switch, for a learner on a phone. */
  pointerDown(p) {
    if (p.x < PLATE.x - 8 || p.x > PLATE.x + PLATE.w + 8) return;
    if (p.y < PLATE.y - 8 || p.y > PLATE.y + PLATE.h + 8) return;
    this._setInside(!this._inside);
  }

  /** Space and Enter throw the switch from the keyboard; nothing else is bound. */
  _key(e) {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    this._setInside(!this._inside);
  }
}
