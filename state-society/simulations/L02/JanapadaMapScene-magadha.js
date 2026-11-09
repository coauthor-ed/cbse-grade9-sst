// JanapadaMapSceneMagadha - L02 s05. Map fills the stage. b0 Magadha lit. b1 three chips light
// location, plains, rulers; the third different one found is the celebrated find. b2 the
// reach spreads over neighbours toward the Mauryan Empire.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, alpha, clamp01 } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, sstFullView, drawSstFull, sstBadge, SST_JANAPADAS } from './SstMapBase.js';
import { crown, person } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[72, 20], [92, 33]];
const CHIPS = [
  { id: 'loc', label: 'Strategic location', targets: ['loc'], tone: 1 },
  { id: 'plains', label: 'Fertile plains', targets: ['plains'], tone: 3 },
  { id: 'rulers', label: 'Strong rulers', targets: ['rulers'], tone: 2 },
];
const MAG = [85.4, 24.9];
const PLAIN = [[79, 27], [82, 26.6], [85, 25.9], [88, 25.2], [88, 24.2], [85, 24.3], [82, 25], [79, 25.6]];

export class JanapadaMapSceneMagadha extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the Ganga plain with Magadha lit in present-day Bihar. Three chips light its strategic location beside the river, its fertile plains, and its strong rulers. On the last step its control spreads over neighbouring regions.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Reason', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  seen = new Set();

  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) {
    if (id !== 'lit') return;
    this.tl.fromControl(v);
    const k = this.tl.locked();
    if (k && !this.seen.has(k)) { this.seen.add(k); if (this.seen.size === 3) { const q = this.view?.at(MAG); if (q) this.celebrate(q[0], q[1], 18); } }
  }
  async setup() { this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT); this.animateFor?.(400); }
  enter() { this.tl.reset(); this.seen = new Set(); }
  busy() { return this.stage === 2 && this.age < 2.6; }

  draw(ctx, c) {
    if (!drawSstFull(ctx, c, this)) return;
    const v = this.view, q = v.at(MAG), lit = this.tl.lit()[0];
    if (this.stage === 2) {
      const u = clamp01(this.age / 2.4), e = 1 - (1 - u) ** 2;
      ctx.save(); ctx.beginPath(); v.path.context(ctx)(this.map.land); ctx.clip();
      ctx.beginPath(); ctx.ellipse(q[0] - 130 * e, q[1] - 26 * e, 44 + 300 * e, 44 + 86 * e, -0.2, 0, 7); ctx.fillStyle = alpha(c.gold, 0.45); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = c.gold; ctx.stroke(); ctx.restore();
      if (this.age > 2.2) pill(ctx, c, 'towards the Mauryan Empire', 340, 60, { size: 28, bg: c.gold, display: true, alpha: clamp01((this.age - 2.2) / 0.3) });
    }
    if (lit === 'plains') {
      ctx.beginPath(); PLAIN.forEach((ll, i) => { const a = v.at(ll); i ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1]); }); ctx.closePath();
      ctx.fillStyle = alpha(c.s3, 0.5); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.s3; ctx.stroke();
    }
    if (lit === 'loc') {
      ctx.beginPath(); ctx.arc(q[0], q[1], 92, 0, 7); ctx.lineWidth = 6; ctx.setLineDash([12, 10]); ctx.strokeStyle = c.s1; ctx.stroke(); ctx.setLineDash([]);
      pill(ctx, c, 'on the Ganga plain', q[0] - 150, q[1] - 110, { size: 28, bg: c.s1, display: true });
    }
    for (const J of SST_JANAPADAS) { if (J.n === 12) continue; const a = v.at(J.at); if (a && a[0] > 24 && a[0] < 656 && a[1] > 24 && a[1] < 496 && this.stage !== 2) sstBadge(ctx, c, a[0], a[1], J.n, { r: 15, off: true, col: c.stroke }); }
    sstBadge(ctx, c, q[0], q[1], 12, { r: 24, lit: true });
    pill(ctx, c, 'Magadha', q[0] - 10, q[1] + 56, { size: 32, bg: c.bad, display: true });
    if (lit === 'rulers') {
      crown(ctx, c, q[0] + 4, q[1] - 66, 1.5);
      person(ctx, this, { role: 'adult', x: q[0] - 106, y: q[1] + 28, height: 170, pose: 'point', facing: 1, i: 3 });
    }
  }
}
