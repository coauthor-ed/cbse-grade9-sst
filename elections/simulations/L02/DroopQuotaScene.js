// DroopQuotaScene - L02 s05. b0 which elections use FPTP and which use PR. b1 the Vidhan Parishad: six States,
// three routes. b2 the quota worked, and why only 2 can reach it. b3 a made-up count: A reaches 101. b4 the
// lowest candidate is out, 25 of D's votes go to B, 20 to C, and B reaches 105.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { VOTE_CSS, panel, text, soft, col, para } from './VoteArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const STATES = ['Andhra Pradesh', 'Bihar', 'Karnataka', 'Maharashtra', 'Telangana', 'Uttar Pradesh'];
const ROUTES = [['Elected', 'by Vidhan Sabha members and local bodies'], ['Elected', 'by graduates and teachers'], ['Nominated', 'by the Governor, from art, science and other fields']];
const QUOTA = 101, MAX = 120;

export class DroopQuotaScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4)];
  static ARIA_LABEL = 'Lok Sabha and Vidhan Sabha use First Past The Post. Rajya Sabha, President and Vice President use proportional representation. Six States have a Vidhan Parishad with three routes for members. The quota for 300 votes and 2 seats is 101. A made-up count: A 110 is elected; D 45 is eliminated; 25 of those votes go to B, who reaches 105 and is elected.';
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 600;

  stageHeight(st) { const b = this.stepIndex; return b === 0 ? (st.portrait ? 470 : 380) : b === 2 ? (st.portrait ? 470 : 380) : st.portrait ? 540 : 470; }
  css() { return VOTE_CSS + `.dq-move { animation: dq-in 0.7s var(--look-spring-soft) both; animation-delay: 0.35s; transform-box: fill-box; transform-origin: left; }
@keyframes dq-in { from { transform: scaleX(0); } to { transform: none; } }
.dq-out { animation: dq-fade 0.6s ease both; animation-delay: 0.1s; }
@keyframes dq-fade { from { opacity: 1; } to { opacity: 0.32; } }
@media (prefers-reduced-motion: reduce) { .dq-move, .dq-out { animation: none; } .dq-out { opacity: 0.32; } }`; }

  _where(st) {
    const P = st.portrait, W = st.W, w = P ? W : (W - 12) / 2, h = 260;
    const col1 = [['FPTP', 1, ['Lok Sabha', 'Vidhan Sabha']], ['Proportional representation', 2, ['Rajya Sabha', 'President', 'Vice President']]];
    let s = '';
    col1.forEach(([t, tone, rows], i) => {
      const x = P ? 0 : i * (w + 12), y = P ? (i ? 200 : 4) : 4, hh = i === 0 && P ? 182 : h;
      s += panel(x, y, w, hh, tone, soft(tone, 12));
      s += text('va-h', x + 14, y + 34, 22, t);
      rows.forEach((r, k) => { s += `<rect x="${x + 12}" y="${y + 52 + k * 66}" width="${w - 24}" height="58" rx="12" style="fill:var(--sim-bg-surface);stroke:${col(tone)};stroke-width:2.5"/>` + text('va-h', x + w / 2, y + 90 + k * 66, 24, r, 'middle'); });
    });
    return s;
  }

  _parishad(st) {
    const P = st.portrait, W = st.W, cw = (W - 16) / 3, c2 = (W - 8) / 2;
    let s = text('va-t', W / 2, 20, 16, 'Six States with two houses', 'middle');
    STATES.forEach((n, i) => {
      const cols = P ? 2 : 3, w = P ? c2 : cw, x = (i % cols) * (w + 8), y = 30 + Math.floor(i / cols) * 42;
      s += `<rect x="${x}" y="${y}" width="${w}" height="36" rx="10" style="fill:${soft('var(--sim-gold)', 22)};stroke:var(--sim-gold);stroke-width:2"/>` + text('va-h', x + w / 2, y + 25, 17, n, 'middle');
    });
    const top = P ? 166 : 124, h = P ? 96 : 92;
    s += text('va-h', W / 2, top + 10, 21, 'Three routes into the Vidhan Parishad', 'middle').replace('21', P ? '18' : '21');
    ROUTES.forEach(([a, b], i) => {
      const y = top + 26 + i * (h + 10), tone = [1, 2, 5][i];
      s += panel(0, y, W, h, tone, soft(tone, 10));
      s += text('va-h', 14, y + 30, 21, a) + para('va-t', 14, y + 54, 16, b, Math.floor((W - 24) / 8.2), 20);
    });
    return s;
  }

  _quota(st) {
    const W = st.W, P = st.portrait;
    let s = panel(0, 4, W, 150, 'var(--sim-gold)', soft('var(--sim-gold)', 16));
    s += text('va-h', W / 2, 40, P ? 17 : 21, '[Total valid votes \u00f7 (Seats + 1)] + 1', 'middle');
    s += text('va-t', W / 2, 74, 18, '300 votes and 2 seats', 'middle');
    s += text('va-h', W / 2, 126, 36, '300 \u00f7 3 + 1 = 101', 'middle');
    [['2 candidates', '2 \u00d7 101 = 202', 'possible', 'var(--sim-good)'], ['3 candidates', '3 \u00d7 101 = 303', 'more than 300 votes', 'var(--sim-bad)']].forEach(([a, b, d, t], i) => {
      const w = P ? W : (W - 12) / 2, x = P ? 0 : i * (w + 12), y = P ? 170 + i * 142 : 170;
      s += panel(x, y, w, 128, t, soft(t, 14));
      s += text('va-h', x + w / 2, y + 32, 21, a, 'middle') + text('va-h', x + w / 2, y + 70, 28, b, 'middle') + text('va-t', x + w / 2, y + 104, 17, d, 'middle');
    });
    return s;
  }

  _count(st) {
    const W = st.W, moved = this.stepIndex === 4, lx = 44, tw = W - lx - 118, u = tw / MAX, h = 54, gap = 18, y0 = 40;
    const qx = lx + QUOTA * u;
    const rows = [['A', 1, 110, 0, true], ['B', 2, 80, moved ? 25 : 0, moved], ['C', 3, 65, moved ? 20 : 0, false], ['D', 5, 45, 0, false]];
    let s = text('va-t', qx, 22, 17, 'quota 101', 'middle');
    rows.forEach(([mk, tone, v, add, win], i) => {
      const y = y0 + i * (h + gap), out = mk === 'D' && moved;
      s += `<g class="${out ? 'dq-out' : ''}">` + text('va-h', lx - 14, y + h / 2 + 10, 28, mk, 'end')
        + `<rect x="${lx}" y="${y}" width="${tw}" height="${h}" rx="10" style="fill:var(--sim-track)" opacity="0.45"/>`
        + `<rect x="${lx}" y="${y}" width="${v * u}" height="${h}" rx="10" style="fill:${col(tone)}"/></g>`;
      if (add) s += `<rect class="dq-move" x="${lx + v * u}" y="${y}" width="${add * u}" height="${h}" rx="6" style="fill:${soft(5, 80)};stroke:var(--sim-label);stroke-width:2"/>`;
      const label = out ? 'out' : String(v + add);
      s += text('va-h', lx + tw + 8, y + h / 2 - (win ? 2 : -9), 26, label);
      if (win) s += text('va-t', lx + tw + 8, y + h / 2 + 20, 15, 'elected');
      if (add) s += text('va-t', lx + v * u + add * u / 2, y + h + 15, 15, `+${add}`, 'middle');
    });
    const bot = y0 + rows.length * (h + gap);
    s += `<path d="M${qx} 30 V${bot - gap + 8}" style="fill:none;stroke:var(--sim-label);stroke-width:3.5;stroke-dasharray:8 6"/>`;
    s += text('va-m', W / 2, bot + 14, 15, 'A made-up count: 300 votes, 2 seats', 'middle');
    return s;
  }

  paint(st) {
    const b = this.stepIndex;
    return { svg: b === 0 ? this._where(st) : b === 1 ? this._parishad(st) : b === 2 ? this._quota(st) : this._count(st) };
  }
}
