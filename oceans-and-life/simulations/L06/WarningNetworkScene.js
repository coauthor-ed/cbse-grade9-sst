// WarningNetworkScene - the ten parts of a tsunami early warning system on our own drawn coast. Part 3 stands
// twice. A beat offers its own parts as chips; tap one to light it. Our art, the book's numbers.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, sky } from '../L04/SeaDraw.js';
import { warnWorld, tag } from './WarnWorld.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PARTS = {
  10: 'Earthquake', 9: 'Seismic waves', 8: 'Seismometer station', 7: 'GPS station', 6: 'Tide gauges station', 5: 'GPS satellite', 4: 'Communication satellite', 1: 'Warning centre', 2: 'Modelling/simulation', 3: 'Capacity development',
};
const chip = (n) => ({ id: String(n), label: `${n} ${PARTS[n]}`, targets: n === 3 ? ['3a', '3b'] : [n] });
const SETS = [[10, 9, 8, 7, 6], [5, 4], [1, 2, 3]];
const OFF = { 1: [10, -64], 2: [14, -66], '3a': [0, -58], '3b': [-4, -50], 4: [-50, 8], 5: [40, 8], 6: [-20, 34], 7: [14, -46], 8: [10, -44], 9: [40, -6], 10: [-24, 0] };

export class WarningNetworkScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A drawn coast with ten numbered parts of a tsunami early warning system: warning centre, modelling, capacity development on both coasts, two satellites, tide gauges station, GPS station, seismometer station, seismic waves and an earthquake.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Parts of the system', chips: SETS[0].map(chip), onChange: () => this.repaint() });
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 370 : 270; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { this.tl?.set({ chips: SETS[step].map(chip), lit: null }); this.relayout?.(); }
  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex, chipLit = this.tl.lit() ?? [];
    const beat = SETS[step].flatMap((n) => (n === 3 ? ['3a', '3b'] : [n]));
    const lit = new Set(chipLit.length ? chipLit : beat);
    const w = warnWorld(W, H, { lit });
    let s = w.svg;
    for (const id of [1, 2, '3a', '3b', 4, 5, 6, 7, 8, 9, 10]) {
      const [x, y] = w.p(id), o = OFF[id], k = W < 500 ? 0.7 : 1;
      const n = String(id).replace(/[ab]/, '');
      s += tag(n, Math.max(16, Math.min(W - 16, x + o[0] * k)), Math.max(16, y + o[1] * k), lit.has(id));
    }
    s += tx(W - 10, H - 12, 'not to scale', { size: 14, anchor: 'end', col: sky('cloud'), weight: 700 });
    return { svg: s };
  }
}
