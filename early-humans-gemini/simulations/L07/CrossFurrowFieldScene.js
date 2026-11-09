// CrossFurrowFieldScene - blk-l07-s05, 3 beats. The Kalibangan field in low perspective, big, with a ploughman and his ox on
// the near edge. Beat 0: the furrows only, what the ground shows. Beat 1: the two crops drawn on them, stamped as an
// inference. Beat 2: a small calendar strip: Kharif and Rabi are two crops in two seasons, the field two crops in one.
// Chips light the wide set or the close set. Canvas: the ploughman comes from SimFigure and the ox from SimAnimal.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, lighten, mix, pill, rr, font, mulberry32, inkOn } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawAnimal } from 'simulations/base/kit/SimAnimal.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';

const W = 680, H = 520;
const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'wide', label: 'Wide set', targets: ['wide'], tone: 2 },
  { id: 'close', label: 'Close set', targets: ['close'], tone: 3 },
];
const WIDE = 6, CLOSE = 15;
// Field corners: far left, far right, near right, near left.
const FAR = 150, NEAR = 400, FL = 170, FR = 510, NL = 40, NR = 640;
const P = (u, v) => { const k = v * v * 0.35 + v * 0.65, y = FAR + (NEAR - FAR) * k, l = FL + (NL - FL) * k, r = FR + (NR - FR) * k; return [l + (r - l) * u, y, 0.42 + 0.58 * k]; };

export class CrossFurrowFieldScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A ploughed field seen from a low angle, with furrows in two directions crossing at right angles, one set wide apart and one close together, and a ploughman with an ox at the near edge. Later, mustard stands in the wide rows and gram in the close rows, marked as an inference.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this.animateFor(200); } });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && (this.stage ?? 0) === 2; }

  enter() { this.tl.reset(); }
  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, k = clamp(t / 0.8, 0, 1), e = 1 - (1 - k) * (1 - k);
    ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, FAR); sky.addColorStop(0, alpha(c.s1, 0.3)); sky.addColorStop(1, alpha(c.gold, 0.12));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, FAR);
    const ground = darken(c.gold, 0.05);
    ctx.fillStyle = mix(ground, c.bgSurface, 0.35); ctx.fillRect(0, FAR - 6, W, H - FAR + 6);
    this._field(ctx, c, s, e);
    this._farmer(ctx, c, s);
    if (s === 0) this._tag(ctx, c, 'The ground shows', 340, 50, c.good);
    if (s === 1) this._tag(ctx, c, 'We infer: two crops', 340, 50, c.s2);
    if (s === 2) this._calendar(ctx, c, e);
    if (s < 2) {
      const lit = this.tl.lit()[0];
      if (s === 1) {
        if (lit !== 'close') pill(ctx, c, 'mustard, wide rows', 170, 106, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
        if (lit !== 'wide') pill(ctx, c, 'gram, close rows', 510, 106, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
      } else {
        if (lit !== 'close') pill(ctx, c, 'wide set', 170, 106, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
        if (lit !== 'wide') pill(ctx, c, 'close set', 510, 106, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
      }
    }
  }

  _tag(ctx, c, text, x, y, col) { pill(ctx, c, text, x, y, { size: 30, bg: col, display: true }); }

  _field(ctx, c, s, e) {
    const soil = c.s8 && mix(darken(c.gold, 0.32), c.s8, 0.25), lit = this.tl.lit()[0];
    const q = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)];
    ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = soil; ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = darken(soil, 0.3); ctx.stroke();
    const rnd = mulberry32(77);
    ctx.fillStyle = alpha(darken(soil, 0.4), 0.35);
    for (let i = 0; i < 260; i++) { const p = P(rnd(), rnd()); ctx.fillRect(p[0], p[1], 2.4 * p[2], 1.6 * p[2]); }
    const dimW = lit === 'close' ? 0.25 : 1, dimC = lit === 'wide' ? 0.25 : 1;
    // Close set: across the field.
    for (let i = 1; i < CLOSE; i++) this._groove(ctx, soil, [0, i / CLOSE], [1, i / CLOSE], lit === 'close' ? 7 : 5, dimC);
    // Wide set: runs away from the viewer.
    for (let i = 1; i < WIDE; i++) this._groove(ctx, soil, [i / WIDE, 0], [i / WIDE, 1], lit === 'wide' ? 12 : 9, dimW);
    if (s >= 1) this._crops(ctx, c, s === 1 ? e : 1, dimW, dimC);
  }

  _groove(ctx, soil, a, b, w, dim) {
    const pa = P(a[0], a[1]), pb = P(b[0], b[1]);
    ctx.save(); ctx.globalAlpha *= dim; ctx.lineCap = 'round';
    const line = (dy, col, lw) => { ctx.beginPath(); for (let i = 0; i <= 8; i++) { const u = a[0] + (b[0] - a[0]) * i / 8, v = a[1] + (b[1] - a[1]) * i / 8, p = P(u, v); i ? ctx.lineTo(p[0], p[1] + dy) : ctx.moveTo(p[0], p[1] + dy); } ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); };
    void pa; void pb;
    line(0, darken(soil, 0.5), w * (0.45 + 0.55 * pb[2]));
    line(w * 0.45, lighten(soil, 0.22), Math.max(1.5, w * 0.3));
    ctx.restore();
  }

  _crops(ctx, c, k, dimW, dimC) {
    const items = [];
    for (let i = 1; i < CLOSE; i += 1) for (let j = 0; j < 9; j++) { const u = (j + 0.5) / 9 + (i % 2 ? 0.015 : -0.015); if (Math.abs(u * WIDE - Math.round(u * WIDE)) > 0.12) items.push({ u, v: i / CLOSE, kind: 'g' }); }
    for (let i = 1; i < WIDE; i++) for (let j = 0; j < 7; j++) items.push({ u: i / WIDE, v: (j + 0.4) / 7, kind: 'm' });
    items.sort((a, b) => a.v - b.v);
    items.forEach((it, idx) => {
      const p = P(it.u, it.v), g = clamp(k * 1.6 - idx / items.length * 0.6, 0, 1) * p[2];
      if (g <= 0) return;
      ctx.save();
      ctx.globalAlpha *= it.kind === 'm' ? dimW : dimC;
      if (it.kind === 'm') {
        const h = 62 * g;
        ctx.strokeStyle = darken(c.elevLow, 0.2); ctx.lineWidth = 4 * p[2]; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] - h); ctx.stroke();
        ctx.fillStyle = c.gold;
        for (const [dx, dy, r] of [[0, -1, 10], [-8, -0.8, 8], [8, -0.82, 8]]) { ctx.beginPath(); ctx.arc(p[0] + dx * g, p[1] + h * dy, r * g, 0, 7); ctx.fill(); }
      } else {
        ctx.fillStyle = darken(c.elevLow, 0.05);
        ctx.beginPath(); ctx.ellipse(p[0], p[1] - 6 * g, 12 * g, 9 * g, 0, 0, 7); ctx.fill();
        ctx.fillStyle = lighten(c.elevLow, 0.3);
        ctx.beginPath(); ctx.ellipse(p[0] - 3 * g, p[1] - 9 * g, 5 * g, 3.4 * g, 0, 0, 7); ctx.fill();
      }
      ctx.restore();
    });
  }

  _farmer(ctx, c, s) {
    const y = 490, ox = 330;
    if (s === 2) return;
    drawAnimal(ctx, c, { x: ox, y, length: 170, facing: 1, kind: 'cow', pose: 'stand' }, { coat: c.gold, mark: 'none' });
    // The plough: beam from the ox to a share in the soil, with a handle in the man's hands.
    ctx.lineCap = 'round'; ctx.strokeStyle = darken(c.s8, 0.25); ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(ox - 40, y - 74); ctx.lineTo(ox - 112, y - 12); ctx.stroke();
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ox - 124, y - 2); ctx.lineTo(ox - 104, y - 50); ctx.lineTo(ox - 118, y - 88); ctx.stroke();
    const spec = figureFor(this, { role: 'farmer', pose: 'push', x: ox - 196, y, height: 170, facing: 1, hands: [{ x: ox - 118, y: y - 88 }, { x: ox - 118, y: y - 88 }] });
    drawFigure(ctx, c, spec, spec.look);
  }

  _calendar(ctx, c, e) {
    const x = 196, w = 454, y = 366, rowH = 56, a = 0.5;
    ctx.save(); ctx.globalAlpha *= e;
    rr(ctx, 14, y - 52, 652, 200, 18); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.stroke; ctx.stroke();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = font(c, 700, 26, true); ctx.fillStyle = c.label;
    ctx.fillText('One field, one year', 340, y - 26);
    const seg = (x0, x1, yy, col, text) => { rr(ctx, x + w * x0, yy, w * (x1 - x0) - 6, rowH - 8, 12); ctx.fillStyle = col; ctx.fill(); ctx.textAlign = 'center'; ctx.font = font(c, 700, 26, true); ctx.fillStyle = inkOn(c, col); ctx.fillText(text, x + w * (x0 + x1) / 2 - 3, yy + (rowH - 8) / 2 + 1); };
    const lab = (s, yy) => { ctx.textAlign = 'left'; ctx.font = font(c, 700, 26, true); ctx.fillStyle = c.label; ctx.fillText(s, 32, yy + (rowH - 8) / 2 + 1); };
    lab('Today', y); seg(0, a, y, c.s3, 'Kharif'); seg(a, 1, y, c.gold, 'Rabi');
    lab('Crossing rows', y + rowH + 6); seg(a, 1, y + rowH + 6, c.s2, 'two crops');
    ctx.restore();
  }
}
