// BeaufortScaleScene - blk-l04-s06. Table 3.1 only. One roadside: a tree, a chai stall umbrella, a
// wisp of smoke, a wind vane, all reading one speed. Beat 1: the four bands on a line, gaps open.
// Beat 2: a compass; the name says where the wind comes from.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, skyTx, panel, skyRect, sky, SKY_INK, MUTED, windArrow, num, svgLand, svgHills, svgCloud } from '../L03/AirDraw.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
const BANDS = [
  { id: 'calm', label: 'Calm', sp: '0-1 km/hr', a: 0, b: 1, t: 'Smoke rises vertically.', lean: 0 },
  { id: 'light', label: 'Light breeze', sp: '6-11 km/hr', a: 6, b: 11, t: 'Leaves rustle. A vane moves.', lean: 0.1 },
  { id: 'strong', label: 'Strong breeze', sp: '39-49 km/hr', a: 39, b: 49, t: 'Large branches sway. Umbrellas are hard to use.', lean: 0.45 },
  { id: 'storm', label: 'Storm', sp: '103-117 km/hr', a: 103, b: 117, t: 'Very rare. Widespread damage.', lean: 1 },
];
const WINDS = [
  { id: 'w', label: 'Westerly', from: 'west', ang: 180 }, { id: 'e', label: 'Easterly', from: 'east', ang: 0 },
  { id: 'n', label: 'Northerly', from: 'north', ang: -90 }, { id: 's', label: 'Southerly', from: 'south', ang: 90 },
];
const BCH = BANDS.map((b, i) => ({ id: b.id, label: b.label, targets: [b.id], tone: i + 1 }));
const WCH = WINDS.map((b, i) => ({ id: b.id, label: b.label, targets: [b.id], tone: i + 1 }));

export class BeaufortScaleScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A roadside with a tree, an umbrella and smoke, changing with four speeds of wind. Then the speeds on a line, and a compass showing a wind is named for where it blows from.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Choose', chips: BCH, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return this.stepIndex === 1 ? 300 : st.portrait ? 440 : 410; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set({ chips: step === 2 ? WCH : BCH, lit: step === 2 ? 'w' : step === 0 ? 'calm' : null, disabled: step === 1 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step === 1;
  }
  paint(st) { return [this._road, this._line, this._compass][this.stepIndex].call(this, st); }

  _tree(x, g, k, lean) {
    const bend = lean * 58 * k, top = g - 170 * k;
    const trunk = `<path d="M${x - 14 * k} ${g}Q${x - 6 * k + bend * 0.2} ${g - 90 * k} ${x + bend - 6} ${top}L${x + bend + 8} ${top}Q${x + 12 * k + bend * 0.2} ${g - 90 * k} ${x + 18 * k} ${g}Z" style="fill:${sky('wood')};stroke:${sky('woodDark')};stroke-width:3;stroke-linejoin:round"/>`;
    const blob = (dx, dy, r) => `<circle cx="${num(x + bend * 1.25 + dx * k)}" cy="${num(top + dy * k)}" r="${r * k}" style="fill:${sky('grass')};stroke:${sky('grassDark')};stroke-width:3"/>`;
    let s = trunk + blob(-46, 2, 42) + blob(46, 0, 42) + blob(0, -32, 52) + blob(0, 22, 46);
    return s;
  }
  _umbrella(x, g, k, lean) {
    const inv = lean >= 1, a = lean * 26;
    const canopy = inv
      ? `<path d="M${-58 * k} ${-112 * k}Q0 ${-92 * k} ${58 * k} ${-120 * k}L0 ${-74 * k}Z" style="fill:var(--sim-series-4);stroke:${SKY_INK};stroke-width:3;stroke-linejoin:round"/>`
      : `<path d="M${-62 * k} ${-92 * k}Q0 ${-146 * k} ${62 * k} ${-92 * k}Q${40 * k} ${-100 * k} ${20 * k} ${-92 * k}Q0 ${-100 * k} ${-20 * k} ${-92 * k}Q${-40 * k} ${-100 * k} ${-62 * k} ${-92 * k}Z" style="fill:var(--sim-series-4);stroke:${SKY_INK};stroke-width:3;stroke-linejoin:round"/>`;
    return `<g transform="translate(${x} ${g}) rotate(${a})"><path d="M0 0V${-124 * k}" style="stroke:${sky('metalDark')};stroke-width:5;stroke-linecap:round"/>${canopy}</g>`
      + `<rect x="${x - 34 * k}" y="${g - 34 * k}" width="${68 * k}" height="${34 * k}" rx="4" style="fill:${sky('woodLit')};stroke:${sky('woodDark')};stroke-width:3"/>`;
  }
  _smoke(x, g, lean) {
    const y0 = g - 44, dx = lean * 150;
    const d = `M${x} ${y0}C${x + 4} ${y0 - 40} ${x + dx * 0.4 - 4} ${y0 - 70} ${x + dx * 0.7} ${y0 - 100 + lean * 58}S${x + dx * 1.1} ${y0 - 120 + lean * 80} ${x + dx * 1.3 + 2} ${y0 - 160 + lean * 118}`;
    return `<path d="${d}" style="fill:none;stroke:${sky('cloudDark')};stroke-width:12;stroke-linecap:round;opacity:0.75"/>`
      + `<path d="M${x - 16} ${g}V${y0 + 6}H${x + 16}V${g}Z" style="fill:${sky('soilDark')};stroke:${SKY_INK};stroke-width:3"/>`;
  }
  _road(st) {
    const W = st.W, H = st.H, port = st.portrait, g = H - 44, b = BANDS.find((x) => x.id === this.tl.chip()?.id) ?? BANDS[0], lean = b.lean;
    let s = skyRect('bfSky', 0, 0, W, H, 0, 7, { r: 18 });
    if (b.id === 'storm') s += `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('cloudDark')};opacity:0.7"/>`;
    s += svgCloud(W * 0.72 + lean * 50, 66, 0.8, { seed: 4, kind: b.id === 'storm' ? 'rain' : 'puff' });
    s += svgHills(0, g + 2, 1, { w: W, h: 64, seed: 3, far: true });
    s += svgLand(0, g, 1, { w: W, h: H - g, kind: 'plain', seed: 6 });
    const k = port ? 0.92 : 1.15;
    s += this._tree(W * (port ? 0.3 : 0.27), g, k, lean);
    s += this._umbrella(W * (port ? 0.68 : 0.58), g, port ? 0.8 : 1, lean);
    s += this._smoke(W * (port ? 0.9 : 0.82), g, lean);
    if (lean > 0) {
      const n = lean >= 1 ? 4 : lean > 0.3 ? 3 : 1;
      for (let i = 0; i < n; i++) s += windArrow([[8 + i * 40, 150 + i * 62 - i * i * 7], [8 + i * 40 + 60 + lean * 30, 150 + i * 62 - i * i * 7]], { w: 4 + lean * 4, col: sky('cloud'), flow: true });
    }
    if (lean >= 0.45) for (let i = 0; i < (lean >= 1 ? 12 : 6); i++) s += `<ellipse cx="${W * 0.34 + i * 37}" cy="${110 + ((i * 53) % 150)}" rx="7" ry="3.5" transform="rotate(${i * 40} ${W * 0.34 + i * 37} ${110 + ((i * 53) % 150)})" style="fill:${sky('grassDark')}"/>`;
    const w = Math.min(W - 24, 292);
    s += panel(12, 10, w, 84) + tx(12 + w / 2, 42, b.sp, { size: 27, display: true, weight: 700 }) + tx(12 + w / 2, 66 + (b.t.length > 34 ? -2 : 4), b.t.length > 34 ? 'Large branches sway.' : b.t, { size: 15, weight: 700 });
    if (b.t.length > 34) s += tx(12 + w / 2, 83, 'Umbrellas are hard to use.', { size: 15, weight: 700 });
    return { svg: s };
  }
  _line(st) {
    const W = st.W, H = st.H, x0 = 22, x1 = W - 22, y = 112, sc = (v) => x0 + (x1 - x0) * v / 120;
    let s = skyRect('bfSky2', 0, 0, W, H, 0, 7, { r: 18 });
    s += panel(10, 10, W - 20, H - 24);
    s += tx(W / 2, 38, 'Wind speed, km/hr', { size: 18 });
    s += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="34" rx="8" style="fill:var(--sim-track);stroke:var(--sim-stroke);stroke-width:2.5"/>`;
    BANDS.forEach((b, i) => {
      const a = sc(b.a), c = sc(b.b);
      s += `<rect class="air-in" x="${a}" y="${y}" width="${Math.max(9, c - a)}" height="34" rx="4" style="fill:var(--sim-series-${i + 1});stroke:var(--sim-stroke);stroke-width:2;--d:${i * 0.12}s"/>`;
      const up = i % 2 === 0, m = (a + Math.max(9, c - a) / 2), tw = b.label.length * 4.4;
      const lx = Math.max(x0 + tw, Math.min(x1 - tw, m));
      s += tx(lx, up ? y - 34 : y + 62, b.label, { size: 15 }) + tx(lx, up ? y - 14 : y + 82, b.sp.replace(' km/hr', ''), { size: 15, weight: 700, col: MUTED });
    });
    const gap = (a, b) => tx((sc(a) + sc(b)) / 2, y + 24, '?', { size: 22, display: true, weight: 700 });
    s += gap(11, 39) + gap(49, 103);
    s += tx(W / 2, H - 42, 'What fills the gaps?', { size: 18, display: true, weight: 700 });
    return { svg: s };
  }
  _compass(st) {
    const W = st.W, H = st.H, cx = W / 2, cy = H / 2 + 4, R = st.portrait ? 132 : 138, w = WINDS.find((x) => x.id === this.tl.chip()?.id) ?? WINDS[0];
    let s = skyRect('bfSky3', 0, 0, W, H, 0, 7, { r: 18 });
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:4"/>`;
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; s += `<path d="M${num(cx + Math.cos(a) * (R - 10))} ${num(cy + Math.sin(a) * (R - 10))}L${num(cx + Math.cos(a) * (R - 2))} ${num(cy + Math.sin(a) * (R - 2))}" style="stroke:var(--sim-stroke);stroke-width:3"/>`; }
    const lab = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
    for (const [t, [a, b]] of Object.entries(lab)) s += tx(cx + a * (R - 28), cy + b * (R - 28) + 8, t, { size: 24, display: true, weight: 700 });
    const r = w.ang * Math.PI / 180, fx = cx + Math.cos(r) * (R - 52), fy = cy + Math.sin(r) * (R - 52);
    s += `<g class="air-in">` + windArrow([[fx, fy], [cx - Math.cos(r) * (R - 52), cy - Math.sin(r) * (R - 52)]], { w: 16, col: 'var(--sim-series-5)', rim: SKY_INK, flow: true }) + '</g>';
    s += skyTx(cx, 28, `${w.label}: from the ${w.from}`, { size: 20 });
    return { svg: s };
  }
}
