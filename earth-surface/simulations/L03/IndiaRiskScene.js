// IndiaRiskScene - India from the Survey of India layer, real M6+ earthquakes on it, real plate lines. The
// four areas of high risk are soft bands. Kachchh is plainly inside the plate: the line is far away on the map.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, alpha, mix, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { loadMap, makeView, drawLand, drawIndia, drawPlates, layerCache } from 'simulations/base/kit/GeoMap.js';
import { EARTH_COLOR_MAP, earthColour } from '../shared/EarthArt.js';
import { dots, mapCredit } from '../shared/EarthMap.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }], [{ idx: 3 }]];
const BOX = { x: 100, y: 4, w: 480, h: 470 };
const AREAS = {
  himalaya: { pts: [[74, 34], [77, 32.5], [80, 30], [84, 28], [88, 27.2], [92, 27.6]], w: 26 },
  northeast: { pts: [[93, 27], [94.5, 25], [93.5, 23]], w: 26 },
  kachchh: { pts: [[69.5, 23.4], [71, 23.4]], w: 30 },
  andaman: { pts: [[92.8, 13.2], [93, 10], [93.6, 7.2]], w: 22 },
};
const LIT = { 0: Object.keys(AREAS), 1: ['himalaya', 'northeast', 'andaman'], 2: ['kachchh'], 3: Object.keys(AREAS) };

export class IndiaRiskScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static ARIA_LABEL = 'A map of India with real strong earthquakes and plate lines. The Himalayan arc, the North-East, Kachchh and the Andaman and Nicobar Islands are marked as areas of high risk.';

  async setup() {
    this._s = 0;
    this.map = await loadMap(['land', 'india', 'plates', 'quakes']);
    this.cache = layerCache();
    await super.setup();
    this.view = await makeView(this._ctx, { kind: 'mercator', extent: [[62, 5], [100, 38]], box: BOX });
    this.q = this.map.quakes.features.map((f) => f.geometry.coordinates).filter(([x, y]) => x > 60 && x < 102 && y > 3 && y < 40);
    this.animateFor(500);
  }
  enter(stage) { this._s = stage; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    if (!this.view) return;
    const s = this._s, v = this.view, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow'), lit = LIT[s];
    this.cache(ctx, [c, s], (o) => {
      o.save();
      o.beginPath(); o.rect(BOX.x, BOX.y, BOX.w, BOX.h); o.clip();
      o.fillStyle = mix(c.seaShallow, c.bgSurface, 0.56); o.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
      drawLand(o, v, c, this.map.land, { fill: mix(c.elevMid, c.bgSurface, 0.56), stroke: earthColour(c, 'grassDark'), lineWidth: 1 });
      drawIndia(o, v, c, this.map.india, { fill: c.elevMid, stroke: ink, lineWidth: 2, credit: false });
      drawPlates(o, v, c, this.map.plates, { width: 3 });
      for (const [k, a] of Object.entries(AREAS)) {
        const on = lit.includes(k), p = a.pts.map((q) => v.at(q));
        o.save();
        o.strokeStyle = alpha(c.bad, on ? 0.55 : 0.12); o.lineWidth = a.w * 1.5; o.lineCap = 'round'; o.lineJoin = 'round';
        o.beginPath(); p.forEach((q, i) => (i ? o.lineTo(q[0], q[1]) : o.moveTo(q[0], q[1]))); o.stroke();
        o.restore();
      }
      dots(o, v, this.q, 3.4, ink, 0.8);
      o.restore();
    });
    const at = (ll) => v.at(ll);
    const tag = (t, x, y, on = true, o = {}) => pill(ctx, c, t, x, y, { bg: on ? ink : snow, ink: on ? snow : ink, size: 25, display: true, alpha: on ? 1 : 0.5, ...o });
    const h = at([80, 33.5]), ne = at([96, 25]), k = at([68, 23.4]), an = at([93, 10]);
    tag('Himalayan arc', h[0] + 30, h[1] - 44, lit.includes('himalaya'));
    tag('North-East', Math.min(ne[0] + 34, 600), ne[1] + 12, lit.includes('northeast'));
    tag('Kachchh', k[0] - 44, k[1] + 4, lit.includes('kachchh'));
    tag('Andaman and Nicobar', Math.min(an[0] - 6, 500), an[1] + 40, lit.includes('andaman'), { size: 28 });
    if (s === 2) tag('Inside the plate', 200, 400, true, { bg: c.gold, ink });
    if (s === 3) { tag('Crowded towns', 330, 340, true, { bg: c.gold, ink }); tag('Weak buildings', 330, 392, true, { bg: c.gold, ink }); }
    mapCredit(ctx, c);
  }
}
