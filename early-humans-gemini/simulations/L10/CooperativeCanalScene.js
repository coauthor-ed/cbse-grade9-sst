// CooperativeCanalScene - blk-l10-s08, 4 beats. Beat 0: one person, a short ditch that stops far from the fields. Beat 1: three
// households and an organiser, one long ditch, and the water reaches the green fields. Beat 2: a clean true-scale rail of Egypt's
// ages in the book's order. Beat 3: the three Kingdoms on the same rail. Canvas: people come from SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, mix, pill, rr, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';

const W = 680, H = 520, G = 300;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const X = (y) => 34 + ((y + 5500) / 4500) * 612;

export class CooperativeCanalScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'One person digs a short ditch that stops far from the fields. Three households and an organiser dig one long ditch and the water reaches the fields. Then a true-scale rail: Neolithic, Chalcolithic, Bronze Age and the Old, Middle and New Kingdoms.';

  busy() { return this.age < 1.8; }

  draw(ctx, c) {
    const s = this.stage ?? 0, k = clamp(this.age / 1.5, 0, 1);
    if (s <= 1) this._land(ctx, c, s, k); else this._rail(ctx, c, s, k);
  }

  _land(ctx, c, s, k) {
    const ground = mix(c.gold, c.bgSurface, 0.42), rnd = mulberry32(7);
    ctx.fillStyle = mix(c.bgSurface, c.s1, 0.1); ctx.fillRect(0, 0, W, 120);
    ctx.fillStyle = ground; ctx.fillRect(0, 120, W, H - 120);
    ctx.fillStyle = darken(ground, 0.1); for (let i = 0; i < 120; i++) ctx.fillRect(rnd() * W, 130 + rnd() * 380, 5, 2);
    // The river, across the left edge.
    ctx.fillStyle = c.seaShallow; ctx.fillRect(0, 120, 94, H - 120); ctx.fillStyle = darken(c.seaShallow, 0.18); ctx.fillRect(94, 120, 8, H - 120);
    pill(ctx, c, 'Nile', 50, 158, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    // Fields at the far end.
    const wet = s === 1 ? clamp((k - 0.5) / 0.4, 0, 1) : 0;
    for (const [fx, fy] of [[480, 196], [480, 330], [570, 196], [570, 330]]) { const col = mix(darken(c.gold, 0.2), c.elevLow, wet); rr(ctx, fx, fy, 84, 124, 8); ctx.fillStyle = col; ctx.fill(); }
    const end = s === 0 ? 240 : 470, dug = 100 + (end - 100) * (s === 1 ? 1 : k);
    rr(ctx, 96, G - 18, 374, 36, 8); ctx.fillStyle = darken(ground, 0.05); ctx.fill();
    rr(ctx, 96, G - 18, dug - 96, 36, 8); ctx.fillStyle = darken(c.elevHigh, 0.45); ctx.fill();
    const w = s === 1 ? dug * clamp(k / 0.6, 0, 1) : dug;
    rr(ctx, 96, G - 11, Math.max(0, w - 96), 22, 6); ctx.fillStyle = c.seaShallow; ctx.fill();
    if (s === 0) {
      const f = figureFor(this, { role: 'farmer', pose: { name: 'stand', crouch: 0.3, lean: 0.25 }, x: 214, y: G - 18, height: 170, facing: 1, i: 0 });
      drawFigure(ctx, c, f, f.look);
      pill(ctx, c, 'One family', 340, 60, { size: 36, bg: c.bgSurface, ink: c.label, display: true });
      ctx.save(); ctx.setLineDash([4, 12]); ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = c.bad; ctx.beginPath(); ctx.moveTo(250, G); ctx.lineTo(470, G); ctx.stroke(); ctx.restore();
      pill(ctx, c, 'Too far', 362, 366, { size: 32, bg: c.bad, display: true });
    } else {
      [[170, 0], [270, 1], [370, 2]].forEach(([x, i]) => { const f = figureFor(this, { role: 'farmer', pose: { name: 'stand', crouch: 0.3, lean: 0.25 }, x, y: G - 18, height: 150, facing: 1, i }); drawFigure(ctx, c, f, f.look); });
      const o = figureFor(this, { role: 'elder', pose: 'point', x: 330, y: G + 190, height: 170, facing: 1, i: 3 });
      drawFigure(ctx, c, o, o.look);
      pill(ctx, c, 'Three households, one ditch', 340, 56, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'Who digs, where, when?', 196, 478, { size: 27, bg: c.s5, display: true });
    }
  }

  _bar(ctx, c, from, to, y, col, label, o = {}) {
    const x1 = X(from), x2 = X(to), h = 54;
    rr(ctx, x1, y + 5, x2 - x1, h, 10); ctx.fillStyle = darken(col, 0.3); ctx.fill();
    rr(ctx, x1, y, x2 - x1, h, 10); ctx.fillStyle = col; ctx.fill();
    if (o.inside) pill(ctx, c, label, (x1 + x2) / 2, y + h / 2, { size: 28, bg: col, display: true }); else pill(ctx, c, label, o.lx ?? (x1 + x2) / 2, y + (o.below ? h + 30 : -22), { size: 26, bg: c.bgSurface, ink: c.label, display: true });
  }

  _rail(ctx, c, s, k) {
    ctx.fillStyle = mix(c.bgSurface, c.gold, 0.06); ctx.fillRect(0, 0, W, H);
    const dim = s === 3 ? 0.4 : 1, y0 = s === 3 ? 92 : 130;
    ctx.save(); ctx.globalAlpha *= dim;
    this._bar(ctx, c, -5500, -4000, y0, c.s3, 'Neolithic', { inside: true });
    this._bar(ctx, c, -4000, -3100, y0, c.s5, 'Chalcolithic', { lx: X(-3550) });
    this._bar(ctx, c, -3100, -1000, y0, c.s2, 'Bronze Age', { inside: true });
    ctx.restore();
    const xm = X(-3000);
    ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.setLineDash([3, 8]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xm, y0 - 8); ctx.lineTo(xm, 410); ctx.stroke(); ctx.setLineDash([]);
    if (s === 2) pill(ctx, c, 'About 3000 BCE: ditches, city-states', 340, 300, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    else {
      const y = 262, g = clamp(k * 2, 0, 1);
      ctx.save(); ctx.globalAlpha *= g;
      this._bar(ctx, c, -2686, -2181, y, c.s1, 'Old');
      this._bar(ctx, c, -2030, -1650, y, c.s6, 'Middle', { below: true });
      this._bar(ctx, c, -1570, -1069, y, c.s7, 'New');
      ctx.restore();
      pill(ctx, c, 'Three Kingdoms', 200, 286, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    }
    // Axis.
    rr(ctx, 34, 416, 612, 6, 3); ctx.fillStyle = c.track ?? c.label; ctx.fill();
    (s === 2 ? [[-5500, '5500 BCE'], [-4000, '4000'], [-3100, '3100'], [-1000, '1000 BCE']] : [[-5500, '5500 BCE'], [-2686, '2686'], [-1069, '1069 BCE']]).forEach(([y, t], i, a) => {
      const x = clamp(X(y), 76, 604); ctx.fillStyle = c.label; ctx.fillRect(X(y) - 2, 408, 4, 20);
      pill(ctx, c, t, x, 456, { size: 26, bg: c.bgSurface, ink: c.label, display: false });
    });
  }
}
