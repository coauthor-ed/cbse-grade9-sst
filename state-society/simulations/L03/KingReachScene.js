// KingReachScene - L03 s02 setup (0) and s03 (4 beats). A row of kings of one family. One crown
// set by a gathering (elected), one removed (expelled). The setup shows the row and marks nothing
// so the predict is not answered. b2 two texts. b3 the row again.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, person, crown, palmLeaf, reading, MAN } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_SET = 0, S_LINE = 1, S_ODD = 2, S_TEXTS = 3, S_ASK = 4;
const MAP4 = [m(S_LINE), m(S_ODD), m(S_TEXTS), m(S_ASK)], MAP0 = [m(S_SET)];
const CHIPS = [{ id: 'her', label: 'Hereditary', targets: ['k0', 'k1', 'k4'], tone: 2 }, { id: 'ele', label: 'Elected', targets: ['k2'], tone: 3 }, { id: 'exp', label: 'Expelled', targets: ['k3'], tone: 6 }];
const KINGS = [{ x: 70, h: 284, i: 3 }, { x: 204, h: 292, i: 5 }, { x: 340, h: 280, i: 6 }, { x: 476, h: 288, i: 7 }, { x: 610, h: 282, i: 9 }];

export class KingReachScene extends SimScene {
  static BEAT_STEP_MAP = MAP4;
  static BEAT_MAPS = { 4: MAP4, 0: MAP0, [Number.MAX_SAFE_INTEGER]: MAP0 };
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A row of five crowned kings of one family. In the explanation one crown is set on a king by a gathering of people, and another is lifted from a king who walks away. Chips light hereditary, elected and expelled. A later view shows two texts, the Arthashastra and the Shanti Parva.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== S_ODD && this.stage !== S_ASK; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.set({ lit: null }); }

  _row(ctx, c) {
    const p = pal(c), marks = this.stage === S_ODD || this.stage === S_ASK;
    rr(ctx, 6, 330, 668, 184, 18); ctx.fillStyle = p.earth; ctx.fill();
    KINGS.forEach((K, i) => {
      const tid = `k${i}`, off = marks && this.tl.off(tid);
      ctx.save(); if (off) ctx.globalAlpha = 0.3;
      const out = marks && i === 3;
      person(ctx, this, { role: 'adult', x: K.x + (out ? 14 : 0), y: 440, height: K.h, i: K.i, facing: out ? 1 : 0, pose: out ? 'walk' : 'stand', look: MAN });
      if (!out) crown(ctx, c, K.x, 440 - K.h - 2, 0.84);
      else crown(ctx, c, K.x - 38, 100, 0.84, mix(c.gold, c.bad, 0.2));
      ctx.restore();
      if (i < KINGS.length - 1) {
        ctx.save(); if (marks && (i === 1 || i === 2 || i === 3)) ctx.globalAlpha = 0.2;
        ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.lineCap = 'round';
        const a = K.x + 40, b = KINGS[i + 1].x - 40, y = 472;
        ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.moveTo(b - 10, y - 8); ctx.lineTo(b, y); ctx.lineTo(b - 10, y + 8); ctx.stroke();
        ctx.restore();
      }
    });
    if (marks) {
      if (!this.tl.off('k2')) {
        for (let k = 0; k < 5; k++) person(ctx, this, { role: 'adult', x: 264 + k * 38, y: 512, height: 76, i: 10 + k });
        pill(ctx, c, 'elected', 340, 56, { size: 28, bg: c.s3, display: true });
      }
      if (!this.tl.off('k3')) pill(ctx, c, 'expelled', 476, 56, { size: 28, bg: c.s6, display: true });
    }
    if (!marks) pill(ctx, c, 'in one family', 340, 62, { size: 28, bg: c.gold, display: true });
  }

  _texts(ctx, c) {
    panel(ctx, c, 14, 18, 322, 484, { fill: mix(c.bgSurface, c.s2, 0.14) });
    panel(ctx, c, 344, 18, 322, 484, { fill: mix(c.bgSurface, c.s5, 0.14) });
    for (let i = 0; i < 4; i++) { palmLeaf(ctx, c, 46, 66 + i * 44, 258, 62, { rows: 3, seed: i + 1 }); palmLeaf(ctx, c, 376, 66 + i * 44, 258, 62, { rows: 3, seed: i + 7 }); }
    reading(ctx, c, 'Artha\u015Bh\u0101stra', 175, 322, 33); reading(ctx, c, '\u015Ah\u0101nti Parva', 505, 322, 33);
    reading(ctx, c, 'of Kau\u1E6Dilya', 175, 368, 28, c.labelMuted); reading(ctx, c, 'of the Mah\u0101bh\u0101rata', 505, 368, 28, c.labelMuted);
    pill(ctx, c, 'statecraft', 175, 438, { size: 28, bg: c.s2, display: true });
    pill(ctx, c, 'duties and justice', 505, 438, { size: 28, bg: c.s5, display: true });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === S_TEXTS) this._texts(ctx, c); else this._row(ctx, c);
    drawVignette(ctx, c, 0.3);
  }
}
