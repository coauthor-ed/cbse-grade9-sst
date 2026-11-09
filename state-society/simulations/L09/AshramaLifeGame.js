// AshramaLifeGame - tap a moment of a life, tap the stage it belongs to. Eight moments, four stages.
// Taught by L09 blk-l09-s01. The moments come from the book's plain names for the stages and its Fig. 5.8 idea.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { FIT_H, FIT_CSS, phoneBins } from '../shared/GameFit.js';

const card = (id, text, chip, answer) => ({ id, html: `<span class="moment">${text}</span>`, chip, aria: text, answer });

export class AshramaLifeGame extends SortBoard {
  static HEIGHT = FIT_H;
  static ARIA_LABEL = 'A sorting board. Eight moments of a life sit in a tray. Tap a moment, then tap one of the four stages of life to place it.';
  static OBJECTIVE = { prompt: { en: 'Place each moment of a life under the stage of life it belongs to.' } };
  static KEY = 'ash';
  static HEAD = { kicker: 'One life', title: 'Which stage is this?', sub: 'Tap a moment, then tap its stage.' };
  static LINE = 'Pick a moment first.';
  static BINS = [
    { id: 'b', label: 'Brahmacharya: student' },
    { id: 'g', label: 'G\u1E5Bihastha: householder' },
    { id: 'v', label: 'V\u0101naprastha: life in the forest' },
    { id: 's', label: 'Sa\u1E41ny\u0101sa: renunciation' },
  ];
  static CARDS = [
    card('m1', 'Learning from a teacher', 'teacher', 'b'),
    card('m2', 'Running a home', 'home', 'g'),
    card('m3', 'Giving up all belongings', 'belongings', 's'),
    card('m4', 'An older couple leaving for the forest', 'couple', 'v'),
    card('m5', 'Studying as a young pupil', 'pupil', 'b'),
    card('m6', 'Feeding and raising children', 'children', 'g'),
    card('m7', 'Moving away from busy household life', 'moving away', 'v'),
    card('m8', 'Giving up worldly ties by choice', 'worldly ties', 's'),
  ];
  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parser
  static CSS = `
.gm.ash { background: var(--sim-bg-deep); border-radius: 14px; }
.ash .tray { --cols: 4; --cols-p: 2; }
.ash .card { min-height: 62px; }
.ash .moment { font-size: 15px; font-weight: 700; line-height: 1.25; }
${FIT_CSS}${phoneBins('ash')}`;
  wrongHint(c) { return `Look again at the card about ${c.chip}.`; }
}
