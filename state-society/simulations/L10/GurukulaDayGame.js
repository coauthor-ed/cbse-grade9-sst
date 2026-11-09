// GurukulaDayGame - tap a part of a gurukula education, tap its group. Twelve cards, four groups, each from the book's lists.
// Taught by L10 blk-l10-s03.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { FIT_H, FIT_CSS } from '../shared/GameFit.js';

const card = (id, text, answer) => ({ id, html: `<span class="item">${text}</span>`, chip: text, aria: text, answer });

export class GurukulaDayGame extends SortBoard {
  static HEIGHT = FIT_H;
  static ARIA_LABEL = 'A sorting board. Twelve parts of a gurukula education sit in a tray. Tap one, then tap its group: subjects, arts and crafts, daily practice, or inner values.';
  static OBJECTIVE = { prompt: { en: 'Place each part of a gurukula education in its group: subjects, arts and crafts, daily practice, or inner values.' } };
  static KEY = 'gkd';
  static HEAD = { kicker: 'A gurukula day', title: 'More than lessons', sub: 'Tap a card, then tap its group.' };
  static LINE = 'Pick a card first.';
  static BINS = [
    { id: 'sub', label: 'Subjects' },
    { id: 'art', label: 'Arts and crafts' },
    { id: 'pra', label: 'Daily practice' },
    { id: 'val', label: 'Inner values' },
  ];
  static CARDS = [
    card('c1', 'Grammar', 'sub'),
    card('c2', 'Music', 'art'),
    card('c3', 'Yoga', 'pra'),
    card('c4', 'Truth', 'val'),
    card('c5', 'Medicine', 'sub'),
    card('c6', 'Archery', 'art'),
    card('c7', 'Meditation', 'pra'),
    card('c8', 'Patience', 'val'),
    card('c9', 'Astronomy', 'sub'),
    card('c10', 'Painting', 'art'),
    card('c11', 'Service to the guru', 'pra'),
    card('c12', 'Humility', 'val'),
  ];
  _render() { if (this.root?.querySelector?.('.bin')) super._render(); }   // the headless check has no HTML parser
  static CSS = `
.gm.gkd { background: var(--sim-bg-deep); border-radius: 14px; }
.gkd .tray { --cols: 4; --cols-p: 3; }
.gkd .item { font-size: 15px; font-weight: 700; line-height: 1.2; }
${FIT_CSS}`;
}
