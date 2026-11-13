// HandsOrMachinesGame - L06 game "Hands or machines?". Six orders, each with one condition from the book's list
// (cost of machines and of workers, technology, the product, laws). Tap a card, then tap the better way to produce
// it: more workers (labour-intensive) or more machines (capital-intensive). The card order is shuffled on each load
// (Math.random). The answer is never shown by a control; a wrong board gets a one-line reason for the first
// misplaced card. ASCII only.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { shuffle } from 'simulations/base/kit/shuffle.js';

const card = (id, icon, tone, text, chip, answer, why) => ({
  id, chip, answer, why,
  aria: `${text} More workers or more machines?`,
  html: `<span class="hm-ic" aria-hidden="true">${iconSvg(icon, tone)}</span><span class="hm-t">${text}</span>`,
});
const CARDS = [
  card('bride', 'flower', 2, 'One bridal lehenga in the bride\'s own design', 'the bridal lehenga', 'hands',
    'a one-off designer piece needs skilled hands'),
  card('shirts', 'crate', 3, '5,000 school shirts, all the same', 'the 5,000 shirts', 'machines',
    'thousands of identical pieces suit machines'),
  card('cheap', 'crowd', 1, 'Wages are low and machines are costly', 'cheap tailors', 'hands',
    'when workers are cheap and machines costly, more workers cost less'),
  card('scarce', 'coin', 4, 'Tailors are scarce and wages have doubled', 'scarce tailors', 'machines',
    'when workers are scarce and costly, machines make more sense'),
  card('power', 'hammer', 5, 'Only simple hand tools in the village', 'only simple tools', 'hands',
    'with limited technology, work stays by hand'),
  card('help', 'building', 6, 'The government helps pay for new machines', 'help to buy machines', 'machines',
    'help to buy machines makes machines cheaper for the firm'),
];

export class HandsOrMachinesGame extends SortBoard {
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 720;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A sorting board. Six orders, each with its own condition. Tap an order, then tap the better way to produce it: more workers or more machines.';
  static OBJECTIVE = { prompt: { en: 'Sort all six orders: more workers (labour-intensive) or more machines (capital-intensive)?' } };
  static KEY = 'hm';
  static HEAD = { kicker: 'Six orders', title: 'Hands or machines?', sub: 'Tap an order, then tap the better way to make it.' };
  static LINE = 'Look at what is cheap, what is possible, and what the product needs.';
  static BINS = [
    { id: 'hands', label: 'More workers (labour-intensive)' },
    { id: 'machines', label: 'More machines (capital-intensive)' },
  ];
  static CARDS = shuffle(CARDS.slice());
  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parser
  wrongHint(c) { return `Look at "${c.chip}" again: ${c.why}.`; }
  static CSS = `
.gm.hm { background: var(--sim-bg-deep); border-radius: 14px; }
.hm .tray { --cols: 3; --cols-p: 2; }
.hm .card { min-height: 112px; padding: 8px 10px; gap: 4px; justify-content: flex-start; }
.hm .hm-ic { display: block; width: 40px; height: 40px; flex: 0 0 auto; }
.hm .hm-ic svg { width: 100%; height: 100%; display: block; }
.hm .hm-t { font-size: 16px; font-weight: 800; line-height: 1.25; color: var(--sim-label); }
.hm .bin { min-height: 74px; }
.hm .lbl { font-size: 17px; }
.sim-dom-root--portrait .hm .gm-head { padding-right: 84px; }
.sim-dom-root--portrait .hm .card { min-height: 124px; padding: 6px; }
.sim-dom-root--portrait .hm .hm-ic { width: 32px; height: 32px; }
.sim-dom-root--portrait .hm .hm-t { font-size: 14px; }
.sim-dom-root--portrait .hm .bin { min-height: 58px; }
`;
}
