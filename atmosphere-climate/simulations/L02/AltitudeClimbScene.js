// AltitudeClimbScene - the predict setup of the layers lesson. A weather balloon carries a thermometer up.
// The figure performs the sentence: it climbs from the ground to 12 km while the reading falls from 30 C to about
// -55 C, and stops there. Above 12 km nothing is shown: the answer is on the next slide, in AtmosphereLayersScene.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SKY_COLOR_MAP, svgCloud, svgHills, svgLand, svgBalloon, svgThermometer, thermometerY, svgSkyColour as sc } from '../shared/SkyArt.js';
import { words, panel, skyFrame, SKY_INK, SKY_WHITE } from '../L01/AirBits.js';

const CLIMB_S = 3.2, KM_TOP = 16;
const ease = (u) => u * u * (3 - 2 * u);

export class AltitudeClimbScene extends SvgScene {
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }]];
  static WIDTH = 560;
  static HEIGHT = 390;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'A weather balloon rises from the ground to 12 kilometres. Its thermometer falls from 30 degrees Celsius to about minus 55. The sky above 12 kilometres is left hidden.';
  static CONTROLS = [];

  css() { return '.svs { padding: 6px; } .sim-dom-root--portrait.svs { padding: 2px 0; }'; }

  async setup() {
    await super.setup();
    this.play(CLIMB_S);
  }

  stageHeight(st) { return st.portrait ? 390 : 370; }

  _y(st, km) { const b = st.H - 34; return b - km * (b - 8) / KM_TOP; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, g = H - 34, sx = P ? W - 118 : W - 168;
    let b = svgHills(-10, g + 2, 1, { w: W + 20, h: 90, far: true, seed: 7, peaks: 4 }) + svgLand(-4, g, 1, { w: W + 8, h: 40, kind: 'plain' })
      + svgCloud(W * 0.36, this._y(st, 2.4), 0.74, { seed: 3 }) + svgCloud(sx * 0.82, this._y(st, 5.2), 0.56, { seed: 7 });
    for (const k of [4, 8]) b += `<path d="M2 ${this._y(st, k)}h14" ${stroke(SKY_INK, 3)}/>${words(22, this._y(st, k) + 5, `${k} km`, { size: 15, ink: SKY_INK })}`;
    const y12 = this._y(st, 12);
    b += `<path d="M2 ${y12}H${W}" ${stroke(SKY_WHITE, 3, 'stroke-dasharray:10 8')}/>${words(22, y12 + 26, '12 km', { size: 20, display: true, ink: SKY_INK })}`;
    // Above 12 km: not shown yet.
    b += `<rect x="0" y="0" width="${W}" height="${y12 - 1.5}" ${fill(sc('inkSoft'), 'opacity:0.72')}/>`;
    b += words(W * 0.66, y12 / 2 + 15, '?', { anchor: 'middle', size: 44, display: true, ink: SKY_WHITE });
    // Instrument panel: the side of the stage, drawn once. Its liquid moves on the live layer.
    b += panel(sx, y12 + 12, P ? 106 : 150, g - y12 - 8);
    return { svg: skyFrame(st, 'ac', 0, KM_TOP, b) };
  }

  animate(st, t) {
    const u = ease(Math.min(1, t / CLIMB_S)), km = 12 * u, temp = Math.round(30 - 85 * u), L = this.live, P = st.portrait;
    const bx = P ? W2(st) : st.W * 0.36, by = this._y(st, km) - 79;
    const y12 = this._y(st, 12), g = st.H - 34, sx = P ? st.W - 118 : st.W - 168, pw = P ? 106 : 150;
    const level = (temp + 60) / 100;
    const k = Math.min(1.3, (g - y12 - 64) / 196), tx = sx + 30, ty = g - 26;
    const path = L.shape('bal', 'g', { html: svgBalloon(0, 0, 0.62, {}) });
    L.attrs(path, { transform: `translate(${bx.toFixed(1)} ${by.toFixed(1)})` });
    const ther = L.shape('ther', 'g', { html: svgThermometer(tx, ty, k, { level }) });
    L.attrs(ther, {});
    const ry = thermometerY(ty, k, 0.6), rx = sx + pw - 10, fin = temp <= -55;
    const read = L.shape('read', 'g', { html: (fin ? words(rx, ry - 42, 'about', { anchor: 'end', size: 15, ink: 'var(--sim-label)' }) : '') + words(rx, ry, fin ? '-55' : String(temp), { anchor: 'end', size: P ? 26 : 34, display: true, ink: 'var(--sim-label)' }) + words(rx, ry + 30, '\u00B0C', { anchor: 'end', size: 16, ink: 'var(--sim-label)' }) });
    L.attrs(read, {});
  }
}
const W2 = (st) => st.W * 0.3;
