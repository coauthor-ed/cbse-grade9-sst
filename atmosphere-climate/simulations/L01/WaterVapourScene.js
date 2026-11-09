// WaterVapourScene - air over sea and land. Three beats, three looks at one sky:
//   beat 0  Dry day or Wet day: the vapour reading moves between 0.1 and 0.4 per cent, and so do the rising wisps
//   beat 1  vapour rises off the water, cools, and turns into a cloud that rains
//   beat 2  dust specks in the air, with drops forming on them in a lens
// Vapour is drawn as dots in the air (a picture of something invisible), never with a face.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { mulberry32 } from 'simulations/base/kit/SimLook.js';
import { SKY_COLOR_MAP, svgCloud, svgSea, svgLand, svgHills, svgSun, svgRain, svgSkyColour } from '../shared/SkyArt.js';
import { col, words, panel, skyFrame, SKY_INK, VAPOUR_TONE } from './AirBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const DAYS = [{ id: 'dry', label: 'Dry day', targets: ['dry'], tone: 2 }, { id: 'wet', label: 'Wet day', targets: ['wet'], tone: 1 }];
const VALUE = { dry: 0.1, wet: 0.4 };

export class WaterVapourScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 420;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'Sea and land under a day sky. Dots of water vapour rise from the water. A meter reads between 0.1 and 0.4 per cent. Rising vapour cools into a cloud that rains. Tiny dust specks float in the air.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Choose a day', chips: DAYS, onChange: () => { if (!this.tl.lit().length) this.tl.set({ lit: 'dry' }); this.repaint(); } });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() {
    return `.svs { padding: 6px; }
.wv-up { animation: wv-up 3.2s ease-in-out infinite alternate; animation-delay: var(--d, 0s); }
@keyframes wv-up { from { transform: translateY(8px); } to { transform: translateY(-8px); } }
.wv-flow { animation: wv-flow 1.1s linear 5; }
@keyframes wv-flow { from { stroke-dashoffset: 42; } to { stroke-dashoffset: 0; } }`;
  }

  enter(step) {
    this.tl.set({ chips: step === 0 ? DAYS : [], lit: step === 0 ? 'dry' : null });
  }

  stageHeight(st) { return st.portrait ? 340 : 340; }

  _dots(x0, x1, y0, y1, n, seed, tone, r) {
    const rnd = mulberry32(seed);
    let out = '';
    for (let i = 0; i < n; i += 1) {
      const x = x0 + rnd() * (x1 - x0), y = y1 - rnd() ** 1.5 * (y1 - y0);
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" ${fill(col(tone), 'stroke:var(--sim-bg-surface);stroke-width:1.5')}/>`;
    }
    return out;
  }

  _meter(x, y, w, v) {
    const u = (v - 0.1) / 0.3;
    return panel(x, y, w, 84)
      + words(x + 14, y + 25, 'Water vapour', { size: 15 })
      + words(x + w - 14, y + 30, `${v.toFixed(1)}%`, { anchor: 'end', size: 28, display: true, ink: `var(--sim-series-${VAPOUR_TONE}-ink)` })
      + `<rect x="${x + 14}" y="${y + 46}" width="${w - 28}" height="14" rx="7" ${fill('var(--sim-track)')}/><rect x="${x + 14}" y="${y + 46}" width="${(w - 28) * (0.14 + 0.86 * u)}" height="14" rx="7" ${fill(col(VAPOUR_TONE))}/>`
      + words(x + 14, y + 77, '0.1%', { size: 14, ink: 'var(--sim-label-muted)' }) + words(x + w - 14, y + 77, '0.4%', { size: 14, anchor: 'end', ink: 'var(--sim-label-muted)' });
  }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, sea0 = H * 0.72, mid = W * 0.5, step = this.stepIndex;
    let body = svgSun(W - 56, 56, 0.56) + svgHills(mid - 20, sea0 + 4, 1, { w: W - mid + 30, h: 90, far: true, seed: 5 })
      + svgLand(mid - 14, sea0, 1, { w: W - mid + 18, h: H - sea0, kind: 'field' }) + `<path d="M${mid - 40} ${sea0 + 2}Q${mid - 6} ${sea0 + 20} ${mid + 8} ${H + 2}H${mid - 70}Z" ${fill(svgSkyColour('sand'))}/>` + svgSea(-4, sea0 + 6, 1, { w: mid - 22, h: H - sea0, t: 0 });
    if (step === 0) {
      const day = this.tl.has('wet') ? 'wet' : 'dry', v = VALUE[day], n = day === 'wet' ? 32 : 8;
      body += svgCloud(W * 0.26, 74, day === 'wet' ? 1 : 0.42, { seed: 4 }) + (day === 'wet' ? svgCloud(W * 0.56, 110, 0.7, { seed: 8 }) : '');
      body += this._dots(10, W - 10, 130, sea0 - 6, n, 12, VAPOUR_TONE, 6);
      const mw = P ? W - 40 : 250;
      body += this._meter(P ? 20 : W - mw - 26, P ? 140 : 110, mw, v);
    } else if (step === 1) {
      const cx = W * 0.28, cy = 112;
      body += svgRain(W * 0.64, 122, 1, { w: 150, h: sea0 - 112, seed: 2, heavy: true, t: 0.1 }) + svgCloud(W * 0.64, 124, 1.25, { seed: 6, kind: 'rain' });
      // Vapour leaves the sea, climbs, and slides across into the cloud.
      let path = '';
      [[0.12, 8], [0.26, 0], [0.4, 12]].forEach(([u, d], i) => {
        const x = W * u, y = sea0 + 2;
        path += `<path d="M${x} ${y}C${x + 6} ${y - 90} ${x + 30} ${cy + 60} ${W * 0.52} ${cy - 2}" ${stroke(col(VAPOUR_TONE), 5, 'stroke-dasharray:1 13;opacity:0.95')} class="wv-flow"/>`;
      });
      body += path;
      body += words(cx - 8, sea0 + 42, 'water evaporates', { anchor: 'middle', size: 15, ink: svgSkyColour('cloud') });
      body += words(W * 0.26, 86, 'vapour cools', { anchor: 'middle', size: 15, ink: SKY_INK });
      body += words(W * 0.86, 150, 'rain', { size: 18, ink: SKY_INK, display: true });
    } else {
      body += svgCloud(W * 0.3, 90, 0.9, { seed: 3 });
      body += this._dots(10, W - 10, 110, sea0 - 8, 34, 21, 8, 2.6);
      // A lens: drops of water gathering on dust specks.
      const lx = W * 0.62, ly = H * 0.4, r = P ? 76 : 88, ring = svgSkyColour('brass'), rnd = mulberry32(5);
      let inside = `<circle cx="${lx}" cy="${ly}" r="${r}" ${fill(svgSkyColour('glass'))}/>`;
      [[-34, -22, 21], [26, -30, 15], [-4, 26, 25], [44, 26, 13]].forEach(([dx, dy, q]) => {
        inside += `<circle cx="${lx + dx}" cy="${ly + dy}" r="${q}" ${fill(col(1), 'stroke:var(--sim-bg-surface);stroke-width:2;opacity:0.72')}/><circle cx="${lx + dx + rnd() * 2}" cy="${ly + dy}" r="5" ${fill(col(8), 'stroke:var(--sim-stroke);stroke-width:1.5')}/>`;
      });
      body += inside + `<circle cx="${lx}" cy="${ly}" r="${r}" ${stroke(svgSkyColour('brassDark'), 11)}/><circle cx="${lx}" cy="${ly}" r="${r}" ${stroke(ring, 7)}/>`;
      body += words(lx, ly + r + 32, 'drops on dust specks', { anchor: 'middle', size: 15, ink: SKY_INK });
    }
    return { svg: skyFrame(st, 'wv', 0, 8, body) };
  }
}
