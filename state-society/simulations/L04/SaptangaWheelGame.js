// SaptangaWheelGame - L04 s06 mini-game. A plain tap-match: each situation to the limb that
// answers it. Board and control names: shared/MatterRounds.js. Class name stays for recipes.
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { mountRounds, roundsResult } from '../shared/MatterRounds.js';

const items = [
  ['Who holds supreme authority in the state?', 'swami', 'The king, the sw\u0101mi, is the first of the seven constituents.'],
  ['The king needs ministers to advise him on a hard decision.', 'amatya', 'The am\u0101tya are the councillors, ministers and other high officials.'],
  ['Farmers and their villages make up the kingdom.', 'janapada', 'Janapada means the territory of the state and the people living in it.'],
  ['A town must hold out behind strong walls.', 'durga', 'Durga means the fortified towns and cities.'],
  ['Officers must be paid, and money must be stored safely.', 'kosha', 'Ko\u1E63ha is the treasury or wealth of the kingdom.'],
  ['Raiders cross the border and order must be restored.', 'danda', 'Da\u1E47\u1E0Da is the forces of defence and law and order.'],
  ['A neighbouring ruler agrees to stand with this kingdom.', 'mitra', 'Mitra means the allies.'],
].map(([text, is, why]) => ({ text, is, why }));

export class SaptangaWheelGame extends GameBoard {
  static ARIA_LABEL = 'A matching game. One situation at a time appears on a card. Tap the limb of the state that answers it, from swami, amatya, janapada, durga, kosha, danda and mitra. A wrong choice leaves the card in place.';
  static OBJECTIVE = { prompt: { en: 'Match each situation to the limb of the state that answers it.' } };
  async setup() {
    await super.setup();
    mountRounds(this, {
      key: 'sw', title: 'Which limb?', sub: 'Tap the limb that answers this situation.', items, cols: 4, colsP: 2,
      bins: [
        { id: 'swami', label: 'sw\u0101mi', note: 'the king', tone: 2 }, { id: 'amatya', label: 'am\u0101tya', note: 'ministers', tone: 5 },
        { id: 'janapada', label: 'janapada', note: 'land, people', tone: 3 }, { id: 'durga', label: 'durga', note: 'forts', tone: 8 },
        { id: 'kosha', label: 'ko\u1E63ha', note: 'treasury', tone: 4 }, { id: 'danda', label: 'da\u1E47\u1E0Da', note: 'forces', tone: 6 },
        { id: 'mitra', label: 'mitra', note: 'allies', tone: 1 },
      ],
    });
  }
  checkObjective() { return roundsResult(this); }
}
