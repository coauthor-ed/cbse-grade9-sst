import { ArcadeOrderScene } from 'simulations/base/kit/ArcadeOrderScene.js';
import { TRADE_AND_FARM_ORDER } from '../L01/StateSocietyDeck.js';

// The Dakshinapatha from north to south, and a crop's year in a farming order
// of plain steps. The two are of different kinds and a
// carriage never says which kind it is. Taught by L11 s05 and s03.
export class TradeRouteOrderScene extends ArcadeOrderScene {
  static ARIA_LABEL = 'Two orders on one train: the Dak\u1E63hi\u1E47\u0101patha\u2019s run from the northern inland start down to the Tamilakam, and a crop\u2019s year from preparing the fields to storing the grain. Tap the carriages in order to couple the train before the fuse burns out; nothing on a carriage tells you which of the two you are looking at.';
  static CONFIG = {
    ...TRADE_AND_FARM_ORDER,
    title: 'Which order?',
    how: 'Tap the carriages in order before the fuse burns out. One run is a road, the other a farming year.',
    skin: 'train',
    rounds: 12,
  };

  // The engine's default menu sample is the first three items of the first
  // sequence, in order - which would hand over the opening of the road run
  // before the learner has tapped anything. One carriage from each sequence
  // instead: both kinds are on screen and neither order is given away.
  menuSample() {
    return this.cfg.sequences.map((s) => ({ name: s.items[0] }));
  }
}