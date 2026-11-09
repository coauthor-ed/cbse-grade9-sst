import { NameDecoderScene } from 'simulations/base/kit/NameDecoderScene.js';

// L03 s05 - the chapter's second decode mount (L01's PebbleNameScene is the
// first). Every root, meaning and face comes from courses/elections/glossary.json
// through config.glossaryTerm(id), so this file repeats no data of its own and a
// later edit to a root in the glossary changes the board with no code change.
// The slide is the name alone: no map, no dates, no Article 82, no statute.
const CONFIG = {
  ariaLabel:
    'Split a name into its two old pieces, choose what they name, and watch the word assemble.',
  mode: 'decode',
  // the learner is picking what the two pieces name, which is a process
  noun: 'process',
  // the only name this slide meets. pool stays empty: the chapter's other name
  // (psephos) is L01's, and a second term here would make this a recall round.
  terms: ['delimitation'],
  pool: [],
};

export class DelimitationNameScene extends NameDecoderScene {
  static CONFIG = CONFIG;
  static ARIA_LABEL = CONFIG.ariaLabel;
  static BEAT_STEP_MAP = [[{ idx: 0 }], [{ idx: 1 }]];
}
