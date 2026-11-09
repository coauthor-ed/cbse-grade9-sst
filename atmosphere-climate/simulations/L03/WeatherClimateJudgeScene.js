import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { CLIMATE_HUMIDITY_JUDGE } from '../L01/AtmosphereClimateDeck.js';

// True or false about weather, climate and humidity, two-doors skin. Config only:
// the engine draws the statement card, the two doors, the why cards and the boss round.
export class WeatherClimateJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'Weather or climate, the two doors: one statement about weather, climate or humidity at a time; open the true door or the false door before the candle burns down.';
  static CONFIG = { ...CLIMATE_HUMIDITY_JUDGE, title: 'True or false?', skin: 'doors', rounds: 8 };
}
