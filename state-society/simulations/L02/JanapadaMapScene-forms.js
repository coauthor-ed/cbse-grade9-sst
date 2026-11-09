// JanapadaMapSceneForms - L02 s08. b0 two cards: rajya, gana. b1 the map with four examples:
// Magadha and Kosala (rajya), Vrijji and Malla (gana). The others stay plain: the texts here do
// not sort all sixteen, so the scene does not either.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, sstFullView, drawSstFull, sstBadge, SST_JANAPADAS } from './SstMapBase.js';
import { panel, person, crown, reading } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[76, 22], [90, 30.5]];
const CHIPS = [{ id: 'rajya', label: 'R\u0101jya', targets: ['rajya'], tone: 2 }, { id: 'gana', label: 'Ga\u1E47a', targets: ['gana'], tone: 3 }];
const FORM = { 12: 'rajya', 8: 'rajya', 11: 'gana', 10: 'gana' };
const OFF = { 12: [0, 50], 8: [-96, 0], 11: [96, 0], 10: [-10, -50] };

export class JanapadaMapSceneForms extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Two forms of state. A rajya is drawn as one crowned ruler, a gana as a group of people. On a map of the Ganga plain, Magadha and Kosala are marked as rajyas and Vrijji and Malla as ganas.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Form', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  async setup() { this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT); this.animateFor?.(400); }
  enter() { this.tl.reset(); }

  _cards(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    panel(ctx, c, 14, 16, 318, 488, { fill: mix(c.bgSurface, c.s2, 0.16) });
    panel(ctx, c, 348, 16, 318, 488, { fill: mix(c.bgSurface, c.s3, 0.16) });
    reading(ctx, c, 'r\u0101jya', 173, 64, 40); reading(ctx, c, 'ga\u1E47a or sa\u1E41gha', 507, 64, 34);
    reading(ctx, c, 'monarchical state', 173, 110, 28, c.labelMuted); reading(ctx, c, 'republican state', 507, 110, 28, c.labelMuted);
    crown(ctx, c, 173, 180, 1.5);
    person(ctx, this, { role: 'adult', x: 173, y: 480, height: 270, i: 3 });
    [[420, 300, 130], [507, 288, 130], [594, 300, 130], [456, 398, 150], [556, 398, 150], [420, 486, 170], [594, 486, 170], [507, 488, 180]].forEach(([x, y, h], i) => person(ctx, this, { role: i % 3 ? 'adult' : 'elder', x, y, height: h, i, facing: x < 507 ? 1 : x > 507 ? -1 : 0 }));
  }

  draw(ctx, c) {
    if (this.stage === 0) { this._cards(ctx, c); return; }
    if (!drawSstFull(ctx, c, this)) return;
    const lit = this.tl.lit()[0];
    for (const J of SST_JANAPADAS) {
      const q = this.view.at(J.at); if (!q || q[0] < 30 || q[0] > 650 || q[1] < 30 || q[1] > 490) continue;
      const f = FORM[J.n];
      if (!f) { sstBadge(ctx, c, q[0], q[1], J.n, { r: 13, off: true, col: c.stroke }); continue; }
      const off = lit && lit !== f, col = f === 'rajya' ? c.s2 : c.s3;
      sstBadge(ctx, c, q[0], q[1], J.n, { r: 22, off, col, lit: lit === f });
      const [dx, dy] = OFF[J.n];
      pill(ctx, c, J.name, q[0] + dx, q[1] + dy, { size: 28, bg: col, display: true, alpha: off ? 0.35 : 1 });
      if (f === 'rajya') crown(ctx, c, q[0], q[1] - 44, 0.9);
    }
  }
}
