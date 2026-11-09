import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { CLIMATE_DATA_KEYS } from '../L01/AtmosphereClimateDeck.js';

// Which word goes with which meaning, range skin. Config only. Ten rounds from the deck's seven pairs.
export class StationMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Match the words: a word from the climate table waits at the counter; hit the target showing the meaning it goes with before it drops.';
  static CONFIG = { ...CLIMATE_DATA_KEYS, title: 'Match the words', ask: 'Hit the target that matches', skin: 'range', rounds: 10 };
}
