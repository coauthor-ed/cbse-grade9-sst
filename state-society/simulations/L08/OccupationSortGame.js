// OccupationSortGame - blk-l08-s07. A plain evidence match: each source to what it shows.
// It never moves a household between varnas. Class name kept for the recipes; kit SortBoard.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { FIT_H, FIT_CSS, phoneBins } from '../shared/GameFit.js';

const card = (id, text, small, chip, answer) => ({ id, html: `<span class="m">${text}</span><span class="small">${small}</span>`, chip, name: text, aria: `${text}, ${small}`, answer });

export class OccupationSortGame extends SortBoard {
  static HEIGHT = FIT_H;
  static ARIA_LABEL = 'A game: five sources are matched to what each one shows.';
  static OBJECTIVE = { prompt: { en: 'Match each source to what it shows.' } };
  static KEY = 'osg';
  static HEAD = { kicker: 'Match the source', title: 'What does each source show?', sub: 'Tap a source, then tap what it shows.' };
  static LINE = 'Read each source with care.';
  static CARDS = [
    card('rig', '\u1E5Aigveda 9.112.3', 'a verse', '\u1E5Aigveda', 'family'),
    card('man', 'Mandsaur inscription', '473 CE', 'Mandsaur', 'guild'),
    card('kar', 'Karitalai copper plates', 'late 5th c. CE', 'Karitalai', 'land'),
    card('pat', 'Pattinappalai', 'Sangam text', 'Pattinappalai', 'trades'),
    card('sut', 'Sutta Nipa\u0304ta', 'Buddhist text', 'Sutta Nipa\u0304ta', 'deeds'),
  ];
  static BINS = [
    { id: 'family', label: 'Different occupations in one family' },
    { id: 'guild', label: 'Silk weavers skilled in other work too' },
    { id: 'land', label: 'Br\u0101hma\u1E47as as land managers' },
    { id: 'trades', label: 'Many occupational groups interacting' },
    { id: 'deeds', label: 'A person is such by deeds, not birth' },
  ];
  static CSS = `${FIT_CSS}
    .osg { --cols: 2; --cols-p: 2; }
    .osg .card { min-height: 54px; }
    .osg .board { grid-template-columns: minmax(0, 1fr) 620px; }
    .osg .bins { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); max-height: none; overflow: visible; }
    .osg .bin { min-height: 56px; }
    ${phoneBins('osg')}
    .sim-dom-root--portrait .osg .bin:last-child { grid-column: 1 / -1; }
    .sim-dom-root--portrait .osg .card[data-placed="1"] .small { display: none; }
    .sim-dom-root--portrait .osg .card[data-placed="1"] { min-height: 44px; }
    .osg .m { font-size: 15px; font-weight: 800; line-height: 1.2; }
`;

  // The harness DOM has no parser, so the kit board finds no bins there.
  _render() { if (this.root.querySelector('.bin')) super._render(); }

  wrongHint(c) { return `Read ${c.name} again: think of what it records.`; }
}
