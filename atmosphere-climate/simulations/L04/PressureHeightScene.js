// PressureHeightScene - blk-l04-s02 setup and blk-l04-s03. The road from Delhi to Leh, in section.
//   step 0 setup: a sealed packet at Delhi, the road up, a question mark at Leh. No readings.
//   step 1 the packet at Leh has swollen; chips move between the two places
//   step 2 readings: about 1000 mb at Delhi, about 670 at Leh, about 260 at 10 km (standard
//          atmosphere); the column of air above each place is drawn with its true share of dots
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, skyTx, panel, reading, skyRect, sky, SKY_INK, num, pathThrough, svgAeroplane, svgCloud } from '../L03/AirDraw.js';

const SETUP = [[{ idx: 0, dwellMs: null }]];
const MAP = [[{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const CHIPS = [{ id: 'delhi', label: 'Delhi', targets: ['delhi'], tone: 1 }, { id: 'leh', label: 'Leh', targets: ['leh'], tone: 2 }];

function packet(x, y, s, bulge) {
  const w = 50 * s, h = 70 * s, b = bulge * 22 * s;
  const d = `M${x - w} ${y - h}C${x - w - b} ${y - h * 0.4} ${x - w - b} ${y + h * 0.4} ${x - w} ${y + h}L${x - w * 0.5} ${y + h - 6}L${x} ${y + h}L${x + w * 0.5} ${y + h - 6}L${x + w} ${y + h}C${x + w + b} ${y + h * 0.4} ${x + w + b} ${y - h * 0.4} ${x + w} ${y - h}L${x + w * 0.5} ${y - h + 6}L${x} ${y - h}L${x - w * 0.5} ${y - h + 6}Z`;
  return `<path d="${d}" style="fill:var(--sim-series-2);stroke:${SKY_INK};stroke-width:3.5;stroke-linejoin:round"/>`
    + `<ellipse cx="${x}" cy="${y}" rx="${w * 0.62 + b * 0.5}" ry="${h * 0.34}" style="fill:${sky('sail')};stroke:${SKY_INK};stroke-width:2.5"/>`
    + tx(x, y + 6, 'CHIPS', { size: Math.round(17 * s), col: SKY_INK, display: true, weight: 700 });
}

export class PressureHeightScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: SETUP, [Number.MAX_SAFE_INTEGER]: SETUP, 1: SETUP, 2: MAP };
  static ARIA_LABEL = 'The road from Delhi up to Leh, with a sealed packet of chips. At Leh less air lies above, so the air outside presses less and the packet swells.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Place', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 450 : 420; }
  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set({ lit: step >= 1 ? 'leh' : null, disabled: step === 0 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step !== 1;
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    const top = 8, g = H - 26, km = (k) => g - k * (g - top) / 12;
    const at = step === 0 ? 'delhi' : this.tl.chip()?.id ?? 'leh';
    let s = skyRect('phSky', 0, 0, W, H, 0, 14, { r: 18 });
    if (step === 0) s += svgCloud(W * 0.3, km(8), 0.7, { seed: 2 });
    // terrain in true height: Delhi 219 m, Leh 3506 m (Table 3.3)
    const dx = W * 0.14, lx = W * (port ? 0.72 : 0.5), hx = W * (port ? 0.46 : 0.8);
    const pts = [[0, km(0.05)], [dx, km(0.22)], [W * 0.3, km(0.5)], [W * (port ? 0.42 : 0.36), km(2.2)], [W * (port ? 0.56 : 0.43), km(3.8)], [lx, km(3.5)], [W * (port ? 0.84 : 0.7), km(4.8)], [W * 0.9, km(5.4)], [W, km(4.2)]];
    s += `<path d="${pathThrough(pts, true)}L${W} ${H}L0 ${H}Z" style="fill:${sky('rock')};stroke:${sky('rockDark')};stroke-width:3"/>`;
    s += `<path d="${pathThrough(pts.slice(0, 3), true)}L${W * 0.3} ${H}L0 ${H}Z" style="fill:${sky('grass')}"/>`;
    s += `<path d="${pathThrough(pts.slice(1, 6), true)}" style="fill:none;stroke:${sky('sand')};stroke-width:5;stroke-dasharray:12 9;stroke-linecap:round"/>`;
    const column = (x, base, n) => {
      let o = `<path d="M${x - 26} ${top}V${base}M${x + 26} ${top}V${base}" style="stroke:${SKY_INK};stroke-width:2.5;stroke-dasharray:8 7;opacity:0.7"/>`;
      let r = 5;
      for (let i = 0; i < n; i++) { r = (r * 29 + 7) % 1013; const q = (r * 13 % 1013) / 1013, u = r / 1013; o += `<circle cx="${num(x - 22 + 44 * q)}" cy="${num(base - 4 - (base - top - 8) * (1 - Math.pow(1 - u, 0.5)))}" r="3.2" style="fill:${sky('seaDeep')}"/>`; }
      return o;
    };
    const dy = km(0.22), ly = km(3.5), hy = km(10);
    if (step >= 1) s += column(dx, dy, 60) + column(lx, ly, 40);
    if (step === 2 && !port) s += column(hx, hy, 15);
    if (step === 2) s += svgAeroplane(hx, hy, port ? 0.55 : 0.7, {});
    const flag = (x, y, name) => `<circle cx="${x}" cy="${y}" r="7" style="fill:var(--sim-series-2);stroke:${SKY_INK};stroke-width:2.5"/>` + skyTx(x, y + 26, name, { size: 16 });
    s += flag(dx, dy, 'Delhi') + flag(lx, ly, 'Leh');
    if (step === 0) {
      s += skyTx(lx, ly - 34, '?', { size: 40, display: true, weight: 700 });
      s += `<g>${packet(dx + 32, dy - 76, 0.62, 0.08)}</g>`;
      s += skyTx(W * 0.42, km(1.2) - 10, '', { size: 14 });
    } else if (step === 1) {
      const pxx = port ? W * 0.27 : W - 112, pyy = 112;
      s += panel(pxx - 88, 10, 176, 204) + `<g class="air-in">${packet(pxx, pyy + 8, 1, at === 'leh' ? 1 : 0.08)}</g>`;
      s += tx(pxx, 34, at === 'leh' ? 'At Leh: swollen' : 'At Delhi: flat', { size: 16 });
    } else {
      const cw = port ? 104 : 136, ch = 70;
      s += reading(Math.max(8, dx - 26), km(0.22) - 150, 'Delhi', 'about 1000', { w: cw, h: ch, size: port ? 19 : 24 });
      s += reading(Math.min(W - cw - 8, lx - cw / 2 - (port ? 0 : 0)), ly - 96, 'Leh', 'about 670', { w: cw, h: ch, size: port ? 19 : 24 });
      s += reading(port ? W - cw - 8 : W - cw - 12, port ? 8 : hy + 26, '10 km up', 'about 260', { w: cw, h: ch, size: port ? 19 : 24 });
      s += skyTx(port ? 12 : 16, 30, 'Air pressure, millibars', { size: 16, anchor: 'start' });
    }
    return { svg: s };
  }
}
