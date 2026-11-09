/**
 * MissingIngredientScene - blk-l06-s04b. The village as found, with three dashed outlines for what was not found.
 * Beat 0 the store and the open question of power. Beat 1 palace and royal tomb: not found. Beat 2 copper comes,
 * the city outline stays empty. Beat 3 the question stays open. An empty slot never fills: that is the point.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { at, text, hutArt, potArt, groundStrip, COPPER } from '../shared/StoneAgeArt.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const BRICK = 'color-mix(in srgb, var(--sim-strata-3) 60%, var(--sim-gold))';
const READ = ['A store of food: power? We do not know', 'No palace, no royal tomb', 'Copper, and still a village', 'Why no city here?'];
const dash = 'style="fill:none;stroke:var(--sim-label-muted);stroke-width:3.5;stroke-dasharray:8 7;stroke-linejoin:round"';
const palace = `<path d="M-62 40 V-8 H-40 V-30 H-14 V-48 H14 V-30 H40 V-8 H62 V40 Z" ${dash}/>`;
const tomb = `<path d="M-52 40 L0 -44 L52 40 Z" ${dash}/>`;
const city = `<path d="M-70 40 V0 H-46 V-26 H-16 V-6 H6 V-40 H34 V-4 H70 V40 Z" ${dash}/>`;

export class MissingIngredientScene extends SvgScene {
  static simId = 'missing-ingredient-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'A village of houses and storage bins, with graves nearby. Above it are three dashed empty outlines: a palace, a royal tomb and a city. None of them was found at Mehrgarh. Copper is added to the village, and the outlines stay empty.';

  constructor(container, config) { super(container, config); this._fresh = true; }

  css() {
    return `
.mi-pop { animation: mi-pop 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: center; }
@keyframes mi-pop { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: none; } }
`;
  }

  enter() { this._fresh = true; }

  stageHeight(st) { return st.portrait ? 440 : 420; }

  paint(st) {
    const P = st.portrait, step = this.stepIndex, W = st.W, G = P ? 300 : 276, sc = P ? 1 : 1.3, fresh = this._fresh;
    const pop = (on) => (fresh && on ? ' class="mi-pop"' : '');
    let s = groundStrip(0, W, G, st.H - G, 'color-mix(in srgb, var(--sim-strata-1) 70%, var(--sim-strata-2))');
    // three outlines of what was not found
    const slots = [[W * 0.18, 'palace', palace, 1], [W * 0.5, 'royal tomb', tomb, 1], [W * 0.82, 'city', city, 2]];
    for (const [x, name, art, from] of slots) {
      const on = step >= from;
      s += `<g style="opacity:${on ? 1 : 0.14}"${pop(step === from)}>${at(x, P ? 88 : 88, P ? 0.82 : 1.15, art)}${text(x, P ? 150 : 172, name, { size: P ? 17 : 20, weight: 600, display: true, col: 'var(--sim-label-muted)' })}${on ? text(x, P ? 92 : 94, 'not found', { size: P ? 14 : 16, weight: 800, col: 'var(--sim-bad)', halo: 4 }) : ''}</g>`;
    }
    // the village as found
    s += at(W * 0.14, G - 8 * sc, 0.95 * sc, hutArt()) + at(W * 0.36, G - 18 * sc, 0.8 * sc, hutArt());
    let bins = `<rect x="-74" y="-30" width="148" height="56" rx="6" ${fill('color-mix(in srgb, var(--sim-strata-3) 26%, var(--sim-bg-surface))', `stroke:${BRICK};stroke-width:7`)}/>`;
    for (const x of [-37, 0, 37]) bins += `<path d="M${x} -30 V26" ${stroke(BRICK, 6)}/>`;
    s += at(W * 0.62, G + 24 * sc, sc * (P ? 0.72 : 0.8), bins);
    s += at(W * 0.62, G - 12 * sc, 0.5 * sc, potArt());
    s += text(W * 0.62, G + 76 * sc, 'bins', { size: P ? 17 : 20, weight: 600, display: true });
    [0.82, 0.9].forEach((f, i) => { s += `<ellipse cx="${W * f}" cy="${G + 34 + i * 16}" rx="${P ? 22 : 34}" ry="11" ${fill(shade('var(--sim-strata-3)', 60))}/>`; });
    s += text(W * 0.87, G + 88, 'graves', { size: P ? 17 : 20, weight: 600, display: true });
    if (step >= 2) s += `<g${pop(step === 2)}><path d="M${W * 0.2 - 22} ${G + 56} L${W * 0.2} ${G + 44} L${W * 0.2 + 26} ${G + 50} L${W * 0.2 + 18} ${G + 70} L${W * 0.2 - 12} ${G + 74} Z" ${fill(COPPER, `stroke:${shade(COPPER, 60)};stroke-width:3.5;stroke-linejoin:round`)}/>${text(W * 0.2, G + 98, 'copper', { size: P ? 17 : 20, weight: 600, display: true })}</g>`;
    s += text(W / 2, st.H - 10, READ[step], { size: P ? 18 : 23, weight: 600, display: true, col: step === 3 ? 'var(--sim-accent)' : 'var(--sim-label)' });
    this._fresh = false;
    return { svg: s, over: '' };
  }
}
