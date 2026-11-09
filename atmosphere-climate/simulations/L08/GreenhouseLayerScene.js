// GreenhouseLayerScene - sunlight in, heat out, some held (L08 s01, 3 beats). (0) the working picture. (1) with
// and without greenhouse gases, chips; without: about -18 C, an iced ground. (2) more gas: more arrows back.
// No faces. Temperatures: about 15 C and about -18 C are Earth's average.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgSun, svgLand, svgHills, svgSea, svgThermometer, svgSkyGradient, svgSkyColour: sky } = SkyArt;
import { READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const HEAT = 'var(--sim-series-6)', LIGHT = sky('sunCore');
const CHIPS = [{ id: 'with', label: 'With greenhouse gases', targets: ['with'], tone: 3 }, { id: 'none', label: 'No greenhouse gases', targets: ['none'], tone: 1 }];
const wave = (x, y0, y1) => { let d = `M${x} ${y0}`; const n = 6, h = (y1 - y0) / n; for (let i = 1; i <= n; i++) d += `Q${x + (i % 2 ? 9 : -9)} ${(y0 + h * (i - 0.5)).toFixed(1)} ${x} ${(y0 + h * i).toFixed(1)}`; return d; };
const head = (x, y, up) => `<path d="M${x - 9} ${y}L${x + 9} ${y}L${x} ${y + (up ? -15 : 15)}Z" style="fill:${HEAT}"/>`;

export class GreenhouseLayerScene extends SvgScene {
  static HEIGHT = 540;
  static PORTRAIT_HEIGHT = 580;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'Sunlight passes through the air and warms the ground. Heat rises from the ground, and greenhouse gases send part of it back down.';

  tl = tapLight({ label: 'Greenhouse gases', chips: CHIPS, onChange: () => this.repaint() });
  css() { return TAP_LIGHT_CSS + READ_CSS; }
  stageHeight(st) { return st.portrait ? 340 : 350; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this._sync(); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { this.tl.set({ lit: step === 1 ? 'none' : null }); this._sync(); }
  _sync() { const r = this.root?.querySelector?.('.tl-row'); if (r) r.style.display = this.stepIndex === 1 ? '' : 'none'; this.relayout?.(); }

  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex, none = step === 1 && !this.tl.has('with'), more = step === 2, g = H - 62, band = H * 0.3;
    let svg = `<defs>${svgSkyGradient('gh', 0, 14)}<clipPath id="ghc"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs><g clip-path="url(#ghc)"><rect width="${W}" height="${H}" style="fill:url(#gh)"/>`;
    svg += `<g>${svgSun(66, 58, 0.62)}</g>`;
    if (!none) {
      const k = more ? 74 : 40;
      for (let i = 0; i < k; i++) { const x = (i * 83.7) % W, y = band - 26 + ((i * 37.3) % 52); svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${3 + (i % 3)}" style="fill:${i % 4 ? 'var(--sim-series-2)' : 'var(--sim-series-5)'};opacity:0.72"/>`; }
    }
    svg += svgHills(0, g + 2, 1, { w: W, h: 80, far: true, seed: 9, snow: none });
    svg += none ? `<rect y="${g}" width="${W}" height="${H - g}" style="fill:${sky('snow')}"/><rect y="${g + 24}" width="${W}" height="${H - g}" style="fill:${sky('snowShade')}"/>`
      : svgLand(0, g, 1, { w: W * 0.66, h: H - g, kind: 'plain', seed: 3 }) + svgSea(W * 0.66, g + 4, 1, { w: W * 0.34 + 4, h: H - g, t: 1 });
    svg += '</g>';
    for (let i = 0; i < 3; i++) { const x0 = 92 + i * 16, y0 = 78 + (2 - i) * 10, x1 = W * (0.34 + i * 0.16), y1 = g + 4; svg += `<line x1="${x0}" y1="${y0}" x2="${x1.toFixed(1)}" y2="${y1}" style="stroke:${LIGHT};stroke-width:9;stroke-linecap:round;opacity:0.95"/>`; }
    const xs = [W * 0.46, W * 0.66, W * 0.86];
    xs.forEach((x, i) => {
      const back = !none && (more || i === 1);
      svg += `<path d="${wave(x, g - 2, back ? band + 8 : 26)}" style="fill:none;stroke:${HEAT};stroke-width:5;stroke-linecap:round"/>`;
      svg += back ? head(x, band + 8, true) : head(x, 26, true);
      if (back) { svg += `<path d="${wave(x + 22, band + 6, g - 10)}" style="fill:none;stroke:${HEAT};stroke-width:4;stroke-linecap:round;opacity:0.85"/>` + head(x + 22, g - 12, false); }
    });
    svg += `<rect width="${W}" height="${H}" rx="16" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;
    svg += svgThermometer(30, H - 28, 0.78, { level: none ? 0.1 : more ? 0.68 : 0.52 });
    const card = step === 0 ? readCard('Some heat held', 'carbon dioxide, methane, nitrous oxide, water vapour')
      : step === 1 ? (none ? readCard('About -18 °C', "Earth's average with no greenhouse gases") : readCard('About 15 °C', "Earth's average with them"))
        : readCard('More gas, more heat held', 'less heat gets away');
    return { svg, head: card };
  }
}
