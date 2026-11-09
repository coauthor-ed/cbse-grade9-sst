import { ArcadeRouteScene } from 'simulations/base/kit/ArcadeRouteScene.js';
import { SAPTANGA_LIMBS } from '../L01/StateSocietyDeck.js';

// Twelve situations run down a three-branch key to one of the seven Sapt\u0101\u1E41ga limbs. Road skin.
// Taught by L04 s03. The deck is the work here; the key's first three questions are the
// inside/outside, land-or-money and arms-or-walls fork, and the questions below them are what
// make ko\u1E63ha and sw\u0101mi reachable at all.
export class SaptangaRouteScene extends ArcadeRouteScene {
  static ARIA_LABEL =
    'Key run: each situation runs through yes/no gates to one of the seven limbs of a state - '
    + 'first whether it is about people inside the state or outside it, then land and crops or money and goods, '
    + 'then armed force or walls and towns. The things you can see in a situation are often not the limb it is about.';
  static CONFIG = {
    ...SAPTANGA_LIMBS,
    title: 'Which limb? Run the key',
    how: 'Answer each question by what the situation is about, not only by what you can see in it.',
    skin: 'road',
    rounds: 8,
    gate: 6,
  };
}