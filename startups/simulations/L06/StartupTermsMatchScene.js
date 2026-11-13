import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { STARTUP_TERMS } from '../L04/StartupsDeck.js';

export class StartupTermsMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Startup terms: terms appear at the bottom; pop the bubble that matches each term to its definition.';
  static CONFIG = { ...STARTUP_TERMS, title: 'Startup terms', ask: 'Pop what matches', skin: 'bubbles', rounds: 12 };
}
