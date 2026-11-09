import { NameDecoderScene } from 'simulations/base/kit/NameDecoderScene.js';

// Taking the name apart (blk-l05-s05). Two rounds on the kit's decode board:
// beat 0 works the one hard name out from its piece, beat 1 turns it round and
// asks for the name from the description - and the third description, the season
// rather than either wind, is the item the whole beat is for. Every root,
// meaning and face below comes from the course glossary through
// config.glossaryTerm(id): this file names ids and nothing else, so a later edit
// to a root in glossary.json changes this scene with no code change. No month,
// no year, no wheel, no coastline, no pressure, no rainfall figure: names only.

const BEATS = [
  {
    // Beat 0: the pieces, and what the one piece means.
    ariaLabel: 'Monsoon: read the piece and pick what the whole word points at',
    mode: 'decode',
    noun: 'name',
    title: 'Read the name',
    // One term: the slide's etymological work is a single word.
    terms: ['monsoon'],
    // ORDER MATTERS. With one item at position 0 the kit draws the first two
    // non-term pool entries as the two wrong chips, so the two wind readings -
    // the reading this chapter spends a slide taking away - lead the pool.
    // insolation and aurora are the stub's other named decoys and stay for the
    // pool to be stable if an item is ever added.
    pool: ['south-west-monsoon', 'north-east-monsoon', 'insolation', 'aurora'],
    done: 'One word, one piece, one ordinary meaning. Tap a dotted word in the lessons to see its card again.',
  },
  {
    // Beat 1: the other way round - the description in, the name out. The three
    // descriptions are the slide's, in the slide's order, so the season is last
    // and the load-bearing item is the one the beat exists for.
    ariaLabel: 'Monsoon: given the plain description, pick the name',
    mode: 'recall',
    noun: 'weather',
    title: 'Now the other way',
    terms: ['south-west-monsoon', 'north-east-monsoon', 'monsoon'],
    // The kit already unions terms into the pool, and at the third item its
    // rotation makes exactly the two wind names the wrong chips - which is what
    // lets the season item be judged.
    pool: ['south-west-monsoon', 'north-east-monsoon', 'monsoon'],
    done: 'Description in, name out. A name you can build from its pieces is a name you cannot get wrong.',
  },
];

export class MonsoonNameScene extends NameDecoderScene {
  static CONFIG = BEATS[0];
  static ARIA_LABEL = BEATS[0].ariaLabel;

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

  // The kit's closing card opens with a score line ("3 of 3 first time") and,
  // in recall mode, ignores `done` altogether. The stub asks for no score
  // screen and no summary sentence - the slide's closing line is the prose's -
  // so the recap grid stays and the two sentences on top of it are this
  // scene's. Markup and classes are the kit's own, unchanged.
  _end() {
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const rows = this.items.map((t) => `<div class="nd-row${this.missed.includes(t) ? ' nd-miss' : ''}" style="--c:${this._color(this._tone(t))}">${this._av(t)}<div><b>${esc(t.term)}</b><span>${esc(t.plain || '')}</span></div></div>`).join('');
    return `<p class="nd-prompt">${esc(this.cfg.done || '')}</p><div class="nd-wrap">${rows}</div>`;
  }
}
