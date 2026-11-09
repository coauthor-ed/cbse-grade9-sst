// GrainToFlourScene - blk-l05-s04, from beat 4. A person kneels at a saddle quern. Beat grind: grain on the stone
// becomes flour over a few strokes, then the work rests. Beat village: the flour and grain go into pots beside a
// hut. Beat what: the three things the word brings together. Canvas, because the person is a kit figure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, lighten, mix, pill, rr, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';

const MAP = [0, 0, 0, 0, 0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const GROUND = 430;
const Q = { x: 352, w: 262, y: GROUND - 8 };   // the quern: left edge, length, foot
const RUN = 5.5;                                 // seconds of grinding
const STROKES = 7;
const hx0 = (x, w) => x + w * 0.38;

export class GrainToFlourScene extends SimScene {
  static simId = 'grain-to-flour-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'A woman kneels at a saddle quern, a long stone with a hollow, and rubs a hand-stone back and forth over grain. Flour gathers at the end of the stone. Then the grain and flour are stored in clay pots beside a hut.';

  enter(s) {
    if (s === 0) this.animateFor((RUN + 0.3) * 1000);
    else this.animateFor(900);
  }

  busy() { return (this.stage ?? 0) === 0 && this.age < RUN; }

  _world(ctx, c) {
    const wall = mix(c.strata1, c.bgSurface, 0.45), wall2 = darken(wall, 0.06);
    ctx.fillStyle = wall; ctx.fillRect(0, 0, 680, GROUND);
    ctx.fillStyle = wall2;
    for (let r = 0; r < 12; r += 1) for (let i = 0; i < 9; i += 1) { rr(ctx, i * 84 - (r % 2) * 42 + 2, r * 36 + 3, 80, 32, 5); ctx.fill(); }
    ctx.fillStyle = alpha(c.bgSurface, 0.35); ctx.fillRect(0, 0, 680, GROUND);
    ctx.fillStyle = c.strata2; ctx.fillRect(0, GROUND, 680, 120);
    ctx.fillStyle = darken(c.strata2, 0.14); ctx.fillRect(0, GROUND, 680, 7);
    const rnd = mulberry32(19);
    ctx.fillStyle = alpha(darken(c.strata2, 0.3), 0.4);
    for (let i = 0; i < 60; i += 1) ctx.fillRect(rnd() * 680, GROUND + 12 + rnd() * 76, 3, 3);
  }

  _quern(ctx, c, p, stroke) {
    const { x, w, y } = Q, stone = mix(c.strata5, c.bgSurface, 0.35), top = y - 66;
    ctx.beginPath();
    ctx.moveTo(x, top - 8);
    ctx.quadraticCurveTo(x + w / 2, top + 54, x + w, top - 8);
    ctx.quadraticCurveTo(x + w + 26, y - 26, x + w - 26, y);
    ctx.lineTo(x + 26, y);
    ctx.quadraticCurveTo(x - 26, y - 26, x, top - 8);
    ctx.closePath();
    ctx.fillStyle = stone; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = darken(stone, 0.4); ctx.stroke();
    const rnd = mulberry32(5);
    ctx.fillStyle = alpha(darken(stone, 0.35), 0.45);
    for (let i = 0; i < 40; i += 1) { const a = x + 20 + rnd() * (w - 40), b = y - 8 - rnd() * 34; ctx.fillRect(a, b, 4, 3); }
    // grain on the stone, fewer as the work goes on
    const grainN = Math.round(46 * (1 - p));
    const r2 = mulberry32(8);
    for (let i = 0; i < 46; i += 1) {
      const u = r2(), gx = x + 50 + u * (w - 100), d = (gx - (x + w / 2)) / (w / 2), gy = top + 21 - 20 * d * d * 1.1 - r2() * 4;
      if (i < grainN) { ctx.fillStyle = c.gold; ctx.beginPath(); ctx.ellipse(gx, gy, 7, 4.5, u * 3, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = darken(c.gold, 0.3); ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    // the flour, a growing heap past the far end of the stone
    const fx = x + w + 34, fh = 8 + 66 * p, fw = 30 + 42 * p, flour = lighten(c.strata1, 0.65);
    ctx.beginPath(); ctx.moveTo(fx - fw, GROUND + 4); ctx.quadraticCurveTo(fx, GROUND + 4 - fh * 2, fx + fw, GROUND + 4); ctx.closePath();
    ctx.fillStyle = flour; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(flour, 0.2); ctx.stroke();
    // the hand-stone
    const hx = x + w * 0.38 + stroke * 40, d = (hx0(x, w) + stroke * 40 - (x + w / 2)) / (w / 2), hy = top + 2 - 20 * d * d;
    const hand = mix(c.strata5, c.bgSurface, 0.15);
    ctx.beginPath(); ctx.ellipse(hx, hy, 64, 25, stroke * -0.08, 0, Math.PI * 2);
    ctx.fillStyle = hand; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = darken(hand, 0.45); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx - 16, hy - 8, 26, 6, 0, 0, Math.PI * 2); ctx.fillStyle = alpha(c.bgSurface, 0.4); ctx.fill();
    return { hx, hy };
  }

  _pot(ctx, c, x, y, s, fillK = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const clay = mix(c.s8, c.strata3, 0.3);
    ctx.beginPath(); ctx.moveTo(-34, -82); ctx.lineTo(34, -82); ctx.lineTo(28, -66);
    ctx.bezierCurveTo(70, -48, 66, -8, 30, 0); ctx.lineTo(-30, 0); ctx.bezierCurveTo(-66, -8, -70, -48, -28, -66); ctx.closePath();
    ctx.fillStyle = clay; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = darken(clay, 0.4); ctx.stroke();
    ctx.strokeStyle = darken(clay, 0.2); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-46, -36); ctx.quadraticCurveTo(0, -24, 46, -36); ctx.stroke();
    ctx.fillStyle = c.gold; rr(ctx, -28, -86, 56, 8, 4); ctx.fill();
    ctx.restore();
  }

  _hut(ctx, c, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const mud = c.strata3, roof = mix(c.gold, c.strata3, 0.3);
    rr(ctx, -80, -92, 160, 92, 8); ctx.fillStyle = mud; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = darken(mud, 0.4); ctx.stroke();
    rr(ctx, -20, -62, 40, 62, 8); ctx.fillStyle = darken(mud, 0.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-110, -86); ctx.lineTo(0, -180); ctx.lineTo(110, -86); ctx.quadraticCurveTo(0, -68, -110, -86); ctx.closePath();
    ctx.fillStyle = roof; ctx.fill(); ctx.strokeStyle = darken(roof, 0.4); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = darken(roof, 0.25);
    for (const dx of [-50, -18, 18, 50]) { ctx.beginPath(); ctx.moveTo(dx * 1.5, -82); ctx.lineTo(dx * 0.4, -150); ctx.stroke(); }
    ctx.restore();
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    this._world(ctx, c);
    if (s === 0) {
      const p = clamp(t / RUN, 0, 1);
      const stroke = p >= 1 ? -0.4 : Math.sin(p * STROKES * Math.PI * 2 - 0.4);
      ctx.save();
      ctx.translate(360, GROUND); ctx.scale(1.3, 1.3); ctx.translate(-420, -GROUND);
      const h = this._quern(ctx, c, p, stroke);
      const fig = figureFor(this, { role: 'farmer', i: 1, x: h.hx - 126, y: GROUND + 8, height: 176, facing: 1,
        pose: { name: 'push', crouch: 0.62, lean: 44 }, hands: [{ x: h.hx - 54, y: h.hy - 12 }, { x: h.hx - 38, y: h.hy - 16 }] });
      drawFigure(ctx, c, fig, fig.look);
      ctx.restore();
      pill(ctx, c, 'saddle quern', 400, 494, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, p >= 1 ? 'flour' : 'grain', p >= 1 ? 612 : 440, p >= 1 ? 170 : 150, { size: 30, display: true });
      return;
    }
    const k = clamp(t / 0.5, 0, 1);
    this._hut(ctx, c, 470, GROUND + 2, 1.15);
    this._pot(ctx, c, 110, GROUND + 22, 1.5);
    this._pot(ctx, c, 236, GROUND + 26, 1.15);
    this._pot(ctx, c, 40, GROUND + 40, 0.8);
    ctx.save(); ctx.globalAlpha = k;
    if (s === 1) {
      pill(ctx, c, 'stored grain', 164, 240, { size: 28, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'a fixed home', 470, 170, { size: 28, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'the first villages', 340, 490, { size: 28, display: true });
    } else {
      pill(ctx, c, 'plants and animals under control', 340, 54, { size: 28, display: true });
      pill(ctx, c, 'new tools', 164, 240, { size: 26, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'pots', 164, 492, { size: 26, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'villages', 470, 492, { size: 26, display: true, bg: c.bgSurface, ink: c.label });
    }
    ctx.restore();
  }
}
