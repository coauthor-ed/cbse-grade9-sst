// VedaTextScene - L01 s04. b0 a Harappan seal we cannot read beside a teacher and pupil.
// b1 the same line passes teacher to pupil to pupil, syllable by syllable, exactly. b2 a Rigveda
// folio. b3 four Vedas, tap one. b4 the four parts of each. Nothing here shows a hymn changing:
// the known fact is great exactness. No faces on books or the seal.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill, clamp01, font, inkOn } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, person, reading, palmLeaf, tree, fire, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_SEAL = 0, S_CHAIN = 1, S_FOLIO = 2, S_FOUR = 3, S_PARTS = 4;
const MAP = [m(S_SEAL), m(S_CHAIN), m(S_FOLIO), m(S_FOUR), m(S_PARTS)];
const VEDAS = [
  { id: 'rig', label: '\u1E5Aigveda', tone: 's2', fact: '1,028 hymns', sub: 'the earliest' },
  { id: 'yajur', label: 'Yajurveda', tone: 's3', fact: 'rituals in action', sub: 'with prose' },
  { id: 'sama', label: 'S\u0101maveda', tone: 's5', fact: 'hymns to sing', sub: 'seven svaras' },
  { id: 'atharva', label: 'Atharvaveda', tone: 's6', fact: 'ward off evil', sub: 'treat ailments' },
];
const PARTS = [
  { id: 'samhita', label: 'Samhit\u0101', tag: 'hymns', tone: 's2' },
  { id: 'brahmana', label: 'Br\u0101hma\u1E47a', tag: 'prose on rituals', tone: 's3' },
  { id: 'aranyaka', label: '\u0100ra\u1E47yaka', tag: 'sages in forests', tone: 's5' },
  { id: 'upanishad', label: 'Upani\u1E63had', tag: 'the Self', tone: 's1' },
];
const CHIPS_V = VEDAS.map((v, i) => ({ id: v.id, label: v.label, targets: [v.id], tone: [2, 3, 5, 6][i] }));
const CHIPS_P = PARTS.map((v, i) => ({ id: v.id, label: v.label, targets: [v.id], tone: [2, 3, 5, 1][i] }));
const SYL = ['a', 'gnim', '\u012B', '\u1E0De', 'pu', 'ro', 'hi', 'tam'];
const STEP = 0.32;

export class VedaTextScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Five views. A Harappan seal that cannot be read beside a teacher with a pupil. The same line of a hymn passing syllable by syllable from teacher to pupil, exact each time. A Rigveda manuscript page in Devanagari script. Four books for the four Vedas, tap one. The four parts inside each Veda.';
  static CONTROLS = [
    { type: 'button', id: 'again', label: 'Say the line again' },
    tapLightControl({ id: 'veda', label: 'Veda', chips: CHIPS_V }),
    tapLightControl({ id: 'part', label: 'Part', chips: CHIPS_P }),
  ];
  tv = tapLight({ chips: CHIPS_V });
  tp = tapLight({ chips: CHIPS_P });
  said = 0;

  isControlHidden(id) { return id === 'again' ? this.stage !== S_CHAIN : id === 'veda' ? this.stage !== S_FOUR : id === 'part' ? this.stage !== S_PARTS : false; }
  getControlValue(id) { return id === 'veda' ? this.tv.controlValue() : id === 'part' ? this.tp.controlValue() : undefined; }
  onControlChange(id, v) {
    if (id === 'veda') this.tv.fromControl(v);
    else if (id === 'part') this.tp.fromControl(v);
    else if (id === 'again' && this.stage === S_CHAIN) this.said = this.age;
  }
  enter(stage) { this.said = 0; if (stage === S_FOUR) this.tv.set({ lit: 'rig' }); else this.tv.reset(); if (stage === S_PARTS) this.tp.set({ lit: 'samhita' }); else this.tp.reset(); }
  busy() { return this.stage === S_CHAIN && this.age - this.said < STEP * SYL.length * 3 + 0.6; }

  _line(ctx, c, x, y, w, u, col) {
    const n = SYL.length, g = 6;
    ctx.font = font(c, 800, 28);
    const ws = SYL.map((s) => ctx.measureText(s).width + 16), tot = ws.reduce((a, b) => a + b, 0) + g * (n - 1);
    let xx = x + (w - tot) / 2;
    SYL.forEach((s, i) => {
      const on = u * n > i;
      rr(ctx, xx, y, ws[i], 38, 11); ctx.fillStyle = on ? col : mix(c.bgSurface, c.track, 0.5); ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? inkOn(c, col) : c.labelMuted;
      if (on) ctx.fillText(s, xx + ws[i] / 2, y + 20);
      xx += ws[i] + g;
    });
  }

  _seal(ctx, c, x, y, s) {
    const p = pal(c);
    rr(ctx, x - 80 * s, y - 80 * s + 6, 160 * s, 160 * s, 16); ctx.fillStyle = p.stoneDark; ctx.fill();
    rr(ctx, x - 80 * s, y - 80 * s, 160 * s, 160 * s, 16); ctx.fillStyle = p.stone; ctx.fill();
    ctx.strokeStyle = p.ink; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
    // signs that nobody can read: strokes in a row
    const signs = [[[-50, -48, -50, -22], [-60, -35, -40, -35]], [[-18, -50, -6, -24], [-6, -50, -18, -24]], [[20, -50, 20, -24], [32, -50, 32, -24], [14, -50, 38, -50]], [[56, -50, 56, -24]]];
    for (const sg of signs) for (const [a, b, d, e] of sg) { ctx.beginPath(); ctx.moveTo(x + a * s, y + b * s); ctx.lineTo(x + d * s, y + e * s); ctx.stroke(); }
    // a humped bull outline, as on the seals, no eye
    ctx.lineWidth = 6 * s;
    ctx.beginPath(); ctx.moveTo(x - 52 * s, y + 46 * s); ctx.lineTo(x - 48 * s, y + 8 * s); ctx.quadraticCurveTo(x - 20 * s, y - 8 * s, x + 6 * s, y + 4 * s);
    ctx.quadraticCurveTo(x + 22 * s, y - 14 * s, x + 34 * s, y + 8 * s); ctx.lineTo(x + 54 * s, y + 10 * s); ctx.moveTo(x + 34 * s, y + 8 * s); ctx.lineTo(x + 30 * s, y + 46 * s);
    ctx.moveTo(x - 48 * s, y + 24 * s); ctx.lineTo(x + 30 * s, y + 24 * s); ctx.stroke();
  }

  _grove(ctx, c, t) {
    const p = pal(c);
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = mix(c.bgSurface, c.s3, 0.1); ctx.fill();
    rr(ctx, 6, 330, 668, 184, 18); ctx.fillStyle = p.grass; ctx.fill();
    tree(ctx, c, 620, 340, 2, 3);
  }

  _folio(ctx, c) {
    const p = pal(c), X = 60, Y = 60, W = 560, H = 330;
    panel(ctx, c, X, Y, W, H, { fill: p.palm, rim: p.palmEdge, r: 8 });
    ctx.strokeStyle = c.bad; ctx.lineWidth = 2;
    for (const dx of [40, 48, W - 48, W - 40]) { ctx.beginPath(); ctx.moveTo(X + dx, Y + 16); ctx.lineTo(X + dx, Y + H - 16); ctx.stroke(); }
    ctx.fillStyle = p.ink;
    for (let r = 0; r < 8; r++) {
      const y = Y + 40 + r * 36; ctx.fillRect(X + 66, y, W - 132, 3.5);
      let xx = X + 70, seed = r * 7 + 3;
      while (xx < X + W - 72) { seed = (seed * 9301 + 49297) % 233280; const k = seed / 233280; ctx.fillRect(xx, y, 3, 10 + k * 8); if (k > 0.5) ctx.fillRect(xx + 5, y + 8, 7, 3); xx += 13 + k * 8; }
    }
    reading(ctx, c, 'A \u1E5Aigveda manuscript', 340, 442, 30);
    pill(ctx, c, 'Devanagari script', 340, 484, { size: 28, bg: c.gold, display: true });
  }

  _books(ctx, c) {
    const p = pal(c);
    VEDAS.forEach((v, i) => {
      const x = 14 + i * 166, w = 154, lit = this.tv.has(v.id), off = this.tv.off(v.id), lift = lit ? -16 : 0;
      ctx.save(); if (off) ctx.globalAlpha = 0.4;
      panel(ctx, c, x, 60 + lift, w, 300, { fill: mix(c.bgSurface, c[v.tone], 0.2), lit, litCol: c[v.tone] });
      for (let k = 0; k < 4; k++) palmLeaf(ctx, c, x + 16, 96 + lift + k * 22, w - 32, 42, { rows: 2, seed: i * 3 + k });
      // binding cord
      ctx.strokeStyle = p.earthDark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2, 96 + lift); ctx.lineTo(x + w / 2, 192 + lift); ctx.stroke();
      ctx.font = font(c, 700, 28, true);
      reading(ctx, c, v.label, x + w / 2, 244 + lift, v.label.length > 9 ? 26 : 28);
      ctx.restore();
    });
    const v = VEDAS.find((q) => this.tv.has(q.id)) ?? VEDAS[0];
    pill(ctx, c, v.fact, 340, 412, { size: 34, bg: c[v.tone], display: true });
    reading(ctx, c, v.sub, 340, 468, 28, c.labelMuted);
  }

  _parts(ctx, c, t) {
    const p = pal(c);
    PARTS.forEach((v, i) => {
      const y = 22 + i * 120, lit = this.tp.has(v.id), off = this.tp.off(v.id);
      ctx.save(); if (off) ctx.globalAlpha = 0.45;
      panel(ctx, c, 40, y, 600, 108, { fill: mix(c.bgSurface, c[v.tone], lit ? 0.26 : 0.14), lit, litCol: c[v.tone] });
      const ix = 104, iy = y + 56;
      if (i === 0) fire(ctx, c, ix, iy + 28, 1, t);
      if (i === 1) palmLeaf(ctx, c, ix - 44, iy - 24, 90, 46, { rows: 3 });
      if (i === 2) tree(ctx, c, ix, iy + 40, 0.9, 6);
      if (i === 3) { ctx.beginPath(); ctx.arc(ix, iy, 26, 0, TAU); ctx.fillStyle = c.gold; ctx.fill(); for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; ctx.strokeStyle = c.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * 32, iy + Math.sin(a) * 32); ctx.lineTo(ix + Math.cos(a) * 42, iy + Math.sin(a) * 42); ctx.stroke(); } }
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = font(c, 700, 34, true); ctx.fillStyle = c.label; ctx.fillText(v.label, 176, y + 36);
      ctx.font = font(c, 800, 28); ctx.fillStyle = c.labelMuted; ctx.fillText(v.tag, 176, y + 76);
      ctx.restore();
    });
  }

  draw(ctx, c) {
    const t = this.clock ?? 0, st = this.stage;
    drawBackdrop(ctx, c, 'dots');
    if (st === S_SEAL || st === S_CHAIN) this._grove(ctx, c, t);
    if (st === S_SEAL) {
      this._seal(ctx, c, 150, 170, 1.15);
      pill(ctx, c, 'cannot be read yet', 150, 300, { size: 28, bg: c.warning, display: true });
      person(ctx, this, { role: 'elder', x: 366, y: 490, height: 250, pose: 'point', facing: 1, i: 0 });
      person(ctx, this, { role: 'student', x: 528, y: 498, height: 200, facing: -1, i: 1 });
      pill(ctx, c, 'spoken for centuries', 440, 92, { size: 28, bg: c.gold, display: true });
    }
    if (st === S_CHAIN) {
      const u = (this.age - this.said) / (STEP * SYL.length);
      this._line(ctx, c, 16, 28, 648, clamp01(u), c.gold);
      this._line(ctx, c, 16, 76, 648, clamp01(u - 1), c.gold);
      this._line(ctx, c, 16, 124, 648, clamp01(u - 2), c.gold);
      person(ctx, this, { role: 'elder', x: 130, y: 490, height: 190, pose: 'point', facing: 1, i: 0 });
      person(ctx, this, { role: 'student', x: 340, y: 496, height: 160, facing: -1, i: 1 });
      person(ctx, this, { role: 'student', x: 500, y: 498, height: 150, facing: -1, i: 2 });
      pill(ctx, c, 'teacher', 130, 244, { size: 28, bg: c.s2, display: true });
      pill(ctx, c, 'pupil', 340, 280, { size: 28, bg: c.s3, display: true });
      pill(ctx, c, 'next pupil', 500, 290, { size: 28, bg: c.s3, display: true });
      if (u >= 3) pill(ctx, c, 'the same line, exactly', 340, 188, { size: 28, bg: c.good, display: true });
    }
    if (st === S_FOLIO) this._folio(ctx, c);
    if (st === S_FOUR) this._books(ctx, c);
    if (st === S_PARTS) this._parts(ctx, c, t);
    drawVignette(ctx, c, 0.35);
  }
}
