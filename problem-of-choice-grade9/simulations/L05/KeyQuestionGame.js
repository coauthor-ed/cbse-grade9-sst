// KeyQuestionGame - L05 game "Which question?". Six problems; tap one, tap the key question it asks: what to
// produce (a choice between two products), how to produce (between two methods) or for whom to produce (between
// two groups of buyers). Card order shuffled on each load (Math.random). A wrong board gets a one-line reason for
// the first misplaced card. ASCII only.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { shuffle } from 'simulations/base/kit/shuffle.js';

const WHY = {
  what: 'it chooses between two products, so it asks what to produce',
  how: 'the product is fixed and it chooses between two methods, so it asks how to produce',
  whom: 'it chooses between two groups of people, so it asks for whom to produce',
};
const card = (id, icon, tone, text, chip, answer) => ({
  id, chip, answer,
  aria: `${text} Which key question is this?`,
  html: `<span class="kq-ic" aria-hidden="true">${iconSvg(icon, tone)}</span><span class="kq-t">${text}</span>`,
});
const CARDS = [
  card('cane', 'field', 4, 'Should farmers in a dry district grow sugarcane or millets?', 'sugarcane or millets', 'what'),
  card('fans', 'factory', 4, 'Should the factory make more bicycles or more fans this year?', 'bicycles or fans', 'what'),
  card('tailor', 'person', 2, 'Should the garment maker hire more tailors or buy sewing machines?', 'tailors or machines', 'how'),
  card('plough', 'field', 2, 'Should the farmer plough with oxen or with a tractor?', 'oxen or tractor', 'how'),
  card('buyers', 'shop', 6, 'Should the shoe maker make shoes for students or for office workers?', 'students or office workers', 'whom'),
  card('bus', 'crowd', 6, 'Should the new bus run for village children or for city workers?', 'children or workers', 'whom'),
];

export class KeyQuestionGame extends SortBoard {
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 720;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A sorting board. Six cards each name an economic problem. Tap a card, then tap the key question it asks: what to produce, how to produce, or for whom to produce.';
  static OBJECTIVE = { prompt: { en: 'Sort all six problems by the key question each one asks.' } };
  static KEY = 'kq';
  static HEAD = { kicker: 'Six problems', title: 'Which question?', sub: 'Tap a problem, then tap its key question.' };
  static LINE = 'Look at what the choice is between: two products, two methods, or two groups of people.';
  static BINS = [
    { id: 'what', label: 'What to produce?' },
    { id: 'how', label: 'How to produce?' },
    { id: 'whom', label: 'For whom to produce?' },
  ];
  static CARDS = shuffle(CARDS.slice());
  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parser
  wrongHint(c) { return `Look at "${c.chip}" again: ${WHY[c.answer]}.`; }
  static CSS = `
.gm.kq { background: var(--sim-bg-deep); border-radius: 14px; }
.kq .tray { --cols: 2; --cols-p: 2; }
.kq .card { min-height: 112px; padding: 8px 10px; gap: 4px; justify-content: flex-start; }
.kq .kq-ic { display: block; width: 40px; height: 40px; flex: 0 0 auto; }
.kq .kq-ic svg { width: 100%; height: 100%; display: block; }
.kq .kq-t { font-size: 16px; font-weight: 800; line-height: 1.25; color: var(--sim-label); }
.kq .bin { min-height: 74px; }
.kq .lbl { font-size: 18px; }
.sim-dom-root--portrait .kq .gm-head { padding-right: 84px; }
.sim-dom-root--portrait .kq .card { min-height: 116px; padding: 6px; }
.sim-dom-root--portrait .kq .kq-ic { width: 32px; height: 32px; }
.sim-dom-root--portrait .kq .kq-t { font-size: 14px; }
.sim-dom-root--portrait .kq .bin { min-height: 58px; }
`;
}
