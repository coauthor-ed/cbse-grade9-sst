// AccessRouteScene - L05 game: six voters, four ways to vote, one voter on screen. A wrong choice says
// why and the card stays. Every voter is made up. Control names: [data-bin=booth], [data-bin=home],
// [data-bin=etpbs], [data-bin=comp], [data-next] (shared/MatterRounds.js).
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult, ROOMY_CSS } from '../shared/MatterRounds.js';

const items = [
  ['A voter aged 88 who cannot walk far.', 'home', 'Voting from home is for senior citizens above 85.', { booth: 'It is hard for this voter to reach the booth, and a better way is open.', etpbs: 'ETPBS is for service voters.', comp: 'A companion is for a voter who cannot use the machine alone.' }],
  ['A voter aged 74 who finds the walk hard but has no disability.', 'booth', 'At 74 this voter cannot vote from home, so the way is the booth. A volunteer or a wheelchair can help.', { home: 'Voting from home is for voters above 85, or PwDs with a benchmark disability of 40%.', etpbs: 'ETPBS is for service voters.', comp: 'This voter can use the machine alone.' }],
  ['A soldier posted far from the home constituency.', 'etpbs', 'Service voters can receive and cast a postal ballot electronically.', { booth: 'This voter is posted too far from the home booth.', home: 'This voter is not at home, and is not in either group for home voting.', comp: 'A companion does not help a voter who is far away.' }],
  ['A voter with a benchmark disability of 50% who cannot leave the house.', 'home', 'Voting from home is open to PwDs with a benchmark disability of 40%.', { booth: 'This voter cannot leave the house.', etpbs: 'ETPBS is for service voters.', comp: 'A companion does not solve the journey to the booth.' }],
  ['A voter at the booth who cannot see and does not read Braille.', 'comp', 'A voter who cannot see may take a companion into the voting compartment.', { booth: 'Braille does not help this voter alone, so one more step is needed.', home: 'This voter has already reached the booth.', etpbs: 'ETPBS is for service voters.' }],
  ['A student aged 19 who lives near the polling station.', 'booth', 'Most people vote at the polling station.', { home: 'This voter is not in either group for home voting.', etpbs: 'ETPBS is for service voters.', comp: 'This voter can use the machine alone.' }],
].map(([text, is, why, miss]) => ({ text, is, why, miss }));

export class AccessRouteScene extends GameBoard {
  static HEIGHT = 300; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A sorting game. Six voters appear one at a time. Tap the way to vote that fits each: at the booth, from home, ETPBS, or with a companion. A wrong choice says why and the card stays.';
  static OBJECTIVE = { prompt: { en: 'Find the way to vote that is open to each voter.' } };

  async setup() {
    await super.setup();
    mountRounds(this, {
      key: 'ar', css: ROOMY_CSS, title: 'Find the way to vote', sub: 'Read about the voter, then tap a way.', items, cols: 2,
      bins: [{ id: 'booth', label: 'At the booth', tone: 1 }, { id: 'home', label: 'From home', tone: 3 }, { id: 'etpbs', label: 'ETPBS', tone: 5 }, { id: 'comp', label: 'Companion', tone: 7 }],
    });
  }

  checkObjective() { return roundsResult(this); }
}
