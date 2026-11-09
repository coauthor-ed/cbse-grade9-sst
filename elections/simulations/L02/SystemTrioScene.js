// SystemTrioScene - L02 s03. The book's table, one country a tap. b0 to b2 each country; b3 all three side by side.
// Chips switch the country on any beat. Results are the book's own sample numbers.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { VOTE_CSS, bars, panel, text, para } from './VoteArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const pr = (mk, tone, v) => ({ m: mk, tone, v });
const C = {
  h: { name: 'Haritbhumi', sys: 'First Past The Post', seats: '25 seats', tone: 1, rule: 'Most votes in a constituency wins, even below 50 per cent.', rows: [pr('A', 1, 40), pr('B', 2, 35), pr('C', 3, 25)], result: 'Party A forms the government.' },
  r: { name: 'Ratnadweep', sys: 'Majority System', seats: '25 seats', tone: 4, rule: 'More than 50 per cent wins. If no one has it, the top two compete again.', rows: [pr('X', 4, 45), pr('Y', 5, 40), pr('Z', 6, 15)], result: 'Round 2: Party Y wins with 55 and forms the government.' },
  s: { name: 'Swarnalok', sys: 'Proportional Representation', seats: '100 seats, nationwide list', tone: 2, rule: 'Voters vote for a party. Seats follow each party\u2019s share of votes.', rows: [pr('M', 1, 40), pr('N', 2, 35), pr('O', 3, 15), pr('P', 5, 10)], result: 'Seats: M 40, N 35, O 15, P 10. Power is shared.' },
};
const KEYS = ['h', 'r', 's'];
const CHIPS = KEYS.map((k) => ({ id: k, label: C[k].name, targets: [k], tone: C[k].tone }));

export class SystemTrioScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static ARIA_LABEL = 'The book\u2019s table of three imaginary countries. Haritbhumi: First Past The Post, A 40, B 35, C 25, Party A forms the government. Ratnadweep: Majority System, X 45, Y 40, Z 15, then Party Y wins Round 2 with 55. Swarnalok: Proportional Representation, seats M 40, N 35, O 15, P 10.';
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 626;
  tl = tapLight({ label: 'Countries', chips: CHIPS, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.set({ lit: ['h'] }); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 460 : 392; }
  css() { return VOTE_CSS; }
  enter(step) { this.tl.set({ lit: step < 3 ? [KEYS[step]] : null }); }

  _country(k, x, y, w, h) {
    const d = C[k];
    let s = panel(x, y, w, h, d.tone);
    s += text('va-h', x + 14, y + 32, 27, d.name) + text('va-t', x + 14, y + 58, 16, d.sys) + text('va-m', x + 14, y + 80, 15, d.seats);
    const by = y + 96, n = d.rows.length, bh = 34, gap = 10;
    s += bars(x + 8, by, w - 16, d.rows, { h: bh, gap, fs: 22, max: 60, lx: 26, rw: 36 });
    const ry = by + n * (bh + gap) + 16, mx = Math.floor((w - 24) / 8.3);
    s += para('va-t', x + 14, ry, 16, d.rule, mx, 21);
    return s + para('va-h', x + 14, ry + (d.rule.length > mx ? 52 : 30), 18, d.result, Math.floor((w - 24) / 9.2), 23);
  }

  _mini(k, x, y, w, h) {
    const d = C[k];
    let s = panel(x, y, w, h, d.tone);
    if (h > 200) {   // wide stage: three tall cards, one reading a line
      const mx = Math.floor((w - 24) / 8.2), sys = para('va-m', x + 12, y + 56, 17, d.sys, mx, 21);
      s += text('va-h', x + 12, y + 32, 25, d.name) + sys;
      d.rows.forEach((r, i) => { s += text('va-h', x + 12, y + 126 + i * 34, 26, `${r.m} ${r.v}`); });
      return s + para('va-h', x + 12, y + 126 + d.rows.length * 34 + 6, 18, d.result, Math.floor((w - 20) / 9.1), 23);
    }
    s += text('va-h', x + 12, y + 28, 21, d.name) + text('va-m', x + 12, y + 49, 15, d.sys);
    s += text('va-t', x + 12, y + 71, 15.5, d.rows.map((r) => `${r.m} ${r.v}`).join(', '));
    return s + para('va-h', x + 12, y + 93, 15, d.result, Math.floor((w - 20) / 7.7), 19);
  }

  paint(st) {
    const k = this.tl.lit()[0], W = st.W, P = st.portrait;
    if (k) { const w = Math.min(W, 560); return { svg: this._country(k, (W - w) / 2, 2, w, P ? 410 : 384) }; }
    if (P) return { svg: KEYS.map((q, i) => this._mini(q, 0, 4 + i * 148, W, 140)).join('') };
    const w = (W - 16) / 3;
    return { svg: KEYS.map((q, i) => this._mini(q, i * (w + 8), 2, w, 384)).join('') };
  }
}
