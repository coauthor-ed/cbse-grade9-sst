// TakshashilaScene.js - L10 s05 "Drainage".
// The excavated city of Sirkap at Takshashila, seen as if standing at the edge of the dig late
// in the afternoon: a low 3/4 perspective over broad, low rubble foundations in open grass, with
// the drainage channels cut down into them. One control runs the water once along the carved
// route to the outfall at the low point; the other traces the whole network. No roofs, no
// reconstruction, no map.
//
//   beat 0  the whole excavation, dry, nothing singled out
//   beat 1  the same frame, both controls live, the learner runs the water
//   beat 2  the same frame, still, water at rest where it ended
//   beat 3  the same frame plus one chip: the source's own claim, unglossed
//
// World units are metres: X runs west to east, Y south (near) to north (far), Z up. A small
// pinhole camera (pos, look-at, focal length) projects the world; the run moves it.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  W, H, alpha, mix, lighten, darken, mulberry32, pill, font, luma, drawVignette,
} from 'simulations/base/kit/SimLook.js';
import { ease, reducedMotion, hash2 } from 'simulations/base/kit/SimAnim.js';
import { convexHull } from 'simulations/base/kit/SimIso.js';

const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;

// -- cameras ---------------------------------------------------------------------
// C0 stands at the south-east edge of the dig, a few metres up, looking north-west across it.
// C1 is the follow shot while the water runs; C2 is the payoff: down low beside the outfall,
// looking back up the channel at the city it came through. Every push is paired with the glide
// back to C0.
const CY = 300;   // screen row of the optical centre
const C0 = { pos: [14, -9, 11.5], at: [1, 34, 0], f: 620 };
const C1 = { pos: [11, -2, 8], at: [3, 30, 0], f: 640 };
const C2 = { pos: [11.5, 0.8, 3.1], at: [5.5, 22, 0.6], f: 560 };

// -- the site --------------------------------------------------------------------
// The main run: high entry at the far (north) edge of the campus, every leg falling, leaving
// at the low point into the outfall hollow near the viewer. Each corner is a small drop in the
// channel floor, so the water visibly falls on its way down.
const MAIN = [[-8, 70], [-8, 45], [4, 45], [4, 31], [8, 31], [8, 11.2]];
// Four dry branch cuts that meet the main run: part of the network, no water of their own.
const BRANCHES = [
  { pts: [[4, 45], [4, 54]], seg: 1 },
  { pts: [[-8, 45], [-18, 45]], seg: 0 },
  { pts: [[8, 31], [16, 31]], seg: 3 },
  { pts: [[4, 31], [-5, 31]], seg: 2 },
];
const HW = 0.8;            // channel half width
const D0 = 0.45;           // channel depth at the entry
const DROP = 0.09;         // floor drop at each corner
const WATER = 0.24;        // water depth over the floor
const POOL = { x: 8, y: 9.4, rx: 2.7, ry: 1.9, depth: 0.85 };   // the outfall hollow

// Quarters in blocks along what were streets, five rows deep, jittered: a city laid out over
// time, not a printed grid. The channels cut through them; walls stop at the cuts.
const COLS = [[-25, -15], [-13, -2], [0, 10.5], [12.5, 22]];
const ROWS = [[62, 71], [50, 60], [38, 48], [26, 36], [14, 24]];
const SKIP = new Set(['0,3', '4,0']);   // two unexcavated mounds

const RUN_S = 1.5;         // the run, once, end to end
const ARRIVE_PUSH = 1.0;   // C1 -> C2 after the water lands
const HOLD = 0.6;
const BACK = 1.2;          // C2 -> C0
const TAIL = ARRIVE_PUSH + HOLD + BACK;

const CLAIM = 'large campus, well-organised urban systems';
const LBL_A = '';
// Takshashila with its diacritics, built from code points: a \u escape in this file's
// source is decoded by some write paths, four hex digits each, and a truncated one breaks the file.
const LBL_B = `Tak${String.fromCharCode(0x1E63)}ha${String.fromCharCode(0x15B)}hil${String.fromCharCode(0x101)}`;
const LBL_C = 'drainage channels';

// One entry per beat: [{ idx: <stage>, dwellMs: null }]; dwellMs null = wait for the learner.
const MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
  [{ idx: 3, dwellMs: null }],
];
const S_RUN = 1, S_CLAIM = 3;

// Late-afternoon sun, low in the south-west: south and west faces glow, east faces fall into
// cool shade, and every wall throws a long shadow to the north-east.
const LIGHT = (() => { const v = [-0.62, -0.62, 0.36]; const n = Math.hypot(...v); return v.map((k) => k / n); })();
const SHADOW = [-LIGHT[0] / LIGHT[2], -LIGHT[1] / LIGHT[2]];

// -- geometry, built once (seeded) -----------------------------------------------
function segRects(pts, z0, step, first) {
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
    const s0 = i === 0 ? (first ? 0 : HW) : HW;       // a downstream leg starts past the corner square
    const s1 = i + 2 < pts.length ? HW : 0;            // an upstream leg owns the corner square
    const sx = ax + dx * s0, sy = ay + dy * s0, ex = bx + dx * s1, ey = by + dy * s1;
    const r = {
      x0: Math.min(sx, ex) - (dx ? 0 : HW), x1: Math.max(sx, ex) + (dx ? 0 : HW),
      y0: Math.min(sy, ey) - (dy ? 0 : HW), y1: Math.max(sy, ey) + (dy ? 0 : HW),
      z: -(z0 + step * i), dx, dy, a: [ax, ay], b: [bx, by],
    };
    out.push(r);
  }
  return out;
}

const MAIN_R = segRects(MAIN, D0, DROP, true);
const BRANCH_R = BRANCHES.flatMap((b) => segRects(b.pts, D0 + DROP * b.seg, 0, false));
const CUTS = [...MAIN_R, ...BRANCH_R];

// Arc length along MAIN.
const SEG_LEN = MAIN.slice(1).map((p, i) => Math.hypot(p[0] - MAIN[i][0], p[1] - MAIN[i][1]));
const TOTAL = SEG_LEN.reduce((a, b) => a + b, 0);
const CORNER_S = SEG_LEN.map((_, i) => SEG_LEN.slice(0, i + 1).reduce((a, b) => a + b, 0));

function alongMain(s) {
  let left = Math.max(0, Math.min(TOTAL, s));
  for (let i = 0; i < SEG_LEN.length; i++) {
    if (left <= SEG_LEN[i] || i === SEG_LEN.length - 1) {
      const a = MAIN[i], b = MAIN[i + 1], t = SEG_LEN[i] ? left / SEG_LEN[i] : 0;
      return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), i, dx: Math.sign(b[0] - a[0]), dy: Math.sign(b[1] - a[1]) };
    }
    left -= SEG_LEN[i];
  }
  return { x: MAIN[MAIN.length - 1][0], y: MAIN[MAIN.length - 1][1], i: SEG_LEN.length - 1, dx: 0, dy: -1 };
}

// Subtract [a, b] intervals from [lo, hi].
function subtract(lo, hi, cuts) {
  let out = [[lo, hi]];
  for (const [a, b] of cuts) {
    const nx = [];
    for (const [p, q] of out) {
      if (b <= p || a >= q) { nx.push([p, q]); continue; }
      if (a > p) nx.push([p, a]);
      if (b < q) nx.push([b, q]);
    }
    out = nx;
  }
  return out.filter(([p, q]) => q - p > 0.05);
}

// The channels' inner walls: each rect side minus whatever another cut covers; a side that
// borders a shallower cut becomes a step face (from that floor down to this one).
const EPS = 0.02;
function inside(r, x, y) { return x > r.x0 + 1e-6 && x < r.x1 - 1e-6 && y > r.y0 + 1e-6 && y < r.y1 - 1e-6; }
const INNER = [];
const KERBS = [];
CUTS.forEach((r) => {
  const sides = [
    { axis: 'x', at: r.x0, lo: r.y0, hi: r.y1, n: [1, 0] },
    { axis: 'x', at: r.x1, lo: r.y0, hi: r.y1, n: [-1, 0] },
    { axis: 'y', at: r.y0, lo: r.x0, hi: r.x1, n: [0, 1] },
    { axis: 'y', at: r.y1, lo: r.x0, hi: r.x1, n: [0, -1] },
  ];
  for (const sd of sides) {
    const cover = [];
    for (const o of CUTS) {
      if (o === r) continue;
      if (sd.axis === 'x' && sd.at > o.x0 + 1e-6 && sd.at < o.x1 - 1e-6) cover.push([o.y0, o.y1]);
      if (sd.axis === 'y' && sd.at > o.y0 + 1e-6 && sd.at < o.y1 - 1e-6) cover.push([o.x0, o.x1]);
    }
    for (const [p, q] of subtract(sd.lo, sd.hi, cover)) {
      const m = (p + q) / 2;
      const ox = sd.axis === 'x' ? sd.at - sd.n[0] * EPS : m, oy = sd.axis === 'y' ? sd.at - sd.n[1] * EPS : m;
      const nb = CUTS.find((o) => o !== r && inside(o, ox, oy));
      if (nb && nb.z <= r.z + 1e-6) continue;
      const top = nb ? nb.z : 0;
      INNER.push({ ...sd, p, q, top, bot: r.z, step: !!nb });
      const mouth = r === MAIN_R[MAIN_R.length - 1] && sd.axis === 'y' && sd.at === r.y0;   // open onto the outfall
      if (!nb && !mouth) KERBS.push({ ...sd, p, q });
    }
  }
});

// Walls. Each quarter: a perimeter, one long partition and one cross wall, a doorway in the
// south wall; every wall broken into pieces of different heights, the cuts taken out.
const BOXES = [];
const YARDS = [];
(function build() {
  const rnd = mulberry32(4207);
  const corr = CUTS.map((r) => ({ x0: r.x0 - 0.45, x1: r.x1 + 0.45, y0: r.y0 - 0.45, y1: r.y1 + 0.45 }));
  corr.push({ x0: POOL.x - POOL.rx - 0.4, x1: POOL.x + POOL.rx + 0.4, y0: POOL.y - POOL.ry - 0.4, y1: POOL.y + POOL.ry + 0.4 });
  const T = 0.75;
  const pieceify = (x0, x1, y0, y1, gaps = []) => {
    const along = x1 - x0 >= y1 - y0;
    const lo = along ? x0 : y0, hi = along ? x1 : y1;
    const cuts = [...gaps];
    for (const cr of corr) {
      const hit = along ? (y1 > cr.y0 && y0 < cr.y1) : (x1 > cr.x0 && x0 < cr.x1);
      if (hit) cuts.push(along ? [cr.x0, cr.x1] : [cr.y0, cr.y1]);
    }
    for (const [p, q] of subtract(lo, hi, cuts)) {
      let a = p;
      while (a < q - 0.1) {
        const b = Math.min(q, a + 2.2 + rnd() * 2.8);
        const broke = rnd();
        if (broke > 0.07) {
          const h = broke < 0.2 ? 0.28 + rnd() * 0.14 : 0.5 + rnd() * 0.5;
          const box = along ? { x0: a, x1: b, y0, y1, h } : { x0, x1, y0: a, y1: b, h };
          box.seed = Math.floor(rnd() * 1e6);
          BOXES.push(box);
        }
        a = b;
      }
    }
  };
  ROWS.forEach((row, ri) => COLS.forEach((col, ci) => {
    if (SKIP.has(`${ri},${ci}`)) return;
    const x0 = col[0] + (rnd() - 0.5) * 1.2, x1 = col[1] + (rnd() - 0.5) * 1.2;
    const y0 = row[0] + (rnd() - 0.5) * 1.0, y1 = row[1] + (rnd() - 0.5) * 1.0;
    const door = x0 + 1.5 + rnd() * (x1 - x0 - 4);
    pieceify(x0, x1, y1 - T, y1);
    pieceify(x0, x1, y0, y0 + T, [[door, door + 1.4]]);
    pieceify(x0, x0 + T, y0 + T, y1 - T);
    pieceify(x1 - T, x1, y0 + T, y1 - T);
    const xm = x0 + (x1 - x0) * (0.4 + rnd() * 0.2);
    const gy = y0 + 1.5 + rnd() * (y1 - y0 - 4);
    pieceify(xm - T / 2, xm + T / 2, y0 + T, y1 - T, [[gy, gy + 1.3]]);
    const ym = y0 + (y1 - y0) * (0.4 + rnd() * 0.25);
    const left = rnd() < 0.5;
    if (left) pieceify(x0 + T, xm - T / 2, ym - T / 2, ym + T / 2);
    else pieceify(xm + T / 2, x1 - T, ym - T / 2, ym + T / 2);
    // the open courtyard: the half without the cross wall
    YARDS.push(left ? [xm + T / 2, x1 - T, y0 + T, y1 - T] : [x0 + T, xm - T / 2, y0 + T, y1 - T]);
    YARDS.push(left ? [x0 + T, xm - T / 2, y0 + T, y1 - T] : [xm + T / 2, x1 - T, y0 + T, y1 - T]);
  }));
  // Each wall's coursed rubble: stones per face (u along, v up, both 0..1) and on the top.
  for (const b of BOXES) {
    const r2 = mulberry32(b.seed);
    const len = Math.max(b.x1 - b.x0, b.y1 - b.y0), wid = Math.min(b.x1 - b.x0, b.y1 - b.y0);
    const courses = Math.max(1, Math.round(b.h / 0.34));
    // rubble: stones of very different sizes, roughly coursed, corners knocked about,
    // some big ones running through two courses, small chinking stones between
    const face = (L) => {
      const st = [];
      const jit = () => (r2() - 0.5) * 0.16;
      let blocked = [], next = [];
      for (let k = 0; k < courses; k++) {
        let u = -r2() * 0.4;
        while (u < L) {
          const bl = blocked.find(([p, q]) => u + 0.1 > p && u < q);
          if (bl) { u = bl[1]; continue; }
          const big = k + 1 < courses && r2() < 0.18;
          const l = big ? 0.75 + r2() * 0.5 : r2() < 0.2 ? 0.22 + r2() * 0.16 : 0.4 + r2() * 0.65;
          const u0 = Math.max(0, u) + 0.04, u1 = Math.min(L, u + l) - 0.04;
          const v0 = (k + 0.08) / courses, v1 = (k + (big ? 1.92 : 0.92)) / courses;
          if (u1 - u0 > 0.08) {
            st.push([u0 / L, u1 / L, v0, v1, Math.floor(r2() * 3), jit() / courses, jit() / courses, jit() / courses, jit() / courses, (r2() - 0.5) * 0.06 / L]);
            if (big) next.push([u, u + l]);
          }
          u += l;
        }
        blocked = next; next = [];
      }
      return st;
    };
    b.faceL = face(len);
    b.faceW = face(wid);
    const top = [];
    for (let k = 0; k < 2; k++) {
      let u = -r2() * 0.3;
      while (u < len) {
        const l = 0.45 + r2() * 0.6;
        const u0 = Math.max(0, u) + 0.04, u1 = Math.min(len, u + l) - 0.04;
        if (u1 - u0 > 0.1) top.push([u0 / len, u1 / len, k * 0.5 + 0.06 + r2() * 0.05, k * 0.5 + 0.44 - r2() * 0.05, Math.floor(r2() * 3), 0, 0, 0, 0, 0]);
        u += l;
      }
    }
    b.top = top;
  }
})();

// Ground dressing, seeded: grass tufts, mottles, loose rubble in the yards.
const TUFTS = [];
const MOTTLES = [];
const RUBBLE = [];
(function dress() {
  const rnd = mulberry32(911);
  for (let i = 0; i < 520; i++) {
    const x = -34 + rnd() * 66, y = 2 + Math.pow(rnd(), 0.8) * 78;
    if (CUTS.some((r) => x > r.x0 - 0.5 && x < r.x1 + 0.5 && y > r.y0 - 0.5 && y < r.y1 + 0.5)) continue;
    TUFTS.push([x, y, 0.5 + rnd() * 0.6, rnd()]);
  }
  for (let i = 0; i < 70; i++) MOTTLES.push([-34 + rnd() * 66, 4 + rnd() * 76, 1.5 + rnd() * 4, rnd()]);
  for (const [x0, x1, y0, y1] of YARDS) {
    for (let k = 0; k < 5; k++) RUBBLE.push([lerp(x0, x1, rnd()), lerp(y0, y1, rnd()), 0.12 + rnd() * 0.2, rnd()]);
  }
})();

// -- camera ------------------------------------------------------------------------
function prep(cam) {
  const [px, py, pz] = cam.pos;
  const dx = cam.at[0] - px, dy = cam.at[1] - py, dz = cam.at[2] - pz;
  const yaw = Math.atan2(dx, dy), pitch = Math.atan2(-dz, Math.hypot(dx, dy));
  return { px, py, pz, yaw, pitch, f: cam.f, cy: Math.cos(yaw), sy: Math.sin(yaw), cp: Math.cos(pitch), sp: Math.sin(pitch),
    horizon: CY - cam.f * Math.tan(pitch), key: `${px.toFixed(3)},${py.toFixed(3)},${pz.toFixed(3)},${dx.toFixed(3)},${dy.toFixed(3)},${dz.toFixed(3)},${cam.f.toFixed(2)}` };
}
function mixCam(a, b, k) {
  return { pos: a.pos.map((v, i) => lerp(v, b.pos[i], k)), at: a.at.map((v, i) => lerp(v, b.at[i], k)), f: lerp(a.f, b.f, k) };
}
// world -> [sx, sy, depth]
function proj(K, X, Y, Z) {
  const vx = X - K.px, vy = Y - K.py, vz = Z - K.pz;
  const xr = vx * K.cy - vy * K.sy, yf = vx * K.sy + vy * K.cy;
  let d = yf * K.cp - vz * K.sp;
  const up = yf * K.sp + vz * K.cp;
  if (d < 0.3) d = 0.3;
  return [W / 2 + K.f * xr / d, CY - K.f * up / d, d];
}
function poly(ctx, K, pts) {
  pts.forEach(([x, y, z], i) => { const p = proj(K, x, y, z); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
  ctx.closePath();
}
function quadAt(ctx, A, B, C, D, s) {
  // bilinear in screen space: A(0,0) B(1,0) C(1,1) D(0,1); a stone with knocked corners
  const [u0, u1, v0, v1, , ja = 0, jb = 0, jc = 0, jd = 0, ju = 0] = s;
  const pt = (u, v) => [lerp(lerp(A[0], B[0], u), lerp(D[0], C[0], u), v), lerp(lerp(A[1], B[1], u), lerp(D[1], C[1], u), v)];
  const du = (u1 - u0) * 0.14, dv = (v1 - v0) * 0.18;
  const pts = [pt(u0 + du, v0 + ja), pt(u1 - du + ju, v0 + jb), pt(u1, v0 + dv + jb), pt(u1 + ju, v1 - dv + jc),
    pt(u1 - du, v1 + jc), pt(u0 + du - ju, v1 + jd), pt(u0, v1 - dv + jd), pt(u0 - ju, v0 + dv + ja)];
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
}

export class TakshashilaScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static VISUAL_PROFILE = 'rich';
  static CONTINUOUS = true;   // rich: clouds, birds, grass in the wind and dust in the light; the run itself always ends
  static IRIS = false;
  static ARIA_LABEL = 'The ruins of Takshashila in late afternoon light, seen from the edge of the dig: low stone rubble foundations in open grass with drainage channels cut down into the quarters. Pressing Run the channel sends water from the top of the campus along the cut channels, dropping at each corner, to the outfall at the low point near you; Show the course traces the whole channel network.';
  static CONTROLS_IN_SIGHT = true;
  static CONTROLS = [
    { type: 'button', id: 'run', label: 'Run the channel' },
    { type: 'toggle', id: 'course', label: 'Show the course' },
  ];

  constructor(container, config) {
    super(container, config);
    this._run = null;        // { t, stage } while the water moves
    this._wet = 0;           // 0..1 along MAIN, how far the water got and stays
    this._arrive = null;     // clock time the water reached the outfall
    this._camOff = false;    // a beat change parks the camera at C0
    this._flow = 0;          // metres the surface sheen has travelled
    this._flowV = 0;         // its speed: on while running, eases to rest after
    this._course = false;
    this._cache = null;
  }

  enter() { this._camOff = true; }   // every beat is the same frame; never open mid-push

  _start() {
    if (this._run) return;
    this._camOff = false;
    this._arrive = null;
    if (reducedMotion()) { this._wet = 1; this._arrive = this.clock - 10; this.animateFor(400); return; }
    this._run = { t: 0, stage: this.stage };
    this._wet = 0;
    this.animateFor((RUN_S + TAIL) * 1000 + 300);
  }

  update(d) {
    const r = this._run;
    this._flowV = r ? 9 : this._flowV * Math.exp(-d * 4);
    if (this._flowV < 0.05) this._flowV = 0;
    this._flow += this._flowV * d;
    if (!r) return;
    r.t += d;
    this._wet = clamp01(r.t / RUN_S);
    if (this._wet >= 1) {
      this._run = null;
      this._wet = 1;
      this._arrive = this.clock;
    }
  }

  busy() {
    if (this._run) return true;
    return this._arrive != null && !this._camOff && this.clock - this._arrive < TAIL + 0.2;
  }

  // The camera now, and how far it is from the home shot (0 = at C0, 1 = away): the labels
  // fade with it, so they never sit over a pushed-in frame.
  _camNow() {
    this._away = 0;
    if (reducedMotion() || this._camOff) return C0;
    if (this._run) { const k = ease.inOutCubic(clamp01(this._run.t / RUN_S)); this._away = clamp01(k * 4); return mixCam(C0, C1, k); }
    if (this._arrive == null) return C0;
    const a = this.clock - this._arrive;
    this._away = 1;
    if (a < ARRIVE_PUSH) return mixCam(C1, C2, ease.inOutCubic(a / ARRIVE_PUSH));
    if (a < ARRIVE_PUSH + HOLD) return C2;
    if (a < TAIL) { const k = ease.inOutCubic((a - ARRIVE_PUSH - HOLD) / BACK); this._away = clamp01((1 - k) * 4); return mixCam(C2, C0, k); }
    this._away = 0;
    return C0;
  }

  _fill() {
    if (this._arrive == null) return 0;
    if (reducedMotion()) return 1;
    return ease.outCubic(clamp01((this.clock - this._arrive) / 0.9));
  }

  // ---- palette -----------------------------------------------------------------
  _pal(c) {
    const dark = luma(c.bgDeep) < 0.5;
    const dim = (col, k = 0.3) => (dark ? mix(col, c.bgDeep, k) : col);
    const sun = lighten(c.gold, 0.35);
    const stone = mix(lighten(c.waste, 0.42), c.s2, 0.2);
    const grass = darken(mix(mix(c.s3, c.s2, 0.45), c.waste, 0.12), dark ? 0.34 : 0.14);
    return {
      dark, sun,
      skyTop: dark ? mix(mix(c.s1, c.s5, 0.55), c.bgDeep, 0.5) : mix(c.s1, c.glass, 0.35),
      skyLow: dark ? mix(mix(c.gold, c.flame, 0.5), c.bgDeep, 0.15) : mix(lighten(c.gold, 0.4), c.flame, 0.18),
      grass, grassLit: dim(mix(grass, c.gold, 0.22), 0.1), grassDeep: darken(grass, 0.28),
      earth: dim(mix(mix(c.waste, c.s8, 0.35), c.gold, 0.12), 0.22),
      stoneLit: dim(mix(stone, sun, 0.42), 0.18),
      stoneShade: dim(mix(darken(stone, 0.42), c.s5, 0.16), 0.25),
      stoneTop: dim(mix(lighten(stone, 0.12), sun, 0.25), 0.18),
      shadow: alpha(mix(darken(c.s5, 0.55), darken(c.waste, 0.6), 0.5), dark ? 0.5 : 0.36),
      water: dim(mix(c.water, c.s7, 0.3), 0.15),
      sheen: lighten(c.glass, 0.65),
      cutDark: darken(mix(c.waste, c.s5, 0.2), dark ? 0.72 : 0.55),
      haze: dark ? mix(mix(c.gold, c.s5, 0.5), c.bgDeep, 0.45) : mix(lighten(c.gold, 0.5), c.glass, 0.4),
    };
  }

  // ---- draw ---------------------------------------------------------------------
  draw(ctx, c) {
    const P = this._pal(c);
    const t = reducedMotion() ? 0 : this.clock;
    const cam = this._camNow();
    const K = prep(cam);
    this._sky(ctx, c, P, K, t);
    const live = !!this._run || (this._arrive != null && this.clock - this._arrive < TAIL + 0.1 && !reducedMotion());
    // At rest the site is painted once into an offscreen layer and blitted; a host without a
    // real canvas transform (a headless test) just paints it live.
    const tr = typeof document !== 'undefined' && typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
    if (live || !tr || typeof tr.a !== 'number' || typeof ctx.canvas?.width !== 'number' || !ctx.canvas.width) {
      this._site(ctx, c, P, K, t, 5.5);   // moving: full stonework on the near walls only
    } else {
      const k = tr.a || 1;
      const key = `${K.key}|${this._wet}|${this._fill().toFixed(3)}|${k}|${c.bgDeep}|${c.water}`;
      if (!this._cache || this._cache.key !== key) {
        const cv = this._cache?.cv || document.createElement('canvas');
        cv.width = Math.round(W * k); cv.height = Math.round(H * k);
        const o = cv.getContext('2d');
        o.setTransform(k, 0, 0, k, 0, 0);
        o.clearRect(0, 0, W, H);
        this._site(o, c, P, K, 0, 2.2);
        this._cache = { cv, key };
      }
      ctx.drawImage(this._cache.cv, 0, 0, W, H);
    }
    this._ambient(ctx, c, P, K, t);
    if (this._course) this._trace(ctx, c, K, t);
    drawVignette(ctx, c, P.dark ? 0.6 : 0.25);
    const la = 1 - (this._away || 0);
    if (la > 0.01) { ctx.save(); ctx.globalAlpha = la; this._labels(ctx, c, K); ctx.restore(); }
  }

  _sky(ctx, c, P, K, t) {
    const hz = K.horizon;
    const g = ctx.createLinearGradient(0, 0, 0, hz + 10);
    g.addColorStop(0, P.skyTop);
    g.addColorStop(0.6, mix(P.skyTop, P.skyLow, 0.55));
    g.addColorStop(1, P.skyLow);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, hz + 12));
    // the low sun off the left of the frame: its glow fills the sky and rakes the site
    const sx = -40 - K.yaw * 200, sy = hz - 30;
    const L = ctx.createRadialGradient(sx, sy, 0, sx, sy, 520);
    L.addColorStop(0, alpha(lighten(c.gold, 0.7), P.dark ? 0.55 : 0.7));
    L.addColorStop(0.35, alpha(c.gold, P.dark ? 0.18 : 0.22));
    L.addColorStop(1, alpha(c.gold, 0));
    ctx.fillStyle = L; ctx.fillRect(0, 0, W, H);
    // soft lit clouds, drifting
    for (let i = 0; i < 4; i++) {
      const x = ((i * 230 + 60 + t * (3 + i)) % 900) - 110 - K.yaw * 120, y = 18 + (i % 2) * 22 + i * 4;
      const s = 0.8 + 0.25 * (i % 3);
      // long flat afternoon cloud: a cool body, its underside lit warm by the low sun
      ctx.fillStyle = alpha(mix(P.skyTop, lighten(c.glass, 0.8), 0.45), P.dark ? 0.35 : 0.6);
      for (const [dx, dy, rx, ry] of [[0, 0, 46, 7], [22, -5, 30, 7], [-18, -2, 22, 5]]) {
        ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, rx * s, ry * s, 0, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = alpha(mix(lighten(c.gold, 0.4), c.flame, 0.25), P.dark ? 0.4 : 0.5);
      ctx.beginPath(); ctx.ellipse(x - 4 * s, y + 4 * s, 40 * s, 3 * s, 0, 0, TAU); ctx.fill();
    }
  }

  // Everything on the ground: hills, grass, yards, channels, water, shadows, walls.
  _site(ctx, c, P, K, t, minLod) {
    const hz = K.horizon;
    // hills, hazier with distance, on the horizon
    const layers = [[0.75, 34, 0.011, 1.3], [0.5, 22, 0.016, 2.4], [0.25, 12, 0.022, 0.4]];
    const shift = K.yaw * K.f;
    layers.forEach(([hzk, amp, f, ph], li) => {
      ctx.fillStyle = mix(mix(P.grassDeep, P.grass, 0.3), P.haze, hzk);
      ctx.beginPath(); ctx.moveTo(-10, hz + 4);
      for (let x = -10; x <= W + 10; x += 10) {
        const wx = x + shift * (0.15 + li * 0.1);
        ctx.lineTo(x, hz - amp * (0.55 + 0.45 * Math.sin(wx * f + ph)) - 6 * Math.sin(wx * f * 3.1 + ph));
      }
      ctx.lineTo(W + 10, hz + 4); ctx.closePath(); ctx.fill();
      if (li === 2) {
        for (const tx of [70, 96, 430, 520, 548, 610]) {
          const wx = tx + shift * 0.35;
          const ty = hz - amp * (0.55 + 0.45 * Math.sin(wx * f + ph)) - 6 * Math.sin(wx * f * 3.1 + ph);
          ctx.fillStyle = mix(P.grassDeep, P.haze, 0.35);
          ctx.beginPath(); ctx.ellipse(tx, ty - 9, 7, 11, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = alpha(P.sun, 0.25);
          ctx.beginPath(); ctx.ellipse(tx - 2.5, ty - 11, 3.5, 7, 0, 0, TAU); ctx.fill();
        }
      }
    });
    // the ground plane
    const g = ctx.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0, mix(P.grassLit, P.haze, 0.45));
    g.addColorStop(0.3, P.grassLit);
    g.addColorStop(1, P.grass);
    ctx.fillStyle = g; ctx.fillRect(0, hz, W, H - hz + 2);
    // rolling grassy mounds round the dig, far to near, lit on their sunward crests
    for (const [Y, hgt, ph, hzk] of [[150, 9, 0.7, 0.42], [118, 6, 2.1, 0.26], [96, 3.6, 4.2, 0.12], [80, 1.8, 1.3, 0.03]]) {
      const ridge = [];
      for (let x = -90; x <= 90; x += 3) ridge.push([x, Y, hgt * (0.55 + 0.3 * Math.sin(x * 0.045 + ph) + 0.15 * Math.sin(x * 0.13 + ph * 2))]);
      const top = ridge.map(([x, y, z]) => proj(K, x, y, z));
      const base = proj(K, 0, Y - hgt * 2, 0)[1];
      const minY = Math.min(...top.map((q) => q[1]));
      const gm = ctx.createLinearGradient(0, minY, 0, base + 4);
      gm.addColorStop(0, mix(mix(P.grassLit, P.sun, 0.25), P.haze, hzk));
      gm.addColorStop(1, mix(P.grass, P.haze, hzk));
      ctx.fillStyle = gm;
      ctx.beginPath(); top.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
      ctx.lineTo(W + 400, base + 4); ctx.lineTo(-400, base + 4); ctx.closePath(); ctx.fill();
      // the crest catching the sun
      ctx.strokeStyle = alpha(mix(P.grassLit, P.sun, 0.5), 0.55 * (1 - hzk)); ctx.lineWidth = 1.5;
      ctx.beginPath(); top.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    }
    // mottles of light and darker grass
    for (const [x, y, r, k] of MOTTLES) {
      ctx.fillStyle = alpha(k < 0.5 ? P.grassDeep : lighten(P.grassLit, 0.15), 0.18);
      ctx.beginPath(); poly(ctx, K, [0, 1, 2, 3, 4, 5, 6, 7].map((j) => [x + Math.cos(j * TAU / 8) * r, y + Math.sin(j * TAU / 8) * r * 0.7, 0])); ctx.fill();
    }
    // the yards: packed earth, a little grass back in
    for (const [x0, x1, y0, y1] of YARDS) {
      ctx.fillStyle = mix(P.earth, P.grass, 0.25);
      ctx.beginPath(); poly(ctx, K, [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]]); ctx.fill();
    }
    for (const [x, y, r, k] of RUBBLE) {
      const p = proj(K, x, y, 0), s = K.f * r / p[2];
      ctx.fillStyle = k < 0.5 ? P.stoneLit : P.stoneTop;
      ctx.beginPath(); ctx.ellipse(p[0], p[1], s, s * 0.55, 0, 0, TAU); ctx.fill();
    }
    // tufts (static here; the near ones sway in _ambient)
    ctx.lineWidth = 1.2;
    for (const bucket of [0, 1]) {
      ctx.strokeStyle = alpha(bucket ? P.grassDeep : lighten(P.grassLit, 0.2), 0.7);
      ctx.beginPath();
      for (const [x, y, s, k] of TUFTS) {
        if (y < 13 || (k < 0.4 ? 1 : 0) !== bucket) continue;
        const p = proj(K, x, y, 0); if (p[2] < 2) continue;
        const h = K.f * 0.35 * s / p[2];
        if (h < 1.2) continue;
        ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] - h * 0.5, p[1] - h);
        ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + h * 0.15, p[1] - h * 1.2);
        ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + h * 0.6, p[1] - h * 0.9);
      }
      ctx.stroke();
    }
    this._outfall(ctx, c, P, K, t);
    this._channels(ctx, c, P, K, t);
    // long shadows, one fill
    ctx.fillStyle = P.shadow;
    ctx.beginPath();
    for (const b of BOXES) {
      const sx = SHADOW[0] * b.h, sy = SHADOW[1] * b.h;
      const hull = convexHull([[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1],
        [b.x0 + sx, b.y0 + sy], [b.x1 + sx, b.y0 + sy], [b.x1 + sx, b.y1 + sy], [b.x0 + sx, b.y1 + sy]]);
      poly(ctx, K, hull.map(([x, y]) => [x, y, 0]));
    }
    ctx.fill();
    this._walls(ctx, c, P, K, minLod);
    if (this._run) this._spray(ctx, c, P, K, t);
  }

  _channels(ctx, c, P, K, t) {
    // dressed kerb stones along every cut edge, lit on top
    for (const bucket of [0, 1]) {
      ctx.fillStyle = bucket ? mix(P.stoneTop, P.stoneLit, 0.5) : P.stoneTop;
      ctx.beginPath();
      for (const e of KERBS) {
        const w = 0.32, n = e.n;   // the kerb lies outside the cut
        const rnd = mulberry32(Math.round(e.at * 100 + e.p * 7));
        let u = e.p;
        while (u < e.q - 0.05) {
          const l = Math.min(e.q - u, 0.5 + rnd() * 0.5);
          const a = u + 0.03, b = u + l - 0.03;
          const pts = e.axis === 'x'
            ? [[e.at, a], [e.at, b], [e.at - n[0] * w, b], [e.at - n[0] * w, a]]
            : [[a, e.at], [b, e.at], [b, e.at - n[1] * w], [a, e.at - n[1] * w]];
          if ((rnd() < 0.5 ? 0 : 1) === bucket) poly(ctx, K, pts.map(([x, y]) => [x, y, 0.06]));
          u += l;
        }
      }
      ctx.fill();
    }
    // the openings, as one clip
    ctx.save();
    ctx.beginPath();
    for (const r of CUTS) poly(ctx, K, [[r.x0, r.y0, 0], [r.x1, r.y0, 0], [r.x1, r.y1, 0], [r.x0, r.y1, 0]]);
    ctx.fillStyle = P.cutDark; ctx.fill();
    ctx.clip();
    // floors: damp silt, darker the deeper
    for (const r of CUTS) {
      ctx.fillStyle = mix(mix(P.earth, P.stoneShade, 0.45), P.cutDark, 0.3 - r.z * 0.25);
      ctx.beginPath(); poly(ctx, K, [[r.x0, r.y0, r.z], [r.x1, r.y0, r.z], [r.x1, r.y1, r.z], [r.x0, r.y1, r.z]]); ctx.fill();
    }
    // inner faces that look back at the camera, lined with stone; step faces brighter
    for (const f of INNER) {
      const cx = f.axis === 'x' ? f.at : (f.p + f.q) / 2, cyy = f.axis === 'y' ? f.at : (f.p + f.q) / 2;
      if ((K.px - cx) * f.n[0] + (K.py - cyy) * f.n[1] <= 0) continue;
      const pts = f.axis === 'x'
        ? [[f.at, f.p, f.top], [f.at, f.q, f.top], [f.at, f.q, f.bot], [f.at, f.p, f.bot]]
        : [[f.p, f.at, f.top], [f.q, f.at, f.top], [f.q, f.at, f.bot], [f.p, f.at, f.bot]];
      const nl = clamp01(f.n[0] * LIGHT[0] + f.n[1] * LIGHT[1]);
      const col = mix(mix(P.stoneShade, P.stoneLit, nl), P.cutDark, f.step ? 0.05 : 0.18);
      ctx.fillStyle = col;
      ctx.beginPath(); poly(ctx, K, pts); ctx.fill();
      ctx.strokeStyle = alpha(darken(col, 0.35), 0.8); ctx.lineWidth = 0.8;
      const m = (f.top + f.bot) / 2;
      ctx.beginPath(); poly(ctx, K, f.axis === 'x' ? [[f.at, f.p, m], [f.at, f.q, m]] : [[f.p, f.at, m], [f.q, f.at, m]]); ctx.stroke();
    }
    this._water(ctx, c, P, K, t);
    ctx.restore();
    // a crisp lit lip on the far edges of the cuts
    ctx.strokeStyle = alpha(lighten(P.stoneTop, 0.25), 0.8); ctx.lineWidth = 1;
    for (const e of KERBS) {
      if (!(e.n[1] < 0 || e.n[0] > 0)) continue;
      ctx.beginPath();
      const a = e.axis === 'x' ? proj(K, e.at, e.p, 0.06) : proj(K, e.p, e.at, 0.06);
      const b = e.axis === 'x' ? proj(K, e.at, e.q, 0.06) : proj(K, e.q, e.at, 0.06);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
  }

  // Water in the cuts, from the entry to how far it has run.
  _water(ctx, c, P, K, t) {
    if (this._wet <= 0) return;
    const s = this._wet * TOTAL;
    const head = alongMain(s);
    const hw = HW * 0.92;
    for (let i = 0; i < MAIN_R.length; i++) {
      const r = MAIN_R[i];
      const s0 = i ? CORNER_S[i - 1] : 0;
      if (s <= s0) break;
      const z = r.z + WATER;
      let x0 = r.x0, x1 = r.x1, y0 = r.y0, y1 = r.y1;
      if (i === head.i && s < TOTAL) {
        // trim to the head
        if (r.dx > 0) x1 = Math.min(x1, head.x); else if (r.dx < 0) x0 = Math.max(x0, head.x);
        if (r.dy > 0) y1 = Math.min(y1, head.y); else if (r.dy < 0) y0 = Math.max(y0, head.y);
      }
      if (r.dx) { y0 = r.y0 + (HW - hw); y1 = r.y1 - (HW - hw); } else { x0 = r.x0 + (HW - hw); x1 = r.x1 - (HW - hw); }
      if (x1 - x0 < 0.02 || y1 - y0 < 0.02) continue;
      const a = proj(K, x0, y1, z), b = proj(K, x1, y0, z);
      const gr = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
      gr.addColorStop(0, lighten(P.water, 0.32));
      gr.addColorStop(0.5, P.water);
      gr.addColorStop(1, darken(P.water, 0.25));
      ctx.fillStyle = gr;
      ctx.beginPath(); poly(ctx, K, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]); ctx.fill();
      // the far bank reflects the sky
      ctx.strokeStyle = alpha(P.sheen, 0.75); ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (r.dx) poly(ctx, K, [[x0, y1 - 0.05, z], [x1, y1 - 0.05, z]]);
      else poly(ctx, K, [[x1 - 0.05, y0, z], [x1 - 0.05, y1, z]]);
      ctx.stroke();
      // flow streaks, travelling downstream while the water runs
      const L = SEG_LEN[i];
      for (let k = 0; k < 3; k++) {
        const lane = (k - 1) * 0.45 * hw;
        for (let m = -1; m < L / 1.7 + 1; m++) {
          const u = m * 1.7 + ((this._flow + k * 0.6) % 1.7);
          const ss = s0 + u;
          if (u < 0 || u > L || ss > s - 0.4) continue;
          const pa = alongMain(ss), pb = alongMain(Math.min(ss + 0.55, s));
          const ox = r.dx ? 0 : lane, oy = r.dx ? lane : 0;
          const A = proj(K, pa.x + ox, pa.y + oy, z), B = proj(K, pb.x + ox, pb.y + oy, z);
          ctx.strokeStyle = alpha(P.sheen, 0.55); ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
        }
      }
    }
    // sun glints on the surface
    for (let k = 0; k < 18; k++) {
      const ss = hash2(k, 7) * s;
      const q = alongMain(ss), lane = (hash2(k, 9) - 0.5) * hw * 1.4;
      const p = proj(K, q.x + (q.dx ? 0 : lane), q.y + (q.dx ? lane : 0), MAIN_R[q.i].z + WATER);
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + k * 1.7);
      const sz = Math.max(1, K.f * 0.08 / p[2]) * (0.6 + tw * 0.6);
      ctx.fillStyle = alpha(lighten(c.gold, 0.8), 0.45 + 0.4 * tw);
      ctx.beginPath(); ctx.ellipse(p[0], p[1], sz * 2.2, sz * 0.7, 0, 0, TAU); ctx.fill();
    }
    // the head: a foamy front while it runs
    if (this._run) {
      const z = MAIN_R[head.i].z + WATER + 0.05;
      for (let k = 0; k < 7; k++) {
        const lane = (k / 6 - 0.5) * hw * 1.6;
        const back = 0.15 + 0.25 * hash2(k, Math.floor(t * 14));
        const x = head.x - head.dx * back + (head.dx ? 0 : lane), y = head.y - head.dy * back + (head.dx ? lane : 0);
        const p = proj(K, x, y, z), rr = K.f * (0.18 + 0.1 * hash2(k, 3)) / p[2];
        ctx.fillStyle = alpha(lighten(c.glass, 0.85), 0.9);
        ctx.beginPath(); ctx.ellipse(p[0], p[1] - rr * 0.2, rr * 1.2, rr * 0.6, 0, 0, TAU); ctx.fill();
      }
    }
  }

  // Droplets where the water falls at each corner and off the end into the outfall.
  _spray(ctx, c, P, K, t) {
    const s = this._wet * TOTAL;
    const drops = CORNER_S.slice(0, -1).map((cs, i) => ({ s: cs, at: MAIN[i + 1], z: MAIN_R[i + 1].z + WATER, dir: [MAIN_R[i + 1].dx, MAIN_R[i + 1].dy] }));
    for (const [j, d] of drops.entries()) {
      if (s < d.s) continue;
      const since = (s - d.s) / TOTAL * RUN_S;
      const burst = since < 0.25 ? 1.6 : 1;
      for (let i = 0; i < 9; i++) {
        const life = ((t * 2.4 + hash2(i, j)) % 1);
        const ang = (hash2(i, j + 9) - 0.5) * 1.4;
        const reach = (0.4 + hash2(i, j + 3) * 0.7) * life * burst;
        const x = d.at[0] + (d.dir[0] * Math.cos(ang) - d.dir[1] * Math.sin(ang)) * (HW + reach);
        const y = d.at[1] + (d.dir[1] * Math.cos(ang) + d.dir[0] * Math.sin(ang)) * (HW + reach);
        const z = d.z + Math.sin(life * Math.PI) * 0.45 * burst;
        const p = proj(K, x, y, z), r = Math.max(1, K.f * 0.05 / p[2]);
        ctx.fillStyle = alpha(lighten(P.sheen, 0.3), 0.85 * (1 - life));
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill();
      }
    }
  }

  // The outfall: a stone-lined hollow in the grass past the last quarter, where the run ends.
  _outfall(ctx, c, P, K, t) {
    const ring = (sc, z) => Array.from({ length: 28 }, (_, j) => {
      const a = j * TAU / 28, wob = 1 + 0.06 * Math.sin(j * 2.3) + 0.04 * Math.cos(j * 3.7);
      return [POOL.x + Math.cos(a) * POOL.rx * sc * wob, POOL.y + Math.sin(a) * POOL.ry * sc * wob, z];
    });
    // a dug hollow in the grass: worn earth bank, a damp silt floor, clipped to its rim
    ctx.fillStyle = mix(P.earth, P.grass, 0.3);
    ctx.beginPath(); poly(ctx, K, ring(1.18, 0)); ctx.fill();
    ctx.save();
    ctx.beginPath(); poly(ctx, K, ring(1, 0));
    ctx.fillStyle = mix(darken(P.earth, 0.35), P.stoneShade, 0.3); ctx.fill();
    ctx.clip();
    ctx.fillStyle = mix(darken(P.earth, 0.15), P.cutDark, 0.2);
    ctx.beginPath(); poly(ctx, K, ring(0.72, -POOL.depth)); ctx.fill();
    const fill = this._fill();
    const age = this._arrive == null ? 9 : this.clock - this._arrive;
    const strength = reducedMotion() ? 0 : clamp01(1 - (age - 0.6) / 1.6);
    let z = 0;
    if (fill > 0) {
      // it fills to just below the channel lip, so the run always pours down into it
      const top = MAIN_R[MAIN_R.length - 1].z + WATER - 0.12;
      z = lerp(-POOL.depth + 0.06, top, fill);
      const sc = lerp(1, 0.72, -z / POOL.depth) + 0.02;   // a dished hollow: wider as it fills
      const a = proj(K, POOL.x, POOL.y + POOL.ry, z), b = proj(K, POOL.x, POOL.y - POOL.ry, z);
      const gr = ctx.createLinearGradient(0, a[1], 0, b[1]);
      gr.addColorStop(0, lighten(P.water, 0.38)); gr.addColorStop(0.55, P.water); gr.addColorStop(1, darken(P.water, 0.22));
      ctx.fillStyle = gr; ctx.beginPath(); poly(ctx, K, ring(sc, z)); ctx.fill();
      // the sky and the low sun caught in the still water
      ctx.fillStyle = alpha(P.sheen, 0.3);
      ctx.beginPath(); poly(ctx, K, Array.from({ length: 18 }, (_, j) => {
        const q = j * TAU / 18; return [POOL.x - 0.5 + Math.cos(q) * POOL.rx * 0.55, POOL.y + 0.55 + Math.sin(q) * POOL.ry * 0.22, z];
      })); ctx.fill();
      for (let k = 0; k < 6; k++) {
        const tw = 0.5 + 0.5 * Math.sin(t * 2.6 + k * 2.1);
        const p = proj(K, POOL.x - 1.2 + hash2(k, 51) * 2.2, POOL.y - 0.6 + hash2(k, 52) * 1.2, z);
        ctx.fillStyle = alpha(lighten(c.gold, 0.8), 0.35 + 0.45 * tw);
        ctx.beginPath(); ctx.ellipse(p[0], p[1], 3 + tw * 3, 1 + tw * 0.6, 0, 0, TAU); ctx.fill();
      }
      // ripples spreading from where the channel pours in
      for (let k = 0; k < 4 && strength > 0; k++) {
        const u = ((age * 0.8 + k / 4) % 1);
        const rr = 0.2 + u * 1.9;
        ctx.strokeStyle = alpha(P.sheen, 0.75 * (1 - u) * strength); ctx.lineWidth = 1.4;
        ctx.beginPath(); poly(ctx, K, Array.from({ length: 24 }, (_, j) => {
          const q = j * TAU / 24; return [POOL.x + Math.cos(q) * rr * 1.25, POOL.y + 1.0 + Math.sin(q) * rr * 0.75, z];
        })); ctx.stroke();
      }
    }
    ctx.restore();
    // the bank: a few rough stones and grass leaning over the edge
    const rnd = mulberry32(77);
    for (let j = 0; j < 7; j++) {
      const a = 0.4 + j * 0.85 + rnd() * 0.3;
      const x = POOL.x + Math.cos(a) * POOL.rx * 1.08, y = POOL.y + Math.sin(a) * POOL.ry * 1.08;
      const p = proj(K, x, y, 0.04), s = K.f * (0.14 + rnd() * 0.14) / p[2];
      ctx.fillStyle = P.stoneShade;
      ctx.beginPath(); ctx.ellipse(p[0] + s * 0.15, p[1] + s * 0.2, s * 1.05, s * 0.55, 0.2, 0, TAU); ctx.fill();
      ctx.fillStyle = P.stoneLit;
      ctx.beginPath(); ctx.ellipse(p[0] - s * 0.1, p[1] - s * 0.05, s * 0.8, s * 0.4, 0.2, 0, TAU); ctx.fill();
    }
    // the pour: a short fall from the channel lip, foaming where it lands
    if (fill > 0 && strength > 0) {
      const e = MAIN[MAIN.length - 1], ez = MAIN_R[MAIN_R.length - 1].z + WATER;
      const A = proj(K, e[0] - HW * 0.75, e[1], ez), B = proj(K, e[0] + HW * 0.75, e[1], ez);
      const Cc = proj(K, e[0] + HW * 0.55, e[1] - 0.45, z), D = proj(K, e[0] - HW * 0.55, e[1] - 0.45, z);
      const g2 = ctx.createLinearGradient(0, A[1], 0, D[1]);
      g2.addColorStop(0, alpha(lighten(P.water, 0.2), 0.95 * strength)); g2.addColorStop(1, alpha(lighten(P.sheen, 0.4), 0.95 * strength));
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(Cc[0], Cc[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.fill();
      const big = clamp01(1 - age / 0.5);
      for (let k = 0; k < 16; k++) {
        const life = (t * 2 + hash2(k, 41)) % 1;
        const ang = hash2(k, 43) * TAU;
        const reach = (0.5 + big * 1.2) * life;
        const x = e[0] + Math.cos(ang) * reach, y = e[1] - 0.6 + Math.sin(ang) * reach * 0.6;
        const p = proj(K, x, y, z + Math.sin(life * Math.PI) * (0.35 + big * 0.7)), r = Math.max(1.2, K.f * 0.06 / p[2]);
        ctx.fillStyle = alpha(lighten(P.sheen, 0.4), 0.95 * (1 - life) * strength);
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill();
      }
    }
  }

  // The rubble walls, far to near, each face in coursed stone.
  _walls(ctx, c, P, K, minLod) {
    const order = BOXES.map((b) => {
      const p = proj(K, (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 0);
      return [p[2], b];
    }).sort((a, b) => b[0] - a[0]);
    for (const [dep, b] of order) {
      if (dep < 1.5) continue;
      const lod = K.f * 0.3 / dep;
      const c3 = (x, y, z) => proj(K, x, y, z);
      const faces = [];
      if (K.py < b.y0) faces.push({ n: [0, -1], a: [b.x0, b.y0], b: [b.x1, b.y0] });
      if (K.py > b.y1) faces.push({ n: [0, 1], a: [b.x1, b.y1], b: [b.x0, b.y1] });
      if (K.px < b.x0) faces.push({ n: [-1, 0], a: [b.x0, b.y1], b: [b.x0, b.y0] });
      if (K.px > b.x1) faces.push({ n: [1, 0], a: [b.x1, b.y0], b: [b.x1, b.y1] });
      const longX = b.x1 - b.x0 >= b.y1 - b.y0;
      for (const f of faces) {
        const nl = clamp01(f.n[0] * LIGHT[0] + f.n[1] * LIGHT[1]) * 1.25;
        const col = mix(P.stoneShade, P.stoneLit, clamp01(nl));
        const A = c3(f.a[0], f.a[1], 0), B = c3(f.b[0], f.b[1], 0), Cc = c3(f.b[0], f.b[1], b.h), D = c3(f.a[0], f.a[1], b.h);
        ctx.fillStyle = darken(col, 0.38);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(Cc[0], Cc[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.fill();
        if (lod < minLod) { ctx.fillStyle = alpha(col, 0.8); ctx.fill(); continue; }
        const st = (f.n[1] !== 0) === longX ? b.faceL : b.faceW;
        const rev = f.n[0] + f.n[1] > 0;   // keep the layout's u running the same way on both sides
        for (const shade of [0, 1, 2]) {
          ctx.fillStyle = shade === 2 ? lighten(col, 0.1) : shade ? mix(col, P.earth, 0.12) : darken(col, 0.06);
          ctx.beginPath();
          for (const s of st) {
            if (s[4] !== shade) continue;
            quadAt(ctx, A, B, Cc, D, rev ? [1 - s[1], 1 - s[0], ...s.slice(2)] : s);
          }
          ctx.fill();
        }
      }
      // the top, catching the low sun
      const T0 = c3(b.x0, b.y0, b.h), T1 = c3(b.x1, b.y0, b.h), T2 = c3(b.x1, b.y1, b.h), T3 = c3(b.x0, b.y1, b.h);
      ctx.fillStyle = darken(P.stoneTop, 0.22);
      ctx.beginPath(); ctx.moveTo(T0[0], T0[1]); ctx.lineTo(T1[0], T1[1]); ctx.lineTo(T2[0], T2[1]); ctx.lineTo(T3[0], T3[1]); ctx.closePath(); ctx.fill();
      if (lod >= minLod * 1.6) {
        // top layout runs along the long axis: A..B along it, D across
        const [A, B, Cc, D] = longX ? [T0, T1, T2, T3] : [T1, T2, T3, T0];
        for (const shade of [0, 1, 2]) {
          ctx.fillStyle = shade === 2 ? lighten(P.stoneTop, 0.12) : shade ? mix(P.stoneTop, P.earth, 0.15) : P.stoneTop;
          ctx.beginPath();
          for (const s of b.top) if (s[4] === shade) quadAt(ctx, A, B, Cc, D, s);
          ctx.fill();
        }
      }
      // rim light along the sunward top edges
      ctx.strokeStyle = alpha(lighten(P.sun, 0.3), P.dark ? 0.55 : 0.75); ctx.lineWidth = lod > 4 ? 1.4 : 0.9;
      ctx.beginPath(); ctx.moveTo(T3[0], T3[1]); ctx.lineTo(T0[0], T0[1]); ctx.lineTo(T1[0], T1[1]); ctx.stroke();
    }
  }

  // Ambient life on top of the site: grass in the wind near the viewer, birds, dust in the light.
  _ambient(ctx, c, P, K, t) {
    // the golden-hour wash, strongest on the sun side
    const wash = ctx.createLinearGradient(0, 0, W, H * 0.4);
    wash.addColorStop(0, alpha(lighten(c.gold, 0.3), P.dark ? 0.16 : 0.2));
    wash.addColorStop(0.6, alpha(c.gold, 0.04));
    wash.addColorStop(1, alpha(c.flame, 0));
    ctx.fillStyle = wash; ctx.fillRect(0, 0, W, H);
    // near tufts sway (nothing nearer than y 13 stands behind a wall)
    for (const [x, y, s, k] of TUFTS) {
      if (y >= 13) continue;
      const p = proj(K, x, y, 0); if (p[2] < 2.2 || p[1] > H + 20) continue;
      const h = Math.min(40, K.f * 0.38 * s / p[2]);
      const sway = Math.sin(t * 1.7 + x * 0.4 + k * 3) * 0.35 + Math.sin(t * 3.1 + y) * 0.1;
      ctx.strokeStyle = alpha(k < 0.4 ? P.grassDeep : lighten(P.grassLit, 0.22), 0.85);
      ctx.lineWidth = Math.max(1, h * 0.08); ctx.lineCap = 'round';
      ctx.beginPath();
      for (const [lean, len] of [[-0.5, 1], [0.1, 1.25], [0.6, 0.9]]) {
        ctx.moveTo(p[0], p[1]);
        ctx.quadraticCurveTo(p[0] + lean * h * 0.3, p[1] - h * len * 0.6, p[0] + (lean + sway) * h * 0.5, p[1] - h * len);
      }
      ctx.stroke();
    }
    // big foreground grass at the frame corners, slightly soft
    ctx.save();
    if (!reducedMotion()) ctx.filter = 'blur(1.2px)';
    for (const [bx, n, side] of [[22, 9, 1], [W - 18, 8, -1]]) {
      for (let i = 0; i < n; i++) {
        const x = bx + side * i * 7 + hash2(i, 5) * 6, hgt = 60 + hash2(i, 6) * 55;
        const sway = Math.sin(t * 1.5 + i * 0.7) * 10 + Math.sin(t * 2.7 + i) * 3;
        ctx.fillStyle = i % 3 ? darken(P.grass, 0.3) : mix(P.grassLit, P.sun, 0.3);
        const tx = x + side * (14 - i) + sway, ty = H - hgt, mx = x + side * 4, my = H - hgt * 0.55;
        ctx.beginPath(); ctx.moveTo(x - 3.5, H + 4);
        ctx.quadraticCurveTo(mx - 2, my, tx, ty);
        ctx.quadraticCurveTo(mx + 2.5, my, x + 3.5, H + 4);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
    // birds gliding high over the dig
    for (let i = 0; i < 3; i++) {
      const x = ((t * (16 + i * 4) + i * 260) % 860) - 90, y = 46 + i * 15 + Math.sin(t * 0.7 + i) * 6;
      const flap = Math.sin(t * (7 + i) + i * 2), s = 5 + (i % 2) * 2;
      ctx.strokeStyle = alpha(darken(P.skyTop, 0.6), 0.75); ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - s * 1.4, y - flap * s * 0.6); ctx.quadraticCurveTo(x - s * 0.6, y - s * 0.2 - flap * s * 0.3, x, y);
      ctx.quadraticCurveTo(x + s * 0.6, y - s * 0.2 - flap * s * 0.3, x + s * 1.4, y - flap * s * 0.6);
      ctx.stroke();
    }
    // dust hanging in the low sunlight
    const rnd = mulberry32(19);
    for (let i = 0; i < 26; i++) {
      const bx = rnd() * W * 0.75, by = K.horizon + 20 + rnd() * 260, ph = rnd() * TAU, r = 0.8 + rnd() * 1.6;
      const x = (bx + t * (4 + rnd() * 6)) % W, y = by + Math.sin(t * 0.6 + ph) * 8;
      ctx.fillStyle = alpha(lighten(c.gold, 0.6), (0.25 + 0.25 * Math.sin(t * 1.3 + ph)) * (1 - x / W));
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }

  // Show the course: the whole network traced bright over the masonry, the main run marked
  // from entry to outfall.
  _trace(ctx, c, K, t) {
    const line = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => { const p = proj(K, x, y, 0.1); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); };
    const all = [MAIN, ...BRANCHES.map((b) => b.pts)];
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = alpha(c.warning, 0.28); ctx.lineWidth = 12;
    all.forEach(line);
    ctx.strokeStyle = alpha(lighten(c.warning, 0.35), 0.95); ctx.lineWidth = 3;
    ctx.setLineDash([9, 6]); ctx.lineDashOffset = reducedMotion() ? 0 : -t * 12;
    all.forEach(line);
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
  }

  _text(ctx, c, s, x, y, size = 16) {
    ctx.font = font(c, 700, size);
    const w = ctx.measureText(s).width;
    ctx.fillStyle = alpha(c.bgDeep, 0.78);
    const hh = size * 0.85 + 4; ctx.beginPath(); ctx.roundRect(x - w / 2 - 12, y - hh, w + 24, hh * 2, hh); ctx.fill();
    ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y + 1);
  }

  // The three permitted labels only, plain on a dark backing; plus the hint and the claim.
  _labels(ctx, c, K) {
    this._text(ctx, c, LBL_B, 120, 30, 28);
    {
      const a = proj(K, 8, 17, -0.3);
      const lx = 196, ly = 462;
      ctx.strokeStyle = alpha(c.label, 0.9); ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(lx + 60, ly - 12); ctx.lineTo(a[0] - 3, a[1] + 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.label; ctx.beginPath(); ctx.arc(a[0], a[1], 3.2, 0, TAU); ctx.fill();
      this._text(ctx, c, LBL_C, lx, ly, 28);
    }
    if (this.stage === S_RUN && !this._run && this._wet === 0) {
      const e = proj(K, MAIN[0][0], 62, 0);
      const pulse = 0.75 + 0.25 * Math.sin(this.age * 3.4);
      pill(ctx, c, 'Tap Run the channel', e[0] + 26, e[1] - 30, { align: 'left', bg: c.accent, size: 28, alpha: pulse });
    }
    if (this.stage === S_CLAIM) pill(ctx, c, CLAIM, W / 2, 78, { align: 'center', bg: c.accent, size: 28 });
  }

  _tag(ctx, c) {
    ctx.font = font(c, 600, 28);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const s = 'an original drawing, not a photograph';
    const nw = ctx.measureText(s).width;
    ctx.fillStyle = alpha(c.bgDeep, 0.72);
    ctx.beginPath(); ctx.roundRect(668 - nw - 10, 13, nw + 20, 24, 12); ctx.fill();
    ctx.fillStyle = c.labelMuted;
    ctx.fillText(s, 668, 25);
  }

  isControlDisabled(id) {
    if (id === 'run' && this.busy()) return true;
    return super.isControlDisabled(id);
  }

  // Host controls. `v` is a STRING for slider/select/number/segmented, true/false for toggle.
  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'run') this._start();
    else if (id === 'course') { this._course = !!v; this.animateFor(500); }
    this.requestUiUpdate?.();
  }

  getControlValue(id) { return id === 'course' ? this._course : super.getControlValue(id); }

  // A tap on a channel runs it too, so the control works on a phone.
  pointerDown(q) {
    if (this.busy()) return false;
    const K = prep(this._camNow());
    let near = 1e9;
    for (const pts of [MAIN, ...BRANCHES.map((b) => b.pts)]) {
      for (let i = 1; i < pts.length; i++) {
        const a = proj(K, pts[i - 1][0], pts[i - 1][1], 0), b = proj(K, pts[i][0], pts[i][1], 0);
        const vx = b[0] - a[0], vy = b[1] - a[1];
        const L2 = vx * vx + vy * vy || 1;
        const u = clamp01(((q.x - a[0]) * vx + (q.y - a[1]) * vy) / L2);
        near = Math.min(near, Math.hypot(q.x - (a[0] + vx * u), q.y - (a[1] + vy * u)));
      }
    }
    if (near > 16) return false;
    this._start();
    return true;
  }
}
