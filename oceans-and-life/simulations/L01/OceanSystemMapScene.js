// OceanSystemMapScene - a whole sea on one stage, with five areas to light: the sea floor; moving water and
// the Moon; ships and rigs; warning instruments and a cyclone; zones measured from the coast. Beat 0 is the
// world at rest. Beat 1 asks the five questions: each name lights its area and dims the rest.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SEA_COLOR_MAP } from '../shared/SeaArt.js';
import { svgOceanWorld, oceanAnchor } from '../shared/OceanWorld.js';
import { frame, seaLabel } from '../shared/SeaBits.js';

const CHIPS = [
  { id: 'floor', label: 'Sea floor', targets: ['floor'], tone: 3 },
  { id: 'water', label: 'Moving water', targets: ['water'], tone: 5 },
  { id: 'zones', label: 'Zones', targets: ['zones'], tone: 2 },
  { id: 'ships', label: 'Using the sea', targets: ['ships'], tone: 1 },
  { id: 'warn', label: 'Warnings', targets: ['warn'], tone: 6 },
];
const NAMES = { floor: 'The sea floor', water: 'Waves, tides, currents', zones: 'Zones from the coast', ships: 'Ships, rigs, fishing', warn: 'Buoy, satellite, cyclone' };

export class OceanSystemMapScene extends SvgScene {
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static WIDTH = 640;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A cross-section of the sea: a coast with a lighthouse, ships on the water, a Moon, a cyclone, a buoy and a satellite, and the sea floor with its mountains and a trench. Five names light five parts of the picture.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Five big questions', chips: CHIPS, onChange: () => this.repaint() });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() { return '.svs { padding: 6px; }'; }

  enter() { this.tl?.set?.({ lit: null }); }

  stageHeight(st) { return st.portrait ? 340 : 340; }

  paint(st) {
    const W = st.W, H = st.H, lit = this.tl.lit();
    const set = lit.length ? new Set(lit) : null;
    let body = svgOceanWorld(W, H, { lit: set, t: 0.8 });
    if (lit.length) {
      const a = oceanAnchor(W, H, lit[0]), x = Math.max(96, Math.min(W - 96, a.x));
      body += seaLabel(x, a.y, NAMES[lit[0]], { size: 16 });
    }
    return { svg: frame(st, 'osm', body) };
  }
}
