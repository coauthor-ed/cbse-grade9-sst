// SeatRuleScene - L02 game: five made-up counts under the three rules; tap the result.
// Board and control names: shared/ReplyRounds.js ([data-reply=a|b|c], [data-next]).
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountReplies, repliesResult } from '../shared/ReplyRounds.js';

const items = [
  { tag: 'Haritbhumi: most votes wins', text: 'One constituency, with no candidate above 50 per cent.', facts: ['A 38', 'B 34', 'C 28'], replies: [
    { id: 'a', text: 'A wins the seat', ok: true, why: 'Under FPTP, the most votes wins, even below 50 per cent.' },
    { id: 'b', text: 'A and B compete again', why: 'That is the rule in Ratnadweep. Haritbhumi has no second round.' },
    { id: 'c', text: 'The seat is shared', why: 'One constituency has one winner under FPTP.' },
  ] },
  { tag: 'Ratnadweep: more than half', text: 'Round 1, with no one above 50 per cent.', facts: ['X 48', 'Y 42', 'Z 10'], replies: [
    { id: 'a', text: 'X wins, as it came first', why: 'Coming first is enough only under FPTP. Here a winner needs more than 50 per cent.' },
    { id: 'b', text: 'X and Y compete again', ok: true, why: 'No one has more than 50 per cent, so the top two go to a second round.' },
    { id: 'c', text: 'Z is added to X', why: 'The rule is a second round. Votes are not simply added.' },
  ] },
  { tag: 'Ratnadweep: more than half', text: 'Round 1 again, with a different count.', facts: ['X 52', 'Y 30', 'Z 18'], replies: [
    { id: 'a', text: 'X and Y compete again', why: 'X already has more than 50 per cent, so no second round is needed.' },
    { id: 'b', text: 'X, Y and Z share power', why: 'Sharing by votes is the rule in Swarnalok.' },
    { id: 'c', text: 'X wins in Round 1', ok: true, why: '52 is more than 50 per cent, so X wins at once.' },
  ] },
  { tag: 'Swarnalok: seats follow votes', text: 'There are 100 seats. How many does Party O get?', facts: ['M 30', 'N 30', 'O 25', 'P 15'], replies: [
    { id: 'a', text: 'None, as O did not come first', why: 'Under PR, a party need not come first to get seats.' },
    { id: 'b', text: '25 seats', ok: true, why: '25 per cent of 100 seats is 25 seats.' },
    { id: 'c', text: '30 seats', why: '30 is the share of M and N. O polled 25 per cent.' },
  ] },
  { tag: 'Haritbhumi: most votes wins', text: 'One constituency, with four candidates.', facts: ['A 30', 'B 29', 'C 22', 'D 19'], replies: [
    { id: 'a', text: 'Nobody wins with only 30', why: 'FPTP has no minimum share. The most votes wins.' },
    { id: 'b', text: 'A and B compete again', why: 'Haritbhumi has no second round.' },
    { id: 'c', text: 'A wins the seat', ok: true, why: 'A has the most votes, so A wins, even with 30 per cent.' },
  ] },
];

export class SeatRuleScene extends GameBoard {
  static HEIGHT = 350; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A game of five made-up counts. Each shows a country, its rule and the votes. Tap the result. A wrong choice says why and you can try again.';
  static OBJECTIVE = { prompt: { en: 'Apply each country\'s rule to five counts and tap the result.' } };

  async setup() {
    await super.setup();
    mountReplies(this, { key: 'sr', title: 'Apply the rule', sub: 'Made-up counts, in per cent of votes.', items });
  }

  checkObjective() { return repliesResult(this); }
}
