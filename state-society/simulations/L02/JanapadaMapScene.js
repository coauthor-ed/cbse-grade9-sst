// JanapadaMapScene - L02 s04. The map fills the stage: sixteen numbered badges in the numbering of
// Fig. 5.4. Tap a badge for its name. Chips light the three regions and list their names.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, font } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, sstFullView, drawSstFull, sstBadge, SST_JANAPADAS } from './SstMapBase.js';
import { panel } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[68, 15], [91, 36]];
const CHIPS = [
  { id: 'nw', label: 'North-west', targets: ['nw'], tone: 5 },
  { id: 'ganga', label: 'Ganga plain', targets: ['ganga'], tone: 2 },
  { id: 'south', label: 'South of the Yamuna', targets: ['south'], tone: 3 },
];
const TONE = { nw: 's5', ganga: 's2', south: 's3' };
const ZOOM = { nw: { k: 1.2, at: [75, 30] }, ganga: { k: 1.75, at: [82.2, 26.8] }, south: { k: 1.3, at: [78, 22] } };

export class JanapadaMapScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'A relief map of the northern subcontinent with sixteen numbered badges, one for each mahajanapada. Most lie in the Ganga plain and the north-west; three lie south of the Yamuna. Tap a badge for its name. Chips light each region and list its names.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Region', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  open = -1;

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.open = -1; } }
  isControlDisabled(id) { return id === 'lit' && this.tl.disabled(); }
  async setup() { this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT); this.requestDraw?.(); this.animateFor?.(400); }
  enter(stage) { this.tl.set({ lit: stage === 1 ? 'ganga' : null }); this.open = -1; }

  // The chip zooms the map to its region, so the badges read at phone size.
  _zoom() {
    const z = ZOOM[this.tl.lit()[0]] ?? { k: 1, at: null };
    const q = z.at ? this.view.at(z.at) : [340, 260];
    return { k: z.k, x: 340 - q[0] * z.k, y: 260 - q[1] * z.k };
  }

  pointerDown(p) {
    if (!this.view) return;
    const T = this._zoom();
    let best = -1, bd = 60;
    for (const J of SST_JANAPADAS) {
      const q = this.view.at(J.at), x = q[0] * T.k + T.x, y = q[1] * T.k + T.y;
      const d = Math.hypot(x - p.x, y - p.y);
      if (d < bd) { bd = d; best = J.n; }
    }
    this.open = best === this.open ? -1 : best;
    this.animateFor?.(200);
  }

  draw(ctx, c) {
    if (!this.view || !this.map) return;
    const lit = this.tl.lit(), zone = lit[0] ?? null, T = this._zoom();
    ctx.save(); ctx.beginPath(); ctx.rect(6, 6, 668, 508); ctx.clip();
    ctx.translate(T.x, T.y); ctx.scale(T.k, T.k);
    drawSstFull(ctx, c, this);
    ctx.restore();
    const r = zone ? 25 : 22;
    for (const J of SST_JANAPADAS) {
      const q = this.view.at(J.at), x = q[0] * T.k + T.x, y = q[1] * T.k + T.y;
      if (x < 10 || x > 670 || y < 10 || y > 510 || (zone === 'ganga' && y > 350)) continue;
      sstBadge(ctx, c, x, y, J.n, { r, off: zone && J.zone !== zone, lit: this.open === J.n, col: zone === J.zone ? c[TONE[zone]] : c.bad });
      if (zone === J.zone && zone !== 'ganga') pill(ctx, c, J.name, x, y + (J.n % 2 ? -42 : 42), { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    }
    if (zone === 'ganga') {
      panel(ctx, c, 14, 372, 652, 136, { fill: c.bgSurface, rim: c.s2 });
      ctx.font = font(c, 800, 28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
      SST_JANAPADAS.filter((J) => J.zone === 'ganga').forEach((J, i) => ctx.fillText(`${J.n} ${J.name}`, 30 + (i % 3) * 214, 398 + Math.floor(i / 3) * 29));
    }
    if (this.open > 0 && !zone) {
      const J = SST_JANAPADAS[this.open - 1], q = this.view.at(J.at);
      const y = q[1] > 90 ? q[1] - 46 : q[1] + 46, x = Math.max(250, Math.min(430, q[0]));
      pill(ctx, c, `${J.name}: ${CHIPS.find((h) => h.id === J.zone).label}`, x, y, { size: 30, bg: c.gold, display: !/\u012B/.test(J.name) });
    }
  }
}
