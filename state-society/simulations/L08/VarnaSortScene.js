import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { VARNA_TASKS } from '../L01/StateSocietyDeck.js';

// Twelve tasks into the four var\u1E47as, falling-into-bins skin. Taught by L08
// s01. Sorted by what the texts expected of each.
export class VarnaSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'What did the texts expect of each? Twelve tasks fall one at a time; tap the var\u1E47a the texts name for it.';
  static CONFIG = {
    ...VARNA_TASKS,
    title: 'What did the texts expect of each?',
    how: 'Twelve tasks, as the texts describe them. Tap the var\u1E47a each one is named for.',
    skin: 'sky',
    rounds: 12,
    fall: 11,
  };
}