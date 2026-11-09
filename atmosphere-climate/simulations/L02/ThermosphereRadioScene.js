// ThermosphereRadioScene - the curved Earth under the thermosphere. Two chips:
//   Sun's rays   X-rays and short-wave ultraviolet stop in the thermosphere; a thermometer beside it reads rising
//   Radio waves  a mast sends a wave up; the ionosphere reflects it back to a far mast past the curve of the Earth
// Beat 0 lights the rays, beat 1 the radio. Drawn to show the idea: the height is not to scale.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SKY_COLOR_MAP, svgEarthEdge, svgSun, svgSunGlow, svgSkyColour as sc } from '../shared/SkyArt.js';
import { col, words, skyFrame, SKY_WHITE } from '../L01/AirBits.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'rays', label: "Sun's rays", targets: ['rays'], tone: 5 },
  { id: 'radio', label: 'Radio waves', targets: ['radio'], tone: 2 },
];

export class ThermosphereRadioScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 430;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'The curved Earth with the thermosphere high above it. X-rays and short-wave ultraviolet from the Sun stop in the thermosphere. A radio wave from one mast goes up, bounces off the ionosphere and comes down at a far mast beyond the curve of the Earth.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Show', chips: CHIPS, onChange: () => { if (!this.tl.lit().length) this.tl.set({ lit: this.stepIndex ? 'radio' : 'rays' }); this.repaint(); } });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() { return `.svs { padding: 6px; }
.tr-w { stroke-dasharray: 700; stroke-dashoffset: 700; animation: tr-w 1.8s ease forwards; }
@keyframes tr-w { to { stroke-dashoffset: 0; } }`; }

  enter(step) { this._fresh = true; this.tl.set({ lit: step ? 'radio' : 'rays' }); }

  stageHeight(st) { return st.portrait ? 360 : 350; }

  _mast(x, y, s, a) {
    const m = sc('metalDark');
    return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M-16 0L0 -74L16 0M-10 -24H10M-6 -48H6M-16 0L8 -36M16 0L-8 -36" ${stroke(m, 4.5)}/><circle cx="0" cy="-78" r="7" ${fill(sc('liquid'))}/></g>`;
  }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, top = H * 0.72, R = P ? 420 : 620, band0 = 66, band1 = H * 0.36;
    const edge = (x) => top + R - Math.sqrt(R * R - (x - W / 2) ** 2);
    const rays = this.tl.has('rays'), fresh = this._fresh;
    let b = `<defs>${svgSunGlow('tr-g')}</defs>`;
    b += `<rect x="0" y="${band0}" width="${W}" height="${band1 - band0}" ${fill(col(8), 'opacity:0.42')}/><path d="M0 ${band1}H${W}" ${stroke(SKY_WHITE, 2.5, 'stroke-dasharray:9 8')}/>`;
    b += words(14, band1 - 12, rays ? 'Thermosphere' : 'Ionosphere', { size: 21, display: true, ink: SKY_WHITE });
    b += words(14, band1 + 24, '80 km', { size: 15, ink: SKY_WHITE });
    b += `<circle cx="${W - 40}" cy="30" r="70" style="fill:url(#tr-g)"/>${svgSun(W - 40, 30, 0.54)}`;
    b += svgEarthEdge(W / 2, top, 1, { w: W + 40, h: H - top + 6, R, seed: 12 });
    if (rays) {
      [0.54, 0.66, 0.78, 0.9].forEach((u, i) => {
        const x = W * u, end = band0 + 34 + (i % 2) * 34, sx = W - 40, sy = 30;
        b += `<path d="M${sx} ${sy}L${x} ${end}" class="${fresh ? 'tr-w' : ''}" ${stroke(col(i % 2 ? 5 : 7), 5)}/><circle cx="${x}" cy="${end}" r="7" ${fill(col(8), 'stroke:var(--sim-bg-surface);stroke-width:2')}/>`;
      });
      b += words(W / 2, band1 + 58, 'X-rays and short-wave', { anchor: 'middle', size: 16, ink: SKY_WHITE }) + words(W / 2, band1 + 80, 'ultraviolet stop up here', { anchor: 'middle', size: 16, ink: SKY_WHITE });
    } else {
      const rt = (x) => Math.asin((x - W / 2) / R), hd = 72, ax0 = W * 0.14, ax1 = W * 0.86, x0 = ax0 + Math.sin(rt(ax0)) * hd, x1 = ax1 + Math.sin(rt(ax1)) * hd, y0 = edge(ax0) + 6 - Math.cos(rt(ax0)) * hd, y1 = edge(ax1) + 6 - Math.cos(rt(ax1)) * hd, ty = band0 + 40;
      // A wave from the mast to the reflecting layer and down to a far mast: a wavy line, not a beam.
      const wave = (a, c, n) => { let d = `M${a[0]} ${a[1]}`; for (let i = 1; i <= n; i += 1) { const u = i / n, x = a[0] + (c[0] - a[0]) * u, y = a[1] + (c[1] - a[1]) * u, s = (i % 2 ? 1 : -1) * 9; d += `L${(x + s).toFixed(1)} ${(y).toFixed(1)}`; } return d; };
      const mid = [W / 2, ty];
      const d = wave([x0, y0], mid, 18) + wave(mid, [x1, y1], 18).replace(/^M[^L]+/, '');
      b += `<path d="${d}" class="${fresh ? 'tr-w' : ''}" ${stroke(col(2), 4.5)}/>`;
      b += words(W / 2, band0 + 24, 'reflected', { anchor: 'middle', size: 15, ink: SKY_WHITE });
    }
    const ax = W * 0.14, bx = W * 0.86, rot = (x) => Math.asin((x - W / 2) / R) * 180 / Math.PI;
    b += this._mast(ax, edge(ax) + 6, 0.92, rot(ax)) + this._mast(bx, edge(bx) + 6, 0.92, rot(bx));
    this._fresh = false;
    return { svg: skyFrame(st, 'tr', 70, 120, b) };
  }
}
