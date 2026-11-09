// ShorePlatformScene - a cliff in side view after the book's figure: headland, sea cliff, sea cave (a notch near high
// tide), high tide, shore platform, low tide. Years moves the cliff back and leaves a nearly flat platform at wave height.
// Stages: 0 the cliff moves back (Years); 1 the platform, tap to light; 2 the close, a town needs protection.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { svgRock, svgWater, svgGrass, svgBoulder } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, lerp, INK, WHITE } from '../L04/EarthBits.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 2, dwellMs: null }]];
const CHIPS = [
  { id: 'head', label: 'Headland', targets: ['head'], tone: 2 },
  { id: 'cliff', label: 'Sea cliff', targets: ['cliff'], tone: 3 },
  { id: 'cave', label: 'Sea cave', targets: ['cave'], tone: 4 },
  { id: 'high', label: 'High tide', targets: ['high'], tone: 5 },
  { id: 'plat', label: 'Shore platform', targets: ['plat'], tone: 1 },
  { id: 'low', label: 'Low tide', targets: ['low'], tone: 7 },
];

export class ShorePlatformScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP, 1: MAP1 };
  static WIDTH = 620;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 560;
  static ARIA_LABEL = 'A sea cliff in side view. Waves cut a notch at high tide, the rock above falls, and the cliff moves back. A flat shore platform is left between high tide and low tide.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Parts of the coast', chips: CHIPS, onChange: () => this.repaint() });
  css() { return BAR_CSS + '.sim-dom-root[data-step="0"] .tl-row, .sim-dom-root[data-step="2"] .tl-row { display: none; }'; }
  stageHeight(st) { return st.portrait ? 340 : 320; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }

  enter(stage) {
    this._stage = stage; this._y = stage === 0 ? 20 : 100; this._fresh = true; if (this.root) this.root.dataset.step = String(stage);
    this.bar(stage === 0 ? [{ id: 'y', label: 'Years', min: 0, max: 100, value: this._y }] : []);
    this.tl.set({ lit: null, disabled: stage !== 1 });
  }
  control(id, v) {
    this._y = v;
    if (v >= 100 && !this._cel) { this._cel = true; this.celebrate(); }
    this.repaint();
  }

  paint(st) {
    const W = st.W, H = st.H, s = this._stage, u = this._y / 100, top = H * .22, high = H * .56, low = H * .72, x0 = W * .86, x = lerp(x0, W * .32, u), L = (t) => !this.tl.any() || !this.tl.off(t);
    let b = svgCloud(W * .7, 42, .62, { seed: 5 });
    b += svgWater([[0, (high + low) / 2], [W + 10, (high + low) / 2], [W + 10, H + 10], [0, H + 10]], { t: 2, ripples: 6, deep: .5 });
    // platform: wave-cut, tilted a little seaward, from the cliff foot to the low-tide edge
    const edge = x0 + 8;
    b += svgRock([[x - 10, high + 6], [edge, low - 4], [W * .96, H * .92], [W + 10, H + 10], [-10, H + 10], [-10, high]], { seed: 4, fill: 'rockDark', cracks: 4, outline: true });
    b += svgRock([[-10, top + 10], [x - 80, top], [x - 22, top + 8], [x + 6, top + 56], [x + 10, high - 44], [x - 16, high - 20], [x - 22, high + 2], [x - 8, high + 12], [-10, high + 14]], { seed: 8, bands: ['rock', 'rockLit', 'rock', 'rockDark'], bandH: 30, dip: 2, cracks: 4, outline: true, lit: true });
    if (u > .02) for (let i = 0; i < 4; i++) b += svgBoulder(x + 22 + i * 26, lerp(high + 8, low - 4, (x + 22 + i * 26 - x) / (edge - x)), .42 - i * .05, { seed: i + 3 });
    b += svgGrass(0, top + 6, x - 30, top + 2, { seed: 3, n: 12, tall: 12 });
    b += strand([[0, high], [W, high]], WHITE, 2.5, { dash: '9 7', opacity: L('high') ? 1 : .25 }) + strand([[0, low], [W, low]], WHITE, 2.5, { dash: '4 7', opacity: L('low') ? 1 : .25 });
    if (s === 0 && u > 0) b += strand([[x0 + 10, top + 34], [x0 + 10, high + 10]], INK, 3, { dash: '8 7' });
    const pop = this._fresh ? { pop: true } : {};
    if (s === 0) { b += tag(Math.min(x0, W - 70), top - 36, u > 0 ? 'The cliff stood here' : 'Sea cliff', { ...pop, anchor: 'end' }); }
    if (s === 1) {
      const lit = this.tl.any() ? this.tl.lit()[0] : null, mx = (x + edge) / 2;
      const T = { head: [W * .16, top + 30, 'Headland'], cliff: [x + 84, top + 34, 'Sea cliff'], cave: [x + 84, high - 42, 'Sea cave'], high: [W - 56, high - 16, 'High tide'], plat: [W * .58, H * .88, 'Shore platform'], low: [W - 50, low + 16, 'Low tide'] };
      b += pointer(x + 50, top + 34, x + 4, top + 74, { dim: lit && lit !== 'cliff' }) + pointer(x + 50, high - 42, x - 12, high - 12, { dim: lit && lit !== 'cave' }) + pointer(W * .58, H * .85, mx, lerp(high + 8, low, .45), { dim: lit && lit !== 'plat' });
      for (const k of Object.keys(T)) { const [a, c, n] = T[k]; b += tag(a, c, n, { size: 14, dim: lit && lit !== k, on: lit === k, ...(this._fresh ? { pop: true } : {}) }); }
    }
    if (s === 2) {
      for (const [dx, dy] of [[30, 0], [70, -6], [112, 2]]) b += `<g transform="translate(${dx} ${top + 6 + dy})"><rect x="-13" y="-20" width="26" height="22" style="fill:${ec('sandLit')};stroke:${INK};stroke-width:2.2"/><path d="M-17 -20L0 -34L17 -20Z" style="fill:${ec('bark')};stroke:${INK};stroke-width:2.2"/></g>`;
      b += `<path d="M${x - 8} ${high - 42}l14 2v46l-22 2z" style="fill:${ec('slate')};stroke:${INK};stroke-width:2.5"/>`;
      b += tag(W * .3, top - 36, 'Settlement', pop) + pointer(W * .78, H * .42, x + 4, high - 22, {}) + tag(W * .76, H * .38, 'Coastal protection', { ...pop, delay: .1 });
    }
    this._fresh = false;
    return { svg: world(st, 'sp', b) };
  }
}
