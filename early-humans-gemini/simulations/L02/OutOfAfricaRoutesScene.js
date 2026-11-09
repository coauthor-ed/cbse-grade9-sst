// OutOfAfricaRoutesScene - L02 s05. Land, relief, rivers. Possible routes after the book's Fig. 4.4, drawn on by beat.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { alpha, mix, clamp01, outBack, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { loadEraMap, eraView, drawEraBase, eraPin, eraLabel, eraRoute, eraRegion, eraCredit, eraOnLand, ERA_RIVERS } from '../shared/EraMap.js';
import { drawTool } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_FIRST = 0, S_SPREAD = 1, S_TOOLS = 2, S_WET = 3, S_TWO = 4, S_PLACES = 5;
const EXT = [[-14, -38], [150, 60]];
const OLDUVAI = [35.4, -3], LEVANT = [35.5, 32];
const ROUTES = [
  [OLDUVAI, [32.5, 8], [31.5, 22], LEVANT],
  [LEVANT, [29, 40], [15, 45], [3, 48.5]],
  [LEVANT, [47, 30], [62, 27], [78, 23], [99, 23], [112, 33]],
  [[39, 43], [60, 48], [84, 51], [102, 47], [114, 40]],
];
const SAPIENS = [[35, 6], [43.5, 12.5], [55, 17], [68, 23], [80, 15], [98, 8], [114, -6], [130, -16]];
const TOOLS = [[10, 44], [50, 30], [78, 23], [111, 29], [28, 40]];
const SAHARA = [[-13, 22], [-9, 30], [2, 33], [12, 32], [22, 30], [33, 29], [36, 22], [33, 16], [20, 15], [6, 15], [-8, 16]];
const ARABIA = [[37, 29], [46, 31], [53, 25], [58, 21], [52, 16], [44, 14], [40, 21]];
const PLACES = [
  { name: 'Olduvai Gorge', at: OLDUVAI, dx: 0, dy: 34 },
  { name: 'Levant', at: LEVANT, dx: -82, dy: -6 },
  { name: 'Hathnora', at: [77.7, 22.9], dx: 18, dy: 34 },
  { name: 'Denisova Cave', at: [84.7, 51.4], dx: 0, dy: -32 },
  { name: 'north China', at: [114.4, 40.2], dx: 0, dy: -32 },
  { name: 'Australia', at: [133, -24], dx: 0, dy: 0, plain: true },
];

export class OutOfAfricaRoutesScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4), m(5)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'A relief map from Africa to Australia. Solid arrows show possible routes of Homo erectus from East Africa into Europe and Asia about 2 million years ago. Handaxes mark where tools were found. The Sahara and Arabia shade as wetter. Dashed arrows show Homo sapiens leaving about 125,000 years ago.';

  async setup() { this.map = await loadEraMap(); await super.setup(); await eraView(this, EXT); this.animateFor?.(400); }
  busy() { return this.age < 2.4; }

  draw(ctx, c) {
    const st = this.stage;
    drawBackdrop(ctx, c, 'dots');
    if (!drawEraBase(ctx, c, this, { rivers: [...ERA_RIVERS.nile, ...ERA_RIVERS.india.slice(0, 6)] })) return;
    const v = this.view;
    // Sand today; on the wet beat it greens over, and stays faintly green for the second wave.
    const wet = st === S_WET ? clamp01(this.age / 0.8) : st > S_WET ? 0.5 : 0;
    const land = mix(c.strata1, c.elevLow, wet);
    eraOnLand(ctx, this, () => { for (const ring of [SAHARA, ARABIA]) eraRegion(ctx, c, v, ring, land, 1, { fill: 0.72, rim: alpha(land, 0), width: 1 }); });
    const erectus = c.s1, sapiens = c.s4;
    if (st >= S_SPREAD) ROUTES.forEach((r, i) => {
      const k = st === S_SPREAD ? clamp01((this.age - i * 0.35) / 0.8) : 1;
      eraRoute(ctx, c, v, r, k, { col: erectus, width: st === S_TWO ? 4 : 6 });
    });
    if (st === S_TOOLS || st === S_WET) TOOLS.forEach(([lon, lat], i) => {
      const k = st === S_TOOLS ? outBack(clamp01((this.age - i * 0.16) / 0.4)) : 1, q = v.at([lon, lat]);
      if (k > 0) drawTool(ctx, c, 'handaxe', q[0], q[1], 24 * k, { rot: 0.3 });
    });
    if (st >= S_TWO) eraRoute(ctx, c, v, SAPIENS, st === S_TWO ? clamp01(this.age / 1.6) : 1, { col: sapiens, width: 7, dash: [14, 10] });
    const [ox, oy] = v.at(OLDUVAI);
    eraPin(ctx, c, ox, oy, 'circle', { col: erectus, r: 14, lit: true });
    if (st === S_FIRST) {
      eraLabel(ctx, c, 'Homo erectus', 330, 300, { size: 30, bg: erectus });
      eraLabel(ctx, c, 'about 2 million years ago', 400, 352, { size: 26 });
    }
    if (st === S_SPREAD) eraLabel(ctx, c, 'possible routes', 450, 330, { size: 28 });
    if (st === S_TOOLS) eraLabel(ctx, c, 'handaxes and cleavers found', 360, 340, { size: 26 });
    if (st === S_WET) eraLabel(ctx, c, 'wetter than today', 190, 330, { size: 26, bg: c.elevLow });
    if (st === S_TWO) {
      eraLabel(ctx, c, 'Homo sapiens', 300, 404, { size: 30, bg: sapiens });
      eraLabel(ctx, c, 'about 125,000 years ago', 330, 452, { size: 26 });
    }
    if (st === S_PLACES) PLACES.forEach((p, i) => {
      const k = outBack(clamp01((this.age - i * 0.14) / 0.4)), q = v.at(p.at);
      if (k <= 0) return;
      if (!p.plain) eraPin(ctx, c, q[0], q[1], 'diamond', { col: c.gold, r: 11 });
      eraLabel(ctx, c, p.name, q[0] + p.dx, q[1] + p.dy, { size: 25 });
    });
    eraCredit(ctx, c, v, { twoX: 262 });
  }
}
