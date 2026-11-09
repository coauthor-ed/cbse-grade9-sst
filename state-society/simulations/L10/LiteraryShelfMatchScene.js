import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { LITERARY_SHELF } from '../L01/StateSocietyDeck.js';

// Which kind of work is each one? Titles across five shelves, then the
// two practices that are not books at all. Taught by L10 s06 and L09 Bhakti. Targets
// pop up on the range; no art and no colour anywhere, so nothing gives the
// shelf away before the learner has worked.
export class LiteraryShelfMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL =
    'Literary shelf match: a work waits at the counter; hit the shelf target showing ' +
    'the kind of work it is - grammar texts, smriti on dharma and law, medicine, ' +
    'Sanskrit kavya, Tamil literature, bhakti, or the inner values of education.';
  static CONFIG = {
    ...LITERARY_SHELF,
    title: 'Which shelf does it belong to?',
    how: 'Hit the shelf showing the kind of work each one is. The last two are not books at all.',
    ask: 'Hit the shelf for this work',
    skin: 'range',
    rounds: 12,
    // The range skin spawns one target every drift/3.4 s and keeps at most 3
    // live, so the default 9 s leaves the lower spots alone for the opening
    // seconds and the stall reads empty. 7 s fills the spots sooner without
    // making a tap any less deliberate.
    drift: 7,
  };
}