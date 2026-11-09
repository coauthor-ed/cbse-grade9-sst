// LandformsHistoryScene - India's landforms on the Survey of India outline: tap a kind of land and it lights.
// Stages: 0 rivers and plains, mountains; 1 deserts, coasts. Places outside the layer stay in the text.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { withEarth, BAR_CSS, world, tag, ec, strand, INK, WHITE } from './EarthBits.js';
import { loadIndia, indiaView, baseMap, credit } from './IndiaMap.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'rivers', label: 'Rivers and plains', targets: ['rivers'], tone: 2 },
  { id: 'mountains', label: 'Mountains', targets: ['mountains'], tone: 5 },
  { id: 'deserts', label: 'Deserts', targets: ['deserts'], tone: 4 },
  { id: 'coasts', label: 'Coasts', targets: ['coasts'], tone: 1 },
];
const EXT = [[67, 7], [98, 37.5]];
// schematic bands, drawn over the real outline
const HIM = [[74, 34.5], [77, 32.5], [80, 30.5], [84, 28.4], [88, 27.8], [92, 28], [95.5, 28.6]];
const THAR = [[70, 25], [71, 28.2], [73.6, 28.7], [74.4, 26.2], [72.8, 24.8]];
const COAST = [[[72.8, 20.5], [73, 17], [74, 14.5], [75.3, 11.5], [76.5, 9], [77.5, 8.2]], [[77.6, 8.2], [79.8, 10.3], [80.2, 13.2], [82.2, 16.6], [85.5, 19.8], [87, 21.3]]];

export class LandformsHistoryScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 560;
  static ARIA_LABEL = 'A map of India. Tap rivers and plains, mountains, deserts or coasts to light them.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Kinds of land', chips: CHIPS, onChange: () => this.repaint() });

  css() { return BAR_CSS + '.tl-chip { white-space: nowrap; } .sim-dom-root:not(.sim-dom-root--portrait) .tl-chip { padding-left: 6px; padding-right: 6px; }'; }
  stageHeight(st) { return st.portrait ? 400 : 390; }

  async setup() {
    this._geo = null;
    await super.setup();
    this.tl.mount(this.root, this);
    try { this._geo = await loadIndia(); } catch (_) { this._geo = null; }
    this.repaint();
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(stage) { this.tl.set({ lit: stage ? 'deserts' : 'rivers' }); }

  paint(st) {
    const W = st.W, H = st.H;
    if (!this._geo) return { svg: world(st, 'lh', tag(W / 2, H / 2, 'Loading map', {})) };
    const v = indiaView(this._geo, { x: 6, y: 6, w: W - 12, h: H - 12 }, EXT), on = (t) => this.tl.has(t), L = (p) => p.map(v.at);
    let b = baseMap(v, W, H);
    if (on('rivers')) {
      const want = /ganga|ganges|brahmaputra|indus/i;
      const feats = this._geo.rivers.features ?? [];
      const sel = feats.filter((f) => want.test(f.properties?.name ?? ''));
      for (const f of sel) b += `<path d="${v.d(f)}" style="fill:none;stroke:${ec('seaDeep')};stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>`;
      const a = v.at([80.5, 26]), c = v.at([92, 26.4]), d = v.at([71.5, 31]);
      b += tag(a[0], a[1] + 16, 'Ganga', {}) + tag(c[0] - 6, c[1] + 30, 'Brahmaputra', {}) + tag(d[0] + 2, d[1] - 4, 'Indus', {});
    }
    if (on('mountains')) { b += strand(L(HIM), 'snowEdge', 20) + strand(L(HIM), 'snow', 13); const q = v.at([84, 30.6]); b += tag(q[0], q[1] - 24, 'Himalaya', {}); }
    if (on('deserts')) { b += `<path d="M${L(THAR).map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L')}Z" style="fill:${ec('sandDark')};stroke:${INK};stroke-width:2"/>`; const q = v.at([71.6, 26.8]); b += tag(q[0] - 2, q[1], 'Thar', {}); }
    if (on('coasts')) { for (const c of COAST) b += strand(L(c), 'gold', 8); const a = v.at([73, 13.5]), c = v.at([83, 14]); b += tag(a[0], a[1] + 8, 'West coast', { anchor: 'end' }) + tag(c[0] + 2, c[1], 'East coast', { anchor: 'start' }); }
    b += credit(W, H);
    return { svg: world(st, 'lh', b) };
  }
}
