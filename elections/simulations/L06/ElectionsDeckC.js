// ElectionsDeckC.js - decks for the L06, L07 and L08 arcades. A helper, not a scene.
// No real party, no party colour, no drawn symbol. Party A to E are made up.

export const PARTY_ORDERS = {
  sequences: [
    { title: 'From citizens to the winning side: first to last', items: [
      'Citizens', 'Political parties', 'Contest elections', 'Winning party', 'Forms government',
    ], why: 'parties organise opinion among citizens, contest elections, and only then does the result make one the winning party' },
    { title: 'From a win to a policy: first to last', items: [
      'Winning party', 'Forms government', 'Formulates policies', 'Implements policies',
    ], why: 'the winning party forms the government, and a government makes a policy before it puts it into action' },
    { title: 'What the ECI does with a party: first to last', items: [
      'Registers the party', 'Classifies the party', 'Allots a symbol to national and State parties',
    ], why: 'a party registers first, then it is classified, and the class decides who is allotted a symbol' },
  ],
};

export const PARTY_CLASSES = {
  ask: 'Which class, by which route?',
  pairs: [
    { prompt: 'Party A: 6% of votes in four States, and four Lok Sabha seats', answer: 'National, Route 1', group: 'n', art: false, why: 'votes in four or more States plus four seats is the first national route' },
    { prompt: 'Party B: 2% of Lok Sabha seats, from three States', answer: 'National, Route 2', group: 'n', art: false, why: 'seats won across three States is the second national route' },
    { prompt: 'Party C: a State party in four States', answer: 'National, Route 3', group: 'n', art: false, why: 'State recognition in four States is the third national route' },
    { prompt: 'Party D: 8% of the valid votes in its State', answer: 'State party', group: 'n', art: false, why: '8% of the valid votes polled in the State is one of the five State routes' },
    { prompt: 'Party E: never contested since it registered', answer: 'Registered unrecognised', group: 'n', art: false, why: 'a party that has never contested since registration stays registered unrecognised' },
  ],
};

export const MISCONDUCT_SORT = {
  groups: [
    { id: 'fear', label: 'Intimidation', why: 'someone is being frightened' },
    { id: 'false', label: 'False information', why: 'voters are being told something untrue' },
    { id: 'bribe', label: 'Bribe', why: 'something is being offered for a vote' },
  ],
  items: [
    { name: 'Men block the lane to the booth', is: 'fear', art: false },
    { name: 'A threat to a family who vote', is: 'fear', art: false },
    { name: 'A warning: stay home or else', is: 'fear', art: false },
    { name: 'A message: polling date moved', is: 'false', art: false },
    { name: 'A fake notice from the ECI', is: 'false', art: false },
    { name: 'A rumour: the booth is closed', is: 'false', art: false },
    { name: 'Cash handed out at night', is: 'bribe', art: false },
    { name: 'A gift in return for a vote', is: 'bribe', art: false },
  ],
};
