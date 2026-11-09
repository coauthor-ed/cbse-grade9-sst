import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { VEDA_PARTS } from './StateSocietyDeck.js';

// The four parts inside a Veda, plus a fifth crate for texts that are not part
// of one. Taught by L01 s04.
export class VedaPartsSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Which part of a Veda? Six texts ride a conveyor belt; tap the crate for the part each belongs to - samhit\u0101, br\u0101hma\u1E47a, \u0101ra\u1E47yaka, upani\u1E63had, or none of these.';
  static CONFIG = {
    ...VEDA_PARTS,
    title: 'Which part of a Veda?',
    how: 'Tap the crate each text belongs in. One crate is "none of these".',
    skin: 'belt',
    rounds: 12,
    fall: 10,
  };
}
