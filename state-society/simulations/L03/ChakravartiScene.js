// ChakravartiScene - L03 s05. Map fills the stage. b0 solid held land, soft outline of the whole
// land from Himavat to the sea. b1 chips light the three words. b2 a horse with guards walks a
// loop for the ashvamedha. b3 three kings on a to-scale date strip.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, alpha, mix, clamp01, rr } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, sstFullView, drawSstFull } from '../L02/SstMapBase.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { pal, person, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[64, 7], [97, 37]];
const CHIPS = [
  { id: 'jambu', label: 'Jambudv\u012Bpa', targets: ['all'], tone: 2 },
  { id: 'bharata', label: 'Bh\u0101ratavar\u1E63ha', targets: ['all'], tone: 3 },
  { id: 'prithivi', label: 'Prithivi', targets: ['ends'], tone: 5 },
];
const HELD = [[79, 28], [83, 27.6], [87, 26.6], [88, 24.5], [85.5, 23.4], [81.5, 24], [78.2, 25.4]];
const IDEAL = [[68, 34], [76, 35.5], [85, 29], [92, 28], [90, 22], [80.5, 13.5], [78, 8.2], [75.8, 11], [72.6, 20], [68, 24]];
const STRIP = {
  from: -350, to: 1100,
  marks: [
    { id: 'a', at: -250, when: '3rd c. BCE', label: 'A\u015Bhoka', tone: 2 },
    { id: 'n', at: 100, when: 'Sangam period', label: 'Nedunjeral Adan', tone: 3 },
    { id: 'r', at: 1025, when: '11th c. CE', label: 'Rajendra I', tone: 6 },
  ],
  spans: [{ from: -250, to: 1025, label: 'about 1300 years', tone: 'accent' }],
};
const LOOP = [[82, 26.6], [85, 26.2], [86.6, 25], [85, 23.8], [82, 24.2], [80.4, 25.6]];
const LAP = 7;

function horse(ctx, c, x, y, s, dir, step) {
  const p = pal(c);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  ctx.fillStyle = p.sandDark; ctx.strokeStyle = p.earthDark; ctx.lineWidth = 2;
  ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = p.earthDark;
  const sw = Math.sin(step) * 8;
  for (const [hx, d] of [[-24, sw], [-16, -sw], [20, -sw], [28, sw]]) { ctx.beginPath(); ctx.moveTo(hx, -8); ctx.lineTo(hx + d, 26); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -18, 38, 17, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(26, -28); ctx.quadraticCurveTo(44, -44, 46, -58); ctx.lineTo(64, -48); ctx.lineTo(60, -40); ctx.lineTo(48, -40); ctx.quadraticCurveTo(44, -22, 32, -12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = p.earthDark; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(30, -30); ctx.quadraticCurveTo(38, -46, 44, -58); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-36, -22); ctx.quadraticCurveTo(-52, -18, -50, 6); ctx.stroke();
  ctx.restore();
}

export class ChakravartiScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the subcontinent with one solid area for land a king held and a soft outline from the Himalayas to the sea for the land kings thought about. Chips light the words Jambudvipa, Bharatavarsha and Prithivi. A horse with guards walks a loop for the ashvamedha. A date strip spaced to scale shows Ashoka, Nedunjeral Adan and Rajendra I.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Word', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  async setup() { this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT); this.animateFor?.(400); }
  enter(stage) { this.tl.set({ lit: stage === 1 ? 'jambu' : null }); }
  busy() { return this.stage === 2 && this.age < LAP; }

  _poly(ctx, ring) {
    const P = ring.map((ll) => this.view.at(ll)), n = P.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s = mid(P[n - 1], P[0]);
    ctx.beginPath(); ctx.moveTo(s[0], s[1]);
    P.forEach((q, i) => { const e = mid(q, P[(i + 1) % n]); ctx.quadraticCurveTo(q[0], q[1], e[0], e[1]); });
    ctx.closePath();
  }

  draw(ctx, c) {
    if (!drawSstFull(ctx, c, this)) return;
    const v = this.view, st = this.stage, lit = this.tl.chip();
    // the ideal: the whole land, soft edge, clipped to the land itself
    ctx.save(); ctx.beginPath(); v.path.context(ctx)(this.map.land); ctx.clip();
    this._poly(ctx, IDEAL); ctx.fillStyle = alpha(c.gold, lit ? 0.42 : 0.26); ctx.fill();
    ctx.lineWidth = 16; ctx.strokeStyle = alpha(c.gold, 0.35); ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    if (st <= 2) {
      this._poly(ctx, HELD); ctx.fillStyle = c.s6; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = mix(c.s6, c.label, 0.4); ctx.stroke();
    }
    if (st === 0) {
      pill(ctx, c, 'held by one king', 430, 180, { size: 28, bg: c.s6, display: true });
      pill(ctx, c, 'the whole land', 220, 320, { size: 28, bg: c.gold, display: true });
    }
    if (st === 1 && lit) {
      if (lit.id === 'prithivi') {
        pill(ctx, c, 'Himavat', 380, 54, { size: 28, bg: c.s5, display: true });
        pill(ctx, c, 'the sea', 200, 470, { size: 28, bg: c.s1, display: true });
        pill(ctx, c, 'the sea', 490, 470, { size: 28, bg: c.s1, display: true });
      } else pill(ctx, c, lit.label, 200, 90, { size: 32, bg: lit.id === 'jambu' ? c.s2 : c.s3, display: !/\u012B/.test(lit.label) });
    }
    if (st === 2) {
      const u = clamp01(this.age / LAP), n = LOOP.length, f = u * n, i = Math.floor(f) % n, k = f - Math.floor(f);
      const a = v.at(LOOP[i]), b = v.at(LOOP[(i + 1) % n]);
      const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
      ctx.setLineDash([3, 12]); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = c.label; this._poly(ctx, LOOP); ctx.stroke(); ctx.setLineDash([]);
      const dir = b[0] >= a[0] ? 1 : -1;
      horse(ctx, c, x, y - 18, 1.1, dir, u < 1 ? this.age * 9 : 0);
      person(ctx, this, { role: 'adult', x: x - dir * 66, y: y + 8, height: 76, i: 5, facing: dir });
      person(ctx, this, { role: 'adult', x: x - dir * 104, y: y + 8, height: 76, i: 6, facing: dir });
      pill(ctx, c, 'a\u015Bhvamedha', 200, 90, { size: 30, bg: c.gold, display: true });
      pill(ctx, c, 'land crossed unchallenged was claimed', 340, 480, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    }
    if (st === 3) {
      rr(ctx, 12, 262, 656, 250, 18); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.stroke; ctx.stroke();
      drawDateStrip(ctx, c, STRIP, { x: 34, y: 276, w: 612, size: 28 });
      pill(ctx, c, 'the same aim, again and again', 340, 48, { size: 28, bg: c.gold, display: true });
    }
  }
}
