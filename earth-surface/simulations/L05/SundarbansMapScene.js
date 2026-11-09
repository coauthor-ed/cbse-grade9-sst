// SundarbansMapScene - stage 0: the Ganga and Brahmaputra on the Survey of India outline, reaching the Bay of Bengal.
// Stage 1: a drawn close-up of tidal channels and mangrove islands. The close-up is schematic and says so.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgWater, svgTree } from '../shared/EarthArt.js';
import { withEarth, BAR_CSS, world, tag, ec, strand, shape, INK, WHITE } from '../L04/EarthBits.js';
import { loadIndia, indiaView, baseMap, credit } from '../L04/IndiaMap.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const EXT = [[84, 20], [96, 29]];
const DELTA = [[88.2, 21.6], [89.2, 21.6], [90.6, 22], [90.6, 23.6], [89.2, 24.3], [88.2, 23.6]];
const ISL = [[[.04, .1], [.26, .06], [.3, .4], [.1, .46]], [[.34, .04], [.6, .1], [.56, .44], [.36, .36]], [[.66, .06], [.96, .08], [.92, .38], [.64, .42]], [[.06, .54], [.3, .5], [.36, .84], [.12, .9]], [[.42, .5], [.62, .5], [.66, .9], [.44, .92]], [[.72, .48], [.94, .46], [.96, .8], [.74, .84]]];

export class SundarbansMapScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static ARIA_LABEL = 'A map of eastern India. The Ganga and Brahmaputra reach the Bay of Bengal in a large delta. A drawing shows mangrove islands and tidal channels.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 400 : 390; }
  async setup() {
    this._geo = null;
    await super.setup();
    try { this._geo = await loadIndia(); } catch (_) { this._geo = null; }
    this.repaint();
  }
  enter(stage) { this._stage = stage; this._fresh = true; }

  _map(st) {
    const W = st.W, H = st.H;
    if (!this._geo) return tag(W / 2, H / 2, 'Loading map', {});
    const v = indiaView(this._geo, { x: 6, y: 6, w: W - 12, h: H - 12 }, EXT), pop = this._fresh ? { pop: true } : {};
    let b = baseMap(v, W, H);
    b += `<path d="M${DELTA.map(v.at).map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L')}Z" style="fill:${ec('grassLit')};stroke:${ec('gold')};stroke-width:3.5;stroke-linejoin:round"/>`;
    for (const f of (this._geo.rivers.features ?? []).filter((x) => /ganga|ganges|brahmaputra/i.test(x.properties?.name ?? ''))) b += `<path d="${v.d(f)}" style="fill:none;stroke:${ec('seaDeep')};stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round"/>`;
    const a = v.at([85.8, 25.7]), c = v.at([92.8, 26.8]), d = v.at([89.3, 21.1]);
    b += tag(a[0], a[1] - 18, 'Ganga', pop) + tag(c[0], c[1] - 20, 'Brahmaputra', { ...pop, delay: .1 });
    b += tag(d[0], d[1] - 38, 'Sundarbans', { ...pop, delay: .2 }) + tag(d[0] - 22, d[1] + 4, 'Bay of Bengal', { ...pop, delay: .3, fill: ec('seaDeep') });
    return b + credit(W, H);
  }

  _close(st) {
    const W = st.W, H = st.H, top = 44, h = H - top, X = (u) => u * W, Y = (v) => top + v * h, pop = this._fresh ? { pop: true } : {};
    let b = svgWater([[-10, top - 10], [W + 10, top - 10], [W + 10, H + 10], [-10, H + 10]], { t: 2, ripples: 9, deep: .3 });
    ISL.forEach((q, i) => {
      const p = q.map(([u, v]) => [X(u), Y(v)]);
      b += shape(p, { f: 'leafDark', s: 'soilTop', w: 3 });
      for (let n = 0; n < 5; n++) { const [x, y] = p[0]; b += svgTree(x + 18 + (n % 3) * 26 + (i % 2) * 8, y + 44 + (n > 2 ? 40 : 0) + (n % 2) * 8, .46, { kind: 'round', seed: n + i }); }
    });
    b += `<g transform="translate(${X(.33)} ${Y(.48)})"><path d="M-24 -4h48l-9 12h-30z" style="fill:${ec('bark')};stroke:${INK};stroke-width:2.5"/><rect x="-8" y="-14" width="17" height="10" style="fill:${ec('snow')};stroke:${INK};stroke-width:2"/></g>`;
    b += strand([[X(.33) + 30, Y(.49)], [X(.5), Y(.46)], [X(.62), Y(.47)]], 'foam', 3, { dash: '4 8' });
    b += tag(W / 2, 22, 'A drawing, not a map', { ...pop, size: 14 });
    b += tag(X(.26), Y(.25), 'Mangroves', { ...pop, delay: .1 }) + tag(X(.78), Y(.46), 'Tidal channels', { ...pop, delay: .2, fill: ec('seaDeep') }) + tag(X(.64), Y(.72), 'Home of the Bengal tiger', { ...pop, delay: .3 });
    return b;
  }

  paint(st) { const b = this._stage ? this._close(st) : this._map(st); this._fresh = false; return { svg: world(st, 'sb', b) }; }
}
