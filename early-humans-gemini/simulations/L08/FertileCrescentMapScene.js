// FertileCrescentMapScene - blk-l08-s01, 6 beats. Land and the two rivers first, then the Fertile Crescent, the southern
// plain, what that plain lacks, the cities of Sumer, and on the last beat today's country names written on the land.
// No country outlines are drawn (Fig. 4.21 style). India is off this map. Rivers come from the rivers layer.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, pill, inkOn } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawRivers, makeView } from 'simulations/base/kit/GeoMap.js';
import { loadEraMap, eraView, drawEraBase, eraPin, eraLabel, eraRegion, ERA_RIVERS, ERA_FULL } from '../shared/EraMap.js';

const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[31, 27], [54, 39.5]];
const PLAIN_EXTENT = [[40.5, 29.2], [50.5, 35.2]];   // beats 2-4: down on the plain itself
const CRESCENT = [[34.6, 31.2], [35.6, 34.8], [36.8, 36.9], [40, 37.9], [43.6, 37.7], [45.8, 35.7], [47.6, 33.2], [48.6, 30.6], [47.2, 30.1], [45.2, 32], [43, 33.6], [40.8, 34.3], [38.6, 34.2], [36.8, 33], [35.4, 31]];
const PLAIN = [[43.4, 34.1], [45.2, 33.9], [47.4, 31.8], [48.2, 30.3], [46.6, 30.2], [44.4, 31.4], [43.2, 32.9]];
const CITIES = [['Nippur', [45.2, 32.1], -12, -36], ['Uruk', [45.6, 31.3], -62, -6], ['Lagash', [46.4, 31.4], 72, -8], ['Ur', [46.1, 31.0], 42, 10], ['Eridu', [46.0, 30.8], -44, 26]];
const LANDS = [['Turkey', [36.5, 38.8]], ['Syria', [38.8, 35.4]], ['Iraq', [43.2, 33.3]], ['Iran', [51, 33.5]], ['Kuwait', [48, 29.2]], ['Lebanon', [32.4, 34.3]], ['Israel, Palestine', [32.2, 32.7]], ['Jordan', [37.6, 31]]];

export class FertileCrescentMapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A map of West Asia with the Tigris and Euphrates rivers. The Fertile Crescent curves from the Mediterranean to the Persian Gulf. The southern plain between the rivers holds the cities of Sumer.';


  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.viewPlain = await makeView(this._ctx, { kind: 'mercator', extent: PLAIN_EXTENT, box: ERA_FULL, pad: 0 });
    this.animateFor(500);
  }

  busy() { return this.age < 0.8; }

  draw(ctx, c) {
    const s = this.stage ?? 0, near = s >= 2 && s <= 4;
    const scene = near ? { view: this.viewPlain, map: this.map } : this;
    if (near && !this.viewPlain) return;
    if (!drawEraBase(ctx, c, scene, { rivers: ERA_RIVERS.mesopotamia, india: false })) return;
    const v = scene.view, k = clamp((this.age) / 0.6, 0, 1);
    if (s === 1 || s === 5) eraRegion(ctx, c, v, CRESCENT, c.s6, s === 1 ? k : 1, { fill: s === 5 ? 0.22 : 0.4 });
    if (near) eraRegion(ctx, c, v, PLAIN, c.gold, s === 2 ? k : 1, { fill: 0.42 });
    drawRivers(ctx, v, c, this.map.rivers, { names: ERA_RIVERS.mesopotamia, color: c.seaShallow, width: near ? 8 : s === 0 ? 8 : 5 });
    const at = (ll) => v.at(ll);
    if (s === 0) {
      let p = at([38.6, 36.2]); eraLabel(ctx, c, 'Euphrates', p[0], p[1] - 44, { size: 28 });
      p = at([43.4, 36.0]); eraLabel(ctx, c, 'Tigris', p[0] + 66, p[1] - 8, { size: 28 });
      p = at([44, 32.9]); eraLabel(ctx, c, 'Mesopotamia', p[0], p[1] + 54, { size: 30, bg: c.gold, ink: inkOn(c, c.gold) });
      eraLabel(ctx, c, 'land in between', p[0], p[1] + 96, { size: 26, display: false });
      p = at([50.4, 27.6]); eraLabel(ctx, c, 'Persian Gulf', Math.min(p[0], 560), p[1], { size: 26 });
      eraLabel(ctx, c, 'Mediterranean', 104, 170, { size: 26 });
    } else if (s === 1) {
      eraLabel(ctx, c, 'Fertile Crescent', 340, 44, { size: 30, bg: c.bad, ink: inkOn(c, c.bad) });
      let p = at([35.5, 37.8]); eraLabel(ctx, c, 'Taurus', p[0], p[1] - 30, { size: 26 });
      p = at([47.8, 35.2]); eraLabel(ctx, c, 'Zagros', p[0] + 44, p[1], { size: 26 });
      eraLabel(ctx, c, 'Mediterranean', 104, 170, { size: 26 });
      p = at([50.4, 27.6]); eraLabel(ctx, c, 'Persian Gulf', Math.min(p[0], 560), p[1], { size: 26 });
    } else if (s === 2) {
      eraLabel(ctx, c, 'Little rain', 150, 400, { size: 32 });
      eraLabel(ctx, c, 'Floods at unreliable times', 300, 462, { size: 28 });
      let p = at([42.3, 33.5]); eraLabel(ctx, c, 'Euphrates', p[0] - 10, p[1] + 34, { size: 26 });
      p = at([45.6, 34.4]); eraLabel(ctx, c, 'Tigris', p[0] + 50, p[1] - 8, { size: 26 });
    } else if (s === 3) {
      this._lack(ctx, c);
    } else if (s === 4) {
      eraLabel(ctx, c, 'Sumer', 200, 420, { size: 36, bg: c.gold, ink: inkOn(c, c.gold) });
      this._cities(ctx, c, v, k);
    } else {
      for (const [name, ll] of LANDS) { const p = v.at(ll); const hw = name.length * 7 + 16; eraLabel(ctx, c, name, Math.max(hw, Math.min(680 - hw, p[0])), p[1], { size: 26 }); }
    }
  }

  _lack(ctx, c) {
    const bad = alpha(c.bgSurface, 0.96), row = (y, text, ok) => {
      pill(ctx, c, text, 190, y, { size: 28, bg: ok ? c.good : bad, ink: ok ? undefined : c.label, display: true });
      if (!ok) { ctx.strokeStyle = c.bad; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(190 - text.length * 8.4, y); ctx.lineTo(190 + text.length * 8.4, y); ctx.stroke(); }
    };
    row(300, 'stone', false); row(350, 'timber', false); row(400, 'metal ore', false); row(466, 'mud and clay', true);
  }

  _cities(ctx, c, v, k) {
    CITIES.forEach(([name, ll, dx, dy], i) => {
      const p = v.at(ll), g = clamp(k * 2 - i * 0.2, 0, 1);
      if (g <= 0) return;
      eraPin(ctx, c, p[0], p[1], 'square', { r: 9 + 5 * g, col: c.s1 });
      ctx.save(); ctx.globalAlpha *= g;
      eraLabel(ctx, c, name, p[0] + dx, p[1] + dy, { size: 26 });
      ctx.restore();
    });
  }
}
