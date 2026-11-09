// IronAndGrainScene - L02 s06. One big map and a toggle between two periods. b1 Vedic culture
// spreads from the Indus-Sarasvati region to the Ganga plains. b2 PGW field, upper Ganga; NBPW
// field, middle Ganga; iron finds. b3 what texts add: tokens for iron, grain, paddy.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, alpha, chipRow } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadSstMap, sstFullView, drawSstFull, sstSettlements, drawSstWare, sstSitePin, SST_WARES, SST_SITES } from './SstMapBase.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[66, 12], [92, 36]];
const DOTS = sstSettlements();

export class IronAndGrainScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the subcontinent with a switch between two periods. In the later period settlement dots gather in the Ganga region. An arrow shows Vedic culture moving from the north-west to the Ganga plains. Pottery fields mark PGW in the upper Ganga region and NBPW in the middle Ganga region, with early iron finds as pins.';
  static CONTROLS = [{ type: 'segmented', id: 'era', label: 'Period', value: 'early', options: [{ value: 'early', label: '2nd millennium BCE' }, { value: 'late', label: '1st millennium BCE' }] }];
  era = 'early';
  async setup() {
    this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT);
    const onLand = (d) => this.view.d3.geoContains(this.map.land, d.at);
    this.dots = { early: DOTS.early.filter(onLand), late: DOTS.late.filter(onLand) };
    this.animateFor?.(400);
  }
  enter(stage) { this.era = stage === 0 ? 'early' : 'late'; }
  getControlValue(id) { return id === 'era' ? this.era : undefined; }
  onControlChange(id, v) { if (id === 'era') this.era = v; }

  draw(ctx, c) {
    if (!drawSstFull(ctx, c, this)) return;
    const v = this.view, st = this.stage;
    if (st >= 2) {
      drawSstWare(ctx, v, c, SST_WARES.pgw.at, alpha(c.s5, 0.5));
      drawSstWare(ctx, v, c, SST_WARES.nbpw.at, alpha(c.label, 0.5));
    }
    const dots = this.dots?.[this.era] ?? [];
    for (const d of dots) { const q = v.at(d.at); if (!q) continue; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, 7); ctx.fillStyle = c.s8; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = c.bgSurface; ctx.stroke(); }
    if (st === 1) {
      const a = v.at([73, 31.5]), b = v.at([84, 26.5]);
      ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = c.gold;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 20, b[0], b[1]); ctx.stroke();
      const ang = Math.atan2(b[1] - (a[1] - 20), b[0] - (a[0] + b[0]) / 2);
      ctx.beginPath(); ctx.moveTo(b[0] + Math.cos(ang) * 24, b[1] + Math.sin(ang) * 24); ctx.lineTo(b[0] + Math.cos(ang + 2.4) * 22, b[1] + Math.sin(ang + 2.4) * 22); ctx.lineTo(b[0] + Math.cos(ang - 2.4) * 22, b[1] + Math.sin(ang - 2.4) * 22); ctx.closePath(); ctx.fillStyle = c.gold; ctx.fill();
      pill(ctx, c, 'Indus and Sarasvat\u012B', 190, 96, { size: 28, bg: c.s2 });
      pill(ctx, c, 'Ganga plains', 500, 96, { size: 28, bg: c.gold, display: true });
    }
    if (st >= 2) {
      for (const s of SST_SITES.iron) { const q = v.at(s.at); if (q) sstSitePin(ctx, c, q[0], q[1], 'iron', 7); }
      const p = v.at([78, 29]), n = v.at([85, 25.4]);
      pill(ctx, c, 'PGW', p[0], p[1] - 4, { size: 28, bg: c.s5, display: true });
      pill(ctx, c, 'NBPW', n[0], n[1], { size: 28, bg: c.label, ink: c.bgSurface, display: true });
      if (st === 2) pill(ctx, c, 'iron finds', 110, 470, { size: 28, bg: c.label, ink: c.bgSurface, display: true });
    }
    if (st === 3) chipRow(ctx, c, [{ text: 'iron tools', bg: c.s8 }, { text: 'more grain', bg: c.gold }, { text: 'paddy', bg: c.s3 }], 340, 466, { size: 28, display: true, gap: 12, align: 'center' });
  }
}
