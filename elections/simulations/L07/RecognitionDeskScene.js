// RecognitionDeskScene - L07 game. Five made-up records: tap the class, then the route that carries it.
// Control names: [data-bin=nat|state|rupp], [data-opt=<id>], [data-next].
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult, ROOMY_CSS } from '../shared/MatterRounds.js';

const NAT = (ok, why) => ({ ask: 'Which route carries it?', options: [
  { id: 'r1', text: '6% in four States, and four seats', ok: ok === 'r1', why: ok === 'r1' ? why : 'Check the record: does it show votes in four States?' },
  { id: 'r2', text: '2% of seats, from three States', ok: ok === 'r2', why: ok === 'r2' ? why : 'Check the record: does it show seats from three States?' },
  { id: 'r3', text: 'A State party in four States', ok: ok === 'r3', why: ok === 'r3' ? why : 'Check the record: does it show State recognition?' },
] });
const FILES = [
  { text: 'Party A: 6% of votes in each of four States, and five Lok Sabha seats.', is: 'nat', why: '', then: NAT('r1', 'Yes. Both parts of Route 1 are met.'), miss: { state: 'Its votes reach four States, so look at the national routes.', rupp: 'It has enough votes and seats for a class.' } },
  { text: 'Party B: 12 of 543 Lok Sabha seats, from three States.', is: 'nat', why: '', then: NAT('r2', 'Yes. 12 is over 2% of 543, from three States.'), miss: { state: 'Seats from three States point to a national route.', rupp: 'It has enough seats for a class.' } },
  { text: 'Party C: recognised as a State party in five States.', is: 'nat', why: '', then: NAT('r3', 'Yes. Four States are enough for Route 3.'), miss: { state: 'Five States is enough, so look at the national routes.', rupp: 'It is already recognised.' } },
  { text: 'Party D: 8.5% of the valid votes in one State, and no seats.', is: 'state', why: '', then: { ask: 'Which route carries it?', options: [
    { id: 's5', text: '8% of the valid votes in the State', ok: true, why: 'Yes. This route needs no seat at all.' },
    { id: 's1', text: '6% of Assembly votes, and two seats', ok: false, why: 'This route needs two seats, and Party D has none.' },
    { id: 's4', text: 'One Lok Sabha seat per 25 seats', ok: false, why: 'This route needs seats, and Party D has none.' },
  ] }, miss: { nat: 'One State is too few for any national route.', rupp: 'One State route is met here: read the percentage.' } },
  { text: 'Party E: registered three years ago, and has never contested.', is: 'rupp', why: '', then: { ask: 'Which description fits?', options: [
    { id: 'u2', text: 'Never contested since registering', ok: true, why: 'Yes. This is one of the two kinds of RUPP.' },
    { id: 'u1', text: 'Contested, without enough votes', ok: false, why: 'Party E has not contested at all.' },
    { id: 'u3', text: 'Not registered with the ECI', ok: false, why: 'It is registered. Only registered parties can contest.' },
  ] }, miss: { nat: 'It has no votes or seats yet.', state: 'It has no votes or seats in any State yet.' } },
];

export class RecognitionDeskScene extends GameBoard {
  static HEIGHT = 300; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A game: five made-up party records, one at a time. Tap the class of each party, then the route that carries it.';
  static OBJECTIVE = { prompt: { en: 'Read five party records. Choose each party\'s class and the route that carries it.' } };
  async setup() {
    await super.setup();
    mountRounds(this, { key: 'rd', css: ROOMY_CSS, title: 'Class and route', sub: 'Any one condition is enough.', cols: 3, colsP: 3,
      bins: [{ id: 'nat', label: 'National', tone: 1 }, { id: 'state', label: 'State', tone: 5 }, { id: 'rupp', label: 'RUPP', tone: 3 }], items: FILES });
  }
  checkObjective() { return roundsResult(this); }
}
