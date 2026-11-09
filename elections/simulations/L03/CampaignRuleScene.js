// CampaignRuleScene - L03 game: five campaign situations, three replies each; every reply says why.
// Board and control names: shared/ReplyRounds.js ([data-reply=a|b|c], [data-next]).
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountReplies, repliesResult } from '../shared/ReplyRounds.js';

const items = [
  { tag: 'Situation 1', text: 'A supporter offers to give cash to voters who promise to vote for your candidate.', replies: [
    { id: 'a', text: 'Agree, if the candidate is not told', why: 'Cash for votes is an offence whether or not the candidate is told. Do not take part.' },
    { id: 'b', text: 'Refuse the offer', ok: true, why: 'A gift made to make a person vote is an electoral offence.' },
    { id: 'c', text: 'Agree, if the sum is small', why: 'The law says any gift, offer or promise, whatever its size.' },
  ] },
  { tag: 'Situation 2', text: 'A helper wants posters asking people to vote on the basis of their caste.', replies: [
    { id: 'a', text: 'Print them for one area only', why: 'An appeal on the basis of caste is an offence in any area.' },
    { id: 'b', text: 'Print them, but leave out the candidate\'s name', why: 'It would still be an appeal on your candidate\'s behalf.' },
    { id: 'c', text: 'Say no, and print the plan for the area', ok: true, why: 'An appeal on religion, caste, race, community or language is an offence. A plan is lawful.' },
  ] },
  { tag: 'Situation 3', text: 'A police officer offers to speak at your rally in favour of your candidate.', replies: [
    { id: 'a', text: 'Thank the officer and decline', ok: true, why: 'A candidate may not take help from police personnel.' },
    { id: 'b', text: 'Accept, if the officer is off duty', why: 'A police officer is named in the list of government-related personnel.' },
    { id: 'c', text: 'Accept, but only for a short speech', why: 'Any assistance in favour of the candidate is ruled out.' },
  ] },
  { tag: 'Situation 4', text: 'A rival candidate might withdraw if you promise him a job later.', replies: [
    { id: 'a', text: 'Promise it, as nobody is voting', why: 'The law covers making a person withdraw, as well as vote.' },
    { id: 'b', text: 'Make no such promise', ok: true, why: 'A promise made to make a person withdraw is an electoral offence.' },
    { id: 'c', text: 'Let a friend make the promise', why: 'A promise made with the candidate\'s consent counts in the same way.' },
  ] },
  { tag: 'Situation 5', text: 'Your candidate wants to speak at a public meeting about the local hospital.', replies: [
    { id: 'a', text: 'Cancel it, as all campaigning is risky', why: 'Campaigning is allowed. The law gives rules for it.' },
    { id: 'b', text: 'Add a promise of gifts for those who vote', why: 'A speech is fine, but a promise made to win a vote is an offence.' },
    { id: 'c', text: 'Hold the meeting', ok: true, why: 'Talking about a plan is lawful. None of the three examples applies.' },
  ] },
];

export class CampaignRuleScene extends GameBoard {
  static HEIGHT = 350; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A game of five campaign situations. Each has three replies. Tap one, and it says why it is right or wrong. You can try again.';
  static OBJECTIVE = { prompt: { en: 'Choose the lawful reply in five campaign situations.' } };

  async setup() {
    await super.setup();
    mountReplies(this, { key: 'cr', title: 'Stay within the law', sub: 'Tap the reply you would give.', items });
  }

  checkObjective() { return repliesResult(this); }
}
