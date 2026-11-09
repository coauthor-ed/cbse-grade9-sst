// CandidateWallScene-return - blk-l06-s08. The boards again: what stands behind a name, then the empty class line.
import { CandidateWallScene } from './CandidateWallScene.js';
import { WALL as S } from './PartyWorld.js';

export class CandidateWallReturnScene extends CandidateWallScene {
  static BEAT_STEP_MAP = [S.BEHIND, S.CLASS].map((idx) => [{ idx, dwellMs: null }]);
  static ARIA_LABEL = 'The three boards again, now with what a party does behind each name. Then each board shows an empty class line.';
  draw(ctx, c) { super.draw(ctx, c); }
}
