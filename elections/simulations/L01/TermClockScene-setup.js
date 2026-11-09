// TermClockScene-setup - the L01 s02 predict setup: the class before a fresh election. No answer on show.
import { TermClockScene } from './TermClockScene.js';

export class TermClockSetupScene extends TermClockScene {
  static BEAT_STEP_MAP = [[{ idx: 3, dwellMs: null }]];
  static ARIA_LABEL = 'A classroom with Gurmat in front of her class and Class election on the board.';
  draw(ctx, c) { super.draw(ctx, c); }
}
