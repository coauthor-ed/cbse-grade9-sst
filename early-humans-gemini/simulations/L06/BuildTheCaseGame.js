/**
 * BuildTheCaseGame - mini-game for les-06. Sort each find from Mehrgarh into three bins: it points to farming,
 * it fits foragers too, or it says nothing about food. Every tap gets its reason: weak clues add up only if you
 * know what each one can bear.
 */
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { SORT_FIT_H, SORT_FIT_CSS } from '../shared/SortFit.js';

const CARD = (id, big, small, answer, why) => ({ id, answer, why, html: `<span class="big">${big}</span><span class="small">${small}</span>`, chip: big, aria: `${big}, ${small}` });

const CSS = `
.bc .big { font-size: 17px; color: var(--sim-label); }
.bc .small { font-size: 14px; }
.bc .why { margin: 0; min-height: 40px; max-width: calc(100% - 210px); font-size: 15px; font-weight: 700; line-height: 1.25; }
.sim-dom-root--portrait .bc .why { max-width: none; }
.bc .why[data-ok="1"] { color: var(--sim-good); }
.bc .why[data-ok="0"] { color: var(--sim-bad); }
.bc .tray { --cols: 3; --cols-p: 2; }
.bc .card { min-height: 52px; padding: 3px; }
`;

export class BuildTheCaseGame extends SortBoard {
  static simId = 'build-the-case-game';
  static label = { en: 'Sort the Clues' };
  static category = 'social-science.history';
  static KEY = 'bc';
  static ARIA_LABEL = 'Seven finds from Mehrgarh. Sort each one: it points to farming, it fits foragers too, or it says nothing about food.';
  static OBJECTIVE = { prompt: { en: 'Sort each find by what it can tell us about food.' } };
  static HEAD = { kicker: 'Challenge', title: 'What can each clue tell us?', sub: 'Tap a card, then a bin.' };
  static CARDS = [
    CARD('grain', 'Farmed grain', 'wheat, barley', 'farm', 'Farmed wheat and barley look different from wild kinds, so this points to farming.'),
    CARD('bones', 'Herd bones', 'sheep, goats, cattle', 'farm', 'These are animals people keep, and the mix of ages suggests herds, so this points to farming.'),
    CARD('bins', 'Brick bins', 'rows of compartments', 'forage', 'Bins show storing, and foragers could store wild grain too.'),
    CARD('rooms', 'Brick rooms', 'a fixed home', 'forage', 'People can settle before they farm, as West Asia shows.'),
    CARD('tools', 'Stone tools', 'blades, scrapers', 'forage', 'Hunter-gatherers also used stone tools, so these fit foragers too.'),
    CARD('beads', 'Beads', 'lapis lazuli, carnelian', 'none', 'Beads point to contact with other places. They say nothing about food.'),
    CARD('graves', 'Graves', 'the buried dead', 'none', 'Graves show how the dead were treated. They say nothing about food.'),
  ];
  static BINS = [{ id: 'farm', label: 'Points to farming' }, { id: 'forage', label: 'Fits foragers too' }, { id: 'none', label: 'Says nothing about food' }];
  static LINE = 'Each clue can carry only so much.';
  static CSS = SORT_FIT_CSS + CSS;
  static HEIGHT = SORT_FIT_H;

  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parse

  _tapBin(bin) {
    const id = this._active;
    super._tapBin(bin);
    if (id === null) return;
    const card = this.constructor.CARDS.find((c) => c.id === id);
    if (!card) return;
    if (!this._why) {
      const board = this.root?.querySelector?.('.board');
      if (!board) return;
      this._why = document.createElement('p');
      this._why.className = 'why';
      this._why.setAttribute('aria-live', 'polite');
      board.after(this._why);
    }
    const ok = card.answer === bin;
    this._why.dataset.ok = ok ? '1' : '0';
    this._why.textContent = `${ok ? 'Yes.' : 'Not this bin.'} ${card.why}`;
  }

  wrongHint(card) { return card.why; }

}
