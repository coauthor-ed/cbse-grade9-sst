import { ArcadeOrderScene } from 'simulations/base/kit/ArcadeOrderScene.js';
import { LAYER_ORDER } from '../L01/AtmosphereClimateDeck.js';

// Three orders in one column of air, train skin. The menu shows a mixed sample, never an order.
export class LayerOrderScene extends ArcadeOrderScene {
  static ARIA_LABEL = 'Layer order train: carriages ride past one at a time; tap each into its place, from the ground up.';
  static CONFIG = { ...LAYER_ORDER, title: 'Layers in order', skin: 'train', rounds: 3 };
  menuSample() { return [{ name: 'Mesosphere' }, { name: 'Ozone layer' }, { name: 'Tropopause' }]; }
}
