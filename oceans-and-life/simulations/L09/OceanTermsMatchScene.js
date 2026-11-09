import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { OCEAN_TERMS } from '../L01/OceansDeck.js';

// Fifteen names, matched to what each one is or does.
// Bubbles skin.
export class OceanTermsMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Ocean terms: a job waits at the bottom; pop the bubble carrying the name that does that job before it floats away.';
  static CONFIG = { ...OCEAN_TERMS, title: 'Which name is this?', ask: 'Pop the name that does this job', skin: 'bubbles', rounds: 12 };

  // The menu previews three names: the job lines are full sentences and the
  // kit's menu token would shrink them to unreadable stubs.
  menuDemo = undefined;
  menuSample() { return ['MARPOL', 'GEMINI', 'EEZ'].map((name) => ({ name, art: false })); }
}
