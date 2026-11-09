/**
 * WhatKindOfSourceGame - mini-game for les-12. Six short records, written for this game. Sort each one: a question asked
 * before the event, or a report written after it. Every tap gets its reason. The point: a question shows a worry, and
 * a report shows what the writer chose to say happened.
 */
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { SORT_FIT_H, SORT_FIT_CSS } from '../shared/SortFit.js';

const CARD = (id, big, answer, why) => ({ id, answer, why, html: `<span class="big">${big}</span>`, chip: big, aria: big });

const CSS = `
.wk .big { font-size: 16px; line-height: 1.2; color: var(--sim-label); }
.wk .why { margin: 0; min-height: 40px; max-width: calc(100% - 210px); font-size: 15px; font-weight: 700; line-height: 1.25; }
.sim-dom-root--portrait .wk .why { max-width: none; }
.wk .why[data-ok="1"] { color: var(--sim-good); }
.wk .why[data-ok="0"] { color: var(--sim-bad); }
.wk .tray { --cols: 3; --cols-p: 1; }
.wk .card { min-height: 64px; padding: 4px 6px; }
`;

export class WhatKindOfSourceGame extends SortBoard {
  static simId = 'what-kind-of-source-game';
  static label = { en: 'Question or Report?' };
  static category = 'social-science.history';
  static KEY = 'wk';
  static ARIA_LABEL = 'Six short records. Sort each one: a question asked before the event, or a report written after it.';
  static OBJECTIVE = { prompt: { en: 'Sort each record: a question asked before the event, or a report written after it.' } };
  static HEAD = { kicker: 'Challenge', title: 'Before, or after?', sub: 'Tap a card, then a bin.' };
  static CARDS = [
    CARD('rain', 'Will the rain come in time for the millet?', 'before', 'Nobody knows the answer yet, so this shows a hope and a fear.'),
    CARD('ill', "Will the king's illness pass?", 'before', 'It is asked before the outcome is known, so it shows a worry.'),
    CARD('army', 'Should the army march east?', 'before', 'This is a decision still to be made, so it is a question to the spirits.'),
    CARD('took', 'In the third year the king marched east and took the town.', 'after', 'The ending is known, so a writer chose to report it.'),
    CARD('full', 'That year the harvest filled twelve stores.', 'after', 'This reports a result. It shows no doubt at all.'),
    CARD('well', 'The king recovered and ruled for twenty more years.', 'after', 'Only a later writer could know this.'),
  ];
  static BINS = [{ id: 'before', label: 'A question, before the event' }, { id: 'after', label: 'A report, after the event' }];
  static LINE = 'A question shows a fear. A report shows what someone chose to tell.';
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
