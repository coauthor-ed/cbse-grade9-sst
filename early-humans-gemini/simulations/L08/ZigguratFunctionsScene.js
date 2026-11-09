/**
 * ZigguratFunctionsScene - blk-l08-s05, mounts at beat 3 of 6 (earlier beats show drawings). A big stepped ziggurat in
 * brick, one shrine on top, one stair, a wall with one gate, and storehouses at its foot. Beat 3 lights the store,
 * beat 4 the shrine, beat 5 opens it up: chips (book's words) light any part. Base chain: SvgScene.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { wallSvg, SOIL, CLAY, SAND, n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'shrine', label: 'Holy place', targets: ['shrine'], tone: 2 },
  { id: 'stair', label: 'Stairway', targets: ['stair'], tone: 5 },
  { id: 'store', label: 'Storehouses', targets: ['store'], tone: 3 },
  { id: 'gate', label: 'One entrance', targets: ['gate'], tone: 6 },
];
const WORDS = { shrine: 'High priests only', stair: 'Up the levels', store: 'Grain and goods', gate: 'Guards the treasury' };
const PRESET = { 3: 'store', 4: 'shrine' };

export class ZigguratFunctionsScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A stepped brick ziggurat with a holy place on top, a stairway up the middle, storehouses at its foot and a wall around it with one entrance. Chips light each part.';

  tl = tapLight({ label: 'Parts of the ziggurat', chips: CHIPS, onChange: () => this.repaint() });
  async setup() { await super.setup(); this.tl.mount(this.root, this); this._preset(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(s) { this._preset(s); }
  _preset(s = this.stepIndex) { this.tl.set({ lit: PRESET[s] ?? null }); }
  stageHeight(st) { return st.portrait ? 400 : 390; }

  paint(st) {
    const W = st.W, H = st.H, cx = W / 2, f = H - 46, base = Math.min(W * 0.76, 520);
    const off = (t) => (this.tl.off(t) ? 'opacity:0.3' : '');
    const tier = (w, h, y, col) => wallSvg(cx - w / 2, y, w, h, col, { rows: Math.round(h / 12), brick: 24 }) + `<rect x="${n(cx - w / 2 - 4)}" y="${n(y - h - 4)}" width="${n(w + 8)}" height="9" rx="3" ${fill(shade(col, 80))}/>`;
    const h1 = 76, h2 = 62, h3 = 50, y2 = f - h1, y3 = y2 - h2, y4 = y3 - h3;
    let svg = `<rect x="0" y="${f}" width="${W}" height="${H - f}" ${fill(SAND)}/>`;
    // Storehouses at the foot, behind the outer wall.
    const shed = (x) => `<rect x="${n(x)}" y="${n(f - 46)}" width="${n(W * 0.15)}" height="46" rx="4" ${fill(CLAY)}/><rect x="${n(x - 4)}" y="${n(f - 54)}" width="${n(W * 0.15 + 8)}" height="10" rx="3" ${fill(shade(CLAY, 72))}/><rect x="${n(x + W * 0.05)}" y="${n(f - 26)}" width="${n(W * 0.05)}" height="26" rx="2" ${fill(shade(CLAY, 50))}/>`;
    svg += `<g style="${off('store')}">${shed(cx - base * 0.5 - W * 0.09)}${shed(cx + base * 0.5 - W * 0.06)}</g>`;
    svg += tier(base * 0.8, h1, f, SOIL) + tier(base * 0.56, h2, y2, 'var(--sim-strata-1)') + tier(base * 0.34, h3, y3, SOIL);
    svg += `<g style="${off('shrine')}"><rect x="${n(cx - 36)}" y="${n(y4 - 40)}" width="72" height="40" rx="6" ${fill('var(--sim-series-1)')}/><rect x="${n(cx - 42)}" y="${n(y4 - 47)}" width="84" height="10" rx="4" ${fill(shade('var(--sim-series-1)', 70))}/><rect x="${n(cx - 8)}" y="${n(y4 - 24)}" width="16" height="24" rx="3" ${fill(shade('var(--sim-series-1)', 50))}/></g>`;
    let steps = '';
    for (let i = 0; i < 15; i++) { const y = f - i * ((f - y4) / 15); steps += `<rect x="${n(cx - 15)}" y="${n(y - 10)}" width="30" height="8" rx="1.5" ${fill(i % 2 ? shade(SAND, 92) : SAND)}/>`; }
    svg += `<g style="${off('stair')}"><rect x="${n(cx - 18)}" y="${n(y4)}" width="36" height="${n(f - y4)}" rx="3" ${fill(shade(SOIL, 62))}/>${steps}</g>`;
    // The front wall with its one gate.
    const wy = H - 8, wh = 38, gw = 44;
    svg += `<g style="${off('gate')}">${wallSvg(10, wy, cx - gw / 2 - 10, wh, CLAY, { rows: 3, brick: 24 })}${wallSvg(cx + gw / 2, wy, W - 10 - cx - gw / 2, wh, CLAY, { rows: 3, brick: 24 })}`
      + `<path d="M${n(cx - gw / 2 - 6)} ${wy}V${wy - wh - 12}H${n(cx + gw / 2 + 6)}V${wy}" ${stroke(shade(CLAY, 62), 9)}/></g>`;
    const lit = this.tl.lit()[0];
    if (lit) svg += `<text class="zg-w" x="${cx}" y="26" text-anchor="middle" font-size="${st.portrait ? 24 : 27}" dominant-baseline="central" ${fill('var(--sim-label)')}>${WORDS[lit]}</text>`;
    return { svg };
  }

  css() { return 'svg .zg-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; }'; }
}
