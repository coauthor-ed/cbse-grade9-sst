// PotholeGuardScene - L08 game. Six challenges on the road to the booth: tap what helps. A wrong pick says
// why and the card stays. Control names: [data-bin=aware|police|vvpat|cvigil|access], [data-next].
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult, ROOMY_CSS } from '../shared/MatterRounds.js';

const CASES = [
  { text: 'A message says polling has moved to another day. Many believe it.', is: 'aware', why: 'Awareness campaigns tell voters the true dates.', miss: { police: 'Police guard a station. They do not correct a false message.', vvpat: 'The VVPAT checks a vote. It cannot correct a rumour.', cvigil: 'A report is for a violation you saw. Voters here need the true date.', access: 'Everyone can reach the booth. The trouble is a false date.' } },
  { text: 'Men are threatening voters at the gate of a polling station now. An officer is close by.', is: 'police', why: 'Police at the station keep voters safe from threats.', miss: { aware: 'Voters know the facts. They are being frightened.', vvpat: 'The VVPAT works inside the booth. This is outside.', cvigil: 'The officer is steps away. No report is needed to reach the gate.', access: 'The road is open. The trouble is the threat.' } },
  { text: 'A voter wants to check that her vote went to the right candidate.', is: 'vvpat', why: 'The VVPAT slip shows behind a small window for a few seconds.', miss: { aware: 'She has already voted. What can she see right now?', police: 'No one is threatening her.', cvigil: 'Nothing has gone wrong yet. She only wants to check.', access: 'She is already at the machine.' } },
  { text: 'A voter saw a helper hand out money near a polling station, and has now left.', is: 'cvigil', why: 'cVIGIL lets a voter report it within minutes, and a flying squad goes there.', miss: { aware: 'Campaigns teach. This voter has something to report.', police: 'The voter has left the station. Only a report can name the spot now.', vvpat: 'The VVPAT shows a vote. It cannot stop a bribe.', access: 'Reaching the booth is not the trouble here.' } },
  { text: 'A voter in a wheelchair reaches a polling station with steps.', is: 'access', why: 'A wheelchair and volunteers help him to reach the machine.', miss: { aware: 'He knows the date. He needs help at the steps.', police: 'No one is threatening him.', vvpat: 'He cannot reach the machine yet.', cvigil: 'He has no violation to report. He needs help at the steps.' } },
  { text: 'A fake news video about polling spreads on phones.', is: 'aware', why: 'Awareness campaigns teach voters to check before they trust a video.', miss: { police: 'The video is on phones, and not at the station.', vvpat: 'The VVPAT checks a vote. It cannot stop a video.', cvigil: 'A report covers one violation. Voters must learn to check what they see.', access: 'Everyone can reach the booth. The trouble is a false video.' } },
];

export class PotholeGuardScene extends GameBoard {
  static HEIGHT = 330; // landscape board: its tallest state, every card and reply
  static ARIA_LABEL = 'A game: six challenges on the road to the booth, one at a time. Tap what helps with each. A wrong pick says why.';
  static OBJECTIVE = { prompt: { en: 'Six challenges on the road to the booth: pick what helps with each one.' } };
  async setup() {
    await super.setup();
    mountRounds(this, { key: 'pg', css: ROOMY_CSS, title: 'Clear the road', sub: 'Tap what helps.', cols: 2, colsP: 2,
      bins: [{ id: 'aware', label: 'Awareness campaign', tone: 1 }, { id: 'police', label: 'Police at the station', tone: 5 }, { id: 'vvpat', label: 'VVPAT slip', tone: 3 }, { id: 'cvigil', label: 'cVIGIL report', tone: 4 }, { id: 'access', label: 'Wheelchair, volunteers', tone: 7 }], items: CASES });
  }
  checkObjective() { return roundsResult(this); }
}
