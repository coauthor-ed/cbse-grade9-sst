// FptpMapScene - L02 s02. b0 one constituency, three bars, A wins. b1 the same bars with the 50 line:
// a plurality and not a majority. b2 Haritbhumi's 25 constituencies from a true made-up data set; tap one
// for its count. b3 the map, with where India uses this rule. Step 4 is the s01 predict setup (see -setup).
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { VOTE_CSS, SEATS, PARTY, winner, bars, panel, text, soft, col, para } from './VoteArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const ONE = [{ m: 'A', tone: 1, v: 40 }, { m: 'B', tone: 2, v: 35 }, { m: 'C', tone: 3, v: 25 }];
const TALLY = [15, 7, 3];

export class FptpMapScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static ARIA_LABEL = 'One constituency with bars for A 40, B 35 and C 25. Then a line at 50 shows that 40 is a plurality and not a majority. Then a map of 25 constituencies, each showing its winner: A 15, B 7, C 3. Tap a constituency, or use the arrow keys and Enter, to see its count.';
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 600;
  sel = -1;

  stageHeight(st) { return st.portrait ? 560 : 440; }
  css() { return VOTE_CSS + `.fp-keys { outline: none; }
`; }
  enter() { this.sel = -1; this._key = 0; }

  async setup() {
    await super.setup();
    // Same toggle as a tap: Tab reaches the map, arrows walk the tiles, Enter or Space opens a count.
    const w = this.sv.wrap;
    w.classList.add('fp-keys');
    w.addEventListener('keydown', (e) => {
      if (this.stepIndex !== 2 && this.stepIndex !== 3) return;
      this._keyed = true;
      const n = this._key, dx = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -5, ArrowDown: 5 }[e.key];
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.sel = this.sel === n ? -1 : n; this.repaint(); } else if (dx && n + dx >= 0 && n + dx < 25) { e.preventDefault(); this._key = n + dx; this.repaint(); }
    });
    w.addEventListener('blur', () => { if (this._keyed) { this._keyed = false; this.repaint(); } });
  }

  _grid(st) {
    const P = st.portrait, cell = P ? Math.floor(st.W / 5) : 76;
    return { x: P ? (st.W - cell * 5) / 2 : 0, y: 0, cell };
  }

  pointerDown(p) {
    if (this.stepIndex !== 2 && this.stepIndex !== 3) return false;
    const g = this._grid(this.sv), i = Math.floor((p.x - g.x) / g.cell), j = Math.floor((p.y - g.y) / g.cell);
    if (i < 0 || i > 4 || j < 0 || j > 4) return false;
    this._key = j * 5 + i;
    this.sel = this.sel === j * 5 + i ? -1 : j * 5 + i;
    this.repaint();
    return false;
  }

  _one(st, setup) {
    const P = st.portrait, b = this.stepIndex, W = st.W;
    let s = '';
    const pw = Math.min(W, 520), x = (W - pw) / 2;
    s += panel(x, 4, pw, setup ? 248 : P ? 300 : 280, 'var(--sim-stroke)');
    s += text('va-h', W / 2, 42, 24, 'One constituency', 'middle');
    s += text('va-m', W / 2, 66, 16, 'votes out of every 100', 'middle');
    s += bars(x + 16, 108, pw - 32, ONE, { line: b === 1 ? 50 : null, lineLabel: b === 1 ? 'more than half' : '', h: setup ? 36 : 44, gap: setup ? 10 : 14, fs: 26 });
    if (setup) return s;
    const y = (P ? 300 : 280) + 26;
    if (b === 0) {
      s += panel(x, y, pw, 74, 'var(--sim-good)', soft('var(--sim-good)', 20));
      s += text('va-h', W / 2, y + 32, 23, 'Haritbhumi: most votes wins', 'middle') + text('va-t', W / 2, y + 57, 17, 'Party A wins the seat', 'middle');
    } else {
      const w = (pw - 10) / 2;
      s += panel(x, y, w, 96, 'var(--sim-good)', soft('var(--sim-good)', 20)) + panel(x + w + 10, y, w, 96, 'var(--sim-bad)', soft('var(--sim-bad)', 14));
      s += text('va-h', x + w / 2, y + 34, 21, 'Plurality', 'middle') + text('va-t', x + w / 2, y + 62, 16, 'A has the most', 'middle') + text('va-h', x + w / 2, y + 84, 15, 'Yes', 'middle');
      s += text('va-h', x + w + 10 + w / 2, y + 34, 21, 'Majority', 'middle') + text('va-t', x + w + 10 + w / 2, y + 62, 16, '40 is not over 50', 'middle') + text('va-h', x + w + 10 + w / 2, y + 84, 15, 'No', 'middle');
    }
    return s;
  }

  _map(st) {
    const P = st.portrait, g = this._grid(st), c = g.cell, W = st.W, b = this.stepIndex;
    let s = '';
    SEATS.forEach((r, n) => {
      const x = g.x + (n % 5) * c, y = g.y + Math.floor(n / 5) * c, w = winner(r), on = this.sel === n, tone = PARTY[w].tone;
      s += `<rect x="${x + 3}" y="${y + 6}" width="${c - 6}" height="${c - 7}" rx="12" style="fill:color-mix(in srgb,${col(tone)} 70%,var(--sim-label))"/>`
        + `<rect x="${x + 3}" y="${y + 3}" width="${c - 6}" height="${c - 7}" rx="12" style="fill:${col(tone)};stroke:${on ? 'var(--sim-label)' : 'var(--sim-bg-surface)'};stroke-width:${on ? 5 : 2}"/>`
        + `<circle cx="${x + c / 2}" cy="${y + c / 2}" r="${c * 0.27}" style="fill:var(--sim-bg-surface)"/>`
        + text('va-h', x + c / 2, y + c / 2 + 8, 23, PARTY[w].m, 'middle')
        + (this._keyed && n === this._key ? `<rect class="fp-ring" x="${x + 1}" y="${y + 1}" width="${c - 2}" height="${c - 2}" rx="13" style="fill:none;stroke:var(--sim-label);stroke-width:4;stroke-dasharray:7 5"/>` : '');
    });
    const x = P ? 0 : g.x + c * 5 + 14, y = P ? g.y + c * 5 + 12 : 4, w = P ? W : W - x;
    const r = this.sel >= 0 ? SEATS[this.sel] : null;
    if (r) {
      const wi = winner(r), h = P ? 192 : 250;
      s += panel(x, y, w, h, PARTY[wi].tone);
      s += text('va-h', x + 12, y + 30, 20, `Constituency ${this.sel + 1}`);
      s += bars(x + 8, y + 44, w - 16, r.map((v, i) => ({ m: PARTY[i].m, tone: PARTY[i].tone, v })), { h: 26, gap: 8, fs: 19, rw: 36, lx: 24, line: 50 });
      s += para('va-t', x + 12, y + (P ? 170 : 170), 16, `${PARTY[wi].m} wins with ${r[wi]} of 100${r[wi] < 50 ? ', less than half' : ''}`, P ? 40 : 24);
    } else {
      const h = P ? 130 : b === 3 ? 196 : 250;
      s += panel(x, y, w, h, 'var(--sim-stroke)');
      s += text('va-h', x + 12, y + 28, 19, 'Seats won');
      TALLY.forEach((t, i) => {
        const tx = P ? x + 12 + i * ((w - 24) / 3) : x + 12, ty = P ? y + 42 : y + 40 + i * 42;
        s += `<rect x="${tx}" y="${ty}" width="${P ? (w - 24) / 3 - 8 : w - 24}" height="36" rx="10" style="fill:${soft(PARTY[i].tone, 24)};stroke:${col(PARTY[i].tone)};stroke-width:2.5"/>`
          + text('va-h', tx + 12, ty + 27, 22, `${PARTY[i].m}: ${t}`);
      });
      s += text('va-t', x + 12, P ? y + 106 : y + 178, 15, 'Votes: A 40, B 35, C 25 per cent');
      if (!P && b === 2) s += text('va-m', x + 12, y + 226, 15, 'Made-up example');
      if (P) s += text('va-m', x + 12, y + 124, 15, 'Made-up example. Tap a seat.');
    }
    if (b === 3) {
      const yy = P ? y + 138 : y + (r ? 262 : 206), hh = 104;
      if (P) {
        if (!r) s += panel(x, yy, w, 46, 'var(--sim-gold)', soft('var(--sim-gold)', 18)) + text('va-t', W / 2, yy + 29, 16, 'India: Lok Sabha and Vidhan Sabha', 'middle');
      } else {
        s += panel(x, yy, w, hh, 'var(--sim-gold)', soft('var(--sim-gold)', 18));
        s += text('va-h', x + 12, yy + 30, 18, 'India uses FPTP for') + text('va-t', x + 12, yy + 58, 17, 'the Lok Sabha') + text('va-t', x + 12, yy + 82, 17, 'the Vidhan Sabha');
      }
    }
    return s;
  }

  paint(st) {
    const b = this.stepIndex, r = this.sel >= 0 ? SEATS[this.sel] : null;
    st.wrap.tabIndex = b === 2 || b === 3 ? 0 : -1;
    st.wrap.setAttribute('aria-label', r ? `Constituency ${this.sel + 1}: ${PARTY[winner(r)].m} wins with ${r[winner(r)]} of 100.` : this.constructor.ARIA_LABEL);
    if (b === 4) return { svg: this._one(st, true) };
    return { svg: b < 2 ? this._one(st, false) : this._map(st) };
  }
}
