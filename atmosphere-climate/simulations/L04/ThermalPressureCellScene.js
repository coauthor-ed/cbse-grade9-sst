// ThermalPressureCellScene - blk-l04-s04. A hot plain beside cool hills, in section. Air rises over
// the hot side and leaves a low with cloud; air sinks over the cold side and makes a high with
// clear sky; then the wind blows from high to low along the ground, and the upper air returns.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, skyTx, skyRect, sky, SKY_INK, windArrow, svgLand, svgHills, svgCloud, svgSun } from '../L03/AirDraw.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
function mark(x, y, t, col) {
  return `<circle class="air-in" cx="${x}" cy="${y}" r="30" style="fill:${col};stroke:${SKY_INK};stroke-width:4"/>` + tx(x, y + 15, t, { size: 42, display: true, weight: 700, col: sky('cloud') });
}
export class ThermalPressureCellScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A hot plain and cool hills side by side. Warm air rises over the plain, leaving low pressure and cloud. Cold air sinks over the hills, making high pressure and clear sky. Wind blows along the ground from the high to the low.';
  static CONTROLS = [];
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 440 : 420; }
  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex, g = H - 70, a = W * 0.27, b = W * 0.73;
    let s = skyRect('tpSky', 0, 0, W, H, 0, 8, { r: 18 });
    s += svgSun(50, 48, 0.55, {});
    s += svgLand(0, g, 1, { w: W * 0.54, h: H - g, kind: 'sand', seed: 3 });
    s += svgLand(W * 0.5, g, 1, { w: W * 0.5, h: H - g, kind: 'plain', seed: 4 });
    s += svgHills(W * 0.48, g + 4, 1, { w: W * 0.52, h: 96, seed: 5, snow: true });
    // shimmer of heat on the hot side
    if (step !== 1) for (let i = 0; i < 4; i++) { const x = a - 66 + i * 44; s += `<path class="air-flow" d="M${x} ${g - 4}q10 -14 0 -28q-10 -14 0 -28" style="fill:none;stroke:var(--sim-series-2);stroke-width:4;stroke-linecap:round;opacity:0.8"/>`; }
    const dim = (on) => (on ? 1 : 0);
    const low = step === 0 || step === 2, high = step === 1 || step === 2;
    s += `<g opacity="${dim(low)}">` + windArrow([[a, g - 54], [a, 118]], { w: 16, col: 'var(--sim-series-2)', flow: true });
    s += svgCloud(a, 104, 1.25, { seed: 3, kind: 'rain' }) + '</g>';
    s += `<g opacity="${dim(high)}">` + windArrow([[b, 62], [b, g - 96]], { w: 16, col: 'var(--sim-series-1)', flow: true }) + '</g>';
    if (step === 2) {
      s += windArrow([[b - 64, g - 34], [a + 54, g - 34]], { w: 15, col: sky('cloud'), flow: true });
      s += skyTx((a + b) / 2, g - 58, 'wind', { size: 22, display: true, weight: 700 });
      if (!st.portrait) s += windArrow([[a + 76, 52], [b - 50, 52]], { w: 8, col: sky('cloud'), op: 0.75 });
    }
    if (low) s += mark(a, g + 30, 'L', 'var(--sim-series-4)');
    if (high) s += mark(b, g + 30, 'H', 'var(--sim-series-1)');
    if (step === 0) s += skyTx(W * 0.68, 150, 'Warm air rises', { size: 19 }) + skyTx(W * 0.68, 174, 'low pressure, cloud', { size: 16, weight: 700 });
    if (step === 1) s += skyTx(W * 0.36, 140, 'Cold air sinks', { size: 19 }) + skyTx(W * 0.36, 164, 'high pressure,', { size: 16, weight: 700 }) + skyTx(W * 0.36, 186, 'clear sky', { size: 16, weight: 700 });
    return { svg: s };
  }
}
