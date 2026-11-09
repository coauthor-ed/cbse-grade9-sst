// PurusharthaScene - four goals as four lamps; a grain trader; artha lights only with dharma on.
// L09 blk-l09-s02 (predict setup, nothing named as an answer) and blk-l09-s03 (4 beats). The learner taps Fair trade
// or False weights; a beat presets the case it names, so the picture is right on a cold start.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawVignette, drawSpotlight } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { ground, tree, ease, say, plate, stone, sky, thatch, MAN, WOMAN, person } from './SstWorld.js';

const W = 680, H = 520, GY = 452;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'fair', label: 'Fair trade', targets: ['fair'], tone: 3 },
  { id: 'false', label: 'False weights', targets: ['false'], tone: 6 },
];
const LAMPS = [
  { id: 'dharma', name: 'dharma', tone: 's3' },
  { id: 'artha', name: 'artha', tone: 's2' },
  { id: 'kama', name: 'k\u0101ma', tone: 's4' },
  { id: 'moksha', name: 'mok\u1E63ha', tone: 's5' },
];

export class PurusharthaScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: [[{ idx: 0, dwellMs: null }]], [Number.MAX_SAFE_INTEGER]: [[{ idx: 0, dwellMs: null }]], 4: MAP };
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Four lamps named dharma, artha, kama and moksha above a grain stall. With fair weights the dharma and artha lamps burn and the buyer gets a full pan. With a false weight the buyer gets less and the artha lamp goes dark.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Case', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this._at = this.clock; this.animateFor(1200); } });
  _at = 0;

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && !this._cases; }

  get _setup() { return this.beatCount !== 4; }   // a predict host mounts with a huge count, and setup() with 0
  get _st() { return this._setup ? -1 : (this.stage ?? 0); }
  get _cases() { return this._st === 1 || this._st === 2; }

  enter() {
    this._at = this.clock;
    const s = this._st;
    this.tl.set({ lit: s === 1 ? 'fair' : s === 2 ? 'false' : null });
    if (s < 1) this.tl.reset();
  }

  busy() { return this.clock - this._at < 1.1; }

  get _case() { return this.tl.lit()[0] ?? null; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    ctx.fillStyle = mix(sky(c), c.gold, 0.1); ctx.fillRect(0, 0, W, GY);
    tree(ctx, c, 40, GY, 240); tree(ctx, c, 640, GY, 260);
    ground(ctx, c, GY);
    const s = this._st, cs = this._case, k = ease((this.clock - this._at) / 0.8);
    const on = {
      dharma: s === 0 || s === 3 || cs === 'fair',
      artha: s === 0 || s === 3 || cs === 'fair',
      kama: s === 0 || s === 3,
      moksha: s === 0 || s === 3,
    };
    if (s === -1) { on.dharma = on.artha = on.kama = on.moksha = false; }
    LAMPS.forEach((l, i) => this._lamp(ctx, c, 104 + i * 158, 72, l, on[l.id], s === 3 && (l.id === 'dharma' || l.id === 'moksha'), k));
    this._stall(ctx, c, s === -1 ? null : cs, k);
    if (cs === 'fair') plate(ctx, c, 'true weight: full measure', W / 2, 186, { size: 28, ink: c.s3ink });
    if (cs === 'false') plate(ctx, c, 'false weight: buyers get less', W / 2, 186, { size: 28, ink: c.s6ink });
    if (s === 3) plate(ctx, c, 'dharma and mok\u1E63ha: direction and purpose', W / 2, 186, { size: 28 });
    drawVignette(ctx, c, 0.4);
  }

  _lamp(ctx, c, x, y, l, lit, big, k) {
    const col = c[l.tone], f = lit ? k : 0;
    if (f > 0) drawSpotlight(ctx, c, x, y + 8, 62 + (big ? 16 : 0), 0.6 * f);
    // a clay lamp on a short stem, with its name under it
    ctx.fillStyle = darken(mix(c.s8, c.waste, 0.4), 0.14);
    ctx.beginPath(); ctx.moveTo(x - 38, y + 18); ctx.quadraticCurveTo(x, y + 60, x + 38, y + 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lighten(mix(c.s8, c.waste, 0.4), 0.1); rr(ctx, x - 40, y + 13, 80, 10, 5); ctx.fill();
    if (f > 0) {
      ctx.fillStyle = mix(c.flame, c.gold, 0.4);
      ctx.beginPath(); ctx.moveTo(x, y + 12 - 42 * f); ctx.quadraticCurveTo(x + 18, y - 4, x, y + 14); ctx.quadraticCurveTo(x - 18, y - 4, x, y + 12 - 42 * f); ctx.fill();
      ctx.fillStyle = lighten(c.gold, 0.4);
      ctx.beginPath(); ctx.ellipse(x, y + 4, 6, 11 * f, 0, 0, Math.PI * 2); ctx.fill();
    }
    say(ctx, c, l.name, x, y + 76, { size: 28, col: c.label });
    void col;
  }

  _stall(ctx, c, cs, k) {
    const cx = 340, top = 250;
    // the awning and counter
    ctx.fillStyle = darken(thatch(c), 0.16); rr(ctx, cx - 214, top - 16, 428, 26, 10); ctx.fill();
    ctx.fillStyle = darken(mix(c.s8, c.waste, 0.5), 0.22);
    rr(ctx, cx - 200, top, 14, GY - top, 5); ctx.fill(); rr(ctx, cx + 186, top, 14, GY - top, 5); ctx.fill();
    ctx.fillStyle = stone(c); rr(ctx, cx - 170, GY - 76, 340, 70, 12); ctx.fill();
    ctx.fillStyle = lighten(stone(c), 0.2); rr(ctx, cx - 170, GY - 76, 340, 18, 9); ctx.fill();
    person(this, ctx, c, { role: 'shopkeeper', pose: 'stand', x: cx - 118, y: GY - 12, height: 180, facing: 1, i: 0, look: { ...MAN, mood: cs === 'false' ? 'squint' : 'smile' } });
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: cx + 222, y: GY + 44, height: 180, facing: -1, i: 1, look: { ...WOMAN, mood: cs === 'false' ? 'sad' : 'happy' } });
    this._balance(ctx, c, cx + 14, GY - 150, cs, k);
  }

  // A hand balance on a stand: weight in the left pan, grain in the right. A false weight is hollow, so the buyer's pan
  // holds less grain when the beam is level.
  _balance(ctx, c, x, y, cs, k) {
    const metal = mix(c.gold, c.waste, 0.3);
    ctx.fillStyle = darken(metal, 0.2); rr(ctx, x - 6, y, 12, 76, 4); ctx.fill();
    rr(ctx, x - 34, y + 70, 68, 12, 5); ctx.fill();
    ctx.strokeStyle = metal; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 92, y + 2); ctx.lineTo(x + 92, y + 2); ctx.stroke();
    const pan = (px, fn) => {
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px - 34, y + 44); ctx.lineTo(px, y + 2); ctx.lineTo(px + 34, y + 44); ctx.stroke();
      fn(y + 44);
      ctx.fillStyle = darken(metal, 0.1); ctx.beginPath(); ctx.moveTo(px - 42, y + 44); ctx.quadraticCurveTo(px, y + 70, px + 42, y + 44); ctx.closePath(); ctx.fill();
    };
    const heap = cs === 'false' ? 1 - 0.62 * k : 1;
    pan(x - 92, (py) => {
      ctx.fillStyle = cs === 'false' ? mix(c.bad, c.waste, 0.3) : darken(stone(c), 0.34);
      rr(ctx, x - 92 - 18, py - 30, 36, 34, 8); ctx.fill();
      if (cs === 'false') { ctx.fillStyle = c.bgDeep; rr(ctx, x - 92 - 8, py - 22, 16, 18, 5); ctx.fill(); }
    });
    pan(x + 92, (py) => {
      ctx.fillStyle = mix(c.gold, c.s8, 0.3);
      ctx.beginPath(); ctx.moveTo(x + 92 - 38, py + 2); ctx.quadraticCurveTo(x + 92, py - 56 * heap, x + 92 + 38, py + 2); ctx.closePath(); ctx.fill();
    });
  }
}
