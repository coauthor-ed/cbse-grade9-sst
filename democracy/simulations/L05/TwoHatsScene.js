// TwoHatsScene - L05 s08. Two people, two jobs. A chip changes the country: UK, India, Canada.
// No figure is a likeness: the labels name offices, never persons.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { crown } from '../shared/SstArt.js';
import { drawCivic, day, who, tag, card, pop } from '../L04/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const LANDS = [
  { id: 'uk', label: 'UK', tone: 3, state: 'Monarch', i: 2, crown: true, say: 'A constitutional monarchy. Executive power lies with the Prime Minister.' },
  { id: 'india', label: 'India', tone: 2, state: 'President', i: 4, say: 'Executive power lies with the council of ministers headed by the Prime Minister.' },
  { id: 'canada', label: 'Canada', tone: 1, state: 'Monarch', i: 6, crown: true, say: 'A Governor-General is appointed by the Monarch on the advice of the Prime Minister.' },
];
const NONE = { i: 4, state: 'Who?', say: 'Tap a country to name the two jobs.', tone: 3 };
const CHIPS = LANDS.map((l) => ({ id: l.id, label: l.label, targets: [l.id], tone: l.tone }));

export class TwoHatsScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Two people stand for two top jobs, the Head of State and the Head of Government. Chips change the country between the United Kingdom, India and Canada, and the names of the offices change with it.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Country', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this._at = this.age; } }
  enter(st) { this._at = 0; this.tl.set({ lit: st === 0 ? 'uk' : 'india' }); }
  busy() { return this.age - (this._at ?? 0) < 0.8; }

  draw(ctx, c) {
    const L = LANDS.find((l) => l.id === this.tl.chip()?.id) ?? NONE, a = this.age - (this._at ?? 0);
    day(ctx, c, { ground: 256, sun: false });
    drawCivic(ctx, c, 'office', 340, 256, { w: 260, dim: () => true });
    who(ctx, this, { role: 'elder', x: 170, y: 306, height: 240, i: L.i, facing: 1 });
    if (L.crown) crown(ctx, c, 170, 66, 1);
    who(ctx, this, { role: 'adult', x: 510, y: 306, height: 240, i: 5, facing: -1, pose: 'point' });
    tag(ctx, c, 'Head of State', 170, 322, { bg: c.gold, size: 28 });
    tag(ctx, c, 'Head of Government', 490, 322, { bg: c.s3, size: 28 });
    tag(ctx, c, L.state, 170, 28, { size: 30, k: pop(a, 0.05) });
    tag(ctx, c, 'Prime Minister', 510, 28, { size: 30 });
    card(ctx, c, 14, 346, 652, 98, { text: L.say, size: 28, rim: c[`s${L.tone}`] });
    drawVignette(ctx, c, 0.12);
  }
}
