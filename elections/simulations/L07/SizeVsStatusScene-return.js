// SizeVsStatusScene-return - blk-l07-s07. The records with a class, then what a class cannot show.
import { SizeVsStatusScene } from './SizeVsStatusScene.js';
import { FILES as S } from '../L06/PartyWorld.js';

export class SizeVsStatusReturnScene extends SizeVsStatusScene {
  static BEAT_STEP_MAP = [S.STAMPED, S.HOW].map((idx) => [{ idx, dwellMs: null }]);
  static ARIA_LABEL = 'The two records, now with a class: Party P a State party, Party Q a national party. Then a voter at a booth and the question of how the votes were cast.';
  draw(ctx, c) { super.draw(ctx, c); }
}
