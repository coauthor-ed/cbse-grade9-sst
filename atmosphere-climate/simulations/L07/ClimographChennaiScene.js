// ClimographChennaiScene - Chennai's graph (L07 s08, 3 beats). (0) October and November lit: 65.6 of 128.6 cm.
// (1) still Chennai, with a picker: Thiruvananthapuram and the rest by the learner's choice. (2) Chennai's temperature swing. Scales are
// chosen for each station so no bar is cut.
import { ClimographBuildScene } from './ClimographBuildScene.js';
import { readCard } from '../L06/IndiaMapSvg.js';

export class ClimographChennaiScene extends ClimographBuildScene {
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static ARIA_LABEL = 'A graph of Chennai: bars of rainfall for each month and a line of temperature. The tallest bars are October and November.';

  startId() { return 'chennai'; }
  pickStep() { return 1; }
  lit(step) { return step === 2 ? null : [9, 10]; }
  scales(s) { return { tMin: Math.min(0, -10 * Math.ceil(-Math.min(...s.temp) / 10)), tMax: 40, rMax: Math.max(40, 10 * Math.ceil(Math.max(...s.rain) / 10)), tStep: 10, rStep: 10 }; }
  card(s, step) {
    if (step === 0) return readCard('65.6 of 128.6 cm', 'October and November, just over half');
    if (step === 1) return s.id === 'chennai' ? readCard('Chennai', '30.6 cm in October, 35.0 cm in November') : s.id === 'thiruvananthapuram' ? readCard('Thiruvananthapuram', '27.3 cm in October, 20.6 cm in November') : readCard(s.name, `${s.total.toFixed(1)} cm a year`);
    return readCard('24.5 to 33.0 °C', 'Chennai changes by 8.5 °C across the year');
  }
}
