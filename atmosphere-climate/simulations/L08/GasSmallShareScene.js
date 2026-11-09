// GasSmallShareScene - how small 0.04 per cent is, and why it still matters. Mounts:
//   blk-l08-s02 predict, role setup: 2500 squares of air, exactly one of them carbon dioxide, ringed.
//   blk-l08-s03 2 beats: (0) heat passes the nitrogen and oxygen squares and is caught on the small one;
//   (1) under 0.03 per cent in the 1800s, about 0.04 per cent now, about one and a half times as much.
// The grid is true to scale: 1 in 2500 is 0.04 per cent. Nitrogen 1950, oxygen 525, others 24, carbon dioxide 1.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const BEATS = 2, N = 50;
const CO2_AT = 1187;      // the one square, away from the frame
// A fixed shuffle: a simple stride through the 2500 cells visits each once.
const KIND = (() => { const a = new Array(N * N).fill(0); for (let i = 0; i < N * N; i++) { const c = (i * 1259) % (N * N); a[c] = i < 1950 ? 0 : i < 2475 ? 1 : 2; } a[CO2_AT] = 3; return a; })();
const COLS = ['var(--sim-series-1)', 'var(--sim-series-3)', 'var(--sim-label-muted)'];
const HEAT = 'var(--sim-series-6)';
const CSS = `
.gs-key { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px var(--sim-space-3); font: 700 var(--sim-text-sm)/1.3 var(--sim-font); color: var(--sim-label); }
.gs-key i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 4px; vertical-align: -1px; }
`;

export class GasSmallShareScene extends SvgScene {
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A grid of 2500 squares of air, nearly all nitrogen and oxygen, with one square of carbon dioxide ringed.';

  get _isSetup() { return this._count !== BEATS; }
  onBeatChange(b, c) { this._count = c; super.onBeatChange(b, c); }
  css() { return READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? Math.min(st.W, 348) : 340; }

  paint(st) {
    const setup = this._isSetup, step = this.stepIndex;
    if (!setup && step === 1) return this._bars(st);
    const S = Math.min(st.W, st.H) - 6, cell = S / N, gx = (st.W - S) / 2, gy = 3;
    const paths = ['', '', ''];
    KIND.forEach((k, i) => { if (k < 3) { const x = gx + (i % N) * cell, y = gy + Math.floor(i / N) * cell; paths[k] += `M${x.toFixed(1)} ${y.toFixed(1)}h${(cell * 0.8).toFixed(1)}v${(cell * 0.8).toFixed(1)}h${(-cell * 0.8).toFixed(1)}Z`; } });
    let svg = `<rect x="${gx - 3}" y="0" width="${S + 6}" height="${S + 6}" rx="10" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:3"/>`;
    paths.forEach((d, k) => { svg += `<path d="${d}" style="fill:${COLS[k]};opacity:${!setup && k < 2 ? 0.34 : 0.62}"/>`; });
    const cx = gx + (CO2_AT % N + 0.4) * cell, cy = gy + (Math.floor(CO2_AT / N) + 0.4) * cell;
    if (!setup) {
      const xs = [0.14, 0.28, 0.72, 0.86].map((u) => gx + u * S);
      xs.forEach((x, i) => { const d = `M${x.toFixed(1)} ${S}q10 ${-S / 8} 0 ${-S / 4}t0 ${-S / 4}t0 ${-S / 4}t0 ${-S / 4 + 8}`; svg += `<path d="${d}" class="sv-draw" pathLength="1" style="--len:1;--dur:0.9s;--d:${i * 0.1}s;fill:none;stroke:${HEAT};stroke-width:5;stroke-linecap:round;opacity:0.8"/>`; });
      svg += `<path d="M${cx.toFixed(1)} ${S}L${cx.toFixed(1)} ${(cy + 24).toFixed(1)}" class="sv-draw" pathLength="1" style="--len:1;--dur:0.7s;fill:none;stroke:${HEAT};stroke-width:6;stroke-linecap:round"/>`;
    }
    svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="22" style="fill:var(--sim-bg-surface);stroke:${HEAT};stroke-width:5"/><rect x="${(cx - 7).toFixed(1)}" y="${(cy - 7).toFixed(1)}" width="14" height="14" rx="3" style="fill:${HEAT}"/>`;
    const key = `<div class="gs-key"><span><i style="background:${COLS[0]}"></i>nitrogen</span><span><i style="background:${COLS[1]}"></i>oxygen</span><span><i style="background:${COLS[2]}"></i>others</span><span><i style="background:${HEAT}"></i>carbon dioxide</span></div>`;
    const card = setup ? readCard('1 square in 2500', 'carbon dioxide, 0.04 per cent') : readCard('Heat is caught here', 'it passes through nitrogen and oxygen');
    return { svg, head: card + key };
  }

  _bars(st) {
    const W = st.W, H = st.H, base = H - 44, top = 26, max = 0.05, y = (v) => base - (v / max) * (base - top), bw = Math.min(110, W * 0.3);
    const bars = [{ x: W * 0.28, v: 0.028, t: '1800s', s: 'under 0.03%' }, { x: W * 0.72, v: 0.04, t: 'Today', s: 'about 0.04%' }];
    let svg = `<rect width="${W}" height="${H}" rx="16" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:3"/>`;
    bars.forEach((b, i) => {
      const yy = y(b.v);
      svg += `<rect class="sv-grow" x="${b.x - bw / 2}" y="${yy.toFixed(1)}" width="${bw}" height="${(base - yy).toFixed(1)}" rx="10" style="fill:${HEAT};opacity:${i ? 1 : 0.55};--d:${i * 0.2}s"/>`
        + `<text x="${b.x}" y="${(yy - 8).toFixed(1)}" text-anchor="middle" style="font:600 19px var(--sim-font-display);fill:var(--sim-label)">${b.s}</text>`
        + `<text x="${b.x}" y="${H - 16}" text-anchor="middle" style="font:600 17px var(--sim-font-display);fill:var(--sim-label)">${b.t}</text>`;
    });
    svg += `<line x1="14" x2="${W - 14}" y1="${base}" y2="${base}" style="stroke:var(--sim-stroke);stroke-width:3"/>`;
    return { svg, head: readCard('One and a half times as much', 'the Earth has warmed by a little over 1 °C') };
  }
}
