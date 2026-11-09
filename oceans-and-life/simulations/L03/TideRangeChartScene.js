// TideRangeChartScene - four water levels on one made-up shore, as water and sand: high water spring at the top,
// high water neap, low water neap, low water spring at the bottom. Green for spring, red for neap, so the neap lines
// lie inside the spring lines. Names light a pair. Beat 1 adds the tidal range: 6 m at spring and 2 m at neap,
// on a pole from 0 to 6 m. Numbers are made up and the figure says so.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, words, seaLabel, seaWhite, INK } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const CH = [{ id: 'spring', label: 'Spring tide', targets: ['spring'], tone: 3 }, { id: 'neap', label: 'Neap tide', targets: ['neap'], tone: 6 }];
const HW_S = 6, HW_N = 4, LW_N = 2, LW_S = 0;

export class TideRangeChartScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1)];
  static WIDTH = 720;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 450;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'Four water levels on a made-up shore. The green spring tide lines are the highest high water and the lowest low water. The red neap tide lines lie inside them. The range is 6 metres at spring tide and 2 metres at neap tide.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Kinds of tide', chips: CH, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() { return '.svs { padding: 6px; }'; }

  enter() { this.tl?.set?.({ lit: null }); }

  stageHeight(st) { return st.portrait ? 350 : 340; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    const top = H * 0.16, bot = H * 0.78, k = (bot - top) / 6, Y = (m) => bot - m * k;
    let s = `<defs>${svgSkyGradient('tr-sky', 0, 10)}</defs><rect width="${W}" height="${H}" style="fill:url(#tr-sky)"/>`;
    s += svgSeaColumn(0, Y(HW_S), 1, { w: W, h: H - Y(HW_S), bands: 3, wave: 0 });
    // Sand: low along the bottom, rising to the shore at the right.
    const sand = []; for (let x = 0; x <= W + 1; x += 12) { const u = x / W; sand.push([x, H - 26 - Math.sin(u * 7) * 5 - Math.max(0, u - 0.62) ** 2 * H * 4.4]); }
    s += `<path d="${line(sand)}L${W} ${H}L0 ${H}Z" ${fill(sc('sand'))}/><path d="${line(sand.map(([x, y]) => [x, y + 12]))}L${W} ${H}L0 ${H}Z" ${fill(sc('sandDark'))}/>`;
    const gr = sc('elevLow'), rd = sc('red');
    const op = (id) => (this.tl.off(id) ? 'opacity:0.22' : '');
    const lineAt = (m, col, id, width) => `<path d="M0 ${Y(m)}H${W}" ${stroke(col, width, op(id))}/>`;
    s += lineAt(HW_S, gr, 'spring', 5) + lineAt(LW_S, gr, 'spring', 5) + lineAt(HW_N, rd, 'neap', 5) + lineAt(LW_N, rd, 'neap', 5);
    const tag = (m, t, id, dy) => `<g style="${op(id)}">${seaLabel(14, Y(m) + dy, t, { anchor: 'start', size: P ? 15 : 17 })}</g>`;
    s += tag(HW_S, 'High water, spring tide', 'spring', -8) + tag(HW_N, 'High water, neap tide', 'neap', -8) + tag(LW_N, 'Low water, neap tide', 'neap', -8) + tag(LW_S, 'Low water, spring tide', 'spring', 22);
    if (step === 1) {
      const a = W * (P ? 0.64 : 0.62), b = W * (P ? 0.8 : 0.74);
      const br = (x, m0, m1, col, id, t) => `<g style="${op(id)}"><path d="M${x} ${Y(m0)}V${Y(m1)}M${x - 9} ${Y(m0)}h18M${x - 9} ${Y(m1)}h18" ${stroke(col, 6)}/><rect x="${x - 25}" y="${(Y(m0) + Y(m1)) / 2 - 14}" width="50" height="28" rx="14" ${fill(sc('cloud'), `stroke:${INK};stroke-width:2.5`)}/>${words(x, (Y(m0) + Y(m1)) / 2 + 6, t, { size: 16, ink: INK, display: true })}</g>`;
      s += br(a, LW_S, HW_S, gr, 'spring', '6 m') + br(b, LW_N, HW_N, rd, 'neap', '2 m');
      s += seaLabel((a + b) / 2, Y(HW_S) - 12, 'Tidal range', { size: P ? 16 : 18, display: true });
    }
    s += seaWhite(W - 10, H - 12, 'Made-up shore', { anchor: 'end', size: 15 });
    return { svg: frame(st, 'tr', s) };
  }
}
