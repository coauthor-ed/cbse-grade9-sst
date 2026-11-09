// CandidateWallScene-setup - blk-l06-s01. The boards alone: the predict's picture, no party yet.
import { CandidateWallScene } from './CandidateWallScene.js';
import { WALL as S } from './PartyWorld.js';

export class CandidateWallSetupScene extends CandidateWallScene {
  static BEAT_STEP_MAP = [[{ idx: S.BOARDS, dwellMs: null }]];
  static ARIA_LABEL = 'Three boards outside a polling station. Each shows a name, a plain mark and a photo box, and nothing else.';
  draw(ctx, c) { super.draw(ctx, c); }
}
