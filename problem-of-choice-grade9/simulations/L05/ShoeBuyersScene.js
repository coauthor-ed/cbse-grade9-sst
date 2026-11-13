/**
 * ShoeBuyersScene - L05 s06 "For Whom to Produce" (2 beats). Canvas, because the buyers are SimFigure people.
 *   b0 buyers: four buyers in a row: a school student (uniform), an office worker, a player in sports kit and a
 *              person at home (everyday clothes). A "?" over each: who will wear which shoes? Under each, an
 *              empty dashed place for a shoe.
 *   b1 shoes:  four shoes drawn big slide in one at a time (0.6 s each) and land under their buyer: school shoe
 *              (low, strap, flat sole), office shoe (long pointed toe, heel, shine), sports shoe (high, thick
 *              rubber sole with grip), slipper (flat sole, one strap). Each has a 2-word tag. Tap a buyer: that
 *              shoe drops in again and is lit; the others dim.
 * The four shoe kinds are drawn here (SimCivic has one generic shoe). Colours are tokens only (this.colors).
 * The canvas has one layout (no portrait layout for canvas scenes): sizes are set to read at 390 px. ASCII only.
 */
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, pill, font, rr, mix, darken, lighten, alpha, clamp01, outBack } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const CX = [70, 210, 350, 490];
const GROUND = 238;
const FIG_H = 158;
const SHOE_Y = 372;      // the shoe's ground line
const SHOE_W = 118;
const SLIDE_S = 0.6;
const T0 = 0.3;
const BUYERS = [
  { name: 'student', role: 'student', look: { outfit: 'uniform', hairStyle: 'braid', bottomStyle: 'skirt', shoeStyle: 'shoe' }, tone: 's1', shoe: 'school', tag: ['simple,', 'strong'] },
  { name: 'office worker', role: 'adult', look: { outfit: 'shirt', hairStyle: 'sidepart', top: 'white', bottom: 'charcoal', shoeStyle: 'shoe', shoe: 'brown', sleeves: 'long' }, tone: 's1', shoe: 'office', tag: ['formal,', 'leather'] },
  { name: 'player', role: 'adult', look: { outfit: 'tee', hairStyle: 'short', top: 's6', bottom: 'navy', bottomStyle: 'shorts', shoeStyle: 'sneaker', shoe: 'white' }, tone: 's1', shoe: 'sports', tag: ['grip,', 'rubber'] },
  { name: 'at home', role: 'adult', look: { outfit: 'kurti', hairStyle: 'bun', bottom: 'cream', shoeStyle: 'sandal' }, tone: 's1', shoe: 'slipper', tag: ['soft,', 'cheap'] },
];

/** One shoe, side view, toe to the right; (x, y) is the ground centre, w its length. kind: school office sports slipper. */
function drawShoe(ctx, c, kind, x, y, w) {
  const u = w, x0 = x - w / 2;
  const P = (fx, fy) => [x0 + fx * u, y + fy * u];
  const path = (pts) => { ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); };
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // Contact shadow.
  ctx.beginPath(); ctx.ellipse(x, y + 2, w * 0.52, w * 0.05, 0, 0, Math.PI * 2); ctx.fillStyle = alpha(c.label, 0.14); ctx.fill();
  if (kind === 'school') {
    const body = darken(c.s5, 0.55), rim = darken(c.s5, 0.75), sole = mix(c.waste, c.bgSurface, 0.45);
    rr(ctx, x0 - 2, y - u * 0.11, u + 4, u * 0.11, u * 0.04); ctx.fillStyle = sole; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = darken(sole, 0.3); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(...P(0.02, -0.1)); ctx.lineTo(...P(0.03, -0.4));
    ctx.quadraticCurveTo(...P(0.2, -0.46), ...P(0.36, -0.42));
    ctx.quadraticCurveTo(...P(0.6, -0.36), ...P(0.86, -0.3));
    ctx.quadraticCurveTo(...P(1.0, -0.26), ...P(0.99, -0.1)); ctx.closePath();
    ctx.fillStyle = body; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = rim; ctx.stroke();
    // One wide strap across the instep, with a square buckle.
    path([P(0.36, -0.43), P(0.5, -0.4), P(0.56, -0.12), P(0.42, -0.12)]); ctx.fillStyle = darken(c.s5, 0.4); ctx.fill(); ctx.stroke();
    rr(ctx, ...P(0.44, -0.3), u * 0.08, u * 0.08, 2); ctx.lineWidth = 2.5; ctx.strokeStyle = mix(c.waste, c.bgSurface, 0.3); ctx.stroke();
  } else if (kind === 'office') {
    const body = darken(c.s8, 0.3), rim = darken(c.s8, 0.6);
    // Heel block and a thin sole.
    rr(ctx, ...P(0.02, -0.12), u * 0.18, u * 0.12, 3); ctx.fillStyle = darken(c.s8, 0.6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(...P(0.2, -0.05)); ctx.lineTo(...P(0.9, -0.04)); ctx.quadraticCurveTo(...P(1.08, -0.04), ...P(1.08, -0.08)); ctx.lineTo(...P(0.2, -0.1)); ctx.closePath();
    ctx.fillStyle = darken(c.s8, 0.6); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(...P(0.02, -0.1)); ctx.lineTo(...P(0.04, -0.36));
    ctx.quadraticCurveTo(...P(0.2, -0.4), ...P(0.34, -0.35));
    ctx.quadraticCurveTo(...P(0.62, -0.28), ...P(0.86, -0.18));
    ctx.quadraticCurveTo(...P(1.1, -0.1), ...P(1.06, -0.08)); ctx.lineTo(...P(0.2, -0.1)); ctx.closePath();
    ctx.fillStyle = body; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = rim; ctx.stroke();
    // Laces and a polished shine on the toe.
    ctx.strokeStyle = lighten(body, 0.55); ctx.lineWidth = 2.5;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(...P(0.36 + k * 0.06, -0.36 + k * 0.025)); ctx.lineTo(...P(0.4 + k * 0.06, -0.31 + k * 0.025)); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(...P(0.7, -0.2)); ctx.quadraticCurveTo(...P(0.84, -0.18), ...P(0.94, -0.13)); ctx.strokeStyle = alpha(lighten(body, 0.8), 0.9); ctx.lineWidth = 4; ctx.stroke();
  } else if (kind === 'sports') {
    const body = c.s1, rim = darken(c.s1, 0.4), sole = mix(c.gold, c.bgSurface, 0.55);
    // A thick rubber sole with a zigzag grip underneath.
    ctx.beginPath(); ctx.moveTo(...P(0, -0.2)); ctx.lineTo(...P(1.02, -0.2)); ctx.quadraticCurveTo(...P(1.06, -0.1), ...P(1.0, -0.05));
    for (let k = 10; k >= 0; k--) ctx.lineTo(...P(k * 0.1, k % 2 ? -0.0 : -0.05));
    ctx.closePath(); ctx.fillStyle = sole; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = darken(sole, 0.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...P(0.02, -0.12)); ctx.lineTo(...P(1.0, -0.12)); ctx.strokeStyle = darken(sole, 0.25); ctx.lineWidth = 2; ctx.stroke();
    // A high padded upper, round toe.
    ctx.beginPath();
    ctx.moveTo(...P(0.02, -0.2)); ctx.lineTo(...P(0.04, -0.58));
    ctx.quadraticCurveTo(...P(0.18, -0.64), ...P(0.3, -0.56));
    ctx.quadraticCurveTo(...P(0.55, -0.44), ...P(0.8, -0.38));
    ctx.quadraticCurveTo(...P(1.04, -0.34), ...P(1.02, -0.2)); ctx.closePath();
    ctx.fillStyle = body; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = rim; ctx.stroke();
    // Two side stripes (no logo) and laces.
    ctx.strokeStyle = mix(c.bgSurface, c.s1, 0.15); ctx.lineWidth = 5;
    for (const k of [0, 1]) { ctx.beginPath(); ctx.moveTo(...P(0.3 + k * 0.13, -0.24)); ctx.lineTo(...P(0.42 + k * 0.13, -0.46)); ctx.stroke(); }
    ctx.strokeStyle = lighten(c.s1, 0.7); ctx.lineWidth = 2.5;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(...P(0.3 + k * 0.08, -0.55 + k * 0.04)); ctx.lineTo(...P(0.36 + k * 0.08, -0.5 + k * 0.04)); ctx.stroke(); }
  } else {
    // Slipper: a flat soft sole and one strap; nothing else.
    const sole = c.s6, strap = c.s7;
    ctx.beginPath(); ctx.moveTo(...P(0.02, -0.03)); ctx.quadraticCurveTo(...P(0, -0.1), ...P(0.08, -0.1));
    ctx.lineTo(...P(0.92, -0.09)); ctx.quadraticCurveTo(...P(1.02, -0.08), ...P(1.0, -0.02)); ctx.closePath();
    ctx.fillStyle = sole; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = darken(sole, 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...P(0.06, -0.09)); ctx.lineTo(...P(0.94, -0.085)); ctx.strokeStyle = lighten(sole, 0.4); ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...P(0.34, -0.1)); ctx.quadraticCurveTo(...P(0.5, -0.36), ...P(0.72, -0.1));
    ctx.strokeStyle = darken(strap, 0.3); ctx.lineWidth = u * 0.1; ctx.stroke();
    ctx.strokeStyle = strap; ctx.lineWidth = u * 0.07; ctx.stroke();
  }
  ctx.restore();
}

export class ShoeBuyersScene extends SimScene {
  static WIDTH = 560;
  static HEIGHT = 480;
  static CONTINUOUS = false;
  static DRAGGABLE = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Four buyers: a school student, an office worker, a player and a person at home, each with a question mark: who will wear which shoes? Then four shoes slide in, one to each buyer: simple, strong school shoes; formal, leather office shoes; sports shoes with a rubber sole that grips; soft, cheap slippers. Tap a buyer to see their shoe again.';

  enter() {
    this.lit = -1;
    this.drop = null;   // { k, t } a replayed shoe dropping in, from scene age t
  }

  busy() {
    if (this.stage !== 1) return this.age < 1.2;
    if (this.drop && this.age - this.drop.t < SLIDE_S + 0.1) return true;
    return this.age < T0 + SLIDE_S * 4 + 0.2;
  }

  pointerDown(p) {
    if (this.stage !== 1) return false;
    for (let k = 0; k < 4; k++) {
      if (Math.abs(p.x - CX[k]) < 70 && p.y > 30 && p.y < 470) {
        this.lit = k;
        this.drop = { k, t: this.age };
        return true;
      }
    }
    return false;
  }

  /** Progress 0..1 of shoe k arriving (slide in from the right; a replay drops it from above). */
  shoeIn(k) {
    if (this.drop && this.drop.k === k) return { u: clamp01((this.age - this.drop.t) / SLIDE_S), drop: true };
    return { u: clamp01((this.age - T0 - k * SLIDE_S) / SLIDE_S), drop: false };
  }

  drawBuyer(ctx, c, k, a) {
    const b = BUYERS[k], x = CX[k];
    ctx.save();
    ctx.globalAlpha *= a;
    const spec = figureFor(this, { role: b.role, pose: 'relax', x, y: GROUND, height: FIG_H, facing: 0, i: k + 1, mood: this.stage === 1 ? 'smile' : 'think', look: b.look });
    drawFigure(ctx, c, spec, spec.look);
    pill(ctx, c, b.name, x, GROUND + 26, { size: 18, bg: c.bgSurface, ink: c.label });
    ctx.restore();
  }

  drawAsk(ctx, c, k, u) {
    if (u <= 0) return;
    const x = CX[k] + 30, y = 48, s = outBack(clamp01(u));
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(-24, 34); ctx.lineTo(-2, 18); ctx.closePath(); ctx.fillStyle = c.bgSurface; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 3, 24, 0, Math.PI * 2); ctx.fillStyle = darken(c.stroke, 0.1); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fillStyle = c.bgSurface; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = c.accent; ctx.stroke();
    ctx.font = font(c, 800, 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.accent;
    ctx.fillText('?', 0, 2);
    ctx.restore();
  }

  drawSlot(ctx, c, k) {
    const x = CX[k];
    ctx.save();
    rr(ctx, x - 64, SHOE_Y - 74, 128, 86, 14);
    ctx.setLineDash([8, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = alpha(c.labelMuted, 0.8); ctx.stroke();
    ctx.restore();
  }

  drawTag(ctx, c, k, a, lit) {
    const x = CX[k], y = SHOE_Y + 44, b = BUYERS[k];
    ctx.save();
    ctx.globalAlpha *= a;
    rr(ctx, x - 62, y - 26 + 3, 124, 56, 14); ctx.fillStyle = darken(lit ? c.accent : c.stroke, 0.15); ctx.fill();
    rr(ctx, x - 62, y - 26, 124, 56, 14); ctx.fillStyle = lit ? mix(c.accent, c.bgSurface, 0.82) : c.bgSurface; ctx.fill();
    ctx.lineWidth = lit ? 3.5 : 2.5; ctx.strokeStyle = lit ? c.accent : c.stroke; ctx.stroke();
    ctx.font = font(c, 800, 19); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.fillText(b.tag[0], x, y - 11); ctx.fillText(b.tag[1], x, y + 13);
    ctx.restore();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    ctx.fillStyle = alpha(c.stroke, 0.18);
    rr(ctx, 16, GROUND - 2, 528, 5, 3); ctx.fill();
    if (this.stage === 0) {
      for (let k = 0; k < 4; k++) {
        this.drawBuyer(ctx, c, k, 1);
        this.drawAsk(ctx, c, k, (this.age - 0.2 - k * 0.15) / 0.4);
        this.drawSlot(ctx, c, k);
      }
      ctx.font = font(c, 800, 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.labelMuted ?? c.label;
      ctx.fillText('who will wear which shoes?', 280, SHOE_Y + 62);
      return;
    }
    for (let k = 0; k < 4; k++) {
      const on = this.lit < 0 || this.lit === k, a = on ? 1 : 0.32;
      this.drawBuyer(ctx, c, k, a);
      const { u, drop } = this.shoeIn(k);
      if (u <= 0) { this.drawSlot(ctx, c, k); continue; }
      const e = 1 - Math.pow(1 - u, 3);
      const sx = drop ? CX[k] : CX[k] + (640 - CX[k]) * (1 - e);
      const sy = drop ? SHOE_Y - 90 * (1 - e) : SHOE_Y - Math.sin(Math.PI * e) * 26;
      ctx.save();
      ctx.globalAlpha *= a;
      if (this.lit === k) {
        rr(ctx, CX[k] - 66, SHOE_Y - 80, 132, 94, 16);
        ctx.fillStyle = alpha(c.accent, 0.14); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.accent; ctx.stroke();
      }
      drawShoe(ctx, c, BUYERS[k].shoe, sx, sy, SHOE_W);
      ctx.restore();
      this.drawTag(ctx, c, k, a * clamp01((u - 0.6) / 0.4), this.lit === k);
    }
  }

  testState() { return { stage: this.stage, lit: this.lit, busy: this.busy() }; }
}
