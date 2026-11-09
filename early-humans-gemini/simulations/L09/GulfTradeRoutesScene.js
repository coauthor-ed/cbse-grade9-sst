// GulfTradeRoutesScene - blk-l09-s06, 3 beats. Land and rivers, the sea route from Ur past Dilmun and Magan to Meluhha, drawn
// once and then at rest. Beat 1: the goods. Beat 2: one side written and read, one side unread. India only from the Survey of
// India layer, with the credit. No country lines. Sites from the book's Fig. 4.26.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, inkOn } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadEraMap, eraView, drawEraBase, eraPin, eraLabel, eraRoute, eraCredit, ERA_RIVERS, ERA_FULL } from '../shared/EraMap.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[41, 12], [80, 38]];
const SEA = [[46.1, 31], [47.6, 30.2], [50.2, 27.6], [52.4, 26.4], [55.6, 26.4], [57.4, 25.4], [60.4, 24.6], [64.6, 24.2], [67.2, 23.8], [69.4, 22.6], [71.6, 21.6]];
const GOODS = ['Stone beads', 'Ivory', 'Timber', 'Gold dust', 'Copper, probably'];

export class GulfTradeRoutesScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A map from Mesopotamia to the Sindhu-Sarasvati cities. A sea route runs from Ur past Dilmun and Magan to Meluhha. Then the goods traded. Then Mesopotamian writing can be read and Harappan writing cannot.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.animateFor(500);
  }

  busy() { return this.age < 1.8; }

  draw(ctx, c) {
    const s = this.stage ?? 0;
    if (!drawEraBase(ctx, c, this, { rivers: [...ERA_RIVERS.mesopotamia, ...ERA_RIVERS.india] })) return;
    const v = this.view, k = s === 0 ? clamp(this.age / 1.6, 0, 1) : 1;
    eraRoute(ctx, c, v, SEA, k, { col: c.s2 });
    const pin = (ll, kind, col, name, dx, dy, o = {}) => { const p = v.at(ll); eraPin(ctx, c, p[0], p[1], kind, { col, r: 13 }); eraLabel(ctx, c, name, p[0] + dx, p[1] + dy, { size: 28, ...o }); };
    pin([46.1, 31], 'square', c.s5, 'Ur', -6, -34);
    if (k > 0.3) pin([50.5, 26], 'circle', c.s1, 'Dilmun', -28, 42);
    if (k > 0.55) pin([57, 23], 'circle', c.s6, 'Magan', -6, 42);
    if (k > 0.95) pin([71.6, 22.4], 'tri', c.s2, 'Meluhha', -8, 44, { bg: c.gold, ink: inkOn(c, c.gold) });
    if (s === 0) {
      let p = v.at([50.5, 19.5]); eraLabel(ctx, c, 'today Bahrain, Oman', p[0], p[1] + 16, { size: 26, display: false });
    } else if (s === 1) {
      [[112, 414], [272, 414], [92, 460], [236, 460], [176, 498]].forEach((p, i) => { eraLabel(ctx, c, GOODS[i], p[0], p[1], { size: 26, bg: i === 4 ? c.bgSurface : c.s2, ink: i === 4 ? c.label : inkOn(c, c.s2) }); });
    } else {
      eraLabel(ctx, c, 'Written, and read', 170, 60, { size: 30, bg: c.good, ink: inkOn(c, c.good) });
      eraLabel(ctx, c, 'Script unread', 530, 440, { size: 30, bg: c.bad, ink: inkOn(c, c.bad) });
    }
    eraCredit(ctx, c, v);
  }
}
