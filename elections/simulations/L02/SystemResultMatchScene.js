import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { SYSTEM_RESULTS } from '../L01/ElectionsDeck.js';

// Rule to Result - match each count to what happens next.
export class SystemResultMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Rule to Result: a count waits at the bottom; tap the drifting bubble that says what happens next.';
  static CONFIG = { ...SYSTEM_RESULTS, title: 'Rule to Result', skin: 'bubbles', rounds: 6 };
  menuSample() { return ['FPTP', 'Majority system', 'PR'].map((name) => ({ name, art: false })); }
}
