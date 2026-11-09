// GasSampleScene-doubling.js - the jar from lesson one, filled the way lesson one left it, with a
// magnifier you can put on any square. blk-l08-s02, the doubling predict.
//
// This mount is the L08 question and nothing else. The grid is already full (nitrogen 78, oxygen
// 21, the hundredth cell holding argon 0.93 and the two slivers), the loupe is already open on the
// rarest cell, and the ONLY control is that loupe: drag the ring over any square and the readout
// names the gas in it. Nothing runs, nothing counts up, nothing loops.
//
// Rules (briefs/reference/scene-rules.md):
//   - colours only from `c` and mix/alpha/lighten/darken of them
//   - busy() is true while the loupe is being dragged, false the frame it is released
//   - nothing on this frame may say or hint at warming, rates, the future or any length of time;
//     the predict is still open, and a leaked answer here is unrecoverable
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  ZONES, alpha, mix, pill, chipRow, drawBackdrop, drawShadow,
} from 'simulations/base/kit/SimLook.js';
import {
  RARE_CELL, rareBands, gasColor, cellGasIn, readoutLabel,
  jarFrame, drawJar, drawRimLabels, drawLoupe, loupeCellAt,
} from '../L01/AtmosphereJar.js';

const B = ZONES.heroWide;              // the jar owns the whole middle band; nothing else is there
const JAR_W = 318, JAR_H = 348;
const JAR_X = B.x + B.w / 2 - JAR_W / 2;
const JAR_Y = B.y + 6;
const BASE_Y = JAR_Y + JAR_H;

const R = 34;                           // the loupe's radius
// Where in the hundredth cell the lens opens: the middle of carbon dioxide's band, taken from the
// shared layout rather than typed as a fraction, so the aim and the drawing cannot drift apart.
const RARE_FRAC = (() => {
  const L = rareBands();
  return 1 - (L.argon + L.rare[0].frac / 2);        // frac is 0 at the cell's foot, 1 at its head
})();
const HINT_Y = ZONES.bottom.y + ZONES.bottom.h / 2;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// The loupe's home: the hundredth cell, aimed at the middle of carbon dioxide's band inside it.
// That is the square the whole slide is about, so the scene opens with a finger already on it and
// the readout already naming it. The band's middle, not its edge, so no floating-point coin-flip.
const FRAME = jarFrame(JAR_X, JAR_Y, JAR_W, JAR_H);
const HOME = {
  x: FRAME.grid.x + 9.5 * FRAME.grid.cell,
  y: FRAME.grid.y + 9 * FRAME.grid.cell + (1 - RARE_FRAC) * FRAME.grid.cell,
};

// The file name carries a hyphen because the slide's scene does; the class cannot, so it is the
// same name without it. Nothing else in this file is renamed to suit.
export class GasSampleSceneDoubling extends SimScene {
  static NOTE_STAGE = 0;                           // one muted bottom line, and this is one state
  static ARIA_LABEL = 'A glass jar of air holding a hundred square cells. Most squares are one colour and about a fifth are a second; the last square is mostly a third colour with two hairline bands above it. A magnifying ring can be dragged over any square, and a readout underneath names the gas in that square and says how many of the hundred it fills.';
  static CONTROLS = [];                            // the loupe, dragged on the canvas, is the control

  constructor(container, config) {
    super(container, config);
    this._lx = HOME.x;                             // the loupe's centre
    this._ly = HOME.y;
    this._cell = RARE_CELL;                       // which square is under the lens
    this._frac = RARE_FRAC;
    this._gas = 3;                                // which gas that square reads out
    this._drag = false;
    this._taken = false;                          // has the learner ever dragged the loupe
    this._found = false;                          // have they once put it on carbon dioxide
    this._readout = '';                           // held, so it redraws only when it changes
  }

  // The scene's caveat in one muted line: the squares are this scene's own device, and the lens
  // draws the slivers thicker than they are. Nothing about what any of it means. drawNoteLine joins
  // every row onto one line, so this has to fit the 680 px frame on its own.
  noteRows() {
    return [{ text: 'the squares are this scene\u2019s own device \u00b7 the lens draws the slivers thicker' }];
  }

  enter() {
    this._lx = HOME.x;                             // every mount is fresh, and this one is the
    this._ly = HOME.y;                             // same frame every time: the filled grid with the
    this._cell = RARE_CELL;                        // lens already open on the rarest square
    this._frac = RARE_FRAC;
    this._drag = false;
    this._setGas();
  }

  busy() { return this._drag; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    drawShadow(ctx, c, FRAME.cx, BASE_Y + 7, JAR_W * 0.36);
    drawJar(ctx, c, JAR_X, JAR_Y, JAR_W, JAR_H, { lit: 100 });
    drawRimLabels(ctx, c, FRAME);
    this._loupe(ctx, c);
    this._readoutChip(ctx, c);
    if (!this._taken) this._hint(ctx, c);
  }

  // The lens, drawn last so it sits over the cells it is reading. Its centre follows the pointer
  // anywhere on the glass: the readout is "what is under the pointer", so clamping the centre
  // inside the grid would put the top row of the corner cell out of reach. What is clamped is the
  // ring, which may not leave the jar.
  _loupe(ctx, c) {
    this._lx = clamp(this._lx, FRAME.x + R * 0.5, FRAME.x + FRAME.w - R * 0.5);
    this._ly = clamp(this._ly, FRAME.y + R * 0.5, FRAME.y + FRAME.h - R * 0.5);
    drawLoupe(ctx, c, this._lx, this._ly, R, {
      cell: this._cell, frac: this._frac, grabbed: this._drag,
      cellPx: FRAME.grid.cell,                       // so the lens states its true magnification
      handleAngle: -Math.PI * 0.30,
    });
  }

  // One chip, in the bottom band, held until its text changes. It names the gas and its share -
  // the same two facts the learner counted in lesson one, and no third one.
  _readoutChip(ctx, c) {
    const text = readoutLabel(this._gas);
    if (text !== this._readout) this._readout = text;
    const items = [{ text: this._readout, bg: mix(gasColor(c, this._gas), c.bgSurface, 0.25) }];
    // The one-in-2500 chip rides beside the readout only while the lens is on carbon dioxide: it
    // is that gas's share said the other way round, not a sixth thing to learn.
    if (this._gas === 3) items.push({ text: '1 in 2500', bg: c.gold });
    chipRow(ctx, c, items, ZONES.bottom.x + ZONES.bottom.w / 2, HINT_Y, { align: 'center', size: 14 });
  }

  // Until the learner has taken the loupe once, a chip says the one thing to do. It goes for good
  // after that, and never comes back on a later mount of the same state.
  _hint(ctx, c) {
    pill(ctx, c, 'drag the lens over a square', ZONES.top.x + ZONES.top.w / 2, ZONES.top.y + ZONES.top.h / 2,
      { align: 'center', bg: alpha(c.gold, 0.9), size: 14 });
  }

  // ---- the one control: the loupe, dragged on the canvas --------------------------------------

  pointerDown(p) {
    // Grabbing anywhere over the jar's body works, not only on the ring: a learner aiming at a
    // square should not have to find the lens first.
    if (p.x < FRAME.x || p.x > FRAME.x + FRAME.w || p.y < FRAME.y || p.y > FRAME.y + FRAME.h) return;
    this._drag = true;
    this._taken = true;
    this._follow(p);
  }

  pointerMove(p) {
    if (!this._drag) return false;
    this._follow(p);
    this.animateFor(400);
    return true;
  }

  pointerUp() { this._drag = false; }

  _follow(p) {
    const hit = loupeCellAt(FRAME, p.x, p.y, R);
    if (!hit) return;
    this._lx = p.x;
    this._ly = p.y;
    this._cell = hit.cell;
    this._frac = hit.frac;
    this._setGas();
    // The concept is found, not a button pressed: the first time the lens lands on the sliver the
    // whole question is about, it gets one small burst. Once, and never for the other gases.
    if (!this._found && this._gas === 3) {
      this._found = true;
      this.celebrate(this._lx, this._ly, 16);
    }
  }

  // What the readout says, straight off the square and the fraction of it under the lens.
  _setGas() { this._gas = cellGasIn(this._cell, this._frac); }
}