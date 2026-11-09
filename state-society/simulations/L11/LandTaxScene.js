// LandTaxScene - L11 blk-l11-s01 (4 beats) and the blk-l11-s02 predict setup, which shows four sources with no answer.
// b0 a village from above; b1, b2 one part in six with Good year and Bad year; b3 cleared and protected forest.
// The sack numbers are an example and are labelled as one.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawAnimal } from 'simulations/base/kit/SimAnimal.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { tree, ground, ease, say, plate, sky, leaf, earth, MAN, person } from '../L09/SstWorld.js';

const W = 680, H = 520, GY = 440;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'good', label: 'Good year', targets: ['good'], tone: 3 },
  { id: 'bad', label: 'Bad year', targets: ['bad'], tone: 6 },
];
const SETUP = [
  { icon: 'field', name: 'farms', tone: 's3' },
  { icon: 'boat', name: 'ports and trade', tone: 's1' },
  { icon: 'crown', name: 'tribute', tone: 's5' },
  { icon: 'hammer', name: 'guilds', tone: 's8' },
];

export class LandTaxScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: [[{ idx: 0, dwellMs: null }]], [Number.MAX_SAFE_INTEGER]: [[{ idx: 0, dwellMs: null }]], 4: MAP };
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A village from above with fields, pasture and groves. Six sacks of grain stand in a row and one of the six goes to the state, in a good year and a bad year. Last, a forest cleared for fields beside a forest protected by law.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Year', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this._at = this.clock; this.animateFor(1200); } });
  _at = 0;

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && !this._years; }

  get _setup() { return this.beatCount !== 4; }   // a predict host mounts with a huge count, and setup() with 0
  get _st() { return this._setup ? -1 : (this.stage ?? 0); }
  get _years() { return this._st === 1 || this._st === 2; }

  enter() {
    this._at = this.clock;
    const s = this._st;
    this.tl.set({ lit: s === 1 ? 'good' : s === 2 ? 'bad' : null });
    if (!this._years) this.tl.reset();
  }

  busy() { return this.clock - this._at < 1.1; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this._st;
    if (s === -1) this._sources(ctx, c);
    else if (s === 0) this._village(ctx, c);
    else if (s === 3) this._forest(ctx, c);
    else this._sacks(ctx, c);
    drawVignette(ctx, c, 0.3);
  }

  _sources(ctx, c) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, H);
    SETUP.forEach((g, i) => {
      const x = 180 + (i % 2) * 320, y = 140 + (i >> 1) * 240;
      drawIcon(ctx, c, g.icon, x, y, 72, { tone: c[g.tone] });
      say(ctx, c, g.name, x, y + 96, { size: 30 });
    });
  }

  _village(ctx, c) {
    const a = this.age;
    // groves at the rim, pasture inside them, holdings in the middle
    ctx.fillStyle = mix(leaf(c), c.bgDeep, 0.3); ctx.fillRect(0, 0, W, H);
    const pale = mix(c.s3, c.gold, 0.38), past = mix(c.s3, c.bgSurface, 0.3);
    ctx.fillStyle = past; rr(ctx, 56, 44, 568, 432, 28); ctx.fill();
    const tones = [mix(c.gold, c.s3, 0.25), mix(c.gold, c.s8, 0.25), pale, mix(c.gold, c.s3, 0.55), mix(earth(c), c.gold, 0.4), mix(c.gold, c.bgSurface, 0.3)];
    let n = 0;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) {
      const x = 188 + i * 92, y = 84 + r * 122, col = tones[(n++ * 5) % 6];
      ctx.fillStyle = darken(col, 0.2); rr(ctx, x, y + 4, 86, 112, 8); ctx.fill();
      ctx.fillStyle = col; rr(ctx, x, y, 86, 112, 8); ctx.fill();
      ctx.strokeStyle = darken(col, 0.12); ctx.lineWidth = 3;
      for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x + 8, y + k * 22); ctx.lineTo(x + 78, y + k * 22); ctx.stroke(); }
    }
    for (let i = 0; i < 8; i++) { tree(ctx, c, 26 + (i % 2) * 10, 70 + i * 62, 70, {}); tree(ctx, c, 650 - (i % 2) * 10, 66 + i * 62, 70, {}); }
    drawAnimal(ctx, c, { kind: 'cow', x: 118, y: 200, length: 96, facing: 1, pose: 'graze' }, {});
    drawAnimal(ctx, c, { kind: 'cow', x: 124, y: 362, length: 96, facing: 1, pose: 'stand' }, {});
    const k = ease(a / 0.6);
    plate(ctx, c, 'holdings', 360, 262, { size: 28, alpha: k });
    plate(ctx, c, 'pasture', 122, 280, { size: 28, alpha: k });
    plate(ctx, c, 'groves', 596, 34, { size: 28, alpha: k });
  }

  _sack(ctx, c, x, y, s, gold) {
    const col = gold ? c.gold : mix(earth(c), c.bgSurface, 0.3);
    ctx.fillStyle = darken(col, 0.24);
    ctx.beginPath(); ctx.moveTo(x - 34 * s, y); ctx.quadraticCurveTo(x - 48 * s, y - 60 * s, x - 20 * s, y - 96 * s); ctx.lineTo(x + 20 * s, y - 96 * s); ctx.quadraticCurveTo(x + 48 * s, y - 60 * s, x + 34 * s, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x - 30 * s, y - 4 * s); ctx.quadraticCurveTo(x - 42 * s, y - 60 * s, x - 18 * s, y - 96 * s); ctx.lineTo(x + 12 * s, y - 96 * s); ctx.quadraticCurveTo(x + 34 * s, y - 60 * s, x + 26 * s, y - 4 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = darken(col, 0.34); rr(ctx, x - 22 * s, y - 104 * s, 44 * s, 12 * s, 5 * s); ctx.fill();
  }

  _sacks(ctx, c) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    ground(ctx, c, GY);
    tree(ctx, c, 636, GY, 210);
    const lit = this.tl.lit()[0] ?? null, cs = lit ?? 'good', bad = cs === 'bad', k = ease((this.clock - this._at) / 0.8);
    const s = bad ? 1.0 - 0.32 * k : 1.02;
    const each = bad ? 5 : 10, total = each * 6;
    const lift = 26 * k;
    for (let i = 0; i < 6; i++) {
      const x = 70 + i * 92;
      this._sack(ctx, c, x, GY + 42 - (i === 5 ? lift : 0), s * 1.28, i === 5);
    }
    if (!lit) say(ctx, c, 'Tap a year', 240, 76, { size: 36 });
    else {
      say(ctx, c, `Harvest: ${total} sacks`, 240, 52, { size: 36 });
      say(ctx, c, `State\u2019s share: ${each} sacks`, 240, 104, { size: 36, col: c.label });
    }
    plate(ctx, c, '1 part in 6', 520, 78, { size: 34, ink: c.s8ink });
    plate(ctx, c, 'an example', 524, 136, { size: 28, bg: c.raised });
    person(this, ctx, c, { role: 'farmer', pose: 'stand', x: 600, y: GY + 48, height: 190, facing: -1, i: 0, look: { ...MAN, mood: bad ? 'sad' : 'smile' } });
  }

  _forest(ctx, c) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    ground(ctx, c, GY);
    const k = ease(this.age / 1);
    // the right half stands; the left half has become fields
    for (let i = 0; i < 6; i++) tree(ctx, c, 386 + i * 54, GY + (i % 2) * 10, 250 + (i % 3) * 36);
    ctx.fillStyle = mix(c.gold, c.s3, 0.3); rr(ctx, 0, GY - 2, 330, 80, 0); ctx.fill();
    for (let r = 0; r < 3; r++) { ctx.strokeStyle = darken(mix(c.gold, c.s3, 0.3), 0.2); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, GY + 16 + r * 20); ctx.lineTo(330, GY + 16 + r * 20); ctx.stroke(); }
    for (const x of [70, 196, 298]) { ctx.fillStyle = darken(mix(c.s8, c.waste, 0.5), 0.26); rr(ctx, x - 13, GY - 18, 26, 22, 5); ctx.fill(); ctx.fillStyle = lighten(mix(c.s8, c.waste, 0.5), 0.2); ctx.beginPath(); ctx.ellipse(x, GY - 18, 13, 6, 0, 0, Math.PI * 2); ctx.fill(); }
    person(this, ctx, c, { role: 'farmer', pose: 'stand', x: 130, y: GY + 40, height: 180, facing: 1, i: 0, look: MAN });
    // a stone post at the forest's edge
    ctx.fillStyle = darken(mix(c.waste, c.gold, 0.2), 0.1); rr(ctx, 338, GY - 110, 34, 150, 8); ctx.fill();
    plate(ctx, c, 'cleared for farming', 170, 60, { size: 28, alpha: k });
    plate(ctx, c, 'protected by law', 510, 60, { size: 28, alpha: k, ink: c.s3ink });
  }
}
