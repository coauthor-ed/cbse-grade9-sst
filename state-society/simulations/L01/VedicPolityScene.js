// VedicPolityScene - a settlement in Sapta-Sindhu seen from the bank: huts, fire, cattle, a stream.
// Mounts: 3 beats (s01), 0 (s02 predict setup), 2 (s07). Figures are big enough to read at 390.
// Assembly names stay off this scene: the s02 predict asks about them.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill, clamp01, outBack } from 'simulations/base/kit/SimLook.js';
import { drawAnimal, animalLook } from 'simulations/base/kit/SimAnimal.js';
import { pal, hut, fire, tree, person } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_LAND = 0, S_KIN = 1, S_NOLAW = 2, S_ONE = 3, S_MANY = 4;
const MAP3 = [m(S_LAND), m(S_KIN), m(S_NOLAW)], MAP2 = [m(S_ONE), m(S_MANY)], MAP0 = [m(S_NOLAW)];
const KIN = [{ x: 88, y: 486, h: 150, i: 0, role: 'elder', f: 1 }, { x: 170, y: 498, h: 138, i: 1, role: 'adult', f: 1 },
  { x: 250, y: 500, h: 96, i: 2, role: 'child', f: -1 }, { x: 330, y: 494, h: 142, i: 3, role: 'adult', f: -1 }];
const FAR = [{ x: 500, y: 196, s: 0.72, hue: 's1' }, { x: 600, y: 300, s: 0.82, hue: 's5' }];

export class VedicPolityScene extends SimScene {
  static BEAT_STEP_MAP = MAP3;
  static BEAT_MAPS = { 3: MAP3, 2: MAP2, 0: MAP0, [Number.MAX_SAFE_INTEGER]: MAP0 };
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A settlement on the bank of a stream: thatched huts, a cooking fire, cattle and a family of people joined by kin lines. On a later slide, Add another clan puts further settlements across the stream, each with its own colour of kin line.';
  static CONTROLS = [{ type: 'button', id: 'clan', label: 'Add another clan' }];

  clans = 1;
  grownAt = -9;

  enter(stage) { this.clans = stage === S_MANY ? 3 : 1; this.grownAt = -9; }
  isControlHidden(id) { return id === 'clan' && this.stage !== S_ONE; }
  isControlDisabled(id) { return id === 'clan' && this.clans >= 3; }
  onControlChange(id) {
    if (id === 'clan' && this.clans < 3) { this.clans += 1; this.grownAt = this.age; if (this.clans === 3) this.after(0.6, () => this.celebrate(600, 220, 16)); }
  }
  busy() { return this.age - this.grownAt < 0.8; }

  _scene(ctx, c, t) {
    const p = pal(c);
    drawBackdrop(ctx, c, 'dots');
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = mix(c.bgSurface, c.water, 0.12); ctx.fill();
    // hills and ground
    ctx.fillStyle = p.grass;
    ctx.beginPath(); ctx.moveTo(6, 170); ctx.bezierCurveTo(180, 120, 440, 150, 674, 118); ctx.lineTo(674, 514); ctx.lineTo(6, 514); ctx.closePath(); ctx.fill();
    // stream from the far hills, past the settlement
    ctx.beginPath(); ctx.moveTo(420, 134); ctx.bezierCurveTo(390, 240, 480, 330, 420, 514); ctx.lineTo(470, 514);
    ctx.bezierCurveTo(540, 330, 440, 240, 448, 132); ctx.closePath(); ctx.fillStyle = p.water; ctx.fill();
    tree(ctx, c, 40, 212, 1.1, 2); tree(ctx, c, 366, 196, 0.9, 5); tree(ctx, c, 636, 170, 0.9, 7);
    hut(ctx, c, 110, 262, 1.2); hut(ctx, c, 230, 232, 1); hut(ctx, c, 334, 278, 1.15);
    drawAnimal(ctx, c, { kind: 'cow', x: 110, y: 338, length: 120, facing: 1, pose: 'graze' }, animalLook(c, 'cow', { mood: 'smile' }));
    drawAnimal(ctx, c, { kind: 'cow', x: 340, y: 348, length: 96, facing: -1, pose: 'stand' }, animalLook(c, 'cow', { t }));
    fire(ctx, c, 214, 368, 1.1, t);
  }

  _far(ctx, c, f, k) {
    const s = f.s * outBack(clamp01(k));
    if (s <= 0.02) return;
    hut(ctx, c, f.x - 44 * s, f.y, s); hut(ctx, c, f.x + 40 * s, f.y - 16 * s, s * 0.9);
    fire(ctx, c, f.x, f.y + 26 * s, s * 0.7, 0);
  }

  _kinLine(ctx, pts, col) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 11]);
    ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.quadraticCurveTo((pts[i - 1].x + q.x) / 2, Math.min(pts[i - 1].y, q.y) - 34, q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.stroke(); ctx.restore();
  }

  draw(ctx, c) {
    const t = this.clock ?? 0;
    this._scene(ctx, c, t);
    const st = this.stage;
    const nFar = this.clans - 1;
    for (let i = 0; i < nFar; i++) this._far(ctx, c, FAR[i], st === S_MANY || i < nFar - 1 ? 1 : (this.age - this.grownAt) / 0.6);
    const sk = KIN.map((k) => person(ctx, this, { role: k.role, x: k.x, y: k.y, height: k.h, facing: k.f, i: k.i, mood: st === S_NOLAW ? 'think' : undefined }));
    const heads = sk.map((s) => ({ x: s.anchors.head.x, y: s.anchors.head.y - s.anchors.head.r - 8 }));
    if (st === S_KIN || st >= S_ONE) this._kinLine(ctx, heads, c.s2);
    if (st === S_KIN) pill(ctx, c, 'jana: bound by kinship', 214, 92, { size: 28, bg: c.s2, display: true });
    if (st === S_LAND) pill(ctx, c, 'Sapta-Sindhu', 214, 92, { size: 28, bg: c.gold, display: true });
    if (st === S_ONE || st === S_MANY) {
      for (let i = 0; i < nFar; i++) {
        const f = FAR[i], hx = f.x;
        this._kinLine(ctx, [{ x: hx - 46 * f.s, y: f.y - 66 * f.s }, { x: hx, y: f.y - 76 * f.s }, { x: hx + 46 * f.s, y: f.y - 80 * f.s }], c[f.hue]);
      }
      pill(ctx, c, `${this.clans} ${this.clans === 1 ? 'jana' : 'janas'}`, 590, 62, { size: 28, bg: c.s2, display: true });
    }
    if (st === S_MANY) pill(ctx, c, 'neighbours, not kin', 214, 92, { size: 28, bg: c.warning, display: true });
    drawVignette(ctx, c, 0.45);
  }
}
