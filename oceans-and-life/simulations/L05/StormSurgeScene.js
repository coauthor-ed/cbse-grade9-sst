// StormSurgeScene - a made-up low coast in section. 0 calm, coast warning service; 1 shelter on high ground;
// 2 wind slider: strong winds pile sea water on the coast, the level rises and spreads inland until ground
// is as high as the water. Model: surge = 5 m x (wind / 200 km/h) squared; heights and winds are made up.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, rangeInput, bindRange, windArrow } from '../L04/SeaDraw.js';
import { svgCloud, svgLighthouse } from '../shared/SeaArt.js';
import { VILLAGES, layout, coastSvg, villageSvg, shelterSvg, groundAt } from './CoastSection.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const surge = (w) => 5 * (w / 200) ** 2;

export class StormSurgeScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A made-up low coast in section with five lettered villages at rising heights. Stronger wind piles the sea higher and the water spreads inland.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 430 : 420; }
  async setup() {
    this._w = 0; this._seen = false;
    await super.setup();
    this._off = bindRange(this, (id, v) => { this._w = v; if (surge(v) >= 2.6 && !this._seen) { this._seen = true; this.celebrate(this._vc?.[0], this._vc?.[1]); } });
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  enter(step) { this._w = step === 2 ? 100 : 0; }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, ctrl = step === 2 ? (port ? 92 : 78) : 0;
    const L = layout(W, H - ctrl, { y0: (H - ctrl) * 0.76, base: H - ctrl - 20, top: 74 });
    const h = step === 2 ? surge(this._w) : 0, gale = this._w / 200;
    this._vc = [L.x(0.42), L.y(2.6) - 40];
    let s = coastSvg(L, h, { storm: gale > 0.55 });
    if (step === 0) s += svgLighthouse(L.x(0.03), L.y(0.2), 0.42, { lit: true });
    if (gale > 0.2) {
      s += svgCloud(W * 0.14, 76, 0.5 + gale * 0.4, { seed: 2, kind: 'rain' });
      const n = gale > 0.6 ? 3 : gale > 0.35 ? 2 : 1;
      for (let i = 0; i < n; i++) { const y = L.y(h) - 24 - i * 26; s += windArrow([[10, y], [10 + L.seaW * (0.7 + gale * 0.9), y]], { w: 6 + gale * 6, col: sky('cloud'), flow: true }); }
    }
    for (const v of VILLAGES) s += villageSvg(L, v, { k: port ? 0.5 : 0.62, lit: h > v.h });
    if (step === 1) {
      const x = L.x(0.91), y = L.y(groundAt(0.91));
      s += shelterSvg(x, y + 2, port ? 0.66 : 0.9) + tx(W - 12, 24, 'cyclone shelter', { size: 16, anchor: 'end', col: sky('ink'), halo: sky('cloud'), display: true, weight: 700 });
    }
    s += tx(14, 24, 'A made-up coast', { size: 15, anchor: 'start', col: sky('ink'), halo: sky('cloud') });
    if (step === 0) s += tx(14, 48, 'A warning service watches, day and night', { size: 15, anchor: 'start', col: sky('ink'), halo: sky('cloud') });
    let over = '';
    if (step === 2) {
      const py = H - ctrl, reached = VILLAGES.filter((v) => h > v.h).map((v) => v.id);
      s += panel(8, py + 6, W - 16, ctrl - 14, { r: 12 });
      s += tx(22, py + 28, `Wind ${this._w} km/h`, { size: 15, anchor: 'start' }) + tx(W - 22, py + 30, `Sea up ${h.toFixed(1)} m`, { size: 20, anchor: 'end', display: true, weight: 700 });
      if (port) s += tx(W / 2, py + 76, reached.length ? `Water reaches ${reached.join(', ')}` : 'Water stays below the villages', { size: 15, col: 'var(--sim-label-muted)' });
      else s += tx(W / 2, py + 30, reached.length ? `Water reaches ${reached.join(', ')}` : 'Water stays below the villages', { size: 15, col: 'var(--sim-label-muted)' });
      over += rangeInput(W / 2, py + (port ? 50 : 54), W - 48, 'wind', this._w, 0, 200, 10, 'Wind speed');
    }
    return { svg: s, over };
  }
}
