// ElementsScene - blk-l03-s00b. A weather station on a lawn: five instruments you could hold. Tap a
// name and its instrument comes forward with what it measures. Second beat: the same five with one
// example report. Instrument names are beyond the book's text, and everyday school science.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, skyTx, panel, skyRect, sky, SKY_INK, svgThermometer, svgRainGauge, svgWindVane, svgBarometer, svgCloud, svgHills, svgLand } from './AirDraw.js';

const ITEMS = [
  { id: 'temp', chip: 'Temperature', tool: 'thermometer', says: 'how hot the air is', read: '32 \u00b0C' },
  { id: 'rain', chip: 'Precipitation', tool: 'rain gauge', says: 'how much rain falls', read: '4 cm' },
  { id: 'hum', chip: 'Humidity', tool: 'hygrometer', says: 'water vapour in the air', read: 'High' },
  { id: 'wind', chip: 'Wind', tool: 'wind vane', says: 'where the wind comes from', read: 'From the west' },
  { id: 'pres', chip: 'Air pressure', tool: 'barometer', says: 'the weight of the air', read: '1008 mb' },
];
const CHIPS = ITEMS.map((i, n) => ({ id: i.id, label: i.chip, targets: [i.id], tone: n + 1 }));
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];

function hygrometer(x, y, s) {
  const board = `<rect x="${x - 44 * s}" y="${y - 150 * s}" width="${88 * s}" height="${158 * s}" rx="${9 * s}" style="fill:${sky('wood')};stroke:${sky('woodDark')};stroke-width:3"/>`;
  const wick = `<path d="M${x + 22 * s} ${y - 16 * s}v${22 * s}" style="stroke:${sky('foam')};stroke-width:${7 * s};stroke-linecap:round"/>`
    + `<rect x="${x + 6 * s}" y="${y + 2 * s}" width="${32 * s}" height="${18 * s}" rx="${5 * s}" style="fill:${sky('sea')};stroke:${SKY_INK};stroke-width:2"/>`;
  return board + svgThermometer(x - 22 * s, y - 16 * s, 0.62 * s, { level: 0.7 }) + svgThermometer(x + 22 * s, y - 16 * s, 0.62 * s, { level: 0.5 }) + wick;
}

export class ElementsScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A weather station on a lawn with a thermometer, a rain gauge, a hygrometer, a wind vane and a barometer. Tap an element to see the instrument for it.';
  static CONTROLS = [];
  tl = tapLight({ label: 'The five elements', chips: CHIPS, onChange: () => this.repaint() });

  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 476 : 342; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter() { this.tl.reset(); }

  _tool(id, x, y, s) {
    if (id === 'temp') return `<rect x="${x - 7}" y="${y - 40 * s}" width="14" height="${40 * s + 4}" style="fill:${sky('wood')}"/>` + svgThermometer(x, y - 44 * s, s * 0.95, { level: 0.68 });
    if (id === 'rain') return svgRainGauge(x, y, s, { level: 0.42 });
    if (id === 'hum') return hygrometer(x, y - 22 * s, s);
    if (id === 'wind') return svgWindVane(x, y, s * 1.05, { heading: 20 });
    return `<rect x="${x - 7}" y="${y - 80 * s}" width="14" height="${80 * s + 4}" style="fill:${sky('wood')}"/>` + svgBarometer(x, y - 110 * s, s * 0.82, { level: 0.42 });
  }

  paint(st) {
    const W = st.W, H = st.H, lit = this.tl.chip()?.id, port = st.portrait;
    const ground = port ? H - 30 : H - 44;
    let s = skyRect('elSky', 0, 0, W, H, 0, 8, { r: 18 });
    s += svgCloud(W * 0.2, 56, 0.8, { seed: 2 }) + svgCloud(W * 0.8, 44, 0.65, { seed: 5 });
    s += svgHills(0, ground - 8, 1, { w: W, h: 70, seed: 4, far: true });
    s += svgLand(0, ground - 10, 1, { w: W, h: H - ground + 10, kind: 'plain', seed: 3 });
    const pos = port
      ? { temp: [W * 0.18, ground - 196, 0.72], rain: [W * 0.5, ground - 196, 0.72], hum: [W * 0.82, ground - 196, 0.72], wind: [W * 0.3, ground - 12, 0.8], pres: [W * 0.72, ground - 12, 0.8] }
      : { temp: [W * 0.1, ground, 1], rain: [W * 0.3, ground, 1], hum: [W * 0.5, ground, 1], wind: [W * 0.7, ground, 1], pres: [W * 0.9, ground, 1] };
    for (const it of ITEMS) {
      const [x, y, k] = pos[it.id], off = lit && lit !== it.id;
      s += `<g style="opacity:${off ? 0.32 : 1}"><g class="air-in">${this._tool(it.id, x, y, k * (lit === it.id ? 1.08 : 1))}</g>`;
      s += skyTx(x, y + 22 - (port ? 2 : 0), this.stepIndex === 1 ? it.read : it.tool, { size: port ? 14 : 15 });
      s += '</g>';
    }
    if (lit) {
      const it = ITEMS.find((i) => i.id === lit), w = Math.min(W - 24, 330);
      s += panel((W - w) / 2, 10, w, 64) + tx(W / 2, 35, it.chip + ': ' + it.tool, { size: 16 }) + tx(W / 2, 58, it.says, { size: 15, col: 'var(--sim-label-muted)', weight: 700 });
    } else if (this.stepIndex === 1) {
      const w = Math.min(W - 24, 300);
      s += panel((W - w) / 2, 10, w, 40) + tx(W / 2, 36, 'One example weather report', { size: 16 });
    }
    return { svg: s };
  }
}
