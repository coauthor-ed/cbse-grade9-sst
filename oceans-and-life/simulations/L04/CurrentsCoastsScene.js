// CurrentsCoastsScene - the map of currents with the beats for coast temperature: the Atlantic pair, the
// pair off Japan, then the Humboldt (Peru) Current cooling South America's coast.
import { CurrentsWorldMapScene } from './CurrentsWorldMapScene.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

export class CurrentsCoastsScene extends CurrentsWorldMapScene {
  static ARIA_LABEL = 'A map of ocean currents, close to Norway and Canada, then Japan, then South America. Warm currents are red and cold currents are blue.';
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static STEP_STATE = {
    0: { view: 'atlantic', lit: 'gulf' },
    1: { view: 'japan', lit: 'kur' },
    2: { view: 'peru', lit: 'hum' },
  };
}
