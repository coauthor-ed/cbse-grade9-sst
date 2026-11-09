// DharmaMythJudgeScene - eight statements about dharma and the words around it, one card at a
// time. Three are false, all carry myth: true, so the boss round is drawn from them.
import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { DHARMA_TERMS } from '../L01/StateSocietyDeck.js';

export class DharmaMythJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'A true-or-false game about dharma: one statement on a card at a time, from eight. Swipe the card right for true or left for false, or tap the buttons; a wrong call shows the evidence and the card comes back later. Three of the eight are false.';
  static CONFIG = {
    ...DHARMA_TERMS,
    title: 'Which of these is true?',
    skin: 'cards',
    rounds: 12,
    // Every card is a sentence to read and judge, not a noun to recognise, so
    // the card gets 12 s against the engine's 9. The clock punishes a slip, not
    // a wrong call: a wrong call costs the streak and shows the why card.
    think: 12,
  };

  /**
   * The engine builds the boss round as the learner's misses first, then the
   * `myth` set, and keeps only the first four. This deck has three myths, so a
   * learner who missed two ordinary cards would push the third myth out of a
   * round the stub requires all three to be in. Myths first fixes that and
   * changes nothing else: same pool, same shuffle, same four cards.
   */
  bossItems() {
    const pool = this.cfg.statements || [];
    const myths = pool.filter((s) => s && s.myth && !this.run.missed.has(s));
    const rest = pool.filter((s) => s && !s.myth && this.run.missed.has(s));
    const shuffle = (a) => {
      const b = [...a];
      for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
      }
      return b;
    };
    return shuffle(myths).concat(shuffle(rest));
  }
}
