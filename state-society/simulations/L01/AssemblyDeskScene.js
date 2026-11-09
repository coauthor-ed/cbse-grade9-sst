// AssemblyDeskScene - L01 s06 mini-game. Each matter goes to the assembly that dealt with that
// kind of business. Board and control names: shared/MatterRounds.js.
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult, peopleArt } from '../shared/MatterRounds.js';

const J = 'The sabh\u0101 mainly served a judicial function, so it heard cases.';
const P = 'The samiti focused on policy decisions and political affairs.';
const W = 'The vidhata was a forum for discussing war and other political matters.';
const NOT = { sabha: 'The sabh\u0101 mainly heard cases. This matter is not a case to judge.', samiti: 'The samiti focused on policy. Which assembly fits this kind of matter better?', vidhata: 'The vidhata was a popular gathering. Is this a matter for a discussion of war?' };

const items = [
  ['Two families quarrel over a strip of land and want a judgement.', 'sabha', J],
  ['A family says a neighbour wronged them, and the case must be heard.', 'sabha', J],
  ['The clan must settle what its policy will be towards a nearby clan.', 'samiti', P],
  ['A political affair needs the broader population to be represented.', 'samiti', P],
  ['Raiders are near, and members of the jana gather to discuss war.', 'vidhata', W],
  ['Members of the janas come together to discuss fighting a neighbour.', 'vidhata', W],
].map(([text, is, why]) => ({ text, is, why, miss: NOT }));

export class AssemblyDeskScene extends GameBoard {
  static ARIA_LABEL = 'A sorting game. One matter at a time appears on a card. Tap the assembly that dealt with it: sabha, samiti or vidhata. A wrong choice says why and the card stays.';
  static OBJECTIVE = { prompt: { en: 'Send each matter to the assembly that dealt with it.' } };

  async setup() {
    await super.setup();
    mountRounds(this, {
      key: 'ad', title: 'Which assembly?', sub: 'Read the matter, then tap the assembly that dealt with that kind of business.', items, cols: 3,
      bins: [
        { id: 'sabha', label: 'sabh\u0101', note: 'smaller body', tone: 2, art: peopleArt(3, 2) },
        { id: 'samiti', label: 'samiti', note: 'larger assembly', tone: 3, art: peopleArt(6, 3) },
        { id: 'vidhata', label: 'vidhata', note: 'popular gathering', tone: 6, art: peopleArt(12, 6) },
      ],
    });
  }

  checkObjective() { return roundsResult(this); }
}
