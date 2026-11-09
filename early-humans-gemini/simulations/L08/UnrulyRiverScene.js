/**
 * UnrulyRiverScene - blk-l08-s02 (poe-predict, shown only after Submit). A river in cross-section between two fields,
 * with a house on higher ground. Four named cases, chosen by chip. Water rises or falls once and rests. None of the four gives
 * a field steady water, and that is the point: the scene shows the problem, never a canal or a dam.
 * Base chain: SvgScene.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { houseSvg, n } from '../L07/HarappanDraw.js';

const MAP = [[{ idx: 0, dwellMs: null }]];
const CASES = {
  dry: { label: 'Dry months', level: 0.72, read: 'River low, fields dry', crops: 'dry', moved: false },
  usual: { label: 'Usual flood', level: 0.39, read: 'Fields wet for a short time', crops: 'wet', moved: false },
  sudden: { label: 'Sudden flood', level: 0.1, read: 'Crops and house under water', crops: 'gone', moved: false },
  moved: { label: 'River moves', level: 0.72, read: 'The river has left this field', crops: 'dry', moved: true },
};
const CHIPS = Object.entries(CASES).map(([id, k], i) => ({ id, label: k.label, targets: [id], tone: i + 1 }));

export class UnrulyRiverScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A river between two fields seen in cross-section, with four cases: dry months, a usual flood, a sudden flood and a river that moves its channel.';

  tl = tapLight({ label: 'What the river does', chips: CHIPS, onChange: () => { this._was = this._now; this._now = this._case(); this.repaint(); } });
  _now = 'dry';
  _was = 'dry';

  _case() { return this.tl.lit()[0] ?? 'dry'; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.set({ lit: 'dry' }); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 300 : 330; }

  paint(st) {
    const W = st.W, H = st.H, id = this._case(), k = CASES[id], top = 54, g = H - 16;
    const land = top + (g - top) * 0.46;      // field surface
    const low = g - 6;                         // channel bed
    const prof = (a) => `M0 ${H}V${n(land)}H${n(W * a)}L${n(W * (a + 0.09))} ${n(low)}H${n(W * (a + 0.23))}L${n(W * (a + 0.32))} ${n(land)}`;
    const a = k.moved ? 0.62 : 0.28, path = prof(a) + `H${W}V${H}Z`;
    const y = top + (g - top) * k.level, was = top + (g - top) * CASES[this._was].level, dy = this._was === id ? 0 : n(was - y);
    const water = `<clipPath id="ur-frame"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath><g clip-path="url(#ur-frame)"><g${dy ? ` class="ur-w" style="--dy:${dy}px"` : ''}><rect x="0" y="${n(y)}" width="${W}" height="${n(H - y + 200)}" ${fill('var(--sim-sea-shallow)', 'opacity:0.86')}/><rect x="0" y="${n(y)}" width="${W}" height="4" ${fill('color-mix(in oklab, var(--sim-sea-shallow) 55%, white)')}/></g></g>`;
    const soil = k.crops === 'dry' ? 'var(--sim-strata-1)' : 'var(--sim-strata-3)';
    let crops = '';
    const plant = (x) => {
      if (k.crops === 'gone') return '';
      const col = k.crops === 'dry' ? 'var(--sim-strata-2)' : 'var(--sim-elev-low)', h = k.crops === 'dry' ? 14 : 28;
      return `<path d="M${n(x)} ${n(land)}v${-h}m0 ${n(h * 0.4)}l-7 -8m7 8l7 -8" ${stroke(col, 4)}/>`;
    };
    const left = k.moved ? [0.06, 0.16, 0.26, 0.36, 0.46, 0.55] : [0.05, 0.13, 0.21], right = k.moved ? [0.97] : [0.68, 0.76];
    for (const f of [...left, ...right]) crops += plant(W * f);
    const house = houseSvg(W * 0.9, land + 1, Math.min(W * 0.13, 72));
    const svg = `<text class="ur-r" x="${W / 2}" y="26" text-anchor="middle" font-size="${st.portrait ? 21 : 26}" dominant-baseline="central" ${fill('var(--sim-label)')}>${k.read}</text>`
      + crops + house + water + `<path d="${path}" ${fill(soil)}/><path d="${prof(a)}" ${stroke(shade(soil, 70), 4)}/>`;
    return { svg };
  }

  css() { return `svg .ur-r { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; }
svg .ur-w { animation: ur-w 1s ease-out both; }
@keyframes ur-w { from { transform: translateY(var(--dy, 0)); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .ur-w { animation: none; } }`; }
}
