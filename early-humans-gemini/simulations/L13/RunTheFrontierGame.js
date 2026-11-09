/**
 * RunTheFrontierGame - mini-game for les-13. Six stretches of wall, each from a different time, go to the builders of that time. The bin "One emperor, one campaign" is always wrong, and its reply says why: that is the idea this lesson removes. The cards are simplified for the game.
 */
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { SORT_FIT_H, SORT_FIT_CSS } from '../shared/SortFit.js';

const CARD = (id, big, answer, why) => ({ id, answer, why, html: `<span class="big">${big}</span>`, chip: big, aria: big });

const CSS = `
.rf .big { font-size: 16px; line-height: 1.2; color: var(--sim-label); }
.rf .why { margin: 0; min-height: 40px; max-width: calc(100% - 210px); font-size: 15px; font-weight: 700; line-height: 1.25; }
.sim-dom-root--portrait .rf .why { max-width: none; }
.rf .why[data-ok="1"] { color: var(--sim-good); }
.rf .why[data-ok="0"] { color: var(--sim-bad); }
.rf .tray { --cols: 3; --cols-p: 1; }
.rf .card { min-height: 64px; padding: 4px 6px; }
.rf .bins { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.rf .bin { min-height: 52px; padding: 3px 8px; }
.rf .bin:last-child { grid-column: 1 / -1; min-height: 44px; }
.rf .card { min-height: 56px; }
`;

export class RunTheFrontierGame extends SortBoard {
  static simId = 'run-the-frontier-game';
  static label = { en: 'Who Built This Stretch?' };
  static category = 'social-science.history';
  static KEY = 'rf';
  static ARIA_LABEL = 'Six stretches of the Great Wall, each from a different time. Give each one to the builders of that time. One emperor in one campaign fits none of them.';
  static OBJECTIVE = { prompt: { en: 'Six stretches of wall, each from a different time. Give each one to the builders of that time.' } };
  static HEAD = { kicker: 'Challenge', title: 'Who built this stretch?', sub: 'Tap a card, then a bin.' };
  static CARDS = [
    CARD('a', 'Walls against raids, from 680 BCE', 'zhou', 'The book says the first walls came from the Zhou and other dynasties.'),
    CARD('b', 'A second early wall, far to the east', 'zhou', 'The early walls stood apart, and several rulers built them.'),
    CARD('c', 'Separate walls joined, after 221 BCE', 'qin', 'Historians link much of the joining with the Qin, who had just united China.'),
    CARD('d', 'Rammed earth pushed west, by the desert', 'han', 'The Han extended the line west, in rammed earth.'),
    CARD('e', 'A tower to guard a trade route', 'han', 'The route grew under the Han, so this western stretch fits them.'),
    CARD('f', 'Stone wall repaired, around 1600 CE', 'later', 'Expansion and repair went on until the 17th century CE.'),
  ];
  static BINS = [{ id: 'zhou', label: 'Zhou and others, from 680 BCE' }, { id: 'qin', label: 'Qin, 221 to 206 BCE' }, { id: 'han', label: 'Han, from 206 BCE' }, { id: 'later', label: 'Later rulers, to the 1600s CE' }, { id: 'solo', label: 'One emperor, one campaign' }];
  static LINE = 'Many builders, about two thousand years, and no single campaign.';
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
