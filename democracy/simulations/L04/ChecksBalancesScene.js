// ChecksBalancesScene - L04 s04. The same three buildings. b0 the amendment check. b1 two more, a tap
// each. b2 a citizen at the court steps: Public Interest Litigation.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic, day, who, tag, arrow, sheet, card, pop } from './DayKit.js';
import { drawTriad } from './OrganTriad.js';

const m = (idx) => [{ idx, dwellMs: null }];
const G = 238;
const CHIPS = [
  { id: 'amend', label: 'An amendment', targets: ['amend'], tone: 1 },
  { id: 'agency', label: 'Enforcement', targets: ['agency'], tone: 3 },
  { id: 'law', label: 'A law', targets: ['law'], tone: 5 },
];
const SAY = {
  amend: 'Parliament can amend the Constitution. The judiciary can review the amendment.',
  agency: 'Parliament\u2019s laws and rules regulate these agencies. Courts can review them.',
  law: 'The judiciary can declare a law unconstitutional if it goes against the Constitution.',
};

export class ChecksBalancesScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Three buildings for the legislature, executive and judiciary, with thick arrows showing each check. A tap chooses an amendment, enforcement or a law. On the last beat a citizen stands at the court steps with a petition for the public.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Check', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this._at = this.age; } }
  enter(st) { this._at = 0; this.tl.set({ lit: st === 0 ? 'amend' : st === 1 ? 'agency' : null }); }
  busy() { return this.age - (this._at ?? 0) < 1.3; }

  draw(ctx, c) {
    const st = this.stage, a = this.age - (this._at ?? 0);
    day(ctx, c, { ground: G, sun: false });
    if (st < 2) {
      const lit = this.tl.chip()?.id ?? 'none';
      const roleOf = { amend: ['leg', 'jud'], agency: ['leg', 'exe', 'jud'], law: ['leg', 'jud'], none: ['leg', 'exe', 'jud'] }[lit];
      drawTriad(ctx, this, G, { off: (id) => (roleOf.includes(id) ? 0 : 1), figures: false });
      const k = (a - 0.15) / 0.6, k2 = (a - 0.6) / 0.6;
      if (lit === 'amend') {
        sheet(ctx, c, 118, 72, 164, 96, { title: 'amendment', size: 26, lines: 2, rot: -0.04 });
        arrow(ctx, c, 524, 100, 212, 50, { k, bend: 0.2, col: c.s5, w: 12 });
        tag(ctx, c, 'can review', 420, 28, { k: pop(a, 0.75), bg: c.s5 });
      } else if (lit === 'agency') {
        arrow(ctx, c, 150, 104, 300, 128, { k, bend: -0.3, col: c.s1, w: 12 });
        tag(ctx, c, 'laws and rules', 148, 34, { k: pop(a, 0.6), bg: c.s1 });
        arrow(ctx, c, 530, 104, 394, 128, { k: k2, bend: 0.3, col: c.s5, w: 12 });
        tag(ctx, c, 'can review', 540, 34, { k: pop(a, 1), bg: c.s5 });
      } else if (lit === 'law') {
        sheet(ctx, c, 118, 72, 132, 96, { title: 'a law', size: 27, lines: 2, rot: -0.04 });
        arrow(ctx, c, 524, 100, 196, 60, { k, bend: 0.2, col: c.s5, w: 12 });
        tag(ctx, c, 'unconstitutional', 420, 28, { k: pop(a, 0.75), bg: c.s5 });
      }
      card(ctx, c, 14, 318, 652, 124, { text: SAY[lit] ?? 'Tap a check to see who checks whom.', size: 29 });
    } else {
      day(ctx, c, { ground: 356, sun: false });
      const u = Math.min(1, this.age / 1);
      drawCivic(ctx, c, 'court', 430, 356, { w: 350 });
      who(ctx, this, { role: 'adult', x: 60, y: 410, height: 184, i: 5, pose: 'stand', facing: 1 });
      who(ctx, this, { role: 'elder', x: 126, y: 424, height: 180, i: 6, pose: 'stand', facing: 1 });
      who(ctx, this, { role: 'voter', x: 170 + u * 40, y: 442, height: 214, i: 3, pose: u < 1 ? 'walk' : 'point', phase: this.age * 1.3, facing: 1 });
      sheet(ctx, c, 330, 318, 176, 86, { title: 'for the public', size: 25, lines: 2, rot: 0.05, alpha: Math.min(1, Math.max(0, (this.age - 0.7) / 0.4)) });
      tag(ctx, c, 'Public Interest Litigation', 340, 38, { k: pop(this.age, 1.0), bg: c.gold, size: 34 });
    }
    drawVignette(ctx, c, 0.18);
  }
}
