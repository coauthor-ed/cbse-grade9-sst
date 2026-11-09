// ParlVsPresScene - L05 s04. Two plans side by side, built up: b0 parliamentary, b1 presidential,
// b2 both, with the one question answered on top. Tap Voters, Legislature or Executive to light it.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { room, who, tag, arrow, card, pop, mix } from '../L04/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const TAU = Math.PI * 2;
const CHIPS = [
  { id: 'vot', label: 'Voters', targets: ['vot'], tone: 3 },
  { id: 'leg', label: 'Legislature', targets: ['leg'], tone: 1 },
  { id: 'exe', label: 'Executive', targets: ['exe'], tone: 5 },
];

export class ParlVsPresScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Two plans. On the left voters elect a legislature, the executive sits inside it and answers to it. On the right voters elect a legislature and, separately, a President, who answers to the people.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Part', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 2; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.reset(); }
  busy() { return this.age < 1.8; }

  _chamber(ctx, c, cx, y, r, off) {
    ctx.save(); if (off) ctx.globalAlpha *= 0.28;
    ctx.beginPath(); ctx.arc(cx, y, r, Math.PI, 0); ctx.closePath(); ctx.fillStyle = mix(c.s1, c.bgSurface, 0.66); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.s1; ctx.stroke();
    for (let q = 0; q < 3; q++) { const R = r * (0.52 + q * 0.2), n = 8 + q * 3; for (let i = 0; i < n; i++) { const th = Math.PI + ((i + 0.5) / n) * Math.PI; ctx.beginPath(); ctx.arc(cx + Math.cos(th) * R, y + Math.sin(th) * R, r * 0.058, 0, TAU); ctx.fillStyle = c.s1; ctx.fill(); } }
    ctx.restore();
  }

  _voters(ctx, c, cx, off) {
    ctx.save(); if (off) ctx.globalAlpha *= 0.28;
    [-114, -38, 38, 114].forEach((d, i) => who(ctx, this, { role: ['farmer', 'teacher', 'adult', 'elder'][i], x: cx + d, y: 442, height: 104, i: i + 2 }));
    ctx.restore();
  }

  draw(ctx, c) {
    const st = this.stage, a = this.age, L = this.tl.chip()?.id;
    const off = (id) => L && L !== id;
    room(ctx, c, { ground: 316, wall: mix(c.bgSurface, c.water, 0.16), floor: mix(c.bgSurface, c.s3, 0.3) });
    ctx.fillStyle = mix(c.bgSurface, c.stroke, 0.4); ctx.fillRect(337, 0, 6, 453);
    const k = (at) => (st === 0 || st === 2 ? pop(a, at) : 1);
    // parliamentary
    {
      const x = 168, dim = st === 1;
      ctx.save(); if (dim) ctx.globalAlpha *= 0.4;
      this._chamber(ctx, c, x, 284, 122, off('leg'));
      ctx.save(); if (off('exe')) ctx.globalAlpha *= 0.28;
      [-44, 0, 44].forEach((d, i) => who(ctx, this, { role: ['adult', 'teacher', 'elder'][i], x: x + d, y: 292, height: 100, i: i + 1 }));
      ctx.restore();
      this._voters(ctx, c, x, off('vot'));
      if (!off('vot') && !off('leg')) arrow(ctx, c, x - 110, 346, x - 110, 296, { k: st === 0 ? (a - 0.3) / 0.4 : 1, col: c.s3, w: 12 });
      tag(ctx, c, 'Legislature', x, 148, { bg: c.s1, size: 28, k: k(0.2) });
      tag(ctx, c, 'Executive is inside', x, 110, { bg: c.s5, size: 27, k: k(0.5) });
      tag(ctx, c, 'Parliamentary', x, 30, { bg: c.gold, size: 32 });
      ctx.restore();
    }
    // presidential
    if (st >= 1) {
      const x = 510, k2 = (at) => (st === 1 ? pop(a, at) : 1);
      this._chamber(ctx, c, x - 76, 284, 80, off('leg'));
      ctx.save(); if (off('exe')) ctx.globalAlpha *= 0.28;
      who(ctx, this, { role: 'adult', x: x + 96, y: 296, height: 136, i: 6 });
      ctx.restore();
      this._voters(ctx, c, x, off('vot'));
      if (!off('vot') && !off('leg')) arrow(ctx, c, x - 76, 346, x - 76, 298, { k: st === 1 ? (a - 0.3) / 0.4 : 1, col: c.s3, w: 12 });
      if (!off('vot') && !off('exe')) arrow(ctx, c, x + 60, 346, x + 80, 300, { k: st === 1 ? (a - 0.6) / 0.4 : 1, col: c.s3, w: 12 });
      tag(ctx, c, 'Legislature', x - 76, 184, { bg: c.s1, size: 27, k: k2(0.2) });
      tag(ctx, c, 'President', x + 92, 138, { bg: c.s5, size: 28, k: k2(0.5) });
      tag(ctx, c, 'Presidential', x, 30, { bg: c.gold, size: 32 });
    }
    if (st === 0) card(ctx, c, 352, 40, 314, 340, { title: 'India, Canada', text: 'People elect the legislature. The executive sits inside it and answers to it.', size: 29, titleSize: 32, alpha: Math.min(1, pop(a, 0.8)) });
    if (st === 2) {
      tag(ctx, c, 'answers to legislature', 168, 70, { bg: c.good, size: 27, k: pop(a, 0.2) });
      tag(ctx, c, 'answers to the people', 510, 70, { bg: c.good, size: 27, k: pop(a, 0.5) });
    }
    drawVignette(ctx, c, 0.14);
  }
}
