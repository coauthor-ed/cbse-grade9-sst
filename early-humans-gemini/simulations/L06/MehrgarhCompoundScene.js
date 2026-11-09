/**
 * MehrgarhCompoundScene - blk-l06-s03, from beat 3. The village plan, big, with each find placed on it.
 * grain: a wild ear beside a farmed ear. compound: chips light one find, and a card says what it shows and what
 * it does not. Reading all six is the find. together: every clue lit, and the book's statement.
 * The plan is drawn to show the kinds of remains, not as a survey of the real site.
 */
import { SvgScene, fill, stroke, shade, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { at, text, earArt, EARTH, BONE, GRAIN, SOIL } from '../shared/StoneAgeArt.js';

const MAP = [0, 0, 0, 0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const FINDS = {
  rooms: { label: 'rooms', tone: 8, shows: 'people lived here', not: 'how they got food' },
  bins: { label: 'bins', tone: 2, shows: 'they stored food', not: 'where the food came from' },
  grain: { label: 'grain', tone: 3, shows: 'what they ate; farmed kinds', not: 'how much they grew' },
  bones: { label: 'bones', tone: 1, shows: 'which animals, how old', not: 'herding, on bones alone' },
  beads: { label: 'beads', tone: 5, shows: 'contact with other places', not: 'anything about food' },
  graves: { label: 'graves', tone: 6, shows: 'they buried their dead', not: 'anything about food' },
};
const CHIPS = Object.entries(FINDS).map(([id, f]) => ({ id, label: f.label, targets: [id], tone: f.tone }));
const PW = 640, PH = 290;
const SPOT = { rooms: [110, 150], bins: [356, 100], grain: [340, 262], bones: [460, 272], beads: [576, 40], graves: [572, 280] };
const BRICK = 'color-mix(in srgb, var(--sim-strata-3) 60%, var(--sim-gold))';

function wall(x, y, w, h) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" ${fill(BRICK, `stroke:${shade(BRICK, 60)};stroke-width:2.5`)}/>`; }

/** One room or bin block: outer walls and inner cross walls. */
function block(x, y, w, h, cols, rows, t = 9) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" ${fill('color-mix(in srgb, var(--sim-strata-3) 26%, var(--sim-bg-surface))')}/>`;
  s += wall(x, y, w, t) + wall(x, y + h - t, w, t) + wall(x, y, t, h) + wall(x + w - t, y, t, h);
  for (let i = 1; i < cols; i += 1) s += wall(x + (w * i) / cols - t / 2, y, t, h);
  for (let i = 1; i < rows; i += 1) s += wall(x, y + (h * i) / rows - t / 2, w, t);
  return s;
}

const ART = {
  rooms: () => block(26, 30, 170, 110, 2, 2) + block(30, 160, 150, 100, 3, 1),
  bins: () => block(226, 40, 260, 100, 6, 2, 8),
  grain: () => {
    let s = `<ellipse cx="340" cy="212" rx="50" ry="30" ${fill(SOIL, `stroke:${shade(SOIL, 60)};stroke-width:3`)}/>`;
    [[318, 208], [334, 200], [352, 206], [366, 214], [344, 220], [326, 222]].forEach(([x, y], i) => { s += `<ellipse cx="${x}" cy="${y}" rx="8" ry="5" transform="rotate(${i * 30} ${x} ${y})" ${fill(shade(GRAIN, 50))}/>`; });
    return s;
  },
  bones: () => {
    let s = '';
    const col = 'color-mix(in srgb, var(--sim-bg-surface) 82%, var(--sim-gold))', ln = shade('var(--sim-strata-3)', 70);
    [[438, 190, 24], [478, 206, -16], [452, 238, 40]].forEach(([x, y, r]) => { const ends = [[-30, -8], [-30, 8], [30, -8], [30, 8]]; s += `<g transform="translate(${x} ${y}) rotate(${r})">` + ends.map(([a, b]) => `<circle cx="${a}" cy="${b}" r="10" ${fill(col, `stroke:${ln};stroke-width:3`)}/>`).join('') + `<rect x="-30" y="-7" width="60" height="14" ${fill(col)}/><path d="M-30 -7 H30 M-30 7 H30" ${stroke(ln, 3)}/></g>`; });
    return s;
  },
  beads: () => {
    const cols = ['var(--sim-series-1)', 'var(--sim-series-8)', BONE, 'var(--sim-series-1)', 'var(--sim-series-8)'];
    return `<path d="M534 60 Q574 130 618 60" ${stroke('var(--sim-label-muted)', 2.5)}/>` + [[544, 80], [558, 94], [576, 100], [594, 92], [606, 78]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="9" ${fill(cols[i], `stroke:${shade(cols[i], 60)};stroke-width:2.5`)}/>`).join('');
  },
  graves: () => [[536, 180], [594, 190], [556, 240]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="30" ry="15" transform="rotate(-18 ${x} ${y})" ${fill(shade(EARTH, 60), `stroke:${shade(EARTH, 42)};stroke-width:3`)}/>`).join(''),
};

export class MehrgarhCompoundScene extends SvgScene {
  static simId = 'mehrgarh-compound-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static HEIGHT = 560;
  static ARIA_LABEL = 'A plan of the village at Mehrgarh with brick rooms, storage bins, a hearth with charred grain, animal bones, beads and graves. Each find has a card that says what it shows and what it does not show. Together the finds support the statement that the people farmed wheat and barley and raised sheep, goats and cattle.';

  tl = tapLight({ label: 'Finds at Mehrgarh', chips: CHIPS, onChange: (lit, chip) => this._onChip(chip) });

  constructor(container, config) {
    super(container, config);
    this._fresh = true;
    this._seen = new Set();
    this._found = false;
  }

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() {
    return `
.mc-pop { animation: mc-pop 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: center; }
@keyframes mc-pop { from { opacity: 0; transform: scale(0.9) translateY(8px); } to { opacity: 1; transform: none; } }
.svs:not([data-step="1"]) .tl-row { display: none; }
`;
  }

  enter(step) {
    this._fresh = true;
    this._seen = new Set();
    this.tl.set({ lit: step === 0 ? 'grain' : null, disabled: step !== 1 });
  }

  _onChip(chip) {
    if (this.stepIndex === 1 && chip) {
      this._seen.add(chip.id);
      if (this._seen.size === CHIPS.length && !this._found) {
        this._found = true;
        this.celebrate(this.sv.W / 2, this.sv.H - 40);
      }
    }
    this.repaint();
  }

  stageHeight(st) { return this.stepIndex === 0 ? (st.portrait ? 360 : 420) : st.portrait ? 340 : 428; }

  _plan(st, k, y0, litAll) {
    let s = `<rect x="0" y="0" width="${PW}" height="${PH}" rx="16" ${fill('color-mix(in srgb, var(--sim-strata-1) 58%, var(--sim-bg-surface))', `stroke:${shade('var(--sim-strata-2)', 70)};stroke-width:3`)}/>`;
    for (const id of Object.keys(ART)) {
      const lit = this.tl.has(id), off = !litAll && this.tl.any() && !lit;
      s += `<g style="opacity:${off ? 0.22 : 1}">${ART[id]()}</g>`;
    }
    const on = this.tl.chip();
    if (on && !litAll && SPOT[on.id]) s += text(SPOT[on.id][0], SPOT[on.id][1], FINDS[on.id].label, { size: 30, weight: 600, display: true, halo: 6 });
    return `<g transform="translate(${(st.W - PW * k) / 2} ${y0}) scale(${k.toFixed(4)})">${s}</g>`;
  }

  _card(st, y, h) {
    const on = this.tl.chip(), w = st.W - 8, x = 4, P = st.portrait;
    let s = cushionRect(x, y, w, h, 14, 'var(--sim-panel)');
    if (!on) return s + text(st.W / 2, y + h / 2 + 7, `Tap a find: ${this._seen.size} of ${CHIPS.length} read`, { size: 19, weight: 600, display: true });
    const f = FINDS[on.id];
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" ${stroke(`var(--sim-series-${f.tone})`, 3)}/>`;
    if (P) {
      s += text(x + 14, y + 30, `Shows: ${f.shows}`, { anchor: 'start', size: 16, weight: 800 });
      s += text(x + 14, y + 58, `Not: ${f.not}`, { anchor: 'start', size: 16, col: 'var(--sim-bad)', weight: 800 });
    } else {
      s += text(x + 18, y + 34, 'Shows', { anchor: 'start', size: 16, col: 'var(--sim-label-muted)' }) + text(x + 84, y + 34, f.shows, { anchor: 'start', size: 20, weight: 600, display: true });
      s += text(x + 18, y + 66, 'Not', { anchor: 'start', size: 16, col: 'var(--sim-label-muted)' }) + text(x + 84, y + 66, f.not, { anchor: 'start', size: 20, weight: 600, display: true, col: 'var(--sim-bad)' });
    }
    return s;
  }

  _ears(st) {
    const P = st.portrait, W = st.W, cy = P ? 136 : 160, s0 = P ? 1.5 : 2.5, cw = W / 2;
    // wild: grains have fallen from the top of the ear. farmed: the ear is full.
    const a = cw / 2, b = cw + cw / 2, ground = cy + 44 * s0;
    let s = `<rect x="-10" y="${ground - 2}" width="${W + 20}" height="60" ${fill('color-mix(in srgb, var(--sim-strata-1) 60%, var(--sim-bg-surface))')}/>`;
    s += at(a, cy, s0, `<path d="M0 44 C2 20 0 0 0 -10" ${stroke('var(--sim-series-3)', 5)}/><path d="M0 26 Q-20 18 -26 2" ${stroke('var(--sim-series-3)', 4)}/><ellipse cx="-7" cy="-10" rx="6" ry="8" ${fill(GRAIN, `stroke:${shade(GRAIN)};stroke-width:2`)}/><ellipse cx="7" cy="-2" rx="6" ry="8" ${fill(GRAIN, `stroke:${shade(GRAIN)};stroke-width:2`)}/><path d="M0 -10 V-44" ${stroke('var(--sim-series-3)', 3)}/>`);
    [[-46, 8], [-22, 22], [24, 14], [44, 24], [-34, -4]].forEach(([dx, dy], i) => { s += `<ellipse cx="${a + dx}" cy="${ground - 2 - (i === 4 ? 40 : 0) + (i === 4 ? 0 : 0) + dy * 0.2}" rx="9" ry="6" transform="rotate(${i * 40} ${a + dx} ${ground})" ${fill(GRAIN, `stroke:${shade(GRAIN)};stroke-width:2`)}/>`; });
    s += at(b, cy, s0, earArt('wheat', GRAIN));
    s += text(a, ground + 34, 'wild: drops its grains', { size: P ? 16 : 20, weight: 600, display: true });
    s += text(b, ground + 34, 'farmed: keeps them', { size: P ? 16 : 20, weight: 600, display: true });
    s += text(W / 2, 28, 'Charred grain keeps this shape', { size: P ? 18 : 22, weight: 600, display: true });
    return s;
  }

  paint(st) {
    const step = this.stepIndex, P = st.portrait;
    let svg = '';
    if (step === 0) {
      svg = this._ears(st);
    } else if (step === 1) {
      const k = Math.min((st.W - 8) / PW, (P ? 248 : 320) / PH);
      svg = this._plan(st, k, 0, false);
      const y = PH * k + 6;
      svg += this._card(st, y, st.H - y - 6);
    } else {
      const k = Math.min((st.W - 8) / PW, (P ? 190 : 250) / PH);
      svg = this._plan(st, k, 0, true);
      const y = PH * k + 8, h = st.H - y - 6;
      svg += `<g class="${this._fresh ? 'mc-pop' : ''}">${cushionRect(4, y, st.W - 8, h, 14, 'var(--sim-panel)')}<rect x="4" y="${y}" width="${st.W - 8}" height="${h}" rx="14" ${stroke('var(--sim-good)', 3)}/>`
        + text(st.W / 2, y + 34, 'Together they point to farming', { size: P ? 19 : 24, weight: 600, display: true, col: 'var(--sim-good)' })
        + text(st.W / 2, y + (P ? 66 : 72), 'wheat and barley', { size: P ? 17 : 20, weight: 600, display: true })
        + text(st.W / 2, y + (P ? 92 : 104), 'sheep, goats, Indian cattle', { size: P ? 17 : 20, weight: 600, display: true }) + '</g>';
    }
    this._fresh = false;
    return { svg, over: '' };
  }
}
