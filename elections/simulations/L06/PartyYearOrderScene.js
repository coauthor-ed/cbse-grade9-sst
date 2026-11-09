import { ArcadeOrderScene } from 'simulations/base/kit/ArcadeOrderScene.js';
import { PARTY_ORDERS } from './ElectionsDeckC.js';

// Party Express - couple each order from the lesson into a train, front car to back car (L06 arcade).
export class PartyYearOrderScene extends ArcadeOrderScene {
  static ARIA_LABEL = 'Party Express: the steps of one order float as loose carriages; tap them from first to last to couple the train before the fuse burns out.';
  static CONFIG = { ...PARTY_ORDERS, title: 'Party Express', skin: 'train', rounds: 3 };
  // One step from each order, none next to its neighbour: the menu must not show an order.
  menuSample() { return ['Implements policies', 'Classifies the party', 'Contest elections'].map((name) => ({ name, art: false })); }
}
