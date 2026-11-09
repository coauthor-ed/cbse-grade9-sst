// CanalIrrigationScene - blk-l08-s03, 4 beats. Beat 0: from above, a river, a dam, a canal and fields that turn green as the
// water reaches them, then it rests. Beat 1: down at the river bank, a worker shaping mud bricks, with sun-dried bricks and
// burnt bricks beside him. Beat 2: the plan again with a city and a line round the land it rules. Beat 3: three cities of Sumer.
// Canvas: the worker comes from SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, lighten, mix, pill, rr, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const FIELDS = [[190, 214, 118, 84], [320, 214, 118, 84], [450, 214, 118, 84], [190, 318, 118, 84], [320, 318, 118, 84], [450, 318, 118, 84]];
const CITIES = [['Eridu', 256, 120], ['Uruk', 290, 270], ['Ur', 240, 420]];

export class CanalIrrigationScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'From above, a river with a dam and a canal that waters fields. Then a worker making bricks from river clay beside the water. Then a city with its temple ruling the land around it, and three cities of Sumer.';

  busy() { return this.age < (this.stage === 0 ? 2.2 : 0.9); }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    if (s === 1) { this._bank(ctx, c, clamp(t / 0.7, 0, 1)); return; }
    this._ground(ctx, c);
    this._river(ctx, c);
    if (s === 3) { this._three(ctx, c, clamp(t / 0.8, 0, 1)); return; }
    const k = s === 0 ? clamp(t / 1.8, 0, 1) : 1;
    this._canal(ctx, c, k);
    if (s === 0) {
      pill(ctx, c, 'Dam', 112, 140, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'Canal', 360, 178, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'Fields', 380, 466, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'River', 60, 480, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
    } else {
      this._city(ctx, c, 510, 450, 1.1);
      ctx.save(); ctx.setLineDash([3, 16]); ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = c.s5;
      rr(ctx, 170, 168, 492, 344, 30); ctx.stroke(); ctx.restore();
      pill(ctx, c, 'City-state', 415, 168, { size: 32, bg: c.s5, display: true });
    }
  }

  _ground(ctx, c) {
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.5); ctx.fillRect(0, 0, W, H);
    const rnd = mulberry32(21); ctx.fillStyle = alpha(darken(c.gold, 0.4), 0.14);
    for (let i = 0; i < 240; i++) ctx.fillRect(rnd() * W, rnd() * H, 3, 2);
  }

  _river(ctx, c) {
    ctx.lineCap = 'butt';
    const path = () => { ctx.beginPath(); ctx.moveTo(110, -10); ctx.bezierCurveTo(90, 160, 150, 320, 70, 530); };
    path(); ctx.strokeStyle = darken(c.seaShallow, 0.25); ctx.lineWidth = 70; ctx.stroke();
    path(); ctx.strokeStyle = c.seaShallow; ctx.lineWidth = 60; ctx.stroke();
  }

  _canal(ctx, c, k) {
    // Dam: a bar across the river below the canal mouth.
    ctx.lineCap = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = c.elevHigh;
    ctx.beginPath(); ctx.moveTo(62, 216); ctx.lineTo(160, 216); ctx.stroke();
    const dry = mix(darken(c.gold, 0.2), c.bgSurface, 0.2);
    const run = (pts, kk) => {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.strokeStyle = dry; ctx.lineWidth = 18; ctx.stroke();
      if (kk <= 0) return;
      let left = kk * pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length && left > 0; i++) { const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), f = Math.min(1, left / d); ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); left -= d; }
      ctx.strokeStyle = c.seaShallow; ctx.lineWidth = 12; ctx.stroke();
    };
    run([[124, 190], [640, 190]], clamp(k / 0.45, 0, 1));
    const sub = clamp((k - 0.4) / 0.3, 0, 1);
    for (const x of [314, 444, 584]) run([[x, 190], [x, 410]], sub);
    FIELDS.forEach((f, i) => {
      const g = clamp((k - 0.6 - (i % 3) * 0.06) / 0.25, 0, 1), col = mix(darken(c.gold, 0.25), c.elevLow, g);
      rr(ctx, f[0], f[1] + 4, f[2], f[3], 8); ctx.fillStyle = darken(col, 0.3); ctx.fill();
      rr(ctx, f[0], f[1], f[2], f[3], 8); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = darken(col, 0.2); ctx.lineWidth = 3;
      for (let j = 1; j < 5; j++) { ctx.beginPath(); ctx.moveTo(f[0] + 8, f[1] + j * f[3] / 5); ctx.lineTo(f[0] + f[2] - 8, f[1] + j * f[3] / 5); ctx.stroke(); }
    });
  }

  _city(ctx, c, x, y, sc) {
    const b = c.elevHigh, tier = (w, h, yy, col) => { rr(ctx, x - w * sc / 2, yy - h * sc, w * sc, h * sc, 3); ctx.fillStyle = col; ctx.fill(); };
    rr(ctx, x - 62 * sc, y - 52 * sc, 124 * sc, 62 * sc, 10); ctx.fillStyle = mix(c.gold, c.bgSurface, 0.2); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = darken(b, 0.2); ctx.stroke();
    tier(80, 16, y, b); tier(54, 14, y - 16 * sc, lighten(b, 0.2)); tier(30, 14, y - 30 * sc, b);
  }

  _three(ctx, c, k) {
    CITIES.forEach(([name, x, y], i) => {
      const g = clamp(k * 1.8 - i * 0.4, 0, 1);
      if (g <= 0) return;
      ctx.save(); ctx.globalAlpha *= g;
      ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = c.seaShallow;
      ctx.beginPath(); ctx.moveTo(i === 1 ? 126 : 112, y - 16); ctx.lineTo(x + 200, y - 16); ctx.stroke();
      for (const dx of [80, 168]) { rr(ctx, x + dx, y - 54, 80, 34, 7); ctx.fillStyle = mix(darken(c.gold, 0.2), c.elevLow, 0.85); ctx.fill(); rr(ctx, x + dx, y - 12, 80, 34, 7); ctx.fill(); }
      this._city(ctx, c, x, y + 4, 1);
      pill(ctx, c, name, x, y + 40, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      ctx.restore();
    });
  }

  _bank(ctx, c, k) {
    const f = 430;
    const sky = ctx.createLinearGradient(0, 0, 0, 110); sky.addColorStop(0, alpha(c.s1, 0.3)); sky.addColorStop(1, alpha(c.gold, 0.12));
    ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, W, H); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 110);
    ctx.fillStyle = c.seaShallow; ctx.fillRect(0, 96, W, 62);
    ctx.fillStyle = darken(c.seaShallow, 0.18); ctx.fillRect(0, 150, W, 8);
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.42); ctx.fillRect(0, 158, W, H - 158);
    const rnd = mulberry32(8); ctx.fillStyle = alpha(darken(c.elevHigh, 0.3), 0.25);
    for (let i = 0; i < 130; i++) ctx.fillRect(rnd() * W, 162 + rnd() * 356, 4, 2);
    ctx.fillStyle = darken(c.elevHigh, 0.2); ctx.beginPath(); ctx.ellipse(76, 300, 74, 62, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = darken(c.elevHigh, 0.42); ctx.fillRect(2, 298, 148, 5);
    const brick = (x, y, col) => { rr(ctx, x, y + 5, 74, 36, 6); ctx.fillStyle = darken(col, 0.34); ctx.fill(); rr(ctx, x, y, 74, 36, 6); ctx.fillStyle = col; ctx.fill(); };
    const mud = c.elevHigh, burnt = darken(c.s8, 0.3);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (k * 9 > i + j * 3) brick(388 + i * 90, 216 + j * 52, mud);
    for (let i = 0; i < 3; i++) if (k * 9 > 6 + i) brick(388 + i * 90, 420, burnt);
    const hands = [{ x: 246, y: f - 4 }, { x: 306, y: f - 4 }];
    const spec = figureFor(this, { role: 'worker', pose: { name: 'stand', crouch: 0.4, lean: 0.3 }, x: 196, y: f + 44, height: 250, facing: 1, hands });
    drawFigure(ctx, c, spec, spec.look);
    ctx.lineWidth = 8; ctx.strokeStyle = darken(c.elevHigh, 0.5); rr(ctx, 232, f - 8, 88, 44, 4); ctx.stroke();
    rr(ctx, 236, f - 4, 80, 36, 3); ctx.fillStyle = mud; ctx.fill();
    pill(ctx, c, 'River clay', 96, 200, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'Mud bricks', 524, 186, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'Burnt bricks', 524, 488, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
  }
}
