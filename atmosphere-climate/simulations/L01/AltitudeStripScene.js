// AltitudeStripScene - the close of the air lesson: a column of air, dense at the ground and thinning
// upward, with a mark at 12 km, a thermometer at the foot, and a question mark at the top.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { mulberry32 } from 'simulations/base/kit/SimLook.js';
import { SKY_COLOR_MAP, svgLand, svgCloud, svgThermometer } from '../shared/SkyArt.js';
import { col, words, skyFrame, SKY_WHITE } from './AirBits.js';

export class AltitudeStripScene extends SvgScene {
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }]];
  static WIDTH = 560;
  static HEIGHT = 320;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'A tall column of air over the ground. Dots of gas crowd near the ground and thin out with height. A line marks 12 kilometres. A question mark sits at the top.';
  static CONTROLS = [];

  css() { return '.svs { padding: 6px; } .sim-dom-root--portrait.svs { padding: 2px 0; }'; }

  stageHeight(st) { return st.portrait ? 320 : 300; }

  paint(st) {
    const W = st.W, H = st.H, gy = H - 34, mark = H * 0.32, r = mulberry32(9);
    let body = svgLand(-4, gy, 1, { w: W + 8, h: 40, kind: 'plain' }) + svgCloud(W * 0.8, gy - 70, 0.8, { seed: 5 });
    let dots = '';
    for (let i = 0; i < 230; i += 1) {
      const y = gy - (r() ** 2.6) * (gy - 8), x = W * 0.16 + r() * W * 0.5, u = r();
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" ${fill(col(u < 0.78 ? 1 : 2))}/>`;
    }
    body += dots + `<path d="M0 ${mark}H${W}" ${stroke(SKY_WHITE, 3, 'stroke-dasharray:10 8')}/>`;
    body += words(W - 14, mark - 10, '12 km', { anchor: 'end', size: 22, display: true, ink: SKY_WHITE });
    body += words(W * 0.8, mark - 44 < 40 ? 56 : mark - 44, '?', { anchor: 'middle', size: 50, display: true, ink: SKY_WHITE });
    body += svgThermometer(44, gy - 20, 0.72, { level: 0.7 });
    return { svg: skyFrame(st, 'as', 0, 26, body) };
  }
}
