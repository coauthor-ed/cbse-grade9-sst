import { NameDecoderScene } from 'simulations/base/kit/NameDecoderScene.js';

// Producing the four names from memory (blk-l08-s07). The chapter's one recall
// round, and its last slide: two rounds a beat, four rounds in all, on the kit's
// recall board. Every root, meaning and face comes from the course glossary
// through config.glossaryTerm(id) - this file names ids and nothing else, so a
// later edit to a root in glossary.json changes this scene with no code change.
// No temperature, no concentration, no percentage, no year, no band and no
// score: the four names and what they call, and nothing else.
//
// The kit unions terms into the pool and draws the right option plus
// others[at] and others[at+1] of the pool minus the current term, at = position
// + the term's index in terms. Every pool below is ordered so that this
// rotation puts the decoys the stub calls for on the board - see the design
// note, which works each one out.

const BEATS = [
  {
    // Beat 0: the first pair, insolation then monsoon.
    ariaLabel: 'Chapter names, first pair: given the meaning and the face, produce the name',
    mode: 'recall',
    // The everyday name is hidden under the face until a miss asks for it: the
    // fade docs/glossary.md reserves for the end of a course. 'idea' keeps the
    // prompt from naming the thing and handing the answer over.
    plainCue: false,
    noun: 'idea',
    title: 'The first two',
    terms: ['insolation', 'monsoon'],
    // insolation draws monsoon and albedo - the sibling name from the chapter's
    // own list, and the word a learner reaches for when the energy from the Sun
    // will not come. monsoon draws isobar and equable: two ordinary English words
    // for ordinary things, neither of them a season and neither of them a
    // reversal of anything.
    pool: ['albedo', 'isobar', 'equable'],
    done: 'Two names, no pieces to lean on. That is what the last four slides were for.',
  },
  {
    // Beat 1: the last pair, both with no roots, so no cue button at all.
    ariaLabel: 'Chapter names, last pair: given the meaning and the face, produce the name',
    mode: 'recall',
    plainCue: false,
    noun: 'idea',
    title: 'The last two',
    terms: ['greenhouse gas', 'carbon footprint'],
    // greenhouse gas draws carbon footprint and ozone: the other half of the
    // pair, and a gas the chapter has met. carbon footprint draws monsoon and
    // greenhouse gas - the two things the pair could be confused with, the
    // wind one first so the swap is a tap away.
    pool: ['ozone', 'monsoon'],
    done: 'Four names, none of them assembled and none of them guessed. Learned, the hard way.',
  },
];

export class ChapterNamesRecallScene extends NameDecoderScene {
  static CONFIG = BEATS[0];
  static ARIA_LABEL = BEATS[0].ariaLabel;

  onBeatChange(beatIndex) {
    const cfg = BEATS[Math.min(beatIndex, BEATS.length - 1)];
    // The host syncs to the current beat right after mount; re-queueing there
    // would wipe a board the learner has already answered.
    if (this.cfg === cfg && this.board) return;
    this.cfg = cfg;
    this.mode = cfg.mode;
    this.root?.setAttribute('aria-label', cfg.ariaLabel);
    this._start();
  }

  // The kit's closing card opens with a count ("2 of 2 first time"), a recap
  // sentence and a grid of every name in the round. The stub asks for no score
  // screen, no summary and no pool round - the slide's closing line is the
  // prose's - so this keeps the kit's paragraph, the scene's own done line and
  // the kit's Go again button, and drops the count and the grid. Markup and
  // classes are the kit's, unchanged.
  _end() {
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    return { stage: `<p class="nd-prompt">${esc(this.cfg.done || '')}</p>`, foot: `<button type="button" class="ek-btn" data-act="again">Go again</button>` };
  }
}