// CoastlineLivesScene - India's coast, from the Survey of India layer with the credit on screen. 0 places of
// work along the coast, drawn at their kind of place. 1 the book's map task: tap five coastal pins to mark
// them; each names its State or Union Territory. Tap targets 44 px at 390.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, hit, bindActs, loadSea, seaView, mapOpen, mapEnd, mapName, creditPlate } from '../L04/SeaDraw.js';
import { svgCountryBoat, svgCargoShip, svgTrawler } from '../shared/SeaArt.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const EXTENT = [[66, 6], [96, 25.5]];
const WORK = [
  { at: [71, 20.5], draw: 'boat', name: 'fishing' }, { at: [72, 14.5], draw: 'ship', name: 'ports' },
  { at: [74, 9], draw: 'boat', name: 'fishing' }, { at: [83, 11], draw: 'trawler', name: 'fishing' }, { at: [88, 17.5], draw: 'ship', name: 'ports' },
];
const PINS = [
  ['Gujarat', 70.2, 21.0], ['Maharashtra', 72.8, 18.2], ['Karnataka', 74.6, 13.6], ['Keralam', 76.2, 10.2],
  ['Tamil Nadu', 80.0, 12.0], ['Andhra Pradesh', 81.5, 16.2], ['Odisha', 86.2, 20.0], ['West Bengal', 88.3, 21.8],
];

export class CoastlineLivesScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A map of India with its long coast lit, fishing boats and ships along it, and pins on the coast to mark coastal States.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 440 : 430; }
  async setup() {
    this._on = new Set(); this._found = false;
    await super.setup();
    this._off = bindActs(this, (a) => {
      this._on.has(a) ? this._on.delete(a) : this._on.add(a);
      if (this._on.size >= 5 && !this._found) { this._found = true; const v = this._v; if (v) { const p = PINS.find((x) => x[0] === a); const q = v.at([p[1], p[2]]); this.celebrate(q[0], q[1]); } }
    });
    this._g = await loadSea({ india: true });
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    if (!this._g) return { svg: panel(0, 0, W, H) };
    const v = seaView(this._g, { x: 2, y: 2, w: W - 4, h: H - 6 }, EXTENT);
    this._v = v;
    let s = mapOpen(v, { coast: true });
    const k = port ? 0.34 : 0.48;
    if (step === 0) for (const w of WORK) {
      const [x, y] = v.at(w.at);
      s += w.draw === 'boat' ? svgCountryBoat(x, y, k, {}) : w.draw === 'ship' ? svgCargoShip(x, y, k * 0.56, {}) : svgTrawler(x, y, k * 0.8, {});
    }
    s += mapEnd(v);
    if (step === 0) {
      for (const w of WORK) { const [x, y] = v.at(w.at); s += mapName(Math.max(40, Math.min(W - 40, x)), y + 20, w.name, { size: 15 }); }
      s += mapName(W / 2 + 6, port ? 112 : 96, 'India', { size: 20, display: true, weight: 700 });
    }
    let over = '';
    if (step === 1) {
      for (const [name, lon, lat] of PINS) {
        const [x, y] = v.at([lon, lat]), on = this._on.has(name);
        s += `<circle cx="${x}" cy="${y}" r="${on ? 11 : 9}" style="fill:${on ? sky('red') : sky('white')};stroke:${sky('ink')};stroke-width:3"/>`;
        over += hit(x - 25, y - 25, 50, 50, name, `Mark ${name}`, { pressed: on });
        if (on) { const east = lon > 79; s += mapName(x + (east ? -16 : 16), y + 5, name, { size: 15, anchor: east ? 'end' : 'start' }); }
      }
      s += panel(10, 12, Math.min(W - 20, 220), 40, { r: 10 }) + tx(10 + Math.min(W - 20, 220) / 2, 38, `${this._on.size} marked, aim for five`, { size: 15 });
    }
    s += creditPlate(W - 2, H - 2, { size: 14 });
    return { svg: s, over };
  }
}
