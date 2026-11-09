import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { CURRENT_NAMES } from '../L01/OceansDeck.js';

// Twelve currents of the world's oceans, sorted by the kind of water they
// carry. Falling-into-bins skin.
export class CurrentSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Warm or cold current: one current name falls at a time; tap the bin for the kind of water it carries.';
  static CONFIG = { ...CURRENT_NAMES, title: 'Warm or cold current?', skin: 'sky', rounds: 12 };

  // Out of deck order, so the menu does not show three of one kind.
  menuSample() { return ['Kuroshio', 'Labrador Current', 'West Wind Drift'].map((name) => ({ name, art: false })); }
}
