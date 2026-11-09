// RiverCourseScene - one river in long profile, mountain to sea. Three courses; tap one to light it. A plate shows
// that course's valley in cross-section and its landforms. Slope falls, speed falls, grains get finer.
// Stages: 0 the three jobs; 1 upper; 2 middle; 3 lower. The profile's height is stretched: the plate says so once.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { svgRock, svgWater, svgSnow, svgGrass, svgTree, svgBoulder } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, words, ec, strand, arrow, plate, shape, INK, WHITE } from '../L04/EarthBits.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'upper', label: 'Upper', targets: ['upper'], tone: 2 },
  { id: 'middle', label: 'Middle', targets: ['middle'], tone: 3 },
  { id: 'lower', label: 'Lower', targets: ['lower'], tone: 1 },
];
const INFO = {
  upper: { x: [.02, .36], list: ['V-shaped valley', 'Waterfall', 'Rapids'], sect: [[0, 0], [.42, .92], [.58, .92], [1, 0]], w: .1, speed: 'Fast, steep' },
  middle: { x: [.36, .68], list: ['Meander', 'Oxbow lake', 'Floodplain'], sect: [[0, .1], [.14, .62], [.34, .8], [.44, .92], [.56, .92], [.66, .8], [.86, .62], [1, .1]], w: .12, speed: 'Slower, gentler' },
  lower: { x: [.68, .98], list: ['Delta', 'Levee', 'Alluvial fan'], sect: [[0, .62], [.3, .68], [.4, .6], [.44, .86], [.56, .86], [.6, .6], [.7, .68], [1, .62]], w: .12, speed: 'Slowest, almost flat' },
};
// profile in unit space
const PROF = [[-.02, .16], [.08, .2], [.2, .36], [.32, .5], [.46, .6], [.6, .66], [.76, .7], [.88, .72], [1.02, .73]];

export class RiverCourseScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 620;
  static HEIGHT = 450;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static ARIA_LABEL = 'A river from the mountains to the sea, in side view. The upper course is steep and cuts a V-shaped valley. The middle course swings in bends. The lower course is nearly flat and drops sediment.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Parts of the river', chips: CHIPS, onChange: () => this.repaint() });
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 370 : 350; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(stage) { this._stage = stage; this._fresh = true; this.tl.set({ lit: [null, 'upper', 'middle', 'lower'][stage], disabled: false }); }

  paint(st) {
    const W = st.W, H = st.H, X = (u) => u * W, Y = (v) => v * H, P = PROF.map(([u, v]) => [X(u), Y(v)]);
    const lit = this.tl.any() ? this.tl.lit()[0] : null, on = (k) => !lit || lit === k;
    let b = svgCloud(X(.6), Y(.1), .6, { seed: 3 });
    b += svgWater([[X(.82), Y(.73)], [W + 10, Y(.73)], [W + 10, H + 10], [X(.82), H + 10]], { t: 2, ripples: 4, deep: .4 });
    b += svgRock([[X(-.02), Y(.1)], [X(.08), Y(.05)], [X(.16), Y(.16)], ...P.slice(2, -1), [X(.9), Y(.8)], [X(.9), H + 10], [X(-.02), H + 10]], { seed: 6, fill: 'rock', cracks: 5, grain: true, outline: true, lit: true });
    b += svgSnow([[X(.03), Y(.1)], [X(.08), Y(.05)], [X(.13), Y(.12)], [X(.08), Y(.14)]], { seed: 3 });
    b += svgGrass(X(.46), Y(.6), X(.86), Y(.72), { seed: 3, n: 16, tall: 10 });
    for (const [u, v, k] of [[.5, .615, .5], [.56, .635, .42], [.7, .69, .46]]) b += svgTree(X(u), Y(v), k, { seed: 3, kind: 'round' });
    const riv = [[X(.1), Y(.2)], [X(.2), Y(.36)], [X(.32), Y(.5)], [X(.46), Y(.6)], [X(.6), Y(.66)], [X(.76), Y(.7)], [X(.87), Y(.73)]];
    b += strand(riv, 'seaDeep', 12) + strand(riv, 'sea', 7);
    if (lit) { const i = INFO[lit]; b += `<rect x="0" y="0" width="${X(i.x[0])}" height="${H}" style="fill:${ec('rockDeep')};opacity:.32"/><rect x="${X(i.x[1])}" y="0" width="${W - X(i.x[1])}" height="${H}" style="fill:${ec('rockDeep')};opacity:.32"/>`; }
    // load gets finer downstream
    for (let i = 0; i < 4; i++) b += svgBoulder(X(.16 + i * .045), Y(.3 + i * .055) + 4, .34 - i * .02, { seed: i + 2 });
    for (let i = 0; i < 5; i++) b += svgBoulder(X(.44 + i * .05), Y(.6 + i * .012) + 4, .14, { seed: i + 2 });
    for (let i = 0; i < 12; i++) b += `<circle cx="${X(.74 + i * .012)}" cy="${Y(.7) + 7 + (i % 3) * 2}" r="2.6" style="fill:${ec('sandLit')}"/>`;
    const dim = (k) => ({ dim: !on(k) });
    b += arrow([[X(.18), Y(.28)], [X(.3), Y(.44)]], { w: 7, c: WHITE, dim: !on('upper') }) + arrow([[X(.48), Y(.57)], [X(.58), Y(.61)]], { w: 5, c: WHITE, dim: !on('middle') }) + arrow([[X(.74), Y(.655)], [X(.8), Y(.665)]], { w: 3.5, c: WHITE, dim: !on('lower'), head: 11 });
    const pop = this._fresh ? { pop: true } : {};
    const yB = H - 24;
    b += tag(X(.2), yB, 'Upper', { ...pop, ...dim('upper'), size: 14 }) + tag(X(.52), yB, 'Middle', { ...pop, ...dim('middle'), size: 14 }) + tag(X(.8), yB, 'Lower', { ...pop, ...dim('lower'), size: 14 });
    if (lit) {
      const i = INFO[lit], pw = st.portrait ? 200 : 250, ph = 150, px = W - pw - 8, py = 8, sx = px + 12, sy = py + 8, sw = pw - 24, sh = 44;
      b += plate(px, py, pw, ph, {});
      const pts = i.sect.map(([u, v]) => [sx + u * sw, sy + v * sh]);
      b += `<path d="M${sx} ${sy + sh + 8}L${pts.map((q) => q.join(' ')).join('L')}L${sx + sw} ${sy + sh + 8}Z" style="fill:${ec('rock')};stroke:${INK};stroke-width:2.5;stroke-linejoin:round"/>`;
      b += `<rect x="${sx + sw * .44}" y="${sy + sh * .88}" width="${sw * .12}" height="${sh * .12}" style="fill:${ec('sea')}"/>`;
      i.list.forEach((t, n) => { b += words(px + pw / 2, py + 76 + n * 21, t, { size: 15, anchor: 'middle' }); });
    } else {
      b += tag(X(.62), Y(.1) + 28, 'Slope drawn steeper than real', { size: 14 });
      b += tag(X(.3), Y(.68) + 6, 'Erosion', { ...pop }) + tag(X(.57), Y(.82), 'Transportation', { ...pop, delay: .1 }) + tag(X(.8), Y(.84) - 34, 'Deposition', { ...pop, delay: .2 });
    }
    this._fresh = false;
    return { svg: world(st, 'rc', b) };
  }
}
