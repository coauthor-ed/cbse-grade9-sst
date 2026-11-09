import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { BOUNDARY_SORT } from './EarthSurfaceDeck.js';

// Which kind of plate boundary made this place. Places fall one at a time; tap the kind.
export class BoundarySortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Boundary sorter: places fall one at a time; tap the kind of plate boundary at each one: convergent, divergent or transform.';
  static CONFIG = {
    ...BOUNDARY_SORT,
    title: 'Which Boundary?',
    skin: 'sky',
    rounds: 8,
    how: 'Tap the kind of boundary before the card lands.',
  };
  menuSample() { return [{ name: 'Mid-Atlantic Ridge', art: false }, { name: 'Himalaya', art: false }, { name: 'San Andreas Fault', art: false }]; }
}
