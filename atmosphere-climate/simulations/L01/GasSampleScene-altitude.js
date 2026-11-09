// GasSampleScene-altitude - the same jar, one altitude dial, and the three things that happen as
// you climb. One control, no run: the scene is live under the dial and rests the moment it stops.
//
// What the slide claims, and what the drawing does about each claim:
//   density falls            the chip and the meter at the top of the axis, on the standard-atmosphere
//                            density law: 1.23 kg/m3 at the ground, 0.41 at 10 km
//   water vapour collapses   a wedge on top of the dry stack, 8.5% of the column at the ground and a
//                            1.5 px sliver at 10 km, following 0.400 * exp(-h/2)
//   N, O, rare gases do not  the dry stack is RIGID. It is not drawn shrinking, because the slide's
//                            sentence is that they do not budge - and a panel showing them shrink
//                            would be arguing against it
//
// The rare trio and the water wedge are both drawn thicker than they really are; the note line says
// so once, and the numbers quoted beside them are the true shares. Nothing here states WHY the
// composition varies, names a layer, or suggests that climbing puts more carbon dioxide into the air.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  ZONES, alpha, mix, lighten, pill, chipRow, leader, font, rr, inOutSine,
  drawBackdrop, drawFloor, drawShadow, drawMeter, drawVignette,
} from 'simulations/base/kit/SimLook.js';
import { GASES, gasColor, jarFrame, drawJar } from './AtmosphereJar.js';

// -- layout (design space, 680 x 520) -------------------------------------------------------------
// Left to right: the two readout chips and their meter on the left, the two left pills hanging in
// the left zone, the altitude scale, the jar, and the four right pills. The jar's foot stands on
// the floor and its mouth is level with the top of the scale, so the scale runs the jar's height.
// Each pill carries its own share, so there is no reading card and nothing is stated twice.
const FLOOR_Y = 406;
const JAR = { x: 240, y: 124, w: 250, h: 282 };
const AXIS_X = 178;
const H_MAX = 10;                                    // km; the dial's whole range
const PX_PER_KM = (FLOOR_Y - JAR.y) / H_MAX;
const READ_X = 20, READ_Y = 86, METER_W = 132;       // the chips, and the density meter under them
const LEFT_PILL_X = 150;                             // right-aligned, in the left zone
const RIGHT_PILL_X = 500;                            // left-aligned
const PILL_SIZE = 12;
const WV_METER_W = 110;

// -- the drawn mixture ---------------------------------------------------------------------------
// The dry four are the helper's GASES shares and never move. These are their DRAWN heights as
// fractions of the jar's inner box: nitrogen and oxygen at their true 78:21 of the dry stack, and
// the three rare bands together at 0.055 rather than their true 0.01, because 1% of a 174 px column
// is under two pixels and three colours cannot share that. The wedge is 0.085 at the ground.
const N_DRAW = 0.677, O_DRAW = 0.182, RARE_DRAW = 0.055;
const RARE_SPLIT = [0.58, 0.21, 0.21];              // argon, carbon dioxide, others, from the foot
const WEDGE0 = 0.085;                                // the water wedge at the ground
const WEDGE_MIN = 1.5;                               // px: at the top of the range it is a sliver, not nothing
const WATER = 5;                                     // a sixth key, one past the helper's five

// -- the model ------------------------------------------------------------------------------------
const RHO0 = 1.225;                                  // kg/m3 at sea level
const densityAt = (h) => RHO0 * Math.pow(1 - 0.0225577 * h, 4.2559);
const WV0 = 0.40;                                    // water vapour, of 100 by volume, at the ground
const vapourAt = (h) => WV0 * Math.exp(-h / 2.0);

// -- timing ---------------------------------------------------------------------------------------
const SETTLE_S = 0.4;                                // the first settling after a mount
const RETURN_S = 1.0;                                // beat 2's way home
const CELEBRATE_KM = 2.5;                            // where the collapsing slice is unmistakable

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const S_B0 = 0, S_B1 = 1, S_B2 = 2;

export class GasSampleSceneAltitude extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static NOTE_STAGE = 0;
  static ARIA_LABEL =
    'A wide-mouthed jar of air in side view with a vertical height scale up its left side, running '
    + 'from ground level to 10 kilometres. Inside the jar the air is drawn as stacked bands: nitrogen '
    + 'at the bottom, then oxygen, then a thin band holding argon, carbon dioxide and the other trace '
    + 'gases, and water vapour as a wedge on top. A single height dial drives everything. At the '
    + 'ground the density reads 1.23 kilograms per cubic metre and the water vapour wedge is at its '
    + 'widest, 0.400 of every 100 by volume. As the dial rises the density reading falls, the water '
    + 'vapour wedge collapses to a sliver, and the nitrogen, oxygen and rare gas bands hold their '
    + 'size. On the last beat the dial eases back to the ground reading on its own.';
  static CONTROLS = [
    { type: 'slider', id: 'altitude', label: 'Height above the ground', min: 0, max: H_MAX, step: 0.1, value: 0, suffix: ' km' },
  ];

  constructor(container, config) {
    super(container, config);
    this._alt = 0;                                   // km, the drawn altitude
    this._target = 0;                                // km, where the dial is set
    this._anim = null;                               // { from, to, t, dur } while the dial eases home
    this._drag = false;
    this._done = false;                              // the celebration fires once per mount
    this._frame = jarFrame(JAR.x, JAR.y, JAR.w, JAR.h);
  }

  noteRows() {
    return [{ text: 'the water vapour slice and the rare band are drawn thicker than they are' }];
  }

  enter(stage) {
    this._done = false;
    // Beat 1 keeps the dial where the learner left it: the climb is theirs, and it is what makes
    // beat 2's walk back down an event rather than a no-op. Beat 0's mount settles and beat 2's
    // return both come home to the ground reading.
    const to = stage === S_B1 ? this._alt : 0;
    this._target = to;
    if (to === this._alt) { this._anim = null; return; }
    const dur = stage === S_B2 ? RETURN_S : SETTLE_S;
    this._anim = { from: this._alt, to, t: 0, dur };
    this.animateFor?.(dur * 1000 + 300);
  }

  update(d) {
    const a = this._anim;
    if (!a) return;
    a.t += d;
    const k = Math.min(1, a.t / a.dur);
    this._alt = a.from + (a.to - a.from) * inOutSine(k);
    if (k >= 1) { this._anim = null; this.requestUiUpdate?.(); }
  }

  busy() { return !!this._anim; }

  get _vapour() { return vapourAt(this._alt); }
  get _rho() { return densityAt(this._alt); }

  // -- the sectors, foot up -----------------------------------------------------------------------

  /**
   * Every drawn height, in px inside the jar's inner box, for the altitude the dial is at now.
   * `waterMid` is where the celebration goes; the three `rare` entries are the heights the three
   * rare leaders land on, so the thing the pointer is over and the thing the label names agree.
   */
  _sectors() {
    const D = this._frame.grid.size;
    const foot = this._frame.grid.y + D;
    const nH = N_DRAW * D, oH = O_DRAW * D, rareH = RARE_DRAW * D;
    const wedge = Math.max(WEDGE_MIN, WEDGE0 * D * (this._vapour / WV0));
    const rareFoot = foot - nH - oH;
    const dryTop = rareFoot - rareH;
    const rare = [];
    let acc = 0;
    for (let g = 0; g < RARE_SPLIT.length; g++) {
      rare.push({ gas: g + 2, mid: rareFoot - rareH + (acc + RARE_SPLIT[g] / 2) * rareH });
      acc += RARE_SPLIT[g];
    }
    return { D, foot, nH, oH, rareH, rare, dryTop, wedge, waterMid: dryTop - wedge / 2, fillTop: dryTop - wedge };
  }

  /**
   * A gas's colour: the helper's five, and the water token for the wedge. The wedge is lightened
   * because the water token and nitrogen's s1 are near enough in the dark theme that the top band
   * and the bottom band would otherwise be the same blue.
   */
  _col(c, gas) { return gas === WATER ? lighten(c.water, 0.34) : gasColor(c, gas); }

  // -- the drawing --------------------------------------------------------------------------------

  draw(ctx, c) {
    const g = this._frame.grid;
    const s = this._sectors();
    drawBackdrop(ctx, c, 'dots');
    drawFloor(ctx, c, FLOOR_Y);
    drawShadow(ctx, c, JAR.x + JAR.w / 2, FLOOR_Y - 2, 128, 17);

    // The glass, unchanged from the helper, with no grid in it: this jar's contents are sectors.
    drawJar(ctx, c, JAR.x, JAR.y, JAR.w, JAR.h, {});
    this._bands(ctx, c, g, s);
    this._axis(ctx, c, g);
    this._rimLabels(ctx, c, g, s);
    this._readouts(ctx, c);
    this._caption(ctx, c);
    drawVignette(ctx, c, 0.7);
  }

  /** The six bands, drawn from the foot up in the jar's rim order, water vapour last. */
  _bands(ctx, c, g, s) {
    const x = g.x + 3, w = g.size - 6;
    let y = s.foot;
    this._band(ctx, x, y - s.nH, w, s.nH, this._col(c, 0));
    this._band(ctx, x, y - s.nH - s.oH, w, s.oH, this._col(c, 1));
    y = s.rareFoot;
    for (let i = 0; i < RARE_SPLIT.length; i++) {
      const h = RARE_SPLIT[i] * s.rareH;
      this._band(ctx, x, y - h, w, h, this._col(c, i + 2));
      y -= h;
    }
    this._band(ctx, x, s.dryTop - s.wedge, w, s.wedge, this._col(c, WATER));
    // A hairline on the dry stack's own top, so where the water wedge ends is unambiguous.
    ctx.strokeStyle = alpha(c.label, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, s.dryTop + 0.5);
    ctx.lineTo(x + w, s.dryTop + 0.5);
    ctx.stroke();
  }

  /** One band: a flat fill with the lit sliver along its top that the helper's cells carry. */
  _band(ctx, x, y, w, h, col) {
    if (h < 2) { ctx.fillStyle = col; ctx.fillRect(x, y, w, Math.max(0.9, h)); return; }
    ctx.fillStyle = col;
    rr(ctx, x, y, w, h, Math.min(3, h * 0.22));
    ctx.fill();
    ctx.fillStyle = alpha(lighten(col, 0.32), 0.30);
    rr(ctx, x, y, w, Math.max(1, h * 0.18), Math.min(2, h * 0.22));
    ctx.fill();
  }

  /** The altitude scale: a plain line, a tick a kilometre, and the knob where the dial is. */
  _axis(ctx, c, g) {
    const y0 = FLOOR_Y;
    ctx.strokeStyle = alpha(c.label, 0.40);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(AXIS_X, JAR.y);
    ctx.lineTo(AXIS_X, y0);
    ctx.stroke();
    for (let k = 0; k <= H_MAX; k++) {
      const y = y0 - k * PX_PER_KM;
      ctx.lineWidth = k % 5 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(AXIS_X, y);
      ctx.lineTo(AXIS_X + (k % 5 === 0 ? 15 : 8), y);
      ctx.stroke();
    }

    ctx.font = font(c, 700, 13);
    ctx.fillStyle = mix(c.labelMuted, c.label, 0.72);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(H_MAX), AXIS_X - 12, JAR.y);
    ctx.fillText('5', AXIS_X - 12, y0 - 5 * PX_PER_KM);
    ctx.fillText('ground', AXIS_X - 12, y0 + 18);

    // The knob, and a dashed guide across to the jar so the number and the wedge are the same line.
    const y = y0 - this._alt * PX_PER_KM;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = alpha(c.gold, 0.45);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(AXIS_X + 2, y);
    ctx.lineTo(g.x + 8, y);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = c.gold;
    ctx.beginPath();
    ctx.arc(AXIS_X, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.bgDeep;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * The five names in the jar's fixed rim order, each on a dashed leader to the band it is in -
   * nitrogen and oxygen from the left, the three that share one thin band from the right, water
   * vapour above them. Every pill carries its own share, so the six numbers are read where the
   * five names already are and no second panel has to say the same thing again. The five dry
   * numbers are the helper's and never change; only the water vapour one does.
   */
  _rimLabels(ctx, c, g, s) {
    const axL = g.x + g.size * 0.13, axR = g.x + g.size * 0.87;
    const put = (text, x, y, align, tx, ty, col) => {
      leader(ctx, align === 'right' ? x + 6 : x - 6, y, tx, ty, col, 0.5);
      pill(ctx, c, text, x, y, { align, bg: mix(col, c.bgDeep, 0.52), size: PILL_SIZE });
    };
    const at = (frac) => g.y + g.size * frac;
    put(`${GASES[0].label} 78`, LEFT_PILL_X, at(0.66), 'right', axL, s.foot - s.nH * 0.5, this._col(c, 0));
    put(`${GASES[1].label} 21`, LEFT_PILL_X, at(0.23), 'right', axL, s.foot - s.nH - s.oH * 0.5, this._col(c, 1));
    put(`${GASES[2].label} 0.93`, RIGHT_PILL_X, at(0.26), 'left', axR, s.rare[0].mid, this._col(c, 2));
    put(`${GASES[3].label} 0.04`, RIGHT_PILL_X, at(0.38), 'left', axR, s.rare[1].mid, this._col(c, 3));
    put(`${GASES[4].label} 0.03`, RIGHT_PILL_X, at(0.50), 'left', axR, s.rare[2].mid, this._col(c, 4));
    put(`water vapour ${this._vapour.toFixed(3)}`, RIGHT_PILL_X, at(0.02), 'left', axR, s.waterMid, this._col(c, WATER));

    // The collapse as a length and not only as a number: the water meter, ticked at the ground
    // value, so the bar under the one pill that moves is the same fact as the digits beside it.
    drawMeter(ctx, c, RIGHT_PILL_X, at(0.02) + 18, WV_METER_W, 8, this._vapour / WV0,
      { col: this._col(c, WATER), target: 1, targetCol: c.label });
  }

  /** One caption, plus a pulsing hint on the two beats the learner is meant to be driving. */
  _caption(ctx, c) {
    const caption = this.stage === S_B0 ? 'the same jar, with a height dial'
      : this.stage === S_B1 ? 'the climb' : 'back at the ground';
    const items = [{ text: caption, bg: c.accent }];
    if (this.stage <= S_B1 && !this._anim) {
      const p = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(this.age * 3.4));
      items.push({ text: 'drag the dial up', bg: mix(c.gold, c.bgDeep, (1 - p) * 0.55) });
    }
    chipRow(ctx, c, items, ZONES.top.x + ZONES.top.w / 2, ZONES.top.y + 18, { align: 'center', size: 15 });
  }

  /** The km readout and the density chip, at the top of the axis, with the density meter under. */
  _readouts(ctx, c) {
    chipRow(ctx, c, [
      { text: `${this._alt.toFixed(1)} km`, bg: c.gold },
      { text: `${this._rho.toFixed(2)} kg/m3`, bg: c.accent },
    ], READ_X, READ_Y, { align: 'left', size: 14 });
    drawMeter(ctx, c, READ_X, READ_Y + 24, METER_W, 8, this._rho / RHO0, { col: c.accent });
  }

  // -- input --------------------------------------------------------------------------------------

  /** The one place the altitude changes, so the celebration cannot fire off an automatic ease. */
  _setAlt(h, byLearner) {
    const next = Math.min(H_MAX, Math.max(0, Math.round(h * 10) / 10));
    this._anim = null;
    this._alt = next;
    this._target = next;
    if (byLearner && !this._done && next >= CELEBRATE_KM) {
      this._done = true;
      this.celebrate(this._frame.grid.x + this._frame.grid.size * 0.86, this._sectors().waterMid, 14);
    }
  }

  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'altitude') { this._setAlt(Number(v), true); this.requestUiUpdate?.(); }
  }

  /** The scale is draggable as well as a slider, so the dial works for a pointer-only learner. */
  _onScale(p) {
    if (Math.abs(p.x - AXIS_X) > 30 || p.y < JAR.y - 20 || p.y > FLOOR_Y + 20) return false;
    return ((FLOOR_Y - p.y) / PX_PER_KM);
  }

  pointerDown(p) {
    const h = this._onScale(p);
    if (h === false) return;
    this._drag = true;
    this._setAlt(h, true);
    this.animateFor?.(300);
    this.requestUiUpdate?.();
  }

  pointerMove(p) {
    if (!this._drag) return false;
    const h = this._onScale(p);
    if (h === false) return false;
    this._setAlt(h, true);
    this.animateFor?.(300);
    return true;
  }

  pointerUp() { this._drag = false; }

  getControlValue(id) { return id === 'altitude' ? String(this._target) : super.getControlValue(id); }
}
