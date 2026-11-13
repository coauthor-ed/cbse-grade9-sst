import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { INSURANCE_LOSSES } from '../L01/PersonalFinancesDeck.js';

// Which cover pays? Losses ride a conveyor belt; tap health, life or general.
export class InsuranceSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Which cover pays? One unexpected loss at a time rides a conveyor belt; tap the health, life or general crate before it drops.';
  static CONFIG = { ...INSURANCE_LOSSES, title: 'Which cover pays?', skin: 'belt', rounds: 12, fall: 10 };
}
