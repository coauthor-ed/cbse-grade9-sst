// HarappanSitesMapScene - blk-l07-s02, 3 beats. Land and rivers first, then the Early Harappan settlements (triangles),
// then the Mature cities (squares) in the same region. Chips light one group and print its names, because all 18 names
// at once would not fit. Sites and rivers follow Fig. 4.17. India's outline comes only from the Survey of India layer.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, clamp } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawRivers } from 'simulations/base/kit/GeoMap.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadEraMap, eraView, drawEraBase, eraCredit, eraPin, eraLabel, eraRegion, ERA_RIVERS, ERA_FULL } from '../shared/EraMap.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[62.5, 19], [84, 35.2]];
// name, [lon, lat], label dx, dy. Group: nw, coast, sar, city.
const SITES = {
  nw: [['Mehrgarh', [67.6, 29.4], -64, -30], ['Rehman Dheri', [70.8, 32.2], -30, -32], ['Jalilpur', [72.2, 30.5], 76, 26], ['Kot Diji', [68.7, 27.4], 80, 2], ['Amri', [67.9, 26.1], -56, 12]],
  coast: [['Balakot', [66.7, 25.4], -40, 34], ['Datrana', [71.2, 23.9], -66, -26], ['Loteshwar', [71.9, 23.6], 92, -8], ['Padri', [72.1, 21.5], 58, -4], ['Somnath', [70.4, 20.9], -64, 28]],
  sar: [['Bhirrana', [75.6, 29.6], 66, 26], ['Kunal', [75.1, 29.9], 40, -32]],
  city: [['Harappa', [72.9, 30.6], 8, -34], ['Kalibangan', [74.1, 29.2], -22, 34], ['Rakhigarhi', [76.1, 29.1], 92, 8], ['Mohenjo-Daro', [68.1, 27.3], -14, -34], ['Dholavira', [70.2, 23.9], -28, -34], ['Lothal', [72.3, 22.5], 56, 8]],
};
const DRY = [[77.0, 30.7], [76.0, 30.0], [75.0, 29.65], [74.1, 29.45], [73.2, 29.0], [72.0, 28.2], [70.9, 27.2], [70.2, 26.0]];
const PLAIN = [[71.0, 33.4], [74.6, 32.4], [77.4, 30.8], [76.4, 28.8], [72.6, 27.4], [71.0, 25.2], [69.2, 24.0], [67.3, 24.4], [67.2, 27.2], [69.4, 30.4]];
const CHIPS = [
  { id: 'nw', label: 'North and west', targets: ['nw'], tone: 2 },
  { id: 'coast', label: 'Coast and Gujarat', targets: ['coast'], tone: 2 },
  { id: 'sar', label: 'Sarasvati belt', targets: ['sar'], tone: 2 },
  { id: 'city', label: 'Mature cities', targets: ['city'], tone: 1 },
];

export class HarappanSitesMapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the Indus and Ghaggar-Sarasvati basins. Early Harappan settlements are triangles and Mature Harappan cities are squares, in the same region. Chips show the names of each group.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this.animateFor(200); } });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && (this.stage ?? 0) === 0; }

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, EXTENT, ERA_FULL);
    this.animateFor(500);
  }

  enter(s) {
    this.tl.set({ lit: s === 1 ? 'nw' : s === 2 ? 'city' : null });
  }

  busy() { return this.age < 0.8; }

  draw(ctx, c) {
    const s = this.stage ?? 0;
    if (!drawEraBase(ctx, c, this, { rivers: ERA_RIVERS.india })) return;
    const v = this.view, t = this.age, k = clamp(t / 0.5, 0, 1);
    if (s === 0) eraRegion(ctx, c, v, PLAIN, c.elevLow, 1, {});
    drawRivers(ctx, v, c, this.map.rivers, { names: ['Indus'], color: c.seaShallow, width: s === 0 ? 7 : 4 });
    this._dry(ctx, c, v, s === 0 ? 6 : 4);
    if (s === 0) {
      eraLabel(ctx, c, 'Alluvial plains', 262, 130, { size: 26, display: false });
      eraLabel(ctx, c, 'Indus (Sindhu)', 164, 300, { size: 26 });
      eraLabel(ctx, c, 'Ghaggar-Sarasvati', 500, 268, { size: 26 });
      eraLabel(ctx, c, 'dry belt today', 500, 304, { size: 26, display: false });
      eraLabel(ctx, c, 'Himalayas', 520, 40, { size: 26 });
      eraLabel(ctx, c, 'Arabian Sea', 120, 460, { size: 26 });
      eraCredit(ctx, c, v);
      return;
    }
    const lit = this.tl.lit()[0] ?? null;
    for (const [grp, list] of Object.entries(SITES)) {
      const city = grp === 'city';
      if (city && s < 2 && lit !== 'city') continue;
      const on = lit === grp;
      for (const [, ll] of list) {
        const p = v.at(ll);
        if (!p) continue;
        eraPin(ctx, c, p[0], p[1], city ? 'square' : 'tri', { r: on ? 14 : 10, col: city ? c.s1 : c.s2, lit: on, off: lit != null && !on });
      }
    }
    if (lit) for (const [name, ll, dx, dy] of SITES[lit]) {
      const p = v.at(ll);
      if (!p) continue;
      ctx.save(); ctx.globalAlpha *= k;
      eraLabel(ctx, c, name, p[0] + dx, p[1] + dy, { size: 26 });
      ctx.restore();
    }
    this._legend(ctx, c, s);
    eraCredit(ctx, c, v);
  }

  _dry(ctx, c, v, w) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([2, w * 2.4]);
    ctx.beginPath();
    DRY.forEach((ll, i) => { const p = v.at(ll); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
    ctx.strokeStyle = alpha(c.seaDeep, 0.85); ctx.lineWidth = w; ctx.stroke();
    ctx.restore();
  }

  _legend(ctx, c, s) {
    eraPin(ctx, c, 30, 34, 'tri', { r: 10, col: c.s2 });
    eraLabel(ctx, c, 'Early settlements', 50, 34, { size: 26, align: 'left', display: false });
    if (s < 2) return;
    eraPin(ctx, c, 30, 74, 'square', { r: 10, col: c.s1 });
    eraLabel(ctx, c, 'Mature cities', 50, 74, { size: 26, align: 'left', display: false });
  }
}
