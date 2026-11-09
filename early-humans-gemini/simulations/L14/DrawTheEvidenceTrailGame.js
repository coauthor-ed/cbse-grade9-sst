/**
 * DrawTheEvidenceTrailGame - mini-game for les-14. The old canvas map is gone. Six pairs of civilisations, three bins: strong contact, little evidence, this chapter does not say. Key from blk-l14-s03 and the book. Taps only.
 */
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { SORT_FIT_H, SORT_FIT_CSS } from '../shared/SortFit.js';

const CARD = (id, big, answer, why) => ({ id, answer, why, html: `<span class="big">${big}</span>`, chip: big, aria: big });

const CSS = `
.et .big { font-size: 16px; line-height: 1.2; color: var(--sim-label); }
.et .why { margin: 0; min-height: 40px; max-width: calc(100% - 210px); font-size: 15px; font-weight: 700; line-height: 1.25; }
.sim-dom-root--portrait .et .why { max-width: none; }
.et .why[data-ok="1"] { color: var(--sim-good); }
.et .why[data-ok="0"] { color: var(--sim-bad); }
.et .tray { --cols: 3; --cols-p: 1; }
.et .card { min-height: 64px; padding: 4px 6px; }
`;

export class DrawTheEvidenceTrailGame extends SortBoard {
  static simId = 'draw-the-evidence-trail-game';
  static label = { en: 'What Does the Chapter Say?' };
  static category = 'social-science.history';
  static KEY = 'et';
  static ARIA_LABEL = 'Four civilisations make six pairs. For each pair, choose strong contact, little evidence, or this chapter does not say.';
  static OBJECTIVE = { prompt: { en: 'Four civilisations make six pairs. The chapter speaks about three and not the other three. For each pair, choose what it says.' } };
  static HEAD = { kicker: 'Challenge', title: 'What does the evidence say?', sub: 'Tap a card, then a bin.' };
  static CARDS = [
    CARD('hm', 'Harappans and Mesopotamia', 'strong', 'They lay close together, and the book says this helped strong contacts and trade.'),
    CARD('he', 'Harappans and Egypt', 'little', 'The book says little tangible evidence of direct contact. That is not the same as none.'),
    CARD('hc', 'Harappans and China', 'little', 'The book says little tangible evidence of direct contact here too.'),
    CARD('me', 'Mesopotamia and Egypt', 'unsaid', 'This chapter does not discuss this pair. Other sources show these two knew each other.'),
    CARD('mc', 'Mesopotamia and China', 'unsaid', 'This chapter does not discuss this pair, so we draw no line from it.'),
    CARD('ec', 'Egypt and China', 'unsaid', 'This chapter does not discuss this pair, so we draw no line from it.'),
  ];
  static BINS = [{ id: 'strong', label: 'Strong contact' }, { id: 'little', label: 'Little evidence' }, { id: 'unsaid', label: 'This chapter does not say' }];
  static LINE = 'Only say what the evidence lets you say.';
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
