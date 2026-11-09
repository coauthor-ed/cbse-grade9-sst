import { ArcadeRouteScene } from 'simulations/base/kit/ArcadeRouteScene.js';
import { RESOURCE_KEY } from '../L01/OceansDeck.js';

// The marine resources run down the lesson's yes/no key to the branch each one
// belongs to. Road skin.
export class ResourceRouteScene extends ArcadeRouteScene {
  static ARIA_LABEL = 'Resource key run: each marine resource runs down gates asking is it living, is it a fish, is it energy, is it conventional, and lands in the branch it belongs to.';
  static CONFIG = { ...RESOURCE_KEY, title: 'Which branch?', skin: 'road', rounds: 8 };

  menuDemo = undefined;
  menuSample() { return ['Oil', 'Seagrass', 'Gravel'].map((name) => ({ name, art: false })); }
}
