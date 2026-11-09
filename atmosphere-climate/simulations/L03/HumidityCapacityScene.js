// HumidityCapacityScene - blk-l03-s04. No face on any of it.
//   0 water leaves a pond as vapour into the air above
//   1 two boxes of air, cool and warm: seats for vapour, Add vapour fills both; the cool box is
//     full first. Seat counts 12 and 36 keep the real ratio for 15 and 35 C (about 13 and 40 g per
//     cubic metre). No numbers on screen beyond the temperatures.
//   2 Jodhpur or Chennai in May: 33.3 and 33.0 C from Table 3.3, the same heat with different air
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, skyRect, sky, SKY_INK, MUTED, btn, bindActs, num, svgSea, svgLand, svgSun, svgCloud } from './AirDraw.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const SEATS = { cool: 12, warm: 36 };
const VAP = 'var(--sim-series-1)';

function seatGrid(x, y, w, h, n) {
  const rows = Math.max(1, Math.round(Math.sqrt(n * (h / w)))), cols = Math.ceil(n / rows), out = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    out.push([x + (c + 0.5) * w / cols, y + h - (r + 0.5) * h / rows]);
  }
  return out;
}
function kurta(x, y, s, col, wet) {
  let o = `<path d="M${x - 16 * s} ${y}L${x + 16 * s} ${y}L${x + 30 * s} ${y + 14 * s}L${x + 21 * s} ${y + 23 * s}L${x + 15 * s} ${y + 17 * s}L${x + 17 * s} ${y + 64 * s}L${x - 17 * s} ${y + 64 * s}L${x - 15 * s} ${y + 17 * s}L${x - 21 * s} ${y + 23 * s}L${x - 30 * s} ${y + 14 * s}Z" style="fill:${col};stroke:${SKY_INK};stroke-width:2.5;stroke-linejoin:round"/>`;
  if (wet) for (let i = 0; i < 4; i++) o += `<path d="M${x - 12 * s + i * 8 * s} ${y + 72 * s + (i % 2) * 7}q3 6 0 9q-3 -3 0 -9Z" style="fill:${sky('rain')};stroke:${SKY_INK};stroke-width:1"/>`;
  return o;
}

export class HumidityCapacityScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Water evaporates into the air as vapour. A warm box of air can hold more vapour than a cool one before it is full. Jodhpur and Chennai in May are equally hot, but Chennai has far more vapour, so clothes dry slowly.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Town', chips: [{ id: 'jodhpur', label: 'Jodhpur', targets: ['jodhpur'], tone: 2 }, { id: 'chennai', label: 'Chennai', targets: ['chennai'], tone: 1 }], onChange: () => { if (this.stepIndex === 2) this.repaint(); } });
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 8px; }'; }
  stageHeight(st) { return st.portrait ? 460 : 420; }
  async setup() {
    this._n = 0;
    await super.setup();
    this.tl.mount(this.root, this);
    this._off = bindActs(this, (a) => this._onAct(a));
    this.enter(this.stepIndex);
  }
  destroy() { this._off?.(); this.tl.destroy(); super.destroy(); }
  enter(step) {
    this._n = 0;
    if (!this.tl) return;
    this.tl.set({ chips: [{ id: 'jodhpur', label: 'Jodhpur', targets: ['jodhpur'], tone: 2 }, { id: 'chennai', label: 'Chennai', targets: ['chennai'], tone: 1 }], lit: step === 2 ? 'jodhpur' : null, disabled: step !== 2 });
    const row = this.root.querySelector?.('.tl-row');
    if (row) row.hidden = step !== 2;
  }
  _onAct(a) {
    if (a === 'add') {
      const before = this._n;
      this._n = this._n >= SEATS.warm ? 0 : Math.min(SEATS.warm, this._n + 6);
      if (this.stepIndex === 1 && before < SEATS.warm && this._n >= SEATS.warm && !this._found) { this._found = true; this.celebrate(); }
    }
  }
  paint(st) {
    const s = this.stepIndex;
    return s === 0 ? this._pond(st) : s === 1 ? this._boxes(st) : this._line(st);
  }
  _pond(st) {
    const W = st.W, H = st.H, g = H - 110;
    let s = skyRect('hmSky', 0, 0, W, H, 0, 7, { r: 18 }) + svgSun(W - 66, 62, 0.85, {});
    s += svgLand(0, g, 1, { w: W * 0.4, h: H - g, kind: 'field', seed: 2 });
    s += svgSea(W * 0.32, g + 10, 1, { w: W * 0.68, h: H - g - 10, t: 0 });
    const pts = [[0.2, 0.56], [0.36, 0.44], [0.5, 0.62], [0.62, 0.36], [0.72, 0.56], [0.82, 0.42], [0.44, 0.26], [0.6, 0.18], [0.26, 0.3], [0.9, 0.24]];
    pts.forEach(([x, y], i) => { s += `<circle class="air-in" cx="${W * x}" cy="${g * y + 40}" r="7" style="fill:${VAP};stroke:${sky('cloud')};stroke-width:2;--d:${(i * 0.07).toFixed(2)}s"/>`; });
    for (const [u, h] of [[0.5, 120], [0.62, 96], [0.74, 132], [0.86, 90], [0.16, 88], [0.28, 72]]) {
      const x = W * u, y = g + 6, k = h / 4;
      s += `<path class="air-flow" d="M${x} ${y}c-14 ${-k * 0.5} 14 ${-k * 0.5} 0 ${-k}s14 ${-k * 0.5} 0 ${-k}s14 ${-k * 0.5} 0 ${-k}s14 ${-k * 0.5} 0 ${-k}" style="stroke:${VAP};stroke-width:5;fill:none;stroke-linecap:round;opacity:0.72"/>`;
    }
    { const w = 250; s += panel((W - w) / 2 - 40, 14, w, 62, { r: 12 }) + tx(W / 2 - 40, 39, 'water vapour', { size: 19, display: true, weight: 700 }) + tx(W / 2 - 40, 62, 'a gas: you cannot see it', { size: 15, col: MUTED, weight: 700 }); }
    s += tx(W * 0.68, H - 22, 'pond or sea', { size: 15, col: sky('cloud') }) + tx(W * 0.16, H - 22, 'wet land', { size: 15, col: sky('cloud') });
    s += tx(W - 10, H - 6, '', { size: 13 });
    return { svg: s };
  }
  _boxes(st) {
    const W = st.W, H = st.H, port = st.portrait;
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:color-mix(in oklab, var(--sim-bg-surface) 70%, var(--sim-series-1))"/>`;
    const gap = 16, bw = (W - 3 * gap) / 2, top = 74, bot = H - 86, n = this._n;
    const box = (x, id, label, tcol) => {
      const full = SEATS[id], fillN = Math.min(n, full), over = n > full;
      const hh = id === 'cool' ? (bot - top) * 0.42 : bot - top, y = bot - hh;
      let o = tx(x + bw / 2, 28, label, { size: 26, display: true, weight: 700, col: tcol });
      o += tx(x + bw / 2, 52, id === 'cool' ? 'cool air' : 'warm air', { size: 15, weight: 700 });
      o += `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="12" style="fill:color-mix(in oklab, var(--sim-bg-surface) 90%, ${tcol});stroke:${tcol};stroke-width:3.5"/>`;
      seatGrid(x + 6, y + 4, bw - 12, hh - 8, full).forEach((p, i) => {
        const r = port ? 7.5 : 9;
        s += '';
        o += `<circle cx="${num(p[0])}" cy="${num(p[1])}" r="${r}" style="fill:${i < fillN ? VAP : 'none'};stroke:${i < fillN ? SKY_INK : 'var(--sim-stroke)'};stroke-width:${i < fillN ? 1.5 : 1};opacity:${i < fillN ? 1 : 0.4}"/>`;
      });
      const isFull = n >= full;
      o += tx(x + bw / 2, bot + 24, isFull ? (over ? 'Full: extra turns to drops' : 'Full') : `Room for ${full - n} more`, { size: 15, col: isFull ? 'var(--sim-error)' : 'var(--sim-label)' });
      return o;
    };
    s += box(gap, 'cool', '15 \u00b0C', 'var(--sim-series-1)') + box(2 * gap + bw, 'warm', '35 \u00b0C', 'var(--sim-series-2)');
    const label = n >= SEATS.warm ? 'Start again' : 'Add water vapour';
    return { svg: s, over: btn(W / 2, H - 28, label, 'add') };
  }
  _line(st) {
    const W = st.W, H = st.H, port = st.portrait, town = this.tl.chip()?.id === 'chennai' ? 'chennai' : 'jodhpur', ch = town === 'chennai';
    let s = skyRect('hmSky2', 0, 0, W, H, 0, 7, { r: 18 }) + svgSun(W - 56, 52, 0.7, {});
    if (ch) s += svgCloud(W * 0.3, 70, 0.9, { seed: 3 }) + `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('hazeLow')};opacity:0.35"/>`;
    const g = H - 54;
    s += svgLand(0, g, 1, { w: W, h: 54, kind: ch ? 'town' : 'sand', seed: 5 });
    s += panel(12, 12, port ? 150 : 170, 74) + tx(port ? 87 : 97, 34, ch ? 'Chennai in May' : 'Jodhpur in May', { size: 15 }) + tx(port ? 87 : 97, 72, ch ? '33.0 \u00b0C' : '33.3 \u00b0C', { size: 30, display: true, weight: 700 });
    // the air sample
    const bx = port ? 12 : 12, by = 102, bw = port ? 150 : 170, bh = g - by - 18, tot = 24, have = ch ? 21 : 7;
    s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" style="fill:color-mix(in oklab, var(--sim-bg-surface) 88%, ${VAP});stroke:${VAP};stroke-width:3"/>`;
    seatGrid(bx + 6, by + 4, bw - 12, bh - 8, tot).forEach((p, i) => { s += `<circle cx="${num(p[0])}" cy="${num(p[1])}" r="7.5" style="fill:${i < have ? VAP : 'none'};stroke:${i < have ? SKY_INK : 'var(--sim-stroke)'};stroke-width:${i < have ? 1.5 : 1};opacity:${i < have ? 1 : 0.4}"/>`; });
    s += tx(bx + bw / 2, by + bh + 16, ch ? 'air nearly full' : 'air has lots of room', { size: 15, col: SKY_INK, halo: sky('cloud') });
    // washing line
    const lx0 = bx + bw + 24, lx1 = W - 22, ly = 112;
    s += `<path d="M${lx0} ${g}V${ly - 16}M${lx1} ${g}V${ly - 16}" style="stroke:${sky('woodDark')};stroke-width:8;stroke-linecap:round"/>`;
    s += `<path d="M${lx0} ${ly - 10}Q${(lx0 + lx1) / 2} ${ly + 8} ${lx1} ${ly - 10}" style="fill:none;stroke:${SKY_INK};stroke-width:3"/>`;
    const n = port ? 2 : 3;
    for (let i = 0; i < n; i++) s += kurta(lx0 + (i + 0.5) * (lx1 - lx0) / n, ly, port ? 0.92 : 1.05, ['var(--sim-series-4)', 'var(--sim-series-6)', 'var(--sim-series-3)'][i], ch);
    s += panel(lx0 - 8, g - 66, lx1 - lx0 + 16, 58, { r: 12 }) + tx((lx0 + lx1) / 2, g - 44, 'Washing and sweat', { size: 14, col: MUTED, weight: 700 }) + tx((lx0 + lx1) / 2, g - 20, ch ? 'dry slowly' : 'dry quickly', { size: 21, display: true, weight: 700 });
    return { svg: s };
  }
}
