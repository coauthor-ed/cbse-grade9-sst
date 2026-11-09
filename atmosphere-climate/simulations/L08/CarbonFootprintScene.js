// CarbonFootprintScene - climate change, calmly (L08 s03c, 3 beats): the book's causes, effects and collective
// efforts as drawn tiles, with one quiet picture of the Earth's edge above them. No gauge, no forecast.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgEarthEdge, svgSkyGradient } = SkyArt;
import { TILE_CSS, tilesHtml } from './TileBoard.js';

const STEPS = [
  { title: 'Three human causes', cols: 1, items: [
    { icon: 'flame', tone: 8, text: 'Burning fossil fuels' }, { icon: 'tree', tone: 3, text: 'Cutting forests' }, { icon: 'factory', tone: 5, text: 'Industrial pollution' }] },
  { title: 'What we are seeing', cols: 2, items: [
    { icon: 'river', tone: 1, text: 'More frequent floods' }, { icon: 'sun', tone: 2, text: 'More frequent droughts' }, { icon: 'mountain', tone: 5, text: 'Melting glaciers' },
    { icon: 'boat', tone: 7, text: 'Rising sea levels' }, { icon: 'bird', tone: 3, text: 'Loss of biodiversity' }, { icon: 'hospital', tone: 4, text: 'Health, farming, livelihoods' }] },
  { title: 'Efforts we make together', cols: 2, items: [
    { icon: 'bulb', tone: 2, text: 'Reducing carbon footprints' }, { icon: 'sun', tone: 8, text: 'Using renewable energy' }, { icon: 'tree', tone: 3, text: 'Protecting forests' }, { icon: 'leaf', tone: 1, text: 'Sustainable lifestyles' }] },
];
const CSS = `
.cf-pic { display: block; width: 100%; height: auto; border-radius: var(--sim-radius-lg); border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); box-sizing: border-box; }
.sim-dom-root--portrait .tb-tile { min-height: 64px; }
`;
const pic = () => `<svg class="cf-pic" viewBox="0 0 640 120" aria-hidden="true"><defs>${svgSkyGradient('cf', 12, 80)}</defs><rect width="640" height="120" style="fill:url(#cf)"/>${svgEarthEdge(320, 46, 1, { w: 640, h: 80, R: 1100, seed: 6 })}</svg>`;

export class CarbonFootprintScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 560;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'Tiles naming the causes of climate change, what we are seeing, and the efforts that reduce it.';

  async setup() { await super.setup(); this._draw(0); }
  onStep(step) { this._draw(step); }
  _draw(step) {
    const s = STEPS[step] ?? STEPS[0];
    this.render({ css: SIM_LOOK_DOM_CSS + TILE_CSS + CSS, rootClass: 'sl-backdrop', html: `<div class="tb-wrap">${pic()}<h3 class="tb-title">${s.title}</h3>${tilesHtml(s.items, { cols: s.cols })}</div>` });
  }
}
