// GlacialUseScene - one drawn land: mountains and a glacier, a U-valley with fields, a moraine lake, a sea inlet with a
// boat. Tap a landform: it lights and a plate says how people use it. A drawing of no real place.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { svgRock, svgSnow, svgGrass, svgTree } from '../shared/EarthArt.js';
import { iceBody, oval } from './IceArt.js';
import { withEarth, BAR_CSS, world, words, plate, ec, strand, shape, INK } from '../L04/EarthBits.js';

const MAP = [[{ idx: 0, dwellMs: null }]];
const CHIPS = [
  { id: 'valley', label: 'U-valleys, cirques', targets: ['valley'], tone: 2 },
  { id: 'fjord', label: 'Fjords', targets: ['fjord'], tone: 1 },
  { id: 'soil', label: 'Glacial soil', targets: ['soil'], tone: 3 },
  { id: 'moraine', label: 'Moraines', targets: ['moraine'], tone: 4 },
  { id: 'ice', label: 'Glaciers', targets: ['ice'], tone: 5 },
];
const SAY = { valley: 'Trekking, skiing, mountaineering', fjord: 'Harbours and fishing', soil: 'Farming in some valleys', moraine: 'Fertile soil, dams, lakes for water', ice: 'Fresh water for rivers downstream' };

export class GlacialUseScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 600;
  static HEIGHT = 490;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 540;
  static ARIA_LABEL = 'A drawn land with a glacier, a U-shaped valley with fields, a lake behind a moraine, and a sea inlet with a boat. Tap each to see how people use it.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Glacial landforms', chips: CHIPS, onChange: () => this._seen() });
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 340 : 340; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter() { this.tl.set({ lit: 'valley' }); this._done = new Set(['valley']); }
  _seen() {
    const l = this.tl.lit()[0]; if (l) this._done.add(l);
    if (this._done.size === CHIPS.length && !this._cel) { this._cel = true; this.celebrate(); }
    this.repaint();
  }
  paint(st) {
    const W = st.W, H = st.H, X = (u) => u * W, Y = (v) => v * H, lit = this.tl.any() ? this.tl.lit()[0] : null, g = (k) => `style="opacity:${!lit || lit === k ? 1 : .3}"`, P = (a) => a.map(([u, v]) => [X(u), Y(v)]);
    let b = `<g ${g('valley')}>${svgRock(P([[-.02, .62], [.1, .22], [.2, .36], [.34, .14], [.5, .34], [.62, .2], [.74, .34], [.86, .24], [1.02, .42], [1.02, 1.04], [-.02, 1.04]]), { seed: 6, fill: 'rock', cracks: 7, grain: true, outline: true, lit: true })}${svgSnow(P([[.07, .3], [.1, .22], [.14, .29]]), { seed: 3 })}${svgSnow(P([[.82, .3], [.86, .24], [.9, .3]]), { seed: 5 })}</g>`;
    // U-valley floor, green
    b += shape(P([[-.02, .72], [.16, .62], [.3, .6], [.62, .6], [.72, .68], [.7, 1.04], [-.02, 1.04]]), { f: 'grass', s: 'grassDark', w: 2.5 });
    b += `<g ${g('ice')}>${svgSnow(P([[.29, .23], [.34, .14], [.4, .23]]), { seed: 2 })}${iceBody(P([[.3, .23], [.4, .22], [.46, .34], [.49, .47], [.4, .49], [.33, .38]]), P([[.35, .24], [.39, .36], [.44, .46]]), { spread: .5 })}</g>`;
    b += `<g ${g('moraine')}>${shape(oval(X(.47), Y(.555), X(.1), Y(.045), 16), { f: 'sea', s: 'seaDeep', w: 2.5 })}${strand(P([[.34, .56], [.4, .62], [.5, .64], [.6, .6]]), 'soilDark', 17)}${strand(P([[.34, .56], [.4, .62], [.5, .64], [.6, .6]]), 'soil', 12)}</g>`;
    const riv = P([[.5, .65], [.46, .74], [.54, .84], [.68, .9]]);
    b += strand(riv, 'seaDeep', 11) + strand(riv, 'sea', 7);
    b += `<g ${g('soil')}>`;
    for (let i = 0; i < 6; i++) b += `<rect x="${X(.05 + (i % 3) * .115)}" y="${Y(.7 + Math.floor(i / 3) * .1)}" width="${X(.1)}" height="${Y(.08)}" rx="4" style="fill:${ec(i % 2 ? 'grassLit' : 'sand')};stroke:${ec('grassDark')};stroke-width:2"/>`;
    b += '</g>';
    b += svgTree(X(.44), Y(.93), .46, { kind: 'pine', seed: 3 }) + svgGrass(X(.05), Y(.96), X(.6), Y(.96), { seed: 4, n: 10 });
    b += `<g ${g('fjord')}>${shape(P([[.74, .54], [.8, .52], [.86, .56], [1.02, .62], [1.02, 1.04], [.66, 1.04], [.68, .88], [.72, .72]]), { f: 'sea', s: 'seaDeep', w: 2.5 })}<g transform="translate(${X(.86)} ${Y(.82)})"><path d="M-26 -3h52l-9 12h-34z" style="fill:${ec('bark')};stroke:${INK};stroke-width:2.5"/><path d="M0 -3v-30l18 24z" style="fill:${ec('snow')};stroke:${INK};stroke-width:2"/></g></g>`;
    if (lit) { const c = CHIPS.find((x) => x.id === lit); b += plate(W / 2 - 158, 6, 316, 56, { rim: `var(--sim-series-${c.tone})` }) + words(W / 2, 29, c.label, { size: 17, anchor: 'middle' }) + words(W / 2, 50, SAY[lit], { size: 15, anchor: 'middle' }); }
    return { svg: world(st, 'gu', b) };
  }
}
