import { ArcadeRouteScene } from 'simulations/base/kit/ArcadeRouteScene.js';
import { MONSOON_KEYS } from '../L01/AtmosphereClimateDeck.js';

// One key run as a rail line: the months first, then whether the wind has crossed the Bay of Bengal.
export class MonsoonRouteScene extends ArcadeRouteScene {
  static ARIA_LABEL = 'Monsoon line: each place and month rides the rail through signals. June to September is the south-west monsoon. In the other months, a wind that crossed the Bay of Bengal brings rain to the east coast, and elsewhere it is dry.';
  static CONFIG = { ...MONSOON_KEYS, title: 'Which monsoon?', skin: 'rail', rounds: 8 };
}
