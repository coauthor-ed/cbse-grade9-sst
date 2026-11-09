// GasSampleScene - a sealed jar of air on a window sill. Two mounts told apart by beat count:
//   0  the s02 predict setup: the jar is shut, nothing in it is shown, no share is on screen
//   3  blk-l01-s03: beat 0 nitrogen and oxygen fill the grid; beat 1 every share, with a Pie chip;
//      beat 2 the last square under a magnifying glass, in true proportion
// Book's Fig 3.2 is the pie. State comes from the step alone, so a cold start lands right.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SKY_COLOR_MAP, svgCloud, svgHills, svgSun, svgSkyColour } from '../shared/SkyArt.js';
import { GASES, col, inkOnTone, words, panel, skyFrame, jarBack, jarFront, plank } from './AirBits.js';

const S_SETUP = 0, S_FILL = 1, S_ALL = 2, S_LENS = 3;
const MAP = [S_FILL, S_ALL, S_LENS].map((idx) => [{ idx, dwellMs: null }]);
const N = GASES[0], O = GASES[1], REST = GASES.slice(2);
const fmt = (v) => (v >= 1 ? String(v) : v.toFixed(2));

export class GasSampleScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: [[{ idx: S_SETUP, dwellMs: null }]], 3: MAP };
  static WIDTH = 560;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'A sealed glass jar of air standing on a window sill. In the answer it fills as a grid of one hundred squares: 78 nitrogen, 21 oxygen and one square for argon, carbon dioxide and the others. A chip turns the grid into a pie.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Show the shares as', chips: [], onChange: () => { this._fresh = false; this.repaint(); } });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() {
    return `.svs { padding: 6px; }
.sim-dom-root--portrait.svs { padding: 2px 0; }
.gs-sq { transform-box: fill-box; transform-origin: center; animation: gs-pop 0.3s var(--look-spring) both; animation-delay: var(--d, 0s); }
@keyframes gs-pop { from { transform: scale(0); opacity: 0; } }
.gs-in { animation: gs-rise 0.45s var(--look-spring-soft) both; animation-delay: var(--d, 0s); }
@keyframes gs-rise { from { opacity: 0; transform: translateY(10px); } }`;
  }

  enter(step) {
    this._fresh = true;
    this.tl.set({ chips: step === S_ALL ? [{ id: 'pie', label: 'Pie', targets: ['pie'], tone: 1 }] : [], lit: null });
  }

  // A predict host sends no beats, or an out-of-range count (simulationHost's freeplay call): both are the setup.
  onBeatChange(beat, count) { super.onBeatChange(beat, count === 3 ? 3 : 0); }

  stageHeight(st) { return st.portrait ? 350 : 360; }

  _grid(x, y, s, gap) {
    const step = this.stepIndex, cell = s + gap;
    let out = '';
    for (let i = 0; i < 100; i += 1) {
      const row = 9 - Math.floor(i / 10), cx = x + (i % 10) * cell, cy = y + row * cell;
      const g = i < 78 ? N : i < 99 ? O : null;
      const d = this._fresh ? (i < 78 ? i * 0.009 : 0.72 + (i - 78) * 0.018) : 0;
      const a = this._fresh ? ` class="gs-sq" style="--d:${d.toFixed(2)}s"` : '';
      if (g) out += `<g${a}><rect x="${cx}" y="${cy}" width="${s}" height="${s}" rx="${Math.min(4, s / 4)}" ${fill(col(g.tone), 'stroke:var(--sim-stroke);stroke-width:1')}/></g>`;
      else {
        // The last square holds argon, carbon dioxide and the others, side by side in true shares.
        const a0 = s * 0.93, c0 = s * 0.04, o0 = s * 0.03;
        out += `<g${step === S_FILL ? ' style="opacity:0.35"' : ''}><rect x="${cx}" y="${cy}" width="${a0}" height="${s}" ${fill(col(5))}/><rect x="${cx + a0}" y="${cy}" width="${c0}" height="${s}" ${fill(col(6))}/><rect x="${cx + a0 + c0}" y="${cy}" width="${o0}" height="${s}" ${fill(col(4))}/></g>`;
      }
    }
    return out;
  }

  _pie(cx, cy, r) {
    const arc = (a0, a1) => {
      const p = (a) => [cx + r * Math.sin(a * 2 * Math.PI), cy - r * Math.cos(a * 2 * Math.PI)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${cx} ${cy}L${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z`;
    };
    return `<path d="${arc(0, 0.78)}" ${fill(col(1), 'stroke:var(--sim-bg-surface);stroke-width:3')}/><path d="${arc(0.78, 0.99)}" ${fill(col(2), 'stroke:var(--sim-bg-surface);stroke-width:3')}/><path d="${arc(0.99, 1)}" ${fill(col(5))}/>`
      + words(cx + r * 0.12, cy + r * 0.3, 'Nitrogen', { anchor: 'middle', size: 18, ink: inkOnTone(1), display: true })
      + words(cx - r * 0.42, cy - r * 0.34, 'Oxygen', { anchor: 'middle', size: 15, ink: inkOnTone(2), display: true });
  }

  _lens(cx, cy, r, sx, sy) {
    const ring = svgSkyColour('brass'), dark = svgSkyColour('brassDark');
    // Inside the lens, the one square, large. The shares stay true: 93, 4 and 3 out of 100.
    const w = r * 1.34, x0 = cx - w / 2, y0 = cy - w / 2, a = w * 0.93, c = w * 0.04, o = w * 0.03;
    return `<path d="M${sx} ${sy}L${cx} ${cy}" ${stroke(dark, 4)}/><circle cx="${cx}" cy="${cy}" r="${r}" ${fill(svgSkyColour('glass'))}/>`
      + `<rect x="${x0}" y="${y0}" width="${a}" height="${w}" ${fill(col(5))}/><rect x="${x0 + a}" y="${y0}" width="${c}" height="${w}" ${fill(col(6))}/><rect x="${x0 + a + c}" y="${y0}" width="${o}" height="${w}" ${fill(col(4))}/>`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" ${stroke(dark, 11)}/><circle cx="${cx}" cy="${cy}" r="${r}" ${stroke(ring, 7)}/>`
      + words(x0 + a / 2, cy + 7, 'Argon', { anchor: 'middle', size: 20, ink: inkOnTone(5), display: true });
  }

  _legend(x, y, w, st) {
    const step = this.stepIndex, rows = step === S_LENS ? REST : GASES, big = [N, O];
    const list = step === S_FILL ? big : rows, rh = st.portrait ? (step === S_FILL ? 60 : step === S_LENS ? 42 : 46) : (step === S_FILL ? 66 : step === S_LENS ? 42 : 48);
    const h = rh * list.length + 18;
    let out = panel(x, y, w, h);
    list.forEach((g, i) => {
      const ry = y + 9 + rh * i, mid = ry + rh / 2, two = st.portrait;
      out += `<g class="${this._fresh ? 'gs-in' : ''}" style="--d:${(0.1 + i * 0.1).toFixed(1)}s">`;
      if (two) {
        out += `<circle cx="${x + 13}" cy="${mid - 8}" r="6" ${fill(col(g.tone))}/>` + words(x + 23, mid - 3, g.name === 'Carbon dioxide' ? 'CO2' : g.name, { size: 14 })
          + words(x + 23, mid + 15, `${fmt(g.share)}%`, { size: step === S_FILL ? 24 : 16, display: true, ink: `var(--sim-series-${g.tone}-ink)` });
      } else {
        out += `<circle cx="${x + 16}" cy="${mid}" r="7" ${fill(col(g.tone))}/>` + words(x + 29, mid + 5, g.name, { size: 14 })
          + words(x + w - 12, mid + 7, `${fmt(g.share)}%`, { anchor: 'end', size: step === S_FILL ? 30 : 18, display: true, ink: `var(--sim-series-${g.tone}-ink)` });
      }
      out += '</g>';
    });
    return { svg: out, h };
  }

  paint(st) {
    const step = this.stepIndex, P = st.portrait, W = st.W, H = st.H;
    const sill = H - (P ? 44 : 62);
    const size = P ? (step === S_SETUP ? 236 : 186) : (step === S_SETUP ? 264 : 262);            // the inside of the jar
    const jx = step === S_SETUP ? (W - size) / 2 : P ? 16 : 34, jy = sill - size - 13;
    let body = svgSun(W - 48, 50, P ? 0.5 : 0.62) + svgCloud(P ? 60 : 120, 50, P ? 0.6 : 0.9, { seed: 4 }) + svgCloud(W * 0.62, 112, 0.6, { seed: 9 })
      + svgHills(-10, sill - 2, 1, { w: W + 20, h: 120, far: true, seed: 3, peaks: 4 })
      + `<rect x="0" y="${sill}" width="${W}" height="${H - sill}" ${fill(svgSkyColour('sand'))}/>` + plank(-6, sill, W + 12, 22);
    let cap = '';
    const pad = 8, inner = size - 2 * pad;
    const showPie = step === S_ALL && this.tl.has('pie');
    body += jarBack(jx, jy, size, size);
    if (step === S_SETUP) {
      // Air you cannot see: the jar stays empty on purpose.
      cap = words(W / 2, jy + size / 2 + 8, '?', { anchor: 'middle', size: 96, display: true, ink: svgSkyColour('inkSoft') });
      body += cap;
    } else if (showPie) body += this._pie(jx + size / 2, jy + size / 2, size / 2 - 8);
    else body += this._grid(jx + pad, jy + pad, (inner - 9 * 2) / 10, 2);
    body += jarFront(jx, jy, size, size);
    if (step !== S_SETUP) {
      if (step === S_LENS) {
        const sq = (inner - 18) / 10, sx = jx + pad + 9 * (sq + 2) + sq / 2, sy = jy + pad + sq / 2;
        const lx = P ? W - 66 : jx + size + 110, ly = P ? 62 : 90, r = P ? 52 : 70;
        body += this._lens(lx, ly, r, sx, sy);
        const lg = this._legend(P ? jx + size + 12 : jx + size + 30, ly + r + (P ? 12 : 22), P ? W - jx - size - 22 : W - jx - size - 50, st);
        body += lg.svg;
      } else {
        const lg = this._legend(jx + size + (P ? 12 : 34), P ? 44 : 52, P ? W - jx - size - 22 : W - jx - size - 54, st);
        body += lg.svg;
      }
    }
    this._fresh = false;
    return { svg: skyFrame(st, 'gs', 0, 6, body) };
  }
}
