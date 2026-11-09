// CaseFileGame - tap an invented script, tap could be read or would stay unread. L01 s06 gave the three needs.
// Scripts A to D are invented, so the win is applying the test, not recalling the Sindhu lipi.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';

const row = (ok, text) => `<span class="need" data-ok="${ok ? 1 : 0}"><b>${ok ? '\u2713' : '\u2717'}</b> ${text}</span>`;
const card = (id, key, lots, lang, answer) => ({
  id,
  chip: `Script ${id}`,
  aria: `Script ${id}: ${key ? 'has' : 'no'} text with a known script, ${lots ? 'long' : 'short'} inscriptions, language ${lang ? 'known' : 'unknown'}`,
  html: `<span class="big">Script ${id}</span>${row(key, 'known script beside it')}${row(lots, 'long inscriptions')}${row(lang, 'language known')}`,
  answer,
});

export class CaseFileGame extends SortBoard {
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 700;
  static ARIA_LABEL = 'A sorting board. Four invented scripts sit in a tray, each with three needs marked yes or no. Tap a script, then tap could be read, or would stay unread.';
  static OBJECTIVE = { prompt: { en: 'Place each invented script: could scholars probably read it, or would it stay unread?' } };
  static KEY = 'cfg';
  static HEAD = { kicker: 'Four invented scripts', title: 'Which could scholars read?', sub: 'A script needs all three. Tap a script, then tap its box.' };
  static LINE = 'Check all three lines on a card.';
  static BINS = [{ id: 'read', label: 'Could be read' }, { id: 'stay', label: 'Would stay unread' }];
  static CARDS = [
    card('A', true, true, true, 'read'),
    card('B', true, false, true, 'stay'),
    card('C', false, true, false, 'stay'),
    card('D', true, true, false, 'stay'),
  ];
  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parser
  static CSS = `
.gm.cfg { background: var(--sim-bg-deep); border-radius: 14px; }
.cfg .tray { --cols: 2; --cols-p: 2; }
.cfg .card { align-items: flex-start; text-align: left; min-height: 124px; padding: 8px 10px; gap: 2px; }
.cfg .need { font-size: 15px; font-weight: 700; line-height: 1.3; color: var(--sim-label); }
.cfg .need b { color: var(--sim-good); }
.cfg .need[data-ok="0"] b { color: var(--sim-bad); }
.cfg .bin { min-height: 92px; }
.cfg .lbl { font-size: 18px; }
.sim-dom-root--portrait .cfg .gm-head { padding-right: 84px; }
.sim-dom-root--portrait .cfg .need { font-size: 14px; }
.sim-dom-root--portrait .cfg .card { min-height: 128px; padding: 6px; }
`;
  wrongHint(c) { return `Look at ${c.chip} again. One cross is enough to keep a script unread.`; }
}
