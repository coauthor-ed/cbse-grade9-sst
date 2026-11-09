// WarmSeaStormScene - a sea seen from above with a slider for how warm the surface is. Below about 26 C
// the clouds stay scattered; warmer, they gather into a spiral with an eye, turning anticlockwise (north
// of the Equator). A drawing, marked so on screen: the book's picture is a satellite photograph.
//   0 slider, starts cool   1 the storm at its fullest, eye named   2 same storm, naming list
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, rangeInput, bindRange, spiralClouds } from './SeaDraw.js';
import { svgWaveLine } from '../shared/SeaArt.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const T0 = 24, T1 = 30, READY = 26.5;

export class WarmSeaStormScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A drawing of the sea from above with a slider for sea surface temperature. When the sea is warm enough, clouds gather into a spiral around a calm eye, turning anticlockwise.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 470 : 440; }
  async setup() {
    this._t = 25; this._seen = false;
    await super.setup();
    this._off = bindRange(this, (id, v) => {
      this._t = v;
      if (v >= READY && !this._seen) { this._seen = true; this.after(0.2, () => this.celebrate(this._c?.[0], this._c?.[1])); }
    });
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  enter(step) { this._t = step === 0 ? 25 : 29; }
  /** 0 scattered, 1 a full storm. */
  _power() { return Math.max(0, Math.min(1, (this._t - 26) / 3)); }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, p = this._power();
    const R = port ? 150 : 172, cx = port ? W / 2 : W * 0.4, cy = port ? 186 : H / 2 + 4;
    this._c = [cx, cy];
    const warm = Math.round(10 + (this._t - T0) / (T1 - T0) * 26);
    const water = `color-mix(in oklab, color-mix(in oklab, ${sky('seaDeep')} ${100 - warm * 2}%, ${sky('sea')}) ${100 - warm / 2}%, ${sky('sun')})`;
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${water}"/>`;
    for (let i = 0; i < 9; i++) s += svgWaveLine(0, 24 + i * (H / 9), 1, { w: W, amp: 3, len: 90, t: i, foam: false, alpha: 0.16 });
    s += `<g class="${p > 0.05 ? 'air-spin' : ''}" style="transform-origin:${cx}px ${cy}px">${spiralClouds(cx, cy, R, p)}</g>`;
    if (p >= 0.6) s += `<circle cx="${cx}" cy="${cy}" r="${(R * 0.11).toFixed(1)}" style="fill:${water};stroke:${sky('cloudShade')};stroke-width:5"/>`;
    if (step >= 1 && p >= 0.6) {
      s += `<path d="M${cx + R * 0.1} ${cy - R * 0.1}L${cx + R * 0.52} ${cy - R * 0.62}" style="stroke:${sky('ink')};stroke-width:3"/>`;
      s += tx(cx + R * 0.56, cy - R * 0.66, 'the eye', { size: 18, anchor: 'start', col: sky('ink'), halo: sky('cloud'), haloW: 5, display: true, weight: 700 });
    }
    // anticlockwise arrow beside the storm
    if (p >= 0.6 && step === 1) {
      const ra = R + 2, a0 = 0.95 * Math.PI, a1 = 1.45 * Math.PI, xa = (a) => cx + Math.cos(a) * ra, ya = (a) => cy + Math.sin(a) * ra;
      s += `<path d="M${xa(a1)} ${ya(a1)}A${ra} ${ra} 0 0 0 ${xa(a0)} ${ya(a0)}" style="fill:none;stroke:${sky('white')};stroke-width:7;stroke-linecap:round"/>`;
      const hx = xa(a0), hy = ya(a0);
      s += `<path d="M${hx - 13} ${hy - 10}L${hx + 13} ${hy - 10}L${hx + 2} ${hy + 14}Z" style="fill:${sky('white')}"/>`;
    }
    let over = '';
    const tag = 'a drawing, not a photograph';
    if (port) {
      s += panel(10, 366, W - 20, H - 376, { r: 12 });
      if (step === 0 || step === 1) {
        s += tx(22, 392, 'Sea surface', { size: 15, anchor: 'start' }) + tx(W - 22, 396, `${this._t.toFixed(1)} °C`, { size: 26, anchor: 'end', display: true, weight: 700 });
        s += tx(W / 2, H - 16, this._t >= READY ? 'warm enough to feed a storm' : 'clouds stay scattered', { size: 15, col: 'var(--sim-label-muted)' });
        over += rangeInput(W / 2, 424, W - 48, 'temp', this._t, T0, T1, 0.5, 'Sea surface temperature in degrees Celsius');
      } else {
        s += tx(W / 2, 394, 'A list of 169 names', { size: 20, display: true, weight: 700 }) + tx(W / 2, 420, 'from 13 member countries', { size: 16 });
        s += tx(W / 2, 446, 'Biparjoy (2023), Remal (2024)', { size: 15, col: 'var(--sim-label-muted)' });
      }
      s += tx(14, 24, tag, { size: 14, anchor: 'start', col: sky('ink'), halo: sky('cloud'), weight: 700 });
    } else {
      const x = W - 196, w = 182;
      s += panel(x, 14, w, step === 2 ? 186 : 196, { r: 14 });
      if (step < 2) {
        s += tx(x + w / 2, 42, 'Sea surface', { size: 15, col: 'var(--sim-label-muted)' }) + tx(x + w / 2, 80, `${this._t.toFixed(1)} °C`, { size: 32, display: true, weight: 700 });
        s += tx(x + w / 2, 168, this._t >= READY ? 'warm enough' : 'too cool', { size: 16 }) + tx(x + w / 2, 190, this._t >= READY ? 'to feed a storm' : 'for a storm', { size: 16 });
        over += rangeInput(x + w / 2, 118, w - 24, 'temp', this._t, T0, T1, 0.5, 'Sea surface temperature in degrees Celsius');
      } else {
        s += tx(x + w / 2, 58, '169 names', { size: 26, display: true, weight: 700 }) + tx(x + w / 2, 84, 'from 13 countries', { size: 16 });
        s += tx(x + w / 2, 128, 'Biparjoy (2023)', { size: 16 }) + tx(x + w / 2, 154, 'Remal (2024)', { size: 16 });
      }
      s += tx(16, H - 16, tag, { size: 15, anchor: 'start', col: sky('ink'), halo: sky('cloud'), weight: 700 });
    }
    return { svg: s, over };
  }
}
