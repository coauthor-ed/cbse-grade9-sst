// OpenCorridorGame - tap an ancestor, tap the time it left Africa. L02 s05 and s06 taught the two dates and the wet times.
// Only the two book dates are dated. Every other band is simply a dry time, with the way across closed.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';

const card = (id, name, sub, answer) => ({ id, chip: name, aria: `${name}. ${sub}`, html: `<span class="big">${name}</span><span class="small">${sub}</span>`, answer });

export class OpenCorridorGame extends SortBoard {
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 640;
  static ARIA_LABEL = 'A sorting board. Two ancestors sit in a tray. Five times are listed, oldest first: dry, a wetter time 2 million years ago, dry, a wetter time 125,000 years ago, dry. Tap an ancestor, then tap the time it left Africa.';
  static OBJECTIVE = { prompt: { en: 'Place each ancestor at the time it left Africa.' } };
  static KEY = 'ocg';
  static HEAD = { kicker: 'Out of Africa', title: 'When did each one leave?', sub: 'Oldest time first. Tap an ancestor, then tap a time.' };
  static LINE = 'Pick an ancestor first.';
  static BINS = [
    { id: 'd1', label: 'A dry time' },
    { id: 'w1', label: 'A wetter time, 2 million years ago' },
    { id: 'd2', label: 'A dry time' },
    { id: 'w2', label: 'A wetter time, 125,000 years ago' },
    { id: 'd3', label: 'A dry time' },
  ];
  static CARDS = [
    card('erectus', 'Homo erectus', 'handaxes and cleavers', 'w1'),
    card('sapiens', 'Homo sapiens', 'evolved about 300,000 years ago', 'w2'),
  ];
  _render() {
    if (!this.root?.querySelector?.('.bin')) return;   // the headless check has no HTML parser
    super._render();
    this.root.querySelectorAll('.bin').forEach((el) => { el.dataset.wet = el.dataset.bin[0] === 'w' ? '1' : '0'; });
  }
  static CSS = `
.gm.ocg { background: var(--sim-bg-deep); border-radius: 14px; }
.ocg .tray { --cols: 2; --cols-p: 2; }
.ocg .card { min-height: 92px; }
.ocg .big { font-size: 20px; }
.ocg .bins { max-height: none; }
.ocg .bin { min-height: 50px; padding: 6px 12px; }
.sim-dom-root--portrait .ocg .gm-head { padding-right: 84px; }
.ocg .gm-check--corner { left: 16px; right: auto; }
.ocg .bin[data-wet="1"] { background: color-mix(in oklab, var(--sim-sea-shallow) 24%, var(--sim-bg-surface)); }
.ocg .bin[data-wet="0"] { background: color-mix(in oklab, var(--sim-strata-1) 28%, var(--sim-bg-surface)); }
`;
  wrongHint(c) {
    const bin = this.placements[c.id];
    if (bin && bin[0] === 'd') return `${c.chip}: in a dry time the way across was much harder.`;
    return c.id === 'erectus' ? 'Homo erectus was the first to leave, long before Homo sapiens existed.' : 'Homo sapiens evolved about 300,000 years ago, so 2 million years ago is too early.';
  }
}
