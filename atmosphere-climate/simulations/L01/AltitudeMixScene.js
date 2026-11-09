// AltitudeMixScene - three jars of air on one sky: sea level, 8 km on a mountain top, 50 km. The height
// scale is squeezed, and the dots are too: far fewer high up, not an exact count (a tag says so).
//   beat 0  fewer dots higher up: the air thins
//   beat 1  a bar under each jar: same shares at all three (true to about 100 km)
//   beat 2  vapour only low, ozone gathers in the stratosphere, the lightest gases at the very top
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { mulberry32 } from 'simulations/base/kit/SimLook.js';
import { SKY_COLOR_MAP, svgCloud, svgSkyColour as sc } from '../shared/SkyArt.js';
import { col, words, skyFrame, SKY_INK, SKY_WHITE, VAPOUR_TONE, OZONE_TONE, jarBack, jarFront } from './AirBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const JARS = [{ km: 0, label: 'Sea level', n: 96, vap: 7 }, { km: 8, label: '8 km', n: 34, vap: 1 }, { km: 50, label: '50 km', n: 5, vap: 0 }];

export class AltitudeMixScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'Three jars of air at sea level, on a mountain top at 8 km and high in the dark sky at 50 km. The jars hold fewer and fewer dots of gas. A bar under each jar shows the same shares of nitrogen, oxygen and argon. Water vapour stays low, and a band of ozone lies high up, in the stratosphere.';
  static CONTROLS = [];

  css() { return `.svs { padding: 6px; }
.am-in { animation: am-in 0.5s var(--look-spring-soft) both; animation-delay: var(--d, 0s); }
@keyframes am-in { from { opacity: 0; } }`; }

  enter() { this._fresh = true; }

  stageHeight(st) { return st.portrait ? 430 : 420; }

  _jar(j, i, x, y, s, step) {
    const r = mulberry32(31 + i * 7);
    let dots = '';
    for (let k = 0; k < j.n; k += 1) {
      const u = r();
      const tone = u < 0.78 ? 1 : u < 0.99 ? 2 : 5;
      dots += `<circle cx="${(x + 8 + r() * (s - 16)).toFixed(1)}" cy="${(y + 8 + r() * (s - 16)).toFixed(1)}" r="${s > 90 ? 4 : 3.4}" ${fill(col(tone))}/>`;
    }
    if (step === 2) for (let k = 0; k < j.vap; k += 1) dots += `<circle cx="${(x + 10 + r() * (s - 20)).toFixed(1)}" cy="${(y + s * 0.5 + r() * (s * 0.42)).toFixed(1)}" r="5.5" ${fill(col(VAPOUR_TONE), 'stroke:var(--sim-bg-surface);stroke-width:2')}/>`;
    let out = jarBack(x, y, s, s) + dots + jarFront(x, y, s, s);
    if (step === 1) {
      const bw = s + 6, bx = x - 3, by = y + s + 16;
      const a = bw * 0.78, b = bw * 0.21;
      out += `<g class="${this._fresh ? 'am-in' : ''}" style="--d:${0.15 + i * 0.25}s"><rect x="${bx}" y="${by}" width="${a}" height="15" ${fill(col(1))}/><rect x="${bx + a}" y="${by}" width="${b}" height="15" ${fill(col(2))}/><rect x="${bx + a + b}" y="${by}" width="${bw - a - b}" height="15" ${fill(col(5))}/><rect x="${bx}" y="${by}" width="${bw}" height="15" rx="3" ${stroke('var(--sim-bg-surface)', 2)}/></g>`;
    }
    return out;
  }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, s = P ? 80 : 92;
    const groundY = H - 42, top = 58;
    const y0 = groundY - s - 6, y2 = top, peakY = P ? H * 0.62 : H * 0.66, y1 = peakY - s - 18;
    const xs = P ? [18, W / 2 - s / 2 + 2, W - s - 22] : [W * 0.09, W * 0.42, W * 0.74];
    const pk = xs[1] + s / 2;
    let body = '';
    if (step === 2) {
      const b0 = y2 + 10, b1 = Math.max(b0 + 36, y1 - 66);
      body += `<rect x="0" y="${b0}" width="${W}" height="${b1 - b0}" ${fill(col(OZONE_TONE), 'opacity:0.5')}/>`;
      body += words(12, b1 - 12, 'ozone, in the stratosphere', { size: st.portrait ? 15 : 20, display: true, ink: SKY_WHITE });
      body += `<rect x="0" y="${groundY - 86}" width="${W}" height="86" ${fill(col(VAPOUR_TONE), 'opacity:0.32')}/>`;
    }
    body += `<path d="M${pk - 190} ${groundY + 2}L${pk - 70} ${peakY + 70}L${pk - 34} ${peakY + 36}L${pk} ${peakY}L${pk + 44} ${peakY + 50}L${pk + 88} ${peakY + 76}L${pk + 210} ${groundY + 2}Z" ${fill(sc('rock'))}/>`
      + `<path d="M${pk} ${peakY}L${pk + 44} ${peakY + 50}L${pk + 88} ${peakY + 76}L${pk + 210} ${groundY + 2}L${pk + 20} ${groundY + 2}Z" ${fill(sc('rockDark'))}/>`
      + `<path d="M${pk - 34} ${peakY + 36}L${pk} ${peakY}L${pk + 28} ${peakY + 32}L${pk + 10} ${peakY + 26}L${pk - 6} ${peakY + 40}L${pk - 16} ${peakY + 28}Z" ${fill(sc('snow'))}/>`;
    body += `<rect x="0" y="${groundY}" width="${W}" height="${H - groundY}" ${fill(sc('sea'))}/><rect x="0" y="${groundY + 18}" width="${W}" height="30" ${fill(sc('seaMid'))}/>`;
    body += svgCloud(P ? W * 0.82 : W * 0.86, peakY + 40, 0.7, { seed: 6 });
    const ys = [y0, y1, y2];
    JARS.forEach((j, i) => { body += this._jar(j, i, xs[i], ys[i], s, step); });
    const lab = (i, ink) => words(xs[i] + s / 2, ys[i] - 34 - (P ? 20 : 22), JARS[i].label, { anchor: 'middle', size: 18, display: true, ink });
    body += lab(0, SKY_WHITE) + lab(1, SKY_WHITE);
    body += P ? words(xs[2] + s / 2, ys[2] + s + (step === 1 ? 52 : 32), JARS[2].label, { anchor: 'middle', size: 18, display: true, ink: SKY_WHITE }) : words(xs[2] - 12, ys[2] + s / 2 + 6, JARS[2].label, { anchor: 'end', size: 18, display: true, ink: SKY_WHITE });
    if (step === 0) body += words(W / 2 - (P ? 42 : 0), top - 18, 'fewer gas dots higher up', { anchor: 'middle', size: 15, ink: SKY_WHITE });
    if (step === 2) {
      body += words(14, 28, 'lightest gases: very top', { size: 15, ink: SKY_WHITE });
      body += words(W - 14, groundY - 12, 'water vapour', { anchor: 'end', size: 16, ink: SKY_INK });
    }
    this._fresh = false;
    return { svg: skyFrame(st, 'am', 0, 90, body) };
  }
}
