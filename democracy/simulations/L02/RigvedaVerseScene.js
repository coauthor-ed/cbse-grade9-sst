// RigvedaVerseScene - L02 s04. The verse on a palm-leaf page, in the book's transliteration and the
// book's English. b0 a chip lights one word in both languages. b1 the word that repeats: same.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { esc } from 'simulations/base/SimUi.js';

const m = (idx) => [{ idx, dwellMs: null }];
const CHIPS = [
  { id: 'counsel', label: 'counsel', targets: ['counsel'], tone: 1 },
  { id: 'assembly', label: 'assembly', targets: ['assembly'], tone: 2 },
  { id: 'mind', label: 'mind', targets: ['mind'], tone: 3 },
  { id: 'intention', label: 'intention', targets: ['intention'], tone: 5 },
];
// Words: [text, target]. Target null = plain.
const SK = [
  [['Sam\u0101no', 'same'], [' '], ['mantra\u1E25', 'counsel'], [' '], ['samiti\u1E25', 'assembly'], [' '], ['sam\u0101n\u012B', 'same']],
  [['sam\u0101na\u1E41', 'same'], [' '], ['mana\u1E25', 'mind'], [' saha '], ['chittam', 'intention'], [' e\u1E63h\u0101m |']],
  [['Sam\u0101na\u1E41', 'same'], [' mantram abhimantraye va\u1E25']],
  [['sam\u0101nena', 'same'], [' vo havi\u1E63h\u0101 juhomi ||']],
];
const EN = [
  [['Their '], ['counsel', 'counsel'], [' is '], ['one and the same', 'same'], [';']],
  [['their '], ['assembly', 'assembly'], [' is '], ['one', 'same'], ['.']],
  [['Their '], ['mind', 'mind'], [' is '], ['one', 'same'], [', and']],
  [['their '], ['intention', 'intention'], [' together is '], ['one', 'same'], ['.']],
];
const TONE = { counsel: 1, assembly: 2, mind: 3, intention: 5, same: 8 };

export class RigvedaVerseScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'A palm-leaf page with Rigveda 10.191.3 in transliteration, and its English translation below. Chips light the words counsel, assembly, mind and intention in both. On the second step the word for same lights wherever it repeats.';
  static HEIGHT = 384;
  static PORTRAIT_HEIGHT = 540;
  tl = tapLight({ label: 'Words in the verse', chips: CHIPS, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 298 : 236; }
  enter(step) { this.tl.reset(); this.tl.set({ disabled: step === 1 }); }

  css() { return `
.vr-t { font-family: var(--sim-font); font-weight: 800; fill: var(--sim-label); }
.vr-w { font-weight: 800; }
.vr-src { fill: var(--sim-label-muted); font-weight: 800; }
`; }

  _line(words, lit, x, y, size) {
    const sp = words.map(([t, tg]) => {
      const on = tg && lit.includes(tg);
      return `<tspan${on ? ` style="fill:var(--sim-series-${TONE[tg]}-ink);font-weight:900;text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px"` : tg && lit.length ? ' style="opacity:.75"' : !tg && lit.length ? ' style="opacity:.55"' : ''}>${esc(t)}</tspan>`;
    }).join('');
    return `<text class="vr-t" x="${x}" y="${y}" font-size="${size}" text-anchor="middle" xml:space="preserve">${sp}</text>`;
  }

  paint(st) {
    const W = st.W, P = st.portrait, lit = this.stepIndex === 1 ? ['same'] : this.tl.lit();
    const lw = P ? W - 4 : W * 0.53, lx = P ? 2 : 2, lh = P ? 150 : 214, ly = 8, cx = lx + lw / 2, sk = P ? 16.5 : 17, en = P ? 17 : 18;
    let s = `<rect x="${lx}" y="${ly + 5}" width="${lw}" height="${lh}" rx="34" style="fill:color-mix(in srgb,var(--sim-gold) 55%,var(--sim-label))"/>`
      + `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="34" style="fill:color-mix(in srgb,var(--sim-gold) 28%,var(--sim-bg-surface));stroke:color-mix(in srgb,var(--sim-gold) 60%,var(--sim-label));stroke-width:3"/>`
      + `<circle cx="${lx + 16}" cy="${ly + 16}" r="6" style="fill:color-mix(in srgb,var(--sim-gold) 40%,var(--sim-label))"/><circle cx="${lx + lw - 16}" cy="${ly + 16}" r="6" style="fill:color-mix(in srgb,var(--sim-gold) 40%,var(--sim-label))"/>`;
    SK.forEach((w, i) => { s += this._line(w, lit, cx, ly + (P ? 36 : 54) + i * (lh - (P ? 42 : 64)) / 4 * (P ? 1 : 1.1), sk); });
    const ex = P ? W / 2 : lw + (W - lw) / 2 + 2, y0 = P ? ly + lh + 28 : 44, gap = P ? 25 : 37;
    EN.forEach((w, i) => { s += this._line(w, lit, ex, y0 + i * gap, en); });
    s += `<text class="vr-t vr-src" x="${ex}" y="${y0 + 4 * gap}" font-size="15" text-anchor="middle">\u1E5Aigveda, 10.191.3</text>`;
    const head = this.stepIndex === 1 ? `<span class="sv-chip sv-chip--static sv-chip--plain">sam\u0101na: one, the same</span>` : '';
    return { svg: s, head };
  }
}
