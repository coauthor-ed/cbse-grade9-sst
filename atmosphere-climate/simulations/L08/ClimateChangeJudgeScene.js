import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { CLIMATE_CHANGE_KEYS } from '../L01/AtmosphereClimateDeck.js';

// True or false on climate change, swipe-card skin. Config only.
export class ClimateChangeJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'True or false: one claim about greenhouse gases, climate change or its causes at a time; swipe the card right for true, left for false.';
  menuDemo = undefined;   // the attract demo tilts a card, and its wrapped lines then read as overlapping
  static CONFIG = { ...CLIMATE_CHANGE_KEYS, title: 'True or false', skin: 'cards', rounds: 10 };
}