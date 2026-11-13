// WhoChoosesGame - L04 game "Who makes this choice?". Tap a card, tap who makes that choice: a person or family,
// an enterprise, or the government. Cards come from the chapter's opening list and its later examples. The card
// order is shuffled on each load (Math.random). The answer is never shown by a control; a wrong board gets a
// one-line reason for the first misplaced card. ASCII only.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { shuffle } from 'simulations/base/kit/shuffle.js';

const WHY = {
  person: 'one person or one family decides this with its own money',
  firm: 'a farm, shop or firm decides this about what it makes and how',
  gov: 'the government decides this for the whole country',
};
const card = (id, icon, tone, text, chip, answer) => ({
  id, chip, answer,
  aria: `${text} Who makes this choice?`,
  html: `<span class="wc-ic" aria-hidden="true">${iconSvg(icon, tone)}</span><span class="wc-t">${text}</span>`,
});
const CARDS = [
  card('snack', 'person', 1, 'Spend pocket money on snacks, or save it for new shoes?', 'pocket money', 'person'),
  card('month', 'family', 1, 'Split this month\'s income into food, a meal out and savings?', 'month\'s income', 'person'),
  card('labour', 'factory', 3, 'Employ more workers, or buy more machines?', 'workers or machines', 'firm'),
  card('shoes', 'shop', 3, 'Make more school shoes, or more sports shoes?', 'which shoes', 'firm'),
  card('road', 'road', 5, 'Build a highway, or a hospital?', 'highway or hospital', 'gov'),
  card('tax', 'building', 5, 'Which goods should a new tax leave out?', 'a new tax', 'gov'),
];

export class WhoChoosesGame extends SortBoard {
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 720;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A sorting board. Six cards each name a choice. Tap a card, then tap who makes that choice: a person or family, an enterprise, or the government.';
  static OBJECTIVE = { prompt: { en: 'Sort all six choices by who makes them: a person or family, an enterprise, or the government.' } };
  static KEY = 'wc';
  static HEAD = { kicker: 'Six choices', title: 'Who makes this choice?', sub: 'Tap a card, then tap who decides it.' };
  static LINE = 'Ask whose money or whose work the choice is about.';
  static BINS = [
    { id: 'person', label: 'A person or family' },
    { id: 'firm', label: 'An enterprise: a farm, shop or firm' },
    { id: 'gov', label: 'The government' },
  ];
  static CARDS = shuffle(CARDS.slice());
  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parser
  wrongHint(c) { return `Look at "${c.chip}" again: ${WHY[c.answer]}.`; }
  static CSS = `
.gm.wc { background: var(--sim-bg-deep); border-radius: 14px; }
.wc .tray { --cols: 2; --cols-p: 2; }
.wc .card { min-height: 112px; padding: 8px 10px; gap: 4px; justify-content: flex-start; }
.wc .wc-ic { display: block; width: 40px; height: 40px; flex: 0 0 auto; }
.wc .wc-ic svg { width: 100%; height: 100%; display: block; }
.wc .wc-t { font-size: 16px; font-weight: 800; line-height: 1.25; color: var(--sim-label); }
.wc .bin { min-height: 74px; }
.wc .lbl { font-size: 17px; }
.sim-dom-root--portrait .wc .gm-head { padding-right: 84px; }
.sim-dom-root--portrait .wc .card { min-height: 116px; padding: 6px; }
.sim-dom-root--portrait .wc .wc-ic { width: 32px; height: 32px; }
.sim-dom-root--portrait .wc .wc-t { font-size: 14px; }
.sim-dom-root--portrait .wc .bin { min-height: 58px; }
`;
}
