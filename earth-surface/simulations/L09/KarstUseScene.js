// KarstUseScene - one limestone hill holding all the landforms. blk-l09-s06, 4 beats; blk-l09-s09, 2 beats.
// 0 tap a name. 1 fresh water, and why it needs testing. 2 visitors and geologists. 3 places of meaning.
// 4 look around you: agents and what they leave. 5 a model: rock taken away, rock put down.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { LAND_CSS, art, world, tag, lead, arrow, n1, INK } from '../L08/LandDraw.js';
import { hill, hillTop, passage, routeWater, routePts, stalactite, stalagmite } from './KarstDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2), S(3)];
const CHIPS = ['Sinkhole', 'Cave', 'Stalactite', 'Underground river', 'Cave mouth'].map((n, i) => ({ id: n, label: n, targets: [n], tone: i + 1 }));
const CLUES = [['A valley or a bank', 'Running water'], ['Loose sand or dust', 'Wind'], ['A hollow where water vanishes', 'Underground water']];

export class KarstUseScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 4: MAP, 2: [S(4), S(5)] };
  static ARIA_LABEL = 'One limestone hill cut open, with a sinkhole on top, a cave with stalactites and stalagmites inside, an underground river, and a cave mouth at the foot. Labels show what people use it for: fresh water that should be tested, tourism, study, and cultural or religious meaning.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Landforms', chips: CHIPS, onChange: () => this.repaint() });
  css() { return LAND_CSS; }
  stageHeight(st) { return this.stepIndex === 0 ? (st.portrait ? 380 : 340) : 430; }
  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl) return;
    this.tl.set({ lit: null });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step !== 0;
  }
  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex;
    if (step === 4) return { svg: this._clues(W, H) };
    const o = (t) => (step === 0 && this.tl.off(t) ? 'opacity:0.2' : '');
    let s = hill(W, H) + passage(W, H) + routeWater(W, H, 0.42, 1);
    const cy = H * 0.6, top = cy - H * 0.08, flo = cy + H * 0.07, cx = W * 0.46;
    s += `<g style="${o('Stalactite')}">${stalactite(cx - W * 0.07, top, H * 0.07, 9)}${stalactite(cx + W * 0.04, top, H * 0.055, 8)}${stalagmite(cx - W * 0.07, flo, H * 0.04, 10)}${stalagmite(cx + W * 0.04, flo, H * 0.03, 9)}</g>`;
    const [mx, my] = routePts(W, H).at(-1);
    s += `<path d="M${n1(mx)} ${n1(my)}L${W + 8} ${n1(my + 6)}" style="fill:none;stroke:${art('sea')};stroke-width:9;stroke-linecap:round"/>`;
    if (step === 0) {
      const lit = this.tl.any() ? this.tl.lit() : CHIPS.map((c) => c.id);
      if (lit.includes('Sinkhole')) s += lead(W * 0.28, 44, W * 0.28, hillTop(W * 0.28, W, H) - 6) + tag(W * 0.28, 30, 'Sinkhole', { size: 15 });
      if (lit.includes('Cave')) s += lead(W * 0.56, H * 0.4, cx + W * 0.02, top + 6) + tag(W * 0.56, H * 0.37, 'Cave', { size: 15 });
      if (lit.includes('Stalactite')) s += lead(W * 0.3, H * 0.79, cx - W * 0.07, flo - 4) + tag(W * 0.34, H * 0.82, 'Stalactites and stalagmites', { size: 14 });
      if (lit.includes('Underground river')) s += lead(W * 0.5, H * 0.9, W * 0.7, H * 0.74) + tag(W * 0.44, H * 0.93, 'Underground river', { size: 15 });
      if (lit.includes('Cave mouth')) s += lead(W * 0.8, H * 0.66, mx, my - 10) + tag(W * 0.8, H * 0.62, 'Cave mouth', { size: 14 });
    }
    if (step === 1) {
      s += arrow(W * 0.28, 62, W * 0.28, hillTop(W * 0.28, W, H) - 4, { w: 7 }) + tag(W * 0.42, 34, 'Dirt from the surface washes in', { size: 14 });
      s += tag(W * 0.5, H * 0.92, 'Test spring water before drinking', { size: 14 }) + lead(W * 0.74, H * 0.88, mx, my + 6);
    }
    if (step === 2) s += tag(W * 0.36, H * 0.92, 'Tourists and adventurers', { size: 14 }) + lead(W * 0.46, H * 0.88, cx, flo) + tag(W * 0.56, 34, 'Geologists study the forms', { size: 14 }) + lead(W * 0.46, 50, cx - W * 0.03, top + 8);
    if (step === 3) s += tag(W * 0.52, H * 0.92, 'Cultural or religious meaning', { size: 14 }) + lead(cx, H * 0.88, cx, flo);
    if (step === 5) s += tag(W * 0.4, H * 0.9, 'Rock put down: drips', { size: 14 }) + lead(W * 0.42, H * 0.86, cx - W * 0.07, flo - 2) + tag(W * 0.52, 34, 'Rock taken away: spaces', { size: 14 }) + lead(W * 0.5, 50, W * 0.52, top);
    return { svg: world('ku', W, H, s) };
  }
  _clues(W, H) {
    const h = (H - 40) / 3;
    let s = '';
    CLUES.forEach(([a, b], i) => {
      const y = i * (h + 12) + 8, cy = y + h / 2;
      s += `<rect x="4" y="${n1(y)}" width="${W - 8}" height="${n1(h)}" rx="16" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:2.5"/>`;
      s += tag(W / 2, cy - 22, a, { size: 15, col: art('sandLit') }) + arrow(W / 2, cy - 8, W / 2, cy + 10, { w: 6, col: INK }) + tag(W / 2, cy + 32, b, { size: 16, col: art('seaFar') });
    });
    return s;
  }
}
