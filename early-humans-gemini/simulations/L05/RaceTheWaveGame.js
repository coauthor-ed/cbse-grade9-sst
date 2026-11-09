/**
 * RaceTheWaveGame - mini-game for les-05 (the file keeps its name; the game is now "Spread or new start?").
 * Sort events: did farming start anew there, using a local plant, or did it arrive from elsewhere? Every tap gets
 * the reason, right or wrong, because the reasons are the lesson.
 */
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { SORT_FIT_H, SORT_FIT_CSS } from '../shared/SortFit.js';

const CARD = (id, big, small, answer, why) => ({ id, answer, why, html: `<span class="big">${big}</span><span class="small">${small}</span>`, chip: big, aria: `${big}, ${small}` });

const CSS = `
.sw .big { font-size: 17px; color: var(--sim-label); }
.sw .small { font-size: 14px; }
.sw .why { margin: 0; min-height: 40px; max-width: calc(100% - 210px); font-size: 15px; font-weight: 700; line-height: 1.25; }
.sim-dom-root--portrait .sw .why { max-width: none; }
.sw .why[data-ok="1"] { color: var(--sim-good); }
.sw .why[data-ok="0"] { color: var(--sim-bad); }
`;

export class RaceTheWaveGame extends SortBoard {
  static simId = 'race-the-wave-game';
  static label = { en: 'Spread or New Start?' };
  static category = 'social-science.history';
  static KEY = 'sw';
  static ARIA_LABEL = 'Five events in the history of farming. Sort each one as a new start with a local plant, or as a spread from elsewhere.';
  static OBJECTIVE = { prompt: { en: 'Sort each event: a new start, or a spread?' } };
  static HEAD = { kicker: 'Challenge', title: 'Spread or new start?', sub: 'Tap a card, then a bin. Look at the plant, not only the date.' };
  static CARDS = [
    CARD('rice', 'Rice', 'on the Yangtze', 'new', 'Rice grew wild in that part of the world, so this was a new start with a local plant.'),
    CARD('mil', 'Millets', 'in north China', 'new', 'Millets are local plants of north China, and they are not a copy of wheat. A new start.'),
    CARD('pearl', 'Pearl millet', 'in West Africa', 'new', 'Pearl millet is a local plant of West Africa. Being late does not make it a copy.'),
    CARD('wheat', 'Wheat, barley', 'at Mehrgarh', 'spread', 'These are the crops of West Asia, so they probably travelled to Mehrgarh from there.'),
    CARD('sub', 'Most of the subcontinent', 'farming by 2500 BCE', 'spread', 'Farming reached most of the subcontinent over time. That is a spread.'),
  ];
  static BINS = [{ id: 'new', label: 'New start: a local plant' }, { id: 'spread', label: 'Spread from elsewhere' }];
  static LINE = 'Is it a local plant, or did it travel?';
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
