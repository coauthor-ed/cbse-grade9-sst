import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { TERM_TO_MEANING } from '../L01/PersonalFinancesDeck.js';

// Money words: a term waits at the bottom; tap the meaning that goes with it.
export class FinanceTermsMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Money words: a term waits at the bottom of the screen; tap the bubble holding the meaning that actually goes with it.';
  static CONFIG = { ...TERM_TO_MEANING, title: 'Money words', ask: 'Tap the meaning that matches', skin: 'bubbles', rounds: 12 };
}
