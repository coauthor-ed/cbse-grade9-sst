// WindOverWaterScene - wind on the sea. A slider sets the wind; the waves, the bend of the palm and the wind
// streaks follow it. Beat 0: wind builds waves. Beat 1: the same sea with the way the energy goes marked.
// The waves run for a few seconds after a change and then rest. No place is named.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgWaveLine, svgCloud, svgCountryBoat, svgPalm, svgSeaColour as sc, svgSkyGradient } from '../shared/SeaArt.js';
import { frame, seaLabel, ctlBar, anim } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const NAMES = ['Light wind', 'Light wind', 'Breeze', 'Strong wind', 'Very strong wind'];
const RUN = 5;

export class WindOverWaterScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1)];
  static WIDTH = 720;
  static HEIGHT = 430;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 450;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'Wind blows over the sea. With a light wind there are small ripples. With a strong wind the waves are tall, the palm bends and a small boat rides up and down. Wind energy travels on across the ocean.';
  static CONTROLS = [];

  _wind = 3;

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'range', id: 'wind', label: 'Wind', min: 1, max: 5, step: 1, value: 3, read: (v) => NAMES[v - 1], say: (v) => NAMES[v - 1] }], (id, v) => { this._wind = v; this.repaint(); this.play(RUN); });
    this.enter(this.stepIndex);
    this.repaint();
    this.play(RUN);
  }

  css() { return '.svs { padding: 6px; } .ss-range output { min-width: 6.6em; }'; }

  enter() { this._wind = 3; this.ctl?.set('wind', 3); }

  stageHeight(st) { return st.portrait ? 300 : 340; }

  paint(st) {
    const W = st.W, H = st.H, seaY = H * 0.5;
    let body = `<defs>${svgSkyGradient('wv-sky', 0, 10)}</defs><rect width="${W}" height="${seaY + 40}" style="fill:url(#wv-sky)"/>`;
    body += svgCloud(W * 0.3, H * 0.2, 0.6, { seed: 3 }) + svgCloud(W * 0.76, H * 0.14, 0.42, { seed: 8 });
    body += '<g data-anim="sea"></g>';
    return { svg: frame(st, 'wv', body) };
  }

  animate(st, t) {
    const W = st.W, H = st.H, P = st.portrait, seaY = H * 0.5, w = this._wind, amp = [2, 5, 11, 19, 30][w - 1], len = 26 + w * 9, ph = (t + 0.4) * (0.9 + w * 0.22);
    let s = svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 4, t: ph, wave: amp, len });
    s += svgWaveLine(0, seaY, 1, { w: W, amp, len, t: ph, width: 3 + w * 0.5 });
    const bx = W * 0.56, by = seaY + Math.sin(bx / len + ph * 1.1) * amp, rot = Math.cos(bx / len + ph * 1.1) * amp * 0.9;
    s += svgCountryBoat(bx, by + 4, P ? 0.7 : 0.9, { rot });
    // The shore at the side the wind comes from, with a palm that bends.
    s += `<path d="M${-10} ${seaY - 10}Q${W * 0.1} ${seaY - 14} ${W * 0.19} ${seaY + 18}L${W * 0.08} ${H}L-10 ${H}Z" ${fill(sc('sand'))}/>`;
    s += svgPalm(W * 0.07, seaY - 6, P ? 0.85 : 1, { lean: 8 + w * 11, t: ph });
    // Wind streaks, one line per step of wind.
    for (let i = 0; i < w + 1; i++) {
      const y = H * (0.1 + 0.075 * i), x0 = ((t * (60 + w * 26) + i * 151) % (W * 0.55)) + W * 0.22, l = 30 + w * 10;
      s += `<path d="M${x0} ${y}q${l * 0.5} -6 ${l} 0q9 5 2 10" ${stroke(sc('cloud'), 3.6, 'opacity:0.9')}/>`;
    }
    if (this.stepIndex === 1) {
      const y = seaY + (H - seaY) * 0.6;
      s += `<path d="M${W * 0.24} ${y}H${W * 0.88}" ${stroke(sc('sunCore'), 7)}/><path d="M${W * 0.88} ${y - 13}l20 13l-20 13Z" ${fill(sc('sunCore'))}/>`;
      s += seaLabel(W * 0.54, y - 16, 'Energy travels on', { size: P ? 17 : 19, display: true });
    }
    anim(this, 'sea', s);
  }
}
