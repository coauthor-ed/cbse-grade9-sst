// FishingGroundScene - a section of the sea where a warm and a cold current come together. A drawn model:
// the slider brings the two waters together; where they meet, nutrients from the deep are lifted, plankton
// grow and fish gather. No counts: the size of the crowd is a picture, not a reading.
//   0 slider, starts apart   1 together, each link named   2 together, same meeting off Japan
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, rangeInput, bindRange, windArrow, btn, bindActs } from './SeaDraw.js';
import { svgFish, svgTrawler, svgSeaColumn, svgSandBed, svgWaveLine, svgCloud } from '../shared/SeaArt.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PAIRS = { 0: ['Gulf Stream', 'Labrador Current'], 1: ['Gulf Stream', 'Labrador Current'], 2: ['Kuroshio', 'Oyashio'] };
const rnd = (n) => { const x = Math.sin(n * 57.3) * 24634.6; return x - Math.floor(x); };

export class FishingGroundScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A section of the sea. A warm current on the left and a cold current on the right move together. Where they meet, nutrients rise from the deep, plankton grow and fish gather.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 470 : 430; }
  async setup() {
    this._m = 0.15; this._seen = false;
    await super.setup();
    this._off = bindRange(this, (id, v) => {
      this._m = v / 100;
      if (this._m >= 0.85 && !this._seen) { this._seen = true; this.celebrate(this._mid, 150); }
    });
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  enter(step) { this._m = step === 0 ? 0.15 : 1; }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, m = this._m;
    const sea = 74, ctrl = port ? 74 : 62, bed = H - ctrl - 22, mid = W / 2, gap = (1 - m) * W * 0.34;
    this._mid = mid;
    const lx = mid - gap / 2, rx = mid + gap / 2, meet = Math.max(0, (m - 0.55) / 0.45);
    const warm = `color-mix(in oklab, ${sky('sea')} 84%, ${sky('sun')})`, cold = sky('seaDeep'), plain = sky('seaMid');
    let s = `<rect width="${W}" height="${sea + 6}" rx="18" style="fill:${sky('sky')}"/>` + svgCloud(W * 0.8, 34, 0.5, { seed: 3 });
    s += `<rect x="0" y="${sea}" width="${W}" height="${bed - sea}" style="fill:${plain}"/>`;
    const wedge = (x0, x1, col, flip) => `<path d="M${x0} ${sea}L${x1} ${sea}Q${x1 + (flip ? 34 : -34)} ${(sea + bed) / 2} ${x1} ${bed - 44}L${x0} ${bed - 44}Z" style="fill:${col}"/>`;
    s += wedge(0, lx, warm, false) + wedge(W, rx, cold, true);
    // deep water with its nutrients
    s += `<rect x="0" y="${bed - 44}" width="${W}" height="66" style="fill:${sky('band5')}"/>`;
    let dots = '';
    for (let i = 0; i < 44; i++) {
      const hx = rnd(i) * W, hy = bed - 4 - rnd(i + 90) * 36, k = i % 3 === 0 ? 1 : 0;
      const tx0 = mid + (rnd(i + 30) - 0.5) * 90, ty0 = sea + 26 + rnd(i + 60) * (bed - sea - 90);
      const x = hx + (tx0 - hx) * meet * k, y = hy + (ty0 - hy) * meet * k;
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:1"/>`;
    }
    s += dots;
    // plankton, a green haze near the top of the meeting place
    if (meet > 0.25) {
      let pl = '';
      for (let i = 0; i < 40; i++) {
        const x = mid + (rnd(i + 200) - 0.5) * (port ? 230 : 300), y = sea + 12 + rnd(i + 240) * 64;
        pl += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.5 + rnd(i) * 3).toFixed(1)}" style="fill:${sky('grassLit')};opacity:${Math.min(1, meet * 1.3).toFixed(2)}"/>`;
      }
      s += pl;
    }
    // fish come last
    const nf = Math.round(Math.max(0, meet - 0.4) / 0.6 * 12);
    for (let i = 0; i < nf; i++) {
      const x = mid + ((i % 4) - 1.5) * (port ? 62 : 86) + (rnd(i) - 0.5) * 22, y = sea + 128 + (i % 3) * 42 + rnd(i + 3) * 14;
      s += svgFish(x, y, 0.72, { kind: i % 3, flip: i % 2 === 0 });
    }
    s += svgWaveLine(0, sea, 1, { w: W, amp: 4, len: 70, t: 2 });
    s += `<path d="M0 ${bed + 6}Q${W / 3} ${bed - 6} ${W / 2} ${bed + 4}T${W} ${bed}V${H - ctrl + 4}H0Z" style="fill:${sky('sand')};stroke:${sky('sandDark')};stroke-width:3"/>`;
    if (meet > 0.7) s += svgTrawler(mid + (port ? 86 : 120), sea + 2, port ? 0.55 : 0.68, {});
    // the two arrows and names
    const ay = sea + 46;
    s += windArrow([[Math.max(10, lx - 124), ay], [Math.max(62, lx - 12), ay]], { w: 10, col: sky('red'), rim: sky('cloud') });
    s += windArrow([[Math.min(W - 10, rx + 124), ay], [Math.min(W - 62, rx + 12), ay]], { w: 10, col: sky('hullDark'), rim: sky('cloud') });
    const [wn, cn] = PAIRS[step];
    s += tx(12, sea + 24, `warm: ${wn}`, { size: 15, anchor: 'start', col: sky('ink'), halo: sky('cloud') });
    s += tx(W - 12, sea + 24, `cold: ${cn}`, { size: 15, anchor: 'end', col: sky('cloud'), halo: sky('hullDark') });
    if (step >= 1 && meet > 0.9) {
      s += tx(mid, sea + 106, 'plankton', { size: 16, col: sky('ink'), halo: sky('cloud') }) + tx(mid - (port ? 110 : 170), sea + 106, 'fish', { size: 16, col: sky('ink'), halo: sky('cloud') });
      s += tx(mid, bed - 22, 'nutrients come up from the deep', { size: 15, col: sky('cloud'), halo: sky('hullDark') });
    } else if (meet < 0.3) {
      s += tx(mid, bed - 22, 'nutrients stay in the deep', { size: 15, col: sky('cloud'), halo: sky('hullDark') });
    }
    let over = '';
    const py = H - ctrl;
    s += panel(8, py + 4, W - 16, ctrl - 12, { r: 12 });
    if (step === 0) {
      s += tx(24, py + (port ? 24 : 34), 'apart', { size: 15, anchor: 'start', col: 'var(--sim-label-muted)' }) + tx(W - 24, py + (port ? 24 : 34), 'meeting', { size: 15, anchor: 'end', col: 'var(--sim-label-muted)' });
      over += rangeInput(W / 2, port ? py + 44 : py + 28, port ? W - 48 : W - 190, 'meet', Math.round(m * 100), 0, 100, 5, 'Bring the two currents together');
    } else {
      s += tx(W / 2, py + (ctrl - 4) / 2 + 6, step === 1 ? 'A drawing of how the waters mix' : 'Off Japan: cold Oyashio meets warm Kuroshio', { size: 15 });
    }
    return { svg: s, over };
  }
}
