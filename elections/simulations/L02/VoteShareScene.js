// VoteShareScene - L02 s04. Votes against seats, party by party, from the same data as the map.
// b0 Haritbhumi: 40 per cent of votes, 60 per cent of seats (15 of 25). b1 Swarnalok: equal. b2 both, with a half line.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { VOTE_CSS, panel, text, col, soft } from './VoteArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const H = { name: 'Haritbhumi', note: 'FPTP, made-up map', rows: [['A', 1, 40, 60], ['B', 2, 35, 28], ['C', 3, 25, 12]], top: 'Party A: 15 of 25 seats' };
const S = { name: 'Swarnalok', note: 'PR, 100 seats', rows: [['M', 1, 40, 40], ['N', 2, 35, 35], ['O', 3, 15, 15], ['P', 5, 10, 10]], top: 'Party M: 40 of 100 seats' };
const CHIPS = [{ id: 'h', label: 'Haritbhumi', targets: ['h'], tone: 1 }, { id: 's', label: 'Swarnalok', targets: ['s'], tone: 2 }];

export class VoteShareScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static ARIA_LABEL = 'Pairs of bars for votes and seats. In Haritbhumi, A has 40 per cent of votes and 60 per cent of seats, B 35 and 28, C 25 and 12. In Swarnalok each pair is equal: 40, 35, 15, 10.';
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 626;
  tl = tapLight({ label: 'Countries', chips: CHIPS, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.set({ lit: ['h'] }); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 530 : 396; }
  css() { return VOTE_CSS; }
  enter(step) { this.tl.set({ lit: step === 2 ? null : [step === 0 ? 'h' : 's'] }); }

  _pairs(d, x, y, w, rowH, line, fs = 15) {
    const lx = 34, tw = w - lx - (fs > 15 ? 96 : 92), u = tw / 70, rx = x + lx + tw + 8;
    let s = '';
    d.rows.forEach(([mk, tone, v, seat], i) => {
      const yy = y + i * rowH, bh = (rowH - 12) / 2, same = v === seat;
      s += text('va-h', x + 24, yy + bh + 8, 26, mk, 'end');
      s += `<rect x="${x + lx}" y="${yy}" width="${v * u}" height="${bh}" rx="7" style="fill:${soft(tone, 45)};stroke:${col(tone)};stroke-width:2"/>` + text('va-t', rx, yy + bh - 5, fs, `votes ${v}`);
      s += `<rect x="${x + lx}" y="${yy + bh + 3}" width="${seat * u}" height="${bh}" rx="7" style="fill:${col(tone)}"/>` + text('va-h', rx, yy + 2 * bh - 1, fs + 1, `seats ${seat}`);
    });
    if (line) { const lxx = x + lx + 50 * u; s += `<path d="M${lxx} ${y - 6} V${y + d.rows.length * rowH}" style="fill:none;stroke:var(--sim-label);stroke-width:3;stroke-dasharray:7 6"/>` + text('va-t', lxx, y - 11, 15, 'half', 'middle'); }
    return s;
  }

  _country(d, x, y, w, h, rowH, line, fs = 15) {
    let s = panel(x, y, w, h, 'var(--sim-stroke)');
    s += text('va-h', x + 14, y + 30, 24, d.name) + text('va-m', x + 14, y + 52, 15, d.note);
    s += this._pairs(d, x + 8, y + 88, w - 16, rowH, line, fs);
    return s + text('va-h', x + 14, y + h - 12, fs > 15 ? 19 : 17, d.top);
  }

  paint(st) {
    const P = st.portrait, W = st.W, k = this.tl.lit()[0];
    if (k) { const d = k === 'h' ? H : S; const rh = P ? (d.rows.length === 3 ? 90 : 68) : (d.rows.length === 3 ? 88 : 66); return { svg: this._country(d, 0, 2, W, d.rows.length * rh + 128, rh, true, P ? 15 : 17) }; }
    if (P) return { svg: this._country(H, 0, 4, W, 262, 50, true) + this._country(S, 0, 272, W, 252, 36, true) };
    const w = (W - 10) / 2;
    return { svg: this._country(H, 0, 2, w, 384, 88, true, 18) + this._country(S, w + 10, 2, w, 384, 66, true, 18) };
  }
}
