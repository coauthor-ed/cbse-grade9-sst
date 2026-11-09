// AgricultureOriginsMapScene - blk-l05-s02, shown after Submit. Land and rivers, six regions lit, one crop each.
// No dates and no arrows: the map names the regions and leaves the question open, so it answers nothing.
// India's outline comes only from the Survey of India layer, with its credit.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { loadEraMap, eraView, drawEraBase, eraCredit, eraLabel, eraRegion, ERA_RIVERS, ERA_FULL } from '../shared/EraMap.js';

const EXTENT = [[-24, -4], [132, 54]];
// name, crop, ring [lon, lat]..., icon at [lon, lat], label dx, dy from the icon.
const REGIONS = [
  { name: 'West Africa', crop: 'pearl millet', tone: 's8', at: [-2, 13], dx: 8, dy: 62, ring: [[-14, 11], [-6, 17], [8, 16], [13, 11], [4, 8], [-8, 8]] },
  { name: 'West Asia', crop: 'wheat, barley', tone: 's2', at: [41, 34], dx: -30, dy: -66, ring: [[34, 32], [38, 38], [46, 37], [49, 31], [42, 30], [36, 29]] },
  { name: 'Ganga plains', crop: 'rice', tone: 's6', at: [82, 26], dx: -30, dy: -104, ring: [[76, 28], [82, 28], [88, 26], [86, 24], [79, 25]], leader: true },
  { name: 'India', crop: 'millets', tone: 's3', at: [77, 17], dx: -104, dy: 40, ring: [[73, 20], [79, 21], [80, 15], [77, 12], [74, 15]] },
  { name: 'North China', crop: 'millets', tone: 's1', at: [112, 37], dx: 8, dy: -74, ring: [[105, 35], [108, 40], [116, 40], [119, 36], [112, 34]] },
  { name: 'South China', crop: 'rice', tone: 's5', at: [114, 29], dx: 0, dy: 80, ring: [[106, 30], [112, 32], [121, 31], [120, 28], [110, 27]] },
];

export class AgricultureOriginsMapScene extends SimScene {
  static simId = 'agriculture-origins-map-scene';
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }]];
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'A map of Africa and Asia with six regions marked, each with its crop: West Africa, pearl millet. West Asia, wheat and barley. The Ganga plains, rice. India, millets. North China, millets. South China, rice. No dates are shown.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.animateFor(500);
  }

  draw(ctx, c) {
    if (!drawEraBase(ctx, c, this, { rivers: [...ERA_RIVERS.india, ...ERA_RIVERS.china, ...ERA_RIVERS.mesopotamia, ...ERA_RIVERS.nile] })) return;
    const v = this.view;
    for (const r of REGIONS) eraRegion(ctx, c, v, r.ring, c[r.tone], 1, { fill: 0.5 });
    for (const r of REGIONS) {
      const p = v.at(r.at);
      if (!p) continue;
      drawIcon(ctx, c, 'grain', p[0], p[1], 15, { tone: c[r.tone] });
      eraLabel(ctx, c, r.name, p[0] + r.dx, p[1] + r.dy, { size: 25 });
      eraLabel(ctx, c, r.crop, p[0] + r.dx, p[1] + r.dy + 34, { size: 21, display: false });
    }
    eraCredit(ctx, c, v);
  }
}
