// AtmosphereBlanketScene - the Earth's curved edge seen from space, with its blanket of air. The air can be
// taken away: blue rim, clouds, sea and green land go, bare rock stays. Mounted twice (BEAT_MAPS):
//   3 beats, blk-l01-s01: air on; air off (still, for the Think about it); off, with what we would lose
//   2 beats, L08 close: the Earth with its air both beats, no switch; tiles name each beat's answers
// The chip tells the truth at every press. State comes from the step, never from history.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { mulberry32 } from 'simulations/base/kit/SimLook.js';
import { SKY_COLOR_MAP, svgCloud, svgEarthEdge, svgSun, svgSunGlow, svgSkyColour } from '../shared/SkyArt.js';
import { words, panel, skyFrame, SKY_WHITE } from './AirBits.js';

const S_ON = 0, S_OFF = 1, S_LOST = 2, S_CLOSE1 = 3, S_CLOSE2 = 4;
const m = (...a) => a.map((idx) => [{ idx, dwellMs: null }]);
const MAP_S01 = m(S_ON, S_OFF, S_LOST), MAP_L08 = m(S_CLOSE1, S_CLOSE2);
const LOSSES = ['Air to breathe', 'Warmth', 'A shield', 'Weather'];
const ANSWERS = { [S_CLOSE1]: ['Nitrogen and oxygen', 'Five layers'], [S_CLOSE2]: ['Winds that reverse', 'A smaller footprint'] };
const FADE = 1.1;

export class AtmosphereBlanketScene extends SvgScene {
  static BEAT_STEP_MAP = MAP_S01;
  static BEAT_MAPS = { 3: MAP_S01, 2: MAP_L08 };
  static WIDTH = 560;
  static HEIGHT = 430;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'The curved edge of the Earth seen from space, with white clouds, blue sea and land under a thin blue rim of air. A chip takes the atmosphere away: the blue rim, clouds, sea and green go, and bare rock is left under black space.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Atmosphere', chips: [{ id: 'off', label: 'No atmosphere', targets: ['off'], tone: 6 }], onChange: () => { this._change(); } });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
    this.repaint();
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() {
    return `.svs { padding: 6px; }
.bl-gone { opacity: 0; }
.bl-out { animation: bl-out ${FADE}s ease both; }
.bl-in { animation: bl-in ${FADE}s ease both; }
@keyframes bl-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes bl-in { from { opacity: 0; } to { opacity: 1; } }
.bl-tile { animation: bl-tile 0.4s var(--look-spring) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: center; }
@keyframes bl-tile { from { opacity: 0; transform: scale(0.7); } }`;
  }

  enter(step) {
    this._air = !(step === S_OFF || step === S_LOST);
    this._was = this._air;
    if (!this.tl?.set) return;
    this.tl.set({ lit: this._air ? null : 'off' });
    if (step === S_OFF) this._was = true;           // arrive by watching it go
    const row = this.root?.querySelector?.('.tl-row');
    if (row) row.style.display = ANSWERS[step] ? 'none' : '';
    this.relayout?.();
  }

  _change() {
    this._was = this._air;
    this._air = !this.tl.has('off');
    this.repaint();
  }

  stageHeight(st) { return st.portrait ? 330 : 350; }

  _stars(st) {
    const r = mulberry32(7);
    let d = '';
    for (let i = 0; i < 46; i += 1) d += `M${(r() * st.W).toFixed(1)} ${(r() * st.H * 0.42).toFixed(1)}h0.01`;
    return `<path d="${d}" ${stroke(SKY_WHITE, 2.2)}/>`;
  }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, top = H * 0.46, R = P ? 620 : 980;
    const air = this._air, was = this._was;
    const cls = air === was ? (air ? '' : 'bl-gone') : air ? 'bl-in' : 'bl-out';
    const clsRock = air === was ? (air ? 'bl-gone' : '') : air ? 'bl-out' : 'bl-in';
    this._was = air;
    const edge = (x) => top + R - Math.sqrt(R * R - (x - W / 2) ** 2);
    const rockPts = [];
    for (let x = -6; x <= W + 6; x += 10) rockPts.push(`${x} ${edge(x).toFixed(1)}`);
    const rock = `<path d="M${rockPts.join('L')}L${W + 6} ${H + 6}L-6 ${H + 6}Z" ${fill(svgSkyColour('rockDark'))}/>`
      + [[0.2, 0.74, 70, 20], [0.55, 0.62, 46, 12], [0.78, 0.82, 60, 18], [0.38, 0.9, 34, 10]].map(([a, b, rx, ry]) => `<ellipse cx="${W * a}" cy="${H * b}" rx="${rx}" ry="${ry}" ${fill(svgSkyColour('rock'), 'opacity:0.7')}/>`).join('');
    let clouds = '';
    const n = P ? 6 : 9;
    for (let i = 0; i < n; i += 1) { const x = (i + 0.5) * W / n; clouds += svgCloud(x, edge(x) + 8, P ? 0.46 : 0.56, { seed: 3 + i * 2 }); }
    for (const [a, b, q] of [[0.24, 0.66, 0.8], [0.7, 0.72, 0.9], [0.46, 0.86, 1.1], [0.9, 0.9, 0.8], [0.1, 0.94, 0.9]]) clouds += svgCloud(W * a, H * b, q, { seed: 5, kind: 'flat', alpha: 0.86 });
    const earth = svgEarthEdge(W / 2, top, 1, { w: W + 40, h: H - top + 10, R, seed: 8 });
    const sunx = P ? 62 : 96, suny = 58;
    let body = `<defs>${svgSunGlow('bl-glow')}</defs>${this._stars(st)}<circle cx="${sunx}" cy="${suny}" r="74" style="fill:url(#bl-glow)"/>${svgSun(sunx, suny, 0.58)}`
      + `<g class="${clsRock}">${rock}</g><g class="${cls}">${earth}${clouds}</g>`;
    const step = this.stepIndex;
    if (air) {
      const lx = W * (P ? 0.66 : 0.68), ly = top - 62;
      body += `<g class="${cls}"><path d="M${lx} ${ly + 14}L${lx - 10} ${edge(lx - 10) - 12}" ${stroke(SKY_WHITE, 3)}/>${words(lx, ly, 'atmosphere', { anchor: 'middle', size: 19, display: true, ink: SKY_WHITE })}</g>`;
    } else {
      body += `<g class="${clsRock}">${words(W / 2, top - 44, 'No air', { anchor: 'middle', size: 24, display: true, ink: SKY_WHITE })}</g>`;
    }
    const tiles = step === S_LOST ? LOSSES : ANSWERS[step];
    if (tiles) {
      const cols = 2, gap = 8, x0 = 12, tw = (W - x0 * 2 - gap) / cols, th = 44, rows = Math.ceil(tiles.length / cols), y0 = H - rows * th - (rows - 1) * gap - 16;
      tiles.forEach((t, i) => {
        const x = x0 + (i % cols) * (tw + gap), y = y0 + Math.floor(i / cols) * (th + gap);
        body += `<g class="bl-tile" style="--d:${(0.1 + i * 0.12).toFixed(2)}s">${panel(x, y, tw, th, { r: 12 })}${words(x + tw / 2, y + 28, t, { anchor: 'middle', size: P ? 15 : 18, display: true, ink: 'var(--sim-label)' })}</g>`;
      });
    }
    return { svg: skyFrame(st, 'bl', 62, 120, body) };
  }
}
