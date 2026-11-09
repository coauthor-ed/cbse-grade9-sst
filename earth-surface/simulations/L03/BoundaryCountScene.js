// BoundaryCountScene - lay the plate lines over the records. Earthquakes and Plates switch on and off.
// Volcanoes: the share within 100, 300 or 500 km of a plate line is worked out here from the real
// positions (great-circle distance to the nearest boundary vertex), so the number on screen is a measurement.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, drawBackdrop, drawCard } from 'simulations/base/kit/SimLook.js';
import { layerCache, drawPlates } from 'simulations/base/kit/GeoMap.js';
import { EARTH_COLOR_MAP, earthColour } from '../shared/EarthArt.js';
import { worldMap, paintWorld, dots, triangles, mapCredit } from '../shared/EarthMap.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const RAD = Math.PI / 180, EARTH = 6371;
const HAWAII = [-155.3, 19.4];
function nearestKm(pts, net) {
  const verts = [];
  for (const f of net.features) {
    if (!/diverge|converge|subduct|transform/.test(f.properties.kind)) continue;
    for (const line of f.geometry.coordinates) for (const [lon, lat] of line) verts.push([lon * RAD, lat * RAD, Math.cos(lat * RAD)]);
  }
  return pts.map(([lon, lat]) => {
    const l = lon * RAD, p = lat * RAD, cp = Math.cos(p);
    let best = Infinity;
    for (const [vl, vp, cv] of verts) {
      const a = Math.sin((vp - p) / 2) ** 2 + cp * cv * Math.sin((vl - l) / 2) ** 2;
      if (a < best) best = a;
    }
    return 2 * EARTH * Math.asin(Math.sqrt(best));
  });
}

export class BoundaryCountScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A world map where plate boundaries can be laid over earthquakes and volcanoes. A count shows how many volcanoes lie within 100, 300 or 500 km of a plate boundary.';
  static CONTROLS = [
    { type: 'toggle', id: 'quakes', label: 'Earthquakes', value: true },
    { type: 'toggle', id: 'plates', label: 'Plates', value: true },
    { type: 'segmented', tall: true, id: 'km', label: 'Within', value: '300', options: [{ value: '100', label: '100 km' }, { value: '300', label: '300 km' }, { value: '500', label: '500 km' }] },
  ];

  async setup() {
    this._s = 0; this._q = true; this._p = true; this._km = 300; this._found = false;
    this.cache = layerCache();
    await super.setup();
    this.m = await worldMap(this._ctx, ['plates', 'quakes', 'volcanoes']);
    this.q = this.m.map.quakes.features.map((f) => f.geometry.coordinates);
    this.vol = this.m.map.volcanoes.features.map((f) => f.geometry.coordinates);
    this.dist = nearestKm(this.vol, this.m.map.plates);
    this.animateFor(500);
  }
  enter(stage) {
    this._s = stage; this._q = true; this._p = true; this._km = 300;
    this.requestUiUpdate?.();
  }
  isControlHidden(id) { return id === 'km' ? this._s === 0 : this._s !== 0; }
  getControlValue(id) {
    if (id === 'quakes') return this._q;
    if (id === 'plates') return this._p;
    if (id === 'km') return String(this._km);
    return super.getControlValue(id);
  }
  onControlChange(id, v) {
    if (id === 'quakes') this._q = !!v;
    if (id === 'plates') this._p = !!v;
    if (id === 'km') {
      this._km = Number(v);
      if (!this._found && this._km === 500) { this._found = true; this.celebrate(340, 410, 12, { key: 'count' }); }
    }
    this.animateFor?.(300); this.requestUiUpdate?.();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    if (!this.m) return;
    const s = this._s, v = this.m.view, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    this.cache(ctx, [c, s, this._q, this._p, this._km], (o) => {
      paintWorld(o, c, this.m);
      if (s === 0 && this._q) dots(o, v, this.q, 2.4, c.bad, 0.85);
      if (this._p) drawPlates(o, v, c, this.m.map.plates, { width: 1.8, alpha: 0.95, kinds: ['diverge', 'transform', 'converge', 'subduct'] });
      if (s > 0) {
        const near = [], far = [];
        this.vol.forEach((p, i) => (this.dist[i] <= this._km ? near : far).push(p));
        triangles(o, v, far, 5, snow, ink);
        triangles(o, v, near, 4.2, ink);
      }
      if (s === 2) {
        const p = v.at(HAWAII);
        if (p) { o.save(); o.strokeStyle = ink; o.lineWidth = 4; o.beginPath(); o.arc(p[0], p[1], 20, 0, 7); o.stroke(); o.restore(); }
      }
    });
    drawCard(ctx, c, 8, 356, 664, 118);
    if (s === 0) {
      pill(ctx, c, 'Belts follow the plate lines', 340, 414, { bg: ink, ink: snow, size: 28, display: true });
    } else {
      const n = this.dist.filter((d) => d <= this._km).length, pct = Math.round(n / this.dist.length * 100);
      pill(ctx, c, `${n} of ${this.dist.length} volcanoes: ${pct}%`, 340, 390, { bg: ink, ink: snow, size: 30, display: true });
      pill(ctx, c, s === 2 ? 'Ringed: Hawaii, far from any edge' : `within ${this._km} km of a plate line`, 340, 442, { bg: snow, ink, size: 25 });
    }
    mapCredit(ctx, c);
  }
}
