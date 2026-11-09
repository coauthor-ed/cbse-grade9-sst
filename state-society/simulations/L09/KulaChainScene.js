// KulaChainScene - the kula inside the grama inside the visha inside the jana. L09 blk-l09-s04, 5 beats.
// The camera pulls out from one house to the whole people, then returns to a larger household, then a gotra line.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, ellipse, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { hut, tree, ground, ease, seg, lerp2, plate, earth, sky, MAN, person } from './SstWorld.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'kula', label: 'kula', targets: ['kula'], tone: 8 },
  { id: 'grama', label: 'gr\u0101ma', targets: ['grama'], tone: 3 },
  { id: 'visha', label: 'vi\u015Bha'.replace('\u015B', '\u015B'), targets: ['visha'], tone: 2 },
  { id: 'jana', label: 'jana', targets: ['jana'], tone: 1 },
];
// A camera scale per level: the house, the village, the group of villages, the people.
const ZOOM = [1, 0.34, 0.135, 0.08];
const CAM = [[0, 0], [40, -20], [240, 120], [900, 560]];
const RING = { grama: { x: 40, y: -20, r: 300 }, visha: { x: 240, y: 120, r: 860 }, jana: { x: 900, y: 560, r: 2700 } };
const HUTS = [[-170, -110], [110, -150], [-240, 70], [230, 40], [-60, 150], [120, 170]];
const VILLAGES = [[820, -420], [-520, 640], [720, 640]];
const VISHAS = [[2350, -100], [1000, 2300], [-500, 1900]];

export class KulaChainScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'One house with a family in it. The view pulls out to show the house inside a village, the village inside a group of villages, and the group inside the whole people, with the raja as protector. Then the house returns with a larger household of kin, and last a line of fathers and sons runs back to a sage.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => this.animateFor(200) });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlDisabled(id) { return id === 'lit' && this.tl.disabled(); }
  isControlHidden(id) { const s = this.stage ?? 0; return id === 'lit' && (s === 0 || s > 2); }

  enter() { this.tl.reset(); }
  busy() { return this.age < 2.4; }

  // The camera is a function of the beat and the time on it, never of history.
  _z() {
    const a = this.age, s = this.stage ?? 0;
    if (s === 0) return ZOOM[0];
    if (s === 1) return a < 1.1 ? lerp2(ZOOM[0], ZOOM[1], ease(a / 1.1)) : lerp2(ZOOM[1], ZOOM[2], ease((a - 1.1) / 1.2));
    if (s === 2) return lerp2(ZOOM[2], ZOOM[3], ease(a / 1.4));
    return 1;
  }

  // The camera's centre follows the scale, level by level, so the ring in view stays in the middle.
  _cam(z) {
    for (let i = 0; i < 3; i++) {
      if (z <= ZOOM[i] && z >= ZOOM[i + 1]) {
        const k = (Math.log(ZOOM[i]) - Math.log(z)) / (Math.log(ZOOM[i]) - Math.log(ZOOM[i + 1]));
        return [lerp2(CAM[i][0], CAM[i + 1][0], k), lerp2(CAM[i][1], CAM[i + 1][1], k)];
      }
    }
    return z > 1 ? CAM[0] : CAM[3];
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this.stage ?? 0;
    if (s === 4) this._gotra(ctx, c);
    else if (s === 3) this._house(ctx, c, 8);
    else this._nest(ctx, c, s);
    drawVignette(ctx, c, 0.5);
  }

  _house(ctx, c, n) {
    const a = this.age, gy = 452;
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, gy);
    tree(ctx, c, 70, gy, 250); tree(ctx, c, 618, gy, 280);
    ground(ctx, c, gy);
    hut(ctx, c, 340, gy - 26, 430);
    const ppl = n === 8
      ? [['elder', 96, 0], ['elder', 170, 1], ['adult', 244, 2], ['adult', 318, 3], ['adult', 392, 4], ['adult', 466, 5], ['student', 540, 6], ['child', 606, 7]]
      : [['adult', 210, 2], ['adult', 300, 3], ['student', 390, 6], ['child', 470, 7]];
    ppl.forEach(([role, x, i], k) => {
      const pop = n === 8 && k !== 2 && k !== 3 && k !== 6 && k !== 7 ? ease(seg(a, 0.15 + k * 0.08, 0.5 + k * 0.08)) : 1;
      if (pop <= 0.02) return;
      ctx.save(); ctx.globalAlpha *= pop;
      person(this, ctx, c, { role, pose: 'stand', x, y: gy + 44, height: role === 'child' ? 118 : role === 'student' ? 150 : 170, facing: 0, i });
      ctx.restore();
    });
    plate(ctx, c, n === 8 ? 'kula: a household of kin' : 'kula: the family', W / 2, 40, { size: 30 });
  }

  _nest(ctx, c, s) {
    const z = this._z(), lit = this.tl.any() ? this.tl.lit()[0] : null;
    if (z > 0.72 && s === 0) { this._house(ctx, c, 4); return; }
    ctx.fillStyle = mix(earth(c), c.bgDeep, 0.5); ctx.fillRect(0, 0, W, H);
    const cx = W * 0.5, cy = H * 0.54;
    const cam = this._cam(z);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cam[0], -cam[1]);
    const dim = (id) => (lit && lit !== id ? 0.32 : 1);
    const blob = (r, col, id, wob) => {
      ctx.save(); ctx.globalAlpha *= dim(id);
      ctx.beginPath(); ellipse(ctx, r.x, r.y, r.r * (1 + wob), r.r * (1 - wob * 0.6)); ctx.fillStyle = col; ctx.fill();
      ctx.lineWidth = (lit === id ? 10 : 5) / z; ctx.strokeStyle = darken(col, 0.3); ctx.stroke(); ctx.restore();
    };
    blob(RING.jana, mix(c.s1, earth(c), 0.74), 'jana', 0.06);
    VISHAS.forEach(([x, y]) => blob({ x, y, r: 700 }, mix(c.s2, earth(c), 0.62), 'visha', 0.05));
    blob(RING.visha, mix(c.s2, earth(c), 0.5), 'visha', 0.05);
    VILLAGES.forEach(([x, y]) => { blob({ x, y, r: 250 }, mix(c.s3, earth(c), 0.52), 'grama', 0.04); this._huts(ctx, c, x, y, z); });
    blob(RING.grama, mix(c.s3, earth(c), 0.38), 'grama', 0.04);
    this._huts(ctx, c, RING.grama.x, RING.grama.y, z);
    ctx.save(); ctx.globalAlpha *= dim('kula');
    hut(ctx, c, 0, 40, lit === 'kula' ? 210 : 170, { roof: mix(c.s8, c.gold, 0.4) });
    ctx.restore();
    ctx.restore();
        // Labels appear as each level comes into view.
    const show = (from, to) => clamp(1 - Math.abs(Math.log(z / from) / Math.log(to)));
    const ja = s === 2 ? ease(seg(this.age, 0.9, 1.4)) : 0, gr = show(ZOOM[1], 2.2), vi = s === 2 ? 1 - ja : show(ZOOM[2], 2.0);
    if (gr > 0.05) plate(ctx, c, 'gr\u0101ma: several families', W / 2, 36, { size: 28, alpha: gr });
    if (vi > 0.05) {
      plate(ctx, c, 'vi\u015Bha: a group of gr\u0101mas', W / 2, 36, { size: 28, alpha: vi });
      ctx.save(); ctx.globalAlpha *= vi;
      person(this, ctx, c, { role: 'elder', pose: 'stand', x: 610, y: 420, height: 170, facing: -1, i: 2, look: MAN });
      ctx.restore();
      plate(ctx, c, 'vi\u015Bhapati', 590, 450, { size: 28, alpha: vi });
    }
    if (ja > 0.02) {
      plate(ctx, c, 'jana: the people', W / 2, 36, { size: 28, alpha: ja });
      ctx.save(); ctx.globalAlpha *= ja;
      person(this, ctx, c, { role: 'adult', pose: 'stand', x: 610, y: 412, height: 210, facing: -1, i: 0, look: { ...MAN, moustache: true } });
      ctx.restore();
      plate(ctx, c, 'r\u0101j\u0101: chief protector', 510, 448, { size: 28, alpha: ja });
    }
  }

  _huts(ctx, c, ox, oy, z) {
    if (z < 0.09) return;
    HUTS.forEach(([x, y], i) => hut(ctx, c, ox + x, oy + y, 120 + (i % 3) * 14));
  }

  _gotra(ctx, c) {
    const gy = 430, a = this.age;
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, gy);
    ground(ctx, c, gy);
    tree(ctx, c, 66, gy, 230);
    plate(ctx, c, 'gotra: the father\u2019s line', W / 2, 40, { size: 30 });
    const P = [['elder', 104, 200, 0], ['adult', 300, 182, 2], ['adult', 440, 178, 0], ['student', 578, 152, 2]];
    // the line runs along the ground under the fathers and sons
    ctx.strokeStyle = c.s8; ctx.lineWidth = 9; ctx.lineCap = 'round';
    const k = ease(a / 1.2);
    ctx.beginPath(); ctx.moveTo(104, gy + 28); ctx.lineTo(lerp2(104, 578, k), gy + 28); ctx.stroke();
    P.forEach(([role, x, h, i]) => {
      ctx.fillStyle = c.s8; ctx.beginPath(); ctx.arc(x, gy + 28, 11, 0, Math.PI * 2); ctx.fill();
      person(this, ctx, c, { role, pose: 'stand', x, y: gy + 8, height: h, facing: 0, i, look: MAN });
    });
    for (const dx of [176, 202, 228]) { ctx.fillStyle = c.s8; ctx.beginPath(); ctx.arc(dx, gy - 18, 7, 0, Math.PI * 2); ctx.fill(); }
    plate(ctx, c, 'a Vedic sage', 118, 196, { size: 28 });
    plate(ctx, c, 'father', 300, 214, { size: 28 });
    plate(ctx, c, 'son', 440, 218, { size: 28 });
    plate(ctx, c, 'his son', 578, 244, { size: 28 });
    plate(ctx, c, 'often shaped who could marry whom', W / 2, 92, { size: 28, bg: c.raised });
  }
}
const clamp = (v) => Math.max(0, Math.min(1, v));
