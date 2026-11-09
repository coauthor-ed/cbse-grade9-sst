// TradeRoutesMapScene - L11 blk-l11-s05, 4 beats. The map fills the stage. Chips light the Dakshinapatha, the Uttarapatha
// and the ports with their cities; goods move on entry and come to rest. Routes follow Fig. 5.12. Rome and Central Asia
// sit on arrows that leave the map. No modern border is loaded.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { darken, drawVignette } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { reliefImage } from 'simulations/base/kit/GeoMap.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, makeSstView, drawSstBase } from '../L02/SstMapBase.js';
import { ease, seg, plate } from '../L09/SstWorld.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const EXTENT = [[60, 7.5], [100, 37]];
const P = {
  pushk: [71.8, 34.2], taksh: [72.8, 33.7], rupar: [76.5, 31.0], thuna: [77.0, 30.0], hast: [78.0, 29.1], math: [77.7, 27.5],
  kaush: [81.4, 25.4], kash: [83.0, 25.3], patal: [85.1, 25.6], champa: [87.0, 25.2], tamra: [87.9, 22.4], chandra: [88.7, 22.8],
  vidi: [77.8, 23.5], ujj: [75.8, 23.2], mahi: [75.7, 22.2], prat: [75.4, 19.5], suva: [76.5, 15.5],
  muz: [76.2, 10.2], kave: [79.85, 11.15], arik: [79.85, 11.9], masu: [81.1, 16.2], bharu: [73.0, 21.7], kanchi: [79.7, 12.8], kanya: [77.5, 8.3],
};
const UTT = ['pushk', 'taksh', 'rupar', 'thuna', 'hast', 'math', 'kaush', 'kash', 'patal', 'champa', 'chandra', 'tamra'];
const DAK = ['kaush', 'vidi', 'ujj', 'mahi', 'prat', 'suva'];
const CHIPS = [
  { id: 'dak', label: 'Dak\u1E63hi\u1E47\u0101patha', targets: ['dak'], tone: 2 },
  { id: 'utt', label: 'Uttar\u0101patha', targets: ['utt'], tone: 5 },
  { id: 'port', label: 'Ports', targets: ['port'], tone: 1 },
];
// A label sits off its city by hand: on-map crowding is known, and these never change.
const NAMES = {
  dak: [['kaush', 'Kau\u015Bh\u0101mb\u012B', 74, -30], ['vidi', 'Vidi\u015Bh\u0101', 76, 4], ['ujj', 'Ujjayin\u012B', -84, -8], ['prat', 'Prati\u1E63h\u1E6Dh\u0101na', -106, 8], ['suva', 'Suvar\u1E47agiri', 92, 12]],
  utt: [['taksh', 'Tak\u1E63ha\u015Bhil\u0101', -96, 30], ['hast', 'Hastin\u0101pura', -112, 2], ['math', 'Mathur\u0101', -82, 16], ['patal', 'P\u0101\u1E6Daliputra', 8, -30], ['tamra', 'T\u0101mralipti', 56, 34]],
  port: [['muz', 'Muziris', -80, 6], ['kave', 'K\u0101veripa\u1E6D\u1E6Dinam', 116, 12], ['arik', 'Arikame\u1E0Du', 96, -22], ['masu', 'Masulipa\u1E6Dnam', 112, 2]],
};

export class TradeRoutesMapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the subcontinent. The Uttarapatha runs from the north-west down the Ganga plains to the Bengal coast. The Dakshinapatha runs from Kaushambi to the Deccan. Ports stand on both coasts, with arrows leaving the map for Rome and Central Asia. Goods move along the routes.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this._at = this.clock; this.animateFor(1500); } });
  _at = 0;
  view = null;
  relief = null;

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }

  isControlHidden(id) { const s = this.stage ?? 0; return id === 'lit' && (s === 0 || s === 3); }

  async setup() {
    this.map = await loadSstMap();
    await super.setup();
    this.view = await makeSstView(this._ctx, { x: 0, y: 0, w: W, h: H }, EXTENT);
    this.animateFor(600);
  }

  enter(s) {
    this._at = this.clock;
    this.tl.set({ lit: s === 1 ? 'dak' : s === 2 ? 'port' : null });
    if (s === 0 || s === 3) this.tl.reset();
  }

  busy() { return this.clock - this._at < (this.stage === 3 ? 3 : 1.3); }

  draw(ctx, c) {
    ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, W, H);
    const v = this.view;
    if (!v || !this.map) return;
    if (!this.relief) this.relief = reliefImage(v, c, this.map, { step: 2 });
    drawSstBase(ctx, v, c, this.map, { relief: this.relief });
    const s = this.stage ?? 0, lit = this.tl.lit()[0] ?? null, t = this.clock - this._at;
    const on = (id) => (s === 3 ? true : lit === id);
    if (s === 0) this._magadha(ctx, c, v, t);
    else {
      this._route(ctx, c, v, UTT, c.s5, on('utt'), t);
      this._route(ctx, c, v, DAK, c.s2, on('dak'), t);
    }
    if (s >= 1) {
      this._ports(ctx, c, v, on('port'), t);
      for (const id of ['dak', 'utt', 'port']) if (lit === id) this._names(ctx, c, v, id, t);
      if (on('port')) this._out(ctx, c, v, t);
    }
    if (s === 3) { this._tamil(ctx, c, v, t); this._goods(ctx, c, v, t); plate(ctx, c, 'goods, people and ideas', 240, 492, { size: 28 }); }
    drawVignette(ctx, c, 0.2);
  }

  _route(ctx, c, v, ids, col, lit, t) {
    const pts = ids.map((k) => v.at(P[k])).filter(Boolean);
    if (pts.length < 2) return;
    ctx.save();
    ctx.globalAlpha *= lit ? 1 : 0.3;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); };
    path(); ctx.strokeStyle = darken(col, 0.45); ctx.lineWidth = lit ? 11 : 6; ctx.stroke();
    path(); ctx.strokeStyle = col; ctx.lineWidth = lit ? 7 : 3; ctx.stroke();
    for (const p of pts) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], lit ? 8 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = c.bgSurface; ctx.stroke();
    }
    ctx.restore();
    void t;
  }

  _ports(ctx, c, v, lit, t) {
    const k = lit ? ease(t / 0.4) : 0.3;
    for (const id of ['muz', 'kave', 'arik', 'masu']) {
      const p = v.at(P[id]);
      if (!p) continue;
      ctx.save(); ctx.globalAlpha *= lit ? 1 : 0.35;
      drawIcon(ctx, c, 'crate', p[0], p[1], 9 + 7 * k, { tone: c.gold });
      ctx.restore();
    }
  }

  _names(ctx, c, v, id, t) {
    const a = ease(t / 0.4);
    for (const [k, name, dx, dy] of NAMES[id]) {
      const p = v.at(P[k]);
      if (p) plate(ctx, c, name, p[0] + dx, p[1] + dy, { size: 28, alpha: a });
    }
  }

  _arrow(ctx, c, from, to, k) {
    const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k, ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
    ctx.strokeStyle = c.s6; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.setLineDash([16, 12]);
    ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.s6; ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -14); ctx.lineTo(-10, 14); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // Rome and Central Asia: labels on arrows that run off the map's edge, never on the sea.
  _out(ctx, c, v, t) {
    const k = ease(seg(t, 0.2, 0.9));
    const m = v.at(P.muz), n = v.at(P.pushk);
    if (m) { this._arrow(ctx, c, [m[0] - 10, m[1] - 8], [18, m[1] - 140], k); plate(ctx, c, 'to Rome', 92, m[1] - 150, { size: 28, alpha: k, ink: c.s6ink }); }
    if (n) { this._arrow(ctx, c, [n[0] - 6, n[1] - 8], [24, 24], k); plate(ctx, c, 'to Central Asia', 112, 66, { size: 28, alpha: k, ink: c.s6ink }); }
  }

  _tamil(ctx, c, v, t) {
    const k = ease(seg(t, 0.2, 0.8)), a = v.at(P.kanchi), b = v.at(P.kave), e = v.at(P.kanya);
    if (!a || !b || !e) return;
    ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = c.s4; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.restore();
  }

  _along(pts, u) {
    const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), r = f - i;
    return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
  }

  // Tokens run the routes once and stop at the coast.
  _goods(ctx, c, v, t) {
    const runs = [[UTT, 0, c.gold], [UTT.slice(3), 0.3, c.s8], [DAK, 0.2, c.s3]];
    for (const [ids, delay, col] of runs) {
      const pts = ids.map((k) => v.at(P[k])).filter(Boolean);
      if (pts.length < 2) continue;
      const p = this._along(pts, ease(seg(t, delay, delay + 2.4)));
      ctx.beginPath(); ctx.arc(p[0], p[1] + 2, 13, 0, Math.PI * 2); ctx.fillStyle = darken(col, 0.4); ctx.fill();
      ctx.beginPath(); ctx.arc(p[0], p[1], 13, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    }
  }

  // The first beat: what Magadha traded, as tokens leaving Pataliputra.
  _magadha(ctx, c, v, t) {
    const p = v.at(P.patal);
    if (!p) return;
    const goods = ['textiles', 'gems', 'coral', 'pearls', 'metals', 'minerals'];
    const dirs = [[-250, -6], [-230, 70], [-120, 170], [-40, 220], [100, 180], [-260, 130]];
    goods.forEach((g, i) => {
      const k = ease(seg(t, 0.1 + i * 0.08, 0.7 + i * 0.08));
      plate(ctx, c, g, p[0] + dirs[i][0] * k, p[1] + dirs[i][1] * k, { size: 28, alpha: k });
    });
    ctx.beginPath(); ctx.arc(p[0], p[1], 16, 0, Math.PI * 2); ctx.fillStyle = c.gold; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = c.bgSurface; ctx.stroke();
    plate(ctx, c, 'Magadha', p[0] + 16, p[1] - 38, { size: 28 });
  }
}
