// AssemblyCourtScene - L02 s01. An imagined court. b0 the king holds up a new land tax and asks.
// b1 an adviser speaks, the king listens, and the leaf is rewritten. Nobody overrules him: he listens.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01 } from 'simulations/base/kit/SimLook.js';
import { palmLeaf, person, crown, MAN, pal } from '../shared/SstArt.js';
import { dayStage, speech } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const SEATED = [[372, 'elder', 8], [452, 'adult', 5], [532, 'farmer', 6], [612, 'adult', 7]];

export class AssemblyCourtScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'An imagined court in ancient India. A crowned king on a raised step holds out a palm leaf with a new land tax and turns to his advisers. Then an adviser says the tax is too heavy after a poor harvest. The king listens and the leaf is changed to a lighter tax.';

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const p = pal(c);
    dayStage(ctx, c, { horizon: 256, ground: 'earth' });
    [24, 300, 640].forEach((x) => { ctx.fillStyle = p.stoneLight; ctx.fillRect(x, 0, 30, 256); ctx.fillStyle = p.stone; ctx.fillRect(x + 20, 0, 10, 256); ctx.strokeStyle = p.stoneDark; ctx.lineWidth = 2.5; ctx.strokeRect(x, 0, 30, 256); });
    ctx.fillStyle = p.stone; ctx.fillRect(40, 306, 240, 28); ctx.strokeStyle = p.stoneDark; ctx.strokeRect(40, 306, 240, 28);
    ctx.fillStyle = p.stoneDark; ctx.fillRect(40, 334, 240, 10);
    const k = person(ctx, this, { role: 'adult', x: 160, y: 308, height: 232, i: 3, facing: 1, pose: this.stage === 0 ? 'point' : 'stand', look: MAN, mood: this.stage ? 'think' : 'smile' });
    const hd = k.anchors.head; crown(ctx, c, hd.x, hd.y - hd.r * 1.12, 1.25);
    SEATED.forEach(([x, role, i], n) => person(ctx, this, { role, x, y: 436, height: 200, i, facing: -1, pose: this.stage === 1 && n === 0 ? 'point' : 'stand', mood: 'smile' }));
    const u = clamp01(this.age / 0.6);
    palmLeaf(ctx, c, 90, 382, 200, 60, { rows: this.stage ? 1 : 3, seed: 3 });
    pill(ctx, c, this.stage ? 'lighter tax' : 'new land tax', 190, 364, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    if (this.stage === 1) speech(ctx, c, 'Too heavy after a poor harvest', 430, 52 + (1 - u) * 16, 374, 216, { size: 28, display: true });
    else speech(ctx, c, 'What do you think?', 454, 52, 248, 120, { size: 28, display: true });
    pill(ctx, c, 'imagine', 80, 30, { size: 28, bg: mix(c.gold, c.bgSurface, 0.45), ink: c.label });
  }
}
