import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { NEEDS_WANTS } from './PersonalFinancesDeck.js';

// Need or want? Expenses fall from the sky; tap the bin each one belongs in.
export class NeedsWantsSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Need or want? One expense at a time falls from the sky; tap the need bin or the want bin before it lands.';
  static CONFIG = { ...NEEDS_WANTS, title: 'Need or want?', skin: 'sky', rounds: 12 };
}
