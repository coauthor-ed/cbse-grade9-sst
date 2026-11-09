// SabhaSamitiScene - L02 s03. b0 three gatherings, by name only: the book gives no sizes here.
// b1 the king in the middle, assemblies, ministers and officers round him. b2 a gana or samgha:
// a gathering of people deciding together.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix } from 'simulations/base/kit/SimLook.js';
import { panel, person, crown, MAN, tree } from '../shared/SstArt.js';
import { dayStage } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const SABHA = 'Sabh\u0101';
const GANA = 'ga\u1E47as or sa\u1E41ghas';

export class SabhaSamitiScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'First, three gatherings of people, named Sabha, Samiti and Vidhata. Then a crowned king stands with assemblies, ministers and officers around him. Then a gathering of people deciding together, called ganas or samghas, early republican states.';

  busy() { return this.age < 0.7; }

  _group(ctx, c, x, y, h, seed) {
    [[-66, -6], [0, -12], [66, -6], [-34, 22], [34, 22]].forEach(([dx, dy], i) => person(ctx, this, { role: (seed + i) % 3 ? 'adult' : 'elder', x: x + dx, y: y + dy, height: h + dy * 0.6, i: seed + i, facing: dx < 0 ? 1 : dx > 0 ? -1 : 0 }));
  }

  draw(ctx, c) {
    dayStage(ctx, c, { horizon: 220, ground: 'earth' });
    if (this.stage === 0) {
      [[SABHA, 's1', 12], ['Samiti', 's2', 234], ['Vidhata', 's3', 456]].forEach(([name, s, x], i) => {
        panel(ctx, c, x, 10, 212, 434, { fill: mix(c[s], c.bgSurface, 0.8) });
        pill(ctx, c, name, x + 106, 48, { size: 32, bg: c.bgSurface, ink: c.label, display: false });
        [[0, 'elder', 190, -14], [-58, 'adult', 190, 6], [58, 'adult', 190, 6], [-30, 'farmer', 206, 94], [34, 'adult', 206, 94]].forEach(([dx, role, h, dy], j) => person(ctx, this, { role, x: x + 106 + dx, y: 330 + dy, height: h - 40, i: i * 3 + j + 1, facing: dx < 0 ? 1 : dx > 0 ? -1 : 0 }));
      });
    } else if (this.stage === 1) {
      const k = person(ctx, this, { role: 'adult', x: 340, y: 336, height: 232, i: 3, facing: 0, look: MAN });
      const hd = k.anchors.head; crown(ctx, c, hd.x, hd.y - hd.r * 1.12, 1.25);
      this._group(ctx, c, 120, 310, 150, 1);
      this._group(ctx, c, 560, 310, 150, 4);
      person(ctx, this, { role: 'elder', x: 232, y: 436, height: 176, i: 8, facing: 1, pose: 'point' });
      person(ctx, this, { role: 'adult', x: 448, y: 436, height: 176, i: 9, facing: -1, pose: 'point' });
      pill(ctx, c, 'assemblies', 120, 118 - 16, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'officers', 560, 118 - 16, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'ministers', 232, 36, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'consultation', 340, 420, { size: 30, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    } else {
      tree(ctx, c, 340, 250, 2.7, 4);
      [[150, 276, 1], [250, 262, 1], [430, 262, -1], [530, 276, -1], [90, 340, 1], [200, 350, 1], [480, 350, -1], [590, 340, -1], [300, 396, 1], [380, 396, -1]].forEach(([x, y, f], i) => person(ctx, this, { role: i % 3 === 1 ? 'elder' : i % 3 === 2 ? 'farmer' : 'adult', x, y: y + 34, height: 120 + (y - 262) * 0.7, i: i + 1, facing: f }));
      pill(ctx, c, GANA, 340, 34, { size: 32, bg: c.bgSurface, ink: c.label, display: false });
      pill(ctx, c, 'early republican states', 340, 82, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    }
  }
}
