// SizeVsStatusScene-setup - blk-l07-s02. The two records with no class: the predict's picture.
import { SizeVsStatusScene } from './SizeVsStatusScene.js';
import { FILES as S } from '../L06/PartyWorld.js';

export class SizeVsStatusSetupScene extends SizeVsStatusScene {
  static BEAT_STEP_MAP = [[{ idx: S.BOTH, dwellMs: null }]];
  static ARIA_LABEL = 'Two made-up party records. Party Q has 2 per cent of the votes, 12 seats and 4 States. The class line is empty.';
  draw(ctx, c) { super.draw(ctx, c); }
}
