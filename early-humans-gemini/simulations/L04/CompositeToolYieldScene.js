/**
 * CompositeToolYieldScene - blk-l04-s04, from beat 2 (harvest). Beats 0 and 1 show pictures.
 * harvest: one heap of microliths feeds three tools, each drawn with its blades, each to its food. Chips light one path.
 * boom: a rock shelter filling with people: more food, more people. No numbers, since the book gives none.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { at, text, bladeArt, fishArt, hareArt, earArt, personMark, WOOD, BONE, STONE, GRAIN } from '../shared/StoneAgeArt.js';

const MAP = [0, 0, 0, 1].map((idx) => [{ idx, dwellMs: null }]);
const TOOLS = [
  { id: 'arrow', label: 'arrow', food: 'small game', tone: 2 },
  { id: 'harpoon', label: 'harpoon', food: 'fish', tone: 1 },
  { id: 'sickle', label: 'sickle', food: 'wild grain', tone: 3 },
];
const CHIPS = TOOLS.map((t) => ({ id: t.id, label: t.label, targets: [t.id], tone: t.tone }));

const blades = (n, w, h, dx, r = 0) => Array.from({ length: n }, (_, i) => `<g transform="translate(${i * dx} 0) rotate(${r})">${bladeArt(w, h, STONE, i)}</g>`).join('');

function toolArt(id) {
  if (id === 'arrow') {
    return `<g transform="rotate(-62)"><rect x="-74" y="-4" width="130" height="8" rx="4" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:2.5`)}/>`
      + `<g transform="translate(46 -3)">${blades(3, 14, 18, 13)}</g><g transform="translate(46 3) scale(1 -1)">${blades(3, 14, 18, 13)}</g><path d="M-72 0 L-90 -12 M-72 0 L-90 12 M-62 0 L-80 -12 M-62 0 L-80 12" ${stroke('var(--sim-series-6)', 4)}/></g>`;
  }
  if (id === 'harpoon') {
    return `<g transform="rotate(-62)"><rect x="-78" y="-5" width="150" height="10" rx="5" ${fill(BONE, `stroke:${shade(BONE, 60)};stroke-width:2.5`)}/>`
      + `<path d="M72 -6 L94 0 L72 6 Z" ${fill(STONE)}/><g transform="translate(-6 -4)">${blades(5, 13, 18, 14, 26)}</g></g>`;
  }
  return `<path d="M-40 54 Q-52 16 -18 -14 Q10 -40 46 -36" ${stroke(WOOD, 13)}/><path d="M-40 54 Q-52 16 -18 -14 Q10 -40 46 -36" ${stroke(shade(WOOD, 76), 3)}/>`
    + [[-34, 14, -70], [-24, -2, -50], [-10, -15, -36], [6, -24, -18], [24, -31, -10], [40, -34, 0]].map(([x, y, r], i) => `<g transform="translate(${x + 5} ${y + 10}) rotate(${r + 180})">${bladeArt(15, 19, STONE, i)}</g>`).join('');
}

const FOOD = { arrow: () => hareArt(), harpoon: () => fishArt(), sickle: () => earArt('wheat', GRAIN) };

export class CompositeToolYieldScene extends SvgScene {
  static simId = 'composite-tool-yield-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'One heap of small stone blades feeds three tools: an arrow for small game, a harpoon for fish and a sickle for wild grain. On the next beat a rock shelter fills with more people.';

  tl = tapLight({ label: 'Tools', chips: CHIPS, onChange: () => this.repaint() });

  constructor(container, config) { super(container, config); this._fresh = true; }

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() {
    return `
.cy-pop { animation: cy-pop 0.45s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: center; }
@keyframes cy-pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: none; } }
.svs[data-step="1"] .tl-row { display: none; }
`;
  }

  enter(step) { this._fresh = true; this.tl.set({ lit: null, disabled: step === 1 }); }

  stageHeight(st) { return st.portrait ? 470 : 420; }

  _harvest(st) {
    const P = st.portrait, cols = TOOLS.length, cw = st.W / cols;
    const heapY = P ? 62 : 54, toolY = P ? 212 : 196, foodY = P ? 366 : 338;
    let s = '';
    // the common stock, a low heap of blades
    let heap = '';
    for (let i = 0; i < 15; i += 1) {
      const row = i < 6 ? 0 : i < 11 ? 1 : 2, n = [6, 5, 4][row], idx = i - [0, 6, 11][row];
      heap += at(st.W / 2 + (idx - (n - 1) / 2) * 26, heapY + 18 - row * 16, 1, `<g transform="rotate(${(i * 37) % 30 - 15})">${bladeArt(24, 26, STONE, i)}</g>`);
    }
    s += heap + text(st.W / 2, heapY + 46, 'one stock of microliths', { size: P ? 18 : 20, weight: 600, display: true });
    TOOLS.forEach((t, i) => {
      const x = cw * (i + 0.5), off = this.tl.off(t.id), lit = this.tl.has(t.id), col = `var(--sim-series-${t.tone})`;
      const gfx = P ? 0.8 : 1;
      let g = `<path d="M${st.W / 2 + (i - 1) * 40} ${heapY + 54} Q${x} ${heapY + 58} ${x} ${toolY - 66 * gfx}" ${stroke(col, lit ? 6 : 4)}/>`;
      g += `<path d="M${x - 8} ${toolY - 72 * gfx} L${x} ${toolY - 60 * gfx} L${x + 8} ${toolY - 72 * gfx} Z" ${fill(col)}/>`;
      g += at(x, toolY + 8, gfx, toolArt(t.id));
      g += `<path d="M${x} ${toolY + 76 * gfx} V${foodY - 44}" ${stroke(col, lit ? 6 : 4)}/><path d="M${x - 8} ${foodY - 50} L${x} ${foodY - 38} L${x + 8} ${foodY - 50} Z" ${fill(col)}/>`;
      g += at(x, foodY, P ? 0.72 : 0.8, FOOD[t.id]());
      g += text(x, foodY + 58, t.food, { size: P ? 16 : 18, weight: 600, display: true });
      s += `<g style="opacity:${off ? 0.2 : 1}" class="${this._fresh ? 'cy-pop' : ''}">${g}</g>`;
    });
    return s;
  }

  _boom(st) {
    const P = st.portrait, W = st.W, base = st.H - 50, fresh = this._fresh;
    // an overhang of rock, seen from the front, with a sandy floor
    const rock = 'color-mix(in srgb, var(--sim-strata-3) 62%, var(--sim-gold))';
    let s = `<path d="M-10 ${base} V90 Q${W * 0.2} 22 ${W * 0.5} 26 Q${W * 0.82} 18 ${W + 10} 86 V${base} H${W - 34} V${base - 170} Q${W * 0.5} ${base - 290} 34 ${base - 170} V${base} Z" ${fill(rock, `stroke:${shade(rock, 60)};stroke-width:4`)}/>`;
    s += `<path d="M34 ${base - 170} Q${W * 0.5} ${base - 290} ${W - 34} ${base - 170} V${base} H34 Z" ${fill('color-mix(in srgb, var(--sim-strata-3) 22%, var(--sim-bg-surface))')}/>`;
    s += `<rect x="-10" y="${base - 4}" width="${W + 20}" height="20" rx="4" ${fill('var(--sim-strata-3)')}/>`;
    const n = P ? 18 : 24, perRow = P ? 6 : 8;
    let ppl = '';
    for (let i = 0; i < n; i += 1) {
      const r = Math.floor(i / perRow), c = i % perRow;
      const x = W / 2 + (c - (perRow - 1) / 2) * (P ? 46 : 58) + (r % 2) * 12, y = base - 32 - r * 62;
      const col = ['var(--sim-series-8)', 'var(--sim-series-5)', 'var(--sim-series-1)', 'var(--sim-series-6)'][i % 4];
      ppl += `<g class="${fresh ? 'cy-pop' : ''}" style="--d:${(i * 0.06).toFixed(2)}s">${at(x, y, 0.72, personMark(col))}</g>`;
    }
    s += ppl;
    s += text(W / 2, st.H - 12, 'more food, more people', { size: P ? 20 : 24, weight: 600, display: true });
    return s;
  }

  paint(st) {
    const svg = this.stepIndex === 0 ? this._harvest(st) : this._boom(st);
    this._fresh = false;
    return { svg, over: '' };
  }
}
