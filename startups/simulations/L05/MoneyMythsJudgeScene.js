import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { MONEY_MYTHS } from '../L04/StartupsDeck.js';

export class MoneyMythsJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'Money myths: statements about business money and accounts; swipe or tap true or false.';
  static CONFIG = { ...MONEY_MYTHS, title: 'Money myths', skin: 'cards', rounds: 12 };
}
