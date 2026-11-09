// DistrictOfficeScene - blk-l05-s04. The Damodarpur five on one mat. Three are leading residents.
// A case makes two of them speak. Then the Gupta posts, with the two new ones marked.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, mix, rr, drawShadow } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, person } from '../shared/SstArt.js';
import { copperPlate, officerTile, bubble, MAN } from './OfficeBits.js';

const SEATS = [
  { id: 'head', name: 'head officer', x: 340, y: 290, h: 176, i: 2, role: 'elder' },
  { id: 'banker', name: 'banker', x: 104, y: 330, h: 176, i: 3, res: true },
  { id: 'trader', name: 'caravan trader', x: 232, y: 430, h: 176, i: 4, res: true },
  { id: 'artisan', name: 'artisan', x: 448, y: 430, h: 176, i: 5, res: true },
  { id: 'revenue', name: 'revenue chief', x: 576, y: 330, h: 176, i: 1 },
];
const CASES = [
  { id: 'road', label: 'A road', targets: ['road'] },
  { id: 'debt', label: 'A debt', targets: ['debt'] },
  { id: 'shop', label: 'A workshop', targets: ['shop'] },
];
const SAYS = {
  road: [['trader', 'My carts need this road.'], ['revenue', 'Who pays to repair it?']],
  debt: [['banker', 'Who will repay the loan?'], ['head', 'I will judge the case.']],
  shop: [['artisan', 'I know who can do this work.'], ['banker', 'Who lends the money?']],
};
const POSTS = [
  { label: 'mantri', sub: 'civil head', i: 2, role: 'elder' },
  { label: 'commander', sub: 'in chief', i: 3 },
  { label: 'general', sub: '', i: 4 },
  { label: 'palace guard', sub: 'chief', i: 5 },
  { label: 'peace and war', sub: 'minister', i: 1, isNew: true },
  { label: 'kum\u0101r\u0101m\u0101tya', sub: 'local officer', i: 6 },
];
const one = (i) => [{ idx: i, dwellMs: null }];

export class DistrictOfficeScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Five members of a Gupta district office sit round one mat, with a copper plate. Three of them are leading residents. A case makes two members speak. Then six Gupta posts, with the two new ones marked.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'A case', chips: CASES, noneLabel: 'None' })];

  tl = tapLight({ label: 'Cases', chips: CASES });

  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  enter() { this.tl.set({ lit: null }); this.requestUiUpdate?.(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.requestUiUpdate?.(); } }

  draw(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    if (this.stage === 2) { this._posts(ctx, c, t); return; }
    ctx.fillStyle = mix(P.earth, P.sand, 0.5); ctx.fillRect(0, 150, 680, 370);
    ctx.fillStyle = P.stone; for (const x of [40, 640]) { rr(ctx, x - 16, 0, 32, 190, 6); ctx.fill(); }
    // the mat
    ctx.fillStyle = mix(c.gold, P.sand, 0.4);
    ctx.beginPath(); ctx.ellipse(340, 372, 290, 112, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = mix(c.s8, P.sand, 0.4); ctx.lineWidth = 6; ctx.stroke();
    copperPlate(ctx, c, 340, 372, 150, 72, -0.06);
    const say = this.stage === 1 ? SAYS[this.tl.lit()[0]] : null;
    const speak = say ? say.map((s) => s[0]) : null;
    for (const s of [...SEATS].sort((a, b) => a.y - b.y)) {
      ctx.save();
      if (speak && !speak.includes(s.id)) ctx.globalAlpha *= 0.42;
      drawShadow(ctx, c, s.x, s.y - 2, 50, 9, 1);
      person(ctx, this, { role: s.role ?? 'adult', x: s.x, y: s.y, height: s.h, i: s.i, t, facing: 0, look: MAN });
      ctx.restore();
      const lit = this.stage === 0 && s.res;
      pill(ctx, c, s.name, Math.max(70, Math.min(610, s.x)), s.y + 20, { bg: lit ? c.gold : c.bgSurface, ink: lit ? inkOn(c, c.gold) : c.label, size: 28 });
    }
    if (say) {
      say.forEach(([id, text], i) => {
        const s = SEATS.find((q) => q.id === id);
        bubble(ctx, c, text, i ? 356 : 24, 14, 300, s.x, s.y - s.h + 6);
      });
    } else if (this.stage === 0) {
      pill(ctx, c, 'Damodarpur copper plates', 340, 40, { bg: c.bgSurface, ink: c.label, size: 28 });
      pill(ctx, c, '3 leading residents', 340, 90, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
    } else pill(ctx, c, 'Tap a case', 340, 60, { bg: c.gold, ink: inkOn(c, c.gold), size: 30 });
  }

  _posts(ctx, c, t) {
    POSTS.forEach((b, i) => {
      const x = 14 + (i % 3) * 220, y = 10 + Math.floor(i / 3) * 252;
      officerTile(ctx, this, c, t, { ...b, x, y, w: 212, h: 242, fig: 142, size: 28, subSize: 28, role: b.role, lit: b.isNew, litCol: c.gold });
      if (b.isNew) pill(ctx, c, 'new', x + 172, y + 30, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
    });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
