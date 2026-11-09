// AdminUnitMatchScene - blk-l06-a01, the twelve-term level match.
//
// This scene is a CONFIG and nothing else: ArcadeMatchScene draws the bubbles, the
// why cards, the boss round and the end card, and all the work is in the deck's
// ADMIN_UNIT_MATCH (simulations/L01/StateSocietyDeck.js), which this scene adds beside
// VEDA_PARTS without editing it.
//
// Pairs are level families, so a term meets the other names for its own level. valanadu and nadu
// are marked Chola: the words sit one step lower in the Chola list.
import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { ADMIN_UNIT_MATCH } from '../L01/StateSocietyDeck.js';

export class AdminUnitMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Level match: twelve administrative terms drift past as bubbles. Tap the bubble with the level each term names. Two of the twelve are not levels: gramika is a village headman and variyam is a village committee.';
  static CONFIG = {
    ...ADMIN_UNIT_MATCH,
    title: 'Which level?',
    ask: 'Tap the level this term names',
    how: 'Two words can name the same level, and two of the twelve are not levels at all.',
    skin: 'bubbles',
    rounds: 12,
  };
}