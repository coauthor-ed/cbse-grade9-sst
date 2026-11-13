import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { MONEY_MYTHS } from '../L01/PersonalFinancesDeck.js';

// Money myths: one claim per card; swipe right for true, left for false.
export class MoneyMythsJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'Money myths: one claim about money appears on a card at a time; swipe it right for true or left for false, or use the arrow keys.';
  static CONFIG = { ...MONEY_MYTHS, title: 'Money myths', skin: 'cards', rounds: 12 };
}
