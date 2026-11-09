import { ArcadeOrderScene } from 'simulations/base/kit/ArcadeOrderScene.js';
import { EROSION_ORDER } from '../L01/OceansDeck.js';

// The stages the sea makes on a headland, and a wave from the wind to the beach, in order. Tower skin.
export class ErosionOrderScene extends ArcadeOrderScene {
  static ARIA_LABEL = 'Coast and wave in order: the stages of a headland wearing down, and a wave from the wind to the beach, float past; tap them in the right order to build the tower.';
  static CONFIG = { ...EROSION_ORDER, title: 'Coast and wave', skin: 'stack', rounds: 2 };

  // Out of order on purpose: the menu must not teach the answer. Word tokens carry no art.
  menuSample() { return ['Sea stack', 'Large crack', 'Stump'].map((name) => ({ name, art: false })); }
}
