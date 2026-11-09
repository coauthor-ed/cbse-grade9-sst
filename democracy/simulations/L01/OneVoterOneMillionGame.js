// OneVoterOneMillionGame - L01 game: from one voter to 140 crore. Seven numbers from the lesson go in
// order, smallest first. A wrong card names its size in place value. Control names: shared/OrderBoard.js.
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountOrder, orderResult } from '../shared/OrderBoard.js';

const items = [
  { id: 'one', big: '1', text: 'voter at the Gir booth', why: 'One voter, with a polling station all the same.' },
  { id: 'seats', big: '543', text: 'Lok Sabha seats', why: '543 is in the hundreds.' },
  { id: 'parties', big: '2,800+', text: 'registered political parties', why: '2,800 is in the thousands.' },
  { id: 'stations', big: '10 lakh+', text: 'polling stations', why: '10 lakh is written 10,00,000.' },
  { id: 'mp', big: '25 lakh', text: 'people for each MP', why: '25 lakh is written 25,00,000.' },
  { id: 'voters', big: '96.8 crore', text: 'registered voters', why: '1 crore is 100 lakh, so 96.8 crore is 9,680 lakh.' },
  { id: 'people', big: '140 crore', text: 'people in India', why: '140 crore is 14,000 lakh, the largest of them all.' },
];

export class OneVoterOneMillionGame extends GameBoard {
  static ARIA_LABEL = 'An ordering game. Seven number cards about Indian democracy are dealt in a mixed order. Tap the smallest card still in the tray. A wrong card stays and says why.';
  static OBJECTIVE = { prompt: { en: 'Put the seven numbers in order, from the smallest to the largest.' } };

  async setup() {
    await super.setup();
    mountOrder(this, {
      key: 'ov', kicker: 'Your turn', title: 'From 1 voter to 140 crore: smallest first', sub: 'Tap the smallest number still in the tray.',
      first: 'smallest', last: 'largest', items,
      miss: (it) => `Not yet. ${it.why} A smaller number is still in the tray.`,
    });
  }

  checkObjective() { return orderResult(this); }
}
