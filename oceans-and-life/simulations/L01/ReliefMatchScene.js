import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { RELIEF_FEATURES_MATCH } from './OceansDeck.js';

// The eleven shapes of the sea floor, matched to their names, bubbles skin.
export class ReliefMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Sea-floor shapes: a line describing a shape of the sea floor waits at the bottom; pop the bubble carrying the name of that feature before it floats away.';
  static CONFIG = { ...RELIEF_FEATURES_MATCH, title: 'Sea-floor shapes', ask: 'Pop the name that fits the shape', skin: 'bubbles', rounds: 11 };

  // The menu previews three of the names: the card lines are full sentences and
  // the kit's menu token would shrink them to unreadable stubs.
  menuSample() { return (this.cfg.pairs || []).slice(3, 6).map((x) => ({ name: x.answer, art: false })); }
}
