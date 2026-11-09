// OzoneNotGreenhouseScene - two different problems (L08 s03b, 2 beats). (0) a column of sky: chips light the
// ultraviolet stopped by the ozone layer high up, or the heat held low down. (1) a globe seen with Antarctica
// at the foot: the ozone shell is thin there and ultraviolet gets through. No faces.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgSun, svgLand, svgSkyGradient, svgSkyColour: sky } = SkyArt;
import { READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const UV = 'var(--sim-series-5)', HEAT = 'var(--sim-series-6)', OZ = 'var(--sim-series-7)';
const CHIPS = [{ id: 'uv', label: 'Ultraviolet', targets: ['uv'], tone: 5 }, { id: 'heat', label: 'Heat', targets: ['heat'], tone: 6 }];
const CSS = `svg .oz-txt { font: 600 15px var(--sim-font-display); }`;

export class OzoneNotGreenhouseScene extends SvgScene {
  static HEIGHT = 540;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'Ozone high in the sky stops ultraviolet rays; greenhouse gases lower down hold heat from the ground. A globe shows the ozone thin over Antarctica.';

  tl = tapLight({ label: 'Two kinds of ray', chips: CHIPS, onChange: () => this.repaint() });
  css() { return TAP_LIGHT_CSS + READ_CSS + CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 8px; }'; }
  stageHeight(st) { return st.portrait ? 350 : 350; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.set({ lit: 'uv' }); this._sync(); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { this.tl.set({ lit: step === 0 ? 'uv' : null }); this._sync(); }
  _sync() { const r = this.root?.querySelector?.('.tl-row'); if (r) r.style.display = this.stepIndex === 0 ? '' : 'none'; this.relayout?.(); }

  _column(st) {
    const W = st.W, H = st.H, g = H - 52, oz = 90, heat = this.tl.has('heat'), uv = this.tl.has('uv');
    const op = (on) => (on ? 1 : 0.22);
    let s = `<defs>${svgSkyGradient('oz', 0, 50)}<clipPath id="ozc"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs><g clip-path="url(#ozc)"><rect width="${W}" height="${H}" style="fill:url(#oz)"/>`;
    s += `<rect y="${oz - 16}" width="${W}" height="32" style="fill:${OZ};opacity:${uv ? 0.6 : 0.25}"/>`;
    s += svgLand(0, g, 1, { w: W, h: 60, kind: 'plain', seed: 3 }) + '</g>';
    s += `<g opacity="${op(uv)}">${svgSun(W - 50, 36, 0.42)}`;
    [0.2, 0.42, 0.62].forEach((u) => { const x = W * u; s += `<line x1="${x + 22}" y1="6" x2="${x}" y2="${oz - 22}" style="stroke:${UV};stroke-width:6;stroke-linecap:round"/><path d="M${x - 10} ${oz - 22}L${x + 8} ${oz - 26}L${x - 4} ${oz - 8}Z" style="fill:${UV}"/>`; });
    s += `</g><g opacity="${op(heat)}">`;
    for (let i = 0; i < 26; i++) { const x = (i * 71.3) % W, y = H * 0.5 + ((i * 29.7) % 54); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" style="fill:var(--sim-series-2);opacity:0.8"/>`; }
    [0.3, 0.55, 0.8].forEach((u) => { const x = W * u; s += `<path d="M${x} ${g}q10 -18 0 -36t0 -36t0 -22" style="fill:none;stroke:${HEAT};stroke-width:6;stroke-linecap:round"/><path d="M${x - 10} ${g - 94}L${x + 10} ${g - 94}L${x} ${g - 110}Z" style="fill:${HEAT}"/>`; });
    s += '</g>';
    const lab = (x, y, t, on) => `<text class="oz-txt" x="${x}" y="${y}" style="fill:${sky('ink')};paint-order:stroke;stroke:${sky('cloud')};stroke-width:3.5;opacity:${on ? 1 : 0.5}">${t}</text>`;
    s += lab(12, oz + 6, 'Ozone layer', uv) + lab(12, g + 26, 'Greenhouse gases are mixed through the air', heat);
    return s + `<rect width="${W}" height="${H}" rx="16" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;
  }

  _globe(st) {
    const W = st.W, H = st.H, cx = W / 2, cy = H * 0.46, R = Math.min(W, H) * 0.34, r2 = R + 18;
    const SKY = 'color-mix(in oklab, var(--sim-sea-deep) 62%, black)';
    let s = `<rect width="${W}" height="${H}" rx="16" style="fill:${SKY};stroke:var(--sim-stroke);stroke-width:3"/>`;
    const a0 = (120) * Math.PI / 180, a1 = (60) * Math.PI / 180;
    s += `<path d="M${cx + r2 * Math.cos(a0)} ${cy + r2 * Math.sin(a0)}A${r2} ${r2} 0 1 1 ${cx + r2 * Math.cos(a1)} ${cy + r2 * Math.sin(a1)}" style="fill:none;stroke:${OZ};stroke-width:13;stroke-linecap:round"/>`;
    s += `<path d="M${cx + r2 * Math.cos(a1)} ${cy + r2 * Math.sin(a1)}A${r2} ${r2} 0 0 1 ${cx + r2 * Math.cos(a0)} ${cy + r2 * Math.sin(a0)}" style="fill:none;stroke:${OZ};stroke-width:3;stroke-dasharray:4 8;opacity:0.9"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:${sky('sea')};stroke:${sky('cloud')};stroke-width:2"/>`;
    s += `<path d="M${cx - R * 0.5} ${cy + R * 0.86}A${R} ${R} 0 0 0 ${cx + R * 0.5} ${cy + R * 0.86}Q${cx} ${cy + R * 0.72} ${cx - R * 0.5} ${cy + R * 0.86}Z" style="fill:${sky('snow')}"/>`;
    [-0.24, 0.24].forEach((u) => { const x = cx + u * R * 1.4, y1 = cy + R * 0.92; s += `<line x1="${x + u * 60}" y1="${H - 4}" x2="${x}" y2="${y1 + 2}" style="stroke:${UV};stroke-width:6;stroke-linecap:round"/><circle cx="${x}" cy="${y1}" r="6" style="fill:${UV}"/>`; });
    const lab = (x, y, t) => `<text class="oz-txt" x="${x}" y="${y}" text-anchor="middle" style="fill:${sky('cloud')}">${t}</text>`;
    s += `<text class="oz-txt" x="${cx}" y="${cy + R * 0.7}" text-anchor="middle" style="fill:${sky('ink')}">Antarctica</text>` + lab(cx, 22, 'Ozone layer') + lab(cx, cy + 12, 'Earth') ;
    return s;
  }

  paint(st) {
    const step = this.stepIndex;
    const svg = step === 0 ? this._column(st) : this._globe(st);
    const card = step === 1 ? readCard('The ozone hole', 'thinner ozone, more ultraviolet')
      : this.tl.has('heat') ? readCard('Heat', 'held by greenhouse gases') : readCard('Ultraviolet', 'taken in by ozone in the stratosphere');
    return { svg, head: card };
  }
}
