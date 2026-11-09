// ElectionsDeck.js - arcade decks for L01 to L03 of the elections module.
// Each `why` is shown after a mix-up. `myth: true` marks an item students often get wrong.

// What an election is for: true or false, for ArcadeJudgeScene (L01).
export const ELECTION_MYTHS = {
  statements: [
    { text: 'Every citizen has one equal vote.', truth: true, why: 'equality means each voter has one vote, and each vote counts the same' },
    { text: 'A leader who did well can stay on after the term ends with no election.', truth: false, myth: true, why: 'a government cannot continue beyond its term without seeking the mandate of the people again' },
    { text: 'If only one party is contesting, voters can still make a real choice.', truth: false, myth: true, why: 'a choice needs more than one option, so one party alone leaves voters no choice to make' },
    { text: 'Elected representatives are accountable to the people.', truth: true, why: 'those elected must answer to the people, and voters judge them at the next election' },
    { text: 'The President of India is elected directly by all citizens.', truth: false, why: 'the President is chosen by an indirect election: citizens vote for representatives, who then elect the President' },
    { text: 'Members of the Lok Sabha are elected directly by citizens.', truth: true, why: 'citizens vote directly for members of the Lok Sabha every five years' },
    { text: 'Voting is only a right, and citizens have no responsibility in an election.', truth: false, why: 'an election is how we use the right to vote and fulfil our responsibility as citizens' },
    { text: 'In an indirect election, the process still starts with votes of citizens.', truth: true, why: 'citizens vote for representatives, and those representatives then choose the leaders' },
  ],
};

// Which count leads to which result, for ArcadeMatchScene (L02).
export const SYSTEM_RESULTS = {
  pairs: [
    { prompt: 'FPTP: A 40, B 35, C 25 in one constituency', answer: 'A wins the seat', why: 'under FPTP the most votes wins, even below 50 per cent' },
    { prompt: 'Majority system, Round 1: X 45, Y 40, Z 15', answer: 'X and Y compete again', myth: true, why: 'no one has more than 50 per cent, so the top two go to a second round' },
    { prompt: 'Majority system, Round 2: Y 55, X 45', answer: 'Y forms the government', why: 'Y now has more than 50 per cent of the votes' },
    { prompt: 'PR: M 40, N 35, O 15, P 10 per cent of votes', answer: '40, 35, 15 and 10 seats of 100', why: 'seats are allotted in proportion to the votes' },
    { prompt: 'Single transferable vote: a candidate reaches the quota', answer: 'That candidate is declared elected', why: 'the quota is the minimum number of votes needed to win' },
    { prompt: 'Single transferable vote: a candidate has the lowest votes', answer: 'Votes go to second preferences', myth: true, why: 'the lowest candidate is eliminated and those votes are transferred' },
  ],
};

// May a campaign do this? Allowed, or an electoral offence, for ArcadeSortScene (L03).
// Built only from the three examples in the Representation of the People Act, 1951.
export const CAMPAIGN_ACTIONS = {
  groups: [
    { id: 'allowed', label: 'allowed', tone: 2, why: 'none of the three examples of offences is involved here' },
    { id: 'offence', label: 'an electoral offence', tone: 5, why: 'this matches one of the three examples: a gift or promise, an appeal on identity, or help from government personnel' },
  ],
  items: [
    { name: 'A candidate gives a speech on her plan for the local road', is: 'allowed', why: 'she is asking voters to judge a plan, with no gift and no appeal to identity' },
    { name: 'A party prints a list of what it will do if elected', is: 'allowed', why: 'telling voters a plan is a normal part of a campaign' },
    { name: 'A candidate holds a public meeting and takes questions', is: 'allowed', why: 'answering voters is a normal part of a campaign' },
    { name: 'Volunteers knock on doors to ask people to go out and vote', is: 'allowed', why: 'no gift is given, and nobody is asked to vote by religion or caste' },
    { name: 'A helper gives money to a voter in return for a vote, with the candidate\'s consent', is: 'offence', myth: true, why: 'a gift made with a candidate\'s consent to make a person vote is an offence' },
    { name: 'A candidate promises a rival a job if the rival withdraws', is: 'offence', myth: true, why: 'the law covers a promise to make a person withdraw, as well as to make a person vote' },
    { name: 'A speaker asks people to vote on the basis of their religion', is: 'offence', why: 'an appeal to vote on the basis of religion, caste, race, community or language is an offence' },
    { name: 'A police officer campaigns in uniform for one candidate', is: 'offence', why: 'a candidate may not take help from police personnel or other government-related personnel' },
  ],
};
