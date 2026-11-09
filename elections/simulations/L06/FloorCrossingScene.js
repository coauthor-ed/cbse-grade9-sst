// FloorCrossingScene - L06 game. Six cases: defection or not, then who decides or what can follow.
// Control names: [data-bin=yes|no], [data-opt=<id>], [data-next].
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult, ROOMY_CSS } from '../shared/MatterRounds.js';

const WHO = (why) => ({ ask: 'Who decides what needs to be done?', options: [
  { id: 'speaker', text: 'The Speaker or Chairman of the House', ok: true, why },
  { id: 'eci', text: 'The Election Commission', ok: false, why: 'The ECI runs elections. The law gives this decision to the presiding officer of the House.' },
  { id: 'party', text: 'The leader of the member\'s party', ok: false, why: 'A party gives the whip, but it does not decide on disqualification.' },
] });
const CASES = [
  { text: 'A member elected on Party A\'s ticket joins Party B.', is: 'yes', why: 'She was elected on a party\'s ticket and has switched.', then: WHO('Yes. The Speaker or Chairman decides.'), miss: { no: 'She was elected under Party A\'s banner, so this is switching parties after election.' } },
  { text: 'A party worker who was never elected moves from Party B to Party C.', is: 'no', why: 'Anyone not elected on a ticket can change parties.', miss: { yes: 'Defection needs someone elected on a party\'s ticket.' } },
  { text: 'A State Assembly member votes against her party\'s whip.', is: 'yes', why: 'Voting against the party\'s instructions counts, even without leaving.', then: WHO('Yes. The member can be disqualified, and the Speaker or Chairman decides.'), miss: { no: 'She has not left, but voting against the whip is one of the two actions the law names.' } },
  { text: 'A voter backed Party A last time and backs Party C now.', is: 'no', why: 'Voters may change their choice at any election.', miss: { yes: 'Defection is about elected members, not voters.' } },
  { text: 'Party D wins and then changes a policy it had announced.', is: 'no', why: 'That is a party changing a policy. No member left.', miss: { yes: 'No member has left or voted against the party here.' } },
  { text: 'A Member of Parliament voluntarily gives up party membership.', is: 'yes', why: 'Giving up membership is the other action the law names.', then: { ask: 'What can happen to the member?', options: [
    { id: 'disq', text: 'Disqualified from the House', ok: true, why: 'Yes. The member can be disqualified from the respective House.' },
    { id: 'ban', text: 'Barred from voting for life', ok: false, why: 'The law says disqualified from the House, not a lifelong ban.' },
    { id: 'jail', text: 'Sent to jail by the ECI', ok: false, why: 'The law speaks of disqualification from the House.' },
  ] }, miss: { no: 'The member was elected on a ticket and has given up membership.' } },
];

export class FloorCrossingScene extends GameBoard {
  static HEIGHT = 300; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A game: six cases, one at a time. Decide if each is defection. If it is, choose who decides or what can follow.';
  static OBJECTIVE = { prompt: { en: 'Decide six cases: is it defection, and who decides what happens next?' } };
  async setup() {
    await super.setup();
    mountRounds(this, { key: 'fc', css: ROOMY_CSS, title: 'Defection or not?', sub: 'Tap one for each case.', cols: 2, colsP: 2,
      bins: [{ id: 'yes', label: 'Defection', tone: 1 }, { id: 'no', label: 'Not defection', tone: 5 }], items: CASES });
  }
  checkObjective() { return roundsResult(this); }
}
