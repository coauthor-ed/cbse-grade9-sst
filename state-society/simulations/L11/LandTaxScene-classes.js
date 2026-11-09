// LandTaxSceneClasses - L11 blk-l11-s03, 4 beats. b0 the farmer and the state's revenue; b1 Kautilya's five types of land,
// a tile each; b2 crops by region; b3 eight stages of farm work, of which the text names the first and the last.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawCard, drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawAnimal } from 'simulations/base/kit/SimAnimal.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { tree, ground, ease, seg, say, plate, sky, stone, earth, MAN, person } from '../L09/SstWorld.js';

const W = 680, H = 520, GY = 430;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const TYPES = [
  { id: 'cult', label: 'Cultivated', name: 'cultivated' },
  { id: 'fall', label: 'Fallow', name: 'waste or fallow' },
  { id: 'dry', label: 'High and dry', name: 'high and dry' },
  { id: 'sown', label: 'Sown', name: 'sown fields' },
  { id: 'grov', label: 'Groves', name: 'groves' },
];
const CHIPS = TYPES.map((t, i) => ({ id: t.id, label: t.label, targets: [t.id], tone: [8, 2, 5, 3, 1][i] }));

export class LandTaxSceneClasses extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A farmer ploughing with a bullock. Then five tiles for the types of village land Kautilya lists. Then the Deccan black soil with cotton, and the Chera region with jackfruit, pepper and turmeric. Last, a row of eight numbered stages of farm work.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Land', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => this.animateFor(300) });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }

  enter() { this.tl.reset(); }
  busy() { return this.age < 1.3; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    [this._farmer, this._types, this._crops, this._stages][this.stage ?? 0].call(this, ctx, c);
    drawVignette(ctx, c, 0.3);
  }

  _farmer(ctx, c) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    tree(ctx, c, 620, GY, 260);
    ground(ctx, c, GY, W, H, earth(c));
    for (let r = 0; r < 3; r++) { ctx.strokeStyle = darken(earth(c), 0.14); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, GY + 22 + r * 24); ctx.lineTo(W, GY + 22 + r * 24); ctx.stroke(); }
    const dx = 40 * ease(this.age / 1.1);
    drawAnimal(ctx, c, { kind: 'cow', x: 420 + dx, y: GY + 40, length: 210, facing: 1, pose: 'walk', phase: 0.2 }, {});
    ctx.strokeStyle = darken(mix(c.s8, c.waste, 0.4), 0.2); ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(300 + dx, GY - 76); ctx.lineTo(420 + dx, GY - 40); ctx.moveTo(300 + dx, GY - 76); ctx.lineTo(268 + dx, GY + 30); ctx.stroke();
    person(this, ctx, c, { role: 'farmer', pose: { name: 'walk', phase: 0.3 }, x: 200 + dx, y: GY + 44, height: 220, facing: 1, i: 0, look: MAN });
    plate(ctx, c, 'the backbone of the economy', W / 2, 50, { size: 30 });
  }

  _tile(ctx, c, t, x, y, w, h, on) {
    ctx.save(); ctx.globalAlpha *= on ? 1 : 0.34;
    ctx.beginPath(); rr(ctx, x, y, w, h, 12); ctx.clip();
    const so = earth(c);
    ctx.fillStyle = sky(c); ctx.fillRect(x, y, w, h * 0.42);
    const gy = y + h * 0.42;
    ctx.fillStyle = so; ctx.fillRect(x, gy, w, h);
    if (t === 'cult') { ctx.strokeStyle = darken(so, 0.26); ctx.lineWidth = 5; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x, gy + i * 20); ctx.lineTo(x + w, gy + i * 20); ctx.stroke(); } }
    if (t === 'fall') { ctx.fillStyle = mix(so, c.gold, 0.36); ctx.fillRect(x, gy, w, h); ctx.strokeStyle = mix(c.s3, c.waste, 0.5); ctx.lineWidth = 4; for (let i = 0; i < 9; i++) { const px = x + 18 + i * (w / 9), py = gy + 24 + (i * 37) % 62; ctx.beginPath(); ctx.moveTo(px - 8, py - 10); ctx.lineTo(px, py + 4); ctx.lineTo(px + 8, py - 10); ctx.stroke(); } }
    if (t === 'dry') { ctx.fillStyle = stone(c); ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.25, gy - 20); ctx.lineTo(x + w * 0.52, gy - 42); ctx.lineTo(x + w * 0.8, gy - 8); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); ctx.fillStyle = lighten(stone(c), 0.2); ctx.beginPath(); ctx.moveTo(x + w * 0.25, gy - 20); ctx.lineTo(x + w * 0.52, gy - 42); ctx.lineTo(x + w * 0.6, gy - 8); ctx.closePath(); ctx.fill(); }
    if (t === 'sown') { ctx.strokeStyle = mix(c.s3, c.gold, 0.1); ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const px = x + 18 + i * (w / 7) + (r % 2) * 10, py = gy + 30 + r * 32; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 7, py - 18); ctx.moveTo(px, py); ctx.lineTo(px + 7, py - 18); ctx.stroke(); } }
    if (t === 'grov') { for (let i = 0; i < 3; i++) tree(ctx, c, x + 46 + i * ((w - 80) / 2), y + h - 14, h * 0.78); }
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= on ? 1 : 0.5;
    ctx.lineWidth = on ? 5 : 3; ctx.strokeStyle = darken(c.stroke, 0.1); rr(ctx, x, y, w, h, 12); ctx.stroke();
    ctx.restore();
  }

  _types(ctx, c) {
    const lit = this.tl.lit()[0] ?? null;
    const gap = 12, w = (W - 24 - 2 * gap) / 3, h = 190;
    TYPES.forEach((t, i) => {
      const row = i < 3 ? 0 : 1, col = row ? i - 3 : i;
      const x = 12 + col * (w + gap) + (row ? (w + gap) / 2 : 0), y = 16 + row * (h + 56);
      const k = ease(seg(this.age, i * 0.08, i * 0.08 + 0.3));
      ctx.save(); ctx.globalAlpha *= k;
      this._tile(ctx, c, t.id, x, y, w, h, !lit || lit === t.id);
      ctx.restore();
      plate(ctx, c, t.name, x + w / 2, y + h + 24, { size: 28, alpha: k * (!lit || lit === t.id ? 1 : 0.6) });
    });
  }

  _cotton(ctx, c, x, y) {
    ctx.strokeStyle = mix(c.s3, c.waste, 0.3); ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 110); ctx.moveTo(x, y - 60); ctx.lineTo(x - 40, y - 100); ctx.moveTo(x, y - 50); ctx.lineTo(x + 40, y - 92); ctx.stroke();
    for (const [dx, dy] of [[0, -122], [-44, -108], [44, -100]]) {
      ctx.fillStyle = lighten(c.bgSurface, 0.5);
      for (const [ox, oy] of [[-10, 0], [10, 0], [0, -10], [0, 8]]) { ctx.beginPath(); ctx.arc(x + dx + ox, y + dy + oy, 13, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + dx, y + dy, 22, 0, Math.PI * 2); ctx.stroke();
    }
  }

  _crops(ctx, c) {
    const a = ease(this.age / 0.6), M = W / 2;
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = darken(mix(c.bgDeep, c.waste, 0.1), 0.0);
    // Deccan: dark soil, cotton. Chera: green with three crops.
    const dark = mix(darken(c.waste, 0.62), c.s5, 0.08);
    ctx.fillStyle = dark; ctx.fillRect(0, 372, M - 4, H);
    ctx.fillStyle = mix(c.s3, c.waste, 0.2); ctx.fillRect(M + 4, 372, M, H);
    [90, 215].forEach((x) => this._cotton(ctx, c, x, 400));
    plate(ctx, c, 'Deccan: black soil', M / 2, 40, { size: 28, alpha: a });
    plate(ctx, c, 'cotton', M / 2, 452, { size: 28, alpha: a });
    plate(ctx, c, 'Chera region', M * 1.5, 40, { size: 28, alpha: a });
    tree(ctx, c, M + 90, 386, 280);
    for (const [dx, dy] of [[-46, 180], [30, 160], [-6, 214]]) { ctx.fillStyle = mix(c.s3, c.gold, 0.6); ctx.beginPath(); ctx.ellipse(M + 90 + dx, 386 - dy + 40, 19, 28, 0, 0, Math.PI * 2); ctx.fill(); }
    plate(ctx, c, 'jackfruit', M + 90, 452, { size: 28, alpha: a });
    plate(ctx, c, 'pepper', M + 240, 410, { size: 28, alpha: a });
    plate(ctx, c, 'turmeric', M + 240, 472, { size: 28, alpha: a });
  }

  _stages(ctx, c) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, H);
    plate(ctx, c, 'Milindapa\u00F1ho: 8 stages of farm work', W / 2, 46, { size: 28 });
    const n = 8, x0 = 56, dx = (W - 112) / 7, y = 186;
    ctx.strokeStyle = mix(earth(c), c.s8, 0.3); ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (W - 112) * ease(this.age / 1), y); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const on = i === 0 || i === n - 1, a = ease(seg(this.age, i * 0.09, i * 0.09 + 0.3));
      ctx.save(); ctx.globalAlpha *= a;
      ctx.fillStyle = on ? c.s8 : mix(c.bgSurface, c.s8, 0.3);
      ctx.beginPath(); ctx.arc(x0 + i * dx, y, on ? 32 : 24, 0, Math.PI * 2); ctx.fill();
      say(ctx, c, String(i + 1), x0 + i * dx, y + 1, { size: on ? 34 : 26, col: on ? c.bgSurface : c.label });
      ctx.restore();
    }
    plate(ctx, c, 'preparing, weeding', 136, 258, { size: 28, ink: c.s8ink });
    plate(ctx, c, 'harvesting, winnowing', 512, 258, { size: 28, ink: c.s8ink });
    drawCard(ctx, c, 60, 322, W - 120, 164);
    // a lexicon: a palm-leaf book
    ctx.fillStyle = darken(mix(c.gold, c.bgSurface, 0.3), 0.14); rr(ctx, 104, 380, 180, 60, 8); ctx.fill();
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.3); rr(ctx, 104, 372, 180, 56, 8); ctx.fill();
    ctx.fillStyle = darken(c.gold, 0.4); ctx.beginPath(); ctx.arc(136, 400, 6, 0, Math.PI * 2); ctx.arc(252, 400, 6, 0, Math.PI * 2); ctx.fill();
    say(ctx, c, 'Amarako\u1E63ha', 452, 372, { size: 32 });
    say(ctx, c, 'a chapter on forest,', 452, 416, { size: 28, weight: 600, display: false });
    say(ctx, c, 'crops, plants, manure', 452, 450, { size: 28, weight: 600, display: false });
  }
}
