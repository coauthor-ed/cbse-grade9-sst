// ChinaRiversMapScene - blk-l12-s02, 4 beats. Land and the two rivers first, then the crops: millets in the north, rice in
// the south, loess shaded. Then metal in the Huang He basin, 2000 BCE, then the first cities, 1600 BCE. Rivers come from
// the rivers layer. No country lines. India is off this map, so its layer and credit are not used here.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, inkOn, outBack } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawRivers } from 'simulations/base/kit/GeoMap.js';
import { loadEraMap, eraView, drawEraBase, eraPin, eraLabel, eraRegion, ERA_RIVERS, ERA_FULL } from '../shared/EraMap.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[100, 25], [124, 42]];
const LOESS = [[103, 35], [106, 38.8], [110.5, 39.8], [114, 38.6], [114, 35.2], [110, 34.2], [105, 34.2]];
const VILLAGES = [[106.5, 36], [109, 35.2], [110.4, 37.2], [112.4, 35.2], [114.2, 36.2], [115.6, 35], [113.4, 34.2], [116.8, 36.6]];
const CITIES = [['Anyang', [114.35, 36.1], 0, -40], ['Zhengzhou', [113.65, 34.75], -34, 38]];

export class ChinaRiversMapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A map of northern and central China with the Huang He in the north and the Yangtze in the south. Millets grow in the north and rice in the south. Bronze reaches the Huang He basin around 2000 BCE, and the first cities, Anyang and Zhengzhou, appear around 1600 BCE.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.animateFor(500);
  }

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage ?? 0;
    if (!drawEraBase(ctx, c, this, { rivers: ERA_RIVERS.china, india: false })) return;
    const v = this.view, t = this.age, k = clamp(t / 0.6, 0, 1);
    drawRivers(ctx, v, c, this.map.rivers, { names: ERA_RIVERS.china, color: c.seaShallow, width: s === 0 ? 9 : 6 });
    if (s === 1) eraRegion(ctx, c, v, LOESS, c.gold, k, { fill: 0.5 });
    if (s === 0) {
      let p; eraLabel(ctx, c, 'Huang He (Yellow River)', 340, 40, { size: 30 });
      p = v.at([110, 29]); eraLabel(ctx, c, 'Yangtze', p[0], p[1] + 44, { size: 32 });
      p = v.at([122.4, 33.6]); eraLabel(ctx, c, 'Sea', p[0], p[1], { size: 24 });
    }
    if (s === 1) {
      let p = v.at([108.8, 36.6]); eraLabel(ctx, c, 'loess: fine yellow soil', p[0], p[1], { size: 26, display: false });
      p = v.at([113, 38.4]); eraLabel(ctx, c, 'Millets', 470, p[1] - 56, { size: 34, bg: c.gold, ink: inkOn(c, c.gold), scale: outBack(k) });
      p = v.at([111, 28.2]); eraLabel(ctx, c, 'Rice', p[0], p[1], { size: 34, bg: c.s3, ink: inkOn(c, c.s3), scale: outBack(clamp(k * 1.4 - 0.4, 0, 1)) });
      eraLabel(ctx, c, 'Neolithic villages, about 7000 BCE', 340, 482, { size: 26 });
    }
    if (s >= 2) {
      VILLAGES.forEach((ll, i) => { const p = v.at(ll), g = s === 2 ? outBack(clamp(k * 2 - i * 0.14, 0, 1)) : 1; if (g > 0) eraPin(ctx, c, p[0], p[1], 'circle', { r: 9 * g, col: c.s8, off: s === 3 }); });
    }
    if (s === 2) {
      eraLabel(ctx, c, '2000 BCE', 340, 50, { size: 36, bg: c.s8, ink: inkOn(c, c.s8) });
      eraLabel(ctx, c, 'Copper and bronze reach villages', 340, 482, { size: 26 });
      const p = v.at([111, 30]); eraLabel(ctx, c, 'No cities yet', p[0], p[1], { size: 28, display: false });
    }
    if (s === 3) {
      eraLabel(ctx, c, '1600 BCE', 340, 50, { size: 36, bg: c.s1, ink: inkOn(c, c.s1) });
      CITIES.forEach(([name, ll, dx, dy], i) => {
        const p = v.at(ll), g = outBack(clamp(k * 1.6 - i * 0.3, 0, 1));
        eraPin(ctx, c, p[0], p[1], 'square', { r: 15 * g, col: c.s1, lit: true });
        ctx.save(); ctx.globalAlpha *= clamp(g, 0, 1); eraLabel(ctx, c, name, p[0] + dx, p[1] + dy, { size: 28 }); ctx.restore();
      });
      eraLabel(ctx, c, 'First cities: more food, better crafts', 340, 482, { size: 26 });
    }
  }
}
