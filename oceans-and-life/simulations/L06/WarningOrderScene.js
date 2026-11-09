import { ArcadeOrderScene } from 'simulations/base/kit/ArcadeOrderScene.js';
import { WARNING_ORDER } from '../L01/OceansDeck.js';

// The four stages of the tsunami warning system, and the chain of hands that
// carries an alert to the shore, coupled in order. Train skin.
export class WarningOrderScene extends ArcadeOrderScene {
  static ARIA_LABEL = 'Warning order: the four stages of the tsunami warning system, and the levels that carry an alert to the shore, float past; tap them in order to couple the train before the fuse burns out.';
  static CONFIG = { ...WARNING_ORDER, title: 'Warning order', skin: 'train', rounds: 12 };

  // Out of order, so the menu does not give the answer.
  menuSample() { return ['Tracking', 'Detection', 'Confirmation'].map((name) => ({ name, art: false })); }
}
