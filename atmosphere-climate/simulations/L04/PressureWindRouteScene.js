import { ArcadeRouteScene } from 'simulations/base/kit/ArcadeRouteScene.js';
import { PRESSURE_WIND_KEYS } from '../L01/AtmosphereClimateDeck.js';

// One key run as a road: is this a coast? Then is the land warmer than the sea (sea or land breeze);
// or is the air warm and rising (low or high pressure). Eight rounds.
export class PressureWindRouteScene extends ArcadeRouteScene {
  static ARIA_LABEL = 'Key run: each place rides the road through yes or no gates. A coast asks whether the land is warmer than the sea, to a sea breeze or a land breeze. Anywhere else asks whether the air is warm and rising, to low or high pressure.';
  static CONFIG = { ...PRESSURE_WIND_KEYS, title: 'Run the key', skin: 'road', rounds: 8 };
}
