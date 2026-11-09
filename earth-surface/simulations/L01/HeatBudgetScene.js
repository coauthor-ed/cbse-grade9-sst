// HeatBudgetScene - after the book's fan of heat: a slice of the Earth from the centre to the surface,
// with the big arrow of total interior heat flow beside it. On this figure height shows SHARE of heat, not
// depth, and it says so. Conduction, convection and advection sit where the book draws them.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, font, outBack, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { EARTH_COLOR_MAP, earthColour, drawFlowArrow } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const AX = 420, AY = 640, R0 = 124, RT = 570, HALF = 0.42;
const BANDS = [
  { id: 'core', name: 'Core', pct: 22 },
  { id: 'lower', name: 'Lower mantle', pct: 32 },
  { id: 'upper', name: 'Upper mantle', pct: 22 },
  { id: 'crust', name: 'Crust', pct: 24 },
];
const CHIPS = [
  { id: 'conduction', label: 'Conduction', targets: ['conduction'] },
  { id: 'convection', label: 'Convection', targets: ['convection'] },
  { id: 'advection', label: 'Advection', targets: ['advection'] },
];
function edges() {
  let r = R0; const out = {};
  for (const b of BANDS) { const r1 = r + (RT - R0) * b.pct / 100; out[b.id] = [r, r1]; r = r1; }
  return out;
}
const E = edges();

export class HeatBudgetScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A slice of the Earth beside a large arrow of heat flow split into four shares: crust 24, upper mantle 22, lower mantle 32 and core 22 per cent. Arrows mark conduction, convection and advection.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];
  tl = tapLight({ label: 'Heat', chips: CHIPS, onChange: () => this.animateFor?.(300) });

  constructor(container, config) { super(container, config); this._s = 0; }
  enter(stage) { this._s = stage; this.tl.reset(); this.requestUiUpdate?.(); }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : super.getControlValue(id); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.animateFor?.(300); } }
  isControlHidden(id) { return id === 'lit' && this._s !== 2; }

  _band(ctx, r0, r1, col) {
    const a0 = -Math.PI / 2 - HALF, a1 = -Math.PI / 2 + HALF;
    ctx.beginPath(); ctx.arc(AX, AY, r1, a0, a1); ctx.arc(AX, AY, r0, a1, a0, true); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  }
  _p(r, ang) { return [AX + Math.sin(ang) * r, AY - Math.cos(ang) * r]; }

  _fan(ctx, c) {
    const rock = earthColour(c, 'rock');
    this._band(ctx, E.crust[0], E.crust[1], mix(rock, c.strata1, 0.34));
    this._band(ctx, E.upper[0], E.upper[1], mix(c.magma, c.strata3, 0.62));
    this._band(ctx, E.lower[0], E.lower[1], mix(c.magma, c.strata3, 0.34));
    this._band(ctx, E.core[0], E.core[1], mix(c.magma, c.gold, 0.5));
    this._band(ctx, 0, R0 + 42, mix(c.gold, c.elevPeak, 0.5));
    ctx.save();
    ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 3;
    for (const b of BANDS) { ctx.beginPath(); ctx.arc(AX, AY, E[b.id][1], -Math.PI / 2 - HALF, -Math.PI / 2 + HALF); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(...this._p(RT, -HALF)); ctx.lineTo(AX, AY); ctx.lineTo(...this._p(RT, HALF)); ctx.stroke();
    ctx.restore();
  }

  _shareArrow(ctx, c, grow) {
    const X = 18, W = 118, ink = earthColour(c, 'ink');
    const cols = { core: mix(c.magma, c.gold, 0.5), lower: mix(c.magma, c.strata3, 0.34), upper: mix(c.magma, c.strata3, 0.62), crust: mix(earthColour(c, 'rock'), c.strata1, 0.34) };
    ctx.save();
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.moveTo(X - 10, AY - RT - 2); ctx.lineTo(X + W / 2, AY - RT - 52); ctx.lineTo(X + W + 10, AY - RT - 2); ctx.closePath(); ctx.fill();
    for (const b of BANDS) {
      const [r0, r1] = E[b.id], y1 = AY - R0 - (r0 - R0) * grow, y0 = AY - R0 - (r1 - R0) * grow;
      ctx.fillStyle = cols[b.id]; ctx.fillRect(X, y0, W, y1 - y0);
      ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.strokeRect(X, y0, W, y1 - y0);
      if (grow > 0.98) {
        ctx.fillStyle = ink; ctx.font = font(c, 700, 40, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.pct + '%', X + W / 2, (y0 + y1) / 2);
      }
    }
    ctx.restore();
  }

  _ways(ctx, c, lit) {
    const ink = earthColour(c, 'ink'), hot = c.magma, cool = c.seaDeep;
    const al = (k) => (lit && !lit.includes(k) ? 0.14 : 1);
    // conduction: straight block arrows through solid rock, inner core and at the surface
    for (const [ang, r0, r1] of [[-0.12, R0 + 6, R0 + 40], [0.12, R0 + 6, R0 + 40], [-0.17, E.crust[0] + 14, E.crust[1] - 2], [0.17, E.crust[0] + 14, E.crust[1] - 2]]) {
      drawFlowArrow(ctx, c, ...this._p(r0, ang), ...this._p(r1, ang), { col: hot, w: 12, alpha: al('conduction') });
    }
    // convection: two loops in the mantle, two small ones in the outer core; hot up the middle, cool down the sides
    const loop = (rA, rB, a0, a1, w) => {
      drawFlowArrow(ctx, c, ...this._p(rA, a0), ...this._p(rB, a0), { col: hot, w, alpha: al('convection'), bend: a0 < a1 ? -6 : 6 });
      drawFlowArrow(ctx, c, ...this._p(rB + 8, a0 + (a1 - a0) * 0.2), ...this._p(rB + 8, a1), { col: hot, w, alpha: al('convection'), bend: a0 < a1 ? -10 : 10 });
      drawFlowArrow(ctx, c, ...this._p(rB, a1), ...this._p(rA, a1), { col: cool, w, alpha: al('convection'), bend: a0 < a1 ? -6 : 6 });
    };
    loop(E.lower[0] + 20, E.upper[1] - 34, -0.05, -0.33, 10);
    loop(E.lower[0] + 20, E.upper[1] - 34, 0.05, 0.33, 10);
    loop(R0 + 46, E.core[1] - 18, -0.05, -0.34, 7);
    loop(R0 + 46, E.core[1] - 18, 0.05, 0.34, 7);
    // advection: magma zones near the top, each carrying heat up with it
    ctx.save();
    ctx.globalAlpha = al('advection');
    for (const ang of [-0.34, 0, 0.34]) {
      const [x, y] = this._p(E.crust[0] + 40, ang);
      ctx.fillStyle = hot; ctx.strokeStyle = ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, 26, 14, ang, 0, 7); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    for (const ang of [-0.34, 0, 0.34]) drawFlowArrow(ctx, c, ...this._p(E.crust[0] + 56, ang), ...this._p(RT + 24, ang), { col: c.warning, w: 7, alpha: al('advection') });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this._s, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    this._fan(ctx, c);
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { bg: ink, ink: snow, size: 26, display: true, ...o });
    if (s === 0) {
      const k = outBack(clamp01(this.age / 0.5));
      for (const ang of [-0.28, 0, 0.28]) drawFlowArrow(ctx, c, ...this._p(R0 + 30, ang), ...this._p(R0 + 30 + 380 * k, ang), { col: c.warning, w: 14 });
      tag('Heat left from when the Earth formed', 360, 34, { size: 25 });
      tag('Dots: radioactive rock', 186, 320, { size: 28 });
      ctx.save();
      ctx.fillStyle = earthColour(c, 'ink');
      for (let i = 0; i < 26; i++) {
        const ang = -0.38 + ((i * 37) % 26) / 25 * 0.76, r = 230 + ((i * 53) % 26) / 25 * 330;
        const [x, y] = this._p(r, ang);
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    if (s === 1) {
      this._shareArrow(ctx, c, clamp01(this.age / 0.6));
      for (const b of BANDS) {
        const [r0, r1] = E[b.id];
        tag(b.name, AX, AY - (Math.max(r0, R0 + 40) + r1) / 2, b.id === 'lower' ? { bg: c.gold, ink } : {});
      }
      tag('Height shows share of heat, not depth', 402, 30, { bg: snow, ink, size: 28 });
    }
    if (s === 2) {
      this._ways(ctx, c, this.tl.any() ? this.tl.lit() : null);
      const k = this.tl.lit()?.[0];
      if (k) tag({ conduction: 'Rock stays put', convection: 'Hot rises, cool sinks', advection: 'Magma carries heat up' }[k], 112, 300, { bg: c.gold, ink, size: 22 });
    }
  }
  destroy() { this.tl.destroy(); super.destroy(); }
}
