// EarthCutawayScene - the Earth with a quarter cut out, drawn after the book's cutaway. Real land on the
// globe, layer sizes true to the numbers except the crust, which the text says is drawn thicker.
// Two mounts by beat count: 5 (opening, beat 1 the Big Questions on the same figure) and 2 (close: the shell, then the shell broken along real plate lines).
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, font, outBack, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { loadMap, makeView, drawGlobeBase, drawGlobeShade, drawLand, drawIndia, CREDIT_INDIA, layerCache } from 'simulations/base/kit/GeoMap.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawWater, drawSnow, drawTree, drawEarthSky, drawGrass, roughen } from '../shared/EarthArt.js';

const MAP5 = [[{ idx: 0 }], [{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }], [{ idx: 3 }]];
const MAP2 = [[{ idx: 4 }], [{ idx: 5 }]];
const CX = 232, CY = 258, R = 204;
const A0 = -1.45, A1 = 0.42;                  // the cut, radians, canvas angles
const RAD = { crust: 1, mantle: 0.955, outer: (2200 + 1250) / 6375, inner: 1250 / 6375 };
const CHIPS = [
  { id: 'crust', label: 'Crust', targets: ['crust'] },
  { id: 'mantle', label: 'Mantle', targets: ['mantle'] },
  { id: 'outer', label: 'Outer core', targets: ['outer'] },
  { id: 'inner', label: 'Inner core', targets: ['inner'] },
];
const ROW = {
  crust: { y: 62, ang: -0.95, r: 0.985, name: 'Crust', val: '30-40 km on land' },
  mantle: { y: 176, ang: -0.42, r: 0.76, name: 'Mantle', val: 'about 2900 km' },
  outer: { y: 290, ang: 0.02, r: 0.38, name: 'Outer core', val: 'about 2200 km' },
  inner: { y: 404, ang: 0.3, r: 0.09, name: 'Inner core', val: 'about 1250 km' },
};
const LIT = { 2: ['crust', 'mantle', 'core'], 3: ['outer', 'inner'] };
const SIDE_X = 540;

export class EarthCutawayScene extends SimScene {
  static BEAT_STEP_MAP = MAP5;
  static BEAT_MAPS = { 5: MAP5, 2: MAP2 };
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'The Earth with a quarter cut away, showing the crust, the mantle, the outer core and the inner core. On the closing slide the outer shell is shown broken along plate lines.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];

  tl = tapLight({ label: 'Layers', chips: CHIPS, onChange: () => { this.animateFor?.(400); } });

  async setup() {
    this.map = await loadMap(['land', 'plates', 'india']);
    this.cache = layerCache();
    this._beat = 0;
    await super.setup();
    this.view = await makeView(this._ctx, { kind: 'orthographic', rotate: [-122, -8], box: { x: CX - R, y: CY - R, w: R * 2, h: R * 2 } });
    this.animateFor(500);
  }

  enter(stage) { this._beat = stage; this.tl.reset(); this.requestUiUpdate?.(); }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : super.getControlValue(id); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.animateFor?.(400); } }
  isControlHidden(id) { return id === 'lit' && this._beat !== 3; }

  _globe(ctx, c, s) {
    this.cache(ctx, [c, s], (o) => {
      drawGlobeBase(o, this.view, c, { ocean: c.seaShallow });
      drawLand(o, this.view, c, this.map.land, { fill: c.elevLow, stroke: earthColour(c, 'grassDark') });
      drawIndia(o, this.view, c, this.map.india, { fill: c.elevMid, stroke: earthColour(c, 'ink'), lineWidth: 1.8, credit: false });
      drawGlobeShade(o, this.view, c);
      if (s === 5) {
        const net = this.map.plates;
        o.save();
        o.lineCap = 'round'; o.lineJoin = 'round';
        o.beginPath();
        for (const f of net.features) this.view.path.context(o)(f);
        o.strokeStyle = earthColour(c, 'ink'); o.lineWidth = 7; o.stroke();
        o.strokeStyle = c.magma; o.lineWidth = 3.4; o.stroke();
        o.restore();
      }
    });
  }

  /** The cut quarter. on(name) -> 1 lit, 0.3 dim. */
  _cut(ctx, c, on, u) {
    const sector = (r, col, a = 1) => {
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R * r, A0, A1); ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
      ctx.globalAlpha = 1;
    };
    ctx.save();
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R * Math.max(0.02, u), A0, A1); ctx.closePath(); ctx.clip();
    const dim = (k, col) => mix(col, c.bgSurface, 1 - on(k));
    sector(RAD.crust, dim('crust', earthColour(c, 'ink')));
    sector(RAD.mantle, dim('mantle', mix(c.magma, c.strata3, 0.55)));
    sector(0.84, dim('mantle', mix(c.magma, c.strata3, 0.34)));
    sector(0.68, dim('mantle', mix(c.magma, c.gold, 0.1)));
    sector(RAD.outer, dim('outer', mix(c.magma, c.gold, 0.5)));
    sector(RAD.outer * 0.72, dim('outer', mix(c.magma, c.gold, 0.68)));
    sector(RAD.inner, dim('inner', mix(c.gold, c.elevPeak, 0.34)));
    sector(RAD.inner * 0.6, dim('inner', mix(c.gold, c.elevPeak, 0.74)));
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(CX + Math.cos(A0) * R, CY + Math.sin(A0) * R); ctx.lineTo(CX, CY); ctx.lineTo(CX + Math.cos(A1) * R, CY + Math.sin(A1) * R); ctx.stroke();
    ctx.restore();
  }

  _row(ctx, c, k, a, name, val) {
    const r = { ...ROW[k], ...(name ? { name, val } : {}) }, px = CX + Math.cos(r.ang) * R * r.r, py = CY + Math.sin(r.ang) * R * r.r;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(SIDE_X - 56, r.y); ctx.stroke();
    ctx.fillStyle = earthColour(c, 'ink');
    ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill();
    ctx.restore();
    pill(ctx, c, r.name, SIDE_X + 34, r.y, { bg: earthColour(c, 'ink'), ink: earthColour(c, 'snow'), size: 27, display: true, alpha: a });
    ctx.save();
    ctx.globalAlpha = a; ctx.font = font(c, 700, 25); ctx.textAlign = 'center'; ctx.fillStyle = c.label;
    ctx.fillText(r.val, SIDE_X + 34, r.y + 46);
    ctx.restore();
  }

  /** Three round windows on real kinds of landform. No place is claimed by the drawing. */
  _landforms(ctx, c, t) {
    const win = (x, y, r, name, paint) => {
      const k = outBack(clamp01((this.age - t) / 0.5));
      ctx.save();
      ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
      drawEarthSky(ctx, c, x - r, y - r, r * 2, r * 2);
      paint(x, y, r);
      ctx.restore();
      ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
      ctx.restore();
      pill(ctx, c, name, x, y + r + 2, { bg: earthColour(c, 'ink'), ink: earthColour(c, 'snow'), size: 26, display: true, scale: k });
    };
    win(566, 74, 62, 'Mountain', (x, y, r) => {
      const m = roughen([[x - r - 10, y + r], [x - 10, y - r * 0.6], [x + r + 10, y + r]], { amp: 5, seed: 3, step: 16 });
      drawRock(ctx, c, m, { seed: 4, cracks: 4, bandH: 18, grain: false });
      drawSnow(ctx, c, [[x - 10, y - r * 0.6], [x + 18, y - r * 0.12], [x + 2, y - r * 0.2], [x - 12, y - 4], [x - 24, y - r * 0.2], [x - 36, y - r * 0.14]], { shade: false });
    });
    win(566, 226, 62, 'Valley', (x, y, r) => {
      drawRock(ctx, c, [[x - r, y - r * 0.4], [x - 12, y + r * 0.55], [x - 12, y + r], [x - r, y + r]], { seed: 6, cracks: 2 });
      drawRock(ctx, c, [[x + r, y - r * 0.5], [x + 12, y + r * 0.55], [x + 12, y + r], [x + r, y + r]], { seed: 8, cracks: 2 });
      drawWater(ctx, c, [[x - 15, y + r * 0.52], [x + 15, y + r * 0.52], [x + 18, y + r], [x - 18, y + r]], { ripples: 2, deep: 0.1 });
      drawTree(ctx, c, x - 50, y - 12, 0.5, { kind: 'pine' });
      drawTree(ctx, c, x + 48, y - 16, 0.5, { kind: 'pine' });
    });
    win(566, 378, 62, 'Coast', (x, y, r) => {
      drawWater(ctx, c, [[x - r, y + 2], [x + r, y + 2], [x + r, y + r], [x - r, y + r]], { deep: 0.3, ripples: 4 });
      drawRock(ctx, c, roughen([[x + r, y - r * 0.5], [x + 4, y - r * 0.44], [x - 8, y + 22], [x + r, y + r]], { amp: 4, seed: 2, step: 18 }), { seed: 5, bands: ['strata2', 'strata1', 'strata3'], bandH: 15, cracks: 3 });
      drawGrass(ctx, c, x + 10, y - r * 0.46, x + r, y - r * 0.5, { seed: 3, n: 7 });
    });
  }

  _credit(ctx, c) { pill(ctx, c, CREDIT_INDIA, 340, 496, { size: 29, bg: earthColour(c, 'ink'), ink: earthColour(c, 'snow') }); }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'stars');
    if (!this.view) return;
    const s = this._beat;
    this._globe(ctx, c, s === 5 ? 5 : 0);
    const open = s >= 1 && s !== 5;
    const u = open ? outBack(clamp01(this.age / 0.6)) : 0;
    const lit = this.tl.any() ? this.tl.lit() : LIT[s];
    const on = (k) => {
      if (!lit) return s === 4 && k !== 'crust' && k !== 'mantle' ? 0.45 : 1;
      if (lit.includes(k)) return 1;
      if ((k === 'outer' || k === 'inner') && lit.includes('core')) return 1;
      return 0.32;
    };
    if (open) this._cut(ctx, c, on, u);
    if (s === 0) this._landforms(ctx, c, 0.15);
    if (s === 1) {
      ctx.save();
      ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 3; ctx.setLineDash([12, 9]);
      for (const [a, b, k] of [[-1.3, 0.3, 0.42], [-1.15, 0.12, 0.3], [-1.38, 0.38, 0.6]]) {
        const m = (a + b) / 2;
        ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R);
        ctx.quadraticCurveTo(CX + Math.cos(m) * R * k, CY + Math.sin(m) * R * k, CX + Math.cos(b) * R, CY + Math.sin(b) * R);
        ctx.stroke();
      }
      ctx.restore();
      const px = CX + Math.cos(-1.32) * R, py = CY + Math.sin(-1.32) * R;
      ctx.save(); ctx.fillStyle = earthColour(c, 'ink'); ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill(); ctx.restore();
      pill(ctx, c, 'Deepest hole: 12 km', 545, 70, { bg: earthColour(c, 'ink'), ink: earthColour(c, 'snow'), size: 26, display: true });
      pill(ctx, c, 'Centre: 6375 km', 545, 150, { bg: earthColour(c, 'ink'), ink: earthColour(c, 'snow'), size: 26, display: true });
      pill(ctx, c, 'Earthquake waves', 556, 300, { bg: c.warning, size: 26, display: true });
    }
    if (s === 2 || s === 3) for (const k of Object.keys(ROW)) {
      const row = on(k) > 0.5 ? 1 : 0.34;
      if (s === 2 && k === 'inner') continue;
      if (s === 2 && k === 'outer') { this._row(ctx, c, k, 1, 'Core', 'hot and heavy'); continue; }
      this._row(ctx, c, k, row);
    }
    if (s === 4) {
      pill(ctx, c, 'Rigid shell', 548, 90, { bg: earthColour(c, 'ink'), ink: earthColour(c, 'snow'), size: 27, display: true });
      pill(ctx, c, 'Hot, soft layer', 548, 170, { bg: c.magma, ink: earthColour(c, 'ink'), size: 27, display: true });
      pill(ctx, c, 'Outer core: fluid', 548, 290, { bg: c.gold, ink: earthColour(c, 'ink'), size: 26, display: true });
    }
    if (s === 5) pill(ctx, c, 'Plate lines', 560, 110, { bg: c.magma, ink: earthColour(c, 'ink'), size: 28, display: true });
    this._credit(ctx, c);
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
