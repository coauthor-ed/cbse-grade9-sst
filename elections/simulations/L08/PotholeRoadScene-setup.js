// PotholeRoadScene-setup - blk-l08-s02. The road with its three names: the predict's picture.
import { PotholeRoadScene } from './PotholeRoadScene.js';
import { ROAD as S } from '../L06/PartyWorld.js';

export class PotholeRoadSetupScene extends PotholeRoadScene {
  static BEAT_STEP_MAP = [[{ idx: S.NAMED, dwellMs: null }]];
  static ARIA_LABEL = 'The road to a polling booth, with three named potholes: intimidation, misinformation and fake news.';
  draw(ctx, c) { super.draw(ctx, c); }
}
