import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { WARNING_NAMES } from '../L01/OceansDeck.js';

// The seven short names of the cyclone-warning lesson, matched to their work. Fair-ground range skin.
export class WarningNamesMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Warning names: a job waits at the counter; hit the target carrying the acronym that does that job, before it drops.';
  static CONFIG = { ...WARNING_NAMES, title: 'Which name does what?', ask: 'Hit the name that does this job', skin: 'range', rounds: 12 };

  // The menu previews three short names: the job lines are too long for a menu token.
  menuSample() { return ['SSEWS', 'GEMINI', 'INCOIS'].map((name) => ({ name, art: false })); }
}
