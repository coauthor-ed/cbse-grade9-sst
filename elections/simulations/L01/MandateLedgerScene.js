// MandateLedgerScene - L01 game: eight cases, each sorted into one of the wheel's four named reasons.
// Board and control names: shared/MatterRounds.js ([data-bin=acc|rep|equ|leg], [data-next]).
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult, ROOMY_CSS } from '../shared/MatterRounds.js';

const A = 'acc', R = 'rep', E = 'equ', L = 'leg';
const NAME = { acc: 'Accountability', rep: 'Representation', equ: 'Equality', leg: 'Legitimacy' };
const rows = [
  ['Voters remove an MLA at the next election because the promised road was never built.', A, 'Voters judged the work and acted on it, so the MLA had to answer to them.'],
  ['A voter asks her MP in a public meeting why a promise was not kept.', A, 'Those elected must answer to the people.'],
  ['A Member of Parliament raises her constituency\'s water shortage in the Lok Sabha.', R, 'She speaks for the people who chose her.'],
  ['A panchayat member tells the panchayat what the people of her ward need.', R, 'She speaks and decides for the people who chose her.'],
  ['A shopkeeper and a factory owner each cast exactly one vote.', E, 'Every citizen has one equal vote.'],
  ['A voter in a village and a voter in a city each press one button.', E, 'Each citizen has one vote, wherever that citizen lives.'],
  ['People who voted for another party still accept the new government, because it won the election.', L, 'People accept a government\'s right to decide because the people chose it.'],
  ['After a fair election, the old government hands over power and the new one starts work.', L, 'The new government has the right to decide because the people chose it.'],
];
const items = rows.map(([text, is, why]) => ({
  text, is, why,
  miss: Object.fromEntries(Object.keys(NAME).filter((k) => k !== is).map((k) => [k, `Not ${NAME[k]} this time. Look at what the people in this case are doing.`])),
}));

export class MandateLedgerScene extends GameBoard {
  static HEIGHT = 330; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A sorting game. Eight cases appear one at a time. Tap the reason each case shows: accountability, representation, equality or legitimacy. A wrong choice says why and the card stays.';
  static OBJECTIVE = { prompt: { en: 'Sort eight cases into accountability, representation, equality and legitimacy.' } };

  async setup() {
    await super.setup();
    mountRounds(this, {
      key: 'ml', css: ROOMY_CSS, title: 'Which reason is it?', sub: 'Read the case, then tap a reason.', items, cols: 2,
      bins: [
        { id: A, label: 'Accountability', tone: 1, note: 'answer to the people' },
        { id: R, label: 'Representation', tone: 2, note: 'speak for the people' },
        { id: E, label: 'Equality', tone: 3, note: 'one equal vote' },
        { id: L, label: 'Legitimacy', tone: 5, note: 'accepted because chosen' },
      ],
    });
  }

  checkObjective() { return roundsResult(this); }
}
