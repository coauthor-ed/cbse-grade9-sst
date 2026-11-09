/**
 * WhatWeCanSayScene - blk-l09-s08, 3 beats. Beat 0: objects alone: a seal, a pot and beads, each with what it can show, and a
 * question mark over what people thought. Beat 1: a read tablet adds names, dates, disputes and beliefs. Beat 2: twenty
 * people, one with a reed: most could not write. Base chain: SvgScene. State comes from the beat.
 */
import { SvgScene, fill, stroke, tone } from 'simulations/base/kit/SimSvg.js';
import { sealSvg, potSvg, beadsSvg, n } from '../L07/HarappanDraw.js';
import { tabletSvg, wedgeSvg } from './ClayDraw.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const TITLE = ['Objects alone', 'A script that can be read', 'Who is missing?'];

export class WhatWeCanSayScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A seal, a pot and beads show technology and trade, but not thoughts. A read clay tablet adds names, dates, disputes and beliefs. Most people could not write, so most voices are missing.';

  stageHeight(st) { return st.portrait ? 500 : 430; }
  css() { return 'svg .ww-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; } svg .ww-pop { transform-box: fill-box; transform-origin: center; animation: ww-pop 0.5s var(--look-spring) both; animation-delay: var(--d, 0s); } @keyframes ww-pop { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: none; } } @media (prefers-reduced-motion: reduce) { svg .ww-pop { animation: none; } }'; }

  _t(x, y, s, size, col = 'var(--sim-label)', a = 'middle') { return `<text class="ww-w" x="${n(x)}" y="${n(y)}" text-anchor="${a}" font-size="${size}" dominant-baseline="central" ${fill(col)}>${s}</text>`; }

  paint(st) {
    const s = this.stepIndex, W = st.W, H = st.H, port = st.portrait;
    let svg = this._t(W / 2, 28, TITLE[s], port ? 27 : 31);
    if (s === 0) {
      const y = port ? 150 : 170, xs = [W * 0.2, W * 0.5, W * 0.8], u = port ? 92 : 124;
      svg += `<g class="ww-pop">${sealSvg(xs[0], y - 10, u, 'bull')}</g><g class="ww-pop" style="--d:.12s">${potSvg(xs[1], y + u * 0.56, u * 1.2, 'var(--sim-strata-3)', { painted: true })}</g><g class="ww-pop" style="--d:.24s">${beadsSvg(xs[2], y, u * 1.1, { count: 6, long: true })}</g>`;
      ['Unread signs', 'Craft', 'Trade'].forEach((t, i) => { svg += this._t(xs[i], y + u * 0.78, t, port ? 23 : 26); });
      const cy = port ? 370 : 340;
      svg += `<rect x="${n(W / 2 - (port ? 170 : 220))}" y="${cy - 40}" width="${port ? 340 : 440}" height="${port ? 104 : 84}" rx="20" ${stroke('var(--sim-bad)', 4, 'stroke-dasharray:5 9')}/>`;
      svg += this._t(W / 2, cy + (port ? 12 : 2), port ? 'What they thought: ?' : 'What they thought and why: ?', port ? 27 : 28, 'var(--sim-bad)');
    } else if (s === 1) {
      const tw = port ? 300 : 300, th = port ? 210 : 330, x = port ? (W - tw) / 2 : 22, y = 60;
      svg += tabletSvg(x, y, tw, th);
      const rows = port ? 4 : 6;
      for (let i = 0; i < rows; i++) for (let j = 0; j < 8; j++) { const px = x + 26 + j * 33 + (i % 2) * 7, py = y + 34 + i * (th - 50) / rows; if ((i * 5 + j * 3) % 7 !== 2) svg += wedgeSvg(px, py, (i + j) % 3 === 0 ? 90 : 0, 24, 11); }
      const items = ['Names', 'Dates', 'Disputes', 'Beliefs'];
      items.forEach((t, i) => {
        const px = port ? (i % 2 ? W * 0.74 : W * 0.26) : x + tw + 40 + (W - x - tw - 40) / 2 - 20, py = port ? 322 + Math.floor(i / 2) * 76 : 86 + i * 84;
        const c = tone([2, 5, 3, 6][i]);
        svg += `<g class="ww-pop" style="--d:${(i * 0.1).toFixed(1)}s"><circle cx="${n(px - 74)}" cy="${n(py)}" r="9" ${fill(c)}/>${this._t(px - 56, py, t, port ? 26 : 32, 'var(--sim-label)', 'start')}</g>`;
      });
    } else {
      const cols = port ? 5 : 7, rows = port ? 4 : 3, gx = (W - 40) / cols, gy = port ? 82 : 92, ox = 20 + gx / 2, oy = 92;
      let i = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
        const lit = port ? i === 7 : i === 10, x = ox + c * gx, y = oy + r * gy, col = lit ? tone(2) : 'var(--sim-track)';
        svg += `<g${lit ? ' class="ww-pop"' : ''}><circle cx="${n(x)}" cy="${n(y - 22)}" r="15" ${fill(lit ? 'var(--sim-strata-3)' : col)}/><path d="M${n(x - 20)} ${n(y + 30)}Q${n(x - 20)} ${n(y - 6)} ${n(x)} ${n(y - 6)}Q${n(x + 20)} ${n(y - 6)} ${n(x + 20)} ${n(y + 30)}Z" ${fill(col)}/></g>`;
      }
      const y = oy + rows * gy + 8;
      svg += this._t(W / 2, y, 'A few could write', port ? 27 : 30) + this._t(W / 2, y + (port ? 40 : 40), 'Most voices are missing', port ? 27 : 30, 'var(--sim-bad)');
    }
    return { svg };
  }
}
