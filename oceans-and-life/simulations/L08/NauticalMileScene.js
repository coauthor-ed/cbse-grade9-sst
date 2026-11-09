// NauticalMileScene - where the nautical mile comes from. Beat 0: a circle through the poles, one degree pulled out
// under a lens and cut into 60 minutes, one of them lit. Beat 1: the sum that gives about 1.85 km, and the exact 1,852 m.
// Beat 2: one ruler to true scale with two number lines; a slider moves a boat and both readings come from km().
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, panel, tag, sea, svgEarthDisc, svgPatrolShip, svgSeaColumn, svgWaveLine, skyRect, rangeControl, controlRow, rowBtn, bindActs, num, MUTED, SEA_INK } from './SeaDraw.js';
import { km, TERRITORIAL_NM, CONTIGUOUS_NM, EEZ_NM } from './MaritimeZones.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const STOPS = [TERRITORIAL_NM, CONTIGUOUS_NM, EEZ_NM];
const ACC = 'var(--sim-series-2)';

export class NauticalMileScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'One nautical mile is one minute of latitude. A circle through the poles has 21,600 minutes. A ruler shows the same distance in nautical miles and kilometres.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? (this.stepIndex === 2 ? 340 : 476) : (this.stepIndex === 2 ? 320 : 410); }
  async setup() {
    this.nm = TERRITORIAL_NM;
    await super.setup();
    this.rg = rangeControl(this, { id: 'nm', label: 'Distance', min: 0, max: EEZ_NM, step: 1, value: this.nm, show: (v) => `${v} NM`, onInput: (v) => { this.nm = v; this._row(); this.repaint(); } });
    this.row = controlRow(this);
    this._off = bindActs(this, (a) => { this.nm = +a; this.rg.set(this.nm); this._row(); });
    this.enter(this.stepIndex);
    this.repaint();
  }
  destroy() { this._off?.(); this.rg?.destroy(); super.destroy(); }
  _row() { if (this.row) this.row.innerHTML = this.stepIndex === 2 ? STOPS.map((n) => rowBtn(`${n} NM`, String(n), { pressed: this.nm === n })).join('') : ''; }
  enter(step) {
    if (!this.rg) return;
    this.nm = TERRITORIAL_NM; this.rg.set(this.nm); this.rg.hide(step !== 2); this._row();
    this.relayout?.();
  }
  _lens(cx, cy, R, step) {
    // One degree of the circle, drawn straight under a lens, with its 60 minutes.
    const x0 = cx - R + 16, x1 = cx + R - 16, w = x1 - x0, u = w / 60, y = cy + 2;
    let s = `<circle cx="${cx}" cy="${cy}" r="${R + 5}" style="fill:${SEA_INK}"/><circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--sim-bg-surface);stroke:${ACC};stroke-width:4"/>`;
    s += `<path d="M${num(x0)} ${y}H${num(x1)}" style="stroke:var(--sim-label);stroke-width:4"/>`;
    for (let i = 0; i <= 60; i++) { const big = i % 10 === 0; s += `<path d="M${num(x0 + i * u)} ${y - (big ? 14 : 7)}V${y + (big ? 14 : 7)}" style="stroke:var(--sim-label);stroke-width:${big ? 2.5 : 1.5}"/>`; }
    s += `<rect x="${num(x0 + 24 * u)}" y="${y - 20}" width="${num(Math.max(u, 7))}" height="40" rx="2" style="fill:${ACC};stroke:var(--sim-label);stroke-width:2"/>`;
    s += tx(cx, cy - R * 0.5, '1 degree = 60 minutes', { size: R > 110 ? 18 : 16, display: true, weight: 700 });
    s += tx(cx, cy + R * 0.42, step === 0 ? '1 minute' : '1 minute', { size: 17, col: 'var(--sim-label)' });
    s += tx(cx, cy + R * 0.42 + 22, step === 0 ? '= 1 nautical mile' : '= 1,852 m exactly', { size: 17, display: true, weight: 700 });
    return s;
  }
  _globe(st, step) {
    const P = st.portrait, W = st.W, H = st.H;
    const ex = P ? 112 : 178, ey = P ? 112 : 200, ER = P ? 100 : 152, lx = P ? W - 116 : 500, ly = P ? 356 : 200, LR = P ? 110 : 138;
    let s = skyRect('nmS', 0, 0, W, H, 8, 14, { r: 16 });
    s += svgEarthDisc(ex, ey, ER / 100);
    // the circle through the poles, and the degree slice
    s += `<ellipse cx="${ex}" cy="${ey}" rx="${num(ER * 0.3)}" ry="${ER}" style="fill:none;stroke:${sea('cloud')};stroke-width:3;stroke-dasharray:8 6"/>`;
    const a = -0.42, px = ex + Math.cos(a) * ER * 0.29, py = ey + Math.sin(a) * ER * 0.96;
    s += `<path d="M${num(px)} ${num(py)}L${lx - LR * 0.7} ${ly - LR * (P ? 0.72 : 0.7)}" style="stroke:${ACC};stroke-width:4;stroke-dasharray:3 6"/><circle cx="${num(px)}" cy="${num(py)}" r="7" style="fill:${ACC};stroke:${SEA_INK};stroke-width:2.5"/>`;
    s += this._lens(lx, ly, LR, step);
    const y = P ? H - 30 : H - 32, w = Math.min(W - 16, 520), t = step === 0 ? '360 x 60 = 21,600 minutes in a full circle' : '40,000 km / 21,600 = about 1.85 km';
    if (!P) { s += panel((W - w) / 2, y - 24, w, 44); s += tx(W / 2, y + 5, t, { size: 19, display: true, weight: 700 }); }
    else { s += tag(W / 2, 232, step === 0 ? '360 x 60 = 21,600 minutes' : '40,000 km / 21,600 = 1.85 km', { size: 16, col: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', rim: 'var(--sim-stroke)' }); }
    return s;
  }
  _ruler(st) {
    const W = st.W, H = st.H, P = st.portrait, x0 = P ? 22 : 40, x1 = W - (P ? 22 : 40), L = x1 - x0, x = x0 + (this.nm / EEZ_NM) * L, sy = 92;
    let s = skyRect('nmR', 0, 0, W, sy + 4, 0, 5, { r: 0 }) + svgSeaColumn(0, sy, 1, { w: W, h: 66, bands: 2, wave: 3 }) + svgWaveLine(0, sy, 1, { w: W, amp: 3 });
    s += svgPatrolShip(Math.max(x0 + 30, Math.min(x1 - 30, x)), sy + 3, P ? 0.36 : 0.46, {});
    const ry = sy + 92, pt = (n) => x0 + (n / EEZ_NM) * L;
    s += `<rect x="${x0 - 14}" y="${ry - 26}" width="${L + 28}" height="84" rx="10" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:2.5"/>`;
    s += `<rect x="${x0}" y="${ry + 10}" width="${num(x - x0)}" height="12" rx="4" style="fill:${ACC}"/>`;
    s += `<path d="M${x0} ${ry + 16}H${x1}" style="stroke:var(--sim-label);stroke-width:3"/>`;
    s += `<path d="M${x0} ${ry + 6}V${ry + 26}" style="stroke:var(--sim-label);stroke-width:2.5"/>`;
    for (const n of [100, ...STOPS]) {
      const nx = pt(n);
      s += `<path d="M${num(nx)} ${ry + 6}V${ry + 26}" style="stroke:var(--sim-label);stroke-width:2.5"/>`;
      s += tx(n === 12 ? nx - 4 : n === 24 ? nx + 6 : nx, ry - 4, String(n), { size: 15, anchor: n === EEZ_NM ? 'end' : 'middle' });
      s += tx(n === 12 ? nx + 3 : n === 24 ? nx + 6 : nx, ry + 46, String(km(n)), { size: 15, col: MUTED, anchor: n === EEZ_NM || n === 12 ? 'end' : n === 24 ? 'start' : 'middle' });
    }
    const ky = ry + 96;
    s += tx(W / 2, ky - 10, `${this.nm} NM = ${km(this.nm).toLocaleString('en-IN')} km`, { size: P ? 28 : 32, display: true, weight: 700 });
    s += tx(W / 2, ky + 14, 'top: nautical miles, bottom: km. Drawn to scale', { size: 15, col: MUTED, weight: 700 });
    return s;
  }
  paint(st) { return { svg: frame(st, this.stepIndex === 2 ? this._ruler(st) : this._globe(st, this.stepIndex)) }; }
}
