// NileValleyMapScene - blk-l10-s04, 4 beats. Land, sea and the Nile from the rivers layer, the black soil of the valley drawn on
// it. Beat 0: Kemet, the black land, with desert on both sides. Beat 1: the soil. Beat 2: the Delta and the narrow valley.
// Beat 3: closer in, the centres on the book's Fig. 4.30. No flow arrows and no word for up or down: slide s05 asks why.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, inkOn, mix } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawRivers, makeView } from 'simulations/base/kit/GeoMap.js';
import { loadEraMap, eraView, drawEraBase, eraPin, eraLabel, eraRegion, eraOnLand, ERA_RIVERS, ERA_FULL } from '../shared/EraMap.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[25.5, 23.8], [37.5, 32.2]];
const NEAR = [[28.9, 27.35], [33.9, 31.05]];
const VALLEY = [[32.9, 24.1], [32.75, 25], [32.6, 25.7], [32.7, 26.1], [32.2, 26.2], [31.7, 26.6], [31.2, 27.2], [30.85, 27.8], [30.75, 28.2], [31, 28.9], [31.2, 29.5], [31.25, 30]];
const DELTA = [[31.25, 29.95], [30.6, 30.3], [29.95, 31.05], [30.4, 31.42], [31.1, 31.55], [31.9, 31.5], [32.4, 31.2], [31.95, 30.6]];
const SITES = [['Giza', [31.13, 29.98], -150, -46], ['Saqqara', [31.22, 29.87], -170, 30], ['Memphis', [31.25, 29.82], 140, 66], ['Heliopolis', [31.31, 30.13], 150, -56], ['Turah', [31.3, 29.93], 150, 2], ['Hermopolis', [30.8, 27.78], 160, -26]];

export class NileValleyMapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A map of Egypt. The Nile runs through desert in a thin band of black soil, widening into the Delta at the Mediterranean Sea. Centres such as Giza, Memphis and Saqqara lie close to the river.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.viewNear = await makeView(this._ctx, { kind: 'mercator', extent: NEAR, box: ERA_FULL, pad: 0 });
    this.animateFor(500);
  }

  busy() { return this.age < 0.9; }

  _soil(ctx, c, v, w, a) {
    const dark = mix(c.strata6 ?? darken(c.elevHigh, 0.7), darken(c.elevHigh, 0.7), 0.5);
    ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); VALLEY.forEach((ll, i) => { const p = v.at(ll); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
    ctx.strokeStyle = dark; ctx.lineWidth = w; ctx.stroke();
    ctx.beginPath(); DELTA.forEach((ll, i) => { const p = v.at(ll); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = dark; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, near = s === 3, scene = near ? { view: this.viewNear, map: this.map } : this;
    if (near && !this.viewNear) return;
    if (!drawEraBase(ctx, c, scene, { rivers: ERA_RIVERS.nile, india: false })) return;
    const v = scene.view, k = clamp(this.age / 0.6, 0, 1);
    // Egypt is desert: sand over the relief, so the black valley reads against it.
    eraOnLand(ctx, scene, () => { ctx.fillStyle = mix(c.gold, c.bgSurface, 0.45); ctx.fillRect(0, 0, 680, 520); });
    this._soil(ctx, c, v, near ? 38 : s === 1 ? 24 : 16, s === 0 ? k : 1);
    if (s === 2) eraRegion(ctx, c, v, DELTA, c.s2, k, { fill: 0.5 });
    drawRivers(ctx, v, c, this.map.rivers, { names: ERA_RIVERS.nile, color: c.seaShallow, width: near ? 8 : 5 });
    const big = (t, x, y, o = {}) => eraLabel(ctx, c, t, x, y, { size: 30, ...o });
    if (s === 0) {
      big('Kemet', 170, 250, { size: 42, bg: darken(c.elevHigh, 0.62), ink: inkOn(c, darken(c.elevHigh, 0.62)) });
      big('the black land', 170, 304, { size: 28, display: false });
      big('Nile', 330, 430, { size: 28 });
    } else if (s === 1) {
      big('Black soil', 150, 200, { size: 34 });
      big('Desert', 120, 400); big('Desert', 412, 196);
    } else if (s === 2) {
      big('Mediterranean Sea', 280, 40);
      big('Delta', 150, 130, { size: 34, bg: c.s2, ink: inkOn(c, c.s2) });
      big('Narrow valley', 136, 340, { size: 30 });
    } else {
      this._sites(ctx, c, v, k);
    }
  }

  _sites(ctx, c, v, k) {
    SITES.forEach(([name, ll, dx, dy], i) => {
      const p = v.at(ll), g = clamp(k * 2 - i * 0.2, 0, 1);
      if (g <= 0) return;
      ctx.save(); ctx.globalAlpha *= g;
      ctx.strokeStyle = alpha(c.label, 0.7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + dx * 0.8, p[1] + dy * 0.8); ctx.stroke();
      eraPin(ctx, c, p[0], p[1], 'circle', { r: 6, col: c.s5 });
      eraLabel(ctx, c, name, p[0] + dx, p[1] + dy, { size: 28 });
      ctx.restore();
    });
  }
}
