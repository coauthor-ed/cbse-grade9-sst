// NeolithicSpreadMapScene - blk-l06-s05, from beat 2. Land, rivers and five Neolithic sites from Fig 4.8, with the
// two dates the book gives. A loose shading says "most of the subcontinent by 2500 BCE": it is a statement from the
// book, not a surveyed edge, so it has a soft rim and a plain label. Beat solution adds the way of life.
// India's outline comes only from the Survey of India layer, with its credit.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadEraMap, eraView, drawEraBase, eraCredit, eraPin, eraLabel, eraRegion, ERA_RIVERS, ERA_EXTENT, ERA_FULL } from '../shared/EraMap.js';

const MAP = [0, 0, 0, 1].map((idx) => [{ idx, dwellMs: null }]);
const SITES = [
  { name: 'Mehrgarh', at: [67.6, 29.4], dx: -76, dy: -34, date: '7000 BCE' },
  { name: 'Burzahom', at: [74.9, 34.2], dx: 98, dy: -8 },
  { name: 'Lahuradewa', at: [83.0, 26.8], dx: 8, dy: -34 },
  { name: 'Daojali Hading', at: [93.0, 25.3], dx: -14, dy: 34 },
  { name: 'Sanganakallu', at: [76.9, 15.2], dx: 0, dy: 34, date: '2000 BCE' },
];
const SPREAD = [[67, 29], [72, 34], [78, 32], [86, 27.5], [94, 27], [93, 23], [87, 21], [81, 15], [78, 9.5], [75, 12], [73, 19], [69, 22], [66, 25]];
const STEP_S = 0.5;

export class NeolithicSpreadMapScene extends SimScene {
  static simId = 'neolithic-spread-map-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'A map of the Indian subcontinent with five Neolithic sites: Mehrgarh, about 7000 BCE, Burzahom, Lahuradewa, Daojali Hading and Sanganakallu, about 2000 BCE. Shading shows that by 2500 BCE most of the subcontinent had farming communities.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, ERA_EXTENT.india, ERA_FULL);
    this.animateFor(500);
  }

  enter(s) { this.animateFor(s === 0 ? (SITES.length + 1) * STEP_S * 1000 + 600 : 800); }

  busy() { return this.age < (this.stage === 0 ? (SITES.length + 1) * STEP_S : 0.6); }

  draw(ctx, c) {
    if (!drawEraBase(ctx, c, this, { rivers: ERA_RIVERS.india })) return;
    const v = this.view, s = this.stage ?? 0, t = this.age;
    const shadeK = s === 0 ? clamp((t - SITES.length * STEP_S) / 0.5, 0, 1) : 1;
    eraRegion(ctx, c, v, SPREAD, c.s2, shadeK, { fill: 0.34, rim: alpha(c.s2, 0.6), width: 3 });
    if (shadeK > 0.6) {
      eraLabel(ctx, c, 'most of the subcontinent', 158, 300, { size: 25, bg: c.s2 });
      eraLabel(ctx, c, 'by 2500 BCE', 158, 338, { size: 25, bg: c.s2 });
    }
    SITES.forEach((p, i) => {
      const k = s === 0 ? clamp((t - i * STEP_S) / 0.3, 0, 1) : 1;
      if (k <= 0) return;
      const pt = v.at(p.at);
      if (!pt) return;
      ctx.save(); ctx.globalAlpha *= k;
      eraPin(ctx, c, pt[0], pt[1], 'circle', { r: 12 + (1 - k) * 8, col: p.date ? c.accent : c.s8, lit: !!p.date });
      eraLabel(ctx, c, p.name, pt[0] + p.dx, pt[1] + p.dy, { size: 25 });
      if (p.date) eraLabel(ctx, c, p.date, pt[0] + p.dx, pt[1] + p.dy + (p.dy < 0 ? -34 : 34), { size: 26 });
      ctx.restore();
    });
    if (s === 1) {
      const k = clamp(t / 0.4, 0, 1);
      ctx.save(); ctx.globalAlpha *= k;
      eraLabel(ctx, c, 'cattle, sheep, goats', 508, 296, { size: 25 });
      eraLabel(ctx, c, 'cereals, millets, pulses', 508, 338, { size: 25 });
      ctx.restore();
    }
    eraCredit(ctx, c, v);
  }
}
