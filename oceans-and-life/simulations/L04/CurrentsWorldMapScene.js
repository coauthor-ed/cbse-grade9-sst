// CurrentsWorldMapScene - the book's map of major ocean currents, opened where the beat is. Red warm, blue
// cold, land only. Tap a name: that current lights and the map goes close to it.
//   3 beats (answer): Gulf Stream, Labrador Current, then all currents.
//   2 beats (India):  the two red arrows near India, on both.
// CurrentsCoastsScene (subclass) has the beats for coast temperature.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, panel, sky, pathThrough, loadSea, seaView, mapOpen, mapEnd, mapName } from './SeaDraw.js';
import { CURRENTS, INDIA_ARROWS, WARM } from './CurrentsData.js';

const VIEWS = {
  world: [[-178, -60], [178, 70]],
  atlantic: [[-100, 14], [24, 72]],
  japan: [[118, 18], [172, 58]],
  peru: [[-112, -46], [-52, 2]],
  india: [[44, -8], [100, 28]],
};
const NAMES = {
  world: [],
  atlantic: [['Norway', 16, 62], ['Gulf of Mexico', -92, 19], ['Canada', -84, 56]],
  japan: [['Japan', 137, 37.5]],
  peru: [['South America', -64, -20]],
  india: [['India', 78, 21], ['Arabian Sea', 64, 8], ['Bay of Bengal', 90, 13]],
};
const CHIPS = [
  { id: 'gulf', label: 'Gulf Stream', targets: ['gulf-stream', 'north-atlantic-drift'], tone: 6, view: 'atlantic' },
  { id: 'lab', label: 'Labrador Current', targets: ['labrador-current'], tone: 1, view: 'atlantic' },
  { id: 'kur', label: 'Kuroshio', targets: ['kuroshio', 'north-pacific-drift'], tone: 6, view: 'japan' },
  { id: 'oya', label: 'Oyashio', targets: ['oyashio'], tone: 1, view: 'japan' },
  { id: 'hum', label: 'Humboldt (Peru)', targets: ['peru-current'], tone: 1, view: 'peru' },
  { id: 'all', label: 'All currents', targets: [], view: 'world' },
];
const STEPS = {
  0: { view: 'atlantic', lit: 'gulf' },
  1: { view: 'atlantic', lit: 'lab' },
  2: { view: 'world', lit: 'all' },
  10: { view: 'india', lit: null, chips: false },
};
const MAP3 = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const MAP2 = [[{ idx: 10, dwellMs: null }], [{ idx: 10, dwellMs: null }]];

export class CurrentsWorldMapScene extends SvgScene {
  static BEAT_STEP_MAP = MAP3;
  static BEAT_MAPS = { 3: MAP3, 2: MAP2 };
  static ARIA_LABEL = 'A map of major ocean currents. Warm currents are red arrows and cold currents are blue arrows. Tap a name to light that current.';
  static CONTROLS = [];
  static STEP_STATE = STEPS;
  tl = tapLight({ label: 'Currents', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 340 : 350; }
  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
    this._g = await loadSea();
    this.repaint();
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl) return;
    const s = this.constructor.STEP_STATE[step];
    this.tl.set({ lit: s.lit });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = s.chips === false;
    this.relayout?.();
  }
  /** One current as a slim arrow with a light casing. */
  _arrow(v, pts, kind, lit, dim, s) {
    const p = pts.map((q) => v.at(q)), col = kind === WARM ? sky('red') : sky('hullDark');
    const w = lit ? 6 * s : 3.2 * s, a = p[p.length - 2], b = p[p.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const head = (lit ? 17 : 11) * s, bx = b[0] - Math.cos(ang) * head, by = b[1] - Math.sin(ang) * head, hw = head * 0.56;
    const d = pathThrough([...p.slice(0, -1), [bx, by]], true);
    const tip = `M${b[0].toFixed(1)} ${b[1].toFixed(1)}L${(bx - Math.sin(ang) * hw).toFixed(1)} ${(by + Math.cos(ang) * hw).toFixed(1)}L${(bx + Math.sin(ang) * hw).toFixed(1)} ${(by - Math.cos(ang) * hw).toFixed(1)}Z`;
    return `<g opacity="${dim ? 0.3 : 1}"><path d="${d}" style="fill:none;stroke:${sky('white')};stroke-width:${w + 3.5};stroke-linecap:round;stroke-linejoin:round"/><path d="${tip}" style="fill:${sky('white')};stroke:${sky('white')};stroke-width:3.5;stroke-linejoin:round"/>`
      + `<path d="${d}" style="fill:none;stroke:${col};stroke-width:${w};stroke-linecap:round;stroke-linejoin:round"/><path d="${tip}" style="fill:${col}"/>`
      + (lit ? `<path class="air-flow" d="${d}" style="fill:none;stroke:${sky('white')};stroke-width:${Math.max(1.5, w * 0.34)};stroke-linecap:round;opacity:0.8"/>` : '') + '</g>';
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, base = this.constructor.STEP_STATE[step];
    if (!this._g) return { svg: panel(0, 0, W, H) };
    const chip = this.tl.chip(), viewId = chip?.view ?? base.view, targets = chip?.targets ?? [];
    const india = viewId === 'india', v = seaView(this._g, { x: 2, y: 2, w: W - 4, h: H - 6 }, VIEWS[viewId]);
    const world = viewId === 'world', k = world ? (port ? 0.62 : 0.9) : 1;
    let s = mapOpen(v), names = '';
    for (const [name, lon, lat] of NAMES[viewId]) { const [x, y] = v.at([lon, lat]); names += mapName(Math.max(62, Math.min(W - 50, x)), y, name, { size: 16 }); }
    const list = [...CURRENTS, ...INDIA_ARROWS];
    for (const c of list) {
      const lit = india ? c.id.startsWith('india-') : targets.includes(c.id);
      const dim = india ? !lit : targets.length > 0 && !lit;
      for (const p of c.paths) s += this._arrow(v, p.pts, c.kind, lit, dim, k);
    }
    s += mapEnd(v) + names;
    for (const c of list) {
      const lit = india ? c.id.startsWith('india-') : targets.includes(c.id);
      if (!lit || c.id === 'north-pacific-drift' || c.id === 'north-atlantic-drift' || india) continue;
      const [x, y] = v.at(c.paths[0].label);
      s += tx(Math.max(70, Math.min(W - 70, x)), y, c.name, { size: 16, col: c.kind === WARM ? sky('redDark') : sky('hullDark'), halo: sky('white'), haloW: 5, display: true, weight: 700 });
    }
    // legend, in the map's own words
    const lw = 148, lh = 54, lx = W - lw - 12, ly = H - lh - 14;
    s += panel(lx, ly, lw, lh, { r: 10, lift: 2 });
    s += `<path d="M${lx + 10} ${ly + 18}h34" style="stroke:${sky('red')};stroke-width:5;stroke-linecap:round"/>` + tx(lx + 52, ly + 23, 'warm current', { size: 14, anchor: 'start' });
    s += `<path d="M${lx + 10} ${ly + 38}h34" style="stroke:${sky('hullDark')};stroke-width:5;stroke-linecap:round"/>` + tx(lx + 52, ly + 43, 'cold current', { size: 14, anchor: 'start' });
    return { svg: s };
  }
}
