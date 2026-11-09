/**
 * LandTaxBase - the shared village-and-dial apparatus for L11's land-tax panels,
 * as plain functions and constants. No class, no beat logic, no lesson prose: a
 * scene owns its stages and its labels, this owns the schematic ground, the
 * harvest dial, the tax readout and the ONE-SIXTH arithmetic, so `LandTaxScene`
 * (s01) and `LandTaxScene-classes` (s03) are literally the same panel and can
 * never drift apart.
 *
 * THE RULE THIS MODULE EXISTS TO ENFORCE: one-sixth is defined once, here. A
 * scene reads `taxFor(h)` and NEVER re-derives the share, because a second copy of
 * the proportion is how a panel ends up showing a fixed number while the dial
 * moves - the exact failure s01 exists to show.
 *
 * Written by the Stage 3 run that also builds `LandTaxScene-classes`; imported by
 * `LandTaxScene` on the same mount. Public surface:
 *
 *   constants   HARVEST_MIN, HARVEST_MAX, HARVEST_MID, HARVEST_STEP, ONE_SIXTH,
 *               TAX_MAX, CROP_NAMES
 *   arithmetic  taxFor(h), dialFrac(h), harvestFor(f)
 *   geometry    VILLAGE, FIELD, COMMON, HOLD, PLOTS, GROVES, DIAL, DIAL_CARD,
 *               TAX_CARD, COTTON, VILLAGE_CX
 *   drawing     drawVillage(ctx, c, o), drawDial(ctx, c, o), drawTaxCard(ctx, c, o),
 *               drawCottonGround(ctx, c, o)
 *   input       dialFracAt(p)
 *
 *   o for drawVillage: { frac 0..1, crops: null | string[9], cotton: bool }
 *     crops null = the undifferentiated standing stand of s01.
 *   o for drawDial / drawTaxCard: { frac 0..1 } and { tax, frac 0..1 }.
 *
 * What is deliberately NOT here: the five land categories, the crop chips and
 * their text. s01 must never show a classification row or name a crop, so those
 * words live in the s03 scene.
 *
 * Non-ASCII is written as \uXXXX escapes throughout.
 */
import {
  alpha, mix, darken, lighten, font, rr, stadium, ellipse, mulberry32,
  pill, drawCard, drawMeter,
} from 'simulations/base/kit/SimLook.js';

// -- The one arithmetic -------------------------------------------------------

export const HARVEST_MIN = 0;
export const HARVEST_MAX = 120;
export const HARVEST_MID = 60;
export const HARVEST_STEP = 6;                  // 6 -> 1.0, 60 -> 10.0, 120 -> 20.0
export const ONE_SIXTH = 1 / 6;
export const TAX_MAX = HARVEST_MAX * ONE_SIXTH; // 20

/** The tax on a harvest: always one-sixth of it, never anything else. */
export function taxFor(harvest) { return harvest * ONE_SIXTH; }

/** Harvest 0..120 as the dial's 0..1 position. */
export function dialFrac(harvest) {
  return (harvest - HARVEST_MIN) / (HARVEST_MAX - HARVEST_MIN);
}

/** A dial position back as a harvest, snapped to the panel's stops. */
export function harvestFor(frac) {
  const f = Math.min(1, Math.max(0, frac));
  const steps = (HARVEST_MAX - HARVEST_MIN) / HARVEST_STEP;
  return Math.round(f * steps) * HARVEST_STEP + HARVEST_MIN;
}

// -- Geometry (design space, 680 x 520) --------------------------------------

export const VILLAGE = { x: 16, y: 52, w: 400, h: 310 };        // the hero card
export const VILLAGE_CX = VILLAGE.x + VILLAGE.w / 2;
export const FIELD = { x: 26, y: 62, w: 380, h: 290 };          // grove fringe included
export const COMMON = { x: 56, y: 92, w: 320, h: 260 };         // undivided common band
export const HOLD = { x: 82, y: 118, w: 268, h: 122 };          // the holdings patchwork

const PLOT_GAP = 6;
const PLOT_COLS = 3;
const PLOT_ROWS = 3;
export const PLOT_W = (HOLD.w - PLOT_GAP * (PLOT_COLS - 1)) / PLOT_COLS;
export const PLOT_H = (HOLD.h - PLOT_GAP * (PLOT_ROWS - 1)) / PLOT_ROWS;

/** Nine holdings, row-major. Crops index straight into this. */
export const PLOTS = Array.from({ length: PLOT_COLS * PLOT_ROWS }, (_, i) => ({
  x: HOLD.x + (i % PLOT_COLS) * (PLOT_W + PLOT_GAP),
  y: HOLD.y + Math.floor(i / PLOT_COLS) * (PLOT_H + PLOT_GAP),
  w: PLOT_W,
  h: PLOT_H,
  r: 4 + (i * 7) % 5,
}));

function groveRing() {
  const rand = mulberry32(11);
  const out = [];
  const push = (x, y) => out.push({ x, y, r: 5.5 + rand() * 3.2 });
  const x0 = FIELD.x + 13, x1 = FIELD.x + FIELD.w - 13;
  const y0 = FIELD.y + 13, y1 = FIELD.y + FIELD.h - 13;
  for (let x = x0 + 8; x <= x1 - 8; x += 26) { push(x, y0 + rand() * 4 - 2); push(x, y1 + rand() * 4 - 2); }
  for (let y = y0 + 20; y <= y1 - 20; y += 26) { push(x0 + rand() * 4 - 2, y); push(x1 + rand() * 4 - 2, y); }
  return out;
}
export const GROVES = groveRing();

/** The band strip kept clear for the beat-2 cotton holding (empty until then). */
export const COTTON = {
  strip: { x: 60, y: 248, w: 312, h: 42 },
  plot: { x: 68, y: 254, w: 94, h: 30 },
  chip: { x: 170, y: 269 },        // left edge of the word "cotton"
  swatch: { x: 248, y: 258, w: 22, h: 22 },
  cap: { x: 280, y1: 263, y2: 279 },
};

export const DIAL_CARD = { x: 428, y: 52, w: 236, h: 158 };
export const DIAL = { cx: DIAL_CARD.x + DIAL_CARD.w / 2, y0: 116, y1: 176, r: 15, t: 16 };
export const TAX_CARD = { x: 428, y: 218, w: 236, h: 144 };

/** The chapter's own list of crops, in the slide's order. Nine, and no more. */
export const CROP_NAMES = ['rice', 'pulses', 'wheat', 'linseed', 'mustard', 'saffron', 'sugarcane', 'vegetables', 'fruits'];

/** A stable tint per crop, from the theme's own tokens. */
export function cropTint(c, i) {
  const s = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
  return i < s.length ? c[s[i]] : mix(c.s8, c.gold, 0.5);
}

/** Where the dial track sits, for hit-testing a drag. */
export function dialFracAt(p) {
  if (p.y < DIAL.y0 - 26 || p.y > DIAL.y1 + 26) return null;
  if (Math.abs(p.x - DIAL.cx) > 46) return null;
  return Math.min(1, Math.max(0, (DIAL.y1 - p.y) / (DIAL.y1 - DIAL.y0)));
}

// -- Drawing -----------------------------------------------------------------

function text(ctx, c, str, x, y, size, col, weight = 700, display = false) {
  ctx.font = font(c, weight, size, display);
  ctx.fillStyle = col;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

const TONES = (c) => ({
  soil: mix(c.bgDeep, c.gold, 0.10),
  grove: mix(c.good, c.gold, 0.30),
  common: mix(c.good, c.bgDeep, 0.42),
  field: mix(c.gold, c.bgDeep, 0.30),
  soilDark: darken(mix(c.bgDeep, c.water, 0.30), 0.22),
});

/**
 * The village from directly overhead: the holdings patchwork, the undivided
 * common band around it, the grove fringe on the outskirts, and (from beat 1)
 * the standing crops the chapter lists. o.crops null keeps s01's single
 * undifferentiated stand.
 */
export function drawVillage(ctx, c, o = {}) {
  const frac = Math.min(1, Math.max(0, o.frac ?? 0.5));
  const t = TONES(c);
  drawCard(ctx, c, VILLAGE.x, VILLAGE.y, VILLAGE.w, VILLAGE.h);

  rr(ctx, FIELD.x, FIELD.y, FIELD.w, FIELD.h, 20);
  ctx.fillStyle = t.soil;
  ctx.fill();

  ctx.fillStyle = t.grove;
  for (const g of GROVES) { ellipse(ctx, g.x, g.y, g.r, g.r * 0.86); ctx.fill(); }

  rr(ctx, COMMON.x, COMMON.y, COMMON.w, COMMON.h, 16);
  ctx.fillStyle = t.common;
  ctx.fill();

  rr(ctx, HOLD.x, HOLD.y, HOLD.w, HOLD.h, 10);
  ctx.fillStyle = t.field;
  ctx.fill();

  PLOTS.forEach((p, i) => {
    const tint = o.crops ? cropTint(c, i) : null;
    rr(ctx, p.x, p.y, p.w, p.h, p.r);
    ctx.fillStyle = tint ? alpha(tint, 0.22) : alpha(c.gold, 0.10);
    ctx.fill();
    ctx.strokeStyle = tint ? alpha(tint, 0.6) : alpha(c.gold, 0.45);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (!o.crops) return;
    // The standing crop: height is the dial, so a drag shortens or fills the plot.
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const len = 3 + 9 * frac;
    for (let r = 0; r < 2; r++) {
      const by = p.y + p.h - 5 - r * 12;
      for (let q = 0; q < 5; q++) {
        const bx = p.x + 12 + q * ((p.w - 24) / 4);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by - len);
        ctx.stroke();
      }
    }
    ctx.lineCap = 'butt';
  });

  pill(ctx, c, 'groves', VILLAGE_CX, 77, { bg: c.raised, size: 13 });
  pill(ctx, c, 'holdings', VILLAGE_CX, 105, { bg: c.raised, size: 13 });
  pill(ctx, c, 'common land', VILLAGE_CX, 312, { bg: c.raised, size: 13 });
}

/** The one holding set apart for the single regional fact, and its ground swatch. */
export function drawCottonGround(ctx, c) {
  const t = TONES(c);
  drawCard(ctx, c, COTTON.strip.x, COTTON.strip.y, COTTON.strip.w, COTTON.strip.h, 1, { r: 10 });
  rr(ctx, COTTON.plot.x, COTTON.plot.y, COTTON.plot.w, COTTON.plot.h, 6);
  ctx.fillStyle = t.soilDark;
  ctx.fill();
  ctx.strokeStyle = c.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = lighten(c.gold, 0.35);
  for (let i = 0; i < 3; i++) {                       // three bolls, one per word of nothing
    ellipse(ctx, COTTON.plot.x + 22 + i * 25, COTTON.plot.y + 15, 5, 5);
    ctx.fill();
  }
  rr(ctx, COTTON.swatch.x, COTTON.swatch.y, COTTON.swatch.w, COTTON.swatch.h, 4);
  ctx.fillStyle = t.soilDark;
  ctx.fill();
  ctx.strokeStyle = alpha(c.stroke, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/** The harvest dial: bad harvest at the bottom, good at the top, dragged or clicked. */
export function drawDial(ctx, c, o = {}) {
  const frac = Math.min(1, Math.max(0, o.frac ?? 0.5));
  drawCard(ctx, c, DIAL_CARD.x, DIAL_CARD.y, DIAL_CARD.w, DIAL_CARD.h);
  pill(ctx, c, 'harvest', DIAL.cx, 76, { bg: c.raised, size: 13 });
  text(ctx, c, 'good harvest', DIAL.cx, 100, 13, c.labelMuted);
  text(ctx, c, 'bad harvest', DIAL.cx, 196, 13, c.labelMuted);

  const x = DIAL.cx - DIAL.t / 2;
  stadium(ctx, x, DIAL.y0, DIAL.t, DIAL.y1 - DIAL.y0);
  ctx.fillStyle = darken(c.track, 0.3);
  ctx.fill();
  stadium(ctx, x, DIAL.y0, DIAL.t, DIAL.y1 - DIAL.y0);
  ctx.fillStyle = c.track;
  ctx.fill();
  const ky = DIAL.y1 - frac * (DIAL.y1 - DIAL.y0);
  if (frac > 0.01) {
    stadium(ctx, x, ky, DIAL.t, DIAL.y1 - ky);
    ctx.fillStyle = c.accent;
    ctx.fill();
  }
  stadium(ctx, DIAL.cx - 17, ky - DIAL.r + 2, 34, 2 * DIAL.r - 4);
  ctx.fillStyle = darken(c.accent, 0.34);
  ctx.fill();
  stadium(ctx, DIAL.cx - 17, ky - DIAL.r, 34, 2 * DIAL.r - 4);
  ctx.fillStyle = lighten(c.accent, 0.26);
  ctx.fill();
  ctx.strokeStyle = darken(c.accent, 0.3);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = darken(c.accent, 0.32);          // two grip lines, not a hole
  rr(ctx, DIAL.cx - 6, ky - 4, 12, 2.5, 1.2);
  ctx.fill();
  rr(ctx, DIAL.cx - 6, ky + 1.5, 12, 2.5, 1.2);
  ctx.fill();
}

/** The tax readout: one-sixth, the number, and a meter so it is visibly driven. */
export function drawTaxCard(ctx, c, o = {}) {
  const tax = o.tax ?? 0;
  const frac = Math.min(1, Math.max(0, o.frac ?? 0));
  drawCard(ctx, c, TAX_CARD.x, TAX_CARD.y, TAX_CARD.w, TAX_CARD.h);
  pill(ctx, c, 'tax \u00b7 one-sixth', DIAL.cx, 248, { bg: c.accent, size: 13 });
  text(ctx, c, tax.toFixed(1), DIAL.cx, 298, 36, c.label, 800, true);
  drawMeter(ctx, c, TAX_CARD.x + 20, 326, TAX_CARD.w - 40, 16, frac, { col: c.accent });
}