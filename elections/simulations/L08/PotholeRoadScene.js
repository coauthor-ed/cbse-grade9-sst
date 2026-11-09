// PotholeRoadScene - L08 s01, Fig 7.13. A winding road to a polling station, with a queue. Three potholes
// named, several empty: the scene never gives a count. Stages: 0 setup (thin file): named road, no
// reading; 1 the size of the task; 2 three named; 3 the empty ones, tap one for an idea tag.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tones, day, folk, pop, label, tile, say, lines, rr, mix, ellipse, hi, ROAD as S } from '../L06/PartyWorld.js';

const B = [[[120, 196], [420, 150], [660, 170], [560, 240]], [[560, 240], [470, 290], [60, 240], [130, 330]], [[130, 330], [190, 402], [460, 340], [700, 440]]];
const at = (t) => {
  const n = B.length, f = Math.min(n - 1e-6, t * n), i = Math.floor(f), u = f - i, [a, b, d, e] = B[i], v = 1 - u;
  const w = (k) => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * d[k] + u * u * u * e[k];
  return [w(0), w(1)];
};
const NAMED = [{ t: 0.30, n: 'Intimidation' }, { t: 0.56, n: 'Misinformation' }, { t: 0.83, n: 'Fake news' }];
const EMPTY = [0.14, 0.44, 0.69, 0.95];

export class PotholeRoadScene extends SimScene {
  static BEAT_STEP_MAP = [S.TASK, S.NAMED, S.EMPTY].map((idx) => [{ idx, dwellMs: null }]);
  static HEIGHT = 456;
  static CONTROLS = [];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A winding road leads to a polling booth with a queue of voters and a sign, Free and Fair Elections. Three potholes are named intimidation, misinformation and fake news. Other potholes are empty: tap one to mark it as your idea.';

  constructor(container, config) { super(container, config); this.mine = new Set(); }
  enter() { this.mine = new Set(); }
  busy() { return this.age < 1; }
  pointerDown(p) {
    if (this.stage !== S.EMPTY) return false;
    for (const t of EMPTY) { const q = at(t); if (Math.hypot(p.x - q[0], p.y - q[1]) < 46) { if (this.mine.has(t)) this.mine.delete(t); else this.mine.add(t); return true; } }
    return false;
  }

  _world(ctx, c) {
    const t = tones(c);
    day(ctx, c, 680, 456, { ground: 130, sun: false });
    ctx.fillStyle = t.plaster; rr(ctx, 14, 26, 196, 148, 6); ctx.fill();
    ctx.fillStyle = t.wood; rr(ctx, 4, 14, 216, 20, 6); ctx.fill();
    ctx.fillStyle = t.greyDark; rr(ctx, 112, 92, 62, 82, 4); ctx.fill();
    label(ctx, c, 'Polling booth', 112, 62, { size: 30 });
    ctx.strokeStyle = t.road; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 74;
    const road = () => { ctx.beginPath(); ctx.moveTo(...B[0][0]); B.forEach((s) => ctx.bezierCurveTo(...s[1], ...s[2], ...s[3])); ctx.stroke(); };
    ctx.strokeStyle = t.roadEdge; ctx.lineWidth = 82; road();
    ctx.strokeStyle = t.grey; ctx.lineWidth = 70; road();
    ['voter', 'elder', 'adult', 'student', 'farmer'].forEach((role, i) => folk(ctx, this, { role, x: 236 + i * 48, y: 150 + i * 2, height: 104, facing: -1, i: i + 1 }));
    ctx.fillStyle = t.wood; ctx.fillRect(572, 66, 9, 72);
    tile(ctx, c, 478, 8, 196, 84, { fill: c.bgSurface, r: 10 });
    lines(ctx, c, ['Free and Fair', 'Elections'], 576, 50, { size: 30, lh: 34 });
  }

  _hole(ctx, c, t, o = {}) {
    const q = at(t), g = tones(c);
    ctx.fillStyle = mix(g.greyDark, c.label, 0.3); ellipse(ctx, q[0], q[1], 38, 15); ctx.fill();
    ctx.fillStyle = g.greyDark; ellipse(ctx, q[0], q[1] + 3, 32, 11); ctx.fill();
    if (o.ring) { ctx.strokeStyle = c.accent; ctx.lineWidth = 4; ctx.setLineDash([7, 7]); ellipse(ctx, q[0], q[1], 46, 22); ctx.stroke(); ctx.setLineDash([]); }
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    this._world(ctx, c);
    EMPTY.forEach((t) => this._hole(ctx, c, t, { ring: s === S.EMPTY && !this.mine.has(t) }));
    NAMED.forEach((h) => this._hole(ctx, c, h.t));
    if (s !== S.TASK) NAMED.forEach((h, i) => { const q = at(h.t); label(ctx, c, h.n, Math.max(120, Math.min(560, q[0])), q[1] - 34, { size: 30, scale: s === S.NAMED ? pop(a, 0.1 + i * 0.16) : 1 }); });
    if (s === S.EMPTY) [...this.mine].forEach((t) => { const q = at(t); label(ctx, c, 'Your idea', Math.max(80, Math.min(600, q[0])), q[1], { size: 24, bg: hi(c), ink: c.label }); });
    if (s === S.TASK) {
      ctx.save(); ctx.globalAlpha *= Math.min(1, pop(a, 0.15));
      tile(ctx, c, 150, 362, 380, 84, { fill: c.bgSurface });
      say(ctx, c, '96.8 crore voters', 340, 394, { size: 36 });
      say(ctx, c, 'in 2024', 340, 426, { size: 25, display: false });
      ctx.restore();
    }
    if (s !== S.TASK) folk(ctx, this, { role: 'voter', x: 590, y: 372, height: 118, pose: 'walk', facing: 1, i: 6 });
    if (s === S.EMPTY) label(ctx, c, 'Tap an empty pothole', 150, 432, { size: 24 });
  }
}
