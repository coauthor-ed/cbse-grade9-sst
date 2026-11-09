// SilkRouteScene - blk-l13-s05, 4 beats. Beat 0: the cocoon and its thread, big. Beat 1: land, and silk moves west from
// China under the Han. Beat 2: the whole route, named. Beat 3: the southern branch into northern India. It rests when the
// line is drawn. Route points are hand coordinates for the main line. India's outline comes only from the Survey of India layer.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, ellipse, inkOn, lighten, mix, pill, outBack, inOutSine } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadEraMap, eraView, drawEraBase, eraCredit, eraPin, eraLabel, eraRoute, ERA_FULL } from '../shared/EraMap.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[28, 8], [122, 50]];
const EAST = [[108.9, 34.3], [103.8, 36], [94.7, 40.1], [86, 41.6], [76, 39.5]];
const MAIN = [...EAST, [67, 39.7], [61.8, 37.6], [52, 35.7], [44.6, 33.1], [36.2, 36.2]];
const SOUTH = [[76, 39.5], [74.2, 35.6], [72.8, 33.7], [77.7, 27.6], [85.3, 25.2]];

export class SilkRouteScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A cocoon with a long thread of silk. Then a map: the Silk Route runs from China west across Central Asia towards West Asia, and a branch reaches northern India.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.animateFor(500);
  }

  busy() { return this.age < 2; }

  _cocoon(ctx, c, t) {
    ctx.fillStyle = mix(c.bgSurface, c.elevLow, 0.16); ctx.fillRect(0, 0, W, H);
    const k = inOutSine(clamp(t / 1.2, 0, 1)), silk = mix(c.elevPeak, c.gold, 0.26);
    // A mulberry leaf under the cocoon.
    ctx.fillStyle = c.elevLow; ctx.beginPath(); ctx.moveTo(90, 330); ctx.bezierCurveTo(160, 170, 420, 170, 500, 330); ctx.bezierCurveTo(420, 490, 160, 490, 90, 330); ctx.fill();
    ctx.strokeStyle = darken(c.elevLow, 0.3); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(90, 330); ctx.lineTo(500, 330); ctx.stroke();
    for (const [x, d] of [[180, 1], [180, -1], [290, 1], [290, -1], [390, 1], [390, -1]]) { ctx.beginPath(); ctx.moveTo(x, 330); ctx.lineTo(x + 60, 330 + d * 80); ctx.stroke(); }
    // The cocoon.
    ctx.fillStyle = darken(silk, 0.34); ellipse(ctx, 286, 322, 140, 92, -0.08); ctx.fill();
    ctx.fillStyle = silk; ellipse(ctx, 286, 312, 140, 92, -0.08); ctx.fill();
    ctx.strokeStyle = darken(silk, 0.2); ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(286, 312, 132 - i * 13, 84 - i * 8, -0.08 + i * 0.13, 0.2, 2.6); ctx.stroke(); }
    ctx.fillStyle = lighten(silk, 0.5); ellipse(ctx, 226, 272, 46, 15, -0.3); ctx.fill();
    // The one long thread, drawn off to a reel.
    const rx = 572, ry = 170;
    ctx.strokeStyle = c.gold; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(404, 262);
    const ex = 404 + (rx - 404) * k, ey = 262 + (ry - 262) * k;
    ctx.quadraticCurveTo((404 + ex) / 2, 220, ex, ey); ctx.stroke();
    ctx.fillStyle = darken(c.strata3, 0.1); ctx.beginPath(); ctx.arc(rx, ry, 62, 0, 7); ctx.fill();
    ctx.fillStyle = c.gold; ctx.beginPath(); ctx.arc(rx, ry, 30 + 18 * k, 0, 7); ctx.fill();
    ctx.fillStyle = darken(c.strata3, 0.3); ctx.beginPath(); ctx.arc(rx, ry, 11, 0, 7); ctx.fill();
    pill(ctx, c, 'One long thread', 340, 44, { size: 34, display: true, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, 'Known from 4000-3000 BCE', 340, 486, { size: 28, display: true, bg: c.bgSurface, ink: c.label });
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    if (s === 0) { this._cocoon(ctx, c, t); return; }
    if (!drawEraBase(ctx, c, this, { rivers: [] })) return;
    const v = this.view, k = inOutSine(clamp(t / 1.3, 0, 1)), col = c.s6;
    const off = s === 3;
    eraRoute(ctx, c, v, s === 1 ? EAST : MAIN, s === 3 ? 1 : k, { col: off ? alpha(col, 0.5) : col, width: 8 });
    if (s === 3) eraRoute(ctx, c, v, SOUTH, k, { col: c.s5, width: 8 });
    const at = (ll) => v.at(ll);
    let p = at(EAST[0]);
    eraPin(ctx, c, p[0], p[1], 'square', { r: 13, col: c.gold, lit: true });
    eraLabel(ctx, c, 'China', p[0] - 14, p[1] + 44, { size: 28, bg: c.gold, ink: inkOn(c, c.gold) });
    if (s === 1) {
      pill(ctx, c, 'Around the 2nd century BCE', 340, 44, { size: 30, display: true, bg: c.bgSurface, ink: c.label });
      eraLabel(ctx, c, 'Han dynasty: silk goes west', 340, 400, { size: 26 });
    }
    if (s === 2) {
      pill(ctx, c, 'The Silk Route', 340, 44, { size: 36, display: true, bg: col, scale: outBack(clamp(t / 0.5, 0, 1)) });
      p = at([40, 31]); eraLabel(ctx, c, 'West Asia', p[0], p[1] + 34, { size: 26 });
      p = at([66, 44]); eraLabel(ctx, c, 'Central Asia', p[0], p[1] - 8, { size: 26 });
      p = at([86, 45]); eraLabel(ctx, c, 'deserts and mountains', p[0] + 44, 440, { size: 22, display: false });
    }
    if (s === 3) {
      pill(ctx, c, 'Branches reach India', 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      p = at([78, 18.5]); eraLabel(ctx, c, 'Northern India', p[0], p[1], { size: 26, bg: c.s5, ink: inkOn(c, c.s5) });
    }
    eraCredit(ctx, c, v, { twoX: 262 });
  }
}
