// ExosphereEscapeScene - the top of the air over the curved Earth. Dots thin out with height. Helium and hydrogen,
// the lightest, drift out into space; nitrogen and oxygen stay low (gravity holds them). Beat 1 removes the idea
// of a lid: the same picture, with a tag along the fade, and no line drawn anywhere.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { mulberry32 } from 'simulations/base/kit/SimLook.js';
import { SKY_COLOR_MAP, svgEarthEdge } from '../shared/SkyArt.js';
import { col, words, panel, skyFrame, SKY_WHITE } from '../L01/AirBits.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);

export class ExosphereEscapeScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 380;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'The curved Earth with air thinning into black space. Dots of nitrogen and oxygen stay near the Earth. Dots of helium and hydrogen drift up and away into space. There is no line where the air stops.';
  static CONTROLS = [];

  css() { return `.svs { padding: 6px; }
.ex-esc { animation: ex-esc 3.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ex-esc { from { transform: translate(var(--dx), var(--dy)); opacity: 0.3; } }`; }

  enter() { this._fresh = true; }

  stageHeight(st) { return st.portrait ? 360 : 360; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, top = H * 0.78, R = P ? 460 : 760, step = this.stepIndex;
    const edge = (x) => top + R - Math.sqrt(R * R - (x - W / 2) ** 2);
    const r = mulberry32(17);
    let dots = '';
    for (let i = 0; i < 150; i += 1) {
      const x = r() * W, h = (r() ** 3.4) * (top - 40);
      const y = edge(x) - 14 - h;
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" ${fill(col(r() < 0.78 ? 1 : 2))}/>`;
    }
    let lights = '';
    const fresh = this._fresh;
    [[0.2, 0.34, 4], [0.34, 0.2, 7], [0.5, 0.36, 4], [0.64, 0.2, 7], [0.78, 0.3, 4], [0.9, 0.42, 7], [0.09, 0.24, 7]].forEach(([a, b0, tone], i) => {
      const x = W * a, y = H * b0;
      lights += `<g class="${fresh ? 'ex-esc' : ''}" style="--dx:${(-(x - W / 2) * 0.1).toFixed(0)}px;--dy:${H * 0.3}px;--d:${(i * 0.12).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="7" ${fill(col(tone), 'stroke:var(--sim-bg-surface);stroke-width:2')}/><g transform="translate(${x} ${y}) rotate(${((x - W / 2) * 0.09).toFixed(0)})"><path d="M0 -12V-30" ${stroke(SKY_WHITE, 3.5)}/><path d="M-7 -28L0 -40L7 -28Z" ${fill(SKY_WHITE)}/></g></g>`;
    });
    let b = dots + lights + svgEarthEdge(W / 2, top, 1, { w: W + 40, h: H - top + 6, R, seed: 4 });
    if (step === 0) {
      b += panel(12, H * 0.5, 120, 62, { r: 12 }) + `<circle cx="28" cy="${H * 0.5 + 18}" r="7" ${fill(col(4))}/>${words(42, H * 0.5 + 24, 'helium', { size: 16 })}<circle cx="28" cy="${H * 0.5 + 43}" r="7" ${fill(col(7))}/>${words(42, H * 0.5 + 49, 'hydrogen', { size: 16 })}`;
      b += words(W / 2, 34, 'gravity is weak up here', { anchor: 'middle', size: 18, display: true, ink: SKY_WHITE });
    } else {
      b += words(W / 2, 34, 'no line where the air stops', { anchor: 'middle', size: 18, display: true, ink: SKY_WHITE });
    }
    this._fresh = false;
    return { svg: skyFrame(st, 'ex', 60, 120, b) };
  }
}
