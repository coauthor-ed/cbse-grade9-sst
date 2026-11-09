// GurukulaScene - a thatched campus in a forest river valley, drawn as a place
// the learner can walk around, with eleven vignettes on a path between them.
//
// THREE MOUNTS IN ONE FILE, told apart by the BEAT COUNT (0 = the s02 setup
// mount, 3 = the s01 walk-in mount, 5 = the s03 naming mount). SimScene's own
// onBeatChange sets `beatCount` before it enters a stage, and it is never
// overridden here, so the mount is read LIVE from a getter in every draw: nothing
// is cached at mount time, and enter() is mount-independent by construction.
//
// The whole campus is one continuous drawing in WORLD coordinates (1080 x 700),
// seen through a camera at three scales over CAMP (the full canvas width,
// 680 x 442). Colours are tokens only; figures are the kit's drawFigure.
//
// The s02 mount resolves the wager in no way: `_tags()` returns nothing unless
// the mount is s03, and `_captionFor()` names only a bare object there.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  ZONES, alpha, mix, lighten, darken, pill, chipRow, leader, chipSize, drawBackdrop,
  drawShadow, ellipse, rr, mulberry32, font,
} from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureLook } from 'simulations/base/kit/SimFigure.js';

/* ------------------------------------------------------------------ layout ---- */

const WORLD = { w: 1080, h: 700 };
const CAMP = { x: 0, y: 0, w: 680, h: 442 };   // the campus is the whole frame top
const CAP = { x: 16, y: 446, w: 648, h: 46 };   // caption strip, clear of the note line
const OVERSCAN = 46;                            // world px of drag slack at EVERY scale

const S_ALL = 0.63;      // the whole valley: all eleven in one frame
const S_THERE = 0.86;    // travelled to a station
const S_IN = 1.15;       // Look inside

// One map per mount, keyed by beat count. A stage IS its beat index in its mount.
const MAP_SETUP = [[{ idx: 0, dwellMs: null }]];
const MAP_S01 = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const MAP_S03 = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }],
  [{ idx: 3, dwellMs: null }]];

/* ------------------------------------------------------------------- trail ---- */

// A closed trail, walked node by node so the learner is always on the drawn
// path. Eleven station stops (even indices) and eleven bends, in one circuit.
const PATH = [
  [155, 565], [240, 578], [330, 580], [445, 588], [555, 590], [690, 594],
  [820, 578], [900, 545], [930, 460], [1000, 392], [950, 322], [872, 290],
  [785, 262], [640, 240], [470, 272], [300, 262], [150, 268], [180, 336],
  [255, 402], [430, 398], [600, 400], [380, 478],
];

// The eleven vignettes, in trail order, spread over three bands of the valley so
// no two crowd each other. `node` is the trail stop the learner stands at; `up`
// is how far above the station its tag floats, in design px. `name` is the
// neutral OBJECT the caption strip may carry - never a person, a subject, a
// purpose or a time of day.
const STATIONS = [
  { key: 'veena', node: 0, x: 155, y: 565, name: 'a veena', up: 96 , hw: 55 },
  { key: 'mridangam', node: 2, x: 330, y: 580, name: 'a mridangam', up: 96 , hw: 50 },
  { key: 'pigments', node: 4, x: 555, y: 590, name: 'a pigment pot', up: 84 , hw: 52 },
  { key: 'guru', node: 6, x: 820, y: 578, name: 'a mat', up: 150 , hw: 84, head: 100 },
  { key: 'reading', node: 8, x: 930, y: 460, name: 'a palm leaf', up: 128, hw: 72 },
  { key: 'jars', node: 10, x: 950, y: 322, name: 'a water jar', up: 96 , hw: 62 },
  { key: 'ascetic', node: 12, x: 785, y: 262, name: 'a rock', up: 52, hw: 47, seat: 40 },
  { key: 'wrestling', node: 14, x: 470, y: 272, name: 'a dirt pit', up: 88 , hw: 67 },
  { key: 'archery', node: 16, x: 150, y: 268, name: 'a bow', up: 104 , hw: 82 },
  { key: 'sweeping', node: 18, x: 255, y: 402, name: 'a broom', up: 92 , hw: 43 },
  { key: 'fire', node: 20, x: 600, y: 400, name: 'a fire', up: 92 , hw: 66 },
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TAG_TOP = ZONES.top.y + ZONES.top.h + 6;   // no tag rides up into the chip band
const ST = {};                        // key -> station
const NODE_STATION = {};              // trail node -> key
for (const s of STATIONS) { ST[s.key] = s; NODE_STATION[s.node] = s.key; }
const ORDER = STATIONS.map((s) => s.key);

/* --------------------------------------------------------------------- tags ---- */

const SUBJECTS = 'subjects';
const ARTS = 'arts and crafts';
const SERVICE = 'service to the guru';
const PARAMPARA = 'parampar\u0101';
const ACHARYA = '\u0101ch\u0101rya';

// Where each tag sits in the whole-valley view: open sky, open ground and the river, clear of every
// face and of each other at any width (these are design px). A moved camera falls back to tags over
// their stations, pushed apart.
const SLOTS = {
  [SERVICE]: { x: 385, y: 40 }, [SUBJECTS]: { x: 604, y: 40 },
  [ARTS]: { x: 125, y: 416 }, [PARAMPARA]: { x: 340, y: 416 },
  [ACHARYA]: { x: 500, y: 205 }, meditation: { x: 395, y: 165 }, yoga: { x: 402, y: 296 },
};
const HEAD = 80;   // design px from a station's foot to just over a head, whole-valley view

// The one mount-dependent line in the file: nothing at all unless s03.
function tagsFor(mount, stage) {
  if (mount !== 's03') return [];
  if (stage === 0) return [{ key: 'reading', text: SUBJECTS }];
  if (stage === 1) {
    return [{ key: 'reading', text: SUBJECTS },
      { key: 'veena', text: ARTS }, { key: 'mridangam', text: ARTS }, { key: 'pigments', text: ARTS },
      { key: 'sweeping', text: SERVICE }, { key: 'jars', text: SERVICE }];
  }
  if (stage === 2) return tagsFor(mount, 1).concat([{ key: 'guru', text: PARAMPARA }, { key: 'guru', text: ACHARYA }]);
  // Beat 3: the three groups together.
  return tagsFor(mount, 1).concat([{ key: 'ascetic', text: 'meditation' }, { key: 'fire', text: 'yoga' }]);
}

/* -------------------------------------------------------------------- scene ---- */

export class GurukulaScene extends SimScene {
  static BEAT_STEP_MAP = MAP_S01;
  static BEAT_MAPS = { 0: MAP_SETUP, [Number.MAX_SAFE_INTEGER]: MAP_SETUP, 1: MAP_SETUP, 3: MAP_S01, 4: MAP_S03 };
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL =
    'A thatched gurukula campus in a forest river valley, drawn as a place you can walk around. '
    + 'A path runs between eleven vignettes: a teacher lecturing a ring of disciples, a veena player, '
    + 'a mridangam player, a student mixing pigments, pupils around a fire, a disciple sweeping the '
    + 'courtyard, an archer at full draw, two youths wrestling, students carrying water jars, an ascetic '
    + 'on a rock beside the waterfall, and a student reading a palm-leaf manuscript. Drag the view or '
    + 'tap a vignette to walk to it; a caption strip names the plain object standing there.';
  static CONTROLS = [
    { type: 'button', id: 'inside', label: 'Look inside' },
    { type: 'button', id: 'prev', label: 'Earlier station' },
    { type: 'button', id: 'next', label: 'Next station' },
  ];

  constructor(container, config) {
    super(container, config);
    this._cam = { x: WORLD.w / 2, y: WORLD.h / 2, s: S_ALL };   // drawn camera
    this._camTo = { ...this._cam };                             // where it is easing to
    this._at = null;      // station key the learner is standing at, or null
    this._inside = false; // Look inside, a toggle
    this._walk = null;    // { from, legs, t, dur } while travelling
    this._px = PATH[0][0];
    this._py = PATH[0][1];
    this._facing = 1;
    this._down = null;    // pointer-down point, design px
    this._drag = false;   // this gesture has become a pan, not a tap
    this._rnd = mulberry32(11);
  }

  /* ------------------------------------------------------------------ mount ---- */

  /** Read LIVE: never cached, because setup() enters stage 0 with beatCount 0. */
  get _mount() { return this.beatCount === 3 ? 's01' : this.beatCount === 4 ? 's03' : 's02'; }
  get _st() { return Number.isFinite(this.stage) ? this.stage : 0; }
  get _s03() { return this._mount === 's03'; }

  /** Beats that hold the frame still: all eleven, no walker, nothing named. */
  get _held() {
    if (this._moved) return false;                // the learner walked: the walker shows
    if (this._mount === 's01') return this._st === 0 || this._st === 2;
    if (this._mount === 's02') return false;
    return this._st === 3;
  }
  /** The caption strip may carry a bare object name on these beats only. */
  get _captions() { return this._mount === 's02' || (this._mount === 's01' && this._st === 1); }

  /* ------------------------------------------------------------- note + cam ---- */

  /** World point -> design point, under the current camera. */
  _d(wx, wy) {
    const k = this._cam;
    return { x: CAMP.w / 2 + (wx - k.x) * k.s, y: CAMP.h / 2 + (wy - k.y) * k.s };
  }

  _clampCam(cam) {
    const hw = CAMP.w / (2 * cam.s), hh = CAMP.h / (2 * cam.s);
    const lx = hw - OVERSCAN, hx = WORLD.w - hw + OVERSCAN;
    const ly = hh - OVERSCAN, hy = WORLD.h - hh + OVERSCAN;
    cam.x = lx > hx ? WORLD.w / 2 : Math.max(lx, Math.min(hx, cam.x));
    cam.y = ly > hy ? WORLD.h / 2 : Math.max(ly, Math.min(hy, cam.y));
    return cam;
  }

  /** Set where the camera is heading; update() eases it there and parks. */
  _goTo(x, y, s) {
    this._camTo = this._clampCam({ x, y, s });
  }

  /**
   * Where the camera wants to be. A stage opens on the WHOLE valley: the stub
   * says the campus does not change and the camera position does not either, so
   * the view only follows the learner once they have actually moved.
   */
  _settle() {
    if (!this._moved) this._goTo(WORLD.w / 2, WORLD.h / 2, S_ALL);
    else {
      // With no station chosen, Look inside magnifies the campus itself, so the
      // button is live on EVERY beat of every mount (the stub says so) and never
      // a control that does nothing.
      const st = this._at ? ST[this._at] : { x: WORLD.w / 2, y: WORLD.h / 2 };
      this._goTo(st.x, st.y, this._inside ? S_IN : S_THERE);
    }
  }

  /* --------------------------------------------------------------- lifecycle ---- */

  enter() {
    this._walk = null;
    this._drag = false;
    this._down = null;
    this._heldReset();
    this._settle();
  }

  /** What a stage owns. A resumed lesson may arrive at any stage of any mount. */
  _heldReset() {
    this._inside = false;
    this._moved = false;               // the camera opens on the whole valley
    this._cam = { x: WORLD.w / 2, y: WORLD.h / 2, s: S_ALL };
    this._camTo = { ...this._cam };
    this._at = this._held ? null : ORDER[0];
    const n = this._at ? ST[this._at].node : 0;
    this._px = PATH[n][0]; this._py = PATH[n][1];
    this._facing = 1;
  }

  /* ---------------------------------------------------------------- walking ---- */

  /** Travel from where the learner stands to a station, along the drawn trail. */
  travelTo(key) {
    const st = ST[key];
    if (!st) return;
    this._at = this._at ?? ORDER[0];              // a held beat has no walker yet: he starts at the first stop
    const n = PATH.length;
    const from = ST[this._at].node;
    const legs = [from];
    let cur = from;
    for (let i = 0; i < n && cur !== st.node; i++) { cur = (cur + 1) % n; legs.push(cur); }
    if (legs.length === 1) { this._settle(); return; }
    const dur = Math.min(2.6, 0.5 * (legs.length - 1));
    this._walk = { legs, t: 0, dur };
    this._pending = key;
    this._inside = false;
    this._moved = true;
    this._settle();
    this.animateFor?.(dur * 1000 + 400);
  }

  _step(d) {
    const w = this._walk;
    const total = w.legs.length - 1;
    const u = Math.min(1, w.t / w.dur) * total;
    const seg = Math.min(total - 1, Math.floor(u));
    const f = u - seg;
    const a = PATH[w.legs[seg]], b = PATH[w.legs[seg + 1]];
    this._px = a[0] + (b[0] - a[0]) * f;
    this._py = a[1] + (b[1] - a[1]) * f;
    this._facing = b[0] >= a[0] ? 1 : -1;
    if (w.t >= w.dur) { this._walk = null; this._at = this._pending; this._pending = null; }
  }

  update(d) {
    if (this._walk) {
      this._walk.t += d;
      this._step(d);
      if (this._walk) {
        this._camTo = this._clampCam({ x: this._px, y: this._py, s: this._inside ? S_IN : S_THERE });
      }
    } else {
      this._settle();
    }
    const k = this._cam, t = this._camTo;
    const rate = Math.min(1, d * 5.5);
    k.x += (t.x - k.x) * rate;
    k.y += (t.y - k.y) * rate;
    k.s += (t.s - k.s) * rate;
    if (Math.abs(t.x - k.x) < 0.3 && Math.abs(t.y - k.y) < 0.3 && Math.abs(t.s - k.s) < 0.002) {
      k.x = t.x; k.y = t.y; k.s = t.s;
    }
  }

  busy() { return !!this._walk || this._drag || this._camSettling(); }

  _camSettling() {
    const k = this._cam, t = this._camTo;
    return Math.abs(t.x - k.x) > 0.3 || Math.abs(t.y - k.y) > 0.3 || Math.abs(t.s - k.s) > 0.002;
  }

  /* ---------------------------------------------------------------- controls ---- */

  onControlChange(id) {
    if (!this._guard(id)) return;
    const i = ORDER.indexOf(this._at ?? ORDER[0]);
    if (id === 'inside') { this._inside = !this._inside; this._moved = true; }
    else if (id === 'next') this.travelTo(ORDER[(i + 1) % ORDER.length]);
    else if (id === 'prev') this.travelTo(ORDER[(i - 1 + ORDER.length) % ORDER.length]);
    else return;
    this._settle();
    this.requestUiUpdate?.();
    this.animateFor?.(600);
  }

  /* ----------------------------------------------------------------- pointer ---- */

  pointerDown(p) {
    if (p.y > CAMP.h) return;
    this._down = { x: p.x, y: p.y };
    this._drag = false;
  }

  pointerMove(p) {
    if (!this._down || this._walk) return false;
    if (!this._drag && Math.hypot(p.x - this._down.x, p.y - this._down.y) > 5) {
      this._drag = true;
      this._inside = false;
    }
    if (!this._drag) return false;
    const k = this._cam;
    this._cam = this._clampCam({ x: k.x - (p.x - this._down.x) / k.s, y: k.y - (p.y - this._down.y) / k.s, s: k.s });
    this._camTo = { ...this._cam };
    this._down = { x: p.x, y: p.y };
    this.animateFor(400);
    return true;
  }

  pointerUp(p) {
    if (!this._down) return;
    const wasDrag = this._drag;
    this._down = null;
    this._drag = false;
    if (wasDrag || this._walk) { this.animateFor(200); return; }
    if (p.y > CAMP.h) { this.animateFor(200); return; }
    // A tap with no drag travels to the vignette under the pointer.
    let best = null, bd = 74;
    for (const st of STATIONS) {
      const d = this._d(st.x, st.y);
      const dd = Math.hypot(d.x - p.x, d.y - p.y);
      if (dd < bd) { bd = dd; best = st.key; }
    }
    if (best) this.travelTo(best);
    this._settle();
    this.animateFor?.(600);
  }

  /* -------------------------------------------------------------------- draw ---- */

  draw(ctx, c) {
    // The kit's frame check reads solver bounds in DESIGN px, so every figure is
    // drawn on the base transform, at its station's projected point, with its
    // height scaled by the camera. Scenery keeps the world transform below.
    this._base = ctx.getTransform();
    drawBackdrop(ctx, c, 'plain');
    ctx.save();
    ctx.beginPath();
    ctx.rect(CAMP.x, CAMP.y, CAMP.w, CAMP.h);
    ctx.clip();
    ctx.translate(CAMP.w / 2 - this._cam.x * this._cam.s, CAMP.h / 2 - this._cam.y * this._cam.s);
    ctx.scale(this._cam.s, this._cam.s);

    this._ground(ctx, c);
    this._mountain(ctx, c);
    this._waterfall(ctx, c);
    this._huts(ctx, c);
    this._courtyard(ctx, c);
    this._stream(ctx, c);
    this._trail(ctx, c);
    // Cull what the camera has moved off the frame, by each station's OWN
    // drawn half-width at the current scale: a fixed margin culled the archer at
    // the overview and still let a guru ring poke off the frame when zoomed in.
    for (const st of STATIONS.slice().sort((a, b) => a.y - b.y)) {
      if (!this._inView(st)) continue;
      this._vignette(ctx, c, st);
    }
    if (!this._held) this._walker(ctx, c);
    ctx.restore();

    this._tags(ctx, c);
    this._strip(ctx, c);
    if (this._s03) this._chips(ctx, c);
  }

  /** Is this station's drawn body inside the frame at the current camera? */
  _inView(st) {
    const p = this._d(st.x, st.y);
    const hw = st.hw * (this._cam.s / S_ALL);
    return !(p.x < hw || p.x > CAMP.w - hw * 0.3 || p.y < 0 || p.y > CAMP.h);
  }

  /* --------------------------------------------------------------- backdrop ---- */

  _ground(ctx, c) {
    const far = mix(c.good, c.bgDeep, 0.58);
    const mid = mix(c.good, c.bgDeep, 0.44);
    const near = mix(c.good, c.bgDeep, 0.28);
    ctx.fillStyle = far;
    ctx.fillRect(-200, 210, WORLD.w + 400, 606);
    ctx.fillStyle = mid;
    ellipse(ctx, 360, 350, 480, 132); ctx.fill();
    ellipse(ctx, 800, 520, 560, 176); ctx.fill();
    ctx.fillStyle = near;
    ellipse(ctx, 700, 706, 720, 200); ctx.fill();
    // Faint mown bands so the ground reads as a held surface, not a wash.
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = lighten(near, 0.16);
    ctx.lineWidth = 5;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(700, 712, 210 + i * 82, 58 + i * 22, 0, Math.PI, TAU_END);
      ctx.stroke();
    }
    ctx.restore();
  }

  _mountain(ctx, c) {
    const high = mix(c.bgDeep, c.label, 0.16);
    const forest = mix(c.good, c.bgDeep, 0.62);
    // The slope the campus sits against, and the far ridge behind it.
    ctx.fillStyle = high;
    ctx.beginPath();
    ctx.moveTo(-80, 236); ctx.lineTo(120, 96); ctx.lineTo(330, 44); ctx.lineTo(560, 86);
    ctx.lineTo(760, 26); ctx.lineTo(960, 78); ctx.lineTo(1160, 40);
    ctx.lineTo(1160, 268); ctx.closePath(); ctx.fill();
    ctx.fillStyle = forest;
    ctx.beginPath();
    ctx.moveTo(-80, 272); ctx.lineTo(240, 156); ctx.lineTo(520, 194);
    ctx.lineTo(820, 126); ctx.lineTo(1160, 178); ctx.lineTo(1160, 300); ctx.closePath();
    ctx.fill();
    // A treeline along the foot of the slope: the forest the campus sits in.
    ctx.fillStyle = darken(forest, 0.28);
    const r = mulberry32(5);
    for (let i = 0; i < 46; i++) {
      const x = -40 + i * 25 + r() * 10;
      const y = 276 + Math.sin(i * 0.7) * 8 + r() * 8;
      const hh = 24 + r() * 20;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x - hh * 0.34, y - hh * 0.6, x, y - hh);
      ctx.quadraticCurveTo(x + hh * 0.34, y - hh * 0.6, x, y);
      ctx.fill();
    }
  }

  /** Water coming down the slope behind the huts, into the pool by the rock. */
  _waterfall(ctx, c) {
    const fall = mix(c.water, c.bgSurface, 0.5);
    const fallHi = lighten(fall, 0.32);
    ctx.fillStyle = mix(c.water, c.bgDeep, 0.3);
    ellipse(ctx, 700, 300, 56, 16); ctx.fill();
    ctx.fillStyle = fall;
    ctx.beginPath();
    ctx.moveTo(684, 44); ctx.lineTo(712, 44); ctx.lineTo(708, 292); ctx.lineTo(688, 292);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = fallHi;
    ctx.fillRect(690, 52, 5, 232);
    ctx.fillRect(700, 64, 4, 220);
    ctx.fillStyle = alpha(fallHi, 0.45);
    ellipse(ctx, 700, 296, 44, 13); ctx.fill();
  }

  _hut(ctx, c, x, y, w, h) {
    const wall = mix(c.gold, c.bgDeep, 0.52);
    const thatch = mix(c.gold, c.bgDeep, 0.2);
    const thatchLo = darken(thatch, 0.3);
    ctx.fillStyle = wall;
    rr(ctx, x - w / 2, y - h * 0.44, w, h * 0.44, 4); ctx.fill();
    ctx.fillStyle = thatch;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.62, y - h * 0.42);
    ctx.quadraticCurveTo(x, y - h * 1.12, x + w * 0.62, y - h * 0.42);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = thatchLo;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.62, y - h * 0.42);
    ctx.quadraticCurveTo(x - w * 0.2, y - h * 0.86, x, y - h * 0.92);
    ctx.quadraticCurveTo(x - w * 0.3, y - h * 0.62, x - w * 0.1, y - h * 0.42);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = darken(wall, 0.42);
    rr(ctx, x - w * 0.11, y - h * 0.3, w * 0.22, h * 0.3, 3); ctx.fill();
  }

  /** The dwellings: a thatched cluster set back against the treeline. */
  _huts(ctx, c) {
    const r = mulberry32(3);
    for (let i = 0; i < 5; i++) {
      const x = 62 + i * 80 + r() * 10;
      const y = 216 + (i % 2) * 22 + r() * 5;
      this._hut(ctx, c, x, y, 62 + r() * 10, 54 + r() * 8);
    }
  }

  /** The swept-earth courtyard the fire sits in and the sweeper works over. */
  _courtyard(ctx, c) {
    const earth = mix(c.gold, c.bgSurface, 0.42);
    const earthLo = darken(earth, 0.16);
    ctx.fillStyle = earthLo;
    ellipse(ctx, 438, 456, 272, 92); ctx.fill();
    ctx.fillStyle = earth;
    ellipse(ctx, 438, 452, 264, 86); ctx.fill();
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = lighten(earth, 0.22);
    ctx.lineWidth = 3;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(438, 452, 264 - i * 44, 86 - i * 13, 0, 0, TAU_END);
      ctx.stroke();
    }
    ctx.restore();
  }

  _trail(ctx, c) {
    const col = mix(c.gold, c.bgSurface, 0.6);
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 15;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    PATH.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = darken(col, 0.18);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /** The stream cutting the near field, and the cattle grazing beside it. */
  _stream(ctx, c) {
    const water = mix(c.water, c.bgDeep, 0.34);
    const bank = mix(c.gold, c.bgSurface, 0.52);
    ctx.lineCap = 'round';
    ctx.strokeStyle = bank;
    ctx.lineWidth = 54;
    ctx.beginPath();
    ctx.moveTo(-60, 664); ctx.lineTo(280, 642); ctx.lineTo(600, 654); ctx.lineTo(880, 630); ctx.lineTo(1140, 646);
    ctx.stroke();
    ctx.strokeStyle = water;
    ctx.lineWidth = 34;
    ctx.stroke();
    ctx.strokeStyle = alpha(lighten(water, 0.34), 0.6);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-60, 658); ctx.lineTo(280, 636); ctx.lineTo(600, 648); ctx.lineTo(880, 624); ctx.lineTo(1140, 640);
    ctx.stroke();
    this._cow(ctx, c, 132, 606, 1, -1);
    this._cow(ctx, c, 226, 600, 0.86, 1);
  }

  _cow(ctx, c, x, y, s, face) {
    const hide = mix(c.bgSurface, c.label, 0.42);
    const hideLo = darken(hide, 0.26);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face, s);
    drawShadow(ctx, c, 0, 4, 40, 9);
    ctx.fillStyle = hide;
    ellipse(ctx, 0, -30, 34, 17); ctx.fill();
    ctx.fillStyle = hideLo;
    ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(22, -20); ctx.lineTo(18, 0); ctx.lineTo(-26, 0);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -22); ctx.lineTo(24, -22); ctx.lineTo(22, 0); ctx.lineTo(6, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = hide;
    ellipse(ctx, 36, -42, 15, 11); ctx.fill();
    ctx.fillStyle = mix(c.bgSurface, c.label, 0.62);
    ctx.beginPath(); ctx.moveTo(28, -52); ctx.lineTo(22, -62); ctx.lineTo(34, -56); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(44, -52); ctx.lineTo(52, -62); ctx.lineTo(50, -52); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = hideLo; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-34, -34); ctx.quadraticCurveTo(-50, -26, -44, -6); ctx.stroke();
    ctx.restore();
  }

  /* ------------------------------------------------------------- vignettes ---- */

  /** A world point as a design point under the current camera. */
  _p(wx, wy) {
    const k = this._cam;
    return { x: CAMP.w / 2 + (wx - k.x) * k.s, y: CAMP.h / 2 + (wy - k.y) * k.s };
  }

  /**
   * One figure. The spec is written in WORLD px; it is mapped to design px and
   * drawn on the BASE transform, so the kit's frame check reads real bounds and
   * the whole scene keeps one camera. Everything held (`between`) is then in the
   * same design space as the anchors it hangs off.
   */
  _fig(ctx, c, spec, look = {}, o = {}) {
    const k = this._cam;
    const m = (q) => (q ? this._p(q.x, q.y) : null);
    const p = this._p(spec.x, spec.y);
    const d = {
      x: p.x, y: p.y, height: spec.height * k.s, facing: spec.facing,
      build: spec.build, pose: spec.pose,
    };
    const hands = spec.hands ? spec.hands.map(m) : undefined;
    const feet = spec.feet ? spec.feet.map(m) : undefined;
    const hip = spec.hip ? m(spec.hip) : undefined;
    if (hands) d.hands = hands;
    if (feet) d.feet = feet;
    if (hip) d.hip = hip;
    ctx.save();
    ctx.setTransform(this._base);
    const sk = drawFigure(ctx, c, d, figureLook(c, look), o);
    ctx.restore();
    return sk;
  }

  _vignette(ctx, c, st) {
    switch (st.key) {
      case 'veena': return this._veena(ctx, c, st);
      case 'mridangam': return this._mridangam(ctx, c, st);
      case 'pigments': return this._pigments(ctx, c, st);
      case 'guru': return this._guru(ctx, c, st);
      case 'reading': return this._reading(ctx, c, st);
      case 'jars': return this._jars(ctx, c, st);
      case 'ascetic': return this._ascetic(ctx, c, st);
      case 'wrestling': return this._wrestling(ctx, c, st);
      case 'archery': return this._archery(ctx, c, st);
      case 'sweeping': return this._sweeping(ctx, c, st);
      case 'fire': return this._fire(ctx, c, st);
      default: return undefined;
    }
  }

  /** A flat grass mat under a seated figure. */
  _mat(ctx, c, x, y, w) {
    ctx.fillStyle = mix(c.gold, c.bgDeep, 0.34);
    ellipse(ctx, x, y + 3, w, w * 0.3); ctx.fill();
  }

  _veena(ctx, c, st) {
    const H = 116;
    this._mat(ctx, c, st.x, st.y, 54);
    this._fig(ctx, c, {
      x: st.x, y: st.y, height: H, facing: 1, build: 'teen', pose: 'relax',
      hip: { x: st.x, y: st.y - H * 0.34 },
      feet: [{ x: st.x + 10, y: st.y }, { x: st.x - 8, y: st.y }],
    }, { skin: 1, hair: 0, hairStyle: 'short', top: c.s2 }, {
      between: (cx, sk) => {
        // The veena: a resonator at the hip and a long neck going up-forward.
        const hx = sk.anchors.hand[0].x, hy = sk.anchors.hand[0].y;
        ctx.fillStyle = mix(c.gold, c.bgDeep, 0.12);
        ellipse(ctx, hx - 4, hy + 34, 15 * this._cam.s, 19 * this._cam.s); ctx.fill();
        ctx.fillStyle = darken(mix(c.gold, c.bgDeep, 0.12), 0.3);
        ctx.beginPath();
        ctx.moveTo(hx - 7, hy + 16); ctx.lineTo(hx - 3, hy - 40); ctx.lineTo(hx + 3, hy - 40); ctx.lineTo(hx + 7, hy + 16);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = alpha(c.gold, 0.9); ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(hx - 5 + i * 3, hy + 14); ctx.lineTo(hx - 3 + i * 2.4, hy - 40); ctx.stroke();
        }
      },
    });
  }

  _mridangam(ctx, c, st) {
    const H = 116;
    this._mat(ctx, c, st.x, st.y, 56);
    this._fig(ctx, c, {
      x: st.x, y: st.y, height: H, facing: -1, build: 'teen', pose: 'relax',
      hip: { x: st.x, y: st.y - H * 0.34 },
      feet: [{ x: st.x + 12, y: st.y }, { x: st.x - 6, y: st.y }],
      hands: [{ x: st.x - 26, y: st.y - H * 0.44 }, { x: st.x + 24, y: st.y - H * 0.40 }],
    }, { skin: 2, hair: 0, hairStyle: 'short', top: c.s3 }, {
      between: (cx, sk) => {
        const a = sk.anchors.hand[0], b = sk.anchors.hand[1];
        const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2 + 4;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(-0.22);
        ctx.fillStyle = mix(c.gold, c.bgDeep, 0.28);
        rr(ctx, -26, -11, 52, 22, 11); ctx.fill();
        ctx.fillStyle = darken(c.bgDeep, 0.1);
        ellipse(ctx, -26, 0, 6, 11); ctx.fill();
        ellipse(ctx, 26, 0, 6, 11); ctx.fill();
        ctx.strokeStyle = alpha(c.label, 0.4); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke();
        ctx.restore();
      },
    });
  }

  _pigments(ctx, c, st) {
    const H = 112;
    this._mat(ctx, c, st.x, st.y, 50);
    // Three pigment pots and a half-painted animal figurine on a low board.
    for (let i = 0; i < 3; i++) {
      const px = st.x + 26 + i * 15;
      ctx.fillStyle = [mix(c.s2, c.bgDeep, 0.2), mix(c.s4, c.bgDeep, 0.2), mix(c.gold, c.bgDeep, 0.2)][i];
      rr(ctx, px - 6, st.y - 15, 12, 15, 3); ctx.fill();
      ctx.fillStyle = alpha(c.bgDeep, 0.4);
      ellipse(ctx, px, st.y - 15, 6, 2.4); ctx.fill();
    }
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.3);
    rr(ctx, st.x - 44, st.y - 9, 36, 9, 3); ctx.fill();
    ctx.fillStyle = mix(c.s5, c.bgDeep, 0.1);
    ellipse(ctx, st.x - 34, st.y - 14, 8, 5); ctx.fill();
    ctx.beginPath(); ctx.arc(st.x - 22, st.y - 16, 4, 0, TAU_END); ctx.fill();
    this._fig(ctx, c, {
      x: st.x, y: st.y, height: H, facing: 1, build: 'kid', pose: 'relax',
      hip: { x: st.x, y: st.y - H * 0.34 },
      feet: [{ x: st.x + 12, y: st.y }, { x: st.x - 6, y: st.y }],
      hands: [{ x: st.x + 20, y: st.y - H * 0.42 }, { x: st.x + 30, y: st.y - H * 0.36 }],
    }, { skin: 0, hair: 0, hairStyle: 'short', top: c.s5 });
  }

  _guru(ctx, c, st) {
    const H = 132;
    // A ring of mats, and shaven-headed disciples seated on them.
    const ring = 7, rad = 86;
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 - 0.5;
      const x = st.x + Math.cos(a) * rad, y = st.y + Math.sin(a) * rad * 0.52 + 26;
      this._mat(ctx, c, x, y, 30);
      this._fig(ctx, c, {
        x, y, height: 104, facing: x > st.x ? 1 : -1, build: 'kid', pose: 'relax',
        hip: { x, y: y - 104 * 0.32 },
        feet: [{ x: x + 10, y }, { x: x - 8, y }],
      }, { skin: (i % 4), hair: 0, hairStyle: 'short', top: c.s2, mood: 'smile' });
    }
    // The teacher, white-haired, mid-gesture.
    this._fig(ctx, c, {
      x: st.x, y: st.y - 18, height: H, facing: -1, build: 'adult', pose: 'point',
      hands: [{ x: st.x - 30, y: st.y - 18 - H * 0.66 }, { x: st.x + 18, y: st.y - 18 - H * 0.48 }],
    }, { skin: 1, hair: 2, hairStyle: 'short', sleeves: 'long', top: c.gold, bottom: mix(c.s5, c.bgDeep, 0.5) });
  }

  _reading(ctx, c, st) {
    // An awning on four posts, the constellation chart on a board, and the pair.
    const post = mix(c.gold, c.bgDeep, 0.42);
    ctx.strokeStyle = post; ctx.lineWidth = 6;
    for (const dx of [-62, 62]) {
      ctx.beginPath(); ctx.moveTo(st.x + dx, st.y); ctx.lineTo(st.x + dx, st.y - 96); ctx.stroke();
    }
    ctx.fillStyle = mix(c.gold, c.bgDeep, 0.16);
    ctx.beginPath();
    ctx.moveTo(st.x - 78, st.y - 92); ctx.lineTo(st.x + 78, st.y - 92);
    ctx.lineTo(st.x + 62, st.y - 122); ctx.lineTo(st.x - 62, st.y - 122);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = mix(c.bgSurface, c.label, 0.3);
    rr(ctx, st.x - 46, st.y - 84, 62, 46, 3); ctx.fill();
    ctx.fillStyle = alpha(c.label, 0.75); ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const px = st.x - 38 + (i % 3) * 20, py = st.y - 74 + Math.floor(i / 3) * 18 + (i % 2) * 4;
      ctx.beginPath(); ctx.arc(px, py, 2.6, 0, TAU_END); ctx.fill();
      if (i) {
        const qx = st.x - 38 + ((i - 1) % 3) * 20, qy = st.y - 74 + Math.floor((i - 1) / 3) * 18 + ((i - 1) % 2) * 4;
        ctx.strokeStyle = alpha(c.label, 0.4);
        ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
        ctx.fillStyle = alpha(c.label, 0.75);
      }
    }
    // Student seated with the manuscript, instructor standing and pointing.
    const H = 112;
    this._mat(ctx, c, st.x - 18, st.y, 44);
    this._fig(ctx, c, {
      x: st.x - 18, y: st.y, height: H, facing: 1, build: 'kid', pose: 'relax',
      hip: { x: st.x - 18, y: st.y - H * 0.34 },
      feet: [{ x: st.x - 6, y: st.y }, { x: st.x - 24, y: st.y }],
      hands: [{ x: st.x + 2, y: st.y - H * 0.42 }, { x: st.x - 6, y: st.y - H * 0.38 }],
    }, { skin: 3, hair: 0, hairStyle: 'short', top: c.s4 }, {
      between: (cx, sk) => {
        const h = sk.anchors.hand[0];
        ctx.fillStyle = mix(c.gold, c.bgSurface, 0.24);
        rr(ctx, h.x - 16, h.y - 6, 32, 12, 3); ctx.fill();
        ctx.strokeStyle = alpha(c.bgDeep, 0.5); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(h.x - 12, h.y); ctx.lineTo(h.x + 12, h.y); ctx.stroke();
      },
    });
    this._fig(ctx, c, {
      x: st.x + 62, y: st.y, height: 126, facing: -1, build: 'adult', pose: 'point',
      hands: [{ x: st.x + 26, y: st.y - 126 * 0.72 }, { x: st.x + 30, y: st.y - 126 * 0.52 }],
    }, { skin: 2, hair: 1, hairStyle: 'short', sleeves: 'long', top: c.s1 });
  }

  _jars(ctx, c, st) {
    // Two students under one shoulder yoke, each with a jar.
    const H = 120;
    for (const [i, dx] of [-52, 52].entries()) {
      const x = st.x + dx;
      drawShadow(ctx, c, x, st.y + 3, 26, 7);
      this._fig(ctx, c, {
        x, y: st.y, height: H, facing: dx > 0 ? 1 : -1, build: 'adult', pose: 'carry',
      }, { skin: (i + 1), hair: 0, hairStyle: 'short', top: c.s3 }, {
        between: (cx, sk) => {
          const a = sk.anchors.hand[0], b = sk.anchors.hand[1];
          const top = Math.min(a.y, b.y) - 6;
          ctx.strokeStyle = mix(c.gold, c.bgDeep, 0.3); ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(a.x, top); ctx.lineTo(b.x, top); ctx.stroke();
          for (const h of [a, b]) {
            ctx.strokeStyle = alpha(mix(c.gold, c.bgDeep, 0.3), 0.8); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(h.x, top); ctx.lineTo(h.x, h.y - 4); ctx.stroke();
            ctx.fillStyle = mix(c.gold, c.bgDeep, 0.44);
            ellipse(ctx, h.x, h.y + 16 * this._cam.s, 14 * this._cam.s, 16 * this._cam.s); ctx.fill();
            ctx.fillStyle = darken(mix(c.gold, c.bgDeep, 0.44), 0.24);
            ellipse(ctx, h.x, h.y + 30 * this._cam.s, 5 * this._cam.s, 4 * this._cam.s); ctx.fill();
          }
        },
      });
    }
  }

  _ascetic(ctx, c, st) {
    // A rock beside the falls, and a figure sitting still on it.
    const rock = mix(c.bgDeep, c.label, 0.34);
    ctx.fillStyle = rock;
    ctx.beginPath();
    ctx.moveTo(st.x - 52, st.y + 8); ctx.lineTo(st.x - 30, st.y - 46);
    ctx.lineTo(st.x + 20, st.y - 54); ctx.lineTo(st.x + 50, st.y - 4); ctx.lineTo(st.x + 30, st.y + 12);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = lighten(rock, 0.18);
    ctx.beginPath();
    ctx.moveTo(st.x - 30, st.y - 46); ctx.lineTo(st.x + 20, st.y - 54); ctx.lineTo(st.x + 10, st.y - 22);
    ctx.closePath(); ctx.fill();
    const H = 118, sy = st.y - 34;
    this._fig(ctx, c, {
      x: st.x, y: sy, height: H, facing: 1, build: 'adult', pose: 'relax',
      hip: { x: st.x, y: sy - H * 0.34 },
      feet: [{ x: st.x + 26, y: sy - H * 0.24 }, { x: st.x + 10, y: sy - H * 0.26 }],
      hands: [{ x: st.x + 18, y: sy - H * 0.2 }, { x: st.x + 6, y: sy - H * 0.18 }],
    }, { skin: 1, hair: 2, hairStyle: 'long', sleeves: 'long', top: c.s1, bottom: mix(c.s5, c.bgDeep, 0.5), mood: 'squint' });
  }

  _wrestling(ctx, c, st) {
    const dirt = mix(c.gold, c.bgDeep, 0.42);
    ctx.fillStyle = dirt;
    ellipse(ctx, st.x, st.y + 4, 84, 26); ctx.fill();
    ctx.fillStyle = lighten(dirt, 0.14);
    ellipse(ctx, st.x, st.y + 1, 74, 21); ctx.fill();
    this._fig(ctx, c, {
      x: st.x - 22, y: st.y, height: 122, facing: 1, build: 'teen', pose: 'push',
      hands: [{ x: st.x + 8, y: st.y - 122 * 0.66 }, { x: st.x + 12, y: st.y - 122 * 0.5 }],
    }, { skin: 2, hair: 0, hairStyle: 'short', top: c.s4 });
    this._fig(ctx, c, {
      x: st.x + 24, y: st.y - 4, height: 118, facing: -1, build: 'teen', pose: 'push',
      hands: [{ x: st.x - 8, y: st.y - 4 - 118 * 0.66 }, { x: st.x - 12, y: st.y - 4 - 118 * 0.5 }],
    }, { skin: 0, hair: 0, hairStyle: 'short', top: c.s2 });
  }

  _archery(ctx, c, st) {
    // The tree, the chalked mark, the archer at full draw.
    const trunk = mix(c.gold, c.bgDeep, 0.5);
    const leaf = mix(c.good, c.bgDeep, 0.5);
    ctx.fillStyle = trunk;
    rr(ctx, st.x + 66, st.y - 96, 15, 96, 5); ctx.fill();
    ctx.fillStyle = leaf;
    ellipse(ctx, st.x + 74, st.y - 118, 42, 34); ctx.fill();
    ctx.fillStyle = alpha(c.bgSurface, 0.85);
    rr(ctx, st.x + 62, st.y - 108, 8, 8, 2); ctx.fill();
    const H = 126;
    drawShadow(ctx, c, st.x, st.y + 3, 24, 7);
    this._fig(ctx, c, {
      x: st.x, y: st.y, height: H, facing: 1, build: 'teen', pose: 'stand',
      hands: [{ x: st.x + 28, y: st.y - H * 0.76 }, { x: st.x - 8, y: st.y - H * 0.72 }],
    }, { skin: 3, hair: 0, hairStyle: 'short', top: c.s1 }, {
      between: (cx, sk) => {
        const f = sk.anchors.hand[0], n = sk.anchors.hand[1];
        ctx.strokeStyle = mix(c.gold, c.bgDeep, 0.3); ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(f.x - 12, (f.y + n.y) / 2, 22, -1.1, 1.1); ctx.stroke();
        ctx.strokeStyle = alpha(c.label, 0.7); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(f.x - 3, (f.y + n.y) / 2 - 20); ctx.lineTo(n.x, n.y - 2); ctx.lineTo(f.x - 3, (f.y + n.y) / 2 + 20);
        ctx.stroke();
        // The shaft, from the string hand to the mark.
        ctx.strokeStyle = alpha(c.gold, 0.95); ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(st.x + 62, st.y - 104); ctx.lineTo(n.x, n.y - 2); ctx.stroke();
      },
    });
  }

  _sweeping(ctx, c, st) {
    const H = 124;
    drawShadow(ctx, c, st.x, st.y + 3, 22, 6);
    this._fig(ctx, c, {
      x: st.x, y: st.y, height: H, facing: 1, build: 'kid', pose: 'push',
      hands: [{ x: st.x + 30, y: st.y - H * 0.5 }, { x: st.x + 36, y: st.y - H * 0.38 }],
    }, { skin: 1, hair: 0, hairStyle: 'short', top: c.s5 }, {
      between: (cx, sk) => {
        const a = sk.anchors.hand[0];
        ctx.strokeStyle = mix(c.gold, c.bgDeep, 0.32); ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y - 4); ctx.lineTo(a.x + 34, a.y + 40); ctx.stroke();
        ctx.fillStyle = mix(c.gold, c.bgDeep, 0.1);
        ctx.beginPath();
        ctx.moveTo(a.x + 22, a.y + 34); ctx.lineTo(a.x + 46, a.y + 36); ctx.lineTo(a.x + 40, a.y + 62);
        ctx.closePath(); ctx.fill();
      },
    });
    // Swept arcs on the courtyard dirt, where the broom has already been.
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = lighten(mix(c.gold, c.bgSurface, 0.42), 0.3);
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(st.x + 62, st.y + 2, 26 + i * 16, -0.9, 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }

  _fire(ctx, c, st) {
    // One fire that is altar and hearth together: the flame, the pot, the offerings.
    const stone = mix(c.bgDeep, c.label, 0.24);
    ctx.fillStyle = stone;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU_END;
      ellipse(ctx, st.x + Math.cos(a) * 34, st.y - 4 + Math.sin(a) * 13, 9, 6); ctx.fill();
    }
    ctx.fillStyle = mix(c.flame, c.bgDeep, 0.1);
    ctx.beginPath();
    ctx.moveTo(st.x - 18, st.y - 6); ctx.quadraticCurveTo(st.x - 12, st.y - 34, st.x - 2, st.y - 16);
    ctx.quadraticCurveTo(st.x + 6, st.y - 42, st.x + 12, st.y - 14);
    ctx.quadraticCurveTo(st.x + 18, st.y - 6, st.x + 10, st.y - 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = lighten(c.flame, 0.32);
    ctx.beginPath();
    ctx.moveTo(st.x - 8, st.y - 6); ctx.quadraticCurveTo(st.x, st.y - 26, st.x + 6, st.y - 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = mix(c.bgDeep, c.label, 0.44);
    ellipse(ctx, st.x + 26, st.y - 12, 13, 10); ctx.fill();
    ctx.strokeStyle = alpha(c.gold, 0.9); ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(st.x + 16, st.y - 12); ctx.lineTo(st.x + 36, st.y - 12); ctx.stroke();
      break;
    }
    // Pupils clustered round it, seated.
    const spots = [[-58, 14, 1], [10, 26, 0], [58, 8, -1], [-24, 34, 1]];
    spots.forEach(([dx, dy, face], i) => {
      const x = st.x + dx, y = st.y + dy, H = 104;
      this._mat(ctx, c, x, y, 26);
      this._fig(ctx, c, {
        x, y, height: H, facing: face, build: 'kid', pose: 'relax',
        hip: { x, y: y - H * 0.32 },
        feet: [{ x: x + 9, y }, { x: x - 7, y }],
      }, { skin: (i % 4), hair: 0, hairStyle: 'short', top: c.s2 });
    });
  }

  /** The learner, on the drawn path, where the camera is easing. */
  _walker(ctx, c) {
    drawShadow(ctx, c, this._px, this._py + 3, 20, 6);
    this._fig(ctx, c, {
      x: this._px, y: this._py, height: 126, facing: this._facing, build: 'adult', pose: 'walk',
    }, { skin: 1, hair: 0, hairStyle: 'short', top: c.accent, bottom: mix(c.s5, c.bgDeep, 0.5) });
  }

  /* -------------------------------------------------------------------- tags ---- */

  _tags(ctx, c) {
    const tags = tagsFor(this._mount, this._st);
    if (!tags.length) return;
    const chain = this._s03 && this._st >= 2;
    const whole = Math.abs(this._cam.s - S_ALL) < 0.02;

    // ONE chip per distinct tag text, not one per station: the arts list names
    // three stations and the service tag names two, and three 330 px pills across
    // the bottom row overlap every time. Each chip sits above the centroid of the
    // stations it names, and a leader runs down to each of them.
    const groups = new Map();
    for (const t of tags) {
      if (!groups.has(t.text)) groups.set(t.text, []);
      if (this._inView(ST[t.key])) groups.get(t.text).push(ST[t.key]);
    }
    // Place every chip first, then push any two that would cross DOWN in turn.
    // Ascetic and service-to-the-guru both land near the same y from opposite
    // sides of the campus, and one de-collide pass fixed both at once.
    const chips = [];
    for (const [text, sts] of groups) {
      if (!sts.length) continue;
      const ps = sts.map((st) => ({ ...this._d(st.x, st.y), head: st.head ?? HEAD, seat: st.seat ?? 0 }));
      const cx = ps.reduce((t, p) => t + p.x, 0) / ps.length;
      const top = Math.min(...ps.map((p, i) => p.y - sts[i].up));
      // Size by the TEXT only, not by how many stations share it: 'service to the
      // guru' over two stations is still a short label.
      const size = 28;
      const m = chipSize(ctx, c, text, size);
      chips.push({ text, ps, size, m,
        x: clamp(cx, 8 + m.w / 2, CAMP.w - 8 - m.w / 2),
        // Below the s03 chip band: a tag that rides up under the verdict chip
        // is drawn half behind it, which reads as a clipped label.
        y: clamp(top, TAG_TOP + m.h / 2, CAMP.h - m.h / 2 - 8) });
    }
    if (whole) {
      for (const ch of chips) Object.assign(ch, SLOTS[ch.text] ?? {});
      for (const ch of chips) {
        if (ch.text !== PARAMPARA) continue;
        const g = ch.ps[0];
        ch.ps = [{ x: g.x - 74, y: g.y - 38, head: 0 }];   // the tag points at the chain, not the teacher
      }
    }
    chips.sort((a, b) => a.y - b.y);
    // Push each chip down until it clears every chip already placed. Comparing
    // only with the previous one missed a third chip a move had landed on, so
    // this walks the placed list instead of the sort order.
    const placed = [];
    for (const ch of chips) {
      for (let guard = 0; guard < 12 && !whole; guard++) {
        // x on a chip is its CENTRE, so compare centre-to-edge on both sides.
        const hit = placed.find((q) => Math.abs(q.y - ch.y) < (q.m.h + ch.m.h) / 2 + 6
          && ch.x + ch.m.w / 2 + 6 > q.x - q.m.w / 2
          && ch.x - ch.m.w / 2 - 6 < q.x + q.m.w / 2);
        if (!hit) break;
        ch.y = Math.min(CAMP.h - ch.m.h / 2 - 8, hit.y + (hit.m.h + ch.m.h) / 2 + 6);
      }
      placed.push(ch);
    }
    for (const ch of chips) {
      const box = pill(ctx, c, ch.text, ch.x, ch.y, { bg: c.accent, size: ch.size });
      for (const p of ch.ps) {
        const col = alpha(c.accent, 0.8);
        if (!whole) { leader(ctx, ch.x, ch.y + box.h / 2, p.x, p.y - 14, col, 1, this.clock); continue; }
        // Stops short of the head from above and at the feet from below: a line never ends on a face.
        const sx = clamp(p.x, ch.x - box.w / 2 + 16, ch.x + box.w / 2 - 16);
        if (ch.y + box.h / 2 < p.y - p.head) leader(ctx, sx, ch.y + box.h / 2, p.x, p.y - p.head, col, 1, this.clock);
        else leader(ctx, Math.min(sx, ch.x + box.w / 2), ch.y + (p.seat ? 0 : -box.h / 2), p.x - (p.seat ? 12 : 0), p.y + 4 - p.seat, col, 1, this.clock);
      }
    }
    if (!chain) return;
    // The guru-\u015bsh\u1e63ya line: a short unbroken chain of marks, disciples -> teacher.
    const g = ST.guru, p = this._d(g.x, g.y);
    const a = { x: p.x - 74, y: p.y - 34 }, b = { x: p.x - 16, y: p.y - 62 };
    for (let i = 0; i <= 9; i++) {
      const f = i / 9;
      const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f - Math.sin(f * Math.PI) * 10;
      ctx.fillStyle = i === 9 ? c.accent : alpha(c.accent, 0.75);
      ctx.beginPath(); ctx.arc(x, y, i === 9 ? 5 : 3.2, 0, TAU_END); ctx.fill();
    }
  }

  /* ------------------------------------------------------------------ chrome ---- */

  /** The caption strip: a bare object name, or nothing. Never a subject. */
  _strip(ctx, c) {
    if (this._s03) return;
    ctx.fillStyle = alpha(c.bgSurface, 0.5);
    rr(ctx, CAP.x, CAP.y, CAP.w, CAP.h, 12); ctx.fill();
    ctx.strokeStyle = alpha(c.stroke, 0.35);
    ctx.lineWidth = 1.5;
    rr(ctx, CAP.x, CAP.y, CAP.w, CAP.h, 12); ctx.stroke();
    if (!this._captions || !this._at) return;
    const st = ST[this._at];
    ctx.font = font(c, 800, 28);
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.name, CAP.x + CAP.w / 2, CAP.y + CAP.h / 2 + 1);
  }

  _chips(ctx, c) {
    const items = [['subjects', 'subjects, arts, daily practice', 'teacher and student', 'skills and inner values'][this._st] ?? 'subjects'];
    chipRow(ctx, c, items.map((text) => ({ text, bg: c.accent })), ZONES.top.x + ZONES.top.w / 2, 482, { align: 'center', size: 28 });
  }
}

const TAU_END = Math.PI * 2;
