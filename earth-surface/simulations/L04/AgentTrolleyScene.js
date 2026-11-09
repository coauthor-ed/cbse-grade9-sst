// AgentTrolleyScene - one cut through the land from a glacier peak to the sea, with the five agents of
// gradation on it. Tap an agent: it lights, the rest dim, and a plate says what it does.
// Stages: 0 all agents, arrow from high ground to low ground; 1 tap each; 2 running water lit (close).
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { svgRock, svgIce, svgWater, svgSand, svgSnow, svgGrass, svgTree, svgBoulder } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, words, ec, strand, arrow, plate, WHITE, INK } from './EarthBits.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 2, dwellMs: null }]];
const CHIPS = [
  { id: 'water', label: 'Running water', targets: ['water'], tone: 2 },
  { id: 'ice', label: 'Glaciers', targets: ['ice'], tone: 5 },
  { id: 'wind', label: 'Wind', targets: ['wind'], tone: 4 },
  { id: 'waves', label: 'Waves', targets: ['waves'], tone: 1 },
  { id: 'ground', label: 'Groundwater', targets: ['ground'], tone: 7 },
];
const SAY = {
  water: 'Forms valleys and plains',
  ice: 'Scrapes, carries, carves U-valleys',
  wind: 'Erodes and deposits sand',
  waves: 'Form cliffs, beaches, bays',
  ground: 'Dissolves limestone: caves',
};

export class AgentTrolleyScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP, 1: MAP1 };
  static WIDTH = 620;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 540;
  static ARIA_LABEL = 'A cut through the land from a snowy peak to the sea. A glacier on the peak, a river running down, sand dunes and wind on the plain, waves at the coast, and groundwater in a limestone cave underground.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Agents of gradation', chips: CHIPS, onChange: (lit) => { if (lit?.length) this._seen(); this.repaint(); } });

  css() { return BAR_CSS + '.sim-dom-root[data-step="0"] .tl-row, .sim-dom-root[data-step="2"] .tl-row { display: none; } .sim-dom-root:not(.sim-dom-root--portrait) .tl-chip { padding-left: 6px; padding-right: 6px; }'; }
  stageHeight(st) { return st.portrait ? 370 : 340; }

  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }

  enter(stage) {
    this._stage = stage; this._fresh = true; if (this.root) this.root.dataset.step = String(stage);
    this.tl.set({ lit: stage === 2 ? 'water' : null, disabled: stage !== 1 });
  }
  _seen() {
    this._tapped = this._tapped ?? new Set();
    const c = this.tl.chip?.(); if (c) this._tapped.add(c.id ?? c);
    if (this._tapped.size === CHIPS.length && !this._cel) { this._cel = true; this.celebrate(); }
  }

  paint(st) {
    const W = st.W, H = st.H, X = (u) => u * W, Y = (v) => v * H, on = (t) => !this.tl.any() || !this.tl.off(t);
    const dim = (t) => `style="opacity:${on(t) ? 1 : 0.22}"`;
    const surf = [[-.02, .4], [.05, .28], [.15, .1], [.25, .3], [.34, .46], [.46, .56], [.6, .58], [.72, .58], [.8, .6], [.84, .58], [.89, .7], [1.02, .82]];
    const P = surf.map(([u, v]) => [X(u), Y(v)]);
    let b = svgCloud(X(.5), Y(.14), st.portrait ? .6 : .75, { seed: 5 }) + svgCloud(X(.82), Y(.2), .5, { seed: 2 });
    // sea sits behind the land's edge
    b += `<g ${dim('waves')}>${svgWater([[X(.82), Y(.66)], [W + 10, Y(.66)], [W + 10, H + 10], [X(.82), H + 10]], { t: 2, ripples: 5, deep: .6 })}</g>`;
    b += svgRock([...P, [X(1.02), H + 10], [X(-.02), H + 10]], { seed: 8, fill: 'rock', cracks: 6, grain: true, outline: true, lit: true });
    // limestone band and cave
    const lim = [[X(.3), Y(.74)], [X(.8), Y(.72)], [X(.84), Y(.98)], [X(.26), Y(1.0)]];
    b += svgRock(lim, { seed: 3, fill: 'sandLit', bands: ['sandLit', 'sand'], bandH: 16, cracks: 3 });
    b += `<g ${dim('ground')}>`;
    b += `<ellipse cx="${X(.56)}" cy="${Y(.87)}" rx="${X(.15)}" ry="${Y(.075)}" style="fill:${ec('rockDeep')}"/>`;
    b += svgWater([[X(.44), Y(.9)], [X(.68), Y(.9)], [X(.64), Y(.93)], [X(.48), Y(.93)]], { ripples: 1 });
    for (const [u, v0] of [[.5, .6], [.58, .6], [.64, .6]]) b += `<path d="M${X(u)} ${Y(v0)}V${Y(.8)}" style="stroke:${ec('sea')};stroke-width:4;stroke-dasharray:3 12;stroke-linecap:round;fill:none"/>`;
    b += '</g>';
    // ice and snow
    b += `<g ${dim('ice')}>${svgSnow([[X(.09), Y(.2)], [X(.15), Y(.09)], [X(.21), Y(.2)], [X(.15), Y(.24)]], { seed: 2 })}${svgIce([[X(.15), Y(.15)], [X(.24), Y(.27)], [X(.3), Y(.38)], [X(.26), Y(.4)], [X(.15), Y(.28)]], { seed: 4, flow: 50, cracks: 3 })}</g>`;
    // river down the slope and over the plain
    b += `<g ${dim('water')}>` + strand([[X(.27), Y(.385)], [X(.34), Y(.465)], [X(.46), Y(.57)], [X(.6), Y(.59)], [X(.72), Y(.59)], [X(.82), Y(.62)], [X(.88), Y(.68)]], 'seaDeep', 12) + strand([[X(.27), Y(.385)], [X(.34), Y(.465)], [X(.46), Y(.57)], [X(.6), Y(.59)], [X(.72), Y(.59)], [X(.82), Y(.62)], [X(.88), Y(.68)]], 'sea', 7) + '</g>';
    // dunes and wind on the plain
    b += `<g ${dim('wind')}>`;
    for (const [u, r] of [[.52, .06], [.61, .075], [.7, .055]]) b += svgSand([[X(u - r), Y(.585)], [X(u - r * .2), Y(.585) - X(r) * .62], [X(u + r), Y(.585)]], { seed: 3, ripples: false });
    b += arrow([[X(.42), Y(.42)], [X(.55), Y(.4)], [X(.72), Y(.43)]], { c: WHITE, w: 6 });
    b += '</g>';
    b += svgGrass(X(.34), Y(.46), X(.44), Y(.55), { seed: 3, n: 6, tall: 10 }) + svgTree(X(.38), Y(.5), .36, { kind: 'pine', seed: 3 });
    b += `<g ${dim('waves')}>${arrow([[X(1), Y(.72)], [X(.93), Y(.73)]], { c: WHITE, w: 6 })}</g>`;
    for (let i = 0; i < 3; i++) b += svgBoulder(X(.84 + i * .025), Y(.7 + i * .025), .2, { seed: i + 1 });
    const pop = this._fresh ? { pop: true } : {};
    if (this._stage === 0) {
      b += arrow([[X(.22), Y(.14)], [X(.44), Y(.3)], [X(.6), Y(.48)]], { c: ec('sandLit'), w: 7 });
      b += tag(X(.46), Y(.1) + 4, 'High land worn down', pop) + tag(X(.5), Y(.68) + 4, 'Low land filled up', { ...pop, delay: .15 });
    } else {
      const lit = this.tl.any() ? this.tl.lit()[0] : null;
      if (lit) { const chip = CHIPS.find((c) => c.targets[0] === lit); b += plate(W / 2 - 150, 6, 300, 54, { rim: `var(--sim-series-${chip.tone})` }) + words(W / 2, 28, chip.label, { size: 17, anchor: 'middle' }) + words(W / 2, 49, SAY[lit], { size: 15, anchor: 'middle' }); }
      else b += tag(W / 2 + 40, 26, 'Tap an agent below', pop);
    }
    this._fresh = false;
    return { svg: world(st, 'at', b) };
  }
}
