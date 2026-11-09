// EpicentreScene - the real record: every earthquake of magnitude 6 or more, 2000 to 2024, on a map with the
// Pacific in the middle. Setup: land and sea only, so the predict shows no answer. Each beat lights one belt.
// Belt selection is by region, used only to light dots that are already plotted from data.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, drawBackdrop, drawCard, font } from 'simulations/base/kit/SimLook.js';
import { layerCache } from 'simulations/base/kit/GeoMap.js';
import { EARTH_COLOR_MAP, earthColour } from '../shared/EarthArt.js';
import { worldMap, paintWorld, dots, mapCredit } from '../shared/EarthMap.js';

const SETUP = [[{ idx: 9 }]];
const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }], [{ idx: 3 }]];
const PACIFIC = (lon, lat) => (lon > 100 || lon < -60) && !(lat > 8 && lat < 56 && lon > 60 && lon < 118) && lat > -62;
const SECOND = (lon, lat) => lon > -12 && lon < 122 && lat > 8 && lat < 50;
const ATLANTIC = (lon, lat) => lon > -50 && lon < -8 && lat > -60 && lat < 72;
const SAY = {
  0: ['All the strong earthquakes', 'Long, narrow belts'],
  1: ['The largest belt', 'The Ring of Fire'],
  2: ['A second belt', 'Mediterranean to the Himalaya'],
  3: ['A line in the ocean', 'The Mid-Atlantic Ridge'],
};

export class EpicentreScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: SETUP, [Number.MAX_SAFE_INTEGER]: SETUP, 1: SETUP, 4: MAP };
  static COLOR_MAP = EARTH_COLOR_MAP;
  static ARIA_LABEL = 'A world map with the Pacific Ocean in the middle. Strong earthquakes from 2000 to 2024 appear as dots along long, narrow belts.';

  async setup() {
    this._s = 9;
    this.cache = layerCache();
    await super.setup();
    this.m = await worldMap(this._ctx, ['quakes']);
    this.q = this.m.map.quakes.features.map((f) => f.geometry.coordinates);
    this.animateFor(500);
  }
  enter(stage) { this._s = stage; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    if (!this.m) return;
    const s = this._s, v = this.m.view, ink = earthColour(c, 'ink');
    this.cache(ctx, [c, s], (o) => {
      v.setRotate(s === 3 ? [-10, 0] : [-150, 0]);   // the Atlantic beat centres the Atlantic; the Pacific view splits it at the edge
      paintWorld(o, c, this.m);
      if (s === 9) return;
      const pick = { 1: PACIFIC, 2: SECOND, 3: ATLANTIC }[s];
      if (!pick) { dots(o, v, this.q, 2.6, c.bad, 0.9); return; }
      const on = [], off = [];
      for (const p of this.q) (pick(p[0], p[1]) ? on : off).push(p);
      dots(o, v, off, 2, c.bad, 0.2);
      dots(o, v, on, 3, c.bad, 1);
    });
    drawCard(ctx, c, 8, 356, 664, 118);
    if (s === 9) {
      pill(ctx, c, 'Land and sea only', 340, 414, { bg: ink, ink: earthColour(c, 'snow'), size: 30, display: true });
    } else {
      const [a, b] = SAY[s];
      ctx.save(); ctx.fillStyle = c.label; ctx.font = font(c, 700, 25); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(a, 340, 384); ctx.restore();
      pill(ctx, c, b, 340, 436, { bg: ink, ink: earthColour(c, 'snow'), size: 30, display: true });
    }
    mapCredit(ctx, c);
  }
}
