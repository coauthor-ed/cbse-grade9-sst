// KingsJusticeGame - L03 s06 mini-game. Each matter: Protect or Judge. A case between a strong and
// a weak person then asks for the fair response, from the coronation oath. Board and control
// names: shared/MatterRounds.js.
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult } from '../shared/MatterRounds.js';

const P = 'A king was responsible for protecting his subjects from external threats and internal disorder.';
const J = 'A king was expected to administer justice in cases such as abduction, robbery, theft and adultery.';
const MISS = { protect: 'This is a case to be heard between particular people.', judge: 'This is a danger to many people, so it calls for protection.' };
const FAIR = (ask) => ({
  ask,
  options: [
    { id: 'fair', text: 'Hear both sides and judge impartially.', ok: true, why: 'The oath of coronation advised the king to judge the strong and the weak impartially and fairly.' },
    { id: 'rich', text: 'Decide for the powerful man.', ok: false, why: 'The oath says otherwise: strong and weak are to be judged fairly.' },
    { id: 'skip', text: 'Refuse to hear the case.', ok: false, why: 'A king was expected to administer justice in such cases.' },
  ],
});
const items = [
  { text: 'Raiders cross the border and burn a village.', is: 'protect', why: P, miss: MISS },
  { text: 'A rich landowner and a poor farmer bring a case of theft.', is: 'judge', why: J, miss: MISS, then: FAIR('What should the king do?') },
  { text: 'Disorder spreads through a market town.', is: 'protect', why: P, miss: MISS },
  { text: 'A trader says he was robbed on the road, and he names a powerful man.', is: 'judge', why: J, miss: MISS, then: FAIR('What should the king do?') },
  { text: 'A family brings a case of abduction against their neighbours.', is: 'judge', why: J, miss: MISS },
  { text: 'An enemy army marches towards the kingdom.', is: 'protect', why: P, miss: MISS },
];

export class KingsJusticeGame extends GameBoard {
  static ARIA_LABEL = 'A game. One matter at a time reaches the king. Tap Protect or Judge. For a case between a strong and a weak person, choose the fair response. A wrong choice says why and the card stays.';
  static OBJECTIVE = { prompt: { en: 'Sort each matter into Protect or Judge, then choose the fair response.' } };
  async setup() {
    await super.setup();
    mountRounds(this, {
      key: 'kj', title: "The king's court", sub: 'Which duty does this matter call for?', items, cols: 2,
      bins: [{ id: 'protect', label: 'Protect', note: 'threats and disorder', tone: 6 }, { id: 'judge', label: 'Judge', note: 'hear the case', tone: 2 }],
    });
  }
  checkObjective() { return roundsResult(this); }
}
