// StationProfileScene - three pairs of stations, two climate graphs side by side or stacked, one pair per beat
// (L07 s05). Scales match within a pair, so heights compare fairly. (0) Thiruvananthapuram and Nagpur;
// (1) Chennai and Kolkata; (2) Shillong and Leh. Values are the table's. Tags give each station's swing.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { stationOf, climoSvg } from './StationData.js';

const PAIRS = [
  { a: 'thiruvananthapuram', b: 'nagpur', o: { tMin: 0, tMax: 40, rMax: 40, tStep: 10, rStep: 10 }, ta: '26.2 to 28.7 °C', tb: '20.7 to 35.5 °C' },
  { a: 'chennai', b: 'kolkata', o: { tMin: 0, tMax: 40, rMax: 40, tStep: 10, rStep: 10 }, ta: 'Wettest: Oct and Nov', tb: 'Wettest: Jul and Aug', la: [9, 10], lb: [6, 7] },
  { a: 'shillong', b: 'leh', o: { tMin: -10, tMax: 40, rMax: 50, tStep: 10, rStep: 10 }, ta: '225.3 cm a year', tb: '8.5 cm a year' },
];
const CSS = `
.sp-key { font: 700 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
`;

export class StationProfileScene extends SvgScene {
  static HEIGHT = 430;
  static PORTRAIT_HEIGHT = 615;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'Two climate graphs of a pair of stations: rainfall bars and a temperature line for each month.';

  css() { return CSS; }
  stageHeight(st) { return st.portrait ? 540 : 340; }

  paint(st) {
    const P = PAIRS[this.stepIndex], A = stationOf(P.a), B = stationOf(P.b), gap = 16, port = st.portrait;
    const w = port ? st.W : (st.W - gap) / 2, h = port ? (st.H - gap) / 2 : st.H;
    const one = (s, x, y, tag, lit) => {
      const title = `<text x="${x + w / 2}" y="${y + 18}" text-anchor="middle" style="font:600 17px var(--sim-font-display);fill:var(--sim-label)">${s.name}</text>`
        + `<text x="${x + w / 2}" y="${y + 37}" text-anchor="middle" style="font:800 14px var(--sim-font);fill:var(--sim-label-muted)">${tag}</text>`;
      return title + climoSvg(s, { x, y: y + 40, w, h: h - 42 }, { ...P.o, lit, grow: true });
    };
    const svg = one(A, 0, 0, P.ta, P.la) + one(B, port ? 0 : w + gap, port ? h + gap : 0, P.tb, P.lb);
    return { svg, head: '<span class="sp-key">Line: temperature (°C), left scale. Bars: rain (cm), right scale.</span>' };
  }
}
