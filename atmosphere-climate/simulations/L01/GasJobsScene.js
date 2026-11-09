// GasJobsScene - one sky, one patch of ground, five gases at work. Every job is a small drawn case:
// nitrogen to soil bacteria to roots; oxygen in and carbon dioxide out of a person; carbon dioxide into a
// leaf; water vapour to a rain cloud; ozone stopping ultraviolet high above. Each beat lights the gases
// its sentence names; a chip locks one gas. Lit means full colour, the rest dim.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SKY_COLOR_MAP, svgCloud, svgSun, svgRain, svgHills, svgSkyColour as sc } from '../shared/SkyArt.js';
import { col, words, skyFrame, SKY_INK, VAPOUR_TONE, OZONE_TONE } from './AirBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'nitrogen', label: 'Nitrogen', targets: ['nitrogen'], tone: 1 },
  { id: 'oxygen', label: 'Oxygen', targets: ['oxygen', 'person'], tone: 2 },
  { id: 'co2', label: 'Carbon dioxide', targets: ['co2', 'person', 'plant'], tone: 6 },
  { id: 'vapour', label: 'Water vapour', targets: ['vapour'], tone: VAPOUR_TONE },
  { id: 'ozone', label: 'Ozone', targets: ['ozone'], tone: OZONE_TONE },
];
const PRESET = [['nitrogen', 'plant'], ['oxygen', 'co2', 'person', 'plant'], ['vapour', 'ozone']];

export class GasJobsScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 560;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'A cross-section of soil and sky. Bacteria in root nodules change nitrogen for a plant. A person breathes in oxygen and breathes out carbon dioxide, which a plant takes in. Water vapour rises to a rain cloud. High above, ozone stops ultraviolet rays. Chips light one gas at a time.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Gases', chips: CHIPS, onChange: () => this.repaint() });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() { return '.svs { padding: 6px; }'; }

  enter() { this.tl.reset(); }

  stageHeight(st) { return st.portrait ? 350 : 316; }

  _off(t) { return this.tl.any() ? this.tl.off(t) : !PRESET[this.stepIndex].includes(t); }

  _g(t, body) { return `<g style="opacity:${this._off(t) ? 0.3 : 1}">${body}</g>`; }

  _flow(d, tone, w = 6) {
    return `<path d="${d}" ${stroke(col(tone), w, 'stroke-dasharray:1 12')}/>`;
  }

  _arrow(x, y, ang, tone) {
    return `<path d="M0 -8L14 0L0 8Z" transform="translate(${x} ${y}) rotate(${ang})" ${fill(col(tone))}/>`;
  }

  _person(x, y, s) {
    const skin = sc('sand'), cloth = sc('seaMid'), hair = sc('ink');
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-13" y="-38" width="10" height="38" rx="5" ${fill(sc('woodDark'))}/><rect x="3" y="-38" width="10" height="38" rx="5" ${fill(sc('woodDark'))}/>
      <rect x="-18" y="-86" width="36" height="52" rx="14" ${fill(cloth)}/>
      <rect x="-26" y="-84" width="10" height="42" rx="5" ${fill(cloth)}/><rect x="12" y="-84" width="10" height="44" rx="5" ${fill(cloth)}/>
      <circle cx="0" cy="-104" r="17" ${fill(skin)}/><path d="M-17 -106Q-14 -124 2 -122Q15 -122 17 -110Q6 -116 -4 -114Q-12 -112 -17 -106Z" ${fill(hair)}/>
      <circle cx="8" cy="-105" r="2" ${fill(hair)}/><path d="M16 -102l5 3l-6 2Z" ${fill(skin)}/></g>`;
  }

  _plant(x, y, s) {
    const stem = sc('grassDark'), leaf = sc('grass'), lit = sc('grassLit'), root = sc('woodLit');
    const lf = (a, l) => `<path d="M0 0Q${l * 0.4} ${-l * 0.32} ${l} 0Q${l * 0.4} ${l * 0.32} 0 0Z" transform="rotate(${a})" ${fill(leaf, `stroke:${stem};stroke-width:2`)}/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 0V-104" ${stroke(stem, 7)}/>
      <g transform="translate(0 -32)">${lf(-22, 46)}${lf(202, 46)}</g><g transform="translate(0 -66)">${lf(-30, 42)}${lf(210, 42)}</g><g transform="translate(0 -96)">${lf(-62, 30)}${lf(242, 30)}</g>
      <path d="M0 0C-4 16 -30 18 -36 42M0 0C2 20 4 34 2 52M0 0C6 16 26 20 34 40" ${stroke(root, 5)}/>
      ${[[-36, 42], [2, 52], [34, 40], [-20, 24], [20, 24]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="7" ${fill(lit, `stroke:${stem};stroke-width:2`)}/>`).join('')}</g>`;
  }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, gy = H * 0.76, px = W * (P ? 0.17 : 0.2), lx = W * (P ? 0.68 : 0.54), ps = 1.12, ls = P ? 1.04 : 1.2;
    const body = [];
    body.push(svgHills(-8, gy - 2, 1, { w: W + 16, h: 84, far: true, seed: 5, peaks: 3 }));
    // ground: soil in section
    body.push(`<rect x="0" y="${gy - 8}" width="${W}" height="16" ${fill(sc('grass'))}/><rect x="0" y="${gy + 6}" width="${W}" height="${H - gy}" ${fill(sc('soil'))}/><rect x="0" y="${gy + 46}" width="${W}" height="${H - gy}" ${fill(sc('soilDark'))}/><path d="M${W * 0.84} ${gy - 8}Q${W * 0.9} ${gy + 26} ${W + 4} ${gy + 22}V${gy - 8}Z" ${fill(sc('sea'))}/>`);
    if (!P) body.push(svgSun(W - 44, 96, 0.42));
    // ozone
    let uv = '';
    [0.16, 0.34, 0.52, 0.7].forEach((u) => { const x = W * u; uv += `<path d="M${x + 8} -2L${x} 12L${x + 8} 18L${x} 34" ${stroke(col(5), 4.5)}/>`; });
    body.push(this._g('ozone', `<rect x="0" y="34" width="${W}" height="20" ${fill(col(OZONE_TONE), 'opacity:0.75')}/>${uv}${words(W * 0.86, 49, 'ozone', { anchor: 'middle', size: 15, ink: 'var(--sim-ink-on-4, var(--sim-bg-deep))' })}`));
    // vapour
    const cx = W * (P ? 0.72 : 0.8);
    body.push(this._g('vapour', `${this._flow(`M${W * 0.97} ${gy - 8}C${W * 0.9} ${gy - 60} ${cx + 30} ${gy - 90} ${cx + 8} 124`, VAPOUR_TONE)}${svgCloud(cx, 118, P ? 0.72 : 0.8, { seed: 6, kind: 'rain' })}${svgRain(cx - 8, 124, 1, { w: 74, h: 58, t: 0.3 })}`));
    // person
    const mx = px + 18, my = gy - 8 - 118 * ps;
    body.push(this._g('person', this._person(px, gy - 6, ps)));
    body.push(this._g('oxygen', `${this._flow(`M${mx + 56} ${my - 46}Q${mx + 26} ${my - 34} ${mx + 10} ${my - 6}`, 2)}${this._arrow(mx + 12, my - 8, 120, 2)}${words(mx + 12, my - 56, 'oxygen in', { size: 15, ink: SKY_INK })}`));
    const ly = gy - 8 - 110 * ls;
    body.push(this._g('co2', `${this._flow(`M${mx + 12} ${my + 8}Q${(mx + lx) / 2} ${my + 34} ${lx - 34} ${ly + 22}`, 6)}${this._arrow(lx - 32, ly + 22, -24, 6)}${words((mx + lx) / 2 + 6, my - 2, 'carbon dioxide', { anchor: 'middle', size: 15, ink: SKY_INK })}`));
    body.push(this._g('plant', this._plant(lx, gy - 6, ls)));
    // nitrogen
    let dots = '';
    [[-30, 18], [10, 30], [30, 14], [-48, 34], [46, 36]].forEach(([a, b]) => { dots += `<circle cx="${lx + a}" cy="${gy + b}" r="3.4" ${fill(col(8))}/>`; });
    const nx = lx - (P ? 100 : 124);
    body.push(this._g('nitrogen', `${this._flow(`M${nx} ${gy - 66}Q${nx - 6} ${gy - 30} ${nx + 4} ${gy + 16}Q${nx + 24} ${gy + 36} ${lx - 44} ${gy + 34}`, 1)}${dots}${words(nx, gy - 72, 'nitrogen', { size: 15, ink: SKY_INK, anchor: 'middle' })}${words(14, H - 12, 'bacteria at the roots', { size: 15, ink: sc('cloud') })}`));
    return { svg: skyFrame(st, 'gj', 0, 12, body.join('')) };
  }
}
