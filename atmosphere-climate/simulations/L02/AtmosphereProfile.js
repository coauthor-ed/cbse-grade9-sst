/**
 * AtmosphereProfile - the ONE altitude column every L02 scene draws.
 *
 * The stub line for AltitudeClimbScene says the column the learner climbs must be
 * literally the same drawing in AtmosphereLayersScene, TemperatureZigZagScene,
 * ExosphereEscapeScene, PressureColumnScene and TraceTheColumnScene, so all six
 * import this module. It owns:
 *
 *   - the altitude -> pixel mapping (makeAltitudeScale), so no scene grows a second one
 *   - the boundary altitudes as DATA (BOUNDARY_KM), which a scene may or may not draw
 *   - the canonical four-segment temperature polyline (TEMP_KNOTS, temperatureAt)
 *   - the plain altitude axis, the air column and the temperature trace (draw*)
 *
 * It owns NO lesson content and NO pixels: a scene passes its own rect, its own km
 * window and its own colours, and picks how much of the profile to show. This scene's
 * stub is explicit that choosing the visible window is the SCENE's job.
 *
 * ---------------------------------------------------------------------------
 * HOW TO ADD TO THIS FILE (the next L02 scene that needs something new)
 * ---------------------------------------------------------------------------
 * ADD a new export below the marker line. Do not rename, reorder, re-signature or
 * edit anything above it - six scenes already import these names. Prefer a new
 * function that takes an options object over a new parameter on an existing one;
 * if you must extend a signature, add the new key to the existing `o = {}` at the
 * END and default it, so every current caller is unchanged. Colours arrive as `c`
 * from `loadColors`; never hard-code one here either.
 *
 * ---------------------------------------------------------------------------
 * UNITS: km and degrees Celsius throughout. Pixels only ever come out of a scale
 * made by makeAltitudeScale. A scene that wants a different km window builds its own
 * scale; it never hard-codes a px-per-km constant.
 */
import { alpha, lighten, mix, font } from 'simulations/base/kit/SimLook.js';

/**
 * The chapter's boundary altitudes in km, as data. A scene draws only the ones its
 * slide has taught; nothing here is drawn automatically. `labelFor` is deliberately
 * absent - naming the bands is a lesson decision and belongs to the scene.
 */
export const BOUNDARY_KM = [0, 12, 50, 80, 700];

/**
 * The canonical temperature profile: `[km, degC]` knots on the four segments
 * (fall, rise, fall, rise). Piecewise-linear between knots, held constant outside.
 * These are the chapter's numbers, not a re-derived atmosphere: 12 km is the turn
 * the L02 slides name, 50 / 80 km are the later boundaries and 700 km the top of the
 * drawn column. A scene that clips its window (as AltitudeClimbScene does at 30 km)
 * still reads the same curve everywhere else, so two scenes cannot disagree.
 */
export const TEMP_KNOTS = [[0, 15], [12, -56], [50, 0], [80, -85], [700, 1000]];

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/**
 * The temperature in degC at altitude `km` (degrees Celsius, piecewise-linear on
 * TEMP_KNOTS). `km` below the first knot returns the ground value, above the last
 * the top value: a scene's frame is a fragment of the profile, never a re-shape of it.
 */
export function temperatureAt(km) {
  const k = TEMP_KNOTS;
  if (km <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [a, ta] = k[i];
    const [b, tb] = k[i + 1];
    if (km <= b) return ta + (tb - ta) * ((km - a) / (b - a));
  }
  return k[k.length - 1][1];
}

/**
 * The one altitude -> pixel mapping in this lesson.
 *
 *   makeAltitudeScale({ x, groundY, kmTop, topY })
 *
 * `groundY` is the y of 0 km and `topY` the y of `kmTop` (default: ZONES.top's lower
 * edge, i.e. the top of the frame). Everything drawn on the column - the axis, the
 * climber, the trace, every readout - uses the returned `yFor` / `kmFor`, which is
 * what makes "one altitude scale, two things on it" true by construction.
 *
 * Returns `{ kmTop, groundY, pxPerKm, yFor(km), kmFor(y), clampKm(km), span(km) }`.
 */
export function makeAltitudeScale(o) {
  const groundY = o.groundY;
  const kmTop = o.kmTop;
  const topY = o.topY;
  const pxPerKm = (groundY - topY) / kmTop;
  const yFor = (km) => groundY - clamp(km, 0, kmTop) * pxPerKm;
  const kmFor = (y) => clamp((groundY - y) / pxPerKm, 0, kmTop);
  return {
    kmTop,
    groundY,
    pxPerKm,
    yFor,
    kmFor,
    clampKm: (km) => clamp(km, 0, kmTop),
    /** The drawn height of `km`, for a figure or a chip that hangs off it. */
    span: (km) => clamp(km, 0, kmTop) * pxPerKm,
  };
}

/**
 * The plain altitude axis: a rule, ticks, and (only if asked for) km numbers.
 *
 *   drawAltitudeAxis(ctx, c, s, { x, ticks: [0, 10], labels: [0, 10], side: 'left' })
 *
 * Ticks are ordinary marks and stay ordinary: same weight, same length, nothing
 * styled as a boundary. `ticks` and `labels` are separate on purpose - a scene whose
 * slide has not taught an altitude draws the rule and the tick it needs and passes
 * fewer labels than ticks. `side: 'right'` puts ticks and numbers on the other side of
 * the rule, for a column whose left margin is already spoken for. Colour comes from `c`.
 */
export function drawAltitudeAxis(ctx, c, s, o = {}) {
  const x = o.x;
  const topY = o.topY ?? s.groundY - s.span(s.kmTop);
  const col = o.col ?? c.stroke;
  const w = o.width ?? 2;
  const dir = o.side === 'right' ? 1 : -1;

  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, s.groundY);
  ctx.stroke();

  const len = o.tickLen ?? 10;
  ctx.lineWidth = o.tickWidth ?? 2;
  for (const km of o.ticks ?? []) {
    const y = s.yFor(km);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * len, y);
    ctx.stroke();
  }
  // Labels live in their own list so a scene can label fewer altitudes than it ticks.
  for (const km of o.labels ?? []) {
    ctx.fillStyle = o.labelCol ?? c.labelMuted;
    ctx.font = font(c, 600, 12);
    ctx.textAlign = dir < 0 ? 'right' : 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${km} km`, x + dir * (len + 6), s.yFor(km));
  }
}

/**
 * The column of air: one slice of ink per 4 px, alpha off an exponential with height
 * (the same scale-height profile L01's closing strip uses), densest at the ground and
 * gone by the top. No top edge is drawn anywhere - the air simply thins out.
 */
export function drawAirColumn(ctx, c, s, o = {}) {
  const x = o.x;
  const w = o.width;
  const topY = o.topY ?? s.groundY - s.span(s.kmTop);
  const slice = o.slice ?? 4;
  const peak = o.peak ?? 0.85;
  const gamma = o.gamma ?? 0.9;
  const scaleKm = o.scaleKm ?? 8;               // the standard atmospheric scale height
  const ink = lighten(o.col ?? c.water, 0.12);

  for (let y = topY; y < s.groundY; y += slice) {
    const km = s.kmFor(y + slice / 2);
    const a = peak * Math.pow(Math.exp(-km / scaleKm), gamma);
    if (a < 0.004) continue;
    ctx.fillStyle = alpha(ink, a);
    ctx.fillRect(x, y, w, slice);
  }
}

/**
 * The temperature trace: the canonical polyline drawn against altitude, clipped to
 * the scene's own km window.
 *
 *   drawTemperatureTrace(ctx, c, s, { x0, x1, cMin, cMax, kmMax, width, col, dash })
 *
 * The horizontal scale is temperature between `cMin` and `cMax` (degC, inclusive);
 * the vertical scale is `s`, so the trace turns where the column says it does.
 * `kmMax` defaults to the whole scale - a scene short of the top of the frame passes
 * its own and the curve simply ends there, which is a window, not a re-shape.
 */
export function drawTemperatureTrace(ctx, c, s, o = {}) {
  const { x0, x1, cMin, cMax } = o;
  const kmMax = Math.min(o.kmMax ?? s.kmTop, s.kmTop);
  const stepKm = o.stepKm ?? 0.5;
  const w = o.width ?? 3;
  const col = o.col ?? c.accent;
  const xFor = (degC) => x0 + ((clamp(degC, cMin, cMax) - cMin) / (cMax - cMin)) * (x1 - x0);

  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath();
  for (let km = 0; km <= kmMax + 1e-9; km += stepKm) {
    const x = xFor(temperatureAt(km));
    const y = s.yFor(km);
    if (km === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
  return { xFor, yFor: s.yFor, kmMax };
}

/**
 * The same horizontal mapping drawTemperatureTrace uses, exposed for a scene that puts
 * a chip on the curve: returns the x a given temperature lands at.
 */
export function traceXAt(x0, x1, cMin, cMax, degC) {
  return x0 + ((clamp(degC, cMin, cMax) - cMin) / (cMax - cMin)) * (x1 - x0);
}

/** The faint wash behind a trace panel: a vertical tint that reads as "the same air". */
export function drawTracePanel(ctx, c, o) {
  const g = ctx.createLinearGradient(0, o.topY, 0, o.bottomY);
  const top = o.topCol ?? mix(c.bgDeep, c.water, 0.22);
  const bot = o.botCol ?? mix(c.bgDeep, c.water, 0.06);
  g.addColorStop(0, alpha(top, o.topA ?? 0.7));
  g.addColorStop(1, alpha(bot, o.botA ?? 0.35));
  ctx.fillStyle = g;
  ctx.fillRect(o.x, o.topY, o.width, o.bottomY - o.topY);
  // A hairline edge, so the panel is a panel in the light theme too, where a pale wash on a
  // pale backdrop would otherwise be invisible.
  ctx.strokeStyle = alpha(c.stroke, o.edgeA ?? 0.5);
  ctx.lineWidth = 2;
  ctx.strokeRect(o.x + 1, o.topY + 1, o.width - 2, o.bottomY - o.topY - 2);
}

// ---------------------------------------------------------------------------
// Later L02 exports go BELOW this line. Add; do not edit above.
// ---------------------------------------------------------------------------

/**
 * makeBandAltitudeScale - the same interface as makeAltitudeScale, on a BANDED axis.
 *
 *   makeBandAltitudeScale({ groundY, topY, kmTop, shares, kmEdges })
 *
 * A straight 0-700 km axis cannot carry this lesson: on it the 12 km troposphere
 * is 1.7% of the column and the 620 km thermosphere is 89%, so the first three bands
 * collapse into a few pixels and the learner cannot put a parcel inside one. This
 * scale gives each band a chosen share of the drawn height instead, and is
 * piecewise-linear in km BETWEEN the edges, so a turn point and a band boundary are
 * the same y by construction.
 *
 * `kmEdges` defaults to BOUNDARY_KM plus `kmTop` (0, 12, 50, 80, 700, kmTop) and
 * `shares` to one descending run, so a caller that passes neither gets a column
 * whose five bands read top to bottom. Both are DATA: pass your own to change the
 * proportions, never to change an altitude.
 *
 * Returns makeAltitudeScale's shape - `{ kmTop, groundY, pxPerKm, yFor, kmFor,
 * clampKm, span }` - so every draw* above works on it unchanged, plus `kmEdges` and
 * `yEdges` (the same length) so a scene can lay out one rect per band without
 * re-deriving a single boundary.
 */
export function makeBandAltitudeScale(o) {
  const groundY = o.groundY;
  const topY = o.topY;
  const kmTop = o.kmTop ?? 700;
  const kmEdges = o.kmEdges ?? [...BOUNDARY_KM, kmTop];
  const shares = o.shares ?? [0.34, 0.25, 0.18, 0.15, 0.08];
  const total = groundY - topY;

  const yEdges = [groundY];
  for (let i = 0; i < shares.length; i++) yEdges.push(yEdges[i] - shares[i] * total);

  const yFor = (km) => {
    const k = clamp(km, 0, kmTop);
    for (let i = 0; i < kmEdges.length - 1; i++) {
      const a = kmEdges[i], b = kmEdges[i + 1];
      if (k <= b || i === kmEdges.length - 2) {
        const t = b === a ? 0 : (k - a) / (b - a);
        return yEdges[i] + (yEdges[i + 1] - yEdges[i]) * t;
      }
    }
    return yEdges[yEdges.length - 1];
  };
  const kmFor = (y) => {
    for (let i = 0; i < yEdges.length - 1; i++) {
      if (y >= yEdges[i + 1] || i === yEdges.length - 2) {
        const dy = yEdges[i] - yEdges[i + 1];
        const t = dy === 0 ? 0 : (yEdges[i] - y) / dy;
        return clamp(kmEdges[i] + (kmEdges[i + 1] - kmEdges[i]) * t, 0, kmTop);
      }
    }
    return 0;
  };

  return {
    kmTop,
    groundY,
    kmEdges,
    yEdges,
    /** The mean scale of the whole column: honest only as an average, never a constant. */
    pxPerKm: total / kmTop,
    yFor,
    kmFor,
    clampKm: (km) => clamp(km, 0, kmTop),
    span: (km) => groundY - yFor(km),
  };
}

/**
 * drawProfileTrace - the same TEMP_KNOTS polyline as drawTemperatureTrace, on a
 * BROKEN temperature axis, so all four segments are legible at once.
 *
 *   drawProfileTrace(ctx, c, s, { laneX0, laneW, kmMax, width, col, halo })
 *
 * drawTemperatureTrace maps degC to x linearly between `cMin` and `cMax`. Across
 * this profile that fails: the knots run -85 to 1000 degC, so any single linear
 * window either clips the thermosphere's rise to a flat top or squeezes the three
 * lower turns into one pixel. Here the axis is piecewise-linear in degC through
 * BREAKS, which is a broken axis - the honest way to draw 1085 degrees in one lane.
 *
 * The horizontal scale carries NO numbers and no scene labels it, so a broken axis
 * misleads nobody: what the learner reads is the four DIRECTIONS and the four turn
 * points, which are the chapter's and land on 12 / 50 / 80 km exactly. The vertical
 * scale is `s` and is shared with the bands, as everywhere else in this lesson.
 */
const TRACE_BREAKS = [[-90, 0.02], [20, 0.62], [1000, 0.97]];

export function drawProfileTrace(ctx, c, s, o = {}) {
  const laneX0 = o.laneX0;
  const laneW = o.laneW;
  const kmMax = Math.min(o.kmMax ?? s.kmTop, s.kmTop);
  const w = o.width ?? 3;
  const col = o.col ?? c.accent;

  const fracFor = (degC) => {
    // Clamp to the BREAKS range, not to the knot range: the profile's coldest knot
    // is -85 degC, well below its warmest ground knot of +15, so clamping to the
    // knots would flatten the whole lower half of the curve into one x.
    const t = clamp(degC, TRACE_BREAKS[0][0], TRACE_BREAKS[TRACE_BREAKS.length - 1][0]);
    for (let i = 0; i < TRACE_BREAKS.length - 1; i++) {
      const [ta, fa] = TRACE_BREAKS[i];
      const [tb, fb] = TRACE_BREAKS[i + 1];
      if (t <= tb) return fa + ((t - ta) / (tb - ta)) * (fb - fa);
    }
    return TRACE_BREAKS[TRACE_BREAKS.length - 1][1];
  };
  const xFor = (degC) => laneX0 + fracFor(degC) * laneW;

  const stepKm = o.stepKm ?? 0.5;
  const stroke = () => {
    ctx.beginPath();
    for (let km = 0; km <= kmMax + 1e-9; km += stepKm) {
      const x = xFor(temperatureAt(km));
      const y = s.yFor(km);
      if (km === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // A dark shoulder under the line, so the trace reads on a light band in either theme.
  if (o.halo !== false) {
    ctx.strokeStyle = alpha(o.haloCol ?? c.bgDeep, 0.7);
    ctx.lineWidth = w + 3;
    stroke();
  }
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  stroke();
  ctx.restore();
  return { xFor, yFor: s.yFor, kmMax, fracFor };
}

/**
 * drawAltitudeBand - a shaded ALTITUDE range on the shared column, as a region.
 *
 *   drawAltitudeBand(ctx, c, s, { x, width, kmLo, kmHi, col, a, ramp, label, labelSub })
 *
 * The band is a tint that ramps in and out over `ramp` pixels at both ends and draws
 * **no line at either edge**: a band with an edge reads as a compartment with a floor
 * and a lid, and every band in this lesson is a range the air is inside, not a shelf
 * the air sits on. Both edges come from `s.yFor`, so a band's top and bottom are the
 * same y as the axis ticks for the same kilometres - the learner cannot be shown two
 * different 50 km.
 *
 * `col` defaults to a tint of `c.water` and `a` to 0.26, which reads in both themes on
 * the backdrop; a scene that wants its band to be the loudest thing on screen passes a
 * stronger `col`/`a` and a label. `label` is drawn INSIDE the band (never on its edge,
 * and never over whatever the scene has drawn there), and `labelSub` is a second,
 * smaller line under it. Returns the band's `{ yTop, yBot }` so a scene can lay out a
 * label, a legend swatch or a marker inside it without re-deriving either edge.
 */
export function drawAltitudeBand(ctx, c, s, o) {
  const x = o.x;
  const width = o.width;
  const yTop = s.yFor(Math.max(o.kmLo, o.kmHi));
  const yBot = s.yFor(Math.min(o.kmLo, o.kmHi));
  const ramp = o.ramp ?? 12;
  const a = o.a ?? 0.26;
  const base = o.col ?? c.water;

  // One gradient per band: full tint in the middle, nothing at either edge, so the
  // region is unmistakable and neither of its boundaries is.
  const g = ctx.createLinearGradient(0, yTop, 0, yBot);
  g.addColorStop(0, alpha(base, 0));
  g.addColorStop(Math.min(0.5, ramp / Math.max(1, yBot - yTop)), alpha(base, a));
  g.addColorStop(Math.max(0.5, 1 - ramp / Math.max(1, yBot - yTop)), alpha(base, a));
  g.addColorStop(1, alpha(base, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x, yTop, width, yBot - yTop);

  if (o.label) {
    const yMid = (yTop + yBot) / 2;
    ctx.fillStyle = o.labelCol ?? c.label;
    ctx.font = font(c, 700, o.labelSize ?? 15);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.label, x + width / 2, yMid - (o.labelSub ? 9 : 0));
    if (o.labelSub) {
      ctx.fillStyle = o.labelSubCol ?? c.labelMuted;
      ctx.font = font(c, 600, 12);
      ctx.fillText(o.labelSub, x + width / 2, yMid + 9);
    }
  }
  return { yTop, yBot };
}

/**
 * COLUMN_SLAB_KM - the slab height PressureColumnScene stacks the air column in.
 *
 * The 10 km slab is a DRAWING CONVENTION and this constant is where it is declared once, so the
 * column a learner stands under and the 10 km ticks AltitudeClimbScene drew are the same 10 km.
 * It is data about the drawing, not about the atmosphere: the real weight of a slab is not
 * constant, and the scene says so on the frame in its note line.
 */
export const COLUMN_SLAB_KM = 10;

/**
 * drawColumnSlabs - the air column as a stack of countable horizontal slabs.
 *
 *   drawColumnSlabs(ctx, c, s, { x, width, km, slabKm, baseA, riseA, edgeA, col })
 *
 * Slabs are laid from the GROUND UP on `s`, so the slab nearest the ground is the first one a
 * caller asks for and the topmost is the one still arriving. `km` is how much column exists so
 * far: whole slabs, plus one PARTIAL slab at the growing top edge, so a run reads as air arriving
 * rather than slabs blinking into existence. A partial slab is drawn at the height it has
 * reached, never shrunk, so the column is always the same 10 km units.
 *
 *   o.col     slab fill (default c.water)
 *   o.baseA   alpha of the lowest slab (default 0.34)
 *   o.riseA   fraction of `baseA` the stack loses by the top (default 0.55), so the drawn air
 *             thins with height the way the real column does
 *   o.edgeA   alpha of the hairline on each slab's own top edge (default 0.5)
 *
 * Returns `{ slabs, partial, yTop }`: whole slabs drawn, whether a partial one was added, and
 * the y of the top edge reached - a scene hangs a chip or a leader on that y.
 */
export function drawColumnSlabs(ctx, c, s, o = {}) {
  const x = o.x;
  const width = o.width;
  const slabKm = o.slabKm ?? COLUMN_SLAB_KM;
  const km = clamp(o.km ?? 0, 0, s.kmTop);
  const base = o.baseA ?? 0.34;
  const rise = o.riseA ?? 0.55;
  const fill = o.col ?? c.water;
  const whole = Math.floor(km / slabKm);
  const partial = km - whole * slabKm;
  const count = Math.ceil(km / slabKm);

  for (let i = 0; i < count; i++) {
    const lo = i * slabKm;
    const hi = Math.min(km, lo + slabKm);
    if (hi <= lo) break;
    const yTop = s.yFor(hi);
    const yBot = s.yFor(lo);
    const a = base * (1 - rise * (lo / Math.max(slabKm, s.kmTop)));
    ctx.fillStyle = alpha(fill, a);
    ctx.fillRect(x, yTop, width, yBot - yTop);
    // The hairline on the slab's own top edge: what makes one slab countable as one slab.
    ctx.strokeStyle = alpha(o.edgeCol ?? c.label, o.edgeA ?? 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, yTop + 1);
    ctx.lineTo(x + width, yTop + 1);
    ctx.stroke();
  }
  return { slabs: whole, partial: partial > 0.01, yTop: s.yFor(km) };
}