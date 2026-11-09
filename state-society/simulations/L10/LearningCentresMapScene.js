// LearningCentresMapScene - L10 blk-l10-s04, 3 beats. Fig. 5.10's nineteen centres on a map that fills the stage.
// North, East, West and South chips light a region and list its names beside the map. Nalanda and Vallabhi carry
// their dates on a strip to scale. No modern border is loaded: relief, rivers and coast only.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, rr, drawCard, drawVignette } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { reliefImage } from 'simulations/base/kit/GeoMap.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, makeSstView, drawSstBase } from '../L02/SstMapBase.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { ease, seg, say, plate } from '../L09/SstWorld.js';

const W = 680, H = 520;
const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[60, 6.5], [100, 36]];
const CENTRES = [
  { n: 1, name: '\u015Ah\u0101rad\u0101 P\u012B\u1E6Dha', at: [74.8, 34.05], r: 'n' },
  { n: 2, name: 'Tak\u1E63ha\u015Bhil\u0101', at: [72.8, 33.75], r: 'n' },
  { n: 3, name: 'Ahichchhatra', at: [79.4, 28.4], r: 'n' },
  { n: 4, name: 'Mithil\u0101', at: [85.9, 26.5], r: 'e' },
  { n: 5, name: 'V\u0101r\u0101\u1E47as\u012B', at: [83.0, 25.3], r: 'e' },
  { n: 6, name: 'N\u0101land\u0101', at: [85.4, 25.1], r: 'e' },
  { n: 7, name: 'Odantapur\u012B', at: [84.6, 25.9], r: 'e' },
  { n: 8, name: 'Vikram\u015Bhil\u0101', at: [87.3, 25.0], r: 'e' },
  { n: 9, name: 'Jagaddal\u0101', at: [88.3, 25.6], r: 'e' },
  { n: 10, name: 'Sompura', at: [89.1, 24.9], r: 'e' },
  { n: 11, name: 'Pu\u1E63hpagiri', at: [86.0, 20.7], r: 'e' },
  { n: 12, name: 'Ujjayin\u012B', at: [75.8, 23.2], r: 'w' },
  { n: 13, name: 'Vallabh\u012B', at: [71.9, 21.9], r: 'w' },
  { n: 14, name: 'Salo\u1E6Dg\u012B', at: [75.9, 17.1], r: 'w' },
  { n: 15, name: 'N\u0101g\u0101rjunakon\u1E0D\u0101', at: [79.3, 16.5], r: 's' },
  { n: 16, name: 'K\u0101nch\u012Bpuram', at: [79.7, 12.8], r: 's' },
  { n: 17, name: 'Ennayiram', at: [79.4, 11.9], r: 's' },
  { n: 18, name: 'Thrissur', at: [76.2, 10.5], r: 's' },
  { n: 19, name: 'Anur\u0101dh\u0101pura', at: [80.4, 8.3], r: 's' },
];
const CHIPS = [
  { id: 'n', label: 'North', targets: ['n'], tone: 1 },
  { id: 'e', label: 'East', targets: ['e'], tone: 8 },
  { id: 'w', label: 'West', targets: ['w'], tone: 3 },
  { id: 's', label: 'South', targets: ['s'], tone: 5 },
];
const TONE = { n: 's1', e: 's8', w: 's3', s: 's5' };
const SIDE = { n: 'left', e: 'right', w: 'left', s: 'right' };
const STRIP = {
  from: 400, to: 500,
  marks: [
    { id: 'nal', at: 427, when: '427 CE', label: 'N\u0101land\u0101', tone: 8 },
    { id: 'val', at: 480, when: '480 CE', label: 'Vallabh\u012B', tone: 3 },
  ],
};

export class LearningCentresMapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the subcontinent with nineteen numbered centres of learning. Chips for North, East, West and South list the names in each region. Nalanda and Vallabhi are marked with their dates, and arrows show students arriving from other regions.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Region', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this._at = this.clock; this.animateFor(500); } });
  _at = 0;
  view = null;
  relief = null;

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }

  isControlHidden(id) { return id === 'lit' && (this.stage ?? 0) !== 0; }

  async setup() {
    this.map = await loadSstMap();
    await super.setup();
    this.view = await makeSstView(this._ctx, { x: 0, y: 0, w: W, h: H }, EXTENT);
    this.animateFor(600);
  }

  enter() { this.tl.reset(); this._at = this.clock; }
  busy() { return this.age < 1.2; }

  draw(ctx, c) {
    ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, W, H);
    const v = this.view;
    if (!v || !this.map) return;
    if (!this.relief) this.relief = reliefImage(v, c, this.map, { step: 2 });
    drawSstBase(ctx, v, c, this.map, { relief: this.relief });
    const s = this.stage ?? 0, lit = this.tl.lit()[0] ?? null;
    const dated = s === 1;
    for (const m of CENTRES) {
      const p = v.at(m.at);
      if (!p) continue;
      const key = dated ? (m.n === 6 || m.n === 13) : (!lit || lit === m.r);
      const col = dated ? (m.n === 6 ? c.s8 : m.n === 13 ? c.s3 : c.waste) : c[TONE[m.r]];
      ctx.save(); ctx.globalAlpha *= key ? 1 : 0.32;
      const r = key && (lit || dated) ? 13 : 9;
      ctx.beginPath(); ctx.arc(p[0], p[1] + 2, r, 0, Math.PI * 2); ctx.fillStyle = darken(col, 0.4); ctx.fill();
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = c.bgSurface; ctx.stroke();
      ctx.restore();
    }
    if (s === 0 && !lit) plate(ctx, c, '19 centres of learning', W / 2, 496, { size: 28 });
    if (lit) this._list(ctx, c, lit);
    if (dated) this._dates(ctx, c, v);
    if (s === 2) this._reach(ctx, c, v);
    drawVignette(ctx, c, 0.25);
  }

  _list(ctx, c, lit) {
    const k = ease((this.clock - this._at) / 0.3), list = CENTRES.filter((m) => m.r === lit);
    const left = SIDE[lit] === 'left', w = 214, h = 22 + list.length * 40, x = left ? 10 : W - w - 10, y = lit === 'e' ? 110 : 150;
    ctx.save(); ctx.globalAlpha *= k;
    drawCard(ctx, c, x, y, w, h);
    list.forEach((m, i) => {
      const ty = y + 31 + i * 40;
      ctx.fillStyle = c[TONE[lit]]; ctx.beginPath(); ctx.arc(x + 22, ty, 9, 0, Math.PI * 2); ctx.fill();
      say(ctx, c, m.name, x + 40, ty, { size: 28, align: 'left', weight: 700, display: false });
    });
    ctx.restore();
  }

  _dates(ctx, c, v) {
    const k = ease(seg(this.age, 0.1, 0.6));
    ctx.save(); ctx.globalAlpha *= k;
    drawCard(ctx, c, 300, 8, 370, 132);
    drawDateStrip(ctx, c, STRIP, { x: 324, y: 26, w: 322, size: 28, labelSize: 28, k });
    ctx.restore();
    const nal = v.at([85.4, 25.1]), val = v.at([71.9, 21.9]);
    if (nal) plate(ctx, c, 'N\u0101land\u0101', nal[0] + 34, nal[1] + 44, { size: 28, alpha: k });
    if (val) plate(ctx, c, 'Vallabh\u012B', val[0] - 8, val[1] + 42, { size: 28, alpha: k });
  }

  _reach(ctx, c, v) {
    const k = ease(seg(this.age, 0.1, 0.9));
    const arrow = (from, to) => {
      const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k, ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = c.accent; ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-10, -14); ctx.lineTo(-10, 14); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    const tak = v.at([72.8, 33.75]), nal = v.at([85.4, 25.1]), anu = v.at([79.7, 12.8]);
    if (tak) arrow([20, tak[1] - 40], [tak[0] - 22, tak[1] - 6]);
    if (nal) arrow([W - 16, nal[1] + 30], [nal[0] + 24, nal[1] + 4]);
    if (anu) arrow([W - 40, anu[1] + 26], [anu[0] + 24, anu[1]]);
    plate(ctx, c, 'students from India and other regions', W / 2, 496, { size: 28 });
    const a = v.at([75.9, 16.0]);
    if (a) {
      ctx.fillStyle = c.bgSurface; rr(ctx, a[0] - 9, a[1] - 9, 18, 18, 4); ctx.fill();
      ctx.fillStyle = c.gold; rr(ctx, a[0] - 7, a[1] - 7, 14, 14, 3); ctx.fill();
      plate(ctx, c, 'Aihole and Badami', a[0] - 120, a[1] + 2, { size: 28, bg: mix(c.bgSurface, c.gold, 0.2) });
    }
  }
}
