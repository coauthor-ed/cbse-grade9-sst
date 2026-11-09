// RollSweepScene - L04 game: six households, keep, add or delete. One on screen, a wrong choice says
// why and the card stays. Every person is made up and has no name. Control names: [data-bin=keep],
// [data-bin=add], [data-bin=del], [data-next] (shared/MatterRounds.js).
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult, ROOMY_CSS } from '../shared/MatterRounds.js';

const items = [
  ['House 4: a citizen aged 34 lives here, and her entry is correct.', 'keep', 'Her entry is right, so it stays.', { add: 'She is already on the roll.', del: 'None of the four grounds applies to her.' }],
  ['House 9: a girl turned 18 last month. She is a citizen and is not on the roll.', 'add', 'She is eligible, so her name is added.', { keep: 'Leaving her out would leave out an eligible citizen.', del: 'Her name is not on the roll to delete.' }],
  ['House 12: the voter on the roll died last year.', 'del', 'Death of the voter is a ground for deletion.', { keep: 'A name with no living voter should not stay.', add: 'This person is already on the roll.' }],
  ['House 15: the family has moved to another State. Their names are still here.', 'del', 'Change of residence is a ground for deletion here.', { keep: 'They no longer live in this constituency.', add: 'Their names are already on this roll.' }],
  ['House 21: the same voter appears twice on this roll.', 'del', 'Duplicate enrolment: one entry goes and one stays.', { keep: 'One person must have one entry.', add: 'This voter already has too many entries.' }],
  ['House 26: a boy aged 16 lives here. He is not on the roll.', 'keep', 'He is under 18, so the roll stays as it is.', { add: 'He is not yet eligible: he is 16.', del: 'He has no entry to delete.' }],
].map(([text, is, why, miss]) => ({ text, is, why, miss }));

export class RollSweepScene extends GameBoard {
  static HEIGHT = 330; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A sorting game. Six households appear one at a time. Tap Keep, Add or Delete for each. A wrong choice says why and the card stays.';
  static OBJECTIVE = { prompt: { en: 'Decide what happens to the roll for each household.' } };

  async setup() {
    await super.setup();
    mountRounds(this, {
      key: 'rs', css: ROOMY_CSS, title: 'Clean the roll', sub: 'Read the household, then tap your choice.', items, cols: 3,
      bins: [{ id: 'keep', label: 'Keep', note: 'as it is', tone: 1 }, { id: 'add', label: 'Add', note: 'a name', tone: 3 }, { id: 'del', label: 'Delete', note: 'a name', tone: 6 }],
    });
  }

  checkObjective() { return roundsResult(this); }
}
