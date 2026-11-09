import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { CARRIER_SORT } from '../L02/EarthSurfaceDeck.js';

// Which agent made this landform? Landforms ride a belt; tap running water, ice or the sea.
export class CarrierSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Agent sorter: landforms ride a conveyor belt. Tap the agent that made each one: running water, ice or the sea.';
  static CONFIG = {
    ...CARRIER_SORT,
    title: 'Which agent made it?',
    skin: 'belt',
    rounds: 8,
    fall: 10,
    how: 'Read the shape, then tap the agent that made it.',
  };
  menuSample() { return ['Running water', 'Ice', 'The sea'].map((name) => ({ name, art: false })); }
}
