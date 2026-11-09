// StratosphereJobScene - the sky from the ground to 55 km, on a true height scale. Three beats:
//   0 aeroplane just above the tropopause, clouds and storm below it
//   1 ozone layer with ultraviolet arrows: most stop in it, one faint arrow goes on
//   2 the band warms: a warm glow, and a thermometer pair at two heights
// A chip lights a part. No face on anything. Plane height: PLAN section 2, about 11 to 12 km.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SKY_COLOR_MAP, svgCloud, svgHills, svgSun, svgAeroplane, svgRain, svgThermometer, svgSkyColour as sc } from '../shared/SkyArt.js';
import { col, words, skyFrame, SKY_WHITE, SKY_INK, OZONE_TONE } from '../L01/AirBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'fly', label: 'Clear air', targets: ['plane'], tone: 1 },
  { id: 'oz', label: 'Ozone layer', targets: ['ozone'], tone: OZONE_TONE },
  { id: 'warm', label: 'Warmer air', targets: ['warm', 'ozone'], tone: 8 },
];
const KM_TOP = 56;

export class StratosphereJobScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 430;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 540;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'The sky from the ground to about 55 kilometres. Clouds and rain stay below the tropopause at 12 kilometres. An aeroplane cruises just above them. Higher up a layer of ozone stops most of the Sun\'s ultraviolet rays and warms the air.';
  static CONTROLS = [];

  tl = tapLight({ label: 'The stratosphere', chips: CHIPS, onChange: () => this.repaint() });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() { return `.svs { padding: 6px; }
.sj-uv { stroke-dashoffset: 300; animation: sj-uv 1.1s ease forwards; animation-delay: var(--d, 0s); }
@keyframes sj-uv { to { stroke-dashoffset: 0; } }`; }

  enter(step) { this._fresh = true; this.tl.set({ lit: ['fly', 'oz', 'warm'][step] }); }

  stageHeight(st) { return st.portrait ? 390 : 350; }

  _y(st, km) { const b = st.H - 16; return b - km * (b - 6) / KM_TOP; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, y = (k) => this._y(st, k), lit = (t) => !this.tl.any() || !this.tl.off(t);
    const showOz = lit('ozone'), showPlane = lit('plane'), showWarm = lit('warm') && this.tl.any();
    let b = svgHills(-10, H - 4, 1, { w: W + 20, h: 60, seed: 3, peaks: 4, far: true })
      + `<rect x="0" y="${H - 16}" width="${W}" height="16" ${fill(sc('grass'))}/>`;
    b += svgRain(W * 0.68, y(3.4), 1, { w: 80, h: y(0) - y(3.4) - 2, seed: 4, t: 0.4 });
    b += svgCloud(W * 0.68, y(3.4), P ? 0.72 : 0.9, { seed: 8, kind: 'rain' }) + svgCloud(W * 0.26, y(1.6), 0.56, { seed: 6 }) + svgCloud(W * 0.9, y(2.2), 0.5, { seed: 4 });
    b += `<path d="M0 ${y(12)}H${W}" ${stroke(SKY_WHITE, 2.5, 'stroke-dasharray:9 8')}/>`;
    b += words(W - 12, y(12) - 8, '12 km', { anchor: 'end', size: 16, display: true, ink: SKY_WHITE });
    b += words(14, y(12) + 22, 'weather stays below', { size: 15, ink: SKY_INK });
    // ozone layer: about 15 to 40 km in the drawing, thickest near 30 (book's tag)
    const oz = `<path d="M0 ${y(18)}Q${W / 2} ${y(15)} ${W} ${y(19)}V${y(41)}Q${W / 2} ${y(45)} 0 ${y(40)}Z" ${fill(col(OZONE_TONE), `opacity:${showWarm ? 0.72 : 0.56}`)}/>`;
    b += `<g style="opacity:${showOz ? 1 : 0.18}">${oz}${words(W / 2, y(30) + 8, 'ozone layer', { anchor: 'middle', size: 22, display: true, ink: SKY_WHITE })}</g>`;
    if (showWarm) {
      b += svgThermometer(W - 44, y(17), 0.46, { level: 0.25 }) + svgThermometer(W - 44, y(32), 0.46, { level: 0.75 });
      b += words(W - 70, y(36), 'warmer', { anchor: 'end', size: 16, display: true, ink: SKY_WHITE }) + words(W - 70, y(20), 'colder', { anchor: 'end', size: 16, display: true, ink: SKY_WHITE });
    }
    // ultraviolet
    if (showOz) {
      const fresh = this._fresh;
      (showWarm ? [0.1, 0.24] : [0.1, 0.24, 0.72]).forEach((u, i) => {
        const x = W * u, y1 = y(32 + (i % 2) * 5);
        b += `<path d="M${x + 22} ${y(56)}L${x} ${y1}" class="${fresh ? 'sj-uv' : ''}" ${stroke(col(5), 5, `stroke-dasharray:300;--d:${i * 0.12}s`)}/><circle cx="${x}" cy="${y1}" r="6" ${fill(col(OZONE_TONE))}/>`;
      });
      if (!showWarm) b += `<path d="M${W * 0.84 + 22} ${y(56)}L${W * 0.84 - 26} ${y(8)}" ${stroke(col(5), 3, 'stroke-dasharray:8 8;opacity:0.65')}/>`;
      b += words(W * 0.36, 26, 'ultraviolet', { size: 15, ink: SKY_WHITE });
    }
    b += svgSun(W - 34, 26, 0.5);
    b += `<g style="opacity:${showPlane ? 1 : 0.25}">${svgAeroplane(W * 0.5, y(14.4), P ? 0.72 : 0.9)}</g>`;
    this._fresh = false;
    return { svg: skyFrame(st, 'sj', 0, 80, b) };
  }
}
