// AshramaWheelScene.js - two wheels, and a marker that walks a ring.
//
// One mount: blk-l08-s08, four beats. There is no setup mount and no second count, so this file
// needs neither a mount getter nor BEAT_MAPS - unlike its sibling VarnaWheelScene, which is three
// mounts of one file. What it does need is the beat-0 lesson from that sibling: the step-aside is
// a one-shot that belongs to stage 0, and it cannot be armed in enter(0) because setup() enters
// stage 0 before the host has set the beat count and check-scene FAILs any scene that defines
// onBeatChange (SimScene owns it). So it is armed from one guarded line in update().
//
// What this scene will not do, all from the stub:
//   - it draws two wheels and one marker. No figure ageing, no forest, no hermit, no house.
//   - the four arcs are one tint, one thickness, one arc length. Nothing is taller, larger or
//     better placed than anything else: the marker alone is marked, and only by a border and tint.
//   - the faded varna wheel is an inert echo. Its dot lifts and returns; nothing on it is settable.
//   - no question mark, no verdict, no tick, no tick-mark and no badge anywhere on the panel.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  mix, alpha, darken, chipRow, chipColumn, rr, ellipse, inOutSine, popAt, font,
  drawBackdrop, drawShadow, drawCard, ZONES,
} from 'simulations/base/kit/SimLook.js';

const RING_X = 386, RING_Y = 264;      // the ashrama ring's centre
const R_OUT = 132, R_IN = 94;           // the band the four arcs cut out of the ring
const ARC_HALF = 40;                    // degrees either side of an arc's axis; 10 deg of bare ring between
const MARK_R = 113;                     // the marker rides the middle of the band
const MARK_R_PX = 13;
const PLATE_W = 164, PLATE_H = 74;      // an arc's name plate, at the ring box's diagonals
const NAME_PX = 16, GLOSS_PX = 13;
const PLATE_XY = [[570, 110], [570, 414], [222, 414], [222, 110]];

// The faded varna wheel is drawn in its own units and scaled, never imported from its sibling
// (the stub forbids the import, and a shared import would make the two mounts indistinguishable).
const VW_RIM = 190, VW_HUB = 40, VW_R0 = 54, VW_R1 = 174, VW_HALF = 19;
const VW_SPOKES = [-148, -32, 32, 148]; // the sibling's spatial X, so the same four spokes read
const VW_REST_S = 0.295;                // settled scale; rim 190 * 0.295 = 56
const VW_REST_A = 0.62;                 // and how faded it comes to rest: faded, not gone
const VW_X = 76, VW_Y = 176;            // where it settles, inside ZONES.left
const VW_DOT_PX = 15, VW_DOT_MIN = 7;   // the dot is held at a floor so it stays pressable
const VW_START_S = 1;

const S_STEP = 0, S_FIRST2 = 1, S_LAST2 = 2, S_OPEN = 3;

const ASIDE_T = 0.75;                    // the step-aside, once: the wheel out, the ring in
const ASIDE_RING_DELAY = 0.3;            // the ring's own half of the cross-fade
const ASIDE_RING_T = 0.45;
const TRAVEL_T = 0.45;                   // the marker round to another arc
const POP_GAP = 0.22;                    // the gap between two plates arriving on one beat
const LIFT_T = 0.4, LIFT_PX = 14;        // the faded wheel's dot: up, and back
const ARC_TAP = 90;                      // nearest arc on the ring wins, gaps included: a phone tap
                                         // has no 10-degree gap to land in

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }], [{ idx: 3, dwellMs: null }]];

// The four stages, round the ring in this order. Every gloss is the slide's own short form, cut
// across lines to fit a 164 px plate - never rewritten, and none invented. (\uXXXX takes exactly
// four hex digits, so the dotted n of varna and the dotted m of sannyaasa are each built from a
// four-digit escape followed by the next letter.)
const STAGES = [
  { name: 'Brahmacharya', gloss: ['the stage of', 'studentship'] },
  { name: 'G\u1E5Bihastha', gloss: ['the stage of the', 'householder'] },
  { name: 'V\u0101naprastha', gloss: ['life in the', 'forest'] },
  { name: 'Sa\u1E41ny\u0101sa', gloss: ['renunciation'] },
];

// The first wheel's four spokes, the sibling's four verbatim, and nothing else: no job lists.
const VARNA = ['br\u0101hma\u1E47a', 'k\u1E63hatriya', 'vai\u015Bya', '\u015Bh\u016Bdra'];

const NOTES = [
  'two schematic diagrams side by side - not a portrait of a life',
  'the first two arcs take their names; the marker has not moved',
  'each stage has its own dhamma; no stage stands above another',
  'one wheel asks what you do, the other asks when',
];

const TITLES = [{ text: 'var\u1E47a wheel' }, { text: '\u0101\u015Bhrama wheel' }];
const DHAMMA = { text: 'dhamma: one for each stage' };
const HINT = { text: 'tap an arc to move the marker' };

const rad = (deg) => (deg * Math.PI) / 180;
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
/** An arc's axis in degrees. Index 3 sits at 225 and index 0 at 315, so a step forward is +90. */
const axisOf = (i) => -45 + i * 90;

export class AshramaWheelScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static NOTE_STAGE = 0;                 // one muted line along the foot, from stage 0 on
  static ARIA_LABEL = 'Two wheels side by side on one board. On the left, a small faded wheel of '
    + 'four spokes - brahmana, kshatriya, vaisya, shudra - with a single loose dot in its hub; '
    + 'pressing the dot lifts it and lets it fall back, and nothing on that wheel can be set. On '
    + 'the right, a ring cut into four arcs, with a small marker sitting on one of them. The four '
    + 'stages of life, in order round the ring, are Brahmacharya, the stage of studentship; '
    + 'G\u1E5Bihastha, the stage of the householder; V\u0101naprastha, life in the forest; and '
    + 'Sa\u1E41ny\u0101sa, renunciation. All four arcs are the same size and the same colour: they '
    + 'are a sequence, not a rank. Tap any arc, or use the earlier and next stage buttons, to '
    + 'walk the marker round the ring in either direction.';
  static CONTROLS = [
    { type: 'button', id: 'back', label: 'Earlier stage' },
    { type: 'button', id: 'next', label: 'Next stage' },
  ];

  constructor(container, config) {
    super(container, config);
    this._at = 0;                         // the arc carrying the marker, 0..3
    this._from = 0;                       // and where a travel started from
    this._fade = 0;                       // 0 = the varna wheel centre-stage, 1 = settled left
    this._up = 0;                       // 0 = the ring not yet up, 1 = fully up
    this._seen = new Set([0]);            // the arcs the marker has stood on; the circuit's worth
    this._lift = 0;                       // the faded wheel's dot lift, 0..1
    this._run = null;                     // { kind, t, ... }
  }

  /** How many arcs are named right now: none on arrival, then two, then all four. */
  get _named() { return this.stage === S_STEP ? 0 : this.stage === S_FIRST2 ? 2 : 4; }

  noteRows() { return [{ text: NOTES[this.stage] ?? NOTES[0] }]; }

  isControlDisabled(id) {
    if (id === 'next' || id === 'back') return !!this._run;
    return super.isControlDisabled(id);
  }

  enter(stage) {
    this._run = null;                     // a run never outlives the beat that launched it
    this._lift = 0;
    // The step-aside belongs to stage 0 and is armed from update(). A resumed mount that lands on
    // a later beat has missed it and must show the settled board, so _fade starts at 1 there.
    this._fade = stage === S_STEP ? 0 : 1;
    this._up = stage === S_STEP ? 0 : 1;
    // The marker and the arcs it has stood on are the learner's own: they carry across the beats.
  }

  // ---- the runs ---------------------------------------------------------------------------
  _travel(from, to) {
    const d = ((to - from) % 4 + 4) % 4;  // always forward round the ring, which is a ring
    this._from = from;
    this._run = { kind: 'travel', t: 0, stage: this.stage, to, sweep: d * 90 };
    this._at = to;
    this._seen.add(to);
    this.requestUiUpdate?.();
  }

  _markersPos(a) {
    return { x: RING_X + Math.cos(rad(a)) * MARK_R, y: RING_Y + Math.sin(rad(a)) * MARK_R };
  }

  /** Where the marker is now: easing round the band, or resting on its arc. */
  _marker() {
    const r = this._run;
    if (r && r.kind === 'travel') {
      const e = inOutSine(Math.min(1, r.t / TRAVEL_T));
      return this._markersPos(axisOf(this._from) + r.sweep * e);
    }
    return this._markersPos(axisOf(this._at));
  }

  update(d) {
    // The one place the beat-0 one-shot can start: check-scene FAILs an onBeatChange override,
    // and setup() has already run enter(0) by the time the host knows the mount. First update()
    // on stage 0 with no run already going is the first frame this can be true.
    if (!this._run && this.stage === S_STEP && this._fade < 1) {
      this._run = { kind: 'aside', t: 0, stage: S_STEP };
    }
    const r = this._run;
    if (!r) return;
    r.t += d;
    if (r.kind === 'aside') {
      this._fade = inOutSine(Math.min(1, r.t / ASIDE_T));
      this._up = inOutSine(Math.max(0, Math.min(1, (r.t - ASIDE_RING_DELAY) / ASIDE_RING_T)));
      if (r.t >= ASIDE_T) { this._run = null; this._fade = 1; this._up = 1; }
    } else if (r.kind === 'travel') {
      if (r.t >= TRAVEL_T) {
        this._run = null;
        // Standing the marker on all four arcs is the concept; the first full circuit is the only
        // thing this scene celebrates, and it happens once.
        if (this._seen.size === 4 && r.stage === this.stage) this.celebrate(RING_X, RING_Y, 14);
      }
    } else if (r.kind === 'lift') {
      this._lift = Math.sin(Math.PI * Math.min(1, r.t / LIFT_T));
      if (r.t >= LIFT_T) { this._run = null; this._lift = 0; }
    }
  }

  busy() { return !!this._run; }

  // ---- the two controls the stub names ----------------------------------------------------
  onControlChange(id) {
    if (!this._guard(id)) return;
    if (id === 'next') this._travel(this._at, (this._at + 1) % 4);
    else if (id === 'back') this._travel(this._at, (this._at + 3) % 4);
    this.requestUiUpdate?.();
  }

  // ---- pointing -----------------------------------------------------------------------------
  /** The arc a point is over, or -1. */
  _arcAt(p) {
    const dx = p.x - RING_X, dy = p.y - RING_Y;
    const r = Math.hypot(dx, dy);
    if (r < R_IN - 8 || r > R_OUT + 10) return -1;
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    // signed angular distance to an axis, wrapped into (-180, 180]; both are in degrees either
    // side of the +x axis, so this is the short way round without normalising either first.
    let best = -1, bd = ARC_TAP + ARC_HALF;
    for (let k = 0; k < 4; k++) {
      const d = Math.abs(((a - axisOf(k) + 540) % 360) - 180);
      if (d < bd) { bd = d; best = k; }
    }
    return best;
  }

  pointerDown(p) {
    const k = this._arcAt(p);
    if (k >= 0) { this._travel(this._at, k); this.animateFor(700); return; }
    // The faded wheel's dot. It is not live: it lifts and comes back, which is the whole answer.
    const v = this._vannaPose();
    const r = Math.max(VW_DOT_MIN, VW_DOT_PX * v.s);
    if (Math.hypot(p.x - v.x, p.y - v.y) < r + 16) {
      this._run = { kind: 'lift', t: 0, stage: this.stage };
      this.animateFor(600);
    }
  }

  // ---- geometry -------------------------------------------------------------------------------
  /** Where the faded varna wheel is: centre-stage at full size, shrunk and left at rest. */
  _vannaPose() {
    const e = this._fade;
    return {
      x: RING_X + (VW_X - RING_X) * e,
      y: RING_Y + (VW_Y - RING_Y) * e,
      s: VW_START_S + (VW_REST_S - VW_START_S) * e,
      a: 1 + (VW_REST_A - 1) * e,
    };
  }

  // ---- drawing -------------------------------------------------------------------------------
  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    this._varnaWheel(ctx, c);
    this._drawRing(ctx, c);
    this._markerDot(ctx, c);
    this._chips(ctx, c);
  }

  /** The first wheel, remembered: four spokes, a hub, and a dot nobody can place. */
  _varnaWheel(ctx, c) {
    const v = this._vannaPose();
    const dotR = Math.max(VW_DOT_MIN, VW_DOT_PX * v.s);
    ctx.save();
    ctx.translate(v.x, v.y);
    ctx.scale(v.s, v.s);
    ctx.globalAlpha = v.a;

    // A remembered wheel, not a ghost: it keeps its own face and its own gold so a learner who
    // met it on the first slide recognises the four spokes, and the whole of it is one alpha down.
    const face = mix(c.shape, c.bgDeep, 0.3);
    ctx.fillStyle = face;
    ctx.beginPath(); ctx.arc(0, 0, VW_RIM, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = mix(c.shape, c.label, 0.2);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, VW_RIM, 0, Math.PI * 2); ctx.stroke();

    // one tint and one wedge size on all four: a spoke that stood out would read as a rank
    ctx.fillStyle = mix(c.gold, c.label, 0.3);
    for (let k = 0; k < 4; k++) {
      const a = rad(VW_SPOKES[k]), h = rad(VW_HALF);
      ctx.beginPath();
      ctx.arc(0, 0, VW_R1, a - h, a + h);
      ctx.arc(0, 0, VW_R0, a + h, a - h, true);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = mix(c.shape, c.bgDeep, 0.45);
    ctx.beginPath(); ctx.arc(0, 0, VW_HUB, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = alpha(mix(c.label, c.bgDeep, 0.4), 0.9);
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, VW_HUB, 0, Math.PI * 2); ctx.stroke();

    // the dot, at its floor size so a press can still find it once the wheel has shrunk
    const dy = -this._lift * LIFT_PX;
    drawShadow(ctx, c, 0, dotR * 0.7 + 6, dotR * 0.8, 3, 0.7);
    ctx.fillStyle = c.accent;
    ctx.beginPath(); ctx.arc(0, dy, dotR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = alpha(c.label, 0.35);
    ctx.beginPath(); ctx.arc(-dotR * 0.23, dy - dotR * 0.27, dotR * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;

    this._varnaNames(ctx, c, v.a);
  }

  /** The first wheel's four spoke names, as a measured chip column under it: no job lists. */
  _varnaNames(ctx, c, a) {
    const n = Math.round(VARNA.length * Math.min(1, this._fade * 1.3));
    if (n === 0) return;
    ctx.globalAlpha = a;
    chipColumn(ctx, c, VARNA.slice(0, n).map((text) => ({ text, bg: mix(c.label, c.bgSurface, 0.82) })),
      VW_X, 250, { align: 'center' });
    ctx.globalAlpha = 1;
  }

  /** The ashrama ring: four arcs, one tint and one size, cut out of a plain band. */
  _drawRing(ctx, c) {
    ctx.save();
    ctx.globalAlpha = this._up;

    // The ring is a filled disc with a rim, not a hairline circle: the band alone would leave the
    // hero zone's middle reading as bare backdrop, and the check's "empty centre" gate says so.
    ctx.fillStyle = mix(c.shape, c.bgDeep, 0.42);
    ctx.beginPath(); ctx.arc(RING_X, RING_Y, R_OUT, 0, Math.PI * 2); ctx.fill();
    const rim = mix(c.shape, c.label, 0.13);
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(RING_X, RING_Y, R_OUT, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(RING_X, RING_Y, R_IN, 0, Math.PI * 2); ctx.stroke();

    const base = mix(c.gold, c.label, 0.17);
    for (let k = 0; k < 4; k++) {
      const a = rad(axisOf(k)), h = rad(ARC_HALF);
      // The marker is the only state an arc carries, and it is border and tint: never a size,
      // never a height, never a mark that would read as better.
      const on = this._at === k;
      ctx.beginPath();
      ctx.arc(RING_X, RING_Y, R_OUT, a - h, a + h);
      ctx.arc(RING_X, RING_Y, R_IN, a + h, a - h, true);
      ctx.closePath();
      ctx.fillStyle = on ? mix(c.gold, c.label, 0.30) : base;
      ctx.fill();
      ctx.strokeStyle = on ? c.accent : darken(base, 0.3);
      ctx.lineWidth = on ? 2.5 : 2;
      ctx.stroke();
    }

    // the band's own width, marked where the marker rides, so an unmarked arc reads as untouched
    ctx.save();
    ctx.translate(RING_X, RING_Y);
    ctx.rotate(rad(axisOf(this._at)));
    ctx.fillStyle = alpha(mix(c.gold, c.bgDeep, 0.62), 0.5);
    rr(ctx, MARK_R - 21, -9, 42, 18, 7);
    ctx.fill();
    ctx.restore();

    // the hub: the middle of the ring is one flat disc, so the hero zone reads as one object
    ctx.fillStyle = mix(c.shape, c.bgDeep, 0.6);
    ctx.beginPath(); ctx.arc(RING_X, RING_Y, R_IN - 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = alpha(mix(c.label, c.bgDeep, 0.45), 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(RING_X, RING_Y, R_IN - 3, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;

    for (let k = 0; k < 4; k++) this._plate(ctx, c, k);
  }

  /** An arc's name plate, at the ring box's diagonals. Popped in on the beat that names it. */
  _plate(ctx, c, k) {
    if (k >= this._named) return;
    const pop = this._pop(k);
    if (!pop || pop.alpha <= 0.02) return;
    const [x, y] = PLATE_XY[k];
    const s = pop.scale;
    const on = this._at === k;
    const st = STAGES[k];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = pop.alpha * this._up;
    drawShadow(ctx, c, 0, PLATE_H * 0.5 + 7, PLATE_W * 0.46, 9, 0.8);
    drawCard(ctx, c, -PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H, 1, { accent: on ? c.gold : undefined });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = c.label;
    ctx.font = font(c, 600, NAME_PX, true);
    if (ctx.measureText(st.name).width > PLATE_W - 20) ctx.font = font(c, 600, NAME_PX - 2, true);
    ctx.fillText(st.name, 0, -PLATE_H / 2 + 17);
    ctx.fillStyle = c.labelMuted;
    st.gloss.forEach((line, i) => {
      ctx.font = font(c, 400, GLOSS_PX, false);
      if (ctx.measureText(line).width > PLATE_W - 18) ctx.font = font(c, 400, GLOSS_PX - 1, false);
      ctx.fillText(line, 0, -PLATE_H / 2 + 35 + i * 14);
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /** When a plate arrives: on its own beat, its partner POP_GAP later. Everything else is up. */
  _pop(k) {
    let delay = null;
    if (this.stage === S_FIRST2) delay = k < 2 ? k * POP_GAP : null;
    else if (this.stage === S_LAST2) delay = k >= 2 ? (k - 2) * POP_GAP : null;
    if (delay === null) return { scale: 1, alpha: 1 };
    const p = popAt(this.age, delay);
    return p ? { scale: p.scale, alpha: p.alpha } : null;
  }

  /** The marker: a position on a ring, not a person. */
  _markerDot(ctx, c) {
    const p = this._marker();
    ctx.save();
    ctx.globalAlpha = this._up;
    drawShadow(ctx, c, p.x, p.y + 8, 11, 4, 0.7);
    ctx.fillStyle = c.accent;
    ctx.beginPath(); ctx.arc(p.x, p.y, MARK_R_PX, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = alpha(c.label, 0.35);
    ellipse(ctx, p.x - 3, p.y - 3.5, MARK_R_PX * 0.34, MARK_R_PX * 0.34);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /** One chip row in the top strip: the two wheel titles, then whatever this beat adds. */
  _chips(ctx, c) {
    const items = TITLES.map((t) => ({ ...t, bg: mix(c.label, c.bgSurface, 0.82) }));
    if (this.stage === S_LAST2) items.push({ ...DHAMMA, bg: mix(c.gold, c.bgSurface, 0.72) });
    if (this.stage === S_STEP && this._up > 0.4) items.push({ ...HINT, bg: c.accent });
    chipRow(ctx, c, items, ZONES.top.x, ZONES.top.y + ZONES.top.h / 2, { align: 'left' });
  }
}