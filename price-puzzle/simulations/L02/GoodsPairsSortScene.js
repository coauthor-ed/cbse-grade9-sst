import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { GOODS_PAIRS_SORT } from './PricePuzzleDeck.js';

// Goods pairs: substitutes or complements? Catch-and-sort,
// conveyor-belt skin. The deck is the chapter's first one; later arcade games
// add their own export beside it (never edit an item in this one).
export class GoodsPairsSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Substitutes or complements: pairs of goods ride a conveyor belt one at a time; tap the crate each pair belongs in before the belt drops it.';
  static CONFIG = { ...GOODS_PAIRS_SORT, title: 'Substitutes or Complements', skin: 'belt', rounds: 12, fall: 9 };
}