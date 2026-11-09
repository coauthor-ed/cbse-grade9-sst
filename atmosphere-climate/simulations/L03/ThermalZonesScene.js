// ThermalZonesScene - blk-l03-s03b. Fig 3.6 redrawn: a globe seen side on, so lines of latitude are
// straight and their heights are true (y = R sin lat). Five lines, then zones lit by chips.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, loadGeo, globe, sky, SKY_INK, windArrow, creditPlate, panel } from './AirDraw.js';

const LINES = [
  { lat: 66.5, name: 'Arctic Circle', deg: '66\u00bd\u00b0N' },
  { lat: 23.5, name: 'Tropic of Cancer', deg: '23\u00bd\u00b0N' },
  { lat: 0, name: 'Equator', deg: '0\u00b0' },
  { lat: -23.5, name: 'Tropic of Capricorn', deg: '23\u00bd\u00b0S' },
  { lat: -66.5, name: 'Antarctic Circle', deg: '66\u00bd\u00b0S' },
];
const ZONES = [
  { id: 'nf', from: 90, to: 66.5, t: 'frigid', col: 'var(--sim-series-1)', name: 'North Frigid Zone' },
  { id: 'nt', from: 66.5, to: 23.5, t: 'temperate', col: 'var(--sim-series-3)', name: 'North Temperate Zone' },
  { id: 'to', from: 23.5, to: -23.5, t: 'torrid', col: 'var(--sim-series-2)', name: 'Torrid Zone' },
  { id: 'st', from: -23.5, to: -66.5, t: 'temperate', col: 'var(--sim-series-3)', name: 'South Temperate Zone' },
  { id: 'sf', from: -66.5, to: -90, t: 'frigid', col: 'var(--sim-series-1)', name: 'South Frigid Zone' },
];
const CHIPS = [
  { id: 'torrid', label: 'Torrid', targets: ['torrid'], tone: 2 },
  { id: 'temperate', label: 'Temperate', targets: ['temperate'], tone: 3 },
  { id: 'frigid', label: 'Frigid', targets: ['frigid'], tone: 1 },
  { id: 'india', label: 'India', targets: ['india'], tone: 5 },
];
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const rad = (d) => d * Math.PI / 180;

export class ThermalZonesScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A globe with five lines of latitude and the temperature zones between them: the Torrid Zone between the tropics, a Temperate Zone on each side, and the Frigid Zones beyond the polar circles.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Temperature zones', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 420 : 420; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); this._g = await loadGeo(); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { this.tl.reset(); this.tl.set({ disabled: step === 0 }); const r = this.root.querySelector?.('.tl-row'); if (r) r.hidden = step === 0; this.relayout?.(); }

  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    const R = port ? 138 : 182, cx = port ? 150 : W * 0.42, cy = H / 2 - 4, lit = this.tl.chip()?.id;
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('seaDeep')}"/>`;
    const g = globe(this._g, cx, cy, R, { rotate: [-62, 0, 0], india: true });
    s += g.svg;
    const clip = 'zoneClip';
    s += `<defs><clipPath id="${clip}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath></defs>`;
    if (step === 1) {
      s += `<g clip-path="url(#${clip})">`;
      for (const z of ZONES) {
        const y0 = cy - R * Math.sin(rad(z.from)), y1 = cy - R * Math.sin(rad(z.to));
        const on = lit === z.t, dim = lit && lit !== z.t;
        s += `<rect x="${cx - R}" y="${y0}" width="${2 * R}" height="${y1 - y0}" style="fill:${z.col};opacity:${on ? 0.62 : dim ? 0.05 : 0.34}"/>`;
      }
      s += '</g>';
    }
    for (const l of LINES) {
      const y = cy - R * Math.sin(rad(l.lat)), hw = R * Math.cos(rad(l.lat));
      s += `<path d="M${cx - hw} ${y}H${cx + hw}" style="stroke:${sky('cloud')};stroke-width:${lit === 'india' && l.lat === 23.5 ? 5 : 2.5}"/>`;
      s += `<path d="M${cx + hw} ${y}H${port ? W - 96 : cx + R + 22}" style="stroke:${sky('cloud')};stroke-width:1.5;opacity:0.7"/>`;
      if (port) {
        s += tx(W - 6, y + 5, l.deg, { size: 15, anchor: 'end', col: sky('cloud') });
      } else {
        s += tx(cx + R + 28, y - 3, l.name, { size: 15, anchor: 'start', col: sky('cloud') }) + tx(cx + R + 28, y + 15, l.deg, { size: 15, anchor: 'start', col: sky('cloud'), weight: 700 });
      }
    }
    if (step === 1) {
      for (const z of ZONES) {
        const mid = (z.from + z.to) / 2, y = cy - R * Math.sin(rad(mid)), narrow = Math.abs(mid) > 60;
        const label = narrow ? 'Frigid' : z.id === 'to' ? 'Torrid Zone' : (z.id === 'nt' ? 'North Temperate' : 'South Temperate');
        const dim = lit && lit !== z.t && lit !== 'india';
        s += tx(cx, y + 6, label, { size: narrow ? 14 : 16, col: SKY_INK, halo: sky('cloud'), op: dim ? 0.35 : 1 });
      }
    }
    // sunlight: direct at the equator, low near the poles
    const ax = cx - R - (port ? 0 : 66);
    if (!port) {
      s += windArrow([[ax, cy], [cx - R - 6, cy]], { w: 9, col: sky('sun'), rim: sky('sunRay') });
      s += windArrow([[ax, cy - R * 0.86], [cx - R * 0.56, cy - R * 0.86]], { w: 6, col: sky('sun'), rim: sky('sunRay') });
      s += windArrow([[ax, cy + R * 0.86], [cx - R * 0.56, cy + R * 0.86]], { w: 6, col: sky('sun'), rim: sky('sunRay') });
      s += tx(16, cy - 20, 'most direct', { size: 15, anchor: 'start', col: sky('cloud') });
      s += tx(16, 26, 'low angle', { size: 15, anchor: 'start', col: sky('cloud') });
      s += tx(16, H - 18, 'low angle', { size: 15, anchor: 'start', col: sky('cloud') });
    }
    if (lit === 'india') {
      const w = port ? W - 20 : 250, x = port ? 10 : W - 262, y = port ? H - 58 : 12;
      s += panel(x, y, w, 48, { r: 12 }) + tx(x + w / 2, y + 20, 'South of the Tropic: Torrid', { size: 14 }) + tx(x + w / 2, y + 39, 'North of it: North Temperate', { size: 14 });
    }
    s += this._g ? creditPlate(W, H) : '';
    return { svg: s };
  }
}
