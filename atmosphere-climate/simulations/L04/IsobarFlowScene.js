// IsobarFlowScene - blk-l04-s04b setup and blk-l04-s05. Fig 3.7 redrawn as a weather chart. Book's
// numbers: H 1012, 1008, 1004; 1000 between; L 996, 992, 988, 984. North of the equator wind leaves
// a high clockwise and enters a low anticlockwise, crossing the isobars at a slant.
//   step 0 setup: isobars and numbers, no arrows
//   step 1 one big arrow from H to L
//   step 2 the isobars lit with numbers stepping down
//   step 3 arrows spiralling; chip turns rotation off, and they go straight
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, panel, sky, SKY_INK, windArrow } from '../L03/AirDraw.js';

const SETUP = [[{ idx: 0, dwellMs: null }]];
const MAP = [1, 2, 3].map((i) => [{ idx: i, dwellMs: null }]);
const HR = [[1012, 40], [1008, 66], [1004, 94]];
const LR = [[984, 42], [988, 62], [992, 82], [996, 102]];
const SLANT = 34 * Math.PI / 180;

export class IsobarFlowScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: SETUP, [Number.MAX_SAFE_INTEGER]: SETUP, 1: SETUP, 3: MAP };
  static ARIA_LABEL = 'A weather map with a high-pressure area reading 1012 at the centre and a low-pressure area reading 984. Wind blows out of the high and into the low, bent by the Earth\'s rotation.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Rotation', chips: [{ id: 'off', label: 'Without rotation', targets: ['off'], tone: 3 }], onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 500 : 410; }
  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.reset(); this.tl.set({ disabled: step !== 3 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step !== 3;
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    const hx = port ? W / 2 : W * 0.27, hy = port ? 118 : H / 2, lx = port ? W / 2 : W * 0.75, ly = port ? H - 112 : H / 2;
    const off = this.tl.chip()?.id === 'off';
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:color-mix(in oklab, var(--sim-bg-surface) 78%, ${sky('sea')});stroke:var(--sim-stroke);stroke-width:3"/>`;
    const lineCol = 'color-mix(in oklab, var(--sim-label) 62%, var(--sim-bg-surface))';
    const ring = (x, y, r) => {
      const hot = step === 2;
      return `<ellipse cx="${x}" cy="${y}" rx="${r * 1.12}" ry="${r * 0.98}" style="fill:none;stroke:${lineCol};stroke-width:${hot ? 3.5 : 2.5}"/>`
        ;
    };
    const num_ = (x, y, r, v, a) => tx(x + Math.cos(a) * r * 1.12, y + Math.sin(a) * r * 0.98 + 5, String(v), { size: 15, halo: 'color-mix(in oklab, var(--sim-bg-surface) 78%, ' + sky('sea') + ')', haloW: 6 });
    let labels = '';
    for (const [v, r] of HR) { s += ring(hx, hy, r, v); labels += num_(hx, hy, r, v, -Math.PI / 2); }
    LR.forEach(([v, r], i) => { s += ring(lx, ly, r, v); labels += num_(lx, ly, r, v, -1.95 + i * 0.66); });
    // 1000 runs between the two systems
    const mx = (hx + lx) / 2, my = (hy + ly) / 2;
    if (port) s += `<path d="M6 ${my + 6}C${W * 0.3} ${my - 16} ${W * 0.7} ${my + 16} ${W - 6} ${my - 6}" style="fill:none;stroke:${lineCol};stroke-width:2.5"/>` + tx(W - 42, my + 16, '1000', { size: 15 });
    else s += `<path d="M${mx + 6} 8C${mx - 18} ${H * 0.34} ${mx + 18} ${H * 0.66} ${mx - 6} ${H - 8}" style="fill:none;stroke:${lineCol};stroke-width:2.5"/>` + tx(mx + 30, 34, '1000', { size: 15 });
    const dot = (x, y, t, col) => `<circle cx="${x}" cy="${y}" r="19" style="fill:${col};stroke:${SKY_INK};stroke-width:3"/>` + tx(x, y + 10, t, { size: 28, display: true, weight: 700, col: sky('cloud') });
    if (step === 0) s += tx(hx, hy + 40, '', { size: 1 });
    s += dot(hx, hy, 'H', 'var(--sim-series-1)') + dot(lx, ly, 'L', 'var(--sim-series-4)');
    const col = 'var(--sim-series-5)';
    if (step === 1) {
      const a = Math.atan2(ly - hy, lx - hx), L0 = 26;
      s += windArrow([[hx + Math.cos(a) * L0, hy + Math.sin(a) * L0], [lx - Math.cos(a) * L0, ly - Math.sin(a) * L0]], { w: 13, col, rim: SKY_INK, flow: true });
    }
    if (step === 3) {
      const arrow = (cx, cy, r, th, out) => {
        const x = cx + Math.cos(th) * r * 1.12, y = cy + Math.sin(th) * r * 0.98;
        const rad = out ? [Math.cos(th), Math.sin(th)] : [-Math.cos(th), -Math.sin(th)];
        // clockwise on screen is +theta; out of a high clockwise, into a low anticlockwise
        const tan = out ? [-Math.sin(th), Math.cos(th)] : [Math.sin(th), -Math.cos(th)];
        const k = off ? 0 : Math.cos(SLANT), m = off ? 1 : Math.sin(SLANT);
        const dx = tan[0] * k + rad[0] * m, dy = tan[1] * k + rad[1] * m, L = 26;
        return windArrow([[x - dx * L / 2, y - dy * L / 2], [x + dx * L / 2, y + dy * L / 2]], { w: 4.5, col, rim: SKY_INK, head: 10 });
      };
      [[62, 6, 0.3], [104, 8, 0.1]].forEach(([r, n, ph]) => { for (let i = 0; i < n; i++) s += arrow(hx, hy, r, ph + i * 2 * Math.PI / n, true); });
      [[52, 5, 0.9], [92, 7, 0.75]].forEach(([r, n, ph]) => { for (let i = 0; i < n; i++) s += arrow(lx, ly, r, ph + i * 2 * Math.PI / n, false); });
      const lab = off ? 'no rotation: straight' : 'with rotation: spirals';
      if (!port) { const w = 214; s += panel((W - w) / 2, H - 42, w, 32, { r: 10 }) + tx(W / 2, H - 20, lab, { size: 15 }); }
    }
    return { svg: s + labels };
  }
}
