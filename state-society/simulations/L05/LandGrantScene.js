// LandGrantScene - blk-l05-s06. Tax goes from a village to the capital; a copper-plate grant is
// laid on the village and the tax stops (Brahmadeya); then an agrahara, with learning at Aihole
// and Badami. No population or learning bars: only what is recorded.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, mix } from 'simulations/base/kit/SimLook.js';
import { reducedMotion } from 'simulations/base/kit/SimAnim.js';
import { pal, person, crown, tree } from '../shared/SstArt.js';
import { paintVillage } from './LandNest.js';
import { copperPlate, MAN } from './OfficeBits.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

export class LandGrantScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static VISUAL_PROFILE = 'rich';
  static CONTINUOUS = true;   // grain keeps moving along the tax road until the grant stops it
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A village sends sacks of grain along a road to the capital as tax. A copper-plate grant is laid on the village, the sacks stop, and the village is marked Brahmadeya. Then a settlement with a teacher and pupils is marked agraharam, with Aihole and Badami named as centres of learning.';
  static CONTROLS = [{ type: 'button', id: 'lay', label: 'Lay the grant' }];

  constructor(container, config) { super(container, config); this._laid = null; }

  isControlHidden(id) { return id === 'lay' && this.stage !== 1; }
  isControlDisabled(id) { return id === 'lay' && this._laid != null; }
  enter() { this._laid = null; this.requestUiUpdate?.(); }

  onControlChange(id) {
    if (!this._guard(id) || id !== 'lay') return;
    this._laid = reducedMotion() ? 1 : 0;
    this.animateFor(1400);
    this.celebrate(340, 300, 20);
    this.requestUiUpdate?.();
  }

  update(d) {
    if (this._laid != null && this._laid < 1) {
      this._laid = Math.min(1, this._laid + d / 0.8);
      if (this._laid >= 1) this.requestUiUpdate?.();
    }
  }

  draw(ctx, c, t) {
    if (this.stage === 2) { this._agrahara(ctx, c, t); return; }
    paintVillage(ctx, c, {});
    const P = pal(c);
    const laid = this._laid ?? 0;
    // the tax road, up to the capital at the top right
    ctx.save(); ctx.setLineDash([14, 12]); ctx.lineCap = 'round'; ctx.strokeStyle = P.earthDark; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(340, 410); ctx.bezierCurveTo(400, 300, 560, 330, 620, 66); ctx.stroke(); ctx.restore();
    const pt = (u) => {
      const v = 1 - u, x = v * v * v * 340 + 3 * v * v * u * 400 + 3 * v * u * u * 560 + u * u * u * 620;
      const y = v * v * v * 410 + 3 * v * v * u * 300 + 3 * v * u * u * 330 + u * u * u * 66;
      return { x, y };
    };
    if (laid < 1) {
      for (let k = 0; k < 4; k++) {
        const u = (((reducedMotion() ? 0 : t) * 0.16 + k / 4) % 1);
        const p = pt(u);
        ctx.save(); ctx.globalAlpha *= 1 - laid;
        ctx.fillStyle = P.sandDark; ctx.beginPath(); ctx.ellipse(p.x, p.y, 20, 24, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.sand; ctx.beginPath(); ctx.ellipse(p.x - 4, p.y - 4, 12, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    crown(ctx, c, 620, 34, 1);
    pill(ctx, c, 'to the capital', 486, 40, { bg: c.bgSurface, ink: c.label, size: 28 });
    if (laid < 1) pill(ctx, c, 'tax in grain', 200, 450, { bg: c.gold, ink: inkOn(c, c.gold), size: 30 });
    if (this.stage === 1 && this._laid != null) {
      const k = seg(laid, 0, 0.8);
      copperPlate(ctx, c, 300, 420 - (1 - k) * 340, 240 + (1 - k) * 60, 118, -0.07 + (1 - k) * 0.2);
      if (laid >= 1) {
        pill(ctx, c, 'Brahmadeya village', 300, 300, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
        pill(ctx, c, 'tax-free', 556, 450, { bg: c.accent, ink: inkOn(c, c.accent), size: 30 });
      }
    }
  }

  _agrahara(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = P.grass; ctx.fillRect(0, 0, 680, 520);
    ctx.fillStyle = mix(P.sand, P.grass, 0.35); ctx.fillRect(0, 300, 680, 220);
    tree(ctx, c, 340, 330, 3.2, 7);
    const pupils = [[150, 420], [240, 452], [340, 464], [440, 452], [530, 420]];
    person(ctx, this, { role: 'elder', x: 340, y: 340, height: 170, i: 2, t, pose: 'stand', look: MAN });
    pupils.forEach(([x, y], i) => person(ctx, this, { role: 'student', x, y, height: 118, i: i + 3, t }));
    pill(ctx, c, 'agrah\u0101ram', 340, 44, { bg: c.gold, ink: inkOn(c, c.gold), size: 34, display: true });
    pill(ctx, c, 'Aihole', 140, 116, { bg: c.bgSurface, ink: c.label, size: 30 });
    pill(ctx, c, 'Badami', 540, 116, { bg: c.bgSurface, ink: c.label, size: 30 });
    pill(ctx, c, 'centres of learning', 340, 496, { bg: c.accent, ink: inkOn(c, c.accent), size: 28 });
  }
}
