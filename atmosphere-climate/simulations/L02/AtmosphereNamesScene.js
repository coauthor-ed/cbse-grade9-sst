import { NameDecoderScene } from 'simulations/base/kit/NameDecoderScene.js';

// Taking the names apart (blk-l02-s09). Two rounds on the kit's decode board:
// beat 0 works each name out from its pieces, beat 1 turns it round and gives
// the plain description instead. Every root, meaning and face below comes from
// the course glossary through config.glossaryTerm(id) - this file names ids and
// nothing else, so a later edit to a root in glossary.json changes this scene
// with no code change. No altitude, no band, no temperature: names only.

const LAYERS = ['troposphere', 'stratosphere', 'mesosphere', 'thermosphere', 'exosphere'];
const BOUNDARIES = ['tropopause', 'stratopause', 'mesopause'];
const OTHERS = ['ozone', 'aurora'];

const BEATS = [
  {
    // Beat 0: the pieces and what each one means.
    ariaLabel: 'Atmosphere layer names: read the pieces and pick the name they make',
    mode: 'decode',
    noun: 'layer',
    title: 'Read the name',
    // Compounds first, then the two single words - the order the slide meets them.
    terms: [...LAYERS, ...OTHERS],
    // The kit already unions terms into the pool; naming it keeps the decoy
    // set fixed if a term is ever dropped.
    pool: [...LAYERS, ...OTHERS],
    done: 'Each name describes its layer. Tap a dotted word in the lessons to see its card again.',
  },
  {
    // Beat 1: the other way round - the plain thing in, the name out. The five
    // descriptions are the slide's, in the slide's order, so they are the terms.
    ariaLabel: 'Atmosphere layer names: given the plain description, pick the name',
    mode: 'recall',
    noun: 'layer',
    title: 'Now the other way',
    terms: LAYERS,
    // The *-pause boundaries ride along as recall decoys, never as decode items.
    pool: [...LAYERS, ...BOUNDARIES, ...OTHERS],
    done: 'Well done. You can now go from the description to the name.',
  },
];

export class AtmosphereNamesScene extends NameDecoderScene {
  static CONFIG = BEATS[0];
  static ARIA_LABEL = BEATS[0].ariaLabel;

  async setup() {
    await super.setup();
    this.injectStyle('.nd-hintbtn { min-height: 54px; }');
  }

  onBeatChange(beatIndex) {
    const cfg = BEATS[beatIndex > 0 ? 1 : 0];
    // The host syncs to the current beat right after mount; re-queueing there
    // would wipe a board the learner has already answered.
    if (this.cfg === cfg && this.board) return;
    this.cfg = cfg;
    this.mode = cfg.mode;
    this.root?.setAttribute('aria-label', cfg.ariaLabel);
    this._start();
  }
}
