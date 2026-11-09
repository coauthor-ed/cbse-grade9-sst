// OceanArcScene - the five big questions, answered on the one sea world. Tap a part to light it and read its answer.
// Beat 0: starts on the sea floor. Beat 1: starts on the zones, beside the words on why rules matter.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { svgOceanWorld } from '../shared/OceanWorld.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, panel, wrap, MUTED } from '../L08/SeaDraw.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const CHIPS = [
  { id: 'floor', label: 'Sea floor', targets: ['floor'], q: 'Why does ocean relief matter?', a: 'Shelves, ridges and trenches affect sea life, the resources we can reach and undersea exploration.' },
  { id: 'water', label: 'Moving water', targets: ['water'], q: 'How does moving water affect us?', a: 'Waves, tides and currents shape coasts, climate, fishing and navigation.' },
  { id: 'zones', label: 'Zones', targets: ['zones'], q: 'Why do maritime zones matter?', a: 'They set out what a country may do at each distance from its coast, so rights are clear.' },
  { id: 'ships', label: 'Resources', targets: ['ships'], q: 'How can we use resources sustainably?', a: 'Through cooperation, regulation and conservation, so that sea life and future generations are protected.' },
  { id: 'warn', label: 'Warnings', targets: ['warn'], q: 'How do warnings protect people?', a: 'They detect a danger early and warn people in time to reach safety.' },
];

export class OceanArcScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1)];
  static WIDTH = 680;
  static HEIGHT = 520;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 610;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'A cross-section of the sea with five parts that can be lit: the sea floor, moving water, zones, ships and rigs, and warning instruments. Each gives one answer.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Choose a part of the sea', chips: CHIPS, onChange: () => this.repaint() });
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 446 : 345; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { if (this.tl?.mount) { this.tl.set({ lit: step === 0 ? 'floor' : 'zones' }); this.relayout?.(); } }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, id = this.tl.chip?.()?.id ?? 'floor', c = CHIPS.find((x) => x.id === id) ?? CHIPS[0];
    const size = P ? 16 : 20, cw = W - 4, lines = wrap(c.a, cw - 28, size), lh = size + 6, ch = 36 + lines.length * lh, fh = H - ch - 12;
    let s = `<defs><clipPath id="oaC"><rect x="0" y="0" width="${W}" height="${fh}" rx="16"/></clipPath></defs><g clip-path="url(#oaC)">${svgOceanWorld(W, fh, { lit: id })}</g>`;
    const cy = fh + 8;
    s += panel(2, cy, cw, ch);
    s += tx(W / 2, cy + 24, c.q, { size: P ? 16 : 20, display: true, weight: 700, col: MUTED });
    lines.forEach((l, i) => { s += tx(W / 2, cy + 46 + i * lh, l, { size, weight: 700 }); });
    return { svg: frame(st, s) };
  }
}
