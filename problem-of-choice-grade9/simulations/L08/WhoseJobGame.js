// WhoseJobGame - L08 game "Whose job?". Eight jobs from the book's picture of a mixed economy (Fig 8.8). Tap a job,
// then tap the side that does it: the government side (fair rules, consumer protection, transparency, public goods,
// welfare) or the market side (profit-making businesses, competition, new ideas). The card order is shuffled on each
// load (Math.random). The answer is never shown by a control; a wrong board gets a one-line reason for the first
// misplaced card. Replaces SpectrumMixGame (kept in place, unused). ASCII only.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { shuffle } from 'simulations/base/kit/shuffle.js';

const card = (id, icon, tone, text, chip, answer, why) => ({
  id, chip, answer, why,
  aria: `${text} Government side or market side?`,
  html: `<span class="wj-ic" aria-hidden="true">${iconSvg(icon, tone)}</span><span class="wj-t">${text}</span>`,
});
const CARDS = [
  card('rules', 'scales', 6, 'Fair rules for competition', 'fair rules', 'govt',
    'making fair rules for competition is a job of the government'),
  card('safe', 'check', 3, 'Checking that medicines are safe', 'safe medicines', 'govt',
    'protecting consumers is a job of the government'),
  card('info', 'newspaper', 4, 'Firms must share honest information', 'honest information', 'govt',
    'the government asks for transparency: honest information'),
  card('lamp', 'lamp', 5, 'Street lights and roads for all', 'street lights and roads', 'govt',
    'public goods such as street lights and roads come from the government'),
  card('help', 'family', 1, 'Help for families in need', 'help for families', 'govt',
    'welfare programmes are run by the government'),
  card('shop', 'shop', 2, 'A shop that sells to earn a profit', 'the shop', 'market',
    'profit-making businesses are the market side'),
  card('rival', 'crowd', 7, 'Two sellers try to win the same buyers', 'two sellers', 'market',
    'competition between sellers is the market side'),
  card('idea', 'bulb', 8, 'A firm makes a new, better product', 'the new product', 'market',
    'new ideas come from firms that compete: the market side'),
];

export class WhoseJobGame extends SortBoard {
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 820;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A sorting board. Eight jobs in a mixed economy. Tap a job, then tap the side that does it: the government side or the market side.';
  static OBJECTIVE = { prompt: { en: 'Sort all eight jobs: the government side or the market side?' } };
  static KEY = 'wj';
  static HEAD = { kicker: 'Mixed economy', title: 'Whose job?', sub: 'Tap a job, then tap the side that does it.' };
  static LINE = 'Rules and public goods, or profit and competition?';
  static BINS = [
    { id: 'govt', label: 'Government side' },
    { id: 'market', label: 'Market side' },
  ];
  static CARDS = shuffle(CARDS.slice());
  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parser
  wrongHint(c) { return `Look at "${c.chip}" again: ${c.why}.`; }
  static CSS = `
.gm.wj { background: var(--sim-bg-deep); border-radius: 14px; }
.wj .board { grid-template-columns: minmax(0, 1fr) 300px; }
.wj .tray { --cols: 4; --cols-p: 2; }
.wj .card { min-height: 112px; padding: 8px 8px; gap: 4px; justify-content: flex-start; }
.wj .wj-ic { display: block; width: 40px; height: 40px; flex: 0 0 auto; }
.wj .wj-ic svg { width: 100%; height: 100%; display: block; }
.wj .wj-t { font-size: 16px; font-weight: 800; line-height: 1.22; color: var(--sim-label); }
.wj .bin { min-height: 118px; }
.wj .lbl { font-size: 18px; }
.sim-dom-root--portrait .wj .gm-head { padding-right: 84px; }
.sim-dom-root--portrait .wj .card { min-height: 108px; padding: 6px; }
.sim-dom-root--portrait .wj .wj-ic { width: 32px; height: 32px; }
.sim-dom-root--portrait .wj .wj-t { font-size: 15px; }
.sim-dom-root--portrait .wj .bin { min-height: 64px; }
`;
}
