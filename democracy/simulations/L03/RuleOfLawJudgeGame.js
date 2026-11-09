// RuleOfLawJudgeGame - L03 game: eight cases, Rule of Law kept or broken. Four come from the book's
// question 4. Board and control names: shared/MatterRounds.js ([data-bin=kept], [data-bin=broken], [data-next]).
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult } from '../shared/MatterRounds.js';
import { civicHtml } from '../shared/CivicArt.js';

const K = 'kept', B = 'broken';
const items = [
  ['Laws are applied equally to all.', K, 'No one is above the law, so the Rule of Law is kept.', 'Equal treatment is what the Rule of Law asks for.'],
  ['A powerful person is treated as above the law.', B, 'Under the Rule of Law, no one is above the law.', 'Nobody may stand above the law, however powerful.'],
  ['Courts review government actions.', K, 'A court can check the government, because the law binds the government too.', 'A court reviewing the government is the law at work.'],
  ['Citizens challenge a law through legal means.', K, 'Going through the law is the right way to disagree with a law.', 'Legal means are allowed. Force would not be.'],
  ['A crowd beats a man it suspects of theft.', B, 'Disputes go to a court of law, not to force.', 'A crowd is using force in place of a court.'],
  ['A man is punished with no hearing at all.', B, 'No citizen can be punished without the procedure established by law.', 'He had no fair chance to defend himself.'],
  ["A minister's son runs a red signal, and the police let him go.", B, 'Personal influence must not change how the law is applied.', 'Influence changed how the law was applied.'],
  ['A rich trader and a poor farmer get the same notice for the same offence.', K, 'People in similar circumstances are treated equally by law.', 'The same offence got the same notice.'],
].map(([text, is, why, miss]) => ({ text, is, why, miss: { [is === K ? B : K]: miss } }));

export class RuleOfLawJudgeGame extends GameBoard {
  static ARIA_LABEL = 'A sorting game. Eight cases appear one at a time. Tap whether the Rule of Law is kept or broken in each. A wrong choice says why and the card stays.';
  static OBJECTIVE = { prompt: { en: 'Decide whether the Rule of Law is kept or broken in each case.' } };

  async setup() {
    await super.setup();
    mountRounds(this, {
      key: 'rj', title: 'Rule of Law: kept or broken?', sub: 'Read the case, then tap your answer.', items, cols: 2,
      bins: [
        { id: 'kept', label: 'Kept', tone: 3, art: civicHtml('court', { size: 76 }) },
        { id: 'broken', label: 'Broken', tone: 6, art: civicHtml('court', { size: 76, dim: () => true }) },
      ],
    });
  }

  checkObjective() { return roundsResult(this); }
}
