/**
 * MaskAdjustScene - the mask market of 2020, walked month by month.
 *
 * One price path is the hero: it is drawn from month 0 to the head, on a month axis
 * whose three bands are the slide's own three step headings, so the ORDER of the chain
 * (surge, catch-up, turn) is the picture. Below it, the two sides of that same market
 * answer the head at the month it sits on: the shop (a queue of people, a shelf of masks)
 * and the factory (lit windows, a stack of what it made). The learner scrubs the month;
 * each beat's entrance walks the head to that step's end.
 *
 * L05 s05 "When the Target Moves". The slide prints no numbers, so every number here is
 * the scene's own model (design note lists them all); `surplus`/`shortage` and the price as
 * a repair mechanism belong to s07 and appear nowhere - only want, made and the price.
 */
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  ZONES, alpha, mix, darken, font, pill, rr, drawBackdrop, drawDepth, drawCard, drawShadow, drawShelf,
} from 'simulations/base/kit/SimLook.js';
import { drawPersonGlyph } from 'simulations/base/kit/SimFigure.js';

const RUPEE = '\u20b9';

// -- the model (all of it [derived]; see the design note) --------------------------------
const MONTHS = 20;                       // the whole story, in months since the surge
const BAND_END = [3, 12, 20];            // where each beat's walk stops
const BAND_NAME = ['The surge', 'The catch-up', 'Then the turn'];
const WANT_PRE = 20, WANT_HIGH = 100, WANT_LOW = 40;
const MAKE_PRE = 20, MAKE_HIGH = 130;
const RAMP_FROM = 2, RAMP_TO = 10;       // producers ramp production over months 2-10
const PRICE_PRE = 10, PRICE_K = 0.3397;  // rupees of price per unit of pressure per month
const PRICE_BAND = 0.35;                 // no pressure while the gap is under a third of want
const SHELF_CAP = 60, PER_MASK_ICON = 12;
const PER_FIGURE = 20, PER_WINDOW = 25, PER_STACK = 25;
const HOME_T = 16.1;                     // the month the price is back on its own line

const smooth = (x) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
const lerp = (a, b, t) => a + (b - a) * t;
const wantAt = (t) => (t < 1 ? WANT_PRE : t < 12 ? WANT_HIGH
  : t < 16 ? lerp(WANT_HIGH, WANT_LOW, smooth((t - 12) / 4)) : WANT_LOW);
const makeAt = (t) => (t < RAMP_FROM ? MAKE_PRE : t < RAMP_TO
  ? lerp(MAKE_PRE, MAKE_HIGH, smooth((t - RAMP_FROM) / (RAMP_TO - RAMP_FROM))) : MAKE_HIGH);

// One forward pass at 0.1 month, so nothing on screen is a hand-typed key frame.
const STEP = 0.1;
const SAMPLES = Math.round(MONTHS / STEP) + 1;
const PRICE_PATH = new Array(SAMPLES);
const SHELF_PATH = new Array(SAMPLES);
(function buildModel() {
  let price = PRICE_PRE, shelf = SHELF_CAP;
  for (let i = 0; i < SAMPLES; i++) {
    PRICE_PATH[i] = price;
    SHELF_PATH[i] = shelf;
    const t = i * STEP, want = wantAt(t), make = makeAt(t);
    const gap = want - make, band = PRICE_BAND * want;
    const pressure = Math.abs(gap) <= band ? 0 : gap - Math.sign(gap) * band;
    price = Math.max(PRICE_PRE, price + PRICE_K * pressure * STEP);
    shelf = Math.max(0, Math.min(SHELF_CAP, shelf + (make - want) * STEP));
  }
})();

const sample = (path, t) => {
  const f = Math.max(0, Math.min(SAMPLES - 1.001, t / STEP));
  const i = Math.floor(f);
  return lerp(path[i], path[i + 1], f - i);
};
const figures = (t) => Math.max(1, Math.min(5, Math.round(wantAt(t) / PER_FIGURE)));
const litWindows = (t) => Math.max(1, Math.min(6, Math.round(makeAt(t) / PER_WINDOW)));
const shelfIcons = (t) => Math.max(0, Math.min(5, Math.round(sample(SHELF_PATH, t) / PER_MASK_ICON)));

// -- layout -----------------------------------------------------------------------------
const PX0 = 96, PX1 = 648;               // the plot's left and right edge
const PY0 = 104, PY1 = 240;              // the plot's top and bottom (price 0 at the floor)
const PRICE_TOP = 65;                    // rupees at the top of the plot
const SHELF_Y = 386, GROUND_Y = 386;     // the shop's shelf board, the factory's floor
const CARD_Y = 264, CARD_H = 176;
const SHOP = { x: ZONES.left.x, w: 318 };
const FACT = { x: 346, w: 318 };

const xOf = (month) => PX0 + (month / MONTHS) * (PX1 - PX0);
const yOf = (rupees) => PY1 - (rupees / PRICE_TOP) * (PY1 - PY0);
const monthAt = (x) => ((x - PX0) / (PX1 - PX0)) * MONTHS;

// One entry per beat; nothing advances itself, the learner steps the slide.
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

/** One face mask in its own box centred on (x, y): ear loops at the sides, body, pleats. */
function maskIcon(ctx, c, x, y, w, h) {
  const line = darken(c.s1, 0.34);
  ctx.strokeStyle = darken(c.s1, 0.5);   // the straps: dark enough to read as loops, not body
  ctx.lineWidth = 2;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + s * (w * 0.5 + 1), y, w * 0.11, h * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  rr(ctx, x - w * 0.5, y - h * 0.5, w, h, h * 0.34);
  ctx.fillStyle = c.s1;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = alpha(line, 0.5);
  ctx.lineWidth = 1.5;
  for (const dy of [-h * 0.2, h * 0.08]) {
    ctx.beginPath();
    ctx.moveTo(x - w * 0.28, y + dy);
    ctx.lineTo(x + w * 0.28, y + dy);
    ctx.stroke();
  }
}

/** A mask factory: a saw-tooth shed with `lit` of six windows alight. */
function factoryShed(ctx, c, x, base, w, h, lit) {
  const wall = mix(c.label, c.bgSurface, 0.72);
  rr(ctx, x, base - h, w, h, 5);
  ctx.fillStyle = wall;
  ctx.fill();
  ctx.strokeStyle = alpha(c.label, 0.4);
  ctx.lineWidth = 2;
  ctx.stroke();
  const tw = w / 3, roof = base - h - 13;
  ctx.beginPath();
  ctx.moveTo(x, base - h + 1);
  for (let i = 0; i < 3; i++) {
    ctx.lineTo(x + i * tw + 2, roof);
    ctx.lineTo(x + (i + 1) * tw - 2, base - h + 1);
  }
  ctx.lineTo(x + w, base - h + 1);
  ctx.closePath();
  ctx.fillStyle = mix(c.label, c.bgSurface, 0.5);
  ctx.fill();
  ctx.strokeStyle = alpha(c.label, 0.4);
  ctx.stroke();
  const ww = (w - 34) / 3, wh = h * 0.22;
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = (i / 3) | 0;
    const wx = x + 11 + col * (ww + 6), wy = base - h + 18 + row * (wh + 12);
    rr(ctx, wx, wy, ww, wh, 3);
    ctx.fillStyle = i < lit ? c.gold : alpha(c.label, 0.14);
    ctx.fill();
    ctx.strokeStyle = alpha(i < lit ? darken(c.gold, 0.4) : c.label, 0.5);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

export class MaskAdjustScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static NOTE_STAGE = 0;                              // one muted line at the foot, every beat
  static ARIA_LABEL = 'A chart of the price of one face mask through twenty months, above a shop queue '
    + 'and a shelf of masks on the left and a mask factory on the right. Drag the months slider to walk '
    + 'the price along: up through the surge, flat while producers catch up, back down to its old level.';
  static CONTROLS = [
    { type: 'slider', id: 'months', label: 'Months since the surge', min: 0, max: MONTHS, step: 1, value: 0 },
  ];

  constructor(container, config) {
    super(container, config);
    this._t = 0;              // the head's month
    this._walk = null;        // { to, rate } while a beat's entrance is running
    this._drag = false;
    this._celebT = 0;         // keeps the loop awake while confetti plays
    this._homeFired = false;  // the confetti happens once
  }

  noteRows() {
    return [{ text: 'one shop and one factory - 20 months compressed into three steps' }];
  }

  enter(stage) {
    const s = Math.max(0, Math.min(BAND_END.length - 1, stage | 0));
    this._walk = null;
    const to = BAND_END[s];
    // Every stage change walks the head to that step's last month, from wherever it is: a
    // mount that opens on step 2 (a resumed lesson) walks the whole chain rather than
    // dropping the learner on a bare final state.
    const from = Math.min(this._t, to);
    this._t = from;
    const months = to - from;
    if (months <= 0.001) { this.requestUiUpdate?.(); return; }
    // A fixed rate per phase, so every walk ends exactly on the step's last month.
    this._walk = { to, rate: months / Math.min(2.8, Math.max(1.4, 0.6 + months * 0.25)) };
    this.animateFor(2900);
  }

  update(d) {
    if (this._celebT > 0) this._celebT = Math.max(0, this._celebT - d);
    const w = this._walk;
    if (w) {
      const step = w.rate * d;
      this._t = w.to > this._t ? Math.min(w.to, this._t + step) : Math.max(w.to, this._t - step);
      if (this._t === w.to) { this._walk = null; this.requestUiUpdate?.(); }
    }
    // The concept, not a button: the head arriving back on its own dashed level.
    if (!this._homeFired && this._t >= HOME_T) {
      this._homeFired = true;
      this._celebT = 1.2;
      this.celebrate(xOf(this._t), yOf(PRICE_PRE), 22);
    }
  }

  busy() { return !!this._walk || this._drag || this._celebT > 0; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    drawDepth(ctx, c, { k: 0.6 });
    // the one header chip: which market this is (the slide's own 2020)
    pill(ctx, c, '2020: the mask market', ZONES.top.x, ZONES.top.y + ZONES.top.h / 2, { size: 16, align: 'left' });
    this._drawPlot(ctx, c);
    this._drawShop(ctx, c);
    this._drawFactory(ctx, c);
  }

  // -- the price path (the hero) ---------------------------------------------------------
  _drawPlot(ctx, c) {
    const stage = Math.max(0, Math.min(BAND_END.length - 1, this.stage | 0));
    // grid + price ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (const p of [0, 20, 40, 60]) {
      const y = yOf(p);
      ctx.strokeStyle = alpha(c.stroke, p === 0 ? 0.85 : 0.3);
      ctx.lineWidth = p === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(PX0, y);
      ctx.lineTo(PX1, y);
      ctx.stroke();
      ctx.fillStyle = c.labelMuted;
      ctx.font = font(c, 700, 14);
      ctx.fillText(`${RUPEE}${p}`, PX0 - 8, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = c.labelMuted;
    ctx.font = font(c, 700, 14);
    ctx.fillText(`${RUPEE} per mask`, 16, PY0 + 30);

    // the three bands: the slide's own headings, over the months each one covers
    for (let b = 0; b < BAND_END.length; b++) {
      const from = b === 0 ? 0 : BAND_END[b - 1];
      const to = BAND_END[b];
      const on = b <= stage;
      if (b > 0) {
        const x = xOf(from);
        ctx.setLineDash(on ? [] : [5, 5]);
        ctx.strokeStyle = alpha(c.stroke, on ? 0.7 : 0.4);
        ctx.lineWidth = on ? 2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(x, PY0 - 6);
        ctx.lineTo(x, PY1);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = on ? c.label : c.labelMuted;
      ctx.font = font(c, on ? 800 : 700, 14);
      ctx.fillText(BAND_NAME[b], (xOf(from) + xOf(to)) / 2, PY0 - 12);
    }

    // the level the price started from, and came back to
    ctx.setLineDash([7, 5]);
    ctx.strokeStyle = alpha(c.gold, 0.85);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PX0, yOf(PRICE_PRE));
    ctx.lineTo(PX1, yOf(PRICE_PRE));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = 'right';
    ctx.fillStyle = c.gold;
    ctx.font = font(c, 800, 14);
    ctx.fillText('before the surge', PX1 - 4, yOf(PRICE_PRE) + 15);

    // months under the axis
    ctx.textAlign = 'center';
    ctx.fillStyle = c.labelMuted;
    ctx.font = font(c, 700, 14);
    for (let m = 0; m <= MONTHS; m += 5) {
      ctx.fillText(String(m), xOf(m), PY1 + 14);
    }

    // the path itself, month 0 to the head
    const head = this._t;
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    const last = Math.min(SAMPLES - 1, Math.ceil(head / STEP));
    for (let i = 0; i <= last; i++) {
      const x = xOf(i * STEP), y = yOf(PRICE_PATH[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    const hx = xOf(head), hy = yOf(sample(PRICE_PATH, head));
    ctx.lineTo(hx, hy);
    ctx.stroke();

    const price = Math.round(sample(PRICE_PATH, head));
    const chipText = `${RUPEE}${price} a mask`;
    const cx = Math.max(PX0 + 52, Math.min(PX1 - 52, hx));
    const cy = hy - 34 < PY0 + 6 ? hy + 34 : hy - 34;
    pill(ctx, c, chipText, cx, cy, { size: 15 });

    ctx.beginPath();
    ctx.arc(hx, hy, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.strokeStyle = alpha(c.bgDeep, 0.9);
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // -- the shop (the demand side, at the head's month) ------------------------------------
  _drawShop(ctx, c) {
    drawCard(ctx, c, SHOP.x, CARD_Y, SHOP.w, CARD_H);
    const t = this._t;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.label;
    ctx.font = font(c, 800, 15);
    ctx.fillText('the shop', SHOP.x + 14, 288);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(wantAt(t))} want one`, SHOP.x + SHOP.w - 14, 288);

    const n = figures(t);
    for (let i = 0; i < n; i++) {
      drawPersonGlyph(ctx, c, SHOP.x + 28 + i * 44, 344, 44, { col: c.s4 });
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = c.labelMuted;
    ctx.font = font(c, 700, 14);
    ctx.fillText(`1 figure = ${PER_FIGURE} people`, SHOP.x + SHOP.w / 2, 412);
    ctx.fillText(`a full shelf = ${SHELF_CAP} masks`, SHOP.x + SHOP.w / 2, 429);

    drawShadow(ctx, c, SHOP.x + SHOP.w / 2, SHELF_Y + 20, SHOP.w / 2 - 22, 6);
    drawShelf(ctx, c, SHOP.x + 14, SHOP.x + SHOP.w - 14, SHELF_Y, { col: mix(c.gold, c.bgSurface, 0.5) });
    const on = shelfIcons(t);
    for (let i = 0; i < on; i++) {
      maskIcon(ctx, c, SHOP.x + 34 + i * 40, SHELF_Y - 12, 26, 18);
    }
  }

  // -- the factory (the supply side, at the head's month) ---------------------------------
  _drawFactory(ctx, c) {
    drawCard(ctx, c, FACT.x, CARD_Y, FACT.w, CARD_H);
    const t = this._t;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.label;
    ctx.font = font(c, 800, 15);
    ctx.fillText('the factory', FACT.x + 14, 288);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(makeAt(t))} made a day`, FACT.x + FACT.w - 14, 288);

    const lit = litWindows(t);
    factoryShed(ctx, c, FACT.x + 16, GROUND_Y, 108, 68, lit);
    for (let i = 0; i < lit; i++) {
      maskIcon(ctx, c, FACT.x + 140 + i * 38, GROUND_Y - 12, 26, 18);
    }
    rr(ctx, FACT.x + 14, GROUND_Y + 1, FACT.w - 28, 3, 1.5);
    ctx.fillStyle = alpha(c.label, 0.32);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = c.labelMuted;
    ctx.font = font(c, 700, 14);
    ctx.fillText(`1 lit window = ${PER_WINDOW} masks a day`, FACT.x + FACT.w / 2, 412);
    ctx.fillText(`6 lit windows = ${6 * PER_WINDOW} a day`, FACT.x + FACT.w / 2, 429);
  }

  // -- input -----------------------------------------------------------------------------
  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'months') this._scrub(Number(v));
  }

  /** The month slider and the plot itself are the same control. Forward is clamped to this beat. */
  _scrub(month) {
    const limit = BAND_END[Math.max(0, Math.min(BAND_END.length - 1, this.stage | 0))];
    const t = Math.max(0, Math.min(limit, Number.isFinite(month) ? month : 0));
    this._walk = null;
    if (t !== this._t) { this._t = t; this.animateFor(400); }
    this.requestUiUpdate?.();
  }

  pointerDown(p) {
    if (p.x < PX0 - 12 || p.x > PX1 + 12 || p.y < PY0 - 18 || p.y > PY1 + 20) return;
    this._drag = true;
    this._scrub(monthAt(p.x));
  }

  pointerMove(p) {
    if (!this._drag) return false;
    this._scrub(monthAt(p.x));
    return true;
  }

  pointerUp() { this._drag = false; }

  /** What the host draws on the slider: the head's month, whole. */
  getControlValue(id) { return id === 'months' ? Math.round(this._t) : super.getControlValue(id); }
}
