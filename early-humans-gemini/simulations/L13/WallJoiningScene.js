// WallJoiningScene - blk-l13-s03, shows from beat 1 of 5 (beat 0 is a drawing). Northern China, land only. Separate walls
// from 680 BCE, then joined, then pushed west, then the late stone line. A true-scale rail along the foot runs from 680 BCE
// to the 1600s CE. Wall lines are hand coordinates, drawn to show the idea, not surveyed. No India on this map.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp, darken, inkOn, mix, pill, rr } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadEraMap, eraView, drawEraBase, eraLabel, ERA_RIVERS, ERA_FULL } from '../shared/EraMap.js';
import { traceLine } from '../L12/ChinaDraw.js';

const MAP = [0, 0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[91, 29], [127, 46]];
const EARLY = [
  [[104.6, 35.5], [106.3, 37], [108.5, 38.6], [110.2, 39.4]],
  [[108, 40.9], [110.4, 41.1], [113, 41]],
  [[114.8, 40.7], [116.6, 41], [118.8, 41.6], [121, 41.9]],
  [[115.9, 36.4], [117.2, 36.2], [118.7, 36.1], [120.1, 36]],
];
const JOINED = [[104.6, 35.5], [106.3, 37.2], [107.2, 39.6], [109.2, 40.9], [113, 41], [116.4, 41.1], [119, 41.7], [122, 42]];
const WEST = [[104.6, 35.5], [103, 37.5], [100.6, 39], [98.2, 39.8], [95.6, 40.2], [93.8, 40.3]];
const LATE = [[98.2, 39.8], [100.6, 38.9], [103, 37.6], [106, 37.7], [107.4, 38.9], [110.4, 39.4], [113.3, 40.4], [116, 40.5], [118.2, 40.4], [119.8, 40]];
const READ = ['Separate walls, from 680 BCE', 'Joined into one line', 'Pushed west', 'Repaired until the 1600s CE'];
const RAIL = { x: 44, w: 592, y: 462, from: -680, to: 1650 };
const yr = (y) => RAIL.x + (y - RAIL.from) / (RAIL.to - RAIL.from) * RAIL.w;

export class WallJoiningScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A map of northern China. Four separate walls from 680 BCE are joined into one line, then the line is pushed west to the desert, and a later stone wall runs further south. A rail shows work from 680 BCE to the 1600s CE.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.animateFor(500);
  }

  busy() { return this.age < 1.4; }

  _line(ctx, c, lls, k, col, w, dim) {
    const pts = lls.map((ll) => this.view.at(ll));
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (dim) ctx.globalAlpha = 0.45;
    traceLine(ctx, pts, k); ctx.strokeStyle = alpha(c.bgSurface, 0.9); ctx.lineWidth = w + 5; ctx.stroke();
    traceLine(ctx, pts, k); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    ctx.lineCap = 'butt'; ctx.setLineDash([5, 9]); traceLine(ctx, pts, k); ctx.strokeStyle = darken(col, 0.35); ctx.lineWidth = w + 4; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }

  _rail(ctx, c, s, k) {
    const { x, w, y } = RAIL, bar = (a, b, col) => { rr(ctx, yr(a), y - 9, Math.max(4, yr(b) - yr(a)), 18, 6); ctx.fillStyle = col; ctx.fill(); };
    rr(ctx, 10, y - 44, 660, 100, 14); ctx.fillStyle = alpha(c.bgSurface, 0.94); ctx.fill();
    rr(ctx, x, y - 9, w, 18, 6); ctx.fillStyle = c.track; ctx.fill();
    bar(-680, s === 0 ? -680 + 460 * k : -221, c.s2);
    if (s >= 1) bar(-221, -206, c.s6);
    if (s >= 2) bar(-206, s === 2 ? 220 : 220, c.s3);
    if (s >= 3) bar(220, 220 + 1430 * k, c.s5);
    ctx.font = `800 22px ${c.fontBody}`; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.textAlign = 'left'; ctx.fillText('680 BCE', x, y + 30);
    ctx.textAlign = 'right'; ctx.fillText('1600s CE', x + w, y + 30);
    if (s === 1) { ctx.textAlign = 'center'; ctx.fillText('221 BCE', yr(-221), y - 28); }
    if (s === 2) { ctx.textAlign = 'center'; ctx.fillText('Han', yr(0), y - 28); }
    if (s === 3) { ctx.textAlign = 'center'; ctx.fillText('About 2,000 years', x + w / 2, y + 30); }
  }

  draw(ctx, c) {
    const s = this.stage ?? 0;
    if (!drawEraBase(ctx, c, this, { rivers: ERA_RIVERS.china, india: false, riverWidth: 2 })) return;
    const v = this.view, k = clamp(this.age / 0.9, 0, 1), W1 = 10;
    const a = c.s2, j = c.s6, h = mix(c.strata2, c.s3, 0.5), l = c.s5;
    if (s === 0) EARLY.forEach((ll) => this._line(ctx, c, ll, k, a, W1));
    if (s >= 1) this._line(ctx, c, JOINED, s === 1 ? k : 1, j, W1, s === 3);
    if (s >= 2) this._line(ctx, c, WEST, s === 2 ? k : 1, h, W1, s === 3);
    if (s === 3) this._line(ctx, c, LATE, k, l, W1);
    let p = v.at([106, 44]); eraLabel(ctx, c, 'Nomadic herders', p[0], p[1], { size: 26, display: false });
    pill(ctx, c, READ[s], 340, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    if (s === 2) { p = v.at([97, 37.4]); eraLabel(ctx, c, 'rammed earth', p[0] + 16, p[1] + 22, { size: 26 }); }
    if (s === 3) { p = v.at([112, 37.2]); eraLabel(ctx, c, 'stone', p[0], p[1], { size: 28, bg: l, ink: inkOn(c, l) }); }
    if (s === 0) { p = v.at([108, 33.4]); eraLabel(ctx, c, 'Many rulers', p[0], p[1], { size: 28 }); }
    this._rail(ctx, c, s, k);
  }
}
