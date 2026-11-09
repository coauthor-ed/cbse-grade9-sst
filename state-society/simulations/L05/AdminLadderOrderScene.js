import { ArcadeOrderScene } from 'simulations/base/kit/ArcadeOrderScene.js';
import { ADMIN_LADDER_ORDER } from '../L01/StateSocietyDeck.js';

// The six levels in order, three times over: plain, northern names, southern names. Taught by L05 s03.
export class AdminLadderOrderScene extends ArcadeOrderScene {
  static ARIA_LABEL = 'Levels of a kingdom, in order: six pieces float around; tap them from the kingdom at the top to the village at the bottom. The northern and southern sets are the same six levels in different words.';
  static CONFIG = {
    ...ADMIN_LADDER_ORDER,
    title: 'The levels, in order',
    how: 'Tap each level in order, kingdom at the top to village at the bottom. The northern and southern sets are the same levels in different words.',
    skin: 'stack',
    rounds: 12,
    fuse: 7,
  };

  // The engine's default sample is the first three items of a sequence, in
  // order, which hands over the answer. One middle level from each set instead.
  menuSample() {
    return this.cfg.sequences.map((s) => ({ name: s.items[3] }));
  }
}