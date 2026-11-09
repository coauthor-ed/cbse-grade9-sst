// FourRiverPlainsScene - blk-l14-s01, 5 beats. Land from the Nile to the Huang He. Two rivers light, then the other two, then
// all four with the book's shared list. It rests. India's outline comes only from the Survey of India layer, with the credit.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, inkOn, outBack, pill } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawRivers } from 'simulations/base/kit/GeoMap.js';
import { loadEraMap, eraView, drawEraBase, eraCredit, eraLabel, eraPin, ERA_RIVERS, ERA_EXTENT, ERA_FULL } from '../shared/EraMap.js';

const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const PLACES = [
  { name: 'Harappans', ll: [70, 28], rivers: ERA_RIVERS.india.slice(0, 3), tone: 's2', at: 1, dx: 0, dy: 60 },
  { name: 'Mesopotamia', ll: [45, 32], rivers: ERA_RIVERS.mesopotamia, tone: 's6', at: 1, dx: 26, dy: 56 },
  { name: 'Egypt', ll: [31.2, 27], rivers: ERA_RIVERS.nile, tone: 's3', at: 2, dx: 0, dy: 60 },
  { name: 'China', ll: [113, 35], rivers: ERA_RIVERS.china, tone: 's5', at: 2, dx: -14, dy: 66 },
];
const LIST = ['River plains', 'Surplus', 'Cities', 'Administration', 'Writing'];

export class FourRiverPlainsScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A map from the Nile to the Huang He. Four river plains light up: the Harappans on the Sindhu and Sarasvati, Mesopotamia on the Tigris and Euphrates, Egypt on the Nile and China on the Huang He and Yangtze. All four share river plains, surplus, cities, administration and writing.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, ERA_EXTENT.fourRivers, ERA_FULL);
    this.animateFor(500);
  }

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    if (!drawEraBase(ctx, c, this, { rivers: [] })) return;
    const v = this.view;
    for (const p of PLACES) {
      const seen = s >= p.at, lit = s === p.at || s >= 3, g = s === p.at ? outBack(clamp(t / 0.45, 0, 1)) : 1;
      if (seen) drawRivers(ctx, v, c, this.map.rivers, { names: p.rivers, color: c.seaShallow, width: lit ? 7 : 4 });
      if (!seen) continue;
      const q = v.at(p.ll);
      ctx.save(); if (!lit) ctx.globalAlpha = 0.55;
      eraPin(ctx, c, q[0], q[1], 'circle', { r: 11, col: c[p.tone], lit });
      eraLabel(ctx, c, p.name, q[0] + p.dx, q[1] + p.dy - 16, { size: 28, bg: c[p.tone], ink: inkOn(c, c[p.tone]), scale: g });
      ctx.restore();
    }
    if (s === 0) pill(ctx, c, 'Four river plains, far apart', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    if (s === 3) {
      pill(ctx, c, 'The same list in all four', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      LIST.forEach((name, i) => { pill(ctx, c, name, i < 3 ? 120 + i * 220 : 230 + (i - 3) * 240, i < 3 ? 390 : 442, { size: 26, display: true, bg: c.bgSurface, ink: c.label, scale: outBack(clamp((t - i * 0.12) / 0.3, 0, 1)) }); });
    }
    if (s === 4) pill(ctx, c, 'Taught, or reached separately?', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    eraCredit(ctx, c, v, { twoY: 140 });
  }
}
