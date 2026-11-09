// LandSeaBreezeScene.js - one coastline, one day-night cycle, and the wind turning around.
//
// Beats (L04 s07): heat depth, day at 15:00, night at 23:00, then the learner's own day.
// A cinematic cross-section of a coast: layered sky, far hills melting into haze, a soil-and-rock
// cutaway with a beach, palms and a hut on the land; a sea cutaway with a sailing boat on the
// right. Above the two surfaces ONE closed loop of air turns: it rises over whichever surface is
// warmer, crosses aloft, sinks over the cooler one and returns along the ground. Between the two
// columns, ONE pressure surface dips over the warmer side. Along the ground, one arrow - the
// object the slide is about - points left (`sea breeze`) while the land is warmer and right
// (`land breeze`) while the sea is warmer, swinging through vertical at the moment the two are
// equal. It is never two arrows cross-fading: the stub's hardest rule is that the wind must be
// SEEN to turn. The palms, the hut's smoke, the sail and pennant, the grass and the drifting
// motes all lean on the same number the arrow reads.
//
// The model is a pair of first-order lags on one insolation curve, integrated once into a
// 24-hour lookup table at load (see the design note's Model numbers). Direction comes from
// `land - sea` and from nothing else, so the arrow can never be right for the wrong reason.
//
// The sky is a clock, not a sun-angle lesson: no sun disc, no terminator. Only the L03 mount
// (3 beats) draws ONE sunbeam bundle at a single angle over both surfaces, as its stub asks.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  alpha, clamp01, darken, drawVignette, font, inkOn, lighten, luma, mix, pill, rr,
} from 'simulations/base/kit/SimLook.js';
import { reducedMotion, hash2 } from 'simulations/base/kit/SimAnim.js';
import { withCamera, layer, toScreen, pushTo } from 'simulations/base/kit/SimCamera.js';

const TAU = Math.PI * 2;

// --- the coast, in design space ----------------------------------------------------------
// A landscape seen from just above the beach: the horizon at GROUND_Y, land running away on the
// left, sea on the right, the shoreline sweeping toward the viewer. No underground cutaway.
const GROUND_Y = 350;                            // the horizon: the far edge of land and sea
const COAST_X = 360;                             // where the shore meets the horizon
const LX = 215, SX = 525;                        // the two air columns
const COL_TOP = 120;                             // taps above this are the sky, not the coast
const ARROW_X = COAST_X, ARROW_Y = 388;           // the surface wind, on the loop's bottom leg, along the ground
const TAG_Y = 432;                                // the wind's name, under the arrow it names
const PALM1_X = 22, PALM2_X = 282, HUT_X = 140, BOAT_X = 448, MOON_X = 605;
const T_LAND_X = 66, T_SEA_X = 622, TH_Y = 300, TH_H = 100;   // the two instruments share one baseline

// --- the air loop: one closed cell, a rounded rectangle traced in the "day" sense --------
const LOOP_TOP = 112, LOOP_BOT = ARROW_Y, LOOP_R = 70;
const MOTES = 96, BLOBS = 4;

// --- the day --------------------------------------------------------------------------
const DAY_HOURS = 24;                            // the dial's range; L05 will remap this onto a year
const RISE = 4.5, SPAN = 12.5;                   // sun up 04:30 - 17:00
const TAU_LAND = 2.6, TAU_SEA = 6.0;             // h - the sea lets the heat go far more slowly
const K_LAND = 20, K_SEA = 10;                   // how far each surface is driven
const CROSS = 0.35;                              // |d| below this: the surface wind is dead
const H_PER_S = 0.8;                             // Run: one simulated hour per 1.25 s, 30 s a day

// --- how the numbers become pixels ------------------------------------------------------
const PY = 215, DIP = 30, P_W = 160;             // pressure surface: base height, dip, lobe width
const LEN_MIN = 58, LEN_SPAN = 124;              // arrow: 58 px dead, 182 px at the day peak
const TILT_W = 0.8;                              // |d| below which the arrow starts to tip up

// --- the payoff camera: a slow push onto the coast when a run completes its first turn ---
const PUSH_IN = 1.3, PUSH_HOLD = 2.0, PUSH_OUT = 1.6, PUSH_Z = 1.12;
const PUSH_END = PUSH_IN + PUSH_HOLD + PUSH_OUT;

// --- stages ----------------------------------------------------------------------------
// One stage set for all three mounts, so a code path cannot drift between them.
const S_HEAT = 0, S_DAY = 1, S_NIGHT = 2, S_CYCLE = 3;
const HOUR = { [S_HEAT]: 15, [S_DAY]: 15, [S_NIGHT]: 23, [S_CYCLE]: 15 };   // the beat sets the clock

const MAP_L04 = [{ idx: S_HEAT, dwellMs: null }, { idx: S_DAY, dwellMs: null },
  { idx: S_NIGHT, dwellMs: null }, { idx: S_CYCLE, dwellMs: null }];

// --- the model table --------------------------------------------------------------------
// One insolation curve drives two first-order lags. The day is integrated at 0.002 h and stored
// every 0.02 h, so a dragged dial and a running cycle read exactly the same numbers and can
// never disagree. Spin-up is 82 days, far past the sea's 6 h constant.
const TBL_DT = 0.002, TBL_EVERY = 10, TBL_N = 1200;
const TBL = (() => {
  const land = new Float64Array(TBL_N);
  const sea = new Float64Array(TBL_N);
  let tl = 0, ts = 0;
  const steps = Math.round((24 * 82) / TBL_DT);
  for (let i = 0; i < steps + TBL_N * TBL_EVERY; i++) {
    const h = (i * TBL_DT) % DAY_HOURS;
    const u = (h - RISE) / SPAN;
    const s = (u <= 0 || u >= 1) ? 0 : Math.sin(Math.PI * u);
    tl += (K_LAND * s - tl) * TBL_DT / TAU_LAND;
    ts += (K_SEA * s - ts) * TBL_DT / TAU_SEA;
    if (i >= steps) {
      const j = (i - steps) / TBL_EVERY;
      if (j < TBL_N) { land[j] = tl; sea[j] = ts; }
    }
  }
  return { land, sea };
})();

// The loop path, sampled once: up the land column, across the top, down the sea column, back
// along the ground. A positive phase runs it this way (the day cell); a negative one reverses it.
const LOOP = (() => {
  const pts = [];
  const seg = (x0, y0, x1, y1) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4));
    for (let i = 0; i < n; i++) pts.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]);
  };
  const arc = (cx, cy, a0, a1) => {
    const n = 18;
    for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * LOOP_R, cy + Math.sin(a) * LOOP_R]); }
  };
  const L = LOOP_R;
  seg(LX, LOOP_BOT - L, LX, LOOP_TOP + L);
  arc(LX + L, LOOP_TOP + L, Math.PI, Math.PI * 1.5);
  seg(LX + L, LOOP_TOP, SX - L, LOOP_TOP);
  arc(SX - L, LOOP_TOP + L, -Math.PI / 2, 0);
  seg(SX, LOOP_TOP + L, SX, LOOP_BOT - L);
  arc(SX - L, LOOP_BOT - L, 0, Math.PI / 2);
  seg(SX - L, LOOP_BOT, LX + L, LOOP_BOT);
  arc(LX + L, LOOP_BOT - L, Math.PI / 2, Math.PI);
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1], b = pts[i % pts.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[pts.length];
  const at = (u) => {
    let q = (u % 1); if (q < 0) q += 1;
    const s = q * total;
    let lo = 0, hi = pts.length;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    const a = pts[lo], b = pts[(lo + 1) % pts.length];
    const f = (s - cum[lo]) / Math.max(1e-6, cum[lo + 1] - cum[lo]);
    const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
    return { x: a[0] + tx * f, y: a[1] + ty * f, tx: tx / tl, ty: ty / tl };
  };
  return { at, total };
})();
const LEG = (LOOP_BOT - LOOP_TOP - 2 * LOOP_R) / LOOP.total;   // one vertical leg's share of the loop

export class LandSeaBreezeScene extends SimScene {
  static BEAT_STEP_MAP = MAP_L04;
  static BEAT_MAPS = { 3: MAP_L04.slice(0, 3), 4: MAP_L04 };   // 3: the retired blk-l03-s08 still on disk
  static CONTROLS_IN_SIGHT = true;
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTINUOUS = true;                      // the slide's content is a reversal; a stopped frame freezes the wind half-way through its turn
  static ARIA_LABEL = 'A coastline in cross-section, land on the left with palms and a hut, sea on the right with a small sailing boat, and a thermometer in each. A loop of air rises over the warmer surface, crosses high up and sinks over the cooler one, and the surface wind along the ground reverses as the day turns over: a sea breeze by day, a weaker land breeze by night.';
  static CONTROLS = [
    { type: 'slider', id: 'hour', label: 'Time of day', min: 0, max: DAY_HOURS, step: 0.25, value: 12 },
    { type: 'button', id: 'run', label: 'Run' },
  ];

  constructor(container, config) {
    super(container, config);
    this._hour = 12;
    this._going = false;
    this._pulse = 0;
    this._armed = true;
    this._t = 0;
    this._phase = 0;                             // the air loop's travelled distance, signed by d
    this._push = -1;                             // seconds into the payoff camera push; < 0 = none
    this._lastD = undefined;
    this._clockTxt = '12:00';
    this._clockAge = 9;
  }

  enter(stage) {
    this._hour = HOUR[stage] ?? 15;
    this._going = false;
    this._armed = true;
    this._push = -1;
    this._lastD = undefined;
    this._clockTxt = this._clockText(this._hour);
    this._clockAge = 9;
    this.requestUiUpdate?.();
  }

  // --- the model ------------------------------------------------------------------------
  _state(h = this._hour) {
    const hh = ((h % DAY_HOURS) + DAY_HOURS) % DAY_HOURS;
    const i0 = Math.floor(hh * (TBL_N / DAY_HOURS));
    const i1 = (i0 + 1) % TBL_N;
    const t = hh * (TBL_N / DAY_HOURS) - i0;
    const land = TBL.land[i0] + (TBL.land[i1] - TBL.land[i0]) * t;
    const sea = TBL.sea[i0] + (TBL.sea[i1] - TBL.sea[i0]) * t;
    const u = (hh - RISE) / SPAN;
    const s = (u <= 0 || u >= 1) ? 0 : Math.sin(Math.PI * u);
    return { s, land, sea, hh };
  }

  // The wind, from `land - sea` and nothing else: its sign picks the direction, its size picks
  // the length and how far the arrow has tipped up off the horizontal.
  _wind() {
    const { land, sea } = this._state();
    const d = land - sea;
    const live = Math.abs(d) > CROSS;
    const tilt = (1 - smooth(Math.min(1, Math.abs(d) / TILT_W))) * (Math.PI / 2);
    const len = LEN_MIN + LEN_SPAN * (1 - Math.exp(-Math.abs(d) / 3));
    const s = d >= 0 ? -1 : 1;                                   // left while the land is warmer
    return { d, live, len, dir: { x: s * Math.cos(tilt), y: -Math.sin(tilt) }, warmLand: d >= 0 };
  }

  update(d) {
    this._t += d;
    if (this._going) {
      this._hour = (this._hour + d * H_PER_S) % DAY_HOURS;
      this._watchTurn();
    }
    // the loop's speed is signed by d and dies to zero at the crossing, so it slows, stops and
    // sets off the other way rather than snapping round
    const dd = this._wind().d;
    if (!reducedMotion()) this._phase += d * Math.sign(dd) * 0.13 * (1 - Math.exp(-Math.abs(dd) / 2.2));
    if (this._pulse > 0) this._pulse = Math.max(0, this._pulse - d / 0.8);
    if (this._push >= 0) { this._push += d; if (this._push > PUSH_END) this._push = -1; }
    this._clockAge += d;
    if (this._clockAge > 0.5) { this._clockTxt = this._clockText(this._hour); this._clockAge = 0; }
  }

  busy() { return this._going || this._pulse > 0 || this._push >= 0; }

  // The beat's finding: a run that has actually finished turning round, once per beat, and only
  // while the cycle is running. No label - the turn itself is the evidence, and the camera leans
  // in on it.
  _watchTurn() {
    // _lastD holds the last LIVE reading, so the dead window between the two signs is stepped
    // over rather than blocking the comparison
    const now = this._wind().d;
    if (Math.abs(now) <= CROSS) return;
    if (this._armed && this._lastD !== undefined && Math.abs(this._lastD) > CROSS
      && Math.sign(now) !== Math.sign(this._lastD)) {
      this._pulse = 1;
      this._armed = false;
      if (!reducedMotion()) this._push = 0;
    }
    this._lastD = now;
  }

  _clockText(h) {
    const q = Math.round(h * 2) / 2;                            // held at half-hours, not per frame
    const hh = Math.floor(q) % 24;
    return `${String(hh).padStart(2, '0')}:${q - Math.floor(q) ? '30' : '00'}`;
  }

  // The payoff camera: ease in, hold on the turned arrow, glide back out.
  _cam() {
    if (this._push < 0) return null;
    const p = this._push;
    const e = p < PUSH_IN ? sine(p / PUSH_IN) : p < PUSH_IN + PUSH_HOLD ? 1 : 1 - sine((p - PUSH_IN - PUSH_HOLD) / PUSH_OUT);
    return pushTo(null, 344, TH_Y + TH_H + 11, PUSH_Z, e, 0);   // the thermometer bulbs hold still; the sky gives way
  }

  // --- drawing (rich) --------------------------------------------------------------------
  draw(ctx, c) {
    const dark = luma(c.bgDeep) < 0.5;
    const st = this._state();
    const w = this._wind();
    const t = reducedMotion() ? 0 : this._t;
    const dayK = smooth(Math.min(1, st.s * 2.2));               // 0 night .. 1 full day, from the clock
    const dusk = Math.max(gauss(st.hh - RISE, 0.9), gauss(st.hh - RISE - SPAN, 1.0), gauss(st.hh - RISE - SPAN + 24, 1.0));
    const wx = w.live ? -Math.sign(w.d) * Math.pow(clamp01(Math.abs(w.d) / 3), 0.6) : 0;   // the breeze, -1 left .. +1 right
    // the light: every object colour passes through lit(), so the night is one consistent
    // moonlit grade (the same in both themes: the coast is a picture, not chrome)
    const nightInk = darken(mix(c.s5, c.s1, 0.45), 0.7);
    const nk = (1 - dayK) * 0.6;
    const lit = (col) => mix(col, nightInk, nk);
    const L = { dark, st, w, t, dayK, dusk, wx, lit, nk };
    const cam = this._cam();

    const sky = this._skyCols(c, L);
    L.sky = sky;
    layer(ctx, cam, 0.3, () => this._sky(ctx, c, L, sky));
    layer(ctx, cam, 0.6, () => this._hills(ctx, c, L, sky, 0));
    layer(ctx, cam, 0.8, () => this._hills(ctx, c, L, sky, 1));
    withCamera(ctx, cam, () => {
      this._ground(ctx, c, L);
      this._seaPlane(ctx, c, L);
      this._beam(ctx, c, L);
      this._shimmer(ctx, c, L);
      this._palm(ctx, c, L, PALM2_X, GROUND_Y + 10, 0.8, 2);
      this._hut(ctx, c, L, HUT_X, GROUND_Y + 14, 1.35);
      this._palm(ctx, c, L, PALM1_X, GROUND_Y + 34, 1.15, 0);
      this._boat(ctx, c, L);
      this._pressure(ctx, c, w);
      this._airLoop(ctx, c, L);
      this._streaks(ctx, c, L);
      this._arrow(ctx, c, w);
      this._pulseRing(ctx, c);
      this._thermoPost(ctx, c, L);
      this._thermoBuoy(ctx, c, L);
    });
    layer(ctx, cam, 1.12, () => this._fore(ctx, c, L));
    drawVignette(ctx, c, dark ? 0.8 : 0.4);
    this._labels(ctx, c, L, cam);
    this._topBand(ctx, c, st);
    this._hint(ctx, c);
  }

  // Sky colours from the series tokens, not from the theme backdrop, so a light-theme night is
  // as deep and as blue as a dark-theme one.
  _skyCols(c, L) {
    const dim = L.dark ? 0.22 : 0.04;
    const dayTop = darken(mix(c.s1, c.water, 0.45), dim + 0.12), dayLow = darken(lighten(mix(c.s1, c.glass, 0.55), 0.42), dim * 0.4);
    const nightTop = darken(mix(c.s5, c.s1, 0.4), 0.8), nightLow = darken(mix(c.s5, c.s1, 0.62), 0.5);
    const top = mix(nightTop, dayTop, L.dayK);
    let low = mix(nightLow, dayLow, L.dayK);
    low = mix(low, mix(c.flame, c.s4, 0.3), 0.6 * L.dusk);       // the low sky warms at the turn of the light
    const mid = mix(mix(top, low, 0.5), darken(mix(c.s5, c.s4, 0.4), 0.35), 0.35 * L.dusk);
    return { top, low, mid };
  }

  // Far layer: the sky, the stars, the moon. No sun disc: the light is a clock.
  _sky(ctx, c, L, sky) {
    const g = ctx.createLinearGradient(0, -60, 0, GROUND_Y + 10);
    g.addColorStop(0, sky.top); g.addColorStop(0.6, sky.mid); g.addColorStop(1, sky.low);
    ctx.fillStyle = g;
    ctx.fillRect(-120, -80, 920, GROUND_Y + 100);
    const nightA = clamp01(1 - L.dayK / 0.8);
    if (nightA > 0.01) {
      for (let i = 0; i < 80; i++) {
        const x = -40 + hash2(i, 1) * 760, y = -20 + hash2(i, 2) * (GROUND_Y - 120);
        const tw = 0.55 + 0.45 * Math.sin(L.t * (0.8 + hash2(i, 3) * 2.2) + i * 1.7);
        const r = 0.7 + hash2(i, 4) * 1.4;
        const fade = 1 - clamp01((y - (GROUND_Y - 200)) / 160);  // stars thin out into the horizon glow
        ctx.fillStyle = alpha(lighten(c.glass, 1), nightA * 0.85 * tw * fade);
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        if (r > 1.8) {
          ctx.strokeStyle = alpha(lighten(c.glass, 1), nightA * 0.35 * tw * fade); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
        }
      }
      // the moon: a fixed lamp for the night, it does not travel (no sky-angle lesson here)
      const mx = MOON_X, my = 84, mr = 17;
      const halo = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 6);
      halo.addColorStop(0, alpha(lighten(c.glass, 0.6), 0.35 * nightA)); halo.addColorStop(1, alpha(c.glass, 0));
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(mx, my, mr * 6, 0, TAU); ctx.fill();
      const mg = ctx.createRadialGradient(mx - 5, my - 5, 2, mx, my, mr);
      mg.addColorStop(0, alpha(lighten(c.glass, 1), nightA)); mg.addColorStop(1, alpha(lighten(c.glass, 0.65), nightA));
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
      ctx.fillStyle = alpha(mix(c.glass, c.s5, 0.35), 0.35 * nightA);
      for (const [dx, dy, r] of [[-5, -3, 4], [5, 5, 3], [3, -8, 2]]) { ctx.beginPath(); ctx.arc(mx + dx, my + dy, r, 0, TAU); ctx.fill(); }
    }
    // a soft glow low in the sky at the turn of the light (no disc, no beam)
    if (L.dusk > 0.02) {
      const gg = ctx.createRadialGradient(340, GROUND_Y + 30, 20, 340, GROUND_Y + 30, 360);
      gg.addColorStop(0, alpha(mix(c.flame, c.gold, 0.45), 0.45 * L.dusk)); gg.addColorStop(0.5, alpha(c.flame, 0.12 * L.dusk)); gg.addColorStop(1, alpha(c.flame, 0));
      ctx.fillStyle = gg; ctx.fillRect(-120, 0, 920, GROUND_Y + 10);
    }
  }

  // Hills behind the coast, fading into the sky with distance (atmospheric perspective).
  _hills(ctx, c, L, sky, near) {
    const base = near ? mix(mix(c.s3, c.s7, 0.25), c.bgDeep, 0.3) : mix(mix(c.s3, c.s1, 0.5), c.bgDeep, 0.15);
    const fog = near ? 0.45 : 0.7;
    const col = mix(L.lit(base), sky.low, fog);
    const h0 = near ? 40 : 74, x1 = near ? COAST_X - 20 : COAST_X + 130;
    const g = ctx.createLinearGradient(0, GROUND_Y - h0, 0, GROUND_Y);
    g.addColorStop(0, col); g.addColorStop(1, mix(col, sky.low, 0.5));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-120, GROUND_Y + 2);
    for (let x = -120; x <= x1; x += 8) {
      const k = clamp01((x1 - x) / 140);                        // the range slopes down to the shore
      const y = GROUND_Y - k * (h0 * 0.6 + h0 * 0.25 * Math.sin(x * (near ? 0.021 : 0.012) + near * 2)
        + h0 * 0.15 * Math.sin(x * (near ? 0.057 : 0.035) + 1.3));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x1 + 20, GROUND_Y + 2); ctx.closePath(); ctx.fill();
    if (near) {
      // a hazy tree line along the far edge of the land
      ctx.fillStyle = mix(col, darken(col, 0.2), 0.5);
      for (let i = 0; i < 26; i++) {
        const x = -110 + i * 17 + hash2(i, 81) * 8;
        if (x > COAST_X - 30) break;
        const r = 6 + hash2(i, 82) * 6;
        ctx.beginPath(); ctx.arc(x, GROUND_Y - r * 0.6, r, 0, TAU); ctx.fill();
      }
    } else {
      // a low island far out to sea, almost lost in the haze
      ctx.fillStyle = mix(col, sky.low, 0.35);
      ctx.beginPath(); ctx.moveTo(560, GROUND_Y + 2); ctx.quadraticCurveTo(620, GROUND_Y - 20, 700, GROUND_Y - 6); ctx.lineTo(780, GROUND_Y + 2); ctx.closePath(); ctx.fill();
    }
    const hz = ctx.createLinearGradient(0, GROUND_Y - 46, 0, GROUND_Y + 2);
    hz.addColorStop(0, alpha(sky.low, 0)); hz.addColorStop(1, alpha(lighten(sky.low, 0.08), near ? 0.35 : 0.5));
    ctx.fillStyle = hz; ctx.fillRect(-120, GROUND_Y - 46, 920, 48);
  }

  // The land, seen running away to the horizon: fields fading into haze, a beach along the
  // shore. The land's warmth is a glow on it by day; at night the grade cools it.
  _ground(ctx, c, L) {
    const { lit, st, sky } = L;
    const near = lit(darken(mix(c.s3, c.s8, 0.18), 0.28)), far = mix(lit(mix(c.s3, c.s1, 0.2)), sky.low, 0.45);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-120, GROUND_Y);
    for (let y = GROUND_Y; y <= 640; y += 6) ctx.lineTo(coastX(y) - beachW(y), y);
    ctx.lineTo(-120, 640); ctx.closePath();
    const g = ctx.createLinearGradient(0, GROUND_Y, 0, 520);
    g.addColorStop(0, far); g.addColorStop(0.35, mix(far, near, 0.6)); g.addColorStop(1, near);
    ctx.fillStyle = g; ctx.fill();
    ctx.clip();
    // field strips, closer together near the horizon
    for (let i = 0; i < 9; i++) {
      const y = GROUND_Y + Math.pow((i + 1) / 9, 1.7) * 190;
      ctx.fillStyle = alpha(i % 2 ? lighten(near, 0.12) : darken(near, 0.15), 0.35);
      ctx.beginPath(); ctx.moveTo(-120, y);
      for (let x = -120; x <= 500; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * (1 + i * 0.8));
      ctx.lineTo(500, y + 3 + i * 2.2); ctx.lineTo(-120, y + 3 + i * 2.2); ctx.closePath(); ctx.fill();
    }
    // bushes, larger toward the viewer
    // shrubs: lumpy clumps with a shadow, lit from above, larger toward the viewer
    for (let i = 0; i < 12; i++) {
      const v = Math.pow(hash2(i, 91), 1.3);
      const y = GROUND_Y + 8 + v * 120, x = -10 + hash2(i, 92) * (coastX(y) - beachW(y) - 20);
      if (Math.abs(y - ARROW_Y) < 26 && Math.abs(x - ARROW_X) < 120) continue;
      const r = 4 + v * 9;
      ctx.fillStyle = alpha(darken(near, 0.55), 0.45);
      ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.15, r * 1.8, r * 0.35, 0, 0, TAU); ctx.fill();
      const sh = darken(mix(near, c.s7, 0.15), 0.12);
      for (const [dx, dy, rk] of [[-0.8, -0.5, 0.75], [0.7, -0.45, 0.7], [0, -0.95, 0.85]]) {
        const bg = ctx.createRadialGradient(x + dx * r - rk * r * 0.3, y + dy * r - rk * r * 0.4, 1, x + dx * r, y + dy * r, rk * r);
        bg.addColorStop(0, lighten(sh, 0.25)); bg.addColorStop(1, darken(sh, 0.3));
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rk * r, 0, TAU); ctx.fill();
      }
    }
    // the land's heat, held at its surface: a warm wash by day
    const heat = clamp01(st.land / 16);
    if (heat > 0.02) {
      const hg = ctx.createLinearGradient(0, GROUND_Y, 0, 520);
      hg.addColorStop(0, alpha(mix(c.flame, c.gold, 0.35), 0.4 * heat)); hg.addColorStop(1, alpha(c.flame, 0.12 * heat));
      ctx.fillStyle = hg; ctx.fillRect(-120, GROUND_Y, 700, 300);
    }
    ctx.restore();
    // the beach
    const sand = lit(mix(c.s2, c.label, 0.3));
    ctx.beginPath(); ctx.moveTo(coastX(GROUND_Y) - beachW(GROUND_Y), GROUND_Y);
    for (let y = GROUND_Y; y <= 640; y += 6) ctx.lineTo(coastX(y) - beachW(y), y);
    for (let y = 640; y >= GROUND_Y; y -= 6) ctx.lineTo(coastX(y) + 2, y);
    ctx.closePath();
    const sg = ctx.createLinearGradient(0, GROUND_Y, 0, 520);
    sg.addColorStop(0, mix(sand, sky.low, 0.35)); sg.addColorStop(1, darken(sand, 0.08));
    ctx.fillStyle = sg; ctx.fill();
    // a wet band where the waves reach
    ctx.strokeStyle = alpha(darken(sand, 0.25), 0.5);
    ctx.lineWidth = 5; ctx.beginPath();
    for (let y = GROUND_Y + 4; y <= 640; y += 6) { const x = coastX(y) - 3 - (y - GROUND_Y) * 0.03; y === GROUND_Y + 4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  }

  _seaPlane(ctx, c, L) {
    const { lit, st, t, wx, dayK, sky } = L;
    const top = lit(mix(c.water, c.s1, 0.35)), deep = darken(lit(mix(c.water, c.s1, 0.5)), 0.42);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(coastX(GROUND_Y), GROUND_Y);
    for (let y = GROUND_Y; y <= 640; y += 6) ctx.lineTo(coastX(y), y);
    ctx.lineTo(820, 640); ctx.lineTo(820, GROUND_Y); ctx.closePath();
    const g = ctx.createLinearGradient(0, GROUND_Y, 0, 520);
    g.addColorStop(0, mix(top, sky.low, 0.5)); g.addColorStop(0.25, top); g.addColorStop(1, deep);
    ctx.fillStyle = g; ctx.fill();
    ctx.clip();
    // the sea's heat, held at its surface: it lingers into the night
    const heat = clamp01(st.sea / 7);
    ctx.fillStyle = alpha(mix(c.flame, c.s4, 0.3), 0.16 * heat);
    ctx.fillRect(COAST_X - 40, GROUND_Y, 500, 300);
    // swell lines, wider apart and stronger toward the viewer, drifting with the breeze
    for (let i = 0; i < 11; i++) {
      const v = (i + 0.5) / 11, y0 = GROUND_Y + 3 + Math.pow(v, 1.8) * 180;
      const amp = 0.8 + v * 3.5, wl = 8 + v * 22;
      ctx.strokeStyle = alpha(lighten(top, 0.6), 0.25 + v * 0.45); ctx.lineWidth = 1 + v * 1.8;
      ctx.beginPath();
      const xs = coastX(y0) + 4;
      for (let x = xs; x <= 800; x += 5) {
        const y = y0 + Math.sin((x - t * (10 + v * 16) * (0.35 + wx) + i * 37) / wl) * amp;
        x === xs ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // the moon's road on the water at night
    const nightA = clamp01(1 - dayK / 0.8);
    if (nightA > 0.02) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 40; i++) {
        const v = Math.pow(hash2(i, 41), 1.3), y = GROUND_Y + 4 + v * 170;
        const spread = 4 + v * 60;
        const x = MOON_X + (hash2(i, 42) - 0.5) * spread * 2;
        const a = nightA * (0.35 + 0.45 * Math.sin(t * 2.2 + i * 1.9)) * (1 - v * 0.6);
        ctx.strokeStyle = alpha(lighten(c.glass, 0.9), Math.max(0, a)); ctx.lineWidth = 1.5 + v * 2;
        const len = 4 + v * 14;
        ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x + len, y); ctx.stroke();
      }
      ctx.lineCap = 'butt';
    }
    if (dayK > 0.05) {
      for (let i = 0; i < 24; i++) {
        const v = hash2(i, 52), y = GROUND_Y + 6 + v * v * 160, x = coastX(y) + 20 + hash2(i, 51) * 360;
        const a = dayK * Math.max(0, Math.sin(t * 1.8 + i * 2.3)) * 0.85;
        ctx.fillStyle = alpha(lighten(c.glass, 1), a);
        ctx.beginPath(); ctx.ellipse(x, y, 3 + v * 5, 1 + v, 0, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
    // surf along the shore
    ctx.strokeStyle = alpha(lighten(c.glass, 0.9), 0.75); ctx.lineCap = 'round';
    for (let k = 0; k < 2; k++) {
      const off = 3 + k * 9 + Math.sin(t * 1.1 + k * 2) * 3;
      ctx.lineWidth = 2.5 - k;
      ctx.beginPath();
      for (let y = GROUND_Y + 2; y <= 600; y += 6) { const x = coastX(y) + off * (0.4 + (y - GROUND_Y) / 160); y === GROUND_Y + 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  _palm(ctx, c, L, x, base, s, seed) {
    const { lit, wx, t } = L;
    const h = 156 * s;
    const sway = Math.sin(t * 1.3 + seed) * (0.5 + Math.abs(wx)) * 2;
    const tx = x + 24 * s + wx * 16 * s + sway, ty = base - h;
    const trunk = lit(mix(c.s8, c.waste, 0.5));
    ctx.fillStyle = alpha(darken(nightOr(c), 0.4), 0.25);
    ctx.beginPath(); ctx.ellipse(x + 6 * s, base + 2, 22 * s, 4 * s, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 16; i++) {
      const u = i / 16, u1 = (i + 1) / 16;
      const px = (q) => x + (tx - x) * q * q + 8 * s * (1 - q) * q, py = (q) => base - h * q;
      const r = (8 - 3.5 * u) * s;
      const tg = ctx.createLinearGradient(px(u) - r, 0, px(u) + r, 0);
      tg.addColorStop(0, darken(trunk, 0.35)); tg.addColorStop(0.45, lighten(trunk, 0.12)); tg.addColorStop(1, darken(trunk, 0.25));
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.moveTo(px(u) - r, py(u)); ctx.lineTo(px(u1) - r * 0.92, py(u1) - 1); ctx.lineTo(px(u1) + r * 0.92, py(u1) - 1); ctx.lineTo(px(u) + r, py(u)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = alpha(darken(trunk, 0.5), 0.55); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px(u1) - r * 0.9, py(u1)); ctx.quadraticCurveTo(px(u1), py(u1) + 2.5, px(u1) + r * 0.9, py(u1)); ctx.stroke();
    }
    const leaf = lit(mix(mix(c.s3, c.s7, 0.15), c.bgDeep, 0.25));
    for (const i of [0, 6, 1, 5, 2, 4, 3]) {
      const a0 = -Math.PI / 2 + (i - 3) * 0.52;
      const a = a0 + wx * 0.45 * (1 - Math.abs(Math.sin(a0)) * 0.3) + Math.sin(t * 1.7 + i + seed) * 0.05 * (1 + Math.abs(wx));
      const Lf = (60 + (i % 2) * 12) * s;
      const ex = tx + Math.cos(a) * Lf, ey = ty + Math.sin(a) * Lf * 0.55 + Lf * 0.42;
      const cx = tx + Math.cos(a) * Lf * 0.55, cy = ty + Math.sin(a) * Lf * 0.55 - 16 * s;
      const nx = -(ey - ty), ny = ex - tx, nl = Math.hypot(nx, ny) || 1;
      const wd = 9 * s;
      const col = i % 2 ? leaf : lighten(leaf, 0.1);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(cx + nx / nl * wd, cy + ny / nl * wd, ex, ey);
      ctx.quadraticCurveTo(cx - nx / nl * wd * 0.4, cy - ny / nl * wd * 0.4, tx, ty);
      ctx.fill();
      ctx.strokeStyle = alpha(darken(col, 0.4), 0.55); ctx.lineWidth = 1.2;
      for (let k = 1; k < 7; k++) {
        const q = k / 7, bx = (1 - q) * (1 - q) * tx + 2 * (1 - q) * q * cx + q * q * ex, by = (1 - q) * (1 - q) * ty + 2 * (1 - q) * q * cy + q * q * ey;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + nx / nl * wd * (1 - q) * 0.9, by + ny / nl * wd * (1 - q) * 0.9 + 3); ctx.stroke();
      }
      ctx.strokeStyle = alpha(lighten(col, 0.4), 0.7); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
    }
    ctx.fillStyle = darken(trunk, 0.3);
    for (const [dx, dy] of [[-4, 4], [4, 5], [0, 7]]) { ctx.beginPath(); ctx.arc(tx + dx * s, ty + dy * s, 4 * s, 0, TAU); ctx.fill(); }
  }

  // A fisher's hut: thatch, a chimney whose smoke the breeze carries, a window that lights at dusk.
  _hut(ctx, c, L, x, by, s) {
    const { lit, t, wx, dayK } = L;
    const wall = lit(mix(c.s2, c.label, 0.35)), roof = lit(mix(c.s2, c.s8, 0.55)), wood = lit(mix(c.s8, c.waste, 0.55));
    // smoke, drawn in world units so the breeze reads at the same size as everywhere else
    const chx = x + 13 * s, chy = by - 50 * s;
    for (let i = 0; i < 10; i++) {
      const a = ((t * 0.22 + i / 10) % 1);
      const px = chx + wx * a * 110 + Math.sin(a * 6 + i) * 4 * (1 - Math.abs(wx) * 0.6);
      const py = chy - a * (80 - Math.abs(wx) * 36);
      const r = 4 + a * 15;
      ctx.fillStyle = alpha(lit(lighten(mix(c.glass, c.waste, 0.45), 0.35)), 0.45 * (1 - a) * Math.min(1, a * 6));
      ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
    }
    ctx.save(); ctx.translate(x, by); ctx.scale(s, s);
    ctx.fillStyle = alpha(darken(nightOr(c), 0.4), 0.25);
    ctx.beginPath(); ctx.ellipse(4, 1, 44, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = darken(wall, 0.3); ctx.fillRect(9, -52, 8, 20);
    ctx.fillStyle = wall; ctx.fillRect(-24, -30, 48, 30);
    ctx.fillStyle = alpha(darken(wall, 0.35), 0.5); ctx.fillRect(-24, -30, 48, 5);
    const rg = ctx.createLinearGradient(0, -58, 0, -26);
    rg.addColorStop(0, lighten(roof, 0.15)); rg.addColorStop(1, darken(roof, 0.2));
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.moveTo(-34, -26); ctx.quadraticCurveTo(-10, -50, 0, -60); ctx.quadraticCurveTo(10, -50, 34, -26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = alpha(darken(roof, 0.4), 0.5); ctx.lineWidth = 1.2;
    for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(k * 3, -56 + Math.abs(k)); ctx.lineTo(k * 10, -27); ctx.stroke(); }
    ctx.fillStyle = darken(wall, 0.55); rr(ctx, -17, -20, 10, 20, 2); ctx.fill();
    const lamp = clamp01(1 - dayK * 1.6);
    ctx.fillStyle = mix(darken(wall, 0.45), lighten(c.gold, 0.35), lamp);
    rr(ctx, 2, -22, 13, 10, 1.5); ctx.fill();
    ctx.restore();
    if (lamp > 0.02) {
      const gx = x + 8 * s, gy = by - 17 * s;
      const gl = ctx.createRadialGradient(gx, gy, 0, gx, gy, 60);
      gl.addColorStop(0, alpha(c.gold, 0.5 * lamp)); gl.addColorStop(1, alpha(c.gold, 0));
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(gx, gy, 60, 0, TAU); ctx.fill();
    }
  }

  // The sailing boat out on the water: sail bellied and pennant streaming downwind.
  _boat(ctx, c, L) {
    const { lit, t, wx } = L;
    const bx = BOAT_X + Math.sin(t * 0.3) * 5, by = GROUND_Y + 16 + Math.sin(t * 1.5) * 1.6;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(t * 1.5 + 0.8) * 0.04); ctx.scale(1.25, 1.25);
    const hull = lit(mix(c.s6, c.s8, 0.45));
    ctx.fillStyle = alpha(darken(hull, 0.5), 0.35);
    ctx.beginPath(); ctx.ellipse(0, 4, 30, 3, 0, 0, TAU); ctx.fill();
    const hg = ctx.createLinearGradient(0, -8, 0, 5);
    hg.addColorStop(0, lighten(hull, 0.12)); hg.addColorStop(1, darken(hull, 0.3));
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(30, -8); ctx.quadraticCurveTo(24, 4, 14, 5); ctx.lineTo(-14, 5); ctx.quadraticCurveTo(-24, 4, -30, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = alpha(lighten(hull, 0.45), 0.8); ctx.fillRect(-28, -8, 56, 2);
    ctx.strokeStyle = lit(mix(c.s8, c.waste, 0.5)); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -60); ctx.stroke();
    const belly = wx * 20;
    const cloth = lit(mix(c.label, c.glass, 0.35));
    const side = wx === 0 ? 1 : Math.sign(wx);
    const sg = ctx.createLinearGradient(-20, 0, 20, 0);
    sg.addColorStop(0, side < 0 ? cloth : darken(cloth, 0.15)); sg.addColorStop(1, side < 0 ? darken(cloth, 0.15) : cloth);
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(side, -57);
    ctx.quadraticCurveTo(side * 4 + belly, -36, side * 2, -12);
    ctx.lineTo(side * (16 + Math.abs(wx) * 4), -12);
    ctx.quadraticCurveTo(side * 10 + belly * 0.8, -34, side, -57); ctx.closePath(); ctx.fill();
    const pk = Math.abs(wx);
    ctx.fillStyle = lit(c.s6);
    ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, -54);
    const pl = 6 + 14 * pk, fl = Math.sin(t * 9) * 2 * (0.3 + pk);
    ctx.lineTo((wx === 0 ? 2 : wx > 0 ? pl : -pl), -58 + fl + (1 - pk) * 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // Foreground, nearest the viewer: a fishing boat pulled up on the sand, rocks, grass tufts.
  _fore(ctx, c, L) {
    const { lit, t, wx } = L;
    // the beached boat, bow up the sand
    const bx = 420, by = 492;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.12);
    const hull = lit(mix(c.s1, c.s7, 0.4)), trim = lit(c.s2), wood = lit(mix(c.s8, c.waste, 0.5));
    ctx.fillStyle = alpha(darken(nightOr(c), 0.5), 0.3);
    ctx.beginPath(); ctx.ellipse(4, 12, 64, 7, 0, 0, TAU); ctx.fill();
    const hg = ctx.createLinearGradient(0, -14, 0, 12);
    hg.addColorStop(0, lighten(hull, 0.15)); hg.addColorStop(1, darken(hull, 0.35));
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.moveTo(-62, -14); ctx.quadraticCurveTo(0, -8, 64, -22); ctx.quadraticCurveTo(52, 10, 20, 12); ctx.lineTo(-44, 12); ctx.quadraticCurveTo(-60, 4, -62, -14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-60, -11); ctx.quadraticCurveTo(0, -5, 62, -19); ctx.stroke();
    ctx.fillStyle = darken(hull, 0.5);
    ctx.beginPath(); ctx.moveTo(-58, -13); ctx.quadraticCurveTo(0, -7, 60, -21); ctx.quadraticCurveTo(0, -12, -58, -13); ctx.fill();
    ctx.strokeStyle = wood; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-20, -12); ctx.lineTo(30, -40); ctx.stroke();
    ctx.fillStyle = wood; ctx.beginPath(); ctx.ellipse(32, -41, 8, 3, -0.5, 0, TAU); ctx.fill();
    ctx.fillStyle = alpha(lit(c.label), 0.85);
    ctx.beginPath(); ctx.arc(40, -10, 3, 0, TAU); ctx.fill();          // an eye painted on the bow
    ctx.restore();
    // rocks in the bottom corners
    const rock = lit(mix(c.waste, c.s5, 0.15));
    for (const [x, y, rx, ry] of [[-14, 512, 46, 26], [30, 520, 30, 18], [700, 506, 48, 30], [652, 522, 30, 16]]) {
      const rg = ctx.createLinearGradient(x - rx, y - ry, x + rx * 0.4, y + ry);
      rg.addColorStop(0, lighten(rock, 0.25)); rg.addColorStop(1, darken(rock, 0.4));
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, Math.PI, TAU); ctx.lineTo(x + rx, y + 20); ctx.lineTo(x - rx, y + 20); ctx.closePath(); ctx.fill();
    }
    // spray on the sea-side rocks
    const sp = 0.5 + 0.5 * Math.sin(t * 1.4);
    ctx.fillStyle = alpha(lighten(c.glass, 0.9), 0.35 + 0.3 * sp);
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(668 + i * 8, 484 - sp * 6 - (i % 2) * 4, 3 + (i % 3), 0, TAU); ctx.fill(); }
    // grass tufts along the bottom of the land
    const grass = lit(darken(mix(c.s3, c.s7, 0.2), 0.3));
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const x = 56 + i * 19 + hash2(i, 95) * 10;
      if (x > 360) break;
      const hgt = 16 + hash2(i, 96) * 18;
      for (let k = -2; k <= 2; k++) {
        const sw = Math.sin(t * 2.6 + i + k) * 1.5;
        ctx.strokeStyle = k % 2 ? grass : lighten(grass, 0.18); ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(x + k * 2, 524);
        ctx.quadraticCurveTo(x + k * 4 + wx * 4, 524 - hgt * 0.6, x + k * 6 + wx * 12 + sw, 524 - hgt);
        ctx.stroke();
      }
    }
    ctx.lineCap = 'butt';
  }

  // Heat shimmer over the sun-baked land: wavering bands that rise, strong only while it is hot.
  _shimmer(ctx, c, L) {
    const k = clamp01((L.st.land - 4) / 10) * L.dayK;
    if (k < 0.02) return;
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const x0 = -10 + hash2(i, 61) * (COAST_X - 60);
      const a = ((L.t * 0.35 + hash2(i, 62)) % 1);
      const y = GROUND_Y + 30 - a * 90;
      ctx.strokeStyle = alpha(lighten(mix(c.gold, c.flame, 0.3), 0.35), 0.4 * k * Math.sin(Math.PI * a));
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 40; x += 3) {
        const yy = y + Math.sin(x * 0.35 + L.t * 4 + i) * 2.2;
        x ? ctx.lineTo(x0 + x, yy) : ctx.moveTo(x0 + x, yy);
      }
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  // L03 only: ONE sunbeam bundle, a single angle, over the land AND the sea alike.
  _beam(ctx, c, L) {
    if (this.beatCount !== 3 || L.st.s <= 0.01) return;
    const k = L.st.s;
    const dx = 120;                                              // one slant for the whole bundle
    for (let i = 0; i < 9; i++) {
      const x = -60 + i * 90, wdt = 34 + (i % 3) * 10;
      const g = ctx.createLinearGradient(0, -40, 0, GROUND_Y + 60);
      g.addColorStop(0, alpha(lighten(c.warning, 0.35), 0.0)); g.addColorStop(0.3, alpha(lighten(c.warning, 0.35), 0.13 * k)); g.addColorStop(1, alpha(c.warning, 0.04 * k));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, -40); ctx.lineTo(x + wdt, -40); ctx.lineTo(x + wdt + dx * 1.25, GROUND_Y + 60); ctx.lineTo(x + dx * 1.25, GROUND_Y + 60); ctx.closePath(); ctx.fill();
    }
  }

  // ONE closed loop of air, drawn as air: drifting streaks and specks along a path, warm over
  // the warmer surface, cool over the cooler. Its bottom leg IS the surface wind, running along
  // the ground and the water. Speed and brightness from |d|; sense from sign(d), via the phase.
  _airLoop(ctx, c, L) {
    const { w } = L;
    const k = 1 - Math.exp(-Math.abs(w.d) / 1.4);
    const warmX = w.d >= 0 ? LX : SX;
    const warm = mix(c.flame, c.gold, 0.3), cool = lighten(mix(c.glass, c.s1, 0.25), 0.2);
    const tint = (x) => mix(cool, warm, clamp01(1.15 - Math.abs(x - warmX) / (SX - LX) * 1.3));
    const sgn = w.d >= 0 ? 1 : -1;
    // a faint guide, hardly there: the eye joins the streaks into a loop
    ctx.setLineDash([2, 9]); ctx.lineCap = 'round';
    for (let i = 0; i < 48; i++) {
      const a = LOOP.at(i / 48), b = LOOP.at((i + 1) / 48);
      ctx.strokeStyle = alpha(tint(a.x), 0.28 * (0.3 + 0.7 * k)); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.setLineDash([]);
    // warm air lifting off the hot surface and cool air settling: soft, thin, translucent wisps
    for (const [x, leftLeg] of [[LX, true], [SX, false]]) {
      const warmHere = leftLeg ? clamp01(0.5 + w.d / 2) : clamp01(0.5 - w.d / 2);
      const col = mix(cool, warm, warmHere);
      for (let i = 0; i < BLOBS; i++) {
        let q = (i / BLOBS + this._phase / LEG / 6) % 1;
        if (q < 0) q += 1;
        const yy = leftLeg ? LOOP_BOT - 10 - q * (LOOP_BOT - LOOP_TOP - 20) : LOOP_TOP + 10 + q * (LOOP_BOT - LOOP_TOP - 20);
        const px = x + Math.sin(yy * 0.05 + i * 1.7) * 8;
        const fade = Math.sin(Math.PI * q) * (0.3 + 0.7 * k);
        const r = 14 + 6 * Math.sin(i * 2.1);
        const g = ctx.createRadialGradient(px, yy, 1, px, yy, r);
        g.addColorStop(0, alpha(lighten(col, 0.3), 0.32 * fade)); g.addColorStop(1, alpha(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(px, yy, r * 0.8, r, 0, 0, TAU); ctx.fill();
      }
    }
    // streaks: thin tapered trails streaming round the loop, a few chevron-ish leads among them
    for (let i = 0; i < MOTES; i++) {
      const u = i / MOTES + hash2(i, 71) * 0.012 + this._phase;
      const off = (hash2(i, 72) - 0.5) * 30;
      const p = LOOP.at(u);
      if (p.y > LOOP_BOT - 4 && Math.abs(p.x - ARROW_X) < w.len / 2 + 14 && Math.abs(off) < 14) continue;   // the arrow owns that spot
      const len = 0.02 + 0.035 * k * (0.6 + hash2(i, 75));
      const steps = 6;
      const col = lighten(tint(p.x), 0.25);
      const a0 = (0.22 + 0.68 * k) * (0.5 + 0.5 * hash2(i, 73));
      ctx.lineWidth = 1.5 + hash2(i, 74) * 1.7;
      let prev = null;
      for (let s = 0; s <= steps; s++) {
        const q = LOOP.at(u - sgn * len * (s / steps));
        const pt = [q.x - q.ty * off, q.y + q.tx * off];
        if (prev) {
          ctx.strokeStyle = alpha(col, a0 * (1 - s / steps));
          ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke();
        }
        prev = pt;
      }
      ctx.fillStyle = alpha(lighten(col, 0.3), a0);
      ctx.beginPath(); ctx.arc(p.x - p.ty * off, p.y + p.tx * off, ctx.lineWidth * 0.7, 0, TAU); ctx.fill();
    }
    ctx.lineCap = 'butt';
  }

  // ONE continuous pressure surface, dipping over the warmer column and doming over the cooler
  // one by an amount proportional to land - sea, so it is flat exactly when the wind is dead.
  _pressureY(w) {
    const k = Math.sign(w.d) * (1 - Math.exp(-Math.abs(w.d) / 1.6));
    return (x) => PY - DIP * k * (bump(x, LX, P_W) - bump(x, SX, P_W));
  }

  _pressure(ctx, c, w) {
    const y = this._pressureY(w);
    const line = () => { ctx.beginPath(); for (let x = -120; x <= 800; x += 4) (x > -120 ? ctx.lineTo(x, y(x)) : ctx.moveTo(x, y(x))); };
    ctx.lineJoin = 'round';
    ctx.strokeStyle = alpha(darken(nightOr(c), 0.5), 0.2); ctx.lineWidth = 8; line(); ctx.stroke();
    ctx.strokeStyle = alpha(lighten(c.glass, 0.85), 0.8); ctx.lineWidth = 2.2;
    ctx.setLineDash([10, 7]); line(); ctx.stroke(); ctx.setLineDash([]);
    const show = clamp01((Math.abs(w.d) - 0.15) / 0.6);           // a flat surface has no low and no high
    if (show <= 0.01) return;
    ctx.save(); ctx.globalAlpha = show;
    for (const [x, low] of [[LX, w.warmLand], [SX, !w.warmLand]]) {
      const col = low ? c.warning : c.good;
      const yy = y(x);
      ctx.fillStyle = alpha(darken(nightOr(c), 0.5), 0.4);
      ctx.beginPath(); ctx.arc(x + 1.5, yy + 2.5, 9, 0, TAU); ctx.fill();
      const g = ctx.createRadialGradient(x - 3, yy - 3, 1, x, yy, 9);
      g.addColorStop(0, lighten(col, 0.5)); g.addColorStop(1, darken(col, 0.15));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, yy, 9, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // Haze streaks skimming the surface in the wind's direction; none when the wind is dead.
  _streaks(ctx, c, L) {
    const { w, t } = L;
    if (!w.live) return;
    const k = Math.min(1, Math.abs(w.d) / 5);
    const n = Math.round(5 + 8 * k);
    const sgn = w.d >= 0 ? -1 : 1;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const u = ((hash2(i, 11) + t * (0.08 + 0.14 * k) * (0.6 + hash2(i, 12))) % 1);
      const x = sgn < 0 ? 700 - u * 720 : -20 + u * 720;
      const y = GROUND_Y + 6 + hash2(i, 13) * 56;
      const len = 26 + hash2(i, 14) * 34 * (0.5 + k);
      const g = ctx.createLinearGradient(x, 0, x - sgn * len, 0);
      g.addColorStop(0, alpha(lighten(c.glass, 0.9), 0.5 * Math.sin(Math.PI * u))); g.addColorStop(1, alpha(c.glass, 0));
      ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - sgn * len, y); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  // The object the slide is about: one arrow, one live angle, lying along the surface.
  _arrow(ctx, c, w) {
    const ang = Math.atan2(w.dir.y, w.dir.x);
    const col = w.live ? c.accent : mix(c.accent, c.raised, 0.55);
    ctx.save();
    ctx.translate(ARROW_X, ARROW_Y);
    ctx.rotate(ang);
    const L = w.len, hw = 9, head = 26;
    const shape = () => {
      ctx.beginPath();
      ctx.moveTo(-L / 2, -hw); ctx.lineTo(L / 2 - head, -hw); ctx.lineTo(L / 2 - head, -hw - 10);
      ctx.lineTo(L / 2, 0); ctx.lineTo(L / 2 - head, hw + 10); ctx.lineTo(L / 2 - head, hw); ctx.lineTo(-L / 2, hw);
      ctx.quadraticCurveTo(-L / 2 - 6, 0, -L / 2, -hw); ctx.closePath();
    };
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, L * 0.7);
    glow.addColorStop(0, alpha(lighten(col, 0.4), 0.28)); glow.addColorStop(1, alpha(col, 0));
    ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(0, 0, L * 0.7, 34, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(3, 6); ctx.fillStyle = alpha(darken(nightOr(c), 0.6), 0.4); shape(); ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(0, -hw - 10, 0, hw + 10);
    g.addColorStop(0, lighten(col, 0.5)); g.addColorStop(0.5, col); g.addColorStop(1, darken(col, 0.35));
    ctx.fillStyle = g; shape(); ctx.fill();
    ctx.strokeStyle = alpha(darken(col, 0.5), 0.6); ctx.lineWidth = 1.5; shape(); ctx.stroke();
    ctx.strokeStyle = alpha(lighten(col, 0.85), 0.75); ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-L / 2 + 4, -hw + 2.5); ctx.lineTo(L / 2 - head, -hw + 2.5); ctx.stroke();
    ctx.restore();
  }

  _pulseRing(ctx, c) {
    if (this._pulse <= 0) return;
    const u = 1 - this._pulse;
    for (const [lag, wdt] of [[0, 4], [0.18, 2.5]]) {
      const q = clamp01((u - lag) / (1 - lag));
      if (q <= 0) continue;
      ctx.strokeStyle = alpha(c.gold, (1 - q) * 0.9);
      ctx.lineWidth = wdt;
      ctx.beginPath(); ctx.arc(ARROW_X, ARROW_Y, 20 + q * 80, 0, TAU); ctx.stroke();
    }
  }

  // Two identical instruments on one shared scale: one on a post on the land, one on a buoy at
  // sea. Their tubes stand at the same height, so the higher column is the warmer surface.
  _thermoPost(ctx, c, L) {
    const x = T_LAND_X, foot = TH_Y + TH_H + 40;
    const wood = L.lit(mix(c.s8, c.waste, 0.5));
    ctx.fillStyle = alpha(darken(nightOr(c), 0.5), 0.3);
    ctx.beginPath(); ctx.ellipse(x + 3, foot + 1, 16, 3.5, 0, 0, TAU); ctx.fill();
    const pg = ctx.createLinearGradient(x - 5, 0, x + 5, 0);
    pg.addColorStop(0, darken(wood, 0.3)); pg.addColorStop(0.5, lighten(wood, 0.1)); pg.addColorStop(1, darken(wood, 0.35));
    ctx.fillStyle = pg; ctx.fillRect(x - 5, TH_Y + TH_H, 10, 40);
    this._thermo(ctx, c, x, TH_Y, this._state().land, L);
  }

  _thermoBuoy(ctx, c, L) {
    const x = T_SEA_X, bob = Math.sin(L.t * 1.5 + 1.2) * 1.5;
    const y = TH_Y + bob, wl = TH_Y + TH_H + 40;
    const red = L.lit(mix(c.s6, c.flame, 0.2)), white = L.lit(lighten(c.glass, 0.7));
    ctx.fillStyle = alpha(lighten(c.glass, 0.9), 0.4);
    ctx.beginPath(); ctx.ellipse(x, wl + 2, 30, 4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = L.lit(c.waste); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y + TH_H); ctx.lineTo(x, wl - 16 + bob); ctx.stroke();
    const bg = ctx.createLinearGradient(x - 22, 0, x + 22, 0);
    bg.addColorStop(0, darken(red, 0.25)); bg.addColorStop(0.4, lighten(red, 0.15)); bg.addColorStop(1, darken(red, 0.35));
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.moveTo(x - 14, wl - 18 + bob); ctx.lineTo(x + 14, wl - 18 + bob); ctx.lineTo(x + 22, wl + 2 + bob); ctx.lineTo(x - 22, wl + 2 + bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle = white; ctx.fillRect(x - 18, wl - 9 + bob, 36, 5);
    this._thermo(ctx, c, x, y, this._state().sea, L);
  }

  _thermo(ctx, c, x, y0, temp, L) {
    const h = TH_H, k = 1 - Math.exp(-temp / 5);
    ctx.fillStyle = alpha(darken(c.s5, 0.8), 0.78);
    rr(ctx, x - 17, y0 - 10, 34, h + 36, 17); ctx.fill();
    ctx.strokeStyle = alpha(lighten(c.glass, 0.6), 0.35); ctx.lineWidth = 1.2;
    rr(ctx, x - 17, y0 - 10, 34, h + 36, 17); ctx.stroke();
    ctx.fillStyle = alpha(lighten(c.glass, 0.5), 0.3);
    rr(ctx, x - 7, y0, 14, h, 7); ctx.fill();
    ctx.strokeStyle = alpha(lighten(c.glass, 0.9), 0.85); ctx.lineWidth = 1.5;
    rr(ctx, x - 7, y0, 14, h, 7); ctx.stroke();
    ctx.strokeStyle = alpha(lighten(c.glass, 0.9), 0.7); ctx.lineWidth = 1.5;
    for (let i = 1; i < 5; i++) { const yy = y0 + h - 10 - (h - 20) * i / 5; ctx.beginPath(); ctx.moveTo(x + 7, yy); ctx.lineTo(x + 12, yy); ctx.stroke(); }
    const liq = mix(c.s6, c.flame, 0.2);
    const fill = 10 + (h - 20) * k;
    const lg = ctx.createLinearGradient(x - 4, 0, x + 4, 0);
    lg.addColorStop(0, lighten(liq, 0.3)); lg.addColorStop(1, darken(liq, 0.2));
    ctx.fillStyle = lg;
    rr(ctx, x - 3.5, y0 + h - 6 - fill, 7, fill + 4, 3.5); ctx.fill();
    const bg = ctx.createRadialGradient(x - 3, y0 + h + 8, 1, x, y0 + h + 11, 12);
    bg.addColorStop(0, lighten(liq, 0.45)); bg.addColorStop(1, darken(liq, 0.2));
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y0 + h + 11, 12, 0, TAU); ctx.fill();
    ctx.strokeStyle = alpha(lighten(c.glass, 0.9), 0.8); ctx.stroke();
    ctx.fillStyle = alpha(lighten(c.glass, 1), 0.55);
    ctx.fillRect(x - 4.5, y0 + 6, 2, h - 14);
  }

  // Screen-space text, placed through the camera so it never grows with the push.
  _labels(ctx, c, L, cam) {
    const { w } = L;
    if (this.stage === S_HEAT) { this._depth(ctx, c); return; }
    const y = this._pressureY(w);
    const show = clamp01((Math.abs(w.d) - 0.15) / 0.6);
    if (show > 0.01) {
      for (const [x, low] of [[LX, w.warmLand], [SX, !w.warmLand]]) {
        const side = x < COAST_X ? -1 : 1;
        const [sx, sy] = toScreen(cam, x + side * 50, y(x) - 2);
        pill(ctx, c, low ? 'low pressure' : 'high pressure', Math.max(112, Math.min(566, sx)), sy, { bg: low ? c.warning : c.good, size: 28, alpha: show });
      }
    }
    const [tx, ty] = toScreen(cam, ARROW_X, TAG_Y);
    const tag = w.live ? (w.warmLand ? 'sea breeze' : 'land breeze') : 'no wind';
    pill(ctx, c, tag, tx, ty, { bg: w.live ? c.accent : c.raised, ink: w.live ? inkOn(c, c.accent) : c.labelMuted, size: 34, display: true });
    for (const [x, name] of [[T_LAND_X, 'land'], [T_SEA_X, 'sea']]) {
      const [nx, ny] = toScreen(cam, x, TH_Y - 26);
      this._text(ctx, c, name, Math.max(36, Math.min(644, nx)), Math.max(16, ny));
    }
  }

  // Beat 0: how deep the Sun's heat goes. Two cut-away blocks: land hot in a thin top layer, sea warmed
  // a little through a deep layer. Same sunlight, two very different depths.
  _depth(ctx, c) {
    const y0 = 300, h = 190, w = 250;
    const block = (x, top, body, layers, name, say) => {
      drawCutCard(ctx, c, x - 10, y0 - 44, w + 20, h + 56);
      ctx.fillStyle = body; ctx.fillRect(x, y0, w, h);
      layers.forEach(([d0, d1, col]) => { ctx.fillStyle = col; ctx.fillRect(x, y0 + d0 * h, w, (d1 - d0) * h); });
      ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.strokeRect(x, y0, w, h);
      ctx.font = font(c, 800, 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
      ctx.fillText(name, x + w / 2, y0 - 22);
      pill(ctx, c, say, x + w / 2, y0 + h - 30, { bg: c.raised, ink: c.label, size: 26 });
    };
    block(60, 0, mix(c.stroke, c.bgSurface, 0.15), [[0, 0.12, c.bad]], 'Land', 'heat stays on top');
    block(370, 0, mix(c.s1, c.bgDeep, 0.3), [[0, 0.24, mix(c.bad, c.s1, 0.3)], [0.24, 0.5, mix(c.bad, c.s1, 0.55)], [0.5, 0.74, mix(c.bad, c.s1, 0.78)]], 'Sea', 'heat mixes deep');
  }

  _text(ctx, c, s, x, y) {
    ctx.font = font(c, 800, 28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(s).width;
    ctx.fillStyle = alpha(darken(c.s5, 0.82), 0.85);              // always a dark backing: it sits on the scene in both themes
    ctx.beginPath(); ctx.roundRect(x - tw / 2 - 12, y - 20, tw + 24, 40, 20); ctx.fill();
    ctx.fillStyle = lighten(c.glass, 0.9); ctx.fillText(s, x, y + 1);
  }

  // The clock, top left: a little dial whose hand turns with the hour, and the time.
  _topBand(ctx, c, st) {
    const x0 = 16, y = 26;
    const r = pill(ctx, c, this._clockTxt, x0, y, {
      bg: c.raised, ink: c.label, size: 26, align: 'left',
      icon: (g, ix, iy, ir) => {
        g.strokeStyle = c.label; g.lineWidth = 1.8;
        g.beginPath(); g.arc(ix, iy, ir, 0, TAU); g.stroke();
        const a = (st.hh / 12) * TAU - Math.PI / 2;
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(ix, iy); g.lineTo(ix + Math.cos(a) * ir * 0.55, iy + Math.sin(a) * ir * 0.55); g.stroke();
        g.beginPath(); g.moveTo(ix, iy); g.lineTo(ix, iy - ir * 0.75); g.stroke();
        g.lineCap = 'butt';
      },
    });
    // run state as a glyph, not a word: two bars paused, a play triangle running
    const gx = r.x0 + r.w + 18;
    ctx.fillStyle = alpha(darken(c.s5, 0.8), 0.6);
    ctx.beginPath(); ctx.arc(gx, y, 12, 0, TAU); ctx.fill();
    if (this._going) {
      ctx.fillStyle = c.good;
      ctx.beginPath(); ctx.moveTo(gx - 4, y - 6); ctx.lineTo(gx + 6, y); ctx.lineTo(gx - 4, y + 6); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = lighten(c.glass, 0.6);
      ctx.fillRect(gx - 5, y - 6, 3.5, 12); ctx.fillRect(gx + 1.5, y - 6, 3.5, 12);
    }
  }

  _hint(ctx, c) {
    if (this.stage !== S_CYCLE || this._going) return;
    ctx.save();
    ctx.globalAlpha = 1;
    pill(ctx, c, 'Press Run to watch a day', COAST_X + 60, 74, { bg: c.accent, size: 29 });
    ctx.restore();
  }

  _tag(ctx, c, s) {
    ctx.font = font(c, 600, 14);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const nw = ctx.measureText(s).width;
    ctx.fillStyle = alpha(darken(c.s5, 0.8), 0.7);
    ctx.beginPath(); ctx.roundRect(668 - nw - 10, 15, nw + 20, 22, 11); ctx.fill();
    ctx.fillStyle = lighten(c.glass, 0.6);
    ctx.fillText(s, 668, 26);
  }

  // --- input -----------------------------------------------------------------------------
  isControlHidden(id) { return this.stage !== S_CYCLE; }

  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'hour') {
      this._going = false;
      this._hour = Math.max(0, Math.min(DAY_HOURS, Number(v)));
      this._clockTxt = this._clockText(this._hour);
      this._clockAge = 0;
      this._armed = true;
      this._lastD = this._wind().d;
    } else if (id === 'run') {
      this._going = !this._going;
      this._armed = true;
      this._lastD = this._wind().d;
    }
    this.requestUiUpdate?.();
  }

  // Run is the one control that says "try it", so the coast itself works too: a tap on the
  // ground or the arrow starts and stops the cycle (a phone has no button thumb to reach).
  pointerDown(p) {
    if (p.y < COL_TOP || this.stage !== S_CYCLE) return;
    this.onControlChange('run', true);
    this.animateFor(500);
  }

  getControlValue(id) {
    if (id === 'hour') return String(this._hour);
    if (id === 'run') return this._going;
    return super.getControlValue(id);
  }
}

// The shoreline on the ground plane: at the horizon it meets COAST_X, and it sweeps right toward
// the viewer, with a beach on its land side that widens with nearness.
function coastX(y) { const v = Math.max(0, y - GROUND_Y); return COAST_X + 0.0035 * v * v + 0.15 * v; }
function beachW(y) { return 4 + Math.max(0, y - GROUND_Y) * 0.28; }
// A dark that is dark in both themes (shadows, the arrow's drop), from the series, not the backdrop.
function nightOr(c) { return mix(c.s5, c.s1, 0.4); }

function drawCutCard(ctx, c, x, y, w, h) {
  ctx.fillStyle = c.bgSurface ?? c.raised; ctx.strokeStyle = c.stroke; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill(); ctx.stroke();
}
function smooth(x) { return x * x * (3 - 2 * x); }
function sine(x) { const u = clamp01(x); return 0.5 - 0.5 * Math.cos(Math.PI * u); }
function gauss(x, s) { return Math.exp(-(x * x) / (2 * s * s)); }
function mixN(a, b, t) { return a + (b - a) * t; }

// A smooth lobe, used to shape the pressure surface over each column.
function bump(x, cx, w) {
  const t = (x - cx) / w;
  return Math.exp(-t * t);
}
