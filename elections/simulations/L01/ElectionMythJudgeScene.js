import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { ELECTION_MYTHS } from './ElectionsDeck.js';

// True or false on what an election is for.
export class ElectionMythJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'True or false: one statement about what an election is for at a time; call it true or false - a wrong call shows why.';
  static CONFIG = { ...ELECTION_MYTHS, title: 'True or False?', skin: 'cards', rounds: 8 };
  // The card stays between the two answers: the kit's demo swings it across TRUE, and a learner reads it better still.
  menuDemo(ctx, c, t) { super.menuDemo(ctx, c, t, 1); }
}
