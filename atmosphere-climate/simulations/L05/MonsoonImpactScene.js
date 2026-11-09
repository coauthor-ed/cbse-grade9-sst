// MonsoonImpactScene - blk-l05-s07. One village drawn three ways: book's list only. A good monsoon
// gives crops and water in the river, the reservoir and the well; too much rain floods the fields;
// too little dries them. Plain words, no people harmed, no numbers.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, skyTx, panel, skyRect, sky, SKY_INK, num, svgCloud, svgRain, svgSun, svgHills } from '../L03/AirDraw.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
const CHIPS = [{ id: 'good', label: 'Good monsoon', targets: ['good'], tone: 3 }, { id: 'much', label: 'Too much rain', targets: ['much'], tone: 1 }, { id: 'weak', label: 'Too little rain', targets: ['weak'], tone: 2 }];
const STATE = {
  good: { say: 'Enough food and water', river: 0.5, res: 0.72, well: 0.7 },
  much: { say: 'Rivers overflow: floods', river: 1, res: 1, well: 0.95 },
  weak: { say: 'Too little water: drought', river: 0.12, res: 0.14, well: 0.12 },
};

export class MonsoonImpactScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A village with fields, a river, a reservoir and a well. In a good monsoon crops grow and water is enough. With too much rain the river floods the fields. With too little rain the crops dry and water levels fall.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Kind of monsoon', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 430 : 410; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { if (this.tl?.mount) this.tl.set({ lit: step === 1 ? 'much' : 'good' }); }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, id = this.tl.chip()?.id ?? 'good', z = STATE[id], g = H * 0.56;
    let s = `<defs><clipPath id="miC"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs><g clip-path="url(#miC)">` + skyRect('miSky', 0, 0, W, H, 0, 7, { r: 18 });
    if (id === 'much') s += `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('cloudDark')};opacity:0.72"/>`;
    if (id === 'weak') s += `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('sand')};opacity:0.4"/>` + svgSun(W - 66, 66, 0.9, {});
    if (id === 'good') s += svgCloud(W * 0.82, 74, port ? 0.65 : 0.9, { seed: 3 }) + svgSun(W * (port ? 0.56 : 0.46), 56, 0.5, {});
    s += svgHills(0, g + 4, 1, { w: W, h: 74, seed: 4, far: true });
    const fieldCol = id === 'weak' ? sky('sand') : sky('grass');
    s += `<rect x="0" y="${g}" width="${W}" height="${H - g}" rx="0" style="fill:${fieldCol}"/>`;
    // a small village at the edge of the fields
    const hut = (hx, hy, k) => `<g transform="translate(${hx} ${hy}) scale(${k})"><rect x="-30" y="-36" width="60" height="38" style="fill:${sky('woodLit')};stroke:${SKY_INK};stroke-width:3"/><path d="M-42 -34L0 -72L42 -34Z" style="fill:${sky('soilDark')};stroke:${SKY_INK};stroke-width:3;stroke-linejoin:round"/><rect x="-8" y="-20" width="16" height="22" style="fill:${sky('woodDark')}"/><rect x="15" y="-26" width="10" height="10" style="fill:${sky('sea')}"/></g>`;
    const tree = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-4" y="-34" width="8" height="36" style="fill:${sky('wood')}"/><circle cy="-52" r="24" style="fill:${id === 'weak' ? sky('sandDark') : sky('grassDark')}"/><circle cx="-14" cy="-42" r="15" style="fill:${id === 'weak' ? sky('sandDark') : sky('grassDark')}"/><circle cx="13" cy="-42" r="16" style="fill:${id === 'weak' ? sky('soil') : sky('grassLit')}"/></g>`;
    s += tree(W * 0.05, g + 18, port ? 0.8 : 1) + hut(W * 0.08, g + 66, port ? 0.68 : 0.8) + hut(W * (port ? 0.21 : 0.19), g + 34, port ? 0.62 : 0.74);
    // crops, row by row
    const rows = 4, cols = port ? 8 : 13;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = W * 0.3 + c * (W * 0.62) / cols + (r % 2) * 8, y = g + 26 + r * 27;
      if (id === 'good') s += `<path d="M${num(x)} ${y}q-7 -16 -2 -28M${num(x)} ${y}q0 -18 4 -32M${num(x)} ${y}q8 -14 9 -24" style="fill:none;stroke:${sky('grassDark')};stroke-width:3.5;stroke-linecap:round"/>`;
      else if (id === 'weak') s += `<path d="M${num(x)} ${y}q3 -8 9 -9M${num(x)} ${y}q-3 -6 -8 -7" style="fill:none;stroke:${sky('soil')};stroke-width:3;stroke-linecap:round"/>`;
    }
    // river
    const ry = H - 62, rh = 10 + z.river * 34;
    s += `<rect x="0" y="${ry + 44 - rh}" width="${W}" height="${rh + 18}" style="fill:${sky('sea')}"/>`;
    if (id === 'much') {
      let d = `M${W * 0.2} ${g + 18}`;
      for (let x = W * 0.2; x < W; x += 34) d += `q17 -9 34 0`;
      s += `<path d="${d}V${H}H${W * 0.2}Z" style="fill:${sky('soil')};stroke:${sky('soilDark')};stroke-width:3"/>`;
      for (let i = 0; i < (port ? 8 : 14); i++) s += `<path d="M${num(W * 0.28 + i * W * 0.05)} ${g + 44 + (i % 3) * 30}q3 -9 8 -12" style="fill:none;stroke:${sky('grassDark')};stroke-width:3.5;stroke-linecap:round"/>`;
    }
    s += W > 0 ? tx(W * 0.09, H - 16, 'river', { size: 15, col: sky('cloud'), halo: sky('seaDeep') }) : '';
    // gauges: reservoir and well
    s += '</g>';
    const gauge = (x, y, w, h, v, name) => panel(x, y, w, h, { r: 10 })
      + `<rect x="${x + 6}" y="${num(y + 6 + (h - 12) * (1 - v))}" width="${w - 12}" height="${num((h - 12) * v)}" rx="5" style="fill:${sky('sea')}"/>` + tx(x + w / 2, y + h + 18, name, { size: 15, col: SKY_INK, halo: sky('cloud') });
    const gw = port ? 62 : 72, gh = 64;
    s += gauge(14, 14, gw, gh, z.res, 'reservoir') + gauge(14 + gw + (port ? 16 : 22), 14, gw, gh, z.well, 'well');
    const w = Math.min(W - 24, 300);
    s += panel((W - w) / 2, H - 48, w, 38, { r: 12 }) + tx(W / 2, H - 22, z.say, { size: 18, display: true, weight: 700 });
    if (id === 'much') s = s + svgRain(W * 0.66, 100, 1, { w: W * 0.56, h: g - 80, heavy: true }) + svgCloud(W * 0.62, 100, port ? 0.95 : 1.3, { seed: 3, kind: 'rain' }) + svgCloud(W * 0.86, 92, port ? 0.7 : 1, { seed: 6, kind: 'rain' });
    return { svg: s };
  }
}
