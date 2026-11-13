import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { MARKET_STATEMENTS_JUDGE } from '../L02/PricePuzzleDeck.js';

// True or false? Twelve statements from the government lesson (price ceiling and
// floor, monopoly and regulators, hoarding, public goods, the limits of rules),
// one at a time, two doors to call them through. Reworded 2026-11-11 (q58-w4):
// no opinion is keyed; GOODS_PAIRS_SORT is untouched.
export class MarketStatementsJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'True or false? Twelve sentences from this lesson come in one at a time; open the TRUE door or the FALSE door. Each one is about a highest or lowest price, a monopoly, hoarding, a public park or too many rules.';
  static CONFIG = { ...MARKET_STATEMENTS_JUDGE, title: 'True or False?', skin: 'doors', rounds: 12 };
}
