// RouteTheOrderGame - blk-l05-s07. Which level does this work? Tap a matter, tap who deals with it.
// Every matter is a job the sources name for that body. Class name kept; board is now kit SortBoard.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { FIT_H, FIT_CSS, phoneBins } from '../shared/GameFit.js';

const card = (id, text, chip, answer) => ({ id, html: `<span class="m">${text}</span>`, chip, aria: text, answer });

export class RouteTheOrderGame extends SortBoard {
  static HEIGHT = FIT_H;
  static ARIA_LABEL = 'A game: eight matters from daily life go to the village committee, the district governor, the city governor or the minister of peace and war.';
  static OBJECTIVE = { prompt: { en: 'Send each matter to the level that dealt with it.' } };
  static KEY = 'rto';
  static HEAD = { kicker: 'Who does this work?', title: 'Eight matters, four offices', sub: 'Tap a matter, then tap who deals with it.' };
  static LINE = 'Each matter has one right office.';
  static CARDS = [
    card('channel', 'Repair an irrigation channel', 'channel', 'village'),
    card('garden', 'Look after the gardens', 'gardens', 'village'),
    card('temple', 'Manage the temple', 'temple', 'village'),
    card('judge', 'Judge a case in a district', 'a case', 'district'),
    card('admin', 'Run the work of a district', 'district work', 'district'),
    card('revenue', 'Collect revenue in a city', 'revenue', 'city'),
    card('order', 'Keep order in a city', 'order', 'city'),
    card('war', 'Talks of peace or war with a king', 'peace talks', 'peace'),
  ];
  static BINS = [
    { id: 'village', label: 'Village committee' },
    { id: 'district', label: 'District governor' },
    { id: 'city', label: 'City governor' },
    { id: 'peace', label: 'Minister of peace and war' },
  ];
  static CSS = `${FIT_CSS}
    .rto { --cols: 3; --cols-p: 2; }
    .rto .card { min-height: 54px; }
    .rto .board { grid-template-columns: minmax(0, 1fr) 560px; }
    .rto .bins { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); max-height: none; overflow: visible; }
    .rto .bin { min-height: 62px; }
    ${phoneBins('rto')}
    .rto .m { font-size: 15px; font-weight: 800; line-height: 1.2; }
    .sim-dom-root--portrait .rto .card { min-height: 58px; }
`;

  // The harness DOM has no parser, so the kit board finds no bins there.
  _render() { if (this.root.querySelector('.bin')) super._render(); }

  wrongHint(c) {
    const why = { village: 'Village assemblies had small committees for tasks like this.', district: 'District governors had judicial and administrative work.', city: 'Cities had their own governors for revenue and order.', peace: 'A new Gupta minister dealt with this.' };
    return `${c.aria}: ${why[c.answer]}`;
  }
}
