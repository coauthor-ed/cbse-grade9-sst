// GanasVoteGame - L02 game: from assembly to Constitution. Seven events go in order. The cards show no
// dates: the date appears when a card lands. Control names: shared/OrderBoard.js.
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountOrder, orderResult } from '../shared/OrderBoard.js';

const items = [
  { id: 'vedic', when: 'Vedic period', text: 'Sabh\u0101 and Samiti', why: 'These assemblies of the Vedic period come first.' },
  { id: 'samgha', when: 'Gautama Buddha', text: 'Bauddha Sa\u1E41gha', why: 'Gautama Buddha established it, long after the early Vedic assemblies.' },
  { id: 'british', when: '19th century', text: 'British rule over most parts', why: 'By the 19th century, the British had colonised most parts.' },
  { id: 'assembly', when: '1946', text: 'Constituent Assembly formed', why: 'It was formed in 1946, before independence.' },
  { id: 'free', when: '1947', text: 'India attains independence', why: 'India attained independence in 1947.' },
  { id: 'adopted', when: '26 Nov 1949', text: 'Constitution adopted', why: 'It was adopted on 26 November 1949.' },
  { id: 'force', when: '26 Jan 1950', text: 'Constitution comes into force', why: 'It came into force on 26 January 1950.' },
];

export class GanasVoteGame extends GameBoard {
  static ARIA_LABEL = 'An ordering game. Seven events from the Vedic assemblies to the Constitution are dealt in a mixed order. Tap the earliest event still in the tray. A wrong card stays and says why.';
  static OBJECTIVE = { prompt: { en: 'Put the seven steps in order, from the earliest to the latest.' } };

  async setup() {
    await super.setup();
    mountOrder(this, {
      key: 'gv', kicker: 'Your turn', title: 'From assembly to Constitution: earliest first', sub: 'Tap the earliest event still in the tray.',
      first: 'earliest', last: 'latest', items,
      miss: (it) => `Not yet. ${it.why} Something earlier is still in the tray.`,
    });
  }

  checkObjective() { return orderResult(this); }
}
