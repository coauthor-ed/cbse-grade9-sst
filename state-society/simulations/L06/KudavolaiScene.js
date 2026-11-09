// KudavolaiScene - a pot of palm leaves, a child who draws them, and a crowd close enough to touch it.
//
// One file on three mounts, told apart by the beat count (0 = the s02 predict setup,
// 2 = blk-l06-s01, 3 = blk-l06-s03). Stage numbering is shared.
//
//   stage 0  the pot, unlabelled, the child's hand poised above the rim (s02 setup + s01 beat 0)
//   stage 1  the hint press the hand lit on the pot; drawn names stack  (s01 beat 0)
//   stage 3  two plain source tags at the top edge                     (s01 beat 1)
//   stage 4  the four parts named in turn, then `kudavolai`            (s03 beat 0)
//   stage 5  the ring brightens; three eye-lines to the hand           (s03 beat 1)
//   stage 6  three variyam slots; drawn names fill them                 (s03 beat 2)
//
// Rich look: a temple court in warm low light - a gopuram behind the court wall, a lit doorway,
// oil lamps on the pillars, sun shafts with dust in them, a kolam on the granite round the pot.
// The child is a kit figure standing at the pot's right side, in front of it: on a press she
// leans in, her near arm bends over the rim and dips below the front lip (clipped by the pot's
// wall), and she straightens holding one leaf up to the crowd. The draw itself is 450 ms; on a
// live draw the camera then pushes in on the raised leaf (the name is the hero), holds, and
// glides back out.
//
// The s02 predict mount is the strict one. It shows NO chip at all -
// the drawn-name row is absent, the pot never takes the word kudavolai, no committee exists, and
// there is no press control at all.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  alpha, mix, lighten, darken, inkOn, font, chipRow, pill, leader, rr, ellipse, luma, drawVignette,
  drawMotes, drawSpotlight, drawShadow, sparkle,
} from 'simulations/base/kit/SimLook.js';
import { figureFor, solveFigure, paintFigure, figureLook } from 'simulations/base/kit/SimFigure.js';
import { apply as applyCam, pushTo } from 'simulations/base/kit/SimCamera.js';
import { reducedMotion, hash2 } from 'simulations/base/kit/SimAnim.js';
import { DRAPE } from '../shared/SstArt.js';

const TAU = Math.PI * 2;
const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

// -- the set -------------------------------------------------------------------
const WALL_TOP = 196;                        // the court wall's coping
const FLOOR_Y = 300;                         // the wall's foot: the granite floor runs from here down
const VP = { x: 300, y: 120 };               // the floor's vanishing point
const POT_X = 290;                           // the pot's axis, left of centre: the right zone is the s03 output
const RIM_Y = 360, RIM_RX = 92, RIM_RY = 22;
const POT_BASE_Y = 452, POT_BASE_RX = 60;
const ROW_X = 128, ROW_Y = 490;              // the drawn-name row's left anchor, at the pot's foot
const DOOR = { x: 556, w: 74 };              // the lit doorway, right of the court

// Figures are sized by depth: px per metre grows linearly from the horizon down the floor.
const PXM = (y) => 147 * (y - 190) / (472 - 190);

// -- the child who draws (a kit figure, role child, facing the pot) ------------------------
const CHILD = { x: 404, y: 472, h: 176 };
// Key poses of the near hand, in world px: poised over the rim, deep in the pot, held out to show.
// The hands stay below the chin: the near arm starts behind the head in 3/4 and would cross the face.
const K_POISED = { hand: { x: 350, y: 356 }, lean: 8, crouch: 0, gaze: { x: 0.6, y: 0.35 } };
const K_DIP = { hand: { x: 336, y: 380 }, lean: 34, crouch: 0.14, gaze: { x: 0.5, y: 0.6 } };
const K_UP = { hand: { x: 336, y: 344 }, lean: -5, crouch: 0, gaze: { x: 0.7, y: -0.25 } };
const LEAF_W = 66, LEAF_H = 22;
const LEAF_OFF = { x: -40, y: -6, rot: -9 };  // the held leaf's centre from the hand

const DIP_MS = 180, DRAW_MS = 450;            // the draw itself (stub: ~450 ms)
const PUSH_IN = [430, 900], PUSH_OUT = [1650, 2150], RUN_LIVE = 2150;   // the reveal after a live draw
const CAM_Z = 1.42;
const CAM_TO = [318, 236];                    // where the raised leaf sits on screen at full push

// The three variyam slots, in the stub's order and no more.
const SLOTS = [
  { label: 'tank committee', sub: '' },
  { label: 'justice', sub: '' },
  { label: 'taxes', sub: '' },
];
const SLOT_W = 226, SLOT_H = 112, SLOT_Y0 = 84, SLOT_DY = 124;
const SLOT_X = 444;
const slotBox = (i) => ({
  x: SLOT_X, y: SLOT_Y0 + i * SLOT_DY, w: SLOT_W, h: SLOT_H,
  cx: SLOT_X + SLOT_W / 2, cy: SLOT_Y0 + i * SLOT_DY + SLOT_H / 2,
  sx: SLOT_X + SLOT_W / 2, sy: SLOT_Y0 + i * SLOT_DY + SLOT_H - 37,
});

// The six names a village could have written. Drawn without a repeat until the pool is empty.
const POOL = ['Kumaran', 'Siva', 'Nila', 'Devi', 'Ravi', 'Malar'];
const ROW_MAX = 3;

const S_POT = 0, S_PRESS = 1, S_STACK = 2, S_WHERE = 3, S_PARTS = 4, S_VIEW = 5, S_JOBS = 6;

// The count IS the mount: 0 is the s02 predict setup, 4 is blk-l06-s01, 3 is blk-l06-s03.
const MAP_SETUP = [[{ idx: S_POT, dwellMs: null }]];
const MAP_S01 = [[{ idx: S_PRESS, dwellMs: null }], [{ idx: S_WHERE, dwellMs: null }]];
const MAP_S03 = [
  [{ idx: S_PARTS, dwellMs: null }], [{ idx: S_VIEW, dwellMs: null }], [{ idx: S_JOBS, dwellMs: null }],
];

const CHIP_PRESS = 'press the hand';
const CHIP_RIM = 'kudavolai';
const CHIP_VARIYAMS = 'variyams';
const TAG_LEAVES = 'leaves';
const TAG_GATHERING = 'gathering';
const TAG_HAND = "child's hand";
const TAG_VIEW = 'full view';
const SRC_A = 'Uttaramerur inscription, 10th century';
const SRC_B = 'Vaiku\u1E47\u1E6Dha Perumal Temple, Tamil Nadu';

// The four part tags, in the stub's order, lighting in turn inside s03 beat 0.
// tx/ty null = the live hand; 'crowd' tags point at a drawn head.
const PART_TAGS = [
  { text: TAG_VIEW, x: 214, y: 44, at: 0.35, head: 1 },
  { text: TAG_HAND, x: 540, y: 200, at: 0.75, hand: true },
  { text: TAG_LEAVES, x: 104, y: 330, tx: 262, ty: 362, at: 1.2 },
  { text: TAG_GATHERING, x: 556, y: 44, at: 1.65, head: 8 },
];
const RIM_AT = 2.3;                         // the pot takes its word this many seconds into s03 beat 0

// -- the crowd ring ------------------------------------------------------------
// Ten villagers on the back arc of a deep ellipse round the pot - small and far at the wall,
// big and near at the sides - one close on the pot's left and one behind the child on the
// right: the ring reads as people standing all round it, close enough to touch it, and nobody
// stands on the pot's foot, its drawn-name row or between the child and the crowd's view.
const ROLES = ['adult', 'elder', 'adult', 'farmer', 'adult', 'shopkeeper', 'adult', 'elder', 'farmer', 'adult'];
const RING = { x: POT_X, y: 446, rx: 262, ry: 132 };
function crowdRing() {
  const out = [];
  for (let k = 0; k < 10; k++) {
    const th = Math.PI * (1.06 + k * 0.098);
    const x = RING.x + RING.rx * Math.cos(th) + (hash2(k, 3) - 0.5) * 12;
    const y = RING.y + RING.ry * Math.sin(th);
    const front = Math.abs(x - POT_X) < 70;
    out.push({ x, y, h: 1.7 * PXM(y) * (0.94 + hash2(k, 5) * 0.1), role: ROLES[k], i: k, pose: !front && k % 3 === 1 ? 'relax' : 'stand' });
  }
  out.push({ x: 132, y: 462, h: 1.7 * PXM(462), role: 'adult', i: 14, pose: 'relax' });
  out.push({ x: 506, y: 436, h: 1.62 * PXM(436), role: 'elder', i: 11, pose: 'stand' });
  return out;
}
const CROWD = crowdRing();

// Sixteen leaves heaped in the mouth, fixed so the heap never re-shuffles on a re-draw.
const HEAP = (() => {
  const out = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + i * 0.7;
    const r0 = 6 + (i % 4) * 10;
    out.push({
      x: POT_X + r0 * Math.cos(a) * 1.9,
      y: RIM_Y - 2 + r0 * Math.sin(a) * 0.36,
      rot: (i * 37) % 70 - 35,
      tone: hash2(i, 9),
    });
  }
  return out.sort((a, b) => a.y - b.y);
})();

const inOut = (t) => { const u = Math.max(0, Math.min(1, t)); return 0.5 - 0.5 * Math.cos(Math.PI * u); };
const lerpK = (a, b, u) => ({
  hand: { x: a.hand.x + (b.hand.x - a.hand.x) * u, y: a.hand.y + (b.hand.y - a.hand.y) * u },
  lean: a.lean + (b.lean - a.lean) * u, crouch: a.crouch + (b.crouch - a.crouch) * u,
  gaze: { x: a.gaze.x + (b.gaze.x - a.gaze.x) * u, y: a.gaze.y + (b.gaze.y - a.gaze.y) * u },
});

export class KudavolaiScene extends SimScene {
  static BEAT_STEP_MAP = MAP_SETUP;   // the host sends a huge beat count on a predict setup: this map holds it
  static BEAT_MAPS = { 0: MAP_SETUP, 2: MAP_S01, 3: MAP_S03 };
  static CONTROLS_IN_SIGHT = true;
  static VISUAL_PROFILE = 'rich';
  static CONTINUOUS = true;   // rich: lamp flames, dust in the sun shafts, villagers blinking
  static IRIS = false;
  static ARIA_LABEL =
    'A wide terracotta pot stands on the granite floor of a temple court in warm light, a gopuram behind the wall, '
    + 'with a ring of villagers close around it and palm leaves heaped inside its mouth. A small child stands at the '
    + 'pot\'s side. Pressing the hand makes the child lean in, reach below the rim and straighten holding one leaf up '
    + 'with a name on it, and the drawn names stack in a row at the foot of the pot. On one mount the hand comes '
    + 'back empty. On the last mount the pot is also the source of three committee slots to its right, which the '
    + 'drawn names can be dragged onto.';
  static CONTROLS = [{ type: 'button', id: 'press', label: 'Press the hand' }];

  constructor(container, config) {
    super(container, config);
    this._run = null;                       // { t, dur, stage, refused, name, from }
    this._drawn = [];                       // names out of the pot, oldest first
    this._pool = [...POOL];
    this._slots = [null, null, null];       // a name per variyam slot, or null
    this._drag = null;                      // { name, x, y } while a row chip is held
    this._press = { x: 0, y: 0 };           // the last pointer position: pointerUp() gets no point
    this._sel = null;                       // a row chip tapped once: tap-tap placement
    this._heldName = null;                  // the name on the leaf the child is holding up at rest
    this._place = null;                     // { name, from, to, t, dur, stage }
    this._rowBoxes = [];                    // last measured row chips, for the pointer
    this._handAt = { ...K_POISED.hand };    // the near hand as last drawn (world px, before the shift)
    this._heads = [];
  }

  // -- mount -------------------------------------------------------------------
  get _setup() { return this.stage === S_POT; }          // the s02 predict mount: press refused, no chips
  get _refused() { return this._setup; }
  get _named() { return this.stage >= S_PARTS; }         // the parts are named from s03 on
  get _viewed() { return this.stage >= S_VIEW; }         // the eye-lines land on s03 beat 1
  get _jobs() { return this.stage === S_JOBS; }          // the pot's output, s03 beat 2
  get _rowOn() { return this.stage >= S_PRESS; }         // the row of drawn names, s01 beat 2 on
  get _busyRun() { return !!this._run || !!this._place || !!this._drag; }
  get _free() { return this._drawn.filter((n) => !this._slots.includes(n)); }

  // -- the draw ----------------------------------------------------------------
  _nextName() {
    if (!this._pool.length) this._pool = [...POOL];
    return this._pool.shift();
  }

  _launch() {
    if (this._run || this._place || this._drag) return;
    const refused = this._refused;
    const dur = refused ? DRAW_MS : RUN_LIVE;
    this._run = { t: 0, dur, stage: this.stage, refused, name: refused ? null : this._nextName(), from: this._heldName ? K_UP : K_POISED };
    this._heldName = null;                  // the last leaf is in the row (or simply set down)
    this.animateFor(dur + 240);
  }

  // The child's pose at time t of the run: hand, lean, crouch, gaze, and how deep the hand is.
  _pose() {
    const r = this._run;
    if (!r) return { ...(this._heldName ? K_UP : K_POISED), deep: 0 };
    const t = r.t;
    const to = r.refused ? K_POISED : K_UP;
    if (t < DIP_MS) { const u = inOut(t / DIP_MS); return { ...lerpK(r.from, K_DIP, u), deep: u }; }
    const u = inOut((t - DIP_MS) / (DRAW_MS - DIP_MS));
    return { ...lerpK(K_DIP, to, u), deep: 1 - u };
  }

  // 0..1 how far the camera has pushed in on the raised leaf (live draws only).
  _push() {
    const r = this._run;
    if (!r || r.refused || reducedMotion()) return 0;
    return inOut(seg(r.t, PUSH_IN[0], PUSH_IN[1])) * (1 - inOut(seg(r.t, PUSH_OUT[0], PUSH_OUT[1])));
  }

  _finishDraw() {
    const r = this._run;
    this._run = null;
    if (!r || r.refused || !r.name) return;              // the refused draw leaves nothing behind
    if (!this._drawn.includes(r.name)) this._drawn.push(r.name);
    this._heldName = r.name;                             // the child rests still holding this leaf up
  }

  enter(stage) {
    if (this._run) { this._run.t = this._run.dur; this._finishDraw(); }   // a draw cut short by a beat still lands its name
    this._place = null;
    this._drag = null;
    this._sel = null;
    // _heldName survives too, for the same reason the row does.
    // The drawn row SURVIVES a beat change: s01 beat 3 shows it unchanged, and s03 beat 2
    // places from it. A fresh mount starts empty because the constructor made it empty.
    if (stage !== S_JOBS && this._seeded) {               // Previous from a cold start: these names were not drawn
      this._drawn = []; this._slots = this._slots.map(() => null); this._heldName = null; this._seeded = false;
    }
    if (stage === S_JOBS && !this._drawn.length) {        // a cold start on this beat still has names to place
      this._drawn = ['Kumaran', 'Nila', 'Ravi'];
      this._seeded = true;
      this._pool = POOL.filter((n) => !this._drawn.includes(n));
    }
  }

  update(d) {
    const r = this._run;
    if (r) { r.t += d * 1000; if (r.t >= r.dur) this._finishDraw(); }
    const p = this._place;
    if (p) {
      p.t += d * 1000;
      if (p.t >= p.dur) {
        this._slots[p.at] = p.name;         // the slot index travels with the run, not looked up
        this._place = null;
      }
    }
  }

  busy() { return this._busyRun; }

  // -- controls ----------------------------------------------------------------
  isControlHidden(id) { return id === 'press' && this._setup; }

  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'press') this._launch();
    this.requestUiUpdate?.();
  }

  // -- pointer: tap the hand, drag a drawn name onto a slot --------------------
  pointerDown(p) {
    if (this._run || this._place || this._setup) return false;
    if (this._onHand(p)) { this._launch(); return true; }
    const name = this._hitRow(p);
    if (name) {
      this._drag = { name, x: p.x, y: p.y };
      this._sel = null;
      this._press = { x: p.x, y: p.y };
      this.animateFor(900);
      return true;
    }
    if (this._sel != null) {
      const at = this._slotAt(p);
      if (at >= 0) { this._drop(this._sel, at); this._sel = null; return true; }
      this._sel = null;
    }
    this._press = { x: p.x, y: p.y };
    return false;
  }

  pointerMove(p) {
    this._press = { x: p.x, y: p.y };
    if (!this._drag) return false;
    this._drag.x = p.x; this._drag.y = p.y;
    return true;
  }

  // The kit calls pointerUp() with no point, so the last pointer position is what counts.
  pointerUp() {
    const p = this._press;
    if (!this._drag) return false;
    const { name } = this._drag;
    this._drag = null;
    const at = this._slotAt(p);
    if (at >= 0) { this._drop(name, at); return true; }
    // a tap that never moved selects the chip instead of dragging it (tap-tap placement)
    const home = this._rowBoxOf(name);
    if (Math.hypot(p.x - (home.x + this._shift), p.y - home.y) < 10) {
      this._sel = name;
      this.animateFor(300);
      return true;
    }
    this.animateFor(300);                     // it springs back to the row
    return true;
  }

  _drop(name, at) {
    if (this._slots[at]) return;
    const b = this._rowBoxOf(name);            // row coordinates: inside the shift
    const t = slotBox(at);                     // slot coordinates: outside it
    this._place = {
      name, at,
      from: { x: b.x + this._shift, y: b.y },
      to: { x: t.sx, y: t.sy },
      t: 0, dur: 260, stage: this.stage,
    };
    this.celebrate(t.sx, t.sy, 18);            // the learner placed the name: this press is the find
    this.animateFor(560);
  }

  // -- measurements ------------------------------------------------------------
  // Taps only land at rest, when the camera is home, so screen = world + shift.
  _onHand(p) {
    const w = this._handAt;
    return Math.hypot(p.x - this._shift - w.x, p.y - w.y) < 62;
  }

  _slotAt(p) {
    if (!this._jobs) return -1;
    for (let i = 0; i < SLOTS.length; i++) {
      const b = slotBox(i);
      if (p.x >= b.x - 6 && p.x <= b.x + b.w + 6 && p.y >= b.y - 6 && p.y <= b.y + b.h + 6) return i;
    }
    return -1;
  }

  // The name under the pointer in the row, or null.
  _hitRow(p) {
    if (!this._rowOn || this._place) return null;
    for (const b of this._rowBoxes) {
      if (p.x >= b.x0 && p.x <= b.x0 + b.w && p.y >= b.y0 && p.y <= b.y0 + b.h) return b.name;
    }
    return null;
  }

  _rowBoxOf(name) {
    const b = this._rowBoxes.find((q) => q.name === name) ?? this._rowBoxes[0];
    return b ? { x: b.x - this._shift, y: b.y } : { x: ROW_X, y: ROW_Y };
  }

  // -- draw --------------------------------------------------------------------
  // On the output beat the whole set slides left so the slot column has clean space. The
  // pointer is shifted back the same way, so a tap on the hand still finds the hand.
  get _shift() { return this._jobs ? -118 : 0; }

  draw(ctx, c) {
    const dark = luma(c.bgDeep) < 0.5;
    const t = reducedMotion() ? 0 : this.clock;
    const clay = mix(c.s8, c.s6, 0.28);
    const leafCol = lighten(mix(c.s2, c.s8, 0.25), 0.3);   // dried palm leaf, straw-pale
    const pose = this._pose();
    const push = this._push();

    ctx.save();
    if (push > 0) {
      const lf = { x: pose.hand.x + LEAF_OFF.x + this._shift, y: pose.hand.y + LEAF_OFF.y };
      applyCam(ctx, pushTo({ x: 340, y: 260, z: 1 }, lf.x, lf.y, CAM_Z, push, push, CAM_TO));
    }
    this._sky(ctx, c, dark, t);
    ctx.translate(this._shift, 0);
    this._temple(ctx, c, dark, t);
    this._floor(ctx, c, dark);
    if (this._viewed) this._ringGlow(ctx, c);
    this._heads = [];
    for (const g of [...CROWD].sort((a, b) => a.y - b.y)) this._person(ctx, c, g, t);
    this._pot(ctx, c, clay, leafCol, dark, pose);
    this._child(ctx, c, leafCol, pose, t);
    this._light(ctx, c, dark, t);
    if (this._named && this.stage === S_PARTS && push < 0.02) this._partTags(ctx, c);   // labels never ride the push
    if (this._viewed) this._eyeLines(ctx, c);
    this._row(ctx, c);
    ctx.restore();
    drawVignette(ctx, c, dark ? 0.85 : 0.45);
    if (this._jobs) {
      this._slotColumn(ctx, c, clay);
      this._held(ctx, c);
    }
    if (!this._setup) this._chips(ctx, c);
  }

  // A warm low sky behind the court: the light comes from the upper left.
  _sky(ctx, c, dark) {
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
    g.addColorStop(0, mix(c.bgDeep, c.s5, dark ? 0.2 : 0.1));
    g.addColorStop(0.65, mix(c.bgDeep, c.s8, dark ? 0.3 : 0.24));
    g.addColorStop(1, mix(c.bgDeep, c.gold, dark ? 0.4 : 0.42));
    ctx.fillStyle = g; ctx.fillRect(0, 0, 680, FLOOR_Y + 20);
    const L = ctx.createRadialGradient(60, 40, 10, 60, 40, 420);
    L.addColorStop(0, alpha(lighten(c.gold, 0.5), dark ? 0.32 : 0.5)); L.addColorStop(1, alpha(c.gold, 0));
    ctx.fillStyle = L; ctx.fillRect(0, 0, 680, 520);
  }

  // The court: a gopuram behind the wall (left), a pillared wall with a carved frieze, oil lamps
  // on the pillars, a lit doorway with a toran (right). No figure in it - nothing that could
  // arrange the pot.
  _temple(ctx, c, dark, t) {
    const stone = mix(mix(c.s8, c.waste, 0.62), c.bgDeep, dark ? 0.38 : 0.12);
    const far = mix(stone, mix(c.bgDeep, c.s5, 0.2), dark ? 0.42 : 0.3);
    const lit = mix(far, c.gold, dark ? 0.22 : 0.3);
    // the gopuram: tiers narrowing upward, each with niches, lit on its left faces
    const GX = 168;
    for (let i = 0; i < 7; i++) {
      const w = 230 - i * 27, y = WALL_TOP + 10 - (i + 1) * 24;
      const tg = ctx.createLinearGradient(GX - w / 2, 0, GX + w / 2, 0);
      tg.addColorStop(0, lit); tg.addColorStop(0.45, far); tg.addColorStop(1, darken(far, 0.22));
      ctx.fillStyle = tg; ctx.fillRect(GX - w / 2, y, w, 25);
      ctx.fillStyle = alpha(lighten(lit, 0.25), 0.7); ctx.fillRect(GX - w / 2 - 3, y, w + 6, 3);
      ctx.fillStyle = alpha(darken(far, 0.5), 0.55);
      const n = Math.max(2, Math.round(w / 34));
      for (let k = 0; k < n; k++) {
        const nx = GX - w / 2 + (k + 0.5) * (w / n);
        ctx.beginPath(); rr(ctx, nx - 4.5, y + 7, 9, 14, 4); ctx.fill();
      }
    }
    const topY = WALL_TOP + 10 - 7 * 24;
    ctx.fillStyle = mix(lit, far, 0.4);
    ctx.beginPath(); ctx.ellipse(GX, topY, 46, 18, 0, Math.PI, TAU); ctx.fill();
    for (let k = -2; k <= 2; k++) {               // the kalasam finials catch the light
      const fx = GX + k * 16;
      ctx.fillStyle = mix(c.gold, far, 0.25);
      ctx.beginPath(); ctx.ellipse(fx, topY - 20, 4, 5, 0, 0, TAU); ctx.fill();
      ctx.fillRect(fx - 1, topY - 30, 2, 8);
      ctx.fillStyle = alpha(lighten(c.gold, 0.6), 0.8);
      ctx.beginPath(); ctx.arc(fx - 1.4, topY - 21.5, 1.4, 0, TAU); ctx.fill();
    }
    // the court wall
    const wg = ctx.createLinearGradient(0, WALL_TOP, 0, FLOOR_Y);
    wg.addColorStop(0, lighten(stone, 0.14)); wg.addColorStop(1, darken(stone, 0.2));
    ctx.fillStyle = wg; ctx.fillRect(-60, WALL_TOP, 960, FLOOR_Y - WALL_TOP);
    ctx.fillStyle = lighten(stone, 0.28); ctx.fillRect(-60, WALL_TOP, 960, 6);
    ctx.fillStyle = alpha(darken(stone, 0.4), 0.5); ctx.fillRect(-60, WALL_TOP + 6, 960, 3);
    // a carved frieze band: a row of small lotus bosses
    for (let x = -50; x < 900; x += 22) {
      ctx.fillStyle = alpha(darken(stone, 0.3), 0.55);
      ctx.beginPath(); ctx.arc(x, WALL_TOP + 18, 5, 0, TAU); ctx.fill();
      ctx.fillStyle = alpha(lighten(stone, 0.3), 0.55);
      ctx.beginPath(); ctx.arc(x - 1.5, WALL_TOP + 16.5, 2.2, 0, TAU); ctx.fill();
    }
    // the doorway, lit from inside
    const dTop = WALL_TOP + 34;
    ctx.fillStyle = darken(c.bgDeep, dark ? 0.35 : 0.65);
    ctx.beginPath(); rr(ctx, DOOR.x - DOOR.w / 2, dTop, DOOR.w, FLOOR_Y - dTop, 4); ctx.fill();
    const dg = ctx.createRadialGradient(DOOR.x, FLOOR_Y - 26, 2, DOOR.x, FLOOR_Y - 26, 60);
    dg.addColorStop(0, alpha(lighten(c.flame, 0.3), dark ? 0.7 : 0.55)); dg.addColorStop(1, alpha(c.flame, 0));
    ctx.save(); ctx.beginPath(); rr(ctx, DOOR.x - DOOR.w / 2, dTop, DOOR.w, FLOOR_Y - dTop, 4); ctx.clip();
    ctx.fillStyle = dg; ctx.fillRect(DOOR.x - 60, dTop, 120, FLOOR_Y - dTop);
    ctx.restore();
    this._flame(ctx, c, DOOR.x, FLOOR_Y - 26, 4.5, t, 0.3);
    ctx.fillStyle = mix(c.gold, stone, 0.45);
    ctx.fillRect(DOOR.x - DOOR.w / 2 - 9, dTop - 9, DOOR.w + 18, 9);
    // a toran of mango leaves strung over the door
    for (let k = 0; k < 9; k++) {
      const lx = DOOR.x - DOOR.w / 2 - 4 + k * ((DOOR.w + 8) / 8);
      const sag = Math.sin((k / 8) * Math.PI) * 6;
      ctx.fillStyle = k % 2 ? mix(c.s3, c.bgDeep, 0.25) : mix(c.s3, c.gold, 0.2);
      ctx.beginPath();
      ctx.moveTo(lx - 3, dTop - 1 + sag); ctx.quadraticCurveTo(lx, dTop + 16 + sag, lx + 3, dTop - 1 + sag); ctx.fill();
    }
    // pillars, each with an oil lamp on a bracket
    let pi = 0;
    for (let x = -24; x < 900; x += 72, pi++) {
      if (Math.abs(x - DOOR.x) < 60) continue;
      const pg = ctx.createLinearGradient(x - 11, 0, x + 11, 0);
      pg.addColorStop(0, lighten(stone, 0.26)); pg.addColorStop(1, darken(stone, 0.32));
      ctx.fillStyle = pg; ctx.fillRect(x - 11, WALL_TOP + 26, 22, FLOOR_Y - WALL_TOP - 26);
      ctx.fillStyle = lighten(stone, 0.32); ctx.fillRect(x - 14, WALL_TOP + 26, 28, 5);
      ctx.fillStyle = darken(stone, 0.18); ctx.fillRect(x - 14, FLOOR_Y - 6, 28, 6);
      if (pi % 2 === 0) {
        const ly = WALL_TOP + 62;
        const lg = ctx.createRadialGradient(x, ly - 6, 1, x, ly - 6, 46);
        lg.addColorStop(0, alpha(lighten(c.flame, 0.35), dark ? 0.45 : 0.3)); lg.addColorStop(1, alpha(c.flame, 0));
        ctx.fillStyle = lg; ctx.fillRect(x - 46, ly - 52, 92, 92);
        ctx.fillStyle = mix(c.gold, c.s8, 0.35);
        ctx.beginPath(); ctx.ellipse(x, ly, 7, 3, 0, 0, Math.PI); ctx.fill();
        ctx.fillRect(x - 1, ly, 2, 8);
        this._flame(ctx, c, x, ly - 1, 3.4, t, pi * 0.37);
      }
    }
    // the step at the wall's foot
    ctx.fillStyle = lighten(stone, 0.12); ctx.fillRect(-60, FLOOR_Y, 960, 8);
    ctx.fillStyle = alpha(lighten(stone, 0.45), 0.5); ctx.fillRect(-60, FLOOR_Y, 960, 2);
  }

  _flame(ctx, c, x, y, s, t, ph) {
    const f = 1 + 0.14 * Math.sin(t * 9 + ph * 7) + 0.08 * Math.sin(t * 15.3 + ph * 3);
    const sway = 0.8 * Math.sin(t * 5.2 + ph * 11);
    ctx.fillStyle = alpha(c.flame, 0.95);
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s, y - s * 1.6 * f, x + sway, y - s * 3 * f);
    ctx.quadraticCurveTo(x + s, y - s * 1.6 * f, x + s, y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = lighten(c.gold, 0.55);
    ctx.beginPath(); ctx.ellipse(x + sway * 0.4, y - s * 0.9, s * 0.45, s * 0.9 * f, 0, 0, TAU); ctx.fill();
  }

  // Granite floor slabs in perspective, a kolam drawn round the pot, a warm pool of light.
  _floor(ctx, c, dark) {
    const stone = mix(mix(c.waste, c.s8, 0.3), c.bgDeep, dark ? 0.32 : 0.04);
    const g = ctx.createLinearGradient(0, FLOOR_Y + 8, 0, 520);
    g.addColorStop(0, darken(stone, 0.16)); g.addColorStop(1, lighten(stone, 0.05));
    ctx.fillStyle = g; ctx.fillRect(-60, FLOOR_Y + 8, 960, 560);
    ctx.save();
    ctx.beginPath(); ctx.rect(-60, FLOOR_Y + 8, 960, 560); ctx.clip();
    ctx.strokeStyle = alpha(darken(stone, 0.5), 0.45); ctx.lineWidth = 1.2;
    for (let i = -12; i <= 16; i++) {
      const bx = VP.x + i * 70;
      ctx.beginPath(); ctx.moveTo(VP.x + (bx - VP.x) * ((FLOOR_Y + 8 - VP.y) / (560 - VP.y)), FLOOR_Y + 8); ctx.lineTo(bx, 560); ctx.stroke();
    }
    let y = FLOOR_Y + 8, gap = 14;
    while (y < 540) { y += gap; gap *= 1.32; ctx.beginPath(); ctx.moveTo(-60, y); ctx.lineTo(900, y); ctx.stroke(); }
    // stone grain
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = alpha(i % 3 ? darken(stone, 0.3) : lighten(stone, 0.3), 0.22);
      ctx.fillRect(hash2(i, 21) * 680, FLOOR_Y + 12 + hash2(i, 22) * 210, 1.6, 1.4);
    }
    ctx.restore();
    drawSpotlight(ctx, c, POT_X + 30, POT_BASE_Y - 10, 300, dark ? 2.2 : 1.6);
    // the kolam: a dotted ring and a running loop line round it, chalk on granite
    const chalk = alpha(lighten(stone, dark ? 0.55 : 0.8), dark ? 0.42 : 0.7);
    ctx.fillStyle = chalk; ctx.strokeStyle = chalk; ctx.lineWidth = 1.5;
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * TAU;
      ctx.beginPath(); ctx.arc(POT_X + 150 * Math.cos(a), POT_BASE_Y + 2 + 34 * Math.sin(a), 1.7, 0, TAU); ctx.fill();
    }
  }

  // A villager in the ring: a kit figure, turned toward the pot, lit warm from the left.
  _person(ctx, c, g, t) {
    const facing = Math.abs(g.x - POT_X) < 40 ? 0 : g.x < POT_X ? 1 : -1;
    const spec = figureFor(this, { role: g.role, pose: g.pose, x: g.x, y: g.y, facing, height: g.h, i: g.i, look: DRAPE });
    const look = { t, mood: this._viewed ? 'happy' : 'smile' };
    if (facing === 0) look.look = { x: Math.sign(POT_X - g.x) * 0.3, y: 0.3 };
    const sk = solveFigure(spec);
    const L = figureLook(c, { ...spec.look, ...look });
    paintFigure(ctx, c, sk, L);
    this._heads.push({ g, ...sk.anchors.head });
  }

  _ringGlow(ctx, c) {
    const k = this.stage > S_VIEW ? 1 : Math.min(1, this.age / 0.45);
    const g = ctx.createRadialGradient(POT_X, RING.y, 160, POT_X, RING.y, 320);
    g.addColorStop(0, alpha(c.gold, 0)); g.addColorStop(0.6, alpha(c.gold, 0.22 * k)); g.addColorStop(1, alpha(c.gold, 0));
    ctx.save(); ctx.translate(0, RING.y); ctx.scale(1, 0.48); ctx.translate(0, -RING.y);
    ctx.fillStyle = g; ctx.fillRect(-60, 0, 800, 800);
    ctx.restore();
    ctx.strokeStyle = alpha(c.gold, 0.5 * k); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(RING.x, RING.y, RING.rx, RING.ry, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
  }

  // The pot's front wall below the rim: the part of the pot nearer the viewer than its mouth.
  _wallPath(ctx) {
    ctx.moveTo(POT_X - RIM_RX, RIM_Y);
    ctx.ellipse(POT_X, RIM_Y, RIM_RX, RIM_RY, 0, Math.PI, 0, true);
    ctx.bezierCurveTo(POT_X + RIM_RX + 26, RIM_Y + 40, POT_X + POT_BASE_RX + 14, POT_BASE_Y - 26, POT_X + POT_BASE_RX, POT_BASE_Y);
    ctx.quadraticCurveTo(POT_X, POT_BASE_Y + 12, POT_X - POT_BASE_RX, POT_BASE_Y);
    ctx.bezierCurveTo(POT_X - POT_BASE_RX - 14, POT_BASE_Y - 26, POT_X - RIM_RX - 26, RIM_Y + 40, POT_X - RIM_RX, RIM_Y);
    ctx.closePath();
  }

  _pot(ctx, c, clay, leafCol, dark, pose) {
    drawShadow(ctx, c, POT_X + 26, POT_BASE_Y + 2, 120, 16, dark ? 1.4 : 1);
    const clayDark = darken(clay, 0.5), clayLight = lighten(clay, 0.32);
    // body, lit from the upper left, with warm floor bounce on the right
    const g = ctx.createRadialGradient(POT_X - 46, RIM_Y + 26, 8, POT_X + 10, RIM_Y + 56, 170);
    g.addColorStop(0, clayLight); g.addColorStop(0.5, clay); g.addColorStop(1, clayDark);
    ctx.fillStyle = g; ctx.beginPath(); this._wallPath(ctx); ctx.fill();
    ctx.save(); ctx.beginPath(); this._wallPath(ctx); ctx.clip();
    const bounce = ctx.createRadialGradient(POT_X + 70, POT_BASE_Y + 10, 4, POT_X + 70, POT_BASE_Y + 10, 80);
    bounce.addColorStop(0, alpha(c.gold, 0.25)); bounce.addColorStop(1, alpha(c.gold, 0));
    ctx.fillStyle = bounce; ctx.fillRect(POT_X - 130, RIM_Y, 260, 110);
    // an incised band of chevrons and dots round the shoulder
    ctx.strokeStyle = alpha(clayDark, 0.6); ctx.lineWidth = 2;
    for (const dy of [22, 40]) {
      ctx.beginPath(); ctx.ellipse(POT_X, RIM_Y + dy, RIM_RX + 18, RIM_RY + 8, 0, 0.05, Math.PI - 0.05); ctx.stroke();
    }
    ctx.beginPath();
    for (let a = 0.1; a < Math.PI - 0.1; a += 0.08) {
      const x = POT_X + Math.cos(a) * (RIM_RX + 18), y = RIM_Y + 31 + Math.sin(a) * (RIM_RY + 8);
      ctx.lineTo(x, y + (Math.round(a / 0.08) % 2 ? -5 : 5));
    }
    ctx.stroke();
    ctx.fillStyle = alpha(clayLight, 0.5);
    for (let a = 0.2; a < Math.PI - 0.2; a += 0.16) {
      ctx.beginPath(); ctx.arc(POT_X + Math.cos(a) * (RIM_RX + 16), RIM_Y + 50 + Math.sin(a) * (RIM_RY + 9), 1.6, 0, TAU); ctx.fill();
    }
    for (let i = 0; i < 90; i++) {                // fine clay speckle
      ctx.fillStyle = alpha(i % 2 ? clayLight : clayDark, 0.25);
      ctx.fillRect(POT_X - 120 + hash2(i, 1) * 240, RIM_Y + 4 + hash2(i, 2) * 96, 1.6, 1.6);
    }
    // a soft specular streak on the lit side
    ctx.strokeStyle = alpha(lighten(clay, 0.6), 0.22); ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(POT_X - 62, RIM_Y + 30); ctx.quadraticCurveTo(POT_X - 70, RIM_Y + 54, POT_X - 52, RIM_Y + 74); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.restore();
    // the mouth, then the heap of palm leaves inside it
    ctx.beginPath(); ellipse(ctx, POT_X, RIM_Y, RIM_RX, RIM_RY); ctx.fillStyle = darken(clay, 0.72); ctx.fill();
    const deep = this._run && !this._run.refused ? pose.deep : 0;
    ctx.save();
    ctx.beginPath(); ellipse(ctx, POT_X, RIM_Y, RIM_RX - 6, RIM_RY - 4); ctx.clip();
    const ig = ctx.createLinearGradient(0, RIM_Y - RIM_RY, 0, RIM_Y + RIM_RY);
    ig.addColorStop(0, darken(clay, 0.25)); ig.addColorStop(1, darken(clay, 0.8));
    ctx.fillStyle = ig; ctx.fillRect(POT_X - RIM_RX, RIM_Y - RIM_RY, 2 * RIM_RX, 2 * RIM_RY);
    for (const lf of HEAP) {
      const near = Math.max(0, 1 - Math.abs(lf.x - pose.hand.x) / 70);
      const col = mix(leafCol, darken(leafCol, 0.35), lf.tone * 0.8);
      this._leaf(ctx, c, lf.x, lf.y + deep * 6 * near, lf.rot + deep * 22 * near, col, false, null, 0.82);
    }
    const shade = ctx.createLinearGradient(0, RIM_Y - RIM_RY, 0, RIM_Y);
    shade.addColorStop(0, alpha(darken(clay, 0.85), 0.55)); shade.addColorStop(1, alpha(darken(clay, 0.85), 0));
    ctx.fillStyle = shade; ctx.fillRect(POT_X - RIM_RX, RIM_Y - RIM_RY, 2 * RIM_RX, RIM_RY);
    ctx.restore();
    // the rim: a thick rolled lip, lit on the far side; it pulses once as the hand crosses it
    const r = this._run;
    const pulse = r && !r.refused ? Math.max(0, 1 - Math.abs(r.t - DIP_MS * 0.6) / 120) : 0;
    ctx.strokeStyle = mix(clay, c.gold, 0.35 * pulse); ctx.lineWidth = 9;
    ctx.beginPath(); ellipse(ctx, POT_X, RIM_Y, RIM_RX, RIM_RY); ctx.stroke();
    ctx.strokeStyle = alpha(lighten(clay, 0.55), 0.85); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(POT_X, RIM_Y - 2, RIM_RX, RIM_RY, 0, Math.PI * 1.02, Math.PI * 1.75); ctx.stroke();
    ctx.strokeStyle = alpha(clayDark, 0.7); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(POT_X, RIM_Y + 4, RIM_RX + 2, RIM_RY + 2, 0, 0.1, Math.PI - 0.1); ctx.stroke();
    if (this._named && this._rimWord()) {
      const plate = mix(clay, c.raised, 0.45);
      pill(ctx, c, CHIP_RIM, POT_X - 8, RIM_Y + 54, { bg: plate, ink: inkOn(c, plate), size: 30, display: true });
    }
  }

  _rimWord() { return this.stage > S_PARTS || this.age >= RIM_AT; }

  // A palm leaf: a long pale strip with ribs and a binding hole, as manuscripts were written on.
  _leaf(ctx, c, x, y, rot, col, named, name, k = 1, px = 0) {
    const lw = LEAF_W * k, lh = LEAF_H * k * (named ? 0.78 : 0.5);
    ctx.save();
    ctx.translate(x, y); ctx.rotate((rot * Math.PI) / 180);
    const g = ctx.createLinearGradient(0, -lh / 2, 0, lh / 2);
    g.addColorStop(0, lighten(col, 0.35)); g.addColorStop(1, darken(col, 0.18));
    ctx.fillStyle = g;
    ctx.beginPath(); rr(ctx, -lw / 2, -lh / 2, lw, lh, lh / 2); ctx.fill();
    ctx.strokeStyle = alpha(darken(col, 0.45), 0.4); ctx.lineWidth = 0.8;
    for (const f of [-0.28, 0.28]) { ctx.beginPath(); ctx.moveTo(-lw / 2 + 4, f * lh); ctx.lineTo(lw / 2 - 4, f * lh); ctx.stroke(); }
    ctx.fillStyle = alpha(darken(col, 0.55), 0.85);
    ctx.beginPath(); ctx.arc(-lw / 2 + 7 * k, 0, 1.6 * k, 0, TAU); ctx.fill();
    if (named) {
      ctx.fillStyle = darken(col, 0.8);
      ctx.font = font(c, 800, px || Math.max(14, 11 * k), true);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(name, 4 * k, 1);
    }
    ctx.restore();
  }

  // The child: a kit figure at the pot's right side. Back and body first; then the leaf she holds;
  // then the near arm, which is hidden by the pot's front wall wherever it is inside the mouth.
  _child(ctx, c, leafCol, pose, t) {
    const r = this._run;
    const mood = r && r.t < DRAW_MS && !r.refused ? (r.t < DIP_MS + 60 ? 'effort' : 'happy') : this._heldName ? 'happy' : 'smile';
    const spec = figureFor(this, {
      role: 'child', pose: { name: 'stand', lean: pose.lean, crouch: pose.crouch }, x: CHILD.x, y: CHILD.y,
      height: CHILD.h, facing: -1, i: 6, hands: [pose.hand, null], autoReach: false, look: DRAPE,
    });
    const sk = solveFigure(spec);
    const L = figureLook(c, { ...spec.look, top: c.s4, hairStyle: 'long', hair: 0, t, mood, look: pose.gaze });
    paintFigure(ctx, c, sk, L, { layer: 'back' });
    paintFigure(ctx, c, sk, L, { layer: 'mid' });
    const hand = sk.anchors.hand[0];
    this._handAt = { x: hand.x, y: hand.y };
    const name = r ? (r.refused ? null : r.t > 300 ? r.name : null) : this._heldName;
    if (name) this._heldLeaf(ctx, c, leafCol, hand, name, r ? seg(r.t, 300, DRAW_MS) : 1, r ? r.t : null);
    // the near arm: in front of everything, except below the front lip inside the mouth
    const lim = POT_X + RIM_RX * 0.72;
    ctx.save();
    ctx.beginPath(); ctx.rect(-100, -100, 900, 800); this._wallPath(ctx); ctx.clip('evenodd');
    paintFigure(ctx, c, sk, L, { layer: 'front' });
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(lim, -100, 900, 800); ctx.clip();
    paintFigure(ctx, c, sk, L, { layer: 'front' });
    ctx.restore();
  }

  // The drawn leaf, pinched at one end and held up flat: the hero. A warm glow rises behind it
  // as it comes out and stays, smaller, while the child holds it.
  _heldLeaf(ctx, c, leafCol, hand, name, k, rt) {
    // The name stays at 12 px on screen at any width; the leaf grows to hold it, still pinched at its end.
    const shown = this._canvas?.getBoundingClientRect?.().width;
    const px = Math.max(14.5, 12 * (shown ? 680 / shown : 1));
    const size = Math.max(1.32, px / 12.7);
    const x = hand.x + 3 - (LEAF_W * size) / 2, y = hand.y + LEAF_OFF.y;
    const reveal = rt == null ? 0 : seg(rt, DRAW_MS - 60, PUSH_IN[1]) * (1 - seg(rt, PUSH_OUT[0], PUSH_OUT[1]));
    const glow = 0.4 + 0.6 * reveal;
    const gr = 70 + 40 * reveal;
    const g = ctx.createRadialGradient(x, y, 4, x, y, gr);
    g.addColorStop(0, alpha(lighten(c.gold, 0.5), 0.5 * glow * k)); g.addColorStop(1, alpha(c.gold, 0));
    ctx.fillStyle = g; ctx.fillRect(x - gr, y - gr, gr * 2, gr * 2);
    if (reveal > 0.02) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(this.clock * 0.25);
      ctx.fillStyle = alpha(lighten(c.gold, 0.4), 0.16 * reveal);
      for (let i = 0; i < 10; i++) {
        ctx.rotate(TAU / 10);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(gr * 1.1, -6); ctx.lineTo(gr * 1.1, 6); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7 + this.clock * 0.9;
        sparkle(ctx, x + Math.cos(a) * 58, y + Math.sin(a) * 26, 4 + 3 * reveal, alpha(lighten(c.gold, 0.6), 0.8 * reveal));
      }
    }
    ctx.save();
    ctx.shadowColor = alpha(darken(c.bgDeep, 0.6), 0.45); ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    this._leaf(ctx, c, x, y, LEAF_OFF.rot, leafCol, true, name, size * (0.6 + 0.4 * k), px * (0.6 + 0.4 * k));
    ctx.restore();
  }

  // Sun shafts from the upper left, with dust turning in them; lit, so they sit over the people.
  _light(ctx, c, dark, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const beams = [[30, 74, 190, 300], [112, 140, 330, 392], [176, 222, 430, 520]];
    beams.forEach(([a0, a1, b0, b1], i) => {
      const k = (dark ? 0.75 : 1) * (0.8 + 0.2 * Math.sin(t * 0.5 + i * 2.1));
      const g = ctx.createLinearGradient(0, 0, 0, 520);
      g.addColorStop(0, alpha(lighten(c.gold, 0.4), 0.26 * k));
      g.addColorStop(1, alpha(c.gold, 0.02));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(a0, -10); ctx.lineTo(a1, -10); ctx.lineTo(b1, 520); ctx.lineTo(b0, 520); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
    drawMotes(ctx, c, t, { x: 90, y: 60, w: 300, h: 360 }, { n: 26, seed: 17 });
  }

  _partTags(ctx, c) {
    for (const tg of PART_TAGS) {
      const lit = this.stage > S_PARTS || this.age >= tg.at;
      if (!lit) continue;
      let tx = tg.tx, ty = tg.ty;
      if (tg.hand) { tx = this._handAt.x; ty = this._handAt.y; }
      if (tg.head != null) { const h = this._heads.find((q) => q.g.i === tg.head); if (h) { tx = h.x; ty = h.y - h.r; } }
      const b = pill(ctx, c, tg.text, tg.x, tg.y, { bg: c.accent, size: 28, alpha: 0.96 });
      const from = ty > b.y0 + b.h ? { x: b.x0 + b.w / 2, y: b.y0 + b.h } : { x: b.x0 + b.w / 2, y: b.y0 };
      leader(ctx, from.x + this._shift, from.y, tx + this._shift, ty, alpha(c.label, 0.75), 0.85, this.clock);
    }
  }

  _eyeLines(ctx, c) {
    const k = this.stage > S_VIEW ? 1 : Math.min(1, this.age / 0.45);
    if (k <= 0) return;
    const w = this._handAt;
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.lineDashOffset = -this.clock * 22;
    ctx.strokeStyle = alpha(lighten(c.gold, 0.2), 0.9 * k);
    ctx.lineWidth = 2.2;
    const picks = this._heads.filter((h) => [1, 5, 9].includes(h.g.i));
    for (const h of picks) {
      const ex = h.x + Math.sign(w.x - h.x) * h.r * 0.5;
      ctx.beginPath(); ctx.moveTo(ex, h.y); ctx.lineTo(w.x, w.y); ctx.stroke();
      ctx.fillStyle = alpha(lighten(c.gold, 0.3), 0.9 * k);
      ctx.beginPath(); ctx.arc(ex, h.y, 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  _slotColumn(ctx, c, clay) {
    pill(ctx, c, CHIP_VARIYAMS, SLOT_X + SLOT_W / 2, 40, { bg: c.gold, size: 30, display: true });
    SLOTS.forEach((s, i) => {
      const b = slotBox(i);
      ctx.save();
      ctx.shadowColor = alpha(darken(c.bgDeep, 0.6), 0.4); ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
      rr(ctx, b.x, b.y, b.w, b.h, 10);
      ctx.fillStyle = mix(c.raised, c.bgSurface, 0.35); ctx.fill();
      ctx.restore();
      rr(ctx, b.x, b.y, b.w, b.h, 10);
      ctx.strokeStyle = alpha(mix(c.stroke, c.gold, 0.3), 0.7); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = c.labelMuted;
      ctx.font = font(c, 800, 28);                 // the job, above its own socket
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(s.label, b.cx, b.y + 8);
      if (s.sub) {
        ctx.fillStyle = alpha(c.labelMuted, 0.85);
        ctx.font = font(c, 600, 28);
        ctx.fillText(s.sub, b.cx, b.y + 25);
      }
      const name = this._slots[i];
      const sy = b.y + 50, sh = 50;
      if (name) {
        rr(ctx, b.x + 13, sy, b.w - 26, sh, 6);
        ctx.fillStyle = mix(clay, c.raised, 0.5); ctx.fill();
        ctx.fillStyle = inkOn(c, mix(clay, c.raised, 0.5));
        ctx.font = font(c, 800, 28);
        ctx.textBaseline = 'middle';
        ctx.fillText(name, b.cx, sy + sh / 2);
      } else {
        ctx.setLineDash([5, 5]);                     // an empty socket: nothing can land here
        ctx.strokeStyle = alpha(c.labelMuted, 0.8); ctx.lineWidth = 1.6;
        rr(ctx, b.x + 13, sy, b.w - 26, sh, 6); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  // The chip the learner is holding, or the one travelling into a slot.
  _held(ctx, c) {
    let at = null;
    if (this._drag) at = { x: this._drag.x, y: this._drag.y, name: this._drag.name };
    else if (this._place) {
      const p = this._place;
      const u = Math.min(1, p.t / p.dur);
      const e = u * u * (3 - 2 * u);
      at = { x: p.from.x + (p.to.x - p.from.x) * e, y: p.from.y + (p.to.y - p.from.y) * e, name: p.name };
    }
    if (!at) return;
    pill(ctx, c, at.name, at.x, at.y, { bg: c.accent, ink: inkOn(c, c.accent), size: 28 });
  }

  // The record of draws at the pot's foot: a row, not a score and not a ranking.
  // A chip being dragged or placed is not drawn here; it is drawn in the pass below.
  _row(ctx, c) {
    this._rowBoxes = [];
    // A name placed in a slot has left the row; the row keeps the names still free to place.
    const shown = this._free.slice(-ROW_MAX);
    if (!this._rowOn || !shown.length) return;
    const held = this._drag ? this._drag.name : this._place ? this._place.name : null;
    const items = shown.map((n) => ({
      text: n,
      bg: this._sel === n ? c.accent : c.raised,
      ink: this._sel === n ? inkOn(c, c.accent) : c.label,
      size: 26,
      alpha: n === held ? 0.25 : 1,
    }));
    // left-anchored, not centred: a chip must not move when another one is placed.
    const boxes = chipRow(ctx, c, items, ROW_X, ROW_Y, { align: 'left', gap: 8 });
    this._rowBoxes = boxes.map((b, i) => ({
      name: shown[i], x0: b.x0 + this._shift, y0: b.y0,
      x: b.x0 + this._shift + b.w / 2, y: b.y0 + b.h / 2, w: b.w, h: b.h,
    }));
  }

  _chips(ctx, c) {
            if (this.stage === S_WHERE) {
      // two plain name tags, stacked: on one row they run off both edges of the canvas
      chipRow(ctx, c, [{ text: SRC_A, bg: c.raised, ink: c.label }, { text: SRC_B, bg: c.raised, ink: c.label }],
        340, 44, { align: 'center', size: 26, gap: 6, lineGap: 8, wrapAt: 640 });
    }
    if (this.stage === S_PRESS && !this._run) {
      // the hint, lit and pulsing, on the pot under the hand it names
      const k = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(this.clock * 3.4));
      pill(ctx, c, CHIP_PRESS, POT_X - 8, RIM_Y + 54, { bg: c.good, size: 28, alpha: k });
    }
  }
}
