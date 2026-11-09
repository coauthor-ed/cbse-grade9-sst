// TwoCoastsScene - setup for the currents predict. The North Atlantic and nothing that gives the answer:
// real coasts, two parallels, two names, icebergs off Labrador, open water off Norway. No arrow, no current.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, panel, sky, loadSea, seaView, mapOpen, mapEnd, mapName } from './SeaDraw.js';

const EXTENT = [[-78, 40], [32, 73]];
const BERGS = [[-52.5, 56, 1], [-48, 53.5, 0.8], [-52, 52.6, 0.7], [-46, 50, 0.9], [-49, 58, 0.7], [-50.5, 49, 0.7]];
const berg = (x, y, s) => `<path d="M${x - 15 * s} ${y + 8 * s}l${5 * s} ${-13 * s}l${7 * s} ${-3 * s}l${5 * s} ${-9 * s}l${9 * s} ${11 * s}l${5 * s} ${14 * s}Z" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2;stroke-linejoin:round"/><path d="M${x + 1 * s} ${y - 15 * s}l${9 * s} ${11 * s}l${5 * s} ${12 * s}l${-9 * s} 0Z" style="fill:${sky('glassEdge')}"/>`;

export class TwoCoastsScene extends SvgScene {
  static ARIA_LABEL = 'A map of the North Atlantic. Norway is on the right at about 65 degrees north, with open sea. Labrador is on the left, further south, with icebergs off its coast.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }'; }
  stageHeight(st) { return st.portrait ? 400 : 430; }
  async setup() { await super.setup(); this._g = await loadSea(); this.repaint(); }

  paint(st) {
    const W = st.W, H = st.H, port = st.portrait;
    if (!this._g) return { svg: panel(0, 0, W, H) };
    const v = seaView(this._g, { x: 2, y: 2, w: W - 4, h: H - 6 }, EXTENT);
    let s = mapOpen(v);
    for (const lat of [60, 70]) {
      const y = v.at([0, lat])[1];
      s += `<path d="M0 ${y}H${W}" style="stroke:${sky('ink')};stroke-width:2.5;stroke-dasharray:10 8;opacity:0.65"/>`;
      s += mapName(port ? W / 2 : W / 2, y - 7, `${lat}° N`, { size: 16 });
    }
    for (const [lon, lat, k] of BERGS) { const [x, y] = v.at([lon, lat]); s += berg(x, y, k * (port ? 1 : 1.3)); }
    const nor = v.at([17, 64]), lab = v.at([-66, 54]);
    s += mapEnd(v);
    s += mapName(Math.min(nor[0] + 8, W - 44), nor[1] + 2, 'Norway', { size: 20, display: true, weight: 700 });
    s += mapName(Math.max(lab[0] - 2, 56), lab[1] - (st.portrait ? 26 : 0), 'Labrador', { size: 20, display: true, weight: 700 });
    const o = v.at([-2, 67.5]);
    s += mapName(o[0], o[1] + 6, 'open sea', { size: 15 });
    const b = v.at([-42, 46]);
    s += mapName(b[0], b[1] + 6, 'icebergs', { size: 15 });
    return { svg: s };
  }
}
