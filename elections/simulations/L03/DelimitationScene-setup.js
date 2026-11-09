// DelimitationScene-setup - the L03 s02 predict setup: the two seats at rest, with no drag and no new word.
import { DelimitationScene } from './DelimitationScene.js';

export class DelimitationSetupScene extends DelimitationScene {
  static BEAT_STEP_MAP = [[{ idx: 3, dwellMs: null }]];
  static ARIA_LABEL = 'A hill seat with 5 lakh people and a city seat with 25 lakh people, with one MP each.';
  draw(ctx, c) { super.draw(ctx, c); }
}
