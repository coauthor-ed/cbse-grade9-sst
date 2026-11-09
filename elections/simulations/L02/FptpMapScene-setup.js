// FptpMapScene-setup - the L02 s01 predict setup: one constituency, three bars, nothing else.
import { FptpMapScene } from './FptpMapScene.js';

export class FptpMapSetupScene extends FptpMapScene {
  static BEAT_STEP_MAP = [[{ idx: 4, dwellMs: null }]];
  static ARIA_LABEL = 'One constituency with three bars: Party A 40, Party B 35, Party C 25, out of every 100 votes.';
  static PORTRAIT_HEIGHT = 262;
  static HEIGHT = 262;
  async setup() { await super.setup(); this.stepIndex = 4; this.repaint(); }
  stageHeight() { return 258; }
  css() { return super.css() + '.sim-dom-root.sim-dom-root--portrait { padding-left: 0; padding-right: 0; }'; }
}
