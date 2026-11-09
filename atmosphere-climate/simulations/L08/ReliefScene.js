// ReliefScene - the book's six effects of the Punjab floods, and its four discussion prompts (L08 s05, 2 beats).
// A plain list, with quiet icons and no figures of people. Nothing to rank, drag or score. Not a photograph.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import { TILE_CSS, tilesHtml } from './TileBoard.js';

const EFFECTS = [
  { num: '1', text: 'Lives lost' }, { icon: 'house', tone: 5, text: 'People moved to relief camps' }, { icon: 'field', tone: 3, text: 'Farmland and paddy under water' },
  { icon: 'bird', tone: 8, text: 'Farm animals sick or dead' }, { icon: 'road', tone: 5, text: 'Roads, bridges, buildings damaged' }, { icon: 'glass', tone: 1, text: 'Disease from standing water' },
];
const PROMPTS = [
  { num: '1', text: 'Natural factors or human activities: how much of each?' }, { num: '2', text: 'Could better planning have reduced the damage?' },
  { num: '3', text: "What are the NDMA's guidelines for floods?" }, { num: '4', text: 'What can students and young people do to prepare?' },
];

export class ReliefScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 420;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 560;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A plain list of the effects of the 2025 floods in Punjab, then four questions to discuss in class.';

  async setup() { await super.setup(); this._draw(0); }
  onStep(step) { this._draw(step); }
  _draw(step) {
    const list = step === 1 ? tilesHtml(PROMPTS, { cols: 1 }) : tilesHtml(EFFECTS, { cols: 2 });
    this.render({ css: SIM_LOOK_DOM_CSS + TILE_CSS, rootClass: 'sl-backdrop', html: `<div class="tb-wrap"><h3 class="tb-title">${step === 1 ? 'Discuss in class' : 'Effects of the floods'}</h3>${list}</div>` });
  }
}
